import { httpClient } from './http';
import type { ApiResponse } from './http';

export interface TradeRequest {
  playerId: number;
  planetId: number;
  commodityId: number;
  quantity: number;
  tradeType: 'buy' | 'sell';
}

export interface TradeResult {
  success: boolean;
  newCredits: number;
  newCargo: { commodityId: number; commodityName: string; quantity: number }[];
  transactionLogId: number;
}

export async function submitTrade(payload: TradeRequest): Promise<TradeResult> {
  const res = await httpClient.post<ApiResponse<TradeResult>>('/trade', payload);
  return res.data.data;
}
