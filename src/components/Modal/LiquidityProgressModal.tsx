import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect } from "react";
import {
  CheckCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Minus,
  Plus,
  LoaderCircle,
  CircleCheckBig,
  CircleX,
} from "lucide-react";
import ScaleLoader from "react-spinners/ScaleLoader";
import { Token, CurrencyAmount } from "@uniswap/sdk-core";
import { StepStatus, LiquidityStep } from "../../type";

interface Props {
  open: boolean;
  onClose: () => void;
  amount0: CurrencyAmount<any>;
  amount1: CurrencyAmount<any>;
  liquidity: string;
  handleAddLiquidity: () => Promise<void>;
  onDone: () => void;
  addingLiquidityLoading: boolean;
  currentStep: string;
  stepStatuses: Record<string, StepStatus>;
  isRoundStepShow: boolean;
}

const getStatusIcon = (status: StepStatus) => {
  switch (status) {
    case "loading":
      return <LoaderCircle className="w-5 h-5 animate-spin text-blue-500" />;
    case "done":
      return <CircleCheckBig className="w-5 h-5 text-green-500" />;
    case "error":
      return <CircleX className="w-5 h-5 text-red-500" />;
    default:
      return null;
  }
};

const TokenDisplay: React.FC<{ token: Token; amount: string | number }> = ({
  amount,
  token,
}) => (
  <div className="mx-auto space-y-5 relative border-[1px] border-white/10 bg-white/5 w-full text-center rounded-2xl py-5">
    <img
      className="w-[35px] md:w-[50px] mx-auto pointer-events-none rounded-full"
      src={`/token/${token.address}.png`}
      alt={token.symbol || ""}
    />
    <p className="text-white text-sm md:text-base opacity-70 uppercase text-center mx-auto max-w-[150px] px-3 truncate">
      {amount} <span className="font-bold">{token.symbol}</span>
    </p>
  </div>
);

