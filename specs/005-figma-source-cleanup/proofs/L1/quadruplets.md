> Blocs prêts à recopier dans `RAPPORT-CLOTURE.md` (format `contracts/gesture-record.md` §2).
> Lot 0-pixel : pas de `diffBox`, le triptyque est remplacé par le verdict 9/9 `identical`.
> Base des liens : `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 3 (L1) · T012 — 18 masters d'icônes, enfants par défaut

- **Cible** : 25 calques (`Vector`/`Vector (Stroke)`/`Group N`) sur 18 masters d'icônes — avant/après [Icônes (Assets)](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=6-111) · [Icônes (DS · Atomes)](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2053-1257)
- **Version enregistrée avant la passe** : `005/noms/lot-l1` — `2380151587589170820`
- **Diff annoncé** : 0 pixel (9/9 identical)
- **Diff observé** : 9/9 `identical` — conforme
- **Preuve** : [verdict](../L1/verdict.md) · 9/9 identical
- **Pourquoi** : les 15 icônes du registre + 3 sociales portaient un ou deux enfants aux noms Figma générés par défaut — la racine des ~29 échos vus dans les instances des organisms. Renommés `Tracé`/`Tracé composé`/`Tracé 1`/`Tracé 2` selon leur structure (un seul chemin vs un groupe composé), convention vérifiée en position, jamais devinée sur l'artwork.

### Phase 3 (L1) · T013 — piqueray_logo

- **Cible** : `piqueray_logo` — avant/après [4:14](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=4-14)
- **Version enregistrée avant la passe** : `005/noms/lot-l1` — `2380151587589170820`
- **Diff annoncé** : 0 pixel (9/9 identical)
- **Diff observé** : 9/9 `identical` — conforme
- **Preuve** : [verdict](../L1/verdict.md) · 9/9 identical
- **Pourquoi** : ~20 enfants `Vector`/`Text` par défaut renommés `Tracé`/`Texte` ; axe `Property 1` (générique) renommé `Couleur` (il varie le traitement chromatique Default/Blanc du logotype).

### Phase 3 (L1) · T014 — Header nav (axe seulement)

- **Cible** : `Header nav` — avant/après [84:285](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=84-285)
- **Version enregistrée avant la passe** : `005/noms/lot-l1` — `2380151587589170820`
- **Diff annoncé** : 0 pixel (9/9 identical)
- **Diff observé** : 9/9 `identical` — conforme
- **Preuve** : [verdict](../L1/verdict.md) · 9/9 identical
- **Pourquoi** : axe `Property 1` (générique) renommé `Fond` (il varie le traitement de fond Solid/Transparent). Géométrie (Phase 6/V1) et éclatement (Phase 8/L4) volontairement hors de ce geste.

### Phase 3 (L1) · T015 — Bouton (FR-039 : axe + faute, rien de plus)

- **Cible** : `Bouton` — avant/après [6:122](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=6-122)
- **Version enregistrée avant la passe** : `005/noms/lot-l1` — `2380151587589170820`
- **Diff annoncé** : 0 pixel (9/9 identical)
- **Diff observé** : 9/9 `identical` — conforme
- **Preuve** : [verdict](../L1/verdict.md) · 9/9 identical
- **Pourquoi** : axe `Property 1` renommé `Style` ; valeur `Outilne noir` corrigée en `Outline noir` (trouvée dynamiquement par `variantProperties`, jamais codée en dur). **Ouvre volontairement une divergence contrat↔source** (FR-039, `bindings.figma` de `contracts/button.contract.json` porte encore `"Property 1"`/`"Outilne noir"`) — réparation = bump majeur en Spec B, écrite dans les Divergences ouvertes (T109).

### Phase 3 (L1) · T016 — Hero (titre + sous-titre + Text frame)

- **Cible** : `Hero` — avant/après [2111:3382](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2111-3382)
- **Version enregistrée avant la passe** : `005/noms/lot-l1` — `2380151587589170820`
- **Diff annoncé** : 0 pixel (9/9 identical)
- **Diff observé** : 9/9 `identical` — conforme
- **Preuve** : [verdict](../L1/verdict.md) · 9/9 identical
- **Pourquoi** : le titre était nommé d'après son propre contenu littéral (« Portes de garage industrielles », répété identiquement sur 8 pages) → renommé `Titre` (nom de rôle). Sous-titre (même défaut, même geste) → `Sous-titre`. Frame `Text` → `Bloc texte`.

### Phase 3 (L1) · T017 — Réalisations (collision + faute d'orthographe)

- **Cible** : `Réalisations` — avant/après [2117:4691](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2117-4691)
- **Version enregistrée avant la passe** : `005/noms/lot-l1` — `2380151587589170820`
- **Diff annoncé** : 0 pixel (9/9 identical)
- **Diff observé** : 9/9 `identical` — conforme
- **Preuve** : [verdict](../L1/verdict.md) · 9/9 identical
- **Pourquoi** : le calque interne `Présentation` (confirmé enfant du variant En-tête=Présentation, wrappe titre+wrapper) entrait en collision avec le master `Présentation` → renommé `Bloc en-tête`. Valeur de variant `Presentation` (sans accent) → `Présentation`.

### Phase 3 (L1) · T018 — défauts locaux restants (Coordonnées, Catégories principales, Footer)

- **Cible** : `Coordonnées` [2104:2904](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2104-2904) · `Catégories principales` [2115:4277](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2115-4277) · `Footer` [2120:4785](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2120-4785)
- **Version enregistrée avant la passe** : `005/noms/lot-l1` — `2380151587589170820`
- **Diff annoncé** : 0 pixel (9/9 identical)
- **Diff observé** : 9/9 `identical` — conforme
- **Preuve** : [verdict](../L1/verdict.md) · 9/9 identical
- **Pourquoi** : `Frame 8` (Coordonnées + Footer, wrappe Facebook+Instagram, dims confirmées identiques aux deux endroits) → `Réseaux sociaux`. Footer `Group 7`/`Group 6` → `Facebook`/`Instagram` (ordre gauche/droite vérifié par géométrie live, pas par le numéro Figma — qui aurait donné l'inverse). 2 `Vector` décoratifs de Catégories principales → `Décor` ; 3 `text` (FRAME) trouvés par le relevé au-delà de l'audit → `Bloc texte`.

### Phase 3 (L1) · T019-T021 — 15 descriptions

- **Cible** : `Bouton`, `piqueray_logo`, `Header nav`, `member-picture`, `Carte`, `Product-card`, `Member-card`, `Carousel-controls`, `Footer-column`, `Copyright`, `Avantage`, `Section-header`, `Équipe`, `Catégories principales`, `Produits e-commerce` — 15 masters, liens dans `decisions.md` §T019-T021
- **Version enregistrée avant la passe** : `005/noms/lot-l1` — `2380151587589170820`
- **Diff annoncé** : 0 pixel (métadonnée non rendue — certitude définitionnelle)
- **Diff observé** : aucune capture dédiée nécessaire ; confirmé par le fait que T023 (capturé AVANT ces écritures) est déjà 9/9 identical et qu'une description ne peut par construction apparaître dans `exportAsync`
- **Preuve** : écriture confirmée nœud par nœud (`node.description === valeur attendue`, 15/15) — voir `decisions.md` §T019-T021
- **Pourquoi** : 15 masters sur 52 n'avaient aucune description (FR-010/SC-003). Rédigées par workflow multi-agent (rôle + propriétés pilotables + limites connues), **2 affirmations non tracées vérifiées avant écriture** (1 retirée — hallucination confirmée fausse ; 2 conservées — vérifiées vraies) ; 1 affirmation reformulée pour ne pas anticiper un fait pas encore vrai (Section-header, Phase 6).
