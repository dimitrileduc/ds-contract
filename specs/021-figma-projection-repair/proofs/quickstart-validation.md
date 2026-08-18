# Validation du quickstart 021

Date : 2026-08-10. Worktree : `soapy-duckling`.

Le parcours de `quickstart.md` a été exécuté dans son ordre gouverné pendant la campagne. Les
étapes live ont utilisé le writer unique Desktop Bridge connecté (`figma_execute`) : ce writer est
un transport MCP de la session agent, pas un processus enfant du CLI Node. Elles ne sont pas
rejouées après l'état terminal `owner-accepted`, car ce serait une nouvelle mutation sans objet.

## 1. Prérequis et gates de départ

Commandes :

```bash
npm install
npx playwright install chromium
npm run build
npm run parity
npm run eval
npm run plugin:check
```

Résultat : Node `v24.14.0`, npm `11.9.0`, `node_modules` local présent et Chromium Playwright
`1228` résolu depuis le cache utilisateur. Le build, parity, les evals et le plugin sont verts. Le
rejeu final détaillé est archivé dans `proofs/final-gates.md`.

## 2. Préflight

Commande exécutée :

```bash
npm run projection:repair -- \
  --campaign specs/021-figma-projection-repair/campaign/campaign.json \
  --preflight
```

Résultat : fichier `d9FYAUcqdcNtsuaMgLefvJ`, pin initial `2385747041460798575`, 7/7 cibles,
24 surfaces et inventaire partagé complet. Le cas adverse de pin erroné a refusé avant mutation;
voir `proofs/foundation/preflight-pin-drift.txt`.

## 3. Capture avant

Commande exécutée :

```bash
npm run projection:repair -- \
  --campaign specs/021-figma-projection-repair/campaign/campaign.json \
  --capture-before
```

Résultat : capture `021-before-2385747041460798575`, 72 artefacts valides sur 24 surfaces,
69 empreintes IMAGE, 155 liens/overrides, état `ready-to-apply`. Le reçu se trouve dans
`proofs/before/receipt.md`. Les captures vides, dimensions fausses et états incomplets sont refusés
par `figma-projection-repair-campaign-gates`.

## 4. Correctifs partagés headless

Commandes exécutées :

```bash
npm run eval
node scripts/plugin-engine-check.mjs
node scripts/core-browser-check.mjs
```

Résultat : les pins `absolute-lowering`, `composed-parent-prop-forwarding`,
`icon-instance-swap-visible`, `shared-consumer-impact`, `reconstruction-idempotence` et
`repair-receipt-gates` sont verts. Le plugin et le bundle browser passent aussi.

## 5. Dry-run

Commande exécutée sur l'état `ready-to-apply` :

```bash
npm run projection:repair -- \
  --campaign specs/021-figma-projection-repair/campaign/campaign.json \
  --dry-run
```

Résultat : 10 opérations US1 bornées, aucun writer invoqué, uniquement Hero/SAV, Catégories et
Réalisations; voir `proofs/us1/dry-run.json`. Les opérations US2 ont ensuite été vérifiées depuis
les scripts régénérés et sérialisées par le même writer.

## 6. Application live unique

Équivalent live de l'action `--apply` : appel de `applyCampaign(plan, writer)` avec le writer
Desktop Bridge connecté, puis exécution sérialisée des scripts générés et des deux réparations
directes. Le CLI Node garde l'action dans son interface mais refuse honnêtement en l'absence de cet
adaptateur MCP; aucune autorité REST de mutation n'est fabriquée.

Résultat : Hero `2111:3382`, SAV `2108:3105`, Button `6:122`, CarouselControls `2077:2191`,
Coordonnées `2104:2904`, Formulaire `2096:2564` et les deux gestes directs ont été appliqués avec
pré/postconditions. Reçus : `proofs/us1/apply-receipt.json` et `proofs/us2/apply-receipt.json`.

## 7. Capture et vérification après

Commandes exécutées :

```bash
npm run projection:repair -- \
  --campaign specs/021-figma-projection-repair/campaign/campaign.json \
  --capture-after
npm run projection:repair -- \
  --campaign specs/021-figma-projection-repair/campaign/campaign.json \
  --verify
```

Résultat : 72/72 artefacts, 7/7 cibles, zéro diff inattendu, 0 consommateur ouvert. Les 36 hashes
IMAGE uniques sont préservés; le passage de 69 à 60 lignes d'empreinte correspond au rehosting
autorisé des images générées. Les liens passent de 155 à 231 par ajout attendu des instances
d'icônes et des instances exposées. Détail : `proofs/us4/comparison.json`.

## 8. Idempotence

Le même lot live a été rejoué deux fois par le writer Desktop Bridge, puis :

```bash
npm run projection:repair -- \
  --campaign specs/021-figma-projection-repair/campaign/campaign.json \
  --capture-idempotence
npm run projection:repair -- \
  --campaign specs/021-figma-projection-repair/campaign/campaign.json \
  --verify-idempotence
```

Résultat : 12/12 opérations live `no-op` sur deux runs, 72 artefacts, 60 empreintes et 231 liens
strictement identiques; hash du reçu
`efa768604370a3d253cf1af879b4eb3b835ab30b47382c6d7e9f8c92b06b0223`.

## 9. Gate owner et finalisation

Commande exécutée après sept décisions explicites :

```bash
npm run projection:repair -- \
  --campaign specs/021-figma-projection-repair/campaign/campaign.json \
  --finalize
```

Résultat : exactement 7 reçus conformes, 7 `accepted`, 0 `refused`, état terminal
`owner-accepted`; voir `proofs/closure.md`.

## 10. Sweep de clôture

La commande composée exacte du quickstart a terminé avec le code 0. Ses résultats vivants sont
consignés dans `proofs/final-gates.md`.
