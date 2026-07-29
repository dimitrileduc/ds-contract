# Rapport d'adoption — Adopter les tokens Figma manquants (012)

**Date** : 2026-07-29 · **Fichier Figma** : `d9FYAUcqdcNtsuaMgLefvJ` (« Piqueray (Copy) »),
lecture seule de bout en bout (FR-010) · **Gabarit** : `contracts/rapport-adoption.md`.
Reçus bruts sous `specs/012-adopt-figma-tokens/proofs/` — ce rapport les cite, il ne les
remplace pas.

---

## 1 · Comptes re-relevés

**Méthode** (identique des deux côtés, FR-004) : côté dépôt, `flatten()` du differ —
chemin joint par `/`, une feuille = une entrée `$value` terminale ; côté cliché, somme
de `collections[].variables[]`.

**Cliché rafraîchi** : `extractedAt = 1785337820068` (2026-07-29T15:10:20.068Z),
`fileKey = d9FYAUcqdcNtsuaMgLefvJ` — vérifié avant écriture (contrat
`cliche-refresh.md`). Exactement 2 collections : `Primitives` (mode `Value`, 67
variables), `Semantic` (mode `Light`, 72 variables).

| | Avant (T0) | Après |
|---|---|---|
| Figma (cliché rafraîchi) | 139 (67 Primitives + 72 Semantic) | 139 (inchangé — lecture seule) |
| Dépôt | 62 (38 primitives + 24 sémantiques) | 139 (67 primitives + 72 sémantiques) |
| Manquants | 77 (29 primitives + 48 sémantiques) | 0 |

Comptes re-relevés **identiques aux hypothèses de l'audit** (139/62/77 = 29+48) — aucune
dérive (research D3).

**Différence d'ensembles dans les deux sens** (FR-004, invariant 5) :
- `cliché \ dépôt` = 77 (la liste exacte de la rubrique 2 ci-dessous).
- `dépôt \ cliché` = **0 (VIDE)** — aucune des 62 feuilles existantes n'a disparu ou été
  renommée côté Figma. Confirmé par script (`proofs/comptage-2026-07-29.md`).

**Ancrages d'evals vérifiés survivants** (décision D13, avant écriture du cliché) :
`Primitives/border-width/1` avec `values.Value === 1` ✔ ; `Primitives/color/orange`
présent ✔. Le cliché a pu être écrit.

Reçus : `proofs/comptage-2026-07-29.md`, `proofs/parity-avant-2026-07-29.txt`,
`proofs/parity-apres-2026-07-29.txt`.

---

## 2 · Liste nommée des feuilles adoptées (77)

### Primitives (29) — `tokens/primitives.tokens.json`

