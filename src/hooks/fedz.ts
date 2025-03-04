import { erc721Abi } from "viem";
import TimeSlotSystemAbi from "../abi/TimeSlotSystem_abi.json";
import { TimeSlotSystemAddress, ERC721Address } from "../contractAddressArbitrum";

const { ethers } = require('ethers');

class NotNFTHolderError extends Error {
    constructor() {
        super('Account is not an NFT holder');
    }
}
class NotActingPlayer extends Error {
    constructor() {
        super('NotActingPlayer: Access not allowed');
    }
}

export async function validateAccessAllowance(account: string, signer: any) {
    if (!await isNftHolder(account, signer)) {
        throw new NotNFTHolderError();
    }
    if (!await isActingPlayer(account, signer)) {
        throw new NotActingPlayer();
    }
    return true;
}


export async function isNftHolder(account: string, signer: any) {
    const erc721Contract = new ethers.Contract(
        ERC721Address,
        erc721Abi,
        signer
    );
    return await erc721Contract.balanceOf(account) > BigInt(0);
}

export async function isActingPlayer(account: string, signer: any) {
    const timeSlotSystemContract = new ethers.Contract(
        TimeSlotSystemAddress,
        TimeSlotSystemAbi,
        signer
    );
    return await timeSlotSystemContract.getCurrentPlayer() === account;
}