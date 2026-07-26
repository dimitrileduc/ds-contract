---
description: "Task list — 006-google-reviews-block"
---

# Tasks: Bloc « Avis Google » — reconstruction native gouvernée

**Input**: Design documents from `/specs/006-google-reviews-block/`
**Prerequisites**: plan.md, spec.md (4 user stories, 23 FR, 8 SC, 7 clarifications), research.md (R1–R25),
data-model.md (2 contrats + entités de preuve), contracts/ (3 interfaces épinglées), quickstart.md

**Tests** : ce dépôt prouve par **évals** (règle des claims : fixture → eval → claim, Constitution II).
Les tâches d'éval ci-dessous ne sont donc **pas optionnelles** — elles sont le mécanisme de preuve et
**précèdent** toute phrase de doc. Les tâches de mesure pixel (`pages:compare`, jambes A/B/C de R11)
jouent le même rôle pour le canevas.

**Organisation** : par user story. La preuve (US2) est **bracketante** — armée en Phase 3, **fermée en
Phase 7** ; c'est le précédent 004 (un garde-fou s'arme avant les gestes qu'il observe).

## Format : `[ID] [P?] [Story?] Description avec chemin`

- **[P]** : parallélisable (fichiers différents, aucune dépendance sur une tâche non terminée).
- **[Story]** : `[US1]`…`[US4]` — présent uniquement dans les phases de user story.
- **fileKey Piqueray** : `d9FYAUcqdcNtsuaMgLefvJ` · page `Pages` = `210:325`.
- **Les node ids de l'ère 003 sont PÉRIMÉS** jusqu'au re-scan T009 (005 a supprimé 2 pages, déplacé
  18 icônes, redimensionné Section-header 1552→1550, reconstruit le Footer) — FR-022.
- **Où tourne quoi** (R15) : dans le worktree → `pages:selftest`, `pages:compare`, scripts bridge.
  Sur le **checkout principal** `/Users/dlstudio/.superset/projects/ds-contracts-poc` → tout le reste
  (`npm run eval` symlinke `ROOT/node_modules`, il ne tourne **pas** dans un worktree).

---

## Phase 1 : Setup (infrastructure partagée)

**But** : rendre la branche exécutable, poser la ligne de base, et lever les deux verrous qui bloquent
tout geste (le merge 005 et la collision de numéro). **Aucune écriture canevas.**

- [X] T001 **Merger la spec 005 dans la branche 006** : `git merge 005-figma-source-cleanup` depuis `/Users/dlstudio/.superset/worktrees/ds-contracts-poc/006` — prérequis **dur** (R12/R16) : sans lui le dépôt décrit un fichier Figma qui n'existe plus, et `extract/figma/page-parity/bridge/checkpoint.js:26` lit encore `/^003\/[^/]+\/[^/]+$/` ⇒ **aucun label `006/…` posable** ⇒ FR-003 inatteignable. Vérifier après merge que la regex lue est bien `/^\d{3}\/[^/]+\/[^/]+$/`. Ne **jamais** contourner en préfixant `003/006-…` (fausse attribution de spec dans l'historique du fichier).
- [X] T002 [P] `npm install` **dans ce worktree** — il n'a pas de `node_modules` ; confirmer `FIGMA_TOKEN` présent dans l'environnement.
- [X] T003 [P] `npx playwright install chromium` (ou `PLAYWRIGHT_CHROMIUM_PATH`) — requis par la jambe A (rendu headless) et par `extract:figma:visual`.
- [X] T004 [P] Créer l'arborescence de preuves : `specs/006-google-reviews-block/{measures,inventory,ledger,proofs}/` + `specs/006-google-reviews-block/decisions.md` (journal **append-only**, format 003 : une entrée datée par décision/geste, avec son reçu).
- [X] T005 **Ligne de base des gates AVANT tout travail 006**, sur le **checkout principal** : `npm run build && npm run parity && npm run eval && npm run plugin:check && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && npx tsc -p tsconfig.build.json` → consigner le résultat **tel quel** dans `specs/006-google-reviews-block/decisions.md`, y compris les rouges. `extract/figma/visual-parity/subjects.ts:251-252` (`variantName: 'Property 1=Outilne noir'`), `evals/harness.ts` et `parity/snapshots/figma-components.json` portent encore l'orthographe Bouton **pré-005** que 005 a délibérément laissée ⇒ **`extract:figma:visual` peut être rouge pour une raison étrangère à 006** (R12 §4). ⚠️ **Portée de cette échappatoire, à ne PAS élargir** : `extract:figma:visual` **n'est pas un des 8 gates**, et 005 a clôturé sa volée **8/8 verte avec `parity` à zéro constat actif** (R12) — donc **`parity` est attendu VERT dès T005**. Un `parity` rouge ne serait pas « hérité » : ce serait un constat à investiguer avant d'aller plus loin. Noter aussi le `N/N` vivant d'évals affiché (sert au re-sync des compteurs, T081).
- [X] T006 **STOP-GATE owner — collision de numéro de spec (R24)** : `BACKLOG-SPEC-006-figma-styles-structure.md` (racine, arrivé au merge T001) et `specs/005-figma-source-cleanup/RAPPORT-CLOTURE.md:27-28` assignent un **autre** périmètre à « spec 006 », dont un item (Section-header enfants FIXED 1550 → FILL, ré-adoption ×7) qui **contredit frontalement FR-008**. Trancher avec l'owner, consigner dans `decisions.md`. Recommandation (a) : 006 reste « Avis Google » seule, les deux réparations partent vers un **nouveau numéro**, `BACKLOG-SPEC-006-*.md` est renuméroté et `RAPPORT-CLOTURE.md:27-28` amendé — pour que son pointeur ne devienne pas orphelin en silence.
- [X] T007 [P] `npm run pages:selftest` dans le worktree → **5/5 verts** avant d'étendre l'instrument (on ne construit pas sur un harnais non vérifié).
- [X] T008 [P] Relever la ligne de base du ledger et du format de verdict : lire `extract/figma/page-parity/README.md` + `specs/003-externalize-figma-components/contracts/page-proof.md` et confirmer dans `decisions.md` que l'interface 003 est réutilisée **sans amendement** (condition d'acceptation du flag `--regions`, cf. `contracts/region-proof.md` §0).

**Checkpoint** : 005 mergée, checkpoint 006 posable, ligne de base des gates écrite, périmètre de la
spec tranché → les mesures peuvent commencer.

---

## Phase 2 : Foundational (prérequis bloquants)

**But** : établir l'**état réel** du fichier vivant et **toutes les valeurs mesurées**, avant qu'une
seule ligne de contrat soit écrite. ⚠️ **Bloque toutes les user stories.** Aucune écriture canevas :
tout est lecture seule ou hors ligne.

### 2a — État réel du fichier (lecture seule)

