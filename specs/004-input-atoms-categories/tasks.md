---
description: "Task list — 004-input-atoms-categories"
---

# Tasks: Atomes de saisie gouvernés par contrat + notion de catégorie (et 3 icônes sociales)

**Input**: Design documents from `/specs/004-input-atoms-categories/`
**Prerequisites**: plan.md, spec.md, research.md (D1–D12), data-model.md, contracts/ (4 interfaces), quickstart.md

**Tests** : ce dépôt prouve par **évals** (règle des claims : fixture → eval → claim, Constitution II).
Les tâches d'éval ci-dessous ne sont donc PAS optionnelles — elles sont le mécanisme de preuve
et précèdent toute phrase de doc. Elles portent le nom de la famille (`C2`, `C6`, `C3`…).

**Organisation** : par user story, pour une implémentation et un test indépendants. La chaîne
d'extraction, les décisions (D1–D12) et les FR/SC sont cités pour la traçabilité.

## Format : `[ID] [P?] [Story?] Description avec chemin`

- **[P]** : parallélisable (fichiers différents, aucune dépendance sur une tâche non terminée).
- **[Story]** : `[US1]`…`[US4]` — présent uniquement dans les phases de user story.
- **Jointure par CLÉ, jamais par nom** (« Bouton » ≠ « Button », leçon 002). fileKey Piqueray :
  `d9FYAUcqdcNtsuaMgLefvJ`. nodeIds relus au dump (le fichier est VIVANT — D12).

---

## Phase 1 : Setup (infrastructure partagée)

**But** : rendre le worktree exécutable et amorcer les preuves d'itération. Aucune lecture Figma ici.

