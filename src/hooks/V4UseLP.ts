const { ethers } = require("ethers");

const UNISWAP_V2_PAIR = "0x342dEe677FEA9ECAA71A9490B08f9e4ADDEf79D6";
import erc20Abi from "../abi/erc20.json";
import UNISWAP_PAIR_ABI from "../abi/uniswapv2Pair.json";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChainId } from "../config";
import { CurrencyAmount, Percent, Token } from "@uniswap/sdk-core";
import AllowanceTransferAbi from "../abi/AllowanceTransfer_abi.json";
import MockERC20Abi from "../abi/MockERC20_abi.json";
import { AllowanceProvider, PERMIT2_ADDRESS } from "@uniswap/permit2-sdk";
import { PositionInfo } from "../type";
import PoolModifiyLiquidityAbi from "../abi/PoolModifyLiquidityTest_abi.json";
import { parseUnits } from "viem";
import {
  HookAddress,
  PoolModifyLiquidityTestAddress,
  TimeSlotSystemAddress,
} from "../contractAddressArbitrum";
import { StepStatus, LiquidityStep } from "../type";
import {
  Pool,
  Position,
  V4PositionManager,
} from "@uniswap/v4-sdk";
import {
  useAccount,
  useSendTransaction,
  useWriteContract,
  useWalletClient,
  usePublicClient,
} from "wagmi";
import { nextRoundAnnouncedNeeded } from "./fedz";
import TimeSlotSystemAbi from "../abi/TimeSlotSystem_abi.json";
import { getPoolInfo } from "../utils/stateViewUtils";
import {
  token0,
  token1,
  poolId,
  lowerPrice,
  upperPrice,
  tickLower,
  tickUpper,
} from "./fedz";
import {
  UNISWAP_V4_POOL_FEE,
  UNISWAP_V4_TICK_SPACING,
} from "../config/liquidity";
const MAX_UINT160 = "1461501637330902918203684832716283019655932542975";

