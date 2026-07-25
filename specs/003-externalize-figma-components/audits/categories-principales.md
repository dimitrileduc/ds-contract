# Audit — Section Catégories principales (T079/T080)

**Date** : 2026-07-25
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — `loadAllPagesAsync`, puis inspection récursive **par
position** des 7 occurrences (top-level + chaque carte + Bouton), lecture des
`componentProperties`, résolution de chaque instance par `getMainComponentAsync`. Lecture seule
pour l'audit ; construction/adoption ensuite.
**Statut** : **MASTER + ADOPTION FAITS + PROUVÉS** (build validé par l'orchestrateur après remontée
de la prémisse invalidée). Non committé.
**Dépendance DAG** : Category-card (T046, = master **Carte** disposition `Catégorie`). **Partiellement
satisfaite** — voir §prémisse : sur les 15 cartes des 7 sections, seules **10** sont des instances
Carte gouvernées (exactement les 10 de T046) ; **5 sont des copies brutes jamais adoptées** (anatomie
différente).

## Usage — localisation par position (les 9 maquettes)

**7 occurrences** (2 noms). Sur 6 pages la section vit dans un cadre parent `Hero et catégories`
(wrapper composite, **HORS PÉRIMÈTRE** — T097/T098, qui devra INSTANCIER ce master) ; Dépannage/SAV
la porte directement dans la maquette. Parent toujours auto-layout VERTICAL, `idxInParent = 1` →
adoption par `insertChild(1)`, zéro coordonnée manuelle.

| Maquette | nodeId (section) | maquette | parent (idx 1) | nom layer | bbox |
|---|---|---|---|---|---|
| Portes de garage | `226:121` | `226:112` | `Hero et catégories` `226:114` | Catégories principales | 2317,688,**1552**,418 |
| Accueil | `210:335` | `210:326` | `Hero et catégories` `210:328` | Catégories principales | 389,768,**1552**,418 |
| Dépannage/SAV | `249:1522` | `249:1510` | **maquette** `249:1510` | Catégories principales alt | 11869,1402,**1728**,673 |
| Portes d'entrée | `237:981` | `237:969` | `Hero et catégories` `237:971` | Catégories principales alt | 9941,688,**1728**,622 |
| Motorisation | `237:717` | `237:705` | `Hero et catégories` `237:707` | Catégories principales alt | 8013,688,**1728**,524 |
| PdG industrielles | `387:732` | `387:720` | `Hero et catégories` `387:722` | Catégories principales alt | 6085,688,**1728**,649 |
| PdG résidentielles | `230:387` | `230:376` | `Hero et catégories` `230:378` | Catégories principales alt | 4157,688,**1728**,622 |

Le brief disait « inset 88 » — mesuré **89** (pad L/R des frames alt). Les non-alt n'ont pas de
padding propre : leur inset vient du wrapper `Hero et catégories` (hors périmètre).

## LA PRÉMISSE DU BRIEF EST INVALIDÉE — mesuré, pas supposé (leçon Réassurances, en pire)

Le brief supposait « 2 noms, **même famille de contenu**, une variante `alt` ». La mesure montre
**trois anatomies de carte distinctes**, dont une **ingouvernée** :

| Groupe | Pages | Carte = | Gouverné ? | Anatomie |
|---|---|---|---|---|
| **non-alt** | PdG, Accueil | tuile-nav RAW (`item` FRAME) | **NON** (aucun master) | image plein-cadre sur le cadre + `Vector` 98×128 overlay + Titre fs40 (= nom page cible) + sous-titre fs18 + `arrow-right` nu 35×35. **Pas de child `img`, pas de Bouton.** |
| **alt** | entrée, industrielles, résidentielles (2 cartes), Motorisation (**3 cartes**) | instance **Carte** `Disposition=Catégorie` | oui | `img` + text(Titre 32 / Texte 18 amorce grasse) + Bouton `Link` |
| **alt mixte (SAV)** | Dépannage/SAV | 1 Carte gouvernée + 1 carte RAW | mixte | carte RAW = Bouton **solide** `Outilne noir` / « Prendre rendez-vous » (304×54) + un wrapper de plus |

**Comptage croisé T046** : cartes alt gouvernées = SAV 1 + entrée 2 + Motorisation 3 + industrielles 2
+ résidentielles 2 = **10** = exactement les 10 Catégorie de T046. Les **5 RAW** (2 tuiles PdG + 2
tuiles Accueil + 1 carte SAV) n'ont **jamais** été adoptées.

**Axes de variance réels** : (1) alt vs non-alt = **deux composants de carte différents**, pas une
bascule ; (2) 2 vs **3** cartes (Motorisation) ; (3) **SAV mixte** ; (4) **hauteur alt FIXE par
page** : 649 (industrielles) vs 622 (entrée/résidentielles) — même cadre texte (110), la différence
est **entièrement dans la hauteur d'image** (445 vs 418), choix de design par page.

