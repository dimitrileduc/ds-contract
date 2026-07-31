# Interface Contract — Organism Audit Result v1

## Purpose

Définir la sortie machine autoritaire de la campagne 013. Les rapports Markdown et
tableaux de synthèse sont générés depuis ce résultat et doivent lui rester cohérents.

## Top-level result

Fichier canonique :
`specs/013-auditer-fidelite-organismes/proofs/result.json`.

```jsonc
{
  "schemaVersion": 1,
  "campaignId": "013-auditer-fidelite-organismes",
  "reference": {
    "fileKey": "d9FYAUcqdcNtsuaMgLefvJ",
    "fileVersion": "<version pinée>"
  },
  "generatedSurface": {
    "kind": "react-storybook",
    "bundleSha256": "<sha256>",
    "generatedTreeSha256": "<sha256>"
  },
  "inputHashes": {
    "campaign": "<sha256>",
    "contracts": "<sha256>",
    "assetsManifest": "<sha256>",
    "dependencies": "<sha256>",
    "hardcodedBaseline": "<sha256>"
  },
  "waves": [],
  "subjects": [],
  "deferredWork": [],
  "repositoryGates": [],
  "summary": {
    "total": 12,
    "proved": 0,
    "divergent": 0,
    "limited": 0,
    "notProven": 0,
    "blocked": 0
  },
  "verdict": "complete-with-blocks",
  "exitCode": 1,
  "reasons": []
}
```

Les timestamps éventuels sont informatifs et exclus des hashes déterministes.

## Fact result

```jsonc
{
  "id": "presentation.property.titre",
  "subjectId": "presentation",
  "caseId": "presentation-default-and-title-probe",
  "kind": "property",
  "required": true,
  "representability": "carry-both",
  "figma": {
    "reference": "v<version>/<node>/Titre",
    "observedValue": "Piqueray, une histoire de famille",
    "sourceHash": "<sha256>",
    "available": true,
    "notes": []
  },
  "contract": {
    "reference": "ds.presentation@1.0.0#/props/<index>",
    "observedValue": "<binding/default>",
    "sourceHash": "<sha256>",
    "available": true,
    "notes": []
  },
  "generated": {
    "reference": "src/components/Presentation/Presentation.tsx#<selector/export>",
    "observedValue": "<DOM observé avec la prop probe>",
    "sourceHash": "<bundle sha256>",
    "available": true,
    "notes": []
  },
  "evidenceIds": ["presentation-default-and-title-probe"],
  "outcome": "divergent",
  "localizedSource": "generated",
  "reasons": ["prop-not-projected"],
  "deferredWorkId": null
}
```

### Fact outcomes

| Outcome | Condition |
|---|---|
| `proved` | trois jambes disponibles/concordantes et preuve probante |
| `divergent` | écart observé + source parmi Figma/contrat/généré/dépendance/comparaison |
| `limited` | limite nommée empêchant une preuve complète |
| `not-proven` | référence/preuve absente, stale, invisible, invalide ou non équivalente |

`localizedSource` est obligatoire pour `divergent` et null pour `proved`.

## Case result

Chaque cas conserve :

```text
id, subjectId, verdict, probative, reasons
figma:
  nodeId, setNodeId, version, observedProperties, png hash/dimensions
contract:
  id, version, factIds, jsonPointers, reactProps
generated:
  component file/export, bundle hash, preset/story, DOM/part receipts
visibility:
  figma/generated alphaPixels, contrastPixels, paintedBounds, imagePixels
images:
  receipt ids, expected/actual hashes, decode/natural-size/visible-region verdicts
geometry:
  root and named-part rectangles/deltas, verdict, optional contract justification
pixels:
  rawPct, maskedDiagnosticPct, maskCoveragePct, thresholdPct, regions, verdict
semantics:
  assertion id, selector, expected, actual, contract pointer, verdict
artifacts:
  figma/generated/diff/triptych/metadata paths and hashes
```

### Probative rule

`probative=true` exige simultanément :

- référence et rendu React généré non vides ;
- contenu/props de comparaison équivalents ;
- pixels visibles et contrastés des deux côtés ;
- toute image requise décodée et visible ;
- aucune région vide ;
- hashes/provenance valides ;
- aucun skip, decline ou fallback vers `emit-html`.

Un score de `0 %` ne suffit jamais.

### Pixel rule

```text
pixelPass =
  rawPct <= thresholdPct
  AND every(requiredRegion.score <= requiredRegion.maxDiffPct)
```

`maskedDiagnosticPct` n'entre pas dans cette expression.

