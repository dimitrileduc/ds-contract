# Gestes — cycle L3 (Affordances zéro-pixel)

## Geste 1 — T037 : Product-card, propriété BOOLEAN `Bouton`

```js
const productCard = await figma.getNodeByIdAsync('2068:1972');
const hiddenBouton = await figma.getNodeByIdAsync('2068:1976');
const propKey = productCard.addComponentProperty('Bouton', 'BOOLEAN', false);
hiddenBouton.componentPropertyReferences = { ...hiddenBouton.componentPropertyReferences, visible: propKey };
```

Résultat : `Bouton#2136:61` (défaut `false`, matches l'état actuel — R7). Une première
tentative appelait `hiddenBouton.setProperties(...)` (mauvaise cible — cette méthode
lit les propriétés exposées PAR l'instance, pas un lien de visibilité venant du
parent) ; erreur détectée immédiatement (aucune écriture partielle conservée),
corrigée par assignation directe de `componentPropertyReferences`.

## Geste 2 — T038 : archive de Tab (destructif, préalable)

```js
let archivePage = figma.root.children.find(p => p.name === 'Archive · Spec A');
if (!archivePage) { archivePage = figma.createPage(); archivePage.name = 'Archive · Spec A'; }
const tab = await figma.getNodeByIdAsync('2061:1588');
const clone = tab.clone();
archivePage.appendChild(clone);
```

Page créée (`2136:5428`), clone du COMPONENT_SET complet posé (`2136:5429`) —
vecteurs intacts, pas une capture d'écran.

## Geste 3 — T039 : suppression du variant fantôme `État3`

```js
const etat3 = await figma.getNodeByIdAsync('2063:1603');
etat3.remove();
```

Confirmé non instancié nulle part avant suppression (0 occurrence sur les 9
maquettes) — zéro-pixel garanti par construction, pas seulement mesuré après coup.

## Geste 4 — T040 : member-picture, axe + valeurs

```js
const memberPicture = await figma.getNodeByIdAsync('274:2389');
memberPicture.editComponentProperty('Property 1', { name: 'État' });
for (const child of memberPicture.children) {
  const val = child.variantProperties && child.variantProperties['Property 1'];
  // (valeur lue AVANT le renommage de l'axe — le nom de la clé change, pas la valeur)
}
```

Axe `Property 1`→`État` ; valeurs `Default`→`Défaut`, `hover`→`Survol`.

**Résultat** : 9/9 `identical` dès la première tentative — aucun des pièges de L2
(casse/graisse/opacité par override d'instance) ne s'applique ici : aucun de ces 4
gestes ne touche une propriété de STYLE TEXTE ni de VARIABLE COULEUR, les deux
mécanismes identifiés comme risqués en L2.
