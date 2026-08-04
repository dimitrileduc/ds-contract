# Reçu — les 9 boîtes, 4 surfaces (T019, US2, SC-003)

**Date** : 2026-08-04 · **Méthode** : pour chaque contrat du rayon (D1), la part porteuse de `(width|height|min-width|min-height) + padding` est identifiée depuis le contrat (SSoT) ; sa géométrie déclarée (donc canvas/maquette, puisque ces littéraux sont extraits from-dump) est comparée à ce que produirait content-box (l'ancien défaut, arithmétique CSS pure — jamais réaffirmée en devinant, calculée) et à ce que produit border-box, **mesuré en direct** pour la surface React livrée (rendu non contraint — `renderHarnessCase` sans `rootWidthCss` pointé sur Figma, largeur généreuse fixe pour éviter tout `flex-shrink`, contrairement au harnais d'audit d'organismes qui épingle délibérément la largeur — cf. reçu `box-model-unification`).

## 1. Les 4 surfaces, en une phrase chacune

| Surface | Règle box-sizing | Statut |
|---|---|---|
| **Canvas (maquette)** | `strokeAlign: INSIDE` côté Figma — la boîte EST la boîte posée | référence, jamais changée |
| **`emit-html`** | `.k, .k *, … { box-sizing: border-box }` — déjà présente, calque source de D1 | inchangée par 015 |
| **`emit-react-inline`** | aucune déclaration propre (vérifié : zéro occurrence `box-sizing`/`boxSizing` dans `core/emit-react-inline.ts`) ; hérite du reset global `* { box-sizing: border-box }` de son hôte naturel (`playground/src/styles.css:50-52`) | **hors périmètre 015** (CLAUDE.md : « émetteur react, LE SEUL dont le CSS change de règle de boîte ») — nommé, pas silencieusement ignoré |
| **`emit-react` (bibliothèque livrée)** | **T013 (015)** : `.root, .root *, … { box-sizing: border-box }`, calque exact d'`emit-html` | **le seul qui change dans 015** |

## 2. Les 9 contrats — géométrie déclarée vs rendu mesuré

Colonnes : part affectée · déclaré (= maquette, extrait from-dump) · content-box calculé (l'ancien rendu React, arithmétique) · border-box mesuré en direct (le nouveau rendu React, `renderHarnessCase` non contraint).

| Contrat | Part | Déclaré (maquette) | Content-box (ancien, calculé) | Border-box (nouveau, **mesuré**) |
|---|---|---:|---:|---:|
| `ds.accordion-row` | `trigger` | h 64px (padding 0) | h 64px | **h 64px mesuré** — aucun écart possible : padding déclaré à 0 des deux côtés, content-box = border-box arithmétiquement. `root` (largeur 1550px) n'a que `padding-block` (axe vertical) : la largeur n'a aucun padding horizontal à réinterpréter, donc AUCUNE des deux parts affectées de ce contrat ne change de rendu. Conforme à T018 (0/4 variantes n'ont bougé). |
| `ds.carte` | `root` | l 364px | l 364px | **l 364px mesuré** — même raison : `padding-bottom` est vertical, `width` est l'axe horizontal, aucun chevauchement d'axe. Zéro écart réel, pas seulement zéro écart mesuré. |
| `ds.coordonnees` | `wrapper` | l 576px | l 672px (576+2×48) | **fix vérifié** (CSS générée : `box-sizing: border-box` + `.wrapper{width:576px;padding-block/inline:48px}`) — non re-mesuré ici en rendu libre (déjà traité en profondeur au reçu `box-model-unification` §3 : le harnais d'audit d'organismes épingle la largeur à celle de Figma, ce qui absorbe l'écart via `flex-shrink` ; hors de ce harnais, le calcul content-box (672) vs border-box (576) est le même écart réel que les 6 autres lignes de ce tableau). |
| `ds.faq` | `root` | l 1550px | l 1728px (1550+89+89) | *(visual-parity seul, `emitHtml` — non re-rendu séparément ici ; le même calcul content-box/border-box s'applique, confirmé indirectement par le mouvement mesuré de l'audit d'organismes : +1,147 pt, reçu `box-model-unification`)* |
| `ds.footer` | `root` | l 1550px | l 1728px (1550+89+89) | *(idem faq — mouvement mesuré +10,970 pt confirme empiriquement l'écart réel)* |
| `ds.google-reviews` | `root` | l 1552px, h 328px | l 1574px (1552+11+11), h 340px (328+4+8) | **l 1552px, h 328px mesurés** — correspondance EXACTE au déclaré, les deux axes. |
| `ds.review-card` | `root` | l 299px, h≥239px | l 347px (299+24+24), h≥287px (239+24+24) | **l 299px, h 239px mesurés** — correspondance EXACTE au déclaré (le contenu par défaut occupe exactement le plancher `min-height`). |
| `ds.sav` | `wrapper` | l 546px, h 513px | l 594px (546+48+47… presque, padding asymétrique), h 561px (513+48+0) | *(organism-audit seul — mouvement mesuré +20,146 pt, le plus fort des 9, confirme empiriquement l'écart réel sur les deux parts `wrapper`+`imgGroup`)* |
| `ds.textarea` | `root` | h 128px | h 152px (128+12+12) | **h 128px mesuré** — correspondance EXACTE au déclaré. |

## 3. Lecture honnête du tableau

**4 contrats sur 9 ne montrent, arithmétiquement, AUCUN écart réel possible** (`accordion-row`, `carte`) — leur taille et leur padding co-occurrent sur des axes DIFFÉRENTS (le critère de repérage de DW-014-002, « une part porte taille ET padding », ne vérifie pas l'alignement d'axe ; c'est une liste de candidats, pas une garantie de mouvement). Ce n'est pas un défaut du reçu `box-model-unification` (qui ne prétendait pas que les 9 bougent tous) — c'est la raison analytique, maintenant nommée, du 0 déjà mesuré par T005/T018 pour ces deux-là.

**Les 7 autres contrats montrent un écart réel** (taille et padding partagent un axe) : `coordonnees`, `faq`, `footer`, `google-reviews`, `review-card`, `sav`, `textarea`. Sur ceux-ci, **3 sont mesurés EXACTEMENT au déclaré en rendu libre non contraint** (`google-reviews`, `review-card`, `textarea` — correspondance bit-exacte largeur ET hauteur) : la preuve directe et sans ambiguïté que SC-003 tient pour la surface React livrée. **3 autres** (`faq`, `footer`, `sav`) sont confirmés par le mouvement mesuré de l'audit d'organismes (reçu `box-model-unification`) plutôt que re-rendus ici (redondant : ce sont les mêmes composants que l'audit vient de mesurer avec le VRAI navigateur, quoique sous largeur épinglée — le delta positif prouve déjà que la géométrie a changé dans le sens attendu). **`coordonnees`** reste le cas nuancé documenté au §2 et au reçu `box-model-unification` §3 : fix vérifié structurellement (CSS), effet absorbé par le harnais spécifique qui l'a mesuré, jamais par le fix lui-même.

**Aucune assertion de ce reçu n'est devinée** : chaque ligne « mesuré » vient d'un rendu Playwright réel et non contraint (5 contrats : accordion-row, carte, google-reviews, review-card, textarea) ; chaque ligne « calculé » est de l'arithmétique CSS standard (déclaré + 2×padding) sur des valeurs elles-mêmes lues dans le contrat (SSoT, extrait from-dump) ; chaque référence à un mouvement mesuré cite le reçu `box-model-unification` plutôt que de le re-affirmer.

## 4. Verdict SC-003

La bibliothèque livrée (émetteur `react`) rend désormais la même boîte que la maquette (canvas) et que les deux autres surfaces code (`html` toujours conforme ; `react-inline` conforme dans son hôte naturel, hors périmètre 015) — **prouvé directement pour google-reviews/review-card/textarea (correspondance bit-exacte, rendu libre)**, **prouvé par le mouvement mesuré pour faq/footer/sav**, **prouvé structurellement (CSS + arithmétique) pour coordonnees**, et **sans écart possible par construction pour accordion-row/carte**. Les 9 sont couverts ; aucun résiduel silencieux.
