# Implementation Plan: Les neuf pages du site sur Odoo — contenu, navigation, mesure au pixel

**Branch**: `037-pages-odoo-navigation-pixel` (worktree Superset `comet-yogurt`) | **Date**: 2026-09-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/037-pages-odoo-navigation-pixel/spec.md`

## Summary

Sept pages du site Piqueray n'existent pas sur Odoo alors que le menu et les boutons y mènent déjà. Cette spec les compose depuis **un fichier de contenu par page** avec les **treize blocs existants** du module, en sortant le **contenu commun** (Devis, Réassurances, Avis Google) dans une source unique reprise par référence et surchargée **champ par champ** ; chaque bouton reçoit sa **destination** depuis le fichier (grammaire fermée, refus nommé) ; l'arbre du menu validé par l'owner est posé (Motorisation sous Portes de garage) et un **test de navigation sur les neuf vraies pages** remplace les fixtures de la spec 022 ; enfin un **instrument du dépôt** (`extract/odoo-page-parity/`) capture chaque page aux quatre largeurs, la compare à sa vue Figma v2 (alignement en haut, hauteur commune, écart de hauteur en clair, diagnostic section par section), et conserve les rapports. Approche technique : **zéro contrat, zéro jeton, zéro bloc nouveau** (SC-010) ; tout se joue dans `integrations/odoo/authoring/` (résolveur de descripteurs, composeur), `integrations/odoo/qa/scenarios/` (navigation), `extract/odoo-page-parity/` (mesure), un semis de menu corrigé avec sa migration, et les évals qui couvrent chaque mécanisme avant toute phrase de doc (§II).

**Fait neuf découvert pendant la planification (2026-09-08, relevé REST + canevas)** : la page **Contactez-nous n'avait pas de section « 4 vues »** — seule sa base v1 `2782:44493` existait, contrairement à la clarification de la spec. À la demande de l'owner, les 4 vues ont été **montées en session** (section `2782:46963`, journal `specs/tiny/vague-031/page-contactez-nous.md`) et **validées** le jour même : les 36 rapports redeviennent exigibles. Un écart de source est ouvert : le formulaire v2 n'a ni les champs Adresse/Sujet ni les deux boutons de la base.

## Technical Context

**Language/Version**: TypeScript (pin dépôt `typescript@^6`), Node ≥ 20, ESM exécuté via `tsx` (résolveur, test de navigation, instrument de mesure) ; Python 3 dans le conteneur Odoo (`compose_page.py`, `odoo shell`) ; XML Odoo (semis du menu) + une migration Python (`migrations/19.0.1.17.0/`) ; bash (`page.sh`, `run-compose.sh`).

**Primary Dependencies**: `playwright-core` + Chromium épinglé (cache Playwright, `launchBrowser()` de `extract/figma/visual-parity/render.ts`) ; `pixelmatch` + `pngjs` via **`extract/image-parity/compare.ts` réutilisé tel quel** (comparaison stricte sur deux images rendues de même taille par construction) et `writeTriptych` de `extract/figma/visual-parity/img.ts` ; Figma REST API en **LECTURE** (`FIGMA_TOKEN`, export PNG `scale=1` des vues + `nodes?depth=1` pour les boîtes de sections) ; Docker + Compose (instance Odoo **jetable** `odoo:19.0-20260803` + `postgres:15`, lock `inputs.lock.json`) ; pont figma-console : **aucune mutation prévue par la spec** — le montage Contactez-nous a été fait hors spec, à la demande de l'owner, avec version nommée et capture avant.

**Storage**: JSON sur disque — `integrations/odoo/authoring/pages/<page>.json` (9 descripteurs, dont 2 repris), `integrations/odoo/authoring/commun/{devis,reassurances,avis-google}.json` (NOUVEAU), `integrations/odoo/authoring/commun/destinations-externes.json` (NOUVEAU, liste fermée), `extract/odoo-page-parity/views.json` (NOUVEAU, manifeste des 36 vues Figma) ; rapports conservés `specs/037-…/proofs/mesure/<page>/<largeur>.json` + `RAPPORT-MESURE.md` ; PNG lourds gitignorés (`.page-parity/037/`) avec empreinte sha256 dans le rapport ; `integrations/odoo/addons/piqueray_ds/data/menu_seed.xml` (édité) + `migrations/19.0.1.17.0/post-migration.py` (NOUVEAU) ; `integrations/odoo/config/adaptation-registry.json` (zone `ODOO-022-MENU-SEED` mise à jour) ; `evals/run.ts` (+ cas) et `evals/fixtures/odoo-pages/` (NOUVEAU).

**Testing**: `npm run eval` (cas neufs : résolution de descripteurs C1/C2, instrument de mesure C1/C3 par self-test hors ligne, grammaire des destinations C2) ; `npm run odoo:pages:check` (NOUVEAU : résout les 9 descripteurs, refuse orphelins/destinations interdites, imprime le registre des restes) ; scénario QA `pages-navigation.spec.mts` sur instance jetable (preuve rouge → vert conservée sous `proofs/`) ; instrument `odoo:pages:measure` prouvé sur Home et Portes de garage avant les sept autres (FR-015) ; les portes de la constitution (build, parity, eval, plugin:check, roundtrip, core-browser-check, tsc) + `odoo:authoring:check`, `odoo:module:check`, `odoo:derivation:check`, `odoo:typecheck`.

**Target Platform**: Odoo 19 Website (image épinglée), navigateur Chromium headless pour la mesure, macOS pour le pont Figma.

**Project Type**: intégration (addon Odoo + outillage de contenu et de mesure dans un monorepo TS).

**Performance Goals**: mesure d'une page aux 4 largeurs < 3 min sur le poste (captures pleine page jusqu'à ~10 000 px de haut à DPR 1) ; reconstruction des 9 pages < 10 min (un `odoo shell` + restart par page, existant). **Ce sont des repères d'ergonomie, pas des critères de réussite** : aucun SC ne les porte, aucune porte ne les mesure ; les durées réellement observées sont notées au reçu de T059 pour que le repère soit vérifiable la prochaine fois plutôt que reconduit à l'aveugle.

**Constraints**: déterminisme (deux résolutions/mesures identiques, SC-005) ; aucune image lourde committée (décision owner 2026-08-27) ; jamais l'instance owner `piqueray-odoo-test` (8071) ; validation owner sur le pilote `piqueray-odoo-pilote` (8087) par le lien éditeur ; seuil **5 %** et tolérance de hauteur **10 px** fixés avant mesure (FR-014/FR-016), jamais modifiés après lecture ; contenu à égalité avec la vue (FR-018 : écart de copie corrigé à la source, jamais dans la page).

**Scale/Scope**: 9 pages × 4 largeurs = 36 rapports ; 3 blocs communs ; ~30 boutons/cartes à destination ; 7 entrées de menu ; 13 blocs existants, 0 nouveau ; 1 instrument neuf (~6 fichiers), 1 scénario QA neuf, 1 résolveur neuf, 3 cas d'éval neufs.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.* (Constitution v1.3.0)

- [x] **I. Determinism** — le résolveur de descripteurs et l'instrument de mesure sont des fonctions pures sur des entrées fichier ; rejouabilité prouvée par eval (deux passes byte-identiques du descripteur résolu et du rapport JSON). Aucune IA dans la reconstruction ni dans la mesure. Aucun généré du pipeline contrat→surfaces n'est touché (SC-010) → re-pin attendu **zéro** pour `golden.json` / `engine.receipt.json` / `examples/polaris/`.
- [x] **II. Claims rule** — ordre fixture → eval → claim pour chaque mécanisme (FR-019/SC-007) : `odoo-pages-resolve-determinism-and-refusals` (résolution + surcharge par champ + orphelin + destination interdite), `odoo-page-parity-selftest` (identique = 0 %, section décalée = rouge, hauteur > 10 px = rouge hauteur, ×2 identiques), `odoo-pages-navigation-tree` (l'arbre validé est celui du semis). Le README d'authoring n'annonce le commun et les destinations qu'après ces évals.
- [x] **III. Contract is SSoT** — aucun contrat modifié ; la destination d'un lien reste une **adaptation d'hôte** (matrice de capacité l. 180 : `<a href>` est HOST-ONLY, absent-by-decision), posée par le composeur exactement comme le panneau d'édition (`SetCtaHrefAction`), jamais promue au contrat.
- [x] **IV. Generated never hand-edited** — rien sous `src/`, `figma-sync/`, `catalog/`, `contract.schema.json` ; `static/src/css/generated/` intact. Le semis du menu est une **zone manuelle comptée** (`ODOO-022-MENU-SEED`), éditée avec son entrée de registre.
- [x] **V. Honesty** — mesure « impossible » nommée avec sa raison (FR-017), jamais réussie ni échouée ; capture vide refusée (< 10 px, page 404, `#wrap.o_pqr_page` absent) ; hauteur jamais redimensionnée en silence ; registre des restes obligatoire (SC-009) ; les écarts de source trouvés en planification sont écrits (Contactez-nous, graisse du titre hero de Motorisation / À Propos).
- [x] **VI. Additive evolution** — schéma de contrat non touché ; les clés de descripteur (`commun`, `surcharge`, `links`, `lien`) sont **additives**, les descripteurs existants restent valides ; version d'addon 19.0.1.16.0 → 19.0.1.17.0 (migration, chemin update).
- [x] **VII. Engine integrity** — `core/` non touché ; aucun `node:*` ajouté dans `core/`.
- [x] **VIII. Source cleanliness** — pas d'extraction de composant ; les vues Figma sont **lues** ; un écart de copie à la source (double espace du hero Portes de garage, U+2028 du Devis, titre Réassurances d'À Propos, graisse Regular du titre hero de Motorisation/À Propos, champs manquants du formulaire v2) est **nommé au rapport et tranché à la source** (FR-018), jamais contourné dans la page.
- [x] **IX. Docs-first** — lus avant de dériver : `integrations/odoo/authoring/README.md`, `docs/16-mode-emploi-composant-vers-odoo.md` (§Étape 8 mesure, A6 pièges, A5 portes), `docs/FIGMA-CAPABILITY-MATRIX.md` (l. 180 `<a href>`), `docs/06-parity-loop.md` (division parity / visual-parity), journaux `specs/tiny/vague-031/page-*.md` et `home-page-layout.md`, scénarios 022/023, mémoires projet (instances Docker, lien éditeur). auggie MCP non disponible dans cette session — lecture directe des fichiers, nommée ici.
- [x] **X. Before-capture** — la spec ne prévoit aucune mutation canvas ; le montage Contactez-nous (demande owner en session) a suivi la règle : version nommée `2396800891417055477`, capture de la base avant, relevé après (base 1728×3901 / 7 enfants intacte, +4 instances par set et rien d'autre).
- [x] **XI. Multi-writer bridge** — un seul écrivain, une seule zone (section neuve) ; pas de parallélisme canvas prévu.
- [x] **XII. Decision surface fidelity** — les rapports montrent le triptyque **à taille réelle** (1:1, `writeTriptych`), une largeur par rapport, jamais une vignette ; les quatre largeurs sont quatre rapports distincts ; le score n'est jamais présenté seul (écart de hauteur à côté).

**Quality gates** — la liste de la constitution + les portes Odoo (`odoo:authoring:check`, `odoo:module:check`, `odoo:derivation:check`, `odoo:typecheck`, `odoo:visual:selftest`) + les neuves (`odoo:pages:check`, `odoo:pages:selftest`). **Worktree F1** : `node_modules` est **absent** dans ce worktree (0 entrée) → `npm install` + `npx playwright install chromium` avant tout.

**Verdict pré-Phase 0** : aucune violation. **Verdict post-Phase 1** : aucune violation (voir Complexity Tracking : vide).

## Project Structure

### Documentation (this feature)

```text
specs/037-pages-odoo-navigation-pixel/
├── plan.md                      # ce fichier
├── research.md                  # Phase 0 — 14 décisions (D1–D14), relevés REST, faits neufs
├── data-model.md                # Phase 1 — Page, Contenu commun, Surcharge, Destination, Arbre, Vue, Rapport, Registre, Validation
├── quickstart.md                # Phase 1 — scénarios de validation exécutables, dans l'ordre
├── contracts/                   # Phase 1 — schémas JSON des documents neufs + commandes
│   ├── README.md
│   ├── page-descriptor.schema.json
│   ├── commun.schema.json
│   ├── views.schema.json
│   ├── rapport-mesure.schema.json
│   └── menu-tree.json           # l'arbre validé par l'owner (FR-008), donnée de test
├── checklists/requirements.md   # existant
├── proofs/                      # (implémentation) mesure/<page>/<largeur>.json, navigation/, registre-restes.md, validations-owner.md
└── tasks.md                     # Phase 2 — /speckit-tasks (NON créé par /speckit-plan)
```

### Source Code (repository root)

```text
integrations/odoo/authoring/
├── README.md                              # ÉDITÉ après les évals : commun, surcharge, destinations, mesure
├── page.sh                                # ÉDITÉ : appelle le résolveur, refuse avant docker
├── run-compose.sh                         # inchangé (reçoit le descripteur RÉSOLU)
├── compose_page.py                        # ÉDITÉ : set_link (destinations), sans autre branche
├── commun/                                # NOUVEAU — contenu commun, écrit une fois
│   ├── devis.json
│   ├── reassurances.json
│   ├── avis-google.json
│   └── destinations-externes.json         # liste fermée des adresses externes autorisées
├── pages/
│   ├── home.json                          # REPRIS : commun par référence, destinations
│   ├── portes-de-garage.json              # REPRIS
│   ├── portes-residentielles.json         # NOUVEAU ×7
│   ├── portes-industrielles.json
│   ├── portes-entree.json
│   ├── motorisation.json
│   ├── depannage-sav.json
│   ├── a-propos.json
│   └── contactez-nous.json
└── assets/                                # + photos exportées des vues (JPEG ≤ 1728, règle 2026-09-07)

scripts/odoo/
├── resolve-page.ts                        # NOUVEAU — résolution pure : commun + surcharge par champ + grammaire des destinations + restes
└── lib/pages.ts                           # NOUVEAU — liste des pages du site (URL ↔ fichier), partagée résolveur / test de navigation / instrument

integrations/odoo/addons/piqueray_ds/
├── __manifest__.py                        # version 19.0.1.17.0
├── data/menu_seed.xml                     # ÉDITÉ : Motorisation sous Portes de garage (ODOO-022-MENU-SEED)
└── migrations/19.0.1.17.0/post-migration.py   # NOUVEAU — re-parente Motorisation UNIQUEMENT si encore à sa place inférée

integrations/odoo/qa/scenarios/
├── pages-navigation.spec.mts              # NOUVEAU — 9 vraies pages : liens bureau/mobile/en-tête/pied → 200, entrée active, arbre = menu-tree.json
└── header-nav.spec.mts                    # ÉDITÉ : Motorisation → parent actif « Portes de garage »

extract/odoo-page-parity/                  # NOUVEAU — l'instrument de mesure de page entière
├── views.json                             # manifeste : 9 pages × 4 vues (node ids, tailles au relevé), seuil 5 %, tolérance 10 px, dates owner
├── figma-views.ts                         # export REST des vues (PNG scale 1) + boîtes des sections (nodes depth 1)
├── capture.ts                             # Playwright : 4 viewports, DPR 1, pleine page, refus 404 / sujet absent / < 10 px, boîtes des sections Odoo
├── compare.ts                             # aplat alpha → blanc, alignement en haut, hauteur commune, image-parity strict, Δh, verdicts
├── sections.ts                            # diagnostic section par section (Δh cumulé, première section > 10 px)
├── report.ts                              # JSON + triptyque 1:1 + empreintes sha256 ; « impossible » avec raison
├── cli.ts                                 # npm run odoo:pages:measure -- <page> [--base URL] [--out DIR] [--only-figma|--only-odoo]
└── selftest.ts                            # hors ligne, synthétique : 0 % / section décalée rouge / hauteur rouge / ×2 identiques

evals/
├── run.ts                                 # + odoo-pages-resolve-determinism-and-refusals, odoo-page-parity-selftest, odoo-pages-navigation-tree
└── fixtures/odoo-pages/                   # NOUVEAU — descripteurs minimaux (commun, surcharge, orphelin, destination interdite), PNG synthétiques

package.json                               # + odoo:pages:check, odoo:pages:measure, odoo:pages:selftest
```

**Structure Decision**: tout ce qui est **contenu** vit dans `integrations/odoo/authoring/` (source versionnée, une page = un fichier, un commun = un fichier) ; la **résolution** est un script TS pur sous `scripts/odoo/` (typé par le tsconfig racine, exécutable sans Docker, donc évaluable) ; la **mesure** est un instrument autonome sous `extract/` à côté d'`image-parity` et de `figma/page-parity` (même famille : agnostique du moteur, réutilise `compare.ts` et `img.ts` par la porte bibliothèque, jamais par stdout) ; la **navigation** est un scénario QA de plus dans le harnais 019/022 (`readQaEnv`, `baseUrl`, `odooShell`, reçus). Aucune nouvelle famille de dossier.

## Complexity Tracking

> Aucune violation de la constitution à justifier.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Phase 0 & Phase 1 — état

- Phase 0 : `research.md` — 14 décisions, tous les NEEDS CLARIFICATION résolus (aucun ne subsiste dans ce plan).
- Phase 1 : `data-model.md`, `contracts/` (5 fichiers), `quickstart.md` — écrits.
- Phase 2 : `/speckit-tasks` (F1 en première tâche).
