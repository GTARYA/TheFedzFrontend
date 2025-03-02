// import { ethers, formatUnits, formatEther, parseUnits } from "ethers";
const { ethers, JsonRpcProvider } = require('ethers');

const UNISWAP_V2_ROUTER_ADDRESS = "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24"; // Uniswap V2 Router address
const UNISWAP_V2_PAIR = "0x342dEe677FEA9ECAA71A9490B08f9e4ADDEf79D6";
import routerAbi from "../abi/uniswapRouter.json";
import erc20Abi from "../abi/erc20.json";
import UNISWAP_PAIR_ABI from "../abi/uniswapv2Pair.json";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChainId } from "../config";
import { MaxUint256, Percent, Token } from "@uniswap/sdk-core";
import {maxLiquidityForAmounts, nearestUsableTick, encodeSqrtRatioX96, ADDRESS_ZERO, TickMath } from "@uniswap/v3-sdk";
import UniswapStateViewAbi from "../abi/UniswapStateView_abi.json";
import AllowanceTransferAbi from "../abi/AllowanceTransfer_abi.json";
import MockERC20Abi from "../abi/MockERC20_abi.json";
import PoolModifiyLiquidityAbi from "../abi/PoolModifyLiquidityTest_abi.json";

import {
  HookAddress,
  MockFUSDAddress,
  MockUSDTAddress,
  PoolModifyLiquidityTestAddress,
  TimeSlotSystemAddress,
} from "../contractAddressArbitrum";
import { Pool, Position, V4PositionManager } from "@uniswap/v4-sdk";
import { BigNumberish } from "ethers";
import { useAccount, useCall, useReadContract, useSendTransaction, useWriteContract } from "wagmi";
import JSBI from "jsbi";
import next from "next";

const token0 = new Token(42161, MockFUSDAddress, 18, "FUSD", "FUSD");
const token1 = new Token(42161, MockUSDTAddress, 6, "USDT", "USDT");
const TICK_SPACING = 10;
const poolId = Pool.getPoolId(token0, token1, 4000, TICK_SPACING, HookAddress);
const tickLower = nearestUsableTick(TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(100e6, 105e18)), TICK_SPACING);
const tickUpper = nearestUsableTick(TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(105e6, 100e18)), TICK_SPACING);

