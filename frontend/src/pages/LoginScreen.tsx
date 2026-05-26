import { useState } from 'react';
import { Box, Typography, TextField, Button, keyframes } from '@mui/material';
import colors from '../theme/colors';

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
`;

/* pre-generated static particles (module level to avoid impure render) */
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
              animation: `${float} ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </Box>

      <Typography
        variant="h2"
        sx={{
          color: colors.white,
          textAlign: 'center',
          animation: 'fadeIn 0.8s ease',
        }}
      >
        星际货运垄断者
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: 380,
          maxWidth: '90vw',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 3,
          borderRadius: 1,
          bgcolor: 'rgba(16,20,35,0.9)',
          border: `1px solid ${colors.border}`,
          boxShadow: `0 0 32px ${colors.glow}`,
          animation: 'fadeIn 0.8s ease 0.3s both',
        }}
      >
        <Typography variant="body2" sx={{ color: colors.text, textAlign: 'center' }}>
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
              style: { fontFamily: 'var(--font-mono)', textAlign: 'center', fontSize: '1.1rem' },
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={!name.trim()}
          sx={{ py: 1.5, fontSize: '0.9rem' }}
        >
          进入游戏
        </Button>
      </Box>

      <Typography variant="caption" sx={{ color: colors.muted, fontFamily: 'var(--font-mono)' }}>
        openGauss 课程大作业 · 2026
      </Typography>
    </Box>
  );
}
