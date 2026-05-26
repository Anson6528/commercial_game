import { Box, Typography, Button, Stack, keyframes } from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Leaderboard as RankIcon,
  ExitToApp as ExitIcon,
} from '@mui/icons-material';
import colors from '../theme/colors';

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px ${colors.glow}; }
  50%      { box-shadow: 0 0 60px ${colors.glowStrong}; }
`;

interface Props {
  playerName: string;
  onStartGame: () => void;
  onShowLeaderboard?: () => void;
  onLogout: () => void;
}

export default function LobbyScreen({
  playerName,
  onStartGame,
  onShowLeaderboard,
  onLogout,
}: Props) {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(ellipse at 50% 30%, ${colors.bg.paper} 0%, ${colors.bg.deep} 80%)`,
        gap: 5,
      }}
    >
      {/* glowing orb background */}
      <Box
        sx={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.glowStrong} 0%, transparent 70%)`,
          animation: `${glow} 4s ease-in-out infinite`,
          pointerEvents: 'none',
        }}
      />

      <Typography
        variant="h3"
        sx={{ color: colors.white, animation: 'fadeIn 0.6s ease', position: 'relative', zIndex: 1 }}
      >
        星际货运垄断者
      </Typography>

      <Typography
        variant="body1"
        sx={{ color: colors.text, fontFamily: 'var(--font-mono)', animation: 'fadeIn 0.6s ease 0.2s both' }}
      >
        {playerName}，欢迎回来
      </Typography>

      <Stack spacing={2} sx={{ width: 300, position: 'relative', zIndex: 1, animation: 'fadeIn 0.6s ease 0.4s both' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<PlayIcon />}
          onClick={onStartGame}
          sx={{ py: 1.75, fontSize: '0.95rem' }}
        >
          开始游戏
        </Button>

        <Button
          variant="outlined"
          size="large"
          startIcon={<RankIcon />}
          onClick={onShowLeaderboard}
          sx={{ py: 1.75, fontSize: '0.85rem' }}
        >
          排行榜
        </Button>

        <Button
          variant="text"
          color="inherit"
          size="large"
          startIcon={<ExitIcon />}
          onClick={onLogout}
          sx={{ py: 1.5, fontSize: '0.8rem', color: colors.muted }}
        >
          退出
        </Button>
      </Stack>
    </Box>
  );
}
