# Implementation Plan: Adopter les tokens Figma manquants — parité complète

**Branch**: `012-adopt-figma-tokens` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-adopt-figma-tokens/spec.md`

## Summary

Combler l'angle mort du contrôle de parité : le dépôt ne connaît que 62 des 139 tokens
gouvernés dans Figma. Le chantier (1) rafraîchit en lecture le cliché de variables que
lit l'axe tokens (`parity/snapshots/figma-tokens.json`, aujourd'hui 62 variables,
extrait 2026-07-28) et le commite comme référence unique des comptes ; (2) adopte les
feuilles manquantes (au relevé actuel : 29 primitives littérales + 48 sémantiques de
typographie en alias) dans les DEUX seuls fichiers édités —
`tokens/primitives.tokens.json` et `tokens/semantic.tokens.json` — strictement additif
à la feuille, valeurs identiques ; (3) régénère et prouve octet par octet que seules
les deux surfaces de la liste blanche s'enrichissent (`src/styles/tokens.css`,
`figma-sync/01-tokens.js`, + leurs 2 lignes de hash dans `evals/golden.json`).
Aucun nouveau contrôle, aucun nouveau code : toutes les vérifications sont des portes
existantes (refus au build d'un token inexistant, axe tokens du differ, golden,
suite d'evals). Figma reste en lecture seule ; les 89 valeurs en dur des contrats ne
sont pas converties — chaque token adopté devient simplement **liable** (prouvé par un
essai en copie scratch, reçu consigné). Un rapport d'adoption commité porte comptes,
liste des 77, limites nommées et reçus.

## Technical Context

**Language/Version**: TypeScript (pin `typescript@^6`) / Node ≥ 20, ESM via `tsx` —
instruments existants uniquement ; l'adoption elle-même est une opération **données**
(JSON DTCG dialecte legacy du dépôt : hex strings, `"Npx"`, alias point mono-niveau)
**Primary Dependencies**: `scripts/build-tokens.mjs` (zéro dépendance),
`scripts/generate-figma.ts` + `core/emit-figma-script.ts` (01-tokens.js),
`parity/diff.ts` (axe `figma-tokens`, `norm()`), `parity/extract-figma.plugin.js`
(cliché, via pont figma-console `figma_execute`, lecture seule),
`scripts/update-golden.mjs`, `evals/run.ts` — **AUCUN nouveau code applicatif**
**Storage**: JSON sur disque — `tokens/{primitives,semantic}.tokens.json` (seuls
fichiers édités à la main), `parity/snapshots/figma-tokens.json` (entrée capturée
commitée, FR-004a), `evals/golden.json` (re-pin, 2 lignes),
`specs/012-adopt-figma-tokens/{adoption-report.md,proofs/}` (reçus)
**Testing**: portes existantes exclusivement (FR-008) : `npm run build` (refus alias
cassé ×2 portes), `npm run parity` (139 ↔ 139), `npm run eval` (`N/N` vivant, dont
`golden-generated-output`, `refuse-unknown-token-reference`,
`detect-token-{alias-drift,missing-variable,extra-variable}`), `plugin:check`,
roundtrip déterministe, core-browser-check, `tsc` ×2 — sweep F1 dans le worktree
**Target Platform**: Node CLI (génération/vérification) + pont figma-console desktop
(un seul geste, en lecture)
**Project Type**: extension de la couche données (fondation de tokens) — zéro schéma,
zéro générateur, zéro contrat touchés
**Performance Goals**: session complète ~30 min vérification comprise (SC-007) ;
régénération byte-identique ×2 (principe I)
**Constraints**: additivité mesurée à la feuille (62/62 intactes) ; valeurs identiques
(conventions du dépôt : `"25px"` ↔ FLOAT 25 via `norm()`) ; sémantiques = alias
obligatoires (porte du générateur) ; Figma lecture seule (FR-010) ; liste blanche
stricte + protocole d'alarme (FR-006/007) ; mono-marque/mono-mode préservé
**Scale/Scope**: 62 → 139 feuilles (+29 primitives, +48 sémantiques au relevé actuel,
re-relevé au T0) ; 2 fichiers sources édités ; 2 surfaces générées enrichies ; 1 cliché
rafraîchi ; 1 rapport ; 0 contrat, 0 icône, 0 mode, 0 marque

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` (v1.2.0). Every item MUST be true, or be
justified in Complexity Tracking below.

