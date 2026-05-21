import { httpClient } from './http';
import type { ApiResponse } from './http';

export interface EventChoicePayload {
  playerId: number;
  eventId: number;
  choiceId: number;
}

export interface EventChoiceResult {
  success: boolean;
  outcomeDescription: string;
}

export async function submitEventChoice(payload: EventChoicePayload): Promise<EventChoiceResult> {
  const res = await httpClient.post<ApiResponse<EventChoiceResult>>('/event/choice', payload);
  return res.data.data;
}
