import React, { useEffect, useState } from "react";
import { calculateTokenAmounts } from "../../hooks/fedz";
import { PositionInfo } from "../../type";
import { formatAmount } from "../../utils/address";
import RemoveLiquidityModal from "../Modal/RemoveLiquidityModal";
import { toast } from "sonner";
type Props = {
  data: PositionInfo;
  updateData: () => void;
  removeLiquidity: (percentToRemove: number, data: PositionInfo) => void;
  removeLiquidityloading: boolean;
  isPlayerTurnState: boolean;
};

function LiquidityBox({
  data: { liquidity, tokenId, owner },
  updateData,
  removeLiquidity,
  removeLiquidityloading,
  isPlayerTurnState,
}: Props) {
  const [amountToken0, setAmountToken0] = useState("0");
  const [amountToken1, setAmountToken1] = useState("0");
  const [showModal, setShowModal] = useState(false);
  const [percentToRemove, setPercentToRemove] = useState("0");

  useEffect(() => {
    async function fetchAmounts() {
      const [a0, a1] = await calculateTokenAmounts(Number(liquidity));
      setAmountToken0(a0);
      setAmountToken1(a1);
    }
    if (liquidity) fetchAmounts();
  }, [liquidity]);

  const removeLP = async () => {
    if (Number(percentToRemove) <= 0) {
      return toast.info("Put greater than 0");
    }

    await removeLiquidity(Number(percentToRemove), {
      liquidity,
      tokenId,
      owner,
    });
    setShowModal(false);
    updateData();
  };

  const handleRemoveLiquidity = () => {
    if (!isPlayerTurnState) return toast.info("It is not your Turn to Act!");
    setShowModal(true);
  };
  return (
    <div className="border-[1px] relative overflow-hidden border-white/20 bg-[#131823]/65  rounded-2xl py-6  max-w-[620px] mx-auto ">
      <img
        src="/blue-glare2.png"
        alt="glare"
        className="absolute top-0 left-0 pointer-events-none opacity-50"
      />
      <RemoveLiquidityModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => removeLP()}
        loading={removeLiquidityloading}
        percentToRemove={percentToRemove}
        setPercentToRemove={setPercentToRemove}
      />
      {/* LOGO PART */}
      <div className="flex items-center justify-center space-x-[-10px] md:space-x-[-12px] mb-6">
        <div className="bg-white/10 rounded-full aspect-square max-w-[67px]">
          <img
            className=" w-[50px] md:w-[67px] p-[1px]"
            src="/token/0x894341be568Eae3697408c420f1d0AcFCE6E55f9.png"
          />
        </div>
        <img
          className="w-[50px] md:w-[67px] opacity-95 "
          src="/token/usdt.png"
        />
      </div>

      <div className="bg-[#00ffe4]/15 absolute text-[#00ffe4] right-5 top-5  px-3 flex items-center text-center  aspect-square rounded-lg">
        v4
      </div>

      <div className="text-center text-[#00ffe4] mx-auto bg-[#00ffe4]/15 px-5 py-1 rounded-[24px] w-fit">
        FUSD/USDT
      </div>

      <div className="mx-6 p-4 my-6 bg-black/35 rounded-xl border-white/10 border-[1px]">
        <LineItem label="Position Id " value={`#${tokenId}`} withBorder />
        <LineItem label="Fee tier " value="0.4%" />
        <LineItem
          label="Deposited FUSD"
          value={`${formatAmount(amountToken0)} FUSD`}
        />
        <LineItem
          label="Deposited USDT"
          value={`${formatAmount(amountToken1)} USDT`}
        />
      </div>

      <div className="px-6 ">
        <button
          onClick={() => handleRemoveLiquidity()}
          disabled={removeLiquidityloading}
          className="py-3 px-6  hover:scale-[1.01] disabled:opacity-70 disabled:!text-white transition-all  !rounded-xl bg-[#00ffe4]/65 font-medium  outline-none text-white w-full"
        >
          Remove liquidity
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

const LineItem: React.FC<LineItemProps> = ({ label, value }) => (
  <div className="flex justify-between py-2">
    <div className="text-white opacity-75">{label}</div>
    <div className="text-white font-bold">{value}</div>
  </div>
);
