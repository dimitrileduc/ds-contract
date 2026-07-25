# Implementation Plan: Spec A — Source Figma propre avant extraction

**Branch**: `005-figma-source-cleanup` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-figma-source-cleanup/spec.md`

## Summary

Itération **100 % canvas** sur le fichier client `Piqueray (Copy)` : les masters mentent
(≈69 noms par défaut, 4 axes `Property 1`, 15 descriptions vides, 3 affordances
officieuses, 0 des 8 styles de texte appliqué, 5 coquilles à 88 px au lieu de 89, un
Footer construit à l'ancienne, une page fourre-tout héritée de l'import initial) — on les
rend vrais **avant** que la Spec B ne grave ces noms dans des contrats versionnés.

Approche : aucun nouvel outillage. On réutilise **tel quel** l'instrument
`extract/figma/page-parity/` de la 003 (capture `exportAsync` @1x des 9 maquettes via le
pont desktop, comparaison `pixelmatch` déterministe à dimensions strictes, verdict par
page, refus explicite des captures vides) et sa discipline : version enregistrée avant
chaque passe, capture **avant** sur les 9 pages, diff **annoncé avant** exécution, verdict
mécanique. Le levier de cadence est le **groupement** : tout ce qui ne peut pas déplacer un
pixel par construction (noms, descriptions, liaisons de variables, déplacements de masters)
part en lots partageant un seul cycle ; seuls les gestes à effet visuel consomment un cycle
chacun. **12 cycles projetés** contre les ~30 de la 003 pour un périmètre comparable.

Le dépôt n'est pas modifié (FR-033) : ni contrat, ni composant généré, ni token. La seule
exception est un **assouplissement de 4 caractères** dans la regex de libellé de
`bridge/checkpoint.js` (justifié en Complexity Tracking) — sans lui, les points de version
de cette itération mentiraient en s'annonçant `003/…`.

## Technical Context

**Language/Version**: JavaScript Figma Plugin API (scripts bridge exécutés via le pont) ; TypeScript 5.x / Node ≥ 20 ESM via `tsx` pour l'instrument existant — **aucun nouveau code applicatif**
**Primary Dependencies**: pont desktop **figma-console** (`figma_execute` + `loadAllPagesAsync` — seule route vers la page `Pages` `210:325`) ; `extract/figma/page-parity/` réutilisé tel quel (cli/compare/report/selftest/ledger-check + `bridge/{scan,capture,checkpoint,customizations}.js` + `receiver.mjs` port 9227) ; `pixelmatch` + `pngjs` ; historique de versions natif Figma (`saveVersionHistoryAsync`)
**Storage**: artefacts committés sous `specs/005-figma-source-cleanup/` (`decisions.md`, `releves/`, `proofs/<cycle>/`, `ledger/`, `RAPPORT-CLOTURE.md`) ; PNG de travail gitignorés (`.page-parity/`, `extract/figma/page-parity/out/` — déjà couverts)
**Testing**: `npm run pages:selftest` (5 fixtures, sans Figma) ; **étalonnage live obligatoire** en ouverture (double capture sans geste → 9/9 `identical`, sinon STOP programme) ; `npm run pages:ledger:check` sur l'unique adoption (Section-header) ; gates du dépôt au **statu quo** (8/8, suite **108/108**)
**Target Platform**: Figma desktop via le pont (écritures canvas — live-only, nommé comme tel) + Node CLI (verdicts, exécutables sans Figma)
**Project Type**: programme d'opérations canvas séquencé — aucun code produit, aucun contrat généré, aucun token dépôt touché
**Performance Goals**: la propriété load-bearing est le **déterminisme du verdict** (mêmes entrées → `verdict.json` byte-identique), pas la vitesse ; cadence cible **≤ 12 cycles** (SC-009)
**Constraints**: 100 % source de design (FR-033) ; zéro IA dans le verdict ; captures toujours fraîches (aucun cache — leçon `--refresh` de 001) ; **capture avant sur les 9 pages, jamais un pilote** (règle before-capture) ; version enregistrée avant chaque grosse passe (FR-040) ; archive vectorielle avant tout geste destructif (FR-031) ; `npm run eval` ne tourne pas en worktree → sweep final sur le checkout principal
**Scale/Scope**: 52 masters au départ → **55** à la clôture (+ Nav-item, + Header organism, + Hero vidéo) ; ≈69 échos de noms par défaut dont la racine est dans 18 masters d'icônes ; **15** descriptions à écrire ; 5 coquilles 88→89 px ; 6 adoptions Section-header ; 9 maquettes 1728 × ~8000 px ; **1 page supprimée** (`Assets`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` (v1.0.1). **Évalué avant Phase 0 : PASS.
Ré-évalué après Phase 1 : PASS** — détail par principe :

