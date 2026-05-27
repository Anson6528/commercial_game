import { useRef, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectPlanet } from '../store';
import { ASSET_PATHS } from '../theme/assets';

const STATION_SIZE = 64;
const LINE_WIDTH = 1;

/* ---- starfield particles ---- */
interface StarParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

function generateParticles(count: number, w: number, h: number): StarParticle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.5 + 0.2,
    speed: Math.random() * 0.2 + 0.05,
  }));
}

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
    const type = planetId % 7 <= 2 ? 0 : planetId % 7 <= 4 ? 1 : 2;
    img.src = stationSources[type];
    stationImages.set(planetId, img);
  }
  const img = stationImages.get(planetId)!;
  return img.complete ? img : null;
}

/* ---- draw different station shapes ---- */
function drawStationShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: number,
  isSelected: boolean,
  color: string
) {
  const half = size / 2;

  ctx.save();
  ctx.translate(x, y);

  // Selection glow ring
  if (isSelected) {
    ctx.beginPath();
    ctx.arc(0, 0, half + 10, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rotating dashed radar ring
    const time = Date.now() / 2000;
    ctx.beginPath();
    ctx.arc(0, 0, half + 18, time, time + Math.PI * 1.5);
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Shape outline based on station type
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.fillStyle = 'rgba(10, 14, 26, 0.7)';

  switch (type) {
    case 0: // Trade port: hexagon
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = Math.cos(angle) * half;
        const py = Math.sin(angle) * half;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 1: // Hub: chamfered square
      ctx.beginPath();
      ctx.moveTo(-half + 8, -half);
      ctx.lineTo(half - 8, -half);
      ctx.lineTo(half, -half + 8);
      ctx.lineTo(half, half - 8);
      ctx.lineTo(half - 8, half);
      ctx.lineTo(-half + 8, half);
      ctx.lineTo(-half, half - 8);
      ctx.lineTo(-half, -half + 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 2: // Danger: shield
      ctx.beginPath();
      ctx.moveTo(0, -half);
      ctx.bezierCurveTo(half, -half * 0.5, half, half * 0.3, 0, half);
      ctx.bezierCurveTo(-half, half * 0.3, -half, -half * 0.5, 0, -half);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    default: // Circle
      ctx.beginPath();
      ctx.arc(0, 0, half - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
  }

  // Inner glow dot
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
}

export default function StarMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<StarParticle[]>([]);
  const animFrameRef = useRef<number>(0);
  const dispatch = useAppDispatch();
  const { planets, connections, selectedPlanetId } = useAppSelector((s) => s.starMap);

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Deep space gradient
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h));
    grad.addColorStop(0, '#0d1117');
    grad.addColorStop(1, '#0a0e1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Draw star particles
    const particles = particlesRef.current;
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${p.opacity})`;
      ctx.fill();
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    drawBackground(ctx, w, h);

    // Draw connections (dashed cyan)
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.25)';
    ctx.lineWidth = LINE_WIDTH;
    ctx.setLineDash([6, 4]);
    connections.forEach((conn) => {
      const from = planets.find((p) => p.id === conn.from);
      const to = planets.find((p) => p.id === conn.to);
      if (!from || !to) return;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Draw planets
    planets.forEach((p) => {
      const isSelected = p.id === selectedPlanetId;
      const type = p.id % 7 <= 2 ? 0 : p.id % 7 <= 4 ? 1 : 2;
      const color = type === 0
        ? 'rgba(0, 212, 255, 0.8)'
        : type === 1
        ? 'rgba(5, 255, 161, 0.8)'
        : 'rgba(255, 43, 109, 0.8)';

      // Draw shape
      drawStationShape(ctx, p.x, p.y, STATION_SIZE, type, isSelected, color);

      // Try to draw image inside shape
      const img = getStationImg(p.id);
      if (img) {
        const innerSize = STATION_SIZE * 0.5;
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.drawImage(img, p.x - innerSize / 2, p.y - innerSize / 2, innerSize, innerSize);
        ctx.restore();
      }

      // Label
      ctx.fillStyle = '#e0e6ed';
      ctx.font = 'bold 12px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(p.name, p.x, p.y + STATION_SIZE / 2 + 18);
      ctx.shadowBlur = 0;
    });
  }, [planets, connections, selectedPlanetId, drawBackground]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      // Regenerate particles on resize
      particlesRef.current = generateParticles(120, rect.width, rect.height);
    }

    resize();
    window.addEventListener('resize', resize);

    // Animation loop
    function animate() {
      // Update particle positions
      const rect = canvas.getBoundingClientRect();
      for (const p of particlesRef.current) {
        p.y += p.speed;
        if (p.y > rect.height) {
          p.y = 0;
          p.x = Math.random() * rect.width;
        }
      }
      draw();
      animFrameRef.current = requestAnimationFrame(animate);
    }
    animFrameRef.current = requestAnimationFrame(animate);

    // redraw when images finish loading
    const checkImages = setInterval(() => {
      const allLoaded = planets.every((p) => {
        const img = stationImages.get(p.id);
        return img && img.complete;
      });
      if (allLoaded) {
        clearInterval(checkImages);
      }
    }, 200);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(checkImages);
    };
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
        cursor: 'pointer',
        display: 'block',
      }}
      onClick={handleClick}
    />
  );
}
