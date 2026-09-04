# Tasks: États d'interaction du Bouton gouverné

**Input**: Design documents from `/specs/032-etats-bouton/`

**Prerequisites**: `plan.md` (requis), `spec.md` (requis — user stories), `research.md` (D1–D15),
`data-model.md` (E1–E3), `contracts/state-tokens.matrix.json`, `contracts/odoo-propagation.contract.md`,
`quickstart.md`

**Tests**: **oui, et ce n'est pas optionnel.** FR-015 et SC-005 font de la restauration d'au moins
une évaluation en quarantaine un **prérequis de la vague** (§II : fixture → eval → claim). Les
tâches d'évaluation sont donc portées par les user stories dont elles tiennent la promesse —
`focus-not-pressed-browser-probe` sous US2 (elle prouve FR-004 et FR-006 dans un vrai navigateur),
`refuse-hollow-state-previews` sous US3 (elle garde FR-008 honnête). Aucun test n'est écrit de
zéro : les deux cas existent déjà, en quarantaine.

**Organization**: tâches groupées par user story. La Phase 2 est **grosse et c'est délibéré** :
le bump de contrat, les 42 feuilles de jetons et la cascade Odoo forment un bloc **atomique**
(un seul `graphDigest`, une seule montée 2.1.0 → 2.2.0). Le découper par histoire ferait payer
deux fois la partie la plus chère de la vague, pour rien. Ce qui reste par histoire est le
**service rendu et sa preuve** — ce qui est exactement ce que les trois *Independent Tests* de
la spec demandent de constater.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallélisable (fichiers différents, aucune dépendance ouverte, zones §XI disjointes)
- **[Story]**: US1, US2, US3
- Chemins exacts dans chaque description

## Path Conventions

- **Dépôt** (racine du worktree) : `tokens/`, `contracts/`, `evals/`, `integrations/odoo/`, `docs/`
- **Niveau vague** : `specs/032-etats-bouton/` — `proofs/`, et `tools/render-repos.mts`
  qui vit **dans le dossier de la spec**, pas dans le dépôt (Structure Decision du plan)
- **Généré, jamais édité à la main** : `src/components/`, `src/styles/tokens.css`,
  `figma-sync/*.js`, `catalog/catalog.json`, `evals/golden.json`,
  `integrations/odoo/addons/piqueray_ds/static/src/css/generated/`

---

## Trois règles qui gouvernent l'ordre — les enfreindre coûte une reprise complète

1. **§X — photographier avant de muter.** T007–T009 précèdent le **premier** geste canevas
   (T011), sur **toutes** les cibles, jamais un sous-ensemble pilote. Une capture manquée
   découverte après est irrécupérable.
2. **La fenêtre du repos ne se rattrape pas.** T006 rend les 7 PNG du repos **avant** que le
   contrat soit touché (T015). Après, l'avant de SC-006 n'existe plus.
3. **`npm run build` ne régénère PAS `figma-sync/*.js`.** L'ordre `build` → `figma:plan` →
   `emitters:check` / `catalog` → `golden:update` est non négociable (T017 → T021 → T022).
   Figer l'or après le seul `build` produit un script Figma périmé qui passe `emitters:check`
   et se fait attraper plus tard par l'eval `golden-generated-output` — coût constaté sur
   `ds.sav` : une reprise complète.

---

## Phase 1: Setup (infrastructure partagée)

**Purpose**: rendre le worktree capable de lancer le balayage complet, et préparer les reçus

- [X] T001 Rendre le worktree auto-suffisant depuis `/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/oceanic-oak` : `npm install` puis `npx playwright install chromium` — le runner d'évaluations symlinke les `node_modules` **du checkout**, ce qui est exactement pourquoi un worktree nu échoue (§Worktree Gates, F1)
- [X] T002 [P] Créer l'arborescence de reçus `specs/032-etats-bouton/proofs/{T0,T0/repos,etape1,etape2,etape2/repos,etape2/diff,etape3,etape4,etape5,cloture}/`
- [X] T003 Vérifier les trois accès de la vague et écrire le relevé dans `specs/032-etats-bouton/proofs/T0/acces.txt` : (a) `mcp__figma-console__figma_get_status` → `portFallbackUsed: false` (sinon recette « pont-figma-ports-satures » en mémoire projet) ; (b) `FIGMA_TOKEN` lisible depuis `.env.local` du checkout principal ; (c) le nom du projet Docker Odoo **jetable** retenu — **jamais `piqueray-odoo-test` (8071), qui est à l'owner**

---

## ✅ Arrêt levé — 2026-09-04

La collision de worktree avec `oceanic-oak-f2` est close : elle a committé
(`9e57c15f`), la ligne de base a été rejouée sur un arbre propre (16/16 portes,
eval 245/245, `baseline.json` à 40), et la vague a déroulé.

