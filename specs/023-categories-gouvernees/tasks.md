---
description: "Task list — 023 Catégories gouvernées (molécule + section + module Odoo)"
---

# Tasks: Bloc « Catégories principales » gouverné (molécule + section + module Odoo)

**Input**: Design documents from `/specs/023-categories-gouvernees/`
**Prerequisites**: plan.md, spec.md, research.md (D0–D12), data-model.md, contracts/ (2 esquisses + gates.interface.md)

**Tests** : aucun test TDD demandé par la spec. Les **evals**, les **portes du dépôt** et les
**protocoles de preuve** (eval de refus E1, dérive injectée US3, scénario rédacteur US2) ne sont
pas des tests optionnels : ce sont des exigences de la Constitution (II, V) et de la spec — ils
figurent comme tâches d'implémentation, pas dans une section « Tests » séparée.

**Organization** : tâches groupées par user story. Particularité de cette spec : l'ordre est
**dicté par quatre gates owner bloquants** (FR-005), pas seulement par la priorité. Une phase aval
ne démarre **jamais** tant que l'artefact de son gate amont n'existe pas en `status: validated`
avec une trace datée dans `proofs/` (SC-007). Les phases sont donc présentées dans l'**ordre
d'exécution imposé par les gates** : US1 (P1) → US3 (P3) → US2 (P2) — US2 passe après US3 parce
qu'elle seule est bloquée par le Gate D.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichiers différents, aucune dépendance sur une tâche incomplète)
- **[Story]** : US1 / US2 / US3 (Setup, Foundational et Polish n'ont pas de label)
- **⛔ GATE** : arrêt réel — bloque tout l'aval jusqu'à validation owner tracée

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose** : worktree autosuffisant, base verte de départ, état des lieux des portes rouges
pré-existantes, échafaudage des artefacts de la spec.

- [X] T001 [Worktree gates — F1] Rendre ce worktree autosuffisant (Constitution, Worktree Gates) :
      `npm install` DANS le worktree
      (`/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/categories`) — `npm run eval`
      symlinke le `node_modules` du checkout et refuse sans lui — puis
      `npx playwright install chromium` (deux checks pilotent un vrai Chromium). Le sweep COMPLET
      (dont `npm run eval`) tourne dans CE worktree à chaque checkpoint et à la clôture.
- [X] T002 Base verte AVANT de toucher quoi que ce soit : lancer le sweep de départ
      (`npm run build && npm run parity && npm run eval && npm run plugin:check && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && npx tsc -p tsconfig.build.json`)
      et consigner le N/N vivant dans `specs/023-categories-gouvernees/proofs/etat-initial.md`.
- [X] T003 Relever **sans re-diagnostiquer** (mémoire projet `odoo-pre-existing-red-gates`) l'état
      des **2 portes Odoo rouges pré-existantes** — `npm run odoo:qualification` (reçu 019
      incohérent) et l'instrument `editability-boundary` (43/44, champ périmé depuis `cc6cd0d4`) —
      et l'ajouter à `specs/023-categories-gouvernees/proofs/etat-initial.md` (023 ne doit pas les
      aggraver, pas les verdir).
- [X] T004 [P] Échafauder les répertoires d'artefacts de la spec :
      `specs/023-categories-gouvernees/{gates/,audits/,proofs/captures/,proofs/us2/,proofs/us3/}`
      (state machine des gates, data-model §5).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose** : prérequis d'infrastructure partagés, indépendants de toute user story, qui doivent
être verts avant l'audit et les mutations d'US1. La discipline des gates est déjà spécifiée dans
[contracts/gates.interface.md](./contracts/gates.interface.md) — aucune tâche ne la « crée », elle
gouverne l'ordre de toutes les phases aval (FR-005).

**⚠️ CRITICAL** : aucun travail canvas (US1) ne commence tant que le pont et l'instrument de
capture ne sont pas prouvés prêts.