const V4UseLP = (
  chainId: number,
  amount: string,
  signer: any,
  tokenA: Token,
  tokenB: Token,
  onAmount0QuoteChange?: (
    amount0: CurrencyAmount<any>,
    amount1: CurrencyAmount<any>,
    liquidity: string
  ) => void,
  onAmount1QuoteChange?: (
    amount0: CurrencyAmount<any>,
    amount1: CurrencyAmount<any>,
    liquidity: string
  ) => void,
  slippageTolerance = new Percent(5, 100)
) => {
  const { address } = useAccount();
  //const address = "0xBEb1E27c4Cec83ee58A38785f662Cc6a7C46d004";

  //const address = "0xBEb1E27c4Cec83ee58A38785f662Cc6a7C46d004";
  // const address = "0x05A449aB36cE8D096C0bd0028Ea2Ae5A42Fe4EFd";
  // const address = "0x3c5Aac016EF2F178e8699D6208796A2D67557fe2"

  // const address = "0x3A3CeF3A0cb8B1bA0812b23E15CF125B11098032";

  //  const address = "0x854ce16536CC41A0593A754F88a3eAf14EEe9938"
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isRoundStepShow, setIsRoundStepShow] = useState<boolean>(false);

  const [currentStep, setCurrentStep] = useState<LiquidityStep>(
    LiquidityStep.Idle
  );

  const [stepStatuses, setStepStatuses] = useState<
    Record<LiquidityStep, StepStatus>
  >({
    [LiquidityStep.Idle]: "idle",
    [LiquidityStep.UnlockingRound]: "idle",
    [LiquidityStep.ApprovingToken0]: "idle",
    [LiquidityStep.ApprovingToken1]: "idle",
    [LiquidityStep.SigningPermit]: "idle",
    [LiquidityStep.AddingLiquidity]: "idle",
    [LiquidityStep.Complete]: "idle",
    [LiquidityStep.Error]: "idle",
  });

  const loadPool = async () => {
    const poolInfo = await getPoolInfo();
    console.log(poolInfo, "poolInfo");

    const pool = new Pool(
      token0,
      token1,
      UNISWAP_V4_POOL_FEE,
      UNISWAP_V4_TICK_SPACING,
      HookAddress,
      poolInfo.sqrtPriceX96,
      poolInfo.liquidity,
      poolInfo.tick
    );

    return pool;
  };

  const updateAmount0 = async (amountA: string) => {
    console.log("update - updateAmount0");
    const pool = await loadPool();
    const amountAParsed = ethers.utils.parseUnits(amountA, tokenA.decimals);
    const nextPosition = Position.fromAmount0({
      pool,
      amount0: amountAParsed,
      tickLower,
      tickUpper,
      useFullPrecision: false,
    });
    onAmount0QuoteChange &&
      onAmount0QuoteChange(
        nextPosition.amount0 as CurrencyAmount<any>,
        nextPosition.amount1 as CurrencyAmount<any>,
        nextPosition.liquidity.toString()
      );
  };
  const updateAmount1 = async (amountB: string) => {
    console.log("update - updateAmount1");

    const pool = await loadPool();
    const amountAParsed = ethers.utils.parseUnits(amountB, tokenB.decimals);
    const nextPosition = Position.fromAmount1({
      pool,
      amount1: amountAParsed,
      tickLower,
      tickUpper,
    });
    onAmount1QuoteChange &&
      onAmount1QuoteChange(
        nextPosition.amount0 as CurrencyAmount<any>,
        nextPosition.amount1 as CurrencyAmount<any>,
        nextPosition.liquidity.toString()
      );
  };
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<string>("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [removeLiquidityloading, setRemoveLiquidityloading] = useState(false);
  const [addingLiquidityLoading, setAddingLiquidityLoading] = useState(false);

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
      const final = quote * Number(inputAmount);
      setQuote(final.toString());
    } catch (error) {
      console.error("Error getting quote:", error);
      return null;
    } finally {
      setQuoteLoading(false);
    }
  };


  const approveTokenToPermit2 = async (
    token: CurrencyAmount<any>
  ): Promise<{ success: boolean; error: any }> => {
    try {
      const tokenAddress = token.currency.address;
      const tokenDecimals = token.currency.decimals;
      console.log(`Approving token ${tokenAddress}...`);
      const currentAllowance: any = await publicClient!.readContract({
        address: tokenAddress as `0x${string}`,
        abi: MockERC20Abi,
        functionName: "allowance",
        args: [address as `0x${string}`, PERMIT2_ADDRESS as `0x${string}`],
      });

      const requiredAmount = parseUnits(amount, tokenDecimals);
      if (currentAllowance >= requiredAmount) {
        console.log("Already approved");
        return { success: true, error: null };
      }

      console.log(`🔑 Sending approval for ${tokenAddress}...`);

      const txHash = await walletClient!.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: MockERC20Abi,
        functionName: "approve",
        args: [PERMIT2_ADDRESS, requiredAmount],
      });

      await publicClient!.waitForTransactionReceipt({ hash: txHash });

      console.log("✅ Approval confirmed on-chain via viem.");
      return { success: true, error: null };
    } catch (err) {
      console.error("❌ Approval failed:", err);
      return { success: false, error: err };
    }
  };

  const setStepStatus = (step: LiquidityStep, status: StepStatus) => {
    setStepStatuses((prev) => ({ ...prev, [step]: status }));
  };

  const resetStepStatuses = () => {
    const defaultStepStatuses = {
      [LiquidityStep.UnlockingRound]: "idle",
      [LiquidityStep.ApprovingToken0]: "idle",
      [LiquidityStep.ApprovingToken1]: "idle",
      [LiquidityStep.SigningPermit]: "idle",
      [LiquidityStep.AddingLiquidity]: "idle",
      [LiquidityStep.Complete]: "idle",
    };

    setStepStatuses(defaultStepStatuses as typeof stepStatuses);
  };

  const addLiquidity = async (
    amount0: CurrencyAmount<any>,
    amount1: CurrencyAmount<any>,
    liquidity: string
  ) => {
    setAddingLiquidityLoading(true);

    try {
      // --- Step 1: Check Round if not active call unlock ---
      const isRoundUnlocked = await validateRoundUnlock();
      if (!isRoundUnlocked) {
        setIsRoundStepShow(true);
        setCurrentStep(LiquidityStep.UnlockingRound);
        setStepStatus(LiquidityStep.UnlockingRound, "loading");

        const unlockRoundTx = await unlockRound();
        console.log(unlockRoundTx, "unlockRoundTx");

        if (!unlockRoundTx.success) {
          setStepStatus(LiquidityStep.UnlockingRound, "error");
          throw unlockRoundTx.error;
        }
        setStepStatus(LiquidityStep.UnlockingRound, "done");
      }

      const deadline = Math.ceil(Date.now() / 1000) + 60 * 20;
      const pool = await loadPool();
      const position = new Position({ pool, liquidity, tickLower, tickUpper });

      // --- Step 2: Approve token0 ---
      setCurrentStep(LiquidityStep.ApprovingToken0);
      setStepStatus(LiquidityStep.ApprovingToken0, "loading");
      const approval0 = await approveTokenToPermit2(amount0);
      if (!approval0.success) {
        setStepStatus(LiquidityStep.ApprovingToken0, "error");
        toast.error("Token 0 approval failed.");
        throw approval0.error;
      }
      setStepStatus(LiquidityStep.ApprovingToken0, "done");

      // --- Step 3: Approve token1 ---
      setCurrentStep(LiquidityStep.ApprovingToken1);
      setStepStatus(LiquidityStep.ApprovingToken1, "loading");
      const approval1 = await approveTokenToPermit2(amount1);
      if (!approval1.success) {
        setStepStatus(LiquidityStep.ApprovingToken1, "error");
        toast.error("Token 1 approval failed.");
        throw approval1.error;
      }
      setStepStatus(LiquidityStep.ApprovingToken1, "done");

      // --- Step 4: Check Permit2 and sign if needed ---
      setCurrentStep(LiquidityStep.SigningPermit);
      setStepStatus(LiquidityStep.SigningPermit, "loading");

      const permit2Allowance0 = await checkPermit2Allowance(
        amount0.currency.address
      );
      const permit2Allowance1 = await checkPermit2Allowance(
        amount1.currency.address
      );

      console.log(permit2Allowance0, "permit2Allowance0");
      console.log(permit2Allowance1, "permit2Allowance1");

      const now = Math.floor(Date.now() / 1000);
      const requiredAmount0 = parseUnits(
        amount0.toExact(),
        amount0.currency.decimals
      );
      const requiredAmount1 = parseUnits(
        amount1.toExact(),
        amount1.currency.decimals
      );

      const needsPermit0 =
        permit2Allowance0.amount < requiredAmount0 ||
        permit2Allowance0.expiration < now;
      const needsPermit1 =
        permit2Allowance1.amount < requiredAmount1 ||
        permit2Allowance1.expiration < now;

      let mintOptions: any = {
        slippageTolerance,
        deadline,
        recipient: address,
        useNative: undefined,
        hookData: "0x",
      };

      if (needsPermit0 || needsPermit1) {
        console.log("Signing Permit2 batch...");
        const permitBatchData = position.permitBatchData(
          slippageTolerance,
          PoolModifyLiquidityTestAddress,
          Math.max(permit2Allowance0.nonce, permit2Allowance1.nonce),
          deadline
        );

        const { signature, error, success } = await signPermit2Batch(
          permitBatchData
        );

        if (!success) {
          setStepStatus(LiquidityStep.SigningPermit, "error");
          throw error;
        }

        mintOptions.batchPermit = {
          owner: address,
          permitBatch: permitBatchData,
          signature,
        };
      }
      setStepStatus(LiquidityStep.SigningPermit, "done");

      try {
        // --- Step 5: Execute transaction ---
        setCurrentStep(LiquidityStep.AddingLiquidity);
        setStepStatus(LiquidityStep.AddingLiquidity, "loading");

        const sanitizedMintOptions = {
          ...mintOptions,
          deadline: mintOptions.deadline.toString
            ? mintOptions.deadline.toString()
            : mintOptions.deadline,
        };

        // Sanitize mint options ---

        if (sanitizedMintOptions.batchPermit) {
          sanitizedMintOptions.batchPermit.permitBatch = {
            ...sanitizedMintOptions.batchPermit.permitBatch,
            sigDeadline:
              sanitizedMintOptions.batchPermit.permitBatch.sigDeadline.toString(),
            details: sanitizedMintOptions.batchPermit.permitBatch.details.map(
              (detail: any) => ({
                ...detail,
                amount:
                  typeof detail.amount === "string"
                    ? detail.amount
                    : detail.amount.toString(),
                expiration:
                  typeof detail.expiration === "string"
                    ? detail.expiration
                    : detail.expiration.toString(),
                nonce:
                  typeof detail.nonce === "string"
                    ? detail.nonce
                    : detail.nonce.toString(),
              })
            ),
          };
        }

        console.log("Sanitized mint options:", sanitizedMintOptions);

        const { calldata, value } = V4PositionManager.addCallParameters(
          position,
          sanitizedMintOptions
        );

        const simulation = await publicClient!.simulateContract({
          account: address,
          address: PoolModifyLiquidityTestAddress,
          abi: PoolModifiyLiquidityAbi,
          functionName: "multicall",
          args: [[calldata]],
          value: BigInt(value.toString()),
        });

        console.log("Simulation success:", simulation);

        const txHash = await walletClient!.writeContract(simulation.request);
        await publicClient!.waitForTransactionReceipt({
          hash: txHash,
        });

        setStepStatus(LiquidityStep.AddingLiquidity, "done");
        setCurrentStep(LiquidityStep.Complete);
        toast.success("Liquidity added successfully!");
      } catch (error) {
        setStepStatus(LiquidityStep.AddingLiquidity, "error");
        throw error;
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error adding liquidity:", error);
      setStepStatus(currentStep, "error");
      console.log(currentStep, "currentStep");

      toast.error("Failed to add liquidity.");
      return {
        success: false,
      };
    } finally {
      setAddingLiquidityLoading(false);
    }
  };

  const decreasePosition = async (
    percentageToRemove: number,
    data: PositionInfo
  ) => {
    try {
      const { tokenId, liquidity: positionLiquidity } = data;
      if (!tokenId) {
        toast.error("No position found to decrease.");
        return;
      }
      const poolData = await loadPool();

      //liquidity to remove
      const liquidity = BigInt(
        Math.floor(positionLiquidity * (percentageToRemove / 100))
      );

      const position = new Position({
        pool: poolData,
        tickLower,
        tickUpper,
        liquidity: liquidity.toString(),
      });

      const { amount0: amount0MinJSBI, amount1: amount1MinJSBI } =
        position.burnAmountsWithSlippage(slippageTolerance);

      const amount0Min = BigInt(amount0MinJSBI.toString());
      const amount1Min = BigInt(amount1MinJSBI.toString());

      console.log(amount0Min.toString(), "amount0Min");
      console.log(amount1Min.toString(), "amount1Min");

      const actions = "0x0111";
      const params: string[] = [];

      params.push(
        ethers.utils.defaultAbiCoder.encode(
          ["uint256", "uint256", "uint128", "uint128", "bytes"],
          [tokenId, liquidity, amount0Min, amount1Min, "0x"]
        )
      );

      params.push(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "address", "address"],
          [token0.address, token1.address, address]
        )
      );

      const callbackData = ethers.utils.defaultAbiCoder.encode(
        ["bytes", "bytes[]"],
        [actions, params]
      ) as "0x${string}";

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20 minutes from now
      const { request } = await publicClient!.simulateContract({
        account: address as `0x${string}`,
        address: PoolModifyLiquidityTestAddress as `0x${string}`,
        abi: [
          {
            name: "modifyLiquidities",
            type: "function",
            stateMutability: "payable",
            inputs: [
              { name: "unlockData", type: "bytes" },
              { name: "deadline", type: "uint256" },
            ],
            outputs: [],
          },
        ],
        functionName: "modifyLiquidities",
        args: [callbackData, deadline],
        value: BigInt(0),
      });

      console.log("Simulation decreasePosition success ", request);
      const txHash = await walletClient!.writeContract(request);
      const receipt = await publicClient!.waitForTransactionReceipt({
        hash: txHash,
      });
      toast.success("Liquidity successfully decreased ✅");
    } catch (e: any) {
      console.log("decreasePosition error", e);
      throw e;
    } finally {
    }
  };

  const burnPosition = async (data: PositionInfo) => {
    try {
      const { tokenId, liquidity } = data;
      if (!tokenId) {
        toast.error("No position found to decrease.");
        return;
      }
      const poolData = await loadPool();

      const position = new Position({
        pool: poolData,
        tickLower,
        tickUpper,
        liquidity,
      });

      const { amount0: amount0MinJSBI, amount1: amount1MinJSBI } =
        position.burnAmountsWithSlippage(slippageTolerance);

      const amount0Min = BigInt(amount0MinJSBI.toString());
      const amount1Min = BigInt(amount1MinJSBI.toString());

      const actions = "0x0311";
      const params: string[] = [];

      params.push(
        ethers.utils.defaultAbiCoder.encode(
          ["uint256", "uint128", "uint128", "bytes"],
          [tokenId, amount0Min, amount1Min, "0x"]
        )
      );

      params.push(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "address", "address"],
          [token0.address, token1.address, address]
        )
      );

      const callbackData = ethers.utils.defaultAbiCoder.encode(
        ["bytes", "bytes[]"],
        [actions, params]
      ) as "0x${string}";

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20 minutes from now
      const { request } = await publicClient!.simulateContract({
        account: address as `0x${string}`,
        address: PoolModifyLiquidityTestAddress as `0x${string}`,
        abi: [
          {
            name: "modifyLiquidities",
            type: "function",
            stateMutability: "payable",
            inputs: [
              { name: "unlockData", type: "bytes" },
              { name: "deadline", type: "uint256" },
            ],
            outputs: [],
          },
        ],
        functionName: "modifyLiquidities",
        args: [callbackData, deadline],
        value: BigInt(0),
      });

      console.log("Simulation burn success ", request);
      const txHash = await walletClient!.writeContract(request);
      const receipt = await publicClient!.waitForTransactionReceipt({
        hash: txHash,
      });
      toast.success("Liquidity successfully burned ✅");
    } catch (e: any) {
      console.log("decreasePosition error", e);
      throw e;
    } finally {
    }
  };
  const removeLiquidity = async (
    percentToRemove: number,
    data: PositionInfo
  ) => {
    setRemoveLiquidityloading(true);

    try {
      console.log(`Removing liquidity... ${percentToRemove}%`);
      if (percentToRemove == 100) {
        // Burn position
        await burnPosition(data);
      } else {
        console.log("calling....", percentToRemove, data);
        // Decrease position
        await decreasePosition(percentToRemove, data);
      }
    } catch (error) {
      console.error("Error removing liquidity:", error);
      toast.error("Failed to remove liquidity.");
    } finally {
      setRemoveLiquidityloading(false);
    }
  };

  useEffect(() => {
    if (signer && chainId == ChainId) {
      getQuote(amount);
    }
  }, [amount, signer, tokenA, tokenB, chainId]);

  // Functions for ModifyLiquidityDrillDown
  const validateRoundUnlock = async (): Promise<boolean> => {
    try {
      return !(await nextRoundAnnouncedNeeded(signer));
    } catch (error) {
      console.error("Error validating round unlock:", error);
      return false;
    }
  };

  const unlockRound = async (): Promise<{
    success: boolean;
    error: string | null;
  }> => {
    try {
      const timeSlotSystemContract = new ethers.Contract(
        TimeSlotSystemAddress,
        TimeSlotSystemAbi,
        signer
      );
      const tx = await timeSlotSystemContract.unlockRound();
      await tx.wait();
      return {
        success: true,
        error: null,
      };
    } catch (error: any) {
      console.error("Error unlocking round:", error);
      return {
        success: false,
        error: error,
      };
    }
  };


  const checkPermit2Allowance = async (
    tokenAddress: string
  ): Promise<{ amount: bigint; expiration: number; nonce: number }> => {
    if (!publicClient || !address) {
      return { amount: BigInt(0), expiration: 0, nonce: 0 };
    }

    try {
      const result: any = await publicClient.readContract({
        address: PERMIT2_ADDRESS as `0x${string}`,
        abi: AllowanceTransferAbi,
        functionName: "allowance",
        args: [
          address as `0x${string}`,
          tokenAddress as `0x${string}`,
          PoolModifyLiquidityTestAddress as `0x${string}`,
        ],
      });

      return {
        amount: result[0] as bigint,
        expiration: Number(result[1]),
        nonce: Number(result[2]),
      };
    } catch (error) {
      return { amount: BigInt(0), expiration: 0, nonce: 0 };
    }
  };

  const signPermit2Batch = async (
    permitBatch: any
  ): Promise<{ success: boolean; signature: string; error: any }> => {
    try {
      if (!walletClient) {
        throw new Error("Wallet not available");
      }

      const domain = {
        name: "Permit2",
        chainId: chainId,
        verifyingContract: PERMIT2_ADDRESS as `0x${string}`,
      };

      const extractNumericValue = (value: any): string => {
        console.log(typeof value, "typeof value ", value.toString());

        // Handle JSBI objects specifically
        if (value && typeof value === "object") {
          // Use JSBI's toString method
          return value.toString();
        }

        // Handle regular numbers, bigints, strings
        if (typeof value === "bigint") {
          return value.toString();
        }

        if (typeof value === "number") {
          return value.toString();
        }

        if (typeof value === "string") {
          return value.replace(/,/g, "");
        }

        // Last resort
        console.warn(
          "Unexpected value type in extractNumericValue:",
          typeof value,
          value
        );
        return "0";
      };

      const sanitizedPermitBatch = {
        spender: permitBatch.spender,
        sigDeadline: extractNumericValue(permitBatch.sigDeadline),
        details: permitBatch.details.map((detail: any) => ({
          token: detail.token,
          amount: extractNumericValue(detail.amount),
          expiration: extractNumericValue(detail.expiration),
          nonce: extractNumericValue(detail.nonce),
        })),
      };

      console.log(sanitizedPermitBatch, "sanitizedPermitBatch");

      const PERMIT2_BATCH_TYPES = {
        PermitBatch: [
          { name: "details", type: "PermitDetails[]" },
          { name: "spender", type: "address" },
          { name: "sigDeadline", type: "uint256" },
        ],
        PermitDetails: [
          { name: "token", type: "address" },
          { name: "amount", type: "uint160" },
          { name: "expiration", type: "uint48" },
          { name: "nonce", type: "uint48" },
        ],
      };

      const signature = await walletClient.signTypedData({
        account: address as `0x${string}`,
        domain,
        types: PERMIT2_BATCH_TYPES,
        primaryType: "PermitBatch",
        message: sanitizedPermitBatch,
      });

      return { signature, success: true, error: null };
    } catch (error) {
      console.error("Error signing Permit2 batch:", error);
      return {
        success: false,
        error: error,
        signature: "",
      };
    }
  };

  return {
    getQuote,
    loading,
    quote,
    quoteLoading,
    addLiquidity,
    removeLiquidity,
    removeLiquidityloading,
    updateAmount0,
    updateAmount1,
    validateRoundUnlock,
    unlockRound,
    approveTokenToPermit2,
    checkPermit2Allowance,
    addingLiquidityLoading,
    currentStep,
    stepStatuses,
    resetStepStatuses,
    isRoundStepShow,
  };
};



export default V4UseLP;
