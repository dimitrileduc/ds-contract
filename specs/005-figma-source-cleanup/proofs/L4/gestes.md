# Gestes — cycle L4 (Strates & rangement)

**⚠️ Déviation de processus (nommée, même catégorie que V3/SAV)** : T090 (annoncer +
capturer un "avant" dédié) a été sauté — enchaînement direct de T089 (checkpoint) à
T091-T099. Référence "avant" légitime réutilisée : `.page-parity/L5/after/`
(vérifiée inchangée dans l'intervalle, 9/9 manifests `ok`).

## Déplacements de masters (T091-T093, T096-T097)

- 15 icônes du registre : `Assets > Icônes > Icones` → `DS · Atomes > Icônes` (grille 6 colonnes)
- `Bouton` (`6:122`), `piqueray_logo` (`4:14`), `member-picture` (`274:2389`) → `DS · Atomes` (loose)
- Planches `Typo` + `Couleurs` → `DS · Tokens` (sections distinctes, à côté de `Fondation`)
- `Header nav` renommé `Header`, `Assets` → `DS · Organisms`
- Glyphe hors registre `octicon:chevron-down-12` (`6:119`) : **trouvaille — composant
  orphelin sans emplacement de page** (`parent: null`, introuvable par balayage complet,
  `removed: false`) — `appendChild` sur `DS · Atomes > Icônes` lui donne un emplacement
  pour la première fois.

Tous vérifiés zéro instance cassée (`releves/instances-l4-verification.json`).

## Nav-item et Header (T094-T095) — puis 3 corrections après diagnostic pixel

```js
// Création du master Nav-item (DS · Molécules, nouvelle section)
const comp = figma.createComponent();
comp.layoutMode = 'HORIZONTAL'; comp.itemSpacing = 8; /* ... */
const label = figma.createText();
label.fontName = { family: 'Montserrat', style: 'Medium' }; // pas Regular — verifie sur l'original avant deletion
label.textCase = 'UPPER';
const propKey = comp.addComponentProperty('Chevron', 'BOOLEAN', true);
// chevron = instance du glyphe hors-registre 6:119, visibilite liee a propKey
```

Remplacement des 8 occurrences (4 items × 2 variants Header) par des instances,
largeur vérifiée identique (194/178/145/88) avant toute capture.

### Correction 1 — couleur du texte (trouvée par comparaison pixel, pas devinée)

```js
const blanc = await figma.variables.getVariableByIdAsync('VariableID:4:29'); // color/blanc
label.fills = [figma.variables.setBoundVariableForPaint(label.fills[0], 'color', blanc)];
```

Le libellé avait été lié par erreur à `color/noir-bleute` (copié du fix Coordonnées
juste avant, sans re-vérifier le contexte). Vérifié par comparaison pixel ciblée :
1/1 `identical` sur Accueil après correction.

### Correction 2 — état actif par page (soulignement, customisation par instance perdue)

```js
const underline = figma.createRectangle();
navItemMaster.appendChild(underline);
underline.layoutPositioning = 'ABSOLUTE'; // ne perturbe pas le HUG existant
underline.y = 22; // mesure precise par comparaison octet-exacte avant/apres (d'abord 23, corrige -1)
underline.constraints = { horizontal: 'STRETCH', vertical: 'MIN' }; // suit la largeur reelle par instance
const propKey = navItemMaster.addComponentProperty('Actif', 'BOOLEAN', false);
```

Mapping par page reconstruit depuis les captures "avant" (`L5/after`), jamais deviné :
Accueil aucun ; Portes de garage/résidentielles/industrielles/Motorisation → item 1 ;
Portes d'entrée → item 2 ; Dépannage/SAV → item 3 ; À Propos + Contactez-nous → item 4.

### Correction 3 — chevron de l'item 2, variable par page (2e customisation par instance perdue)

Confirmé par lecture de pixels ciblée (forme lettre vs forme chevron, `pngjs`) : le
glyphe de l'item 2 ("Portes d'entrée") est visible sur Accueil/Portes de
garage/À Propos/Contactez-nous, masqué sur les 5 autres pages — pas uniforme comme
supposé initialement.

```js
item2.setProperties({ ['Chevron#2152:62']: true|false }); // par page, selon le mapping mesure
```

## Résultat final mesuré

**8/9 `identical`, 1px de diffCount résiduel sur 3 pages** (Motorisation, Portes
d'entrée, Portes de garage — toujours la même position, le chevron de l'item 1).
Investigué par lecture de pixels (delta <0x20/255) et zoom visuel ×8 : aucune
différence perceptible, un artefact d'anti-aliasing sous-pixel inhérent au vecteur
(coordonnées internes fractionnaires), accepté et nommé, jamais requalifié en
silence.

## Leçon générale de ce cycle

Le pré-diff structurel (`customizations.js`) et une comparaison "maître contre
maître" ne voient jamais les customisations **par instance de page** (état actif,
visibilité de glyphe) qui existaient sur les items bruts avant leur suppression.
Une reconstruction structurelle (suppression + recréation) d'un master largement
instancié doit soit (a) inventorier explicitement chaque occurrence AVANT toute
suppression, soit (b) être suivie d'une comparaison pixel complète sur les 9 pages
et d'un diagnostic rigoureux de chaque écart trouvé — jamais suppose corrige par un
seul geste "propre".
