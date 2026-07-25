# Audit — Section Réassurances (T077)

**Date** : 2026-07-25
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — `loadAllPagesAsync`, puis inspection récursive
**par position** des 6 occurrences (top-level + sous-cadre `items` + chaque Carte + Bouton),
lecture des `componentProperties` des instances imbriquées, résolution de chaque instance par
`getMainComponentAsync`. Lecture seule.
**Dépendance DAG** : Reassurance-item (T052, = master **Carte** disposition `Réassurance`,
adopté) + Bouton (gouverné) + Section-header (T064, adopté) — **toutes satisfaites** : le bloc
imbrique ces trois-là comme instances déjà gouvernées (`remote:false`).

## Usage — localisation par position (les 9 maquettes)

**6 occurrences** (exactement — `Réassurances` absent de Contactez-nous, Motorisation,
Dépannage/SAV). Toutes `copie-brute`, top-level = `FRAME`, largeur **1552 FIXE**, hauteur
**HUG** (auto-layout VERTICAL, `itemSpacing` 48, padding 0). Parent = la maquette (FRAME
auto-layout VERTICAL) → adoption par `insertChild(idx)`, zéro coordonnée manuelle.

| Maquette | nodeId (Réassurances) | maquette (capture) | idx | signature T0 |
|---|---|---|---|---|
| À Propos | `258:1937` | `258:1887` | 4 | `frame[frame,frame,instance]` |
| Portes d'entrée | `237:1480` | `237:969` | 2 | `frame[frame,frame,frame]` |
| Portes de garage industrielles | `387:761` | `387:720` | 2 | `frame[frame,frame,instance]` |
| Portes de garage résidentielles | `230:425` | `230:376` | 2 | `frame[frame,frame,instance]` |
| Portes de garage | `401:1653` | `226:112` | 3 | `frame[frame,frame,instance]` |
| Accueil | `210:415` | `210:326` | 5 | `frame[frame,frame,instance]` |

## LA PRÉMISSE DU BRIEF EST INVALIDÉE — mesuré, pas supposé

Le brief décrivait « FRAME 1552×731 = Section-header + items (**4× Carte**) + Bouton »,
dérivé de **À Propos seule** — l'angle mort « une occurrence supposée représenter toutes »
déjà payé cette spec (Texte SEO reflow, Formulaire Checkbox, Coordonnées Avantage). La mesure
des 6 montre **trois structures distinctes** :

| Maquette | Cartes | Carte w×h | CTA | Frame h |
|---|---|---|---|---|
| À Propos | 4 | 364×498 | 1 Bouton (Contactez-nous, 250) | 731 |
| Portes de garage industrielles | 4 | 364×498 | 1 Bouton (Contactez-nous, 249) | 731 |
| Portes de garage résidentielles | 4 | 364×522 | 1 Bouton (Contactez-nous, 250) | 755 |
| **Portes d'entrée** | 4 | 364×522 | **frame `Boutons` : 2 boutons** (Motifs disponibles 305 + Contactez-nous 250) | 755 |
| **Portes de garage** | **5** | **285×498** | 1 Bouton (Contactez-nous, 249) | 731 |
| **Accueil** | **5** | **285×498** | 1 Bouton (Contactez-nous, 250) | 731 |

**Axes de variance réels** :
1. **Nombre de cartes : 4 (4 pages) vs 5 (2 pages)**. Cartes en largeur **FIXE** dans un
   `items` (HORIZONTAL, `itemSpacing` 32, `primaryAxisAlignItems:CENTER`, largeur FILL 1552) :
   `(1552 − 3·32)/4 = 364` ; `(1552 − 4·32)/5 = 284.8 ≈ 285`. La largeur dérive du compte
   (**ma trouvaille** — le T0 a la hauteur 731/755 mais pas le compte de cartes).
2. **CTA : 1 bouton (5 pages) vs 2 boutons (Portes d'entrée)**. Le T0 **avait déjà** la
   signature distincte de Portes d'entrée (`frame[frame,frame,frame]` = 3e enfant frame
   `Boutons`, vs `instance` = Bouton direct pour les 5 autres) — jamais relevé jusqu'ici.
3. **Hauteur de carte : 498 vs 522** — pilotée par le CONTENU (cartes `lsV:HUG`), pas un axe
   structurel : elle se redérive à l'override du texte, jamais bakée.

**Correction d'une sous-prémisse** : le brief disait le Bouton « DÉJÀ VÉRIFIÉ correct et
cohérent sur les 6 pages ». Le Bouton **« Contactez-nous »** l'est bien (même variante
`Outilne noir`, glyphe droit arrow-right `6:104`, sur les 6) — la pré-vérif portait sur lui.
Mais Portes d'entrée porte **un 2e bouton** (« Motifs disponibles », 305px, glyphes
gauche+droit actifs `230:585`/`230:599`) que la prémisse a raté. Non contredit, un CTA de plus
est ajouté.

