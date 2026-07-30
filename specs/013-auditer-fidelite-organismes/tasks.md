# Tasks: Auditer la fidélité des organismes (013)

**Input** : documents de conception sous `specs/013-auditer-fidelite-organismes/`
**Prérequis lus** : plan.md, spec.md (**4 US · 20 FR · 8 SC**), research.md (décisions
D1-D14), data-model.md (14 entités), checklists/requirements.md,
contracts/{audit-campaign,audit-result,campaign-report}.interface.md, quickstart.md
(10 scénarios).

**Tests** : **obligatoires**, et écrits AVANT le vert. La Claims Rule (constitution §II,
NON-NEGOTIABLE) impose l'ordre `fixture → eval → claim` pour toute capacité générique, et
D14 nomme les familles de fixtures requises. Chaque phase porte donc une sous-section
« Tests » dont les fixtures doivent être **rouges d'abord**, puis enregistrées dans
`evals/run.ts`. Le compte `N/N` vivant de `npm run eval` est la seule autorité — il n'est
jamais recopié en dur dans une doc vivante.

**Nature de la fonctionnalité** : construire un **instrument d'audit** (module neuf
`extract/figma/organism-audit/`, extension additive du moteur 011), puis l'exécuter en
trois vagues sur douze organismes. Beaucoup de code neuf, beaucoup de reçus écrits, zéro
mutation Figma, zéro retouche de sortie générée.

## Format : `[ID] [P?] [Story?] Description avec chemin de fichier`

- **[P]** : parallélisable (fichier/dossier de sortie disjoint, aucune dépendance non résolue)
- **[US1]/[US2]/[US3]/[US4]** : rattachement à la user story de spec.md — Setup /
  Foundational / Polish n'en portent aucun
- Chaque tâche cite son chemin de fichier, sa commande ou son verdict attendu exact

## Repères (à ne pas retaper à chaque tâche)

| Repère | Valeur |
|---|---|
| Branche / checkout | `013-auditer-fidelite-organismes`, **checkout primaire** `/Users/dlstudio/.superset/projects/ds-contract` — `git worktree list` ne montre AUCUN worktree séparé (**dérogation F1 actée** owner 2026-07-30, portée par plan.md) |
| Fichier Figma (lecture seule, FR-009) | `d9FYAUcqdcNtsuaMgLefvJ`, REST **GET uniquement**, `readOnly: true` |
| Manifeste de campagne (à créer) | `specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json` |
| CLI (à créer) | `npm run audit:organisms` → `extract/figma/organism-audit/run.ts` |
| Racine de preuve (bornage strict) | `specs/013-auditer-fidelite-organismes/proofs/` |
| Module neuf | `extract/figma/organism-audit/{campaign,dependencies,facts,render-react,verdict,report,run}.ts` |
| Moteur réutilisé **tel quel** | `extract/figma/visual-parity/{evidence,gate,img,match,compose,tolerance,figma-api}.ts` — aucun n'importe `campaign.ts`, donc le garde-fou « exactement sept sujets » de `validateCampaignResult` ne contamine pas 013 |
| Moteur réutilisé **partiellement** | `extract/figma/visual-parity/render.ts` : `chromiumExecutable()` + lancement Playwright (lignes 451-493) uniquement. Son chemin `core/emit-html` n'est **jamais** autoritaire (D4) |
| Seule édition du moteur 011 | `extract/figma/visual-parity/campaign.ts` — champ `scope` **optionnel** (D3) ; absent ⇒ les 7 sujets historiques inchangés |
| Reçu de dépendance (existe, vérifié) | `specs/011-fix-molecule-convergence/proofs/visual/result.json` — `member-card: blocked`, `field: blocked`, `nav-item: fail` |
| Versions de contrat vivantes (vérifiées) | `ds.member-card@1.2.0`, `ds.field@2.0.0`, `ds.nav-item@1.1.0` |
| Seuils 013 (D7) | `maxRawDiffPct = 2.5` ET chaque région obligatoire `≤ 2.5` ; masque texte + baseline = **diagnostic seul**, hors calcul autoritaire |
| Surface prouvée (D4) | le **React réellement généré** sous `src/components/**` — `core/emit-html` n'est jamais autoritaire |
| Sweep complet F1 | `npm run build && npm run parity && npm run eval && npm run plugin:check && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && npx tsc -p tsconfig.build.json` |
| Portes de clôture ajoutées | `npm run emitters:check`, `npm run catalog && npm run verify:catalog`, `npm run images:selftest`, campagne 013 |
| Re-pins qui dérivent à toute édition de contrat | `evals/golden.json` (`npm run golden:update`, **après `npm run figma:plan`** — sinon les scripts Figma ne sont pas régénérés et le pin est faux : vécu le 2026-07-30, 4 fichiers `figma-sync/` en dérive) **et** `figma-sync/plugin/engine.receipt.json` — dont la commande de re-pin est **`node scripts/build-plugin-zip.mjs --update-engine-receipt`**, PAS `npm run plugin:check`, qui ne fait que vérifier |
| Re-pin qui dérive à toute édition d'**émetteur** (`core/emit-*.ts`) | **`examples/polaris/figma/*.figma.js`** — régénérer par `npx tsx examples/polaris/generate.ts` (sans `--check`). Troisième reçu, découvert le 2026-07-30 au sweep du 2′ : l'eval `polaris-showcase-reproducible` (C1-determinism) était le seul rouge de `169/170`, parce que les deux re-pins habituels ne couvrent QUE les contrats. Une édition d'émetteur change les octets de tout script Figma généré, showcase Polaris compris |
| Interdits absolus (SC-005/SC-008) | 0 conversion littéral→token, 0 mutation `tokens/**`, 0 écriture Figma, 0 retouche de `src/components/`, `figma-sync/`, `catalog/`, `core/samples/` |
| Inventaire des 12 sujets | vagues + nodes masters + dépendances : `data-model.md` §3, « Inventaire stable » (les 12 ancres de contrat ont été vérifiées conformes) |
| Littéral d'un contrat **enfant** (FR-020) | dans le périmètre **seulement** s'il cause une divergence observée sur l'organisme → `DeferredWorkItem` nommant le contrat porteur (`contractId`) ; sinon ce n'est pas un constat, et son absence ne prouve rien. Aucun contrat d'organisme ne porte de `literals`/`literalsByProp` aujourd'hui — les littéraux vivent dans les atomes/molécules composés |

### Codes de sortie de la campagne (contracts/audit-result.interface.md)

| Code | Verdict | Sens |
|---:|---|---|
| `0` | `complete` | 12/12 dossiers valides **et** tous `proved` |
| `1` | `complete-with-blocks` | campagne complète et honnête, ≥1 organisme non positif — **résultat exploitable, pas une preuve de fidélité** |
| `2` | `invalid` | entrée/référence/hash/couverture/sortie/rapport invalide, ou porte technique inexécutable |

**Attendu au moment de la planification** : `1` / `complete-with-blocks`, avec au moins
`equipe`, `formulaire` et `header` en `blocked`. Trois dossiers `blocked` complets sont
le résultat correct — pas trois lignes manquantes, pas trois passes.

---

## ÉTAT DE REPRISE — 2026-07-30 soir (à lire en premier)

**Phases 1-3 closes + REMÉDIATION VAGUE 1 EXÉCUTÉE (T037) sur redirection owner.**
L'owner a inversé la reco « finir les 12 d'abord » : la journée a été passée à corriger
la vague 1 au pixel au lieu de capturer les vagues 2-3. Résultat prouvé :

| sujet | avant | après | |
|---|---:|---:|---|
| devis | 72 % | 0,14 % | ✅ |
| presentation | 7,8 % | 0,35 % | ✅ |
| sav | 42 % | 0,67 % | ✅ |
| coordonnees | 8,4 % | 0,77 % | ✅ |
| texte-seo | 4,2 % | 1,84 % | ✅ |
| hero | 87,9 % | ~28 % | mur nommé : 2 dégradés (décision owner : reportés) |

Commits : `36833b4` (moteur + contrats + régénération), `ea3cebb` (instrument + preuves).
Toutes les portes vertes au moment du commit (`npm run eval` imprime le N/N vivant).

### Ce que la remédiation a produit (au-delà du plan)

- **6 capacités moteur, fixture rouge d'abord** : booléen `false` de composition passé
  explicitement ; `\n`/`\r`/U+2028 normalisés jusqu'au DOM ; champs d'item **enum**
  dans `arrayOf` ; segments rich-text en valeurs de composition ; littéraux de part à
  marks gras/souligné gouvernés ; une part TEXT n'est plus un conteneur flex.
