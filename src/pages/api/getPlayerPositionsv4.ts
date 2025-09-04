import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { ethers } from "ethers";
import postionManagerABI from "../../abi/positionManager.json";
import { web3Provider } from "../../utils/provider";

const POOL_MANAGER_ADDR = "0xd88F38F930b7952f2DB2432Cb002E7abbF3dD869";
const HOOK_ADDR = "0x986522646bF8F57d3b28C5808edE9B1E5ccA0ac0".toLowerCase(); // normalize
const UNISWAP_V4_SUBGRAPH_URL =
  "https://gateway.thegraph.com/api/698277d3f9cff02cebc36c39c54ea91d/subgraphs/id/G5TsTKNi8yhPSV7kycaE23oWbqv9zzNqR49FoEQjzq1r";

const GET_POSITIONS_QUERY = `
  query GetPositions($owner: String!) {
    positions(where: { owner: $owner }) {
      tokenId
      owner
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
      return res.status(400).json({ error: "Owner address is required" });
    }

    const response = await axios.post(UNISWAP_V4_SUBGRAPH_URL, {
      query: GET_POSITIONS_QUERY,
       variables: { owner: (user as string).toLowerCase() },
    });

    const positions = response.data.data?.positions;
    
    if (!positions || positions.length === 0) {
      return res.status(200).json({ positions: [] });
    }

    const positionManager = new ethers.Contract(
      POOL_MANAGER_ADDR,
      postionManagerABI,
      web3Provider
    );

    const positionsWithInfo = await Promise.all(
      positions.map(async (pos: any) => {
        try {
          const [info, liquidity] = await Promise.all([
            positionManager.getPoolAndPositionInfo(pos.tokenId),
            positionManager.getPositionLiquidity(pos.tokenId),
          ]);
          const poolData = info[0];
          const hooksAddr = poolData.hooks?.toLowerCase();

          if (hooksAddr === HOOK_ADDR && Number(liquidity) > 0) {
            return {
              ...pos,
              liquidity: liquidity.toString(),
            };
          } else {
            return null;
          }
        } catch (err) {
          console.error(`Error fetching info for tokenId ${pos.tokenId}:`, err);
          return null;
        }
      })
    );

    const filteredPositions = positionsWithInfo.filter(Boolean);

    return res.status(200).json({ data: filteredPositions, status: true });
  } catch (error: any) {
    console.error("GraphQL error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
