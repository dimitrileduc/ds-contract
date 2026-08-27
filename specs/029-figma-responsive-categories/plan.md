# Implementation Plan: Rendre CategoriesPrincipales responsive dans Figma

**Branch**: `just-euphonium` | **Spec Kit feature**: `029-figma-responsive-categories` | **Date**: 2026-08-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/029-figma-responsive-categories/spec.md`

## Summary

Rendre responsive, dans Figma Design uniquement, le set gouverné
`CategoriesPrincipales` (axes `Style {Superpose, Empile} × Colonnes {2, 3}`,
4 combinaisons) et sa carte exclusive `Carte/Categorie`, en suivant le gabarit de
la spec 028: audit frais → design en frames de travail validé owner → GO →
application prouvée → clôture figma-ahead. Le nombre de colonnes reste un énuméré
desktop `{2, 3}`; le mobile retombe à une carte par ligne sans réglage exposé. La
ligne orpheline du 3 colonnes et l'étendue exacte des changements de la carte sont
des décisions owner au gate H2; la posture parité est une décision owner au gate H4.

La mise en œuvre réutilise le runner mono-composant `component:repair` en DEUX
campagnes séquentielles (carte puis section) sous UN cycle global de captures et de
vérification (§X/§XI). 029 étend le runner de façon générique et bornée — topologie
de set existant, sélection de scénario multi-axes, cible carte autorisée avec
enfants refusés, 7 surfaces d'usage — chaque capacité précédée d'une fixture rouge
et d'un eval. Aucune Page n'est écrite; aucun enfant partagé hors carte, contrat,
token, émetteur, HTML ou Odoo n'est touché. Chaque écart au gabarit 028 est
consigné à son apparition pour la future skill `component-to-responsive`.

## Technical Context

**Language/Version**: Figma Design et Figma Plugin API du fichier Piqueray épinglé;
Node.js >= 20, TypeScript/ESM avec `tsx` pour l'extension bornée du runner et de
ses preuves, sans ajout de code produit

**Primary Dependencies**: Figma Desktop/Design, Figma REST read-only,
`npm run component:repair` + `component:repair:bridge` (Desktop Bridge), primitives
numériques et Text Styles Piqueray existants, suite déterministe `npm run eval`,
gabarit et preuves de la spec 028

**Storage**: source live dans le fichier Figma épinglé; décisions, inventaires,
captures PNG, structures, faits, reçus et registre des écarts versionnés dans Git;
aucun datastore applicatif

**Testing**: audit par identité/position (2 masters, exclusivité carte, 7 usages);
captures before/after/idempotence sur TOUTES les surfaces; contrôle des
`boundVariables`, textes, médias, variantes, liens et overrides; scénarios 320,
390, 834, 1200, 1440, 1728 × configurations 2 et 3 colonnes × contenus normal et
long; second passage strictement no-op; fixtures négatives et evals ciblés pour
chaque capacité runner ajoutée

**Target Platform**: fichier Figma Design Piqueray `d9FYAUcqdcNtsuaMgLefvJ`,
ouvert dans Figma Desktop et repinné à une version fraîche avant chaque phase live

**Project Type**: campagne d'authoring et de réparation Figma sur deux masters liés
(section + carte exclusive), gouvernée par preuves et gates owner

**Performance Goals**: zéro overflow horizontal, coupe involontaire ou contenu
inaccessible sur les 6 largeurs × 2 configurations × 2 contenus; mobile = 1 carte
par ligne sur 100 % des témoins; zéro Page write; 7 usages rendant comme leur
capture before (ou écart chiffré, attribué, accepté); second passage à zéro
création et zéro modification

**Constraints**: Figma-only; quatre gates humains; primitives existantes uniquement
(aucune valeur brute, primitive, variable sémantique responsive ou mode global);
typographie locale bornée `pending-responsive-text-style`, aucun Text Style global;
énuméré colonnes `{2,3}` conservé, intitulé desktop, jamais une case à cocher;
enfants partagés hors carte read-only; identités/keys/propriétés/liens/overrides
protégés; états sélectionnés explicitement, aucun breakpoint Figma automatique;
couche rédacteur Odoo 023 intacte; état final figma-ahead non convergé; seul
l'outillage runner/transport borné et testé peut changer

**Scale/Scope**: un component set 4 variantes (`2115:4277` historique), une carte
2 variantes (`2063:1611` historique), 7 usages sur la page `Pages` (`210:325`),
6 largeurs de contrôle × 2 configurations × 2 contenus, deux campagnes runner,
quatre gates humains, un registre d'écarts au gabarit 028

## Constitution Check

_GATE: vérifié avant la recherche, puis réévalué après le design de Phase 1._

- [x] **I. Determinism** — aucun modèle n'entre dans une conversion. Les décisions
  sont structurées, les commandes du runner sont rejouables et le second apply de
  chaque campagne doit être un no-op strict.
- [x] **II. Claims Rule** — chaque affirmation de préservation, responsive, binding
  ou idempotence exige un reçu frais; chaque capacité runner ajoutée est précédée
  d'une fixture rouge et d'un eval enregistré avant tout usage live (FR-032).
- [x] **III. Contract SSoT** — les contrats `ds.categories-principales` et
  `ds.carte-categorie` restent l'autorité des surfaces de production. Le résultat
  029 est un candidat figma-ahead explicitement non convergé, dérive nommée,
  régénération non coordonnée interdite; la posture parité est décidée par l'owner
  à H4 sur rapport réel (FR-035, FR-036).
- [x] **IV. Generated Output** — aucun fichier généré, contrat, token, composant
  React, script Figma de surface ou asset Odoo n'est modifié. Le runner et son
  transport sont des sources maintenues.
- [x] **V. Honesty** — absence de breakpoint automatique, dette typographique,
  défauts préexistants séparés du delta responsive, limites du runner, écarts au
  gabarit 028 et non-convergence sont nommés près des résultats; les deltas
  propagés sont attribués, jamais silencieux.
- [x] **VI. Additive Evolution & Semver** — aucun changement de schéma ou de
  contrat n'entre dans cette feature. Une future promotion décidera son semver
  séparément.
- [x] **VII. Engine Integrity** — 029 ne modifie pas le core. Toute capacité
  générique ajoutée au runner est précédée d'une fixture rouge et enseigne au
  transport/mock à refuser définitivement la même classe de défaut.
- [x] **VIII. Source Cleanliness** — H1 réaudite les deux masters, l'exclusivité
  de la carte et les 7 usages par identité et POSITION; les preuves 021/023 sont
  de l'historique; toute contradiction retourne à H1; les défauts préexistants
  sont inventoriés sans bloquer le parent (FR-005..FR-008).
- [x] **IX. Docs-First** — `docs/responsive-figma.md`,
  `docs/FIGMA-CAPABILITY-MATRIX.md`, `docs/internal/component-repair-workflow.md`
  et les preuves/handoff 028 gouvernent les décisions du plan; le récépissé
  docs-first est versionné dans l'inventaire.
- [x] **X. Before-Capture** — les captures before couvrent la TOTALITÉ des
  surfaces — les deux masters (par variante) ET les 7 usages — vérifiées non vides
  et correctement dimensionnées AVANT la première écriture du premier run, jamais
  un sous-ensemble pilote (FR-023).
- [x] **XI. Multi-Writer Bridge** — les deux masters et les frames de travail
  forment une seule zone d'écriture, confiée à un seul writer et un seul cycle
  global de preuve possédé par l'orchestrateur. Les Pages restent hors zone.

**Post-design re-check**: passé pour la planification. Les artefacts séparent
l'audit (H1), la décision de design avec ses deux décisions owner obligatoires —
ligne orpheline et étendue carte — (H2), le plan de mutation des deux runs sous un
cycle global (H3) et l'acceptation avec posture parité (H4). L'extension runner est
générique (aucun id/nom du composant), bornée par allowlist et gouvernée
fixtures-d'abord. Le statut figma-ahead est enregistré comme déviation temporaire
du principe III et ne permet aucune claim de parité contractuelle.

## Project Structure

### Documentation (this feature)

```text
specs/029-figma-responsive-categories/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── figma-design-decision.md
│   ├── non-destructive-mutation.md
│   └── proof-ledger.md
├── decisions/                         # implementation: reçus H1–H4
├── inventory/                         # audit frais, primitives, frames, récépissés
├── proofs/                            # captures, comparaisons, matrices scénarios
├── handoff/                           # observations campagne + ecarts-028.md
└── tasks.md                           # créé par /speckit-tasks
```

### Existing implementation surfaces

```text
docs/
├── responsive-figma.md
├── FIGMA-CAPABILITY-MATRIX.md
└── internal/component-repair-workflow.md

