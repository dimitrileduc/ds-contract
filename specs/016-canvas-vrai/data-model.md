# Data model — 016 · Canvas vrai

Les entités de la spec, matérialisées dans les artefacts qui font foi. Aucune base, aucun service : du JSON commité, des scripts bridge versionnés, et les registres vivants existants (013/014) que 016 met à jour selon leur sémantique propre.

## 1 · VariableDeMaquette (la contrepartie Figma d'une référence de géométrie)

Source de vérité amont : `tokens/primitives.tokens.json` (feuilles `space.*` / `size.*.*`) → générée dans `figma-sync/01-tokens.js` (collection **Primitives**, mode **Value**).

| Champ | Type | Règles |
|---|---|---|
| `name` | string | forme Figma `size/carte/root` (le `/` remplace le `.` du token) |
| `type` | `"FLOAT"` | toute la population 016 |
| `value` | number | la valeur du token, verbatim (jamais arrondie) |
| `scopes` | string[] | posés par le générateur — `WIDTH_HEIGHT` (size), `GAP`+`WIDTH_HEIGHT` (space) |
| `codeSyntax.WEB` | string | `var(--size-carte-root)` — posé par le générateur |
| `boundUsages` | relevé | lecture bridge post-régénération : nœuds (par position) dont `boundVariables.width/height/itemSpacing/padding*` pointent la variable |

**Validation** : existence + valeur vérifiées par l'axe `figma-tokens` de `parity/diff.ts` (cliché `parity/snapshots/figma-tokens.json`) ; liaisons vérifiées par l'audit de liaison (D2, hors différentiel — limite nommée D3). Population : **83** (6 space + 77 size), comptée contre le diff de `tokens/primitives.tokens.json` posé par 015.

**Transitions** : `absente` (état 015, acquittée) → `créée` (U1a, 01-tokens.js) → `surveillée` (cliché ré-extrait, acquittement tombé) → `liée` (U1b, post-régénération, audit de liaison).

## 2 · DefautDeSource (une erreur de la maquette elle-même)

Registre commité : `specs/016-canvas-vrai/registre/defauts-source.json`. **10 entrées** : DW-002, DW-003 (provenance `specs/013-…/proofs/deferred/work.json`) + 8 du backlog 013 (provenance : mémoire projet `figma-cleanup-backlog-013`, re-relevée au vif — D5/D9).

