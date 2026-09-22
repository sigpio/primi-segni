/**
 * Rule engine deterministico del ricalco. NESSUN LLM/ML.
 * Tutte le soglie vengono da @primi-segni/shared.
 */
import { THRESHOLDS, type ErrorKind } from '@primi-segni/shared';

export function computeAccuracy(inside: number, total: number): number {
  if (total <= 0) return 0;
  return inside / total;
}

export function isPass(accuracy: number): boolean {
  return accuracy >= THRESHOLDS.accuracyPass;
}

/** I puntini-guida compaiono dopo N "errori" (run contigui fuori dai bordi). */
export function shouldShowGuideDots(errorEvents: number): boolean {
  return errorEvents >= THRESHOLDS.guideDotsAfterErrors;
}

export function isStall(msSinceLastMove: number): boolean {
  return msSinceLastMove >= THRESHOLDS.stallSeconds * 1000;
}

export function isBlocked(elapsedMs: number, completed: boolean): boolean {
  return !completed && elapsedMs >= THRESHOLDS.blockSeconds * 1000;
}

/** Classifica l'errore corrente in due categorie (a regole). */
export function classifyError(opts: { accuracy: number; msSinceLastMove: number }): ErrorKind | null {
  if (isStall(opts.msSinceLastMove)) return 'stall';
  if (opts.accuracy < THRESHOLDS.accuracyPass) return 'out-of-bounds';
  return null;
}

export interface FeedbackDecision {
  errorKind: ErrorKind | null;
  showGuideDots: boolean;
  message: string;
}

/** Feedback mirato: messaggio + eventuali puntini-guida in base al tipo di errore. */
export function decideFeedback(input: {
  accuracy: number;
  errorEvents: number;
  msSinceLastMove: number;
}): FeedbackDecision {
  const errorKind = classifyError({
    accuracy: input.accuracy,
    msSinceLastMove: input.msSinceLastMove,
  });
  const showGuideDots = shouldShowGuideDots(input.errorEvents);
  let message: string;
  if (errorKind === 'stall') message = 'Prova a seguire la linea con il dito!';
  else if (errorKind === 'out-of-bounds') message = 'Resta sulla linea, ci sei quasi!';
  else message = 'Bravo, così!';
  return { errorKind, showGuideDots, message };
}