- [X] T005 [P] Prouver le pont figma-console prêt : `figma_get_status` → `portFallbackUsed:false`
      sur la plage **9223-9232** (JAMAIS forcer `FIGMA_WS_PORT` dans `.claude/settings.json` —
      règles CLAUDE.md / mémoire `pont-figma-ports-satures`) et route unique vers la page `Pages`
      `210:325` via `figma_execute` + `loadAllPagesAsync`. Consigner dans `proofs/etat-initial.md`.
      **✅ VERT (2026-08-20)** : après nettoyage saturation + `~/.claude.json` FIGMA_WS_PORT→**9223**
      (port bas = repli reste en plage) + 2× `/mcp` owner + réouverture plugin : `figma_get_status`
      probe → **port 9223, `portFallbackUsed:false`**, WebSocket actif, connecté « Piqueray (Copy) »
      (`d9FYAUcqdcNtsuaMgLefvJ`) page « Pages ». Route prouvée : `loadAllPagesAsync` +
      `getNodeByIdAsync('210:325')` → PAGE « Pages », 9 enfants. Détail `proofs/etat-initial.md` §T005.
- [X] T006 [P] Prouver l'instrument §X prêt : `extract/figma/page-parity/` réutilisé **tel quel**
      (receiver port 9227, `bridge/{scan,capture,checkpoint}.js`) — lancer le self-test
      (`pages:selftest` / `ledger-check`) et vérifier `pixelmatch` + `pngjs` disponibles.

**Checkpoint** : socle prêt — l'audit lecture seule d'US1 peut démarrer.

---

## Phase 3: User Story 1 — Molécule unique à deux styles et parent à axes sensés (Priority: P1) 🎯 MVP

**Goal** : une molécule carte-catégorie **unique à deux styles** et un **parent à axes sensés**
(colonnes {2,3} sur la section, « Rdv » redevenu contenu, axe « Disposition » supprimé/renommé),
extraits de la source Figma **nettoyée** en deux contrats gouvernés — zéro copie locale, rendu
inchangé au pixel.

**Independent Test** : après nettoyage + extraction, vérifier que (1) **aucune** copie locale de
carte-catégorie ne subsiste, (2) les **7 usages** rendent **au pixel** comme leur capture
d'avant-mutation, (3) les deux contrats valident au schéma et **régénèrent React + Figma
octet-identiques sur deux exécutions**.

### US1a — Audit lecture seule (§VIII — PAR POSITION, jamais par nom) → Gate A

