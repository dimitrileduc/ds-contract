# Journal — Header 031 (set `Header` 2732:12096), côté Figma seulement

**Date** : 2026-09-03. **Périmètre** : header uniquement (le footer a ses clones dans `031 · FOOTER — 4 variantes`, non traités).
**Où** : page `031 · Planches de validation` (2613:18825), section `031 · HEADER — 4 variantes` (2732:10533),
en bas de page. **Les 4 vues home n'ont pas été touchées.** Version nommée avant tout geste :
`031 — avant construction HEADER/FOOTER (clones séparés, vues intactes)` (2394995075615198546).

## Source relevée (les 4 vues home, une vérité par mode)

| Vue | Nœud source | Forme | Contenu |
|---|---|---|---|
| Mobile 390 | `header` 2617:55171 | copie détachée (3 niveaux : wrapper 24 → Header 16/0) | logo + burger 44 ; nav desktop **cachée et écrasée à 1 px** dans le cadre |
| Tablette 834 | `header` 2674:15009 | idem, gouttière 48 | idem |
| Desktop 1200 | `Header nav` 2670:8159 | copie détachée, pad 26/48 | logo + nav 4 items + icônes Utilisateur/Panier/Mail ; **pas de bouton** |
| Wide 1728 | instance `Header` 2624:57640 du master DS 84:285 | pad 16/89 | logo + nav 4 items + bouton Contactez-nous + icônes (Recherche masquée)/Utilisateur/Panier |

Hauteur : 76 (Mobile/Tablette, pad 16) · 86 (Desktop/Wide, pad 26 / 16 + bouton 54).

## Défauts de source relevés → traités sur les clones

| # | Défaut | Vues | Traitement |
|---|---|---|---|
| A1 | Nav desktop fantôme (masquée, largeur 1 px, boutons aux paddings bruts, icônes noires brutes) | Mobile, Tablette | retirée (invisible → 0 px de différence) |
| A2 | Logo en cadre détaché, hauteur HUG sur enfants absolus (32,3 au lieu de 34) | Mobile, Tablette, Desktop | remplacé par l'instance `PiquerayLogo / Couleur=Blanc` (4:15) — **décalage vertical de 1 px** (29 px de contour, voir mesure) |
| A3 | Items de nav en cadres, texte sans style | Desktop | remplacés par des instances `NavItem` (Libellé, Chevron, Actif=false), style « Libellé nav » |
| A4 | Trois structures d'emballage différentes (wrapper de gouttière + cadre interne) | Mobile, Tablette, Desktop | aplaties : un seul cadre racine, padding T/R/B/L |
| A5 | Fond blanc masqué sur la racine et sur le logo | les 4 | retiré |
| A6 | `itemSpacing 392` brut sous `SPACE_BETWEEN` (master DS) | Wide | mis à 0, lié `space/0` (E-031-023, 9ᵉ occurrence) |
| A7 | Valeurs brutes : gouttières 24/48/48/89, pad-v 16/26, gaps 32/64/16, burger 44 / traits 24×2 / gap 5, icônes 24, fills blancs des traits et des icônes | les 4 | toutes liées (voir mints) |

**Reste brut, hors périmètre du set (dans les masters DS)** : `NavItem` 2152:5554 — fill blanc du chevron non lié ; boîtes internes fixes du logo et du chevron. À corriger sur les masters DS avec GO owner.

## Mints (Primitives, marqués « 031 provisoire », à pivoter dans `tokens/`)

`space/5` (gap burger) · `space/26` (pad-v header Desktop/Wide) · `size/cible-tactile/min` = 44 (E-031-024) ·
`size/burger/trait-largeur` = 24 · `size/burger/trait-epaisseur` = 2 · `size/header/icone` = 24.

## Set

`Header` 2732:12096, axe `Presentation` = Mobile (défaut, 1ʳᵉ variante) · Tablette · Desktop · Wide.
Racines FIXED en largeur / HUG en hauteur, mode `Responsive` posé sur chaque variante.
`variantGroupProperties` se lit sans erreur. Instance de test sous le set (`TEST · instance Header — changez Presentation ICI`) :
la bascule de variante rend 390×76 / 834×76 / 1200×86 / 1728×86, enfants aux positions de la source.

