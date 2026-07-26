> Lot mesuré 0-pixel (mais PAS annoncé 0-pixel — échec de prédiction, voir Pourquoi) —
> triptyque remplacé par le verdict 9/9 `identical` ([verdict](./verdict.md)). Base des
> liens : `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 6 (V2) · T053 — Devis, coquille 88→89

- **Cible** : [Devis 2096:2524](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2096-2524) — `Container` [2096:2525](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2096-2525)
- **Version enregistrée avant la passe** : `005/geometrie/devis` — `2380183199065576591`
- **Diff annoncé** : bande ~1px aux bords + 2px de largeur, pages portant Devis (8/9) · **Diff observé** : 9/9 `identical`, 0 pixel — **❌ échec de prédiction**, pas un « conforme »
- **Preuve** : [verdict](./verdict.md)
- **Pourquoi** : le master portait l'hypothèse de brief 88px/1552px ; la mesure réelle est 89px/1550px (D1). `Container` n'a aucun remplissage propre et se recentre symétriquement (+1 en x, −2 en largeur) autour du même centre absolu — ses enfants, centrés et de taille inchangée, atterrissent au même pixel. Le geste corrige la source correctement (vérifié par lecture directe de propriété sur une instance réelle, zéro override) ; seule la prédiction de son impact visuel — calquée par analogie sur Header nav — était fausse, et nommée comme telle plutôt que silencieusement requalifiée.
