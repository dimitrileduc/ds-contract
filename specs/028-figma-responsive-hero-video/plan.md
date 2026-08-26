# Implementation Plan: Finaliser HeroVideo responsive dans Figma

**Branch**: `emerald-jodhpur` | **Spec Kit feature**: `028-figma-responsive-hero-video` | **Date**: 2026-08-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/028-figma-responsive-hero-video/spec.md`

## Summary

Finaliser dans Figma Design uniquement les états `Presentation=Compact|Desktop|Wide`
du HeroVideo. La campagne réutilise comme historique le Wide 1728×720 et la
direction « centrage immersif » de 027, mais reprend toutes les décisions de valeur
dans des frames Figma de travail. Compact et Desktop utilisent une pile titre–CTA
centrée et une hauteur minimale capable de grandir; Wide conserve exactement le
master historique. Chaque spacing est lié à une primitive existante et chaque
adaptation typographique locale est inventoriée comme
`pending-responsive-text-style`.

La mise en œuvre suit quatre gates humains et le workflow mono-composant
`component:repair`. Elle ne touche jamais une Page, le Button partagé, un contrat,
un token global, un émetteur de surface, du HTML ou Odoo. 028 étend directement le
runner, le transport et leurs evals pour prouver honnêtement la transition
standalone→component set, les bindings, les créations attendues et les scénarios par
variante. Le défaut CTA et tous les enfants restent read-only et non bloquants.

## Technical Context

**Language/Version**: Figma Design et Figma Plugin API du fichier Piqueray épinglé;
Node.js >=20, TypeScript/ESM avec `tsx` pour l'extension bornée du runner et de ses
preuves, sans ajout de code produit

**Primary Dependencies**: Figma Desktop/Design, Figma REST read-only,
`npm run component:repair`, Desktop Bridge, primitives numériques et Text Styles
Piqueray existants, suite déterministe `npm run eval`, skill repo-locale
`figma-component-repair`

**Storage**: source live dans le fichier Figma épinglé; décisions, inventaires,
captures PNG, structures, propriétés, faits et reçus versionnés dans Git; aucun
datastore applicatif

**Testing**: audit par identité/position; captures before/after/idempotence; contrôle
des `boundVariables`, textes, médias, variants, liens et overrides; scénarios 320,
390, 834, 1200, 1440, 1728 et paysage court avec contenus normal/long; second passage
strictement no-op; fixtures négatives et evals ciblés pour chaque nouvelle capacité

**Target Platform**: fichier Figma Design Piqueray
`d9FYAUcqdcNtsuaMgLefvJ`, ouvert dans Figma Desktop et repinné à une version fraîche
avant chaque phase live

**Project Type**: campagne d'authoring et de réparation Figma mono-composant,
gouvernée par preuves et gates owner

**Performance Goals**: zéro overflow horizontal, coupe involontaire ou contenu
inaccessible sur tous les contrôles; zéro Page write; Wide sans delta non autorisé;
premier passage borné puis second passage avec zéro création et zéro modification

**Constraints**: Figma-only; quatre gates humains; aucune valeur brute ou nouvelle
primitive; aucune création de Text Style/mode responsive; Button et Header read-only;
master/key/Home/overrides protégés; états sélectionnés explicitement; aucune promesse
de breakpoint Figma automatique; état final marqué non convergé côté contrat/code;
seul l'outillage interne borné et testé peut changer

**Scale/Scope**: un master historique `2151:5552`, un Container `2448:4731`, une
instance Home `2170:6351`, un Header contextuel read-only, une dépendance directe
`ds.button`, trois compositions, quatre témoins principaux, trois contrôles
complémentaires et quatre gates humains

## Constitution Check

_GATE: vérifié avant la recherche, puis réévalué après le design de Phase 1._

- [x] **I. Determinism** — aucun modèle n'entre dans une conversion. Les décisions
  sont structurées, les commandes existantes sont rejouables et le second apply doit
  être un no-op strict.
- [x] **II. Claims Rule** — chaque affirmation de préservation, responsive, binding
  ou idempotence exige un reçu frais. Une lacune du runner bloque au lieu de devenir
  une claim.
- [x] **III. Contract SSoT** — le contrat reste l'autorité des surfaces de production.
  Le résultat 028 est un candidat Figma-ahead explicitement non convergé, non propagé
  et en attente de promotion transverse; il ne devient pas une vérité parallèle.
- [x] **IV. Generated Output** — aucun fichier généré, contrat, token, composant React,
  script Figma de surface ou asset Odoo n'est modifié dans 028. Le runner et son
  transport sont des sources maintenues.
- [x] **V. Honesty** — absence de breakpoint automatique, dette typographique, défaut
  CTA read-only, limites initiales du runner et non-convergence sont nommés près des
  résultats.
- [x] **VI. Additive Evolution & Semver** — aucun changement de schéma ou de contrat
  n'entre dans cette feature. Une future promotion décidera son semver séparément.
- [x] **VII. Engine Integrity** — 028 ne modifie pas le core. Toute capacité générique
  de transition/validation ajoutée au runner est précédée d'une fixture rouge et
  enseigne au mock/transport à refuser définitivement la même classe de défaut.
- [x] **VIII. Source Cleanliness** — H1 réaudite le master, toutes ses dépendances et
  tous ses usages par identité et position; le CTA et les enfants restent des contextes
  read-only non bloquants.
- [x] **IX. Docs-First** — `docs/responsive-figma.md`, la capability matrix, le
  workflow `component:repair` et les preuves 027 gouvernent les décisions du plan.
- [x] **X. Before-Capture** — master, Home et contexte Home+Header possèdent des
  captures before complètes, non vides et vérifiées avant la première mutation source.
- [x] **XI. Multi-Writer Bridge** — HeroVideo, son Container et ses frames de travail
  forment une seule zone d'écriture, confiée à un seul writer et un seul cycle global
  de preuve. Les Pages restent hors zone.

**Post-design re-check**: passé pour la planification. Les artefacts séparent bien
les états de travail, la décision owner, le plan de mutation et les preuves finales.
028 contient désormais la capacité générique qualifiant la topologie, les créations,
les bindings, les exceptions typographiques et les scénarios responsive; ses evals
verts sont le gate mécanique de H3. Le CTA et les enfants ne sont pas des prérequis.
Le statut Figma-ahead est enregistré comme déviation temporaire et ne permet aucune
claim de parité contractuelle.

## Project Structure

### Documentation (this feature)

```text
specs/028-figma-responsive-hero-video/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── figma-design-decision.md
│   ├── non-destructive-transition.md
│   └── proof-ledger.md
├── decisions/                         # implementation: H1–H4 receipts
├── inventory/                         # fresh audit, primitives, work-frame options
├── proofs/                            # captures, comparisons, scenario results
├── handoff/                           # observations for the Home campaign
└── tasks.md                           # created by /speckit-tasks
```

### Existing implementation surfaces

```text
docs/
├── responsive-figma.md
├── FIGMA-CAPABILITY-MATRIX.md
└── internal/component-repair-workflow.md

