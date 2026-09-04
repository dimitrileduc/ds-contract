# Journal — Footer 031 (set `Footer` 2735:12509), côté Figma seulement

**Date** : 2026-09-04. **Périmètre** : footer — construction du set sur les clones de
`031 · FOOTER — 4 variantes` (2732:10534), page `031 · Planches de validation` (2613:18825),
**puis substitution dans les 4 vues home** (GO owner 2026-09-04). **Aucun master DS modifié.**

Versions nommées :
`031 — avant nettoyage FOOTER (4 clones bruts, section 2732:10534)` (2395277135790973947) ·
`031 — FOOTER nettoyé : set Presentation + modes Responsive, valeurs liées…` (2395279201683326415) ·
`031 — avant substitution Footer dans les 4 vues home` (2395278505870679925) ·
`031 — Footer substitué dans les 4 vues home (set 2735:12509, 0 composant détaché, 0 valeur non liée)`
(2395283882653639405) ·
`031 — Footer : icônes sociales instanciées, TitreReseaux sur le style H4, banc de resize` (2395285690818951365).

## Source relevée (les 4 vues home, une vérité par mode)

| Vue | Nœud source | Forme | Particularité |
|---|---|---|---|
| Mobile 390 | `footer` 2617:56417 | copie détachée (3 niveaux), pad 64/24 | « Suivez-nous » en 5ᵉ colonne du haut |
| Tablette 834 | `footer` 2674:15410 | idem, pad 64/48 | le cadre extérieur mesure **899** et **rognait** les 926,3 du contenu |
| Desktop 1200 | `footer` 2647:7983 | copie détachée, pad 128/56/32/56 | pas de colonne « Suivez-nous » : icônes en **bas à droite** (`LigneBas`) |
| Wide 1728 | `Footer + Devis` 2624:57637 → instance du master DS `Footer` 2120:4785, pad 128/89/32/89 | seule variante instanciée | « Suivez-nous » en 5ᵉ colonne, pas d'icônes en bas |

## Défauts de source relevés → traités sur les clones

| # | Défaut | Vues | Traitement |
|---|---|---|---|
| F1 | **11 tracés nommés `Vector`, géométries différentes** — collision d'asset garantie à l'extraction (le refus déjà rencontré sur le header) | les 4 | tracés sociaux renommés `facebook` / `instagram` ; les 9 du logo réglés par l'instanciation (l'extraction ne moissonne pas l'intérieur d'une instance) |
| F2 | `FooterColumn` / `FooterColumn 2` / `FooterColumn 3` : la colonne ne se lit pas comme une répétition | les 4 | renommées `FooterColumn` |
| F3 | Valeurs brutes : gouttières 48 / 56, `Row.gap 64`, `col1.gap 24`, paddings 24 et `counterAxisSpacing 8` du bouton, filet `#e0e0e0` | les 4 | liées à des variables **existantes** (`space/24`, `space/8`, `space/48`, `space/56`, `space/64`, `color/gris-clair`) — **aucun mint** |
| F4 | 17 copies détachées de composants gouvernés | Mobile, Tablette, Desktop | **toutes instanciées** : logo, bouton, 3 colonnes, copyright |
| F5 | Titres de colonne en Medium dans les 4 usages alors que le master `FooterColumn` 2079:2246 est en **Regular** | les 4 | graisse Medium reportée sur les instances (comme le faisait déjà Wide). **Le master reste faux** — à corriger à la source |
| F6 | **Hauteur fantôme du cadre du logo** : dessin de 34 px enfermé dans un cadre de 64,6 (Mobile) et **139,4** (Tablette), soit 30,6 et 105,4 px de vide | Mobile, Tablette | cadre remplacé par l'instance `PiquerayLogo / Couleur=Blanc` : le footer se resserre d'autant (GO owner) |
| F7 | **Le fond ne couvrait pas la boîte** (contrainte verticale `MIN`, hauteur liée à `size/footer/background` = 459 fixe) : bande transparente de 27 px en Tablette, 3 px en Desktop | les 4 | fond passé en `STRETCH` sur la hauteur de la racine ; la liaison à la hauteur fixe est retirée — la hauteur du fond n'est plus une valeur indépendante |

**Reste brut, hors périmètre du set (dans les masters DS)** :
`FooterColumn` 2079:2246 — titre en Regular au lieu de Medium (surchargé par 100 % des usages) ·
`PiquerayLogo` 4:15 — fond blanc masqué sur la racine ·
`Facebook` 2053:1259 et `Instagram` 2053:1261 — **pas de propriété `Couleur`** : le master est sombre,
le footer les veut blanches. Contourné par une **surcharge de remplissage liée à `color/blanc`** sur chaque
instance (8 instances). La propriété manque toujours au master.

## Mints

**Aucun.** Les six variables nécessaires existaient déjà.

