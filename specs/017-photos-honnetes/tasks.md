# Tasks: Photos honnêtes (017)

**Input**: Documents de conception de `/specs/017-photos-honnetes/`
**Prerequisites**: [plan.md](plan.md) (requis), [spec.md](spec.md) (user stories), [research.md](research.md) (D1–D17), [data-model.md](data-model.md) (9 entités), [contracts/](contracts/) (3 interfaces), [quickstart.md](quickstart.md) (l'ordre d'exécution)

**Tests** : **obligatoires et non optionnels ici.** FR-014 et la constitution §II imposent l'ordre *fixture → eval → claim* : le contrôle adverse s'écrit **avant** la revendication. Les tâches de fixture sont donc des tâches de premier rang, pas un complément.

**Organisation** : par user story, pour que chacune soit implémentable et vérifiable seule. Les trois chantiers portent sur **trois surfaces disjointes** — le moteur (US1, US3), l'instrument de mesure (US2), la documentation (US3) — donc l'ordre P1 → P2 → P3 est un ordre de **valeur**, pas une dépendance technique (plan.md § Structure Decision).

## Format : `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichiers différents, aucune dépendance sur une tâche incomplète)
- **[Story]** : US1 / US2 / US3 — les phases Setup, Foundational, Reçu vif et Clôture n'en portent pas

## Règles qui valent pour toutes les tâches ci-dessous

- **Le compte vif imprimé fait foi.** `npm run eval` imprime son `N/N`, la porte visuelle imprime ses scores : aucun nombre n'est recopié depuis la prose d'un document de planning vers une preuve.
- **Jamais deux sweeps en parallèle** : `evals/.scratch` est un chemin unique, une collision rend de **faux rouges**.
- **`evals/fixtures/` est hors `tsconfig`** (`tsconfig.json` § exclude) : changer une signature partagée laisse `tsc` vert et casse `npm run eval` au runtime. Relancer la fixture à la main après toute édition de signature.
- **`extract/figma/visual-parity/run.ts` contient 2 octets NUL légitimes** : `grep`/`rg` BSD le croit binaire et rend **0 résultat sans erreur**. Utiliser `grep -a` / `rg -a` ou Python. Même piège dans `core/emit-html.ts`.
- **Toute vérification empêchée ou incomplète se dit et se consigne** (FR-015) — jamais comptée comme un succès silencieux.

---

## Phase 1: Setup (infrastructure partagée)

**Purpose** : rendre le worktree autonome, prouver le point de départ vert, et **capturer les deux états d'avant que les éditions détruisent**.

- [X] T001 [Worktree gates — F1] Rendre ce worktree autonome (Constitution, Development Workflow: Worktree Gates) : `git worktree add ../ds-contract-017 017-photos-honnetes` depuis le checkout principal **après** avoir commité les documents de planning (leçon 015/T001), puis, **dans le worktree** : `npm install` (`npm run eval` symlinke le `node_modules` du checkout — il refuse sans) puis `npx playwright install chromium` (deux contrôles pilotent un vrai Chromium). Le sweep COMPLET — `npm run eval` inclus — tourne dans ce worktree à chaque point de contrôle et à la clôture ; la baseline de parité visuelle y est versionnée. Le checkout principal ne peut pas sortir cette branche tant que le worktree la tient — si un contrôle doit y tourner : `git -C <checkout-principal> checkout --detach <commit>`, sweep, restaurer.
- [X] T002 Prouver le point de départ vert et l'archiver dans `specs/017-photos-honnetes/proofs/depart-sweep.txt` : `npm run build && npm run parity && npm run eval && npm run plugin:check && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && npx tsc -p tsconfig.build.json`
- [X] T003 [P] Archiver les 34 légendes **telles que l'émetteur les produit aujourd'hui**, extraites des scripts générés `figma-sync/*.js` (**71 fichiers portent la ligne `generated from contract`**), vers `specs/017-photos-honnetes/proofs/depart-legendes.txt` — c'est la référence qui prouvera en US3 que **9 composants changent et 25 restent inchangés au caractère près**. **Pas le cliché de canevas** : `parity/snapshots/figma-components.json` n'est déplaçable que par une capture vive au pont, et 017 ne mute pas le canevas — diffé contre lui-même il rendrait 0 changement (voir T037). Archiver **en second**, à titre documentaire, l'état canvas de ces mêmes 34 légendes depuis le cliché, en écrivant qu'il **ne bougera pas** dans cette spec (lecture pure de fichiers commités, aucun risque de collision).
- [X] T004 Archiver l'état d'avant de la porte de mesure dans `specs/017-photos-honnetes/proofs/depart-visual-summary.txt` : `npm run extract:figma:visual -- --summary`. Les huit lignes « frontière image » (99,97 % → 15,64 %, ligne de porte 2 %) y sont relevées **avant** toute édition d'instrument. Ne jamais lancer cette commande en parallèle de T002 (toutes deux pilotent Chromium).

---

## Phase 2: Foundational (prérequis bloquants)

**Purpose** : lever la seule prémisse non mesurée du plan, et donner une maison durable à l'instrument photo ainsi qu'un point d'atterrissage aux défauts découverts.

**⚠️ CRITIQUE** : T005 bloque **toute écriture de moteur d'US1**. Aucune ligne de `core/emit-figma-script.ts` ne s'écrit avant que la sonde ait rendu.

