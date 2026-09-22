import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import type { Assignment, Child, Exercise, Teacher } from '@primi-segni/shared';
import { db, initSchema, newId } from './db.js';
import { buildReport, listReports } from './reports.js';

initSchema();

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

// ---------- helpers di mapping ----------
const toExercise = (r: Record<string, unknown>): Exercise => ({
  id: r.id as string,
  type: r.type as Exercise['type'],
  value: r.value as string,
  subject: r.subject as Exercise['subject'],
  label: r.label as string,
  icon: r.icon as string,
  playable: !!r.playable,
});

const toChild = (r: Record<string, unknown>): Child => ({
  id: r.id as string,
  name: r.name as string,
  classId: r.classId as string,
  avatar: r.avatar as string,
});

// ---------- auth SSO finto (maestra) ----------
app.post('/auth/sso', async (req, reply) => {
  const body = z.object({ email: z.string().email() }).safeParse(req.body);
  if (!body.success) return reply.code(400).send({ error: 'email non valida' });

  const teacher = db
    .prepare('SELECT * FROM teachers WHERE email = ?')
    .get(body.data.email) as Teacher | undefined;
  if (!teacher) return reply.code(404).send({ error: 'insegnante non trovato' });

  return { token: `fake-sso-${teacher.id}`, teacher };
});

// ---------- catalogo esercizi ----------
app.get('/exercises', async () => {
  const rows = db.prepare('SELECT * FROM exercises').all() as Record<string, unknown>[];
  return rows.map(toExercise);
});

// ---------- griglia avatar (login bambino) ----------
app.get('/classes/:id/children', async (req) => {
  const { id } = req.params as { id: string };
  const rows = db
    .prepare('SELECT * FROM children WHERE classId = ? ORDER BY name ASC')
    .all(id) as Record<string, unknown>[];
  return rows.map(toChild);
});

// ---------- elenco bambini con report (maestra) ----------
app.get('/children', async (req) => {
  const { classId } = req.query as { classId?: string };
  if (!classId) return [];
  return listReports(classId);
});

// ---------- report singolo ----------
app.get('/children/:id/report', async (req, reply) => {
  const { id } = req.params as { id: string };
  const report = buildReport(id);
  if (!report) return reply.code(404).send({ error: 'bambino non trovato' });
  return report;
});

// ---------- esercizio di oggi (assegnazione) ----------
app.get('/children/:id/today', async (req, reply) => {
  const { id } = req.params as { id: string };
  const child = db.prepare('SELECT * FROM children WHERE id = ?').get(id) as Child | undefined;
  if (!child) return reply.code(404).send({ error: 'bambino non trovato' });

  // preferenza: assegnazione al singolo bambino, poi assegnazione di classe; più recente
  const assignment = db
    .prepare(
      `SELECT * FROM assignments
       WHERE childId = ? OR classId = ?
       ORDER BY (childId = ?) DESC, createdAt DESC
       LIMIT 1`,
    )
    .get(id, child.classId, id) as Assignment | undefined;
  if (!assignment) return reply.code(404).send({ error: 'nessun esercizio assegnato' });

  const exRow = db
    .prepare('SELECT * FROM exercises WHERE id = ?')
    .get(assignment.exerciseId) as Record<string, unknown> | undefined;
  if (!exRow) return reply.code(404).send({ error: 'esercizio non trovato' });

  const teacher = db
    .prepare('SELECT * FROM teachers WHERE id = ?')
    .get(assignment.assignedBy) as Teacher | undefined;

  return { exercise: toExercise(exRow), assignedBy: teacher?.name ?? 'la maestra' };
});

// ---------- assegnazione esercizio ----------
app.post('/assignments', async (req, reply) => {
  const schema = z
    .object({
      childId: z.string().nullish(),
      classId: z.string().nullish(),
      exerciseId: z.string(),
      assignedBy: z.string(),
    })
    .refine((v) => v.childId || v.classId, { message: 'serve childId o classId' });
  const body = schema.safeParse(req.body);
  if (!body.success) return reply.code(400).send({ error: body.error.issues });

  const id = newId();
  const createdAt = new Date().toISOString();
  db.prepare(
    'INSERT INTO assignments (id, childId, classId, exerciseId, assignedBy, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(
    id,
    body.data.childId ?? null,
    body.data.classId ?? null,
    body.data.exerciseId,
    body.data.assignedBy,
    createdAt,
  );
  return reply.code(201).send({ id, createdAt });
});

// ---------- registra tentativo (sync risultati; richiede connessione) ----------
app.post('/attempts', async (req, reply) => {
  const schema = z.object({
    childId: z.string(),
    exerciseId: z.string(),
    accuracy: z.number().min(0).max(1),
    durationMs: z.number().int().nonnegative(),
    stalls: z.number().int().nonnegative(),
    hintsUsed: z.number().int().nonnegative(),
    outOfBounds: z.number().int().nonnegative(),
    completed: z.boolean(),
    blocked: z.boolean(),
  });
  const body = schema.safeParse(req.body);
  if (!body.success) return reply.code(400).send({ error: body.error.issues });

  const id = newId();
  const createdAt = new Date().toISOString();
  const a = body.data;
  db.prepare(
    `INSERT INTO attempts (id, childId, exerciseId, accuracy, durationMs, stalls, hintsUsed, outOfBounds, completed, blocked, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    a.childId,
    a.exerciseId,
    a.accuracy,
    a.durationMs,
    a.stalls,
    a.hintsUsed,
    a.outOfBounds,
    a.completed ? 1 : 0,
    a.blocked ? 1 : 0,
    createdAt,
  );

  if (a.blocked) {
    db.prepare(
      'INSERT INTO rest_events (id, childId, exerciseId, createdAt) VALUES (?, ?, ?, ?)',
    ).run(newId(), a.childId, a.exerciseId, createdAt);
  }

  return reply.code(201).send({ id, createdAt });
});

const PORT = Number(process.env.PORT ?? 3000);
app
  .listen({ port: PORT, host: '0.0.0.0' })
  .then(() => app.log.info(`API Primi Segni su http://localhost:${PORT}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
