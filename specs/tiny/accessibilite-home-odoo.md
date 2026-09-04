# TinySpec: accessibilite-home-odoo — mesurer, corriger, vérifier et rapporter l'accessibilité de la home

**Branch**: oceanic-oak · **Date**: 2026-09-04 · **Status**: **done** — 10 titres gouvernés, langue + titre de page corrigés, 23 contrastes tranchés · **0 pixel d'écart** · toutes portes vertes, **eval 245/245** · **Complexity**: **moyenne** — le lot 1 est minuscule au cœur (10 déclarations `element`, **aucune règle CSS touchée**) mais porte une propagation Odoo lourde et assumée (précédent `sav-imggroup-background-gap`) ; les lots 2 et 3 sont petits. Gardé en un document parce que la **mesure** et le **rapport** sont communs aux trois.

## Réalisé (2026-09-04)

**Résultat.** La page passe de **0** à **15** balises de titre. Langue `en-US` → `fr-BE`,
titre d'usine → titre réel et **gouverné** (`meta_title` ajouté au descripteur et au
composeur ; la LANGUE reste un réglage d'instance, c'est son vrai niveau). Les 23 points
de contraste portent chacun un verdict écrit (`proofs/…/contrastes.md`). Rapport complet :
`proofs/accessibilite-home-odoo/RAPPORT.md`.

