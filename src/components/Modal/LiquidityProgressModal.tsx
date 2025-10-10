import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState, useRef } from "react";
import { formatAmount } from "../../utils/address";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Minus,
  ArrowUpDown,
  ArrowLeftRight,
  LoaderCircle,
  CircleCheckBig,
  CircleX,
  Plus,
} from "lucide-react";

import ScaleLoader from "react-spinners/ScaleLoader";
import { Token, CurrencyAmount } from "@uniswap/sdk-core";
import { StepStatus } from "../../type";

interface Props {
  open: boolean;
  onClose: () => void;
  amount0: CurrencyAmount<any>;
  amount1: CurrencyAmount<any>;
  liquidity: string;
  loading: boolean;
  
  // All the validation and action functions
  validateRoundUnlock: () => Promise<boolean>;
  unlockRound: () => Promise<void>;
  validateSufficientBalance: (amount: CurrencyAmount<any>) => Promise<boolean>;
  validateSufficientAllowance: (amount: CurrencyAmount<any>) => Promise<boolean>;
  validateSufficientAllowanceOnPermit2: (amount: CurrencyAmount<any>) => Promise<boolean>;
  approveToken: (amount: CurrencyAmount<any>) => Promise<void>;
  signBatchPermit: (amount0: CurrencyAmount<any>, amount1: CurrencyAmount<any>,deadline: number) => Promise<{permitBatch: any, signature: string}>;
  addLPS: (liquidity: string, deadline:number,permitBatch?: any, sig?: string) => Promise<void>;
  onDone: () => void;
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

type TokenDisplayProps = {
  token: Token;
  amount: string | number;
};

const TokenDisplay: React.FC<TokenDisplayProps> = ({ amount, token }) => {
  return (
    <div className="mx-auto space-y-5 z-1 relative border-[1px] border-white/10 bg-white/5 w-full text-center rounded-2xl py-5">
      <img
        className="w-[35px] md:w-[50px] mx-auto pointer-events-none rounded-full"
        src={`/token/${token.address}.png`}
        alt={token.symbol || ""}
      />
      <div className="space-y-2">
        <p className="text-white text-sm md:text-base opacity-70 uppercase text-center mx-auto max-w-[150px] px-3 truncate">
          {amount} <span className="font-bold">{token.symbol}</span>
        </p>
      </div>
    </div>
  );
};

export default function LiquidityProgressModal({
  open,
  onClose,
  amount0,
  amount1,
  liquidity,
  loading,
  validateRoundUnlock,
  unlockRound,
  validateSufficientBalance,
  validateSufficientAllowance,
  validateSufficientAllowanceOnPermit2,
  approveToken,
  signBatchPermit,
  addLPS,
  onDone,
}: Props) {
  // Step statuses
  const [roundUnlockStatus, setRoundUnlockStatus] = useState<StepStatus>("pending");
  const [token0ApprovalStatus, setToken0ApprovalStatus] = useState<StepStatus>("pending");
  const [token1ApprovalStatus, setToken1ApprovalStatus] = useState<StepStatus>("pending");
  const [permitStatus, setPermitStatus] = useState<StepStatus>("pending");
  const [liquidityStatus, setLiquidityStatus] = useState<StepStatus>("pending");
  
  // Validation states
  const [roundUnlocked, setRoundUnlocked] = useState<boolean>();
  const [sufficientBalance0, setSufficientBalance0] = useState<boolean>();
  const [sufficientBalance1, setSufficientBalance1] = useState<boolean>();
  const [sufficientAllowance0, setSufficientAllowance0] = useState<boolean>();
  const [sufficientAllowance1, setSufficientAllowance1] = useState<boolean>();
  const [batchPermitData, setBatchPermitData] = useState<{permitBatch: any, signature: string}>();
  
  const [currentStep, setCurrentStep] = useState<string>("validating");
  const [isProcessing, setIsProcessing] = useState(false);

  const isFinished = liquidityStatus === "done";
  const isError = [roundUnlockStatus, token0ApprovalStatus, token1ApprovalStatus, permitStatus, liquidityStatus].includes("error");
  const showClose = isFinished || isError;

  useEffect(() => {
    console.log(sufficientAllowance0,"sufficientAllowance0");
      console.log(sufficientAllowance1,"sufficientAllowance1");
  }, [open,sufficientAllowance1,sufficientAllowance1]);

  const isInactive = (status: StepStatus) => !["loading", "error"].includes(status);

  // Initial validation
  const validateAll = async () => {
    try {
      console.log("Starting validation...");
      
      // Check balances first
      const balance0 = await validateSufficientBalance(amount0);
      const balance1 = await validateSufficientBalance(amount1);
      setSufficientBalance0(balance0);
      setSufficientBalance1(balance1);
      
      if (!balance0 || !balance1) {
        console.log("Insufficient balances");
        return;
      }
      
      // Check round unlock
      const unlocked = await validateRoundUnlock();
      setRoundUnlocked(unlocked);
      
      // Check allowances
      const allowance0 = await validateSufficientAllowance(amount0);
      const allowance1 = await validateSufficientAllowance(amount1);
      setSufficientAllowance0(allowance0);
      setSufficientAllowance1(allowance1);


      console.log("Validation complete:", { balance0, balance1, unlocked, allowance0, allowance1 });
    } catch (error) {
      console.error("Validation error:", error);
    }
  };


  useEffect(() => {
    if (open) {
     validateAll();
    }
  }, [open]);

  const executeStep = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Step 1: Unlock round if needed
      if (roundUnlocked === false) {
        setRoundUnlockStatus("loading");
        setCurrentStep("unlocking_round");
        await unlockRound();
        setRoundUnlockStatus("done");
        await validateAll(); // Re-validate after unlocking
        setIsProcessing(false);
        return;
      }
      
      // Step 2: Approve token 0 if needed
      if (sufficientAllowance0 === false) {
        setToken0ApprovalStatus("loading");
        setCurrentStep("approving_token0");
        await approveToken(amount0);
        setToken0ApprovalStatus("done");
        await validateAll(); // Re-validate after approval
        setIsProcessing(false);
        return;
      }
      
      // Step 3: Approve token 1 if needed
      if (sufficientAllowance1 === false) {
        setToken1ApprovalStatus("loading");
        setCurrentStep("approving_token1");
        await approveToken(amount1);
        setToken1ApprovalStatus("done");
        await validateAll(); // Re-validate after approval
        setIsProcessing(false);
        return;
      }

      const deadline = Math.ceil(new Date().getTime() / 1000) + 60 * 20;
  
      
      // Step 4: Sign batch permit if needed
      if (!batchPermitData) {
        setPermitStatus("loading");
        setCurrentStep("signing_permit");
        const permitData = await signBatchPermit(amount0, amount1,deadline);
        setBatchPermitData(permitData);
        setPermitStatus("done");
        setIsProcessing(false);
        return;
      }
      
      // Step 5: Execute liquidity addition
      setLiquidityStatus("loading");
      setCurrentStep("adding_liquidity");
      await addLPS(liquidity,deadline, batchPermitData.permitBatch, batchPermitData.signature);
      setLiquidityStatus("done");
      setCurrentStep("complete");
      onDone();
      
    } catch (error) {
      console.error("Step execution error:", error);
      // Set the appropriate step status to error
      if (currentStep === "unlocking_round") setRoundUnlockStatus("error");
      else if (currentStep === "approving_token0") setToken0ApprovalStatus("error");
      else if (currentStep === "approving_token1") setToken1ApprovalStatus("error");
      else if (currentStep === "signing_permit") setPermitStatus("error");
      else if (currentStep === "adding_liquidity") setLiquidityStatus("error");
    }
    
