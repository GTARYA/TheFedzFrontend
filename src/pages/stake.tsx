import React,{useState,useEffect} from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount,useBalance,useReadContracts } from "wagmi";
import { fetchNFTsForOwner } from "../data/stake";
import Navbar from "../components/Navbar";
import { InfoLine } from "../components/stake/InfoLine";
import { BorderBeam } from "../components/ui/BorderBeam";
import { useEthersSigner } from "../hooks/useEthersSigner";
import useStake from "../hooks/useStake";
import { toast } from "sonner";
import { FUSD_TOKEN_ADDR ,SBFUSD_ADDR,STAKING_ADDR} from "../config/staking";
import stakingABI from "../abi/LpStaking.json"
type Props = {};

function stake({}: Props) {
  const { address } = useAccount();
  const signer = useEthersSigner();
  const [nftData, setNftData] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);
  const { loading, burnToken, stake, withdraw } = useStake(signer);

  const {
    data: sbFusdBalanceData,
    isLoading: sbFusdBalanceLoading,
    refetch: refetchSbFusdBalance,
  } = useBalance({
    address: address,
    token:SBFUSD_ADDR as "0x"
  });

  const {
    data: fusdBalanceData,
    isLoading: fusdBalanceLoading,
    refetch: refetchFusdBalance,
  } = useBalance({
    address: address,
    token:FUSD_TOKEN_ADDR as "0x"
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

  const handleStake = async () => {
    console.log(nftData);

    if (!nftData) return toast.info("You don't have LP token");

    await stake(nftData.tokenId);
  };

  return (
    <div className="bg-[#0A0012] overflow-x-clip">
      <Navbar />

      <main className="md:mt-14 mt-10 min-h-screen relative z-[10] p-6">
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
            <InfoLine text="APR" load={false} value={0} />

            <InfoLine text="FUSD balance." load={fusdBalanceLoading} value={Number(fusdBalanceData?.formatted).toFixed(2)} />
            <InfoLine text="Reward" load={false} value={0} />
            <InfoLine text="Cap" load={false} value={0} />
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
              disabled={loading}
              onClick={() => {
                handleStake();
              }}
              className="bg-lightblue w-full  text-white  font-medium px-4 py-3 text-xl rounded-xl hover:bg-opacity-50"
            >
              Stake
            </button>
          </div>
        </div>

        <div className="md:max-w-xl mx-auto border-[#ffffff17] border rounded-2xl mt-8 py-3 px-5 relative ">
          <BorderBeam
            duration={8}
            size={400}
            className="from-transparent via-[#33ffdd] to-transparent"
          />

          <div className="text-white uppercase text-center text-xl font-medium py-2">
            Burn sbFUSD to mint FUSD
          </div>

          <div className="py-3">
          
            <InfoLine text="sbFUSD balance" load={sbFusdBalanceLoading} value={Number(sbFusdBalanceData?.formatted).toFixed(2)} />
          </div>
          <button className="bg-lightblue w-full uppercase  text-white  font-medium px-4 py-3 text-xl rounded-xl hover:bg-opacity-50">
            Mint FUSDT
          </button>
        </div>
      </main>
    </div>
  );
}

export default stake;
