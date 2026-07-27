# Phase 0 — Research: extraction des molécules et organismes (7 → 34)

**Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Toutes les questions ouvertes du brief (le « comment » parqué par l'owner : découpage en lots,
séquence, instruments, méthode de mesure) sont résolues ici. Aucun NEEDS CLARIFICATION ne subsiste.
Compte vivant à la date de ce document : 113 évals actives / 107 passent / 48 quarantainées
(`evals/results.json`) ; 7 composants gouvernés ; registre 16 icônes.

---

## D1 — Source des propositions : 57 sets uniques, dédup par clé de composant

**Decision**: Consommer `extract/out/figma/*.contract.proposed.json` (68 fichiers = 57
`componentSetKey` uniques + 11 doublons d'accents) + le rapport de review `figma-proposals.md`
(notes + UNBOUND par set). Le rapprochement canonique se fait par `anchors.figma.componentSetKey`,
jamais par nom de fichier ni d'affichage.

**Rationale**: Vérifié par identité — `figma-proposals.md` : *« 57 component set(s) extracted from
the canvas dump »* ; les 11 fichiers surnuméraires sont des doublons accent-manglés de mêmes clés
(ex. `coordonn-es` + `coordonnees`, `quipe` + `equipe`, `toile` + `etoile`) — l'edge case « dump
dupliqué » de la spec. Les 27 fichiers cibles sont identifiés nommément (2 atomes, 13 molécules,
12 organismes) ; les propositions `external-link`, `mail`, `octicon-chevron-down12` servent à
FR-014a.

**Alternatives considered**: re-dumper le canvas (inutile — 007 a livré les propositions en
`e4eb6ba`, route read-only prouvée ; re-confirmer à l'extraction si le fichier a bougé, edge case
nommé) ; filtrer par nom de fichier (refusé — FR-006, leçon « Button » vs « Bouton »).

**Shape d'une proposition** (relevé sur `field.contract.proposed.json`) : contrat schéma-valide en
draft (`version: 0.1.0`, `status: draft`), props avec doubles bindings (`figma` VARIANT/TEXT/
BOOLEAN/INSTANCE_SWAP + `code`), anatomie avec tokens `{dot.path}` déjà liés quand le canvas avait
des branchements, `anchors.figma { fileKey, componentSetKey, nodeId }` (sans `dumpedAt` — ajouté à
l'adoption). Les **notes** et **unbound values** ne sont PAS dans le JSON : elles vivent dans
`figma-proposals.md` (une section `## <Set>` par composant).

---

## D2 — Chaîne d'adoption : la route extraction de 004 (pas la route authored de 006)

**Decision**: Par composant : (1) lire la proposition + sa section dans `figma-proposals.md` ;
(2) review humaine — corriger les notes (sémantique inférée à confirmer, convention `children`,
stubs à convertir en décision nommée), résoudre chaque unbound value ; (3) adopter en
`contracts/<name>.contract.json` avec : `version: 1.0.0`, `status` retiré du draft,
`category` (FR-008 : page DS du master), `semantics.provenance: "extracted"`,
`anchors.figma.dumpedAt` ; (4) chaîne de génération (D3) ; (5) gates.

**Rationale**: Précédent 004 exact (tasks T010–T020 : *« review humaine → adoption (autorat
assisté, jamais génération) »*). Différence clé avec 006 : les masters existent déjà sur le canvas
→ **pas de push figma-sync, pas d'anchors:writeback** (le `nodeId` vient du dump) ; la parité axe
figma compare le master existant au contrat.

**Résolution des unbound values** (précédent 004/006, comparé `input.contract.proposed.json` →
`contracts/input.contract.json`) : lier à un token existant quand il existe ; sinon le canal
**`literals`** nommé (schema v14 — `literals: { "padding-block": "12px", … }`) — *« the values the
token scale does not carry ride the honest literals channel, named rather than force-fit »*.
Aucune spec Piqueray n'a minté de token `imported.*` à ce jour (`grep imported tokens/` → 0) ; le
mint (`core/mint-tokens.ts`, opt-in `mintUnbound: true`) reste disponible mais n'est pas le
défaut. Convention de review 004 : prop texte principale → `children`/`value` selon l'élément
hôte ; stub d'enfant inconnu → converti en décision nommée (ex. Select : stub ChevronDown → part
icône fixe).

**Alternatives considered**: minter systématiquement les unbound en `imported.*` (rejeté — force
des tokens là où l'échelle ne porte pas ; le canal `literals` est le précédent honnête) ; écrire
les contrats à la main (rejeté — règle owner : jamais de contrat écrit à la main, la proposition
est le point de départ).

---

## D3 — Chaîne de génération par lot + disciplines annexes

**Decision**: Après chaque lot d'adoptions :

```bash
npm run build                                   # tokens → schema → generate-components (refusal gate par nom)
npm run figma:plan                              # regénère figma-sync/*.js (renumérotation !)
npm run catalog && npm run verify:catalog       # catalog/ regénéré (séparé de build)
git rm <orphelins figma-sync>                   # OBLIGATOIRE même commit (leçon 006 T037)
npm run golden:update                           # re-pin explicite, revu dans le diff de PR
# refresh lecture des snapshots parité si le canvas a bougé (pont figma-console, script v4)
npm run parity                                  # 4 axes, auto-découverte des contrats
npm run extract:figma:visual                    # + nouveaux sujets, puis -- --write-baseline (revu)
# sweep complet F1 : build && parity && eval && plugin:check && roundtrip && core-browser-check && tsc ×2
```

**Rationale — les points de vigilance relevés** :
- **006 T037 (bloquant)** : la renumérotation des scripts figma-sync (08 → ~35) laisse des
  orphelins ; `golden-generated-output` itère les clés du golden → un orphelin non purgé matche
  encore pendant que le fichier réellement généré est **non pinné** (régression invisible). Purge
  par `git rm` dans le même commit revu.
- `npm run catalog` n'est PAS câblé dans `npm run build` (006 : chaîne explicite).
- `src/components/index.ts` (barrel) et les `index.ts` par composant sont regénérés —
  aucune édition manuelle ; dashboard (`catalog.json` + contrats bruts) et Storybook
  (auto-découverte des `.stories.tsx`, titres groupés par `CATEGORY_LABELS`) ne demandent
  aucun câblage.
- Parité : auto-découverte (`readdirSync(contracts)`), 4 axes (code, figma, figma-tokens, icons) ;
  pas d'axe category (la catégorie est couverte par des évals : `refuse-unknown-category`,
  `category-groups-story-and-catalog`). Snapshots : refresh lecture via le pont ; garde de
  provenance (fileKey) et fraîcheur (`extractedAt`) vérifiées par le differ.
- Instrument visuel : couverture NON automatique — une entrée `PARITY_SUBJECTS` par composant
  (`contractId`, `fileKey`, `setNodeId`, `renderWidth`/`instanceOverride` si besoin), puis un run
  complet + `--write-baseline` explicite. Seuils nommés : 2.0 % (diff), 3.0 % (ligne de triage,
  cause nommée obligatoire), 0.1 pp (epsilon summary). Précédent d'exclusion nommée : Select
  (option text perdu en Chromium headless) — toute exclusion 010 est écrite là où la capacité est
  revendiquée.

**Alternatives considered**: un seul big-bang de 27 adoptions puis un sweep (rejeté — blast radius
illisible dans le diff golden, contraire à l'esprit des checkpoints 003/005) ; un sweep par
composant individuel (rejeté — 27 × le coût du sweep complet ; le lot est le bon grain).

---

## D4 — Étape 0 (§VIII) : réutilisation totale des audits 003/005/007

**Decision**: L'audit de source est **réutilisé, jamais refait** (US4 scénario 3) : les 27 cibles
ont TOUTES une couverture existante. La seule exigence permanente : re-mesurer à l'extraction (le
fichier vivant fait foi ; edge case « le fichier a bougé »). Si la re-mesure révèle un défaut
nouveau → correction à la source AVANT extraction, avec §X (capture avant de toutes les cibles) et
§XI (zones disjointes si parallèle) — jamais de contournement.

**Couverture relevée** (reçus : `COMPONENT-INVENTORY.md` racine, `specs/003-*/audits/` 36 fichiers,
`specs/005-*/decisions.md` 13+1 cycles, `specs/007-*/naming-table.md` 78/78 CLEAN) :

| Couche | Composants | Base d'audit | Caveats déjà nommés (jamais silencieux) |
|---|---|---|---|
| Atomes (2) | MemberPicture, PiquerayLogo | 005 (L3/L4 — axis/props/renames ; pré-existants, « NE PAS refaire » en 003) | — |
| Molécules (13) | AccordionRow, Avantage, CarouselControls, Carte, Copyright, Field, FooterColumn, MemberCard, NavItem, ProductCard, Realisation, SectionHeader, Tab | 003 (audit par bloc + proofs + ledger) + retouches 005/007 | Carte : résidu canvas 3 488 px (propriété TEXT partagée entre variantes, limite structurelle nommée 007) ; NavItem : dette item 8 (souligné actif/couleur, reportée à l'extraction Header — ouverte, nommée) ; SectionHeader : rename cosmétique `Accroche2` en attente (nommé) |
| Organismes (12) | Coordonnees, Devis, Equipe, FAQ, Footer, Formulaire, Header, Hero, Presentation, Reassurances, SAV, TexteSEO | 003 + 005 (V1–V6, cycles 14) + 007 | TexteSEO : résidu 3 351 px (métadonnées mixed-style, nommé) + dette rich-text B1 ; Coordonnees : résidu 88 px (sous-pixel, plancher connu, nommé) ; Header : partage la dette NavItem item 8 |

Preuves byte-identiques existantes à réutiliser comme reçus : CarouselControls (1/1), Realisation
(3/3), Equipe (1/1), Tab (9/9), FAQ (2/4), MemberCard (pixel complet), Avantage (4/4).

**Alternatives considered**: refaire un audit frais par composant (rejeté — US4 scénario 3 explicite :
réutilisation, pas duplication ; le coût 003/005/007 est déjà payé).

---

## D5 — Découpage en lots (le « comment » parqué par l'owner)

**Decision**: 6 lots ordonnés par dépendance croissante, sweep complet des gates à la fin de
chacun (détail et chaîne exacte : `contracts/extraction-workflow.md`) :

| Lot | Contenu | Débloque |
|---|---|---|
| **L0 — Préconditions** | Registre d'icônes 16 → 19 (FR-014a) + vérification/élargissement enums INSTANCE_SWAP du Button (gate « égal au registre exactement ») + re-point de l'éval C5 | Les organismes instanciant Mail/ExternalLink/OcticonChevronDown12 (Header, Footer, Formulaire, SAV…) |
| **L1 — Atomes (2)** | MemberPicture, PiquerayLogo | MemberCard, Equipe, Header, Footer |
| **L2 — Molécules sans dépendance inter-molécule** | AccordionRow, Avantage, CarouselControls, Carte, Copyright, Field, FooterColumn, NavItem, ProductCard (compose Button — existe), Realisation, SectionHeader, Tab | FAQ, Footer, Header, Formulaire, Reassurances… |
| **L3 — Molécules composantes** | MemberCard (compose MemberPicture) + toute molécule dont la review L2 révèle une dépendance vers une autre molécule (reclassée ici, nommée) | Equipe |
| **L4 — Organismes composant des atomes existants/gouvernés** | Coordonnees, Devis, Hero, Presentation, SAV, TexteSEO | — |
| **L5 — Organismes composant des molécules** | Equipe (MemberCard/MemberPicture), FAQ (AccordionRow), Footer (FooterColumn), Formulaire (Field + atomes), Header (NavItem + PiquerayLogo), Reassurances (Carte ?) | Clôture |

L'ordre fin intra-lot est celui des dépendances lues dans les propositions (`sortByDependencies`
le fait respecter au build ; une dépendance surprise déplace le composant au lot suivant — nommé).

**Rationale**: L'assomption de la spec (atomes → molécules → organismes, dépendance croissante) +
FR-009 (un organisme attend ses molécules) + FR-014a (le registre est la condition des organismes).
La granularité molécules L2/L3 et organismes L4/L5 borne le diff de chaque lot (golden, parity)
sans multiplier les sweeps.

**Alternatives considered**: 3 lots (un par couche) (rejeté — L2+L3 fusionnés mélangeraient 13
composants hétérogènes en dépendance ; L5 isolerait les compositions à risque trop tard) ; 27 lots
(rejeté — coût de sweep ×27).

---

## D6 — Registre d'icônes 16 → 19 (FR-014a)

**Decision**: Extension minor `1.1.0 → 1.2.0` : +`external-link`, `mail`, `octicon-chevron-down12`
(kebab-case légal sous `^[a-z][a-z0-9-]*$`). Identités canvas déjà dans
`parity/snapshots/figma-components.json` (Mail `263:2125`, ExternalLink `9:185`,
OcticonChevronDown12 `6:119` — re-vérifier live, les clés sont stables pas les noms). Acquisition
SVG par la pipeline 002 existante (`npm run extract:figma:rest:svg`, manifest nodeIds →
`assets/icons/<asset>.svg`). Les 16 entrées existantes non touchées ; `source.dumpedAt` rafraîchi.

**Rationale — couplages relevés (à traiter dans L0)** :
1. **Gate d'exactitude des enums** (`scripts/generate-components.ts:139-148`) : tout enum de prop
   INSTANCE_SWAP recouvrant le registre doit l'égaler EXACTEMENT — l'ajout de 3 entrées peut faire
   échouer le build par nom sur les enums `iconLeftGlyph`/`iconRightGlyph` du Button → élargir le
   Button (minor bump) si le gate se déclenche.
2. **Éval C5** `lower-icon-swap-and-visibility-into-props` asserte l'enum == registre à 13 →
   re-pointer sur le compte vivant (19).
3. **`bakeCurrentColor()`** ne remplace que `#26282C` — si Mail/ExternalLink/Octicon portent une
   autre peinture, la substitution unique exige une review nommée (précédent `star` orange : icône
   à couleur fixe légale si décrite).
4. Vérification : axe icons de `npm run parity` (registry ↔ assets ↔ canvas), gates build
   (`validateIconRegistry`), évals C2/C3/C5. Pas de script `icons:check` à côté (rejeté en 002 D4).

**Alternatives considered**: laisser le registre à 16 et stubber les icônes dans les organismes
(rejeté — le refusal gate refuse par nom ; la spec a tranché Option A) ; minter de nouvelles
icônes hors canvas (rejeté — hors périmètre explicite).

---

## D7 — Motifs d'exclusion par organisme (FR-013) — capacités confirmées

**Decision**: Motifs par organisme, adossés à la matrice de capacités relevée (pas de label
générique) :

| Organisme | Motif | Reçu |
|---|---|---|
| **HeroVideo** | `embed` — contenu vidéo externe : aucun vocabulaire schéma/émetteur (les image fills elles-mêmes sont une limite nommée ouverte — `imgPlaceholder` + wash `#D9D9D9` sur review-card) | `docs/FIGMA-CAPABILITY-MATRIX.md` (aucune ligne embed) ; addendum A5/a.7 |
| **Realisations** | `grid` — grille 2D native : `display` schéma = `flex\|inline-flex` seulement ; émetteur H/V seulement | 003 decisions : *« Réalisations utilise un GRID natif non contractable »* ; schema l. 96 ; matrix l. 61-62 (« Contract today: absent ») |
| **ProduitsECommerce** | `grid` — grille 2D de cartes produit (même absence de capacité) | matrice + schéma (idem) |
| **CategoriesPrincipales** | `grid` — grille 2D de cartes catégorie (même absence) | matrice + schéma (idem) |

`repeat + component` est couvert (006) et n'est PAS un motif d'exclusion — mais seule la rangée
horizontale à largeurs égales a été exercée (via `literals.width` sur la racine de l'enfant) ;
aucune variante verticale/wrap n'a de reçu. `slot + accepts` existe en schéma mais **zéro exercice
Piqueray** (famille d'évals en quarantaine — voir D8). Si la review d'une proposition révèle un
`grid`/`embed`/variante non exercée dans une cible des 27 → reclassement en exclu avec motif par
organisme (edge case « plus complexe que prévu »), compte 34 ajusté et justifié (FR-016).

**Alternatives considered**: étendre le schéma pour grid (rejeté — FR-013 interdit les
contournements ; VI : aucune extension n'est nécessaire aux 27) ; forcer ProduitsECommerce en
`repeat`+wrap jamais exercé (rejeté — II : pas de claim sans éval).

---

## D8 — Réactivation d'évals (FR-018) — inventaire et triage

**Decision**: Appliquer la règle hybride telle que documentée (`docs/handoff/09-testing-and-gates.md`
+ `evals/REMOVED-CASES.md` §Re-enabling : déplacer le bloc de `legacy-cases.ts` vers `run.ts`,
retirer du tableau, rien d'autre ; move, pas rewrite — précédent 006 T061). Triage complet dans
`contracts/eval-revival.md` ; résumé :

- **Obligatoire (débloqué par les 27 composants de 010)** : `heading-margin-reset` (si une racine
  h1–h6/p/blockquote — TexteSEO, FAQ, Presentation, Copyright probables) ; la famille
  design-roundtrip (`design-roundtrip-anatomy-zero-mismatch`, `…-uncorrelated-binding-…`) — la
  route canvas→proposition→contrat→régénération de 010 peut fournir un round-trip identité ;
  `design-rest-*` ×3 et `design-mcp-roundtrip-fixture-replay` SI les fixtures REST/MCP d'un
  composant Piqueray sont capturées dans l'itération (décision à la clôture, nommée).
- **Conditionnel (débloqué seulement si une proposition adoptée porte la capacité)** : états
  d'interaction (Tab/NavItem hover → famille `state-*`, `focus-not-pressed-browser-probe`,
  `wc-emitter-css-parity`) ; événements (`detect-code-removed-event` — CarouselControls ?) ;
  `elementByProp` (NavItem/Tab `<a>` vs `<button>` ?) ; axes enum secondaires (`token-size-live`,
  `naxis-full-cartesian-product`) ; **`layoutByProp`/`stylesWhen`/overlay** (peu probable).
- **Famille SLOT — cas particulier tranché** : la proposition `field.contract.proposed.json`
  porte déjà un `slot` (`Saisie`, accepts `[ds.input, ds.select, ds.textarea]`, `acceptsMode:
  prefer`, `defaultContent`). Si la review de Field adopte ce slot (décision de review nommée,
  voir D9), les 7 évals slot (`detect-figma-missing-slot-property`, `detect-figma-accepts-drift`,
  `detect-code-removed-slot-prop`, `refuse-defaultContent-outside-accepts`,
  `detect-figma-missing-multislot-content`, `slot-empty-not-placeholder`,
  `preferred-values-accepts`) deviennent réactivables **du fait de cette itération** — première
  exercice Piqueray d'un slot. Si Field est adopté sans slot (INSTANCE_SWAP laissé côté Figma
  seulement), la famille reste en quarantaine — nommé à la clôture dans les deux cas.
- **Dette adjacente (condition déjà remplie depuis 004/006, hors « du fait de cette itération »)** :
  ~12 cas (`plugin-propose-dry-run` — re-point de chaînes seulement ; `plugin-update-report` ;
  `plugin-engine-bundle` ; `repeated-children-collection` — reçu rouge pré-existant nommé en 006
  T062 ; `array-prop-code-only-skipped-everywhere` ; `key-based-linking` ; `stub-geometry-render` ;
  famille `design-census-*` ; `pending-first-sync-not-drift` — bloqué sur baseline parité, pas sur
  010). **Triage owner à la clôture** : réactiver dans 010 (mécanisme identique, coût marginal) ou
  reporter en itération dédiée — chaque cas tranché est nommé dans le rapport de clôture ; rien
  n'est réactivé silencieusement.
- **Restent gelés (hors 010)** : thème/brand (`refuse-incomplete-mode-set`,
  `brand-added-token-layer-only`), `text-styles-from-typography-tokens` (gap moteur nommé),
  `checkbox-native-input` (pas de switch dans 010), `refuse-role-recreating-native-control` (sauf
  si un contrat 010 déclare `roleException`), `judge-*` et `wc-emitter-roundtrip` et
  `depth-composite-child-collection` et `playground-caption-consistency` (fixtures d'écran à
  ré-écrire — effort séparé, décision clôture).

**Rationale**: FR-018 + Principle II — le compte vivant fait foi ; tout retrait/ajout est nommé et
les compteurs (REMOVED-CASES.md §Counts, datés) re-synchronisés.

---

## D9 — Patterns de composition par composant (règle standing archive)

**Decision**: Archive `demo-51` consultée (INDEX.md + fichiers) — voler ou rejeter avec motif par
composant. Résultat : **7 correspondances directes, 18 partielles, 2 sans précédent**
(PiquerayLogo — jamais de brand-mark modélisé ; et toute collection répétée — le demo a
`repeat collections in 0`, le seul précédent repeat est `ds.google-reviews` en 006). Règles de
composition tranchées pour 010 :

1. **Lien fixe** (organisme → molécule/atome précis) : `component` ref par clé (précédents
   `ds.card`→`ds.avatar`, `ds.table`→`ds.table-header-cell` ×3 avec mapping `{parentProp}` ;
   Piqueray : `ds.google-reviews`→`ds.review-card`). Limite nommée 006 : pas d'injection de prop
   TEXTE parent dans l'enfant (résolution via variant `subst` seulement).
2. **Collection homogène répétée** (Equipe×MemberCard, FAQ×AccordionRow, Footer×FooterColumn,
   Reassurances×Avantage ?) : `repeat + component` (précédent 006, Piqueray-first) — le demo
   modélisait les collections en slots (`ds.avatar-group`, `ds.list`) : **rejeté avec motif** pour
   les collections homogènes (le repeat est le pattern Piqueray établi en 006 ; le slot demo était
   faute de repeat). Variantes jamais exercées (vertical, wrap) → review nommée si une proposition
   les requiert.
3. **Zone de contenu ouverte** : `slot + accepts` — la proposition Field en porte un ; la décision
   slot-vs-INSTANCE_SWAP-Figma-seul est prise à la review de Field et nommée (conséquence évals :
   D8 famille slot).
4. **Icône pilotée par enum** : `{prop}`-templated icon asset (précédent 002 D2 /
   `ds.accordion-item` `{state}`) — jamais de slot pour les icônes (rejeté en 002 : `accepts`
   porte des ids de contrats).
5. **Rapprochements à voler** : AccordionRow←`ds.accordion-item` (enum d'état + icône `{state}`) ;
   Carte/ProductCard/Realisation←`ds.card` ; Field←`ds.field` ; NavItem←`ds.top-nav-item` ;
   Tab←`ds.tab` ; SectionHeader←`ds.heading` (`elementByProp` si niveau variable) ;
   MemberCard←`ds.card`+`ds.avatar` (ref MemberPicture) ; Header←`ds.top-nav` ;
   CarouselControls←`ds.pagination` (icônes fixes prev/next — la forme exacte des
   `flecheGauche/flecheDroite` de 006) ; Coordonnees←`ds.metadata-list` (+ icônes phone/mail —
   raison de FR-014a). Table complète 27 lignes : section D9 du rapport de recherche (conservée
   dans `contracts/perimeter-table.md` colonne « inspiration archive »).

**Garde-fous archive** (INDEX « How to use ») : modéliser la source Figma Piqueray RÉELLE, jamais
le demo ; les tokens demo n'existent plus ; rien ne se copie tel quel dans `contracts/`.

---

## D10 — Écritures canvas : posture par défaut + disciplines §X/§XI

**Decision**: Itération **read-only par défaut** sur le fichier vivant (route extraction : les
masters existent). Écritures possibles seulement si : (a) la re-mesure révèle un défaut de source
nouveau (correction §VIII) ; (b) une affordance officieuse doit devenir propriété officielle.
Alors : §X — capture avant de TOUTES les cibles affectées, vérifiée non-vide et correctement
dimensionnée AVANT toute mutation (jamais un pilote) ; §XI — si corrections parallèles : zones
disjointes (masters/pages/nodes distincts), un seul cycle pixel global tenu par l'orchestrateur
(précédent 005 cycle 14 : 1 root + 4 agents de zone, interdiction de capturer hors zone ;
contre-exemple du fork Réassurances rappelé). Versioning natif (`saveVersionHistoryAsync`) à
chaque geste, versionIds journalisés (précédent 003/005/007).

**Rationale**: L'assomption de la spec autorise l'édition, mais la couverture d'audits (D4) rend
les corrections improbables ; les trois reçus de discipline existent et sont cités.

---

## Synthèse — aucun NEEDS CLARIFICATION restant

| # | Décision | Statut |
|---|---|---|
| D1 | Propositions : 57 sets, dédup par componentSetKey | ✅ résolu |
| D2 | Adoption : route extraction 004, `literals` pour unbound | ✅ résolu |
| D3 | Chaîne par lot + purge orphelins + golden revu + sujets visuels | ✅ résolu |
| D4 | Étape 0 : réutilisation totale des audits, re-mesure seule | ✅ résolu |
| D5 | 6 lots L0–L5 ordonnés par dépendance, sweep par lot | ✅ résolu |
| D6 | Registre 16→19 minor + 3 couplages (enums Button, éval C5, bakeCurrentColor) | ✅ résolu |
| D7 | Exclusions : motif par organisme adossé à la matrice (grid ×3, embed ×1) | ✅ résolu |
| D8 | Évals : obligatoire / conditionnel / slot (cas Field) / dette adjacente triée à la clôture | ✅ résolu |
| D9 | Composition : component-ref / repeat / slot / icône enum — archive volée ou rejetée nommément | ✅ résolu |
| D10 | Canvas read-only par défaut ; §X/§XI si correction | ✅ résolu |
