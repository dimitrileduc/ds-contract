# SAV — section 031 portée vers Odoo, responsive et mesurée (2026-09-02)

**Contrat** : `contracts/sav.contract.json` 1.4.1 → **2.0.0** (ancres = set 031 `2693:20992`, clé `55d2731a…`).
**Bloc Odoo** : `s_pqr_sav`, CSS par écran `static/src/css/responsive/sav.pqr.css`, page de test `/sav-test`.
**Instance** : `piqueray-odoo-pilote` (8087). Édition : http://localhost:8087/odoo/website?path=/sav-test&enable_editor=1&with_loader=1

## Faits relevés sur le set (dump, 4 variantes)

| | Mobile 390 | Tablette 834 | Desktop 1200 | Wide 1728 |
|---|---|---|---|---|
| root (colonne) | pad 0/24, HUG 788 | pad 0/48, HUG 644 | pad 89/56, HUG 683 | pad 0/89, **677 fixe, rangée en bas** |
| fond (absolu) | 342 (dans le padding) | 738 (dans le padding) | 1200 (pleine largeur) | 1550 (dans le padding) |
| rangée | colonne, image AU-DESSUS | idem | ligne, pad 89, 505 | ligne, pad 131, 561 |
| carte texte | pad 48/24/24/24, HUG | idem | pad 48, 505 | pad 48/47/0/48, 561 |
| colonne image | pad 0/24, 320 | idem | pad 0, 505 | pad 3/78, 561 |
| photo | 320, FIT | 320, FIT | 504, **CROP** | 504, FIT |
| Titre | H2 24/30 | H2 24/30 | H2 32/40 | H2 40/50 |
| paragraphe | body 16/24, **Regular** | idem | body 18/27, **Medium** | idem |
| CTA | FILL | FILL | **FIXED 279** | HUG 272 (libellé 18) |

Tokens mintés from-dump (`size.sav.*`) : `row-h-desktop` 505, `wrapper-h-desktop` 505, `img-group-h-desktop` 505,
`img-group-h-compact` 320, `img-h-compact` 320, `cta-w-desktop` 279. Tous les autres = tokens existants
(`space.0/3/24/47/48/56/89`, `size.sav.content-padding/image-right-inset/section-h/row-h/wrapper-h/img-group-h/img-h`,
`typography.h2.*`, `typography.body.*`).

## Décisions (chacune dans la description du contrat)

1. **Wide = ancien master.** La variante Wide porte encore le cadre `section` d'avant 031 (1550×677, rangée en bas)
   que les trois autres ont perdu. Modélisée **à plat** comme les autres : hauteur 677 et `justify: end` remontés sur
   la racine. → *À corriger à la source.*
2. **Aucune propriété TEXT sur le set** : `titre` / `texte` liés `NONE` (1.4.1 liait « Titre » / « Texte »). → *À corriger à la source.*
3. **SectionHeader dessiné à plat** (FRAME, pas une instance du set SectionHeader — idem AvisGoogle, Reassurances).
   Porté comme cadre local, `Titre` monte H2. L'accroche est dessinée écrasée à 1 px : **non portée**.
4. **CTA sans icône** sur les 4 variantes (1.4.1 : `iconRight: true`). Adopté.
5. **Ordre des enfants** : anatomie = ordre mobile (image, carte) ; Desktop/Wide = `row-reverse` (le schéma n'admet
   les directions inversées qu'en override de variante).
6. **Code-only** (part instance / `declared` sans canal par mode) : insets du fond par mode, CTA étiré sous 992 et
   fixé 279 en Desktop, partage égal de la rangée (`flex: 1 1 0`) — mesuré exact à 1200 (503/407) et 1728 (651/637).
7. **Photos** : recadrage Figma à transformation propre (CROP Desktop, transform sur le fond partout) — pas
   d'orthographe CSS. `object-fit: cover` en Desktop (décision owner), `contain` ailleurs ; **l'outil image natif
   d'Odoo (recadrage, position, filtres) est laissé au rédacteur** sur les deux photos (`data-pqr-native-image`,
   exclusion native rendue sélective dans `odoo19_compat.js`).
