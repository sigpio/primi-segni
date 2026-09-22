# Primi Segni

PWA per l'apprendimento in autonomia di alunni **NAI di prima elementare**: ricalco di lettere/numeri col dito, interfaccia **audio-first** + icone, con **report per la maestra**.

Concept completo: @doc/concept.md

## Vincolo assoluto

**L'app NON integra LLM né ML.** I comportamenti adattivi (feedback mirato sugli errori, rilevamento del blocco, puntini-guida) sono **logica deterministica a regole**, con soglie in `packages/shared`. Nessun modello decide nulla a runtime.

## Stack

- Monorepo **npm workspaces**, **Node 24** (vedi `.nvmrc`), TypeScript ESM.
- `apps/web`: React 19 + Vite + styled-components v6 + vite-plugin-pwa. Input tattile via Pointer Events; glifi come path SVG; `perfect-freehand` per l'inchiostro; metrica "dentro i bordi" via `isPointInStroke`. Audio: Web Speech API (TTS it-IT) + Howler (SFX).
- `apps/api`: Fastify + SQLite (`better-sqlite3`), validazione `zod`, dev con `tsx`.
- `packages/shared`: tipi + costanti (soglie) condivisi web↔api.

## Comandi

- `npm run dev` — avvia api + web insieme.
- `npm run seed` — ripopola il DB demo (dati storici con trend).
- `npm run verify` — typecheck + test + build.
- Per workspace: `npm run <script> --workspace apps/web` (o `apps/api`, `packages/shared`).

> Node 24 non è il default di sistema (lo è la 20). Se un comando node/npm fallisce per versione, esegui prima `nvm use` (c'è `.nvmrc`).

## Convenzioni

- TypeScript **strict**, ESM ovunque, tipi condivisi da `@primi-segni/shared` (mai duplicare il "contratto").
- Le **soglie** (tolleranza bordi, stallo, blocco, N errori→puntini) vivono solo in `packages/shared` — non hardcodarle nei componenti.
- **A11y / audio-first:** ogni testo mostrato al bambino ha un equivalente audio; UI a icone, testo minimo; target touch grandi.
- styled-components v6: attenzione al caveat TS con React 19 su `.attrs()` — evitare quel pattern.

## Metodo di lavoro (agentic)

Explore → Plan → Implement → Verify. Plan mode sui pezzi ampi; `/clear` tra task scollegati; delega le esplorazioni rumorose ai subagenti. Rivedi sempre il diff prima del commit.