**Conséquence dure** : un master *plain* cloné d'industrielles (4 slots carte + 1 Bouton)
swappé sur les 6 **perdrait en silence** 1 carte sur Portes de garage + Accueil, et le bouton
« Motifs disponibles » sur Portes d'entrée (piège API : impossible d'ajouter un enfant à une
instance placée). Omission silencieuse interdite par le projet (principe V) → refusé.
Trouvaille remontée à l'orchestrateur AVANT toute mutation ; décision de bâtir fidèle.

## Structure (composition, mesurée)

```
Réassurances (FRAME 1552×[731|755], VERTICAL, itemSpacing 48, padding 0, lsH FIXED, lsV HUG ;
              parent = maquette top FRAME auto-layout VERTICAL)
 ├ Section-header (INSTANCE gouvernée 1552×83 ; props TEXTE Titre#2090:47 + Accroche#2090:46,
 │                 VARIANT Disposition=Standard)
 ├ items (FRAME HORIZONTAL, itemSpacing 32, lsH FILL, primaryAxisAlignItems CENTER,
 │        primaryAxisSizingMode FIXED, counterAxisAlignItems MIN)
 │   └ N× Carte (INSTANCE gouvernée « Réassurance », largeur FIXE 364|285, hauteur HUG ;
 │              Titre/Texte/img par override — déjà au ledger Carte T052)
 └ Bouton (INSTANCE gouvernée)   —OU—   Boutons (FRAME HORIZONTAL itemSpacing 16, 2× Bouton)
```

**Section-header (Titre / Accroche) — varie par page** (propriétés TEXTE gouvernées) :

| Maquette | Titre | Accroche |
|---|---|---|
| À Propos | Pourquoi choisir Piqueray ? | Plus de 50 ans d'expérience |
| Portes d'entrée | Un porte adaptée à vos attentes | Sécurité & Design |
| industrielles | Pourquoi choisir nos portes de garage industrielles ? | Plus de 50 ans d'expérience |
| résidentielles | Pourquoi choisir nos portes de garage résidentielles ? | Plus de 50 ans d'expérience |
| Portes de garage | Pourquoi choisir Piqueray ? | Plus de 50 ans d'expérience |
| Accueil | Pourquoi choisir Piqueray ? | Plus de 50 ans d'expérience |

**Contenu des cartes** (relevé live, source de vérité) : propre par page. **Accueil ≡ Portes
de garage** (mêmes 5 cartes) à **un caractère près** : carte 0 `Titre` = « Conseil
personnalisé » (Accueil) vs « Conseil personnalisé␣ » (espace final, Portes de garage) — porté,
jamais normalisé en silence. À Propos et résidentielles diffèrent entièrement d'industrielles.

## Zéro dépendance tierce (SC-008)

`findAll(INSTANCE)` + `getMainComponentAsync().remote` sur les 6 subtrees : **0 instance
remote** (Carte + Section-header sur `DS · Molécules`, Bouton + glyphes sur `Assets`). Idem
sur les 3 variantes du master.

## Construction — le master livré (Option A, fidèle, zéro perte)

Décision (alignée avec la règle owner **T079** « variante portée par une propriété officielle,
pas un second master » + le précédent **Carte** = COMPONENT_SET, **validée par
l'orchestrateur**) : un **seul master gouverné**, `COMPONENT_SET` avec propriété de variante
`Disposition`, **chaque variante clonée d'une occurrence réelle** (`clone()` +
`createComponentFromNode`, **zéro reconstruction manuelle** — cartes gouvernées,
section-header, boutons survivent par construction), puis `combineAsVariants`. L'option
« superset 5 cartes + 2 boutons + booléens » a été **rejetée** : aucune occurrence n'a à la
fois 5 cartes ET 2 boutons → elle aurait exigé une fusion manuelle (risque de fidélité).

`DS · Molécules` → section **Réassurances** (`2114:3722`, à `0,9700`, 1632×2571) →
`COMPONENT_SET` **Réassurances** (`2114:3721`, à `40,9760`) :

| Variante `Disposition` | nodeId | Ancre clonée | Structure | Sert (adoption) |
|---|---|---|---|---|
| `4 cartes` (défaut) | `2114:3619` | industrielles `387:761` | Section-header + 4 cartes (364) + Bouton | À Propos, industrielles, résidentielles |
| `4 cartes · 2 CTA` | `2114:3653` | Portes d'entrée `237:1480` | … + frame `Boutons` (2 btns) | Portes d'entrée |
| `5 cartes` | `2114:3693` | Accueil `210:415` | Section-header + 5 cartes (285) + Bouton | Accueil, Portes de garage |

Vérifié (capture visuelle + relecture) : les 3 variantes conservent leurs cartes
**gouvernées** (`remote:false`, `Disposition:Réassurance`), leur section-header, leur(s)
bouton(s) ; glyphes sombres corrects du `Outilne noir`. `nbProps=1` (juste la variante) : le
contenu par page est porté par **override d'instance imbriquée** (comme les copies brutes
aujourd'hui, comme Hero override son Bouton sans propriété formelle). **Aucun rejeu de props de
Bouton à l'adoption** (le libellé « Contactez-nous » est le défaut baké) → pas de risque de
réinitialisation de couleur de glyphe (régression Hero/Devis) ; re-vérif fraîche quand même
(piège 6).

