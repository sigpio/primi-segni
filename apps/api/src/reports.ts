import { THRESHOLDS, type Attempt, type Child, type Report, type TrendPoint } from '@primi-segni/shared';
import { db } from './db.js';

interface ChildRow {
  id: string;
  name: string;
  classId: string;
  avatar: string;
}

interface AttemptRow {
  id: string;
  childId: string;
  exerciseId: string;
  accuracy: number;
  durationMs: number;
  stalls: number;
  hintsUsed: number;
  outOfBounds: number;
  completed: number;
  blocked: number;
  createdAt: string;
}

function toChild(row: ChildRow): Child {
  return { id: row.id, name: row.name, classId: row.classId, avatar: row.avatar };
}

function toAttempt(row: AttemptRow): Attempt {
  return {
    id: row.id,
    childId: row.childId,
    exerciseId: row.exerciseId,
    accuracy: row.accuracy,
    durationMs: row.durationMs,
    stalls: row.stalls,
    hintsUsed: row.hintsUsed,
    outOfBounds: row.outOfBounds,
    completed: !!row.completed,
    blocked: !!row.blocked,
    createdAt: row.createdAt,
  };
}

export function getChild(childId: string): Child | null {
  const row = db.prepare('SELECT * FROM children WHERE id = ?').get(childId) as ChildRow | undefined;
  return row ? toChild(row) : null;
}

/** Esercizio più ripetuto dal bambino. */
function favoriteExercise(attempts: Attempt[]): string | null {
  const counts = new Map<string, number>();
  for (const a of attempts) counts.set(a.exerciseId, (counts.get(a.exerciseId) ?? 0) + 1);
  let best: string | null = null;
  let bestN = 0;
  for (const [ex, n] of counts) {
    if (n > bestN) {
      best = ex;
      bestN = n;
    }
  }
  return best;
}

/** Trend giornaliero: media accuratezza, stalli e aiuti per giorno. */
function buildTrend(attempts: Attempt[]): TrendPoint[] {
  const byDay = new Map<string, Attempt[]>();
  for (const a of attempts) {
    const day = a.createdAt.slice(0, 10);
    const list = byDay.get(day) ?? [];
    list.push(a);
    byDay.set(day, list);
  }
  const avg = (nums: number[]) => (nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0);
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, list]) => ({
      date,
      accuracy: Number(avg(list.map((a) => a.accuracy)).toFixed(3)),
      stalls: Number(avg(list.map((a) => a.stalls)).toFixed(2)),
      hintsUsed: Number(avg(list.map((a) => a.hintsUsed)).toFixed(2)),
    }));
}

/**
 * Costruisce il report di un bambino.
 * Regole deterministiche (nessun LLM/ML):
 *  - needsHelp (cerotto): media accuratezza degli ultimi 3 tentativi < soglia, oppure c'è stato un blocco.
 *  - blockAlert: esiste almeno un tentativo "blocked" o un rest_event.
 */
export function buildReport(childId: string): Report | null {
  const child = getChild(childId);
  if (!child) return null;

  const rows = db
    .prepare('SELECT * FROM attempts WHERE childId = ? ORDER BY createdAt ASC')
    .all(childId) as unknown as AttemptRow[];
  const attempts = rows.map(toAttempt);

  const restCount = (
    db.prepare('SELECT COUNT(*) AS n FROM rest_events WHERE childId = ?').get(childId) as { n: number }
  ).n;

  const last3 = attempts.slice(-3);
  const avgLast3 = last3.length
    ? last3.reduce((s, a) => s + a.accuracy, 0) / last3.length
    : 1;
  const hasBlocked = attempts.some((a) => a.blocked) || restCount > 0;
  const needsHelp = (last3.length >= 2 && avgLast3 < THRESHOLDS.accuracyPass) || hasBlocked;

  return {
    child,
    favoriteExerciseId: favoriteExercise(attempts),
    needsHelp,
    blockAlert: hasBlocked,
    attempts: attempts.length,
    latestAccuracy: attempts.length ? (attempts.at(-1)?.accuracy ?? null) : null,
    trend: buildTrend(attempts),
  };
}

export function listReports(classId: string): Report[] {
  const rows = db
    .prepare('SELECT id FROM children WHERE classId = ? ORDER BY name ASC')
    .all(classId) as { id: string }[];
  return rows
    .map((r) => buildReport(r.id))
    .filter((r): r is Report => r !== null);
}
