# Interface Contract — Visual Campaign v1

## Purpose

Déclarer avant capture la couverture exacte, les références Figma immuables et les
conditions de preuve de la campagne 011. Cette interface est consommée par le runner
visuel existant ; elle ne décrit ni code de composant ni mutation Figma.

## CLI

```bash
npm run extract:figma:visual -- \
  --campaign specs/011-fix-molecule-convergence/contracts/visual-campaign.json \
  --out specs/011-fix-molecule-convergence/proofs/visual \
  --refresh
```

Contraintes :

- `--campaign` et les filtres de sujets historiques sont mutuellement exclusifs ;
- `--out` doit résoudre sous le répertoire de la campagne, jamais à la racine du dépôt ;
- `--refresh` vérifie la version Figma pinée par des GET ; il ne modifie pas Figma ;
- un cache n'est accepté que si sa version, ses nodeIds et ses hashes correspondent.

## Top-level document

```jsonc
{
  "schemaVersion": 1,
  "id": "011-fix-molecule-convergence",
  "reference": {
    "fileKey": "d9FYAUcqdcNtsuaMgLefvJ",
    "fileVersion": "2381229993207753432",
    "readOnly": true,
    "deviceScaleFactor": 2
  },
  "attribution": {
    "checkpointCommit": "45e2a7d5a950e3d6ccc2a0dd62982b7c288210c5",
    "wipCommit": "29d70187cdb7c7e45ca3bbc4f2d75da64bcd31b5"
  },
  "acceptance": {
    "maxRawDiffPct": 2.5,
    "maxRegionDiffPct": 2.5,
    "baselineEpsilonPp": 0.1,
    "requireExactCoverage": true,
    "requireVisibleEvidence": true,
    "requireGeometryPass": true,
    "requireSemanticPass": true
  },
  "assetsManifest": "extract/figma/visual-parity/fixture-assets/manifest.json",
  "subjects": []
}
```

### Top-level invariants

- `schemaVersion` vaut exactement `1`.
- `id` est unique et sert au répertoire d'artefacts.
- `reference.readOnly` doit être `true`.
- le runner refuse si la version live diffère de `fileVersion`.
- les seuils sont dans `[0, 2.5]`.
- `subjects` contient exactement sept entrées et les sept `contractId` attendus.
- la baseline de non-régression ne remplace jamais l'acceptation absolue.

## Subject

```jsonc
{
  "id": "carte",
  "contractId": "ds.carte",
  "contractVersion": "2.0.0",
  "figmaSetNodeId": "2063:1622",
  "auditRefs": [
    "specs/003-externalize-figma-components/audits/carte.md"
  ],
  "coverage": {
    "deriveFromFigmaProperties": true,
    "deriveFromContract": true,
    "requiredFactIds": []
  },
  "cases": []
}
```

### Subject invariants

- `id` appartient à l'enum des sept molécules.
- `contractId` et `contractVersion` résolvent dans le contrat parsé.
- `figmaSetNodeId` correspond à l'ancre du contrat ou possède une justification
  d'instance explicite.
- `cases` couvre l'union des axes Figma et contrat.
- une molécule ne peut pas déclarer un cas comme facultatif.

## Case

```jsonc
{
  "id": "carte-reassurance-example",
  "figmaNodeId": "2063:1606",
  "figmaVariant": "Disposition=Reassurance",
  "observedProperties": {
    "Disposition": "Reassurance"
  },
  "codeProps": {
    "disposition": "reassurance",
    "imageUrl": {
      "$asset": "carte-reassurance"
    },
    "imageAlt": "Description de fixture issue du cas observé"
  },
  "layoutContext": {
    "rootWidth": "figma-root"
  },
  "factIds": [
    "carte.disposition.reassurance",
    "carte.image.reassurance"
  ],
  "fixtureAssetIds": [
    "carte-reassurance"
  ],
  "comparisonSurface": "light",
  "requiredRegions": [
    {
      "id": "whole",
      "source": "root",
      "kind": "whole",
      "metric": "raw-pixel",
      "maxDiffPct": 2.5,
      "minSignalPixels": 1
    },
    {
      "id": "image",
      "source": "part",
      "partName": "img",
      "kind": "image",
      "metric": "raw-pixel",
      "maxDiffPct": 2.5,
      "minSignalPixels": 1
    }
  ],
  "requiredParts": ["root", "img", "text"],
  "semanticAssertions": [],
  "aliases": [
    {
      "figmaNodeId": "2063:1607",
      "factIds": ["carte.disposition.reassurance", "carte.image.reassurance"],
      "imageSha256": "<sha256 de l'asset>",
      "geometryFingerprint": "<empreinte canonique>",
      "semanticFingerprint": "<empreinte canonique>"
    }
  ]
}
```

