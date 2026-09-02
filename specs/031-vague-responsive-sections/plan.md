# Implementation Plan: Vague responsive des sections

**Branch**: `just-euphonium` (worktree Superset actif ; dossier de spec
`031-vague-responsive-sections`) | **Date**: 2026-08-27 | **Spec**:
[`spec.md`](./spec.md)

**Input**: `/specs/031-vague-responsive-sections/spec.md` · fiche D1–D9 signée
(`specs/030-outillage-vague-responsive/inventory/fiche-decisions-vague.md`) ·
outillage 030 consommé tel quel · rétro 029 (`RETRO-PROCESS.md`).

## Summary

Treize campagnes en une journée : douze sections gagnent un axe `Presentation`
{Wide, Desktop, Mobile} **visible dans le sélecteur de variantes Figma**, matrice
complète, défaut = le membre historique ; la treizième renomme
`HeroVideo.Presentation=Compact` en `Mobile`. L'axe **ne descend pas dans le
contrat** (D1/FR-013) : le responsive vit dans le code, l'axe est un outil de
conception et de validation.

L'approche technique tient en quatre phrases. **Le relevé commande la
séquence** : 11 des 12 sections sont des composants seuls (branche `additive`,
28 membres créés au total), `Reassurances` est le seul set existant — il est donc
le pilote imposé par FR-009 — et le renommage de `HeroVideo` n'a aucun chemin
runner (recherche R3). **Rien du dépôt ne change** : 030 est consommé tel quel,
le runner est gelé (FR-015), la surface de re-pin attendue est zéro, et les
portes FR-011/FR-014 sont donc documentaires, pas machine (R7). **La préparation
va jusqu'au dry-run avant la séance owner** (`--until dry-run`, l'usage que 030
documente), ce qui satisfait §X/FR-007 pour les treize cibles et met les verrous
hérités sur la planche au lieu de les découvrir à la pose. **Les zones §XI se
calculent sur les parents relevés, pas sur les masters** : dans la branche
additive, la création du set modifie le nœud parent, et onze campagnes peuvent
donc revendiquer le même nœud (R5).

Deux touches owner : la séance de validation (treize décisions individuelles) et
l'acceptation finale (les reports d'abord, la clôture globale ensuite).

## Technical Context

**Language/Version** : aucun code de dépôt écrit. Outils exécutés : TypeScript
5.x/Node ≥ 20 en ESM via `tsx` (runner `extract/figma/projection-repair/`),
JavaScript Figma Plugin API (scripts de pont générés), Node ESM
(`scripts/component-repair-drive.mjs`, `scripts/component-repair-bridge.mjs`).

**Primary Dependencies** : outillage 030 **tel quel** — générateur de manifeste
(`npm run component:repair:manifest`), preflight des verrous hérités, mode
`--capture-mode light`, driver de campagne, générateur de planche
(`npm run component:repair:board`), schéma de décision étendu
(`pickerConsequence`, `nature`/`witnessRef`). Pont desktop **figma-console**
(ports 9223-9232, trois writers sains). Figma REST en lecture (`FIGMA_TOKEN`)
pour les relevés et l'épinglage de version.

**Storage** : JSON et PNG sur disque uniquement.
Par campagne : `specs/component-repairs/<cible>/run-NNN/` (manifeste généré,
`audit.json`, `preflight-locks.json`, captures, reçus, `drive-journal.jsonl`,
comparaison).
Pour la vague : `specs/031-vague-responsive-sections/` (`decisions/` partagé —
`ownerDecisionRoot` unique des 13, `inventory/`, `boards/`, `proofs/`).
Modifiés au dépôt : `parity/baseline.json` (12 → 24 acquittements),
`parity/snapshots/figma-components.json` (refresh de clôture), `MILESTONES.md`.

**Testing** : aucune fixture ni eval nouvelle (FR-015 + Assumptions). Les portes
sont celles du runner, invoquées telles quelles. Sweep de qualité complet aux
gates G0, G3 et G5 (constitution §Quality Gates, dans le worktree — F1).

