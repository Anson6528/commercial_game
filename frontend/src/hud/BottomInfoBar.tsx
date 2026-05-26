import { Box, Typography, LinearProgress, Tooltip, IconButton } from '@mui/material';
import colors from '../theme/colors';
import { GOODS_SHORT_NAMES, ASSET_PATHS, goodsSrc } from '../theme/assets';

/* ---- types ---- */
export interface MonopolyItem {
  goodsId: number;
  goodsName: string;
  shortName: string;
  icon: string;
  ratio: number; // 0–1
}

export interface BottomInfoBarProps {
  monopolyItems: MonopolyItem[];
  currentStationName?: string;
  currentStationSecurity?: string;
  hoveredStationName?: string;
  hoveredMoveCost?: number;
  onToggleRegionView?: () => void;
  regionViewActive?: boolean;
}

function MiniProgressBar({ item }: { item: MonopolyItem }) {
  const pct = item.ratio * 100;
  const barColor =
    pct >= 80 ? colors.accent :
    pct >= 50 ? colors.warning :
    colors.primary;
  const reachedMonopoly = pct >= 80;

  return (
    <Tooltip
      title={`${item.goodsName}: ${pct.toFixed(1)}%`}
      arrow
      placement="top"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25, minWidth: 52 }}>
        <Box component="img" src={goodsSrc(item.goodsId)} alt={item.goodsName} sx={{ width: 20, height: 20, opacity: 0.85 }} />
        <Typography
          sx={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.55rem',
            color: colors.muted,
            lineHeight: 1,
          }}
        >
          {GOODS_SHORT_NAMES[item.goodsId] ?? item.shortName}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={Math.min(pct, 100)}
          sx={{
            width: '100%',
            height: 3,
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.04)',
            '& .MuiLinearProgress-bar': {
              bgcolor: barColor,
              animation: reachedMonopoly ? 'pulse 1s ease-in-out infinite' : 'none',
            },
          }}
        />
        <Typography
          sx={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.5rem',
            fontWeight: reachedMonopoly ? 700 : 400,
            color: barColor,
          }}
        >
          {pct.toFixed(0)}%
        </Typography>
      </Box>
    </Tooltip>
  );
}

export default function BottomInfoBar({
  monopolyItems,
  currentStationName,
  currentStationSecurity,
  hoveredStationName,
  hoveredMoveCost,
  onToggleRegionView,
  regionViewActive,
}: BottomInfoBarProps) {
  return (
    <Box
      className="hud-panel hud-panel-bottom"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--hud-bottom-height)',
        display: 'flex',
        alignItems: 'center',
        px: 2.5,
        gap: 3,
        zIndex: 10,
      }}
    >
      {/* ---- monopoly mini bars ---- */}
      <Box sx={{ display: 'flex', gap: 1.5, flex: 2, alignItems: 'flex-end', overflow: 'auto' }}>
        {monopolyItems.length > 0 ? (
          monopolyItems.map((item) => <MiniProgressBar key={item.goodsId} item={item} />)
        ) : (
          <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: colors.muted }}>
            No monopoly data
          </Typography>
        )}
      </Box>

      {/* ---- station info ---- */}
      <Box sx={{ flex: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
        {currentStationName ? (
          <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: colors.white }}>
            {'📍'} {currentStationName}
            {currentStationSecurity && (
              <Typography component="span" sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: colors.muted, ml: 0.75 }}>
                安全: {currentStationSecurity}
              </Typography>
            )}
          </Typography>
        ) : (
          <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: colors.muted }}>
            Unknown location
          </Typography>
        )}

        {/* hovered station preview */}
        {hoveredStationName && (
          <Typography
            sx={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: colors.primary,
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {'🎯'} 悬停: {hoveredStationName}
            {hoveredMoveCost !== undefined && (
              <Typography component="span" sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: colors.warning, ml: 0.75 }}>
                消耗: {hoveredMoveCost} 单位
              </Typography>
            )}
          </Typography>
        )}
      </Box>

      {/* ---- region view toggle ---- */}
      <IconButton
        onClick={onToggleRegionView}
        size="small"
        sx={{
          ml: 1,
          border: `1px solid ${regionViewActive ? colors.primary : colors.border}`,
          borderRadius: 1,
          opacity: regionViewActive ? 1 : 0.5,
          transition: 'all var(--transition-fast)',
          '&:hover': { borderColor: colors.primary, opacity: 1 },
        }}
      >
        <Box component="img" src={ASSET_PATHS.icons.uiSector} alt="" sx={{ width: 18, height: 18 }} />
      </IconButton>
    </Box>
  );
}
