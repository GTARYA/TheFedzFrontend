import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { toast } from "react-hot-toast";
import ScaleLoader from "react-spinners/ScaleLoader";
import {
  useContractRead,
  useBalance,
  useAccount,
  useWriteContract,
  usePublicClient,
  useWalletClient,
  useSwitchChain,
} from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import contractABI from "../abi/NFTABI.json";
const contractAddress = "0xE073a53a2Ba1709e2c8F481f1D7dbabA1eF611FD";
//base - 84532

const chainId = 42161;
const maxBuy = 50;
type Props = {};

function MintPage({}: Props) {
  const { chains, switchChain } = useSwitchChain();
  const { address, chainId: activeChainId,isConnected } = useAccount();
  const [quantity, setQuantity] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const publicClient = usePublicClient();
  const { open, close } = useAppKit();

  const isWRONG_NETWORK = chainId != activeChainId;
  const ChangeChain = () => {
    switchChain({ chainId: chainId! });
  };

  const connetButton = () => {
    open();
  };


  const {
    data: balanceData,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useBalance({
    address: address,
  });
  const { data: walletClient } = useWalletClient();
  const {
    data: totalSupply,
    isLoading: totalSupplyLoading,
    isError,
    refetch: refetchTotalsupply,
    error,
  } = useContractRead({
    address: contractAddress as "0x",
    abi: contractABI,
    functionName: "totalSupply",
    chainId,
  });

  const {
    data: mintPrice,
    isLoading: priceLoading,
    isError: priceError,
    refetch: refetchmintPrice,
  } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: "getCurrentMintPrice",
    chainId,
  });

  const {
    data: totalCost,
    isLoading: totalCostLoading,
    isError: totalCostError,
    refetch: refetchtotalCost,
  } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: "getTotalCost",
    chainId,
    args: [quantity],
  });

  const {
    writeContract,
    writeContractAsync,
    error: txError,
    isPending,
  } = useWriteContract();

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(prev + 1, maxBuy));
  };

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const handleMint = async () => {
    if (!publicClient || !walletClient) {
      open();
      return ;
    }

    console.log(Number(balanceData?.value),"Number(balanceData?.value)");
    
    try {
      if (Number(balanceData?.value) < Number(totalCost)) {
        toast.error("Insufficient balance to complete the transaction.");
        return;
      }

      setIsMinting(true);
      const { request: mintRequest } = await publicClient.simulateContract({
        account: address,
        abi: contractABI,
        address: contractAddress,
        functionName: "mint",
        args: [quantity],
        value: totalCost as any,
      });
      const mintHash = await walletClient.writeContract(mintRequest);

      const mintRes = await publicClient.waitForTransactionReceipt({
        hash: mintHash,
      });
      refetchTotalsupply();
      refetchmintPrice();
      refetchtotalCost();
      refetchBalance();
      console.log("Transaction successful:");
      toast.success("Your NFT was minted successfully");
      setIsMinting(false);
    } catch (error: any) {
      setIsMinting(false);

      console.error(
        "Details:",
        error?.details || "No additional details available"
      );
      toast.error(error?.details || "Transaction error");
    }
  };

  return (
    <div className="bg-[#0A0012] relative min-h-screen overflow-hidden">
      <img
        src="/blue-glare3.png"
        alt="glare"
        className="absolute w-full -top-[10%] md:-top-[30%] left-0 max-w-[500px] md:max-w-[700px] pointer-events-none"
      />

      <img
        src="/blue-glare4.png"
        alt="glare"
        className="absolute w-full overflow-y-clip  right-0 max-w-[500px] md:max-w-[700px] pointer-events-none"
      />
      <Navbar />
      {/* <div className="relative overflow-hidden">
        <img
          className="absolute top-0 md:h-full xl:w-full left-1/2 -translate-x-1/2 z-[2] lg:min-w-[1440px] min-w-[1300px]"
          src="/background/bg.png"
          alt="bg"
        />
        <img
          className="absolute top-0 md:h-full xl:w-full left-1/2 -translate-x-1/2 z-[3] lg:min-w-[1440px] min-w-[1300px]"
          src="/background/bg-pool.png"
          alt="bg"
        />
        <img
          className="absolute md:bottom-[10px] bottom-[30px] translate-y-1/2 w-full left-1/2 -translate-x-1/2 z-[4] max-h-[240px]"
          src="/background/hero-bottom.png"
          alt="bg"
        />
        <img
          className="block md:hidden absolute left-[30px] top-[460px] z-[4] max-w-[100px]"
          src="/background/pony-left.png"
          alt="bg"
        />

        <div className="block md:hidden">
          <img
            className="absolute left-[30px] top-[400px] z-[4] max-w-[60px]"
            src="/background/Vector1.png"
            alt="bg"
          />
          <img
            className="absolute left-[30px] top-[100px] z-[4] max-w-[15px]"
            src="/background/Vector2.png"
            alt="bg"
          />
          <img
            className="absolute right-[30px] top-[100px] z-[4] max-w-[20px]"
            src="/background/Vector3.png"
            alt="bg"
          />
          <img
            className="absolute right-[70px] top-[300px] z-[4] max-w-[20px]"
            src="/background/Vector3.png"
            alt="bg"
          />
          <img
            className="absolute left-[30px] top-[230px] z-[4] max-w-[20px]"
            src="/background/Vector4.png"
            alt="bg"
          />
        </div>
      </div> */}

      {/* New Section */}
      <section className="flex relative z-1 flex-col md:flex-row items-center gap-8 py-6 pb-16 md:py-32 px-4 max-w-7xl mx-auto ">
        {/* NFT Image */}
        <div className="w-full md:w-6/12">
          <img
            className="md:p-5 w-full md:max-w-[500px] mx-auto  rounded-[40px] shadow-lg"
            src="/FedzNFT.gif"
            alt="NFT Preview"
          />
        </div>

        {/* Mint Controls */}
        <div className="flex flex-col grow h-full gap-6  md:p-8 rounded-lg  w-full md:w-6/12 ">
          <h1 className=" text-2xl uppercase  font-extrabold md:text-4xl  text-transparent bg-clip-text  bg-gradient-to-r from-[#00ffe5] to-[#E100FF]">
            The Fedz NFT
          </h1>
          <p className="text-white">
            Own The Fedz NFT and shape the future of stablecoins. Join a
            pioneering community, enjoy premium benefits, and lead the charge in
            redefining decentralized finance.
          </p>

          <div className="flex items-center space-x-3">
            <div className="text-base leading-[140%] text-gray-400	">
              items :
            </div>
            <div className="text-base leading-[140%] text-white flex flex-row items-center">
              {!totalSupplyLoading ? Number(totalSupply).toString() : "--"} /{" "}
              {100} NFT minted
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-base leading-[140%] text-gray-400	">
              Price :
            </div>
            <div className="text-base leading-[140%] text-white">
              {priceLoading ? "--" : Number(mintPrice) / 10 ** 18}{" "}
              <span className="ml-1">ETH</span>
            </div>
          </div>

          <div className="flex flex-row items-center gap-6">
            <div className="flex items-center gap-3 md:gap-4 bg-gradient-to-r rounded-lg   h-12 from-[#00ffe5] to-[#E100FF] ">
              <button
                disabled={isMinting || isPending}
                onClick={handleDecrease}
                className=" text-white hover:bg-white disabled:!text-white hover:text-black  px-4 py-2 rounded-lg  text-2xl"
              >
                -
              </button>
              <span className="text-2xl font-bold text-white">{quantity}</span>
              <button
                disabled={isMinting || isPending}
                onClick={handleIncrease}
                className=" text-white px-4 py-2 rounded-lg hover:bg-white disabled:!text-white hover:text-black text-2xl"
              >
                +
              </button>
            </div>
            <button
              onClick={address ? isWRONG_NETWORK ? ChangeChain : handleMint:handleMint}
              disabled={isMinting || isPending}
              className="bg-gradient-to-r  flex uppercase items-center w-fit disabled:!text-white disabled:opacity-50 from-[#00ffe5] to-[#E100FF] text-white px-8 h-12 rounded-lg shadow-md text-lg font-bold hover:opacity-90"
            >
              {isMinting || isPending ? (
                <ScaleLoader
                  height={20}
                  loading={isMinting || isPending}
                  color="#ffffff"
                  className="text-white"
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
              ) : isWRONG_NETWORK && address ? (
                "Switch Network"
              ) : (
                "Mint"
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MintPage;
