# Preuve — création de la page `DS · Tokens` (T029a)

**Date** : 2026-07-24
**Décision couverte** : `decisions.md` — *amendement-orga* du 2026-07-24 (page
tokens ajoutée au rangement, R9 amendé)

## Checkpoint

- **Label** : `003/tokens/page-ds-tokens`
- **Méthode** : `figma.saveVersionHistoryAsync` via le pont (`bridge/checkpoint.js`)
- **versionId** : `2379706504047594643`
- Note : un premier appel a rendu `success: true` sans corps de résultat
  exploitable (anomalie de transport mineure, sans conséquence — le second
  appel confirme `hasResult: true` avec un `id` bien formé) ; il en résulte
  probablement une entrée d'historique dupliquée sous le même label, sans
  impact fonctionnel.

## Création de page

- Vérification préalable : `figma.root.children.find(p => p.name === 'DS · Tokens')`
  → absente avant création (pas de doublon)
- `figma.createPage()` → **id `2051:951`**, nom `DS · Tokens`
- Fichier passe de 2 à **3 pages** : `Assets`, `Pages`, `DS · Tokens`
- Page vide à ce stade — peuplement en T029b

## Preuve pixel (collatérale)

Une création de page n'affecte par construction aucun node des 9 maquettes de
`Pages` (nouvel arbre, aucune référence croisée). Mesuré formellement en T029c
(capture fraîche + `pages:compare`) après le peuplement complet, pour ne pas
consommer un cycle de preuve avant que la page ait son contenu final.
