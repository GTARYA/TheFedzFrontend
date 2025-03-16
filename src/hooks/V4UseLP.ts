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
import { BigintIsh, MaxUint256, Percent, Token } from "@uniswap/sdk-core";
import {maxLiquidityForAmounts, nearestUsableTick, encodeSqrtRatioX96, ADDRESS_ZERO, TickMath } from "@uniswap/v3-sdk";
import UniswapStateViewAbi from "../abi/UniswapStateView_abi.json";
import AllowanceTransferAbi from "../abi/AllowanceTransfer_abi.json";
import MockERC20Abi from "../abi/MockERC20_abi.json";
import PoolModifiyLiquidityAbi from "../abi/PoolModifyLiquidityTest_abi.json";
import MockERC721Abi from "../abi/MockERC721_abi.json";
import JSBI from 'jsbi';

import {
  HookAddress,
  MockFUSDAddress,
  MockUSDTAddress,
  PoolModifyLiquidityTestAddress,
  PoolSwapTestAddress,
  TimeSlotSystemAddress,
} from "../contractAddressArbitrum";
import { Pool, Position, RemoveLiquidityOptions, V4PositionManager } from "@uniswap/v4-sdk";
import { BigNumberish } from "ethers";
import { useAccount, useCall, useReadContract, useSendTransaction, useWriteContract } from "wagmi";
import { getPoolId } from "../misc/v4helpers";
import { set } from "mongoose";
import { nextRoundAnnouncedNeeded } from "./fedz";
import { write } from "fs";
import TimeSlotSystemAbi from "../abi/TimeSlotSystem_abi.json";

const token0 = new Token(42161, MockFUSDAddress, 18, "FUSD", "FUSD");
const token1 = new Token(42161, MockUSDTAddress, 6, "USDT", "USDT");
const TICK_SPACING = 10;
const poolId = Pool.getPoolId(token0, token1, 4000, 10, HookAddress);
const lowerPrice = encodeSqrtRatioX96(100e6, 105e18);
const upperPrice = encodeSqrtRatioX96(105e6, 100e18);
const tickLower = nearestUsableTick(TickMath.getTickAtSqrtRatio(lowerPrice), TICK_SPACING);
const tickUpper = nearestUsableTick(TickMath.getTickAtSqrtRatio(upperPrice), TICK_SPACING) + TICK_SPACING;

