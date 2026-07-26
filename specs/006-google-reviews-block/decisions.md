# Journal de décisions — Spec 006 (« Avis Google »)

Journal **append-only**, tenu par la session qui opère le pont `figma-console` contre
`Piqueray (Copy)` (`d9FYAUcqdcNtsuaMgLefvJ`). Format hérité de la spec 003/005 : chaque geste
canevas porte `{label, versionId}` → diff attendu (annoncé **avant** tout geste) → diff observé →
verdict. Les décisions prises « en live » à partir d'un relevé sont consignées ici, au moment où
elles sont prises, **avant** l'écriture qui les applique.

Ne jamais éditer une entrée déjà écrite : une correction s'ajoute, elle ne réécrit pas.

---

## Log

### T001 — Merge de la ligne de base (2026-07-26)

- **Constat initial** : la branche `006-google-reviews-block` partait de `8f3137d` (PR #4, spec 003).
  `git merge-base --is-ancestor 005-figma-source-cleanup HEAD` → non ancêtre. Confirmé : 005 n'était
  pas dans cette branche, comme documenté dans `plan.md` (« Prémisse corrigée en cours de plan »).
- **Découverte en cours de route** : `main` avait bougé bien au-delà de `8f3137d` — 16 commits
  d'écart, dont `5e86062` (« Merge pull request #5 from dimitrileduc/005-figma-source-cleanup ») :
  **005 était déjà mergée dans `main`**, pas seulement close sur sa branche. Deux commits
  supplémentaires (« dx », `b50cdf8` + `cd438a5`, 2026-07-26 08:55) avaient atterri après ce merge.
  Décision (owner, en session) : merger `main` directement plutôt que la branche `005-figma-source-cleanup`
  — un seul geste couvre 005 **et** les deux commits « dx ».
- **Premier essai de merge refusé par git** : 3 fichiers modifiés non committés dans le worktree
  (`.specify/memory/constitution.md`, `CLAUDE.md`, `.specify/templates/plan-template.md`) —
  un patch local (constitution 1.0.1 → 1.0.2, trouvé par un `/speckit.analyze` antérieur sur cette
  branche, finding M6 : corrige `node scripts/deterministic-roundtrip.mjs` → `npx tsx …` et un `npx`
  manquant sur le second `tsc -p tsconfig.build.json`) aurait été écrasé par le merge. `git merge`
  a annulé proprement (aucun état intermédiaire, HEAD inchangé).
- **Vérification avant de committer ce patch** : comparaison avec la version déjà présente sur
  `main`. `main` est en fait à la constitution **1.1.0** (bump MINOR du 2026-07-24, dont le
  correctif de commandes de gate fait partie, aux côtés du nouveau Principe VIII et de la section
  Worktree Gates F1) — daté **avant** le patch local 1.0.2 (2026-07-25). Le patch local était donc
  **entièrement redondant** : ce worktree, isolé depuis `8f3137d`, avait re-découvert indépendamment
  un problème déjà réparé plus largement sur `main` la veille. Décision : écarter le patch local
  (`git restore` sur les 3 fichiers) plutôt que le committer, aucun contenu unique perdu (vérifié
  ligne à ligne sur les commandes de gate concernées).
- **Merge exécuté** : `git merge main --no-edit` → **fast-forward propre** `8f3137d..cd438a5`,
  157 fichiers, **zéro conflit** (le worktree était redevenu propre avant le merge). Working tree
  confirmé clean après (`git status --short` → seul `specs/006-google-reviews-block/` non suivi).
- **Vérifications post-merge** :
  - `extract/figma/page-parity/bridge/checkpoint.js:26` porte bien `/^\d{3}\/[^/]+\/[^/]+$/` —
    les labels `006/…` sont posables (R16).
  - `BACKLOG-SPEC-006-figma-styles-structure.md` est arrivé à la racine (venait de 005) → voir
    entrée T006 ci-dessous, il entre directement en collision avec cette spec.
  - Constitution confirmée à `1.1.0`, `Ratified 2026-07-22`, `Last Amended 2026-07-24`.
- **Verdict** : ✅ T001 fait. 005 (et le DX audit qui a suivi sa clôture) est dans cette branche.

### T006 — STOP-GATE owner : collision de numéro de spec (2026-07-26)

- **Constat** (R24) : `BACKLOG-SPEC-006-figma-styles-structure.md` (racine, arrivé au merge) assigne
  7 items à « spec 006 », et `specs/005-figma-source-cleanup/RAPPORT-CLOTURE.md` (§ Divergences
  ouvertes, points 5 et 6) nomme explicitement « Spec 006 » comme propriétaire de deux réparations —
  dont l'item 1 du backlog (Section-header FIXED → FILL) **contredit frontalement FR-008** de cette
  spec-ci (« Avis Google », qui exige Section-header conservé intact).
- **Décision owner** : cette spec reste « Avis Google » seule (option a de R24). Le backlog et les
  deux réparations qu'il porte partent vers le prochain numéro libre. `ls specs/*/` confirme
  001-006 occupés (006 = celle-ci) → **007** est libre, aucune collision trouvée (`grep` sur
  "007"/"spec 007" dans le dépôt : aucun match réel, seulement des faux positifs `SC-007`/`FR-007`).
- **Vérification en direct avant de trancher le contenu** (figma-console reconnecté en cours de
  session — voir note de port ci-dessous) — trois faits établis en lecture seule sur le fichier
  vivant, `Piqueray (Copy)` `d9FYAUcqdcNtsuaMgLefvJ` :
  1. **Item 1 du backlog (Section-header FIXED→FILL) : FAIT.** `figma.getNodeByIdAsync('2090:2386')`
     (Accroche) et `('2090:2387')` (Titre) portent tous deux `layoutSizingHorizontal: "FILL"` —
     plus FIXED. Recoupé avec le commit `d8b0d27` (« step(005/fix-post-cloture): cycle 14 clos —
     dé-GROUP ×11, adoption Section-header ×7… verdict 5/9 + 4 résidus sub-pixel nommés »),
     postérieur à la clôture officielle `cc048a4` et **jamais répercuté** dans le backlog ni dans
     `RAPPORT-CLOTURE.md`, qui listaient donc tous les deux une réparation déjà faite.
  2. **Item 2 du backlog (dé-GROUP ×11) : probablement fait, NON vérifié en direct.** Le même
     commit l'affirme, mais je n'avais pas les node ids en main pour un spot-check et n'ai pas
     élargi la vérification (hors périmètre de cette spec) — annoté comme tel, pas coché.
  3. **Item 4 du backlog (copie Accueil sur `DS · Organisms`, node `2121:5168`) : FAIT — décision
     inversée après l'audit qui l'a écrit.** `getNodeByIdAsync('2121:5168')` → absent. Le backlog
     disait « décision owner : LAISSER en l'état », mais le commit de clôture `cc048a4` dit
     explicitely « Archive+copie supprimées » — cette copie est partie avec l'Archive, cohérent
     avec `research.md` R25 et le compteur T113 (« Accueil-copy deleted ») que ce même audit
     ignorait encore au moment où il a été écrit.
- **Note de port Figma** : au premier essai, figma-console (MCP) était déconnecté côté outillage
  Claude Code ; l'owner a signalé un probable conflit de port. `figma_get_status` après reconnexion
  confirme : fallback propre 9223 → 9224 (une autre instance tournait sur 9223, pid 95644), fichier
  `Piqueray (Copy)` `d9FYAUcqdcNtsuaMgLefvJ` bien connecté, probe roundtrip OK (2 ms).
- **Actions appliquées** :
  1. `git mv BACKLOG-SPEC-006-figma-styles-structure.md BACKLOG-SPEC-007-figma-styles-structure.md`.
  2. Contenu annoté (pas réécrit en substance) : items 1 et 4 marqués ✅ FAIT avec leur reçu de
     vérification live ; item 2 marqué « probablement fait, non vérifié » ; items 3/5/6/7 laissés
     tels quels (aucune vérification faite dessus, aucun changement de statut).
  3. `specs/005-figma-source-cleanup/RAPPORT-CLOTURE.md` amendé : les deux mentions « Spec 006 »
     (points 5 et 6 de « Divergences ouvertes ») et le pointeur vers le fichier de backlog
     corrigés vers « Spec 007 » / `BACKLOG-SPEC-007-*.md` ; le point 5 (Section-header) annoté
     ✅ FAIT avec le même reçu que ci-dessus, en ajout (pas en réécriture de la ligne d'origine,
     barrée et conservée pour l'historique de lecture).
- **Verdict** : ✅ T006 fait. Cette spec garde le numéro 006, aucune contradiction avec FR-008 ne
  subsiste dans le dépôt, le pointeur ne devient pas orphelin. Item 2 (dé-GROUP ×11) et items 3/5/6/7
  restent une question ouverte pour qui reprend le backlog 007 — nommé, pas absorbé.

### T007 — `pages:selftest` avant extension (2026-07-26)

- `npm run pages:selftest` (worktree, aucun Figma requis) → **5/5 verts** : identical (exit 0),
  one-pixel (exit 1, diffCount 1, diffBox localisé), empty-capture (exit 2, refus nommé),
  dimension-mismatch (exit 2, refus nommé), determinism (deux runs → `verdict.json`/`verdict.md`
  byte-identiques). Reçu tel quel dans le terminal, aucun fixture modifié. L'instrument est vérifié
  avant que la Phase 3 (US2) lui ajoute les 2 cas `--regions` (5 → 7).

### T008 — Ligne de base ledger / format de verdict (2026-07-26)

- Lu `extract/figma/page-parity/README.md` et `specs/003-externalize-figma-components/contracts/page-proof.md`
  en entier. Confirmé : l'interface 003 (capture bridge live-only + comparaison Node pure,
  `PixelVerdict` par maquette, codes de sortie 0/1/2, 5 cas de selftest, ledger séparé et bloquant)
  est reprise **sans amendement** — c'est exactement la condition d'acceptation posée par
  `contracts/region-proof.md` §0 de cette spec pour le flag `--regions` (champs optionnels ajoutés
  **en fin** de `PixelVerdict`, absents ⇒ sortie byte-identique). Rien à modifier avant la Phase 3.

### T005 — Ligne de base des gates, checkout principal (2026-07-26)

Chaîne complète exécutée sur `/Users/dlstudio/.superset/projects/ds-contracts-poc` (`main`,
`cd438a5`) : `npm run build && npm run parity && npm run eval && npm run plugin:check &&
npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs &&
npx tsc --noEmit && npx tsc -p tsconfig.build.json` → **exit 0, tout vert, aucun rouge** (l'échappatoire
« hérité » de R12 n'a pas eu besoin d'être invoquée) :

- **build** : 5 composants générés (Button, Checkbox, Input, Select, Textarea).
- **parity** : *« No new drift — 2 acknowledged finding(s) remain in parity/baseline.json »* —
  `Primitives/color/rouge` (figma-ahead) et `assets/icons/close.svg` (icons-ahead), tous deux
  **pré-existants et déjà acquittés**, aucun n'est nouveau. Confirme R12 : parity est vert dès T005,
  comme attendu après la clôture 005 (zéro constat actif).
- **eval** : **108/108** verts, 49 cas legacy en quarantaine (compteur vivant confirmé — sert de
  référence pour T081/la resynchronisation finale des compteurs).
- **plugin:check** : tous les flux verts ; **4 flux sautés, nommés explicitement** — dépendances
  imbriquées par nom, ligne « new — will be created », composition de moteur empaqueté, parcours
  inverse pour un composite — chacun annoté *« Restore when Piqueray gains a composite »*. **006 est
  exactement ce composite** (T063 les débloquera).
- **deterministic-roundtrip** : vert, `ds.button@1.5.0`, byte-identique ×2 — mais l'en-tête natif du
  script porte déjà l'avertissement *« this proof runs on a FLAT component… until Piqueray has a
  composite »*, réceipt qui matérialise R23/T060 (re-pointage requis vers `ds.google-reviews`).
- **core-browser-check** : vert (barrel 11.82 MB brut / 5.16 MB minifié, 4 émetteurs en VM sans
  globals node).
- **tsc --noEmit** et **tsc -p tsconfig.build.json** : verts (aucune sortie = aucune erreur).

**Verdict** : ✅ T005 fait. Ligne de base 100 % verte consignée — tout rouge qui apparaîtrait plus
tard dans la suite de cette spec sera donc une régression 006 réelle, jamais du bruit hérité.

---

## Phase 1 (Setup) — clôturée (2026-07-26)

T001–T008 tous faits. Merge propre, gates 100 % verts, numéro de spec sécurisé, instrument de
page-parity vérifié 5/5 avant extension. Prêt pour la Phase 2 (Foundational) — re-scan positionnel
des 9 maquettes, extraction des octets natifs de l'aplat, sonde de plancher et STOP-GATE du seuil de
fidélité (T016, décision owner requise avant tout contrat).

---

## Phase 2 — Foundational

### T009 — Re-scan positionnel des 9 maquettes (2026-07-26)

- Structure fraîche confirmée en direct (`figma.loadAllPagesAsync()` + lecture des enfants de la page
  `Pages` `210:325`) : **9 frames**, ids identiques à ceux déjà connus de 003/005 (la page `Pages`
  elle-même n'a pas été restructurée par 005, seules les pages `DS · …` l'ont été) — Accueil `210:326`,
  Portes de garage `226:112`, Portes de garage résidentielles `230:376`, Portes de garage
  industrielles `387:720`, Motorisation `237:705`, Portes d'entrée `237:969`, Dépannage/SAV `249:1510`,
  À Propos `258:1887`, Contactez-nous `274:2464`.
- `extract/figma/page-parity/bridge/scan.js` exécuté **par position, jamais par nom** (FR-001), une
  fois par maquette (budget ~30 s/appel), POSTé vers un receveur local (`receiver.mjs`, port 9227,
  sortie scratch `.page-parity/scan-006/`, gitignoré) → 9 fichiers `scan-<maquette>.json` reçus,
  tailles 14-34 Ko chacun.
- Assemblage Node (`assemble-scan.mjs`) → `inventory/scan-2026-07-26.json` (commité) : 1 bloc classé
  (hero-et-categories), 23 `nonClasses` (dont les 8 candidats « Avis Google », honnêtement non
  classés faute de matcher pour ce bloc dans cet instrument hérité de 003 — jamais silencieusement
  perdus, principe V), 11 `introuvables`, 209 groupes de contenu-instance, 0 fragment interne.
- **Réemploi post-005 (seul reçu de FR-023)** : `Étoile` retrouvée sur `DS · Atomes` (`2053:1263`,
  `COMPONENT` simple, pas un set). `check` : **aucun nœud nommé exactement « check »** trouvé sur
  `DS · Tokens/Atomes/Molécules/Organisms` ni `Pages` — cohérent avec son statut de glyphe interne
  D7 sans master Figma dédié (même classe que `close.svg`, vu acquitté dans `parity/baseline.json`
  au gate baseline T005). Non creusé plus loin (hors périmètre d'un check ponctuel).

**Verdict** : ✅ T009 fait.

### T010 — Inventaire des occurrences (2026-07-26)

Depuis les `sectionCandidates` de T009, identification des GROUPs candidats par **signature
structurelle** (`group[rectangle,instance]`, ~1552 de large) — jamais par nom, bien que le nom Figma
coïncide (« Avis Google ») — puis lecture ciblée (lecture seule, `figma.getNodeByIdAsync` sur les 8
GROUPs identifiés) des deux enfants de chacun, avec **fills/imageHash lus sur les 8, pas 2** (FR-006) :
publié dans `inventory/occurrences.json`.

- **8 occurrences trouvées** — Accueil, Portes de garage, Portes de garage résidentielles, Portes de
  garage industrielles, Portes d'entrée, Dépannage/SAV, À Propos, Contactez-nous.
- **Motorisation : 0 occurrence** — aucun GROUP à cette signature. Conforme à FR-013 (témoin attendu
  à 0 pixel).
- **Zéro divergence trouvée, sur les 5 axes vérifiés** (à consigner explicitement — un résultat, pas
  une absence de résultat, FR-006) :
  - `imageHash` **identique sur les 8** : `ea17d86d938c8ea316f6e9a2f2e12ae3cb90cff2`.
  - `bboxAplat` identique sur les 8 : 1552×328.
  - `bboxGroup` identique sur les 8 : 1552×459.
  - `bboxSectionHeader` identique sur les 8 : **1550×83** — cohérent avec le fix FIXED→FILL du cycle
    14 déjà vérifié en direct lors du T006 (Accroche/Titre en FILL).
  - Structure identique : `group[rectangle,instance]`, même nom de calque aplat
    (`trustindex-google-reviews-widget`), même `mainComponentName` (`Section-header`) sur les 8.
- **Portée SC-001 confirmée au passage** (R25) : le scan T009 ne montre aucune trace résiduelle de la
  copie Accueil sur `DS · Organisms` — cohérent avec la vérification déjà faite en T006
  (`2121:5168` absent). Le relevé « 0 occurrence » à la clôture portera donc sur la page `Pages`
  **et** confirme qu'aucun écho ne traîne sur `DS · Organisms`.

**Verdict** : ✅ T010 fait. Aucune divergence à trancher en T011 — c'est un résultat à consigner, pas
un cas moyen (FR-006, US1 §4). T013 (portée SC-001) est de fait déjà répondu par ce même scan +
la vérification T006.

### T012 — Octets natifs de l'aplat (2026-07-26)

`extract/figma/page-parity/bridge/aplat-source.js` écrit (même patron que `bridge/capture.js` :
santé + nonce du receveur vérifiés avant tout octet, lecture seule stricte) puis exécuté sur
l'occurrence **Accueil** (`210:445`) — un seul suffit, les 8 occurrences partagent le même
`imageHash` (T010). `figma.getImageByHash('ea17d86…').getBytesAsync()` → POST vers `receiver.mjs`
(receveur redémarré, pointé sur `measures/`, nonce `769fd16c…`) → `measures/aplat-source.png`
(140 516 octets). Side-car `measures/aplat-source.json` calculé **côté Node** (jamais dans le
sandbox, pas de crypto là-bas) en lisant l'IHDR du PNG lui-même — **jamais `rect.width`**, qui ne
donne que la taille dessinée (1552) :

- **Résolution native : 2327 × 493 px** — `scaleFactor = 2327 / 1552 ≈ 1,4994` (~1,5×, cohérent
  avec une capture à densité 1,5x du widget avant mise à l'échelle FIT dans le cadre 1552 large).
- sha256 calculé et publié dans le side-car pour re-vérification par un tiers.

**Quatre découvertes en regardant l'image (pas seulement en la mesurant)** — receipts en crops
committés sous `/tmp` (non committés au dépôt, à recadrer proprement en Phase 2c si besoin d'un
reçu permanent) :

1. **T020 tranché par mesure directe : axe `note` À SUPPRIMER.** Les 5 étoiles de la barre-résumé
   ET les 5 lignes de notation des 5 cartes visibles sont **toutes 5/5, aucune partielle** (crop
   `/tmp/stars-strip.png`, ×3). Conforme à la branche préférée de R7 : 5 étoiles fixes, une limite
   nommée, zéro axe de variante, zéro produit cartésien. `ds.review-card` n'aura **pas** de prop
   `note`.
2. **CTA confirmé dans la barre-résumé** — un bouton bordé « Écrire un avis » (crop
   `/tmp/summary-strip.png`, ×2), à droite de « Google · Excellent · ★★★★★ 4,8 | 93 avis ». R5
   l'anticipait comme « CTA éventuel » sans certitude ; c'est confirmé réel. Dessiné en part
   (frame + texte), jamais un `component`-ref vers `ds.button` (R5).
3. **Flèches de carrousel confirmées** — un chevron gauche et un chevron droit, cerclés, posés en
   overlap sur les bords de la première/dernière carte (crops `/tmp/left-edge.png` /
   `/tmp/right-edge.png`, ×4). `montrerControles` doit donc être **`true`** dans le master (mesuré,
   pas supposé).
4. **⚠️ Hors schéma actuel — une PHOTO DE CONTENU attachée à un avis** (carte 5, « miguel
   martinez ») : une image (mur/porte de garage) accolée au texte de l'avis, **distincte** de
   l'avatar (qui reste une initiale minuscule « m », pas une photo, pour cette carte). Le modèle
   `ds.review-card` actuel (`data-model.md` §1) ne porte **que** `photo`/`photoUrl`/`photoAlt` pour
   l'**avatar** — aucune prop pour une photo de **contenu**. Ce fragment sera donc soit hors
   contrat (fidélité non portée pour cette carte précise, à nommer explicitement au rapport comme
   FR-015 l'exige), soit nécessite une extension de schéma — **question ouverte pour l'owner**,
   pas tranchée ici.
5. **Détail de transcription mineur** : l'initiale de la 5ᵉ carte est en **minuscule** (« m ») quand
   les 4 autres sont en majuscule (P, P, A, T) — à transcrire tel quel en T021 (FR-010, fidèle au
   visible), pas normalisé.

**Simplification majeure pour T021** : puisque les 8 occurrences partagent le même `imageHash`,
**il n'existe qu'un seul jeu réel de 5 avis à transcrire** (celui de cette image), pas huit
distincts — la transcription (T021) se fait une fois, le contenu est ensuite le même sur les 8
occurrences adoptées (fidèle à la source, qui est elle-même dupliquée à l'identique).

**Verdict** : ✅ T012 fait, avec un gain net d'information pour T015/T017/T020/T021 obtenu en
regardant l'image extraite, pas seulement en la mesurant au pixel.

### T014 — Jambe A construite (2026-07-26)

`extract/figma/aplat-parity/` créé, frère de `state-photo/` :
- `render.ts` — réutilise **verbatim** `chromiumExecutable` et `embeddedFontFaces` (nouvellement
  **exporté**, 1 ligne, depuis `visual-parity/render.ts` — jamais dupliqué) pour éviter toute
  régression silencieuse vers la police système (bug 2026-07-23 documenté dans le fichier source).
  Rendu à `deviceScaleFactor = scaleFactor` (natif, ~1,4994) — jamais un rendu à 1552-large
  rééchantillonné après coup.
- `run.ts` — CLI `probe --region x,y,w,h --html … [--css …] --label … --out …` : charge
  `measures/aplat-source.{png,json}`, recadre la région **native** (aucun rééchantillonnage),
  rend le HTML fourni à la taille CSS correspondante, diff via `alignPair`/`diffPair`/`writeTriptych`
  de `visual-parity/img.ts` (réutilisés, pas réimplémentés), **seuil `THRESHOLD_PCT` importé** de
  `visual-parity/tolerance.ts` et affiché à titre de rappel seulement (ce n'est pas le seuil de CET
  instrument — R3) : jamais de pass/fail codé en dur ici, la décision de seuil est T016, owner.
- `selftest.ts` — **2 fixtures**, PNG synthétiques en mémoire (pas de Chromium, pas de Figma) :
  prouve la plomberie crop+diff indépendamment du rendu réel. **2/2 verts.**
- `npm run aplat:run` / `npm run aplat:selftest` câblés dans `package.json`.

**Verdict** : ✅ T014 fait.

### T015 — Sonde de plancher de fidélité (2026-07-26)

Carte d'essai (« pho syster » — Accueil, occurrence de référence) rendue en Montserrat (police
réelle embarquée, jamais de substitution silencieuse) via `npm run aplat:run -- probe --region
17,95,451,391 --html … --css … --label card1-floor-probe --out
specs/006-google-reviews-block/measures/floor-probe`. Proportions (avatar, tailles de texte,
padding) estimées visuellement à partir du crop natif — **approximatif par nature, c'est une
sonde, pas la mesure finale** (T017 fera les deux lectures indépendantes par valeur).

**Résultat : 5,761 % de la région** (176 341 px = 451×391 natif, une carte), `diffCount` 10 159.
Triptyque : `measures/floor-probe/card1-floor-probe.triptych.png` (envoyé à l'owner).

**Plus bas que l'estimation pessimiste de `research.md` R3 (8-12 %)** — dès une première
approximation non affinée. Le triptyque montre un alignement de mise en page très proche
(positions du nom/date/étoiles/texte quasi superposées) ; le résidu visible est dominé par :
- l'anti-aliasing des bords de glyphes (rendu de police différent malgré la même famille
  Montserrat — attendu, c'est exactement ce que R3(b) prédit) ;
- un artefact de bord : le crop de la carte 1 mord légèrement sur la flèche de carrousel gauche
  (visible en haut-gauche du triptyque), que la carte d'essai ne dessine pas — un biais du crop de
  sonde, pas un vrai écart de carte ; à re-mesurer avec un crop plus serré si besoin en Phase 4b.
- le petit logo « G » multicolore dont le tracé SVG de la sonde diffère légèrement du logo réel.

**Verdict** : ✅ T015 fait. Chiffre publié à l'owner — **T016 (décision de seuil) est un STOP-GATE
et reste à trancher explicitement**, cette entrée ne fait que rapporter la mesure.

### T016 — STOP-GATE owner : décision de seuil (2026-07-26)

**Décision (owner)** : seuil retenu = **≤ 9,76 %** de la bbox de l'aplat (plancher mesuré T015 :
5,761 % sur une carte, **+ 4 points de marge** décidés par l'owner pour couvrir ce que la sonde à
une carte n'exerce pas — logo Google multicolore, CTA « Écrire un avis », flèches de carrousel).

Les quatre éléments requis par le protocole (`tasks.md` T016, `research.md` R3) :

1. **Dénominateur** : bbox de l'aplat = **1552 × ~328 ≈ 509 056 px** — publié ici à côté de celui
   du `GROUP` entier (**1552 × 459**) pour qu'aucun des deux ne puisse être accusé d'avoir été
   choisi pour flatter le rapport. FR-016 utilise le premier, jamais le second.
2. **Seuil retenu** : **9,76 %** (5,761 + 4, arithmétique explicite, aucun arrondi caché). S'applique
   par occurrence, sur la région (jamais sur la page entière — R3(a) : 2 % de page autoriserait
   26 à 46 % de bloc faux selon la maquette).
3. **Deux fidélités séparées** : **structurelle** (boîtes, positions, comptes, couleurs —
   mesurable, verrouillable par le contrat) et **raster** (rastérisation des glyphes, dominée par
   la substitution de police Montserrat/Trustindex — conséquence assumée de la gouvernance, pas un
   défaut à corriger). Le rapport final (T079) séparera les deux plutôt que de publier un seul
   chiffre agrégé.
4. **Règle 005 doublée + renforcement owner** : chaque exécution future (jambe A en convergence
   T040, jambe C par occurrence T049-T056) **écrit son écart attendu avant de s'exécuter** ; un
   écart plus petit que prévu est tout aussi suspect qu'un plus grand. **Renforcement explicite de
   l'owner (cette session)** : **l'owner revoit et valide personnellement le triptyque** — pas
   seulement le chiffre — chaque fois que l'écart mesuré dévie de **plus de 4 points** par rapport
   à l'écart annoncé à l'avance, dans les deux sens. Ce n'est pas une automatisation qui décide à sa
   place : c'est un déclencheur qui dit *quand* solliciter sa revue, jamais un remplacement.

**Reporté dans `spec.md`** : FR-016 et SC-004 portent désormais `9,76 %` explicitement (plus un
seuil générique « décidé »), plus une entrée `## Clarifications § Session 2026-07-26` — condition
posée par le protocole pour que SC-004 soit vérifiable à la clôture (T086) sans dépendre d'une
lecture croisée de ce journal.

**Verrou levé** : T016 était le verrou dur n°2 (« pas de contrat écrit contre un seuil non décidé »)
— la Phase 3 (US2, instrument) et la Phase 4a (contrats T031+) peuvent démarrer.

---

### T019 — Replis R10 appliqués (2026-07-26)

Déjà appliqués en ligne dans `measures/mesures-aplat.md` (T017) et `measures/faisabilite-canaux.md`
(T018) plutôt que dans une passe séparée — les deux chiffres (mesuré vs gouverné) sont publiés à
chaque alignement, jamais un seul :
- **Ombre → séparation par couleur** : `box-shadow` confirmé absent des deux registres (vérifié
  par le code en T018, pas supposé) → carte `{color.blanc}` sur fond de section `{color.bleu-clair}`
  (#F4F6FA). Aucune ombre revendiquée.
- **Rayon court** → `literals: {"border-radius": "8px"}` (repli tenu, `border-radius` **est** dans
  `LITERAL_CHANNELS`).
- **Gris neutres** → `#000000` (auteur/témoignage) et `#8A8A8A` (date) restent en `literals` : les
  deux Δ vs `{color.noir}`/`{color.bleu-gris}` sont publiés dans `mesures-aplat.md` et jugés **trop
  visibles** pour un alignement — décision de gouvernance explicite, pas une mesure qui aurait
  "raté" un token.
- **Espacements hors échelle** → `gap ≈ 8,7px CSS`, hors `{0,4,10,16,32}` (le plus proche, 10, à
  Δ1,3px) → `literals`.
- **Troncature multi-lignes** → confirmée refusée par le code (`-webkit-line-clamp` absent des deux
  registres) → transcription exacte de ce que le widget a déjà tronqué (T021).

**Verdict** : ✅ T019 fait (par construction, dans T017/T018 — aucune nouvelle impasse trouvée).

### T020 — Axe `note` : décision formelle (2026-07-26)

**Décision** : `note` **n'existe pas** dans `ds.review-card`. Tranché par mesure directe dès T012
(pas seulement supposé) : les 5 cartes visibles et la barre-résumé affichent **5/5 étoiles pleines,
aucune partielle** (`stars-strip.png`, `summary-strip.png` — zoom ×3/×2, comptage sans ambiguïté).
Conforme à la branche préférée de R7. Conséquences pour le contrat (T031-T033) :
- 5 parts `icon{asset:"star", size:…}` fixes dans `ds.review-card`, **aucun axe de variante**.
- `ds.google-reviews` garde son `repeat{itemsProp:"avis", …}` **sans repli R8** (le repli
  « instances frères explicites » ne s'applique pas — condition « notes hétérogènes » non remplie).
- Limite nommée (déjà dans `data-model.md` point 2) : notes < 3 et demi-étoiles resteraient
  inexprimables **si** jamais rencontrées ailleurs dans les 93 avis réels — non pertinent pour les
  5 avis échantillon adoptés ici, mais à rappeler au rapport final (T073/T074).

**Verdict** : ✅ T020 fait.

### T021 — Transcription du contenu réel (2026-07-26)

Une seule source (les 8 occurrences partagent l'`imageHash, T010). Transcription en deux passes
(première lecture puis relecture sur crops zoomés ≥4×, `card1-full.png` et crops équivalents pour
les cartes 2-5) :

**Barre-résumé** : `noteGlobale` = « 4,8 » · `volume` = « 93 avis » · label = « Excellent » ·
CTA = « Écrire un avis ».

**Carte 1** : auteur « pho syster » · initiale « P » (majuscule) · date « il y a 2 mois » ·
témoignage « super très pro et service après vente présent » · vérifié : oui.

**Carte 2** : auteur « Petit Nicole » · initiale « P » · date « il y a 3 mois » · témoignage
« Je vous envoie mon message un peu tardivement car problème de boite mail. Super ravie du travail
réalisé… » (**tronqué par le widget avec « Lire la suite »** — ellipse `…` transcrite telle
quelle, contenu au-delà **non accessible dans l'aplat**, `confiance: sûre` pour la partie visible,
`illisible` pour la suite non affichée) · vérifié : oui.

**Carte 3** : auteur « Aun Bukhari » · initiale « A » · date « il y a 4 mois » · témoignage
« Travail propre, soigné, ouvrier expert dans son métier, super suivi par Wael (technicien
installation) qui est à fait le suivi… » (**tronqué**, « Lire la suite ») · vérifié : oui ·
**confiance douteuse sur « qui est à fait le suivi »** — tournure qui se lit comme une coquille du
rédacteur original (« qui a fait le suivi » attendu grammaticalement) ; **transcrite verbatim, pas
corrigée** (FR-010 : fidèle au visible, pas au caractère « correct »). Un petit badge orange
partiellement visible en bas-droite de l'avatar (insigne Google distinct du check de vérification)
**non identifié avec certitude** — `illisible`, signalé plutôt que deviné.

**Carte 4** : auteur « Thierry Picard » · initiale « T » · date « il y a 5 mois » · témoignage
« Dépannage ultra rapide et professionnel » (texte court, **non tronqué**, pas de « Lire la
suite ») · vérifié : oui.

**Carte 5** : auteur « miguel martinez » · initiale « m » (**minuscule — transcrite telle quelle,
diffère des 4 autres cartes en majuscule**, FR-010) · date « il y a 6 mois » · témoignage
« Je ne mais pas 5 étoiles mais 10 les 2 placeurs de mes 2 portes de garage il… » (**tronqué**,
**confiance douteuse sur « Je ne mais pas »** — probable coquille pour « Je ne mets pas », transcrite
verbatim) · **photo de contenu attachée** (mur/porte de garage, distincte de l'avatar — voir T012,
point ouvert schéma) · vérifié : oui.

**Règles de transcription appliquées** : ellipses finales des avis tronqués **conservées telles
quelles** (le widget les a déjà posées, jamais recomposées) ; deux fragments marqués
`confiance: douteuse` (coquilles apparentes du texte source, transcrites sans correction) ; un
élément marqué `illisible` (badge partiel carte 3) — **aucun des trois comblé en silence**.

**Verdict** : ✅ T021 fait — relu en seconde passe par la même session (limite de méthode nommée en
tête de `mesures-aplat.md` : pas une seconde personne, un second passage indépendant sur les crops).
**Seconde passe exécutée concrètement** : cartes 2/3/4/5 recadrées individuellement à 2×
(`/tmp/card{2,3,4,5}-full.png`) et relues séparément de la première lecture (faite sur la vue
d'ensemble) — **aucune correction nécessaire**, transcription confirmée caractère pour caractère
sur les 4 cartes. Bonus de la relecture : le badge partiel carte 3 se lit maintenant plus
clairement comme un petit badge étoile/étincelle orange en surimpression (probable indicateur
« Contributeur Local » Google) — **toujours pas identifié avec certitude suffisante pour l'affirmer**,
reste `illisible` au sens de la règle de transcription.

### T022 — Avatar photo : premise corrigée, rien à recadrer pour cette adoption (2026-07-26)

**Constat qui corrige `data-model.md`/R6** : R6 anticipait « 4 initiales + 1 photo » comme fait
mesuré probable. La mesure réelle (T012, confirmée en T021) montre **5 initiales, 0 photo
d'avatar** parmi les 5 avis échantillon. La seule photo présente dans l'aplat est **attachée au
contenu de l'avis** (carte 5), pas à l'avatar — un concept différent, non porté par
`photo`/`photoUrl` (qui restent des props d'**avatar**).

**Conséquence** : aucune des 8 occurrences adoptées n'exercera `photo:true` — toutes les 5 cartes de
chaque occurrence utiliseront `initialeVisible:true`. **La capacité avatar-photo reste dans le
contrat** (modélisation valide et utile : les 93 avis réels du widget peuvent en compter d'autres
hors échantillon, et la démo US4/T071 doit de toute façon exercer `photo:true` avec un exemple
fabriqué) — mais **rien n'est recadré ici** faute de photo d'avatar réelle à recadrer. `measures/
avatar-photo.png` **n'est pas créé** : il n'y a pas de source pour lui.

**Verdict** : ✅ T022 traité — prémisse corrigée et publiée plutôt que forcée. Le trou A5 (rendu
canevas de l'avatar photo) reste ouvert indépendamment (R6), sans rapport avec cette correction.

### T023 — Déclaration d'inapplicabilité du ledger côté aplat (2026-07-26)

Conforme à R21 : l'état « avant » de chaque occurrence est un **unique `RECTANGLE`** (zéro nœud
texte, zéro propriété, zéro personnalisation détectable par position). `bridge/customizations.js`
renverra honnêtement `entrees: []` pour les 8, et `pages:ledger:check` sortira **vert** — un vert
qui **n'atteste rien** au-dessus d'un contenu qui sera *transcrit* (T021), pas *préservé*.

**Déclaration** : le relevé de transcription (`measures/transcription-*.md` — voir T021 ci-dessus,
consolidé dans ce même journal plutôt qu'en fichiers séparés par maquette puisque les 8 partagent un
contenu source identique) **remplace** le ledger comme preuve de fidélité côté aplat.
`ledger/google-reviews.json` sera néanmoins rempli **à la main** en Phase 4d (T059), au format 003,
pour deux choses que `customizations.js` ne verra jamais : le contenu imbriqué des cartes (angle
mort documenté de l'outil) et les 8 fills photo (T057) — **c'est la seule sauvegarde rejouable** si
un amend du master devenait inévitable après la première adoption (R19 règle 2).

**Verdict** : ✅ T023 fait — déclaration publiée avant toute adoption, pas après coup.

---

## Phase 3 — US2, instrument de preuve armé (2026-07-26)

### T024-T028 — Flag `--regions`, additif (2026-07-26)

- `cli.ts` : flag `--regions <fichier.json>` optionnel, parsing additif, arg inconnu ⇒ toujours
  exit 2 (comportement 003 inchangé). Format lu : `{maquette: {x,y,w,h}}`, JSON malformé ou entrée
  invalide ⇒ refus nommé, jamais un défaut silencieux.
- `compare.ts` : `Region` exporté, `CompareEntryInput.region?` (optionnel), `PixelVerdict` gagne
  **4 champs en fin** (`region`, `regionDiffCount`, `regionPct`, `outsideDiffCount`) — **un seul**
  `pixelmatch` pleine planche comme avant, `countRedInRect` relit le **même** bitmap de diff
  (jamais un second diff). Calculé pour `identical` **et** `diff` (pas seulement `diff`).
- `report.ts` : les 4 colonnes n'apparaissent dans `verdict.md` **que si** au moins une entrée
  porte une région (vérifié : sans région, tableau identique à avant). Triptyque cadré
  `région ∪ diffBox padded` (nouveau `unionRect`, clampé aux bornes de l'image — pas une
  ré-alignement, juste une fenêtre fixe plus large, R2 respecté).
- `selftest.ts` : **7/7** (5→7). `region-inside`/`region-outside` réutilisent la paire `one-pixel`
  existante avec deux rectangles différents (aucun PNG nouveau). **Identité byte (T028) intégrée
  au cas `one-pixel`** : assertion explicite que `verdict.json` sans `--regions` ne contient
  **aucune** des 4 clés nouvelles — `determinism` (byte-identique, 345B/335B, **inchangé**) continue
  de passer sans modification.
- `README.md` : compteur 5→7 mis à jour (§2 layout + §9).

### T029 — Éval `pages-compare-regions-additive` — VÉRIFIÉE, pas seulement écrite (2026-07-26)

**Correction importante** : `CLAUDE.md`/`research.md` R15 documentent que `npm run eval` « ne peut
pas tourner dans un worktree » (symlink vers `ROOT/node_modules`, absent dans un worktree neuf).
L'owner a challengé cette affirmation en session — **vérifié empiriquement plutôt que supposé** :
`npm run eval` **tourne parfaitement dans CE worktree** et produit un résultat correct. Explication
la plus probable : T002 (Phase 1) a déjà fait un **vrai** `npm install` ici, donc
`symlinkSync(ROOT/node_modules, SCRATCH/node_modules)` pointe vers un `node_modules` réel et non
vers du vide — la contrainte documentée suppose un worktree **sans** dépendances installées, pas un
worktree en général. **Correction consignée ici plutôt que silencieusement acceptée** : pour la
suite de cette spec, `npm run eval` peut tourner **directement dans ce worktree**, plus besoin de
naviguer vers le checkout principal à chaque vérification (T005 et les prochaines volées T069/T086
peuvent donc aussi tourner ici — à confirmer que ça reste vrai, mais rien n'indique le contraire).

**Résultat réel** : `npm run eval` → **109/109 passed** (108 existants + 1 nouveau), 49 legacy
inchangés. Le nouveau cas (`evals/run.ts`, claim `C1-determinism`, ré-utilise les fixtures
`extract/figma/page-parity/fixtures/one-pixel/` déjà committées, copiées dans le scratch via le
répertoire `extract/`) vérifie exactement les 3 assertions demandées : (1) un run **sans**
`--regions` ne porte aucune des 4 clés région dans son JSON brut (identité byte) ; (2) `region-inside`
→ `regionDiffCount 1`/`outsideDiffCount 0` ; (3) `region-outside` → `regionDiffCount 0`/
`outsideDiffCount 1`. `npx tsc --noEmit` vert avant l'exécution (aucune erreur de type).

### T030 — Side-cars de région générés (2026-07-26)

`specs/006-google-reviews-block/proofs/<maquette-slug>/region.json` × 8 **+** un side-car combiné
`proofs/regions-all.json` — générés **par script** depuis `inventory/occurrences.json` (T010),
**jamais saisis à la main** (FR conformité). Coordonnées converties de l'espace canevas absolu vers
l'espace **relatif à la frame capturée** : `region.x = bboxAplat.x - frameBounds.x` (les 9 frames
sont alignées à `y=0`, seul `x` diffère par frame, confirmé depuis les 9 `scan-*.json` de T009).
Slugs de dossier alignés sur ceux déjà utilisés par `tasks.md` T049-T056 (`accueil`,
`portes-de-garage`, `portes-de-garage-residentielles`, `portes-de-garage-industrielles`,
`portes-d-entree`, `depannage-sav`, `a-propos`, `contactez-nous`).

## Phase 4a — Contrats, glyphe, chaîne de génération (2026-07-26)

### T031-T035 — Les deux contrats + le glyphe (2026-07-26)

`contracts/review-card.contract.json` (`ds.review-card`, molecule, 9 props, **pas d'axe `note`**
— T020) et `contracts/google-reviews.contract.json` (`ds.google-reviews`, section, `repeat`+
`component` vers `ds.review-card`, `avis` en `arrayOf` `figma.kind:'NONE'`). `anchors.figma.fileKey`
renseigné dès ce commit sur les deux (R18). Aucun `component`-ref vers `ds.button` (R5) : flèches
carrousel + CTA « Écrire un avis » dessinés en parts. `assets/icons/google.svg` (glyphe D7, hors
registre) + `google.NOTICE.md` (note de marque).

**Corrections apportées pendant l'écriture, par rapport à `data-model.md`** (nommées, pas glissées
en silence) :
- Le prop `qualificatif` (« Excellent ») n'existait pas dans le plan initial — ajouté à
  `ds.google-reviews`, mesuré sur l'aplat (T012).
- La part `verification` de `ds.review-card` n'a **aucun libellé texte** (l'anatomie initiale en
  supposait un) — corrigée en icône seule, conforme à la mesure (T021).
- Couleur de fond de la pastille-initiale : **fixe et gouvernée** (`{color.bleu-gris}`), pas par
  review — capacité non prouvée dans ce schéma (aucun canal ne lie une couleur CSS à un texte libre
  par item d'un `repeat`) ; limite nommée dans la description du contrat, même classe que l'étoile.
- Flèches de carrousel modélisées comme enfants flex adjacents (pas un overlay/absolu) — l'aplat les
  montre en léger chevauchement des bords ; simplification nommée, à raffiner en convergence (T040)
  si l'écart mesuré le justifie.

**Deux erreurs de schéma trouvées et corrigées immédiatement par le retour du validateur** (pas
supposées a priori) : (1) une prop `text` `required:true` DOIT quand même porter un `default`
(canvas default + story sample) — `auteur`/`texte` corrigés ; (2) les noms de part sont **uniques
sur tout l'arbre**, pas seulement par parent — les deux flèches avaient chacune une part `icone`,
renommées `iconeGauche`/`iconeDroite`.

**Verdict** : ✅ T031-T035 faits.

### T036-T037 — Chaîne complète + purge des orphelins (2026-07-26)

`npm run build` → **7 composants générés** (Button, Checkbox, GoogleReviews, Input, ReviewCard,
Select, Textarea — 5→7). `npm run figma:plan` → ordre de dépendances confirmé **exactement** :
`02-button, 03-checkbox, 04-reviewcard, 05-googlereviews, 06-input, 07-select, 08-textarea` (+
`01-tokens`, `batch-01`). `npm run catalog` (7 composants) + `npm run verify:catalog` (7 shards
identiques) verts. 6 orphelins prédits par R13 **exactement confirmés** sur disque
(`03-input.js`, `04-input.js`, `04-textarea.js`, `05-select.js`, `05-textarea.js`, `06-textarea.js`)
→ `git rm`, puis `npm run golden:update` (42 fichiers) + `npm run parity` : **0 nouvelle dérive**, 2
constats acquittés pré-existants inchangés, **+ 2 nouveaux constats honnêtes** `[figma PENDING]
GoogleReviews`/`ReviewCard` — « pending first sync, not drift » — exactement l'état attendu avant
la première poussée canevas (Phase 4c).

**Verdict** : ✅ T036-T037 faits.

### T038-T039 — Validation à blanc + garde-fou fileKey (2026-07-26)

`DSC.planGenerate([ds.review-card, ds.google-reviews], {withTokens:true})` → 5 steps (`tokens`,
`component:ds.review-card`, `version-marker:ds.review-card`, `component:ds.google-reviews`,
`version-marker:ds.google-reviews`) — **ordre de dépendance correct** (la carte avant la section
qui l'imbrique, prembattre composite du dépôt). **Les 5 exécutés sans erreur** contre
`plugin-engine-mock-figma.mjs` (pattern repris de `plugin-engine-check.mjs` : bundle réel dans un VM
`window` + mock `figma`, jamais réinventé). Marqueurs `ds_contracts/contractId` confirmés présents
pour les deux contrats après génération. `"d9FYAUcqdcNtsuaMgLefvJ"` confirmé présent **exactement 1
fois** dans chacun des 2 scripts émis (R18, garde-fou armé).

**Verdict** : ✅ T038-T039 faits. **Phase 4a (contrats) fermée** — la Phase 4b (jambe A, convergence
avec les VRAIS contrats) peut commencer.

## Phase 4b — Jambe A, convergence avec les vrais contrats (2026-07-26)

### T040 — Boucle de convergence (2026-07-26)

**Rendu via `core/emit-html.ts`** (`emitHtml(contract, {tokens, icons, contracts})`, assemblage
manuel du contexte — pas la machinerie `visual-parity/compose.ts`, conçue pour des sujets de dump
Figma ; un contrat authored n'a besoin que de l'inventaire de tokens + la map d'icônes + la map des
contrats). Extraction du premier item de showcase, rendu via `aplat-parity/render.ts` au
`deviceScaleFactor` mesuré, diffé contre `measures/aplat-source.png` **en entier** (`--region
0,0,2327,493`) — première fois que la jambe A compare le **bloc complet**, pas une seule carte.

**Historique honnête de la convergence (rien lissé)** :

1. **Contenu échantillon générique** : 6,843 %.
2. **Contenu réel substitué pour la mesure** (jamais committé) : 7,377 % — plus haut, pas plus bas :
   le texte réel est plus long, plus de glyphes à substituer en police.
3. **Trouvaille en regardant l'image** (pas juste le chiffre) : un lien « Lire la suite » existe sur
   le widget réel sous les avis tronqués, absent de mon modèle → ajout d'une prop `tronque`
   (booléenne) + une part `lireLaSuite` (visibleWhen) à `ds.review-card`, propagée dans l'`arrayOf`
   de `ds.google-reviews`. Reconverge à 7,313 %.
4. **L'owner repère un vrai défaut que j'avais raté** : la carte 1 (texte court) rend visiblement
   plus étroite que les cartes 2-5 — mon script de détection de gouttières le confirmait déjà
   silencieusement (aucune gouttière trouvée dans le rendu, contrairement au réel) mais je n'avais
   pas regardé l'image assez attentivement pour le voir moi-même.
5. **Diagnostic** : `layout.grow` ne s'applique **jamais** à la racine d'un contrat
   (`core/emit-react.ts` saute explicitement le root de la boucle qui pose `flex: 1 1 auto`) **et**
   une part `component`/`repeat` ne génère aucun CSS de wrapper côté parent (« instances style
   themselves via their own contract ») — et même si `grow` s'appliquait, `flex: 1 1 auto` garde une
   base de contenu (`auto`), jamais `flex-basis: 0` : ça ne forcerait pas des largeurs égales entre
   cartes de contenu différent.
6. **Vérification demandée par l'owner AVANT tout contournement** (règle désormais gravée dans
   `CLAUDE.md` — « the prior-art rule ») : agent de recherche dépêché sur `docs/reference/demo-archive/`
   (51 contrats démo) — confirme **0/51 n'a jamais utilisé `repeat`** (trou de capacité réel,
   premier `repeat`+`component` du dépôt) **et** que le seul précédent d'égalité de taille dans
   l'archive (`ds.avatar-group`) utilise **exactement** la même technique que celle envisagée : une
   largeur **fixe, mesurée**, sur la racine du composant enfant lui-même.
7. **Correctif appliqué** : `literals.width: "282px"` sur la racine de `ds.review-card` — calculé
   `(1552 - 2×16 padding root - 2×28 flèches - 6×9 gaps) / 5 = 282px`, limite nommée dans la
   `description` de la part (à recalculer si gap/flèches changent — pas une vraie grille, le schéma
   n'en a aucune notion). **Reconverge à 7,250 %**, largeurs visuellement égales confirmées sur le
   triptyque.

**Aucun changement moteur** : le vrai correctif (grille/flex-basis:0 pour les collections
répétées) part au backlog avec ce reçu, comme R5/R13 l'ont déjà fait pour d'autres trous — cohérent
avec Constitution VII (`core/` non modifié).

**Résidu final compris et nommé** : substitution de police (dominant, R3) ; couleur d'avatar fixe
(`{color.bleu-gris}`) vs 5 teintes réelles différentes ; photo de contenu carte 5 hors contrat
(A5-adjacent, pas le même trou que l'avatar photo mais même famille) ; petites variations de hauteur
de carte selon la longueur du texte (largeur maintenant égale, hauteur reste "hug content" — cohérent
avec l'aplat qui a aussi une légère variation, non chiffrée précisément).

**Verdict initial (revu ci-dessous, PAS la version finale)** : 7,250 %, sous le seuil de 9,76 %
(T016) — mais l'owner a repéré, sur un crop qu'il a zoomé lui-même, deux défauts réels que je
n'avais pas vus en me fiant au chiffre agrégé et à une vue d'ensemble trop compressée. **Leçon
retenue telle quelle, verbatim** : « plus jamais tu me dis c bon qd t analyse pas ce genre de
probleme » — le pourcentage seul ne suffit JAMAIS, chaque convergence doit être vérifiée par crops
zoomés avant toute déclaration de "ça converge".

### T040 (suite) — Deux défauts réels trouvés par l'owner, corrigés (2026-07-26)

**Défaut 1 — décalage vertical sévère** : le contenu de mes cartes démarrait ~100px plus bas que le
vrai (confirmé par balayage ligne à ligne : à y=36-78 le vrai aplat affiche déjà le texte de la
barre-résumé, mon rendu est encore à 0 ; à y=102/123 l'avatar réel est déjà peint, le mien pas
commencé). **Cause racine mesurée** via Playwright `getBoundingClientRect()` (jamais deviné cette
fois) : la carte 2 (avis long + « Lire la suite ») rendait à **262px de haut**, mais la rangée de
cartes ne disposait que de **221px** (328 racine − 16 padding-top − 59 résumé − 16 gap − 16
padding-bottom) → **débordement de 41px hors du conteneur à hauteur contrainte** (R20). Corrigé en
resserrant `ds.review-card` : padding 20px→12px, gap interne 14px→6px — carte 2 tient maintenant à
**214px** dans les 221px disponibles, mesuré après coup (pas juste espéré).

**Défaut 2 — boîtes invisibles** : `background-color: {color.blanc}` sur une section dont le fond
racine est **aussi** blanc (correction du défaut de couleur ci-dessus) rend la barre-résumé ET
chaque carte **totalement invisibles** — même couleur des deux côtés, aucune bordure, `box-shadow`
refusé (aucun canal). Sur l'aplat réel, la séparation est un dégradé d'ombre douce (confirmé par
balayage de bord pixel-par-pixel des deux côtés d'une arête de carte : transition lisse
`#ffffff → #f0f0f0 → #ffffff` sur ~15px, signature d'un flou gaussien, pas une ligne nette).
**Repli** : bordure fine 1px `{color.bleu-clair}` sur la racine de `ds.review-card` ET sur `resume`
— seul canal disponible qui approxime visuellement une limite de boîte. Constat : l'émetteur rend
cette combinaison `border-width`+`border-color` en `box-shadow: … inset` en interne (technique CSS
équivalente, sans rapport avec le refus de `box-shadow` **arbitraire** posé en littéral — ce refus
concerne les auteurs de contrat, pas le choix d'implémentation interne de l'émetteur pour un
border).

**Correction du fond de section (trouvaille annexe, avant les deux ci-dessus)** : R10 avait décidé
`{color.bleu-clair}` comme fond de section pour séparer visuellement carte/fond (repli du
box-shadow refusé). Mesure directe (patch aux quatre coins + bords) : le fond réel est blanc/quasi
blanc (#F8F9FA-#FFFFFF, bruit de compression), **pas teinté bleu** — décision R10 corrigée : fond
`{color.blanc}` partout, aucune séparation de couleur (cohérent avec la découverte de l'ombre douce
ci-dessus — c'est la VRAIE raison pour laquelle aucune couleur de séparation n'était nécessaire).

**Reconvergence finale : 7,253 %** — quasiment inchangé numériquement malgré deux vrais bugs
structurels corrigés, ce qui confirme que la substitution de police domine largement le compte de
pixels brut (comme prédit par R3(b), 8-12% rien que pour ça) et que **le pourcentage seul est un
mauvais signal pour juger la qualité du layout** — exactement ce que l'owner reprochait. Vérifié
visuellement côte-à-côte (`side-by-side-v7.png`, envoyé à l'owner) : structure, proportions,
bordures, largeurs, hauteurs toutes visiblement cohérentes avec le réel désormais ; les seuls
écarts restants sont les limites déjà nommées (police, couleur d'avatar fixe, photo de contenu hors
contrat).

### T040 (3ᵉ passe) — Revue owner sur crops zoomés : 11 défauts, 8 réels (2026-07-26)

L'owner a zoomé lui-même dans le triptyque et refusé le verdict précédent (« c'est honteux »,
« rien n'est centré en hauteur »). Revue à l'œil demandée puis liste établie ; **2 de mes 11 points
étaient de fausses alertes**, mesurées comme telles avant de toucher au contrat (nom 116×23 px
d'encre des DEUX côtés, étoiles 132 vs 135 px : tailles déjà exactes — rien changé, dit plutôt que
« corrigé » à tort).

**Les 8 vrais défauts, tous corrigés** :
1. **Initiale hors du cercle, minuscule, en haut à gauche.** Cause d'émetteur : `isStructural()`
   (`core/emit-react.ts:223`) exclut toute part portant du `content`, donc le `layout
   {align:center,justify:center}` de la pastille était **jeté**. Contournement contrat-only : le
   texte descend dans une sous-part `initialeTexte`, la pastille devient structurelle et centre.
2. **Logo « G » absent de chaque carte** → part `marque` ajoutée en haut à droite de l'entête.
3. **Badge « vérifié » seul en bas de carte** → déplacé dans la rangée `notation`, juste après la
   5ᵉ étoile (mesuré ainsi sur l'aplat), via un sous-groupe `etoiles` pour garder un gap serré
   entre étoiles et un gap plus large avant le badge.
4. **Nom de l'auteur pas en gras** → `{font.weight.semibold}`.
5. **Carte trop courte / rien aligné en hauteur** → `min-height` mesuré + `align: stretch` sur la
   rangée (les cartes de contenu inégal se décalaient en escalier avec `center`).
6. **Wordmark « Google » manquant** dans la barre-résumé (seul le logogramme y était) → nouvel asset
   `assets/icons/google-wordmark.svg` (glyphe interne D7). `icon.size` **omis volontairement** : il
   force width=height (`emit-react.ts:1108`) et écraserait un glyphe non carré.
7. **Séparateur « | » absent** entre note et volume → ajouté, et **sorti du groupe `notation`**
   (dedans il héritait du gap 2px et restait collé au « 4.8 »).
8. **« 4,8 » → « 4.8 »** (point, mesuré).

### T040 (4ᵉ passe) — Géométrie horizontale : le vrai blocage, résolu (2026-07-26)

Mesure au pixel après les 8 correctifs : **cartes décalées de 42 px natifs vers la droite** (réel
x=16, moi x=58) et **15 CSS trop étroites**. Cause unique : les deux flèches de carrousel étaient
**dans le flux** et consommaient 72 px, alors que sur l'aplat elles **chevauchent** les cartes
(flèche gauche x=0→46, carte 1 démarrant à x=16 : 30 px de recouvrement).

**Trois mécanismes de superposition examinés, tous vérifiés dans le code, aucun utilisable** :
- `stylesWhen` (`position`/`left`/`transform`/`z-index` **sont** dans `STYLES_WHEN_ALLOWED`) — mais
  déclaré « Canvas v1: not represented » : **code-only**.
- `layout.overlap` — le commentaire de `emit-react.ts` promet « the canvas side uses negative
  itemSpacing », mais **0 occurrence de `overlap` dans `core/emit-figma-script.ts`** : non
  implémenté côté canevas, donc **code-only aussi**.
- `margin-*` : absent des deux registres de canaux.

J'ai d'abord proposé de **retirer les flèches** (géométrie exacte contre deux chevrons décoratifs) —
**refusé par l'owner** (« on ne retire rien »), qui a demandé la structure 3 colonnes et suggéré
translateX / marge négative. Solution retenue, sans absolu ni marge négative et **identique sur les
deux surfaces** : structure 3 colonnes `[flèche][groupeCartes grow][flèche]` où **le conteneur de
flèche a une largeur nulle** (`width:0`, `min-width:0`) et la pastille interne porte un
`min-width:30px` — le conteneur ne consomme aucune largeur de rangée, la pastille déborde
symétriquement de part et d'autre du bord, exactement comme le chevauchement réel.
⚠️ Sans le `min-width` sur la pastille, `flex-shrink` l'écrase à zéro et **la flèche disparaît** —
constaté à l'itération précédente, corrigé.

**Résultat mesuré** : bords de cartes réel 16 / 461 / 476 → rendu **16 / 463 / 477** (1-2 px).

### T040 (5ᵉ passe) — Typographie du DS + CTA (2026-07-26)

Consigne owner : « pour les typos reprends celle du DS même si pas les mêmes ». Trois textes
(`separateur`, `volume`, le libellé du CTA) **n'avaient aucune `font-family`** et rendaient donc en
**police à empattements de repli** — défaut bien visible au zoom sur le bouton. Tous les textes des
deux contrats passent désormais par les tokens du DS : `{font.family.montserrat}`,
`{font.weight.*}`, `{font.size.14|16|18}`. Les tailles 13 et 15 mesurées sur l'aplat **n'existent
pas dans l'échelle du DS** (14/16/18/20/24/32/40/48) : arrondi à la valeur du DS, écart de fidélité
assumé sur consigne explicite de l'owner. `line-height` reste en `literals` (le DS n'a qu'un seul
token, 22px, qui ne convient à aucun de ces corps).

**CTA « Écrire un avis »** : mesuré 226×51 px natifs, **coins carrés** (le mien était arrondi à
tort) et libellé **gras** → `border-radius: 0`, semibold, padding 22/8, bordure `{color.noir}`.

**Convergence de la boucle** : 7,816 % → 7,450 % → 6,981 % → 6,839 % → 6,123 % → 6,122 % →
**6,076 %** (7 itérations, chacune vérifiée par crop zoomé côte-à-côte, jamais sur le seul chiffre).

**Gates après la boucle** : `build` ✓, `figma:plan` ✓, `catalog` + `verify:catalog` ✓,
`golden:update` ✓, `parity` ✓ (0 nouvelle dérive ; les 2 `[figma PENDING]` restent attendus avant la
poussée canevas), `tsc --noEmit` ✓, **`eval` 109/109** ✓. Scripts revalidés à blanc contre
`plugin-engine-mock-figma.mjs` (5 steps, ordre de dépendance correct, marqueurs présents).
⚠️ **Piège rencontré et à retenir** : `golden:update` lancé sans avoir rejoué `figma:plan` d'abord
épingle les ANCIENS scripts → `golden-generated-output` rouge (constaté, 108/109). L'ordre de la
chaîne (`build && figma:plan && catalog && verify:catalog && golden:update`) n'est pas décoratif.

**Écarts restants, tous nommés** : couleur des pastilles d'avatar (arbitré « rien à faire » par
l'owner) ; teinte des étoiles (`star.svg` orange intrinsèque, ne se recolore pas — D6) ; forme du
badge vérifié (glyphe `check` gouverné dans un cercle vs sceau festonné de Google) ; photo de
contenu de la carte 5 (hors schéma, voir T012) ; graisse de rendu de police (accepté par l'owner) ;
~6 px natifs de la flèche gauche qui débordent hors cadre (le réel la pose pile à x=0) ; corps de
texte arrondis à l'échelle du DS.

**Verdict** : ✅ T040 fait, **cette fois vérifié par inspection directe, pas seulement par le
chiffre**. 7,253 %, sous le seuil 9,76 %, résidu compris et nommé, DEUX bugs structurels réels
trouvés et corrigés (pas juste un). Le chiffre reste secondaire à la revue visuelle — cohérent avec
FR-016 qui l'a toujours dit (« le seuil ne remplace pas l'examen visuel »), leçon appliquée
concrètement ici plutôt que citée en théorie.

---

**Verdict** : ✅ Phase 3 (US2) fermée. `pages:selftest` 7/7, identité byte prouvée **et vérifiée en
conditions réelles via l'éval** (109/109), side-cars de région prêts pour la Phase 4d (adoption).
L'instrument observe correctement ce que la Phase 4 (US1) va faire bouger.

---

## Phase 2 (Foundational) — clôturée (2026-07-26)

T009–T023 tous faits. État réel relevé (8 occurrences, 0 divergence), octets natifs extraits,
**les deux verrous durs de la spec levés** (T001 merge, T016 seuil 9,76%), toutes les valeurs
mesurées avec canal/arbitrage, contenu transcrit et relu, ledger déclaré inapplicable avec son
repli. Trois points ouverts remontés au fil de l'eau (pas absorbés) : couleur d'avatar par item non
modélisée, rayon circulaire `%` non exprimable en literal (repli px trouvé), photo de contenu
attachée hors schéma actuel. Prêt pour la Phase 3 (US2 — instrument de preuve armé) et la Phase 4a
(contrats).

## Les deux verrous durs de la spec sont levés (2026-07-26)

T001 (merge) et T016 (seuil) — les deux points explicitement séquencés pour une décision owner
avant de continuer — sont faits. Reste en Phase 2 : T017 (relevé de mesure complet, deux lectures
par valeur), T018 (table de faisabilité des canaux), T019 (replis déjà tranchés), T020 (formaliser
la suppression de l'axe `note`, déjà tranché par mesure directe en T012), T021 (transcription du
contenu réel, un seul jeu source — relu en seconde passe), T022 (crop de l'avatar photo), T023
(déclaration d'inapplicabilité du ledger côté aplat). Aucun de ces sept ne porte de STOP-GATE
owner — travail méthodique, pas des décisions d'architecture.


---

## Phase 4c — Première poussée générative (2026-07-26)

### T041 — Signature de la jambe A + **correction d'un chiffre faux au journal**

**Chiffre réel atteint : 6,0755 %** (`measures/floor-probe/gr-fix-7.json`, `diffCount` 69 699 sur
une région 2327×493 = 1 147 211 px), sous le seuil owner de **9,76 %** (T016).

⚠️ **Correction d'une erreur de ce journal, dite plutôt que corrigée en silence** : le paragraphe
« Verdict » de T040 (5ᵉ passe) annonce **7,253 %**. Ce chiffre est **périmé** — c'est celui de la
3ᵉ passe (ligne 678), recopié sans être remis à jour après les 4ᵉ et 5ᵉ passes. La série mesurée
est 7,816 → 7,450 → 6,981 → 6,839 → 6,123 → 6,122 → **6,076 %**. Le message du commit
`82c3f29` porte, lui, le bon chiffre. Reçu qui fait foi : le JSON de l'itération, pas la prose.

**Triptyque de signature** : `measures/floor-probe/gr-fix-7.triptych.png` (+ l'empilé
`gr-fix-7-EMPILE.png`, rendu au-dessus / réel en dessous — c'est celui sur lequel l'owner a zoomé).

**Accord owner** : les 5 passes de T040 ont chacune été arbitrées par l'owner sur crops zoomés
(« on ne retire rien » sur les flèches, « rien à faire » sur la couleur des pastilles, « reprends
les typos du DS » sur l'échelle, graisse de rendu acceptée). L'autorisation d'ouvrir la Phase 4c
vaut signature de la jambe A. **Ce que cette signature couvre exactement** : la convergence
hors ligne code ↔ aplat. Elle ne dit rien du portage canevas — c'est la jambe B (T046), signée
séparément plus bas.

**Résidu assumé, inchangé depuis la 5ᵉ passe** : substitution de police (dominant, R3) ; couleur
d'avatar fixe vs 5 teintes réelles ; photo de contenu carte 5 hors contrat ; teinte d'étoile
orange intrinsèque (D6) ; forme du badge vérifié ; ~6 px natifs de débord de la flèche gauche ;
corps de texte arrondis à l'échelle du DS.

**Verdict** : ✅ T041 fait. Verrou R19 à moitié levé — la jambe B reste à signer avant l'adoption
(T049), pas avant la poussée.

### T042 — Point de restauration + 9 captures avant (2026-07-26)

**Checkpoint** : `{ label: "006/masters/creation", versionId: "2380469458121552767" }` —
`saveVersionHistoryAsync` via `bridge/checkpoint.js`, octets committés joués par
`fetch`+`eval` depuis la route `/file` du receveur (1 570 o), jamais une copie retapée.

**Captures avant : 9/9 `ok`**, chacune re-décodée côté Node (`manifests.mjs`) — largeur/hauteur
relues **dans le PNG**, pas dans la géométrie du nœud — et hashée :

| Maquette | Taille | sha256 |
|---|---|---|
| Accueil | 1728×5430 | `daa0cb18bc90…` |
| Portes de garage | 1728×4372 | `a21f4ed21820…` |
| Portes de garage résidentielles | 1728×6575 | `b6e56dc5ea48…` |
| Portes de garage industrielles | 1728×6762 | `548868d128a5…` |
| Motorisation | 1728×3334 | `195f6fcdc1b6…` |
| Portes d'entrée | 1728×6534 | `78605a371d1e…` |
| Dépannage/SAV | 1728×4242 | `e6cd553311b4…` |
| À Propos | 1728×5928 | `3ac7df2cfb90…` |
| Contactez-nous | 1728×3901 | `cd5a8bfdd5c3…` |

**Règle before-capture respectée** : les 9 maquettes capturées avant le premier geste, pas un
sous-ensemble pilote.

**Incident d'outillage attrapé avant qu'il ne coûte quelque chose** : un receveur de captures de
la spec 005 tournait encore depuis le **samedi 25/07 05h41** sur le port 9223, et un receveur de
T012 (09h30, `outDir` = `measures/`) sur le 9227. Le second aurait répondu « page-parity » au
contrôle de santé et **avalé les 9 captures dans le mauvais dossier** — exactement l'incident
contre lequel le contrôle de nonce a été construit en 003. Les deux tués, receveur relancé propre
(nonce `df53d8ef557876b2`), nonce épinglé dans chaque appel.

**Leçon de pont, à retenir** : le port 9223 libéré a été repris dans la seconde par le serveur
figma-console d'une **autre session Claude**. Ce n'est pas un problème — la règle multi-writer du
`CLAUDE.md` (25/07) le dit déjà : plusieurs serveurs coexistent sur des ports différents, et le
plugin trouve le bon tout seul en balayant 9223→9232. Relance du plugin = seule action requise ;
**ne jamais tuer le serveur d'une autre session** pour « libérer » un port. J'ai proposé cette
fausse manœuvre, l'owner l'a refusée en rappelant la règle.

### T043-T044 — Première poussée générative, et ce qu'elle a révélé (2026-07-26)

**Transport retenu : `figma:serve` sur le port 9228 + `fetch` depuis le bac à sable du pont**, et
non le plugin Sync Runner. Raison : Figma n'exécute **qu'un plugin à la fois** — lancer le Sync
Runner déconnecterait le Desktop Bridge, donc les checkpoints et les captures. Le port 9228 est
dans la plage 9223-9232 autorisée par le manifeste du plugin, `FIGMA_SERVE_ONLY` restreint le
manifeste aux deux seuls scripts de composant, et les empreintes sha256 servies ont été recoupées
avec le disque **avant chaque exécution**. Les valeurs de retour `{name, nodeId, key}` sont celles
du script lui-même — pas un appariement par nom (la fragilité dénoncée en 002).

**Trois refus armés dans l'appel**, avant que le script ne touche quoi que ce soit : `fileKey`
attendue présente dans les octets servis · `figma.fileKey` égale · absence de
`createVariableCollection` (garde anti-`01-tokens.js`).

**Résultat** : `ReviewCard` `2178:7349` (clé `3826fdc9…`, 10 propriétés) puis `GoogleReviews`
`2178:7381` (clé `9bc775b8…`, 4 propriétés). Le `repeat` a produit **5 instances** de carte — le
premier `repeat`+`component` du dépôt fonctionne.

**Preuve T044 : 9/9 identical, exit 0** — et chaque sha256 « après » est **byte-identique** à son
« avant », plus fort que l'égalité pixelmatch.

#### Le portage canevas était faux, et la jambe B ne l'aurait dit que plus tard

Relevé de géométrie immédiat après la poussée (lecture seule) : racine **530×328** au lieu de
1552, et les 3 colonnes `[flèche][cartes][flèche]` à **169,3 px chacune** — des tiers égaux — avec
5 cartes de 299 débordant d'un parent de 169. **Trois causes, toutes tranchées « ça vient du
contrat », aucune du canevas** (corollaire source-cleanliness) :

1. **La racine ne portait aucune largeur.** Le CSS généré n'avait pas de `width` : les 1552 px de
   la jambe A venaient du **viewport du harnais de rendu**, pas du contrat. Sur canevas il n'y a
   pas de viewport → HUG. Corrigé par `literals.width: "1552px"` — et on sait que ça tient parce
   que le literal `height: 328px` de la même racine, lui, avait déjà produit
   `primaryAxisSizingMode: FIXED`.
2. **`align: stretch` sur la rangée écrasait les largeurs des flèches.**
   `core/emit-figma-script.ts:871` allume `stretchChildren` dès qu'une part porte un `layout` sans
   `align` explicite **ou** avec `align: stretch`, et `:3315` pose alors `layoutSizingHorizontal =
   FILL` sur tout enfant sans largeur **de token** (`:1115`/`:1120` = les deux seules sources de
   `fixedWidth`). Un `literals.width` ne protège donc **pas** un enfant ; seules les instances y
   échappent (`:3316`). Corrigé par `align: "center"`, explicite, qui éteint le défaut.
3. **4 `line-height` sans unité dans `ds.review-card`** (`"1"`, `"1.2"`, `"1.2"`, `"1.4"`).
   Côté code, un ratio CSS ; côté canevas l'émetteur écrit `lineHeight = { unit: 'PIXELS', value:
   1.4 }` — soit **1,4 pixel**. La boîte de `temoignage` faisait **3 px de haut** et les textes se
   chevauchaient. Convertis en px exacts (ratio × taille de police) : 18 / 19,2 / 16,8 / 19,6 px.
   ⚠️ **Les 5 contrats pré-existants n'ont pas ce défaut** (px ou token partout) : c'est une faute
   introduite par cette spec, pas un bug hérité. Classe de dégât **silencieuse** — rien ne refuse,
   le master est simplement faux. Correctif moteur (refuser un `line-height` sans unité, ou le
   résoudre contre la taille de police) → **backlog avec ce reçu**, Constitution VII.

**Les trois corrections sont rigoureusement neutres côté code** : jambe A re-mesurée à
**6,076 %, diffCount 69 699** — identique à l'octet près avant et après. Le canevas est réparé
sans qu'un pixel du rendu code ne bouge.

**Géométrie après correction** : racine 1552×328 FIXED/FIXED · flèches à 0 px aux deux bords ·
groupe de cartes 1530 FILL · 5 cartes de 299 aux x 0/307/614/921/1228 (gap 8). Conforme au code.

**Deux itérations d'amend, chacune avec sa preuve complète** :
`006/masters/iteration-1` (`2380449820962294161`, section) → **9/9 identical** ·
`006/masters/iteration-2` (`2380480866074020014`, carte) → **9/9 identical**.
`amended: true` les deux fois, **id et `key` conservés** — l'identité par marqueur
`ds_contracts/contractId` tient, comme le protocole l'annonçait.

#### Leçon de harnais : j'ai cru le chiffre signé non reproductible, à tort

En re-mesurant la jambe A j'ai obtenu 7,85 % puis 7,57 % contre les 6,076 % signés, et j'ai
d'abord conclu que l'état de contrat ayant produit 6,076 % n'existait plus. **C'était faux, et
c'étaient mes deux ratés** : (1) je passais à la sonde le CSS émis **sans** `src/styles/tokens.css`
— le CSS émis *référence* `var(--color-blanc)` mais ne le *définit* pas, donc cartes sans fond ni
bordure et pastilles d'avatar sans remplissage ; (2) je rendais le showcase entier au lieu du
**fragment du bloc**, et le `<p class="showcase__label">default</p>` décalait tout verticalement.
Les deux corrigés → **6,076 %, diffCount 69 699, reproduit à l'octet près**.

**Ce que ça coûte et ce qu'on en fait** : la recette exacte de la jambe A (concaténer
`tokens.css`, extraire le fragment `<section class="google-reviews">`) **n'est écrite nulle part et
ses scripts ne sont pas committés** — elle vivait dans le bac à sable d'une session. Un chiffre
qu'on ne sait pas rejouer n'est pas un reçu. → **backlog** : committer un script de jambe A
reproductible. En attendant, la recette est ci-dessus, noir sur blanc.

**Reste ouvert à ce point** : les flèches de carrousel sont **dessinées mais rognées** sur le
canevas (`pastilleGauche` à x=-15, largeur 30, dans une frame de largeur 0 qui rogne). C'est le
trou **A25** de `docs/FIGMA-CAPABILITY-MATRIX.md` — « frames default clip », capacité `overflow`
**non portée** par le contrat aujourd'hui. Décision owner requise.

### Flèches rognées sur le canevas — limite A25 acceptée, PAS `overlay` (2026-07-26)

**Autocorrection avant d'exécuter** : j'ai d'abord recommandé de passer `flecheGauche`/`flecheDroite`
en vocabulaire `overlay` (placement `start`/`end`). Vérification faite *avant* d'y toucher —
c'était **faux**. `overlay` place la part **entièrement hors du parent, à ras d'un bord, zéro
chevauchement** (`core/emit-figma-script.ts:3189-3201` : `x = -width` pour `start` ; CSS
`right: 100%`) — le patron « bulle de tooltip au-dessus d'un déclencheur ». La structure déjà
signée en T040 est différente et vérifiée dans le CSS généré : `.flecheGauche { width:0;
min-width:0 }` contenant `.pastilleGauche { width:30px; min-width:30px }` — un conteneur à largeur
nulle dont l'enfant déborde **symétriquement des deux côtés**, parce que CSS ne rogne pas par
défaut. C'est exactement le chevauchement mesuré sur l'aplat, **déjà convergé à 6,076 %** (T041).
Passer en `overlay` aurait changé la géométrie et cassé un résultat déjà prouvé, pour un chiffre
probablement pire, sans même reproduire le chevauchement réel.

**Vrai défaut, plus étroit** : les frames Figma rognent leurs enfants par défaut
(`clipsContent: true`), CSS non — c'est le trou A25 de `docs/FIGMA-CAPABILITY-MATRIX.md`
(« overflow — CARRY-BOTH (trivial add) », jamais fait). Aucun contrat aujourd'hui n'expose de
canal `overflow` vers `clipsContent` côté canevas (`overflow-x`/`overflow-y` existent mais sont
`canvas: 'annotate'` — code seul, jamais dessinés). Le brancher est un ajout moteur légitime, mais
touche `core/emit-figma-script.ts` en pleine poussée → churn golden + éval, contre la discipline
T075 qui envoie explicitement ce type de correctif au backlog plutôt que de l'absorber au passage.
Un contournement à la main sur le canevas (`clipsContent = false` posé en direct) a aussi été
écarté : un ré-amend futur de `ds.google-reviews` recréerait la frame depuis le spec et effacerait
la bascule en silence — **exactement l'« étape manuelle » que T037 interdit** (Independent Test
US1 : chaîne traversée sans retouche).

**Décision owner** : limite **acceptée et nommée**, rien retiré. Les flèches restent entières dans
le contrat et dans le code (aucune régression sur « on ne retire rien », qui portait sur un tout
autre choix — les évacuer du design). Seul le **master Figma** les montre rognées ; c'est une
limite A25 antérieure à cette spec, générale à tout le moteur, pas spécifique à ce composant.

**Backlog** : brancher `overflow-x`/`overflow-y: visible` → `clipsContent = false` côté émetteur
canevas (matrice : « trivial add »). Reçu : ce défaut précis, `flecheGauche`/`flecheDroite` de
`ds.google-reviews`, capture avant/après jointe aux itérations 1-2 ci-dessus.

### T045 — anchors:writeback + régénération + golden:update (2026-07-26)

**Transport réel ≠ transport nominal** : la route Sync Runner (plugin, POST `/runner-result`) n'a
pas été utilisée — l'exécuter aurait déconnecté le Desktop Bridge qui porte les checkpoints et
captures. `figma-sync/.runner-result.json` a donc été **écrit manuellement**, avec les valeurs
`{name, nodeId, key}` réellement retournées par les deux scripts poussés en T043-T044 (source
déclarée dans le fichier), pas des valeurs inventées — repli explicitement prévu par
`contracts/push-protocol.md` §2 (« sinon l'écriture des ancres est manuelle »).

**`anchors:writeback`** : 2 mis à jour, 0 non appariés. Ancres avant → après :

| Contrat | `componentSetKey` | `nodeId` |
|---|---|---|
| review-card | `null` → `3826fdc9975d42b1661e14494476701676759671` | `null` → `2178:7349` |
| google-reviews | `null` → `9bc775b834830afc0b67841e8d341cf2efa3037c` | `null` → `2178:7381` |

`fileKey`/`dumpedAt` intacts, JSON toujours valide, édition textuelle ciblée (pas de reformattage).

**Régénération** : `build && figma:plan && catalog && verify:catalog` — ancre vérifiée présente
dans les octets émis (1 occurrence dans chacun des 2 scripts). `golden:update` → 42 fichiers.

**`npm run parity` → exit 1, 2 constats `figma BEHIND` (`GoogleReviews`, `ReviewCard`)** —
**attendu, pas une régression** : `parity/snapshots/figma-components.json` date d'avant la poussée
canevas et ne connaît pas encore les deux masters. C'est exactement ce que T047a referme. Les 2
constats déjà acquittés (`Primitives/color/rouge`, `close.svg`) sont inchangés.

### T046 — Jambe B (portage), signature (2026-07-26)

**+2 sujets** dans `extract/figma/visual-parity/subjects.ts` (`review-card`, `google-reviews`),
`kind: 'contract'`, ancres = celles écrites en T045. **Aucun `renderWidth`** : contrairement à
Input/Textarea (atomes FILL), les deux racines portent déjà un `literals.width` fixe (299px /
1552px) qui égale exactement la largeur du master — pas de décalage content-width à corriger.
Vérifié dans `figma-api.ts` : un COMPONENT autonome (`isSet:false`, notre cas) est traité comme sa
propre liste de variantes à une entrée ; `match.ts` (`planVariant`) rend l'état tout-par-défaut
pour un nom sans `=` — exactement le chemin par défaut de Button/Checkbox, sans l'enveloppe SET.

**Résultat (run complet, sans filtre)** :

| Sujet | masqué | non masqué | cause dominante |
|---|---|---|---|
| ReviewCard | **0,00 %** | 1,68 % | substitution de police (raster) |
| GoogleReviews | **1,50 %** (seuil 2 %) | 3,31 % | Δ largeur 8 px CSS (flèches, voir ci-dessous) + police |

Le Δ largeur de GoogleReviews (`ours 3120×656 vs figma 3104×656`, device px, soit 8 px CSS) a été
vérifié sur le triptyque avant signature — le panneau diff ne surligne que les glyphes de texte,
aucun décalage structurel. Hypothèse cohérente avec la limite A25 déjà nommée (flèches rognées sur
le canevas, entières côté code) : le contenu qui déborde du cadre nominal côté code (pastilles à
largeur nulle) n'a pas d'équivalent rogné à mesurer côté Figma de la même façon, ce qui élargit
légèrement la boîte de contenu mesurée côté code. Sous le seuil, revue à l'œil faite — **signé**.

#### Trouvaille non liée à 006, déjà anticipée par T005 : Button/Checkbox « SKIPPED »

Le run complet (obligatoire — `writeBaseline` reconstruit **tout** `baseline.json` depuis les seuls
sujets exécutés cette invocation, aucun mode fusion) a révélé que **Button (6 variantes) et
Checkbox (2 variantes) sont désormais `SKIPPED`**, alors que le `baseline.json` committé (24/07)
portait encore de vrais scores (`Property 1=Default` 1,31 %, etc.).

**Cause identifiée, pas juste constatée** : `contracts/button.contract.json` porte toujours
`bindings.figma.property: "Property 1"` (inchangé). Un fetch REST frais du fichier vivant montre
que le COMPONENT_SET s'appelle désormais **« Style »** (`Style=Default`, `Style=Orange`, …) — un
renommage de nettoyage vraisemblablement fait pendant la spec 005, jamais répercuté dans le
contrat. C'est **exactement** la dérive nommée dans tasks.md T005 : *« l'orthographe Bouton pré-005
que 005 a délibérément laissée ⇒ extract:figma:visual peut être rouge pour une raison étrangère à
006 »* — anticipée, pas causée ici.

**Décision owner** : écrire le baseline **honnête** — Button/Checkbox passent en `status: "skipped"`
(l'état réellement vérifiable aujourd'hui) plutôt que de conserver artificiellement d'anciens
scores qui ne correspondent plus à rien de mesurable. **Hors périmètre 006** (aucune tâche de
`tasks.md` ne couvre la réparation du binding Button/Checkbox ↔ canevas post-005) → **backlog** :
reproposer `button.contract.json`/`checkbox.contract.json` depuis le fichier vivant pour capter le
renommage `Property 1` → `Style` (et `Coché` → ce que le fetch montrera). Reçu joint :
`contracts/button.contract.json` dit « Property 1 », fetch REST daté 2026-07-26 dit « Style ».

**`baseline.json` après (13 lignes, 7 sujets)** : Button ×6 `skipped` · Checkbox ×2 `skipped` ·
**ReviewCard `diffed` 0,00 %** · **GoogleReviews `diffed` 1,50 %** · Input `diffed` 0,00 % ·
Textarea `diffed` 0,00 % · button-with-icons `figma-declined` (image API, déjà connu — inchangé).

**Verdict** : ✅ T046 fait. Jambe B **signée** : le canevas porte fidèlement ce que les deux
contrats disent, sous le seuil, revu à l'œil. Verrou R19 levé — jambes A **et** B signées,
l'adoption (Phase 4d) peut commencer.

### T047 — Rangement, et une trouvaille non prévue (2026-07-26)

**Checkpoint** `006/masters/rangement` → `2380472820518738371` (identique au numéro vu par le
fetch REST du T046 — cohérent, rien n'a muté le canevas entre les deux). 9 captures avant faites.

**Déplacement** : `ReviewCard` → nouvelle SECTION « Review-card » sur `DS · Molécules` ;
`GoogleReviews` → nouvelle SECTION « Avis Google » sur `DS · Organisms`. Ids et `key` inchangés
(`2178:7349` / `2178:7381`, mêmes clés qu'en T045) — seul le parent bouge, l'identité tient.

**Trouvaille imprévue, traitée avec prudence** : la page auto-créée « GoogleReviews » (par le
premier push, T043) ne contenait pas que mon master — un second nœud, `GROUP` **« Avis Google »**
(`2181:7944`, 1552×459), portait une copie du rectangle aplati
**`trustindex-google-reviews-widget`** (1552×328) **et** une instance `SectionHeader` adjacente —
exactement la forme du `GROUP` réel des 9 maquettes. Provenance inconnue (token REST expiré →
impossible de consulter l'historique de versions pour dater sa création ; le pont accepte plusieurs
écrivains concurrents donc rien ne permettait d'exclure une autre session).

**Ne PAS supprimer sans vérifier** appliqué à la lettre : question posée à l'owner avant tout
geste. Réponse : **« garde-le, c'est l'image de référence initiale, on n'en fait rien mais on la
garde »**. Exécuté au plus près de cette consigne — **le groupe n'a pas été déplacé ni modifié**,
seule la page a été **renommée** (`GoogleReviews` → `Référence — Avis Google (aplat, conservé)`)
pour que son statut soit sans ambiguïté pour un lecteur futur. Garde-fous avant l'écriture :
refus si le contenu de la page ne correspondait pas exactement à `{Avis Google, id 2181:7944}` seul
enfant, refus si la page `ReviewCard` n'était pas vide. La page `ReviewCard`, elle, confirmée
strictement vide, a été supprimée comme prévu.

**Preuve : 9/9 identical, exit 0.** Pages finales du fichier : `Pages`, séparateur, `DS · Tokens`,
`DS · Atomes`, `DS · Molécules`, `DS · Organisms`, `Référence — Avis Google (aplat, conservé)`.

**Verdict** : ✅ T047 fait — avec une déviation assumée et actée (page de référence conservée et
renommée au lieu de supprimée, sur instruction owner explicite), consignée ici plutôt que fondue
dans un « comme prévu » silencieux.

### T047a — Rafraîchir le snapshot de parité (2026-07-26)

**Route** : `parity/extract-figma.plugin.js` (script existant, LECTURE seule, aucune ligne
modifiée) exécuté via le pont desktop (`figma_execute`) — précédent exact spec 004 T035. Écrase
`parity/snapshots/figma-components.json` avec `{fileName, fileKey, extractedAt, sets}`, même forme
exacte (indentation 2 espaces, pas de retour à la ligne final) que le fichier committé.

**Recoupement `fileKey`** : `d9FYAUcqdcNtsuaMgLefvJ` — identique à `anchors.figma.fileKey` des
deux contrats 006 (T031/T033). Passe.

**Mes deux composants : zéro constat.** `GoogleReviews`/`ReviewCard` n'apparaissent dans AUCUNE des
24 lignes ci-dessous — la preuve que T047a devait apporter est faite : `parity` voit désormais les
deux masters, et ils concordent avec leurs contrats. `nestedInstances: ["ReviewCard"]` confirmé sur
`GoogleReviews` — le fait exact que T061 attend pour re-pointer l'éval `detect-figma-missing-
nested-instance`.

#### Trouvaille majeure, non liée à 006 : dérive silencieuse depuis la clôture de la spec 004

Le rafraîchissement a fait passer `npm run parity` de **0 constat actif** à **24 constats, exit 1**
(+2 déjà acquittés, inchangés). **Datation exacte, par git, pas par supposition** :

| Fichier | Dernier commit | Date |
|---|---|---|
| `parity/snapshots/figma-components.json` (avant ce rafraîchissement) | `5ae47ea` « chore(004): refresh parity snapshot → parity clean » | 2026-07-24 |
| `contracts/icons.registry.json` | `3dd5b0d` (clôture 004) | 2026-07-24 |
| `contracts/button.contract.json` / `checkbox.contract.json` | `3dd5b0d` (clôture 004) | 2026-07-24 |

Le snapshot n'a **plus bougé depuis la clôture de 004**. La spec 005 (figma-source-cleanup, fermée
25-26/07, périmètre = nettoyage Figma) est la seule fenêtre entre cette date et aujourd'hui —
elle a manifestement renommé des propriétés de composant et des masters d'icônes **sur le canevas
vivant**, sans que personne ne rejoue ce snapshot ensuite. Conséquence directe : **`parity` a été
vert par accident du 24/07 à aujourd'hui**, y compris à la clôture de 005 qui revendiquait
explicitement (`RAPPORT-CLOTURE.md`) « 8/8 verte, parity à zéro constat actif » — cette revendication
était déjà fausse au moment où elle a été écrite, la preuve n'ayant simplement jamais été
re-vérifiée après le dernier geste canevas de 005.

**Les 24 constats, par famille — reçu exact, aucun absorbé en silence** :

**Button (4 BEHIND + 4 AHEAD, un seul renommage par paire)** :
| Propriété contrat (`button.contract.json`, inchangée) | Nom canevas (post-005) |
|---|---|
| `Property 1` (variant) | **`Style`** |
| `Libellé` (texte) | **`Libelle`** (accent perdu) |
| `Icône gauche` (booléen) | **`Icone gauche`** (accent perdu) |
| `Icône droite` (booléen) | **`Icone droite`** (accent perdu) |

**Checkbox (1 BEHIND + 1 AHEAD)** : `Coché` (contrat) → **`Coche`** (canevas, accent perdu).

**Icônes (14 MISMATCH, `contracts/icons.registry.json` vs canevas)** — toutes kebab-case/accentué
→ PascalCase/dé-accentué : `piqueray`→`Piqueray` · `phone`→`Phone` · `download`→`Download` ·
`pdf`→`Pdf` · `search`→`Search` · `user`→`User` · `chevron-right`→`ChevronRight` ·
`chevron-left`→`ChevronLeft` · `chevron-down`→`ChevronDown` · `chevron-up`→`ChevronUp` ·
`cart`→`Cart` · `arrow-right`→`ArrowRight` · `arrow-left`→`ArrowLeft` · `Étoile`→`Etoile` (accent
perdu). Chaque ligne porte dans le rapport `diff.ts` un correctif proposé prêt à revue (adopter le
nom canevas dans le registre, ou renommer le master en arrière) — aucun exécuté ici.

**Décision owner** : garder le snapshot **honnête** (vérité du canevas, pas l'ancien confort vert),
nommer chaque constat avec son reçu exact (ci-dessus), **hors périmètre 006** → **backlog** :
reconcilier `button.contract.json`/`checkbox.contract.json`/`contracts/icons.registry.json` avec
les renommages post-005 (une décision par paire : adopter le nom canevas, ou restaurer l'ancien —
arbitrage owner, pas mécanique). **`npm run parity` restera rouge (24 constats) jusqu'à ce
correctif** — assumé et dit, jamais absorbé dans un « comme prévu ».

**Portée de cette trouvaille, à ne pas élargir (même discipline que R12 §4 pour
`extract:figma:visual`)** : aucun des 24 constats ne porte sur `ds.review-card` ni
`ds.google-reviews`. Un `parity` rouge à partir d'ici n'est **pas** un signal de régression 006 tant
que les seules lignes nouvelles sont parmi ces 24 déjà nommées — un contrat ou un composant 006 qui
apparaîtrait dans une 25ᵉ ligne serait, lui, une vraie régression à traiter immédiatement.

**Verdict** : ✅ T047a fait. Snapshot à jour, recoupement fileKey passé, les deux composants 006
confirmés zéro-écart, trouvaille hors-périmètre nommée avec reçu git et renvoyée au backlog.

---

## Phase 4d — Adoption, une occurrence à la fois (2026-07-26)

### T048 — Ordre d'adoption et écart attendu, figés avant exécution

**Ordre** (celui de `inventory/occurrences.json`, scan fait foi) : **Accueil → Portes de garage →
Portes de garage résidentielles → Portes de garage industrielles → Portes d'entrée →
Dépannage/SAV → À Propos → Contactez-nous**. 8 occurrences, 0 divergence (T011) — le nombre attendu
correspond exactement aux tâches T049-T056 telles qu'écrites, aucun amendement de liste requis.

**Contenu identique aux 8** (T021 : même `imageHash`) — un seul jeu de contenu réel transcrit,
appliqué 8 fois par propriétés :

| Carte | Initiale | Auteur | Date | Témoignage | Tronqué |
|---|---|---|---|---|---|
| 1 | P | pho syster | il y a 2 mois | super très pro et service après vente présent | non |
| 2 | P | Petit Nicole | il y a 3 mois | Je vous envoie mon message un peu tardivement car problème de boite mail. Super ravie du travail réalisé… | oui |
| 3 | A | Aun Bukhari | il y a 4 mois | Travail propre, soigné, ouvrier expert dans son métier, super suivi par Wael (technicien installation) qui est à fait le suivi… | oui |
| 4 | T | Thierry Picard | il y a 5 mois | Dépannage ultra rapide et professionnel | non |
| 5 | m | miguel martinez | il y a 6 mois | Je ne mais pas 5 étoiles mais 10 les 2 placeurs de mes 2 portes de garage il… | oui |

Résumé : Qualificatif « Excellent », Note globale « 4.8 », Volume « 93 avis », Contrôles = oui
(flèches visibles). Les 5 cartes : `Avatar initiale = true`, `Avatar photo = false` (T022 : 0/5
photo réelle mesurée), `Vérifié = true`.

**Écart attendu, écrit avant d'exécuter (R3 §4)** : `outsideDiffCount = 0` sur les 9 maquettes ;
`regionPct` non nul sur la maquette touchée (substitution de contenu réel dans une région
convergée à 6,076 % en générique — le chiffre réel montera probablement, mesuré et publié, jamais
lissé) ; **`Motorisation` reste `identical`** (elle ne porte pas le widget) ; toute valeur
`diffCount: 0` **sans crop** sur la maquette touchée est un `dimension-mismatch` déguisé → STOP.

**Verdict** : ✅ T048 fait.

### T049 — Adopter Accueil (2026-07-26)

**Checkpoint** `006/adoption/accueil` → `2380497911740264333`. 9 captures avant (0 échec).

**Incident live rencontré et résolu, technique désormais réutilisable** : le premier remplacement
(retirer l'aplat, insérer l'instance, ré-affirmer les deux positions **dans la même écriture
synchrone**) n'a **pas tenu** — `header.x`/`inst.y` ont dérivé (`89`→`100,25`, `4515`→`4384`), le
`GROUP` a rétréci (459→328 px de haut), et le cadre « Accueil » a perdu 131 px (5430→5299) : le
piège 003 exact (auto-resize du `GROUP` en cascade). **Cause** : écrire la position d'un enfant
juste après `appendChild`, dans le même bloc synchrone que l'écriture d'un second enfant, ne
« prend » pas — Figma recompute le bounding-box du GROUP entre les écritures et redistribue les
coordonnées. **Correctif, vérifié empiriquement avant d'être généralisé** : écrire dans une
**boucle de convergence** (relire l'id frais, réécrire la cible, comparer, jusqu'à stabilité —
2 passes ont suffi ici). Après convergence : `GROUP` exactement 88/4384/1552/459 (identique à
l'avant-mutation), cadre revenu à 5430, **les 8 autres frères du GROUP vérifiés un par un contre
leurs bornes d'avant-mutation — tous identiques** (garde FR-012 passée).

**Contenu appliqué par propriétés** (jamais d'override brut) : résumé (Qualificatif/Note
globale/Volume/Contrôles) + les 5 cartes, appariées à leur contenu par **position (x croissant)**,
jamais par nom de calque (`carte`, `carte 2`… ne portent aucune garantie d'ordre) — cf. T048.

**Première comparaison régionée : `outsideDiffCount = 14`, pas zéro.** Investigation avant
d'accepter quoi que ce soit : un résidu sub-pixel déjà repéré (`headerX = 89,0078125` au lieu de
`89`) laissait 14 px d'antialiasing différer **hors** de la région déclarée, dans la zone du
Section-header. Corrigé à `89` exact (même boucle de convergence), recapturé, recomparé.

**Verdict final** : `outsideDiffCount = 0` ✅ · `diffCount` (39238) **égale exactement**
`regionDiffCount` — la totalité de l'écart est contenue dans la région déclarée · `regionPct =
7,708 %` (chiffre réel, publié tel quel — plus haut que les 6,076 % de la jambe A hors-ligne,
attendu : rendu canevas natif vs. rendu headless contrôlé, pipelines différents) ·
`Motorisation` : `identical`, `diffCount 0`.

**Revue à l'œil (obligatoire, crop `proofs/accueil/crops/Accueil.png`)** : résumé identique
(aucun surlignage diff), écart concentré sur les 5 cartes — substitution de police, couleur
d'avatar, badge de vérification, photo de contenu carte 5 (hors contrat, A5) : **tous des résidus
déjà nommés en T040**, rien de nouveau.

**Ledger** : reporté à T059 (consolidation finale des 8 occurrences), conformément à la déclaration
T023 — pas un oubli, le plan l'a toujours placé là.

**Verdict** : ✅ T049 fait. Accord owner : implicite dans le mandat « finis la spec » — chiffres et
crops publiés ici pour revue a posteriori, aucun signal d'arrêt.

### T050 — Adopter Portes de garage (2026-07-26)

**Checkpoint** `006/adoption/portes-de-garage` → `2380488227635314062`. 9/9 captures avant.
Remplacement + convergence (technique T049) : cette fois la cible de départ était **loin** de la
position finale (première passe : inst à 77,75/2751,9 au lieu de 88/2948,69) — 4 passes
supplémentaires nécessaires (10 au total) pour converger à l'exact (< 0,0004 px sur tous les
frères du GROUP, FR-012 vérifié). Contenu appliqué par propriétés, identique aux 5 cartes T048.

**`outsideDiffCount = 8`, investigué avant d'accepter quoi que ce soit** :
1. Localisation exacte des pixels (script pixelmatch dédié, hors du gate) : **deux foyers, tous
   deux en dehors du bloc Avis Google** — `Presentation` (~y 1246) et `TexteSEO` (~y 3417/3643),
   jamais touchés intentionnellement par cette adoption.
2. **Test de calibration (doctrine README §5)** : deux captures indépendantes de l'état actuel,
   sans rien changer entre les deux → **sha256 strictement identiques**. Le plancher de bruit de
   l'instrument est bien nul — ce n'est **pas** du bruit de capture.
3. **Test de nudge** (déplacer de +1 px puis revenir sur `Presentation`/`TexteSEO`, deux écritures
   réelles) → aucun effet sur le rendu (byteLength identique avant/après nudge).
4. **Cause retenue** : les multiples passes de convergence (10, dont un grand écart initial) ont
   fait rejouer l'auto-layout de **tout le cadre** plusieurs fois ; les blocs situés plus bas dans
   la pile verticale ont vu leur position Y osciller avant de se stabiliser à la **même valeur
   finale** (vérifié par lecture — Δ < 0,0004 px) — mais leur **rendu texte**, lui, s'est
   apparemment re-rastérisé à un sous-pixel différent au passage, un artefact figé, pas un bruit
   rejouable.

**Décision owner** : accepté et nommé — le bloc Avis Google lui-même est exact (contenu conforme,
géométrie parfaite), le résidu est confiné à du texte **non modifié** dans deux composants sans
rapport, à un niveau (8 px sur toute la page) sous tout seuil de perception. Une restauration
manuelle + refonte a été proposée et **déclinée** : le coût (geste owner + ré-exécution complète)
dépasse le bénéfice pour un résidu de cette classe, sans garantie qu'un nouvel essai l'évite.

**Chiffres** : `regionPct = 7,767 %` · `Motorisation` : `identical`. Revue à l'œil : contenu
conforme à T021, résidus déjà nommés (police, avatar, badge, photo carte 5).

**Verdict** : ✅ T050 fait, résidu de 8 px nommé et acquitté par l'owner.

### T051 — Adopter Portes de garage résidentielles (2026-07-26)

**Checkpoint** `006/adoption/portes-de-garage-residentielles` → `2380488309250329332`. 9/9 avant.
Convergence en **4 passes seulement** (technique affinée : écrire `inst.x/y` immédiatement après
`appendChild`, avant d'entrer dans la boucle de convergence commune aux deux enfants) — les 8
frères du GROUP relus **identiques bit pour bit** à l'avant-mutation (aucun résidu, contrairement à
T050). Contenu appliqué, 5 cartes appariées par x croissant.

**`outsideDiffCount = 0` du premier coup** — `diffBox` (h=275) entièrement contenu dans la région
déclarée (h=328). `regionPct = 7,791 %`. `Motorisation` : `identical`. Revue à l'œil : conforme,
résidus déjà nommés uniquement.

**Verdict** : ✅ T051 fait, aucun résidu collatéral cette fois.

### T052 — Adopter Portes de garage industrielles (2026-07-26)

**Checkpoint** `006/adoption/portes-de-garage-industrielles` → `2380479912615961439`. 9/9 avant.
Convergence en **4 passes**, 8 frères du GROUP **identiques bit pour bit** (comparaison JSON exacte
avant/après). Contenu appliqué, 5 cartes par x croissant.

**`outsideDiffCount = 0`** du premier coup. `regionPct = 7,791 %`. `Motorisation` : `identical`.
Revue à l'œil : conforme, résidus déjà nommés uniquement.

**Verdict** : ✅ T052 fait.

### T053 — Adopter Portes d'entrée (2026-07-26)

**Checkpoint** `006/adoption/portes-d-entree` → `2380479912611376139`. 9/9 avant. Convergence en
**4 passes**, 8 frères identiques bit pour bit. Contenu appliqué, 5 cartes par x croissant.

**`outsideDiffCount = 0`**. `regionPct = 7,791 %`. `Motorisation` : `identical`. Revue à l'œil :
conforme, résidus déjà nommés uniquement.

**Verdict** : ✅ T053 fait.

### T054 — Adopter Dépannage/SAV (2026-07-26)

**Checkpoint** `006/adoption/depannage-sav` — 9/9 captures avant (`.page-parity/006-adoption-sav/before/`,
9 PNG non vides). ⚠️ **`versionId` non capturé dans un artefact committé** (T049-T053 en portent tous
un) : à récupérer depuis l'historique de versions natif Figma via le pont (label
`006/adoption/depannage-sav`) avant la clôture — nommé ici comme trou, **jamais inventé**. Convergence
(technique T051/T053) : 8 frères du GROUP relus identiques à l'avant-mutation, garde FR-012 passée.
Contenu appliqué par propriétés, 5 cartes appariées par x croissant (T048).

**Bug d'instrument trouvé et corrigé ici — `--regions` silencieusement inerte pour cette maquette** :
`Dépannage/SAV` est la **seule** maquette dont le nom réel contient un `/`, que `fsName`
(`manifests.mjs`) réécrit en `_` pour le nom de fichier PNG. `cli.ts` appariait la région sur cette
clé assainie (`Dépannage_SAV`) au lieu du nom réel porté par le side-car de manifeste
(`Dépannage/SAV`) → la région ne matchait **jamais**, le verdict sortait **sans** champs de région
(exactement le `verdict.json` pré-correctif d'abord committé ici). Correctif
(`extract/figma/page-parity/cli.ts`) : lire le vrai nom depuis `afterManifest?.maquette` /
`beforeManifest?.maquette` et l'utiliser pour la **seule** recherche `--regions`, la clé assainie
restant celle des opérations fichier (chemin de crop). Verdict régénéré **hors ligne** (pixelmatch sur
les captures existantes de `.page-parity/006-adoption-sav/`, **zéro écriture canevas**) après le
correctif.

**Verdict final** (avec correctif) : `outsideDiffCount = 0` ✅ · `diffCount` (39238) **égale
exactement** `regionDiffCount` — la totalité de l'écart est contenue dans la région déclarée ·
`regionPct = 7,708 %` (identique à Accueil : même contenu, même bloc) · `Motorisation` : `identical`,
`diffCount 0`. Revue à l'œil (crop `proofs/depannage-sav/crops/Dépannage_SAV.png`) : conforme, résidus
déjà nommés uniquement (police, avatar, badge, photo carte 5 hors contrat A5).

**Verdict** : ✅ T054 fait (verdict de région régénéré après correctif d'instrument). **Reste** : le
`versionId` du checkpoint à récupérer et journaliser avant clôture.

### T055 — Adopter À Propos (2026-07-26)

**Checkpoint** `006/adoption/a-propos` → `2380513439123474372`. 9/9 captures avant (0 échec,
manifests 9/9 ok, `sha256` de l'aplat À Propos avant = `3ac7df2cfb90…`). Réceptionneur sur **port
9229** et non 9227 : le pont figma-console occupe 9227 dans cette session (constat au probe de statut),
9229 est libre et dans la plage `9223-9232` autorisée par le manifeste du plugin — nommé ici, ce n'est
pas un contournement mais le port suivant disponible.

**Occurrence** : `GROUP 258:1963` (« Avis Google »), aplat `RECTANGLE 258:1967`
(`trustindex-google-reviews-widget`, x:88/y:4502/w:1552/h:328), `SectionHeader 2091:2401` frère intact
(x:89/y:4371/w:1550/h:83), cadre parent `À Propos 258:1887` (h:5928, 9 enfants). Écart attendu écrit
avant exécution (T048) : `outsideDiffCount 0`, `regionPct` ≈ 7,7 %, `Motorisation` identical.

**Correction d'une erreur d'offset, attrapée par la garde de hauteur du GROUP avant toute capture** :
première convergence des deux enfants à `inst.y=4515` (valeur **absolue** de l'instance Accueil) →
enfants stables mais **GROUP à h:472 au lieu de 459**. Cause : 4515 est l'`y` absolu d'Accueil, pas
l'offset. Le bon invariant, lu sur l'instance Accueil déjà adoptée : **offset instance = 131 px sous
le haut du GROUP** (= header 83 + gap 48), GROUP h = 131 + 328 = 459. Pour À Propos (haut GROUP 4371) →
`inst.y = 4371 + 131 = 4502` (exactement l'`y` de l'aplat d'origine — cohérent). Re-convergence à 4502 :
**stable en 1 passe**, GROUP exactement `88/4371/1552/459` (identique à l'avant-mutation). Technique
propre T051/T053 confirmée ; l'offset relatif (131), pas l'`y` absolu, est la valeur à réutiliser.

**Garde FR-012** (relue **deux fois** : après remplacement, puis après application du contenu) : cadre
h:5928 inchangé, **les 9 enfants du cadre (8 frères + GROUP) bit-identiques à la ligne de base
avant-mutation** — 0 dérive. Aucun résidu collatéral (contrairement à T050).

**Contenu appliqué par propriétés** (jamais d'override brut) : barre-résumé
(Qualificatif=Excellent, Note globale=4.8, Volume=93 avis, Contrôles=true) + les 5 cartes appariées à
leur contenu **par position (x croissant)**, jamais par nom de calque (T048/T021), identiques aux 7
occurrences précédentes.

**Verdict final** (`proofs/a-propos/verdict.json`) : `outsideDiffCount = 0` ✅ (SC-003) · `diffCount`
(39238) **égale exactement** `regionDiffCount` — toute la diff est contenue dans la région déclarée ·
`regionPct = 7,708 %` (identique à Accueil/Dépannage : même contenu, même bloc) · `Motorisation` :
`identical`, `diffCount 0` · totaux **8 identical + 1 diff + 0 dimension-mismatch + 0 capture-failed**.
Signature `sha256` : **8 des 9 maquettes byte-identiques avant↔après**, seule À Propos diffère
(`3ac7df2c…` → `b7a3afbb…`) — dimensions préservées (pas de dimension-mismatch déguisé).

**Revue à l'œil (obligatoire, crop `proofs/a-propos/crops/À Propos.png`)** : barre-résumé quasi sans
diff, écart concentré sur les 5 cartes — substitution de police, couleur d'avatar, badge de
vérification, photo de contenu carte 5 (hors contrat, A5) : **tous des résidus déjà nommés en T040**,
rien de nouveau.

**Ledger** : reporté à T059 (consolidation finale), conformément à T023.

**Verdict** : ✅ T055 fait. Chemin propre (convergence 1 passe, 0 résidu collatéral). Chiffres et crop
publiés ici pour revue a posteriori.

### T056 — Adopter Contactez-nous (2026-07-26) — **8ᵉ et dernière occurrence**

**Checkpoint** `006/adoption/contactez-nous` → `2380525700182315678`. 9/9 captures avant (0 échec,
manifests 9/9 ok). Réceptionneur port 9229 (même raison qu'en T055 : 9227 occupé par le pont).

**Occurrence** : `GROUP 280:3792` (« Avis Google »), aplat `RECTANGLE 280:3796`
(x:88/y:2475/w:1552/h:328), `SectionHeader 2094:2468` frère intact (x:89/y:2344/w:1550/h:83), cadre
parent `Contactez-nous 274:2464` (h:3901, 7 enfants). Écart attendu (T048) : `outsideDiffCount 0`,
`regionPct` ≈ 7,7 %, `Motorisation` identical.

**Remplacement + convergence** : offset relatif **131** appliqué dès le départ (leçon T055) →
`inst.y = groupTop 2344 + 131 = 2475` (= y de l'aplat d'origine). Convergence des deux enfants en
**4 passes**, GROUP exactement `88/2344/1552/459` (h:459 correcte dès la 1ʳᵉ passe, pas de reprise
d'offset cette fois).

**Garde FR-012** (relue deux fois) : cadre h:3901 inchangé, **les 7 enfants bit-identiques à la ligne
de base avant-mutation** — 0 dérive, aucun résidu collatéral.

**Contenu appliqué par propriétés** : barre-résumé (Excellent / 4.8 / 93 avis / Contrôles) + 5 cartes
appariées par position (x croissant), identiques aux 7 occurrences précédentes (T048/T021).

**Verdict final** (`proofs/contactez-nous/verdict.json`) : `outsideDiffCount = 0` ✅ (SC-003) ·
`diffCount` (39238) **égale exactement** `regionDiffCount` · `regionPct = 7,708 %` (identique aux 7
autres : même contenu, même bloc) · `Motorisation` : `identical`, `diffCount 0` · totaux **8 identical
+ 1 diff + 0 dimension-mismatch + 0 capture-failed**. Signature `sha256` : **8 des 9 maquettes
byte-identiques avant↔après**, seule Contactez-nous diffère (`cd5a8bfd…` → `face7fb2…`) — dimensions
préservées.

**Revue à l'œil (obligatoire, crop `proofs/contactez-nous/crops/Contactez-nous.png`)** : barre-résumé
quasi sans diff, écart concentré sur les 5 cartes — police, avatar, badge, photo carte 5 (A5) : **tous
des résidus déjà nommés en T040**, rien de nouveau.

**Verdict** : ✅ T056 fait. **Les 8 occurrences sont adoptées** (Accueil, Portes de garage, Portes de
garage résidentielles/industrielles, Portes d'entrée, Dépannage/SAV, À Propos, Contactez-nous) — chemin
propre de bout en bout (T051→T056 : convergence courte, 0 résidu collatéral). Reste de la Phase 4d :
T057 (fills photo), T058 (assertion de fin + re-scan positionnel), T059 (ledger).

### T057 — Fills photo : **sans objet par mesure** (2026-07-26)

**Décision, conséquence directe de T022** : la tâche est écrite pour « appliquer les 8 fills photo
(override de fill IMAGE sur la part `avatarPhoto`) ». Mais la mesure (T012/T021/T022) a établi
**0/5 avatar photo** sur l'échantillon des 5 avis, appliqué aux 8 occurrences — **toutes les cartes
adoptées portent `Avatar initiale = true, Avatar photo = false`** (vérifié en lecture sur chaque
instance en T049→T056). Il n'existe **pas** de `measures/avatar-photo.png` (T022 : aucune source
d'avatar photo à recadrer). La seule photo présente dans l'aplat est attachée au **contenu** de la
carte 5 (rendu du raster de l'aplat), pas à un avatar, et n'est **pas** portée par la part
`avatarPhoto` (A5, trou ouvert et nommé).

**Il n'y a donc aucun fill IMAGE à appliquer, sur aucune des 8 occurrences.** Écrire « 8 fills
appliqués » serait un mensonge ; sauter la tâche en silence serait l'omission que la constitution
proscrit. La tâche est **close comme sans objet par mesure** — pas « faite », **inapplicable**.

**Conséquence pour T059** : la ligne « 8 fills photo » annoncée par T023 dans
`ledger/google-reviews.json` devient **moot** — elle sera consignée comme `type: "image", count: 0,
raison: "0/5 avatar photo mesuré (T022)"` plutôt qu'omise. La capacité `avatarPhoto`/A5 reste dans le
contrat et sera exercée par la démo US4/T071 avec un exemple fabriqué (jamais tiré des maquettes).

**Verdict** : ✅ T057 clos — sans objet par mesure, nommé plutôt qu'omis.

### T058 — Assertion de fin d'adoption (2026-07-26)

**Deux vérifications requises par la tâche :**

**① Re-scan positionnel (8 GROUP)** — script bridge, résultat immédiat :

| Maquette | GROUP | kids | hasWidgetRect | governedInstance | hasHeader |
|---|---|---|---|---|---|
| Accueil | 210:441 | SectionHeader INSTANCE + GoogleReviews INSTANCE | false | true | true |
| Portes de garage | 226:227 | idem | false | true | true |
| Portes de garage résidentielles | 230:645 | idem | false | true | true |
| Portes de garage industrielles | 387:817 | idem | false | true | true |
| Portes d'entrée | 237:1095 | idem | false | true | true |
| Dépannage/SAV | 249:1623 | idem | false | true | true |
| À Propos | 258:1963 | idem | false | true | true |
| Contactez-nous | 280:3792 | idem | false | true | true |

**Tous les 8 blocs** contiennent exactement `[SectionHeader INSTANCE, GoogleReviews INSTANCE]`, **zéro RECTANGLE trustindex/widget**.

**② Scan global des résidus IMAGE fill** (toute la page `210:325`) :

- `residualWidgetNodeCount = 0` ✅ — zéro nœud nommé `trustindex` ou `google-reviews-widget`
- `imageRectCount = 43` — les 43 RECTANGLE IMAGE restants sont tous légitimes :
  - `google-map` (carte Dépannage/SAV, attendu)
  - `fun-ia` / `normal` (364×364, galerie photo, IDs imbriqués sous `2115:4044`, hors périmètre bloc)
  - **Aucun n'est un aplat widget Avis Google**
- `motorisationAvisGoogleBlocks = 0` ✅ — Motorisation sans bloc (attendu, SC-003)

**Verdict de phase (constitution §Quality Gates — SC-001, SC-003)** : ✅ T058 fait.
L'instrument par occurrence (T051→T056) a produit **8 diff + 1 identical (Motorisation)** à chaque cycle
— combinaison conforme à `contracts/region-proof.md §4`. Le re-scan global confirme 0 résidu widget.
Phase 4d close.

