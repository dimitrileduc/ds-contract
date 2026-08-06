# Implementation Plan: Canvas vrai

**Branch**: `016-canvas-vrai` | **Date**: 2026-08-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/016-canvas-vrai/spec.md`

## Summary

016 rebranche la moitié canvas de l'angle mort fermé par 015, en trois chantiers ordonnés. **US1** : créer dans la maquette les 83 variables de géométrie (6 `space/N` + 77 `size/*`) en exécutant le script **déjà généré** `figma-sync/01-tokens.js` via le pont figma-console — l'axe `variables canvas ⟷ tokens` reprend, les 83 acquittements de `parity/baseline.json` tombent, et un test de sentinelle (édition d'une valeur de variable → finding `figma-tokens|mismatch` classé avec remède, puis stabilité ×2) prouve la surveillance. **US2** : corriger DANS Figma les 10 défauts de source (DW-002 — cartes à 363,5, décision owner ; DW-003 — en-tête FAQ FIXED→HUG ; + les 8 du backlog 013, re-relevés au vif), chaque geste sous cycle de preuve complet (annonce → capture de TOUTES les cibles → geste → preuve conforme), avec les promotions code-side au bon semver (dont `ds.button` MAJEUR pour `outilneNoir`) et la clôture aux portes (`measure:gate` : `figma-source 2 → 0` par `resolvedBy`). **US3** : régénérer le canvas divergent (liste = findings parity sur cliché frais post-US2) par les scripts amend `figma-sync/NN-*.js` — qui installent au passage les liaisons `setBoundVariable` (déjà émises par le moteur, vérifié) — sous protection photos : recensement par position et `imageHash` avant le premier lot, verdict d'**identité** photo par photo après (9 composants porteurs), audit de liaison final. Field et NavItem finissent mesurés sans reçu bloquant d'époque (défaut moteur de Field corrigé fixture-d'abord ; NavItem re-mesuré, cause vivante). Découverte structurante de la recherche : **zéro code moteur n'est requis pour US1/US3** — `emit-figma-script.ts` lie déjà largeurs/hauteurs/espacements aux variables ; le chantier est une exécution canvas gouvernée, pas un développement.

## Technical Context

**Language/Version**: TypeScript (pin dépôt `typescript@^6`), Node ≥ 20, ESM via `tsx` (instruments repo) ; JavaScript Figma Plugin API (scripts bridge + scripts générés `figma-sync/*.js`)
**Primary Dependencies**: pont desktop **figma-console** (`figma_execute` + `loadAllPagesAsync`, port 9223 — seule route vers la page `Pages` 210:325) ; `extract/figma/page-parity/` réutilisé **tel quel** (receiver 9227, capture/scan/checkpoint, `pages:compare`) ; `figma-sync/01-tokens.js` + `figma-sync/NN-*.js` (générés, amend-capable, harvest/restore photos, `setBoundVariable`) ; `parity/extract-figma.plugin.js` + `parity/diff.ts` ; `pixelmatch`/`pngjs` ; historique de versions natif (`saveVersionHistoryAsync`)
**Storage**: JSON sur disque — `parity/snapshots/*.json` (clichés rafraîchis commités), `parity/baseline.json` (89 → résiduel hors géométrie), `specs/016-canvas-vrai/{registre/defauts-source.json, proofs/, bridge/, tools/}` (NOUVEAUX, commités), `specs/014-…/proofs/registre/causes.json` (`resolvedBy` additifs), `specs/013-…/proofs/deferred/work.json` (clôture croisée), `tokens/primitives.tokens.json` (DW-002 : `size.carte.root` 363,5), contrats touchés par les promotions US2 (+ re-pins `evals/golden.json`, `figma-sync/plugin/engine.receipt.json` ; + `examples/polaris/figma/*.figma.js` si édition d'émetteur au volet Field) ; PNG de travail gitignorés (`.page-parity/`)
**Testing**: `npm run parity` (l'axe rebranché + sentinelle), `npm run pages:compare` (preuve pixel avant/après par lot), `npm run measure:gate` / `npm run geometry:gate` (comptes vifs), `npm run eval` (suite déterministe ; fixture nouvelle AVANT toute édition d'émetteur au volet Field), sweep constitution complète à chaque point de contrôle
**Target Platform**: macOS + Figma desktop (pont branché, fenêtres planifiées avec l'owner — jamais CI, jamais sans surveillance) pour le canvas ; Node pour instruments et gates
**Project Type**: chantier canvas gouverné sur fichier client vivant + promotions contrats/tokens — aucun nouveau code applicatif hors scripts bridge spec-locaux (et l'éventuel correctif moteur Field, fixture-d'abord)
**Performance Goals**: déterminisme conservé (roundtrip byte-identique ×2) ; étalonnage capture ×2 = N/N `identical` (plancher de bruit zéro) ; upsert variables idempotent (deux exécutions convergent)
**Constraints**: §X avant-capture (TOUTES les cibles, jamais un pilote) ; écrivain unique (§XI par construction) ; un écart imprévu annule le lot ENTIER ; restauration = geste manuel guidé (aucune API) ; fichier vivant (re-relevé juste avant chaque écriture) ; zéro photo perdue/intervertie (identité par `imageHash`) ; MemberCard reste bloqué honnêtement (A5) ; images A5, DW-014-002/003, 89 littéraux non géométriques, 30/69 pointeurs périmés : hors périmètre
**Scale/Scope**: 83 variables ; 10 défauts de source (2 registre + 8 backlog) ; ~34 masters / 9 maquettes dans le périmètre de capture ; 9 composants porteurs de photos (dont `realisation` ~27 overrides d'instance) ; 4 acquittements figma d'avant 015 re-jugés ; 2 sujets à débloquer (Field, NavItem)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` (v1.2.0). Every item MUST be true, or be
justified in Complexity Tracking below.

- [x] **I. Determinism (NON-NEGOTIABLE)** — le canvas est produit par les scripts **générés** (`01-tokens.js` upsert idempotent, `NN-*.js` amend) exécutés tels quels ; aucune IA dans le chemin ; `npm run build` + roundtrip ×2 restent verts à chaque point de contrôle.
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — l'éventuelle édition d'émetteur (volet Field) est fixture-d'abord (eval AVANT le code) ; aucune phrase de capacité sans eval ; les comptes (89→, 2→0) ne sont cités que datés, relus en direct.
- [x] **III. Contract is the SSoT** — les corrections de source sont des gestes canvas (§VIII) dont les contreparties passent par contrats/tokens en **promotions** (D4/D9) ; jamais de side-sync ; `npm run parity` propre à la clôture, acquittements re-justifiés un par un (D11).
- [x] **IV. No hand-edited output** — les artefacts générés ne sont jamais édités à la main : tout changement passe par contrats/tokens + regénération ; les gestes canvas passent par les scripts générés ou des scripts bridge versionnés.
- [x] **V. Honesty** — toute vérification empêchée est nommée (FR-011) ; limites nommées écrites où la capacité est revendiquée : détachement de liaison non surveillé en continu (D3), MemberCard/A5 (D7), photos non replaçables rapportées nommément.
- [x] **VI. Additive evolution** — aucun changement de schéma prévu ; semver strict sur les promotions : `ds.button` **MAJEUR** (`outilneNoir` renommé), bindings VARIANT = mineurs (D9) ; `docs/02` intouché sauf si un champ s'ajoutait (aucun prévu).
- [x] **VII. Engine integrity** — `core/` intouché pour US1/US3 (capacité déjà présente, vérifiée) ; si le volet Field édite un émetteur : fixture + mock enseignés (tout défaut live-only → le mock le rejette ensuite), `core-browser-check` vert.
- [x] **VIII. Source cleanliness** — 016 EST un chantier §VIII : 10 défauts corrigés à la source, diagnostics re-relevés au vif, instances scannées par POSITION jamais par nom (D5/D9).
- [x] **IX. Docs-first** — recherche menée via auggie sur `docs/` + registres AVANT toute décision (research.md, 12 décisions sourcées) ; matrice consultée (A5 ligne 91) ; l'archive demo-51 et les cycles 003/005/007 réutilisés comme prior art.
- [x] **X. Before-capture** — chaque lot capture TOUTES ses cibles (maquettes + pages DS des masters touchés) avant la première écriture, captures vérifiées non vides/bonnes dimensions, point de restauration nommé (contracts/proof-cycle.md) ; étalonnage ×2 en ouverture.
- [x] **XI. Multi-writer bridge** — écrivain unique par construction (fichier client vivant, D10) ; si parallélisation un jour : zones disjointes + un seul cycle global de vérification appartenant à l'orchestrateur.

**All gates green:**

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Specs executing in a git worktree run this sweep INSIDE the worktree (Constitution:
Worktree Gates F1) — `npm install` + `npx playwright install chromium` there first.
(Jamais deux sweeps en parallèle : `evals/.scratch` est un chemin unique.)

## Project Structure

### Documentation (this feature)

```text
specs/016-canvas-vrai/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 — 12 décisions (D1–D12), toutes sourcées
├── data-model.md        # Phase 1 — 6 entités (variable, défaut, lot, photos, acquittement, cible)
├── quickstart.md        # Phase 1 — préconditions pont, étalonnage, cycles, sweep
├── contracts/           # Phase 1 — proof-cycle.md · photos-identite.md · registre-source.md · sentinelle-variables.md
└── tasks.md             # Phase 2 (/speckit.tasks — PAS créé par /speckit.plan)
```

### Source Code (repository root)

```text
# RÉUTILISÉ TEL QUEL (aucune édition)
extract/figma/page-parity/           # receiver 9227, bridge/{scan,capture,checkpoint}.js, pages:compare
figma-sync/01-tokens.js              # généré — porte DÉJÀ les 83 variables (upsert)
figma-sync/NN-*.js                   # générés — amend + harvest/restore + setBoundVariable (liaisons U1b)
parity/extract-figma.plugin.js       # ré-extraction des clichés via figma_execute
parity/diff.ts                       # l'axe figma-tokens (checkTokens) + baseline

# ÉDITÉ (données gouvernées, jamais du généré à la main)
tokens/primitives.tokens.json        # DW-002 : size.carte.root 364 → 363,5 (± image intérieure, tranché à l'annonce)
contracts/*.contract.json            # promotions US2 (button MAJEUR ; section-header/hero/sav/coordonnees… mineurs)
parity/baseline.json                 # 89 → résiduel hors géométrie, chaque ligne re-justifiée
parity/snapshots/*.json              # clichés rafraîchis commités
specs/014-mesure-juste-triage/proofs/registre/causes.json   # resolvedBy DW-002/DW-003 (additif)
specs/013-auditer-fidelite-organismes/proofs/deferred/work.json  # clôture croisée (additif)
extract/figma/visual-parity/{triage.ts,subjects.ts,baseline.json}  # volet Field/NavItem (causes vivantes)

# NOUVEAU (spec-local, commité)
specs/016-canvas-vrai/registre/defauts-source.json   # le registre des 10 (contracts/registre-source.md)
specs/016-canvas-vrai/bridge/photos-census.js        # census photos par position + imageHash (lecture seule)
specs/016-canvas-vrai/bridge/bindings-audit.js       # audit de liaison post-régénération (lecture seule)
specs/016-canvas-vrai/tools/photos-verify.mts        # verdict d'identité → photos-report.json
specs/016-canvas-vrai/proofs/                        # étalonnage, lots, reçus, rapports

# CONDITIONNEL (volet Field uniquement, fixture-d'abord)
core/emit-*.ts + evals/fixtures/…    # correctif « Input slotté garde sa largeur intrinsèque »
                                     # ⇒ re-pins golden + engine.receipt + examples/polaris/figma/*.figma.js

# RÉGÉNÉRÉ, JAMAIS À LA MAIN
src/components/ · figma-sync/*.js · catalog/catalog.json · contracts/contract.schema.json
```

**Structure Decision** : chantier canvas sur les instruments existants — les seuls ajouts de code sont des scripts bridge **spec-locaux** (lecture seule) sous `specs/016-canvas-vrai/`, pattern des specs 003/005/007 ; s'ils servent à 017 (photos), leur promotion en instrument partagé sera la décision de 017. L'ordre d'exécution suit les priorités de la spec : U1a (variables + sentinelle) → US2 (10 lots de source, petits et annoncés) → US3 (une seule vague de régénération, qui installe aussi les liaisons U1b) → déblocage Field/NavItem → clôture (acquittements, portes, rapport).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Aucune violation. Deux points frontière, nommés plutôt que tus : (1) l'éventuel correctif moteur du volet Field est le « strict besoin » de SC-006 et suit §II/§VII (fixture d'abord, mock enseigné, 3 re-pins) ; (2) la surveillance continue du détachement de liaison n'est PAS livrée — limite nommée (D3), rattrapée par l'audit de liaison et les régénérations, léguée explicitement au rapport de clôture.
