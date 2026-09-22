/**
 * Effetti sonori. Per evitare asset binari mancanti in fase di hackathon,
 * gli SFX sono sintetizzati con la Web Audio API (arpeggio di festa).
 * Howler resta disponibile tra le dipendenze per quando aggiungeremo file mp3.
 */

let ctx: AudioContext | null = null;

function audioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  return ctx;
}

/** Piccolo arpeggio allegro (per i fuochi d'artificio / esercizio completato). */
export function playCheer(): void {
  const a = audioCtx();
  if (!a) return;
  const now = a.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const t = now + i * 0.09;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    osc.connect(gain).connect(a.destination);
    osc.start(t);
    osc.stop(t + 0.45);
  });
}
