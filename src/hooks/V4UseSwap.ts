import { ethers } from "ethers";
import routerAbi from "../abi/uniswapRouter.json";
import erc20Abi from "../abi/erc20.json";
import { useState } from "react";
import { toast } from "sonner";
import { CurrencyAmount, Percent, Token, TradeType } from "@uniswap/sdk-core";
import UniswapStateViewAbi from "../abi/UniswapStateView_abi.json";
import { Actions, Pool, Route, Trade, V4Planner } from "@uniswap/v4-sdk";
import { web3Provider } from "../utils/provider";
import { StepStatus } from "../type";
import {
  HookAddress,
  MockFUSDAddress,
  MockUSDTAddress,
  PoolSwapTestAddress,
  TimeSlotSystemAddress,
} from "../contractAddressArbitrum";
import {
  encodeSqrtRatioX96,
  TickMath,
  nearestUsableTick,
} from "@uniswap/v3-sdk";
import { useAccount, useWriteContract } from "wagmi";
import AllowanceTransferAbi from "../abi/AllowanceTransfer_abi.json";
import MockERC20Abi from "../abi/MockERC20_abi.json";
import { nextRoundAnnouncedNeeded } from "./fedz";
import TimeSlotSystemAbi from "../abi/TimeSlotSystem_abi.json";

const FEE = 4000;
const TICK_SPACING = 10;
const token0 = new Token(42161, MockFUSDAddress, 18, "FUSD", "FUSD");
const token1 = new Token(42161, MockUSDTAddress, 6, "USDT", "USDT");
const poolId = Pool.getPoolId(token0, token1, 4000, 10, HookAddress);
const lowerPrice = encodeSqrtRatioX96(100e6, 105e18);
const upperPrice = encodeSqrtRatioX96(105e6, 100e18);
const tickLower = nearestUsableTick(
  TickMath.getTickAtSqrtRatio(lowerPrice),
  TICK_SPACING
);
const tickUpper =
  nearestUsableTick(TickMath.getTickAtSqrtRatio(upperPrice), TICK_SPACING) +
  TICK_SPACING;

