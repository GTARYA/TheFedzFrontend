export interface TokenInfo {
    address: string;
    name: string;
    decimals: number;
  }

export type StepStatus = 'idle' | 'loading' | 'done' | 'error' | 'pending';
export type PositionInfo = {
  owner: string;
  tokenId: number;
  liquidity: number;
};
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

  export type LiquidityEvent = {
    id: string;
    origin: string;
    sender: string;
    amount: string;
    amount0: string;
    amount1: string;
    amountUSD: string;
    logIndex: string;
    tickLower: string;
    tickUpper: string;
    timestamp: string;
    token0: {
      symbol: string;
    };
    token1: {
      symbol: string;
    };
  };
  

export enum LiquidityStep {
  Idle = "idle",
  UnlockingRound = "unlocking_round",
  ApprovingToken0 = "approving_token0",
  ApprovingToken1 = "approving_token1",
  SigningPermit = "signing_permit",
  AddingLiquidity = "adding_liquidity",
  Complete = "complete",
  Error = "error",
}