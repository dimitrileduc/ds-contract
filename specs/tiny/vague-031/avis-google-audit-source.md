# Audit de source — set `AvisGoogle` (2700:28391), avant le round section

**Date** : 2026-09-03. **Méthode** : relevé du canevas vif, 4 variantes, tous niveaux.
**But** : sortir TOUS les gestes Figma nécessaires MAINTENANT, pour n'avoir aucun aller-retour
pendant l'écriture du contrat et la projection Odoo.

## Ce qui est propre

- **Zéro géométrie brute, zéro taille de texte brute** (nettoyage du matin, 279 rattachements).
- Les cartes sont de vraies **instances** de `ReviewCard` dans les 4 vues — rien à réparer de ce côté.
- La gouttière suit la convention des autres sections : 24 / 48 / 56 / 89.
- Le `SectionHeader` est dessiné à plat, comme SAV et Réassurances : conforme à la décision
  de décrire l'en-tête dans la section.

## A — Défauts de source à corriger (gestes Figma)

| # | Fait relevé | Vues | Geste |
|---|---|---|---|
| A1 | Un **second cadre `infos` fantôme**, masqué, 23×20, à côté du vrai | Mobile, Tablette | supprimer |
| A2 | **Double espace** dans le titre : « par année␣␣et autant » | Desktop seul | supprimer une espace |
| A3 | `cartes` est un **wrapper inutile** : un seul enfant, écart 0, aucune fonction | les 4 | aplatir (supprimer le niveau) |
| A4 | Le **set n'expose aucune propriété de composant** hors l'axe `Presentation` | les 4 | poser 5 TEXT + 1 BOOLEAN |
| A5 | `SectionHeader` est en largeur **FIXE** et plus étroit que son parent : 1086,6 pour 1088 (Desktop), 1548 pour 1550 (Wide) | Desktop, Wide | passer en FILL |
| A6 | `Avis Google` porte des marges bizarres : `[4, 11, 8, 11]` en Desktop, `[4, 0, 8, 0]` en Wide | Desktop, Wide | à trancher (voir C2) |

## B — Faits relevés, NON défauts, à porter tels quels

| Fait | Mobile | Tablette | Desktop | Wide |
|---|---|---|---|---|
| Écart racine (en-tête ↔ avis) | 32 | 32 | **15** | 40 |
| Mécanique de grille | rangée + retour à la ligne | colonne | grille | grille |
| Écart entre cartes | 16 / 16 | 16 | 8 | 8 |
| Nombre de cartes dessinées | **3** | 5 | 5 | 5 |
| Cartes en hauteur | au contenu | au contenu | **égalisées** | **égalisées** |
| Troncature du témoignage | non | non | **3 lignes** | **3 lignes** |
| Logo Google sur la carte | visible | visible | masqué | masqué |
| Bloc résumé : sens de lecture | colonne | rangée | rangée | rangée |

## C — Décisions owner (rien fait sans réponse)

**C1 — Le bloc résumé ne dit pas la même chose selon l'écran.**
· Mobile / Tablette : pas de qualificatif, pas de séparateur ; le volume s'écrit
  « 4,8 sur 5 · 93 avis vérifiés » ; le bouton dit **« Voir tous les avis »**.
· Desktop / Wide : « Excellent │ 4.8 │ 93 avis » ; le bouton dit **« Écrire un avis »**.
Ce n'est pas une mise en forme différente, c'est **un contenu et une action différents**.
Un bloc Odoo est un DOM unique : il faut choisir une version, ou tout rendre et masquer par écran.

**C2 — Trois valeurs qui sentent l'ajustement manuel** : l'écart racine à 15 en Desktop (32 et 40
ailleurs), et les marges `[4, 11, 8, 11]` / `[4, 0, 8, 0]` du bloc `Avis Google`.
Les porter telles quelles (fidèle, mais fige une bizarrerie) ou les régulariser (change le rendu).

**C3 — Mobile ne dessine que 3 avis, les autres 5.** Contenu ou intention ?
Si c'est voulu, la page Odoo devra masquer les avis 4 et 5 sous 768 px.

**C4 — Trois mécaniques de grille pour deux résultats** : Mobile empile par retour à la ligne,
Tablette par colonne. Le résultat est le même (un avis par ligne). Uniformiser en Figma
(un seul mécanisme) ou laisser et l'écrire une fois en CSS.

