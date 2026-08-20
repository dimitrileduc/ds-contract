# Gate C — contrats (AVANT câblage & Odoo) — présentation owner

**Date de présentation** : 2026-08-20 · **Statut** : ⛔ **PROPOSÉ — en attente de validation owner**
**Fichier machine** : [../gates/gate-c-contrats.json](../gates/gate-c-contrats.json)

Gate C ne se coche pas d'office (SC-007). Ce document présente le diff révisable ;
la validation owner passe `gate-c-contrats.json` à `status: validated` et débloque US3 + US2.

## Ce qui est livré (fait, vérifié)

**Deux contrats gouvernés, extraits de la source Figma nettoyée** (§VIII — jamais autorés) :

1. **`ds.carte-categorie`** (molécule, v1.0.0) — un axe `Style {superpose, empile}`.
   - *empile* = reprise pixel de `ds.carte` disposition Categorie (image FILL, titre/texte, `ds.button`).
   - *superpose* = patron `ds.hero` : plan photo absolu + voile dégradé (transparent→75 % noir) +
     titre/texte blancs + flèche `arrow-right`. Le **Décor** du coin (vecteur) est porté (décision owner).
   - **`ctaType {lien, bouton}` gouverné** (décision owner) : lien = Link Contactez-nous (pdf/download),
     bouton = outlineNoir encadré (flèche). Libellé = contenu libre.
2. **`ds.categories-principales`** (section, v1.0.0) — `repeat` de la carte dans une **grille**,
   enum **fermé** `colonnes {2,3}` (extension de schéma **E1** `layoutByProp.columns`), style transmis,
   wrap natif. Axe menteur « Disposition » supprimé ; « Rdv » = instance renseignée.

**Fidélité** : ZÉRO mint (234→234 jetons — toute la géométrie était déjà en tokens Piqueray) ·
roundtrip **byte-identique ×2** · `npm run parity` **0 nouvelle dérive** (cliché rafraîchi post-mutation,
solde la limite 017) · toutes les portes du dépôt vertes (voir §Portes).

## Décisions que le Gate A a renvoyées ici, tranchées avec l'owner (2026-08-20)

| Décision | Choix owner | Effet |
|---|---|---|
| Type de CTA de la carte empilée | **ctaType gouverné maintenant** | prop enum {lien, bouton} pilotant le `ds.button` |
| Filet décoratif du coin superposé | **le porter (fidèle)** | part vecteur gouvernée, SVG extrait |

## Limites nommées (honnêteté — nommées là où la capacité est revendiquée)

1. `ctaType` sans axe VARIANT sur le master (code-gouverné, binding NONE) — axe Figma = nettoyage différé.
2. `texte` plat (pas rich-text) : la composition `repeat`+`arrayOf` ne transporte pas la plage forte de `ds.carte`.
3. `ctaType` non transporté par carte dans la section — CTA mixte (Maintenance/Rdv) porté hors composition (Odoo).
4. Style superposé : textes du master hardcodés (non liés aux props) — le contrat gouverne, le binding canvas est un suivi US3.
5. Style superposé : hauteur gouvernée par la rangée de grille (pas de token) — la molécule seule rendra à sa taille de rangée.
6. `TitreCategorie` empilé 32px **Medium** majuscules : hérite du défaut connu de `ds.carte` (pas de recette Text Style) — allowlisté, jamais absous.
7. Description du master `CategoriesPrincipales` encore rédigée pour « Disposition » (prose périmée) — nettoyage de libellé canvas à faire.

## À CONFIRMER au Gate C — retrait `ds.carte` v3.0.0 (T029)

Gate A a retenu **retrait-categorie-v3** et a explicitement renvoyé la confirmation **prop par prop ICI**.
Je le **propose** plutôt que de l'exécuter à l'aveugle (change MAJEUR sur un contrat différent, avec cascade + une
décision de suppression de variante canvas orpheline) :

- **Props à retirer** : `disposition:categorie`, `ctaLabel`, `ctaIconLeftGlyph`, `ctaIconRightGlyph`.
- **Parts à retirer** : `categorieImage`, `TitreCategorie`, `TexteCategorie`, `Bouton` (+ leurs `*ByProp`).
- **Version** : `ds.carte` 2.0.1 → **3.0.0**.
- **Cascade mesurée** : `ds.reassurances` (intact, à re-vérifier) · recompte text-styles · parity (variante
  canvas Categorie 2407:4905 cassée+orpheline → acquittement OU suppression, décision owner) · `inputs.lock.json`
  + `reassurances.authoring.json` (épinglage → 3.0.0) · sujets visual-parity.
- **Recommandation** : confirmer la liste, puis exécuter le lot d'un coup.

## Portes vertes (sweep complet dans le worktree)

`npm run build` · `npm run parity` (0 nouvelle dérive, 9 acquittements) · `npm run eval` (voir N/N ci-dessous) ·
`npm run plugin:check` · roundtrip ×2 byte-identique · `core-browser-check` · `npm run geometry:gate` (invisible 0) ·
`tsc --noEmit` + `tsc -p tsconfig.build.json` · `npm run catalog`.

**Eval N/N** : **220/220** (sortie vive, 2026-08-20 ; 48 cas legacy en quarantaine, inchangé).

## Demande

Valider le diff des deux contrats **et** trancher la proposition `ds.carte` v3.0.0 (confirmer la liste de
props/parts + le sort de la variante canvas orpheline). Sur validation : `status: validated` + US3/US2 débloqués.
