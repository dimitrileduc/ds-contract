# Implementation Plan: Bloc « Catégories principales » gouverné (molécule + section + module Odoo)

**Branch**: `023-categories-gouvernees` | **Date**: 2026-08-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/023-categories-gouvernees/spec.md`

## Summary

Gouverner le bloc « Catégories principales » (réparé au pixel par 021, mais hors
contrat) sans changer son rendu : nettoyer la source Figma — l'axe « Disposition » à 4
variantes du master section `CategoriesPrincipales` (2115:4277) mélange style de carte,
nombre de colonnes et un contenu déguisé (« Rdv ») — puis extraire **deux contrats**
(`ds.carte-categorie`, molécule à un seul axe Style {superpose, empile} ;
`ds.categories-principales`, section composant une collection répétée + enum colonnes
{2,3}), les câbler dans le différentiel trois-voies et la parité visuelle, et livrer la
couche d'authoring Odoo (collection add/remove/reorder, édition image/titre/description/
lien par carte, sélecteur 2|3 colonnes) — le tout scandé par **quatre gates owner
bloquants** (A modèle cible, B pixel, C contrats, D éditabilité). Une seule extension de
schéma, additive : `VariantLayoutSchema.columns` (research D1), portée par la matrice de
capacités (grid à pistes fixes = CARRY-BOTH, l. 61) et le précédent `ds.equipe`.

**Dégradation nommée** : auggie MCP indisponible pendant la planification (HTTP 402) —
docs-first honoré par lecture directe de `docs/` + `rg` (repli prévu par la règle),
consigné dans [research.md](./research.md) D0.

## Technical Context

**Language/Version**: TypeScript (pin dépôt `typescript@^6`), Node ≥ 20, ESM via `tsx` ;
JavaScript Figma Plugin API (scripts bridge + `figma-sync/*.js` générés) ; Python/XML
QWeb/JS pour l'addon Odoo 19 (chaîne 019/022 existante)
**Primary Dependencies**: Zod (`@ds-contracts/schema` — UNE extension additive E1),
React 19 + CSS Modules (émetteur `react`), pont desktop figma-console (`figma_execute` +
`loadAllPagesAsync`, ports 9223-9232 ; page `Pages` 210:325), `extract/figma/page-parity/`
réutilisé tel quel (receiver 9227), `pixelmatch` + `pngjs`, `playwright-core` (parité
visuelle), Figma REST en lecture (`FIGMA_TOKEN`), Docker/Compose QA
(`odoo:19.0-20260803` + `postgres:15`, compose 022)
**Storage**: JSON sur disque — `contracts/*.contract.json` (+2, et `ds.carte` v3.0.0 si
option D3 recommandée retenue au Gate A), `tokens/primitives.tokens.json` (mints
from-dump), `evals/golden.json` + `figma-sync/plugin/engine.receipt.json` +
`examples/polaris/figma/*.figma.js` (trois re-pins, émetteur édité),
`parity/snapshots/figma-components.json` (refresh lecture), `extract/figma/visual-parity/
{subjects.ts,baseline.json}` (+2 sujets), `integrations/odoo/config/
{categories.authoring.json,inputs.lock.json,adaptation-registry.json}`,
artefacts de gates et preuves sous `specs/023-categories-gouvernees/`
**Testing**: portes du dépôt (build, parity, eval, plugin:check, roundtrip ×2,
core-browser-check, tsc ×2) + `geometry:gate` + `odoo:{inputs,authoring,module,
derivation}:check` + `odoo:qualification` + `editability-boundary` + protocole de dérive
injectée (US3) + scénario rédacteur sur instance QA (US2)
**Target Platform**: bibliothèque React générée + fichier Figma natif (Piqueray (Copy)
`d9FYAUcqdcNtsuaMgLefvJ`) + site Odoo 19 (éditeur Website)
**Project Type**: monorepo générateur (contrats → surfaces) + intégration Odoo
**Performance Goals**: régénération octet-pour-octet identique ×2 (SC-006) ; 0 pixel de
delta sur les 7 usages sauf re-calages décidés au Gate A (SC-002)
**Constraints**: déterminisme sans AI dans le chemin (I) ; zéro `node:*` dans `core/`
(VII) ; schéma additif only (VI) ; géométrie en tokens, jamais en littéraux ; gates
humains = arrêts réels (FR-005) ; mutation canvas seulement après capture §X intégrale
**Scale/Scope**: 2 nouveaux contrats + 1 champ de schéma + 2 émetteurs touchés + 1
section Odoo ; 7 usages + 2 masters côté canvas ; 4 gates owner ; hors périmètre : mobile,
produits, nav, choix de style rédacteur

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` (v1.2.0).

- [x] **I. Determinism (NON-NEGOTIABLE)** — l'extension E1 reste une fonction pure des
      deux émetteurs ; preuve par roundtrip ×2 + golden re-pin revu ; aucune AI dans le
      chemin de génération (elle n'assiste que l'audit et la rédaction des artefacts).
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — la capacité « colonnes par variante » suit
      fixture → eval (cas de refus + déterminisme) → claim (bump docs/02) ; aucun texte de
      capacité avant l'eval (research D1).
- [x] **III. Contract is the SSoT** — la mutation canvas est le **nettoyage de source
      Step 0 (§VIII)**, AVANT contractualisation — pas un side-sync ; ensuite les deux
      contrats génèrent les deux surfaces et `npm run parity` doit être propre.
- [x] **IV. No hand-edited output** — `src/components/`, `figma-sync/*.js`,
      `catalog/catalog.json` (via `npm run catalog` explicite — leçon 018),
      `contracts/contract.schema.json` : régénérés uniquement.
- [x] **V. Honesty** — dégradations nommées d'avance : auggie 402 (D0), cliché
      figma-components périmé (soldé en D7), 2 portes Odoo rouges pré-existantes (D10,
      re-relevées sans re-diagnostic), lien-destination hors contrat (doctrine D5), style
      non éditable rédacteur (documenté au Gate D).
- [x] **VI. Additive evolution** — E1 = champ optionnel unique + bump `docs/02` ;
      nouveaux contrats en 1.0.0 ; si le Gate A retient le retrait de
      `disposition: categorie`, `ds.carte` → **v3.0.0 majeur versionné bruyamment**.
- [x] **VII. Engine integrity** — aucun `node:*` ajouté dans `core/`
      (core-browser-check) ; tout défaut live-only découvert pendant la projection reçoit
      son double correctif (émetteur + mock).
- [x] **VIII. Source cleanliness** — c'est le cœur de la spec : audit lecture seule PAR
      POSITION (masters + 100 % des usages), Gate A avant mutation, affordances
      officialisées (flèche = part/icône du registre, jamais un calque caché), noms qui
      disent la vérité (axe « Disposition » supprimé/renommé).
- [x] **IX. Docs-first** — consulté AVANT les décisions : matrice l. 61 (grid
      CARRY-BOTH), doctrine image A5 (matrice l. 91 + handoff 08 §6), patrons equipe/
      hero/carte, limite nommée reassurances ; auggie en panne → repli lecture directe,
      nommé (D0).
- [x] **X. Before-capture** — FR-006 : capture intégrale (7 usages + 2 masters, image +
      structure) vérifiée non vide et dimensionnée AVANT toute mutation ; instrument
      page-parity réutilisé tel quel (D9).
- [x] **XI. Multi-writer bridge** — N/A : écriture canvas mono-session, zone unique,
      un seul cycle de vérification pixel global (D9).

**All gates green:**

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Specs executing in a git worktree run this sweep INSIDE the worktree (Constitution:
Worktree Gates F1) — `npm install` + `npx playwright install chromium` there first.

## Project Structure

### Documentation (this feature)

```text
specs/023-categories-gouvernees/
├── plan.md              # ce fichier
├── research.md          # Phase 0 — décisions D0…D12
├── data-model.md        # Phase 1 — entités, extension E1, state machine des gates
├── quickstart.md        # Phase 1 — parcours d'exécution ordonné par les gates
├── contracts/
│   ├── carte-categorie.contract.sketch.json        # modèle cible molécule (Gate A)
│   ├── categories-principales.contract.sketch.json # modèle cible section (Gate A)
│   ├── gates.interface.md                          # contrat d'interface des 4 gates
│   └── categories.editable-scope.json              # (créé au Gate D)
├── gates/               # artefacts machine des gates A/B/C (créés à l'exécution)
├── audits/              # relevés lecture seule (créés à l'exécution)
├── proofs/              # traces datées, captures §X, us2/, us3/ (créés à l'exécution)
└── tasks.md             # Phase 2 (/speckit.tasks — PAS créé par /speckit.plan)
```

### Source Code (repository root)

```text
contracts/
├── carte-categorie.contract.json          # NOUVEAU (extrait, Gate C)
├── categories-principales.contract.json   # NOUVEAU (extrait, Gate C)
└── carte.contract.json                    # v3.0.0 si option D3 retenue au Gate A

packages/schema/src/contract-schema.ts     # E1 : VariantLayoutSchema.columns (additif)
core/emit-react.ts                         # règle d'enum-classe grid-template-columns
core/emit-figma-script.ts                  # columns dans le combo compilé (l. 3568 déjà là)
docs/02-contract-spec.md                   # bump E1 (claim APRÈS l'eval)
evals/                                     # cas de refus E1 + golden.json (re-pin revu)
tokens/primitives.tokens.json              # mints from-dump size.carte-categorie.* / …
src/components/ · figma-sync/ · catalog/   # GÉNÉRÉS (jamais à la main)
figma-sync/plugin/engine.receipt.json      # re-pin plugin:check
examples/polaris/figma/*.figma.js          # 3e re-pin (émetteur édité)
parity/snapshots/figma-components.json     # refresh lecture post-mutation
extract/figma/visual-parity/{subjects.ts,baseline.json}   # +2 sujets
extract/figma/page-parity/                 # réutilisé TEL QUEL (§X, captures)
integrations/odoo/
├── config/{categories.authoring.json, inputs.lock.json, adaptation-registry.json}
├── addons/piqueray_ds/…                   # snippet QWeb + panneau (après Gate D)
└── qa/                                    # instance jetable, preuves US2
```

**Structure Decision**: monorepo existant, flux contrat→surfaces inchangé ; 023 n'ajoute
aucun répertoire de premier niveau — il étend les emplacements canoniques ci-dessus et
range tout artefact humain (gates, audits, preuves) sous `specs/023-categories-gouvernees/`.

## Phase 0 — Research (fait)

[research.md](./research.md) — 12 décisions, zéro NEEDS CLARIFICATION restant. Les trois
arbitrages structurants : **D1** (enum colonnes via `layoutByProp` + extension additive
`columns`, contre flex-wrap qui heurte la limite nommée de reassurances), **D3** (le sort
de `ds.carte` est une sous-décision du Gate A, éclairée par le recensement — le plan
structure, l'owner tranche), **D5** (la destination du lien n'est PAS une prop de
contrat — mécanisme Odoo `BuilderUrlPicker` éprouvé, seul un assemblage par-item est
nouveau).

## Phase 1 — Design & Contracts (fait)

[data-model.md](./data-model.md) (entités + E1 + state machine des gates),
[contracts/](./contracts/) (2 esquisses de modèle cible — support du Gate A, PAS les
contrats finaux : §VIII impose l'extraction depuis la source nettoyée — + l'interface des
4 gates), [quickstart.md](./quickstart.md) (parcours ordonné). Contexte agent mis à jour
via `.specify/scripts/bash/update-agent-context.sh claude`.

**Re-check Constitution post-design** : aucun écart introduit — E1 reste additif, aucune
nouvelle mécanique Odoo, l'écriture canvas reste mono-zone. ✅

## Phase 2 — Approche des tâches (décrite, PAS exécutée — `/speckit.tasks`)

Ordre dicté par les gates (FR-005), chaque gate étant une tâche bloquante explicite :

1. **F1 + état initial** — worktree autosuffisant, sweep vert de départ, relevé (sans
   re-diagnostic) des 2 portes Odoo rouges pré-existantes.
2. **US1a — audit lecture seule** (par position : usages, copies, 2 masters, recensement
   `Carte/Categorie`) → projet de Gate A. **⛔ Gate A.**
3. **US1b — captures §X intégrales** → mutations canvas conformes au Gate A → captures
   d'après + pixelmatch par usage. **⛔ Gate B.**
4. **US1c — E1** (schéma + émetteurs + eval de refus + bump docs/02 + mock si besoin) puis
   **extraction** des 2 contrats depuis un **relevé frais post-Gate B** de la source nettoyée
   (jamais le cliché périmé ; mints from-dump), build, 3 re-pins revus, **refresh lecture de
   `parity/snapshots/figma-components.json` AVANT le sweep** (sinon l'axe canvas compare au
   cliché du 2026-08-07 — la limite 017 se solde ici), sweep complet. **⛔ Gate C.**
5. **US3 — câblage** (vérification du cliché rafraîchi à l'étape 4 — committé comme entrée
   capturée, re-refresh seulement si le canvas a bougé —, +2 sujets visuels, protocole de
   dérive injectée archivé).
6. **Gate D — table d'éditabilité** (100 % props+parts, 4 verdicts). **⛔ Gate D.**
7. **US2 — Odoo** (authoring config + checks, snippet/panneau, instance QA, scénario
   rédacteur, 3 points de contrôle, frontière `editability-boundary`).
8. **Clôture** — sweep F1 final, rapport, MILESTONES daté (trou de journal nommé),
   `npm run catalog`.

## Complexity Tracking

> Aucune violation de la Constitution à justifier — tableau vide à dessein.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
