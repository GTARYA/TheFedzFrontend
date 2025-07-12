import { Fragment, useEffect, useState } from "react";
import { useReadContracts, useChainId } from "wagmi";
import { ERC721Address as MockERC721Address } from "../contractAddressArbitrum";
import MockERC721Abi from "../abi/MockERC721_abi.json";
import Image from "next/image";
import Container from "./Container";
import Title from "./ui/Title";
import SortSelector from "./nft/SortSelector";
import { getLatestEventForTurn } from "../hooks/fedz";
import NFTTableRow from "./nft/NFTTableRow";
import { formatDuration } from "../hooks/formatters";
import { useEthersSigner } from "../hooks/useEthersSigner";
import { web3Provider } from "../utils/provider";
import {
  fetchActingPlayer,
  fetchNextActingPlayer,
  fetchSlotDuration,
  fetchTokenCount,
  getPlayersTurnOrder,
} from "../hooks/fedz";

type Address = `0x${string}`;

interface NFT {
  owner: string;
  id: number;
}

const PlayersTable: React.FC = () => {
  const activeChainId = useChainId();
  const signer = useEthersSigner();
  const [mount, setMount] = useState(false);
  const [allNfts, setAllNfts] = useState<NFT[]>([]);
  const [slotDuration, setSlotDuration] = useState("1h");
  const [roundNumber, setRoundNumber] = useState(0);

  const [nfts, setNFTs] = useState<any>([]);
  const fetchNFTs = async () => {
    const data: any = await getLatestEventForTurn();

    if (data) {
      setRoundNumber(data.roundNumber + 3);
      setNFTs(data.turnOrder);
    }
  };

  const {
    data: contractData,
    isError,
    isLoading,
  } = useReadContracts({
    contracts: [
      {
        address: MockERC721Address as `0x${string}`,
        abi: MockERC721Abi,
        functionName: "getAllOwners",
      },
    ],
  });
  const [owners] = contractData || [];
  const [actingPlayer, setActingPlayer] = useState<string>();
  const [upCommingPlayer, setUpCommingPlayer] = useState<string>();
  const [numberOfPlayers, setNumberOfPlayers] = useState<string>("");

  useEffect(() => {
    fetchNFTs();
  }, [upCommingPlayer, numberOfPlayers]);

  useEffect(() => {
    if (!mount) {
      fetchSlotDuration(web3Provider).then((duration) => {
        setSlotDuration(formatDuration(duration));
        fetchNextActingPlayer(web3Provider, duration).then((next) => {
          setUpCommingPlayer(next);
        });
      });
      fetchActingPlayer(web3Provider).then((actingPlayer) => {
        setActingPlayer(actingPlayer);
      });
      fetchTokenCount(web3Provider).then((count) => {
        setNumberOfPlayers(count.toString());
      });
      setMount(true);
    }
  }, [mount, signer]);
  const { data: ownedTokensResult } = useReadContracts({
    // @ts-ignore
    contracts:
      (owners?.result as Address[] | undefined)?.map((owner) => ({
        address: MockERC721Address as `0x${string}`,
        abi: MockERC721Abi,
        functionName: "getOwnedTokenIds",
        args: [owner] as const,
      })) ?? [],
  });

  useEffect(() => {
    if (owners?.result && ownedTokensResult) {
      const nfts = (owners.result as Address[]).flatMap((owner, index) => {
        const tokenIds = ownedTokensResult[index].result as
          | bigint[]
          | undefined;
        if (!tokenIds) return [];

        return tokenIds.map((id) => ({
          owner,
          id: Number(id),
        }));
      });

      setAllNfts(nfts);
    }
  }, [owners, ownedTokensResult]);

  if (isLoading)
    return <div className="alert">Loading players information...</div>;
  if (isError)
    return (
      <div className="alert alert-error">
        Error fetching players information
      </div>
    );

  const handleSortChange = (sortBy: string) => {
    const sortedNFTs = [...nfts].sort((a, b) => {
      if (sortBy === "tokenId") {
        return Number(a.tokenId) - Number(b.tokenId);
      }
      return a.timestamp - b.timestamp;
    });

    setNFTs(sortedNFTs);
  };

  return (
    <div suppressHydrationWarning>
      <section className="pb-[50px] md:pb-[75px] relative mt-16">
        <Container>
          <div className="card w-full bg-white/5 border-white/20 border-[1px] shadow-xl relative overflow-hidden">
            <div className="py-5 md:py-12 relative z-[5]">
              <Title className="px-14">Players</Title>
              <div>
                <div className="w-full text-sm md:text-xl text-primary">
                  <div className="px-14 py-4 border-b border-white/10">
                    <p className="text-sm md:text-lg font-normal text-primary mb-2">
                      Number of Players
                    </p>
                    <h3 className="text-base md:text-xl font-bold">
                      {numberOfPlayers}
                    </h3>
                  </div>
                </div>
                <div className="w-full text-sm md:text-xl text-primary">
                  <div className="px-14 py-4">
                    <p className="text-sm md:text-lg font-normal text-primary mb-2">
                      Play Duration
                    </p>
                    <h3 className="text-base md:text-xl font-bold">
                      {slotDuration}
                    </h3>
                  </div>
                </div>

                <div className="w-full text-sm md:text-xl text-primary">
                  <div className="px-14 py-4">
                    <p className="text-sm md:text-lg font-normal text-primary mb-2">
                      Current Round
                    </p>
                    <h3 className="text-base md:text-xl font-bold">
                      {roundNumber}
                    </h3>
                  </div>
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
        <img
          src="/cursor/11.png"
          alt="money"
          className="absolute w-full top-0 hidden lg:block md:-top-[10px] lg:top-[100px] left-[10px] md:left-[10px] max-w-[60px] md:max-w-[120px] pointer-events-none"
        />

        <img
          src="/cursor/1.png"
          alt="coin"
          className="absolute w-full -bottom-[20px] md:bottom-[10px] right-[20px] max-w-[40px] md:max-w-[60px] pointer-events-none"
        />
      </section>

      <section className="py-[50px] md:py-[75px] relative">
        <Container className="relative z-[5]">
          <div className="flex flex-row justify-between items-center">
            <Title>All Plays</Title>
            <SortSelector onSortChange={handleSortChange} />
          </div>

          <div className="card w-full mt-5 md:mt-10 bg-white/5 border-white/20 border-[1px] shadow-xl relative overflow-hidden">
            {
              <div
                className="overflow-x-auto clear-start p-5 md:p-10 relative z-[5]"
                style={{ maxHeight: "600px" }}
              >
                <table className="table w-full text-primary">
                  <thead>
                    <tr className="text-primary border-white/20 font-semibold text-base md:text-lg">
                      <th>NFT</th>
                      <th>ID</th>
                      <th>Owner</th>
                      <th>FEDZ Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nfts?.map((nft: any, indx: any) => (
                      <NFTTableRow
                        key={indx}
                        nft={nft}
                        actingPlayer={actingPlayer}
                        upCommingPlayer={upCommingPlayer}
                        onPointUpdated={fetchNFTs}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            }

            {
              <div
                className="overflow-x-auto clear-start p-5 md:p-10 relative z-[5] hidden"
                style={{ maxHeight: "600px" }}
              >
                <table className="table w-full text-primary">
                  <thead>
                    <tr className="text-primary border-white/20 font-semibold text-base md:text-lg">
                      <th>NFT</th>
                      <th>ID</th>
                      <th>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allNfts?.slice(0, 4).map((nft) => (
                      <tr
                        className="border-none"
                        key={`${nft.owner}-${nft.id}`}
                      >
                        <td>
                          <Image
                            src={`/NftPictures/nft_${nft.id}.jpg`}
                            alt={`NFT ${nft.id}`}
                            width={48}
                            height={48}
                            className="rounded"
                          />
                        </td>
                        <td>{nft.id}</td>
                        <td>{`${nft.owner.slice(0, 6)}...${nft.owner.slice(
                          -4
                        )}`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
            <img
              src="/blue-glare2.png"
              alt="eppilse"
              className="absolute top-0 left-0 pointer-events-none"
            />
          </div>
        </Container>
        <img
          src="/blue-glare4.png"
          alt="eppilse"
          className="absolute -bottom-[50%] right-0 pointer-events-none"
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

export default PlayersTable;
