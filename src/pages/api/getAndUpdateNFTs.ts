import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../libs/dbConnect";
import { NftModel } from "../../models/nftdata";

// export const runtime = "edge"; // Edge runtime specification

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to the database
    await dbConnect();

    if (req.method === "GET") {

      const { sortBy, sortOrder } = req.query;

      let sort: Record<string, any> = { tokenId: 1 };
      let order = 1; 

      // Ensure sortBy is a valid string and fallback to "tokenId" if invalid or undefined
      const sortField = typeof sortBy === "string" ? sortBy : "tokenId";

      // If provided, adjust sorting by the "sortBy" and "sortOrder" query params
      if (sortField && (sortField === "tokenId" || sortField === "bestTurnsTime")) {
        sort = { [sortField]: order };
      }

      if (sortOrder === "desc") {
        order = -1;
      }

      sort = { ...sort, [sortField]: order };
      const nfts = await NftModel.find({})
      .sort(sort)  
      .collation({ locale: "en", numericOrdering: true });


      res.status(200).json({
        success: true,
        message: "NFT point updated successfully.",
        nfts,
      })
    }

    if (req.method === "POST") {
      const { tokenId, point } = req.body;

      if (!tokenId || typeof point !== "number") {
        return new Response(
          JSON.stringify({ success: false, message: "Invalid request body." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const updatedNFT = await NftModel.findOneAndUpdate(
        { tokenId },
        { $set: { point } },
        { new: true }
      );

      if (!updatedNFT) {
        res.status(400).json({
          success: false,
          message: "NFT point updated successfully.",
  
        })
      }
      res.status(200).json({
        success: true,
        message: "NFT point updated successfully.",
        updatedNFT,
      })
    }
  } catch (error) {
    console.error("Error in getAndUpdateNFTs API:", error);
    res.status(500).json({ message: "Internal Server Error", error: error });

  }
}
