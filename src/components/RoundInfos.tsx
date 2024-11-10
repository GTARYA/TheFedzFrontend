import React from 'react';
import { useReadContracts, useReadContract } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import { TimeSlotSystemAddress } from '../contractAddress'
import TimeSlotSystemAbi from '../abi/TimeSlotSystem_abi.json'
import { useEffect, useState } from 'react';

const RoundInfos: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });


    const { data: roundTimeLeft, isError: isTimeLeftError, isLoading: isTimeLeftLoading, dataUpdatedAt: dataUpdatedAtTimeLeft, refetch: refetchTimeLeft } = useReadContract({
        address: TimeSlotSystemAddress,
        abi: TimeSlotSystemAbi,
        functionName: 'getRoundTimeLeft',
    });

  const { data, isError, isLoading } = useReadContracts({
    contracts: [
      {
        address: TimeSlotSystemAddress,
        abi: TimeSlotSystemAbi,
        functionName: 'currentRoundNumber',
      },
      {
        address: TimeSlotSystemAddress,
        abi: TimeSlotSystemAbi,
        functionName: 'roundStartTime',
      },
      {
        address: TimeSlotSystemAddress,
        abi: TimeSlotSystemAbi,
        functionName: 'roundDuration',
      },
      {
        address: TimeSlotSystemAddress,
        abi: TimeSlotSystemAbi,
        functionName: 'getCurrentPlayer',
      },
    ],
  });

  useEffect(() => {
  const updateTimeLeft = () => {
    if (roundTimeLeft && !isTimeLeftError) {
      const totalSeconds = Number(formatUnits(roundTimeLeft, 0));
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      setTimeLeft({ hours, minutes, seconds });
    }
  };

  updateTimeLeft();

  const intervalId = setInterval(() => {
    const now = Date.now();
    const dataAge = now - dataUpdatedAtTimeLeft;
    const refreshThreshold = 3000; // 3 seconds

    if (dataAge > refreshThreshold) {
      refetchTimeLeft();
    } else {
      updateTimeLeft();
    }
  }, 1000);

  return () => clearInterval(intervalId);
}, [roundTimeLeft, isTimeLeftError, dataUpdatedAtTimeLeft, refetchTimeLeft]);


  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  if (isLoading) return <div className="alert">Loading round information...</div>;
  if (isError) return <div className="alert alert-error">Error fetching round information</div>;

  const [currentRoundNumber, roundStartTime, roundDuration, currentPlayer] = data || [];

  return (
    <div className="card w-full bg-base-300 shadow-xl">
      <div className="card-body">
        <h2 className="card-title justify-center">Rounds</h2>
        <div className="stats stats-vertical shadow">
          <div className="stat">
            <div className="stat-title">Current Round #</div>
            <div className="stat-value text-xl">{!currentRoundNumber?.error ? formatUnits(currentRoundNumber.result, 0) : 'N/A'}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Time Left</div>
            <div className="stat-value">
           <div className="flex grid grid-flow-col gap-5 text-center auto-cols-max">
                <div className="flex flex-row text-xl items-center text-center">
                  <span className="countdown font-bold">
                    <span style={{"--value": timeLeft.hours}}></span>
                  </span>
                  <span className="ml-2 text-xl items-center ">H</span>
                  
                  <span className="countdown font-bold ml-4">
                    <span style={{"--value": timeLeft.minutes}}></span>
                  </span>
                  <span className="ml-2 text-xl items-center ">M</span>
                  
                  {/* Drop seconds for now 
                  <span className="countdown font-mono ml-4">
                    <span style={{"--value": timeLeft.seconds}}></span>
                  </span>
                  <span className="ml-2 text-2xl">sec</span>
                  */}
                </div>
              </div>
            </div>
          </div>
         
          <div className="stat">
            <div className="stat-title">Round Duration</div>
            <div className="stat-value text-xl">
            {!roundDuration?.error 
              ? `${Math.floor(Number(formatUnits(roundDuration.result, 0)) / 3600)}h`
              : 'N/A'}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Round Start Time</div>
            <div className="stat-value text-xl">{!roundStartTime?.error ? new Date(Number(roundStartTime.result) * 1000).toLocaleString() : 'N/A'}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Current Player</div>
            <div className="stat-value text-sm break-all">
                {!currentPlayer?.error 
                ? currentPlayer.result.toString()
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoundInfos;