- [X] T001 [P] `npm install` **dans ce worktree** (`/Users/dlstudio/.superset/worktrees/ds-contracts-poc/004`) — sinon `npm run eval` refuse (symlink `ROOT/node_modules`, D11) ; confirmer `FIGMA_TOKEN` (lecture seule suffit) présent dans l'environnement.
- [X] T002 [P] `npx playwright install chromium` — requis par les 2 checks visuels (instrument existant, D9).
- [X] T003 [P] Créer l'arborescence de preuves : `specs/004-input-atoms-categories/proofs/read-only/` (dossier) + squelette `specs/004-input-atoms-categories/proofs/audits-003.md` (à remplir en T008).
- [X] T004 Relever l'état « avant » VERT et le compte d'évals de départ : `npm run build` puis `npm run eval` **sur le checkout principal** (`~/.superset/projects/ds-contracts-poc`, sur `main` = l'état « avant » exact, `node_modules` déjà en place) ; noter le `N/N` vivant affiché (sert au re-sync des compteurs, T042). Aucune modification — mesure seulement.

---

## Phase 2 : Foundational (prérequis bloquants)

**But** : capacités partagées que les user stories consomment. **Bloque US1 (contrats catégorisés)
et US3 (surfaces).** Aucune lecture Figma (pur code + fichiers 003 lus via git). ⚠️ À terminer
avant toute phase de user story.

- [X] T005 Schéma : ajouter `category: z.enum(['atom','molecule','section']).optional()` (voisin de `status`) + export `CATEGORY_LABELS = { atom:'Atoms', molecule:'Molecules', section:'Sections' }` dans `packages/schema/src/contract-schema.ts` — **additif-optionnel, zéro repurposing** (Constitution VI, D3) ; bumper `docs/02-contract-spec.md` avec le champ.
- [X] T006 Éval **C2** (refus par nom) : `category: "atome"` (ou toute valeur hors enum) → erreur Zod nommée au build, dans `evals/run.ts` (+ fixture). Fixture → eval → claim, AVANT toute mention doc de la catégorie.
- [X] T007 Éval **tolérance** (FR-013) : un contrat SANS `category` build OK et retombe sur le groupe `Components/` — cas ajouté à `evals/run.ts` (+ fixture). (Séquentiel après T006 : même fichier d'évals.)
- [X] T008 Remplir `specs/004-input-atoms-categories/proofs/audits-003.md` : pointeurs (branche `003-…` + chemins, JAMAIS recopiés) vers `specs/003-…/audits/atomes-formulaire.md` (003-T031) + validations owner 003-T032–T035 (Input `2053:1245`, Textarea `2053:1247`, Select `2053:1249`, Checkbox `2053:1256`) et `atomes-icones.md` (003-T036) + 003-T037–T038 (Facebook `2053:1259`, Instagram `2053:1261`, Étoile `2053:1263`). **Un atome sans pointeur d'audit validé n'est pas contractualisé** (FR-005/006).

**Checkpoint** : schéma porte `category` (refus + tolérance éval-couverts), audits 003 confirmés → US1/US3 débloqués.

---

## Phase 3 : US2 (P1) — Garde-fou lecture seule ARMÉ (coexistence 003)

**Goal** : armer la preuve « rien n'a bougé de notre fait » AVANT toute lecture Figma. (La preuve se
**referme** en Phase 7 — nature bracketante d'un garde-fou : armé tôt, vérifié à la clôture.)

**Independent Test** : l'historique de versions est relevé au début (ici) et à la fin (T045) ; aucune
entrée n'est imputable à 004 (T046). Ordonné en premier parmi les stories car l'armement précède
toute extraction.

- [ ] T009 [US2] **Première opération Figma de l'itération** : `GET /v1/files/d9FYAUcqdcNtsuaMgLefvJ/versions` (REST direct authentifié, précédent 002 P5) → `specs/004-input-atoms-categories/proofs/read-only/versions.before.json`. Acter les **interdits stricts** (D10, read-only-proof.interface §Interdits) : aucun outil MCP mutant (`figma_execute` mutant, `set_*`, `create_*`, `delete_*`), aucune édition master/page/variable/rangement, aucun « petit fix » d'un défaut découvert — un défaut se signale et se coordonne avec 003 (FR-002), point.

**Checkpoint** : baseline `/versions` capturée ; discipline lecture seule active pour tout le reste.

---

## Phase 4 : US1 (P1) — Les 4 atomes de saisie gouvernés par contrat 🎯 MVP

**Goal** : Input, Textarea, Select, Checkbox deviennent des composants gouvernés par contrat via la
chaîne prouvée en 002 (D1), générant leur code, au même niveau de preuve que le Button.

**Independent Test** : importer les 4 atomes de la bibliothèque générée et les rendre ; toutes les
vérifications passent comme sur le Button (déterminisme byte-identique ×2, parité trois voies à zéro
écart, contrôle visuel dans la tolérance existante, suite d'évals au complet). Clôture **à 4/4
uniquement** — pas de clôture partielle (FR-002).

**Chaîne imposée par atome** (input-atoms.interface.md) : dump REST (lecture seule) → propose (fonction
pure, notes/unbound nommés) → **review humaine → adoption** (autorat assisté, jamais génération, D1) →
build → parité → subject visuel. Jointure par `anchors.figma.componentSetKey` (D2).

### Input — spike de-risquant (valide la chaîne + le support mono-COMPONENT, D9)

- [ ] T010 [US1] Dump Input : `npm run extract:figma:rest -- "<url node 2053:1245 sur DS · Atomes>" --target "<nom master relu>"` → `extract/out/figma/rest-dump.json` (v1, `_provenance` + `dumpedAt`, lecture seule). **Re-mesurer** clé/nodeId/propriétés au dump (fichier vivant, D12).
- [ ] T011 [US1] Proposer : `npm run extract:figma -- extract/out/figma/rest-dump.json` → `input.contract.proposed.json` ; relever les notes/unbound **nommés** (dégradations au rapport, Constitution V).
- [ ] T012 [US1] Review → adopter `contracts/input.contract.json` **v1.0.0** : `id: ds.input`, `name: Input`, `category: "atom"`, `semantics.element: input`, prop `value` ← TEXT « Valeur », boîte HORIZONTAL (bindings tokens **relus au dump** : blanc/bleu-gris/texte — l'extraction fait foi, écarts nommés, D8). **Spike part native non-dessinée** (D7/D8, risque #4) : si la validation actuelle refuse un `element:'input'` « Canvas: not drawn », repli sémantique **nommé** — jamais un contournement silencieux.
- [ ] T013 [US1] `npm run build` (refus par nom si contrat invalide/irrésolvable) puis `npm run parity` → zéro finding actif pour Input.
- [ ] T014 [US1] Ajouter le subject visuel Input à `extract/figma/visual-parity/subjects.ts` (kind `contract`, fileKey Piqueray, setNodeId = ancre du contrat) ; **spike mono-COMPONENT** (D9, risque #3) : Input est un COMPONENT simple (pas un SET) — si l'énumération de variantes suppose un SET, ajouter la capacité « subject mono-COMPONENT » à l'instrument commun (+ éval), jamais un script à côté ; seeder la baseline du subject (`--write-baseline`) et vérifier dans la tolérance existante (triage 3 %, seuils INCHANGÉS).

### Textarea & Select — même chaîne prouvée (authoring parallélisable)

- [ ] T015 [P] [US1] Textarea : dump (node `2053:1247`) → propose → review → adopter `contracts/textarea.contract.json` **v1.0.0** (`ds.textarea`, `semantics.element: textarea`, prop `value` ← TEXT¹, hauteur portée par le container). ¹ nom réel de la propriété relu au dump.
- [ ] T016 [P] [US1] Select : dump (node `2053:1249`) → propose → review → adopter `contracts/select.contract.json` **v1.0.0** (`ds.select`, `semantics.element: select`, prop `value` ← TEXT¹, `justify: space-between`, **icon part FIXE `chevron-down` size 24** — asset déjà gouverné, registre 13, D8). Si propose stubbe l'instance imbriquée (FIXE ≠ INSTANCE_SWAP du lowering D5), la convertir en icon part à la review — **décision de review nommée**.
- [ ] T017 [US1] `npm run build` + `npm run parity` (zéro actif) pour Textarea & Select ; ajouter leurs 2 subjects à `extract/figma/visual-parity/subjects.ts` (même fichier → sérialisé) et vérifier le contrôle visuel.

### Checkbox — spike coche (l'arbre D7 tranché par le dump)

- [ ] T018 [US1] Dump Checkbox (COMPONENT_SET `2053:1256`) + **spike coche** (D7, risque #2, front-loadé) : le dump révèle-t-il la coche en VECTOR (→ asset) ou en nœud TEXT (« ✓ » → part texte statique, zéro asset) ? `propose-figma` ne lit pas les VECTOR bruts (dégradation nommée au propose).
- [ ] T019 [US1] Review → adopter `contracts/checkbox.contract.json` **v1.0.0** : `checked` enum `['non','oui']` ← VARIANT « Coché » (values `{non:'Non', oui:'Oui'}`, clés translittérées — précédent Button) ; coche en **icon part + `visibleWhen: {prop:'checked', equals:'oui'}`**. **Volé/rejeté à l'archive `demo-51/checkbox.contract.json`, motifs nommés** (D7) : rejeté label/description (Field les possède), axe `size`, `indeterminate`, event `toggle`. Si coche VECTOR → `assets/icons/check.svg` acquis du **nœud réel** (export SVG REST, lecture seule), **hors registre** (registre reste à 16, SC-003).
- [ ] T020 [US1] `npm run build` + `npm run parity` pour Checkbox ; subject visuel Checkbox (SET) + baseline seedée.
- [ ] T021 [US1] **(Conditionnel — seulement si `check.svg` a été minté en T019)** Enseigner à l'axe icônes de parity la classe « **glyphe interne consommé par un contrat** » dans `parity/diff.ts` : un asset hors-registre référencé par un `icon.asset` FIXE d'un contrat du catalog n'est pas orphelin (pas de finding) ; un asset ni registre ni consommé reste un finding (`diff.ts:808-819`). **Fixture → éval C3 → claim** (`evals/run.ts`). Repli si l'owner préfère zéro changement d'outillage : finding `icons|ahead|assets/icons/check.svg` **acquitté** dans `parity/baseline.json` (décision enregistrée).
- [ ] T022 [US1] Re-pin golden revu : `npm run golden:update` après les 4 contrats adoptés (`evals/golden.json`) — re-pin explicite, jamais automatique (Constitution I, D11).
- [ ] T023 [US1] Réactivations de quarantaine **nommées** (règle hybride, retrait/ajout cité par id au commit) : L349 (« a second Piqueray component + a clean parity baseline ») et L1084 (« one to update, one to create ») — satisfaits par un 2e composant Piqueray ; L509/523/538 (« captured through the REST path ») — satisfaisables en committant un dump d'atome comme fixture sous `extract/figma/rest/fixtures/` **+ adaptation nommée de leurs assertions** (câblées Badge/Card et dégradation Enterprise-403 — pas un simple dé-commentage). Chaque candidat relu (assertions vs réalité Piqueray) dans `evals/legacy-cases.ts` avant réactivation. **Reste quarantainé, nommé** : L711 (checkbox AND switch — pas de Switch).
- [ ] T024 [US1] **Checkpoint US1** (SC-001) : `npm run build` + `npm run parity` (zéro actif) + `npm run eval` (compte vivant, checkout principal) + `npx tsx scripts/deterministic-roundtrip.mjs` + contrôle visuel (tolérance existante) VERTS sur les 4 atomes. Import `{ Input, Textarea, Select, Checkbox }` : même niveau de preuve que Button, aucun composant écrit/corrigé à la main.

---

## Phase 5 : US3 (P2) — Catégorie sur chaque composant + surfaces groupées

**Goal** : les surfaces générées (Storybook, Contract Hub, catalog) groupent par catégorie — miroir
STRUCTUREL des pages DS Figma (Atomes/Molécules/Sections), libellés anglais via l'unique
`CATEGORY_LABELS`.

**Independent Test** : ouvrir Storybook + Contract Hub → composants groupés sous « Atoms », aucun
groupe résiduel incohérent, aucun orphelin sous un groupe « à plat » par défaut. **Testable sur le
Button seul** (le mécanisme se démontre même sans les atomes).

- [X] T025 [US3] `core/emit-react.ts` (generateStories) : `title: '${CATEGORY_LABELS[category] ?? 'Components'}/${name}'` — fallback tolérant `Components/` conservé (D3, category.interface §2). Fonction pure string-out (Constitution VII).
- [X] T026 [US3] `scripts/generate-catalog.ts` : ajouter `category` (présent seulement si porté) au monolithe + shards + `index.json` ; `npm run verify:catalog` reste vert.
- [X] T027 [US3] Contract Hub : `dashboard/src/data.ts` (`RawContract.category?`) + `dashboard/src/views/ComponentsList.tsx` — sections ordonnées `Atoms → Molecules → Sections` (libellés via `CATEGORY_LABELS`) ; les sans-catégorie sous un **groupe résiduel rendu seulement s'il est non vide** (un composant sans catégorie n'est jamais caché ; un groupe vide ne se rend pas — SC-002 net) — absent cette itération (usage exhaustif).
- [X] T028 [US3] `contracts/button.contract.json` : `+ category: "atom"` (FR-015), **sans aucune modification du master Figma** → bump **v1.4.0 → v1.5.0** (minor). Note : v1.5.0 **accrète** l'élargissement d'enum de US4 (T034) sous la même release non publiée (D4, un seul bump pour les deux ajouts additifs).
- [X] T029 [US3] Éval **C6** (fixture → eval → claim) : un contrat `category: 'atom'` produit `title: 'Atoms/<Name>'` + `category` au catalog (`evals/run.ts`).
- [X] T030 [US3] Re-pin golden revu : `npm run golden:update` (titres de stories regroupés + `category` au catalog) — `evals/golden.json`.
- [ ] T031 [US3] **Checkpoint US3** (SC-002/005) : `npm run storybook` → 5 composants sous **Atoms**, zéro groupe à plat résiduel ; `npm run dashboard` → groupé par catégorie ; Button porte `atom` sans édition de master ; aucun composant existant sans catégorie.

---

## Phase 6 : US4 (P3) — Les 3 icônes sociales dans le jeu gouverné (13 → 16)

**Goal** : Facebook, Instagram, Étoile entrent au registre gouverné, vérifiées registre ↔ code ↔ Figma
comme les 13, sans nouvel instrument ni écriture Figma.

**Independent Test** : le registre passe de 13 à 16 ; l'axe icônes existant valide les 3 nouvelles sur
les trois surfaces ; `npm run parity` propre sur l'axe icônes.

- [ ] T032 [US4] Exporter les SVG **du fichier réel uniquement** (FR-018) : `npm run extract:figma:rest:svg <fileKey> <manifest 3 entrées> assets/icons` → `assets/icons/{facebook,instagram,star}.svg`. Facebook/Instagram : fills `color/noir-bleute` → bake `#26282c → currentColor` standard. **Étoile : couleur fixe `color/orange`** — le bake ne matche pas → orange littéral CONSERVÉ, voulu et truthful (D6). Jamais de tracé repris de l'ancien jeu démo.
- [ ] T033 [US4] `contracts/icons.registry.json` **v1.0.0 → v1.1.0** (+3 entrées ; clés/nodeIds/`componentName` **verbatim relus au dump** : Facebook `2053:1259`, Instagram `2053:1261`, Étoile `2053:1263` — `name` canonique `^[a-z][a-z0-9-]*$` donc `star`, « Étoile » vit dans `componentName`) ; la `description` de `star` **nomme la couleur fixe** (« does NOT recolor via currentColor ») ; `source.dumpedAt` mis à jour.
- [ ] T034 [US4] `contracts/button.contract.json` (reste **v1.5.0**) : élargir `iconLeftGlyph`/`iconRightGlyph` **13 → 16** + compléter `bindings.figma.values` (`facebook`, `instagram`, `star → « Étoile »` verbatim). **Forcé, pas un choix** : le gate build « ni plus ni moins » (`scripts/generate-components.ts:115-133`) refuse par nom tout enum INSTANCE_SWAP chevauchant le registre sans lui être exactement égal (D4).
- [ ] T035 [US4] Rafraîchir les snapshots parity en **LECTURE** (script d'inventaire `parity/extract-figma.plugin.js` via pont desktop `figma_execute` **lecture** ou run plugin owner — n'édite pas, D10) pour inventorier les 3 nouveaux masters ; vérifier l'axe icônes 3 voies pour les 16 (par CLÉ). Toute divergence = finding nommé, jamais silencieuse.
- [ ] T036 [US4] **Risque D5 vérifié tôt** : le master « Bouton » garde `preferredValues` à 13 (l'étendre = édition master, interdit FR-001). Si l'axe composant figma⟷contract remonte la divergence menu-13 vs enum-16 → **acquitter** les findings dans `parity/baseline.json` (accord owner explicite, précédent mail/external-link 002) + **léguer nommément** la mise à jour du menu (13→16) à la prochaine itération autorisée à écrire (gates 003). Garde-fou : `baseline-parity-clean` (zéro finding ACTIF) + `baseline-acknowledges-without-failing` restent VERTS.
- [ ] T037 [US4] Re-pin golden revu : `npm run golden:update` (Button v1.5.0, ICONS map 16) — `evals/golden.json`.
- [ ] T038 [US4] **Checkpoint US4** (SC-003/008) : `contracts/icons.registry.json` = 16 entrées, chacune vérifiée sur les 3 surfaces ; `npm run parity` propre sur l'axe icônes ; compteurs 13→16 synchronisés au compte vivant.

---

## Phase 7 : Polish & Clôture (gates, honnêteté) + US2 fermeture du bracket

**But** : sceller toutes les preuves. La fermeture lecture seule (T045/T046) est la **toute dernière**
action — après le dernier read Figma (le re-pin visuel T040).

- [ ] T039 Balayage complet des 8 gates **dans ce worktree** (exécutable depuis T001 `npm install` + T002 Chromium ; `visual-parity/baseline.json` est versionné — D11 option 1 ; le checkout principal est sur `main` SANS les changements 004, git refusant d'y checkouter la branche tant que ce worktree la détient — repli nommé si un check refusait ici : `git -C ~/.superset/projects/ds-contracts-poc checkout --detach <commit 004>` puis sweep là-bas) : `npm run build && npm run parity && npm run eval && npm run plugin:check && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && npx tsc -p tsconfig.build.json`. Parité = **zéro finding actif** (acquittements = décisions owner enregistrées).
- [ ] T040 Contrôle visuel : `npm run extract:figma:visual -- --write-baseline` (re-pin explicite REVU, 4 subjects ajoutés) — **dernière lecture Figma de l'itération**. Cache par version de fichier → `--refresh` si des rendus semblent périmés (003 travaille en parallèle).
- [ ] T041 Revue finale du golden : `npm run golden:update` (no-op si stable) — pin explicite après toutes les régénérations (4 contrats + Button v1.5 + titres stories + catalog category).
- [ ] T042 Synchroniser les compteurs cités (**16** icônes, **N** évals au compte vivant, **5** composants) dans `README.md`, `docs/`, `CLAUDE.md` — **APRÈS** que les évals les adossent (règle des claims, Constitution II) ; le compte vivant de `npm run eval` fait foi (FR-021).
- [ ] T043 Registre de quarantaine : nommer les cas retirés/ajoutés (par id) dans le corps du commit / `evals/REMOVED-CASES.md` et re-synchroniser les comptes cités (FR-022).
- [ ] T044 Journal daté : entrée `MILESTONES.md` (+ `CHANGELOG.md` si release) — **seulement après** gates verts (jamais de claim avant preuve).
- [ ] T045 [US2] Re-relever `GET /v1/files/d9FYAUcqdcNtsuaMgLefvJ/versions` → `specs/004-input-atoms-categories/proofs/read-only/versions.after.json` (après T040, dernier read).
- [ ] T046 [US2] `specs/004-input-atoms-categories/proofs/read-only/attribution.md` : diff before/after, chaque entrée nouvelle imputée → **003** (molécules/sections en cours = attendu) / **master d'atome gelé** (événement FR-004 : édition passée par gates 003 ⇒ ré-extraction nommée avant clôture) / **004** (= échec du garde-fou, traité comme tel, jamais minimisé). **Assert SC-004** : zéro entrée imputable à 004.

---

## Dependencies & Execution Order

### Dépendances de phase

- **Setup (P1)** : aucune dépendance — démarre immédiatement.
- **Foundational (P2)** : après Setup — bloque US1 (contrats catégorisés) et US3 (surfaces). N'est PAS Figma-touchant (peut se faire avant T009 sans risque : aucune lecture Figma).
- **US2-arm (Phase 3, T009)** : **première opération Figma** — précède tout dump/export (US1, US4).
- **US1 (Phase 4)** : après Foundational (schéma + audits) et T009 (garde-fou armé). MVP.
- **US3 (Phase 5)** : après Foundational (schéma). Consomme les atomes de US1 pour peupler « Atoms », mais **testable sur le Button seul**. `button.contract.json` : catégorie ici (T028), enum en US4 (T034) — même fichier, séquencé US3→US4, pas de conflit [P].
- **US4 (Phase 6)** : après T009 (read-only armé). L'élargissement enum (T034) dépend du registre à 16 (T033).
- **Polish + US2-close (Phase 7)** : après toutes les stories. T045/T046 = tout dernier geste (après le read visuel T040).

### Ordre recommandé (quickstart, minimise le churn golden)

`Setup → Foundational → T009 (T0) → US3 emit-react/catalog/dashboard d'abord (T025-T027, « catégorie
débloque tout, testable Button seul ») → US1 atomes (arrivent directement sous Atoms, un seul re-pin)
→ Button category (T028) → US4 icônes + Button enum → Polish → US2 close`. Les phases restent
organisées par story pour la testabilité indépendante ; cet ordre est l'optimisation d'exécution.

### Parallélisation

- Setup : T001 ∥ T002 ∥ T003.
- US1 authoring : **T015 (Textarea) ∥ T016 (Select)** — contrats différents. Les `npm run build`/subjects sont sérialisés (build global, `subjects.ts` fichier unique).
- Inter-stories : une fois Foundational + T009 faits, US1 et US4 peuvent avancer en parallèle (fichiers disjoints), US3 en parallèle sauf `button.contract.json` (séquencer T028 avant T034).

### Dans chaque story

Dump → propose → **review/adopt** (jamais génération) → build → parité → visuel. Éval AVANT claim
(fixture → eval → claim). Golden re-pin explicite quand la sortie générée change.

---

## Parallel Example : US1 (authoring Textarea + Select)

```bash
# Après le spike Input (T010-T014), lancer l'authoring des deux atomes « faciles » en parallèle :
Task T015: "Textarea — dump 2053:1247 → propose → adopt contracts/textarea.contract.json v1.0.0"
Task T016: "Select — dump 2053:1249 → propose → adopt contracts/select.contract.json v1.0.0 (+ chevron-down fixe)"
# Puis SÉRIEL (build global + subjects.ts fichier unique) :
#   T017: npm run build && npm run parity ; ajouter les 2 subjects ; contrôle visuel
```

---

## Implementation Strategy

### MVP d'abord (US1 seul)

1. Phase 1 Setup → 2. Phase 2 Foundational (schéma + audits) → 3. Phase 3 T009 (garde-fou armé) →
4. Phase 4 US1 (4 atomes) → **STOP & VALIDER** : import + gates verts sur les atomes (SC-001) →
livrable = la bibliothèque contient enfin les 4 atomes au niveau de preuve du Button.

### Livraison incrémentale

1. Foundational + US2-arm → base prête (schéma catégorie, garde-fou armé).
2. + US1 → **MVP** : 4 atomes gouvernés, gates verts (affichés « à plat » — la tolérance le permet).
3. + US3 → surfaces groupées par catégorie (Button + atomes sous « Atoms »).
4. + US4 → registre à 16, Button v1.5.0.
5. Polish + US2-close → 8 gates + visuel + preuve lecture seule (SC-004). Chaque étape ajoute sans casser.

### Nature bracketante de US2 (P1)

US2 n'est pas un incrément mid-stream : son T0 (T009) **arme** au début, sa vérification (T045/T046)
**referme** à la toute fin, sur le fichier vivant. C'est voulu — un garde-fou lecture seule se prouve
en encadrant l'itération entière.

---

## Notes

- **[P]** = fichiers différents, aucune dépendance sur une tâche non terminée.
- **Jointure par CLÉ** (`componentSetKey`), jamais par nom d'affichage (français côté Figma, anglais côté code — Bouton ↔ Button, leçon 002).
- **Fichier VIVANT** (003 y travaille) : re-mesurer clés/nodeIds/propriétés au dump ; les chiffres du jour font foi (D12). Masters des 4 atomes **gelés** par accord (FR-004) ; si 003 doit en toucher un → gates 003 puis **ré-extraction nommée** avant clôture.
- **`npm run eval`** exige `node_modules` → `npm install` ici (T001) le rend exécutable dans le worktree ; le checkout principal (sur `main`) ne sert qu'à la mesure « avant » (T004). Chromium requis pour 2 checks.
- **Généré, jamais à la main** : `src/components/*`, stories, `catalog/`, `figma-sync/*.js`, schéma JSON — régénérés. Hand-edit = drift (le différentiel le flaggera).
- **Dégradations nommées d'avance** (Constitution V) : Étoile orange fixe (D6), menu Bouton à 13 (D5), coche hors registre (D7), VECTOR non lus par propose, re-mesures sur fichier vivant (D12).
- Commit après chaque tâche ou groupe logique ; s'arrêter aux checkpoints pour valider une story isolément.
