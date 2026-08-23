# Amendement — Réassurances : grille Fill 4/5, sans migration implicite

**Date** : 2026-08-23  
**Statut** : implémentation et qualification dépôt/Odoo/Figma terminées.  
**Portée** : `ds.reassurances`, dépendance `ds.carte`, composition de la page
Accueil Odoo. Les autres pages et variantes ne changent pas de nombre de colonnes.

## Constat vivant

Le contrôle direct du master Figma connecté (`Reassurances`, composant set
`2114:3721`) a mis en évidence que la variante `5 cartes` avait un root de
référence à `1550px`, mais une rangée `items` en horizontal/Hug à `1945,5px` :
`5 × 363,5 + 4 × 32`. Elle dépassait donc le conteneur de **395,5px**. La vue
recadrée et les textes hérités qui en résultent ne constituent pas une mise en
page à cinq colonnes.

Les variantes `4 cartes` et `QuatreCartesDeuxCta` restent des variantes à quatre
colonnes. Une largeur telle que `285px` est seulement le résultat de
`(largeur disponible − 4 gaps) / 5` au contexte observé ; elle n’est ni un
token de dimension actif, ni une règle de design.

## Décision actuelle

| Couche | Règle décidée |
|---|---|
| Contrat `ds.reassurances@1.3.0` | root et zone `items` en `Fill` ; grille native, 4 pistes par défaut et 5 seulement pour `disposition=5Cartes`. |
| Contrat `ds.carte@2.1.0` | la disposition `reassurance` remplit sa piste ; la disposition `categorie` conserve sa géométrie propre. |
| Figma | les trois variantes restent présentes : 4 / 4+2 CTA / 5. Le root de référence reste fixe à 1550px dans le component set ; la grille interne et ses cartes remplissent cette largeur, sans largeur fixe de carte. |
| Odoo | la composition Home fixe explicitement `5Cartes` et cinq cartes. Il n’existe pas de sélecteur libre de disposition dans le Builder. |
| Pages Odoo déjà sauvées | aucune migration structurelle automatique : une recomposition/remplacement explicite précède tout nouveau seed. |

La règle historique documentée le 2026-08-05 (correction de valeurs fixes
`364 → 363,5` et `285 → 284,4`) reste un fait historique dans ses reçus. Elle
n’est pas réécrite : cet amendement la remplace comme règle **courante**.

Le token Figma historique `size.reassurances.carte-cinq-cartes` reste une trace
de compatibilité non consommée dans le dépôt jusqu’à sa suppression par la
mutation Figma gouvernée. Le contrat ne le référence plus ; son maintien évite
de masquer le drift du master live avant cette opération.

## Compatibilité et non-régression visée

Les six usages Figma relevés sont : About (4), Entrance doors (4+2 CTA),
Industrial garage (4), Residential garage (4), Garage doors (5), Home (5).
La correction est donc par variante, jamais un basculement global de 4 vers 5.

Les protections machine ajoutées vérifient notamment :

- `4Cartes` et `quatrecartesdeuxcta` restent à quatre pistes ; seule `5Cartes`
  déclare cinq pistes ;
- seule `Carte[disposition=reassurance]` reçoit `Fill` ;
- Home porte exactement cinq cartes et `5Cartes` ;
- l’authoring Odoo n’expose pas de contrôle de disposition.

## Réparation Figma live — reçus Console MCP

Le Desktop Bridge de **Piqueray (Copy)** (`d9FYAUcqdcNtsuaMgLefvJ`) a servi à
modifier uniquement le master `Reassurances` (`2114:3721`), sans écriture
directe dans les Pages :

- capture avant du master : `items` en HORIZONTAL/HUG, dont 5 cartes sur
  1945,5px ;
- mutation des trois `items` : GRID, pistes FLEX, 4 / 4 / 5 colonnes, gaps
  32px, une seule rangée, cartes `FILL` ;
- capture après : les cinq cartes de la variante 5 remplissent exactement les
  1550px de référence (284,3999938964844px par piste — précision float32 Figma),
  sans rognage ;
- lecture des six instances : quatre restent à 4×363,5px, deux passent à
  5×284,3999938964844px ;
- seconde passe de vérification sans écriture : `alreadyConverged: true`.

`FIGMA_ACCESS_TOKEN` reste absent, mais n’est plus un bloqueur pour ce geste :
le Console MCP a opéré via le Desktop Bridge local et les captures sont issues
de son `exportAsync` runtime.

## Réception Odoo isolée

Instance jetable dédiée, jamais l’instance owner : projet
`pqr-reassurances-20260823`, base `pqr_reassurances_20260823`, port `8093`.

Après mise à jour de l’addon et recomposition de Home :

| Vue | largeur viewport | disposition | cartes / première rangée | overflow | largeur carte |
|---|---:|---|---:|---:|---|
| Home | 1728 | `5Cartes` | 5 / 5 | 0px | 284,39–284,41px |
| Home | 1440 | `5Cartes` | 5 / 5 | 0px | 226,80–226,81px |
| Harness Réassurances | 1728 | `4Cartes` | 4 / 4 | 0px | 363,5px |

Les deux rendus exposent `ds.reassurances@1.3.0` et le module
`piqueray_ds@19.0.1.11.0` avec le graph digest
`ae42045df6f98ea3d6921cd0d6147ca18a562722179f354c4b735057c3df367a`.

Portes finales : `npm run build`, `npm run parity`, `npm run plugin:check`,
`npx tsx scripts/deterministic-roundtrip.mjs`, `node scripts/core-browser-check.mjs`,
les deux `tsc`, et `npm run eval` (**223/223**) sont verts. Les portes Odoo
inputs/assets/authoring/module/typecheck/dérivation et le self-test visuel
Réassurances (**9/9**) sont également verts.

## Seed et suite obligatoire

Le seed a été produit depuis cette instance isolée après recomposition :
`db.dump` (2,58 MB) + `filestore.tar.gz` (9,35 MB). Il ne provient pas de
`piqueray-odoo-test`.

Dès qu’un `FIGMA_ACCESS_TOKEN` est disponible, exécuter la campagne Figma
   gouvernée de ce composant et joindre captures avant/après + no-op.
