# Tasks: Vague contenu Odoo (wave B) — sections Coordonnées & Réassurances

**Input**: Design documents from `specs/022-odoo-production-wave-b/`
**Prerequisites**: `plan.md` (requis), `spec.md` (requis pour les user stories), `research.md`,
`data-model.md`, `contracts/` (tables de verdicts validées), `quickstart.md`

**Tests**: La spec exige explicitement des preuves nommées — un scénario QA **par section**
(FR-015), un **spike** avant claim (bloc Tél/Email, leçon 018) et un **delta visuel mesuré** par
section (SC-003/004/005). Les tâches de scénario, de spike et de mesure visuelle sont donc des
livrables de premier ordre, pas des tests optionnels. Elles suivent la convention de reçus 019
(`scenarioId` stable, reçu JSON daté sous `proofs/`), sans être présentées comme des `evals`.

**Organization**: Les phases sont groupées par user story. Les deux stories P1 restent
indépendamment testables (un scénario dédié chacune). **Note d'honnêteté sur le parallélisme** :
US1 et US2 éditent les **mêmes fichiers d'addon** (`authoring.js`, `authoring.xml`,
`odoo-bridge.css`, `views/components.xml`, `views/snippets.xml`, `adaptation-registry.json`,
`media_action.js`) — elles sont donc **indépendamment testables mais implémentées en série**
(US1 puis US2), pas en parallèle. Le vrai parallélisme est faible et signalé tâche par tâche.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: exécutable en parallèle — fichier distinct, aucune dépendance non terminée
- **[Story]**: rattachement à `US1`, `US2` ou `US3` (phases de story uniquement)
- Chaque tâche nomme le ou les chemins exacts qu'elle produit ou modifie

---

## Phase 1: Setup — worktree autonome

**Purpose**: Rendre le worktree auto-suffisant avant toute porte (Constitution, Worktree Gates F1).

- [X] T001 Rendre ce worktree autonome (Constitution, Worktree Gates F1) : exécuter `npm install`
      puis `npx playwright install chromium` depuis
      `/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/2-others`
      (le runner `npm run eval` symlink le `node_modules` du checkout — il refuse sans cette étape ;
      deux contrôles pilotent un vrai Chromium). Le sweep COMPLET (dont `npm run eval`) tourne dans
      ce worktree à chaque checkpoint et à la clôture. Consigner versions/commandes sans claim de
      résultat dans `specs/022-odoo-production-wave-b/proofs/setup.md`.

**Checkpoint**: Worktree prêt — les portes du dépôt peuvent tourner ici.

---

## Phase 2: Foundational — ⛔ gate humain + fondation neutre (bloque toute l'authoring)

**Purpose**: Confirmer que les deux tables de verdicts validées font foi, puis poser la fondation
neutre (racines, lock, assets, version, icônes) que la spec autorise à précéder l'authoring.

**⚠️ CRITICAL**: Aucune tâche d'authoring d'une section (Phase 3/4) ne démarre avant T002.
Les tâches de fondation neutre (T003–T008) peuvent précéder l'authoring (plan, point d'attention #1).

- [X] T002 ⛔ **GATE HUMAIN** — vérifier que `specs/022-odoo-production-wave-b/contracts/coordonnees.editable-scope.json`
      et `.../reassurances.editable-scope.json` portent `status: "validated"` avec le bloc `gate`
      rempli (owner, 2026-08-19, écarts nommés) et une couverture 100 % props/parts sans verdict
      manquant (FR-001/002/003, SC-001). Ces deux tables **font foi** pour tout le comportement
      livré ; toute divergence aval est un défaut ou un retour au gate, jamais un ajustement
      silencieux. Consigner la confirmation dans `specs/022-odoo-production-wave-b/proofs/gate.md`.
- [X] T003 Ajouter les deux nouvelles racines à `ROOT_CONTRACT_IDS` (`ds.coordonnees`,
      `ds.reassurances`) dans `scripts/odoo/lib/repo-data.ts` (8 → 10 racines).
