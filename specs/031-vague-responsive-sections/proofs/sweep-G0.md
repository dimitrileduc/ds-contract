# Sweep de qualité — G0 (kick-off de la vague 031)

**Date** : 2026-08-27 · **Worktree** : `just-euphonium`
(`/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/just-euphonium`)
**Tâche** : T006 · **Worktree Gates F1** : `npm install` + `npx playwright install chromium`
exécutés dans le worktree avant le sweep (T001).

## Résultat par commande

| # | Commande | Sortie | Verdict |
|---|---|---|---|
| 1 | `npm run build` | tokens → schema → generate → odoo:assets → odoo:figma-links → odoo:derivation | **EXIT 0** ✅ |
| 2 | `npm run parity` | trois axes verts, acquittements existants tenus | **EXIT 0** ✅ |
| 3 | `npm run eval` | **242/243** · 48 cas legacy en quarantaine (non exécutés) | **EXIT 1** — voir ci-dessous |
| 4 | `npm run plugin:check` | bundle frais (668158 o, 110 entrées, hash `70b1c10cbca5…`), generate/update-report/apply/propose/pr-dry-run verts, 3 flux SKIPPED nommés | **EXIT 0** ✅ |
| 5 | `npx tsx scripts/deterministic-roundtrip.mjs` | `ds.google-reviews@2.0.0` byte-identique ×2 (empreinte 6397 o), 5 instances imbriquées | **EXIT 0** ✅ |
| 6 | `node scripts/core-browser-check.mjs` | barrel navigateur 11.96 MB brut / 5.27 MB minifié, 4 émetteurs en VM sans globals node | **EXIT 0** ✅ |
| 7 | `npx tsc --noEmit` | — | **EXIT 0** ✅ |
| 8 | `npx tsc -p tsconfig.build.json` | — | **EXIT 0** ✅ |

`npm run eval` imprime **242/243** ; ce `N/N` vivant est la seule autorité (aucun
chiffre n'est réécrit en dur ailleurs qu'ici, daté).

## L'unique rouge, et la preuve qu'il est STRICTEMENT inchangé

```
✖ C1-determinism  golden-generated-output
    Error: Generated output diverges from golden manifest (25 file[s]):
    src/components/Carte/Carte.module.css, src/components/Carte/Carte.stories.tsx,
    src/components/Carte/Carte.tsx, src/components/GoogleReviews/GoogleReviews.stories.tsx,
    src/components/GoogleReviews/GoogleReviews.tsx — if intentional, npm run golden:update in a reviewed change
```

Comparé **mot pour mot** à la trace de clôture de 030
(`specs/030-outillage-vague-responsive/proofs/sweep-final.md`, §« L'unique rouge,
STRICTEMENT inchangé ») : **même cas, même compte de 25 fichiers, mêmes cinq noms
cités, même phrase de remède**. C'est la dette golden 028
(`specs/028-figma-responsive-hero-video/proofs/runner-full-gates.md`), héritée et
conservée : **ni résorbée, ni aggravée**.

Aucun `npm run golden:update` n'est lancé par 031 — la résorber serait une
modification de sortie générée, donc une violation de SC-008 (surface de re-pin
attendue : zéro).

## Verdict du sweep G0

**Vert au sens de la constitution §Quality Gates** : les 7 autres commandes
sortent en 0, et le seul rouge est le rouge toléré, prouvé identique.

## Trace brute

Sortie complète capturée à l'exécution (fichier de travail, non commité) :
`…/scratchpad/sweep-G0.raw` — 8 blocs `##########` avec leur `EXIT=` respectif et
le marqueur final `SWEEP-DONE`.
