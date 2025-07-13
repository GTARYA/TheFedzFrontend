import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import {
  LP_ADDR,
  STAKING_ADDR,
  FUSD_VAULT_ADDR,
  TimeSlotSystemAddress,
} from "../config/staking";
import nftABI from "../abi/NFTABI.json";
import LpStakeABI from "../abi/LpStaking.json";
import fusdVaultABI from "../abi/SbFUSDVault.json";
import timeSlotABI from "../abi/TimeSlotSystem_abi.json";
import postionManagerABI from "../abi/positionManager.json";
import { StepStatus } from "../type";
const useStake = (signer: any) => {
  const [loadingStake, setLoadingStake] = useState(false);
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const [loadingBurn, setLoadingBurn] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<StepStatus>("idle");
  const [stakingStatus, setStakingStatus] = useState<StepStatus>("idle");
  const [stakeModalOpen, setStakeModalOpen] = useState(false);

  const stake = async (id: string) => {
    if (!signer) {
      toast.error("Wallet not connected!");
      return;
    }

    setLoadingStake(true);
    setApprovalStatus("idle");
    setStakingStatus("idle");

    let approveToastID: any = null;
    let stakeToastID: any = null;
    let approved = false;

    const uniswapNFT = new ethers.Contract(LP_ADDR, postionManagerABI, signer);
    const stakingContract = new ethers.Contract(
      STAKING_ADDR,
      LpStakeABI.abi,
      signer
    );

    // Step 1: Approval Process
    try {
      approveToastID = toast.loading("Approving NFT for staking...");
      setApprovalStatus("loading");

      const approveTx = await uniswapNFT.approve(STAKING_ADDR, id);
      await approveTx.wait();

      toast.dismiss(approveToastID);
      toast.success("NFT approved successfully!");
      setApprovalStatus("done");
      approved = true;
    } catch (error: any) {
      console.error("Approval error:", error);
      if (approveToastID) toast.dismiss(approveToastID);
      toast.error(error.reason || "NFT approval failed!");
      setApprovalStatus("error");
      setLoadingStake(false);
      return; // Stop further execution if approval fails
    }

    if (!approved) return;

    // Step 2: Staking Process
    try {
      stakeToastID = toast.loading("Staking NFT...");
      setStakingStatus("loading");

      const stakeTx = await stakingContract.stake(id);
      await stakeTx.wait();

      toast.dismiss(stakeToastID);
      toast.success("NFT staked successfully!");
      setStakingStatus("done");
      setStakeModalOpen(false);
    } catch (error: any) {
      console.error("Staking error:", error);
      if (stakeToastID) toast.dismiss(stakeToastID);
      toast.error(error.reason || "Staking failed!");
      setStakingStatus("error");
    } finally {
      setLoadingStake(false);
    }
  };

  const withdraw = async (id: number) => {
    if (!signer) {
      toast.error("Wallet not connected!");
      return;
    }

    setLoadingWithdraw(true);
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
      setLoadingWithdraw(false);
    }
  };

  const burnToken = useCallback(
    async (amount: string) => {
      if (!signer) {
        toast.error("Wallet not connected!");
        return;
      }

      setLoadingBurn(true);
      let burnToastID: any = null;

      try {
        const SbFUSDVaultContract = new ethers.Contract(
          FUSD_VAULT_ADDR,
          fusdVaultABI,
          signer
        );
        const PlayerContract = new ethers.Contract(
          TimeSlotSystemAddress,
          timeSlotABI,
          signer
        );

        burnToastID = toast.loading("Checking player & burning tokens...");

        const currentPlayer = await PlayerContract.getCurrentPlayer();
        if (signer._address.toLowerCase() !== currentPlayer.toLowerCase()) {
          toast.dismiss(burnToastID);
          toast.error("You are not the current player!");
          setLoadingBurn(false);
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
        setLoadingBurn(false);
      }
    },
    [signer]
  );

  return {
    stake,
    loadingStake,
    loadingWithdraw,
    loadingBurn,
    withdraw,
    burnToken,
    approvalStatus,
    stakingStatus,
    setStakeModalOpen,
    isStakeModalOpen: stakeModalOpen,
  };
};

export default useStake;
