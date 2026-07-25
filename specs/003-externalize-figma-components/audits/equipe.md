# Audit — Section Équipe (T087)

**Date** : 2026-07-25
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — `loadAllPagesAsync`, puis inspection récursive
**par position** de l'occurrence unique (wrapper + grid + chaque carte), lecture des
`componentProperties` de chaque instance imbriquée, résolution de chaque instance par
`getMainComponentAsync` (`remote` + master). Lecture seule.
**Dépendance DAG** : Member-card (T050, master `2074:2072`, **plain COMPONENT**, adopté) —
**satisfaite** : le bloc imbrique 16 instances de ce master, déjà gouvernées (`remote:false`).

## Usage — localisation par position (1 des 9 maquettes)

**1 occurrence, confirmée exhaustivement** : `À Propos` (maquette `258:1887`), bloc `Équipe`
(`258:1928`), **enfant idx 2** de la maquette (auto-layout VERTICAL, 9 enfants). `Équipe` absent
des 8 autres maquettes. Une seule occurrence ⇒ **aucune variance inter-pages à modéliser** (cas
SAV/Coordonnées), master **plain COMPONENT** sans variante.

## Structure (mesurée)

```
Équipe (FRAME 1728×1886, HORIZONTAL, itemSpacing 32, padding L/R 89, T/B 0,
        lsH FILL, lsV HUG, primaryAxisAlignItems CENTER, counterAxisAlignItems MIN ;
        parent = maquette À Propos, FRAME auto-layout VERTICAL)
 └ grid (FRAME, layoutMode **GRID**, gridRowCount 4 × gridColumnCount 4,
         gridRowGap 32, gridColumnGap 32, 1550×1886, lsH FILL, lsV HUG, padding 0)
     └ 16× Member-card (INSTANCE gouvernée, master 2074:2072, 364×448 chacune ;
            props TEXTE Nom#2074:36 + Poste#2074:37 ; photo par override d'instance)
```

Le `grid` utilise le **layout GRID natif de Figma** (pas un auto-layout wrap) : chaque carte
porte un ancrage `gridRowAnchorIndex`/`gridColumnAnchorIndex` (span 1×1). Vérifié survivant au
`clone()` + `createComponentFromNode` (le master ré-affiche GRID 4×4, gaps 32 — voir Construction).

**Les 16 membres (ordre de grille, relevé live = source de vérité)** : 13 réels + **3 placeholders**
(`Prénom`/`Poste`, texte littéral, photo réelle mais nom anonymisé — un vrai manque de source, cf.
audit Member-card ; reproduit tel quel, jamais inventé).

| row,col | Nom | Poste |
|---|---|---|
| 0,0 | Cécilia Piqueray | Gérante |
| 0,1 | Florian Piqueray | Gérant |
| 0,2 | Sandra Magermans | Collaboratrice admin & comptabilité |
| 0,3 | Arnaud Dahmen | Collaborateur admin & gestion SAV |
| 1,0 | Ricardo | Peintre |
| 1,1 | Quentin | Préparateur |
| 1,2 | Marc | Monteur |
| 1,3 | André | Monteur |
| 2,0 | Grégory | Monteur |
| 2,1 | Laurent | Monteur |
| 2,2 | Jordan | Monteur |
| 2,3 | Florian | Monteur |
| 3,0 | Hervé | Dépanneur |
| 3,1 | **Prénom** | **Poste** (placeholder) |
| 3,2 | **Prénom** | **Poste** (placeholder) |
| 3,3 | **Prénom** | **Poste** (placeholder) |

## Complétude vérifiée — le describe initial (profondeur 3) n'a rien raté

Le brief prévenait qu'un Section-header ou un titre pouvait échapper au scan profondeur-3. **Vérifié
exhaustivement, live** : le sous-arbre entier de `Équipe` se décompose intégralement en
`grid` + 16 Member-cards, sans reliquat.

- **`typeCounts` du sous-arbre** : FRAME 17 (= `grid` + 16 frames `text` des cartes), INSTANCE 32
  (16 Member-card + 16 `member-picture`), RECTANGLE 32 (16 × `normal` + `fun-ia`), TEXT 32
  (16 × `Nom` + `Poste`). **Tout se rattache aux 16 cartes + au wrapper grid** — aucun nœud
  orphelin.
- **`rawTextsOutsideInstances` = []** : zéro TEXT hors instance → **aucun titre/accroche brut**
  posé sur la section. Pas de Section-header, pas de Bouton, pas de CTA. La prémisse « pas de
  Bouton dans le describe initial » est **confirmée par mesure**, pas supposée.

