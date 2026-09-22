---
description: Avvia in parallelo backend (Fastify) e frontend (PWA) in background
---

Avvia l'ambiente di sviluppo di Primi Segni.

1. Assicurati che le dipendenze siano installate (`node_modules` presente); se no, esegui `npm install`.
2. Avvia `npm run dev` (usa Node 24: se serve, `nvm use` prima) **in background** — parte sia `apps/api` sia `apps/web`.
3. Riporta gli URL: web (Vite, di norma http://localhost:5173) e api (Fastify, di norma http://localhost:3000).

Non bloccare la sessione in foreground sul processo dev.
