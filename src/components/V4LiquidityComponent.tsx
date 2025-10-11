import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useChainId,
  useWalletClient,
  usePublicClient,
  useBalance,
} from "wagmi";
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
import LiquidityBox from "./Lp/LiquidityBox";
import {
  encodeSqrtRatioX96,
  nearestUsableTick,
  TickMath,
} from "@uniswap/v3-sdk";
import { formatBalance } from "../hooks/formatters";
import { balanceOf } from "../hooks/erc20";
import { isActingPlayer, isNftHolder } from "../hooks/fedz";
import { LiquidityEvent } from "../type";
import LiquidityProgressModal from "./Modal/LiquidityProgressModal";
import { fetchPlayerPositions } from "../hooks/fedz";
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

// test
import { provideLiquidity } from "../hooks/liquidity";
const V4LiquidityComponent = () => {
  const { open, close } = useAppKit();

  const activeChainId = useChainId();
  const signer = useEthersSigner();
  const { address }: { address: `0x${string}` } = useAccount() as any;

 // const address = "0xBEb1E27c4Cec83ee58A38785f662Cc6a7C46d004";

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  //const address = "0x05A449aB36cE8D096C0bd0028Ea2Ae5A42Fe4EFd";
  // const address = "0x3fe703dBaB90aaCbfeA43669DE72A57931614eCf";
  // const address = "0x05A449aB36cE8D096C0bd0028Ea2Ae5A42Fe4EFd"
  //const address = "0x3A3CeF3A0cb8B1bA0812b23E15CF125B11098032"

  const [mount, setMount] = useState(false);
  const [poolKeyHash, setPoolKeyHash] = useState("");
  const [token0] = useState(MockFUSDAddress);
  const [token1] = useState(MockUSDTAddress);
  const [amount, setAmount] = useState("1");
  const [tickSpacing] = useState(10);
  const [swapFee] = useState(4000);
  const [tickLower, setTickLower] = useState<number>(tickLowerNum);
  const [tickUpper, setTickUpper] = useState<number>(tickUpperNum);

  const [quoteFromLp, setQuote] =
    useState<[CurrencyAmount<any>, CurrencyAmount<any>, string]>();
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

  const [isNFTHolderState, setIsNFTHolderState] = useState(true);
  const [isPlayerTurnState, setIsPlayerTurnState] = useState(true);
  const [tickError, setTickError] = useState<string | null>(null);
  const [showDrillDown, setShowDrillDown] = useState(false);

  const [page, setPage] = useState(0);
  const limit = 10;

  const {
    data: tokenABalance,
    isLoading: loadingA,
    refetch: refetchTokenABalance,
    error: errorA,
  } = useBalance({
    address,
    token: tokenA?.address as "0x",
  });

  const {
    data: tokenBBalance,
    isLoading: loadingB,
    refetch: refetchTokenBBalance,
    error: errorB,
  } = useBalance({
    address,
    token: tokenB?.address as "0x",
  });

  const {
    data: lpEvent,
    isLoading,
    refetch: refetLiquidityEvents,
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

  const {
    data: positions,
    isLoading: isPositionLoading,
    isError: isPositionError,
    error: positionError,
    isFetching: isPositionFetching,
    refetch: refetchPositions,
  } = useQuery({
    queryKey: ["playerPositions", address],
    queryFn: () => fetchPlayerPositions(address),
    enabled: !!address, // only fetch if address exists
  });

  useEffect(() => {
    if (!mount && signer && address) {
      isNftHolder(address, signer).then((result: boolean) => {
        setIsNFTHolderState(result);
      });
      isActingPlayer(address, signer).then((result: boolean) => {
        setIsPlayerTurnState(result);
      });
      setMount(true);
    }
  }, [mount, signer, address]);

  const fetchBalancesAndPrint = async () => {
    console.log("fetching balances....");
    refetchTokenABalance();
    refetchTokenBBalance();
  };

  const [liqudidity, setLiqudidity] = useState<string>();
  function onAmount0QuoteChange(
    amount0: CurrencyAmount<any>,
    amount1: CurrencyAmount<any>,
    liqudidity: string
  ) {
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
    setAmount0(amount0.toFixed());
    setAmount1Quote(amount1.toFixed());
    setLiqudidity(liqudidity);
    setQuote([amount0, amount1, liqudidity]);
  }
  const {
    quote,
    quoteLoading,
    addLiquidity: addLPS,
    removeLiquidity,
    removeLiquidityloading,
    updateAmount0,
    updateAmount1,
    addingLiquidityLoading,
    currentStep,
    stepStatuses,
    resetStepStatuses,
    isRoundStepShow
  } = useLP(
    activeChainId,
    amount,
    signer,
    tokenA,
    tokenB,
    onAmount0QuoteChange,
    onAmount1QuoteChange
  );

const refreshLiquidityData = () => {
  // 🔁 Initial refetch (immediate)
  refetchPositions();
  refetLiquidityEvents();

  // ⏳ Second refetch after 5s (to catch delayed updates)
  setTimeout(() => {
    refetchPositions();
    refetLiquidityEvents();
  }, 5000);
};

  const handleAddLiquidity = async () => {
    if (quoteFromLp) {
      const data = await addLPS(quoteFromLp[0], quoteFromLp[1], quoteFromLp[2]);
      if (data.success) {
        fetchBalancesAndPrint();
        setShowDrillDown(false);

        refreshLiquidityData();
      }
    }
  };

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
    if (Number(nftbalance?.toString()) <= 0) {
      toast.error("You need to be an NFT Holder to add Liquidity");
      return;
    }

    if (!quoteFromLp) return;

    // Convert balances and amounts safely
    const balanceA = Number(tokenABalance?.formatted ?? 0);
    const balanceB = Number(tokenBBalance?.formatted ?? 0);
    const inputA = Number(amount0 ?? 0);
    const inputB = Number(amount1 ?? 0);

    // 🔹 Check Token A balance
    if (inputA > balanceA) {
      toast.error(`You have insufficient ${tokenA?.symbol} balance`);
      return;
    }

    // 🔹 Check Token B balance
    if (inputB > balanceB) {
      toast.error(`You have insufficient ${tokenB?.symbol} balance`);
      return;
    }

    // ✅ If both checks pass
    resetStepStatuses();
    setShowDrillDown(true);
   
  };

  useEffect(() => {
    if (tickLower > tickUpper) {
      setTickError("Lower tick cannot be above upper tick!");
    } else {
      setTickError(null);
    }
  }, [tickLower, tickUpper]);

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
  // const tokenOptions = [
  //   { value: FUSD_ADDR[ChainId], label: "FUSD", decimals: 18 },
  //   { value: USDT_ADDR[ChainId], label: "USDT", decimals: 6 },
  // ];

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

  // const TestLP = async () => {
  //   await provideLiquidity(signer);
  // };

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
                    <BalanceDisplay label="Token A" balance={tokenABalance} />
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
                    <BalanceDisplay label="Token B" balance={tokenBBalance} />
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

                  {/* <div>
                    <button onClick={()=>TestLP()} className="text-white bg-green-400">
                      ADD LP.
                    </button>
                  </div>
             */}

                  <button
                    disabled={addingLiquidityLoading}
                    onClick={addLiquidity}
                    className="btn btn-primary hidden w-full hover:scale-105 transition-transform duration-200"
                  >
                    {addingLiquidityLoading ? (
                      <ScaleLoader
                        height={20}
                        loading={true}
                        color="#ffffff"
                        className="text-white"
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      />
                    ) : (
                      "Add liquidity"
                    )}
                  </button>

                  <div className="pt-6">
                    {mount && address ? (
                      isNFTHolderState &&
                      isPlayerTurnState && (
                        <button
                          disabled={addingLiquidityLoading || quoteLoading}
                          onClick={addLiquidity}
                          className="btn btn-primary w-full hover:scale-105 transition-transform duration-200"
                        >
                          {addingLiquidityLoading || quoteLoading ? (
                            <ScaleLoader
                              height={20}
                              loading={true}
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

              {address && (
                <div className="pt-6 space-y-6 mt-12">
                  <div>
                    <Title className="text-center">My positions</Title>
                    {/* <div className="text-3xl font-medium text-white text-center mb-8">
                    My positions
                  </div> */}
                  </div>

                  <div className="space-y-8">
                    {isPositionLoading && (
                      <p className="text-center text-gray-400">
                        ⏳ Loading positions...
                      </p>
                    )}

                    {!isPositionLoading &&
                      !isPositionError &&
                      positions?.length === 0 && (
                        <p className="text-center text-base text-gray-400">
                          ⚠️ No positions found
                        </p>
                      )}

                    {!isPositionLoading &&
                      !isPositionError &&
                      positions &&
                      positions.map((pos, index) => (
                        <LiquidityBox
                          key={index}
                          data={pos}
                          isPlayerTurnState={isPlayerTurnState}
                          updateData={refreshLiquidityData}
                          removeLiquidity={removeLiquidity}
                          removeLiquidityloading={removeLiquidityloading}
                        />
                      ))}
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

      <section className="pb-[50px] md:pb-[75px] relative hidden">
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

      {/* LiquidityProgressModal */}
      {showDrillDown && quoteFromLp && (
        <LiquidityProgressModal
          open={showDrillDown}
          onClose={() => setShowDrillDown(false)}
          amount0={quoteFromLp[0]}
          amount1={quoteFromLp[1]}
          liquidity={quoteFromLp[2]}
          handleAddLiquidity={handleAddLiquidity}
          onDone={() => setShowDrillDown(false)}
          addingLiquidityLoading={addingLiquidityLoading}
          currentStep={currentStep}
          stepStatuses={stepStatuses}
          isRoundStepShow={isRoundStepShow}
        />
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