- [x] **I. Determinism (NON-NEGOTIABLE)** — Aucun modèle dans le chemin : édition de
      JSON sources + régénération pure (`npm run build`, `npm run figma:plan`) ;
      byte-identique ×2 prouvé par le roundtrip + `golden-generated-output`.
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — Aucune nouvelle capacité revendiquée,
      donc aucun nouvel eval requis ; les evals existants couvrent déjà refus/détection/
      golden. Les comptes ne vivent que dans des reçus datés (rapport d'adoption),
      jamais en dur dans un document vivant.
- [x] **III. Contract is the SSoT** — Le geste étend la moitié tokens de la source de
      vérité et régénère VERS les surfaces ; aucun sync side-to-side ; `npm run parity`
      propre à la clôture (139 ↔ 139).
- [x] **IV. No hand-edited output** — `tokens.css` et `01-tokens.js` ne changent que
      par régénération ; le golden re-épinglé le prouve (diff limité à 2 hashes).
- [x] **V. Honesty** — Dégradations nommées par contrat d'interface : limites au
      rapport (rubrique obligatoire, « aucune » explicite), cliché non rafraîchissable
      = arrêt nommé, auggie indisponible pendant la planification = nommé dans
      research.md. Rien d'omis en silence.
- [x] **VI. Additive evolution** — Zéro changement de schéma ; zéro contrat versionné
      (contracts/ intact, FR-009) ; l'additivité s'applique à la feuille de token
      (FR-003), modèle plus strict que le semver requis.
- [x] **VII. Engine integrity** — `core/` non modifié ; `core-browser-check` au sweep ;
      aucun bug canvas en jeu (aucune écriture canvas).
- [x] **VIII. Source cleanliness** — Pas de contractualisation de composant ici ; le
      corollaire s'applique aux tokens : toute collision/valeur douteuse au relevé est
      d'abord arbitrée « défaut Figma ou pas » côté source, jamais contournée en code
      (contrat `cliche-refresh.md`, garde-fou D2/D3).
- [x] **IX. Docs-first** — `docs/03-token-pipeline.md` + `docs/06-parity-loop.md` lus
      AVANT toute décision (auggie en 402 → fallback nommé : lecture directe + `rg`,
      research.md « Méthode »). Les décisions D1-D14 citent docs et code, pas de
      re-dérivation.
- [x] **X. Before-capture** — N/A : aucune mutation du canvas Figma (FR-010, lecture
      seule de bout en bout) ; le seul geste Figma est une extraction en lecture.
- [x] **XI. Multi-writer bridge** — N/A : un seul lecteur, zéro écrivain, un seul
      geste de pont.

**Post-design re-check (Phase 1)** : inchangé — les artefacts (research, data-model,
contracts/, quickstart) n'introduisent ni code nouveau, ni contrôle nouveau, ni
écriture Figma. PASS.

**All gates green:**

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Specs executing in a git worktree run this sweep INSIDE the worktree (Constitution:
Worktree Gates F1) — `npm install` fait (tsx présent) ; `npx playwright install
chromium` au T0 (quickstart §0).

## Project Structure

### Documentation (this feature)

```text
specs/012-adopt-figma-tokens/
├── plan.md              # Ce fichier
├── research.md          # Phase 0 — décisions D1-D14 (routes, formats, preuves)
├── data-model.md        # Phase 1 — entités : feuille, fondation, cliché, liste blanche…
├── quickstart.md        # Phase 1 — la session ~30 min, commandes et reçus
├── contracts/           # Phase 1 — contrats d'interface des gestes
│   ├── cliche-refresh.md      # rafraîchissement du cliché (FR-004/004a)
│   ├── format-adoption.md     # écriture des 77 feuilles (FR-001/002/003)
│   ├── liste-blanche.md       # preuve octet + protocole d'alarme (FR-006/007)
│   └── rapport-adoption.md    # gabarit du rapport (FR-011)
├── checklists/requirements.md # validation de la spec (fait)
└── tasks.md             # Phase 2 — /speckit.tasks (PAS créé par /speckit.plan)
   # À l'implémentation s'ajouteront : adoption-report.md + proofs/
```

### Source Code (repository root)

```text
tokens/
├── primitives.tokens.json        # ÉDITÉ : +29 feuilles littérales (38 → 67)
├── semantic.tokens.json          # ÉDITÉ : +48 feuilles alias (24 → 72)
└── modes/                        # INTACT (mono-marque / mono-mode)

parity/
├── snapshots/figma-tokens.json   # RAFRAÎCHI (entrée capturée commitée — FR-004a)
├── snapshots/figma-components.json     # intact (D2)
├── snapshots/figma-tokens-export.dtcg.json  # intact — orphelin ère démo, nommé (D10)
├── extract-figma.plugin.js       # exécuté tel quel via le pont (lecture)
└── diff.ts                       # inchangé — l'axe tokens fait foi

src/styles/tokens.css             # RÉGÉNÉRÉ : +77 propriétés (liste blanche)
figma-sync/01-tokens.js           # RÉGÉNÉRÉ : PRIMITIVES/SEMANTIC enrichis (liste blanche)
evals/golden.json                 # RE-ÉPINGLÉ : exactement 2 lignes de hash

# Intacts et prouvés tels : src/components/**, src/styles/tokens.{dark,brands}.css,
# figma-sync/{02..,batch-*}.js, catalog/catalog.json, contracts/**, core/**,
# packages/**, scripts/** (aucun générateur modifié)
```

**Structure Decision** : opération couche-données pure sur la fondation de tokens.
Deux fichiers sources édités, une entrée capturée rafraîchie, deux surfaces générées
enrichies, un manifeste re-épinglé, un rapport commité — aucun module, script ou
dossier nouveau dans le code du dépôt.

## Complexity Tracking

Aucune violation de la Constitution Check — tableau vide.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
