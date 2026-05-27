import { Box, Typography, Button, LinearProgress, Chip } from '@mui/material';
import AnimatedNumber from '../fx/AnimatedNumber';
import colors from '../theme/colors';
import { ASSET_PATHS } from '../theme/assets';

/* ---- types ---- */
export type PlayerStatus = 'EXPLORING' | 'TRAVELING' | 'TRADING' | 'DETAINED';

const STATUS_LABEL: Record<PlayerStatus, { text: string; color: string }> = {
  EXPLORING: { text: '自由探索', color: colors.accent },
  TRAVELING: { text: '航行中', color: colors.primary },
  TRADING:   { text: '交易中', color: colors.warning },
  DETAINED:  { text: '被扣留', color: colors.danger },
};

export interface TopHUDProps {
  credits: number;
  previousCredits?: number;
  status: PlayerStatus;
  galacticYear: number;
  actionPoints: number;
  maxActionPoints: number;
  wantedLevel: number;
  onEndGame: () => void;
  disabled?: boolean;
}

/* glowing vertical divider */
function GlowDivider() {
  return (
    <Box
      sx={{
        width: '1px',
        height: '70%',
        background: 'linear-gradient(180deg, transparent, rgba(0,212,255,0.3), transparent)',
        mx: 1.5,
        flexShrink: 0,
      }}
    />
  );
}

export default function TopHUD({
  credits,
  previousCredits,
  status,
  galacticYear,
  actionPoints,
  maxActionPoints,
  wantedLevel,
  onEndGame,
  disabled,
}: TopHUDProps) {
  const creditDelta = previousCredits ? credits - previousCredits : 0;

  return (
    <Box
      className="hud-panel hud-panel-top"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--hud-top-height)',
        display: 'flex',
        alignItems: 'center',
        px: 3,
        gap: 2,
        zIndex: 10,
        background: 'rgba(10, 14, 26, 0.7)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* ---- 资金 ---- */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 180 }}>
        <Box component="img" src={ASSET_PATHS.icons.uiCredits} alt="" sx={{ width: 28, height: 28, opacity: 0.9 }} />
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
          <AnimatedNumber
            value={credits}
            duration={600}
            formatted
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '1.5rem',
              letterSpacing: '-0.02em',
              color: creditDelta > 0 ? colors.successLow : creditDelta < 0 ? colors.dangerHigh : colors.textMain,
              textShadow: creditDelta !== 0
                ? `0 0 10px ${creditDelta > 0 ? 'rgba(0,229,160,0.4)' : 'rgba(255,71,87,0.4)'}`
                : 'none',
            }}
          />
          <Typography component="span" sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: colors.textSub, ml: 0.5 }}>
            CR
          </Typography>
        </Box>
      </Box>

      <GlowDivider />

      {/* ---- 状态 ---- */}
      <Chip
        label={STATUS_LABEL[status].text}
        size="small"
        sx={{
          bgcolor: `${STATUS_LABEL[status].color}18`,
          color: STATUS_LABEL[status].color,
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
          border: `1px solid ${STATUS_LABEL[status].color}44`,
          height: 28,
          borderRadius: '2px',
        }}
      />

      <GlowDivider />

      {/* ---- 时间/年份 ---- */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 100 }}>
        <Box component="img" src={ASSET_PATHS.icons.uiTime} alt="" sx={{ width: 20, height: 20, opacity: 0.7 }} />
        <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: colors.textMain, letterSpacing: '0.05em' }}>
          Y-{galacticYear}
        </Typography>
      </Box>

      <GlowDivider />

      {/* ---- 行动点 ---- */}
      <Box sx={{ flex: 1, maxWidth: 240, minWidth: 140 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'center' }}>
          <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: colors.textSub }}>
            行动点
          </Typography>
          <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: colors.primary }}>
            {actionPoints}/{maxActionPoints}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(actionPoints / maxActionPoints) * 100}
          sx={{
            height: 5,
            borderRadius: '2px',
            backgroundColor: 'rgba(255,255,255,0.04)',
            '& .MuiLinearProgress-bar': {
              background:
                actionPoints / maxActionPoints > 0.3 ? colors.primary :
                actionPoints / maxActionPoints > 0.1 ? colors.warning :
                colors.dangerHigh,
              borderRadius: '2px',
            },
          }}
        />
      </Box>

      <GlowDivider />

      {/* ---- 通缉 ---- */}
      {wantedLevel > 0 ? (
        <Chip
          label={`WANTED Lv${wantedLevel}`}
          size="small"
          sx={{
            bgcolor: `${colors.wantedOrange}18`,
            color: colors.wantedOrange,
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.7rem',
            letterSpacing: '0.08em',
            border: `1px solid ${colors.wantedOrange}55`,
            animation: 'wantedBlink 2s ease-in-out infinite',
            height: 26,
            borderRadius: '2px',
          }}
        />
      ) : (
        <Chip
          label="CLEAN"
          size="small"
          sx={{
            bgcolor: `${colors.accent}12`,
            color: colors.accent,
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            fontSize: '0.7rem',
            border: `1px solid ${colors.accent}33`,
            height: 26,
            borderRadius: '2px',
          }}
        />
      )}

      {/* ---- 结束按钮 ---- */}
      <Button
        variant="contained"
        color="error"
        size="small"
        onClick={onEndGame}
        disabled={disabled}
        sx={{
          ml: 'auto',
          fontSize: '0.7rem',
          letterSpacing: '0.06em',
          py: 0.75,
          px: 2.5,
          minWidth: 0,
          clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
          background: 'linear-gradient(180deg, rgba(255,43,109,0.2) 0%, rgba(255,43,109,0.08) 100%)',
          border: '1px solid rgba(255,43,109,0.5)',
          '&:hover': {
            background: 'linear-gradient(180deg, rgba(255,43,109,0.3) 0%, rgba(255,43,109,0.15) 100%)',
            boxShadow: '0 0 16px rgba(255,43,109,0.3)',
          },
        }}
      >
        结束本局
      </Button>
    </Box>
  );
}