- [X] T005 Sonder `getInstancesAsync` **en LECTURE SEULE** via le pont figma-console (`figma_execute`, port 9223) sur le fichier client `d9FYAUcqdcNtsuaMgLefvJ`, et consigner le résultat dans `specs/017-photos-honnetes/proofs/sonde-getinstances.md`. Le script est celui de `quickstart.md` §1 : `await figma.loadAllPagesAsync()`, `getNodeByIdAsync(<maître porteur de photos>)`, puis `getInstancesAsync()` chronométré. Trois choses à confirmer (research D1) : (1) la méthode existe et rend les instances de page du maître ; (2) elle les rend **après** `loadAllPagesAsync` ; (3) le coût de parcours reste sous le seuil de saturation (≈ 5 350 nœuds font tomber le plugin). **Aucune mutation.** **Trois issues, toutes tranchées d'avance — la sonde ne peut pas laisser le chantier sans réponse.** (1) Elle **rend** → D1 tient, le moteur descend par `getInstancesAsync()`. (2) Elle **refuse ou sature** → T010/T013 basculent sur le repli nommé : le registre orchestré `(hostId, ordre) → hash` passé au script par `globalThis.__dsc_photos`, forme déjà éprouvée par `specs/016-canvas-vrai/proofs/repose/photos-instances.json`. (3) Elle est **empêchée** — pont déconnecté, fenêtre impossible, et c'est l'état documenté au 2026-08-06 (`51cab06`) : elle est consignée `verdict: "empeche"` avec sa raison, **et US1 démarre quand même, sur le repli**, jamais sur un `getInstancesAsync` non mesuré. Motif : **le sans-tête fait foi** — suspendre le MVP à un pont indisponible ferait d'une indisponibilité d'outil un blocage produit, alors que le repli est la seule des deux voies **déjà éprouvée au dépôt**. La sonde reste **due** : quand elle passera, la bascule vers `getInstancesAsync` sera une amélioration additive avec sa propre preuve — jamais une dette silencieuse. Une sonde empêchée **se dit** ; elle ne se contourne pas par inférence.
- [X] T006 [P] Promouvoir l'instrument photo de 016 — `git mv specs/016-canvas-vrai/bridge/photos-census.js specs/016-canvas-vrai/tools/photos-verify.mts extract/figma/photo-parity/` — **un déplacement, pas une réécriture** (décision parquée pour 017 par `specs/016-canvas-vrai/plan.md:101`). Ajouter le script `photos:verify` dans `package.json` (aucun script `photos:*` n'existe aujourd'hui), mappé **tel quel** sur l'outil promu : `tsx extract/figma/photo-parity/photos-verify.mts`. **Sa CLI réelle, relevée et non supposée** : deux chemins **positionnels** (`<census-avant.json> <census-apres.json>`), plus `--out <chemin>` et `--selftest` ; **il n'a ni `--avant` ni `--apres`**, et appelé nu il sort en `exit(2)` sur un défaut d'argument. Le recensement, lui (`photos-census.js`), tourne **dans le bac à sable Figma via le pont** et exige en plus un receiver local : c'est le seul des deux qui a besoin du fichier ouvert. Écrire ce partage des rôles en tête du dossier promu — **toute CLI plus riche que celle-ci serait une réécriture, donc une tâche à part, pas un effet de bord de la promotion**. Laisser un pointeur dans `specs/016-canvas-vrai/` plutôt qu'un trou dans le dossier d'une spec close. Vérifier que `npx tsc --noEmit` reste vert : `extract` est dans `tsconfig.json` § include, donc le `.mts` promu est désormais **type-checké** — c'est le coût nommé de la promotion.
- [X] T007 [P] Créer `specs/017-photos-honnetes/registre/defauts-decouverts.json` — le point d'atterrissage exigé par FR-009 / SC-005 (« destination : le registre, jamais une note en prose seule »), à la forme de `specs/016-canvas-vrai/registre/defauts-source.json`. L'amorcer avec les deux constats **déjà faits en instruisant le plan** (research D5, D15) : (a) le faux-Figma accepte la **mutation en place** de `node.fills` là où le vrai Figma l'ignore silencieusement — classe de défaut orthogonale, découverte ici, non réparée ici ; (b) `specs/016-canvas-vrai/proofs/repose/photos-instances.json` porte les **97** photos du relevé **sans drapeau machine** distinguant « déjà bonne » de « à reposer » — la répartition 62/35 ne vit que dans le message du commit `51cab06`, non re-dérivable du JSON.

**Checkpoint** : la prémisse est mesurée, l'instrument a sa maison, les défauts ont où atterrir — les trois user stories peuvent démarrer.

---

## Phase 3: User Story 1 — Les photos du designer ne disparaissent plus (Priority: P1) 🎯 MVP

**Goal** : une photo posée page par page survit à une reconstruction, et le contrôle **échoue franchement** si l'une tombe, s'effondre ou change de place. Référence du dégât : 62 photos perdues sur 10 sections de 8 maquettes, derrière un rapport vert.

**Independent Test** : relever l'empreinte de chaque photo **par emplacement** `(hôte, chemin de position)` sur une section à plusieurs photos distinctes, reconstruire son maître, relever à nouveau — chaque empreinte au même emplacement, compte d'images **distinctes par hôte** identique. Et le contrôle doit **échouer** sur un cas de photo perdue et sur un cas de deux photos interverties.

