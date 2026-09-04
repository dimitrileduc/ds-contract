# Implementation Plan: États d'interaction du Bouton gouverné

**Branch**: `oceanic-oak` | **Spec Kit feature**: `032-etats-bouton` | **Date**: 2026-09-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/032-etats-bouton/spec.md`

## Summary

Remplir le canal d'états — déjà présent dans le schéma, déjà rendu par les trois
émetteurs, **vide sur les 39 contrats Piqueray** — pour le seul `ds.button`, et
faire descendre le résultat jusqu'au site : survol et pressé sur les 7 styles,
anneau de focus clavier visible sur fond clair comme sur fond sombre, apparence
au repos strictement intacte.

Le périmètre de code du dépôt est minuscule et c'est le point : **un contrat, un
fichier de jetons, des évaluations**. Aucun émetteur, aucun schéma, aucun
générateur n'est touché — la recherche l'a prouvé fichier par fichier
([research.md](research.md) D1). Ce qui coûte, ce n'est pas la capacité, c'est la
**propagation** : 42 feuilles de jetons qui doivent devenir des variables Figma,
un axe `State` à poser sur un master vivant sans détacher une seule instance, et
une cascade Odoo de six miroirs manuels dont 253 épingles de version.

Trois arbitrages owner du 2026-09-04, tous nés d'un fait mesuré et non d'une
préférence : **FR-019** se lit désormais comme un plancher AA plus une clause de
non-régression pour l'Orange — lu à la lettre, il refusait la palette que l'owner
avait lui-même validée, sur 5 styles sur 7 ; le style **Link** prend `noir-pur` au
survol et un ton minté au pressé, la planche étant muette là-dessus ; la **bague
de focus** est d'un seul ton choisi par style, le deux-tons de la planche étant
inatteignable sans ombre portée — laquelle effacerait les bordures du Bouton en
silence.

Deux préalables durs, découverts au relevé et non négociables : le sync de jetons
**refuse aujourd'hui** (deux styles de texte du menu sans marqueur d'identité), et
la mutation canevas doit être photographiée intégralement avant le premier
`remove()`.

## Technical Context

**Language/Version**: TypeScript (pin dépôt `typescript@^6`), Node ≥ 20, ESM
exécuté via `tsx` — **instruments existants uniquement, aucun nouveau code
applicatif dans `core/`, `scripts/` ou `packages/`**

**Primary Dependencies**: Zod (`@ds-contracts/schema` — **non modifié**) ; React 19
+ CSS Modules (émetteur `react`, non modifié) ; `core/emit-html.ts` (source de
`components.pqr.css`, non modifié) ; `core/emit-figma-script.ts` (axe State, non
modifié) ; `playwright-core` + `pixelmatch`/`pngjs` via `extract/image-parity/`
(preuve du repos) ; `extract/figma/state-photo/` (photographie du canevas) ;
Figma REST en **lecture** (`FIGMA_TOKEN`) ; pont desktop **figma-console**
(`figma_execute`, `loadAllPagesAsync`, `getInstancesAsync`) pour les **trois**
gestes d'écriture canevas : migration de marqueur, `01-tokens.js`,
`NN-button.js` ; Docker + Compose (instance Odoo **jetable**, jamais celle de
l'owner)

**Storage**: JSON et CSS sur disque —
`tokens/primitives.tokens.json` (**seul fichier de jetons édité** : 7 primitives
+ 35 alias `color.etat.*`) ·
`contracts/button.contract.json` (2.1.0 → **2.2.0**) ·
`evals/legacy-cases.ts` + `evals/run.ts` + `evals/REMOVED-CASES.md` (sortie de
quarantaine) ·
les six miroirs Odoo listés dans
[contracts/odoo-propagation.contract.md](contracts/odoo-propagation.contract.md) ·
`docs/FIGMA-CAPABILITY-MATRIX.md` + `docs/03-token-pipeline.md` (limites nommées
et correction des styles mal désignés) ·
re-pins : `evals/golden.json`, `figma-sync/plugin/engine.receipt.json`,
`catalog/catalog.json`, `integrations/odoo/config/inputs.lock.json` ·
reçus commités sous `specs/032-etats-bouton/proofs/` ; PNG de travail gitignorés

**Testing**: `npm run eval` (au moins un cas sorti de quarantaine, **prouvé par
sabotage** — un cas qui reste vert quand on le casse ne prouve rien) ·
`npm run images:compare` en comparaison **stricte** pour le repos (SC-006) ·
`npm run parity` sur les trois axes, **sans acquittement neuf** ·
sondes canevas par identifiant de nœud, jamais par nom de calque ·
navigation clavier réelle sur la home Odoo · relevé de contraste sur les fonds
de page réellement employés

**Target Platform**: bibliothèque React générée · fichier Figma Design
« Piqueray (Copy) » `d9FYAUcqdcNtsuaMgLefvJ`, master `Bouton` `6:122` · site
Odoo 19 (`odoo:19.0-20260803`) sur une instance jetable

**Project Type**: remplissage d'un canal existant du contrat, propagé aux trois
surfaces — pas de développement de moteur

**Performance Goals**: écart **0,0000 %** sur les 7 styles au repos ;
**28** variantes attendues sur le set (7 renommées + 21 créées), **zéro**
orpheline, **zéro** doublon ; second sync **sans effet** ; `parity/baseline.json`
inchangé à 40 entrées

**Constraints**: apparence au repos figée (FR-010) · aucune valeur de couleur
littérale (FR-007) · aucune case Figma dessinée à la main (FR-008) · **ombre
portée interdite** pour la bague (elle débranche le rendu des bordures et fait
grossir la boîte) · toute écriture canevas arbitrée par l'owner · **jamais**
l'instance Odoo `piqueray-odoo-test` (8071)

**Scale/Scope**: 1 contrat sur 39 · 7 styles × 3 états · 42 feuilles de jetons
neuves · 1 master Figma, 7 → 28 variantes, ~354 instances à préserver · 13 blocs
Odoo à reclasser · 253 épingles de version à aligner · au moins 1 évaluation
restaurée sur 4 candidates

## Constitution Check

*GATE : franchi avant Phase 0, re-évalué après Phase 1. Constitution v1.3.0.*

| # | Principe | Verdict | Comment il est tenu |
|---|---|---|---|
| I | Déterminisme — aucune IA dans la conversion | ✅ | Aucune modification du chemin de génération. Le contrat et les jetons sont des **données** ; `deterministic-roundtrip` et `golden.json` restent les preuves. L'IA a proposé la matrice ; elle ne l'exécute pas. |
| II | Règle des promesses — fixture → eval → claim | ✅ | FR-015 est un **prérequis de la vague**, pas un bonus : la phrase « le Bouton répond aux gestes » n'entre nulle part avant que l'eval restaurée soit verte **et** prouvée rouge sous sabotage (quickstart étape 5). |
| III | Le contrat est la source unique | ✅ | Les trois surfaces découlent de `button.contract.json`. Aucune règle d'état écrite à la main n'est ajoutée. La seule règle manuelle existante (pied de page) est **nommée**, avec sa raison technique, non dissimulée (D11). |
| IV | Le généré n'est jamais édité à la main | ✅ | `src/components/`, `figma-sync/*.js`, `catalog/`, `components.pqr.css` : régénérés. Les miroirs Odoo ne sont pas du généré — ce sont des **épingles déclarées**, avec des portes qui les vérifient. |
| V | Honnêteté — la dégradation est nommée | ✅ | Six limites écrites au contrat d'interface (L1–L6) : soulignement par style impossible, prototype Figma absent, `outline-offset` non porté au canevas, survol collant sur tactile, glyphes sans `currentColor`, survol manuel du pied de page. Plus la contradiction FR-011/Hors-périmètre, tranchée en toutes lettres. |
| VI | Évolution additive & semver | ✅ | `states`, `figmaStatePreviews`, `anatomy.root.states` sont **optionnels** et absents aujourd'hui → **MINOR**, 2.1.0 → 2.2.0. Aucun prop retiré, aucun énuméré narrowé. Schéma **non modifié**, donc pas de bump de `docs/02-contract-spec.md`. |
| VII | Intégrité du moteur — cœur pur navigateur, fidélité du simulateur | ✅ | `core/` n'est pas touché ; `core-browser-check` reste vert. Le simulateur a **déjà** validé l'ajout d'axe (sonde locale du 2026-09-04, contrat reverti). Si un défaut n'apparaît que sur le canevas vif, la règle des deux moitiés s'applique : corriger **et** apprendre au simulateur. |
| VIII | Propreté de source — auditer le Figma avant de le contracter | ⚠️ **entorse nommée** | Les cinq teintes ont été **calculées puis posées** par l'owner ; le relevé est postérieur. La spec l'annonce, le plan l'écrit dans chaque `$description` de jeton et dans `contracts/state-tokens.matrix.json` → `source.honesty`. La planche est par ailleurs une **maquette** (son propre sous-titre le dit), pas un master : elle n'est pas extraite, elle est relevée comme décision de couleur. |
| IX | Docs d'abord — lire avant de dériver | ✅ | Chaque décision de recherche porte fichier et ligne. Trois questions de capacité ont été posées au code plutôt qu'inférées : `outline-offset` est-il un canal gouverné (non), `declaredStates` a-t-il une dimension par énuméré (non), un jeton manquant est-il un refus ou un saut (refus). |
| X | Photographie avant toute mutation canevas | ✅ | Étape 0c du quickstart : photographie des 9 planches **plus** relevé des instances **par identifiant**, sur **toutes** les cibles, avant le premier geste — pas un sous-ensemble pilote. Version nommée posée sur le fichier. Chaque capture vérifiée non vide et bien dimensionnée. |
| XI | Pont multi-écrivains — zones disjointes | ✅ | Un seul écrivain, trois gestes séquentiels sur des zones disjointes (styles de texte → variables → master `Bouton`). Un unique cycle global de vérification pixel enveloppe l'ensemble. |
| XII | Fidélité de la surface de décision | ✅ | Les trois arbitrages ont été présentés avec le **fait mesuré** en tête (les contrastes réels, la palette réelle, les fonds réels), options mutuellement exclusives, sans miniature ni option décorative. |

**Verdict** : franchi. Une seule entorse, à §VIII, **déjà déclarée par la spec** et
écrite dans les artefacts — pas justifiée par la commodité mais par la
chronologie, et rendue visible là où quelqu'un la lira (la description du jeton).

### Re-évaluation après Phase 1

Aucun principe ne bascule. Le design de Phase 1 **réduit** le risque sur trois
points : il n'ouvre aucun canal de schéma (§VI reste un simple MINOR de contrat) ;
il ne touche aucun émetteur (§I et §VII restent hors d'atteinte, re-pin
`examples/polaris/` attendu à **zéro** — s'il apparaît, c'est le signal d'un
émetteur qui a bougé sans qu'on l'ait voulu) ; et il refuse d'acquitter dans
`parity/baseline.json`, ce qui interdit de payer la dette de §III en monnaie de
singe comme l'avait fait 015.

## Project Structure

### Documentation (this feature)

```text
specs/032-etats-bouton/
├── plan.md                              # ce fichier
├── spec.md
├── research.md                          # Phase 0 — 15 décisions, chacune avec sa preuve
├── data-model.md                        # Phase 1 — les 3 entités et leurs invariants
├── quickstart.md                        # Phase 1 — validation de bout en bout
├── contracts/
│   ├── state-tokens.matrix.json         # la matrice arrêtée + registres de contraste + limites L1–L6
│   └── odoo-propagation.contract.md     # les 6 miroirs, l'ordre d'exécution, le piège de l'or
├── checklists/requirements.md
├── proofs/                              # créé à l'exécution : T0/, etape1..5/, cloture/
└── tasks.md                             # Phase 2 — /speckit-tasks, PAS créé ici
```

### Source Code (repository root)

Les fichiers **édités** — la liste est close, et sa brièveté est le résultat
principal de la recherche :

```text
tokens/
└── primitives.tokens.json               # +7 primitives, +35 alias color.etat.*

contracts/
└── button.contract.json                 # 2.1.0 → 2.2.0 : states, figmaStatePreviews,
                                         #   anatomy.root.states, description datée

evals/
├── legacy-cases.ts                      # focus-not-pressed-browser-probe sort de quarantaine
├── run.ts                               # le cas y est réenregistré, repointé sur Piqueray
└── REMOVED-CASES.md                     # la quarantaine n'est jamais silencieuse

integrations/odoo/                       # propagation — voir contracts/odoo-propagation.contract.md
├── config/*.authoring.json              #   253 épingles ds.button 2.1.0 → 2.2.0
├── config/inputs.lock.json              #   régénéré (--repin)
└── addons/piqueray_ds/
    ├── views/components.xml             #   14 x data-ds-graph-digest
    └── static/src/js/version_guard.js   #   CURRENT_GRAPH_DIGEST
scripts/odoo/scan-saved-versions.ts      #   EXPECTED_GRAPH (jumeau manuel)
evals/fixtures/odoo-production/version-drift/cases.json

docs/
├── FIGMA-CAPABILITY-MATRIX.md           # limites L1, L2, L3 — là où la capacité est annoncée
└── 03-token-pipeline.md                 # correction : les styles désignés pour la migration
                                         #   de marqueur sont les mauvais
```

Les fichiers **régénérés, jamais édités** : `src/components/Button/*`,
`src/styles/tokens.css`, `figma-sync/*.js`,
`integrations/odoo/addons/piqueray_ds/static/src/css/generated/*`,
`catalog/catalog.json`, `evals/golden.json`,
`figma-sync/plugin/engine.receipt.json`.

**Structure Decision** : aucune arborescence nouvelle. La vague remplit un canal
existant et propage ; elle n'introduit ni module, ni instrument, ni répertoire —
sauf `specs/032-etats-bouton/proofs/`, et le petit outil de rendu du repos
(`tools/render-repos.mts`) qui vit **dans le dossier de la spec**, pas dans le
dépôt, parce qu'il ne sert qu'à cette preuve.

## Séquence d'exécution

L'ordre est contraint par trois dépendances dures, pas par confort :

1. **Migration de marqueur** (canevas, métadonnée pure) — sans elle
   `01-tokens.js` refuse **avant** la première écriture de variable, donc aucun
   jeton d'état ne peut naître.
2. **Photographie complète** (§X) — avant le premier geste, sur **toutes** les
   cibles. Une capture manquée découverte après est irrécupérable.
3. **Jetons avant Bouton** sur le canevas — les cases d'état **lient** des
   variables ; les poser avant qu'elles existent produirait des cases muettes.

Puis, dans le dépôt : `build` → **`figma:plan`** → `emitters:check` / `catalog` →
`golden:update`. Sauter `figma:plan` fige un script Figma périmé qui passe
`emitters:check` et se fait attraper plus tard par l'eval `golden-generated-output`
— coût constaté sur `ds.sav` : une reprise complète.

## Complexity Tracking

| Écart | Pourquoi c'est nécessaire | Pourquoi le plus simple ne suffit pas |
|---|---|---|
| **Entorse à §VIII** : couleurs calculées puis posées, relevé postérieur | Les cinq teintes sont une **décision** de l'owner, pas un fait préexistant du fichier ; il n'y avait rien à auditer avant de décider | Auditer d'abord aurait relevé un fichier sans aucun état — Piqueray ne portait aucune variable de survol sur ses 298 variables. L'entorse est écrite dans chaque `$description`, pas dissimulée |
| **35 alias** pour 5 couleurs qui changent vraiment | La substitution `{variant}` exige que **les sept** valeurs de l'énuméré existent : un jeton manquant est un refus par nom, pas un saut silencieux | Écrire les états style par style demanderait un canal par énuméré dans `states`, donc une modification de schéma — bien plus cher que 30 alias qui pointent sur la valeur de repos |
| **2 primitives posées par le plan** (`transparent`, `noir-profond`) | `transparent` rend la matrice complète pour le style Link, qui n'a pas de fond ; `noir-profond` porte son pressé, arbitré par l'owner | Aliaser le fond du Link sur `color.blanc` marcherait **par accident** (ses quatre hôtes sont blancs) et casserait le jour où l'un passe sur `bleu-clair` |
| **Bague d'un seul ton** au lieu du deux-tons validé | L'ombre portée débranche le rendu des bordures du Bouton et fait grossir la boîte, **sans erreur** ; `outline-offset` n'est pas un canal gouverné | Le deux-tons demanderait d'ouvrir un canal de schéma, et resterait imparfait sur `Outline noir` où l'anneau intérieur se confond avec sa bordure. Le résultat mesuré est atteint : 13,5 à 21 pour 1 sur les cinq fonds réels |
| **FR-011 et SC-004 lus dans le périmètre du Bouton** | La spec met explicitement le survol manuel du pied de page **hors périmètre** ; les deux phrases ne peuvent pas être vraies ensemble | Gouverner ce survol demanderait d'élargir `PART_STATE_CHANNELS` à `opacity` — une modification d'émetteur, contre le « `ds.button` seul » annoncé en tête de spec. L'exception est écrite au rapport de clôture, pas effacée |
