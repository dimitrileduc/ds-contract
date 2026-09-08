# Journal — Menu mobile ouvert (sets `MenuEntree` 2738:13482 + `MenuMobile` 2738:13621), côté Figma

**Date** : 2026-09-04. **Périmètre** : le menu OUVERT en Mobile et Tablette. Le header (set 2732:12096, contrat 3.0.0)
n'est pas touché. **Où** : page `031 · Planches de validation`, section `031 · MENU MOBILE — 2 variantes`.
Versions nommées avant (`031 — avant MENU MOBILE …`) et après (`031 — MENU MOBILE : proposé …`).

## Décisions (owner, 2026-09-04)

- Brainstorm Claude Design (3 pistes, canevas `Menu mobile Piqueray`) → **piste A (plein écran typographique) en Mobile,
  piste B (tiroir latéral) en Tablette**.
- **« Ouvert » n'est pas une prop du header.** Recherche docs + web : matrice §9 (une interaction n'est pas un fait rendu,
  décision owner 2026-08-18), contrats de nav de l'archive (« repli et imbrication = couche comportement »), précédent
  **AccordionRow** (l'état ouvert d'une ligne est une variante Figma + prop `etat`, le clic est un script Odoo à part).
  Pratique Figma : variantes pour les états d'un même objet, composant séparé pour un objet différent — la barre de 76 px et
  le panneau plein écran ne prennent jamais la même place. Accessibilité : `<button aria-expanded aria-controls>`, Échap
  ferme, focus rendu au burger, sous-menus au clic. Odoo 19 : panneau natif Bootstrap offcanvas (notre shell l'avait
  entièrement retiré — vérifié : aucun offcanvas dans nos pages aujourd'hui).
- Sous-entrées : couleur blanche dans les deux variantes (la piste B les dessinait bleu-gris) — une seule règle.
- **Pied = téléphone + Contactez-nous ; compte et panier dans la BARRE du menu, à côté de la croix** (owner 2026-09-04 :
  la ligne téléphone + icônes au-dessus du CTA ne se lisait pas ; compte et panier restent, ce seront des liens). Même
  place que sur desktop, à côté de la nav. Le pied reste en bas : zone du pouce.
- **Chaque variante est l'écran entier, comme les autres sets** (remarque owner 2026-09-04 : « pourquoi Mobile et Tablette
  ont la même largeur ? ») : Tablette = 834×1194 avec un plan `voile` (noir-bleuté, opacité 72 %, absolu, étiré) et un
  `tiroir` 420 ancré à droite. Première version (tiroir seul, 420) corrigée. Côté Odoo, le voile = backdrop natif de l'offcanvas.
- Piège API relevé deux fois : `setBoundVariableForPaint` **perd l'opacité** du paint (filet 14 %, voile 72 %) → reposer
  `opacity` après la liaison ; et `resetOverrides()` sur une instance absolue la **remet dans le flux** (position perdue).

## Ce qui est construit (rien retiré, rien réécrit dans le header)

