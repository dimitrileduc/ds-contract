# Page « À Propos » — 4 vues v2 montées à côté de la base (2026-09-08)

Base légataire : `2782:34966` (page « 031 · Planches de validation », 1728×6132) — **intacte**, relevé après : 6132, 9 enfants.

## Ce qui a été fait

- Version nommée avant : « 031 — avant DEMO A PROPOS 4 vues (2026-09-08) » (id 2396765457899355417).
- Section **2782:39568** « 031 · DEMO A PROPOS — 4 vues (instances v2) », x=-5150 / y=56988 (en face de la base).
- Méthode : clone des 4 vues « Portes de garage » (l'ordre le plus proche), **moins** CategoriesPrincipales, **plus** une
  instance neuve du set **Équipe v2** `2777:30992` insérée après Presentation, puis contenus posés en surcharges.
- Vues : Mobile **2782:39569** (390×9195) · Tablette **2782:40099** (834×8292) · Desktop **2782:40629** (1200×7573) ·
  Wide **2782:41185** (1728×6750). Ordre : Hero, Presentation, Equipe, Devis, Reassurances, AvisGoogle, TexteSEO,
  Footer (+ Header absolu).
- **Équipe v2 sort de sa boîte pour la première fois** : le set était un candidat à **0 instance** avant aujourd'hui.
  Colonnes par écran : Mobile 2 · Tablette 3 · Desktop 3 · Wide 4. Le contrat `ds.equipe` 2.0.0 (axe Presentation
  4 valeurs) et le bloc Odoo `s_pqr_equipe` existaient déjà — rien à créer côté code.
- Réassurances : **4 cartes** comme la base (la 5ᵉ du set masquée, même technique que la 3ᵉ carte de Catégories),
  et les 4 photos de la base reposées (le clone portait celles de Portes de garage).

## Contenus posés (relevés sur la base)

| Section | Contenu |
|---|---|
| Hero | « **Piqueray**, vos experts à votre service » (gras 0-8 reporté par plage), sous-titre avec « **une référence incontournable** » en gras, bouton « En savoir plus », photo `fd708810…` |
| Presentation | « Piqueray, une histoire de famille » + texte riche à **8 plages** (Bold/Medium alternés), bouton « En savoir plus » |
| Equipe | contenu du set = celui de la base (16 personnes, mêmes noms, mêmes postes, mêmes photos — vérifié : **0 image de la base absente de la vue**) |
| Reassurances | accroche « Plus de 50 ans d'expérience », titre « Pourquoi choisir nos portes de garage industrielles ? », 4 cartes + bouton |
| TexteSEO | « Piqueray : une entreprise familiale au service de votre habitat », paragraphe, « Nos engagements », 3 lignes |
| Devis, AvisGoogle, Footer, Header | communs, repris du clone |

## Écarts v1 → v2 nommés (aucun n'est un défaut de la vue)

Comparaison automatique base ↔ vue Wide : 110 textes contre 104, **0 image manquante**. Les 6 écarts sont tous des
normalisations de la vague :
1. **Le titre du Devis porte une coupure de ligne dure** (U+2028) dans le master v2, là où la base a une espace — donc
   deux lignes sur toutes les pages v2, pas seulement ici. Trouvé en comparant les points de code : `JSON.stringify`
   affiche U+2028 comme une espace ordinaire, les deux chaînes semblaient identiques.
2. Le mot « Google » n'est plus six nœuds texte (G·o·o·g·l·e) mais un SVG.
3. « Écrire un avis » → « Voir tous les avis ».
4. Les noms d'auteurs sont abrégés (« pho syster » → « p. syster », etc.).

## Deux points pour l'owner

- **Équipe en Desktop (1200) : 3 colonnes, grandes photos, 2652 px de haut — soit PLUS HAUT que le Wide (1891, 4 colonnes).**
  C'est le dessin du candidat, jamais posé sur une page jusqu'ici et jamais validé à l'écran. À trancher : on garde, ou
  Desktop passe à 4 colonnes comme le Wide.
- **La base fait dire aux Réassurances « Pourquoi choisir nos portes de garage industrielles ? » sur une page À Propos.**
  Défaut de contenu de la source, reporté tel quel (fidélité à la base) — à corriger à la source si tu veux.

## Preuve que rien d'existant n'a bougé

Base `2782:34966` : 6132 de haut, 9 enfants, identique. Comptes d'instances des sets, **+4 partout** — Hero 25→29,
Presentation 12→16, Devis 28→32, Reassurances 20→24, AvisGoogle 24→28, TexteSEO 22→26, Footer 29→33, Header 28→32,
et **Equipe 0→4** (première utilisation du set).

## Reste à faire

Descripteur Odoo `integrations/odoo/authoring/pages/a-propos.json` + composition sur le pilote + mesure page entière
aux 4 largeurs. Aucun code touché par cette page : les 9 contrats sont déjà adoptés.
