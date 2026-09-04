# Verdicts de contraste — les 23 points « à trancher » d'axe

Un point `incomplete` n'est PAS un succès : axe déclare qu'il n'a pas su décider.
Chacun porte ici un verdict. Trois familles.

## A — Texte sur image ou vidéo (12 points) — CONFORME, avec une réserve nommée

Mesure : le texte visé est rendu transparent, la page est photographiée, et la
luminance du fond est échantillonnée sous la boîte du texte. Le ratio retenu est le
PIRE cas (95ᵉ centile de luminance du fond, le plus défavorable à du texte blanc).

| Élément | Pire ratio | Verdict |
|---|---|---|
| hero-video / titre h1 | 10.05 | conforme AA |
| carte-categorie / titres h3 (×4) | 11.98 – 13.94 | conforme AA |
| devis / titre h2 | 6.52 | conforme AA |
| hero-video / CTA, devis / CTA, header / nav (×4) | — | conforme, vérifié à l'image |

Les six derniers sont du texte blanc sur voile sombre ou sur porte sombre : la sonde
automatique les a d'abord classés en échec, à tort. Elle lisait la couleur d'un ancêtre
et incluait le liseré blanc du bouton dans l'échantillon de fond. Captures à l'appui,
ils sont franchement lisibles. **Faux positif de la sonde, pas défaut de la page.**

**Réserve, et elle est réelle.** La section devis n'a AUCUN voile : le texte blanc
repose directement sur la photo. La conformité dépend donc de la photo choisie par le
rédacteur. Aucune porte ne garde ce point. Un remplacement par une image claire rendrait
le titre illisible sans que rien ne le signale.

## B — Lettres du logotype Google (6 points) — SANS OBJET

Les six nœuds `text[x=…]` sont les lettres du mot-symbole Google, dans un SVG porté par
un `<span aria-hidden="true">`. WCAG 1.4.3 exclut explicitement les logotypes, et le
contenu est déjà retiré aux technologies d'assistance.

## C — Initiale d'avatar des avis (5 points) — NON CONFORME au sens strict, décoratif

Blanc `#ffffff` sur `#9ba4b5`, ratio **2.50**, en dessous des 4.5 exigés. L'initiale
« P » double le nom « p. syster » affiché immédiatement à côté : elle n'apporte aucune
information. **Non corrigé ici** : assombrir le fond de l'avatar est une décision de
design (changement de jeton, écart visuel), et cette vague s'interdit tout écart de
pixel. Deux voies possibles, à trancher par le propriétaire :
1. assombrir le fond de l'avatar jusqu'à 4.5:1 ;
2. marquer l'initiale `aria-hidden` et la déclarer décorative.
