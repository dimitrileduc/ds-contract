# Implementation Plan: Spec 007 — Canvas : rendre la source Figma extractible

**Branch**: `007-figma-extractable-source` | **Date**: 2026-07-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-figma-extractable-source/spec.md`

## Summary

Itération **100 % canvas** sur `Piqueray (Copy)` : le fichier est propre pour un humain
depuis la 005, il ne l'est pas pour un extracteur — **les noms ne sont pas des identifiants
et les valeurs ne sont pas des tokens**. On ferme cet écart avant que la spec suivante ne
grave ces noms dans des contrats versionnés (un nom entré dans un contrat adopté coûte un
**bump majeur** à en sortir).

Approche : **aucun nouvel outillage applicatif**. On réutilise `extract/figma/page-parity/`
tel quel — et la recherche a établi qu'il est déjà agnostique au périmètre, donc l'extension
aux pages DS exigée par Q4/FR-020 se fait **par les cibles passées à `capture.js`**, sans une
seule ligne de dépôt modifiée (R1). Deux livrables outillés naissent sous le dossier de la
spec : l'**oracle de nommage** (valide la table FR-030 hors ligne, avant tout geste) et le
**compteur de notes** (aucun n'existe dans le dépôt — R3), tous deux hors `core/`.

Le levier de cadence est le **groupement** : à 43 cibles de mesure par cycle (contre 18 en
005), un cycle par geste est intenable ; tout ce qui ne peut pas déplacer un pixel par
construction part en lots partageant un cycle.

**Trois constats de la Phase 0 modifient le périmètre écrit dans la spec.** Ils sont
consignés ici (O1–O4) et **routés dans les gates que la spec impose déjà** — trois dans la
revue owner de la table de nommage (FR-030, un seul bloc), un dans le relevé d'ouverture.
Aucun ne bloque la génération des tâches :

1. **Le chantier 1.3 est déjà fait à ~90 %** — le cycle 14 (`d8b0d27`) a livré les 11
   dé-GROUP et les 7 adoptions Section-header, et Section-header est **déjà en FILL**
   (vérifié live). Le backlog qui fonde US3 est périmé d'un cycle (R10).
2. **Le compteur « 41 styles non dérivés » ne peut pas atteindre zéro** sans une édition
   dépôt que FR-025 interdit : il est gouverné par une regex de `core/token-corpus.ts`, pas
   par le canvas (R9). SC-002 et FR-025 se contredisent.
3. **Retirer les accents ne suffit pas** : la classe A (36 cas) exige le PascalCase strict,
   ce qui renommerait les 15 icônes du registre 002 et 7 molécules kebab (R5).

## Technical Context

**Language/Version**: JavaScript Figma Plugin API (scripts de geste exécutés via le pont) ; TypeScript 5.x / Node ≥ 20 ESM via `tsx` pour l'instrument existant — **aucun nouveau code applicatif dans le dépôt**
**Primary Dependencies**: pont desktop **figma-console** (`figma_execute` + `loadAllPagesAsync`, port 9223 — seule route vers la page `Pages` `210:325`) ; `extract/figma/page-parity/` réutilisé **tel quel** (cli/compare/report/selftest/ledger-check + `bridge/{scan,capture,checkpoint}.js` + `receiver.mjs` port 9227) ; `pixelmatch` + `pngjs` ; `core/propose-figma.ts` (`proposeBatchFromDump`, pur, appelé en lecture) ; historique de versions natif Figma (`saveVersionHistoryAsync`)
**Storage**: artefacts committés sous `specs/007-figma-extractable-source/` (`decisions.md`, `releves/`, `naming-table.md`, `proofs/<cycle>/`, `RAPPORT-CLOTURE.md`) ; PNG de travail gitignorés (`.page-parity/`, `extract/figma/page-parity/out/`) ; dump du relevé **non committé** (~300 KB, reproductible)
**Testing**: `npm run pages:selftest` (5 fixtures, sans Figma) ; **étalonnage live bloquant sur les 43 cibles** en ouverture ; l'**oracle de nommage** comme test d'acceptation hors ligne de la table FR-030 ; gates du dépôt au **statu quo** (8/8)
**Target Platform**: Figma desktop via le pont (écritures canvas, live-only) + Node CLI (verdicts et compteurs, exécutables sans Figma)
**Project Type**: programme d'opérations canvas séquencé — aucun contrat, aucun token, aucun composant généré modifié
**Performance Goals**: la propriété load-bearing est le **déterminisme du verdict** (mêmes entrées → `verdict.json` byte-identique), pas la vitesse
**Constraints**: 100 % source de design (FR-025) ; zéro IA dans le verdict ; captures toujours fraîches (aucun cache) ; **capture avant sur les 43 cibles, jamais un pilote** (règle before-capture) ; version enregistrée avant chaque passe (FR-023) ; aucun rollback rétroactif ; écrivains parallèles autorisés sur **zones disjointes** avec un seul cycle global (FR-029)
**Scale/Scope**: 55 masters (14 sets + 41 composants autonomes, vérifié live) · 57 propriétés · 18 styles de texte · 62 variables existantes · **43 cibles de mesure** (9 maquettes + 34 sections DS) · départ mesuré : 36 notes classe A, 10 classe B, 10 classe C, 22 collisions, 193 valeurs sans token, 41 styles non dérivés

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` (v1.1.0). **Évalué avant Phase 0 : PASS.
Ré-évalué après Phase 1 : PASS**, avec une entorse bornée à FR-025 (Complexity Tracking).

