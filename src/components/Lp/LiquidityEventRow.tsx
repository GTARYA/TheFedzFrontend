import React from "react";
import moment from "moment";
import { LiquidityEvent } from "../../type";
import { formatAmount, formatOwner } from "../../utils/address";
type Props = {
  data: LiquidityEvent;
  address?: string | null;
};

function LiquidityEventRow({ data, address }: Props) {
  const {
    timestamp,
    origin,
    sender,
    amount,
    amount0,
    amount1,
    token0,
    token1,
  } = data;

  const formattedTime = moment.unix(Number(timestamp)).fromNow();

  const isAdd = parseFloat(amount) > 0;
  const type = isAdd ? "Add" : "Remove";

  const displayAddress = origin || sender || "Unknown";

  return (
    <tr className="text-sm md:text-base text-white/80 font-medium">
      <td className="py-3 pr-4">{formattedTime}</td>
      {!address && (
        <td className="pr-4 truncate max-w-[160px]">
          <a
            className="hover:underline"
            href={`https://arbiscan.io/address/${displayAddress}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            {formatOwner(displayAddress)}{" "}
          </a>
        </td>
      )}
      <td
        className={`pr-4 capitalize ${
          isAdd ? "text-green-500" : "text-[#ff0000]"
        }`}
      >
        {type}
      </td>
      <td className="pr-4">{formatAmount(Number(amount0))}</td>
      <td className="pr-4">{formatAmount(Number(amount1))}</td>
    </tr>
  );
}

export default LiquidityEventRow;