- [x] **I. Determinism (NON-NEGOTIABLE)** — Le pipeline contrat→surface n'est pas touché :
      aucun contrat, générateur ou sortie générée modifiés. Le **verdict** pixel est 100 %
      déterministe (`pixelmatch` seuil 0.1 + détecteur AA, dimensions strictes, selftest de
      stabilité byte-identique). L'IA assiste l'**authorship** des gestes canvas (autorisé)
      mais ne juge jamais un pixel : tout geste est gaté par la mesure, jamais par
      l'appréciation.
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — **Aucune claim de capacité** ajoutée à
      README/docs par cette itération. L'instrument réutilisé porte déjà sa moitié
      « fixture » (`pages:selftest`) et ses limites sont documentées dans son propre README,
      là où la capacité vit.
- [x] **III. Contract is the SSoT** — Aucun contrat modifié, aucun sync side-to-side. La
      divergence contrat ↔ source ouverte volontairement (FR-039, renommage de l'axe du
      Bouton) est un **livrable écrit** légué à la Spec B, où elle deviendra un bump
      **majeur** — c'est le chemin de promotion du principe III, pas un contournement.
      `npm run parity` reste au statu quo (l'ancre du contrat est `componentSetKey` +
      `nodeId`, insensible au changement de page).
- [x] **IV. No hand-edited output** — `src/components/`, `figma-sync/*.js`,
      `catalog/catalog.json`, `contracts/contract.schema.json` : non touchés. Les masters
      Figma ne sont pas des sorties générées du pipeline.
- [x] **V. Honesty** — Cœur de l'itération : capture vide ≠ identique (exit 2, refus) ;
      valeur sous le seuil 3× → laissée **et listée** ; divergence contrat ouverte → écrite
      au rapport (SC-017) ; dépassement de budget → signalé quand constaté, jamais rattrapé
      en fusionnant des gestes visuels ; master hors registre → déplacé, jamais perdu par
      effet de bord.
- [x] **VI. Additive evolution** — Aucun changement de schéma, aucun bump de contrat
      (le figma→code est hors périmètre). Le bump majeur induit par FR-039 est **annoncé**
      ici et **exécuté** en Spec B, avec sa revue de diff de contrat.
- [x] **VII. Engine integrity** — `core/` non touché ; aucun emitter, aucun mock modifié.
      L'unique édition de dépôt (regex de libellé du checkpoint) vit dans `extract/`, côté
      Node, hors du graphe de `core/`.

**All gates green:**

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Attendu en clôture : **statu quo strict** — 8/8 gates verts, suite **108/108**, `parity`
zéro écart actif. Aucune dérogation n'est demandée : contrairement à la 003, il n'y a plus
de bloc rouge hérité (les 3 evals quarantainés sont verts depuis `c8512f7`). Tout rouge
apparaissant pendant l'itération est donc, par construction, une régression — et bloque.
`npm run eval` s'exécute sur le checkout principal (pas de `node_modules` en worktree).

## Décisions différées par la spec → tranchées ici

