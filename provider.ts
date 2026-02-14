import { ethers } from "ethers";

const rpcUrl =
  process.env.NEXT_PUBLIC_ARB_RPC_URL ||
  "https://arb1.arbitrum.io/rpc"; // safe public fallback

export const web3Provider = new ethers.providers.JsonRpcProvider(rpcUrl);