const loadPoolBySigner = async (signer: any) => {
  const stateViewContract = new ethers.Contract(
    "0x76Fd297e2D437cd7f76d50F01AfE6160f86e9990",
    UniswapStateViewAbi,
    signer
  );

  const liquidity = await stateViewContract.getLiquidity(poolId);
  const [sqrtPriceX96, tick] = await stateViewContract.getSlot0(poolId);

  // const tickLow = await stateViewContract.getTickInfo(poolId, tickLower)
  // const tickUp = await stateViewContract.getTickInfo(poolId, tickUpper);
  // const tickUpper1 = -276840;
  // const tickUp1 = await stateViewContract.getTickInfo(poolId, tickUpper1);

  const tickUpper1 = -276840;
  const [tickLow, tickUp, tickUp1] = await Promise.all([
    stateViewContract.getTickInfo(poolId, tickLower),
    stateViewContract.getTickInfo(poolId, tickUpper),
    stateViewContract.getTickInfo(poolId, tickUpper1),
  ]);

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
        index: tickUpper1,
        ...tickUp1,
      },
      {
        index: tickLower,
        ...tickLow,
      },
      {
        index: tickUpper,
        ...tickUp,
      },
    ]
  );
  return pool;
};
const V4UseSwap = (
  chainId: number,
  amount: string,
  signer: any,
  token0: Token,
  token1: Token,
  slippageTolerance = new Percent(4, 100)
) => {
  console.log({
    version: "0.0.2",
    test: true,
  });
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<string>("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  //modal
  const [approvalStatus, setApprovalStatus] = useState<StepStatus>("idle");
  const [permitStatus, setPermitStatus] = useState<StepStatus>("idle");
  const [swapStatus, setSwapStatus] = useState<StepStatus>("idle");
  const [modalOpen, setModalOpen] = useState(false);

  const { address } = useAccount();
  const {
    data: writeData,
    error: writeError,
    isPending: isPending,
    writeContractAsync: writeToContract,
  } = useWriteContract();

  const loadPool = async () => {
    return await loadPoolBySigner(web3Provider);
  };

  const RESET_MODAL = () => {
    setPermitStatus("idle");
    setApprovalStatus("idle");
    setSwapStatus("idle");
  };

  const test = () => {
    console.log("sasas");
  };

  const updateAmountIn = async (
    amount: string,
    zeroForOne: boolean = true,
    signerJson: any
  ) => {
    setQuoteLoading(true);
    console.log("loading....");

    const pool = await loadPool();
    const tokenIn = zeroForOne ? token0 : token1;
    const tokenOut = zeroForOne ? token1 : token0;
    const amountInUnits = ethers.utils
      .parseUnits(amount, tokenIn.decimals)
      .toString();
    const trade = await Trade.fromRoute(
      new Route([pool], tokenIn, tokenOut),
      CurrencyAmount.fromRawAmount(tokenIn, amountInUnits),
      TradeType.EXACT_INPUT
    );

    setQuoteLoading(false);
    setQuote(
      trade
        .minimumAmountOut(new Percent(0, 100))
        .toSignificant(tokenOut.decimals)
    );

      return async (signerParam: any) => {

      if(!signerParam) return toast.error("No signer found!")

      // RESET STATES
      RESET_MODAL();
      setLoading(true);

      try {
        // 🔓 Unlock round if needed
        if (await nextRoundAnnouncedNeeded(signerParam)) {
          let unlockToastId = toast.loading("Unlocking round...");
          await writeToContract({
            address: TimeSlotSystemAddress,
            abi: TimeSlotSystemAbi,
            functionName: "unlockRound",
            args: [],
          });
          toast.dismiss(unlockToastId);
        }

        // ✅ Check balance
        const amountInUnits = ethers.utils.parseUnits(amount, tokenIn.decimals);
        const amountOutMinUnits = ethers.utils.parseUnits(
          trade.minimumAmountOut(slippageTolerance).toExact(),
          tokenOut.decimals
        );

        const tokenAContract = new ethers.Contract(
          tokenIn.address,
          erc20Abi,
          signerParam
        );
        const balanceOfTokenA = await tokenAContract.balanceOf(address);
        if (
          isGraterThanEquals(
            amountInUnits.toString(),
            balanceOfTokenA.toString()
          )
        ) {
          toast.error("Insufficient balance");
          setLoading(false)
          return;
        }

        // ✅ Approvals (this updates permitStatus + approvalStatus)
        const isApprove = await approveToken(tokenIn.address, amount, signerParam);
        if (!isApprove) return toast.error("Approve failed.");

        // ✅ SWAP
        setSwapStatus("loading");
        const planner = new V4Planner();
        planner.addTrade(trade);
        planner.addAction(Actions.SETTLE_ALL, [tokenIn.address, amountInUnits]);
        planner.addAction(Actions.TAKE_ALL, [
          tokenOut.address,
          amountOutMinUnits,
        ]);

        const callbackData = planner.finalize();
        const deadline = Math.ceil(Date.now() / 1000) + 7200;

        await writeToContract({
          address: UNIVERSAL_ROUTER,
          abi: routerAbi,
          functionName: "execute",
          args: ["0x10", [callbackData], deadline],
        });

        setSwapStatus("done");
        toast.success("Swap successfully completed!");
        setLoading(false);
        setModalOpen(false);
      } catch (err) {
        console.log(err);

        setLoading(false);
        console.error("Swap failed", err);
        toast.error("Swap failed - try again.");
        setSwapStatus("error");
      }
    };

  };

  const updateAmountOut = async (amount: string) => {
    console.log({ amount });
    const pool = await loadPool();
    const trade = await Trade.fromRoute(
      new Route([pool], token0, token1),
      CurrencyAmount.fromRawAmount(
        token0,
        parseInt(ethers.utils.parseUnits(amount, token0.decimals).toString())
      ),
      TradeType.EXACT_INPUT
    );
    console.log({ trade });
  };

  const UNIVERSAL_ROUTER = "0xA51afAFe0263b40EdaEf0Df8781eA9aa03E381a3";
  const PERMIT_2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
  const approveToken = async (
    tokenAddress: string,
    amount: string,
    signer: any
  ) => {
    console.log("log....");

    const address = await signer.getAddress();
    const tokenContract = new ethers.Contract(
      tokenAddress,
      MockERC20Abi,
      signer
    );
    const decimals = await tokenContract.decimals();
    const amountIn = ethers.utils.parseUnits(amount, decimals);

    const allowanceTransfer = new ethers.Contract(
      PERMIT_2_ADDRESS,
      AllowanceTransferAbi,
      signer
    );

    const currentUnixTime = Math.ceil(Date.now() / 1000);

    // ------------------ PERMIT2 APPROVAL ------------------
    try {
      setPermitStatus("loading");

      const [permitAllowance, expiration] = await allowanceTransfer.allowance(
        address,
        tokenAddress,
        UNIVERSAL_ROUTER
      );

      if (
        !isGraterThanEquals(permitAllowance.toString(), amountIn.toString()) ||
        Number(expiration.toString()) < Number(currentUnixTime)
      ) {
        console.log(`approval on permit2`);

        await writeToContract({
          address: PERMIT_2_ADDRESS,
          abi: AllowanceTransferAbi,
          functionName: "approve",
          args: [
            tokenAddress,
            PoolSwapTestAddress,
            amountIn,
            currentUnixTime + 72000,
          ],
        });
      }

      setPermitStatus("done");
    } catch (err) {
      toast.error("Permit2 approval failed");
      console.error("Permit2 approval failed:", err);
      setPermitStatus("error");
      return false;
    }

    // ------------------ TOKEN APPROVAL ------------------
    try {
      setApprovalStatus("loading");
      const allowance = await tokenContract.allowance(
        address,
        PERMIT_2_ADDRESS
      );

      if (!isGraterThanEquals(allowance.toString(), amountIn.toString())) {
        await writeToContract({
          address: tokenAddress as `0x${string}`,
          abi: MockERC20Abi,
          functionName: "approve",
          args: [PERMIT_2_ADDRESS, amountIn],
        });
      }

      setApprovalStatus("done");
    } catch (err) {
      console.error("Token approval failed:", err);
      toast.error("Token approval failed");
      setApprovalStatus("error");
      return false;
    }
    return true;
  };

  return {
    loading,
    quote,
    quoteLoading,
    updateAmountIn,
    updateAmountOut,
    test,
    progressModal: {
      open: modalOpen,
      setOpen: setModalOpen,
      approvalStatus,
      permitStatus,
      swapStatus,
      inputToken: {
        value: amount,
        token: token0,
      },
      RESET_MODAL: () => RESET_MODAL(),
      outputToken: {
        value: quote,
        token: token1,
      },
    },
  };
};

export default V4UseSwap;

function isGraterThanEquals(balanceOfToken: any, amountMax: any) {
  const balanceOfTokenString = Number(balanceOfToken.toString());
  const amountMaxString = Number(amountMax.toString());
  return balanceOfTokenString >= amountMaxString;
}
