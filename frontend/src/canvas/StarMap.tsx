import { useRef, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectPlanet } from '../store';

const PLANET_RADIUS = 8;
const LINE_WIDTH = 1;

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
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
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

    // Draw planets
    planets.forEach((p) => {
      const isSelected = p.id === selectedPlanetId;
      ctx.beginPath();
      ctx.arc(p.x, p.y, isSelected ? PLANET_RADIUS + 4 : PLANET_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#66bb6a' : '#42a5f5';
      ctx.fill();

      // Label
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, p.x, p.y + PLANET_RADIUS + 16);
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
  }, [draw]);

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const p of planets) {
      const dx = x - p.x;
      const dy = y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) <= PLANET_RADIUS + 6) {
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
        background: '#0d1117',
        borderRadius: 8,
        cursor: 'pointer',
      }}
      onClick={handleClick}
    />
  );
}
