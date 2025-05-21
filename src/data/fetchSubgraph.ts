// utils/fetchSwaps.ts

import { request, gql } from "graphql-request";
import { SwapEvent,LiquidityEvent } from "../type";
const UNISWAP_V4_SUBGRAPH_URL =
  "https://gateway.thegraph.com/api/698277d3f9cff02cebc36c39c54ea91d/subgraphs/id/G5TsTKNi8yhPSV7kycaE23oWbqv9zzNqR49FoEQjzq1r";

  export const fetchSwapsFromSubgraph = async (
    pool: string,
    origin?: string
  ): Promise<SwapEvent[]> => {

  const query = gql`
    query GetSwaps($pool: String!, $origin: String) {
      swaps(
        where: {
          pool: $pool
          ${origin ? "origin: $origin" : ""}
        }
        orderDirection: desc
        orderBy: timestamp
        first: 100
      ) {
        id
        origin
        sender
        amountUSD
        amount0
        amount1
        timestamp
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
    }
  `;

  const variables: Record<string, string> = {
    pool: pool.toLowerCase(),
  };

  if (origin) {
    variables.origin = origin.toLowerCase();
  }

  try {
    const data: { swaps?: SwapEvent[] } = await request(
        UNISWAP_V4_SUBGRAPH_URL,
        query,
        variables
      );

    return Array.isArray(data?.swaps) ? data.swaps : [];
  } catch (error) {
    console.error("Subgraph fetch error:", error);
    return [];
  }
};


export const fetchLiquidityEventsFromSubgraph = async (
  pool: string,
  origin?: string
): Promise<LiquidityEvent[]> => {
  const query = gql`
    query GetModifyLiquidities($pool: String!, $origin: String) {
      modifyLiquidities(
        where: {
          pool: $pool
          ${origin ? "origin: $origin" : ""}
        }
        orderDirection: desc
        orderBy: timestamp
        first: 100
      ) {
        id
        origin
        sender
        amount
        amount0
        amount1
        amountUSD
        logIndex
        tickLower
        tickUpper
        timestamp
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
    }
  `;

  const variables: Record<string, string> = {
    pool: pool.toLowerCase(),
  };

  if (origin) {
    variables.origin = origin.toLowerCase();
  }

  try {
    const data: { modifyLiquidities?: LiquidityEvent[] } = await request(
      UNISWAP_V4_SUBGRAPH_URL,
      query,
      variables
    );
    return Array.isArray(data?.modifyLiquidities)
      ? data.modifyLiquidities
      : [];
  } catch (error) {
    console.error("Liquidity fetch error:", error);
    return [];
  }
};