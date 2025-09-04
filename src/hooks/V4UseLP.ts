const { ethers } = require("ethers");

const UNISWAP_V2_PAIR = "0x342dEe677FEA9ECAA71A9490B08f9e4ADDEf79D6";
import erc20Abi from "../abi/erc20.json";
import UNISWAP_PAIR_ABI from "../abi/uniswapv2Pair.json";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChainId } from "../config";
import { CurrencyAmount, Percent, Token } from "@uniswap/sdk-core";
import { useQuery } from "@tanstack/react-query";
import {
  nearestUsableTick,
  encodeSqrtRatioX96,
  TickMath,
} from "@uniswap/v3-sdk";
import UniswapStateViewAbi from "../abi/UniswapStateView_abi.json";
import AllowanceTransferAbi from "../abi/AllowanceTransfer_abi.json";
import MockERC20Abi from "../abi/MockERC20_abi.json";
import { AllowanceProvider, PERMIT2_ADDRESS } from "@uniswap/permit2-sdk";
import { PositionInfo } from "../type";
import PoolModifiyLiquidityAbi from "../abi/PoolModifyLiquidityTest_abi.json";
import JSBI from "jsbi";
import { web3Provider } from "../utils/provider";
import {
  HookAddress,
  MockFUSDAddress,
  MockUSDTAddress,
  PoolModifyLiquidityTestAddress,
  TimeSlotSystemAddress,
} from "../contractAddressArbitrum";
import {
  Pool,
  Position,
  RemoveLiquidityOptions,
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
import { getPositionIdByPlayer } from "./fedz";
import {
  token0,
  token1,
  poolId,
  lowerPrice,
  upperPrice,
  tickLower,
  tickUpper,
} from "./fedz";
import { an } from "framer-motion/dist/types.d-B50aGbjN";
const MAX_UINT160 = "1461501637330902918203684832716283019655932542975";
const TICK_SPACING = 10;

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
  slippageTolerance = new Percent(4, 100)
) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const loadPool = async () => {
    const stateViewContract = new ethers.Contract(
      "0x76Fd297e2D437cd7f76d50F01AfE6160f86e9990",
      UniswapStateViewAbi,
      web3Provider
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
      tick,
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

  const validateSufficientBalance = async (amount: CurrencyAmount<any>) => {
    const amountMax = ethers.utils.parseUnits(
      amount.toExact(),
      amount.currency.decimals
    );
    const tokenContract = new ethers.Contract(
      amount.currency.address,
      erc20Abi,
      signer
    );
    const balanceOfToken = await tokenContract.balanceOf(address);
    return isGraterThanEquals(balanceOfToken, amountMax);
  };

  const validateSufficientAllowance = async (amount: CurrencyAmount<any>) => {
    const amountMax = ethers.utils.parseUnits(
      amount.toExact(),
      amount.currency.decimals
    );
    const tokenContract = new ethers.Contract(
      amount.currency.address,
      erc20Abi,
      signer
    );
    const balanceOfToken = await tokenContract.allowance(
      address,
      PERMIT_2_ADDRESS
    );
    return isGraterThanEquals(balanceOfToken, amountMax);
  };

  const approveToken = async (
    tokenAddress: string,
    amount: string,
    signer: any
  ) => {
    try {
      console.log(`Approving token ${tokenAddress}...`);
      const tokenContract = new ethers.Contract(
        tokenAddress,
        MockERC20Abi,
        signer
      );
      const tx = await tokenContract.approve(PERMIT_2_ADDRESS, MAX_UINT160);
      return await tx.wait();
    } catch (err) {
      throw err;
    }
  };

  const _approveToken = async (amount: CurrencyAmount<any>) => {
    return approveToken(amount.currency.address, amount.toExact(), signer);
  };

  const addLiquidity = async (
    amount0: CurrencyAmount<any>,
    amount1: CurrencyAmount<any>,
    liquidity: string,
    permitBatch?: any,
    signature?: string
  ) => {
    setLoading(true);
    try {
      const pool = await loadPool();
      const position = new Position({
        pool,
        liquidity,
        tickLower,
        tickUpper,
      });

      const mintOptions: any = {
        slippageTolerance,
        recipient: address,
        deadline: Math.ceil(new Date().getTime() / 1000) + 7200,
      };

      const { calldata, value } = V4PositionManager.addCallParameters(
        position,
        mintOptions
      );

      const poolManagerContract = new ethers.Contract(
        PoolModifyLiquidityTestAddress,
        PoolModifiyLiquidityAbi,
        signer
      );

      let tx;
      if (permitBatch && signature) {
        // Use permit batch for gasless approval with multicall
        console.log("Using permit batch for liquidity addition with multicall");

        // Create the multicall data array
        const multicallData = [
          // Permit batch call
          poolManagerContract.interface.encodeFunctionData("permitBatch", [
            address, // owner
            permitBatch, // permit batch data
            signature, // signature
          ]),
          // Add liquidity call
          calldata,
        ];

        tx = await poolManagerContract.multicall(multicallData, {
          value,
          gasLimit: 1_500_000,
        });
      } else {
        // Use regular approval with modifyLiquidities
        console.log("Using regular approval for liquidity addition");
        tx = await poolManagerContract.modifyLiquidities(
          calldata,
          Math.ceil(new Date().getTime() / 1000) + 7200
        );
      }
      await tx.wait();
    } catch (error) {
      console.error("Error adding liquidity:", error);
      toast.error("Failed to add liquidity.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const burnPosition = async (data: PositionInfo) => {
    try {
      const { tokenId } = data;
      if (!tokenId) {
        toast.error("No position found to burn.");
        return;
      }
      console.log(`Burning position ${tokenId}...`);
      const actions = "0x0311";
      const params: any[] = [];
      const callbackData = ethers.utils.defaultAbiCoder.encode(
        ["bytes", "bytes[]"],
        [actions, params]
      );
      const poolManagerContract = new ethers.Contract(
        PoolModifyLiquidityTestAddress,
        PoolModifiyLiquidityAbi,
        signer
      );
      const approveTx = await poolManagerContract.approve(
        "0x360E68faCcca8cA495c1B7759Fd9EEe466db9FB32",
        tokenId
      );
      await approveTx.wait();
      const tx = await poolManagerContract.modifyLiquidities(tokenId);
      await tx.wait();
    } catch (e: any) {
      console.log("burnPosition error", e);
      throw e;
    } finally {
    }
  };

  const testDereasePosition = async (percentageToRemove:number) => {

  const decodePositionInfo = (value: any)=> {
    const bigValue = ethers.BigNumber.from(value);
    const tickUpperRaw = bigValue.shr(32).and(0xffffff).toNumber();
    const tickLowerRaw = bigValue.shr(8).and(0xffffff).toNumber();
    const tickUpper = tickUpperRaw >= 0x800000 ? tickUpperRaw - 0x1000000 : tickUpperRaw;
    const tickLower = tickLowerRaw >= 0x800000 ? tickLowerRaw - 0x1000000 : tickLowerRaw;
    return { tickLower, tickUpper };
  }


    const tokenId = "66056";
    const poolIds =
      "0xfa9cae5fcca285c3bcb8237cd4a012ce22731a940811587d02582df077cb9592";
    const stateViewContract = new ethers.Contract(
      "0x76Fd297e2D437cd7f76d50F01AfE6160f86e9990",
      UniswapStateViewAbi,
      web3Provider
    );
    const poolLiquidity = await stateViewContract.getLiquidity(poolIds);
  
    const [sqrtPriceX96, tick] = await stateViewContract.getSlot0(poolIds);

    const pool = new Pool(
      token0,
      token1,
      100,
      1,
      "0x0000000000000000000000000000000000000000",
      sqrtPriceX96,
      poolLiquidity,
      tick
    );

    const poolManagerContract = new ethers.Contract(
      PoolModifyLiquidityTestAddress,
      PoolModifiyLiquidityAbi,
      signer
    );


    const liquidity = await poolManagerContract.getPositionLiquidity(tokenId);
    const [poolKey, infoValue] = await poolManagerContract.getPoolAndPositionInfo(tokenId)
    const positionInfo = decodePositionInfo(infoValue);


    const position = new Position({
      pool,
      tickLower: positionInfo.tickLower,
      tickUpper: positionInfo.tickUpper,
      liquidity: liquidity.toString(),
    });

    const deadline = Math.floor(Date.now() / 1000) + 1200;
   
    const burnTokenIfEmpty = false;
    const removeOptions: RemoveLiquidityOptions = {
      deadline,
      slippageTolerance: new Percent(4, 100),
      tokenId,
      liquidityPercentage: new Percent(percentageToRemove,100),
      burnToken: false, // true to burn NFT
    };

    const { calldata, value } = V4PositionManager.removeCallParameters(
      position,
      removeOptions
    );

    const tx = await poolManagerContract.modifyLiquidities(calldata, deadline, {
      gasLimit: 1_500_000,
      value: value.toString(),
    });
    await tx.wait();

    //  const txHash = await walletClient!.writeContract({
    //     account:address,
    //     address: PoolModifyLiquidityTestAddress,
    //     abi: PoolModifiyLiquidityAbi,
    //     functionName: 'multicall',
    //     args: [[calldata]],
    //     value: BigInt(value.toString()),
    //   })
  };

  const decreasePosition = async (
    percentageToRemove: number,
    data: PositionInfo
  ) => {
    try {
      const pool = await loadPool();
      const { tokenId, liquidity } = data;
      if (!tokenId) {
        toast.error("No position found to decrease.");
        return;
      }

      const deadline = Math.ceil(new Date().getTime() / 1000) + 7200;
      const position = new Position({
        pool,
        liquidity,
        tickLower,
        tickUpper,
      });

      const partialRemoveOptions: RemoveLiquidityOptions = {
        tokenId: tokenId.toString(),
        liquidityPercentage: new Percent(percentageToRemove, 100),
        slippageTolerance,
        deadline,
      };

      const { calldata, value } = V4PositionManager.removeCallParameters(
        position,
        partialRemoveOptions
      );

      // const txHash = await walletClient!.writeContract({
      //   account: address,
      //   address: PoolModifyLiquidityTestAddress,
      //   abi: PoolModifiyLiquidityAbi,
      //   functionName: "multicall",
      //   args: [[calldata]],
      //   value: BigInt(value.toString()),
      // });

      // const receipt = await publicClient!.waitForTransactionReceipt({
      //   hash: txHash,
      // });

      const poolManagerContract = new ethers.Contract(
        PoolModifyLiquidityTestAddress,
        PoolModifiyLiquidityAbi,
        signer
      );
      const tx = await poolManagerContract.modifyLiquidities(
        calldata,
        deadline
      );
  
      await tx.wait();
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
      if (percentToRemove === 100) {
        // Burn position
        await burnPosition(data);
      } else {
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
      return true;
      return !(await nextRoundAnnouncedNeeded(signer));
    } catch (error) {
      console.error("Error validating round unlock:", error);
      return false;
    }
  };

  const unlockRound = async (): Promise<void> => {
    try {
      const timeSlotSystemContract = new ethers.Contract(
        TimeSlotSystemAddress,
        TimeSlotSystemAbi,
        signer
      );
      const tx = await timeSlotSystemContract.unlockRound();
      await tx.wait();
    } catch (error) {
      console.error("Error unlocking round:", error);
      throw error;
    }
  };

  const validateSufficientAllowanceOnPermit2 = async (
    amount: CurrencyAmount<any>
  ): Promise<boolean> => {
    try {
      const amountMax = ethers.utils.parseUnits(
        amount.toExact(),
        amount.currency.decimals
      );
      const allowanceTransfer = new ethers.Contract(
        PERMIT_2_ADDRESS,
        AllowanceTransferAbi,
        signer
      );
      const [permitAllowance, expiration] = await allowanceTransfer.allowance(
        address,
        amount.currency.address,
        PoolModifyLiquidityTestAddress
      );
      const currentUnixTime = Math.ceil(new Date().getTime() / 1000);
      return (
        isGraterThanEquals(permitAllowance.toString(), amountMax.toString()) &&
        expiration > currentUnixTime
      );
    } catch (error) {
      console.error("Error validating permit2 allowance:", error);
      return false;
    }
  };

  const signBatchPermit = async (
    amount0: CurrencyAmount<any>,
    amount1: CurrencyAmount<any>
  ): Promise<{ permitBatch: any; signature: string }> => {
    try {
      console.log(
        "Signing batch permit for amounts:",
        amount0.toExact(),
        amount1.toExact()
      );

      const currentTime = Math.ceil(new Date().getTime() / 1000);
      const deadline = currentTime + 600; // 10 minutes from now

      // Get current nonces for both tokens
      const allowanceTransfer = new ethers.Contract(
        PERMIT_2_ADDRESS,
        AllowanceTransferAbi,
        signer
      );

      const allowanceProvider = new AllowanceProvider(signer, PERMIT_2_ADDRESS);

      const nonce0 =
        1 +
        (await allowanceProvider.getNonce(
          address as `0x${string}`,
          amount0.currency.address,
          PoolModifyLiquidityTestAddress
        ));
      const nonce1 =
        1 +
        (await allowanceProvider.getNonce(
          address as string,
          amount0.currency.address,
          PoolModifyLiquidityTestAddress
        ));
      const permitBatch = {
        details: [
          {
            token: amount0.currency.address,
            amount: MAX_UINT160,
            expiration: deadline,
            nonce: nonce0.toString(),
          },
          {
            token: amount1.currency.address,
            amount: MAX_UINT160,
            expiration: deadline,
            nonce: nonce1.toString(),
          },
        ],
        spender: PoolModifyLiquidityTestAddress,
        sigDeadline: deadline,
      };

      // EIP-712 domain
      const domain = {
        name: "Permit2",
        chainId: chainId,
        verifyingContract: PERMIT_2_ADDRESS,
      };

      // EIP-712 types
      const types = {
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

      // EIP-712 message
      const message = {
        details: permitBatch.details,
        spender: permitBatch.spender,
        sigDeadline: permitBatch.sigDeadline,
      };
      // Sign the typed data
      const signature = await signer._signTypedData(domain, types, message);
      return { permitBatch, signature };
    } catch (error) {
      console.error("Error signing batch permit:", error);
      throw error;
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
    validateSufficientBalance,
    validateSufficientAllowance,
    validateSufficientAllowanceOnPermit2,
    approveToken: _approveToken,
    // approveTokenOnPermit2,
    signBatchPermit,
  };
};

const PERMIT_2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

function isGraterThanEquals(balanceOfToken: any, amountMax: any) {
  const balanceOfTokenString = balanceOfToken.toString();
  const amountMaxString = amountMax.toString();
  return (
    balanceOfTokenString.length > amountMaxString.length ||
    (balanceOfTokenString.length === amountMaxString.length &&
      balanceOfTokenString >= amountMaxString)
  );
}

export default V4UseLP;
