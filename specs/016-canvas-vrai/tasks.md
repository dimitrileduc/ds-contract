# Tasks: Canvas vrai (016)

**Input**: documents de conception de `/specs/016-canvas-vrai/`
**Prerequisites**: plan.md (requis), spec.md (user stories), research.md (D1–D12), data-model.md (6 entités), contracts/ (4 interfaces), quickstart.md

**Tests**: OUI, mais **ciblés** — la spec ne demande pas de suite de tests ; la constitution en impose trois endroits précis. (1) §II Claims Rule : le correctif d'émetteur du volet Field est **fixture d'abord, ROUGE constaté avant le code** (T065–T067). (2) FR-002/SC-002 : le test de sentinelle EST une preuve exigée par la spec, pas une option (T021–T022). (3) §VII : tout défaut qui n'apparaîtrait que sur le canvas vivant est enseigné au mock headless. (4) §II encore : chaque limite levée par une promotion US2 (T038/T040/T042) devient une phrase de capacité — elle nomme l'eval qui la couvre, ou sa fixture s'écrit d'abord (T050). Le reste du chantier se prouve par **relevés pixel et comptes vifs**, pas par des tests unitaires.

**Organisation**: une phase par user story, pour que chacune soit livrable et vérifiable seule.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichiers disjoints, aucune dépendance sur une tâche non finie)
- **[Story]** : US1 (la maquette redevient surveillée), US2 (la source cesse de porter ses défauts), US3 (le canvas régénéré sans perte)
- Chemins de fichiers exacts dans chaque description

## ⚠️ Le parallélisme est presque partout INTERDIT ici

Le fichier client est vivant et **l'écrivain est unique** (D10 — §XI satisfait par construction : on ne parallélise pas sur un fichier client en production). Conséquence : **aucune tâche portant un geste canvas ne porte `[P]`**, même quand elle touche des masters différents. Les seules tâches `[P]` de cette liste sont des écritures de fichiers du dépôt (scripts d'instrument, documents) qui ne touchent pas Figma.

## Conventions de mesure (valables partout ci-dessous)

- **Aucun compte n'est recopié depuis la prose.** Les chiffres ci-dessous sont des **relevés d'ouverture datés du 2026-08-05**, pas des cibles : le compte vif imprimé par la commande fait foi, et tout écart se consigne, jamais ne se lisse.
  - `parity/baseline.json` : **89** entrées = **83** `figma-tokens|behind|Primitives/(space|size)/…` + **6** résiduelles (`icons|ahead|assets/icons/close.svg`, `figma|behind|Avantage.PiquerayLogo`, `figma|behind|Carte.Bouton`, `figma|behind|SectionHeader.Bouton`, `figma|mismatch|Presentation.Texte (default)`, `figma-tokens|mismatch|Primitives/font/family/montserrat [Value]`). La spec annonçait « ≈7 » de résiduel : **le vif en montre 6** — l'écart est nommé au rapport (D11).
  - `npm run measure:gate` : verdict **PASS**, `contract-geometry=0 · image-boundary=11 · rendering=24 · engine=2 · instrument=1 · **figma-source=2**`. Cible de clôture : `figma-source: 0`.
  - `figma-sync/01-tokens.js` porte **99** primitives géométriques (78 `size/*` + 21 `space/*`) — le script upserte les 99, dont **83** manquent au canvas. « 83 » est le compte des **acquittements qui doivent tomber**, pas celui des variables écrites.
- **Piège nommé — `figma-sync/NN-*.js` est ambigu, et exécuter le mauvais écrirait une spec d'époque dans le fichier client.** `scripts/generate-figma.ts:82` numérote par index de dépendance (`${index}-${nom}.js`) et **ne supprime jamais** les fichiers d'une génération antérieure : le dépôt porte aujourd'hui 3 copies de `textarea` (`12-`, `18-`, `19-`), 3 de `field` (`13-`, `19-`, `20-`), 3 de `select`, `sectionheader`, `memberpicture`, `membercard`, `input`, `footercolumn`, `copyright`, et 2 de douze autres. Le script courant est **celui que la sortie de `npx tsx scripts/generate-figma.ts` liste** (`✔ Emitted figma-sync scripts (dependency order): …`) — jamais choisi au flair, jamais déduit du numéro. C'est l'objet de T009.
- `grep -a` / `rg -a` ou Python systématiquement (octet NUL légitime dans `core/emit-html.ts` et `extract/figma/visual-parity/run.ts` — un `grep` BSD y répond « vide » sans erreur).
- `evals/fixtures` est **hors tsconfig** : `tsc` vert ≠ eval vert. Après toute retouche de signature partagée, lancer réellement `npm run eval`.
- **Jamais deux sweeps en parallèle** — `evals/.scratch` est un chemin unique ; une seconde eval concurrente produit de faux rouges.
- **Toute fenêtre de geste canvas** exige : Figma desktop ouvert sur `d9FYAUcqdcNtsuaMgLefvJ`, pont figma-console identifié (`figma_get_status`, port 9223), `figma.loadAllPagesAsync()` avant tout accès à la page `Pages` (`210:325`), receveur `9227` démarré et son **nonce** relevé. Rien ne tourne en CI ni sans surveillance ; les fenêtres se planifient avec l'owner (D12).
- **Une décision du dépôt n'est pas un fait.** Le backlog 013 vient d'une mémoire du 2026-07-30 et les entrées DW d'un registre daté : **chaque diagnostic se re-relève au vif avant son geste** (D5/D9). Un défaut qui ne se reproduit plus se clôt *sans geste*, avec son reçu qui le dit.

---

## Phase 1: Setup (infrastructure partagée)

**Purpose**: worktree autosuffisant et point de départ prouvé vert

- [X] T001 [Worktree gates — F1] Rendre le worktree autosuffisant (constitution, Development Workflow: Worktree Gates) : `git worktree add ../ds-contract-016 016-canvas-vrai` — **après avoir commité les documents de planning** de `specs/016-canvas-vrai/` sur la branche, sinon le worktree les manquerait (leçon 015/T001) — puis `npm install` DANS le worktree (`npm run eval` symlinke le `node_modules` du checkout : il refuse sans), puis `npx playwright install chromium` (deux contrôles pilotent un vrai Chromium). La sweep COMPLÈTE — `npm run eval` compris — tourne dans ce worktree à chaque checkpoint et à la clôture. Le checkout principal ne peut pas sortir cette branche tant que le worktree la tient ; si un contrôle doit y tourner : `git -C <checkout-principal> checkout --detach <commit>`, sweep, restaurer.
- [X] T002 Prouver le point de départ vert et créer l'arborescence de preuves : lancer la sweep complète (voir § Sweep) dans le worktree, archiver la sortie dans `specs/016-canvas-vrai/proofs/depart-sweep.txt` ; créer `specs/016-canvas-vrai/proofs/`, `specs/016-canvas-vrai/proofs/recus/`, `specs/016-canvas-vrai/proofs/photos/`, `specs/016-canvas-vrai/registre/`, `specs/016-canvas-vrai/bridge/`, `specs/016-canvas-vrai/tools/`, et `specs/016-canvas-vrai/decisions.md` (journal des lots : annonce ⟷ observé ⟷ verdict ⟷ versionId).

