# Gates owner H1–H4 — ordre et critères d'acceptation

Ce dossier contient les décisions humaines de 028. Un fichier de preuve ou un
succès mécanique ne vaut jamais acceptation implicite. Chaque gate est un arrêt
réel et son autorisation est limitée à l'étape nommée ci-dessous.

## Ordre obligatoire

```text
H1 Audit frais approuvé
  → frames de travail seulement
H2 Design responsive approuvé
  → préparation runner/spike/plan H3 seulement
H3 Plan de mutation exact approuvé
  → une première application live seulement
H4 Résultat Figma et handoff approuvés
  → finalize seulement
```

Un gate ne peut être `ready-for-review` que lorsque toutes ses preuves minimales
existent. `approved` est immuable; une nouvelle décision doit la superséder par
référence. `rejected` ou `blocked` n'autorise aucune étape suivante.

## Champs communs obligatoires

| Champ | Règle |
|---|---|
| `schemaVersion` | `1.0.0` pour les reçus de décision 028 |
| `featureId` | exactement `028-figma-responsive-hero-video` |
| `gateId` | exactement `H1`, `H2`, `H3` ou `H4` |
| `decisionId` | identifiant unique et versionné |
| `status` | `draft`, `ready-for-review`, `approved`, `rejected` ou `blocked` |
| `decisionMaker` | identité owner explicite; jamais `agent`, `inferred` ou vide |
| `decidedAt` | date UTC obligatoire pour tout statut terminal |
| `evidenceRefs` | chemins repo relatifs, frais et suffisants pour le gate |
| `acceptedFacts` | faits acceptés explicitement, sans élargissement de scope |
| `rejectedOptions` | options refusées ou tableau vide explicite |
| `deferredTopics` | sujets différés, dont CTA/enfants et promotion Home si applicables |
| `authorizes` | liste fermée des seules actions permises par ce gate |
| `forbids` | actions encore interdites après ce gate |
| `supersedes` | `null` ou décision antérieure explicitement remplacée |
| `conversationEvidence` | référence ou résumé factuel de la réponse owner |

Pour `approved`, `decisionMaker`, `decidedAt`, `evidenceRefs`, `acceptedFacts`,
`authorizes` et `conversationEvidence` ne peuvent être vides.

## H1 — Audit frais

**Fichier :** `H1-audit.json`

Champs spécifiques obligatoires :

- `auditRef`, `auditId`, `fileKey`, `fileVersionId`, `masterNodeId`,
  `historicalComponentKey`, `containerNodeId`, `homeInstanceNodeId`;
- `historicalEvidenceLinks` avec statut `confirmed|drifted|superseded`;
- `baselineDeltaRef`, `primitiveInventoryRef`, `surfaceManifestRef`;
- `figmaWrites: []`, `pageWrites: []`, `childWrites: []`;
- `preExistingDefects`, avec le CTA Home classé
  `observed-read-only/non-blocking`.

Acceptation H1 : source fraîche et unique; master/key/Container/Home/Header,
Button, textes, propriétés, médias, variables, overrides et usages inventoriés;
historique 027 séparé du présent; défauts préexistants séparés du delta; aucune
écriture. H1 autorise uniquement la création de frames de travail hors Container
et hors Pages. Il n'autorise ni snapshot d'application ni mutation du master.

## H2 — Design responsive

**Fichier :** `H2-design.json`

Champs spécifiques obligatoires :

- `baselineRef` vers H1 approuvé et `historicalDirectionRef` vers 027;
- `compositions` contenant exactement Compact, Desktop et Wide;
- `witnesses`: 390→Compact, 834→Compact, 1200→Desktop, 1728→Wide;
- `controlCases`: 320, 1440 et paysage court;
- `fixtures`: défaut, titre long et CTA long;
- `primitiveBindings`: une entrée exacte par gap/padding/dimension modifiée;
- `typographyOverrides`: zéro ou une exception bornée par nouvelle composition,
  marquée `pending-responsive-text-style`;
- `mediaDecision`, `childDecisions`, `workFrameRefs`, `tradeoffs`, `limits` et
  disposition finale des options de travail.

Acceptation H2 : topologie et valeurs exactes visibles dans Figma; primitives
préexistantes et compatibles; famille/poids/contenu/rôle préservés; Wide
historique inchangé; poster/crop/voiles et Button inchangés; limites et
recouvrements nommés. H2 autorise la préparation de la capacité runner, du spike
et du plan H3. Il n'autorise toujours aucune écriture du master ou d'une Page.

## H3 — GO source

**Fichier :** `H3-mutation.json`

Champs spécifiques obligatoires :

- `h1DecisionRef` et `h2DecisionRef`, tous deux approuvés;
- `campaignRef`, `freshFilePin`, `sourceBaselineRef`, `dryRunRef`;
- `runnerCapabilityRef` avec statut `full-suite-green` et IDs des quatre evals;
- `mechanismSpikeFirstRef` et `mechanismSpikeSecondNoopRef`, tous deux verts;
- `beforeCaptureRefs` complètes pour master, Home et Home+Header;
- `operations`, `expectedCreatedNodes`, `expectedChangedNodes` et blast radius
  exactement égaux au dry-run;
- `protectedFacts`, `rollbackRef`, `pageWrites: []`, `childWrites: []`;
- `wideIdentityBefore`, `homeLinkBefore` et `homeOverridesBefore`.

Acceptation H3 : pin encore frais; snapshot récupérable; toutes captures before
non vides et correctement dimensionnées; set/Compact/Desktop déclarés; membre
Wide id/key, Home, Header, CTA et enfants protégés; aucun create ou write caché.
H3 autorise exactement une première application du plan présenté. Toute dérive
de pin, d'opération ou de création annule cette autorisation et requiert une
nouvelle revue.

## H4 — Acceptation Figma et handoff

**Fichier :** `H4-closure.json`

Champs spécifiques obligatoires :

- `h3DecisionRef`, `firstApplyReceiptRef`, `afterVerifyRef`;
- `responsiveMatrixRef` couvrant la matrice composition×largeur×fixture;
- `protectedFactsRef` et comparaison Wide before/after;
- `secondApplyReceiptRef`, `idempotenceCaptureRef`, `secondPassVerifyRef`;
- `createdNodeIdsFirst`, `changedNodeIdsFirst`, puis
  `createdNodeIdsSecond: []`, `changedNodeIdsSecond: []`;
- `pageWrites: []`, `childWrites: []` aux deux passages;
- `handoffRefs`, `acceptedLimits`, `regenerationGuard: active`;
- `nonConvergenceStatus: figma-ahead/pending-home-responsive-promotion`;
- `contractClaim: false`, `codeClaim: false`, `odooClaim: false`,
  `automaticBreakpointClaim: false`.

Acceptation H4 : source finale vérifiée, zéro overflow/clipping/contenu
inaccessible, Wide et faits protégés conservés, second passage entièrement
no-op, limites et dette typographique acceptées, dossier reprenable sans contexte
oral. H4 autorise seulement `finalize`; elle ne promeut rien vers contrat, code,
tokens globaux ou Odoo.

## Critère de refus commun

Une preuve absente, périmée, vide, au mauvais pin, issue de `run-002`, une
écriture Page/enfant, une création non déclarée, une primitive détachée ou un
second passage non no-op force `blocked` ou `rejected`. Le manque n'est jamais
comblé par une approximation ni par un GO antérieur d'une autre feature.
