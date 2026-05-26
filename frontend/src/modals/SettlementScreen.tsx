import { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, Stack, keyframes } from '@mui/material';
import { Replay as ReplayIcon, Home as HomeIcon, EmojiEvents as TrophyIcon } from '@mui/icons-material';
import { SETTLEMENT_EMOJI } from '../theme/assets';

/* ---- types ---- */
export interface ScoreBreakdown {
  creditsBonus: number;   // 资金 × 0.5
  monopolyBonus: number;  // 垄断数 × 5000
  tradeBonus: number;     // 交易次数 × 100
  eventBonus: number;     // 事件数 × 200
  total: number;
}

export interface SettlementData {
  result: 'won' | 'lost' | 'timeup';
  playerName: string;
  finalCredits: number;
  monopolyCount: number;
  tradeCount: number;
  eventCount: number;
  breakdown: ScoreBreakdown;
}

interface Props {
  data: SettlementData;
  onReplay?: () => void;
  onHome?: () => void;
}

/* ---- animations ---- */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 40px rgba(0,212,170,0.15); }
  50%      { box-shadow: 0 0 80px rgba(0,212,170,0.35); }
`;

/* ---- counting number hook ---- */
function useCountUp(target: number, duration: number, start: boolean) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  const prevRounded = useRef(-1);

  useEffect(() => {
    if (!start) {
      const resetTimer = setTimeout(() => setValue(0), 0);
      return () => clearTimeout(resetTimer);
    }
    const startTime = performance.now();
    prevRounded.current = -1;
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(target * eased);
      if (next !== prevRounded.current) {
        prevRounded.current = next;
        setValue(next);
      }
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, start]);

  return value;
}

function ScoreRow({ label, value, delay, color = '#e8eaed' }: {
  label: string; value: number; delay: number; color?: string;
}) {
  const [visible, setVisible] = useState(false);
  const count = useCountUp(value, 1200, visible);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        py: 1,
        px: 2,
        borderBottom: '1px solid rgba(0,212,170,0.06)',
        animation: visible ? `${fadeIn} 0.5s ease both` : 'none',
        opacity: visible ? 1 : 0,
      }}
    >
      <Typography variant="body1" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color }}>
        {count.toLocaleString()} cr
      </Typography>
    </Box>
  );
}

/* ---- main component ---- */
export default function SettlementScreen({ data, onReplay, onHome }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, []);

  const isWin = data.result === 'won';

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
        py: 4,
        bgcolor: isWin ? 'rgba(0,212,170,0.03)' : 'rgba(239,68,68,0.03)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* ambient glow */}
      <Box
        sx={{
          position: 'absolute',
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: isWin
            ? 'radial-gradient(circle, rgba(0,212,170,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)',
          animation: `${glow} 3s ease-in-out infinite`,
          pointerEvents: 'none',
        }}
      />

      <Stack spacing={2} sx={{ position: 'relative', zIndex: 1, alignItems: 'center' }}>
        {/* ---- result icon ---- */}
        <Box sx={{ textAlign: 'center', animation: `${fadeIn} 0.6s ease both` }}>
          <Box sx={{ fontSize: 48, mb: 1, lineHeight: 1 }}>
            {SETTLEMENT_EMOJI[data.result] ?? SETTLEMENT_EMOJI.timeup}
          </Box>
          <Typography
            variant="h5"
            sx={{ color: isWin ? '#00d4aa' : data.result === 'lost' ? '#ef4444' : '#f59e0b' }}
          >
            {isWin ? 'MONOPOLY VICTORY' : data.result === 'lost' ? 'BANKRUPT' : 'TIME\'S UP'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {data.playerName}
          </Typography>
        </Box>

        {/* ---- score breakdown ---- */}
        <Box
          className="modal-panel"
          sx={{
            width: 340,
            maxWidth: '88vw',
            bgcolor: 'rgba(17,22,51,0.9)',
            borderRadius: 2,
            border: '1px solid rgba(0,212,170,0.12)',
            overflow: 'hidden',
            animation: `${fadeIn} 0.6s ease 0.3s both`,
          }}
        >
          <Box sx={{ px: 2.5, py: 1.25, borderBottom: '1px solid rgba(0,212,170,0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <TrophyIcon sx={{ color: isWin ? '#00d4aa' : '#f59e0b' }} />
              <Typography variant="h6">Final Score</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Credits × 0.5 + Monopoly × 5,000 + Trades × 100 + Events × 200
            </Typography>
          </Box>

          <ScoreRow label="Credits Bonus"       value={data.breakdown.creditsBonus}  delay={500} />
          <ScoreRow label="Monopoly Bonus"      value={data.breakdown.monopolyBonus} delay={800}  color={data.monopolyCount > 0 ? '#00d4aa' : '#e8eaed'} />
          <ScoreRow label="Trade Activity"      value={data.breakdown.tradeBonus}    delay={1100} />
          <ScoreRow label="Event Participation" value={data.breakdown.eventBonus}    delay={1400} />

          {/* total */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              py: 1.5,
              px: 3,
              bgcolor: isWin ? 'rgba(0,212,170,0.08)' : 'rgba(255,255,255,0.03)',
              animation: `${fadeIn} 0.5s ease 1.7s both`,
              opacity: show ? 1 : 0,
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600 }}>Total</Typography>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                color: isWin ? '#00d4aa' : '#f59e0b',
              }}
            >
              {show ? (
                <CountUpFinal value={data.breakdown.total} start={show} />
              ) : '0'}
            </Typography>
          </Box>

          {/* quick stats */}
          <Box sx={{ px: 2.5, py: 1, display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(0,212,170,0.06)' }}>
            {[
              ['Final Credits', data.finalCredits.toLocaleString()],
              ['Monopolies', String(data.monopolyCount)],
              ['Trades', String(data.tradeCount)],
              ['Events', String(data.eventCount)],
            ].map(([label, val]) => (
              <Box key={label} sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.disabled">{label}</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)' }}>{val}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ---- actions ---- */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ animation: `${fadeIn} 0.6s ease 2s both`, opacity: show ? 1 : 0 }}
        >
          <Button
            variant="contained"
            color="primary"
            size="medium"
            startIcon={<ReplayIcon />}
            onClick={onReplay}
            sx={{ px: 3, py: 1 }}
          >
            Play Again
          </Button>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<HomeIcon />}
            onClick={onHome}
            sx={{ px: 3, py: 1 }}
          >
            Main Menu
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

/* ---- small helper for final total counting up ---- */
function CountUpFinal({ value, start }: { value: number; start: boolean }) {
  const count = useCountUp(value, 1800, start);
  return <>{count.toLocaleString()} cr</>;
}
