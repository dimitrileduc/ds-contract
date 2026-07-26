# Data Model — Source Figma propre avant extraction (spec 005)

**Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Cette itération ne produit **aucune structure de données de code** : pas de contrat, pas de
schéma, pas de token de dépôt. Les entités ci-dessous sont de deux natures — les objets de
la **source de design** que l'on transforme, et les objets de **preuve** que l'on produit et
committe. Les invariants sont ce que `/speckit.tasks` doit rendre vérifiables.

---

## 1 · Entités de la source de design

### Master

Un `COMPONENT` ou `COMPONENT_SET` du fichier `Piqueray (Copy)`.

| Champ | Nature | Règle de cette itération |
|---|---|---|
| `nodeId` | identité stable | **Ne change jamais**, y compris au déplacement de page (R12) |
| `key` (set) | identité stable | Idem — c'est l'ancre du seul contrat concerné |
| `name` | texte | Décrit un rôle, jamais un contenu (FR-002) ; pas de collision avec un calque interne (FR-005) |
| `description` | texte | **Non vide à la clôture**, pour les 52 existants comme pour les 3 net-new (FR-010, SC-003) |
| `page` (strate) | appartenance | `DS · Atomes` \| `DS · Molécules` \| `DS · Organisms` \| `DS · Tokens` — **plus jamais `Assets`** (FR-035) |
| `axes[]` | axes de variant | Aucun `Property 1` résiduel (FR-003) ; un état interactif porte un axe d'état nommé (FR-009) |
| `axes[].values[]` | valeurs | Orthographe et accentuation cohérentes avec le fichier (FR-004) |
| `children[]` | calques | Aucun `Vector`, `Vector (Stroke)`, `Group N`, `Frame N`, `Text`/`text` (FR-001) |
| `hiddenChildren[]` | calques masqués | Chacun piloté par une propriété explicite, sinon retiré (FR-007) |

**Population** : 52 au départ (37 décrits / 15 vides), **55** à la clôture — `+ Nav-item`,
`+ Header` (éclatement, FR-037), `+ Hero vidéo` (FR-024), les trois **nés décrits**.

**Transitions d'état** — un master de cette itération traverse au plus :
`nommé → décrit → gouverné (variables/styles) → géométrie corrigée → rangé à sa strate`.
Chaque transition est un geste ; aucune n'est réversible sans point de version.

**Cas particuliers nommés** :
- **Bouton (`6:122`)** — seul master sous contrat. Son axe et sa valeur fautive sont
  corrigés **dans la source**, le contrat `ds.button` est laissé faux et la divergence est
  écrite (FR-039). Il reçoit aussi sa description ici (Assumptions amendées).
- **`octicon:chevron-down-12` (`6:119`)** — master **hors registre**, détaché du canvas,
  instancié ×4 par Header nav. **Déplacé, jamais supprimé** (FR-038) ; sa description le
  marque hors registre ; sa décision voyage avec le contrat Header en Spec B.

### Page maquette

L'une des **9 pages de rendu** (page `Pages`, `210:325`) — le **juge**, jamais la matière.

| Invariant | Portée |
|---|---|
| Aucune maquette n'est éditée directement | sauf les 2 gestes qui les touchent nommément : adoption Section-header ×6 et componentisation du hero vidéo (P5) |
| Toute mutation les capture **toutes les 9** avant | jamais un pilote (règle before-capture) |
| Une capture vide ou mal dimensionnée arrête le cycle | avant comparaison, pas au moment de comparer |

### Strate

Le niveau d'un master dans le système : **brique** (atome) → **assemblage de briques**
(molécule) → **bloc de page** (organism), plus la planche de référence (tokens).

**Invariant terminal** : la page `Assets` **n'existe plus** (FR-035) et les **18 icônes
physiques** vivent sur une seule page (FR-036) — 15 rapatriées d'`Assets` + les 3 sociales
déjà sur `DS · Atomes`.

### Style de texte / variable de couleur

Les porteurs des valeurs répétées. Une valeur **atteint le seuil de gouvernance à 3
occurrences comptées dans les masters** (jamais dans les instances — R8).

| Cas | Geste | Interdit |
|---|---|---|
| Valeur en dur **strictement égale** à une variable existante | la lier (FR-013) | — |
| Valeur nouvelle, **≥ 3** occurrences | **ajouter** une variable (FR-014) | la remplacer par une variable existante voisine |
| Valeur **< 3** occurrences | laisser littérale (FR-012) | la normaliser en silence |

Les variables et styles créés le sont **côté source uniquement** ; leur reprise dans
`tokens/*.tokens.json` appartient à la Spec B (précédent : `color/rouge`, 003).

---

## 2 · Entités de preuve

### Geste

L'unité atomique d'écriture. Porte **avant exécution** : sa cible (`nodeId`), son mécanisme,
et son **diff attendu**.

### Diff attendu

La prédiction **écrite avant** le geste : `aucun pixel` | `bande de ~N px sur telle zone` |
`différence visible sur telles maquettes`. Le verdict compare l'observé à cette prédiction —
et **un écart plus petit que prévu est un échec de prédiction**, pas une bonne surprise
(edge case de la spec). On ne valide jamais parce que « c'est joli ».