- [x] **I. Determinism (NON-NEGOTIABLE)** — Le pipeline contrat→surface n'est pas touché.
      Le **verdict** pixel est 100 % déterministe (`pixelmatch` seuil 0.1 + détecteur AA,
      dimensions strictes, byte-stabilité prouvée par `pages:selftest` cas 5). L'oracle de
      nommage et le compteur de notes sont des **fonctions pures** du dépôt appelées en
      lecture. L'IA assiste l'authorship des gestes canvas (autorisé) et ne juge jamais un
      pixel ni un compteur.
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — **Aucune claim de capacité** ajoutée à
      README/docs. L'extension du périmètre de mesure ne change pas le code de l'instrument :
      elle lui passe d'autres cibles. Sa moitié « fixture » (`pages:selftest`) reste valable
      telle quelle, et la limite « périmètre = 9 maquettes » de son README devient une
      divergence documentaire **nommée** (Complexity Tracking), pas une claim silencieuse.
- [x] **III. Contract is the SSoT** — Aucun contrat modifié, aucun sync side-to-side. Les
      divergences contrat ↔ canvas ouvertes volontairement (renommage des 5 masters adoptés,
      FR-008 ; renommage des icônes du registre, R11) sont un **livrable écrit** légué à la
      spec suivante, où elles deviendront des bumps majeurs — c'est le chemin de promotion du
      principe III, pas un contournement. `npm run parity` reste vert : il lit des
      **snapshots committés**, jamais le fichier live (R11).
- [x] **IV. No hand-edited output** — `src/components/`, `figma-sync/*.js`,
      `catalog/catalog.json`, `contracts/contract.schema.json` non touchés. Les masters Figma
      ne sont pas des sorties générées du pipeline.
- [x] **V. Honesty** — Cœur de l'itération. Capture vide ≠ identique (exit 2, refus) ; le
      compteur des 41 styles est **re-cadré et nommé**, jamais fondu dans un zéro (R9) ; les
      compteurs périmés du backlog sont re-relevés, jamais recopiés (R10) ; les 4 résidus
      acquittés sont suivis à chaque cycle (FR-024a) ; le préfixage des noms de capture existe
      précisément pour qu'aucune cible ne soit écrasée **en silence** (R1).
- [x] **VI. Additive evolution** — Aucun changement de schéma, aucun bump de contrat ici. Les
      bumps majeurs induits sont **annoncés** ici et **exécutés** par la spec suivante.
- [x] **VII. Engine integrity** — `core/` non touché ; aucun emitter, aucun mock modifié. Le
      compteur de notes **importe** `core/propose-figma.ts` sans le modifier, et vit hors de
      son graphe.
