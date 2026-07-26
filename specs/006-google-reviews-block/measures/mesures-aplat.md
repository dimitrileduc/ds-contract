# Relevé de mesure — aplat « Avis Google »

Source unique : `measures/aplat-source.png` (2327×493 natif, `scaleFactor` 1,4994), sha256 dans
`measures/aplat-source.json`. **Une seule occurrence source réelle** — les 8 occurrences canevas
partagent le même `imageHash` (T010), donc toute valeur mesurée ici s'applique aux 8.

Méthode générale : couleurs = RVB modal sur patch 5×5 ou balayage de ligne (valeur la plus
fréquente = « encre »), à **deux emplacements**. Tailles = profil d'encre (extension du premier au
dernier pixel non-blanc), **deux axes/positions** quand c'est possible. Crops de référence :
`/tmp/card1-full.png` (carte « pho syster », 2×, non committé — recadrage reproductible depuis
`aplat-source.png` à `{x:17,y:95,w:451,h:391}`), `/tmp/stars-strip.png`, `/tmp/summary-strip.png`,
`/tmp/left-edge.png`, `/tmp/right-edge.png` (voir `decisions.md` T012 pour les commandes de
génération — recadrages purement mécaniques, rejouables depuis l'aplat committé).

⚠️ **Limite de méthode, honnête** : ce relevé est fait par un seul instrument (mesure
programmatique + lecture visuelle de crops), pas par deux personnes distinctes. Les colonnes
« lecture A / lecture B » sont deux **méthodes** indépendantes (profil d'encre horizontal vs
vertical, ou deux échantillons de couleur à deux emplacements), jamais deux relectures humaines
séparées. Là où une seule lecture fiable a pu être obtenue, c'est dit explicitement (`arbitrage:
lecture-unique`) plutôt que fabriqué une fausse seconde lecture — la boucle de convergence hors
ligne (T040) affine ensuite ces valeurs contre la cible réelle, ce relevé est un point de départ de
bonne foi, pas un verrou final.

## Couleurs

| rôle | lecture A | lecture B | valeur retenue | arbitrage | canal | reçu |
|---|---|---|---|---|---|---|
| fond de carte | patch 5×5 (300,250) → `#ffffff` | patch 5×5 (300,450) → `#ffffff` | `#FFFFFF` | accord 2/2 | **token** `{color.blanc}` | card1-full.png |
| fond de section (hors carte) | patch 5×5 (10,10) → `#ffffff`* | — | `#F4F6FA` **(décision R10, pas mesuré sur CE crop — la zone hors-carte visible dans l'aplat est le fond de PAGE du widget, blanc, pas le fond de section Piqueray)** | pas-gouverné (décision déjà prise) | **token** `{color.bleu-clair}` | research.md R10 |
| texte auteur (nom) | balayage ligne y=145 → `#000000` | balayage ligne y=155 → `#000000` | `#000000` | accord 2/2 | **literal** `color:"#000000"` (Δ vs `{color.noir}` #37373B = 55/255, pas imperceptible) | card1-full.png |
| texte date (relative) | balayage ligne y=195 → `#8a8a8a` | balayage ligne y=200 → `#8a8a8a` | `#8A8A8A` | accord 2/2 | **literal** `color:"#8A8A8A"` (Δ vs `{color.bleu-gris}` #9BA4B5 trop visible — teinte neutre vs bleutée) | card1-full.png |
| texte témoignage | balayage ligne y=385 → `#000000` | balayage ligne y=395 → `#000000` (3ᵉ lecture y=375 → `#0c0c0c`, écart 12/255, absorbée par médiane-3) | `#000000` | médiane-3 (2 sur 3 lectures à `#000000`) | **literal** `color:"#000000"` | card1-full.png |
| étoile (icône) | n/a — **pas mesuré** | — | inchangé | **n/a** | icône **gouvernée existante** (`assets/icons/star.svg`, `#F98A0B` fixe, registre v1.1.0) — R7 : le composant réemploie l'asset, ne recolore jamais, la couleur exacte de l'aplat (~`#f6bb06`-`#f7c425`, elle-même incohérente selon l'endroit du glyphe) n'entre pas en jeu | — |
| badge vérifié (fond) | balayage ligne y=298 (checkmark) → `#000000` dominant | patch 5×5 zone pleine → `#000000` | `#000000` | accord 2/2 | **literal** `color:"#000000"` (fond du badge ; le glyph intérieur est blanc) | card1-full.png |
| avatar « pho syster » | balayage ligne y=160 → `#ec407a` | patch 5×5 (85,160)** → `#ec407a` | `#EC407A` | accord 2/2 | **fait mesuré, PAS ENCORE un canal de contrat** — voir note ⚠️ ci-dessous | card1-full.png |
| avatars (4 autres cartes) | lecture visuelle du triptyque envoyé à l'owner (T012) | — | violet, brun/taupe, gris-taupe, bleu foncé (noms exacts non mesurés au pixel) | lecture-unique | idem — fait, pas un canal | aplat-source.png |

\* Le patch (10,10) tombe dans la marge de page du widget (hors carte), pas le fond de section
Piqueray — n'a donc aucune valeur de mesure directe ici ; `{color.bleu-clair}` reste une décision de
gouvernance (R10), pas une extraction.
\** Coordonnées du patch dans `/tmp/card1-full.png` (crop 2×), pas dans `aplat-source.png` natif.

⚠️ **Point ouvert non tranché ici** : `ds.review-card` (`data-model.md` §1) n'a **aucune prop pour
la couleur de fond de l'avatar-initiale** — le pastille est actuellement implicitement d'une seule
couleur gouvernée dans le contrat prévu. Les 5 avatars réels ont 5 couleurs **différentes**
(mesurées ci-dessus, 4/5 à l'œil seulement). Décision à prendre en Phase 4a (T031/T032) : soit la
pastille reste une seule couleur gouvernée fixe (écart de fidélité nommé par carte, comme l'étoile),
soit une prop `couleurInitiale` (text, hex ou nom de token) rejoint la liste `arrayOf` de
`ds.google-reviews`. **Non tranché par ce relevé** — remonté tel quel, pas absorbé.

## Tailles

| rôle | lecture A (méthode) | lecture B (méthode) | valeur retenue | arbitrage | canal | reçu |
|---|---|---|---|---|---|---|
| carte — largeur | gouttières détectées par colonne (script, T014) : 451 px natif | recoupé sur 4 gouttières (451, 447, 448, 448, 448 px, les 5 cartes) → très homogène | **300,8 px CSS** (451 / 1,4994) | accord (Δ≤2px entre les 5 cartes) | **declared-draw** (largeur du repeat item, dérivée du conteneur) | occurrences.json + script gouttières |
| carte — gap horizontal | gouttières : 12,14,13,13 px natif (moyenne 13) | — | **8,7 px CSS** (13 / 1,4994) — **hors échelle** (`{0,4,10,16,32}`, le plus proche 10 à Δ1,3) | pixel (hors échelle, repli R10) | **literal** `gap:"9px"` | script gouttières |
| carte — hauteur (bloc cartes) | balayage plein-largeur : contenu de y≈95 à y≈486 natif → 391 px | — | **260,8 px CSS** (391 / 1,4994) | lecture-unique | **declared-draw** (hauteur du root contrainte à la hauteur mesurée de l'aplat, R20) | script gouttières pleine largeur |
| avatar — diamètre | extension verticale (x=135 crop2×) : 120 px crop → 60 px natif | extension horizontale (y=155 crop2×) : 112 px crop → 56 px natif | **≈58 px natif → 38,7 px CSS** (moyenne A/B, Δ4px entre A et B — pas un cercle parfaitement centré par ma mesure, à re-confirmer T040) | pixel (moyenne, désaccord noté) | **declared-draw** (`border-radius:50%` + taille) | card1-full.png |
| badge vérifié — diamètre | extension verticale (x=388 crop2×) : 44 px crop → 22 px natif | extension horizontale (y=298 crop2×) : 44 px crop → 22 px natif | **22 px natif → 14,7 px CSS** | accord 2/2 (A=B exactement) | **literal** taille icône | card1-full.png |
| étoile — taille glyphe | extension verticale (x=105 crop2×) : 34 px crop → 17 px natif | — | **≈17 px natif → 11,3 px CSS**, arrondi 16px si alignement grille icône | lecture-unique | icône gouvernée, taille standard `icon.size` | card1-full.png |
| police — nom/date/texte | tentative de cap-height par profil d'encre : résultat instable selon la lettre échantillonnée (8,7-13 px CSS selon la position) | — | **NON TRANCHÉ ICI** — reporté à la boucle de convergence T040 (le rendu code ↔ crop natif itère directement sur la taille visuelle, plus fiable qu'une extraction manuelle de cap-height sur cette police) | lecture-unique, non concluante | **declared-draw** (`font-size`, dessiné) | card1-full.png |
| résumé — hauteur de bande | balayage plein-largeur : y=0 à y≈80 natif (zone Google/Excellent/étoiles/4,8/avis/CTA) | — | **≈80 px natif → 53,4 px CSS** | lecture-unique | **declared-draw** | script full-width scan |
| flèches carrousel — présence | vue directe (`/tmp/left-edge.png`, `/tmp/right-edge.png`) | vue directe (côté opposé) | **présentes, confirmées aux deux bords** | accord 2/2 (visuel) | booléen `montrerControles: true` | left/right-edge.png |
| étoiles — compte par carte | comptage direct sur les 5 cartes visibles (`stars-strip.png`) | comptage direct sur la barre-résumé (`summary-strip.png`) | **5/5 partout, aucune partielle** | accord 2/2 | axe `note` **supprimé** (T020) | stars-strip.png, summary-strip.png |
| CTA « Écrire un avis » — présence | vue directe résumé | — | **présent**, bouton bordé, texte + pas d'icône visible | lecture-unique (visuel univoque) | part dessinée, jamais `ds.button` (R5) | summary-strip.png |

## Ce que ce relevé NE couvre PAS (nommé, pas silencieux)

- **Rayon de coin de carte** : non mesuré précisément — le repli R10 (rayon court, ~8px, seul
  `radius/32` existe côté tokens) s'applique par défaut ; à confirmer visuellement en T040.
- **Padding interne de carte** (haut/gauche/droite/bas) : estimé visuellement à ~18-20px CSS lors
  de l'écriture de la sonde T015 (voir `/tmp/aplat-probe/card.css`), **pas mesuré par profil
  d'encre indépendant** — à raffiner en boucle de convergence.
- **Tailles de police exactes** par rôle (nom/date/texte/résumé) : voir ligne dédiée ci-dessus,
  explicitement non tranchées ici.
- **Couleur exacte des 4 avatars restants** : lues à l'œil sur le triptyque envoyé à l'owner
  (T012), pas mesurées au pixel individuellement — à faire si la prop `couleurInitiale` est retenue
  (point ouvert ci-dessus).
