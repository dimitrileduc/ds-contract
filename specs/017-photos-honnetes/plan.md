# Implementation Plan: Photos honnêtes

**Branch**: `017-photos-honnetes` | **Date**: 2026-08-06 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/017-photos-honnetes/spec.md`

## Summary

017 ne gouverne pas l'image : il répare **deux rapports qui disent le faux** et **une phrase qui manque**. **US1 (P1)** — le sauvetage des photos ne voit aujourd'hui que le composant maître (`core/emit-figma-script.ts:3964`, `:4107`), alors que **255 des 349 photos vivantes sont des surcharges d'instance de page** ; le harvest/restore descend donc aux instances du maître reconstruit, la clé d'appariement passe du **nom** (avec son repli « premier paint non réclamé », `:3850` — la source de l'interversion invisible) à la **position** `(hôte, chemin d'indices)`, et le chemin amend gagne une **pré-passe de refus** exécutée avant le premier `remove()`, levable à la photo près par acquittement écrit. **US2 (P2)** — les huit lignes « frontière image » (99,97 % → 15,64 %, ligne de porte 2 %) ne mesurent aucun défaut : la boucle du live gate appelle `renderVariant` avec **6 arguments** (`extract/figma/visual-parity/run.ts:2002-2009`) alors que le 7ᵉ — `comparisonProps` — **existe déjà** (`render.ts:816`) et que toute la chaîne `$asset` (80 assets épinglés, revérification SHA-256, injection par clone de contrat) est écrite, éprouvée et empruntée par le seul chemin campagne. **US3 (P3)** — la dague `†` est **déjà posée** sur les 9 composants porteurs d'image (vérifié au cliché, pas supposé) ; ce qui manque est la phrase, et la table d'avertissements de la matrice n'a structurellement pas de ligne image.

**Trois découvertes de la recherche dimensionnent ce plan, et deux renversent une affirmation du dépôt.** (1) **Presque tout l'outillage existe** — la réparation d'US2 est de deux champs additifs et d'un argument passé, pas d'un mécanisme neuf ; la promotion de l'instrument photo de 016 est un **déplacement, pas une réécriture**, et 016 l'avait explicitement parquée comme « la décision de 017 ». (2) **`getInstancesAsync` n'a aucun usage dans ce dépôt** et le faux-Figma ne le modélise pas : c'est la seule prémisse non mesurée du plan, elle se **sonde en lecture seule avant** que le moteur s'y adosse, avec un repli nommé (le registre orchestré `(hostId, ordre)`, forme déjà éprouvée par le plan de restauration de 016). (3) **`CLAUDE.md:19` est périmé** : il affirme que la réponse « que devient une image à la régénération ? » n'est pas dans `docs/`, alors que le commit `504dd0a` l'y a mise le 2026-08-04 — c'est `docs/handoff/` qui est muet (2 occurrences de « photo » sur 12 fichiers, toutes narratives), et c'est lui que FR-011 vise.

**Le cœur du chantier est un travail de moteur et d'instrument, sans canevas.** Tout US1 sans tête, tout US2, tout US3 s'exécutent sans le fichier client ouvert : le sans-tête **fait foi**, le fichier client **donne le reçu**. Cette séparation n'est pas un confort — elle est ce qui rend la précondition FR-005 (les 62 photos effondrées, restauration à 016, en attente du pont) bloquante pour le seul vif sans geler le chantier.

## Technical Context

**Language/Version**: TypeScript (pin dépôt `typescript@^6.0.3`), Node ≥ 20, ESM exécuté via `tsx@4.23` ; JavaScript Figma Plugin API (scripts générés `figma-sync/*.js` + scripts de sonde exécutés par le pont)
**Primary Dependencies**: Zod `^4.4.3` (`@ds-contracts/schema` — **non modifié**), `playwright-core@1.61.1` + `pixelmatch@7.2.0` + `pngjs@7.0.0` (instrument de parité visuelle existant), React 19 + CSS Modules (émetteur `react`, non touché), pont desktop **figma-console** (`figma_execute` + `loadAllPagesAsync`, port 9223 — seule route vers la page `Pages` 210:325), Figma REST en **LECTURE** (`FIGMA_TOKEN` — export des échantillons de mesure, dumps)
**Storage**: JSON sur disque — `specs/017-photos-honnetes/{registre/acquittements-photos.json (NOUVEAU), registre/defauts-decouverts.json (NOUVEAU — le point d'atterrissage de FR-009/SC-005), proofs/, contracts/}` · `extract/figma/visual-parity/{subjects.ts, triage.ts, baseline.json, fixture-assets/manifest.json}` · `evals/golden.json` + `figma-sync/plugin/engine.receipt.json` + `examples/polaris/figma/*.figma.js` (**trois re-pins**, research D14) · `contracts/{carte,member-picture,member-card}.contract.json` (**descriptions seules, patch**) · **aucun** `tokens/*.tokens.json`, **aucune** modification de schéma
**Testing**: `npm run eval` (le compte vif imprimé fait foi ; 8 familles C1–C8, cas déclarés dans `evals/run.ts`, fixtures sous `evals/fixtures/`) ; nouvelle fixture `photos-instance-overrides-preserved-check.ts` branchée en claim **`C2-refusal`** ; cas existants étendus, jamais doublés (`img-paint-preserved-on-amend` `run.ts:436`, `img-part-canvas-placeholder-named` `run.ts:5109`) ; `npm run extract:figma:visual` pour la porte de mesure ; `npm run photos:verify` (NOUVEAU script, promotion) pour le reçu photos — **CLI réelle relevée, pas supposée** : deux recensements en arguments **positionnels** (+ `--out`, `--selftest`), le recensement lui-même restant un script de pont ; `--selftest` est son seul mode sans tête
**Target Platform**: Node CLI (instruments), `core/` browser-pure (émetteur), bac à sable Figma Plugin (scripts générés), faux-Figma en VM Node (`scripts/plugin-engine-mock-figma.mjs`, 506 lignes)
**Project Type**: moteur + instruments — pas d'application, pas de nouveau framework
**Performance Goals**: régénération byte-identique ×2 (`npx tsx scripts/deterministic-roundtrip.mjs`) ; deux exécutions successives du contrôle photos et de la porte de mesure rendent des verdicts et des scores **identiques** (SC-009) ; le parcours d'instances reste **borné au maître reconstruit** — un parcours global sature le bac à sable (≈ 5 350 nœuds mesurés) et fait tomber le plugin
**Constraints**: **aucune image n'entre au contrat** (FR-012 ; le schéma le tient déjà par construction — `GRADIENT_LITERAL_RE` refuse une `url()` à la validation) ; l'échantillon de mesure vit dans l'instrument, `runtimeDefault: false` ; la description Figma reste **une seule ligne** (directive owner 2026-07-19) ; le vocabulaire de causes reste **fermé à six** ; `core/` reste sans `node:*` ; **aucune reconstruction sur le fichier client** avant que la restauration des 62 photos (016) soit exécutée et prouvée
**Scale/Scope**: 12 parts image sur 9 contrats · 349 photos vivantes dont **255 surcharges d'instance** · 8 lignes de porte à re-mesurer sur 5 sujets · 37 des 72 scripts générés portent le harvest · 34 contrats au total, dont **3 touchés** (descriptions — compte re-mesuré : 11 props d'URL au dépôt, 3 sans la convention par écrit, dont `ds.member-card` que le « deux sur dix » manquait) et 9 dont la légende change. **Hors périmètre, nommés** : gouverner l'image, `D-016-REPEAT-SAMPLE-PAR-VARIANTE`, `D-016-SECTIONS-LOCALES-CARTES`, **`DW-014-002`** (l'instrument rend `emit-html`, jamais la surface React livrée — 017 répare la *donnée* mesurée, pas la *surface* mesurée), le 2ᵉ plan photo de MemberCard, les 89 littéraux hors géométrie

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` (v1.2.0). Every item MUST be true, or be
justified in Complexity Tracking below.

- [x] **I. Determinism (NON-NEGOTIABLE)** — Aucun modèle dans le chemin contrat→surface. Les trois éditions de moteur (harvest par position, refus, clause de légende) sont des fonctions pures ; `deterministic-roundtrip` rejoué, et les **trois** re-pins faits délibérément (research D14) — `evals/golden.json`, `figma-sync/plugin/engine.receipt.json`, `examples/polaris/figma/*.figma.js`.
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — Ordre tenu : la fixture qui **rejoue la perte du 2026-08-06 est écrite et rouge AVANT** le correctif d'émetteur (quickstart §2). Les trois cas adverses de SC-002 (perte, interversion, sans-accueil) sont écrits avant toute revendication. **Et la doc cesse d'être l'exception** : relevé le 2026-08-06, **aucun cas de `evals/run.ts` ne lisait `docs/`** — la phrase « aucune capacité n'entre en doc avant son eval » n'était donc tenue par rien. T036a la rend exécutoire en épinglant byte-pour-byte la ligne de la matrice et la réponse du paquet d'accueil ; c'est le premier cas du dépôt à lire `docs/`.
- [x] **III. Contract is the SSoT** — **Zéro image n'entre au contrat.** Les trois seules éditions de contrat sont des descriptions manquantes qui *réaffirment* la convention déjà écrite huit fois. Aucune synchronisation surface-à-surface : la photo de maquette reste du contenu Figma, l'échantillon de mesure reste dans l'instrument. `npm run parity` propre.
- [x] **IV. No hand-edited output** — `figma-sync/*.js` (37 porteurs du harvest) et `src/components/` sont **régénérés**, jamais édités ; la source éditée est `core/emit-figma-script.ts`. Les registres et fixtures nouveaux ne sont pas du généré.
- [x] **V. Honesty** — C'est le sujet même de la spec. Trois canaux ajoutés le portent : `verdict: "empeche"` (un contrôle empêché n'est jamais vert), `status: "incomparable"` avec **raison écrite obligatoire, visible et comptée**, et les acquittements imprimés dans leur propre section. Les limites découvertes en instruisant (mutation en place de `fills` acceptée par le mock, plan des 62 photos sans drapeau machine) sont **consignées, pas tues**.
- [x] **VI. Additive evolution** — **Le schéma n'est pas touché.** Tous les élargissements sont additifs : deux champs optionnels sur `ParitySubject`, un cinquième membre à l'union de statuts, un drapeau d'émetteur. Aucune valeur existante n'est repurposée ni narrowée. Semver des deux contrats touchés : **patch** (description seule). `docs/02-contract-spec.md` n'a rien à bumper — aucune capacité de schéma ne change.
- [x] **VII. Engine integrity** — `core/` reste sans `node:*` (`core-browser-check.mjs`). Et le correctif est **explicitement en deux temps** (§VII) : l'émetteur, **puis** le faux-Figma qui apprend les instances miroir, l'`ImagePaint` et `getInstancesAsync`, pour que la classe échoue sans tête pour toujours. C'est la raison d'être de FR-002a, et la forme suit les trois précédents (`981e446`, `ddac778`, `e856844`).
- [x] **VIII. Source cleanliness** — Le relevé qui a produit cette spec est déjà un relevé §VIII : **par POSITION, jamais par nom**, masters **et** usage. Le correctif porte cette discipline dans le moteur — la clé d'appariement passe du nom à la position, précisément pour qu'un renommage de calque ne se lise pas comme une perte et que deux homonymes ne se confondent pas.
- [x] **IX. Docs-first** — Consulté avant de dériver, et cela a changé deux conclusions : la matrice **répond déjà** à la question images-à-la-régénération depuis le 2026-08-04 (le CLAUDE.md l'ignore et sera daté), et la ligne 91 verdicte l'image `CARRY-BOTH (add)`, ce qui explique **structurellement** l'absence de ligne image dans la table §(b) — un fait qu'aucune inférence depuis le code n'aurait donné.
- [x] **X. Before-capture** — Applicable au seul reçu vif (FR-002b) et il est porté au quickstart §5 : capture de l'état avant de **chaque** cible, jamais un sous-ensemble pilote, chaque capture vérifiée non vide et correctement dimensionnée. La précondition FR-005 est la même règle appliquée en amont : rien ne se reconstruit sur le fichier client tant que les 62 photos ne sont pas restaurées et prouvées.
- [x] **XI. Multi-writer bridge** — N/A : un seul écrivain. Les seuls accès au pont sont la **sonde en lecture seule** de D1 et le reçu vif, orchestré en un cycle unique de vérification pixel. Aucun lot parallèle, donc aucune partition à établir.

**All gates green:**

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Portes propres à 017, en plus du sweep : `npm run extract:figma:visual -- --summary` (les huit lignes) et `npm run photos:verify` (le contrôle photos, **sans le fichier client ouvert**).

Specs executing in a git worktree run this sweep INSIDE the worktree (Constitution:
Worktree Gates F1) — `npm install` + `npx playwright install chromium` there first.
(Jamais deux sweeps en parallèle : `evals/.scratch` est un chemin unique.)

## Project Structure

### Documentation (this feature)

```text
specs/017-photos-honnetes/
├── plan.md                                   # ce fichier
├── spec.md
├── research.md                               # D1–D17
├── data-model.md                             # 9 entités + invariants
├── quickstart.md                             # l'ordre d'exécution
├── contracts/
│   ├── preservation-photos.interface.md      # US1 — le geste, les règles, les 3 cas adverses
│   ├── mesure-comparable.interface.md        # US2 — armes égales, statut incomparable, re-classement
│   └── clause-legende.interface.md           # US3 — le texte exact, les 3 gestes de doc
├── checklists/requirements.md
├── registre/acquittements-photos.json        # NOUVEAU — levées owner, liste fermée
├── registre/defauts-decouverts.json          # NOUVEAU — l'atterrissage exigé par FR-009 / SC-005
├── proofs/                                   # depart-sweep, sonde, avant/après, reçus, sweep-cloture
└── tasks.md                                  # Phase 2 — PAS créé par /speckit.plan
```

### Source Code (repository root)

```text
# ÉDITÉ — SOURCE (jamais du généré à la main)
core/emit-figma-script.ts                     # harvest/restore par position + instances ; pré-passe de refus ;
                                              #   drapeau `hasImgPart` → clause de légende (:2764-2771)
scripts/plugin-engine-mock-figma.mjs          # instances miroir · ImagePaint/imageHash · getInstancesAsync
extract/figma/visual-parity/subjects.ts       # + comparisonProps? + fixtureAssetIds?  (additif)
extract/figma/visual-parity/run.ts            # 7e argument passé ; statut "incomparable" + raison ; comptage
extract/figma/visual-parity/triage.ts         # 6 règles des 8 lignes RÉÉCRITES à leur cause re-mesurée
extract/figma/visual-parity/fixture-assets/manifest.json   # + assets member-picture (set 274:2389)
evals/run.ts                                  # cas branchés (une fixture que rien ne lance ne protège rien)
package.json                                  # + script photos:verify
contracts/carte.contract.json                 # description de imageUrl — patch
contracts/member-picture.contract.json        # description de src — patch
contracts/member-card.contract.json           # description de imageUrl — patch (3e trou, re-mesuré)

# NOUVEAU (commité)
evals/fixtures/photos-instance-overrides-preserved-check.ts   # rejoue la perte du 2026-08-06 + 3 cas adverses
extract/figma/photo-parity/                   # PROMOTION de specs/016-canvas-vrai/{bridge,tools}/ —
                                              #   un déplacement, pas une réécriture (016/plan.md:101)
specs/017-photos-honnetes/registre/acquittements-photos.json
specs/017-photos-honnetes/registre/defauts-decouverts.json     # FR-009 / SC-005 — jamais une note en prose seule

# ÉDITÉ — DOCUMENTATION
docs/FIGMA-CAPABILITY-MATRIX.md               # ligne image en §(b) + addendum daté (lacune de TRANSPORT,
                                              #   pas défaut de fidélité mesuré — FR-013)
docs/handoff/08-status-what-doesnt-work.md    # « que devient une image à la régénération ? » (FR-011)
CLAUDE.md                                     # datation du reçu périmé (:19), jamais effacement
ROADMAP.md                                    # datation de :16 — porte encore la prémisse renversée
                                              #   et le « 57/57 photos préservées » que 017 prouve faux

# RÉGÉNÉRÉ, JAMAIS À LA MAIN
figma-sync/*.js                               # 37 des 72 portent le harvest
src/components/ · catalog/catalog.json

# RE-PINS — trois reçus, pas un (research D14)
evals/golden.json
figma-sync/plugin/engine.receipt.json         # dérive dès qu'on touche core/ ; refus nommé au flux 1
examples/polaris/figma/*.figma.js             # le troisième, celui qu'on oublie

# NON TOUCHÉ, délibérément
packages/schema/src/contract-schema.ts        # FR-012 tenu par construction — rien à durcir
tokens/*.tokens.json · l'anatomie et les props des 34 contrats
```

**Structure Decision**. Trois chantiers disjoints, sur trois surfaces qui ne se croisent pas — le moteur (US1, US3), l'instrument de mesure (US2), la documentation (US3) — d'où un plan qui **n'a pas besoin de sérialiser US1 avant US2**. L'ordre de priorité de la spec (P1 → P2 → P3) est un ordre de valeur, pas une dépendance technique : la seule vraie dépendance est la **sonde `getInstancesAsync`, qui précède toute écriture de moteur**, et la précondition FR-005, qui ne bloque que le reçu vif. L'instrument photo de 016 est promu sous `extract/figma/photo-parity/` plutôt que laissé spec-local parce qu'une porte qui vit dans le dossier d'une spec close rouille — et parce que 016 avait parqué cette décision ici, nommément.

## Constitution Check — RE-PASSÉ À LA CLÔTURE (2026-08-06, T050)

Contre ce qui a **réellement** été fait, pas contre ce qui était prévu. Deux écarts, écrits
plutôt que laissés tomber (FR-015).

| § | verdict | ce qui le tient, ou l'écart |
|---|---|---|
| **I. Déterminisme** | ✅ | Aucun modèle dans le chemin contrat→surface. `deterministic-roundtrip` rejoué. Les **trois** re-pins faits **deux fois** (après US1, puis après US3) : `evals/golden.json`, `figma-sync/plugin/engine.receipt.json`, `examples/polaris/figma/*.figma.js` — le troisième a bien bougé (12 fichiers), il était réel |
| **II. Claims rule** | ✅ | La fixture est **rouge avant** le correctif, archivée des deux côtés. **Et la doc cesse d'être l'exception** : le pin documentaire est lui aussi prouvé adverse (un mot → `193/194`) |
| **III. Contrat SSoT** | ✅ | **Zéro image au contrat.** Trois éditions de contrat, descriptions seules, patch. L'échantillon de mesure vit dans l'instrument, `runtimeDefault: false`, injection par clone. `npm run parity` vert |
| **IV. Généré jamais édité à la main** | ✅ | `figma-sync/*.js`, `src/components/`, `catalog/catalog.json` **régénérés**. Source éditée : `core/emit-figma-script.ts`. Vérifié : `npm run figma:plan` en écrit 38 sur 72 — les 34 autres sont des orphelins de renumérotation, nommés en `proofs/depart-legendes.txt` |
| **V. Honnêteté** | ✅ | C'est le sujet. Trois canaux ajoutés le portent (`verdict: "empeche"`, `status: "incomparable"` **fail-closed par le nom**, acquittements imprimés). **Sept** défauts consignés, dont cinq découverts par l'exécution. Les écarts de compte sont **nommés** : 10 légendes changées et non 9, un diagnostic non déterministe au centième |
| **VI. Évolution additive** | ✅ | **Schéma non touché.** Additifs : `AcquittementPhoto` + un champ optionnel sur `FigmaEngineInput` ; trois champs optionnels sur `ParitySubject` ; un 5ᵉ membre à l'union de statuts ; un drapeau d'émetteur. Aucune valeur repurposée. Semver des trois contrats : **patch** |
| **VII. Intégrité du moteur** | ✅ | `core/` reste sans `node:*` (`core-browser-check` vert). Le faux-Figma a appris les trois choses, et il **reproduit la perte** — une surcharge d'instance meurt bien avec le nœud de maître démoli |
| **VIII. Propreté de la source** | ✅ | Le correctif porte la discipline dans le moteur : la clé passe du **nom** à la **position**. Le seul usage de nom qui subsiste est la localisation de **nos propres accueils fraîchement bâtis** — vocabulaire du contrat, pas vocabulaire du designer ; la distinction est écrite à l'endroit où elle s'applique |
| **IX. Docs-first** | ✅ | Consulté avant de dériver, et cela a de nouveau changé des conclusions — la matrice explique **structurellement** pourquoi §(b) n'avait pas de ligne image |
| **X. Before-capture** | ⚠️ **N/A, et c'est la raison qui compte** | Applicable au seul reçu vif, **qui n'a pas eu lieu** (`verdict: "empeche"`). Aucune capture d'avant n'a donc été faite — et aucune mutation de canevas non plus. La règle n'a pas été enfreinte ; elle n'a pas eu à s'appliquer. La pré-passe de refus d'US1 est la **même règle portée dans le moteur** : décider avant de muter |
| **XI. Pont multi-écrivains** | ✅ | N/A — zéro écrivain. Le pont n'a servi qu'à une sonde en lecture, et elle est `empeche` |
| **Worktree Gates (F1)** | ❌ **ÉCART ASSUMÉ** | Le worktree a été créé conformément à F1 (T001), puis **retiré à la demande de l'owner** : les portes ne tournent plus en isolation. Risque pratique faible (aucun autre chantier sur ce dépôt, `evals/.scratch` surveillé). Détail et motif : [`decisions.md`](decisions.md) O-2 |
| **T012, à la lettre** | ❌ **ÉCART ARGUMENTÉ** | Le repli « premier paint non réclamé » est **narrowé**, pas supprimé : le supprimer sèchement aurait perdu la photo du Hero à chaque régénération (cas mesuré, eval verte depuis le 2026-07-26). Le choix **arbitraire** disparaît, une **bijection d'ordre** le remplace. Détail : [`decisions.md`](decisions.md) O-1 |

## Complexity Tracking

Aucune violation constitutionnelle. **Quatre points frontière, nommés plutôt que tus** :

| Point | Ce que c'est | Pourquoi ce n'est pas une violation |
|---|---|---|
| **Une prémisse non mesurée entre au plan** | `getInstancesAsync` n'a aucun usage dans ce dépôt et le faux-Figma ne le modélise pas | Elle est **sondée en lecture seule avant** que le moteur s'y adosse, et porte un **repli nommé** (registre orchestré `(hostId, ordre)`, forme déjà éprouvée par `photos-instances.json`). C'est la règle du dépôt appliquée — une décision du dépôt n'est pas un fait — pas une entorse |
| **Un instrument change de maison** | promotion `specs/016-…/{bridge,tools}/` → `extract/figma/photo-parity/` + un script npm | Déplacement sans réécriture, décision explicitement parquée pour 017 par `016/plan.md:101`. Le coût est un script npm et la couverture `tsconfig` ; le bénéfice est une porte qui ne rouille pas dans un dossier clos |
| **US2 répare la donnée mesurée, pas la surface mesurée** | après 017, les huit lignes sont honnêtes — sur `emit-html`, qui n'est pas la surface que les consommateurs installent | `DW-014-002` est **hors périmètre et le reste** ; la roadmap le tient pour « le plus gênant ». Le risque réel est qu'on le croie fermé par la remise à armes égales : c'est pour cela qu'il est écrit ici, dans le contrat d'interface d'US2, et au registre |
| **La porte vive ne tourne pas en intégration continue** | le reçu FR-002b exige le fichier ouvert, le pont branché, une fenêtre owner | C'est assumé par la spec : **le sans-tête fait foi, le vif donne le reçu**. La porte du dépôt est le cas d'eval adossé au faux-Figma, qui tourne partout et sans le fichier client |
| **US3 s'arrête à la surface générée** | la clause est émise et épinglée sans tête, mais le **canevas ne la reçoit qu'au lot de régénération** de la fenêtre vive — et `npm run parity` ne compare pas les descriptions (`parity/diff.ts` ne lit jamais ce champ), donc rien n'alerte sur l'écart | Nommé plutôt que supposé acquis : **SC-006** (émis, prouvé sans tête) et **SC-006-vif** (lu par un designer dans Figma) sont deux critères distincts. Croire le second acquis parce que l'émetteur émet, ce serait refaire exactement le défaut que 017 répare — un rapport vert sur un fait non vérifié |
