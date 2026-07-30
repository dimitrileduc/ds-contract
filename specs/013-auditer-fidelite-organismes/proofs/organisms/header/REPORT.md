# Dossier d'audit — Header (`ds.header`)

> Généré depuis `result.json` — le Markdown n'est jamais l'autorité du verdict.

## 1. Identité

| Champ | Valeur |
|---|---|
| Sujet | `header` (Header) |
| Vague | 3 |
| Contrat | `ds.header` v1.0.0 — `contracts/header.contract.json` |
| Node master Figma | `84:285` |
| Référence Figma | `d9FYAUcqdcNtsuaMgLefvJ` @ version `2381581871281042338` (lecture seule) |

## 2. Audits de propreté réutilisés (Step 0)

- `specs/005-figma-source-cleanup/releves/structure-header-nav.json`
- `specs/005-figma-source-cleanup/releves/instances-l4-verification.json`
- `specs/010-extract-molecules-organisms/audit-reuse-map.md`

## 3. Dépendance

| Champ | Valeur |
|---|---|
| Dépendance | `ds.nav-item` v1.1.0 |
| Reçu | `specs/011-fix-molecule-convergence/proofs/visual/result.json` (sha256 `f68a3606b82a`) |
| Verdict brut du reçu | `fail` |
| Verdict mappé (013) | `divergent` |
| Probant (dérivé) | true |
| Porte ouverte | false |
| Motifs | `receipt-verdict-fail`, `dependency-not-proved:ds.nav-item`, `figma-file-version-moved:2381568261081914456->2381581871281042338` |

## 4. Couverture exacte

- attendus : 52
- observés : 0
- manquants : `header.composition.bouton`, `header.composition.bouton-glyphe-droite`, `header.composition.bouton-icone-droite`, `header.composition.bouton-icone-gauche`, `header.composition.bouton-style-par-variante`, `header.composition.nav-item-actif`, `header.composition.nav-item-chevron`, `header.composition.nav-item-dette-item-8`, `header.composition.nav-item-repeat`, `header.composition.piqueray-logo`, `header.composition.piqueray-logo-couleur-figee`, `header.content.bouton-libelle`, `header.content.nav-item-1-libelle`, `header.content.nav-item-2-libelle`, `header.content.nav-item-3-libelle`, `header.content.nav-item-4-libelle`, `header.content.nav-item-href`, `header.property.fond`, `header.property.fond-defaut`, `header.property.fond-valeurs`, `header.property.items-binding-none`, `header.property.items-sans-defaut`, `header.semantic.icones-decoratives`, `header.semantic.nav-item-lien`, `header.semantic.nav-landmark`, `header.semantic.root-element`, `header.structure.icons-nav`, `header.structure.icons-nav-gap`, `header.structure.nav`, `header.structure.nav-gap`, `header.structure.nav-item-count`, `header.structure.nav-wrapper`, `header.structure.nav-wrapper-gap`, `header.structure.nav-wrapper-justify`, `header.structure.noms-de-calques`, `header.structure.root`, `header.structure.root-align`, `header.structure.root-direction`, `header.structure.root-gap-inerte`, `header.structure.root-justify`, `header.structure.root-padding`, `header.structure.root-width`, `header.visual.bouton-style-de-texte-asymetrique`, `header.visual.fond-solid-remplissage`, `header.visual.fond-transparent-remplissage`, `header.visual.font-family`, `header.visual.icones-couleur-par-variante`, `header.visual.icones-taille`, `header.visual.nav-item-encre-blanche`, `header.visual.nav-item-typographie`, `header.visual.ombre-portee`, `header.visual.root`
- inattendus : **aucun**

## 5. Faits

