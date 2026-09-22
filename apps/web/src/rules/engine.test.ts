import { describe, it, expect } from 'vitest';
import { THRESHOLDS } from '@primi-segni/shared';
import {
  computeAccuracy,
  isPass,
  shouldShowGuideDots,
  isStall,
  isBlocked,
  classifyError,
  decideFeedback,
} from './engine';

describe('computeAccuracy', () => {
  it('è 0 senza campioni', () => expect(computeAccuracy(0, 0)).toBe(0));
  it('rapporto dentro/totale', () => expect(computeAccuracy(8, 10)).toBeCloseTo(0.8));
});

describe('isPass', () => {
  it('passa alla soglia', () => expect(isPass(THRESHOLDS.accuracyPass)).toBe(true));
  it('non passa sotto soglia', () => expect(isPass(THRESHOLDS.accuracyPass - 0.01)).toBe(false));
});

describe('shouldShowGuideDots', () => {
  it('sotto la soglia di errori: no', () =>
    expect(shouldShowGuideDots(THRESHOLDS.guideDotsAfterErrors - 1)).toBe(false));
  it('alla soglia: sì', () =>
    expect(shouldShowGuideDots(THRESHOLDS.guideDotsAfterErrors)).toBe(true));
});

describe('stallo e blocco', () => {
  it('stallo oltre soglia', () => {
    expect(isStall(THRESHOLDS.stallSeconds * 1000 - 1)).toBe(false);
    expect(isStall(THRESHOLDS.stallSeconds * 1000)).toBe(true);
  });
  it('blocco solo se non completato e oltre soglia', () => {
    expect(isBlocked(THRESHOLDS.blockSeconds * 1000, true)).toBe(false);
    expect(isBlocked(THRESHOLDS.blockSeconds * 1000, false)).toBe(true);
    expect(isBlocked(THRESHOLDS.blockSeconds * 1000 - 1, false)).toBe(false);
  });
});

describe('classifyError', () => {
  it('stallo ha priorità', () =>
    expect(classifyError({ accuracy: 0.99, msSinceLastMove: THRESHOLDS.stallSeconds * 1000 })).toBe(
      'stall',
    ));
  it('fuori dai bordi se accuratezza bassa', () =>
    expect(classifyError({ accuracy: 0.5, msSinceLastMove: 0 })).toBe('out-of-bounds'));
  it('nessun errore se preciso e attivo', () =>
    expect(classifyError({ accuracy: 0.95, msSinceLastMove: 0 })).toBeNull());
});

describe('decideFeedback', () => {
  it('mostra i puntini alla soglia di errori e dà un messaggio mirato', () => {
    const d = decideFeedback({
      accuracy: 0.5,
      errorEvents: THRESHOLDS.guideDotsAfterErrors,
      msSinceLastMove: 0,
    });
    expect(d.showGuideDots).toBe(true);
    expect(d.errorKind).toBe('out-of-bounds');
    expect(d.message).toMatch(/linea/i);
  });
});
