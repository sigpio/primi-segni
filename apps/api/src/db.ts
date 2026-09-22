import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '..', 'data');
mkdirSync(dataDir, { recursive: true });

export const DB_PATH = join(dataDir, 'primi-segni.db');
export const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

export function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      classId TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS children (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      classId TEXT NOT NULL,
      avatar TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      value TEXT NOT NULL,
      subject TEXT NOT NULL,
      label TEXT NOT NULL,
      icon TEXT NOT NULL,
      playable INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      childId TEXT,
      classId TEXT,
      exerciseId TEXT NOT NULL,
      assignedBy TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      childId TEXT NOT NULL,
      exerciseId TEXT NOT NULL,
      accuracy REAL NOT NULL,
      durationMs INTEGER NOT NULL,
      stalls INTEGER NOT NULL,
      hintsUsed INTEGER NOT NULL,
      outOfBounds INTEGER NOT NULL,
      completed INTEGER NOT NULL,
      blocked INTEGER NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS rest_events (
      id TEXT PRIMARY KEY,
      childId TEXT NOT NULL,
      exerciseId TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
}

/** Svuota tutte le tabelle (usato dal seed). */
export function resetSchema(): void {
  db.exec(`
    DELETE FROM rest_events;
    DELETE FROM attempts;
    DELETE FROM assignments;
    DELETE FROM children;
    DELETE FROM teachers;
    DELETE FROM exercises;
    DELETE FROM classes;
  `);
}

export const newId = (): string => crypto.randomUUID();