### Lot

Un ensemble de gestes partageant **le même diff attendu** et mesurés par **un seul** cycle.
- Les gestes **sans effet visuel** sont groupés en lots (FR-030).
- Les gestes **à effet visuel** ont chacun leur cycle (FR-030) — un dépassement de budget ne
  se rattrape **jamais** en en fusionnant deux (SC-009).
- Un lot annoncé 0 qui rend ≠ 0 est **annulé en entier**, cause identifiée avant reprise
  (FR-029).

### Cycle de preuve

`capture avant (9 pages) → geste(s) → capture après (9 pages) → score par page → crops →
verdict`. Unité de cadence. **Budget : 12 + 1 étalonnage** (R3).

| Verdict par page | Signification | Exit |
|---|---|---|
| `identical` | 0 pixel hors bruit AA | 0 si 9/9 |
| `diff` | écart mesuré et localisé (`diffBox`) | 1 |
| `capture-failed` / `dimension-mismatch` | **la preuve n'a pas eu lieu** | 2 |

Le code 2 n'est **jamais** dégradé en « identique » : une capture vide n'est pas la preuve
que rien n'a bougé.

### Version enregistrée

Un point nommé `005/<passe>/<étape>` dans l'historique natif, posé **avant chaque grosse
passe** (FR-040). C'est le seul ancrage qui rend l'état antérieur atteignable une fois la
mutation faite — et c'est lui que le rapport cite. **Une passe qui démarre sans point de
version est arrêtée.**

### Page d'archive

`Archive · Spec A` — reçoit un **clone vectoriel** (jamais une image) avant chaque geste
destructif : suppression du variant `État3` de Tab, reconstruction du Footer. Supprimée en
clôture, avec sa propre preuve que les 9 pages restent identiques (SC-012).

### Enregistrement de geste (le quadruplet)

Ce que `RAPPORT-CLOTURE.md` porte **pour chaque geste** — schéma en
[contracts/gesture-record.md](./contracts/gesture-record.md) :

1. le **triptyque** avant / après / différence ;
2. le **lien de l'élément** avant **et** après ;
3. l'**identifiant de la version** enregistrée avant la passe ;
4. une **explication courte** de ce qui a été fait et pourquoi.

Un geste sans son quadruplet est un geste **non prouvé** (SC-015).

### Divergence nommée

Un écart connu entre la source et le dépôt, **écrit** au rapport avec sa réparation
attendue. Deux sont ouvertes volontairement ici :

| Divergence | Ouverte par | Réparation |
|---|---|---|
| `ds.button` : `bindings.figma` porte `"property": "Property 1"` et `"outilneNoir": "Outilne noir"`, la source ne les porte plus | FR-039 | Spec B — bump **majeur** (une valeur de variant renommée) |
| Master hors registre `octicon:chevron-down-12` conservé et instancié ×4 | FR-038 | Spec B — l'adopter au registre, ou le remplacer |

**Une divergence nommée est un livrable ; la même divergence tue si elle est silencieuse.**
Une divergence ouverte et non écrite bloque la clôture (SC-017).

### Relevé

Un scan **lecture seule, par position, jamais par nom**, publié avant le lot qu'il gouverne :

| Relevé | Publié avant | Sert de |
|---|---|---|
| `releves/perimetre-<date>.json` | L1 | dénominateur de SC-002 (les noms à corriger) |
| `releves/regle-3x-<date>.json` | L2 | verdict mécanique ≥3 / <3 et liste des valeurs laissées littérales (SC-011) |
| `releves/structure-<cible>.json` | chaque geste géométrique | détection **avant écriture** du piège GROUP (edge case de la spec) |
| pré-diff `customizations.js` | L5 | décide si une adoption reste dans le lot 0-px ou sort en cycle propre |

---

## 3 · Invariants transverses (ce que /speckit.tasks doit rendre vérifiable)

1. **Aucun geste sans diff annoncé avant.** (FR-028, SC-008)
2. **Aucune passe sans version enregistrée avant.** (FR-040, SC-016)
3. **Aucune mutation sans capture avant sur les 9 pages, vérifiées non vides.** (FR-026)
4. **Aucun geste destructif sans clone vectoriel préalable.** (FR-031)
5. **Aucun lot 0-px qui rend ≠ 0 n'est validé** — STOP + annulation, cause avant reprise. (FR-029)
6. **Aucune écriture dans le dépôt** hors la généralisation de regex nommée en Complexity
   Tracking : ni contrat, ni composant généré, ni token. (FR-033)
7. **Aucun déplacement de master ne casse d'instance** — vérifié master par master, jamais
   supposé. (FR-041, SC-014)
8. **Aucune valeur sous le seuil 3× normalisée en silence** — laissée **et** listée. (FR-012, SC-011)
9. **Un seul fix design** sur toute l'itération : le soulignement de `Défaut` du Tab, isolé
   dans son cycle, validé sur crop, jamais présenté comme zéro-pixel. (FR-015a)
10. **Aucune dégradation, limite ou divergence non écrite au rapport.** (FR-032, SC-010, SC-017)
