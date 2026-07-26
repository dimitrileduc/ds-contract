# Tasks: Spec 007 — Canvas : rendre la source Figma extractible

**Input** : documents de conception sous `specs/007-figma-extractable-source/`
**Prérequis lus** : plan.md, spec.md (4 US · **41 FR · 19 SC**, amendée le 2026-07-26),
research.md (R1-R12, O1-O4), data-model.md,
contracts/{proof-cycle,naming-table,note-census,scope-inventory}.md,
quickstart.md, tools/{name-oracle,note-census}.mjs.

**Correspondance des numérotations** (trois systèmes cohabitent, aucun n'est renuméroté) :

| spec.md | plan.md | tasks.md |
|---|---|---|
| — | P0 Ouverture | Phase 1 (Setup) + Phase 2, T004-T009 |
| — | P1 Table de nommage | Phase 2, T010-T018 |
| chantier 1.1 | P2 Identifiants | Phase 3 (US1) |
| chantier 1.2 | P3 Primitives & rôles · P4 Liaisons · P5 Styles | Phase 4 (US2) |
| chantier 1.3 | P6 Structure | Phase 5 (US3) |
| chantier 1.2 (FR-031) | P7 `DS · Tokens` | Phase 5bis |
| transverse | P8 Clôture | Phase 6 (US4) + Phase 7 (Polish) |

**Tests** : pas de suite logicielle classique — le mécanisme de preuve **est** le sujet de la
spec. Le cycle pixel (`contracts/proof-cycle.md`), l'oracle de nommage
(`tools/name-oracle.mjs`) et le compteur de notes (`tools/note-census.mjs`) sont la
vérification ; ils sont intégrés à chaque tâche ci-dessous plutôt que séparés en une section
« tests ».

**Remarque worktree — dérogation à un MUST constitutionnel, portée au bon endroit** : cette
itération **n'exécute PAS dans un git worktree séparé** — le checkout de la branche
`007-figma-extractable-source` **est** le checkout principal
(`/Users/dlstudio/.superset/projects/ds-contracts-poc`), alors que la constitution
§Worktree Gates (F1) dit **MUST**. Motif : FR-025 interdit toute modification du dépôt
applicatif, donc **il n'y a aucun code à isoler**, et les gates (Phase 7) attendent un statu quo
strict que ce checkout mesure directement. Ce n'est pas une simple note d'organisation :
la dérogation est **inscrite au Complexity Tracking de `plan.md`** (3ᵉ ligne) et doit être
portée comme **waiver Governance dans le corps de la PR** (T068).

## Format : `[ID] [P?] [Story?] Description avec chemin de fichier`

- **[P]** : parallélisable (fichier/zone disjointe, aucune dépendance non résolue)
- **[US1..US4]** : rattachement à la user story de spec.md — Setup/Foundational/Polish n'en
  portent aucun
- Chaque tâche cite son chemin de fichier ou son nodeId cible exact

## Repères (à ne pas retaper à chaque tâche)

| Repère | Valeur |
|---|---|
| Fichier live | `Piqueray (Copy)` — `d9FYAUcqdcNtsuaMgLefvJ`, pont desktop figma-console port **9223** |
| Receveur de capture | `node extract/figma/page-parity/receiver.mjs <outDir> 9227` — imprime un **nonce**, à noter (incident 003/T018 si ignoré) |
| Comparateur | `npm run pages:compare -- --before <dir> --after <dir> --out <dir>` |
| Étalonnage hors-Figma | `npm run pages:selftest` (5 fixtures) |
| Oracle | `node specs/007-figma-extractable-source/tools/name-oracle.mjs "<nom>" --kind <set\|prop>` \| `--selftest` \| `--census` |
| Compteur de notes | `npx tsx specs/007-figma-extractable-source/tools/note-census.mjs <dump.json> --json <out.json>` (tsx requis) |
| Édition locale jamais committée | `extract/figma/dump.plugin.js` l.66 → `const TARGET_SETS = [];` (FR-025) |
| Libellé de version | `007/<passe>/<étape>` — regex `bridge/checkpoint.js` : `^\d{3}\/[^/]+\/[^/]+$` |
| Les 43 cibles de mesure | `Pages` `210:325` (9 maquettes) + `DS · Atomes` `2052:1144` (5) + `DS · Molécules` `2052:1145` (13) + `DS · Organisms` `2052:1146` (16) — nodeIds à **re-sonder en début de session**, ils périment |
| Préfixe de cible obligatoire | `<Page>__<Section>` (ex. `DS-Organisms__Formulaire`) — 12 noms de section se répètent entre pages |
| Tokens dépôt (référence de convention, jamais édités ici) | `tokens/primitives.tokens.json`, `tokens/semantic.tokens.json` |
| Artefacts runtime de cette spec | `decisions.md`, `naming-table.md`, `releves/`, `proofs/<cycle>/`, `RAPPORT-CLOTURE.md` — tous sous `specs/007-figma-extractable-source/` |

---

## Phase 1 : Setup

**But** : la session est prête à mesurer, avant toute lecture ou écriture Figma.

- [X] T001 Vérifier l'environnement de session — `node --version` ≥ 20 ; `npm run pages:selftest`
      → exit 0 ; pont figma-console connecté sur `Piqueray (Copy)` port 9223, confirmé par
      `figma_get_status {probe:true}` → `setup.valid:true`, `probeResult.success:true`,
      `connectedFile.fileName:"Piqueray (Copy)"` ; rappel explicite : **ne jamais dupliquer le
      fichier** (une nouvelle `fileKey` invaliderait ancres, snapshots, historique). Si le pont
      ne répond pas, STOP avant toute autre tâche.
- [X] T002 [P] Scaffolder `specs/007-figma-extractable-source/decisions.md` (journal owner
      append-only — un en-tête horodaté par décision, jamais réécrit rétroactivement) et créer
      les dossiers runtime vides `specs/007-figma-extractable-source/releves/` et
      `specs/007-figma-extractable-source/proofs/` (chacun avec un `.gitkeep` provisoire).
- [X] T003 [P] Faire tourner `node specs/007-figma-extractable-source/tools/name-oracle.mjs --selftest`
      → confirmer **5/5** (le miroir des fonctions `core/propose-figma.ts` l.35/63/95/113 et
      `extract/types.ts` l.183 est fidèle). Si DÉRIVE, STOP : toute la table de nommage
      reposerait sur un oracle qui ment. Ne pas continuer tant que ce n'est pas 5/5.

**Checkpoint** : environnement prêt, oracle vérifié fidèle.

---

## Phase 2 : Foundational (bloquant — aucune user story ne démarre avant la fin de cette phase)

**But** : produire et faire valider par l'owner, **en un seul bloc**, la table de nommage
complète (FR-030/SC-015) — le verrou explicite du plan avant *tout* geste canvas, y compris
ceux d'US3. En parallèle, établir la ligne de base mesurée (structure, calibration, résidus,
notes) qui sert de dénominateur à toutes les SC.

### Lecture de la ligne de base (séquence — suit `contracts/proof-cycle.md` §2 étapes 0-1)

- [X] T004 Sauvegarder un point de version Figma nommé `007/ouverture/etalonnage` via
      `figma_execute` → `bridge/checkpoint.js` → noter le `versionId` retourné. Le libellé passe
      la regex de `bridge/checkpoint.js` sans modification (généralisée en 005, `689637e`).
