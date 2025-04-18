import { ethers } from "ethers";
const UNISWAP_V2_ROUTER_ADDRESS = "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24"; // Uniswap V2 Router address
import routerAbi from "../abi/uniswapRouter.json";
const UNISWAP_V2_PAIR = "0x342dEe677FEA9ECAA71A9490B08f9e4ADDEf79D6";
import erc20Abi from "../abi/erc20.json";
import UNISWAP_PAIR_ABI from "../abi/uniswapv2Pair.json";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChainId } from "../config";
import { TokenInfo } from "../type";
const useSwap = (
  chainId:number,
  amount: string,
  signer: any,
  tokenA: TokenInfo,
  tokenB: TokenInfo,
  slippageTolerance =  0.04
) => {
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<string>("");
  const [quoteLoading, setQuoteLoading] = useState(false);

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
      const amountsOut = await uniswapRouter.getAmountsOut(
        inputAmountParsed,
        path
      );
      const outputAmount = ethers.utils.formatUnits(amountsOut[1], tokenB.decimals);
      setQuote(outputAmount.toString()); // Update the quote in state
      return outputAmount;
    } catch (error) {
      console.error("Error getting quote:", error);
      return null;
    } finally {
      setQuoteLoading(false); 
    }
  };

  useEffect(() => {
    if (signer && chainId==ChainId) {
      getQuote(amount);
    }
  }, [amount, signer, tokenA, tokenB,chainId]);

  const swapExactTokensForTokens = async (amount: string) => {
    let approvalToastId: any;
    let swapToastId: any;

    setLoading(true);

    const uniswapRouter = new ethers.Contract(
      UNISWAP_V2_ROUTER_ADDRESS,
      routerAbi,
      signer
    );

    const tokenAContract = new ethers.Contract(
      tokenA.address,
      erc20Abi,
      signer
    );
    const balanceOfBigInt = await tokenAContract.balanceOf(signer.address);
    const balanceOf = ethers.utils.formatUnits(balanceOfBigInt, tokenA.decimals);

    if (parseFloat(balanceOf) < parseFloat(amount)) {
      toast.error("Insufficient balance for this swap.");
      setLoading(false);
      return;
    }

    approvalToastId = toast.loading("Checking allowance...");
    const amountInParsed = ethers.utils.parseUnits(amount, tokenA.decimals);

    const currentAllowance = await tokenAContract.allowance(
      signer.address,
      UNISWAP_V2_ROUTER_ADDRESS
    );

    if (
      Number(currentAllowance.toString()) < Number(amountInParsed.toString())
    ) {
      toast.dismiss(approvalToastId);
      approvalToastId = toast.loading("Approval in progress...");

      try {
        const approvalResponse = await tokenAContract.approve(
          UNISWAP_V2_ROUTER_ADDRESS,
          amountInParsed
        );
        const approvalReceipt = await approvalResponse.wait();

        if (approvalReceipt) {
          toast.success("Approval successful");
        }
      } catch (approvalError) {
        setLoading(false);
        toast.dismiss(approvalToastId);
        return;
      }
    } else {
      toast.dismiss(approvalToastId);
      toast.success("Sufficient allowance found.");
    }
    toast.dismiss(approvalToastId);

    try {
      swapToastId = toast.loading("Swap in progress...");
      const path = [tokenA.address, tokenB.address];
      const amountsOut = await uniswapRouter.getAmountsOut(
        amountInParsed,
        path
      );

      const expectedAmountOut = Number(amountsOut[1]);
      const amountOutMin = expectedAmountOut * (1 - slippageTolerance);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 5;

      const swapTx = await uniswapRouter.swapExactTokensForTokens(
        amountInParsed.toString(),
        amountOutMin.toFixed(),
        path,
        signer.address,
        deadline
      );

      const receipt = await swapTx.wait();
      toast.dismiss(swapToastId);
      toast.success("Swap successful");
    } catch (swapError) {
      console.log(swapError);
      toast.dismiss(swapToastId);
      toast.error("Swap failed: ");
    } finally {
      setLoading(false);
    }
  };

  return { swapExactTokensForTokens, getQuote, loading, quote, quoteLoading };
};

export default useSwap;