8. **Hauteurs** : `height` du contrat → `min-height` sur root / rangée / carte, `height` sur colonne image et photo.
9. **Composition** : `s_pqr_bleed` sur SAV dans `home.json` (le set 031 porte son padding 24/48/56/89 ; sans bleed
   la gouttière de page doublerait). Idem page de test.

## Mesure bloc contre planche (`.page-parity/sav-mesure/`)

| largeur | hauteur Odoo vs planche | diff | cause |
|---|---|---|---|
| 390 | 812 vs 788 (+24) | 7.46 % | **1 ligne de plus** : la planche Mobile n'a PAS le saut de ligne avant « Pas de panique » (Desktop/Wide l'ont) → source incohérente, règle owner « un saut = tous les modes » ; + rendu texte |
| 834 | 668 vs 644 (+24) | 7.34 % | idem (Tablette sans saut de ligne) |
| 1200 | 683 = 683 | 11.37 % | géométrie exacte ; photo technicien (crop Figma ≠ cover) ; lissage texte |
| 1728 | 677 = 677 | 1.10 % | géométrie exacte ; résidu = lissage texte |

Graisse du paragraphe (owner, 19h15) : le canvas dessine **Regular** en Mobile/Tablette et **Medium** en Desktop/Wide (plages lues par `getStyledTextSegments`) ; l'extraction avait minté 500 pour tous. Porté par un nouveau token responsive `typography.body.weight` (regular / regular / medium / medium), le contrat monte `{typography.body.weight}` → 390 : 8.0 → 7.5 %.

