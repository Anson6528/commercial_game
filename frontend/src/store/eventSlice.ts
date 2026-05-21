import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface EventChoice {
  id: number;
  label: string;
}

export interface GameEvent {
  id: number;
  type: string;
  title: string;
  description: string;
  choices: EventChoice[];
  timestamp: string;
}

export interface NotificationItem {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'danger';
  timestamp: string;
}

export interface EventState {
  activeEvent: GameEvent | null;
  eventHistory: GameEvent[];
  notifications: NotificationItem[];
}

const initialState: EventState = {
  activeEvent: null,
  eventHistory: [],
  notifications: [],
};

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    setActiveEvent(state, action: PayloadAction<GameEvent | null>) {
      if (action.payload) {
        state.activeEvent = action.payload;
        state.eventHistory.push(action.payload);
      } else {
        state.activeEvent = null;
      }
    },
    addNotification(
      state,
      action: PayloadAction<Omit<NotificationItem, 'id' | 'timestamp'>>
    ) {
      state.notifications.push({
        ...action.payload,
        id: Date.now(),
        timestamp: new Date().toISOString(),
      });
    },
    dismissNotification(state, action: PayloadAction<number>) {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    clearActiveEvent(state) {
      state.activeEvent = null;
    },
  },
});

export const { setActiveEvent, addNotification, dismissNotification, clearActiveEvent } =
  eventSlice.actions;

export default eventSlice.reducer;
