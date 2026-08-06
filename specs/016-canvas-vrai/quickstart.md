# Quickstart — 016 · Canvas vrai

## Préconditions (chaque fenêtre de travail canvas)

```bash
# Pont figma-console : Figma desktop ouvert sur d9FYAUcqdcNtsuaMgLefvJ, pont identifié
#   (outil MCP figma_get_status / figma_reconnect — port 9223)
# Toujours figma.loadAllPagesAsync() avant d'accéder à la page `Pages` (210:325).

# Receveur de captures (session — noter le nonce affiché au démarrage)
node extract/figma/page-parity/receiver.mjs .page-parity/<lot>/before 9227
curl -s localhost:9227/health          # doit répondre { "instrument": "page-parity", … }
```

## Étalonnage (une fois, à l'ouverture du chantier — rien ne commence s'il échoue)

```bash
# capturer 2× sans geste (bridge/capture.js par maquette), puis :
npm run pages:compare -- --before .page-parity/00-etalonnage/a \
                         --after  .page-parity/00-etalonnage/b \
                         --out    specs/016-canvas-vrai/proofs/00-etalonnage   # attendu : N/N identical
```

## US1 — variables (U1a)

```bash
# 1. exécuter figma-sync/01-tokens.js via figma_execute (upsert des 83 — script déjà généré)
# 2. ré-extraire les clichés : parity/extract-figma.plugin.js via figma_execute,
#    sauver le JSON → parity/snapshots/figma-components.json + figma-tokens.json
npm run parity                          # les 83 figma-tokens|behind tombent → retirer de parity/baseline.json
# 3. sentinelle : contracts/sentinelle-variables.md (geste → détection → annulation → stabilité ×2)
```

## US2 — un défaut de source (exemple DW-002)

```bash
# registre : specs/016-canvas-vrai/registre/defauts-source.json → diagnosticVif re-relevé, annonce écrite
# cycle : contracts/proof-cycle.md (checkpoint "016/L-DW002/…" → captures AVANT → geste → APRÈS → compare)
# promotion code-side dans le même lot :
#   tokens/primitives.tokens.json  size.carte.root 364 → 363.5
npm run build && npm run golden:update && npm run plugin:check   # re-pins dérivés
# clôture porte : causes.json resolvedBy → npm run measure:gate   # attendu figma-source: 0 (le compte vif fait foi)
```

## US3 — régénération + photos

```bash
# cliché frais post-US2 → npm run parity → la liste des cibles = les findings canvas actifs
# AVANT le premier lot : census photos (bridge/photos-census.js) — 9 porteurs confrontés au relevé
# par lot : proof-cycle complet ; scripts figma-sync/NN-*.js via figma_execute (chemin amend)
# APRÈS : census à nouveau → npx tsx specs/016-canvas-vrai/tools/photos-verify.mts → photos-report.json
# audit de liaison (U1b) : bridge/bindings-audit.js → proofs/bindings-audit.json (zéro manquant)
```

## Vérifier l'avant/après soi-même (demande owner du 2026-08-05)

Trois moyens, du plus autonome au plus détaillé.

**1. Dans Figma, sans aucun outil du dépôt.** `Fichier › Afficher l'historique des
versions`. Chaque lot a posé un point nommé `016/<lot>/avant` — on peut afficher
n'importe lequel, comparer, et restaurer. C'est du Figma natif.

**2. La page de revue visuelle** — les 9 maquettes en avant | après | pixels changés :

```bash
npx tsx specs/016-canvas-vrai/tools/revue-visuelle.mts \
  --avant .page-parity/00-REFERENCE-AVANT-CHANTIER \
  --apres .page-parity/<jeu-final> \
  --out   specs/016-canvas-vrai/proofs/REVUE-VISUELLE.html
```

Page **autonome** (images embarquées) : elle reste lisible sans le dépôt et sans les
PNG d'origine. Elle n'est PAS commitée (~12 Mo) — l'outil l'est, elle se regénère.

`.page-parity/00-REFERENCE-AVANT-CHANTIER/` = les 9 maquettes **avant tout changement
de dessin** (jeu d'étalonnage `d`, 45 Mo, hors git). C'est la référence de tout le
chantier : ne pas l'effacer avant la clôture.

**3. Les triptyques par lot** — `specs/016-canvas-vrai/proofs/<lot>/crops/`, commités,
générés par `pages:compare` là où il y a une différence.

## La sweep (chaque point de contrôle et la clôture — jamais deux sweeps en parallèle)

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
npm run measure:gate                    # figma-source: 0 à la clôture
npm run geometry:gate                   # reste pass / 0 invisible
npm run extract:figma:visual:summary    # Field / NavItem mesurés, causes vivantes
```

En worktree : `npm install` + `npx playwright install chromium` DANS le worktree avant la première sweep (F1).