Récit de la collision : `proofs/T0/COLLISION.md`.
Relevé disqualifié conservé : `proofs/T0/gates-disqualifie.txt`.

---

## Phase 2: Foundational (prérequis bloquants — AUCUNE user story ne peut démarrer avant)

**⚠️ CRITICAL**: cette phase contient les deux fenêtres irréversibles (§X et la photo du repos) et le bloc atomique contrat + jetons + cascade Odoo.

### 2a — La ligne de base et les fenêtres qui ne se rattrapent pas

- [X] T004 Relever la ligne de base **complète** des portes dans `specs/032-etats-bouton/proofs/T0/gates.txt` : `npm run build`, `npm run parity`, `npm run eval`, `npm run plugin:check`, `npx tsx scripts/deterministic-roundtrip.mjs`, `node scripts/core-browser-check.mjs`, `npx tsc --noEmit && npx tsc -p tsconfig.build.json`, les six portes Odoo (`odoo:inputs:check`, `odoo:authoring:check`, `odoo:module:check`, `odoo:derivation:check`, `odoo:figma-links:check`, `odoo:typecheck`), `git status --short`. **Le `N/N` d'`npm run eval` est relevé de la sortie vive, jamais recopié d'une prose** — c'est la seule valeur qui compte pour SC-005 et SC-007. Relever aussi le compte d'entrées de `parity/baseline.json` (attendu : 40)
- [X] T005 Écrire l'outil de rendu du repos `specs/032-etats-bouton/tools/render-repos.mts` : rend les 7 styles de `ds.button` au repos par `core/emit-html.ts` dans Chromium (`playwright-core`), un PNG par style nommé `default|orange|blanc|outlineBlanc|link|outlineNoir|iconOnly`, dimensions figées, `--out <dir>`. Il vit dans le dossier de la spec et n'entre pas dans le dépôt
- [X] T006 Rendre l'**avant** de SC-006 : `npx tsx specs/032-etats-bouton/tools/render-repos.mts --out specs/032-etats-bouton/proofs/T0/repos/` — vérifier les 7 PNG non vides et correctement dimensionnés. **À faire avant T015 ; après, cet avant n'existe plus**
- [X] T007 [P] Photographier le canevas (§X) : `npx tsx extract/figma/state-photo/run.ts capture 032-avant --refresh` sur **toutes** les planches cibles, jamais un sous-ensemble. Vérifier chaque capture non vide et correctement dimensionnée avant de continuer
- [X] T008 Relever les instances **par identifiant de nœud, jamais par nom de calque** : par le pont, `loadAllPagesAsync()` puis `getNodeByIdAsync('6:122')` et `getInstancesAsync()`, en écrivant `{variantes:[{id,nom}], instances, parVariante}` dans `specs/032-etats-bouton/proofs/T0/canvas-avant.json`. **C'est ce relevé qui fait foi pour SC-003, pas le chiffre 354 de la spec**
- [X] T009 Poser une version nommée sur le fichier Figma : `saveVersionHistoryAsync('032 — avant états du Bouton')` — le point de retour exigé par FR-016. Reçu dans `specs/032-etats-bouton/proofs/T0/version-nommee.txt`

### 2b — Débloquer le sync de jetons (premier geste canevas, métadonnée pure)

- [X] T010 Sonder les deux styles de texte par le pont et écrire `specs/032-etats-bouton/proofs/etape1/marqueurs-avant.json` : pour « Entrée menu » et « Sous-entrée menu », relever `id`, marqueur `ds_contracts/textStyleToken` existant, et la **recette vive** (`fontName`, `fontSize`, `lineHeight`, `textCase`). **Vérifier que la recette vive est identique à celle de `tokens/semantic.tokens.json`** (Montserrat Medium 24/30 capitales, Montserrat Regular 18/27) avant de poser quoi que ce soit
- [X] T011 Poser le marqueur `setSharedPluginData('ds_contracts','textStyleToken', 'typography.menu-entree.size')` et `'typography.menu-sous-entree.size'` sur les deux styles existants — écriture de métadonnée pure, aucun pixel ne bouge, aucun nœud créé. **Si le préflight lève `Duplicate Text Style identity marker`, arrêter et ne pas forcer** : le marqueur est déjà porté par un autre style. Reçu avant/après dans `specs/032-etats-bouton/proofs/etape1/marqueurs.json`
- [X] T012 [P] Corriger `docs/03-token-pipeline.md` : la documentation désigne aujourd'hui les **mauvais** styles pour cette migration de marqueur. Nommer « Entrée menu » et « Sous-entrée menu », avec la date et la vague (D8)

### 2c — Les jetons, puis le contrat (bloc atomique — la matrice arrêtée est la source)

