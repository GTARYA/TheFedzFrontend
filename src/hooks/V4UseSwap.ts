import { ethers } from "ethers";
const UNISWAP_V2_ROUTER_ADDRESS = "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24"; // Uniswap V2 Router address
import routerAbi from "../abi/uniswapRouter.json";
const UNISWAP_V2_PAIR = "0x342dEe677FEA9ECAA71A9490B08f9e4ADDEf79D6";
import erc20Abi from "../abi/erc20.json";
import UNISWAP_PAIR_ABI from "../abi/uniswapv2Pair.json";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChainId } from "../config";
import { BigintIsh, CurrencyAmount, Percent, Token, TradeType } from "@uniswap/sdk-core";
import UniswapStateViewAbi from "../abi/UniswapStateView_abi.json";
import { Actions, Pool, Route, Trade, V4Planner } from "@uniswap/v4-sdk";
import {
  HookAddress,
  MockFUSDAddress,
  MockUSDTAddress,
  PoolModifyLiquidityTestAddress,
  TimeSlotSystemAddress,
} from "../contractAddressArbitrum";
import {maxLiquidityForAmounts, encodeSqrtRatioX96, ADDRESS_ZERO, TickMath, nearestUsableTick, SwapQuoter } from "@uniswap/v3-sdk";
import { Tick, TickConstructorArgs, TickDataProvider } from '@uniswap/v3-sdk';
import { useAccount, useSendTransaction, useWriteContract } from "wagmi";
// import UniswapStateViewAbi from "../abi/UniswapStateView_abi.json";
import AllowanceTransferAbi from "../abi/AllowanceTransfer_abi.json";
import MockERC20Abi from "../abi/MockERC20_abi.json";
import { PoolSwapTestAddress } from "../contractAddress";

const FEE = 4000;
const TICK_SPACING = 10;
const token0 = new Token(42161, MockFUSDAddress, 18, "FUSD", "FUSD");
const token1 = new Token(42161, MockUSDTAddress, 6, "USDT", "USDT");
const poolId = Pool.getPoolId(token0, token1, 4000, 10, HookAddress);
const lowerPrice = encodeSqrtRatioX96(100e6, 105e18);
const upperPrice = encodeSqrtRatioX96(105e6, 100e18);
const tickLower = nearestUsableTick(TickMath.getTickAtSqrtRatio(lowerPrice), TICK_SPACING);
const tickUpper0 = nearestUsableTick(TickMath.getTickAtSqrtRatio(upperPrice), TICK_SPACING);
const tickUpper = nearestUsableTick(TickMath.getTickAtSqrtRatio(upperPrice), TICK_SPACING) + TICK_SPACING;