| Question (spec / checklist « arbitrage pendant le plan ») | Décision | Détail |
|---|---|---|
| Product-card : propriété booléenne ou retrait du bouton caché ? | **Propriété BOOLEAN officielle** (`Bouton`, défaut `false`) | [R7](./research.md) |
| member-picture : axe d'état nommé ou variant de survol retiré ? | **Axe d'état nommé** `État = Défaut \| Survol` | [R7](./research.md) |
| Règle 3× : on compte les occurrences où, exactement ? | **Dans les masters du périmètre seulement**, jamais dans les échos d'instances ; relevé committé avant le lot | [R8](./research.md) |
| Découpe fine de l'en-tête de navigation | **Nav-item** (brique ×4) + **Header** (organism, 2 variantes de fond, axe renommé) ; aucun master `Nav` intermédiaire | [R9](./research.md) |
| Budget de cycles : les 41 exigences tiennent-elles en 12 ? | **Oui — 12 cycles + 1 étalonnage**, par groupement agressif du zéro-pixel ; risque de 13 nommé | [R3](./research.md) |
| Comment nommer un point de version pour cette itération ? | Libellé `005/<passe>/<étape>` → **assouplissement de la regex** de `checkpoint.js` | [R2](./research.md), Complexity Tracking |

## Project Structure

### Documentation (this feature)

```text
specs/005-figma-source-cleanup/
├── plan.md                  # Ce fichier
├── spec.md                  # L'exigence (9 US · 41 FR actives · 17 SC)
├── research.md              # Phase 0 — 12 décisions (R1–R12)
├── data-model.md            # Phase 1 — entités, cycle de vie, invariants
├── quickstart.md            # Phase 1 — la boucle d'un cycle, de bout en bout
├── contracts/               # Phase 1 — interfaces tenues pour acquises
│   ├── proof-cycle.md               # capture → geste → capture → verdict → artefacts
│   ├── gesture-record.md            # le quadruplet par geste (FR-027 / SC-015)
│   ├── naming-conventions.md        # ce qu'est un nom faux, et ce qui le remplace
│   └── scope-inventory.md           # ce qu'est « le périmètre », relevé par position
├── checklists/requirements.md       # (existant) qualité de la spec
├── decisions.md             # runtime — journal owner append-only
├── releves/                 # runtime — scans lecture seule datés (périmètre, 3×, structure)
├── proofs/<cycle>/          # runtime — verdict.{json,md} + crops triptyques
├── ledger/                  # runtime — section-header.json (unique adoption)
├── RAPPORT-CLOTURE.md       # runtime — le livrable de sortie (FR-027/032, SC-015/017)
└── tasks.md                 # Phase 2 (/speckit.tasks — pas créé par /speckit.plan)
```

### Source Code (repository root)

```text
extract/figma/page-parity/          # RÉUTILISÉ TEL QUEL — aucun fichier ajouté
├── cli.ts · compare.ts · report.ts · selftest.ts · ledger-check.ts
├── receiver.mjs                    # port 9227
└── bridge/
    ├── scan.js                     # relevés par position (lecture seule)
    ├── capture.js                  # exportAsync @1x → receiver (lecture seule)
    ├── customizations.js           # pré-diff copie ↔ master (adoption Section-header)
    └── checkpoint.js               # ⚠ SEULE édition dépôt : regex de libellé 003 → \d{3}
```

**Structure Decision** : **aucune nouvelle structure de code.** Le livrable est
canvas + artefacts de preuve. L'instrument de la 003 couvre déjà l'intégralité du besoin
(capture, comparaison, verdicts, refus, checkpoints, pré-diff, ledger) et il est prouvé par
ses fixtures ; en réécrire une variante serait du code non demandé et un second harnais à
maintenir. Les scripts de geste (renommages en masse, écriture de descriptions,
déplacements de masters) sont des **scripts jetables** exécutés via `figma_execute`,
transcrits verbatim dans `proofs/<cycle>/gestes.md` — auditables sans être versionnés
comme de l'outillage : ils ne sont ni réutilisables ni testables headless.

## Phases d'exécution (cadrage pour /speckit.tasks)

Ordre imposé par 3 contraintes dures : **noms d'abord** (règle 4 du brief — un nom faux
devient un identifiant faux), **coquille du Header nav avant son éclatement** (corriger
2 variantes existantes coûte moins que corriger 2 masters neufs), **Section-header à
1550 px avant son adoption ×6** (sinon on propage une géométrie qui va changer).

