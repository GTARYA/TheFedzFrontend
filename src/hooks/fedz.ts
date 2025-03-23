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

export async function nextRoundAnnouncedNeeded(signer: any) {
    const timeSlotSystemContract = new ethers.Contract(
        TimeSlotSystemAddress,
        TimeSlotSystemAbi,
        signer
    );
    return await timeSlotSystemContract.isLocked();
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
    const [currentRound, nextRound] = await timeSlotSystemContract.rounds();
    if (currentRound.slotDuration > BigInt(0)) {
        return currentRound.slotDuration;
    }
    return nextRound.slotDuration;
}

export async function fetchActingPlayer(signer: any) {
    const timeSlotSystemContract = new ethers.Contract(
        TimeSlotSystemAddress,
        TimeSlotSystemAbi,
        signer
    );
    const [currentRound, nextRound] = await timeSlotSystemContract.rounds();
    const spare = parseInt(currentRound.startsAt.toString()) - Math.round(new Date().getTime()/1000);
    return timeSlotSystemContract.getPlayerByTimestamp(Math.round(new Date().getTime()/1000) + (spare > 0 ? spare : 0));
}

export async function fetchNextActingPlayer(signer: any, duration: bigint) {
    const timeSlotSystemContract = new ethers.Contract(
        TimeSlotSystemAddress,
        TimeSlotSystemAbi,
        signer
    );
    const [currentRound, nextRound] = await timeSlotSystemContract.rounds();
    const spare = parseInt(currentRound.startsAt.toString()) - Math.round(new Date().getTime()/1000);
    return timeSlotSystemContract.getPlayerByTimestamp(Math.round(new Date().getTime()/1000) + (spare > 0 ? spare : 0) + parseInt(duration.toString()));
}


export async function getPlayersTurnOrder(signer: any) {
    const timeSlotSystemContract = new ethers.Contract(
        TimeSlotSystemAddress,
        TimeSlotSystemAbi,
        signer
    );

    // Fetch the current round and next round data
    const [currentRound, nextRound] = await timeSlotSystemContract.rounds();


    const players = [];
    for (let timestamp = Number(currentRound.startsAt.toString()); timestamp <= Number(nextRound.startsAt.toString()); timestamp += Number(currentRound.slotDuration.toString())) {
        const player = await timeSlotSystemContract.getPlayerByTimestamp(timestamp);
    
        // Create a Date object from the timestamp
        const date = new Date(timestamp * 1000); // Multiply by 1000 to convert from seconds to milliseconds
        
        // Format the date as needed, e.g., using toLocaleString() for human-readable date
        const formattedDate = date.toLocaleString(); // Customize this format if needed
    
        // Push player and timestamp along with the formatted date
        players.push({ player, timestamp, formattedDate });
    }
    
    // Sort players by their next turn (timestamp)
    return players.sort((a, b) => a.timestamp - b.timestamp); // Sorting players by their next turn timestamp
}
