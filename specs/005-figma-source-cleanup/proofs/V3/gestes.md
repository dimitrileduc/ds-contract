# Gestes — cycle V3 (SAV, coquille 88→89 — le piège GROUP connu)

**⚠️ Déviation de processus nommée** : ces écritures ont eu lieu pendant l'exploration
en lecture seule du piège GROUP (T057), avant le checkpoint dédié (T056) et avant la
capture "avant" dédiée (T058) — voir `decisions.md` §V3 pour le détail complet et le
rattrapage effectué (référence "avant" = `.page-parity/V2/after/`, vérifiée inchangée
dans l'intervalle).

## Geste 1 — T059 : éviter resize() sur les GROUP, agir sur les feuilles

```js
// section (2108:3093) et row (2108:3095) sont des GROUP — leur bbox est TOUJOURS
// recalculee depuis leurs enfants ; resize() dessus scalerait tout leur contenu.
const bg = await figma.getNodeByIdAsync('2108:3094'); // RECTANGLE simple, feuille
bg.resize(1550, bg.height); // 1552 -> 1550, sans risque (pas d'enfants)

const row = await figma.getNodeByIdAsync('2108:3095'); // GROUP
row.x = 131; // translation RIGIDE (jamais resize()) — recentre sans deformer

// section (GROUP) recalcule alors seule sa bbox a (0,0,1550,677) — verifie live.

const root = await figma.getNodeByIdAsync('2108:3105'); // SAV, un COMPONENT (pas un GROUP)
root.resize(1550, root.height); // safe — pas d'effet de bord sur section/row/bg (relu, identique)
```

**Vérifications live à chaque étape** (avant de considérer le geste terminé) :
- `section` bbox après les 2 premières écritures : `(0,0,1550,677)` — exact, sans avoir
  touché `section` elle-même.
- Après le resize du root : `section`, `row`, `bg` relus **identiques** à l'étape
  précédente — aucun effet de bord.
- `imgGroup`/`wrapper`/`inner`/`img` (contenu de `row`) tous décalés de **exactement
  −1px** en x (translation rigide propagée), largeurs/hauteurs **inchangées**
  (647×561, 641×561, 546×365, 563×504) — zéro déformation du contenu.

**Résultat mesuré** : 8/9 `identical`, 1/9 `diff` (Accueil — seule maquette qui instancie
SAV, confirmé par comparaison des tailles d'octets sur les 9 captures avant/après).
`diffBox x=88,y=1672,w=1552,h=475`, `diffCount=7291` — conforme à l'annoncé (2px de
largeur). Crop vérifié à l'œil (`crops/Accueil.png`) : contour fin du bloc entier
(texte + photo) décalé de 1px, aucune perte ni déformation.

**Leçon générale (piège GROUP)** : ne jamais appeler `resize()` directement sur un
GROUP figma — sa bbox est toujours dérivée de ses enfants et un resize direct SCALE
tout son contenu proportionnellement (déforme photo/texte). Identifier la feuille
non-GROUP qui détermine réellement la dimension visée (ici un RECTANGLE de fond) et la
redimensionner elle ; pour re-centrer un GROUP, le **translater** (changer x/y), jamais
le redimensionner.