console.log({
  poolId
})
const V4UseSwap = (
  chainId:number,
  amount: string,
  signer: any,
  tokenIn: Token,
  tokenOut: Token,
  slippageTolerance = new Percent(4, 100),
) => {
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<string>("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  console.log({
    tickLower, tickUpper
  });
  const {address} = useAccount();
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
    const tickLow = await stateViewContract.getTickInfo(poolId, tickLower)
    // const tickUp0 = await stateViewContract.getTickInfo(poolId, tickUpper0);
    const tickUp = await stateViewContract.getTickInfo(poolId, tickUpper);
    // console.log(
    //   tickLow.liquidityNet.toString(),
    //   tickUp0.liquidityNet.toString(),
    //   tickUp.liquidityNet.toString()
    // );
    // console.log({liquidity, sqrtPriceX96: sqrtPriceX96.toString(), tick, tickLow, tickUp});
    // console.log([
    //   {
    //     index: tickLower,
    //     ...tickLow
    //   },
    //   {
    //     index: tickUpper0,
    //     ...tickUp0
    //   },
    //   {
    //     index: tickUpper,
    //     ...tickUp
    //   }
    // ]);
    const pool = new Pool(
      token0,
      token1,
      FEE,
      TICK_SPACING,
      HookAddress,
      sqrtPriceX96,
      liquidity,
      tick,
      [
        {
          index: tickLower,
          ...tickLow
        },
        {
          index: tickUpper,
          ...tickUp
        }
      ]
    );
    console.log({pool});
    return pool;
  }
  const updateAmountIn = async (amount: string) => {
    const pool = await loadPool();
    const zeroForOne = true; // TODO fix


    const amountInUnits = ethers.utils.parseUnits(amount, tokenIn.decimals).toString();
    const trade = await Trade.fromRoute(
      new Route([pool], token0, token1),
      CurrencyAmount.fromRawAmount(token0, amountInUnits),
      TradeType.EXACT_INPUT
    )
    console.log({trade});
    console.log(trade.minimumAmountOut(slippageTolerance).toSignificant(6));
    // const tokenPath = trade.swaps[0].route
    setQuote(trade.minimumAmountOut(slippageTolerance).toSignificant(6));
    
    const planner = new V4Planner();
    planner.addTrade(trade);
    // planner.addSettle(token0)
    console.log({
      amountOutMinimum: trade.minimumAmountOut(slippageTolerance).toExact()
    });
    
    const amountOutMinUnits = ethers.utils.parseUnits(trade.minimumAmountOut(slippageTolerance).toExact(), token1.decimals);
    const amountOutMinimum = amountOutMinUnits.toString();
    console.log({amountOutMinUnits})
    const tokenAContract = new ethers.Contract(
      token0.address,
      erc20Abi,
      signer
    );
    const balanceOfTokenA = await tokenAContract.balanceOf(address);

    if (!isGraterThanEquals(balanceOfTokenA, amountInUnits)) {
        toast.error("Insufficient balance A");
        setLoading(false);
        return;
    }

    await approveToken(token0.address, (parseFloat(amount)*3).toString(), signer);

    ///////
    // Working with x1.3
    ///////
    console.log({amountOutMinimum});
    console.log({amount});
    console.log(ethers.utils.parseUnits(amount, token0.decimals).toString());
    console.log('....');
    // planner.addAction(Actions.SWAP_EXACT_IN_SINGLE, [
    //   {
    //     poolKey: pool.poolKey,
    //     zeroForOne: true,
    //     amountIn: ethers.utils.parseUnits(amount, token0.decimals),
    //     amountOutMinimum: BigInt(0),//BigInt(amountOutMinimum) / BigInt(3),
    //     hookData: '0x', // TODO here we need to use hook data
    //   },
    // ]);
    // console.log({
    //   amountInUnits, amountOutMinimum: amountOutMinimum.toString()
    // });
    planner.addAction(Actions.SETTLE_ALL, [
      token0.address, ethers.utils.parseUnits(amount, token0.decimals)
    ]);
    planner.addAction(Actions.TAKE_ALL, [
      token1.address, amountOutMinimum
    ]);
    const callbackData = planner.finalize();
    
    const UNIVERSAL_ROUTER = '0xA51afAFe0263b40EdaEf0Df8781eA9aa03E381a3';
    const universalRouterContract = new ethers.Contract(
      UNIVERSAL_ROUTER,
      routerAbi,
      signer
    );
    console.log({universalRouterContract});
    const deadline = Math.ceil(new Date().getTime()/1000) + 7200;
    console.log({
      callbackData
    });
    console.log(await universalRouterContract.populateTransaction.execute('0x10', [callbackData], deadline));
    await writeApproveToken0Contract({
      address: UNIVERSAL_ROUTER,
      abi: routerAbi,
      functionName: "execute",
      args: [
        '0x10', [callbackData], deadline
      ]
    })
    // await universalRouterContract.execute(callbackData, deadline);
    // planner.addAction(Actions.SETTLE_ALL, [
    //   pool.token0, amountInUnits
    // ]);
    // planner.addAction(Actions.TAKE_ALL, [
    //   pool.token1, amountOutMinimum
    // ]);
    // const calldata = planner.finalize();
    // console.log(planner.actions, planner.params);
    // const { calldata, value } = SwapQuoter.quoteCallParameters(
    //   trade.swaps[0].route,
    //   trade.inputAmount,
    //   trade.tradeType
    // )

  }
  const updateAmountOut = async (amount: string) => {
    console.log({amount});
    const pool = await loadPool();
    const trade = await Trade.fromRoute(
      new Route([pool], token0, token1),
      CurrencyAmount.fromRawAmount(token0, parseInt(ethers.utils.parseUnits(amount, tokenIn.decimals).toString())),
      TradeType.EXACT_INPUT
    )
    console.log({trade});
  }
  const getQuote = async (inputAmount: string) => {
    return;
    setQuoteLoading(true);
    try {
      const pool = await loadPool();
      const trade = await Trade.fromRoute(
        new Route([pool], token0, token1),
        CurrencyAmount.fromRawAmount(token0, parseInt(ethers.utils.parseUnits(inputAmount, tokenIn.decimals).toString())),
        TradeType.EXACT_INPUT
      )
      console.log({trade});
      console.log(ethers.utils.parseUnits(inputAmount, tokenIn.decimals).toString());
      console.log(trade.outputAmount.toSignificant(6));
      const uniswapRouter = new ethers.Contract(
        UNISWAP_V2_ROUTER_ADDRESS,
        routerAbi,
        signer
      );

      const inputAmountParsed = ethers.utils.parseUnits(inputAmount, tokenIn.decimals);
      const path = [tokenIn.address, tokenOut.address];

      const uniswapPair = new ethers.Contract(
        UNISWAP_V2_PAIR,
        UNISWAP_PAIR_ABI,
        signer
      );
      const amountsOut = await uniswapRouter.getAmountsOut(
        inputAmountParsed,
        path
      );
      const outputAmount = ethers.utils.formatUnits(amountsOut[1], tokenOut.decimals);
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
  }, [amount, signer, tokenIn, tokenOut,chainId]);

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
      tokenIn.address,
      erc20Abi,
      signer
    );
    const balanceOfBigInt = await tokenAContract.balanceOf(signer.address);
    const balanceOf = ethers.utils.formatUnits(balanceOfBigInt, tokenIn.decimals);

    if (parseFloat(balanceOf) < parseFloat(amount)) {
      toast.error("Insufficient balance for this swap.");
      setLoading(false);
      return;
    }

    approvalToastId = toast.loading("Checking allowance...");
    const amountInParsed = ethers.utils.parseUnits(amount, tokenIn.decimals);

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
      const path = [tokenIn.address, tokenOut.address];
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

  const PERMIT_2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3';
  const POOL_MANAGER = '0x360E68faCcca8cA495c1B759Fd9EEe466db9FB32';
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
        address, tokenAddress, POOL_MANAGER
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
      console.log(
        {
          permitAllowance
        }
      );
      if (permitAllowance < amountIn || expiration < currentUnixTime) {
        approvalToastId = toast.loading(`Approving Token ${token0.name}`);
        await writeApproveToken0Contract({
          address: PERMIT_2_ADDRESS,
          abi: AllowanceTransferAbi,
          functionName: "approve",
          args: [
            tokenAddress, POOL_MANAGER, amountIn, Math.ceil(new Date().getTime()/1000) + 7200
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

  return { swapExactTokensForTokens, getQuote, loading, quote, quoteLoading, updateAmountIn, updateAmountOut };
};

export default V4UseSwap;

function isGraterThanEquals(balanceOfToken: any, amountMax: any) {
  const balanceOfTokenString = balanceOfToken.toString();
  const amountMaxString = amountMax.toString();
  return balanceOfTokenString.length > amountMaxString.length 
    || (balanceOfTokenString.length === amountMaxString.length && balanceOfTokenString >= amountMaxString);

}