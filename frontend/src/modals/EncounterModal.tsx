import { useState, useEffect } from 'react';
import { Box, Typography, Button, Zoom } from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Cancel as FailIcon,
} from '@mui/icons-material';
import colors from '../theme/colors';
import { ASSET_PATHS } from '../theme/assets';

/* ---- types ---- */
export interface EncounterChoice {
  choiceId: number;
  text: string;
  consequenceHint: string;
  disabled?: boolean;
  disabledReason?: string;
}

export interface EncounterResult {
  success: boolean;
  message: string;
}

export interface EncounterModalProps {
  open: boolean;
  title: string;
  description: string;
  choices: EncounterChoice[];
  result?: EncounterResult | null;
  onChoose: (choiceId: number) => void;
  onConfirmResult: () => void;
}

export default function EncounterModal({
  open,
  title,
  description,
  choices,
  result,
  onChoose,
  onConfirmResult,
}: EncounterModalProps) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  // show immediately on open, delay unmount on close for exit animation
  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open, visible]);

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 21,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        animation: closing ? 'fadeOut 0.3s ease forwards' : 'fadeIn 0.3s ease both',
        '@keyframes fadeOut': { to: { opacity: 0 } },
      }}
    >
      <Box
        className="modal-panel"
        sx={{
          width: 560,
          maxWidth: '90vw',
          maxHeight: '82vh',
          overflow: 'auto',
          bgcolor: 'rgba(16,20,35,0.99)',
          borderRadius: 1,
          border: `1px solid ${colors.danger}44`,
          boxShadow: `0 0 40px ${colors.danger}22`,
          animation: closing ? 'fadeOut 0.3s ease forwards' : 'fadeIn 0.3s ease both',
          '@keyframes fadeOut': { to: { opacity: 0 } },
        }}
      >
        {/* scan lines */}
        <Box sx={{ height: 2, background: `repeating-linear-gradient(0deg, transparent, transparent 12px, ${colors.danger}18 12px, ${colors.danger}18 13px)` }} />

        {/* header */}
        <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${colors.danger}18`, border: `2px solid ${colors.danger}66`, flexShrink: 0 }}>
            <Box component="img" src={ASSET_PATHS.icons.eventEncounter} alt="" sx={{ width: 24, height: 24 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: colors.danger, letterSpacing: '0.08em', fontFamily: 'var(--font-heading)', fontSize: '0.65rem' }}>
              ENCOUNTER
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem' }}>
              {title}
            </Typography>
          </Box>
        </Box>

        {/* body */}
        <Box sx={{ px: 2.5, pb: 2 }}>
          {result ? (
            <Zoom in>
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ mb: 1.5 }}>
                  {result.success ? (
                    <SuccessIcon sx={{ fontSize: 48, color: colors.accent }} />
                  ) : (
                    <FailIcon sx={{ fontSize: 48, color: colors.danger }} />
                  )}
                </Box>
                <Typography variant="body1" sx={{ color: result.success ? colors.accent : colors.danger, mb: 2.5 }}>
                  {result.message}
                </Typography>
                <Button variant="contained" color="primary" onClick={onConfirmResult} sx={{ px: 4 }}>
                  确认
                </Button>
              </Box>
            </Zoom>
          ) : (
            <>
              <Typography variant="body2" sx={{ color: colors.text, lineHeight: 1.8, whiteSpace: 'pre-wrap', mb: 2 }}>
                {description}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {choices.map((c, i) => (
                  <Button
                    key={c.choiceId}
                    variant="outlined"
                    fullWidth
                    disabled={c.disabled}
                    onClick={() => onChoose(c.choiceId)}
                    sx={{
                      py: 1.25,
                      px: 2,
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      borderColor: c.disabled ? `${colors.muted}33` : colors.border,
                      opacity: c.disabled ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                      '&:hover': !c.disabled ? {
                        borderColor: colors.primary,
                        bgcolor: `${colors.primary}10`,
                        boxShadow: `0 0 16px ${colors.glow}`,
                        '& .choice-indicator': { bgcolor: colors.primary, color: '#0a0f1e' },
                      } : {},
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                      <Box
                        className="choice-indicator"
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          bgcolor: `${colors.border}`,
                          color: colors.text,
                          flexShrink: 0,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {i + 1}
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.82rem', color: colors.white, textAlign: 'left' }}>
                          {c.text}
                        </Typography>
                        <Typography sx={{ fontSize: '0.62rem', color: colors.muted, fontFamily: 'var(--font-mono)', mt: 0.25 }}>
                          {c.consequenceHint}
                        </Typography>
                        {c.disabled && c.disabledReason && (
                          <Typography sx={{ fontSize: '0.58rem', color: colors.danger, mt: 0.25 }}>
                            {c.disabledReason}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Button>
                ))}
              </Box>
            </>
          )}
        </Box>

        {/* bottom scan line */}
        <Box sx={{ height: 2, background: `repeating-linear-gradient(0deg, transparent, transparent 12px, ${colors.danger}18 12px, ${colors.danger}18 13px)` }} />
      </Box>
    </Box>
  );
}
