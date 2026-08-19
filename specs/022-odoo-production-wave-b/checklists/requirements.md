# Specification Quality Checklist: Vague contenu Odoo (wave B) — sections Coordonnées & Réassurances

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-19
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

- Zéro marqueur [NEEDS CLARIFICATION] : le brief owner tranche déjà périmètre, priorités et hors-périmètre ; les seules questions ouvertes (verdicts par élément, gestes de collection, fourniture des images consommateur, variantes exposées) sont **volontairement** déférées au gate humain « périmètre éditable » (FR-001–FR-003), qui est leur lieu de décision — pas des ambiguïtés de spec.
- Termes « Odoo / éditeur Website / instance propre / lock / digest » : vocabulaire du produit et de la gouvernance posé par le mandat lui-même (l'objet de la feature EST l'addon Odoo de production), pas des choix d'implémentation faits par la spec. Aucun nom de fichier, de langage, de mécanisme technique interne n'apparaît dans les exigences ; la citation du brief owner en Input conserve ses propres termes (QWeb, Docker) à titre de trace.
- Versions relevées au dépôt le 2026-08-19 : `ds.coordonnees` 2.2.0 (confirme le brief), `ds.reassurances` **1.2.0** (le brief ne la nommait pas) — consignées en Assumptions.
- Écart nommé avec l'ancien texte ROADMAP § 022 (« sections qui exigent une exception ») : le brief owner requalifie la vague 022 en vague « contenu » sans exception structurelle — c'est le brief, plus récent, qui fait foi ; l'hypothèse d'entrée correspondante est consignée en Assumptions avec sa conduite d'échec (nommer et remonter, jamais contourner).
