# Tasks: Adopter les tokens Figma manquants — parité complète (012)

**Input** : documents de conception sous `specs/012-adopt-figma-tokens/`
**Prérequis lus** : plan.md, spec.md (**3 US · 11 FR + 2 lettrées (004a, 009a) · 8 SC**,
5 clarifications résolues le 2026-07-29), research.md (décisions D1-D14), data-model.md,
contracts/{cliche-refresh,format-adoption,liste-blanche,rapport-adoption}.md, quickstart.md.

**Tests** : aucune tâche de test nouvelle — FR-008 l'interdit explicitement (« aucun
nouveau contrôle »). La vérification s'appuie exclusivement sur les portes existantes
(`npm run build`, `npm run parity`, `npm run eval`, `npm run golden:update`,
`plugin:check`, roundtrip déterministe, core-browser-check, `tsc` ×2), intégrées à
chaque tâche ci-dessous plutôt que séparées en une section « tests ».

**Nature de la fonctionnalité** : une opération **données** linéaire (2 fichiers JSON
édités à la main, deux surfaces régénérées, zéro code nouveau) plutôt qu'un
développement logiciel classique — les tâches le reflètent : peu de code, beaucoup de
vérification et de reçus écrits.

## Format : `[ID] [P?] [Story?] Description avec chemin de fichier`

- **[P]** : parallélisable (fichier/reçu disjoint, aucune dépendance non résolue)
- **[US1]/[US2]/[US3]** : rattachement à la user story de spec.md — Setup/Foundational/
  Polish n'en portent aucun
- Chaque tâche cite son chemin de fichier, sa commande ou son verdict attendu exact

## Repères (à ne pas retaper à chaque tâche)

| Repère | Valeur |
|---|---|
| Fichier Figma vivant (lecture seule, FR-010) | `d9FYAUcqdcNtsuaMgLefvJ` (« Piqueray (Copy) »), pont figma-console |
| Script de relevé exécuté tel quel | `parity/extract-figma.plugin.js` (via `figma_execute`) |
| Cliché de variables (entrée capturée, FR-004a) | `parity/snapshots/figma-tokens.json` |
| Fichiers sources édités (les 2 SEULS à la main) | `tokens/primitives.tokens.json`, `tokens/semantic.tokens.json` |
| Liste blanche (surfaces générées) | `src/styles/tokens.css`, `figma-sync/01-tokens.js` + leurs 2 lignes de hash dans `evals/golden.json` |
| Scratch de l'essai de liaison (FR-009a) | `$CLAUDE_SCRATCHPAD/essai-liaison` (détruit après reçu, décision D8) |
| Rapport + reçus bruts | `specs/012-adopt-figma-tokens/{adoption-report.md,proofs/}` |
| Gabarit du rapport | `contracts/rapport-adoption.md` (7 rubriques obligatoires) |
| Sweep complet F1 | `npm run build && npm run parity && npm run eval && npm run plugin:check && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && npx tsc -p tsconfig.build.json` |
| Périmètre attendu du diff final (D12) | `tokens/*.tokens.json` (×2), `src/styles/tokens.css`, `figma-sync/01-tokens.js`, `evals/golden.json` (2 lignes), `parity/snapshots/figma-tokens.json`, `parity/report.json`, `specs/012-adopt-figma-tokens/**`, `CLAUDE.md` — plus `parity/baseline.json` **uniquement si** une limite est nommée (T009 cond. 2) — tout le reste = alarme FR-007 |
| Ancrages d'evals dans le cliché (D13) | `Primitives/border-width/1 = 1`, `Primitives/color/orange` — doivent survivre au refresh T003, sinon arrêt §VIII |

---

## Phase 1 : Setup

**But** : la session est prête à éditer, avant tout geste Figma ou toute écriture de token.

