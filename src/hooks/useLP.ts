// import { ethers, formatUnits, formatEther, parseUnits } from "ethers";
const { ethers, JsonRpcProvider } = require('ethers');

const UNISWAP_V2_ROUTER_ADDRESS = "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24"; // Uniswap V2 Router address
const UNISWAP_V2_PAIR = "0x342dEe677FEA9ECAA71A9490B08f9e4ADDEf79D6";
import routerAbi from "../abi/uniswapRouter.json";
import erc20Abi from "../abi/erc20.json";
import UNISWAP_PAIR_ABI from "../abi/uniswapv2Pair.json";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatEther as formatEtherViem } from "viem";
import { TokenInfo } from "../type";
import { ChainId } from "../config";

const useLP = (
  chainId: number,
  amount: string,
  signer: any,
  tokenA: TokenInfo,
  tokenB: TokenInfo,
  slippageTolerance = 0.04
) => {
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

  const addLiquidity = async (inputAmount: string) => {
    setLoading(true);
    let approvalToastId;
    let liquidityToastId;
    try {
      const uniswapRouter = new ethers.Contract(
        UNISWAP_V2_ROUTER_ADDRESS,
        routerAbi,
        signer
      );
      const inputAmountParsed = ethers.utils.parseUnits(inputAmount, tokenA.decimals);
      const path = [tokenA.address, tokenB.address];
      const amountsOut = await uniswapRouter.getAmountsOut(
        inputAmountParsed,
        path
      );
      // const amountBParsed = Number(amountsOut[1]);

      

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
      const quoteOutput = quote * Number(inputAmount);
      const amountBParsed = ethers.utils.parseUnits(quoteOutput.toFixed(5), tokenB.decimals);

      const tokenAContract = new ethers.Contract(
        tokenA.address,
        erc20Abi,
        signer
      );
      const tokenBContract = new ethers.Contract(
        tokenB.address,
        erc20Abi,
        signer
      );

      const balanceOfTokenA = await tokenAContract.balanceOf(signer.address);
      const balanceOfTokenB = await tokenBContract.balanceOf(signer.address);

      if (
        parseFloat(balanceOfTokenA) < parseFloat(inputAmountParsed.toString())
      ) {
        toast.error("Insufficient balance A");
        setLoading(false);
        return;
      }

      if (parseFloat(balanceOfTokenB) < parseFloat(amountBParsed.toString())) {
        toast.error("Insufficient balance. B");
        setLoading(false);
        return;
      }

      approvalToastId = toast.loading(`Approving Token ${tokenA.name}`);
      const amountAParsed = ethers.parseUnits(inputAmount, tokenA.decimals);

      const allowanceA = await tokenAContract.allowance(
        signer.address,
        UNISWAP_V2_ROUTER_ADDRESS
      );

      if (Number(allowanceA.toString()) < Number(amountAParsed.toString())) {
        const approvalTxA = await tokenAContract.approve(
          UNISWAP_V2_ROUTER_ADDRESS,
          amountAParsed.toString()
        );
        await approvalTxA.wait();
      }
      toast.dismiss(approvalToastId);

      approvalToastId = toast.loading(`Approving Token ${tokenB.name}`);

      const allowanceB = await tokenBContract.allowance(
        signer.address,
        UNISWAP_V2_ROUTER_ADDRESS
      );

      if (Number(allowanceB.toString()) < Number(amountBParsed.toString())) {
        const approvalTxB = await tokenBContract.approve(
          UNISWAP_V2_ROUTER_ADDRESS,
          amountBParsed.toString()
        );
        await approvalTxB.wait();
      }
      toast.dismiss(approvalToastId);

      const minAmountA =
        Number(amountAParsed.toString()) * (1 - slippageTolerance);
      const minAmountB =
        Number(amountBParsed.toString()) * (1 - slippageTolerance);

      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
      liquidityToastId = toast.loading("Adding Liquidity...");

      const tx = await uniswapRouter.addLiquidity(
        tokenA.address,
        tokenB.address,
        amountAParsed.toString(),
        amountBParsed.toString(),
        minAmountA.toFixed(),
        minAmountB.toFixed(),
        signer.address,
        deadline
      );

      await tx.wait();
      toast.success("Liquidity Added Successfully");
    } catch (error) {
      console.error("Error adding liquidity:", error);
      toast.error("Failed to add liquidity.");
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
      const uniswapRouter = new ethers.Contract(
        UNISWAP_V2_ROUTER_ADDRESS,
        routerAbi,
        signer
      );

      const lpTokenContract = new ethers.Contract(
        UNISWAP_V2_PAIR,
        UNISWAP_PAIR_ABI,
        signer
      );
      const userLPTokens = await lpTokenContract.balanceOf(signer.address);

      const lpTokenAmount =
        (Number(userLPTokens.toString()) * percentToRemove) / 100;

      if (Number(userLPTokens.toString()) < Number(lpTokenAmount.toString())) {
        toast.error("Insufficient LP token balance.");
        setLoading(false);
        return;
      }

      approvalToastId = toast.loading("Approving LP Tokens");

      const allowance = await lpTokenContract.allowance(
        signer.address,
        UNISWAP_V2_ROUTER_ADDRESS
      );
      if (Number(allowance.toString()) < Number(lpTokenAmount.toString())) {
        const approvalTx = await lpTokenContract.approve(
          UNISWAP_V2_ROUTER_ADDRESS,
          lpTokenAmount.toString()
        );
        await approvalTx.wait();
      }

      toast.dismiss(approvalToastId);

      const path = [tokenA.address, tokenB.address];
      const [reserveB, reserveA] = await lpTokenContract.getReserves();
      const totalSupply = await lpTokenContract.totalSupply();
      const minAmountA =
        (Number(lpTokenAmount) / Number(totalSupply.toString())) *
        Number(reserveA.toString()) *
        (1 - slippageTolerance);
      const minAmountB =
        (Number(lpTokenAmount) / Number(totalSupply.toString())) *
        Number(reserveB.toString()) *
        (1 - slippageTolerance);

      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
      removeLiquidityToastId = toast.loading("Removing Liquidity...");
      const tx = await uniswapRouter.removeLiquidity(
        tokenA.address,
        tokenB.address,
        lpTokenAmount.toFixed(),
        minAmountA.toFixed(),
        minAmountB.toFixed(),
        signer.address,
        deadline
      );

      await tx.wait();
      toast.success("Liquidity Removed Successfully");
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

  return {
    getQuote,
    loading,
    quote,
    quoteLoading,
    addLiquidity,
    liquidityInfo,
    removeLiquidity,
    removeLiquidityloading,
  };
};

export default useLP;
