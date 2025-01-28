import Image from "next/image";
import { useContractRead } from "wagmi";
import { NFT_ADDR, ChainId } from "../../config";
import { erc721Abi } from "viem";

interface NftCarouselItemProps {
  nft: {
    id: string;
    tokenId: string;
    image:string
  };
  onClick: (nft: any) => void; // Callback for when the NFT is clicked
}

const NftCarouselItem: React.FC<NftCarouselItemProps> = ({ nft, onClick }) => {
  const { data: owner, isLoading } = useContractRead({
    address: NFT_ADDR as `0x${string}`,
    abi: erc721Abi,
    functionName: "ownerOf",
    // @ts-ignore
    args: [nft.tokenId],
    chainId: ChainId,
    enabled: !!nft.tokenId,
  });

  const formatOwner = (owner: string | undefined) => {
    if (!owner) return "Fetching...";
    return `${owner.slice(0, 6)}...${owner.slice(-4)}`;
  };


  return (
    <div
      key={`${owner || "unknown"}-${nft.id}`}
      className="carousel-item relative w-full h-96"
      onClick={() => onClick(nft)}
    >
      <img
        src={nft.image}
        alt={`NFT ${nft.id}`}
        width={500}
        height={600}
        // layout="responsive"
        className={`w-full object-cover rounded-[25px] overflow-hidden ${
        "border-4 border-yellow-400" 
        }`}

      />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
        <p className="text-xl font-bold text-white">NFT #{nft.tokenId}</p>
        <p className="text-sm text-gray-300">Owner: {isLoading ? "Loading..." : formatOwner(owner)}</p>
      </div>
    </div>
  );
};

export default NftCarouselItem;
