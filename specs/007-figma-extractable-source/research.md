# Research — Spec 007 · Canvas : rendre la source Figma extractible

**Date** : 2026-07-26 · **Branche** : `007-figma-extractable-source`
**Méthode** : lecture du dépôt + relevés **live en lecture seule** sur `Piqueray (Copy)`
(`d9FYAUcqdcNtsuaMgLefvJ`) via le pont desktop, port 9223. Aucune écriture canvas.

Toutes les décisions ci-dessous sont **mesurées**, jamais supposées. Là où un chiffre de la
spec est infirmé par la mesure, c'est écrit ici et remonté au plan — la spec a été rédigée
sur un backlog daté du 2026-07-25, et deux de ses fondations ont bougé depuis.

---

## R1 — Le périmètre de mesure étendu (Q4 / FR-020) ne coûte **aucune** édition du dépôt

**Décision** : étendre le périmètre aux pages DS **par les cibles passées à l'instrument**,
pas en modifiant l'instrument.

**Constat.** L'instrument `extract/figma/page-parity/` est déjà agnostique au périmètre :

| Étage | Ce qui fixe le périmètre | Verdict |
|---|---|---|
| `bridge/capture.js` | `globalThis.__dsc003_input = { maquette, nodeId, port, expectNonce }` — `exportAsync` sur **n'importe quel** node (l. 34-47, 76) | paramétré |
| `cli.ts` (`pages:compare`) | `const maquetteNames = [...new Set([...beforeNames, ...afterNames])]` (l. 131) — la liste sort des **noms de PNG présents** | déduit |
| `report.ts` / `compare.ts` | un `PixelVerdict` par entrée, `total = doc.maquettes.length` (cli l. 150) | N/N générique |
| `bridge/checkpoint.js` | regex `^\d{3}\/[^/]+\/[^/]+$` — déjà généralisée en 005 (`689637e`), **committée** | `007/…` passe |

**Conséquence** : `capture.js` piloté sur d'autres `nodeId` suffit. Le « 9/9 » du README est
descriptif de l'usage 003, pas une contrainte du code.

**Les cibles DS, relevées live.** Les pages n'ont pas de `width` (`'width' in page === false`)
mais ont `exportAsync`. Capturer la **page** entière est possible mais produit des PNG
démesurés et une bounding-box instable ; les **enfants de premier niveau** sont tous
exportables et de taille bornée :

| Page | Cibles | Détail |
|---|---|---|
| `Pages` (`210:325`) | **9** FRAME | les 9 maquettes, 1728 × 3334-6762 px |
| `DS · Atomes` (`2052:1144`) | **5** | 2 SECTION (`Formulaire`, `Icônes`) + 3 COMPONENT_SET (`piqueray_logo`, `Bouton`, `member-picture`) |
| `DS · Molécules` (`2052:1145`) | **13** SECTION | `Field` … `Nav-item` |
| `DS · Organisms` (`2052:1146`) | **16** SECTION | `Devis` … `Hero vidéo` |
| **Périmètre FR-020** | **43** | 9 + 34 |
| `DS · Tokens` (`2051:951`) | 3 SECTION | hors verdict courant ; entre au cycle FR-031 |

Le fichier porte **6** pages, pas 5 : une page séparatrice `----------------------`
(`2171:7347`, 0 enfant) — rien à mesurer, mentionnée pour que le compte ne surprenne pas.

**Alternatives écartées** : (a) capturer les pages entières — bounding-box dépendante du
placement, un déplacement de master ferait un faux positif ; (b) ajouter une liste de pages
dans `cli.ts` — édition dépôt interdite (FR-025) **et inutile**, le CLI déduit déjà.

**Piège nommé — collision de noms de fichiers.** Le PNG est écrit sous
`<maquette>.png` (`cli.ts` l. 136). Or les noms de sections se répètent entre pages :
`Formulaire` (Atomes **et** Organisms), `Header`, `Footer`, `Hero`, `Présentation`,
`Coordonnées`, `SAV`, `Texte SEO`, `Réassurances`, `Catégories principales`,
`Produits e-commerce`, `Réalisations`. Sans préfixe, une capture en écrase une autre **en
silence** — le verdict resterait vert sur une cible non mesurée. **Le nom de cible passé à
`capture.js` DOIT être préfixé par sa page** (`DS-Atomes__Formulaire`), ce qui ne coûte rien :
c'est un argument, pas du code.

