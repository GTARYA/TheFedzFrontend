import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum,bscTestnet ,base,bsc,sepolia} from '@reown/appkit/networks'
import { TokenInfo } from '../type'
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!
export const networks = [    arbitrum,
sepolia];

export const NFT_ADDR = "0xE073a53a2Ba1709e2c8F481f1D7dbabA1eF611FD";
export enum chainId {
  ARB=42161,
  SEPOLIA=11155111,

}

export const SUPPORTED_NETWORK = [
  chainId.ARB,
  chainId.SEPOLIA,
];


export const ChainId = arbitrum.id;  
export const OWNER_WALLET = "0x833e421145863237e9B372dbA99EcF49C98956fb"

export const ChainInfo: Record<chainId, { config: any; icon: string ,name:string}> = {
  [chainId.ARB]: {
    config: arbitrum,
    icon: "/network/arb.svg",
    name:"Arbitrum"
  },
  [chainId.SEPOLIA]: {
    config: sepolia,
    icon: "/network/eth.svg",
        name:"Sepolia"
  },
};

export const USDT_ADDR: { [key: number]: TokenInfo } = {
  [chainId.ARB]: {
    address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
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