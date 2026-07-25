# Audit — Molécule Tab (T043)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — `findAll(/tab/i)` sur les 9 maquettes puis
filtrage manuel des faux positifs (le regex matche aussi « comptabilité »,
« établissements » etc. dans des `TEXT` sans rapport). Inspection récursive complète
(padding, bordures par côté, police, couleur, letterSpacing/paragraphSpacing — leçon
Accordion-row appliquée dès le départ, pas découverte a posteriori).
**Inspiration structurelle** : `git show demo-51:contracts/tab.contract.json` — variant
`state: default | selected` (le sélectionné passe en semibold couleur accent — ici
c'est un soulignement, pas un poids de police différent, mesuré ci-dessous) ;
`tab-list.contract.json` (conteneur, slot `children` acceptant `ds.tab`).

## Usage — localisation par position (les 9 maquettes)

**Un seul site d'usage** : page **`Dépannage/SAV`**, conteneur `tabs` (`249:1613`,
juste au-dessus de l'accordéon Texte SEO déjà adopté) — **4 onglets, zéro ailleurs**.

| # | nodeId | Libellé | Bounds (abs) | Sélectionné |
|---|---|---|---|---|
| 1 | `251:1799` | Porte de garage | x12325,y835,w201,h41 | **oui** |
| 2 | `251:1806` | Porte d'entrée | x12558,y835,w181,h41 | non |
| 3 | `251:1808` | Portails | x12770,y835,w103,h41 | non |
| 4 | `251:1810` | Modes d'emploi PDF | x12906,y835,w236,h41 | non |

## Structure

### Conteneur `tabs` (non gouverné — zéro identité visuelle propre)

`HORIZONTAL`, `itemSpacing` 32, aucun padding, aucun fill, aucune bordure. Purement
un arrangement de mise en page — reconstruit à l'adoption comme une frame simple
tenant des instances Tab, pas un master séparé (cohérent avec le `row` de Field, lui
aussi non gouverné).

### Chaque `tab` (le master construit)

| Propriété | Valeur | Binding |
|---|---|---|
| `layoutMode` | `HORIZONTAL` | — |
| `padding` | 8 haut/bas, **0 gauche/droite** | — |
| `itemSpacing` | 10 (sans effet, 1 seul enfant) | — |
| Texte | `Montserrat SemiBold 20`, `lineHeight` PIXELS 25 | ✅ `color/noir-bleute` |
| **Bordure basse 2px** | **visible seulement si sélectionné** | ✅ `color/noir-bleute` — trouvée dès l'audit (leçon Accordion-row : toujours vérifier `strokes`/`strokeXWeight` par côté, jamais après coup) |

**Différence mesurée entre Défaut et Sélectionné** : uniquement la visibilité de la
bordure basse — la police reste `SemiBold` dans les deux états (contrairement au
contrat legacy qui bascule le poids ; ici la source ne le fait pas, mesuré pas supposé).

## Récapitulatif du master

| Élément | Détail |
|---|---|
| Nom | `Tab` |
| Variants | `État` (Défaut/Sélectionné) |
| Propriétés | `Libellé` (TEXTE, défaut `Onglet`) |
| Dépendances | aucune (zéro icône, zéro instance imbriquée) |
| Page | `DS · Molécules` |

**Dépendances DAG** : aucune. Pas de prérequis pour les 15 autres blocs.