specs/027-responsive-hero-video/        # historical H1/H2 inputs only
specs/component-repairs/hero-video/
├── run-001/                            # historical repair/no-op reference
├── run-002/                            # obsolete draft; do not reuse or edit
└── run-003/                            # implementation: fresh 028 campaign

extract/figma/projection-repair/
├── types.ts                            # set/member/scenario/binding vocabulary
├── campaign.ts                         # validation and allowlists
├── apply.ts                            # exact dry-run/apply planning
├── bridge-script.ts                    # bounded live operations and inspection
├── apply-receipt.ts                    # honest created/changed/no-op receipts
├── audit.ts                            # fresh topology and protected-fact audit
├── capture.ts                          # set/member and scenario captures
├── facts.ts                            # variants and boundVariables facts
├── report.ts                           # explicit diagnostics and named limits
└── verify.ts                           # protected-fact comparison
scripts/component-repair-bridge.mjs     # lossless responsive transport envelope
evals/
├── fixtures/                           # negative and preservation fixtures for 028
└── run.ts                              # registered eval ids

Figma: DS · Organisms / Hero vidéo
├── Container · HeroVideo `2448:4731`
│   └── HeroVideo historical Wide `2151:5552`
├── Frames de travail 028               # outside governed Container and Pages
└── Pages / Accueil / HeroVideo `2170:6351` + Header  # read-only context
```

**Structure Decision**: conserver les outils et preuves existants comme mécanique,
mais créer une campagne fraîche `run-003` liée à 028. Les frames de brainstorming
sont des surfaces Figma temporaires ou archivées, séparées du master gouverné. Les
seuls fichiers de code modifiables sont le runner/transport et leurs fixtures/evals.
Ils reçoivent une capacité générique minimale, jamais un script ad hoc HeroVideo.

## Design Phases

### Phase A — Repinner la source et obtenir H1

1. Inventorier les changements concurrents du workspace sans les inclure dans les
   patches ou preuves de 028. Utiliser le worktree Superset actif; ne pas en créer un
   autre.
2. Créer `run-003/campaign.json` avec une version Figma fraîche, un `sourceBaseline`
   récupérable, exactement un target, toutes les surfaces master/Home/contexte et
   `pageMutationPolicy: forbid-direct`.
3. Lancer l'audit read-only et comparer l'état frais aux preuves 027 sans reprendre
   leurs pins comme vérité courante.
4. Vérifier master/key/Container, poster/crop, voiles, textes/styles/variables,
   propriétés, Button, Home, Header contextuel, liens et overrides. Inventorier
   séparément toutes les primitives réellement disponibles.
5. Enregistrer H1. Il autorise uniquement les frames de travail hors Container et
   hors Pages; il n'autorise ni snapshot d'application ni mutation du master.

### Phase B — Concevoir dans Figma et obtenir H2

1. Créer des frames de travail Compact, Tablet-using-Compact, Desktop et Wide, sans
   toucher au master. Wide est une référence historique, pas une réinterprétation.
2. Explorer dans Figma les primitives, hauteurs minimales et éventuelles métriques
   typographiques locales avec contenu normal, titre long, CTA long et faible hauteur.
3. Pour chaque candidat, enregistrer les bindings exacts, l'impact visuel, le point
   focal poster, les limites et les sujets enfants différés. Aucune primitive
   compatible signifie arrêt devant l'owner.
4. Présenter les options. H2 accepte exactement la structure, les bindings, la
   typographie locale et les compromis à installer. Il ne donne pas encore le GO au
   master.
5. Nettoyer ou archiver explicitement les frames refusées; conserver la proposition
   retenue et son inventaire comme preuve, sans la confondre avec la source live.

### Phase C — Étendre le runner, prouver le mécanisme et obtenir H3

1. Écrire d'abord les fixtures négatives: topologie set+membre historique absente,
   création cachée, mauvais variant sélectionné, binding détaché, Page write, mutation
   d'enfant et second passage non no-op. Enregistrer chaque eval par un id stable.
2. Étendre les types, le manifeste, le plan/dry-run, le transport, les faits, les
   captures, les reçus et la vérification pour représenter le nouveau set, les
   composants créés, le membre Wide historique, `Presentation`, les `boundVariables`,
   les exceptions typographiques locales et les scénarios par composition.
3. Exécuter les evals ciblés puis la suite complète. Aucun script HeroVideo ad hoc,
   création non déclarée ou élargissement Page/enfant n'est accepté.
4. Exécuter un spike hors source autoritative avec la capacité verte. Il doit prouver
   la conservation du node id/key Wide, du lien Home, des overrides, des médias et
   des propriétés, puis un second passage no-op.
5. Repinner Figma, préparer la proposition minimale, prendre le snapshot source,
   exécuter preflight et capturer master/Home/contexte before. Vérifier chaque capture
   non vide et correctement dimensionnée.
6. Présenter le dry-run exact, le blast radius, les créations attendues, le plan de
   rollback et les faits protégés. H3 seul autorise la première écriture du master.

### Phase D — Appliquer, vérifier et obtenir H4

1. Transporter le plan H3 par un seul Desktop Bridge sur le fichier/version épinglés.
   Toute dérive de pin, création inattendue, Page write ou dépendance partagée arrête
   l'application.
2. Capturer after et vérifier chaque composition aux largeurs 320, 390, 834, 1200,
   1440, 1728 et en paysage court, avec contenus normal et long. L'overflow est un
   échec, jamais un delta documentable.
3. Comparer Wide au baseline, puis vérifier poster, voiles, Button, Text Style Wide,
   propriétés, noms de calques, Home, Header contextuel, liens et overrides.
4. Rejouer exactement le même plan. Le second reçu doit contenir uniquement des
   opérations `no-op`, `createdNodeIds: []`, `changedNodeIds: []` et `pageWrites: []`.
5. Capturer l'idempotence, faire accepter les limites et le handoff par H4, puis
   finaliser le runner. Sans H4, la feature n'est pas close.

### Phase E — Handoff vers la campagne Home

1. Inventorier par composition la structure, chaque primitive, chaque override
   `pending-responsive-text-style`, la hauteur, les limites média et les enfants
   différés.
2. Marquer chaque valeur comme observation candidate, jamais comme variable ou Text
   Style responsive global validé.
3. Enregistrer `figma-ahead/pending-home-responsive-promotion`, l'interdiction de
   régénération non coordonnée et la future disposition attendue.
4. Dire explicitement que contrat, code, HTML, Odoo et breakpoints automatiques ne
   sont pas couverts.

## Complexity Tracking

| Violation / tension | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| État temporaire Figma-ahead par rapport au principe III | L'owner a explicitement isolé l'authoring visuel avant la campagne transverse Home; les résultats ne sont ni propagés ni présentés comme vérité contractuelle | Promouvoir contrat/tokens maintenant généraliserait les choix d'un seul composant et violerait le scope Figma-only; laisser le drift anonyme serait moins honnête |
| Quatre gates humains autour d'un runner qui n'en encode qu'un | H1/H2/H3/H4 séparent audit, design, autorisation source et acceptation finale | Une seule décision owner ne prouve ni la validation des valeurs avant mutation ni l'acceptation des preuves après mutation |
| Extension générique du runner dans une feature au résultat Figma-only | La livraison ne peut être complète sans compter les créations, cibler set+membre Wide, vérifier les bindings et sélectionner les variantes par scénario | Une feature séparée alourdirait inutilement le flux; cacher ces opérations dans `generated-amend` produirait des reçus faux |
