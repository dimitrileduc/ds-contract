# Implementation Plan: Extraction des molécules et organismes — 7 → 34 composants gouvernés

**Branch**: `010-extract-molecules-organisms` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-extract-molecules-organisms/spec.md`

## Summary

Passer de 7 à 34 composants gouvernés en adoptant 27 des 57 propositions de contrats déjà
générées depuis le canvas Figma (spec 007, commit `e4eb6ba`, `extract/out/figma/` — 68 fichiers,
57 clés uniques, 11 doublons d'accents à écarter par clé). Route **extraction** (comme 004, pas
comme 006) : les masters existent déjà sur le canvas, nettoyés par 003/005/007 — l'étape 0 (§VIII)
est satisfaite par **réutilisation d'audits existants** (les 27 cibles ont toutes une couverture
003/005), jamais refaite. Chaque proposition est reviewée (notes + unbound values de
`figma-proposals.md`), adoptée en `contracts/<name>.contract.json` (version 1.0.0, `category`,
`semantics.provenance: "extracted"`, `anchors.figma.dumpedAt`), puis la chaîne prouvée tourne :
build → figma:plan → catalog → purge orphelins figma-sync + golden:update revu → parity → sujets
visuels + baseline → sweep des gates. Précondition : extension du registre d'icônes 16 → 19
(v1.1.0 → v1.2.0, minor) pour débloquer les organismes instanciant Mail/ExternalLink/
OcticonChevronDown12. Découpage en lots ordonnés par dépendance (icônes → atomes → molécules →
organismes), sweep complet des gates à chaque lot (Worktree Gates F1).

## Technical Context

**Language/Version**: TypeScript (repo pin `typescript@^6`), Node ≥ 20, ESM exécuté via `tsx`
**Primary Dependencies**: Zod (`@ds-contracts/schema` — seule source du schéma), React 19 + CSS Modules (émetteur `react`), Figma Plugin API (scripts de sync, lecture seule cette itération sauf corrections §VIII), Figma REST API (`FIGMA_TOKEN` — export SVG des 3 icônes, lecture), pont figma-console (lecture : refresh snapshots), `playwright-core` + `pixelmatch` (instrument visuel existant)
**Storage**: JSON sur disque — `extract/out/figma/*.contract.proposed.json` (entrée, 57 sets), `contracts/*.contract.json` (+27), `contracts/icons.registry.json` (1.1.0 → 1.2.0), `assets/icons/*.svg` (+3), `tokens/*.tokens.json` (inchangés), `evals/golden.json` (re-pin revu), `parity/snapshots/*.json` (refresh lecture), `parity/baseline.json` (acquittements owner éventuels), `extract/figma/visual-parity/{subjects.ts,baseline.json}` (+27 sujets)
**Testing**: `evals/run.ts` (compte vivant à la date du plan : 113 actifs / 107 passent / 48 quarantainés), `npm run parity` (4 axes : code, figma, figma-tokens, icons — auto-découverte des contrats), instrument visuel (seuil 2.0 %, ligne de triage 3.0 %, epsilon 0.1 pp), `plugin:check`, `deterministic-roundtrip`, `core-browser-check`, `tsc` ×2
**Target Platform**: outillage Node CLI + `core/` browser-pur + plugin Figma (pont desktop)
**Project Type**: générateur contract-driven — route **extraction** (canvas → proposition → contrat → code), pas de push canvas (les masters existent déjà)
**Performance Goals**: régénération byte-identique ×2 ; déterminisme prouvé par `deterministic-roundtrip.mjs`
**Constraints**: zéro `node:*` dans `core/` ; jamais d'édition à la main du généré ; rapprochement par clé de composant, jamais par nom ; nommage table 007 (français Figma ↔ anglais code, accents dépliés) ; valeurs non liées → canal `literals` nommé (précédent 004/006), mint `imported.*` disponible mais jamais utilisé sur Piqueray à ce jour ; aucune extension de schéma prévue — toute capacité manquante (grid, embed) = reclassement en exclu, jamais de contournement
**Scale/Scope**: 27 nouveaux contrats (7 → 34), registre d'icônes 16 → 19, ~35 scripts figma-sync renumérotés (purge des orphelins obligatoire, leçon 006 T037), ~27 sujets visuels, réactivations d'évals selon la règle hybride

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` (v1.2.0). Every item MUST be true, or be
justified in Complexity Tracking below.

- [x] **I. Determinism (NON-NEGOTIABLE)** — Aucune IA dans le chemin contrat→surface : les
      propositions sont déjà générées (007, pur déterministe) ; la review est de l'autorat
      assisté (précédent 004 : « autorat assisté, jamais génération ») ; la régénération est
      prouvée byte-identique ×2 ; le golden re-pin est explicite et revu, jamais automatique.
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — Aucune revendication nouvelle sans éval : les cas
      quarantainés débloqués par 010 sont réactivés (move, pas rewrite) AVANT toute claim ; les
      compteurs cités restent le compte vivant ; ce plan ne prétend aucune capacité grid/embed/slot
      non prouvée.
- [x] **III. Contract is the SSoT** — Tout passe par `contracts/*.contract.json` ; `npm run parity`
      propre à chaque lot ; les surfaces ne se synchronisent jamais entre elles.
- [x] **IV. No hand-edited output** — `src/components/`, `figma-sync/*.js`, `catalog/`, schema
      regénérés uniquement ; les orphelins figma-sync renumérotés sont purgés par `git rm` dans le
      même commit revu (leçon 006 T037 — suppression de généré obsolète, pas édition).
- [x] **V. Honesty** — Unbound values → canal `literals` nommé ou mint rapporté, jamais silencieux ;
      exclusions avec motif par organisme (pas de label générique) ; exclusions de sujets visuels
      nommées là où la capacité est revendiquée (précédent Select) ; résidus canvas connus (Carte,
      TexteSEO, Coordonnees) rappelés, pas cachés.
- [x] **VI. Additive evolution** — Aucun changement de schéma : toutes les compositions requises
      existent post-006 (`component`, `repeat + component`, `slot + accepts` en schéma). Registre
      d'icônes : widening = minor (1.1.0 → 1.2.0). Contrats neufs : 1.0.0. Si un enum Button doit
      s'élargir pour égaler le registre : minor bump du Button. `docs/02` non touché (pas de
      schéma nouveau).
- [x] **VII. Engine integrity** — Aucune modification de `core/` prévue ; si un bug live-only
      apparaît, le fix a deux parties (émetteur + mock) — discipline rappelée dans
      `contracts/extraction-workflow.md`.
- [x] **VIII. Source cleanliness** — Étape 0 satisfaite par **réutilisation** : les 27 cibles ont
      toutes une couverture d'audit 003/005 (table de réutilisation dans `research.md` D4), les
      caveats sont déjà nommés dans les artefacts. Tout défaut nouveau révélé à la re-mesure est
      corrigé à la source AVANT extraction — jamais modélisé autour.
- [x] **IX. Docs-first** — Phase 0 a consulté : `evals/REMOVED-CASES.md` + `legacy-cases.ts`,
      `docs/handoff/09-testing-and-gates.md`, `docs/FIGMA-CAPABILITY-MATRIX.md` (grid/embed
      absents, confirmé), `docs/reference/demo-archive/INDEX.md` (mapping 27 lignes), specs
      003/005/007 (audits, naming table, proposals). Aucune règle re-dérivée.
- [x] **X. Before-capture** — Itération majoritairement en lecture (extraction). SI une correction
      de source devient nécessaire (défaut révélé à la re-mesure) : capture avant de TOUTES les
      cibles affectées, vérifiée non-vide et correctement dimensionnée, avant toute mutation —
      rappelé comme tâche bloquante dans `contracts/extraction-workflow.md`.
- [x] **XI. Multi-writer bridge** — N/A par défaut (pas d'écriture canvas parallèle prévue). Si
      des corrections parallèles surviennent : zones disjointes + un seul cycle pixel global tenu
      par l'orchestrateur (précédent 005 cycle 14).

**All gates green:**

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Spec exécutée dans ce worktree : `npm install` + `npx playwright install chromium` ici d'abord
(Worktree Gates F1) ; le sweep complet tourne dans le worktree à chaque lot et à la clôture.

## Project Structure

### Documentation (this feature)

```text
specs/010-extract-molecules-organisms/
├── plan.md                          # This file
├── research.md                      # Phase 0 — toutes les décisions (D1-D10)
├── data-model.md                    # Phase 1 — entités (contrat, proposition, registre, périmètre…)
├── contracts/
│   ├── perimeter-table.md           # US5 — statut explicite de chaque composant Figma + règle de compte
│   ├── extraction-workflow.md       # Lots ordonnés, chaîne par lot, disciplines (orphans, golden, §X/§XI)
│   ├── icons-registry-extension.md  # FR-014a — +3 icônes, acquisition SVG, couplage enum Button
│   └── eval-revival.md              # FR-018 — cas à réactiver (obligatoire / conditionnel / dette adjacente)
├── quickstart.md                    # Phase 1 — scénario de bout en bout (une molécule, puis le sweep)
└── tasks.md                         # Phase 2 (/speckit.tasks — pas créé ici)
```

### Source Code (repository root)

```text
extract/out/figma/                   # ENTRÉE — 68 propositions (57 clés uniques) + figma-proposals.md
contracts/                           # +27 *.contract.json (adoption après review) ; icons.registry.json 1.2.0
assets/icons/                        # +3 SVG (external-link, mail, octicon-chevron-down12)
packages/schema/src/contract-schema.ts  # INCHANGÉ (aucune extension requise)
scripts/                             # INCHANGÉS — generate-components, generate-figma, generate-catalog,
                                     # update-golden, build-tokens, emit-schema (réutilisation, règle owner)
core/                                # INCHANGÉ — propose-figma, emit-*, mint-* (aucune capacité nouvelle)
parity/                              # diff.ts auto-découvre les contrats ; snapshots/*.json refresh lecture ;
                                     # baseline.json acquittements owner éventuels
extract/figma/visual-parity/         # subjects.ts (+27 entrées) ; baseline.json (--write-baseline revu)
evals/                               # run.ts (+ cas réactivés déplacés depuis legacy-cases.ts) ;
                                     # legacy-cases.ts (− mêmes cas) ; REMOVED-CASES.md (retraits nommés,
                                     # compteurs re-synchronisés) ; golden.json (re-pin revu)
src/components/                      # GÉNÉRÉ — +27 dossiers composants + barrel (jamais édité à la main)
figma-sync/                          # GÉNÉRÉ — ~35 scripts renumérotés ; orphelins purgés par git rm
catalog/                             # GÉNÉRÉ — npm run catalog (+ verify:catalog)
dashboard/, .storybook/              # AUCUNE édition — consomment catalog + stories auto-découverts
```

**Structure Decision**: Réutilisation intégrale de l'outillage existant (règle owner : zéro
outillage jetable). Les seules éditions de source sont : adoption des 27 contrats, registre
d'icônes +3, `extract/figma/visual-parity/subjects.ts`, déplacements d'évals
(`legacy-cases.ts` → `run.ts`), et corrections de source Figma si la re-mesure révèle un défaut
(avec §X/§XI). Aucune modification de `core/`, `packages/schema`, `scripts/` n'est prévue ; toute
capacité manquante détectée à la review d'une proposition entraîne le reclassement du composant
en exclu avec motif (FR-013, edge case « plus complexe que prévu »), jamais un contournement.

## Complexity Tracking

> Aucune violation de la Constitution à justifier — les 11 principes passent sans exception.
