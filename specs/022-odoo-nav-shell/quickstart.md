# Quickstart — 022 Barre de navigation Piqueray dans Odoo (le shell)

## 0. Worktree autosuffisant (constitution F1 — AVANT tout)

```bash
cd /Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/nav
npm install
npx playwright install chromium
```

## 1. Le sweep constitutionnel (à chaque checkpoint, DANS le worktree)

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

`npm run eval` imprime le seul compte qui fait foi. Deux sweeps en parallèle = faux rouges
(`evals/.scratch` partagé — mémoire de projet).

## 2. Phase amont — remise à niveau gouvernée (ordre imposé — schéma et émetteurs INTOUCHÉS)

```bash
# 1. CANVAS D'ABORD (§VIII : nettoyer la source avant de contracter — delta §0) :
#    répétition sur CLONE → capture §X (set + 9 usages, non vides/dimensionnées)
#    + saveVersionHistoryAsync("022 — avant retrait Fond=Solid")
#    → suppression du master Fond=Solid → re-vérif des 9 instances par POSITION → captures après
#    Reçus : proofs/canvas/{repetition-clone.json, avant/, geste-solid.json}
# 2. Refresh LECTURE SEULE de parity/snapshots/figma-components.json (notre geste a changé le fichier)
# 3. Contrats : delta header 2.0.0 (contracts/header-2.0.0.delta.md §1, rien d'autre)
#              + adoption piqueray-logo 1.0.0 (contracts/piqueray-logo-adoption.md)
# 3bis. AJOUT DATÉ 2026-08-22 — ce runbook s'arrêtait à 2.0.0 et ne rejouait donc PAS
#       l'état livré. Un SECOND geste canvas §X a suivi (master Fond=Transparent :
#       FIXED → FILL, stroke 1px du set retiré, 10 usages laissés à 1728, version
#       nommée « 022 — header master FILL 1728 »), puis le bump MINOR header 2.1.0
#       (root width fill + referenceWidth 1728 + jeton size.header.root lâché).
#       Ce geste-là n'a PAS rafraîchi parity/snapshots (clôture n°15). Détail : n°4.
npm run build
node scripts/update-golden.mjs          # re-pin golden (jamais à la main)
npm run plugin:check                    # re-pin engine.receipt
npm run catalog                         # HORS build — piège nommé
# (aucune édition d'émetteur → PAS de re-pin examples/polaris)
# puis le sweep complet (§1)
```

Sortie attendue : la vitrine `emit-html` (unique variante) montre marque orange + wordmark
blanc, 4 libellés exacts, CTA blanc + flèche, icônes blanches 24px, aucun fond.

## 3. Instance de qualification (Docker, images épinglées)

```bash
cp integrations/odoo/qa/.env.example integrations/odoo/qa/.env
docker compose -f integrations/odoo/qa/compose.yaml --env-file integrations/odoo/qa/.env up -d
```

## 4. Spikes mécanisme (OBLIGATOIRES avant le QWeb — reçus dans proofs/)

```bash
# S1  : zone header 19 (templates, activation, ancrage xpath) → proofs/spike-header.json
# S1b : calcul natif de l'actif (serveur/JS, cas parent d'enfant actif) → proofs/spike-actif.json
# S2  : semis « une fois » (install frais + update site existant, retrait défauts,
#       survie du menu client) → proofs/spike-seed.json
docker exec <conteneur-odoo> sh -c 'grep -rn "template_header" /usr/lib/python3/dist-packages/odoo/addons/website/views/ | head'
```

Un constat qui contredit la spec (p. ex. l'actif du parent) fait corriger la spec AVANT le
gabarit — jamais l'inverse.

## 5. Projection (après spikes verts)

```bash
# SHELL_CONTRACT_IDS + adaptations scripts/odoo (D12) ; repin du lock :
npm run odoo:inputs:check               # rouge attendu avant repin — puis repin explicite
npm run odoo:assets && npm run odoo:assets -- --check
# header.authoring.json (D13, mécanisme native-menu) :
npm run odoo:authoring:check
# views/header.xml + semis + odoo-bridge.css (marqueurs ODOO-022-*) :
npm run odoo:module:check && npm run odoo:derivation:check && npm run odoo:typecheck
```

## 6. Preuves

```bash
npx tsx integrations/odoo/qa/visual/selftest.mts --strict
npx tsx integrations/odoo/qa/visual/render-html.mts --subjects …/subjects/header.mts --measure   # imprime le clip
# puis capture + comparaison (même harnais que les sections en ligne) → SC-001
# scénarios : header-menu.spec.mts (SC-002/003), header-nav.spec.mts (SC-004/005),
#             header-regen.spec.mts (SC-006 : régénération complète → apparence du contrat 2.0.0, menu intact)
```

## 7. Rouges pré-existants (NE PAS re-diagnostiquer — mémoire de projet)

`odoo:qualification` (reçu 019 incohérent) et `editability-boundary` 43/44 (champ périmé depuis
`cc6cd0d4`) sont rouges AVANT 022. Politique : ne pas aggraver ; scénarios 022 = `scenarioId`
distincts ; leur remise en cohérence, si la qualification finale l'exige, est une tâche nommée.

## 8. Garde-fous permanents

- Figma : **UN seul geste d'écriture** (retrait du master Solid — §X ACTIF : répétition sur
  clone, capture complète avant, version nommée ; §XI N/A, mono-agent) ; lecture pour tout le reste.
- `static/src/css/generated/**` : jamais à la main (`tampered`).
- Le menu après semis : propriété du client — aucun chemin de code ne le réécrit.
- Géométrie/couleur : jetons (`var(--pqr-…)`), jamais de littéral dans le bridge.