- Contrats vague 1 + `section-header` 2.0.0 (titre rich-text, axes `alignement`/`emphase`
  — limites nommées : surcharges d'instance Figma) + photos en plans absolus.
- Outils durables : `tools/{run-one,run-wave,overrides,with-build-lock,fetch-census,fetch-image-fills}`.
- **Backlog de nettoyage Figma** (8 défauts de source) : voir la mémoire projet
  `figma-cleanup-backlog-013`.
- **NON COMMITÉ** : 2′ — préservation du paint IMAGE à l'amend (`emit-figma-script`,
  fixture `img-paint-preserved-on-amend` verte, receipts re-pinés, eval complet non relancé).

### Analyse de régénération (propose sur les 58 sets du fichier)

Verdict par composant (comparateur en scratch `out/tmp/compare-propose.mjs`) :
**17 sûrs** (6 prouvés + section-header + 7 à diff nul + carte/product-card/tab) ·
**14 à requalifier** (mêmes pertes d'extraction que la vague 1 — gaps/paddings/typo) ·
risque transversal n°1 : politique de **taille du root** à l'amend (masters artboard
fixes vs contrats fluides). 4 sections sans contrat (CategoriesPrincipales,
Realisations, HeroVideo, ProduitsECommerce) : **hors scope, acté owner**.

### Prochaine étape (ordre validé avec l'owner)

1. Commit 2′ → 2. **Étape 5 = finir CETTE spec** (T050-T062 : capture vague 2,
   3 dossiers bloqués vague 3, puis US4/T063+) — c'est AUSSI le gate qui requalifie
   les 14 pour la régénération → 3. tokens dégradés + bascule VARIANT →
   4. régénération canvas par anneaux (pilotes : realisation puis presentation).

## Phase 1 : Setup

**But** : la session est prête à lire Figma et à exécuter les portes, avant tout geste.

- [X] T001 [Worktree gates — F1] Rendre ce checkout autonome (Constitution, Development
      Workflow : Worktree Gates F1). **Dérogation F1 actée** (owner, 2026-07-30, portée
      par plan.md) : contrairement à la norme du
      gabarit, la branche `013-auditer-fidelite-organismes` est checkoutée dans le
      **checkout primaire** `/Users/dlstudio/.superset/projects/ds-contract` et
      `git worktree list` ne montre aucun worktree séparé — il n'y a donc pas de worktree
      à rendre autonome, et le sweep complet s'exécute ICI. `node_modules/` est
      **absent** : exécuter **`npm ci`** et non `npm install` — `npm ci` installe
      exactement `package-lock.json` **sans le réécrire**, alors que `npm install` peut
      salir ce fichier tracké que T002 lirait aussitôt comme un « checkout sale »
      (l'installation est obligatoire dans tous les cas : le runner de `npm run eval`
      symlinke le `node_modules` de CE checkout et refuse sans lui), puis
      `npx playwright install chromium` (deux contrôles du sweep pilotent un vrai
      Chromium : un eval + l'instrument de parité visuelle ; le cache
      `~/Library/Caches/ms-playwright` contient `chromium-1217` mais la version doit
      correspondre au `playwright-core` épinglé — la commande est idempotente).
- [X] T002 Baseline verte AVANT tout geste — `git status --porcelain` doit être propre
      hors `specs/013-auditer-fidelite-organismes/**` (untracked compris). Tout AUTRE
      fichier modifié → arrêt, checkout sale. **Seule exception admise** : un delta de
      `package-lock.json` attribuable à T001, qui doit alors être consigné et justifié
      dans le reçu de baseline — avec `npm ci` (T001) il ne doit normalement pas
      exister. Puis exécuter le sweep complet F1 et
      consigner commande/exit/sortie dans
      `specs/013-auditer-fidelite-organismes/proofs/baseline/repository-gates-before.json`
      (inclure le `N/N` vivant imprimé par `npm run eval`). C'est le point de référence
      qui rend **attribuable** tout rouge apparu plus tard : sans lui, un échec hérité
      serait imputé à 013. Dépend de T001 (chromium requis par `eval`).
- [X] T003 Vérifier l'accès Figma en **lecture seule** : un unique GET de version sur
      `d9FYAUcqdcNtsuaMgLefvJ` via les variables d'environnement déjà utilisées par
      `extract/figma/visual-parity/figma-api.ts`. Consigner dans
      `proofs/baseline/figma-access.json` : fileKey confirmé, version numérique lue,
      méthode HTTP `GET`, et la confirmation qu'**aucun token n'est imprimé** dans un
      reçu (quickstart, Prerequisites). Arrêt nommé si le fileKey diffère des ancres des
      contrats ou si l'accès échoue — une référence non pinée ne peut prouver aucun fait.

**Checkpoint** : environnement autonome, baseline datée, référence Figma joignable en GET.

---

## Phase 2 : Foundational (bloquant — aucune user story ne démarre avant la fin de cette phase)

**But** : construire l'instrument. Les quatre user stories consomment le même validateur
de périmètre, la même algèbre de verdict fail-closed, le même harnais de capture React et
le même émetteur de dossier. Rien de tout cela n'existe aujourd'hui
(`extract/figma/organism-audit/` est absent, `npm run audit:organisms` est absent).

### Tests (rouges d'abord — Claims Rule §II, familles nommées par D14)

Chaque fixture est **adversariale** : elle doit échouer contre le code actuel, pour la
raison attendue, avant qu'une ligne d'implémentation soit écrite.

**Trois fixtures listées plus loin appartiennent à ce lot rouge**, parce qu'elles portent
sur des mécanismes fondationnels même si leurs sujets relèvent d'une user story : **T028**
(chemin de prop d'asset image) doit être rouge avant T016/T018, **T048** (règle d'entrée
de vague) avant T020, **T056** (dossier de parent bloqué) avant T015/T019. Les écrire
après leur mécanisme violerait §II — une fixture qui n'a jamais été rouge ne prouve rien.

- [X] T004 [P] Fixture rouge de compatibilité 011 (D3) dans
      `evals/fixtures/visual-campaign-scope-additive-check.ts` : `scope` **absent** ⇒
      `validateVisualCampaign` continue d'exiger exactement les sept sujets historiques
      (`carte, field, member-card, nav-item, product-card, realisation, tab`) ; `scope`
      **présent** ⇒ l'ensemble exact déclaré est exigé, et un sujet manquant, surnuméraire
      ou réordonné est refusé **par nom**. Prouve qu'aucun résultat 011 déjà retenu ne
      change de sens.
- [X] T005 [P] Fixture rouge du périmètre 013 dans
      `evals/fixtures/organism-audit-campaign-scope-check.ts` : douze `expectedSubjectIds`
      exacts et ordonnés ; les trois vagues **partitionnent** cet array sans perte,
      doublon ni réordonnancement ; `reference.readOnly !== true` refusé ; seuils hors
      `[0, 2.5]` refusés ; `receiptSchema` inconnu refusé **par nom** ; chemin de sortie
      contenant `..` ou sortant de `proofs/` refusé ; rapprochement par `displayName`
      refusé (D2 — seuls les IDs/clés font foi).
- [X] T006 [P] Fixture rouge de l'algèbre de verdict dans
      `evals/fixtures/organism-audit-verdict-algebra-check.ts` : priorité fail-closed
      `blocked > divergent > not-proven > limited > proved` (data-model §10) ; un fait
      `limited` ne devient jamais un pass ; une couverture inexacte (`missing` ou
      `unexpected` non vide) force `not-proven` ; `divergent` sans `localizedSource`
      refusé ; `proved` avec un `deferredWorkId` non nul refusé ; un `DeferredWorkItem`
      ne rend jamais son fait ou son organisme `proved`.
- [X] T007 [P] Fixture rouge du mappage normatif des reçus dans
      `evals/fixtures/organism-audit-dependency-mapping-check.ts` : `probative` est
      **dérivé** (`missing == []` ET chaque `requiredCaseId` résout ET chaque cas requis
      `probative == true`), jamais saisi ; `pass` + `probative` dérivé faux ⇒ **pas**
      `proved` ; `fail → divergent` ; `blocked → blocked` ; sujet absent / valeur inconnue
      / reçu illisible ⇒ `not-proven` ; hash ou version stale ⇒ parent `blocked` avec
      motif typé ; le manifeste **ne peut pas** surcharger le verdict ni la dérivation.
