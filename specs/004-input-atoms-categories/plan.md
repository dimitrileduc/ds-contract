# Implementation Plan: Atomes de saisie gouvernés par contrat + notion de catégorie (et 3 icônes sociales)

**Branch**: `004-input-atoms-categories` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-input-atoms-categories/spec.md`

## Summary

Les 4 atomes de saisie livrés par 003 (Input, Textarea, Select, Checkbox — masters
owner-validés sur `DS · Atomes`) deviennent des composants gouvernés par contrat via la
chaîne prouvée en 002 (dump REST lecture seule → propose → review/adopt → build → parité
trois voies → contrôle visuel), jointure par clé de composant. Le schéma gagne un champ
additif-optionnel `category` (`atom`/`molecule`/`section`) dont les trois surfaces
générées (Storybook, catalog, Contract Hub) dérivent leur groupement (« Atoms /
Molecules / Sections », map de libellés unique) ; les 5 composants existants le portent
(Button → v1.5.0). Le registre d'icônes passe à 16 (facebook, instagram, star — SVG
extraits du fichier réel, star à couleur fixe nommée), ce qui FORCE l'élargissement des
enums du Button (gate « ni plus ni moins ») — le menu Figma resté à 13 est une divergence
acquittée, léguée à la prochaine itération d'écriture. Le tout **en lecture seule
stricte** sur le fichier Figma, prouvée par relevés d'historique de versions avant/après
avec attribution (coexistence 003, masters d'atomes gelés par accord).

Détails : [research.md](./research.md) (D1-D12) · [data-model.md](./data-model.md) ·
[contracts/](./contracts/) · [quickstart.md](./quickstart.md).

## Technical Context

**Language/Version**: TypeScript (repo pin `typescript@^6`), Node ≥ 20, ESM exécuté via `tsx`
**Primary Dependencies**: Zod (`@ds-contracts/schema` — la seule source du schéma), React 19 + CSS Modules (émetteur `react`), Storybook 10, Vite, `playwright-core` + `pixelmatch` (instrument visuel existant), Figma REST API en LECTURE (`FIGMA_TOKEN`) + pont figma-console en lecture (refresh snapshot, relevés)
**Storage**: JSON sur disque — `contracts/*.contract.json` (+4), `contracts/icons.registry.json` (v1.1.0), `tokens/*.tokens.json` (inchangés), `evals/golden.json` (re-pin), `parity/snapshots/*` (refresh lecture), `parity/baseline.json` (acquittements owner éventuels)
**Testing**: les 8 gates du dépôt (build, parity, eval — compte vivant, plugin:check, deterministic-roundtrip, core-browser-check, tsc ×2) + instrument visuel (subjects +4, `--write-baseline` revu)
**Target Platform**: Node CLI (générateurs/instruments) + core browser-pure + bibliothèque React générée + plugin Figma (inchangé)
**Project Type**: monorepo générateur (contrats → surfaces), npm workspaces
**Performance Goals**: génération byte-identique ×2 (déterminisme prouvé, golden + roundtrip)
**Constraints**: LECTURE SEULE Figma (FR-001, preuve par historique de versions) ; coexistence 003 (fichier vivant, masters des 4 atomes gelés — FR-004) ; worktree sans `node_modules` (installer, ou évals sur le checkout principal) ; registre verrouillé à 16 ; aucune tolérance visuelle nouvelle
**Scale/Scope**: 1 → 5 contrats ; 13 → 16 icônes (+1 glyphe interne `check`) ; 1 champ de schéma additif ; 3 surfaces groupées ; suite d'évals ~102 + nouvelles + réactivations nommées

## Constitution Check

*GATE: passé avant Phase 0 ; re-vérifié après Phase 1 — les deux fois VERT.*

Derived from `.specify/memory/constitution.md` (v1.0.0).

- [x] **I. Determinism (NON-NEGOTIABLE)** — l'extraction produit des dumps (photos) ;
      propose est une fonction pure du dump ; l'humain review/adopte (autorat assisté,
      jamais génération). contract→surface reste 100 % fonctions pures, byte-pinné
      (golden re-pin explicite + roundtrip ×2). Aucun modèle dans le chemin de génération.
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — ordre imposé : fixtures/évals category
      (C6/C2/tolérance) et « glyphe interne » (si D7 retenu) AVANT toute phrase de doc ;
      compteurs (16 icônes, N évals, 5 composants) synchronisés au compte vivant (D11).
- [x] **III. Contract is the SSoT** — la catégorie entre DANS le contrat ; les surfaces
      la dérivent par régénération ; zéro sync côte-à-côte ; `npm run parity` zéro
      finding actif à la clôture (acquittements = décisions owner enregistrées, D5/D7).
- [x] **IV. No hand-edited output** — `src/components/`, stories, catalog, schéma JSON :
      régénérés uniquement (les 4 nouveaux composants naissent générés).
- [x] **V. Honesty** — dégradations nommées d'avance : star à couleur fixe (D6), menu
      Bouton à 13 (D5), coche hors registre (D7), vecteurs non lus par propose
      (dégradation au rapport), re-mesures sur fichier vivant (D12).
- [x] **VI. Additive evolution** — schéma : `category` optionnel + export
      `CATEGORY_LABELS`, zéro repurposing, `docs/02-contract-spec.md` bumpé ; semver :
      atomes 1.0.0, Button 1.4.0→1.5.0 (minor : +category, +élargissement enum),
      registre 1.0.0→1.1.0 (minor).
- [x] **VII. Engine integrity** — modifs core = fonctions pures string-out (title des
      stories), `core-browser-check` au gate ; AUCUNE écriture canvas (itération lecture
      seule) donc aucune dette mock nouvelle ; le mock n'est pas contourné.

**All gates green:**

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

(+ `npm run extract:figma:visual -- --summary` pour le gate visuel courant.)

## Project Structure

### Documentation (this feature)

```text
specs/004-input-atoms-categories/
├── plan.md              # Ce fichier
├── research.md          # Phase 0 — D1-D12, toutes inconnues résolues
├── data-model.md        # Phase 1 — entités & shapes attendues
├── quickstart.md        # Phase 1 — ordre de marche + pièges
├── contracts/
│   ├── category.interface.md
│   ├── input-atoms.interface.md
│   ├── icons-16.interface.md
│   └── read-only-proof.interface.md
├── proofs/              # (implémentation) read-only/, audits-003.md
└── tasks.md             # Phase 2 (/speckit.tasks — PAS créé par /speckit.plan)
```

### Source Code (repository root)

```text
packages/schema/src/contract-schema.ts   # +category (optionnel) + CATEGORY_LABELS ; docs/02 bumpé
core/emit-react.ts                        # generateStories : title groupé par catégorie (fallback Components/)
scripts/generate-catalog.ts               # +category (monolithe + shards + index)
dashboard/src/{data.ts, views/ComponentsList.tsx}   # Contract Hub groupé
contracts/
├── input.contract.json                   # NOUVEAU v1.0.0 (ds.input)
├── textarea.contract.json                # NOUVEAU v1.0.0 (ds.textarea)
├── select.contract.json                  # NOUVEAU v1.0.0 (ds.select)
├── checkbox.contract.json                # NOUVEAU v1.0.0 (ds.checkbox)
├── button.contract.json                  # v1.5.0 (+category, enum icônes 13→16)
└── icons.registry.json                   # v1.1.0 (16 entrées)
assets/icons/                             # +facebook.svg +instagram.svg +star.svg +check.svg (glyphe interne)
parity/diff.ts                            # (si D7 retenu) classe « glyphe interne consommé » ; baseline.json si acquittements
extract/figma/visual-parity/subjects.ts   # +4 ContractSubjects (± support mono-COMPONENT dans l'instrument commun)
evals/run.ts (+ fixtures)                 # évals category (+ glyphe interne) ; réactivations nommées ; golden.json re-pinné
src/components/                           # GÉNÉRÉ — 5 composants (jamais à la main)
catalog/                                  # GÉNÉRÉ — champ category
```

**Structure Decision** : aucune structure nouvelle — chaque capacité manquante est ajoutée
à l'outillage commun existant (règle owner « zéro outillage jetable ») ; les preuves
d'itération vivent sous `specs/004-…/proofs/` comme en 002/003.

## Complexity Tracking

Aucune violation à justifier — le Constitution Check passe sans dérogation.

## Risques nommés (surveillés pendant l'implémentation)

1. **Axe figma⟷contract vs enum 16 / menu 13** (D5) : vérifié immédiatement après
   l'élargissement ; branche acquittement prête (baseline + accord owner + legs nommé).
2. **Coche Checkbox** (D7) : arbre de décision tranché par le dump ; spike front-loadé ;
   escalade owner si ni texte ni icon-part ne colle (jamais de silence).
3. **Subjects mono-COMPONENT** (D9) : vérifié au spike Input ; capacité ajoutée à
   l'instrument commun si besoin (+ éval).
4. **Part `input` natif non-dessiné** (pattern démo, D7/D8) : si la validation actuelle
   le refuse, repli sémantique nommé — jamais un contournement silencieux.
5. **Fichier vivant** (D12) : re-mesure au dump ; gel FR-004 ; ré-extraction nommée si 003
   doit toucher un master gelé.
