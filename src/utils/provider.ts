import { ethers } from "ethers";
export const web3Provider = new ethers.providers.JsonRpcProvider(
  "https://arb1.arbitrum.io/rpc"
);