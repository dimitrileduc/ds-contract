# Gestes — cycle L1 (Noms & descriptions)

Scripts transcrits verbatim, exécutés via `figma_execute` (T012–T018). Zéro-pixel
par construction — aucun des deux gestes ci-dessous ne touche à la géométrie,
au fill/stroke rendu, ou au contenu texte affiché sur les 9 maquettes.

## Geste 1 — renommages T012-T018 (65 renommages, 0 erreur)

```js
await figma.loadAllPagesAsync();
const renamed = [];
const errors = [];

const rename = async (nodeId, newName) => {
  try {
    const n = await figma.getNodeByIdAsync(nodeId);
    if (!n) { errors.push({ nodeId, error: 'introuvable' }); return; }
    const before = n.name;
    n.name = newName;
    renamed.push({ nodeId, before, after: n.name });
  } catch (e) {
    errors.push({ nodeId, error: String((e && e.message) || e) });
  }
};

// T012 : 18 masters d'icônes (25 renommages) — enfants "Vector"/"Vector (Stroke)"/"Group" → "Tracé"/"Tracé composé"/"Tracé N"
await rename('2053:1258', 'Tracé');           // Facebook
await rename('2053:1260', 'Tracé');           // Instagram
await rename('2053:1262', 'Tracé');           // Étoile
await rename('274:2935', 'Tracé composé');    // piqueray (icône) — Group 2
await rename('274:2933', 'Tracé');            // piqueray (icône) — Vector (Stroke)
await rename('263:2122', 'Tracé composé');    // mail — Group
await rename('263:2126', 'Tracé 1');
await rename('263:2127', 'Tracé 2');
await rename('263:2119', 'Tracé');            // phone
await rename('230:601', 'Tracé');             // download
await rename('230:582', 'Tracé composé');     // pdf — Group
await rename('230:590', 'Tracé 1');
await rename('230:591', 'Tracé 2');
await rename('95:253', 'Tracé');              // search
await rename('95:213', 'Tracé composé');      // user — Group
await rename('95:217', 'Tracé 1');
await rename('95:218', 'Tracé 2');
await rename('274:3768', 'Tracé');            // chevron-right
await rename('274:3763', 'Tracé');            // chevron-left
await rename('274:3753', 'Tracé');            // chevron-down
await rename('274:3748', 'Tracé');            // chevron-up
await rename('274:3733', 'Tracé');            // cart
await rename('6:103', 'Tracé');               // arrow-right
await rename('6:98', 'Tracé');                // arrow-left
await rename('274:3747', 'Tracé');            // external-link

// T013 : piqueray_logo (4:14) — 18 enfants "Vector"→"Tracé", 2 "Text"→"Texte", axe "Property 1"→"Couleur"
const logoChildren = ['4:3','4:5','4:6','4:7','4:8','4:9','4:10','4:11','4:12','4:16','4:18','4:19','4:20','4:21','4:22','4:23','4:24','4:25'];
for (const id of logoChildren) await rename(id, 'Tracé');
await rename('4:4', 'Texte');
await rename('4:17', 'Texte');

const logo = await figma.getNodeByIdAsync('4:14');
const logoAxisBefore = Object.keys(logo.componentPropertyDefinitions);
logo.editComponentProperty('Property 1', { name: 'Couleur' });
renamed.push({ nodeId: '4:14', gesture: 'axe', before: logoAxisBefore, after: Object.keys(logo.componentPropertyDefinitions) });

// T014 : Header nav (84:285) — axe "Property 1"→"Fond" (géométrie/split : hors périmètre ici)
const headerNav = await figma.getNodeByIdAsync('84:285');
const navAxisBefore = Object.keys(headerNav.componentPropertyDefinitions);
headerNav.editComponentProperty('Property 1', { name: 'Fond' });
renamed.push({ nodeId: '84:285', gesture: 'axe', before: navAxisBefore, after: Object.keys(headerNav.componentPropertyDefinitions) });

// T015 : Bouton (6:122) — axe "Property 1"→"Style" + faute "Outilne noir"→"Outline noir" (rien d'autre — FR-039)
const bouton = await figma.getNodeByIdAsync('6:122');
const boutonAxisBefore = Object.keys(bouton.componentPropertyDefinitions);
const outilneNoirChild = bouton.children.find(c => c.variantProperties && c.variantProperties['Property 1'] === 'Outilne noir');
const outilneNoirId = outilneNoirChild ? outilneNoirChild.id : null;
bouton.editComponentProperty('Property 1', { name: 'Style' });
renamed.push({ nodeId: '6:122', gesture: 'axe', before: boutonAxisBefore, after: Object.keys(bouton.componentPropertyDefinitions) });
if (outilneNoirId) {
  await rename(outilneNoirId, 'Style=Outline noir');
} else {
  errors.push({ nodeId: '6:122', error: 'variant "Outilne noir" introuvable avant renommage axe' });
}

// T016 : Hero (2111:3382) — "Text"→"Bloc texte", titre tiré du contenu→"Titre", sous-titre (bonus, même défaut)→"Sous-titre"
await rename('2111:3376', 'Bloc texte');
await rename('2111:3378', 'Titre');
await rename('2111:3380', 'Sous-titre');

// T017 : Réalisations (2117:4691) — valeur de variant "Presentation"→"Présentation" (trouvé dynamiquement par variantProperties,
// jamais par nom) + le calque interne "Présentation" en collision (2117:4676, confirmé enfant du variant En-tête=Présentation,
// wrappe le titre + un "wrapper") → "Bloc en-tête"
const realisations = await figma.getNodeByIdAsync('2117:4691');
const presentationVariant = realisations.children.find(c => c.variantProperties && c.variantProperties['En-tête'] === 'Presentation');
if (presentationVariant) {
  await rename(presentationVariant.id, 'En-tête=Présentation');
} else {
  errors.push({ nodeId: '2117:4691', error: 'variant "Presentation" introuvable' });
}
await rename('2117:4676', 'Bloc en-tête');

// T018 : défauts locaux restants confirmés par releves/perimetre-2026-07-25.json
await rename('2104:2894', 'Réseaux sociaux');  // Coordonnées — Frame 8 (confirmé : wrappe Facebook+Instagram, mêmes dims que Footer)
await rename('2115:4161', 'Décor');            // Catégories principales — Vector
await rename('2115:4169', 'Décor');            // Catégories principales — Vector
await rename('2115:4164', 'Bloc texte');       // Catégories principales — "text" (trouvé par le relevé, au-delà de l'audit)
await rename('2115:4172', 'Bloc texte');
await rename('2115:4248', 'Bloc texte');
await rename('2120:4774', 'Réseaux sociaux');  // Footer — Frame 8
await rename('2120:4775', 'Facebook');         // Footer — Group 7 (x=-682, dims 32×31.857 = Facebook, confirmé live)
await rename('2120:4776', 'Tracé');            // Footer — Vector dans Group 7
await rename('2120:4777', 'Instagram');        // Footer — Group 6 (x=-634, dims 32×32 = Instagram, confirmé live)
await rename('2120:4778', 'Tracé');            // Footer — Vector dans Group 6

return { renamedCount: renamed.length, errors };
```

