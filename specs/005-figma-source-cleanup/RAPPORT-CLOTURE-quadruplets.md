# RAPPORT-CLOTURE — Brouillon quadruplets (matériau brut pour T114)

**Statut** : brouillon de compilation, PAS le rapport de clôture. Sert de matériau vérifié
pour remplir la section « Quadruplets (un par geste) » de `RAPPORT-CLOTURE.md` (T114 —
format `contracts/gesture-record.md` §2). Consigne suivie à la lettre : **rien n'est
corrigé ici**, y compris quand le Contrôle SC-015 (§3) relève un champ manquant ou une
incohérence — les faits sont constatés, pas réparés.

## 0 · Périmètre lu

Les 11 cycles nommés — `L1, L2, L3, V1, V2, V3, V4, V5, V6, L5, L4` — possèdent **chacun**
un `proofs/<cycle>/quadruplets.md` non vide. **Aucun des 11 cycles nommés n'en est
dépourvu.**

Pour mémoire, constaté en passant (hors périmètre demandé, mais éclaire la cadence citée
dans le gabarit `RAPPORT-CLOTURE.md` § Cadence — « L1-L5 + V1-**V7** ») :
- `proofs/V7` **n'existe pas** comme dossier. `tasks.md` (T106) documente explicitement
  que ce cycle a produit *zéro* geste de correction cette itération (« zero design fixes
  occurred this iteration, not one ») — l'absence de fichier est cohérente avec ce constat
  écrit, pas une omission silencieuse.
- `00-etalonnage`, `L2-retest`, `L2-retest3`, `L2-retest4` existent comme dossiers de preuve
  (`verdict.json`/`verdict.md`) mais **n'ont pas de `quadruplets.md`** — ce sont des jalons
  d'étalonnage/ré-essai intermédiaires. Les trois `L2-retest*` sont cités PAR les 4 blocs de
  `L2/quadruplets.md` (le verdict final retenu est `L2-retest4/verdict.md`) ; ce ne sont pas
  des cycles à quadruplet propre.

## 1 · Sommaire par cycle (ordre de compilation)

