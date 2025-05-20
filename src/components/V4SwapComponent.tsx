import { useState, useEffect } from "react";
import { useAccount, useBalance, useReadContract, useChainId } from "wagmi";
import { parseEther, formatEther } from "viem";
import { useEthersSigner } from "../hooks/useEthersSigner";
import ScaleLoader from "react-spinners/ScaleLoader";
import { useAppKit } from "@reown/appkit/react";
import { useQuery } from '@tanstack/react-query';
import { fetchSwapsFromSubgraph } from "../data/fetchSubgraph";
import {
  PoolSwapTestAddress,
  MockFUSDAddress,
  MockUSDTAddress,
  TimeSlotSystemAddress,
} from "../contractAddressArbitrum";
import MockERC20Abi from "../abi/MockERC20_abi.json";
import MockERC721Abi from "../abi/MockERC721_abi.json";
import { MockERC721Address } from "../contractAddress";
import TimeSlotSystemAbi from "../abi/TimeSlotSystem_abi.json";
import PoolKeyHashDisplay from "./PoolKeyHash";
import RoundInfos from "./RoundInfos";
import Title from "./ui/Title";
import Container from "./Container";
import ActionWindows from "./ActionWindows";
import { ChainId, USDT_ADDR, FUSD_ADDR, chainId } from "../config";
import TokenInput from "./swap/TokenInput";
import BalanceDisplay from "./swap/BalanceDisplay";
import V4UseSwap from "../hooks/V4UseSwap";
import { Token } from "@uniswap/sdk-core";
import { poolId } from "../hooks/PoolConsts";
import { balanceOf } from "../hooks/erc20";
import { formatBalance } from "../hooks/formatters";
import { on } from "events";
import { isActingPlayer, isNftHolder } from "../hooks/fedz";
import Rounds from "./Rounds";
import Subtitle from "./ui/Subtitle";
import { SwapEvent } from "../type";
import SwapEventRow from "./swap/SwapEventRow";
let autofillTimeout: NodeJS.Timeout | undefined;
const V4SwapComponent = () => {
  const { open, close } = useAppKit();

  const activeChainId = useChainId();
  const [mount, setMount] = useState(false);
  const [poolKeyHash] = useState(poolId);
  const [amount, setAmount] = useState("1");
  const [token0] = useState(MockFUSDAddress);
  const [token1] = useState(MockUSDTAddress);
  const [v4Token0] = useState<Token>(
    new Token(activeChainId, token0, 18, "FUSD", "FUSD")
  );
  const [v4Token1] = useState<Token>(
    new Token(activeChainId, token1, 6, "USDT", "USDT")
  );
  const [tokenIn, setTokenIn] = useState<Token>(v4Token0);
  const [tokenOut, setTokenOut] = useState<Token>(v4Token1);
  const signer = useEthersSigner();
  const [exeuteSwapQuoteCallback, setExecuteSwapQuoteCallback] =
    useState<Function>(() => {});
  const { address }: { address: `0x${string}` } = useAccount() as any;
  const { loading, quote, quoteLoading, updateAmountIn } = V4UseSwap(
    activeChainId,
    amount,
    signer,
    v4Token0,
    v4Token1
  );
  const [tokenABalance, setTokenABalance] = useState<string>("-");
  const [tokenBBalance, setTokenBBalance] = useState<string>("-");
  const [isNFTHolderState, setIsNFTHolderState] = useState(true);
  const [isPlayerTurnState, setIsPlayerTurnState] = useState(true);

//0x3A3CeF3A0cb8B1bA0812b23E15CF125B11098032
//0xe2d084a729df207afea549782ed1b9b2054244c3f70dcb27eb3f766063d8d9b7
  const { data:swapEvent, isLoading, isError } = useQuery<SwapEvent[]>({
    queryKey: ['swaps',poolKeyHash,address],
    queryFn: () => fetchSwapsFromSubgraph(poolKeyHash,address ?? null),
    enabled: !!poolKeyHash , // only run when both are available
    staleTime: 1000 * 60 * 5, // optional: cache for 5 minutes
  });



  useEffect(() => {
    if (!mount && signer && address) {
      fetchBalancesAndPrint();
      onAmountChange();
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
    const tokenABalance = await fetchBalance(tokenIn.address);
    const tokenBBalance = await fetchBalance(tokenOut.address);
    setTokenABalance(formatBalance(tokenABalance, tokenIn.decimals));
    setTokenBBalance(formatBalance(tokenBBalance, tokenOut.decimals));
  };

  useEffect(() => {
    if (address) {
      fetchBalancesAndPrint();
    }
    onAmountChange();
  }, [tokenOut, tokenIn]);

  const handleToggleTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
  };

  const arbSwap = async () => {
    exeuteSwapQuoteCallback();
  };

  async function onAmountChange() {
    const cb = await updateAmountIn(amount, tokenIn.address === token0, signer);
    setExecuteSwapQuoteCallback(() => cb);
  }

  useEffect(() => {
    if (amount) {
      if (autofillTimeout) {
        clearTimeout(autofillTimeout);
      }
      autofillTimeout = setTimeout(() => {
        onAmountChange();
      }, 700);
    }
  }, [amount]);

  const connetButton = () => {
    open({ view: "Account" });
    open();
  };

  return (
    <div>
      <section className="pb-[50px] md:pb-[75px] relative">
        <Title className="text-center">Swap Tokens</Title>
        <Container>
          <div className="max-w-[620px] p-3 sm:p-6 mx-auto bg-white/10 rounded-[24px] mt-8">
            <div className="">
              {/* Token A Input */}
              <div className="p-5 rounded-2xl border-white/20 border-[1px] text-primary">
                <BalanceDisplay label="Input Token" balance={tokenABalance} />
                <TokenInput
                  amount={amount}
                  setAmount={setAmount}
                  token={tokenIn}
                  setToken={(token: any) => {}}
                  options={[
                    {
                      value: tokenIn,
                      label: tokenIn.symbol || "-",
                    },
                  ]}
                />
              </div>

              {/* Toggle Button */}
              <div className="flex justify-center my-4">
                <button
                  onClick={handleToggleTokens}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full transition"
                >
                  <svg
                    className="transition-all duration-300 hover:scale-[113%]"
                    width="40"
                    height="27"
                    viewBox="0 0 40 27"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M25.2391 21.7921L22.0021 18.4571C21.0618 17.4883 21.0618 15.9476 22.0021 14.9788C22.9261 14.0268 24.4541 14.0268 25.3781 14.9788L25.676 15.2857L27.662 17.3318L27.662 8.98387L27.662 3.13885C27.662 1.76786 28.7734 0.656443 30.1444 0.656443C31.5154 0.656443 32.6268 1.76786 32.6268 3.13886L32.6268 8.98387L32.6268 17.3318L34.6127 15.2857L34.9106 14.9788C35.8346 14.0268 37.3627 14.0268 38.2867 14.9788C39.227 15.9476 39.227 17.4883 38.2867 18.4571L35.0695 21.7717L33.0147 23.8887C31.4435 25.5075 28.8453 25.5075 27.2741 23.8887L25.2391 21.7921Z"
                      fill="#4A88ED"
                    />
                    <path
                      d="M14.952 11.5602L12.9661 9.51414L12.9661 17.862L12.9661 23.707C12.9661 25.078 11.8547 26.1894 10.4837 26.1894C9.11267 26.1894 8.00126 25.078 8.00126 23.707L8.00126 17.862L8.00126 9.51414L6.01533 11.5602L5.71744 11.8671C4.79342 12.8191 3.26538 12.8191 2.34136 11.8671C1.40105 10.8983 1.40105 9.35759 2.34136 8.38881L5.55857 5.07421L7.61339 2.95718C9.18457 1.33843 11.7828 1.33843 13.354 2.95718L15.3889 5.05375L18.626 8.38881C19.5663 9.35759 19.5663 10.8983 18.626 11.8671C17.702 12.8191 16.1739 12.8191 15.2499 11.8671L14.952 11.5602Z"
                      fill="#4A88ED"
                    />
                  </svg>
                </button>
              </div>

              {/* Token B Output */}
              <div className="p-5 rounded-2xl border-white/20 border-[1px] text-primary">
                <BalanceDisplay label="Output Token" balance={tokenBBalance} />
                <TokenInput
                  amount={
                    quoteLoading
                      ? "---" // Show a placeholder text during quote calculation
                      : Number(quote).toFixed(6) || "0"
                  }
                  setAmount={() => {}} // Disable changing amount for output token
                  token={tokenOut}
                  setToken={(token: any) => {}}
                  options={[
                    {
                      value: tokenOut,
                      label: tokenOut.symbol || "-",
                    },
                  ]}
                />
              </div>
              <div className="pt-6">
                {address ? (
                  mount && isNFTHolderState && isPlayerTurnState ? (
                    <button
                      disabled={quoteLoading || loading}
                      onClick={arbSwap}
                      className="btn btn-primary w-full hover:scale-105 transition-transform duration-200"
                    >
                      {quoteLoading || loading ? (
                        <ScaleLoader
                          height={20}
                          loading={true}
                          color="#ffffff"
                          className="text-white"
                          aria-label="Loading Spinner"
                          data-testid="loader"
                        />
                      ) : (
                        "Swap"
                      )}
                    </button>
                  ) : null
                ) : (
                  <button
                    onClick={connetButton} // Replace with your wallet connect function
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
      </section>

            <Container>
            <div className="overflow-hidden p-[30px] md:p-[72px] border-[1px] border-white/20 rounded-[32px] bg-[#04152F78] relative">
  <div className="relative z-[5]">
    <Subtitle className="mb-1">Status</Subtitle>
    <Title>Action Windows</Title>
    <div className="overflow-x-auto mt-10 md:mt-14">
      {isLoading ? (
        <div className="text-center py-10 text-lg text-white">Loading...</div>
      ) : !swapEvent || swapEvent.length === 0 ? (
        <div className="text-center py-10 text-lg text-white">No event found</div>
      ) : (
        <table className="min-w-full text-primary px-6 table-auto">
          <thead>
            <tr className="text-left text-base md:text-xl font-bold">
              <th className="py-4 pr-4">Time</th>
              {!address && <th className="pr-4">User</th>}
              <th className="pr-4">Type</th>
              <th className="pr-4">Amount</th>
            </tr>
          </thead>
          <tbody>
            {swapEvent.map((item, i) => (
              <SwapEventRow key={i} data={item} address={address} />
            ))}
          </tbody>
        </table>
      )}
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


      <Rounds poolKeyHash={poolKeyHash} />
    </div>
  );
};

export default V4SwapComponent;
