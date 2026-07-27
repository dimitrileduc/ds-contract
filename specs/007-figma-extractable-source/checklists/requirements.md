# Specification Quality Checklist: Spec 1 — Canvas : rendre la source Figma extractible

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-07-26
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

**Statut : tous les items passent.** 33 exigences fonctionnelles, 13 critères de succès,
0 marqueur `[NEEDS CLARIFICATION]`.

### Itération 1 — 2026-07-26

3 marqueurs posés (plafond respecté), chacun sur un fait que le document source déclarait
explicitement « à décider, pas à supposer ».

### Itération 2 — 2026-07-26, après décisions owner

Les 3 sont résolus et gravés dans la section `## Clarifications` **et** dans les exigences
correspondantes :

| Question | Décision | Exigences porteuses |
|---|---|---|
| Politique d'accents | Nom de calque sans accent ; accent porté par la **description** du composant | FR-006, FR-006a, FR-006b |
| Tokens space/radius | **Rouverts**, limités aux canaux qui bloquent, **valeur exacte** + backlog d'harmonisation chiffré à la clôture | FR-012, FR-013, FR-013a |
| Ligne de base pixel | Les 4 résidus de la 005 **acquittés en l'état**, mais relevés et suivis | FR-024, FR-024a, SC-008a |

**Vérification qui a changé la réponse à Q1.** L'option « nom accentué + nom technique
déclaré ailleurs » a été écartée sur constat, pas sur préférence : le dump ne capture pas les
descriptions (`ROUNDTRIP.md` les liste comme métadonnées ignorées), l'extracteur n'offre aucun
mécanisme de déclaration d'id depuis le canvas, et une propriété de composant Figma n'a qu'un
seul champ nom. Elle aurait exigé d'étendre dump + extracteur — du travail dépôt, interdit par
FR-025 — et serait restée impossible pour les 10 props.

**Deux réserves assumées sur des items cochés :**

- *« No implementation details »* — la spec nomme des identifiants de nœuds Figma (`2090:2386`,
  `2121:5168`), des canaux (`itemSpacing`, `lineHeight`) et des classes de notes d'extraction.
  Ce ne sont pas des choix d'implémentation : ce sont **les objets métier de cette itération** et
  ses **unités de mesure**. Sans eux, aucune exigence n'est vérifiable. Même traitement qu'en
  spec 005, acceptée sur cette base.
- *« Success criteria technology-agnostic »* — les SC parlent de compteurs de notes et de verdicts
  pixel N/9. C'est la seule formulation mesurable pour un chantier dont le livrable *est* l'état
  d'un fichier de design. Aucun SC ne nomme d'outil, de commande ni de langage.

**Un fait d'honnêteté consigné dans la spec** : l'acquittement des 4 résidus a été donné sur la
foi du diagnostic écrit — **les images de crop de la spec 005 n'existent plus sur disque**. La
décision n'est pas une validation sur pièces, et la spec le dit.

**Prochaine étape** : `/speckit.plan`. `/speckit.clarify` n'est plus nécessaire.
