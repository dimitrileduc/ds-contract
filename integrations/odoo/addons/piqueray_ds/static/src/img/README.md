# `static/src/img/` — zone générée, vide par construction

Aucun contrat du périmètre 019 n'apporte d'image de build :

- les icônes gouvernées sont des SVG **inlinés** par `emitHtml` dans `components.pqr.css`
  et dans le QWeb — il n'y a pas de fichier à copier ;
- l'avatar d'un avis est un média **Odoo**, choisi à l'exécution par le rédacteur,
  jamais livré par l'addon.

Ce fichier est produit par `npm run odoo:assets`. Ne rien déposer ici à la main.
