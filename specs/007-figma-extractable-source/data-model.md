# Data Model — Spec 007

Les « entités » de cette itération ne sont pas des tables : ce sont les **objets de mesure**
et les **objets de preuve**. Elles sont listées ici avec leurs champs, leurs invariants et
leurs transitions, parce que chaque exigence de la spec s'y adosse — un compteur sans son
entité n'est pas vérifiable.

---

## 1 · Le relevé (`Releve`)

La mesure de référence. Produit par la procédure de `contracts/note-census.md`.

| Champ | Type | Source |
|---|---|---|
| `date` | ISO date | horodatage de la prise |
| `dumpSha256` | string | empreinte du dump banké (non committé) |
| `masters` | `MasterFacts[]` | 55 attendus |
| `proposals` | `{ id, name, valid }[]` | sortie `proposeBatchFromDump` |
| `notes` | `Note[]` | toutes classes confondues |
| `counts` | `Record<ClasseNote, number>` | l'unité de compte de la spec |

**Invariants**
- `proposals.length === masters.length` — 1 master ⇒ 1 proposition (`isDumpSet` est
  structurel, jamais nominal : aucun master ne disparaît en silence).
- `counts` est calculé, jamais saisi. Un compteur écrit à la main est un refus.
- Un relevé n'est jamais committé avec son dump (~300 KB) ; **le relevé est committé, le dump
  ne l'est pas** — il est reproductible en deux minutes.

**Transitions** : `ouverture` → `intermédiaire` (après chaque phase de gestes) → `clôture`.
Seuls `ouverture` et `clôture` sont opposables aux SC ; les intermédiaires servent le pilotage.

---

## 2 · La classe de note (`ClasseNote`)

L'unité de compte. Six classes, identifiées par **préfixe stable** de la chaîne émise —
jamais par position ni par comptage manuel. Chaînes exactes en `contracts/note-census.md`.

| Clé | Classe | Départ mesuré | Cible |
|---|---|---|---|
| `A` | nom de set ≠ nom de composant PascalCase | **36** | 0 |
| `B` | nom de set à caractères non transportables | **10** (spec : 12 — écart à confirmer) | 0 |
| `C` | nom de propriété hors identifiant légal | **10** occurrences / 6 distinctes | 0 |
| `D` | collision de nom de part dans un même contrat | **22** | 0 |
| `E` | valeur sans token (`UNBOUND`), par canal | **193** (dont **60** sans token de valeur identique) | 0 sur les canaux mesurés |
| `F` | style de texte non dérivé d'un token | **41** | ⚠️ **non atteignable sur canvas** — voir R9 / décision O2 |

**Invariant d'honnêteté** : une exception **ne réduit jamais** un compteur. Elle est comptée
à part et nommée. `F` en est le cas d'espèce : son zéro dépend d'une regex du dépôt, pas du
canvas.

---

## 3 · Le master (`MasterFacts`)

Un des 55 nœuds gouvernés du fichier (14 `COMPONENT_SET` + 41 `COMPONENT` autonomes, vérifié
live le 2026-07-26).

| Champ | Type | Rôle |
|---|---|---|
| `nodeId` | `"2115:4277"` | ancre stable — **survit au renommage** |
| `key` / `componentSetKey` | string | ancre d'identité des contrats adoptés — survit aussi |
| `name` | string | **futur identifiant** — l'objet du chantier 1.1 |
| `description` | string | porteur de l'orthographe française accentuée (FR-006a) |
| `page` | `DS · Atomes \| DS · Molécules \| DS · Organisms` | zone de partition pour les écrivains parallèles |
| `props` | `PropFacts[]` | 57 au total |
| `channels` | valeurs par canal tokenisable | matière du chantier 1.2 |

**Invariant** : le relevé se fait **par position et par signature structurelle**, jamais par
nom — chercher un défaut de nommage en filtrant par nom, c'est mesurer le défaut avec l'outil
défectueux (règle reconduite de la 005).

