import type { NextApiRequest, NextApiResponse } from "next";
import { getLogs } from "../../etherscan";
const { ethers } = require("ethers");

async function getPositionIdByPlayer(player: string) {
  const tokenIdsSet = new Set<string>();
  const positionManager = '0xd88F38F930b7952f2DB2432Cb002E7abbF3dD869';
  const poolManager = '0x360E68faCcca8cA495c1B759Fd9EEe466db9FB32';
  const theFedzPoolPositionsByTxHash = new Map<string, any[]>();
  {
      const positionManagerTopic = ethers.utils.defaultAbiCoder.encode(['address'], [positionManager]);
      const modifyLiquidityLogs = await getLogs({
          address: poolManager,
          topic0: '0xf208f4912782fd25c7f114ca3723a2d5dd6f3bcc3ac8db5af63baa85f711d5ec',
          topic1: '0xe2d084a729df207afea549782ed1b9b2054244c3f70dcb27eb3f766063d8d9b7',
          topic2: positionManagerTopic,
          fromBlock: 0,
      }, 'https://api.arbiscan.io/api', '6N6Q2DRTUHGIVZ462FXWCX8AW7JPJTZBQ3');
      for (const log of modifyLiquidityLogs) {
          const relevantLogs = theFedzPoolPositionsByTxHash.get(log.transactionHash) || [];
          theFedzPoolPositionsByTxHash.set(log.transactionHash, relevantLogs);
          relevantLogs.push(log);
      }
  }

  const addressTopic = ethers.utils.defaultAbiCoder.encode(['address'], [player]);

  const records = await getLogs({
      address: positionManager,
      topic0: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      topic1: addressTopic,
      topic2: addressTopic,
      topic1_2_opr: 'or',
      fromBlock: 0,
  }, 'https://api.arbiscan.io/api', '6N6Q2DRTUHGIVZ462FXWCX8AW7JPJTZBQ3');
  for (const record of records) {
      const [from] = ethers.utils.defaultAbiCoder.decode(['address'], record.topic1);
      const [to] = ethers.utils.defaultAbiCoder.decode(['address'], record.topic2);
      const [tokenId] = ethers.utils.defaultAbiCoder.decode(['uint256'], record.topic3);
      const relevantLogs = theFedzPoolPositionsByTxHash.get(record.transactionHash) || [];
      if (relevantLogs.length) {
          if (to === player) {
              tokenIdsSet.add(tokenId.toString());
          } else if (from === player) {
              tokenIdsSet.delete(tokenId.toString());
          }
      }
  }
  const tokenIds = Array.from(tokenIdsSet);
  return tokenIds.length > 0 ? BigInt(tokenIds[0]) : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    res.status(200).json({
      tokenId: (await getPositionIdByPlayer(req.query.player as string))?.toString() || null,
    });
  } catch (error) {
    console.error("Error in getAndUpdateNFTs API:", error);
    res.status(500).json({ message: "Internal Server Error", error: error });

  }
}
