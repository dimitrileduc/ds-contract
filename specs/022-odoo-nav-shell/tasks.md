---
description: "Task list — 022 Barre de navigation Piqueray dans Odoo (le shell)"
---

# Tasks: Barre de navigation Piqueray dans Odoo (le shell)

**Input**: Design documents from `/specs/022-odoo-nav-shell/`
**Prerequisites**: plan.md, spec.md, research.md (D1–D17 — D2/D3/D10/D13/D14 réécrits le
2026-08-20 : **Solid retiré, aucun canal de schéma**), data-model.md, contracts/ (3 documents),
quickstart.md

**Tests** : **non optionnels ici.** Le plan impose des scénarios QA Playwright (SC-001…SC-006)
comme preuves de livraison ; les tâches de scénario ci-dessous sont donc **exigées**. (La claims
rule §II est sans objet cette itération : aucun canal de schéma nouveau, aucune phrase de
capacité — le canal `propsByProp` envisagé a été abandonné avec la variante Solid, research D3.)

**Organisation** : deux temps stricts (plan D1) — d'abord la **remise à niveau gouvernée amont**
(FR-013 : geste canvas de retrait Solid PUIS contrats, bloquante pour tout), puis la **projection
Odoo**, découpée par user story. Trois **spikes mécanisme** (S1/S1b/S2) précèdent toute écriture
QWeb (plan, séquence de portage étape 3).

## Format: `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichiers différents, aucune dépendance sur une tâche incomplète)
- **[Story]** : US1 / US2 / US3 (phases user story uniquement — pas Setup/Foundational/Polish)
- Chaque tâche porte un chemin de fichier exact

## Path Conventions

Monorepo existant (plan, Structure Decision) — phase amont dans `contracts/` + `proofs/canvas/`
(**schéma, émetteurs et `docs/` intouchés**) ; phase cible dans `integrations/odoo/` +
`scripts/odoo/`. Aucun nouveau répertoire de premier niveau. Le QWeb du header est une **zone
manuelle comptée** (marqueurs `ODOO-022-* BEGIN/END` + registre), jamais une sortie générée.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose** : rendre le worktree autosuffisant et lever l'instance de qualification jetable.

