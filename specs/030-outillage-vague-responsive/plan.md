# Implementation Plan: Outillage de la vague responsive

**Branch**: `030-outillage-vague-responsive` | **Date**: 2026-08-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/030-outillage-vague-responsive/spec.md`

## Summary

Sept capacités d'outillage (P1–P7 de la rétro 029) pour que la vague responsive 031 coûte ~25 min/section : fix E8 de la clôture multi-campagnes, générateur de manifeste depuis un relevé existant, mode capture allégée à verdicts identiques, driver enchaînant la chaîne du runner en une invocation avec reprise, preflight des verrous hérités, générateur de planche owner 7 zones, champ `pickerConsequence` + natures VISUEL/STRUCTUREL sur les décisions. Ordre constitutionnel partout : fixture rouge → eval → capacité. AUCUNE mutation du canvas vif — preuves en fixtures, mock et rejeu des artefacts 029 committés.

## Technical Context

**Language/Version**: TypeScript (pin dépôt `typescript@^6`), Node ≥ 20, ESM exécuté via `tsx` ; JavaScript pour les scripts de transport (`scripts/*.mjs`)

**Primary Dependencies**: modules existants uniquement — `extract/figma/projection-repair/*` (campaign, cli, capture, facts, apply, apply-receipt, verify, bridge-script, workflow, report, types), `scripts/component-repair-bridge.mjs`, `evals/run.ts` + `evals/fixtures/`, mock `scripts/plugin-engine-mock-figma.mjs`. **Aucune dépendance nouvelle.**

**Storage**: JSON sur disque — manifestes `specs/component-repairs/*/run-*/campaign.json`, décisions `specs/*/decisions/*.json`, reçus/journaux du driver dans le dossier de run ; entrées du générateur = artefacts 029 committés (`audit.json`, `H1-bridge-read-only.json`)

**Testing**: `npm run eval` (fixtures rouges enregistrées dans `evals/run.ts`), `npx tsc --noEmit` + `tsc -p tsconfig.build.json`, sweep constitutionnel complet en clôture

**Target Platform**: outillage Node local (CLI + scripts), zéro navigateur, zéro canvas vif

**Project Type**: extension d'un CLI/outillage interne existant (runner component:repair v2)

**Performance Goals**: manifeste généré < 2 min machine ; chaîne driver complète sur mock < 25 min ; volume de preuve light ≥ −80 % vs mode complet 029

**Constraints**: verdicts identiques light vs complet (FR-005) ; re-pin ZÉRO (FR-012) ; déterminisme — générateurs = fonctions pures, byte-stables sur entrées identiques ; le runner reste mono-composant

**Scale/Scope**: ~8 fichiers runner touchés + 2 nouveaux scripts + 6 fixtures/evals ; consommé ensuite par 12 sections en 031

## Constitution Check

*GATE: évalué avant Phase 0, ré-évalué après Phase 1.*

| Principe | Verdict | Justification |
|---|---|---|
| I. Déterminisme (pas d'IA dans la génération) | ✅ | Les deux générateurs (manifeste, planche) sont des fonctions pures relevé→JSON/script, byte-stables ; l'IA n'apparaît que comme auteur du code, jamais dans le chemin d'exécution. |
| Claims rule (fixture → eval → claim) | ✅ | FR-010 l'impose par capacité ; SC-005 exige la preuve adverse (capacité retirée → suite rouge) AVANT toute phrase de capability dans les docs (FR-013 vient après les evals). |
| VIII. Source-cleanliness | ✅ N/A | Aucune extraction ni modélisation d'une source Figma nouvelle ; les entrées sont les relevés 029 déjà audités. |
| IX. Docs-first | ✅ | `docs/internal/component-repair-workflow.md` et `RETRO-PROCESS.md` lus et cités comme base ; FR-013 met à jour le doc là où les capacités sont revendiquées. |
| X. Before-capture | ✅ N/A par périmètre | AUCUNE mutation canvas vif dans cette spec (Assumption 1) ; la seule écriture « live » possible est sur le mock. Le driver IMPLÉMENTE §X (capture-before obligatoire dans sa chaîne) sans l'exercer en vif ici. |
| XI. Multi-writer bridge | ✅ N/A | Pas d'écriture canvas ; le driver reste mono-campagne — l'orchestration multi-writers appartient à 031. |
| XII. Decision Surface Fidelity | ✅ moteur de la spec | FR-008/FR-009 codifient XII (7 zones, 1:1, delta-only, archive séparée) et le complètent sur les deltas STRUCTURELS (témoin de sélecteur) — extension, pas contournement. |
| Quality Gates (sweep complet) | ✅ | Clôture = build, parity, eval, plugin:check, roundtrip, core-browser, 2 typechecks ; re-pin attendu zéro (FR-012), dette golden 028 intacte. |

**Violations à justifier** : aucune.

## Project Structure

### Documentation (this feature)

```text
specs/030-outillage-vague-responsive/
├── plan.md              # ce fichier
├── research.md          # Phase 0 — décisions R1–R9
├── data-model.md        # Phase 1 — entités (manifeste, décision, planche, verrou, journal)
├── quickstart.md        # Phase 1 — validation de bout en bout
├── contracts/           # Phase 1 — contrats CLI des nouvelles commandes
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
extract/figma/projection-repair/
├── campaign.ts          # ÉDITÉ : fix E8 (selectFinalOwnerDecisions) ; champ captureMode ; natures de faits
├── capture.ts           # ÉDITÉ : mode light (PNG déclarées/changées, zéro PNG idempotence)
├── cli.ts               # ÉDITÉ : flag --capture-mode ; refus nommés du preflight verrous
├── facts.ts             # ÉDITÉ : relevé min/max/fixed pour le preflight verrous
├── manifest-generator.ts# NOUVEAU : relevé (audit.json/dump) → campaign.json + marquages non-déductibles
├── board-generator.ts   # NOUVEAU : décisions+témoins → script de planche 7 zones + manifeste de zones
├── types.ts             # ÉDITÉ : additif seulement (captureMode, factNature, pickerConsequence, lockReport)
└── verify.ts            # ÉDITÉ : verdicts identiques light/complet (sélection des surfaces)

scripts/
├── component-repair-drive.mjs   # NOUVEAU : driver — chaîne complète, journal, arrêt sur refus, reprise
└── component-repair-bridge.mjs  # ÉDITÉ : invocable par le driver (pas de changement de contrat)

evals/
├── fixtures/figma-projection-repair/shared-decision-root-check.ts      # NOUVELLE fixture rouge (E8)
├── fixtures/figma-projection-repair/manifest-generator-check.ts        # NOUVELLE (générateur + non-déductibles nommés)
├── fixtures/figma-projection-repair/capture-light-verdicts-check.ts    # NOUVELLE (verdicts identiques light/complet)
├── fixtures/figma-projection-repair/driver-chain-resume-check.ts       # NOUVELLE (chaîne, arrêt sur refus, reprise, créations déclarées sur mock)
├── fixtures/figma-projection-repair/inherited-lock-preflight-check.ts  # NOUVELLE (verrou 744px-classe détecté avant dry-run)
├── fixtures/figma-projection-repair/board-structural-witness-check.ts  # NOUVELLE (7 zones ; fait STRUCTUREL sans témoin refusé)
└── run.ts               # ÉDITÉ : enregistrement des 6 IDs `figma-projection-repair-*` (convention de la famille existante)

docs/internal/component-repair-workflow.md   # ÉDITÉ : light, driver, générateurs, pickerConsequence
specs/029-…/decisions/README.md              # NON touché (histoire) ; le schéma étendu vit dans contracts/ de 030 et sera copié par 031
```

**Structure Decision** : extension in-place du runner existant (aucun nouveau package) ; deux nouveaux modules purs dans `extract/figma/projection-repair/` + un script de transport ; les fixtures rejoignent la famille existante du runner `evals/fixtures/figma-projection-repair/*-check.ts`, enregistrées dans `run.ts` sous les IDs `figma-projection-repair-*`.

## Complexity Tracking

Aucune violation constitutionnelle à justifier.
