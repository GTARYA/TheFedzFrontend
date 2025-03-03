
const { ethers } = require('ethers');

export const formatBalance = (balance: bigint, decimals: number) => {
    return parseFloat(ethers.utils.formatUnits(balance, decimals)).toFixed(2);
}