# Audit — Molécule Field (T039)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — lecture de structure par `figma_execute`
(`findAll` par nom + structure sur `form` `274:3682`, puis inspection récursive de
chacun des 7 nœuds `field`), recherche exhaustive `error|erreur|invalid|warning` sur
les deux pages du fichier (`Assets` + `Pages`), lecture des collections de variables
live (`figma.variables.getLocalVariableCollectionsAsync()`). Lecture seule, aucun
geste mutant.
**Périmètre** : la molécule **Field** (label + saisie). Les atomes qu'elle assemble
(Input, Textarea, Select) sont déjà audités (`audits/atomes-formulaire.md`, T031) et
construits (T032-T034) — non ré-audités ici.

## Usage — localisation par position (les 9 maquettes)

**Un seul site d'usage** : page **`Contactez-nous`**, frame `form` (`274:3682`).
`findAll(n => /field/i.test(n.name))` sur les 9 frames maquettes → **7 nœuds `field`,
tous sur `Contactez-nous`, zéro ailleurs** — compte reconcilié avec l'inventaire
initial (`field` brut ×7, `COMPONENT-INVENTORY.md`) et avec le scan T0 (4 isolés par
groupement automatique + 2 hors-signature, cf. `inventory/dag.md` — les 7 sont
maintenant tous relevés nommément ci-dessous).

| # | nodeId | Contenu | Bounds (abs) | w×h | Variante label | Type input |
|---|---|---|---|---|---|---|
| 1 | `274:3700` | Prénom | x16637,y800 | 340×81 | texte seul | Input |
| 2 | `274:3702` | Nom | x16993,y800 | 340×81 | texte seul | Input |
| 3 | `274:3708` | Email | x16637,y897 | 340×81 | texte seul | Input |
| 4 | `274:3712` | **Téléphone** | x16993,y897 | 340×81 | **texte + `(optionnel)`** | Input |
| 5 | `274:3717` | Adresse | x16637,y994 | 695×81 | texte seul | Input (pleine largeur) |
| 6 | `274:3726` | **Sujet** | x16637,y1091 | 695×81 | texte seul | **Select** (chevron-down `274:3730`, main `226:373`, local) |
| 7 | `274:3778` | **Message** | x16637,y1188 | 695×161 | texte seul | **Textarea** (128px) |

Les 7 vivent dans 5 `row` (`HORIZONTAL`, gap 16, `FILL`×`HUG`) : 2 rows à 2 colonnes
(Prénom+Nom, Email+Téléphone) et 3 rows pleine largeur (Adresse, Sujet, Message) — le
`row` est un souci de mise en page du **Formulaire** (section, T091), pas de Field
lui-même ; noté ici pour mémoire, hors périmètre de ce master.

## Structure

### Le conteneur `field` (constant sur les 7 occurrences)

| Propriété | Valeur |
|---|---|
| `layoutMode` | `VERTICAL` |
| `itemSpacing` | 8 |
| `padding` | 0 (aucun) |
| `layoutSizingHorizontal` / `Vertical` | `FILL` / `HUG` |
| Enfants | `[label-slot, input]` — toujours 2, jamais plus |

L'`input` (2e enfant) est l'atome déjà construit (Input / Select / Textarea, T032-T034)
— aucune divergence de structure trouvée entre les 7 occurrences et les 3 échantillons
déjà audités en T031.

### Le label-slot — **2 variantes réelles, pas 1** (finding de cet audit)

| Variante | Occurrences | Structure |
|---|---|---|
| **texte seul** | 6/7 (Prénom, Nom, Email, Adresse, Sujet, Message) | `TEXT` direct, `Montserrat SemiBold 20`, lié à `color/bleu-gris` |
| **texte + annotation** | 1/7 (**Téléphone**, `373:2806`) | `FRAME` `HORIZONTAL` (gap 4, HUG×HUG) enveloppant `[TEXT label "Téléphone" SemiBold 20, TEXT "(optionnel)" Regular 14]`, les deux liés à `color/bleu-gris` |

