import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface PriceInfo {
  commodityId: number;
  commodityName: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
}

export interface MarketState {
  prices: Record<number, PriceInfo[]>;
  lastUpdate: string | null;
  loading: boolean;
}

const initialState: MarketState = {
  prices: {},
  lastUpdate: null,
  loading: false,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setPrices(state, action: PayloadAction<{ planetId: number; prices: PriceInfo[] }>) {
      state.prices[action.payload.planetId] = action.payload.prices;
      state.lastUpdate = new Date().toISOString();
    },
    setMarketLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setPrices, setMarketLoading } = marketSlice.actions;
export default marketSlice.reducer;
