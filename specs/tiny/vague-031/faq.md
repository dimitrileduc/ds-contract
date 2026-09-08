# Journal de section — `ds.faq` v2 (vague 031, page 3 « Portes de garage »)

**Date** : 2026-09-07. **Décisions owner du jour** : mise en page **option B**, survol **S4**, focus « je te laisse voir ».

## Ce qui existait au départ (relevé du canevas vif, pas des docs)

- **Figma** : la FAQ n'était **pas un set** — un COMPONENT seul, `2104:2914` (DS · Organisms), 1728 de large,
  une prop `Ligne 3`. Aucun candidat v2 sur la page 031. Master mesuré **425** de haut alors que le contrat
  en décrivait 448 (ancres du 2026-07-27, dérive silencieuse).
- **Contrat** : `ds.faq` 1.3.0, pas d'axe `presentation`, `states: []`.
- **Odoo** : le bloc `s_pqr_faq` existait déjà (spec 019), en v1, en-tête composé depuis `ds.section-header`.
- **Page 3** : la FAQ est bien sur la référence Figma (`2771:23633`, index 4, entre Réalisations et Avis Google)
  mais **ni dans les 4 vues v2**, **ni dans le descripteur Odoo** `portes-de-garage.json`.
- **AccordionRow v2** (`2767:20198`) : aucun axe d'état d'interaction, alors que les trois cartes en ont un depuis 033.

## Les options posées sur Figma, et le choix

Cadre **`2773:26583`** sur la page « 031 · Planches de validation » : trois options de mise en page (A fidèle v1,
B convention vague, C compacte mobile), chacune en 1728 **et** 390, plus une planche de cinq traitements de survol.
Tout est fait d'instances gouvernées, rien de dessiné à la main.
**Owner : B + S4.** Deux observations faites en les posant : le titre de rangée **se replie déjà** dans le set v2
(le défaut du journal accordion portait sur le v1), et S1 (les deux noirs) est **invisible à l'œil**.

## Le canevas (version nommée avant : « 031 — avant FAQ v2 + axe State sur AccordionRow », id 2396505204363587841)

| Geste | Résultat |
|---|---|
| Axe `State = Default / Hover` sur `AccordionRow` `2767:20198` | 4 → **8 variantes**, chevron `color/orange` au survol. **85 instances avant, 85 après**, toutes sur `State=Default`. |
| Set **`FAQ` 2773:27504** (clé `6a71ef12dca9523c5019defc7dad5139faf44f62`) | 4 variantes `Presentation` — 390×615 · 834×464 · 1200×496 · 1728×511, modes explicites de la collection Responsive posés comme sur TexteSEO. |
| 2 variables sémantiques créées | `color/etat/accordion-row/chevron-survol` (alias de `color/orange`), `.../anneau-focus` (alias de `color/noir-bleute`). |

**Convention découverte au relevé, et elle change la modélisation** : **aucune** section v2 de la vague n'utilise
l'instance `SectionHeader` — les 4 qui portent un en-tête (AvisGoogle, Reassurances, SAV, ProduitsECommerce) le
**dessinent** avec les rôles typographiques responsive. La seule exception est `Realisations`, candidat du jour, qui
porte encore une instance et des styles v1. L'en-tête de la FAQ a donc été cloné depuis celui d'AvisGoogle et re-texté :
c'est ce qui fait varier le titre par écran (24 / 24 / 32 / 40) — et ça règle au passage le défaut de source v1
(instance bridée à 50 px, titre débordant de 33 px dans le gap).

## Le contrat

`ds.faq` **1.3.0 → 2.0.0** (MAJEUR : ancres de set neuves + `ligne3` retirée — en v2 le nombre de questions est du
contenu). Classement des 49 notes d'extraction : **35 mints refusés et renommés** vers les jetons existants
(`space.24/48/56/89`, `space.32/48`, `space.8/16`, `typography.overline.*`, `typography.h2.*`, `font.weight.semibold`,
`color.blanc`), **4 largeurs de racine supprimées** (témoins de set → `width: fill` + `referenceWidth` 1728),
**0 jeton minté**. Deux limites de dump nommées : la casse UPPER et l'interlettrage 15 % de l'accroche ne sont
portés par aucun canal (reposés en `declared: text-transform`).

`ds.accordion-row` **2.0.0 → 2.1.0** : `states: ["hover"]`, `figmaStatePreviews: true`, chevrons haut et bas en
`{color.etat.accordion-row.chevron-survol}` — le sélecteur émis est `.accordion-row:hover .accordion-row__Chevron*`,
donc bien le survol de la LIGNE, pas du chevron seul.

## Le défaut trouvé par la mesure (et il valait le détour)