- [x] T001 [Worktree gates — F1] Rendre ce worktree autonome (Constitution, Development
      Workflow : Worktree Gates F1) : `npm install` (déjà fait — `node_modules/.bin/tsx`
      présent, confirmé) puis `npx playwright install chromium` (idempotent — deux
      contrôles du sweep en dépendent : un eval + l'instrument de parité visuelle). Le
      sweep complet — `npm run eval` compris, dont le runner symlinke le
      `node_modules` de CE checkout — s'exécute DANS ce worktree à chaque checkpoint et
      à la clôture (T023, T026). Ce worktree (`check-branch-commit`) est déjà le
      checkout dédié à la branche `012-adopt-figma-tokens`.
- [x] T002 Baseline verte AVANT tout geste (quickstart §0) — `git status --porcelain`
      doit être propre hors **`specs/012-adopt-figma-tokens/**` (untracked compris) et
      `CLAUDE.md`** : ces deux entrées sont attendues dès la planification (D12 les liste
      comme telles — `CLAUDE.md` est mis à jour par le script de plan, Phase 1). Les voir
      modifiées au T0 n'est PAS un écart et ne doit surtout pas être « nettoyé » en
      annulant la mise à jour de contexte. Tout AUTRE fichier modifié → arrêt, worktree
      sale : la preuve octet par octet suppose une base propre.
      Puis `npm run build && npm run parity && npm run eval` doivent tous réussir.
      Consigner la sortie dans `specs/012-adopt-figma-tokens/proofs/baseline-<date>.txt`
      — c'est le point de référence contre lequel T013/T026 mesureront le périmètre du
      diff final. Dépend de T001 (chromium requis par `eval`).

**Checkpoint** : environnement prêt, baseline verte et datée.

---

## Phase 2 : Foundational (bloquant — aucune user story ne démarre avant la fin de cette phase)

**But** : rafraîchir la seule référence de vérité des comptes (FR-004) et photographier
l'angle mort AVANT toute adoption — les trois user stories s'appuient sur ces chiffres
re-relevés, jamais sur les hypothèses de l'audit (139/62/77) prises pour argent comptant.

- [x] T003 Rafraîchir le cliché de variables Figma (contrat `contracts/cliche-refresh.md`,
      FR-004) — pont figma-console connecté au fichier vivant `d9FYAUcqdcNtsuaMgLefvJ` ;
      `figma_execute` ← contenu de `parity/extract-figma.plugin.js` **tel quel** (lecture
      seule, aucun autre script exécuté sur le fichier pendant tout le chantier) ; sauver
      **uniquement** `{fileName, fileKey, extractedAt, collections}` du retour (la partie
      `sets` est ignorée, décision D2) dans `parity/snapshots/figma-tokens.json` — JSON
      indenté 2 espaces, LF, newline final (style du fichier remplacé). Vérifier avant
      d'écrire : `fileKey === "d9FYAUcqdcNtsuaMgLefvJ"`, `extractedAt` du jour, exactement
      2 collections (`Primitives` mode `Value`, `Semantic` mode `Light`) et elles seules,
      chaque collection non vide. **Arrêt nommé** (ne pas poursuivre, ne rien écrire) si :
      pont indisponible/fichier inaccessible, `fileKey` inattendu, ou collections
      surnuméraires/renommées (dans ce dernier cas : arbitrage §VIII consigné dans le
      futur rapport, rubrique 3). **Ancrages d'evals — vérifier AVANT d'écrire, arrêt
      nommé sinon (décision D13)** : ce cliché n'est pas seulement l'entrée du differ,
      c'est aussi une **entrée de la suite d'evals**. Trois cas d'eval en dépendent par
      nom et échouent si le relevé frais ne les porte plus : `Primitives/border-width/1`
      avec `values.Value === 1` (l'eval `primitives-border-width-parity` **lève** sinon,
      `evals/fixtures/primitives-border-width-parity-check.ts`) et
      `Primitives/color/orange` (`detect-token-alias-drift` et
      `detect-token-missing-variable`, `evals/run.ts`). Si l'un manque ou a changé de
      valeur/nom dans le fichier vivant : **ne pas écrire le cliché** — c'est un
      arbitrage §VIII côté source (« défaut Figma ou pas ? »), consigné rubrique 3, et
      surtout PAS un eval à réécrire pour absorber l'écart. Vérifier n'est pas ajouter un
      contrôle (FR-008) : c'est contrôler la prémisse d'un contrôle existant.
      **Reçu lecture seule (FR-010)** : noter dans le reçu du refresh qu'exactement UN
      `figma_execute` a été exécuté sur le fichier (le contenu de
      `parity/extract-figma.plugin.js`, qui ne contient aucune écriture), et qu'aucun
      autre geste de pont n'a lieu de bout en bout du chantier — c'est la seule preuve
      de FR-010 et elle doit être écrite, pas sous-entendue (§V).
      Statut de l'artefact : entrée capturée commitée
      (FR-004a) — son évolution (62 → N relevées) ne déclenche JAMAIS l'alarme liste
      blanche (T014), qui ne porte que sur les sorties générées.
- [x] T004 [P] Re-relever les comptes depuis le cliché frais (quickstart §2, même méthode
      des deux côtés — D9) — pour chaque collection de `parity/snapshots/figma-tokens.json`,
      compter `variables.length` et sommer (référence Figma) ; comparer à la `flatten()`
      actuelle du dépôt (62 attendues) ; en déduire la liste des manquants. **Différence
      d'ensembles dans les DEUX sens, pas seulement des totaux** — deux ensembles de
      cardinal attendu peuvent différer par un échange (une feuille perdue + une gagnée) :
      (a) `cliché \ dépôt` = les manquants à adopter (attendu : 77) ; (b) **`dépôt \
      cliché` = les 62 existantes qui ne seraient plus dans le fichier vivant — attendu
      VIDE**. Si (b) n'est pas vide, une feuille gouvernée a disparu ou été renommée côté
      Figma : **arrêt nommé**, arbitrage §VIII côté source d'abord (« défaut Figma ou
      pas ? »), consigné rubrique 3 — jamais une adoption qui poursuivrait en laissant
      des findings `behind` que T009 découvrirait trop tard, et jamais une suppression
      côté dépôt pour « faire coller » (FR-003 : les 62 sont intouchables).
      Confronter aux
      hypothèses de l'audit (139 Figma / 62 dépôt / 77 manquants = 29 primitives + 48
      sémantiques) : si dérive, recalculer la liste des manquants depuis CE cliché et
      poursuivre sur les comptes re-relevés (FR-004, la spec suit le relevé frais) ; si
      les 77 attendus sont absents du fichier vivant, la prémisse tombe → arrêt nommé.
      Dépend de T003. Consigner
      `specs/012-adopt-figma-tokens/proofs/comptage-<date>.md` (comptes avant, liste
      nommée des manquants — matière première de la rubrique 1 et 2 du rapport).
