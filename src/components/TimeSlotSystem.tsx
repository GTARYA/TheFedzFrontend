import { useAccount, useReadContract } from 'wagmi'
import { useEffect, useState } from 'react'

import { TimeSlotSystemAddress } from '../contractAddress'
import TimeSlotSystemAbi from '../abi/TimeSlotSystem_abi.json'

export default function ActionWindow({address} : {address: `0x${string}`}) {
  const { isConnected } = useAccount()
  const [timeSlots, setTimeSlots] = useState<{ start: Date; end: Date }[]>([])
  const [currentSlot, setCurrentSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [remainingTime, setRemainingTime] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null)

  const { data, isError, isLoading } = useReadContract({
    address: TimeSlotSystemAddress,
    abi: TimeSlotSystemAbi,
    functionName: 'getAllActionWindows',
    args: [address],
  })

  useEffect(() => {
    if (data) {
      console.log(data);
      const [startTimes, endTimes] = data as [bigint[], bigint[]]
      const slots = startTimes.map((start, index) => ({
        start: new Date(Number(start) * 1000),
        end: new Date(Number(endTimes[index]) * 1000)
      }))
      slots.sort((a, b) => a.start.getTime() - b.start.getTime())
      setTimeSlots(slots)
    }
  }, [data])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const currentSlot = timeSlots.find(slot => now >= slot.start && now < slot.end)
      setCurrentSlot(currentSlot || null)

      if (currentSlot) {
        const diff = currentSlot.end.getTime() - now.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        setRemainingTime({ days, hours, minutes, seconds })
      } else {
        setRemainingTime(null)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [timeSlots])

  const getTimerColor = () => {
    if (!currentSlot || !remainingTime) return 'bg-gray-500'
    const totalDuration = currentSlot.end.getTime() - currentSlot.start.getTime()
    const elapsedTime = totalDuration - (remainingTime.days * 86400000 + remainingTime.hours * 3600000 + remainingTime.minutes * 60000 + remainingTime.seconds * 1000)
    const elapsedPercentage = elapsedTime / totalDuration
    if (elapsedPercentage < 0.5) return 'bg-green-500'
    if (elapsedPercentage < 0.75) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (!isConnected) {
    return (
      <div className="alert alert-warning">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856 0 2.502-1.667 1.732-3L13.732 4c-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <span>Please connect your wallet to see your action windows.</span>
      </div>
    )
  }

  if (isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>You are not a registered Player!</span>
      </div>
    )
  }

  return (
    <div className="card flex bg-base-300 shadow-xl">
      <div className="card-body">
      <h2 className="card-title justify-center">Action Windows</h2>
        {timeSlots.length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Slot</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, index) => (
                    <tr key={index} className={currentSlot && currentSlot.start === slot.start ? 'active' : ''}>
                      <td>{index + 1}</td>
                      <td>{slot.start.toLocaleString()}</td>
                      <td>{slot.end.toLocaleString()}</td>
                      <td>
                        {currentSlot && currentSlot.start === slot.start ? 
                          <span className="badge badge-primary">Active</span> : 
                          new Date() < slot.start ? 
                            <span className="badge badge-secondary">Upcoming</span> : 
                            <span className="badge badge-ghost">Ended</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {currentSlot && remainingTime && (
              <div className='flex flex-col items-center mt-4'>
                <h2 className="card-title">Current Action Window</h2>
                <div className="grid grid-flow-col gap-4 text-center auto-cols-max pt-4">
                  <div className={`flex flex-col p-2 ${getTimerColor()} rounded-box text-white`}>
                    <span className="countdown font-mono text-3xl">
                      <span style={{"--value": remainingTime.days} as React.CSSProperties}></span>
                    </span>
                    days
                  </div>
                  <div className={`flex flex-col p-2 ${getTimerColor()} rounded-box text-white`}>
                    <span className="countdown font-mono text-3xl">
                      <span style={{"--value": remainingTime.hours} as React.CSSProperties}></span>
                    </span>
                    hours
                  </div>
                  <div className={`flex flex-col p-2 ${getTimerColor()} rounded-box text-white`}>
                    <span className="countdown font-mono text-3xl">
                      <span style={{"--value": remainingTime.minutes} as React.CSSProperties}></span>
                    </span>
                    min
                  </div>
                  <div className={`flex flex-col p-2 ${getTimerColor()} rounded-box text-white`}>
                    <span className="countdown font-mono text-3xl">
                      <span style={{"--value": remainingTime.seconds} as React.CSSProperties}></span>
                    </span>
                    sec
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p>No action windows available.</p>
        )}
      </div>
    </div>
  )
}