- [X] T013 Minter les **7 primitives** dans `tokens/primitives.tokens.json`, groupe `color` : `noir-bleute-survol` `#404245`, `noir-bleute-presse` `#4A4D51`, `orange-survol` `#E07C0A`, `orange-presse` `#C76D09`, `gris-presse` `#CFCFCF`, `transparent` `#FFFFFF00`, `noir-profond` `#131416`. **Chaque `$description` porte l'entorse à §VIII en toutes lettres** — teintes calculées puis posées par l'owner, relevé du 2026-09-04 postérieur au calcul — et les deux dernières portent en plus « posée par la spec 032, non relevée de la planche owner ». `color.gris-clair` `#E0E0E0` **existe déjà** : la réutiliser telle quelle, ne pas la re-minter
- [X] T014 Écrire les **35 alias** `color.etat.<style>.<canal>` dans `tokens/primitives.tokens.json`, forme DTCG `{"$type":"color","$value":"{color.<primitive>}"}` — **jamais une valeur littérale**. 7 styles (`default`, `orange`, `blanc`, `outlineBlanc`, `link`, `outlineNoir`, `iconOnly`) × 5 canaux (`fond-survol`, `libelle-survol`, `fond-presse`, `libelle-presse`, `anneau-focus`), valeurs recopiées de `specs/032-etats-bouton/contracts/state-tokens.matrix.json` → `matrix`. **Les sept styles doivent porter chaque canal** : un jeton manquant est un refus par nom au build (`core/emit-react.ts:1627`), pas un saut silencieux
- [X] T015 Bumper `contracts/button.contract.json` de `2.1.0` à **`2.2.0`** (MINOR, additif seul) : `states: ["hover","active","focus-visible"]` (`disabled` reste hors périmètre), `figmaStatePreviews: true`, et `anatomy.root.states` = `hover {background-color, color}`, `active {background-color, color}`, `focus-visible {outline-color, outline-width}` avec les références de `contracts/state-tokens.matrix.json` → `contractStates`. Ajouter une `description` datée nommant la vague, l'arbitrage owner sur FR-019 et la limite du soulignement — **sans accolades autour des chemins de jetons** (l'invariant « zéro accolade non résolue » d'`emitters:check` lève un faux positif). **Ne toucher à rien d'autre** : `props`, `semantics`, `a11y`, `anchors`, `anatomy.root.tokens`, `tokensByProp`, `declared`, `parts` restent octet pour octet identiques — c'est ce qui rend SC-006 tenable
- [X] T016 Contrôler la conformité de la matrice et écrire `specs/032-etats-bouton/proofs/etape2/conformite-matrice.txt` : chaque cellule de `contracts/state-tokens.matrix.json` → `matrix` a son alias dans `tokens/primitives.tokens.json`, chaque `contractStates` a sa contrepartie dans `contracts/button.contract.json`, aucun alias orphelin. **Une divergence entre ces trois fichiers est un défaut de la vague**, pas une tolérance

### 2d — Générer, puis prouver que le repos n'a pas bougé

- [X] T017 `npm run build` (tokens → schema → generate → odoo:assets → odoo:figma-links → odoo:derivation), puis vérifier ligne à ligne dans `specs/032-etats-bouton/proofs/etape2/greps.txt` : `grep -c -- "--color-etat-" src/styles/tokens.css` = 35 ; les deux primitives neuves nommées présentes ; `grep -c ":hover" src/components/Button/Button.module.css` = 14 ; `:active` = 14 ; `:focus-visible` = 9 ; `outline-style: solid` présent ; `grep -c ":hover" integrations/odoo/addons/piqueray_ds/static/src/css/generated/components.pqr.css` non nul
- [X] T018 Prouver FR-010 par le diff : `git diff src/components/Button/Button.module.css | grep "^-" | grep -v "^---"` doit être **vide**. Une ligne supprimée signifie que le repos a bougé — **arrêter**. Reçu dans `specs/032-etats-bouton/proofs/etape2/diff-additif.txt`
- [X] T019 Prouver SC-006 au pixel : `npx tsx specs/032-etats-bouton/tools/render-repos.mts --out specs/032-etats-bouton/proofs/etape2/repos/`, puis pour les 7 styles `npm run images:compare -- --before proofs/T0/repos/<v>.png --after proofs/etape2/repos/<v>.png --out proofs/etape2/diff/<v>` en comparaison **stricte** (dimensions identiques, aucun redimensionnement, aucun alignement). **Attendu : `0.0000 %` sur les 7**
- [X] T020 Prouver SC-004 dans le périmètre du Bouton : grep des règles d'état écrites à la main (`:hover`, `:active`, `:focus`) hors des CSS générés, dans `specs/032-etats-bouton/proofs/etape2/grep-manuel.txt`. La seule survivante attendue est `integrations/odoo/addons/piqueray_ds/static/src/css/odoo-bridge.css:334-340` (survol des icônes sociales du pied de page) — **elle porte `opacity`, qui n'est pas un canal d'état de part, et elle est hors périmètre par décision D11**. La nommer dans le reçu, ne pas la supprimer

