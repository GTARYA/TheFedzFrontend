import React from "react";

type Props = {};

function LiquidityBox({}: Props) {
  return (
    <div className="border-[1px] relative overflow-hidden border-white/20 bg-[#131823]/65  rounded-2xl py-6  max-w-[620px] mx-auto ">
      <img
        src="/blue-glare2.png"
        alt="glare"
        className="absolute top-0 left-0 pointer-events-none opacity-50"
      ></img>

      {/* LOGO PART  */}

      <div className="flex items-center justify-center space-x-[-10px] md:space-x-[-12px] mb-6">
        <div className="bg-white/10 rounded-full aspect-square max-w-[67px]">
          <img
            className=" w-[50px] md:w-[67px] p-[1px]"
            src="/token/0x894341be568Eae3697408c420f1d0AcFCE6E55f9.png"
          />
        </div>
        <img className="w-[50px] md:w-[67px] opacity-95 " src="/token/usdt.png" />
      </div>

      <div className="bg-[#00ffe4]/15 absolute text-[#00ffe4] right-5 top-5  px-3 flex items-center text-center  aspect-square rounded-lg">
        v4
      </div>

    {/* LOGO PART  */}

      <div className="text-center text-[#00ffe4] mx-auto bg-[#00ffe4]/15 px-5 py-1 rounded-[24px] w-fit">
        FUSD/USDT
      </div>

      <div className="mx-6 p-4 my-6 bg-black/35 rounded-xl border-white/10 border-[1px]">
        <LineItem label="Position Id " value="#9565" withBorder />
        <LineItem label="Fee tier " value="0.4%" />
        <LineItem label="Deposited mFUSD" value="10 FUSD" />
        <LineItem label="Deposited mUSDT" value="10 USDT" />
      </div>

      <div className="px-6 ">
        <button className="  py-3 px-6 !rounded-xl bg-[#00ffe4]/65 font-medium ! outline-none text-white w-full">
          Remove liquidity{" "}
        </button>
      </div>
    </div>
  );
}

export default LiquidityBox;

type LineItemProps = {
  label: string;
  value: string | number;
  withBorder?: boolean;
};

const LineItem: React.FC<LineItemProps> = ({ label, value, withBorder }) => {
  return (
    <div
      className={`flex justify-between py-2 ${
        withBorder ? "" : ""
      }`}
    >
      <div className="text-white opacity-75 ">{label}</div>
      <div className=" text-white font-bold">{value}</div>
    </div>
  );
};