- [x] **VIII. Source cleanliness** — L'itération **est** l'étape 0 de la spec suivante : elle
      audite et nettoie la source AVANT extraction, masters **et** usage, le relevé se faisant
      par position et jamais par nom (le nom est justement l'objet du défaut).

**All gates green:**

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Attendu en clôture : **statu quo strict**, 8/8 verts, aucun snapshot rafraîchi. Réserve
mesurée (R11) : `parity` porte une **péremption de snapshot à 14 jours** depuis le
2026-07-25 ; au-delà (soit vers le **2026-08-08**), il rougit pour une raison étrangère au
travail. Échappatoire prévue et nommée : `MAX_SNAPSHOT_AGE_DAYS` en variable d'environnement —
jamais une édition de dépôt, **et jamais une note d'exécution silencieuse** : c'est une
suppression de gate au sens de §Governance, donc un **waiver time-boxed à écrire dans la PR**
et un rouge à re-montrer au rapport de clôture (Complexity Tracking, 4ᵉ ligne).

## Décisions tranchées pendant le plan

| Question | Décision | Détail |
|---|---|---|
| Comment étendre le périmètre de mesure aux pages DS sans toucher au dépôt ? | Par les **cibles** passées à `capture.js` (nodeId), l'instrument étant déjà agnostique | [R1](./research.md) |
| Quelles cibles exactement ? | **43** : 9 maquettes + 5 (Atomes) + 13 (Molécules) + 16 (Organisms) ; `DS · Tokens` entre au cycle FR-031 | [R1](./research.md) |
| Comment éviter qu'une capture en écrase une autre ? | **Préfixe de page** obligatoire dans le nom de cible (`DS-Atomes__Formulaire`) — 12 noms de section se répètent entre pages | [R1](./research.md) |
| Comment valider la table de nommage **avant** le premier geste ? | Un **oracle** transcrivant verbatim `pascalComponentName` / `componentIdSlug` / `canonicalPropName` ; critère : les trois notes ne se déclenchent plus | [R5](./research.md) |
| Comment compte-t-on les notes, puisque rien ne les compte ? | Appel direct à `proposeBatchFromDump` + classement par **préfixe stable** (6 classes citées) ; jamais de regex sur le markdown | [R3](./research.md), [R4](./research.md) |
| Faut-il un étalonnage, alors que la 003 en a déjà passé un ? | **Oui, obligatoire** : 34 des 43 cibles n'ont jamais été mesurées, leur plancher de bruit est inconnu | [R2](./research.md) |
| Les tokens space/radius sont-ils à construire ? | **Non, à compléter** : `space` (0,4,10,16,32), `radius` (32), `border-width` (0,2) existent déjà — la 003 avait refusé de les **étendre**, pas de les créer | [R7](./research.md) |
| Les 8 rôles `typography.*` portent-ils l'interligne ? | **Non** — 8 rôles × 3 props (family/size/weight). L'interligne est à ajouter aux 8, plus 10 rôles neufs | [R7](./research.md), [R8](./research.md) |

## Les quatre arbitrages Phase 0 — où chacun se tranche

Aucune cérémonie séparée : le seul verrou reste celui que la spec pose déjà — **aucun geste
canvas avant la table de nommage validée** (FR-030 / SC-015). Trois des quatre points se
tranchent dans cette revue-là, le quatrième au relevé d'ouverture. La génération des tâches
(`/speckit.tasks`) n'attend rien.

| # | Point | Où il se tranche | Recommandation du plan |
|---|---|---|---|
| **O1** | PascalCase strict pour les **36** masters — dont les 15 icônes du registre 002 (`chevron-right` → `ChevronRight`) et 7 molécules kebab (`Section-header` → `SectionHeader`) ; retirer les accents **ne suffit pas** (R5) | **La revue de la table** : les 36 lignes y figurent, chacune CLEAN à l'oracle ; une ligne rayée par l'owner = note résiduelle comptée à part, jamais un zéro menti | Accepter — seule voie vers SC-001/SC-003 à zéro ; la divergence registre ↔ canvas qui s'ouvre est léguée nommément (contrat naming-table §7) |
| **O2** | Les **41 styles non dérivés** de SC-002 sont mécaniquement inatteignables sous FR-025 (R9) | `decisions.md` à l'ouverture + rapport de clôture — la spec prévoit déjà « toute exception restante est nommée et comptée à part, jamais fondue dans le zéro » | Re-cadrer : zéro sur les 193 valeurs numériques ; les 41 = limite nommée léguée avec le trou d'émetteur n° 1 ; SC-013 (18/18 liés + marqués) est le reçu réel du lot typo |
| **O3** | **10 valeurs de variant** non-ASCII (`Défaut`, `Sélectionné`, `4 cartes · 2 CTA`…), couvertes par aucune FR (R6) | **La même revue de table** — 10 lignes de plus | Les inclure — c'est la classe que la prépa chiffre en bump **majeur** (précédent « Outilne noir ») |
| **O4** | Le chantier 1.3 est déjà livré par le cycle 14 ; reste **1** GROUP résiduel `Header + Hero + Cat` (`237:970`) (R10) | **Le relevé d'ouverture** — FR-016/FR-018 passent en vérification-seulement si le fait accompli se confirme ; les compteurs « départ : 11 » / « FIXED 1550 » sont périmés | Dé-grouper le résiduel si le pré-relevé de structure le donne 0 pixel (spike `figma.ungroup`, jamais utilisé dans le dépôt) ; sinon le nommer |

## Project Structure

### Documentation (this feature)

```text
specs/007-figma-extractable-source/
├── plan.md                  # Ce fichier
├── spec.md                  # L'exigence (4 US · 41 FR · 19 SC, après amendement du 2026-07-26)
├── research.md              # Phase 0 — R1–R12 + O1–O4
├── data-model.md            # Phase 1 — entités, cycle de vie, invariants
├── quickstart.md            # Phase 1 — la boucle d'un cycle, de bout en bout
├── contracts/               # Phase 1 — interfaces tenues pour acquises
│   ├── proof-cycle.md               # AMENDE celui de la 005 : périmètre 43 cibles
│   ├── naming-table.md              # le format de la table FR-030 + l'oracle
│   ├── note-census.md               # la procédure du relevé + les 6 classes (SC-011)
│   └── scope-inventory.md           # ce qu'est « le périmètre », relevé par position
├── checklists/requirements.md       # (existant) qualité de la spec
├── tools/                   # outillage de spec — hors dépôt applicatif (FR-025)
│   ├── name-oracle.mjs              # valide un nom candidat hors ligne (R5)
│   └── note-census.mjs              # proposeBatchFromDump → comptes par classe (R3)
├── decisions.md             # runtime — journal owner append-only
├── naming-table.md          # runtime — ancien → nouveau, validé owner AVANT tout geste
├── releves/                 # runtime — relevés datés (ouverture, structure, clôture)
├── proofs/<cycle>/          # runtime — verdict.{json,md} + crops + gestes.md
├── RAPPORT-CLOTURE.md       # runtime — le livrable de sortie
└── tasks.md                 # Phase 2 (/speckit.tasks — pas créé par /speckit.plan)
```

### Source Code (repository root)

```text
extract/figma/page-parity/          # RÉUTILISÉ TEL QUEL — aucun fichier modifié
├── cli.ts · compare.ts · report.ts · selftest.ts · ledger-check.ts
├── receiver.mjs                    # port 9227
└── bridge/
    ├── capture.js                  # exportAsync @1x → receiver (piloté par nodeId)
    ├── scan.js                     # relevés par position (lecture seule)
    └── checkpoint.js               # regex \d{3} déjà généralisée en 005 → "007/…" passe

extract/figma/dump.plugin.js        # LU, jamais committé modifié : TARGET_SETS=[] en local
core/propose-figma.ts               # IMPORTÉ en lecture par tools/note-census.mjs
```

**Structure Decision** : **aucune nouvelle structure de code applicatif.** Le livrable est
le canvas plus ses artefacts de preuve. L'instrument de la 003 couvre tout le besoin et il est
prouvé par ses fixtures. Les deux outils qui manquaient (oracle, compteur) vivent sous
`specs/007-figma-extractable-source/tools/` parce que FR-025 gèle le dépôt applicatif — ce
sont des instruments **de cette spec**, pas de l'outillage à maintenir. Les scripts de geste
(renommages en masse, création de variables, liaisons) sont **jetables**, exécutés via
`figma_execute` et transcrits verbatim dans `proofs/<cycle>/gestes.md`.

## Phases d'exécution (cadrage pour /speckit.tasks)

Ordre imposé par trois contraintes dures : **la table de nommage avant tout geste** (FR-030 /
SC-015) ; **les noms avant les valeurs** (un renommage déplace les chemins que les liaisons
référencent) ; **l'étalonnage avant la première écriture** (sans plancher de bruit connu sur
les 34 nouvelles cibles, aucun verdict aval n'est lisible).

| Phase | Contenu | Cycles | Gate de sortie |
|---|---|---|---|
| **P0 — Ouverture** | `pages:selftest` ; receveur :9227 ; version `007/ouverture/etalonnage` ; **étalonnage double capture des 43 cibles** ; relevé d'ouverture (dump + compteur des 6 classes) ; relevé des 4 résidus acquittés ; scaffold `decisions.md` | É | **43/43 identical** sur les 9 maquettes **impérativement** ; toute cible DS bruitée sort du verdict **nommément** |
| **P1 — Table de nommage** | Production de `naming-table.md` : 36 (A) + 10-12 (B) + 10 props (C) + 22 collisions (D) + 10 valeurs de variant (O3) ; chaque ligne passée à l'**oracle** ; contrôle FR-007 des références externes (refait, pas supposé) | — (aucune écriture canvas) | **Validation owner en un seul bloc** ; 100 % des lignes CLEAN à l'oracle ; O1/O3 tranchés |
| **P2 — Identifiants** | Renommage des sets, des propriétés, des valeurs de variant et des calques nommés d'après leur contenu ; descriptions accentuées (FR-006a) ; résolution des 22 collisions de part | L1 (+L1b si le lot dépasse le budget d'appels) | 0 pixel (43/43) · relevé intermédiaire : classes A/B/C/D à 0 |
| **P3 — Primitives & rôles** | Complétion des gammes : `font/size` (44, 54), `font/weight` (bold), `font/line-height` (×11), `font/letter-spacing`, `space`, `radius`, `border-width` ; `line-height` ajouté aux 8 rôles existants ; 10 rôles neufs nommés d'après l'usage observé | L2 | 0 pixel (43/43) — créer une variable ne rend rien |
| **P4 — Liaisons de valeurs** | Les 193 valeurs des canaux numériques liées à leur variable, **valeur exacte** (FR-013) ; `opacity` vérifié avant liaison (FR-014), limite nommée si elle tient | L3 | 0 pixel (43/43) · classe E à 0 sur les canaux mesurés |
| **P5 — Styles de texte** | Les 18 styles : liaison de chaque propriété + marqueur `ds_contracts/textStyleToken` ; aucune fusion ; `Note de champ` (interligne AUTO) traité comme cas nommé | L4 | 0 pixel (43/43) · **SC-013 : 18/18 liés + 18/18 marqués**, vérifié live |
| **P6 — Structure (re-cadrée)** | Décisions écrites de FR-019 (Hero vidéo 44 ×1, Nav-item 16/16 ×1, 3 textes Field AUTO) ; sort du GROUP résiduel `237:970` (O4) ; re-relevé des compteurs périmés de SC-006 | V1 (+V2 si un geste visuel est assumé) | diff observé == diff annoncé, montré sur crop |
| **P7 — `DS · Tokens`** | Mise à jour de la planche pour refléter l'état final des variables (FR-031) | V3 — **diff annoncé** | crop + validation owner ; SC-016 : 0 variable absente |
| **P8 — Clôture** | Relevé de clôture (même procédure, écrite) ; `RAPPORT-CLOTURE.md` ; backlog d'harmonisation chiffré (FR-013a) ; dette léguée item par item ; sweep 8/8 | — | SC-001…SC-016 tenus ou **nommément re-cadrés** ; gates au statu quo |

