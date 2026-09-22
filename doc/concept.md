# Primi Segni — Concept

> **Primi Segni** — app di apprendimento per alunni NAI di prima elementare.
> Il nome richiama sia i *primi segni* grafici (tratti di lettere e numeri da ricalcare) sia i *primi passi* di un bambino in un nuovo Paese e in una nuova lingua.

> Documento di **concept/pianificazione di prodotto**. Le scelte architetturali/tecnologiche sono deliberatamente **rimandate allo step successivo**.

## Deliverable richiesti dall'hackathon

### 01 · Learner Profile Statement
Bambino/a **NAI (Neo Arrivato in Italia) di 6 anni, prima elementare**.
**Difficoltà:** non parla né legge ancora l'italiano (difficoltà linguistiche) e ha bassa/nulla alfabetizzazione; spesso non può contare su supporto a casa (genitori a loro volta NAI) né su materiali cartacei, ma ha accesso a uno smartphone.
**Scenario:** deve imparare a **tracciare lettere e numeri**, esercitandosi **in autonomia** sullo smartphone — a scuola e a casa — guidato da audio e icone, senza dipendere da un adulto.

### 02 · Adaptive Evidence
Esempio concreto (logica a regole, nessun LLM/ML):
> Marco ricalca la lettera **A**; il dito esce dai bordi **3 volte di fila** → scatta la soglia di errore e l'app **mostra i puntini-guida** lungo il tratto e **ripete la consegna audio**. Nel tentativo successivo la % di tratto dentro i bordi risale sopra soglia → i **puntini spariscono** e l'esercizio torna "pulito". Se invece Marco resta in **stallo oltre soglia**, l'app **rileva il blocco**, chiude con riposo + fuochi d'artificio ("per oggi abbiamo finito, yuppi!") e segnala **cerotto + alert** alla maestra.

La soluzione cambia quindi in base al **bisogno rilevato** (accuratezza sotto soglia → più supporto visivo/audio; accuratezza sopra soglia → supporto rimosso; frustrazione/stallo → chiusura protetta).

### 03 · Learning Outcome Note
**Prima:** il bambino non sa tracciare la lettera/numero e non riesce a restare entro i bordi senza aiuto.
**Dopo (al termine di un ciclo di sessioni):** sa tracciare autonomamente la lettera/numero **restando entro i bordi, senza puntini-guida e senza hint**.
**Come è verificato:** confronto oggettivo tra primo e ultimo tentativo sugli indicatori loggati — **% tratto dentro i bordi ↑**, **tempo e stalli ↓**, **numero di aiuti ↓** — mostrato come **trend nel report della maestra**. Nella demo lo dimostriamo con **dati storici finti + una sessione live**.

## Context

Hackathon (5 ore, 2 persone: Pio Stravino + Manuel Bisanti). Tema scelto: **Educazione Digitale Inclusiva** — usare l'agentic coding per abbassare le barriere all'apprendimento digitale per persone in situazione di svantaggio.

Target: **alunni NAI (Neo Arrivati in Italia) di prima elementare**. Non parlano ancora italiano, spesso non leggono in nessuna lingua, e frequentemente vivono in contesti economicamente fragili (genitori a loro volta NAI, che non possono supportarli con i compiti; materiali cartacei non sempre disponibili). Lo smartphone, però, ce l'hanno quasi tutti.

**Outcome atteso:** un bambino NAI può **esercitarsi in autonomia** (a scuola e a casa) senza materiali fisici e senza supporto diretto dei genitori, imparando con la pratica; la maestra riceve un **report** con informazioni concrete per seguire meglio l'alunno e, se lo ritiene, alimentare il **PDP (Piano Didattico Personalizzato)**.

## Profilo utente (uno preciso, come da vincolo)

**Bambino NAI di prima elementare = profilo "persona con difficoltà linguistiche"** (con in più bassa/nulla alfabetizzazione e possibile fragilità economica). Conseguenza progettuale forte: **UI audio-first + icone/pittogrammi, testo scritto ridotto al minimo e sempre letto ad alta voce**.

## Scenario concreto

Un bambino NAI deve imparare a scrivere lettere e numeri (competenza base di prima elementare) ma parte da zero con l'italiano e non ha chi lo segua a casa. Usa l'app sullo smartphone: la maestra gli assegna un esercizio, lui lo svolge in autonomia guidato da audio e icone, e ripete la pratica finché il gesto si consolida. La maestra monitora i progressi dal proprio cruscotto.

## Metrica di miglioramento (HERO — come da vincolo)

**Autonomia + riduzione degli errori nel ricalco, nel tempo.**

Il segnale chiave è uno solo, elegante perché copre tre cose insieme: **la percentuale di tratto che resta dentro i bordi** della lettera/numero.
- È la **metrica** (accuratezza che sale tentativo dopo tentativo).
- È l'**errore** ("dito fuori dai bordi") che innesca il feedback.
- Guida l'**adattamento della difficoltà** — **a regole, senza agente/LLM/ML** (es. compaiono i puntini-guida dopo N errori fuori bordo, e spariscono quando il tratto migliora).

Indicatori tracciati per bambino, per esercizio, per tentativo:
- **% tratto dentro i bordi** (accuratezza) → attesa in salita.
- **Tempo di completamento** e **stalli** → attesi in discesa.
- **Numero di aiuti/hint** richiesti → in discesa = maggiore autonomia.
- **Completamenti senza blocco** → in salita.

