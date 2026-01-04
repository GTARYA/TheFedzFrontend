import { createPublicClient, http, getContract } from "viem";
import { STATE_VIEW_CONTRACT } from "../contractAddressArbitrum";
import stateViewABI from "../abi/UniswapStateView_abi.json";
import { poolId } from "../hooks/fedz";

const rpcUrl =
  process.env.NEXT_PUBLIC_ARB_RPC_URL || "https://arb1.arbitrum.io/rpc";

// Create once (module singleton), not inside functions:
const publicClient = createPublicClient({
  transport: http(rpcUrl),
});

export const getStateViewContract = () =>
  getContract({
    address: STATE_VIEW_CONTRACT as `0x${string}`,
    abi: stateViewABI,
    client: publicClient,
  });

export const getPoolInfo = async () => {
  try {
    const stateView = getStateViewContract();

    const [slot0Data, liquidity] = await Promise.all([
      stateView.read.getSlot0([poolId]) as Promise<any>,
      stateView.read.getLiquidity([poolId]) as Promise<any>,
    ]);

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