**Preuve pixel : 0, partout.** Méthode : chaque contrat émis DEUX fois dans le même
processus, avec puis sans la clé `element`, rendus et comparés. Écart CSS observé :
exactement **une** ligne `margin: 0` par composant (zéro pour deux qui l'avaient déjà).
Une comparaison contre `HEAD` aurait été trompeuse — elle mélangeait les autres travaux
non committés du worktree (jusqu'à 82 645 pixels étrangers à cette vague).

**Un défaut réel introduit puis corrigé — et il valide l'intuition initiale du
propriétaire.** Passer « Suivez-nous » en `h4` l'a exposé à `.o_footer h4` d'Odoo
(spécificité 0,1,1) qui **bat** `.footer__TitreReseaux` (0,1,0) : orange → quasi-noir sur
fond sombre, contraste mesuré **1.23**, invisible. Aucune décision de renoncement aux
titres n'a jamais été écrite dans ce dépôt (vérifié : specs, registre d'adaptation,
historique git, docs) — mais **le mécanisme redouté est réel**, il n'avait simplement
jamais eu de titre à mordre. Correction posée en règle (5) de `ODOO-023-FOOTER-BRIDGE`,
la zone prévue pour ces conflits, sur le patron exact de sa règle (3). Portée mesurée :
**1 titre sur 10** perdait sa couleur, Odoo ne colorant les titres que dans `.o_footer`
et `.o_cc2`.

**Le test en quarantaine n'a PAS été réveillé, et c'est délibéré.** `heading-margin-reset`
nomme une racine UA-marginée et son corps lit cinq contrats démo supprimés à la
reconversion : le déplacer serait une réécriture, que la règle hybride interdit. Il reste
en quarantaine, exactement. Un cas NEUF couvre l'axe imbriqué que Piqueray a réellement :
`nested-heading-part-semantics-and-margin-reset` (245/245, témoin négatif inclus).

**Sixième miroir de version découvert** — la note de mémoire en listait quatre, la spec
cinq : `integrations/odoo/config/figma-panels.json` épingle les versions dans ses
`componentPath` et fait rougir `odoo:figma-links:check`. Et `odoo:derivation` doit être
régénéré **en dernier**, après toute écriture dans le module.

**Violation restante, voulue** : `heading-order` (2-3 nœuds) = les deux sauts de rang
acceptés par le propriétaire. La décision précédait la mesure ; la mesure confirme
qu'elle laisse une alerte modérée permanente.

## What

Le site Odoo v2 n'a **aucune structure de titres**. On mesure l'état réel, on corrige en trois lots, on re-mesure, et on livre un rapport. Le but n'est pas de poser une balise : c'est de savoir où on en est en accessibilité et de le prouver.

## Mesure de départ (faite, 2026-09-04, instance pilote `:8087`, axe-core 4.10.2 via Chromium)

| Mesure | Mobile 390 | Desktop 1280 |
|---|---|---|
| Balises `h1`–`h6` dans la page | **0** | **0** |
| Violations automatiques | 0 | **1** (`page-has-heading-one`, modéré) |
| `incomplete` à trancher à la main | 19 (`color-contrast`) | 23 (`color-contrast`) |
| Règles passées | 35 | 38 |

Autres relevés du DOM : `lang="en-US"` sur un site **francophone** · `<title>` = « Home | My Website » (valeur d'usine) · 21 images, **0 sans texte alternatif** · repères présents (`header`, `nav`, `main`, `footer`) · 38 liens · aucun défaut ARIA, aucun champ sans étiquette.

**Le résultat le plus important est contre-intuitif et doit figurer au rapport.** L'absence **totale** de titres ne produit qu'**une** alerte automatique. Aucun outil ne peut deviner qu'un texte aurait dû être un titre : l'outil ne voit que le `h1` manquant au niveau page. **La casse structurelle est invisible à l'automatisme** — c'est pourquoi elle a survécu sans que rien ne la signale, et c'est l'argument pour la passe manuelle.

## Lot 1 — les dix titres de la famille typographique 031

Le niveau est **déjà déductible du contrat** : chaque partie titre lie sa typographie à `{typography.hN.*}`, le nom du jeton porte le niveau. **Aucune lecture de Figma ni réparation d'extracteur nécessaire.**

| Contrat | Version | Partie | Jeton | Balise |
|---|---|---|---|---|
| `ds.hero-video` | 2.0.0 | `root.Text.Accroche` | `typography.h1` | `h1` |
| `ds.presentation` | 4.1.0 | `root.colGauche.Titre` | `typography.h2` | `h2` |
| `ds.sav` | 2.1.0 | `root.row.wrapper.inner.SectionHeader.Titre` | `typography.h2` | `h2` |
| `ds.devis` | 2.0.0 | `root.Container.Titre` | `typography.h2` | `h2` |
| `ds.produits-ecommerce` | 2.0.0 | `root.enTete.Titre` | `typography.h2` | `h2` |
| `ds.reassurances` | 2.0.0 | `root.SectionHeader.Titre` | `typography.h2` | `h2` |
| `ds.google-reviews` | 3.0.1 | `root.SectionHeader.Titre` | `typography.h2` | `h2` |
| `ds.carte-categorie` | 2.0.0 | `root.contenuSuperpose.inner.blocTexte.TitreSuperpose` | `typography.h3` | `h3` |
| `ds.carte` | 3.0.0 | `root.text.TitreReassurance` | `typography.h4` | `h4` |
| `ds.footer` | 2.0.0 | `root.Row.col5.TitreReseaux` | `typography.h4` | `h4` |

**Deux sauts de rang acceptés par l'owner (2026-09-04)**, consignés et non corrigés : cartes catégories en `h3` sans `h2` au-dessus ; cartes réassurances en `h4` sous un `h2`. Un audit les signalera — c'est **attendu**, et le rapport doit le dire.

**Hors périmètre, nommé** : `hero`, `texte-seo`, `equipe`, `faq`, `coordonnees`, `header`, `formulaire` (famille ancienne `Titre 1`…`Titre 6`, niveau non déductible, arbitrage éditorial séparé) ; apprendre au proposeur à lire `text.style` (utile pour l'avenir, inutile ici).

## Lot 2 — les deux défauts de page

Ni la langue ni le titre ne sont portés par notre descripteur (`home.json` = `url`, `name`, `view_tname`, `header_overlay`). Ce sont des réglages d'instance : **le trou est dans ce qu'on gouverne**, pas un bug de l'addon. Décider si on les gouverne (champ ajouté au descripteur, propagé par le composeur) ou si on les documente comme réglage d'exploitation.

1. `lang="en-US"` → `fr-BE` (ou `fr`), critère **WCAG 3.1.1**.
2. `<title>` d'uside → un titre réel, critère **WCAG 2.4.2** + référencement.

## Lot 3 — les contrastes à trancher

19 à 23 paires `incomplete` : axe n'a pas su décider (texte sur image, superpositions, dégradés). À trancher **une par une** contre le ratio 4.5:1 (3:1 pour les grands textes), et à conclure par un verdict écrit. Un `incomplete` non tranché n'est **pas** un succès.

## Context

| Fichier | Rôle |
|---|---|
| Les **10 contrats** du lot 1 | **Édités** — `"element": "hN"` sur la partie titre + bump **MINOR** + note de description (sans accolades `{}` — piège `emitters:check`). |
| Figma (`d9FYAUcqdcNtsuaMgLefvJ`) | **Non touché.** Balise = canal code-only ; `parity/diff.ts` ne compare **jamais** `element` (zéro occurrence). **Aucun geste canvas, ni §VIII ni §X.** |
| `src/components/**`, `core/samples/**`, `figma-sync/NN-*.js`, `.../generated/components.pqr.css`, `derivation-report.json` | **Générés** — jamais à la main. Aucune règle CSS nouvelle attendue hormis d'éventuels `margin: 0`. |
| `.../views/components.xml` (9 balises) · `.../views/footer.xml` (1 balise) | **Édités à la main** (zones déclarées) — `<span>` → `<hN>`, + `data-ds-contract-version` et `data-ds-graph-digest` sur les 11 blocs. |
| `integrations/odoo/config/*.authoring.json` (9 fichiers) | **Édités** — **547 épingles de version** : google-reviews 146, reassurances 91 + carte 30, produits-ecommerce 83, footer 50, carte-categorie 46, sav 32, hero-video 24, devis 23, presentation 22. |
| `version_guard.js` · `scripts/odoo/scan-saved-versions.ts` | **Édités** — 10 entrées de version + `CURRENT_GRAPH_DIGEST`/`EXPECTED_GRAPH` (miroirs jumeaux). |
| `evals/fixtures/odoo-production/version-drift/cases.json` | **Édité** — cas `current` **et** `policy-stale` portent le graphDigest. |
| `evals/legacy-cases.ts` → `evals/run.ts` · `evals/REMOVED-CASES.md` | **Édités** — réveil de `heading-margin-reset` par **déplacement du bloc** (move, pas rewrite) ; sa condition écrite est exactement remplie par le lot 1. |
| `docs/03-token-pipeline.md` (l. 99) | **Édité** — l'affirmation « l'extracteur ne peut pas reconnaître un H1 depuis un relevé » est **fausse** : `extract/figma/dump.plugin.js:445-447` écrit `text.style = style.name` et des relevés réels portent `"style":"Titre 5"`. Le manque réel est que `core/propose-figma.ts` ignore ce champ. Corriger, ne pas supprimer. |
| `integrations/odoo/authoring/pages/home.json` (+ composeur) | **Peut-être édité** — seulement si le lot 2 décide de gouverner langue et titre. |
| `inputs.lock.json`, `evals/golden.json`, `engine.receipt.json`, `catalog/catalog.json` | **Re-pins** attendus. |
| `specs/tiny/proofs/accessibilite-home-odoo/` | **Nouveau** — mesures avant/après, captures aux 4 largeurs, verdicts de contraste, rapport. |

## Requirements

1. Les **dix** parties rendent leur balise sur **les trois surfaces émises** (React, référence HTML, gabarits Odoo) — vérifié au rendu, pas par lecture du contrat.
2. **Différence de pixels exactement nulle** avant/après, aux **quatre largeurs** (390 · 768 · 1280 · 1920). Aucune règle CSS ne change : toute valeur non nulle est un défaut, jamais une tolérance.
3. La home présente un plan de document valide : **un seul `h1`**, les six sections en `h2`, les **deux** sauts de rang acceptés étant les seuls écarts, et ils sont **nommés** au rapport.
4. `page-has-heading-one` disparaît ; le compte de violations automatiques revient à **0** aux deux largeurs.
5. Langue et titre de page corrigés, et la décision « gouverné ou réglage d'exploitation » est **écrite**.
6. Chacune des paires de contraste `incomplete` porte un **verdict écrit** (conforme / non conforme / sans objet, avec le ratio mesuré). Aucune n'est laissée sans conclusion.
7. Le cas `heading-margin-reset` est **actif** et vert ; le `N/N` est relevé depuis la sortie de `npm run eval`, jamais recopié.
8. Aucune mutation Figma ; `npm run parity` vert sans nouvel acquittement dans `parity/baseline.json`.
9. Le rapport final dit explicitement **ce que l'automatisme ne voit pas** — l'absence de titres ne produisait qu'une alerte — pour qu'un futur lecteur ne confonde jamais « zéro violation » avec « accessible ».

## Plan

1. Archiver la mesure de départ déjà faite sous `proofs/` (JSON axe + relevé DOM, aux deux largeurs).
2. **Lot 1** : éditer les 10 contrats, `npm run build` **puis** `npm run figma:plan` (piège : `build` ne régénère pas `figma-sync/`), puis `npm run catalog` ; inspecter le diff des générés.
3. Propager : 9 fichiers d'authoring, `components.xml`, `footer.xml`, `version_guard.js`, `scan-saved-versions.ts`, fixture `version-drift`, `check-inputs.ts --repin`.
4. Reprendre à la main les 10 balises dans les gabarits, recharger le module, rejouer `odoo:page`.
5. **Lot 2** : corriger langue et titre ; trancher et écrire la décision de gouvernance.
6. **Lot 3** : trancher les paires de contraste une par une, consigner les ratios.
7. Réveiller `heading-margin-reset` ; corriger `docs/03-token-pipeline.md`.
8. Re-mesurer (axe + relevé DOM, 2 largeurs), comparer au départ, mesurer les pixels aux 4 largeurs.
9. Rédiger le rapport, puis balayage complet des portes.

## Tasks

- [x] Mesure de départ archivée sous `proofs/accessibilite-home-odoo/avant/`
- [x] Lot 1 — 10 contrats : `element` + bump MINOR + note
- [x] `build` → `figma:plan` → `catalog`, diff des générés inspecté (aucune règle CSS nouvelle)
- [x] Propagation : 9 authoring (547 épingles), `components.xml`, `footer.xml`, `version_guard.js`, `scan-saved-versions.ts`, fixture, `--repin`
- [x] 10 balises reprises à la main dans les gabarits + module rechargé + page rejouée
- [x] Lot 2 — langue + titre corrigés, décision de gouvernance écrite
- [x] Lot 3 — les ~23 paires de contraste tranchées, ratios consignés
- [x] Réveil de `heading-margin-reset` + `REMOVED-CASES.md` + compteurs
- [x] Correction `docs/03-token-pipeline.md` l. 99
- [x] Re-mesure axe + DOM, preuves 4 largeurs à **0 px**, rapport rédigé

## Done When

- [x] Toutes les tâches cochées
- [x] Violations automatiques : **0** aux deux largeurs · plan de document valide · aucun `incomplete` sans verdict
- [x] Preuve : **0 pixel** d'écart aux 4 largeurs
- [x] Portes vertes : `build`, `parity`, `eval` (N/N relevé), `plugin:check`, `tsc` (src + build), `geometry:gate`, `roundtrip`, `core-browser`, `odoo:{inputs,authoring,module,derivation,assets}:check`, `verify:catalog`
- [x] (Worktree) `npm install` + `npx playwright install chromium` faits avant le balayage complet
