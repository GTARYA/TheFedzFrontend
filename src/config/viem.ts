import { createPublicClient, http } from 'viem'
import { mainnet,arbitrum } from 'viem/chains'
 
export const publicClient = createPublicClient({
  chain: arbitrum,
  transport: http()
})