| Fait | Catégorie | Représentabilité | Jambe Figma | Jambe contrat | Jambe générée | Verdict | Source localisée | Motifs |
|---|---|---|---|---|---|---|---|---|
| `header.structure.root` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.structure.root-direction` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.structure.root-justify` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.structure.root-align` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.structure.root-gap-inerte` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.structure.root-padding` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.structure.root-width` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.structure.nav-wrapper` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.structure.nav-wrapper-justify` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.structure.nav-wrapper-gap` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.structure.nav` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.structure.nav-gap` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.structure.icons-nav` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.structure.icons-nav-gap` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.structure.nav-item-count` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.structure.noms-de-calques` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.content.nav-item-1-libelle` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.content.nav-item-2-libelle` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.content.nav-item-3-libelle` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.content.nav-item-4-libelle` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.content.bouton-libelle` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.content.nav-item-href` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.property.fond` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.property.fond-defaut` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.property.fond-valeurs` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.property.items-binding-none` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.property.items-sans-defaut` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.composition.piqueray-logo` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.composition.piqueray-logo-couleur-figee` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.composition.nav-item-repeat` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.composition.nav-item-chevron` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.composition.nav-item-actif` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.composition.nav-item-dette-item-8` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.composition.bouton` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.composition.bouton-style-par-variante` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.composition.bouton-icone-droite` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.composition.bouton-glyphe-droite` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.composition.bouton-icone-gauche` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.visual.root` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.visual.fond-solid-remplissage` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.visual.fond-transparent-remplissage` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.visual.ombre-portee` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.visual.icones-taille` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.visual.icones-couleur-par-variante` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.visual.nav-item-encre-blanche` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.visual.font-family` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.visual.nav-item-typographie` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.visual.bouton-style-de-texte-asymetrique` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.semantic.root-element` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.semantic.nav-landmark` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.semantic.nav-item-lien` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |
| `header.semantic.icones-decoratives` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.nav-item |

## 6. Cas et artefacts

Aucun cas — aucun cas parent n'est fabriqué sous une porte de dépendance fermée.
## 7. Divergences, limites nommées et travaux reportés

- **Non prouvé** `header.structure.root` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.structure.root-direction` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.structure.root-justify` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.structure.root-align` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.structure.root-gap-inerte` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.structure.root-padding` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.structure.root-width` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.structure.nav-wrapper` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.structure.nav-wrapper-justify` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.structure.nav-wrapper-gap` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.structure.nav` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.structure.nav-gap` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.structure.icons-nav` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.structure.icons-nav-gap` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.structure.nav-item-count` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.structure.noms-de-calques` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.content.nav-item-1-libelle` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.content.nav-item-2-libelle` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.content.nav-item-3-libelle` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.content.nav-item-4-libelle` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.content.bouton-libelle` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.content.nav-item-href` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.property.fond` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.property.fond-defaut` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.property.fond-valeurs` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.property.items-binding-none` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.property.items-sans-defaut` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.composition.piqueray-logo` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.composition.piqueray-logo-couleur-figee` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.composition.nav-item-repeat` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.composition.nav-item-chevron` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.composition.nav-item-actif` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.composition.nav-item-dette-item-8` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.composition.bouton` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.composition.bouton-style-par-variante` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.composition.bouton-icone-droite` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.composition.bouton-glyphe-droite` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.composition.bouton-icone-gauche` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.visual.root` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.visual.fond-solid-remplissage` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.visual.fond-transparent-remplissage` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.visual.ombre-portee` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.visual.icones-taille` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.visual.icones-couleur-par-variante` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.visual.nav-item-encre-blanche` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.visual.font-family` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.visual.nav-item-typographie` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.visual.bouton-style-de-texte-asymetrique` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.semantic.root-element` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.semantic.nav-landmark` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.semantic.nav-item-lien` — dependency-gate-closed:ds.nav-item
- **Non prouvé** `header.semantic.icones-decoratives` — dependency-gate-closed:ds.nav-item
- **Limite déclarée d'avance** `header.nav-item.dette-item-8` (impact attendu : blocked) — Dette NavItem item 8 ouverte, partagée avec la dépendance ds.nav-item.

## 8. Verdict

**`blocked`** — motifs : `dependency:ds.nav-item:divergent`, `receipt-verdict-fail`, `dependency-not-proved:ds.nav-item`, `figma-file-version-moved:2381568261081914456->2381581871281042338`

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
