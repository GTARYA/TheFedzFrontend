import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect } from "react";
import { formatAmount } from "../../utils/address";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Minus, ArrowUpDown, ArrowLeftRight } from "lucide-react";
import ScaleLoader from "react-spinners/ScaleLoader";
import { Token } from "@uniswap/sdk-core";
type StepStatus = "idle" | "loading" | "done" | "error";

interface Props {
  open: boolean;
  onClose: () => void;
  approvalStatus: StepStatus;
  swapStatus: StepStatus;
  permitStatus: StepStatus;

  inputToken: {
    value: any;
    token: Token;
  };
  outputToken: {
    value: any;
    token: Token;
  };
  swap: () => void;
  RESET_MODAL: () => void;
  swapLoading:boolean
}

const getStatusIcon = (status: StepStatus) => {
  switch (status) {
    case "loading":
      return <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-500" />;
    case "done":
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case "error":
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    default:
      return null;
  }
};

type TokenDisplayProps = {
  token: Token;
  amount: string | number;
};

const TokenDisplay: React.FC<TokenDisplayProps> = ({ amount, token }) => {
  return (
    <div className="mx-auto space-y-5 z-1 relative border-[1px] border-white/10 bg-white/5  w-full text-center rounded-2xl py-5">
      <img
        className="w-[35px] md:w-[50px] mx-auto pointer-events-none rounded-full"
        src={"/token/0xdac17f958d2ee523a2206206994597c13d831ec7.webp"}
        alt={token.symbol || ""}
      />
      <div className="space-y-2">
        <p className="text-white  text-sm md:text-base opacity-70 uppercase text-center mx-auto max-w-[150px] px-3 truncate">
          {amount} <span className="font-bold">{token.symbol}</span>
        </p>
      </div>
    </div>
  );
};

export default function ProgressModal({
  open,
  onClose,
  approvalStatus,
  swapStatus,
  inputToken,
  outputToken,
  permitStatus,
  RESET_MODAL,
  swap,
  swapLoading
}: Props) {
  const isFinished = approvalStatus === "done" && swapStatus === "done";
  const isError = approvalStatus === "error" || swapStatus === "error";
  const showClose = isFinished || isError;
  const isInactive = (status: StepStatus) =>
    !["loading", "error"].includes(status);

  useEffect(() => {
    return () => {
      RESET_MODAL();
    };
  }, []);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {
          if (showClose) onClose();
        }}
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
          <div className="fixed inset-0 bg-black/95" />
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
              <Dialog.Panel
                className="relative w-full max-w-lg transform overflow-hidden rounded-2xl border-[1px] border-white/10
                 text-center shadow-xl transition-all pb-6 bg-black"
              >
                <img
                  src="/blue-glare2.png"
                  alt="glare"
                  className="absolute top-0 left-0 pointer-events-none"
                ></img>

                <div className="flex flex-row items-center justify-between px-6 py-5 border-b-[1px] border-white/10 ">
                  <div className="text-white">Swap in Progress</div>

                  <button
                    className=" text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-[1fr_50px_1fr] items-center px-6 mt-6">
                  <TokenDisplay
                    amount={inputToken.value}
                    token={inputToken.token}
                  />
                  <ArrowLeftRight className="text-white w-8 md:min-w-14 mx-auto" />

                  <TokenDisplay
                    amount={outputToken.value}
                    token={outputToken.token}
                  />
                </div>

                {/* Step List */}
                <div className="space-y-[10px] py-6 px-6 mt-3">
                  <div className="grid grid-cols-1 ">
                    <div
                      className={`flex items-center space-x-3 text-white ${
                        isInactive(permitStatus) ? "opacity-40" : ""
                      }`}
                    >
                      <img
                        src={
                          "/token/0xdac17f958d2ee523a2206206994597c13d831ec7.webp"
                        }
                        className="w-[30px]"
                      />

                      <div className="flex flex-row items-center gap-2 ">
                        <span>Permit2 Approval</span>
                        {getStatusIcon(permitStatus)}
                      </div>
                    </div>
                    <div>
                      <Minus className="rotate-90 w-[30px] text-white/40  text-right flex-end  mt-[10px]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 ">
                    <div
                      className={`flex items-center space-x-2 text-white ${
                        isInactive(approvalStatus) ? "opacity-40" : ""
                      }`}
                    >
                      <img
                        src={
                          "/token/0xdac17f958d2ee523a2206206994597c13d831ec7.webp"
                        }
                        className="w-[30px]"
                      />
                      <div className="flex flex-row items-center gap-2 ">
                        <span> Token Approval</span>
                        {getStatusIcon(approvalStatus)}
                      </div>
                    </div>
                    <div>
                      <Minus className="rotate-90 text-white/40 w-[30px] text-right flex-end  mt-[10px]" />
                    </div>
                  </div>

                  <div
                    className={`flex items-center space-x-3 text-white ${
                      isInactive(swapStatus) ? "opacity-40" : ""
                    }`}
                  >
                    <div className="border-[1px] border-white/5 bg-white/5  aspect-square rounded-full w-8 flex justify-center items-center">
                      <ArrowUpDown className="w-4 text-white/50 " />
                    </div>

                    <div className="flex flex-row items-center gap-2 ">
                      <span> Executing swap</span> {getStatusIcon(swapStatus)}
                    </div>
                  </div>
                </div>

                {/* Bottom Close Button */}

                <div className="px-6">
                  <button
                    className="mt-6 btn btn-primary w-full rounded-2xl  transition-transform duration-200 "
                    onClick={swap}
                  >
                    {swapLoading ? (
                      <ScaleLoader
                        height={20}
                        loading={true}
                        color="#ffffff"
                        className="text-white"
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      />
                    ) : (
                      "Approve and Swap"
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