const V4UseLP = (
  chainId: number,
  amount: string,
  signer: any,
  tokenA: Token,
  tokenB: Token,
  onAmount0QuoteChange?: (amount0: string, amount1: string, liquidity: string) => void,
  onAmount1QuoteChange?: (amount0: string, amount1: string, liquidity: string) => void,
  slippageTolerance = new Percent(4, 100),
) => {
  const {address} = useAccount();
  const account = useAccount();
  const {
    data: writeApprove0Data,
    error: writeApprove0Error,
    isPending: isApprove0Pending,
    writeContract: writeApproveToken0Contract,
  } = useWriteContract();
  const { sendTransaction } = useSendTransaction()

  const loadPool = async () => {
    const stateViewContract = new ethers.Contract(
      '0x76Fd297e2D437cd7f76d50F01AfE6160f86e9990',
      UniswapStateViewAbi,
      signer
    );
    const liquidity = await stateViewContract.getLiquidity(poolId);
    const [sqrtPriceX96, tick] = await stateViewContract.getSlot0(poolId);
    const pool = new Pool(
      token0,
      token1,
      4000,
      10,
      HookAddress,
      sqrtPriceX96,
      liquidity,
      tick
    );
    return pool;
  }
  const updateAmount0 = async (amount: string) => {
    const pool = await loadPool();
    const amountAParsed = ethers.utils.parseUnits(amount, tokenA.decimals);
    const nextPosition = Position.fromAmount0({
      pool,
      amount0: amountAParsed,
      tickLower,
      tickUpper,
      useFullPrecision: false
    });
    onAmount0QuoteChange && onAmount0QuoteChange(nextPosition.amount0.toFixed(), nextPosition.amount1.toFixed(), nextPosition.liquidity.toString());
  }
  const updateAmount1 = async (amount: string) => {
    const pool = await loadPool();
    const amountAParsed = ethers.utils.parseUnits(amount, tokenB.decimals);
    const nextPosition = Position.fromAmount1({
      pool,
      amount1: amountAParsed,
      tickLower,
      tickUpper,
    });
    onAmount1QuoteChange && onAmount1QuoteChange(nextPosition.amount0.toFixed(), nextPosition.amount1.toFixed(), nextPosition.liquidity.toString());
  }
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<string>("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [removeLiquidityloading, setRemoveLiquidityloading] = useState(false);
  const [liquidityInfo, setLiquidityInfo] = useState<any>(null);
  const getQuote = async (inputAmount: string) => {
    setQuoteLoading(true);
    try {
      const uniswapRouter = new ethers.Contract(
        UNISWAP_V2_ROUTER_ADDRESS,
        routerAbi,
        signer
      );

      const inputAmountParsed = ethers.utils.parseUnits(inputAmount, tokenA.decimals);
      const path = [tokenA.address, tokenB.address];

      const uniswapPair = new ethers.Contract(
        UNISWAP_V2_PAIR,
        UNISWAP_PAIR_ABI,
        signer
      );
      const [reserveA, reserveB] = await uniswapPair.getReserves();

      const adjustedReserveA = Number(reserveA.toString()) / 10 ** 18;
      const adjustedReserveB = Number(reserveB.toString()) / 10 ** 6;
      const priceA = adjustedReserveB / adjustedReserveA;
      const priceB = adjustedReserveA / adjustedReserveB;
      let quote = tokenA.decimals === 6 ? priceB : priceA;
      const final = quote * Number(inputAmount)
      setQuote(final.toString());
    } catch (error) {
      console.error("Error getting quote:", error);
      return null;
    } finally {
      setQuoteLoading(false); 
    }
  };

  const addLiquidity = async (liquidity: string) => {
    setLoading(true);
    let approvalToastId;
    let liquidityToastId;
    try {
      const pool = await loadPool();
      const position = new Position({
        pool,
        liquidity,
        tickLower,
        tickUpper,
      });
      const { amount0: amount0Max, amount1: amount1Max } = position.mintAmountsWithSlippage(slippageTolerance)
      const tokenAContract = new ethers.Contract(
        tokenA.address,
        erc20Abi,
        signer
      );
      const balanceOfTokenA = await tokenAContract.balanceOf(address);
      const tokenBContract = new ethers.Contract(
        tokenB.address,
        erc20Abi,
        signer
      );
      const balanceOfTokenB = await tokenBContract.balanceOf(address);
      if (!isGraterThanEquals(balanceOfTokenA, amount0Max)) {
          toast.error("Insufficient balance A");
          setLoading(false);
          return;
      }
      if (!isGraterThanEquals(balanceOfTokenB, amount1Max)) {
        toast.error("Insufficient balance B");
        setLoading(false);
        return;
      }
      await approveToken(tokenA.address, amount0Max.toString(), signer);
      await approveToken(tokenB.address, amount1Max.toString(), signer);

      const { calldata, value } = V4PositionManager.addCallParameters(position, {
        recipient: address as `0x${string}`,
        slippageTolerance,
        deadline: Math.ceil(new Date().getTime()/1000) + 7200,
      });
      await sendTransaction({
        to: PoolModifyLiquidityTestAddress,
        data: calldata as `0x${string}`,
        value: BigInt(value),
      });

      // const result = useCall({
      //   account: address,
      //   data: calldata as `0x${string}`,
      //   to: PoolModifyLiquidityTestAddress,
      // })
      // const uniswapPair = new ethers.Contract(
      //   UNISWAP_V2_PAIR,
      //   UNISWAP_PAIR_ABI,
      //   signer
      // );
      // const [reserveA, reserveB] = await uniswapPair.getReserves();


      // const adjustedReserveA = Number(reserveA.toString()) / 10 ** 18;
      // const adjustedReserveB = Number(reserveB.toString()) / 10 ** 6;
      // const priceA = adjustedReserveB / adjustedReserveA;
      // const priceB = adjustedReserveA / adjustedReserveB;
      // let quote = tokenA.decimals === 6 ? priceB : priceA;
      // const quoteOutput = quote * Number(inputAmount);
      // const amountBParsed = ethers.utils.parseUnits(quoteOutput.toFixed(5), tokenB.decimals);

      // approvalToastId = toast.loading(`Approving Token ${tokenA.name}`);
      // const amountAParsed = ethers.parseUnits(inputAmount, tokenA.decimals);

      // const allowanceA = await tokenAContract.allowance(
      //   signer.address,
      //   UNISWAP_V2_ROUTER_ADDRESS
      // );

      // if (Number(allowanceA.toString()) < Number(amountAParsed.toString())) {
      //   const approvalTxA = await tokenAContract.approve(
      //     UNISWAP_V2_ROUTER_ADDRESS,
      //     amountAParsed.toString()
      //   );
      //   await approvalTxA.wait();
      // }
      // toast.dismiss(approvalToastId);

      // approvalToastId = toast.loading(`Approving Token ${tokenB.name}`);

      // const allowanceB = await tokenBContract.allowance(
      //   signer.address,
      //   UNISWAP_V2_ROUTER_ADDRESS
      // );

      // if (Number(allowanceB.toString()) < Number(amountBParsed.toString())) {
      //   const approvalTxB = await tokenBContract.approve(
      //     UNISWAP_V2_ROUTER_ADDRESS,
      //     amountBParsed.toString()
      //   );
      //   await approvalTxB.wait();
      // }
      // toast.dismiss(approvalToastId);

      // const minAmountA =
      //   Number(amountAParsed.toString()) * (1 - slippageTolerance);
      // const minAmountB =
      //   Number(amountBParsed.toString()) * (1 - slippageTolerance);

      // const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
      // liquidityToastId = toast.loading("Adding Liquidity...");

      // const tx = await uniswapRouter.addLiquidity(
      //   tokenA.address,
      //   tokenB.address,
      //   amountAParsed.toString(),
      //   amountBParsed.toString(),
      //   minAmountA.toFixed(),
      //   minAmountB.toFixed(),
      //   signer.address,
      //   deadline
      // );

      // await tx.wait();
      toast.success("Liquidity Added Successfully");
    } catch (error) {
      console.error("Error adding liquidity:", error);
      toast.error("Failed to add liquidity.");
      throw error;
    } finally {
      if (approvalToastId) toast.dismiss(approvalToastId);
      if (liquidityToastId) toast.dismiss(liquidityToastId);
      setLoading(false);
    }
  };

  const removeLiquidity = async (percentToRemove: number) => {
    setRemoveLiquidityloading(true);
    let approvalToastId;
    let removeLiquidityToastId;
    try {
      // const uniswapRouter = new ethers.Contract(
      //   UNISWAP_V2_ROUTER_ADDRESS,
      //   routerAbi,
      //   signer
      // );

      // const lpTokenContract = new ethers.Contract(
      //   UNISWAP_V2_PAIR,
      //   UNISWAP_PAIR_ABI,
      //   signer
      // );
      // const userLPTokens = await lpTokenContract.balanceOf(signer.address);

      // const lpTokenAmount =
      //   (Number(userLPTokens.toString()) * percentToRemove) / 100;

      // if (Number(userLPTokens.toString()) < Number(lpTokenAmount.toString())) {
      //   toast.error("Insufficient LP token balance.");
      //   setLoading(false);
      //   return;
      // }

      // approvalToastId = toast.loading("Approving LP Tokens");

      // const allowance = await lpTokenContract.allowance(
      //   signer.address,
      //   UNISWAP_V2_ROUTER_ADDRESS
      // );
      // if (Number(allowance.toString()) < Number(lpTokenAmount.toString())) {
      //   const approvalTx = await lpTokenContract.approve(
      //     UNISWAP_V2_ROUTER_ADDRESS,
      //     lpTokenAmount.toString()
      //   );
      //   await approvalTx.wait();
      // }

      // toast.dismiss(approvalToastId);

      // const path = [tokenA.address, tokenB.address];
      // const [reserveB, reserveA] = await lpTokenContract.getReserves();
      // const totalSupply = await lpTokenContract.totalSupply();
      // const minAmountA =
      //   (Number(lpTokenAmount) / Number(totalSupply.toString())) *
      //   Number(reserveA.toString()) *
      //   (1 - slippageTolerance);
      // const minAmountB =
      //   (Number(lpTokenAmount) / Number(totalSupply.toString())) *
      //   Number(reserveB.toString()) *
      //   (1 - slippageTolerance);

      // const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
      // removeLiquidityToastId = toast.loading("Removing Liquidity...");
      // const tx = await uniswapRouter.removeLiquidity(
      //   tokenA.address,
      //   tokenB.address,
      //   lpTokenAmount.toFixed(),
      //   minAmountA.toFixed(),
      //   minAmountB.toFixed(),
      //   signer.address,
      //   deadline
      // );

      // await tx.wait();
      // toast.success("Liquidity Removed Successfully");
    } catch (error) {
      console.error("Error removing liquidity:", error);
      toast.error("Failed to remove liquidity.");
    } finally {
      if (approvalToastId) toast.dismiss(approvalToastId);
      if (removeLiquidityToastId) toast.dismiss(removeLiquidityToastId);
      setRemoveLiquidityloading(false);
    }
  };

  const getLiquidityInfo = async () => {
    try {
      const pairContract = new ethers.Contract(
        UNISWAP_V2_PAIR,
        UNISWAP_PAIR_ABI,
        signer
      );
      const [reserveA, reserveB] = await pairContract.getReserves();
      const totalSupply = await pairContract.totalSupply();
      const userLPBalance = await pairContract.balanceOf(
        await signer.getAddress()
      );
      const reserveANum = Number(reserveA);
      const reserveBNum = Number(reserveB);
      const totalSupplyNum = Number(totalSupply);
      const userLPBalanceNum = Number(userLPBalance);
      const userShare = userLPBalanceNum / totalSupplyNum;
      const userTokenAReserve = (reserveANum * userShare) / 10 ** 18;
      const userTokenBReserve = (reserveBNum * userShare) / 10 ** 6;

      const info = {
        totalSupply: totalSupplyNum.toFixed(4),
        userLPBalance: userLPBalanceNum.toFixed(4),
        userShare: (userShare * 100).toFixed(2),
        totalTokens: (userTokenAReserve + userTokenBReserve).toFixed(3),
        tokenA: {
          totalReserve: reserveANum.toFixed(4),
          userReserve: Number(userTokenAReserve).toFixed(3),
          symbol: tokenA.name,
        },
        tokenB: {
          totalReserve: reserveBNum.toFixed(4),
          userReserve: Number(userTokenBReserve).toFixed(3),
          symbol: tokenB.name,
        },
      };

      setLiquidityInfo(info); // Store the data in state
      return info;
    } catch (error) {
      console.error("Error fetching liquidity info:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (signer && chainId == ChainId) {
      getQuote(amount);
      getLiquidityInfo();
    }
  }, [amount, signer, tokenA, tokenB, chainId]);

  // function onAmount0QuoteChange(value: string) {
  //   setQuoteLoading(true);
  //   setQuote("");
  //   if (value) {
  //     getQuote(value);
  //   }
  // }

  const approveToken = async (tokenAddress: string, amount: string, signer: any) => {
    try {

      console.log({tokenAddress});
      const address = await signer.getAddress();
      const allowanceTransfer = new ethers.Contract(
        PERMIT_2_ADDRESS,
        AllowanceTransferAbi,
        signer
      );
      const [permitAllowance, expiration] = await allowanceTransfer.allowance(
        address, tokenAddress, PoolModifyLiquidityTestAddress
      );
      const tokenContract = new ethers.Contract(
        tokenAddress,
        MockERC20Abi,
        signer
      );
      const decimals = await tokenContract.decimals();
      const amountIn = ethers.utils.parseUnits(amount, decimals);
      console.log({
        tokenAddress, amountIn
      })
      if (amountIn.isZero()) {
        return;
      }
      console.log({decimals});
      // token0, address(positionManager), uint160(20), uint48(block.timestamp + 2 hours)
      console.log({
        amountIn,
      })
      console.log(
        {permitAllowance, expiration}
      );
      let approvalToastId;
      const currentUnixTime = Math.ceil(new Date().getTime()/1000);
      if (permitAllowance < amountIn || expiration < currentUnixTime) {
        approvalToastId = toast.loading(`Approving Token ${tokenA.name}`);
        await writeApproveToken0Contract({
          address: PERMIT_2_ADDRESS,
          abi: AllowanceTransferAbi,
          functionName: "approve",
          args: [
            tokenAddress, PoolModifyLiquidityTestAddress, amountIn, Math.ceil(new Date().getTime()/1000) + 7200
          ],
        });

        // const tx = await allowanceTransfer.approve(tokenAddress, PoolModifyLiquidityTestAddress, amountIn, Math.ceil(new Date().getTime()/1000) + 7200);
      }
      const allowance = await tokenContract.allowance(
        address,
        PERMIT_2_ADDRESS
      );
      console.log({allowance});
      if (allowance < amountIn) {
        const tx = await tokenContract.approve(PERMIT_2_ADDRESS, amountIn);
        console.log({tx});
      }
      console.log({allowance});
      // setIsApproved(true);
    } catch (err) {
      console.log(err);
    }
  };

  return {
    getQuote,
    loading,
    quote,
    quoteLoading,
    addLiquidity,
    liquidityInfo,
    removeLiquidity,
    removeLiquidityloading,
    updateAmount0,
    updateAmount1
  };
};

const PERMIT_2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3';

function isGraterThanEquals(balanceOfToken: any, amountMax: any) {
  const balanceOfTokenString = balanceOfToken.toString();
  const amountMaxString = amountMax.toString();
  return balanceOfTokenString.length > amountMaxString.length 
    || (balanceOfTokenString.length === amountMaxString.length && balanceOfTokenString >= amountMaxString);

}
export default V4UseLP;
