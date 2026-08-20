# Research — 023 Catégories gouvernées

**Date**: 2026-08-20 · **Entrée**: [spec.md](./spec.md) · **Constitution**: v1.2.0

Méthode docs-first (§IX) : les décisions ci-dessous sont dérivées des documents et des
précédents du dépôt, jamais re-dérivées du code quand un document répond.
**Dégradation nommée (Principe V)** : l'outil auggie MCP répond `HTTP 402 Payment
Required` (crédits épuisés) pendant toute cette phase — le repli prévu par la règle
(lecture directe de `docs/` + `rg` via Bash) a été appliqué ; aucune question n'est restée
sans consultation documentaire, mais la recherche s'est faite par lecture ciblée, pas par
récupération sémantique.

## D0 — Autorité de départ : ce que le dépôt sait déjà du bloc

**Constat** (cliché `parity/snapshots/figma-components.json`, fichier `Piqueray (Copy)`
`d9FYAUcqdcNtsuaMgLefvJ`) :

- L'axe « Disposition » à **4 variantes** décrit par la spec vit sur le **master SECTION**
  `CategoriesPrincipales` (COMPONENT_SET `2115:4277`, clé `94f64a36…`) : `Standard`
  (défaut), `Pleine largeur`, `PleineLargeurRdv`, `PleineLargeurTroisCartes`. Sa propre
  description (portée au canvas) confirme le diagnostic de la spec : *« Une propriété
  Disposition (4 valeurs) fait varier la mise en page et le nombre de cartes affichées
  (2 ou 3) ; sur la variante Pleine largeur · RDV, une carte devient un bloc de
  rendez-vous. Seules les 3 variantes Pleine largeur instancient la molécule Carte ; la
  variante Standard reste construite en natif, non pilotable depuis l'instance. »*
- Le **style empilé + bouton** existe déjà sous contrat : `ds.carte` v2.0.1, disposition
  `categorie` (image en espace restant + `ds.button` variant `link`). Le **style superposé
  + flèche** n'existe QUE comme construction native dans la variante `Standard`
  (nestedInstances : `ArrowRight`) — c'est la matière des « copies locales ».
- 021 a réparé ce bloc au pixel (nœud `2115:4275`, 3 cartes à 474 px, x 89/627/1165,
  décision owner `021-post-repair-categories-principales-20260810`, acceptée). L'apparence
  post-021 est la référence pixel de 023.
- `ds.reassurances` compose `ds.carte` (master `2063:1606`, disposition Reassurance) — le
  set Carte sert donc AUSSI la section Réassurances ; tout geste sur ce set a une
  conséquence hors périmètre à nommer.

**Portée** : ces faits situent le travail mais ne remplacent pas l'audit par position
(§VIII) exécuté en T0 — le cliché components date du 2026-08-07 (limite nommée par 017 :
il est périmé par rapport au canvas vivant). Le décompte « 3 copies / 7 usages » est
re-vérifié live et fait foi s'il diffère (Assumption de la spec).

## D1 — Mécanisme de l'enum colonnes {2, 3} (décision renvoyée au plan par la spec)

**Décision** : prop enum `colonnes` (`'2' | '3'`) sur le contrat **section**, liée en
VARIANT côté Figma ; la grille est une part `display: grid` avec `columns: 2` en base et
un **`layoutByProp`** `{ prop: "colonnes", map: { "3": { "columns": 3 } } }`. Cela exige
une **extension additive du schéma** : `VariantLayoutSchema`
(`packages/schema/src/contract-schema.ts:207`) gagne un champ optionnel
`columns: z.number().int().positive().optional()`, avec une règle de refus nommée dans
`validateContract` (un override `columns` n'est licite que si le layout de base de la part
est `display: "grid"` — miroir de la contrainte existante lignes 181-187). Émission :

- code (`core/emit-react.ts`) : la règle d'enum-classe émise par layoutByProp porte
  `grid-template-columns: repeat(N, minmax(0, 1fr))` (même forme que la base, lignes
  1648/1718) ;
- Figma (`core/emit-figma-script.ts`) : la compilation par combo de variantes (l. 1021)
  fusionne l'override, et l'application grid existante (l. 3568-3572 :
  `gridColumnCount`, `gridRowCount = ceil(enfants/colonnes)`, pistes FLEX égales) fait le
  reste — chaque variante du set section obtient son compte de colonnes.

`docs/02-contract-spec.md` est bumpé avec le champ (Principe VI), et la capacité est
adossée à une eval AVANT d'être revendiquée (Principe II) : un cas de refus (columns hors
grid → refus par nom) + le déterminisme couvert par le re-pin golden.

**Rationale** :
- `docs/FIGMA-CAPABILITY-MATRIX.md` l. 61 : `display: grid` + pistes fixes égales est
  **CARRY-BOTH natif** (`layoutMode: 'GRID'` + `gridColumnCount`…), « carried
  contract→targets for a fixed number of equal tracks (`layout.columns`) ». Le sous-titre
  du même tableau exclut `auto-fit/minmax` (CARRY-CODE-ONLY) — un enum fermé {2,3} reste
  exactement dans le sous-ensemble borné porté.
- Précédent : `ds.equipe` (grille native `columns: 4`, cartes en `width: fill` qui
  « remplissent leur cellule ») — le patron éprouvé du dépôt pour une collection en
  grille.
- La limite nommée de `ds.reassurances` (contrat, part carte : *« le vocabulaire n'a pas
  de style d'instance par variante du parent »*) interdit l'alternative « largeur de carte
  par variante du parent » : avec une grille, la LARGEUR vit dans les pistes de la grille
  (parent), pas sur l'instance enfant — la limite n'est pas touchée.
- Le passage à la ligne (FR-018, edge case 4 cartes / 3 colonnes) est le comportement
  natif de la grille des deux côtés (`gridRowCount = ceil(n/colonnes)` ; CSS grid wrappe).

**Alternatives rejetées** :
1. *flex-wrap + largeur de carte par valeur (tokensByProp sur l'enfant)* — heurte de
   front la limite nommée ci-dessus (un parent ne restyle pas une instance) ; rejeté.
2. *Deux parts grille (`grid2`/`grid3`) en `visibleWhen`, sans toucher au schéma* — 
   dupliquerait la collection dans le DOM rendu (deux répétitions du même `itemsProp`),
   contenu caché en double côté code et côté Odoo (dont le DOM est le stockage) ; un hack
   de calque masqué au sens de §VIII ; rejeté.
3. *Porter le colonnage en littéral/section figée sans mécanisme* — invisible au
   différentiel (geometry-rides-tokens) ; rejeté.

## D2 — Le style « superposé + flèche » s'exprime avec le vocabulaire existant

**Décision** : le style (a) suit le patron **`ds.hero`** : plan photo `<img>` en
`position: absolute` (hors flux, `object-fit: cover`), contenu en `position: relative`
par-dessus, éventuel scrim `background-image: linear-gradient(...)` si le relevé
l'observe ; la flèche est l'icône gouvernée **`arrow-right`** du registre
(`contracts/icons.registry.json:132`). Aucun nouveau canal de schéma.

**Rationale** : patron déjà porté et prouvé (hero, hero-video) ; la grammaire gradient de
015 couvre le scrim ; l'affordance est une propriété officielle, pas un calque caché
(§VIII). **Alternative rejetée** : porter la photo en `background-image` — la grammaire du
canal (015, D5) est bornée à `linear-gradient(...)` seulement ; refusée par le schéma.

## D3 — Identité des masters : molécule unique à 2 styles ; le sort de `ds.carte` se
tranche au Gate A

**Décision** : FR-007 impose UN master carte-catégorie à UN axe « style » (2 valeurs). Le
modèle cible proposé au Gate A : un COMPONENT_SET **`CarteCategorie`** portant
`Style = Superpose | Empile`, où `Empile` reprend (à l'identique pixel) l'actuel
`Carte/Categorie` et `Superpose` officialise la construction native de la variante
`Standard`. Le sort du set `Carte` existant est une **sous-décision du Gate A**, éclairée
par le recensement de l'audit (usages de `Carte/Categorie` par position) :

- **Option recommandée** (si le recensement confirme que `Carte/Categorie` ne sert que le
  bloc Catégories) : la disposition `categorie` est retirée de `ds.carte` → **v3.0.0
  (majeur, versionné bruyamment, Principe VI)**, le set Figma `Carte` ne garde que
  Reassurance ; `ds.reassurances` (qui compose `disposition: reassurance`) est
  fonctionnellement intact, mais les épinglages de version (`inputs.lock.json`, authoring
  configs qui citent `ds.carte 2.x`) sont à rafraîchir — surface de re-pin nommée en D11.
- **Repli** (si le recensement trouve d'autres usages de `Carte/Categorie`) : `ds.carte`
  reste intact cette itération et la coexistence des deux masters « carte empilée » est
  consignée comme **dette nommée** (risque de dérive documenté là où il naît, Principe V),
  avec sa spec de résorption.

Le plan ne tranche pas à la place de l'owner : il structure la décision et fournit les
données (audit) — c'est exactement FR-001.

## D4 — Modèle du contrat section

**Décision** : `ds.categories-principales` porte :
- `style` : enum `superpose | empile`, **VARIANT** côté Figma, **transmis** à la carte
  répétée via `component.props: { "style": "{style}" }` — la fusion props fixes + champs
  par item sous `repeat` est déjà le comportement du générateur
  (`core/emit-react.ts:2993`, `fixedAttrs` + substitution des props parentes) ; la
  transmission côté script Figma (compilation par combo) est **à vérifier sur le mock au
  premier build** — vérification nommée, pas une hypothèse silencieuse.
- `colonnes` : enum `'2' | '3'`, VARIANT (D1).
- `cartes` : prop `arrayOf` + part `repeat` composant la molécule (patron `ds.equipe`).

Côté Figma, le set section nettoyé devient **2 axes orthogonaux**
`Style {Superpose, Empile} × Colonnes {2, 3}` (4 variantes qui disent chacune la vérité —
contre les 4 actuelles qui mélangent trois natures). « **Rdv** » cesse d'être une
variante : c'est une **instance renseignée** de la section (contenu), préservée à
l'identique (FR-009). NB : l'orthogonalité complète (les 4 combinaisons existent) est le
modèle proposé ; si l'audit montre qu'une combinaison n'a aucune réalité design, le Gate A
peut la retirer — le mécanisme reste identique.

## D5 — Champs d'items, image et lien : qui porte quoi

**Décision** :
- **items** (`cartes`) : champs texte `titre`, `description` (patron equipe `{poste,
  nom}`) ; le libellé du CTA du style empilé reste une prop de la molécule (précédent
  `ds.carte.ctaLabel`).
- **image** : prop `imageUrl`/`imageAlt` sur la molécule, `bindings.figma: NONE` — la
  ROUTE, jamais les octets (doctrine A5, reprise verbatim de `ds.carte.imageUrl` ; lavis
  technique `#D9D9D9` au canvas, photos maquette préservées par la passe de sauvetage,
  `docs/handoff/08-status-what-doesnt-work.md` §6). Côté Odoo, l'image par carte s'édite
  par le mécanisme éprouvé `computed-display` (equipe : « Remplacer le portrait »).
