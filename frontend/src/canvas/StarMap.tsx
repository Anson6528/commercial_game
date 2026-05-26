import { useRef, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectPlanet } from '../store';
import { ASSET_PATHS } from '../theme/assets';

const STATION_SIZE = 32;
const LINE_WIDTH = 1;

/* ---- preload station images ---- */
const stationImages: Map<number, HTMLImageElement> = new Map();
const stationSources: Record<number, string> = {
  0: ASSET_PATHS.stations.normal,
  1: ASSET_PATHS.stations.hub,
  2: ASSET_PATHS.stations.danger,
};

function getStationImg(planetId: number): HTMLImageElement | null {
  if (!stationImages.has(planetId)) {
    const img = new Image();
    // distribute: small id → normal, medium → hub, large → danger
    const type = planetId % 7 <= 2 ? 0 : planetId % 7 <= 4 ? 1 : 2;
    img.src = stationSources[type];
    stationImages.set(planetId, img);
  }
  const img = stationImages.get(planetId)!;
  return img.complete ? img : null;
}

export default function StarMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useAppDispatch();
  const { planets, connections, selectedPlanetId } = useAppSelector((s) => s.starMap);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = LINE_WIDTH;
    connections.forEach((conn) => {
      const from = planets.find((p) => p.id === conn.from);
      const to = planets.find((p) => p.id === conn.to);
      if (!from || !to) return;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    });

    // Draw planets with station PNG
    planets.forEach((p) => {
      const isSelected = p.id === selectedPlanetId;
      const img = getStationImg(p.id);

      if (img) {
        const half = STATION_SIZE / 2;
        // glow ring for selected
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, half + 6, 0, Math.PI * 2);
          ctx.strokeStyle = '#00d4ff66';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.drawImage(img, p.x - half, p.y - half, STATION_SIZE, STATION_SIZE);
      } else {
        // fallback: simple circle while image loads
        ctx.beginPath();
        ctx.arc(p.x, p.y, isSelected ? 12 : 8, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#66bb6a' : '#42a5f5';
        ctx.fill();
      }

      // Label
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, p.x, p.y + STATION_SIZE / 2 + 14);
    });
  }, [planets, connections, selectedPlanetId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    draw();

    // redraw when images finish loading
    const checkImages = setInterval(() => {
      const allLoaded = planets.every((p) => {
        const img = stationImages.get(p.id);
        return img && img.complete;
      });
      if (allLoaded) {
        draw();
        clearInterval(checkImages);
      }
    }, 200);
    return () => clearInterval(checkImages);
  }, [draw, planets]);

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const p of planets) {
      const dx = x - p.x;
      const dy = y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) <= STATION_SIZE / 2 + 6) {
        dispatch(selectPlanet(p.id));
        return;
      }
    }
    dispatch(selectPlanet(null));
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        background: 'transparent',
        borderRadius: 8,
        cursor: 'pointer',
      }}
      onClick={handleClick}
    />
  );
}
