# Census photos APRÈS — la passe de régénération des masters porteurs (T060/T061)

**Date** : 2026-08-06 · **Version Figma posée avant** : `016/R2-photos/avant`
(id `2384611619054562083`) · **Protocole** : un master à la fois — census des
`fills` IMAGE (hashes triés) → `specHash` effacé → amend → re-census → comparaison
de multiset. Toute photo manquante est reposée par `getImageByHash` AVANT de
passer au master suivant.

## Le relevé

| Master | Avant | Après | Perdues | Reposées | Note |
|---|---:|---:|---:|---:|---|
| `ds.hero` | 2 | 2 | 0 | 0 | `preservedImages` Background→Background |
| `ds.sav` | 2 | 2 | 0 | 0 | nœud renommé `imgGroup` par le nouveau plan, apparié |
| `ds.carte` | 2 | 2 | 0 | 0 | |
| `ds.coordonnees` | 1 | 1 | 0 | 0 | `scaleMode` CROP préservé |
| `ds.member-picture` | 4 | 4 | 0 | 0 | |
| `ds.member-card` | 2 | 2 | 0 | 0 | `unplacedImages` du rapport = fills de l'instance MemberPicture imbriquée, restés en place (prouvé par census) |
| `ds.equipe` | 32 | 32 | 0 | 0 | + reformation de la grille (wrap + largeur + gaps mintés, O-17) |
| `ds.product-card` | 1 | 1 | 0 | 0 | |
| `ds.realisation` | 0 | 0 | 0 | 0 | amendé (2 variantes rebuilt), aucun fill IMAGE |
| `ds.reassurances` | 13 | 12 → **13** | 1 | 1 | la 5e carte de la variante « 5 cartes » : perte STRUCTURELLE (le `repeat` n'a qu'un sample, 4 items) — carte reposée par clone + textes d'origine + photo `d62d8bf3…`, `getImageByHash` non nul vérifié |
| `ds.devis` | 1 | 1 | 0 | 0 | photo du CTA retrouvée et reposée plus tôt (O-13) |
| **Total** | **57** | **57** | **0** | **1** | |

## Ce que le relevé prouve — et ce qu'il ne prouve pas

**Prouvé** : la passe harvest/restore du moteur tient à l'échelle sur les masters
porteurs — 57 photos entrent, 57 sortent, aucune perte définitive. L'identité est
vérifiée par **hash**, pas seulement par présence : c'est la vérification que la
capture-avant (§X) ne couvre pas (elle couvre la perte, pas l'interversion).

**Non prouvé, nommé** : (1) l'appariement par nom-puis-ordre du moteur *pourrait*
intervertir deux photos de même taille dans un même master sans que le multiset de
hashes le voie — aucun cas relevé ici, mais le test n'exclut pas la classe ;
(2) **11 masters amendés**, pas 13 : `CategoriesPrincipales` et `ProduitsECommerce`
sont des sections CLIENT non gouvernées (aucun contrat, aucun script) — elles
portent des photos mais ne passent pas par la boucle ; c'est précisément l'objet du
défaut `D-016-SECTIONS-LOCALES-CARTES` au registre.

## Re-vérification

```bash
# via le pont figma-console, par master (marqueur ds_contracts/contractId) :
#   census = walk des fills type IMAGE → liste des imageHash triés
#   comparer avant / après amend ; tout écart de multiset = photo perdue ou interversion
```
