# Journal — pilote « hero vidéo responsive vers Odoo »

**Ouvert le** : 2026-09-02 · **Statut** : en cours · **Rien n'a été écrit dans Figma.**
**But** : projeter le hero validé en 031 (set `HeroVideo` `2689:15832`, 4 modes) sur la home Odoo,
et noter ce qu'on apprend pour la spec « tous les composants de la home vers Odoo ».

Ce fichier est un journal : faits datés, décisions, ce qui a cassé. Pas un plan.

---

## Décisions owner du jour

- **Le contrat se refait depuis Figma, pas à la main.** L'extraction (`npm run extract:figma`,
  moteur `core/propose-figma.ts`) écrit la proposition ; si elle est bonne, rien à compléter après.
  Si elle ne l'est pas, on répare la source (Figma) ou l'outil, pas le contrat.
- **Breakpoints = ceux d'Odoo, on n'y touche pas** : Mobile < 768 · Tablette ≥ 768 · Desktop ≥ 992 ·
  Wide ≥ 1400. Les planches Figma (390 / 834 / 1200 / 1728) sont des exemples dessinés dans
  chaque zone, pas des seuils. Écrits une fois dans les tokens (`breakpoint.*`), jamais dans Figma.
- **Pas de variable `breakpoint/min` dans Figma** : personne ne la lirait.
- **Le CSS Odoo est écrit depuis le contrat, sans émetteur** (avenant 031). L'émetteur HTML n'est
  pas touché ; la mesure se fait Figma ↔ Odoo directement (`npm run images:compare`).
- **Le hero d'abord, seul.** Docker et l'instance jetable viennent quand on en a besoin.

## Ce qui a été fait (2026-09-02)

1. **Extraction du set 031 telle quelle** (lecture) : 29 notes, identiques au test à blanc de 031.
   L'axe `presentation` (4 valeurs) et la bascule colonne/ligne sont compris. Refusés à raison :
   paddings/gap/hauteur liés à des variables dans Wide seulement ; le titre sort en tokens
   provisoires parce que le style **H1** n'existe pas dans les tokens.
2. **Diagnostic H1** (lecture Figma + doc Figma) : H1 est un style de texte dont taille et
   interligne sont liés aux variables `typography/h1/*` de la collection **Responsive** (4 modes).
   C'est la méthode Figma Design (variables typographiques + modes). La fonction « text style par
   breakpoint » n'existe que dans Figma Sites, pas dans ce fichier.