Premier passage : **+25 px de haut en Mobile, +18 en Tablette** (5,89 % et 6,03 %). Le triptyque montrait des titres
qui se replient une ligne plus tôt côté Odoo. Sonde : titre **286 px** côté Odoo, **310 px** côté Figma sur une
rangée de 342.

**Cause : `justify: space-between` + `gap` ne veulent pas dire la même chose des deux côtés.** Figma IGNORE
l'itemSpacing sous space-between (l'espace restant est distribué) ; en CSS le `gap` reste un minimum et se cumule.
Le contrat portait les deux → 24 px de largeur de titre perdus. Corrigé à deux endroits, chacun nommé :
`ds.accordion-row` (état `ferme` → `gap: {space.0}`) et la règle de pont `ODOO-019-FAQ-MECHANICS` qui reposait le
même 24 sur le groupe de titre. **Non-régression prouvée sur TexteSEO** : capture de la même page avec l'ancien gap
réinjecté vs le nouveau → **0,00 % aux quatre largeurs**, la molécule partagée ne bouge pas.

## La mesure (bloc contre planche, contenu égal, après correction)

| largeur | planche | Odoo | écart de hauteur | diff |
|---|---|---|---|---|
| 390 | 390×615 | 390×615 | 0 | **4,07 %** (9 755 px) |
| 834 | 834×464 | 834×464 | 0 | **1,99 %** (7 687 px) |
| 1200 | 1200×496 | 1200×496 | 0 | **1,49 %** (8 861 px) |
| 1728 | 1728×511 | 1728×511 | 0 | **0,94 %** (8 281 px) |

Triptyques : `.page-parity/faq-mesure/faq-{390,834,1200,1728}-figma-odoo-diff.png` — **regardés**, les deux panneaux
portent du contenu, les lignes tombent au même endroit, le rouge est du lissage de glyphe. Le 4,07 % du mobile est
le même nombre de pixels que les autres sur une boîte quatre fois plus petite.

Sonde des boîtes : `.page-parity/probe-faq.mts` (gouttières 24/48/56/89 ✓, gaps 32/32/48/48 ✓, en-tête 8/8/16/16 ✓,
titre h2 24/24/32/40 ✓, rangée 20/20/24/24 ✓, CTA pleine largeur 342 et 738 puis 248 et 268 ✓).

## Le test d'édition (jamais sauté)

`.page-parity/edit-faq.mts`, rédacteur, instance pilote : titre de rangée modifié → **enregistré (RPC 200)** →
**conservé** sur la page publique ; le mot en gras de la réponse **survit à la garde de saisie**.
**Limite nommée trouvée à cette occasion** : l'`aria-label` du déclencheur garde l'ANCIEN titre après édition —
il est calculé au rendu, l'éditeur ne le met pas à jour. Défaut d'accessibilité réel, hors périmètre de ce lot.

## Faits code-only (chacun parce que le contrat ne peut pas le dire)

1. **CTA pleine largeur sous 992** — une part `component` refuse `layoutByProp` et les littéraux.
2. **Anneau de focus clavier** sur la zone cliquable — le vocabulaire ancre tout état de part à la RACINE
   (`.root:hover .part`), il n'y a pas d'orthographe pour l'état PROPRE d'une part interactive imbriquée.
   Le jeton, lui, est gouverné.
Les deux vivent dans `static/src/css/responsive/faq.pqr.css`, commentés, et sont nommés dans les descriptions
de parts des contrats.

## Zone de clic — décision owner de fin de journée (2026-09-07, appliquée)

