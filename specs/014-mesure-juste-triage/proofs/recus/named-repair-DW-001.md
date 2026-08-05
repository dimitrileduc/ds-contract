# Reçu de réparation nommée — DW-001 (`resolvedBy: "015"`)

**Date** : 2026-08-04 · **Diagnostic d'origine** : `dw-001-contract-geometry.json` (013→014, 2026-08-03) · **Réparation** : spec 015, T048/T048b.

## Ce que le diagnostic d'origine affirmait

`dw-001-contract-geometry.json` : « le root [de `ds.piqueray-logo`] n'a pas de largeur qui puisse varier selon le contexte consommateur (footer vs header), donc UNE instance partagée ne peut pas être les deux tailles ». Cette phrase **suppose que header a besoin d'une taille différente**, sans jamais la mesurer — la source citée (`org-footer-geometry.json`) mesure footer, pas header.

## Ce que la vérification préalable de 015 (T048) a établi

Relevé from-dump, header en lecture Figma directe (`figma_get_component_for_development`, sans Desktop Bridge, FR-010 lecture seule) et footer via le dump commité de Phase 2 :

| Usage | Nœud | Taille mesurée |
|---|---|---|
| `ds.header`, Couleur=Default | `84:256` | **180×34 exact** |
| `ds.header`, Couleur=Blanc | `84:287` | **180×34 exact** |
| `ds.footer` | `2120:4783` | 180,0985565185547×34 (bruit d'export, même précision flottante que les enfants `vectorAsset` du maître) |

**Il n'existe pas deux tailles.** Le diagnostic d'origine était juste sur le SYMPTÔME (un littéral de géométrie non gouverné sur une racine partagée — `contract-geometry`, correctement classé) mais faux sur sa CAUSE PROFONDE supposée (deux consommateurs à tailles distinctes) : header et footer utilisent, à la précision de mesure près, la même taille — celle du maître. Relevé complet : `specs/015-geometrie-gouvernee/proofs/recus/logo-tailles-relevees.md`.

## La réparation effective

Conversion pure littéral→token, comme les 196 de Phase 4 (015) — aucune capacité nouvelle, aucune prop ajoutée :

- `tokens/primitives.tokens.json` : `size.logo.width` = `180px`, `size.logo.height` = `34px`, mintés from-dump.
- `contracts/piqueray-logo.contract.json` : `literals: {width: "180px", height: "34px"}` → `tokens: {width: "{size.logo.width}", height: "{size.logo.height}"}`. Version contrat inchangée (0.1.0) — une conversion pure ne bouge pas le semver, elle ne change ni l'API ni le rendu.
- `contracts/header.contract.json` et `contracts/footer.contract.json` : **aucune modification** — ils composent déjà `ds.piqueray-logo` sans passer de taille, et n'ont besoin de rien passer puisqu'il n'y a qu'une taille.

## Preuve des deux rendus

`npm run build` régénère `PiquerayLogo.module.css` : `width: var(--size-logo-width); height: var(--size-logo-height);` — la même feuille CSS Modules sert `ds.header` ET `ds.footer` (composition d'instance, pas de duplication), donc les deux rendus partagent mécaniquement la même géométrie gouvernée. `npm run parity` confirme 0 dérive nouvelle (les 2 tokens mintés portent le même acquittement `figma-tokens|behind` que les 83 tokens de Phase 4 — Figma n'a pas encore la variable, 015 est lecture seule, FR-010).

## Ce qui est explicitement écarté

L'infrastructure « deux tailles gouvernées » que D4 (research.md) avait conçue — prop enum `taille`, lift moteur `vectorAsset`-en-pourcentages, binding Figma `NONE` — n'est **pas construite** : elle aurait résolu un problème qui n'existe pas. Si un jour le master Figma introduit une vraie deuxième taille (016 ou plus tard), cette conception reste valide et peut être reprise telle quelle — mais rien n'est deviné aujourd'hui pour un besoin non observé.

**`resolvedBy`**: `015` — `specs/014-mesure-juste-triage/proofs/registre/causes.json`, entrée DW-001.
