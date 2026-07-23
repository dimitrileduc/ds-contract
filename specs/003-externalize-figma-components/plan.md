# Implementation Plan: Externalisation des maquettes Piqueray — ~34 blocs recopiés → composants gouvernés, preuve zéro-pixel

**Branch**: `003-externalize-figma-components` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-externalize-figma-components/spec.md`

## Summary

Nettoyage Figma pur sur le vrai fichier client `Piqueray (Copy)` : les ~35 blocs
recopiés à la main dans les 9 maquettes (6 atomes, 13 molécules, 16 sections — chiffres
2026-07-23, re-mesurés avant chaque extraction) deviennent des masters propres et
gouvernés, et les ~230 copies brutes deviennent des instances — avec, à **chaque**
adoption, la preuve mesurée que pas un pixel des 9 maquettes n'a bougé.

Approche technique (détail : [research.md](./research.md)) : toutes les opérations
canvas passent par le **pont desktop figma-console** (seule route qui voit la page
locale `Pages`) ; la preuve est portée par un **nouvel instrument déterministe**
`extract/figma/page-parity/` (capture `exportAsync` @1x + comparaison `pixelmatch`
{threshold 0.1, détecteur AA} à dimensions strictes, verdict par maquette, refus
explicite des captures vides) ; chaque opération mutante est précédée d'un **checkpoint**
(`saveVersionHistoryAsync`, retour arrière manuel guidé) ; chaque décision owner est
consignée dans **`decisions.md`** (append-only, committé). Le figma→code est hors
périmètre.

## Technical Context

**Language/Version**: TypeScript 5.x / Node ≥ 20, ESM via `tsx` (instrument Node) ; JavaScript Figma Plugin API (scripts bridge exécutés via le pont)
**Primary Dependencies**: pont desktop figma-console (`figma_execute` + `loadAllPagesAsync` — seule route vers la page `Pages` `210:325`) ; `pixelmatch` + `pngjs` (déjà en devDependencies) ; réutilisation de `readPng`/`writeTriptych` de `extract/figma/visual-parity/img.ts` ; historique de versions natif Figma (`saveVersionHistoryAsync`)
**Storage**: artefacts fichiers committés sous `specs/003-externalize-figma-components/` (decisions.md, inventory/, audits/, ledger/, proofs/) ; PNG de travail gitignorés (`extract/figma/page-parity/out/`, `.page-parity/`) ; `COMPONENT-INVENTORY.md` commité en baseline (T0)
**Testing**: `npm run pages:selftest` (fixtures, sans Figma : identique→0, 1px→écart, vide→refus, dimensions→refus, verdict byte-stable) ; étalonnage live T0 (double capture → 9/9 identical) ; gates existants au **statu quo** (94/97 evals — bloc intentionnel connu ; parity 1 finding déclaré)
**Target Platform**: Node CLI (comparaison/verdicts, exécutable sans Figma) + Figma desktop via le pont (captures et opérations — live-only, nommé comme tel)
**Project Type**: instrument d'outillage (page-parity) + programme d'opérations canvas séquencé — aucun code produit, aucun contrat généré
**Performance Goals**: la propriété load-bearing est le **déterminisme des verdicts** (mêmes entrées → même verdict.json byte-identique), pas la vitesse ; ordre de grandeur attendu : capture 9 maquettes en minutes, comparaison < 30 s/maquette (1728×~8000 px)
**Constraints**: zéro IA dans le chemin du verdict (pixelmatch pur) ; captures toujours fraîches — aucun cache inter-versions (leçon `--refresh` de 001) ; opérations en place sur fichier client → checkpoint avant chaque geste mutant ; page `Pages` invisible côté serveur → pont obligatoire ; `npm run eval` ne tourne pas en worktree → sweep final sur le checkout principal ; parity/evals doivent finir au statu quo
**Scale/Scope**: 35 blocs inventoriés (+ gallery-item inféré) ; ~230 copies à remplacer sur 9 maquettes 1728px ; 145 instances existantes exclues (intactes) ; fondation 14 variables + 8 styles Montserrat ; 18 captures pleine page par incrément d'adoption

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` (v1.0.0). **Évalué avant Phase 0 : PASS.
Ré-évalué après Phase 1 : PASS** — détail par principe :