**Résultat** : 65 renommages, **0 erreur**. Détail complet dans `decisions.md` §L1.

## Geste 2 — vérification de survie des instances (T022)

Spot-check sur 14 instances (Bouton ×6, arrow-right ×6, sur `Accueil`) via
`getMainComponentAsync()` + lecture de `variantProperties`/`componentProperties` :
100 % résolvent, toutes les clés de propriété personnalisée (`Icône gauche#…`,
`Glyphe gauche#…`, `Libellé#…`) intactes, l'axe renommé `Style` se lit
correctement sur chaque instance (y compris `"Style":"Outline noir"` — la
faute corrigée se propage). Lecture seule, aucune écriture.

## Geste 3 — 15 descriptions (T019-T021)

Textes rédigés par workflow multi-agent (2 corrections après vérification live
— voir `decisions.md` §T019-T021), écrits par nom live confirmé avant chaque
affectation (`node.name !== attendu` → refus) :

```js
await figma.loadAllPagesAsync();
const DESCRIPTIONS = [
  { nodeId: "6:122", name: "Bouton", description: "…527 caractères, voir decisions.md…" },
  { nodeId: "4:14", name: "piqueray_logo", description: "…" },
  { nodeId: "84:285", name: "Header nav", description: "…" },
  { nodeId: "274:2389", name: "member-picture", description: "…" },
  { nodeId: "2063:1622", name: "Carte", description: "…" },
  { nodeId: "2068:1972", name: "Product-card", description: "…" },
  { nodeId: "2074:2072", name: "Member-card", description: "…" },
  { nodeId: "2077:2191", name: "Carousel-controls", description: "…" },
  { nodeId: "2079:2246", name: "Footer-column", description: "…" },
  { nodeId: "2086:2330", name: "Copyright", description: "…" },
  { nodeId: "2088:2350", name: "Avantage", description: "…" },
  { nodeId: "2090:2397", name: "Section-header", description: "…" },
  { nodeId: "2115:3947", name: "Équipe", description: "…" },
  { nodeId: "2115:4277", name: "Catégories principales", description: "…" },
  { nodeId: "2116:4475", name: "Produits e-commerce", description: "…" },
];
const applied = [];
const errors = [];
for (const d of DESCRIPTIONS) {
  try {
    const node = await figma.getNodeByIdAsync(d.nodeId);
    if (!node) { errors.push({ nodeId: d.nodeId, name: d.name, error: 'introuvable' }); continue; }
    if (node.name !== d.name) { errors.push({ nodeId: d.nodeId, name: d.name, error: 'nom live ne correspond pas: ' + node.name }); continue; }
    node.description = d.description;
    applied.push({ nodeId: d.nodeId, name: d.name, descLen: node.description.length, confirmed: node.description === d.description });
  } catch (e) {
    errors.push({ nodeId: d.nodeId, name: d.name, error: String((e && e.message) || e) });
  }
}
return { appliedCount: applied.length, errors, applied };
```

**Résultat** : 15/15 appliquées, **0 erreur**, chaque écriture relue et confirmée
(`node.description === valeur attendue`). Textes complets dans `decisions.md`
§T019-T021 (les 3 caractères « … » ci-dessus remplacent le texte intégral pour
la lisibilité du transcript — les valeurs réellement envoyées au bridge
portaient le texte complet, pas cette troncature).
