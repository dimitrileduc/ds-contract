# Journal de section — `ds.hero` (Hero image) v2 (vague 031 suite, page « Portes de garage »)

**Date** : 2026-09-07. Fait avec l'owner (candidat Figma), agent ensuite (contrat + Odoo).

## Étape 0 — audit de la source (lecture seule)

- Master `Hero` **2111:3382**, COMPONENT simple, « DS · Organisms », 1728×640 (hauteur liée `size/hero/root`).
  Description « generated from contract ds.hero v1.6.0 » (contrat en 2.0.0 : description en retard).
- Propriétés : `Titre` (TEXT), `SousTitre` (TEXT), `SousTitre2` (BOOLEAN → visibilité du sous-titre).
- Structure : `Background` (IMAGE absolu, STRETCH) · `VoileNavigation` (dégradé 2 arrêts, absolu) · `blocTexte`
  (colonne, FILL/HUG) › `Titres` (rangée, pad 96/89/48/89 liés, gap 32, **dégradé 2 arrêts en fond**, align
  bas) › `colGauche` (colonne, **gap 16 brut**) › `Titre direct` › `Titre` (54/68 Bold, **sans style**) +
  `sousTitre` (riche Regular+Bold, 24/32, **sans style**) · `Bouton` (Outline blanc, « Demander un devis gratuit »,
  icône droite).
