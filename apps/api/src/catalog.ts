import type { Exercise } from '@primi-segni/shared';

/**
 * Catalogo esercizi. I caratteri dei ricalchi (value) devono essere inclusi
 * nella generazione dei glifi del frontend (vedi apps/web scripts/gen-glyphs).
 * Stampatello MAIUSCOLO: è ciò con cui si parte in prima elementare.
 */
export const EXERCISES: Exercise[] = [
  // Italiano — lettere da ricalcare
  { id: 'letter-A', type: 'trace-letter', value: 'A', subject: 'italiano', label: 'La lettera A', icon: '✏️', playable: true },
  { id: 'letter-E', type: 'trace-letter', value: 'E', subject: 'italiano', label: 'La lettera E', icon: '✏️', playable: true },
  { id: 'letter-I', type: 'trace-letter', value: 'I', subject: 'italiano', label: 'La lettera I', icon: '✏️', playable: true },
  { id: 'letter-O', type: 'trace-letter', value: 'O', subject: 'italiano', label: 'La lettera O', icon: '✏️', playable: true },
  { id: 'letter-M', type: 'trace-letter', value: 'M', subject: 'italiano', label: 'La lettera M', icon: '✏️', playable: true },

  // Matematica (STEM) — numeri da ricalcare
  { id: 'number-1', type: 'trace-number', value: '1', subject: 'matematica', label: 'Il numero 1', icon: '🔢', playable: true },
  { id: 'number-2', type: 'trace-number', value: '2', subject: 'matematica', label: 'Il numero 2', icon: '🔢', playable: true },
  { id: 'number-3', type: 'trace-number', value: '3', subject: 'matematica', label: 'Il numero 3', icon: '🔢', playable: true },

  // Placeholder non giocabili (V2)
  { id: 'bee', type: 'bee', value: '', subject: 'matematica', label: "Il gioco dell'ape", icon: '🐝', playable: false },
  { id: 'weather', type: 'weather', value: '', subject: 'italiano', label: 'Il diario del tempo', icon: '⛅', playable: false },
];

export const PLAYABLE_TRACE = EXERCISES.filter(
  (e) => e.playable && (e.type === 'trace-letter' || e.type === 'trace-number'),
);

/** Tutti i caratteri usati dai ricalchi (per la generazione glifi lato web). */
export const TRACE_CHARS = PLAYABLE_TRACE.map((e) => e.value);
