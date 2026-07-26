# Implementation Plan: Bloc « Avis Google » — reconstruction native gouvernée

**Branch**: `006-google-reviews-block` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-google-reviews-block/spec.md`

**Artefacts** : [research.md](./research.md) · [data-model.md](./data-model.md) ·
[quickstart.md](./quickstart.md) · [contracts/](./contracts/)

## Summary

Le bloc « Avis Google » est un **screenshot aplati d'un widget tiers** (Trustindex) — un `RECTANGLE`
à fill `IMAGE`, même `imageHash` recopié sur **8 des 9 maquettes**. C'est la dernière zone du fichier
hors gouvernance, et le seul bloc que la spec 003 a reporté faute de source exploitable. L'owner
lève ce report en acceptant le risque net-new.

**Approche retenue (décision owner) : contrat d'abord, master généré.** Les valeurs de design sont
mesurées sur les **octets natifs** de l'aplat, deux contrats sont écrits
(`ds.review-card` molécule + `ds.google-reviews` section, la section imbriquant la carte par
`repeat`), le code React est généré, la fidélité est **bouclée entièrement hors ligne** contre un
recadrage de l'aplat, puis **une seule** poussée générative crée les deux masters sur le fichier
vivant. Les 8 occurrences sont ensuite remplacées une par une, chacune avec sa preuve avant/après
mesurée **sur la boîte du bloc** et relue à l'œil.

C'est la **première** fois que ce dépôt exécute un script `figma-sync/` généré contre le fichier
Piqueray — les 5 contrats existants ont tous été extraits de masters dessinés à la main. Le
protocole de garde est épinglé dans [`contracts/push-protocol.md`](./contracts/push-protocol.md).

## Technical Context

**Language/Version**: TypeScript 5.x / Node ≥ 20, ESM via `tsx` ; JavaScript Figma Plugin API pour
les scripts poussés au pont
**Primary Dependencies**: Zod (`@ds-contracts/schema`), React 19 + CSS Modules (émetteur `react`),
`playwright-core` + `pixelmatch` + `pngjs` (mesure), pont desktop figma-console (`figma_execute`,
`loadAllPagesAsync`), Sync Runner (`npm run figma:serve`)
**Storage**: JSON sur disque — `contracts/review-card.contract.json`,
`contracts/google-reviews.contract.json`, `evals/golden.json` (re-pin), `parity/snapshots/` (refresh) ;
`assets/icons/google.svg` ; artefacts de spec sous `specs/006-google-reviews-block/`
**Testing**: `evals/run.ts` (108/108 aujourd'hui), `npm run parity`, `pages:selftest`,
`extract:figma:visual`, `plugin-engine-mock-figma.mjs`
**Target Platform**: bibliothèque React générée + bibliothèque Figma native (fichier
`d9FYAUcqdcNtsuaMgLefvJ`, page `Pages` `210:325`)
**Project Type**: générateur contrat → deux surfaces, plus un instrument de preuve pixel
**Performance Goals**: régénération **byte-identique ×2** ; verdict `pages:compare`
**byte-déterministe** et **inchangé** quand `--regions` est absent
**Constraints**: `core/` reste browser-pure ; schéma **additif seulement** (ici : aucun changement
requis) ; aucun fichier généré retouché à la main ; `npm run eval` ne tourne **pas** dans un
worktree ; contenu réel des avis **transcrit à l'œil** (aucun calque texte n'existe)
**Scale/Scope**: 2 contrats neufs (5 → 7), 1 glyphe interne, 8 occurrences canevas, 9 maquettes
mesurées, 1 flag additif d'instrument (`--regions`), **1 instrument hors ligne neuf**
(`aplat-parity`, la jambe A), 1 refresh de snapshot de parité, ≥ 4 évals (réanimations + neuves)

**Prémisse corrigée en cours de plan** : la spec 005 est **CLOSE** depuis le 2026-07-25
(`cc048a4`, T107-T116 tous faits, 8/8 gates verts, suite 108/108) mais **non mergée** — la branche
006 part de `8f3137d` et n'en contient aucun commit. FR-021 est donc **levée** ; le verrou restant
est le **merge**, qui est un prérequis dur du premier geste (il apporte aussi la regex de
`checkpoint.js` sans laquelle aucun point de restauration 006 n'est posable).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` (v1.0.1). Every item MUST be true, or be
justified in Complexity Tracking below.

