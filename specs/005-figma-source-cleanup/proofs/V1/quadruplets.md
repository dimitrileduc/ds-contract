> Base des liens :
> `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 6 (V1) · T047 — Header nav, coquille 88→89

- **Cible** : `Header nav` — avant [84:284 Fond=Solid](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=84-284) / [84:286 Fond=Transparent](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=84-286) → après (mêmes ids, propriétés modifiées en place)
- **Version enregistrée avant la passe** : `005/geometrie/header-nav` — `2380206623813672482`
- **Diff annoncé** : bande ~1px aux bords, 9/9 pages · **Diff observé** : 9/9 `diff`, diffBox `x=88,w=1550`, diffCount 3600–4050px/page — **conforme**
- **Preuve** : [verdict](./verdict.md) · triptyque `crops/Accueil.png` (et les 8 autres pages, une par maquette portant Header nav)
- **Pourquoi** : le master portait encore l'hypothèse de brief 88px ; la mesure réelle du site est 89px (D1). Fixé sur les deux variants en une seule passe — aucun piège GROUP/nested-instance ne s'appliquait (relevé `structure-header-nav.json`).