**Ordre imposé** : §VII (le faux-Figma apprend d'abord, sinon la perte est structurellement inatteignable sans tête) puis §II (la fixture est **rouge avant** le correctif). Voir `contracts/preservation-photos.interface.md` §1 et `quickstart.md` §2.

### Le faux-Figma apprend (FR-002a) — même fichier, séquentiel

- [X] T008 [US1] Dans `scripts/plugin-engine-mock-figma.mjs`, faire qu'une **INSTANCE miroite le sous-arbre de son maître** et que ses nœuds miroirs acceptent une surcharge de `fills` — aujourd'hui `createInstance()` (signature `:243`) pose `inst.children = []` (**`:247`**), donc rien à surcharger, donc rien à perdre : **c'est le trou central qui rend la perte du 2026-08-06 inatteignable sans tête**. Forme imposée par les trois précédents (`981e446`, `ddac778`, `e856844`) : le mock passe d'un no-op permissif à **une contrainte qui lève**, avec un commentaire in-situ nommant le défaut réel mesuré.
- [X] T009 [US1] Dans `scripts/plugin-engine-mock-figma.mjs`, modéliser l'**`ImagePaint`** (`imageHash`, `scaleMode`) et le couple `figma.createImage` / `figma.getImageByHash` — **0 occurrence de chacun aujourd'hui** : le mock transporte des paints IMAGE écrits à la main par la fixture 013 sans jamais les connaître.
- [X] T010 [US1] Dans `scripts/plugin-engine-mock-figma.mjs`, modéliser `ComponentNode.getInstancesAsync()` rendant les instances du maître **après** `loadAllPagesAsync` — dans la forme que la sonde T005 a réellement rendue, ou dans celle du repli nommé si elle a refusé. La modélisation suit la sonde ; elle ne l'anticipe pas.

### La fixture, ROUGE avant tout correctif (§II, FR-014)

- [X] T011 [US1] Écrire `evals/fixtures/photos-instance-overrides-preserved-check.ts` — elle **rejoue la perte du 2026-08-06** (un maître, N instances de page portant des surcharges distinctes, reconstruction, vérification d'empreinte à l'emplacement) et porte les **trois cas adverses obligatoires** de `contracts/preservation-photos.interface.md` §4 : **A — perte** (l'accueil d'une empreinte est supprimé → échec nommant photo, hôte, rang) ; **B — interversion** (deux plans de même taille, empreintes échangées → échec nommant les **deux** emplacements) ; **C — sans accueil** (empreinte qu'aucune part `img` ne peut recevoir → refus **sans un seul nœud touché**, et passage avec acquittement au registre, imprimé). Plus un quatrième cas non adverse : **deux exécutions sans geste rendent le même verdict** (SC-009). Lancer `npx tsx evals/fixtures/photos-instance-overrides-preserved-check.ts` — **attendu : ROUGE** — et archiver la sortie dans `specs/017-photos-honnetes/proofs/us1-fixture-rouge.txt`.

### L'émetteur est réparé — `core/emit-figma-script.ts`, même fichier, séquentiel

- [X] T012 [US1] Dans `core/emit-figma-script.ts`, faire passer la clé d'appariement de `harvestImagePaints` (`:3824-3828`) du **nom** à la **position** — `(hostId, cheminPosition)` — et **supprimer le repli « premier paint non réclamé »** (`:3849-3850`), qui est exactement ce qui rendait l'interversion invisible. Le nom de calque devient documentaire et ne participe à aucune comparaison (§VIII : un renommage n'est pas une perte, deux homonymes ne se confondent pas).
- [X] T013 [US1] Dans `core/emit-figma-script.ts`, étendre le harvest à `comp` **puis chaque instance rendue par `await comp.getInstancesAsync()`** sur les **deux** chemins d'amend (`:3965` et `:4108`) — 255 des 349 photos vivantes sont des surcharges d'instance, soit les trois quarts que le sauvetage actuel ne voit pas. Périmètre **borné au maître reconstruit**, jamais au fichier : un parcours global sature le bac à sable. Si T005 a refusé, appliquer le repli nommé (registre orchestré `(hostId, ordre)`).
- [X] T014 [US1] Dans `core/emit-figma-script.ts`, insérer la **pré-passe de refus avant le premier `remove()`** (`:3966` et `:4109`) : calculer les emplacements d'accueil par `collectImgSpecTargets` (`:3830-3833`) **avant** la démolition, et si une empreinte relevée n'a aucun accueil, **jeter en nommant `imageHash`, `hostId`, `cheminPosition` — aucun nœud touché**. L'ordre actuel (démolir `:3966` → calculer `:3993`) rend le refus impossible : au moment où `unplacedImages` (`:3858`) découvre la photo sans accueil, le mal est fait.
- [X] T015 [US1] Dans `core/emit-figma-script.ts`, faire lire au refus de T014 le registre `specs/017-photos-honnetes/registre/acquittements-photos.json` : une photo acquittée ne bloque plus, **et elle est imprimée dans sa propre section du rapport, jamais fondue dans le vert** (FR-003b). Les **sept** champs sont obligatoires et se refusent par le nom — `hostId`, `cheminPosition`, `imageHash`, `motif`, `decidePar`, `decideLe`, `receiptId` : une entrée incomplète **refuse au chargement** ; une entrée dont l'hôte ou le rang ne résout plus est `acquittement-orphelin` et se retire (data-model §4). *(Le plan disait « six » pour sept champs listés, et research D4 nommait le 2ᵉ `ordre` — qui est la clé du repli, pas celle du chemin nominal. Corrigé : `cheminPosition` partout, `ordre` réservé au repli.)*
- [X] T016 [US1] Dans `core/emit-figma-script.ts`, faire reposer `restoreImagePaints` (`:3842-3859`) **par `(hostId, cheminPosition)`, sur le maître ET sur les instances** — la même clé qu'au relevé, jamais le nom.
- [X] T017 [US1] Dans `core/emit-figma-script.ts`, produire le `RapportDePhotos` à la forme de `data-model.md` §3 : par composant et par hôte — `attendues`, `retrouvees`, `distinctesAvant`, `distinctesApres`, `deplacees`, `nonReplacees`, `nonVerifiables`, `acquittees`, `verdict: "vert" | "rouge" | "empeche"`, `refusAvantMutation`. Les invariants sont refusables par le nom : `vert` **interdit** si `nonReplacees` / `deplacees` / `nonVerifiables` est non vide ; `distinctesApres < distinctesAvant` ⇒ **rouge** avec l'hôte nommé (c'est le canal qui dit « 17 portraits à l'origine, 2 au vif ») ; une empreinte illisible est **non vérifiable, jamais identique**.

### La porte se ferme

- [X] T018 [US1] Relancer `npx tsx evals/fixtures/photos-instance-overrides-preserved-check.ts` — **attendu : VERT**, les quatre cas — et archiver la sortie dans `specs/017-photos-honnetes/proofs/us1-fixture-verte.txt`. Le passage rouge → vert, archivé des deux côtés, **est** la preuve §II.
- [X] T019 [US1] Brancher le cas dans `evals/run.ts` sous le claim **`C2-refusal`**, à côté de `img-paint-preserved-on-amend` (`:436-443`) et sur le même modèle d'appel. **Une fixture que rien ne lance ne protège rien** — c'est pour cela que la porte de 017 est un cas d'eval et non une extension de `plugin:check`, dont les trois cas sont en quarantaine et qu'aucun cas actif ne lance.
- [X] T020 [US1] **Étendre** le cas existant `img-paint-preserved-on-amend` (`evals/run.ts:436`) à l'axe instance plutôt que d'en créer un doublon — les cas existants s'étendent, jamais ne se doublent (plan.md § Testing).
- [X] T021 [US1] Faire les **trois re-pins, dans cet ordre** (research D14, une édition de `core/` les déclenche tous ; **T037 refait exactement les mêmes trois** après US3 — ce sont donc une **zone partagée**, jamais deux pistes en même temps : voir § Opportunités de parallélisation) : `npm run build` → `npm run golden:update` (les **37 scripts générés sur 72** qui portent le harvest changent) → `node scripts/build-plugin-zip.mjs --update-engine-receipt` (`figma-sync/plugin/engine.receipt.json` dérive dès qu'on touche `core/` et fait échouer `plugin:check` au flux 1) → régénérer `examples/polaris/figma/*.figma.js`, **le troisième reçu, celui qu'on oublie** : golden et engine.receipt ne couvrent que les contrats.
- [X] T022 [US1] Passer les portes et archiver dans `specs/017-photos-honnetes/proofs/us1-portes.txt` : `npm run eval` (son `N/N` vif fait foi), `npx tsx scripts/deterministic-roundtrip.mjs` (byte-identique ×2), `npm run plugin:check`, `node scripts/core-browser-check.mjs` (`core/` reste sans `node:*`), `npx tsc --noEmit && npx tsc -p tsconfig.build.json`.

**Checkpoint** : US1 est complète et vérifiable seule, **sans le fichier client ouvert**. Un rapport vert en présence d'une perte ou d'une interversion est devenu impossible. Le reçu vif (Phase 6) confirme ; il ne remplace pas.

---

## Phase 4: User Story 2 — La porte de parité cesse de mesurer un cadre vide (Priority: P2)

**Goal** : chaque ligne mesurée compare des choses comparables. Les huit lignes « frontière image » passent sous la ligne de porte de 2 %, ou sont **déclarées non comparables avec leur raison, visibles et comptées**.

**Independent Test** : re-mesurer les huit lignes, notre surface tenant cette fois la photo de maquette exportée — aucune ne doit plus porter un score qui mesure l'absence de données.

**Le levier existe entièrement** : `renderVariant` a **déjà** son 7ᵉ paramètre `comparisonProps` (`extract/figma/visual-parity/render.ts:816`), la chaîne `$asset` est écrite, éprouvée et vérifiée par SHA-256, et le chemin campagne l'emprunte déjà (`render.ts:1341`, `:1351`). Seule la boucle du live gate ne passe que **6 arguments** (`run.ts:2002-2009`).

- [X] T023 [US2] Ajouter deux champs **additifs** à `ParitySubject` (`DumpSubject` et `ContractSubject`) dans `extract/figma/visual-parity/subjects.ts` : `comparisonProps?: Record<string, unknown>` et `fixtureAssetIds?: string[]` — mêmes noms et mêmes sémantiques que `CampaignCase`, jamais une invention. Aucun champ existant n'est repurposé (§VI).
- [X] T024 [US2] Dans `extract/figma/visual-parity/run.ts:2002-2009`, résoudre puis passer ces props en **7ᵉ argument** de `renderVariant`, par le même chemin que `renderCampaignVariant` (`render.ts:1341`, `:1351`). C'est là, et **seulement là**, que naît le 99,97 %.
- [X] T025 [US2] Ajouter `"incomparable"` à l'union de statuts de `extract/figma/visual-parity/run.ts:148` (aujourd'hui fermée à `"diffed" | "skipped" | "refused" | "figma-declined"`), assorti d'un `incomparableReason` **non vide obligatoire — sans raison écrite, la ligne refuse**. La ligne incomparable est **visible et comptée** dans la section « Not diffed (named, never dropped) » (`run.ts:2376`) et dans la ligne de comptage, **ne porte aucun score de porte**, et n'est jamais masquée, jamais affichée à 0 %, jamais absorbée dans une tolérance (FR-007). Le vocabulaire de causes reste **fermé à six** (l'union `CauseSlug`, `triage.ts:55-61` — `:57-72` recouvrait la table de libellés, pas l'union) : « non comparable » est un **statut**, pas une septième cause — les deux axes sont orthogonaux (research D9).
- [X] T026 [US2] Épingler les assets manquants de `member-picture` (set `274:2389`) par le chemin existant `extract/figma/visual-parity/fixture-assets/fetch.mjs`, avec leur reçu au manifeste `extract/figma/visual-parity/fixture-assets/manifest.json` : `sha256`, `imageRef`, `paintNodeId`, `setNodeId`, `variantNodeId`, `subject`, `scaleMode`, **`runtimeDefault: false`**. Aucun asset ne porte `runtimeDefault: true`. Les 17 portraits déjà au manifeste sont classés `subject: "member-card"` — **aucun** ne porte `subject: "member-picture"`, et deux des huit lignes en dépendent (64,48 % et 58,33 %). « Non comparable » n'est le recours **qu'en cas d'échec de ce relevé** (FR-006a), jamais la réponse de première intention.
- [X] T027 [US2] Déclarer `comparisonProps` + `fixtureAssetIds` sur les 5 sujets concernés dans `extract/figma/visual-parity/subjects.ts` — `realisation`, `carte`, `member-card`, `product-card`, `member-picture`. **Piège épinglé** : `ds.member-picture` nomme sa prop **`src`**, pas `imageUrl` (`contracts/member-picture.contract.json:57`) — un preset calqué sur les autres sujets ne prendrait pas. Tout `$asset` doit être déclaré dans `fixtureAssetIds` de la même entrée et présent au manifeste, sinon **refus nommé** (`render.ts:386`, `:413`).
- [X] T028 [US2] Re-mesurer et archiver dans `specs/017-photos-honnetes/proofs/us2-apres-summary.txt` : `npm run extract:figma:visual -- realisation carte member-card product-card member-picture --refresh` puis `npm run extract:figma:visual -- --summary`. Comparer aux huit lignes de `proofs/depart-visual-summary.txt` (T004).
- [X] T029 [US2] Réécrire les **six règles `image-boundary`** de `extract/figma/visual-parity/triage.ts` couvrant les huit lignes (`:145` member-card, `:152` product-card, `:159` realisation, `:166` carte, `:340` et `:348` member-picture) **d'après la mesure d'après, jamais reconduites** (FR-008). Un écart résiduel reçoit la cause que le nouveau relevé démontre ; un écart sans cause connue est un défaut à consigner (T030). La règle D8 déjà en vigueur le rend exécutoire sans discipline : toute ligne à score brut strictement positif sans règle sort en **`UNTRIAGED`, classée première** (`run.ts:2070-2076` — le littéral `UNTRIAGED` est à `:2076`, une ligne après le commentaire).
- [X] T030 [US2] Consigner dans `specs/017-photos-honnetes/registre/defauts-decouverts.json` **100 % des défauts révélés** par la remise à armes égales (FR-009, SC-005), même non réparés ici. Trois sont attendus et déjà nommés : `D-016-CARTE-BOUTON` (`ds.carte` rend une part unique `action` là où le master porte trois enfants — il se cache aujourd'hui **sous** les 56,56 % de `carte / Disposition=Categorie`, tinyspec existante `specs/tiny/carte-bouton-glyphes.md`) ; le lavis `"background-color": "#D9D9D9"` du root de `member-picture` s'il reste visible une fois la photo donnée — **fait de contrat, pas frontière image** ; et la variante `Etat=Survol` de `member-picture`, qui photographie un portrait assombri alors que **les 34 contrats ont `states: []`** — fait d'état non modélisé, re-mesuré puis nommé, jamais requalifié en bruit.
- [X] T031 [US2] Écrire noir sur blanc, dans `specs/017-photos-honnetes/registre/defauts-decouverts.json` et dans `extract/figma/visual-parity/REPORT.md`, que **`DW-014-002` n'est PAS fermé par cette réparation** : l'instrument rend `emit-html`, **jamais la surface React livrée**. 017 répare la **donnée** mesurée, pas la **surface** mesurée ; la roadmap tient cet angle mort pour « le plus gênant ». Le risque réel est qu'on le croie fermé par la remise à armes égales.
- [X] T032 [US2] Ne déplacer `extract/figma/visual-parity/baseline.json` **qu'avec le motif écrit** (`npm run extract:figma:visual -- --write-baseline` — geste délibéré, jamais un réflexe), et rafraîchir `extract/figma/visual-parity/REPORT.md`. La non-régression est déjà fermée : `baseline.json` **échoue** sur une ligne disparue (`run.ts:2189-2194`) comme sur un **changement de statut** (`:2196-2199`) — une ligne discrètement retirée de la liste est déjà impossible.
- [X] T033 [US2] Prouver le déterminisme (SC-009) : deux exécutions successives de `npm run extract:figma:visual -- --summary` **sans aucun geste entre les deux** rendent des scores identiques → `specs/017-photos-honnetes/proofs/us2-determinisme.txt`.

**Checkpoint** : plus aucune ligne ne porte un score qui mesure l'absence de données ; la pire ligne de la porte est un écart réel, re-mesuré et re-classé. US1 et US2 fonctionnent indépendamment.

---

## Phase 5: User Story 3 — Le designer comprend enfin ce qu'est ce cadre (Priority: P3)

**Goal** : la dague `†` cesse d'être muette sur l'image. Une **clause courte** sur la ligne de légende dit ce qu'est le cadre ; la documentation dit ce qui arrive à la photo.

**Independent Test** : ouvrir un composant à cadre photo et lire sa légende — en une ligne, elle dit ce qu'est le cadre. Puis poser à `docs/` **seule** la question « que devient ma photo à la reconstruction ? » : elle doit répondre **sans qu'on lise le code**.

**Ce qui manque n'est pas la marque, c'est la phrase** : la dague est **déjà posée** sur les 9 composants porteurs d'image (vérifié au cliché `parity/snapshots/figma-components.json`, pas supposé).

- [X] T034 [US3] Dans `core/emit-figma-script.ts:2746-2771`, poser un drapeau **`hasImgPart` dédié** — distinct de `hasPreviewOnlyFacts` (`:2746-2747`), qui agrège aussi `blockRoot` et déclencherait la clause sur des composants **sans** cadre photo — et émettre, pour un composant portant au moins une part `img` : `<Nom> — generated from contract <id> v<version> · image frame: runtime slot, photo shown is a mockup sample †`. **Une seule ligne** (directive owner du 2026-07-19, aucun retour aux paragraphes de copie), **dague en fin de ligne** à sa place actuelle, **anglais** comme la légende existante des 34 composants. Ce qui arrive à la photo à la reconstruction n'est **pas** dit ici (FR-010a).
- [X] T035 [P] [US3] Ajouter les **trois** descriptions manquantes — `imageUrl` dans `contracts/carte.contract.json`, `src` dans `contracts/member-picture.contract.json`, **et `imageUrl` dans `contracts/member-card.contract.json`**. **Compte re-mesuré le 2026-08-06, et il corrige le plan** : le dépôt porte **11** props d'URL, dont **3** sans la convention par écrit — le « deux sur dix » était vrai seulement en se restreignant aux 9 contrats à part `img`, restriction qui n'était écrite nulle part. `ds.member-card` n'a pas de part `img` (sa photo vient de `ds.member-picture`) mais porte bien sa propre prop d'URL nue — **et c'est l'un des 5 sujets de mesure d'US2**, donc le trou est en plein dans le périmètre de travail. Le texte de référence est déjà écrit et **se cite, il ne se réinvente pas** : `contracts/reassurances.contract.json:39` (« Figma n'expose aucune propriété de composant pour ces pixels. Le contrat porte donc la ROUTE, jamais les octets ») et `contracts/review-card.contract.json:119` (« inerte sur le canevas (trou A5, R6) »). Bump **patch** sur les trois `version` — ni prop, ni valeur, ni `accepts` ne bouge. **Aucune image n'entre au contrat** (FR-012).
- [X] T036 [US3] **Étendre** le cas d'eval existant `img-part-canvas-placeholder-named` (`evals/run.ts:5109`, claim `C3-detection`), qui épingle déjà le lavis `#D9D9D9` et le `†`, pour qu'il épingle **aussi la clause** et assère **l'absence de `\n` dans la description émise** (FR-010, une seule ligne). Étendu, **jamais doublé**. **À exécuter APRÈS T038–T040**, car il épingle aussi ce que ces trois-là écrivent.
- [X] T036a [US3] **Adosser la documentation à un contrôle — c'est la porte qui manque** (§II, FR-014, SC-007). Relevé du 2026-08-06, vérifié et non supposé : **aucun cas de `evals/run.ts` ne lit `docs/`** — la seule occurrence de `docs/` y est un commentaire (`:18`), et les cas qui lisent des `.md` visent tous des rapports générés hors `docs/`. Une doc qui affirme sans contrôle derrière est exactement le défaut que cette spec répare ailleurs. Étendre donc le cas de T036 (ou un cas frère sous le même claim) pour épingler **byte-pour-byte les deux copies de doc** : (1) la ligne image de `docs/FIGMA-CAPABILITY-MATRIX.md` § (b) — le canal ET sa copie d'annotation (T038) ; (2) la présence, dans `docs/handoff/08-status-what-doesnt-work.md`, de la question « que devient une image à la régénération ? » **et** de son pointeur vers la matrice (T040). Éditer l'un sans l'autre fait **rougir la porte** : c'est le seul mécanisme qui empêche la copie du canevas et celle de la doc de diverger en silence. **Ce cas est le premier du dépôt à lire `docs/`** — le dire dans son commentaire in-situ, et le compter comme tel au rapport de clôture.
- [X] T037 [US3] `npm run build`, les trois re-pins de D14 (golden → engine.receipt → `examples/polaris/figma/*.figma.js` ; les contrats de T035 les déclenchent aussi), puis `npm run parity`. Prouver, par diff des légendes **des scripts générés `figma-sync/*.js`** contre `specs/017-photos-honnetes/proofs/depart-legendes.txt` (T003), que **9 composants portent la clause et 25 sont inchangés au caractère près** → `specs/017-photos-honnetes/proofs/us3-legendes-diff.txt`. **Deux prémisses corrigées ici, l'une et l'autre relevées** : (1) `npm run parity` **ne voit PAS la description** — `parity/diff.ts` ne lit jamais ce champ (son interface `FigmaSet`, `:89-96`, ne le porte pas), donc la parité ne peut ni prouver ni infirmer cette tâche, et elle ne rougira pas non plus ; elle reste au sweep pour les autres axes. (2) `parity/snapshots/figma-components.json` n'est **déplaçable que par une capture vive au pont** (`parity/extract-figma.plugin.js`), et 017 ne mute pas le canevas : diffé contre son propre archivage il rendrait **0 changement**, une preuve vide. La preuve vit donc côté généré, avec le re-pin `evals/golden.json` en second reçu. **Écrire au rapport que le canevas, lui, n'a pas encore reçu la clause** (SC-006-vif).
- [X] T038 [US3] Ajouter la **ligne image manquante** à `docs/FIGMA-CAPABILITY-MATRIX.md` § (b) « The inexpressible set — on-canvas annotation copy » (`:239-261`), au format exact des 15 autres (`| channel | annotation copy |`) : `| background-image: url() (img parts) | "This frame is a runtime image slot — the photo you see is a mockup sample. The coded component receives its image at runtime." |`
- [X] T039 [US3] Ajouter dans `docs/FIGMA-CAPABILITY-MATRIX.md` l'**addendum daté qui rend la ligne de T038 cohérente** — sans lui elle est incohérente, car §(b) est réservée aux canaux `CARRY-CODE-ONLY` alors que la ligne 91 verdicte l'image `CARRY-BOTH (add — § a.7)` : **l'absence de ligne image n'était pas un oubli de saisie, c'est structurel**. L'addendum porte ce qu'exige FR-013 : la lacune A5 reste **ouverte et nommée** (non fermée par 017) ; c'est une lacune de **transport** (ligne 91, colonne Bindable : `— (image content not bindable)`) ; ce n'est **pas un défaut de fidélité mesuré** — les 99,97 % du 2026-08-06 étaient un artefact d'instrument, corrigé par US2. La matrice cesse de confondre les deux.
- [X] T040 [P] [US3] Faire répondre `docs/handoff/08-status-what-doesnt-work.md` à « que devient une image à la régénération ? », avec pointeur vers `docs/FIGMA-CAPABILITY-MATRIX.md:360-372` (FR-011, SC-007). État vérifié le 2026-08-06 : `docs/handoff/` est **muet** — deux occurrences de « photo » sur ses 12 fichiers, toutes narratives dans `10-history.md` ; rien dans 07, 08 ni 12 ; pas un mot sur `harvestImagePaints`, A5 ou le lavis `#D9D9D9`. Le paquet d'accueil est muet sur le sujet qui porte le pire écart mesuré du système.
- [X] T041 [P] [US3] **Dater** `CLAUDE.md:19` — sans effacer. Le reçu y affirme que la réponse images-à-la-régénération « lived only in code comments and one eval header » : **c'est faux depuis le 2026-08-04**, le commit `504dd0a` a ajouté `docs/FIGMA-CAPABILITY-MATRIX.md:360-372`, qui répond en clair sans lire le code. Le texte est exact comme **récit du 2026-08-03** et trompeur comme **état courant** : le marquer comme tel, c'est la même discipline que « nommer le trou du journal plutôt que le combler en silence ».
- [X] T041a [P] [US3] **Dater `ROADMAP.md:16` — même geste, même motif, et c'est le plus gênant des deux.** L'entrée y décrit encore 017 comme « **images A5** … le passage de *rescapée* à *gouvernée* » — **la prémisse exacte que le relevé du 2026-08-06 a renversée** et que cette spec écarte au § Out of Scope. Pire : elle affirme que « les photos du client **survivent** désormais à une régénération (**57/57**, vérifié par hash) », chiffre que 017 prouve faux — 62 photos d'instance perdues derrière ce vert-là. Laisser cette phrase debout pendant que 017 répare précisément ce mensonge serait la contradiction la plus visible du dépôt. Marquer le passage comme **exact au 2026-07-31, faux comme état courant**, avec pointeur vers la spec — **daté, pas effacé** (T041 fait le même geste sur `CLAUDE.md:19`). À faire **maintenant**, pas à la clôture : T048 ne fait que marquer 017 close, ce qui laisserait la fausse affirmation vivre toute la durée du chantier.

**Checkpoint** : les trois user stories sont indépendamment fonctionnelles, **toutes sans le fichier client ouvert** — avec une réserve écrite plutôt que tue : US3 est complète **jusqu'à la surface générée**. La clause n'atteint le canevas qu'au lot de régénération de la fenêtre vive (Phase 6) ; d'ici là, la légende que lit un designer dans Figma est l'ancienne. C'est **SC-006-vif**, reporté et nommé, jamais compté comme acquis.

---

## Phase 6: Le reçu vif (FR-002b) — planifié avec l'owner, hors du sweep automatique

**Purpose** : produire le reçu daté sur le fichier client. **Le sans-tête fait foi ; le vif confirme et ne remplace pas.** Cette phase ne tourne **ni sans surveillance ni en intégration continue** : elle exige le fichier ouvert, le pont branché, et une fenêtre planifiée avec l'owner.

**⚠️ Précondition bloquante (FR-005)** : aucune reconstruction sur le fichier client des composants touchés par l'effondrement des 62 photos ne démarre avant que leur restauration (016) soit **exécutée et prouvée**. Les phases 1 à 5 ne sont **pas** bloquées par cette précondition.

- [X] T042 Vérifier et consigner l'état de la précondition FR-005 dans `specs/017-photos-honnetes/proofs/precondition-fr005.md` : la restauration des 62 photos appartient à 016, son plan est commité (`specs/016-canvas-vrai/proofs/repose/photos-instances.json`), son exécution **attend le pont** (`51cab06`). **Nommer la réserve avant de s'appuyer dessus** (déjà consignée en T007) : ce plan liste les **97** photos du relevé sans drapeau distinguant « déjà bonne » de « à reposer ». Si la restauration n'est pas faite et prouvée, **la phase ne démarre pas — et c'est dit, pas silencieusement sauté**.
- [X] T043 Appliquer §X (before-capture) : capturer l'état d'avant de **CHAQUE cible qui sera touchée, jamais un sous-ensemble pilote**, et vérifier chaque capture **non vide et correctement dimensionnée** avant de continuer. Une fois une copie remplacée sur le canevas, son état d'avant est perdu pour de bon. Captures dans `specs/017-photos-honnetes/proofs/vif/avant/`.
- [X] T044 Exécuter le cycle vif et produire le reçu daté dans `specs/017-photos-honnetes/proofs/recu-vif-photos.md`, **avec la CLI réelle des deux outils, pas une CLI supposée** (T006) — les deux gestes n'appartiennent pas au même outil : (1) **recensement AVANT** par `photos-census.js` exécuté dans le bac à sable via le pont (receiver local requis), par POSITION, masters ET instances → `proofs/vif/census-avant.json` ; (2) le **lot de régénération** — **le lotissement est obligatoire, pas une optimisation** : le pont sature sur un parcours global (≈ 5 350 nœuds) — ce lot est aussi ce qui porte enfin la clause de légende au canevas (SC-006-vif) ; (3) **recensement APRÈS** → `proofs/vif/census-apres.json` ; (4) le verdict par empreinte à l'emplacement, hors ligne : `npm run photos:verify -- specs/017-photos-honnetes/proofs/vif/census-avant.json specs/017-photos-honnetes/proofs/vif/census-apres.json --out specs/017-photos-honnetes/proofs/recu-vif-photos.md`. Un seul écrivain, un seul cycle global de vérification pixel (§XI : aucune partition à établir ici).
- [X] T045 Si la fenêtre owner ne peut pas s'ouvrir, ou si le pont est absent : consigner `verdict: "empeche"` dans `specs/017-photos-honnetes/proofs/recu-vif-photos.md` avec la raison. **Un contrôle empêché n'est jamais un contrôle vert** (FR-015) — et la porte du dépôt reste le cas d'eval adossé au faux-Figma, qui tourne partout et sans le fichier client.

---

> **T043 et T044 : cochées le 2026-08-07, après coup.** Elles étaient
> délibérément laissées vides la veille (`verdict: "empeche"` — pont saturé,
> précondition FR-005 non levée). Le pont a été débloqué le lendemain
> (`FIGMA_WS_PORT=9232`) et la Phase 6 a réellement tourné : capture d'avant de
> chaque cible (§X, `proofs/vif/census-avant.json`), restauration, clause de
> légende au canevas, puis extension aux MASTERS que le plan de 016 n'avait
> jamais couverts. Reçus sous `proofs/vif/`.

## Phase 7: Clôture & transverse

- [X] T046 Sweep de clôture, archivé dans `specs/017-photos-honnetes/proofs/sweep-cloture.txt` : `npm run build && npm run parity && npm run eval && npm run plugin:check && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && npx tsc -p tsconfig.build.json && npm run extract:figma:visual -- --summary && npm run photos:verify -- --selftest`. **Le dernier terme est corrigé et il faut savoir pourquoi** : appelé nu, `photos:verify` sort en `exit(2)` — il exige deux recensements en arguments positionnels, qui n'existent que si le pont a tourné. `--selftest` est **le seul mode réellement sans tête** de cet outil : il prouve le comparateur, pas les photos du client. **La porte photos sans tête, celle qui fait foi (SC-008), est le cas d'eval de T019** — elle est déjà dans `npm run eval` ci-dessus. Les comptes imprimés font foi ; aucun n'est recopié depuis un document de planning.
- [X] T047 Écrire `specs/017-photos-honnetes/RAPPORT-CLOTURE.md` : ce que les zéros couvrent **exactement** (SC-001 à SC-009, avec les comptes vifs), et ce que 017 **laisse derrière** — **SC-006-vif** (la clause est émise et épinglée, le canevas ne l'a reçue que si la fenêtre vive a eu lieu : le dire, avec la date ou avec le mot « pas encore »), la lacune A5 ouverte et nommée, `DW-014-002` entier, `D-016-REPEAT-SAMPLE-PAR-VARIANTE`, `D-016-SECTIONS-LOCALES-CARTES`, le 2ᵉ plan photo de MemberCard, la mutation en place de `fills` acceptée par le mock, et l'état réel de la Phase 6 (reçu produit ou `empeche`).
- [X] T048 [P] Mettre à jour `ROADMAP.md` (017 close, prochaine spec) et déposer l'entrée 017 dans `MILESTONES.md` **en nommant le trou de journal existant plutôt qu'en faisant comme s'il n'était pas là** : `MILESTONES.md` s'arrête à la spec 010, et 011 à 014 n'y ont pas d'entrée datée.
- [X] T049 [P] Mettre à jour `CLAUDE.md` § Recent Changes et § Active Technologies pour 017 — en distinguant ce qui est **prouvé** (les portes vertes, les comptes imprimés) de ce qui est **acquitté ou reporté**.
- [X] T050 Re-passer le Constitution Check de `specs/017-photos-honnetes/plan.md` (§I à §XI) contre ce qui a réellement été fait, et écrire tout écart au lieu de le laisser tomber (FR-015). Vérifier en particulier §II (aucune phrase de capacité en doc sans son eval derrière), §IV (`figma-sync/*.js`, `src/components/`, `catalog/catalog.json` régénérés et **jamais édités à la main**) et §VI (schéma non touché, tous les élargissements additifs).

---

## Dependencies & Execution Order

### Dépendances de phase

- **Phase 1 (Setup)** : aucune dépendance — démarre immédiatement. T004 capture un état que les éditions d'US2 détruisent : il **doit** précéder T023.
- **Phase 2 (Foundational)** : dépend de Setup. **T005 (sonde) BLOQUE toute écriture de moteur d'US1** (T012–T017) et la modélisation T010 — mais **elle ne peut pas les bloquer indéfiniment** : « empêchée » est une de ses trois issues, et elle fait démarrer US1 sur le repli plutôt que d'attendre le pont (T005, issue 3). Ce qui est bloqué, c'est de s'adosser à `getInstancesAsync` sans l'avoir mesuré ; pas le chantier. T006 et T007 ne bloquent que la Phase 6 et T030/T031.
- **Phase 3 (US1)** : dépend de T005. Ordre interne **imposé** : mock (T008→T010) → fixture rouge (T011) → émetteur (T012→T017) → fixture verte (T018) → branchement (T019, T020) → re-pins (T021) → portes (T022).
- **Phase 4 (US2)** : dépend de T004 seulement. **Aucune dépendance sur US1** — surfaces disjointes (`extract/figma/visual-parity/` vs `core/` + `scripts/`).
- **Phase 5 (US3)** : dépend de T003 seulement. Touche `core/emit-figma-script.ts` comme US1 → **sérialiser T034 après T017** si les deux avancent en parallèle, sinon conflit de fichier. **Ordre interne imposé** : les trois gestes de doc (T038 → T039, puis T040) précèdent **T036/T036a**, qui épinglent ce qu'ils écrivent — une eval qui lit une doc pas encore écrite rougit pour la mauvaise raison. T037 vient après T036a.
- **Phase 6 (Reçu vif)** : dépend d'US1 complète (T022), de T006 (le script `photos:verify`), et de la **précondition FR-005** vérifiée en T042. Peut ne jamais démarrer dans la fenêtre de cette spec — auquel cas T045 le dit.
- **Phase 7 (Clôture)** : dépend de toutes les phases souhaitées.

### Dépendances entre user stories

- **US1 (P1)** : démarre après T005. Aucune dépendance sur US2 ou US3.
- **US2 (P2)** : démarre après T004. **Indépendante d'US1** — c'est le point de la Structure Decision du plan : l'ordre P1 → P2 → P3 est un ordre de valeur, pas une contrainte technique.
- **US3 (P3)** : démarre après T003. Partage **un seul fichier** avec US1 (`core/emit-figma-script.ts`) — c'est la seule sérialisation à respecter entre stories.

### À l'intérieur d'une story

- La fixture est écrite et **ROUGE** avant l'implémentation (§II, FR-014) — T011 avant T012.
- Le faux-Figma apprend avant que la fixture puisse exprimer le défaut (§VII) — T008–T010 avant T011.
- Le refus se calcule **avant** la mutation, jamais après (§X) — T014 avant T016.
- Les re-pins viennent **après** l'édition de source, dans l'ordre de D14, jamais avant.
- L'état d'avant se capture avant l'édition qui le détruit — T003/T004 avant T023/T034.
- **La doc s'écrit avant l'eval qui l'épingle** — T038/T039/T040 avant T036/T036a. C'est le même ordre §II qu'ailleurs, vu de l'autre bout : la revendication ne part pas sans son contrôle, et le contrôle ne peut pas partir sans son objet.

### Opportunités de parallélisation

- **Phase 1** : T003 est [P] (lecture pure d'un fichier commité). T002 et T004 pilotent tous deux Chromium → jamais ensemble.
- **Phase 2** : T006 et T007 sont [P] entre elles (fichiers différents) ; T005 est indépendante des deux et peut démarrer en même temps (elle n'écrit rien au dépôt).
- **Phases 3, 4, 5 en parallèle** : c'est la vraie opportunité de ce chantier — trois surfaces disjointes. **Deux contraintes, pas une** : (1) `core/emit-figma-script.ts` est partagé entre US1 et US3 ; (2) **les trois reçus de re-pin** — `evals/golden.json`, `figma-sync/plugin/engine.receipt.json`, `examples/polaris/figma/*.figma.js` — sont écrits **deux fois**, par T021 (US1) et T037 (US3). C'est une **seconde zone partagée** : les régénérer en même temps depuis deux pistes produit un reçu qui ne correspond à aucun des deux états. Règle : **le dernier écrivain régénère**, et si les deux pistes ont avancé, T037 les refait entièrement après T021.
- **Phase 5** : T035, T040, T041 sont [P] (contrats, `docs/handoff/`, `CLAUDE.md` — trois fichiers distincts). T038 et T039 touchent le même fichier → séquentielles. **T036/T036a ne sont pas [P] avec elles** : elles épinglent la copie que T038 et T040 écrivent.
- **Phase 7** : T048 et T049 sont [P].
- **Jamais en parallèle** : deux commandes qui lancent `npm run eval` (`evals/.scratch` est un chemin unique — collision = faux rouges).

---

## Parallel Example : les trois stories en même temps

```bash
# Après la Phase 2 (T005 rendue), trois pistes disjointes :
Piste A (US1) : "Le faux-Figma apprend les instances miroir dans scripts/plugin-engine-mock-figma.mjs"   # T008
Piste B (US2) : "comparisonProps + fixtureAssetIds sur ParitySubject dans extract/figma/visual-parity/subjects.ts"  # T023
Piste C (US3) : "La ligne image de docs/FIGMA-CAPABILITY-MATRIX.md § (b)"                                # T038

# Dans la Phase 5, trois fichiers distincts en même temps :
Task: "Descriptions manquantes dans contracts/{carte,member-picture,member-card}.contract.json"   # T035
Task: "La réponse dans docs/handoff/08-status-what-doesnt-work.md"                    # T040
Task: "La datation de CLAUDE.md:19"                                                   # T041
```

---

## Implementation Strategy

### MVP d'abord (US1 seule)

1. Phase 1 (Setup) — worktree autonome, départ vert prouvé, états d'avant capturés
2. Phase 2 (Foundational) — **la sonde T005 en premier** : elle est la seule prémisse non mesurée du plan
3. Phase 3 (US1) — la boucle §VII + §II jusqu'à la porte verte
4. **STOP et VALIDER** : soumettre le contrôle aux trois cas adverses (perte, interversion, sans accueil) ; il doit échouer sur les trois. `npm run eval` imprime son `N/N`.
5. À ce point, le dégât le plus grave du système — une perte silencieuse derrière un rapport vert — est fermé **sans le fichier client**.

### Livraison incrémentale

1. Setup + Foundational → fondation prête
2. US1 → le rapport de photos cesse de mentir (MVP)
3. US2 → la porte de mesure cesse de mentir ; la pire ligne redevient un vrai défaut
4. US3 → la dague cesse d'être muette ; la doc répond seule
5. Phase 6 → le reçu vif, quand la précondition FR-005 est levée et la fenêtre owner ouverte
6. Phase 7 → clôture, avec ce qui reste ouvert écrit noir sur blanc

### Stratégie à plusieurs

1. Setup + Foundational ensemble ; **T005 avant tout le reste**
2. Ensuite : A sur US1 (`core/` + `scripts/`), B sur US2 (`extract/figma/visual-parity/`), C sur US3 (`docs/` + contrats)
3. **Deux sérialisations** entre pistes : `core/emit-figma-script.ts` (US1 T012–T017, puis US3 T034) **et les trois reçus de re-pin** (T021 puis T037 — jamais en même temps)
4. **Un seul sweep à la fois** : `evals/.scratch` est un chemin unique

---

## Notes

- `[P]` = fichiers différents, aucune dépendance ; `[Story]` trace la tâche à sa user story
- Commiter après chaque tâche ou groupe logique ; s'arrêter à chaque checkpoint pour valider la story seule
- **Vérifier que la fixture échoue avant d'implémenter** — c'est la preuve, pas une formalité
- Ce que 017 **ne ferme pas** et qu'il ne faut pas laisser croire fermé : la lacune de capacité A5 (transport, ouverte et nommée), `DW-014-002` (l'instrument rend `emit-html`, jamais la surface React livrée), **SC-006-vif** (la clause n'atteint le canevas qu'au lot de régénération de la fenêtre vive — et **aucune porte automatique ne le détecte**, `parity/diff.ts` ne comparant pas les descriptions), `D-016-REPEAT-SAMPLE-PAR-VARIANTE`, `D-016-SECTIONS-LOCALES-CARTES`, le 2ᵉ plan photo de MemberCard, les 89 littéraux hors géométrie
