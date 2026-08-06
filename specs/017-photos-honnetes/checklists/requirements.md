# Specification Quality Checklist: Photos honnêtes

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-06
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- **Zéro marqueur [NEEDS CLARIFICATION].** La seule question de périmètre — « le contrat doit-il porter l'image ? » — a été tranchée par l'owner pendant la rédaction, sur relevé et non sur inférence. La décision et son motif sont consignés au § Clarifications ; l'option écartée est nommée au § Out of Scope plutôt que supprimée.

- **La section « Pourquoi maintenant » porte des reçus** (citations de contrats, ligne du dossier de capacité, chiffres mesurés). C'est délibéré et conforme à l'usage du dépôt : une spec qui renverse une prémisse de feuille de route doit montrer ce qui l'a renversée. Ce ne sont pas des détails d'implémentation — aucune n'entre dans les exigences ni dans les critères de succès.

- **FR-014 et FR-015 sont des exigences de procédure** (contrôle adverse écrit avant la revendication ; vérification empêchée toujours dite). Elles rejouent des règles constitutionnelles et figurent dans les specs précédentes du dépôt sous la même forme — conservées volontairement.

- **Une dépendance externe est nommée et non résolue** : la restauration des 62 photos effondrées appartient à la spec précédente et attend le pont figma-console. FR-005 en fait une précondition bloquante plutôt qu'une hypothèse tacite — **précisée après clarification** : elle ne bloque que le travail sur le fichier client, pas le travail sans tête.

- **Séance de clarification du 2026-08-06 — cinq décisions prises** (§ Clarifications) : la remise à armes égales se fait par échantillon de mesure côté nous (FR-006a/b) ; l'identité photo se relève par empreinte à l'emplacement, ce qui **ferme** l'interversion au lieu de la reconduire (FR-002, FR-004) ; le sans-tête fait foi et le fichier client donne le reçu (FR-002a/b) ; une photo sans emplacement d'accueil **refuse la reconstruction avant toute mutation**, levable par acquittement écrit (FR-003a/b) ; l'avertissement designer tient en **une clause sur la ligne de légende**, la directive owner du 2026-07-19 restant en vigueur (FR-010, FR-010a).

- **Deux seuils restent à fixer au plan, pas à la spec** : ce que « déclarée non comparable » produit exactement au rapport (forme et comptage), et le texte exact de la clause de légende. Aucun n'est ambigu au niveau du QUOI — chacun est un choix de réalisation. *(Le troisième — la granularité du comptage — a été tranché : empreinte par emplacement.)*
