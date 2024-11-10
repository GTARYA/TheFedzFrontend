import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';
import { http } from 'wagmi';


export const config = getDefaultConfig({
  appName: 'RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    sepolia,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  transports: {[sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/CO_jeJ4sXVaNu6Uu6DL3kLzNPKmUp5bS')},
  ssr: true,
});