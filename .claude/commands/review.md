---
description: Rivedi il diff (o un target) col revisore project-aware di Primi Segni
argument-hint: [target opzionale: PR #, branch o path]
---

Delega la review al subagent `reviewer` (Agent tool, subagent_type: `reviewer`).

Target: `$ARGUMENTS` se indicato, altrimenti il diff non committato.

Il revisore conosce i vincoli di Primi Segni (niente LLM/ML, soglie in `packages/shared`, audio-first, contratto tipi condiviso, caveat styled-components v6) e le best-practice React 19. Riporta i suoi finding così come tornano, ordinati per severità. Non applicare fix in automatico: aspetta conferma su quali sistemare.
