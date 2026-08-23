# TinySpec: Home Odoo — header transparent en overlay du Hero

**Date**: 2026-08-23
**Status**: implemented — qualification visuelle owner en attente
**Complexity**: small

## What

Sur la Home uniquement, utiliser le champ natif Odoo 19 `website.page.header_overlay`
pour placer le header au-dessus du Hero. Le header défile normalement avec la page :
aucun effet fixed/sticky n'est activé. La vue native `header_visibility_standard`
est elle aussi désactivée : dans Odoo 19, son interaction affixe le header après
environ 300 px malgré le nom « standard ».

Retirer le fond `noir-bleute` ajouté historiquement par le bridge Odoo pour rendre
le header lisible sur les anciens bancs sans Hero. Cette peinture n'existe ni dans
`ds.header`, ni dans le HTML/CSS généré, ni dans le composant Figma validé.

## Evidence and decision

- `contracts/header.contract.json` v2.1.0 : aucun token/littéral de background sur le root.
- `static/src/css/generated/components.pqr.css` : `.header` n'émet aucun background.
- `views/header.xml` : projection du contrat transparent, sans variante `fond`.
- `ODOO-022-FOND-SOMBRE` était une adaptation Odoo-only documentée par D11/T020 de
  la spec 022, pour la lisibilité et la mesure avant que l'overlay Hero soit en scope.
- La présente décision remplace D11/T020 : le Hero fournit désormais le plan visuel
  sous le header, donc conserver ce fond falsifierait le rendu contractuel.

## Changes

1. `pages/home.json` porte `"header_overlay": true`.
2. `compose_page.py` persiste ce champ natif sur `website.page`.
3. Le bridge retire toute peinture de fond du header.
4. Le marqueur restant devient `ODOO-022-HEADER-BRIDGE` : il ne porte plus que
   l'adaptation mécanique du lien-logo, enregistrée dans l'adaptation registry.
5. `views/header.xml` désactive `website.header_visibility_standard`; aucun des
   effets `fixed`, `disappears` ou `fade_out` n'est activé.

## Done when

- [x] Home rend `#wrapwrap.o_header_overlay`.
- [x] Aucun effet `o_header_standard`, `o_header_fixed`, `o_header_disappears`
  ou `o_header_fade_out` n'est rendu.
- [x] Zéro `background` manuel sur `.header[data-pqr-shell="header"]`.
- [x] Contrat et CSS générés inchangés.
- [ ] Assets Odoo rechargés sur l'instance jetable et validation visuelle owner.