3. **Les tokens reçoivent la dimension Responsive**, à l'identique de Figma :
   - `tokens/modes/viewport.{tablette,desktop,wide}.tokens.json` (overrides), mobile = défaut dans
     `semantic.tokens.json` ; `breakpoint.{tablette,desktop,wide}` dans les primitives ;
   - les **33 variables** de la collection Responsive portées une pour une (typography h1/h2/h3/h4/
     body/card-desc/overline/button/review/*, spacing card-categorie/carte-reassurance/review) ;
   - 4 styles de texte déclarés : **H1, H2, H4, « Titre carte »**, marqués `responsive: true` ;
   - mints from-dump : `font.line-height.18`, `size.carte-reassurance.photo-h.{192,240,364}` ;
   - adoption des 3 primitives que 031 avait mintées sur le canvas : `space.56`, `space.288`,
     `space.418` (valeurs lues dans le cliché, jamais tapées).
4. **`scripts/build-tokens.mjs`** émet un bloc `@media (min-width)` par mode, dans la même feuille
   (`src/styles/tokens.css`) et dans la feuille Odoo préfixée. Le bundle Odoo
   (`tokens.pqr.css`) est donc **déjà responsive** pour tout ce qui lit ces tokens.
5. **`parity/diff.ts`** compare les tokens responsive à la collection **Responsive** du canvas
   (valeurs résolues, 4 modes, graisses par nom), exclut `breakpoint.*` par nom, et imprime les
   deux réacheminements. Cliché des variables rafraîchi (lecture via le pont, sans token REST) :
   Primitives 165 · Semantic 72 · **Responsive 33**. **33/33 concordent.**
6. **`core/emit-figma-script.ts`** : un style responsive n'est monté que par un texte lié à son
   propre token de taille (« Titre carte » à 20/25 SemiBold est identique à « Titre 5 » en mobile —
   la recette seule ne peut pas trancher, le token si). `figma:plan` repasse.
7. **`docs/03-token-pipeline.md`** : la dimension viewport, ses règles, ce qu'elle ne couvre pas.
8. Re-pins : `evals/golden.json`, `figma-sync/plugin/engine.receipt.json`.
9. **`core/propose-figma.ts`** : un texte qui monte un seul style nommé **responsive** n'est plus
   traité comme une « typographie qui varie » (refus) mais comme une identité de style : il se lie
   aux tokens `typography.<rôle>.{size,weight,line-height}`. Ré-extraction du hero : le titre sort
   `{typography.h1.size}` / `{typography.h1.weight}` / `{typography.h1.line-height}`, plus aucun
   token provisoire de texte. **29 notes → 20.** Restent : paddings/gap/hauteur (source Figma,
   étape 3 ci-dessous), l'icône du CTA (décision), les largeurs (règle connue : fill), l'élément
   hôte (`section`, toujours à poser à la main : pas dessiné).

## État des portes (2026-09-02, fin de journée)

| Porte | État | Cause |
|---|---|---|
| `npm run build` | vert | |
| `tsc` ×2, `geometry:gate`, `core-browser-check`, `deterministic-roundtrip` | vert | |
| `figma:plan` | vert | après la règle « style responsive = lié à son token » |
| `npm run parity` | **11 écarts, tous `behind`** | 11 tokens sans variable Figma encore : `typography.h{1,2,3,4}.{family,weight}` (7) + les 4 primitives mintées. Remède du différentiel : lancer le sync tokens sur le canvas — **écriture Figma, GO owner** — ou acquitter dans `parity/baseline.json` |
| `npm run plugin:check` | **rouge** | « Missing historical Text Style marker for H1 » : les 4 styles 031 existent sur le canvas **sans** marqueur `ds_contracts/textStyleToken`. Le sync refuse par nom, comme prévu. Remède : la migration « marqueur seul » sur 4 styles — **écriture Figma sans effet visuel, GO owner** |
| `npm run eval` | **239/243** (fin de journée) | 4 rouges, **une seule cause, hors hero** : l'écart de parité `CarteCategorie.Style` (variante `Style3` sur le canvas, inconnue du contrat — dérive 031 révélée par le cliché rafraîchi). Les 4 evals exigent une parité propre. Se ferme par une décision owner : supprimer `Style3` à la source, ou l'adopter dans le contrat, ou acquitter. (Le matin : 238/243 pour marqueurs absents + 11 tokens sans variable — réglés par les écritures Figma de l'après-midi.) |
| `examples/polaris` | vert | régénéré : les styles dérivés portent désormais `responsive` |

## Écritures Figma du 2026-09-02 (GO owner, après-midi)

Chacune précédée d'une **version nommée** dans l'historique Figma et d'une **capture avant** (variables
+ styles, JSON) ; capture après et diff avant/après à chaque fois.

1. **Marqueur seul** sur H1, H2, H4, Titre carte (`setSharedPluginData ds_contracts/textStyleToken`).
   Diff : 4 styles, seul le marqueur change ; liaisons de variables intactes. Constaté au passage :
   « Titre carte » est en **capitales** (textCase UPPER) → token corrigé. Un style 031 reste sans
   marqueur et sans token : **« Description carte »** (à traiter avec la section réassurances).
2. **Sync tokens** (`figma-sync/01-tokens.js`, chargé depuis un serveur local avec CORS, exécuté
   dans le sandbox par `new Function`). Résultat : **47 variables créées, 0 supprimée, 0 modifiée**
   en valeur (3 primitives 031 ont reçu leur `codeSyntax`), **0 style créé**, 4 descriptions de
   styles complétées d'une ligne « derived from tokens/… », liaisons intactes grâce à la règle
   « un champ lié n'est jamais écrasé » ajoutée juste avant à l'émetteur.
   **Effet indésirable, nommé** : 36 des 47 étaient des **doublons** — les 33 tokens viewport
   recréés sous *Semantic* (ils vivent dans *Responsive*) et les 3 `breakpoint/*` (jamais des
   variables). Cause : l'émetteur ne connaissait pas la dimension viewport. **Retirés le jour même**
   (version nommée avant, 36 `remove()` par id, contrôle « jamais dans Responsive » avant chaque).
   Les **11 attendues** sont gardées. Émetteur corrigé (`viewport` en entrée, exclusions).
3. Après : cliché des variables rafraîchi (Primitives 169 · Semantic 79 · Responsive 33) →
   **`npm run parity` vert, 0 nouvel écart.**

4. **Liaisons du hero** (set `2689:15832`, variantes Mobile / Tablette / Desktop) : padding ×4,
   `itemSpacing`, `height` liés aux primitives (`space/64·24·48·56·32·10`, `size/hero-video/root`),
   + variable **`size/hero-video/root-compact` = 746** créée dans Primitives (token minté
   from-dump juste avant, mêmes nom / type / scopes / codeSyntax que le sync produirait).
   Garde-fou exécuté avant : chaque valeur brute est égale à la variable liée → **aucun changement
   visuel** (géométrie identique avant/après, 18 liaisons). Wide était déjà lié.

Ports : les récepteurs locaux doivent éviter 9223–9226, squattés par les serveurs figma-console
(IPv6 `::1`) — un `localhost:9226` a répondu 404 depuis un autre serveur. Utilisé 9228/9229.

## Contrat hero 2.0.0 (2026-09-02, fin d'après-midi)

- **Ré-extraction après liaison** : la proposition porte désormais tout ce que le canvas dessine —
  `layoutByProp` (colonne centrée → ligne bas-alignée), `tokensByProp` par mode pour
  padding-inline (24/48/56/89), padding-block (64/48), gap (32/10), hauteur (746/720), titre lié à
  `typography.h1.*`. Notes restantes : élément hôte, icône du CTA, largeurs témoins.
- **Adopté tel quel** dans `contracts/hero-video.contract.json` (**2.0.0**, ancres → set
  `2689:15832`), plus, à la main et nommés dans le contrat : `section` ; `text-align` centré /
  gauche par mode (channel `declared` + `stylesWhen`, le seul admis) ; **défaut `mobile`**
  (première variante du set = défaut Figma, parité l'exige) ; **`accroche` en binding NONE** —
  le set 031 n'a plus de propriété TEXT sur le titre (l'ancien master en avait une) : à remettre
  à la source, écriture Figma à faire.
- **Deux déviations que le schéma ne sait pas dire, refusées par nom par `validateContract`
  (`stylesWhen` / `layoutByProp` interdits sur une part instance)** : le CTA épinglé en bas en
  Mobile/Tablette, et l'icône droite seulement en Desktop/Wide. Portées par le CSS Odoo à la main,
  sous 992, comme faits code-only. **Ce sont les deux trous de schéma que la vague Odoo doit
  trancher** (canal de placement / de props d'enfant par mode).
- **Miroirs Odoo propagés** (recette mémoire) : `hero-video.authoring.json` (versions + verdict
  `presentation` = fixed-by-composition), `components.xml`, `version_guard.js`,
  `scan-saved-versions.ts`, `cases.json`, lock re-pinné (digest `4249df62…`). Contrôles Odoo verts
  (module 23/23, inputs, authoring 11/11 · 12/12).
- Miroirs supplémentaires trouvés par les evals : `figma-panels.json` (version du panneau hero →
  2.0.0, liens régénérés) et la fixture `figma-text-styles-piqueray` (le titre du hero monte
  désormais **H1**, quatre nœuds — un par variante — au lieu de « Titre Hero vidéo »).
- **Cliché des composants rafraîchi** (76 sets, les deux `HeroVideo`). Parité : **1 écart, pas
  le hero** — `CarteCategorie.Style` : le canvas a une variante **`Style3`** que le contrat ne
  connaît pas (dérive 031 révélée par le rafraîchissement). À trancher (source ou contrat).

## Odoo : le hero responsive mesuré (2026-09-02, soir)

- **CSS Odoo à la main** : `integrations/odoo/addons/piqueray_ds/static/src/css/responsive.pqr.css`
  (zone manuelle, ajouté au bundle après la CSS générée). Base = mobile, blocs `@media` 768 / 992 /
  1400 recopiant les règles par mode de la CSS générée. Trois faits code-only nommés : CTA épinglé
  en bas sous 992, icône du CTA masquée sous 992, titre sans `flex-grow` sous 992. `height` → `min-height`
  (Odoo force `height:auto` sur les sections sous 768). QWeb : `icon_right` du hero → True.
  Bordures de repérage DX de `odoo-bridge.css` éteintes (elles polluaient les captures).
- **Voiles** : le contrat 1.0.0 portait les voiles de l'ancien master (2 stops, 0,5). Le set 031
  en dessine de bien plus forts, différents par mode (Mobile/Tablette 0 → 0,8 ; Desktop dès 50 % ;
  Wide dès 44 %, → 0,6 ; voile haut 75 % → 0,65 / 70 % → 0,58). Lus sur le canvas, portés en
  `literals` + `literalsByProp` par présentation. **Schéma** : `literalsByProp` reçoit la même
  grammaire par canal que `literals` (`background-image` → gradient), additif. Registre des
  littéraux : 2 valeurs mises à jour, 4 entrées par mode ajoutées. **C'était la cause principale de
  l'écart** (photo « plus sombre dans Figma » = voiles, pas la photo).
- **Instance jetable** : projet `piqueray-odoo-pilote`, port **8087** (8069 et 8075 occupés ; ports
  choisis automatiquement), colima. Home composée + **page de mesure `/hero-test`** (descripteur
  `pages/hero-test.json`, le hero seul avec le contenu de la home). Raison : sur la home, la
  section catégories, pas encore responsive, déborde par-dessus le hero à 390 (gouttière de page
  89 px → cartes de 74 px, texte superposé qui s'échappe vers le haut) — une capture de la home
  mesurait ce débordement, pas le hero.
- **Mesure** (planche Figma exportée 1x ↔ capture Odoo du bloc, en-tête masqué, `images:compare`) :

  | Témoin | Écart | Zone |
  |---|---|---|
  | 390 | **5,30 %** | titre : coupure de ligne différente (Figma coupe après « HÖRMANN », Odoo garde « HÖRMANN en » — espace insécable dans le contenu) |
  | 834 | **0,21 %** | rastérisation du texte |
  | 1200 | **0,95 %** | ligne du titre + CTA |
  | 1728 | **1,12 %** | ligne du titre + CTA |

  Avant les voiles et la page de test : 52 / 55 / 29 / 27 %. Triptyques : `.page-parity/hero-mesure/`.
- **À voir sur ta machine** : http://localhost:8087/hero-test (hero seul) · http://localhost:8087/ (home,
  avec les autres sections encore à l'ancienne) · éditeur : `/odoo/action-website.website_preview?path=/hero-test&enable_editor=1`,
  editor@example.test / editor.

## Lecture des triptyques avec l'owner (2026-09-02, soir) — deux causes, côté contrat/contenu

1. **Retour à la ligne du titre.** Figma : saut de ligne explicite (U+2028) après « HÖRMANN » en
   Desktop/Wide ; coupure naturelle au même endroit en Mobile ; un mot plus loin en Tablette. Odoo :
   « HÖRMANN en » restait soudé (espace insécable dans le contenu). **Décision owner : c'est du
   contenu, pas du design.** Appliqué : `<br/>` après HÖRMANN dans le contenu des pages
   (`home.json`, `hero-test.json`). Le contrat garde un défaut sur une ligne.
   - Écarts après : **390 → 1,22 %** · **834 → 1,64 %** (la planche tablette coupe un mot plus
     loin — la seule planche qui diffère) · **1200 → 0,35 %** · **1728 → 0,35 %**. Le résidu est
     la rastérisation du texte.
   - **Édition, nommé** : le titre est un texte simple (`contentKind: plain-text`, `allowedMarks: []`)
     et le schéma d'authoring **interdit toute marque** sur un texte simple (« maximum 0 ») ; la garde
     `rich_text_guard.js` retire donc un `<br>` posé par le rédacteur. Le `<br/>` composé survit tant
     que le rédacteur ne réécrit pas le titre. Pour que le rédacteur maîtrise le retour à la ligne,
     il faut une décision de politique : autoriser la marque `line-break` sur les titres (schéma
     d'authoring à ouvrir). À trancher pour la vague.
   - Gap nommé : `emit-react` n'échappe pas un LF dans un défaut de texte (le module généré casse) —
     un défaut de contrat ne peut pas porter de saut de ligne aujourd'hui.
2. **Le CTA sous le voile** (Desktop/Wide, visible aussi en mobile) : dans Figma le bouton est le
   dernier enfant, peint au-dessus des voiles ; dans le CSS généré les voiles ont un `z-index`, le
   bouton non → le voile le recouvre, il ressort gris. Défaut du contrat, présent depuis 1.0.0, et
   **non corrigeable dans le contrat** : `declared`, `stylesWhen`, `layoutByProp`, `literals` sont
   tous refusés sur une part instance. Proposition (pas appliquée) : règle d'émetteur « l'ordre des
   enfants vaut ordre de peinture », comme Figma. À valider.

## Règle owner du 2026-09-02 (soir) : un saut de ligne = texte riche

- **Décision** : un texte dessiné avec un saut de ligne est du texte **riche**, qu'il soit ou non une
  propriété texte du composant Figma. (Le gras suivra la même logique, plus tard.) La règle 031
  « une plage = style, plusieurs plages = riche » est complétée par « un saut de ligne = riche ».
- **Schéma** : un `rich-text` se lie à une propriété TEXT quand le set en expose une, sinon `NONE`
  (le texte vit sur le nœud). Additif ; `docs/02-contract-spec.md` mis à jour.
- **Extraction** : un texte dessiné avec un séparateur (`\n`, `\r`, U+2028 — les trois orthographes
  Figma déjà connues de l'émetteur) est proposé en `rich-text`, un segment, avec la note « déclarer
  `white-space: pre-line` sur la part ».
- **Contrat hero** : `accroche` → rich-text, binding NONE, défaut avec le saut après « HÖRMANN »,
  `white-space: pre-line` déclaré sur la part, `marks.strong` = `font.weight.bold` (exigé par le
  validateur pour tout texte riche ; jamais offert au rédacteur ici).
- **Odoo** : zone titre en texte riche avec **une seule marque, `line-break`** (Shift+Entrée) — première
  zone du dépôt à l'autoriser, le schéma d'authoring la connaissait déjà ; QWeb `data-pqr-marks="line-break"` ;
  plugin : le bouton Gras ne s'offre qu'aux zones dont la liste contient `strong` (il s'offrait à toute
  zone riche). Contenu des pages : `<br/>` après HÖRMANN.
- **Preuve d'édition** (Playwright, instance pilote, compte rédacteur) : clic dans le titre, texte +
  Shift+Entrée, enregistrer (RPC 200), page publique relue : **le saut du rédacteur est conservé**, le
  saut d'origine aussi. Contenu de la page de test remis ensuite.
- **Figma** : j'avais ajouté une propriété TEXT « Accroche » sur le set (écriture non demandée,
  version nommée avant) ; **l'owner l'a retirée**, le set est revenu à l'état d'avant. Règle
  désormais : chaque action Figma décrite, puis oui explicite, puis exécution.
- Mesure inchangée : 390 → 1,22 % · 834 → 1,64 % · 1200 → 0,35 % · 1728 → 0,35 %.

## Corrections owner reçues pendant la lecture des triptyques (2026-09-02, soir) — à reporter dans la spec 032

1. « Fais une page de test avec le hero seul » — une capture de la home mesure les voisins qui
   débordent, pas le bloc. → `/hero-test`, descripteur dédié. **Règle de mesure : un bloc, une page.**
2. « Le saut de ligne, c'est du contenu ; et un saut de ligne, c'est du texte riche, propriété Figma
   ou pas » (et le gras suivra la même logique). → schéma, extraction, contrat, Odoo alignés.
3. « Un saut de ligne, c'est forcément pour tous les modes » — la planche Tablette n'avait pas le
   saut explicite : **corrigé par l'owner dans Figma**, Mobile laissé tel quel (coupure naturelle).
   834 : 1,64 % → **1,14 %**.
4. « Ne touche pas à Figma sans décrire l'action et attendre mon oui » — après une propriété TEXT
   ajoutée sans demande (retirée par l'owner).
5. « Vérifie avant de parler » — la graisse du titre : vérifiée, 600 des deux côtés ; l'impression
   de gras en desktop est de la rastérisation.

## Desktop / Wide : voile, ordre de peinture, position du CTA (2026-09-02, soir)

- **Voile vérifié** par luminance moyenne par bande, planche ↔ Odoo : écart < 1 % sur toutes les
  bandes hors titre/CTA, aux 4 largeurs. Le voile est bon. Ce qui se voyait, c'était le bouton
  **sous** le voile.
- **Bouton sous le voile** : en CSS un enfant statique passe sous un frère absolu à `z-index` ;
  dans Figma l'ordre des enfants fait l'ordre de peinture. Le contrat ne peut rien déclarer sur une
  part instance. Fait **code-only n° 3** dans `responsive.pqr.css` :
  `.s_pqr_hero_video.hero-video > .button { position: relative; z-index: 2 }`.
  J'avais écrit une règle générique dans l'émetteur HTML (« instance après un plan absolu = au-dessus ») :
  **retirée**, l'owner a rappelé la décision du jour — CSS à la main, pas d'émetteur. La règle reste
  une proposition pour la spec 032 : elle vaut pour tout contrat avec voile + bouton derrière.
- **CTA décalé de 48 px en Desktop/Wide** : bug de ma feuille — les insets tablette (`left/right: 48`)
  n'étaient pas bornés et s'appliquaient à un bouton `position: relative`. Bornés à 768–991.98.
  Après : 1200 → CTA x 912 / y 618 / 232×54, **identique à la planche**.
- **Mesure** : 390 → 1,22 % · 834 → 1,14 % · **1200 → 0,14 %** · **1728 → 0,24 %**.
- **Reste, nommé** : en Wide la planche a un CTA de 249 px (libellé 18 px) contre 232 en Odoo (16 px).
  Cause lue sur le canvas : le master **Bouton** lie son libellé à la variable Responsive
  `typography/button/size` (16/16/16/18) ; le contrat `ds.button` porte un `font.size.16` fixe.
  Correction = contrat Button (`{typography.button.size}`, bump 2.0.1 → 2.1.0, cascade sur les
  épingles Odoo). **Proposé, pas fait** — décision owner, ça touche tous les boutons.

## Le CTA wide : le Bouton est responsive dans Figma (2026-09-02, soir)

- Lu sur la page **DS · Atomes**, set **Bouton** (6:122) : le style « Libellé bouton » lie sa taille à
  la variable **Responsive `typography/button/size`** (16 · 16 · 16 · 18). Tous les boutons font 18 px en
  wide. Le contrat `ds.button` portait un `font.size.16` fixe → CTA 232 px au lieu de 249.
- Mon geste Figma (GO owner) — lier le style à la variable et retirer les liaisons sur les 6 libellés —
  a été un **quasi non-geste** : le style était déjà lié ; ce que je prenais pour des liaisons par
  texte était l'héritage du style. Constaté après, dit tel quel.
- **Tokens** : `typography.libelle-bouton.size` → alias `{typography.button.size}`, style marqué
  `responsive`. **Contrat Button 2.1.0** : le libellé monte `{typography.libelle-bouton.size}` (le
  token du style, plus un primitif). 33 épingles Odoo passées à 2.1.0, lock/digest propagés.
- Résultat : **1728 → 0,16 %**, CTA à 1390 / 249 × 54 / libellé 18 px — identique à la planche.
- **Ouvert, à décider** : depuis que le titre est riche, l'émetteur **Figma** ne pose plus de style de
  texte sur le titre (règle « riche = plages natives, pas de style de nœud », écrite pour le gras).
  Un titre riche **par saut de ligne seul** doit garder son style H1. C'est une règle d'émetteur Figma
  (3 lignes) ; la fixture `figma-text-styles-piqueray` est rouge tant qu'elle n'est pas tranchée.

## Ce qui reste à faire pour le hero

1. **Deux écritures Figma, à ton GO** : (a) marqueur sur H1, H2, H4, Titre carte ; (b) sync tokens
   pour créer les 11 variables manquantes. Alternative sans écriture : acquittements owner.
2. ~~Réparer le script de dump~~ — pas nécessaire pour H1 : le dump porte déjà le nom du style, et
   l'extraction le reconnaît depuis le point 9. Les liaisons de variables sur les textes restent
   non captées (limite nommée, sans effet ici).
3. **Lier dans Figma** paddings, gap, hauteur des variantes Mobile/Tablette/Desktop du hero
   (variables existantes : 24, 32, 48, 56, 64, 89, 10 ; la hauteur 746 n'a pas encore de token).
   Écriture Figma, GO owner.
4. Ré-extraire → contrat hero 2.0.0 → `npm run build`.
5. CSS Odoo à la main depuis le contrat (structure par mode ; la typographie vient déjà des tokens).
6. Docker, instance jetable, page home, 4 captures, `images:compare`, validation à l'écran.

## Décisions encore ouvertes

- **Icône droite du CTA** : vraie en Desktop/Wide, fausse en Mobile/Tablette. Le schéma n'a pas de
  canal « prop d'enfant par mode » (`propsByProp` abandonné le 2026-08-20). Choix : rouvrir le canal,
  ou fixer `iconRight = vrai` et masquer sous 992 dans Odoo avec un écart acquitté.
- **Hauteur du hero** : 746 (Mobile/Tablette) et 720 (Desktop/Wide) en fixe sur les planches.
  Odoo force `height: auto` sur toute section sous 768 px, donc ce sera une hauteur **minimale**.
  Aucune exception « 100vh » n'est écrite nulle part dans le dépôt (027 l'avait proposé, 027 est
  abandonnée).

## Leçons pour la spec « tous les composants »

- La dimension Responsive est faite une fois pour toutes : les 10 autres composants n'ont que
  leurs valeurs de structure à porter.
- Une variable canvas mintée pendant 031 sans token (`space/56`, `288`, `418`) est de la dérive
  silencieuse jusqu'au rafraîchissement du cliché : rafraîchir le cliché **avant** chaque section.
- Deux styles peuvent partager une recette (Titre carte mobile = Titre 5) : le token décide, pas la
  recette.