- **lien (destination)** : **PAS une prop de contrat.** Doctrine établie et vérifiée :
  aucun contrat ne porte de `href` ; la destination est un contenu consommateur, portée
  côté Odoo par le contrôle **`BuilderUrlPicker` / action `pqrSetCtaHref`** (déjà en
  service sur presentation/hero/faq/devis/sav) avec l'hôte `<a t-att-href>` du bouton
  gouverné (décision owner du 2026-08-18, `views/components.xml:119`). La seule nouveauté
  Odoo est un **assemblage** de deux mécanismes éprouvés : l'adressage par item d'un
  `ordered-repeat` (equipe) × le sélecteur d'URL (5 sections) — nommé comme tel, aucune
  mécanique nouvelle.

## D6 — Identifiants et noms définitifs

**Décision** : molécule **`ds.carte-categorie`** (`contracts/carte-categorie.contract.json`,
`category: "molecule"`, master canvas `CarteCategorie`) ; section
**`ds.categories-principales`** (`contracts/categories-principales.contract.json`,
`category: "section"`, master canvas `CategoriesPrincipales` — nom déjà porté). Rationale :
cohérence avec la famille française du dépôt (`carte`, `equipe`, `reassurances`…), noms de
calques/props qui disent la vérité (§VIII), et continuité avec le nom déjà posé au canvas.
Les noms de travail de la spec (`ds.category-card`, `ds.categories`) sont remplacés.