Ce n'est pas une occurrence isolée à ignorer : c'est la **seule preuve dans le fichier**
qu'un champ « optionnel » existe comme concept de design. Le master doit porter ceci
comme une **propriété officielle** (ex. booléen `optionnel`, qui bascule la présence de
l'annotation) — jamais recopier seulement la variante majoritaire et perdre le cas
Téléphone, jamais un calque caché pour la basculer (la leçon Bouton).

Aucune autre divergence structurelle trouvée sur les 7 (padding, gap, alignement tous
identiques).

## Anomalie / lacune de source — **l'état « erreur » n'existe nulle part** (FR-010)

**Constat** : `COMPONENT-INVENTORY.md` décrit Field comme « label + saisie + erreur »
(ligne 46) — mais cette description est **générique** (ce qu'un champ de formulaire
« devrait » avoir), pas une observation. Recherche exhaustive sur les deux pages du
fichier (`figma.root.children[*].findAll(/error|erreur|invalid|warning/i)`) : **zéro
résultat**. Aucune des 7 occurrences de `field` ne montre un état d'erreur (bordure
rouge, texte d'aide, icône d'alerte) — la maquette est statique, un formulaire jamais
soumis n'a pas d'état d'erreur à capturer.

**Conséquence sur les tokens** : la palette complète (12 couleurs, vérifiée live via
`figma.variables.getLocalVariableCollectionsAsync()`) ne contient **aucune** couleur de
type rouge/danger/erreur — `bleu`, `orange`, `blanc`, `noir-bleute`, `beige`,
`beige-clair`, `bleu-gris`, `bleu-clair`, `beige-clair-80`, `noir`, `orange-12`,
`orange-42`. Construire un état « erreur » aujourd'hui obligerait soit à **inventer**
une couleur (miner un token rouge sans aucune preuve d'usage — l'inverse de la
discipline déjà appliquée à `orange-12/42` et à Checkbox/Étoile), soit à détourner une
couleur existante (`orange` porte déjà le sens CTA/marque — le réemployer pour
« erreur » créerait une ambiguïté sémantique, pas une réutilisation propre).

C'est la même famille de situation que Checkbox (T035) et l'icône Étoile (T038) :
**aucun vecteur/observation source**, décision de construction net-new qui appartient
à l'owner, pas à moi — proposer, jamais corriger/inventer en silence (FR-010). À la
différence de Checkbox/Étoile (dont la *forme* ne faisait aucun doute — une case à
cocher, une étoile à 5 branches), l'état d'erreur n'a **aucune forme de référence du
tout** dans ce fichier : ni couleur, ni disposition, ni texte d'aide type.

**Ce qui n'est PAS bloqué par cette lacune** : les 7 occurrences réelles à adopter
(T040) ne montrent jamais l'état erreur — l'adoption peut réussir 9/9 `identical` (aux
côtés de l'écart couleur `#000000→color/noir` déjà pré-accepté, cf. `decisions.md`
2026-07-24 « texte de saisie formulaire ») sans que Field porte cette propriété.

**Options pour trancher** (proposées, pas choisies) :
1. **Différer** : construire Field maintenant avec seulement `[label-slot (booléen
   optionnel), input]` ; noter « erreur » comme portée non couverte par cette spec
   (`report-bloc` partiel, périmètre réduit assumé) — zéro token inventé.
2. **Construire maintenant** : miner un token `color/erreur` (ou nom équivalent) sur
   proposition + validation owner explicite, comme `orange-12/42` — ajoute une
   propriété état officielle (`Normal`/`Erreur`) au master.
3. **Placeholder nommé** : ajouter la propriété d'état au master dès maintenant mais
   sans variante visuelle « erreur » réelle (juste `Normal` pour l'instant), pour ne
   pas re-toucher la structure du composant plus tard — sans couleur inventée non plus.

## Récapitulatif du master à construire

| Élément | Source | Notes |
|---|---|---|
| Conteneur | 7/7 identique | `VERTICAL`, gap 8, `FILL`×`HUG` |
| Label-slot | 2 variantes réelles | propriété officielle à trancher (booléen `optionnel` proposé) |
| Input | instance d'Input/Select/Textarea (T032-T034) | jamais une copie |
| Erreur | **aucune preuve source** | décision owner requise avant construction — voir Anomalie ci-dessus |

**Dépendances** : Input (`2053:1245`), Textarea (`2053:1247`), Select (`2053:1249`) —
les trois `valide-owner` (Phase A, `decisions.md`). DAG satisfait pour la partie
saisie ; la partie « erreur » n'a pas de dépendance technique bloquante, seulement une
décision de contenu en attente.

## Décision owner — état erreur (2026-07-24)

Owner a tranché **« construire maintenant »**. Avant de construire, consultation de
l'archive des contrats legacy pré-reconversion (tag git `demo-51`, accessible en
historique même non matérialisée sur ce worktree — `git show demo-51:contracts/…`),
sur demande owner (« check comme inspi les contrats legacy, pas vérité absolue »).

