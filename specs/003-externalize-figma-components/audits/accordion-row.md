# Audit — Molécule Accordion-row (T041)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — `findAll` par nom `accordion` (jamais `item`,
qui ment — le nom `item` recouvre aussi Category-card et Reassurance-item) sur les 9
maquettes, puis inspection récursive de chaque conteneur trouvé et de ses enfants
directs. Lecture seule.
**Inspiration structurelle** (sur suggestion owner) : `git show
demo-51:contracts/accordion-item.contract.json` — wrapper `trigger` (chevron + titre)
+ `contentArea` (`visibleWhen: état=open`), variant `state: closed|open`. Confirme
l'architecture retenue ci-dessous ; nommage reste français (dossier `decisions.md`,
entrée `amendement-orga` du 2026-07-24).

## Usage — localisation par position (les 9 maquettes)

**12 conteneurs `accordion`** trouvés sur **8 maquettes** (zéro sur Accueil) — compte
et localisation reconciliés avec `dag.md` (14 conteneurs mesurés au scan T0, incluant
ceux du Texte SEO — ici les 12 relèvent spécifiquement d'`accordion-row` en tant que
molécule ; le compte T067/Accordion sera re-vérifié à son propre audit).

| Maquette | Conteneurs | Lignes |
|---|---|---|
| Portes de garage | 1 (Texte SEO) | 3 |
| Portes de garage résidentielles | 2 (FAQ + Texte SEO) | 2 + 3 = 5 |
| Portes de garage industrielles | 2 (FAQ + Texte SEO) | 3 + 3 = 6 |
| Motorisation | 1 (Texte SEO) | 3 |
| Portes d'entrée | 2 (FAQ + Texte SEO) | 2 + 3 = 5 |
| Dépannage/SAV | 2 (FAQ + Texte SEO) | 3 + 3 = 6 |
| À Propos | 1 (Texte SEO) | 3 |
| Contactez-nous | 1 (Texte SEO) | 3 |