| # | Cycle (Phase) | Cible(s) | Verdict page-parity (9 maquettes, source `verdict.md`) |
|---|---|---|---|
| 1 | **L1** (Phase 3) | 18 masters d'icônes + 3 sociales (noms d'enfants) · `piqueray_logo` · `Header nav` (axe) · `Bouton` (axe + faute) · `Hero` (titre/sous-titre) · `Réalisations` · `Coordonnées`/`Catégories principales`/`Footer` (défauts locaux) · 15 descriptions de master | 9/9 `identical` (0 px) — conforme |
| 2 | **L2** (Phase 4) | style `Titre Hero` 54px · 21 liaisons de style texte · liaisons `color/blanc` (Footer-column, Copyright) · liaison `color/noir-bleuté` (Accordion-row) · 4 couleurs hors palette laissées littérales (T032, sans écriture) | verdict **final retenu** = `L2-retest4` : 9/9 `identical` (0 px) — conforme, après 3 tentatives (`L2` diff 9/9 → `L2-retest` diff 9/9 → `L2-retest3` diff 7/9 → `L2-retest4` identical 9/9), 2 correctifs distincts nommés |
| 3 | **L3** (Phase 5) | `Product-card` (BOOLEAN `Bouton`) · `Tab` (archive + suppression variant fantôme `État3`) · `member-picture` (axe `État`) | 9/9 `identical` — conforme |
| 4 | **V1** (Phase 6) | `Header nav`, coquille 88→89px | 9/9 `diff` (bande ~1px, `diffBox x=88,w=1550`) — conforme à la prédiction |
| 5 | **V2** (Phase 6) | `Devis`, coquille 88→89px | 9/9 `identical` (0 px) — **échec de prédiction** (diff annoncé, non observé ; nommé comme tel dans le bloc) |
| 6 | **V3** (Phase 6) | `SAV`, coquille 88→89px (contournement piège GROUP) | 8/9 `identical`, 1/9 `diff` (Accueil, `diffCount=7291`) — conforme + déviation de processus nommée (version posée après le geste) |
| 7 | **V4** (Phase 6) | `Réassurances`, coquille 88→89px | 9/9 `identical` (0 px) — **échec de prédiction** |
| 8 | **V5** (Phase 6) | `Section-header`, largeur unifiée 1550 (FR-019) | 7/9 `identical`, 2/9 `diff` (Accueil, Motorisation, `diffCount=1751` chacune) — conforme |
| 9 | **V6** (Phase 7) | `Footer`, reconstruction complète (auto-layout + icônes gouvernées) | 0/9 `identical`, 9/9 `diff` (`diffBox x=88,w=1552,h≈248-249`) — conforme (Footer étant global) |
| 10 | **L5** (Phase 7) | `Section-header` × 6 organismes candidats à l'adoption (0/6 réalisée, nommé) · `Hero vidéo` (componentisation FRAME→COMPONENT) | 9/9 `identical` — conforme |
| 11 | **L4** (Phase 8) | Suppression page `Assets` · déplacement ~19 masters (icônes/Bouton/logo/member-picture → DS·Atomes ; Typo/Couleurs → DS·Tokens ; `Header nav`→`Header` → DS·Organisms) · scission `Header`→`Header`+`Nav-item` (nouveau master) · récupération glyphe orphelin `6:119` | verdict.md réel : **6/9 `identical`, 3/9 `diff`** (Motorisation, Portes d'entrée, Portes de garage — `diffCount=1`, 1×1px chacune) — conforme, résidu nommé. **Écart de décompte relevé** : le bloc lui-même annonce « 8/9 identical » (voir §4) |

## 2 · Quadruplets compilés — ordre L1 → L4

Chaque cycle ci-dessous est reproduit **verbatim** depuis son `proofs/<cycle>/quadruplets.md`
(note de préambule du fichier incluse, puis tous ses blocs). Rien n'est réécrit ni corrigé.

### 2.1 · `proofs/L1/quadruplets.md`

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

### 2.2 · `proofs/L2/quadruplets.md`

> Blocs prêts à recopier dans `RAPPORT-CLOTURE.md`. Lot 0-pixel — triptyque remplacé
> par le verdict 9/9 `identical` final ([proofs/L2-retest4/verdict.md](../L2-retest4/verdict.md)).
> Base des liens : `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 4 (L2) · T027 — style Titre Hero (54px)

- **Cible** : `Titre Hero` (nouveau style) appliqué à [Hero titre 2111:3378](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2111-3378)
- **Version enregistrée avant la passe** : `005/variables/lot-l2` — `2380158790790581337`
- **Diff annoncé** : 0 pixel (9/9 identical)
- **Diff observé** : 9/9 `identical` (après correctif — 1ʳᵉ tentative avait cassé le mélange Bold+Light du titre, corrigé avant toute capture)
- **Preuve** : [verdict final](../L2-retest4/verdict.md)
- **Pourquoi** : seule valeur typographique (54px) sans style existant — FR-011. Le titre porte un mélange délibéré Bold ("Portes de garage") + Light (" industrielles") : la simple application du style l'aurait aplati en Bold uniforme ; restauré par `setRangeFontName` avant toute capture.

### Phase 4 (L2) · T028 — 21 liaisons de style texte

- **Cible** : 21 occurrences (7 tailles : 16/14/20/18/24/40/32px) — détail des nœuds dans `decisions.md` §L2
- **Version enregistrée avant la passe** : `005/variables/lot-l2` — `2380158790790581337`
- **Diff annoncé** : 0 pixel
- **Diff observé** : 9/9 `identical` (après 2 correctifs distincts — casse et graisse par instance, voir Dégradations & limites)
- **Preuve** : [verdict final](../L2-retest4/verdict.md)
- **Pourquoi** : gouverne toute valeur typographique ≥3× ayant un style existant correspondant (SC-011). Fait ressortir une limite non documentée de `setTextStyleIdAsync` : casse et graisse d'instance ne sont pas garanties de survivre à une liaison — corrigé nœud par nœud, jamais silencieusement.

### Phase 4 (L2) · T029/T031 — liaisons `color/blanc`

- **Cible** : [Footer-column 2079:2248](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2079-2248), [Copyright 2086:2331](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2086-2331) ; Devis `2096:2526` déjà lié (vérifié, 0 écriture)
- **Version enregistrée avant la passe** : `005/variables/lot-l2` — `2380158790790581337`
- **Diff annoncé** : 0 pixel · **Diff observé** : 9/9 `identical` — conforme
- **Preuve** : [verdict final](../L2-retest4/verdict.md)
- **Pourquoi** : FR-013, match exact à une variable existante, liaison sans condition de seuil.

### Phase 4 (L2) · T030 — liaison `color/noir-bleute` (Accordion-row Petit)

- **Cible** : [Accordion-row 2059:1417](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2059-1417) (bordure Petit, 2 nœuds master + 26 instances)
- **Version enregistrée avant la passe** : `005/variables/lot-l2` — `2380158790790581337`
- **Diff annoncé** : 0 pixel · **Diff observé** : 9/9 `identical` — conforme (après correctif opacité, voir Dégradations & limites)
- **Preuve** : [verdict final](../L2-retest4/verdict.md)
- **Pourquoi** : FR-013. Cascade à FAQ + Texte SEO par héritage (D3) — mais l'opacité (0x52/255, distincte du canal couleur) ne suit pas la liaison sur les instances portant leur propre override ; corrigée sur 26 instances au total.

### Phase 4 (L2) · T032 — règle 3× couleurs hors palette

- **Cible** : `#000000` (Accordion-row Grand), `#26282C52`, `#E0E0E0` (Réalisation), `#0000004D` (Devis)
- **Diff observé** : sans objet — aucune écriture (les 4 valeurs restent sous le seuil 3× dans les masters, `releves/regle-3x-2026-07-25.json`)
- **Pourquoi** : aucune ne dépasse 3 occurrences dans les masters (R8) → laissées littérales et déclarées (FR-012/SC-011), listées dans `RAPPORT-CLOTURE.md` § Valeurs laissées littérales (T110).

### 2.3 · `proofs/L3/quadruplets.md`

> Lot 0-pixel — triptyque remplacé par le verdict 9/9 `identical`
> ([verdict](./verdict.md)). Base des liens :
> `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 5 (L3) · T037 — Product-card, propriété BOOLEAN Bouton

- **Cible** : [Product-card 2068:1972](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2068-1972)
- **Version enregistrée avant la passe** : `005/affordances/lot-l3` — `2380204337834005784`
- **Diff annoncé** : 0 pixel · **Diff observé** : 9/9 `identical` — conforme
- **Preuve** : [verdict](./verdict.md)
- **Pourquoi** : le bouton caché n'avait aucune propriété officielle (`componentPropertyReferences` vide) — l'affordance officieuse de la leçon Button (FR-007). Désormais `Bouton` BOOLEAN, défaut `false` = état actuel.

### Phase 5 (L3) · T038+T039 — Tab, archive puis suppression du variant fantôme (un seul geste destructif)

- **Cible** : [Tab 2061:1588](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2061-1588) — archive : [Archive · Spec A 2136:5429](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2136-5429)
- **Version enregistrée avant la passe** : `005/affordances/lot-l3` — `2380204337834005784`
- **Diff annoncé** : 0 pixel · **Diff observé** : 9/9 `identical` — conforme
- **Preuve** : [verdict](./verdict.md)
- **Pourquoi** : `État3` était un variant auto-généré, absent de la description du composant, non instancié nulle part (FR-008). Archivé (vecteurs intacts) avant suppression, conforme FR-031.

### Phase 5 (L3) · T040 — member-picture, axe + valeurs

- **Cible** : [member-picture 274:2389](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=274-2389)
- **Version enregistrée avant la passe** : `005/affordances/lot-l3` — `2380204337834005784`
- **Diff annoncé** : 0 pixel · **Diff observé** : 9/9 `identical` — conforme
- **Preuve** : [verdict](./verdict.md)
- **Pourquoi** : un état interactif modélisé comme valeur d'axe anonyme (`Default|hover`, casse incohérente) devient un axe d'état nommé (`État = Défaut | Survol`, FR-009/R7).

### 2.4 · `proofs/V1/quadruplets.md`

> Base des liens :
> `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 6 (V1) · T047 — Header nav, coquille 88→89

- **Cible** : `Header nav` — avant [84:284 Fond=Solid](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=84-284) / [84:286 Fond=Transparent](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=84-286) → après (mêmes ids, propriétés modifiées en place)
- **Version enregistrée avant la passe** : `005/geometrie/header-nav` — `2380206623813672482`
- **Diff annoncé** : bande ~1px aux bords, 9/9 pages · **Diff observé** : 9/9 `diff`, diffBox `x=88,w=1550`, diffCount 3600–4050px/page — **conforme**
- **Preuve** : [verdict](./verdict.md) · triptyque `crops/Accueil.png` (et les 8 autres pages, une par maquette portant Header nav)
- **Pourquoi** : le master portait encore l'hypothèse de brief 88px ; la mesure réelle du site est 89px (D1). Fixé sur les deux variants en une seule passe — aucun piège GROUP/nested-instance ne s'appliquait (relevé `structure-header-nav.json`).

### 2.5 · `proofs/V2/quadruplets.md`

> Lot mesuré 0-pixel (mais PAS annoncé 0-pixel — échec de prédiction, voir Pourquoi) —
> triptyque remplacé par le verdict 9/9 `identical` ([verdict](./verdict.md)). Base des
> liens : `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 6 (V2) · T053 — Devis, coquille 88→89

- **Cible** : [Devis 2096:2524](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2096-2524) — `Container` [2096:2525](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2096-2525)
- **Version enregistrée avant la passe** : `005/geometrie/devis` — `2380183199065576591`
- **Diff annoncé** : bande ~1px aux bords + 2px de largeur, pages portant Devis (8/9) · **Diff observé** : 9/9 `identical`, 0 pixel — **❌ échec de prédiction**, pas un « conforme »
- **Preuve** : [verdict](./verdict.md)
- **Pourquoi** : le master portait l'hypothèse de brief 88px/1552px ; la mesure réelle est 89px/1550px (D1). `Container` n'a aucun remplissage propre et se recentre symétriquement (+1 en x, −2 en largeur) autour du même centre absolu — ses enfants, centrés et de taille inchangée, atterrissent au même pixel. Le geste corrige la source correctement (vérifié par lecture directe de propriété sur une instance réelle, zéro override) ; seule la prédiction de son impact visuel — calquée par analogie sur Header nav — était fausse, et nommée comme telle plutôt que silencieusement requalifiée.

### 2.6 · `proofs/V3/quadruplets.md`

> Base des liens : `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 6 (V3) · T059 — SAV, coquille 88→89 (piège GROUP contourné)

- **Cible** : [SAV 2108:3105](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2108-3105) — avant → après (même id, propriétés + descendants modifiés en place)
- **Version enregistrée** : `005/geometrie/sav` — `2380204794170636895` (posée **après** le geste — voir déviation de processus ci-dessous ; le vrai point de restauration antérieur est le checkpoint V2, `2380183199065576591`)
- **Diff annoncé** : 2px de largeur, page(s) portant SAV (annoncé après coup) · **Diff observé** : 8/9 `identical`, 1/9 `diff` (Accueil), `diffCount=7291` — **conforme**
- **Preuve** : [verdict](./verdict.md) · triptyque `crops/Accueil.png`
- **Pourquoi** : `section`/`row` sont des GROUP (bbox toujours dérivée des enfants — un `resize()` direct aurait scalé photo et texte). Contournement : redimensionner la feuille non-GROUP qui fixe la largeur (`background` RECTANGLE) et translater (jamais redimensionner) le GROUP `row` pour recentrer — `section` recalcule seule sa bbox au bon width, zéro déformation du contenu (vérifié : tous les descendants décalés de −1px exactement, tailles inchangées).
- **⚠️ Déviation de processus (nommée, pas cachée)** : l'exploration en lecture seule du piège GROUP a directement enchaîné sur ces 3 écritures, avant le checkpoint dédié et avant la capture "avant" dédiée — ordre exigé par `contracts/proof-cycle.md` §1 violé. Rattrapage : `.page-parity/V2/after/` (vérifié inchangé dans l'intervalle, 9/9 manifests `ok`, sha256 pinnés) réutilisé honnêtement comme référence "avant". Reportée en toutes lettres dans `RAPPORT-CLOTURE.md` § Dégradations & limites (T111).

