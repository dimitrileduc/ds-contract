# TinySpec: HeroVideo — façade Piqueray sur la Home

**Date**: 2026-08-23
**Status**: done
**Complexity**: small

## What

Remplacer uniquement l'image du HeroVideo de la Home. L'ancienne villa ne
correspond pas au contenu owner ; la bonne image est la façade Piqueray visible
dans `Piqueray (Copy 2)` au nœud `2151:5552`.

## Authority and observed facts

- Cible : fichier `d9FYAUcqdcNtsuaMgLefvJ`, master `2151:5552`, usage Home
  `2170:6351`, paint `Background` `2439:4691`.
- Référence owner : fichier `0yKomVwnQ91eJLSSGwRVTB`, nœud `2151:5552`, image
  source `99d3c3ea3af7bc3202fb62fb1c67ce2d1530840c` (1920×1080).
- Avant : paint cible `dfaa8d2046343398e067aade577f177137d32cce`.
- Après transport Console MCP : paint cible
  `8eb8b969759a5802ffb70d883409664e1169ad32`, JPEG Q95 1920×1080,
  SHA-256 `f592e49de94455693d41154d07b4c84262124cfdd01b3d0058956d6ca751c760`.

Le JPEG Q95 est un transport du bitmap owner, sans recadrage ni retouche ; il
réduit seulement la taille de l'enveloppe envoyée au Desktop Bridge.

## Changes

1. Remplacer en place l'unique fill IMAGE du nœud `Background` du master ; ne
   modifier ni l'instance Page ni les autres enfants du composant.
2. Fournir les mêmes pixels à la comparaison HTML via une fixture dédiée et
   `backgroundUrl`, sans changer le défaut du contrat.
3. Ajouter l'asset Odoo `hero_video_facade.png` et pointer uniquement
   `images.hero-video-poster` de la Home vers `hero_video_facade`.

## Invariants

- `ds.hero-video@1.0.0`, les props, le HTML/QWeb et la CSS restent inchangés.
- Master id/key, dimensions 1728×720, textes, CTA, scrims, enfants, instance
  links et overrides restent inchangés.
- L'ancien asset `hero_video.png` est conservé ; aucune suppression collatérale.

## Done when

- [x] Master et usage Home Figma affichent la façade Piqueray.
- [x] Un seul paint IMAGE `FILL` subsiste sur `Background`.
- [x] La parité Figma → HTML HeroVideo reste sous 2 % (0,1849 % brut).
- [x] Les portes Odoo ciblées sont vertes et la Home compose le nouvel asset.
- [x] Le diff final ne contient aucun changement fonctionnel hors média.

## Evidence

- Figma → HTML : version `2390886522869717227`, écart brut `0,1849 %`,
  écart masqué `0,0834 %`.
- Odoo : `inputs:check`, `authoring:check`, `module:check`, `assets --check`,
  `derivation:check` et `odoo:typecheck` verts.
- Home isolée `piqueray-odoo-main-home` : image `/web/image/320`, 1920×1080,
  affichée dans un Hero 1728×720 ; SHA-256 identique à l'asset authoring
  `9491b168016110b13cc736db19d225e837283f9d8ca598a32378433e770e7ee9`.
