# Page « Portes de garage » — reconstruction v2 en 4 vues (2026-09-07)

**Décision owner** : « on va recréer la page avec les bons composants et modes, exactement comme pour home v2, en dessous ».

## Ce qui a été fait (canevas, page 031)

- Version nommée avant : « 031 — avant démo Portes de garage v2 (2026-09-07) » (id 2396423109284636604).
- Section **2770:21610** « 031 · DEMO PORTES DE GARAGE — 4 vues (instances v2) », sous la section HERO IMAGE.
- Méthode : chaque vue est un **clone de la vue home v2 du même mode** (`Accueil — mobile 390` / `tablette 834` /
  `desktop 1200` / `Accueil` 1728) — même gap de page (80 · 80 · 128 · 192), même en-tête absolu, mêmes modes
  explicites — puis : SAV et ProduitsECommerce retirés ; HeroVideo remplacé par une instance du set **Hero v2**
  (2770:20976) ; **TexteSEO v2** (2768:20428) inséré avant le Footer ; contenus de la page posés en surcharges.
- Vues : Mobile **2770:21611** (390×8274) · Tablette **2770:22101** (834×7323) · Desktop **2770:22591** (1200×5209) ·
  Wide **2770:23107** (1728×5307). Ordre : Hero, CategoriesPrincipales, Presentation, Devis, Reassurances, AvisGoogle,
  TexteSEO, Footer, Header (absolu en haut). Chaque instance porte `Presentation=<mode>`.
- **Rien d'existant modifié** (relevé après) : les 4 vues home v2 ont toujours 10 enfants et leurs hauteurs
  (9141 / 8262 / 6233 / 6460) ; la référence « Portes de garage » 2767:19746 a toujours 8 enfants, 4372 de haut, son
  Hero toujours sur le master v1.

## Contenus posés (depuis la référence 2767:19746, instances v1)

| Section | Contenu |
|---|---|
| Hero v2 | titre « Les portes de garage Hörmann :  l'alliance de la sécurité et du design », sous-titre « Que vous soyez un particulier ou un professionnel, Piqueray vous propose la gamme complète du leader européen en Province de Liège. », bouton « En savoir plus », photo `dfaa8d20…` (maison blanche) |
| CategoriesPrincipales (031) | 2 cartes : « Portes de garage résidentielles » / « Sectionnelles, basculantes ou enroulables. Alliez esthétique, confort et isolation pour votre habitat. » (`f08d845e…`) · « Portes de garage industrielles » / « Solutions robustes, rapides et sécurisées pour vos entrepôts, commerces et bâtiments logistiques. » (`41da76bc…`) |
| Presentation (031) | « L'excellence allemande chez Piqueray » + texte riche (3 plages en gras), bouton « En savoir plus » |
| Devis, Reassurances, AvisGoogle, Footer, Header | identiques à la home (vérifié : mêmes textes, mêmes photos) |
| TexteSEO v2 | « L'expert de la porte de garage Hörmann en Province de Liège », paragraphe, « Tout savoir sur votre installation », 3 lignes (Garantie ouverte) |

## Ce que ces vues servent
- Planches de la **page entière** pour la mesure Odoo de la page (`.page-parity/vague-031/planches-portes-de-garage/`).
- Support de la validation owner avant la **promotion** des usages (Pages › Portes de garage) vers les sets v2.

## Limites nommées
- Les sections Presentation / Devis / Reassurances / AvisGoogle / Footer / Header sont les sets **031** (déjà v2).
  Les masters DS v1 correspondants restent en place ; la page « Pages › Portes de garage » est toujours en v1.
- Le contenu de la page vient des surcharges d'instances de la référence, pas d'un descripteur : à reporter tel quel
  dans `integrations/odoo/authoring/pages/portes-de-garage.json` au moment de composer la page Odoo.

## Clôture de page — parité (2026-09-07)