- [X] T001 [Worktree gates — F1] Rendre ce worktree autosuffisant (Constitution, Worktree Gates) :
      dans `/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/nav`, lancer
      `npm install` (le runner d'evals symlinke le `node_modules` du checkout — il refuse sans ça),
      puis `npx playwright install chromium` (deux checks pilotent un vrai Chromium). Le sweep
      complet, `npm run eval` compris, tourne DANS ce worktree à chaque checkpoint et à la clôture.
- [X] T002 [P] Lever l'instance de qualification Docker épinglée (`odoo:19.0-20260803`) —
      **défaut 019 hérité, vérifié : `integrations/odoo/qa/.env.example` n'existe pas** (jamais
      commité, alors que le README l'documente). D'abord LE CRÉER (variables `PQR_*` reprenant
      les défauts `${VAR:-…}` de `compose.yaml` : images, ports, DB), puis
      `cp integrations/odoo/qa/.env.example integrations/odoo/qa/.env` et
      `docker compose -f integrations/odoo/qa/compose.yaml --env-file integrations/odoo/qa/.env up -d`
      (quickstart §3). Requise par les spikes et toutes les preuves Odoo.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose** : la **remise à niveau gouvernée amont** (FR-013 : canvas d'abord, puis contrats) +
les **spikes mécanisme**. Rien de la projection Odoo ne peut commencer avant que ces deux pistes
soient closes.

**⚠️ CRITICAL** : les contrats re-épinglés (Piste A) ET les trois reçus de spike (Piste B) sont des
préalables absolus aux trois user stories. Piste A et Piste B sont indépendantes → parallélisables.

### Piste A — remise à niveau gouvernée (ordre imposé : canvas §VIII/§X → snapshot → contrats → build → sweep)

- [X] T003 **Répétition sur CLONE** du geste canvas (delta §0.1) : via le pont figma-console,
      cloner le set header, y supprimer la variante `Fond=Solid`, observer le devenir du set et de
      la propriété `Fond` (set mono-variante ? propriété retirée ? composant détaché ?) et la
      survie d'une instance test, puis supprimer le clone. Mécanisme **À OBSERVER** (aucun retrait
      de variante n'a jamais été exécuté dans ce dépôt). Reçu
      `specs/022-odoo-nav-shell/proofs/canvas/repetition-clone.json`.
- [X] T004 **Capture §X — avant le geste, JAMAIS un pilote partiel** : capturer le set header
      complet ET ses **9 usages** (captures + dump JSON), vérifier chaque capture **non vide et
      correctement dimensionnée** (référence : la bbox du nœud dans le dump JSON du même relevé —
      précédent 016/017), puis `saveVersionHistoryAsync("022 — avant retrait Fond=Solid")`.
      Reçus `specs/022-odoo-nav-shell/proofs/canvas/avant/`.
- [X] T005 **Geste réel** (delta §0.3) : suppression du master `Fond=Solid` (+ résolution de la
      propriété de variante comme répété en T003) ; re-vérifier les 9 instances **par POSITION**
      (intactes, toujours Transparent) ; captures après. Reçu
      `specs/022-odoo-nav-shell/proofs/canvas/geste-solid.json`.
- [X] T006 Refresh **LECTURE SEULE** de `parity/snapshots/figma-components.json` — notre geste a
      changé l'état du fichier ; le refresh précède tout sweep parity (mémoire 017, jamais un
      contournement).
- [X] T007 Appliquer le delta **`ds.header` 1.0.0 → 2.0.0** (les 7 éditions du delta §1, rien
      d'autre — *plus une 8ᵉ, documentaire, ajoutée en revue post-phase le 2026-08-20 :
      `props.items.description`, delta §1 ligne 8*) dans `contracts/header.contract.json` : RETRAIT de la prop `fond` (MAJOR),
      `iconsNav.tokens.color = {color.blanc}`, logo `couleur: "blanc"`, bouton
      `props {variant, iconLeft, iconRight, iconRightGlyph}` + `text: "Contactez-nous"`,
      `repeat.sample[2].href → "/depannage-sav"` (le libellé est déjà porté depuis 016).
      (contracts/header-2.0.0.delta.md §1)
- [X] T008 [P] Adopter **`ds.piqueray-logo` 0.1.0 → 1.0.0** dans
      `contracts/piqueray-logo.contract.json` (retirer `status:"draft"`, bump, réécrire la
      description sur le patron adopté) et cocher la liste de revue en 5 points
      (`contracts/piqueray-logo-adoption.md` §2 : bindings VARIANT, assets SVG, jetons, axe parity,
      composition depuis header 2.0.0 → marque orange + wordmark blanc). API/anatomie **inchangées**
      (les DEUX variantes `default|blanc` restent : composant feuille partagé, le footer le compose).
- [X] T009 `npm run build` (régénère `src/components/Header|PiquerayLogo`, `figma-sync/*.js` —
      *faux pour `figma-sync/*.js`, corrigé 2026-08-20 : c'est `npm run figma:plan`, séparé de
      `build` ; renversement détecté par l'eval `golden-generated-output`, nommé au gap n°1 de
      `proofs/PHASE-AMONT-CLOSURE.md`, destination T032*) puis
      re-pins **par leurs scripts, jamais à la main** : `node scripts/update-golden.mjs` (golden),
      `npm run plugin:check` (`figma-sync/plugin/engine.receipt.json`),
      `npm run catalog` (HORS `npm run build` — piège nommé). **PAS de re-pin
      `examples/polaris`** : aucune édition d'émetteur (mémoire : ce 3e reçu ne dérive que là).
- [X] T010 Sweep constitutionnel complet DANS le worktree :
      `npm run build && npm run parity && npm run eval && npm run plugin:check && npx tsx
      scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit
      && npx tsc -p tsconfig.build.json`. **Critère de sortie de la phase amont** : delta §4
      (vitrine `emit-html` mono-variante = marque orange + wordmark blanc, 4 libellés exacts,
      CTA blanc + flèche, icônes 24px blanches, aucun fond). **Ce critère est un contrôle visuel
      MANUEL, nommé** (constitution V) : le header n'est pas (encore) un sujet `visual-parity` ;
      le premier contrôle instrumenté de l'apparence est SC-001 (T024).
      *(Corrigé 2026-08-20, revue post-phase — la justification d'origine, « le harnais exclut
      les sections, trou 22/34 connu », était fausse en mécanisme : la couverture est une
      énumération (`extract/figma/visual-parity/subjects.ts` — « Adding a subject = adding one
      entry here »), `ds.google-reviews`, une section, y figure, et `comparisonSurface: 'dark'`
      existe pour le blanc-sur-sombre. Instrumenter le header coûterait une entrée subjects +
      re-baseline + un run live (FIGMA_TOKEN + Chromium). Le contrôle manuel reste le choix de la
      phase ; le trou de couverture est par omission, pas par conception.)*

### Piste B — spikes mécanisme Odoo (parallèles à la Piste A ; exigent T002)

- [X] T011 [P] Spike **S1 — zone header** : lire les vues header de l'image épinglée (templates,
      méthode d'activation, ancrage xpath) ; trancher la route de D6 (le menu natif et son dialogue
      fonctionnent à travers notre gabarit). Reçu `specs/022-odoo-nav-shell/proofs/spike-header.json`
      (patron `*-mechanism-spike.json`, DOCUMENTÉ→OBSERVÉ daté).
