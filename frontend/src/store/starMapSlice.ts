import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Planet {
  id: number;
  name: string;
  x: number;
  y: number;
  faction: string;
}

export interface Connection {
  from: number;
  to: number;
}

export interface StarMapState {
  planets: Planet[];
  connections: Connection[];
  selectedPlanetId: number | null;
  loading: boolean;
}

const initialState: StarMapState = {
  planets: [],
  connections: [],
  selectedPlanetId: null,
  loading: false,
};

const starMapSlice = createSlice({
  name: 'starMap',
  initialState,
  reducers: {
    setPlanets(state, action: PayloadAction<Planet[]>) {
      state.planets = action.payload;
    },
    setConnections(state, action: PayloadAction<Connection[]>) {
      state.connections = action.payload;
    },
    selectPlanet(state, action: PayloadAction<number | null>) {
      state.selectedPlanetId = action.payload;
    },
    setStarMapLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setPlanets, setConnections, selectPlanet, setStarMapLoading } = starMapSlice.actions;
export default starMapSlice.reducer;
