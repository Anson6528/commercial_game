import { configureStore } from '@reduxjs/toolkit';
import playerReducer, {
  setPlayer,
  setPlayerLoading,
  setPlayerError,
  updateCredits,
  updateCargo,
  updateWantedLevel,
} from './playerSlice';
import starMapReducer, {
  setPlanets,
  setConnections,
  selectPlanet,
  setStarMapLoading,
} from './starMapSlice';
import marketReducer, { setPrices, setMarketLoading } from './marketSlice';
import eventReducer, {
  setActiveEvent,
  addNotification,
  dismissNotification,
  clearActiveEvent,
} from './eventSlice';

export const store = configureStore({
  reducer: {
    player: playerReducer,
    starMap: starMapReducer,
    market: marketReducer,
    event: eventReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export {
  setPlayer,
  setPlayerLoading,
  setPlayerError,
  updateCredits,
  updateCargo,
  updateWantedLevel,
  setPlanets,
  setConnections,
  selectPlanet,
  setStarMapLoading,
  setPrices,
  setMarketLoading,
  setActiveEvent,
  addNotification,
  dismissNotification,
  clearActiveEvent,
};
