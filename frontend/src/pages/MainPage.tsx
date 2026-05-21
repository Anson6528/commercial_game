import { Box, Stack } from '@mui/material';
import StarMap from '../canvas/StarMap';
import PlayerPanel from '../components/PlayerPanel';
import TradeForm from '../components/TradeForm';
import EventModal from '../components/EventModal';
import TransactionLog from '../components/TransactionLog';

export default function MainPage() {
  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#0d1117', color: '#e0e0e0' }}>
      {/* Left panel */}
      <Stack spacing={2} sx={{ p: 2, width: 360, overflowY: 'auto' }}>
        <PlayerPanel />
        <TradeForm />
        <TransactionLog />
      </Stack>

      {/* Center map */}
      <Box sx={{ flex: 1, p: 2 }}>
        <StarMap />
      </Box>

      <EventModal />
    </Box>
  );
}
