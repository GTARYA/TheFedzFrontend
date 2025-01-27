import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum,bscTestnet ,base,bsc,sepolia} from '@reown/appkit/networks'
import { TokenInfo } from '../type'
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!
export const networks = [    arbitrum,
sepolia];


export enum chainId {
  BSC = 56,
  BSC_TEST = 97,
  ETHEREUM = 1,
  BASE = 8453,
  POLYGON = 137,
  ARB=42161,
}

export const ChainId = arbitrum.id;



export const USDT_ADDR: { [key: number]: TokenInfo } = {
  [chainId.ARB]: {
    address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
    name: "mUSDT",
    decimals: 6,
  },
};

export const FUSD_ADDR: { [key: number]: TokenInfo } = {
  [chainId.ARB]: {
    address: "0x894341be568Eae3697408c420f1d0AcFCE6E55f9",
    name: "mFUSD",
    decimals: 18,
  },
};



export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: false,
  projectId,
  networks,
  transports: {
    [sepolia.id]: http(
      "https://eth-sepolia.g.alchemy.com/v2/CO_jeJ4sXVaNu6Uu6DL3kLzNPKmUp5bS"
    ),
    [arbitrum.id]: http("https://arb1.arbitrum.io/rpc"),
  },
});







export const config = wagmiAdapter.wagmiConfig