## Capability agentica concreta (come da vincolo)

> **Vincolo interno chiave:** l'**app NON integra LLM né ML**. L'agentic coding è solo nel *processo di sviluppo*. I comportamenti richiesti dal bando (che usa il termine "capability agentica") sono implementati come **logica deterministica a regole** — nessun agente/modello decide nulla a runtime. Il bando accetta esplicitamente "rilevamento del blocco" e "feedback mirato sugli errori".

Implementiamo **due** capability (dal set ammesso dal bando):

1. **Feedback mirato sugli errori** — l'app distingue tra **due tipi di errore predefiniti** (una semplice classificazione a regole, non un riconoscimento intelligente) e risponde in modo specifico (non generico):
   - dito fuori dai bordi → incoraggiamento audio + evidenzia la linea da seguire;
   - stallo (troppo tempo senza tracciare) → hint animato che mostra il punto da cui ripartire.
2. **Rilevamento del blocco** — se il bambino è in stallo/frustrazione oltre soglia → si chiude con "per oggi abbiamo finito, yuppi!" + fuochi d'artificio (riposo meritato), **cerotto** nel report + **icona alert aggiuntiva** alla maestra.

Come **adattamento dinamico** (naturale conseguenza del segnale bordi): dopo N errori fuori bordo l'app mostra **puntini-guida**; quando il bambino traccia bene, i puntini spariscono.

## Definizione dei segnali/errori (a regole)

- **Fuori dai bordi:** punto del tocco oltre la tolleranza attorno al tracciato della lettera/numero.
- **Stallo/blocco:** assenza di tracciamento utile per un tempo oltre soglia (soglia da tarare — **10 minuti è troppo per un bimbo di 6 anni**, valutare qualcosa come 1–2 minuti; da definire in fase di build).
- Entrambe le soglie sono parametri configurabili, non hardcoded concettualmente.

## Flusso BAMBINO

1. **Login per avatar** (non email): la maestra fa l'SSO finto della classe; il bambino tocca la **propria faccia** in una griglia.
2. **"CIAO [Nome]"** — letto ad alta voce (audio + icona).
3. **"Oggi studiamo [esercizio], scelto dalla maestra [Nome]"** — audio + icona.
4. Parte l'esercizio (**ricalco**), con consegne audio-first e feedback mirato in tempo reale.
5. Fine esercizio → **fuochi d'artificio in stile cartoon**.
6. Se **blocco** oltre soglia → riposo: "per oggi abbiamo finito, yuppi!" + fuochi + cerotto + alert extra alla maestra.

## Flusso MAESTRA

- **Login SSO finto** con la mail della scuola.
- **Elenco bambini** della classe.
- Per ogni bambino un **mini-report**:
  - **esercizio preferito** (il più ripetuto);
  - **icona cerotto** se ha difficoltà a superare gli esercizi;
  - **icona alert aggiuntiva** se è scattato un blocco/riposo;
  - **trend** degli indicatori (accuratezza, stalli, aiuti).
- **Assegnazione esercizio** al singolo alunno o a tutta la classe.
- Il report è **solo a schermo** (nessun export automatico): **è la maestra a decidere** se i risultati osservati confluiranno nel PDP.

## Set esercizi e scope MVP (5h)

**Full build (curato):**
- **Ricalco LETTERE** (italiano) — dito sul tracciato, feedback bordi/stallo, adattamento puntini-guida.
- **Ricalco NUMERI** (matematica/STEM) — stessa meccanica.
- Dashboard maestra + report + assegnazione.
- Flusso bambino completo + fuochi d'artificio + blocco/riposo.

**Placeholder non giocabili (tessere/mockup):**
- **Gioco dell'ape** (pensiero computazionale, language-free — ottimo candidato per una V2).
- **Diario del tempo** (che tempo fa: sole/pioggia/arcobaleno, freddo/caldo/normale — espressione/vocabolario).

## Piano DEMO (miglioramento misurabile)

- **Dati storici finti pre-caricati:** più sessioni per uno-due bambini, così il report maestra mostra un **trend in salita** (accuratezza ↑, stalli ↓, aiuti ↓).
- **Sessione live:** un giudice/relatore fa un ricalco dal vivo, si vede il feedback mirato e (volutamente) un blocco che porta al riposo + cerotto/alert nel report.
- Messaggio: "il bambino migliora praticando in autonomia; la maestra vede il progresso e ha materiale concreto per il PDP".

## Mapping ai vincoli del bando (checklist)

- ✅ **Profilo utente preciso:** bambino NAI di prima elementare (difficoltà linguistiche + bassa alfabetizzazione).
- ✅ **Scenario concreto:** imparare a scrivere lettere/numeri in autonomia via smartphone.
- ✅ **Miglioramento misurabile:** autonomia + riduzione errori (accuratezza bordi ↑, stalli/aiuti ↓) — dimostrato con trend nel report.
- ✅ **No temi sensibili come consigli professionali:** ambito educativo, nessun consiglio clinico/fiscale/legale (il PDP resta decisione della maestra).
- ✅ **Capability agentica concreta:** rilevamento del blocco + feedback mirato sugli errori (a regole, **senza LLM né ML nell'app**).

## Fuori scope di questo documento

- **Scelte architetturali/tecnologiche** (stack PWA, storage, TTS/audio, riconoscimento del tratto, seeding dati, offline, ecc.): **decise nello step successivo**.
