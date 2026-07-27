# Specification Quality Checklist: Bloc « Avis Google » — reconstruction native gouvernée

**Purpose**: Validate specification completeness and quality before proceeding to planning  
**Created**: 2026-07-25  
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

**16/16 verts.** Les 4 marqueurs [NEEDS CLARIFICATION] initialement posés ont tous été
tranchés par l'owner en session du 2026-07-25 et encodés dans `## Clarifications` :

| Question | Réponse | Encodé dans |
|---|---|---|
| Population de la preuve — seulement les pages porteuses ? | 2 populations : porteuses = sujets, + 1 **maquette témoin** à 0 pixel | US3, FR-013, SC-003, Key Entities |
| Périmètre — 1 occurrence ou 8 ? | **Toutes** (8 attendues, le relevé fait foi) | FR-001, SC-001 |
| Contenu affiché après remplacement ? | **Le contenu réel**, porté par les instances ; master générique | FR-010, FR-015, US2 §4, Assumptions, Out of Scope |
| Seuil pixel ? | **≤ 2 % par occurrence** + revue à l'œil obligatoire | FR-016, SC-004 |
| Séquencement vs itération 005 ? | **Séquentiel** : aucune écriture canevas avant sa clôture | FR-021/022/023, Dependencies |

**Deux effets de bord de la réponse « contenu réel »**, à ne pas perdre en `/speckit.plan` :

1. La passe de « mesure à contenu égalisé » envisagée un moment **n'a plus lieu d'être** :
   le contenu étant conservé, l'écart mesuré est de la fidélité pure et se compare
   directement au seuil.
2. Une **nouvelle limite d'honnêteté** entre dans le périmètre : les textes des avis sont
   retranscrits à l'œil depuis un aplat (aucun calque texte n'existe), donc fidèles au
   visible mais **non garantis au caractère près**. Même classe que la restauration depuis
   capture pixel déjà documentée en 003 (`proofs/honesty-report.md` §2). À porter au ledger
   de sortie, pas seulement en note de spec.

**Un écart brief ↔ source nommé, pas absorbé** : le brief parlait de « la page d'accueil »,
la source en porte 8 — tranché à 8 plutôt qu'absorbé silencieusement dans une hypothèse.

**Une décision du brief re-lue avec l'owner** : « pas une reproduction des 5 avis réels »
signifie « le master ne fige pas 5 cartes en dur », pas « les maquettes perdent leur
contenu ». La spec dit maintenant les deux explicitement.

Aucun item incomplet — la spec est prête pour `/speckit.plan`.
