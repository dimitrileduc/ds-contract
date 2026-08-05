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