Correctif mesuré (2026-09-02, 19h) : le plan de fond `<img>` absolu recevait `width: 100 %` de components.pqr.css et débordait de 24/48/89 px à droite (un `<img>` absolu ne s'étire pas par ses insets) → largeur `calc(100% - 2 × inset)` ; 1728 est passé de 15.6 % à 1.1 %. Le fond existe aussi sur le canvas Mobile/Tablette (342×788) mais la rangée le couvre à 100 % : jamais visible, ni sur Figma ni sur Odoo.

Sonde des boîtes (`.page-parity/probe-sav.mts`) : à 1200 rangée 1088×505, carte 503×505, colonne 407×505, photo 407×504,
CTA 279 ; à 1728 rangée 1550×561, carte 651×561, colonne 637×561, photo 556×504, CTA 272 — identiques au canvas.

## À corriger à la source (Figma) — écritures à porter à l'owner
- SAV Wide : retirer le cadre `section` hérité, aligner sur la forme plate des trois autres variantes.
- SAV Mobile + Tablette : poser le saut de ligne avant « Pas de panique » (présent en Desktop/Wide).
- Set SAV : exposer `Titre` et `Texte` en propriétés TEXT.
- SectionHeader à plat dans SAV / AvisGoogle / Reassurances : instance du set ou non ? (à trancher, pas un défaut si voulu).

## Bloqué / à trancher
- `parity` : 6 variables `size/sav/*` **behind** (pas encore de variable Figma — même statut que les 4 mints du hero) →
  sync tokens, orchestrateur.
- `odoo:module:check` rouge sur **ds.presentation** (4.0.0 dans le lock, 3.0.0 dans version_guard / scan) : chantier
  Presentation en cours dans le même worktree (agent Codex) ; le digest global a été re-pinné deux fois ce soir
  (`705207…`) et le sera encore après Presentation.
- Test d'édition (étape 10) : **non exécuté** ce soir — à faire (modèle `edit-linebreak.mts`, zone `sav-text`).

## Fichiers touchés
`contracts/sav.contract.json` · `tokens/primitives.tokens.json` (+6 `size.sav.*`) · `integrations/odoo/config/{sav.authoring.json, figma-panels.json, inputs.lock.json}` ·
`addons/piqueray_ds/{__manifest__.py, views/components.xml, static/src/css/responsive/sav.pqr.css, static/src/js/{authoring.js, odoo19_compat.js, version_guard.js}}` ·
`scripts/odoo/scan-saved-versions.ts` · `evals/fixtures/odoo-production/version-drift/cases.json` · `authoring/pages/{home.json, sav-test.json}` ·
re-pins `evals/golden.json`, `figma-sync/`, `figma-sync/plugin/engine.receipt.json` · outils `.page-parity/{capture-sav.mts, probe-sav.mts, mesure-bloc.mjs}`.

---

# SAV — reprise du 2026-09-04 (contrat 2.0.0 → 2.1.0)

Le SAV était la pire section de la page après la vague : **+24 px de hauteur** en
Mobile et Tablette, **11,37 %** de différence à 1200. Trois causes, toutes
distinctes, toutes trouvées en regardant le triptyque puis en relevant le canevas.

## 1. Le saut de ligne était inconditionnel

Relevé des quatre variantes : même texte, 324 caractères — mais le saut de ligne
après « correctement ? » n'existe **qu'en Desktop et Wide**. Notre contrat le portait
partout, donc une ligne de trop sous 992.

Une prop n'a qu'UNE valeur par défaut : le saut reste donc écrit une fois dans le
texte, et c'est son **rendu** qui devient conditionnel — `white-space: pre-line` en
Desktop et Wide, `normal` sous 992, où le saut se replie en espace. Canal gouverné
(`stylesWhen`), donc porté par React comme par Odoo.

Côté Odoo, deux écritures pour un seul fait, et c'est assumé : le gabarit QWeb écrit
à la main pose un `<br>` réel (l'éditeur inline d'Odoo le manipule mieux qu'un « \n »)
et aucune valeur de `white-space` n'agit sur un `<br>` — il faut donc aussi le masquer.

## 2. La photo Desktop était recadrée à la main

| Variante | Remplissage de `img` |
|---|---|
| Mobile | FIT, sans transformation |
| Tablette | FIT, sans transformation |
| **Desktop** | **CROP, zoom vertical ×1,3558, décalage −0,3554** |
| Wide | FIT, sans transformation |

Les boîtes tombaient au pixel (rangée 1088×505, panneau 503×505, photo 407×504) :
ce n'était donc pas la mise en page, c'était le **contenu** de la photo. Trois
variantes sur quatre en FIT et des valeurs de transformation non rondes : signature
d'un redimensionnement accidentel dans le cadre, pas d'un cadrage décidé.
**Annulé à la source**, retour en FIT comme les trois autres. Version nommée.

## 3. Les espaces insécables n'étaient pas au même endroit

Le plus discret, et celui qui restait après les deux premiers. Les quatre variantes
portent **cinq espaces insécables** — mais pas aux mêmes positions :

| Variantes | Où sont les insécables |
|---|---|
| Mobile, Tablette | avant chaque `?` et `!` — **la règle typographique française** |
| Desktop, Wide | à l'intérieur des groupes en gras (« votre installation », « garage ne ») |

Deux traitements ne coupent pas les lignes au même endroit. Le contrat portait celui
de Desktop, et à 294 px de colonne le paragraphe passait à **onze lignes au lieu de
dix** — les 24 px restants.

Normalisé à la règle française **sur les quatre variantes du canevas** et dans le
contrat. Les plages de gras avaient dérivé d'un caractère sur Desktop et Wide
(l'espace après « garage » était dans le gras) : réalignées sur `[33,52)`,
`[101,122)`, `[252,299)`, identiques aux quatre variantes.

## Résultat

| Largeur | Avant | Après | Hauteur |
|---|---|---|---|
| 390 | 7,46 % (+24 px) | **2,52 %** | exacte |
| 834 | 7,34 % (+24 px) | **1,32 %** | exacte |
| 1200 | 11,37 % | **1,45 %** | exacte |
| 1728 | 1,10 % | **1,11 %** | exacte |

## La leçon

Les trois défauts venaient de la SOURCE, et aucun n'était visible en lisant le
contrat : il fallait relever le canevas variante par variante et comparer les quatre
entre elles. **Ce que deux variantes font pareil et les deux autres autrement est
presque toujours un défaut, pas une intention.** C'est vrai des insécables, du
recadrage de la photo et du saut de ligne — trois fois de suite, dans une seule
section.
