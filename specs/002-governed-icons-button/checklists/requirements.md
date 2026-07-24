# Specification Quality Checklist: Icônes gouvernées + finalisation du Bouton (choix d'icône et mise à jour du master)

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-07-23
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

- **Validation : PASS (2 itérations).** Les 2 marqueurs [NEEDS CLARIFICATION] — trous délibérés du brief owner — ont été **tranchés en session le 2026-07-23** (Q&A encodés dans la section Clarifications de la spec) : forme de la gouvernance = **registre unique** (FR-006) ; slot natif = **exclusion confirmée** (Out of Scope). Zéro marqueur restant.
- **« Dashboard » et « Storybook »** : surfaces de restitution nommées par l'owner dans le brief (précédent 001) — livrables demandés, pas des choix techniques de la spec.
- **fileKey + nœud Figma en Dependencies** : précédent 001 (le fileKey y figurait déjà) — c'est l'identité de la source, pas un détail d'implémentation.
- **Parqué pour `/speckit.plan` (HOW, hors spec)** — consignes owner de session à reprendre au plan :
  - L'audit étape 0 des icônes peut s'appuyer sur la commande **LINT du MCP figma-console** (`figma_lint_design`) ; fichier « Piqueray (Copy) » `d9FYAUcqdcNtsuaMgLefvJ`, zone icônes nœud `6-111`.
  - **Réutiliser les scripts existants du dépôt** (extraction, mint, parity, photographie d'état/`--refresh`, points de restauration) — **zéro outillage custom, zéro contrat écrit à la main** ; si le Figma est modifié d'abord (étape 0), les bons patterns du dépôt s'appliquent tels quels : nettoyer → dumper → extraire → générer.
  - Analyser et **proposer les changements Figma AVANT** toute contractualisation (sinon on développe sur une mauvaise source) — porté par FR-001→FR-004 dans la spec ; le plan doit séquencer l'étape 0 en premier, avec arbitrage owner.
- **Comptes cités** (15 masters, 268 instances, 22 chevrons, 43 textes, 26 icônes, 9 pages, 97/97) : mesures de session du 2026-07-23, re-mesurées en étape 0 ; convention de comptes synchronisés (FR-019, Assumptions).
