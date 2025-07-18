import { useState, useEffect } from "react";
import { useAccount, useReadContract, useChainId } from "wagmi";
import { arbitrum } from "@reown/appkit/networks";
import ScaleLoader from "react-spinners/ScaleLoader";
import { useEthersSigner } from "../hooks/useEthersSigner";
import { getLatestEventForTurn } from "../hooks/fedz";
import Rounds from "./Rounds";
import { parseEther } from "viem";
import { useAppKit } from "@reown/appkit/react";
import Subtitle from "./ui/Subtitle";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";
import {
  HookAddress,
  MockFUSDAddress,
  MockUSDTAddress,
  PoolModifyLiquidityTestAddress,
} from "../contractAddressArbitrum";
import MockERC20Abi from "../abi/MockERC20_abi.json";
import { getPoolId } from "../misc/v4helpers";
import LiquidityChart from "./LiquidityChart";
import Container from "./Container";
import Title from "./ui/Title";
import { ChainId, USDT_ADDR, FUSD_ADDR, chainId } from "../config";
import TokenInput from "./swap/TokenInput";
import BalanceDisplay from "./swap/BalanceDisplay";
import useLP from "../hooks/V4UseLP";
import { toast } from "sonner";
import { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { useQuery } from "@tanstack/react-query";
import { fetchLiquidityEventsFromSubgraph } from "../data/fetchSubgraph";
import LiquidityEventRow from "./Lp/LiquidityEventRow";
import {
  encodeSqrtRatioX96,
  nearestUsableTick,
  TickMath,
} from "@uniswap/v3-sdk";
import { formatBalance } from "../hooks/formatters";
import { balanceOf } from "../hooks/erc20";
import { isActingPlayer, isNftHolder } from "../hooks/fedz";
import { LiquidityEvent } from "../type";
import { BigNumber } from "ethers";
import ModifiyLiquidityDrillDown from "./ModifiyLiquidityDrillDown";
const TICK_SPACING = 10;
const lowerPrice = encodeSqrtRatioX96(100e6, 105e18);
const upperPrice = encodeSqrtRatioX96(105e6, 100e18);
const tickLowerNum = nearestUsableTick(
  TickMath.getTickAtSqrtRatio(lowerPrice),
  TICK_SPACING
);
const tickUpperNum =
  nearestUsableTick(TickMath.getTickAtSqrtRatio(upperPrice), TICK_SPACING) +
  TICK_SPACING;

let autofillTimeout: NodeJS.Timeout | undefined;
const V4LiquidityComponent = () => {
  const { open, close } = useAppKit();

  const activeChainId = useChainId();
  const signer = useEthersSigner();
  const { address }: { address: `0x${string}` } = useAccount() as any;
  const [mount, setMount] = useState(false);
  const [poolKeyHash, setPoolKeyHash] = useState("");
  const [token0] = useState(MockFUSDAddress);
  const [token1] = useState(MockUSDTAddress);
  const [amount, setAmount] = useState("1");
  const [tickSpacing] = useState(10);
  const [swapFee] = useState(4000);
  const [tickLower, setTickLower] = useState<number>(tickLowerNum);
  const [tickUpper, setTickUpper] = useState<number>(tickUpperNum);

  const [quoteFromLp, setQuote] = useState<[CurrencyAmount<any>, CurrencyAmount<any>, string]>();
  const [amount0, setAmount0] = useState<string>();
  const [amount1, setAmount1] = useState<string>();
  const [amount0Quote, setAmount0Quote] = useState<string>();
  const [amount1Quote, setAmount1Quote] = useState<string>();
  const [v4Token0, setV4Token0] = useState<Token>(
    new Token(activeChainId, token0, 18, "FUSD", "FUSD")
  );
  const [v4Token1, setV4Token1] = useState<Token>(
    new Token(activeChainId, token1, 6, "USDT", "USDT")
  );
  const [tokenA, setTokenA] = useState<Token>(v4Token0);
  const [tokenB, setTokenB] = useState<Token>(v4Token1);

  const [isApproved, setIsApproved] = useState(false);
  const [hookData, setHookData] = useState<`0x${string}`>("0x0"); // New state for custom hook data
  const [isNFTHolderState, setIsNFTHolderState] = useState(true);
  const [isPlayerTurnState, setIsPlayerTurnState] = useState(true);
  const [tickError, setTickError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [percentToRemove, setPercentToRemove] = useState("");
  const [tokenABalance, setTokenABalance] = useState<string>("-");
  const [tokenBBalance, setTokenBBalance] = useState<string>("-");
  const [showDrillDown, setShowDrillDown] = useState(false);

  const [page, setPage] = useState(0);
  const limit = 10;

  const {
    data: lpEvent,
    isLoading,
    isError,
  } = useQuery<LiquidityEvent[]>({
    queryKey: ["LiquidityEvent", poolKeyHash, address],
    queryFn: () =>
      fetchLiquidityEventsFromSubgraph(poolKeyHash, address ?? null),
    enabled: !!poolKeyHash,
    staleTime: 1000 * 60 * 5,
  });

  const paginatedEvents = lpEvent?.slice(page * limit, page * limit + limit);
  const totalPages = Math.ceil((lpEvent ? lpEvent?.length : 0) / limit);

  const nftbalance = 1;

  useEffect(() => {
    if (!mount && signer && address) {
      fetchBalancesAndPrint();
      isNftHolder(address, signer).then((result: boolean) => {
        setIsNFTHolderState(result);
      });
      isActingPlayer(address, signer).then((result: boolean) => {
        setIsPlayerTurnState(result);
      });
      setMount(true);
    }
  }, [mount, signer, address]);
  const fetchBalance = async (tokenAddress: string) => {
    return await balanceOf(tokenAddress, address, signer);
  };
  const fetchBalancesAndPrint = async () => {
    console.log("fetching balances");
    setTokenABalance("-");
    setTokenBBalance("-");
    const tokenABalance = await fetchBalance(tokenA.address);
    const tokenBBalance = await fetchBalance(tokenB.address);
    setTokenABalance(formatBalance(tokenABalance, tokenA.decimals));
    setTokenBBalance(formatBalance(tokenBBalance, tokenB.decimals));
  };

  const [liqudidity, setLiqudidity] = useState<string>();
  function onAmount0QuoteChange(
    amount0: CurrencyAmount<any>,
    amount1: CurrencyAmount<any>,
    liqudidity: string
  ) {
    console.log("Q0");
    setAmount0Quote(amount0.toFixed());
    setAmount1(amount1.toFixed());
    setLiqudidity(liqudidity);
    setQuote([amount0, amount1, liqudidity]);
  }
  function onAmount1QuoteChange(
    amount0: CurrencyAmount<any>,
    amount1: CurrencyAmount<any>,
    liqudidity: string
  ) {
    console.log("Q1");

    setAmount0(amount0.toFixed());
    setAmount1Quote(amount1.toFixed());
    setLiqudidity(liqudidity);
    setQuote([amount0, amount1, liqudidity]);
  }
  const {
    loading,
    quote,
    quoteLoading,
    addLiquidity: addLPS,
    liquidityInfo,
    removeLiquidity,
    removeLiquidityloading,
    updateAmount0,
    updateAmount1,
    validateRoundUnlock,
    unlockRound,
    validateSufficientBalance,
    validateSufficientAllowance,
    validateSufficientAllowanceOnPermit2,
    approveToken,
    signBatchPermit,
  } = useLP(
    activeChainId,
    amount,
    signer,
    tokenA,
    tokenB,
    onAmount0QuoteChange,
    onAmount1QuoteChange
  );

  useEffect(() => {
    if (amount0 && editingTokenA) {
      if (autofillTimeout) {
        clearTimeout(autofillTimeout);
      }
      autofillTimeout = setTimeout(() => {
        updateAmount0(amount0);
      }, 700);
    }
  }, [amount0]);
  useEffect(() => {
    if (amount1 && editingTokenB) {
      if (autofillTimeout) {
        clearTimeout(autofillTimeout);
      }
      autofillTimeout = setTimeout(() => {
        updateAmount1(amount1);
      }, 700);
    }
  }, [amount1]);

  const addLiquidity = async () => {
    if (Number(nftbalance?.toString()) > 0) {
      if (quoteFromLp) {
        setShowDrillDown(true);
      }
    } else {
      toast.error("You need to be an NFT Holder to add Liquidity");
    }
  };

  const handleRemoveLiquidity = () => {
    // Handle the removal logic here, passing the percentToRemove
    console.log(`Removing ${percentToRemove}% of liquidity`);
    // Close the modal after handling
    setShowModal(false);
    removeLiquidity(Number(percentToRemove));
  };

  useEffect(() => {
    if (tickLower > tickUpper) {
      setTickError("Lower tick cannot be above upper tick!");
    } else {
      setTickError(null);
    }
  }, [tickLower, tickUpper]);

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
    { value: FUSD_ADDR[ChainId], label: "FUSD", decimals: 18 },
    { value: USDT_ADDR[ChainId], label: "USDT", decimals: 6 },
  ];

  const handleTokenSelection = (selectedToken: Token, isInput: boolean) => {
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

  const [editingTokenA, setEditingTokenA] = useState(false);
  const [editingTokenB, setEditingTokenB] = useState(false);

  const connetButton = () => {
    open({ view: "Account" });
    open();
  };

  return (
    <div>
      <section className="pb-[50px] md:pb-[75px] relative">
        <Container>
          <Title className="text-center">Add Liquidity</Title>
          <Container>
            <div>
              <div className="max-w-[620px] p-3 sm:p-6 mx-auto bg-white/10 rounded-[24px] mt-8">
                <div className="space-y-10">
                  {/* Token A Input */}
                  <div className="p-5 rounded-2xl border-white/20 border-[1px] text-primary">
                    <BalanceDisplay
                      label="Token A"
                      balance={tokenABalance}
                    />
                    <TokenInput
                      amount={amount0}
                      setAmount={setAmount0}
                      onFocus={() => {
                        setEditingTokenA(true);
                      }}
                      onBlur={() => {
                        setEditingTokenA(false);
                      }}
                      token={tokenA}
                      setToken={(token: any) =>
                        handleTokenSelection(token, true)
                      }
                      options={[
                        {
                          value: tokenA,
                          label: "FUSD",
                          // decimals: 18,
                        },
                      ]}
                    />
                  </div>

                  {/* Toggle Button */}

                  {/* Token B Output */}
                  <div className="p-5 rounded-2xl border-white/20 border-[1px] text-primary">
                    <BalanceDisplay
                      label="Token B"
                      balance={tokenBBalance}
                    />
                    <TokenInput
                      amount={amount1}
                      setAmount={setAmount1} // Disable changing amount for output token
                      token={tokenB}
                      onFocus={() => {
                        setEditingTokenB(true);
                      }}
                      onBlur={() => {
                        setEditingTokenB(false);
                      }}
                      setToken={(token: any) =>
                        handleTokenSelection(token, false)
                      }
                      options={[
                        {
                          value: tokenB,
                          label: "USDT",
                          // decimals: 18,
                        },
                      ]}
                    />
                  </div>
                  <div className="pt-6">
                    {mount && address ? (
                      isNFTHolderState &&
                      isPlayerTurnState && (
                        <button
                          disabled={loading}
                          onClick={addLiquidity}
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
                      )
                    ) : (
                      <button
                        onClick={connetButton}
                        className="btn btn-primary w-full hover:scale-105 transition-transform duration-200"
                      >
                        Connect Wallet
                      </button>
                    )}

                    {mount && address !== undefined && (
                      <>
                        {isNFTHolderState ? (
                          <>
                            {!isPlayerTurnState && (
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
                          </>
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
                      </>
                    )}
                  </div>
                </div>
              </div>

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

              {liquidityInfo && (
                <div className=" max-w-[620px] p-3 sm:p-6 mx-auto bg-white/10 rounded-[24px] mt-8 text-white">
                  <div className="mx-auto text-center text-2xl mb-6">
                    Your positions #{liquidityInfo?.tokenId}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="">Your total pool tokens:</span>
                      <span>{liquidityInfo?.totalTokens}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deposited mFUSD:</span>
                      <span>{liquidityInfo?.amount0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deposited mUSDT:</span>
                      <span>{liquidityInfo?.amount1}</span>
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

      <Container>
        <div className="overflow-hidden p-[30px]  md:p-[72px] border-[1px] border-white/20 rounded-[32px] bg-[#04152F78] relative">
          <div className="relative z-[5]">
            <Subtitle className="mb-1">Status</Subtitle>
            <Title>Action Windows</Title>
            <div className="overflow-x-auto mt-10 md:mt-14">
              {isLoading ? (
                <div className="text-center py-10 text-lg text-white">
                  Loading...
                </div>
              ) : !lpEvent || lpEvent.length === 0 ? (
                <div className="text-center py-10 text-lg text-white">
                  No event found
                </div>
              ) : (
                <table className="min-w-full text-primary px-6 table-auto">
                  <thead>
                    <tr className="text-left text-base md:text-xl font-bold">
                      <th className="py-4 pr-4">Time</th>
                      {!address && <th className="pr-4">User</th>}
                      <th className="pr-4">Type</th>
                      <th className="pr-4">FUSD</th>
                      <th className="pr-4">USDT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEvents?.map((item, i) => (
                      <LiquidityEventRow
                        key={i}
                        data={item}
                        address={address}
                      />
                    ))}
                  </tbody>
                </table>
              )}

              <div className="flex justify-between items-center mt-8 w-fit mx-auto gap-6">
                <button
                  className="bg-white/10 text-white py-2 px-4 rounded"
                  disabled={page === 0}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                >
                  <ChevronLeftIcon className="w-4 h-4 text-white" />
                </button>

                <p className="text-white text-sm">
                  Page {page + 1} of {totalPages}
                </p>

                <button
                  className="bg-white/10 text-white py-2 px-4 rounded"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  <ChevronRightIcon className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          <img
            src="/blue-glare4.png"
            alt="eppilse"
            className="absolute -bottom-[130%] right-0 pointer-events-none"
          />
          <img
            src="/blue-glare2.png"
            alt="eppilse"
            className="absolute top-0 left-0 pointer-events-none"
          />
        </div>
      </Container>

      {/* <ActionWindows /> */}
      <Rounds poolKeyHash={poolKeyHash ?? ""} />
      
      {/* ModifyLiquidityDrillDown Modal */}
      {showDrillDown && quoteFromLp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#212121] p-6 rounded-lg w-[90%] sm:w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-center text-xl text-white">
                Add Liquidity
              </h2>
              <button
                onClick={() => setShowDrillDown(false)}
                className="text-white hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <ModifiyLiquidityDrillDown
              validateRoundUnlock={validateRoundUnlock}
              unlockRound={unlockRound}
              validateSufficientBalance={validateSufficientBalance}
              validateSufficientAllowance={validateSufficientAllowance}
              validateSufficientAllowanceOnPermit2={validateSufficientAllowanceOnPermit2}
              approveToken={approveToken}
              addLPS={async (liquidity: string, permitBatch?: any, sig?: string) => {
                try {
                  await addLPS(quoteFromLp[0], quoteFromLp[1], quoteFromLp[2], permitBatch, sig);
                  fetchBalancesAndPrint();
                  setShowDrillDown(false);
                  toast.success("Liquidity added successfully!");
                } catch (error) {
                  console.error("Error adding liquidity:", error);
                  toast.error("Failed to add liquidity");
                }
              }}
              onDone={() => setShowDrillDown(false)}
              amount0={quoteFromLp[0]}
              amount1={quoteFromLp[1]}
              liquidity={quoteFromLp[2]}
              loading={loading}
              signBatchPermit={signBatchPermit}
            />
          </div>
        </div>
      )}
      
      {/* <section className="relative py-[50px] md:py-[75px]">
        <Container className="relative z-[5]">
          <Title>Rounds</Title>
          <div className="flex flex-col md:flex-row gap-8 mt-6 md:mt-9">
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
      </section> */}
    </div>
  );
};

export default V4LiquidityComponent;
