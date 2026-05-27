import { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Replay as ReplayIcon, Home as HomeIcon } from '@mui/icons-material';
import colors from '../theme/colors';
import { SETTLEMENT_EMOJI } from '../theme/assets';

/* ---- types ---- */
export interface ScoreBreakdown {
  creditsBonus: number;
  monopolyBonus: number;
  tradeBonus: number;
  eventBonus: number;
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

function ScoreRow({ label, value, delay, color = colors.textMain }: {
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
        borderBottom: `1px solid ${colors.border}`,
        animation: visible ? 'fadeIn 0.5s ease both' : 'none',
        opacity: visible ? 1 : 0,
      }}
    >
      <Typography sx={{ fontSize: '0.85rem', color: colors.textSub }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color }}>
        {count.toLocaleString()} CR
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
  const resultColor = isWin ? colors.successLow : data.result === 'lost' ? colors.dangerHigh : colors.warning;
  const resultTitle = isWin ? '贸易垄断达成' : data.result === 'lost' ? '破产清算' : '时间耗尽';

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
        bgcolor: 'rgba(10,14,26,0.85)',
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
          background: `radial-gradient(circle, ${resultColor}18 0%, transparent 70%)`,
          animation: 'glowPulse 3s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
        {/* ---- result icon ---- */}
        <Box sx={{ textAlign: 'center', animation: 'fadeIn 0.6s ease both' }}>
          <Box sx={{ fontSize: 48, mb: 1, lineHeight: 1 }}>
            {SETTLEMENT_EMOJI[data.result] ?? SETTLEMENT_EMOJI.timeup}
          </Box>
          <Typography
            sx={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.3rem',
              color: resultColor,
              letterSpacing: '0.04em',
              textShadow: `0 0 20px ${resultColor}44`,
            }}
          >
            {resultTitle}
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: colors.textSub, mt: 0.5, fontFamily: 'var(--font-mono)' }}>
            {data.playerName}
          </Typography>
        </Box>

        {/* ---- score breakdown ---- */}
        <Box
          className="glass-panel"
          sx={{
            width: 380,
            maxWidth: '92vw',
            borderRadius: '4px',
            border: `1px solid ${resultColor}33`,
            overflow: 'hidden',
            animation: 'fadeIn 0.6s ease 0.3s both',
          }}
        >
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${colors.border}` }}>
            <Typography
              sx={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.85rem',
                letterSpacing: '0.06em',
                color: colors.textMain,
              }}
            >
              结算明细
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: colors.muted, mt: 0.25, fontFamily: 'var(--font-mono)' }}>
              资金 × 0.5 + 垄断 × 5,000 + 交易 × 100 + 事件 × 200
            </Typography>
          </Box>

          <ScoreRow label="资金加成" value={data.breakdown.creditsBonus} delay={500} />
          <ScoreRow label="垄断加成" value={data.breakdown.monopolyBonus} delay={800} color={data.monopolyCount > 0 ? colors.successLow : colors.textMain} />
          <ScoreRow label="交易活跃" value={data.breakdown.tradeBonus} delay={1100} />
          <ScoreRow label="事件参与" value={data.breakdown.eventBonus} delay={1400} />

          {/* total */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              py: 1.5,
              px: 3,
              bgcolor: `${resultColor}10`,
              animation: 'fadeIn 0.5s ease 1.7s both',
              opacity: show ? 1 : 0,
            }}
          >
            <Typography sx={{ fontWeight: 600, color: colors.textMain, fontSize: '0.9rem' }}>总计</Typography>
            <Typography
              sx={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                fontSize: '1.25rem',
                color: resultColor,
                textShadow: `0 0 12px ${resultColor}33`,
              }}
            >
              {show ? (
                <CountUpFinal value={data.breakdown.total} start={show} />
              ) : '0 CR'}
            </Typography>
          </Box>

          {/* quick stats */}
          <Box sx={{ px: 2.5, py: 1.25, display: 'flex', justifyContent: 'space-around', borderTop: `1px solid ${colors.border}` }}>
            {[
              ['最终资金', data.finalCredits.toLocaleString()],
              ['垄断数', String(data.monopolyCount)],
              ['交易次数', String(data.tradeCount)],
              ['事件数', String(data.eventCount)],
            ].map(([label, val]) => (
              <Box key={label} sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.6rem', color: colors.muted, fontFamily: 'var(--font-mono)' }}>{label}</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: colors.textMain, fontFamily: 'var(--font-mono)', fontWeight: 600, mt: 0.25 }}>{val}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ---- actions ---- */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            animation: 'fadeIn 0.6s ease 2s both',
            opacity: show ? 1 : 0,
          }}
        >
          <Button
            className="tech-button"
            variant="contained"
            startIcon={<ReplayIcon />}
            onClick={onReplay}
            sx={{
              px: 4,
              py: 1,
              fontFamily: 'var(--font-heading)',
              fontSize: '0.85rem',
              letterSpacing: '0.05em',
              clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
              background: 'linear-gradient(180deg, rgba(0,212,255,0.18) 0%, rgba(0,212,255,0.06) 100%)',
              border: `1px solid ${colors.borderHover}`,
              color: colors.white,
              '&:hover': { boxShadow: `0 0 16px ${colors.glowStrong}` },
            }}
          >
            再来一局
          </Button>
          <Button
            className="tech-button"
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={onHome}
            sx={{
              px: 4,
              py: 1,
              fontFamily: 'var(--font-heading)',
              fontSize: '0.85rem',
              letterSpacing: '0.05em',
              clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
              borderColor: colors.border,
              color: colors.textSub,
              '&:hover': { borderColor: colors.primary, color: colors.primary, bgcolor: 'rgba(0,212,255,0.04)' },
            }}
          >
            返回大厅
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

/* ---- small helper for final total counting up ---- */
function CountUpFinal({ value, start }: { value: number; start: boolean }) {
  const count = useCountUp(value, 1800, start);
  return <>{count.toLocaleString()} CR</>;
}
