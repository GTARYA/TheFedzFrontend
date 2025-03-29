import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import { LP_ADDR, STAKING_ADDR, FUSD_VAULT_ADDR,TimeSlotSystemAddress } from "../config/staking";
import nftABI from "../abi/NFTABI.json";
import LpStakeABI from "../abi/LpStaking.json";
import fusdVaultABI from "../abi/SbFUSDVault.json";
import timeSlotABI from "../abi/TimeSlotSystem_abi.json"
import postionManagerABI from "../abi/positionManager.json"
const useStake = (signer: any) => {
  const [loading, setLoading] = useState(false);

  const stake = async (id: string) => {
      console.log(signer);
      
      if (!signer) {
        toast.error("Wallet not connected!");
        return;
      }

      setLoading(true);
      let approveToastID: any = null;
      let stakeToastID: any = null;

      try {
        const uniswapNFT = new ethers.Contract(LP_ADDR, postionManagerABI, signer);
        
        
        const stakingContract = new ethers.Contract(
          STAKING_ADDR,
          LpStakeABI.abi,
          signer
        );

        // Step 1: Approval Process
        approveToastID = toast.loading("Approving NFT for staking...");
        const approveTx = await uniswapNFT.approve(STAKING_ADDR, id);
        await approveTx.wait();
        toast.dismiss(approveToastID);
        toast.success("NFT approved successfully!");

        // Step 2: Staking Process
        stakeToastID = toast.loading("Staking NFT...");
        const stakeTx = await stakingContract.stake(id);
        await stakeTx.wait();
        toast.dismiss(stakeToastID);
        toast.success("NFT staked successfully!");
      } catch (error: any) {
        console.error("Staking error:", error);

        // Ensure any active toasts are dismissed before showing error
        if (approveToastID) toast.dismiss(approveToastID);
        if (stakeToastID) toast.dismiss(stakeToastID);

        toast.error(error.reason || "Failed to stake NFT!");
      } finally {
        setLoading(false);
      }
    }

  const withdraw =
    async (id: number) => {
      if (!signer) {
        toast.error("Wallet not connected!");
        return;
      }

      setLoading(true);
      let withdrawToastID: any = null;

      try {
        const stakingContract = new ethers.Contract(
          STAKING_ADDR,
          LpStakeABI.abi,
          signer
        );

        // Step 1: Withdraw NFT
        withdrawToastID = toast.loading("Withdrawing NFT...");
        const withdrawTx = await stakingContract.withdraw(id);
        await withdrawTx.wait();
        toast.dismiss(withdrawToastID);
        toast.success("NFT withdrawn successfully!");
      } catch (error: any) {
        console.error("Withdraw error:", error);
        if (withdrawToastID) toast.dismiss(withdrawToastID);
        toast.error(error.reason || "Failed to withdraw NFT!");
      } finally {
        setLoading(false);
      }
    }

  const burnToken = useCallback(async (amount: string) => {
    if (!signer) {
      toast.error("Wallet not connected!");
      return;
    }

    setLoading(true);
    let burnToastID: any = null;

    try {
      const SbFUSDVaultContract = new ethers.Contract(FUSD_VAULT_ADDR, fusdVaultABI, signer);
      const PlayerContract = new ethers.Contract(TimeSlotSystemAddress, timeSlotABI, signer);

      burnToastID = toast.loading("Checking player & burning tokens...");

      const currentPlayer = await PlayerContract.getCurrentPlayer();
      if (signer._address.toLowerCase() !== currentPlayer.toLowerCase()) {
        toast.dismiss(burnToastID);
        toast.error("You are not the current player!");
        setLoading(false);
        return;
      }

      // Step 1: Burn Tokens
      const burnTx = await SbFUSDVaultContract.redeem(amount);
      await burnTx.wait();

      toast.dismiss(burnToastID);
      toast.success("Tokens burned successfully!");
    } catch (error: any) {
      console.error("Burn error:", error);
      if (burnToastID) toast.dismiss(burnToastID);
      toast.error(error.reason || "Failed to burn tokens!");
    } finally {
        setLoading(false);
    }
  }, [signer]);

  return { stake, loading, withdraw,burnToken };
};

export default useStake;
