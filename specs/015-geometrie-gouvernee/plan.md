# Implementation Plan: Géométrie gouvernée

**Branch**: `015-geometrie-gouvernee` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-geometrie-gouvernee/spec.md` (+ [notes-pour-plan.md](./notes-pour-plan.md), les choix d'implémentation parqués)

## Summary

Faire entrer toute la géométrie des 34 contrats dans la boucle de gouvernance : zéro dimension invisible au contrôle (relevé d'ouverture ~260 littéraux dans 28 contrats — le compte vif fait foi), et réparer les défauts que 014 a prouvés. Approche, dans l'ordre imposé par FR-004 : (1) re-mesure « avant » dans la fenêtre ; (2) unification du modèle de boîte — la règle `box-sizing: border-box` que `core/emit-html.ts` porte déjà entre dans `core/emit-react.ts`, re-mesure attribuée des 9 contrats du rayon (DW-014-002) ; (3) comptage v2 de la porte de mesure (`aggregateOf` 1:N + unité « travail à faire »), relevé d'ouverture re-lu ; (4) fixtures de garde AVANT que le chantier s'y fie (préservation des correctifs 013 reproduite en rouge d'abord ; détection FR-005 des deux côtés en evals C3) ; (5) conversions littéral → référence from-dump (`space.N` / `size.<composant>.*`), les 2 dégradés du hero en littéraux nommés sur un registre fermé (`contracts/named-literals.registry.json`) avec un lift additif du canal `background-image`, le logo en prop `taille` + `{size.logo.{taille}.*}` (idiome avatar demo-51, binding Figma NONE jusqu'à 016) ; (6) réparations mesurées (Avec-CTA 8,78 %, texte-seo, footer DW-004/005, coordonnees) ; (7) clôture : porte géométrie `invisible: 0` (nouvelle, patron measure-gate), porte de mesure `contract-geometry: 0` PASS, registre avant/après intégralement attribué. Figma en lecture seule de bout en bout.

## Technical Context

**Language/Version**: TypeScript (pin dépôt `typescript@^6`), Node ≥ 20, ESM exécuté via `tsx`
**Primary Dependencies**: Zod (`@ds-contracts/schema` — seule source du schéma, ajout additif d'un canal littéral), React 19 + CSS Modules (émetteur `react`, le seul dont le CSS change de règle de boîte), `playwright-core` + `pixelmatch`/`pngjs` (instruments de mesure existants), Figma REST **LECTURE SEULE** (`FIGMA_TOKEN` — dumps existants + relevés) ; AUCUNE mutation canvas, AUCUN nouveau framework
**Storage**: JSON sur disque — `contracts/*.contract.json` (~28 touchés), `contracts/named-literals.registry.json` (NOUVEAU document gouverné), `tokens/primitives.tokens.json` (mints from-dump additifs), `specs/014-…/proofs/registre/causes.json` (registre vivant de la porte : `aggregateOf`, `resolvedBy`, destination DW-014-001), `specs/015-…/proofs/` (registre avant/après, relevés, reçus), `specs/015-…/fixtures/corrections-013.json` (NOUVEAU), re-pins : `evals/golden.json` + `figma-sync/plugin/engine.receipt.json` + `examples/polaris/figma/*.figma.js`
**Testing**: `evals/run.ts` (fixtures étendues : `measure-gate-policy-check` ; nouvelles : `geometry-gate-policy-check`, gradient-literal, vecteurs-proportionnels, préservation-013 ; +2 cas C3-detection), `npm run parity`, `npm run measure:gate` (comptage v2), `npm run geometry:gate` (NOUVEAU), sweep constitution complète
**Target Platform**: Node CLI + `core/` browser-pure (les lifts d'émetteur restent sans `node:*`, receipté par `core-browser-check`)
**Project Type**: bibliothèque générée par contrats + instruments de preuve (monorepo existant — aucune structure nouvelle hors `extract/geometry-gate/`)
**Performance Goals**: régénération byte-identique ×2 (roundtrip déterministe), portes en secondes (pures, sans réseau) ; les 2 contrôles Chromium restent les seuls à piloter un navigateur
**Constraints**: Figma lecture seule (FR-010) ; aucun seuil/région assoupli ; conversion pure = zéro changement de rendu (FR-012) ; schéma additif uniquement (VI) ; worktree autosuffisant (F1) ; `grep -a` (octet NUL) ; `evals/fixtures` hors tsconfig
**Scale/Scope**: 34 contrats (28 porteurs de littéraux géométriques, ~260 entrées à l'ouverture), 9 contrats re-mesurés pour la boîte, 7 travaux « géométrie du contrat » (6 attendus après remodelage 1:N — le vif fait foi), 2 littéraux nommés amorcés, 3 émetteurs code + 1 émetteur canvas touchés par 2 lifts bornés (box-sizing ; background-image littéral ; vecteurs-% pour le logo)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` (v1.2.0). Every item MUST be true, or be
justified in Complexity Tracking below.

- [x] **I. Determinism (NON-NEGOTIABLE)** — Les lifts d'émetteur (box-sizing, canal gradient, vecteurs-%) sont des fonctions pures string-out ; les % des vecteurs se calculent à la compilation (arithmétique déterministe) ; aucune IA dans le chemin ; roundtrip ×2 + golden re-pinnés en revue.
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — Chaque capacité nouvelle a sa fixture AVANT la claim : comptage v2 (fixture étendue au rouge d'abord), geometry-gate (fixture data-only), gradient littéral, vecteurs proportionnels, préservation-013 (le cas d'écrasement reproduit en ROUGE d'abord — exigence explicite de la spec), détection FR-005 (2 cas C3).
- [x] **III. Contract is the SSoT** — Les conversions changent les contrats puis régénèrent ; aucune retouche side-to-side ; `npm run parity` vert à chaque checkpoint (les références converties siègent sur les axes existants).
- [x] **IV. No hand-edited output** — `src/components/`, `figma-sync/*.js`, `catalog/`, `contract.schema.json` uniquement régénérés ; les octets qui changent sont re-pinnés via `update-golden.mjs` / `build-plugin-zip.mjs --update-engine-receipt` / `examples/polaris/generate.ts`, jamais édités.
- [x] **V. Honesty** — Les littéraux nommés sont recensés ET surveillés (valeur épinglée comparée) ; DW-002/DW-003 restent attribués `figma-source` → 016 (rendus visibles ici, jamais « réparés » ici) ; la porte géométrie refuse par nom ; le binding NONE du logo dit la vérité du canvas (pas de variante Taille) avec note → 016 ; l'inventaire corrections-013 déclare sa provenance reconstruite.
- [x] **VI. Additive evolution** — Schéma : `background-image` s'AJOUTE à `LITERAL_CHANNELS` avec grammaire bornée par canal (rien de repurposé, `LITERAL_VALUE_RE` intact) ; `docs/02-contract-spec.md` bumpé ; contrats : ajout de prop `taille` = minor ; gate.ts : champs optionnels ajoutés, aucun réinterprété.
- [x] **VII. Engine integrity** — `core/` reste browser-pure (les 3 lifts n'importent rien de `node:*` ; `core-browser-check` dans la sweep) ; aucun bug live-only attendu (pas de mutation canvas) — si un surgit, la discipline mock à deux volets s'applique.
- [x] **VIII. Source cleanliness** — N/A partiel assumé : AUCUNE extraction nouvelle depuis Figma (dumps et relevés existants uniquement, lecture seule) ; les défauts de source connus (DW-002, DW-003) sont précisément CE QUI EST EXCLU vers 016 — 015 ne modélise rien autour d'une source sale, il rend visible la valeur fidèle et route la correction au chantier canvas.
- [x] **IX. Docs-first** — Ce plan en est le produit : ROADMAP § Prochaines specs (les 2 décisions owner), la description datée du contrat hero (qui corrige le « zéro code moteur » du brief), le reçu `react-box-sizing-absent`, `causes.json`/`gate.ts` (comptage), l'archive avatar (idiome), `space.$description` (doctrine mint) — tout est cité dans research.md, rien re-dérivé quand un document répondait.
- [x] **X. Before-capture** — N/A : zéro mutation canvas (FR-010). La discipline analogue côté mesure est portée : l'« avant » du registre est capturé pour TOUS les sujets avant le premier changement d'émetteur (FR-011).
- [x] **XI. Multi-writer bridge** — N/A : aucun écrivain canvas. Si des agents parallèles exécutent des conversions, la partition se fait par CONTRATS disjoints et la vérification (sweep + registre) reste globale, propriété de l'orchestrateur — l'esprit de §XI appliqué au dépôt.

**All gates green:**

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Specs executing in a git worktree run this sweep INSIDE the worktree (Constitution:
Worktree Gates F1) — `npm install` + `npx playwright install chromium` there first.
S'y ajoutent, propres à 015 : `npm run measure:gate` (v2, contract-geometry → 0) et
`npm run geometry:gate` (invisible → 0), relus en direct à la clôture (SC-001, SC-005).

## Project Structure

### Documentation (this feature)

```text
specs/015-geometrie-gouvernee/
├── plan.md                                  # Ce fichier
├── research.md                              # Phase 0 — D1..D14, toutes sourcées
├── data-model.md                            # Phase 1 — entités, états, formes JSON
├── quickstart.md                            # Phase 1 — worktree, avant, phases, clôture
├── contracts/
│   ├── geometry-gate.interface.md           # Le contrôle FR-001 (population, refus, sorties)
│   ├── named-literals.registry.schema.md    # Le registre FR-003 (forme, invariants, gouvernance)
│   └── measure-gate-counting-v2.md          # FR-006 (aggregateOf 1:N, travail-à-faire)
├── fixtures/
│   └── corrections-013.json                 # FR-009 — inventaire des correctifs à préserver
├── proofs/                                  # registre/{avant,apres,causes}.json, recus/, relevés d'ouverture/clôture
└── tasks.md                                 # Phase 2 — /speckit.tasks (PAS créé par /speckit.plan)
```

### Source Code (repository root)

```text
core/
├── emit-react.ts            # D1 règle box-sizing ; D4 vecteurs-% ; D5 canal background-image
├── emit-html.ts             # D5 canal background-image (littéral) — la règle boîte y est déjà
├── emit-react-inline.ts     # D5 (miroir inline)
└── emit-figma-script.ts     # D5 : chemin lits → parseCssGradient (déjà écrit pour tokens)

packages/schema/src/contract-schema.ts   # D5 : LITERAL_CHANNELS + background-image (additif, grammaire par canal)

extract/
├── geometry-gate/           # NOUVEAU — gate.ts (pur) + run.ts (CLI exit 0|1|2), npm run geometry:gate
└── figma/
    ├── measure-gate/        # gate.ts + run.ts : comptage v2 (aggregateOf, resolvedBy)
    │                        # + run.ts : --apres <chemin> (T003b) — sans lui la porte relit
    │                        #   l'apres.json figé de 014 et SC-005 est inatteignable
    ├── organism-audit/
    │   ├── baseline.ts      # RÉUTILISÉ tel quel : inventoryLiterals / diffBaseline (trace des conversions)
    │   └── tools/build-registre.mts   # + paramètre de dossier de sortie (défaut 014 inchangé)
    └── visual-parity/       # triage.ts : règles réparées re-classées/retirées ; subjects/baseline re-pinnés attribués

contracts/
├── named-literals.registry.json   # NOUVEAU document gouverné (amorcé : 2 dégradés hero)
├── piqueray-logo.contract.json    # + prop taille (NONE→016), {size.logo.{taille}.*}   [0.2.0]
├── hero.contract.json             # + 2 littéraux nommés ; conversions
├── header/footer.contract.json    # passent taille comme couleur ; conversions (DW-004/005)
└── … ~25 autres                   # conversions littéral → référence, valeur identique

tokens/primitives.tokens.json      # mints from-dump : space.N manquants, size.<composant>.*

evals/
├── run.ts                   # +2 cas C3 (FR-005) ; cas geometry-gate ; cas préservation-013
├── fixtures/measure-gate-policy-check.ts    # étendue (v2) — AU ROUGE d'abord
└── fixtures/geometry-gate-policy-check.ts   # NOUVELLE (data-only)

specs/014-mesure-juste-triage/proofs/registre/causes.json  # aggregateOf ; resolvedBy: "015" ; destination DW-014-001
```

**Structure Decision**: monorepo existant, aucune arborescence nouvelle hors `extract/geometry-gate/` (patron `measure-gate` répliqué) et le registre gouverné dans `contracts/` (précédent `icons.registry.json`). Les instruments de 014 sont réutilisés, jamais dupliqués — la seule édition d'outil est un paramètre de dossier de sortie sur `build-registre.mts`, rétro-compatible.

## Complexity Tracking

> Aucune violation constitutionnelle à justifier. Trois points de vigilance assumés, avec leur garde-fou :

| Point | Pourquoi nécessaire | Garde-fou |
|---|---|---|
| 3 lifts d'émetteur dans une spec « de conversion » (box-sizing, canal gradient, vecteurs-%) | FR-004 impose la boîte avant toute conversion ; FR-003 impose les dégradés nommés (le canal refuse aujourd'hui — description datée du contrat hero) ; FR-008 impose deux tailles réelles (vecteurs figés en px sinon) | Chaque lift : fixture → eval → claim ; **un lot de re-pins ×3 par phase qui touche émetteurs, contrats ou tokens** — quatre au total (T015–T017, T045b, T054, T060b), chacun revu en diff ; roundtrip ×2 ; rendu prouvé inchangé hors périmètre attribué par le registre avant/après |
| Édition du registre vivant de 014 (`causes.json`) | C'est la donnée de la porte (pas une preuve datée) : `aggregateOf`/`resolvedBy`/destination sont exactement ce que la clarification ordonne d'y modéliser | Le doc d'interface 014 reste intact ; sémantique v2 documentée dans 015 ; fixture de porte étendue avant la donnée |
| Relevé d'ouverture ≠ 7 après remodelage (attendu 6) | Conséquence arithmétique voulue de la relation 1:N (jamais N+1) | La spec le prévoit (« il peut différer de 7 ») ; le compte vif imprimé fait foi, publié dans proofs/, jamais recopié |
