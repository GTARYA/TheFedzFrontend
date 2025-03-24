import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Fragment, useState } from "react";

interface SortSelectorProps {
  onSortChange: (sortBy: string) => void;
}

const SortSelector: React.FC<SortSelectorProps> = ({ onSortChange }) => {
  const [playersSort, setPlayersSort] = useState("timestamp");
  const sortOrder = [
    { name: "Turn Order", value: "timestamp" },
    { name: "ID Order", value: "tokenId" },
 
  ];

  const handleSortChange = (sortValue:string) => {
    setPlayersSort(sortValue);
    onSortChange(sortValue);
  };

  return (
    <Menu as="div" className="relative inline-block text-left w-fit z-[100]">
      <div>
        <Menu.Button className="flex space-x-2 items-center justify-between w-full hover:bg-[#191919] h-[40px] rounded-xl outline-none pl-2 pr-4 py-1 bg-[#292929]">
          <div className="flex items-center">
            <span className="ml-3.5 text-white font-semibold text-base md:text-lg">
              {sortOrder.find((e) => e.value === playersSort)?.name || "Sort"}{" "}
              {/* Display current sort */}
            </span>
          </div>
          <ChevronDownIcon
            className="-mr-2.5 h-6 w-6 text-[#7E7E7F]"
            aria-hidden="true"
          />
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
        <Menu.Items
          modal={false}
          className="absolute right-0 min-w-[200px] network-scrollbar !z-[100] mt-2 gap-3 rounded-md bg-[#292929] text-[#E1E1E1] outline-none py-2 max-h-[300px] overflow-y-auto"
        >
          {sortOrder.map((e) => (
            <Menu.Item key={e.value}>
              <div
                className="flex items-center px-3 py-2 cursor-pointer hover:bg-white/5 transition-all"
                onClick={() => handleSortChange(e.value)}
              >
                <span className="ml-3 font-semibold text-base md:text-lg">{e.name}</span>
              </div>
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default SortSelector;
