import {
  createPublicClient,
  http,
  getContract,
  encodeAbiParameters,
  keccak256,
  Hex,
} from "viem";
import { STATE_VIEW_CONTRACT } from "../contractAddressArbitrum";
import stateViewABI from "../abi/UniswapStateView_abi.json";
import { poolId } from "../hooks/fedz";
const rpcUrl =
  "https://arb-mainnet.g.alchemy.com/v2/V-XZ3MOv9AXdTc6PdKJvcMcBxYMSDi3F";


export const getStateViewContract = () => {
  const publicClient = createPublicClient({
    transport: http(rpcUrl),
  });

  return getContract({
    address: STATE_VIEW_CONTRACT as `0x${string}`,
    abi: stateViewABI,
    client: publicClient,
  });
};

export const getPoolInfo = async () => {
  try {
    const stateView = getStateViewContract();
    // Try to get slot0 data and liquidity
    const [slot0Data, liquidity] = await Promise.all([
      stateView.read.getSlot0([poolId]) as Promise<any>,
      stateView.read.getLiquidity([poolId]) as Promise<any>,
    ]);
    // Extract values from slot0Data
    const sqrtPriceX96 = slot0Data[0];
    const tick = Number(slot0Data[1]);
    const protocolFee = Number(slot0Data[2]);
    const lpFee = Number(slot0Data[3]);

    return {
      exists: true,
      sqrtPriceX96: sqrtPriceX96.toString(),
      tick,
      protocolFee,
      lpFee,
      liquidity: liquidity.toString(),
    };
  } catch (error) {
    console.error("Error getting pool info:", error);
    console.log("Pool does not exist");

    // Return default values indicating pool doesn't exist
    return {
      exists: false,
      sqrtPriceX96: "0",
      tick: 0,
      protocolFee: 0,
      lpFee: 0,
      liquidity: "0",
    };
  }
};
