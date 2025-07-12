import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useBalance, useReadContracts } from "wagmi";
import { fetchNFTsForOwner } from "../data/stake";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { InfoLine } from "../components/stake/InfoLine";
import { BorderBeam } from "../components/ui/BorderBeam";
import { useEthersSigner } from "../hooks/useEthersSigner";
import useStake from "../hooks/useStake";
import { toast } from "sonner";
import { FUSD_TOKEN_ADDR, SBFUSD_ADDR, STAKING_ADDR } from "../config/staking";
import stakingABI from "../abi/LpStaking.json";
import { contractStakingData } from "../data/stake";
import { StakedNFT } from "../data/stake";
import { useAppKit } from "@reown/appkit/react";
import { ethers } from "ethers";
import ScaleLoader from "react-spinners/ScaleLoader";
import StakingProgressModal from "../components/Modal/StakingProgressModal";
type Props = {};

function stake({}: Props) {
  const { open, close } = useAppKit();
  const { address } = useAccount();
  const signer = useEthersSigner();
  const [nftData, setNftData] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);
  const {
    loadingBurn,
    loadingStake,
    loadingWithdraw,
    burnToken,
    stake,
    isStakeModalOpen,
    setStakeModalOpen,
    withdraw,
    stakingStatus,
    approvalStatus,
  } = useStake(signer);
  const [stakingData, setStakingData] = useState<{
    rewards: string;
    apr: string;
    cap: string;
    redeemedByPlayerAndRound: string;
    staked: StakedNFT | null;
    redeemedByRound: string;
  }>({
    rewards: "0",
    apr: "0",
    cap: "0",
    redeemedByPlayerAndRound: "0",
    redeemedByRound: "0",
    staked: null,
  });

  const {
    data: sbFusdBalanceData,
    isLoading: sbFusdBalanceLoading,
    refetch: refetchSbFusdBalance,
  } = useBalance({
    address: address,
    token: SBFUSD_ADDR as "0x",
  });

  const {
    data: fusdBalanceData,
    isLoading: fusdBalanceLoading,
    refetch: refetchFusdBalance,
  } = useBalance({
    address: address,
    token: FUSD_TOKEN_ADDR as "0x",
  });

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) return;

      setIsFetching(true);
      try {
        const data = await fetchNFTsForOwner(address);
        setNftData(data);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        toast.error("Failed to fetch NFTs!");
      } finally {
        setIsFetching(false);
      }
    };

    fetchNFTs();
  }, [address]);

  const UpdateData = async () => {
    const data = await contractStakingData(address);
    if (data) {
      setStakingData(data);
    }
  };

  useEffect(() => {
    UpdateData();
  }, [address]);

  const handleStake = async () => {
    if (!address) return open();
    if (!nftData) return toast.info("You don't have LP token");
    await stake(nftData.tokenId);
    await UpdateData();

    setTimeout(async () => {
      await UpdateData();
    }, 10000 / 2); //
  };

  const handleOpenStake = () => {
    if (!address) return open();
    if (!nftData) return toast.info("You don't have LP token");
    setStakeModalOpen(true);
  };

  const handleWithdraw = async () => {
    if (!stakingData.staked) return toast.info("You haven't staked any NFT.");
    await withdraw(Number(stakingData?.staked?.nftId));

    await UpdateData();

    setTimeout(async () => {
      await UpdateData();
    }, 10000 / 2); //
  };

  const redeem = async () => {
    if (!sbFusdBalanceData) return;
    if (Number(sbFusdBalanceData.formatted) <= 0)
      return toast.info("Low Balance");
    await burnToken(
      ethers.utils.parseUnits(sbFusdBalanceData?.formatted, 18).toString()
    );
  };

  return (
    <div className="bg-[#0A0012] overflow-x-clip">
      <Navbar />

      <main className="md:mt-14 mt-10 min-h-screen relative z-[10] p-6">
        <StakingProgressModal
          open={isStakeModalOpen}
          onConfirm={handleStake}
          stakeLoading={loadingStake}
          approvalStatus={approvalStatus}
          stakingStatus={stakingStatus}
          onClose={() => setStakeModalOpen(false)}
        />
        <div className="md:max-w-xl mx-auto border-[#ffffff17] border rounded-2xl relative ">
          <BorderBeam
            duration={8}
            size={400}
            className="from-transparent via-[#33ffdd] to-transparent"
          />

          <div className="px-4 md:px-7 py-4 w-full bg-gradient-to-r from-[#fff0] to-[#ffffff17] border-[#ffffff17] border-b  rounded-2xl ">
            <h1 className="text-lg tracking-wide text-white md:text-2xl font-extrabold flex flex-row items-end py-1 gap-5">
              Stake LP
            </h1>
            <p className="flex flex-row  gap-3 text-gray-400">Earn FUSD</p>
          </div>

          <div className="p-5 md:p-7 flex flex-col gap-y-3">
            <InfoLine
              text="APR"
              load={stakingData.apr == "0"}
              value={`${stakingData.apr}%`}
            />

            <InfoLine
              text="FUSD balance."
              load={fusdBalanceLoading}
              value={Number(fusdBalanceData?.formatted ?? 0).toFixed(2)}
            />
            <InfoLine
              text="Reward"
              load={stakingData.apr == "0"}
              value={
                parseFloat(stakingData.rewards) < 0.01
                  ? "<0.01"
                  : stakingData.rewards
              }
            />

            <InfoLine
              text="Cap"
              load={stakingData.apr == "0"}
              value={stakingData.cap}
            />

            {stakingData.staked && (
              <InfoLine
                text="Staked LP ID"
                load={stakingData.apr == "0"}
                value={`#${stakingData.staked?.nftId}`}
              />
            )}
          </div>

          {/* <div className="grid grid-cols-2 px-5 md:px-7 gap-5   ">
            <div className="col-span-2  font-bold text-[#cecece]">
              Your Staked amount
            </div>
            <div className="flex flex-col justify-between items-center  py-2 bg-[#211526ab] rounded-xl border-white/10 border-[1px] ">
              <h3 className="text-xl font-semibold text-white">
                mFUSD Balance
              </h3>
              <span className="text-lg text-lightblue font-bold">{5}</span>
            </div>
            <div className="flex flex-col justify-between items-center py-2 bg-[#211526ab] rounded-xl border-white/10 border-[1px] ">
              <h3 className="text-xl font-semibold text-white">
                mUSDT Balance
              </h3>
              <span className="text-lg text-lightblue font-bold">{6}</span>
            </div>
          </div> */}

          <div className=" mx-auto gap-4 items-center p-5 md:p-7 ">
            <button
              disabled={
                loadingStake || loadingWithdraw || stakingData.apr == "0"
              }
              onClick={() => {
                stakingData.staked ? handleWithdraw() : handleOpenStake();
              }}
              className="bg-lightblue w-full  text-white  font-medium px-4 py-3 text-xl rounded-xl hover:bg-opacity-50"
            >
              {loadingStake || loadingWithdraw || stakingData.apr == "0" ? (
                <ScaleLoader
                  height={20}
                  loading={true}
                  color="#ffffff"
                  className="text-white"
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
              ) : stakingData.staked ? (
                "Withdraw"
              ) : (
                "Stake"
              )}
            </button>
          </div>
        </div>

        <div className="md:max-w-xl mx-auto border-[#ffffff17] border rounded-2xl mt-8 relative ">
          <div className="px-4 md:px-7 py-4 w-full bg-gradient-to-r from-[#fff0] to-[#ffffff17] border-[#ffffff17] border-b  rounded-2xl ">
            <h1 className="text-lg tracking-wide text-white md:text-2xl font-extrabold flex flex-row items-end py-1 gap-5">
              Burn sbFUSD
            </h1>
            <p className="flex flex-row  gap-3 text-gray-400">Print FUSD</p>
          </div>

          <BorderBeam
            duration={8}
            size={400}
            className="from-transparent via-[#33ffdd] to-transparent"
          />

          <div className="p-5 md:p-7">
            <InfoLine
              text="sbFUSD balance"
              load={sbFusdBalanceLoading}
              value={Number(sbFusdBalanceData?.formatted ?? 0).toFixed(2)}
            />

            <InfoLine
              text="New FUSD Printed"
              load={stakingData.apr == "0"}
              value={Number(stakingData.redeemedByRound)}
            />
          </div>
          <div className="p-5 md:p-7">
            <button
              disabled={loadingBurn}
              onClick={() => redeem()}
              className="bg-lightblue w-full   text-white  font-medium px-4 py-3 text-xl rounded-xl hover:bg-opacity-50"
            >
              {loadingBurn ? (
                <ScaleLoader
                  height={20}
                  loading={true}
                  color="#ffffff"
                  className="text-white"
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
              ) : (
                "Print FUSD"
              )}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default stake;
