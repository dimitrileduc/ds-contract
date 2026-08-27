# Sweep constitutionnel de clôture — 030 (T027)

Exécuté **dans le worktree** (`just-euphonium`, Worktree Gates F1), le 2026-08-27.

## Les huit portes

```
npm run build                                        → exit 0
npm run parity                                       → exit 0
npm run eval                                         → exit 0   (242/243, voir ci-dessous)
npm run plugin:check                                 → exit 0
npx tsx scripts/deterministic-roundtrip.mjs          → exit 0
node scripts/core-browser-check.mjs                  → exit 0
npx tsc --noEmit                                     → exit 0
npx tsc -p tsconfig.build.json                       → exit 0
```

## FR-012 / SC-007 — surface de re-pin ZÉRO

```
git status --porcelain src/ figma-sync/ catalog/ evals/golden.json
(vide)
```

**Rien de généré n'a bougé.** C'était l'attendu et c'est vérifié par exécution, pas par
raisonnement : 030 n'a touché ni un contrat, ni un token, ni un émetteur. Toute la
feature vit dans `extract/figma/projection-repair/`, `scripts/`, `evals/` et `docs/`.

Arbre de travail complet à la clôture — uniquement les fichiers de la feature :

```
 M docs/internal/component-repair-workflow.md
 M evals/results.json                              (sortie de la suite)
 M evals/run.ts                                    (+6 IDs)
 M extract/figma/projection-repair/apply-receipt.ts
 M extract/figma/projection-repair/apply.ts
 M extract/figma/projection-repair/campaign.ts
 M extract/figma/projection-repair/capture.ts
 M extract/figma/projection-repair/cli.ts
 M extract/figma/projection-repair/facts.ts
 M extract/figma/projection-repair/types.ts
 M extract/figma/projection-repair/verify.ts
 M package.json                                    (+2 scripts npm)
?? extract/figma/projection-repair/board-generator.ts
?? extract/figma/projection-repair/manifest-generator.ts
?? scripts/component-repair-drive.mjs
?? evals/fixtures/figma-projection-repair/*-check.ts   (6)
?? specs/030-outillage-vague-responsive/
 M .specify/feature.json                           (modifié AVANT le début de la feature)
```

## `npm run eval` — le N/N vivant

```
242/243 evals passed — evals/results.json
48 legacy cases quarantined (not run)
```

Six cas neufs enregistrés (237 → 243), **tous verts** :

| ID | Famille |
|---|---|
| `figma-projection-repair-manifest-generator` | C5-extraction |
| `figma-projection-repair-inherited-lock-preflight` | C2-refusal |
| `figma-projection-repair-shared-decision-root` | C2-refusal |
| `figma-projection-repair-capture-light-verdicts` | C1-determinism |
| `figma-projection-repair-driver-chain-resume` | C8-journey |
| `figma-projection-repair-board-structural-witness` | C2-refusal |

### L'unique rouge, STRICTEMENT inchangé

```
golden-generated-output — Error: Generated output diverges from golden manifest (25 file[s]):
src/components/Carte/Carte.module.css, src/components/Carte/Carte.stories.tsx,
src/components/Carte/Carte.tsx, src/components/GoogleReviews/GoogleReviews.stories.tsx,
src/components/GoogleReviews/GoogleReviews.tsx — if intentional, npm run golden:update in a reviewed change
```

C'est la dette golden 028 (`specs/028-figma-responsive-hero-video/proofs/runner-full-gates.md`),
**mot pour mot identique** à la baseline relevée en Phase 2 avant toute implémentation
(`proofs/phase-2-non-regression.md`). Même cas, même compte de 25 fichiers, mêmes noms.
Ni résorbée, ni aggravée : FR-012 tenu.

## Parité

`npm run parity` sort 0. Les acquittements sont ceux hérités de 029 — notamment les axes
`Presentation` de `CategoriesPrincipales` et de `HeroVideo`, en attente de promotion
contrat, et l'icône `close.svg` orpheline. **030 n'ajoute aucun acquittement** : la spec
est read-only côté canevas.

## Ce que ce sweep ne prouve pas

- **Aucune exécution vive.** Ni pont Figma, ni mutation de canevas, ni pose de planche.
  C'est l'Assumption 1 de la spec, et ça reste vrai à la clôture. Le pilote vif de la
  chaîne et la pose de la planche appartiennent à 031, où §X et §XI s'appliquent.
- **Le gain de 25 min/section n'est pas mesuré ici** — voir `SC-002-004-…` §« ce que ce
  chrono n'est pas ». Ce sweep prouve que l'outillage existe, refuse par nom et ne casse
  rien ; il ne prouve pas ce que la vague coûtera.
- `parity/snapshots/figma-components.json` **n'a pas été rafraîchi** — la limite ouverte
  par 017 puis 029 reste ouverte. 030 ne pouvait pas la fermer sans lire le canevas vif.
