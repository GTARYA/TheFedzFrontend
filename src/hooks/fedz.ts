import { erc721Abi } from "viem";
import erc721ABI from "../abi/NFTABI.json"
import TimeSlotSystemAbi from "../abi/TimeSlotSystem_abi.json";
import {
  TimeSlotSystemAddress,
  ERC721Address,
} from "../contractAddressArbitrum";
import axios from "axios";

const { ethers } = require("ethers");

class NotNFTHolderError extends Error {
  constructor() {
    super("Account is not an NFT holder");
  }
}
class NotActingPlayer extends Error {
  constructor() {
    super("NotActingPlayer: Access not allowed");
  }
}

export async function validateAccessAllowance(account: string, signer: any) {
  if (!(await isNftHolder(account, signer))) {
    throw new NotNFTHolderError();
  }
  if (!(await isActingPlayer(account, signer))) {
    throw new NotActingPlayer();
  }
  return true;
}

export async function isNftHolder(account: string, signer: any) {
  const erc721Contract = new ethers.Contract(ERC721Address, erc721Abi, signer);
  return (await erc721Contract.balanceOf(account)) > BigInt(0);
}

export async function fetchTokenCount(signer: any) {
  const erc721Contract = new ethers.Contract(ERC721Address, erc721Abi, signer);
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
  return timeSlotSystemContract.getPlayerByTimestamp(
    Math.round(new Date().getTime() / 1000)
  );
}

export async function isActingPlayer(account: string, signer: any) {
  return (await playerByCurrentTimestamp(signer)) === account;
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
  const spare =
    parseInt(currentRound.startsAt.toString()) -
    Math.round(new Date().getTime() / 1000);
  return timeSlotSystemContract.getPlayerByTimestamp(
    Math.round(new Date().getTime() / 1000) + (spare > 0 ? spare : 0)
  );
}

export async function fetchNextActingPlayer(signer: any, duration: bigint) {
  const timeSlotSystemContract = new ethers.Contract(
    TimeSlotSystemAddress,
    TimeSlotSystemAbi,
    signer
  );
  const [currentRound, nextRound] = await timeSlotSystemContract.rounds();
  const spare =
    parseInt(currentRound.startsAt.toString()) -
    Math.round(new Date().getTime() / 1000);
  return timeSlotSystemContract.getPlayerByTimestamp(
    Math.round(new Date().getTime() / 1000) +
      (spare > 0 ? spare : 0) +
      parseInt(duration.toString())
  );
}

export async function listMyNFTs(address: string) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://arb1.arbitrum.io/rpc"
    );
    const contract = new ethers.Contract(ERC721Address, erc721ABI, provider);
    const nftHexArray = await contract.listMyNFTs(address); // Returns hex token IDs
    const nfts = nftHexArray.map((hex: string) => Number(ethers.BigNumber.from(hex).toString()));

    return nfts;
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return [];
  }
}

interface TurnOrderEntry {
  name: string;
  tokenId: number;
  timestamp: number;
  image: string;
  point: number;
}

interface LatestEventResponse {
  turnOrder: TurnOrderEntry[];
  slotDuration: number;
  startsAt: number;
  roundNumber:number
}

export async function getLatestEventForTurn(): Promise<LatestEventResponse> {

  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://arb1.arbitrum.io/rpc"
    );
    const contract = new ethers.Contract(
      TimeSlotSystemAddress,
      TimeSlotSystemAbi,
      provider
    );

    const filter = contract.filters.NextRoundAnnouncement();

    const [events, nftPointsResponse] = await Promise.all([
      contract.queryFilter(filter),
      axios.get("/api/getAndUpdateNFTs").then((res) => res.data.nfts),
    ]);

    if (events.length === 0) {
      console.log("No recent NextRoundAnnouncement events found.");
      return { turnOrder: [], slotDuration: 0, startsAt: 0,roundNumber:0 };
    }


    const latestEvent = events[events.length - 1].args;
    const slotDuration = Number(latestEvent.slotDuration);
    const startsAt = Number(latestEvent.startsAt);
    const roundNumber = Number(latestEvent.roundNumber);

    const nftPointsMap = new Map(
      nftPointsResponse.map((nft: any) => [Number(nft.tokenId), nft.point])
    );

    const turnOrder = latestEvent.turnOrder.map(
      (tokenHex: string, index: number) => {
        const tokenId = Number(ethers.BigNumber.from(tokenHex).toString());
        return {
          name: `The Fedz #${tokenId}`,
          tokenId,
          timestamp: startsAt + index * slotDuration,
          image: `https://ipfs.raribleuserdata.com/ipfs/QmcQLjVn2qTgobAEFrQyDBUbsaWz2YYE6FLcoaDAdavtbk/${tokenId}.webp`,
          point: nftPointsMap.get(tokenId) || 0, 
        };
      }
    );

    return {turnOrder,slotDuration,startsAt,roundNumber};
  } catch (error) {
    console.error("Error fetching latest event:", error);
    return {
      turnOrder:[],
      slotDuration:0,
      startsAt:0,
      roundNumber:0
    };
  }
}
export async function getPlayersTurnOrder(signer: any) {
  const timeSlotSystemContract = new ethers.Contract(
    TimeSlotSystemAddress,
    TimeSlotSystemAbi,
    signer
  );
  const [currentRound, nextRound] = await timeSlotSystemContract.rounds();

  const players = [];
  for (
    let timestamp = Number(currentRound.startsAt.toString());
    timestamp <= Number(nextRound.startsAt.toString());
    timestamp += Number(currentRound.slotDuration.toString())
  ) {
    const player = await timeSlotSystemContract.getPlayerByTimestamp(timestamp);
    const date = new Date(timestamp * 1000); 
    const formattedDate = date.toLocaleString();
    players.push({ player, timestamp, formattedDate });
  }

  // Sort players by their next turn (timestamp)
  return players.sort((a, b) => a.timestamp - b.timestamp); // Sorting players by their next turn timestamp
}
