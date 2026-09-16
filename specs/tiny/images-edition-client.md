# TinySpec: ce qui arrive à une image que le client remplace lui-même

**Date**: 2026-09-16
**Status**: mesuré, deux correctifs posés et re-mesurés — non déployé
**Complexity**: small

## What

Suite de `images-optimisation.md`. Les images livrées sont optimisées par nous ;
celles que le rédacteur remplacera passent par la chaîne native d'Odoo. Il
fallait savoir, **à 100 % et emplacement par emplacement**, si cette chaîne
s'applique bien à nos blocs — l'owner se souvenait qu'on avait gardé le panneau
image natif à certains endroits et pas à d'autres.

Trois sources croisées : la doc officielle 19.0, le code d'Odoo 19 lu dans le
conteneur, et un remplacement réel sur chacun des douze emplacements, sauvegardé
puis lu en base.

## Authority and observed facts

### La chaîne native, telle qu'elle est (doc + code + mesure concordent)

- **La conversion est faite par le navigateur du rédacteur, pas par le serveur.**
  `html_builder/…/image_tool_option_plugin.js:62-95` force `image/webp` et un
  `resizeWidth`, `image_post_process_plugin.js` encode via `canvas.toDataURL`
  à la qualité **92** ; `/html_editor/modify_image` stocke les octets **tels
  quels** (`html_editor/controllers/main.py:449`, une copie). Le serveur ne sait
  pas produire de WebP : `odoo/tools/image.py:132-138`, liste blanche
  PNG/JPEG/GIF/ICO, tout autre format bascule en JPEG sans le dire.
- **Le filet serveur** `ir_attachment._postprocess_contents` (`:375-416`) ne
  concerne que `png,jpeg,bmp,tiff`, ne fait rien sous 1920 px, recompresse le
  JPEG à 80 mais **jamais un PNG**, et ignore WebP et SVG (`:394-396`). Prouvé
  par le test d'Odoo `base/tests/test_ir_attachment.py:173-176`.
- **La largeur suggérée est le maximum sur les points de rupture**, pas la
  largeur au desktop (`image_format_option.js:52-87`) — le même raisonnement
  que notre passe d'optimisation. Hors `.container`, c'est `largeur × 1,5`,
  plafonné à 1920. Mesuré : 276 → 414, 568 → 852, 463 → 695, 1312 → 1920.
- **Un WebP uploadé échappe à tout** : accepté (`html_editor/models/ir_attachment.py:16`),
  stocké intact — 2000 px conservés là où un JPEG tombe à 1920, et
  `image_width = 0` en base. Un repli JPEG **privé** est créé à côté.
- **Un WebP recalculé plus lourd que l'original est rejeté** — sauf si la
  largeur change (`image_post_process_plugin.js:245-254`). C'est ce qui
  explique les trois fonds pleine largeur ci-dessous.
- **Aucun `srcset`, aucun `<picture>`** dans `website`, `html_builder`,
  `html_editor` — grep exhaustif. Une image pour tous les écrans, comme nous.
- La doc 19.0 ne documente **ni la qualité, ni le redimensionnement, ni un
  moyen de désactiver la conversion** ; elle recommande < 200 Ko et ≤ 1500 px
  dans la doc **développeur** seulement (`developer/howtos/website_themes/media`).

### Nos douze emplacements, un remplacement réel chacun (JPEG 3000×2000 envoyé)

| Emplacement | natif ? | stocké après sauvegarde | verdict |
|---|---|---|---|
| carte réassurance | oui | WebP 414 px, 29 Ko | optimisé |
| carte catégorie (×2 styles) | oui | WebP 852 px, 73 Ko | optimisé |
| tuile réalisation | oui | WebP 852 px, 73 Ko | optimisé |
| photo SAV | oui | WebP 695 px, 52 Ko | optimisé |
| portrait équipe, repos **et** survol | non | WebP 414 px, 29 Ko | optimisé |
| fond hero, fond devis, fond SAV | mixte | JPEG 1920 px, 235 Ko | filet serveur (voulu par Odoo) |
| avatar d'avis | non | JPEG **1920 px** pour 40 affichés | **défaut** — corrigé ici |
| affiche de la vidéo | non | rien ne change | inopérant — **voulu** (owner, 2026-09-16) |
| image produit | non | aucun mécanisme | à trancher |

**Le drapeau `data-pqr-native-image` ne change rien à l'optimisation.** Nos douze
actions « Remplacer » passent par `openMediaDialog` (`media_plugin.js:224`), qui
exécute **tous** les `on_media_dialog_saved_handlers` — dont celui du WebP. Le
drapeau n'ajoute que le double-clic natif (recadrage, filtres) :
`odoo19_compat.js:146`.

**Les trois fonds pleine largeur restent en JPEG, et c'est correct.** À 1920
il n'y a aucune réduction, donc `isChanged` est faux, donc Odoo compare le WebP
q92 recalculé au JPEG q80 du filet — et garde le plus léger. Prouvé dans l'autre
sens : le même hero avec une image lisse sort en **WebP 38 Ko**.

### Deux défauts de NOTRE module, trouvés par ce test

1. **Un hero remplacé perdait `loading="eager"` et `fetchpriority="high"`.**
   Le dialogue média d'Odoo ne modifie pas la balise, il la **remplace**
   (`onSaveMediaDialog` → `node.replaceWith(element)`) ; tout attribut inconnu
   disparaît, puis `website/models/ir_qweb.py::_post_processing_att` pose
   `loading="lazy"` sur toute image sans consigne. Le correctif du 2026-09-09
   (commit `2b488d23`, ~400 ms de premier écran) était défait en silence par le
   rédacteur. Odoo n'offre aucun verrou d'attributs.
