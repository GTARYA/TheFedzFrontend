import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import React from "react";
import { TokenInfo } from '../../type'
import { Token } from "@uniswap/sdk-core";
interface TokenInputProps {
  amount?: string;
  quote?: string;
  setAmount: (value: string) => void;
  token: Token | TokenInfo;
  setToken: (value: TokenInfo | Token) => void;
  options: { value: any; label: string }[];
  disabled?: boolean;
}

const TokenInput: React.FC<TokenInputProps> = ({
  amount,
  quote,
  setAmount,
  token,
  setToken,
  options,
  disabled = false,
}) => {
  const selectedToken = options.find((option) => option.value === token);

  return (
    <div className="flex items-center justify-between gap-5">
      {/* Input for Amount */}
      <div className="flex items-center text-[26px] leading-[36px] sm:text-[32px] sm:leading-[48px] font-semibold">
        $
        <input
          type="text"
          placeholder="0.0"
          className="outline-none w-2/3 bg-transparent"
          value={amount}
          onChange={(e) => {
            const re = /^[0-9]*\.?[0-9]*$/;
            if (
              !disabled &&
              (e.target.value === "" || re.test(e.target.value))
            ) {
              setAmount(e.target.value);
            }
          }}
          disabled={disabled}
        />
      </div>
      {/* Listbox for Token Selection */}
      <Listbox
        value={selectedToken}
        onChange={(selected) => {
          console.log(selected);
          setToken(selected.value);
        }}
        disabled={disabled}
      >
        <div className="relative ">
          <Listbox.Button
            className={clsx(
              "relative  min-w-[100px] text-sm sm:text-base  cursor-pointer rounded-[46px] border-white/10 border-[1px] outline-none flex items-center !min-h-[10px]  !py-[6px] !px-[14px] bg-white/10   pl-3 text-left  text-white",
              "focus:outline-none focus:ring-2 !gap-3 focus:ring-offset-2 focus:ring-white"
            )}
          >
            {`${selectedToken?.label}` || "Select a token"}
            <ChevronDownIcon
              className="pointer-events-none absolute  right-2 h-5 w-5 text-white/60"
              aria-hidden="true"
            />
          </Listbox.Button>
          <Listbox.Options
            className={clsx(
              "absolute z-10 mt-1 w-full rounded-lg bg-gray-800 py-1  text-sm text-white",
              "border border-gray-700 shadow-lg focus:outline-none"
            )}
          >
            {options
              .map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option}
                  className={({ active, selected }) =>
                    clsx(
                      "cursor-pointer select-none py-2 px-3",
                      active ? "bg-gray-700" : "bg-gray-800",
                      selected ? "font-bold text-green-400" : "text-white"
                    )
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center gap-2">
                      {selected && (
                        <CheckIcon className="h-5 w-5 text-green-400" />
                      )}
                      <span>{option.label}</span>
                    </div>
                  )}
                </Listbox.Option>
              ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
};

export default TokenInput;