**Total : 34 lignes** — correspond exactement à l'inventaire initial (`item`/`item
open` ~34). Aucune divergence à corriger cette fois.

## Trouvaille — **2 styles réels, pas 1** (l'inventaire ne nomme que « ligne FAQ »)

`COMPONENT-INVENTORY.md` décrit Accordion-row comme « ligne FAQ, ouvert/fermé » — mais
la mesure par position révèle **deux gabarits visuellement et structurellement
distincts**, utilisés dans deux contextes différents :

| | **FAQ** (sections FAQ, 4 conteneurs) | **Texte SEO** (8 conteneurs) |
|---|---|---|
| Occurrences | 10 lignes (6 fermées, 4 ouvertes) | 24 lignes (16 fermées, 8 ouvertes) |
| Titre | `Montserrat SemiBold 20` | `Montserrat Bold 14` |
| Chevron | `32×32`, instance | `24×24`, instance |
| Hauteur fermée | 64px | 40px |
| Hauteur ouverte | 120px | 80px (jusqu'à 136px si réponse 2 lignes — HUG, pas une anomalie) |
| Padding vertical | 16px | 8px |
| `itemSpacing` (fermé) | 24 | 24 |
| Nom Figma à l'état ouvert | **renommé `item open`** | **reste `item`** (aucune distinction de nom — encore un endroit où le nom ment) |

**Décision de construction proposée** : **UN seul master** avec un axe de variant
`Taille` (`Grand` = FAQ / `Petit` = Texte SEO) orthogonal à `État` (`Fermé`/`Ouvert`) —
4 variants au total. Cohérent avec le précédent Category-card (« 3 formes de layout,
UNE cle, layouts = propriétés du master ») plutôt que deux molécules séparées pour un
seul concept d'interaction (question + chevron, réponse révélée). Alternative rejetée
(deux masters distincts) : doublerait la molécule pour une simple différence
d'échelle, alors que le comportement (bascule fermé/ouvert, contenu révélé) est
identique.

## Structure

### État Fermé (les deux tailles)

`HORIZONTAL` [ titre `TEXT`, chevron **`chevron-down`** instance (`226:373`, local) ] —
`itemSpacing` 24, padding vertical 16 (Grand) / 8 (Petit).

### État Ouvert (les deux tailles)

**Pas juste "fermé + contenu ajouté" — un changement de `layoutMode`** :
`VERTICAL` [ `title` (`HORIZONTAL` [ titre `TEXT`, chevron **`chevron-up`** instance
(`226:374`, local — icône séparée et déjà gouvernée, PAS une rotation de
chevron-down) ]), contenu (`TEXT` en style FAQ ; `GROUP` wrapping un `TEXT` en style
Texte SEO — un des échantillons SEO a un texte `fontName: MIXED`, receipt d'un
formatage riche gras/normal en ligne — voir Limite ci-dessous) ].

Zéro dépendance tierce sur les deux chevrons (`remote: false` vérifié sur les deux).

## Limite nommée — texte riche non portable par une propriété TEXTE simple

Au moins une réponse Texte SEO (`302:735`, « Garantie et Fiabilité Hörmann ») a un
`fontName: MIXED` (portions probablement grasses/normales en ligne dans la même
phrase). Une propriété Figma `TEXT` officielle ne porte que du texte plat — le
formatage riche ne survit pas à ce mécanisme. **Ce n'est pas un blocage de
construction** (la propriété texte reste utile pour les cas simples et majoritaires),
mais chaque adoption devra vérifier au cas par cas si sa réponse a du texte riche ; si
oui, le relevé de personnalisation (`ledger/accordion-row.json`) devra soit
signaler la perte de formatage en `non-portable-signalee`, soit appliquer le texte
riche en override direct du calque (hors propriété nommée) — décision à l'adoption
(T042), nommée à l'avance ici plutôt que découverte en cours de route.

## Récapitulatif du master à construire

| Élément | Détail |
|---|---|
| Nom | `Accordion-row` |
| Variants | `Taille` (Grand/Petit) × `État` (Fermé/Ouvert) = 4 |
| Propriétés | `Titre` (TEXTE) ; `Contenu` (TEXTE, visible seulement si `État=Ouvert` — limite texte riche notée ci-dessus) |
| Dépendances | `chevron-down` (`226:373`), `chevron-up` (`226:374`) — tous deux locaux, zéro tierce |
| Page | `DS · Molécules` |

**Dépendances DAG** : aucune (les deux chevrons sont déjà des masters gouvernés
existants, hors périmètre Bloc). Accordion-row lui-même est un prérequis pour
Accordion (T067, exige Accordion-row `adopte-prouve`).

## Décision owner — 1 master vs 2 (2026-07-24)

Owner a tranché **un seul master**, variant `Taille` (Grand/Petit) — cohérent avec le
précédent Category-card.

## Construction — le master livré

`DS · Molécules` → `COMPONENT_SET` **Accordion-row** (`2059:1417`), 4 variants (2×2),
4 propriétés officielles :

| Propriété | Type | Valeurs / défaut |
|---|---|---|
| `Taille` | VARIANT | `Grand` (défaut) / `Petit` |
| `État` | VARIANT | `Fermé` (défaut) / `Ouvert` |
| `Titre` | TEXTE | défaut `Question` |
| `Contenu` | TEXTE | défaut `Réponse`, visible seulement dans les variants `Ouvert` |

Dimensions vérifiées **exactes** vs les 4 échantillons source (mesurées au pixel, pas
supposées) : Grand/Fermé 1550×64, Grand/Ouvert 1550×120, Petit/Fermé 1550×40,
Petit/Ouvert 1550×80. Chevrons : instances de `chevron-down` (`226:373`)/`chevron-up`
(`226:374`), tous deux locaux, zéro dépendance tierce, redimensionnés 32×32 (Grand) ou
24×24 (Petit) — jamais de copie.

**Piège de construction rencontré et documenté** (utile pour les molécules
suivantes) : `node.resize()` appelé sur un conteneur auto-layout **avant** que son
axe soit rempli de vrais enfants **rétrograde silencieusement son
`counterAxisSizingMode`/`primaryAxisSizingMode` de `AUTO` à `FIXED`**, même si la
valeur passée semble "provisoire" (ex. hauteur 1) — le mode ne revient jamais tout
seul. Ordre correct : construire tout le contenu D'ABORD (le hug calcule la bonne
taille), NE redimensionner qu'un seul axe explicitement à la fin (en réutilisant la
dimension déjà calculée de l'autre axe, jamais une valeur arbitraire), PUIS figer le
mode sur cet axe. Deuxième piège, plus subtil : sur un conteneur `VERTICAL`,
`primaryAxisSizingMode` gouverne la **hauteur** (pas la largeur comme sur un
`HORIZONTAL`) — confondre les deux a cassé la largeur du variant Ouvert au premier
essai (ligne à 62px de large au lieu de 1550).

**Limite nommée pour l'adoption (T042)** : la hauteur de la boîte `Contenu` est
**fixe par construction** (`textAutoResize: NONE`, comme toutes les boîtes de texte
mesurées dans la source — chaque copie semble individuellement dimensionnée à la
main, pas un `lineHeight` partagé). Le défaut du master convient à une réponse 1
ligne ; au moins une occurrence réelle (`387:833`, Portes de garage industrielles)
mesure 136px au lieu de 80 — réponse sur 2 lignes. **Chaque adoption devra
redimensionner explicitement `Contenu` (et laisser le conteneur ré-hugger) pour les
occurrences à réponse longue** — nommé à l'avance, pas une surprise à l'adoption.

**Vérifié bout en bout** : instance de test avec les 4 propriétés à des valeurs
non-défaut (`Taille=Petit`, `État=Ouvert`, `Titre`/`Contenu` longs) → rendu correct,
capture de session ; instance supprimée après vérif.
`figma_analyze_component_set` confirme zéro erreur de configuration (leçon de
l'incident Field : toujours vérifier avant de clore).

**Checkpoint** : `003/accordion-row/master` (versionId `2379739404409995287`).
