import React, { useState, useEffect } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { MockERC721Address } from '../contractAddress';
import MockERC721Abi from '../abi/MockERC721_abi.json';
import Image from 'next/image';
import { Abi } from 'viem';
import TimeSlotSystem from './TimeSlotSystem'; // Import the TimeSlotSystem component
import RoundInfos from './RoundInfos';

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

  const { data: ownersResult } = useReadContracts({
    contracts: [
      {
        address: MockERC721Address as `0x${string}`,
        abi: MockERC721Abi as Abi,
        functionName: 'getAllOwners',
      }
    ]
  });

  const owners = ownersResult?.[0].result as Address[] | undefined;

  const { data: ownedTokensResult } = useReadContracts({
    contracts: owners?.map(owner => ({
      address: MockERC721Address as `0x${string}`,
      abi: MockERC721Abi as Abi,
      functionName: 'getOwnedTokenIds',
      args: [owner] as const,
    })) ?? [],
  });

  useEffect(() => {
  if (owners && ownedTokensResult) {
    const nfts = owners.flatMap((owner, index) => {
      const tokenIds = ownedTokensResult[index].result as bigint[] | undefined;
      if (!tokenIds) return [];

      return tokenIds.map(id => ({
        owner,
        id: Number(id),
      }));
    });

    // Sort NFTs: connected user's NFT first
    nfts.sort((a, b) => {
      if (a.owner === address) return -1;
      if (b.owner === address) return 1;
      return 0;
    });

    setAllNfts(nfts);
  }
}, [owners, ownedTokensResult, address]);


const handleNftClick = (nft: NFT) => {
  if (selectedNft && selectedNft.id === nft.id && selectedNft.owner === nft.owner) {
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

  if (!owners || !ownedTokensResult) {
    return <div>Loading ...</div>;
  }

  return (
  <div className="flex mt-6 justify-center">
    
    <div className="card bg-base-100 shadow-xl h-full">
      <div className="card-body">
        <h2 className="card-title justify-center text-center mb-4">All NFTs</h2>
        <div className="w-full max-w-xl mx-auto">
          <div className="carousel carousel-vertical rounded-box h-96">
            {allNfts.map((nft) => (
              <div key={`${nft.owner}-${nft.id}`} className="carousel-item relative w-full h-96" onClick={() => handleNftClick(nft)}>
                <Image 
                  src={`/NftPictures/nft_${nft.id}.jpg`}
                  alt={`NFT ${nft.id}`}
                  width={500}
                  height={500}
                  layout="responsive"
                  className={`w-full ${nft.owner === address ? 'border-4 border-yellow-400' : ''}`}
                  style={{
                    objectFit: "cover",
                    borderRadius: "25px",
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                  <p className="text-xl font-bold text-white">NFT #{nft.id}</p>
                  <p className="text-sm text-gray-300">
                    Owner: {nft.owner === address ? 'You' : `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      

      </div>
    </div>

     <div className="card  bg-base-100 shadow-xl flex flex-col ml-6">
      {selectedNft && address && (
            <div className="card-body">
              <h3 className="card-title text-lg font-bold">Selected NFT: #{selectedNft.id}</h3>
              <h2 className="card-title text-md font-bold text-white mb-8">Owner: {selectedNft.owner === address ? 'You' : selectedNft.owner}</h2>
              <TimeSlotSystem address={selectedNft.owner as `0x${string}`} />
              <RoundInfos />
            </div>
          )}
    </div>
  </div>
);

};

export default NftComponent;
