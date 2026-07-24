# Audit — Molécule Gallery-item (T065)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — bloc **inféré** (aucune ligne d'inventaire
dédiée à l'origine), localisé par la section « Réalisations » présente sur 3
maquettes, confirmé **27 occurrences exactement** au scan T0 (`dag.md` : « gallery-item
| *(inféré, à confirmer)* | 27 — CONFIRMÉ »). Re-vérifié live avant toute construction
(structure, tailles, fills) — les nodeIds transmis par la session précédente étaient
encore valides, mais la mesure live fait foi, jamais la note transmise.

## Usage — localisation (3 des 9 maquettes)

**27 occurrences, 3 maquettes** : `Portes d'entrée` (section `237:1066`), `Portes de
garage industrielles` (`387:787`), `Portes de garage résidentielles` (`230:614`) — un
bloc « Réalisations » identique sur chacune, frame enfant nommé `grid`, **9 tuiles
par grille** (`portes_habitat_6 1` à `9`), toutes `RECTANGLE`, `cornerRadius: 0`, fill
`IMAGE` (`scaleMode: FILL`, `scalingFactor: 0.5`, `imageTransform` identité).

**27 `imageHash` vérifiés un par un — tous distincts.** Contrairement à « Avis Google »
(Phase A, `audits/atomes-icones.md` §2 : un unique screenshot Trustindex recopié 8
fois, même `imageHash`), ici ce sont 27 vraies photos de chantier différentes — zéro
risque de widget tiers aplati, le bloc se nettoie normalement depuis la source.

| Tuile | Taille | Rôle |
|---|---|---|
| `portes_habitat_6 1` (1re de chaque grille) | 743×743 | tuile vedette |
| `portes_habitat_6 2` à `9` | 339,5×339,5 (mesure réelle — la spec de tâche arrondissait à 340) | tuiles standard |

## Piège Figma majeur — le layout `GRID` natif porte des propriétés par-enfant non héritées par une instance neuve

Le frame `grid` est en `layoutMode: 'GRID'` (le mode grille natif récent de Figma, pas
un auto-layout classique) : 4 colonnes (`FLEX`), 3 lignes (`HUG`), gap 64/64. Chaque
enfant y porte 4 propriétés propres : `gridRowAnchorIndex`, `gridColumnAnchorIndex`
(position dans la grille), `gridRowSpan`, `gridColumnSpan` (nombre de cellules
occupées) — c'est ce qui fait que la tuile 1 occupe un bloc 2×2 (743×743) pendant que
les 8 autres occupent chacune une cellule simple (339,5×339,5).

Une instance fraîchement créée (`component.createInstance()`) **n'hérite d'aucune de
ces 4 propriétés** — elle entre dans la grille avec un span 1×1 par défaut, et
`gridRowAnchorIndex`/`gridColumnAnchorIndex` se sont révélées **en lecture seule**
(`no setter for property`, testé directement) : impossible de les assigner à la
main. Premier remplacement (grille `Portes d'entrée`), fait tuile par tuile
(remplacer, réinsérer au même index, supprimer l'ancienne) : la tuile vedette a
atterri **hors de sa place** (repoussée en ligne 3, bbox `y=4296` au lieu de `y=3086`)
et le compteur de lignes du frame est passé silencieusement de 3 à 4 — signal visible
immédiatement en comparant les bbox avant/après (jamais fait confiance au retour
"succès" seul).

**Mécanisme réel, diagnostiqué en comparant les 2 grilles encore vierges
(`Portes de garage industrielles`/`résidentielles`) comme référence** : l'ancrage
(ligne/colonne) est **calculé automatiquement par un algorithme d'auto-flow au moment
de l'insertion** (balayage ligne par ligne des cellules libres, exactement comme
l'auto-placement CSS Grid), pas relu/recalculé en continu. `gridRowSpan`/
`gridColumnSpan` sont assignables, mais **seulement une fois le nœud déjà enfant de la
grille**, et seulement si son ancrage ACTUEL laisse la place — une valeur de span plus
grande ne redéclenche pas de nouveau placement, elle échoue simplement
(`Row span exceeds grid row count`) si l'ancrage existant ne convient pas. Résultat :
un span ne peut se poser correctement qu'au moment précis où le nœud est seul (ou le
premier) dans une grille vide.

**Correction appliquée** (grille 1 reconstruite, grilles 2/3 traitées propre du premier
coup) : pour chaque grille, (1) supprimer les 9 rectangles d'origine (fills déjà
capturés dans le ledger avant ce geste), (2) créer une instance fraîche `Taille=Grand`,
l'insérer seule dans la grille désormais vide → ancrage automatique ligne 0/colonne 0,
(3) lui poser `gridRowSpan=2`/`gridColumnSpan=2` immédiatement pendant qu'elle est
seule occupante, (4) créer et insérer les 8 instances `Taille=Petit` dans l'ordre — 
chacune contourne automatiquement le bloc 2×2 déjà réservé. Vérifié
**programmatiquement** avant toute capture : bbox absolue + ancrage + span des 27
nouvelles instances comparés un par un aux 27 rectangles d'origine — **zéro écart**,
sur les 3 grilles.

**Règle généralisable ajoutée** (nouvelle famille de piège, distincte du `GROUP` à
origine instable et du `resize()` bloqué sur enfant d'instance déjà connus cette
spec) : dans un frame `layoutMode: 'GRID'`, ne jamais remplacer les enfants un par un
en conservant les autres en place — vider entièrement la grille puis reconstruire
dans l'ordre, en réglant le span d'un enfant à span étendu **immédiatement après son
insertion en isolation**, avant d'ajouter le reste.

## Récapitulatif du master

| Élément | Détail |
|---|---|
| Nom | `Réalisation` (français — le nom de tâche « Gallery-item » reste un label interne, comme `Avantage`/Contact-info-row) |
| Variants | propriété `Taille` : `Grand` (743×743, tuile vedette) / `Petit` (339,5×339,5) |
| Structure | `COMPONENT_SET`, fill placeholder gris uni par défaut (chaque instance reçoit son image réelle à l'adoption — le placeholder du master n'a aucune signification) |
| Dépendances | aucune — fill `IMAGE` posé directement sur la racine du composant, zéro dépendance tierce |
| Page | `DS · Molécules`, section blanche dédiée `Réalisation` (placée sous les 11 sections existantes, zéro chevauchement vérifié programmatiquement) |
| nodeId | `COMPONENT_SET` `2095:2484` ; section `2095:2485` |

**Preuve** : pixel-diff **byte-exact sur les 3/3 maquettes concernées** — `identical`,
`0 diff`, sha256 identiques avant/après sur les 3 (`ef2f435499f5…`, `1b5cb7b16ede…`,
`9fdb57d22ffc…`), exit 0. Pas de limite de preuve à documenter cette fois : contrairement
aux molécules à 8-9 maquettes de cette phase, Gallery-item n'en a que 3 — toutes
capturées avant/après, aucun batch non mesuré. Ledger 27 entrées (`ledger/gallery-item.json`),
toutes `reportee` (fill image par instance), 0 `non-portable`, `pages:ledger:check` exit 0.