- [X] T005 [P] Relevé de structure d'ouverture — `bridge/scan.js` (lecture seule, classification
      par géométrie + signature structurelle en priorité, cf. `contracts/scope-inventory.md`
      §4) → écrire `specs/007-figma-extractable-source/releves/structure-ouverture-<date>.json`.
      **Ordre impératif (R11)** : ce relevé DOIT précéder tout renommage de `Bouton` (US1/T019)
      — `scan.js` porte aussi un lookup nominal `KNOWN_MASTERS=['Bouton',…]` (l.69) qui cesserait
      de le reconnaître une fois renommé. Confirmer en direct (O4) : Section-header
      (`2090:2386`+`2090:2387`) déjà `layoutSizingHorizontal:"FILL"` / `layoutAlign:"STRETCH"` ;
      les 11 GROUPs du backlog 2026-07-25 ne subsistent plus (dé-groupés au cycle 14,
      `d8b0d27`) ; identifier le seul GROUP structurel réellement résiduel, `Header + Hero + Cat`
      (`237:970`, page Portes d'entrée) ; confirmer qu'aucun autre GROUP structurel n'existe hors
      les groupes vectoriels `Tracé composé`/`Texte` (internes aux icônes/`piqueray_logo`, hors
      périmètre par nature) et les 5 `Avis Google` (hors périmètre, branche
      `006-google-reviews-block`).
- [X] T006 [P] Étalonnage bloquant — double capture des **43 cibles** sans rien faire entre les
      deux (démarrer le receveur, capturer `run1`, relancer un second passage `run2`, comparer).
      **Ce que cet étalonnage mesure, et rien d'autre : le plancher de bruit de l'instrument.**
      Rien ne change entre `run1` et `run2`, donc **tout diff non nul est du bruit** — jamais un
      héritage de la 005. **Sur les 9 maquettes** : plancher **connu nul** depuis l'étalonnage
      003 (9/9, `contracts/proof-cycle.md` §5) → attendu **9/9 identical** ; tout plancher non nul
      = régression = **STOP programme**, retour owner. **Les 4 résidus acquittés n'ont rien à
      faire ici** : ce sont des écarts avant/après du cycle 14, pas un plancher, et ils se figent
      en T007 depuis une autre source. **Sur les 34 cibles DS** : plancher inconnu (jamais
      mesurées, aucune SECTION jamais exportée par cet instrument) — toute cible bruitée **sort du
      verdict nommément**, jamais comptée identique, et ne bloque pas le programme. Attendu
      global : **43/43 identical**, ou 43 moins les cibles DS sorties nommément. Committer
      `specs/007-figma-extractable-source/proofs/00-etalonnage/{verdict.json,verdict.md}`.
- [X] T007 Figer la ligne de base des **4 résidus acquittés** (FR-024/FR-024a, SC-008a) —
      **source : `specs/005-figma-source-cleanup/proofs/fix-post-cloture/verdict.json`**, le
      verdict avant/après du cycle 14 (vérifié sur disque : `totaux.identical:5, diff:4` ;
      Contactez-nous 469, Portes d'entrée 17, Portes de garage 20, À Propos 99, chacun avec son
      `diffBox`). **Ces chiffres ne sortent PAS de T006** : une double capture d'un fichier
      inchangé rend 0 partout, et ils ne sont pas re-mesurables aujourd'hui — ils sont un écart
      contre un état pré-cycle-14 dont aucune capture pleine page ne subsiste, et l'instrument ne
      garde **aucune baseline** (`contracts/proof-cycle.md` §7). Recopier les 4 comptes + leurs
      `diffBox` dans `specs/007-figma-extractable-source/releves/residus-ouverture-<date>.json`,
      **en citant la source**. Ce que SC-008a suit ensuite n'est donc pas une re-mesure de ces 4
      nombres, mais : **tout diff non nul apparaissant sur ces 4 pages** dans un cycle de
      l'itération (L1-L4, V1-V3) — les liaisons `fontWeight`/`lineHeight`/`fontSize` d'US2 étant
      **les leviers mêmes qui ont produit ces écarts**. Signalé et expliqué, jamais absorbé.
      Note pour l'owner (correction factuelle R10) : les crops des 4 résidus
      **existent encore sur disque** (`specs/005-figma-source-cleanup/proofs/fix-post-cloture/crops/`,
      4 fichiers) — un ré-examen visuel reste possible, même si l'acquittement a déjà été donné
      sur diagnostic écrit seul.
- [X] T008 [P] Relevé de notes d'ouverture — suivre `contracts/note-census.md` de bout en bout :
      (1) éditer **localement** (jamais committé, FR-025) `extract/figma/dump.plugin.js` l.66 en
      `const TARGET_SETS = [];` ; (2) démarrer un receveur de dump dédié
      (`node extract/figma/gauntlet/live/capture-receiver.mjs <outDir> 9226`) ; (3)
      `figma_execute` → `loadAllPagesAsync()` → dump → POST `/chunk?name=<stem>` ; (4)
      `npm run extract:figma -- <outDir>/<stem>.json` (55 fichiers attendus) ; (5)
      `npx tsx specs/007-figma-extractable-source/tools/note-census.mjs <outDir>/<stem>.json --json specs/007-figma-extractable-source/releves/notes-ouverture-<date>.json`.
      (6) **restaurer immédiatement le fichier édité** : `git checkout extract/figma/dump.plugin.js`,
      puis `git status` doit être propre hors `specs/007-…/**` — sans ce pas, l'édition locale
      survit jusqu'à T064 et fait échouer SC-009.
      Confirmer 55 masters / 55 valides, et les comptes par classe A-G (+ Z affichée, jamais
      absorbée). **Confirmer en particulier l'écart mesuré en Phase 0 (recherche) sur la classe
      B : 10 au lieu des 12 de la spec** — examiner si les 2 manquants viennent du second site
      d'émission `core/propose-figma.ts` l.2214 (références d'instance imbriquée) ; le chiffre
      retenu ici devient le dénominateur opposable de SC-001 (la spec renvoie explicitement à ce
      relevé, FR-002). Committer le relevé JSON, **jamais** le dump (~300 Ko, reproductible).
- [X] T008a [P] Relevé live des **trois classes que le compteur de notes ne capte pas** — sans lui,
      trois exigences n'ont aucun dénominateur et « traité » n'est pas définissable. Via
      `figma_execute` + `loadAllPagesAsync()`, écrire
      `specs/007-figma-extractable-source/releves/hors-compteur-ouverture-<date>.json` :
      **(a)** les **calques nommés d'après leur contenu rédactionnel** (FR-005/SC-017) — parcourir
      les nœuds TEXT du périmètre et lister ceux dont `node.name` est égal au contenu, ou en est
      un préfixe/troncature (Figma nomme par défaut un TEXT d'après ses premiers caractères) ;
      c'est le compte de départ que la spec ne donne pas ;
      **(b)** les **valeurs de variant non-ASCII** (FR-003a/O3) — énumérer
      `componentPropertyDefinitions` de type VARIANT sur les 55 masters, relever chaque
      `variantOptions` hors `[A-Za-z0-9 _-]` ; attendu 10, à confirmer ;
      **(c)** l'état de départ des **descriptions de composant** (SC-018) — combien de masters en
      portent une, et laquelle. Le dump **ignore les descriptions** (`ROUNDTRIP.md`), donc aucune
      de ces trois classes ne peut sortir de T008 : c'est un relevé live ou rien.
- [X] T009 Réconcilier T005 et T008 avec les comptes de `contracts/scope-inventory.md` §6 —
      écrire tout écart dans `specs/007-figma-extractable-source/decisions.md` (ex. classe B,
      GROUPs résiduels, état de Section-header). Ne jamais recopier un chiffre périmé du backlog
      2026-07-25 : le relevé frais fait autorité (règle « aucun compteur figé en prose »).

### Production de la table de nommage (FR-030 — aucune écriture canvas ici)

- [X] T010 [P] Rédiger dans `specs/007-figma-extractable-source/naming-table.md` les lignes
      **classe A** (36 sets dont le nom n'est pas déjà PascalCase, incl. les 15 icônes kebab du
      registre 002 et les 7 molécules kebab : Section-header, Accordion-row, Product-card,
      Member-card, Carousel-controls, Footer-column, Nav-item) — format `contracts/naming-table.md`
      §3, chaque candidat validé par `node tools/name-oracle.mjs "<nom>" --kind set` → `CLEAN`
      obligatoire. Source de départ : `node tools/name-oracle.mjs --census` (relevé du
      2026-07-26 déjà encodé), à recouper avec T008 au merge (T017).
- [X] T011 [P] Rédiger les lignes **classe B** (10-12 sets à caractères non transportables —
      `Étoile`, `Équipe`, `Réassurances`, `Réalisations`, `Réalisation`, `Présentation`,
      `Coordonnées`, `Catégories principales`, `Hero vidéo`, `octicon:chevron-down-12`) — même
      validation oracle. Rappel du mécanisme (`contracts/naming-table.md` §2) : retirer les
      accents **ne suffit pas** pour la classe A qui exige le PascalCase strict (`Hero video`
      reste noté, `HeroVideo` passe) ; les deux classes se couvrent donc souvent sur la même
      ligne.
- [X] T012 [P] Rédiger les lignes **classe C** (10 occurrences / 6 propriétés distinctes : `État`
      ×4, `Libellé` ×2, `Icône gauche`, `Icône droite`, `Coché`, `En-tête`) — `--kind prop`. Ces
      lignes n'ont **jamais** de `descriptionFr` (FR-006b : une propriété Figma n'a pas de champ
      description).