## Set

`Footer` 2735:12509, axe `Presentation` = Mobile (défaut) · Tablette · Desktop · Wide
(2735:12505 / 12506 / 12507 / 12508). Racines FIXED en largeur / HUG en hauteur, mode `Responsive`
posé sur chacune. Instance de test sous le set (2735:12510).

**Contrôle final, les 4 variantes : 0 valeur d'espacement non liée · 0 remplissage brut visible ·
0 composant détaché.** Hauteurs : 868,9 · 820,9 · 462 · 459.

## Déviations conservées, par décision (« le design est acté »)

- Desktop ne ressemble pas à Wide : icônes sociales en bas à droite contre 5ᵉ colonne « Suivez-nous » ;
  24 px contre 32 px ; copyright 18 px contre 14 px ailleurs. Porté par des surcharges d'instance.
- Les tailles de texte des colonnes (20/14 en Mobile-Tablette, 24/18 en Desktop-Wide) sont des
  **surcharges d'instance**, pas des jetons : le master `FooterColumn` a 36 instances vivantes, le
  rendre responsive rétrécirait tout usage sans mode posé. Même pivot que celui différé pour le
  master DS `Header`. **Conséquence à porter au contrat : ces tailles ne sont pas gouvernées par un jeton.**
- Trois cadres d'espacement (`Spacer`, `Separator`, `spacer2`) tiennent lieu de gaps asymétriques
  autour du filet : conservés, un `itemSpacing` unique ne sait pas le faire.
- Le filet reste dessiné de deux façons (hauteur 1 + remplissage lié en Mobile/Tablette ; hauteur
  0,0001 + contour blanc lié en Desktop/Wide). Les deux sont liés ; unifier changerait une couleur.
- Textes : `\n` en Mobile/Tablette, `\r` en Desktop/Wide. Non touché — à surveiller au contrat.

## Mesure pixel — variantes du set contre les clones d'origine (export REST 1x)

| Variante | Écart | Cause |
|---|---|---|
| Mobile | 11 783 px (3,48 %), boîte 900 → 869 | F6 : suppression des 30,6 px de vide sous le logo, tout remonte |
| Tablette | 14 096 px (2,06 %), boîte 900 → 821 | F6 : 105,4 px de vide supprimés |
| Desktop | 3 600 px (0,65 %), zone y 459–461 | F7 : les 3 px de bande transparente deviennent du fond |
| Wide | 6 347 px (0,80 %), zone y 134–247 | libellé du bouton 16 → **18** : mode Wide + « Libellé bouton » responsive (Button 2.1.0). Même déviation que le header, attendue |

## Substitution dans les 4 vues home

Ancien footer (dernier enfant de flux, index 8) remplacé par une instance de la variante
correspondante, même index, `FILL / HUG`.

| Vue | Instance | Écart avant/après | Zone | Hauteur de la vue |
|---|---|---|---|---|
| Mobile 390 | 2735:12640 | 11 784 px (0,331 %) | y 8388–9093 | 9 165 → 9 135 |
| Tablette 834 | 2735:12684 | 14 096 px (0,205 %) | y 7557–8240 | 8 334 → 8 256 |
| Desktop 1200 | 2735:12728 | 3 600 px (0,048 %) | y 6230–6232 | 6 233 (inchangée) |
| Wide 1728 | 2735:12771 | 7 267 px (0,065 %) | y 6135–6423 | 6 460 (inchangée) |

