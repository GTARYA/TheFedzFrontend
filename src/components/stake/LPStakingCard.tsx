import React, { useEffect, useState } from "react";
import { calculateTokenAmounts } from "../../hooks/fedz";
import { PositionInfo } from "../../type";
import { formatAmount } from "../../utils/address";
type Props = {
  data: PositionInfo;
  selectedNFT: number | null;
  onSelectNFT: (nft: number) => void;
  reward:string

};

function LPStakingCard({
  data: { liquidity, tokenId, owner },
  onSelectNFT,
  selectedNFT,
reward
}: Props) {
  const [amountToken0, setAmountToken0] = useState("0");
  const [amountToken1, setAmountToken1] = useState("0");

  useEffect(() => {
    async function fetchAmounts() {
      const [a0, a1] = await calculateTokenAmounts(Number(liquidity));
      setAmountToken0(a0);
      setAmountToken1(a1);
    }
    if (liquidity) fetchAmounts();
  }, [liquidity]);

  return (
    <div
      onClick={() => onSelectNFT(Number(tokenId))}
      className={`border-[1px] cursor-pointer relative overflow-hidden border-white/20 bg-[#131823]/65  rounded-2xl pt-6 pb-3 w-full ${
        Number(tokenId) === selectedNFT && "!border-[#00ffe4] brightness-125"
      } `}
    >
      <img
        src="/blue-glare2.png"
        alt="glare"
        className="absolute top-0 left-0 pointer-events-none opacity-50"
      />

      {/* LOGO PART */}
      <div className="flex items-center justify-center space-x-[-10px] md:space-x-[-12px] mb-6">
        <div className="bg-white/10 rounded-full aspect-square max-w-[67px]">
          <img
            className=" w-[50px] p-[1px]"
            src="/token/0x894341be568Eae3697408c420f1d0AcFCE6E55f9.png"
          />
        </div>
        <img className="w-[50px]  opacity-95 " src="/token/usdt.png" />
      </div>

      <div className="bg-[#00ffe4]/15 text-xs absolute text-[#00ffe4] right-5 top-5  px-2 flex items-center text-center  aspect-square rounded-lg">
        v4
      </div>

      <div className="text-center text-[#00ffe4] mx-auto text-sm bg-[#00ffe4]/15 px-5 py-1 rounded-[24px] w-fit">
        FUSD/USDT
      </div>

      <div className="mx-3 sm:mx-6 p-4 mt-3 bg-black/35 rounded-xl border-white/10 border-[1px]">
        <LineItem label="Position Id " value={`#${tokenId}`} withBorder />
        <LineItem label="Fee tier " value="0.4%" />
                <LineItem label="Reward " value={`${formatAmount(reward)}`} />
        <LineItem
          label="Deposited FUSD"
          value={`${formatAmount(amountToken0)} FUSD`}
        />
        <LineItem
          label="Deposited USDT"
          value={`${formatAmount(amountToken1)} USDT`}
        />
      </div>
    </div>
  );
}

export default LPStakingCard;

type LineItemProps = {
  label: string;
  value: string | number;
  withBorder?: boolean;
};

const LineItem: React.FC<LineItemProps> = ({ label, value }) => (
  <div className="flex justify-between py-2 ">
    <div className="text-white opacity-75 test-xs sm:text-sm ">{label}</div>
    <div className="text-white font-bold test-xs sm:text-sm ">{value}</div>
  </div>
);
