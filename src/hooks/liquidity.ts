import {
  createPublicClient,
  http,
  encodeAbiParameters,
  parseAbiParameters,
  parseUnits,
} from "viem";
import { ethers } from "ethers";
import { arbitrum } from "viem/chains";
import { getStateViewContract } from "../utils/stateViewUtils";
import { PoolModifyLiquidityTestAddress } from "../contractAddressArbitrum";
import { parse } from "path";
import {
  Pool,
  Position,
  RemoveLiquidityOptions,
  V4PositionManager,
  MintOptions,
} from "@uniswap/v4-sdk";
import { token0, token1 } from "./fedz";

export enum Actions {
  // pool actions
  // liquidity actions
  INCREASE_LIQUIDITY = 0x00,
  DECREASE_LIQUIDITY = 0x01,
  MINT_POSITION = 0x02,
  BURN_POSITION = 0x03,

  // for fee on transfer tokens
  // INCREASE_LIQUIDITY_FROM_DELTAS = 0x04,
  // MINT_POSITION_FROM_DELTAS = 0x05,

  // swapping
  SWAP_EXACT_IN_SINGLE = 0x06,
  SWAP_EXACT_IN = 0x07,
  SWAP_EXACT_OUT_SINGLE = 0x08,
  SWAP_EXACT_OUT = 0x09,

  // closing deltas on the pool manager
  // settling
  SETTLE = 0x0b,
  SETTLE_ALL = 0x0c,
  SETTLE_PAIR = 0x0d,
  // taking
  TAKE = 0x0e,
  TAKE_ALL = 0x0f,
  TAKE_PORTION = 0x10,
  TAKE_PAIR = 0x11,

  CLOSE_CURRENCY = 0x12,
  // CLEAR_OR_TAKE = 0x13,
  SWEEP = 0x14,

  // for wrapping/unwrapping native
  // WRAP = 0x15,
  UNWRAP = 0x16,
}

// /79167
export async function provideLiquidity(signer: any) {
  const publicClient = createPublicClient({
    chain: arbitrum,
    transport: http(),
  });

  /// params..
  const tokenId = BigInt(79167);
  const amount0Min = parseUnits("0.0018", 18); // USDC with 6 decimals
  const amount1Min = parseUnits("0.0018", 6); // USDT with 6 decimals
  const liquidity = BigInt(Math.floor(3734702476 / 2));
  const hookData = "0x";

  const currency0 = "0x894341be568Eae3697408c420f1d0AcFCE6E55f9";
  const currency1 = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
  const recipientss = "0x0A75E427156e36f185ca3A90b8Bc126CfC65DDBB";

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
      [token0.address, token1.address, recipientss]
    )
  );

  const callbackData = ethers.utils.defaultAbiCoder.encode(
    ["bytes", "bytes[]"],
    [actions, params]
  ) as "0x${string}";

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20 minutes from now

  const { request } = await publicClient.simulateContract({
    account: recipientss as `0x${string}`,
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

  console.log(request, "request");
}
