# Specification Quality Checklist: Bloc « Catégories principales » gouverné

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-20
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

- **Vocabulaire de domaine ≠ fuite d'implémentation.** La spec nomme le *différentiel trois-voies*, la *parité visuelle*, les *portes du dépôt*, l'*éditeur Website Odoo*, les *contrats molécule/section* et le *canvas Figma*. Dans ce projet, ce sont les **objets métier** des trois parties prenantes (owner DS, éditeur Odoo, mainteneur), pas des détails de mise en œuvre — usage cohérent avec les specs antérieures (022). Les critères de succès décrivent le **quoi** (dérive détectée, rendu au pixel, sortie octet-identique, colonnage dans {2,3}), jamais le comment.
- **Zéro [NEEDS CLARIFICATION].** L'entrée owner était exceptionnellement complète (faits relevés live le 2026-08-20). Les rares choix non spécifiés sont tranchés par défaut raisonnable et **consignés dans Assumptions** (référence pixel = capture d'avant-mutation ; style non éditable côté rédacteur ; mécanisme de l'enum colonnes renvoyé à `/plan` sous docs-first ; ids de contrats = noms de travail).
- **Gates humains renforcés (4).** À la demande de l'owner (« mieux vaut plus que pas assez »), la spec pose **quatre** gates bloquants — **A** modèle cible Figma (avant mutation), **B** comparaison pixel (après mutation), **C** contrats (avant câblage & Odoo), **D** éditabilité (avant tout Odoo) — en tête des User Scenarios (tableau) et en **FR-001 → FR-005**, avec **SC-007** qui rend leur respect auditable. Ils s'exercent à l'exécution (plan puis implémentation), pas à la spec.
- Items marked incomplete require spec updates before `/speckit.clarify` or `/speckit.plan`. — aucun item incomplet.
