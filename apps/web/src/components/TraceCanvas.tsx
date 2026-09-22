import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { getStroke } from 'perfect-freehand';
import { THRESHOLDS } from '@primi-segni/shared';
import { GLYPH_SIZE, glyphFor } from '../data/glyphs';
import {
  computeAccuracy,
  shouldShowGuideDots,
  isBlocked,
  decideFeedback,
} from '../rules/engine';

export interface TraceMetrics {
  accuracy: number;
  durationMs: number;
  stalls: number;
  hintsUsed: number;
  outOfBounds: number;
}

export interface TraceApi {
  finish: () => void;
}

interface Props {
  value: string;
  onComplete: (m: TraceMetrics) => void;
  onBlock: (m: TraceMetrics) => void;
  onFeedback?: (message: string) => void;
  /** riceve l'API imperativa (es. finish) quando il canvas è pronto */
  onReady?: (api: TraceApi) => void;
}

const CanvasEl = styled.canvas`
  width: min(80vw, 460px);
  height: min(80vw, 460px);
  background: #fff;
  border-radius: 28px;
  box-shadow: ${({ theme }) => theme.shadow};
  touch-action: none;
`;

type Point = [number, number];

export function TraceCanvas({ value, onComplete, onBlock, onFeedback, onReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // stato mutabile (ref) per non ridisegnare React ad ogni punto
  const strokesRef = useRef<Point[][]>([]);
  const drawingRef = useRef(false);
  const insideRef = useRef(0);
  const totalRef = useRef(0);
  const errorEventsRef = useRef(0);
  const wasInsideRef = useRef(true);
  const stallsRef = useRef(0);
  const stallActiveRef = useRef(false);
  const hintsUsedRef = useRef(0);
  const showDotsRef = useRef(false);
  const guideDotsRef = useRef<Point[]>([]);
  const startRef = useRef(0);
  const lastMoveRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const d = glyphFor(value) ?? '';
    const glyphPath = new Path2D(d);

    // elemento SVG nascosto per campionare i punti lungo il tracciato (puntini-guida)
    const svgNs = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNs, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.style.left = '-9999px';
    const pathEl = document.createElementNS(svgNs, 'path');
    pathEl.setAttribute('d', d);
    svg.appendChild(pathEl);
    document.body.appendChild(svg);

    const computeGuideDots = (): Point[] => {
      const dots: Point[] = [];
      try {
        const len = pathEl.getTotalLength();
        const n = 16;
        for (let i = 0; i < n; i++) {
          const p = pathEl.getPointAtLength((len * i) / (n - 1));
          dots.push([p.x, p.y]);
        }
      } catch {
        /* getPointAtLength non disponibile: nessun puntino */
      }
      return dots;
    };

    const startPoint = (): Point => {
      try {
        const p = pathEl.getPointAtLength(0);
        return [p.x, p.y];
      } catch {
        return [GLYPH_SIZE / 2, GLYPH_SIZE / 2];
      }
    };
    const start = startPoint();

    const draw = () => {
      ctx.clearRect(0, 0, GLYPH_SIZE, GLYPH_SIZE);

      // binario (banda di tolleranza)
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#ece3fb';
      ctx.lineWidth = THRESHOLDS.strokeTolerancePx;
      ctx.stroke(glyphPath);

      // linea centrale tratteggiata
      ctx.save();
      ctx.setLineDash([14, 26]);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#cbb6f2';
      ctx.stroke(glyphPath);
      ctx.restore();

      // marcatore di partenza
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(start[0], start[1], 26, 0, Math.PI * 2);
      ctx.fill();

      // puntini-guida (adattamento a regole)
      if (showDotsRef.current) {
        ctx.fillStyle = '#a78bfa';
        for (const [x, y] of guideDotsRef.current) {
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // inchiostro del bambino
      ctx.fillStyle = '#7c3aed';
      for (const stroke of strokesRef.current) {
        if (stroke.length === 0) continue;
        const outline = getStroke(stroke, {
          size: 30,
          thinning: 0.5,
          smoothing: 0.6,
          streamline: 0.5,
        }) as number[][];
        if (outline.length < 2) continue;
        const p = new Path2D();
        const first = outline[0]!;
        p.moveTo(first[0]!, first[1]!);
        for (let i = 1; i < outline.length; i++) {
          const pt = outline[i]!;
          p.lineTo(pt[0]!, pt[1]!);
        }
        p.closePath();
        ctx.fill(p);
      }
    };

    const toCanvas = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return [
        (e.clientX - rect.left) * (GLYPH_SIZE / rect.width),
        (e.clientY - rect.top) * (GLYPH_SIZE / rect.height),
      ];
    };

    const sample = (pt: Point) => {
      ctx.lineWidth = THRESHOLDS.strokeTolerancePx;
      const inside = ctx.isPointInStroke(glyphPath, pt[0], pt[1]);
      totalRef.current += 1;
      if (inside) insideRef.current += 1;
      if (!inside && wasInsideRef.current) errorEventsRef.current += 1;
      wasInsideRef.current = inside;

      // adattamento: mostra i puntini dopo N errori
      if (!showDotsRef.current && shouldShowGuideDots(errorEventsRef.current)) {
        showDotsRef.current = true;
        hintsUsedRef.current += 1;
        guideDotsRef.current = computeGuideDots();
        onFeedback?.('Ti aiuto io con i puntini!');
      }
    };

    const onDown = (e: PointerEvent) => {
      if (doneRef.current) return;
      drawingRef.current = true;
      stallActiveRef.current = false;
      lastMoveRef.current = performance.now();
      const pt = toCanvas(e);
      strokesRef.current.push([pt]);
      sample(pt);
      canvas.setPointerCapture(e.pointerId);
      draw();
    };
    const onMove = (e: PointerEvent) => {
      if (!drawingRef.current || doneRef.current) return;
      lastMoveRef.current = performance.now();
      stallActiveRef.current = false;
      const pt = toCanvas(e);
      strokesRef.current.at(-1)?.push(pt);
      sample(pt);
      draw();
    };
    const onUp = () => {
      drawingRef.current = false;
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    startRef.current = performance.now();
    lastMoveRef.current = performance.now();

    // timer: stallo / blocco
    const timer = window.setInterval(() => {
      if (doneRef.current) return;
      const now = performance.now();
      const elapsed = now - startRef.current;
      const sinceMove = now - lastMoveRef.current;
      const accuracy = computeAccuracy(insideRef.current, totalRef.current);

      const fb = decideFeedback({
        accuracy,
        errorEvents: errorEventsRef.current,
        msSinceLastMove: sinceMove,
      });
      if (!drawingRef.current && fb.errorKind === 'stall' && !stallActiveRef.current) {
        stallsRef.current += 1;
        stallActiveRef.current = true;
        onFeedback?.(fb.message);
      }

      // blocco: fermo e in difficoltà oltre soglia → riposo
      if (isBlocked(elapsed, false) && accuracy < THRESHOLDS.accuracyPass) {
        doneRef.current = true;
        window.clearInterval(timer);
        onBlock(metrics());
      }
    }, 500);

    const metrics = (): TraceMetrics => ({
      accuracy: computeAccuracy(insideRef.current, totalRef.current),
      durationMs: Math.round(performance.now() - startRef.current),
      stalls: stallsRef.current,
      hintsUsed: hintsUsedRef.current,
      outOfBounds: errorEventsRef.current,
    });

    // espone la "fine" al parent (bottone "Ho finito")
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      window.clearInterval(timer);
      onComplete(metrics());
    };
    onReady?.({ finish });

    draw();

    return () => {
      window.clearInterval(timer);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      svg.remove();
    };
  }, [value, onBlock, onComplete, onFeedback, onReady]);

  return <CanvasEl ref={canvasRef} width={GLYPH_SIZE} height={GLYPH_SIZE} />;
}
