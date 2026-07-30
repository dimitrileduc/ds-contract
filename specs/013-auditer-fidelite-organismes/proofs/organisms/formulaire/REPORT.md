# Dossier d'audit — Formulaire (`ds.formulaire`)

> Généré depuis `result.json` — le Markdown n'est jamais l'autorité du verdict.

## 1. Identité

| Champ | Valeur |
|---|---|
| Sujet | `formulaire` (Formulaire) |
| Vague | 3 |
| Contrat | `ds.formulaire` v1.1.0 — `contracts/formulaire.contract.json` |
| Node master Figma | `2096:2564` |
| Référence Figma | `d9FYAUcqdcNtsuaMgLefvJ` @ version `2381581871281042338` (lecture seule) |

## 2. Audits de propreté réutilisés (Step 0)

- `specs/003-externalize-figma-components/audits/formulaire.md`
- `specs/010-extract-molecules-organisms/audit-reuse-map.md`

## 3. Dépendance

| Champ | Valeur |
|---|---|
| Dépendance | `ds.field` v2.0.0 |
| Reçu | `specs/011-fix-molecule-convergence/proofs/visual/result.json` (sha256 `f68a3606b82a`) |
| Verdict brut du reçu | `blocked` |
| Verdict mappé (013) | `blocked` |
| Probant (dérivé) | true |
| Porte ouverte | false |
| Motifs | `receipt-verdict-blocked`, `dependency-not-proved:ds.field`, `figma-file-version-moved:2381568261081914456->2381581871281042338` |

## 4. Couverture exacte

- attendus : 77
- observés : 0
- manquants : `formulaire.composition.avantage-repeat`, `formulaire.composition.bouton-a`, `formulaire.composition.bouton-a-icone-gauche`, `formulaire.composition.bouton-a-variant`, `formulaire.composition.bouton-b`, `formulaire.composition.bouton-b-icone-droite`, `formulaire.composition.bouton-b-variant`, `formulaire.composition.bouton-envoyer`, `formulaire.composition.bouton-envoyer-variant`, `formulaire.composition.dependance-field-porte-fermee`, `formulaire.composition.field-etat`, `formulaire.composition.field-optionnel-telephone`, `formulaire.composition.field-sept-instances`, `formulaire.composition.saisie-slot-non-rempli`, `formulaire.composition.saisie-trois-variantes`, `formulaire.composition.section-header`, `formulaire.composition.section-header-accroche2`, `formulaire.composition.section-header-alignement`, `formulaire.composition.section-header-disposition`, `formulaire.content.avantage-1-texte`, `formulaire.content.avantage-1-titre`, `formulaire.content.avantage-2-texte`, `formulaire.content.avantage-2-titre`, `formulaire.content.avantage-3-texte`, `formulaire.content.avantage-3-titre`, `formulaire.content.avantage-4-texte`, `formulaire.content.avantage-4-titre`, `formulaire.content.bouton-a-libelle`, `formulaire.content.bouton-b-libelle`, `formulaire.content.bouton-envoyer-libelle`, `formulaire.content.consentement`, `formulaire.content.consentement-plage-hyperlien`, `formulaire.content.field-labels`, `formulaire.content.saisie-valeurs`, `formulaire.content.section-header-accroche`, `formulaire.content.section-header-titre`, `formulaire.property.accroche-inerte`, `formulaire.property.aucune-propriete-de-champ`, `formulaire.property.consentement-binding`, `formulaire.property.items-binding-none`, `formulaire.property.items-sans-defaut`, `formulaire.property.titre-inerte`, `formulaire.property.titre-type`, `formulaire.semantic.aucun-controle-natif`, `formulaire.semantic.aucun-etat-interactif`, `formulaire.semantic.bouton-envoyer-sans-soumission`, `formulaire.semantic.consentement-sans-ancre`, `formulaire.semantic.label-sans-association`, `formulaire.semantic.root-element`, `formulaire.semantic.titre-sans-niveau`, `formulaire.structure.bouton-envoyer-pleine-largeur`, `formulaire.structure.buttons`, `formulaire.structure.buttons-gap`, `formulaire.structure.column`, `formulaire.structure.column-fill`, `formulaire.structure.column-gap`, `formulaire.structure.features`, `formulaire.structure.features-gap`, `formulaire.structure.field-fill`, `formulaire.structure.form`, `formulaire.structure.form-fill`, `formulaire.structure.form-gap`, `formulaire.structure.form-padding`, `formulaire.structure.root`, `formulaire.structure.root-gap`, `formulaire.structure.root-largeur`, `formulaire.structure.root-sans-fond`, `formulaire.structure.row-gap`, `formulaire.structure.row5-hauteur`, `formulaire.structure.rows-homonymes`, `formulaire.structure.saisie-largeur-fixe`, `formulaire.visual.consentement-couleur-de-base`, `formulaire.visual.consentement-plage-lien`, `formulaire.visual.consentement-typographie`, `formulaire.visual.font-family`, `formulaire.visual.form-fond`, `formulaire.visual.root`
- inattendus : **aucun**

## 5. Faits

