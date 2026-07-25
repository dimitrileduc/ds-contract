> Base des liens : `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 6 (V5) · T071 — Section-header, largeur unifiée (FR-019)

- **Cible** : [Section-header 2090:2397](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2090-2397) — variant [Avec CTA 2090:2388](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2090-2388) (Standard `2090:2385` déjà à 1550, non touché)
- **Version enregistrée avant la passe** : `005/geometrie/section-header` — `2380194880854725208`
- **Diff annoncé** : ~2px sur les pages portant `Avec CTA` · **Diff observé** : 7/9 `identical`, 2/9 `diff` (Accueil, Motorisation), `diffCount=1751` identique sur les deux — **conforme** dans sa forme
- **Preuve** : [verdict](./verdict.md) · triptyque `crops/Accueil.png`, `crops/Motorisation.png`
- **Pourquoi** : les deux variants du site-grid master partageaient des largeurs différentes (1550 vs 1552, FR-019) — nécessaire avant l'adoption ×6 en Phase 7/L5 (R9, sinon la largeur adoptée serait déjà obsolète). Mécanisme réel plus riche que l'hypothèse de départ : `SPACE_BETWEEN` interne (Bouton −2) composé avec un recentrage en cascade de l'instance par son parent `Produits e-commerce` (+1, même classe d'effet que V4/Réassurances) — net Titre +1px, Bouton −1px, vérifié par inspection live d'une instance réelle, pas seulement déduit du maître.