- [x] **I. Determinism (NON-NEGOTIABLE)** — Le pipeline contrat→surface n'est pas
      touché (aucun contrat, générateur ou sortie générée modifiés). Le **verdict**
      zéro-pixel est 100 % déterministe (pixelmatch, dimensions strictes, selftest de
      stabilité byte-identique). L'IA assiste l'**authorship** des opérations canvas
      (autorisé par le principe) mais ne juge jamais un pixel : tout geste est gaté par
      la mesure.
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — Aucune claim de capacité ajoutée à
      README/docs dans cette spec. L'instrument embarque sa moitié « fixture »
      (`pages:selftest`) ; s'il devient un jour une capacité revendiquée → fixture →
      eval → claim, dans cet ordre (R12). La capture live-only est nommée comme telle.
- [x] **III. Contract is the SSoT** — Aucun contrat modifié ; aucun sync side-to-side.
      Les odeurs de tokens sont traitées **source-side d'abord** (`tokens/*.tokens.json`
      → push, mécanisme de 001) ; règle dure : `npm run parity` au statu quo (1 finding
      déclaré) après chaque geste token (R10).
- [x] **IV. No hand-edited output** — `src/components/`, `figma-sync/*.js`,
      `catalog/catalog.json`, `contracts/contract.schema.json` : non touchés. Les
      maquettes et nouveaux masters Figma ne sont pas des sorties générées.
- [x] **V. Honesty** — Cœur de la spec : capture vide ≠ identique (refus, exit code
      distinct) ; perso non portable → signalée + journal ; bloc introuvable → reporté,
      jamais omis ; anomalie hors périmètre → proposée, jamais corrigée en silence ;
      limites de l'instrument documentées dans son README, là où la capacité vit.
- [x] **VI. Additive evolution** — Aucun changement de schéma, aucun bump de contrat
      (n/a — le figma→code est hors périmètre).
- [x] **VII. Engine integrity** — `core/` non touché (l'instrument vit dans `extract/`,
      côté Node, comme le harnais visuel existant) ; aucun emitter ni mock modifiés. Si
      un bug moteur live-only émergeait pendant les opérations : règle des deux volets
      (fix + mock) applicable, mais aucun n'est planifié.

**All gates green:**

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && node scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && tsc -p tsconfig.build.json
```

Attendu en clôture : **statu quo** — 94/97 evals (les 3 rouges = bloc intentionnel
connu, pas une régression), parity 1 finding déclaré, le reste vert. `npm run eval`
s'exécute sur le checkout principal (pas de `node_modules` en worktree).

**Dérogation écrite (waiver) — gates rouges héritées.** La constitution exige « rien
de rouge au merge » sans dérogation formelle. La présente dérogation, approuvée par
l'owner (analyse du 2026-07-23), couvre EXACTEMENT : les 3 evals en quarantaine
(`baseline-parity-clean`, `baseline-acknowledges-without-failing`,
`promotion-converges`) et le finding parity déclaré — état hérité de la spec 001,
antérieur à 003, qu'aucun geste de cette spec ne touche. Bornage : elle expire à la
levée du bloc Piqueray (chantier séparé, hors 003) et est revue au plus tard à la
clôture (T105). Elle ne couvre AUCUN nouveau rouge : tout écart supplémentaire vs ce
statu quo bloque le merge. À reporter dans le corps de la PR au merge (exigence
constitutionnelle).

## Décisions différées par la spec → tranchées ici

| Question (spec, « Décisions différées ») | Décision | Détail |
|---|---|---|
| Une spec programme ou une par niveau ? | **UNE spec**, 5 phases d'exécution (T0 → T → A → M → S → clôture) | [R7](./research.md) |
| Granularité des incréments ? | **1 bloc = 1 incrément d'adoption** ; 2 lots de **création** pour les net-new (atomes de formulaire ; icônes), validation owner par composant à l'intérieur | [R8](./research.md) |
| Déplacer les masters existants ? | **Non — hors périmètre.** Nouveaux masters sur 3 pages `DS · Atomes / Molécules / Sections` ; les 5 existants ne bougent pas | [R9](./research.md) |

## Project Structure

### Documentation (this feature)

```text
specs/003-externalize-figma-components/
├── plan.md              # Ce fichier
├── research.md          # Phase 0 — 12 décisions (R1–R12)
├── data-model.md        # Phase 1 — entités, cycle de vie, invariants
├── quickstart.md        # Phase 1 — la boucle d'incrément de bout en bout
├── contracts/           # Phase 1 — interfaces tenues pour acquises
│   ├── page-proof.md            # capture + comparaison + verdicts + exit codes
│   ├── inventory-scan.md        # scan par position (jamais par nom)
│   ├── customization-ledger.md  # relevé des personnalisations
│   └── decisions-journal.md     # format du journal owner (append-only)
├── decisions.md         # runtime (T0) — la trace auditable FR-020
├── inventory/           # runtime — scan-<date>.json (le dernier fait foi)
├── audits/              # runtime — audits de source par bloc (FR-006)
├── ledger/              # runtime — <bloc>.json par adoption (FR-012)
├── proofs/              # runtime — <bloc>/verdict.{json,md} + crops d'écarts acceptés
└── tasks.md             # Phase 2 (/speckit.tasks — pas créé par /speckit.plan)
```

### Source Code (repository root)

```text
extract/figma/page-parity/          # NOUVEAU — l'instrument de preuve zéro-pixel
├── README.md                       # limites nommées ici (live-only, périmètre frames)
├── bridge/                         # scripts JS exécutés via figma_execute (versionnés = auditables)
│   ├── capture.js                  # exportAsync @1x × 9 frames + manifestes (read-only)
│   ├── scan.js                     # inventaire par position/signature (read-only)
│   ├── customizations.js           # diff copie ↔ master par position → pré-remplit le ledger (US4)
│   └── checkpoint.js               # saveVersionHistoryAsync("003/<inc>/<étape>")
├── cli.ts                          # entrée « pages:compare » (--before/--after/--out, exit 0/1/2)
├── compare.ts                      # comparaison stricte (pixelmatch 0.1 + AA, dims exactes, refus)
├── report.ts                       # verdict.json + verdict.md + crops-triptyques
├── ledger-check.ts                 # validateur du ledger (« pages:ledger:check », complétude bloquante)
├── selftest.ts                     # fixtures : identique/1px/vide/dimensions/byte-stable
└── fixtures/                       # petites PNG committées pour le selftest

