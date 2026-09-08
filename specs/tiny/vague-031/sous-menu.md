# Journal — Sous-menu desktop/wide (sets `SousEntree` 2793:49492 + `SousMenu` 2793:49493), Figma → contrats → Odoo

**Date** : 2026-09-08. **Périmètre** : le panneau qui s'ouvre sous une entrée à enfants de la barre, en Desktop et Wide.
Le header (set 2732:12096, `ds.header` 3.0.0) et `ds.nav-item` 1.2.0 ne sont **pas** touchés. **Où** : page
`031 · Planches de validation`, section `031 · 22 · SOUS-MENU DESKTOP — ds.sous-menu (proposition · 3 options · 2026-09-08)`
(`2793:49079`). Versions nommées : `031 — avant SOUS-MENU : set SousEntree + SousMenu` (avant les sets) et
`031 — SOUS-MENU : sets + démos (option A)` (après).

## Décisions (owner, 2026-09-08)

- Depuis la spec 022 le sous-menu était le déroulant Bootstrap d'Odoo (FR-009, différé nommé) : panneau blanc, actif en
  violet Odoo. **Aucun panneau n'avait jamais été dessiné** (relevé du canevas : `NavItem`, `VoileNavigation`, rien d'autre).
  Ordre §VIII : dessiner d'abord, contracter ensuite, projeter enfin.
- Trois options posées sur la planche en contexte (instance du Header 031 sur la photo du hero) : A « Rail » (trois liens,
  rail orange + retrait 22 = le menu mobile), B « Rail + repères » (une ligne d'aide par lien + lien « Toutes nos portes
  de garage »), C « Bandeau pleine largeur » (photos des catégories). **Owner : option A.**
- Interaction : ouverture au **clic**, pattern « disclosure » (W3C APG, Roselli) — `<button aria-expanded aria-controls>`,
  liste de liens, **jamais `role="menu"`** ; Échap ferme et rend le focus ; clic dehors et sortie du focus ferment ; un seul
  panneau ouvert. Pas de survol seul (NN/g : déclenchement accidentel, inexistant au tactile).
- Typographie : rôle `typography.menu-sous-entree` (18/27 Mobile, **16/24 dès Tablette**) — la planche de proposition
  montrait 18 (cadres sans mode) ; les démos A portent maintenant le mode Responsive explicite (Desktop / Wide) et rendent 16/24.

## Ce qui est construit sur le canevas (rien retiré, rien réécrit ailleurs)

