# Audit — Atomes de formulaire net-new : Input, Textarea, Select, Checkbox (T031)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — lecture de structure par `figma_execute`
(`findAll`/`findOne` par id, propriétés de layout/fill/stroke/texte), scan par position
sur les 9 maquettes (`name === 'input'`), capture visuelle (`figma_take_screenshot`).
Lecture seule, aucun geste mutant.
**Périmètre** : les 4 atomes de formulaire (Input, Textarea, Select, Checkbox). Field
(label + saisie + erreur) est une molécule distincte, hors périmètre de cet audit
(T039).

## Usage — localisation par position (les 9 maquettes)

**Un seul site d'usage** : page **`Contactez-nous`**, frame `form` (`274:3682`), 1
occurrence de chaque champ. Scan `findAll(n => n.name === 'input')` sur les 9 frames
maquettes → **7 nœuds nommés `input`, tous sur `Contactez-nous`, zéro ailleurs** :

| # | nodeId | Contenu | Bounds (abs) | Hauteur | Contient `chevron-down` |
|---|---|---|---|---|---|
| 1 | `274:3681` | Prénom | x16637,y833 | 48 | non |
| 2 | `274:3704` | Nom | x16992,y833 | 48 | non |
| 3 | `274:3710` | Email | x16637,y930 | 48 | non |
| 4 | `274:3714` | Téléphone | x16992,y930 | 48 | non |
| 5 | `274:3719` | Adresse | x16637,y1027 | 48 | non |
| 6 | `274:3728` | **Sujet** | x16637,y1124 | 48 | **oui → Select** |
| 7 | `274:3780` | **Message** | x16637,y1221 | **128** | non → **Textarea** |

Compte reconcilié avec `COMPONENT-INVENTORY.md`/scan T0 : **6 `input` 48px** (dont 1
Select) + **1 champ 161px (Message, field complet = label 25 + gap 8 + input 128)**.
Exact — aucune divergence à corriger.

**Checkbox** : **zéro occurrence**. Le consentement RGPD (`274:3782`, texte seul, 610×24,
14px) est un simple bloc `TEXT` — pas d'élément visuel de case à cocher nulle part sur
les 9 maquettes. Confirmé net-new intégral (aucune copie à externaliser, aucune
adoption pour cet atome).

## Structure

### Le conteneur commun (Input / Select / Message-input)

Frame `HORIZONTAL`, mesurée identique sur les 3 échantillons (`274:3681`, `274:3728`,
`274:3780`) :

| Propriété | Valeur | Binding |
|---|---|---|
| `padding` | 12 / 12 / 12 / 12 | — (valeur littérale, comme tout le fichier — `space/*` ne couvre pas 12) |
| `itemSpacing` | 8 | — |
| `cornerRadius` | **0** (confirmé visuellement, capture ci-dessous — angles droits sur les 7 occurrences, pas un accident de rendu) | — |
| `fill` | blanc | ✅ `color/blanc` (`VariableID:4:29`) |
| `stroke` | gris-bleu 1px, `strokeAlign: INSIDE` | ✅ `color/bleu-gris` (`VariableID:5:62`) |
| `layoutSizingHorizontal` | `FILL` (largeur du champ/row parent) | — |
| `layoutSizingVertical` | `HUG` | — |

**Différence Input vs Select** : `primaryAxisAlignItems` — `MIN` (Input, le texte colle
à gauche) vs **`SPACE_BETWEEN`** (Select, le texte va à gauche et le chevron est
poussé à droite). C'est la seule différence structurelle mesurée entre les deux — pas
de variant Figma existant, juste un layout différent codé en dur deux fois (l'odeur
que l'externalisation résout : une seule propriété d'affordance au lieu de deux blocs
dupliqués).

**Select — le chevron** : instance `chevron-down` (`274:3730` sur cette occurrence),
main component **`226:373`**, `remote: false` — **local, gouverné, zéro dépendance
tierce** (confirme l'invariant FR-019/SC-008). Le master **Select doit en poser une
instance, jamais une copie** (T034, déjà la règle du plan).

**Textarea (Message)** : même style de boîte, mais `counterAxisAlignItems: MIN`
(texte aligné en haut, pas centré verticalement — cohérent avec un multi-ligne) et
une hauteur de 128px au lieu de 48px. **Détail de construction à ne pas reproduire** :
la hauteur n'est pas portée par le container (`layoutSizingVertical` reste `HUG` comme
les autres) mais par le nœud `TEXT` lui-même, dont la boîte est fixée artificiellement
plus haute (~104px) que son contenu réel (1 ligne, 24px) — un centrage manuel plutôt
qu'un vrai champ multi-ligne. Le master propre **doit** porter la hauteur sur le
container (`layoutSizingVertical: FIXED`, ou un `minHeight`), pas sur une astuce de
texte surdimensionné — zéro impact pixel puisque Textarea est net-new (rien n'est
adopté depuis cette copie), seulement une meilleure construction.