| Chemin | Valeur | Groupe |
|---|---|---|
| `color.gris-clair` | `#E0E0E0` | existant |
| `color.noir-pur` | `#000000` | existant |
| `font.letter-spacing.15` | `15px` | **nouveau groupe** (nécessaire à `typography.accroche.letter-spacing`, non anticipé par l'audit initial) |
| `font.line-height.16` | `16px` | existant |
| `font.line-height.20` | `20px` | existant |
| `font.line-height.24` | `24px` | existant |
| `font.line-height.25` | `25px` | existant |
| `font.line-height.27` | `27px` | existant |
| `font.line-height.30` | `30px` | existant |
| `font.line-height.32` | `32px` | existant |
| `font.line-height.40` | `40px` | existant |
| `font.line-height.48` | `48px` | existant |
| `font.line-height.50` | `50px` | existant |
| `font.line-height.60` | `60px` | existant |
| `font.line-height.68` | `68px` | existant |
| `font.size.44` | `44px` | existant |
| `font.size.54` | `54px` | existant |
| `font.weight.bold` | `700` | existant |
| `radius.500` | `500px` | existant |
| `space.8` | `8px` | existant |
| `space.12` | `12px` | existant |
| `space.24` | `24px` | existant |
| `space.48` | `48px` | existant |
| `space.64` | `64px` | existant |
| `space.89` | `89px` | existant |
| `space.96` | `96px` | existant |
| `space.128` | `128px` | existant |
| `space.392` | `392px` | existant |
| `space.597` | `597px` | existant |

### Sémantiques (48) — `tokens/semantic.tokens.json`, tous alias forme point

**Feuille `line-height` ajoutée à 8 groupes existants** (additivité à la feuille,
clarification 2026-07-29) :

| Groupe | `line-height` → |
|---|---|
| `titre-1` | `{font.line-height.60}` |
| `titre-2` | `{font.line-height.50}` |
| `titre-3` | `{font.line-height.40}` |
| `titre-4` | `{font.line-height.30}` |
| `titre-5` | `{font.line-height.25}` |
| `titre-6` | `{font.line-height.20}` |
| `paragraphe` | `{font.line-height.24}` |
| `lead` | `{font.line-height.27}` |

**10 nouveaux groupes** :

| Groupe | family | size | weight | line-height | autre |
|---|---|---|---|---|---|
| `titre-2-majuscules` | `{font.family.montserrat}` | `{font.size.40}` | `{font.weight.regular}` | `{font.line-height.50}` | — |
| `titre-3-majuscules` | `{font.family.montserrat}` | `{font.size.32}` | `{font.weight.regular}` | `{font.line-height.40}` | — |
| `titre-hero` | `{font.family.montserrat}` | `{font.size.54}` | `{font.weight.bold}` | `{font.line-height.68}` | — |
| `titre-hero-video` | `{font.family.montserrat}` | `{font.size.44}` | `{font.weight.regular}` | `{font.line-height.48}` | — |
| `accroche` | `{font.family.montserrat}` | `{font.size.20}` | `{font.weight.regular}` | `{font.line-height.25}` | `letter-spacing: {font.letter-spacing.15}` |
| `libelle-bouton` | `{font.family.montserrat}` | `{font.size.16}` | `{font.weight.medium}` | `{font.line-height.22}` | — |
| `libelle-nav` | `{font.family.montserrat}` | `{font.size.16}` | `{font.weight.medium}` | `{font.line-height.16}` | — |
| `note-de-champ` | `{font.family.montserrat}` | `{font.size.14}` | `{font.weight.regular}` | *(aucune — pas dans le relevé)* | — |
| `onglet` | `{font.family.montserrat}` | `{font.size.20}` | `{font.weight.semibold}` | `{font.line-height.25}` | — |
| `paragraphe-gras` | `{font.family.montserrat}` | `{font.size.14}` | `{font.weight.bold}` | `{font.line-height.24}` | — |

29 + 48 = **77**, tous vers une primitive existante ou l'une des 29 adoptées ci-dessus —
zéro alias cassé (re-prouvé par construction, §5).

---

## 3 · Limites nommées

**Aucune limite d'adoption rencontrée sur les 77 feuilles elles-mêmes** : les 29
primitives sont toutes représentables dans les conventions existantes (couleur hex,
dimension `"Npx"`, poids nu) ; les 48 sémantiques sont toutes des alias Figma natifs
(aucune sémantique littérale rencontrée, donc aucune échappatoire T007 nécessaire) ;
zéro collision de nom.

Deux **découvertes hors périmètre des 77**, toutes deux nommées et tranchées en cours
de chantier plutôt que silencieusement absorbées :

1. **Mismatch pré-existant `Primitives/font/family/montserrat`** (l'un des 62 EXISTANTS,
   jamais touché par cette feature) — le cliché commité daté 2026-07-28 portait
   `"Montserrat, sans-serif"` côté Figma ; le relevé frais (2026-07-29) montre
   `"Montserrat"` (sans le fallback CSS), alors que le dépôt garde
   `"Montserrat, sans-serif"`. Ni FR-003 (jamais toucher les 62) ni FR-010 (Figma lecture
   seule) n'autorisaient de corriger l'un ou l'autre dans cette feature. **Arbitrage
   (§VIII) et décision utilisateur** : d'abord laissé résiduel non acquitté (choix
   initial), puis reconsidéré une fois l'ampleur réelle connue — ce résiduel faisait
   échouer 3 evals en cascade (`baseline-parity-clean`,
   `baseline-acknowledges-without-failing`, `promotion-converges`, tous pour l'unique
   raison de ce même finding), pas seulement `npm run parity`. Décision finale :
   **acquitté** via `parity/baseline.json` (5ᵉ entrée,
   `figma-tokens|mismatch|Primitives/font/family/montserrat [Value]`, même mécanisme que
   les 4 acquittements déjà présents). Le vrai correctif (aligner le dépôt sur
   `"Montserrat"` ou pousser `"Montserrat, sans-serif"` vers Figma) reste un chantier
   séparé, hors périmètre de cette adoption.
