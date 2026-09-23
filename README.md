# Primi Segni

PWA per l'apprendimento in autonomia di alunni **NAI (Neo Arrivati in Italia) di prima elementare**: ricalco di lettere e numeri con il dito, interfaccia **audio-first** e a icone, con **report per la maestra** a supporto del PDP.

Il nome richiama sia i *primi segni* grafici (i tratti di lettere e numeri) sia i *primi passi* di un bambino in un nuovo Paese e in una nuova lingua.

Progetto sviluppato durante un hackathon (tema: **Educazione Digitale Inclusiva**).

> L'app **non integra LLM né ML**: i comportamenti adattivi (feedback mirato sugli errori, rilevamento del blocco, puntini-guida) sono **logica deterministica a regole**, con le soglie in `packages/shared`.

## Documentazione

- [Concept di prodotto](doc/concept.md) — profilo utente, scenario, metrica di miglioramento, capability, flussi, scope MVP e piano demo.
- [Presentazione del progetto](doc/presentazione/index.html) — deck navigabile (obiettivo, problema, soluzione, demo con screenshot reali, evoluzioni). Apri il file in un browser: frecce ← → per navigare, **N** per le note del relatore. Gli screenshot sono in [`doc/presentazione/screens/`](doc/presentazione/screens/).

## Architettura

Monorepo **npm workspaces** (Node 24, TypeScript ESM):

```
primi-segni/
├── packages/shared   # tipi + soglie condivisi (il "contratto" web↔api)
├── apps/api          # Fastify + node:sqlite (SSO finto, assegnazioni, report, seed)
└── apps/web          # PWA React 19 + Vite + styled-components
```

- **Frontend**: React 19, Vite, styled-components, `vite-plugin-pwa`. Ricalco con Pointer Events + `isPointInStroke` (metrica "dentro i bordi") + `perfect-freehand` (inchiostro); audio consegne con Web Speech API (it-IT), effetti con Web Audio; fuochi con `canvas-confetti`.
- **Backend**: Fastify + `node:sqlite` (SQLite integrato in Node 24, nessuna build nativa). In produzione **serve anche la PWA** (same-origin), API sotto `/api`.
- **Rule engine** deterministico in `apps/web/src/rules/` (test con Vitest).

## Prerequisiti

- **Node 24** (vedi `.nvmrc`). Con nvm: `nvm use`.

## Avvio in locale

```bash
npm install
npm run dev
```

- Web (Vite): http://localhost:5173 — con proxy `/api` → API.
- API (Fastify): http://localhost:3000.

Il primo avvio dell'API popola automaticamente il DB demo se vuoto. Per **ripopolare** i dati (classe, 6 bambini, tentativi storici con trend, un blocco):

```bash
npm run seed
```

### Percorsi principali della PWA

- `/` — scelta ruolo (bambino / maestra)
- `/bambino` — griglia avatar → `/bambino/:id` (saluto + esercizio del giorno) → `/bambino/:id/esercizio` (ricalco)
- `/maestra/login` (email demo: `giulia@scuola.it`) → `/maestra` (dashboard con report e assegnazioni)

### API (Fastify, prefisso `/api`)

| Metodo & path | Effetto |
| --- | --- |
| `POST /api/auth/sso` | Login finto maestra (valida l'email, ritorna token + maestra) |
| `GET /api/exercises` | Catalogo esercizi |
| `GET /api/classes/:id/children` | Bambini di una classe (griglia avatar) |
| `GET /api/children?classId=…` | Elenco bambini con report (dashboard maestra) |
| `GET /api/children/:id/report` | Report di un singolo bambino |
| `GET /api/children/:id/today` | Esercizio assegnato "di oggi" (individuale, poi di classe) |
| `POST /api/assignments` | Assegna un esercizio a un bambino o all'intera classe |
| `POST /api/attempts` | Registra un tentativo (metriche); se `blocked`, logga anche un evento di riposo |

Dati (SQLite `node:sqlite`): tabelle `classes`, `teachers`, `children`, `exercises`, `assignments`, `attempts`, `rest_events`. Il DB è un file locale non versionato (`apps/api/data/primi-segni.db`), rigenerabile con `npm run seed`; il seed parte in automatico al primo avvio se il DB è vuoto.

## Script

| Comando | Effetto |
| --- | --- |
| `npm run dev` | Avvia API + web insieme |
| `npm run build` | Build di produzione della PWA |
| `npm run seed` | Ripopola il DB demo |
| `npm run typecheck` | TypeScript su tutti i workspace |
| `npm test` | Unit test (rule engine) |
| `npm run verify` | typecheck + test + build |
| `npm run start --workspace apps/api` | Avvia il servizio unico (API + PWA buildata) |

## Build di produzione in locale (same-origin)

```bash
npm run build
npm run start --workspace apps/api   # http://localhost:3000 serve PWA + /api
```

## Deploy (Render)

Rilascio come **servizio unico** (Fastify serve PWA + API), auto-deploy da GitHub, HTTPS — configurato in [`render.yaml`](render.yaml).

1. Su [render.com](https://render.com), accedi con GitHub.
2. **New +** → **Blueprint** → seleziona il repo `sigpio/primi-segni` → **Apply**.
3. A fine deploy apri l'URL HTTPS (es. `https://primi-segni.onrender.com`) — installabile come PWA dal cellulare ("Aggiungi a schermata Home").

Ogni push su `main` rilascia in automatico. Nota: sul free tier il servizio va in *sleep* dopo inattività (primo caricamento più lento).

## CI/CD

- **CI** — GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)): `typecheck + test + build` su push e PR.
- **CD** — Render, auto-deploy su `main`.

## Ambiente di sviluppo agentico (Claude Code)

Il repo include un setup Claude Code: [`CLAUDE.md`](CLAUDE.md), permessi + hook di formattazione in `.claude/settings.json`, slash command in `.claude/commands/` (`/dev`, `/seed`, `/verify`, `/newexercise`, `/review` e la pipeline `/feature`) e i subagenti in `.claude/agents/` (`planner`, `builder`, `pwa-verifier`, `reviewer`).