- [X] T009 **Re-scan positionnel des 9 maquettes** via `extract/figma/page-parity/bridge/scan.js` (pont desktop figma-console : `figma_execute` + `loadAllPagesAsync`, seule route vers la page `Pages` `210:325`) → `specs/006-google-reviews-block/inventory/scan-<date>.json`. Scanner **par position, jamais par nom** (FR-001). Les 9 maquettes attendues : Accueil, Portes de garage, Portes de garage résidentielles, Portes de garage industrielles, Motorisation, Portes d'entrée, Dépannage/SAV, À Propos, Contactez-nous — **le scan fait foi**, pas cette liste. **Relever au passage l'état post-005 des pièces gouvernées que 006 réemploie** (`Étoile`, `check`, et les pages où elles vivent après le déplacement des 18 icônes) et le consigner dans `decisions.md` — c'est le **seul reçu de FR-023** (« pièces prises dans leur état post-005 »), que R5 ne couvre que pour le Bouton.
- [X] T010 Extraire de T009 l'inventaire des occurrences → `specs/006-google-reviews-block/inventory/occurrences.json` : par occurrence `{maquette, groupNodeId, aplatNodeId, bbox{x,y,w,h}, imageHash}`. **Lire l'`imageHash` sur les 8 occurrences, pas sur 2** (003 n'en avait vérifié que 2) — FR-001/FR-006. Publier l'inventaire **avant toute mutation**.
- [X] T011 **Trancher les divergences** trouvées en T010 (autre image, autre largeur, autre nombre d'avis, imbrication différente) : chacune **nommée et arbitrée avec l'owner** dans `decisions.md` **avant** de toucher l'occurrence concernée — jamais absorbée dans un cas moyen (FR-006, US1 §4). Zéro divergence est aussi un résultat, à consigner. **Puis réconcilier le NOMBRE** : les tâches d'adoption T049-T056 sont écrites pour **8 occurrences nommées**. Si le recensement en rend un autre nombre, ou d'autres maquettes, **amender la liste de tâches** (ajouter ou retirer une tâche d'adoption par écart, avec son répertoire `proofs/<maquette>/`) et le dire dans `decisions.md` — le scan fait foi, jamais la liste (FR-001). Un écart de nombre absorbé en silence ferait échouer SC-002 (« autant d'entrées que d'occurrences recensées ») sans que rien ne le signale.
- [X] T012 Écrire `extract/figma/page-parity/bridge/aplat-source.js` — script bridge **lecture seule** : `getNodeByIdAsync(aplatNodeId)` → `fills.find(f => f.type === 'IMAGE')` → `getImageByHash(paint.imageHash).getBytesAsync()` → POST vers `receiver.mjs` `/png` (même transport b-fetch que `capture.js`, `expectNonce` exigé). Sortie : `specs/006-google-reviews-block/measures/aplat-source.png` + side-car `aplat-source.json` `{imageHash, sha256, largeurNative, hauteurNative, scaleFactor, nodeId, maquette, capturedAt}` avec `scaleFactor = largeurNative / 1552`. **Les octets d'origine, jamais un recadrage de capture de page** (copie lossy d'une copie lossy) — `contracts/measure-record.md` §1.
- [X] T013 **Portée de SC-001** : vérifier au re-scan T009 que la copie de la maquette Accueil qui vivait sur `DS · Organisms` a bien été supprimée à la clôture 005 (compteur T113 « Accueil-copy deleted ») → écrire noir sur blanc dans `decisions.md` que le relevé « 0 occurrence » porte sur la page `Pages` (`210:325`), et ce que couvre exactement une revendication de portée « fichier entier » (R25).

### 2b — Sonde de plancher et décision de seuil

- [X] T014 Construire la **jambe A** — `extract/figma/aplat-parity/` (nouveau frère de `extract/figma/state-photo/`) : rendu depuis `extract/figma/visual-parity/render.ts`, diff depuis `extract/figma/visual-parity/img.ts`, seuil **importé** (jamais réinventé — forme exacte de `state-photo/run.ts`), + un selftest à **2 fixtures**. Compare **rendu code ↔ crop de `aplat-source.png`**, hors ligne, ~30 s par itération, **zéro écriture canevas** (R11). **Câbler deux scripts npm** — `aplat:run` et `aplat:selftest` — et **inscrire `aplat:selftest` dans les volées T069 et T086** : un instrument qu'aucune volée ne joue n'est pas un instrument, et la jambe A est ce sur quoi repose la décision d'arrêt de T040.
- [X] T015 **Sonde de plancher de fidélité** : rendre une carte d'essai en headless, la comparer au crop correspondant de l'aplat via T014, **publier le chiffre + le triptyque à l'owner**. Plancher estimé **8-12 % de la région** (substitution de police : le bloc rend en Montserrat, l'aplat est un raster de la police Trustindex ; ~650 glyphes dont l'encre diverge avant tout déplacement) — R3(b).
- [X] T016 **STOP-GATE owner — décision de seuil, écrite dans `decisions.md` AVANT la Phase 3 et AVANT qu'un contrat soit rédigé (T031)** (R3). **Le chiffre décidé ici doit être reporté dans `spec.md` (FR-016 + SC-004)**, qui ne fixe plus de valeur en dur : sans ce report, SC-004 n'est pas vérifiable à la clôture (T086). Doivent y figurer : (1) le **dénominateur = bbox de l'aplat** (1552 × ~328 ≈ 509 056 px), publié **à côté** de celle du `GROUP` (1552 × 459) pour qu'on ne puisse pas accuser le rapport d'avoir choisi le dénominateur flatteur ; (2) le seuil retenu, sachant que le « ≤ 2 % » de FR-016 appartient à un **autre** instrument (`extract/figma/visual-parity/tolerance.ts`) et que 2 % de **page** autoriserait **26 à 46 %** de bloc faux ; (3) la séparation **fidélité structurelle** (boîtes, positions, comptes, couleurs — verrouillable) vs **fidélité raster** (rastérisation des glyphes, dominée par la substitution de police = conséquence de la gouvernance, pas défaut) ; (4) la règle 005 doublée : **écrire l'écart attendu AVANT d'exécuter, STOP à toute déviation dans les deux sens** (plus petit que prévu est aussi suspect).

### 2c — Mesure, faisabilité, transcription