## Mesure pixel (variante finale contre la vue d'origine, fond aplati #26282c)

| Variante | Écart | Cause |
|---|---|---|
| Mobile | 29 px (0,10 %) | contour du logo : instance 34 de haut contre cadre 32,3 → 1 px vertical |
| Tablette | 29 px (0,05 %) | idem |
| Desktop | **0 px** | — |
| Wide | 4 134 px (2,78 %) | libellé du bouton 16 → **18** : la variante porte le mode Wide, « Libellé bouton » est responsive (16·16·16·18, Button 2.1.0). La vue home Wide, elle, n'a pas de mode posé et rend encore 16 |

## Resize réel (banc `BANC · resize réel`, instance FILL dans un hôte de largeur donnée)

Logo à gauche, burger/nav à droite, centrage vertical tenu à toutes les largeurs testées
(390 · 600 · 767 · 768 · 834 · 991 · 992 · 1200 · 1399 · 1400 · 1487 · 1728 · 1920). **Deux bornes basses** :

- **Desktop sous 1 113 px** : la nav (837) + logo (180) + gouttières (96) dépassent → chevauchement de 121 px à 992.
- **Wide sous 1 487 px** : nav + bouton (1 129) + logo + gouttières (178) → chevauchement de 87 px à 1 400.

Ce n'est pas un défaut de construction : le contenu de la nav est plus large que le bas de sa plage. À trancher
(réduire les gaps 64/32 sous un seuil, ou décaler les seuils) — rien fait.

## Substitution dans les 4 vues home (GO owner 2026-09-04)

Version nommée avant (`031 — avant substitution Header dans les 4 vues + liaison chevron NavItem`) et après
(`031 — Header substitué dans les 4 vues home … + chevron NavItem lié`, 2395273505486260383).
Méthode du hero : export 1x de la vue entière avant → l'ancien header (enfant ABSOLU, index 9, x 0 y 0) remplacé
par l'instance de la variante du set, même index, même position, contraintes `STRETCH / MIN` (l'ancien portait
`MIN` sauf Tablette `STRETCH` ; STRETCH est le comportement voulu d'un header, rendu identique) → export après.

| Vue | Instance | Écart avant/après | Zone | Cause |
|---|---|---|---|---|
| Mobile 390 | 2735:12292 | 212 px (0,006 %) | x 24–203, y 21–55 | logo : 1 px vertical (sur la photo du hero, le contour compte plus que sur fond uni) |
| Tablette 834 | 2735:12310 | 187 px (0,003 %) | x 48–226, y 21–55 | idem |
| Desktop 1200 | 2735:12328 | **0 px** | — | — |
| Wide 1728 | 2735:12374 | 6 431 px (0,058 %) | x 511–1446, y 16–69 | libellé bouton 16 → 18 (mode Wide) et nav décalée d'autant |

