import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface CargoItem {
  commodityId: number;
  commodityName: string;
  quantity: number;
}

export interface PlayerState {
  id: number | null;
  name: string;
  credits: number;
  currentPlanetId: number | null;
  cargo: CargoItem[];
  wantedLevel: number;
  loading: boolean;
  error: string | null;
}

const initialState: PlayerState = {
  id: null,
  name: '',
  credits: 0,
  currentPlanetId: null,
  cargo: [],
  wantedLevel: 0,
  loading: false,
  error: null,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlayer(state, action: PayloadAction<Partial<PlayerState>>) {
      Object.assign(state, action.payload);
    },
    setPlayerLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setPlayerError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    updateCredits(state, action: PayloadAction<number>) {
      state.credits = action.payload;
    },
    updateCargo(state, action: PayloadAction<CargoItem[]>) {
      state.cargo = action.payload;
    },
    updateWantedLevel(state, action: PayloadAction<number>) {
      state.wantedLevel = action.payload;
    },
  },
});

export const {
  setPlayer,
  setPlayerLoading,
  setPlayerError,
  updateCredits,
  updateCargo,
  updateWantedLevel,
} = playerSlice.actions;

export default playerSlice.reducer;
