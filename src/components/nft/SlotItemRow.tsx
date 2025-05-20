import React, { useEffect, useState } from "react";
import moment from "moment";
import { TurnOrderEntry } from "../../type";
import { NFT_ADDR, ChainId } from "../../config";
import { erc721Abi } from "viem";
import { useContractRead } from "wagmi";
import { formatOwner } from "../../utils/address";

interface SlotItemProps {
  index: number;
  data: TurnOrderEntry;
}

const SlotItemRow: React.FC<SlotItemProps> = ({ index, data }) => {
  const [status, setStatus] = useState("Upcoming");
  const [timeInfo, setTimeInfo] = useState("");

  const { data: owner } = useContractRead({
    address: NFT_ADDR as `0x${string}`,
    abi: erc721Abi,
    functionName: "ownerOf",
    // @ts-ignore
    args: [data.tokenId],
    chainId: ChainId,
    enabled: !!data.tokenId,
  });

  const formatDuration = (seconds: number) => {
    const duration = moment.duration(seconds, "seconds");
    const d = Math.floor(duration.asDays());
    const h = duration.hours();
    const m = duration.minutes();
    const s = duration.seconds();

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    // if (s > 0) parts.push(`${s}s`);

    return parts.join(":");
  };

  useEffect(() => {
    const updateTime = () => {
      const now = moment().unix();
      const start = data.startTime;
      const end = data.endTime;

      if (now < start) {
        const secondsLeft = start - now;
        setStatus("Upcoming");
        setTimeInfo(formatDuration(secondsLeft));
      } else if (now >= start && now < end) {
        setStatus("Ongoing");
        setTimeInfo(""); // Hide countdown
      } else {
        setStatus("Ended");
        setTimeInfo(""); // Hide countdown
      }
    };

    updateTime(); // Initial run
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [data.startTime, data.endTime]);

  return (
    <tr
      className="text-sm md:text-base text-nowrap "
      style={{
        border: status === "Ongoing" ? "4px solid rgb(74, 237, 96)" : "",
      }}
    >
      <td className="py-4 pr-4 pl-3">{index + 1}</td>
      <td className="py-4">{formatOwner(owner as string)}</td>
      <td className="pr-4">
        {moment.unix(data.startTime).format("MM/DD/YYYY, hh:mm:ss A")}
      </td>
      <td className="pr-4">
        {moment.unix(data.endTime).format("MM/DD/YYYY, hh:mm:ss A")}
      </td>
      <td className={`${status === "Ongoing" ? "" : ""}`}>
        <div className="flex flex-col justify-center ">
          <span>{status}</span>
          {status === "Upcoming" && timeInfo && (
            <span className="text-base text-gray-500 ">{timeInfo}</span>
          )}
        </div>
      </td>
    </tr>
  );
};

export default SlotItemRow;