- [X] T013 [P] Rédiger les lignes **classe D** (22 collisions de nom de part au sein d'un même
      contrat proposé) — résolution par nom de part unique et descriptif du rôle, jamais du
      contenu.
- [X] T014 [P] Rédiger les 10 lignes de **valeurs de variant non-ASCII** (décision O3, **désormais
      couverte par FR-003a et par le relevé live T008a(b)** — la spec a été amendée le 2026-07-26 ;
      ce n'était plus un ajout de périmètre discrétionnaire mais un manque d'exigence, cf. R6) : `Défaut` (member-picture **et** Tab, 2 occurrences),
      `Sélectionné`, `Fermé`, `Présentation`, `Réassurance`, `Catégorie`, plus les 3 valeurs à
      point médian `·` (`4 cartes · 2 CTA`, `Pleine largeur · 3 cartes`, `Pleine largeur · RDV`).
- [X] T015 [P] Rédiger les lignes des **calques nommés d'après leur contenu rédactionnel**
      (FR-005) — un nom par rôle du calque, jamais par son contenu (un changement de texte ne doit
      plus rendre le nom faux). **Le recensement ne se fait pas ici** : il vient de **T008a(a)**,
      qui produit le dénominateur (aucune classe du compteur de notes ne capte ce défaut). Chaque
      calque du relevé T008a(a) MUST avoir sa ligne, ou une raison écrite de ne pas en avoir —
      c'est ce qui rend SC-017 vérifiable.
- [X] T016 [P] Rédiger, dans une section séparée de `naming-table.md`, la liste des **noms de
      primitives et de rôles à créer** (FR-030 : « plus le nom de chaque rôle et primitive à
      créer ») — primitives `font/size/44`, `font/size/54`, `font/weight/bold`,
      `font/line-height/{16,20,24,25,27,30,40,48,50,60,68}`, `font/letter-spacing/15` (ou
      équivalent), `space/*`, `radius/*`, `border-width/*` complétées ; et les **10 rôles**
      `typography/*` neufs, nommés d'après leur usage observé (proposition : `titre-hero`,
      `libelle-bouton`, `paragraphe-gras`, `accroche`, `onglet`, `titre-2-majuscules`,
      `titre-3-majuscules`, `titre-hero-video`, `libelle-nav`, `note-de-champ`). **Ces lignes ne
      passent pas par l'oracle** (qui valide des identifiants de composant, pas des chemins de
      token DTCG) — elles suivent la convention déjà en place dans `tokens/primitives.tokens.json`
      / `tokens/semantic.tokens.json` (FR-009a) et sont revues pour cohérence, pas pour
      `CLEAN`/`NOTED`.