## R2 — Étalonnage obligatoire sur les 43 cibles, avant le premier geste

Le contrat 005 (`contracts/proof-cycle.md` §4) et le README §5 imposent un étalonnage —
double capture sans rien faire entre les deux → **N/N identical**, sinon **STOP programme**.

Les 34 cibles DS **n'ont jamais été mesurées** : leur plancher de bruit est inconnu. Q4 le
dit (« leur ligne de base s'établit au premier relevé »). L'étalonnage 003 portait sur 9
cibles et a passé 9/9 ; rien ne permet de l'étendre par analogie à 43 — notamment les
SECTION, jamais exportées par cet instrument.

**Décision** : cycle 0 = `pages:selftest` (5 fixtures, sans Figma) **puis** double capture
des 43 cibles. Un plancher non nul sur une cible DS n'annule pas l'itération : la cible
concernée sort du verdict, **nommément**, et le rapport la porte. Un plancher non nul sur
une des 9 maquettes = STOP programme (régression par rapport à l'acquis 003).

## R3 — La procédure du relevé : deux trous à combler pour SC-011

SC-011 exige qu'un tiers reproduise les compteurs **à partir du seul rapport de clôture**.
Deux obstacles mesurés, aucun n'est bloquant, les deux doivent être écrits :

**Trou A — `TARGET_SETS` n'est pas `[]` dans le dépôt.** `extract/figma/dump.plugin.js`
l. 66 est committé `const TARGET_SETS = ['Badge', 'Switch', 'Card'];`. Le filtre (l. 447)
`if (TARGET_SETS.length > 0 && !TARGET_SETS.includes(node.name)) continue;` — donc la recette
de `PREPA-2-SPECS-SUIVANTES.md` (« banker avec `TARGET_SETS = []` ») suppose une **édition
locale non committée**. Un tiers qui suit la recette sans ce pas capture **3 sets, pas 55**.
→ la procédure doit écrire ce pas verbatim (édition locale, jamais committée : FR-025).

**Trou B — aucun compteur n'existe.** `figmaProposalsReport` (`core/propose-figma.ts`
l. 4669-4685) concatène `proposal.notes` en puces markdown sous `## <setName>` : ni classe,
ni compte. Les « 704 notes / 196 classes » viennent d'un traitement hors dépôt.
`extract/figma/gauntlet/census.ts` classe des **violations de referee**, pas des notes de
proposition, et tourne sur la fixture CBDS.
→ **le compteur est un livrable de cette spec**, et il vit sous
`specs/007-figma-extractable-source/` (FR-025). Forme : appeler `proposeBatchFromDump`
(exporté, pur, déterministe, sans `node:*`) sur le dump banké, puis classer les `notes[]` par
**préfixe stable** (R4). Ne jamais regexer le markdown.

**Validité 55/55** : `ContractSchema.parse()` est appelé **sans** `safeParse` dans
`proposeFromDump` (l. 4642-4643) et la CLI n'a pas de `try/catch` (propose.ts l. 223-240) —
« 55/55 valides » n'est pas un compteur imprimé, c'est la conséquence du process qui va au
bout. Pour un chiffre explicite : compter les fichiers de sortie, ou passer par
`proposeBatchFromDump` qui renvoie `{proposals, skipped}`.

## R4 — Les classes de notes, par préfixe stable (l'unité de compte)

Chaînes exactes, citées du code — ce sont les clés de classement du compteur R3 :

| Classe | Préfixe / motif | Site | Déclencheur |
|---|---|---|---|
| **A** — nom de set ≠ nom de composant | `contract name: drawn set name "…" is not a PascalCase component name` | l. 4430-4434 | `pascalComponentName(setName) !== setName` |
| **B** — caractères qu'un id ne porte pas | `contract id: drawn set name "…" contains characters a contract id cannot carry` | l. 4436-4443 | `idSlugSanitized(setName)` |
| **C** — propriété hors identifiant légal | ``prop `…`: Figma property "…" contains characters outside a legal identifier`` | l. 4445-4451 (+ slots l. 4302) | `propNameSanitized(property)` |
| **D** — collision de nom de part | `… part name "…" already names another part of this contract` | l. 2510-2521 (`partKey`) | `taken.has(base)` |
| **E** — valeur sans token | `UNBOUND <path> <property> = <valeur> — no token invented; nearest tokens by value: …` | l. 4649-4655 via `reportUnbound` | canal non lié |
| **F** — style non dérivé d'un token | `… rides text style "…" which is not a token-derived style — typography not proposed` | l. 1808-1811 | `!corpus.textStyleByName.get(nom)` |

`E` porte le canal dans `property` : `itemSpacing` (l. 1235), `padding` (1263),
`cornerRadius` (1267), `strokeWeight` (1276), min/max (1287-1304), `fontWeight` (1740),
`lineHeight` (1763), `fontSize` (1799), `opacity` (1375), `effects` (1413), peintures (1056,
3739…). Le sous-compte « aucun token proche » (60) = `suggestions.length === 0`, rendu
`(none found)`.

**`suggestFor` n'est pas une recherche de proximité.** `core/token-corpus.ts` l. 94-127 :
index `valeur normalisée → chemins de tokens`, lookup **exact**. Il n'y a ni distance, ni
seuil. « Token proche » = *token de valeur identique*. Cela **renforce** FR-013 (valeur
exacte) : il n'existe aucun mécanisme d'arrondi à contourner.

## R5 — La translittération, et l'oracle qui rend la table de nommage vérifiable **avant** le geste

Les fonctions (`core/propose-figma.ts` l. 35, 63, 95, 113 ; `kebab` dans
`extract/types.ts` l. 183) n'ont **aucune** table de repli ASCII : `[a-z]`, `[A-Za-z0-9]`
sont ASCII-only, donc tout caractère accentué est traité comme **séparateur** et **supprimé**
— jamais replié sur sa lettre de base. C'est tout le mécanisme.

**Décision** : la table de nommage (FR-030) est validée **mécaniquement, hors ligne**, par un
oracle qui transcrit ces fonctions verbatim. Critère d'acceptation d'un nom candidat :
`pascalComponentName(n) === n` **et** `idSlugSanitized(n) === false` **et**
`propNameSanitized(p) === false`. Aucun nom n'entre dans la table sans passer l'oracle ; SC-003
(0 translittération) devient une propriété **prouvée avant exécution**, pas constatée après.

**Résultats de l'oracle sur le relevé live du 2026-07-26** (55 masters, 57 propriétés) :

| Classe | Oracle | Spec | Verdict |
|---|---|---|---|
| A — nom ≠ PascalCase | **36 / 55** | 36 | ✅ reproduit |
| B — caractères illégaux | **10** | 12 | ⚠️ écart de 2 |
| C — propriété illégale | **10 occurrences / 6 distinctes** | 10 | ✅ reproduit |

Écart B : le second site d'émission (`l. 2214`, `if (isNew && idSlugSanitized(instanceOf))`)
porte sur les **références d'instance imbriquée**, pas sur les noms de set — les 2 manquants
viennent très probablement de là. À confirmer au relevé d'ouverture, pas à supposer.

**Le fait que la spec n'avait pas vu.** Retirer les accents **ne suffit pas** pour la classe A,
qui exige le PascalCase strict :

| Nom actuel | ASCII seul | Verdict | Nom pleinement propre |
|---|---|---|---|
| `Étoile` | `Etoile` | ✅ CLEAN | `Etoile` |
| `Réassurances` | `Reassurances` | ✅ CLEAN | `Reassurances` |
| `Hero vidéo` | `Hero video` | ❌ note A subsiste | `HeroVideo` |
| `Catégories principales` | `Categories principales` | ❌ note A | `CategoriesPrincipales` |
| `Texte SEO` | (inchangé) | ❌ note A | `TexteSEO` |
| `Section-header` | (inchangé) | ❌ note A | `SectionHeader` |
| `member-picture` | (inchangé) | ❌ note A | `MemberPicture` |
| `chevron-right` | (inchangé) | ❌ note A | `ChevronRight` |
| `piqueray_logo` | (inchangé) | ❌ note A | `PiquerayLogo` |
| `octicon:chevron-down-12` | (inchangé) | ❌ notes A + B | `OcticonChevronDown12` |

**Conséquence remontée au plan** : SC-001/SC-003 à zéro impliquent de renommer **les 36**, dont
les **15 icônes en kebab** gouvernées par `contracts/icons.registry.json` (spec 002) et les
7 molécules en kebab (`Section-header`, `Accordion-row`, `Product-card`, `Member-card`,
`Carousel-controls`, `Footer-column`, `Nav-item`). C'est un changement de convention de
nommage du fichier, très au-delà de « retirer les accents » — **décision owner**, portée au
plan comme telle. Les propriétés, elles, sont sans piège : espaces, `_` et `-` sont légaux,
donc `État→Etat`, `Libellé→Libelle`, `Icône gauche→Icone gauche`, `Coché→Coche`,
`En-tête→En-tete` suffisent (oracle : `sanitizedNote=false` sur les 6).

## R6 — Une classe que les exigences ne couvrent pas : les **valeurs de variant**

Relevé live : **10 valeurs de variant** portent du non-ASCII —
`Défaut` (member-picture, Tab), `Sélectionné`, `Fermé`, `Présentation`, `Réassurance`,
`Catégorie`, et 3 valeurs à point médian `·` (`4 cartes · 2 CTA`,
`Pleine largeur · 3 cartes`, `Pleine largeur · RDV`).

Or c'est **exactement** la classe que le document de prépa chiffre comme **bump majeur**
(« Renommer un master, une prop, **une valeur de variant** ») et dont le précédent Bouton
(« Outilne noir ») est l'illustration. FR-002/FR-003/FR-006 couvrent sets, propriétés et
calques — **pas** les valeurs de variant.

**Décision** : les traiter dans la table de nommage au même titre que les autres identifiants,
et le signaler au plan comme un **manque d'exigence**, pas comme un ajout de périmètre
discrétionnaire. (Note : « Outline noir » est déjà correct dans le fichier — la faute
historique a été corrigée avant cette itération.)

## R7 — Tokenisation : ce qui existe déjà, et ce qui manque exactement

Relevé live : **62 variables**, 2 collections — `Primitives` (mode `Value`, 38) et
`Semantic` (mode `Light`, 24). Convention Figma = `/`, convention DTCG = `.`.

Contrairement à une lecture rapide du « refus space/radius de la 003 », **les gammes existent
déjà**, elles sont seulement squelettiques :

| Famille | Existant | Manque pour couvrir l'observé |
|---|---|---|
| `font/size` | 14, 16, 18, 20, 24, 32, 40, 48 | **44, 54** |
| `font/weight` | regular, medium, semibold | **bold** |
| `font/line-height` | **22 seulement** | 16, 20, 24, 25, 27, 30, 40, 48, 50, 60, 68 (+ le cas `AUTO`) |
| `font/family` | montserrat | — |
| `space` | 0, 4, 10, 16, 32 | à compléter sur les 58 `itemSpacing` + 22 `padding` |
| `radius` | **32 seulement** | à compléter sur les 3 `cornerRadius` |
| `border-width` | 0, 2 | à compléter sur les 9 `strokeWeight` |
| `opacity` | base | cf. R9 |
| `typography/<rôle>` | 8 rôles × **3** props (family, size, weight) | **`line-height` absent des 8 rôles** + 10 rôles neufs |

`typography/*` = 24 variables = exactement les 8 rôles `titre-1…6, paragraphe, lead` de
`tokens/semantic.tokens.json`, qui aliasent bien les primitives
(`typography.titre-1.size = "{font.size.48}"`). FR-010a est donc **exact** : les 8 rôles
existent, il faut les étendre, pas les refaire.

**Décision** : suivre la convention en place à la lettre (FR-009a) — primitives
`font/…`, `space/…`, `radius/…`, `border-width/…` dans `Primitives` ; rôles
`typography/<rôle>/<prop>` dans `Semantic`, aliasant les primitives. La promotion ultérieure
vers `tokens/` (→ Prochaines étapes) est alors une copie.

## R8 — Les 18 styles de texte : 0/18 liés, 0/18 marqués — **confirmé en direct**

Relevé live (`getLocalTextStylesAsync`, 2026-07-26) : **18 styles**, et sur les 18,
`Object.keys(style.boundVariables).length === 0` **et** `getPluginData('ds_contracts/textStyleToken')`
**et** `getSharedPluginData('ds_contracts','textStyleToken')` sont vides. SC-013 part donc bien
de **0/18 sur les deux compteurs**. (`getLocalPaintStylesAsync` : **0** style de peinture — les
couleurs sont toutes des variables.)

Table complète mesurée — c'est la matière première des 10 rôles neufs :

| # | Style | Famille / graisse | Taille | Interligne | Interlettrage |
|---|---|---|---|---|---|
| 1-8 | Titre 1…6, Paragraphe, Lead | Medium/Regular/SemiBold | 48,40,32,24,20,16,14,18 | 60,50,40,30,25,20,24,27 | 0 |
| 9 | Titre Hero | Bold | **54** | **68** | 0 |
| 10 | Libellé bouton | Medium | 16 | 22 | 0 |
| 11 | Paragraphe gras | **Bold** | 14 | 24 | 0 |
| 12 | Accroche | Regular | 20 | 25 | **15 %** |
| 13 | Onglet | SemiBold | 20 | 25 | 0 |
| 14 | Titre 3 majuscules | Regular | 32 | 40 | 0 |
| 15 | Titre 2 majuscules | Regular | 40 | 50 | 0 |
| 16 | Titre Hero vidéo | Regular | **44** | 48 | 0 |
| 17 | Libellé nav | Medium | 16 | **16** | 0 |
| 18 | Note de champ | Regular | 14 | **AUTO** | 0 |

Deux faits qui commandent des décisions : **Accroche** est le seul style à interlettrage non
nul (15 %) — il faut une gamme `font/letter-spacing` que rien ne porte aujourd'hui ; et
**Note de champ** est en interligne `AUTO`, qui n'est pas une valeur liable — c'est le cas
« 3 textes Field » du backlog (FR-019), et il se tranche, il ne se lie pas.

Les styles 14/15 ont les mêmes métriques que 3 et 2 : ils ne diffèrent que par la casse. Ils
restent **deux styles distincts** (US2 sc. 4, aucune fusion) et peuvent aliaser les mêmes
primitives.

**La liaison côté API est confirmée** (doc officielle croisée avec la matrice du dépôt) :
`TextStyle.setBoundVariable(field, variable)` existe, mêmes champs bindables que les nœuds
texte (`fontFamily`, `fontSize`, `fontStyle`, `fontWeight`, `letterSpacing`, `lineHeight`,
`paragraphSpacing`, `paragraphIndent`). Deux nuances d'exécution à figer avant P5 :
`fontName` (composite) se lie par ses deux moitiés `fontFamily` + `fontStyle` (STRING) ; et
comme les primitives `font/weight/*` sont des **noms** (regular/medium/semibold/bold), la
graisse se lie par `fontStyle`, pas par le canal numérique `fontWeight` (FLOAT).

## R9 — ⚠️ Le compteur « 41 styles non dérivés » ne peut pas atteindre zéro sans toucher au dépôt

**C'est le constat le plus important de cette phase, et il oppose deux exigences de la spec.**

Chaîne mesurée :

1. `core/token-corpus.ts` l. 71-89 construit les styles dérivés en filtrant les tokens
   **sémantiques** sur `/^font\.(.+?)\.size(?:\.([^.]+))?$/`.
2. `tokens/semantic.tokens.json` contient **24 chemins, tous `typography.*`, et 0 `font.*.size`**
   (vérifié par énumération des chemins DTCG).
3. Donc `textStyles = []` → `corpus.textStyleByName` est **vide**.
4. Donc `core/propose-figma.ts` l. 1808-1811 — `if (styleNames[0] && !style)` — émet la note
   **pour tout texte portant un style nommé**, quel que soit l'état du canvas.

**Conséquence** : lier les 18 styles à des variables et poser leur marqueur **ne fera pas
bouger ce compteur d'une unité**. Il est gouverné par une regex du dépôt, pas par le fichier
Figma. C'est **précisément le trou d'émetteur n° 1 de FR-027a**, que la spec classe elle-même
en **dette léguée / travail dépôt**.

La spec se contredit donc sur ce point : **SC-002** exige « 0 style de texte non dérivé d'un
token — départ : 41 » alors que **FR-025** interdit l'édition qui seule peut y parvenir.

**Options, et recommandation.**

| Option | Coût | Verdict |
|---|---|---|
| **(a) Re-cadrer SC-002** : le zéro porte sur les **193 valeurs numériques** ; les 41 sont une **limite nommée**, comptée à part, avec sa cause (regex `font.<groupe>.size` vs convention `typography.<rôle>.size`) et son destinataire (la spec suivante, FR-027a n° 1) | nul | **recommandé** |
| (b) Dérogation dépôt pour corriger la regex de `token-corpus.ts` | change le comportement du moteur → exige fixture + eval (principe II) ; sans commune mesure avec les 4 caractères de `checkpoint.js` en 005 | rejeté |
| (c) Renommer `typography.*` → `font.*` dans `tokens/` | édition dépôt **et** casse le nom des 8 rôles que FR-010a impose de réutiliser | rejeté |

L'option (a) préserve la valeur du chantier : **SC-013** (18/18 liés + marqués) est
atteignable sur canvas, mesurable en direct, et c'est lui le vrai reçu du lot typographique.
Note secondaire : même la regex corrigée, les noms dérivés seraient `titre-1`, `paragraphe`,
`lead` — qui ne correspondent pas aux noms de styles Figma (`Titre 1`, `Paragraphe`, `Lead`).
Le trou n° 1 est donc plus profond qu'une regex : à écrire tel quel dans la dette léguée.

**Cinquième trou, découvert en lisant le même bloc** : le chemin de création de style du
générateur charge la fonte **en dur** — `loadFontAsync({ family: 'Inter', … })`
(`core/emit-figma-script.ts` l. 664) — alors que la fonte Piqueray est Montserrat. Mort
aujourd'hui uniquement parce que `TEXT_STYLES = []` (trou n° 1) empêche cette boucle de
tourner ; il se déclenchera à l'instant où le trou n° 1 sera corrigé. Ajouté à la dette
léguée aux côtés des 4 trous de FR-027a.

## R10 — Le chantier 1.3 est **en grande partie déjà fait** : le backlog est périmé d'un cycle

`BACKLOG-SPEC-006-figma-styles-structure.md` est daté du 2026-07-25 (audit de clôture 005).
Le **cycle 14 post-clôture** (`d8b0d27`, nuit du 25-26) a livré, verbatim du message de commit :
« dé-GROUP ×11, adoption Section-header ×7, Hero vidéo rangé, verdict 5/9 + 4 résidus
sub-pixel nommés ».

Vérifié **live**, pas sur la foi du commit :

| Exigence | Attendu par la spec | Mesuré le 2026-07-26 |
|---|---|---|
| **FR-016** Section-header FIXED→FILL | FIXED 1550 | `2090:2386` et `2090:2387` : `layoutSizingHorizontal = "FILL"`, `layoutAlign = "STRETCH"` — **déjà FILL** |
| **FR-016** adoption ×7 | à rejouer | faite au cycle 14 |
| **FR-018 / SC-006** 11 GROUPs structurels | 11 (SAV ×4, Texte SEO ×3, Produits ×1, Footer ×3) | **0 des 11 ne subsiste** |

Ce qui reste réellement en GROUP dans le périmètre (scan exhaustif des 6 pages) :

- **`Tracé composé` / `Texte`** — groupes **vectoriels** internes aux icônes et à
  `piqueray_logo`, y compris leurs échos dans les instances. Ce ne sont pas des nœuds
  structurels : les dé-grouper détruirait les glyphes. **Hors périmètre**, à nommer.
- **`Avis Google`** ×5 (Contactez-nous, À Propos, Dépannage/SAV, Portes d'entrée, Portes de
  garage industrielles) — l'aplat de widget tiers, **déjà** hors périmètre par décision owner
  du 2026-07-25 et objet de la branche `006-google-reviews-block`.
- **`Header + Hero + Cat`** (`237:970`, page Portes d'entrée, 1 enfant) — **le seul GROUP
  structurel réellement résiduel**, non listé au backlog.

**Décision** : le chantier 1.3 est re-cadré sur ce qui existe — 1 GROUP résiduel à trancher,
plus les décisions écrites de FR-019 (styles sous seuil, 3 textes Field `AUTO`) qui, elles,
sont **intactes**. Les compteurs de départ de SC-006 (« départ : 11 ») et de FR-016 sont
**périmés** et doivent être re-relevés à l'ouverture, jamais recopiés (règle « aucun compteur
figé en prose », et leçon 005 « jamais sur la foi d'un audit externe sans re-vérifier »).

Deux compléments utiles au geste résiduel : **`figma.ungroup(node)` existe** dans l'API
Plugin (équivalent scripté de Ctrl-Shift-G) mais n'a **jamais servi dans ce dépôt** — les
dé-groupages 005 étaient des reconstructions manuelles (translater le GROUP, jamais le
redimensionner) ; l'appel natif est l'option la plus simple pour `237:970`, sous réserve
d'un mini-spike prouvé au pixel, zéro track record local. Et une **correction factuelle à
la spec** (Clarifications Q3) : les crops des 4 résidus **existent encore sur disque** —
`specs/005-figma-source-cleanup/proofs/fix-post-cloture/crops/`, 4 fichiers, un par page.
L'acquittement a bien été donné sur diagnostic écrit, mais un ré-examen visuel reste
matériellement possible si l'owner le souhaite.

## R11 — Les gates du dépôt sous un changement 100 % canvas

`parity/diff.ts` lit des **snapshots committés** — `parity/snapshots/figma-components.json`
et `figma-tokens.json` (l. 88, 101) — **jamais le fichier live**. Un renommage canvas ne
rougit donc aucun gate tant que les snapshots ne sont pas rafraîchis, et FR-025 interdit de
les rafraîchir.

Deux réserves, mesurées :

- **Horloge de péremption** : `MAX_SNAPSHOT_AGE_DAYS = Number(process.env.MAX_SNAPSHOT_AGE_DAYS ?? 14)`
  (l. 112). Les snapshots datent du **2026-07-25**. Une itération qui dépasse **~13 jours**
  fait rougir `parity` sur la **péremption**, sans rapport avec le travail. Échappatoire :
  la variable d'environnement — pas une édition dépôt. À nommer d'avance, pas à découvrir.
- **Axe icônes sensible au nom** : l. 803, `registry says the master is named "X", canvas
  snapshot says "Y"`. Inerte tant que le snapshot n'est pas rafraîchi, mais c'est la preuve
  que renommer les 15 icônes (R5) **ouvrira** une divergence registre ↔ canvas, à porter à la
  dette léguée au même titre que les 5 contrats adoptés.

**Correction d'une hypothèse de la spec — le jeton REST.** La variable shell est absente,
mais **`.env.local` à la racine porte une clé `FIGMA_TOKEN`**, et `figmaToken()`
(`extract/fidelity-matrix/scripts/env.ts` l. 26-34) la lit en repli (validité de la valeur
non testée — aucun appel réseau émis). Sans effet sur la conduite : l'itération passe par le
pont, qui n'a jamais besoin de REST — mais l'assumption « jeton absent de l'environnement »
est inexacte telle quelle, et `extract:figma:visual` est vraisemblablement exécutable.

**Le contrôle FR-007, refait — trois références par NOM existent bel et bien** :

- `parity/diff.ts` l. 769 construit l'axe icônes en cherchant le set **par le nom `'Bouton'`**
  (et l. 773 par le préfixe de propriété `'Glyphe'`). Dormant tant que le snapshot n'est pas
  rafraîchi ; au premier rafraîchissement post-renommage, la branche devient introuvable et
  la couverture de l'axe s'éteint **en silence** — exactement la classe de bug que le
  principe V classe la plus grave. À léguer nommément.
- `evals/harness.ts` l. 181 (`FIGMA_SET = 'Bouton'`) — tourne sur une copie scratch de
  fixtures committées, auto-cohérente quel que soit le canvas ; latent seulement.
- **`bridge/scan.js` l. 69 : `KNOWN_MASTERS = ['Bouton', …]` + regex `/^Bouton$/`** — c'est
  l'instrument des relevés de structure de cette itération même. Contrainte d'ordre qui en
  découle : tout relevé `scan.js` se prend **avant** le renommage de `Bouton`, et après P2
  les relevés se lisent par nodeId, plus par classification nominale.

**Attendu en clôture** : statu quo strict, 8/8 gates verts, aucun rafraîchissement de
snapshot. Tout rouge est, par construction, une régression.

## R12 — Cadence : 43 cibles par cycle changent l'arithmétique

Un cycle = 43 captures avant + 43 après = **86 `figma_execute` + 86 POST**, contre 18 en 005.
Le levier de cadence de 005 (grouper tout le zéro-pixel en un seul cycle) devient donc
**structurant, pas optionnel**.

**Décision** : un cycle par **lot homogène**, pas par geste. Les gestes de cette itération
sont massivement 0-pixel par construction (renommer, décrire, lier une variable qui porte la
valeur déjà rendue) — ils se groupent. Cycles à diff annoncé **connus d'avance** : la mise à
jour de `DS · Tokens` (FR-031) et, s'il est tranché en ce sens, le cas des 3 textes Field
(FR-019). Les 4 résidus acquittés (17/20/99/469 px) sont relevés au cycle 0 et suivis à chaque
verdict (FR-024a) — la 007 lie `fontWeight`/`lineHeight`/`fontSize`, les leviers mêmes qui les
ont produits.

---

## Les quatre arbitrages — routés dans le flux, aucun ne bloque

Aucun des quatre ne bloque la planification ni la génération des tâches : chacun se tranche
dans un artefact que la spec mandate déjà. Trois convergent vers la **revue owner unique de
la table de nommage** (FR-030 — un seul bloc, déjà obligatoire avant tout geste) ; le
quatrième vers le **relevé d'ouverture**.

| # | Point | Où il se tranche | Recommandation |
|---|---|---|---|
| **O1** | PascalCase strict pour les 36 (dont 15 icônes du registre, 7 molécules kebab) — les accents seuls ne suffisent pas (R5) | La table de nommage : les 36 lignes y figurent, chacune CLEAN à l'oracle ; une ligne rayée par l'owner = note résiduelle comptée à part, jamais un zéro menti | Accepter — seule voie vers SC-001/SC-003 = 0 ; la divergence registre ↔ canvas qui s'ouvre est léguée nommément |
| **O2** | SC-002 : les 41 styles « non dérivés » sont inatteignables sur canvas (R9) | `decisions.md` à l'ouverture + rapport de clôture — la spec prévoit déjà « toute exception restante est nommée et comptée à part » | Re-cadrer : le zéro porte sur les 193 valeurs ; les 41 = limite nommée, léguée avec le trou n° 1 ; le reçu typo est SC-013 |
| **O3** | 10 valeurs de variant non-ASCII, hors FR actuelles (R6) | La même table de nommage, 10 lignes de plus | Les inclure — classe à bump majeur (précédent « Outilne noir ») |
| **O4** | Chantier 1.3 déjà livré par le cycle 14 ; reste 1 GROUP résiduel `237:970` (R10) | Le relevé d'ouverture — FR-016/FR-018 passent en vérification-seulement si le fait accompli se confirme | Dé-grouper le résiduel si le pré-relevé le donne 0 pixel (spike `figma.ungroup`), sinon le nommer |