specs/028-figma-responsive-hero-video/  # gabarit: plan, contrats internes, handoff
specs/023-categories-gouvernees/        # historique: audits, gates A/B/C
specs/component-repairs/
├── hero-video/run-005/                 # campagne canonique 028 (référence)
├── carte-categorie/run-001/            # implementation: campagne carte (NOUVEAU)
└── categories-principales/run-001/     # implementation: campagne section (NOUVEAU)

extract/figma/projection-repair/        # runner v2 (types, campaign, apply,
│                                       # bridge-script, apply-receipt, audit,
│                                       # capture, facts, report, verify)
scripts/component-repair-bridge.mjs     # transport Bridge
evals/
├── fixtures/                           # fixtures négatives 029 (NOUVELLES)
└── run.ts                              # ids d'eval enregistrés

Figma (historique, à re-mesurer à H1):
├── set CategoriesPrincipales `2115:4277` — Style×Colonnes, 4 variantes
├── Carte/Categorie `2063:1611` — 2 variantes Style (page DS · Molécules)
├── Frames de travail 029               # hors masters gouvernés et hors Pages
└── Pages `210:325` — 7 usages read-only
```

**Structure Decision**: réutiliser la mécanique du runner 028 telle quelle et créer
deux campagnes fraîches liées à 029, ordonnées carte → section, sous un seul cycle
global de captures. Les frames de brainstorming sont des surfaces Figma temporaires
ou archivées, séparées des masters. Les seuls fichiers de code modifiables sont le
runner/transport et leurs fixtures/evals; ils reçoivent une capacité générique
minimale, jamais un script ad hoc CategoriesPrincipales.

## Design Phases

### Phase A — Repinner la source et obtenir H1

1. Utiliser le worktree Superset actif et le rendre autosuffisant (F1); inventorier
   les changements concurrents du workspace sans les inclure dans les preuves 029.
2. Créer les deux `run-001/campaign.json` avec version Figma fraîche,
   `sourceBaseline` récupérable et `pageMutationPolicy: forbid-direct`.
3. Lancer l'audit read-only: set (4 combinaisons, ids/keys), carte, exclusivité du
   composeur sur tout le fichier, 7 usages PAR POSITION avec configuration, nombre
   de cartes et rendu de référence, primitives disponibles, défauts préexistants
   séparés. Comparer à 021/023 sans reprendre leurs pins comme vérité.
4. Toute contradiction historique, exclusivité non prouvée ou usage manquant rend
   H1 `blocked` au lieu d'être résolu silencieusement.
5. Enregistrer H1. Il autorise uniquement les frames de travail hors masters et
   hors Pages; ni proposition autoritative ni mutation.

### Phase B — Concevoir dans Figma et obtenir H2

1. Créer des frames de travail mobile/desktop/wide, configurations 2 ET 3 colonnes,
   contenus normal et long, sans toucher aux masters; plusieurs options peuvent
   coexister sans qu'aucune ne soit présentée comme appliquée.
2. Démontrer d'abord si l'adaptation interne (grille + carte) suffit; ne proposer
   des états explicites que si cette démonstration échoue visiblement, chaque
   ajout justifié un par un.
3. Montrer explicitement: la ligne orpheline 2+1 du 3 colonnes aux largeurs
   intermédiaires (décision owner), le remplissage quand cartes ≠ colonnes, les
   cas sans image / rapport atypique, la lisibilité du texte sur photo en mobile
   (style superposé).
4. Lier chaque valeur d'espacement à une primitive existante (`composition → node →
   propriété → variable → valeur`); s'arrêter devant l'owner si une primitive
   manque. Enregistrer toute adaptation typographique locale
   `pending-responsive-text-style`.
5. Présenter les options; H2 accepte exactement le comportement, les bindings, la
   typographie, l'orphanRowDecision et la cardExtentDecision. Nettoyer ou archiver
   explicitement les frames refusées. H2 ne donne pas le GO au master.

### Phase C — Étendre le runner, prouver le mécanisme et obtenir H3

1. Écrire d'abord les fixtures négatives: topologie de set existant mal identifiée,
   création non déclarée, mauvaise paire Style×Colonnes en scénario, binding
   détaché, Page write, child write (y compris instance de carte côté section),
   second passage non no-op. Enregistrer chaque eval par un id stable.
2. Étendre types, manifeste, plan/dry-run, transport, faits, captures, reçus et
   vérification: topologie de set existant (créations possiblement nulles),
   sélection multi-axes, cible carte autorisée, 7 surfaces d'usage, deltas
   propagés attribués. Aucun id/nom du composant dans le runner.
3. Exécuter les evals ciblés puis la suite complète et les deux typechecks; toute
   dette préexistante du sweep reste nommée, jamais renommée verte.
4. Exécuter le spike hors source autoritative: identités des 4 membres + carte +
   liens des 7 usages préservés, propagation attribuée, second passage no-op.
5. Repinner Figma, snapshot source récupérable, preflight, puis capturer before la
   TOTALITÉ des surfaces des deux runs — vérifiées non vides et dimensionnées —
   avant toute écriture.
6. Présenter les dry-runs exacts des deux campagnes, blast radius, créations
   attendues, plan de rollback et faits protégés. H3 seul autorise la première
   écriture.

### Phase D — Appliquer, vérifier et obtenir H4

1. Transporter les plans H3 par un seul Desktop Bridge sur le fichier/version
   épinglés, carte PUIS section. Dérive de pin, création inattendue, Page write ou
   child write arrête l'application.
2. Capturer after et dérouler la matrice: 320/390/834/1200/1440/1728 ×
   configurations 2 et 3 × contenus normal et long, sélection explicite. Overflow,
   coupe ou contenu inaccessible est un échec, jamais un delta documentable. Les
   témoins mobiles prouvent 1 carte/ligne sans réglage exposé.
3. Comparer chaque usage à sa capture before: écart zéro, ou chiffré et attribué à
   une cause nommée acceptée. Vérifier identités, keys, axes, propriétés,
   `boundVariables`, calques, liens et overrides.
4. Rejouer exactement les mêmes plans. Les seconds reçus ne contiennent que des
   opérations `no-op`, `createdNodeIds: []`, `changedNodeIds: []`,
   `pageWrites: []` (et `childWrites: []` côté section).
5. Produire le rapport de dérive réel vis-à-vis des deux contrats; l'owner décide
   la posture parité à H4. Capturer l'idempotence, faire accepter limites et
   handoff, puis finalize. Sans H4, la feature n'est pas close.

### Phase E — Handoff et registre des écarts 028

1. Inventorier par comportement la structure, chaque primitive, chaque override
   `pending-responsive-text-style`, les limites média et les enfants différés.
2. Marquer chaque valeur comme observation candidate, jamais comme variable, mode
   ou Text Style responsive global validé.
3. Clore le registre `handoff/ecarts-028.md` — chaque écart consigné à son
   apparition avec sa cause; les trois écarts structurels connus (set existant,
   deux masters/deux runs, sélection multi-axes) y figurent d'office.
4. Enregistrer `figma-ahead/pending-home-responsive-promotion`, la dérive nommée,
   l'interdiction de régénération non coordonnée, et dire explicitement que
   contrats, code, HTML, Odoo, couche rédacteur 023 et breakpoints automatiques ne
   sont pas couverts.

## Complexity Tracking

| Violation / tension | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| État temporaire figma-ahead par rapport au principe III | L'owner isole volontairement l'authoring visuel avant la campagne responsive transverse; la dérive est nommée, bornée, non propagée, et sa posture parité est décidée à H4 sur rapport réel | Promouvoir contrats/tokens maintenant généraliserait les choix d'un composant et violerait le scope Figma-only; laisser le drift anonyme serait moins honnête |
| Quatre gates humains autour d'un runner qui n'en encode qu'un | H1/H2/H3/H4 séparent audit, design (avec deux décisions owner obligatoires), autorisation source et acceptation finale | Une seule décision owner ne prouve ni la validation des valeurs avant mutation ni l'acceptation des preuves après |
| Deux masters mutables dans un workflow `single-component` | La carte n'a qu'un composeur et fait partie du périmètre demandé; deux campagnes séquentielles sous un cycle global respectent le mode existant | Une campagne multi-cibles élargirait la sémantique du runner au-delà du besoin; exclure la carte contredirait la demande owner |
| Extension générique du runner dans une feature au résultat Figma-only | La livraison exige topologie de set existant, sélection multi-axes, 7 usages et propagation attribuée, introuvables dans la capacité 028 | Une feature outillage séparée alourdirait le flux; des reçus qui masqueraient créations ou propagation seraient faux |
