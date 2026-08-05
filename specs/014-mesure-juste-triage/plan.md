# Implementation Plan: Mesure juste et triage complet

**Branch**: `014-mesure-juste-triage` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-mesure-juste-triage/spec.md`

## Summary

Rendre la mesure de fidélité juste et complète **avant** le chantier géométrie
(015), sans corriger quoi que ce soit. Trois trous, une règle transverse :

1. **DW-006** — le pilote d'audit photographie le *set* au lieu du *node du cas*.
   La correction bascule les cinq dérivées de la référence (capture, largeur
   imposée, cadre d'alignement, provenance des reçus, valeurs de faits) sur le
   node du cas, sous une fixture rouge écrite d'abord.
2. **Les quatre lignes UNTRIAGED** — chacune reçoit une cause d'un vocabulaire
   fermé porté de cinq à **six** valeurs, alignées 1:1 entre l'énumération de
   l'instrument et le libellé publié ; le seuil de 3 % cesse de dispenser une
   ligne divergente de porter une cause (13 lignes de plus à causer).
3. **`select`** — le 34ᵉ composant rejoint la mesure ; l'exclusion qui l'écartait
   (un commentaire, pas du code) est retirée avec le reçu de son infirmation.
4. **Transverse** — toute cause affirmée qui retire ou requalifie une mesure est
   re-testée et ne survit qu'avec un reçu daté et rejouable, l'état « avant »
   est une **re-mesure** faite dans la fenêtre de la fonctionnalité (le baseline
   commité ne couvre que 4 lignes mesurées sur 36, sur une version Figma
   périmée), et un contrôle de clôture fail-closed refuse tant qu'une des quatre
   conditions de FR-007 n'est pas tenue.

Approche technique : **aucun nouveau moteur**. On corrige un chemin de référence
dans un instrument existant, on étend une énumération, on ajoute un sujet, on
instrumente la révision du navigateur, et on ajoute un évaluateur pur + CLI pour
la porte de clôture. Zéro contrat, zéro token, zéro sortie générée, zéro
mutation Figma.

## Technical Context

**Language/Version**: TypeScript (pin dépôt `typescript@^6`), Node ≥ 20, ESM exécuté via `tsx`
**Primary Dependencies**: `playwright-core` (Chromium épinglé via le cache Playwright), `pixelmatch` + `pngjs` (instrument visuel existant), Figma REST API en **LECTURE SEULE** (`FIGMA_TOKEN` — dumps de nodes + export PNG), Zod (`@ds-contracts/schema`, non modifié)
**Storage**: JSON sur disque — `specs/014-…/proofs/` (registre avant/après, reçus de cause, rapport de clôture), `specs/013-…/contracts/audit-campaign.json` (faits de reassurances re-relevés), `extract/figma/visual-parity/{triage.ts,subjects.ts,REPORT.md,baseline.json}` ; **aucun** `contracts/*.contract.json` ni `tokens/*.tokens.json` touché
**Testing**: `evals/run.ts` (fixtures data-only, sans réseau ni navigateur) pour la classe d'erreur DW-006, la bijection du vocabulaire et la politique du contrôle de clôture ; les deux instruments (`npm run extract:figma:visual`, `extract/figma/organism-audit/tools/run-one.mts`) pour les mesures
**Target Platform**: CLI Node (instruments de mesure) ; le navigateur de mesure est Chromium headless piloté par `playwright-core`
**Project Type**: instrumentation de mesure — correction d'un instrument existant + une porte de clôture, dans un dépôt de contrats de composants
**Performance Goals**: sans objet (mesure ponctuelle). Contrainte de reproductibilité en revanche : deux exécutions à entrées identiques rendent les mêmes chiffres, faits et hashes — propriété déjà tenue par `build-campaign.mts` (horodatages exclus des hashes) et à préserver
**Constraints**: Figma en lecture seule de bout en bout (aucun `figma_execute`, aucune méthode HTTP autre que GET) · un triage ne répare pas · aucun seuil, aucune région déclarée, aucun critère de preuve assoupli (seule évolution : un durcissement, la suppression de la dispense à 3 %) · le contrôle de clôture est fail-closed (code de sortie non nul) · aucun compte figé en prose : la sortie vive est l'autorité
**Scale/Scope**: 34 contrats mesurés (33 aujourd'hui) · 2 instruments · 22 sujets de parité (+1 : `select`) et 39 lignes publiées (36 diffées + 3 non diffées) · 12 organismes dont **1 seul** re-rendu (reassurances) mais **9 lignes divergentes à causer** (D12) · 25 règles de triage re-classées sur 6 valeurs (22 vivantes + 3 mortes déplacées en `RETIRED_RULES`) · +17 règles neuves · 6 entrées DW re-classées · 3 blocages d'organismes re-testés

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` (v1.2.0). Every item MUST be true, or be
justified in Complexity Tracking below.

- [x] **I. Determinism (NON-NEGOTIABLE)** — Aucun modèle dans le chemin de
      génération : la fonctionnalité ne génère rien. `npm run build` et
      `deterministic-roundtrip` restent verts par construction (aucun contrat,
      token ni générateur touché). Les artefacts produits (registre, reçus,
      rapports) sont rendus depuis leur JSON d'autorité, jamais écrits à la main.
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — Trois capacités nouvelles, trois
      fixtures **écrites d'abord** : la classe d'erreur « une dérivée provient
      d'un autre node que celui du cas » (FR-002, rouge avant la correction), la
      bijection vocabulaire publié ↔ énumération de l'instrument (FR-004), et la
      politique du contrôle de clôture (FR-007). Aucune phrase de capacité n'est
      écrite avant son eval.
- [x] **III. Contract is the SSoT** — Aucun contrat modifié (SC-005). Rien ne
      transite d'une surface à l'autre : 014 **mesure et classe**, il ne promeut
      rien. `npm run parity` doit rester exactement dans l'état où il est.
- [x] **IV. No hand-edited output** — `src/components/`, `figma-sync/*.js`,
      `catalog/catalog.json`, `contracts/contract.schema.json` : intouchés.
      Le dossier reassurances et la synthèse 013 sont **re-rendus par leur
      outil** (`tools/run-one.mts`, `tools/build-campaign.mts --verify`), jamais
      édités.
- [x] **V. Honesty** — C'est l'objet même de la fonctionnalité. Trois
      dégradations sont nommées dès la recherche plutôt qu'absorbées : le
      baseline commité ne couvre que 4 lignes mesurées sur 36 sur une version
      Figma périmée (§0.7), le navigateur de mesure dérive en silence (§0.6), et
      SC-002 citait « 63 lignes » quand le rapport en porte 39 (§0.9) — écart
      corrigé à la source : SC-002 ne cite plus de nombre, le contrôle compte en
      direct.
- [x] **VI. Additive evolution** — Aucun changement de schéma Zod, aucun contrat
      versionné. L'extension de `CauseClass` porte sur une énumération interne à
      l'instrument, pas sur le schéma de contrat ; elle est publiée avec sa table
      de correspondance et couverte par une fixture.
- [x] **VII. Engine integrity** — `core/` n'est pas touché : la fonctionnalité
      vit dans `extract/figma/**` et `evals/`. `core-browser-check.mjs` reste
      vert par construction. Aucun défaut de canvas en jeu, donc rien à
      enseigner au mock.
- [x] **VIII. Source cleanliness** — Sans objet **et vérifié comme tel** : 014
      n'extrait ni ne contracte aucun composant. Les défauts de source Figma
      qu'un triage identifiera sont **consignés** sous la valeur `figma-source`
      et versés en entrée de 016 ; les corriger ici violerait FR-005 et SC-005.
- [x] **IX. Docs-first** — La recherche est une **lecture** du dépôt : chaque
      fait de `research.md` cite son fichier et sa ligne (pilote, triage,
      subjects, render, baseline, manifeste 013). Les documents de référence
      restent l'autorité pour le sens des classes de cause
      (`docs/FIGMA-CAPABILITY-MATRIX.md` pour la frontière image A5) et sont
      consultés avant d'attribuer une cause plutôt que re-dérivés.
      *Limite nommée* : le MCP auggie a refusé toute requête pendant cette
      session (HTTP 402), la lecture s'est donc faite par `rg`/lecture directe —
      le repli documenté par les instructions globales.
- [x] **X. Before-capture** — Sans objet : aucune mutation de canvas (FR-008).
      La règle est néanmoins **honorée par analogie** sur la seule chose que 014
      écrase — les chiffres publiés : l'état « avant » de **toutes** les lignes
      des deux instruments est capturé avant la première modification (D5), pas
      un sous-ensemble pilote.
- [x] **XI. Multi-writer bridge** — Sans objet : aucune écriture sur le canvas,
      un seul exécutant.

**All gates green:**

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Plus la porte propre à la fonctionnalité, qui doit refuser tant que les quatre
conditions de FR-007 ne sont pas tenues :

```bash
npm run measure:gate            # fail-closed — code de sortie non nul tant qu'un trou subsiste
```

Le travail se déroule dans le checkout principal (aucun worktree : `git worktree
list` n'en montre qu'un), donc la clause F1 de la constitution est sans objet et
la balayée tourne directement ici.

## Project Structure

### Documentation (this feature)

```text
specs/014-mesure-juste-triage/
├── plan.md              # ce fichier
├── research.md          # Phase 0 — relevés + 10 décisions
├── data-model.md        # Phase 1 — les six entités et leurs invariants
├── quickstart.md        # Phase 1 — la séquence exécutable, dans l'ordre imposé
├── contracts/
│   ├── cause-vocabulary.md        # les 6 valeurs, bijection slug ↔ libellé
│   ├── measure-gate.interface.md  # CLI + codes de sortie + refus nommés
│   └── receipts.schema.md         # registre avant/après, reçus de cause, provenance
├── checklists/
│   └── requirements.md            # (existant)
└── proofs/                        # produit à l'implémentation, pas au plan
    ├── registre/{avant.json,apres.json,causes.json,REGISTRE.md}
    │                              # causes.json = registre des causes HORS règles TRIAGE :
    │                              #   6 entrées DW re-classées + 9 lignes d'organismes (D12)
    ├── recus/<id>.json            # un reçu par cause publiée — héritée (re-test) ou neuve (mesure)
    └── RAPPORT-CLOTURE.md
```

### Source Code (repository root)

```text
extract/figma/
├── organism-audit/
│   ├── pilot.ts              # MODIFIÉ — les 5 dérivées basculent sur le node du cas ; émet referenceProvenance
│   ├── reference.ts          # NOUVEAU — resolveCaseReference + checkReferenceProvenance (purs)
│   ├── report.ts             # MODIFIÉ — le dossier publie la provenance et la révision du navigateur
│   ├── harness.ts            # MODIFIÉ — enregistre browser.version() + l'exécutable résolu
│   └── tools/
│       ├── fetch-census.mts        # MODIFIÉ — census sur le node du cas (prend une VAGUE, pas un sujet)
│       ├── verify-declarations.mts # MODIFIÉ — idem (censusNodeIds) ; sans argument, vérifie tout
│       ├── merge-declarations.mts  # inchangé — fusionne la déclaration re-relevée dans le manifeste
│       ├── run-one.mts             # inchangé — re-rend le dossier reassurances
│       ├── build-campaign.mts      # inchangé — re-rend la synthèse (--verify refuse tout écart)
│       └── build-registre.mts      # NOUVEAU — re-mesure les 9 sujets à cas (vagues 1+2) dans
│                                    #   out/registre-scratch/, jamais dans specs/013-…/proofs/ ;
│                                    #   lit visual-parity/out/rows.json (reçu machine, refus s'il
│                                    #   est trop vieux) + le REPORT.md commité (git show HEAD:…) ;
│                                    #   écrit avant.json puis apres.json, ce dernier relisant
│                                    #   avant.json pour porter les deux côtés (D11, D13)
├── visual-parity/
│   ├── triage.ts             # MODIFIÉ — CauseClass 5 → 6 valeurs + libellés publiés ; 22 règles vivantes
│   │                         #   re-classées, 3 mortes déplacées en `RETIRED_RULES` ; +17 règles
│   │                         #   (4 UNTRIAGED + 13 lignes à `—`), chacune avec son `receiptId`
│   ├── subjects.ts           # MODIFIÉ — +1 sujet `select` ; le commentaire d'exclusion devient le reçu de son infirmation
│   ├── run.ts                # MODIFIÉ — écrit `out/rows.json`, le reçu MACHINE du rapport
│   │                         #   (lignes en pleine précision + révision du navigateur) : `main()`
│   │                         #   n'écrivait que du Markdown, et un registre qui le reparse
│   │                         #   perdrait les scores sous 0,005 % ; la cause n'est plus
│   │                         #   conditionnée au seuil de 3 % ; le rapport publie les libellés
│   ├── render.ts             # MODIFIÉ — launchBrowser expose la version et le chemin de l'exécutable
│   └── REPORT.md             # RÉGÉNÉRÉ (jamais édité à la main)
└── measure-gate/             # NOUVEAU — la porte de clôture
    ├── gate.ts               # évaluateur PUR des 4 conditions de FR-007
    └── run.ts                # CLI mince : lit les artefacts, applique le code de sortie

evals/
├── fixtures/                 # MODIFIÉS — 5 appelants de `launchBrowser()`, dont la signature
│                             #   change en T002 : icon-glyph-geometry-check,
│                             #   nav-tab-campaign-targeted-recheck, tab-external-roving-context-check,
│                             #   carte-member-card-targeted-recheck, field-campaign-targeted-recheck.
│                             #   `evals/fixtures` est EXCLU du tsconfig — tsc reste vert et
│                             #   `npm run eval` casse au runtime. Chercher les appelants à la main.
├── run.ts                    # MODIFIÉ — enregistre les 3 nouveaux cas
└── fixtures/
    ├── organism-audit-case-reference-check.ts   # NOUVEAU — la fixture ROUGE de FR-002
    ├── triage-vocabulary-check.ts               # NOUVEAU — bijection publié ↔ instrument
    └── measure-gate-policy-check.ts             # NOUVEAU — politique fail-closed

extract/figma/gauntlet/live/visual-live.ts        # MODIFIÉ — appelant de `launchBrowser()`
specs/006-…/proofs/us4-proprietes/render-code.mts # MODIFIÉ — idem (script de preuve d'une spec close)

site/
└── src/pages/how.ts          # MODIFIÉ — publie la table de triage (« engine / capture-gap /
                              #   renderer / harness / design ») : cinq valeurs que l'instrument
                              #   ne connaîtra plus, donc l'« état refusé » de FR-004

specs/013-auditer-fidelite-organismes/
├── contracts/audit-campaign.json                # MODIFIÉ — 44 faits de reassurances re-relevés sur 2114:3619
├── proofs/declarations/reassurances.json        # MODIFIÉ — la déclaration re-relevée, avant fusion
└── proofs/organisms/reassurances/…, proofs/{result.json,REPORT.md}   # RE-RENDUS par leurs outils

package.json                  # MODIFIÉ — script `measure:gate`
```

**Structure Decision**: la fonctionnalité ne crée qu'un seul répertoire de code,
`extract/figma/measure-gate/`, et suit pour lui la forme éprouvée deux fois dans
le dépôt — un évaluateur **pur** qu'une fixture d'eval peut exercer sans réseau
ni navigateur (`visual-parity/gate.ts`, `organism-audit/campaign.ts`) et un CLI
qui n'a que la plomberie. Tout le reste est une modification d'instruments
existants. Les preuves vivent sous `specs/014-…/proofs/`, comme 013 ; les reçus
de 013 ne sont pas réécrits (seul reassurances est re-rendu, parce que FR-003
l'exige), et le re-classement du registre DW est un artefact **de 014** qui
référence les identifiants DW.

## Ordre imposé (les dépendances font loi)

Un ordre est contraignant ici, parce que trois exigences se conditionnent :

1. **T0 — re-mesure « avant »** (FR-009). Avant toute écriture : les deux
   instruments tournent inchangés, chaque chiffre est figé avec la révision du
   navigateur, et l'écart avec les chiffres commités est publié et attribué.
   Côté audit d'organismes, la re-mesure des 9 sujets à cas se fait dans un
   dossier de travail dédié — jamais dans `specs/013-…/proofs/` — via
   `build-registre.mts` (recherche D11) ; `build-campaign.mts --verify` reste
   un contrôle de cohérence utile mais ne re-mesure rien, il ne peut donc pas
   fonder l'« avant » à lui seul. *Rien d'autre ne commence avant.*
2. **Fixture rouge** (FR-002, constitution §II) — écrite et **vue rouge** avant
   la correction du pilote.
3. **Correction DW-006** (FR-001/FR-003) — les cinq dérivées, puis le re-relevé
   des 44 faits, puis le re-rendu du dossier et de la synthèse.
4. **Vocabulaire à six valeurs** (FR-004) — l'énumération avant les causes, sans
   quoi les causes n'auraient pas où se poser.
5. **Triage + suppression de la dispense à 3 %** (FR-004/FR-015) — sur les
   **deux** instruments : les 4 lignes UNTRIAGED et les 13 lignes aujourd'hui à
   `—` du rapport de parité (règles de `TRIAGE`), **et** les 9 lignes divergentes
   de l'audit d'organismes (registre `causes.json`, décision D12). Le rapport de
   parité est régénéré **après** l'attribution, sans quoi il publie encore ses
   lignes UNTRIAGED.
6. **`select`** (FR-006) — indépendant de 1-5, peut se paralléliser après T0.
7. **Re-tests des causes héritées** (FR-012/FR-013) — indépendants après T0.
8. **Registre « après » + porte de clôture** (FR-007/FR-009/FR-011) — en dernier,
   par construction.

## Constitution Re-Check (après Phase 1)

Ré-évalué contre la conception livrée (`data-model.md`, `contracts/`,
`quickstart.md`). **Les onze items restent verts** ; trois d'entre eux ont gagné
un ancrage concret que le premier passage n'avait pas :

- **II (Claims Rule)** — les trois fixtures ont maintenant une forme arrêtée et
  toutes trois sont **data-only** : `organism-audit-case-reference-check.ts`
  (l'état défectueux reconstitué en données, donc rouge sans faire tourner
  l'ancien pilote), `triage-vocabulary-check.ts` (les cinq propriétés du
  contrat de vocabulaire, dont l'absence de tout slug retiré dans une surface
  publiée), `measure-gate-policy-check.ts` (la politique des quatre conditions).
  **Les trois sont écrites avant l'implémentation qu'elles couvrent** et vues
  rouges : T006 avant T007, T017 avant T016, T041 avant T039. Aucune n'ouvre de navigateur ni de connexion Figma — la
  condition qui les rend exécutables pour toujours dans `npm run eval`.
- **V (Honesty)** — la conception a produit **deux constats supplémentaires**
  que le premier passage n'avait pas : trois règles de triage sont mortes
  (`heading`, `switch`, `badge` — contrats supprimés à la reconversion,
  recherche §0.8), et deux lignes « Not diffed » (`button-with-icons` *skipped*,
  `piqueray-logo` *refused*) sont des causes affirmées qui retirent une mesure,
  donc dans le périmètre de re-test de FR-012 sans que la spec les nomme
  (recherche §0.5). Les deux sont publiés, aucun n'est absorbé.
- **IX (Docs-first)** — la vérification des commandes du quickstart contre le
  code a corrigé deux erreurs avant qu'elles n'atteignent l'implémentation : le
  filtre de sujet de la parité visuelle est **positionnel**, pas `--subject`
  (`run.ts:339-345`), et `fetch-census.mts` prend une **vague**, pas un sujet.
  Un reçu dont la `method` ne se rejoue pas ne serait pas un reçu.

Aucune décision de conception n'a introduit de violation : la fonctionnalité ne
génère rien, ne promeut rien et ne mute rien.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Aucune violation : les onze principes sont tenus ou sans objet, et les trois
« sans objet » (VIII, X, XI) sont argumentés au-dessus plutôt que cochés.

Un seul point mérite d'être consigné parce qu'il ressemble à une entorse sans en
être une : **on modifie `specs/013-…/`**, une campagne close. C'est FR-003 et
FR-010 qui l'exigent (le dossier reassurances doit être re-rendu depuis la
référence correcte, et tout document citant un chiffre modifié doit être re-rendu
depuis son autorité). La limite est tenue par D10 : seul reassurances est
re-rendu, la synthèse est recalculée par son propre outil en mode `--verify`, et
le registre des travaux reportés de 013 n'est **pas** réécrit — son re-classement
est publié comme artefact de 014.
