# Audit — Composite Hero et catégories (T097/T098)

**Date** : 2026-07-25
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — `loadAllPagesAsync`, puis inspection récursive
**par position** des 6 cadres `Hero et catégories` (le cadre lui-même : `layoutMode`,
`layoutSizing`, `itemSpacing`, `padding`, `fills`, `strokes`, `effects`, `cornerRadius`,
`clipsContent` ; puis chaque enfant : `type`, `getMainComponentAsync`, `remote`), plus un
scan global du fichier (tout node nommé « Hero et catégories » + tout COMPONENT/COMPONENT_SET
du même nom). **Lecture seule — aucune mutation canvas pour cette tâche.**
**Dépendance DAG** : Hero (T076) + Catégories principales (T080), **tous deux adoptés-prouvés**.

## Conclusion — pas de master séparé ; le composite est DÉJÀ gouverné par T076 + T080

`Hero et catégories` est un **cadre d'assemblage de page**, pas un composant : un `FRAME`
`VERTICAL` **sans identité visuelle propre** (`fills: []`, `strokes: 0`, `effects: 0`,
`cornerRadius: 0`, padding `0/0/0/0`), **sans contenu propre** (exactement 2 enfants, aucun
titre/séparateur/décor), dont les deux enfants sont **déjà les vrais composants gouvernés**
(le Hero de T076 + les Catégories principales de T080). Il ne reste **rien à construire ni à
remplacer** — la satisfaction de la dépendance DAG (« T097 exige T076 + T080 adoptés ») **EST**
le travail de T097/T098.

**Même décision que les wrappers `accordion` (T067), `tabs` de Tab (T043-T044) et `row` de
Field (T039-T040)** : un conteneur de pure disposition, sans fill/bordure/effet/padding, ne
justifie pas un master ; il est de l'assemblage de maquette, pas de l'identité de composant.
Ici en plus, un master unique serait **impossible sans fausser la source** (voir §Accueil).

**Décision mesurée, pas supposée** — le brief T097 disait « Master Hero et catégories » ; la
mesure ci-dessous montre qu'un master serait un conteneur vide inutile (et, sur Accueil, faux).
Aucun master n'est construit, par choix documenté.

## Usage — localisation par position (les 9 maquettes)

