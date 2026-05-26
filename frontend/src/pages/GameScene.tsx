import { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';

import TopHUD from '../hud/TopHUD';
import type { TopHUDProps } from '../hud/TopHUD';
import RightCargoPanel from '../hud/RightCargoPanel';
import type { RightCargoPanelProps } from '../hud/RightCargoPanel';
import BottomInfoBar from '../hud/BottomInfoBar';
import type { BottomInfoBarProps } from '../hud/BottomInfoBar';
import StarMap from '../canvas/StarMap';
import { WorldEventToastContainer } from '../fx/WorldEventToast';

/* ---- layer components ---- */
interface GameSceneLayout {
  /** PixiJS canvas mount point — FE-Core provides a ref here */
  canvasRef: React.RefObject<HTMLDivElement | null>;
  /** FE-Core passes ready-made TopHUD props */
  topHUD: TopHUDProps;
  /** FE-Core passes right cargo data */
  rightCargo: RightCargoPanelProps;
  /** FE-Core passes bottom info data */
  bottomInfo: BottomInfoBarProps;
  /** active modal rendered by FE-Core (e.g. TradeModal, EncounterModal) */
  modalSlot?: ReactNode;
  /** whether the game is processing an action (locks UI) */
  isProcessing?: boolean;
}

export default function GameScene({
  canvasRef,
  topHUD,
  rightCargo,
  bottomInfo,
  modalSlot,
  isProcessing = false,
}: GameSceneLayout) {
  const [regionView, setRegionView] = useState(false);

  const toggleRegionView = useCallback(() => {
    setRegionView((v) => !v);
  }, []);

  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* ---- Layer 0: Star Map ---- */}
      <Box
        ref={canvasRef}
        sx={{
          position: 'absolute',
          top: 'var(--hud-top-height)',
          right: 'var(--hud-right-width)',
          bottom: 'var(--hud-bottom-height)',
          left: 0,
          zIndex: 0,
          transition: 'filter 0.3s ease',
          ...(isProcessing ? { filter: 'brightness(0.7)' } : {}),
        }}
      >
        <StarMap />
      </Box>

      {/* ---- Layer 1: DOM HUD ---- */}
      <TopHUD {...topHUD} disabled={isProcessing} />
      <RightCargoPanel {...rightCargo} />
      <BottomInfoBar
        {...bottomInfo}
        onToggleRegionView={toggleRegionView}
        regionViewActive={regionView}
      />

      {/* ---- Layer 2: Modals (rendered by FE-Core) ---- */}
      {modalSlot}

      {/* ---- Layer 3: Toasts & Loading ---- */}
      <WorldEventToastContainer />

      {/* isProcessing overlay (blocks clicks but not visuals) */}
      {isProcessing && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 15,
            pointerEvents: 'auto',
          }}
        />
      )}
    </Box>
  );
}