### 2e — La cascade Odoo et les re-pins (ordre non négociable)

- [X] T021 `npm run figma:plan` — **`npm run build` ne régénère pas `figma-sync/*.js`**. Sauter cette étape fige un script périmé qui passe `emitters:check` et se fait attraper par l'eval `golden-generated-output`
- [X] T022 Dans cet ordre : `npm run emitters:check`, `npm run catalog`, `npm run golden:update`, `node scripts/build-plugin-zip.mjs --update-engine-receipt`. Re-pins attendus : `evals/golden.json`, `catalog/catalog.json`, `figma-sync/plugin/engine.receipt.json`
- [X] T023 Aligner les **253 épingles** `ds.button` de `2.1.0` à `2.2.0` dans les 13 `integrations/odoo/config/*.authoring.json` — répartition mesurée : `produits-ecommerce` 55, `reassurances` 55, `categories` 22, `google-reviews` 22, `menu-mobile` 22, puis 11 chacun pour `devis`, `faq`, `footer`, `header`, `hero`, `hero-video`, `presentation`, `sav`. Porte : `npm run odoo:authoring:check`
- [X] T024 [P] Aligner les **14 occurrences** de `data-ds-graph-digest` dans `integrations/odoo/addons/piqueray_ds/views/components.xml` sur le nouveau `graphDigest`
- [X] T025 [P] Aligner `CURRENT_GRAPH_DIGEST` dans `integrations/odoo/addons/piqueray_ds/static/src/js/version_guard.js`
- [X] T026 [P] Aligner `EXPECTED_GRAPH` dans `scripts/odoo/scan-saved-versions.ts` — c'est le **jumeau manuel** de T025 ; `npm run odoo:module:check` compare les deux au verrou
- [X] T027 [P] Aligner les **2 digests** dans `evals/fixtures/odoo-production/version-drift/cases.json` : les cas `current` **et** `policy-stale`
- [X] T028 Régénérer le verrou : `npx tsx scripts/odoo/check-inputs.ts --repin` → `integrations/odoo/config/inputs.lock.json` (version + sha256 + `graphDigest`)
- [X] T029 Vérifier les six portes Odoo vertes et écrire `specs/032-etats-bouton/proofs/etape2/portes-odoo.txt`. **Contrôler que `examples/polaris/figma/*.figma.js` ne porte AUCUN re-pin** : cette vague ne touche pas d'émetteur ; un re-pin qui apparaît là est le signe qu'un émetteur a bougé sans qu'on l'ait voulu — arrêter et chercher pourquoi

**Checkpoint**: le contrat, les jetons et les trois surfaces sont générés ; le repos est prouvé intact ; la cascade Odoo est alignée. Les trois user stories peuvent démarrer.

---

## Phase 3: User Story 1 — Le bouton répond au geste, sur le site (Priority: P1) 🎯 MVP

**Goal**: un visiteur de la home Odoo voit chaque bouton changer d'aspect au survol, et voit son appui confirmé au doigt sur téléphone.

**Independent Test**: ouvrir la home Odoo, survoler puis presser chacun des 7 styles de bouton, et constater un changement visible à chaque fois. Se vérifie **sans** le focus clavier (US2) et **sans** la planche Figma (US3).

