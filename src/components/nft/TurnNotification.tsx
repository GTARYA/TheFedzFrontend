import { useEffect, useState } from "react";
import { useAccount } from "wagmi"; // Wagmi for wallet connection
import {
  getLatestEventForTurn,
  listMyNFTs,
  getPlayersTurnOrder,
} from "../../hooks/fedz"; // Adjust path
import moment from "moment";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { BorderBeam } from "../ui/BorderBeam";
import { XMarkIcon, XCircleIcon } from "@heroicons/react/20/solid";
const TurnNotification = () => {
  const { isConnected ,address} = useAccount();
  // const address = "0x05A449aB36cE8D096C0bd0028Ea2Ae5A42Fe4EFd";
  const [userTurn, setUserTurn] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [slotDuration, setSlotDuration] = useState(0);
  const [roundNumber, setRoundNumber] = useState(0);

  useEffect(() => {
    const checkUserTurn = async () => {
      if (!address) return;

      const [turnList, myNFTs] = await Promise.all([
        getLatestEventForTurn(),
        listMyNFTs(address),
      ]);
      setSlotDuration(turnList.slotDuration);
      setRoundNumber(turnList.roundNumber);

      if (!turnList.turnOrder || !myNFTs.length) return;

      const roundEndTime =
        turnList.startsAt + turnList.slotDuration * turnList.turnOrder.length;

      const currentTime = Math.floor(Date.now() / 1000); 
      if (currentTime >= roundEndTime) {
        console.log("Round has ended. Not displaying user turn.");
        return;
      }

      const userTokenIds = new Set(myNFTs.map((tokenId: any) => tokenId));
      const userNFTs = turnList.turnOrder.filter((nft: any) =>
        userTokenIds.has(nft.tokenId)
      );

      if (!userNFTs.length) return;
      const closestNFT = userNFTs.reduce((prev, curr) =>
        prev.timestamp < curr.timestamp ? prev : curr
      );

      const eventAdded = localStorage.getItem(
        `event_${closestNFT.tokenId}_${turnList.roundNumber}`
      );

      if (!eventAdded) {
        setIsOpen(true);
        setUserTurn(closestNFT);
      }
    };

    checkUserTurn();
  }, [isConnected, address]);

  const handleClose = () => setIsOpen(false);

  const handleAddToCalendar = () => {
    if (!userTurn) return;

    const event = {
      title: "Your Turn in The Fedz Game",
      description: `Your NFT ${userTurn.name} turn starts soon!`,
      start: moment.unix(userTurn.timestamp).format("YYYYMMDDTHHmmss"),
      end: moment
        .unix(userTurn.timestamp + slotDuration)
        .format("YYYYMMDDTHHmmss"),
      location: "https://thefedz.org",
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(
      event.title
    )}&dates=${event.start}/${event.end}&details=${encodeURIComponent(
      event.description
    )}&location=${encodeURIComponent(event.location)}`;
    window.open(googleCalendarUrl, "_blank");
    localStorage.setItem(`event_${userTurn.tokenId}_${roundNumber}`, "added");
    setIsOpen(false);
  };

  if (!userTurn) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-80" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full m-4 relative overflow-hidden border-[1px] border-white border-opacity-5 rounded-2xl   z-30 max-w-md bg-[#000000] p-6  transform transition-all">
              <BorderBeam
                duration={8}
                size={400}
                className="from-transparent via-[#33ffdd] to-transparent"
              />

              <img
                src="/blue-glare4.png"
                alt="eppilse"
                className="absolute -bottom-[150%] right-0 pointer-events-none"
              />
              <img
                src="/blue-glare2.png"
                alt="eppilse"
                className="absolute top-0 left-0 pointer-events-none"
              />

              <div className="flex flex-row items-center justify-between absolute right-6 top-4">
                <XMarkIcon
                  onClick={handleClose}
                  className="h-8 w-8 text-white cursor-pointer hover:opacity-65"
                />
              </div>

              <Dialog.Title className="text-xl font-bold text-center text-white pt-6">
                Your Turn is Coming Up!
              </Dialog.Title>

              <p className=" text-lg text-center text-white/80 py-3 ">
                Your turn starts in{" "}
                <strong>
                  {(() => {
                    const endTime = moment.unix(userTurn.timestamp);
                    const now = moment();
                    const duration = moment.duration(endTime.diff(now));

                    const days = Math.floor(duration.asDays());
                    const hours = duration.hours();
                    const minutes = duration.minutes();

                    return `${days}D:${hours}H:${minutes}M`;
                  })()}
                </strong>{" "}
                and will <br /> end at{" "}
                <strong>
                  {(() => {
                    const endTime = moment.unix(
                      userTurn.timestamp + slotDuration
                    );
                    const now = moment();
                    const duration = moment.duration(endTime.diff(now));

                    const days = Math.floor(duration.asDays());
                    const hours = duration.hours();
                    const minutes = duration.minutes();

                    return `${days}D:${hours}H:${minutes}M`;
                  })()}
                </strong>
              </p>
              <h2 className="mt-1 text-xl font-bold text-center text-white">
                Don't miss your turn!
              </h2>
              <div className="mt-8  gap-3 w-full">
                <button
                  className="bg-lightblue w-full  text-white  font-medium px-4 py-2 rounded-xl hover:bg-opacity-50"
                  onClick={handleAddToCalendar}
                >
                  Add to Calendar
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TurnNotification;