| Fait | Catégorie | Représentabilité | Jambe Figma | Jambe contrat | Jambe générée | Verdict | Source localisée | Motifs |
|---|---|---|---|---|---|---|---|---|
| `formulaire.structure.root` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.root-gap` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.root-largeur` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.root-sans-fond` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.column` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.column-fill` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.column-gap` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.features` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.features-gap` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.buttons` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.buttons-gap` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.form` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.form-fill` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.form-gap` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.form-padding` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.rows-homonymes` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.row-gap` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.field-fill` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.row5-hauteur` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.saisie-largeur-fixe` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.structure.bouton-envoyer-pleine-largeur` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.content.consentement` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.content.consentement-plage-hyperlien` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.content.section-header-titre` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.content.section-header-accroche` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.content.avantage-1-titre` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.content.avantage-1-texte` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.content.avantage-2-titre` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.content.avantage-2-texte` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.content.avantage-3-titre` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.content.avantage-3-texte` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.content.avantage-4-titre` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.content.avantage-4-texte` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.content.field-labels` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.content.saisie-valeurs` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.content.bouton-a-libelle` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.content.bouton-b-libelle` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.content.bouton-envoyer-libelle` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.property.consentement-binding` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.property.accroche-inerte` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.property.titre-inerte` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.property.titre-type` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.property.items-sans-defaut` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.property.items-binding-none` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.property.aucune-propriete-de-champ` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.section-header` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.section-header-disposition` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.section-header-accroche2` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.section-header-alignement` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.avantage-repeat` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.bouton-a` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.bouton-a-variant` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.bouton-a-icone-gauche` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.bouton-b` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.bouton-b-variant` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.bouton-b-icone-droite` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.bouton-envoyer` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.bouton-envoyer-variant` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.field-sept-instances` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.field-etat` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.field-optionnel-telephone` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.saisie-slot-non-rempli` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.saisie-trois-variantes` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.composition.dependance-field-porte-fermee` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.visual.root` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.visual.form-fond` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.visual.font-family` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.visual.consentement-typographie` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.visual.consentement-couleur-de-base` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.visual.consentement-plage-lien` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.semantic.root-element` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.semantic.aucun-controle-natif` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.semantic.label-sans-association` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.semantic.bouton-envoyer-sans-soumission` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.semantic.consentement-sans-ancre` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.semantic.titre-sans-niveau` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |
| `formulaire.semantic.aucun-etat-interactif` | composition | carry-both | — | — | — | **not-proven** | — | dependency-gate-closed:ds.field |

## 6. Cas et artefacts

Aucun cas — aucun cas parent n'est fabriqué sous une porte de dépendance fermée.
## 7. Divergences, limites nommées et travaux reportés

- **Non prouvé** `formulaire.structure.root` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.root-gap` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.root-largeur` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.root-sans-fond` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.column` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.column-fill` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.column-gap` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.features` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.features-gap` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.buttons` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.buttons-gap` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.form` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.form-fill` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.form-gap` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.form-padding` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.rows-homonymes` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.row-gap` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.field-fill` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.row5-hauteur` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.saisie-largeur-fixe` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.structure.bouton-envoyer-pleine-largeur` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.content.consentement` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.content.consentement-plage-hyperlien` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.content.section-header-titre` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.content.section-header-accroche` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.content.avantage-1-titre` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.content.avantage-1-texte` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.content.avantage-2-titre` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.content.avantage-2-texte` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.content.avantage-3-titre` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.content.avantage-3-texte` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.content.avantage-4-titre` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.content.avantage-4-texte` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.content.field-labels` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.content.saisie-valeurs` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.content.bouton-a-libelle` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.content.bouton-b-libelle` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.content.bouton-envoyer-libelle` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.property.consentement-binding` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.property.accroche-inerte` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.property.titre-inerte` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.property.titre-type` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.property.items-sans-defaut` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.property.items-binding-none` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.property.aucune-propriete-de-champ` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.section-header` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.section-header-disposition` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.section-header-accroche2` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.section-header-alignement` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.avantage-repeat` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.bouton-a` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.bouton-a-variant` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.bouton-a-icone-gauche` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.bouton-b` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.bouton-b-variant` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.bouton-b-icone-droite` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.bouton-envoyer` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.bouton-envoyer-variant` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.field-sept-instances` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.field-etat` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.field-optionnel-telephone` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.saisie-slot-non-rempli` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.saisie-trois-variantes` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.composition.dependance-field-porte-fermee` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.visual.root` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.visual.form-fond` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.visual.font-family` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.visual.consentement-typographie` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.visual.consentement-couleur-de-base` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.visual.consentement-plage-lien` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.semantic.root-element` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.semantic.aucun-controle-natif` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.semantic.label-sans-association` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.semantic.bouton-envoyer-sans-soumission` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.semantic.consentement-sans-ancre` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.semantic.titre-sans-niveau` — dependency-gate-closed:ds.field
- **Non prouvé** `formulaire.semantic.aucun-etat-interactif` — dependency-gate-closed:ds.field

## 8. Verdict

**`blocked`** — motifs : `dependency:ds.field:blocked`, `receipt-verdict-blocked`, `dependency-not-proved:ds.field`, `figma-file-version-moved:2381568261081914456->2381581871281042338`

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