export default function LiquidityProgressModal({
  open,
  onClose,
  amount0,
  amount1,
  liquidity,
  handleAddLiquidity,
  addingLiquidityLoading,
  currentStep,
  stepStatuses,
  isRoundStepShow,
}: Props) {
  const isProcessing = addingLiquidityLoading;
  const isFinished = Object.values(stepStatuses).every((s) => s === "done");
  const isError = Object.values(stepStatuses).some((s) => s === "error");
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
        {/* backdrop */}
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
              <Dialog.Panel className="relative w-full max-w-lg transform overflow-hidden rounded-2xl border-[1px] border-white/10 text-center shadow-xl transition-all pb-6 bg-black">
                <img
                  src="/blue-glare2.png"
                  alt="glare"
                  className="absolute top-0 left-0 pointer-events-none"
                />

                <div className="flex flex-row items-center justify-between px-6 py-5 border-b-[1px] border-white/10">
                  <div className="text-white">Add Liquidity in Progress</div>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-[1fr_50px_1fr] items-center px-6 mt-6">
                  <TokenDisplay
                    amount={amount0.toSignificant()}
                    token={amount0.currency}
                  />
                  <Plus className="text-white w-8 md:min-w-14 mx-auto" />
                  <TokenDisplay
                    amount={amount1.toSignificant()}
                    token={amount1.currency}
                  />
                </div>

                <div className="px-6 mt-4 text-sm text-white/70">
                  Rate: 1 {amount0.currency.symbol} ={" "}
                  {(
                    parseFloat(amount0.toSignificant()) /
                    parseFloat(amount1.toSignificant())
                  ).toPrecision(6)}{" "}
                  {amount1.currency.symbol}
                </div>

                {/* Step List */}
                <div className="space-y-[10px] py-6 px-6 mt-3">
                  {/* Round  Addition Step */}
                  {isRoundStepShow && (
                    <div className="grid grid-cols-1">
                      <div
                        className={`flex items-center space-x-3 text-white ${
                          isInactive(stepStatuses[LiquidityStep.UnlockingRound])
                            ? "opacity-40"
                            : ""
                        }`}
                      >
                        <div className="border-[1px] border-white/5 bg-white/15 aspect-square rounded-full w-8 flex justify-center items-center">
                          <Plus className="w-4 text-white/50" />
                        </div>

                        <div className="flex flex-row items-center gap-2">
                          <span>Unlock Round</span>
                          {getStatusIcon(
                            stepStatuses[LiquidityStep.UnlockingRound]
                          )}
                        </div>
                      </div>
                      <div>
                        <Minus className="rotate-90 w-[30px] text-white/20 text-right flex-end mt-[10px]" />
                      </div>
                    </div>
                  )}

                  {/* Approve Token0 Step */}
                  <div className="grid grid-cols-1">
                    <div
                      className={`flex items-center space-x-3 text-white ${
                        isInactive(stepStatuses[LiquidityStep.ApprovingToken0])
                          ? "opacity-40"
                          : ""
                      }`}
                    >
                      <img
                        src={`/token/${amount0.currency.address}.png`}
                        className="w-[30px]"
                      />

                      <div className="flex flex-row items-center gap-2">
                        <span>Approve {amount0.currency.symbol}</span>
                        {getStatusIcon(
                          stepStatuses[LiquidityStep.ApprovingToken0]
                        )}
                      </div>
                    </div>
                    <div>
                      <Minus className="rotate-90 w-[30px] text-white/20 text-right flex-end mt-[10px]" />
                    </div>
                  </div>

                  {/* Approve Token1 Step */}
                  <div className="grid grid-cols-1">
                    <div
                      className={`flex items-center space-x-3 text-white ${
                        isInactive(stepStatuses[LiquidityStep.ApprovingToken1])
                          ? "opacity-40"
                          : ""
                      }`}
                    >
                      <img
                        src={`/token/${amount1.currency.address}.png`}
                        className="w-[30px]"
                      />

                      <div className="flex flex-row items-center gap-2">
                        <span>Approve {amount1.currency.symbol}</span>
                        {getStatusIcon(
                          stepStatuses[LiquidityStep.ApprovingToken1]
                        )}
                      </div>
                    </div>
                    <div>
                      <Minus className="rotate-90 w-[30px] text-white/20 text-right flex-end mt-[10px]" />
                    </div>
                  </div>

                  {/* Permit Step */}
                  <div className="grid grid-cols-1">
                    <div
                      className={`flex items-center space-x-3 text-white ${
                        isInactive(stepStatuses[LiquidityStep.SigningPermit])
                          ? "opacity-40"
                          : ""
                      }`}
                    >
                      <div className="border-[1px] border-white/5 bg-white/15 aspect-square rounded-full w-8 flex justify-center items-center">
                        <CheckCircleIcon className="w-4 text-white/50" />
                      </div>

                      <div className="flex flex-row items-center gap-2">
                        <span>Permit Transfers</span>
                        {getStatusIcon(
                          stepStatuses[LiquidityStep.SigningPermit]
                        )}
                      </div>
                    </div>
                    <div>
                      <Minus className="rotate-90 w-[30px] text-white/20 text-right flex-end mt-[10px]" />
                    </div>
                  </div>

                  {/* Liquidity Addition Step */}
                  <div
                    className={`flex items-center space-x-3 text-white ${
                      isInactive(stepStatuses[LiquidityStep.AddingLiquidity])
                        ? "opacity-40"
                        : ""
                    }`}
                  >
                    <div className="border-[1px] border-white/5 bg-white/15 aspect-square rounded-full w-8 flex justify-center items-center">
                      <Plus className="w-4 text-white/50" />
                    </div>

                    <div className="flex flex-row items-center gap-2">
                      <span>Adding Liquidity</span>
                      {getStatusIcon(
                        stepStatuses[LiquidityStep.AddingLiquidity]
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="px-6">
                  <button
                    className="mt-6 btn btn-primary w-full rounded-2xl transition-transform duration-200"
                    onClick={handleAddLiquidity}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ScaleLoader
                        height={20}
                        loading={true}
                        color="#ffffff"
                        className="text-white"
                      />
                    ) : (
                      "Add Liquidity"
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