| Phase | Contenu | Cycles | Gate de sortie |
|---|---|---|---|
| **P0 — Ouverture** | `pages:selftest` ; receveur ; scan de périmètre + relevé 3× ; version `005/ouverture/etalonnage` ; **étalonnage double capture** ; scaffold `decisions.md` | É (contrôle) | **9/9 identical** — sinon STOP programme, retour owner |
| **P1 — Noms & descriptions** | ≈69 échos par renommage des 18 masters d'icônes + logo + member-picture + Bouton (axe + faute) + Header nav (axe) + collision « Présentation » + « Presentation »→« Présentation » + `Frame 8`/`Text`/`Vector` des organisms + titre Hero ; **15 descriptions** | L1 | 0 pixel (9/9) |
| **P2 — Variables & styles** | style de texte 54 (8 titres Hero) ; liaisons `color/blanc` ×2, `color/noir-bleute` (Accordion Petit), Devis ; **ajout** de variables pour les valeurs hors palette atteignant 3× ; valeurs sous le seuil listées | L2 | 0 pixel (9/9) + relevé 3× publié |
| **P3 — Affordances** | Product-card → BOOLEAN ; Tab `État3` supprimé (**archive d'abord**) ; member-picture → axe d'état nommé | L3 | 0 pixel (9/9) + archive vérifiée |
| **P4 — Géométrie** | coquille Header nav · Devis · SAV (piège GROUP traité **avant** écriture) · Réassurances ×3 ; Section-header 1552→1550 | V1–V5 | par cycle : diff observé == diff annoncé |
| **P5 — Composition** | Footer reconstruit (auto-layout + instances sociales + coquille, **archive d'abord**) ; adoption Section-header ×6 + master Hero vidéo (lot attendu 0 px, pré-diff structurel préalable) | V6, L5 | V6 : conforme à l'annoncé · L5 : 0 pixel + ledger complet |
| **P6 — Strates** | déplacements `Assets` → `DS · Atomes` / `DS · Tokens` (18 icônes réunies, fantôme déplacé+marqué) ; éclatement Header nav → Nav-item + Header ; **suppression de la page** | L4 | 0 pixel (9/9) + **0 instance cassée**, vérifié master par master |
| **P7 — Fix design** | Tab : retrait du soulignement de `Défaut` — l'**unique** fix design, isolé | V7 | diff limité aux maquettes portant un Tab, validé **sur crop** |
| **P8 — Clôture** | suppression de la page d'archive (+ preuve) ; `RAPPORT-CLOTURE.md` (quadruplet par geste, divergences nommées, valeurs sous seuil) ; sweep 8/8 sur le checkout principal | — | SC-001…SC-017 tenus ; gates au statu quo |

**Budget** : 12 cycles de preuve + 1 étalonnage, contre les ~30 de la 003. Le risque de
passer à 13 est nommé d'avance : si le pré-diff structurel de P5 révèle un delta sur l'un
des 6 organisms ou sur le hero vidéo, ce geste sort du lot L5 et prend son cycle propre —
signalé **au moment constaté** (SC-009), jamais rattrapé en fusionnant deux gestes visuels.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Aucune violation constitutionnelle. Une **entorse à FR-033** (« l'itération n'écrit que dans
la source de design »), assumée et bornée :

| Écart | Pourquoi nécessaire | Alternative rejetée parce que |
|---|---|---|
| `extract/figma/page-parity/bridge/checkpoint.js` : regex `^003\/…` → `^\d{3}\/…` (+ message d'erreur) | FR-040 exige un point de version **avant chaque grosse passe** et FR-027 exige son identifiant au rapport. Le validateur refuse tout libellé non préfixé `003/`. Sans l'assouplissement, aucune passe de la 005 ne peut poser de checkpoint conforme. | (a) **Préfixer les libellés `003/`** — un point de version qui ment sur l'itération qui l'a posé, dans l'historique d'un fichier client : exactement la classe « omission/mensonge silencieux » que le principe V classe la plus grave. (b) **Dupliquer `checkpoint.js` en `checkpoint-005.js`** — un second harnais à maintenir pour 4 caractères, et deux validateurs qui divergeront. |

L'écart ne touche **ni** contrat, **ni** composant généré, **ni** token — les trois objets
que FR-033 protège nommément. Il vit dans `extract/`, hors du graphe de `core/`, et se
limite à généraliser un numéro de spec codé en dur.
