# Research — Adopter les tokens Figma manquants (012)

**Date**: 2026-07-29 · **Spec**: [spec.md](./spec.md) · **Constitution**: v1.2.0

Aucun `NEEDS CLARIFICATION` ne restait dans la spec (5 clarifications résolues le
2026-07-29). Cette recherche fixe les décisions **mécaniques** : comment chaque exigence
s'appuie sur un instrument existant, et ce que la preuve octet par octet doit montrer.

**Méthode (§IX docs-first)** : auggie MCP indisponible pendant la planification
(HTTP 402 Payment Required — dégradation nommée). Fallback appliqué conformément à la
règle : lecture directe de `docs/03-token-pipeline.md` et `docs/06-parity-loop.md`
d'abord, puis relevé du code (`scripts/build-tokens.mjs`, `parity/diff.ts`,
`core/emit-figma-script.ts`, `scripts/generate-figma.ts`, `scripts/update-golden.mjs`,
`parity/extract-figma.plugin.js`, `evals/run.ts`), recherches exactes via `rg` (Bash).

---

## D1 — Route du re-relevé du cliché (FR-004)

**Décision** : exécuter `parity/extract-figma.plugin.js` **tel quel** (lecture seule) via
le pont figma-console (`figma_execute`) dans le fichier Piqueray vivant
(`d9FYAUcqdcNtsuaMgLefvJ`), puis sauver la partie variables du retour
(`{fileName, fileKey, extractedAt, collections}`) dans
`parity/snapshots/figma-tokens.json` (JSON indenté 2 espaces, LF, fin de fichier avec
newline — le style du fichier commité).

