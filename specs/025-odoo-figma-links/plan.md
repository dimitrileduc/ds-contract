# Implementation Plan: Liens Figma dans l’éditeur Odoo

**Branch**: `025-odoo-figma-links` | **Date**: 2026-08-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/025-odoo-figma-links/spec.md`

## Summary

Ajouter « Ouvrir dans Figma » à chaque panneau Piqueray racine ou enfant réellement sélectionnable. Un générateur TypeScript confronte le recensement des panneaux Odoo aux configs d’authoring, résout le contrat cible, lit exclusivement `anchors.figma.fileKey` et `nodeId` dans le contrat canonique, puis émet une table minimale consommée par une action générique du builder Odoo. La génération et la qualification refusent toute couverture absente, ambiguë ou invalide ; l’action ouvre une URL Figma précise dans un nouvel onglet isolé, sans mutation de l’éditeur.

## Technical Context

**Language/Version**: TypeScript 6 / Node.js ≥20 pour dérivation et contrôles ; JavaScript ES modules et XML/QWeb pour l’addon Odoo 19

**Primary Dependencies**: Odoo Website Builder 19 (`BaseOptionComponent`, `BuilderAction`, registre `website-plugins`), APIs navigateur `window.open`/`URL`, contrats JSON et configs d’authoring existants ; aucune nouvelle dépendance npm

**Storage**: Fichiers versionnés uniquement : contrats/configs canoniques en entrée, module JS généré pour l’éditeur et reçus de qualification ; aucune base nouvelle

**Testing**: contrôles TypeScript de dérivation/couverture, checks Odoo existants, evals déterministes, scénarios Playwright sur instance Odoo réelle

**Target Platform**: addon `piqueray_ds` sur Odoo 19.0-20260803, navigateurs desktop supportés par l’éditeur Website

**Project Type**: intégration CMS web + pipeline de génération/qualification déterministe

**Performance Goals**: résolution locale en temps constant ; ouverture dans le geste utilisateur ; zéro requête avant ouverture ; aucune incidence sur le rendu public

**Constraints**: contrat comme source unique ; URL avec nœud précis ; `noopener,noreferrer` ; aucune mutation de contenu/sélection/save state ; aucun contrôle tiers ; indisponibilité explicite sans repli fichier

**Scale/Scope**: 13 panneaux racines actuels (12 sections, dont HeroVideo, + footer shell) et 6 types enfants visibles ; un contrôle partagé et une table dérivée exhaustive

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Determinism** — projection TypeScript depuis des sources versionnées, sans IA ni réseau.
- [x] **II. Claims Rule** — couverture et ouverture auront des checks/scénarios nommés avant toute claim.
- [x] **III. Contract SSoT** — `anchors.figma` reste l’unique source des identités Figma.
- [x] **IV. No Hand-Edit of Generated Output** — module marqué `DO NOT EDIT`, régénéré et contrôlé.
- [x] **V. Honesty** — référence invalide = indisponibilité explicite et gate rouge, jamais repli générique.
- [x] **VI. Additive Evolution** — aucune sémantique existante repurposée.
- [x] **VII. Engine Integrity** — aucun changement `core/`; dérivation Odoo Node-only.
- [x] **VIII. Source Cleanliness** — N/A : aucune écriture/extraction Figma.
- [x] **IX. Docs-First** — `integrations/odoo/README.md` et handoff architecture/gates ont fixé les frontières.
- [x] **X. Before-Capture** — N/A : aucune mutation du canevas.
- [x] **XI. Multi-Writer Bridge** — N/A : aucun writer Figma.

**Post-design re-check**: tous les gates restent verts. Les contrats restent canoniques, le mapping est généré, l’action ne modifie aucune surface et les erreurs restent nommées.

## Project Structure

### Documentation (this feature)

```text
specs/025-odoo-figma-links/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── panel-figma-map.schema.json
│   └── editor-action.md
└── checklists/requirements.md
```

### Source Code (repository root)

```text
scripts/odoo/
├── build-figma-links.ts             # nouveau : dérivation + validation exhaustive
└── lib/repo-data.ts                 # étendu : chemins/census nécessaires
integrations/odoo/
├── config/figma-panels.json         # nouveau : panneau → chemin contractuel
├── addons/piqueray_ds/
│   ├── __manifest__.py
│   └── static/src/
│       ├── js/authoring.js
│       ├── js/generated/figma_links.js
│       └── xml/authoring.xml
└── qa/
    ├── fixtures/figma-panels.expected.json
    └── scenarios/figma-links.mts
package.json
evals/run.ts
```

**Structure Decision**: conserver les frontières Odoo existantes. `figma-panels.json` est une décision cible-spécifique minimale (quel panneau représente quel chemin), les contrats restent canoniques, `figma_links.js` est généré, et l’action/panneau est une adaptation manuelle recensée.

## Design Phases

### Phase A — Contrat de couverture

1. Déclarer chaque panneau visible avec identifiant, sélecteur root-scopé, template, type `root|child|shell` et `componentPath` canonique.
2. Recenser les `BaseOptionComponent` Piqueray enregistrés et comparer exactement ce census au manifeste ; exclure seulement `RootPolicyOption`, infrastructure partagée.
3. Résoudre le dernier segment vers le contrat et valider version, `fileKey`, `nodeId`, unicité du panneau et destination non ambiguë.

### Phase B — Projection et action éditeur

1. Émettre byte-stable `figma_links.js`, trié, contenant sélecteur, contrat, disponibilité et identité Figma — jamais des URLs saisies dans les panneaux.
2. Ajouter une option générique ciblant l’union des sélecteurs. L’action trouve l’entrée de la sélection, construit l’URL via `URL`, puis appelle `window.open(url, "_blank", "noopener,noreferrer")` synchroniquement.
3. Si indisponible, afficher « Référence Figma indisponible », désactiver l’action et exposer la cause ; ne jamais ouvrir la racine du fichier.

### Phase C — Qualification

1. Ajouter les refus déterministes : panneau oublié/doublé, contrat/version absent, ancre invalide, destination générique, contamination tierce.
2. Sur Odoo réel, exercer chaque type, intercepter la nouvelle page, confirmer fichier+nœud, onglet distinct et absence de `window.opener`.
3. Comparer avant/après sélection, HTML et état de sauvegarde. Tester popup bloquée, Figma inaccessible et panneaux natifs.
4. Exécuter tous les gates du quickstart sans compter un scénario sauté comme réussi.

## Complexity Tracking

No constitution violations to justify.
