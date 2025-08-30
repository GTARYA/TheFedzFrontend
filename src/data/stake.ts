import { ethers } from "ethers";
import axios from "axios";
import {
  LP_ADDR,
  STAKING_ADDR,
  FUSD_VAULT_ADDR,
  TimeSlotSystemAddress,
  GRAPHQL_ENDPOINT,
} from "../config/staking";
import LpStakeABI from "../abi/LpStaking.json";
import fusdVaultABI from "../abi/SbFUSDVault.json";
import timeSlotABI from "../abi/TimeSlotSystem_abi.json";
import { PositionInfo } from "../type";
import { web3Provider as provider } from "../utils/provider";

export async function fetchPlayerStakedNFTs(
  player: string
): Promise<PositionInfo[]> {
  const response = await axios.get(`/api/getStakedNFTs?user=${player}`);
  const data = response.data?.data;
  if (!Array.isArray(data)) return [];

  return data;
}

export const getPredictRewards = async (data: PositionInfo[]) => {
  const stakingContract = new ethers.Contract(
    STAKING_ADDR,
    LpStakeABI.abi,
    provider
  );
  const timestamp = Math.floor(Date.now() / 1000);
  const promises = data.map((e) =>
    stakingContract.predictRewards(timestamp, e.tokenId)
  );
  const rewards = await Promise.all(promises);
  const totalReward = rewards.reduce(
    (acc, reward) => acc.add(reward),
    ethers.BigNumber.from(0)
  );

  return {
    totalReward: ethers.utils.formatUnits(totalReward, 18),
  };
};

export const contractStakingData = async (user?: string) => {
  try {
    const stakingContract = new ethers.Contract(
      STAKING_ADDR,
      LpStakeABI.abi,
      provider
    );
    const SbFUSDVaultContract = new ethers.Contract(
      FUSD_VAULT_ADDR,
      fusdVaultABI,
      provider
    );
    const timeSlotSystemContract = new ethers.Contract(
      TimeSlotSystemAddress,
      timeSlotABI,
      provider
    );

    const timestamp = Math.floor(Date.now() / 1000);
    const Round = await timeSlotSystemContract.rounds();
    const activeRound = Round?.[0]?.[0]?.toString();
    const redeemedPromise = user
      ? SbFUSDVaultContract.redeemedByPlayerAndRound(
          user.toLowerCase(),
          activeRound
        )
      : Promise.resolve(ethers.BigNumber.from(0));

    const [apr, cap, redeemedByPlayerAndRound, redeemedByRound] =
      await Promise.all([
        stakingContract.apr(),
        SbFUSDVaultContract.redemptionCap(),
        redeemedPromise,
        SbFUSDVaultContract.redeemedByRound(activeRound),
      ]);

    return {
      apr: (Number(apr.toString()) / 100).toString(),
      cap: ethers.utils.formatUnits(cap, 18),
      redeemedByPlayerAndRound: ethers.utils.formatUnits(
        redeemedByPlayerAndRound,
        18
      ),
      redeemedByRound: ethers.utils.formatUnits(redeemedByRound, 18),
    };
  } catch (error) {
    console.error("Error fetching contract data:", error);
    return {
      apr: "0",
      cap: "0",
      redeemedByPlayerAndRound: "0",
      redeemedByRound: "",
    };
  }
};