- [x] T005 [P] Photographier l'angle mort AVANT adoption (décision D9, moitié « avant ») —
      `npm run parity` (dépend de T003 seul, pas de T004) ; attendu : l'axe tokens émet
      exactement la liste des feuilles manquantes en findings `figma-tokens / ahead`
      (« Figma variable has no counterpart in tokens/ »), `exit 1`. **Ceci est un reçu,
      pas une porte rouge à corriger.** Consigner la sortie brute dans
      `specs/012-adopt-figma-tokens/proofs/parity-avant-<date>.txt`.

**Checkpoint** : cliché frais commité, comptes re-relevés, angle mort photographié et
daté — les trois user stories peuvent s'appuyer sur des chiffres à jour plutôt que sur
l'audit.

---

## Phase 3 : User Story 1 — Combler l'angle mort du contrôle de parité (Priority: P1) 🎯 MVP

**Goal** : la fondation de tokens du dépôt porte l'intégralité des tokens gouvernés dans
Figma (139 au relevé T004), afin que la parité compare du complet à du complet.

**Independent Test** : après adoption, dénombrer les feuilles des deux côtés (fondation
dépôt vs cliché rafraîchi), constater l'égalité des ensembles, puis vérifier que le
rapport de parité couvre chacune des feuilles adoptées.

- [x] T006 [US1] Adopter les 29 primitives manquantes dans `tokens/primitives.tokens.json`
      (contrat `contracts/format-adoption.md`, FR-001) — valeurs **strictement
      identiques** au cliché rafraîchi (T003/T004), conventions du groupe d'accueil
      (research D4) : `color.*` hex **MAJUSCULES** (`#RRGGBB` / `#RRGGBBAA` — 8 chiffres :
      casse stricte, non neutralisée par `norm()`) ; `font.size.*`, `font.line-height.*`,
      `space.*`, `radius.*` en `"Npx"` (jamais le nombre nu). Une feuille existante
      n'est **jamais** modifiée, renommée ou supprimée (62/62 intactes, FR-003). Un
      token non représentable (type/unité non supporté) n'est **pas** adopté — le
      nommer comme limite pour le rapport (rubrique 3) et continuer sur le reste. Une
      collision de nom pour une valeur différente est arbitrée côté source d'abord
      (§VIII) et nommée, jamais écrasée en silence. Interdits absolus : toucher
      `tokens/modes/*` ou `contracts/*`.
