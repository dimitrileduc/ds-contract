# Première application — alignement Centre

Le Desktop Bridge a appliqué exactement deux opérations sur le master `2090:2397` :

- `2351:36774` (`Accroche`, variante `Alignement=Centre`) : `LEFT` → `CENTER` ;
- `2351:36775` (`Titre`, variante `Alignement=Centre`) : `LEFT` → `CENTER`.

La réponse native de cette application indiquait `createdNodeIds: []`, `pageWrites: []`, les deux variantes inchangées et aucun overflow à 1440/768. `bridge-first.applied.raw.json` assemble cette réponse d'application avec l'inspection responsive capturée immédiatement après par `bridge-observation-after-apply.raw.json`; cette dernière est un no-op volontaire, utilisé uniquement pour écrire les deux PNG de preuve après l'application.
