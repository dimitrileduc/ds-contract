# Specification Quality Checklist: Outillage de la vague responsive

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-27 (validation exécutée après relecture de la spec, pas à la minute de sa création — leçon 029 : une checklist cochée à l'aveugle n'attrape rien)
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs) — *déviation assumée et bornée* : la spec nomme des artefacts du dépôt (`campaign.json`, mock du runner, evals, `pickerConsequence`) parce qu'ils SONT le domaine de cette feature d'outillage interne — le langage ubiquitaire des gates et de la rétro, pas une fuite de stack. Aucun langage, framework ou commande n'est prescrit.
- [x] Focused on user value and business needs — chaque story part du coût mesuré par la rétro (heures de manifeste main, 33 min du verrou 744px, le malentendu E2) et de la valeur : la vague à ~25 min/section.
- [x] Written for non-technical stakeholders — les trois stories et les critères se lisent sans connaître le code ; le lecteur owner y retrouve les épisodes de 029 par leur nom.
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain — zéro marqueur : toutes les décisions viennent de la rétro committée (`RETRO-PROCESS.md`, P1–P7) et les défauts retenus sont documentés en Assumptions.
- [x] Requirements are testable and unambiguous — chaque FR nomme son refus ou son verdict observable ; contre-vérifié FR par FR (le piège 029 était FR-014/015 : une doctrine sans mot owner — ici chaque FR trace vers un prérequis P1–P7 de la rétro validée par l'owner).
- [x] Success criteria are measurable — minutes, %, zéro-diff, rejeu d'un scénario 029 nommé.
- [x] Success criteria are technology-agnostic — mesures en temps, volume et verdicts ; « mock » et « evals » y désignent les instruments de preuve existants du dépôt, pas une technologie imposée.
- [x] All acceptance scenarios are defined — 7 scénarios Given/When/Then couvrant les 3 stories.
- [x] Edge cases are identified — 5, dont les deux qui ont réellement mordu en 029 (interruption mi-chaîne, dossier de décisions partagé).
- [x] Scope is clearly bounded — borne dure : AUCUNE mutation du canvas vif ; le pilote live appartient à la spec de vague (031). Les décisions D1–D9 sont explicitement hors périmètre.
- [x] Dependencies and assumptions identified — section Assumptions : entrées de lecture existantes, runner mono-composant, numérotation 030/031.

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria — FR-001→FR-013 adossés aux scénarios et aux SC ; FR-010 impose l'ordre constitutionnel fixture→eval→capacité.
- [x] User scenarios cover primary flows — préparer (US1), appliquer (US2), décider (US3) : les trois moments de la vague.
- [x] Feature meets measurable outcomes defined in Success Criteria — SC-001→SC-007, chacun vérifiable par rejeu ou diff.
- [x] No implementation details leak into specification — voir la déviation assumée du premier item ; aucune autre.

## Notes

- Validation menée en une passe après écriture complète ; un seul point limite (vocabulaire d'artefacts du dépôt), assumé comme langage du domaine et non comme fuite d'implémentation.
- La question « déroulé ou résultat ? » qui a coûté la journée de 029 ne se pose pas ici : la spec décrit des RÉSULTATS d'outillage (verdicts, refus nommés, minutes) et sa source est une rétro déjà validée.
- Prêt pour `/speckit-plan`. `/speckit-clarify` sans objet : zéro marqueur, décisions sourcées.