- [X] T030 [US1] Recharger l'addon dans l'instance Docker **jetable** : `odoo -u piqueray_ds` — **jamais `piqueray-odoo-test` (8071)**
- [X] T031 [US1] Recomposer la page : `npm run odoo:page -- home <projet-docker-jetable>`. Un bloc posé dans Odoo est du HTML **figé** — Odoo n'y propage rien, la page doit être reconstruite
- [X] T032 [US1] Vérifier le **survol** des styles présents sur la home (FR-001, SC-001) et capturer chacun dans `specs/032-etats-bouton/proofs/etape3/survol/` : l'aspect change de manière perceptible à l'œil, sur les 7
- [X] T033 [US1] Vérifier le **pressé** (FR-003) et capturer dans `specs/032-etats-bouton/proofs/etape3/presse/` : teinte **distincte du survol et du repos**, sur les 7
- [X] T034 [US1] Vérifier le style **Link** — « Lire la suite », « Voir tous les avis » : le libellé passe à `noir-pur` au survol et à `noir-profond` au pressé (FR-013). Consigner dans le reçu que le pressé est *moins* extrême que le survol : c'est l'ordre choisi par l'owner le 2026-09-04, écrit pour ne pas être redécouvert comme un bug (D6)
- [X] T035 [US1] Vérifier les deux styles à **simple contour** (`outlineBlanc`, `outlineNoir`) : ils se remplissent au survol et leur libellé s'inverse pour rester lisible (FR-002)
- [X] T036 [US1] Relever le **contraste réel** du libellé sur son fond dans chaque état, par `getComputedStyle` sur la page vive, et le confronter à `contracts/state-tokens.matrix.json` → `contrastLedger`. Écrire `specs/032-etats-bouton/proofs/etape3/contraste.md`. **Règle FR-019 telle qu'arbitrée** : plancher 4,5 pour les six styles conformes (minimum attendu 8,50), et pour `orange` — sous AA au repos par FR-012 — une progression **croissante** 2,42 → 2,98 → 3,74. Un style qui empire est un échec
- [X] T036b [US1] **Conflit Bootstrap du pied de page — prédit avant écriture, à MESURER puis corriger.** Sur la page vive, relever la couleur **calculée** du libellé du CTA du pied de page (style `outlineBlanc`, rendu en `<a>` par `views/components.xml:157`) au survol ET au pressé, et nommer la règle gagnante par `el.matches(rule.selectorText)` sur `document.styleSheets` — jamais par lecture du CSS généré. Prédiction à confirmer ou infirmer : la règle (3) de `ODOO-023-FOOTER-BRIDGE` (`.footer[data-pqr-shell="footer"] a.button`, spécificité **0,3,1**) bat le sélecteur d'état émis (`.button--variant-outlineBlanc:hover:not(:disabled)`, **0,3,0**) et épingle le libellé à `blanc` alors que le fond passe à `blanc` → **contraste 1,00, libellé effacé**, ce que FR-019 interdit explicitement. **Si la mesure confirme** : poser une règle (6) dans la MÊME zone, sur le patron déjà employé deux fois par (3) et (5) — reprendre le canal `libelle-survol` / `libelle-presse` du contrat **par la variable de jeton, jamais une valeur littérale**, à spécificité gagnante. Ce n'est pas une règle d'état manuelle au sens de FR-011/SC-004 mais une neutralisation de conflit qui re-porte le canal gouverné : la distinction est à écrire au rapport de clôture. **Si la mesure infirme** : la note est corrigée, pas défendue. Contrôler dans la même passe `:focus-visible` (attendu **sans** conflit : il ne porte qu'`outline-*`, hors des canaux revendiqués par (3)) et la zone `.o_cc2`. Reçu : `specs/032-etats-bouton/proofs/etape3/conflit-bootstrap.md`. Analyse complète : `proofs/T0/conflit-bootstrap-footer.md`
- [X] T037 [US1] Resauvegarder et prouver FR-018 / SC-008 : `npm run odoo:save` puis `npx tsx scripts/odoo/scan-saved-versions.ts` → **zéro bloc en `structure-stale`** sur les 13. Reçu : `specs/032-etats-bouton/proofs/etape3/scan-saved-versions.json`

**Checkpoint**: US1 est livrable seule — le site répond au geste, sans que le focus clavier ni le canevas aient été touchés.

---

## Phase 4: User Story 2 — Le focus clavier est visible partout (Priority: P2)

**Goal**: une personne qui navigue au clavier voit un anneau net autour de chaque bouton atteint, sur les sections claires comme sur les sections sombres — et ne le voit jamais au clic souris.

**Independent Test**: parcourir la home au clavier uniquement, de haut en bas, et vérifier qu'aucun bouton ne prend le focus sans anneau visible, hero vidéo et pied de page compris.

### Le service rendu

- [X] T038 [US2] Parcourir la home **à la seule touche Tab**, de haut en bas, sur la page composée à T031, et capturer chaque arrêt dans `specs/032-etats-bouton/proofs/etape3/focus/`. **Aucun bouton ne prend le focus sans anneau** (FR-004, US2 scénario 1)
- [X] T039 [US2] Vérifier que l'anneau est en **trait plein d'au moins 2 px** (`outline-style: solid`, `outline-width` lié à `border-width.2`) et qu'il reste distinguable sur fond clair **comme** sur fond sombre — hero vidéo et pied de page compris (FR-004, FR-005)
- [X] T040 [US2] Relever le **contraste de l'anneau** sur les cinq fonds réellement employés par le site et le confronter à `contracts/state-tokens.matrix.json` → `focusRingLedger` : `blanc` `#FFFFFF` 14,76 · `bleu-clair` `#F4F6FA` 13,65 · `beige-clair` `#FFF3E2` 13,48 · `noir-bleute` `#26282C` 14,76 · `noir-pur` `#000000` 21,00. Seuil FR-005 : **3 pour 1**. Écrire `specs/032-etats-bouton/proofs/etape3/anneau.md` (SC-002)
- [X] T041 [US2] Vérifier FR-006 : **cliquer** un bouton à la souris ne produit **aucun** anneau — `:focus-visible` ne s'arme pas au pointeur. Capture dans `specs/032-etats-bouton/proofs/etape3/focus/clic-souris.png`