- [X] T017 Fusionner T010-T016 en une **table unique** `specs/007-figma-extractable-source/naming-table.md` :
      vérifier l'unicité des `componentIdSlug` sur la table **entière** (classe G — deux
      renommages peuvent converger vers le même id, risque réel dès 36 renommages) ; vérifier
      FR-007 — aucune référence externe (script, contrat adopté, ancrage d'instance) ne dépend
      d'un nom remplacé, **refait**, jamais supposé (acquis connus à re-confirmer : les ancres de
      contrat sont `componentSetKey`+`nodeId`, qui survivent au renommage ; `parity` lit des
      snapshots committés, donc reste inerte tant qu'ils ne sont pas rafraîchis).
- [X] T018 **Revue owner en un seul bloc** de la table complète (T017) + des **quatre** points
      d'arbitrage : **O1** — accepter le PascalCase strict pour les 36 (dont icônes/molécules
      kebab) ; **O2** — **ratifier** le re-cadrage de SC-002, déjà intégré à `spec.md` le
      2026-07-26 (le zéro porte sur les 193 valeurs numériques ; les 41 styles « non dérivés »
      sont une limite nommée, inatteignable sur canvas sans édition dépôt — R9 — léguée avec le
      trou d'émetteur n° 1) ; **O3** — ratifier l'inclusion des 10 valeurs de variant, désormais
      portée par FR-003a ; **O5 (nouveau)** — trancher la **lecture de SC-009 vis-à-vis de
      `CLAUDE.md`** : les 2 lignes « Active Technologies » ajoutées automatiquement par
      `/speckit.plan` sont-elles hors du champ de SC-009 (lecture retenue, écrite dans SC-009 et
      au Complexity Tracking du plan) ou faut-il la lecture stricte avec `git checkout CLAUDE.md`
      après chaque `/speckit.*` ? Décider **ici**, pas à T064 où il serait trop tard.
      Consigner le verdict (ligne par ligne si l'owner raye une ligne — jamais un zéro menti)
      dans `specs/007-figma-extractable-source/decisions.md`.
      **Bloquant absolu (FR-030/SC-015)** : aucune tâche de Phase 3, 4 ou 5 ne démarre avant que
      cette tâche soit cochée. 100 % des lignes doivent être `CLEAN` à l'oracle (identifiants) ou
      revues pour cohérence (primitives/rôles) ; **0 nom appliqué hors table**.

**Checkpoint** : ligne de base mesurée et committée ; table de nommage validée par l'owner.
Plus aucun geste canvas des phases suivantes n'a besoin d'attendre une validation cas par cas.

---

## Phase 3 : User Story 1 — Les noms deviennent des identifiants (Priority P1) 🎯

**But** : chaque nom de set/propriété/valeur de variant/calque devient tel quel un identifiant
de code, sans réécriture par l'extracteur (FR-001…FR-008).

**Test d'indépendance** : un nouveau relevé de notes (même procédure que T008) renvoie **0**
note des quatre classes « identifiant » — A, B, C, D — départ 80 (36+10-12+10+22).

- [X] T019 [P] [US1] Préparer (sans exécuter) le script de geste **zone `DS · Atomes`**
      (`2052:1144`, zone disjointe #1 — FR-029) : appliquer les lignes de `naming-table.md`
      dont l'ancre `nodeId` est sous cette page, renommage **et** description accentuée FR-006a
      dans le même geste (`Etoile` porte désormais la description « Étoile », etc.). **`Bouton`
      est le dernier renommage de cette zone** (R11 : après lui, tout relevé `scan.js` doit
      cibler par nodeId, plus par le nom `'Bouton'`). Transcrire le script dans
      `specs/007-figma-extractable-source/proofs/L1/gestes.md` (section « DS · Atomes »). Piège
      à vérifier après coup (pas avant, mais à garder en tête en écrivant le script) : éditer un
      master efface les overrides de ses instances (contenu, taille, alignement — 005/cycle 14).
- [X] T020 [P] [US1] Idem pour la **zone `DS · Molécules`** (`2052:1145`) — inclut les 7
      molécules kebab (Section-header, Accordion-row, Product-card, Member-card,
      Carousel-controls, Footer-column, Nav-item). Transcrire dans `proofs/L1/gestes.md`
      (section « DS · Molécules »).
- [X] T021 [P] [US1] Idem pour la **zone `DS · Organisms`** (`2052:1146`). Transcrire dans
      `proofs/L1/gestes.md` (section « DS · Organisms »).
- [X] T022 [US1] Résoudre les **22 collisions de nom de part** (classe D, `naming-table.md`) —
      geste séparé car il touche l'anatomie interne des contrats proposés (les parts d'un même
      composant), pas le nom du set/prop lui-même. Transcrire dans `proofs/L1/gestes.md`
      (section « Collisions de part »).
- [X] T023 [US1] Exécuter le **lot L1** en un seul cycle de preuve (`contracts/proof-cycle.md`
      §2) : version `007/identifiants/L1` → capture AVANT ×43 (noms préfixés par page) →
      exécuter T019-T022 dans cet ordre (le préfixage R11 est respecté par construction, zone
      Atomes en dernier lieu de sous-étape pour `Bouton`) → capture APRÈS ×43 → `npm run pages:compare`.
      **Si le budget d'appels du pont est dépassé** (86 captures + N gestes), scinder en L1/L1b —
      une scission de **cadence**, jamais une fusion de gestes visuels. Committer
      `specs/007-figma-extractable-source/proofs/L1/{verdict.json,verdict.md,crops/}`. Attendu :
      **43/43 identical**. Tout `diff` ⇒ STOP, lot annulé en entier, cause identifiée avant toute
      reprise — jamais de requalification en bruit de rendu.
- [X] T024 [US1] Vérifier les **instances des 5 contrats adoptés** (Bouton, Checkbox, Input,
      Select, Textarea) après le lot L1 — piège 005/cycle 14 confirmé : éditer un master peut
      écraser le contenu/taille/alignement de ses instances. Consigner tout override perdu dans
      `decisions.md` ; si aucun override n'est perdu, le consigner aussi (l'absence de dégât est
      un fait vérifié, pas supposé).
- [X] T025 [US1] Re-relevé de notes post-L1 (même procédure que T008, dump frais, **y compris le
      pas de restauration (6)**) → `specs/007-figma-extractable-source/releves/notes-post-L1-<date>.json`.
      Vérifier : **0** note classes A/B/C/D (SC-001, dénominateur = celui de T008, pas le 80 de la
      prose) ; **0** translittération résiduelle — l'identifiant proposé par l'extracteur ==
      exactement le nom porté par la source pour les cas de classe B (SC-003, départ 48) ;
      **55/55** contrats toujours valides pour le schéma, pas de régression (SC-004) ; **0**
      collision de part (SC-005, départ 22) ; **classe G à 0** (aucun `componentIdSlug` réclamé
      par deux sets après 36 renommages).
- [X] T025a [US1] Re-relevé **live** post-L1 — le pendant de T008a, pour les trois classes que le
      compteur ne capte pas → `releves/hors-compteur-post-L1-<date>.json`, dépend de T023.
      Vérifier : **(a)** 0 calque nommé d'après son contenu sur le dénominateur T008a(a), ou
      chaque survivant nommé avec sa raison (**SC-017**) ; **(b)** 0 valeur de variant hors ASCII
      (**FR-003a**), départ 10 ; **(c)** chaque master renommé porte la description accentuée
      prévue par sa ligne de table, et les propriétés dont l'orthographe française porte du sens
      sont consignées dans la description du composant qui les porte (**SC-018**, FR-006a/FR-006b)
      — la limite « une propriété Figma n'a pas de champ description » est écrite au relevé pour
      remonter telle quelle au rapport de clôture.

**Checkpoint** : US1 complète et vérifiable indépendamment — le relevé ne déclenche plus aucune
note d'identifiant.

---

## Phase 4 : User Story 2 — Les valeurs deviennent des tokens (Priority P1) 🎯

**But** : chaque valeur sur un canal tokenisable est portée par une variable ; les 18 styles de
texte sont liés et marqués (FR-009…FR-015, FR-010a/b/c, FR-031).

**Dépendance d'ordre (plan.md)** : cette phase suit US1 — « les noms avant les valeurs, un
renommage déplace les chemins que les liaisons référencent ». Ce n'est pas une contrainte de
contenu strict (lier une variable ne dépend pas du nom du set) mais l'ordre imposé par le plan
pour que tout relevé et toute vérification ultérieurs opèrent sur des noms déjà stables.

**Test d'indépendance** : un nouveau relevé renvoie **0** note « valeur sans token » sur les
canaux mesurés (départ 193) ; la classe F (41, styles non dérivés) reste comptée à part et
nommée (recadrage O2, T018) — ce n'est pas un échec, c'est la limite actée. Le vrai reçu du lot
typographique est SC-013 : **18/18** styles liés **et** 18/18 marqués.

### Primitives & rôles (P3 du plan — création pure, 0 pixel par construction)

- [X] T026 [P] [US2] Compléter la gamme `font/size` (collection `Primitives`, mode `Value`) :
      ajouter **44** et **54** (valeurs exactes observées — existant : 14,16,18,20,24,32,40,48).
      Nom Figma `font/size/44` (convention `/`), chemin DTCG futur `font.size.44`.
- [X] T027 [P] [US2] Compléter `font/weight` : ajouter **bold** (existant : regular, medium,
      semibold).
- [X] T028 [P] [US2] Créer la gamme `font/line-height` : ajouter **16, 20, 24, 25, 27, 30, 40,
      48, 50, 60, 68** (seule existante aujourd'hui : 22, pour 46 cas sans token). Le cas
      `AUTO` (style « Note de champ ») n'est **pas** liable — il se tranche par écrit en US3
      (T055), pas ici.
- [X] T029 [P] [US2] Créer la gamme `font/letter-spacing` — inexistante aujourd'hui ; au moins la
      valeur **15 %** observée sur le style « Accroche » (seul style à interlettrage non nul).
- [X] T030 [P] [US2] Compléter `space` (existant : 0, 4, 10, 16, 32) pour couvrir les valeurs
      bloquantes parmi les 58 `itemSpacing` + 22 `padding` observés — **limité aux canaux qui
      bloquent** (FR-012 : la réouverture n'autorise pas de construire une famille `space`
      complète au passage, seulement de compléter ce qui bloque l'extraction). **La liste exacte
      des valeurs à créer n'existe pas encore et ne s'invente pas** : elle sort de la
      décomposition par canal de la classe E du relevé T008 (`contracts/note-census.md` §4) —
      **dépend donc de T008/T009**. La liste retenue MUST être écrite dans `decisions.md` **avant**
      l'exécution du lot L2, sans quoi « limité aux canaux qui bloquent » n'est pas vérifiable.
- [X] T031 [P] [US2] Compléter `radius` (existant : 32 seul) pour les 3 `cornerRadius` observés.
- [X] T032 [P] [US2] Compléter `border-width` (existant : 0, 2) pour les 9 `strokeWeight`
      observés.
- [X] T033 [US2] Étendre les **8 rôles `typography.*` existants** (titre-1…6, paragraphe, lead —
      `tokens/semantic.tokens.json`) avec la propriété **`line-height`** manquante (FR-010a),
      dépend de T028 — aliaser les nouvelles primitives de line-height, ces 8 rôles étant
      **réutilisés tels quels**, jamais refaits.
- [X] T034 [US2] Créer les **10 rôles `typography.*` neufs** nommés d'après leur usage observé
      (noms validés en T016/T018 : titre-hero, libelle-bouton, paragraphe-gras, accroche, onglet,
      titre-2-majuscules, titre-3-majuscules, titre-hero-video, libelle-nav, note-de-champ) —
      dépend de T026-T029, chacun aliasant `family/size/weight/line-height`. Les styles 14/15
      (Titre 3/2 majuscules) partagent les métriques de Titre 3/2 non-majuscules : ils restent
      **deux rôles distincts** (pas de fusion, cf. US2 sc.4/data-model §6).
- [X] T035 [US2] Exécuter le **lot L2** (T026-T034, créations pures) en un cycle de preuve —
      version `007/tokens/L2-primitives-roles` → capture AVANT ×43 → créations → capture APRÈS
      ×43 → comparer. **0 pixel attendu par construction** : créer une variable non consommée ne
      rend rien. Committer `proofs/L2/{verdict.json,verdict.md}`. Toute variable créée ici sans
      consommateur dans le périmètre est **déclarée non prouvée au pixel**, jamais convertie en
      « identique » (contracts/proof-cycle.md §6).

### Liaisons de valeurs (P4 du plan — 133 valeurs à token proche + 60 sans, valeur exacte FR-013)

- [ ] T036 [P] [US2] Lier les **58** valeurs `itemSpacing` à leur variable `space/*` (dépend de
      T030) — valeur **exactement** observée, jamais arrondie/rapprochée (FR-013/FR-015). Pour
      toute valeur de ce canal sans token proche (`suggestions.length===0`), créer la variable
      dédiée et consigner (valeur, usage, occurrences) dans `decisions.md`.
- [ ] T037 [P] [US2] Lier les **22** valeurs `padding` (par côté) à `space/*` (dépend de T030) —
      même règle valeur-exacte + création dédiée pour les cas sans token proche.
- [ ] T038 [P] [US2] Lier les **9** `strokeWeight` à `border-width/*` (dépend de T032) — idem.
- [ ] T039 [P] [US2] Lier les **5** `fontSize` restants hors styles de texte à `font/size/*`
      (dépend de T026) — **vérifier au fil de l'eau** si ces occurrences recouvrent des nœuds
      déjà couverts par un des 18 styles nommés (P5, ci-dessous) ou des nœuds indépendants ; ne
      pas supposer 0 recouvrement, ne pas double-compter non plus.
- [ ] T040 [P] [US2] Lier les **48** `fontWeight` à `font/weight/*` (dépend de T027) — même
      vérification de recouvrement qu'en T039.
- [ ] T041 [P] [US2] Lier les **46** `lineHeight` à `font/line-height/*` (dépend de T028) — même
      vérification de recouvrement qu'en T039. **Gap trouvé 2026-07-26** (`decisions.md`,
      « Plan de liaison T036-T044 ») : `lineHeight=32` à `Hero:root/Bloc texte/Titres/wrapper/
      Sous-titre` n'a pas de primitive — les 11 valeurs de T028 dérivaient des 18 styles de
      texte (R8), pas du canal `lineHeight` général sur tout le fichier. **1 primitive neuve
      requise, `font/line-height/32`** — créer puis lier dans le geste L3, T028 non rouvert
      (déjà exécuté/committé), addendum consigné ici à la place.
- [ ] T042 [P] [US2] Lier les **3** `cornerRadius` à `radius/*` (dépend de T031).
- [x] T043 [US2] Traiter le(s) cas **`opacity`** — se décompose en 1 occurrence exactement
      (`MemberPicture:root/normal = 1`), le combiné `opacity`+`minHeight` du relevé confirmé
      1+1 distincts (`decisions.md`, « Plan de liaison T036-T044 »). FR-014 : **vérifié
      explicitement avant de lier, sur page jetable, résultat chiffré dans `decisions.md` §
      « Test isolé FR-014 »** — la limite est **CONFIRMÉE**, pas infirmée : un token FLOAT lié
      au canal `opacity` est **divisé par 100** par Figma (0,5 lié → relu 0,005). `opacity/base`
      (valeur existante **100**) s'avère être la compensation déjà correcte pour ce quirk
      (100÷100=1, opaque) — **aucune correction de valeur**, lier tel quel dans le geste L3.
      Quirk vérifié **spécifique au scope `OPACITY`** (cornerRadius/strokeWeight/itemSpacing
      testés en contrôle sur le même geste, aucune division) — ne s'étend pas aux autres
      canaux de T036-T042.
- [ ] T044 [P] [US2] Traiter le(s) cas **`minHeight`** — 1 occurrence exacte,
      `Coordonnees:root/google-map = 597` (`decisions.md`). Hors gamme `space/*` existante —
      **1 primitive neuve requise, `space/597`** (famille `space` légitime : le scope
      `WIDTH_HEIGHT` couvre minWidth/minHeight/maxWidth/maxHeight au même titre que
      width/height, pas une famille séparée). Créer puis lier, valeur exacte, dans le geste L3.
- [ ] T045 [US2] Exécuter le **lot L3** (T036-T044, liaisons de valeurs) en un cycle de preuve —
      version `007/tokens/L3-liaisons` → capture AVANT ×43 → liaisons → capture APRÈS ×43 →
      comparer. **0 pixel attendu** : lier une variable qui porte la valeur déjà rendue ne
      déplace rien. Committer `proofs/L3/{verdict.json,verdict.md}`. Toute variable créée en
      T036-T044 sans instance rendue dans le périmètre (les 60 cas sans token proche) est
      déclarée non prouvée, nommément — y compris sur les masters sans instance dans les
      maquettes (Checkbox, Étoile, mail, external-link), désormais couverts par la mesure DS.

### Styles de texte (P5 du plan — 18 styles, 0/18 liés et 0/18 marqués au départ, confirmé live)

- [ ] T046 [US2] **Correction 2026-07-26 (decisions.md, Correctif D) : le texte ci-dessous
      inversait le mécanisme réel — corrigé pour suivre le Correctif C, jamais réécrit sur
      un coup de tête.** Pour chacun des **18 styles de texte**, lier via
      `TextStyle.setBoundVariable` : `fontFamily`+**`fontWeight`** (la graisse se lie par le
      canal **`fontWeight`, un FLOAT** — les primitives `font/weight/*` sont bien des valeurs
      numériques (regular=400, medium=500, semibold=600, bold=700), pas des noms STRING ;
      `setBoundVariable('fontWeight', …)` est un champ liable réel de `TextStyle`/`TextNode`,
      jamais utilisé par le générateur du dépôt aujourd'hui — voir Correctif C), `fontSize`,
      `lineHeight`, `letterSpacing` — **sauf** le style « Note de champ » (interligne `AUTO`,
      non liable, cf. FR-019/US3 T055). **Préalable ajouté (Correctif E)** : `fontFamily` ne
      peut être lié qu'après correction de la valeur de `font/family/montserrat`
      (`"Montserrat, sans-serif"` → `"Montserrat"`, sans quoi le rendu casse — vérifié en
      direct, jamais supposé). Dépend de T033/T034 (rôles prêts) et T035 (L2 vérifié). Piège
      005/cycle 14 à re-vérifier après coup : les instances de textes utilisant ces styles ne
      doivent perdre ni contenu ni alignement.
- [ ] T047 [US2] Poser le marqueur `ds_contracts/textStyleToken` (plugin data) sur chacun des 18
      styles, portant son chemin de token — dépend de T046. Sans lui, le générateur créerait 18
      doublons à la première génération (FR-010c).
- [ ] T048 [US2] Exécuter le **lot L4** (T046-T047) en un cycle de preuve — version
      `007/tokens/L4-styles` → capture AVANT ×43 → liaisons+marqueurs → capture APRÈS ×43 →
      comparer. **0 pixel attendu**. Committer `proofs/L4/{verdict.json,verdict.md}`.
- [ ] T049 [US2] Relevé live **SC-013** (dépend de T048) — `getLocalTextStylesAsync()` →
      confirmer **18/18** `Object.keys(style.boundVariables).length > 0` **et** 18/18
      `getPluginData('ds_contracts/textStyleToken')` non vide → committer
      `specs/007-figma-extractable-source/releves/styles-post-L4-<date>.json`. C'est le **reçu
      réel** du lot typographique (pas le compteur de notes classe F, cf. R9/decisions T018-O2).
- [ ] T050 [US2] Re-relevé de notes post-tokenisation (même procédure que T008, dépend de T045 et
      T049) → `releves/notes-post-tokenisation-<date>.json` : confirmer **0** note classe E sur
      les canaux mesurés (SC-002 volet valeurs) ; confirmer que la classe F reste à 41, comptée à
      part et nommée (recadrage O2 — jamais fondue dans le zéro) ; produire le **backlog
      d'harmonisation chiffré** (FR-013a) dans `decisions.md` : quelles valeurs se
      regrouperaient sur une échelle, combien de variables cela économiserait, coût pixel estimé
      par maquette — destinataire = une itération d'harmonisation dédiée, pas cette spec
      (SC-012).

**Checkpoint** : US2 complète et vérifiable indépendamment — 0 note « valeur sans token » sur les
canaux mesurés, 18/18 styles liés et marqués.

---

## Phase 5 : User Story 3 — La structure porte une sémantique de layout (Priority P2)

**But** : aucun nœud structurel en GROUP, gabarits partagés dimensionnés en FILL (FR-016…FR-019).

**Constat qui recadre cette phase (O4, T005)** : le contenu de cette user story est **déjà livré
à ~90 %** par le cycle 14 post-clôture 005 (`d8b0d27`, nuit du 25-26) — Section-header est déjà
FILL, ses 7 adoptions déjà rejouées, les 11 GROUPs du backlog déjà absents. Cette phase est donc
majoritairement une **vérification du fait accompli**, plus 1 GROUP résiduel réel et 2 décisions
écrites.

**Test d'indépendance** : le périmètre ne contient plus aucun GROUP structurel, et
Section-header se dimensionne en FILL avec ses 7 adoptions rejouées (vérifiable par relevé
direct, indépendamment d'US1/US2).

- [ ] T051 [US3] Consigner dans `decisions.md` la réconciliation du fait accompli, sur la base
      de T005/T009 : Section-header déjà FILL (backlog disait FIXED 1550, **périmé**), 11
      GROUPs déjà absents (backlog en listait 11, **périmé**) → FR-016/FR-018 passent en
      **vérification-seulement** ; seul `Header + Hero + Cat` (`237:970`) reste un GROUP
      structurel réel à trancher.
- [ ] T052 [US3] Mesurer la **cascade Section-header** sur les 3 instances de `Réassurances` par
      un cycle pixel dédié avant/après (FR-017) — même si le master n'a pas bougé pendant cette
      itération, produire la preuve dédiée exigée par la spec, **pas** un contrôle global qui la
      noierait parmi les 43 cibles.
- [ ] T053 [US3] Dé-grouper le GROUP résiduel `Header + Hero + Cat` (`237:970`, page Portes
      d'entrée) — spike `figma.ungroup(node)` (API native, jamais utilisée dans ce dépôt ;
      les dé-groupages 005 étaient des reconstructions manuelles). **Condition** : n'exécuter que
      si le pré-relevé de structure (T005) laisse attendre 0 pixel de mouvement ; sinon, **ne pas
      exécuter** — nommer le cas dans `decisions.md` à la place (O4).
- [ ] T054 [US3] Écrire la décision pour chaque style sous le seuil d'externalisation (règle
      owner ≥ 2 occurrences, 2026-07-25) : **Hero vidéo Regular 44 ×1**, **Nav-item Medium
      16/lh16 ×1** — externaliser, laisser en littéral, ou fusionner, écrit dans `decisions.md`
      (FR-019), pas laissé implicite.
- [ ] T055 [US3] Trancher le cas des **3 textes Field Regular 14 / interligne AUTO** (candidats
      au lien vers le style « Paragraphe » lh24) — décision écrite dans `decisions.md`. **Si la
      décision déplace des pixels**, la traiter comme un **geste visuel assumé** : annoncé avant
      exécution, isolé dans son propre cycle, montré sur crop, validé owner (FR-019, US3 sc.5) —
      jamais fondu dans un cycle 0-pixel.
- [ ] T056 [US3] Exécuter le(s) cycle(s) **V1(+V2)** couvrant T052/T053/T055 — version
      `007/structure/V1` → capture AVANT exhaustive sur **toutes** les cibles concernées (règle
      before-capture, jamais un sous-ensemble pilote, SC-007) → geste(s) → capture APRÈS →
      comparer. Si T055 déplace des pixels : le diff observé doit **==** le diff annoncé, montré
      sur crop, sinon STOP (échec de prédiction, pas une validation au jugé). Committer
      `proofs/V1/{verdict.json,verdict.md,crops/}` (+ `V2` si scission de cadence).
- [ ] T057 [US3] Relevé de structure post-V1 — cibler **directement par nodeId** (`237:970` et
      les 3 instances de Réassurances), **pas** via la classification nominale de `scan.js` (R11
      : elle ne reconnaît plus `Bouton`, déjà renommé en US1). Confirmer **0 GROUP structurel
      résiduel** (ou nommé si T053 a été refusée) → `releves/structure-post-V1-<date>.json`
      (SC-006).

**Checkpoint** : US3 complète et vérifiable indépendamment — 0 GROUP structurel, cascade
Section-header prouvée.

---

## Phase 5bis : Mise à jour de `DS · Tokens` (FR-031/SC-016 — rattachée à US2, séquencée ici)

**Pourquoi ici et pas juste après T050** : le plan (Phases d'exécution, P7) place ce geste
**après** la structure (P6), pas immédiatement après le lot typographique — c'est un
regroupement de cadence, la page doit refléter l'état **final** des variables une fois que plus
aucun geste ne peut encore en créer. La tâche reste étiquetée `[US2]` parce que son FR/SC en
relèvent.

- [ ] T058 [US2] Mettre à jour la page canvas `DS · Tokens` (`2051:951`, 3 sections) pour
      refléter l'état final des variables — gammes complétées (T026-T032), rôles posés
      (T033-T034), variables créées pour les cas sans token proche (T036-T044) — dépend de T050
      **et** T057 (cadence réelle : après la structure). Geste à **diff annoncé**, capture
      avant/après dédiée (FR-022), version `007/ds-tokens/V3`, montré sur crop, validé owner.
      Committer `proofs/V3-ds-tokens/{verdict.json,verdict.md,crops/}`. **SC-016** : 0 variable
      créée par l'itération absente de la page.

---

## Phase 6 : User Story 4 — Le relevé de sortie fait foi (Priority P3)

**But** : la clôture porte un relevé mesuré et reproductible ; toute dette qui survit est nommée
une par une (FR-020…FR-030 transverses, FR-026/FR-027/FR-027a/FR-027b).

**Test d'indépendance** : la procédure du relevé, rejouée par un tiers à partir du seul rapport
de clôture, reproduit les compteurs annoncés.

- [ ] T059 [US4] Relevé de notes de **clôture** — rejouer `contracts/note-census.md` intégralement
      (dump frais, édition locale `TARGET_SETS=[]` non committée, `note-census.mjs`, **puis
      `git checkout extract/figma/dump.plugin.js`** — le pas de restauration fait partie de la
      procédure, T064 le contrôle) → dépend de T058 → `releves/notes-cloture-<date>.json`.
      Rejouer aussi le relevé live T008a/T025a → `releves/hors-compteur-cloture-<date>.json`
      (SC-017, SC-018, FR-003a — ces trois-là ne sortiront jamais du compteur de notes). Confirmer 55/55 toujours valides (SC-004), 0
      classes A/B/C/D/E sur canaux mesurés, classe F comptée à part et nommée (O2), classe G à 0
      (vérifier qu'aucun des 36 renommages n'a fait converger deux ids vers le même
      `componentIdSlug`).
- [ ] T060 [US4] Bilan de clôture des 4 résidus (FR-024a, SC-008a) → dépend de T058 →
      `releves/residus-cloture-<date>.json`. **Ce n'est pas une re-mesure** — elle est impossible
      (cf. T007) : c'est la **synthèse des verdicts L1-L4 / V1-V3** restreinte aux 4 pages
      concernées (Portes d'entrée, Portes de garage, À Propos, Contactez-nous). Verdict attendu :
      **0 diff non nul** sur ces 4 pages sur toute l'itération → la ligne de base acquittée de
      T007 est inchangée et le rapport le dit. Tout diff observé est reporté avec son cycle, sa
      `diffBox` et son crop, et expliqué — amélioration comme aggravation sont toutes deux un
      fait à rapporter, **0** absorbé en silence.
- [ ] T061 [US4] Reproduire la procédure du relevé **« à blanc »** — en suivant uniquement le
      texte écrit dans `contracts/note-census.md` (pas la mémoire de cette session), confirmer
      que les compteurs annoncés en T059 sont bien reproduits. C'est le test d'acceptation de
      US4 elle-même (SC-011).
- [ ] T062 [US4] Rédiger `specs/007-figma-extractable-source/RAPPORT-CLOTURE.md` — dépend de
      T059-T061, T050 (backlog d'harmonisation) : par geste (L1-L4, V1-V3), l'avant/après et une
      explication courte (FR-026) ; la procédure du relevé écrite reproductible (FR-028) ; le
      backlog d'harmonisation chiffré (T050/FR-013a) ; **toutes** les exceptions nommées une par
      une (opacité si la limite a tenu, styles sous seuil, GROUP non traité si refusé, etc.).
- [ ] T063 [US4] Dans `RAPPORT-CLOTURE.md`, dépend de T062, reporter nommément à la **dette
      léguée** (section unique reprenant « Prochaines étapes » de spec.md item par item,
      FR-027) : (1) divergences contrat↔canvas des 5 masters adoptés renommés + le registre
      d'icônes si O1 retenu ; (2) les 4 divergences héritées de la 005 (Bouton,
      `octicon:chevron-down-12`, Checkbox sans usage, Étoile/mail/external-link sans usage) ;
      (3) les **5** trous d'émetteur (FR-027a — le 5ᵉ, `loadFontAsync('Inter')` en dur dans
      `core/emit-figma-script.ts` l.664 alors que le fichier est en Montserrat, a été intégré à la
      spec le 2026-07-26) ; (4) le re-pointage des 5 contrats
      adoptés vers `typography.*` (FR-027b) ; (5) la promotion des variables vers `tokens/`
      (préparée comme une copie, FR-009a) ; (6) l'exposition des props sur les masters ; (7) le
      rich-text (item B1) ; (8) Nav-item (soulignement actif, lien de couleur) ; (9) les
      zéro-usage à trancher (Checkbox, Étoile, mail, external-link) ; (10) la limite `opacity`
      si elle a tenu (T043) ; **+** les accroches par nom dans l'outillage (`parity/diff.ts`
      l.769 `'Bouton'` / l.773 `'Glyphe'`, `evals/harness.ts` l.181, `bridge/scan.js` l.69 —
      R11) ; **+** la divergence documentaire du README `page-parity` §10 (périmètre 9→43,
      Complexity Tracking du plan).
- [ ] T064 [US4] Vérifier `git status` / `git diff --stat`, dépend de T063 : le diff de la
      branche ne touche que `specs/007-figma-extractable-source/**` (+ les 2 lignes « Active
      Technologies » de `CLAUDE.md` que `/speckit.plan` a déjà ajoutées — lecture retenue au
      Complexity Tracking du plan, à confirmer owner) — **SC-009**. Tout autre fichier modifié
      est une régression à corriger avant de committer quoi que ce soit.

**Checkpoint** : US4 complète — clôture reproductible, dette 100 % nommée.

---

## Phase 7 : Polish & Cross-Cutting

**But** : les gates du dépôt restent au statu quo strict ; rien de cette itération ne fuit hors
de son périmètre d'artefacts.

- [ ] T065 Faire tourner le sweep complet des gates (statu quo attendu, 8/8) :
      `npm run build && npm run parity && npm run eval && npm run plugin:check && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && npx tsc -p tsconfig.build.json`.
      Si `parity` rougit sur une **péremption de snapshot** (`MAX_SNAPSHOT_AGE_DAYS`, défaut 14
      jours depuis le 2026-07-25 → rouge attendu vers le **2026-08-08**) plutôt que sur le
      contenu, lever par la variable d'environnement — **jamais** par un rafraîchissement de
      snapshot (qui ferait entrer les renommages canvas dans le différentiel, contredisant
      SC-009/le statu quo attendu). **C'est une suppression de gate au sens de la constitution
      §Governance** : si la levée est utilisée, elle MUST être (a) écrite comme **waiver
      time-boxed** dans le corps de la PR — motif, date d'expiration, qui l'accorde — et (b)
      re-montrée au rapport de clôture avec le rouge d'origine. Une levée silencieuse par
      variable d'environnement est exactement le « gate suppressed rather than fixed » que la
      constitution demande au relecteur de refuser.
- [ ] T066 [P] Nettoyer les PNG de travail gitignorés (`.page-parity/`, `extract/figma/page-parity/out/`)
      — confirmer qu'ils ne sont pas committés ; confirmer que le dump du relevé (~300 Ko,
      T008/T059) n'est pas committé, seul le relevé JSON l'est (data-model.md §1).
- [ ] T067 [P] Relire `quickstart.md` et les 4 fichiers sous `contracts/` à la lumière de
      l'exécution réelle — si un pas a divergé (ex. l'écart classe B confirmé à une valeur autre
      que 10, ou une répartition opacity/minHeight différente), corriger ces artefacts de spec
      **avant** de clore (ils sont sous `specs/007-...`, donc pas soumis à FR-025).
- [ ] T068 Revue finale owner de `RAPPORT-CLOTURE.md` et de la table de nommage exécutée —
      confirmer **SC-010** (100 % des exceptions et dettes léguées sont nommées) et clore
      l'itération. **Écrire dans le corps de la PR les deux waivers Governance** identifiés au
      Complexity Tracking de `plan.md` : (1) **exécution hors worktree dédié** (constitution
      §Worktree Gates F1 dit MUST ; motif : FR-025 gèle le dépôt applicatif, aucun code à isoler)
      et (2) **levée `MAX_SNAPSHOT_AGE_DAYS`** si elle a servi (T065), time-boxée. La
      constitution §Governance exige un waiver **enregistré dans la PR**, pas une note dans un
      artefact de spec — sans lui, un relecteur doit rejeter la PR.

**Checkpoint** : gates au statu quo, artefacts propres, itération close.

---

## Dependencies & Execution Order

### Ordre des phases — **strictement séquentiel**, par construction de la spec

À la différence d'un projet logiciel modulaire où les user stories P1 peuvent avancer en
parallèle, cette itération est une **campagne unique sur un seul fichier Figma live** : le plan
(plan.md, « Phases d'exécution ») impose un ordre dur, repris ici tel quel plutôt que
re-dérivé :

```
Setup (T001-T003)
  → Foundational (T004-T018, dont T008a) — BLOQUANT, y compris pour US3
    → US1 Identifiants (T019-T025a)
      → US2 Tokens (T026-T050)
        → US3 Structure (T051-T057)
          → Phase 5bis DS·Tokens (T058)   [étiquetée US2, cadence P7 après P6]
            → US4 Clôture (T059-T064)
              → Polish (T065-T068)
```

- **Foundational bloque tout** : FR-030/SC-015 interdisent tout renommage (US1) ou création de
  variable/rôle (US2) avant la validation owner de T018 — et le plan étend ce verrou à *tout*
  geste canvas, y compris la structure (US3), pour que renommages/valeurs/structure ne
  s'entrelacent jamais dans une même fenêtre de preuve.
- **US1 avant US2** : « les noms avant les valeurs » (plan.md) — un renommage déplace les
  chemins que les relevés/liaisons référencent ; faire les renommages en premier évite de
  mesurer/lier sous un régime de noms qui va encore bouger.
- **US2 avant US3** : ordre de **cadence** du plan (P3-P5 avant P6), pas une dépendance de
  contenu stricte — dé-grouper un GROUP ne dépend pas des tokens. Respecté tel quel car c'est
  l'ordre que Phase 0 a arrêté après avoir compté le coût d'un cycle (86 appels de capture).
- **T058 (DS·Tokens) après US3** : cadence P7 du plan, positionnée après la structure (P6) bien
  que son FR (031) appartienne à US2 — la page doit documenter l'état *final* des variables.
- **US4 après tout le reste** : la clôture mesure ce que les phases précédentes ont produit ;
  elle n'a pas de sens avant.

### Dépendances fines à l'intérieur des phases

- Foundational : **T007 est indépendant de T006** (il recopie le verdict 005, il ne dérive plus
  d'un verdict de calibration — correctif du 2026-07-26) ; (T005,T008,T008a)→T009 ;
  T003→(T010-T016) ; **T008a→T015** (le recensement FR-005 fournit le dénominateur de la table) ;
  **T008a→T014** (les 10 valeurs de variant à confirmer avant de les écrire) ;
  (T010-T016)→T017→T018.
- US1 : (T019-T022)→T023→T024 ; T023→(T025, T025a).
- US2 : T028→T033 ; (T026-T029)→T034 ; (T026-T034)→T035 ; **T008/T009→T030** (la liste des
  valeurs `space` à créer sort de la classe E du relevé, elle ne s'invente pas) ; chaque liaison
  T036-T042 dépend de sa primitive (T030 pour T036/T037, T032→T038, T026→T039, T027→T040,
  T028→T041, T031→T042) ;
  T035→T043/T044 ; (T036-T044)→T045 ; (T033,T034,T035)→T046→T047→T048→T049 ; (T045,T049)→T050.
- US3 : (T005,T009)→T051 ; T051→(T052,T053,T054,T055) ; (T052,T053,T055)→T056→T057.
- T058 : T050 **et** T057.
- US4 : T058→(T059,T060) ; T059→T061 ; (T059,T060,T061,T050)→T062→T063→T064. **T060 ne dépend
  plus de T007 comme d'une re-mesure** : c'est la synthèse des verdicts L1-L4/V1-V3 sur les 4
  pages, comparée à la ligne de base figée en T007.
- Polish : T064→T065 ; T065→(T066,T067)→T068.

### Parallélisme réel (FR-029 — zones disjointes, un seul cycle global tenu par l'orchestrateur)

Le parallélisme de cette spec porte sur l'**authoring** (rédaction de scripts, drafts de table,
lecture) jamais sur l'**exécution canvas** elle-même : un seul cycle de preuve encadre chaque
lot, exécuté et vérifié par l'orchestrateur, jamais par plusieurs agents en simultané sur le
même cycle. Le pont accepte plusieurs écrivains concurrents sur des ports différents à condition
que leurs zones soient disjointes — utile pour les tâches `[P]` ci-dessous, pas pour les tâches
d'exécution de lot (T023, T035, T045, T048, T056, T058).

```
# Foundational — drafts de table (aucune écriture canvas, 7 rédacteurs possibles) :
Task: "T010 Rédiger les lignes classe A"
Task: "T011 Rédiger les lignes classe B"
Task: "T012 Rédiger les lignes classe C"
Task: "T013 Rédiger les lignes classe D"
Task: "T014 Rédiger les lignes valeurs de variant (O3)"
Task: "T015 Rédiger les lignes calques renommés (FR-005)"
Task: "T016 Rédiger les noms de primitives/rôles à créer"
# → converge en T017 (merge), puis T018 (revue owner unique, bloquant)

# US1 — préparation des scripts de geste, 3 zones disjointes (FR-029) :
Task: "T019 Script de renommage — zone DS · Atomes (Bouton en dernier, R11)"
Task: "T020 Script de renommage — zone DS · Molécules"
Task: "T021 Script de renommage — zone DS · Organisms"
# → T022 (collisions de part, zone à part) → T023 (UN SEUL cycle d'exécution+vérification)

# US2 — primitives par famille de canal (FR-029) :
Task: "T026 font/size"  Task: "T027 font/weight"  Task: "T028 font/line-height"
Task: "T029 font/letter-spacing"  Task: "T030 space"  Task: "T031 radius"  Task: "T032 border-width"
# → T033/T034 (rôles) → T035 (UN SEUL cycle L2)
```

---

## Implementation Strategy

### Chemin critique (pas de « MVP partiel » possible ici)

Contrairement à un projet applicatif où US1 seule livre déjà de la valeur déployable, cette spec
n'a de valeur qu'**entière** : un fichier à moitié renommé (US1 sans US2) laisse le compteur
« valeur sans token » à 193 et le diff pixel de la spec suivante ne peut toujours pas être vert.
Il n'y a donc pas de scope MVP à isoler — le budget du plan (4 lots 0-pixel + 1-2 cycles visuels
+ 1 cycle annoncé + 1 étalonnage) est la seule séquence qui clôt l'itération.

Ce qui **peut** s'arrêter à un checkpoint sans tout perdre : chaque **Checkpoint** ci-dessus est
un point où l'état du fichier est prouvé cohérent (N/N ou diff annoncé validé) et où
`decisions.md`/les relevés sont à jour — une reprise ultérieure repart de là sans reconstituer
le contexte.

### Séquence recommandée

1. Phase 1 (Setup) + Phase 2 (Foundational) — jusqu'à T018 inclus. **Rien d'autre ne commence
   avant que T018 soit coché.**
2. Phase 3 (US1) complète → checkpoint : relevé 0/80.
3. Phase 4 (US2) complète, y compris T058 (DS·Tokens — mais physiquement exécutée après la
   Phase 5, cf. note de séquence) → checkpoint : relevé 0/193 + 18/18.
4. Phase 5 (US3) complète → checkpoint : 0 GROUP structurel.
5. T058 (DS·Tokens, cadence réelle ici).
6. Phase 6 (US4) → RAPPORT-CLOTURE.md.
7. Phase 7 (Polish) → gates 8/8, clôture.

---

## Notes

- `[P]` = zone/fichier disjoint, aucune dépendance non résolue à l'instant où la tâche démarre —
  jamais une autorisation d'exécuter deux gestes canvas en simultané sur le même cycle de preuve.
- `[US#]` trace la tâche jusqu'à sa user story (et donc jusqu'à ses FR/SC) — Setup, Foundational
  et Polish n'en portent pas, par convention du gabarit.
- Chaque tâche d'exécution de lot (T023, T035, T045, T048, T056, T058) **est** son propre test :
  le verdict N/N (ou diff==annoncé) est la preuve, pas une suite séparée à écrire.
- Committer après chaque checkpoint de phase, jamais au milieu d'un cycle de preuve en cours
  (un lot annulé doit pouvoir revenir à un état net).
- Ne jamais absorber une exception dans un zéro : classe F (41), résidus (4), opacité si la
  limite tient, GROUP non traité si refusé — chacune est comptée à part et nommée, du premier
  relevé (Foundational) jusqu'au rapport de clôture (T062-T063).
- Éviter : exécuter un geste hors table de nommage (T018), lancer une tâche `[P]` de Phase 3+
  avant T018, requalifier un diff en « bruit de rendu » sans avoir ouvert le crop.