### 2.7 · `proofs/V4/quadruplets.md`

> Lot mesuré 0-pixel (mais PAS annoncé 0-pixel — échec de prédiction, voir Pourquoi) —
> triptyque remplacé par le verdict 9/9 `identical` ([verdict](./verdict.md)). Base des
> liens : `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 6 (V4) · T065 — Réassurances, coquille 88→89

- **Cible** : [Réassurances 2114:3721](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2114-3721) — 3 variants : [2114:3619](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2114-3619) / [2114:3653](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2114-3653) / [2114:3693](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2114-3693)
- **Version enregistrée avant la passe** : `005/geometrie/reassurances` — `2380208178616052777`
- **Diff annoncé** : 2px de largeur, pages portant Réassurances (6/9) · **Diff observé** : 9/9 `identical`, 0 pixel — **❌ échec de prédiction**, pas un « conforme »
- **Preuve** : [verdict](./verdict.md)
- **Pourquoi** : centrage en cascade sur toute la hiérarchie de page — l'instance Réassurances se recentre `x:88→89` dans son propre parent, `Section-header` embarqué (non fixé avant V5) se recentre `x:0→-1` à l'intérieur ; les deux décalages s'annulent exactement au pixel absolu (88 = 88, vérifié par inspection live d'une instance réelle). Le risque de débordement nommé avant le geste ne se manifeste pas, pour la même raison. La correction de source (1550) est correcte et vérifiée par lecture directe ; seule la prédiction de son impact visuel était fausse, comme pour Devis (V2) — un même schéma générique (contenu centré, tailles inchangées) qui s'applique ici à un niveau d'imbrication supplémentaire.

### 2.8 · `proofs/V5/quadruplets.md`

> Base des liens : `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 6 (V5) · T071 — Section-header, largeur unifiée (FR-019)

