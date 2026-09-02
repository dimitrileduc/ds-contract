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
