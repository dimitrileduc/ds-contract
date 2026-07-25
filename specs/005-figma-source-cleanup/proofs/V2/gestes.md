# Gestes — cycle V2 (Devis, coquille 88→89)

## Geste 1 — T053 : Container, resize + recentrage automatique

```js
const container = await figma.getNodeByIdAsync('2096:2525');
container.resize(1550, container.height); // 1552 -> 1550
// x recalcule automatiquement 88 -> 89 par l'auto-layout du parent (counterAxisAlignItems: CENTER)
```

Relevé préalable (T051, `releves/structure-devis.json`) : `Devis` (`2096:2524`) porte
`counterAxisAlignItems: CENTER` sur son auto-layout VERTICAL — `Container` est son
seul enfant, déjà centré par le moteur (88 = (1728−1552)/2). Le recentrage après le
geste est **automatique**, confirmé live (`autoRecentered: true` retourné par l'appel
lui-même, sans écriture manuelle de `x`).

**Résultat mesuré : 9/9 `identical`, exit 0 — zéro pixel, y compris sur les 8 pages
qui instancient Devis** (confirmé : occurrence scannée live avant le geste, absent
seulement de Contactez-nous). **Ce n'est PAS ce que le plan annonçait** (bande ~1px +
2px de largeur) — traité honnêtement comme un **échec de prédiction** (`contracts/
proof-cycle.md` §3), pas requalifié en "conforme".

**Mécanisme (vérifié, pas supposé)** : `Container` a `fills: []` (aucun remplissage
propre — pur conteneur de mise en page). Son centre absolu ne bouge pas : avant
88+1552/2=864, après 89+1550/2=864 — identique au pixel, le recentrage +1/−2 étant
symétrique par construction. Ses deux enfants (`Titre` FIXED 900px, `Bouton` HUG,
tailles inchangées) sont eux-mêmes centrés dans `Container` et atterrissent donc au
même pixel absolu. Propagation maître→instance vérifiée directement sur une instance
réelle (Accueil, `I2096:2705;2096:2525`) après le geste : `x=89, width=1550`, zéro
override — le maître a bien propagé, ce n'est pas un artefact de lecture. La valeur
source (89/1550) est désormais correcte ; seule la prédiction de son empreinte pixel
était fausse (analogie invalide avec Header nav, dont le contenu n'est pas
symétriquement recentré).
