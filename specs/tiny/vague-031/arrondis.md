# Journal — Arrondis : un seul rayon, 4 px, sur tout le DS (Figma → jeton → 12 contrats → Odoo)

**Date** : 2026-09-09. **Décision owner** : après deux planches (`031 · 26` home, `031 · 27` réalisations + formulaire) et un
premier passage à l'échelle 4 / 8, l'owner a tranché « 8 c'est trop, tout en 4 ». Résultat : **un seul rayon dans le DS**,
`radius/4`, sur tout ce qui a des coins. Exceptions volontaires : le bouton **Link** garde `radius/32` (pas de fond, le rayon
ne se voit que sur l'anneau de focus), les avatars `radius/20` et le badge de vérification des avis `radius/8` (cercles).
**Rayons constants sur les quatre écrans** (owner, même jour) — la proportion dit d'ailleurs l'inverse de l'intuition
« plus petit en mobile » : 8 px pèse 2,3 % d'une carte mobile et 0,7 % du panneau SAV desktop.

## Ce qui a été posé, dans l'ordre §VIII / §X

1. **Planches** (pages séparées, cadre auto-layout, jamais SECTION) : instances des sets 031 avec surcharges de rayon,
   colonnes « Aujourd'hui » / « Proposé ». Validées par l'owner, puis **supprimées** après pose à la source.
2. **Canevas** (versions nommées avant/après à chaque geste, empreintes FNV-1a des exports à 0,5× sur masters + instances
   de premier niveau, comparées avant/après, aucune taille modifiée) :
   - variable `radius/4` créée dans Primitives (scope CORNER_RADIUS) ;
   - liée sur : Bouton (24 variantes hors Link), CarteCategorie (4), CarteReassurance (2), SAV `wrapper` + `imgGroup` (4),
     Formulaire `form` (4), ProductCard racine + `Tuile` (2), ReviewCard (4), AvisGoogle `resume` (4), Realisation (2),
     Input / Textarea / Select candidats v2 (5) ; `clipsContent` posé là où une photo touche le bord ;
   - 288 + 129 + 137 + 40 cibles comparées, tout ce qui devait changer a changé.
3. **Dépôt** : `tokens/primitives.tokens.json` +`radius.4` (minté from-dump, description datée) ; contrats en MINEUR :
   `ds.button` 2.5.0, `ds.carte-categorie` 3.1.0, `ds.sav` 2.3.0, `ds.carte` 3.2.0, `ds.realisation` 2.1.0,
   `ds.formulaire` 3.1.0, `ds.input` / `ds.textarea` / `ds.select` 2.1.0 (le littéral `0px` invisible devient le token),
   `ds.product-card` 4.1.0, `ds.review-card` 4.3.0, `ds.google-reviews` 3.2.0. Rognage = `declared.overflow-x/-y: hidden`.
4. **Miroirs Odoo** : épingles dans 14 `*.authoring.json` + `figma-panels.json`, versions dans `components.xml`,
   `version_guard.js`, `scan-saved-versions.ts`, fixture `version-drift`, `inputs.lock.json --repin` (digest
   `e75c4fdb…`), puis le digest recopié dans les 16 blocs de `components.xml`.
5. **Chaîne** : `build` → `figma:plan` → `catalog` → `emitters:check` → `golden:update` → engine receipt → repin →
   clichés Figma rafraîchis (composants + jetons) → `parity` **0 écart neuf** → `geometry:gate` 0 invisible →
   `odoo:authoring:check` / `odoo:module:check` 23/23 / `figma-links` / `tsc` verts.
6. **Odoo** : 3ᵉ instance jetable `piqueray-odoo-arrondis` (8115/8116, seed restauré, `-u piqueray_ds`, 9 pages
   recomposées `COMPOSE_OK`). Rayons calculés sur la home : boutons 4, flèches 4, cartes catégorie / réassurance /
   produit / avis 4, Link 32. Versions servies : sav 2.3.0, google-reviews 3.2.0.

## Pièges payés (chacun vaut pour la prochaine vague)

- **Écraser une surcharge de dimension d'instance en touchant le master.** Après la liaison de rayon + `clipsContent`
  sur CarteCategorie, les 3 cartes du master Wide de CategoriesPrincipales sont passées de 474×267 (FILL) à 743×418
  (taille du master). Le patron des vues est « cartes visibles en FILL, carte masquée en FIXED » ; ma « réparation » en
  FIXED 474×267 a cassé la règle « 2 cartes → 2 colonnes » dans les vues Accueil et Portes de garage Wide (vu par
  l'owner). Remis : master 3 cartes FILL 474×267, vues 2 cartes FILL 743×418, masquée FIXED 474×267.
  **Règle** : après tout geste sur un master composé, relire les dimensions des instances dans les vues, pas seulement
  les empreintes des masters.
- **Figma ne recalcule la mise en page qu'après la fin du script** : `resize()` juste après un passage FILL→FIXED lit
  des valeurs transitoires (largeur 1, hauteur 126 558). Un geste de dimension = un appel ; la relecture = l'appel suivant.
- **Une instance qui porte une surcharge de rayon ne suit pas le master** : 20 ReviewCard du master Avis Google étaient
  liées à `radius/8` à l'instance. Détecté par l'empreinte (« 20 inchangées »), re-liées à `radius/4`.
- **`overflow` n'est pas un canal déclaré du schéma** ; seuls `overflow-x` / `overflow-y` le sont (refus nommé au build).
- **`figma_take_screenshot` / `figma_capture_screenshot` rendent 149 octets sur un master dans une SECTION** ; une
  instance posée dans une vue (cadre) s'exporte. Vérifier sur la vue, pas sur le master.
- **Rafraîchir les clichés de parité sans REST** : le script `parity/extract-figma.plugin.js` tourne dans le bac à sable,
  et le JSON part par `fetch` vers le receveur 9230 (`POST /json?name=`), puis `mv` vers `parity/snapshots/`.
- **Les vues Figma en cache doivent être réexportées après les gestes du jour** avant toute mesure (les 36 vues du
  09-08 donnaient Δh −104 à −202 px, entièrement expliqués par les gestes du 09-09 : CTA en Link, photo 248).
- **Seed sur un volume neuf** : `restore-seed.sh` échoue au `chown` tant que `…/Odoo/filestore` n'existe pas ; `mkdir -p`
  en root puis relancer.
- **Worktree partagé** : deux autres sessions écrivaient dans le même worktree (accessibilité, édition Odoo). Coordination
  par message, `npm run eval` gardé pour leur repos. Trouvé au passage : `reassurances.authoring.json` épinglait
  `ds.reassurances@2.2.0` et `ds.button@2.4.0` alors que le dépôt était à 2.2.1 / 2.4.1 — périmé AVANT la vague.

## Mesure des pages (instrument 037, instance 8115, vues réexportées le 09-09)

- **Hauteurs** : identiques section par section sur la home (Δh 0 partout sauf Avis Google +10), Δh ≤ 10 sur 24 des 36
  rapports. Les Δh 30–56 px « dès Réassurances » au 1200 et « dès Catégories » sur Motorisation sont des écarts de bloc
  connus (037 §6), pas des rayons.
- **Pixels : 28 rouges / 36, de 5,9 à 22,8 %, à structure ÉGALE — et ce n'est pas la vague.** Le triptyque montre un
  écart sur CHAQUE glyphe de texte (Odoo et Figma diffèrent au rendu des lettres, pas au placement). L'instance 037
  (8109, blocs d'AVANT la vague) donne le même 18,6 % sur la même vue. Cause non élucidée ce jour ; candidats : rendu
  texte de l'export Figma du jour vs celui du 09-08, ou un changement de rendu côté Odoo posé par une autre session.
  **À trancher avant de relire ces scores comme des défauts de composant.**

## Reste ouvert

- L'ancienne carte `Carte / Disposition=Categorie` (2063:1622, hors ancre de `ds.carte`) n'a pas de rayon : à traiter
  si elle est encore une source.
- Les atomes DS Input / Textarea / Select portent le rayon dans leur contrat, mais leurs masters DS (hors candidats v2 de
  la planche 031 · 21) suivront avec la vague Formulaire v2. Checkbox reste carrée (contrat `0px`).
- Le creux à la jonction cadre blanc / photo du SAV (rayon uniforme sur les deux blocs, limite A11 du rayon par coin).
- `npm run eval` : lancé en fin de vague, voir le complément docs/16.
