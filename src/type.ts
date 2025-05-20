export interface TokenInfo {
    address: string;
    name: string;
    decimals: number;
  }


  export interface TurnOrderEntry {
    name: string;
    tokenId: number;
    timestamp: number;
    image: string;
    point: number;
    startTime: number; 
    endTime: number; 
  }
  
  export interface LatestEventResponse {
    turnOrder: TurnOrderEntry[];
    slotDuration: number;
    startsAt: number;
    roundNumber:number
  }
  

  export interface TokenInfo {
    symbol: string;
  }
  
  export interface SwapEvent {
    id: string;
    origin: string;
    sender: string;
    amountUSD: string;
    amount0: string;
    amount1: string;
    token0: TokenInfo;
    token1: TokenInfo;
    timestamp:string
  }