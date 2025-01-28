import Image from "next/image";
import { NFT_ADDR, ChainId, OWNER_WALLET } from "../../config";
import { useContractRead, useAccount } from "wagmi";
import { erc721Abi } from "viem";
import { useState } from "react";
import axios from "axios";

interface NFTTableRowProps {
  nft: {
    image: string;
    tokenId: string;
    owner?: string;
    point: number;
  };
  onPointUpdated: () => void; // Callback to refresh data
}

const NFTTableRow: React.FC<NFTTableRowProps> = ({ nft, onPointUpdated }) => {
  const { address } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [newPoint, setNewPoint] = useState(nft.point);
  const [loading, setLoading] = useState(false);

  const { data: owner, isLoading } = useContractRead({
    address: NFT_ADDR as `0x${string}`,
    abi: erc721Abi,
    functionName: "ownerOf",
    // @ts-ignore
    args: [nft.tokenId],
    chainId: ChainId,
    enabled: !!nft.tokenId,
  });

  const isOwnerConnected =
    address?.toLocaleLowerCase() == OWNER_WALLET.toLocaleLowerCase();
  const formatOwner = (owner: string | undefined) => {
    if (!owner) return "Fetching...";
    return `${owner.slice(0, 6)}...${owner.slice(-4)}`;
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setNewPoint(nft.point);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      setLoading(true);
      // API call to update the point in the database
      await axios.post("/api/getAndUpdateNFTs", {
        tokenId: nft.tokenId,
        point: newPoint,
      });
      setIsEditing(false);
      onPointUpdated();
    } catch (error) {
      console.error("Error updating point:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr
      className={`border-none ${
        address?.toLocaleLowerCase() == owner?.toLocaleLowerCase()
          ? "bg-[#4a88ed8a]"
          : ""
      }`}
    >
      <td>
        <img
          src={nft.image}
          alt="nft"
          width={55}
          height={55}
          className="rounded object-fill  "
        />
      </td>
      <td>{nft.tokenId}</td>
      <td>{isLoading ? "Loading..." : formatOwner(owner as string)}</td>
      <td>
        {" "}
        {isEditing ? (
          <input
            type="text"
            value={newPoint}
            onChange={(e) => setNewPoint(Number(e.target.value))}
            className=" p-1 border-white/10 border-[1px] rounded outline-none w-2/3 bg-transparent px-3 py-2"
          />
        ) : (
          nft.point
        )}
      </td>

      {isOwnerConnected && (
        <td>
          {
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveClick}
                    disabled={loading}
                    className="px-4 py-2 bg-lightblue text-white rounded"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancelClick}
                    className="px-4 py-2 bg-gray-500 text-white rounded"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="px-4 py-2 bg-lightblue  text-white rounded"
                >
                  Edit
                </button>
              )}
            </div>
          }
        </td>
      )}
    </tr>
  );
};

export default NFTTableRow;