**Target Platform** : canevas Figma vif `Piqueray (Copy)` /
`d9FYAUcqdcNtsuaMgLefvJ`, plus le dépôt en worktree.

**Project Type** : opération gouvernée sur canevas vif, orchestrée par un runner
existant. Ni bibliothèque, ni service : un déroulé à artefacts.

**Performance Goals** : 5 h mur avec trois writers (~25 min/campagne, ~60 min
pour chaque pilote) ; séance owner **jusqu'à décision individuelle des treize**,
sans plafond de durée (clarification du 2026-08-27) ; repli séquentiel annoncé
(+1 h 45) si moins de trois canaux d'écriture sains.

**Constraints** : §X capture-avant des **13** cibles avant la première mutation ;
§XI zones disjointes calculées sur les parents + un seul cycle de vérification
global possédé par l'orchestrateur ; runner gelé ; zéro écriture de Page ; zéro
promotion de contrat ; un mot owner = une décision.

**Scale/Scope** : 13 campagnes · 28 membres créés · 6 largeurs témoins × 2
contenus (D9) · +12 acquittements de parité (12 → 24 entrées, `.Presentation`
2 → 14) · 0 fichier de code modifié. Le volume de surfaces par campagne n'est
**pas** prédit ici : le « 19 surfaces » de R9 est l'échantillon sur lequel 030 a
mesuré le gain du mode `light` (−81,3 %), pas un attendu par campagne.

## Constitution Check

*GATE : franchi avant Phase 0, re-franchi après Phase 1. Résultat : **PASS**,
sans violation à justifier.*

- [x] **I. Déterminisme — aucune IA dans la conversion.** Aucun émetteur, aucun
      contrat, aucun jeton n'est touché ; la génération de manifeste et de
      planche sont des fonctions pures de 030. L'IA prépare et orchestre ; elle
      n'entre dans aucun chemin de génération.
- [x] **II. Claims rule — fixture → eval → claim.** 031 ne revendique **aucune
      capacité nouvelle** : rien à ajouter à README/docs, donc rien à prouver par
      eval. Corollaire tenu en R7 : les portes FR-011/FR-014 sont documentaires
      et **ne seront jamais présentées comme des contrôles automatiques**.
- [x] **III. Le contrat est la source de vérité.** L'axe reste hors contrat
      (D1/FR-013) ; l'écart canevas est porté par un **acquittement de parité
      nommé**, jamais par une synchronisation latérale. Le patch de promotion
      proposé par `npm run parity` est refusé par nom.
- [x] **IV. Sortie générée jamais éditée à la main.** `src/`, `figma-sync/`,
      `catalog/` ne sont pas touchés ; SC-008 le mesure (`git status --porcelain`
      vide sur ces chemins à la clôture).
- [x] **V. Honnêteté — la dégradation est nommée.** Les 17 champs non déductibles
      du manifeste généré sont des décisions explicites ; la limite de portée du
      preflight verrous, l'absence de chemin runner pour le renommage (R3) et le
      défaut de source `TEST/Reassurances` (R11) sont écrits ici avant d'être
      rencontrés.
- [x] **VI. Évolution additive & semver.** Aucun schéma, aucun contrat modifié.
      Les 28 membres créés sont additifs ; zéro identité changée, zéro membre
      supprimé (SC-004).
- [x] **VII. Intégrité du moteur.** `core/` intact ; la fidélité du mock reste la
      référence des pilotes — un défaut vif produirait un correctif runner **et**
      sa fixture, ce qui **arrête la vague** (FR-009/FR-015), jamais un
      contournement.
- [x] **VIII. Propreté de la source.** Étape 0 = audit frais par campagne (usages
      scannés **par position**, jamais par nom). Le set d'essai
      `TEST/Reassurances Responsive — Controlled` est nommé à G0 et tranché par
      l'owner ; aucun agent ne supprime de nœud (R11).