« Le survol reste PAREIL, mais la zone doit être toute la ligne, question ET réponse. »
La limite était déjà nommée dans le contrat le matin même (« l'overlay ne couvre que la première ligne d'un titre
replié ; la décision appartient au contrat, laissée à l'owner ») — elle est levée.

- `ds.accordion-row` : la zone cliquable perd sa hauteur figée (`size.accordion-row.trigger` 32 / 24) et prend un
  **inset 0 des quatre côtés**. Le survol n'a pas bougé d'un pixel : chevron orange, rien d'autre.
- **Source Figma remise d'accord** (§VIII) : sur les **8 variantes**, l'overlay passe en contraintes
  STRETCH/STRETCH et à la taille de la rangée (32→64, 24→40, 32→112, 24→72).
- **Vérifié au clic**, 390 et 1728 : la boîte de la zone == la boîte de la rangée aux 8 rangées mesurées ;
  un clic dans la marge basse ouvre la ligne ; un clic **sur la réponse** de la ligne ouverte la referme.
- **Conséquence assumée, écrite au contrat** : le texte d'une réponse ne se sélectionne plus à la souris sur la page
  publique (il est sous l'overlay). En édition Odoo, l'overlay est déjà neutralisé (`pointer-events: none`).
- Mesure inchangée après le geste : 4,07 / 1,99 / 1,49 / 0,94 % — l'overlay est transparent.

## Rangement de la planche 031 (2026-09-07, fin de journée)

Le set FAQ était posé nu sur la page. Il est maintenant dans une **SECTION `031 · FAQ — 4 variantes (candidat v2)`**
(`2773:27559`, x −12000 / y 37200), à la forme des autres planches : le set à (80, 140), puis une **instance de test**
au format Wide avec sa consigne (« sélectionne-la et bascule Presentation »), et un **témoin Mobile** avec la même
mise en garde que TexteSEO (la variante d'un set rend parfois une hauteur périmée à l'export, l'instance fait foi).

**Défaut trouvé en rangeant** : l'axe State avait fait passer le set AccordionRow de 312 à 648 de haut, et il
**recouvrait les 4 cadres témoins** de sa propre planche. Les témoins sont descendus de 260 px et la section
`031 · ACCORDION-ROW` est passée de 1942 à 2146 de haut. Vérifié par balayage : **zéro chevauchement** entre les
sections de la colonne et zéro à l'intérieur de la planche accordion.

## Comptes d'instances — réconciliation honnête

Relevé d'ouverture : **85** instances d'AccordionRow. Relevé de clôture : **74**. L'écart s'explique en entier et
**aucun usage préexistant n'a été perdu** :
`85 = 62 usages préexistants + 23 rangées de MES planches d'options` ; le cadre d'options `2773:26583` a été
**supprimé du fichier côté Figma** (pas par cette session — il n'était plus utile une fois l'option B choisie) ;
le set FAQ v2 apporte **12** rangées neuves. `62 − 0 + 12 = 74` ✓. Détail au relevé de clôture : molécule 32,
set TexteSEO 12, instances TexteSEO en page 12 + 3 + 3, set FAQ 12. Après le rangement, **80** : les deux instances
de démonstration de la planche FAQ (test Wide + témoin Mobile) ajoutent 6 rangées.

## Bloqué / à trancher (rien fait)

- **La FAQ n'est toujours pas dans la page 3** : ni dans les 4 vues v2 Figma, ni dans `portes-de-garage.json`.
  Position à décider (la v1 la met avant Avis Google).
- **Typographie de la rangée au canevas** : les 8 variantes d'AccordionRow portent encore les styles v1
  (Titre 5 20/25, Paragraphe 14/24), alors que le CONTRAT est déjà sur les rôles responsive
  (`typography.h4.*`, `typography.body.*`) — donc le code varie par écran, le canevas non. À basculer avec l'owner.
- **En-tête à gauche partout** (option B) : c'est un écart assumé avec AvisGoogle et Reassurances, qui centrent
  au-delà de 992.
- **`Realisations` 2773:27344** porte encore une instance `SectionHeader` et des styles v1 — même défaut que la FAQ
  avant ce lot.
- **Effet de bord du bac partagé** : `npm run odoo:inputs:check --repin` a repris au passage le contrat
  `carte-categorie` modifié par une AUTRE session dans ce worktree. Rien d'autre n'a été touché.

## Portes

`build` vert · `geometry:gate` 0 invisible · `odoo:authoring:check` toutes couvertes · `odoo:module:check` **23/23**
· `emitters:check` vert · `tsc --noEmit` vert · `parity` **7 constats, aucun neuf** (les 7 sont les
`typography/etat/*/graisse-survol` de la vague 032 ; mes 2 jetons d'état ont leur variable et ne sortent plus).
**`npm run eval` non joué** — worktree partagé avec une autre session, le bac `evals/.scratch` est unique.

## Fichiers touchés

`tokens/semantic.tokens.json` · `contracts/{faq,accordion-row}.contract.json` ·
`integrations/odoo/config/{faq,texte-seo,figma-panels,inputs.lock}.json` ·
`integrations/odoo/addons/piqueray_ds/views/components.xml` ·
`integrations/odoo/addons/piqueray_ds/static/src/css/{responsive/faq.pqr.css (NOUVEAU),odoo-bridge.css}` ·
`integrations/odoo/addons/piqueray_ds/__manifest__.py` · `.../static/src/js/version_guard.js` ·
`scripts/odoo/scan-saved-versions.ts` · `evals/fixtures/odoo-production/version-drift/cases.json` ·
`integrations/odoo/authoring/{pages/faq-test.json (NOUVEAU),compose_page.py}` ·
`parity/snapshots/figma-{tokens,components}.json` (rafraîchis) · sorties générées (`src/`, `core/samples/`,
`catalog/`, CSS Odoo générés) · `.page-parity/{probe-faq.mts,edit-faq.mts,edit-faq-gras.mts}` (NOUVEAUX).