- [X] T008 [P] Fixture rouge de la capture React réelle (D4) dans
      `evals/fixtures/organism-audit-react-capture-check.ts` : le harnais capture bien le
      composant généré sous `src/components/**` (fichier, export, preset/story, hash de
      bundle, sélecteurs/parts cités) et **refuse** tout repli sur `core/emit-html` —
      un tel repli rend la preuve `not-proven`, jamais un pass.
- [X] T009 [P] Fixture rouge de propagation de props (D6) dans
      `evals/fixtures/organism-audit-prop-projection-check.ts` : un prop **exposé mais non
      projeté** (enfant recevant encore un littéral) est détecté `divergent` avec
      `localizedSource = generated` ; une preuve d'interface TypeScript ou un screenshot
      du défaut ne suffit jamais ; une collection `bindings.figma.kind: "NONE"` non
      justifiée par anatomie/sample/occurrence reste `limited`/`not-proven` et n'est
      jamais conforme par défaut.
- [X] T010 [P] Fixture rouge du caractère probant et de la règle pixel (D7) dans
      `evals/fixtures/organism-audit-probative-evidence-check.ts` :
      `pixelPass = rawPct ≤ threshold ET chaque région requise ≤ son maxDiffPct` — le
      `maskedDiagnosticPct` **n'entre pas** dans l'expression ; référence ou rendu vide,
      invisible, non contrasté ou non équivalent ⇒ `not-proven` ; une région vide ⇒
      non probant ; un score de `0 %` ne suffit **jamais** ; une baseline rouge ne peut
      pas accorder l'acceptation ; une région choisie **après** observation est refusée.
- [X] T011 [P] Fixture rouge de non-conversion (D12) dans
      `evals/fixtures/organism-audit-non-conversion-check.ts` : une conversion
      littéral→token attribuable à 013 est refusée ; une mutation de `tokens/**` est
      refusée ; le reçu exige `literalToTokenConversions == []` et
      `tokenFoundationChanges == []` ; une correction contractuelle **locale** légitime
      reste distinguable d'une conversion interdite par diff typé (un simple
      `git diff contracts/` ne suffirait pas).

### Implémentation

- [X] T012 Ajouter le champ **optionnel** `scope` (`{ expectedSubjectIds, contractIdsBySubject }`)
      à `extract/figma/visual-parity/campaign.ts` — absent : comportement 011 strictement
      inchangé (`REQUIRED_CAMPAIGN_SUBJECT_IDS`, sept sujets, ligne 11) ; présent :
      ensemble exact fourni avec mapping explicite. Évolution **additive** seulement
      (§VI) : aucun champ existant n'est repurposé, aucune valeur ne change de sens.
      Passe T004 au vert. Ne PAS ajouter les organismes à l'enum 011 — cela réécrirait
      rétrospectivement le sens d'une preuve pinée.
- [X] T013 Créer `extract/figma/organism-audit/campaign.ts` : les types des 14 entités de
      `data-model.md` (`AuditCampaign`, `FigmaReference`, `AuditWave`, `OrganismTarget`,
      `DependencyGate`/`DependencyGateResult`, `AuditCase`, `AuditedFact`/`FactLeg`, `VisualEvidence`,
      `ArtifactReceipt`, `DeferredWorkItem`, `OrganismAuditResult`, `CampaignAuditResult`)
      **plus** le validateur de manifeste, pur et sans effet de bord (même discipline que
      `visual-parity/campaign.ts` : ni fetch, ni Chromium, ni `mkdir`), avec des codes
      d'issue typés refusant **par nom**. Passe T005 au vert.
- [X] T014 Créer `extract/figma/organism-audit/verdict.ts` : l'algèbre fail-closed des
      faits (`proved|divergent|limited|not-proven`) et des organismes (+ `blocked`), plus
      le verdict de campagne (`complete|complete-with-blocks|invalid`). Les verdicts sont
      **dérivés**, jamais saisis. Passe T006 au vert.
- [X] T015 Créer `extract/figma/organism-audit/dependencies.ts` : lecture du reçu,
      contrôle de fraîcheur (hash SHA-256 des octets, version de contrat, version Figma),
      dérivation de `probative` depuis les cas requis, et le **mappage normatif** v1→013.
      `requiredVerdict` reste `proved` mais n'est jamais exigé littéralement d'un reçu v1
      qui ne peut pas le contenir. Passe T007 au vert.
- [X] T016 Créer `extract/figma/organism-audit/render-react.ts` : harnais déterministe de
      capture du React généré (D4) — résolution fichier/export sous `src/components/**`,
      preset de props ou story, hash de bundle, relevé DOM/parts par sélecteur,
      `deviceScaleFactor` identique des deux côtés. Réutilise `chromiumExecutable()` et le
      lancement Playwright de `extract/figma/visual-parity/render.ts` (lignes 451-493) sans
      les dupliquer. Aucun repli `emit-html`. Passe T008 au vert.
- [X] T017 Créer `extract/figma/organism-audit/facts.ts` : la chaîne
      `fait Figma piné → contrat id/version/JSON Pointer → fait React généré → preuve`
      (D1) et le calcul de couverture `expected = union(Figma pinée, contrat, projections
      React non-défaut)` (D6), avec `missing`/`unexpected` exacts. Résout les JSON
      Pointers contre le contrat parsé ; une jambe indisponible est **typée absente**,
      jamais assimilée à conforme. Passe T009 au vert.