- Axe d'état des trois cartes renommé à la source (`Etat`→`State`, `Defaut/Survol`→`Default/Hover`), version « 031 — avant renommage axe Etat→State », instances 36 / 50 / 84 avant = après.
- Cliché de parité rafraîchi deux fois (avant/après le renommage). `npm run parity` : **aucune dérive nouvelle**.
- `parity/baseline.json` : 47 → 16 acquittements. Les 31 entrées retirées n'acquittaient plus rien (variables Figma désormais posées, axe State présent, constats disparus) :
  - `figma|behind|SectionHeader.Bouton`
  - `figma|mismatch|Presentation.Bouton (default)`
  - `figma|behind|Coordonnees.Accroche`
  - `figma|behind|Coordonnees.Titre`
  - `figma|behind|Formulaire.Accroche`
  - `figma|behind|Formulaire.Titre`
  - `figma|ahead|Header.Fond`
  - `figma|ahead|HeroVideo.Presentation`
  - `figma|behind|Reassurances.CarteReassurance`
  - `figma|behind|Reassurances.BoutonSecondaire`
  - `figma|behind|Reassurances.BoutonQuatreCartes`
  - `figma-tokens|behind|Primitives/size/devis/root-h-mobile`
  - `figma-tokens|behind|Primitives/size/devis/root-h-tablette`
  - `figma-tokens|behind|Primitives/size/devis/root-h-desktop`
  - `figma-tokens|behind|Primitives/size/devis/root-h-wide`
  - `figma-tokens|behind|Primitives/size/sav/row-h-desktop`
  - `figma-tokens|behind|Primitives/size/sav/wrapper-h-desktop`
  - `figma-tokens|behind|Primitives/size/sav/img-group-h-desktop`
  - `figma-tokens|behind|Primitives/size/sav/img-group-h-compact`
  - `figma-tokens|behind|Primitives/size/sav/img-h-compact`
  - `figma-tokens|behind|Primitives/size/sav/cta-w-desktop`
  - `figma-tokens|behind|Primitives/size/carte-categorie/min-w`
  - `figma-tokens|behind|Primitives/size/categories-principales/carte-h-mobile`
  - `figma-tokens|behind|Primitives/size/categories-principales/carte-h-tablette`
  - `figma|behind|CarteCategorie.State`
  - `figma|behind|ProductCard.State`
  - `figma|behind|ReviewCard.State`
  - `figma-tokens|behind|Primitives/color/noir-voile-55`
  - `figma-tokens|behind|Primitives/shadow/etat/product-card/survol`
  - `figma-tokens|behind|Primitives/shadow/etat/review-card/survol`
  - `figma-tokens|behind|Semantic/color/etat/carte-categorie/voile-survol`

## Page Odoo composée et mesurée (2026-09-07)

- Descripteur **`integrations/odoo/authoring/pages/portes-de-garage.json`** (7 sections, `header_overlay: true`,
  contenu de la vue Figma v2 ; Devis / Réassurances / Avis Google repris de `home.json`, contenu commun).
  Assets nouveaux : `hero_portes_garage.png` (photo d'origine 4096×2956 réduite à 2000 de large ; l'original
  est conservé sous `.page-parity/vague-031/planches-portes-de-garage/`), `cat_industriel.png` (1600×800, original).
- Pilote : module mis à jour avec le digest re-pinné (`-u piqueray_ds` avec identifiants), page composée
  (`COMPOSE_OK`, 9 pièces jointes). Blocs servis : hero 3.0.0, texte-seo 4.0.0, categories-principales 2.0.0,
  presentation 4.2.0, devis 2.1.0, reassurances 2.1.0, google-reviews 3.1.0.
- URL : http://localhost:8087/portes-de-garage · éditeur :
  http://localhost:8087/odoo/website?path=/portes-de-garage&enable_editor=1&with_loader=1

### Mesure page entière contre les 4 vues Figma (`capture-page.mts`, en-tête inclus)

| largeur | Figma | Odoo | écart de hauteur | diff |
|---|---|---|---|---|
| 390 | 390×8274 | 390×8278 | +4 | **3,67 %** |
| 834 | 834×7323 | 834×7327 | +4 | **2,41 %** |
| 1200 | 1200×5209 | 1200×5211 | +2 | **1,71 %** |
| 1728 | 1728×5307 | 1728×5315 | +8 | **1,90 %** |