**Budget** : **4 lots 0-pixel + 1-2 cycles visuels + 1 cycle annoncé + 1 étalonnage**. Le
risque de dépassement est nommé d'avance : à 86 appels de capture par cycle, un lot qui
déborde le budget d'appels du pont se scinde (L1/L1b) — c'est une scission **de cadence**,
jamais une fusion de gestes visuels.

**Écrivains parallèles** (FR-029) : autorisés sur zones **disjointes** (P2 par page DS, P4 par
famille de canal), avec **un seul** cycle global de vérification tenu par l'orchestrateur,
jamais par les agents.

**Contrainte d'ordre supplémentaire (R11)** : `bridge/scan.js` classe par une liste nominale
(`KNOWN_MASTERS = ['Bouton', …]`, l. 69) — tout relevé de structure `scan.js` se prend
**avant** le renommage de `Bouton` (P2) ; après P2, les relevés se lisent par nodeId.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Aucune violation des **principes** I-VIII. **Quatre écarts assumés et bornés** — deux hors des
trois objets que FR-025 protège nommément (contrat, token, composant généré), et **deux qui
touchent des MUST de la partie workflow/gouvernance de la constitution** et exigent à ce titre
un **waiver Governance écrit dans le corps de la PR** (§Governance : « no exceptions without a
Governance-approved, time-boxed waiver recorded in the PR ») :

