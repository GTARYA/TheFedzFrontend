import { useState, useEffect } from "react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  useChainId,
  useContractRead,
  
} from "wagmi";
import {erc721Abi} from "viem"
import {
  arbitrum,
  sepolia,
} from "@reown/appkit/networks";
import ScaleLoader from "react-spinners/ScaleLoader";
import { useEthersSigner } from "../hooks/useEthersSigner";

import { parseEther, formatEther } from "viem";
import * as sepoliaContractAddress from "../contractAddress";
import * as arbitrumContractAddress from "../contractAddressArbitrum";
import MockERC20Abi from "../abi/MockERC20_abi.json";
import PoolModifiyLiquidityAbi from "../abi/PoolModifyLiquidityTest_abi.json";
import { getPoolId } from "../misc/v4helpers";
import MockERC721Abi from "../abi/MockERC721_abi.json";
import { MockERC721Address } from "../contractAddress";
import TimeSlotSystemAbi from "../abi/TimeSlotSystem_abi.json";
import PoolKeyHashDisplay from "./PoolKeyHash";
import LiquidityChart from "./LiquidityChart";
import RoundInfos from "./RoundInfos";
import Container from "./Container";
import Title from "./ui/Title";
import ActionWindows from "./ActionWindows";
import { ChainId, USDT_ADDR, FUSD_ADDR, chainId } from "../config";
import TokenInput from "./swap/TokenInput";
import BalanceDisplay from "./swap/BalanceDisplay";
import { TokenInfo } from "../type";
import useLP from "../hooks/useLP";
import { NFT_ADDR } from "../config";
import { toast } from "sonner";

