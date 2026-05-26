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
        px: 2.5,
        gap: 3,
        zIndex: 10,
      }}
    >
      {/* ---- 资金 ---- */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 160 }}>
        <Box component="img" src={ASSET_PATHS.icons.uiCredits} alt="" sx={{ width: 22, height: 22, opacity: 0.9 }} />
        <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
          <AnimatedNumber
            value={credits}
            duration={600}
            formatted
            style={{
              fontWeight: 700,
              fontSize: '1.1rem',
              color:
                creditDelta > 0 ? colors.accent :
                creditDelta < 0 ? colors.danger :
                colors.white,
            }}
          />
          <Typography component="span" sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: colors.muted, ml: 0.5 }}>
            CR
          </Typography>
        </Box>
      </Box>

      {/* ---- 状态 ---- */}
      <Chip
        label={STATUS_LABEL[status].text}
        size="small"
        sx={{
          bgcolor: `${STATUS_LABEL[status].color}22`,
          color: STATUS_LABEL[status].color,
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          fontSize: '0.7rem',
          letterSpacing: '0.05em',
          border: `1px solid ${STATUS_LABEL[status].color}44`,
          height: 26,
        }}
      />

      {/* ---- 时间/年份 ---- */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 80 }}>
        <Box component="img" src={ASSET_PATHS.icons.uiTime} alt="" sx={{ width: 18, height: 18, opacity: 0.7 }} />
        <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: colors.text, letterSpacing: '0.05em' }}>
          Y-{galacticYear}
        </Typography>
      </Box>

      {/* ---- 行动点 ---- */}
      <Box sx={{ flex: 1, maxWidth: 220 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
            <Box component="img" src={ASSET_PATHS.icons.uiTime} alt="" sx={{ width: 12, height: 12, opacity: 0.5 }} />
          </Box>
          <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: colors.primary }}>
            {actionPoints}/{maxActionPoints}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(actionPoints / maxActionPoints) * 100}
          sx={{
            height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.04)',
            '& .MuiLinearProgress-bar': {
              background:
                actionPoints / maxActionPoints > 0.3 ? colors.primary :
                actionPoints / maxActionPoints > 0.1 ? colors.warning :
                colors.danger,
            },
          }}
        />
      </Box>

      {/* ---- 通缉 ---- */}
      {wantedLevel > 0 && (
        <Chip
          label={`WANTED Lv${wantedLevel}`}
          size="small"
          sx={{
            bgcolor: `${colors.danger}22`,
            color: colors.danger,
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.65rem',
            letterSpacing: '0.08em',
            border: `1px solid ${colors.danger}44`,
            animation: 'pulse 1.5s ease-in-out infinite',
            height: 24,
          }}
        />
      )}

      {/* ---- 结束按钮 ---- */}
      <Button
        variant="contained"
        color="error"
        size="small"
        startIcon={<Box component="img" src={ASSET_PATHS.icons.uiEnd} alt="" sx={{ width: 14, height: 14 }} />}
        onClick={onEndGame}
        disabled={disabled}
        sx={{
          ml: 'auto',
          fontSize: '0.65rem',
          letterSpacing: '0.06em',
          py: 0.75,
          px: 2,
          borderRadius: 1,
          minWidth: 0,
        }}
      >
        结束本局
      </Button>
    </Box>
  );
}
