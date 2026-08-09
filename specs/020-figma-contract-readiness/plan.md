# Implementation Plan: Readiness Figma–contrat des sections

**Branch**: `020-figma-contract-readiness` | **Date**: 2026-08-09 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/020-figma-contract-readiness/spec.md`

## Summary

Auditer exactement les onze sections non qualifiées par 019 en reconstruisant, pour chacune, une
chronologie de preuves et au plus trois références candidates. Un gate owner choisit l'intention
avant toute réparation. La comparaison Figma–contrat–rendu, l'attribution de cause et le graphe
d'impact conduisent ensuite à un verdict et une destination uniques. L'implémentation étend
`extract/figma/organism-audit/` par une campagne de readiness et conserve ses données gouvernées sous
`specs/020-figma-contract-readiness/`; les mutations locales restent optionnelles, après capture et
décision, tandis que tout changement partagé est routé vers une sous-spec.

## Technical Context

**Language/Version**: TypeScript 6, Node.js ≥ 20; JSON/Markdown pour registres et reçus  
**Primary Dependencies**: Zod 4, tsx, Playwright Core, pixelmatch/pngjs, API REST Figma et pont Figma existants  
**Storage**: fichiers JSON versionnés dans Git, PNG de preuves et rapports Markdown spec-locaux  
**Testing**: cas adverses dans `evals/run.ts`, selftests des comparateurs, campagne organism-audit, parity et sweep constitutionnel  
**Target Platform**: CLI Node headless; lectures REST Figma; session live Figma seulement pour captures, gates visuels et réparations autorisées  
**Project Type**: outillage CLI d'audit et workflow humain gouverné autour d'une bibliothèque/générateur existant  
**Performance Goals**: dossier owner lisible en moins de 10 minutes; génération déterministe; au plus 3 candidats par section; 11/11 sections comptabilisées  
**Constraints**: Figma actuel non autoritaire; aucune mutation avant verdict et capture exhaustive; identité des instances par position/node id, jamais par nom; preuves absentes nommées; changement partagé interdit dans 020  
**Scale/Scope**: 11 sections (`Coordonnees`, `Devis`, `Equipe`, `FAQ`, `Formulaire`, `Header`, `Hero`, `Footer`, `Reassurances`, `SAV`, `TexteSEO`), leurs dépendances et consommateurs; `Presentation` et `GoogleReviews` seulement comme périmètre 019 à protéger

## Constitution Check

*GATE initial et recontrôlé après le design de Phase 1.*

- [x] **I. Determinism** — assemblage, classement et validation sont purs; décisions humaines sont des entrées versionnées, jamais un modèle dans le chemin.
- [x] **II. Claims Rule** — les refus (4e candidat, décision manquante, consommateur non revalidé, mutation prématurée) obtiennent des fixtures/evals avant tout claim; la documentation de capacité dépend explicitement de l’enregistrement et de l’exécution de ces evals.
- [x] **III. Contract is the SSoT** — les contrats courants restent la surface contractuelle canonique; l'historique Figma n'est qu'une preuve d'intention. Toute réparation contractuelle sort de 020 ou suit une sous-spec.
- [x] **IV. No hand-edited output** — aucun `src/components/`, `figma-sync/*.js`, catalogue ou schéma généré n'est édité. Les dossiers et registres 020 sont des sources/reçus, pas des sorties produit.
- [x] **V. Honesty** — preuve absente/contradictoire, heuristique, image irrécupérable et gate non tenu ont des statuts explicites et ne comptent jamais comme succès.
- [x] **VI. Additive evolution** — le design n'exige aucune évolution du schéma composant. Les formats 020 commencent en `1.0.0`; une évolution ultérieure reste additive et versionnée.
- [x] **VII. Engine integrity** — `core/` n'est pas concerné. Toute correction live locale qui révélerait une classe de défaut moteur doit être routée et accompagnée d'un check mock.
- [x] **VIII. Source cleanliness** — l'audit master + usages par position précède extraction et contracting; une source sale reçoit une cause et une destination, elle n'est pas blanchie comme référence.
- [x] **IX. Docs-first** — `docs/handoff/`, `docs/FIGMA-CAPABILITY-MATRIX.md`, `docs/STYLE-FIDELITY.md` et les reçus 013/016/017/019 ont été consultés. Le MCP auggie n'est pas disponible dans cette session; lecture directe du worktree consignée dans [research.md](research.md).
- [x] **X. Before-capture** — tout ensemble de cibles affectées est capturé, vérifié non vide et correctement dimensionné avant la première mutation; si aucune réparation locale n'est approuvée, N/A à l'exécution.
- [x] **XI. Multi-writer bridge** — une éventuelle écriture parallèle est partitionnée par masters/pages/nodes disjoints et entourée d'un seul cycle pixel global; sinon N/A.

**Gate post-design**: PASS. Aucun `NEEDS CLARIFICATION` ne subsiste et aucune violation
constitutionnelle n'est requise. Le sweep complet reste la porte de clôture de l'implémentation :

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

## Project Structure

### Documentation (this feature)

```text
specs/020-figma-contract-readiness/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── readiness-dossier.schema.json
│   ├── owner-decision.schema.json
│   └── consolidated-readiness.schema.json
├── registry/                       # campagne, décisions et bilan créés en implémentation
├── dossiers/<section>/             # chronologie, candidats, comparaisons et preuves
└── proofs/                         # reçus immuables des runs et gates
```

### Source Code (repository root)

```text
extract/figma/organism-audit/        # moteur existant étendu pour campagne readiness
├── campaign.ts
├── reference.ts
├── dependencies.ts
├── report.ts
└── readiness/                      # chronologie, candidats, gates, consolidation

extract/figma/{rest,state-photo,visual-parity,page-parity,photo-parity}/
                                      # instruments spécialisés réutilisés sans duplication
evals/fixtures/figma-readiness/       # cas adverses hermétiques
evals/run.ts                          # enregistrement des nouveaux checks
contracts/*.contract.json             # entrées canoniques, lecture seule par défaut en 020
integrations/odoo/config/inputs.lock.json
                                      # frontière 019 surveillée pour décision de repin
```

**Structure Decision**: l'orchestration générique rejoint `organism-audit/readiness`; les faits et
décisions propres aux onze sections restent sous la spec. Les instruments spécialisés existants
restent propriétaires de leurs captures/diffs. Cette séparation évite de transformer des preuves
de campagne en nouvelle source de vérité produit.

## Design de la solution

### 0. Gate de propreté de la source

Avant toute normalisation ou extraction de preuve, auditer chaque master et tous ses usages par
position/node id : structure, contraintes, propriétés, bindings de variables, tailles et descriptions.
Le gate produit un reçu complet. Une source sale n’est ni réparée implicitement ni extraite comme
référence : elle reçoit une cause et une destination de réparation; tout usage non lisible est nommé.

### 1. Recensement et gel des entrées

Créer une campagne qui refuse tout ensemble différent des onze identifiants attendus. Pour chaque
section, épingler contrat (chemin/version/hash), nœuds Figma actuels, rendus et preuves historiques
connues. Avant toute mutation éventuelle, produire un manifest des cibles et vérifier chaque
capture. Les pins 019 de `Presentation` et `GoogleReviews` sont chargés comme sentinelles d'impact.

### 2. Chronologie et candidats

Normaliser les sources hétérogènes en `HistoricalState` sans prétendre qu'une capture prouve la
structure ni qu'un dump prouve les pixels. Le classement est déterministe : complétude, proximité
du dernier état cohérent, contradictions, puis date/id stable. Il refuse un quatrième candidat et
peut conclure `blocked-history`. Une recommandation n'est jamais une validation.

### 3. Gate owner immuable

Générer un paquet court : rupture probable, état actuel, trois candidats maximum, recommandation,
preuves et manques. Une `OwnerDecision` signée/datée autorise seulement le périmètre qu'elle nomme.
Sans décision, le workflow refuse réparation et verdict `ready`. Après réparation locale, une
seconde décision visuelle accepte ou refuse le résultat sans écraser la première. Les onze premiers
gates sont tenus comme un checkpoint humain explicite avant le diagnostic; leur temps actif et tout
temps d’exploration exclu sont reçus séparément pour vérifier SC-003.

### 4. Comparaison des surfaces et attribution

Comparer séparément référence↔Figma, référence↔contrat et référence↔rendu. La classification suit
FR-025 : tout changement d’intention, structure, contenu, comportement, dépendance, disponibilité
d’image ou verdict possible est significatif; un finding informationnel doit justifier son absence
d’impact. Chaque écart significatif reçoit exactement une cause de FR-012 et des preuves. Pour une dépendance composée, tester la
dépendance isolée et ses autres consommateurs afin de distinguer défaut partagé et composition
locale. Le graphe porte tous les consommateurs connus, leur statut de revalidation et les pins 019
affectés.

### 5. Réparation bornée et routage

020 ne peut exécuter qu'une correction locale, réversible, sans modèle partagé, couverte par la
décision et les captures. Toute évolution de schéma/moteur/dépendance partagée, restauration massive,
image transversale ou chaîne de gates produit un `RepairAssignment` vers une sous-spec nommée. Les
Header/Footer vont au chantier shell. Pour les autres sections, `ready` va en vague A;
`ready-with-exception`, `accepted-defect` et `out-of-contract` vont en vague B; les verdicts de
réparation et `blocked-history` vont vers une sous-spec nommée. Chaque dossier se clôt par un verdict
et une destination uniques, validés par le schéma consolidé.

### 6. Consolidation et croisements

Le rapport final échoue si une section manque, si une preuve indisponible est agrégée au vert, si
un consommateur reste sans revalidation, ou si un pin 019 touché n'a pas de décision de repin. Il
présente les onze lignes, dépendances, décisions, verdicts, destinations et sous-specs. Les sorties
sont stables et comparées à l'octet sur deux assemblages.
La consolidation calcule aussi le temps actif de chaque premier gate et le taux d’acceptation au
premier passage des réparations locales. Elle conserve numérateur et dénominateur; sans réparation
présentée au gate final, SC-008 vaut `not-applicable` plutôt qu’un succès implicite.

## Complexity Tracking

Aucune violation à justifier. La lecture directe des docs remplace uniquement le moyen d'accès
auggie's indisponible; elle ne modifie aucune décision documentaire.