2. **Reçu du bundle du plugin Figma périmé** (`figma-sync/plugin/engine.receipt.json`) —
   ce bundle embarque `tokens/contracts/icons` ; l'adoption des 77 tokens l'a fait
   dériver, faisant échouer `npm run plugin:check` (`verifyEngineReceipt`). Mécanisme
   séparé de `evals/golden.json`/`golden:update`, non anticipé dans le tableau des
   repères D12 du plan. Corrigé par le remède documenté par l'outil lui-même :
   `node scripts/build-plugin-zip.mjs --update-engine-receipt`, puis commit du reçu
   (~4 lignes). Aucune conversion, aucun contournement — le geste analogue à
   `golden:update` pour un artefact distinct.

Aucune autre dégradation, conflit ou token non représentable rencontré.

---

## 4 · Reçu du contrat d'essai temporaire (FR-009a)

Copie scratch du worktree (`rsync` + symlink `node_modules`, décision D8) —
`proofs/essai-scratch-accepte-2026-07-29.txt`, `proofs/essai-scratch-refuse-2026-07-29.txt`.

**Acceptation** : dans la copie scratch, `contracts/button.contract.json`,
`variants.default.link.border-radius` retargeté de `{radius.32}` vers `{radius.500}`
(primitive adoptée en §2) → `npm run build` **accepté**, exit 0, 34 composants générés.

**Refus** : la même liaison retargetée vers `{typography.inexistant.size}` (token
inexistant) → `npm run build` **refusé, nommant le token** :
```
✖ Contract validation failed:
  - ds.button: anatomy.root.tokensByProp.link.border-radius references token
    "{typography.inexistant.size}" which does not exist in tokens/
```
Porte existante (`core/emit-react.ts`), inchangée.

**Scratch détruit** : `rm -rf` confirmé absent. `git diff contracts/` sur le dépôt réel
= **vide** (`proofs/scratch-detruit-contracts-intact-2026-07-29.txt`) — zéro fichier de
`contracts/` touché, zéro sortie composant orpheline sous `src/components/`.

---

## 5 · Diff attendu vs observé — surfaces de la liste blanche

| Surface | Attendu (`contracts/liste-blanche.md`) | Observé |
|---|---|---|
| `src/styles/tokens.css` | 62 → 139 custom properties | **139** confirmé (`grep -c` avant/après) |
| `figma-sync/01-tokens.js` — `PRIMITIVES` | 38 → 67 | **67** confirmé |
| `figma-sync/01-tokens.js` — `SEMANTIC` | 24 → 72 | **72** confirmé |
| `figma-sync/01-tokens.js` — `TEXT_STYLES` | reste `[]` | **`[]`** confirmé (0 entrée) |
| `figma-sync/01-tokens.js` — `BRAND` | reste `[]` | **`[]`** confirmé |
| `figma-sync/01-tokens.js` — `BRAND_MODES` | reste `["Default"]` | **1 entrée** confirmé |
| `figma-sync/01-tokens.js` — `SEMANTIC_HAS_DARK` | reste `false` | **`false`** confirmé |
| `evals/golden.json` | exactement 2 lignes de hash | **2 lignes exactement** (`tokens.css`, `01-tokens.js`) — `proofs/golden-diff-2026-07-29.txt` |

**Écart résiduel nommé (§3)** : `figma-sync/plugin/engine.receipt.json` — surface
supplémentaire, hors tableau `liste-blanche.md` initial, découverte et re-pinnée en
cours de chantier (raison : le bundle plugin embarque les tokens). `parity/baseline.json`
— présent, conforme à la clause conditionnelle D12 (limite nommée = montserrat).

**Surfaces prédites byte-identiques** — toutes confirmées (`proofs/us2-t015-t016-t017-2026-07-29.txt`) :
`src/components/**`, `src/styles/tokens.dark.css`, `src/styles/tokens.brands.css`,
`figma-sync/02-*.js` … `figma-sync/35-*.js` + `batch-01.js`/`batch-02.js` (70 fichiers),
`catalog/catalog.json`, `contracts/contract.schema.json` — zéro diff.

**62/62 feuilles préexistantes inchangées** (SC-003) — vérifié au niveau feuille
chemin→valeur (pas au diff ligne-à-ligne, qui montre des artefacts de virgule finale
sans signification) : 0 modifiée, 0 supprimée, 29+48 ajoutées.