**Deux trouvailles** :
1. `contracts/field.contract.json` (legacy) confirme l'architecture retenue ici : un
   wrapper générique autour d'un contrôle quelconque via un slot — pas une duplication
   de l'input. Renforce le choix Saisie en `INSTANCE_SWAP` plutôt qu'une instance figée
   d'Input.
2. **Ni `field.contract.json` ni `text-field.contract.json` (legacy) ne modélisent
   d'état erreur** (`"states": []` sur les deux) — corrobore l'audit ci-dessus (zéro
   preuve source côté Piqueray) avec un second point de données indépendant. Note pour
   mémoire, n'a pas changé la décision owner (construire quand même).

**Nommage** : la palette de propriétés legacy est en anglais (`Label`, `Required`,
`Description` ; `checkbox.contract.json` : `Value` Unchecked/Checked/Indeterminate) —
alors que le Checkbox déjà livré en Phase A utilise `Coché` (Non/Oui), en français.
Décision owner (2026-07-24, applicable à Field et **toutes les molécules à venir**) :
**français partout**, cohérent avec Checkbox déjà validé — les contrats legacy servent
d'inspiration de **structure/anatomie uniquement**, jamais de nommage. Voir
`decisions.md` (entrée `amendement-orga`).

## Construction — le master livré

`DS · Molécules` (`2052:1145`) → `COMPONENT_SET` **Field** (`2056:1278`), 2 variants,
4 propriétés officielles, zéro dépendance tierce, zéro calque caché :

| Propriété | Type Figma | Valeurs / défaut | Porte |
|---|---|---|---|
| `État` | VARIANT | `Normal` (défaut) \| `Erreur` | figure de fond (bordure) + visibilité du message |
| `Label` | TEXT | défaut `Libellé` | le texte du label (SemiBold 20, `color/bleu-gris`) |
| `Optionnel` | BOOLEAN | défaut `false` | visibilité du texte `(optionnel)` (Regular 14, `color/bleu-gris`) — le seul cas réel observé (Téléphone) |
| `Saisie` | INSTANCE_SWAP | défaut Input ; accepte Input / Select / Textarea | le contrôle réellement encapsulé — jamais une copie |

**Variant `Erreur`** : bordure de la Saisie recolorée en **`color/rouge`** (override
d'instance local, non-hack — même mécanisme qu'un icône recoloré dans un variant de
bouton) + texte `message-erreur` (14px Regular, `color/rouge`) ajouté sous la saisie.

**Nouveau token miné** : `color/rouge` (Primitives, mode Value) = `#D32F2F`
(`VariableID:2056:1264`). Aucune couleur rouge/danger n'existait dans les 12 couleurs
existantes (vérifié live avant proposition — même discipline que `orange-12/42`).
Choix : rouge standard, bon contraste sur blanc (~4.8:1, AA), nettement distinct de
`color/orange` (#F98A0B, le CTA) pour éviter toute confusion de sens. **Créé
côté Figma uniquement** — `tokens/*.tokens.json` non touché (le figma→code est hors
périmètre de la spec 003, comme `orange-12/42` avant lui) ; réconciliation éventuelle
un chantier futur, hors 003.

**Vérifié bout en bout** avant nettoyage : instance de test avec les 4 propriétés
poussées à leur valeur non-défaut simultanément (`État=Erreur`, `Label=Sujet`,
`Optionnel=true`, `Saisie=Select`) → rendu correct (label + annotation + bordure/texte
rouges + chevron Select visibles ensemble), capture de session. Instance de test
supprimée après vérification (aucune trace laissée sur `DS · Molécules`).

**Checkpoint** : `003/field/master` (versionId `2379728271305056286`), pris avant tout
geste mutant de cette tâche.
