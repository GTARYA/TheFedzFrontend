import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { ethers } from "ethers";
import positionManagerABI from "../../abi/positionManager.json";
import { web3Provider } from "../../utils/provider";
import { GRAPHQL_ENDPOINT } from "../../config/staking";
const POOL_MANAGER_ADDR = "0xd88F38F930b7952f2DB2432Cb002E7abbF3dD869";

// GraphQL query to fetch staked NFTs for a user
const GET_STAKEDS_QUERY = `
  query GetStakeds($user: String!) {
    stakeds(first: 1000, where: { user: $user , active: true }) {
      id
      user
      nftId
      nftAddress
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { user } = req.query;

    if (!user) {
      return res.status(400).json({ error: "User address is required" });
    }

    // Fetch staked NFTs from subgraph
    const response = await axios.post(GRAPHQL_ENDPOINT, {
      query: GET_STAKEDS_QUERY,
      variables: { user: (user as string).toLowerCase() },
    });

    const stakeds = response.data.data.stakeds;

    if (!stakeds || stakeds.length === 0) {
      return res.status(200).json({ data: [], status: true });
    }

    // Contract instance
    const positionManager = new ethers.Contract(
      POOL_MANAGER_ADDR,
      positionManagerABI,
      web3Provider
    );

    // Enrich each staked NFT with liquidity info
    const stakedWithInfo = await Promise.all(
      stakeds.map(async (stake: any) => {
        try {
          const liquidity = await Promise.all([
            positionManager.getPositionLiquidity(stake.nftId),
          ]);
         
          return {
            owner: stake.user,
            tokenId: stake.nftId,
            liquidity: liquidity.toString(),
          };
        } catch (err) {
          console.error(
            `Error fetching liquidity for nftId ${stake.nftId}:`,
            err
          );
          return null;
        }
      })
    );

    const filtered = stakedWithInfo.filter(Boolean);

    return res.status(200).json({ data: filtered, status: true });
  } catch (error: any) {
    console.error("GraphQL error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
