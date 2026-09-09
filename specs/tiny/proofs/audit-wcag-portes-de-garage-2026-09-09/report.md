# Audit de conformité WCAG 2.2 — page « Portes de garage »

## Périmètre

`http://localhost:8109/portes-de-garage` · WCAG 2.2 niveaux **A et AA** (55 critères) ·
largeurs 1440, 640 (équivalent zoom 200 %), 390 et 320 · 2026-09-09 ·
`@a11y-skills/audit` (axe-core + 10 vérifications dédiées) + mesures maison au pixel.
**Aucun relais nécessaire** : cette page n'a pas de vidéo de fond, la batterie a tourné
directement sur le site (11 vérifications, **0 erreur**) — contrairement à la home.

## Résultat

| Niveau | Conforme | Non conforme | Non testé | Sans objet |
|---|---:|---:|---:|---:|
| A | 21 | 1 | 2 | 8 |
| AA | 11 | 2 | 3 | 7 |
| **Total** | **32** | **3** | **5** | **15** |

**32 conformes sur 35 critères testés — 91 %.** Même score que la home après correctifs.

## Ce qui est acquis, hérité des correctifs du jour

| Mesure | Résultat |
|---|---|
| Langue déclarée | `fr-BE` |
| Titre de page | « Portes de garage Hörmann en Province de Liège \| Piqueray » — réel, pas d'usine |
| Un seul `h1` | oui, 12 titres au total |
| Liens qui ne mènent nulle part | **0** |
| Défilement horizontal réel à 320 px | **0 px** |
| Lien « Plan du site » | présent |
| Contrôles sans nom accessible | **0** |
| Champs sans étiquette | sans objet (pas de formulaire) |
| Ressources en 404 | **0** |

## Les 3 non-conformités

**Les TROIS sont des écarts assumés par l'owner.** Deux viennent de la home (mêmes
composants), la troisième a été tranchée le jour même sur cette page :

| Critère | Constat | Statut |
|---|---|---|
| **1.4.3 Contraste** (AA) | Initiales des avis Google : blanc sur `rgb(155,164,181)`, ratio **2,51** pour 4,5 requis. **Seul échec de contraste de la page** — le titre du hero sur photo est à 10,76, celui du Devis à 6,14, les cartes catégories à 14,1. | **VOULU** (décision du 09-09) |
| **1.3.1 Info et relations** (A) | Deux sauts de niveau : `h1`→`h3`, `h2`→`h4`. | **ACCEPTÉ** (04-09) |

**La troisième est NOUVELLE, et elle n'existait pas sur la home** :

### 1.4.12 Espacement du texte (AA) — deux avis Google tronqués en hauteur

`review-card__temoignage` : le texte est coupé à **3 lignes** (`-webkit-line-clamp: 3`).
Mesuré : 60 px affichés pour 100 px de texte réel, sur deux cartes —
« Je vous envoie mon message un peu tardivement car… » et « Travail propre, soigné,
ouvrier expert dans son métier… ».

**Ce n'est pas le même défaut que sur la home.** Là-bas, les titres de produits étaient
coupés **en largeur** par une ellipse. Ici c'est une coupe **en hauteur**, et elle dépend
du contenu : les avis plus courts ne clippent pas. La page d'accueil n'a donc rien montré.

**Circonstance atténuante réelle** : chaque carte porte un bouton « LIRE LA SUITE » qui
mène à l'avis complet sur Google. Le texte n'est pas perdu, il est ailleurs. Beaucoup
d'auditeurs acceptent ce motif.

**VERDICT OWNER, 2026-09-09 : VOULU.** Troisième écart assumé, au même titre que les titres
de produits et le contraste des initiales. Il ressortira à chaque audit futur — c'est
attendu.

## Deux faux positifs, tranchés à la mesure

1. **Le lien d'évitement**, réduit à 1 × 1 px tant qu'il n'a pas le focus, remonte dans
   `reflow-clipped-text`, `text-spacing` et `zoom-200`. C'est le motif standard.
2. **`target-size`, 8 nœuds** — les entrées de menu font 16 px de haut, mais l'outil note
   lui-même que l'exception d'espacement s'applique (aucune cible voisine à moins de 24 px)
   ou que le même lien existe ailleurs à une taille suffisante.

## Limites, identiques à celles de la home

Aucun lecteur d'écran réel. Les 5 critères non testés le restent (utilisation de la
couleur, trois flashs, contraste des éléments non textuels, langue des passages). La
détection automatique ne couvre que 30 à 40 % des problèmes d'accessibilité.


---

## CORRECTION du rapport — même jour, après l'audit de « Motorisation »

**Ce rapport a sous-évalué le critère 1.3.1.** Il ne retenait que les sauts de niveau de
titre, écart accepté par l'owner. Une sonde dédiée, écrite en auditant Motorisation, montre
qu'il manque aussi des titres : **2 (le titre et le sous-titre du texte SEO)** — des textes de 24 à 32 px qui
fonctionnent comme des titres sans en être.

**Pourquoi ça avait échappé** : aucun outil automatique ne peut deviner qu'un texte AURAIT
DÛ être un titre ; il ne voit que les balises présentes. `axe-core` ne signale rien. C'est
exactement l'avertissement du rapport de la passe 1 (2026-09-04) : *« l'absence totale de
titres ne produit qu'UNE alerte automatique — la casse structurelle est invisible à
l'automatisme »*.

**Le verdict de 1.3.1 ne change pas** (déjà non conforme, donc le score reste 32/35), mais
sa CAUSE est double : les sauts acceptés **et** ces titres absents, qui n'ont eux fait
l'objet d'aucune décision. Détail complet et portée sur les 5 pages :
`specs/tiny/proofs/audit-wcag-motorisation-2026-09-09/report.md`.
