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

export async function fetchTokenCount(signer: any) {
    const erc721Contract = new ethers.Contract(
        ERC721Address,
        erc721Abi,
        signer
    );
    return parseInt((await erc721Contract.totalSupply()).toString());
}

export async function nextRoundAnnouncedNeeded(account: string, signer: any) {
    const timeSlotSystemContract = new ethers.Contract(
        TimeSlotSystemAddress,
        TimeSlotSystemAbi,
        signer
    );
    return await playerByCurrentTimestamp(signer) === account && await timeSlotSystemContract.isRoundLocked();
}

async function playerByCurrentTimestamp(signer: any) {
    const timeSlotSystemContract = new ethers.Contract(
        TimeSlotSystemAddress,
        TimeSlotSystemAbi,
        signer
    );
    return timeSlotSystemContract.getPlayerByTimestamp(Math.round(new Date().getTime()/1000));
}

export async function isActingPlayer(account: string, signer: any) {
    return await playerByCurrentTimestamp(signer) === account;
}

export async function fetchSlotDuration(signer: any) {
    const timeSlotSystemContract = new ethers.Contract(
        TimeSlotSystemAddress,
        TimeSlotSystemAbi,
        signer
    );
    return timeSlotSystemContract.slotDuration();
}

export async function fetchActingPlayer(signer: any) {
    const timeSlotSystemContract = new ethers.Contract(
        TimeSlotSystemAddress,
        TimeSlotSystemAbi,
        signer
    );
    return timeSlotSystemContract.getPlayerByTimestamp(Math.round(new Date().getTime()/1000));
}

export async function fetchNextActingPlayer(signer: any, duration: bigint) {
    const timeSlotSystemContract = new ethers.Contract(
        TimeSlotSystemAddress,
        TimeSlotSystemAbi,
        signer
    );
    return timeSlotSystemContract.getPlayerByTimestamp(Math.round(new Date().getTime()/1000) + parseInt(duration.toString()));
}