Scan global : **exactement 6** nodes nommés `Hero et catégories`, **tous des `FRAME`**, **tous
sur la page `Pages`**. **Zéro** COMPONENT/COMPONENT_SET du même nom nulle part dans le fichier
(voir §Anti-fork). Les 3 autres maquettes (Contactez-nous, À Propos, Dépannage/SAV) n'ont pas
ce wrapper — sur Dépannage/SAV, Hero et Catégories vivent directement dans la maquette
(cohérent avec l'audit `categories-principales.md`).

| Maquette | wrapper id | parent (idx) | placement |
|---|---|---|---|
| Portes de garage | `226:114` | maquette `226:112` (idx 0) | enfant direct |
| Accueil | `210:328` | maquette `210:326` (idx 0) | enfant direct |
| **Portes d'entrée** | `237:971` | **GROUP `Header + Hero + Cat` `237:970`** (idx 0) → maquette `237:969` | **niché 1 niveau plus bas** |
| Motorisation | `237:707` | maquette `237:705` (idx 0) | enfant direct |
| PdG industrielles | `387:722` | maquette `387:720` (idx 0) | enfant direct |
| PdG résidentielles | `230:378` | maquette `230:376` (idx 0) | enfant direct |

## Le cadre wrapper lui-même — mesuré, identique sur les 6 (rien à gouverner)

Toutes les propriétés intrinsèques du cadre sont **identiques sur les 6 pages**. La seule chose
qui varie est la **hauteur**, et c'est une **pure conséquence du `HUG`** (dérivée des enfants),
pas une propriété propre au wrapper :

| Maquette | id | type | l×h | layout | lsH/lsV | gap | padding | fills | strokes | effects | radius | enfants |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Portes de garage | `226:114` | FRAME | 1728×1106 | VERTICAL | FIXED/HUG | **48** | 0/0/0/0 | `[]` | 0 | 0 | 0 | 2 |
| Accueil | `210:328` | FRAME | 1728×1186 | VERTICAL | FIXED/HUG | **48** | 0/0/0/0 | `[]` | 0 | 0 | 0 | 2 |
| Portes d'entrée | `237:971` | FRAME | 1728×1310 | VERTICAL | FIXED/HUG | **48** | 0/0/0/0 | `[]` | 0 | 0 | 0 | 2 |
| Motorisation | `237:707` | FRAME | 1728×1212 | VERTICAL | FIXED/HUG | **48** | 0/0/0/0 | `[]` | 0 | 0 | 0 | 2 |
| PdG industrielles | `387:722` | FRAME | 1728×1337 | VERTICAL | FIXED/HUG | **48** | 0/0/0/0 | `[]` | 0 | 0 | 0 | 2 |
| PdG résidentielles | `230:378` | FRAME | 1728×1310 | VERTICAL | FIXED/HUG | **48** | 0/0/0/0 | `[]` | 0 | 0 | 0 | 2 |

`primaryAxisAlignItems = MIN`, `counterAxisAlignItems = CENTER`, `clipsContent = false`,
`opacity = 1` sur les 6 également.

**Preuve arithmétique que le wrapper n'ajoute que le gap** — hauteur wrapper = hauteur Hero
`+ 48 + ` hauteur Catégories, exactement, sur les 6 :

| Maquette | Hero (h) | gap | Catégories (h) | somme | wrapper (h) mesuré |
|---|---|---|---|---|---|
| Portes de garage | 640 | 48 | 418 | 1106 | **1106** ✓ |
| Accueil | 720 (`Hero video`) | 48 | 418 | 1186 | **1186** ✓ |
| Portes d'entrée | 640 | 48 | 622 | 1310 | **1310** ✓ |
| Motorisation | 640 | 48 | 524 | 1212 | **1212** ✓ |
| PdG industrielles | 640 | 48 | 649 | 1337 | **1337** ✓ |
| PdG résidentielles | 640 | 48 | 622 | 1310 | **1310** ✓ |

Le wrapper **n'encode qu'une seule valeur de design** : le gap 48 entre les deux sections.
C'est un **gap d'assemblage de page** (au même titre que l'`itemSpacing` de la maquette entre
ses ~8-9 sections empilées), pas une identité de composant — et le modèle de la spec veut
justement que « les 9 maquettes deviennent des assemblages d'instances », l'assemblage vivant
dans la maquette. Aucune autre paire de sections adjacentes n'est masterisée ; celle-ci ne l'est
pas non plus.

## Les enfants — DÉJÀ des instances gouvernées (le vrai travail, fait par T076 + T080)

**Zéro copie brute de Hero ou de Catégories dans aucun wrapper.** Chaque enfant est vérifié par
`getMainComponentAsync()` :

| Maquette | Enfant 0 | Enfant 1 (Catégories) |
|---|---|---|
| Portes de garage | **Hero** INSTANCE `2111:3402` → main `2111:3382`, `remote:false` | INSTANCE `2115:4278` → `Disposition=Standard` (set `2115:4277`), `remote:false` |
| **Accueil** | **`Hero video`** FRAME `210:330` (720px, **PAS une instance** — voir §) | INSTANCE `2115:4392` → `Standard`, `remote:false` |
| Portes d'entrée | **Hero** INSTANCE `2111:3458` → `2111:3382`, `remote:false` | INSTANCE `2115:4411` → `Pleine largeur`, `remote:false` |
| Motorisation | **Hero** INSTANCE `2111:3472` → `2111:3382`, `remote:false` | INSTANCE `2115:4324` → `Pleine largeur · 3 cartes`, `remote:false` |
| PdG industrielles | **Hero** INSTANCE `2111:3388` → `2111:3382`, `remote:false` | INSTANCE `2115:4297` → `Pleine largeur`, `remote:false` |
| PdG résidentielles | **Hero** INSTANCE `2111:3486` → `2111:3382`, `remote:false` | INSTANCE `2115:4438` → `Pleine largeur`, `remote:false` |

Hero est idx 0, Catégories idx 1 dans chaque wrapper (cohérent avec l'`insertChild(1)` de T080).
**11 instances gouvernées** au total dans les 6 wrappers (5 Hero + 6 Catégories) ; l'unique
enfant non-instance est le `Hero video` d'Accueil, par conception (ci-dessous). **SC-003 (zéro
copie brute) est donc déjà satisfait ici par T076 + T080** ; les cadres wrapper eux-mêmes ne
sont pas des « copies brutes » d'un composant, ce sont de l'assemblage de maquette.

## Accueil — `Hero video` n'est PAS un Hero, et un master unique le prouve impossible

Sur Accueil, l'enfant 0 est **`Hero video`** (`210:330`, `FRAME` 1728×**720**), **pas** une
instance Hero. C'est le **negative-control documenté** de l'audit Hero (T075/T076,
`audits/hero.md` §Hors périmètre) : structure différente (enfants directs `Text`+`Bouton`, sans
le nesting `wrapper/Titres` des 8 Hero, hauteur 720 ≠ 640), **jamais externalisé volontairement**.

C'est le point qui **tranche définitivement contre un master unique** : un `COMPONENT` composite
avec un Hero baké ne pourrait pas servir Accueil sans, soit **forcer `Hero video` à devenir une
instance Hero** (faux — la structure ne correspond pas, ce serait modéliser une chose pour une
autre), soit **élargir le périmètre pour externaliser un negative-control** délibérément laissé
de côté. Les deux sont des régressions de fidélité. Un wrapper d'assemblage, lui, accueille
sans peine deux sections hétérogènes — ce que la source fait déjà.

## Anti-fork / anti-duplication — vérifié LIVE avant de conclure

- Scan global du fichier : **0** `COMPONENT` et **0** `COMPONENT_SET` nommé « Hero et
  catégories » (ou variante normalisée) — **aucun master préexistant, aucun fork n'en a
  construit un.**
- **6** FRAMEs `Hero et catégories`, tous sur `Pages`, tous mesurés ci-dessus — aucun résidu,
  aucune 7e occurrence cachée.
- Receiver : cette tâche ne fait **aucune** capture ni mutation (lecture seule) ; aucun receiver
  n'a été démarré. (Ports 9223-9224 observés occupés par d'autres agents ; 9225-9232 libres —
  non utilisés ici.)

