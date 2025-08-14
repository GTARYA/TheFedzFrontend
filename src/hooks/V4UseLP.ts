const { ethers } = require('ethers');

const UNISWAP_V2_PAIR = "0x342dEe677FEA9ECAA71A9490B08f9e4ADDEf79D6";
import erc20Abi from "../abi/erc20.json";
import UNISWAP_PAIR_ABI from "../abi/uniswapv2Pair.json";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChainId } from "../config";
import { CurrencyAmount,  Percent, Token } from "@uniswap/sdk-core";
import {nearestUsableTick, encodeSqrtRatioX96, TickMath } from "@uniswap/v3-sdk";
import UniswapStateViewAbi from "../abi/UniswapStateView_abi.json";
import AllowanceTransferAbi from "../abi/AllowanceTransfer_abi.json";
import MockERC20Abi from "../abi/MockERC20_abi.json";
import { AllowanceProvider, PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'

import PoolModifiyLiquidityAbi from "../abi/PoolModifyLiquidityTest_abi.json";
import JSBI from 'jsbi';
import { web3Provider } from "../utils/provider";
import {
  HookAddress,
  MockFUSDAddress,
  MockUSDTAddress,
  PoolModifyLiquidityTestAddress,
  TimeSlotSystemAddress,
} from "../contractAddressArbitrum";
import { Pool, Position, RemoveLiquidityOptions, V4PositionManager } from "@uniswap/v4-sdk";
import { useAccount, useSendTransaction, useWriteContract } from "wagmi";
import { nextRoundAnnouncedNeeded } from "./fedz";
import TimeSlotSystemAbi from "../abi/TimeSlotSystem_abi.json";
import { getPositionIdByPlayer } from "./fedz";

const MAX_UINT160 = '1461501637330902918203684832716283019655932542975';
const token0 = new Token(42161, MockFUSDAddress, 18, "FUSD", "FUSD");
const token1 = new Token(42161, MockUSDTAddress, 6, "USDT", "USDT");
const TICK_SPACING = 10;
const poolId = Pool.getPoolId(token0, token1, 4000, 10, HookAddress);
const lowerPrice = encodeSqrtRatioX96(100e6, 105e18);
const upperPrice = encodeSqrtRatioX96(105e6, 100e18);
const tickLower = nearestUsableTick(TickMath.getTickAtSqrtRatio(lowerPrice), TICK_SPACING);
const tickUpper = nearestUsableTick(TickMath.getTickAtSqrtRatio(upperPrice), TICK_SPACING) + TICK_SPACING;

const V4UseLP = (
  chainId: number,
  amount: string,
  signer: any,
  tokenA: Token,
  tokenB: Token,
  onAmount0QuoteChange?: (amount0: CurrencyAmount<any>, amount1: CurrencyAmount<any>, liquidity: string) => void,
  onAmount1QuoteChange?: (amount0: CurrencyAmount<any>, amount1: CurrencyAmount<any>, liquidity: string) => void,
  slippageTolerance = new Percent(4, 100),
) => {

  const {address} = useAccount();
  const loadPool = async () => {
    const stateViewContract = new ethers.Contract(
      '0x76Fd297e2D437cd7f76d50F01AfE6160f86e9990',
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
  const updateAmount0 = async (amountA: string) => {
    console.log("update - updateAmount0");
    const pool = await loadPool();
    const amountAParsed = ethers.utils.parseUnits(amountA, tokenA.decimals);
    const nextPosition = Position.fromAmount0({
      pool,
      amount0: amountAParsed,
      tickLower,
      tickUpper,
      useFullPrecision: false
    });
    onAmount0QuoteChange && onAmount0QuoteChange(nextPosition.amount0 as CurrencyAmount<any>, nextPosition.amount1 as CurrencyAmount<any>, nextPosition.liquidity.toString());
  }
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
    onAmount1QuoteChange && onAmount1QuoteChange(nextPosition.amount0 as CurrencyAmount<any>, nextPosition.amount1 as CurrencyAmount<any>, nextPosition.liquidity.toString());
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

  const validateSufficientBalance = async (amount: CurrencyAmount<any>) => {
    const amountMax = ethers.utils.parseUnits(amount.toExact(), amount.currency.decimals);
    const tokenContract = new ethers.Contract(
      amount.currency.address,
      erc20Abi,
      signer
    );
    const balanceOfToken = await tokenContract.balanceOf(address);
    return isGraterThanEquals(balanceOfToken, amountMax);
  }

  const validateSufficientAllowance = async (amount: CurrencyAmount<any>) => {
    const amountMax = ethers.utils.parseUnits(amount.toExact(), amount.currency.decimals);
    const tokenContract = new ethers.Contract(
      amount.currency.address,
      erc20Abi,
      signer
    );
    const balanceOfToken = await tokenContract.allowance(address, PERMIT_2_ADDRESS);
    return isGraterThanEquals(balanceOfToken, amountMax);
  }

  const approveToken = async (tokenAddress: string, amount: string, signer: any) => {
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
  }

  const addLiquidity = async (amount0: CurrencyAmount<any>, amount1: CurrencyAmount<any>, liquidity: string, permitBatch?: any, signature?: string) => {
    setLoading(true);
    try {
      const pool = await loadPool();
      const position = new Position({
        pool,
        liquidity,
        tickLower,
        tickUpper,
      });
      const tokenId = (await loadMyPosition(signer.address, signer))?.toString() || undefined;
      const callParametersOptions: any = { slippageTolerance, deadline: Math.ceil(new Date().getTime()/1000) + 7200 };
      if (tokenId) {
        callParametersOptions.tokenId = tokenId;
      } else {
        callParametersOptions.recipient = address;
      }
      const { calldata, value } = V4PositionManager.addCallParameters(position, callParametersOptions);
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
            signature // signature
          ]),
          // Add liquidity call
          calldata
        ];
        
        tx = await poolManagerContract.multicall(multicallData, { value, gasLimit: 1_500_000 });
      } else {
        // Use regular approval with modifyLiquidities
        console.log("Using regular approval for liquidity addition");
        tx = await poolManagerContract.modifyLiquidities(calldata, Math.ceil(new Date().getTime()/1000) + 7200);
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

  const burnPosition = async () => {
    try {
      const tokenId = await loadMyPosition(address as any, signer);
      if (!tokenId) {
        toast.error("No position found to burn.");
        return;
      }
      console.log(`Burning position ${tokenId}...`);
      const actions = '0x0311';
      const params: any[] = [];
      const callbackData = ethers.utils.defaultAbiCoder.encode(["bytes", "bytes[]"], [actions, params]);
      const poolManagerContract = new ethers.Contract(
        PoolModifyLiquidityTestAddress,
        PoolModifiyLiquidityAbi,
        signer
      );
      const approveTx = await poolManagerContract.approve('0x360E68faCcca8cA495c1B7759Fd9EEe466db9FB32', tokenId);
      await approveTx.wait();
      const tx = await poolManagerContract.modifyLiquidities(tokenId);
      await tx.wait();

      setLiquidityInfo(undefined);
    } catch(e: any) {
      throw e;
    } finally {

    }
  }
  const decreasePosition = async (p: number) => {
    try {
      const pool = await loadPool();
      const tokenId = await loadMyPosition(address as `0x${string}`, signer) || undefined;
      if (!tokenId) {
        toast.error("No position found to decrease.");
        return;
      }
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
        tokenId: tokenId.toString(),
        liquidityPercentage: new Percent(p, 100),
        slippageTolerance,
        deadline,
      }
      const { calldata, value } = V4PositionManager.removeCallParameters(position, partialRemoveOptions);
      const poolManagerContract = new ethers.Contract(
        PoolModifyLiquidityTestAddress,
        PoolModifiyLiquidityAbi,
        signer
      );
      await poolManagerContract.modifyLiquidities(calldata, deadline);
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
      const tokenId = await loadMyPosition(address as `0x${string}`, signer) || undefined;
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
        tokenId: tokenId.toString(), amount0, amount1
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

  const validateSufficientAllowanceOnPermit2 = async (amount: CurrencyAmount<any>): Promise<boolean> => {
    try {
      const amountMax = ethers.utils.parseUnits(amount.toExact(), amount.currency.decimals);
      const allowanceTransfer = new ethers.Contract(
        PERMIT_2_ADDRESS,
        AllowanceTransferAbi,
        signer
      );
      const [permitAllowance, expiration] = await allowanceTransfer.allowance(
        address, amount.currency.address, PoolModifyLiquidityTestAddress
      );
      const currentUnixTime = Math.ceil(new Date().getTime()/1000);
      return isGraterThanEquals(permitAllowance.toString(), amountMax.toString()) && expiration > currentUnixTime;
    } catch (error) {
      console.error("Error validating permit2 allowance:", error);
      return false;
    }
  };

  const signBatchPermit = async (amount0: CurrencyAmount<any>, amount1: CurrencyAmount<any>): Promise<{permitBatch: any, signature: string}> => {
    try {
      console.log("Signing batch permit for amounts:", amount0.toExact(), amount1.toExact());
      
      const currentTime = Math.ceil(new Date().getTime()/1000);
      const deadline = currentTime + 600; // 10 minutes from now
      
      // Get current nonces for both tokens
      const allowanceTransfer = new ethers.Contract(
        PERMIT_2_ADDRESS,
        AllowanceTransferAbi,
        signer
      );
      
      const allowanceProvider = new AllowanceProvider(signer, PERMIT_2_ADDRESS);
      const nonce0 = await allowanceProvider.getNonce(address as `0x${string}`, amount0.currency.address, PoolModifyLiquidityTestAddress);
      const nonce1 = await allowanceProvider.getNonce(address as string, amount0.currency.address, PoolModifyLiquidityTestAddress);
      const permitBatch = {
        details: [
          {
            token: amount0.currency.address,
            amount: MAX_UINT160,
            expiration: deadline,
            nonce: nonce0.toString()
          },
          {
            token: amount1.currency.address,
            amount: MAX_UINT160,
            expiration: deadline,
            nonce: nonce1.toString()
          }
        ],
        spender: PoolModifyLiquidityTestAddress,
        sigDeadline: deadline
      };
      
      // EIP-712 domain
      const domain = {
        name: 'Permit2',
        chainId: chainId,
        verifyingContract: PERMIT_2_ADDRESS
      };
      
      // EIP-712 types
      const types = {
        PermitBatch: [
          { name: 'details', type: 'PermitDetails[]' },
          { name: 'spender', type: 'address' },
          { name: 'sigDeadline', type: 'uint256' }
        ],
        PermitDetails: [
          { name: 'token', type: 'address' },
          { name: 'amount', type: 'uint160' },
          { name: 'expiration', type: 'uint48' },
          { name: 'nonce', type: 'uint48' }
        ]
      };
      
      // EIP-712 message
      const message = {
        details: permitBatch.details,
        spender: permitBatch.spender,
        sigDeadline: permitBatch.sigDeadline
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
    liquidityInfo,
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
    signBatchPermit
  };
};

const PERMIT_2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3';

function isGraterThanEquals(balanceOfToken: any, amountMax: any) {
  const balanceOfTokenString = balanceOfToken.toString();
  const amountMaxString = amountMax.toString();
  return balanceOfTokenString.length > amountMaxString.length 
    || (balanceOfTokenString.length === amountMaxString.length && balanceOfTokenString >= amountMaxString);

}

const loadMyPosition = async (address: string, signer: any): Promise<bigint | undefined> => {
  return await getPositionIdByPlayer(address) || undefined;
}
export default V4UseLP;
