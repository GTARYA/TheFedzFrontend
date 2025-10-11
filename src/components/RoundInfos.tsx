import React, { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import { TimeSlotSystemAddress } from "../contractAddressArbitrum";
import TimeSlotSystemAbi from "../abi/TimeSlotSystem_abi.json";
import { ChainId } from "../config";
import moment from "moment";
import { formatDuration } from "../utils/date";
import { formatOwner } from "../utils/address";
const RoundInfos = ({ isSelf }: { isSelf?: boolean }) => {
  const [currentRound, setCurrentRound] = useState<number | null>(null);
  const [roundDuration, setRoundDuration] = useState<number | null>(null);
  const [roundStartTime, setRoundStartTime] = useState<number | null>(null);
  const [nextStartTime, setNextStartTime] = useState<number | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const { data, isError, isLoading } = useReadContracts({
    contracts: [
      {
        address: TimeSlotSystemAddress,
        abi: TimeSlotSystemAbi,
        functionName: "rounds",
        chainId: ChainId,
      },
      {
        address: TimeSlotSystemAddress,
        abi: TimeSlotSystemAbi,
        functionName: "getCurrentPlayer",
        chainId: ChainId,
      },
    ],
  });



  useEffect(() => {
    if (data && data[0]?.result && Array.isArray(data[0].result)) {
      const current = data[0].result[0].roundNumber;
      const duration =
        Number(data[0].result[0].slotDuration.toString()) *
        Number(data[0].result[0].playersCount.toString());
      const start = data[0].result[0].startsAt.toString();
      const nextStart = Number(data[0].result[1].startsAt.toString());

      setCurrentRound(Number(current) + 3);
      setRoundDuration(Number(duration));
      setRoundStartTime(Number(start));
      setNextStartTime(Number(nextStart));

      const now = Math.floor(Date.now() / 1000);
      const secondsLeft = nextStart - now;

      if (secondsLeft > 0) {
        const days = Math.floor(secondsLeft / (60 * 60 * 24));
        const hours = Math.floor((secondsLeft % (60 * 60 * 24)) / 3600);
        const minutes = Math.floor((secondsLeft % 3600) / 60);

        const timeParts = [];
        if (days > 0) timeParts.push(`${days}d`);
        if (hours > 0) timeParts.push(`${hours}h`);
        if (minutes > 0) timeParts.push(`${minutes}m`);

        setTimeLeft(timeParts.join(" "));
      } else {
        setTimeLeft("0m");
      }
    }

    if (data && data[1]?.result) {
      setCurrentPlayer(data[1].result as string);
    }
  }, [data]);

  return (
    <div className="relative overflow-hidden rounded-[32px] border-[1px] border-white/20 bg-white/5 w-full py-4 md:py-10">
      <div className="relative z-[5]">
        <div className="w-full text-sm md:text-xl text-primary">
          <div className="px-10 py-4 border-b border-white/10">
            <p className="text-sm md:text-lg font-normal text-primary mb-2">
              Current Round
            </p>
            <h3 className="text-base md:text-xl font-bold">
              {currentRound ?? "..."}
            </h3>
          </div>
        </div>

        <div className="w-full text-sm md:text-xl text-primary">
          <div className="px-10 py-4 border-b border-white/10">
            <p className="text-sm md:text-lg font-normal text-primary mb-2">
              Time Left
            </p>
            <div className="text-base md:text-xl font-bold">
              {timeLeft || "..."}
            </div>
          </div>
        </div>

        <div className="w-full text-sm md:text-xl text-primary">
          <div className="px-10 py-4 border-b border-white/10">
            <p className="text-sm md:text-lg font-normal text-primary mb-2">
              Round Duration
            </p>
            <div className="text-base md:text-xl font-bold">
              {roundDuration ? `${formatDuration(roundDuration)}` : "..."}
            </div>
          </div>
        </div>

        <div className="w-full text-sm md:text-xl text-primary">
          <div className="px-10 py-4 border-b border-white/10">
            <p className="text-sm md:text-lg font-normal text-primary mb-2">
              Round Start Time
            </p>
            <div className="text-base md:text-xl font-bold">
              {roundStartTime
                ? moment.unix(roundStartTime).format("YYYY-MM-DD HH:mm:ss")
                : "..."}
            </div>
          </div>
        </div>

        <div className="w-full text-sm md:text-xl text-primary">
          <div className="px-10 py-4">
            <p className="text-sm md:text-lg font-normal text-primary mb-2">
              Current Player
            </p>
            <div className="text-base md:text-xl font-bold">
              {formatOwner(currentPlayer ?? "") ?? "..."}
            </div>
          </div>
        </div>
      </div>

      <img
        src="/blue-glare2.png"
        alt="glare"
        className="absolute top-0 left-0 pointer-events-none"
      />
      {isSelf && (
        <img
          src="/blue-glare4.png"
          alt="glare"
          className="absolute -bottom-1/2 right-0 pointer-events-none"
        />
      )}
    </div>
  );
};

export default RoundInfos;
