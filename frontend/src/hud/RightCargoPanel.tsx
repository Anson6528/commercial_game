import { Box, Typography, Tooltip } from '@mui/material';
import colors from '../theme/colors';
import { ASSET_PATHS, goodsSrc } from '../theme/assets';

/* ---- types ---- */
export interface CargoSlot {
  goodsId: number;
  goodsName: string;
  quantity: number;
  avgCost?: number;
  isContraband?: boolean;
}

export interface RightCargoPanelProps {
  cargoUsed: number;
  cargoCapacity: number;
  slots: (CargoSlot | null)[];
  onSlotClick?: (goodsId: number) => void;
}

const ICON_SIZE = 24;

export default function RightCargoPanel({
  cargoUsed,
  cargoCapacity,
  slots,
  onSlotClick,
}: RightCargoPanelProps) {
  return (
    <Box
      className="hud-panel hud-panel-right"
      sx={{
        position: 'fixed',
        top: 'var(--hud-top-height)',
        right: 0,
        bottom: 'var(--hud-bottom-height)',
        width: 'var(--hud-right-width)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        py: 1.5,
        px: 1.25,
      }}
    >
      {/* ---- title ---- */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, px: 0.75 }}>
        <Box component="img" src={ASSET_PATHS.icons.uiCargo} alt="" sx={{ width: 16, height: 16, opacity: 0.7 }} />
        <Typography
          sx={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.7rem',
            fontWeight: 600,
            color: colors.text,
            letterSpacing: '0.06em',
          }}
        >
          CARGO <span style={{ color: colors.primary }}>{cargoUsed}</span>/{cargoCapacity}
        </Typography>
      </Box>

      {/* ---- slots ---- */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75, overflowY: 'auto' }}>
        {slots.map((slot, i) =>
          slot ? (
            <Tooltip
              key={slot.goodsId}
              title={`${slot.goodsName} ×${slot.quantity}${slot.avgCost ? ` @ ${slot.avgCost.toLocaleString()} CR` : ''}`}
              arrow
              placement="left"
            >
              <Box
                onClick={() => onSlotClick?.(slot.goodsId)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 0.75,
                  py: 1,
                  borderRadius: 1,
                  bgcolor: 'rgba(0,212,255,0.03)',
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover': {
                    bgcolor: 'rgba(0,212,255,0.06)',
                    borderColor: colors.primary,
                  },
                }}
              >
                {/* goods icon */}
                <Box
                  component="img"
                  src={goodsSrc(slot.goodsId)}
                  alt={slot.goodsName}
                  sx={{ width: ICON_SIZE, height: ICON_SIZE, flexShrink: 0 }}
                />
                {/* info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: colors.white, lineHeight: 1.3 }} noWrap>
                    {slot.goodsName}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: colors.primary }}>
                      ×{slot.quantity}
                    </Typography>
                    {slot.avgCost && (
                      <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: colors.muted }} noWrap>
                        @ {slot.avgCost.toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
                {/* contraband badge */}
                {slot.isContraband && (
                  <Box
                    component="img"
                    src={ASSET_PATHS.icons.contrabandWarning}
                    alt="违禁品"
                    sx={{
                      position: 'absolute',
                      top: -2,
                      right: 2,
                      width: 14,
                      height: 14,
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          ) : (
            <Box
              key={`empty-${i}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 0.75,
                py: 1.25,
                borderRadius: 1,
                border: `1px dashed ${colors.muted}33`,
                minHeight: 42,
              }}
            >
              <Typography sx={{ fontSize: '0.62rem', color: colors.muted, fontFamily: 'var(--font-mono)' }}>
                空仓
              </Typography>
            </Box>
          ),
        )}
      </Box>
    </Box>
  );
}