| Écart | Pourquoi nécessaire | Alternative rejetée parce que |
|---|---|---|
| **Édition locale non committée** de `extract/figma/dump.plugin.js` (`TARGET_SETS = ['Badge','Switch','Card']` → `[]`) pour banker le dump des 55 masters | Sans elle le relevé capture **3 sets, pas 55** (R3, trou A) — SC-011 (« reproduit par un tiers depuis le seul rapport ») est faux si le pas n'est pas écrit | (a) **Committer le changement** — modifie le dépôt applicatif, interdit par FR-025 et sans valeur hors de cette itération. (b) **Passer les 55 noms en dur dans `TARGET_SETS`** — une liste qui périme au premier master ajouté, et qui ment sur l'intention (« tout le fichier ») |
| Le README de `page-parity` §10 déclare « **périmètre = les 9 frames maquettes, rien d'autre** ». L'itération mesure 43 cibles : la **limite documentée devient fausse**, sans qu'une ligne de code change | Q4/FR-020 exige explicitement les pages DS dans le verdict. Le code n'a jamais porté cette limite — c'est le README qui la porte (R1) | (a) **Corriger le README** — édition dépôt interdite par FR-025 ; le geste appartient à la spec suivante, avec la correction du trou d'émetteur n° 1. (b) **Ne pas étendre le périmètre** — contredit une clarification owner déjà gravée (Q4). → La divergence documentaire est **portée nommément à la dette léguée**, principe V |
| ⚠️ **Exécution hors worktree dédié** — la branche `007-figma-extractable-source` est checkoutée dans le **checkout principal** (`/Users/dlstudio/.superset/projects/ds-contracts-poc`), là où la constitution §Worktree Gates (F1) dit **MUST** | F1 existe pour qu'une spec **qui modifie du code** fasse tourner `npm run eval` sur son propre `node_modules` sans polluer le checkout principal. Ici **FR-025 gèle le dépôt applicatif : il n'y a aucun code à isoler**, et le sweep de clôture attend un **statu quo strict** (8/8, aucun snapshot rafraîchi) — le faire tourner dans le checkout principal mesure exactement ce que la spec promet | (a) **Créer un worktree quand même** — `npm install` + `npx playwright install chromium` (plusieurs Go) pour zéro fichier de code modifié. (b) **Laisser la dérogation dans le seul `tasks.md`**, comme c'était le cas avant cet amendement — c'est un MUST constitutionnel : non écrite au bon endroit, elle est exactement la dégradation silencieuse que le principe V classe la plus grave. → **Waiver Governance dans la PR**, borné à cette itération |
| ⚠️ **Levée de `parity` par `MAX_SNAPSHOT_AGE_DAYS`** si le gate rougit sur une **péremption de snapshot** (défaut 14 jours depuis le 2026-07-25 → rouge attendu vers le **2026-08-08**) et non sur du contenu | La cause est **étrangère au travail** : aucun snapshot n'a bougé, c'est l'horloge. La seule « correction de la cause » serait un rafraîchissement de snapshot, qui ferait entrer les renommages canvas dans le différentiel et **contredirait FR-025 / SC-009** | (a) **Rafraîchir les snapshots** — interdit ci-dessus, et transformerait un gate vert-par-construction en preuve fausse. (b) **Considérer le rouge comme un échec de l'itération** — il ne mesure rien de ce que l'itération a fait. → C'est une **suppression de gate** au sens de §Governance : elle exige un waiver **time-boxed** (motif + date d'expiration + qui l'a accordé) dans la PR, jamais une note d'exécution ; et le rouge résiduel MUST être re-montré au rapport de clôture, jamais tu |

