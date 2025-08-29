import { ethers } from "ethers";
import axios from "axios";
import {
  LP_ADDR,
  STAKING_ADDR,
  FUSD_VAULT_ADDR,
  TimeSlotSystemAddress,
  GRAPHQL_ENDPOINT
} from "../config/staking";
import LpStakeABI from "../abi/LpStaking.json";
import fusdVaultABI from "../abi/SbFUSDVault.json";
import timeSlotABI from "../abi/TimeSlotSystem_abi.json";
import postionManagerABI from "../abi/positionManager.json";
import { getLogs } from "../etherscan";
import { PositionInfo } from "../type";
export async function fetchNFTsForOwner(
  ownerAddress: string,
  contractAddress = "0xd88f38f930b7952f2db2432cb002e7abbf3dd869"
): Promise<any | null> {
  const url = `https://arb-mainnet.g.alchemy.com/nft/v3/98rABqQNNFKxptM6OVawc6gynJRl7o4k/getNFTsForOwner?owner=${ownerAddress}&contractAddresses[]=${contractAddress}&withMetadata=true&pageSize=100`;

  const options: RequestInit = {
    method: "GET",
    headers: { accept: "application/json" },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    const ownedNfts = data.ownedNfts || [];

    if (ownedNfts.length === 0) {
      console.log("No NFTs found for this contract address.");
      return null;
    }

    const filteredNFTs = ownedNfts.filter((e: any) => {
      const name = e.name || ""; // Ensure name is a string
      return (
        e.contract.address.toLowerCase() === contractAddress.toLowerCase() &&
        name.toUpperCase().includes("FUSD")
      );
    });

    return filteredNFTs[0];
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return null;
  }
}

export interface StakedNFT {
  id: string;
  user: string;
  nftId: string;
  nftAddress: string;
  active: boolean;
}

interface StakedNFTResponse {
  stakeds: StakedNFT[];
}

// Function to get staked data from Etherscan logs
export const getStakedDataFromLogs = async (user: string): Promise<StakedNFT | null> => {
  try {
    // Get the keccak256 hash of the Staked event signature
    const stakedEventSignature = "Staked(address,uint256,uint256)";
    const stakedTopic0 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(stakedEventSignature));
    
    // Get the keccak256 hash of the Withdraw event signature
    const withdrawEventSignature = "Withdraw(address,uint256)";
    const withdrawTopic0 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(withdrawEventSignature));
    
    // Get user address as topic1 (padded to 32 bytes)
    const userTopic = ethers.utils.hexZeroPad(user.toLowerCase(), 32);
    
    // Get staked events for this user
    const stakedLogs = await getLogs({
      address: STAKING_ADDR,
      topic0: stakedTopic0,
      topic1: userTopic,
      fromBlock: 0,
      toBlock: 'latest'
    });
    
    // Get withdraw events for this user
    const withdrawLogs = await getLogs({
      address: STAKING_ADDR,
      topic0: withdrawTopic0,
      topic1: userTopic,
      fromBlock: 0,
      toBlock: 'latest'
    });
    
    // Create a map of withdrawn NFT IDs
    const withdrawnNFTs = new Set();
    withdrawLogs.forEach((log: any) => {
      // topic2 contains the nftId
      const nftId = ethers.utils.defaultAbiCoder.decode(['uint256'], log.topic2)[0].toString();
      withdrawnNFTs.add(nftId);
    });
    
    // Find the most recent staked NFT that hasn't been withdrawn
    let latestStakedNFT: StakedNFT | null = null;
    let latestBlockNumber = 0;
    
    stakedLogs.forEach((log: any) => {
      // topic2 contains the nftId
      const nftId = ethers.utils.defaultAbiCoder.decode(['uint256'], log.topic2)[0].toString();
      
      // Check if this NFT hasn't been withdrawn
      if (!withdrawnNFTs.has(nftId) && log.blockNumber > latestBlockNumber) {
        latestBlockNumber = log.blockNumber;
        latestStakedNFT = {
          id: `${user.toLowerCase()}-${nftId}`,
          user: user.toLowerCase(),
          nftId: nftId,
          nftAddress: LP_ADDR,
          active: true
        };
      }
    });
    
    return latestStakedNFT;
  } catch (error) {
    console.error("Error fetching staked data from logs:", error);
    return null;
  }
};

export async function fetchPlayerStakedNFTs(
  player: string
): Promise<PositionInfo[]> {
  const response = await axios.get(`/api/getStakedNFTs?user=${player}`);
  const data = response.data?.data;

  if (!Array.isArray(data)) return [];

  return data;
}


export const contractStakingData = async (user?: string) => {
  try {
    let staked: StakedNFT | null = null;

    if (user) {
      // Replace GraphQL query with Etherscan logs
      staked = await getStakedDataFromLogs(user);
    }

    const provider = new ethers.providers.JsonRpcProvider(
      "https://arb-mainnet.g.alchemy.com/v2/V-XZ3MOv9AXdTc6PdKJvcMcBxYMSDi3F"
    );

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

    const rewardsPromise =
      user && staked
        ? stakingContract.predictRewards(timestamp, staked.nftId)
        : Promise.resolve(ethers.BigNumber.from(0));

    const redeemedPromise =
      user && staked
        ? SbFUSDVaultContract.redeemedByPlayerAndRound(
            user.toLowerCase(),
            activeRound
          )
        : Promise.resolve(ethers.BigNumber.from(0));

    const [rewards, apr, cap, redeemedByPlayerAndRound,redeemedByRound] = await Promise.all([
      rewardsPromise,
      stakingContract.apr(),
      SbFUSDVaultContract.redemptionCap(),
      redeemedPromise,
      SbFUSDVaultContract.redeemedByRound(activeRound)
    ]);

    

    return {
      rewards: ethers.utils.formatUnits(rewards, 18),
      apr: (Number(apr.toString()) / 100).toString(),
      cap: ethers.utils.formatUnits(cap, 18),
      redeemedByPlayerAndRound: ethers.utils.formatUnits(
        redeemedByPlayerAndRound,
        18
      ),
      staked,
      redeemedByRound:ethers.utils.formatUnits(
        redeemedByRound,
        18
      )
    };
  } catch (error) {
    console.error("Error fetching contract data:", error);
    return {
      rewards: "0",
      apr: "0",
      cap: "0",
      redeemedByPlayerAndRound: "0",
      staked: null,
      redeemedByRound:""
    };
  }
};
