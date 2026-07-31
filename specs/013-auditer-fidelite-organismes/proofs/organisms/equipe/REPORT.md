# Dossier d'audit — Equipe (`ds.equipe`)

> Généré depuis `result.json` — le Markdown n'est jamais l'autorité du verdict.

## 1. Identité

| Champ | Valeur |
|---|---|
| Sujet | `equipe` (Equipe) |
| Vague | 3 |
| Contrat | `ds.equipe` v1.0.0 — `contracts/equipe.contract.json` |
| Node master Figma | `2115:3947` |
| Référence Figma | `d9FYAUcqdcNtsuaMgLefvJ` @ version `2381581871281042338` (lecture seule) |

## 2. Audits de propreté réutilisés (Step 0)

- `specs/003-externalize-figma-components/audits/equipe.md`
- `specs/010-extract-molecules-organisms/audit-reuse-map.md`

## 3. Dépendance

| Champ | Valeur |
|---|---|
| Dépendance | `ds.member-card` v1.2.0 |
| Reçu | `specs/011-fix-molecule-convergence/proofs/visual/result.json` (sha256 `f68a3606b82a`) |
| Verdict brut du reçu | `blocked` |
| Verdict mappé (013) | `blocked` |
| Probant (dérivé) | true |
| Porte ouverte | false |
| Motifs | `receipt-verdict-blocked`, `dependency-not-proved:ds.member-card`, `figma-file-version-moved:2381568261081914456->2381581871281042338` |

## 4. Couverture exacte

- attendus : 59
- observés : 0
- manquants : `equipe.composition.card-00`, `equipe.composition.card-01`, `equipe.composition.card-02`, `equipe.composition.card-03`, `equipe.composition.card-04`, `equipe.composition.card-05`, `equipe.composition.card-06`, `equipe.composition.card-07`, `equipe.composition.card-08`, `equipe.composition.card-09`, `equipe.composition.card-10`, `equipe.composition.card-11`, `equipe.composition.card-12`, `equipe.composition.card-13`, `equipe.composition.card-14`, `equipe.composition.card-15`, `equipe.composition.member-card`, `equipe.composition.member-card-geometry`, `equipe.composition.member-card-overrides`, `equipe.composition.member-picture`, `equipe.composition.member-picture-hover`, `equipe.composition.repeat`, `equipe.content.items-default-absent`, `equipe.content.member-count`, `equipe.content.placeholders`, `equipe.content.roster`, `equipe.property.items`, `equipe.property.items-binding-none`, `equipe.property.items-shape`, `equipe.semantic.aucun-section-header`, `equipe.semantic.aucune-semantique-de-liste`, `equipe.semantic.root-element`, `equipe.structure.clips-content`, `equipe.structure.grid`, `equipe.structure.grid-column-count`, `equipe.structure.grid-column-gap`, `equipe.structure.grid-direction`, `equipe.structure.grid-grow`, `equipe.structure.grid-item-order`, `equipe.structure.grid-layout-mode`, `equipe.structure.grid-no-wrap`, `equipe.structure.grid-row-count`, `equipe.structure.grid-row-gap`, `equipe.structure.grid-track-width`, `equipe.structure.root`, `equipe.structure.root-direction`, `equipe.structure.root-display`, `equipe.structure.root-gap`, `equipe.structure.root-height`, `equipe.structure.root-justify`, `equipe.structure.root-padding-left`, `equipe.structure.root-padding-right`, `equipe.structure.root-width`, `equipe.structure.single-child`, `equipe.visual.font-family`, `equipe.visual.fun-ia-plane`, `equipe.visual.member-photos`, `equipe.visual.root`, `equipe.visual.root-no-fill`
- inattendus : **aucun**

## 5. Faits

| Fait | Catégorie | Représentabilité | Jambe Figma | Jambe contrat | Jambe générée | Verdict | Source localisée | Motifs |
|---|---|---|---|---|---|---|---|---|
| `equipe.structure.root` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.root-display` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.root-direction` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.root-justify` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.root-padding-left` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.root-padding-right` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.root-gap` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.root-width` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.root-height` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.clips-content` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.single-child` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.grid` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.grid-layout-mode` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.grid-column-count` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.grid-row-count` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.grid-column-gap` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.grid-row-gap` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.grid-grow` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.grid-direction` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.grid-no-wrap` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.grid-track-width` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.structure.grid-item-order` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.property.items` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.property.items-binding-none` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.property.items-shape` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.content.member-count` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.content.items-default-absent` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.content.roster` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.content.placeholders` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.member-card` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.repeat` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.member-card-geometry` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.member-card-overrides` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.member-picture` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.member-picture-hover` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.card-00` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.card-01` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.card-02` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.card-03` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.card-04` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.card-05` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.card-06` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.card-07` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.card-08` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.card-09` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.card-10` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.card-11` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.card-12` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.card-13` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.card-14` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.composition.card-15` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.visual.root` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.visual.root-no-fill` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.visual.font-family` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.visual.member-photos` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.visual.fun-ia-plane` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.semantic.root-element` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.semantic.aucun-section-header` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |
| `equipe.semantic.aucune-semantique-de-liste` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.member-card |

## 6. Cas et artefacts

Aucun cas — aucun cas parent n'est fabriqué sous une porte de dépendance fermée.
## 7. Divergences, limites nommées et travaux reportés

- **Non prouvé** `equipe.structure.root` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.root-display` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.root-direction` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.root-justify` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.root-padding-left` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.root-padding-right` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.root-gap` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.root-width` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.root-height` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.clips-content` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.single-child` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.grid` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.grid-layout-mode` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.grid-column-count` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.grid-row-count` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.grid-column-gap` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.grid-row-gap` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.grid-grow` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.grid-direction` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.grid-no-wrap` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.grid-track-width` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.structure.grid-item-order` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.property.items` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.property.items-binding-none` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.property.items-shape` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.content.member-count` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.content.items-default-absent` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.content.roster` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.content.placeholders` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.member-card` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.repeat` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.member-card-geometry` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.member-card-overrides` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.member-picture` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.member-picture-hover` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.card-00` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.card-01` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.card-02` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.card-03` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.card-04` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.card-05` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.card-06` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.card-07` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.card-08` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.card-09` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.card-10` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.card-11` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.card-12` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.card-13` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.card-14` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.composition.card-15` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.visual.root` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.visual.root-no-fill` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.visual.font-family` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.visual.member-photos` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.visual.fun-ia-plane` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.semantic.root-element` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.semantic.aucun-section-header` — dependency-gate-closed:ds.member-card
- **Non prouvé** `equipe.semantic.aucune-semantique-de-liste` — dependency-gate-closed:ds.member-card
- **Limite déclarée d'avance** `equipe.member-card.2e-plan-photo-non-branche` (impact attendu : blocked) — Le 2e plan photo de MemberCard n'est pas branché — limite assumée en 011, NON périmée.

## 8. Verdict

**`blocked`** — motifs : `dependency:ds.member-card:blocked`, `receipt-verdict-blocked`, `dependency-not-proved:ds.member-card`, `figma-file-version-moved:2381568261081914456->2381581871281042338`

Règle d'agrégation appliquée (fail-closed, data-model §10) :

```text
blocked    si dependencyOpen == false
divergent  sinon si au moins un fait/cas est divergent/fail
not-proven sinon si couverture inexacte ou preuve non probante
limited    sinon si au moins un fait est limited
proved     sinon si tous les faits requis et cas sont proved/pass
```

## 9. Historique initial → remédié

Aucun — aucune remédiation locale n'a été appliquée à cet organisme.