### Case invariants

- `figmaNodeId` existe dans la version pinée.
- `observedProperties` est relu et comparé au node ; une divergence rend la référence
  stale.
- `codeProps` utilise les noms de bindings du contrat et passe sa validation de type.
- `layoutContext.rootWidth: "figma-root"` est le seul contexte de largeur
  admis : le runner relit la largeur du root dans le GET Figma piné et ne la
  promeut jamais dans le contrat. Il sert aux occurrences `FILL`/stretch dont
  le contrat reste honnêtement `HUG`.
- une valeur `{"$asset":"id"}` résout dans le manifest d'images ; elle n'est jamais
  copiée comme défaut de contrat.
- `factIds` est non vide et tous les faits obligatoires sont couverts.
- un cas image possède une région `kind=image`.
- `requiredParts` contient `root`.
- `comparisonSurface` est commune aux deux rendus et ne modifie pas leur géométrie.
- chaque entrée `aliases` nomme une occurrence Figma distincte et répète exactement les
  `factIds`, hash image, empreinte de géométrie et empreinte sémantique du cas canonique ;
  une différence crée un nouveau cas requis au lieu d'un alias.

## Coverage rules

Le runner calcule :

```text
expected = union(
  Figma VARIANT/BOOLEAN/INSTANCE_SWAP legal values,
  contract enums/booleans/states/visibleWhen/hiddenWhen,
  image and content inventory required by the campaign
)
observed = normalized facts represented by cases[]
```

Puis :

```text
missing    = expected - observed
unexpected = observed - expected
```

Les deux listes doivent être vides. Pour les faits déjà inventoriés :

- Field couvre 12 combinaisons `etat × optionnel × saisie`.
- NavItem couvre 4 combinaisons `chevron × actif`.
- ProductCard couvre 8 combinaisons `4 images × bouton`.
- MemberCard couvre 16 portraits/contenus.
- Realisation couvre 27 images/instances.
- Carte couvre les 26 images uniques et toute occurrence portant d'autres faits distincts.
- Tab couvre ses 2 états.

Une déduplication requiert un bloc `aliases` qui nomme chaque occurrence équivalente avec
son nodeId, ses factIds, son hash image et ses empreintes de géométrie et de sémantique.
Le runner recalcule les quatre empreintes et refuse toute égalité seulement déclarative.

## Reference rule for non-default properties

Un cas BOOLEAN/INSTANCE_SWAP non-défaut doit citer une instance Figma existante. Le
master ne peut pas être rendu avec une propriété temporaire. En l'absence de référence :

```json
{
  "exitCode": 2,
  "verdict": "blocked",
  "reason": "coverage-incomplete"
}
```

Le cas `ProductCard bouton=true` est un gap connu au moment du plan ; le contrat de
campagne ne peut être finalisé positivement tant qu'une référence immuable ou une route
de lecture non mutante prouvée n'est pas trouvée.

## Exit codes

| Code | Meaning |
|---:|---|
| `0` | Couverture exacte, preuve probante, 7/7 sujets passent |
| `1` | Campagne complète/probante mais au moins un écart visuel ou sémantique échoue |
| `2` | Input invalide, couverture incomplète, référence stale, asset manquant, rendu refusé, preuve invisible ou géométrie injustifiée |

## Compatibility

Les ajouts au format v1 sont optionnels. Un changement de sens ou une suppression exige
`schemaVersion: 2`. Un runner qui ne connaît pas la version refuse par nom.