const UNISWAP_V4 = true;
const LiquidityComponent = () => {
  const activeChainId = useChainId();
  const {
    PoolSwapTestAddress,
    PoolModifyLiquidityTestAddress,
    HookAddress,
    MockFUSDAddress,
    MockUSDTAddress,
    TimeSlotSystemAddress,
  } = activeChainId == sepolia.id ? sepoliaContractAddress : arbitrumContractAddress;
  const [poolKeyHash, setPoolKeyHash] = useState("");
  const [token0, setToken0] = useState(MockFUSDAddress);
  const [token1, setToken1] = useState(MockUSDTAddress);
  const [amount, setAmount] = useState("1");
  const [tickSpacing, setTickSpacing] = useState(60);
  const [swapFee, setSwapFee] = useState(4000);
  const [tickLower, setTickLower] = useState<number>(-tickSpacing);
  const [tickUpper, setTickUpper] = useState<number>(tickSpacing);

  const [isApproved, setIsApproved] = useState(false);
  const [hookData, setHookData] = useState<`0x${string}`>("0x0"); // New state for custom hook data
  const [isNFTHolderState, setIsNFTHolderState] = useState(false);
  const [isPlayerTurnState, setIsPlayerTurnState] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tickError, setTickError] = useState<string | null>(null);

  const signer = useEthersSigner();
  const { address } = useAccount();
  const [tokenA, setTokenA] = useState<TokenInfo>(USDT_ADDR[ChainId]);
  const [tokenB, setTokenB] = useState<TokenInfo>(FUSD_ADDR[ChainId]);
  const [showModal, setShowModal] = useState(false);
  const [percentToRemove, setPercentToRemove] = useState("");

  const { data: nftbalance, isLoading: balanceLoading } = useContractRead({
    address: NFT_ADDR as `0x${string}`,
    abi: erc721Abi,
    functionName: "balanceOf",
    args: [address as "0x"],
    chainId: ChainId
  });


  const { data: tokenABalance, refetch: refetchTokenABalance } = useBalance({
    address,
    chainId: ChainId,
    token: tokenA.address as "0x",
  });

  const { data: tokenBBalance, refetch: refetchTokenBBalance } = useBalance({
    address,
    chainId: ChainId,
    token: tokenB.address as "0x",
  });

  const {
    loading,
    quote,
    getQuote,
    quoteLoading,
    addLiquidity: addLPS,
    liquidityInfo,
    removeLiquidity,
    removeLiquidityloading,
  } = useLP(activeChainId,amount, signer, tokenA, tokenB);

  const addLiquidity = async () => {
    if(Number(nftbalance?.toString()) > 0){
      await addLPS(amount);
      refetchTokenABalance();
      refetchTokenBBalance();
    }else{
      toast.error("You need to be an NFT Holder to add Liquidity")
    }
    
  };

  const handleRemoveLiquidity = () => {
    // Handle the removal logic here, passing the percentToRemove
    console.log(`Removing ${percentToRemove}% of liquidity`);
    // Close the modal after handling
    setShowModal(false);
    removeLiquidity(Number(percentToRemove));
  };

  // arb config

  const MIN_SQRT_PRICE_LIMIT = BigInt("4295128739") + BigInt("1");
  const MAX_SQRT_PRICE_LIMIT =
    BigInt("1461446703485210103287273052203988822378723970342") - BigInt("1");

  const {
    data: writewriteLiquidityData,
    error: writeLiquidityError,
    isPending: isLiquidityPending,
    writeContract: writeModifyLiquidity,
  } = useWriteContract();
  const {
    data: writeApprove0Data,
    error: writeApprove0Error,
    isPending: isApprove0Pending,
    writeContract: writeApproveToken0Contract,
  } = useWriteContract();
  const {
    data: writeApprove1Data,
    error: writeApprove1Error,
    isPending: isApprove1Pending,
    writeContract: writeApproveToken1Contract,
  } = useWriteContract();

  const { data: isNFTHolder } = useReadContract({
    address: MockERC721Address,
    abi: MockERC721Abi,
    functionName: "isNFTHolder",
    args: [address],
  });

  useEffect(() => {
    if (isNFTHolder !== undefined) {
      setIsNFTHolderState(isNFTHolder as boolean);
    }
  }, [isNFTHolder]);

  useEffect(() => {
    if (tickLower > tickUpper) {
      setTickError("Lower tick cannot be above upper tick!");
    } else {
      setTickError(null);
    }
  }, [tickLower, tickUpper]);

  const { data: isPlayerTurn } = useReadContract({
    address: TimeSlotSystemAddress,
    abi: TimeSlotSystemAbi,
    functionName: "canPlayerAct",
    args: [address],
  });

  useEffect(() => {
    if (isPlayerTurn !== undefined) {
      setIsPlayerTurnState(isPlayerTurn as boolean);
    }
  }, [isPlayerTurn]);

  const { data: token0Allowance } = useReadContract({
    address: MockFUSDAddress,
    abi: MockERC20Abi,
    functionName: "allowance",
    args: [address, PoolModifyLiquidityTestAddress],
  });

  const { data: token1Allowance } = useReadContract({
    address: MockUSDTAddress,
    abi: MockERC20Abi,
    functionName: "allowance",
    args: [address, PoolModifyLiquidityTestAddress],
  });

  useEffect(() => {
    if (token0Allowance != null && token1Allowance != null && amount != null) {
      try {
        const amountBigInt = parseEther(amount.toString());
        const token0AllowanceBigInt = BigInt(token0Allowance.toString());
        const token1AllowanceBigInt = BigInt(token1Allowance.toString());
        const isApproved =
          token0AllowanceBigInt >= amountBigInt &&
          token1AllowanceBigInt >= amountBigInt;
        setIsApproved(isApproved);
      } catch (error) {
        console.error("Error converting values to BigInt:", error);
        setIsApproved(false);
      }
    } else {
      setIsApproved(false);
    }
  }, [token0Allowance, token1Allowance, amount]);

  const approveToken0 = async () => {
    try {
      await writeApproveToken0Contract({
        address: MockFUSDAddress,
        abi: MockERC20Abi,
        functionName: "approve",
        args: [PoolModifyLiquidityTestAddress, parseEther(amount)],
      });
    } catch (err) {
      console.log(err);
    }
  };

  const approveToken1 = async () => {
    try {
      await writeApproveToken1Contract({
        address: MockUSDTAddress,
        abi: MockERC20Abi,
        functionName: "approve",
        args: [PoolModifyLiquidityTestAddress, parseEther(amount)],
      });
    } catch (err) {
      console.log(err);
    }
  };

  const modifyLiquidity = async () => {
    try {
      const result = await writeModifyLiquidity({
        address: PoolModifyLiquidityTestAddress,
        abi: PoolModifiyLiquidityAbi,
        functionName: "modifyLiquidity",
        args: [
          token0 < token1 ? token0 : token1,
          token0 < token1 ? token1 : token0,
          Number(tickLower),
          Number(tickUpper),
          parseEther(amount),
        ],
      });
      console.log("Swap transaction sent:", result);
    } catch (error) {
      console.error("Error in deposit:", error);
      //setSwapError(error);
    }
  };

  useEffect(() => {
    if (
      token0 &&
      token1 &&
      swapFee !== undefined &&
      tickSpacing !== undefined &&
      HookAddress
    ) {
      try {
        const id = getPoolId({
          currency0: token0,
          currency1: token1,
          fee: Number(swapFee),
          tickSpacing,
          hooks: HookAddress,
        });
        setPoolKeyHash(id);
      } catch (error) {
        console.error("Error calculating pool ID:", error);
        setPoolKeyHash("");
      }
    } else {
      setPoolKeyHash("");
    }
  }, [token0, token1, swapFee, tickSpacing, HookAddress]);

  //Tick Change Handler
  // @ts-ignore
  const handleTickChange = (type, newTick) => {
    if (type === "lower") {
      setTickLower(Math.min(newTick, tickUpper - tickSpacing));
    } else {
      setTickUpper(Math.max(newTick, tickLower + tickSpacing));
    }
  };
  const tokenOptions = [
    { value: USDT_ADDR[ChainId], label: "USDT", decimals: 6 },
    { value: FUSD_ADDR[ChainId], label: "FUSD", decimals: 18 },
  ];

  
  const handleTokenSelection = (selectedToken: TokenInfo, isInput: boolean) => {
    if (isInput) {
      if (selectedToken.address === tokenB.address) {
        setTokenA(tokenB);
        setTokenB(tokenA);
      } else {
        setTokenA(selectedToken);
      }
    } else {
      if (selectedToken.address === tokenA.address) {
        setTokenA(tokenA);
        setTokenB(tokenB);
      } else {
        setTokenB(selectedToken);
      }
    }
  };



  return (
    <div>
      <section className="pb-[50px] md:pb-[75px] relative">
        <Container>
          <Title className="text-center">Add Liquidity</Title>
          <Container>
            <div>
              {!UNISWAP_V4 && (
                <div className="max-w-[620px] p-3 sm:p-6 mx-auto bg-white/10 rounded-[24px] mt-8">
                  <div className="space-y-10">
                    {/* Token A Input */}
                    <div className="p-5 rounded-2xl border-white/20 border-[1px] text-primary">
                      <BalanceDisplay
                        label="Input Token"
                        balance={tokenABalance}
                      />
                      <TokenInput
                        amount={amount}
                        setAmount={setAmount}
                        token={tokenA}
                        setToken={(token) => handleTokenSelection(token, true)}
                        options={tokenOptions}
                      />
                    </div>

                    {/* Toggle Button */}

                    {/* Token B Output */}
                    <div className="p-5 rounded-2xl border-white/20 border-[1px] text-primary">
                      <BalanceDisplay
                        label="Output Token"
                        balance={tokenBBalance}
                      />
                      <TokenInput
                        amount={
                          quoteLoading
                            ? "---" // Show a placeholder text during quote calculation
                            : Number(quote).toFixed(3) || "0"
                        }
                        setAmount={() => {}} // Disable changing amount for output token
                        token={tokenB}
                        setToken={(token) => handleTokenSelection(token, false)}
                        options={tokenOptions}
                      />
                    </div>
                    <div className="pt-6">
                      <button
                        disabled={loading}
                        onClick={modifyLiquidity}
                        className="btn btn-primary w-full hover:scale-105 transition-transform duration-200"
                      >
                        {loading ? (
                          <ScaleLoader
                            height={20}
                            loading={loading}
                            color="#ffffff"
                            className="text-white"
                            aria-label="Loading Spinner"
                            data-testid="loader"
                          />
                        ) : (
                          "Add liquidity"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                  <div className="bg-[#212121] p-6 rounded-lg w-[90%] sm:w-[400px] ">
                    <h2 className="text-center text-xl mb-4 text-white">
                      Enter percentage to remove
                    </h2>
                    <div className="relative  flex mx-auto w-fit items-center gap-1 ">
                      <input
                        type="text"
                        placeholder="0.0"
                        value={`${percentToRemove}`}
                        onChange={(e) => {
                          const re = /^[0-9]*\.?[0-9]*$/;
                          if (re.test(e.target.value)) {
                            setPercentToRemove(e.target.value);
                          }
                        }}
                        className=" flex-1 !bg-transparent text-4xl  text-center outline-none py-6 text-white font-bold overflow-hidden w-[60px]"
                        min="0"
                        max="100"
                      />
                      <span className="text-4xl text-center text-white flex-1 font-bold">
                        %
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-between mb-6">
                      <button
                        onClick={() => setPercentToRemove("25")}
                        className="text-white border-white/20 border-[1px] hover:scale-105 py-1 px-4 rounded-3xl"
                      >
                        25%
                      </button>
                      <button
                        onClick={() => setPercentToRemove("50")}
                        className="text-white border-white/20 border-[1px] hover:scale-105 py-1 px-4 rounded-3xl"
                      >
                        50%
                      </button>
                      <button
                        onClick={() => setPercentToRemove("75")}
                        className="text-white border-white/20 border-[1px] hover:scale-105 py-1 px-4 rounded-3xl"
                      >
                        75%
                      </button>
                      <button
                        onClick={() => setPercentToRemove("100")}
                        className="text-white border-white/20 border-[1px] hover:scale-105 py-1 px-4 rounded-3xl"
                      >
                        Max
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={() => setShowModal(false)}
                        className=" text-white border-white/20 border-[1px] py-2 px-4 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRemoveLiquidity}
                        className="btn-primary btn text-white py-2 px-4 rounded-lg"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {liquidityInfo &&
                Number(liquidityInfo?.userLPBalance || 0) > 0 && (
                  <div className=" max-w-[620px] p-3 sm:p-6 mx-auto bg-white/10 rounded-[24px] mt-8 text-white">
                    <div className="mx-auto text-center text-2xl mb-6">
                      Your positions
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="">Your total pool tokens:</span>
                        <span>{liquidityInfo?.totalTokens}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deposited mFUSD:</span>
                        <span>{liquidityInfo?.tokenA?.userReserve}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deposited mUSDT:</span>
                        <span>{liquidityInfo?.tokenB?.userReserve}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Share of pool:</span>
                        <span>{liquidityInfo?.userShare}%</span>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        disabled={removeLiquidityloading}
                        onClick={() => setShowModal(true)}
                        className="btn btn-primary w-full hover:scale-105 transition-transform duration-200"
                      >
                        {removeLiquidityloading ? (
                          <ScaleLoader
                            height={20}
                            loading={removeLiquidityloading}
                            color="#ffffff"
                            className="text-white"
                            aria-label="Loading Spinner"
                            data-testid="loader"
                          />
                        ) : (
                          "       Remove liquidity  "
                        )}
                      </button>
                    </div>
                  </div>
                )}
            </div>

            {UNISWAP_V4 && (
              <div className="max-w-[620px] p-3 sm:p-6 mx-auto bg-white/10 rounded-[24px] mt-8">
                <div>
                  <label className="text-base sm:text-xl text-primary">
                    <span className="font-bold">Token 1</span>
                  </label>
                  <select
                    className="select text-primary mt-3 w-full text-sm sm:text-base !min-h-[10px] !h-auto bg-white/10 !py-[6px] !px-[14px] cursor-pointer rounded-[46px] border-white/10 border-[1px] outline-none"
                    value={token0}
                    onChange={(e) => {
                      setToken0(e.target.value);
                      setToken1(token0);
                    }}
                  >
                    <option
                      className="bg-gray-500 text-white"
                      disabled
                      defaultValue={"SelectToken"}
                    >
                      Select token
                    </option>
                    <option
                      className="bg-gray-500 text-white"
                      value={MockFUSDAddress}
                    >
                      mFUSD
                    </option>
                    <option
                      className="bg-gray-500 text-white"
                      value={MockUSDTAddress}
                    >
                      mUSDT
                    </option>
                    {/* Add more token options */}
                  </select>
                </div>

                <div className="mt-5 md:mt-10 mb-5">
                  <label className="text-base sm:text-xl text-primary">
                    <span className="font-bold">Token 2</span>
                  </label>
                  <select
                    className="select text-primary mt-3 w-full text-sm sm:text-base !min-h-[10px] !h-auto bg-white/10 !py-[6px] !px-[14px] cursor-pointer rounded-[46px] border-white/10 border-[1px] outline-none"
                    value={token1}
                    onChange={(e) => {
                      setToken1(e.target.value);
                      setToken0(token1);
                    }}
                  >
                    <option
                      className="bg-gray-500 text-white"
                      disabled
                      defaultValue={"SelectToken"}
                    >
                      Select token
                    </option>
                    <option
                      className="bg-gray-500 text-white"
                      value={MockUSDTAddress}
                    >
                      mUSDT
                    </option>
                    <option
                      className="bg-gray-500 text-white"
                      value={MockFUSDAddress}
                    >
                      mFUSD
                    </option>

                    {/* Add more token options */}
                  </select>
                </div>

                <div className="text-primary">
                  <label className="label cursor-pointer">
                    <span>Pool Settings</span>
                    <input
                      type="checkbox"
                      className="toggle my-toggle toggle-primary"
                      checked={showSettings}
                      onChange={() => setShowSettings(!showSettings)}
                    />
                  </label>
                </div>

                {showSettings && (
                  <div className="mt-4 text-sm sm:text-base text-primary">
                    <div className="form-control w-full max-w-xs mb-4">
                      <label className="label">
                        <span className="label-text text-primary/60">
                          Tick Spacing{" "}
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="0.0"
                        className="input input-bordered w-full max-w-xs text-primary bg-[#1b222b]"
                        value={tickSpacing}
                        onChange={(e) => {
                          const re = /^[0-9]*\.?[0-9]*$/;
                          if (
                            e.target.value === "" ||
                            re.test(e.target.value)
                          ) {
                            setTickSpacing(Number(e.target.value));
                          }
                        }}
                      />
                    </div>

                    <div className="form-control w-full max-w-xs mb-4">
                      <label className="label">
                        <span className="label-text text-primary/60">
                          Fee Percent{" "}
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="0.0"
                        className="input input-bordered w-full max-w-xs text-primary bg-[#1b222b]"
                        value={swapFee}
                        onChange={(e) => {
                          const re = /^[0-9]*\.?[0-9]*$/;
                          if (
                            e.target.value === "" ||
                            re.test(e.target.value)
                          ) {
                            setSwapFee(Number(e.target.value));
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="form-control w-full max-w-xs mb-4">
                  <label className="label">
                    <span className="label-text text-primary/60">Amount </span>
                  </label>
                  <input
                    type="text"
                    placeholder="0.0"
                    className="input input-bordered w-full max-w-xs text-primary bg-[#1b222b]"
                    value={amount}
                    onChange={(e) => {
                      const re = /^[-+]?[0-9]*\.?[0-9]*$/;
                      if (e.target.value === "" || re.test(e.target.value)) {
                        setAmount(e.target.value);
                      }
                    }}
                  />
                </div>

                {isApproved ? (
                  <></>
                ) : (
                  <div className="card-actions justify-end mt-5">
                    <div className="flex justify-between gap-6 w-full">
                      <button
                        className="btn flex-1 hover:bg-[#7a2ed6] transition-transform duration-200 bg-[#383838] text-primary border-none rounded-[56px] font-medium text-center text-base sm:text-lg"
                        onClick={approveToken0}
                        disabled={!isNFTHolderState}
                      >
                        Approve FUSD
                      </button>
                      <button
                        className="btn flex-1 hover:bg-[#7a2ed6] transition-transform duration-200 bg-[#383838] text-primary border-none rounded-[56px] font-medium text-center text-base sm:text-lg"
                        onClick={approveToken1}
                        disabled={!isNFTHolderState}
                      >
                        Approve USDT
                      </button>
                    </div>
                  </div>
                )}

                <div className="card-actions justify-center mt-4">
                  {isNFTHolderState ? (
                    <div>
                      {isPlayerTurnState ? (
                        <>
                          {isApproved && (
                            <button
                              className="btn btn-primary btn-wide hover:scale-110 transition-transform duration-200"
                              onClick={modifyLiquidity}
                            >
                              Modify Liquidity
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="alert alert-error">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="stroke-current shrink-0 h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>It is not your Turn to Act !</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="alert alert-warning">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="stroke-current shrink-0 h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span>
                        You need to be an NFT Holder to add Liquidity !
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Container>

          <img
            src="/cursor/11.png"
            alt="money"
            className="absolute w-full top-0 lg:top-[200px] left-[10px] lg:left-[60px] max-w-[60px] lg:max-w-[170px] pointer-events-none"
          />

          <img
            src="/cursor/1.png"
            alt="coin"
            className="absolute w-full top-[95%] lg:top-[500px] right-[20px] max-w-[40px] lg:max-w-[60px] pointer-events-none"
          />
        </Container>
      </section>

      <section className="pb-[50px] md:pb-[75px] relative">
        <Container className="relative z-[5]">
          <Title className="text-center">Liquidity Chart</Title>
          <div className="max-w-[900px] p-3 sm:p-6 mx-auto bg-white/10 rounded-[24px] mt-8">
            <div>
              <label className="text-base sm:text-xl text-primary">
                <span className="font-bold">Tick Lower</span>
              </label>
              <div className="flex items-center gap-2 mt-5 text-primary">
                <button
                  className="btn btn-primary border-none text-primary btn-sm transition-transform duration-200 bg-lightblue hover:bg-[#7a2ed6]"
                  onClick={() => {
                    const newValue = (tickLower as number) - tickSpacing;
                    setTickLower(newValue);
                  }}
                >
                  -
                </button>
                <input
                  type="text"
                  placeholder="-100"
                  className="input input-bordered w-full mx-2 sm:text-2xl text-lg text-primary bg-[#1b222b]"
                  value={tickLower.toString()}
                  onChange={(e) => {
                    const re = /^[-+]?[0-9]*$/;
                    if (e.target.value === "" || re.test(e.target.value)) {
                      setTickLower(
                        e.target.value === "" ? 0 : parseInt(e.target.value, 10)
                      );
                    }
                  }}
                />
                <button
                  className="btn btn-primary text-primary btn-sm transition-transform duration-200 bg-lightblue hover:bg-[#7a2ed6] border-none"
                  onClick={() => {
                    const newValue = (tickLower as number) + tickSpacing;
                    setTickLower(newValue);
                  }}
                >
                  +
                </button>
              </div>
              {(tickLower as number) % tickSpacing !== 0 && (
                <label>
                  <span className="label-text-alt text-error sm:text-base text-sm">
                    Tick Lower must be divisible by {tickSpacing}
                  </span>
                </label>
              )}
            </div>

            <div className="mt-5 md:mt-8">
              <label className="text-base sm:text-xl text-primary">
                <span className="font-bold">Tick Upper</span>
              </label>
              <div className="flex items-center mt-5 gap-2 text-primary">
                <button
                  className="btn btn-primary text-primary btn-sm transition-transform duration-200 bg-lightblue hover:bg-[#7a2ed6] border-none"
                  onClick={() => {
                    const newValue = (tickUpper as number) - tickSpacing;
                    setTickUpper(newValue);
                  }}
                >
                  -
                </button>
                <input
                  type="text"
                  placeholder="100"
                  className="input input-bordered w-full mx-2 sm:text-2xl text-lg text-primary bg-[#1b222b]"
                  value={tickUpper.toString()}
                  onChange={(e) => {
                    const re = /^[-+]?[0-9]*$/;
                    if (e.target.value === "" || re.test(e.target.value)) {
                      setTickUpper(
                        e.target.value === "" ? 0 : parseInt(e.target.value, 10)
                      );
                    }
                  }}
                />
                <button
                  className="btn btn-primary text-primary btn-sm transition-transform duration-200 bg-lightblue hover:bg-[#7a2ed6] border-none"
                  onClick={() => {
                    const newValue = (tickUpper as number) + tickSpacing;
                    setTickUpper(newValue);
                  }}
                >
                  +
                </button>
              </div>
              {(tickUpper as number) % tickSpacing !== 0 && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    Tick Upper must be divisible by {tickSpacing}
                  </span>
                </label>
              )}
            </div>

            <div className="w-full flex-grow max-h-[400px]">
              <LiquidityChart
                tickLower={tickLower}
                tickUpper={tickUpper}
                tickSpacing={tickSpacing}
                onTickChange={handleTickChange}
              />
            </div>

            {tickError && (
              <div className="alert alert-error shadow-lg mt-4">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current flex-shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{tickError}</span>
                </div>
              </div>
            )}
          </div>
        </Container>
        <img
          src="/cursor/5.png"
          alt="eppilse"
          className="absolute bottom-[92%] md:bottom-5 left-0 md:left-[40px] max-w-[50px] md:max-w-[80px]"
        />
        <img
          src="/cursor/7.png"
          alt="eppilse"
          className="absolute bottom-5 right-[60px] max-w-[50px] md:max-w-[80px]"
        />
        <img
          src="/cursor/6.png"
          alt="eppilse"
          className="absolute hidden lg:block top-0 md:top-10 right-[40px] max-w-[50px] md:max-w-[80px]"
        />
      </section>

      <ActionWindows />

      <section className="relative py-[50px] md:py-[75px]">
        <Container className="relative z-[5]">
          <Title>Rounds</Title>
          <div className="flex flex-col md:flex-row gap-8 mt-6 md:mt-9">
            {/* {address && (
                            <div className="card w-full bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <TimeSlotSystem address={address} />
                                </div>
                            </div>
                        )} */}

            <RoundInfos />

            <PoolKeyHashDisplay poolKeyHash={poolKeyHash} />
          </div>
        </Container>
        <img
          src="/blue-glare4.png"
          alt="glare"
          className="absolute w-full -bottom-[10%] md:-bottom-[50%] right-0 max-w-[500px] md:max-w-[700px] pointer-events-none"
        />
        <img
          src="/cursor/10.png"
          alt="eppilse"
          className="absolute bottom-[0] md:bottom-[10%] left-[0px] md:left-[20px] max-w-[50px] md:max-w-[80px]"
        />
        <img
          src="/cursor/7.png"
          alt="eppilse"
          className="absolute bottom-[10px] md:bottom-[300px] right-[50px] md:right-0 max-w-[50px] md:max-w-[80px]"
        />
      </section>
    </div>
  );
};

export default LiquidityComponent;
