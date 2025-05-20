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
  