## Plan d'adoption (T078) — mapping variante + overrides minimaux

Les défauts de variante sont des **pages réelles** → 3 pages adoptent **sans override** :

| Maquette | Variante | Overrides |
|---|---|---|
| industrielles | `4 cartes` | **0** (ancre) |
| Accueil | `5 cartes` | **0** (ancre) |
| Portes d'entrée | `4 cartes · 2 CTA` | **0** (ancre) |
| Portes de garage | `5 cartes` | **1** (carte0 `Titre` espace final) |
| À Propos | `4 cartes` | 13 (header `Titre` + 4 cartes × `Titre`/`Texte`/`img`) |
| résidentielles | `4 cartes` | 13 (header `Titre` + 4 cartes × `Titre`/`Texte`/`img`) |

Mécanique (précédent Hero/SAV) : `variante.createInstance()` → `parent.insertChild(idx,
instance)` → `rawCopy.remove()` → overrides sur instances imbriquées → vérif bbox delta
`{0,0,0,0}` + relecture contenu + couleur glyphe fraîche. Parents tous FRAME auto-layout
VERTICAL → zéro coordonnée/resize/restructuration.

## Pièges Figma — pertinents ici

1. **Ajouter/déplacer un enfant DANS une instance placée = refusé** (`insertChild`/`group`).
   C'est CE piège qui rend un master *plain* incapable des 5 cartes / du 2e bouton → justifie
   le COMPONENT_SET. Sur le master (main components) l'arbre est librement éditable (le piège
   ne frappe que les instances).
2. **Rejeu de props Bouton réinitialise une couleur de glyphe héritée** (Hero) — **évité** ici
   (aucun rejeu ; libellé = défaut baké). Vérif fraîche quand même.
3. **`section.appendChild` rend les coords relatives** (piège #3) — géré : set à `40,60` après
   append.
4. **`pages:compare` scanne toujours les 9 maquettes** — tout écart attribué à sa vraie cause
   (nœud + geste) avant acceptation, jamais par le périmètre déclaré seul.

## Incident concurrent — fork de cette tâche, confirmé + arbitré (2026-07-25)

Au démarrage du before-capture, mon receiver a échoué `EADDRINUSE` sur le port 9231 (choix
non-défaut) : un autre process exécutait ma commande EXACTE (`receiver.mjs
.page-parity/reassurances/before 9231`, tâche `bznpoh96b` « before-set » que je n'ai jamais
lancée, nonce `90b5508af9ce8a2d`), et ce dossier contenait **déjà les 6 PNG before** — alors
que je n'ai **jamais** lancé capture.js. Ce process (PID 19572) remontait au même harness
Claude (14610). Un second agent a aussi écrit une version de cet audit. **Un fork en lockstep
du même Build** (mécanisme suspecté SAV/Texte-SEO) — les deux branches ont indépendamment
**convergé sur le même master `2114:3721` et le même design Option A** (validation croisée), et
les deux ont **détecté le conflit et suspendu l'adoption** au lieu de courir. Côté Figma :
**zéro dégât** (6 blocs encore copie-brute, un seul master). **Arbitrage orchestrateur** :
receiver rogue 19572 tué (`kill`, exit 143 SIGTERM), before recapturé proprement sous mon
propre receiver/nonce, adoption reprise **page par page avec check de fraîcheur** (relecture
live avant chaque page ; si déjà adoptée par l'autre branche → saute + note + remonte). Détail :
`decisions.md`.

## Récapitulatif

| Élément | Détail |
|---|---|
| Master | `Réassurances` (`2114:3721`), **COMPONENT_SET**, variante `Disposition` = `4 cartes` / `4 cartes · 2 CTA` / `5 cartes` |
| Section | `Réassurances` (`2114:3722`), `DS · Molécules`, à `0,9700` |
| Variantes | `2114:3619` (4c, défaut) / `2114:3653` (4c·2CTA) / `2114:3693` (5c) — chacune clonée d'une occurrence réelle |
| Propriétés | 1 (variante `Disposition`) ; contenu par override d'instance imbriquée (tous gouvernés) |
| Dépendances | Carte + Section-header (`DS · Molécules`), Bouton + glyphes (`Assets`) — **zéro tierce** |
| Checkpoint | `003/reassurances/master` (versionId `2379909218283682275`) |
| Adoption (T078) | **faite** — 6 instances (`2115:3723/3754/3794/3830/3861/3892`), 0 copie brute, bbox `{0,0,0,0}` + contenu byte-exact ; ledger 27 reportee/0 non-portable ; preuve structurelle + trou pixel nommé (`proofs/reassurances/README.md`, `decisions.md`) ; **non committé** |
