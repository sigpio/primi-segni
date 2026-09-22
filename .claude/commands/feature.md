---
description: Pipeline agentica per una richiesta (nuovo esercizio/variazione): intake→plan→build→verify→review
argument-hint: <descrizione della richiesta>
---

Gestisci la richiesta `$ARGUMENTS` con la pipeline completa di Primi Segni. Segui il metodo Explore → Plan → Implement → Verify e mantieni il diff sempre revisionabile (l'ingegnere resta nel loop: mai committare senza che l'utente abbia visto il diff).

Fasi — non saltarne nessuna, e **fermati ai gate** dove indicato:

1. **Intake & Plan** — delega al subagent `planner` (Agent tool, `subagent_type: planner`) passandogli la richiesta. Riporta all'utente il suo verdetto di fattibilità e lo scope.
   - **GATE:** se il planner ha domande aperte o verdetto NON FATTIBILE, fermati e chiedi conferma/chiarimenti all'utente prima di procedere. Non implementare su assunzioni.

2. **Blueprint** — a scope approvato, delega al subagent `builder` (`subagent_type: builder`) per il piano tecnico (file, passi, test, scaffold da riusare). Mostra all'utente i passi ordinati.

3. **Implement** — implementa **nel thread principale** (non in un subagent), seguendo il blueprint a passi piccoli e verificabili. Parti dal contratto in `packages/shared`, poi api, poi web. Riusa `/newexercise` dove pertinente. Scrivi/aggiorna i test del rule engine quando la meccanica cambia. Rispetta i vincoli: niente LLM/ML, soglie solo in `packages/shared`, audio-first, no `.attrs()` (styled-components v6 + React 19).

4. **Verify** — delega al subagent `pwa-verifier` per typecheck + test + build (+ smoke se disponibile). Se rosso, correggi e ripeti.

5. **Review** — delega al subagent `reviewer` sul diff prodotto. Riporta i finding ordinati per severità. Correggi i **BLOCCANTI**, poi ri-verifica (torna al passo 4 se necessario).

Chiudi con: sintesi di cosa è stato fatto, criteri di "fatto" soddisfatti/no, e il promemoria di rivedere il diff (`git diff`) e ripopolare il seed (`npm run seed`) prima del commit. **Non committare** a meno che l'utente non lo chieda.
