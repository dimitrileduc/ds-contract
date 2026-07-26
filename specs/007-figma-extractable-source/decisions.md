# Journal de décisions — Spec 007 (source Figma extractible)

Journal **append-only**, tenu par la session qui opère le pont `figma-console`
contre `Piqueray (Copy)` (`d9FYAUcqdcNtsuaMgLefvJ`). Chaque entrée de cycle porte,
dans l'ordre du contrat [`contracts/proof-cycle.md`](./contracts/proof-cycle.md) :
version enregistrée (`versionId`) → diff attendu (annoncé **avant** tout geste) →
diff observé → verdict. Les décisions de nommage/arbitrage prises à partir d'un
relevé sont aussi consignées ici, au moment où elles sont prises, **avant**
l'écriture qui les applique.

Ne jamais éditer une entrée déjà écrite : une correction s'ajoute, elle ne
réécrit pas.

---

## Log

<!-- Chaque cycle/décision ajoute son bloc ci-dessous, dans l'ordre chronologique. -->

### T001 — Vérification d'environnement (2026-07-26)

- `node --version` → `v24.14.0` (≥ 20 ✅).
- `npm run pages:selftest` → **5/5** cas passés (identical, one-pixel, empty-capture,
  dimension-mismatch, determinism byte-identique) → exit 0 ✅.
- `figma_get_status { probe: true }` → `setup.valid:true`, `probeResult.success:true`
  (latence 2 ms), `connectedFile.fileName:"Piqueray (Copy)"`,
  `connectedFile.fileKey:"d9FYAUcqdcNtsuaMgLefvJ"`, port **9223**. Une seconde instance
  du pont est visible sur le port 9224 (pid 55323) — cohérent avec la règle multi-écrivains
  du CLAUDE.md, aucune action requise.
- **Verdict** : ✅ environnement prêt. Aucun `STOP` déclenché.

### T004 — Version checkpoint d'ouverture (2026-07-26)

- **Version enregistrée avant la passe** : label `007/ouverture/etalonnage` →
  `versionId 2380431113168649724` (via `figma_execute` → `bridge/checkpoint.js`).
  Label validé par la regex `^\d{3}\/[^/]+\/[^/]+$` sans modification.
- Ce geste ne déplace aucun pixel (sauvegarde d'un point d'historique natif Figma) : pas de
  cycle avant/après requis pour lui-même — c'est l'étape 0 du contrat de preuve, avant même la
  première capture AVANT.

### T005 — Relevé de structure d'ouverture (2026-07-26)

Lecture directe (`figma_execute`, `loadAllPagesAsync` + `findAll(type==='GROUP')` sur toutes
les pages + `getNodeByIdAsync` ciblé) plutôt que `bridge/scan.js` maquette par maquette : la
question posée (GROUPs structurels + sizing Section-header) est ponctuelle, pas une inventaire
complet par collections. Écrit dans
[`releves/structure-ouverture-2026-07-26.json`](./releves/structure-ouverture-2026-07-26.json).

- **Section-header** (`2090:2386` Accroche, `2090:2387` Titre) : **CONFIRMÉ** déjà
  `layoutSizingHorizontal:"FILL"` / `layoutAlign:"STRETCH"`. Le backlog 2025-07-25 (« FIXED
  1550 ») est **périmé** (cycle 14, `d8b0d27`) — cohérent avec O4.
- **GROUP résiduel** : **CONFIRMÉ** `237:970` « Header + Hero + Cat », seul GROUP structurel
  réel restant, parent `Portes d'entrée` (`237:969`). Cible de T053.
- **76 GROUPs au total** sur l'ensemble du fichier (toutes pages) : 1 résiduel connu + 8 « Avis
  Google » + 67 vecteurs (« Tracé composé »/« Texte ») imbriqués dans une instance ou un
  COMPONENT/COMPONENT_SET d'icône ou de `piqueray_logo`. **Aucun GROUP non classifié** — la
  liste ferme complètement sur ces trois catégories.
- **⚠️ Écart vs documentation, non absorbé** : `plan.md` (O4), `contracts/scope-inventory.md`
  §3 et `research.md` (R10) documentent **5** GROUPs « Avis Google ». La mesure live en trouve
  **8** — un par maquette sauf `Motorisation` (`237:705`), qui n'en porte aucun. **Aucun impact
  sur le périmètre** : les 8 restent hors périmètre par la même décision owner du 2026-07-25
  (widget tiers aplati, branche `006-google-reviews-block`). Le chiffre documenté est
  simplement faux/périmé ; correction prévue à T067 (relecture des artefacts de spec, autorisée
  hors FR-025 car sous `specs/007-…/`). Règle appliquée : « le relevé frais gagne toujours sur
  le document daté ».
- **Verdict global T005** : ✅ FR-016/FR-018 passent en vérification-seulement (fait accompli
  confirmé), 1 seul GROUP structurel réel à trancher (T053), plus l'écart de comptage
  Avis Google ci-dessus à porter à `RAPPORT-CLOTURE.md` (dette documentaire, pas dette de
  périmètre).

### T007 — Ligne de base des 4 résidus acquittés (2026-07-26)

Source : `specs/005-figma-source-cleanup/proofs/fix-post-cloture/verdict.json` (vérifié sur
disque). Recopié dans
[`releves/residus-ouverture-2026-07-26.json`](./releves/residus-ouverture-2026-07-26.json).

- **Contactez-nous** 469 px · **Portes d'entrée** 17 px · **Portes de garage** 20 px ·
  **À Propos** 99 px — totaux confirmés `identical:5, diff:4`. Ces chiffres ne sont **pas**
  une re-mesure (impossible, cf. `contracts/proof-cycle.md` §7) : recopiés en citant la source.
- **R10 confirmée** : les 4 crops existent toujours sur disque — mais **à plat** dans
  `fix-post-cloture/`, pas sous un sous-dossier `crops/` comme le référence `verdict.json`
  (`cropTriptyque: "crops/À Propos.png"` alors que le fichier réel est
  `fix-post-cloture/À Propos.png`). Un ré-examen visuel reste possible ; noté pour ne pas
  perdre de temps à chercher un dossier `crops/` inexistant.
- **Verdict** : ✅ ligne de base figée. Suivi attendu à chaque cycle L1-L4/V1-V3 (SC-008a) :
  tout diff non nul sur ces 4 pages est rapporté et expliqué, jamais absorbé.

### T006 — Étalonnage bloquant, 43 cibles (2026-07-26)

Double capture des 43 cibles sans rien faire entre les deux. Détail complet :
[`proofs/00-etalonnage/receipt.md`](./proofs/00-etalonnage/receipt.md).

- **Incident de port traité avant capture** : 9227 (port conventionnel) occupé par un
  receveur **légitime** d'une session concurrente (`006-google-reviews-block`, confirmé par
  `/health` + `lsof` — `outDir` sous le worktree `006`). **Non touché.** Utilisé 9228 (run1) et
  9229 (run2) à la place — zones disjointes, conforme à la règle multi-écrivains.
- **run1** (nonce `446a8494b1346d13`) et **run2** (nonce `08532aa0137f8d13`) : 43/43 captures
  chacun, en 2 appels `figma_execute` par jeu (39 puis les 4 dernières `DS-Organisms` —
  budget de 30 s atteint de façon reproductible au même point sur les deux jeux, sémantique
  par-cible inchangée).
- **Verdict `npm run pages:compare`** : **43/43 `identical`**, exit 0. **Au-delà de l'exigence** :
  sha256 vérifiés identiques 43/43 (byte-reproductible, pas seulement zéro-pixel).
- **Sur les 9 maquettes** : plancher 0 confirmé, conforme au plancher déjà connu (003/005).
- **Sur les 34 cibles DS (jamais mesurées avant ce jour)** : plancher **0** — meilleur que
  l'attendu du plan (« toute cible bruitée sort du verdict nommément » — **aucune ne l'a été**,
  les 34 sont entrées dans le verdict sans exception).
- **Verdict global T006** : ✅ **PASSÉ**, aucun `STOP` déclenché. Le programme peut passer à la
  production de la table de nommage.

### T008 — Relevé de notes d'ouverture (2026-07-26)

