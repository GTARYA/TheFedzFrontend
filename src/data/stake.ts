import { ethers } from "ethers";
import { LP_ADDR, STAKING_ADDR, FUSD_VAULT_ADDR,TimeSlotSystemAddress } from "../config/staking";
import LpStakeABI from "../abi/LpStaking.json";
import fusdVaultABI from "../abi/SbFUSDVault.json";
import timeSlotABI from "../abi/TimeSlotSystem_abi.json"
import postionManagerABI from "../abi/positionManager.json"

export async function fetchNFTsForOwner(
    ownerAddress: string,
    contractAddress = "0xd88F38F930b7952f2DB2432Cb002E7abbF3dD869"
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
  

  export const contractData = async (nftId: number) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider("https://arb-mainnet.g.alchemy.com/v2/V-XZ3MOv9AXdTc6PdKJvcMcBxYMSDi3F");
      const stakingContract = new ethers.Contract(STAKING_ADDR, LpStakeABI.abi, provider);
  
      // Fetching the predictRewards, getAPR, and getCap values using contract calls
      const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  
      // Use promise.all to fetch all values simultaneously
      const [rewards, apr, cap] = await Promise.all([
        stakingContract.predictRewards(timestamp, nftId), // Fetch predicted rewards
        stakingContract.getAPR(), // Fetch APR value
        stakingContract.getCap() // Fetch cap value
      ]);
  
      // You may want to format the values depending on their return types (e.g., formatUnits for tokens)
      return {
        rewards: ethers.utils.formatUnits(rewards, 18), // Assuming rewards are in wei
        apr: ethers.utils.formatUnits(apr, 18), // Assuming APR is in wei
        cap: ethers.utils.formatUnits(cap, 18), // Assuming cap is in wei
      };
    } catch (error) {
      console.error("Error fetching contract data:", error);
  
    }
  };