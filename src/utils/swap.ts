import { ethers } from "ethers";

const UNISWAP_V2_ROUTER_ADDRESS = "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24"; // Uniswap V2 Router address
const UNISWAP_V2_PAIR = "0x342dEe677FEA9ECAA71A9490B08f9e4ADDEf79D6"
let provider = new ethers.JsonRpcProvider("https://arbitrum.llamarpc.com")
import { ChainId, Token, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import routerAbi from "../abi/uniswapRouter.json"
import erc20Abi from "../abi/erc20.json"
// Helper function to swap exact tokens for tokens
export async function swapExactTokensForTokens(
  signer: ethers.Signer,
  tokenA: string,
  tokenB: string,
  amountIn: string,
  amountOutMin: string,
  recipient: string,
  slippageTolerance = 0.05 // Default slippage tolerance: 1%
): Promise<void> {
  try {
    // Initialize Uniswap Router contract
    const uniswapRouter = new ethers.Contract(
      UNISWAP_V2_ROUTER_ADDRESS,
      routerAbi,
      signer
    );

    // Step 1: Approve Uniswap Router to spend your tokens
    const tokenAContract = new ethers.Contract(
      tokenA,
      erc20Abi,
      signer
    )

    const balanceOf = await tokenAContract.balanceOf(await signer.getAddress());

    

    const allowance = await tokenAContract.allowance(await signer.getAddress(), UNISWAP_V2_ROUTER_ADDRESS);
    console.log(allowance,"allowance");
    
    
    const amountInParsed = ethers.parseUnits(amountIn, 6); // Token A decimals: 6
//    console.log("Approving token...");
      const approveTx = await tokenAContract.approve(UNISWAP_V2_ROUTER_ADDRESS,amountInParsed);
      await approveTx.wait();
       console.log("Token approved!")

    // Step 2: Determine the optimal amountOutMin using getAmountsOut
    const path = [tokenA, tokenB];
  
    const amountsOut = await uniswapRouter.getAmountsOut(amountInParsed, path);
   
    const expectedAmountOut = Number(amountsOut[1]); // Token B output (BigNumber)

    const slippageValue = expectedAmountOut*(1- slippageTolerance)
    
    // Calculate minimum amount out
    const amountOutMin = expectedAmountOut-(slippageValue);


    // Step 3: Perform the swap
    const deadline = Math.floor(Date.now() / 1000) + 60 * 5; // 20 minutes from now

    console.log(amountInParsed,"amountInParsed");
    console.log(amountOutMin,"amountOutMin");

     const swapTx = await uniswapRouter.swapExactTokensForTokens(
         amountInParsed,
         amountOutMin.toFixed(0),
         path,
         recipient,
         deadline
       );

    // console.log("Transaction sent:", swapTx.hash);
    // const receipt = await swapTx.wait();
    // console.log("Transaction mined:", receipt);
  } catch (error) {
    console.error("Error in swapExactTokensForTokens:", error);
    throw error;
  }
}
