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
  canvasRef: React.RefObject<HTMLDivElement | null>;
  topHUD: TopHUDProps;
  rightCargo: RightCargoPanelProps;
  bottomInfo: BottomInfoBarProps;
  modalSlot?: ReactNode;
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
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0e1a' }}>
      {/* ---- Layer 0: Star Map (fullscreen) ---- */}
      <Box
        ref={canvasRef}
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          transition: 'filter 0.4s ease',
          ...(isProcessing ? { filter: 'brightness(0.6) blur(2px)' } : {}),
        }}
      >
        <StarMap />
      </Box>

      {/* ---- Layer 1: DOM HUD Overlays ---- */}
      <TopHUD {...topHUD} disabled={isProcessing} />
      <RightCargoPanel {...rightCargo} />
      <BottomInfoBar
        {...bottomInfo}
        onToggleRegionView={toggleRegionView}
        regionViewActive={regionView}
      />

      {/* ---- Layer 2: Modals ---- */}
      {modalSlot}

      {/* ---- Layer 3: Toasts & Loading ---- */}
      <WorldEventToastContainer />

      {/* isProcessing overlay */}
      {isProcessing && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 15,
            pointerEvents: 'auto',
            bgcolor: 'rgba(0,0,0,0.15)',
          }}
        />
      )}
    </Box>
  );
}
