# Interface Contract — Evidence Result v1

## Purpose

Définir la sortie machine déterministe d'une campagne visuelle. Le fichier canonique est
`specs/011-fix-molecule-convergence/proofs/visual/result.json`.

## Top-level result

```jsonc
{
  "schemaVersion": 1,
  "campaignId": "011-fix-molecule-convergence",
  "reference": {
    "fileKey": "d9FYAUcqdcNtsuaMgLefvJ",
    "fileVersion": "2381229993207753432"
  },
  "inputHashes": {
    "campaign": "<sha256>",
    "contracts": "<sha256>",
    "assetsManifest": "<sha256>",
    "generatedTree": "<sha256>"
  },
  "coverage": {
    "expected": [],
    "observed": [],
    "missing": [],
    "unexpected": []
  },
  "subjects": [],
  "cases": [],
  "verdict": "pass",
  "exitCode": 0,
  "reasons": []
}
```

Les timestamps éventuels sont informatifs et exclus du hash déterministe du contenu.

## Case result

Chaque entrée de `cases[]` contient :

```text
id, subjectId, verdict, probative, reasons
figma:
  nodeId, setNodeId, version, observedProperties, png hash/dimensions
contract:
  id, version, factIds, jsonPointers, codeProps
visibility:
  figma/generated alphaPixels, contrastPixels, paintedBounds, imagePixels
images:
  receipt ids, expected/actual hashes, decode/natural-size/visible-region verdicts
geometry:
  root rectangles/deltas, normalized named-part rectangles/deltas,
  verdict, optional contract justification pointer
pixels:
  rawPct, maskedDiagnosticPct, maskCoveragePct, thresholdPct,
  region scores, verdict
semantics:
  assertion id, selector, expected, actual, verdict
artifacts:
  reference, generated, diff, triptych, metadata paths and hashes
```

## Probative rule

`probative=true` exige simultanément :

- référence et rendu généré non vides ;
- pixels visibles/contrastés des deux côtés ;
- toute image attendue décodée et visible ;
- aucune région obligatoire vide ;
- aucun skip, refus ou decline.

Un score de 0 % ne peut pas rendre `probative=true`.

## Geometry rule

`geometry.verdict` vaut :

- `pass` si les racines et parts exigées correspondent ;
- `justified` seulement avec un JSON Pointer de contrat résolvable et une explication
  visible dans le rapport ;
- `fail` autrement.

Ni le padding central du comparateur, ni le crop alpha, ni une registration calculée ne
constitue une justification.

## Pixel rule

```text
pixels.verdict =
  rawPct <= thresholdPct
  AND every(required region score <= its maxDiffPct)
```

`maskedDiagnosticPct` n'apparaît jamais dans cette expression. Une métrique
`signal-preserving-text` doit conserver toute l'encre et être protégée par une fixture
qui fait échouer texte manquant, contenu différent et mauvaise casse.

## Semantic rule

Chaque assertion compare un fait généré au chemin contractuel cité. Les minimums sont :

- Field : contrôle slotté FILL, `aria-invalid`, `aria-describedby` ;
- NavItem : élément `a`, `href`, `aria-current` pour actif ;
- Tab : bouton `type=button`, `role=tab`, `aria-selected`, `aria-controls`, `tabIndex`
  et contexte tablist/roving-focus prévu.

## Aggregate verdicts

```text
subject.pass =
  every(required case for subject has case.verdict == pass)

campaign.pass =
  coverage.missing == []
  AND coverage.unexpected == []
  AND exactly 7 subjects
  AND every(subject.pass)
```

Les gates du dépôt et l'attribution sont ajoutés au rapport de clôture ; ils ne sont pas
inventés par le comparateur visuel.

## Artifact layout

```text
proofs/visual/
├── result.json
├── REPORT.md
└── cases/
    └── <case-id>/
        ├── figma.png
        ├── generated.png
        ├── diff.png
        ├── triptych.png
        └── metadata.json
```

Le runner peut remplacer ce répertoire exact après l'avoir résolu et borné. Il ne supprime
jamais `extract/figma/visual-parity/report-assets/`, un autre campaign directory ou un
répertoire large.

## Determinism and staleness

Un résultat devient stale si un des éléments suivants change :

- campaign hash ;
- contrat/version ;
- Figma fileVersion/node/properties ;
- asset hash ;
- generated tree hash ;
- runner version ou paramètres de métrique.

Deux runs avec les mêmes entrées produisent les mêmes scores, mêmes artefacts et mêmes
hashes.
