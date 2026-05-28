import { mockAuthGateway } from './mockAuthGateway';
import { mockGameGateway } from './mockGameGateway';
import type { AuthGateway, GameGateway } from './types';

const DATA_MODE = (import.meta.env.VITE_DATA_MODE ?? 'mock') as 'mock' | 'backend';

function getAuthGateway(): AuthGateway {
  if (DATA_MODE === 'backend') {
    return mockAuthGateway;
  }
  return mockAuthGateway;
}

function getGameGateway(): GameGateway {
  if (DATA_MODE === 'backend') {
    return mockGameGateway;
  }
  return mockGameGateway;
}

export const authGateway = getAuthGateway();
export const gameGateway = getGameGateway();
export { DATA_MODE };
