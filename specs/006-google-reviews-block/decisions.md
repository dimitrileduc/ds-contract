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