---

## Phase 2: Foundational (prérequis bloquants)

**Purpose**: aucun geste canvas — d'aucune story — ne démarre avant que le pont soit prouvé, le périmètre de capture connu, le plancher de bruit **nul**, le bon script identifié et les comptes d'ouverture relevés.

**⚠️ CRITIQUE** : T005 est un veto. Si l'étalonnage n'est pas `N/N identical`, l'instrument bruite et **le chantier ne commence pas** (edge case explicite de la spec).

- [X] T003 Prouver les préconditions matérielles de la première fenêtre et les consigner dans `specs/016-canvas-vrai/proofs/00-preconditions.md` : `figma_get_status` (pont identifié, port 9223, bon fichier `d9FYAUcqdcNtsuaMgLefvJ`), `figma.loadAllPagesAsync()` puis accès prouvé à la page `Pages` `210:325`, `node extract/figma/page-parity/receiver.mjs .page-parity/00-etalonnage/a 9227` démarré, `curl -s localhost:9227/health` → `{ "instrument": "page-parity", … }` **et le nonce de session relevé** (un receveur étranger a déjà pollué un cycle : c'est pourquoi le nonce se pinne).
- [X] T004 Relever le **périmètre de capture** de référence par POSITION (`extract/figma/page-parity/bridge/scan.js` via `figma_execute`) et l'écrire dans `specs/016-canvas-vrai/proofs/00-perimetre.json` : les 9 maquettes de la page `Pages` **plus** l'inventaire des pages DS et de leurs masters (nodeId, nom, bounds). C'est la base de toute annonce de lot : une édition de master se propage aux instances, donc §X exige que les deux familles soient capturées, jamais les maquettes seules.
- [X] T005 **Étalonnage (veto)** : capturer 2× le périmètre de T004 **sans aucun geste** (`extract/figma/page-parity/bridge/capture.js`, même receveur, même nonce), puis `npm run pages:compare -- --before .page-parity/00-etalonnage/a --after .page-parity/00-etalonnage/b --out specs/016-canvas-vrai/proofs/00-etalonnage`. **Attendu : N/N `identical`** — plancher de bruit zéro. Toute différence ⇒ arrêt, diagnostic de l'instrument, **zéro écriture** tant que ce n'est pas N/N.
- [X] T006 Établir la **table des scripts générés courants** (le piège des doublons, voir § Conventions) : lancer `npx tsx scripts/generate-figma.ts`, capturer verbatim la ligne `✔ Emitted figma-sync scripts (dependency order): …` dans `specs/016-canvas-vrai/proofs/00-scripts-courants.md`, en dériver la table `composant → figma-sync/NN-<nom>.js courant`, et vérifier que `git status --short figma-sync/` est **propre** (si le build modifie un script, le dépôt n'était pas à jour : le comprendre avant d'exécuter quoi que ce soit sur le fichier client). Nommer explicitement dans le document les fichiers **périmés** à ne jamais exécuter.
- [X] T007 [P] Relever les **comptes d'ouverture vifs** (jamais recopiés) dans `specs/016-canvas-vrai/proofs/00-ouverture/` : `npm run parity` (sortie + comptage des 89 acquittements ventilés 83/6), `npm run measure:gate` (sortie texte archivée telle quelle — attendu `figma-source=2`), `npm run geometry:gate` (attendu `pass`, 0 invisible), `npm run extract:figma:visual:summary` (état d'époque de `field` et `nav-item` — la ligne de départ de SC-006). **Le compte vif fait foi si l'attendu est contredit ; l'écart est consigné.**
- [X] T008 Checkpoint : sweep constitution complète verte dans le worktree, sortie archivée dans `specs/016-canvas-vrai/proofs/sweep-phase2.txt`.

**Checkpoint**: pont prouvé, périmètre connu, bruit nul, bon script identifié, comptes d'ouverture datés — les stories peuvent démarrer.

---

## Phase 3: User Story 1 - La maquette redevient surveillée (Priority: P1) 🎯 MVP

**Goal**: les 83 références de géométrie sans contrepartie canvas existent comme variables dans la maquette ; l'axe `variables canvas ⟷ tokens` reprend son travail ; un changement de géométrie côté maquette est signalé, classé et remédiable.

**Independent Test**: créer et lier les variables, puis (1) `npm run parity` vert **sans** acquittement de couverture géométrie, et (2) modifier une valeur de géométrie dans la maquette : le différentiel la signale et la classe. Livrable seul, ce lot a déjà de la valeur.

**Note de portée honnête** : US1 se livre en **deux temps** (D2). U1a — la **création** des variables — est ici, et c'est elle qui fait tomber les 83 acquittements (`parity/diff.ts::checkTokens` compare existence et valeurs, jamais les liaisons). U1b — les **liaisons** `setBoundVariable` — s'installe avec la régénération de US3 et se prouve par l'audit de liaison (T062). Lier « à part » maintenant serait défait au prochain amend : ce serait du travail perdu, pas de l'avance.

### Lot U1a — création des variables (cycle de preuve complet, `contracts/proof-cycle.md`)

- [X] T009 [US1] Ouvrir le lot `U1a-variables` : point de restauration `figma_execute` sur `extract/figma/page-parity/bridge/checkpoint.js` avec le libellé `016/U1a-variables/avant` (la regex accepte `\d{3}/` depuis 005), `versionId` consigné dans `specs/016-canvas-vrai/decisions.md` ; relevé de structure VIF (`bridge/scan.js`) juste avant d'écrire.
- [X] T010 [US1] Écrire l'**annonce** dans `specs/016-canvas-vrai/proofs/U1a-variables/annonce.md` AVANT toute écriture : écart attendu **`identique` sur toutes les cibles** — une variable créée ne peint rien. Cette annonce est la plus forte du chantier : tout pixel qui bouge est, par construction, un écart imprévu.
- [X] T011 [US1] Capture AVANT de **toutes** les cibles du périmètre (T004) → `.page-parity/U1a-variables/before/`, puis **vérification des PNG** (non vides, dimensions attendues) — un seul PNG douteux ⇒ STOP, zéro écriture (§X).
- [X] T012 [US1] **Le geste** : exécuter `figma-sync/01-tokens.js` tel quel via `figma_execute` (upsert idempotent — script généré, aucune IA, aucun code nouveau : D1) ; transcrire le script et son rapport dans `specs/016-canvas-vrai/proofs/U1a-variables/gestes.md` (créées / mises à jour, par collection et par mode).
- [X] T013 [US1] Prouver l'**idempotence** (Performance Goals du plan) : ré-exécuter le même script ; attendu **zéro création** au second passage, valeurs/scopes/codeSyntax ré-appliqués à l'identique. Second rapport archivé à côté du premier.
- [X] T014 [US1] Capture APRÈS (même receveur, même nonce, même transport) puis `npm run pages:compare -- --before .page-parity/U1a-variables/before --after .page-parity/U1a-variables/after --out specs/016-canvas-vrai/proofs/U1a-variables` — **verdict attendu : N/N `identical`**, conforme à l'annonce T010. Tout écart ⇒ lot annulé EN ENTIER (§ Procédure d'annulation, T055).