## Zéro dépendance tierce (SC-008)

`findAll(INSTANCE)` + `getMainComponentAsync().remote` sur le sous-arbre entier : **0 instance
remote**. `nonMemberInstances` = [] (toute instance est une Member-card `2074:2072` ou son
`member-picture` imbriqué). Aucun nouvel asset. Idem re-vérifié sur le master construit
(`remoteAnyInSubtree` = 0).

## Propreté de source notée, pas corrigée — le calque mort `fun-ia`

Chaque `member-picture` contient 2 rectangles empilés à la même position : `fun-ia` (idx 0,
DESSOUS, `visible:true` mais totalement occulté — un essai IA abandonné, **même image
`508388d68808` sur les 16**) et `normal` (idx 1, DESSUS, la vraie photo unique — Cécilia
`c60f37abee2a`, Florian `23844d60213a`, Jordan `2b1776d2cba4`, …). Documenté déjà par l'audit
Member-card. **Reproduit automatiquement par le clone** — `normal` occulte `fun-ia` à 100 %,
zéro impact pixel, aucune action requise (le calque mort ne pèse pas). *Note honnêteté* : une
première lecture de hash via `findOne` tombait sur `fun-ia` (idx 0) et renvoyait « 16 fois le
même hash » ; désambiguïsé par lecture explicite des deux rectangles + la capture visuelle (16
photos distinctes rendues).

## Construction — le master livré (clone verbatim, zéro reconstruction)

Décision (précédent SAV/Coordonnées/Member-card = **plain COMPONENT** pour une occurrence unique ;
Réassurances n'était un COMPONENT_SET *que* pour une variance multi-pages réelle, absente ici) :
un **seul master gouverné**, `COMPONENT`, **cloné de l'occurrence réelle** (`raw.clone()` →
reparent dans la section → `figma.createComponentFromNode`), **zéro reconstruction manuelle** —
le wrapper, le layout GRID et les 16 Member-cards gouvernées survivent par construction. Le
contenu (16 noms/postes/photos) est **baké dans le master** (comme SAV) : l'occurrence unique EST
le défaut, l'adoption ne porte donc **aucun override** → ledger vide explicite.

`DS · Molécules` → section **Équipe** (`2115:3928`, à `1900,12350` — position pré-calculée libre,
offset large hors Réassurances qui finit à y≈12271 et hors le master Categories-principales
construit en parallèle ; zone vérifiée vide avant construction) → `COMPONENT` **Équipe**
(`2115:3947`, 1728×1886, à `40,60` dans la section) :

| Élément | Détail |
|---|---|
| Master | `Équipe` (`2115:3947`), **plain COMPONENT** (aucune variante) |
| Layout master | HORIZONTAL, itemSpacing 32, padding L/R 89 ; lsH FIXED (top-level, était FILL sur la maquette), lsV HUG |
| grid | `2115:3930`, GRID 4×4, gaps 32, 1550×1886 — **survécu au clone+componentize** (vérifié) |
| Cartes | 16 Member-card gouvernées (`remote:false`, master `2074:2072`) — vérifié après construction |
| Propriétés | **0** propriété formelle au niveau Équipe ; contenu baké (occurrence unique) |
| Dépendances | Member-card (`DS · Molécules`) — **zéro tierce, zéro remote, zéro nouvel asset** |
| Checkpoint | `003/equipe/pre-master` (versionId `2379927240486025877`) |

Vérifié (capture visuelle du master + relecture) : 4×4, 16 photos correctes, noms en gras
(Montserrat), postes en accent orange, 13 réels + 3 placeholders — conforme à la source.

## Adoption (T088) — 1 page, 0 override

Mécanique (précédent SAV/Réassurances) : `master.createInstance()` → `apropos.insertChild(2,
inst)` → `raw.remove()` → `inst.layoutSizingHorizontal='FILL'` / `lsV='HUG'` (pour matcher le raw
FILL/HUG) → vérif bbox delta `{0,0,0,0}` + contenu byte-exact. Parent = maquette À Propos
(FRAME auto-layout VERTICAL) → **zéro coordonnée/resize/restructuration manuelle**.

- **bbox** : instance `2115:4044` à `{x:13797, y:992, w:1728, h:1886}` = **exactement** le raw
  mesuré avant adoption → delta `{0,0,0,0}`.
- **contenu byte-exact** : les 16 `Nom`/`Poste` de l'instance == la source live lue **avant**
  adoption, **0 mismatch** (13 réels + 3 `Prénom/Poste`, ordre de grille identique).