| Objet | Détail |
|---|---|
| Set `SousEntree` | axe `Etat` = Repos \| Actif ; prop `Libellé` TEXT ; colonne, min-height `size/cible-tactile/min`, gap `space/4` ; `texte` au style « Sous-entrée menu », blanc (Repos) / orange (Actif) ; `Soulignement` FILL, hauteur `size/nav-item/soulignement`, visible en Actif |
| Composant `SousMenu` | fond `color/noir-bleute`, filet `color/blanc-14` × `border-width/1`, padding `space/24` / `space/32` ; `sousEntrees` (rangée, gap `space/22`) > `rail` (largeur `size/nav-item/soulignement`, FILL vertical) + `liste` (colonne, gap `space/4`) > 3 instances `SousEntree` (Portes résidentielles · Portes industrielles · Motorisation, toutes Repos) |
| Démos A | Wide 1728 et Desktop 1200 : instance `SousMenu` sous la barre, rangée 2 en Actif, parent ouvert (libellé orange, chevron retourné = vecteur posé à côté, la rotation n'étant pas surchargeable dans une instance) |
| Correction de source | `strokesIncludedInLayout` était **vrai** sur `SousMenu` (créé par API) : le filet ajoutait 2 px à la boîte (252×190) là où le CSS border-box la garde à 250×188. Mis à **faux** → 250×188 des deux côtés. Le dump ne porte pas ce drapeau : rien à changer au contrat |

## Dump, extraction

- Dump v1.8 des deux sets (`TARGET_SETS = ['SousEntree', 'SousMenu']`, script servi sur 9224, JSON reçu sur 9226),
  **0 dégradation**. Extraction : `SousEntree` 6 notes / 0 non lié, `SousMenu` 8 notes / 0 non lié.
- Notes classées : `libell` → renommé `libelle` (caractère hors identifiant) · `semantics.element` → `a` (SousEntree) et
  `div` (SousMenu) · `tokensByProp` etat=actif → orange **adopté** · stroke `blanc-14` « opacité non représentable » →
  le jeton `color.blanc-14` porte déjà l'alpha, adopté · `items` arrayOf proposé avec `libell` seul → `{libelle, href}`,
  `etat` **hors** de la donnée (posé par Odoo, comme `actif` sur la barre) · stub `imported.stub-sous-entree.root.height`
  → **supprimé** (le contrat enfant existe) · 3 instances → `repeat` sur `items`, sample = les trois dessinées.
- Déviations nommées : `Soulignement` `visibleWhen etat=actif` (le dump ne porte pas la visibilité par variante) ;
  racine `align: stretch` (le libellé est HUG et le Soulignement FILL sur le canevas — même boîte) ; `href` code-only.

## Contrats (1.0.0, molécules)

- **`ds.sous-entree`** : `etat` repos|actif (VARIANT Etat), `libelle` (TEXT), `href` (NONE). Racine `<a>` : `href`,
  `aria-current="page"` en actif ; `states` hover (texte orange, canal de part) + focus-visible (anneau orange,
  `border-width.2`) — sans `figmaStatePreviews` (non dessiné, nommé).
- **`ds.sous-menu`** : `items` arrayOf `{libelle, href}` ; racine panneau ; `sousEntrees` > `rail` + `liste` > `SousEntree1`
  (component + repeat). Aucun axe de présentation.
- Portes : build ✔ · geometry:gate ✔ (0 littéral invisible) · emitters:check ✔ · tsc ✔ (src + build).

## Odoo (instance 037 sur 8109 — celle qui monte CE worktree ; le pilote 8087 monte `oceanic-oak`)

- `views/header.xml` : dans la zone 022, le parent à enfants devient `<button class="nav-item" aria-expanded
  aria-controls>` (plus de `data-bs-toggle`) ; le panneau est un gabarit à part `piqueray_ds.sous_menu` (zone
  **`ODOO-031-SOUS-MENU`**, appelée par `t-call`) — une zone **imbriquée** dans la zone 022 est refusée par
  `odoo:derivation:check` (« imbrique … dans ODOO-022-HEADER-ACTIF »).
- `static/src/js/sous_menu_interaction.js` (zone `ODOO-031-SOUS-MENU-INTERACTION`) : disclosure ; position **mesurée**
  (haut = hauteur de la barre, gauche = libellé du parent − retrait mesuré du texte dans le panneau), rien en dur.
- `static/src/css/responsive/sous-menu.pqr.css` : `.header` relatif, panneau absolu, `[hidden]`, reset du `<button>`,
  état ouvert du parent sur `aria-expanded` (libellé orange, chevron `rotate(180deg)` + fill orange) — **fait code-only** :
  `ds.nav-item` n'a pas d'état « ouvert ».
- Miroirs : `repo-data.ts` (`ds.sous-menu` racine **shell**, sélecteur `.sous-menu` → fermeture CSS émise), schéma du
  registre (énumération), `sous-menu.authoring.json` (4 props · 8 parts, couverture ✔), registre d'adaptations (2 entrées),
  `__manifest__.py` (feuille + script), lock **repinné** (2 contrats ajoutés), `figma:plan` (42/43-sous*.js), catalogue,
  reçu du plugin, golden. Scénario QA `header-nav.spec.mts` : `.dropdown-menu`/`.show` → `.sous-menu`/`hidden`,
  `DROPDOWNS = ['Portes de garage']` (« Portes d'entrée » est une feuille depuis 037).

**Sonde** (`.page-parity/sous-menu/probe.mts`, `/portes-industrielles`, 1728 et 1200) :

| Vérification | Résultat |
|---|---|
| Clic → `aria-expanded=true`, panneau visible, libellé orange, chevron retourné et orange | ✔ (les deux largeurs) |
| Survol d'une rangée → texte orange | ✔ |
| Échap → fermé, focus rendu au parent | ✔ |
| Entrée → ouvert ; Tab → première sous-entrée ; Tab hors du groupe → fermé | ✔ |
| Clic dehors → fermé | ✔ |
| Rangée courante : `sous-entree--etat-actif` + `aria-current="page"`, orange + soulignement | ✔ |
| Boîte du panneau contre la démo Figma A | **250×188 = 250×188**, x +2 px (position de la nav, résidu connu de NavItem) |
| Pixels sur la boîte commune | **2,70 %** aux deux largeurs (1 271 px = lissage du texte, aucune boîte différente) |
| Erreurs de page | 1 `TypeError … querySelector` dans `web.assets_frontend_minimal` **au chargement, sans interaction, identique sur le pilote 8087 non touché** → antérieure, pas de ce chantier |

## À corriger / à trancher

- L'état « ouvert » du parent (libellé orange, chevron retourné) est dessiné sur les démos mais **n'est pas un fait de
  `ds.nav-item`** — le porter au contrat serait un MINOR sur la barre (6 miroirs Odoo, 264 épingles). Différé, nommé.
- Le retrait 22 du rail est un littéral sur le canevas (`itemSpacing` non lié — comme sur `MenuEntree`) ; le contrat
  porte `{space.22}`. À lier à la source lors d'un prochain passage sur les deux sets.
- L'erreur de page antérieure (`web.assets_frontend_minimal`, `querySelector` sur null) mérite son propre relevé.

## Mouvement (ajout du même soir, code-only — `responsive/sous-menu.pqr.css`)

Repères : Material 3 « emphasized » `cubic-bezier(0.2, 0, 0, 1)`, Emil Kowalski (un déroulant de 180 ms paraît plus
réactif qu'un de 400 ; ease-out à l'entrée ; sortie plus courte). Appliqué : **entrée 150 ms** (fondu + 4 px de
descente) via `@starting-style` quand `display` passe de none à flex, **sortie instantanée** (`hidden`), chevron du
parent en rotation 150 ms, tout coupé sous `prefers-reduced-motion`. Sans `@starting-style` (≈ 10 % des navigateurs
début 2026) le panneau apparaît d'un coup — dégradation acceptée. **Mesuré** (`.page-parity/sous-menu/desktop-anim.mts`) :
opacité 0,73 à 60 ms, 1 à 167 ms ; Échap → `hidden` immédiat. Aucune valeur au contrat : `ds.sous-menu` ne décrit pas
de mouvement, ce fait est nommé ici et dans la feuille.
