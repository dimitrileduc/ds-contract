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