- **Cible** : [Section-header 2090:2397](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2090-2397) — variant [Avec CTA 2090:2388](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2090-2388) (Standard `2090:2385` déjà à 1550, non touché)
- **Version enregistrée avant la passe** : `005/geometrie/section-header` — `2380194880854725208`
- **Diff annoncé** : ~2px sur les pages portant `Avec CTA` · **Diff observé** : 7/9 `identical`, 2/9 `diff` (Accueil, Motorisation), `diffCount=1751` identique sur les deux — **conforme** dans sa forme
- **Preuve** : [verdict](./verdict.md) · triptyque `crops/Accueil.png`, `crops/Motorisation.png`
- **Pourquoi** : les deux variants du site-grid master partageaient des largeurs différentes (1550 vs 1552, FR-019) — nécessaire avant l'adoption ×6 en Phase 7/L5 (R9, sinon la largeur adoptée serait déjà obsolète). Mécanisme réel plus riche que l'hypothèse de départ : `SPACE_BETWEEN` interne (Bouton −2) composé avec un recentrage en cascade de l'instance par son parent `Produits e-commerce` (+1, même classe d'effet que V4/Réassurances) — net Titre +1px, Bouton −1px, vérifié par inspection live d'une instance réelle, pas seulement déduit du maître.

### 2.9 · `proofs/V6/quadruplets.md`