- [ ] T007 [US1] Recenser les **usages réels** du bloc sur la page `Pages` `210:325` **par
      position** (attendu 7 : 6×2 colonnes, 1×3 — le décompte live fait foi s'il diffère), avec
      colonnage et contenu de chacun → `specs/023-categories-gouvernees/audits/usages.md`.
- [ ] T008 [P] [US1] Recenser **toutes les copies locales** de carte-catégorie sur le canvas **par
      position** (attendu 3+, toute copie supplémentaire comptée au même titre) → `audits/copies-locales.md`.
- [ ] T009 [P] [US1] Relever le master section `CategoriesPrincipales` (`2115:4277`, 4 variantes
      « Disposition ») et le set `Carte` (`2063:1622`, 2 variantes) ; recenser les usages de
      `Carte/Categorie` **par position** (décide le sort de `ds.carte`, research D3) → `audits/masters.md`.
- [ ] T010 [US1] Rédiger le projet de modèle cible
      `specs/023-categories-gouvernees/gates/gate-a-modele-cible.json` (`status: proposed`) :
      axe `Style` {Superpose, Empile}, colonnes portées par le parent, « Rdv » → contenu,
      renommage du master, `sortDeDsCarte` (retrait-categorie-v3 | coexistence-dette-nommée), **et
      une décision par copie dérivée** (préserver le pixel | re-caler sur la molécule) — dépend de T007–T009.

- [ ] T011 [US1] ⛔ **GATE A** — présenter à l'owner le modèle cible **+ le sort de chaque copie
      dérivée** (FR-001) ; obtenir la validation ; passer `gates/gate-a-modele-cible.json` à
      `status: validated` (+ `decidedBy/decidedAt/deviations/evidenceRefs`) et écrire la trace datée
      `proofs/gate-a.md`. **Bloque toute mutation du canvas.**

### US1b — Avant-capture §X intégrale → mutations conformes au Gate A → Gate B

- [ ] T012 [US1] **Avant-capture §X INTÉGRALE** (FR-006) : les **7 usages + les 2 masters** (image
      rendue + dump structure), via `extract/figma/page-parity/` — vérifier **chaque** capture non
      vide et correctement dimensionnée avant de continuer (jamais un pilote) → registre
      `specs/023-categories-gouvernees/proofs/captures/` (data-model §4). Version native « avant »
      (`saveVersionHistoryAsync`).
- [ ] T013 [US1] Muter le master section **conformément au Gate A** : axes orthogonaux
      `Style × Colonnes {2,3}`, **suppression de l'axe « Disposition »** et de ses valeurs non-layout
      (FR-009) — via le pont figma-console (mono-session, zone unique, §XI sans objet).
- [ ] T014 [US1] Officialiser le **style superposé** comme variante de la molécule : plan photo
      `position: absolute` + contenu `relative` + **flèche = icône `arrow-right` du registre**
      (`contracts/icons.registry.json`), patron `ds.hero` — l'affordance est une part officielle,
      jamais un calque caché (FR-007, research D2).
- [ ] T015 [US1] Rebrancher **chaque copie locale** en instance du master gouverné, conformément
      aux décisions par copie du Gate A ; après réparation **zéro** copie locale subsiste (FR-010).
- [ ] T016 [US1] Re-pointer les **7 usages** sur le master gouverné en **préservant le colonnage
      actuel** (6×2, 1×3) et le contenu de chaque usage (FR-011).
- [ ] T017 [US1] Remodeler « **Rdv** » en **instance renseignée** d'un des deux styles (contenu,
      texte, lien et apparence préservés à l'identique), plus jamais une variante (FR-009).
- [ ] T018 [US1] Capture d'**après** + `pixelmatch` **par usage** ; version native « après »
      (`saveVersionHistoryAsync`) ; produire `gates/gate-b-pixel.json` (`status: proposed`) : les 7
      deltas chiffrés, **cause nommée** pour tout delta non nul, conformité aux décisions du Gate A.

- [ ] T019 [US1] ⛔ **GATE B** — présenter la comparaison pixel avant/après des 7 usages à l'owner
      (FR-002) ; validation ; `gates/gate-b-pixel.json` → `status: validated` + trace `proofs/gate-b.md`.
      **Bloque la déclaration « repair neutre » et l'extraction des contrats.**

### US1c — Extension de schéma E1 → extraction des deux contrats → Gate C

> E1 est du code pur (schéma + émetteurs) **sans dépendance au canvas** ; le plan le séquence ici
> (après Gate B) par discipline §VIII (nettoyer la source avant de contractualiser). Les tâches
> T020–T025 pourraient techniquement démarrer plus tôt, mais elles ne sont **consommées** que par
> l'extraction (T027).

- [ ] T020 [US1] E1 (schéma, additif) : ajouter `columns?: number` (entier positif optionnel) à
      `VariantLayoutSchema` — `packages/schema/src/contract-schema.ts:207` — + **règle de refus
      nommée** dans `validateContract` (un override `columns` n'est licite que si le layout de base
      de la part est `display: "grid"`, miroir l. 181-187). Champ optionnel only, jamais repurposé (VI).
- [ ] T021 [P] [US1] E1 émetteur code : la règle d'enum-classe émise par `layoutByProp` porte
      `grid-template-columns: repeat(N, minmax(0, 1fr))` dans `core/emit-react.ts` (même forme que
      la base, l. 1648/1718).
- [ ] T022 [P] [US1] E1 émetteur Figma : le combo compilé porte `columns` → `gridColumnCount` /
      `gridRowCount` existants dans `core/emit-figma-script.ts` (l. 3568-3572) ; **vérifier sur le
      mock au 1er build** la transmission des props parent→item sous `repeat` (research D4 — nommée,
      pas supposée).
- [ ] T023 [US1] E1 eval de refus (`columns` hors grid → **refus par nom**) + déterminisme :
      ajouter la fixture + le cas dans `evals/`, lancer `npm run eval`, re-pin `evals/golden.json`
      revu (`scripts/update-golden.mjs`) — **AVANT toute phrase de capacité** (Principe II) — dépend de T020.
- [ ] T024 [US1] Fidélité du mock (VII) : si un défaut live-only apparaît à la projection E1,
      double correctif — `core/emit-figma-script.ts` **et** `scripts/plugin-engine-mock-figma.mjs`
      (le mock apprend à l'attraper headless pour toujours).
- [ ] T025 [US1] E1 doc (claim APRÈS l'eval — Principe II ; le bump de docs/02 est le
      Principe VI) : documenter le champ `columns` dans `docs/02-contract-spec.md`.
- [ ] T026 [US1] **Acquérir l'entrée d'extraction** : relevé frais **post-Gate B** de la source
      nettoyée (dump des 2 masters — REST `FIGMA_TOKEN` ou pont —, consigné sous `audits/` ; dump
      volumineux non committé, reproductible, précédent 007), **jamais le cliché périmé** ; puis
      extraire le **contrat molécule** →
      `contracts/carte-categorie.contract.json` (`ds.carte-categorie`, `category: "molecule"`,
      v1.0.0) : axe `style` {superpose, empile}, sémantique partagée (titre, description, lien,
      image), flèche du style superposé, `ds.button variant: link` du style empilé, enfants en
      **Fill** — **géométrie portée en tokens, jamais en littéraux** (FR-013).
- [ ] T027 [US1] Extraire le **contrat section** →
      `contracts/categories-principales.contract.json` (`ds.categories-principales`,
      `category: "section"`, v1.0.0) : `repeat` de la molécule + **enum colonnes {2,3}** via
      `layoutByProp` (E1), `style` transmis à la carte (`component.props: {style: "{style}"}`),
      wrap natif au-delà du compte (FR-014, FR-018) — dépend de T026.
- [ ] T028 [P] [US1] Mints **from-dump** dans `tokens/primitives.tokens.json` :
      `size.carte-categorie.*` / `size.categories-principales.*` pour la géométrie manquante,
      réutilisation des `space.N` existants — zéro nombre écrit à la main (D12, geometry-rides-tokens).
- [ ] T029 [P] [US1] **Si** le Gate A a retenu le retrait : `ds.carte` → **v3.0.0** (majeur, retrait
      de `disposition: categorie` + props CTA associées) dans `contracts/carte.contract.json`,
      `ds.reassurances` fonctionnellement intact, rafraîchir `integrations/odoo/config/inputs.lock.json`
      + configs authoring citant `ds.carte 2.x` (D3). **Sinon** : consigner la coexistence comme
      **dette nommée** (Principe V) — pas de no-op silencieux.
- [ ] T030 [US1] **Rafraîchir d'abord (lecture seule) `parity/snapshots/figma-components.json`**
      sur l'état post-mutation — sans ce refresh, l'axe canvas du sweep compare les nouveaux
      contrats au cliché périmé du 2026-08-07 (limite nommée de 017) : rouge trompeur ou
      vert-sur-périmé. Puis `npm run build` + **sweep complet** + `npm run geometry:gate` (0 littéral
      invisible) + `npm run catalog` (leçon 018 : le build ne le régénère pas) ; **3 re-pins revus**
      (`evals/golden.json`, `figma-sync/plugin/engine.receipt.json`, `examples/polaris/figma/*.figma.js`) ;
      roundtrip déterministe **×2 octet-identique** (FR-015, SC-006) — dépend de T020–T029.
- [ ] T031 [US1] Produire `gates/gate-c-contrats.json` (`status: proposed`) : référence du diff
      révisable (commit/PR + versions des deux contrats).

- [ ] T032 [US1] ⛔ **GATE C** — présenter le **diff des deux contrats** à l'owner comme revue
      design system (le diff EST la revue, Principe VI ; FR-003) ; validation ;
      `gates/gate-c-contrats.json` → `status: validated` + trace `proofs/gate-c.md`. **Bloque le
      câblage du différentiel (US3) et tout travail Odoo (US2).**

**Checkpoint US1** : zéro copie locale, 7 usages au pixel, deux contrats gouvernés qui régénèrent
les deux surfaces à l'identique ×2. La dérive est supprimée à la source — MVP livrable.

---

## Phase 4: User Story 3 — Le différentiel trois-voies couvre les deux contrats (Priority: P3)

**Goal** : câbler les deux contrats dans `npm run parity` (3 axes) et la parité visuelle, de sorte
qu'une dérive future soit **détectée automatiquement**, pas découverte à l'œil.

**Independent Test** : injecter une dérive contrôlée (structure + apparence) sur chaque contrat →
`npm run parity` et l'instrument de parité visuelle la **signalent par nom** → retirer la dérive →
retour au vert.

> Séquencée **avant** US2 bien qu'elle soit P3 : US3 ne dépend que du Gate C (les contrats
> existent), tandis qu'US2 est bloquée par le Gate D. Ordre dicté par les gates (plan §Phase 2).

- [ ] T033 [US3] Vérifier que `parity/snapshots/figma-components.json` (rafraîchi en T030) est
      bien l'état **post-mutation** (`extractedAt` postérieur au Gate B) et le **committer comme
      entrée capturée** ; re-rafraîchir (lecture seule) seulement si le canvas a bougé depuis —
      **solde la limite nommée de 017** (cliché du 2026-08-07 périmé) et rétablit l'axe
      canvas ⟷ contrat sur l'état vivant (D7).
- [ ] T034 [US3] Vérifier que `npm run parity` **classe et compare les deux contrats sur les trois
      axes** (code ⟷ contrat, canvas ⟷ contrat, variables ⟷ tokens) **sans exclusion silencieuse**
      — découverte automatique par `readdir contracts/` (`parity/diff.ts:77`), aucun registre à
      éditer (FR-020) — dépend de T033.
- [ ] T035 [P] [US3] Ajouter **+2 sujets** de parité visuelle dans
      `extract/figma/visual-parity/subjects.ts` (`{id, label, kind:'contract', contractId, fileKey,
      setNodeId, renderWidth}`) + baseline (`baseline.json`) ; prêt d'actifs de fixture si besoin
      (patron `ds.carte`, mécanique 017) — ferme l'angle mort où les sections échappaient à la
      parité visuelle (FR-021).
- [ ] T036 [US3] **Protocole de dérive injectée** (preuve, pas eval permanente, D7) : injecter une
      dérive de structure/binding **et** une dérive d'apparence sur chaque contrat, vérifier
      `npm run parity` + parité visuelle les signalent par nom avec remède proposé, retirer, vérifier
      le retour au vert → archiver dans `specs/023-categories-gouvernees/proofs/us3/`.

**Checkpoint US3** : les deux contrats sont **gardés**, pas seulement « réparés » (SC-005).

---

## Phase 5: User Story 2 — Un éditeur Odoo gère ses catégories sans casser le layout (Priority: P2)

**Goal** : la couche d'authoring Odoo — collection gouvernée (add/remove/reorder), édition
image/titre/description/lien par carte, sélecteur 2|3 colonnes — le style de carte restant fixé par
composition. Modifications propres à l'instance, survivant aux trois points de contrôle.

**Independent Test** : sur instance Odoo propre, dérouler le scénario rédacteur (contenu par
défaut, add/remove/reorder, éditions image/titre/description/lien, bascule 2↔3 + 4ᵉ carte) et
vérifier qu'aucun geste ne produit un colonnage hors {2,3} ni une carte non gouvernée ; contrôler
isolation et persistance aux trois points de contrôle.

### Gate D — table d'éditabilité (AVANT tout Odoo)

- [ ] T037 [US2] Produire la **table de verdicts d'éditabilité**
      `specs/023-categories-gouvernees/contracts/categories.editable-scope.json` (`status: proposed`,
      format 022) : **100 % des props ET des parts des DEUX contrats** — y compris les occurrences
      des contrats composés (`ds.button`, icône flèche) — chaque entrée portant l'un des 4 verdicts
      (`directly-editable`/`controlled` + geste rédacteur & mécanisme, `fixed-by-composition`,
      `not-editable`, `hors-capacite` + justification), **zéro verdict par défaut** (FR-004, data-model §6) ;
      la table définit aussi l'état « **section vidée** » (rendu propre attendu, geste réversible —
      edge case de la spec, arrêté ICI, jamais improvisé à l'implémentation).

- [ ] T038 [US2] ⛔ **GATE D** — présenter la table d'éditabilité à l'owner et obtenir sa
      validation **explicite** ; `categories.editable-scope.json` → `status: validated` + trace
      `proofs/gate-d.md`. **Bloque TOUT Odoo** : code de module, provisionnement d'instance pour
      l'authoring, tâches de couche d'authoring (FR-004).

### Couche Odoo dérivée (après Gate D)

- [ ] T039 [US2] Transcription **1:1** du Gate D →
      `integrations/odoo/config/categories.authoring.json` (schéma 019) ; `npm run odoo:authoring:check`
      vérifie l'exhaustivité (100 % props+parts) — dépend de T038.
- [ ] T040 [P] [US2] +1 entrée `ODOO-023-CATEGORIES-QWEB` (raison `odoo-qweb-composition`) dans
      `integrations/odoo/config/adaptation-registry.json` ; épingler les versions des 2 contrats
      (+ `ds.carte` si D3-recommandée) dans `integrations/odoo/config/inputs.lock.json`.
- [ ] T041 [US2] Snippet + panneau `piqueray_ds` : QWeb `t-call` composé ; contrôles
      **`ordered-repeat`** (add/remove/reorder), `plain-text`/`rich-text` (titre, description),
      **`computed-display`** (image), **`enum`** (sélecteur colonnes {2,3}), **`BuilderUrlPicker` /
      `pqrSetCtaHref` par carte** (assemblage nommé de deux mécanismes éprouvés, research D5) —
      FR-016/FR-017/FR-018 ; dépend de T039.
- [ ] T042 [US2] `npm run build` (inclut `odoo:assets` + `odoo:derivation`) ;
      `npm run odoo:inputs:check` + `odoo:module:check` + `odoo:derivation:check` verts ; régénère
      `integrations/odoo/derivation-report.json`.
- [ ] T043 [US2] Instance QA jetable (compose 022, `odoo:19.0-20260803` + `postgres:15`) : poser la
      section, vérifier que le rendu correspond à la **référence approuvée** (delta mesuré ; écart
      non nul chiffré et attribué — l'acceptation est l'**attribution complète** des écarts, patron
      018, pas un seuil chiffré) — US2 scénario 1.
- [ ] T044 [US2] **Scénario rédacteur** : add/remove/reorder de cartes ; éditer
      image/titre/description/lien **par carte** ; **contenu long** (titre/description débordants,
      libellé de CTA long) sans casser le layout ; **suppression jusqu'à la section vidée** (état
      propre défini au Gate D, geste réversible) ; vérifier isolation inter-pages (une instance
      modifiée n'affecte pas l'autre) et **persistance aux 3 points de contrôle** (sauvegarde,
      réouverture éditeur, page publique) — FR-019, SC-004, edge cases spec → `proofs/us2/`.
