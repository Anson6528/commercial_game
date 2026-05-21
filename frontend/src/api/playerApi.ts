import { httpClient } from './http';
import type { ApiResponse } from './http';
import type { CargoItem } from '../store/playerSlice';

export interface PlayerStatus {
  id: number;
  name: string;
  credits: number;
  currentPlanetId: number;
  cargo: CargoItem[];
  wantedLevel: number;
}

export async function getPlayerStatus(playerId: number): Promise<PlayerStatus> {
  const res = await httpClient.get<ApiResponse<PlayerStatus>>(`/players/${playerId}/status`);
  return res.data.data;
}