### L'évaluation qui tient la promesse (FR-015, SC-005 — §II : pas de claim sans eval)

- [X] T042 [US2] Sortir `focus-not-pressed-browser-probe` de quarantaine : le déplacer de `evals/legacy-cases.ts:865` vers le registre actif de `evals/run.ts`, et **repointer ses noms de jetons sur la famille Piqueray** `color.etat.<style>.<canal>` — le cas lit déjà `contracts/button.contract.json`, seuls les noms changent (D9). Il prouve dans un vrai Chromium que le focus clavier rend le fond **de repos** sous l'anneau, jamais celui du survol
- [X] T043 [US2] `npm run eval` → relever le `N/N` vif et vérifier qu'il vaut **au moins celui de T004 plus 1** (SC-005). Reçu : `specs/032-etats-bouton/proofs/etape5/eval.txt`
- [X] T044 [US2] **Contrôle adverse — obligatoire, sinon la promesse n'est pas prouvée.** Saboter, une ligne à la fois, en revenant à chaque fois : (1) retirer `"focus-visible"` de `contract.states` → l'eval doit **rougir par nom** ; (2) faire porter au `:focus-visible` le fond de survol → l'eval doit **rougir**. Puis restaurer et vérifier le vert. Écrire les deux rouges et le vert final dans `specs/032-etats-bouton/proofs/etape5/adverse.txt`. **Un cas qui reste vert quand on le sabote ne prouve rien**
- [X] T045 [US2] Mettre à jour `evals/REMOVED-CASES.md` : décrémenter la ligne de quarantaine et dater la sortie de `focus-not-pressed-browser-probe`. **La quarantaine n'est jamais silencieuse**

**Checkpoint**: US1 et US2 fonctionnent toutes deux sur le site, chacune vérifiable seule, et la capacité annoncée par US2 a une évaluation adversariale derrière elle.

---

## Phase 5: User Story 3 — Le designer lit les états sans lancer le site (Priority: P3)

**Goal**: le master `Bouton` porte une grille styles × états, **fabriquée par le moteur depuis le contrat**, jamais dessinée à la main.

**Independent Test**: ouvrir le master `Bouton` (`6:122`) dans « Piqueray (Copy) » et constater la grille complète, sans rien lancer d'autre.

**Ordre obligatoire** : les jetons d'abord (les cases d'état **lient** des variables ; les poser avant qu'elles existent produirait des cases muettes), le Bouton ensuite.

- [X] T046 [US3] Exécuter `figma-sync/01-tokens.js` par le pont figma-console → **42 variables neuves** dans la collection `Primitives` (7 primitives + 35 alias `color/etat/…`). Débloqué par T011 ; sans le marqueur, le préflight refuse **avant** la première écriture de variable
- [X] T047 [US3] Exécuter `figma-sync/NN-button.js` par le pont → l'axe `State` (type VARIANT, défaut `Default`, options `Default`, `Hover`, `Active`, `Focus Visible`) sur le set `6:122`
- [X] T048 [US3] Vérifier le volume et l'**identité** : le set passe de 7 à **28** variantes (7 renommées `Style=X, State=Default` + **21 créées** — 21, pas 14 : la spec citait une sonde à deux états, `focus-visible` en ajoute 7, D12), et les **identifiants de nœud des 7 variantes d'origine sont inchangés** vs `specs/032-etats-bouton/proofs/T0/canvas-avant.json` (FR-008, FR-009)
- [X] T049 [US3] Prouver SC-003 : re-relever `getInstancesAsync()` sur `6:122` et comparer à `canvas-avant.json` — **même compte d'instances rattachées, zéro orpheline, zéro doublon**. Si un jumeau **antérieur** à la vague est rencontré, **ne jamais le supprimer** : le supprimer orphelinerait ses instances de façon irréversible. Reçu : `specs/032-etats-bouton/proofs/etape4/instances-apres.json`
- [X] T050 [US3] `npx tsx extract/figma/state-photo/run.ts capture 032-apres --refresh` puis `compare 032-avant 032-apres` → `specs/032-etats-bouton/proofs/etape4/state-photo/`
- [X] T051 [US3] Prouver l'idempotence (FR-017, SC-009) : relancer **le même** script du Bouton sans rien changer. Attendu `skipped: true, reason: "unchanged"` ou `addedVariants: [], rebuiltVariants: 0` — **zéro nœud créé, zéro modifié**. Reçu : `specs/032-etats-bouton/proofs/etape4/idempotence.json`
- [X] T052 [US3] `npm run parity` → l'axe `figma-tokens` est vert (les 42 feuilles ont leur variable) et **`parity/baseline.json` est toujours à 40 entrées, pas une de plus**. Un acquittement neuf signifierait qu'on laisse un axe rouge derrière soi — c'est exactement la dette que 015 avait créée (7 → 89) et que 016 a dû rembourser (D13)
- [X] T053 [US3] Sortir `refuse-hollow-state-previews` de quarantaine (`evals/legacy-cases.ts:357` → `evals/run.ts`) : elle garde FR-008 honnête en refusant **par nom** un `figmaStatePreviews` creux. Adaptation directe, le fixture manipule déjà `CONTRACT`. Mettre à jour `evals/REMOVED-CASES.md`. **Si le budget de la vague se tend, cette tâche part au registre de travail différé avec sa raison** — FR-015 n'exige qu'une évaluation restaurée, tenue par T042

