# Audit — Section Texte SEO (T081)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — `findAll` par nom `Texte SEO` sur la page `Pages`
(`210:325`), puis inspection récursive par **position** de chaque occurrence et de ses
enfants directs. Lecture seule.
**Dépendance DAG** : Accordion (T068) — couvert par Accordion-row (T041-T042, déjà
adopté). Les lignes d'accordion des 8 occurrences sont **déjà des instances gouvernées**
(vérifié live, voir ci-dessous) : rien à reconstruire pour elles.

## Usage — localisation par position (les 9 maquettes)

**8 occurrences** trouvées, une par maquette **sauf Accueil** (zéro sur Accueil) —
conforme à l'inventaire (`texte-seo ×8`, DAG). Toutes en `copie-brute` (signature
`frame[group,group,group,frame]`, top-level = `FRAME` déjà propre, pas un `GROUP`).

| Maquette | nodeId source | Hauteur | `p` (body) | Accordion |
|---|---|---|---|---|
| Contactez-nous | `305:911` | 383 | 72 | 160 |
| Dépannage/SAV | `305:863` | 359 | 48 | 160 |
| Motorisation | `305:814` | 359 | 48 | 160 |
| Portes de garage | `302:721` | 383 | 72 | 160 |
| Portes de garage industrielles | `387:822` | **503** | **136** | **216** |
| Portes de garage résidentielles | `305:755` | 383 | 72 | 160 |
| Portes d'entrée | `305:839` | 359 | 48 | 160 |
| À Propos | `305:887` | 383 | 72 | 160 |

**La hauteur varie réellement (359 → 503px)** — jamais une taille fixe. Cause mesurée :
la longueur du paragraphe `p` (48/72/136px) **et** la hauteur de la ligne d'accordion
ouverte (160 vs 216px sur industrielles, réponse sur 2 lignes). Le top-level est en
`VERTICAL` auto-layout **HUG** (`primaryAxisSizingMode: AUTO`), largeur FIXE 1728,
`itemSpacing` 32, padding L/R 89 — la hauteur se recalcule seule selon le contenu.

## Structure (les 4 enfants, identique sur les 8)

1. `h2` (`GROUP` → 1 `TEXT`) — titre, Montserrat **mixte Bold/Regular @24**, fill
   `VariableID:5:40`, `textAutoResize: HEIGHT`, 30px. Contenu **varie par page**.