extract/figma/visual-parity/img.ts  # RÉUTILISÉ — readPng/writeTriptych (PAS alignPair, cf. R2)
package.json                        # + scripts « pages:compare », « pages:selftest », « pages:ledger:check »
.gitignore                          # + extract/figma/page-parity/out/ + .page-parity/
COMPONENT-INVENTORY.md              # commité en T0 (baseline lisible, tenu à jour depuis les scans)
```

**Structure Decision** : l'instrument rejoint `extract/figma/` (la maison de tout
l'outillage d'observation Figma du repo), en frère de `visual-parity/` dont il réutilise
la plomberie PNG. Aucun code dans `core/` (rien de browser-pur ici), aucun contrat,
aucune sortie générée. Tout le reste de la spec est de l'**opération canvas** (via le
pont) + des **artefacts de preuve** committés sous `specs/003-…/`.

## Phases d'exécution du programme (cadrage pour /speckit.tasks)

Chaque incrément d'adoption suit la boucle du [quickstart](./quickstart.md) :
re-mesure → audit → checkpoint → master → validation owner → capture before →
checkpoint → adoption + ledger → capture after → preuve → commit.

| Phase | Contenu | Gate de sortie |
|---|---|---|
| **T0 — Harnais** | instrument page-parity + selftest ; sonde transport (R3) ; étalonnage double-capture ; commit inventaire ; scaffold decisions.md ; .gitignore | selftest exit 0 ; étalonnage **9/9 identical** (sinon STOP programme) |
| **T — Tokens** | odeurs proposées à l'owner puis traitées source-side (`space`/`radius`, `imported.orange-*`) ; `nav/state` → report proposé (touche le Button, exclu) | parity statu quo ; preuve pixel 0-diff ; journal |
| **A — Atomes** | 2 lots de création net-new : formulaire (Input, Textarea, Select, Checkbox) puis icônes (sociales, étoile) — validation owner **par composant** ; pas d'adoption (rien à remplacer) | chaque master validé + journalisé |
| **M — Molécules** | 13 blocs + inférés, ordre des dépendances (Field après atomes ; Accordion-row → Accordion ; `item` → 3 masters distincts…) — 1 bloc = 1 incrément prouvé | par incrément : 9/9 identical (ou écart accepté au journal) + ledger complet |
| **S — Sections** | 16 blocs : triviales d'abord (Devis, Présentation, SAV), composites en dernier (Hero et catégories, Footer + Devis) | idem M |
| **Clôture** | scan final SC-003 (zéro copie brute restante) ; honnêteté (tout reporté/signalé listé) ; sweep gates sur le checkout principal ; milestone | gates au statu quo ; SC-001…SC-009 tenus |

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Aucune violation — tableau vide. (Le seul écart aux habitudes du repo est un
instrument **live-only** côté capture, non câblé dans `evals/run.ts` : ce n'est pas une
violation mais une limite nommée, traitée par R12 — selftest à fixtures + aucune claim
de capacité en docs.)