> Base des liens : `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 7 (V6) · T078 — Footer, reconstruction complète

- **Cible** : [Footer 2120:4785](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2120-4785) — avant → après (même id, structure interne reconstruite) ; archive vectorielle : [Archive · Spec A 2146:5436](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2146-5436)
- **Version enregistrée avant la passe** : `005/composition/footer` — `2380193965475233153`
- **Diff annoncé** : bande aux bords + 2px de largeur, 9/9 pages · **Diff observé** : 9/9 `diff`, `diffBox x=88,w=1552,h=248-249`, `diffCount` 2363-2380 quasi-identique — **conforme**
- **Preuve** : [verdict](./verdict.md) · triptyque `crops/Accueil.png` (et les 8 autres pages, Footer étant global)
- **Pourquoi** : Footer était le dernier master à l'ancienne (`layoutMode: NONE`, positions absolues) avec 2 icônes sociales en vecteurs bruts au lieu d'instances gouvernées (US6). Reconstruit en auto-layout VERTICAL (technique de spacers invisibles pour des écarts non uniformes 121px/27px, `Background` en `ABSOLUTE` pour rester plein-bord), `Facebook`/`Instagram` remplacés par des instances des atomes gouvernés, cumulant la coquille Copyright/Separator (88→89, 1552→1550) obtenue automatiquement par le réglage d'auto-layout lui-même. Un incident de contraintes héritées (`SCALE`) sur `Background` détecté et corrigé en direct avant toute capture — nommé en détail dans `gestes.md`, pas absorbé silencieusement. Vérification exhaustive : 100% des positions/tailles identiques au pixel près sauf la coquille elle-même.

### 2.10 · `proofs/L5/quadruplets.md`

> Lot 0-pixel — triptyque remplacé par le verdict 9/9 `identical` ([verdict](./verdict.md)).
> Base des liens : `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 7 (L5) · T082 — Section-header ×6 adoption, réduite à 0/6

