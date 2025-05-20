import React from "react";
import { SwapEvent } from "../../type";
import moment from "moment";

type Props = {
  data: SwapEvent;
  address:any
};

function SwapEventRow({ data,address }: Props) {
  const { origin, amount0, amount1, token0, token1, timestamp } = data;

  const isBuy = parseFloat(amount0) < 0; // Negative amount0 = buy, Positive = sell
  const typeLabel = isBuy ? "Buy" : "Sell";

  const amount = isBuy ? Math.abs(parseFloat(amount1)) : Math.abs(parseFloat(amount0));
  const symbol = isBuy ? token1.symbol : token0.symbol;

  const formattedTime = moment.unix(Number(timestamp)).fromNow();


  return (
    <tr className=" text-sm md:text-base">
      <td className="py-3 pr-4">{formattedTime}</td>
   {!address &&  <td className="pr-4">
        <a className="hover:underline transition-all"  href={`https://arbiscan.io/address/${origin}`} target="_blank" rel="noopener noreferrer"> {origin.slice(0, 6)}...{origin.slice(-4)}</a>
       
      </td>}
      <td className={`pr-4 font-semibold ${isBuy ? "text-green-500" : "text-[#ff0000]"}`}>
        {typeLabel}
      </td>
      <td className="pr-4">
        {amount} {symbol}
      </td>
    </tr>
  );
}

export default SwapEventRow;