2. `p` (`GROUP` → 1 `TEXT`) — paragraphe body, Montserrat **mixte Bold/Regular @14**,
   fill `VariableID:24:52`, `HEIGHT`, 48/72/136px. Contenu varie ; **gras riche par
   plage** (jusqu'à 15 segments).
3. `h3` (`GROUP` → 1 `TEXT`) — sous-titre, Montserrat SemiBold @20 (segment **unique**,
   non mixte), fill `VariableID:5:40`, 25px. Contenu **varie par page**.
4. `accordion` (`FRAME` `VERTICAL` HUG, `itemSpacing` 0) — **3 instances Accordion-row
   gouvernées** (`2059:1383` Petit/Fermé, `2059:1411` Petit/Ouvert ; `remote: false`).

## Trouvailles (prémisses du brief affinées à l'audit)

1. **`h3` n'est PAS un « Infos pratiques » constant.** Le brief le décrivait comme un
   libellé fixe. La mesure par position montre un **sous-titre propre à chaque page**
   (« Bien configurer votre porte industrielle », « Compatibilité et fonctionnement »,
   « Nos engagements »…). Seule Contactez-nous dit « Infos pratiques » — d'où la
   confusion. `h3` est donc du contenu par page, porté par override comme `h2`/`p`.
   (Même classe que la prémisse Contact-info-row/Coordonnées invalidée à l'audit.)
2. **Motif accordion identique sur les 8 pages** : ligne 1 = Fermé, ligne 2 = **Ouvert**,
   ligne 3 = Fermé. **Seule la ligne 2 porte un vrai contenu** ; les lignes fermées
   gardent le placeholder `Réponse` (masqué à l'état fermé). Donc à l'adoption : `État`
   inchangé (déjà le défaut du master), on override seulement les 3 `Titre` + le
   `Contenu` de la ligne 2.
3. **`\r` (U+000D) invisible dans `p` sur 3 pages** (résidentielles, Portes d'entrée,
   À Propos) — même trappe que Footer-column/Coordonnées. Détecté par `charCodeAt`
   (invisible à `JSON.stringify`). Impose une construction par `clone()` (re-typer à la
   main perdrait le `\r`).
4. **Zéro dépendance tierce** : les 2 chevrons et les 3 lignes d'accordion sont tous
   locaux et gouvernés (`remote: false`).

## Construction — le master livré

`DS · Molécules` → section **Texte SEO** (`2108:3111`, à `1692,8035`) → `COMPONENT`
**Texte SEO** (`2108:3123`, à `1732,8095`, 1728×383, HUG), construit par `clone()` de
l'occurrence **Contactez-nous** (`305:911`) puis `figma.createComponentFromNode()` :
conversion en place, **zéro reconstruction manuelle** → zéro risque de perdre une plage
de gras ou un caractère invisible (classe de bug qui a coûté du temps sur Accordion-row/
Formulaire). Les 3 lignes d'accordion restent les instances gouvernées héritées du clone.

**Pourquoi Contactez-nous comme source du défaut** : page « typique » (p=72 sur 3
lignes, box `Contenu` de la ligne ouverte = 24px, **aucun `\r`**, h3 = « Infos
pratiques ») → défaut représentatif, **anchor** d'adoption (son adoption = swap sans
override), et **minimise les redimensionnements** (seule industrielles, box 80px, exige
un agrandissement).

**Décision — aucune propriété TEXTE formelle sur `h2`/`p`/`h3`.** Les deux principaux
(`h2`, `p`) portent du gras riche par plage, et `p` porte un `\r` sur 3 pages : lier une
propriété TEXTE formelle (`componentPropertyReferences`) **aplatit** le style mixte et
met le `\r` en risque (trappe déjà documentée Formulaire T092/Coordonnées T093 —
`setProperties()`/le binding re-flatten à chaque override). Contenu porté par **override
direct de sous-calque** (`setCharacters` + `setRangeFontName` par plage, appliqués une
fois, persistants) — plages de gras et `\r` préservés et **re-vérifiés par plage** après
écriture. Les lignes d'accordion gardent leurs propriétés gouvernées (`Titre`/`Contenu`/
`État`). Le master est donc un gabarit structurel + 3 instances gouvernées, même idiome
que FAQ (T083, wrapper d'instances gouvernées). Description de master non vide posée.

## Piège Figma trouvé et documenté (nouvelle famille)

**`resize()` sur le sous-calque `Contenu` d'une instance Accordion-row imbriquée est
silencieusement refusé** — la hauteur reste au défaut du master (24px), même après
`textAutoResize = 'NONE'` + `layoutSizingVertical = 'FIXED'` + `resize(w, 80)` (aucune
erreur levée, aucun effet). C'est ce qui a d'abord donné industrielles à 447px au lieu
de 503 (la réponse 2-lignes tronquée). **Solution qui marche : `ct.textAutoResize =
'HEIGHT'`** sur le sous-calque `Contenu` → la box croît à sa hauteur **naturelle**
(80px pour la réponse d'industrielles), la ligne re-hugge (80→136), le wrapper re-hugge
(447→503). Comme la hauteur naturelle == la box source (80px), le rendu est fidèle.
Cousin du piège « resize sur enfant d'instance ne fait rien » déjà connu, mais la sortie
(passer par le mode `autoResize` plutôt que `resize()`) est nouvelle et réutilisable pour
toute molécule à box de texte fixe imbriquée dans une instance.

## Récapitulatif

| Élément | Détail |
|---|---|
| Master | `Texte SEO` (`2108:3123`), COMPONENT, HUG, 1728×383 (défaut = Contactez-nous) |
| Section | `Texte SEO` (`2108:3111`), `DS · Molécules`, à `1692,8035` |
| Propriétés formelles | aucune sur le wrapper (contenu par override) ; les 3 lignes exposent `Titre`/`Contenu`/`État` (Accordion-row) |
| Dépendances | Accordion-row (`2059:1383`/`2059:1411`), chevrons — tous locaux, zéro tierce |
| Checkpoint | `003/texte-seo/master` |

**Anomalie de session résolue (transparence)** : un composant `Texte SEO` **orphelin**
(`2108:3208`, sans parent, hors de l'arbre du document, **0 instance**) a été trouvé et
retiré de l'arbre en cours de route (vestige d'un état antérieur à une compaction de
contexte, hypothèse du coordinateur). Après nettoyage, le walk complet depuis
`figma.root` **et** une vérification indépendante du coordinateur confirment **un seul**
master `Texte SEO` dans l'arbre (`2108:3123`). Le handle orphelin persiste dans le
registre de nœuds (un nœud sans parent n'est pas `.remove()`-able) mais est hors de tout
export/scan-par-page — inoffensif, nommé plutôt que passé sous silence.
