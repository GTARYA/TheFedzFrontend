
const { ethers } = require('ethers');

export const formatBalance = (balance: bigint, decimals: number) => {
    return parseFloat(ethers.utils.formatUnits(balance, decimals)).toFixed(2);
}

export const formatDuration = (duration: bigint) => {
    const durationInSec = parseInt(duration.toString() || '0');
    if (durationInSec < 60) {
        return `${durationInSec}s`;
    }
    if (durationInSec < 3600) {
        return `${Math.floor(durationInSec / 60)}m`;
    }
    return `${Math.floor(durationInSec / 3600)}h`;
}