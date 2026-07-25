> Base des liens : `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 7 (V6) · T078 — Footer, reconstruction complète

- **Cible** : [Footer 2120:4785](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2120-4785) — avant → après (même id, structure interne reconstruite) ; archive vectorielle : [Archive · Spec A 2146:5436](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2146-5436)
- **Version enregistrée avant la passe** : `005/composition/footer` — `2380193965475233153`
- **Diff annoncé** : bande aux bords + 2px de largeur, 9/9 pages · **Diff observé** : 9/9 `diff`, `diffBox x=88,w=1552,h=248-249`, `diffCount` 2363-2380 quasi-identique — **conforme**
- **Preuve** : [verdict](./verdict.md) · triptyque `crops/Accueil.png` (et les 8 autres pages, Footer étant global)
- **Pourquoi** : Footer était le dernier master à l'ancienne (`layoutMode: NONE`, positions absolues) avec 2 icônes sociales en vecteurs bruts au lieu d'instances gouvernées (US6). Reconstruit en auto-layout VERTICAL (technique de spacers invisibles pour des écarts non uniformes 121px/27px, `Background` en `ABSOLUTE` pour rester plein-bord), `Facebook`/`Instagram` remplacés par des instances des atomes gouvernés, cumulant la coquille Copyright/Separator (88→89, 1552→1550) obtenue automatiquement par le réglage d'auto-layout lui-même. Un incident de contraintes héritées (`SCALE`) sur `Background` détecté et corrigé en direct avant toute capture — nommé en détail dans `gestes.md`, pas absorbé silencieusement. Vérification exhaustive : 100% des positions/tailles identiques au pixel près sauf la coquille elle-même.
