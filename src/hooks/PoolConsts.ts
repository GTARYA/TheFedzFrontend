import { MaxUint256, Percent, Token } from "@uniswap/sdk-core";
import {
  HookAddress,
  MockFUSDAddress,
  MockUSDTAddress,
  PoolModifyLiquidityTestAddress,
  TimeSlotSystemAddress,
} from "../contractAddressArbitrum";
import { Pool } from "@uniswap/v4-sdk";

// export const poolId = '0xdbe06ad1364f93e7df33fb90b4d2cbe993e26d2a2c3da9f99055647380b8f43a';//Pool.getPoolId(token0, token1, 4000, 10, HookAddress);
export const token0 = new Token(42161, MockFUSDAddress, 18, "FUSD", "FUSD");
export const token1 = new Token(42161, MockUSDTAddress, 6, "USDT", "USDT");
const TICK_SPACING = 10;
export const poolId = Pool.getPoolId(token0, token1, 4000, 10, HookAddress);