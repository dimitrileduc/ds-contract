# Data Model — 018 · Répliquer à la main une chaîne gouvernée en blocs Odoo 19

Cette spec ne livre pas de logiciel : elle produit **des faits mesurés et une décision**. Son
« modèle de données » est donc l'ensemble des **artefacts consignés** — ce que chacun contient,
ce qui le rend valide, et ce qui le rend faux. Chaque entité nomme le FR/SC qui l'exige.

Les entités se lisent en trois familles :

- **A. Ce qui est monté** — le module et ses pièces (§1–§4)
- **B. Ce qui est décidé et consigné** — zones, verdicts, non-portés (§5–§7)
- **C. Ce qui est mesuré** — la comparaison d'image et le rapport de décision (§8–§10)

---

## A. Ce qui est monté

### 1. Modèle de composant *(FR-001, FR-002)*

Le morceau de balisage réutilisable produit pour **un** contrat.

| Champ | Valeur | Règle |
|---|---|---|
| `contractId` | `ds.presentation` \| `ds.section-header` \| `ds.button` | exactement ces trois, ni plus ni moins (FR-001) |
| `templateId` | identifiant du modèle dans le module | unique dans le module |
| `appelle` | liste des `templateId` appelés | l'imbrication passe **uniquement** par l'appel entre modèles, **jamais** par duplication de balisage (FR-002) |
| `posable` | booléen | `true` pour `ds.presentation` **seulement** (FR-003) |
| `classeRacine` | la classe CSS que le composant porte | c'est elle qui porte le style **et** qui accroche les réglages ; elle nous appartient, elle ne vient pas du cadre CSS d'Odoo (FR-006) |

**Invariants**

1. Exactement **3** modèles, **3** niveaux d'imbrication, **1** seul `posable: true` (SC-002).
2. Aucun modèle ne recopie le balisage d'un autre — la chaîne se vérifie en lisant les appels,
   pas en comparant deux blocs de XML.
3. `ds.section-header` et `ds.button` sont **présents dans le module et absents du panneau**
   (acceptation US1-4).

**Transitions d'état** (le seul cycle de vie de cette spec)

```
écrit à la main → module installé (0 erreur) → bloc posé sur une page
  → page enregistrée → page rouverte en édition   ← l'étape qui tue FR-012 si elle tue
  → page publique rechargée                        ← l'étape qui prouve US1
```

### 2. Bloc posable *(FR-003)*

L'entrée du panneau correspondant à la section.

| Champ | Valeur |
|---|---|
| `templateId` | celui de `ds.presentation` |
| `libellé` | le nom lu par le rédacteur dans le panneau |
| `vignette` | l'image du panneau |
| `groupe` | la catégorie du panneau où il apparaît |

**Invariant** : **cardinalité 1**. Un deuxième bloc posable serait un échec de FR-003, pas un
bonus.

### 3. Glyphe embarqué *(FR-004b, SC-002)*

| Champ | Source |
|---|---|
| `name` | `contracts/icons.registry.json` → `icons[].name` |
| `svg` | `assets/icons/<asset>.svg` |

**Invariants**

