# Specification Quality Checklist: Géométrie gouvernée

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-04
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain — les 3 marqueurs délibérés ont été tranchés en session de clarification du 2026-08-04 (voir Notes)
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

- **3 marqueurs [NEEDS CLARIFICATION], volontairement conservés jusqu'à `/speckit.clarify` — tous tranchés depuis** (spec.md § Clarifications, session 2026-08-04) : le brief d'entrée (section « Questions ouvertes → /speckit.clarify ») route explicitement ces décisions vers la clarification — les résoudre ici par défaut raisonnable effacerait des questions que l'owner a posées à dessein. FR-006 (modèle de comptage publié : constats vs travaux, relation 1:N), FR-003 (frontière des littéraux nommés et siège de la liste), FR-002 (granularité du vocabulaire créé). La 4e question du brief (ordonnancement de DW-014-001) est hors périmètre de 015 et consignée en Out of Scope, pas en marqueur.
- Les choix d'implémentation du brief (section « À parquer pour /speckit.plan ») sont conservés verbatim dans [notes-pour-plan.md](../notes-pour-plan.md), hors spec — avec la mise à jour ROADMAP du 2026-08-04 (box-sizing et DW-001 tranchés, DW-002 sorti vers 016).
- Les mentions « axe surveillé », « référence gouvernée », « porte de mesure », « registre avant/après » sont le vocabulaire produit du dépôt (les objets métier du système de contrats), pas des détails d'implémentation ; « code de sortie 0 » (SC-005) est l'idiome observable des gates du dépôt, comme en 014.
- Les comptes cités (~260 / 28 / 220 ; « géométrie du contrat » = 7) sont datés et déclarés relevés d'ouverture ; la spec impose partout que le compte vif fasse foi (FR-013, SC-001, SC-005) — conforme à la règle « jamais un compte figé en prose ».
- FR-012 (conversion pure = rendu inchangé) donne le critère qui sépare une conversion d'une réparation — c'est ce qui rend SC-006 (« hors périmètre attribué, zéro variation ») testable.