    setIsProcessing(false);
  };

  // Determine button text and state
  const getButtonState = () => {
    if (sufficientBalance0 === false || sufficientBalance1 === false) {
      return { text: "Insufficient Balance", disabled: true };
    }
    
    if (roundUnlocked === false) {
      return { text: "Unlock Round", disabled: isProcessing };
    }
    
    if (sufficientAllowance0 === false) {
      return { text: `Approve ${amount0.currency.symbol}`, disabled: isProcessing };
    }
    
    if (sufficientAllowance1 === false) {
      return { text: `Approve ${amount1.currency.symbol}`, disabled: isProcessing };
    }
    
    if (!batchPermitData) {
      return { text: "Sign Permit", disabled: isProcessing };
    }
    
    return { text: "Add Liquidity", disabled: isProcessing };
  };

  const buttonState = getButtonState();

  useEffect(() => {
    return () => {
      // Reset all states when modal closes
      setRoundUnlockStatus("pending");
      setToken0ApprovalStatus("pending");
      setToken1ApprovalStatus("pending");
      setPermitStatus("pending");
      setLiquidityStatus("pending");
      setCurrentStep("validating");
      setIsProcessing(false);
    };
  }, [open]);

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
                />

                <div className="flex flex-row items-center justify-between px-6 py-5 border-b-[1px] border-white/10 ">
                  <div className="text-white">Add Liquidity in Progress</div>

                  <button
                    className=" text-gray-400 hover:text-gray-600"
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

                {/* Rate Display */}
                <div className="px-6 mt-4">
                  <div className="text-sm text-white/70">
                    Rate: 1 {amount0.currency.symbol} = {(parseFloat(amount0.toSignificant()) / parseFloat(amount1.toSignificant())).toPrecision(6)} {amount1.currency.symbol}
                  </div>
                </div>

                {/* Step List */}
                <div className="space-y-[10px] py-6 px-6 mt-3">
                  {/* Round Unlock Step */}
                  {roundUnlocked === false && (
                    <>
                      <div className="grid grid-cols-1">
                        <div
                          className={`flex items-center space-x-3 text-white ${
                            isInactive(roundUnlockStatus) ? "opacity-40" : ""
                          }`}
                        >
                          <div className="border-[1px] border-white/5 bg-white/15 aspect-square rounded-full w-8 flex justify-center items-center">
                            <ArrowPathIcon className="w-4 text-white/50" />
                          </div>

                          <div className="flex flex-row items-center gap-2">
                            <span>Unlock Round</span>
                            {getStatusIcon(roundUnlockStatus)}
                          </div>
                        </div>
                        <div>
                          <Minus className="rotate-90 w-[30px] text-white/20 text-right flex-end mt-[10px]" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Token 0 Approval Step */}
                  {sufficientAllowance0 === false && (
                    <>
                      <div className="grid grid-cols-1">
                        <div
                          className={`flex items-center space-x-3 text-white ${
                            isInactive(token0ApprovalStatus) ? "opacity-40" : ""
                          }`}
                        >
                          <img
                            src={`/token/${amount0.currency.address}.png`}
                            className="w-[30px]"
                          />

                          <div className="flex flex-row items-center gap-2">
                            <span>Approve {amount0.currency.symbol}</span>
                            {getStatusIcon(token0ApprovalStatus)}
                          </div>
                        </div>
                        <div>
                          <Minus className="rotate-90 w-[30px] text-white/20 text-right flex-end mt-[10px]" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Token 1 Approval Step */}
                  {sufficientAllowance1 === false && (
                    <>
                      <div className="grid grid-cols-1">
                        <div
                          className={`flex items-center space-x-3 text-white ${
                            isInactive(token1ApprovalStatus) ? "opacity-40" : ""
                          }`}
                        >
                          <img
                            src={`/token/${amount1.currency.address}.png`}
                            className="w-[30px]"
                          />

                          <div className="flex flex-row items-center gap-2">
                            <span>Approve {amount1.currency.symbol}</span>
                            {getStatusIcon(token1ApprovalStatus)}
                          </div>
                        </div>
                        <div>
                          <Minus className="rotate-90 w-[30px] text-white/20 text-right flex-end mt-[10px]" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Permit Step */}
                  <div className="grid grid-cols-1">
                    <div
                      className={`flex items-center space-x-3 text-white ${
                        isInactive(permitStatus) ? "opacity-40" : ""
                      }`}
                    >
                      <div className="border-[1px] border-white/5 bg-white/15 aspect-square rounded-full w-8 flex justify-center items-center">
                        <CheckCircleIcon className="w-4 text-white/50" />
                      </div>

                      <div className="flex flex-row items-center gap-2">
                        <span>Permit Transfers</span>
                        {getStatusIcon(permitStatus)}
                      </div>
                    </div>
                    <div>
                      <Minus className="rotate-90 w-[30px] text-white/20 text-right flex-end mt-[10px]" />
                    </div>
                  </div>

                  {/* Liquidity Addition Step */}
                  <div
                    className={`flex items-center space-x-3 text-white ${
                      isInactive(liquidityStatus) ? "opacity-40" : ""
                    }`}
                  >
                    <div className="border-[1px] border-white/5 bg-white/15 aspect-square rounded-full w-8 flex justify-center items-center">
                      <Plus className="w-4 text-white/50" />
                    </div>

                    <div className="flex flex-row items-center gap-2">
                      <span>Adding Liquidity</span>
                      {getStatusIcon(liquidityStatus)}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="px-6">
                  <button
                    className="mt-6 btn btn-primary w-full rounded-2xl transition-transform duration-200"
                    onClick={executeStep}
                    disabled={buttonState.disabled}
                  >
                    {isProcessing ? (
                      <ScaleLoader
                        height={20}
                        loading={true}
                        color="#ffffff"
                        className="text-white"
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      />
                    ) : (
                      buttonState.text
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