- [ ] T045 [US2] Bascule **2↔3 colonnes** puis **ajout d'une 4ᵉ carte** : colonnage exactement dans
      {2,3}, 4ᵉ carte **passée à la ligne** sur la même grille, aucune carte non gouvernée, aucun
      colonnage hors {2,3} offrable ; puis **moins de cartes que de colonnes** (2 cartes en 3
      colonnes) : largeur de carte inchangée (la cellule de grille gouverne), aucun étirement
      improvisé — SC-003, edge case spec → `proofs/us2/`.
- [ ] T046 [US2] **Frontière d'éditabilité** : tout geste sur un verdict ≠ `éditable` (style de
      carte, structure, parts fixées) est **bloqué au geste** (pas seulement panneau absent) et les
      panneaux natifs Odoo indésirables ne sont pas proposés ; prouvé par l'instrument
      `editability-boundary` — sans **aggraver** les 2 portes rouges pré-existantes (T003) — US2 scénario 5.

**Checkpoint US2** : le client gère son contenu sans jamais produire un layout non approuvé
(SC-003, SC-004).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose** : clôture, portes vertes, honnêteté des limites nommées.

- [ ] T047 **Sweep complet final** dans le worktree (F1) :
      `npm run build && npm run parity && npm run eval && npm run plugin:check && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && npx tsc -p tsconfig.build.json`
      **+** `npm run geometry:gate` — tout vert (FR-022, SC-006).