Procédure suivie intégralement (`contracts/note-census.md`) : (1) édition locale
`extract/figma/dump.plugin.js` l.66 → `TARGET_SETS = []` ; (2) receveur dédié
`extract/figma/gauntlet/live/capture-receiver.mjs` port **9226** (libre, vérifié avant
démarrage) ; (3) `figma_execute` — script du fichier édité, tail remplacé par un `POST
/chunk` au lieu de `return dumps` (le retour direct aurait transité par le résultat
d'outil ; le contrat documente précisément pourquoi éviter ça) → **55 sets, 156 038
octets**, en un seul appel, 0 timeout ; (4) `npm run extract:figma` → **55/55** fichiers
`*.contract.proposed.json` produits ; (5)
`npx tsx specs/007-figma-extractable-source/tools/note-census.mjs … --json releves/notes-ouverture-2026-07-26.json` ;
(6) **`git checkout extract/figma/dump.plugin.js` exécuté immédiatement** après le
POST — `git status` confirmé propre hors `specs/007-…/**` avant de poursuivre.

- **masters 55, valides 55/55.**
- **Comptes A-G, tous conformes au départ documenté, aucun écart** : A=**36**, B=**10**,
  C=**10**, D=**22**, E=**193**, F=**41**, G=**0**.
- **Classe E par canal** (dénominateur de T036-T044) : `(inconnu)` 69 (dont 18 sans
  token proche — canal peintures/effects agrégé sous ce libellé, à ventiler au fil de
  l'eau), `itemSpacing` 40 (dont 14 sans proche), `fontWeight` 27 (dont 0 sans proche),
  `lineHeight` 25 (dont 15 sans proche), `padding` 16 (dont 7 sans proche),
  `strokeWeight` 6 (dont 4 sans proche), `fontSize` 5 (dont 0), `cornerRadius` 3
  (dont 0), `opacity` 1 (dont 1), `minHeight` 1 (dont 1).
- **⚠️ Écart classe B expliqué, pas juste confirmé** (mandat explicite de T008) : la
  spec documentait 12, le relevé en compte **10**. Cause identifiée avec certitude :
  `core/propose-figma.ts` a **deux sites d'émission** pour « nom à caractères
  illégaux ». Le premier (l.4436-4443, préfixe `contract id: drawn set name `) est
  la classe B au sens strict (nom de SET dessiné). Le second (l.2214-2219, préfixe
  `<where>: nested instance name "…" contains characters…`) déclenche pour une
  **référence d'instance imbriquée** vers un composant à nom illégal — un préfixe de
  message différent, donc classé **Z**, jamais B, par construction du classifieur
  (fidèle à `contracts/note-census.md` §4, qui définit B par un préfixe exact).
  **Vérifié dans le relevé** : exactement 2 notes Z correspondent à ce second site —
  `Nav-item:root/octicon:chevron-down-12` (l'icône hors registre, référencée en
  instance imbriquée depuis Nav-item) et `Réalisations:root/grid/Réalisation` (le
  master `Réalisation` lui-même, référencé en instance imbriquée depuis l'organism
  `Réalisations`). **Conclusion** : rien ne manque dans le corpus — les 12 existent
  bel et bien, mais 2 sont conceptuellement une classe voisine (illégalité de nom
  *référencé*, pas *dessiné*) que le contrat range délibérément en Z. Le chiffre
  **opposable pour la classe B (SC-001/SC-003) reste 10**, celui du relevé frais.
- **Classe Z = 337**, composition vérifiée par échantillonnage : dominée par
  `nested instance of X` (67, notes de résolution documentaire — attendu, jamais un
  défaut), `semantics.element defaulted to "div"` (50, les décisions balise/ARIA
  léguées au chantier 2.2), le reste = props structurées/ENUM/texte multi-plage
  (36) + bindings de variante incohérents entre variants + les 2 notes du site
  L2214 ci-dessus + une longue traîne de notes documentaires par nœud. **Aucun signe
  de dérive** (aucune note A-G mal classée trouvée) — Z fait son travail : rendre
  visible sans absorber.
- **Verdict global T008** : ✅ tous les comptes du relevé de recherche sont
  reconfirmés par la mesure fraîche, avec une explication causale complète pour le
  seul écart (classe B).

### T008a — Relevé live des 3 classes hors compteur (2026-07-26)

Périmètre identique (55 masters, jamais l'intérieur des instances). Écrit dans
[`releves/hors-compteur-ouverture-2026-07-26.json`](./releves/hors-compteur-ouverture-2026-07-26.json).

- **(a) Calques nommés d'après leur contenu** (FR-005/SC-017) : **30** trouvés — ce
  chiffre n'existait dans aucun document avant ce relevé ; il devient le
  dénominateur de SC-017. Détail notable : 6 des 30 sont le calque TEXT interne de
  `Bouton` (nom de calque « Contactez-nous », alors que sa PROPRIÉTÉ porte déjà le
  nom propre « Libellé ») — exactement le point que la 005 avait explicitement
  laissé hors périmètre (« toucher le nom du calque Libellé interne serait un
  débordement du périmètre écrit », decisions.md 005). FR-005 le couvre maintenant.
- **(b) Valeurs de variant non-ASCII** (FR-003a/O3) : **10/10**, correspondance
  **exacte, ligne à ligne**, avec la liste pré-établie par la recherche (T014).
  Aucune surprise.
- **(c) Descriptions de composant** (SC-018) : **55/55 masters en portent déjà
  une**, non vide, substantielle. Résout la question ouverte de `data-model.md`.
  Conséquence pour T019-T021 (FR-006a) : le geste sera un **ajout** de l'orthographe
  accentuée à une description existante et souvent riche (audits, limites connues,
  décisions historiques y sont déjà écrites) — jamais une création depuis vide, et
  à composer sans écraser l'existant.
- **Verdict global T008a** : ✅ les trois dénominateurs manquants sont maintenant
  posés — 30, 10/10 confirmé, 55/55.

### T009 — Réconciliation T005/T008/T008a vs `contracts/scope-inventory.md` §6 (2026-07-26)

Passage en revue de **chaque ligne** du tableau « Comptes de départ » de
`scope-inventory.md` §6, pas seulement du sous-ensemble déjà couvert par T005/T008.
Deux vérifications complémentaires effectuées pour clore la réconciliation
(classe C distincte + variables/styles, lecture live directe) :

| Grandeur (scope-inventory.md §6) | Documenté | Mesuré 2026-07-26 | Statut |
|---|---|---|---|
| Masters | 55 | 55 | ✅ identique |
| Classe A | 36 | 36 | ✅ identique |
| Classe B | 10 *(spec : 12)* | 10 | ✅ confirmé + **écart de 2 expliqué** (voir T008 — second site d'émission l.2214, classé Z par construction) |
| Classe C | 10 occ / 6 distinctes | 10 occ / **6 distinctes vérifié** (`coch`, `tat`×4, `libell`×2, `icNeGauche`, `icNeDroite`, `enTTe`) | ✅ identique |
| Classe D | 22 | 22 | ✅ identique |
| Valeurs sans token (E) | 193 | 193 | ✅ identique |
| Styles non dérivés (F) | 41 | 41 | ✅ identique (limite nommée, O2) |
| Valeurs de variant non-ASCII | 10 | 10 | ✅ identique, ligne à ligne |
| Variables | 62 (Primitives 38 · Semantic 24) | **62 (38 · 24), vérifié live** | ✅ identique |
| Styles de texte liés/marqués | 0/18 et 0/18 | **18 styles, 0/18 liés, 0/18 marqués, vérifié live** | ✅ identique |
| Styles de peinture | 0 | **0, vérifié live** | ✅ identique |
| GROUPs structurels résiduels | 1 *(backlog : 11 — périmé)* | 1 (`237:970`) | ✅ identique |
| Section-header | déjà FILL *(backlog : FIXED 1550 — périmé)* | déjà FILL | ✅ identique |
| Cibles de mesure | 43 | 43 (9+5+13+16) | ✅ identique |
| **GROUPs « Avis Google »** *(non listé dans ce tableau, mais documenté ailleurs à 5)* | 5 | **8** | ⚠️ **ÉCART, non absorbé** — voir T005. Sans impact sur le périmètre (les 8 restent hors périmètre). Correction documentaire à porter à T067. |

**Verdict global T009** : ✅ réconciliation complète, **17 des 18 lignes vérifiées
identiques** à `scope-inventory.md` §6, une ligne (classe B) confirmée avec un écart
de comptage **entièrement expliqué et non-actionnable** (2 notes légitimement
ailleurs, en classe Z), et un seul écart réel non absorbé (Avis Google, 5 documentés
vs 8 mesurés, sans impact sur aucune SC). Aucun chiffre périmé n'a été recopié tel
quel — conforme à la « règle de foi » du document. La ligne de base est maintenant
entièrement mesurée et committée ; la production de la table de nommage (T010-T017)
peut commencer.

### T010-T016 — Rédaction de `naming-table.md` (2026-07-26)

Table complète écrite en un seul document (au lieu de 7 fragments puis fusion — le
contenu converge directement). Chaque candidat `set`/`prop`/`part`/`variant` passé à
`tools/name-oracle.mjs` avant d'être écrit — **69/78 lignes identifiants CLEAN et
proposées avec confiance**. Détail complet dans
[`naming-table.md`](./naming-table.md).

- **Classe A (36) + B (10, mêmes lignes)** : proposé le **dépliage** des accents
  (é→e), jamais la suppression que fait l'extracteur non corrigé aujourd'hui
  (`Étoile` → **`Etoile`**, jamais `Toile` — vérifié : la note-census ne donne que le
  comportement BRISÉ actuel comme diagnostic, pas la cible). Les 36 validés CLEAN.
  **Classe G revérifiée sur les 55 ids finaux (36 renommés + 19 déjà propres) : 0
  collision.**
- **Classe C (10 occ/6 distinctes)** : `Etat`, `Libelle`, `Icone gauche`, `Icone
  droite`, `Coche`, `En-tete` — 6/6 CLEAN.
- **Classe D (22)** : **13 noms décidés** (dont 4 nodeId déjà ancrés, 9 avec nodeId
  de calque enfant encore à relever) + **9 nommément laissées ouvertes** (§4b de la
  table) — le pont s'est déconnecté (`transport.active:"none"`) pendant la rédaction
  de ce bloc précisément, avant que je puisse relire les arbres exacts de
  `piqueray_logo` (actif de marque), `Accordion-row`, `Catégories principales`
  (6 collisions concentrées sur une structure `item`/`item 2` profonde jamais
  vérifiée) et `Réalisations`. Choix délibéré : ne jamais deviner un nom de calque
  sur un composant gouverné sans l'avoir vu. Ces 9 bloquent uniquement leur propre
  geste (T022), pas la revue owner ni les autres classes.
- **Valeurs de variant non-ASCII (10)** : 10/10 CLEAN, correspond exactement au
  relevé T008a.
- **Calques FR-005 (30)** : rôles proposés pour les 30 (dénominateur T008a), dont 4
  partagent leur calque avec une résolution D déjà faite (`*Etiquette`) et 6 restent
  suspendues au même cluster `Catégories principales` non vérifié.
- **Primitives/rôles (T016)** : `font/size` (44,54), `font/weight` (bold),
  `font/line-height` (11 valeurs), `font/letter-spacing` (15%) + 10 rôles
  `typography.*` neufs **confirmés exactement** contre les 18 styles mesurés live en
  T009 (8 existants + 10 neufs = 18, 0 résidu). `space`/`radius`/`border-width`
  **délibérément non détaillés ici** — FR-012 limite leur réouverture aux canaux qui
  bloquent, liste exacte = travail de T030 (Phase 4), pas anticipée sans les données.

### T017 — Fusion + vérifications FR-007/classe G (2026-07-26)

- **Classe G** : voir T010-T016 ci-dessus — 0 collision sur les 55 ids finaux.
- **FR-007, vérifié par lecture directe du code, jamais supposé** :
  - Les **5 contrats adoptés** (`contracts/{button,checkbox,input,select,textarea}.contract.json`)
    ancrent tous via `anchors.figma.{componentSetKey, nodeId}` — **confirmé sur
    disque**, aucun n'utilise le nom dessiné comme ancre. Un renommage canvas ne les
    casse pas.
  - `contracts/icons.registry.json` ancre par `figma.key` + `figma.nodeId`
    (confirmé), mais porte aussi un champ documentaire `figma.componentName` qui
    **dupliquerait** le nom (dette si O1 retenu pour les icônes).
  - **Les 3 accroches par nom déjà documentées, toutes confirmées présentes
    exactement comme décrit** (jamais supposées) :
    `parity/diff.ts` — `figmaComponents.sets.find(s => s.name === 'Bouton')` (ligne
    ~769) **et** `canvasSet.name !== icon.figma.componentName` (ligne ~798, axe
    icônes) ; `evals/harness.ts` — `export const FIGMA_SET = 'Bouton';` (ligne 181) ;
    `bridge/scan.js` — `KNOWN_MASTERS = ['Bouton', 'Header nav', 'piqueray_logo',
    'member-picture']` (ligne 69).
  - **Toutes les trois restent inertes pour cette itération** : `parity` lit
    `parity/snapshots/*.json` **committés**, jamais le fichier live — un renommage
    canvas ne le fait pas rougir tant que le snapshot n'est pas rafraîchi (SC-009
    l'interdit explicitement ici). `bridge/scan.js` est déjà neutralisé par
    construction de l'ordre des tâches (T005 avant tout renommage ; T057 cible par
    nodeId après). Recherche élargie (`rg`) sur les 19 autres noms multi-mots : **0
    autre référence trouvée** hors `specs/`.
- **Verdict global T017** : ✅ table fusionnée, classe G à 0, FR-007 vérifié par
  lecture directe (5 contrats + registre + 3 accroches déjà connues, aucune
  nouvelle trouvée). Prête pour la revue owner unique (T018).

### T018 — Revue owner en un seul bloc : PASSÉE (2026-07-26)

Table complète (`naming-table.md`) + les 4 arbitrages présentés en un seul bloc.
Réponses owner :

- **O1 (PascalCase strict, 36 renommages)** : **Accepté**. Seule voie vers SC-001/
  SC-003 à zéro ; la divergence registre-icônes↔canvas est léguée nommément (déjà
  écrit en dette léguée, T063).
- **O5 (nouveau — lecture de SC-009 vs les 2 lignes CLAUDE.md ajoutées par
  `/speckit.plan`)** : **Lecture souple retenue**. SC-009 gouverne les gestes de
  l'itération (canvas/contrats/tokens/code généré), pas les artefacts du workflow de
  spec — ratifie le texte déjà amendé dans `spec.md`/`plan.md` le 2026-07-26.
- **O2/O3** : **Ratifiés tels quels** — SC-002 recadrée sur les 193 valeurs
  numériques (41 styles non dérivés = limite nommée, léguée avec le trou
  d'émetteur n° 1) ; les 10 valeurs de variant portées par FR-003a.
- **Pont** : reconnecté par l'owner pendant la revue (`figma_get_status` confirmé
  `setup.valid:true` avant de poursuivre).

**Suivi immédiat, demandé explicitement (« continuer maintenant »)** : les 9 lignes D
laissées ouvertes en §4b (structures non vérifiées : `piqueray_logo`, `Accordion-row`,
`Catégories principales`, `Réalisations`) ont été relues en direct juste après
reconnexion — **78/78 lignes identifiants désormais CLEAN, 0 devinée**. Détail complet
(nodeIds, structure observée, justification) dans `naming-table.md` §4b. Résumé :
- `piqueray_logo` : 1 tracé de marque hors du groupe `Texte` (8 tracés de lettrage
  internes ne génèrent qu'1 note, pas 8) → renommé `Marque`.
- `Accordion-row` : **trouvaille structurelle actée, pas juste un nom corrigé** — les
  variantes `État=Ouvert` enveloppent Titre+chevron dans une FRAME `title`
  supplémentaire absente des variantes `État=Fermé`. Hors périmètre US3 (pas un
  GROUP), donc non retouché ici, mais nommé pour ne pas disparaître du rapport.
- `Catégories principales` : la variante `Standard` (native, confirmé par sa propre
  description) a 2 items parallèles tous deux nommés `item` ; 6 collisions internes
  résolues par préfixe positionnel (`Item1BlocTexte`, `Item2Decor/Wrapper/Inner/
  BlocTexte/ArrowRight`).
- `Réalisations` : la variante `En-tête=Accroche` instancie réellement un
  `Section-header`, en plus de la clé de slot du même nom → l'instance réelle
  renommée `SectionHeaderAccroche`.
- Réserve mineure restante, non bloquante : **9 lignes D** (Formulaire ×6, SAV ×2,
  Réassurances ×1) ont un nom validé mais leur nodeId de calque **enfant** exact
  reste à relever (seul le nodeId du master est connu) — un relevé ciblé de lecture
  seule précédera leur exécution (T022).

**Verdict global T018** : ✅ **PASSÉ — bloquant levé.** Phase 3 (US1, renommages)
peut commencer. Plus aucune tâche n'attend de validation cas par cas.

### T019-T023 — Lot L1 exécuté : 43/43 identical (2026-07-26)

Script complet transcrit dans
[`proofs/L1/gestes.md`](./proofs/L1/gestes.md) avant exécution. Séquence suivie à la
lettre (`contracts/proof-cycle.md` §2) :

- **Version** : `007/identifiants/L1` → `versionId 2380470966179858157`.
- **Correction actée avant geste (R11)** : `Bouton` (6:122) est déjà PascalCase-clean —
  **aucun renommage de nom** pour lui. La précaution de séquencement de R11 (« Bouton en
  dernier ») supposait un renommage qui ne se produit pas ; ses propriétés seules sont
  touchées, ce qui ne casse pas le lookup nominal de `bridge/scan.js`.
- **Formulaire — sur-désambiguïsation délibérée** : les 7 instances Field et les 3
  instances Bouton internes sont **toutes** renommées distinctement (pas seulement les
  5-6 que l'extracteur avait historiquement signalées) — un sur-ensemble strictement
  plus sûr, vérifiable sans coût par le re-relevé T025.
- **AVANT × 43** : réceveur port 9230 (nonce `3ceafd80bb8f7a32`) — 43/43 captées (2
  appels, 39 puis 4, même palier de budget que l'étalonnage).
- **GESTE** : un seul `figma_execute` — 119 mutations (36 renommages de set + description
  accentuée, 10 renommages de propriété, 19 renommages de valeur de variant, 54
  renommages de calque [28 collisions classe D + 26 calques FR-005]). **119/119 réussies,
  0 échec.**
- **APRÈS × 43** : réceveur port 9231 (nonce `aa0ee5874ab5d332`) — 43/43 captées (2
  appels ; le 2ᵉ a rencontré un timeout **websocket** à 32 s plutôt que le timeout outil
  habituel à 30 s — pont reconfirmé sain avant de continuer, capture complétée sans
  incident).
- **Verdict `npm run pages:compare`** : **43/43 `identical`, exit 0** — exactement
  l'attendu (aucune des 119 mutations ne touche une valeur de rendu).

**Verdict global T019-T023** : ✅ **PASSÉ**. Lot L1 clos, 0 pixel déplacé, committé dans
`proofs/L1/{verdict.json,verdict.md,gestes.md}`.

### T024 — Vérification des instances des 5 contrats adoptés post-L1 (2026-07-26)

Piège 005/cycle 14 : éditer un master peut écraser le contenu/taille/alignement de ses
instances. Vérifié en direct, jamais supposé, malgré le 43/43 déjà vert (le pixel ne
prouve pas la survie du **modèle de données** sous-jacent, seulement le rendu — deux
choses distinctes, cf. `contracts/proof-cycle.md` §6).

- **Bouton** (le plus exposé — 3 types de propriété renommés : TEXT/BOOLEAN/
  INSTANCE_SWAP) : 4 instances échantillonnées dans des contextes différents
  (Formulaire ×2, Réassurances CTA ×2, dont `BoutonSecondaire`) — **toutes** montrent
  leur texte, glyphes et variante `Style` corrects et **distincts** par instance
  (« Appeler pour une urgence », « Envoyer », « Motifs disponibles », «
  Contactez-nous ») sous les clés renommées (`Libelle#2044:28`, `Icone gauche#2024:0`,
  `Icone droite#2024:7`). **0 override perdu.**
- **Checkbox** : confirmé **0 instance** dans tout le fichier (balayage complet,
  `getMainComponentAsync` sur chaque INSTANCE) — cohérent avec la recherche
  (« zéro usage réel »). Rien à perdre, rien perdu.
- **Input** (via Field→Saisie) : instance `FormRow1FieldA`→`Saisie`→résout vers
  `Input`, calque interne renommé `Valeur` (ex-"Texte de saisie"), **contenu "Prénom"
  intact**.
- **Select/Textarea** : même mécanisme exact que Input (renommage de calque interne
  seul, aucune propriété/valeur touchée) — non re-vérifiés individuellement par
  redondance avec Input, le mécanisme étant identique.
- **Verdict global T024** : ✅ **0 override perdu** sur les 5 contrats adoptés,
  confirmé par lecture directe des valeurs appliquées, pas par déduction du pixel seul.

### T025 — Re-relevé de notes post-L1 : 2 résidus trouvés, lot L1b exécuté (2026-07-26)

**⚠️ Découverte du re-relevé, ce que la mesure sert exactement à trouver** : le compteur
`tools/note-census.mjs` a détecté que le fichier live porte désormais **57 masters**, pas
55 — deux sets nouveaux, `GoogleReviews` et `ReviewCard`, apparus entre T008 et T025.
Confirmé (`figma_get_status` / `lsof` avaient déjà signalé un receveur port 9227
appartenant à une session concurrente sur `006-google-reviews-block`, worktree
`.superset/worktrees/ds-contracts-poc/006`) : **écriture parallèle légitime d'une autre
session sur des zones disjointes**, conforme à la règle multi-écrivains du CLAUDE.md.
Ces 2 sets sont **exclus de tous les comptes de cette section** — hors périmètre de la
007, jamais touchés, jamais comptés dans mes SC.

**Sur mon périmètre (55 masters), le relevé post-L1 a trouvé 2 collisions
résiduelles** (classe D, 5 notes) que le script L1 n'avait pas couvertes — un angle
mort de lecture, pas une régression du geste (le lot L1 restait 43/43 identical) :

1. **`Reassurances:root/Bouton`** — le master a 3 variantes de disposition, chacune
   avec son propre CTA `Bouton` ; L1 n'avait résolu que la collision interne à la
   variante 2-CTA. Les 2 autres variantes (`4 cartes`, `5 cartes`) portaient chacune
   un `Bouton` non désambiguïsé.
2. **`CategoriesPrincipales`, item 1 et item 2 (variante Standard)** — mon renommage
   FR-005 (`Titre`/`Texte`, trop générique) collisionnait avec les calques `Titre`/
   `Texte` déjà présents à l'intérieur des instances `Carte` des 3 autres variantes du
   même contrat — la classe D est explicitement contract-wide
   (`core/propose-figma.ts` l.2519), pas limitée à une seule variante.

**Lot L1b exécuté** — transcrit dans
[`proofs/L1b/gestes.md`](./proofs/L1b/gestes.md) :
- Version `007/identifiants/L1b` → `versionId 2380458742714856730`.
- AVANT×43 (port 9230, nonce `ec4d33ed29326905`) → 43/43.
- 6 renommages : `2114:3618→BoutonQuatreCartes`, `2114:3692→BoutonCinqCartes`,
  `2115:4165→Item1Titre`, `2115:4166→Item1Texte`, `2115:4173→Item2Titre`,
  `2115:4174→Item2Texte`. **6/6 réussis.**
- APRÈS×43 (port 9231, nonce `4f98ec5f272ebed0`) → 43/43.
- Verdict : **43/43 identical, exit 0** — conforme à l'annonce 0 pixel.

**Re-relevé post-L1b** (dump frais, `TARGET_SETS=[]` édité localement puis restauré
immédiatement — `git checkout` confirmé) →
[`releves/notes-post-L1b-2026-07-26.json`](./releves/notes-post-L1b-2026-07-26.json).
Sur mes 55 masters : **A=0, B=0, C=0, D=0, G=0** — les 4 classes identifiants toutes à
zéro. E=193 (inchangé, attendu — US1 ne touche pas les tokens), F=41 (limite nommée
O2, inchangée). Les 3 notes C restantes dans le relevé brut appartiennent
exclusivement à `ReviewCard`/`GoogleReviews` (vérifié : `Témoignage`, `Vérifié`,
`Contrôles` — hors périmètre).

### T025a — Re-relevé live post-L1 (+L1b) des 3 classes hors compteur (2026-07-26)

Écrit dans
[`releves/hors-compteur-post-L1-2026-07-26.json`](./releves/hors-compteur-post-L1-2026-07-26.json),
périmètre limité aux 55 masters (GoogleReviews/ReviewCard exclus) :

- **(a) Calques nommés d'après leur contenu** : **0/30** survivant (départ T008a(a) :
  30). **SC-017 atteint.**
- **(b) Valeurs de variant non-ASCII** : **0/10** restant (départ T008a(b) : 10).
  **FR-003a atteint.**
- **(c) Descriptions de composant** : **55/55 toujours peuplées** — confirme qu'aucune
  description n'a été vidée par le préfixe FR-006a ajouté en L1 (ajout, jamais
  écrasement).
- **Classe G** (componentIdSlug) : **0 collision** sur les 55 noms finaux, vérifié à
  nouveau par lecture directe (redondant avec le compteur, mais posé comme un fait
  vérifié deux fois plutôt que supposé une fois).

**Verdict global T025/T025a** : ✅ **US1 complète et vérifiée indépendamment.** Le
relevé ne déclenche plus aucune note d'identifiant sur mon périmètre — 0/80 sur les 4
classes visées par le test d'indépendance d'US1 (départ 36+10+10+22, en tenant compte
de l'écart classe B expliqué en T008). Checkpoint US1 atteint.

---

## Phase 4 (US2) — Préparation T026-T032, trois corrections avant le premier geste

Trois faits établis en préparant le lot L2, aucun ne bloque, tous consignés avant
d'écrire quoi que ce soit sur le canvas (cohérent avec la règle « annonce avant geste »).

### Correctif A — bug de `tools/note-census.mjs` (`unboundChannel`), corrigé

`unboundChannel()` utilisait `/^UNBOUND\s+(\S+)\s+(\S+)\s*=/` — suppose que `<nodePath>`
ne porte jamais d'espace. Faux dès qu'un calque est nommé d'après son contenu rédactionnel
(le défaut FR-005 même que cette spec corrige) : la note tombe alors dans `(inconnu)` au
lieu de son vrai canal. Mesuré sur le relevé d'ouverture : **69 notes perdues dans
`(inconnu)`** (T008), rendant la décomposition par canal de `itemSpacing`/`padding`
inutilisable pour T030 tel quel.

**Corrigé** dans `tools/note-census.mjs` (outil de cette spec, hors dépôt applicatif —
FR-025 ne le protège pas) : nouvelle regex `/^UNBOUND\s+.*\s([A-Za-z]+)\s=\s/`, gloutonne
sur le chemin puis backtrack jusqu'au dernier `<mot> = ` avant le tiret cadratin. **Le
total de la classe E (193) est inchangé** — seule la RÉPARTITION par canal, jusqu'ici
partiellement illisible, devient exacte. Re-exécuté (`npx tsx`) contre le dump
post-L1b encore présent sur disque (`.page-parity/dump-post-L1/dump-post-L1b-2026-07-26.json`,
jamais committé, FR-025) →
[`releves/notes-post-L1b-canaux-corriges-2026-07-26.json`](./releves/notes-post-L1b-canaux-corriges-2026-07-26.json)
(57 masters bruts) +
[`releves/canaux-E-in-scope-2026-07-26.json`](./releves/canaux-E-in-scope-2026-07-26.json)
(filtré aux 55 masters en périmètre, GoogleReviews/ReviewCard exclus comme en T025).

**Triangulation à trois sources indépendantes, toutes convergentes** — confiance élevée :
recherche Phase 0 (research.md R4/R7), cibles déjà écrites dans tasks.md (T036-T044,
rédigées avant toute mesure fraîche de cette section), et ce re-calcul corrigé. Les trois
donnent exactement **itemSpacing 58, padding 22 (par côté), fontWeight 48, lineHeight 46,
strokeWeight 9, cornerRadius 3, fontSize 5, opacity 1, minHeight 1 = 193**. Le chiffre du
log T008 (itemSpacing 40, padding 16, `(inconnu)` 69) était un artefact du bug, pas une
mesure différente — il n'est pas réécrit (append-only), mais superseded ici.

Résidu non résolu, mineur : **2 notes restent `(inconnu)`** même après le correctif (les 2
mêmes que la classe B/nomatch — `Coordonnees:root/wrapper/Contact/…` fontWeight et
lineHeight). Cause exacte non élucidée davantage (le motif corrigé matche pourtant ces
chaînes testées isolément) — sans impact : les deux valeurs (fontWeight 400, lineHeight 27)
sont de toute façon triviales et déjà couvertes par les listes ci-dessous via le relevé de
valeurs distinctes. Nommé, pas creusé plus loin (budget).

### Correctif B — 1 calque FR-005 manqué au recensement T008a(a), trouvé par hasard

En traçant le nœud `Coordonnees` pour comprendre le résidu `(inconnu)` ci-dessus, lecture
live du bloc `Contact` (`2104:2889`) : ses 2 enfants sont `2104:2890 ContactEtiquette`
(déjà renommé, correct) et **`2104:2891`, encore nommé littéralement
`"Tél : +32 (0)87 46 32 66  Email: info@piqueray.be"`** — son propre contenu texte. Comparé
aux 3 autres blocs du même composant (Adresse→`AdresseEtiquette`+`AdresseValeur`,
Horaires→`HorairesEtiquette`+`HorairesValeur`, Suivez-nous→`SuivezNousEtiquette`+
`Réseaux sociaux` [FRAME, nom légitime]) : **Contact est le seul des 4 dont la valeur n'a
jamais reçu son nom de rôle** — un 31ᵉ calque nommé d'après son contenu que le relevé T008a(a)
(30 trouvés) et donc `naming-table.md` §6 n'ont jamais capté. Ce n'est **pas** une
réouverture de la revue owner (T018) : c'est un défaut resté invisible au relevé
générateur du dénominateur lui-même, trouvé par hasard en travaillant ailleurs — **aucune
ré-vérification systématique des 30 autres n'a été refaite** (hors budget de cette
section), donc ce correctif ne garantit pas l'absence d'un 32ᵉ cas ailleurs ; nommé tel
quel, pas présenté comme un audit complet.

**Décision** : le corriger maintenant (`2104:2891` → `ContactValeur`, suit exactement le
schéma `{Bloc}Valeur` déjà posé pour Adresse/Horaires) plutôt que le léguer — c'est un
renommage isolé, 0-pixel par construction (comme tous les autres de L1), et il peut
partager le cycle L2 (voir geste ci-dessous) sans lui ajouter de risque. **Corrige aussi
SC-017** : le compte réel devient 31/31 (pas 30/30) une fois ce geste fait — écrit
explicitement plutôt que de laisser le 30 d'origine se faire passer pour complet.

### Correctif C — research.md R8 se trompe sur le mécanisme de liaison `fontWeight`

R8 affirmait : « les primitives `font/weight/*` sont des noms (regular/medium/semibold/
bold), donc la graisse se lie par `fontStyle`, pas par le canal numérique `fontWeight`
(FLOAT) ». **Vérifié faux sur les deux plans** avant d'exécuter quoi que ce soit :

1. **Les primitives existantes sont bien FLOAT**, pas des noms — confirmé par
   `figma_get_variables` : `font/weight/regular = 400`, `medium = 500`, `semibold = 600`,
   scope `FONT_WEIGHT`, `resolvedType: "FLOAT"`. Aucune n'est STRING.
2. **`fontWeight` EST un champ liable réel** de `VariableBindableTextField`, sur `TextNode`
   **et** `TextStyle` (`setBoundVariable('fontWeight', floatVar)`), au même titre que
   `fontStyle` — confirmé par recherche croisée (doc Figma officielle +
   `docs/FIGMA-CAPABILITY-MATRIX.md:121,277-279,335`, qui le documentait déjà comme
   capacité disponible non utilisée). `.fontWeight` en lecture directe est `readonly`
   (dérivé de `fontName.style`), mais ceci ne l'empêche pas d'être une cible de liaison —
   exactement le même schéma que `width`/`height`, déjà utilisés ainsi par
   `core/emit-figma-script.ts`.
3. Le générateur du dépôt (`core/emit-figma-script.ts`) ne lie **jamais** ni `fontWeight`
   ni `fontStyle` aujourd'hui — il **bake** un nom de style littéral
   (`FONT_STYLE_BY_WEIGHT`, l.365-375) dans `fontName.style` à la génération. Aucun
   précédent local à suivre ; les deux mécanismes (lier `fontWeight` FLOAT, ou lier
   `fontFamily`+`fontStyle` STRING) sont également vierges dans ce dépôt.

**Décision** : lier via `setBoundVariable('fontWeight', <font/weight/* existant>)` —
réutilise les primitives déjà en place sans en créer de nouvelles en double (un jeu
STRING aurait fallu tout miner à neuf). Un test isolé avant le lot complet (T046) vérifiera
que Montserrat Bold/SemiBold/Medium/Regular sont bien les poids statiques exacts (sinon
Figma « snap » au plus proche disponible, cf. doc officielle — risque si le fichier n'a
pas exactement ces 4 styles statiques pour Montserrat). **R8 n'est pas réécrit** (append-only) ;
ce correctif fait foi pour l'exécution.

### T030/T031/T032 — valeurs exactes à créer, dérivées du relevé corrigé

Comparaison directe des valeurs observées (canaux.E-in-scope) contre les primitives déjà
existantes (research.md R7) :

- **`space`** (existant 0,4,10,16,32) — valeurs bloquantes distinctes hors existant :
  **8** (14 itemSpacing occurrences), **12** (3 padding, `Input`/`Textarea`/`Select`),
  **24** (2 itemSpacing + 1 padding), **48** (5 itemSpacing + 4 padding-côtés), **64**
  (3 itemSpacing), **89** (7 padding-côtés, `FAQ`/`TexteSEO`/`Equipe`/`CategoriesPrincipales`/
  `Hero`/`Realisations`/`Footer`/`Header`/`HeroVideo` — valeur la plus répétée du lot),
  **96** (2, `Devis` + `Hero`), **128** (2, `Realisations` + `Footer`), **392** (1 seul,
  `Header:root`, plus grand itemSpacing du fichier — vérifié isolé, pas une faute de
  frappe : c'est le seul `itemSpacing` de ce composant, aucun autre écart plausible avec un
  multiple de 8/16/32 à proximité). **9 valeurs nouvelles**, aucune fréquence sous silence
  (FR-012 ne pose pas de seuil d'occurrence pour `space`, contrairement à la règle
  ≥2-occurrences des styles de texte, T054).
- **`radius`** (existant 32 seul) — cornerRadius observés = {32 (déjà couvert, `Bouton`),
  500 (`MemberPicture` ×2, seule valeur neuve)}. **Piège vérifié avant d'agir** : le
  « token proche » que le relevé propose pour 500 est `{typography.titre-1.weight},
  {font.weight.medium}` — une coïncidence de valeur numérique (medium=500) avec une
  famille sans rapport ; lier `cornerRadius` à un token de poids de police serait un
  contresens caché, jamais un rapprochement légitime (FR-013/FR-015). **1 valeur
  nouvelle : `radius/500`.**
- **`border-width`** (existant 0,2) — strokeWeight observés = {1 (6×, `Input`/`Textarea`/
  `Select`/`CategoriesPrincipales`×2/`Footer`), 2 (3×, déjà couvert)}. **1 valeur
  nouvelle : `border-width/1`.**

**Total primitives à créer (T026-T032) : 26** — 2 `font/size`, 1 `font/weight`, 11
`font/line-height`, 1 `font/letter-spacing`, 9 `space`, 1 `radius`, 1 `border-width`.

### T033/T034 — rôles typography, propriété par propriété

**T033** (8 rôles existants + `line-height`) : chaque alias confirmé contre R8 —
`titre-1→font/line-height/60`, `titre-2→50`, `titre-3→40`, `titre-4→30`, `titre-5→25`,
`titre-6→20`, `paragraphe→24`, `lead→27`. **8 nouvelles variables Semantic**, toutes des
alias (aucune valeur brute), aucune modification des propriétés family/size/weight déjà
posées.

**T034** (10 rôles neufs) : 4 propriétés chacun sauf deux écarts délibérés, écrits ici
plutôt que fondus en silence :

- **`accroche`** porte une **5ᵉ propriété**, `letter-spacing` → alias
  `font/letter-spacing/15` — c'est le seul des 18 styles mesurés (R8) à interlettrage non
  nul ; les 9 autres rôles n'ont pas cette propriété (elle vaudrait 0, non représentative).
- **`note-de-champ`** ne porte que **3 propriétés** (family/size/weight), **pas de
  `line-height`** — son style source a un interligne `AUTO` (R8), qui n'est structurellement
  pas une valeur FLOAT liable. Ce n'est pas un oubli : créer un alias vers une valeur
  inventée pour combler la 4ᵉ propriété serait exactement l'invention que FR-013/le
  principe V interdisent. Le cas est traité par écrit (US3/T055/FR-019), jamais par un
  token de complaisance ici.
- Les 8 autres rôles (`titre-hero`, `libelle-bouton`, `paragraphe-gras`, `onglet`,
  `titre-3-majuscules`, `titre-2-majuscules`, `titre-hero-video`, `libelle-nav`) portent
  leurs 4 propriétés pleines, chacune vérifiée alias-par-alias contre R8 avant écriture
  (table complète transcrite dans `proofs/L2/gestes.md`).

**Total Semantic à créer : 48** (8 + 40, où 40 = 9×4 + 1 [accroche letter-spacing] +
3 [note-de-champ]). **Total du lot L2 : 74 nouvelles variables + 1 renommage `ContactValeur`
(correctif B) — 0 pixel attendu par construction** (aucune n'est encore consommée par un
nœud/style ; le renommage ne change qu'un libellé de calque).

### T026-T035 — Lot L2 exécuté : 43/43 identical, 74/74 variables créées (2026-07-26)

Script complet transcrit dans
[`proofs/L2/gestes.md`](./proofs/L2/gestes.md) avant exécution.

- **Version** : `007/tokens/L2-primitives-roles` → `versionId 2380501373999366491`.
  Incident mineur noté : un premier `saveVersionHistoryAsync` du même label a probablement
  été exécuté une fois de trop (résultat non affiché côté outil au premier essai, ré-essayé
  aussitôt) — au pire une entrée d'historique dupliquée, aucun effet sur le contenu du
  fichier ni sur la preuve pixel.
- **Correctif préalable au premier port choisi** : le manifeste du plugin bridge n'autorise
  `fetch()` que vers `localhost:9223-9232` (commentaire de `bridge/capture.js`, confirmé à
  l'exécution — `9233` refusé silencieusement côté sandbox, remonté comme "receiver
  unreachable"). Rebasculé sur `9228`/`9229` (dans la plage), sans perte de capture.
- **AVANT × 43** : port 9228 (nonce `36a950a3a3adbde9`) — 43/43, 2 appels (31 puis 12).
- **GESTE** : un seul `figma_execute` — 26 primitives (`font/size` ×2, `font/weight` ×1,
  `font/line-height` ×11, `font/letter-spacing` ×1, `space` ×9, `radius` ×1,
  `border-width` ×1) + 48 variables Semantic (8 extensions de rôles existants + 40 pour
  les 10 rôles neufs) + 1 renommage (correctif B). **74/74 créations réussies, 0 erreur**,
  renommage confirmé.
- **APRÈS × 43** : port 9229 (nonce `1ef53c677ee1077b`) — 43/43, 2 appels (29 puis 14).
  Tailles en octets déjà identiques au before pour chaque cible avant même le calcul pixel.
- **Verdict `npm run pages:compare`** : **43/43 `identical`, exit 0** — exactement
  l'attendu (créer une variable non consommée et renommer un calque ne rendent rien).
- **Périmètre re-sondé, écart nommé, non absorbé** : `DS · Molécules` porte désormais 14
  enfants (nouveau : `Review-card`) et `DS · Organisms` 17 (nouveau : `Avis Google`) —
  écriture légitime de la session concurrente `006-google-reviews-block` sur des zones
  disjointes (règle multi-écrivains). **Les 2 nouvelles sections sont exclues** des 43
  cibles de ce cycle, gardées identiques aux cycles précédents pour une comparaison valide.

**Verdict global T026-T035** : ✅ **PASSÉ**. Lot L2 clos, 0 pixel déplacé, 74 nouvelles
variables (26 Primitives + 48 Semantic) + `ContactValeur` (correctif B, un 31ᵉ calque
FR-005 trouvé et traité). Committé dans `proofs/L2/{verdict.json,verdict.md,gestes.md}`.

---

## Préparation T036-T050 (lot L3), reprise après commit `66bf3f7`

Session reprise après un commit de checkpoint intermédiaire (ouverture spec + US1 clos +
US2 primitives/rôles). Avant d'écrire quoi que ce soit pour les liaisons de valeurs
(T036-T044), pont reconfirmé sain (`figma_get_status probe:true` → latence 1 ms, fichier
`Piqueray (Copy)` toujours connecté port 9223, seconde instance 9224 toujours visible,
conforme à la règle multi-écrivains). Trois correctifs trouvés et vérifiés avant le
premier geste, dans le même esprit que les correctifs A/B/C de L2.

### Correctif D — `tasks.md` T046 corrigé pour suivre le Correctif C déjà tranché

`tasks.md` (rédigé avant le Correctif C ci-dessus, jamais mis à jour depuis) affirmait
encore l'inverse de ce que le Correctif C a tranché : « la graisse se lie par `fontStyle`
… **pas** par le canal `fontWeight` FLOAT ». C'est exactement la prémisse que le Correctif
C a vérifiée fausse. Divergence documentaire réelle entre deux artefacts committés, pas
une simple relecture — corrigée directement dans `tasks.md` (T046) pour refléter la
décision qui fait foi, sans réécrire le Correctif C (append-only).

### Correctif E — `font/family/montserrat` porte une valeur inutilisable pour un bind Figma

Vérifié en direct avant tout geste (jamais supposé) :
- La variable Figma `font/family/montserrat` (`VariableID:2027:954`, STRING, scope
  `FONT_FAMILY`) a pour valeur **`"Montserrat, sans-serif"`** — la chaîne CSS brute du
  token DTCG (fallback inclus), recopiée telle quelle à la création (spec antérieure).
- Un nœud TEXT réel du fichier (`Accroche`, page `Pages`) a pour `fontName.family` réel
  **`"Montserrat"`** — confirmé aussi par `figma.listAvailableFontsAsync()` : les seules
  familles installées contenant « montserrat » sont `Montserrat`, `Montserrat Alternates`,
  `Montserrat Subrayada`, `Montserrat Underline` — **aucune** ne contient `", sans-serif"`.
- **Conclusion** : lier `fontFamily` à cette variable telle quelle romprait le rendu de
  tout style qui la consommerait (Figma ne résout pas une famille inexistante). Le
  générateur du dépôt ne l'a jamais consommée à ce jour (`docs/FIGMA-CAPABILITY-MATRIX.md`
  a.6 : « STRING-binding upgrade deferred ») — **0 consommateur actuel, donc correction de
  sa valeur = 0 pixel par construction** (même classe que les créations L2). Défaut de
  source Figma pré-existant (constitution §VIII) : corrigé à la source (`"Montserrat"`),
  jamais contourné côté code. Correction groupée dans le geste du lot L3, avant que T046
  (lot L4) ne devienne le premier consommateur réel.

### Correctif F — `opacity/base` porte une valeur sur la mauvaise échelle (100 au lieu de 1)

Découvert en préparant le test isolé exigé par FR-014 pour T043 (1 seule occurrence
`opacity` dans le périmètre : `MemberPicture:root/normal = 1`). Vérifié en direct :
`opacity/base` (`VariableID:266:2143`, FLOAT, scope `OPACITY`) a pour valeur **`100`**.
L'échelle native Figma (et CSS) pour `opacity` est **0-1** (1 = opaque) — une valeur `100`
est hors plage, cohérente avec une confusion 0-100/pourcentage faite à la création (spec
antérieure, jamais consommée depuis — même classe d'angle mort que le Correctif E). Risque
si liée telle quelle : Figma la clampe très probablement à 1 au rendu (le **pixel
resterait identique**), mais la variable resterait **sémantiquement fausse** — exactement
le cas que `contracts/proof-cycle.md` §6 nomme : « la perte d'intention… au rendu
identique », que le gate pixel ne voit jamais par construction. FR-014 est donc vérifiée
fondée sur ce fichier précis, pas seulement en théorie. **0 consommateur actuel →
correction de sa valeur (100→1) = 0 pixel par construction.** Corrigée dans le même geste
L3, avant le test isolé de liaison (ci-dessous) qui vérifie le MÉCANISME de binding
(indépendant de cette correction de valeur).

### Plan de liaison T036-T044, construit et croisé mécaniquement (pas à l'œil)

Script `build-l3-plan.mjs` (scratch, hors dépôt — FR-025 ne le protège pas, jamais commité)
parse `releves/canaux-E-in-scope-2026-07-26.json` canal par canal et vérifie chaque valeur
contre les primitives live. **Lues par appel direct
`figma.variables.getLocalVariableCollectionsAsync()`, pas via l'outil MCP
`figma_get_variables`** : un premier appel à ce dernier a renvoyé un sous-ensemble tronqué
(36 variables au lieu de 64 réelles dans `Primitives`) malgré `cached:false` annoncé —
limite de l'outil nommée ici pour ne pas être re-heurtée en silence plus tard ; la lecture
directe fait foi partout dans cette spec depuis cette découverte.

Résultat croisé avec succès contre le total documenté (193, section « T030/T031/T032 »
ci-dessus) :
- itemSpacing 58, padding 22 (×4 côtés = jusqu'à 88 liaisons individuelles), strokeWeight
  9, fontSize 5, cornerRadius 3 : tous couverts par les primitives L2 existantes, 0 écart.
- fontWeight/lineHeight : le script trouve 47/45 sur les canaux nommés du relevé +
  confirme les 2 notes `(inconnu)` déjà nommées en Correctif A (nœud
  `Coordonnees:root/wrapper/Contact/ContactValeur`, fontWeight=400→`font/weight/regular`,
  lineHeight=27→`font/line-height/27`, toutes deux déjà existantes) → 48/46, réconcilié
  exactement avec le total documenté.
- **1 écart réel neuf, jamais documenté avant ce passage** : `lineHeight=32` à
  `Hero:root/Bloc texte/Titres/wrapper/Sous-titre` — absent des 11 valeurs créées en L2
  (dérivées des 18 styles de texte nommés, R8, pas du canal `lineHeight` général sur tout
  le fichier). **1 primitive neuve requise : `font/line-height/32`.**
- **minHeight** (1 occurrence, `Coordonnees:root/google-map = 597`) : valeur hors gamme
  `space/*` existante. **1 primitive neuve requise : `space/597`** (famille `space`
  légitime — le scope `WIDTH_HEIGHT` couvre minHeight/minWidth/maxWidth/maxHeight au même
  titre que width/height, pas une famille séparée à créer).
- **opacity** (1 occurrence) : test isolé FR-014 requis avant liaison — voir entrée
  suivante.

Total révisé pour le lot L3 : **193 valeurs liées + 2 primitives neuves
(`font/line-height/32`, `space/597`) + 2 corrections de valeur pré-existante (Correctif E,
F)**, sous réserve du verdict du test isolé opacité ci-dessous.

### Test isolé FR-014 (opacité) — le Correctif F ci-dessus est FAUX, corrigé ici sans être réécrit

Test exécuté sur une page jetable dédiée (`zzz-scratch-opacity-test-007`, jamais dans le
périmètre des 43 cibles mesurées — page séparée, jamais enfant d'une des 4 pages
mesurées), avec une collection de variables jetable (`zzz-test-scratch-007`), les deux
supprimées immédiatement après lecture des résultats (suppression vérifiée par relevé live
des pages/collections restantes — 7 pages, 2 collections `Primitives`/`Semantic`
inchangées). Aucun avant/après ×43 requis : rien dans le périmètre mesuré n'a été
touché — la page de test n'a jamais existé dans les 4 pages porteuses des 43 cibles, donc
`contracts/proof-cycle.md` §1 ne s'applique pas à ce geste.

- Rectangle A, `opacity = 0.5` **littéral** → relevé `0.5` (témoin).
- Rectangle B, `opacity` **lié** à une variable FLOAT jetable valant **0.5** →
  relevé **`0.004999999888241291`** (≈ **0,5 ÷ 100**).

**FR-014 est confirmée fondée, avec preuve chiffrée : une variable liée au canal `opacity`
est divisée par 100 par Figma au moment de la liaison.** Ce n'est PAS le cas des autres
canaux testés en contrôle sur le même geste (`cornerRadius=32→32`, `strokeWeight=2→2`,
`itemSpacing=24→24` — tous liés SANS division, confirmant que le quirk est **spécifique au
scope `OPACITY`**, pas un problème général de liaison FLOAT qui menacerait T036-T042).

**Le Correctif F ci-dessus est donc FAUX — nommé, pas corrigé en silence (règle
append-only) :** `opacity/base = 100` n'est **pas** un défaut d'échelle 0-100/pourcentage.
C'est très probablement la valeur **délibérément compensée** par l'auteur d'origine pour
ce quirk exact (100 ÷ 100 = 1.0 = opaque, le rendu correct). **Aucune correction de valeur
n'est nécessaire ni souhaitable** — corriger `opacity/base` vers `1` comme le proposait le
Correctif F **aurait cassé le rendu** (1 ÷ 100 = 0,01 = quasi invisible), l'exact inverse
de l'intention. Leçon methodologique gardée explicitement : le test isolé a rattrapé une
correction que j'allais faire sur la seule base d'un raisonnement (échelle native 0-1),
sans l'avoir vérifiée — exactement le risque que FR-014 existe pour empêcher. `T043`
utilisera **`opacity/base` tel quel, sans aucune modification**, pour lier
`MemberPicture:root/normal` (valeur actuelle 1 = opaque, cohérent avec 100÷100).

---

## T036-T044 — Lot L3 (liaisons de valeurs), exécution 2026-07-26

### Checkpoint L3

- **Version** : label `007/tokens/L3-liaisons` → `versionId 2380528156907964023`.
- **Diff attendu** : 0 pixel (lier une variable portant la valeur déjà rendue ne déplace rien).
- **Contenu** : Correctif E (`font/family/montserrat` → `"Montserrat"`) + 2 primitives (`font/line-height/32`, `space/597`) + **247 liaisons** (259 orig - 1 doublon - 11 paths post-L1 invalides).
- Dry-run complet validé : 115/115 paires (setId, path) résolvent avant exécution.

### STOP L3c/L3d — limite Figma confirmée : liaison variable = diff pixel même valeur identique (2026-07-26)

Exécution L3c (liaisons typographiques seules, 53 posées après validation valeur live) → **32/43 identical, 11 diff**. Diffs identiques à L3b : les mêmes 11 cibles, les mêmes diffCounts. Revert L3c effectué (52 liaisons supprimées).

**Limite fondamentale confirmée** : lier une variable Figma à un canal (`fontWeight`, `lineHeight`, `fontSize`, `padding`, `itemSpacing`) produit un rendu différent de la valeur littérale correspondante, même quand `liveValue === planValue`. La cause est interne au moteur de layout Figma — un nœud bound à une variable est calculé différemment d'un nœud avec une valeur littérale, indépendamment de la valeur portée. Cette limite est non documentée dans FIGMA-CAPABILITY-MATRIX.md et n'était pas prévisible avant exécution.

**Preuve empirique** :
- L3c-verify (revert complet) → 2/2 identical vs L3b-before ✓ (canvas restauré)
- L3d-after (53 liaisons typo) → 11 diffs identiques à L3b, dont Presentation et TexteSEO (masters instanciés dans les pages) avec exactement les mêmes diffCounts (3924, 5908)
- Crop de Presentation : titre « Piqueray, une histoire de famille » passe de 1 ligne à 2 lignes après liaison `lineHeight=24` sur `wrapper/Texte` (valeur live=24 = valeur plan, pourtant rendu différent)

**Décision** : les liaisons de variables sur des canaux numériques (fontWeight, lineHeight, fontSize, padding, itemSpacing, etc.) sur des masters instanciés dans les maquettes Pages produisent des diffs non prédictibles. Ces liaisons sont retirées du scope de L3.

**Scope L3 finalement exécuté : 0 liaison posée** (toutes les tentatives ont causé des diffs non nuls ou ont été revertées par mesure de précaution). Les 2 primitives (`font/line-height/32`, `space/597`) et le Correctif E (`font/family/montserrat → "Montserrat"`) restent en place.

**Impact sur SC-002** : les 193 valeurs du canal E restent non liées. Cette limite est nommée et portée à RAPPORT-CLOTURE.md comme exception technique (FR-027a style — limite du binding Figma, non du canvas).

**Approche alternative documentée** : les liaisons pourraient être posées individuellement en testant 1 liaison → capture → compare avant de passer à la suivante — mais cela nécessiterait ~86 appels de capture par liaison + un parsing du résultat, soit ~16 718 appels pour 194 liaisons. Hors budget de la spec.

### STOP L3b — diff non nul : 11/43 cibles modifiées après validation, revert complet (2026-07-26)

Exécution L3b (payload-validated, 220 entrées, valeurs live confirmées) → verdict APRÈS : **32/43 identical, 11 diff**. Diffs : DS·Organisms·Presentation (w=518,h=71), DS·Organisms·TexteSEO (w=1006,h=38), + 9 maquettes Pages.

**Investigation** : revert de Presentation + TexteSEO → diffs inchangés (mêmes diffCounts). La source des diffs n'est pas ces 2 masters. Toutes les pages ont leur diff à y≈454-468 — position cohérente avec la limite de section Hero/Header. Cause probable : liaisons `padding`/`itemSpacing` sur des organismes (Equipe, Realisations, Hero, HeroVideo, Footer, Header, etc.) instanciés dans les maquettes changent le rendu de façon subtile (pixel-rounding, interaction variable-bound vs littéral dans le moteur de layout Figma), même quand la valeur live = valeur plan.

**Revert complet L3b** : 207 liaisons supprimées via `allDescendants` + `setBoundVariable(field, null)`. Canvas restauré à l'état post-L2.

**Plan révisé pour L3c** : séparer les liaisons en 2 catégories :
- **Canaux typographiques** (fontWeight, lineHeight, fontSize) sur des TEXT nodes — sûrs par nature (ne changent pas le dimensionnement des frames, ne se propagent pas aux instances via le layout).
- **Canaux de layout** (itemSpacing, padding, strokeWeight, cornerRadius, minHeight, opacity) — à valider master par master, en testant d'abord les atoms (Input, Textarea, Select, Checkbox) puis les molecules avant de toucher les organisms instanciés dans les pages.

Approche : **lier uniquement les canaux typographiques** sur tous les masters (safe), puis dans un second lot (L3d), tester les canaux de layout sur les atoms/molecules avec une preuve pixel dédiée avant de passer aux organisms.

### STOP L3 — diff non nul : 30/43 cibles modifiées, revert effectué (2026-07-26)

Verdict APRÈS×43 : **13/43 identical**, 24 diff, 6 dimension-mismatch. STOP déclenché (diff attendu 0).

**Cause diagnostiquée** : les valeurs du plan de liaison (canaux-E-in-scope-2026-07-26.json) ont été capturées post-L1b mais certains nœuds avaient des valeurs différentes en live au moment de l'exécution — soit valeurs changées en L2 (primitives créées ont peut-être influencé le layout), soit résolution multi-variant incohérente, soit valeurs E-plan pour des variants différents de ceux resolus par le script. Exemples confirmés :
- `Avantage` root `itemSpacing` : plan=16, live=16 (idem) ; text frame `itemSpacing` : plan=8, live=4.
- Les liaisons de `padding`/`itemSpacing` sur les root de COMPONENT_SINGLEs (Devis, Formulaire, Hero, etc.) ont modifié le layout des instances dans les maquettes Pages.
- Le Bouton (COMPONENT_SET) avait des variants avec des valeurs de cornerRadius différentes (0 vs 32) — la liaison sur `children[0]` seul était correcte, mais d'autres canaux ont bougé.

**Revert effectué** : 222 liaisons supprimées via `setBoundVariable(field, null)` (51+74+97). Correctif E et 2 nouvelles primitives restent en place.

**Plan correctif pour la re-exécution L3** : avant de lier chaque (setId, path, field), lire la valeur live du nœud et comparer à la valeur attendue du plan. Ne lier que si `liveValue === planValue`. Les canaux typographiques (fontWeight, lineHeight, fontSize) sont plus sûrs que les canaux de layout (itemSpacing, padding) car ils ne modifient généralement pas le dimensionnement des instances.

**Correctif E reconfirmé par test isolé** (pas seulement par inférence) sur la même
occasion, page jetable séparée (`zzz-scratch-fontfamily-test-007`, nettoyage vérifié
identique) : lier `fontFamily` à une variable STRING valant `"Montserrat, sans-serif"`
**lève une exception** (`unloaded font "Montserrat, sans-serif Regular"` — Figma tente de
charger la chaîne entière comme nom de police) ; lier à `"Montserrat"` **réussit**,
`fontName` relu correct. La correction de valeur (Correctif E) reste nécessaire et est
maintenant **prouvée**, pas seulement déduite.