- [x] **I. Determinism (NON-NEGOTIABLE)** — Aucun modèle dans le chemin contrat→surface. Les valeurs
      sont **mesurées à la main** puis écrites dans un contrat versionné ; la génération reste des
      fonctions pures. `deterministic-roundtrip` est **re-pointé sur `ds.google-reviews`** (son
      en-tête demande littéralement ce re-pointage dès qu'un composant en compose un autre) —
      laisser le harnais sur le Bouton et rapporter le gate vert serait une omission silencieuse.
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — Aucune phrase de capacité avant son éval. Réanimations
      **vérifiées corps par corps** (`detect-figma-missing-nested-instance` = vrai déplacement ;
      `pending-first-sync-not-drift` et `naxis-full-cartesian-product` **écartées**, elles
      référencent des contrats démo supprimés). Évals neuves listées en `research.md` R14 — dont une
      qui **épingle une limite** (l'exclusion pastille/photo est une convention, pas une contrainte
      de schéma) pour qu'elle ne devienne jamais une revendication silencieuse.
- [x] **III. Contract is the SSoT** — Les deux surfaces sont générées depuis les contrats ; aucune
      synchronisation latérale. `npm run parity` propre — avec la ligne de base pré-005 établie et
      consignée **avant** de commencer, pour ne pas confondre une divergence héritée avec une
      régression 006.
- [x] **IV. No hand-edited output** — `src/components/`, `figma-sync/*.js`, `catalog/`,
      `contracts/contract.schema.json` uniquement régénérés. Les 6 orphelins `figma-sync/` créés par
      la renumérotation sont **supprimés** dans le commit relu, et la purge est dite au journal (un
      orphelin épinglé par golden rendrait invisible une régression de générateur).
- [x] **V. Honesty** — Cinq limites nommées là où la capacité est revendiquée : le trou **A5**
      (fill image, **non refermé** par cette spec) ; l'étoile orange intrinsèque ; la troncature
      multi-lignes refusée ; la transcription **non garantie au caractère près** ; l'angle mort de
      la maquette témoin (`Motorisation` n'instancie **ni** `Étoile` **ni** `check`). Le ledger est
      déclaré **structurellement inapplicable** au côté aplat et remplacé par un relevé de
      transcription — un `pages:ledger:check` vert sur un `entrees: []` ne prouverait rien.
- [x] **VI. Additive evolution** — **Aucun changement de schéma** : `molecule`/`section`, `repeat`,
      `component`, `visibleWhen`, `arrayOf`, `attrs` existent déjà. Les deux contrats naissent en
      `1.0.0`. Le flag `--regions` est **strictement additif** : champs de verdict ajoutés **en
      fin**, absents quand le flag l'est ⇒ sortie **byte-identique**.
- [x] **VII. Engine integrity** — `core/` **n'est pas modifié** (le correctif de résolution de
      dépendance part au backlog). Les scripts générés sont validés à blanc contre
      `plugin-engine-mock-figma.mjs` avant toute exécution live, et ce que le canevas vivant
      apprendra du piège `GROUP` devient un **cas de mock** — le correctif a deux moitiés.

**All gates green** (sur le **checkout principal**, pas le worktree — `npm run eval` symlinke
`ROOT/node_modules`) :

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

**Re-évaluation post-design** : les 7 principes tiennent, **sans exemption demandée**. Deux points
restent en attente de décision owner et sont séquencés **avant** les phases qu'ils gouvernent — le
seuil de fidélité (après la sonde de plancher, `tasks.md` **T015-T016**, avant la Phase 3 et avant
tout contrat écrit) et la collision de numéro de spec (`tasks.md` **T006**, avant la Phase 2).
Les numéros de phase font foi dans `tasks.md` (1-7) ; `quickstart.md` numérote son déroulé
opératoire 0-6 et porte la table de correspondance.

## Project Structure

### Documentation (this feature)

```text
specs/006-google-reviews-block/
├── plan.md              # ce fichier
├── spec.md              # la spec (23 FR, 8 SC, 7 clarifications)
├── research.md          # 25 décisions, dont 8 corrections de prémisse
├── data-model.md        # les 2 contrats + les entités de preuve
├── quickstart.md        # le déroulé opératoire
├── contracts/
│   ├── region-proof.md      # le flag --regions : entrée, sortie, identité byte, selftest
│   ├── measure-record.md    # relevé de mesure + relevé de transcription + règle de tranchage
│   └── push-protocol.md     # les 4 interdits, l'amend, les checkpoints, les preuves exigées
├── checklists/
│   └── requirements.md
├── measures/            # créé en Phase 0 : aplat-source.png, mesures, transcriptions, crops
├── inventory/           # scan positionnel post-005
├── ledger/              # google-reviews.json
├── proofs/              # une entrée par occurrence + les preuves de geste
├── decisions.md         # journal append-only (format 003)
└── tasks.md             # sortie de /speckit.tasks — PAS créé par /speckit.plan
```

### Source Code (repository root)

```text
contracts/
├── review-card.contract.json          # NEUF — ds.review-card, molecule, 1.0.0
└── google-reviews.contract.json       # NEUF — ds.google-reviews, section, 1.0.0

assets/icons/
└── google.svg                         # NEUF — glyphe interne, classe D7, hors registre

extract/figma/page-parity/
├── cli.ts, compare.ts, report.ts      # flag --regions, additif
├── selftest.ts                        # +2 cas (5 → 7)
└── bridge/aplat-source.js             # NEUF — lecture seule, octets natifs du fill image

extract/figma/aplat-parity/            # NEUF — jambe A : rendu code ↔ crop de l'aplat, hors ligne
├── run.ts                             # forme de state-photo/run.ts ; seuil IMPORTÉ, jamais réinventé
└── selftest.ts                        # 2 fixtures ; câblé en `aplat:selftest`, joué dans les volées

extract/figma/visual-parity/
└── subjects.ts                        # +2 sujets (avec renderWidth)

evals/
├── run.ts, legacy-cases.ts            # réanimations + évals neuves
└── golden.json                        # re-pin

scripts/
└── deterministic-roundtrip.mjs        # re-pointé sur le composite

# Généré — JAMAIS à la main
src/components/{ReviewCard,GoogleReviews}/
figma-sync/NN-reviewcard.js, NN-googlereviews.js   # + purge de 6 orphelins
catalog/
```

**Structure Decision** — Aucun projet ni paquet nouveau. La spec ajoute **deux documents contrat**
dans le répertoire existant `contracts/` (auto-découvert par les générateurs, aucun registre à
éditer), **un glyphe** dans `assets/icons/`, **ajoute un instrument hors ligne** (`extract/figma/aplat-parity/`,
la jambe A de convergence — aucune écriture canevas, câblé en `aplat:run` / `aplat:selftest` et joué
dans les volées), et étend **par addition** deux instruments existants (`page-parity`, `visual-parity`). `core/` et `packages/schema/` ne sont **pas** modifiés : la
capacité manquante identifiée (résolution des dépendances par clé plutôt que par nom) est contournée
par une règle de modélisation — ne jamais instancier `ds.button` — et part au backlog avec son reçu,
plutôt que d'ouvrir le moteur pour une raison sans rapport avec le sujet de la spec.

## Complexity Tracking

> Rempli uniquement si le Constitution Check porte des violations à justifier.

**Aucune violation.** Aucune exemption demandée.

Deux tensions ont été résolues **sans** violer un principe, et sont consignées ici parce qu'elles
coûtent quelque chose de visible :

| Tension | Résolution | Ce qu'elle coûte |
|---|---|---|
| FR-007 demande de réutiliser le Bouton gouverné ; la résolution des dépendances imbriquées se fait **par nom** et le contrat dit `Button` là où le master dit « Bouton » | Aucun `component`-ref vers `ds.button` : flèches et CTA dessinés en parts | Un réemploi perdu, **nommé au rapport** — et, en contrepartie, la réparation majeure du contrat Bouton héritée de 005 devient inutile pour 006 |
| FR-016 fixe « ≤ 2 % », présenté comme la tolérance en vigueur ; c'est en fait le seuil d'un **autre** instrument, et sur la région il est probablement **inatteignable** (substitution de police) | Dénominateur = boîte du bloc ; **sonde de plancher en Phase 0** ; décision de seuil owner écrite avant de construire ; fidélité **structurelle** et **raster** séparées au rapport | Un STOP-GATE de plus avant la Phase 1 — et un chiffre honnête plutôt qu'un seuil décoratif |