**Décision (orchestrateur, alignée owner) après remontée AVANT toute mutation** : build fidèle à
**4 variantes** (méthode Réassurances Option A), tuiles natives dans `Standard`, SAV en 4e variante
par clone verbatim (pas d'adoption forcée du bouton solide → évite le piège rejeu-de-props Hero).
Pas un master « tuile » séparé (la tuile n'apparaît que dans cette section — réévaluer si réutilisée
ailleurs). **Ce n'est pas une source à nettoyer (≠ cas Button) — c'est de la vraie variété
structurelle, modélisée fidèlement.**

## Structure mesurée

**Tuile-nav (non-alt, RAW)** — ex. `226:122` : `item` (FRAME 744×418 VERTICAL, fill IMAGE plein-cadre)
→ [`Vector` 98×128 overlay ; `wrapper` → `inner` (HORIZONTAL) → [`text`(Titre fs40, sous-titre fs18),
`arrow-right` nu]]. Largeur 744 = `(1552 − 64)/2`.

**Carte-Catégorie (alt, gouverné)** — master `2063:1611` : `Carte` (VERTICAL gap32) → [`img` 743,
`text`(Titre fs32 / Texte fs18 amorce grasse), `Bouton` `Link` « … » glyphes pdf+download]. Largeur
2 cartes → `(1728−178−64)/2 = 743` ; 3 cartes → `(1728−178−128)/3 = 474`.

**Carte RDV SAV (RAW)** — `249:1529` : même squelette + un `wrapper` autour de text+Bouton, Bouton
**« Outilne noir »** solide, libellé **« Prendre rendez-vous »**, 304×54.

## Construction livrée (Option A fidèle, zéro reconstruction)

`DS · Molécules` → section **Catégories principales** (`2115:4158`, à `0,12350`, 1808×2584 ; zone
pré-vérifiée libre, maxY existant 12271) → `COMPONENT_SET` **Catégories principales** (`2115:4277`).
Chaque variante **clonée d'une occurrence réelle** (`clone()` → `createComponentFromNode` sur le
CLONE jamais la source → sources vérifiées inchangées après clonage → `combineAsVariants`) :

| Variante `Disposition` | nodeId | Ancre clonée | Structure | Sert (adoption) |
|---|---|---|---|---|
| `Standard` (défaut) | `2115:4273` | PdG `226:121` | 2 tuiles-nav natives, HUG 1552, pad 0 | PdG, Accueil |
| `Pleine largeur` | `2115:4274` | industrielles `387:732` | 2 Carte gouvernées, FILL 1728, pad 89 | entrée, industrielles, résidentielles |
| `Pleine largeur · 3 cartes` | `2115:4275` | Motorisation `237:717` | 3 Carte gouvernées | Motorisation |
| `Pleine largeur · RDV` | `2115:4276` | SAV `249:1522` | 1 Carte + 1 carte RDV native | Dépannage/SAV |

Vérifié (capture visuelle + relecture) : 4 variantes fidèles, **0 dépendance tierce** (29 instances
imbriquées `remote:false`), glyphes Carte `VariableID:5:40` corrects (aucun reset), tuiles natives +
carte RDV solide préservées.

## Piège Figma trouvé (bloquant, résolu) — hauteur de carte alt

Cartes alt **FIXE** en hauteur (649 industrielles / 622 entrée-résidentielles), `img` = `FILL`. Le
clone `Pleine largeur` (industrielles) bake **649**. Pour entrée/résidentielles (622) l'override
texte ne suffit pas, et **`resize()` sur la carte imbriquée dans l'instance = NO-OP silencieux**
(piège #1, confirmé : 649 inchangé). `lsV='HUG'` seul ne réduit pas non plus (img FILL remplit).
**Solution (par test)** : `Carte.lsV='HUG'` + `img.lsV='FIXED'` + `img.resizeWithoutConstraints(w,
418)` → la carte s'effondre à **622** (img 418 = hauteur d'image exacte de la copie brute ; bbox
`{0,0,0,0}`). Le resize de l'img fonctionne une fois l'img explicitement FIXED.

## Adoption (T080) — mapping + résultats

4 pages = **ancres** (contenu = défaut de variante), 0 override : PdG (`Standard`), industrielles
(`Pleine largeur`), Motorisation (`3 cartes`), SAV (`RDV`). 3 pages = **overrides** :

| Maquette | Variante | Instance | Overrides |
|---|---|---|---|
| PdG | Standard | `2115:4278` | 0 (ancre) |
| industrielles | Pleine largeur | `2115:4297` | 0 (ancre) |
| Motorisation | 3 cartes | `2115:4324` | 0 (ancre) |
| Dépannage/SAV | RDV | `2115:4364` | 0 (ancre) |
| Accueil | Standard | `2115:4392` | 2 tuiles : Titre + Sous-titre + tuile1 image |
| Portes d'entrée | Pleine largeur | `2115:4411` | 2 Carte : Titre+Texte(gras réappliqué)+libellé Bouton+img + hauteur 649→622 |
| PdG résidentielles | Pleine largeur | `2115:4438` | idem 2 Carte + hauteur 649→622 |

