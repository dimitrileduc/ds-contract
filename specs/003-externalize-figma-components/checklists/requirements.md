# Specification Quality Checklist: Externalisation des maquettes Piqueray — ~34 blocs → composants gouvernés

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

- **Validation : tous les items passent** (itération 1).
- **Clarify exécuté (Session 2026-07-23)** : 4 questions résolues et intégrées (seuil zéro-pixel ; blocs inférés fermement in-scope ; cadence de validation owner hybride ; journal de décisions repo-versionné). 3 points d'organisation **différés à `/speckit.plan`** (une-spec-vs-par-niveau ; granularité des incréments ; réorg Figma) — voir « Décisions différées » dans la spec. Aucun marqueur `[NEEDS CLARIFICATION]` (chaque point avait un défaut raisonnable).
- **Détails de mécanisme volontairement absents** (parqués pour `/speckit.plan`) : instrument de capture/diff des pages, outillage Figma utilisé, découpage CRÉER/ADOPTER, format du relevé de personnalisations. La spec n'en garde que le **quoi** mesurable (preuve zéro-pixel, relevé, rollback).
- **Points-frontière assumés acceptables** : « pont desktop », « état serveur/REST », noms d'odeurs de tokens (`nav/state`, `orange-12/42`, `space`/`radius`) sont des **faits d'environnement / dépendances**, pas des choix d'implémentation — nommés en Dependencies, cohérent avec le style de `001-piqueray-button` (qui nomme `git log`, Storybook, dashboard).
- **Numérotation** : cette feature est **003** (et non 002) — 002 est déjà pris par `002-governed-icons-button` (checkout principal). Le script avait mal numéroté car cette branche est sortie dans un autre worktree (préfixe `+ ` dans `git branch -a`), corrigé manuellement.