- [x] T007 [US1] Adopter les 48 feuilles sémantiques de typographie manquantes dans
      `tokens/semantic.tokens.json` (contrat `contracts/format-adoption.md`, FR-002) —
      **alias obligatoires, forme point** (`"{font.size.25}"`), jamais un littéral (le
      générateur Figma refuse une sémantique non-alias). Chaque alias vise une primitive
      existante **ou** l'une des 29 adoptées en T006 — dépend donc de T006. Groupes
      nouveaux (ex. `libelle-bouton`) **ou** feuille ajoutée à un groupe existant (ex.
      `titre-1.line-height`) — les deux sont additifs à la feuille (clarification
      2026-07-29). `$type` par feuille : `fontFamily` / `dimension` / `fontWeight`. Même
      règle d'additivité stricte et de collision qu'en T006. **Échappatoire, miroir de
      T006** : le relevé peut porter une feuille sémantique **littérale** (Figma autorise
      une variable Semantic non aliasée) — elle est alors inadoptable telle quelle, parce
      que le générateur la refuse par construction (« Semantic token "X" must be an
      alias », D5). Deux issues, jamais une troisième : soit la valeur littérale
      correspond exactement à une primitive existante ou adoptée en T006 et la feuille est
      écrite comme alias vers elle (l'aliasage est alors une **lecture fidèle** de la
      valeur, pas une invention) ; soit elle ne correspond à aucune primitive → la feuille
      n'est **pas** adoptée, elle est nommée comme limite (rubrique 3) et l'écart reste
      visible en `figma-tokens / ahead` à T009, assumé et expliqué plutôt que masqué.
      Inventer une primitive d'accueil pour faire tomber le compte à 139 est exactement
      l'acquittement silencieux que §V interdit.
- [x] T008 [US1] Régénérer depuis la fondation étendue — `npm run build` puis
      `npm run figma:plan` (dépend de T006, T007). Ceci re-prouve **par construction**
      zéro alias cassé (décision D5, deux portes existantes, aucune vérification ad
      hoc) : `npm run build` doit accepter (aucun `references "{X}" which does not
      exist`) et `npm run figma:plan` doit accepter (aucun `Cannot resolve token`, aucun
      `Semantic token "X" must be an alias`). Tout refus nomme le token fautif — jamais
      résolu par une valeur inventée ; corriger la feuille en cause et refaire T006/T007
      avant de continuer. Consigner la sortie dans
      `specs/012-adopt-figma-tokens/proofs/build-<date>.txt`.
- [x] T009 [US1] Confirmer la couverture de parité complète (FR-005, SC-001) —
      `npm run parity` après régénération (dépend de T008) : attendu axe tokens
      **139 ↔ 139** (ou les comptes re-relevés de T004 si dérive), `exit 0`, zéro finding
      `figma-tokens / ahead` ou `/behind` résiduel. Comparer explicitement au reçu T005
      (avant) pour montrer la fermeture de l'angle mort. Consigner
      `specs/012-adopt-figma-tokens/proofs/parity-apres-<date>.txt`.
      **Cas nominal attendu : zéro résiduel.** Si une limite a été nommée en T006/T007
      (token non représentable, sémantique littérale sans primitive correspondante), le
      résiduel n'est pas zéro et il doit alors satisfaire les trois conditions
      cumulatives, sinon arrêt : (1) correspondance **1:1** entre findings résiduels et
      limites nommées en rubrique 3 — aucun finding orphelin ; (2) acquittement par la
      route existante `parity/baseline.json` (tableau de clés
      `surface|classification|subject` — mécanisme du dépôt, pas un nouveau contrôle), ce
      qui ajoute ce fichier au périmètre D12 et **uniquement** dans ce cas ; (3) la
      couverture annoncée au rapport devient « 139 − k, avec les k limites énumérées »,
      jamais « 139/139 » arrondi vers le haut. Un acquittement baseline sans limite
      correspondante en rubrique 3 est précisément l'acquittement silencieux que FR-007
      et §V interdisent.
- [x] T010 [US1] Vérifier que les feuilles adoptées sont **comparées**, pas seulement
      comptées (acceptance scenario 3 d'US1 — une divergence future doit être
      signalable) — dépend de T009. Échantillonner 2-3 chemins parmi les 77 (ex. une
      primitive de couleur, une feuille `typography.*.line-height`) dans la sortie du
      differ ou `parity/report.json` et confirmer qu'ils apparaissent comme
      match/comparés, jamais absents du rapport. Noter l'échantillon dans le reçu T009
      pour la rubrique 6 du rapport final.

**Checkpoint** : US1 complète et vérifiable indépendamment — couverture 139/139,
angle mort comblé et daté.

---