## D7 — Câblage du différentiel et de la parité visuelle

**Décision** :
- **Trois axes** : la découverte des contrats est automatique
  (`parity/diff.ts:77` — readdir de `contracts/*.contract.json`) → aucun registre à
  éditer, l'exclusion silencieuse est structurellement impossible pour l'axe code. L'axe
  canvas exige le **rafraîchissement (lecture seule) de
  `parity/snapshots/figma-components.json`** après mutations — ce qui solde au passage la
  limite nommée laissée par 017 (cliché périmé du 2026-08-07). Axe tokens inchangé.
- **Parité visuelle** : +2 entrées dans `extract/figma/visual-parity/subjects.ts`
  (`{id, label, kind: 'contract', contractId, fileKey, setNodeId, renderWidth}`) +
  baseline ; pour les photos runtime, suivre le sujet `ds.carte` existant (même classe de
  sujet, prêt d'actifs de fixture si nécessaire, mécanique 017). Le test d'US3 (dérive
  injectée → signalée → retirée → retour au vert) est un protocole de preuve exécuté et
  archivé dans `proofs/`, pas une eval permanente.

## D8 — Artefacts et discipline des quatre gates humains

**Décision** : réutiliser les formats éprouvés de 021/022, un artefact machine + une trace
datée par gate, tous sous `specs/023-categories-gouvernees/` :

| Gate | Artefact machine | Trace | Patron |
|---|---|---|---|
| A | `gates/gate-a-modele-cible.json` (modèle cible + sort de CHAQUE copie dérivée, décision par copie) | `proofs/gate-a.md` daté | 021 `owner-decisions/*.json` |
| B | `gates/gate-b-pixel.json` (7 comparaisons chiffrées, deltas attribués) | `proofs/gate-b.md` | 021 post-repair |
| C | `gates/gate-c-contrats.json` (réf. du diff révisable) | `proofs/gate-c.md` | Principe VI (le diff EST la revue) |
| D | `contracts/categories.editable-scope.json` (**100 % des props ET parts des DEUX contrats**, 4 verdicts : `directly-editable`/`controlled` ↔ éditable, `fixed-by-composition`, `not-editable`, `hors-capacite`) | `proofs/gate-d.md` | 022 `*.editable-scope.json`, transcription 1:1 vers `integrations/odoo/config/categories.authoring.json`, exhaustivité vérifiée par `npm run odoo:authoring:check` |

Chaque gate est un arrêt réel (FR-005) : les tâches aval sont bloquées par la présence de
l'artefact `status: validated` + trace datée, vérifiable dans le dépôt (SC-007).

## D9 — Avant-capture (§X) et instrument

**Décision** : réutiliser tel quel `extract/figma/page-parity/`
(bridge `capture.js`/`scan.js`/`checkpoint.js`, receiver port 9227) — l'instrument §X
éprouvé de 005/007/016. Cibles de capture, TOUTES avant la première mutation : les
**7 usages** de la page `Pages` (`210:325`, seule route : pont figma-console
`figma_execute` + `loadAllPagesAsync`), le master `CategoriesPrincipales` (4 variantes),
le master `Carte` (2 variantes — touché ou non, il est adjacent à la zone), chaque capture
vérifiée **non vide et correctement dimensionnée** avant de continuer. Écriture canvas
mono-session, zone unique → §XI sans objet (pas d'écriture parallèle).

## D10 — Couche Odoo : périmètre après Gate D

**Décision** : instance QA jetable épinglée (`odoo:19.0-20260803` + `postgres:15`,
compose de 022) ; snippet + panneau dérivés du contrat via la chaîne existante
(`npm run build` inclut désormais `odoo:assets` + `odoo:derivation`) ; mécanismes tous
éprouvés : `ordered-repeat` (add/remove/reorder), `plain-text`/`rich-text` (titre,
description), `computed-display` (image), **`enum`** (sélecteur de colonnes {2,3} — 3
usages existants du mécanisme), URL picker par carte (D5). Blocage du geste (scénario 5
d'US2) : même mécanique de frontière que 022, prouvée par l'instrument
`editability-boundary`. **Portes rouges pré-existantes nommées, à ne pas re-diagnostiquer**
(mémoire projet, antérieures à 022) : `odoo:qualification` (reçu 019 incohérent) et
`editability-boundary` 43/44 (champ périmé depuis `cc6cd0d4`) — leur état est re-relevé
à T0 et consigné ; 023 n'a pas à les verdir, seulement à ne pas les aggraver.

## D11 — Surface de re-pin (nommée d'avance, pour ne pas la découvrir)

L'édition d'émetteurs + l'ajout de 2 contrats entraînent, en plus des artefacts générés :
`evals/golden.json` (re-pin revu), `figma-sync/plugin/engine.receipt.json` (re-pin propre
à `plugin:check`), **`examples/polaris/figma/*.figma.js`** (3ᵉ reçu, dérive à toute
édition d'émetteur — mémoire projet), `integrations/odoo/config/inputs.lock.json` (si les
versions épinglées bougent — D3), `integrations/odoo/derivation-report.json` (régénéré par
le build), et `catalog/catalog.json` via **`npm run catalog` explicite** (leçon 018 : le
build ne le régénère PAS). Clichés parité rafraîchis en lecture (D7).

## D12 — Géométrie en tokens, jamais en littéraux

**Décision** : toute géométrie des deux contrats est extraite puis portée en tokens —
réutilisation des `space.N` existants (`space.89`, `space.128`, `space.64`… déjà mintés)
et mint **from-dump** de `size.carte-categorie.*` / `size.categories-principales.*` pour
ce qui manque (doctrine `tokens/primitives.tokens.json` § space, règle
geometry-rides-tokens). Aucun nombre écrit à la main ; le gate `npm run geometry:gate`
(015) reste à 0 valeur invisible ; toute exception passe par le registre des littéraux
nommés, jamais en silence.
