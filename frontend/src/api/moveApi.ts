import { httpClient } from './http';
import type { ApiResponse } from './http';

export interface MoveRequest {
  playerId: number;
  targetPlanetId: number;
}

export interface MoveResult {
  success: boolean;
  newPlanetId: number;
  travelCost: number;
}

export async function submitMove(payload: MoveRequest): Promise<MoveResult> {
  const res = await httpClient.post<ApiResponse<MoveResult>>('/move', payload);
  return res.data.data;
}