---

## 4 · L'entrée de table de nommage (`NamingRow`)

L'artefact bloquant de FR-030 / SC-015. Une ligne par identifiant à changer.

| Champ | Contrainte |
|---|---|
| `kind` | `set` \| `prop` \| `variantValue` \| `layer` \| `part` |
| `nodeId` | obligatoire (ancre, pas le nom) |
| `ancien` | l'orthographe portée aujourd'hui |
| `nouveau` | l'orthographe cible |
| `descriptionFr` | l'orthographe accentuée déplacée vers la description (`set` seulement) |
| `classes` | quelles notes cette ligne éteint (`A`, `B`, `C`, `D`) |
| `oracle` | **`CLEAN` obligatoire** |

**Invariants**
- Une ligne dont `oracle !== 'CLEAN'` **ne peut pas être exécutée** : elle rouvrirait la note
  qu'elle prétend fermer.
- `kind: 'prop'` n'a **pas** de `descriptionFr` : une propriété Figma n'a pas de champ
  description — l'ASCII est son seul porteur (FR-006b), et le sens français, s'il compte, part
  dans la description du **composant** porteur.
- **Aucun nom n'est appliqué hors table** (SC-015 : 0). La table est relue en un seul bloc,
  puis l'exécution suit sans re-validation cas par cas.

---

## 5 · La variable / le token (`TokenFacts`)

Le porteur d'une valeur. Une valeur liée entre dans le contrat ; une valeur en dur n'y entre pas.

| Champ | Exemple |
|---|---|
| `collection` | `Primitives` (mode `Value`) \| `Semantic` (mode `Light`) |
| `figmaName` | `font/line-height/60` (séparateur `/`) |
| `dtcgPath` | `font.line-height.60` (séparateur `.`) — la promotion future est une **copie** |
| `type` | `FLOAT` \| `COLOR` \| `STRING` |
| `value` | **exactement la valeur observée** (FR-013) |
| `alias` | pour un rôle : `{font.size.48}` |
| `occurrences` | combien de nœuds la consomment — matière du backlog d'harmonisation |

**Invariants**
- **Jamais d'arrondi, jamais de rapprochement** vers un token voisin (FR-013, FR-015). La
  recherche a montré que `suggestFor` fait un lookup **exact** sur valeur normalisée : « token
  proche » veut dire *token de valeur identique*, il n'existe aucun mécanisme d'arrondi.
- Une variable créée sans consommateur est **invisible au pixel** : son absence de preuve est
  déclarée telle quelle, jamais convertie en « identique » (FR/edge case).
- Les rôles `typography.<rôle>` doivent porter **4** propriétés (family, size, weight,
  **line-height**) ; les 8 rôles existants n'en portent que 3 aujourd'hui.

---

## 6 · Le style de texte (`TextStyleFacts`)

18 objets, mesurés en direct. Le style — pas la variable — est l'objet qui assemble la typo :
une variable Figma est scalaire, elle ne peut pas porter un paquet.

| Champ | Départ mesuré |
|---|---|
| `name` | `Titre 1` … `Note de champ` |
| `fontName {family, style}` | Montserrat × {Regular, Medium, SemiBold, Bold} |
| `fontSize` / `lineHeight` / `letterSpacing` | cf. table R8 |
| `boundVariables` | **0/18** |
| `pluginData['ds_contracts/textStyleToken']` | **0/18** |

