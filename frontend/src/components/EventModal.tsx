import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { submitEventChoice } from '../api/eventApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearActiveEvent, addNotification } from '../store';

export default function EventModal() {
  const dispatch = useAppDispatch();
  const event = useAppSelector((s) => s.event.activeEvent);
  const player = useAppSelector((s) => s.player);

  async function handleChoice(choiceId: number) {
    if (!player.id || !event) return;
    try {
      const result = await submitEventChoice({
        playerId: player.id,
        eventId: event.id,
        choiceId,
      });
      dispatch(
        addNotification({
          message: result.outcomeDescription,
          type: 'info',
        })
      );
    } catch {
      dispatch(
        addNotification({
          message: 'Event choice failed',
          type: 'warning',
        })
      );
    } finally {
      dispatch(clearActiveEvent());
    }
  }

  return (
    <Dialog open={!!event} onClose={() => dispatch(clearActiveEvent())}>
      <DialogTitle>{event?.title}</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {event?.description}
        </Typography>
      </DialogContent>
      <DialogActions>
        {event?.choices.map((c) => (
          <Button key={c.id} onClick={() => handleChoice(c.id)} color="primary" variant="contained">
            {c.label}
          </Button>
        ))}
        <Button onClick={() => dispatch(clearActiveEvent())}>Dismiss</Button>
      </DialogActions>
    </Dialog>
  );
}
