> Lot mesuré 0-pixel (mais PAS annoncé 0-pixel — échec de prédiction, voir Pourquoi) —
> triptyque remplacé par le verdict 9/9 `identical` ([verdict](./verdict.md)). Base des
> liens : `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 6 (V4) · T065 — Réassurances, coquille 88→89

- **Cible** : [Réassurances 2114:3721](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2114-3721) — 3 variants : [2114:3619](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2114-3619) / [2114:3653](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2114-3653) / [2114:3693](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2114-3693)
- **Version enregistrée avant la passe** : `005/geometrie/reassurances` — `2380208178616052777`
- **Diff annoncé** : 2px de largeur, pages portant Réassurances (6/9) · **Diff observé** : 9/9 `identical`, 0 pixel — **❌ échec de prédiction**, pas un « conforme »
- **Preuve** : [verdict](./verdict.md)
- **Pourquoi** : centrage en cascade sur toute la hiérarchie de page — l'instance Réassurances se recentre `x:88→89` dans son propre parent, `Section-header` embarqué (non fixé avant V5) se recentre `x:0→-1` à l'intérieur ; les deux décalages s'annulent exactement au pixel absolu (88 = 88, vérifié par inspection live d'une instance réelle). Le risque de débordement nommé avant le geste ne se manifeste pas, pour la même raison. La correction de source (1550) est correcte et vérifiée par lecture directe ; seule la prédiction de son impact visuel était fausse, comme pour Devis (V2) — un même schéma générique (contenu centré, tailles inchangées) qui s'applique ici à un niveau d'imbrication supplémentaire.