Tout écart est confiné à la bande du header (y ≤ 69) : le reste des vues est identique au pixel.
Les anciens headers des vues (copies détachées, wrapper du master DS en Wide) n'existent plus ; le master DS
`Header` 84:285 n'a plus d'usage vivant dans les vues 031 (les pages `Pages` l'utilisent toujours).

**Master DS `NavItem` 2152:5554** : le blanc brut du chevron lié à `color/blanc` (GO owner). Export avant/après : 0 px.

## Dump + extraction (2026-09-04)

- Dump v1.8 du set : `.page-parity/vague-031/dumps/Header.live.dump.json` (ciblé par id 2732:12096, car
  **deux sets portent le nom `Header`** — le DS 84:285 et le 031). Planches : `.page-parity/vague-031/planches/Header-{390,834,1200,1728}.png`
  (export 1x des instances posées dans les 4 vues).
- `npm run extract:figma` → `.page-parity/vague-031/proposals/Header/` : **0 valeur non liée, 35 notes**, 3 assets vecteurs
  (user, cart, search), 6 feuilles provisoires. Deux corrections de source trouvées PAR l'extraction, faites (0 px) :
  · tous les tracés d'icônes s'appelaient `Vector` → collision d'asset (« different geometry across captured occurrences »),
    refus de l'extraction. Renommés `user-1`, `user-2`, `cart`, `search`. **Règle de source : un tracé promu porte un nom unique par géométrie.**
  · `NavItem 2/3/4` en Wide (renommage perdu dans l'annulation owner du premier set) → `NavItem`, la nav devient UNE répétition (0/4 par variante).
  · traits du burger : `cornerRadius 1` brut → `radius/1` minté (Primitives, 031 provisoire).
- Notes à traiter au contrat (pas des défauts de source) : `semantics.element` → `header` ; `padding-inline`/`padding-block` en
  `tokensByProp` (24/48/48/89 · 16/16/26/26) ; `navWrapper.gap` 32/64 en `tokensByProp` ; `MenuBurger` présent en Mobile/Tablette,
  `navWrapper` en Desktop/Wide (présence par valeur d'axe, « tout rendre + masquer » côté Odoo) ; `Bouton` présent en Wide seul ;
  `imported.header.menu-burger.{width,height}` → `size.cible-tactile.min` (le dump lit la bbox d'un cadre auto-layout FIXED, pas sa liaison) ;
  `imported.header.root.width.*` = témoins, `layout.width: fill` + `referenceWidth 1728`.
- Dégradations du dump (2) : export SVG refusé sur `Search/search` (icône **masquée** en Wide) → rendu « boîte », à trancher :
  la garder masquée dans le set ou la retirer.

**Bloqué / à trancher (instrument partagé)** : `extract/figma/dump.plugin.js` lève une exception sur `exportAsync` d'un
vecteur masqué (« may not have any visible layers ») au lieu de la consigner en dégradation. Contourné dans une copie
scratch (try/catch → `vector-asset-export-failed`), l'instrument du dépôt n'est pas modifié.

## Contrat 3.0.0 + portage Odoo (2026-09-04, GO owner « go implement le contrat et odoo »)

**Contrat** `contracts/header.contract.json` **3.0.0** (MAJOR : ancres → set 031 `7c1e4586…` / 2732:12096) :
- prop `presentation` (enum 4 valeurs, défaut mobile, VARIANT `Presentation`), `items` inchangé ;
- racine `padding-inline`/`padding-block` en `tokensByProp` (24/16 · 48/16 · 48/26 · 89/16), `navWrapper.gap` 32 → 64 en Wide ;
- présence par écran : `Bouton` `visibleWhen wide`, `Mail` `visibleWhen desktop` ; `navWrapper` (Desktop/Wide) et
  `MenuBurger` (Mobile/Tablette) en `stylesWhen display:none` ×2 — **premier contrat de la vague à porter une part
  absente sur DEUX valeurs d'axe** ; le schéma n'admet qu'une valeur par `visibleWhen`/`hiddenWhen`, et `stylesWhen`
  n'est pas représenté sur le canevas (limite documentée) ;
- Recherche retirée (calque masqué en Wide, §VIII — retiré du set aussi, 0 px, version nommée) ;
- 7 jetons mintés from-dump dans `tokens/primitives.tokens.json` avec provenance : `space.5`, `space.26`, `radius.1`,
  `size.cible-tactile.min` (44), `size.burger.trait-largeur` (24), `size.burger.trait-epaisseur` (2), `size.header.icone` (24).

**Odoo** (instance pilote `piqueray-odoo-pilote`, port 8087, `-u piqueray_ds` + restart) :
- `views/header.xml` : Recherche retirée, Mail ajoutée (`icon-mail`), burger `<button>` 44×44 inerte (`menu-burger`,
  3 traits) — le menu mobile reste hors périmètre ;
- `static/src/css/responsive/header.pqr.css` (NOUVEAU, ajouté au bundle) : base Mobile, @media 768 / 992 / 1400 ;
  faits code-only nommés : bouton en Wide seul, Mail en Desktop seul ;
- `config/header.authoring.json` 2.0.0 : 40 épingles → 3.0.0, contrôle `presentation` fixed-by-composition, verdicts
  Mail / MenuBurger / traits (couverture 13/13 props · 26/26 parts).

**Mesure** (`.page-parity/capture-header.mts`, barre seule sur `/hero-test`, fond aplati #26282c, `cmp-hf.mjs`) —
triptyques `.page-parity/header-mesure/triptyques/` :

| Largeur | Écart | Lecture |
|---|---|---|
| 390 | **7 px** (0,024 %) | contour du logo |
| 834 | **7 px** (0,011 %) | idem |
| 1200 | 2 570 px (2,49 %) | lissage du texte de la nav (positions sondées : nav x 317 vs 315, largeur 835 vs 837) |
| 1728 | 2 917 px (1,96 %) | idem + bouton (x 1243, 268×54 — même boîte que la planche) |

**Portes** : build ✔ · geometry:gate ✔ (0 invisible) · emitters:check ✔ · catalog ✔ · plugin:check ✔ ·
core-browser-check ✔ · parity ✔ (cliché rafraîchi ; **2 acquittements** `figma|behind|Header.NavItem` /
`Header.Bouton` : le sondage `nestedInstances` de `parity/extract-figma.plugin.js` ne lit que la **variante par
défaut** (Mobile = logo + burger) — limite d'instrument, à trancher) · golden + engine receipt re-pinnés ·
`check-inputs --repin` (digest inchangé) · odoo:authoring:check ✔ · odoo:module:check ✔ · odoo:inputs:check ✔.

**Eval** : `236/243` (2026-09-04, seconde passe sur cliché + acquittements à jour). Les 7 rouges sont tous le
chantier Avis Google / ReviewCard en cours dans ce worktree, aucun ne nomme le header : `odoo-figma-links-governance`
(panneaux google-reviews / review-card en version-mismatch), `odoo-authoring-coverage-refusal` (fixture
`invalid-path/presentation.authoring.json` modifiée), `odoo-production-version-drift` (`cases.json` en retard sur le
digest), `figma-text-styles-piqueray` (51 custom au lieu de 38 : les 20 nouveaux sont tous `ds.google-reviews`),
`deterministic-roundtrip` (ds.google-reviews 3.0.0, `arrow-left` absent du mock), `detect-figma-missing-nested-instance`
(set « Avis Google »), `google-reviews-repeat-renders-sample-on-static-surfaces`.

**Rouge hors périmètre, même cause** : `tsc` (GoogleReviews / GoogleReviewsSection), `odoo:derivation:check`
(`ODOO-031-GOOGLE-REVIEWS-PANEL` non classée).

## Non fait, volontairement

- Vues `Pages` (210:325) : instances de l'ancien master DS `Header` 84:285 intactes (pivot fin de vague).
- Le footer : clones bruts posés dans `031 · FOOTER — 4 variantes`, non nettoyés.
- Le master DS `Header` 84:285 : intact (pivot en fin de vague, comme HeroVideo).

## Contrat 3.1.0 + Odoo (orchestrateur, 2026-09-16) — les trois icônes et le bouton quittent la barre

**Demande owner (2026-09-16)** : vérifier les icônes Recherche / Compte / Panier → **les trois partent** (Recherche était déjà
hors contrat depuis 3.0.0 ; Compte et Panier partent aussi, Mail avec elles — « c'est pas page contact ») ; le bouton
« Contactez-nous » disparaît au profit d'une **entrée de nav « Contact »** ; la boutique Odoo devient une **entrée « Boutique »**
avec lien (capture de la prod du client à l'appui) ; « Rendez-vous » (présent en prod) n'est **pas repris** ; le menu mobile suit.

**Ordre §VIII tenu** : planche d'abord (`031 · 28 · HEADER + MENU MOBILE — proposition`, cadre auto-layout à droite de la section
Header, actuel/proposé aux 4 écrans + les deux menus), GO owner « c tt bon pr moi », puis les masters. Planche retirée après
pose (version nommée), comme pour les CTA du 2026-09-09.

- **§X** : 10 PNG « avant » (6 variantes + 4 témoins, tailles vérifiées sur disque) dans `.page-parity/vague-031/header-sans-icones/avant/`,
  version `031 · 28 · AVANT — …` ; 10 PNG « après » + version `031 · 28 · APRÈS — …`. Comptes d'instances identiques avant/après
  (Header 12/12/11/11, MenuMobile 3/3) ; les **36 vues** de la page `Pages` montrent les six entrées.
- **Gestes sur `Header` 2732:12096** (Desktop + Wide) : `iconsNav` retiré, `Bouton` retiré, deux `NavItem` clonés depuis « À propos »
  (« Boutique » en 3ᵉ, « Contact » en dernier, chevron faux). **Deux conséquences mesurées sur le set, posées à la source** :
  · Desktop — six entrées à l'écart 32 débordaient de **10 px** sur le logo (utile 1104, logo 180, nav 934) → `nav.itemSpacing`
    lié à **`space/24`** (nav 894, marge 30) ; Wide garde 32 (marge 436).
  · Wide — sans le bouton (54 px) la barre retombait à **66 px** → `paddingTop/Bottom` liés à **`space/26`** comme Desktop, barre à 86.
- **Gestes sur `MenuMobile` 2738:13621** (Mobile + Tablette) : `User` et `Cart` retirés de `actions` (la croix reste), deux
  `MenuEntree` clonés (« Boutique », « Contact », chevron faux, Etat Fermé), `Bouton` retiré du `pied` (le téléphone reste).
- **Dump + extraction** (`.page-parity/vague-031/header-sans-icones/{dumps,proposals}/`) : `Header` **28 notes, 0 non lié** — les
  notes confirment le contrat (padding-block 26 en desktop ET wide ; nav itemSpacing 24 vs 32). `MenuMobile` : **extraction
  refusée** par `vector-assets.ts` (« menu-mobile-croix has different geometry across captured occurrences ») — les deux SVG ne
  diffèrent que par l'écriture d'un flottant (`3.05176e-05` contre `0`), bruit d'export, défaut d'instrument et non de source ;
  le contrat a été édité à la main (retraits purs), la mise à jour n'en dépendait pas. `DW` à ouvrir : comparer les vecteurs à
  une tolérance, pas à l'octet.

**Contrats** : `ds.header` 3.0.0 → **3.1.0** (MINEUR : ancres inchangées, aucun prop retiré ; parts `iconsNav.*` et `Bouton`
retirées, `nav.tokensByProp desktop.gap = space.24`, `root.tokensByProp wide.padding-block = space.26`) ; `ds.menu-mobile`
1.0.0 → **1.1.0** (parts `actions.User/Cart`, `pied.Bouton/BoutonTablette` retirées). Aucun jeton neuf. Le registre d'icônes garde
`user`, `cart`, `mail` (plus aucun contrat ne les référence — parité muette là-dessus, à trancher : les retirer du registre et
de `assets/icons/` ou les garder pour la boutique).

**Odoo** (addon **19.0.1.20.0**) :
- `views/header.xml` : icônes et CTA retirés de la barre ; icônes et les deux boutons retirés du menu mobile.
- `responsive/header.pqr.css` : plus de règles Mail/bouton ; `.header__nav` gap 24 à ≥ 992, 32 à ≥ 1600 ; padding-block 26 en Wide.
  `responsive/menu-mobile.pqr.css` : règles Bouton/BoutonTablette retirées.
- **Menu** : « Boutique » (`/shop`, séquence 25) et « Contact » (`/contactez-nous`, 50) sont posés en **Python**, pas dans
  `menu_seed.xml` — `website_sale` sème déjà « Shop » sur `/shop` quand il est installé (il l'est chez le client) : la garde est
  **par adresse** (aucune entrée du site ne mène déjà là), drapeau posé une fois (`piqueray_ds.menu_boutique_contact_finalized`),
  install frais par `post_init_hook`, bases existantes par `migrations/19.0.1.20.0/`. « Portes de garage » reste un `<button>`
  (a des enfants) ; « Portes d'entrée » n'a plus d'enfant → lien, sans chevron.
- Miroirs : `header.authoring.json` 2.1.0 (24 épingles → 3.1.0, 6 contrôles + 10 parts CTA/icônes retirés, 7/7 · 16/16),
  `menu-mobile.authoring.json` 1.1.0 (42 épingles, 12 contrôles + 14 parts retirés, 10/10 · 31/31), `version_guard.js`,
  `scan-saved-versions.ts`, `components.xml` (15 × data-v*), `inputs.lock.json` re-épinglé (digest **inchangé** 02d3e549…),
  `parity/baseline.json` : l'acquittement mort `figma|behind|Header.Bouton` retiré (14 → 13).

**Mesure** (instance jetable `piqueray-odoo-header` :8140, base neuve, `.page-parity/vague-031/header-sans-icones/mesure.mts`,
fond aplati #26282c, triptyques dans `mesure/`) :

| Cible | Figma | Odoo | Écart | Lecture |
|---|---|---|---|---|
| Header 390 | 390×76 | 390×76 | 9 px (0,03 %) | contour du logo |
| Header 834 | 834×76 | 834×76 | 9 px (0,01 %) | idem |
| Header 1200 | 1200×86 | 1200×86 | 3 500 px (3,39 %) | lissage + **chevron de « Portes d'entrée »** (voir ci-dessous) |
| Header 1728 | 1728×86 | 1728×86 | 3 499 px (2,35 %) | idem |
| Menu 390 | 390×844 | 390×844 | 12 957 px (3,94 %) | + « Motorisation » (3ᵉ sous-entrée réelle, le set en dessine 2) |
| Menu 834 | 834×1194 | 834×1194 | 11 588 px (1,16 %) | idem |

Sonde (`probe-nav.mts`) : six largeurs d'entrée à ≤ 1 px du set (193,4/194 · 89,2/90 · 144,9/145 · 87,4/88 · 78,2/79), écart 24
en Desktop, 32 en Wide, police Montserrat 500 16 uppercase. **Le seul écart de forme : « Portes d'entrée » = 153,6 px côté Odoo
contre 178 dans le set — le set lui dessine un chevron (Chevron=true), Odoo n'en pose que s'il y a des enfants, et Motorisation
est partie sous « Portes de garage » depuis la spec 037.** 24 px = chevron 16 + écart 8, d'où la nav 866,7/906,7 au lieu de 894/934.
**À trancher (source)** : passer Chevron=false sur « Portes d'entrée » dans `Header` (2 variantes) et `MenuMobile` (2 variantes), ou
lui rendre des enfants. Non fait : hors du GO du jour.

**Chemin UPDATE prouvé** (instance :8140, `odoo shell`) : entrées `/shop` et `/contactez-nous` supprimées + drapeau effacé →
`migrate()` de `19.0.1.20.0` les recrée aux séquences 25 et 50 sous la racine du site ; rejoué une seconde fois → toujours **2**
entrées, aucun doublon (garde par adresse). Cas `website_sale` (un `/shop` déjà présent) non exécuté ici — le module n'est pas
installé sur l'instance jetable ; la garde est la même ligne de code que celle qui a refusé le doublon au rejeu.

**Test d'édition** : `odoo:qa:edition -- --only header` → **sauté** (`ODOO-LIMIT-GENERIQUE-SHELL` : le header n'est pas un snippet ;
le menu s'édite par le dialogue natif « Éditer le menu », inchangé).

**Portes** : build ✔ · geometry:gate ✔ (0 invisible) · odoo:authoring:check ✔ · odoo:module:check 23/23 ✔ · odoo:inputs:check
(repin) ✔ · odoo:derivation:check ✔ · emitters:check ✔ (`core/samples/` d'AccordionRow / TexteSEO / FAQ périmés qui bougent —
attendu) · tsc ×2 ✔ · parity ✔ (cliché rafraîchi via le pont, 13 acquittements, 0 dérive neuve) · figma:plan + catalog + golden
re-pinnés · plugin:check ✔ (engine receipt re-enregistré) · roundtrip ✔ · core-browser ✔ · **eval : **249/252** (2026-09-16, seconde passe) — les 3 rouges sont ceux de HEAD (`figma-text-styles-piqueray`, `computed-floor-gate`, `preservation-013-clobber-detected`), aucun ne nomme le header ni le menu mobile. Un 4ᵉ rouge est apparu à la première passe et a été fermé : `odoo-production-version-drift` — la fixture `version-drift/cases.json` porte la version du module (`data-vcss/vxml/vjs`) et doit suivre le bump 19.0.1.20.0, c'est le **sixième miroir** d'un bump de module**.

**Pièges d'exécution** : le dump complet (`dump.plugin.js`, toutes pages) dépasse les 30 s de `figma_execute` → le lancer en
promesse non attendue + état dans `clientStorage`, résultat POSTé au receveur ; `playwright-core` 1.61 cherche `chromium-1228`
alors que `npx playwright install` pose 1243 → `PLAYWRIGHT_CHROMIUM_PATH` ; ce worktree n'avait pas de `node_modules`
(`sh: tsx: command not found` masqué par un `| tail`) — vérifier `ls node_modules` avant de lire un « exit 0 ».

### Suite du même jour — chevron retiré, icônes orphelines supprimées, Bouton 3.0.0, main fusionnée (GO owner « tu vérifies et tu vires »)

- **Chevron « Portes d'entrée »** : posé à la source (`Chevron=false` sur les deux `NavItem` de la barre ; sur le menu mobile, les
  cinq feuilles des deux variantes nettoyées : chevron faux, aucune sous-entrée — le set portait encore « Motorisation » sous
  « Portes d'entrée » et des sous-entrées héritées). §X : captures avant/après dans `chevron/{avant,apres}/`, versions nommées
  `031 · 28b · AVANT / APRÈS`. Contrats `ds.header` **3.1.1**, `ds.menu-mobile` **1.1.1** (PATCH : l'échantillon du `repeat` passe à
  six entrées, celles du set — il en portait quatre depuis 3.0.0, écart que la 3.1.0 avait laissé passer).
- **Icônes** : `user`, `cart`, `mail` ET `search` (même cas : plus aucun contrat, 0 instance chacune, relevé avant suppression) —
  masters supprimés de `Icônes — icons.registry` (19 → 15), `icons.registry.json` **2.0.0** (zone `2053:1257`, l'ancienne `6:111`
  n'existait plus depuis le rangement), `assets/icons/{user,cart,mail,search}.svg` supprimés. **Conséquence obligée : `ds.button`
  2.5.0 → 3.0.0** — les deux énumérations `iconLeftGlyph` / `iconRightGlyph` suivent le registre à l'octet (le build refuse sinon)
  et perdre une valeur d'énumération est MAJEUR par la règle du dépôt, alors qu'aucun usage ne casse (défauts arrow-left/right
  intacts). Sur le canevas, `preferredValues` des deux « Glyphe » du master Bouton 19 → 15, **718 instances avant, 718 après**.
  Miroirs : **242 épingles** `ds.button` dans 12 `*.authoring.json`, lock re-épinglé, **graphDigest changé** (02d3e549… → 7b373ca3…)
  donc `version_guard.js`, `scan-saved-versions.ts`, `components.xml` (16), fixture `version-drift` (2) — `odoo:module:check` nomme
  chacun tant qu'il manque.
- **`main` fusionnée dans la branche** (3 commits, dont `breakpoint.wide` 1600 → 2000) : conflit sur `header.pqr.css` résolu en
  gardant notre feuille avec le seuil 2000 ; `derivation-report.json` régénéré. Conséquence sur la mesure : **à 1728 Odoo rend
  désormais les règles Desktop** (écart de nav 24), la planche Wide du set (1728, écart 32) n'est plus l'attendu à cette largeur —
  Wide ne s'applique qu'à ≥ 2000 (décision owner du jour, tinyspec `breakpoint-wide-2000`).
- **Mesure 2** (`mesure-2.mts`, exports `apres-2/`, triptyques `mesure-2/`, addon fusionné `-u`) :

| Cible | Écart | Lecture |
|---|---|---|
| Header 390 / 834 | 0,03 % / 0,01 % | contour du logo |
| Header 1200 | 3 798 px (3,68 %) | **lissage seul** — plus de texte doublé, nav 866,7 contre 870 |
| Header 1728 | 5 344 px (3,60 %) | lissage + écart 24 (Desktop, main) contre 32 (planche Wide) |
| Menu 390 / 834 | 3,93 % / 1,16 % | « Motorisation » (contenu réel), lissage |

- Portes après ce lot : build ✔ · geometry:gate ✔ · authoring ✔ · module 23/23 ✔ · derivation ✔ · emitters ✔ · plugin ✔ · tsc ×2 ✔ ·
  parity ✔ (cliché rafraîchi, 59 sets, 13 acquittements inchangés) · golden + receipt re-pinnés · **eval : 249/252** (troisième passe) — mêmes trois rouges que HEAD ; deux cas d'eval ont dû suivre le registre 2.0.0 : `detect-icon-registry-divergence` semait le retrait de `cart` (désormais réellement absent → sème `phone`), `lower-icon-swap-and-visibility-into-props` attendait 13 glyphes dont `cart` (le dump committé en liste 13, l'intersection avec le registre vivant en fait 10).
