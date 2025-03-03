import MockERC20Abi from "../abi/MockERC20_abi.json";
const { ethers } = require('ethers');

export async function balanceOf(tokenAddress: string, account: string, signer: any): Promise<bigint> {
    const tokenAContract = new ethers.Contract(
        tokenAddress,
        MockERC20Abi,
        signer
    );
    return await tokenAContract.balanceOf(account);
}