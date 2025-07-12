import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ShieldCheck,
  ArrowUpRight,
  MoveDown,
} from "lucide-react";
import { StepStatus } from "../../type";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Minus,
  ArrowUpDown,
  ArrowLeftRight,
  LoaderCircle,
  CircleCheckBig,
  CircleX,
} from "lucide-react";
import ScaleLoader from "react-spinners/ScaleLoader";
interface Props {
  open: boolean;
  onClose: () => void;
  approvalStatus: StepStatus;
  stakingStatus: StepStatus;
  stakeLoading: boolean;
  onConfirm: () => void;
}

const getStatusIcon = (status: StepStatus) => {
  switch (status) {
    case "loading":
      return <LoaderCircle className="w-5 h-5 animate-spin text-blue-500" />;
    case "done":
      return <CircleCheckBig className="w-5 h-5 text-green-500" />;
    case "error":
      return <CircleX className="w-5 h-5 text-[#ff0000]" />;
    default:
      return null;
  }
};

export default function StakingProgressModal({
  open,
  onClose,
  approvalStatus,
  stakingStatus,
  stakeLoading,
  onConfirm,
}: Props) {
  const isFinished = approvalStatus === "done" && stakingStatus === "done";
  const isError = approvalStatus === "error" || stakingStatus === "error";
  const showClose = isFinished || isError;
  const isInactive = (status: StepStatus) =>
    !["loading", "error"].includes(status);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => showClose && onClose()}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/90" />
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
              <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden pb-4 rounded-2xl border border-white/10 bg-black  shadow-xl transition-all text-white">
                <img
                  src="/blue-glare2.png"
                  alt="glare"
                  className="absolute top-0 left-0 pointer-events-none"
                ></img>

                <div className="flex flex-row items-center justify-between px-6 py-5 border-b-[1px] border-white/10 ">
                  <div className="text-white">Stake in Progress</div>

                  <button
                    className=" text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="py-6 px-6 space-y-3">
                  <div
                    className={`flex items-center space-x-3 ${
                      isInactive(approvalStatus) ? "opacity-40" : ""
                    }`}
                  >
                    <span>1. Approving NFT</span>
                    {getStatusIcon(approvalStatus)}
                  </div>

                  <div
                    className={`flex items-center space-x-3 ${
                      isInactive(stakingStatus) ? "opacity-40" : ""
                    }`}
                  >
                    <span>2.Confirm Staking </span>
                    {getStatusIcon(stakingStatus)}
                  </div>
                </div>

                <div className="px-6 py-3">
                  <button
                    className=" btn btn-primary w-full rounded-2xl  transition-transform duration-200 "
                    onClick={onConfirm}
                  >
                    {stakeLoading ? (
                      <ScaleLoader
                        height={20}
                        loading={true}
                        color="#ffffff"
                        className="text-white"
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      />
                    ) : (
                      "Approve and stake"
                    )}
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