2. **L'avatar d'avis n'était pas redimensionné** : l'`<img>` de la pastille
   n'avait **aucune règle CSS** (seul son conteneur fait 40 px) ; Odoo mesure
   `getComputedStyle(img).width` → `0px` → `resizeWidth` absent → JPEG 1920.
   Sondé pastille visible : `hostWidth: 40px, imgWidth: 0px`. Rendre la
   pastille visible ne suffisait donc pas — c'est l'image qu'Odoo mesure.

## Changes

1. **`media_action.js` — `reconcileHeroBackground`** : remet
   `loading="eager"` et `fetchpriority="high"` après chaque dialogue. C'est la
   fonction qui repasse déjà sur l'image ; deux `setAttribute`. Le hero n'a pas
   le double-clic natif, notre bouton est le seul chemin : couverture 100 %.
2. **`media_action.js` — `ReplaceReviewAvatarAction.load`** : montre la
   pastille (`host.hidden = false`) avant d'ouvrir le dialogue ;
   `reconcileAvatar` re-dérive ensuite la visibilité (une annulation re-cache).
3. **`odoo-bridge.css` — zone `ODOO-039-AVATAR-AVIS-IMAGE`** :
   `.review-card__avatarPhoto img { display:block; width:100%; height:100%;
   object-fit:cover; border-radius:inherit }`. Règle de rendu qui manquait de
   toute façon (aucun avatar photo n'a jamais été publié), et qui rend l'image
   **mesurable** par Odoo. Registre : `odoo-media-dialog`, racine
   `ds.google-reviews` (le registre ne connaît que les sections ; la carte
   d'avis vit dans celle-là).
4. **Registre — `ODOO-038-HERO-IMAGE-EAGER`** : le commit du 2026-09-09 avait
   ajouté cette entrée au registre et un commentaire du même nom dans
   `components.xml`, **sans `BEGIN`/`END`** — et pour cause : le commentaire vit
   à l'intérieur de `ODOO-019-HERO-QWEB`, et le rapport refuse deux blocs qui
   se chevauchent (essayé : « imbriqué … dans ODOO-019-HERO-QWEB »). Une entrée
   sans bloc est refusée aussi. **`odoo:derivation:check` était donc rouge
   depuis le 2026-09-09**, personne ne l'ayant relancé. Résolution : le
   commentaire reste (renommé « note, pas un bloc »), l'entrée orpheline
   disparaît et sa référence de décision rejoint `ODOO-019-HERO-QWEB`, le bloc
   qui porte réellement l'`<img>`.
5. **`adaptation-registry.json`** : entrée `ODOO-039-AVATAR-AVIS-IMAGE`.

Pas de bump de version : aucun contrat, aucun gabarit de structure, aucun jeton
touché ; des assets statiques et une fonction d'action.

## Invariants

- Les douze verdicts du tableau restent ceux d'Odoo : on ne remplace pas son
  optimisation, on rend nos emplacements **mesurables** par elle.
- L'affiche de la vidéo reste non remplaçable — décision owner.
- Rien n'est poussé vers le dépôt client ni la production.

## Done when

- [x] Hero remplacé dans l'éditeur, sauvegardé : le HTML servi porte
      `loading="eager" fetchpriority="high"` sur la nouvelle image (mesuré,
      instance 037 après `-u piqueray_ds`).
- [x] Avatar remplacé, sauvegardé : `data-resize-width="60"`, stocké et servi
      **WebP 60×40, 2 512 octets** (contre JPEG 1920×1280, 235 Ko avant).
- [x] `odoo:derivation:check` vert (incluait la réparation du marqueur 038).
- [x] `odoo:module:check` 23/23, `odoo:typecheck` vert.
- [ ] Port vers le dépôt client avec les trois commits du 2026-09-11
      (`030e6c8`, `a3887ab`, `43046a6`) qui n'existent que là-bas.

## Pièges, payés

- **L'instance jetable 037 servait un gabarit périmé** : sans
  `odoo -u piqueray_ds`, le hero y sortait en `loading="lazy"` alors que la
  production, composée le matin même avec le même composeur, sert bien `eager`.
  Le composeur rend les vues **de la base**, pas les fichiers. Toujours `-u`
  avant de conclure quoi que ce soit sur un gabarit.
- **Les bundles JS/CSS sont mis en cache en base** : après une édition d'un
  asset monté en lecture seule, supprimer les `ir.attachment` en
  `/web/assets/%` puis redémarrer, sinon on teste l'ancien code.
- **Le harnais de mesure `run-part2` a échoué une fois sur « editor not
  ready »** juste après la régénération des 15 bundles — relancer, ce n'est pas
  le correctif.

## Ouvert

- **Image produit** : aucun mécanisme de remplacement. À décider si c'est
  voulu (produits e-commerce) ou un manque.
- **Une image remplacée perd `data-pqr-native-image="1"`** : après un premier
  remplacement, le double-clic natif (recadrage, filtres) n'est plus offert sur
  cette instance. Non corrigé, nommé.
- **Les originaux lourds restent en base** à chaque upload (le PNG de 2,7 Mo
  n'est plus servi mais stocké), et chaque upload crée une pièce jointe même à
  octets identiques. Aucun nettoyage n'existe.
