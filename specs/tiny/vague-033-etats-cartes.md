# Vague 033 — les trois cartes répondent au geste

**Date** : 2026-09-05 · **Branche** : `oceanic-oak` · **Décision owner** : A3 · B2 · C3, prise sur planche Figma.

## Ce qui a été livré

| Contrat | Version | Survol |
|---|---|---|
| `ds.carte-categorie` | 2.1.0 → **2.2.0** | voile noir 55 % **sous** le dégradé, style superposé uniquement |
| `ds.product-card` | 3.0.0 → **3.1.0** | `0 8px 24px rgba(0,0,0,.12)` sur la racine |
| `ds.review-card` | 4.0.0 → **4.1.0** | `0 12px 32px rgba(0,0,0,.20)` sur la racine |

Jetons : `color.noir-voile-55` (littéral, **primitives**), `shadow.etat.product-card.survol` et
`shadow.etat.review-card.survol` (`$type: string`, primitives, même forme que `decoration.etat.*` de
la vague 032), `color.etat.carte-categorie.voile-survol` (**alias, semantic**).

Le placement des couches n'est pas décoratif : un alias posé dans `primitives` est passé à `hexToRgb`
par le script de sync et peint une variable **NaN, en silence** — piège nommé par la vague 032, respecté ici.

## Mesures — page Odoo rendue, pas déduites

| | repos | survol |
|---|---|---|
| CarteCategorie (`contenuSuperpose`, background-color) | `rgba(0,0,0,0)` | `rgba(0,0,0,0.55)` |
| ProductCard (racine, box-shadow) | `none` | `0 8px 24px rgba(0,0,0,0.12)` |
| ReviewCard (racine, box-shadow) | `none` | `0 12px 32px rgba(0,0,0,0.20)` |

Contraste du texte de la CarteCategorie **au repos** : 17,3:1 (description), 18,3:1 (titre). AAA
commence à 7:1. **Le survol n'est donc pas une correction de lisibilité** — c'est un signal
d'interactivité, et c'est écrit dans le contrat pour qu'aucune relecture ne le justifie autrement.

## Les deux choses que la mesure a corrigées

**1. Une hypothèse tirée du code, démentie par l'exécution.** La lecture du CSS généré montrait la
bordure de `ds.review-card` dessinée en `box-shadow: inset 0 0 0 <w> <c>` ; on en a conclu qu'une
ombre de survol la remplacerait et ferait disparaître le contour. Le jeton a d'abord porté une couche
inset pour le re-déclarer, avec un `#F4F6FA` figé en dur. **Faux** : dès que le canal `box-shadow` est
utilisé par un état, l'émetteur bascule de lui-même la bordure en `border` réel. Relevé sur la page :
au repos `border: 1px solid rgb(244,246,250)`, `box-shadow: none`. Couche inset retirée.

*La lecture avait raison sur le mécanisme et tort sur la conséquence. Seule l'exécution a tranché.*

**2. L'effet de bord de ce basculement, quantifié — et il touche le repos.** Avec `border: 0` + ombre
inset, le 1px ne consommait pas de place ; avec un `border` réel en `border-box`, il en consomme. La
boîte extérieure de la carte ne bouge pas (posée par la grille, `width: 100%`) donc **rien ne se
décale dans la page**, mais la boîte de contenu passe de **198 à 196 px**. C'est le seul changement au
repos de la vague, il est inscrit dans le contrat, au même endroit que la phrase « le repos ne bouge
pas » des deux autres cartes.

## La limite qui a décidé de la forme

Le dégradé lui-même **ne peut pas varier par état** : il vit sur une part NON-racine
(`contenuSuperpose`), et le canal d'états d'une part non-racine n'accepte que de la couleur
(`PART_STATE_CHANNELS` : `color`, `background-color`, `border-color`). Accentuer ses arrêts au survol
aurait demandé d'élargir ce canal au `background-image` — modification d'émetteur touchant les 39
contrats. Écartée par l'owner au profit du voile. **Limite nommée, pas un oubli.**

## Canevas — geste d'écriture sur le fichier client

Trois masters amendés **en place**, sur la page « 031 · Planches de validation ».

| Master | avant | après | instances avant | instances après |
|---|---|---|---|---|
| `CarteCategorie` `2692:19667` | `Style=Superpose` | + `Etat=Defaut\|Survol` | **30** | **30** |
| `ReviewCard` `2731:9375` | `Avatar=Initiale\|Photo` | + `Etat=Defaut\|Survol` (4 variantes) | **66** | **66** |
| `ProductCard` `2693:21081` | COMPONENT simple | **COMPONENT_SET** `2763:10149`, axe `Etat` | **52** | **52** |

Méthode, et c'est ce qui protège les instances : les variantes existantes sont **complétées** au
défaut du nouvel axe (renommage, nœud et identifiant conservés), jamais recréées. Le composant
`2693:21081` devient la variante `Etat=Defaut` et **garde son identifiant** ; les 52 instances y
restent attachées. Comptes relevés avant et après chaque geste — c'est la §X appliquée aux instances,
pas seulement aux pixels.

4 variables créées : `color/noir-voile-55`, `shadow/etat/product-card/survol`,
`shadow/etat/review-card/survol` (Primitives) et `color/etat/carte-categorie/voile-survol` (Semantic,
alias de la première).

`contracts/product-card.contract.json` change d'ancre en conséquence :
`nodeId 2693:21081 → 2763:10149`, `componentSetKey` mis à jour.

## Ce qui reste ouvert, nommé

**`parity/snapshots/figma-components.json` et `figma-tokens.json` n'ont pas été rafraîchis.** Le
rafraîchissement passe par `parity/extract-figma.plugin.js` et le pont **figma-console**, tombé en
cours de session et jamais revenu. Les gestes canevas ci-dessus ont donc été faits par l'autre route
(MCP Figma officiel), qui sait écrire mais ne produit pas le cliché de parité.

Conséquence exacte : `npm run parity` compare le contrat à un **canevas périmé**. Les sept constats
ouverts par la vague sont acquittés par leur nom dans `parity/baseline.json` (40 → 47) — précédent
spec 015. Ils décriront la réalité **jusqu'au prochain rafraîchissement**, où ils devront être
**retirés** de la baseline, pas reconduits. C'est la dette de cette vague, et elle a un nom.

## Portes

`build` · `parity` · `eval` **248/248** · `plugin:check` · `roundtrip` · `geometry:gate` ·
`core-browser-check` · `tsc` (× 2) · les six portes `odoo:*` — toutes vertes.

Module `19.0.1.13.0 → 19.0.1.14.0`, `graphDigest` repiné, 5 miroirs suivis.

## Note de coordination

Une autre spec (**033 — pied de page contact**) travaillait dans le **même worktree** pendant cette
vague. Seuls les fichiers de cette vague ont été commités ; `models/website.py`, `views/footer.xml`,
`footer.authoring.json`, les scénarios QA du footer et `specs/033-*` sont restés intacts. L'entrée
« Recent Changes » de `CLAUDE.md` n'a **délibérément pas** été écrite, pour ne pas écraser la sienne :
à poser au merge.
