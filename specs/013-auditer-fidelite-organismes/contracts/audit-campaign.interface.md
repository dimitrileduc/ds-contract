# Interface Contract — Organism Audit Campaign v1

## Purpose

Déclarer avant toute lecture/capture le périmètre exact, les trois vagues, la référence
Figma immuable, la surface React générée, les dépendances et les faits obligatoires de
la campagne 013.

Cette interface enveloppe les receipts `Visual Campaign v1` existants. Elle ne décrit ni
une mutation Figma ni le code d'un composant.

## CLI

```bash
npm run audit:organisms -- \
  --campaign specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json \
  --out specs/013-auditer-fidelite-organismes/proofs \
  --refresh
```

Modes :

| Option | Effet |
|---|---|
| `--check` | valide forme, périmètre, contrats, dépendances et chemins sans capturer |
| `--inventory` | calcule les faits/cas attendus et refuse les trous |
| `--wave 1\|2\|3` | exécute une vague seulement, en respectant ses prérequis |
| `--refresh` | relit la version/nodes/assets Figma par GET uniquement |
| `--out <path>` | doit rester sous le dossier `proofs/` de la campagne |

`--campaign` est incompatible avec les filtres legacy de sujets. Aucun mode ne possède
de commande Figma write/push/update.

## Top-level document

```jsonc
{
  "schemaVersion": 1,
  "id": "013-auditer-fidelite-organismes",
  "reference": {
    "fileKey": "d9FYAUcqdcNtsuaMgLefvJ",
    "fileVersion": "<version numérique pinée au preflight>",
    "readOnly": true,
    "deviceScaleFactor": 2
  },
  "generatedSurface": {
    "kind": "react-storybook",
    "sourceRoot": "src/components",
    "bundleReceipt": "specs/013-auditer-fidelite-organismes/proofs/baseline/react-bundle.json"
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
  "expectedSubjectIds": [
    "coordonnees",
    "devis",
    "hero",
    "presentation",
    "sav",
    "texte-seo",
    "faq",
    "footer",
    "reassurances",
    "equipe",
    "formulaire",
    "header"
  ],
  "waves": [],
  "dependencyGates": [],
  "assetsManifest": "extract/figma/visual-parity/fixture-assets/manifest.json",
  "deferredPolicy": {
    "forbidHardcodedValueConversion": true,
    "forbidTokenFoundationChanges": true,
    "baselineReceipt": "specs/013-auditer-fidelite-organismes/proofs/baseline/hardcoded-values.json"
  },
  "subjects": []
}
```

### Top-level invariants

- `schemaVersion` vaut exactement `1`.
- `reference.readOnly` vaut exactement `true`; version/fileKey inattendus refusent.
- `generatedSurface.kind` vaut `react-storybook`; `emit-html` n'est pas autoritaire.
- les deux seuils absolus sont dans `[0, 2.5]`.
- `expectedSubjectIds` contient exactement les douze valeurs ci-dessus, dans cet ordre.
- `waves` partitionne cet array sans perte, doublon ou réordonnancement.
- `subjects` correspond 1:1 au même array.
- les deux politiques de report sont `true`.
- tous les chemins sont relatifs, sans `..`, et résolvent sous les racines déclarées.

## Wave

```jsonc
{
  "number": 1,
  "subjectIds": [
    "coordonnees",
    "devis",
    "hero",
    "presentation",
    "sav",
    "texte-seo"
  ],
  "startsAfter": null,
  "entryRule": "previous-wave-classified"
}
```

Valeurs exactes :

| Vague | `subjectIds` | `startsAfter` |
|---:|---|---:|
| 1 | Coordonnees, Devis, Hero, Presentation, SAV, TexteSEO | null |
| 2 | FAQ, Footer, Reassurances | 1 |
| 3 | Equipe, Formulaire, Header | 2 |

La vague 2 attend des verdicts classifiés, pas six passes. La vague 3 attend aussi le
gate propre à chaque sujet.

## Dependency gate

```jsonc
{
  "parentSubjectId": "equipe",
  "dependencyContractId": "ds.member-card",
  "receiptSchema": "visual-campaign-v1",
  "requiredVerdict": "proved",
  "resultPath": "specs/011-fix-molecule-convergence/proofs/visual/result.json",
  "resultSha256": "<sha256>",
  "expectedContractVersion": "1.2.0",
  "expectedFigmaFileVersion": "<version du reçu>",
  "requireProbative": true
}
```

Mappings exacts :

| Parent | Dépendance |
|---|---|
| `equipe` | `ds.member-card` |
| `formulaire` | `ds.field` |
| `header` | `ds.nav-item` |

### Mappage normatif des verdicts de reçu

`receiptSchema` nomme le format du reçu ; une valeur inconnue est refusée par nom au
preflight. Un reçu `visual-campaign-v1` parle `pass`/`fail`/`blocked` au niveau sujet
et ne porte `probative` que par cas — `proved` n'y apparaît jamais littéralement. Le
runner relit le reçu et dérive lui-même :

| Verdict du reçu (v1) | Verdict mappé (013) |
|---|---|
| `pass` | `proved` — uniquement si le `probative` dérivé est `true` |
| `fail` | `divergent` |
| `blocked` | `blocked` |
| sujet absent, valeur inconnue, reçu illisible | `not-proven` |

