# Specification Quality Checklist: Vague responsive des sections

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-27
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

Trois corrections appliquées pendant la validation, chacune sur un item qui échouait
d'abord — la case n'a pas été cochée par principe.

1. **« No implementation details »** — la première rédaction nommait les commandes de
   l'outillage (génération de manifeste, mode de capture allégé, script d'enchaînement),
   les chemins de fichiers et les identifiants de refus. Retirés du corps de la spec et
   remplacés par leur conséquence observable. L'outillage est désormais nommé une seule
   fois, dans les Assumptions, comme dépendance — pas comme méthode.

2. **« Success criteria are technology-agnostic »** — SC-005 disait d'abord « le reçu du
   second passage est vert », SC-008 parlait de « re-pin zéro ». Reformulés en résultats
   observables : « second passage entièrement sans effet : zéro nœud créé, zéro nœud
   modifié », « aucune surface générée existante ne change ».

3. **« Scope is clearly bounded »** — le périmètre listait douze sections sans dire ce qui
   en sortait. FR-002 nomme désormais explicitement `header` et `footer` comme exclus, et
   FR-015 fixe la règle d'éjection d'une section en cours de vague.

**Zéro marqueur de clarification** : les trois ambiguïtés qui auraient normalement dû en
porter un ont été tranchées par l'owner en conversation avant rédaction — l'axe visible
dans le sélecteur (D1), le nommage de l'étage mobile (D2), et le modèle de travail
(l'agent propose les douze, l'owner corrige ce qui cloche, aucune règle mobile unique).
C'est ce qui distingue cette spec de celle de 029, où la doctrine « adaptation interne
d'abord » a été inscrite comme exigence **avant** toute recherche et sans trace d'un mot
owner la demandant — mécanisme d'origine de l'écart E2.

**Limite connue de cette checklist** : en 029, ces seize cases ont été cochées à la minute
même où la spec a été écrite, et n'ont rien attrapé — surtout pas l'ambiguïté
« même déroulé = même processus ou même résultat visible ? », qui était exactement leur
travail. Les trois corrections ci-dessus sont donc consignées avec ce qu'elles ont changé,
pour qu'un lecteur puisse vérifier que la passe a réellement eu lieu.
