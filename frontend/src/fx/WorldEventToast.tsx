import { useEffect, useState, useCallback } from 'react';
import { Box, Typography, IconButton, keyframes } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import colors from '../theme/colors';
import { WORLD_EVENT_META } from '../theme/assets';
import { subscribeToasts } from './worldEventBus';

/* ---- types ---- */
export type WorldEventType = 'route_blocked' | 'market_shock' | 'route_opened' | 'wanted_change' | 'monopoly_progress';

export interface WorldEventItem {
  id: string;
  message: string;
  type: WorldEventType;
  timestamp: number;
}

const slideIn = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
`;

const AUTO_DISMISS = 4000;

function ToastBar({ event, onDismiss }: { event: WorldEventItem; onDismiss: () => void }) {
  const style = WORLD_EVENT_META[event.type] ?? WORLD_EVENT_META.market_shock;

  useEffect(() => {
    const t = setTimeout(onDismiss, AUTO_DISMISS);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1,
        bgcolor: 'rgba(10,15,30,0.95)',
        borderLeft: `3px solid ${style.color}`,
        boxShadow: `0 2px 12px rgba(0,0,0,0.3)`,
        animation: `${slideIn} 0.3s ease`,
        pointerEvents: 'auto',
        maxWidth: 420,
      }}
    >
      <Box component="img" src={style.src} alt="" sx={{ width: 20, height: 20, flexShrink: 0 }} />
      <Typography sx={{ flex: 1, fontSize: '0.72rem', color: colors.text, fontFamily: 'var(--font-body)' }}>
        {event.message}
      </Typography>
      <IconButton size="small" onClick={onDismiss} sx={{ color: colors.muted }}>
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  );
}

export function WorldEventToastContainer() {
  const [events, setEvents] = useState<WorldEventItem[]>([]);

  useEffect(() => {
    return subscribeToasts((e) => setEvents((prev) => [...prev, e]));
  }, []);

  const dismiss = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  if (events.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 'calc(var(--hud-top-height) + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        pointerEvents: 'none',
      }}
    >
      {events.slice(-3).map((e) => (
        <ToastBar key={e.id} event={e} onDismiss={() => dismiss(e.id)} />
      ))}
    </Box>
  );
}
