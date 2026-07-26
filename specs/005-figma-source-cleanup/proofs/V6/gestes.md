# Gestes — cycle V6 (Footer, reconstruction complète)

## Geste 1 — T078a : remplacement des icônes brutes

```js
const social = await figma.getNodeByIdAsync('2120:4774'); // "Réseaux sociaux" FRAME
const oldFb = await figma.getNodeByIdAsync('2120:4775'); // Facebook GROUP
const oldIg = await figma.getNodeByIdAsync('2120:4777'); // Instagram GROUP
const fbMain = await figma.getNodeByIdAsync('2053:1259'); // atome gouverné
const igMain = await figma.getNodeByIdAsync('2053:1261');
const newFb = fbMain.createInstance();
const newIg = igMain.createInstance();
social.insertChild(social.children.indexOf(oldFb), newFb);
social.insertChild(social.children.indexOf(oldIg) + 1, newIg);
oldFb.remove();
oldIg.remove();
```

Le HORIZONTAL HUG de `Réseaux sociaux` a repositionné les 2 nouvelles instances
exactement aux mêmes coordonnées que les GROUP supprimés (32×31.857 à x=0,
32×32 à x=48) — vérifié par lecture immédiate.

## Geste 2 — T078b : conversion en auto-layout (avec correction en direct)

**Première tentative** — `footer.layoutMode = 'VERTICAL'` seul :

```js
footer.layoutMode = 'VERTICAL';
```

**Résultat immédiat (lu, pas supposé)** : les 4 enfants dans l'ordre du DOM
(Background, Copyright, Separator, Row) se sont empilés naïvement — Copyright à
y=459, Separator ET Row tous deux à y=483 (chevauchement, puisque Separator a une
hauteur de 0). Mauvais ordre, mauvais résultat. Corrigé dans la même session, avant
toute capture :

```js
// Background sort du flux, reste plein-bord.
bg.layoutPositioning = 'ABSOLUTE';
bg.x = 0; bg.y = 0; bg.resize(1728, 459);

// Réordonnancement : Row, spacer(121), Separator, spacer(27), Copyright.
footer.insertChild(0, bg);
footer.insertChild(1, row);
const spacer1 = figma.createFrame();
spacer1.name = 'Spacer'; spacer1.resize(1, 121); spacer1.fills = [];
footer.insertChild(2, spacer1);
footer.insertChild(3, separator);
const spacer2 = figma.createFrame();
spacer2.name = 'Spacer'; spacer2.resize(1, 27); spacer2.fills = [];
footer.insertChild(4, spacer2);
footer.insertChild(5, copyright);

// Reglages de la racine.
footer.paddingTop = 128; footer.paddingBottom = 32;
footer.paddingLeft = 89; footer.paddingRight = 89;
footer.itemSpacing = 0; footer.counterAxisAlignItems = 'MIN';

// Sizing par enfant.
separator.layoutSizingHorizontal = 'FILL'; // -> 1550 automatique, LA coquille
row.layoutSizingHorizontal = 'FIXED';       // garde sa propre largeur (1385)
copyright.layoutSizingHorizontal = 'HUG';   // se dimensionne a son texte
spacer1.layoutSizingHorizontal = 'FILL';
spacer2.layoutSizingHorizontal = 'FILL';
```

**Technique des spacers** : les écarts réels ne sont PAS uniformes (121px entre Row
et Separator, 27px entre Separator et Copyright) — un `itemSpacing` unique ne peut
pas les reproduire tous les deux. Deux FRAME invisibles (`fills: []`), hauteur fixe,
insérées entre les vrais enfants, avec `itemSpacing: 0` partout : technique sûre,
ne dépend d'aucune capacité d'espacement par-paire incertaine de l'API.

## Incident découvert et corrigé en direct — contraintes héritées sur Background

Après la conversion, `Background` (RECTANGLE) affichait `height: 1395.238` au lieu
de 459 (lu, pas supposé correct). Cause : ses contraintes legacy
`{horizontal: SCALE, vertical: SCALE}` (vestige du `layoutMode: NONE` d'origine) ont
fait grossir le rectangle proportionnellement pendant les recalculs de hauteur
intermédiaires de Footer (HUG) au fil des éditions successives.

```js
bg.constraints = { horizontal: 'MIN', vertical: 'MIN' };
bg.resize(1728, 459);
bg.x = 0; bg.y = 0;
```

**Leçon générale** : une RECTANGLE/FRAME héritée d'un ancien `layoutMode: NONE` peut
porter des contraintes `SCALE` qui redeviennent actives et perturbent le rendu dès
que son parent devient auto-layout et que sa propre hauteur (HUG) change plusieurs
fois pendant une même passe d'édition — toujours relire les dimensions APRÈS coup,
jamais les supposer stables juste parce qu'elles ont été explicitement `resize()`-ées
plus tôt dans le même script.

## Vérification exhaustive finale (avant toute capture)

Chaque enfant top-level ET chaque descendant interne relu et comparé à l'état
d'origine (capturé avant le geste) :

| Nœud | Avant | Après | Écart |
|---|---|---|---|
| Row | x=89,y=128,w=1385,h=127 | identique | 0 (D4 : déjà correct) |
| Separator | x=88,w=1552 | x=89,w=1550 | coquille voulue |
| Copyright | x=88 | x=89 | coquille voulue |
| Col 5, Footer-column ×3, Col 1 | — | identiques | 0 |
| piqueray_logo, Bouton | — | identiques | 0 |
| Facebook/Instagram (contenu interne) | GROUP 32×31.857 / 32×32 | INSTANCE mêmes tailles/positions | 0 (échange sans déplacement) |

**100% des positions/tailles identiques au pixel près, sauf la coquille elle-même.**

## Résultat mesuré

9/9 `diff`, `diffBox x=88,w=1552,h=248-249`, `diffCount` 2363-2380 **quasi-identique
sur les 9 pages** (Footer est global au site, même geste partout). Conforme à
l'annoncé (bande aux bords + 2px de largeur). Crop vérifié à l'œil
(`crops/Accueil.png`) : contenu du footer visuellement identique, aucune perte ni
déformation, les icônes (désormais instances) rendent à l'identique des anciens
vecteurs bruts.
