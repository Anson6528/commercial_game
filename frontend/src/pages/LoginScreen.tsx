import { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import colors from '../theme/colors';

const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: `${((i * 37 + 13) % 100)}%`,
  top: `${((i * 53 + 7) % 100)}%`,
  size: 2 + (i % 2),
  opacity: 0.12 + (i % 5) * 0.04,
  duration: 3 + (i % 4),
  delay: (i % 3) * 0.8,
}));

interface Props {
  onEnter: (nickname: string) => void;
}

export default function LoginScreen({ onEnter }: Props) {
  const [name, setName] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim()) onEnter(name.trim());
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(ellipse at 50% 50%, ${colors.bg.paper} 0%, ${colors.bg.deep} 70%)`,
        gap: 4,
      }}
    >
      {/* ambient particles */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {PARTICLES.map((p) => (
          <Box
            key={p.id}
            sx={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              bgcolor: colors.primary,
              opacity: p.opacity,
              left: p.left,
              top: p.top,
              animation: `float ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </Box>

      <Typography
        sx={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2.5rem',
          color: colors.white,
          textAlign: 'center',
          animation: 'fadeIn 0.8s ease',
          textShadow: `0 0 24px ${colors.glowStrong}, 0 0 48px ${colors.glow}`,
          letterSpacing: '0.04em',
        }}
      >
        星际货运垄断者
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        className="glass-panel"
        sx={{
          width: 380,
          maxWidth: '90vw',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 3,
          borderRadius: '4px',
          animation: 'fadeIn 0.8s ease 0.3s both',
        }}
      >
        <Typography sx={{ fontSize: '0.85rem', color: colors.textSub, textAlign: 'center' }}>
          输入你的货运代号，进入星际市场
        </Typography>

        <TextField
          placeholder="货运代号"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          fullWidth
          slotProps={{
            htmlInput: {
              maxLength: 16,
              style: { fontFamily: 'var(--font-mono)', textAlign: 'center', fontSize: '1.1rem', color: colors.textMain },
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '2px',
              '& fieldset': { borderColor: colors.border },
              '&:hover fieldset': { borderColor: colors.borderHover },
              '&.Mui-focused fieldset': { borderColor: colors.primary },
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={!name.trim()}
          className="tech-button"
          sx={{
            py: 1.5,
            fontSize: '0.9rem',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '0.05em',
            clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
            background: 'linear-gradient(180deg, rgba(0,212,255,0.18) 0%, rgba(0,212,255,0.06) 100%)',
            border: `1px solid ${colors.borderHover}`,
            color: colors.white,
            '&:hover': { boxShadow: `0 0 20px ${colors.glowStrong}` },
            '&.Mui-disabled': { opacity: 0.35, color: colors.muted },
          }}
        >
          进入游戏
        </Button>
      </Box>

      <Typography sx={{ color: colors.muted, fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
        openGauss 课程大作业 · 2026
      </Typography>
    </Box>
  );
}
