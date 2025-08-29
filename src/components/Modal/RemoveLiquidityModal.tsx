import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  percentToRemove: string;
  setPercentToRemove: any;
}

export default function RemoveLiquidityModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  setPercentToRemove,
  percentToRemove,
}: Props) {
  const handleConfirm = () => {
    onConfirm();
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
              <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden pb-4 rounded-2xl border border-white/10 bg-black shadow-xl transition-all text-white">
                <img
                  src="/blue-glare2.png"
                  alt="glare"
                  className="absolute top-0 left-0 pointer-events-none"
                />

                <div className="flex flex-row items-center justify-between px-6 py-5 border-b-[1px] border-white/10 ">
                  <div className="text-white">Remove Liquidity</div>

                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="py-6 px-6 space-y-4 text-center">
                  <p className="text-white text-lg">
                    Enter percentage to remove
                  </p>

                  <div className="relative flex mx-auto w-fit items-center gap-1">
                    <input
                      type="text"
                      placeholder="0.0"
                      value={percentToRemove}
                      onChange={(e) => {
                        const re = /^[0-9]*\.?[0-9]*$/;
                        if (re.test(e.target.value))
                          setPercentToRemove(e.target.value);
                      }}
                      className="flex-1 !bg-transparent text-4xl text-center outline-none py-6 text-white font-bold w-[60px]"
                      min="0"
                      max="100"
                    />
                    <span className="text-4xl text-center text-white flex-1 font-bold">
                      %
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-between pb-6">
                    {["25", "50", "75", "100"].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setPercentToRemove(pct)}
                        className="text-white border-white/20 border-[1px] hover:scale-105 py-1 px-4 rounded-3xl"
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                      onClick={onClose}
                      className=" text-white border-white/20 border-[1px] py-2 px-4 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="btn-primary btn text-white py-2 px-4 rounded-xl"
                      disabled={loading}
                    >
                      {loading ? (
                        <ScaleLoader
                          height={20}
                          loading={true}
                          color="#ffffff"
                          className="text-white"
                          aria-label="Loading Spinner"
                          data-testid="loader"
                        />
                      ) : (
                        "Confirm"
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