**Transitions** : `littéral` → `lié` (chaque propriété dérive d'une variable) → `marqué`
(le marqueur porte son chemin de token). Les deux compteurs de SC-013 sont indépendants et
tous deux exigés.

**Invariants**
- **Aucune fusion** : deux styles qui diffèrent aujourd'hui restent deux styles (US2 sc. 4).
  `Titre 2 majuscules` et `Titre 2` ont les mêmes métriques et restent distincts.
- `Note de champ` porte un interligne `AUTO` : ce n'est pas une valeur liable — c'est un **cas
  à trancher par écrit** (FR-019), pas une liaison à forcer.
- Sans le marqueur, le générateur **créerait 18 doublons** à la première génération : c'est la
  raison d'être de FR-010c, indépendante de la classe de note `F`.

---

## 7 · Le cycle de preuve (`Cycle`)

Un lot cohérent de gestes, encadré par une capture avant exhaustive et une mesure après.

| Champ | Contenu |
|---|---|
| `id` | `L1`, `L2`, …, `V1`, … |
| `versionId` | le point Figma enregistré **avant** la passe (`007/<passe>/<étape>`) |
| `diffAnnonce` | la prédiction, **écrite avant** toute écriture |
| `cibles` | **43** (9 maquettes + 34 sections DS) |
| `before[]` / `after[]` | un PNG + manifeste par cible, nom **préfixé par la page** |
| `verdict` | `identical` \| `diff` \| `capture-failed` \| `dimension-mismatch`, par cible |
| `artefacts` | `proofs/<cycle>/{verdict.json,verdict.md,crops/,gestes.md}` |

**Invariants** (repris de `contracts/proof-cycle.md`)
- Les étapes 0 à 4 précèdent **toute** écriture, sans exception.
- La capture avant existe pour **100 %** des cibles — jamais un sous-ensemble pilote (SC-007,
  règle before-capture, leçon Gallery-item).
- `capture-failed` / `dimension-mismatch` ⇒ **la preuve n'a pas eu lieu** (exit 2). C'est un
  refus, jamais une dégradation vers « identique ».
- Un lot annoncé 0 pixel qui rend ≥1 `diff` ⇒ **STOP**, lot annulé **en entier**. On ne
  requalifie jamais après coup un écart imprévu en « bruit de rendu ».

---

## 8 · Le résidu acquitté (`Residu`)

Les 4 écarts hérités du cycle 14 de la 005, acceptés comme ligne de base (FR-024).

| Page | Départ | Suivi |
|---|---|---|
| Portes d'entrée | 17 px | à chaque verdict |
| Portes de garage (rés.) | 20 px | idem |
| À Propos | 99 px | idem |
| Contactez-nous | 469 px | idem |

**Invariant** : la 007 lie `fontWeight`, `lineHeight` et `fontSize` — **les leviers mêmes qui
ont produit ces écarts**. Tout mouvement, en mieux comme en pire, est un **fait à rapporter**
(FR-024a, SC-008a) : **0** résidu absorbé en silence.

---

## 9 · L'exception nommée & la dette léguée

| Entité | Champs | Destinataire |
|---|---|---|
| `ExceptionNommee` | `quoi`, `pourquoi`, `preuve ou absence de preuve`, `destinataire` | rapport de clôture |
| `DetteLeguee` | `item`, `origine`, `réparation attendue`, `coût` (bump majeur / mineur) | → Prochaines étapes |

**Invariant** : rien ne se lègue en dehors de la section « Prochaines étapes » de la spec —
un seul endroit, repris item par item par le rapport de clôture. Le précédent que cette règle
ferme : la 005 a légué 4 divergences qui ne figurent dans le document d'aucune spec suivante.

**Dette déjà connue à l'ouverture** : les 4 divergences 005 · les **4 + 1 trous d'émetteur**
(les 4 de FR-027a, plus `loadFontAsync('Inter')` en dur dans la création de style — R9) · le
re-pointage des 5 contrats vers `typography.*` · les divergences ouvertes par les renommages
(5 contrats adoptés **+ le registre d'icônes** si O1 est retenu) · les accroches **par nom**
dans l'outillage (`parity/diff.ts` l. 769 `'Bouton'` / l. 773 `'Glyphe'`, `evals/harness.ts`
l. 181, `bridge/scan.js` l. 69 — R11) · la divergence documentaire du README de `page-parity`
(périmètre 9 → 43).
