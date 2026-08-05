# Reçu de réparation nommée — DW-004 (`resolvedBy: "015"`)

**Date** : 2026-08-04 · **Diagnostic d'origine** : `dw-004-contract-geometry.json` (013→014, 2026-08-03) · **Réparation** : spec 015, T037-T043 (faq/reassurances, Phase 4) + T057 (footer, Phase 6).

## Ce que le diagnostic d'origine affirmait

`dw-004-contract-geometry.json` : `padding-left`/`padding-right` (89px), `padding-top` (128px), `gap` (48/32/16px) étaient écrits en LITTÉRAUX sur `ds.footer`, `ds.faq` et `ds.reassurances`, alors que `{space.89}`/`{space.128}`/`{space.48}`/`{space.32}`/`{space.16}` existaient déjà (mintés par 012) — une géométrie qui roule sur des littéraux plutôt que des tokens ne siège sur aucun axe du différentiel (doctrine « geometry-rides-tokens », CLAUDE.md).

## La réparation effective

**`ds.faq` et `ds.reassurances`** : convertis en Phase 4 (T042, Lot C) — `width`/`padding-left`/`padding-right`/`gap` référencent désormais `{space.89}`/`{space.48}` etc., vérifiés indépendamment (script `verify-lot.mjs`, 0 écart).

**`ds.footer`** : converti en Phase 6 (T057) — les 10 sites que corrections-013.json nommait (`root` : width/padding-top/padding-right/padding-bottom/padding-left/gap ; `Row` : width ; `col1`/`col5`/`rseauxSociaux` : gap) référencent désormais leurs tokens. Un défaut supplémentaire a été découvert et corrigé au même passage (hors du périmètre strict de DW-004, mais sur le même site) : `size.footer.root` portait la valeur content-box (1550px) plutôt que la boîte totale border-box (1728px) — voir le reçu `named-repair-DW-005.md` pour le détail, puisque c'est le MÊME token que DW-005 nomme.

## Preuve

`npm run parity` : 0 dérive nouvelle. Mesure organisme (`build-registre.mts --phase apres`) : `footer/footer-master-defaults` retombe exactement sur le chiffre `avant.json` d'origine (1,043999 %, delta 0) — la correction de valeur associée (DW-005) restaure la géométrie totale rendue à l'identique de ce qu'elle était avant que Phase 3 (border-box) ne révèle l'écart. Attribution consignée dans `specs/015-geometrie-gouvernee/proofs/registre/attributions.json`.

**`resolvedBy`**: `015` — `specs/014-mesure-juste-triage/proofs/registre/causes.json`, entrée DW-004.