- **gouvernance** : 16 cartes `remote:false` master `2074:2072`, 0 remote ; instance À Propos
  redevenue 9 enfants, raw disparu, master unique (`uniqueMasterCount=1`).
- Checkpoint : `003/equipe/pre-adoption` (`2379926917866820646`), `003/equipe/adoption`
  (`2379926269825387412`).

## Preuve pixel — byte-identique, LÉGITIME (raw→adopté réel)

`pages:compare` (À Propos seule, seule maquette concernée) : **1/1 identical, 0 diff, exit 0**,
et **sha256 `before == after` = `fcce5272417a…`** (byte-identique). **Contrairement à
Réassurances, ce byte-identique n'est PAS dégénéré** : le `before` a été capturé alors que le raw
`258:1928` était **présent** (vérifié idx 2 juste avant la capture, avant toute mutation) ; puis
adoption ; puis `after`. C'est un vrai before(raw)→after(adopté).

**Pourquoi 0 diff (et pas du bruit AA comme Member-card 4163px sur la même maquette)** : le raw
`Équipe` était déjà un **wrapper auto-layout contenant 16 Member-cards DÉJÀ gouvernées** (T050
fait). L'externalisation ne fait que remplacer `[wrapper FRAME + grid FRAME]` par `[instance
Équipe]` **au même bbox**, avec les **mêmes instances Member-card** aux **mêmes positions GRID** —
scène-graphe rendu strictement identique ⇒ export déterministe byte-identique. Le bruit AA de
Member-card datait du remplacement de copies *vraiment brutes* ; ici il n'y a plus rien de brut à
re-rastériser. Corroboré : le sha `fcce5272417a` d'À Propos est **stable depuis le travail
Réassurances** (leur `before` À Propos = même sha) — mon adoption a bougé **zéro pixel**.

## Pièges Figma — pertinents ici

1. **`section.appendChild` rend les coords relatives** (piège #3) — géré : master reposé à `40,60`
   après append dans la section.
2. **`resize()`/restructurer une instance placée = NO-OP/refusé** — non déclenché : aucune
   restructuration, adoption par `insertChild` + `layoutSizing` (pas de resize manuel).
3. **`pages:compare` scanne les maquettes capturées** — ici je n'ai capturé qu'À Propos (seule
   affectée) ; l'unique entrée est bien la mienne, écart 0 attribué à l'adoption Équipe.
4. **Défaut pré-existant d'un composant imbriqué** (piège #7) — Member-card n'a ni Bouton ni
   glyphe ; seul « défaut » = calque mort `fun-ia` (occulté, sans impact). Aucun rejeu de props
   Bouton (pas de Bouton) ⇒ pas de risque de réinit couleur glyphe.

## Observation multi-agent — parallèle sain, PAS un fork de cette tâche

Un receiver page-parity tiers tourne sur **port 9228** → `.page-parity/categories-principales/before`
(agent Categories-principales, annoncé par le brief comme construisant « juste à côté »). **Tâche
différente, port différent (j'ai pris 9229), dossier différent, master différent** — aucune
collision (mon port n'a jamais eu d'EADDRINUSE, ma zone `1900,12350` et mon master `2115:3947`
sont uniques). Ce n'est **pas** un fork de T087/T088 (contraste avec l'incident Réassurances où
un process exécutait *ma commande exacte*). Rien à arbitrer.

## Récapitulatif

| Élément | Détail |
|---|---|
| Master | `Équipe` (`2115:3947`), **plain COMPONENT**, 1728×1886, GRID 4×4 de 16 Member-cards gouvernées |
| Section | `Équipe` (`2115:3928`), `DS · Molécules`, à `1900,12350` |
| Propriétés | 0 (contenu baké, occurrence unique) ; **0 dépendance tierce / remote / nouvel asset** |
| Adoption | 1 page (À Propos) — instance `2115:4044` idx 2, bbox `{0,0,0,0}`, FILL/HUG, 0 copie brute |
| Ledger | `ledger/equipe.json` — **vide explicite** (`entrees: []`, 0/0), `pages:ledger:check` exit 0 |
| Preuve | `proofs/equipe/{verdict.json,verdict.md,README.md}` — 1/1 identical, sha256 before==after byte-identique (raw→adopté légitime, mécanisme expliqué) |
| Checkpoints | `003/equipe/pre-master` `2379927240486025877` · `003/equipe/pre-adoption` `2379926917866820646` · `003/equipe/adoption` `2379926269825387412` |
| Statut | master + adoption faits, **non committé** (règle du brief : construction seulement) |
