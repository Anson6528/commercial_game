import { Paper, Typography, Box, Chip, LinearProgress } from '@mui/material';
import { useAppSelector } from '../store/hooks';

export default function PlayerPanel() {
  const player = useAppSelector((s) => s.player);

  if (!player.id) return null;

  return (
    <Paper sx={{ p: 2, width: 280 }}>
      <Typography variant="h6" gutterBottom>
        {player.name}
      </Typography>
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2">Credits: {player.credits.toLocaleString()}</Typography>
        <LinearProgress
          variant="determinate"
          value={Math.min(player.credits / 10000, 100)}
          sx={{ mt: 0.5 }}
        />
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" gutterBottom>
          Cargo Hold:
        </Typography>
        {player.cargo.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            Empty
          </Typography>
        ) : (
          player.cargo.map((item) => (
            <Chip
              key={item.commodityId}
              label={`${item.commodityName} x${item.quantity}`}
              size="small"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))
        )}
      </Box>
      <Box>
        <Typography variant="body2">
          Wanted Level: {player.wantedLevel}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={player.wantedLevel * 10}
          color={player.wantedLevel > 5 ? 'error' : 'primary'}
          sx={{ mt: 0.5 }}
        />
      </Box>
    </Paper>
  );
}
