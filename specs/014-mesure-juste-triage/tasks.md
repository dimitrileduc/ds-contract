---

description: "Task list for 014-mesure-juste-triage"

---

# Tasks: Mesure juste et triage complet

**Input**: Documents de conception de `/specs/014-mesure-juste-triage/`
**Prérequis**: plan.md, spec.md (requis) ; research.md, data-model.md, contracts/, quickstart.md (chargés)

**Tests**: Les fixtures d'eval ne sont PAS optionnelles ici — la Claims Rule de la constitution (§II, NON-NEGOTIABLE) et FR-002/FR-004 les exigent explicitement, écrites avant l'implémentation qu'elles couvrent. Elles apparaissent comme tâches de première classe dans les phases US1, US2 et Clôture.

**Organisation**: par user story (format imposé), mais l'**ordre d'exécution suit strictement le plan.md § « Ordre imposé (les dépendances font loi) »** — trois exigences s'y conditionnent (T0 avant tout, fixture rouge avant la correction, vocabulaire avant les causes) et cet ordre prime sur un simple tri par priorité P1/P2.

**Pas de worktree** : `plan.md` constate `git worktree list` n'en montre qu'un — la feature s'exécute dans le checkout principal. La clause F1 (constitution, Worktree Gates) est sans objet ; aucune tâche T001-worktree du gabarit n'est reprise.

## Format : `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichiers différents, aucune dépendance non résolue)
- **[Story]** : user story concernée (US1 à US5) — absent en Setup/Fondation/Clôture
- Chemins de fichiers exacts dans chaque description

---

## Phase 1 : Setup

**But** : confirmer que l'environnement est prêt — aucune installation, le dépôt est déjà initialisé.

- [X] T001 Vérifier les prérequis d'exécution : `node --version` ≥ 20, `FIGMA_TOKEN` exporté (lecture seule), cache Playwright non vide (`npx playwright install chromium` seulement si absent) — recherche §3, quickstart « Prérequis »

**Checkpoint** : l'environnement est prêt, rien d'autre ne dépend de cette phase au-delà de sa complétion.

---

## Phase 2 : Fondation (bloque toutes les user stories)

**But** : le T0 (FR-009) et ce dont il dépend — la révision du navigateur doit être enregistrable AVANT la première mesure figée, et l'outil qui produit le registre doit exister avant de pouvoir capturer un « avant ».