## Zéro dépendance tierce (SC-008)

Les 11 instances imbriquées (5 Hero + 6 Catégories) sont toutes `getMainComponentAsync().remote
=== false`. Les masters Hero (`2111:3382`) et Catégories (`2115:4277`) sont locaux. **Zéro
bibliothèque externe.**

## Points ouverts nommés (honnêteté, pas de silence) — hors périmètre T097/T098

1. **`Hero video` (Accueil, `210:330`) n'est pas externalisé** — negative-control, structure
   propre 720px. Question « faut-il en faire un master Hero-video ? » = **hors T097/T098**
   (relève d'un éventuel master Hero-video dédié, jamais briefé). Nommé, pas résolu.
2. **Incohérence de structure source sur Portes d'entrée** : le wrapper y est enveloppé dans un
   `GROUP` supplémentaire `Header + Hero + Cat` (`237:970`, 1 seul enfant) alors que les 5 autres
   ont le wrapper en enfant direct de la maquette. **Nommé, non corrigé** : c'est une propreté de
   source sur un cadre que je ne componentise pas ; le corriger silencieusement dépasserait le
   périmètre (règle owner : trancher « ça vient de Figma », le nommer, ne pas bricoler autour).
3. **Le nom « Hero et catégories » est légèrement inexact sur Accueil** (c'est « Hero video +
   Catégories »). Sur un cadre d'assemblage, sans conséquence — noté.

Aucun de ces points n'est un « demi-travail » du composite : le composite lui-même est
intégralement gouverné (2 sections gouvernées sur 5 pages ; 1 section gouvernée + 1
negative-control assumé sur Accueil).

## Ce qui reste — documentation, et un ledger vide explicite

- **Aucune mutation canvas** → **aucune preuve pixel avant/après** (rien n'a changé ; il n'y a
  pas de « avant » à capturer, R5/R8 sans objet). La preuve ici est **structurelle + de
  provenance** (les lectures live ci-dessus), **plus forte que le pixel** pour l'affirmation à
  démontrer (« ce sont des instances gouvernées, zéro copie brute ») — un instantané pixel ne
  distingue pas une copie brute d'une instance. Détail : `proofs/hero-et-categories/README.md`.
- **Ledger vide explicite** : `ledger/hero-et-categories.json`, `entrees: []`, `totaux 0/0`,
  `pages:ledger:check` exit 0. Il n'y a pas de master unique à référencer dans `masterNodeId` —
  le champ (requis non-vide par le validateur) porte un sentinel honnête nommant les deux masters
  qui gouvernent déjà (`2111:3382` + `2115:4277`) et renvoyant à cet audit.

## Récapitulatif

| Élément | Détail |
|---|---|
| Master | **AUCUN, par décision mesurée** — cadre d'assemblage sans identité visuelle propre ; composite déjà gouverné par Hero (T076) + Catégories (T080) |
| Wrapper | `FRAME` VERTICAL, FIXED 1728 × HUG, gap **48**, pad 0, `fills/strokes/effects/radius` nuls — **identique sur les 6** ; hauteur = pure conséquence HUG (Hero + 48 + Catégories, vérifié 6/6) |
| Occurrences | 6 `Hero et catégories` (FRAME), toutes sur `Pages` ; 3 maquettes sans wrapper |
| Enfants | 5/6 : Hero INSTANCE (`2111:3382`) + Catégories INSTANCE (set `2115:4277`) ; Accueil : `Hero video` `210:330` (hors périmètre) + Catégories INSTANCE |
| Copies brutes | **0** de Hero/Catégories (SC-003 déjà satisfait par T076+T080) |
| Dépendances tierces | **0** (11 instances `remote:false`) |
| Anti-fork | **0** master `Hero et catégories` dans tout le fichier |
| Mutation | **aucune** (lecture seule) ; ledger vide explicite, `pages:ledger:check` exit 0 |
| Points ouverts | `Hero video` non externalisé (negative-control) ; GROUP source en trop sur Portes d'entrée ; nom inexact sur Accueil — tous nommés, hors périmètre |