**Un troisième fichier hors `specs/007-…/` est touché, et il faut le dire maintenant** :
`/speckit.plan` exécute `update-agent-context.sh`, qui ajoute à **`CLAUDE.md`** les deux
lignes « Active Technologies » de la feature et bump sa date. C'est le comportement standard
du workflow, et le précédent est visible : les entrées 003 et 005 y sont déjà, committées.
Mais **SC-009 dit « le diff de la branche ne touche aucun fichier hors
`specs/007-figma-extractable-source/` »** — pris à la lettre, cette ligne le viole.

Lecture retenue, **désormais actée dans le texte de SC-009 lui-même** (amendement du
2026-07-26) : **SC-009 gouverne les gestes de l'itération** (canvas, contrats, tokens, code
généré), **pas les artefacts du workflow de spécification**. Le diff attendu en clôture est donc
« `specs/007-…/**` + 2 lignes de `CLAUDE.md` », et rien d'autre. La confirmation owner reste
portée au bloc de revue unique (O1/O2/O3 + ce point). Si l'owner préfère la lecture stricte, le
`git checkout CLAUDE.md` est trivial et sans conséquence — mais alors il doit être refait
après chaque `/speckit.*`, ce qui est une gêne récurrente pour un gain nul.

**Contradiction interne de la spec — remontée, non absorbée, et depuis lors corrigée à la
source** : SC-002 exigeait « 0 style de texte non dérivé d'un token — départ : 41 », or ce
compteur est gouverné par la regex `/^font\.(.+?)\.size/` de `core/token-corpus.ts` face à une
convention `typography.<rôle>.size` — aucune action canvas ne le déplace (R9). Le plan ne l'a
pas contourné : il a porté la décision O2 à l'owner. **L'amendement du 2026-07-26 l'a intégré
dans `spec.md`** : SC-002 ne porte plus que sur les 193 valeurs numériques, les 41 sont une
limite nommée comptée à part et léguée avec le trou d'émetteur n° 1, et SC-013 est le reçu réel
du lot typographique. O2 reste au bloc de revue owner comme **ratification**, plus comme
arbitrage ouvert. Absorber ce compteur dans un zéro aurait été exactement la dégradation
silencieuse que le principe V classe la plus grave.

## Hors périmètre — rappel explicite

Reconduit de la spec, et **re-confirmé par l'owner en cours de planification** :

- **Le bloc Google reviews / les cartes « Avis Google »** — branche `006-google-reviews-block`,
  traitée par une autre session sur un autre workspace. Cette itération n'y touche pas, y
  compris aux 5 GROUPs `Avis Google` relevés en R10, qui restent hors périmètre.
- Toute écriture dans le dépôt hors les artefacts de cette spec (FR-025).
- Tout changement de design non annoncé (règle 005 reconduite).
- L'exposition des props sur les masters, le rich-text, Nav-item, les zéro-usage — → Prochaines étapes.