**Rationale** : c'est le script que `parity/diff.ts` documente comme LA source du cliché
(en-tête l.6-7 : « snapshots in parity/snapshots/, refreshed by running
parity/extract-figma.plugin.js »). Il porte déjà la provenance (`fileKey` vérifié contre
l'ancre des contrats, `extractedAt` contrôlé contre `MAX_SNAPSHOT_AGE_DAYS=14`) et la
règle v4 « l'alpha fait partie de la valeur » (hex 8 chiffres si a < 1). Zéro nouveau
code (FR-008).

**Alternatives rejetées** :
- *API REST Figma* (`/v1/files/:key/variables/local`) — endpoint variables gaté
  Enterprise ; pas la route pratiquée par ce dépôt (specs 002/010 : pont en lecture).
- *`figma_get_variables` (outil MCP)* — forme de sortie différente de celle que
  `parity/diff.ts` parse ; il faudrait un adaptateur = nouveau code (FR-008).
- *Ne pas rafraîchir* — viole FR-004 ; la parité comparerait 62 à 62 en se déclarant
  propre (l'angle mort exact que la spec nomme).

**Échec nommé** : pont indisponible ou `fileKey` inattendu → **arrêt** avant toute
adoption (edge case de la spec ; le guard `WRONG FILE` du script et la vérification
`fileKey` de `diff.ts` matérialisent déjà le refus).

## D2 — Périmètre du cliché : variables seulement

**Décision** : seul `parity/snapshots/figma-tokens.json` est rafraîchi.
`figma-sync`/composants ne bougent pas et `parity/snapshots/figma-components.json`
n'est **pas** re-sauvé, bien que le script retourne aussi `sets`.

**Rationale** : l'axe tokens ne lit que `figma-tokens.json` (diff.ts l.105-111) ; la
clarification de la spec désigne « le cliché de variables Figma », au singulier.
Re-saver le cliché composants importerait du bruit hors sujet (dérives composants
éventuelles) dans une fonctionnalité dont la preuve promet « rien d'autre ne bouge ».
Le cliché composants reste valide pour la parité : même `fileKey`, `extractedAt`
du **2026-07-26** (`1785099569818` — vérifié ; < `MAX_SNAPSHOT_AGE_DAYS = 14`). Le
cliché *variables*, lui, date du 2026-07-28 (`1785262379909`) : les deux extractions
n'ont pas eu lieu le même jour, ce que la rédaction initiale de cette décision avait
confondu.

**Garde-fou** : si le retour montre autre chose que les deux collections attendues
(`Primitives`, `Semantic`) — une 3ᵉ collection, une collection renommée — **arrêt
nommé** : c'est un conflit à arbitrer côté source d'abord (corollaire §VIII « is this
from Figma or not? »), jamais une adoption en aveugle.

## D3 — Écart entre le cliché commité (62, extrait 2026-07-28) et l'audit (139)

**Décision** : le re-relevé T0 tranche. Le cliché commité a été extrait la veille de la
rédaction de la spec et ne porte que 62 variables — soit l'extraction précède l'ajout
des 77 côté Figma, soit l'audit de l'utilisateur a compté sur le fichier vivant après
coup. Les comptes de la spec (139/62/77 = 29+48) sont **des hypothèses re-relevées au
démarrage** (FR-004) : si le relevé diffère, la liste des manquants est recalculée
depuis le cliché frais et la spec suit les comptes re-relevés ; si les 77 sont absents
du fichier vivant, la prémisse tombe → arrêt nommé.

## D4 — Conventions d'écriture des 77 feuilles (valeurs identiques, FR-001/002)

**Décision** : reprendre à l'identique les conventions du dépôt, groupe par groupe —
c'est ce que `norm()` (diff.ts l.624-635) neutralise à la comparaison :

| Catégorie Figma (audit) | Fichier / groupe cible | `$type` | Forme de valeur | Variable Figma attendue |
|---|---|---|---|---|
| couleurs | `primitives` → `color.*` | `color` (groupe) | hex **MAJUSCULES**, 6 chiffres (8 si alpha) | COLOR |
| tailles de police | `primitives` → `font.size.*` | `dimension` | `"Npx"` (`"25px"` ↔ FLOAT 25) | FLOAT, scope FONT_SIZE |
| interlignes | `primitives` → `font.line-height.*` | `dimension` | `"Npx"` (modèle : `font.line-height.22`) | FLOAT, scope ALL_SCOPES |
| espacements | `primitives` → `space.*` | `dimension` | `"Npx"` | FLOAT, scopes GAP+WIDTH_HEIGHT |
| rayons | `primitives` → `radius.*` | `dimension` | `"Npx"` | FLOAT, scope CORNER_RADIUS |
| typo sémantique (48 feuilles) | `semantic` → `typography.<groupe>.<feuille>` | `fontFamily` / `dimension` / `fontWeight` | **alias forme point** `"{font.size.25}"` | STRING/FLOAT aliasée |

Notes de normalisation (relevées dans `norm()` et l'extracteur) :
- `"Npx"` (dépôt) ↔ `N` (FLOAT Figma) : le differ retire le suffixe `px` — « 25px
  reste 25 » est garanti par l'instrument, pas par une conversion à l'adoption.
- alias : forme **point** dans les fichiers tokens (`{font.size.25}`), forme slash dans
  le cliché (`{font/size/25}`) — `norm()` convertit point→slash à la comparaison.
- hex 6 chiffres : `norm()` neutralise la casse ; hex **8 chiffres : la casse n'est PAS
  neutralisée** — écrire en majuscules comme l'extracteur (`rgbToHex` émet en MAJ),
  sinon mismatch inventé.
- poids (`fontWeight`) : nombre nu (400/500/600) ; familles : chaîne.

**Rationale** : « aucune conversion ni normalisation de valeur » (assumption de la
spec) = suivre la convention existante du groupe d'accueil, feuille par feuille.

## D5 — Zéro alias cassé : re-prouvé par construction, deux portes existantes

**Décision** : aucune vérification ad hoc. Deux portes existantes refusent un alias
cassé **par son nom** :
1. `scripts/build-tokens.mjs` (`cssValue`) — `Token "X" references "{Y}" which does
   not exist` → `npm run tokens` (donc `npm run build`) échoue.
2. `core/emit-figma-script.ts` — `resolveLiteral` (« Cannot resolve token ») et
   `buildTokensScript` (« Semantic token "X" must be an alias ») → `npm run figma:plan`
   échoue. Ce second point impose aussi que **chaque feuille sémantique soit un alias**
   (jamais un littéral) — exactement la forme promise par la spec (48 alias).

## D6 — Diff attendu des deux surfaces de la liste blanche (FR-006)

**`src/styles/tokens.css`** : +77 custom properties dans `:root` (compteur du build :
62 → 139). Les primitives arrivent en valeurs littérales, les sémantiques en
`var(--…)`. `src/styles/tokens.dark.css` (mode dark absent ⇒ Map vide) et
`src/styles/tokens.brands.css` (aucune marque non-default) se régénèrent
**byte-identiques**.

**`figma-sync/01-tokens.js`** : seules les constantes `PRIMITIVES` (38 → 67 entrées) et
`SEMANTIC` (24 → 72 entrées) s'enrichissent. Prédictions vérifiées dans le moteur :
- `TEXT_STYLES` reste `[]` : la dérivation (`deriveTextStyles`) ne matche que
  `^font\.<groupe>\.size…` — les groupes Piqueray sont `typography.*` (c'est déjà le
  cas aujourd'hui : 24 feuilles typo présentes, `TEXT_STYLES = []`).
- `BRAND` reste `[]`, `BRAND_MODES` `["Default"]`, `SEMANTIC_HAS_DARK` `false`
  (T037c : rien n'est inventé).
- scopes/types des nouvelles entrées : inférés par `scopesFor`/`figmaType` (tableau D4),
  identiques à ce que l'extracteur relèvera côté Figma si le fichier vivant suit les
  mêmes règles — toute divergence de scope n'est **pas** comparée par l'axe tokens
  (le differ compare nom + valeurs par mode, pas les scopes) : pas de risque de
  mismatch inventé.

**Toutes les autres sorties** (composants `src/components/**`, `contracts/contract.schema.json`,
scripts `figma-sync/NN-*.js` et `batch-*.js`, `catalog/catalog.json` — jamais régénéré
dans ce chantier) : **byte-identiques**. Le générateur ne lit les tokens que pour
valider les liaisons et résoudre les variantes canvas ; aucun contrat ne lie les 77
nouveaux tokens (FR-009), donc aucune sortie composant ne peut bouger.

## D7 — Discipline du re-épinglage (FR-006/007)

**Décision** : un seul `npm run golden:update` en fin d'adoption, puis contrôle du
diff : `git diff evals/golden.json` doit montrer **exactement 2 lignes de hash
modifiées** — `src/styles/tokens.css` et `figma-sync/01-tokens.js`. Toute 3ᵉ ligne =
signal d'alarme FR-007 : arrêt, explication nommée, jamais d'acquittement silencieux.

**Rationale** : `scripts/update-golden.mjs` recalcule le manifeste ENTIER (tout `src/` +
`figma-sync/*.js` hors plugin/arrange) — le « re-épinglage limité aux deux entrées »
(FR-007) se vérifie donc sur le **diff git du manifeste**, pas en épinglant
sélectivement. C'est exactement l'usage documenté : « the manifest diff in the PR is
the reviewable blast radius of the change ».

## D8 — Reçu de liabilité : geste en copie scratch (FR-009a)

**Décision** : prouver « liable » sans toucher l'arbre réel, dans une **copie scratch**
du dépôt (le motif des evals : copie du workspace + symlink `node_modules`) :
1. copie du worktree → scratch (le scratchpad de session) ;
2. dans la copie, retargeter UNE liaison d'un contrat existant vers un token adopté de
   même nature (le miroir inverse de l'eval `refuse-unknown-token-reference`, qui
   fait `{radius.32}` → `{radius.nonexistent}`) → `npm run build` **accepte** ;
3. dans la même copie, retargeter vers un token inexistant → `npm run build` **refuse
   en nommant le token** (`references token "{…}" which does not exist in tokens/`,
   `core/emit-react.ts` — porte existante, inchangée) ;
4. sorties console capturées → reçu consigné dans le rapport ; scratch supprimé.

**Rationale** : FR-009a exige un contrat d'essai « temporaire et non commité » avec
`contracts/` intact et zéro sortie générée qui bouge. Un essai dans l'arbre réel
générerait des fichiers composants orphelins dans `src/components/` (le générateur ne
supprime pas les sorties d'un contrat retiré) — risque de trace hors liste blanche.
La copie scratch rend la non-trace **structurelle**. La moitié « refus » reste par
ailleurs prouvée en continu par l'eval `refuse-unknown-token-reference` (verte dans le
sweep).

## D9 — Reçu de l'angle mort : parité avant/après

**Décision** : consigner deux exécutions de `npm run parity` encadrant l'adoption :
- **après refresh, avant adoption** : l'axe tokens produit exactement la liste des
  manquants en findings `figma-tokens / ahead` (« Figma variable has no counterpart in
  tokens/ ») — l'angle mort rendu visible et dénombré (attendu : 77) ; `exit 1` est ici
  un **reçu**, pas une porte rouge ;
- **après adoption + régénération** : axe tokens propre (139 ↔ 139), `exit 0` final.

Comptes des deux côtés par la **même méthode** (US1) : feuilles = entrées de la
`flatten()` du differ (jointure `/`) côté dépôt ; somme des `variables[]` des
collections côté cliché.

## D10 — `figma-tokens-export.dtcg.json` : artefact orphelin, intouché

**Relevé** : `parity/snapshots/figma-tokens-export.dtcg.json` (92 feuilles — l'ère
démo) n'est référencé par **aucun code** (`rg figma-tokens-export` → zéro usage). Il ne
participe à aucune porte. **Décision** : intouché, nommé dans le rapport comme
non-entrée ; sa suppression éventuelle est hors périmètre.

## D11 — Worktree F1

**Relevé** : `node_modules/.bin/tsx` présent → `npm install` déjà fait dans ce
worktree. Reste à vérifier/installer Chromium (`npx playwright install chromium`) au
T0 — deux contrôles en dépendent (un eval + l'instrument visuel). Sweep complet exécuté
DANS le worktree (constitution, Worktree Gates F1).

## D12 — Ce qui a le droit d'apparaître dans le diff git final

| Fichier | Nature | Statut |
|---|---|---|
| `tokens/primitives.tokens.json`, `tokens/semantic.tokens.json` | **source éditée à la main** (les 2 seuls) | attendu |
| `src/styles/tokens.css`, `figma-sync/01-tokens.js` | surfaces générées — la liste blanche | attendu |
| `evals/golden.json` | re-épinglage, **exactement 2 lignes de hash** | attendu |
| `parity/snapshots/figma-tokens.json` | entrée capturée (FR-004a — jamais l'alarme) | attendu |
| `parity/report.json` | reçu d'exécution du differ (réécrit par le run final propre) | attendu, nommé |
| `specs/012-adopt-figma-tokens/**` | artefacts de spec + rapport d'adoption | attendu |
| `CLAUDE.md` | contexte agent (géré par le script de plan, Phase 1) | attendu (planification) |
| `parity/baseline.json` | acquittement owner — **uniquement** si une limite est nommée (D14) | conditionnel, nommé |
| **tout autre fichier** | — | **ALARME FR-007 : arrêt + explication** |

⚠️ `CLAUDE.md` est modifié **dès le T0** par le script de plan : la vérification de
propreté du T0 (T002) doit l'exclure au même titre que `specs/012-…/**`, sinon elle
s'arrête sur son propre effet de bord — et « nettoyer » en annulant la mise à jour de
contexte serait une régression, pas un nettoyage.

## D13 — Le cliché est une entrée d'**evals**, pas seulement du differ (FR-004)

**Relevé** : `parity/snapshots/figma-tokens.json` n'est pas lu que par `parity/diff.ts`.
La suite d'évaluations en dépend nommément, en **trois** endroits :

| Eval | Dépendance exacte | Comportement si absente |
|---|---|---|
| `primitives-border-width-parity` (C3) | `Primitives/border-width/1` avec `values.Value === 1` (`evals/fixtures/primitives-border-width-parity-check.ts`) | **lève** : « Immutable Figma token reference is missing » |
| `detect-token-alias-drift` (C3) | `Primitives/color/orange` (muté en `#123456`, attend un `mismatch`) | finding attendu introuvable → échec |
| `detect-token-missing-variable` (C3) | `Primitives/color/orange` (retiré, attend un `behind`) | finding attendu introuvable → échec |

(`detect-token-extra-variable` n'exige que l'existence de la collection `Primitives`.)

**Décision** : le refresh T003 **vérifie ces ancrages avant d'écrire**. Absent ou changé
→ arrêt nommé, arbitrage §VIII côté source, consigné rubrique 3. Le cliché n'est pas
réécrit et l'eval n'est **pas** retouché.

**Rationale** : FR-004a établit que le cliché est une entrée capturée, donc hors de
l'alarme de la liste blanche (correct pour le golden). Ce statut a masqué une seconde
propriété : il est aussi une **fixture**. Sans cette vérification, FR-008/SC-005
(« toutes les portes vertes ») repose sur une hypothèse non contrôlée quant au contenu
d'un fichier écrasé en bloc — et les deux remèdes évidents en cas d'échec sont tous
deux interdits ici : écrire dans Figma (FR-010) ou retoucher une porte (FR-008).
Contrôler la prémisse d'un eval existant n'est pas ajouter un contrôle.

**Alternative rejetée** : *ne rafraîchir que les collections, en préservant les entrées
attendues des evals* — ce serait fabriquer un cliché qui ne décrit plus le fichier
vivant, exactement l'angle mort que la fonctionnalité vient combler.

## D14 — Une limite nommée n'annule pas la porte : elle s'acquitte par la route existante

**Décision** : si T006/T007 nomme une limite (token non représentable, sémantique
littérale sans primitive correspondante), la parité ne tombe pas à zéro finding. Le
résiduel est admis à trois conditions cumulatives : correspondance **1:1** avec les
limites de la rubrique 3 ; acquittement via `parity/baseline.json` (tableau de clés
`surface|classification|subject` — mécanisme déjà en place, 5 acquittements y vivent
aujourd'hui) ; couverture annoncée « 139 − k », jamais arrondie.

**Rationale** : SC-001 (« 100 % ») et le cas limite « token non représentable » de la
spec se contredisaient en silence — le premier exigeait 139/139, le second admettait
qu'une feuille puisse rester dehors. La contradiction ne se voyait qu'au moment où elle
se produit, c'est-à-dire trop tard. L'acquittement baseline est la route du dépôt pour
« connu, assumé, visible » ; un acquittement sans limite correspondante au rapport
reste, lui, exactement l'acquittement silencieux que FR-007 interdit.

## D15 — Découvertes en exécution (post-planification)

Deux écarts non anticipés par D1-D14, tranchés pendant l'implémentation plutôt qu'à la
planification — détail complet dans `adoption-report.md` rubrique 3 et 7 :

1. **Nouvelle catégorie primitive `font.letter-spacing`** — absente du tableau D4 (qui
   ne listait que color/font.size/font.line-height/space/radius d'après l'audit), mais
   nécessaire au relevé frais (une feuille, `15`, alias cible de
   `typography.accroche.letter-spacing`). Adoptée avec la même convention `"Npx"` que
   `font.size`/`font.line-height` — un nouveau groupe primitif reste additif au sens de
   FR-003 (mesuré à la feuille), au même titre qu'un nouveau groupe sémantique.
2. **Mismatch pré-existant `Primitives/font/family/montserrat`** (l'un des 62
   EXISTANTS) — révélé par le rafraîchissement du cliché (T003), sans rapport avec les
   77 tokens adoptés. Le cliché daté 2026-07-28 portait encore le fallback CSS
   (`"Montserrat, sans-serif"`) côté Figma ; le relevé du 2026-07-29 montre juste
   `"Montserrat"`. Hors périmètre FR-003 (jamais toucher les 62)/FR-010 (Figma lecture
   seule) de cette feature. Cascade découverte tardivement : ce résiduel non acquitté
   faisait aussi échouer 3 evals (`baseline-parity-clean`,
   `baseline-acknowledges-without-failing`, `promotion-converges`) — pas seulement
   `npm run parity`. Acquitté via `parity/baseline.json` (5ᵉ entrée) après arbitrage
   avec l'utilisateur une fois cette ampleur connue.
3. **Reçu du bundle du plugin Figma** (`figma-sync/plugin/engine.receipt.json`) —
   mécanisme de re-pin séparé de `evals/golden.json`, non listé dans le tableau D12 ni
   dans `contracts/liste-blanche.md` d'origine : le bundle du plugin embarque
   `tokens/contracts/icons`, donc dérive dès que `tokens/` change. Corrigé par le remède
   documenté par l'outil : `node scripts/build-plugin-zip.mjs --update-engine-receipt`.
   Périmètre D12 amendé en conséquence (voir `contracts/liste-blanche.md`).
