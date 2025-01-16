import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  baseSepolia,
} from "wagmi/chains";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: "TheFedz",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  chains: [
    arbitrum,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
      ? []
      : []),
  ],
  transports: {
    [sepolia.id]: http(
      "https://eth-sepolia.g.alchemy.com/v2/CO_jeJ4sXVaNu6Uu6DL3kLzNPKmUp5bS"
    ),
    [baseSepolia.id]: http("https://base-sepolia-rpc.publicnode.com"),
    [arbitrum.id]: http("https://arb1.arbitrum.io/rpc"),
  },
  ssr: true,
});
