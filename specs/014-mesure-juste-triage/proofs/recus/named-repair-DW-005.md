# Reçu de réparation nommée — DW-005 (`resolvedBy: "015"`)

**Date** : 2026-08-04 · **Diagnostic d'origine** : `dw-005-contract-geometry.json` (013→014, 2026-08-03) · **Réparation** : spec 015, T039 (mint initial) + T057/T058 (Phase 6, correction).

## Ce que le diagnostic d'origine affirmait — et confirme rétrospectivement

`dw-005-contract-geometry.json` : « frame widths observed **(1550px, 1728px, 459px, 310px)** have NO token anywhere in the foundation ». **Ce diagnostic de 2026-08-03 nommait déjà 1728px comme fait Figma observé** — la largeur totale de la frame `ds.footer` (nœud 2120:4785), pas 1550px.

## Ce qui s'est passé entre-temps

Le mint initial (Phase 4, T039, 2026-08-04) a minté `size.footer.root` à partir du **littéral existant du contrat** (1550px) plutôt que de reconstruire depuis le relevé DW-005 lui-même — une conversion pure (littéral→token, FR-012) qui déplace fidèlement une valeur, sans la questionner. Cette valeur (1550px) était elle-même un calcul CONTENU (1728−89−89), correct sous l'ancien défaut content-box mais plus sous `box-sizing: border-box` (T013, Phase 3). Le résultat : le token portait 1550px, alors que DW-005 avait déjà, un jour plus tôt, mesuré et nommé 1728px comme le fait Figma réel.

## La réparation effective (Phase 6, T057/T058)

Re-vérifié en direct contre Figma (`figma_get_component_for_development`, lecture seule, FR-010) : le nœud `2120:4785` est un auto-layout Figma natif (`layoutMode VERTICAL`, padding 89/89/128/32) dont `absoluteBoundingBox.width` vaut **1728px** — confirmant exactement le relevé DW-005 d'origine. `size.footer.root` corrigé 1550px → 1728px dans `tokens/primitives.tokens.json`, `$description` mise à jour, description du contrat (`contracts/footer.contract.json`) corrigée en cohérence.

## Preuve

`npm run parity` : 0 dérive nouvelle. Mesure organisme : `footer/footer-master-defaults` retombe exactement sur le chiffre `avant.json` d'origine (1,043999 %, delta 0 bit-à-bit) — la géométrie totale rendue est restaurée à l'identique de son état d'avant Phase 3. Attribution consignée dans `specs/015-geometrie-gouvernee/proofs/registre/attributions.json`.

**Leçon** : un mint « from-dump » qui recopie fidèlement le littéral EXISTANT d'un contrat n'est pas automatiquement un mint depuis le VRAI fait Figma, si ce littéral était lui-même déjà faux (calcul content-box antérieur à border-box). Le diagnostic DW-005 avait la bonne réponse depuis le début ; le mint aurait dû la lire plutôt que relire le contrat.

**`resolvedBy`**: `015` — `specs/014-mesure-juste-triage/proofs/registre/causes.json`, entrée DW-005.