**Checkpoint**: les trois user stories sont livrées et vérifiables indépendamment.

---

## Phase 6: Polish & limites nommées (transverse)

**Purpose**: écrire les dégradations là où la capacité est annoncée (§V), et refermer la vague sur un balayage complet.

- [X] T054 [P] Écrire les limites **L1, L2, L3** dans `docs/FIGMA-CAPABILITY-MATRIX.md`, chacune là où la capacité est annoncée : L1 — le soulignement du style Link est impossible **par style** (`declaredStates` est indexé état → canal → valeur sur la racine, sans dimension par énuméré ; souligner le Link soulignerait les 7), avec la décision owner FR-013 comme repli ; L2 — aucune réaction de prototype n'est générée, un ajout manuel serait effacé au sync suivant (FR-014) ; L3 — `outline-offset` n'est pas porté au canevas, la bague dessinée colle au bord là où le CSS la décale de 2 px (approximation déjà nommée dans `core/emit-figma-script.ts:1722`)
- [X] T055 [P] Écrire la limite **L5** dans la `description` de `contracts/icons.registry.json` : `check`, `google`, `google-wordmark`, `octicon-chevron-down12`, `star`, `star-empty` ne portent pas `fill="currentColor"` et ne suivraient donc pas la couleur d'état. Aucun n'est aujourd'hui porté par un bouton — les six glyphes réellement employés le sont tous (D15)
- [X] T056 [P] Inscrire au **registre de travail différé** les deux reports, avec leur raison : **L4** — garde `@media (hover: hover)` sur les règles de survol, tous contrats (le survol peut rester collant après un appui tactile ; `:active` fournit déjà le retour exigé par FR-003, et poser la garde serait une modification d'émetteur touchant les 39 contrats) ; **L6** — gouverner le survol manuel des icônes sociales du pied de page (il porte `opacity`, hors de `PART_STATE_CHANNELS` ; l'élargir serait une modification d'émetteur, contre le « `ds.button` seul » annoncé en tête de spec)
- [X] T057 Balayage de clôture (SC-007) : reprendre **l'intégralité** de T004, plus `npm run geometry:gate`, `npm run mint:check`, `npm run mint:code:check`, `npm run verify:catalog`. Écrire `specs/032-etats-bouton/proofs/cloture/gates.txt` et le comparer ligne à ligne à `proofs/T0/gates.txt`. **Attendu : tout vert, `parity/baseline.json` toujours à 40 entrées, arbre propre hors `specs/032-etats-bouton/`**
- [X] T058 Écrire `specs/032-etats-bouton/RAPPORT-CLOTURE.md` en portant en toutes lettres ce qui a été tranché plutôt que dissimulé : la **lecture littérale de FR-019 rejetée** avec sa raison (elle refusait la palette validée par l'owner sur 5 styles sur 7) ; le **défaut de contraste préexistant du style Orange** consigné comme limite nommée et **non corrigé** (FR-012) ; l'**exception FR-011 / SC-004** lue dans le périmètre du Bouton, le survol du pied de page restant avec sa raison technique (D11) ; l'**écart de compte 14 → 21 cases d'état** vs la spec (D12) ; l'**entorse à §VIII** — teintes calculées puis posées, relevé postérieur ; et le sort de T053 si elle a été différée
- [X] T059 [P] Ajouter l'entrée datée de la vague 032 dans `MILESTONES.md` — avec le `N/N` d'évaluations **relevé**, jamais recopié d'une prose
- [X] T060 [P] Mettre à jour la section **Recent Changes** de `CLAUDE.md` : la vague 032, ce qu'elle a prouvé, et les limites qu'elle laisse nommées derrière elle

---

## Dependencies & Execution Order

### Dépendances de phase

- **Phase 1 (Setup)** : aucune dépendance
- **Phase 2 (Foundational)** : dépend de Phase 1 — **BLOQUE les trois user stories**
- **Phase 3 (US1, P1)** : dépend de Phase 2
- **Phase 4 (US2, P2)** : dépend de Phase 2 ; réutilise la page composée à T031 (sinon la recomposer)
- **Phase 5 (US3, P3)** : dépend de Phase 2, et de **T011** en particulier (sans le marqueur, T046 refuse)
- **Phase 6 (Polish)** : dépend des user stories retenues

### Dépendances dures à l'intérieur de Phase 2

```
T004 ─┬─ T006  (la photo du repos AVANT toute édition de contrat)
      └─ T007 ─ T008 ─ T009 ─ T011   (§X : photographier avant de muter)
T005 ── T006
T011 ────────────────────────────────── T046   (le marqueur débloque 01-tokens.js)
T013 ─ T014 ─ T015 ─ T016 ─ T017 ─┬─ T018
                                   ├─ T019  (a besoin de T006)
                                   ├─ T020
                                   └─ T021 ─ T022 ─ T023..T028 ─ T029
```

### Dépendances entre user stories

- **US1 (P1)** : autonome après Phase 2. Ne dépend ni de US2 ni de US3
- **US2 (P2)** : autonome après Phase 2. Partage la page composée de US1 par commodité, pas par nécessité
- **US3 (P3)** : autonome après Phase 2 + T011. N'a aucun effet sur US1 ni US2 — la spec le dit : « livrable après les deux autres histoires, sur lesquelles il n'a aucun effet »

### Parallélisation

- **Phase 1** : T002 en parallèle de T001/T003
- **Phase 2** : T007 en parallèle de T005/T006 (zones disjointes : canevas vs Chromium local) ; T012 en parallèle de T013–T015 ; T024, T025, T026, T027 en parallèle entre eux (quatre fichiers distincts) — **mais T023 seule sur les 13 `*.authoring.json`**
- **Phase 6** : T054, T055, T056, T059, T060 en parallèle
- **Entre histoires** : une fois Phase 2 close, US1, US2 et US3 peuvent avancer en parallèle. **Attention §XI** : US3 est le seul écrivain canevas ; si un second agent y travaille, partitionner en zones disjointes et garder **un unique** cycle global de vérification pixel, tenu par l'orchestrateur

---

## Parallel Example: Phase 2e (la cascade Odoo)

```bash
# Après T022 (or figé), quatre miroirs sur quatre fichiers distincts :
Task: "T024 — 14 x data-ds-graph-digest dans views/components.xml"
Task: "T025 — CURRENT_GRAPH_DIGEST dans static/src/js/version_guard.js"
Task: "T026 — EXPECTED_GRAPH dans scripts/odoo/scan-saved-versions.ts"
Task: "T027 — 2 digests dans evals/fixtures/odoo-production/version-drift/cases.json"
# T023 reste seule : 253 épingles réparties sur 13 fichiers du même répertoire
```

---

## Implementation Strategy

### MVP d'abord (US1 seule)

1. Phase 1 (Setup) — T001–T003
2. Phase 2 (Foundational) — T004–T029, **les deux fenêtres irréversibles en tête**
3. Phase 3 (US1) — T030–T037
4. **ARRÊT et VALIDATION** : la home Odoo répond au survol et au pressé sur les 7 styles, le repos n'a pas bougé d'un pixel, zéro bloc en structure périmée
5. Livrable en l'état — sans focus clavier, sans planche Figma

### Livraison incrémentale

1. Setup + Foundational → le contrat, les jetons et les trois surfaces sont générés
2. + US1 → le site répond au geste (MVP)
3. + US2 → le focus clavier est visible, et **une évaluation adversariale tient la promesse** (SC-005)
4. + US3 → le designer lit la grille dans Figma, l'axe est idempotent, la parité est verte sans acquittement neuf
5. + Polish → les six limites sont écrites là où la capacité est annoncée, et le balayage de clôture est comparé à T0

### Le budget, s'il se tend

FR-015 exige **une** évaluation restaurée ; SC-005 exige **+1** au compte. T042 les tient tous les
deux. T053 est le second cas, et les deux autres candidats de D9
(`state-axis-drift-both-directions`, `state-previews-bounded-canvas-only`) ne sont pas des tâches
de cette vague : ils sont chiffrés dans la recherche et partent au registre. **Ce qui ne se
négocie jamais** : T044 (le contrôle adverse — un cas vert sous sabotage ne prouve rien),
T006–T009 (les fenêtres irréversibles), T018–T019 (le repos intact), et T052 (la ligne de base
à 40).

---

## Notes

- `[P]` = fichiers différents, aucune dépendance ouverte
- Chaque tâche produit un reçu sous `specs/032-etats-bouton/proofs/` — le tableau
  critère → preuve du `quickstart.md` est la table de correspondance
- Les comptes affichés dans ces tâches (253, 14, 42, 28, 40, `N/N`) sont **relevés** au moment de
  l'exécution, jamais recopiés depuis cette prose : la vérité est le disque et la sortie vive
- Commiter après chaque groupe logique ; s'arrêter à n'importe quel checkpoint pour valider une
  histoire seule