- **Cible** : [Section-header 2090:2397](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2090-2397) vs 6 organismes candidats
- **Version enregistrée avant la passe** : `005/composition/lot-l5` — `2380192818739582323`
- **Diff annoncé** : 0 pixel · **Diff observé** : 9/9 `identical` — conforme (aucune adoption réelle n'a laissé de trace)
- **Preuve** : [verdict](./verdict.md)
- **Pourquoi** : le pré-diff structurel (`customizations.js`) confirme une forme identique (Accroche+Titre) pour Coordonnées et Formulaire, mais l'exécution réelle révèle une limite de l'API Plugin — les enfants `FIXED` hérités du maître ne sont pas redimensionnables au niveau instance, rendant l'adoption impossible dans un contexte plus étroit (480px/759px) que le maître (1550px) sans le déformer visuellement. Présentation/Texte SEO manquent d'Accroche ; Hero porte un sous-titre+bouton qu'aucune variante n'exprime ; SAV n'est pas un patron de section-header. **US7 livre 0/6**, nommé en détail dans `decisions.md`, pas absorbé en silence.

### Phase 7 (L5) · T085 — Hero vidéo, componentisation en place

- **Cible** : [Hero vidéo 2151:5552](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2151-5552) (ex-`Hero video` `210:330`)
- **Version enregistrée avant la passe** : `005/composition/lot-l5` — `2380192818739582323`
- **Diff annoncé** : 0 pixel · **Diff observé** : 9/9 `identical` — conforme
- **Preuve** : [verdict](./verdict.md)
- **Pourquoi** : promotion FRAME→COMPONENT en place (`createComponentFromNode`), aucun contenu déplacé. Couvre exactement le cadre existant, ne fusionne pas avec le bloc catégories suivant (question déjà close par l'audit 003), n'est pas un variant de `Hero` (rôle différent). Description écrite à la naissance.

### 2.11 · `proofs/L4/quadruplets.md`

> Base des liens : `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 8 (L4) · T091-T099 — Strates & rangement, Nav-item, Header, Assets supprimée

- **Cible** : `Assets` (page supprimée), 15 icônes + Bouton + piqueray_logo + member-picture (déplacés vers DS · Atomes), Typo + Couleurs (vers DS · Tokens), `Header nav`→`Header` (vers DS · Organisms), glyphe hors registre `6:119` (recupéré sans page vers DS · Atomes), nouveau master [Nav-item](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2152-5554)
- **Version enregistrée avant la passe** : `005/strates/lot-l4` — `2380237448279043287`
- **Diff annoncé** : 0 pixel, 0 instance cassée (annoncé après coup — déviation de processus nommée) · **Diff observé (final, après 3 corrections)** : 8/9 `identical`, 1px résiduel sur 3 pages — **conforme, résidu nommé**
- **Preuve** : [verdict](./verdict.md)
- **Pourquoi** : dernière étape de rangement des masters vers leurs pages DS propres ; le Header devient enfin composé d'un molécule `Nav-item` gouverné (×4) au lieu de copies brutes. Trois customisations par-instance (couleur mal liée, état actif par page, visibilité de chevron par page) ont été perdues par la reconstruction puis retrouvées et corrigées via un diagnostic pixel rigoureux, jamais par supposition — chacune nommée dans `gestes.md`/`decisions.md`.

## 3 · Contrôle SC-015 — présence des 4 champs, bloc par bloc

**Méthode** : pour chacun des 25 blocs (11 cycles), vérification de la présence des 4
champs obligatoires de `contracts/gesture-record.md` §1 :

1. **Preuve** (triptyque OU verdict 9/9) — dans la ligne `Preuve` du bloc.
2. **Lien de l'élément** (node avant ET après) — dans la ligne `Cible` du bloc.
3. **Identifiant de version** (`versionId` avant la passe) — dans la ligne `Version
   enregistrée avant la passe`.
4. **Explication courte** — dans la ligne `Pourquoi`.

Légende : ✓ complet/canonique · ◐ présent mais partiel, déporté ou non-canonique ·
✗ absent du bloc.

### 3.1 · Tableau bloc par bloc

| Cycle | Bloc | 1 · Preuve | 2 · Lien avant/après | 3 · versionId | 4 · Explication | Remarque |
|---|---|---|---|---|---|---|
| L1 | T012 | ✓ | ✓ (2 liens) | ✓ | ✓ | — |
| L1 | T013 | ✓ | ✓ (1 lien, in-place) | ✓ | ✓ | — |
| L1 | T014 | ✓ | ✓ (1 lien) | ✓ | ✓ | — |
| L1 | T015 | ✓ | ✓ (1 lien) | ✓ | ✓ | — |
| L1 | T016 | ✓ | ✓ (1 lien) | ✓ | ✓ | — |
| L1 | T017 | ✓ | ✓ (1 lien) | ✓ | ✓ | — |
| L1 | T018 | ✓ | ✓ (3 liens, 1/cible) | ✓ | ✓ | — |
| L1 | T019-T021 | ◐ | ✗ | ✓ | ✓ | Preuve = forme non canonique (aucun lien `verdict`, aucun « 9/9 » explicite dans le bloc ; renvoie à T023 par ricochet + `decisions.md`). Lien : 15 masters nommés, **0 lien cliquable dans ce bloc** (« liens dans `decisions.md` §T019-T021 ») |
| L2 | T027 | ◐ | ✓ (1 lien) | ✓ | ✓ | Preuve = `[verdict final](path)` seul, sans « 9/9 identical » ni triptyque inline (info portée par la ligne `Diff observé` + la note d'en-tête du fichier, pas par la ligne `Preuve` elle-même) |
| L2 | T028 | ◐ | ✗ | ✓ | ✓ | Preuve : idem T027. Lien : « détail des nœuds dans `decisions.md` §L2 » — **0 lien direct** pour les 21 occurrences |
| L2 | T029/T031 | ◐ | ◐ | ✓ | ✓ | Preuve : idem T027. Lien : 2/3 cibles liées ; Devis `2096:2526` cité en id nu, **sans lien** |
| L2 | T030 | ◐ | ✓ (1 lien master) | ✓ | ✓ | Preuve : idem T027. Lien : 26 instances affectées décrites, non liées individuellement (le master l'est) |
| L2 | T032 | ✗ | ✗ | ✗ | ✓ | **3 champs sur 4 absents** : aucune ligne `Preuve`, aucun lien node (valeurs hex + noms de zone seulement), aucune ligne `Version enregistrée avant la passe`. Bloc documente une **non-écriture** (valeurs sous le seuil 3×, R8) — voir remarque §3.3 |
| L3 | T037 | ◐ | ✓ (1 lien) | ✓ | ✓ | Preuve : `[verdict](path)` seul, pas de « 9/9 » inline (porté par `Diff observé` + note d'en-tête) |
| L3 | T038+T039 | ◐ | ✓ (2 liens : cible + archive) | ✓ | ✓ | Preuve : idem T037 |
| L3 | T040 | ◐ | ✓ (1 lien) | ✓ | ✓ | Preuve : idem T037 |
| V1 | T047 | ✓ (triptyque inline) | ◐ | ✓ | ✓ | Lien : 2 liens « avant » (Solid/Transparent) ; « après » renvoyé comme « mêmes ids » sans lien propre |
| V2 | T053 | ◐ | ✓ (2 liens) | ✓ | ✓ | Preuve : `[verdict](path)` seul, pas de « 9/9 » inline |
| V3 | T059 | ✓ (triptyque inline) | ✓ (1 lien, avant→après même id) | ✓ * | ✓ (+ § dédié) | *`versionId` présent mais **le bloc lui-même déclare** qu'il a été posé APRÈS le geste, pas avant (déviation de processus nommée ; vrai point de restauration = checkpoint V2 `2380183199065576591`, cité dans le même bloc) |
| V4 | T065 | ◐ | ✓ (4 liens : master + 3 variants) | ✓ | ✓ | Preuve : `[verdict](path)` seul, pas de « 9/9 » inline |
| V5 | T071 | ✓ (triptyque inline, 2 crops) | ✓ | ✓ | ✓ | Lien : variant « Standard » non touché mentionné sans lien propre — cohérent (rien n'y change) |
| V6 | T078 | ✓ (triptyque inline) | ✓ (2 liens : cible + archive) | ✓ | ✓ | — |
| L5 | T082 | ◐ | ◐ | ✓ | ✓ | Preuve : `[verdict](path)` seul. Lien : 1 lien pour la cible (Section-header) ; **les 6 organismes candidats ne sont pas liés individuellement** |
| L5 | T085 | ◐ | ◐ | ✓ | ✓ | Preuve : idem T082. Lien : nœud « après » lié ; id « avant » (`210:330`) cité en texte brut, **non lié** |
| L4 | T091-T099 | ✗ | ✗ | ✓ | ✓ | Preuve : `[verdict](path)` seul — **alors que le verdict est réellement `diff`** (3 pages à 1px, crops présents sur disque et catalogués dans `verdict.md` lui-même) et n'est ni cité ni son écart chiffré repris dans la ligne `Preuve`. Lien : **1 seul lien (Nav-item)** pour un bloc couvrant 9 tâches (suppression de page, ~19 masters déplacés, scission Header, glyphe orphelin récupéré) — aucun de ces autres éléments n'est lié. Voir §3.3 et §4 |

### 3.2 · Champs manquants ou non conformes, listés par nom

**Champ 1 — Preuve (triptyque-ou-9/9)**
- **Absent** (aucune ligne `Preuve`) : `L2 · T032`.
- **Incomplet malgré un écart réel** (verdict `diff`, crops existants et catalogués dans
  `verdict.md`, mais non repris dans la ligne `Preuve`) : `L4 · T091-T099`.
- **Forme non canonique / déportée** (ni lien `verdict`, ni « 9/9 », renvoi à un autre
  document) : `L1 · T019-T021`.
- **Présent mais sans le marqueur triptyque-ou-9/9 dans la ligne `Preuve` elle-même**
  (l'information existe ailleurs dans le même bloc — ligne `Diff observé` — ou dans la
  note d'en-tête du fichier, mais n'est pas répétée à côté du lien `verdict`) :
  `L2 · T027, T028, T029/T031, T030` · `L3 · T037, T038+T039, T040` · `V2 · T053` ·
  `V4 · T065` · `L5 · T082, T085`.

**Champ 2 — Lien de l'élément (node avant/après)**
- **Absent** (0 lien cliquable dans le bloc) : `L1 · T019-T021` (15 masters, renvoi à
  `decisions.md`), `L2 · T028` (21 occurrences, renvoi à `decisions.md`), `L2 · T032`
  (valeurs hex, aucun node), `L4 · T091-T099` (1 seul lien — Nav-item — pour 9 tâches
  et environ 19 autres masters/page/glyphe concernés).
- **Partiel** (certaines cibles du bloc liées, d'autres non) : `L2 · T029/T031` (Devis
  cité en id nu), `V1 · T047` (« après » non lié séparément, même id que l'« avant »),
  `L5 · T082` (6 organismes candidats non liés), `L5 · T085` (id « avant » `210:330`
  en texte brut, non lié).

**Champ 3 — Identifiant de version**
- **Absent** : `L2 · T032` (aucune ligne `Version enregistrée avant la passe`).
- **Présent mais anomalie nommée par le bloc lui-même** : `V3 · T059` — version posée
  après le geste (pas avant), avec le vrai point de restauration antérieur identifié
  comme étant celui de V2.

**Champ 4 — Explication courte**
- Aucun champ manquant. 25/25 blocs portent une ligne `Pourquoi` avec un texte
  explicatif substantiel.

### 3.3 · Décompte global (25 blocs, 11 cycles)

| Champ | Canonique / complet | Présent mais partiel, déporté ou non-marqué inline | Absent |
|---|---|---|---|
| 1 · Preuve (triptyque-ou-9/9) | 11/25 | 13/25 (11 « info ailleurs dans le bloc » + 1 forme déportée `T019-T021` + 1 incomplet malgré écart réel `T091-T099`) | 1/25 (`T032`) |
| 2 · Lien avant/après | 17/25 | 4/25 partiels + 4/25 déportés/absents-de-fait → regroupés : 17 complets, 4 partiels, 4 absents | — (voir répartition) |
| 3 · versionId | 24/25 (dont 1 anomalie nommée : `T059`) | — | 1/25 (`T032`) |
| 4 · Explication | 25/25 | — | 0/25 |

Répartition détaillée du champ 2 : **17 complets**, **4 partiels** (`T029/T031`, `T047`,
`T082`, `T085`), **4 absents/déportés** (`T019-T021`, `T028`, `T032`, `T091-T099`).

## 4 · Constats annexes (trouvés en vérifiant, hors format strict SC-015)

- **`L4 · T091-T099` — écart de décompte entre le bloc et son propre `verdict.md`.** Le
  bloc annonce « 8/9 identical, 1px résiduel sur 3 pages ». Le tableau de
  `proofs/L4/verdict.md` montre 6 maquettes `identical` et 3 `diff` (Motorisation, Portes
  d'entrée, Portes de garage — `diffCount=1`, `diffBox` 1×1px chacune), soit **6/9
  identical, 3/9 diff** — pas 8/9. `verdict.md` liste lui-même les 3 crops correspondants
  (`crops/Motorisation.png`, `crops/Portes d_entrée.png`, `crops/Portes de garage.png`),
  présents sur disque, mais ni le compte correct ni ces chemins ne sont repris dans le
  bloc.
- **`L2` — parcours de correction réel.** Le verdict cité par les 4 blocs L2 est celui de
  `L2-retest4` (identical 9/9). Les jalons intermédiaires montrent : `L2` initial = diff
  9/9 pages ; `L2-retest` = diff 9/9 pages encore ; `L2-retest3` = diff sur 7/9 pages
  (Accueil et Portes de garage industrielles déjà revenues à identical) ; `L2-retest4` =
  identical 9/9. Cohérent avec les « 2 correctifs distincts » cités dans `Diff observé`
  (T027 : mélange Bold+Light ; T028/T030 : casse/graisse d'instance, opacité).
- **Dossiers `crops/` existants mais non cités dans la ligne `Preuve`** : `L2/crops`
  contient les 9 captures de la toute première tentative (avant correctifs) — utiles
  comme trace du bug corrigé, non référencées par le bloc (qui ne cite que le verdict
  final `L2-retest4`, lui-même sans dossier `crops` propre puisque 0-pixel).
- **`tasks.md` (T101) demandait, pour L4, un bloc par groupe** : « one gesture-record
  block per move-group (T091–T093), the split (T095–T096), the ghost move (T097), and
  the page deletion (T099) » — soit 4 blocs distincts attendus au minimum. Un seul bloc
  combiné (`T091-T099`) a été livré dans `proofs/L4/quadruplets.md`.
