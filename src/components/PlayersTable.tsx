import React, { useEffect, useState } from 'react';
import { useReadContracts, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { TimeSlotSystemAddress, MockERC721Address } from '../contractAddress';
import TimeSlotSystemAbi from '../abi/TimeSlotSystem_abi.json';
import MockERC721Abi from '../abi/MockERC721_abi.json';
import Image from 'next/image';

type Address = `0x${string}`;

interface NFT {
    owner: string;
    id: number;
  }

const PlayersTable: React.FC = () => {
    const [allNfts, setAllNfts] = useState<NFT[]>([]);

    const { data: contractData, isError, isLoading } = useReadContracts({
      contracts: [
        {
          address: TimeSlotSystemAddress,
          abi: TimeSlotSystemAbi,
          functionName: 'getPlayDuration',
        },
        {
          address: MockERC721Address as `0x${string}`,
          abi: MockERC721Abi,
          functionName: 'getAllOwners',
        }
      ],
    });
  
    const [playDuration, owners] = contractData || [];
  
    const { data: ownedTokensResult } = useReadContracts({
      contracts: (owners?.result as Address[] | undefined)?.map(owner => ({
        address: MockERC721Address as `0x${string}`,
        abi: MockERC721Abi,
        functionName: 'getOwnedTokenIds',
        args: [owner] as const,
      })) ?? [],
    });
  
    useEffect(() => {
      if (owners?.result && ownedTokensResult) {
        const nfts = (owners.result as Address[]).flatMap((owner, index) => {
          const tokenIds = ownedTokensResult[index].result as bigint[] | undefined;
          if (!tokenIds) return [];
  
          return tokenIds.map(id => ({
            owner,
            id: Number(id),
          }));
        });
  
        setAllNfts(nfts);
      }
    }, [owners, ownedTokensResult]);
  
    if (isLoading) return <div className="alert">Loading players information...</div>;
    if (isError) return <div className="alert alert-error">Error fetching players information</div>;
  
    const numberOfPlayers = owners?.result ? (owners.result as Address[]).length : 0;
    const numberOfPlays = allNfts.length;

  return (
  <div className="card w-full bg-base-300 shadow-xl">
    <div className="card-body">
      <h2 className="card-title justify-center">Players</h2>
      <div className="stats stats-vertical shadow">
        <div className="stat">
          <div className="stat-title">Number of Players</div>
          <div className="stat-value text-xl">{numberOfPlayers}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Number of Plays</div>
          <div className="stat-value text-xl">{numberOfPlays}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Play Duration</div>
          <div className="stat-value text-xl">
            {!playDuration?.error 
              ? `${Math.floor(Number(formatUnits(playDuration.result, 0)) / 3600)}h`
              : '1h'}
          </div>
        </div>
      </div>
      <h3 className="text-lg font-bold mt-4">All Plays</h3>
      <div className="overflow-x-auto" style={{ maxHeight: '300px' }}>
        <table className="table w-full">
          <thead>
            <tr>
              <th>NFT</th>
              <th>ID</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {allNfts.slice(0, 4).map((nft) => (
                <tr key={`${nft.owner}-${nft.id}`}>
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
                <td>{`${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`}</td>
                </tr>
            ))}
        </tbody>

        </table>
      </div>
    </div>
  </div>
);

};

export default PlayersTable;