- [X] T018 Câbler les reçus 011 (visibilité, géométrie, pixels, sémantique, images) aux
      seuils 013 dans `extract/figma/organism-audit/run.ts` — réutiliser
      `visual-parity/{evidence,gate,img,match,tolerance}.ts` **tels quels**, sans élargir
      le seuil global historique du comparateur, sans resampling ni registration des
      rectangles, régions déclarées **avant** le diff. Le diagnostic masqué et la baseline
      restent hors du calcul autoritaire. Passe T010 au vert — et, avec T016 (résolution
      du chemin de prop d'asset déclaré), **T028**.
- [X] T019 Créer `extract/figma/organism-audit/report.ts` — **périmètre de cette tâche :
      le dossier par organisme seulement** (`proofs/organisms/<id>/result.json`,
      `REPORT.md` selon les 9 rubriques de `campaign-report.interface.md`, et les 5
      artefacts par cas : `figma.png`, `generated.png`, `diff.png`, `triptych.png`,
      `metadata.json`) avec `ArtifactReceipt` hashé et vérifié **après** écriture. La
      synthèse de campagne est US4 (T041-T042). Avec T015 (`DependencyGateResult`), passe
      **T056** au vert : la forme du dossier d'un parent bloqué — gate complet, aucun cas
      parent fabriqué — est émise ici.
- [ ] T020 **PARTIEL** — le CLI existe, est enregistré (`npm run audit:organisms`) et refuse
      correctement ; `--check`, `--inventory`, `--check-dependencies` et `--capture-baseline`
      fonctionnent. Restent NON implémentés, et ils refusent par nom avec exit 2 plutôt que de
      rapporter un succès non mérité : `--wave`, `--refresh`, `--verify-report`,
      `--verify-deferred-scope`. La capture se lance aujourd'hui par
      `extract/figma/organism-audit/tools/run-wave1.mts`. Texte d'origine ci-dessous.
      Créer `extract/figma/organism-audit/run.ts` (CLI) et enregistrer
      `"audit:organisms": "tsx extract/figma/organism-audit/run.ts"` dans `package.json`
      (absent aujourd'hui). Modes : `--campaign`, `--out`, `--check`, `--inventory`,
      `--wave 1|2|3`, `--refresh`, `--check-dependencies`, `--capture-baseline`,
      `--verify-report`, `--verify-deferred-scope`. Bornage strict de `--out` sous
      `proofs/` (réutiliser la logique de `validateCampaignOutputPath`) ; `--campaign`
      incompatible avec les filtres de sujets legacy ; **aucun** chemin write/push/update
      Figma n'existe dans aucun mode ; `--check` n'écrit aucun artefact de preuve.
      L'application de la règle d'entrée de vague est portée **ici**, par l'outil et non
      par convention : `--wave 2|3` refusé **exit 2** tant que la vague précédente n'est
      pas classifiée, `previous-wave-classified` signifiant « verdict final honnête » et
      non « que des passes ». Passe **T048** au vert.
- [X] T021 Implémenter `--capture-baseline` : écrire
      `proofs/baseline/hardcoded-values.json` (hash du tree `contracts/` et de
      `tokens/**`, inventaire canonique des `literals`/`literalsByProp` et des liaisons de
      tokens, diff typé, `literalToTokenConversions: []`, `tokenFoundationChanges: []`),
      `proofs/baseline/react-bundle.json` et les reçus Figma/dépendances pinés. **L'inventaire
      vivant est l'autorité — le nombre « 89 » de la prose ne sert jamais à masquer un
      écart d'inventaire** (quickstart §3). Passe T011 au vert.
- [X] T022 Enregistrer les huit fixtures T004-T011 comme cas d'eval dans `evals/run.ts`
      (bloc `claim: 'C2-refusal'` pour les refus, `'C3-detection'` pour T009, suivant le
      motif existant : `run(TSX, ['evals/fixtures/<nom>-check.ts'])` puis `throw` si
      `status !== 0`). Vérifier que `npm run eval` passe et **imprimer** le nouveau `N/N`
      vivant — ne le recopier dans aucune doc vivante.
- [X] T023 Créer le manifeste
      `specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json` : les douze
      sujets dans l'ordre des trois vagues, les trois vagues
      (`startsAfter: null|1|2`, `entryRule`), les trois `dependencyGates`
      (`equipe→ds.member-card@1.2.0`, `formulaire→ds.field@2.0.0`,
      `header→ds.nav-item@1.1.0` — versions **vivantes vérifiées**, pas celles d'un
      exemple d'interface), `generatedSurface.kind: "react-storybook"`, `acceptance`
      (2.5/2.5/0.1 + les quatre `require*: true`), `deferredPolicy` (les deux interdits à
      `true`), `assetsManifest` pointant sur
      `extract/figma/visual-parity/fixture-assets/manifest.json`. Chaque sujet porte ses
      `auditRefs` **résolus** via `specs/010-extract-molecules-organisms/audit-reuse-map.md`
      (entrée canonique — les noms réels diffèrent des IDs : `devis` →
      `audits/devis-cta.md`, `footer` → `audits/footer-devis.md`, `header` → 005 V1/L4) et
      ses trois `coverage.deriveFrom*: true`. `requiredFactIds` et `cases` restent vides
      ici : ils sont remplis par vague (T029, T049, T058). Renseigner enfin `knownLimits`
      pour chaque sujet en **transcrivant les caveats déjà nommés** par la carte 010 avec
      leur effet attendu sur le verdict (FR-015) : `coordonnees` résidu 88 px ; `faq`
      couverture pixel 003 à 2/4 avec cause racine nommée ; `texte-seo` résidu 3 351 px +
      dette rich-text B1 ; `header` dette NavItem item 8, partagée avec sa dépendance ;
      plus, pour les compositions concernées, le résidu canvas 3 488 px de `carte` et le
      rename `Accroche2` en attente de `section-header`. Une limite **déjà connue** qui
      ressortirait en divergence anonyme, ou qui passerait sous le seuil sans être nommée,
      est un défaut de déclaration — pas une découverte de la campagne.
- [X] T024 Épingler `reference.fileVersion` dans le manifeste depuis le GET de T003, et
      vérifier que les douze `figmaSetNodeId` égalent bien `anchors.figma.nodeId` de leur
      contrat (les douze ancres ont été relevées conformes à `data-model.md` §3 ; toute
      divergence exige une justification typée, pas un silence).
- [X] T025 Exécuter le préflight `--check --inventory` — la forme exacte qu'exige la
      table « Gates » de `campaign-report.interface.md`, celle qui devra sortir `0` en
      clôture (T065) — et consigner son reçu dans
      `proofs/baseline/preflight-check.json`. **Attendu à ce stade : refus, exit `2`**,
      par nom, sur les faits et cas obligatoires non encore déclarés — ce refus EST le
      comportement fail-closed correct et vaut reçu (`contracts/audit-campaign.interface.md`,
      « Refusal and safety rules »). Vérifier dans le même reçu que forme, périmètre
      12/3/3, IDs/versions/chemins de contrat, `readOnly`, seuils, `receiptSchema` connus
      et bornage de sortie sont tous validés **avant** ce refus.
- [X] T026 Écrire le reçu de sûreté `proofs/baseline/no-write-path.json` : relevé statique
      de `extract/figma/organism-audit/**` prouvant qu'aucun verbe d'écriture Figma
      (`POST`/`PUT`/`PATCH`/`DELETE`, `figma_execute`, writeback, push) n'y figure et que
      la seule route vers Figma est un GET. C'est le mécanisme qui rendra SC-008
      vérifiable en clôture (T067) plutôt qu'affirmé.
- [X] T027 Sweep complet F1 après l'instrument — les huit commandes à `0`, plus
      `npx tsc --noEmit && npx tsc -p tsconfig.build.json` couvrant le nouveau module.
      Consigner dans `proofs/baseline/repository-gates-foundational.json`. Un rouge ici se
      corrige AVANT toute capture : une porte technique rouge bloque la clôture (D14).

**Checkpoint** : l'instrument existe, refuse correctement, et les quatre user stories
peuvent démarrer.

---

## Phase 3 : User Story 1 — Établir la première vague de preuves (Priority: P1) 🎯 MVP

**But** : six dossiers complets pour `coordonnees`, `devis`, `hero`, `presentation`,
`sav`, `texte-seo`, chacun reliant référence Figma, faits contractuels et rendu généré.

**Test indépendant** : un réviseur ouvre `proofs/organisms/<id>/REPORT.md` pour chacun des
six, suit chaque fait de Figma au contrat puis au rendu, et contrôle le verdict — sans
lire le code source.

### Tests for User Story 1

- [X] T028 [P] [US1] Fixture rouge des faits image (D10) dans
      `evals/fixtures/organism-audit-image-prop-path-check.ts` : les octets IMAGE utiles
      ne sont injectés que par un **chemin de prop de comparaison déclaré**
      (`{"$asset":"id"}` résolvant vers un asset hashé du manifeste) ; une injection par
      CSS de campagne, un placeholder, une div vide ou un default runtime est refusée ; un
      organisme dont l'image Figma n'a **aucune** projection contractuelle/React reste
      `divergent`/`limited`/`not-proven` — le runner ne le fait jamais « ressembler ».
      **À écrire avec le lot rouge de la Phase 2**, avant T016/T018 qui la passent au vert
      ; l'enregistrer dans `evals/run.ts` dès le vert. Concerne notamment `hero`,
      `coordonnees` et `sav`.

### Implémentation for User Story 1

- [X] T029 [US1] Déclarer dans `contracts/audit-campaign.json` les `requiredFactIds` et
      les `cases` des six sujets de la vague 1 : chaque cas cite un **node d'occurrence
      Figma réel** de la version pinée (aucun node muté, aucune variante inventée), ses
      `observedProperties` relues, ses `reactProps` valides contre le contrat, ses
      `requiredParts` (contenant `root`), ses `requiredRegions` **déclarées avant le
      diff**, ses `semanticAssertions` citant chacune un JSON Pointer contractuel, et ses
      `fixtureAssetIds` pour les faits image. Les **probes de props non-défaut** sont
      obligatoires partout où le défaut ne prouve pas la propagation (D6). Couvrir les six
      catégories de faits — `content`, `structure`, `property`, `composition`, `visual`,
      `semantic` — là où elles s'appliquent (FR-006). La `representability` de chaque fait
      (`carry-both` / `carry-with-named-limit` / `carry-code-only`) est **lue** dans
      `docs/FIGMA-CAPABILITY-MATRIX.md` via auggie (§IX — dégradation levée le
      2026-07-30), jamais ré-dérivée depuis le code. Les `knownLimits` du sujet (T023) se
      retrouvent ici en faits `limited` **déclarés**, pas en surprises de capture.
- [X] T030 [US1] Exécuter `npm run audit:organisms -- --campaign <manifeste> --out <proofs>
      --inventory --wave 1` jusqu'à `missing == []` et `unexpected == []` pour les six
      sujets ; vérifier via le `jq` du quickstart §2. Un trou de couverture se **comble
      dans la déclaration**, jamais en retirant le fait de la liste attendue.
- [X] T031 [P] [US1] Auditer `coordonnees` (`ds.coordonnees@1.0.0`, node `2104:2904`) :
      `--wave 1 --refresh`, puis classifier et écrire le dossier complet
      `proofs/organisms/coordonnees/` (result.json, REPORT.md, 5 artefacts par cas). Tout
      constat relevant d'une conversion littéral→token ou d'une fondation de tokens est
      enregistré comme `DeferredWorkItem` avec son `verdictImpact` — **jamais** converti
      en pass.
- [X] T032 [P] [US1] Auditer `devis` (`ds.devis@1.0.0`, node `2096:2524`) — même protocole
      et même règle de travail reporté que T031 ; dossier `proofs/organisms/devis/`.
- [X] T033 [P] [US1] Auditer `hero` (`ds.hero@1.0.0`, node `2111:3382`) — même protocole ;
      dossier `proofs/organisms/hero/`. Porte des faits image : la jambe générée doit
      décoder l'asset, avoir une taille naturelle et des pixels visibles, sinon le fait
      n'est pas prouvé (D10).
- [X] T034 [P] [US1] Auditer `presentation` (`ds.presentation@1.0.0`, node `2103:2824`) —
      même protocole ; dossier `proofs/organisms/presentation/`. Le quickstart §7 en fait
      son exemple de chaîne complète : ce dossier doit être inspectable de bout en bout.
- [X] T035 [P] [US1] Auditer `sav` (`ds.sav@1.0.0`, node `2108:3105`) — même protocole ;
      dossier `proofs/organisms/sav/`. Porte également des faits image (D10).
- [X] T036 [P] [US1] Auditer `texte-seo` (`ds.texte-seo@1.0.0`, node `2108:3123`) — même
      protocole ; dossier `proofs/organisms/texte-seo/`.
- [X] T037 [US1] **EXÉCUTÉ le 2026-07-30 (redirection owner)** — remédiation locale bornée (D11) pour toute divergence
      de la vague 1 dont la source est localisée ET dans le périmètre : (1) conserver le
      résultat initial et ses preuves, (2) fixture rouge d'abord pour tout mécanisme
      générique, (3) éditer **uniquement** la source autorisée (contrat / schéma /
      émetteur générique / outil) — jamais `src/components/`, `figma-sync/`, `catalog/`,
      `core/samples/`, jamais `tokens/**`, (4) régénérer via `npm run build`,
      `npm run figma:plan` (émission locale seulement — **ne pas exécuter dans Figma**),
      `npm run emitters:check`, `npm run catalog && npm run verify:catalog`, (5) re-piner
      **les deux** reçus qui dérivent à toute édition de contrat :
      `evals/golden.json` (`npm run golden:update`) ET
      `figma-sync/plugin/engine.receipt.json` (`npm run plugin:check`), (6) réauditer
      l'organisme et conserver initial **et** final dans le dossier. Toute correction non
      locale devient un `DeferredWorkItem` — arrêt, pas d'élargissement de périmètre.
- [X] T038 [US1] Reçu de classification de la vague 1 dans `proofs/organisms/` +
      `waves[0]` du résultat : les six sujets ont un verdict final **honnête** (pas
      nécessairement positif), `classified: true`. Un fait rouge n'est jamais omis pour
      laisser la vague finir (quickstart §4).

**Checkpoint** : six dossiers inspectables, chacun avec un verdict explicite et justifié.

---

## Phase 4 : User Story 4 — Disposer d'une conclusion honnête et exploitable (Priority: P1)

**But** : la couche de synthèse et d'honnêteté — résultat machine autoritaire, rapport
généré depuis lui, registre des travaux reportés, vérificateurs de cohérence, reçu de
revue.

**Test indépendant** : les fixtures T039-T040 valident la couche seule ; puis le rapport
est exécuté sur la campagne **partiellement classifiée** (vague 1 faite, vagues 2-3 non) —
et les six sujets non encore audités doivent apparaître en lignes honnêtes
`not-proven`/`blocked`, **jamais** conformes par défaut. C'est le test direct de FR-015.

**Note d'ordonnancement** : US4 est P1 et sa **machinerie** est pilotée par fixtures,
donc démarrable en parallèle de US1 dès la fin de la Phase 2. Sa **synthèse finale 12/12**
n'atterrit nécessairement qu'après US3 (voir T063).

### Tests for User Story 4

- [ ] T039 [P] [US4] Fixture rouge de cohérence résultat↔rapport (D13) dans
      `evals/fixtures/organism-audit-report-consistency-check.ts` : toute divergence
      Markdown↔JSON (ordre ou ensemble des douze sujets, compteurs de synthèse, verdicts,
      raisons, trois dependency gates, chemins/hashes de facts/cases/evidence, deferred
      work, exits) rend la campagne `invalid` / exit `2` ; l'index doit avoir **exactement
      douze lignes** dans l'ordre du manifeste ; **aucune cellule vide** dans la matrice
      de traçabilité et tout `N/A` exige une raison typée ; une rubrique vide écrit
      explicitement `Aucun`. Enregistrer dans `evals/run.ts` au vert.
- [ ] T040 [P] [US4] Fixture rouge des codes de sortie dans
      `evals/fixtures/organism-audit-exit-code-check.ts` : `0` **uniquement** si 12/12
      dossiers valides et tous `proved` ; `1` pour une campagne complète et honnête avec
      ≥1 organisme non positif ; `2` pour toute entrée/référence/hash/couverture/sortie/
      rapport invalide ou porte technique inexécutable. Un `1` n'est jamais présentable
      comme une preuve globale de fidélité. Enregistrer dans `evals/run.ts` au vert.

### Implémentation for User Story 4

- [ ] T041 [US4] Assembler le résultat machine autoritaire
      `proofs/result.json` dans `extract/figma/organism-audit/report.ts` :
      `schemaVersion: 1`, `campaignId`, `reference`, `generatedSurface` (+ `bundleSha256`,
      `generatedTreeSha256`), `inputHashes` (campagne, contrats, assets, dépendances,
      baseline valeurs en dur), `waves[3]` dans l'ordre, `subjects[12]` exactement,
      `deferredWork`, `repositoryGates`, `summary` (compteurs **dérivés**),
      `verdict`, `exitCode`, `reasons`. Les timestamps sont informatifs et **exclus** des
      hashes déterministes : deux runs à entrées identiques produisent mêmes faits,
      scores, verdicts, artefacts et hashes.
- [ ] T042 [US4] Générer `proofs/REPORT.md` **depuis** `result.json` (jamais à la main —
      le Markdown n'est jamais l'autorité) avec les dix rubriques obligatoires de
      `campaign-report.interface.md` : Provenance (dont la confirmation « zéro commande
      Figma write/push/update »), index des douze verdicts, exécution des vagues,
      synthèse de couverture, matrice de traçabilité (une ligne par fait obligatoire, 16
      colonnes remplies), verdicts par organisme, divergences et limites nommées, travaux
      reportés, portes dépôt+campagne, reçu de revue. La colonne `dossier` pointe vers
      `organisms/<id>/REPORT.md` ; un parent bloqué **cite son reçu de dépendance**, pas
      seulement le nom de sa dépendance.
- [ ] T043 [US4] Implémenter `--verify-report` : le vérificateur **recalcule** tout depuis
      le JSON et compare au Markdown (liste exhaustive : « Result↔report consistency »).
      Toute divergence ⇒ `invalid`, exit `2`. Vérifie aussi que chaque
      `organisms/<id>/REPORT.md` égale son `organisms/<id>/result.json` et la ligne de
      synthèse correspondante. Passe T039 au vert.
- [ ] T044 [US4] Implémenter le registre `proofs/deferred/work.json` et le mode
      `--verify-deferred-scope`, plus `proofs/closure/hardcoded-values-final.json` (même
      forme que la baseline T021, en diff typé contre elle). Un `DeferredWorkItem` porte
      `subjectId`, `factId`, `category` (fermée : `hardcoded-value-conversion` |
      `global-token-correction`), `contractPointer`, `observedCause` factuelle,
      `candidateToken` informatif, `evidenceIds` non vide, `verdictImpact` ∈
      {`divergent`, `limited`, `not-proven`}, `status: "deferred"`. Le mode refuse toute
      conversion ou mutation de fondation attribuable à 013 et exige les deux listes
      vides.
- [ ] T045 [US4] Câbler les verdicts de campagne et les codes de sortie `0|1|2` dans
      `extract/figma/organism-audit/run.ts` selon la table des Repères. Passe T040 au
      vert. `complete-with-blocks` est étiqueté dans le rapport comme **campagne
      honnêtement terminée**, explicitement pas comme une déclaration de fidélité globale.
- [ ] T046 [US4] Implémenter le reçu de revue `proofs/closure/review.json` :
      `reviewedSubjectIds` = exactement douze IDs dans l'ordre des vagues,
      `openedPathsBySubject` avec **au moins un chemin concret ouvert par sujet** (dossier
      ou reçu de blocage), `verdicts` égaux à `result.json`, `elapsedSeconds <= 600`,
      `complete: true`. C'est l'instrument de SC-006.
- [ ] T047 [US4] Exécuter la couche de rapport sur la campagne **partiellement
      classifiée** (vague 1 seule faite) et prouver FR-015 : les six sujets des vagues 2-3
      apparaissent comme lignes honnêtes non positives avec cause précise, jamais comme
      conformes par défaut, et le rapport reste `complete-with-blocks`/exit `1` ou
      `invalid`/exit `2` — jamais `0`. Consigner dans
      `proofs/closure/partial-campaign-honesty.json`.

**Checkpoint** : la conclusion est générée, vérifiée et incapable de présenter une absence
comme une conformité.

---

## Phase 5 : User Story 2 — Étendre la preuve aux organismes indépendants suivants (Priority: P2)

**But** : `faq`, `footer`, `reassurances` audités **après** la vague 1, dans un ordre
connu, sans dépendre d'un verdict implicite d'une molécule bloquée.

**Test indépendant** : les trois dossiers de la vague 2 se revoient séparément avec les
mêmes critères de traçabilité et de fidélité que la vague 1.

### Tests for User Story 2

- [X] T048 [P] [US2] Fixture rouge de la règle d'entrée de vague dans
      `evals/fixtures/organism-audit-wave-entry-check.ts` : `--wave 2` est **refusé avec
      exit 2** tant qu'un dossier de la vague 1 manque ou n'est pas classifié
      (quickstart §5) ; `previous-wave-classified` signifie « verdict final honnête », pas
      « six passes » — six verdicts non positifs mais classifiés ouvrent légitimement la
      vague 2 ; l'ordre des vagues ne peut pas être contourné. **À écrire avec le lot
      rouge de la Phase 2**, avant T020 qui la passe au vert ; enregistrer dans
      `evals/run.ts` au vert.

### Implémentation for User Story 2

- [X] T049 [US2] **FAIT 2026-07-30** (déclarations agents vérifiées par `verify-declarations` puis fusionnées — 135 faits) — Déclarer dans `contracts/audit-campaign.json` les `requiredFactIds` et
      `cases` de `faq`, `footer`, `reassurances` — même exigence qu'en T029 (nodes
      d'occurrence réels, probes non-défaut, régions déclarées avant le diff, assertions
      sémantiques citant un JSON Pointer). `reassurances` porte un axe `Disposition` et
      une composition `Carte` répétée : le cas cite le contrat enfant et la part/`repeat`
      qui la porte (invariant « une composition obligatoire cite… »).
- [X] T050 [US2] **FAIT 2026-07-30** — couverture exacte pour les trois sujets :
      `missing == []` et `unexpected == []` (lu dans `proofs/organisms/<id>/result.json`,
      champ `coverage`). Le CLI `--wave` restant non implémenté (T020), la capture passe
      par `tools/run-wave.mts 2`, qui applique la règle d'entrée de vague AVANT toute
      capture via `evaluateWaveEntry` — la règle est donc bien portée par l'outil.
- [X] T051 [P] [US2] Auditer `faq` (`ds.faq@1.0.0`, node `2104:2914`) : `--wave 2
      --refresh`, classifier, dossier complet `proofs/organisms/faq/`. Travaux reportés
      enregistrés, jamais convertis en pass.
      **FAIT** → `divergent` · 34 faits (14 prouvés / 18 divergents / 1 limité / 1 non
      prouvé) · pixels 4,37 %.
- [X] T052 [P] [US2] Auditer `footer` (`ds.footer@1.0.0`, node `2120:4785`) — même
      protocole ; dossier `proofs/organisms/footer/`. `auditRefs` résolus via 010 (le
      fichier réel est `audits/footer-devis.md`).
      **FAIT** → `divergent` · 57 faits (20 prouvés / 36 divergents / 1 non prouvé) ·
      pixels 96,91 % — le plus gros écart de la campagne, cause dominante
      `contract-does-not-carry-figma-fact` (le contrat est mince face à Figma :
      paddings, largeur de root, Background absolu, Row sans auto-layout).
- [X] T053 [P] [US2] Auditer `reassurances` (`ds.reassurances@1.0.0`, node `2114:3721`) —
      même protocole ; dossier `proofs/organisms/reassurances/`.
      **FAIT** → `divergent` · 44 faits (22 prouvés / 18 divergents / 4 limités) ·
      pixels 38,88 %.
- [~] T054 [US2] **PARTIEL —  remédié le 2026-07-30,  et  non.**
       : 96,91 % → **1,04 %** de pixels (sous le seuil), 20 → 39 faits prouvés,
      36 → 18 divergents, en ~1 h. Cause racine unique, isolée par l'audit : le moteur ne
      savait pas exprimer les **insets** d'une part en absolu, donc le plan de fond se
      posait à l'origine de la boîte de CONTENU (décalé des 89 px de padding) et débordait
      du viewport de capture. Capacité ajoutée fixture d'abord (,
      C2-refusal) : canaux , grammaire bornée, refus par nom d'un
      inset sur une part non positionnée. Contrats  1.1.0 et 
      1.1.0 ; override de cas  (le master matérialise 3 colonnes, React n'en rend
      aucune sans données — l'écart mesurait l'absence de données, pas l'infidélité).
      **Reste NON déclenché pour  et .** Texte d'origine ci-dessous.
      **Conditionnel — en attente d'arbitrage owner.** Les trois
      sujets sont classifiés `divergent` ; la remédiation au pixel serait un chantier de
      l'ampleur de T037 (une journée pour la vague 1). L'ordre validé avec l'owner le
      2026-07-30 dit « capture vague 2 → 3 dossiers bloqués vague 3 → US4/T063+ », donc la
      campagne continue sans remédier. Protocole si déclenchée : identique à T037 (fixture
      rouge d'abord, source autorisée seule, régénération, **triple re-pin**
      `evals/golden.json` + `figma-sync/plugin/engine.receipt.json` + `examples/polaris/`
      si l'émetteur bouge, réaudit, initial et final conservés).
- [X] T055 [US2] **FAIT 2026-07-30** — reçu dérivé
      `proofs/organisms/wave-2-classification.json` (nouvel outil
      `tools/classify-wave.mts`, jamais saisi à la main) : `classified: true`,
      `independenceFromGatedDependencies: true` — aucun fait des trois sujets ne mentionne
      `ds.member-card`, `ds.field` ni `ds.nav-item`, donc aucun verdict de la vague 2 ne
      dépend d'un verdict implicite d'une molécule bloquée (US2 scénario 1).
      `positiveVerdictsUnderClosedGate: 0`. Le même outil a produit rétroactivement
      `wave-1-classification.json`, que T038 n'avait laissé que sous forme de six dossiers.

**Checkpoint** : neuf dossiers classifiés, vagues 1 et 2 consignées dans l'ordre.

---

## Phase 6 : User Story 3 — Auditer les organismes composés une fois leurs prérequis validés (Priority: P3)

**But** : `equipe`, `formulaire`, `header` — leur dossier ne peut conclure positivement
avant un reçu **frais, positif et probant** de `MemberCard`, `Field`, `NavItem`.

**Attendu au moment de la planification** : les trois portes sont **fermées** (reçu 011
vérifié : `member-card: blocked`, `field: blocked`, `nav-item: fail`) ⇒ trois dossiers
`blocked` **complets**. Si un reçu frais positif et probant apparaît d'ici l'exécution, la
porte s'ouvre et le chemin d'audit complet s'exécute à la place — le mappage n'est jamais
réinterprété pour forcer l'un ou l'autre.

**Test indépendant** : pour chaque organisme composé, un réviseur vérifie la trace de sa
dépendance (reçu, hash, version, verdict brut et verdict mappé) puis, si la porte est
ouverte, la fidélité de sa propre structure, contenu et rendu.

### Tests for User Story 3

- [X] T056 [P] [US3] Fixture rouge du dossier de parent bloqué dans
      `evals/fixtures/organism-audit-blocked-parent-check.ts` : un parent bloqué reçoit un
      dossier **complet** portant son `DependencyGateResult` (chemin du reçu, hash,
      version de contrat, version Figma, `receiptVerdict`, `probative` dérivé,
      `actualVerdict` mappé, `staleReasons`, `open: false`, `reasons` typées), ne fabrique
      **aucun cas parent**, et ne peut recevoir aucun verdict positif ; l'absence de test
      ne vaut jamais validation ; un score global de parent ne peut pas masquer le défaut
      de son enfant. **À écrire avec le lot rouge de la Phase 2**, avant T015/T019 qui la
      passent au vert ; enregistrer dans `evals/run.ts` au vert.

### Implémentation for User Story 3

- [X] T057 [US3] **FAIT 2026-07-30** — CLI `--check-dependencies` à exit `0`, trois reçus
      écrits et dérivés (aucun de `receiptVerdict`/`probative`/`actualVerdict` saisi) :
      `equipe→ds.member-card blocked→blocked`, `formulaire→ds.field blocked→blocked`,
      `header→ds.nav-item fail→divergent`. Les trois portes fermées, chacune avec son
      motif de péremption `figma-file-version-moved`. Texte d'origine ci-dessous.
      Exécuter `--check-dependencies` et écrire les trois reçus sous
      `proofs/dependencies/` : lecture de
      `specs/011-fix-molecule-convergence/proofs/visual/result.json`, hash SHA-256 des
      octets, contrôle de version de contrat (`1.2.0` / `2.0.0` / `1.1.0`) et de fraîcheur
      de la version Figma, dérivation de `probative` depuis les cas requis, puis mappage
      normatif. Les trois lignes sont obligatoires **même si les trois sont fermées**.
      Aucun de `receiptVerdict`, `probative`, `actualVerdict` n'est saisi à la main.
- [X] T058 [US3] **FAIT 2026-07-30** — 188 faits déclarés au census (equipe 59, formulaire 77,
      header 52), vérifiés par `verify-declarations` puis fusionnés ; `cases: []` partout,
      **aucun cas parent fabriqué**. Deux outils adaptés pour rendre l'invariant exécutoire
      plutôt que conventionnel : `verify-declarations` INVERSE son exigence sous porte
      fermée (un `case` déclaré y devient un refus) et `merge-declarations` accepte une
      déclaration sans cas. Texte d'origine ci-dessous.
      Déclarer les trois sujets de la vague 3 dans
      `contracts/audit-campaign.json` : `dependencyId` renseigné, `requiredFactIds`
      calculés au census (les faits restent déclarés même sous porte fermée — c'est ce qui
      rend le blocage lisible), et **aucun cas parent fabriqué** tant que la porte est
      fermée (invariant « un sujet bloqué contient son `DependencyGateResult` »).
      **Si une porte s'ouvre** (reçu frais, positif et probant) et qu'une divergence propre
      à `equipe`, `formulaire` ou `header` est localisée dans le périmètre, sa remédiation
      suit **le protocole de T037 à l'identique** — fixture rouge d'abord, source autorisée
      seule, régénération, double re-pin, réaudit, résultats initial ET final conservés —
      et T071 étend son périmètre de diff attendu en conséquence.
- [X] T059 [P] [US3] **FAIT** → `blocked`, 59 faits obligatoires tous `not-proven`, reçu ds.member-card cité (limite 2e plan photo non périmée). Produire le dossier de `equipe` (`ds.equipe@1.0.0`, node `2115:3947`,
      dépendance `ds.member-card`) sous `proofs/organisms/equipe/` : verdict `blocked`,
      `reasons: ["dependency:ds.member-card:…"]`, reçu cité. **Attention limite nommée
      non périmée** : le 2e plan photo de MemberCard n'est pas branché (limite assumée en
      011) — ce blocage reste valide et ne doit pas être traité comme obsolète.
- [X] T060 [P] [US3] **FAIT** → `blocked`, 77 faits obligatoires tous `not-proven`, reçu ds.field cité. Produire le dossier de `formulaire` (`ds.formulaire@1.0.0`, node
      `2096:2564`, dépendance `ds.field@2.0.0`) sous `proofs/organisms/formulaire/` :
      verdict `blocked`, reçu et motif typé cités.
- [X] T061 [P] [US3] **FAIT** → `blocked`, 52 faits obligatoires tous `not-proven` ; brut `fail` ET mappé `divergent` apparaissent tous deux. Produire le dossier de `header` (`ds.header@1.0.0`, node `84:285`,
      dépendance `ds.nav-item@1.1.0`) sous `proofs/organisms/header/` : le reçu brut dit
      `fail`, le verdict mappé est `divergent`, donc la porte est fermée et le parent est
      `blocked` — les deux valeurs apparaissent, la brute et la mappée.
- [X] T062 [US3] **FAIT** — `wave-3-classification.json` : classified true, `positiveVerdictsUnderClosedGate: 0`, les 3 parents `blocked` avec cause précise. Reçu de classification de la vague 3 (`waves[2]`, `classified: true`) +
      contrôle qu'**aucun** verdict positif n'a fui : les trois parents sont `blocked`
      avec cause précise, et `summary.blocked >= 3`. Vérifier via le `jq` du quickstart §6
      que les trois lignes de dépendance existent bien.

**Checkpoint** : douze dossiers existent ; les trois vagues sont consignées dans l'ordre
prévu.

---

## Phase 7 : Polish & Cross-Cutting

- [ ] T063 Exécuter la campagne complète — `npm run audit:organisms -- --campaign
      <manifeste> --out <proofs> --refresh` — et vérifier `proofs/result.json` : exactement
      douze sujets ordonnés, chacun avec `result.json` et `REPORT.md`, exactement trois
      lignes de dépendance, `summary` cohérent. C'est la synthèse finale 12/12 de US4.
- [ ] T064 Exécuter `--verify-report` puis `--verify-deferred-scope` : les deux à `0`,
      avec `literalToTokenConversions == []` et `tokenFoundationChanges == []`, et tous
      les constats token/valeur-en-dur présents dans les travaux reportés avec leur
      `verdictImpact` (quickstart §9).
- [ ] T065 Sweep de clôture complet et reçu `proofs/closure/gates.json` selon la table
      « Gates » de `campaign-report.interface.md` : le sweep F1 (8 commandes) +
      `npm run emitters:check` + `npm run catalog && npm run verify:catalog` +
      `npm run images:selftest` + les quatre portes de campagne. Toutes à `0` ; seule la
      campagne peut légitimement sortir `1` (si `complete-with-blocks`). Imprimer le `N/N`
      vivant de `npm run eval` **sans** le figer dans une doc vivante.
- [ ] T066 Exécuter la revue et écrire `proofs/closure/review.json` (T046) : douze IDs
      dans l'ordre, ≥1 chemin concret ouvert par sujet, verdicts égaux à `result.json`,
      `elapsedSeconds <= 600`. Preuve directe de SC-006.
- [ ] T067 Reçu SC-008 dans `proofs/closure/no-mutation.json` : `git diff --stat` prouvant
      **zéro** modification sous `src/components/`, `figma-sync/`, `catalog/`,
      `core/samples/`, `contracts/contract.schema.json` (hors régénération attribuable à
      une remédiation T037/T054 dûment documentée) et **zéro** modification de `tokens/**` ;
      plus le reçu de non-écriture Figma (T026) et le décompte des GET effectués.
- [ ] T068 Reçu SC-005 : diff typé `hardcoded-values.json` → `hardcoded-values-final.json`
      montrant qu'aucune des valeurs en dur inventoriées n'a été convertie et qu'aucune
      correction globale de tokens n'a été introduite ; les corrections contractuelles
      **locales** éventuelles y figurent séparées et justifiées.
- [ ] T069 [P] Journal et milestones : entrée datée dans `MILESTONES.md` (les comptes
      datés y sont autorisés), section 013 dans `docs/handoff/10-history.md` — **ou**
      maintien explicite du « journal gap » déjà nommé si 003/004 ne sont pas rattrapés,
      jamais un silence — et mise à jour de `CLAUDE.md` § Recent Changes.
- [ ] T070 [P] Nommer les limites **là où la capacité est revendiquée** (convention
      d'honnêteté du dépôt, pas en note de bas de page ailleurs) : toute dégradation,
      vérification absente ou dépendance non résolue de 013 apparaît avec son organisme
      affecté et son effet sur le verdict — dans `proofs/REPORT.md` rubrique 7 et à côté
      de la revendication correspondante dans les docs touchées.
- [ ] T071 Audit final du périmètre du diff : comparer `git status --porcelain` au
      périmètre attendu (`extract/figma/organism-audit/**`,
      `extract/figma/visual-parity/campaign.ts`, `evals/fixtures/**` + `evals/run.ts`,
      `package.json`, `specs/013-auditer-fidelite-organismes/**`, plus les sorties
      régénérées et les deux re-pins **si et seulement si** une remédiation a eu lieu).
      Tout fichier hors périmètre = alarme à expliquer ou à annuler avant clôture.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** : aucune dépendance — démarre immédiatement. T002 et T003 dépendent
  de T001 (`npm install` absent, `eval` et les GET en dépendent).
- **Phase 2 (Foundational)** : dépend de la Phase 1 — **bloque toutes les user stories**.
  L'instrument n'existe pas aujourd'hui : `extract/figma/organism-audit/` est absent et
  `npm run audit:organisms` n'est pas déclaré.
- **Phase 3 (US1, P1)** : dépend de la Phase 2. MVP.
- **Phase 4 (US4, P1)** : sa **machinerie** (T039-T046) dépend seulement de la Phase 2 et
  peut donc courir en parallèle de la Phase 3 ; **T047 dépend de la Phase 3** (il exerce
  le rapport sur la campagne partiellement classifiée).
- **Phase 5 (US2, P2)** : dépend de la Phase 2 **et** de la classification de la vague 1
  (T038) — la règle d'entrée de vague est appliquée par l'outil, pas par convention.
- **Phase 6 (US3, P3)** : dépend de la Phase 2 **et** de la classification de la vague 2
  (T055), plus son gate de dépendance propre (T057).
- **Phase 7 (Polish)** : dépend des Phases 3, 4, 5, 6 — la synthèse 12/12 (T063) ne peut
  pas précéder la classification de la vague 3.

**Écart d'ordonnancement assumé** : les phases sont ordonnées US1 → US4 → US2 → US3, ce
qui respecte l'ordre de priorité (P1, P1, P2, P3) tout en restant honnête sur le fait que
la synthèse finale de US4 atterrit en T063, après US3. La machinerie de US4 est pilotée
par fixtures, donc réellement testable seule — c'est ce qui rend cet ordre légitime plutôt
que cosmétique.

### User Story Dependencies

- **US1 (P1)** : indépendante après la Phase 2.
- **US4 (P1)** : machinerie indépendante après la Phase 2 ; sa sortie complète agrège
  US1+US2+US3 par construction (FR-014 exige les douze).
- **US2 (P2)** : indépendante d'US3 ; exige seulement que la vague 1 soit **classifiée**
  (pas positive).
- **US3 (P3)** : dépend de trois reçus externes (`MemberCard`, `Field`, `NavItem`). Ces
  reçus sont **des entrées, pas du travail 013** : 013 ne les re-prouve pas et ne les
  réinterprète pas.

### Within Each User Story

- Les fixtures sont écrites et **rouges** avant l'implémentation (Claims Rule §II).
- Déclaration du manifeste (facts + cases) → `--inventory` sans trou → capture/audit →
  classification → dossier.
- Remédiation seulement **après** un premier classement, pour rendre l'amélioration
  attribuable (D11) ; jamais avant l'inventaire.
- Un fait rouge n'est jamais omis pour laisser une vague finir.

### Parallel Opportunities

- **Phase 2** : les huit fixtures T004-T011 sont toutes `[P]` (fichiers disjoints sous
  `evals/fixtures/`). Les implémentations T013-T017 touchent chacune un module distinct de
  `organism-audit/` et sont largement parallélisables ; T018 et T020 partagent `run.ts` et
  se sérialisent ; T022 (registre `evals/run.ts`) et T023 (manifeste) sont des
  fichiers-goulots à ne pas paralléliser avec eux-mêmes.
- **Phase 3** : les six audits T031-T036 sont `[P]` — chacun n'écrit que
  `proofs/organisms/<id>/`, dossiers disjoints.
- **Phase 5** : T051-T053 sont `[P]` pour la même raison.
- **Phase 6** : T059-T061 sont `[P]` pour la même raison.
- **Phase 4** : T039 et T040 sont `[P]` ; la machinerie T041-T046 peut courir en parallèle
  de la Phase 3.
- **Phase 7** : T069 et T070 sont `[P]` (docs disjointes).
- **Goulots à ne jamais paralléliser** : `contracts/audit-campaign.json` (T023, T024,
  T029, T049, T058), `evals/run.ts` (T022 + chaque enregistrement de fixture),
  `package.json` (T020).

---

## Parallel Example : Phase 2 (fixtures rouges)

```bash
# Les huit fixtures adversariales, fichiers disjoints, aucune dépendance entre elles :
Task: "evals/fixtures/visual-campaign-scope-additive-check.ts"        # T004
Task: "evals/fixtures/organism-audit-campaign-scope-check.ts"         # T005
Task: "evals/fixtures/organism-audit-verdict-algebra-check.ts"        # T006
Task: "evals/fixtures/organism-audit-dependency-mapping-check.ts"     # T007
Task: "evals/fixtures/organism-audit-react-capture-check.ts"          # T008
Task: "evals/fixtures/organism-audit-prop-projection-check.ts"        # T009
Task: "evals/fixtures/organism-audit-probative-evidence-check.ts"     # T010
Task: "evals/fixtures/organism-audit-non-conversion-check.ts"         # T011
```

## Parallel Example : User Story 1 (vague 1)

```bash
# Six audits, six dossiers de sortie disjoints sous proofs/organisms/ :
Task: "Auditer coordonnees → proofs/organisms/coordonnees/"   # T031
Task: "Auditer devis       → proofs/organisms/devis/"         # T032
Task: "Auditer hero        → proofs/organisms/hero/"          # T033
Task: "Auditer presentation→ proofs/organisms/presentation/"  # T034
Task: "Auditer sav         → proofs/organisms/sav/"           # T035
Task: "Auditer texte-seo   → proofs/organisms/texte-seo/"     # T036
```

---

## Implementation Strategy

### MVP First (US1 : la première vague probante)

1. Phase 1 : Setup (T001-T003) — `npm install` est **obligatoire**, `node_modules` est absent.
2. Phase 2 : Foundational (T004-T027) — l'instrument, fixtures rouges d'abord. **Bloque tout.**
3. Phase 3 : US1 (T028-T038) — six dossiers inspectables.
4. **STOP et VALIDER** : un réviseur suit une chaîne complète de bout en bout
   (`proofs/organisms/presentation/REPORT.md`, quickstart §7) sans lire le code.
5. Livrable démontrable : six preuves reliant Figma → contrat → React généré.

### Incremental Delivery

1. Setup + Foundational → instrument qui **refuse correctement** (T025 : exit 2 fail-closed).
2. + US1 → six dossiers (MVP).
3. + US4 → conclusion honnête, y compris sur un périmètre incomplet (T047 prouve FR-015).
4. + US2 → neuf dossiers.
5. + US3 → douze dossiers, dont trois blocages **complets et lisibles**.
6. + Polish → synthèse 12/12, portes vertes, reçus SC-005/SC-006/SC-008.

Chaque incrément ajoute de la preuve sans en retirer : un verdict déjà écrit n'est jamais
révisé en silence, et une remédiation conserve son résultat initial.

### Parallel Team Strategy

1. Phase 1 + Phase 2 ensemble (les fixtures se répartissent bien : huit fichiers disjoints).
2. Une fois la Phase 2 finie :
   - Dev A : US1 vague 1 (six audits parallélisables)
   - Dev B : US4 machinerie (fixtures + rapport + vérificateurs)
   - Dev C : prépare US2 (déclaration des faits/cas de `faq`, `footer`, `reassurances`)
3. US3 démarre dès que la vague 2 est classifiée ; ses trois dossiers sont parallélisables.

---

## Notes

- `[P]` = fichiers ou dossiers de sortie disjoints, aucune dépendance non résolue.
- **Figma est en lecture seule de bout en bout** (FR-009) : aucun mode CLI ne possède de
  chemin write/push/update, et T026 en fait un reçu vérifiable plutôt qu'une affirmation.
- **Aucune sortie générée n'est retouchée** (FR-010) : une correction de fidélité passe
  par le contrat puis la régénération, jamais par un patch de TSX/CSS.
- **Un `1` de campagne est un résultat exploitable, pas une preuve de fidélité.** Trois
  dossiers `blocked` complets sont le résultat correct attendu au moment de la
  planification.
- **Ne jamais figer un compte d'evals** dans une doc vivante : `npm run eval` imprime le
  `N/N` vivant, seule autorité (les logs datés comme `MILESTONES.md` sont l'exception).
- **Double re-pin après toute édition de contrat** : `evals/golden.json`
  (`npm run golden:update`) **et** `figma-sync/plugin/engine.receipt.json`
  (`npm run plugin:check`) — le second est facile à oublier et fait échouer la clôture.
- `npm run figma:plan` n'émet que des scripts locaux : **ne pas les exécuter dans Figma**.
- Commiter après chaque tâche ou groupe logique ; s'arrêter à n'importe quel checkpoint
  pour valider une user story isolément.
- À éviter : tâches vagues, conflits sur le même fichier, dépendances croisées entre
  stories qui casseraient leur indépendance, et surtout tout raccourci qui transformerait
  une absence de preuve en conformité.
