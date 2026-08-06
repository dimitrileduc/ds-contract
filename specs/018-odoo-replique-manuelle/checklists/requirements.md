# Specification Quality Checklist: Répliquer à la main une chaîne gouvernée en blocs Odoo 19

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-06
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain — le marqueur unique a été tranché en session du 2026-08-06 (spec.md § Clarifications)
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

- **Le marqueur unique était structurant, et il est tranché** : pas de seuil préétabli, l'owner décide au vu du rapport. Les deux seuils envisagés auraient été des chiffres inventés avant de savoir ce qu'on mesure. Le contrepoids est écrit dans la spec elle-même (FR-018b) : le rapport doit nommer ce qu'il ne permet pas de conclure. Une décision sans seuil n'est honnête que si ses angles morts sont déclarés.
- **« Odoo 19 » n'est pas un détail d'implémentation** mais l'énoncé métier de la feature : la surface cible est ce qui est demandé. Les critères de succès restent formulés en résultats observables (installation sans erreur, réglages visibles, écart d'image, verdicts écrits), jamais en moyens. Même convention qu'en 013, 014 et 015.
- **Le vocabulaire mécanique d'Odoo est délibérément paraphrasé** — « mécanisme d'appel entre modèles », « un seul marqueur », « cadre CSS d'Odoo » — pour que la spec reste lisible sans connaître le produit. Les noms techniques réels appartiennent au `/plan`.
- **« Vocabulaire gouverné », « non-porté nommé », « levier », « reçu », « part mécanique »** sont le vocabulaire produit du dépôt, pas du jargon d'implémentation.
- **Aucun compte figé en prose** hormis « trois composants » et « trois niveaux », qui sont le périmètre lui-même, et « 8 sections » / « 31 autres contrats » / « ~1350 lignes », qui sont des faits mesurés le 2026-08-06 et datés comme tels.
- **La section « Ce que la session a établi » porte une réserve globale explicite** : tout y vient de la lecture du code d'Odoo 19, rien n'a été exécuté. SC-009 en fait une exigence, pas une note de bas de page.
- **Numérotation** : 018 attribué automatiquement. Le 017 (`surface-odoo-theme`) a été supprimé le 2026-08-06 après que son cadrage s'est révélé faux — deux atomes plats sans imbrication, dont un mesuré à 64 % d'écart. Cette spec le remplace avec un périmètre plus étroit et un livrable différent : une décision, pas une surface.
