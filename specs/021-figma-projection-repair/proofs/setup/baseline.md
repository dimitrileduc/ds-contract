# Baseline constitutionnelle — 2026-08-09

## Contexte

- Worktree : `021-figma-projection-repair`
- Commit de départ : `1e26876a1ff21cbf846e823edca372af6516868a`
- Horodatage de clôture : `2026-08-09T18:36:14Z`
- État Git de départ : modification attendue de `.specify/feature.json` et artefacts de
  spécification `specs/021-figma-projection-repair/` non encore suivis ; aucun autre changement.

## Préparation F1

```bash
npm install
npx playwright install chromium
```

Résultat : succès. Les dépendances et Chromium utilisés par les gates sont ceux du worktree.
`npm install` a signalé trois vulnérabilités hautes dans l'arbre de dépendances ; aucune correction
automatique hors périmètre n'a été appliquée.

## Sweep exécuté

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Résultat : succès, code de sortie `0`.

- `build` a régénéré les sorties depuis les sources contractuelles.
- `parity` est vert ; les trois findings déjà reconnus dans `parity/baseline.json` demeurent nommés.
- `eval`, `plugin:check`, le round-trip déterministe, le contrôle browser-pur et les deux contrôles
  TypeScript sont verts. Le compte de cas reste celui imprimé par la sortie vivante du runner.
- `git diff --check` est vert après le sweep.

Ce receipt est un checkpoint de départ ; il ne constitue pas une acceptation de la campagne live.