**Tout écart est confiné à la bande du footer ; tout ce qui est au-dessus est identique au pixel.**
Les anciens footers (copies détachées, wrapper du master DS en Wide) n'existent plus. Le master DS
`Footer` 2120:4785 passe de 10 à **9 instances** — il n'a plus d'usage dans les vues 031 (les pages
`Pages` l'utilisent toujours). Reçus : `.page-parity/vague-031/{footer-avant,footer-apres,vues-avant-footer,vues-apres-footer}/`
(gitignorés, reproductibles).

## Corrections aux masters DS (GO owner 2026-09-04, faites)

1. **`PiquerayLogo` 4:14 — fond blanc masqué retiré des DEUX variantes** (`Couleur=Default` et
   `Couleur=Blanc`). 44 instances, **0 px** sur le set, sur la variante blanche et sur le footer.
   Version : `031 — masters DS : fond blanc masqué retiré des 2 variantes de PiquerayLogo (0 px)`
   (2395294057964910116).
2. **`FooterColumn` 2079:2246 — titre passé en Montserrat Medium.** Le compte réel est **66 instances**,
   pas 36 : 36 sur les planches 031 (qui surchargeaient déjà en Medium), **27 sur les 9 pages du client**
   (Accueil, Portes de garage, Portes de garage résidentielles, Portes de garage industrielles,
   Motorisation, Portes d'entrée, Dépannage/SAV, À Propos, Contactez-nous — 3 colonnes chacune) et 3 dans
   `DS · Organisms`, toutes en Regular hérité. Ce n'était donc PAS une correction invisible : c'est un
   choix de design, arbitré par l'owner (option A, alignement sur les 031).
   Mesure : master 134 px sur les glyphes du titre · vue `Accueil` du client **351 px (0,0037 %)**,
   confinés à la bande du footer (y 5137–5154) · variantes 031 Wide et Desktop **0 px** (elles
   portaient déjà la surcharge). Version : `031 — master FooterColumn : titre en Montserrat Medium
   (GO owner)` (2395302162564752150).
   **Limite nommée (§X)** : l'état avant n'a été capturé que sur UNE des 9 pages client. Le mécanisme
   est identique sur les 8 autres (même composant, même absence de surcharge) et la version nommée
   permet le retour complet, mais la preuve n'est pas exhaustive.
3. **`Facebook` / `Instagram` — rien fait, et c'est délibéré.** L'ajout d'une propriété `Couleur`
   annoncé plus haut n'est plus nécessaire : la convention du DS est qu'une icône porte une couleur de
   base liée et que le consommateur la surcharge (c'est ce que fait le chevron de `NavItem`, corrigé de
   la même façon au header). Le footer instancie désormais les deux masters avec un remplissage
   surchargé vers `color/blanc`. Ajouter un axe de couleur à 2 icônes sur 16 rendrait le jeu d'icônes
   incohérent pour rien.

**Reste ouvert** : cadre orphelin `hôte Mobile @390` (2732:11636, 100 × 100 en 0,0) sur la page 031.

## Relevé technique (dump v1.8 + extraction) — 2026-09-04

Dump ciblé **par identifiant** (`2735:12509` : deux composants portent le nom `Footer`, le master DS et
celui de 031) : `.page-parity/vague-031/dumps/Footer.live.dump.json`. Copie de travail de
`extract/figma/dump.plugin.js` avec un `try/catch` autour de l'export SVG (bug d'instrument déjà relevé
sur le header) — **l'instrument du dépôt n'est pas modifié**.

Trois refus de l'extraction, tous réparés **à la source** (0 px à chaque fois) :

| Refus | Cause | Correction |
|---|---|---|
| `vector asset "footer-facebook" has different geometry` | même nom de tracé pour des icônes de 32 px (Mobile/Tablette/Wide) et de 24 px (Desktop) | les 8 icônes sociales deviennent des **instances** des masters `Facebook` / `Instagram`, remplissage surchargé vers `color/blanc` — l'extraction ne moissonne plus de tracé |
| 2 valeurs non liées : `TitreReseaux` 20 px / interligne 25 | texte sans style, 20 en Mobile-Tablette et 24 en Wide | style **`H4`** appliqué (jetons `typography/h4/*` = 20·20·24·24) — les deux tailles tombent juste, 0 px |
| 4 collisions de noms de parts (`rseauxSociaux`, `Facebook`, `Instagram`, `Copyright` deux fois) | Desktop les range dans `LigneBas`, les autres dans `col5` | renommés `rseauxSociauxBas`, `FacebookBas`, `InstagramBas`, `CopyrightBas` |

Deux incohérences de liaison corrigées au passage : `Spacer.height` lié à `space/32` en Mobile et Tablette
(il ne l'était que sur 2 variantes sur 4) ; largeur de racine déliée en Wide (`size/footer/root` — elle
n'était liée que là ; la largeur de racine est un témoin, pas un jeton).

**Résultat : 59 notes, 0 valeur non liée, 25 jetons provisoires proposés, 0 collision de nom.**
Sortie : `.page-parity/vague-031/proposals/Footer/`. Dégradations du dump : 4, toutes le même `strokeAlign
CENTER` du filet (bénin).

Une seule incohérence subsiste dans le rapport : `Separator fill: bound in 2/4 variants` — c'est le filet
dessiné de deux façons (déjà nommé plus haut, décision de couleur).

## Banc de resize réel (`BANC · resize réel`, 2735:12851, dans la section)

Instance FILL dans un hôte de largeur donnée, 13 largeurs : 390 · 600 · 767 · 768 · 834 · 991 · 992 ·
1200 · 1399 · 1400 · 1487 · 1728 · 1920. **Aucun débordement, aucun chevauchement, à aucune largeur.**

Hauteurs relevées : Mobile 868,9 → 844,9 → 820,9 (le texte se replie) · Tablette 820,9 constant ·
Desktop **516** à 992 puis 462 dès 1200 · Wide **486** à 1400 puis 459 dès 1487.

Les deux pics (992 et 1400) sont des replis de texte en bas de plage, pas des défauts : à 992 les colonnes
tombent à ~200 px et « Rue Alfred Drèze 7, » se coupe après « Drèze ». Lisible, mais c'est la limite basse
de confort des deux plages. À signaler au moment du CSS Odoo.

## Contrat et portage Odoo (2026-09-04)

**`ds.footer` 1.2.0 → 2.0.0** (MAJOR : ancres sur le set 031, nouvelle prop publique `presentation`,
nouvelles parts). Repris de la proposition : l'axe `presentation`, `tokensByProp`, `layoutByProp`,
les jetons de typographie. Repris de l'ancien contrat : les descriptions, les ancres `code`, la
catégorie. Corrigé à la main : `semantics.element` → `footer` ; largeur de racine en `fill` +
`referenceWidth 1728` (les 390/834/1200/1728 relevés sont des témoins, les `imported.*.root.width.*`
sont supprimés) ; padding vertical en deux canaux séparés (64/64 puis 128/32) ; le fond perd sa
hauteur propre et prend ses quatre insets ; les hauteurs `imported.footer.{spacer,separator,spacer2}.*`
retombent sur `{space.32}`, `{size.footer.spacer}`, `{size.footer.spacer2}` et `{space.0}`.
**Aucun `imported.*` ne survit, aucun jeton neuf.**

Miroirs Odoo : `footer.authoring.json` 1.0.0 → 2.0.0 (41 épingles rebumpées, +2 contrôles, +7 parts —
13 props et 36 parts couvertes, porte verte) · `inputs.lock.json` repinné, nouveau `graphDigest`
`0ed08fc8…` propagé aux quatre miroirs par `--repin` · `views/footer.xml` : la ligne basse existe
désormais dans le DOM · `responsive/footer.pqr.css` (NOUVEAU, au bundle) · `odoo-bridge.css` : deux
lignes ajoutées aux zones ODOO-023 existantes.

**Trois faits code-only**, chacun nommé dans la feuille et dans le contrat :
1. la typographie des colonnes (20/14 sous 992 px, 24/18 au-delà, titre en Medium) — `ds.footer-column`
   est figé à 24/18 en Regular et sert 36 instances ailleurs ;
2. le copyright à 18 px dans la seule plage desktop — `ds.copyright` est figé à 14 ;
3. le sizing des enfants par mode (FILL/HUG), que le contrat ne sait pas porter sur une part instance.

**Deux défauts trouvés par la mesure, corrigés :**
· la paire d'icônes de la ligne basse était **invisible** — elle héritait la couleur de lien
  Bootstrap, puis, une fois blanche, elle se peignait **sous le plan de fond** : `footer__LigneBas`
  manquait à la liste des enfants non positionnés que la règle (1c) du pont relève. ·
  le filet du canevas est un contour CENTRÉ sur une boîte de hauteur nulle et n'occupe aucune hauteur
  de flux ; notre bordure de 1 px en occupait une et décalait tout ce qui suit (462 → 463).

## Mesure Odoo contre planche 031 (instance jetable `piqueray-odoo-pilote`, port 8087)

| largeur | hauteur Odoo vs planche | diff | résidu |
|---|---|---|---|
| 390 | 869 = 869 | **1,13 %** | rendu du texte (Chromium plus gras que l'export Figma) ; 0,4 pt disparaissent avec `-webkit-font-smoothing: antialiased`, non posé — choix de rendu global du site, pas du footer |
| 834 | 821 = 821 | **0,62 %** | idem |
| 1200 | 462 = 462 | **1,63 %** | idem + le filet : le contour centré du canevas s'étale sur deux rangées à 50 %, notre bordure en remplit une (2 176 px à elle seule) |
| 1728 | 459 = 459 | **1,08 %** | idem (3 100 px pour le filet) |

**Les quatre hauteurs tombent juste au pixel.** Triptyques : `.page-parity/footer-mesure/footer-<largeur>-figma-odoo-diff.png`.

## Portes

`npm run build`, `odoo:authoring:check`, `odoo:module:check`, `odoo:inputs:check` : verts.
`odoo:derivation:check` et `npx tsc --noEmit` échouent sur des faits **antérieurs et étrangers au
footer** (marqueur `ODOO-031-GOOGLE-REVIEWS-PANEL` non classé au registre, commité en `c5041263` ;
deux erreurs de types sur GoogleReviews). Non touchés. `npm run eval` et `npm run parity` : non joués.

## Non fait, volontairement

- Pas de cliché de parité rafraîchi (`parity/snapshots/figma-components.json` reste sur l'ancien canevas).
- Pas de test d'édition à l'écran (le copyright reste le seul champ éditable, inchangé).
- Master DS `Footer` 2120:4785 : intact, 9 instances vivantes. Le contrat `ds.footer` 1.2.0 pointe
  encore ce master — passer aux ancres du set 031 sera un **bump MAJOR 2.0.0**.