**48/48 alias sémantiques résolus** (SC-002) — 72/72 feuilles de `semantic.tokens.json`
sont des alias, zéro littéral.

---

## 6 · Reçu de l'angle mort (US1)

**Avant** (`proofs/parity-avant-2026-07-29.txt`) : axe `figma-tokens` — 77 findings
`ahead` (« Figma variable has no counterpart in tokens/ »), `exit 1` (reçu, pas porte
rouge).

**Après** (`proofs/parity-apres-2026-07-29.txt`) : axe `figma-tokens` — **0** finding
`ahead`/`behind` résiduel ; 139/139 confirmé. Seul résiduel : le mismatch montserrat
(§3), acquitté.

**Échantillon comparé, pas seulement compté** (T010, acceptance scenario 3 d'US1) : 3
chemins échantillonnés parmi les 77 (`Primitives/color/gris-clair`,
`Primitives/font/line-height/25`, `Semantic/typography/titre-hero/size`) — absents des
findings du differ, donc comparés et appariés (match), pas silencieusement omis du
rapport. Une divergence future sur l'un de ces 77 chemins serait désormais signalable.

---

## 7 · Portes à la clôture (SC-005)

Sweep complet F1 dans ce worktree (`proofs/sweep-2026-07-29.txt`, deux passages —
échec initial diagnostiqué en §3, correction appliquée, re-vérification finale
ci-dessous) :

| Porte | Résultat final |
|---|---|
| `npm run build` | ✔ exit 0 — 139 custom properties, 34 composants |
| `npm run parity` | ✔ exit 0 — 5 findings acquittés (4 préexistants + montserrat), 0 résiduel non acquitté |
| `npm run eval` | ✔ exit 0 — **153/153** évals passés (`evals/results.json`) |
| `npm run plugin:check` | ✔ exit 0 — bundle frais vs receipt re-pinné, 6 flux verts, 3 skips nommés (inchangés, cf. `evals/REMOVED-CASES.md`) |
| `npx tsx scripts/deterministic-roundtrip.mjs` | ✔ exit 0 |
| `node scripts/core-browser-check.mjs` | ✔ exit 0 |
| `npx tsc --noEmit` | ✔ exit 0 |
| `npx tsc -p tsconfig.build.json` | ✔ exit 0 |

**Zéro nouveau contrôle** (FR-008) : toutes les portes ci-dessus existaient avant cette
feature ; `parity/baseline.json` et `figma-sync/plugin/engine.receipt.json` sont des
usages de mécanismes de re-pin/acquittement déjà en place, pas de nouveaux contrôles.

**Reçu lecture seule (FR-010)** : exactement **UN** `figma_execute` a été exécuté sur le
fichier vivant `d9FYAUcqdcNtsuaMgLefvJ` pendant tout le chantier — le contenu de
`parity/extract-figma.plugin.js` tel quel (uniquement des appels `loadAllPagesAsync`,
`getLocalVariableCollectionsAsync`, `getVariableByIdAsync`, `findAllWithCriteria`,
`getMainComponentAsync` — zéro appel de mutation). Les autres appels au pont
figma-console pendant le chantier (`figma_get_status`, `figma_list_open_files`,
`figma_reconnect`) sont des vérifications de connexion, pas des exécutions de script sur
le contenu du fichier. Aucune écriture Figma de bout en bout.

**Durée observée** (SC-007, indicative) : session unique, du rafraîchissement du cliché
(T003) à la clôture — de l'ordre de l'heure en comptant les deux allers-retours de
décision sur le mismatch montserrat (§3) ; hors préparation d'environnement (chromium
déjà en cache) et non un motif d'échec en cas de dépassement.

---

## Résumé

Couverture de parité complète (139/139), 62/62 feuilles préexistantes intactes, 48/48
alias résolus, preuve octet par octet conforme à la liste blanche (+ 1 surface
additionnelle légitime découverte et documentée), liabilité démontrée en scratch
(accepté + refusé par nom), `contracts/` réel intact, zéro conversion des 89 valeurs en
dur, 100 % des portes vertes à la clôture. Une découverte hors périmètre des 77
(mismatch montserrat pré-existant) a été nommée, arbitrée et acquittée par la route
existante plutôt que silencieusement absorbée ou ignorée.
