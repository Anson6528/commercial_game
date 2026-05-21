import { Paper, Typography, Box, Divider } from '@mui/material';
import { useAppSelector } from '../store/hooks';

export default function TransactionLog() {
  const notifications = useAppSelector((s) => s.event.notifications);

  return (
    <Paper sx={{ p: 2, width: 300, maxHeight: 400, overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Log
      </Typography>
      {notifications.length === 0 ? (
        <Typography variant="caption" color="text.secondary">
          No recent events
        </Typography>
      ) : (
        notifications
          .slice()
          .reverse()
          .map((n) => (
            <Box key={n.id} sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {new Date(n.timestamp).toLocaleTimeString()}
              </Typography>
              <Typography variant="body2" color={
                n.type === 'danger' ? 'error' : n.type === 'warning' ? 'warning.main' : 'text.primary'
              }>
                {n.message}
              </Typography>
              <Divider sx={{ mt: 0.5 }} />
            </Box>
          ))
      )}
    </Paper>
  );
}
