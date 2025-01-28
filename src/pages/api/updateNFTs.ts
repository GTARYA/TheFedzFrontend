// pages/api/updateNFTs.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import dbConnect from "../../libs/dbConnect";
import {NftModel} from "../../models/nftdata";
// export const runtime = "edge";
const ALCHEMY_API_URL =
  "https://arb-mainnet.g.alchemy.com/nft/v3/GX7IZQjzj57v70ahk8yHnMCxW-5kfHFl/getNFTsForContract?contractAddress=0xE073a53a2Ba1709e2c8F481f1D7dbabA1eF611FD&withMetadata=true";
const COLLECTION_ADDRESS = "0xE073a53a2Ba1709e2c8F481f1D7dbabA1eF611FD"; // Replace with your NFT collection address


const RARIBLE_API_URL = "https://api.rarible.org/v0.1/items/byCollection";
const API_KEY = "d6007ef0-8a8b-4416-966d-65fe4cfac8ba";

async function fetchNFTsFromRarible() {
  try {
    const response = await axios.get(RARIBLE_API_URL, {
      params: {
        collection: "ARBITRUM:0xE073a53a2Ba1709e2c8F481f1D7dbabA1eF611FD",
      },
      headers: {
        "X-API-KEY": API_KEY,
        accept: "application/json",
      },
    });

    console.log("NFTs fetched successfully:", response.data);
    return response.data.items;
  } catch (error) {
    console.error("Error fetching NFTs",error)
  }
}

async function fetchNFTsFromAlchemy(): Promise<any[]> {
  const response = await axios.get(ALCHEMY_API_URL);
  return response.data.nfts;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await dbConnect();
    const alchemyNFTs = await fetchNFTsFromRarible();
    const newNFTs = [];
    for (const nft of alchemyNFTs) {
      const existingNFT = await NftModel.findOne({ tokenId: nft.tokenId });
      if (!existingNFT) {
        const newNFT = new NftModel({
          tokenId: nft.tokenId,
          image: `https://ipfs.raribleuserdata.com/ipfs/QmcQLjVn2qTgobAEFrQyDBUbsaWz2YYE6FLcoaDAdavtbk/${nft.tokenId}.webp`,
          name: `The Fedz #${nft.tokenId}`,
          point: 0,
        });
        await newNFT.save();
        newNFTs.push(newNFT);
      }
    }

    res.status(200).json({
      message: "NFTs updated successfully",
      newNFTsAdded: newNFTs.length,
      newNFTs,
    });
  } catch (error) {
    console.error("Error updating NFTs:", error);
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
}