**C5 — La prop `montrerControles` du contrat n'a plus d'objet** : les flèches ont été supprimées
ce matin sur ta décision. Elle disparaît du contrat au prochain bump (majeur).

## C bis — Réponses owner (2026-09-03)

- **C1 (contenu différent selon l'écran)** : « pas très important ». Traitement retenu, celui du
  mode d'emploi : **tout rendre dans le DOM, masquer par écran**. La copie de référence est celle
  du Desktop (la plus riche : qualificatif + note + séparateur + volume).
- **EXIGENCE NOUVELLE, la plus importante du round** : **la note globale (4.8, 4.6 …) et le nombre
  d'avis doivent être RÉGLABLES par le rédacteur dans Odoo.** Ce sont donc deux contrôles
  `controlled` dans la config d'édition, pas des textes figés par la composition. À vérifier
  explicitement au test d'édition (§10 du mode d'emploi) : modifier, enregistrer, rouvrir.
- **C2 (valeurs bizarres)** : non tranché → **portées telles quelles**, fidèles à la source.
  Les régulariser changerait le rendu ; ce n'est pas un nettoyage, c'est une décision de dessin.
- **C3, C4** : non tranchés → portés tels quels, écrits une fois en CSS.
- **C5** : `montrerControles` disparaît du contrat (les flèches ont été supprimées).

## D — Conséquences déjà connues pour le contrat et Odoo

- L'en-tête est décrit DANS la section (dette `E-031-044` déjà inscrite).
- La troncature à 3 lignes et le masquage du logo sont des **faits code-only** : une part instance
  ne porte aucun canal par mode. Ils vivront dans la feuille CSS de la section, nommés.
- Les cinq jetons du bloc résumé sont **déjà** dans `tokens/` (promus ce matin).
- L'égalisation des hauteurs en Desktop/Wide explique l'écart de −24 px mesuré sur la carte :
  elle se ferme quand la grille est portée.

---

## Round section — journal des correctifs (2026-09-03, soir)

**Les quatre hauteurs sont exactes** : 1709 / 1348 / 459 / 479, identiques à la planche.
Écarts : **1,99 % · 1,20 % · 1,33 % · 1,76 %** (contre 4,71 / 3,00 / 1,78 / 2,36 au premier jet).

### Ce que l'owner a vu et qui était réel

| Ce qu'il a signalé | Cause trouvée | Correctif |
|---|---|---|
| titre et sur-titre mal alignés | l'en-tête est à GAUCHE sous 992 px, CENTRÉ au-delà ; le gabarit forçait `centre` partout | alignement par écran, contrat + feuille |
| le bloc en dessous est décalé | une règle héritée de `odoo-bridge.css` (2026-08-23) imposait `gap: 12` et `align-items: center` à la section, écrasant en silence l'écart du contrat (32 / 32 / 15 / 40) | règle réduite à la seule largeur du widget |
| le CTA n'a pas la bonne taille | son libellé n'avait pas d'interligne porté : 24 au lieu de 20 → bouton de 42 au lieu de 38 | jeton `typography.review.libelle-line-height` minté et lié |
| décalage Y sur les cartes | conséquence des deux précédents, plus les étoiles du résumé rendues à 20 px au lieu de 16 | les cinq étoiles du résumé étaient des **cadres libres** : remplacées par une instance du composant gouverné `ds.notation`, comme sur la carte |
| souci sur le logo | le mot « Google » gardait sa taille bureau (70,96 × 24) sous 992 px | taille par écran dans la feuille |
| mobile n'a que 3 avis | vrai — la planche n'en dessinait que 3 | **5 avis posés dans la maquette** sur décision owner, et les textes des cartes alignés sur la copie de référence |

### Deux leçons d'instrument

1. **Exporter le MEMBRE d'un jeu de variantes rend une image tronquée** : le nœud mesurait
   390 × 1709, le PNG sortait en 390 × 1348. Exporter l'**instance posée dans la vue** rend la
   bonne image. Toutes les planches de ce round viennent des instances.
2. **Créer un cadre par script pose des valeurs BRUTES.** Les cadres `infos` et `notation` que
   j'ai créés pour unifier la topologie portaient des écarts non liés — invisibles au contrat,
   donc absents du CSS. Toujours lier immédiatement après avoir créé.

### Reste, et c'est nommé

- Le résidu de 1,2 à 2 % est du **lissage de texte** : structure, boîtes et hauteurs concordent.
- Le libellé du CTA change d'ACTION selon l'écran (« Voir tous les avis » / « Écrire un avis »).
  Les deux sont dans le DOM, un seul s'affiche. **Décision owner en attente** sur l'action réelle.
