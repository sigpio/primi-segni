import { db, initSchema, resetSchema, newId, DB_PATH } from './db.js';
import { EXERCISES } from './catalog.js';

function daysAgo(n: number, hour = 15, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

initSchema();
resetSchema();

// --- Classe + maestra ---
const classId = 'class-1a';
db.prepare('INSERT INTO classes (id, name) VALUES (?, ?)').run(classId, '1ª A');

const teacherId = 'teacher-1';
db.prepare('INSERT INTO teachers (id, name, email, classId) VALUES (?, ?, ?, ?)').run(
  teacherId,
  'Maestra Giulia',
  'giulia@scuola.it',
  classId,
);

// --- Esercizi ---
const insExercise = db.prepare(
  'INSERT INTO exercises (id, type, value, subject, label, icon, playable) VALUES (?, ?, ?, ?, ?, ?, ?)',
);
for (const e of EXERCISES) {
  insExercise.run(e.id, e.type, e.value, e.subject, e.label, e.icon, e.playable ? 1 : 0);
}

// --- Bambini ---
const children = [
  { id: 'child-amir', name: 'Amir', avatar: '🦊' },
  { id: 'child-lin', name: 'Lin', avatar: '🐼' },
  { id: 'child-fatima', name: 'Fatima', avatar: '🐰' },
  { id: 'child-andrei', name: 'Andrei', avatar: '🦁' },
  { id: 'child-sofia', name: 'Sofia', avatar: '🐧' },
  { id: 'child-youssef', name: 'Youssef', avatar: '🐨' },
];
const insChild = db.prepare('INSERT INTO children (id, name, classId, avatar) VALUES (?, ?, ?, ?)');
for (const c of children) insChild.run(c.id, c.name, classId, c.avatar);

// --- Assegnazione "di oggi" per tutta la classe: la lettera A ---
db.prepare(
  'INSERT INTO assignments (id, childId, classId, exerciseId, assignedBy, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
).run(newId(), null, classId, 'letter-A', teacherId, daysAgo(0, 8));

// --- Tentativi storici ---
const insAttempt = db.prepare(
  `INSERT INTO attempts (id, childId, exerciseId, accuracy, durationMs, stalls, hintsUsed, outOfBounds, completed, blocked, createdAt)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
);
const insRest = db.prepare(
  'INSERT INTO rest_events (id, childId, exerciseId, createdAt) VALUES (?, ?, ?, ?)',
);

type Att = {
  child: string;
  ex: string;
  acc: number;
  dur: number;
  stalls: number;
  hints: number;
  oob: number;
  completed?: boolean;
  blocked?: boolean;
  day: number;
};

function attempt(a: Att): void {
  insAttempt.run(
    newId(),
    a.child,
    a.ex,
    a.acc,
    a.dur,
    a.stalls,
    a.hints,
    a.oob,
    a.completed === false ? 0 : 1,
    a.blocked ? 1 : 0,
    daysAgo(a.day, 15, (a.day * 7) % 59),
  );
}

// Amir — la "storia hero": migliora nettamente ricalcando la A giorno dopo giorno.
const amirAcc = [0.45, 0.52, 0.6, 0.68, 0.74, 0.82, 0.88, 0.93];
amirAcc.forEach((acc, i) => {
  const day = amirAcc.length - i; // dal più vecchio al più recente
  attempt({
    child: 'child-amir',
    ex: 'letter-A',
    acc,
    dur: Math.round(90000 - i * 8000),
    stalls: Math.max(0, 3 - Math.floor(i / 2)),
    hints: Math.max(0, 5 - i),
    oob: Math.max(0, 12 - i * 2),
    day,
  });
});
// e un paio sul numero 1
attempt({ child: 'child-amir', ex: 'number-1', acc: 0.8, dur: 40000, stalls: 0, hints: 1, oob: 3, day: 2 });
attempt({ child: 'child-amir', ex: 'number-1', acc: 0.9, dur: 32000, stalls: 0, hints: 0, oob: 1, day: 1 });

// Fatima — fatica: accuratezza bassa e un blocco (cerotto + alert).
[0.5, 0.48, 0.55, 0.52].forEach((acc, i) => {
  attempt({
    child: 'child-fatima',
    ex: 'letter-A',
    acc,
    dur: 110000,
    stalls: 4,
    hints: 6,
    oob: 18,
    day: 5 - i,
  });
});
// tentativo bloccato oggi + rest event
attempt({
  child: 'child-fatima',
  ex: 'letter-A',
  acc: 0.42,
  dur: 92000,
  stalls: 6,
  hints: 6,
  oob: 22,
  completed: false,
  blocked: true,
  day: 0,
});
insRest.run(newId(), 'child-fatima', 'letter-A', daysAgo(0, 15, 30));

// Lin — buona, poche prove.
attempt({ child: 'child-lin', ex: 'letter-A', acc: 0.78, dur: 60000, stalls: 1, hints: 2, oob: 6, day: 3 });
attempt({ child: 'child-lin', ex: 'letter-A', acc: 0.86, dur: 52000, stalls: 0, hints: 1, oob: 3, day: 1 });

// Andrei — nella media.
attempt({ child: 'child-andrei', ex: 'number-1', acc: 0.66, dur: 70000, stalls: 2, hints: 3, oob: 9, day: 2 });
attempt({ child: 'child-andrei', ex: 'letter-A', acc: 0.72, dur: 64000, stalls: 1, hints: 2, oob: 7, day: 1 });

// Sofia — solo una prova, ottima.
attempt({ child: 'child-sofia', ex: 'letter-A', acc: 0.9, dur: 45000, stalls: 0, hints: 0, oob: 2, day: 1 });

// Youssef — nessun tentativo ancora (bambino "nuovo").

const counts = {
  classi: (db.prepare('SELECT COUNT(*) AS n FROM classes').get() as { n: number }).n,
  bambini: (db.prepare('SELECT COUNT(*) AS n FROM children').get() as { n: number }).n,
  esercizi: (db.prepare('SELECT COUNT(*) AS n FROM exercises').get() as { n: number }).n,
  tentativi: (db.prepare('SELECT COUNT(*) AS n FROM attempts').get() as { n: number }).n,
  blocchi: (db.prepare('SELECT COUNT(*) AS n FROM rest_events').get() as { n: number }).n,
};

console.log('✅ Seed completato:', DB_PATH);
console.table(counts);