## Phase 4 : User Story 2 — Prouver la non-dégradation par construction (Priority: P1)

**Goal** : les seules traces observables de l'adoption sur les sorties générées sont les
deux surfaces de la liste blanche — tout écart ailleurs est un signal d'alarme, jamais
acquitté en silence.

**Independent Test** : régénérer toutes les sorties après adoption, comparer octet par
octet à l'état antérieur, constater que seules les surfaces de tokens de la liste
blanche se sont enrichies.

- [x] T011 [US2] Re-épingler le golden — `npm run golden:update` (dépend de T008 ; le
      script recalcule le manifeste ENTIER de `src/` + `figma-sync/*.js` hors
      plugin/arrange — research D7).
- [x] T012 [US2] Vérifier le diff du golden (FR-006/007, contrat `contracts/liste-blanche.md`)
      — `git diff evals/golden.json` (dépend de T011) doit montrer **EXACTEMENT 2 lignes**
      de hash modifiées : `src/styles/tokens.css` et `figma-sync/01-tokens.js`. Consigner
      dans `specs/012-adopt-figma-tokens/proofs/golden-diff-<date>.txt`. Toute 3ᵉ ligne
      → protocole d'alarme (T014), pas de correction silencieuse.
- [x] T013 [US2] Vérifier le périmètre complet du diff (D12) — dépend de T012 :
      `git diff --stat` et `git status --porcelain` ne doivent montrer QUE les fichiers
      du tableau « Repères » ci-dessus (tokens sources ×2, `tokens.css`, `01-tokens.js`,
      `evals/golden.json`, `parity/snapshots/figma-tokens.json`, `parity/report.json`,
      `specs/012-adopt-figma-tokens/**`, `CLAUDE.md`, plus `parity/baseline.json`
      **seulement si** T009 a acquitté une limite nommée). Tout fichier hors cette liste
      (composant régénéré différemment, autre script `figma-sync/NN-*.js`,
      `catalog/catalog.json`, untracked inattendu) → protocole d'alarme (T014).
