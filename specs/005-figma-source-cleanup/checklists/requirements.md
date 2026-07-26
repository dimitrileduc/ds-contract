# Specification Quality Checklist: Spec A — Source Figma propre (naming, styles, descriptions, géométrie) avant extraction

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

**Statut : tous les items passent.** 9 user stories · 41 exigences fonctionnelles actives
(+1 retirée, conservée en place) · 17 critères de succès · 0 marqueur [NEEDS CLARIFICATION].

### Itération de validation 1 — 2026-07-25

Deux items en échec sur « testable et non ambigu », corrigés :

- **FR-016** disait « la valeur mesurée sur le contenu réel » sans la nommer → réécrit avec les
  valeurs chiffrées (88 → 89 px ; 1552 → 1550 px). Une exigence chiffrée n'est pas un détail
  d'implémentation : sans le nombre, le critère n'est pas vérifiable.
- **FR-019** disait « alignée sur la grille du site » → réécrit avec 1550 px et l'écart de départ.

**Note sur les identifiants de nœuds** (`2068:1972`, `2061:1588`, `274:2389`, `210:330`) présents
dans les justifications de priorité et les clarifications : ce sont des identifiants
d'enregistrements de la source de design (le QUOI), pas des détails techniques du COMMENT. Ils ne
figurent dans aucune exigence fonctionnelle, qui restent toutes indépendantes de l'outillage.
Item « no implementation details » considéré comme passé.

### Itération de validation 2 — 2026-07-25 (après réponses owner)

Les 3 marqueurs [NEEDS CLARIFICATION] sont levés et consignés dans la section `## Clarifications`
de la spec :

| # | Exigence(s) | Résolution |
|---|---|---|
| Q1 | FR-015, **FR-015a** (nouvelle) | Tab : le variant `Défaut` perd son soulignement — **unique fix design de l'itération**, assumé, isolé dans son propre cycle, validé sur crop. Répercuté sur US2 (test d'indépendance + scénario 3) et sur la section « Hors périmètre ». |
| Q2 | FR-024, **FR-025** (réécrite) | Périmètre du hero vidéo : **question close par l'audit `hero-et-categories.md` de la 003**, pas par une décision nouvelle. La fusion avec le bloc catégories y était déjà mesurée et écartée (cadre d'assemblage sans identité propre ; sur Accueil le premier enfant n'est pas un Hero). Le master couvre exactement le cadre existant. L'audit est ajouté aux Dépendances. |
| Q3 | **FR-034** (nouvelle), FR-025 réaffectée | Master de mise en page de section : **hors périmètre**. On corrige l'existant, aucune nouvelle structure de gabarit. L'ancienne FR-025 (question ouverte) est supprimée ; les 4 regroupements mesurés passent en « Hors périmètre » comme mesures, pas comme livrable. |

**Point de méthode relevé** : Q2 n'aurait pas dû être posée. La réponse existait dans
`specs/003-externalize-figma-components/audits/hero-et-categories.md`, lue seulement après coup —
exactement le gaspillage que la règle docs-first du projet existe pour éviter. Les audits de la
003 sont à consulter **avant** toute question de périmètre en `/speckit.plan`.

### Itération de validation 3 — 2026-07-25 (2ᵉ passe de clarification)

5 questions posées, 5 répondues, **plus 6 décisions owner données spontanément**. Le périmètre
change de forme : 3 zones déclarées hors périmètre y entrent, 1 en sort.

| # | Exigence(s) | Résolution |
|---|---|---|
| Q1 | **FR-039** (nouvelle), FR-033, SC-013 | Master sous contrat : **renommé côté source**, contrat laissé en l'état, divergence nommée au rapport et réparée à l'itération d'extraction (majeur). SC-013 tient et se renforce. |
| Q2 | **FR-035/036** (nouvelles), **US9** (nouvelle), SC-014 | Page fourre-tout **vidée puis supprimée**, 18 icônes réunies, planches → page tokens. Vérifié avant décision : aucun script du dépôt ne cible une page par son nom, ancre = clé de set + node id. |
| Q3 | **FR-037** (nouvelle) | En-tête de navigation éclaté en **2 masters** (brique répétée + organism), pas 3 : pas de master à consommateur unique. |
| Q4 | **FR-038** (nouvelle) | Glyphe hors registre **non touché** ; son master est **déplacé, pas supprimé**, marqué hors registre, décision léguée. |
| Q5 | FR-027 réécrite, **FR-040** (nouvelle), SC-015/016 | Lien d'état antérieur = **lien d'élément + identifiant de version enregistrée avant la passe**. Archive vectorielle inchangée (destructifs seulement). |

**Décisions owner hors questionnaire** : carte d'avis **sortie** du périmètre (FR-023 retirée,
US8 réduite au hero vidéo) ; format du rapport par geste (FR-027) ; rangement d'`Assets`
doublons compris (US9) ; version enregistrée à chaque grosse passe (FR-040) ; en-tête déplacé
et splitté (FR-037) ; principe « la source d'abord, le code resynchronise ensuite » (FR-033).

**Deux conséquences dérivées, à contredire si elles dépassent l'intention** : (1) **SC-009**
passe de 8 à **12 cycles** — le budget d'origine ne peut pas absorber le périmètre ajouté, et
le rattraper en fusionnant des gestes à effet visuel serait la pire réponse possible ;
(2) **SC-003 / FR-010** passent de 14 à **15 descriptions** — le master sous contrat était
excepté parce que sa documentation devait partir avec son contrat ; puisqu'on renomme son axe
ici, le laisser vide n'a plus de raison d'être.

**Numérotation** : FR-023 est conservée en place, marquée retirée, pour ne pas casser les
renvois du tableau ci-dessus (itération 2). Aucun trou de numérotation ailleurs.

### Prêt pour la suite

Aucune question ouverte ne bloque `/speckit.plan`. Les zones qui appelleront un arbitrage
pendant le plan (et non pendant la spec) sont déjà nommées comme hypothèses réversibles :
Product-card (propriété booléenne vs retrait), member-picture (axe d'état nommé vs variant
retiré), le comptage règle-3× des valeurs chromatiques hors palette, et la découpe fine de
l'en-tête de navigation (à tomber d'un relevé de structure, pas d'une décision a priori).