- [ ] T048 [P] `npm run catalog` et vérifier `catalog/catalog.json` à jour (leçon 018 : le build ne
      le régénère pas ; le Hub lit ce fichier).
- [ ] T049 [P] Rapport de clôture `specs/023-categories-gouvernees/RAPPORT-CLOTURE.md` + entrée
      **MILESTONES** datée **en nommant le trou de journal existant** (specs 011-016 absents — jamais
      comblé en silence, Principe V).
- [ ] T050 Vérifier que **toute limite/dégradation est nommée là où la capacité est revendiquée**
      (auggie 402 en planification, style non éditable rédacteur, coexistence `ds.carte` si repli D3,
      lien-destination hors contrat) et confirmer **SC-001 → SC-007** un à un (dont SC-007 : les 4
      gates validés dans l'ordre et tracés, vérifiable dans `gates/` + `proofs/`).

---

## Dependencies & Execution Order

### Chemin critique dicté par les gates (FR-005 — arrêts réels)

```
Setup (T001-T004) → Foundational (T005-T006)
  → US1a audit (T007-T010) → ⛔ GATE A (T011)
  → US1b captures+mutations (T012-T018) → ⛔ GATE B (T019)
  → US1c E1+extraction+build (T020-T031) → ⛔ GATE C (T032)
        ├─→ US3 câblage différentiel (T033-T036)        [ne dépend que du Gate C]
        └─→ Gate D (T037) → ⛔ GATE D (T038) → US2 Odoo (T039-T046)
  → Polish/Clôture (T047-T050)
```

### Dépendances entre user stories

- **US1 (P1)** — socle. Ne dépend d'aucune autre story. Contient les Gates A, B, C.
- **US3 (P3)** — dépend d'**US1 (Gate C validé)** uniquement. **Peut démarrer avant US2.**
- **US2 (P2)** — dépend d'**US1 (Gate C validé)** puis de **Gate D**. Séquencée **après** US3 car
  seule US2 est bloquée par le Gate D (c'est pourquoi P3 précède P2 dans l'exécution).

### Points de blocage (aucun aval ne démarre avant validation tracée)

- **Gate A** (T011) bloque toute mutation canvas (T012+).
- **Gate B** (T019) bloque la déclaration « repair neutre » et l'extraction (T020+).
- **Gate C** (T032) bloque US3 (T033+) **et** US2 (T037+).
- **Gate D** (T038) bloque toute la couche Odoo (T039+).

### Au sein d'US1

- Audit (T007-T009) → projet Gate A (T010) → Gate A (T011).
- Capture §X **intégrale** (T012) **avant** toute mutation (T013-T018) — §X, jamais un pilote.
- Chorégraphie fine T013↔T014 dictée par le modèle du Gate A : la variante molécule `Superpose`
  (T014) existe **avant** que les variantes section qui l'instancient soient recâblées (T013 peut
  renommer les axes d'abord ; l'instanciation attend T014).
