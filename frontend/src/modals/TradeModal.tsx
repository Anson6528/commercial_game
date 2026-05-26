import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  ShoppingCart as TradeIcon,
} from '@mui/icons-material';
import colors from '../theme/colors';
import PriceTrendChart from '../fx/PriceTrendChart';
import { goodsSrc, ASSET_PATHS } from '../theme/assets';

/* ---- types ---- */
export interface GoodsCard {
  goodsId: number;
  goodsName: string;
  currentPrice: number;
  previousPrice?: number;
  stock: number;
  isContraband: boolean;
  isLocked: boolean;
  lockReason?: string;
}

export interface CargoSlotItem {
  goodsId: number;
  goodsName: string;
  quantity: number;
  avgCost?: number;
  isContraband?: boolean;
}

export interface AdjacentPrice {
  stationName: string;
  price: number;
}

export interface TradeModalProps {
  open: boolean;
  stationName: string;
  stationGoods: GoodsCard[];
  cargoItems: CargoSlotItem[];
  isLoading: boolean;
  onSelectGoods: (goods: GoodsCard) => void;
  onClose: () => void;
}

export default function TradeModal({
  open,
  stationName,
  stationGoods,
  cargoItems,
  isLoading,
  onSelectGoods,
  onClose,
}: TradeModalProps) {
  const [closing, setClosing] = useState(false);

  function handleClose() {
    if (closing) return; // prevent double-click
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 280);
  }

  if (!open && !closing) return null;

  return (
    <Box
      onClick={handleClose}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 19,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        animation: `fadeIn 0.3s ease ${closing ? 'reverse' : 'both'}`,
      }}
    >
      {/* modal */}
      <Box
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: 660,
          maxWidth: '92vw',
          height: 480,
          maxHeight: '82vh',
          bgcolor: 'rgba(16,20,35,0.98)',
          borderRadius: 1,
          border: `1px solid ${colors.borderHover}`,
          boxShadow: `0 0 40px ${colors.glow}, 0 8px 64px rgba(0,0,0,0.6)`,
          display: 'flex',
          flexDirection: 'column',
          animation: closing
            ? 'slideDown 0.28s ease forwards'
            : 'slideUp 0.28s ease forwards',
        }}
      >
        {/* ---- header ---- */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <Typography variant="subtitle1" sx={{ flex: 1, fontFamily: 'var(--font-heading)', fontSize: '0.9rem' }}>
            {stationName} · 商品市场
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: colors.muted }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* ---- body ---- */}
        {isLoading ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative', width: 56, height: 56 }}>
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  border: `2px solid ${colors.primary}`,
                  animation: 'spin 2s linear infinite',
                  '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } },
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 10,
                  border: `2px solid ${colors.accent}`,
                  animation: 'spin 1.5s linear infinite reverse',
                  '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } },
                }}
              />
            </Box>
            <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: colors.text, animation: 'pulse 2s ease-in-out infinite' }}>
              正在连接贸易网络...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* ---- left: station market ---- */}
            <Box sx={{ flex: 3, overflow: 'auto', p: 1.5, borderRight: `1px solid ${colors.border}` }}>
              <Typography variant="caption" sx={{ color: colors.muted, mb: 1.5, display: 'block', letterSpacing: '0.05em' }}>
                本站商品 ({stationGoods.length})
              </Typography>
              {stationGoods.length === 0 ? (
                <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: colors.muted, textAlign: 'center', py: 4 }}>
                  {'\u{1F4E6}'} 无可用商品
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {stationGoods.map((goods) => (
                    <Box
                      key={goods.goodsId}
                      onClick={() => !goods.isLocked && onSelectGoods(goods)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        p: 1.25,
                        borderRadius: 1,
                        border: `1px solid ${colors.border}`,
                        bgcolor: goods.isLocked ? 'rgba(255,255,255,0.01)' : 'rgba(0,212,255,0.02)',
                        cursor: goods.isLocked ? 'not-allowed' : 'pointer',
                        opacity: goods.isLocked ? 0.45 : 1,
                        filter: goods.isLocked ? 'grayscale(0.6)' : 'none',
                        transition: 'all var(--transition-fast)',
                        position: 'relative',
                        '&:hover': !goods.isLocked ? {
                          borderColor: colors.primary,
                          bgcolor: 'rgba(0,212,255,0.05)',
                        } : {},
                      }}
                    >
                      {/* icon */}
                      <Box
                        component="img"
                        src={goodsSrc(goods.goodsId)}
                        alt={goods.goodsName}
                        sx={{ width: 28, height: 28, flexShrink: 0, opacity: goods.isLocked ? 0.45 : 1 }}
                      />

                      {/* info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.white }} noWrap>
                            {goods.goodsName}
                          </Typography>
                          {goods.isContraband && (
                            <Box component="img" src={ASSET_PATHS.icons.contrabandWarning} alt="" sx={{ width: 14, height: 14, flexShrink: 0 }} />
                          )}
                          {goods.isLocked && (
                            <Box component="img" src={ASSET_PATHS.icons.contrabandLocked} alt="" sx={{ width: 14, height: 14 }} />
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: colors.muted }}>
                            库存: {goods.stock}
                          </Typography>
                          {goods.isLocked && goods.lockReason && (
                            <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: colors.danger }}>
                              {goods.lockReason}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* price */}
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        {goods.previousPrice && goods.previousPrice !== goods.currentPrice && (
                          <Typography
                            sx={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.6rem',
                              color: colors.muted,
                              textDecoration: 'line-through',
                            }}
                          >
                            {goods.previousPrice.toLocaleString()}
                          </Typography>
                        )}
                        <Typography
                          sx={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: goods.previousPrice && goods.currentPrice > goods.previousPrice
                              ? colors.danger
                              : goods.previousPrice && goods.currentPrice < goods.previousPrice
                              ? colors.accent
                              : colors.primary,
                          }}
                        >
                          {goods.currentPrice.toLocaleString()} CR
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* ---- right: cargo ---- */}
            <Box sx={{ flex: 2, overflow: 'auto', p: 1.5 }}>
              <Typography variant="caption" sx={{ color: colors.muted, mb: 1.5, display: 'block', letterSpacing: '0.05em' }}>
                飞船货舱 ({cargoItems.length})
              </Typography>
              {cargoItems.length === 0 ? (
                <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: colors.muted, textAlign: 'center', py: 4 }}>
                  {'\u{1F4E6}'} 货舱为空
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {cargoItems.map((item) => (
                    <Box
                      key={item.goodsId}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: 'rgba(5,255,161,0.03)',
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <Box
                        component="img"
                        src={goodsSrc(item.goodsId)}
                        alt={item.goodsName}
                        sx={{ width: 24, height: 24, flexShrink: 0 }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.72rem', color: colors.white }} noWrap>
                          {item.goodsName}
                        </Typography>
                        <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: colors.primary }}>
                          ×{item.quantity}
                          {item.avgCost && ` @ ${item.avgCost.toLocaleString()}`}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}


/* ---- MiniTradePanel (GA-25) ---- */

export interface MiniTradePanelProps {
  goodsId: number;
  goodsName: string;
  currentPrice: number;
  previousPrice?: number;
  stock: number;
  isContraband: boolean;
  cargoQuantity: number;
  maxBuy: number;
  maxSell: number;
  priceHistory?: number[];
  adjacentPrices?: AdjacentPrice[];
  isSubmitting?: boolean;
  onExecute: (quantity: number, type: 'buy' | 'sell') => void;
  onClose: () => void;
}

export function MiniTradePanel({
  goodsId,
  goodsName,
  currentPrice,
  previousPrice,
  stock,
  isContraband,
  cargoQuantity,
  maxBuy,
  maxSell,
  adjacentPrices,
  isSubmitting,
  priceHistory,
  onExecute,
  onClose,
}: MiniTradePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  const maxQty = tradeType === 'buy' ? maxBuy : maxSell;
  const total = currentPrice * quantity;
  const safeQty = Math.max(1, Math.min(quantity, maxQty));

  return (
    <Box
      className="modal-panel"
      onClick={(e) => e.stopPropagation()}
      sx={{
        width: 340,
        maxWidth: '90vw',
        maxHeight: '85vh',
        overflow: 'auto',
        zIndex: 22,
        bgcolor: 'rgba(16,20,35,0.99)',
        borderRadius: 1,
        border: `1px solid ${colors.primary}44`,
        boxShadow: `0 0 32px ${colors.glowStrong}`,
        p: 2.5,
        animation: 'modalFadeIn 0.2s ease both',
        '@keyframes modalFadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
      }}
    >
      {/* header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="img" src={goodsSrc(goodsId)} alt="" sx={{ width: 28, height: 28 }} />
          <Typography variant="h6" sx={{ fontFamily: 'var(--font-heading)' }}>
            {goodsName}
          </Typography>
          {isContraband && (
            <Box component="img" src={ASSET_PATHS.icons.contrabandWarning} alt="" sx={{ width: 16, height: 16 }} />
          )}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: colors.muted }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* price info */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography variant="caption" sx={{ color: colors.muted }}>当前价格</Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
            {previousPrice && previousPrice !== currentPrice && (
              <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: colors.muted, textDecoration: 'line-through' }}>
                {previousPrice.toLocaleString()}
              </Typography>
            )}
            <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 700, color: colors.primary }}>
              {currentPrice.toLocaleString()} CR
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="caption" sx={{ color: colors.muted }}>库存</Typography>
          <Typography variant="caption" sx={{ fontFamily: 'var(--font-mono)', color: colors.text }}>
            {stock} 单位
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: colors.muted }}>已持有</Typography>
          <Typography variant="caption" sx={{ fontFamily: 'var(--font-mono)', color: colors.text }}>
            {cargoQuantity} 单位
          </Typography>
        </Box>
      </Box>

      {/* price trend chart (NX-06) */}
      {priceHistory && priceHistory.length > 1 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: colors.muted, mb: 0.5, display: 'block' }}>
            价格趋势
          </Typography>
          <PriceTrendChart data={priceHistory} />
        </Box>
      )}

      {/* adjacent prices */}
      {adjacentPrices && adjacentPrices.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: colors.muted, mb: 0.5, display: 'block' }}>
            相邻站点价格
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {adjacentPrices.map((ap) => (
              <Box
                key={ap.stationName}
                sx={{
                  flex: 1,
                  px: 1,
                  py: 0.5,
                  borderRadius: 0.5,
                  border: `1px solid ${colors.border}`,
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontSize: '0.55rem', color: colors.muted }} noWrap>{ap.stationName}</Typography>
                <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: ap.price > currentPrice ? colors.accent : colors.danger }}>
                  {ap.price.toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* trade type toggle */}
      <ToggleButtonGroup
        value={tradeType}
        exclusive
        size="small"
        fullWidth
        onChange={(_, v) => { if (v) { setTradeType(v); setQuantity(1); } }}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="buy" sx={{ flex: 1, fontSize: '0.75rem' }}>买入</ToggleButton>
        <ToggleButton value="sell" sx={{ flex: 1, fontSize: '0.75rem' }}>卖出</ToggleButton>
      </ToggleButtonGroup>

      {/* quantity */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Button size="small" variant="outlined" onClick={() => setQuantity((q) => Math.max(1, q - 1))} sx={{ minWidth: 32, px: 1 }}>-</Button>
        <Box
          component="input"
          type="number"
          value={safeQty}
          min={1}
          max={maxQty}
          onChange={(e) => setQuantity(Math.max(1, Math.min(Number(e.target.value) || 1, maxQty)))}
          sx={{
            flex: 1,
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '1rem',
            fontWeight: 600,
            color: colors.white,
            bgcolor: 'transparent',
            border: `1px solid ${colors.border}`,
            borderRadius: 1,
            py: 0.5,
            outline: 'none',
            '&:focus': { borderColor: colors.primary },
            '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': { display: 'none' },
          }}
        />
        <Button size="small" variant="outlined" onClick={() => setQuantity((q) => Math.min(q + 1, maxQty))} sx={{ minWidth: 32, px: 1 }}>+</Button>
        <Typography variant="caption" sx={{ color: colors.muted, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', ml: 0.5 }}>
          max {maxQty}
        </Typography>
      </Box>

      {/* total */}
      <Box
        sx={{
          mb: 2,
          p: 1.5,
          borderRadius: 1,
          bgcolor: tradeType === 'buy' ? 'rgba(5,255,161,0.04)' : 'rgba(255,42,109,0.04)',
          border: `1px solid ${tradeType === 'buy' ? 'rgba(5,255,161,0.15)' : 'rgba(255,42,109,0.15)'}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        }}
      >
        <Typography variant="caption" sx={{ color: colors.muted }}>
          {tradeType === 'buy' ? '预计支出' : '预计收入'}
        </Typography>
        <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: tradeType === 'buy' ? colors.danger : colors.accent }}>
          {tradeType === 'buy' ? '-' : '+'}{total.toLocaleString()} CR
        </Typography>
      </Box>

      {/* execute */}
      <Button
        variant="contained"
        color={tradeType === 'buy' ? 'primary' : 'secondary'}
        fullWidth
        disabled={isSubmitting || maxQty < 1}
        onClick={() => onExecute(safeQty, tradeType)}
        startIcon={<TradeIcon />}
        sx={{ py: 1.25 }}
      >
        {isSubmitting ? '处理中...' : `${tradeType === 'buy' ? '买入' : '卖出'} ${goodsName}`}
      </Button>
    </Box>
  );
}
