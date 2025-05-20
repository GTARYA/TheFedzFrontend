

export const formatOwner = (owner: string | undefined) => {
    if (!owner) return "Fetching...";
    return `${owner.slice(0, 6)}...${owner.slice(-4)}`;
  };
  