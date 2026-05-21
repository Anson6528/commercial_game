import { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Alert,
} from '@mui/material';
import { submitTrade } from '../api/tradeApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateCredits, updateCargo } from '../store';

export default function TradeForm() {
  const dispatch = useAppDispatch();
  const player = useAppSelector((s) => s.player);
  const market = useAppSelector((s) => s.market);

  const [commodityId, setCommodityId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [error, setError] = useState<string | null>(null);

  const planetPrices = player.currentPlanetId
    ? market.prices[player.currentPlanetId] || []
    : [];

  async function handleTrade() {
    if (!player.id || !player.currentPlanetId) {
      setError('Player or planet not loaded');
      return;
    }
    if (!commodityId || !quantity) {
      setError('Please enter commodity ID and quantity');
      return;
    }

    try {
      setError(null);
      const result = await submitTrade({
        playerId: player.id,
        planetId: player.currentPlanetId,
        commodityId: Number(commodityId),
        quantity: Number(quantity),
        tradeType,
      });
      dispatch(updateCredits(result.newCredits));
      dispatch(updateCargo(result.newCargo));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Trade failed');
      }
    }
  }

  return (
    <Paper sx={{ p: 2, width: 320 }}>
      <Typography variant="h6" gutterBottom>
        Trade
      </Typography>

      <ToggleButtonGroup
        color="primary"
        value={tradeType}
        exclusive
        onChange={(_, v) => v && setTradeType(v)}
        fullWidth
        sx={{ mb: 2 }}
      >
        <ToggleButton value="buy">Buy</ToggleButton>
        <ToggleButton value="sell">Sell</ToggleButton>
      </ToggleButtonGroup>

      <TextField
        label="Commodity ID"
        type="number"
        value={commodityId}
        onChange={(e) => setCommodityId(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label="Quantity"
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      {planetPrices.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" gutterBottom component="div">
            Current Market:
          </Typography>
          {planetPrices.map((p) => (
            <Typography key={p.commodityId} variant="caption" component="div">
              {p.commodityName} — Buy: {p.buyPrice} / Sell: {p.sellPrice} (Stock: {p.stock})
            </Typography>
          ))}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button variant="contained" fullWidth onClick={handleTrade}>
        {tradeType === 'buy' ? 'Buy' : 'Sell'}
      </Button>
    </Paper>
  );
}