## Dependency gate result

```jsonc
{
  "parentSubjectId": "header",
  "dependencyContractId": "ds.nav-item",
  "receiptSchema": "visual-campaign-v1",
  "resultPath": "specs/011-fix-molecule-convergence/proofs/visual/result.json",
  "resultSha256": "<sha256>",
  "contractVersion": "1.1.0",
  "figmaFileVersion": "<version>",
  "receiptVerdict": "fail",
  "probative": true,
  "actualVerdict": "divergent",
  "staleReasons": [],
  "open": false,
  "reasons": ["dependency-not-proved"]
}
```

`receiptVerdict` est le verdict brut du reçu ; `actualVerdict` en est dérivé par le
mappage normatif de l'interface de campagne (`pass→proved` uniquement si le
`probative` dérivé est `true`, `fail→divergent`, `blocked→blocked`, sujet
absent/illisible→`not-proven`). `probative` est dérivé des cas requis du reçu
(`missing == []`, chaque cas requis présent et `probative == true` chacun). Aucun de
ces trois champs n'est saisi à la main.

Le parent reste `blocked` tant que `open` n'est pas vrai.

## Organism result

```jsonc
{
  "id": "header",
  "displayName": "Header",
  "wave": 3,
  "contract": {
    "id": "ds.header",
    "version": "1.0.0",
    "path": "contracts/header.contract.json"
  },
  "figmaSetNodeId": "84:285",
  "coverage": {
    "expected": [],
    "observed": [],
    "missing": [],
    "unexpected": []
  },
  "dependency": {},
  "facts": [],
  "cases": [],
  "artifacts": [],
  "verdict": "blocked",
  "reasons": ["dependency:ds.nav-item:not-proved"]
}
```

### Aggregate organism rule

```text
blocked    if dependency.open == false
divergent  else if any required fact is divergent or any case fails
not-proven else if coverage is not exact or any required evidence is non-probative
limited    else if any required fact is limited
proved     else if every required fact is proved and every case passes
```

Une limite, un item reporté ou un ancien verdict owner n'est jamais un pass.

## Wave result

```jsonc
{
  "number": 2,
  "startedAfterWave": 1,
  "entrySatisfied": true,
  "subjectIds": ["faq", "footer", "reassurances"],
  "subjectVerdicts": {
    "faq": "proved",
    "footer": "limited",
    "reassurances": "divergent"
  },
  "classified": true
}
```

Les keys suivent exactement l'ordre du manifeste.

## Deferred work result

```jsonc
{
  "id": "deferred-texte-seo-typography-token",
  "subjectId": "texte-seo",
  "factId": "texte-seo.visual.typography",
  "category": "hardcoded-value-conversion",
  "contractPointer": "<json pointer ou null>",
  "observedCause": "<cause constatée>",
  "candidateToken": "<informatif ou null>",
  "evidenceIds": ["<case-id>"],
  "verdictImpact": "divergent",
  "status": "deferred"
}
```

Catégories fermées :

- `hardcoded-value-conversion`
- `global-token-correction`

## Campaign verdict and exit codes

| Code | Verdict | Meaning |
|---:|---|---|
| `0` | `complete` | 12/12 dossiers valides et tous les organismes `proved` |
| `1` | `complete-with-blocks` | campagne complète et honnête, au moins un organisme non positif |
| `2` | `invalid` | entrée/référence/hash/couverture/sortie/rapport invalide ou gate technique non exécutable |

Le code 1 est un résultat d'audit exploitable, pas une preuve globale de fidélité.

## Artifact layout

```text
proofs/
├── result.json
├── REPORT.md
├── baseline/
├── dependencies/
├── organisms/
│   └── <subject-id>/
│       ├── result.json
│       ├── REPORT.md
│       └── cases/
│           └── <case-id>/
│               ├── figma.png
│               ├── generated.png
│               ├── diff.png
│               ├── triptych.png
│               └── metadata.json
├── deferred/
│   └── work.json
└── closure/
    ├── gates.json
    ├── hardcoded-values-final.json
    └── review.json
```

Le runner ne remplace que le répertoire exact résolu sous `proofs/`.

## Determinism and staleness

Un résultat devient stale si change :

- campagne ou contrat/version ;
- Figma version/node/propriétés ;
- asset/hash ;
- dépendance/hash/version ;
- tree/bundle React généré ;
- instrument/version/paramètres de mesure ;
- baseline des valeurs en dur.

Deux runs avec les mêmes entrées produisent mêmes faits, scores, verdicts, artefacts et
hashes hors timestamps informatifs.