### Le texte de contenu (placeholder / valeur)

Un seul `TEXT` enfant par input, `Montserrat Regular 14px`. Exemple (`274:3680`,
Prénom) :

| Propriété | Valeur | Binding |
|---|---|---|
| `characters` | "Prénom" (valeur d'exemple — deviendra une **propriété TEXTE officielle** de l'instance) | — |
| `fontSize` / `fontName` | 14 / Montserrat Regular | — (cohérent avec `font/size/14` + `font/weight/regular`, non bindé nœud-par-nœud dans ce fichier — pattern déjà généralisé, pas une odeur propre à cet atome) |
| `fill` | **noir pur `#000000`** | ❌ **`boundVariables: []` — valeur brute, aucun token** |

### Le label et l'annotation « (optionnel) » (contexte Field, pas Input)

Pour mémoire (utile à l'audit T039 de Field) : le label (`Montserrat SemiBold 20px`)
et l'annotation `(optionnel)` (`Montserrat Regular 14px`) sont tous deux bindés
proprement à `color/bleu-gris` — **propres**, rien à corriger côté Field quand son
tour viendra.

## Anomalie — texte de saisie en valeur brute (FR-010)

**Constat** : les 7 occurrences du texte de contenu (placeholder/valeur) portent un
fill **`#000000` non bindé** (`boundVariables: []`) — exactement la classe de défaut
que la règle de propreté source interdit dans un master (FR-007 : « couleurs aux
variables, zéro valeur brute »). Ce n'est pas un hack par calque caché (pas de la
famille du bug Bouton), mais c'est la même famille de dette : une valeur qui devrait
être un rôle nommé ne l'est pas.

**Mesure d'usage** (scan `boundVariables.color` sur `fills`, pages `Pages` + `Assets`,
avant proposition — même méthode que l'audit `orange-12/42`) :

| Variable candidate | Couleur | Usages mesurés | Profil observé |
|---|---|---|---|
| `color/noir` (`VariableID:24:52`) | `#37373B` | **40** | texte de **paragraphe**, 14px Regular, phrases longues — **même profil typographique que le texte de saisie** |
| `color/noir-bleute` (`VariableID:5:40`) | `#262A2C` | **426** | **titres** (18-40px), pas des paragraphes 14px |

**Proposition** : binder le texte de contenu de Input/Select/Textarea à **`color/noir`**
(zéro nouveau token miné, cohérent avec l'usage déjà établi pour ce gabarit
typographique 14px Regular dans le reste du fichier).

**Conséquence chiffrée, nommée à l'avance** : `#000000` → `#37373B` est un **changement
de pixel réel**, pas un rename gratuit (contrairement à `space`/`radius` ou
`orange-12/42`, qui étaient 0-pixel par construction). Sans conséquence **maintenant**
(Input est net-new, aucune adoption ne remplace une copie aujourd'hui) — mais quand
**Field (T039/T040)** puis **Formulaire (T091/T092)** adopteront ces 7 occurrences,
le verdict pixel de cette adoption portera un écart chiffré et localisé sur ce
changement de couleur, à présenter comme `ecart-pixel-accepte` à ce moment-là (pas une
surprise si nommé maintenant).

**Décision requise avant de construire les masters** : owner à trancher (option ci-
dessous) — aucune correction silencieuse.

## Récapitulatif des 4 masters à construire

| Master | Origine | Dépend de | Propriété(s) officielle(s) | Notes |
|---|---|---|---|---|
| **Input** | extraction (nettoyée) | tokens (`color/blanc`, `color/bleu-gris`, `color/noir`\*) | TEXTE (valeur/placeholder) | boîte `HORIZONTAL`, padding 12, `itemSpacing` 8, `cornerRadius` 0, `MIN` |
| **Textarea** | extraction (nettoyée) | idem | TEXTE | même boîte, hauteur fixée proprement (128), texte aligné haut |
| **Select** | extraction (nettoyée) | idem + chevron-down `226:373` (instance) | TEXTE + `chevron-down` en instance fixe | même boîte, `SPACE_BETWEEN` |
| **Checkbox** | **net-new intégral** | tokens | BOOLÉEN (coché/décoché) | aucune référence visuelle dans le fichier — dessiné de zéro, style cohérent avec le reste (bordure `bleu-gris`, coche `bleu` ou `orange` à trancher à la construction) |

\* sous réserve de la décision owner ci-dessus.

## Aucune anomalie bloquante hors ce point unique

Rien d'autre trouvé hors périmètre. Le `cornerRadius: 0` est une caractéristique de
style mesurée et cohérente (7/7), pas une odeur — non proposé à correction.
