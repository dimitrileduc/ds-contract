# Reçu de clôture — HeroVideo Odoo

**Date** : 2026-08-23
**Décision** : feature prête à livrer.

## Validation métier Odoo

Le propriétaire du projet confirme avoir réalisé la recette côté Odoo sur l'instance jetable : présence et dépôt du snippet, édition du titre et du CTA, remplacement du poster, sauvegarde/réouverture, gouvernance des parts, duplication et réordonnancement. Cette confirmation ferme SC-002 et SC-003.

Le scénario automatisé `hero-video-visual.mts` reste disponible et rejouable. Pour cette livraison, la recette owner et les captures archivées constituent la preuve Odoo retenue ; aucune exécution sur `piqueray-odoo-test:8071` n'a été faite par cette session.

## Fidélité Figma automatisée

Commande : `npm run extract:figma:visual -- hero-video`

- Master : `2151:5552`, fichier Piqueray
- Boîte comparée : `3456×1440` à 2×
- Écart brut : **0.4875 %**
- Diagnostic masqué : **0.3959 %**
- Seuil : **2.0 %**
- Verdict : **PASS**

La fixture source existait déjà sous l'id `carte-image-dfaa8d204634`, avec le même `imageRef` Figma que le poster HeroVideo ; aucun binaire dupliqué n'a été ajouté. Le premier essai à 7.00 % a révélé un défaut du harness : viewport 1600 px pour une racine 1728 px. Le viewport est maintenant 1800 px, supprimant la coupe silencieuse des 128 derniers pixels.

## Portes finales

- `npm run build` — PASS
- `npm run parity` — PASS, aucun nouveau drift
- `npm run eval` — PASS, **220/220**
- `npm run plugin:check` — PASS
- `npx tsx scripts/deterministic-roundtrip.mjs` — PASS
- `node scripts/core-browser-check.mjs` — PASS
- `npx tsc --noEmit` — PASS
- `npx tsc -p tsconfig.build.json` — PASS
- Portes Odoo module, authoring, assets, derivation et typecheck — PASS

## Re-pins acceptés

- `inputs.lock.json` : ajout gouverné de `ds.hero-video` à la fermeture Odoo.
- `evals/golden.json` : une entrée HeroVideo mise à jour après correction du traitement des éléments remplacés `video` dans les émetteurs HTML et React.
- `playground/public/engine.receipt.json` : reçu moteur rafraîchi après revue de ce même correctif émetteur ; `plugin:check` confirme la fraîcheur du bundle.

## Ancien blocage réparé

L'adaptation de layout de page est désormais déclarée `ODOO-024-PAGE-LAYOUT`, associée aux sections concernées et classée comme mécanisme `odoo-bridge`. La dérivation Odoo et l'eval correspondante sont vertes.