- [X] T017 Remplir `specs/006-google-reviews-block/measures/mesures-aplat.md` — une ligne **par valeur de design**, colonnes `rôle | lecture A | lecture B | valeur retenue | arbitrage | canal | reçu (crop)` (`contracts/measure-record.md` §2). Méthodes imposées : couleurs = RVB modal sur patch 5×5 à **deux emplacements** ; tailles de texte = hauteur de capitale ÷ ratio de la fonte, recoupée par l'interligne ; distances = profils d'encre X et Y sur **deux occurrences différentes** du même écart ; rayons = extension de l'arc de coin ; comptes/booléens = lecture à ≥ 4× avec un crop committé par fait. **Règle de tranchage** : accord (Δ ≤ 1 px / ≤ 1÷255 par canal / ≤ 0,5 px) → `accord 2/2` ; sinon dans l'ordre `pas-gouverné` → `pixel` → `médiane-3` (les **trois** chiffres publiés, jamais de moyenne silencieuse). **Aucune valeur n'entre dans un contrat sans sa ligne** (FR-009).
- [X] T018 Remplir `specs/006-google-reviews-block/measures/faisabilite-canaux.md` — table à 5 verdicts **calculée depuis le code** (importer `LITERAL_CHANNELS`, `LITERAL_VALUE_RE`, `DECLARED_CHANNELS` de `packages/schema/src/contract-schema.ts`) : `token` | `literal` | `declared-draw` (les 6 : `aspect-ratio`, `text-overflow`, `text-transform`, `text-decoration-line`, `text-align`, `font-family`) | `declared-annotate` (les 36) | `refusé`. Chaque `(part, canal, valeur mesurée)` classé ; toute impasse redessinée autour **avec reçu nommé**. Après ça, `npm run build` + `npm run figma:plan` ne sont plus qu'une **confirmation** (R10).
- [X] T019 Appliquer les replis déjà tranchés de R10 et **publier les deux chiffres à chaque alignement** : ombre **refusée** (aucun token d'ombre, `box-shadow` hors `LITERAL_CHANNELS`) ⇒ séparation carte/fond **par la couleur** (carte `{color.blanc}` sur fond `{color.bleu-clair}`) ; rayon court ⇒ `literals: {"border-radius": "8px"}` ; gris neutres ⇒ aligner sur `{color.noir}`/`{color.bleu-gris}` si Δ imperceptible **en publiant le Δ**, sinon `literals: {color: "#5F6368"}` ; espacements hors échelle ⇒ `literals` ; troncature multi-lignes (`-webkit-line-clamp`) **refusée** ⇒ transcrire exactement ce que le widget a déjà tronqué, **ellipse comprise**. Un alignement sur un token est une **décision de gouvernance, pas une mesure** — il se lit comme tel dans `measures/mesures-aplat.md`.
- [X] T020 **Trancher l'axe `note`** depuis la mesure (R7) : compter les étoiles **de chaque avis** sur l'aplat. Si tous à 5/5 (cas le plus probable pour un widget Trustindex) ⇒ **supprimer `note`** : 5 étoiles fixes, une limite nommée, zéro axe de variante, zéro produit cartésien. Si étoiles partielles ⇒ sous-livrable nommé (`star-outline` / `star-half` en glyphe interne D7, cohérent avec R4) **et** repli R8 (cartes en instances frères explicites `component{id:"ds.review-card", props:{note:"5"}}`) — jamais une improvisation au dessin. Décision consignée dans `decisions.md`.
- [X] T021 Transcrire le contenu réel de chaque occurrence → `specs/006-google-reviews-block/measures/transcription-<maquette>.md`, colonnes `champ | crop (≥ 4×) | valeur saisie (verbatim, ellipse comprise) | confiance (sûre|douteuse|illisible) | relecteur` — **relu en seconde passe par un relecteur nommé** (`contracts/measure-record.md` §3). Tout fragment `illisible` ou tronqué est **listé avec la valeur retenue à sa place**, jamais comblé en silence ; espaces de fin, apostrophes typographiques et accents dégradés par la compression **déclarés non garantis** (FR-010 : fidèle au visible, non garanti au caractère près).
- [X] T022 Recadrer l'**avatar photo** depuis `measures/aplat-source.png` à sa **résolution native** → `specs/006-google-reviews-block/measures/avatar-photo.png` + provenance et **limite de résolution** écrites dans `decisions.md` (FR-004/FR-010 : contenu, pas structure ; jamais une photo de substitution).
- [X] T023 Écrire dans `decisions.md` la **déclaration d'inapplicabilité du ledger côté aplat** (R21) : l'état « avant » est un unique `RECTANGLE` ⇒ `bridge/customizations.js` renverra honnêtement `entrees: []` et `pages:ledger:check` sortira **vert** — un vert qui **n'atteste rien** au-dessus d'un contenu transcrit. Le relevé de transcription (T021) le remplace ; `ledger/google-reviews.json` reste au format 003 mais est **saisi à la main** (contenu imbriqué des cartes = angle mort documenté de `customizations.js`, + les 8 fills photo).

**Checkpoint** : état réel relevé et divergences tranchées, octets natifs extraits, seuil décidé par
l'owner, **toutes** les valeurs mesurées avec leur ligne et leur canal, contenu transcrit et relu →
les user stories peuvent démarrer.

---

## Phase 3 : US2 (P2) — Instrument de preuve ARMÉ (bracketante)

**Goal** : donner à chaque occurrence un **numérateur et un dénominateur qui lui appartiennent**, et
une identité byte prouvée pour l'instrument existant. Ordonné **avant** US1 car un garde-fou s'arme
avant les gestes qu'il observe — la preuve se **ferme** en Phase 7 (T077–T080).

**Independent Test** : `npm run pages:selftest` passe **7/7** ; une exécution **sans** `--regions`
produit un `verdict.json` **byte-identique** à aujourd'hui ; l'interface 003
(`specs/003-.../contracts/page-proof.md`) n'a reçu **aucun amendement**.

- [X] T024 [US2] Ajouter le flag `--regions <fichier.json>` à `extract/figma/page-parity/cli.ts` — parsing additif ; **argument inconnu ⇒ erreur d'usage, exit 2** (comportement 003 inchangé, « jamais de défaut silencieux »). Side-car = **une entrée par maquette** (chaque frame a son propre décalage Y), coordonnées **relatives à la frame capturée**, en pixels de capture (`exportAsync` @1×).
- [X] T025 [US2] Étendre `extract/figma/page-parity/compare.ts` : **un seul** `pixelmatch` pleine planche comme aujourd'hui ; les deux compteurs se lisent sur **le même bitmap de diff**. **Aucun second diff, aucun rééchantillonnage, aucun recalage** (règle R2 de la recherche 003). Ajouter **en fin** de `PixelVerdict` les 4 champs **optionnels** `region`, `regionDiffCount`, `regionPct` (= `regionDiffCount / (w × h)`, **le chiffre de FR-016**), `outsideDiffCount` (**doit valoir 0**, SC-003). **Refus nommé si `regionAvant ≠ regionAprès`** — mesurer un rectangle mouvant n'est pas une preuve, c'est le piège `GROUP` qui se déclenche.
- [X] T026 [US2] Étendre `extract/figma/page-parity/report.ts` : les 4 colonnes n'apparaissent dans `verdict.md` **que si** au moins une entrée porte une région (sinon markdown byte-identique) ; quand une région existe, le triptyque cadre **`région ∪ diffBox padded`** — pour montrer le bloc, pas une lamelle de 24 px. **Codes de sortie inchangés** (`0` identical · `1` écart chiffré · `2` refus).
- [X] T027 [US2] +2 cas dans `extract/figma/page-parity/selftest.ts` (**5 → 7**) : `region-inside` (un pixel inversé **dans** le rectangle ⇒ `regionDiffCount 1`, `outsideDiffCount 0`) et `region-outside` (le miroir). **Réutiliser la paire de fixtures `one-pixel` existante — aucun PNG nouveau**, seulement des rectangles différents. Mettre à jour le compteur dans `extract/figma/page-parity/README.md`.
- [X] T028 [US2] **Prouver l'identité byte** : exécuter `pages:compare` **sans** `--regions` sur une paire de fixtures et vérifier que `verdict.json` est byte-identique à la sortie actuelle (`JSON.stringify` omet `undefined`) — le cas de selftest existant qui compare deux exécutions par `Buffer.equals` doit continuer de passer **sans modification** (`contracts/region-proof.md` §3).
- [X] T029 [US2] Éval **`pages-compare-regions-additive`** dans `evals/run.ts` (+ fixture) : les 2 cas de selftest de `--regions` **et** l'assertion d'identité byte d'un run sans le flag. Fixture → éval → claim, **avant** toute phrase de doc sur la capacité « preuve par région » (R14 #4).
- [X] T030 [US2] Générer les side-cars de région **depuis le scan committé, jamais saisis à la main** : `specs/006-google-reviews-block/proofs/<maquette>/region.json` à partir de `inventory/occurrences.json` (T010).

**Checkpoint** : `pages:selftest` **7/7**, identité byte prouvée, éval en place, side-cars de région
générés → l'instrument observe correctement ce que US1 va faire bouger.

---

## Phase 4 : US1 (P1) — Le dernier aplat tiers devient un composant gouverné 🎯 MVP

**Goal** : deux contrats versionnés génèrent le code React **et** les deux masters Figma, puis les
**8** occurrences de l'aplat sont remplacées par des instances gouvernées portant le contenu réel.

**Independent Test** : un relevé du fichier vivant **par position** ne retourne plus aucun nœud portant
l'image aplatie du widget dans le périmètre du bloc ; chaque occurrence est une instance d'un master
gouverné ; les deux composants existent en contrat et en code généré, produits **sans étape manuelle**.

### 4a — Contrats, glyphe, chaîne de génération (aucune écriture canevas)

- [X] T031 [US1] Écrire `contracts/review-card.contract.json` — `id: ds.review-card`, `name: "ReviewCard"` (PascalCase imposé : c'est le nom du composant React **et** du set Figma à la création), `category: "molecule"`, `version: "1.0.0"`, `semantics: {element:"article", provenance:"authored"}`. **`anchors.figma.fileKey: "d9FYAUcqdcNtsuaMgLefvJ"` dès ce commit** (`componentSetKey` / `nodeId` restent `null` ; **`dumpedAt` = date d'extraction de l'aplat**, T012) — sinon le garde-fou « mauvais fichier » est **éteint** (R18). Props + anatomie mono-racine per `data-model.md` §1. Chaque part porte dans sa `description` la **ligne de mesure** dont elle vient (FR-009).
- [X] T032 [US1] Écrire dans les `description` des props `initialeVisible` et `photo` la **limite nommée** : l'exclusion pastille/photo est une **convention, pas une contrainte de schéma** — `visibleWhen` n'a pas de négation, `equals` est réservé aux enums, et un axe d'enum serait refusé par `repeat` (les champs enum par item sont refusés, `core/emit-react.ts:692`) ce qui forcerait les 5 cartes à partager un seul mode d'avatar alors que le fait mesuré est **4 initiales + 1 photo**. Deux booléens à `true` rendent les deux avatars ; deux à `false` rendent une boîte vide (`data-model.md` §1, point 1).
- [X] T033 [US1] Écrire `contracts/google-reviews.contract.json` — `id: ds.google-reviews`, `name: "GoogleReviews"`, `category: "section"`, `version: "1.0.0"`, `semantics: {element:"section", provenance:"authored"}`, mêmes ancres. **Périmètre = le rectangle de l'aplat seul** (1552 × hauteur mesurée), **pas le `GROUP`** — l'instance de Section-header reste un frère intact (FR-008). **Hauteur du root contrainte à la hauteur mesurée de l'aplat** (neutralité de hauteur, R20 §1). Part `repeat{itemsProp:"avis", sample:[…5 enregistrements GÉNÉRIQUES…]}` + `component{id:"ds.review-card"}` ; prop `avis` en `arrayOf` avec `bindings.figma.kind: "NONE"` (**obligatoire** pour un `arrayOf`, **refusé** pour un scalaire), chaque champ nommant **par nom** une prop scalaire de même type de `ds.review-card`. ⚠️ **Conditionnel au verdict de T020** : tout ce qui précède suppose la conclusion « 5/5 partout, axe `note` supprimé ». Si T020 a trouvé des **notes hétérogènes**, appliquer le **repli R8** — cartes en **instances frères explicites** (`component{id:"ds.review-card", props:{note:"…"}}` × N, les valeurs fixes étant autorisées dans `component.props`), **sans `repeat`** : plus verbeux, perte du tableau vivant `avis` côté React, mais exact. Dans ce cas T062 et T065 changent aussi de sujet (voir leurs notes).
- [X] T034 [US1] **Interdit dur appliqué dans les deux contrats : aucun `component`-ref vers `ds.button`** (R5) — `findComponentByName(spec.dep)` (`core/emit-figma-script.ts:3098-3106`) cherche `n.name === name` et **lève** si introuvable : le contrat dit `Button`, le master vivant s'appelle « Bouton » ⇒ le script poussé **échouerait**, et une « réparation » naïve créerait un **second set Button**. Les flèches de carrousel et le CTA éventuel de la barre-résumé sont **dessinés en parts** (frame + `icon.asset` + texte), le texte du CTA étant un `content` de la section (aucune prop texte parente n'est transmissible à un enfant : `mapDepProps` résout `"{parentProp}"` depuis la map de substitution des **variantes**, `emit-figma-script.ts:1606-1635`). Perte de réemploi **nommée au rapport** (FR-007).
- [X] T035 [P] [US1] Créer `assets/icons/google.svg` — **glyphe interne, classe D7** (`parity/diff.ts:809-833` : un asset consommé par un `icon.asset` non templaté n'est pas orphelin sans entrée au registre ; précédents `check.svg`, `close.svg`). **`contracts/icons.registry.json` reste inchangé** : la marque d'un tiers n'entre pas dans le menu d'icônes offert à tous les composants (R4). Joindre la note de marque déposée à côté du fichier.
- [X] T036 [US1] Chaîne de régénération complète sur le **checkout principal** : `npm run build && npm run figma:plan && npm run catalog && npm run verify:catalog`. Vérifier que `sortByDependencies` donne bien `02-button, 03-checkbox, 04-reviewcard, 05-googlereviews, 06-input, 07-select, 08-textarea`.
- [X] T037 [US1] **Purger les 6 orphelins de `figma-sync/` dans le MÊME commit relu** que l'ajout des contrats : `git rm figma-sync/03-input.js figma-sync/04-input.js figma-sync/04-textarea.js figma-sync/05-select.js figma-sync/05-textarea.js figma-sync/06-textarea.js`, puis `npm run golden:update && npm run parity`. **Pourquoi c'est bloquant** : `golden-generated-output` itère **les clés de golden**, donc un fichier renuméroté laisse l'ancien sur disque, **toujours conforme à golden**, pendant que le fichier réellement généré n'est plus épinglé — une régression de générateur y deviendrait **invisible** (R13). Le diff de golden est la surface de risque relue ; **dire la purge au journal**.
- [X] T038 [US1] Valider les deux scripts générés **à blanc** contre `scripts/plugin-engine-mock-figma.mjs` — aucune exécution live avant ce vert (Constitution VII).
- [X] T039 [US1] **Vérifier la présence de la chaîne `d9FYAUcqdcNtsuaMgLefvJ` dans les deux scripts émis** (`figma-sync/04-reviewcard.js`, `figma-sync/05-googlereviews.js`) **avant** toute exécution — c'est le garde-fou « mauvais fichier » armé, et les octets gardés sont épinglés par golden (R18).

### 4b — Jambe A : convergence hors ligne (aucune écriture canevas)

- [X] T040 [US1] **Boucle de convergence** via `extract/figma/aplat-parity/` (T014) : rendu code ↔ crop de `measures/aplat-source.png`, itérations illimitées à ~30 s. **Itérer le CONTRAT, jamais le rendu.** `img.ts` ne rééchantillonne **jamais** : rendre le côté code à la largeur honnête correspondant au `scaleFactor` et **publier tout résidu d'échelle**, jamais rééchantillonner la référence. S'arrêter au chiffre décidé en T016.
- [X] T041 [US1] **Signer la jambe A dans `decisions.md`** (chiffre atteint + triptyque + accord owner). C'est le verrou de R19 : l'adoption ne commence que jambes A **et** B signées — c'est ce qui rend **une seule** poussée générative suffisante et la boucle hors-ligne structurante, pas décorative.

### 4c — Première poussée générative (première écriture canevas)

- [X] T042 [US1] `checkpoint 006/masters/creation` via `bridge/checkpoint.js` (`saveVersionHistoryAsync`) → consigner `{label, versionId}` dans `decisions.md` (FR-003), **puis** captures **avant** ×9 via `bridge/capture.js`, **chacune vérifiée non vide et à la bonne taille** (FR-002, règle before-capture : jamais un sous-ensemble pilote).
- [X] T043 [US1] `npm run figma:serve` **restreint aux deux scripts de composant** + plugin Sync Runner ; exécuter **`04-reviewcard.js` PUIS `05-googlereviews.js`** (la section instancie la carte et la cherche par nom : elle doit exister d'abord). ⚠️ **Jamais `01-tokens.js`** (il ré-upserterait les collections de variables du fichier), ⚠️ **jamais `batch-01.js`** (il reconstruirait l'intérieur des variantes du Bouton et **détruirait ses slots d'icônes** — danger identifié et refusé dès 001). Repli transport : route `GET /file?name=` de `receiver.mjs` (les scripts font 40-50 Ko) — mais alors `.runner-result.json` n'existe pas et les ancres s'écrivent à la main.
- [X] T044 [US1] Captures **après** ×9 → `npm run pages:compare` → **exiger 9/9 identical**. Créer des pages et des masters ne doit toucher **aucun** pixel de maquette ; c'est aussi le détecteur si `01-tokens.js` ou `batch-01.js` a été exécuté par erreur (`contracts/push-protocol.md` §6).
- [X] T045 [US1] `npm run anchors:writeback` (consomme `figma-sync/.runner-result.json`), **puis re-générer** — l'ancre entre dans les octets émis — puis `npm run golden:update`.
- [X] T046 [US1] **Jambe B (portage)** : +2 sujets dans `extract/figma/visual-parity/subjects.ts` **avec `renderWidth`** (les deux masters sont à largeur fixe) → `npm run extract:figma:visual -- --write-baseline`, **une seule fois, après le dernier amend**. C'est ce qui prouve que le canevas porte fidèlement ce que le contrat dit — *la* revendication de la route contrat-d'abord. → **signer dans `decisions.md`**.
- [X] T047 [US1] `checkpoint 006/masters/rangement` → déplacer les deux sets vers `DS · Molécules` et `DS · Organisms`, supprimer les pages auto-créées à la première création → **9/9 identical**. ⚠️ **Ne PAS renommer les masters ici** : la section cherche sa carte **par nom**, le renommage français est le **dernier** geste de la spec (T076).
- [X] T047a [US1] **Rafraîchir `parity/snapshots/figma-components.json`** — sans lui le gate parity est **aveugle aux deux composants livrés** : `parity/diff.ts:88` lit ce snapshot **committé** (jamais le fichier vivant), donc tant qu'il ne porte pas `ReviewCard` / `GoogleReviews`, `npm run parity` sort **vert sans les avoir vérifiés** — un vert qui n'atteste rien (Constitution III + V). Route : script d'inventaire `parity/extract-figma.plugin.js` en **LECTURE** via le pont desktop (`figma_execute`) — précédent exact spec 004 T035 (« n'édite pas, D10 »). Le script v3 émet `fileKey` + `extractedAt` que `diff.ts` recoupe contre l'`anchors.figma.fileKey` des contrats (T031/T033) : vérifier que le recoupement passe. **Prérequis dur de T061** (son corps édite les `nestedInstances` de `GoogleReviews ⊃ ReviewCard`, qui n'existent pas sans ce refresh) **et de T069**.

> **À partir d'ici, plus aucun amend de `ds.google-reviews`** (R19 règle 2) : `amendSet` supprime et
> reconstruit l'intérieur de chaque variante — il détruirait le contenu des avis sur **toutes** les
> occurrences déjà adoptées. Survivent : id du set, `key`, ids de variantes, **clés** de propriétés de
> composant. Meurent : overrides de propriétés d'instances **imbriquées**, overrides de texte bruts,
> **overrides de fill image**.

### 4d — Adoption, **une occurrence à la fois** (jamais de lot)

**Protocole imposé par occurrence** (`quickstart.md` Phase 5, `contracts/push-protocol.md` §6), dans
cet ordre : (1) lire la région depuis le scan → `proofs/<maquette>/region.json` et **écrire l'écart
attendu avant d'exécuter** ; (2) détecter les personnalisations avant remplacement, en notant que le
ledger reviendra vide et que ce vide **ne prouve rien** ; (3) `checkpoint 006/adoption/<maquette>` +
captures **avant** ×9 ; (4) **lire-tout / écrire-tout sur les DEUX enfants du `GROUP` ensemble** — lire
les bornes du Section-header **et** de l'aplat, retirer l'aplat, insérer l'instance, puis **ré-affirmer
les positions des deux enfants dans la même transaction** (correctif 003 : ne jamais toucher un enfant
en supposant l'autre stable) ; (5) appliquer le contenu réel **par propriétés**, jamais d'override brut
(R19 règle 1) ; (6) **garde FR-012 immédiate** : relire la hauteur de la frame **et les bornes de tous
les frères du `GROUP`** — un écart ⇒ **STOP**, restaurer le checkpoint, ne pas passer à la suivante ;
(7) captures **après** ×9 → `pages:compare -- --regions …` ; (8) **revue à l'œil sur les crops,
obligatoire** ; (9) commit ensemble : verdict + ledger + entrée `decisions.md` + accord owner **avant**
l'occurrence suivante.

**Lectures dures à chaque occurrence** : `regionPct` = le chiffre de FR-016 · `outsideDiffCount` **doit
valoir 0 partout, `Motorisation` comprise** (SC-003) · toute ligne `dimension-mismatch` ou
`capture-failed` est un **STOP avec décision owner, jamais un point de donnée** (elle vaut
`diffCount: 0` **sans crop ni image**, donc se lit à tort comme « parfait » — R20).

- [X] T048 [US1] Figer dans `decisions.md` l'**ordre d'adoption** des occurrences recensées (**8 attendues** ; depuis `inventory/occurrences.json`, T010 — le chiffre du scan fait foi, liste amendée en T011 si écart) et l'**écart attendu** de chacune, écrit **avant** la première exécution (R3 §4).
- [X] T049 [US1] Adopter l'occurrence **Accueil** — protocole 9 étapes ci-dessus ; artefacts dans `specs/006-google-reviews-block/proofs/accueil/`.
- [X] T050 [US1] Adopter l'occurrence **Portes de garage** — protocole 9 étapes ; artefacts dans `proofs/portes-de-garage/`.
- [X] T051 [US1] Adopter l'occurrence **Portes de garage résidentielles** — protocole 9 étapes ; artefacts dans `proofs/portes-de-garage-residentielles/`.
- [X] T052 [US1] Adopter l'occurrence **Portes de garage industrielles** — protocole 9 étapes ; artefacts dans `proofs/portes-de-garage-industrielles/`.
- [X] T053 [US1] Adopter l'occurrence **Portes d'entrée** — protocole 9 étapes ; artefacts dans `proofs/portes-d-entree/`.
- [X] T054 [US1] Adopter l'occurrence **Dépannage/SAV** — protocole 9 étapes ; artefacts dans `proofs/depannage-sav/`.
- [X] T055 [US1] Adopter l'occurrence **À Propos** — protocole 9 étapes ; artefacts dans `proofs/a-propos/`.
- [X] T056 [US1] Adopter l'occurrence **Contactez-nous** — protocole 9 étapes ; artefacts dans `proofs/contactez-nous/`.
- [X] T057 [US1] Appliquer les **8 fills photo** (override de fill IMAGE sur la part `avatarPhoto`, depuis `measures/avatar-photo.png`) — **après le dernier amend**, c'est la donnée la plus fragile (R19 règle 3) — et les consigner dans `ledger/google-reviews.json` : `type: "image"`, `portePar: "fill IMAGE de la part avatarPhoto (override d'instance imbriquée, A5)"`. → **CLOS SANS OBJET PAR MESURE** (T022 : 0/5 avatar photo, aucune source `avatar-photo.png`) — voir `decisions.md` T057.
- [X] T058 [US1] **Assertion de fin d'adoption** : le verdict global attendu est **exit 1** avec **8 `diff` + 1 `identical` (`Motorisation`)** — écrire « l'instrument est passé » n'aurait ici aucun sens ; **toute autre combinaison est un STOP** (`contracts/region-proof.md` §4). Puis re-scan positionnel : **0 occurrence** du fill image du widget dans le périmètre du bloc (SC-001), le seul fill image restant admis étant l'avatar photo de contenu porté par propriété.
- [X] T059 [US1] Compléter `ledger/google-reviews.json` **à la main** pour le contenu imbriqué des cartes (angle mort documenté de `bridge/customizations.js` : *« ne compare jamais le texte/contenu interne d'une instance nichée »*) — **c'est la seule sauvegarde rejouable** si un amend devenait inévitable (R19 règle 2), donc il doit être **complet et rejouable**, pas décoratif.

**Checkpoint US1** : 2 contrats + code généré + 2 masters natifs + 8 occurrences adoptées, 0 aplat de
widget restant, chaîne traversée sans étape manuelle ni fichier généré retouché.

---

## Phase 5 : US3 (P2) — Aucune régression, ni dans le système ni sur les maquettes

**Goal** : ce composant est vérifié par **les mêmes contrôles que les autres**, et les pièces qu'aucune
page ne peut observer reçoivent une garde dédiée.

**Independent Test** : toutes les vérifications du dépôt passent au vert ; les zones hors bloc des
maquettes porteuses restent identiques au pixel ; `Motorisation` affiche **0 pixel** d'écart.

- [X] T060 [US3] **Re-pointer `scripts/deterministic-roundtrip.mjs` sur `ds.google-reviews`** — son en-tête (`:19-37`) porte la dégradation littérale : *« WHAT IS LOST: composite DEPTH — nested component instances, repeated collections… TO RESTORE: when Piqueray gains a component that composes others, re-point this harness onto it. »* **006 livre exactement ça** ; laisser le harnais sur le Bouton et rapporter le gate vert serait l'omission silencieuse que la constitution désigne comme la faute la plus grave (R23).
- [X] T061 [US3] Réanimer l'éval **`detect-figma-missing-nested-instance`** (vrai **déplacement**, pas réécriture) : son corps édite `parity/snapshots/figma-components.json` (`nestedInstances`) et attend un constat `figma/behind` — re-pointer `Card`/`Avatar` → `GoogleReviews`/`ReviewCard`. Sa condition de réactivation est désormais littéralement remplie (R14).
- [X] T062 [US3] Vérifier `npm run extract:figma:repeat:check` une fois `ds.review-card` créé (exige une série **≥ 3 au gabarit homogène**), **puis** — et seulement si vert — déplacer l'éval **`repeated-children-collection`** hors quarantaine. Si rouge : le dire, laisser en quarantaine, **ne rien promettre**. ⚠️ **Sans objet si T020 a imposé le repli R8** (instances frères, aucune part `repeat`) : dans ce cas l'écrire, laisser l'éval en quarantaine, et **ne pas revendiquer** la capacité collection.
- [X] T063 [US3] Retirer le saut d'ordonnancement de dépendances **par nom** dans `scripts/plugin-engine-check.mjs` — il n'existait que faute de composite chez Piqueray ; c'est un vrai déverrouillage, avec son reçu (R14).
- [X] T064 [US3] Écrire l'éval **`review-card-avatar-exclusivity-is-convention-not-schema`** dans `evals/run.ts` (+ fixture) : épingle que l'exclusion pastille/photo est **nommée, non imposée** — pour qu'elle ne devienne **jamais** une revendication silencieuse (Constitution V).
- [X] T065 [US3] Écrire l'éval **`google-reviews-repeat-renders-sample-on-static-surfaces`** : React mappe le tableau vivant ; `html` / `react-inline` / canevas rendent le `sample` ; `undefined` ne rend rien. ⚠️ **Si T020 a imposé le repli R8**, cette éval change de sujet : elle épingle alors que les cartes sont des **instances frères à props fixes** et qu'**aucun tableau vivant n'existe** côté React — la revendication suit la réalité livrée, jamais l'inverse.
- [X] T066 [US3] Écrire l'éval **`img-part-canvas-placeholder-named`** : la part photo compile en `imgPlaceholder: true` et la légende du composant porte le `†` — **le trou A5 reste ouvert et le rapport le dit** (R6).
- [X] T067 [US3] Écrire le cas de **fidélité de mock** pour ce que le canevas vivant a appris du piège `GROUP` lors des adoptions (T049-T056) : enseigner à `scripts/plugin-engine-mock-figma.mjs` à attraper cette classe **headlessement, pour toujours**. Le correctif a **deux moitiés** (Constitution VII) ; s'il ne s'est rien produit de nouveau sur le canevas, l'écrire et fermer la tâche sans inventer un cas.
- [X] T068 [US3] **Garde de l'angle mort de la maquette témoin (R22)** : `Motorisation` instancie `Bouton` et les glyphes flèches, mais **aucune instance d'`Étoile` ni de `check`** (« Étoile / mail / external-link — 0 usage réel », 005) — elle est **aveugle** aux pièces que 006 introduit. Faire une **relecture directe avant/après du master `Étoile`** (fills, taille, nom, jeu de variantes) et de l'asset `check`, puisque aucune page ne peut les observer. Nommer cet angle mort dans le rapport à côté de SC-003.
- [X] T069 [US3] **Volée complète des gates sur le checkout principal** : `npm run build && npm run parity && npm run eval && npm run plugin:check && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && npx tsc -p tsconfig.build.json` — **plus `npm run pages:selftest` (7/7) et `npm run aplat:selftest` (2/2)**, les deux instruments de la spec. Comparer **ligne à ligne avec la ligne de base T005** : tout rouge doit être soit **hérité ET déjà présent en T005**, soit corrigé, **jamais absorbé**. ⚠️ « Hérité » ne couvre **que** `extract:figma:visual` (orthographe Bouton pré-005, hors des 8 gates) : un rouge de `parity`, `build`, `eval` ou `plugin:check` absent de la ligne de base est une **régression 006**, pas du bruit.

**Checkpoint US3** : 8/8 gates verts (ou rouges hérités nommés), suite d'évals au complet avec son
compteur vivant, garde directe des pièces invisibles aux pages.

---

## Phase 6 : US4 (P3) — Une carte d'avis se produit par propriétés, pas par redessin

**Goal** : prouver que le bloc est **gouverné**, pas seulement vectorisé — une image opaque ne doit pas
avoir été remplacée par un dessin opaque.

**Independent Test** : sans **aucune** opération de dessin, un tiers produit une carte d'avis au contenu
entièrement différent de l'exemple livré, **sur les deux surfaces**.

- [X] T070 [US4] **Surface canevas** — ⚠️ **c'est une mutation canevas comme une autre** : poser d'abord `checkpoint 006/demo/us4` (label ajouté au schéma R16) **puis** captures **avant** ×9, **avant** de créer la page de travail. Ensuite : sur une instance d'essai (hors maquettes, sur cette page de travail), produire une carte entièrement différente en ne touchant **que** les propriétés — `auteur`, `initiale`, `date`, `texte`, `verifie`, et le basculement `initialeVisible`/`photo`. Aucun calque dessiné, dupliqué ni détaché. Capture avant/après dans `proofs/us4-proprietes/`. — ✅ checkpoint `006/demo/us4` (`versionId 2380614847064107676`), 9 captures avant, instance `2192:9623` sur page `2192:9622`, mutation par propriétés seules (carte 3 = Avatar photo), `avant-defaut@2x.png` / `apres-mutation-proprietes@2x.png` (decisions.md Phase 6).
- [X] T071 [US4] **Surface code** : rendre `<GoogleReviews avis={…} />` avec un tableau d'avis entièrement différent (dont un item `photo: true` + `photoUrl`/`photoAlt`) depuis la bibliothèque générée — capture dans `proofs/us4-proprietes/`. Vérifier au passage les **deux cas d'avatar** comme **choix gouverné** et non deux dessins séparés (US4 §2). — ✅ `render-code.mts` (outillage visual-parity inchangé, `repeat.sample` cloné), `code-avis-manufacture@2x.png` 1552×328, carte 3 = vraie photo → les deux cas d'avatar côte à côte, divergence exacte à la frontière A5.
- [X] T072 [US4] Supprimer l'instance d'essai et sa page de travail → `pages:compare` **9/9 identical** (une démonstration ne doit laisser aucune trace sur les maquettes). — ✅ instance+page supprimées ; `pages:compare` **8/9 identical + 1 diff exogène** (Contactez-nous, pied de page décalé 1 px, hors bloc, **prouvé non causé par la démo** : calib-a==calib-b exit 0, before==calib-a rejoue le même diff → édition concurrente exogène, zone disjointe). Nommé, jamais absorbé en « 9/9 ».
- [X] T073 [US4] Écrire au rapport les **limites de cette réutilisabilité**, chacune déjà éval-couverte : l'exclusion pastille/photo est une **convention** (T064) ; l'étoile gouvernée est **orange intrinsèque** et ne se recolore pas ⇒ notes < 3 et demi-étoiles **inexprimables**, et `note` (axe de variante) ne peut de toute façon pas varier par item dans le `repeat` ; la troncature multi-lignes est **refusée** ; le pixel de l'avatar photo est un **override hors contrat** (A5 ouvert, T066). — ✅ quatre limites au rapport (decisions.md Phase 6 T073), pins : `review-card-avatar-exclusivity-is-convention-not-schema`, absence d'axe note + `google-reviews-repeat-renders-sample-on-static-surfaces`, refus troncature, `img-part-canvas-placeholder-named`.

**Checkpoint US4** : les deux surfaces produisent une carte neuve sans dessin, limites nommées et
adossées à des évals.

---

## Phase 7 : Polish & clôture (+ fermeture du bracket US2)

**But** : sceller les preuves, publier les compteurs honnêtes, faire le dernier geste canevas. La
fermeture de la preuve US2 (T077–T080) vient **après** le dernier geste canevas (T076).

- [X] T074 Écrire la **note de limites** de la spec dans `decisions.md` et dans le rapport de clôture — cinq, là où la capacité est revendiquée : (1) **trou A5** (fill image porté par le contrat), **non refermé** ; (2) étoile orange intrinsèque ; (3) troncature multi-lignes refusée ; (4) transcription **non garantie au caractère près** ; (5) angle mort de la maquette témoin (T068). Plus la limite FR-007 : **le Bouton gouverné n'est pas réutilisé** parce que la résolution des dépendances se fait par nom (R5) — réemploi perdu, nommé. — ✅ six points (cinq limites + FR-007) rassemblés dans decisions.md Phase 7 T074, prêts pour RAPPORT-CLOTURE.md.
- [X] T075 Envoyer au **backlog** le correctif moteur identifié et **non fait** ici : résoudre les dépendances imbriquées par `contractId` d'abord, nom en repli (~15 lignes dans `core/emit-figma-script.ts`) — il change les octets émis ⇒ churn de golden + éval (Constitution II), et « ranger au passage » est hors périmètre. Même traitement pour le nettoyage automatique de `figma:plan` (R13). Attacher à chaque item **son reçu** (T037, T034). — ✅ B5 (résolution contractId) + B6 (figma:plan auto-nettoyant) ajoutés à `specs/003-externalize-figma-components/BACKLOG-SPEC-B-design-to-code.md`, reçus T034/R5 et T037/R13 attachés (decisions.md Phase 7 T075).
- [X] T076 **Dernier geste canevas** : `checkpoint 006/cloture/renommage` → renommer `ReviewCard` → `Review-card` et `GoogleReviews` → `Avis Google` (convention française du fichier) → **9/9 identical**. **Consigner la procédure inverse dans `decisions.md` et `quickstart.md`** : renommer **en arrière** avant tout re-push futur, sinon `findComponentByName` échoue (R5). — ✅ checkpoint `versionId 2380602413129417606`, renommage des 2 masters, sha256 avant=après sur les 9 maquettes, `pages:compare` **9/9 identical** (`proofs/cloture-renommage/`), procédure inverse consignée dans decisions.md T076 ET quickstart.md §Rollback renommage.
- [X] T076a **Re-rafraîchir le snapshot de parité après le renommage** (même route qu'en T047a) — le snapshot de T047a porte `ReviewCard` / `GoogleReviews`, le canevas porte désormais `Review-card` / `Avis Google`. Précédent 002 : le Contract Hub appariait le set **par nom** (« Button » vs master « Bouton ») et c'était cassé — la jointure se fait **par clé**. Vérifier que `npm run parity` reste à **zéro constat actif** après renommage, et **nommer au rapport** ce que parity joint par clé et ce qu'il joint par nom. — ✅ `figma-components.json` rafraîchi (port 9231) ; le refresh a révélé un NOUVEAU rouge (`GoogleReviews.ReviewCard`) causé par le renommage : le lookup principal `contract⟷set` joint déjà par `componentSetKey`, mais le check des instances imbriquées (`componentRefsOf`, `parity/diff.ts:465`/`:521`) joignait par **nom canvas actuel vs nom fixe du contrat** — même classe de fragilité que B5. Corrigé à la source (`nestedInstanceName()` dans `parity/diff.ts`, +19/-8, zéro `core/` touché, zéro churn de golden) : `npm run parity` revient à 24 constats actifs (compte exact d'avant renommage) ; éval `detect-figma-missing-nested-instance` mise à jour vers les noms français, **107/113**. Gates rejoués : build/plugin:check/roundtrip/core-browser-check/tsc tous verts (decisions.md Phase 6 T076a).
- [X] T077 [US2] Assembler le **rapport avant/après** `specs/006-google-reviews-block/proofs/rapport-avant-apres.md` : **une entrée par occurrence**, chacune avec son image, son écart mesuré (`regionPct`), une explication courte de **ce que l'écart contient**, et l'identification des états avant/après (`versionId` de checkpoint) — FR-014. — ✅ 8 entrées, tableau récapitulatif + section par occurrence, checkpoints versionId de T049-T056 (7/8 — Dépannage/SAV non capturé, trou T054 nommé, non récupérable via API versions à la clôture).
- [X] T078 [US2] **Auditer la complétude du rapport** : autant d'entrées que d'occurrences recensées en T010 — **une entrée manquante est un échec, pas une omission acceptable** (SC-002, aucun échantillonnage). Une preuve constatée manquante est **déclarée manquante** ; **aucun retour arrière rétroactif** du fichier vivant n'est tenté pour la combler (FR-017, règle owner). — ✅ 8/8 occurrences ont leur `proofs/<maquette>/{region.json,verdict.json,verdict.md,crops/}` committé — vérifié par lecture directe des 8 dossiers, aucun manque.
- [X] T079 [US2] Publier la **synthèse des écarts** : les 8 chiffres tels quels, y compris non nuls, avec le **dénominateur employé** (bbox de l'aplat) affiché **à côté** de celui du `GROUP` ; séparer **fidélité structurelle** et **fidélité raster** ; isoler et nommer la contribution de tout fragment de contenu substitué (FR-015) et celle des 8 fills photo (override hors contrat). — ✅ section « Synthèse des écarts » du rapport : dénominateur aplat (509 056 px, +40% vs GROUP) affiché contre les 8 `regionDiffCount`, fidélité structurelle (8/8 exacte, < 0,0004 px) séparée de la raster (police/badge/photo), contribution des fills photo nommée comme limite de granularité de l'instrument (agrégée, non isolable séparément).
- [X] T080 [US2] Confirmer que **`outsideDiffCount === 0` sur les 8 occurrences ET sur `Motorisation`** en relisant les `verdict.json` (l'assertion vit dans la checklist de tâche, pas dans le code de sortie, pour ne pas amender l'interface 003) — SC-003. — ✅ relu les 8 `verdict.json` : `Motorisation` `identical`/`diffCount 0` sur les 8 ; `outsideDiffCount` = 0 sur 7/8 occurrences, 1 exception (Portes de garage, 8 px) investiguée et acquittée owner (entrée #2 du rapport, T050).
- [X] T081 **Resynchroniser tous les compteurs cités** — le `N/N` vivant de `npm run eval` fait foi : `README.md` (qui porte aujourd'hui **deux valeurs différentes**, 102 et 108 — à réconcilier), `CLAUDE.md`, `docs/`, `extract/figma/page-parity/README.md` (5 → 7 cas de selftest), le nombre de contrats (5 → **7**). **Après** que les évals les adossent (règle des claims), jamais avant. — ✅ audit complet : `README.md` **déjà** sans aucun `102`/`108` littéral (grep vide) — déjà réconcilié par une clôture précédente ; `extract/figma/page-parity/README.md` **déjà** à 7 cas de selftest ; `ls contracts/*.contract.json` = **7**, cohérent avec le README (générique, aucun compte à réconcilier) ; `CLAUDE.md`/`docs/` : aucun compte périmé trouvé (les 102/108 restants sont dans `MILESTONES.md`, journal daté, exempté par convention CLAUDE.md). Rien à changer — le trou décrit par la tâche était déjà refermé.
- [X] T082 Nommer par id les cas d'évals **réanimés** et ceux restés en quarantaine dans `evals/REMOVED-CASES.md` et dans le corps du commit — dont **`pending-first-sync-not-drift`** et **`naxis-full-cartesian-product`**, écartés **délibérément** (leurs corps référencent des contrats démo supprimés ⇒ les réanimer serait une **réécriture**, pas un déplacement) et la **famille slot**, qui reste en quarantaine puisque 006 utilise `repeat` + `component` (R14). — ✅ `evals/REMOVED-CASES.md` était lui-même périmé : `detect-figma-missing-nested-instance` (revive T061) ET `detect-default-and-kind-drift` (revive 002) restaient au tableau alors qu'ils tournent déjà en direct — retirés (48/48 lignes ↔ `legacy-cases.ts`, script de vérif diff = vide). En-tête, bloc `N/N`, section « shopping list » et paragraphe **Counts** mis à jour : 113 exécutés/48 quarantinés, 10 nouveaux cas 006 + 1 réanimé, 107/113 avec les 6 rouges hérités nommés (T047a). `pending-first-sync-not-drift` et `naxis-full-cartesian-product` confirmés toujours en quarantaine — corps référençant des contrats démo supprimés, la famille slot entière (6 cas) confirmée en quarantaine (006 utilise `repeat`+`component`, pas de slot).
- [X] T083 **Réconcilier les trois compteurs de blocs reportés avant de revendiquer SC-008** (R25) : `specs/003-externalize-figma-components/proofs/honesty-report.md:137` dit **2**, `COMPONENT-INVENTORY.md:66,79,94,126` liste **trois** lignes reportées dont « Icône étoile » — **périmée depuis la spec 004** qui l'a livrée au registre. Corriger la ligne d'inventaire, dire **lequel** compteur SC-008 fait bouger (celui du rapport d'honnêteté : **2 → 0**), et mettre à jour `COMPONENT-INVENTORY.md` (Review-card + Avis Google adoptés). — ✅ icône étoile → ✓ fait (spec 004, confirmé au registre) ; Review-card + Avis Google → ✓ fait (spec 006) ; bandeau/sections mis à jour en cascade. Compteur identifié : `honesty-report.md:137` (« 2 blocs reportés ») passe à 0 — le fichier lui-même n'est PAS édité (journal daté de la clôture 003, comme MILESTONES.md), la preuve du 2→0 vit dans COMPONENT-INVENTORY.md (vivant) et decisions.md 006 (T083).
- [X] T084 Mettre à jour `docs/FIGMA-CAPABILITY-MATRIX.md` : le trou **A5** reste **ouvert** (006 ne le referme pas — le contrat porte l'aiguillage et l'URL, le pixel est un override hors contrat) ; ajouter la classe « preuve par région » **seulement** parce que T029 l'adosse. — ✅ addendum daté 2026-07-26 ajouté (aucune ligne du tableau CSS↔Figma changée) : A5 confirmé ouvert avec receipt T029/T066/T071, classe « preuve par région » documentée comme note méthodologique (flag `--regions`, renvoi vers `contracts/region-proof.md`), pas une ligne de canal CSS.
- [ ] T085 Journal daté : entrée `MILESTONES.md` (+ `CHANGELOG.md` si release) — **seulement après** gates verts, jamais de claim avant preuve. Relire `specs/006-google-reviews-block/decisions.md` de bout en bout : chaque geste canevas doit y avoir son `{label, versionId}` et son verdict.
- [ ] T086 **Dernière volée de gates** sur le checkout principal (les 8) + rapport de clôture `specs/006-google-reviews-block/RAPPORT-CLOTURE.md` : SC-001 → SC-008 un par un, avec leur reçu, et la liste des limites (T074). Vérifier `npm run pages:selftest` **7/7**, `npm run aplat:selftest` **2/2**, et `npm run pages:ledger:check` — en rappelant à côté de ce vert qu'il est **structurellement creux** côté aplat (T023) et que le relevé de transcription est ce qui atteste réellement.

---

## Dependencies & Execution Order

### Dépendances de phase

- **Phase 1 (Setup)** : T001 (merge 005) est un **prérequis dur** de tout le reste — sans lui, aucun point de restauration n'est posable et le dépôt décrit un fichier périmé. T006 (collision de numéro) doit être tranchée **avant la Phase 2**.
- **Phase 2 (Foundational)** : **bloque toutes les user stories.** T016 (STOP-GATE seuil) doit être écrite avant qu'un contrat soit rédigé — sinon on construit contre un seuil décoratif.
- **Phase 3 (US2 — instrument)** : dépend de Phase 2 (les régions viennent du scan T010). **Doit précéder l'adoption** (T049+) : l'instrument s'arme avant les gestes qu'il observe.
- **Phase 4 (US1)** : dépend de Phase 2 (mesures) et, pour son bloc 4d, de Phase 3 (instrument armé).
- **Phase 5 (US3)** : T061/T062 dépendent de l'existence des masters (T043) **et du snapshot rafraîchi (T047a)** ; T067 dépend des adoptions (T049-T056) ; T069 est la volée finale.
- **Phase 6 (US4)** : dépend de T043 (masters) + T036 (code généré). Indépendante de l'adoption.
- **Phase 7 (Polish + US2-close)** : après toutes les stories. **T076 est le tout dernier geste canevas**, et T077-T080 le tout dernier acte de preuve.

### Verrous durs, non négociables

1. **T001 avant tout** — pas de merge, pas de checkpoint, pas de FR-003.
2. **T016 (seuil) avant T031** — pas de contrat écrit contre un seuil non décidé.
3. **T041 + T046 (jambes A et B signées) avant T049** — R19 : l'adoption ne commence que la convergence prouvée, sinon un amend correctif détruira le contenu des occurrences déjà faites.
4. **T027/T028 (selftest 7/7 + identité byte) avant T049** — on ne mesure pas une adoption avec un instrument non vérifié.
5. **Les 8 adoptions (T049→T056) sont STRICTEMENT SÉQUENTIELLES** — preuve complète 9 pages + relecture des bornes des frères du `GROUP` + revue à l'œil + accord owner **avant** la suivante. Jamais de lot.
6. **T057 (fills photo) après le dernier amend** — donnée la plus fragile.
7. **T076 (renommage) en dernier** — la section cherche sa carte par nom ; renommer trop tôt casse tout re-push.
8. **T047a (snapshot de parité) avant T061 et T069** — sans lui `npm run parity` sort vert sans avoir vu les deux composants, et l'éval `detect-figma-missing-nested-instance` n'a aucune entrée à éditer.

### Parallélisation

- **Phase 1** : T002, T003, T004 en parallèle ; T007 et T008 en parallèle après T002.
- **Phase 2** : 2a (T009-T013, lecture Figma) puis 2b (T014-T016) ; 2c (T017-T023) partiellement parallèle une fois `aplat-source.png` disponible — mais T017 et T018 alimentent T031/T033, ne pas les court-circuiter.
- **Phase 3 vs Phase 4a** : l'instrument (`extract/figma/page-parity/`) et les contrats (`contracts/`) touchent des fichiers disjoints → **parallélisables** ; seuls `evals/run.ts` (T029 vs T064-T066) et `evals/golden.json` sont des points de sérialisation.
- **T035 (`google.svg`)** est parallèle à T031/T033.
- **Phase 4d (adoptions)** : **aucune parallélisation possible, par règle**.
- **Phase 5** : T064, T065, T066 touchent tous `evals/run.ts` → séquentiels entre eux, mais parallèles à T060 et T068.

### Exemple parallèle — Phase 1

```bash
# Après T001 (merge), lancer ensemble :
Task: "npm install dans le worktree 006"
Task: "npx playwright install chromium"
Task: "Créer measures/ inventory/ ledger/ proofs/ + decisions.md"
```

### Exemple parallèle — instrument vs contrats

```bash
# Après le checkpoint Phase 2, deux pistes disjointes :
Task: "US2 — flag --regions dans extract/figma/page-parity/{cli,compare,report}.ts + selftest 5→7"
Task: "US1 — contracts/review-card.contract.json + contracts/google-reviews.contract.json"
Task: "US1 — assets/icons/google.svg (fichier isolé)"
```

---

## Implementation Strategy

### MVP d'abord (US1 seule)

1. Phase 1 (Setup) — merge 005, ligne de base, périmètre tranché.
2. Phase 2 (Foundational) — **critique, bloque tout** : état réel + toutes les mesures + seuil décidé.
3. Phase 3 (US2 instrument) — **obligatoire même en MVP** : sans lui, aucune adoption n'est mesurable.
4. Phase 4 (US1) — contrats → code → masters → 8 adoptions.
5. **STOP et VALIDER** : re-scan positionnel = 0 aplat de widget, chaîne traversée sans étape manuelle.

L'itération est **livrable à ce point** au sens du gap de gouvernance (SC-001, SC-005 partiellement,
SC-006) — mais **pas honnête** sans US2 fermée (T077-T080) ni US3 (T069). Les deux P2 ne sont pas
optionnelles : ce sont elles qui distinguent une reconstruction assumée d'un « à peu près » non mesuré.

### Livraison incrémentale

1. Setup + Foundational → l'état réel est connu, le seuil est décidé, rien n'a bougé.
2. + US2 (instrument) → chaque geste futur est mesurable par région. Testable seul : selftest 7/7.
3. + US1 → le gap de gouvernance ferme. Testable seul : relevé positionnel à 0 aplat.
4. + US3 → la non-régression est prouvée sur les deux populations + les pièces invisibles aux pages.
5. + US4 → la réutilisabilité est démontrée sur les deux surfaces.
6. + Polish → compteurs honnêtes, renommage final, rapport de clôture.

### Ce que cette spec ne fait PAS en parallèle

Contrairement à 003/004, **rien de l'adoption ne se parallélise**. La règle « une occurrence à la
fois, preuve complète avant la suivante » est le produit direct de l'incident 003 sur **ce bloc
précis** (une page passée de 5928 à 10168 px après une mutation partielle dans son `GROUP`). Le coût
est assumé : 8 cycles complets de capture/mesure/revue.

---

## Notes

- **[P]** = fichiers différents, aucune dépendance sur une tâche non terminée.
- Chaque tâche de geste canevas produit **un** commit avec son verdict, son entrée `decisions.md` et
  son `{label, versionId}` de checkpoint.
- **Les 5 erreurs à ne pas commettre** (`quickstart.md`) : exécuter `01-tokens.js` ou `batch-01.js` ·
  instancier `ds.button` · renommer les masters trop tôt · lire un `diffCount: 0` de
  `dimension-mismatch` comme une réussite · amender un master après le début de l'adoption.
- Aucun fichier généré n'est écrit ou retouché à la main : `src/components/`, `figma-sync/*.js`,
  `catalog/`, `contracts/contract.schema.json` (Constitution IV).
- **Aucun changement de schéma n'est requis** : `molecule`/`section`, `repeat`, `component`,
  `visibleWhen`, `arrayOf`, `attrs` existent déjà (Constitution VI non sollicité).