- [x] T014 [US2] **[Conditionnelle — ne s'exécute que si T012 ou T013 détecte un écart]**
      Protocole d'alarme (contrat `contracts/liste-blanche.md` §Protocole, FR-007) :
      ARRÊT immédiat (pas de commit, pas d'acquittement baseline) ; diagnostic —
      `git stash` des tokens + régénération à blanc pour isoler si l'écart vient de
      l'adoption (bug de générateur révélé) ou était préexistant (worktree sale) ;
      explication **nommée** dans le futur rapport (rubrique 3) — si c'est un défaut
      réel, il suit sa propre route (fixture → eval → fix), jamais contourné ici ; le
      re-épinglage reste limité aux 2 entrées de la liste blanche — un `golden:update`
      qui « absorberait » l'écart est un acquittement silencieux et **refusé**. Si
      aucun écart n'est détecté en T012/T013, cette tâche ne s'exécute pas — écrire
      « aucun écart » dans le rapport (T024) à la place.
      **Constat** : non déclenchée — T012/T013 n'ont détecté aucun écart. Un écart
      DIFFÉRENT (hors du périmètre T012/T013 : mismatch montserrat + receipt plugin
      périmé) a été découvert plus tard, en T023 (sweep complet) — traité par
      arbitrage direct + acquittement plutôt que par ce protocole, car détecté par une
      route différente (eval/plugin:check, pas golden/git diff). Voir rapport §3/§7.
- [x] T015 [P] [US2] Vérifier 62/62 feuilles préexistantes inchangées (SC-003) —
      `git diff tokens/primitives.tokens.json tokens/semantic.tokens.json` (dépend de
      T006, T007) ne doit montrer **QUE des lignes ajoutées** (`+`) ; zéro ligne
      supprimée ou modifiée (`-`) touchant une feuille déjà existante avant T006/T007.
- [x] T016 [P] [US2] Compter explicitement 48/48 alias sémantiques résolus (SC-002) —
      dépend de T007 : dénombrer les feuilles sous `typography.*` dans
      `tokens/semantic.tokens.json` portant un `$value` en forme alias (`{…}`) parmi les
      48 nouvellement adoptées, confirmer qu'aucune n'est un littéral. Déjà prouvé
      structurellement par T008 (portes existantes) — cette tâche rend le compte
      explicite et consignable pour la rubrique 1/2 du rapport.
- [x] T017 [P] [US2] Confirmer nommément les surfaces prédites byte-identiques (research
      D6, contrat `contracts/liste-blanche.md`) — dépend de T012 : `src/components/**`,
      `src/styles/tokens.dark.css`, `src/styles/tokens.brands.css`,
      `figma-sync/NN-*.js` (02+), `figma-sync/batch-*.js`, `catalog/catalog.json`,
      `contracts/contract.schema.json` — aucun hash golden modifié pour ces chemins
      (déjà couvert par le compte à 2 lignes de T012, vérifié ici nommément pour la
      rubrique 5 du rapport).

**Checkpoint** : US2 complète et vérifiable indépendamment — preuve octet par octet
conforme au tableau de `contracts/liste-blanche.md`, non-dégradation démontrée.

---

## Phase 5 : User Story 3 — Rendre les tokens disponibles pour le dé-durcissement futur (Priority: P2)

**Goal** : n'importe lequel des tokens adoptés peut être lié depuis un contrat ; un
token inexistant reste refusé par son nom ; zéro valeur en dur convertie dans cette
itération.

**Independent Test** : lier un token adopté depuis un contrat d'essai temporaire non
commité et constater que le build l'accepte ; lier un token inexistant et constater
que le build le refuse par son nom ; le contrat d'essai est retiré, `contracts/` reste
intact.

- [x] T018 [US3] Copier le worktree en scratch (décision D8, contrat
      `contracts/format-adoption.md`, FR-009a) — dépend de T007 (les tokens adoptés
      doivent exister dans la copie) : `S="$CLAUDE_SCRATCHPAD/essai-liaison"; mkdir -p "$S"`
      puis `rsync -a --exclude node_modules --exclude .git ./ "$S"/` puis
      `ln -s "$PWD/node_modules" "$S/node_modules"`. La non-trace dans l'arbre réel est
      ainsi **structurelle** (un essai dans l'arbre réel généreraît des composants
      orphelins sous `src/components/`).
- [x] T019 [US3] Cas d'acceptation — dépend de T018 : dans la copie scratch, retargeter
      **une** liaison d'un contrat existant vers un token adopté de même nature (ex.
      `{radius.32}` → `{radius.<adopté>}`, ou une liaison typo vers une feuille
      `typography.*` neuve — miroir inverse de l'eval `refuse-unknown-token-reference`).
      `(cd "$S" && npm run build)` — attendu **accepté**. Capturer la sortie console dans
      `specs/012-adopt-figma-tokens/proofs/essai-scratch-accepte-<date>.txt`.
- [x] T020 [US3] Cas de refus — dépend de T018 (peut suivre T019 dans la même copie) :
      retargeter la même liaison vers un token inexistant (ex.
      `{typography.inexistant.size}`). `(cd "$S" && npm run build)` — attendu **refusé,
      nommant le token** (`references token "{…}" which does not exist in tokens/`,
      `core/emit-react.ts` — porte existante, inchangée). Capturer la sortie console dans
      `specs/012-adopt-figma-tokens/proofs/essai-scratch-refuse-<date>.txt`.
- [x] T021 [US3] Détruire le scratch et confirmer l'arbre réel intact — dépend de T019,
      T020 : `rm -rf "$S"` ; puis `git status` sur le dépôt réel confirme **zéro trace**
      sous `contracts/` et **zéro** sortie composant orpheline sous `src/components/`.
- [x] T022 [P] [US3] Confirmer zéro conversion des 89 valeurs en dur (FR-009, SC-006
      volet négatif) — `git diff contracts/` sur le dépôt réel doit être **vide** : aucun
      fichier de `contracts/` modifié par cette fonctionnalité.

**Checkpoint** : US3 complète et vérifiable indépendamment — liabilité démontrée en
scratch (accepté + refusé par nom), `contracts/` réel intact, zéro conversion.

---

## Phase 6 : Polish & Cross-Cutting

**But** : les portes de qualité restent toutes vertes, le rapport d'adoption couvre
100 % de ses rubriques, le périmètre final du diff est exactement celui annoncé — puis
un commit unique clôt l'itération.

- [x] T023 Sweep complet des gates F1 dans ce worktree (SC-005) — dépend de T009, T013,
      T021 (fonctionnellement, tout doit être en place) :
      `npm run build && npm run parity && npm run eval && npm run plugin:check && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && npx tsc -p tsconfig.build.json`.
      Toutes vertes attendu (zéro nouveau contrôle, FR-008). Noter le `N/N` **vivant** de
      `npm run eval` (jamais codé en dur ailleurs que ce reçu daté). Consigner
      `specs/012-adopt-figma-tokens/proofs/sweep-<date>.txt`.
- [x] T024 [P] Rédiger `specs/012-adopt-figma-tokens/adoption-report.md` selon le gabarit
      `contracts/rapport-adoption.md` (FR-011, SC-008) — dépend de T004, T009, T010,
      T012, T013, T016, T017, T019, T020, T021, T023. Les 7 rubriques, toutes
      obligatoires : (1) comptes re-relevés avant/après + méthode + `extractedAt` +
      **résultat de la différence d'ensembles dans les deux sens (T004) et des ancrages
      d'evals (T003/D13)** ; (2)
      liste nommée des feuilles adoptées (chemin, groupe, valeur/cible d'alias,
      primitives séparées des sémantiques) ; (3) limites nommées — **si aucune, écrire
      « Aucune limite rencontrée » en toutes lettres** ; (4) reçu de l'essai temporaire
      (sorties T019/T020, scratch détruit, `contracts/` intact) ; (5) diff attendu vs
      observé des 2 surfaces de la liste blanche (table `contracts/liste-blanche.md`
      confrontée au réel) ; (6) reçu de l'angle mort avant/après (T005/T009/T010) ; (7)
      sortie du sweep (T023), `N/N` vivant, **plus le reçu lecture seule de FR-010** :
      exactement un `figma_execute` en lecture sur le fichier vivant (T003), aucune
      écriture Figma de bout en bout. Noter aussi la durée observée de la session
      (SC-007, estimation indicative — jamais un motif d'échec). Reçus bruts sous
      `specs/012-adopt-figma-tokens/proofs/` — le rapport les cite, il ne les remplace pas.
- [x] T025 [P] Relire `quickstart.md` et les 4 fichiers sous `contracts/` à la lumière de
      l'exécution réelle — si un pas a divergé (comptes différents de l'audit,
      répartition primitives/sémantiques différente, limite rencontrée non prévue),
      corriger ces artefacts de spec **avant** de clore (ils sont sous
      `specs/012-adopt-figma-tokens/`, donc librement éditables).
- [x] T026 Vérification finale du périmètre + commit unique — dépend de T024, T025 :
      `git status --porcelain` et `git diff --stat` confirment **exactement** le
      périmètre D12 (tableau « Repères ») — tout fichier surnuméraire est une régression
      à corriger avant de committer quoi que ce soit. Puis un seul commit portant :
      les 2 sources de tokens, les 2 surfaces de la liste blanche, `evals/golden.json`
      (2 lignes), le cliché rafraîchi, `parity/report.json`, et
      `specs/012-adopt-figma-tokens/**` (dont le rapport d'adoption).

**Checkpoint** : gates au vert, rapport complet, périmètre du diff exactement celui
annoncé, itération close.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** : aucune dépendance — démarre immédiatement.
- **Foundational (Phase 2)** : dépend de Setup — BLOQUE les trois user stories (les
  comptes re-relevés T004 et l'angle mort T005 sont la référence unique dont US1/US2/US3
  ont besoin).
- **User Stories (Phase 3-5)** : toutes dépendent de Foundational. Contrairement au cas
  général, elles ne sont **pas exécutables en parallèle par des agents différents** ici :
  US2 (Phase 4) consomme la régénération produite par US1/T008, et US3 (Phase 5) consomme
  les fichiers tokens édités par US1/T006-T007. C'est une caractéristique de cette
  fonctionnalité (une seule opération de données linéaire vue sous trois angles
  d'acceptance), pas un défaut de découpage — chacune reste **indépendamment testable**
  une fois ses prérequis posés (voir « Independent Test » de chaque phase).
- **Polish (Phase 6)** : dépend des trois user stories complètes.

### User Story Dependencies

- **US1 (P1)** : démarre après Foundational. Aucune dépendance sur US2/US3.
- **US2 (P1)** : démarre après Foundational **et** après T008 (US1) — la preuve octet
  par octet porte sur la régénération que US1 produit.
- **US3 (P2)** : démarre après Foundational **et** après T007 (US1) — l'essai de
  liaison scratch a besoin des tokens déjà adoptés dans la copie. N'a besoin ni de T008
  ni d'US2.

### Within Each User Story

- US1 : T006 → T007 (alias peuvent viser les primitives de T006) → T008 → T009 → T010.
- US2 : T011 → T012 → T013 → (T014 si déclenchée) ; T015/T016/T017 en parallèle dès que
  leurs dépendances respectives (T006/T007/T012) sont posées.
- US3 : T018 → T019 → T020 → T021 ; T022 indépendante dès Foundational fini.

### Parallel Opportunities

- T004 et T005 (Foundational) — reçus disjoints, tous deux ne dépendent que de T003.
- T015, T016, T017 (US2) — trois vérifications en lecture sur des artefacts déjà produits,
  aucune ne modifie l'état des autres.
- T022 (US3) — indépendante du reste d'US3, peut courir dès que Foundational est fini.
- T024 et T025 (Polish) — le rapport et la relecture des artefacts de spec touchent des
  fichiers disjoints.

---

## Parallel Example : Foundational

```bash
# Après T003 (cliché frais commité), lancer ensemble :
Task: "Re-relever les comptes depuis le cliché frais → proofs/comptage-<date>.md"
Task: "Photographier l'angle mort AVANT adoption (npm run parity) → proofs/parity-avant-<date>.txt"
```

## Parallel Example : User Story 2

```bash
# Après T012 (diff golden vérifié), lancer ensemble :
Task: "Vérifier 62/62 feuilles préexistantes inchangées (git diff sur les 2 fichiers sources)"
Task: "Compter 48/48 alias sémantiques résolus dans tokens/semantic.tokens.json"
Task: "Confirmer nommément les surfaces prédites byte-identiques (composants, dark, brands, …)"
```

---

## Implementation Strategy

### Particularité de cette fonctionnalité — pas de MVP partiel

À la différence d'un produit incrémental, cette itération n'a pas de sous-ensemble
« livrable seul » : adopter 15 des 77 feuilles ne comble pas l'angle mort (US1 exige
139/139) et ne peut pas se démontrer non-dégradant indépendamment (US2 mesure le diff de
**toute** l'adoption). Le séquençage Setup → Foundational → US1 → US2 → US3 → Polish
reste la voie unique ; « MVP » ici désigne l'ordre d'exécution recommandé dans une
session unique (~30 min, SC-007), pas un point d'arrêt livrable.

### Déroulé recommandé

1. Phase 1 (Setup) + Phase 2 (Foundational) — chiffres à jour, angle mort daté.
2. Phase 3 (US1) — l'adoption elle-même ; **checkpoint** : 139/139 en parité.
3. Phase 4 (US2) — la preuve de non-dégradation sur ce que US1 vient de produire ;
   **checkpoint** : diff golden à 2 lignes, périmètre D12 respecté.
4. Phase 5 (US3) — le reçu de liabilité en scratch, sans toucher à l'arbre réel ;
   **checkpoint** : accepté + refusé par nom, `contracts/` intact.
5. Phase 6 (Polish) — sweep complet, rapport, commit unique.

### Points d'arrêt nommés (à ne jamais contourner)

- T003 : pont indisponible / `fileKey` inattendu / collections inattendues.
- T003 (D13) : un **ancrage d'eval** absent du relevé frais (`Primitives/border-width/1`
  ≠ 1, `Primitives/color/orange` manquant) — arrêt AVANT écriture du cliché ; jamais un
  eval réécrit pour absorber l'écart.
- T004 : `dépôt \ cliché` non vide — une des 62 feuilles a disparu côté Figma ; arbitrage
  §VIII, jamais une suppression côté dépôt pour faire coller les comptes.
- T007 : feuille sémantique littérale sans primitive correspondante — limite nommée,
  jamais une primitive inventée pour atteindre 139.
- T008 : alias cassé (nommé par le build ou `figma:plan`, jamais résolu par une valeur
  inventée).
- T012/T013 → T014 : tout écart hors de la liste blanche.
- Chacun de ces arrêts se documente dans `decisions.md`-style au fil de l'eau et atterrit,
  nommé, dans `adoption-report.md` (T024) — jamais un acquittement silencieux.

---

## Notes

- [P] tasks = fichiers ou reçus différents, aucune dépendance non résolue.
- [Story] label rattache la tâche à sa user story pour la traçabilité.
- Zéro tâche de test nouvelle (FR-008) — la vérification, c'est les portes existantes.
- Chaque tâche cite son reçu (`specs/012-adopt-figma-tokens/proofs/…`) — le rapport
  final (T024) les cite, il ne les remplace pas.
- Un seul commit de clôture (T026) — pas de commits intermédiaires par tâche : le
  protocole d'alarme (T014) exige justement qu'aucun commit ne parte avant que le
  périmètre soit vérifié propre.
