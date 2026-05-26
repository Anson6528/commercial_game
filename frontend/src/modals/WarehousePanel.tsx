import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Inventory as WarehouseIcon, Download as WithdrawIcon } from '@mui/icons-material';
import { goodsSrc } from '../theme/assets';

/* ---- types ---- */
export interface WarehouseItem {
  goodsId: number;
  goodsName: string;
  quantity: number;
  stationName: string;
}

interface Props {
  items: WarehouseItem[];
  onWithdraw?: (goodsId: number, stationName: string) => void;
}

export default function WarehousePanel({ items, onWithdraw }: Props) {
  const [confirm, setConfirm] = useState<{ goodsId: number; goodsName: string; stationName: string } | null>(null);

  function handleConfirm() {
    if (!confirm) return;
    onWithdraw?.(confirm.goodsId, confirm.stationName);
    setConfirm(null);
  }

  return (
    <>
      <Paper sx={{ p: 2.5, width: 320 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          <WarehouseIcon sx={{ color: '#00d4aa' }} />
          <Typography variant="h6">Warehouse</Typography>
        </Box>

        {items.length === 0 ? (
          <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
            {'\u{1F4E6}'} No items stored
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {items.map((item) => (
              <Box
                key={`${item.goodsId}-${item.stationName}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.25,
                  borderRadius: 1,
                  bgcolor: 'rgba(0,212,170,0.04)',
                  border: '1px solid rgba(0,212,170,0.08)',
                }}
              >
                <Box
                  component="img"
                  src={goodsSrc(item.goodsId)}
                  alt={item.goodsName}
                  sx={{ width: 24, height: 24, flexShrink: 0 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap>
                    {item.goodsName}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={`×${item.quantity}`}
                      size="small"
                      sx={{ height: 18, fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}
                    />
                    <Typography variant="caption" color="text.disabled" noWrap>
                      {item.stationName}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<WithdrawIcon sx={{ fontSize: 16 }} />}
                  onClick={() =>
                    setConfirm({
                      goodsId: item.goodsId,
                      goodsName: item.goodsName,
                      stationName: item.stationName,
                    })
                  }
                  sx={{ flexShrink: 0, fontSize: '0.7rem', py: 0.25, minWidth: 0 }}
                >
                  Withdraw
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* ---- withdraw confirmation ---- */}
      <Dialog open={!!confirm} onClose={() => setConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Withdrawal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Transfer <strong>{confirm?.goodsName}</strong> from warehouse at{' '}
            <strong>{confirm?.stationName}</strong> to your ship cargo?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="contained" color="primary">
            Withdraw
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