- [x] **IX. Docs-first.** Reçu en tête de `research.md` : constitution, workflow
      de réparation, matrice de capacités, rétro 029, artefacts 030 — lus avant
      toute dérivation. Trois conclusions du plan (ordre de la chaîne, absence de
      chemin de renommage, statut CARRY-CODE-ONLY du responsive) viennent des
      docs, pas d'une inférence.
- [x] **X. Capture-avant.** FR-007 renforce le principe : **treize** cibles
      capturées avant la **première** mutation, jamais un pilote d'abord — c'est
      la raison de la borne `--until dry-run` (R6). Chaque capture est vérifiée
      non vide et bien dimensionnée, en mode `light` comme en `full`. Versions
      Figma épinglées `031-avant-vague` et `031-apres-vague`.
- [x] **XI. Pont multi-writers.** Zones **calculées sur les parents relevés**
      (R5), un port par writer, un seul cycle de vérification global possédé par
      l'orchestrateur. Aucun writer ne conduit sa propre vérification.
- [x] **XII. Fidélité de la surface de décision.** Planches générées au gabarit
      7 zones : delta seulement, 1:1, largeurs identiques nommées et non
      dupliquées, archive technique **référencée et masquée** (ne pas
      sur-corriger). Le corollaire E2 est ajouté par 030 : zones « ce que vous
      n'aurez pas » + sélecteur avant→après, et refus
      `structural-fact-unwitnessed`.

**Quality Gates** : sweep complet (`build`, `parity`, `eval`, `plugin:check`,
`deterministic-roundtrip`, `core-browser-check`, les deux `tsc`) à G0, G3 et G5,
exécuté **dans le worktree** (F1, worktree déjà autosuffisant). Le `N/N` vivant
imprimé par `npm run eval` est la seule autorité ; aucun chiffre n'est écrit en
dur hors `MILESTONES.md` daté. Seul rouge toléré : la dette golden 028
préexistante, **strictement inchangée**.

## Project Structure

### Documentation (this feature)

```text
specs/031-vague-responsive-sections/
├── plan.md                     # ce fichier
├── spec.md                     # le résultat attendu (existant)
├── research.md                 # Phase 0 — R1…R13
├── data-model.md               # Phase 1 — entités de vague
├── quickstart.md               # Phase 1 — comment vérifier la vague
├── contracts/
│   ├── gates-de-vague.md       # G0…G5 + le devoir de re-citation (FR-011)
│   ├── dossier-campagne.md     # complétude conditionnelle des 3 verdicts (FR-014)
│   └── registre-ecarts.md      # schéma d'une ligne de registre
├── checklists/                 # existant
├── decisions/                  # ownerDecisionRoot UNIQUE des 13 campagnes
├── inventory/
│   ├── partition-zones.json    # G0 : parents relevés → zones §XI (R5)
│   ├── prerequis-g0.md         # G0 : cliché, ports, versions épinglées (R4)
│   ├── registre-ecarts.{json,md}
│   └── typographie-mobile.md   # inventaire de clôture (FR-016)
├── boards/                     # planches générées (zones.json + board.bridge.js)
└── proofs/                     # sommaire de séance, captures de sélecteur, sweeps
```

### Source Code (repository root)

```text
# INCHANGÉ — lu et exécuté, jamais modifié (FR-015, SC-008)
extract/figma/projection-repair/     # runner : audit, preflight, manifeste, planche, verify
scripts/component-repair-drive.mjs   # driver de chaîne (030)
scripts/component-repair-bridge.mjs  # transport pont figma-console
docs/internal/component-repair-workflow.md
core/  src/  contracts/  tokens/  figma-sync/  catalog/  evals/

# ÉCRIT PAR LA VAGUE — artefacts d'exécution
# NNN = premier run LIBRE, relevé sur disque avant d'écrire. Huit des treize
# cibles portent déjà des runs de specs antérieures (table dans tasks.md) ;
# écraser un run occupé détruit un état-avant archivé (§X).
specs/component-repairs/<cible>/run-NNN/
├── campaign.json               # GÉNÉRÉ puis relu (17 non-déductibles à trancher)
├── audit.json                  # audit frais, usages par position
├── preflight-locks.json        # verrous hérités : locks / waived / blocking
├── captures/{before,after,idempotence}/
├── receipts/{dry-run,apply-first,apply-second}.json
├── verify/comparison.json
└── drive-journal.jsonl

# MODIFIÉ AU DÉPÔT — trois fichiers, tous attendus
parity/baseline.json                       # 12 → 24 acquittements
parity/snapshots/figma-components.json     # refresh de clôture (28 membres créés)
MILESTONES.md                              # entrée datée
```

