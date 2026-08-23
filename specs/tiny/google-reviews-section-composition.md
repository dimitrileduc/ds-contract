# Drift de spécification — composition Section Avis Google

Date : 2026-08-23  
Statut : implémenté, qualification Odoo à rejouer après repin

## Décision

La surface publique est désormais `ds.google-reviews-section@1.0.0` :

```text
Section Avis Google
├── SectionHeader
└── Avis Google (widget existant)
    └── Review-card × n
```

Le master Figma est `2545:5685` (clé
`a4d8c699641576c3f44fa7042382979ef9445cdb`) dans `DS · Organisms`, présenté
par `Container · Section Avis Google` (`2545:5684`). Il est vertical,
Fill/Hug, largeur de référence 1552 px et gap 48 px. Ses deux enfants sont des
instances Fill. Les huit Pages Figma existantes n'ont pas été modifiées.

## Écart assumé avec la spec 006

La spec 006 définissait `ds.google-reviews` comme l'aplat seul et classait le
`SectionHeader` voisin hors scope. Cette frontière est conservée pour le widget
historique et son authoring Odoo : elle ne décrit plus la surface publique de
composition. Le nouveau parent porte le titre, l'espacement et le seul hôte
`section`.

## Projection Odoo

Le snippet de bibliothèque est désormais `s_pqr_google_reviews_section`.
Il rend un unique `section`, le `SectionHeader`, puis le corps historique du
widget sous forme de `div` : aucune `section` n'est imbriquée. Le seed Home
utilise cette racine unique. Les blocs sauvegardés `s_pqr_google_reviews`
restent supportés ; leur registre d'authoring historique est inchangé.

Le marqueur Odoo reste volontairement épinglé à `ds.google-reviews@2.0.0` :
le registre d'authoring couvre cette racine historique et n'est pas élargi en
silence à une seconde surface posable. Le contrat `ds.google-reviews-section`
est la source de la composition Figma/HTML ; la projection Odoo est une
adaptation documentée de cette surface, pas une nouvelle API d'édition.

Une règle de pont borne le widget à `width: 100%` lorsqu'il est enfant du
nouveau parent. Cette exception est locale : elle ne change pas le rendu des
instances historiques à 1552 px.

## Traçabilité PR

- PR : à renseigner à l'ouverture (ne pas inventer de numéro).
- Commit de merge : à renseigner après merge.
- Repin : `integrations/odoo/config/inputs.lock.json` a été régénéré ; les
  reçus Odoo antérieurs sont invalidés et doivent être rejoués avant tout
  claim de qualification.
- Gates verts à cette étape : génération React/HTML, assets Odoo, lock,
  couverture authoring et rapport de dérivation.
- À rejouer avant fermeture : insertion/save/reopen/public Odoo et visuels
  1728/1440 ; la promesse responsive est desktop fluide, pas une promesse
  mobile sous 1262 px.