1. **19 glyphes**, exactement ceux du registre — pas le contenu du répertoire `assets/icons/`,
   qui en contient davantage (`check`, `close`, `google`, `google-wordmark` **ne sont pas
   gouvernés** et n'entrent pas).
2. La **présence** d'une icône et le **choix du glyphe** sont tous deux exprimables.
3. Le **choix du glyphe** est exercé au moins une fois comme réglage **sur l'instance** — c'est
   la seule liaison par échange d'instance de toute la chaîne et le seul franchissement de
   frontière d'un registre gouverné : elle exige une confirmation en fonctionnement, pas une
   lecture (FR-004b + FR-013).

### 4. Sortie Odoo de jetons *(FR-005b — la seule chose générée)*

La 4ᵉ sortie du pipeline. Son interface complète est dans
[`contracts/odoo-tokens-output.md`](./contracts/odoo-tokens-output.md) ; ici, sa place dans le
modèle.

| Champ | Valeur |
|---|---|
| `source` | `tokens/*.tokens.json` — les mêmes entrées que les 3 sorties existantes |
| `producteur` | `scripts/build-tokens.mjs`, la même fonction pure, sans dépendance |
| `destination` | dans le module, sous `static/src/css/` |
| `préfixe` | porté par **cette sortie seule** (FR-008) ; les sorties existantes restent sans préfixe |
| `couverture` | le vocabulaire **en entier**, pas seulement ce que les 3 composants consomment (Assumptions) |

**Invariants**

1. **Additive** : les 3 sorties existantes ne changent pas **d'un octet**.
2. **Byte-identique ×2** (Principe I), prouvé par une eval, pas par une relecture.
3. Porte un en-tête **GENERATED — DO NOT EDIT** nommant la commande qui la refait (Principe IV).
4. **100 %** de ses déclarations portent le préfixe — une seule sans préfixe est un refus.

---

## B. Ce qui est décidé et consigné

### 5. Tableau des zones *(FR-009, FR-010, FR-011)*

Un par composant, **écrit avant le montage de ce composant**. Schéma complet :
[`contracts/zone-table.schema.md`](./contracts/zone-table.schema.md).

| Champ | Valeur |
|---|---|
| `contractId` | le composant concerné |
| `reglage` | un réglage porté par le contrat (une prop, un texte, un choix de glyphe) |
| `etat` | `modifiable` \| `figé` |
| `raison` | **obligatoire dans les deux cas** |
| `mecanisme` | par quoi c'est tenu côté Odoo (rempli au montage) |

**Règle de décision, écrite une fois pour toutes** : *un réglage est offert au rédacteur s'il a
une raison métier de le changer sur son site.* Tout le reste est figé.

**Invariants**

1. **Couverture totale** : chaque réglage porté par le contrat apparaît, avec un état. Un
   réglage sans ligne est un défaut, pas un blanc.
2. `raison` non vide des deux côtés — « figé » sans raison est aussi faux que « modifiable »
   sans raison.
3. Le tableau est écrit **avant** le montage du composant, et `mecanisme` est complété **après**.
   L'ordre est le point : décider d'abord, câbler ensuite.

### 6. Verdict de levier *(FR-016, SC-007)*

Quatre leviers, quatre verdicts, aucun silence. Schéma :
[`contracts/governance-verdicts.schema.md`](./contracts/governance-verdicts.schema.md).

| Levier | Ce qu'il ferme | Statut attendu |
|---|---|---|
| L1 — verrouiller la structure | supprimer / déplacer / dupliquer un élément intérieur | exercé |
| L2 — empêcher un réglage d'apparaître | les réglages natifs non voulus | exercé |
| L3 — tronquer ce qui remonte du parent | l'héritage de réglages depuis le conteneur | exercé |
| L4 — rouvrir une image dans un cadre figé | remplacer une image sans déverrouiller | **non exercé** |

| Champ | Valeur |
|---|---|
| `levier` | `L1` … `L4` |
| `verdict` | `tenu` \| `lâché` \| `non exercé` |
| `remplacant` | **obligatoire si `lâché`** — par quoi il a fallu le remplacer (clé sans cédille : c'est celle du schéma) |
| `raison` | **obligatoire si `non exercé`** |
| `preuve` | le geste fait sur l'instance qui l'établit (obligatoire si `tenu` ou `lâché`) |

**Invariants**

1. **4 verdicts sur 4**. Un levier sans verdict est un défaut ; un verdict négatif n'en est pas
   un.
2. L4 est **connu d'avance** comme non exerçable : aucun des trois contrats ne porte d'image.
   Son verdict est `non exercé` avec sa raison — jamais un silence, jamais un 4/4 obtenu en
   élargissant le périmètre (SC-007).
3. Un verdict `tenu` obtenu par **lecture de code** est interdit : `preuve` désigne un geste
   fait sur l'instance (FR-013, SC-009).

### 7. Non-porté nommé *(FR-014)*

Un fait qu'un contrat porte et que le montage n'exprime pas.

| Champ | Valeur |
|---|---|
| `contractId` + `pointeur` | où le fait vit dans le contrat |
| `fait` | ce que c'est, en clair |
| `raison` | pourquoi il n'est pas porté |
| `visibilité` | où un lecteur de l'artefact le trouve **depuis l'artefact lui-même** |

**Invariant** : lisible **depuis l'artefact**, pas seulement depuis cette spec. Une omission
silencieuse est le défaut de sévérité maximale du dépôt (Principe V) ; c'est le même vocabulaire
que les « named no-ops, never silent drops » que `docs/15-engine-as-library.md` impose déjà à
tout émetteur.

**Candidats connus dès le plan** (à confirmer ou infirmer au montage, jamais à supposer) :

- les **états interactifs** — les 34 contrats Piqueray portent `states: []`, donc il n'y a rien
  à ne pas porter ; à vérifier plutôt qu'à affirmer ;
- **PAS** `letter-spacing: 3px` sur `ds.section-header/Accroche` : c'est le seul littéral de la
  chaîne sans token, mais `research.md` §D4 le tranche en **littéral nommé** — donc **exprimé**,
  inscrit au registre local du module, épinglé byte-à-byte contre le contrat. Un littéral nommé
  est porté, pas omis : il n'a rien à faire dans ce registre-ci. La frontière est le point ;
- tout réglage du contrat que le tableau des zones fige : figé ≠ non porté, mais la frontière
  entre les deux se déclare, elle ne se devine pas.

---

## C. Ce qui est mesuré

### 8. Instance jetable *(FR-013, SC-001, SC-009)*

| Champ | Valeur |
|---|---|
| `version` | Odoo 19 |
| `cycle de vie` | neuve → module installé → gestes prouvés → **détruite** |
| `traces` | ce qui reste après destruction : **rien**, hors les reçus consignés sous la spec |

**Invariant** : aucune porte permanente du dépôt n'en dépend. La preuve se lance à la demande et
se consigne — le patron des cycles de pont Figma de 003/005/007.

### 9. Ligne de comparaison *(FR-013 côté visuel, SC-006)*

Une par composant. **3 lignes.** Protocole complet :
[`contracts/visual-comparison.md`](./contracts/visual-comparison.md).

| Champ | Valeur |
|---|---|
| `composant` | un des trois |
| `avant` | PNG rendu par **notre surface HTML** |
| `après` | PNG rendu par **Odoo** |
| `score` | l'écart mesuré, jamais estimé |
| `cause` | **exactement une** cause dominante, prise au vocabulaire de causes **déjà gouverné** par le dépôt |
| `statut` | `mesurée` \| `impossible` (avec la raison) |

**Invariants**

1. **Une seule** cause dominante par ligne, prise au vocabulaire de 014 — pas un vocabulaire
   neuf inventé pour l'occasion.
2. Sous le **plancher de tolérance déclaré**, aucune cause n'est due ; au-dessus, **0 ligne**
   ne reste sans cause.
3. **0 verdict rendu à l'œil.**
4. Une comparaison impossible est **dite** (`statut: impossible`), jamais comptée réussie
   (acceptation US3-3).
5. L'instrument de parité visuelle gated n'est **ni étendu ni modifié**, et **aucune instance
   Odoo n'entre sur le chemin de la suite de contrôles standard**.

### 10. Rapport de décision *(FR-017, FR-018, FR-018b — le livrable réel)*

Le classement mécanique/cas particulier a son propre contrat d'interface :
[`contracts/volumes.schema.md`](./contracts/volumes.schema.md) — la règle y est écrite **avant le
montage** (FR-017b), et chaque poste se déclare **en écrivant** la ligne, jamais reconstitué à la
fin.

| Section | Contenu | Exigence |
|---|---|---|
| Volumes | par composant : volume écrit, **part mécanique** (un émetteur déterministe l'aurait produite sans jugement), **part cas particulier** (qui a demandé un jugement) — **0** ligne non classée | FR-017, FR-017b, SC-008 : les 3 composants |
| Leviers | les 4 verdicts, repris tels quels | SC-007 |
| Écart visuel | les 3 lignes, reprises telles quelles | SC-006 |
| Recommandation | **1** recommandation argumentée : construire l'émetteur, écrire les blocs à la main et les gouverner autrement, ou arrêter | FR-018, SC-008 |
| Ordre de grandeur | **si et seulement si** la recommandation est « construire » : un chiffrage adossé aux volumes mesurés **et** au précédent interne | FR-018, acceptation US4-4 |
| Angles morts | **au moins 2** choses que ses chiffres ne permettent **pas** de conclure | FR-018b, SC-008 |

**Invariants**

1. Le rapport **fournit de quoi décider, il ne rend pas un verdict** — aucun seuil préétabli,
   la décision appartient à l'owner (FR-018).
2. Les angles morts sont **obligatoires** : sans seuil, c'est la seule chose qui empêche une
   décision à l'humeur de se déguiser en décision informée (FR-018b). Deux sont connus
   d'avance : ce que vaut le passage de **3 composants à 34**, et ce que la chaîne retenue n'a
   **pas** exercé (la répétition d'un élément, et le levier L4).
3. Le précédent interne à citer est mesuré, pas approximé : l'émetteur tiers enregistrable du
   dépôt fait **1353 lignes** pour son émetteur (+196 et +255 pour ses deux contrôles) — avec la
   réserve que la spec pose déjà : il produit **un seul** type de fichier, là où Odoo en demande
   trois.
4. Si la voie retenue est « construire », l'émetteur reste une **transformation déterministe** —
   aucun modèle de langage dans le chemin de génération. Rouvrir cette règle serait une décision
   explicite, jamais un repli (FR-019, Principe I).

---

## Ce que ce modèle ne contient pas, et pourquoi

- **Aucun contrat, aucun token, aucun schéma.** 018 ne renégocie rien : elle consomme trois
  contrats tels qu'ils sont et un vocabulaire de jetons tel qu'il est.
- **Aucun axe de différentiel.** `docs/06-parity-loop.md` en a trois ; une quatrième surface n'en
  a aucun. L'artefact est donc structurellement hors surveillance — c'est **la raison** de
  FR-015, et elle est écrite ici pour qu'on ne la redécouvre pas plus tard comme une surprise.
- **Aucun émetteur.** C'est l'objet de la décision, jamais du montage.
