/**
 * Contratto condiviso tra web e api di Primi Segni.
 * Tipi + costanti (soglie). NESSUNA logica LLM/ML: le soglie qui alimentano
 * il rule engine deterministico del frontend e la validazione del backend.
 */

export type ID = string;

/** italiano | matematica (STEM) */
export type Subject = 'italiano' | 'matematica';

export type ExerciseType = 'trace-letter' | 'trace-number' | 'bee' | 'weather';

export interface Exercise {
  id: ID;
  type: ExerciseType;
  /** per trace-*: carattere target, es. "A" o "3"; per bee/weather: '' */
  value: string;
  subject: Subject;
  /** etichetta leggibile e leggibile-ad-alta-voce */
  label: string;
  /** emoji/nome icona per la UI a icone */
  icon: string;
  /** false = placeholder non giocabile (ape, diario) */
  playable: boolean;
}

export interface ClassRoom {
  id: ID;
  name: string;
}

export interface Teacher {
  id: ID;
  name: string;
  email: string;
  classId: ID;
}

export interface Child {
  id: ID;
  name: string;
  classId: ID;
  /** emoji/asset dell'avatar scelto in fase di login */
  avatar: string;
}

export interface Assignment {
  id: ID;
  /** assegnazione al singolo bambino ... */
  childId: ID | null;
  /** ... oppure a tutta la classe */
  classId: ID | null;
  exerciseId: ID;
  assignedBy: ID;
  createdAt: string;
}

/** Metriche di un singolo tentativo — la base della metrica "hero" (autonomia + errori). */
export interface AttemptMetrics {
  /** frazione 0..1 di punti del tratto rimasti dentro i bordi */
  accuracy: number;
  durationMs: number;
  /** quante volte è scattato lo stato di stallo */
  stalls: number;
  /** quanti aiuti/puntini-guida usati (meno = più autonomia) */
  hintsUsed: number;
  /** conteggio errori "fuori dai bordi" */
  outOfBounds: number;
}

export interface Attempt extends AttemptMetrics {
  id: ID;
  childId: ID;
  exerciseId: ID;
  completed: boolean;
  /** true se chiuso per blocco/riposo forzato */
  blocked: boolean;
  createdAt: string;
}

export interface TrendPoint {
  date: string;
  accuracy: number;
  stalls: number;
  hintsUsed: number;
}

export interface Report {
  child: Child;
  /** esercizio più ripetuto */
  favoriteExerciseId: ID | null;
  /** cerotto: difficoltà a superare gli esercizi */
  needsHelp: boolean;
  /** icona alert: è scattato almeno un blocco/riposo */
  blockAlert: boolean;
  attempts: number;
  latestAccuracy: number | null;
  trend: TrendPoint[];
}

export interface RestEvent {
  id: ID;
  childId: ID;
  exerciseId: ID;
  createdAt: string;
}

/** Tipo di errore riconosciuto dal rule engine (classificazione a regole, due categorie). */
export type ErrorKind = 'out-of-bounds' | 'stall';

/**
 * Soglie del rule engine. Uniche e condivise: NON duplicare nei componenti.
 */
export const THRESHOLDS = {
  /** accuratezza minima (frazione dentro i bordi) per considerare il tratto "pulito" */
  accuracyPass: 0.8,
  /** larghezza della banda di tolleranza attorno al glifo, in px a risoluzione base (canvas 1000x1000) */
  strokeTolerancePx: 90,
  /** numero di errori "fuori bordo" prima di mostrare i puntini-guida */
  guideDotsAfterErrors: 3,
  /** secondi senza movimento utile prima di segnare uno "stallo" */
  stallSeconds: 20,
  /** secondi totali di frustrazione/stallo prima del riposo forzato (blocco) */
  blockSeconds: 90,
} as const;

/** Dimensione logica del canvas di ricalco (coordinate dei glifi). */
export const TRACE_CANVAS_SIZE = 1000;

export type Thresholds = typeof THRESHOLDS;
