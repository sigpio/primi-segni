---
description: Scaffolda un nuovo esercizio (tipo + valore) — es. /newexercise trace-letter B
argument-hint: <tipo> <valore>
---

Scaffolda un nuovo esercizio in Primi Segni. Argomenti: `$ARGUMENTS` (primo = tipo, secondo = valore).

Tipi validi: `trace-letter`, `trace-number`, `bee`, `weather` (vedi `ExerciseType` in `packages/shared`).

Passi:
1. Aggiungi la definizione dell'esercizio al seed / catalogo esercizi in `apps/api`.
2. Per `trace-letter`/`trace-number`: assicurati che il carattere sia incluso nella generazione dei glifi (`letters.json`) di `apps/web`; se manca, aggiungilo alla lista dei caratteri e rigenera.
3. Per `bee`/`weather`: crea la tessera placeholder (non giocabile) se non esiste.
4. Non introdurre LLM/ML: eventuale logica adattiva usa le soglie di `packages/shared`.
5. Mostra il diff e ricorda di ripopolare con `npm run seed`.