- E1 schéma (T020) avant émetteurs (T021, T022) et eval (T023) ; eval (T023) **avant** la doc
  (T025) et avant toute phrase de capacité (Principe II).
- Molécule (T026) avant section (T027, qui la compose).

---

## Parallel Opportunities

- **Setup** : T004 ∥ (T002, T003).
- **Foundational** : T005 ∥ T006.
- **US1a audit** : T008 ∥ T009 (fichiers d'audit distincts ; lectures pont concurrentes OK).
- **US1c E1** : T021 (emit-react) ∥ T022 (emit-figma-script) après T020 ; T028 (tokens) ∥ T029
  (ds.carte conditionnel) pendant l'extraction.
- **US3** : T035 (sujets visuels) ∥ T034 (vérif parity).
- **US2** : T040 (registry+lock) ∥ T039 (transcription authoring).
- **Polish** : T048 ∥ T049.
- **Inter-stories** : une fois le Gate C validé, **US3 (T033-T036) peut avancer en parallèle** de
  la préparation du Gate D (T037), tant que rien d'Odoo (T039+) ne démarre avant le Gate D.

### Exemple — audit US1 en parallèle (après Foundational)

```bash
Task T008: "Recenser toutes les copies locales par position → audits/copies-locales.md"
Task T009: "Relever masters CategoriesPrincipales + Carte, usages Carte/Categorie → audits/masters.md"
# (T007 recense les 7 usages ; T010 agrège les trois relevés dans le projet de Gate A)
```

---

## Implementation Strategy

### MVP first (US1 seule)

1. Phase 1 Setup + Phase 2 Foundational (base verte, pont & instrument prêts).
2. Phase 3 US1 jusqu'au **Gate C validé** : source nettoyée, deux contrats gouvernés, régénération
   ×2 octet-identique.
3. **STOP & VALIDATE** : zéro copie locale, 7 usages au pixel — la dérive est supprimée à la source.
   US1 a une valeur autonome et démontrable, indépendamment d'Odoo.

### Livraison incrémentale (ordre dicté par les gates)

1. US1 → Gate C → **filet de sécurité US3** (le bloc réparé devient un bloc gardé).
2. Gate D → **US2 Odoo** (la valeur livrée au client, sur instance propre).
3. Clôture : sweep F1 vert, rapport, MILESTONES daté.

### Discipline transverse (à tout moment)

- Chaque gate est un **arrêt réel** : ne pas démarrer l'aval sans l'artefact `status: validated` +
  trace datée. Toute divergence découverte après = défaut à corriger ou **retour au gate**
  (`revisions[]`), jamais un ajustement silencieux.
- Mutation canvas **seulement** après capture §X intégrale et vérifiée.
- Géométrie en **tokens**, jamais en littéraux (geometry:gate = 0).
- Limites/dégradations **nommées** là où la capacité est revendiquée (Principe V).

---

## Notes

- **[P]** = fichiers différents, aucune dépendance sur une tâche incomplète.
- Les tâches **⛔ GATE** (T011, T019, T032, T038) requièrent une **validation owner** — elles ne se
  cochent pas d'office (SC-007).
- Re-pins attendus (nommés d'avance, D11) : `evals/golden.json`,
  `figma-sync/plugin/engine.receipt.json`, `examples/polaris/figma/*.figma.js`, +
  `inputs.lock.json` si D3 déplace des versions ; `catalog/catalog.json` via `npm run catalog`
  **explicite**.
- 2 portes Odoo rouges **pré-existantes** (T003) : relevées, **pas** re-diagnostiquées ; 023 ne doit
  pas les aggraver.
- Commit après chaque tâche ou groupe logique ; s'arrêter à un checkpoint pour valider une story.