### Reprise de l'axe et chute des acquittements

- [X] T015 [US1] Ré-extraire les clichés via le pont : `parity/extract-figma.plugin.js` exécuté par `figma_execute`, sorties sauvées et **commitées** dans `parity/snapshots/figma-tokens.json` et `parity/snapshots/figma-components.json`.
- [X] T016 [US1] Vérifier sur le cliché frais que les 83 variables **existent avec la bonne valeur** avant de toucher au fichier d'acquittements (l'acquittement se retire parce que le fait a disparu, jamais pour faire tomber un compte) : relevé dans `specs/016-canvas-vrai/proofs/recus/variables-creees.md`, avec le compte vif des `size/*` et `space/*` présents dans la collection **Primitives**, mode **Value**.
- [X] T017 [US1] Retirer de `parity/baseline.json` les **83** entrées `figma-tokens|behind|Primitives/(space|size)/…` — et **elles seules** ; `npm run parity` vert. Compte vif attendu : **89 → 6**. Consigner le nouveau total et sa ventilation (SC-001 ; l'écart avec le « ≈7 » de la spec est nommé, pas lissé).
- [X] T018 [US1] Checkpoint intermédiaire : sweep complète verte (`npm run parity` inclus, sur le cliché frais), sortie archivée dans `specs/016-canvas-vrai/proofs/sweep-u1a.txt`.

### Test de sentinelle (FR-002, SC-002 — `contracts/sentinelle-variables.md`)

- [X] T019 [US1] État de référence de la sentinelle : cliché frais + `npm run parity` vert, zéro acquittement de couverture géométrie — l'état contre lequel la détection sera jugée. Consigné dans `specs/016-canvas-vrai/proofs/recus/sentinelle-variables.md`.
- [X] T020 [US1] **Geste sentinelle** (réversible, consigné) : via le pont, changer la valeur d'une variable de géométrie — `Primitives / size/carte/root` : **363,5 ou 364 selon l'état au moment du test** (relever la valeur vive avant, ne pas la supposer : DW-002 la fait passer à 363,5 en US2) **→ 999**.
- [X] T021 [US1] **Détection** : ré-extraire `parity/snapshots/figma-tokens.json`, lancer `npm run parity`, et vérifier le finding **exact** attendu : `figma-tokens|mismatch|Primitives/size/carte/root [Value]`, `detail` citant les deux valeurs, `proposedPatch { tokenPath, mode, adoptFigmaValue: 999 }`, `remedy` proposant l'adoption dans `tokens/` **ou** la poussée vers Figma. Sortie transcrite **verbatim** dans le reçu — signalé **et** classé **et** remédiable : FR-002 tenu.
- [X] T022 [US1] **Annulation + stabilité ×2** (SC-002) : la variable reprend sa valeur d'origine, ré-extraction, `npm run parity` vert ; puis **deux exécutions consécutives sans aucun geste entre elles**, verdicts byte-comparables (mêmes findings, mêmes comptes) — les deux sorties archivées dans le reçu. Zéro faux signal.
- [X] T023 [US1] Écrire dans le reçu la **limite nommée** (§V, D3) à l'endroit exact où la capacité est revendiquée : un *détachement* de liaison au niveau du nœud (detach + valeur brute tapée) n'est **pas** vu en continu par l'axe tokens ; il est rattrapé par l'audit de liaison (T062) et par toute régénération. Cette phrase est reprise telle quelle au rapport de clôture.
- [X] T024 [US1] Clôture US1 dans `specs/016-canvas-vrai/decisions.md` (annonce ⟷ observé ⟷ verdict ⟷ versionId) + sweep complète verte archivée dans `specs/016-canvas-vrai/proofs/sweep-us1.txt`.

**Checkpoint**: la surveillance géométrie est rebranchée et prouvée — elle protège tout ce qui suit.

---

## Phase 4: User Story 2 - La source cesse de porter ses défauts connus (Priority: P2)

**Goal**: les 10 défauts de la source Figma (DW-002, DW-003 + les 8 du backlog 013) sont corrigés **dans Figma**, chacun avec son reçu re-testable ; leurs contreparties code suivent le chemin des **promotions** au bon semver ; les limites nommées qui n'existaient que pour les tolérer tombent.

**Independent Test**: chaque défaut se corrige et se prouve un par un — annonce écrite de l'écart attendu, correction dans Figma, preuve visuelle avant/après conforme à l'annonce, entrée close à son registre avec reçu.

**Règle de lot** : chaque tâche « lot » ci-dessous déroule le cycle **complet** de `contracts/proof-cycle.md` (checkpoint → scan vif → annonce écrite → capture AVANT de toutes les cibles → vérification PNG → geste → capture APRÈS → `pages:compare` → clôture au journal). L'écriture des étapes n'est pas répétée dans chaque description : **elle n'est jamais optionnelle**.

### A. Le registre et les diagnostics vifs

- [X] T025 [US2] Créer `specs/016-canvas-vrai/registre/defauts-source.json` à la forme de `contracts/registre-source.md` : **10** entrées à `statut: "ouvert"` — `DW-002`, `DW-003` (provenance `specs/013-auditer-fidelite-organismes/proofs/deferred/work.json`) et `B013-1`…`B013-8` (provenance « mémoire projet `figma-cleanup-backlog-013` (2026-07-30) »). Le diagnostic d'origine se recopie dans un champ **de provenance**, jamais dans `diagnosticVif` : ce dernier reste vide jusqu'au relevé de T026.
- [X] T026 [US2] **Re-relever au vif les 10 diagnostics** avant tout geste (D5/D9 — une mémoire de 5 jours n'est pas un fait) : par POSITION via le pont, remplir `diagnosticVif` de chaque entrée (`figmaVersion`, nodeIds, valeurs observées). Cas nominal attendu d'après le registre 013 : DW-002 = 4×364 + 3×32 = 1552 dans un frame `items` de 1550 ; DW-003 = l'instance SectionHeader `2104:2907` figée à 50 px par le master faq alors que son contenu en demande ~83, tout ce qui suit décalé de ~32 px. **Tout défaut qui ne se reproduit plus est clos SANS geste**, avec un reçu qui dit ce qui a été relevé et quand.
- [ ] T027 [US2] **Point de décision owner** (avant tout geste sur le sujet) : `B013-6` — la 2e ligne d'accordéon dépliée dans le master `texte-seo` est-elle une intention (état de démonstration) ou un accident ? Consigner la réponse et sa date dans le registre (`decisionOwnerRequise: true`) et dans `specs/016-canvas-vrai/decisions.md`. Une réponse « intention » clôt l'entrée sans geste, avec son reçu.

### B. Les deux entrées du registre 013

- [ ] T028 [US2] Lot `L-DW002` — **le geste canvas** : les 4 cartes `reassurances` passent de FIXED 364 à **363,5** (décision owner du 2026-08-05 ; conteneur 1550 et gaps 32 **intacts**). L'annonce tranche dans le même document le sort du **plan image intérieur** (`size/carte/reassurance-image`, relevé vif : 364) **depuis la structure re-relevée, jamais supposée** — FILL ⇒ rien à faire ; FIXED ⇒ 363,5 aussi. Écart annoncé côté maquettes : le débordement de 2 px s'éteint (chaque carte perd 0,5 px), la source rejoint ce que le code livré rend déjà — **chiffré depuis le relevé, jamais déclaré nul**. L'annonce énumère aussi, depuis le scan vif, **tous** les porteurs de `size.carte.root` : le master `carte` sur sa page DS **et** chacune de ses instances (la variante `categorie` porte `size.carte.root-categorie` — à confirmer au relevé). Le token est global au master : le geste ne peut pas l'être à moitié, sinon US3 replacera 363,5 partout sans que le lot l'ait annoncé.
- [ ] T029 [US2] Lot `L-DW002` — **la promotion code-side, dans le même lot** : `tokens/primitives.tokens.json`, `size.carte.root` 364 → 363,5 (+ `size.carte.reassurance-image` si T028 l'a tranché ainsi), puis `npm run build`. **Ne jamais écrire le nombre à la main dans un contrat** — la géométrie se porte en tokens (règle du dépôt).
- [ ] T029a [US2] Lot `L-DW002` — **la variable de maquette suit le token, dans le même lot** : ré-exécuter `figma-sync/01-tokens.js` (upsert, régénéré par le build de T029) via `figma_execute`. Attendu : **1 mise à jour** (`size/carte/root` 364 → 363,5), **zéro création**. Annonce : aucun pixel ne bouge (la largeur du master n'est pas encore liée — U1b arrive en US3). Puis ré-extraire `parity/snapshots/figma-tokens.json` et vérifier l'**absence** de finding `figma-tokens|mismatch|Primitives/size/carte/root [Value]`. Sans cette tâche, l'axe rebranché en US1 signale le token comme divergent et `npm run parity` reste rouge jusqu'à la fin de US2.
- [ ] T030 [US2] Lot `L-DW002` — **la preuve côté code** : mesurer le rendu de `ds.carte` avant/après **sur la surface React livrée** — c'est d'elle que parle la décision owner. L'instrument de parité visuelle rend `emit-html`, jamais React (**DW-014-002**, hors périmètre) : s'il sert quand même de mesure, la limite est écrite dans le reçu, elle n'est pas tue. Attendu : **delta 0**, puisque le CSS flex rétrécissait déjà les cartes à 363,5. Un delta non nul contredit la prémisse de la décision owner : le consigner et suspendre avant de continuer. Reçu : `specs/016-canvas-vrai/proofs/recus/DW-002.md`.
- [ ] T031 [US2] Lot `L-DW002` — **re-pins dérivés** : `npm run golden:update` (`evals/golden.json`, diff relu en revue, jamais en réflexe) puis `node scripts/build-plugin-zip.mjs --update-engine-receipt` et `npm run plugin:check` vert (`figma-sync/plugin/engine.receipt.json` dérive à toute édition tokens/contracts/icons — c'est un reçu distinct de golden).
- [ ] T032 [US2] Lot `L-DW003` — **le geste canvas** : l'instance SectionHeader `2104:2907` du master `faq` passe de FIXED 50 à HUG (elle est la seule des 8 instances du census à être FIXED — le fait appartient à l'instance, pas à l'enfant). **Annonce chiffrée obligatoire, sur les deux familles de cibles** : la hauteur de l'en-tête passe ~50 → ~83, et tout ce qui suit sur la maquette FAQ descend de ~32 px — les chiffres exacts viennent du relevé T026, pas de cette phrase.
- [ ] T033 [US2] Lot `L-DW003` — **contrepartie code-side, re-localisée avant d'être écrite** : le pointeur d'origine (`ds.section-header /anatomy/root/literals/height`) **ne résolvait plus** au relevé du 2026-08-04 (la racine ne porte qu'un `gap` ; le « 50 » du fichier était un `line-height`, canal hors population). Re-localiser le littéral porteur ; **s'il n'y en a aucun, l'écrire** : le défaut était purement canvas et sa correction n'a pas de contrepartie contrat. Reçu : `specs/016-canvas-vrai/proofs/recus/DW-003.md`.
- [ ] T034 [US2] Clôture des deux entrées aux registres aval (FR-008) : `specs/014-mesure-juste-triage/proofs/registre/causes.json` reçoit `resolvedBy: "016-canvas-vrai"` sur DW-002 et DW-003 (champ additif — sémantique v2 : l'entrée **reste** au registre et sous C4) ; `specs/013-auditer-fidelite-organismes/proofs/deferred/work.json` les clôt par référence croisée (additif, jamais de réécriture d'historique).
- [ ] T035 [US2] Lire **en direct** `npm run measure:gate` : attendu `figma-source: 2 → 0`, `contract-geometry: 0` inchangé, verdict PASS. **Le compte vif imprimé fait foi si l'attendu est contredit** ; sortie archivée dans `specs/016-canvas-vrai/proofs/measure-gate-post-dw.txt`.

### C. Les 8 défauts du backlog 013

- [ ] T036 [US2] Lot `L-B013-1` — **4 propriétés orphelines** supprimées de leurs masters : `Titre#2103:53` (presentation), `Titre#2108:60` (sav), `Accroche#2104:57` et `Titre#2104:58` (coordonnees). Vérification avant/après par `componentPropertyReferences` vs `componentPropertyDefinitions`. Annonce : **zéro écart visuel** (une propriété que rien ne référence ne peint rien) — donc tout pixel qui bouge annule le lot. Aucune contrepartie contrat (les contrats ne les portaient pas) ⇒ **pas de bump**.
- [ ] T037 [US2] Lot `L-B013-2` — **SectionHeader, alignement** : poser la variante gouvernée d'alignement sur le master `2090:2385`, puis remplacer les 5 surcharges d'instance `textAlignHorizontal=LEFT` par la variante — **instances scannées par POSITION, jamais par nom** (§VIII). Annonce : le rendu ne bouge pas (la variante reproduit l'état actuel de chaque usage) ; seule la gouvernance change.
- [ ] T038 [US2] Promotion `B013-2` : dans `contracts/section-header.contract.json`, la prop `alignement` cesse d'être un axe code-side (`bindings.figma.kind: "NONE"`) et devient un binding **VARIANT** — **mineur** (§VI) ; `npm run build`, re-pins golden + engine.receipt ; la limite nommée « alignement non lié à Figma » tombe, avec sa preuve de non-régression (FR-009).
- [ ] T039 [US2] Lot `L-B013-3` — **SectionHeader, emphase** : les typographies surchargées par instance (hero 54/68/700/blanc ; presentation 32/40 ; texte-seo 24/30 — **valeurs re-relevées en T026**) promues en variantes du master. Annonce : rendu inchangé, gouvernance changée.
- [ ] T040 [US2] Promotion `B013-3` : la prop `emphase` de `contracts/section-header.contract.json` passe en binding **VARIANT** — mineur ; build + re-pins ; limite nommée levée avec preuve de non-régression.
- [ ] T041 [US2] Lot `L-B013-4` — **masters sans propriétés TEXT** : exposer et lier des propriétés Texte sur `hero` (aucune propriété aujourd'hui) et `sav` (paragraphe non lié). Annonce : rendu inchangé ; le texte cesse d'être cuit en dur.
- [ ] T042 [US2] Promotion `B013-4` : bindings TEXT ajoutés aux contrats `hero` et `sav` (**mineur**) ; build + re-pins. La limite nommée « une prop rich-text ne peut pas s'y lier honnêtement, le schéma exige une liaison TEXT native » est levée **ou** re-précisée si le relevé montre qu'elle survit pour une autre raison (l'honnêteté prime sur la clôture).
- [ ] T043 [US2] Lot `L-B013-5` — **coordonnees, row-reverse d'auteur** : remettre les calques dans l'ordre normal (la carte est aujourd'hui visuellement à gauche par inversion). Annonce : **rendu strictement identique** — l'inversion et le ré-ordonnancement se compensent ; tout écart de pixel signale une erreur de geste et annule le lot.
- [ ] T044 [US2] Promotion `B013-5` : ré-ordonner les parts de `contracts/coordonnees.contract.json` pour suivre l'ordre réel des calques (le contrat les avait réordonnées pour refléter le visuel inversé) ; build + re-pins. Re-juger la ligne `instrument=1` de `npm run measure:gate` (la re-classification `instrument` posée par 015 sur ce sujet peut retomber) — **le compte vif décide**, pas cette phrase.
- [ ] T045 [US2] Lot `L-B013-6` — **texte-seo, 2e ligne d'accordéon dépliée** : geste conforme à la décision T027. Si « accident » : replier, annonce chiffrée sur la maquette. Si « intention » : **aucun geste**, l'entrée se clôt avec un reçu qui dit la décision, sa date et son auteur.
- [ ] T046 [US2] Lot `L-B013-7` — **hero, `fills[1]` mort** (`visible: false`) supprimé du master. Annonce : **zéro écart visuel** (un fill invisible ne peint pas) — tout pixel qui bouge annule le lot et révèle que le diagnostic était faux.
- [ ] T047 [US2] Lot `L-B013-8` — **`ds.button`, `outilneNoir`** : renommer la valeur de variante côté canvas (faute pour « outline » venue de Figma). Annonce : rendu inchangé, nom changé.
- [ ] T048 [US2] Promotion `B013-8` : bump **MAJEUR** de `contracts/button.contract.json` (§VI — une valeur d'enum renommée est un breaking change) **et migration, dans le même mouvement, de tous les consommateurs internes du dépôt** (`rg -a "outilneNoir"` sur `contracts/`, `src/`, `examples/`, `evals/`, `playground/`, `catalog/`) ; `npm run build`, re-pins golden + engine.receipt ; `npm run eval` réellement lancé (les fixtures sont hors tsconfig).

### D. Clôture US2

- [ ] T049 [US2] Écrire les **reçus re-testables** des 10 sous `specs/016-canvas-vrai/proofs/recus/` — chacun porte : méthode, relevé vif (avant/après), commande de re-vérification, et le verdict `pages:compare` du lot. Passer les 10 entrées du registre à `statut: "clos"`, avec `recu`, `lotId`, `promotionCodeSide`, `limitesLevees`.
- [ ] T050 [US2] Recenser dans `specs/016-canvas-vrai/proofs/recus/limites-levees.md` **toutes** les limites nommées côté code qui n'existaient que pour tolérer un défaut corrigé (FR-009), chacune avec sa preuve d'absence de régression — et **retirer les phrases périmées là où elles étaient revendiquées** (descriptions de contrats, docs) : une capacité livrée décrite comme absente est l'inverse exact de la Claims Rule. Et **dans l'autre sens** (§II) : toute phrase de capacité écrite en remplacement (« l'alignement est désormais lié à une variante Figma », « le texte de `hero` est une propriété liée ») **nomme l'eval qui la couvre** ; si aucune ne la couvre, la fixture s'écrit AVANT la phrase — jamais l'inverse. Idem pour T038, T040, T042 et pour les phrases de T076.
- [ ] T050a [US2] Ré-extraire les clichés post-US2 (`parity/extract-figma.plugin.js` via `figma_execute`) → `parity/snapshots/{figma-components,figma-tokens}.json` commités, puis `npm run parity` archivé dans `specs/016-canvas-vrai/proofs/parity-post-us2.txt`. **Attendu honnête** : l'axe tokens est propre (T029a) ; les findings `figma|*` nés des promotions (section-header VARIANT, coordonnees réordonné, button MAJEUR…) **restent ouverts** — ils sont l'entrée de T056, pas un échec.
- [ ] T051 [US2] Checkpoint : sweep complète, **avec une seule exception nommée** — les findings canvas issus des promotions US2, listés dans `proofs/parity-post-us2.txt` et repris en entrée de T056 (§V — dit, jamais tu) — + `npm run measure:gate` (attendu `figma-source: 0`) + `npm run geometry:gate` ; sortie archivée dans `specs/016-canvas-vrai/proofs/sweep-us2.txt`.

**Checkpoint**: la source ne porte plus ses défauts connus — on peut régénérer **une** fois, et sur une source juste.

---

## Phase 5: User Story 3 - Le canvas divergent est régénéré sans perte (Priority: P3)

**Goal**: les cibles que le différentiel classe divergentes sont régénérées conformément aux contrats, les liaisons de variables (U1b) s'installent au passage, et **aucune photo client n'est perdue ni intervertie**.

**Independent Test**: sur la liste des cibles divergentes, un cycle complet — capture de l'état antérieur de TOUTES les cibles, régénération, preuve avant/après conforme aux écarts annoncés, rapport photos vérifié composant par composant.

**Dépendance assumée** : US3 **s'exécute après US2** (sa liste de cibles se dérive d'un cliché frais post-corrections). C'est une dépendance d'ordonnancement voulue par la spec — régénérer avant les corrections, ce serait régénérer deux fois — pas une dépendance de conception : le *test* de US3 reste indépendant.

### A. Instruments de contrôle (dépôt — parallélisables, aucun geste canvas)

- [X] T052 [P] [US3] Écrire `specs/016-canvas-vrai/bridge/photos-census.js` (bridge, **LECTURE SEULE**, forme de `contracts/photos-identite.md`) : inventorie par POSITION tout nœud portant un paint `IMAGE` — masters DS **et** instances des 9 maquettes (les overrides d'instance, ex. les ~27 photos de `realisation`, sont la population la plus fragile à une reconstruction d'enfants) — et POSTe au receveur `{ sujet, cheminNoeud, bounds, porteur: "master"|"instance-override", imageHash, octets }`, les octets venant de `figma.getImageByHash(h).getBytesAsync()`. Le **sha256 se calcule côté Node** : le sandbox Figma n'a pas de `crypto`.
- [X] T053 [P] [US3] Écrire `specs/016-canvas-vrai/tools/photos-verify.mts` (tsx) : compare `census-avant.json` ⟷ `census-apres.json` et écrit `specs/016-canvas-vrai/proofs/photos/photos-report.json` à la forme du contrat — verdict par photo `identique` | `intervertie` | `perdue` | `non-verifiable`, `nonReplacees[]` **nommées**, verdict par composant `intact` | `replace-verifie` | `en-souffrance`. Identité = **même `imageHash` à la même position** (l'imageHash Figma adresse le contenu) ; le sha256 des octets est la contre-preuve re-testable hors Figma.
- [X] T054 [P] [US3] Écrire `specs/016-canvas-vrai/bridge/bindings-audit.js` (bridge, **LECTURE SEULE**) : pour chaque master régénéré, relève `boundVariables` sur `width` / `height` / `minWidth` / `minHeight` / `itemSpacing` / `padding*` et les confronte aux specs des scripts courants (`fixedWidth.varName`, `bindings.*`) ; sortie `specs/016-canvas-vrai/proofs/bindings-audit.json` — attendu/observé/**manquant nommé** par master.
- [X] T055 [P] [US3] Écrire d'avance la **procédure d'annulation** dans `specs/016-canvas-vrai/proofs/PROCEDURE-ANNULATION.md` : un écart hors annonce annule le lot **en entier** → restauration **manuelle guidée** par l'historique de versions natif (aucune API de restauration programmatique n'existe — vérifié en 003), re-capture, re-preuve contre les captures d'avant, **cause écrite avant toute reprise**. Jamais de requalification après coup en « bruit acceptable ». L'écrire *avant* d'en avoir besoin est ce qui la rend applicable sous pression.

### B. La liste des cibles et le recensement des photos

- [ ] T056 [US3] Ré-extraire les clichés post-US2 (`parity/extract-figma.plugin.js` via `figma_execute`) et **dériver** la liste des cibles : exactement les findings canvas actifs de `npm run parity`, **plus** les 4 acquittements figma d'avant 015 re-jugés à cette occasion (`figma|behind|Avantage.PiquerayLogo`, `figma|behind|Carte.Bouton`, `figma|behind|SectionHeader.Bouton`, `figma|mismatch|Presentation.Texte (default)`) — régénérables maintenant que les scripts sont amend-capable, **ou** re-acquittés sur décision owner consignée. Écrire `specs/016-canvas-vrai/proofs/cibles.json` (forme `data-model.md` §6 : `contractId`, `componentSetKey`, findings, script courant depuis la table T006, `porteurPhotos`, `resultatAttendu`, `decisionOwner`). **Une cible laissée volontairement divergente est une décision consignée, jamais un oubli.**
- [ ] T056a [US3] Audit de liaison **à blanc**, avant toute régénération : exécuter `bridge/bindings-audit.js` en lecture sur **tous** les masters portant une référence de géométrie → `specs/016-canvas-vrai/proofs/bindings-audit-avant.json`. C'est lui, et non `npm run parity`, qui dimensionne la population U1b : `parity/` ne lit jamais `boundVariables` (0 occurrence — vérifié), donc un master non lié est **invisible au différentiel**. Tout master à liaison manquante rejoint les cibles de T056, même sans finding parity.
- [ ] T057 [US3] **Census photos AVANT — avant le premier lot de régénération, jamais après un pilote** (§X) : exécuter `bridge/photos-census.js` sur tout le périmètre → `specs/016-canvas-vrai/proofs/photos/census-avant.json`. Confronter le compte de composants porteurs aux **9** annoncés par la spec (candidats à confirmer, jamais à décréter : hero, presentation, realisation, sav, coordonnees, member-picture, member-card, product-card, carte). **Tout écart = STOP** et réconciliation écrite avant la première écriture.
- [ ] T058 [US3] Partitionner les cibles en **lots séquentiels à zones disjointes** (écrivain unique — §XI par construction) et écrire l'annonce de chaque lot dans `specs/016-canvas-vrai/proofs/<lot>/annonce.md` : par cible, le rapport amend attendu (`addedVariants` / `editedDefaults` / `preservedImages`…), les liaisons que le lot doit poser (U1b), et l'écart visuel attendu **sur les deux familles de cibles** (master DS + maquettes qui l'instancient).

### C. Les lots de régénération

- [ ] T059 [US3] Exécuter chaque lot `R1…Rn` sous cycle de preuve **complet** (`contracts/proof-cycle.md`) : checkpoint `016/<lot>/avant` → **scan vif juste avant d'écrire** (fichier client vivant : aucun lot ne s'appuie sur un relevé périmé) → capture AVANT de toutes les cibles → vérification PNG → exécution du **script courant** `figma-sync/NN-<composant>.js` (table T006, chemin amend, jamais un numéro deviné) via `figma_execute` → capture APRÈS → `npm run pages:compare` → verdict au journal. Un écart hors annonce ⇒ **T055**.
- [ ] T060 [US3] Après chaque lot porteur de photos : re-census immédiat et `npx tsx specs/016-canvas-vrai/tools/photos-verify.mts` — **le verdict d'identité se prend lot par lot, pas à la fin** : une interversion détectée tard coûte la restauration de tous les lots suivants.
- [ ] T061 [US3] Traiter les photos en souffrance : toute photo `perdue`, `intervertie` ou `non-verifiable` est **nommée** dans `photos-report.json` et son sort réglé (replacement guidé puis re-vérification d'identité) **avant** que son composant soit déclaré régénéré (FR-007/FR-011). `MemberCard` : recensé et vérifié intact comme les autres, mais son plan photo reste **hors contrat** — frontière A5, `docs/FIGMA-CAPABILITY-MATRIX.md` ligne 91 : sa divergence de rendu reste une **limite nommée jusqu'à 017**, pas un échec du chantier.
- [ ] T062 [US3] **Audit de liaison (U1b — la seconde moitié de FR-001)** : exécuter `bridge/bindings-audit.js` sur **tous les masters portant une référence de géométrie** (population de T056a), pas seulement les régénérés → `specs/016-canvas-vrai/proofs/bindings-audit.json`. Attendu **zéro manquant** ; tout manquant est nommé, avec sa cause (script non exécuté / champ non émis / liaison refusée par Figma) — jamais un total silencieux.
- [ ] T063 [US3] Ré-extraction finale des clichés + `npm run parity` : les findings canvas de T056 sont éteints ; chaque acquittement re-jugé est **tombé ou re-acquitté avec sa décision owner**. Sortie archivée dans `specs/016-canvas-vrai/proofs/parity-post-us3.txt`.

### D. Déblocage Field & NavItem (SC-006 — scénario d'acceptation 4 de US3)

- [ ] T064 [US3] **Re-dériver la condition de déblocage au vif avant tout geste** (D8) : relire `extract/figma/visual-parity/triage.ts` (`field` ligne ~172, `receiptId: 'pv-field'` ; `nav-item` ligne ~403, `receiptId: 'pv-nav-item'`), `extract/figma/visual-parity/REPORT.md`, et les portes de dépendance de 013 (formulaire fermé par `ds.field:blocked`, header par `ds.nav-item:divergent` — **reçus d'époque, antérieurs à la re-mesure de 014**). Écrire le diagnostic vif dans `specs/016-canvas-vrai/proofs/recus/deblocage-condition.md` : ce relevé, pas la prose du plan, décide du geste.
- [ ] T065 [US3] **Field — la fixture AVANT le code, ROUGE constaté** (§II, non négociable) : écrire dans `evals/fixtures/` le cas « un Input **slotté** doit remplir la largeur de son conteneur, comme le canvas le fait via `layoutSizingHorizontal: FILL` » ; constater et **archiver le rouge** dans `specs/016-canvas-vrai/proofs/recus/field-rouge.txt` avant de toucher à un émetteur.
- [ ] T066 [US3] Field — corriger l'émetteur (`core/emit-*.ts`) au strict besoin de T065 ; la fixture passe au vert ; **enseigner le cas au mock** `scripts/plugin-engine-mock-figma.mjs` si le défaut ne se voyait que sur le canvas vivant (§VII, discipline de fidélité du mock) ; `core/` reste browser-pure (`node scripts/core-browser-check.mjs`) ; enregistrer le cas dans `evals/run.ts` et lancer réellement `npm run eval`.
- [ ] T067 [US3] Field — les **3 re-pins** qu'une édition d'émetteur dérive (et pas deux) : `npm run golden:update` (`evals/golden.json`), `node scripts/build-plugin-zip.mjs --update-engine-receipt` + `npm run plugin:check`, **et** `npx tsx examples/polaris/generate.ts` → `examples/polaris/figma/*.figma.js`, vérifié par `npx tsx examples/polaris/generate.ts --check`.
- [ ] T068 [US3] Field — régénérer le master concerné (lot de régénération dédié, cycle complet) et re-mesurer ; le sujet mesure sans reçu `blocked` d'époque.
- [ ] T069 [US3] NavItem — **re-mesurer après chantier** et re-confirmer la cause au vif (l'écart d'époque est décrit comme un artefact de rastérisation cross-renderer sur fond sombre, Δ2 px de HUG — **à re-confirmer, pas à recopier**) ; publier un reçu **frais** dans `specs/016-canvas-vrai/proofs/recus/` et mettre à jour `extract/figma/visual-parity/{triage.ts,subjects.ts,baseline.json}` pour que la ligne pointe une cause **vivante**.
- [ ] T070 [US3] Prouver SC-006 : `npm run extract:figma:visual:summary` — les deux sujets **mesurent**, leurs lignes sont attribuées à une cause vivante, et **aucun reçu `blocked`/`fail` d'époque ne subsiste comme dernier mot**. Sortie archivée dans `specs/016-canvas-vrai/proofs/sc-006.txt`. La campagne d'audit 013 n'est **pas** re-déroulée (elle est close ; ses dossiers restent datés).
- [ ] T071 [US3] Checkpoint : sweep constitution complète verte, sortie archivée dans `specs/016-canvas-vrai/proofs/sweep-us3.txt`.

**Checkpoint**: le canvas dit ce que disent les contrats, sans qu'une seule photo client ait bougé.

---

## Phase 6: Polish & clôture (transverse)

**Purpose**: rendre les comptes, dire les limites, et laisser le dépôt lisible pour 017.

- [ ] T072 Re-justifier `parity/baseline.json` **ligne par ligne** (D11) : zéro entrée de couverture géométrie ; chaque ligne restante porte une justification vivante ou disparaît si le chantier l'a rendue obsolète. Consigner le compte vif final et sa ventilation dans `specs/016-canvas-vrai/proofs/recus/baseline-cloture.md` — avec l'écart nommé vis-à-vis du « ≈7 » annoncé par la spec (le vif d'ouverture en montrait 6).
- [ ] T073 Rejouer le **test de sentinelle** sur l'état final (`contracts/sentinelle-variables.md` : « répété en clôture ») et archiver les deux verdicts de stabilité — SC-002 se prouve sur ce que le chantier livre, pas sur un état intermédiaire.
- [ ] T074 [P] Mettre à jour les **mémoires projet** devenues fausses — sinon un défaut clos ressortira vivant à la prochaine session : `figma-cleanup-backlog-013` pointe désormais `specs/016-canvas-vrai/registre/defauts-source.json` (et dit lesquels sont clos) ; `membercard-plan-photo-non-branche` re-confirmé ou corrigé selon T061 ; `sav-wrapper-content-box-defect` re-jugé si le chantier l'a touché.
- [ ] T075 Écrire `specs/016-canvas-vrai/RAPPORT-CLOTURE.md` : les **6 SC** avec leurs comptes **vifs datés** (SC-001 acquittements, SC-002 sentinelle + stabilité, SC-003 100 % des gestes conformes / zéro écart imprévu accepté, SC-004 zéro photo perdue ou intervertie sur les porteurs recensés, SC-005 10/10 défauts clos + `figma-source: 0`, SC-006 Field/NavItem mesurés) ; puis, dans une section **« ce que 016 ne livre pas »**, les limites nommées léguées : le **détachement de liaison non surveillé en continu** (D3), **MemberCard / la frontière image A5** (017), **DW-014-002** (l'instrument de parité visuelle rend `emit-html`, jamais la surface React livrée), **DW-014-003**, les **89 littéraux** de trait/peinture/typographie, les **30/69 pointeurs périmés** du dossier 013. Nommer aussi le **trou de journal** existant plutôt que de le masquer (`MILESTONES.md` s'arrête à la spec 010 ; `docs/handoff/10-history.md` à la spec 002).
- [ ] T076 [P] Mettre à jour la documentation là où la capacité est revendiquée : `docs/handoff/10-history.md` (section 016), `MILESTONES.md` (entrée datée, comptes vifs), `CHANGELOG.md`, `ROADMAP.md` (016 close, 017 devient la suite), et `CLAUDE.md` § Recent Changes. Toute phrase de capacité doit avoir sa preuve dans `proofs/` — sinon elle ne s'écrit pas (§II).
- [ ] T077 Rejouer `specs/016-canvas-vrai/quickstart.md` de bout en bout sur l'état final et **corriger le document là où il ment** (une commande inexacte dans un quickstart est un défaut, pas un détail : 015 y a trouvé `npm run plugin:build`, qui n'existe pas).
- [ ] T078 Sweep de clôture, une seule à la fois, dans le worktree : `npm run build && npm run parity && npm run eval && npm run plugin:check && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && npx tsc -p tsconfig.build.json`, puis `npm run measure:gate` (attendu `figma-source: 0`), `npm run geometry:gate` (`pass`, 0 invisible), `npm run extract:figma:visual:summary`. Sortie archivée dans `specs/016-canvas-vrai/proofs/sweep-cloture.txt`. `npm run eval` imprime le `N/N` vivant — **jamais recopié en prose** ailleurs que dans un journal daté.

---

## Dependencies & Execution Order

### Dépendances de phase

- **Phase 1 (Setup)** : aucune dépendance.
- **Phase 2 (Foundational)** : dépend de Setup — **bloque toutes les stories**. T005 (étalonnage) est un veto absolu : aucun geste canvas de US1/US2/US3 ne peut démarrer sans `N/N identical`.
- **Phase 3 (US1)** : dépend de Foundational. Livrable seul.
- **Phase 4 (US2)** : dépend de Foundational. Techniquement livrable sans US1, mais **l'ordre voulu par la spec place US1 d'abord** — la surveillance rebranchée protège les gestes de US2.
- **Phase 5 (US3)** : dépend de Foundational **et de US2** (la liste de cibles se dérive d'un cliché frais post-corrections) ; elle **complète US1** (les liaisons U1b, T062).
- **Phase 6 (Polish)** : dépend des trois stories.

### Dépendances internes remarquables

- T006 (table des scripts courants) **bloque** T059 : exécuter un script périmé écrirait une spec d'époque dans le fichier client.
- T057 (census photos AVANT) **bloque** le premier lot de T059 — jamais un pilote d'abord (§X).
- T027 (décision owner B013-6) **bloque** T045.
- T026 (diagnostics vifs) **bloque** tous les gestes de US2.
- T065 (fixture rouge) **bloque** T066 (§II — la fixture précède le code, toujours).
- T052–T055 (instruments) **bloquent** T056a, T057, T060, T062 — mais s'écrivent en parallèle, très en amont si on veut.
- T029a (variable alignée sur le token) **bloque** T035 et T051 — sinon l'axe tokens reste en mismatch.
- T050a (cliché post-US2) **bloque** T051 et T056.
- T056a (audit à blanc) **bloque** T058 et T062 — il définit la population U1b.

### Opportunités de parallélisme (rares, et c'est voulu)

Seules 7 tâches portent `[P]` : **T007** (relevés d'ouverture, lecture seule), **T052 / T053 / T054 / T055** (instruments et procédure — fichiers disjoints du dépôt, aucun geste canvas), **T074 / T076** (mémoires et documentation). Tout le reste est séquentiel **par nécessité** : un écrivain unique sur un fichier client vivant, et un cycle de preuve dont l'ordre est le contrôle lui-même.

```bash
# Le seul vrai lot parallèle du chantier — Phase 5.A, avant toute écriture canvas :
Task: "Écrire specs/016-canvas-vrai/bridge/photos-census.js"
Task: "Écrire specs/016-canvas-vrai/tools/photos-verify.mts"
Task: "Écrire specs/016-canvas-vrai/bridge/bindings-audit.js"
Task: "Écrire specs/016-canvas-vrai/proofs/PROCEDURE-ANNULATION.md"
```

---

## Implementation Strategy

### MVP d'abord (US1 seule)

1. Phase 1 (Setup) → 2. Phase 2 (Foundational, **T005 est un veto**) → 3. Phase 3 (US1) → 4. **STOP et VALIDER** : `npm run parity` vert sans acquittement de couverture géométrie, sentinelle détectée puis annulée, stabilité ×2. À ce point, la promesse centrale du produit redevient vraie sur l'axe canvas — c'est livrable, et ça a de la valeur même si le chantier s'arrête là.

### Livraison incrémentale

1. Setup + Foundational → le terrain est prouvé sain.
2. **US1** → la surveillance est rebranchée (MVP) → point de contrôle, sweep verte.
3. **US2** → la source ne ment plus ; `measure:gate` passe `figma-source: 0` → point de contrôle, sweep verte.
4. **US3** → le canvas rejoint les contrats, photos vérifiées à l'identité, liaisons auditées, Field/NavItem débloqués → point de contrôle, sweep verte.
5. **Clôture** → comptes rendus, limites léguées, journaux rattrapés.

Chaque story laisse le dépôt vert et le fichier client livrable au client : c'est la contrainte qui gouverne le découpage en lots, pas la commodité.

### Stratégie d'équipe

**Un seul exécutant sur le canvas.** Le fichier client est vivant et §XI n'est satisfait ici que parce qu'il n'y a pas de parallélisme. Un second contributeur ne peut travailler que sur les tâches `[P]` du dépôt (instruments, documentation) — jamais sur une fenêtre de geste concurrente.

---

## Sweep (chaque checkpoint et la clôture — jamais deux en parallèle)

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
npm run measure:gate      # figma-source : 2 à l'ouverture → 0 à la clôture (le compte vif fait foi)
npm run geometry:gate     # reste pass / 0 invisible
```

En worktree : `npm install` + `npx playwright install chromium` DANS le worktree avant la première sweep (F1).

---

## Notes

- `[P]` = fichiers disjoints, aucune dépendance — et, ici, **aucun geste canvas**.
- `[Story]` relie chaque tâche à sa user story pour la traçabilité.
- Commiter après chaque tâche ou groupe logique ; un lot canvas se commite **avec ses preuves**, jamais sans.
- S'arrêter à n'importe quel checkpoint pour valider une story isolément.
- **Toute vérification empêchée ou incomplète** (capture refusée, pont indisponible, photo non vérifiable) **se dit et se consigne** — jamais comptée en succès silencieux (FR-011, §V).