- [X] T004 Repin explicite du lock 15 → 18 contrats — la fermeture CALCULÉE (`closureOf`) tire
      `ds.carte@2.0.1` en plus des déjà-épinglés `ds.section-header` / `ds.button` ; `graphDigest`
      recalculé, jamais écrit à la main, dans `integrations/odoo/config/inputs.lock.json` ;
      `npm run odoo:inputs:check` passe au vert (dépend de T003).
- [X] T005 Régénérer les assets générés de la fermeture étendue via `npm run odoo:assets`
      (dérivation pure `emitHtml`, jamais à la main) et vérifier `npm run odoo:assets -- --check`
      (statut `tampered` sinon) — sortie sous
      `integrations/odoo/addons/piqueray_ds/static/src/css/generated/` (dépend de T004).
- [X] T006 [P] Bump de version mineur `19.0.1.4.0 → 19.0.1.5.0` dans
      `integrations/odoo/addons/piqueray_ds/__manifest__.py` (aucun nouveau bundle : QWeb/JS/XML
      réutilisés ; seule la version change).
- [X] T007 Propager le `graphDigest` recalculé + `data-vcss/vxml/vjs` aux **8 racines QWeb
      existantes** (cascade de non-régression, plan point d'attention #2) dans
      `integrations/odoo/addons/piqueray_ds/views/components.xml` (dépend de T004 ; le verdict vert
      de `odoo:module:check` sur les 10 racines est vérifié en US3 quand les 2 nouvelles existent).
- [X] T008 Transcrire les icônes sociales `facebook.svg` / `instagram.svg` de `assets/icons/`
      (registre gouverné, non modifié) en templates QWeb inline `pqr_facebook` / `pqr_instagram`
      (précédent `pqr_star` / `pqr_arrow_right`) dans
      `integrations/odoo/addons/piqueray_ds/views/components.xml` (même fichier que T007 → en série).

**Checkpoint**: Gate confirmé, lock repinné, assets régénérés, version bumpée, icônes prêtes —
l'authoring des deux sections peut démarrer.

---

## Phase 3: User Story 1 — Coordonnées montée, éditable et gouvernée (Priority: P1) 🎯 MVP

**Goal**: Poser **Coordonnées** (`ds.coordonnees@2.2.0`) dans l'éditeur Website — plan Google
placeholder à gauche, en-tête + blocs Adresse/Horaires/Contact/Suivez-nous à droite — avec la
couche d'authoring gouvernée exacte de la table 1 validée : « du texte et des liens réseaux
sociaux » (mots owner), le reste verrouillé, panneaux natifs indésirables absents, isolation et
persistance par instance.

**Independent Test**: sur instance propre, poser Coordonnées, dérouler `coordonnees.spec.mts`
(rendu par défaut, w-auto 1728/1440, éditions autorisées, tentatives interdites, isolation,
persistance) et mesurer le delta visuel contre la référence 020.

**Dépendance de gate**: toutes les tâches US1 dépendent de T002 (table 1 = `validated`).

- [X] T009 [US1] Transcrire 1:1 la table 1 validée
      (`contracts/coordonnees.editable-scope.json`) vers
      `integrations/odoo/config/coordonnees.authoring.json` — schéma 019 figé, `authoringVersion`
      `1.0.0`, `rootContract` `ds.coordonnees@2.2.0`, `snapshotId` du lock repinné, 100 % des
      props/parts dépliées (C1–C10, P1–P21), aucun verdict par défaut ; `npm run odoo:authoring:check`
      au vert.
- [X] T010 [US1] **SPIKE D9 — AVANT le QWeb final** : exécuter pose → édition → save → reopen →
      public sur le bloc Tél/Email (survie du saut de ligne `\r`/pre-line + soulignement segmentaire
      via marques `link` + `line-break`, option A validée au gate) dans
      `integrations/odoo/qa/scenarios/coordonnees-spike.spec.mts` ; reçu factuel archivé sous
      `specs/022-odoo-production-wave-b/proofs/` ; **échec ⇒ retour au gate**, jamais contourné
      (leçon 018 : « lu mais non confirmé » = à exécuter).
- [X] T011 [US1] QWeb du snippet Coordonnées — racine `s_pqr_coordonnees` (attributs `data-ds-*`
      dont le nouveau `graphDigest`, `data-pqr-root-actions="move duplicate remove"`,
      `data-pqr-part="root"`), en-tête via template partagé `pqr_section_header`, blocs Adresse /
      Horaires / Contact / Suivez-nous, plan Google `<img>` **placeholder sans src** (décision gate),
      icônes sociales inline — dans `integrations/odoo/addons/piqueray_ds/views/components.xml` et
      inscription bibliothèque `group="content"` dans
      `integrations/odoo/addons/piqueray_ds/views/snippets.xml`
      (marqueurs `ODOO-022-COORDONNEES-QWEB` / `-SNIPPET` ; dépend de T010).
- [X] T012 [US1] Ouvertures + panneaux d'authoring Coordonnées dans
      `integrations/odoo/addons/piqueray_ds/static/src/js/authoring.js` et
      `integrations/odoo/addons/piqueray_ds/static/src/xml/authoring.xml` : zones rouvertes C3
      `accroche` (routée) + C4 `titre` (rich-text `strong`) + étiquettes/valeurs P9–P19
      (`line-break` où le contrat le porte), liens Tél/Email `tel:`/`mailto:` et liens réseaux
      sociaux réglés au panneau (grammaire same-origin/`https`/`mailto:`/`tel:`, `javascript:`
      refusé) — marqueurs `ODOO-022-COORDONNEES-PANEL`, `ODOO-022-CONTACT-LIENS`,
      `ODOO-022-SOCIAL-LIENS` (dépend de T011).
- [X] T013 [US1] Confirmer la politique média du plan Google : **AUCUNE action média** au panneau
      (placeholder jusqu'à l'API custom, décision gate), clic direct fermé (conteneurs natifs
      `ReplaceMediaOption`/`ImageToolOption`/`ImageAndFaOption` — règle canvas commune) ; vérifier
      qu'aucun geste de remplacement n'est offert dans
      `integrations/odoo/addons/piqueray_ds/static/src/js/media_action.js` (pas d'action `mapUrl`).
- [X] T014 [US1] Pont de largeur `ODOO-022-COORDONNEES-BRIDGE` (racine étirée à la page ;
      `googleMap` perd son `min-width` de contrat et fléchit ; wrapper garde ses 576px) dans
      `integrations/odoo/addons/piqueray_ds/static/src/css/odoo-bridge.css` — contrat non modifié
      (FR-005/FR-007).
- [X] T015 [US1] Enregistrer les marqueurs `ODOO-022-COORDONNEES-*` (QWEB, SNIPPET, PANEL,
      CONTACT-LIENS, SOCIAL-LIENS, BRIDGE) dans
      `integrations/odoo/config/adaptation-registry.json` (reasonCodes existants) ;
      `npm run odoo:derivation:check` au vert (bloc↔entrée 1:1, sans chevauchement).
- [X] T016 [US1] Sujet visuel `coordonnees` — clip épinglé obtenu par `render-html.mts --measure`
      (le refus donne la boîte) dans `integrations/odoo/qa/visual/subjects/coordonnees.mts`, page de
      mesure publique dans `integrations/odoo/addons/piqueray_ds_qa/views/harness.xml`
      (dépend de T011 ; même fichier harness que T026 → en série).
- [X] T017 [US1] Scénario QA `coordonnees.spec.mts` dans
      `integrations/odoo/qa/scenarios/coordonnees.spec.mts` couvrant FR-015 : pose, rendu par
      défaut, **w-auto à 1728 ET 1440** (racine + enfants, zéro débordement, largeurs fixes non
      imposées — SC-008), éditions autorisées, tentatives interdites (**geste de texte direct sur
      CHAQUE zone non éditable** + gestes natifs — edge « verrou contourné » 018), isolation (2 pages
      + 2 instances même page), persistance save/reopen/public identiques ; reçu JSON sous
      `specs/022-odoo-production-wave-b/proofs/` (dépend de T012–T015).
- [X] T018 [US1] Mesurer le delta visuel Coordonnées contre la référence 020 via
      `compare.mts` (`extract/image-parity` inchangé) ; tout écart non nul **chiffré + attribué à
      une cause nommée** (SC-003) ; reçu chiffré sous `specs/022-odoo-production-wave-b/proofs/`
      (dépend de T016, T017).

**Checkpoint**: Coordonnées se pose, s'édite selon la table 1, s'isole/persiste, s'adapte en
largeur, et son delta visuel est mesuré+attribué — US1 livrable en MVP autonome.

---

## Phase 4: User Story 2 — Réassurances montée, cartes répétées comprises (Priority: P1)

**Goal**: Poser **Réassurances** (`ds.reassurances@1.2.0`) — en-tête fixé par composition, rangée
de cartes répétées (grille de 4 colonnes, décision gate), bouton CTA — avec édition par carte,
gestes de collection {ajouter, supprimer, monter, descendre} (bornes 0..n) et neutralisation des
gestes natifs. Première section de production dont le contenu principal est une **collection
répétée**.

**Independent Test**: sur instance propre, poser Réassurances, éditer la carte N sans toucher N+1,
exercer les 4 gestes de collection (et vérifier les gestes natifs neutralisés), puis mesurer le
delta visuel contre la référence 020.

**Dépendance de gate**: toutes les tâches US2 dépendent de T002 (table 2 = `validated`).
**Note série**: US2 partage `components.xml`, `snippets.xml`, `authoring.js`, `authoring.xml`,
`media_action.js`, `odoo-bridge.css`, `adaptation-registry.json`, `harness.xml` avec US1 → après US1.

- [ ] T019 [US2] Transcrire 1:1 la table 2 validée
      (`contracts/reassurances.editable-scope.json`) vers
      `integrations/odoo/config/reassurances.authoring.json` — schéma 019 figé,
      `authoringVersion` `1.0.0`, `rootContract` `ds.reassurances@1.2.0`, `snapshotId` du lock ;
      100 % des props/parts dépliées, occurrences `ds.carte`/`ds.section-header`/`ds.button`
      comprises (R1–R8, S1–S12), aucun verdict par défaut ; `npm run odoo:authoring:check` au vert.
- [ ] T020 [US2] QWeb du snippet Réassurances — racine `s_pqr_reassurances` (attributs `data-ds-*`
      + nouveau `graphDigest`, actions de racine), en-tête via `pqr_section_header` avec **littéraux
      fixés** (R3, textes non éditables), liste de cartes `data-pqr-carte-list` + items marqués **par
      position** `data-pqr-carte-marker="carte-N"` + blueprint `<template data-pqr-carte-blueprint>`
      **sans src**, CTA via template partagé `pqr_button` (`link_href` ⇒ `<a>`, sinon `<button>`) —
      dans `integrations/odoo/addons/piqueray_ds/views/components.xml` et inscription bibliothèque
      `group="content"` dans `integrations/odoo/addons/piqueray_ds/views/snippets.xml`
      (marqueurs `ODOO-022-REASSURANCES-QWEB` / `-SNIPPET`).
- [ ] T021 [US2] Actions de collection `Add/Remove/MoveUp/MoveDown CarteAction` (blueprint neutre,
      bornes 0..n) et neutralisation des gestes natifs (duplication/suppression/déplacement d'une
      carte via `is_unremovable_selector` sur descendants) dans
      `integrations/odoo/addons/piqueray_ds/static/src/js/repeat_action.js`
      (marqueur `ODOO-022-REASSURANCES-REPEAT`).
- [ ] T022 [US2] Action média `ReplaceCarteImageAction` par carte (`items[].imageUrl` → dialogue
      média natif `/web/image`, pose sans src) + champ `alt` d'instance (R2d, **limite nommée** :
      la route `items` du contrat ne porte pas d'alt) dans
      `integrations/odoo/addons/piqueray_ds/static/src/js/media_action.js`
      (marqueur `ODOO-022-REASSURANCES-MEDIA`).
- [ ] T023 [US2] Panneaux + CTA Réassurances dans
      `integrations/odoo/addons/piqueray_ds/static/src/js/authoring.js` et
      `integrations/odoo/addons/piqueray_ds/static/src/xml/authoring.xml` : par carte `titre`
      (texte simple) + `texte` (rich-text `strong`), libellé CTA éditable + lien au panneau
      (`BuilderUrlPicker`, `SetCtaHrefAction`, `javascript:` refusé) ; en-tête et glyphes/variante
      **non rouverts** (fixés par composition) — marqueurs `ODOO-022-REASSURANCES-PANEL`,
      `ODOO-022-CARTE-PANEL`.
- [ ] T024 [US2] Pont de largeur `ODOO-022-REASSURANCES-BRIDGE` (racine 1550px non imposée à la
      page, largeur fluide plafonnée au naturel ; cartes 364px rétrécissables `min-width: 0` ;
      **grille de 4 colonnes** — au-delà de 4 cartes passage à la ligne, précédent Équipe ; en
      dessous rangée centrée) dans
      `integrations/odoo/addons/piqueray_ds/static/src/css/odoo-bridge.css` ; **DW-002 nommé** (la
      source Figma déborde d'elle-même de 2px : 4×364+3×32=1552 dans 1550, le CSS rétrécit).
- [ ] T025 [US2] Enregistrer les marqueurs `ODOO-022-REASSURANCES-*` (QWEB, SNIPPET, REPEAT, MEDIA,
      PANEL, BRIDGE) + `ODOO-022-CARTE-PANEL` dans
      `integrations/odoo/config/adaptation-registry.json` ; `npm run odoo:derivation:check` au vert.
- [ ] T026 [US2] Sujet visuel `reassurances` — clip épinglé par `render-html.mts --measure` dans
      `integrations/odoo/qa/visual/subjects/reassurances.mts`, page de mesure publique dans
      `integrations/odoo/addons/piqueray_ds_qa/views/harness.xml` (dépend de T020 ; même harness que
      T016 → en série).
- [ ] T027 [US2] Scénario QA `reassurances.spec.mts` dans
      `integrations/odoo/qa/scenarios/reassurances.spec.mts` : pose, rendu par défaut, w-auto
      1728/1440 (SC-008), édition carte N sans toucher N+1, **4 gestes de collection** {ajouter,
      supprimer, monter, descendre} bornes 0..n + **gestes natifs neutralisés**, edges (vider le
      texte d'une carte, première/dernière carte, geste interdit), en-tête/CTA fixés → geste de
      texte bloqué, isolation, persistance save/reopen/public ; reçu sous
      `specs/022-odoo-production-wave-b/proofs/` (dépend de T020–T025).
- [ ] T028 [US2] Mesurer le delta visuel Réassurances contre la référence 020 via `compare.mts` ;
      écarts non nuls chiffrés + attribués (SC-003, DW-002 nommé si applicable) ; reçu chiffré sous
      `specs/022-odoo-production-wave-b/proofs/` (dépend de T026, T027).

**Checkpoint**: Réassurances se pose, ses cartes s'éditent/se réordonnent selon la table 2,
s'isolent/persistent, s'adaptent en largeur (grille 4 colonnes), delta mesuré+attribué — US2
livrable en MVP autonome.

---

## Phase 5: User Story 3 — Les deux sections qualifiées ensemble (Priority: P2)

**Goal**: Clore la vague — versions/lock/digest alignés sur les 10 racines, portes Odoo vertes sur
instance propre, QA des deux sections rejouée verte, delta visuel chiffré+attribué, **zéro
régression** des 8 sections déjà montées.

**Independent Test**: sur instance propre reconstruite, exécuter la qualification complète (portes,
QA des deux sections, mesure visuelle, vérification lock/digest) et produire le dossier de preuves.

**Dépendance**: US3 dépend de US1 (T009–T018) ET US2 (T019–T028) livrées.

- [ ] T029 [US3] Mettre à jour les inventaires attendus **8 → 10** (racines couvertes, panneaux) dans
      `integrations/odoo/qa/fixtures/` (nouvelles fixtures Coordonnées/Réassurances si le banc les
      attend) — les 10 racines et leurs inventaires deviennent la référence de non-régression.
- [ ] T030 [US3] Rejouer la non-régression sur instance propre : les 8 scénarios de section
      existants + `combined-isolation.spec.mts` + `editability-boundary.spec.mts` +
      `versioning.spec.mts` + `install-update.mts` dans `integrations/odoo/qa/scenarios/` ; reçus
      verts archivés sous `specs/022-odoo-production-wave-b/proofs/` (zéro régression, SC-006).
- [ ] T031 [US3] `npm run odoo:module:check` au vert : versions/lock/digest ancrés sur les **10**
      racines QWeb sans divergence résiduelle (FR-013) — vérifie la cascade T004/T007 + les racines
      neuves T011/T020 ; verdict archivé dans
      `specs/022-odoo-production-wave-b/proofs/module-check.json`.
- [ ] T032 [US3] `npm run odoo:visual:selftest -- --strict` et `npm run odoo:qualification` au vert
      (un contrôle sauté est dit sauté — honnêteté §V) ; verdict archivé dans
      `specs/022-odoo-production-wave-b/proofs/qualification-gates.json`.
- [ ] T033 [US3] Sweep COMPLET dans le worktree — portes Odoo :
      `npm run odoo:inputs:check && npm run odoo:authoring:check && npm run odoo:assets -- --check &&`
      `npm run odoo:derivation:check && npm run odoo:module:check && npm run odoo:typecheck &&`
      `npm run odoo:visual:selftest -- --strict` — plus le sweep constitution du dépôt :
      `npm run build && npm run parity && npm run eval && npm run plugin:check &&`
      `npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs &&`
      `npx tsc --noEmit && npx tsc -p tsconfig.build.json` ; consigner N/N d'eval réel sous
      `specs/022-odoo-production-wave-b/proofs/` (jamais codé en dur).
- [ ] T034 [US3] Rédiger le rapport de qualification dans
      `specs/022-odoo-production-wave-b/proofs/qualification-report.md` : deltas visuels chiffrés +
      chaque écart non nul attribué à une cause nommée (SC-003), table gate → comportement conforme
      (SC-007), non-régression 8 sections (SC-006), alignement versions/lock/digest (FR-013), état
      repartable de l'addon (8 → 10 sections).

**Checkpoint**: Addon prouvé et repartable — deux sections de plus, portes vertes, zéro régression.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Nommer les limites et valider le parcours de bout en bout.

- [ ] T035 [P] Documenter les **limites nommées** (honnêteté §V) — DW-002 (débordement source de
      2px), R2d (alt de carte hors route contractuelle), bloc posé = **copie figée** (constat 018,
      re-documenté), plan Google en placeholder jusqu'à l'API custom (hors vague 022) — dans
      `specs/022-odoo-production-wave-b/proofs/limits.md` et en miroir au registre du gate.
- [ ] T036 Rejouer `quickstart.md` de bout en bout sur instance propre (6 étapes : gate, instance,
      boucle de portage, QA par section, delta visuel, qualification) et confirmer chaque étape
      verte ; consigner sous `specs/022-odoo-production-wave-b/proofs/quickstart-run.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** : aucune dépendance — démarre immédiatement.
- **Foundational (Phase 2)** : dépend du Setup. T002 (gate) **bloque toute l'authoring** ;
  T003–T008 (fondation neutre) peuvent précéder l'authoring.
- **US1 (Phase 3)** et **US2 (Phase 4)** : dépendent de T002 + Phase 2. Toutes deux P1 et
  indépendamment testables, mais **implémentées en série** (fichiers d'addon partagés).
- **US3 (Phase 5)** : dépend de US1 **et** US2 (qualification transversale).
- **Polish (Phase 6)** : dépend de US3.

### Chaîne critique intra-phase

- Foundational : T003 → T004 → (T005, T007) ; T008 après T007 (même `components.xml`) ; T006 [P].
- US1 : T009 → **T010 (spike, avant QWeb)** → T011 → T012 → (T013, T014) → T015 → T016 → T017 → T018.
- US2 : T019 → T020 → (T021, T022, T023, T024) → T025 → T026 → T027 → T028.
- US3 : T029 → T030 → T031 → T032 → T033 → T034.

### Opportunités de parallélisme (faibles, par conception)

- **T006** [P] (manifeste) — indépendant du reste de la fondation.
- **T035** [P] (doc limites) — fichier de preuves distinct, aucune dépendance de code.
- US1 et US2 ne sont **pas** parallélisables entre elles : elles éditent les mêmes fichiers
  d'addon (`authoring.js`, `authoring.xml`, `odoo-bridge.css`, `components.xml`, `snippets.xml`,
  `adaptation-registry.json`, `media_action.js`, `harness.xml`). Chaque story reste néanmoins
  **indépendamment testable** (scénario dédié).
- Dans une story, les tâches sur fichiers distincts (ex. US1 : T013 `media_action.js`,
  T014 `odoo-bridge.css`) peuvent se chevaucher une fois le QWeb (T011) posé.

---

## Implementation Strategy

### MVP d'abord (US1 seule)

1. Phase 1 : Setup (T001).
2. Phase 2 : Foundational — gate confirmé (T002) + fondation neutre (T003–T008).
3. Phase 3 : US1 Coordonnées — **spike D9 avant le QWeb** (T010), puis authoring + QA + delta.
4. **STOP et VALIDER** : dérouler `coordonnees.spec.mts` seul, mesurer le delta — Coordonnées est
   une section de production utilisable à elle seule.

### Livraison incrémentale

1. Setup + Foundational → fondation prête (lock 18, assets, digest, icônes).
2. US1 Coordonnées → test indépendant → livrable (MVP).
3. US2 Réassurances → test indépendant → livrable (première collection répétée de production).
4. US3 → qualification transversale → addon prouvé (8 → 10 sections, zéro régression).

### Rappels qui mordent (plan + quickstart)

- **Le gate d'abord** : aucune tâche d'authoring d'une section avant sa table validée (T002, SC-001).
- **Spike avant claim** : le bloc Tél/Email (T010) s'exécute avant le QWeb final ; échec ⇒ retour
  au gate, jamais contourné (leçon 018).
- **Jamais** d'édition sous `static/src/css/generated/` — perdue au prochain build ET porte rouge.
- Un bloc posé est une **copie figée** : la QA se fait sur pose fraîche ; une mise à jour d'addon
  ne repropage rien (limite documentée, T035).
- Sections posées **sans src** d'images : plan Google en placeholder (décision gate), photos de
  cartes entrées par le rédacteur au montage (`/web/image`).
- **W-auto mesuré, pas déclaré** : assertions à 1728 ET 1440 dans chaque scénario (SC-008).

---

## Notes

- `[P]` = fichiers distincts, aucune dépendance non terminée.
- Le label `[Story]` rattache la tâche à sa user story pour la traçabilité.
- Chaque story est complétable et testable indépendamment (scénario dédié + delta visuel).
- Le spike (T010) doit sortir un reçu factuel AVANT l'intégration QWeb finale de US1.
- Commit après chaque tâche ou groupe logique cohérent ; s'arrêter à chaque checkpoint pour valider.
- À éviter : tâches vagues, conflits sur un même fichier présentés comme parallèles, dépendances
  inter-stories qui cassent l'indépendance testable.