**⚠️ CRITIQUE** : aucune user story ne commence avant la fin de cette phase (« Rien d'autre ne commence avant », plan.md § Ordre imposé, item 1).

- [X] T002 Étendre `launchBrowser` dans `extract/figma/visual-parity/render.ts` pour exposer `browser.version()` et le chemin de l'exécutable résolu par `chromiumExecutable()` (D6, FR-014) — point de lancement partagé par les deux instruments
- [X] T003 [P] Enregistrer la révision du navigateur (version + chemin) dans les reçus produits par `extract/figma/organism-audit/harness.ts` (D6 ; dépend de T002)
- [X] T003b Faire écrire à `main()` de `extract/figma/visual-parity/run.ts` le reçu **machine** du rapport, `out/rows.json` (`writeMachineRows`) : une ligne par variante, `rawPct` en **pleine précision**, plus la révision du navigateur. Découvert à la revue : `main()` n'écrivait que du Markdown (`run.ts:2405`) — le `result.json` que la recherche D11 croyait produit (`run.ts:1814`) n'existe que dans le chemin `--campaign`. Sans ce reçu, le registre reparse le tableau à deux décimales et efface toute divergence sous 0,005 % (D8 ; reçu : `accordion-row :: Taille=Petit, Etat=Ferme` vaut 0,0048 % et s'affiche `0.00%`) (dépend de T002)
- [X] T004 Créer `extract/figma/organism-audit/tools/build-registre.mts` (NOUVEAU, D11) : CLI `--phase avant|apres` ; réutilise `auditOrganism` (comme `run-one.mts`) pour re-mesurer les **9 sujets à cas** (vague 1 : coordonnees, devis, hero, presentation, sav, texte-seo ; vague 2 : faq, footer, reassurances) dans `extract/figma/organism-audit/out/registre-scratch/<phase>/` — **jamais** dans `specs/013-…/proofs/` (déjà gitignoré, `.gitignore:37`). Lit `extract/figma/visual-parity/out/rows.json` (reçu machine frais) et, pour la colonne « committed » de la parité, `git show HEAD:extract/figma/visual-parity/REPORT.md` (2 décimales, nommé comme tel). **Fail-closed** : refus nommé si le reçu de parité manque ou est trop vieux (`visual-parity-not-remeasured`), si un organisme échoue, si les deux instruments n'ont pas tourné sur le même navigateur, ou si un écart n'a pas d'attribution. En `--phase apres`, relit `avant.json` pour porter `before` et `after` dans le même document, `delta = 0` quand rien n'a bougé (D11, D13 ; dépend de T002, T003, T003b)
- [X] T005 Exécuter le T0, **dans cet ordre** : `npm run extract:figma:visual` (produit `out/rows.json`), puis `npx tsx extract/figma/organism-audit/tools/build-campaign.mts --verify` (contrôle de cohérence de 013 — ne remesure rien), puis `npx tsx extract/figma/organism-audit/tools/build-registre.mts --phase avant` → `proofs/registre/avant.json` ; renseigner `proofs/registre/attributions.json` pour tout écart constaté, l'outil refusant de conclure sinon (FR-009 — condition de démarrage, pas de clôture ; dépend de T004)

**Checkpoint** : `proofs/registre/avant.json` existe, `refusals` est vide, il porte la révision du navigateur (la **même** pour les deux instruments) et tout écart avec le dépôt est attribué. Les user stories peuvent commencer.

---

## Phase 3 : User Story 1 - Chaque chiffre publié est une mesure (Priority: P1)

**Goal** : la référence visuelle de chaque cas audité est le node du cas — jamais le set qui le contient — pour que le chiffre de reassurances (39,78 % aujourd'hui) soit une mesure de fidélité, pas un artefact d'instrument.

**Independent Test** : un réviseur ouvre le dossier reassurances re-rendu, vérifie que la référence photographiée est le node du cas, que le chiffre publié en découle, et que l'ancien chiffre reste consultable avec sa cause (« défaut d'instrument ») nommée.

- [X] T006 [P] [US1] Écrire la fixture rouge `evals/fixtures/organism-audit-case-reference-check.ts` (D3, data-only) : l'état antérieur (les 5 dérivées = set) exigeant un refus nommé, l'état corrigé (les 5 = cas) exigeant un accord, **les 5 défauts partiels** (une seule dérivée laissée sur le set doit encore être refusée, en nommant exactement laquelle) et **les 5 dérivées absentes** (refusées sous un code distinct — un contrôle qui confondrait « mauvais node » et « absente » rapporterait « mauvais node : undefined », qui ne nomme rien) ; le vocabulaire de refus (`reference-not-case-node`, `reference-provenance-incomplete`) est vérifié valeur pour valeur contre `contracts/measure-gate.interface.md` §3. Confirmer qu'elle échoue puisque `reference.ts` n'existe pas encore — une fixture verte ici serait un défaut de la fixture (quickstart Étape 1)
- [X] T007 [US1] Implémenter `extract/figma/organism-audit/reference.ts` (NOUVEAU) : `resolveCaseReference(subject, case)` + `checkReferenceProvenance`, purs (D2) ; la fixture T006 passe au vert (dépend de T006)
- [X] T008 [US1] Basculer les 5 dérivées de `extract/figma/organism-audit/pilot.ts` sur le node du cas — capture (`:234-241`), valeurs du node (`:223-232`), largeur imposée (`:291-294`), cadre d'alignement (`:302-308`), provenance des reçus (`:505`) — et émettre `referenceProvenance` ; l'ancre du contrat (`run.ts:199`) et le contrôle de version de fichier (`pilot.ts:211-222`) restent sur le set, ce sont des propriétés du contrat/fichier, pas de la mesure (D4 ; dépend de T007)
- [X] T009 [P] [US1] Publier `referenceProvenance` et la révision du navigateur dans le dossier produit par `extract/figma/organism-audit/report.ts` (dépend de T008)
- [X] T010 [P] [US1] Basculer `extract/figma/organism-audit/tools/fetch-census.mts` sur le node du cas (paramétré par vague, pas par sujet — la signature CLI ne change pas). **Le census ramène désormais le cas ET le set**, dédupliqués : le cas devient la cible primaire (celle qu'affiche l'outil et dont la version est vérifiée), le set reste caché parce que c'est lui qui porte les faits de définition de propriété du COMPONENT_SET et les comparaisons délibérées avec une variante sœur. C'est ce qui rend possible le recoupement par union de T011. Un sujet sans cas (vague 3) n'a rien à basculer : son seul node connu reste le set
- [X] T011 [US1] Basculer `censusNodeIds(subject.figmaSetNodeId)` sur le node du cas dans `extract/figma/organism-audit/tools/verify-declarations.mts` — cible affichée et version vérifiée sur le cas, mais **contrôle d'existence contre l'union cas ∪ set** : certains faits citent légitimement un node hors du cas (définitions de propriété du set, comparaison avec une variante sœur — `carte-largeur-cinq-cartes`, `sample-entree-orpheline`), et le cas étant un sous-arbre du set l'union n'admet jamais une hallucination que le cas seul aurait rejetée. La classe d'erreur visée est un node **absent du fichier**, pas un node réel hors du cas mesuré (recherche D4, raffinement) ; sans argument, vérifie tout le manifeste (dépend de T010)
- [X] T012 [US1] Re-relever les 44 faits de reassurances sur `2114:3619` : `npx tsx extract/figma/organism-audit/tools/fetch-census.mts 2 --refresh`, puis mettre à jour `specs/013-auditer-fidelite-organismes/proofs/declarations/reassurances.json` (dépend de T008, T011)
- [X] T013 [US1] Vérifier `verify-declarations.mts` vert (sans argument), puis fusionner via `merge-declarations.mts` dans `specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json` — un seul écrivain sur le manifeste (dépend de T012)
- [X] T014 [US1] Re-rendre le dossier reassurances (`npx tsx extract/figma/organism-audit/tools/run-one.mts reassurances`), puis la synthèse de campagne (`build-campaign.mts` puis `--verify`, code 2 si le Markdown s'écarte du JSON) ; ancien chiffre (39,78 %) et comptes de faits antérieurs restent consultables (FR-003 ; dépend de T013)
- [X] T015 [US1] Vérifier par `jq` que `referenceProvenance.caseNodeId == "2114:3619"` couvre les **5** dérivées dans le `metadata.json` de reassurances (dépend de T014)

**Checkpoint** : le dossier reassurances est re-rendu depuis le node du cas (39,78437 % → **3,29889 %**, contre une valeur de contrôle de ~3,30 % ; référence 3104×4902 → 3104×1462) ; la fixture FR-002 est verte et reste en place ; les 8 autres organismes à cas n'ont, par construction, subi aucune bascule de code qui les affecte (vérifié en Phase 7). **Leur `referenceProvenance` ne vient PAS de leur dossier** — ils sont antérieurs à la correction et D10 interdit de les re-rendre : elle transite par `apres.json` (T034), dont la re-mesure tourne sur le pilote corrigé.

---

## Phase 4 : User Story 2 - Zéro ligne sans cause (Priority: P1)

**Goal** : chacune des quatre lignes UNTRIAGED (member-picture ×2, section-header Avec CTA, google-reviews) reçoit une cause localisée et prouvée — et, la dispense à 3 % tombant, les 13 lignes aujourd'hui à `—` **plus les 9 lignes divergentes de l'audit d'organismes** (FR-011 porte la population sur les deux instruments), pour que le chantier géométrie (015) soit dimensionné sur des faits.

**Independent Test** : pour chaque ligne anciennement UNTRIAGED, un réviseur retrouve dans le rapport la cause attribuée, la preuve qui la soutient (mesure, référence, justification), et vérifie qu'aucune correction n'a été appliquée au passage.

- [X] T017 [US2] Écrire la fixture `evals/fixtures/triage-vocabulary-check.ts` (data-only) : les **5** propriétés du contrat — six entrées, libellés deux à deux distincts (bijection), toute règle de `TRIAGE` a un `class` membre de `CauseSlug`, toute valeur publiée est connue de `CAUSE_LABELS`, aucun slug retiré (`capture-gap`, `renderer`, `harness`, `design`) ne subsiste dans une surface publiée (contracts/cause-vocabulary.md §1) ; **confirmer qu'elle échoue** — ni `CauseSlug` ni `CAUSE_LABELS` n'existent encore, et une fixture verte ici serait un défaut de la fixture, pas une bonne nouvelle (constitution §II : fixture → eval → claim, dans cet ordre)
- [X] T016 [US2] Étendre `CauseClass` de cinq à **six** valeurs (`contract-geometry` nouveau ; `capture-gap` coupé en `image-boundary`/`instrument` ; `renderer`→`rendering` ; `design`→`figma-source` ; `harness`→`instrument`) et publier la bijection `CAUSE_LABELS` dans `extract/figma/visual-parity/triage.ts` ; la fixture T017 passe au vert (D1, contracts/cause-vocabulary.md §1 ; dépend de T017)
- [X] T018 [US2] Re-classer les **22 règles vivantes** de `TRIAGE` selon `contracts/cause-vocabulary.md` §4 (capture-gap → `image-boundary` pour la frontière image A5, → `instrument` pour les limites de canal legacy ; `renderer` → `rendering` ; `harness` → `instrument`) ; **déplacer les 3 règles mortes** (`heading`, `switch`, `badge` — contrats supprimés à la reconversion) dans une constante exportée `RETIRED_RULES` de `triage.ts`, conservant sujet, classe d'origine et motif de la mort, publiée dans le rapport de clôture — elles quittent `TRIAGE` (sans quoi la propriété 3 de la fixture T017 échoue, une règle morte n'ayant pas de slug) mais ne disparaissent pas (§4.2) ; re-mesurer la règle `carte` avant de la classer, sa cause écrite mélangeant deux choses (§4.1) (dépend de T016)
- [X] T019 [US2] Supprimer la dispense `TRIAGE_LINE_PCT` de `extract/figma/visual-parity/run.ts` — **les 7 sites, relevés** : `:122` (la constante), `:2053` (le tag `[UNTRIAGED]` du journal d'exécution), `:2260` (`causeCell()`), `:2269` (la liste `untriaged` publiée dans le bloc Distribution), `:2290`, `:2386`, `:2388` (prose, compte publié et bucket « 3–10 % by class »). Une suppression partielle ferait publier au rapport un compte d'UNTRIAGED encore conditionné au seuil pendant que `causeCell` ne l'est plus. La lecture porte sur le score brut strictement positif, jamais sur la chaîne formatée à deux décimales (D8, FR-015) ; les seuils de réussite/échec, les régions déclarées et les critères de preuve restent intacts
- [X] T020 [P] [US2] Publier les libellés `CAUSE_LABELS` et la révision du navigateur dans le rapport produit par `extract/figma/visual-parity/run.ts` (dépend de T016)
- [X] T020b [P] [US2] Mettre à jour `site/src/pages/how.ts:559`, qui publie la table de triage comme « engine / capture-gap / renderer / harness / design » : après T016 ce sont cinq valeurs publiables que l'instrument ne connaît plus — l'« état refusé » que FR-004 nomme mot pour mot. Vérifier `npm run site:build` (dépend de T016)
- [X] T021 [US2] Régénérer `extract/figma/visual-parity/REPORT.md` (`npm run extract:figma:visual`) — jamais édité à la main (dépend de T018, T019, T020)
- [X] T022 [US2] Attribuer une cause aux 4 lignes UNTRIAGED (member-picture Etat=Defaut 64,48 % ; member-picture Etat=Survol 58,33 % ; section-header Avec CTA 8,78 % ; google-reviews 3,32 %) **en ajoutant une règle dans `extract/figma/visual-parity/triage.ts`** portant `class` ∈ `CauseSlug`, `cause` (une ligne, preuve nommée) et `receiptId` ; publier le reçu de chacune dans `specs/014-mesure-juste-triage/proofs/recus/<id>.json` (schéma receipts.schema.md §3) — falsifier les pistes de recherche §2, ne pas les recopier comme conclusions (dépend de T021)
- [X] T023 [US2] Idem pour les 13 lignes désormais causées par la suppression de la dispense (footer-column, section-header Standard, avantage, review-card, nav-item, carousel-controls, input, accordion-row ×4, textarea, copyright) : une règle avec `receiptId` **et** un reçu par ligne — une ligne exactement à 0 ne porte aucune cause, ce n'est pas une dispense (D8 ; dépend de T021)
- [X] T023b [US2] Attribuer une cause aux **9 lignes divergentes de l'audit d'organismes** dans `specs/014-mesure-juste-triage/proofs/registre/causes.json` § `organismLines` (D12) : hero 27,83 % · faq 3,67 % · texte-seo 1,84 % · footer 1,04 % · sav 0,67 % · coordonnees 0,52 % · presentation 0,35 % · devis 0,14 % · reassurances (chiffre re-mesuré après T014). Chaque entrée porte `key`, `rawPct`, `cause` ∈ les six valeurs, `receiptId`, et publie son reçu dans `proofs/recus/` ; aucun dossier de `specs/013-…/proofs/` n'est modifié (D10). **La cause de reassurances est celle du résidu re-mesuré, PAS « défaut d'instrument »** : l'instrument expliquait les 39,78 %, il n'explique pas ce qui reste (dépend de T014, T016)
- [X] T023d [US2] Régénérer `REPORT.md` et `out/rows.json` (`npm run extract:figma:visual`) **après** l'attribution des causes — sans quoi le rapport publie encore ses lignes UNTRIAGED et le checkpoint de cette phase n'est pas vérifiable (dépend de T022, T023)
- [X] T024 [US2] Vérifier qu'aucun contrat, token ou sortie générée n'a été modifié par le triage : `git diff --name-only HEAD | grep -E '^(contracts/|tokens/|src/components/|figma-sync/|catalog/)'` doit être vide — **`HEAD`, pas l'arbre de travail seul** : sans lui un changement déjà stagé ou commité reste invisible (FR-005 ; dépend de T022, T023, T023b, T023d)

**Checkpoint** : 0 ligne UNTRIAGED **sur les deux instruments** — les lignes du rapport de parité (régénéré) ET les 9 lignes d'organismes portent une cause du vocabulaire à six valeurs, chacune avec son reçu ; aucune ligne triée `contract-geometry`/`image-boundary`/`figma-source` n'a été corrigée.

---

## Phase 5 : User Story 3 - Aucun composant sans chiffre (Priority: P2)

**Goal** : `select` — le seul des 34 composants générés sans mesure — rejoint la parité visuelle avec les mêmes critères que les 33 autres.

**Independent Test** : la ligne `select` apparaît dans le rapport avec un chiffre mesuré, ses régions et sa cause si elle diverge, produite par les mêmes critères (régions déclarées, seuils, preuve probante) que les autres lignes ; l'exclusion qui l'écartait a disparu du harnais avec le reçu de son infirmation.

> Indépendante de US1/US2 au-delà de la Fondation — peut démarrer dès la fin de la Phase 2 (plan.md, Ordre imposé, item 6).

- [X] T025 [P] [US3] Retirer le bloc de commentaire d'exclusion (`subjects.ts:236-247`) et ajouter l'entrée `select` dans `extract/figma/visual-parity/subjects.ts` (master `2053:1249`, `renderWidth: 280` comme Input/Textarea)
- [X] T026 [US3] Produire le reçu d'infirmation `specs/014-mesure-juste-triage/proofs/recus/select-exclusion.json` : rendre Select dans le harnais, observer si le texte de l'option s'affiche réellement (la prémisse écrite dit que non) (dépend de T025)
- [X] T027 [US3] Mesurer select : `npm run extract:figma:visual -- select` (filtre positionnel) puis le rapport complet ; vérifier `grep -c '^| select ' REPORT.md` ≥ 1, mêmes régions/seuils/preuve probante que les 33 autres, sans assouplissement (dépend de T025, T026)

**Checkpoint** : 34/34 composants générés portent une ligne de mesure.

---

## Phase 6 : User Story 5 - Aucune cause sans preuve re-testée (Priority: P1)

**Goal** : toute décision qui retire ou requalifie une mesure — l'exclusion de select, une cause de ligne divergente, un blocage d'organisme — est re-testée et ne survit que si un reçu reproductible la soutient.

**Independent Test** : un réviseur prend n'importe quelle cause publiée, retrouve son reçu daté, le rejoue et obtient le même verdict ; il vérifie qu'aucune cause ne subsiste sur la seule foi d'une décision antérieure.

> Indépendante de US1-US3 au-delà de la Fondation, mais son étape de re-classement DW (T032) a besoin du vocabulaire de US2 (T016) — dépendance croisée assumée par plan.md, Ordre imposé, item 7.

- [X] T028 [P] [US5] Publier le reçu re-testant `button-with-icons :: Property 1=Outilne noir` (skipped) — ré-exécuter, lire le motif d'axe affirmé (« axis has no contract binding »)
- [X] T029 [P] [US5] Publier le reçu re-testant `piqueray-logo :: Couleur=Default/Blanc` (refused) — vérifier l'existence de l'asset vectoriel déclaré manquant
- [X] T030 [US5] Publier un reçu par règle **héritée** re-classée (25 reçus : les 22 vivantes + les 3 déplacées en `RETIRED_RULES`) — confronter la cause écrite au relevé. Les causes **neuves** portent leur propre reçu, produit par la mesure qui les établit (T022/T023/T023b) : re-test d'un côté, mesure de l'autre (dépend de T018)
- [X] T031 [US5] Rejouer `npx tsx extract/figma/organism-audit/run.ts --campaign specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json --check-dependencies --check` sur les 3 organismes bloqués (equipe, formulaire, header) ; consigner si l'épinglage périmé (`expectedFigmaFileVersion: 2381568261081914456` vs la campagne à `2381581871281042338`) explique tout ou partie du blocage — le constat va à 016, le blocage n'est **pas** levé ici
- [X] T032 [US5] Re-classer les 6 entrées DW dans le vocabulaire à six valeurs → `specs/014-mesure-juste-triage/proofs/registre/causes.json` (référence les identifiants DW ; `specs/013-…/proofs/deferred/work.json` n'est **pas** modifié, D10) (dépend de T016, T030)
- [X] T033 [US5] Vérifier par `jq` qu'aucun reçu n'est sans date ni méthode rejouable (`all(.date != null and .method != null)` sur `proofs/recus/*.json`) **et que tout `receiptId` cité — par une règle de `TRIAGE` comme par une entrée de `causes.json` — résout un reçu existant** (dépend de T022, T023, T023b, T026, T028, T029, T030, T031, T032)

**Checkpoint** : chaque décision affirmée du périmètre (data-model §5) porte un reçu daté et rejouable ; tout blocage jugé infondé est consigné pour 016, pas levé.

---

## Phase 7 : User Story 4 - Toute évolution de chiffre est attribuable (Priority: P1)

**Goal** : les résultats initiaux restent consultables à côté des résultats finaux, pour que toute variation de chiffre soit attribuable à sa cause exacte.

**Independent Test** : un réviseur compare l'état avant/après de chaque ligne dont le chiffre a changé et trouve la cause du changement ; il vérifie qu'aucune ligne n'a changé sans cause.

> Dépend de TOUTES les autres user stories : `apres.json` ne peut être figé qu'une fois les deux instruments stables — `select` (US3) doit exister comme sujet, sans quoi il manquerait au registre (D11).

- [X] T033b [US4] Régénérer une dernière fois la parité visuelle complète (`npm run extract:figma:visual` — `select` inclus, toutes causes posées) : **c'est cette exécution qui alimente `apres.json`**, puisque T034 lit `out/rows.json`, périmé sinon (dépend de T023d, T027, T033)
- [X] T034 [US4] Construire `specs/014-mesure-juste-triage/proofs/registre/apres.json` (`npx tsx extract/figma/organism-audit/tools/build-registre.mts --phase apres`) — **une seule fois**, une fois US1+US2+US3+US5 stables. Sa re-mesure tourne sur le pilote corrigé : elle porte la `referenceProvenance` des **neuf** organismes et applique C3 à la source (refus `reference-provenance-missing` / `reference-not-case-node`). C'est par là que le gate vérifie les huit dossiers que D10 interdit de re-rendre (dépend de T014, T024, T027, T033, T033b)
- [X] T035 [US4] Vérifier par `jq` l'invariance des 8 organismes à cas hors reassurances (`delta.rawPct == 0 and delta.facts == null`) (dépend de T034)
- [X] T036 [US4] Vérifier par `jq` qu'aucun chiffre de parité visuelle n'a bougé sans attribution hors reassurances (dépend de T034)
- [X] T037 [US4] Vérifier que l'écart de reassurances porte l'attribution « défaut d'instrument DW-006 », jamais présenté comme un progrès de fidélité (SC-004 ; dépend de T034)
- [X] T038 [US4] Rendre `specs/014-mesure-juste-triage/proofs/registre/REGISTRE.md` depuis `avant.json`/`apres.json`/`causes.json` — jamais écrit à la main (dépend de T035, T036, T037)

**Checkpoint** : hors reassurances, 0 chiffre publié ne varie entre l'état initial et l'état final ; toute variation constatée porte une attribution.

---

## Phase 8 : Clôture (transverse — FR-007, FR-011)

**But** : le contrôle fail-closed qui conditionne la fin de la fonctionnalité, et la balayée des portes du dépôt. Transverse aux cinq user stories — aucune ne le « possède » seule, ce qui explique l'absence de label `[Story]` (règle du gabarit : Polish/Clôture ne porte pas de label).

- [X] T041 Écrire la fixture `evals/fixtures/measure-gate-policy-check.ts` (data-only) : la politique des 4 conditions et les codes de refus nommés de `contracts/measure-gate.interface.md` §3 ; **confirmer qu'elle échoue** — `gate.ts` n'existe pas encore (constitution §II)
- [X] T039 Implémenter `extract/figma/measure-gate/gate.ts` (NOUVEAU) : évaluateur **pur** des 4 conditions de FR-007 (C1 zéro ligne sans cause **sur les deux instruments** — causes lues dans `triage.ts` pour la parité et dans `causes.json` § `organismLines` pour les organismes, D12 ; C2 34/34 composants mesurés ; C3 référence = node du cas sur les 5 dérivées ; C4 toute cause a un reçu re-testé) — aucune E/S, aucun réseau, aucun navigateur ; la fixture T041 passe au vert (D7 ; dépend de T041)
- [X] T040 Implémenter `extract/figma/measure-gate/run.ts` (NOUVEAU) : CLI mince qui lit les artefacts et applique le code de sortie (0 pass / 1 fail / 2 blocked) (dépend de T039)
- [X] T042 Ajouter le script `measure:gate` dans `package.json` (dépend de T040)
- [X] T043 Enregistrer les 3 nouvelles fixtures (T006, T017, T041) dans `evals/run.ts` (dépend de T006, T017, T041)
- [X] T044 Exécuter `npm run measure:gate` : à ce point de la séquence les 4 conditions sont tenues, il doit donc **sortir en code 0** — c'est la fixture T041 qui prouve la politique fail-closed, pas cette exécution (dépend de T015, T023b, T024, T027, T032, T038, T042, T043)
- [X] T045 Balayée complète des portes du dépôt : `npm run build && npm run parity && npm run eval && npm run plugin:check && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && npx tsc -p tsconfig.build.json` (dépend de T044)
- [X] T046 Publier `specs/014-mesure-juste-triage/proofs/RAPPORT-CLOTURE.md` avec le compte par cause sur les six valeurs (`counts.byCause` du gate — sortie dimensionnante FR-011 pour 015/`contract-geometry` et 016/`figma-source`), agrégé sur les **deux** instruments et sur les entrées DW re-classées ; le compte est celui que le gate rend en direct, jamais figé en prose. Y figurent aussi les 3 règles de `RETIRED_RULES` (causes qui ne peuvent plus rien causer, §4.2) (dépend de T045)

**Checkpoint** : `npm run measure:gate` sort en code 0 ; les sept portes génériques du dépôt sont vertes ; le rapport de clôture publie le compte par cause en direct.

---

## Dépendances & ordre d'exécution

### Dépendances de phase

- **Setup (Phase 1)** : aucune dépendance.
- **Fondation (Phase 2)** : dépend de Setup — **bloque toutes les user stories** (T0 avant tout, plan.md Ordre imposé item 1).
- **US1 (Phase 3)** : dépend de la Fondation. Doit être terminée avant que US4 (Phase 7) ne puisse figer `apres.json`.
- **US2 (Phase 4)** : dépend de la Fondation, **et de US1/T014 pour T023b** (la cause de reassurances se lit sur le chiffre re-mesuré). Le vocabulaire (T016) et le re-classement des règles (T018) sont des pré-requis croisés pour US5.
- **US3 (Phase 5)** : dépend de la Fondation **seulement** — parallélisable avec US1/US2/US5 (plan.md, item 6).
- **US5 (Phase 6)** : dépend de la Fondation, de **T016** (vocabulaire → T032), de **T018** (règles re-classées → T030) et de **T022/T023/T023b** (les reçus des causes neuves, que T033 vérifie). Seuls T028, T029 et T031 sont réellement parallélisables avec US1/US3 dès la Fondation.
- **US4 (Phase 7)** : dépend de US1 **+** US2 **+** US3 **+** US5 entièrement terminées — c'est la seule phase qui ne peut pas se paralléliser avec les autres user stories, par construction (plan.md, item 8).
- **Clôture (Phase 8)** : dépend de US4 pour le registre, et de chaque user story pour ses propres contrôles (T015, T024, T027, T032).

### Graphe simplifié

```
Setup → Fondation ─┬─→ US1 ──────────────┐
                    ├─→ US2 ──────────────┼─→ US4 → Clôture
                    ├─→ US3 ──────────────┤
                    └─→ US5 (dépend aussi de US2/T016) ┘
```

### Parallélisme au sein de chaque story

- **US1** : T009 et T010 sont parallélisables entre elles une fois T008 posé pour T009 (T010 ne dépend de rien dans US1).
- **US2** : T017 **précède** T016 (fixture rouge d'abord, constitution §II) ; T020 et T020b sont ensuite parallélisables entre elles (fichiers différents), toutes deux après T016.
- **US3** : entièrement séquentielle après T025 (peu de tâches, peu d'intérêt à paralléliser).
- **US5** : T028 et T029 sont parallélisables dès la Fondation terminée (aucune dépendance entre elles ni sur T016/T018).
- **Clôture** : T041 **précède** T039 (fixture rouge d'abord, constitution §II) ; T043 attend les 3 fixtures des autres phases.

---

## Exemple d'exécution parallèle : Fondation

```bash
# T003 et T004 après T002 (tous deux consomment son exposition de version/chemin)
Task: "Enregistrer la révision du navigateur dans harness.ts"
Task: "Créer build-registre.mts"
```

## Exemple d'exécution parallèle : User Story 5

```bash
# T028 et T029 n'ont aucune dépendance croisée
Task: "Publier le reçu re-testant button-with-icons skipped"
Task: "Publier le reçu re-testant piqueray-logo refused"
```

---

## Stratégie d'implémentation

### Pas de MVP au sens classique

Cette fonctionnalité n'a pas d'incrément « livrable seul » au sens produit habituel : `measure:gate` (Phase 8) est **fail-closed** sur les quatre conditions de FR-007 réunies — il refuse tant qu'une seule user story reste incomplète, par construction (FR-007, SC-002, SC-006, SC-008 se recoupent). Chaque phase a néanmoins son propre **test indépendant**, vérifiable en cours de route (voir chaque « Independent Test » ci-dessus) — utile pour valider le travail au fur et à mesure, pas pour déclarer la fonctionnalité close en avance.

### Livraison incrémentale recommandée

1. Setup + Fondation → le T0 est figé, rien ne peut plus se tromper de baseline.
2. US1 (DW-006) → valider indépendamment (dossier reassurances re-rendu, fixture FR-002 verte).
3. US2 (triage) + US3 (select) + US5 (re-tests) → en parallèle si plusieurs agents/développeurs, sinon dans cet ordre — chacune validable indépendamment via son Independent Test. Attention : US5 n'est libre que sur T028/T029/T031 ; T030 attend T018 et T033 attend les reçus de T022/T023/T023b.
4. US4 (registre après) → seulement une fois 1-3 terminées.
5. Clôture → `measure:gate` vert, balayée complète, rapport publié.

### Stratégie multi-agents

Avec plusieurs exécutants disponibles après la Fondation :
- Un agent démarre **US2** en premier : T017 puis T016 ouvrent le vocabulaire, dont dépendent le re-classement des règles (T018), le re-classement DW de US5 (T032) et la mise à jour du site (T020b)
- Agent A : US1 (DW-006 — le chemin le plus long, fixture + pilote + re-relevé + re-rendu) ; il débloque T023b, qui a besoin du chiffre re-mesuré de reassurances
- Agent B : US3 (select — le plus court, aucune dépendance hors Fondation)
- Agent C : US5, mais seulement ses trois items libres (T028, T029, T031) ; T030 attend T018 et T033 attend les reçus des causes neuves (T022/T023/T023b)

---

## Notes

- **Piège du dépôt, relevé à la revue des phases 1-2** : `evals/fixtures` est **exclu du tsconfig** (`tsconfig.json`, aux côtés de `evals/adherence` et `evals/.scratch`). Changer la signature d'un module qu'elles importent — c'est le cas de `launchBrowser()` en T002 — laisse `npx tsc --noEmit` **vert** et casse `npm run eval` au runtime. Chercher les appelants avec `rg` avant de conclure. Reçu : 6 fichiers faisaient `const browser = await launchBrowser()`, corrigés en `const { browser } = …`. **Second angle mort au même endroit** : sur ces 6, seuls 2 sont des cas enregistrés (`icon-glyph-geometry`, `tab-external-roving-context`) — `nav-tab-campaign-targeted-recheck`, `carte-member-card-targeted-recheck` et `field-campaign-targeted-recheck` ne sont référencés nulle part et ne tournent jamais ; un `N/N` vert ne prouve rien sur eux.
- [P] = fichiers différents, aucune dépendance non résolue.
- [Story] trace chaque tâche vers sa user story ; absent en Setup/Fondation/Clôture par construction du gabarit.
- Un triage ne répare pas (FR-005) : aucune tâche de US2/US5 ne touche `contracts/`, `tokens/`, `src/components/`, `figma-sync/` ou `catalog/` — seule T024 le vérifie explicitement, mais c'est vrai de bout en bout.
- Le compte exact de lignes à causer (4 UNTRIAGED + 13 à `—` côté parité, 9 côté organismes) est un **plancher** mesuré à la tête de branche (`f06f942`), pas une cible figée — une ligne à 0,00 % affiché peut valoir >0 au nombre vif (D8) ; T022/T023/T023b comptent en direct comme le fait le gate.
- La fixture T006 est data-only et ne teste QUE `checkReferenceProvenance` (T007) — elle ne peut pas, à elle seule, prouver que `pilot.ts` est corrigé en production : c'est T015 (contrôle live sur `metadata.json`) et T039/C3 (gate) qui portent cette preuve-là.
