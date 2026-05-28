import { resolveEncounter, rollEncounter } from '../api/sessionEncounterApi';
import { fetchSessionTemplate, normalizeSession, persistSession, restoreSession } from '../api/sessionApi';
import { executeTrade, openStationMarket } from '../api/sessionTradeApi';
import { depositToWarehouse, withdrawFromWarehouse } from '../api/sessionWarehouseApi';
import { advanceWorldState } from '../api/sessionWorldApi';
import { createGameSession, generateSessionSeed } from '../game/sessionGenerator';
import { evaluateGameState } from '../game/monopolyService';
import type { GameGateway, StartMoveResult } from './types';
import type { GameSessionData } from '../game/types';

function cloneSession(session: GameSessionData): GameSessionData {
  return JSON.parse(JSON.stringify(session)) as GameSessionData;
}

export const mockGameGateway: GameGateway = {
  async startSession(playerName) {
    const template = await fetchSessionTemplate();
    const session = normalizeSession(createGameSession(template, playerName, generateSessionSeed()));
    persistSession(session);
    return session;
  },

  restoreSession() {
    return restoreSession();
  },

  persistSession(session) {
    persistSession(session);
  },

  async openMarket(session, stationId) {
    return openStationMarket(session, stationId);
  },

  async executeTrade(session, payload) {
    return executeTrade(session, payload);
  },

  async depositWarehouse(session, payload) {
    return depositToWarehouse(session, payload);
  },

  async withdrawWarehouse(session, payload) {
    return withdrawFromWarehouse(session, payload);
  },

  startMove(session, params): StartMoveResult {
    const movedSession = cloneSession(session);
    movedSession.player.currentStationId = params.targetStationId;
    movedSession.player.status = 'TRAVELING';
    movedSession.ui.activeTravel = null;
    movedSession.ui.hoveredStationId = null;
    movedSession.ui.selectedTargetStationId = null;
    movedSession.ui.moveState = 'traveling';
    movedSession.ui.pendingAction = {
      type: 'move',
      stationId: params.stationId,
      targetStationId: params.targetStationId,
      yearsCost: params.yearsCost,
      baseYearsSettled: false,
    };

    const route = movedSession.routes.find((item) => {
      const direct = item.from === params.stationId && item.to === params.targetStationId;
      const reverse = item.to === params.stationId && item.from === params.targetStationId;
      return direct || reverse;
    });

    const encounter = route ? rollEncounter(movedSession, route) : null;
    return {
      session: movedSession,
      encounter: encounter
        ? {
            id: encounter.id,
            title: encounter.title,
            description: encounter.description,
            choices: encounter.choices,
          }
        : null,
    };
  },

  resolveEncounterChoice(session, payload) {
    const nextSession = cloneSession(session);
    nextSession.ui.pendingAction = payload.pendingAction;
    return resolveEncounter(nextSession, payload.choiceId);
  },

  finalizeEncounterAndAdvance(session) {
    const yearsElapsed =
      session.ui.pendingAction.type === 'move' && !session.ui.pendingAction.baseYearsSettled
        ? session.ui.pendingAction.yearsCost ?? 0
        : 0;

    const advanced = advanceWorldState(session, { yearsElapsed, source: 'move' });
    advanced.ui.pendingAction = {
      ...advanced.ui.pendingAction,
      baseYearsSettled: true,
    };
    return advanced;
  },

  advanceWorld(session, yearsElapsed, source) {
    return advanceWorldState(session, { yearsElapsed, source });
  },

  evaluateSettlement(session) {
    return evaluateGameState(session);
  },
};