| Champ | Type | Règles |
|---|---|---|
| `id` | string | `DW-002`, `DW-003`, `B013-1`…`B013-8` |
| `provenance` | string | fichier/registre d'origine + date du diagnostic initial |
| `diagnosticVif` | object | re-relevé AVANT geste : nodeIds par position, valeurs observées, version Figma du relevé — la mémoire n'est jamais la preuve |
| `correction` | string | le geste choisi (pour DW-002 : cartes à 363,5 — décision owner 2026-08-05, re-confirmable tant que la section n'est pas mutée) |
| `decisionOwnerRequise` | boolean | `true` pour B013-6 (texte-seo : 2e ligne dépliée — intention ou accident, à consigner avant geste) |
| `lotId` | string | le LotDeMutation qui porte le geste |
| `promotionCodeSide` | object\|null | contrat/token touché en retour + semver (ex. B013-8 : `ds.button` **majeur** ; B013-2/3 : binding VARIANT, mineur ; DW-002 : `size.carte.root` 363,5) |
| `limitesLevees` | string[] | limites nommées code-side qui tombent (FR-009), avec le reçu d'absence de régression |
| `recu` | path | reçu re-testable sous `specs/016-canvas-vrai/proofs/recus/` |
| `statut` | enum | `ouvert` → `annonce` → `corrige` → `clos` — **graphie JSON sans accents, celle de `contracts/registre-source.md`, qui fait foi** (clos ⇔ reçu + registres aval à jour ; un défaut non reproduit ou déclaré intentionnel passe `ouvert` → `clos` sans geste) |

**Règle de clôture (FR-008)** : pour DW-002/DW-003, `specs/014-mesure-juste-triage/proofs/registre/causes.json` reçoit `resolvedBy: "016-canvas-vrai"` (sémantique v2 — l'entrée reste au registre et sous C4) ; le compte imprimé `npm run measure:gate` passe `figma-source: 2 → 0`, relu en direct. Pour les B013-*, la clôture vit dans ce registre + le rapport, et la mémoire projet est mise à jour pour pointer ici.

## 3 · LotDeMutation (l'unité de travail canvas)

Journal : `specs/016-canvas-vrai/proofs/<lot>/` + entrée dans `decisions.md`. Cycle contractuel : `contracts/proof-cycle.md`.

| Champ | Type | Règles |
|---|---|---|
| `id` | string | `U1a-variables`, `L-DW002`, `L-DW003`, `B013-…`, `R1…Rn` (régénération) |
| `annonce` | object | écart attendu PAR CIBLE, écrit AVANT toute écriture (FR-006) — y compris « identique » quand c'est l'attendu |
| `versionId` | string | point de restauration nommé `saveVersionHistoryAsync("016/<lot>/<étape>")` (FR-005) |
| `releveAvant` | path | scan par POSITION juste avant d'écrire (fichier vivant — jamais un relevé périmé) |
| `cibles` | array | **toutes** les frames touchées : maquettes de `Pages` + masters DS concernés (§X — jamais un pilote) |
| `capturesAvant` / `capturesApres` | dirs | `.page-parity/<lot>/{before,after}/` — non vides, dimensions attendues, même receveur/nonce |
| `gestes` | path | `proofs/<lot>/gestes.md` — scripts `figma_execute` transcrits |
| `verdict` | enum | `conforme` (diffs ⊆ annonce) \| `annulé` (tout écart imprévu annule le lot ENTIER — restauration manuelle guidée, re-preuve, cause avant reprise) |

**Invariants** : aucune écriture si une capture est vide/mal dimensionnée ; étalonnage ×2 `identical` en ouverture de chantier sinon rien ne commence ; un écart imprévu n'est **jamais** requalifié en bruit ; écrivain unique (D10 — §XI satisfait par construction).

## 4 · RapportDePhotos (par composant porteur)

Artefacts : `specs/016-canvas-vrai/proofs/photos/{census-avant.json, photos-report.json}` produits par `specs/016-canvas-vrai/bridge/photos-census.js` + vérification Node (`tools/photos-verify.mts`).

| Champ | Type | Règles |
|---|---|---|
| `composant` | string | l'un des **9** porteurs (compte confronté au recensement vif — écart = STOP) |
| `photos[]` | array | par photo : localisation par POSITION (chemin de nœud + bounds), `imageHash`, `sha256` des octets (`getImageByHash().getBytesAsync()`, haché côté Node), dimensions, porteur `master` \| `instance-override` |
| `replacees[]` | array | verdict d'**identité** par photo : même `imageHash` au même endroit (jamais la simple présence) |
| `nonReplacees[]` | array | rapportées NOMMÉMENT (FR-007/FR-011) — le composant n'est pas « régénéré » tant que leur sort n'est pas réglé |
| `interversionsDetectees` | array | deux photos de même taille échangées = hash au mauvais endroit — le cas que le fallback du restore moteur peut produire (D7) |
| `verdict` | enum | `intact` \| `replace-verifie` \| `en-souffrance` — **graphie JSON sans accents, celle de `contracts/photos-identite.md`, qui fait foi** (c'est `tools/photos-verify.mts` qui écrit ces valeurs) |

**Cas nommé** : MemberCard — plan photo hors contrat (frontière A5, matrice ligne 91) : recensé, vérifié intact, mais sa divergence de rendu reste une limite nommée, pas un échec (edge case de la spec).

## 5 · Acquittement (une ligne de `parity/baseline.json`)

Clé : `surface|classification|subject` (mécanique de `parity/diff.ts`).

| Population à l'ouverture | Devenir 016 |
|---|---|
| 83 × `figma-tokens\|behind\|Primitives/(space\|size)/…` | **tombent** après U1a + ré-extraction du cliché (SC-001) |
| `figma\|behind\|Avantage.PiquerayLogo`, `figma\|behind\|Carte.Bouton`, `figma\|behind\|SectionHeader.Bouton`, `figma\|mismatch\|Presentation.Texte (default)` | re-jugés avec la régénération US3 : régénérés (l'acquittement tombe) ou re-acquittés sur décision owner consignée (D10) |
| `icons\|ahead\|assets/icons/close.svg`, `figma-tokens\|mismatch\|Primitives/font/family/montserrat [Value]` | hors périmètre — re-justifiés au rapport (D11) |

**Invariant de clôture** : zéro acquittement de couverture géométrie ; chaque ligne restante porte une justification vivante ; le compte vif fait foi.

## 6 · CibleDeRegeneration (une divergence canvas à résorber)

Dérivée, jamais décrétée : les findings canvas actifs de `npm run parity` sur cliché frais post-US2 (D10).

| Champ | Type | Règles |
|---|---|---|
| `contractId` / `master` | string | ancre par `componentSetKey` (stable au renommage), node id du moment |
| `findings[]` | array | les findings parity qui la motivent (classification + détail + remède) |
| `script` | path | `figma-sync/NN-<composant>.js` (chemin amend — réconciliation en place) |
| `porteurPhotos` | boolean | si vrai : RapportDePhotos obligatoire avant/après (FR-007) |
| `resultatAttendu` | object | l'annonce du lot : rapport amend (`addedVariants`/`editedDefaults`/`preservedImages`…) + liaisons posées (U1b) |
| `decisionOwner` | string\|null | une cible laissée volontairement divergente = décision consignée, jamais un oubli (Assumption de la spec) |

**Sortie** : cliché ré-extrait, finding éteint, liaisons auditées ; Field et NavItem mesurent sans reçu `blocked`/`fail` d'époque (D8, SC-006).
