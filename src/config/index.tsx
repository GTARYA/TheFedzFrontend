import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum,bscTestnet ,base,bsc,sepolia} from '@reown/appkit/networks'
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!
export const networks = [    arbitrum,
sepolia];



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
})

export const config = wagmiAdapter.wagmiConfig