`probative` est dérivé, jamais saisi : `missing == []`, chaque `requiredCaseId` du
sujet résout vers un cas du reçu, et chaque cas requis a `probative == true`. Un reçu
`organism-audit-v1` (dépendance re-prouvée au format 013) est mappé à l'identité, avec
la même dérivation.

Un hash/version stale, un `probative` dérivé faux ou tout verdict mappé autre que
`proved` produit le dossier parent `blocked` avec sa raison typée. Le manifeste ne
peut surcharger ni le verdict ni la dérivation.

## Subject

```jsonc
{
  "id": "reassurances",
  "displayName": "Reassurances",
  "wave": 2,
  "contractId": "ds.reassurances",
  "contractVersion": "1.0.0",
  "contractPath": "contracts/reassurances.contract.json",
  "figmaSetNodeId": "2114:3721",
  "auditRefs": [
    "specs/003-externalize-figma-components/audits/reassurances.md",
    "specs/010-extract-molecules-organisms/audit-reuse-map.md"
  ],
  "coverage": {
    "deriveFromFigma": true,
    "deriveFromContract": true,
    "deriveFromGeneratedProjection": true,
    "requiredFactIds": []
  },
  "cases": []
}
```

### Subject invariants

- `contractId`, version et path résolvent vers le même contrat parsé.
- `figmaSetNodeId` égale `anchors.figma.nodeId` ou cite une justification typée.
- `auditRefs` est non vide et chaque chemin existe ; les noms réels peuvent différer
  de l'ID du sujet (`devis` → `audits/devis-cta.md`, `footer` → `audits/footer-devis.md`,
  `header` → 005 V1/L4) — `specs/010-extract-molecules-organisms/audit-reuse-map.md`
  est l'entrée canonique de résolution.
- les trois dérivations de couverture valent `true`.
- `requiredFactIds` est l'union exacte calculée au census, sans doublon.
- chaque sujet non bloqué contient au moins un cas.
- un sujet bloqué contient son `DependencyGateResult` et ne fabrique aucun cas parent.

## Case

```jsonc
{
  "id": "reassurances-disposition-4-cartes",
  "figmaNodeId": "<node réel>",
  "observedProperties": {
    "Disposition": "4 cartes"
  },
  "reactProps": {
    "disposition": "4Cartes",
    "items": [
      { "titre": "<contenu observé>", "texte": "<contenu observé>" }
    ]
  },
  "factIds": [
    "reassurances.property.disposition.4-cartes",
    "reassurances.composition.carte",
    "reassurances.visual.root"
  ],
  "fixtureAssetIds": [],
  "requiredParts": ["root", "items", "Carte"],
  "requiredRegions": [
    {
      "id": "whole",
      "source": "root",
      "kind": "whole",
      "metric": "raw-pixel",
      "maxDiffPct": 2.5,
      "minSignalPixels": 1
    }
  ],
  "semanticAssertions": []
}
```

### Case invariants

- `figmaNodeId` existe dans la version pinée et ses propriétés relues correspondent.
- `reactProps` passent le contrat et le composant généré.
- les valeurs non-défaut requises pour prouver une propagation ne peuvent être omises.
- toute valeur `{"$asset":"id"}` résout vers un asset hashé ; aucun asset n'est injecté
  par CSS de campagne.
- `factIds` est non vide et tous appartiennent au sujet.
- `requiredParts` contient `root`.
- les régions sont déclarées avant le diff et non choisies depuis le résultat.
- une composition obligatoire cite le contrat enfant et la part/repeat qui la porte.

## Fact declaration

```jsonc
{
  "id": "presentation.property.titre",
  "kind": "property",
  "required": true,
  "representability": "carry-both",
  "figmaReference": {
    "nodeId": "<node réel>",
    "property": "Titre"
  },
  "contractReference": {
    "jsonPointer": "/props/<index>",
    "bindingProperty": "Titre"
  },
  "generatedReference": {
    "componentFile": "src/components/Presentation/Presentation.tsx",
    "export": "Presentation",
    "selector": "[data-ds-part=\"SectionHeader\"]"
  },
  "projectionProbe": {
    "kind": "non-default-prop",
    "value": "PREUVE 013 — TITRE"
  }
}
```

Un fait `bindings.figma.kind: "NONE"` doit citer l'anatomie/sample/occurrence qui
justifie la jambe Figma ou rester `limited`/`not-proven`.

## Additive Visual Campaign compatibility

La campagne visuelle historique accepte un champ optionnel :

```jsonc
{
  "scope": {
    "expectedSubjectIds": ["..."],
    "contractIdsBySubject": { "...": "ds...." }
  }
}
```

- absent : comportement 011 inchangé, sept sujets exacts ;
- présent : ensemble exact fourni, chaque mapping explicite ;
- aucune modification de sens des résultats 011 déjà retenus ;
- les champs ajoutés à v1 restent optionnels ; suppression/changement de sens exige une
  version majeure.

## Refusal and safety rules

Le preflight refuse avant toute écriture si :

- le périmètre/vagues/dépendances n'est pas exact ;
- une référence Figma est stale, absente ou non read-only ;
- un contrat/version/node ne correspond pas ;
- un `receiptSchema` inconnu est déclaré pour une dépendance ;
- un cas ou fait obligatoire manque ;
- un chemin de sortie quitte le dossier 013 ;
- le harness ne capture pas le React réellement généré ;
- un asset manque ou son hash/décodage échoue ;
- une commande Figma write/push/update est détectée ;
- la baseline des valeurs en dur ou `tokens/**` a été mutée.
