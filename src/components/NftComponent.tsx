import React, { useState, useEffect } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { MockERC721Address } from "../contractAddress";
import MockERC721Abi from "../abi/MockERC721_abi.json";
import Image from "next/image";
import { Abi } from "viem";
import TimeSlotSystem from "./TimeSlotSystem"; // Import the TimeSlotSystem component
import RoundInfos from "./RoundInfos";
import Container from "./Container";
import Title from "./ui/Title";
import NftCarouselItem from "./nft/NftCarouselItem";
type Address = `0x${string}`;

interface NFT {
  owner: string;
  id: number;
}

const NftComponent = () => {
  const [allNfts, setAllNfts] = useState<NFT[]>([]);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [showActionWindow, setShowActionWindow] = useState(false);
  const { address } = useAccount();

  const [nfts, setNFTs] = useState<any>([]);

  const fetchNFTs = async () => {
    const response = await fetch("/api/getAndUpdateNFTs");
    const data = await response.json();
    if (data.success) {
      setNFTs(data.nfts);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, []);

  const { data: ownersResult } = useReadContracts({
    contracts: [
      {
        address: MockERC721Address as `0x${string}`,
        abi: MockERC721Abi as Abi,
        functionName: "getAllOwners",
      },
    ],
  });

  const owners = ownersResult?.[0].result as Address[] | undefined;

//   const { data: ownedTokensResult } = useReadContracts({
//     contracts:
//       owners?.map((owner) => ({
//         address: MockERC721Address as `0x${string}`,
//         abi: MockERC721Abi as Abi,
//         functionName: "getOwnedTokenIds",
//         args: [owner] as const,
//       })) ?? [],
//   });

//   useEffect(() => {
//     if (owners && ownedTokensResult) {
//       const nfts = owners.flatMap((owner, index) => {
//         const tokenIds = ownedTokensResult[index].result as
//           | bigint[]
//           | undefined;
//         if (!tokenIds) return [];

//         return tokenIds.map((id) => ({
//           owner,
//           id: Number(id),
//         }));
//       });

//       // Sort NFTs: connected user's NFT first
//       nfts.sort((a, b) => {
//         if (a.owner === address) return -1;
//         if (b.owner === address) return 1;
//         return 0;
//       });

//       setAllNfts(nfts);
//     }
//   }, [owners, ownedTokensResult, address]);

  const handleNftClick = (nft: NFT) => {
    if (
      selectedNft &&
      selectedNft.id === nft.id &&
      selectedNft.owner === nft.owner
    ) {
      // If clicking on the same NFT, toggle the selection off
      setSelectedNft(null);
    } else {
      // If clicking on a different NFT, select it
      setSelectedNft(nft);
    }
  };

  if (!address) {
    return <div>Please connect your wallet</div>;
  }

//   if (!owners || !ownedTokensResult) {
//     return <div>Loading ...</div>;
//   }

  return (
    <section className="mb-[50px] md:mb-[75px] relative">
      <Container className="relative z-[5]">
        <Title className="text-center">All NFTs</Title>
        <div className="flex flex-col gap-6 lg:flex-row mt-6 justify-center">
          <div className="card bg-white/10 shadow-xl h-full">
            <div className="card-body p-5 md:p-10">
              <div className="w-full mx-auto flex justify-center">
                <div className="carousel carousel-vertical rounded-box h-96 space-y-4">
                  {nfts.map((nft: any) => (
                    <NftCarouselItem
                      key={nft.id}
                      nft={nft}
                      onClick={() => {}}
                    />
                  ))}
                </div>
                <div className="carousel carousel-vertical rounded-box h-96 hidden">
                  {allNfts.map((nft) => (
                    <div
                      key={`${nft.owner}-${nft.id}`}
                      className="carousel-item relative w-full h-96"
                      onClick={() => handleNftClick(nft)}
                    >
                      <Image
                        src={`/NftPictures/nft_${nft.id}.jpg`}
                        alt={`NFT ${nft.id}`}
                        width={500}
                        height={500}
                        layout="responsive"
                        className={`w-full ${
                          nft.owner === address
                            ? "border-4 border-yellow-400"
                            : ""
                        }`}
                        style={{
                          objectFit: "cover",
                          borderRadius: "25px",
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                        <p className="text-xl font-bold text-white">
                          NFT #{nft.id}
                        </p>
                        <p className="text-sm text-gray-300">
                          Owner:{" "}
                          {nft.owner === address
                            ? "You"
                            : `${nft.owner.slice(0, 6)}...${nft.owner.slice(
                                -4
                              )}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card  bg-white/10 shadow-xl flex flex-col">
            {selectedNft && address && (
              <div className="card-body p-5 sm:p-10">
                <h3 className="card-title text-lg font-bold text-[#a1a8b6]">
                  Selected NFT: #{selectedNft.id}
                </h3>
                <h2 className="text-md font-bold text-primary mb-8 truncate w-full">
                  Owner:{" "}
                  {selectedNft.owner === address ? "You" : selectedNft.owner}
                </h2>
                <TimeSlotSystem address={selectedNft.owner as `0x${string}`} />
                <RoundInfos isSelf={true} />
              </div>
            )}
          </div>
        </div>
      </Container>

      <img
        src="/cursor/10.png"
        alt="eppilse"
        className="absolute top-[20px] md:top-[50px] left-[40px] md:left-[80px] max-w-[50px] md:max-w-[80px]"
      />
      <img
        src="/cursor/7.png"
        alt="eppilse"
        className="absolute top-[20px] md:top-[80px] right-[50px] md:right-[50px] max-w-[50px] md:max-w-[80px]"
      />
    </section>
  );
};

export default NftComponent;