- La note globale et le nombre d'avis sont **réglables par le rédacteur** (contrôles `controlled`
  en texte simple) — l'exigence du 2026-09-03. Reste à le prouver par un test d'édition à l'écran.

### Correctif du 1200 signalé par l'owner (2026-09-03)

L'owner a vu, à l'œil, ce que le pourcentage cachait : la rangée du résumé dédoublée
horizontalement et le CTA décalé. **Mesuré** : `infos` commençait à 92 au lieu de 84 (+8) et le
CTA à 965,69 au lieu de 973 (−7,3) — symétrique, donc un rembourrage.

**Cause** : le rembourrage horizontal du bloc résumé valait **25 px au lieu de 16** (24 + 1 de
bordure). La règle tablette pose 24 à partir de 768 px et **le bloc bureau ne la remettait jamais
à 16** — les `@media` s'empilent. Exactement le piège nommé au mode d'emploi (« un bloc @media
borné — le hero a perdu une heure sur un `left: 48px` non borné »).

Relevé Figma du rembourrage du résumé : **16 / 24 / 16 / 16**. Après correctif, tous les éléments
de la rangée sont à moins de 1 px de la maquette, sauf des largeurs de mots (« Excellent » 66,11
contre 67) qui sont de la métrique de police.

**Chiffres finaux : 1,99 % · 1,20 % · 1,11 % · 1,62 %, les quatre hauteurs exactes.**

---

## Adoption du composant Bouton (2026-09-03, décision owner « option A »)

**Question posée par l'owner** : « y a-t-il une raison de ne pas utiliser notre composant CTA ? »
**Réponse mesurée : non.** Les deux CTA étaient dessinés à la main. Écarts avec `ds.button` :

| | `ds.button` outlineNoir | CTA dessiné à la main |
|---|---|---|
| marge intérieure | 16 / 32 | 8 / 22 |
| taille du texte | 16 / 16 / 16 / 18 | 16 / 16 / **14** / 18 |
| interligne | 22 | 20 |
| trait | 2 | 1 |

Même famille de défaut que les cartes libres et les étoiles libres : un composant du système
redessiné à la main. Toutes les autres sections (Réassurances, Devis) utilisent le composant.

### Ce qui a été fait

- **Section** : `ecrireAvis` → instance de `ds.button` variante `outlineNoir`, libellé
  « Voir tous les avis » **partout** (l'owner a tranché contre « Écrire un avis »).
- **Carte** : `lireLaSuite` → instance de `ds.button` variante `link`.
- **Le rendu grossit**, c'était annoncé et accepté : la section passe de 459 à 477 px en bureau.
  Le libellé passe en capitales, c'est le style du bouton du système.
- **Les deux boutons NAVIGUENT** : le gabarit `pqr_button` rend une ancre dès qu'une adresse est
  posée, un `<button>` sinon.

### Trois réglages nouveaux, tous au PANNEAU (et non en édition directe — décision owner)

| réglage | où il vit | ce qu'il fait |
|---|---|---|
| `note` (1 à 5) | panneau, liste | **pilote les étoiles** : passe la variante au composant `ds.notation` |
| `noteGlobale`, `volume` | panneau, texte | la note affichée (« 4.8 ») et le nombre d'avis |
| `lienAvis` (section) | panneau, texte | l'adresse du bouton « Voir tous les avis » |
| `lienAvis` (par avis) | la collection | l'adresse de chaque « Lire la suite » |

**Limite nommée** : `ds.notation` ne connaît que des notes ENTIÈRES. Une note affichée « 4.8 »
se dessine avec cinq étoiles pleines — ce que fait déjà la maquette. Une demi-étoile n'existe
pas dans le système.

### Mesure après adoption

| largeur | hauteur | écart |
|---|---|---|
| 390 | **exacte** (1755) | 2,06 % |
| 834 | **exacte** (1392) | 1,24 % |
| 1200 | **exacte** (477) | 1,29 % |
| 1728 | +6 px (499 / 493) | 1,40 % |

Les 6 px du grand écran viennent d'**une seule carte sur cinq** — la plus longue, dont le texte
tronqué tombe une fraction de ligne plus bas. L'intérieur des cartes est exact au pixel
(en-tête 56, étoiles 16, témoignage 48, lien 30). Nommé, non poursuivi.