- **10 usages**, tous FILL/FIXED 1728×640, tous avec leur propre photo (surcharge d'image), aucun détaché, aucun
  calque masqué hors l'icône gauche du bouton (normal) : 8 pages « Pages », la démo sans sous-titre (DS), la
  référence « Portes de garage » sur 031.

### Défauts de source
| # | Défaut |
|---|---|
| 1 | `Titre` sans style de texte (54 Bold brut) ; `sousTitre` sans style (24/32, riche). |
| 2 | `colGauche` gap 16 brut (la variable `space/16` existe). |
| 3 | Deux voiles trop faibles pour une photo claire (VoileNavigation 2 arrêts + dégradé du bloc titre 0→50 %). |
| 4 | Aucune variante par écran. |
| 5 | Description du master en retard (v1.6.0 vs contrat 2.0.0). |

## Candidat v2 sur le canevas (2026-09-07)

- Version nommée avant : « 031 — avant candidat Hero image v2 (2026-09-07) » (id 2396406255840620448).
- Section **2770:20915** « 031 · HERO IMAGE — 4 variantes (candidat v2) », page 031. Set **2770:20976**
  (clé `18e85e203a…`), variantes 2770:20916 / 20931 / 20946 / 20961, mode Responsive posé par variante.
  **Original intact** (master 1728×383… 1728×640, titre sans style, pad 89, 3 props, 10 instances — relevé après).
- Instance de test 2770:20979 ; témoins-instances par mode 2770:20996 / 21011 / 21026 / 21041.

### Décisions owner (mots : « restons sur B c mieux centré », « B » pour le voile)
1. **Mobile / Tablette = modèle HeroVideo** : texte centré, marges 64 haut/bas, gouttières 24 / 48, bouton
   pleine largeur **absolu en pied** (64 du bas), le dégradé du bloc titre retiré. Desktop / Wide : texte en bas à
   gauche, bouton à droite (source), gouttières 56 / 89, pad haut 96, bas 48.
2. **Voile = « B »** : fond plein lié au jeton DS **`color/noir-voile-55`** + dégradé bas (noir, alpha 0 de 0 à 30 %,
   0,80 à 100 %) sur un cadre `Voile` absolu ; `VoileNavigation` = celui du HeroVideo du même mode. Choisi sur la
   photo claire de « Portes de garage » contre « photo assombrie 45 % » (A). Deux tours de duel avant (1→6),
   nettoyés du canevas après décision.
3. Titre → **H1** (32/40 · 32/40 · 40/50 · 54/68 SemiBold ; était 54 Bold brut — graisse change). Sous-titre →
   body (16/24 Regular sous 992, 18/27 Medium au-dessus ; gras conservé par plage ; était 24/32 — baisse en Wide).
4. `colGauche` gap lié `space/16`.

| | Mobile 390 | Tablette 834 | Desktop 1200 | Wide 1728 |
|---|---|---|---|---|
| bloc texte | centré, h 640 | centré, h 640 | bas, y 349 | bas, y 358 |
| titre | 32/40, 2 l. | 32/40, 1 l. | 40/50 | 54/68 |
| sous-titre | 16/24 R, 5 l. | 16/24 R, 3 l. | 18/27 M, 3 l. | 18/27 M, 2 l. |
| bouton | 342 (fill, pied) | 738 (fill, pied) | 354 HUG | 386 HUG |

### Entrées préparées pour l'agent
- Relevé : `.page-parity/vague-031/dumps-accordion/Hero.live.dump.json` (dump v1.8 ; 12 dégradations attendues :
  paints IMAGE / dégradés non portés par le dump v1 — le voile et VoileNavigation se lisent au canevas).
- Proposition : `.page-parity/vague-031/proposals/Hero/` — 44 notes, 0 valeur non liée ; à renommer : largeur/hauteur
  du `Voile` (témoins, part absolue `inset 0`), sous-titre → `typography.body.*`, H1 reconnu.
- Planches (instances) : `.page-parity/vague-031/planches-hero/Hero-{390,834,1200,1728}.png` (×640).
- **Littéraux à inscrire au registre** (`contracts/named-literals.registry.json`) : le dégradé du voile bas
  (`linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,.8) 100%)`) et les dégradés
  `VoileNavigation` du HeroVideo par mode (déjà portés par `hero-video.contract.json` — réutiliser les mêmes entrées).

### Pièges du jour (recette)
- Après passage d'une rangée en colonne, remettre `layoutSizingVertical = 'HUG'` sur le cadre ET ses enfants
  (colGauche était passé FILL/FILL → 6988 px de haut).
- Port 9230 repris par un serveur figma-console d'une autre session en cours de journée : `POST` reçu par le mauvais
  process (404). Repli : retourner le dump par le résultat de `figma_execute` (19 Ko) et l'écrire à la main.
- Le voile se juge sur une photo CLAIRE (chaque page a la sienne), jamais sur la photo de démo du master.

## Bloqué / à trancher
- Grand chantier suivant : promotion des 10 usages (8 pages) vers le set v2, avec leurs photos (surcharges).

## Contrat 3.0.0 + Odoo (agent, 2026-09-07)

**Entrées** : dump v1.8 du set candidat `2770:20976` (clé `18e85e203a80f1190745ae89352759020b6cbaa0`, 12 dégradations attendues :
paints IMAGE / dégradés non portés), proposition `.page-parity/vague-031/proposals/Hero/` (44 notes, 0 valeur non liée),
planches `planches-hero/Hero-{390,834,1200,1728}.png` (×640) + `Hero-photo-*.png`. **Aucun accès Figma, aucune écriture
canevas.** Enfant `ds.button` 2.3.0 réutilisé tel quel. Instance : `piqueray-odoo-pilote` (8087) seulement.

### Classement de chaque note de `figma-proposals.md`

| Note de l'extraction | Classement | Ce qui a été fait |
|---|---|---|
| `semantics.element` par défaut `div` | **décision** | `section` — le modèle HeroVideo le pose ainsi, l'hôte Odoo est déjà `<section>` (2.0.0 disait `div`) |
| `root` : auto-layout varie par `Presentation` → `layoutByProp` (2 overrides `align: end`) | adopté | racine `align: stretch` en base (voir déviation 1) + `end` Desktop/Wide |
| `Voile` : opacité 0,549 « rides » la variable `color/noir-voile-55`, liaison proposée à pleine opacité | **adopté sans déviation** | le jeton `color.noir-voile-55` vaut `#0000008C` : l'alpha est DANS le jeton, la note est une limite de l'extraction |
| `Voile` largeur FIXED 390/834/1200/1728, hauteur 640 → 5 mints `imported.hero.voile.*` | **supprimés (témoins)** | part absolue `inset 0` |
| `Titres` padding-inline fonction de `presentation` (24/48/56/89) → `tokensByProp` | adopté | `space.24` base + tablette/desktop/wide |
| `Titres` : padding haut/bas différents, « padding-block non représentable » | adopté autrement | `padding-top` + `padding-bottom` (64/64 base ; 96/48 Desktop/Wide), tous liés au dump |
| `Titres` itemSpacing lié dans 2/4 variantes (Mobile/Tablette) — non proposé | **décision owner** | `gap: space.24` base, `space.32` Desktop/Wide ; le 32 brut du set → « À corriger à la source » |
| `Titres` : layout varie par `Presentation` (colonne centrée → rangée bas-gauche) | adopté | `layoutByProp` desktop/wide `row / start / end` |
| `Titre` : typographie variable (32/40/54, SemiBold), 4+4+1+1 mints | **renommé** | style **H1** reconnu sur Mobile/Tablette (`style: "H1"` au dump) → `typography.h1.{family,size,weight,line-height}` ; Desktop/Wide n'ont pas le marqueur de style au dump (mêmes valeurs) |
| `sousTitre` : typographie variable (16/18, Medium), 4+4+1+1 mints `imported.hero.bloc-texte-…sous-titre.*` | **renommé** (décision owner) | `typography.body.size` / `line-height` / **`typography.body.weight`** (Regular ×2 / Medium ×2 par écran — le mint uniforme 500 était faux sous 992) ; `letter-spacing 0` non porté (défaut UA) |
| `Bouton` lié à `ds.button` par clé de set `e6fa6786…` | adopté | props canonisées : `outlineBlanc`, `iconLeft false`, `iconRight true`, `arrow-right` |
| `Bouton` : prop `State` non mappée | adopté (ignoré) | `State=Default`, pas un canal de composition |
| racine largeur FIXED → 4 mints `imported.hero.root.width.*` | **supprimés (témoins)** | `width: fill` + `referenceWidth 1728` |
| `titre` proposé `text`, défaut « Portes de garage industrielles » | **décision** | reste `rich-text` (marks `strong`) lié TEXT `Titre`, **défaut sans gras** (candidat uniforme SemiBold ; le gras 2.0.0 venait de l'ancien master) |
| `soustitre` proposé `text` | adopté, renommé `sousTitre` | `rich-text` lié TEXT `SousTitre`, 2 plages grasses, `visibleWhen sousTitre2` (BOOLEAN, comme 2.0.0) |
| `Titre direct` (colonne, gap `space.8`, enfant unique) | **déviation nommée** | aplati, `Titre` directement sous `colGauche` (comme 2.0.0, Texte SEO, Presentation) — DOM Odoo inchangé |
| racine `gap: space.10` | adopté | lié sur les 4 variantes |

**Aucun jeton minté** : tout existait (`typography.h1/body.*`, `space.10/16/24/32/48/56/64/89/96`, `size.hero.root`,
`color.noir-voile-55`, `color.blanc`, `font.weight.bold`, `font.family.montserrat`). Ancres → set `2770:20976`, `dumpedAt 2026-09-07`.
Version **2.0.0 → 3.0.0** (MAJEUR : ancres COMPONENT → SET).

### Les voiles (décision owner « B »)

- `Voile` (NOUVELLE part, entre `Background` et `VoileNavigation`, absolue inset 0, z 1) : `background-color: {color.noir-voile-55}` +
  `background-image: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.8) 100%)` — littéral gouverné,
  **nouvelle entrée** du registre (`/anatomy/root/parts/Voile/literals/background-image`, reçu `hero-031-veils`).
- `VoileNavigation` : valeurs du HeroVideo par mode, reprises **à l'octet** depuis `hero-video.contract.json` / ses entrées de
  registre (Mobile/Tablette en base ; Desktop/Wide en `literalsByProp`). Le registre apparie par `contractId + pointeur`
  (`extract/geometry-gate/gate.ts`, `siteKey`) : les entrées HeroVideo ne couvrent pas `ds.hero` — **3 entrées `ds.hero`** (base
  mise à jour + desktop + wide), même valeur, même reçu cité.
- Le voile du bloc `Titres` (2 arrêts, 0 → 0,5 à 60 %) est **retiré** ; son entrée de registre (`…/Titres/literals/background-image`,
  2026-08-04) est **supprimée** — la porte refuse une entrée orpheline (`registry-entry-orphaned`). Liste fermée : c'est une
  décision consignée ici, pas un ajout silencieux.
- Voile vérifié par luminance de bande (`bands.mjs`, photo Figma injectée) : Δ ≤ 0,5 sur toutes les bandes sans texte aux 4 largeurs.

### Ce que le contrat porte (par mode)

| | Mobile (base) | Tablette | Desktop | Wide |
|---|---|---|---|---|
| racine | row, `align: stretch`, h 640, gap 10 | idem | `align: end` | `align: end` |
| Titres | colonne, centré/centré, pad 64 / 24 / 64 / 24, gap 24, grow | pad-inline 48 | rangée, start/end, pad 96 / 56 / 48 / 56, gap 32 | pad 96 / 89 / 48 / 89, gap 32 |
| Titre (H1, blanc, `h1`) | 32/40 SemiBold, centré | idem | 40/50, gauche | 54/68, gauche |
| sousTitre (body, blanc, gras 700) | 16/24 **Regular**, centré | idem | 18/27 **Medium**, gauche | idem |
| Bouton (`ds.button` outlineBlanc, icône droite) | dans le flux (contrat) / **absolu en pied** (Odoo) | idem | HUG à droite | HUG à droite |
| VoileNavigation | 75 % → 0,65 | idem | 70 % → 0,58 | idem |
| Voile | noir 55 % + dégradé 30 % → 0,8 | idem | idem | idem |

### Odoo

- `hero.authoring.json` : 26 épingles `ds.hero` → 3.0.0 ; contrôle nouveau `presentation` (`fixed-by-composition` / `none`) ;
  part nouvelle `root.Voile` (`not-editable` / `structural`, sélecteur `[data-pqr-part="hero-veil"]`). `odoo:authoring:check` : 12/12 · 15/15.
- `figma-panels.json` : 1 épingle → 3.0.0 (liens régénérés par le build). `components.xml` : `data-ds-contract-version="3.0.0"` ;
  **QWeb changé sur trois points** : `<div class="hero__Voile" data-pqr-part="hero-veil"/>` inséré sous `Background` (ordre de peinture
  Background · Voile · VoileNavigation · texte · bouton), titre `<span>` → **`<h1>`** (accessibilite-home-odoo : le jeton porte le
  niveau), défaut du titre **sans `<strong>`**. Digest **non touché**.
- **`responsive/hero.pqr.css` (NOUVEAU)**, ajouté au bundle après `texte-seo.pqr.css` : `min-height` 640 (+ `height: auto`),
  gouttière 48 / 56 / 89, bascule colonne-centré ↔ rangée-bas à 992 (racine `align-items: flex-end`, Titres `row/flex-start/flex-end`,
  gap 32, pad 96/48), texte à gauche à 992, voile de navigation Desktop (Wide identique, non recopié). La typographie roule sur
  `tokens.pqr.css`.
- Page `/hero-image-test` (`pages/hero-image-test.json`, `header_overlay: true` comme la home) : bloc seul, pleine largeur, contenu des
  planches, photo `assets/hero_industriel.png` (= `Hero-photo-1728.png`). `hero-test.json` (hero vidéo) intact.
- Déployé sur le pilote : `-u piqueray_ds` avec `--db_host=db --db_user=odoo --db_password=odoo`, restart, `odoo:page` → `COMPOSE_OK`.

### Faits code-only (`responsive/hero.pqr.css`, chacun commenté)

1. **CTA absolu en pied sous 992** : `.hero__Bouton { position: absolute; left/right: gouttière (24, 48 borné 768–991.98) ; bottom: 64 }`
   + `> .button { width: 100% }` — le contrat garde le bouton dans le flux (part instance : `stylesWhen` / `layoutByProp` / `declared`
   refusés). Cadre de référence : `.hero__blocTexte` (relative, z 2, étiré sur 640). Nommé dans la description de la part.
2. **`colGauche` sans `grow` sous 992** (`flex: 0 0 auto`) : le contrat porte `grow: true` (rangée Desktop/Wide) et `grow` n'a pas de
   canal par mode. En colonne, la colonne s'étirait sur 512 px et le titre collait en haut — **mesuré à la première capture** (titre à
   y 64 au lieu de 212, 17,6 % à 390). Même remède que `Text` du HeroVideo. Nommé dans la description de `colGauche`.

### Mesure (bloc contre planche, même boîte, `.page-parity/hero-image-mesure/`) — première passe, 11h30, photo = cadre 1728

| largeur | photo `hero_industriel` (cover du cadre 1728) | **photo Figma du mode injectée** (même cadrage) | cause de l'écart restant |
|---|---|---|---|
| 390 | 11,68 % (29 143 px) | **3,52 %** (8 794 px) | lissage des glyphes (Δ luminance 2–7 sur les bandes de texte, ≤ 0,5 ailleurs) |
| 834 | 12,68 % (67 667 px) | **1,63 %** (8 726 px) | idem |
| 1200 | 11,11 % (85 301 px) | **1,35 %** (10 352 px) | idem |
| 1728 | **0,90 %** (9 952 px) | 0,90 % | idem (photo identique des deux côtés) |

**L'écart de cadrage est nommé, pas corrigé.** `hero_industriel.png` est le cadre `Background` exporté à 1728×640, donc **déjà un
recadrage** de l'original ; `object-fit: cover` le recadre une seconde fois (échelle 1, rognage horizontal centré), tandis que Figma
recadre l'**original** par variante (FILL). Écart photo seul, `cadrage-photo-hero.mjs` (Hero-photo-w vs cover du 1728) : 30,6 % · 34,2 % ·
32,6 % · 0,0 %. Le bloc lui-même est fidèle (colonne de droite). Remède : donner à Odoo l'image d'ORIGINE (octets `getImageByHash`, REST)
et non le cadre 1728 → « Bloqué / à trancher ». Compte de pixels ~9–10 k constant à photo égale = même résidu que Texte SEO (cause 7).
Triptyques : `triptyques/hero-<w>-figma-odoo-diff.png` et `triptyques-photofigma/hero-photofigma-<w>-figma-odoo-diff.png`.

### Mesure finale (11h45) — **photo d'origine 2000×833** (`Hero-photo-original.png`, taille native, transformation identité)

L'orchestrateur a fourni l'image d'ORIGINE du `Background` et l'a posée à la place de `assets/hero_industriel.png` (1 647 530 octets).
Page recomposée (`odoo:page`), bloc recapturé (`capture-bloc.mts`), triptyques dans `triptyques-original/`.

| largeur | Odoo vs planche | diff | cause |
|---|---|---|---|
| 390 | 390×640 = 390×640 | **3,52 %** (8 797 px) | lissage des glyphes (petite boîte, texte sur 5 + 2 lignes) |
| 834 | 834×640 = 834×640 | **1,64 %** (8 733 px) | idem |
| 1200 | 1200×640 = 1200×640 | **1,35 %** (10 378 px) | idem |
| 1728 | 1728×640 = 1728×640 | **0,90 %** (9 937 px) | idem |

Chiffres identiques (à ±30 px) à la colonne « photo Figma injectée » de la première passe : **l'écart de cadrage est levé**,
`object-fit: cover` centré reproduit FILL centré dès que l'asset est l'original. Reste ~9–10 k pixels constants = le lissage
Figma/Chromium (cause 7 du mode d'emploi). Leçon pour la recette : **l'asset d'une page Odoo doit être l'image d'origine du paint
Figma, jamais un cadre exporté** — un cadre est déjà un recadrage, et `cover` le recadre une seconde fois.

**Sonde (`.page-parity/probe-hero-image.mts`), 4 largeurs — 0 écart de géométrie :** racine 390/834/1200/1728 × 640, `min-height` 640 ;
gouttières 24 / 48 / 56 / 89 ; bloc texte 342 × 216 à y 212 (centré, planche : 216 centré) · 738 × 128 à y 256 · **y 349** · **y 358**
(journal owner : 349 / 358) ; titre 32/40/600 · 32/40/600 · 40/50/600 · 54/68/600, `H1`, centré/centré/gauche/gauche ; sous-titre
16/24/**400** ×2 puis 18/27/**500** ×2, gras 700, blanc ; bouton **342 × 54 absolu, bottom 64, left 24** · **738, left 48** · 353 × 54 HUG
à x 791 (planche 354) · **386** × 54 à x 1253, bottom 48 ; libellé 16 → 18 px en Wide ; voile `rgba(0,0,0,0.55)` + dégradé, z 1.

### Édition (`.page-parity/edit-hero-image.mts`, rédacteur `editor@example.test`, pilote)

Titre « Portes de garage industrielles » → « … (édité) » ET mot gras « performance » → « performanceX » (frappe en fin de `<strong>`),
enregistrement **RPC 200**, relecture publique : les deux conservés, **H1 conservé, 2/2 plages grasses conservées**. Remise par le même
chemin (200) : page de mesure intacte (re-mesurée : mêmes chiffres). **Piège de script** : `End` dans un `h1` replié s'arrête en fin de
ligne *visuelle* (première passe : « Portes de garage i (édité)ndustrielles ») — caret posé par `Range` en fin de nœud texte ; page
recomposée entre les deux passes.

### Déviations nommées (récapitulatif)

1. Racine `align: stretch` en base là où le dump dit `counter: MIN` (blocTexte FIXED 640 = la hauteur de la racine : `stretch` est la
   traduction CSS du remplissage).
2. `Titre direct` aplati (enveloppe à enfant unique, gap sans effet).
3. Titre : Bold (2.0.0) → **SemiBold** (H1) ; défaut sans gras.
4. Sous-titre : 24/32 Medium (2.0.0) → body 16/24 Regular · 18/27 Medium ; liaisons posées à la main (pas de style Figma).
5. `letter-spacing 0` non porté.
6. Bouton dans le flux au contrat, absolu en pied en Odoo (code-only 1) ; `colGauche` grow reset (code-only 2).
7. Élément hôte `section` (non dessiné).
8. Photo : `object-fit: cover` pour FILL — équivalent dès que l'asset est l'original (vérifié à 4 largeurs) ; un cadre exporté comme asset donnait 11–13 % hors 1728.

### Questions tranchées seule (à relire)

- `semantics.element` → `section` (Texte SEO a gardé `div` ; ici le modèle HeroVideo et l'hôte Odoo sont `section`).
- Titre en **`h1`** (`element: "h1"` + QWeb `<h1>`), par la règle « le jeton porte le niveau » d'accessibilite-home-odoo — la page
  « Portes de garage » n'a pas d'autre h1.
- Défaut du titre **sans gras** dans le contrat ET le QWeb (le candidat est uniforme).
- Bouton : `iconLeft: false` + `iconRightGlyph: "arrow-right"` explicites (2.0.0 ne portait que `variant` + `iconRight`).
- `padding-top` / `padding-bottom` séparés plutôt que `padding-block` (haut ≠ bas en Desktop/Wide).
- Entrée de registre du voile `Titres` **supprimée** (gradient retiré) ; entrées `VoileNavigation` de `ds.hero` réécrites/ajoutées avec
  la valeur HeroVideo (le registre est par contrat).
- `hero.pqr.css` : voile de navigation Wide non recopié (identique à Desktop) ; `height: auto` + `min-height` en base sur tous les modes
  (comme le hero vidéo).
- Photo de la page de test = cadre 1728 (`hero_industriel.png`) tel que fourni ; l'écart de cadrage est mesuré à part, pas masqué.
- `hero_industriel.png` = 1,26 Mo, ajouté tel quel aux assets (pas recompressé).

### À corriger à la source (Figma)

- Set `2770:20976`, variantes Desktop et Wide : `Titres.itemSpacing` = **32 brut**, non lié (`space/32` existe) ; Mobile/Tablette lient `space/24`.
- Variantes Desktop et Wide : le `Titre` n'a pas le marqueur de style H1 au dump (`style` absent, valeurs 40/50 et 54/68 = H1) — à
  vérifier au canevas (style appliqué ou valeurs posées à la main).
- Bouton (set `Bouton`, hors périmètre) : sur les planches l'icône droite du style Outline blanc est **grisée** (opacité ou couleur
  non liée à `color/blanc`), en Odoo elle est blanche (`.page-parity/hero-image-mesure/bouton-1728-pair.png`). Affaire de `ds.button`.
- Reste de l'étape 0 : master `2111:3382` et ses 10 usages en v1 tant que le candidat n'est pas promu (orchestrateur).

### Bloqué / à trancher (orchestrateur / owner)

- ~~**Cadrage photo** : fournir l'image d'ORIGINE du `Background`~~ — **levé le 2026-09-07 (11h45)** : l'orchestrateur a fourni
  `Hero-photo-original.png` (2000×833), mesure finale 3,52 / 1,64 / 1,35 / 0,90 %.
- **Verrou Odoo** : `odoo:inputs:check` rouge (`ds.hero` 2.0.0 → 3.0.0 + registre des littéraux, digest à re-pinner) ;
  `odoo:module:check` **22/23** — seul échec : `components.xml : ds.hero 3.0.0 ≠ lock 2.0.0` (+ `ds.texte-seo` de l'agent précédent).
  Miroirs non touchés : `inputs.lock.json`, `version_guard.js`, `scan-saved-versions.ts`, `cases.json`, `evals/golden.json`.
- **Parité** : 1 constat `[figma BEHIND] Hero.Presentation` — le cliché `figma-components.json` apparie par nom l'ancien master
  `2111:3382` (sans axe). Cliché périmé, à rafraîchir ; **aucun patch appliqué**.
- `figma-sync/NN-hero.js` non régénéré (`figma:plan`, hors périmètre) ; `npm run eval` non lancé (règle).
- `core/samples/{Hero.inline.tsx, hero.css, hero.html}` régénérés par `emitters:check` (attendu) ; `AccordionRow/ProductCard/ReviewCard/
  TexteSEO` bougent depuis 033 / les agents précédents (pas de mon fait).
- Fichiers étrangers dans le worktree, pas de mon fait : `v9.js`, modifications d'autres agents (`accordion-row`, `texte-seo`, `faq.authoring.json`, `compose_page.py`, `README.md`).

### Portes (2026-09-07)

`npm run build` **vert** (derivation comprise) · `geometry:gate` **PASS** (14 littéraux nommés, 0 invisible) · `odoo:authoring:check`
**vert** (12/12 · 15/15) · `odoo:module:check` **22/23** (verrou, attendu) · `tsc --noEmit` et `tsc -p tsconfig.build.json` **verts** ·
`emitters:check` **vert** · `parity` **1 constat Hero** (cliché périmé) + `TexteSEO` (agent précédent), 27 acquittés inchangés ·
`odoo:inputs:check` **rouge** (verrou, attendu). `npm run eval` **non lancé**.

### Fichiers touchés

`contracts/hero.contract.json` (3.0.0) · `contracts/named-literals.registry.json` (−1 entrée Titres, 1 réécrite, +3 `ds.hero`) ·
`integrations/odoo/config/{hero.authoring.json, figma-panels.json}` · `integrations/odoo/addons/piqueray_ds/{views/components.xml,
__manifest__.py, static/src/css/responsive/hero.pqr.css (nouveau)}` · `integrations/odoo/authoring/{pages/hero-image-test.json (nouveau),
assets/hero_industriel.png (nouveau)}` · générés : `src/components/Hero/*`, `static/src/css/generated/components.pqr.css`,
`static/src/js/generated/figma_links.js`, `derivation-report.json`, `core/samples/*`, `parity/report.json` · outils (`.page-parity/`,
ignoré) : `probe-hero-image.mts`, `edit-hero-image.mts`, `capture-hero-image-photo.mts`, `cadrage-photo-hero.mjs`, dossier
`hero-image-mesure/`. Aucun jeton, aucun émetteur, aucun schéma, aucun verrou, aucun autre contrat.
