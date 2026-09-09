# Audit de conformité WCAG 2.2 — page « Motorisation »

## Périmètre

`http://localhost:8109/motorisation` · WCAG 2.2 **A et AA** (55 critères) · 1440, 640
(zoom 200 %), 390, 320 · 2026-09-09 · `@a11y-skills/audit` + mesures maison au pixel.
Pas de vidéo : batterie directe, **11 vérifications, 0 erreur**.

## Résultat

| Niveau | Conforme | Non conforme | Non testé | Sans objet |
|---|---:|---:|---:|---:|
| A | 21 | 1 | 2 | 8 |
| AA | 11 | 2 | 3 | 7 |
| **Total** | **32** | **3** | **5** | **15** |

**32 conformes sur 35 critères testés — 91 %.**

## Acquis

| Mesure | Résultat |
|---|---|
| Langue | `fr-BE` · Titre : « Motorisations Hörmann pour portes et portails \| Piqueray » |
| Un seul `h1` | oui |
| Liens qui ne mènent nulle part | **0** — c'était la page la plus touchée avant correctif (6 sur 19) |
| Défilement horizontal réel à 320 px | **0 px** — c'était la dernière page à déborder après le premier correctif (326 px pour une fenêtre de 320) |
| Lien « Plan du site » | présent |
| Contrôles sans nom accessible | **0** · Ressources en 404 : **0** |

## Les 3 non-conformités

Deux sont les écarts assumés habituels. **La troisième a une cause DIFFÉRENTE de celle des
autres pages, et elle mérite une décision neuve.**

| Critère | Constat mesuré | Statut |
|---|---|---|
| **1.4.3 Contraste** (AA) | Initiales des avis : **2,51** pour 4,5. Seul échec — hero sur photo **8,96**, Devis **8,09**, bouton **20,01**, texte SEO **11,85**. | VOULU |
| **1.4.12 Espacement du texte** (AA) | **8 titres de fiches produit** coupés en largeur (414 px de texte dans 238 px). C'est l'écart de la home, pas celui des pages Portes : cette page porte le carrousel produit, pas d'avis longs. | VOULU |
| **1.3.1 Info et relations** (A) | **AUCUN saut de niveau ici** (les deux sauts habituels viennent de composants absents de cette page). En revanche **cinq textes fonctionnent comme des titres sans être balisés** — voir ci-dessous. | **À TRANCHER** |

## Le défaut que l'automatisme ne voit pas — cinq titres non balisés

Un outil ne peut pas deviner qu'un texte AURAIT DÛ être un titre : il ne voit que les
balises présentes. `axe-core` ne signale donc rien. Trouvé par sonde dédiée (texte visible
de 24 px ou plus, court, hors de toute balise de titre) :

| Section | Texte | Taille |
|---|---|---|
| `categories_principales` | « POUR PORTES DE GARAGE » | 24 px |
| `categories_principales` | « POUR PORTAILS D'ENTRÉE » | 24 px |
| `categories_principales` | « PILOTEZ À DISTANCE » | 24 px |
| `texte_seo` | « Automatisez vos accès : confort, rapidité et sécurité » | 32 px |
| `texte_seo` | « Compatibilité et fonctionnement » | 24 px |

**Une incohérence à l'intérieur d'un même composant.** `ds.carte-categorie` porte un `h3`
sur son style **superposé** (`TitreSuperpose`, posé par la passe du 2026-09-04) et **rien**
sur son style **empilé** (`TitreCategorie`). Même composant, même rôle visuel, deux
traitements.

**Antériorité** : `specs/tiny/accessibilite-home-odoo.md` (2026-09-04) nomme déjà
`texte-seo` et `faq` parmi les **sept sections sans titre gouverné**, laissées hors
périmètre parce que leur ancienne famille de styles ne permet pas de déduire le niveau —
un arbitrage éditorial était annoncé. **Il n'a pas eu lieu.** La carte de catégorie en
style empilé, elle, n'était pas dans cette liste : c'est un manque neuf.

## Portée réelle, mesurée sur les 5 pages auditées

| Page | Titres visuels non balisés |
|---|---|
| Accueil | **0** — n'utilise ni texte SEO, ni FAQ, ni carte empilée |
| Portes de garage | 2 (texte SEO) |
| Motorisation | 5 (3 cartes empilées + texte SEO) |
| Portes résidentielles | 6 (2 cartes + 2 FAQ + texte SEO) |
| Portes industrielles | 7 (2 cartes + 3 FAQ + texte SEO) |

## Piège de méthode, payé sur cette page

La première version de la sonde comptait **2 titres non balisés sur l'accueil**. C'était
faux : elle prenait les `<span>` situés **à l'intérieur** d'un `<h2>` pour des titres
orphelins. Après exclusion (`closest('h1..h6')`), l'accueil retombe à **0**. **Une sonde
qui trouve un défaut là où il n'y en a pas est plus coûteuse qu'une sonde qui ne trouve
rien** — vérifier le témoin négatif avant de rapporter.

## Faux positifs de l'outil

Le lien d'évitement à 1 × 1 px (remonte dans trois vérifications) et 8 cibles de menu de
16 px couvertes par l'exception d'espacement que l'outil signale lui-même.

## Limites

Aucun lecteur d'écran réel. 5 critères non testés (utilisation de la couleur, trois flashs,
contraste des éléments non textuels, langue des passages).
