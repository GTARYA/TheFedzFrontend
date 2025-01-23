import { useAppKit } from "@reown/appkit/react";
import { useEffect, useState } from "react";

import { useAccount } from "wagmi";
export default function Customconnetbtn() {
  const [load, setLoad] = useState(false);
  const { open, close } = useAppKit();

  const { address, isConnecting, isDisconnected } = useAccount();

  const connetButton = () => {
    open({ view: "Account" });
    open();
  };

  useEffect(() => {
    setLoad(true);
  }, []);
  return (
    <div className="flex justify-center items-center">
      {load && (
        <button
          onClick={connetButton}
          className=" py-[0px] h-[45px]  rounded-[56px]  bg-lightblue px-6 md:text-[18px] text-[16px] transition-all hover:hover:bg-[#7a2ed6] text-sm relative z-50 font-medium   text-white   "
        >
          <span className="mt-[1px]">
            {address
              ? address?.slice(0, 5) + "..." + address?.slice(-5)
              : "Connect Wallet"}
          </span>
        </button>
      )}
    </div>
  );
}