| Objet | Détail |
|---|---|
| Variables Responsive (6) | `typography/menu/entree-size` 24·16·16·16 · `entree-line-height` 30·16 · `sous-entree-size` 18·16 · `sous-entree-line-height` 27·24 · `spacing/menu/entree-pad-v` 12·4 · `size/menu/entree-hauteur` 68·52 — toutes décrites « 031 provisoire » |
| Styles de texte (2) | `Entrée menu` (Medium, capitales, liés taille + interligne) · `Sous-entrée menu` (Regular, liés) — marqueur `ds_contracts: derived from tokens/typography.menu-*.size` |
| Set `MenuEntree` | axe `Etat` = Fermé \| Ouvert ; props `Libellé` TEXT, `Chevron` BOOLEAN, `Sous-entrée 1/2` TEXT, `Deux sous-entrées` BOOLEAN ; filet bas blanc 14 % ; rail orange (largeur `size/nav-item/soulignement`) ; boîte chevron et rangées de sous-entrées à `size/cible-tactile/min` ; hauteur de tête `size/menu/entree-hauteur`. Aucun mode explicite (les instances suivent l'hôte) |
| Set `MenuMobile` | `Presentation=Mobile` 390×844 (barre logo + croix, nav 4 entrées, pied téléphone + icônes + Bouton Blanc FILL) · `Presentation=Tablette` 420×1194 (croix, nav, pied compte/panier nommés + téléphone + Bouton Outline blanc). Instances DS : PiquerayLogo 4:15, Bouton 6:122, icônes User/Cart clonées du header Desktop. Mode Responsive posé par variante |
| Vues de démo | `Accueil — mobile 390 · fermé (démo prototype)` 2738:14623 · `Accueil — mobile 390 · menu ouvert` 2738:13622 (instance absolue en 0,0) · `Accueil — tablette 834 · menu ouvert` 2738:13702 (voile noir-bleuté 72 % + tiroir ancré à droite). Copies des vues home, **les 4 vues home sont intactes** |
| Prototype | **Mobile** : burger → menu ouvert en fondu (Smart Animate, 280 ms ease-out), croix → fermé (180 ms ease-in). **Tablette** : vue fermée avec le tiroir hors champ (x + 420, opacité 0) → ouvert par Smart Animate (glisse depuis la droite + fondu du voile, 300 ms ease-out), croix → fermé (200 ms ease-in). Deux flux : « Menu mobile — démo », « Menu tablette — démo ». Repères : NN/g (200–300 ms pour un changement d'écran, entrée > sortie, ease-out/ease-in), Material (sortie franche pour un panneau rappelable). **Code-only à ne pas perdre côté Odoo** : décalage de 40 ms entre les 4 entrées à l'ouverture (montée de 16 px), burger qui devient croix ; n'animer qu'opacité et transform |
| Ménage | section header : instance de test et banc de resize retirés |

## À corriger / à trancher

- Le voile de la démo tablette porte une opacité brute 0,72 (pas de variable d'opacité) — décor de vue, pas de composant.
- Le filet des entrées est blanc à 14 % d'opacité (paint) : la même chose côté contrat sera un `color.blanc` + opacité, ou un
  jeton de couleur à minter si l'owner veut un aplat.
- Pas de dump ni d'extraction encore (après validation owner).

## Dump, extraction, corrections de source (2026-09-04, après validation owner du set et du prototype)

- Dump v1.8 des deux sets (`.page-parity/vague-031/dumps/Menu.live.dump.json`), planches `Menu-390/834.png` (démos).
- L'extraction a refusé puis remonté cinq défauts, tous corrigés à la source (0 px, versions nommées) :
  rotation 180° du chevron (non portée par le dump) → glyphe **chevron-up** du registre ; chevron bas → **chevron-down** du
  registre (même famille) ; croix en traits (non promue) → croix en aplat ; tracés tous nommés `Vector` → nommés ; filet 14 % et
  voile 72 % en opacité de paint (non représentable sur un jeton) → variables couleur **`color/blanc-14`**, **`color/noir-bleute-72`**
  (précédent beige-clair-80) ; ossature Mobile ≠ Tablette (collisions de noms `barre2`, `nav2`…) → **root > tiroir** dans les deux.
- Variables alignées sur les chemins de `tokens/` (la parité compare par nom exact) : `typography/menu-entree/{size,line-height,
  family,weight}`, `typography/menu-sous-entree/*`, `spacing/menu/{entree-pad-v,entree-hauteur}` (valeurs brutes comme les autres
  spacing/*), primitives `size/menu-mobile/tiroir` 420, `size/menu-entree/hauteur/{mobile,tablette}` 68 / 52. Tiroir Tablette lié.
- Résultat : `menu-entree` 35 notes / 1 non lié (padding-bas seul, porté en longhand), `menu-mobile` 42 notes / 0 non lié.

## Contrats + jetons (2026-09-04)

- **`ds.menu-entree` 1.0.0** (molécule) : `etat` ferme|ouvert (VARIANT Etat), `libelle`, `href` (code-only), `chevron`, `sousEntree1/2`,
  `deuxSousEntrees`. Tête `min-height` `spacing.menu.entree-hauteur`, chevrons = icônes du registre (`chevron-up` orange en
  ouvert, `chevron-down` blanc en fermé), sous-entrées `visibleWhen ouvert`, filet bas `color.blanc-14`.
- **`ds.menu-mobile` 1.0.0** (shell) : `presentation` mobile|tablette, `items` (arrayOf, code-only, même donnée que le header).
  Root colonne étirée (Mobile) / rangée alignée à droite (`layoutByProp` tablette) ; `voile` absolu `visibleWhen tablette` ;
  `tiroir` largeur `size.menu-mobile.tiroir` en Tablette ; `barre` (logo `visibleWhen mobile`, actions compte/panier/croix) ;
  `nav` (repeat de `ds.menu-entree`, sample fermé — la 1ʳᵉ entrée est dessinée ouverte sur le canevas, déviation nommée) ;
  `pied` (téléphone, `Bouton` blanc `visibleWhen mobile`, `BoutonTablette` contour `visibleWhen tablette`). Hauteur d'écran non
  portée (code-only). Croix = boîte 24 (`size.header.icone`, position relative) > glyphe vectorAsset `menu-mobile-croix`
  (promu dans `assets/vectors/`). Premier refus utile du schéma : `grow` n'existe pas en `layoutByProp` → la variation est
  portée par le root (colonne/rangée), pas par le tiroir.
- Jetons : `color.blanc-14`, `color.noir-bleute-72`, `size.menu-mobile.tiroir`, `size.menu-entree.hauteur.{mobile,tablette}`
  (primitives) ; `typography.menu-entree`, `typography.menu-sous-entree` (semantic, `figmaTextStyle` responsive, + overrides
  tablette/desktop/wide) ; `spacing.menu.{entree-pad-v,entree-hauteur}` (semantic + overrides). Fixture des styles : 22 → 24
  recettes, compte global 77/38 → **87/53** (voir le commentaire daté dans le fixture : +2 propres = numéro sur libelle-nav ;
  les 13 autres = chantier Avis Google en cours).

## Odoo (instance pilote 8087, 2026-09-04)

- `views/header.xml` : le burger devient déclencheur de l'offcanvas `#pqr_menu_mobile` ; gabarits `menu_mobile_entry` +
  `menu_mobile` (zone `ODOO-031-MENU-MOBILE`, hors de la zone 022, classée `odoo-qweb-composition` dans le registre).
  Feuille = lien, déroulant = `<button aria-expanded>` ; deux chevrons + liste des sous-entrées dans le DOM, plan inactif `hidden`.
- `static/src/js/menu_mobile_interaction.js` (zone `ODOO-031-MENU-MOBILE-INTERACTION`, `odoo-repeat-dom`) : bascule
  `menu-entree--etat-ouvert` sur le modèle FAQ. L'ouverture du menu, Échap, focus, backdrop = offcanvas Bootstrap du noyau.
- `static/src/css/responsive/menu-mobile.pqr.css` : boîte (plein écran < 768, tiroir 420 à droite 768–991, absent ≥ 992),
  motion (fondu 280/180 + montée décalée 40 ms en Mobile ; glisse 300/200 en Tablette), backdrop = `color.noir-bleute-72`,
  recopie des règles `--presentation-tablette`, un bouton par plage, `prefers-reduced-motion`. **Sondé** : le CSS du header
  d'Odoo remet l'offcanvas en `position: relative` → position/insets/z-index posés explicitement (tiroir à gauche sinon).
- `scripts/odoo/lib/repo-data.ts` : `ds.menu-mobile` ajouté aux racines shell (CSS de fermeture émise, lock). Schéma du registre
  d'adaptations : `ds.menu-mobile` ajouté à l'énumération. `config/menu-mobile.authoring.json` générée depuis la fermeture
  (`.page-parity/gen-authoring-menu.mjs`, 22 contrôles · 45 parts, couverture ✔) — liens du menu `native-menu`, état `computed-display`.

**Mesure** (`.page-parity/capture-menu.mts` : burger → menu ouvert → 1ʳᵉ entrée dépliée → capture de la fenêtre, home `/`) :

| Témoin | Zone | Écart | Lecture |
|---|---|---|---|
| Mobile 390×844 | fenêtre entière | **2,83 %** | lissage du texte ; boîtes identiques (entrée 1 y 100 h 184, pied y 686 h 158, bouton 342×54) |
| Tablette 834×1194 | tiroir seul (414–834) | **1,61 %** | lissage du texte ; tiroir à x 414, entrée 1 y 84 |
| Tablette 834×1194 | page voilée (0–414) | 26,5 % | **contenu** : la home du pilote n'a pas les mêmes photos/sections que la vue Figma — pas le menu |

Triptyques : `.page-parity/menu-mesure/triptyques/`.

**Portes** : build ✔ · emitters ✔ · catalog ✔ · geometry:gate ✔ · plugin:check ✔ · core-browser ✔ · parity ✔ (« No new drift »,
cliché rafraîchi) · odoo:inputs/module/authoring ✔ · derivation:check ne cite plus que `ODOO-031-GOOGLE-REVIEWS-PANEL` (autre
chantier) · golden + engine receipt re-pinnés · tsc : seuls GoogleReviews/GoogleReviewsSection (autre chantier).

## Correctif du 2026-09-08 — « doublon » d'animation à l'ouverture (Mobile)

Symptôme owner : les entrées semblaient apparaître deux fois. **Mesuré** (`.page-parity/sous-menu/mobile-anim.mts`,
390×844, relevé toutes les 30 ms après le clic sur le burger) : de 0 à 290 ms l'offcanvas porte `showing` et fond
à 1 avec les entrées **déjà à opacité 1** ; à 290 ms Bootstrap remplace `showing` par `show`, et la montée
(`pqr-menu-entree-monte`, keyée sur `.show` seul) démarrait seulement là : entrées à 0 / +16 px, remontée jusqu'à
~700 ms pour la 4ᵉ. Deux apparitions.

Correctif (`responsive/menu-mobile.pqr.css`) : la montée et ses délais sont keyés sur **`.showing` ET `.show`** avec
la même déclaration — une animation ne redémarre que si sa déclaration change, donc elle survit au remplacement de
classe. Après : à 9 ms les entrées partent de 0 / +16 px en même temps que le fondu, à 294 ms (`show`) la 1ʳᵉ est à
1 / 0 px sans retomber, la 4ᵉ est en place à ~410 ms. Même traitement des exceptions Tablette et `prefers-reduced-motion`
(`animation: none` sur les deux classes). Aucun contrat, aucun jeton touché ; le fait « fondu 280 ms + montée décalée
de 40 ms » du contrat est enfin ce qui se voit.

**Affinage du même soir (owner : « le plus smooth, minimal, clean »)** — repères : Material 3 « emphasized »
`cubic-bezier(0.2, 0, 0, 1)` (80 % du chemin dans les premiers 20 % du temps), Emil Kowalski (entrées < 300 ms,
ease-out pour la réactivité, jamais d'ease-in à l'entrée, translations petites). Appliqué : cette courbe sur le fondu,
la montée et le glissement Tablette ; montée 16 → **12 px** ; durées, décalage 40 ms et sorties inchangés (le contrat
décrit toujours ce qui se voit). Mesuré : la 1ʳᵉ entrée est à 1 / 0 px avant `show` (292 ms), la 4ᵉ à 0,92 à cet instant
et en place à ~420 ms.