Mécanique : `variante.createInstance()` → `parent.insertChild(1, inst)` → `inst.lsH = FILL|HUG` →
`rawCopy.remove()` → overrides → **bbox delta `{0,0,0,0}` sur les 7** + relecture contenu + glyphes
`5:40` frais (piège 6 OK, `btnErr:null`). Ledger : `ledger/categories-principales.json` (23 reportee
/ 0 non-portable, `pages:ledger:check` exit 0).

## Zéro dépendance tierce (SC-008)

`findAll(INSTANCE)` sous le master (29) + sous les 7 instances adoptées : **0 remote**. Aucun master
« tuile catégorie » n'existe (recensement complet), et aucun master « Catégories principales »
préexistant (zone `(0,12350)` était libre).

## Preuve pixel (T080) — voir `proofs/categories-principales/README.md`

`pages:compare` raw-avant vs adopté-après (standard, non dégénérée) : **5/7 byte-identiques** (sha256
avant==après — dont **les 2 pages à override lourd** entrée + résidentielles), **2 écarts sous-pixel**
(PdG 2624 = 0,034 %, Accueil 2500 = 0,028 %) sur la bande sous-titre des pages à tuiles (dont
l'**ancre PdG**). Diagnostiqués exhaustivement (crops + zoom 3× + lecture live) comme **re-rendu AA
irréductible du texte natif de tuile** : runs de police (Regular unique), propriétés texte
(letterSpacing/lineHeight/paragraphSpacing/align/autoResize/largeur/position) et zoom 3× **tous
identiques** avant/après — ni gras perdu, ni décalage, ni espacement. 0,03 % ≪ tolérance ≤2 %, nommé
non arrondi. **Accepté par l'owner 2026-07-25** (même famille que les écarts déjà acceptés cette
nuit ; diagnostic renforcé par l'ancre PdG à 0 override qui élimine structurellement l'hypothèse
override — raisonnement complet dans `decisions.md`, entrée `ecart-pixel-accepte`) ; `verdict.json`
reste `diff`/exit 1 tel quel, jamais maquillé — l'acceptation vit dans la décision, pas dans le
fichier de preuve.

## Incident concurrent — fork lockstep détecté + arbitré (2026-07-25)

À l'écriture de cet audit, le fichier existait **déjà sur disque** en version **pré-build** (statut
« MASTER + ADOPTION EN ATTENTE d'une décision orchestrateur »), avec **mes propres données** (nonce
`461400ba33c31f64`, mes sha256, mon receiver PID 24991) — que **ma branche n'a jamais écrites** (elle
est passée directement de la remontée au build à la réception du GO). = **fork en lockstep** (même
mécanisme que Réassurances T077) : une branche jumelle a divergé au point « j'écris l'audit », a écrit
cette version pré-build en attendant la décision, pendant que ma branche recevait le GO et
construisait. **Vérif canvas live décisive** : exactement **1** section `2115:4158` + **1**
COMPONENT_SET `2115:4277` dans tout le fichier, mes **7** instances intactes (`mainSet 2115:4277`,
bonne disposition), **1 seule** instance par maquette, **0** copie brute, **0** second master. Le
jumeau **n'a fait AUCUNE mutation canvas** — sa seule empreinte est ce doc pré-build (désormais
remplacé par la version post-build ci-présente, qui n'en perd aucune conclusion, les ajoute). Aucune
ré-adoption, aucun dégât. Remonté à l'orchestrateur avec preuves.

## Récapitulatif

| Élément | Détail |
|---|---|
| Master | `Catégories principales` (`2115:4277`), COMPONENT_SET, `Disposition` = Standard / Pleine largeur / Pleine largeur · 3 cartes / Pleine largeur · RDV |
| Section | `Catégories principales` (`2115:4158`), `DS · Molécules`, `(0,12350)` |
| Variantes | `2115:4273` / `2115:4274` / `2115:4275` / `2115:4276` — chacune clonée d'une occurrence réelle |
| Dépendances | Carte + Bouton + glyphes (locaux) — **zéro tierce** ; tuiles-nav = contenu natif (ingouverné par décision) |
| Adoption | 7 instances, 0 copie brute, bbox `{0,0,0,0}` ; ledger 23 reportee / 0 non-portable |
| Preuve | 5/7 byte-identiques + 2 AA sous-pixel **acceptés owner** 2026-07-25 (`proofs/categories-principales/`) |
| Checkpoints | `003/categories-principales/{master `2379926299894749252`, adoption `2379927416113640765`, finalize `2379923559176343741`}` |
| Fork | lockstep, doc-only, **0 dégât canvas** (vérifié), arbitré |
| Commit | **non committé** (revue Fable indépendante d'abord) |
