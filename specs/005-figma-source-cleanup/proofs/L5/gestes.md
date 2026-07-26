# Gestes — cycle L5 (Section-header ×6 adoption — réduit à 0/6 — + Hero vidéo)

## Tentative 1 (annulée) — Coordonnées, adoption Section-header

```js
const titresFrame = await figma.getNodeByIdAsync('2104:2880'); // "Titres" (instance live)
const standardMaster = await figma.getNodeByIdAsync('2090:2385'); // Section-header Standard
const inst = standardMaster.createInstance();
// ... positionné à bounds.x/y, resize(bounds.width, ...) sur l'INSTANCE (a marché : 480)
const accroche = inst.findOne(n => n.name === 'Accroche');
const titre = inst.findOne(n => n.name === 'Titre');
accroche.resize(bounds.width, accroche.height); // PAS marché : largeur restée 1550
titre.resize(bounds.width, titre.height);        // idem
```

**Résultat mesuré (capture ciblée + `pages:compare`, avant tout diff 9 pages)** :
`diffCount=2319`, `diffBox` exactement la zone du titre. **Cause identifiée, pas
supposée** : `Accroche`/`Titre` de Section-header sont des enfants `layoutSizingHorizontal:
FIXED` **hérités du maître** (1550px) avec `textAlignHorizontal: CENTER`. Redimensionner
l'INSTANCE elle-même (480px) fonctionne ; mais ses enfants FIXED ne suivent pas
automatiquement, et une seconde tentative de resize direct sur ces enfants — d'abord
`resize()`, puis `resizeWithoutConstraints()` — **a échoué silencieusement les deux fois**
(relu après coup : toujours 1550 de large, toujours `x=-535`, le centrage automatique de
l'auto-layout de l'instance autour d'une boîte trop large). **Limite confirmée de l'API
Plugin** : un enfant `FIXED` hérité du maître n'est pas redimensionnable au niveau d'une
INSTANCE — seule l'édition du maître le permettrait (hors périmètre).

**Repli — reconstruction fidèle, vérifiée pixel-exacte** :

```js
const newFrame = figma.createFrame();
newFrame.name = 'Titres'; newFrame.layoutMode = 'VERTICAL'; newFrame.itemSpacing = 8;
newFrame.fills = []; newFrame.resize(480, 83);
const contact = figma.createText();
contact.fontName = {family:'Montserrat', style:'Regular'}; contact.characters = 'Contact';
contact.fontSize = 20; contact.textCase = 'UPPER';
contact.letterSpacing = {unit:'PERCENT', value:15}; contact.lineHeight = {unit:'PIXELS', value:25};
contact.textAlignHorizontal = 'LEFT'; contact.resize(480, 25);
// même traitement pour "Nos coordonnées" (40px, casse ORIGINAL, letterSpacing 0%, lineHeight 50)
// même variable de couleur (VariableID:5:40) que l'Accroche/Titre de Section-header
```

Comparé à la capture "avant" sauvegardée (avant toute tentative) : **1/1 `identical`,
byte-length exactement égal (2206409)**. La reconstruction est indiscernable de
l'original — confirme au passage que l'original ÉTAIT bien une copie fidèle du style
Section-header (mêmes police/taille/casse/espacement/couleur), simplement alignée à
gauche et dimensionnée à sa vraie colonne, jamais une instance réelle.

## Formulaire — non tenté, raisonné à partir de la limite confirmée

Même maître, mêmes enfants `FIXED`, même mécanisme de centrage automatique, une colonne
encore plus étroite (759px vs 1550px du maître). La limite venant d'être confirmée
empiriquement sur Coordonnées, répéter le geste destructif-puis-annulé sur Formulaire
n'aurait rien appris de plus — juste consommé un second aller-retour inutile sur le
fichier live. Laissé en titre fait-main, raison identique nommée dans `decisions.md`.

## Geste retenu — T085 : Hero vidéo, componentisation en place

```js
const frame = await figma.getNodeByIdAsync('210:330'); // "Hero video" FRAME sur Accueil
const component = figma.createComponentFromNode(frame); // promotion de type pure
component.description = "Hero vidéo — bandeau plein écran de l'accueil (1728×720)...";
component.name = 'Hero vidéo';
```

Position/enfants/taille inchangés par construction (`createComponentFromNode` ne fait
que promouvoir le type). Parent (`Hero et catégories`) inchangé — confirme qu'aucune
fusion avec le bloc catégories suivant n'a eu lieu (question déjà close par l'audit
003 `hero-et-categories.md`, re-vérifiée en passant).

## Résultat mesuré (lot complet)

**9/9 `identical`, exit 0** — conforme à la prédiction 0-pixel. Coordonnées revenu
byte-identique (vérifié, pas supposé), Formulaire jamais touché, Hero vidéo = promotion
de type pure sans effet visuel.

## Leçon générale

Le pré-diff structurel (`customizations.js`) ne compare que le TEXTE et la STRUCTURE
enfant-par-enfant — il ne voit ni la largeur de conteneur réelle, ni l'alignement du
texte. Une correspondance structurelle "propre" au pré-diff n'est pas une garantie
d'adoptabilité : il faut aussi vérifier le CONTEXTE (largeur disponible) et tester le
geste réellement avant de le capturer sur les 9 pages, surtout quand le lot est
annoncé 0-pixel (où tout écart imprévu déclenche un STOP total, FR-029).
