import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import LPStakingCard from "../../components/stake/LPStakingCard";
import { PositionInfo } from "../../type";
import { toast } from "sonner";
type LPStakingModalProps = {
  open: boolean;
  onClose: () => void;
  positions: PositionInfo[];
  selectedNFT: number | null;
  onSelectNFT: (nft: number) => void;
  handleStakeOrUnstake: () => void;
  isStake: boolean;
  rewardsByTokenId:any
};

export default function LPStakingModal({
  open,
  onClose,
  positions,
  onSelectNFT,
  selectedNFT,
  handleStakeOrUnstake,
  isStake,
  rewardsByTokenId,
}: LPStakingModalProps) {
  const stake = () => {
    if (selectedNFT == null) return toast.info(`Select a position to ${isStake ? "stake":"withdraw"}`);
    onClose();
    handleStakeOrUnstake();
  };
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-3xl transform overflow-hidden rounded-2xl border border-white/10 bg-[#131823] shadow-xl transition-all text-white">
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <h2 className="text-xl font-semibold">
                    {isStake
                      ? " My Liquidity Positions"
                      : "My Staked Positions"}
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* CONTENT */}
                <div className="p-6 max-h-[75vh] py-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                  {positions.length > 0 ? (
                    positions.map((pos) => (
                      <LPStakingCard
                        selectedNFT={selectedNFT}
                        onSelectNFT={onSelectNFT}
                        key={pos.tokenId}
                        data={pos}
                        isStake={isStake}
                        reward={rewardsByTokenId[pos.tokenId.toString()] || "0"} // pass reward

                      />
                    ))
                  ) : (
                    <p className="text-center text-gray-400">
                      No liquidity positions found.
                    </p>
                  )}
                </div>

                <div className="px-6 mb-6">
                  <button
                    onClick={() => stake()}
                    className="py-3 px-6  hover:scale-[1.01] transition-all  !rounded-xl bg-[#00ffe4]/65 font-medium ! outline-none text-white w-full"
                  >
                    {isStake ? "Stake" : "Withdraw"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