**Structure Decision** : la vague n'ajoute aucun module. Les artefacts par
campagne restent là où le runner les écrit (`specs/component-repairs/<cible>/`),
et **tout ce qui est de niveau vague** — décisions, registre, planches, preuves —
vit une seule fois sous `specs/031-…/`. C'est la forme que la rétro 029 impose
(« supprimé par section : spec, plan, research, data-model, quickstart, checklist,
contracts locaux ») et que FR-014 rend obligatoire : « aucune prose de
spécification, de plan ou de recherche par campagne ». Le `ownerDecisionRoot`
unique n'est possible que grâce au correctif E8 de 030 (R10).

## Phases d'exécution

| Phase | Gate | Contenu | Owner |
|---|---|---|---|
| **A — Kick-off** | G0 | Sweep ; version `031-avant-vague` ; relevé des parents → `partition-zones.json` (R5) ; comparaison du cliché de parité (R4) ; 3 ports sains ; défaut de source R11 nommé | non |
| **B — Préparation** | G1 | Par campagne, en parallèle : audit frais → manifeste généré → 17 non-déductibles tranchés → preflight verrous → capture-avant → dry-run (`--until dry-run`) ; puis planches 7 zones + sommaire de triage | non |
| **C — Séance** | G2 | Sommaire, lot standard, lot à décisions ; **une décision par campagne**, enregistrée séance tenante avec `pickerConsequence` et témoins ; R3 et R11 tranchés ici | **oui (1/2)** |
| **D — Pilotes** | G3 | Reassurances (`existing`, `full`) puis la 1ʳᵉ additive (`full`) : chaîne complète, second passage no-op. Échec ⇒ **arrêt de la vague**, correctif + fixture | non |
| **E — Lot + vérif** | G4 | 10 campagnes en `light` sur zones disjointes ; un **seul** cycle de vérification global ; refresh du cliché ; +12 acquittements de parité | non |
| **F — Clôture** | G5 | Reports individuels **puis** acceptation globale ; `--finalize` ×13 ; registre ; inventaire typo ; `031-apres-vague` ; MILESTONES | **oui (2/2)** |

Règle anti-idle (puits n°1 de 029) : un agent qui atteint un gate exécute les
tâches aval **sans gate** au lieu d'attendre.

## Complexity Tracking

*Aucune violation constitutionnelle à justifier.* Deux écarts au **workflow
interne** (pas à la constitution) sont assumés et tracés :

| Écart | Pourquoi | Alternative écartée |
|---|---|---|
| `preflight` + `capture-before` **avant** le GO owner, alors que l'ordre obligatoire les place après | §X et FR-007 exigent les 13 captures avant la 1ʳᵉ mutation ; les deux étapes sont read-only ; 030 documente `--until dry-run` comme « la préparation de vague » (R6) | Suivre l'ordre littéral : la séance porterait sur des planches sans verrous connus, et le pilote violerait FR-007 |
| Un **second** pilote (1ʳᵉ section additive) non demandé par FR-009 | 11 des 12 sections roulent sur une branche dont le seul précédent vif est antérieur au mode `light` et au driver ; ~20 min pour couvrir 10 sections (R2) | Pilote unique : ouvrir 10 écritures parallèles sur une combinaison jamais exécutée en vif |
