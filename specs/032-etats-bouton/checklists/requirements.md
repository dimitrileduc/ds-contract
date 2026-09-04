# Specification Quality Checklist: États d'interaction du Bouton gouverné

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-09-04
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

### Passe de validation 1 — deux corrections appliquées

1. **FR-005 formulait un mécanisme, pas un résultat.** La première rédaction imposait une bague à deux tons. C'est un *comment*, et il appartient au plan. Réécrit en résultat mesurable : « au moins 3 pour 1 avec son environnement, sur fond clair comme sur fond sombre ». Le choix du mécanisme est renvoyé au plan, où le piège de l'ombre portée est déjà nommé comme interdit.

2. **Le survol du style Orange créait un état non conforme sans garde-fou.** Le libellé blanc sur orange assombri donne 2,98 pour 1, sous le minimum de 4,5 — mais au-dessus des 2,42 du repos, que l'owner a explicitement décidé de ne pas corriger. **FR-019** a été ajouté pour borner le cas par le seul critère cohérent avec cette décision : un état ne doit jamais être **moins** lisible que le repos. La vague n'a pas le droit d'aggraver ce qu'elle a défense de réparer. Le défaut de fond reste consigné en FR-012, et le garde-fou est vérifiable par le scénario 5 de US1.

### Décision prise le 2026-09-04 — style Link

FR-001 exige un changement perceptible sur les 7 styles. Le style Link n'a ni fond ni bordure : il ne lui restait que la couleur du texte ou le soulignement. Le canal des faits littéraux par état n'accepte pas de variation par style — soit les 7 styles se soulignent, soit aucun. **L'owner a tranché : changement de couleur du libellé.** FR-013 porte la décision, un scénario d'acceptation a été ajouté à US1, et la limite sur le soulignement reste écrite.

### Limites acceptées et écrites, non traitées par cette vague

- Contraste du style Orange au repos (FR-012) — décision owner du 2026-09-04, réaffirmée.
- Absence de réaction de prototype dans le fichier de conception (FR-014).
- Le comportement du survol collant sur écran tactile est listé en cas limite sans exigence associée : à décider au plan, avec un défaut raisonnable si l'owner ne tranche pas.
