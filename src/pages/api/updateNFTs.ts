import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../libs/dbConnect";
import { NftModel } from "../../models/nftdata";
import {
  TimeSlotSystemAddress,
  ERC721Address,
} from "../../contractAddressArbitrum";
import { erc721Abi } from "viem";
const { ethers } = require("ethers");
import TimeSlotSystemAbi from "../../abi/TimeSlotSystem_abi.json";
import { publicClient } from "../../config/viem";

async function getPlayersTurnOrder() {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://arb1.arbitrum.io/rpc"
    );
    const timeSlotSystemContract = new ethers.Contract(
      TimeSlotSystemAddress,
      TimeSlotSystemAbi,
      provider
    );

    const [currentRound, nextRound] = await timeSlotSystemContract.rounds();
    const playerTurns: { [key: string]: { timestamp: number } } = {};

    for (
      let timestamp = Number(currentRound.startsAt.toString());
      timestamp <= Number(nextRound.startsAt.toString());
      timestamp += Number(currentRound.slotDuration.toString())
    ) {
      try {
        const player = (
          await timeSlotSystemContract.getPlayerByTimestamp(timestamp)
        ).toLowerCase();
        if (player !== "0x0000000000000000000000000000000000000000") {
          if (
            !playerTurns[player] ||
            timestamp < playerTurns[player].timestamp
          ) {
            playerTurns[player] = { timestamp };
          }
        }
      } catch (error) {
        console.error(
          `Error fetching player for timestamp ${timestamp}:`,
          error
        );
      }
    }

    return playerTurns;
  } catch (error) {
    console.error("Error fetching player turns:", error);
    return {};
  }
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await dbConnect();
    const newNFTs = [];
    const playerTurns = await getPlayersTurnOrder();

    const wagmiContract = {
      address: ERC721Address,
      abi: erc721Abi,
    } as const;

    // Step 1: Get total supply
    const totalSupplyResult = await publicClient.readContract({
      ...wagmiContract,
      functionName: "totalSupply",
    });
    const totalSupply = Number(totalSupplyResult);

    const tokenIds = Array.from({ length: totalSupply }, (_, i) =>
      BigInt(i + 1)
    );

    const results = await publicClient.multicall({
      contracts: tokenIds.map((tokenId) => ({
        ...wagmiContract,
        functionName: "ownerOf",
        args: [tokenId],
      })),
    });

    for (const tokenId of tokenIds) {
      let existingNFT = await NftModel.findOne({ tokenId: String(tokenId) });

      if (!existingNFT) {
        existingNFT = new NftModel({
          tokenId: String(tokenId),
          image: `https://ipfs.raribleuserdata.com/ipfs/QmcQLjVn2qTgobAEFrQyDBUbsaWz2YYE6FLcoaDAdavtbk/${tokenId}.webp`,
          name: `The Fedz #${tokenId}`,
          point: 0,
        });
        await existingNFT.save();
      }

      const ownerAddress = results.find((result, index) => {
        return (
          result.status === "success" &&
          tokenIds[index].toString() === String(tokenId)
        );
      })?.result as string;

      if (ownerAddress) {
        const ownerAddressLower = ownerAddress.toLowerCase();
        if (playerTurns[ownerAddressLower]) {
          await NftModel.updateOne(
            { tokenId: String(tokenId) },
            {
              $set: {
                bestTurnsTime: playerTurns[ownerAddressLower].timestamp || 0,
                owner:ownerAddressLower
              },
            }
          );
        }
      }
    }

    const data = await NftModel.find().lean();

    res.status(200).json({
      message: "NFTs updated successfully",
      newNFTsAdded: newNFTs.length,
      newNFTs: data,
    });
  } catch (error) {
    console.error("Error updating NFTs:", error);
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
}