- [X] T012 [P] Spike **S1b — actif natif** : constater le calcul d'actif d'Odoo 19 (serveur/JS,
      classes émises, cas « parent d'une page enfant active »). Reçu `proofs/spike-actif.json`. **Un
      constat qui contredit la spec fait corriger la spec AVANT le QWeb** (quickstart §4).
- [X] T013 [P] Spike **S2 — semis « une fois »** : prouver l'unicité sur les DEUX chemins (install
      frais ET update d'un site déjà installé), le retrait des entrées par défaut, la survie du menu
      client à l'update suivant. Reçu `proofs/spike-seed.json`.

**Checkpoint** : master Solid retiré (reçus canvas §X complets), contrats re-épinglés
(2.0.0 / 1.2.0 / 1.0.0), toutes portes vertes, 3 spikes OBSERVÉS. La projection Odoo peut commencer.

---

## Phase 3: User Story 1 - Voir la barre Piqueray au design exact (Priority: P1) 🎯 MVP

**Goal** : rendre la barre complète (logo, liens simples, CTA, icônes, état actif, chevron) au design
Piqueray gouverné exact — l'unique variante Transparent — sur fond sombre, sur chaque page atteignable.

**Independent Test** : sur l'instance où la home + 8 sections sont en ligne, charger plusieurs pages
et comparer la barre rendue à la référence validée — logo, liens simples, état actif, chevron sans
écart visible — **indépendamment de toute édition de menu**.

### Implementation for User Story 1

- [ ] T014 [US1] Introduire la catégorie de racine **shell** dans `scripts/odoo/lib/repo-data.ts`
      (`SHELL_CONTRACT_IDS = ['ds.header']`, `closureOf` inchangé) et adapter les portes :
      `scripts/odoo/check-module.ts` (racine posable ⇒ snippet inscrit ; racine **shell ⇒ snippet
      INTERDIT**, FR-001), `build-assets.ts` (émet la CSS des fermetures posables ∪ shell — dédup
      existante absorbe `ds.button`), `check-authoring.ts` + `build-derivation-report.ts` couvrent
      l'union (y compris la ligne « racine hors des sections posables » et le calcul de `prefix`).
      **Dans le même fichier `scripts/odoo/check-authoring.ts` : étendre ADDITIVEMENT
      `MECANISMES_PAR_TYPE` avec `native-menu` sur `arrayOf` (items) ET sur `text`
      (nav-item libelle/href)** — vérifié : l'enum actuel ne le porte pas, `computed-display`
      existe déjà. (research D12/D13 ; data-model §1.6/§1.7)
- [ ] T015 [US1] Repin explicite de `integrations/odoo/config/inputs.lock.json` :
      `header@2.0.0`, `nav-item@1.2.0`, `piqueray-logo@1.0.0` (chemin + version + **SHA-256**, les
      deux requis — 3 entrées NEUVES, vérifié : aucune des trois n'est au lock aujourd'hui) ;
      `npm run odoo:inputs:check` (rouge attendu avant repin, vert après). (D12)
- [ ] T016 [US1] `npm run odoo:assets` — émet les blocs `header/nav-item/piqueray-logo` dans
      `integrations/odoo/addons/piqueray_ds/static/src/css/generated/components.pqr.css` (button déjà
      présent) — puis `npm run odoo:assets -- --check` (tribunal byte-identique ; jamais à la main).
- [ ] T017 [US1] Créer `integrations/odoo/config/header.authoring.json` exhaustif (schéma 019 : un
      verdict par prop/part, occurrences imbriquées comprises) avec le **mécanisme additif
      `native-menu`** (porté par T014) ; `items`→`controlled`/`native-menu` (la prop `fond`
      n'existe plus — aucun verdict à porter), nav-item `libelle`/`href`→`controlled`/`native-menu`,
      `chevron`/`actif`→`controlled`/`computed-display`, logo/CTA→`fixed-by-composition`/
      `not-editable`, icônes→`fixed-by-composition` (inertes, limite nommée), `rootActions` shell
      `forbidden` (options natives de header NON restreintes — déviation nommée).
      `npm run odoo:authoring:check`. (research D13 ; data-model §1.7)
- [ ] T018 [US1] Écrire le gabarit QWeb `integrations/odoo/addons/piqueray_ds/views/header.xml`
      (bloc `ODOO-022-HEADER-QWEB`) : branchement zone header système (route S1, **jamais**
      `website.snippets`), classes de la CSS générée + `data-pqr-part` (unique variante — aucun
      conditionnement), logo `ds.piqueray-logo` variante `blanc` (lien accueil + nom accessible),
      CTA `t-call` du `pqr_button` (`link_href="/contactez-nous"`, variante `blanc`, `iconRight
      arrow-right`, libellé « Contactez-nous »), 3 icônes search/user/cart 24px
      `aria-hidden="true"` **inertes**, `t-foreach` sur `website.menu` (libellé `menu.name`, cible
      URL/page, `new_window` respecté, **chevron ssi enfants**, sous-menu au balisage déroulant
      Odoo/Bootstrap PAR DÉFAUT), cas **menu vide** rendu sans casse. Interdits : libellé/cible/
      ordre en dur (FR-004). (contracts/odoo-projection.md §2 ; research D6/D7/D10)
- [ ] T019 [US1] Mapper l'**état actif** (bloc `ODOO-022-HEADER-ACTIF` dans `views/header.xml`, ou
      un JS de bundle frontend si S1b l'exige) : l'actif calculé par Odoo (page courante OU **parent
      d'une page courante**) pose la classe `actif` attendue par la CSS de `ds.nav-item` +
      `aria-current="page"` ; l'entrée de sous-menu active reste au style Odoo par défaut.
      (research D9 ; FR-007/SC-005)
- [ ] T020 [P] [US1] Fond sombre (bloc `ODOO-022-FOND-SOMBRE`) dans
      `integrations/odoo/addons/piqueray_ds/static/src/css/odoo-bridge.css` :
      `background-color: var(--pqr-color-noir-bleute)` sur le conteneur header — **Odoo seulement**
      (ni contrat ni Figma), **variable générée jamais littéral**. (research D11 ; FR-015)
- [ ] T021 [P] [US1] Semis du menu (bloc `ODOO-022-MENU-SEED`) dans
      `integrations/odoo/addons/piqueray_ds/data/…` (+ `migrations/…` si S2 l'exige) : données
      `noupdate="1"` créant l'arborescence D8 (placement « Motorisation » porté en commentaire
      `confidence: "inferred"`), retrait des entrées par défaut « Home »/« Contact us »,
      rattachement au bon `website_id`. **Une fois, jamais re-joué** (FR-016). (data-model §2.2)
- [ ] T022 [US1] Enregistrer les 4 adaptations `ODOO-022-*` dans
      `integrations/odoo/config/adaptation-registry.json` (chacune `reasonCode` + `mechanism` ;
      bloc sans entrée ⇒ `odoo:derivation:check` rouge) ; bumper le manifeste
      `integrations/odoo/addons/piqueray_ds/__manifest__.py` à `19.0.1.5.0` (vérifié : courant
      `19.0.1.4.0`) + liste `data` (vues + semis). Portes : `npm run odoo:module:check && npm run
      odoo:derivation:check && npm run odoo:typecheck`. (contracts/odoo-projection.md §5)
- [ ] T023 [US1] Créer le sujet visuel `integrations/odoo/qa/visual/subjects/header.mts` (schéma
      `Subject` 019 : `contractId: ds.header`, `showcaseLabel` = l'unique combo, `odooPath` page
      de mesure publique, **clip épinglé** imprimé par `render-html.mts --measure`). (research D14.1)
- [ ] T024 [US1] **Preuve SC-001** : `integrations/odoo/qa/scenarios/header-visual.mts` — capturer la
      barre (Transparent sur fond `--pqr-color-noir-bleute`), comparer via `extract/image-parity`
      inchangé, verdict **sous la tolérance** du harnais (`compare.mts`) ; reçu sous `proofs/`. Lancer
      aussi `npx tsx integrations/odoo/qa/visual/selftest.mts --strict`. (SC-001 ; FR-002/003)
- [ ] T025 [US1] **Preuve SC-004/SC-005** : `integrations/odoo/qa/scenarios/header-nav.spec.mts` —
      ouverture + navigation de chaque déroulant (lien à
      enfants, style Odoo par défaut accepté) ; soulignement exact sur chaque page atteignable du
      menu semé, **cas « parent d'enfant actif » inclus**. La QA crée les pages cibles minimales
      (fixtures, jamais embarquées dans l'addon). Reçu sous `proofs/`. (SC-004/SC-005 ; FR-008/009)

**Checkpoint** : la barre au design exact est en ligne, vérifiée sans écart (SC-001), déroulants et
actif prouvés (SC-004/005). **MVP livrable et démontrable.**

---

## Phase 4: User Story 2 - Gérer mes liens de menu sans toucher au design (Priority: P1)

**Goal** : le rédacteur ajoute/renomme/réordonne/imbrique des liens et pointe vers page interne ou
URL externe via l'édition standard d'Odoo, le design de la barre restant intact.

**Independent Test** : depuis le menu semé, dans l'éditeur Odoo — ajouter, renommer, réordonner,
imbriquer, pointer page puis URL externe ; enregistrer, rouvrir (éditeur + page publique) et vérifier
que le contenu est conservé et que le design des liens simples est intact.

**Dépendance douce** : réutilise le gabarit + le menu semé livrés en US1 (T018, T021). Reste
indépendamment testable (le design ne peut pas casser par édition — tout re-rend par NOTRE gabarit,
research D7).

### Implementation for User Story 2

- [ ] T026 [US2] **Preuve SC-002/SC-003** : `integrations/odoo/qa/scenarios/header-menu.spec.mts` —
      depuis le menu semé : ajouter, renommer, réordonner, imbriquer un lien, en pointer un vers une
      **page interne** puis un autre vers une **URL externe** (`new_window` respecté) → enregistrer →
      rouvrir **éditeur ET public**. Assertions : contenu **100 % conservé** (SC-003, FR-006), balisage
      et classes des **liens simples intacts** (SC-002, FR-011), **chevron apparu** sur le nouveau
      parent (FR-008), profondeur ≥ 3 sans casse (edge case), **menu vidé → la barre (logo, CTA,
      icônes) se rend sans zone cassée, puis restauration par édition standard** (edge case « menu
      vide », spec). Reçu sous `proofs/`. `scenarioId` distinct des rouges pré-existants
      (quickstart §7). (research D14.2)

**Checkpoint** : US1 ET US2 fonctionnent indépendamment — la barre est belle ET le menu est éditable.

---

## Phase 5: User Story 3 - Garder l'apparence de la nav gouvernée par le contrat (Priority: P2)

**Goal** : l'apparence de la nav évolue par le contrat (jamais figée en dur) et se régénère par
projection sans réédition manuelle ni altération du menu client.

**Independent Test** : introduire une évolution d'apparence gouvernée (la remise à niveau FR-013
réelle), régénérer la projection Odoo, vérifier que la barre en ligne reflète la nouvelle apparence
sans réédition manuelle et sans toucher au contenu du menu.

**Dépendance** : exige US1 (projection en ligne) et US2 (le menu client édité, dont on prouve
l'invariance). Le bump réel 2.0.0 (phase amont) EST l'évolution — aucun changement jetable.

### Implementation for User Story 3

- [ ] T027 [US3] **Preuve SC-006** : `integrations/odoo/qa/scenarios/header-regen.spec.mts` +
      `proofs/sc-006-regeneration.json` — capture avant, puis régénération complète
      `contrat → npm run build → npm run odoo:assets → update module` **SANS toucher au menu** ;
      assertions : l'apparence en ligne provient du contrat re-épinglé 2.0.0 (régénérable, **non
      figée à la main** — FR-010) ET `website.menu` (modifié par le scénario US2) est
      **byte-identique** avant/après (FR-016). (research D14.4)
- [ ] T028 [US3] Vérifier que les **8 sections de contenu** déjà en ligne restent **intactes** après
      livraison du shell (FR-012 ; scénario d'acceptation 3 d'US3) — contrôle DOM/visuel ; reçu
      sous `proofs/`.

**Checkpoint** : les trois user stories sont indépendamment fonctionnelles ; la gouvernance est prouvée.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose** : portes finales, clôture honnête et cohérence de journal.

- [ ] T029 Sweep FINAL vert DANS le worktree — constitutionnel (T010) **+** suite Odoo :
      `npm run odoo:inputs:check && npm run odoo:authoring:check && npm run odoo:assets -- --check &&
      npm run odoo:module:check && npm run odoo:derivation:check && npm run odoo:typecheck && npm run
      odoo:visual:selftest -- --strict`.
- [ ] T030 [P] Dérouler `specs/022-odoo-nav-shell/quickstart.md` de bout en bout comme validation
      finale (garde-fous permanents §8 compris : un seul geste canvas §X déjà consommé, generated
      jamais à la main, menu jamais réécrit, jetons jamais littéraux).
- [ ] T031 [P] Filer l'entrée datée 022 dans `MILESTONES.md` (le compte d'eval imprimé par
      `npm run eval` fait foi ; noter le trou de journal spécifié en mémoire projet, non silencieux).
- [ ] T032 Rédiger le **rapport de clôture** `specs/022-odoo-nav-shell/proofs/RAPPORT-CLOTURE.md`
      nommant toutes les limites (constitution V) : icônes inertes, sous-menu au style Odoo par
      défaut, hover/mobile/overlay-hero différés, menu très long au comportement Odoo par défaut
      (débordement desktop — distinct du mobile), sémantique React `<div>` racine différée,
      options natives de header non restreintes (déviation acceptée), placement « Motorisation »
      `inferred`, **retrait Solid : geste canvas §X + version nommée, reçus cités**, rouges
      pré-existants (`odoo:qualification`, `editability-boundary` 43/44) **cités sans
      re-diagnostic**. (data-model §3 ; contracts/odoo-projection.md §6)
- [ ] T033 **(conditionnel, nommé — pas silencieux)** Si la qualification finale de 022 exige un
      manifeste vert : remettre en cohérence le reçu 019 `odoo:qualification` (préalable nommé,
      research D16) — sinon laisser tel quel (politique : ne pas aggraver les rouges pré-existants).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** : aucune dépendance — démarre tout de suite (T001 avant tout ; T002 [P]).
- **Foundational (Phase 2)** : dépend du Setup. **Bloque les trois user stories.** Piste A (T003–T010)
  et Piste B (T011–T013, exigent T002) sont indépendantes et tournent en parallèle.
- **US1 (Phase 3)** : dépend de Foundational **entier** (contrats re-épinglés + 3 spikes OBSERVÉS).
- **US2 (Phase 4)** : dépend de Foundational ; réutilise T018 + T021 d'US1 (dépendance douce nommée).
- **US3 (Phase 5)** : dépend d'US1 (projection en ligne) et d'US2 (menu client édité, invariance prouvée).
- **Polish (Phase 6)** : dépend de toutes les user stories désirées.

### Ordre strict interne à la Piste A (§VIII : la source d'abord ; §X : capture avant geste)

T003 (répétition clone) → T004 (capture §X + version) → T005 (geste réel) → T006 (refresh snapshot)
→ T007/T008 (contrats [P]) → T009 (build+re-pins) → T010 (sweep + critère de sortie).

### Ordre interne à US1

T014 (catégorie shell + native-menu) → T015 (lock) → T016 (assets) → T017 (authoring) → T018 (QWeb) →
T019 (actif, même fichier que T018 — séquentiel) ; T020 (fond) et T021 (semis) [P] dès T014 ;
T022 (registre+manifeste) après T018–T021 ; T023 (sujet) → T024 (SC-001) ; T025 (SC-004/005) après T018–T021.

### Parallel Opportunities

- **T002** [P] avec T001 une fois le repo présent.
- **Piste A ∥ Piste B** : T003–T010 et T011–T013 en parallèle (deux pistes disjointes — le geste
  canvas touche Figma, les spikes touchent l'instance Docker).
- **T007 ∥ T008** (deux contrats).
- **T011 ∥ T012 ∥ T013** (trois spikes, reçus distincts).
- **T020 ∥ T021** dans US1 (odoo-bridge.css ∥ data/ du semis).
- **T030 ∥ T031** dans Polish.

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Piste A — les deux contrats, après le geste canvas (T003–T005) et le refresh (T006) :
Task: "T007 Delta ds.header 2.0.0 dans contracts/header.contract.json"
Task: "T008 Adoption ds.piqueray-logo 1.0.0 dans contracts/piqueray-logo.contract.json"

# Piste B — les trois spikes mécanisme, en parallèle de toute la Piste A :
Task: "T011 Spike S1 zone header → proofs/spike-header.json"
Task: "T012 Spike S1b actif natif → proofs/spike-actif.json"
Task: "T013 Spike S2 semis une fois → proofs/spike-seed.json"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 : Setup (worktree F1 + instance Docker, `.env.example` créé).
2. Phase 2 : Foundational — geste canvas (répétition → capture §X → retrait Solid → snapshot),
   contrats 2.0.0/1.0.0 re-épinglés, portes vertes **et** les 3 spikes OBSERVÉS.
   **CRITIQUE — bloque tout.**
3. Phase 3 : US1 — projection du shell, barre au design exact en ligne.
4. **STOP & VALIDATE** : SC-001 sous tolérance, déroulants/actif prouvés.
5. Démo possible : le shell complète la home.

### Incremental Delivery

1. Setup + Foundational → fondation prête (source nettoyée, contrats vrais).
2. US1 → barre exacte en ligne → **MVP**.
3. US2 → menu éditable prouvé → design intact sous édition (menu vide compris).
4. US3 → gouvernance prouvée (SC-006) + sections intactes.
5. Polish → sweeps finaux + clôture + limites nommées.

---

## Notes

- Tests **exigés** ici (preuves QA du plan) : T024/T025/T026/T027/T028 (scénarios).
- `[P]` = fichiers différents, aucune dépendance incomplète ; `[Story]` = traçabilité user story.
- Re-pins **toujours par script** (golden, engine.receipt, catalog) — jamais à la main (§IV) ;
  **pas de polaris** (aucune édition d'émetteur).
- Figma : **un seul geste d'écriture** (T003–T005, §X actif) ; lecture pour tout le reste ;
  `static/src/css/generated/**` jamais à la main.
- Le menu après semis appartient au client : **aucun** chemin de code ne le réécrit (FR-016).
- Commit après chaque tâche ou groupe logique ; s'arrêter à chaque checkpoint pour valider la story.
