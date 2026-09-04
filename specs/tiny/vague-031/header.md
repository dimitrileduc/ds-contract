# Journal — Header 031 (set `Header` 2732:12096), côté Figma seulement

**Date** : 2026-09-03. **Périmètre** : header uniquement (le footer a ses clones dans `031 · FOOTER — 4 variantes`, non traités).
**Où** : page `031 · Planches de validation` (2613:18825), section `031 · HEADER — 4 variantes` (2732:10533),
en bas de page. **Les 4 vues home n'ont pas été touchées.** Version nommée avant tout geste :
`031 — avant construction HEADER/FOOTER (clones séparés, vues intactes)` (2394995075615198546).

## Source relevée (les 4 vues home, une vérité par mode)

| Vue | Nœud source | Forme | Contenu |
|---|---|---|---|
| Mobile 390 | `header` 2617:55171 | copie détachée (3 niveaux : wrapper 24 → Header 16/0) | logo + burger 44 ; nav desktop **cachée et écrasée à 1 px** dans le cadre |
| Tablette 834 | `header` 2674:15009 | idem, gouttière 48 | idem |
| Desktop 1200 | `Header nav` 2670:8159 | copie détachée, pad 26/48 | logo + nav 4 items + icônes Utilisateur/Panier/Mail ; **pas de bouton** |
| Wide 1728 | instance `Header` 2624:57640 du master DS 84:285 | pad 16/89 | logo + nav 4 items + bouton Contactez-nous + icônes (Recherche masquée)/Utilisateur/Panier |

Hauteur : 76 (Mobile/Tablette, pad 16) · 86 (Desktop/Wide, pad 26 / 16 + bouton 54).

## Défauts de source relevés → traités sur les clones

| # | Défaut | Vues | Traitement |
|---|---|---|---|
| A1 | Nav desktop fantôme (masquée, largeur 1 px, boutons aux paddings bruts, icônes noires brutes) | Mobile, Tablette | retirée (invisible → 0 px de différence) |
| A2 | Logo en cadre détaché, hauteur HUG sur enfants absolus (32,3 au lieu de 34) | Mobile, Tablette, Desktop | remplacé par l'instance `PiquerayLogo / Couleur=Blanc` (4:15) — **décalage vertical de 1 px** (29 px de contour, voir mesure) |
| A3 | Items de nav en cadres, texte sans style | Desktop | remplacés par des instances `NavItem` (Libellé, Chevron, Actif=false), style « Libellé nav » |
| A4 | Trois structures d'emballage différentes (wrapper de gouttière + cadre interne) | Mobile, Tablette, Desktop | aplaties : un seul cadre racine, padding T/R/B/L |
| A5 | Fond blanc masqué sur la racine et sur le logo | les 4 | retiré |
| A6 | `itemSpacing 392` brut sous `SPACE_BETWEEN` (master DS) | Wide | mis à 0, lié `space/0` (E-031-023, 9ᵉ occurrence) |
| A7 | Valeurs brutes : gouttières 24/48/48/89, pad-v 16/26, gaps 32/64/16, burger 44 / traits 24×2 / gap 5, icônes 24, fills blancs des traits et des icônes | les 4 | toutes liées (voir mints) |

**Reste brut, hors périmètre du set (dans les masters DS)** : `NavItem` 2152:5554 — fill blanc du chevron non lié ; boîtes internes fixes du logo et du chevron. À corriger sur les masters DS avec GO owner.

## Mints (Primitives, marqués « 031 provisoire », à pivoter dans `tokens/`)

`space/5` (gap burger) · `space/26` (pad-v header Desktop/Wide) · `size/cible-tactile/min` = 44 (E-031-024) ·
`size/burger/trait-largeur` = 24 · `size/burger/trait-epaisseur` = 2 · `size/header/icone` = 24.

## Set

`Header` 2732:12096, axe `Presentation` = Mobile (défaut, 1ʳᵉ variante) · Tablette · Desktop · Wide.
Racines FIXED en largeur / HUG en hauteur, mode `Responsive` posé sur chaque variante.
`variantGroupProperties` se lit sans erreur. Instance de test sous le set (`TEST · instance Header — changez Presentation ICI`) :
la bascule de variante rend 390×76 / 834×76 / 1200×86 / 1728×86, enfants aux positions de la source.

## Mesure pixel (variante finale contre la vue d'origine, fond aplati #26282c)

| Variante | Écart | Cause |
|---|---|---|
| Mobile | 29 px (0,10 %) | contour du logo : instance 34 de haut contre cadre 32,3 → 1 px vertical |
| Tablette | 29 px (0,05 %) | idem |
| Desktop | **0 px** | — |
| Wide | 4 134 px (2,78 %) | libellé du bouton 16 → **18** : la variante porte le mode Wide, « Libellé bouton » est responsive (16·16·16·18, Button 2.1.0). La vue home Wide, elle, n'a pas de mode posé et rend encore 16 |

## Resize réel (banc `BANC · resize réel`, instance FILL dans un hôte de largeur donnée)

Logo à gauche, burger/nav à droite, centrage vertical tenu à toutes les largeurs testées
(390 · 600 · 767 · 768 · 834 · 991 · 992 · 1200 · 1399 · 1400 · 1487 · 1728 · 1920). **Deux bornes basses** :

- **Desktop sous 1 113 px** : la nav (837) + logo (180) + gouttières (96) dépassent → chevauchement de 121 px à 992.
- **Wide sous 1 487 px** : nav + bouton (1 129) + logo + gouttières (178) → chevauchement de 87 px à 1 400.

Ce n'est pas un défaut de construction : le contenu de la nav est plus large que le bas de sa plage. À trancher
(réduire les gaps 64/32 sous un seuil, ou décaler les seuils) — rien fait.

## Non fait, volontairement

- Pas de substitution dans les 4 vues home (validation owner d'abord).
- Pas de dump / extraction / cliché de parité (après validation).
- Le footer : clones bruts posés dans `031 · FOOTER — 4 variantes`, non nettoyés.
- Les masters DS `Header` 84:285 et `NavItem` : intacts.
