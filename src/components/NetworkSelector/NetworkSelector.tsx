import { Fragment, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Transition } from "@headlessui/react";
import Image from "next/image";
import { ChainInfo, ChainId, chainId, SUPPORTED_NETWORK } from "../../config";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useSwitchChain, useChainId } from "wagmi";

type Props = {};

function NetworkSelector({}: Props) {
  const activeChainId = useChainId();
  const path = usePathname();
  const [chain, setchain] = useState<chainId>(ChainId);
  const { chains, switchChain } = useSwitchChain();

  useEffect(() => {
    if (activeChainId) {
      setchain(activeChainId);
    }
  }, [activeChainId]);
  const switchNetwork = async (chainId: number) => {
    switchChain({ chainId });
  };

  const isArbNetwork = chain === chainId.ARB;
  const handleSwitchToArb = async () => {
    if (!isArbNetwork) {
      await switchNetwork(chainId.ARB);
    }
  };

  if (!isArbNetwork && activeChainId ) {
    return (
      <div className="mt-2">
        <button
          onClick={handleSwitchToArb}
          className="w-full bg-[#fb1717] rounded-[56px] text-white py-2 px-4  border-white/10 border-[1px]"
        >
          Switch to Arbitrum
        </button>
      </div>
    );
  }
//
  return (
    <Menu
      as="div"
      className={`relative inline-block text-left w-fit z-[10] text-[#E1E1E1] ${
        path == "/" ? "hidden" : ""
      }`}
    >
      <div>
        <Menu.Button className="flex items-center justify-between w-full border-white/10 border-[1px]  hover:bg-[#191919] h-[45px] rounded-[56px] outline-none pl-4 pr-4 py-1">
          <div className="flex items-center">
            <div className="flex items-center ">
              <Image
                src={ChainInfo[chain]?.icon}
                width={20}
                height={20}
                alt={ChainInfo[chain]?.config.name}
                className="min-w-[20px] min-h-[20px] aspect-square rounded-full"
              />
              <span className="font-bold ml-2.5 hidden md:block">
                {ChainInfo[chain].config.name}
              </span>
            </div>
            <ChevronDownIcon
              className="-mr-1 ml-2.5  h-6 w-6 text-[#7E7E7F]"
              aria-hidden="true"
            />
          </div>
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute  right-0 min-w-[200px] z-1   network-scrollbar mt-2 gap-3 rounded-md bg-[#292929] text-[#E1E1E1] outline-none py-2 max-h-[300px] overflow-auto">
          {SUPPORTED_NETWORK.map((item) => (
            <Menu.Item
              key={item}
              as="div"
              className="flex items-center px-3 py-2 cursor-pointer hover:bg-white/5 transition-all"
              onClick={() => switchNetwork(item)}
            >
              <Image
                src={ChainInfo[item].icon}
                width={20}
                height={20}
                alt={ChainInfo[item].config.name}
                className="w-[20px] rounded-full"
              />
              <span className=" ml-2.5 text-sm font-medium">
                {ChainInfo[item].config.name}
              </span>
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export default NetworkSelector;