Lecture du triptyque 1728 : toutes les sections tombent au même endroit ; le rouge est du lissage de texte et des
bords de photos, plus un décalage de quelques pixels qui s'accumule vers le pied (+8 px sur 5 315). Un écart de
contenu à nommer : le titre du hero de la référence porte un **double espace** (« Hörmann :  l'alliance ») que le
HTML replie en un seul — la coupure de ligne bouge de quelques pixels. Défaut de contenu de la source, pas de rendu.
Triptyques : `.page-parity/page-portes-de-garage/triptyques/triptyque-{390,834,1200,1728}.png` (+ `.jpg` légers).

### Reste avant livraison de la page
- Promotion Figma des usages « Pages › Portes de garage » vers les sets v2 (captures avant, comptes, version nommée).
- Unification des blocs communs (Devis, Avis Google) — décision owner du 2026-09-07 : avant livraison client.
- Menu / URL définitive de la page dans Odoo (la page de test porte l'URL `/portes-de-garage`).

## Passe de simplification (2026-09-07, quatre relecteurs : réutilisation, simplification, efficacité, altitude)

Appliqué :
- `compose_page.py` : les rangées d'accordéon sont **rendues par leur gabarit QWeb** (`texte_seo_row` / `faq_accordion_row`)
  au lieu d'une troisième copie Python de la logique d'état ; marqueurs 0-based comme le `t-foreach` ; un seul
  `write_arch()` (toutes langues) sur les deux chemins (mise à jour ET création) ; `img_url` accepte jpg/png/webp
  et déduit le type MIME.
- Assets : les trois photos passent en **JPEG à 1728 de large** (hero Portes de garage 5 649 → 558 Ko, hero
  industriel 1 608 → 213 Ko, catégorie industrielle 1 296 → 286 Ko) ; sources 2000 px conservées hors dépôt
  (`.page-parity/vague-031/assets-sources/`). Pages recomposées, vérifiées servies (JPEG, états, aria).
- `hero.contract.json` : `marks.strong` en forme scalaire, comme texte-seo / presentation / sav (émission identique).
- `components.xml` : deux commentaires qui décrivaient des hauteurs fixes disparues.
- Fixture titres directs : vérification `width: fill` hissée hors des branches, commentaire orphelin retiré.

Nommé, non fait (hors périmètre du diff ou décision de patron) :
- Hero : bloc mobile/tablette et voile de navigation dupliqués avec `responsive.pqr.css` (hero vidéo) → liste de
  sélecteurs partagée à décider ; le bouton en pied reste le « canal manquant » des parts instance (11ᵉ occurrence).
- `texte-seo.pqr.css` = les seules gouttières : copie vive des classes `--presentation-*` générées et inertes
  (17,8 Ko de règles mortes dans `components.pqr.css`, ≈ 22 %) → transformer l'axe en `@media` à la construction.
- 8 jetons `size.accordion-row.*` orphelins (hauteurs fixes retirées) : à retirer AVEC leurs variables Figma.
- Fixture titres directs : une règle d'effet sur la part titre (« aligné à gauche à partir de Desktop ») remplacerait
  les branches par contrat ; recensement des styles de texte à dériver des jetons plutôt que re-pinné.
- Rapport de dérivation : `css/responsive/` toujours hors `TARGETS` (13 feuilles non comptées).
- Dédoublonnage des pièces jointes par `checksum` et copie sélective du dossier `assets/` dans le conteneur.
- Contenu commun (Devis, Réassurances, Avis) dupliqué entre home et Portes de garage : décision owner du jour,
  unification avant livraison.
- Une AUTRE session travaille dans ce worktree (carrousel produits, vague 034, `v9.js`) : exclue de la revue.

## Promotion sur la page 031 (2026-09-07, décision owner : « sur 031, ne casse pas les anciennes bases »)

- Périmètre : la **copie de référence** « Portes de garage » 2767:19746 sur la page 031 seulement. La page « Pages ›
  Portes de garage » (8 enfants, 4372, Hero sur le master v1) et les masters DS · Organisms sont **intacts** (relevé après).
- Version nommée avant : « 031 — avant promotion référence Portes de garage (Hero, TexteSEO) 2026-09-07 »
  (id 2396431429731859558). Capture avant/après du cadre (§X) : `.page-parity/promotion-031/`.
- Remplacés, mêmes surcharges (textes, photo, libellé du bouton, lignes) : Hero v1 2767:19748 → **Hero v2** 2772:24103
  (Presentation=Wide), TexteSEO v1 2767:19757 → **TexteSEO v2** 2772:24119 (Wide, 3 lignes v2).
- Comptes d'instances des masters v1 : Hero 11 → 10, TexteSEO 10 → 9, AccordionRow 51 → 48 — exactement les trois
  nœuds remplacés. (Les comptes du matin étaient 10 / 9 / 45 : l'owner a posé entre-temps une seconde référence,
  « Portes de garage résidentielles », sur la page 031 — non touchée.)
- Les autres sections de la copie (Presentation, Devis, Reassurances, Avis Google, Footer, Header) restent sur
  leurs masters v1 : hors périmètre du jour ; la vue Wide de la section « DEMO PORTES DE GARAGE — 4 vues » les
  porte déjà en 031.