let fetchLocked = false;
async function fetchPositions(address: string, signer: any) {
  if (fetchLocked) return;
  fetchLocked = true;
  console.log('fetching positions...');
  const positionManagerContract = new ethers.Contract(
    PoolModifyLiquidityTestAddress,
    [...PoolModifiyLiquidityAbi, ...MockERC721Abi],
    signer
  );
  const totalTokens = parseInt((await positionManagerContract.nextTokenId()).toString());
  const lastTokenId = loadScapperLastTokenId();
  let positionId = 0;
  for (let i = lastTokenId; i < totalTokens; i++) {
    try {
      const owner = await positionManagerContract.ownerOf(i);
      if (owner === address) {
        const [positionInfo,] = await positionManagerContract.getPoolAndPositionInfo(i);
        const positionPoolId = Pool.getPoolId(
          new Token(42161, positionInfo.currency0, 18, "FUSD", "FUSD"),
          new Token(42161, positionInfo.currency1, 6, "USDT", "USDT"),
          positionInfo.fee,
          positionInfo.tickSpacing,
          positionInfo.hooks
        );
        if (poolId === positionPoolId) {
          console.log(`Token found ${i}`);
          positionId = i;
          break;
        }
      }
    } catch(e) {
      console.error(e);
    }
    finally {
      storeSrapperLastTokenId(i);
    }
  }
  fetchLocked = false;
  return positionId;
}


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
    data: writeData,
    error: writeError,
    isPending: isPending,
    writeContractAsync: writeContract,
  } = useWriteContract();
  const { sendTransactionAsync: sendTransaction } = useSendTransaction()

  const loadPool = async () => {
    const stateViewContract = new ethers.Contract(
      '0x76Fd297e2D437cd7f76d50F01AfE6160f86e9990',
      UniswapStateViewAbi,
      signer
    );
    const liquidity = await stateViewContract.getLiquidity(poolId);
    const [sqrtPriceX96, tick] = await stateViewContract.getSlot0(poolId);
    console.log({
      token0,
      token1,
      fee: 4000,
      tickSpacing: 10,
      HookAddress,
      sqrtPriceX96,
      liquidity,
      tick
    });
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
    if (await nextRoundAnnouncedNeeded(address as `0x${string}`, signer)) {
      await writeContract({
        address: TimeSlotSystemAddress,
        abi: TimeSlotSystemAbi,
        functionName: 'unlockRound',
        args: []
      });
    }
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

      const tokenId = loadMyPosition() || undefined;
      const callParametersOptions: any = { slippageTolerance, deadline: Math.ceil(new Date().getTime()/1000) + 7200 };
      if (tokenId) {
        callParametersOptions.tokenId = tokenId;
      } else {
        callParametersOptions.recipient = address;
      }
      const { calldata, value } = V4PositionManager.addCallParameters(position, callParametersOptions);

      let nextTokenId = 0;
      if (!tokenId) {
        const positionManagerContract = new ethers.Contract(
          PoolModifyLiquidityTestAddress,
          [...PoolModifiyLiquidityAbi, ...MockERC721Abi],
          signer
        );
        nextTokenId = parseInt((await positionManagerContract.nextTokenId()).toString()) - 1;
        const lastScrapTokenId = loadScapperLastTokenId();
        if (!lastScrapTokenId) {
          storeSrapperLastTokenId(nextTokenId);
        }
      }

      await sendTransaction({
        to: PoolModifyLiquidityTestAddress,
        data: calldata as `0x${string}`,
        value: BigInt(value),
      });
      toast.success("Liquidity Added Successfully");

      if (!tokenId) {
        const newTokenId = await fetchPositions(address as `0x${string}`, signer);
        if (newTokenId) {
          storePositionId(newTokenId);
        }
      }
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

  const burnPosition = async () => {
    try {
      const tokenId = loadMyPosition();
      console.log(`Burning position ${tokenId}...`);
      const actions = '0x0311';
      const params: any[] = [];
      params.push(ethers.utils.defaultAbiCoder.encode(["uint256", "uint24", "uint24", "bytes"], [tokenId, 0, 0, "0x"]));
      params.push(ethers.utils.defaultAbiCoder.encode(["address", "address", "address"], [token0.address, token1.address, address]));
      const callbackData = ethers.utils.defaultAbiCoder.encode(["bytes", "bytes[]"], [actions, params]);
      await writeContract({
        address: PoolModifyLiquidityTestAddress,
        abi: MockERC721Abi,
        functionName: "approve",
        args: [
          '0x360E68faCcca8cA495c1B759Fd9EEe466db9FB32', tokenId
        ],
      });
      await writeContract({
        address: PoolModifyLiquidityTestAddress,
        abi: PoolModifiyLiquidityAbi,
        functionName: "modifyLiquidities",
        args: [
          callbackData, Math.ceil(new Date().getTime()/1000) + 7200
        ],
      });
      deletePositionId();
      setLiquidityInfo(undefined);
    } catch(e: any) {
      throw e;
    } finally {

    }
  }
  const decreasePosition = async (p: number) => {
    try {
      const pool = await loadPool();
      const tokenId = loadMyPosition();
      const deadline = Math.ceil(new Date().getTime()/1000) + 7200;
      const stateViewContract = new ethers.Contract(
        '0x76Fd297e2D437cd7f76d50F01AfE6160f86e9990',
        UniswapStateViewAbi,
        signer
      );
      const [liquidity,] = await stateViewContract.functions['getPositionInfo(bytes32,address,int24,int24,bytes32)'](poolId, PoolModifyLiquidityTestAddress, tickLower, tickUpper, ethers.utils.defaultAbiCoder.encode(["uint256"], [tokenId]));
      const position = new Position({
        pool,
        liquidity,
        tickLower,
        tickUpper,
      });
      const partialRemoveOptions: RemoveLiquidityOptions = {
        tokenId,
        liquidityPercentage: new Percent(p, 100),
        slippageTolerance,
        deadline,
      }
      const { calldata, value } = V4PositionManager.removeCallParameters(position, partialRemoveOptions);
      await sendTransaction({
        to: PoolModifyLiquidityTestAddress,
        data: calldata as `0x${string}`,
        value: BigInt(value),
      });
    } catch(e: any) {
      throw e;
    } finally {

    }
  }

  const removeLiquidity = async (percentToRemove: number) => {
    setRemoveLiquidityloading(true);
    let approvalToastId;
    let removeLiquidityToastId;
    try {
      console.log(`Removing liquidity... ${percentToRemove}%`);
      const p = Number(percentToRemove);
      console.log({
        p
      })
      if (p === 100) {
        // Burn position
        await burnPosition();
      } else {
        // Decrease position
        await decreasePosition(p);
      }
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
      const tokenId = loadMyPosition();
      if (!tokenId) {
        return;
      }
      const stateViewContract = new ethers.Contract(
        '0x76Fd297e2D437cd7f76d50F01AfE6160f86e9990',
        UniswapStateViewAbi,
        signer
      );
      const [sqrtPriceX96,] = await stateViewContract.getSlot0(poolId);
      const Decimal0 = 18;
      const Decimal1 = 6;
      const [liquidity,] = await stateViewContract.functions['getPositionInfo(bytes32,address,int24,int24,bytes32)'](poolId, PoolModifyLiquidityTestAddress, tickLower, tickUpper, ethers.utils.defaultAbiCoder.encode(["uint256"], [tokenId]));
      const [amount0, amount1] = await getTokenAmounts(parseInt(liquidity.toString()), parseInt(sqrtPriceX96.toString()), tickLower, tickUpper, Decimal0, Decimal1);
      const info = {
        tokenId, amount0, amount1
      };
      setLiquidityInfo(info); // Store the data in state
      return info;
    } catch (error) {
      console.error("Error fetching liquidity info:", error);
      throw error;
    }
  };

  const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));

  function getTickAtSqrtPrice(sqrtPriceX96: number){
    let tick = Math.floor(Math.log((sqrtPriceX96/parseInt(Q96.toString()))**2)/Math.log(1.0001));
    return tick;
  }

  async function getTokenAmounts(liquidity: number, sqrtPriceX96: number, tickLow: number, tickHigh: number, Decimal0: number, Decimal1: number){
    let sqrtRatioA = Math.sqrt(1.0001**tickLow);
    let sqrtRatioB = Math.sqrt(1.0001**tickHigh);
    let currentTick = getTickAtSqrtPrice(sqrtPriceX96);
    let sqrtPrice = sqrtPriceX96 / parseInt(Q96.toString());
    let amount0 = 0;
    let amount1 = 0;
    if(currentTick < tickLow){
      amount0 = Math.floor(liquidity*((sqrtRatioB-sqrtRatioA)/(sqrtRatioA*sqrtRatioB)));
    }
    else if(currentTick >= tickHigh){
      amount1 = Math.floor(liquidity*(sqrtRatioB-sqrtRatioA));
    }
    else if(currentTick >= tickLow && currentTick < tickHigh){
      amount0 = Math.floor(liquidity*((sqrtRatioB-sqrtPrice)/(sqrtPrice*sqrtRatioB)));
      amount1 = Math.floor(liquidity*(sqrtPrice-sqrtRatioA));
    }
    let amount0Human = (amount0/(10**Decimal0)).toFixed(Decimal0);
    let amount1Human = (amount1/(10**Decimal1)).toFixed(Decimal1);
    return [amount0Human, amount1Human]
  }


  useEffect(() => {
    if (signer && chainId == ChainId) {
      getQuote(amount);
      getLiquidityInfo();
    }
  }, [amount, signer, tokenA, tokenB, chainId]);

  const approveToken = async (tokenAddress: string, amount: string, signer: any) => {
    try {
      console.log(`Approving token ${tokenAddress}...`);
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
      if (amountIn.isZero()) {
        console.log("Amount is zero. skipping approval...");
        return;
      }
      let approvalToastId;
      const currentUnixTime = Math.ceil(new Date().getTime()/1000);
      if (permitAllowance < amountIn || expiration < currentUnixTime) {
        console.log(`approval on permit2`);
        approvalToastId = toast.loading(`Approving Token ${tokenA.name}`);
        await writeContract({
          address: PERMIT_2_ADDRESS,
          abi: AllowanceTransferAbi,
          functionName: "approve",
          args: [
            tokenAddress, PoolModifyLiquidityTestAddress, amountIn, Math.ceil(new Date().getTime()/1000) + 7200
          ],
        });
        toast.dismiss(approvalToastId);
      }
      const allowance = await tokenContract.allowance(
        address,
        PERMIT_2_ADDRESS
      );
      if (allowance < amountIn) {
        console.log(`approval on token for permit2`);
        await writeContract({
          address: tokenAddress as `0x${string}`,
          abi: MockERC20Abi,
          functionName: "approve",
          args: [
            PERMIT_2_ADDRESS, amountIn
          ],
        });
      }
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

const HOOK_ADDRESS_KEY = 'hookAddress';

const TOKEN_ID_KEY = `tokenId`;

const storePositionId = (tokenId: number) => {
  const previousTokenId = loadMyPosition();
  if (previousTokenId) {
    console.error('Token Id already exists');
    return previousTokenId;
  }
  localStorage.setItem(TOKEN_ID_KEY, JSON.stringify(tokenId));
  return previousTokenId;
}
const deletePositionId = () => {
  const tokenId = loadMyPosition();
  localStorage.removeItem(TOKEN_ID_KEY);
  return tokenId;
}
const LAST_SCRAP_TOKEN_ID_KEY = "scraperLastTokenId";
const storeSrapperLastTokenId = (tokenId: number) => {
  localStorage.setItem(LAST_SCRAP_TOKEN_ID_KEY, tokenId.toString());
}
const loadScapperLastTokenId = () => {
  return parseInt(localStorage.getItem(LAST_SCRAP_TOKEN_ID_KEY) || '0');
}
const loadMyPosition = () => {
  const cachedHookAddress = localStorage.getItem(HOOK_ADDRESS_KEY) || '0x00';
  if (cachedHookAddress !== HookAddress) {
    localStorage.clear();
    localStorage.setItem(HOOK_ADDRESS_KEY, HookAddress);
  }
  return JSON.parse(localStorage.getItem(TOKEN_ID_KEY) || '0');
}
export default V4UseLP;
