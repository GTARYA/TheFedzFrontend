import { parseUnits } from "viem";
interface BalanceDisplayProps {
  label: string;
  balance?: any;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ label, balance }) => (
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm sm:text-base">{label}</span>
    <span className="text-sm sm:text-base">
      Balance :
      {balance?.formatted
        ? parseFloat(balance.formatted).toFixed(4)
        : " - "}
    </span>
  </div>
);

export default BalanceDisplay;
