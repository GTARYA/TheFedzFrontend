

export const formatOwner = (owner: string | undefined) => {
    if (!owner) return "Fetching...";
    return `${owner.slice(0, 6)}...${owner.slice(-4)}`;
  };
  

  export function formatAmount(value: number | string, decimals = 2): string {
    const num = Math.abs(Number(value));
    return num % 1 === 0 ? num.toString() : `${num.toFixed(decimals)}`;
  }
  