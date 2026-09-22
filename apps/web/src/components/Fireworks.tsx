import { useEffect } from 'react';
import confetti from 'canvas-confetti';

const COLORS = ['#7c3aed', '#f59e0b', '#22c55e', '#ef4444', '#3b82f6', '#ec4899'];

/** Fuochi d'artificio cartoon: parte quando `run` diventa true. */
export function Fireworks({ run }: { run: boolean }) {
  useEffect(() => {
    if (!run) return;
    const end = Date.now() + 1800;
    let raf = 0;
    const frame = () => {
      confetti({ particleCount: 6, angle: 60, spread: 75, origin: { x: 0, y: 0.9 }, colors: COLORS });
      confetti({ particleCount: 6, angle: 120, spread: 75, origin: { x: 1, y: 0.9 }, colors: COLORS });
      confetti({ particleCount: 10, spread: 110, startVelocity: 45, origin: { x: 0.5, y: 0.55 }, colors: COLORS });
      if (Date.now() < end) raf = requestAnimationFrame(frame);
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, [run]);
  return null;
}
