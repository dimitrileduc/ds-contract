# Rapport de clôture — 017 · Photos honnêtes

**Date** : 2026-08-06, **complété le 2026-08-07 après la fenêtre vive** · **Branche** : `017-photos-honnetes` · [spec](spec.md) · [plan](plan.md) · [décisions d'exécution](decisions.md)

017 ne gouverne pas l'image. Il répare **deux rapports qui disaient le faux** et **une phrase qui
manquait**. Ce document dit ce que les zéros couvrent exactement, et ce que la spec laisse
derrière elle.

---

## 1 · Les comptes vifs

Aucun nombre ci-dessous n'est recopié depuis un document de planning ; chacun est la sortie
imprimée d'une commande, archivée dans [`proofs/`](proofs/).

| porte | départ | clôture |
|---|---|---|
| `npm run eval` | `193/193` | **`194/194`** |
| `npm run parity` | vert, 3 acquittements | **vert, 3 acquittements** — aucune dérive nouvelle |
| `npm run extract:figma:visual -- --summary` | **rouge** (8 lignes « frontière image » de 99,43 % à 15,64 %) | **vert** — toutes les lignes à ±0,1pp de la baseline |
| `npm run photos:verify -- --selftest` | *n'existait pas* | **`5/5`** |
| `deterministic-roundtrip` · `plugin:check` · `core-browser-check` · `tsc` ×2 | verts | **verts** |

---

## 2 · SC-001 à SC-009 — ce que chaque critère couvre, exactement

### SC-001 · Une photo posée survit à une reconstruction — **TENU sans tête, DÛ au vif**

La fixture `photos-instance-overrides-preserved-check.ts` rejoue la perte du 2026-08-06 : un
maître, trois instances de page, huit empreintes distinctes. **Le passage rouge → vert est la
preuve**, archivé des deux côtés ([rouge](proofs/us1-fixture-rouge.txt),
[vert](proofs/us1-fixture-verte.txt)). Le rouge disait exactement le dégât :

```
6 empreinte(s) sur 8 n'ont pas survécu — instance 1..3, rangs 0 et 1
(les 2 du maître survivent : le sauvetage ne voyait que lui)
```

**Et le vif a confirmé le 2026-08-07** : sur le fichier client, **45 photos reposées, 0 refus**,
l'Equipe repassée de **2 images distinctes à 17** ([reçu](proofs/vif/recu-restauration.json)).
Le sans-tête faisait foi ; le vif a confirmé sans rien contredire.

### SC-002 · Les trois cas adverses font échouer le contrôle — **TENU**

Perte (refus nommant photo, hôte, rang, **aucun nœud touché**) · interversion (le comparateur
nomme **les deux** emplacements) · sans accueil (refus avant mutation ; acquittement complet →
passe **et s'imprime** ; entrée incomplète → refus **au chargement**). Plus le déterminisme.

### SC-003 · Zéro ligne conservant un score qui ne mesure rien — **TENU**

| ligne | avant | après | issue |
|---|---:|---:|---|
| `member-picture / Etat=Defaut` | 58,32 % | **0,00 %** | sous la porte |
| `product-card / ProductCard` | 15,64 % | **0,41 %** | sous la porte |
| `carte / Disposition=Categorie` | 56,34 % | **0,64 %** | sous la porte |
| `member-card / MemberCard` | 47,88 % | **1,76 %** | sous la porte |
| `carte / Disposition=Reassurance` | 64,05 % | **3,43 %** | écart **réel**, re-classé `rendering` |
| `realisation / Taille=Grand` | 99,43 % | 99,43 % | écart **réel**, re-classé `engine` |
| `realisation / Taille=Petit` | 98,98 % | 98,98 % | idem |
| `member-picture / Etat=Survol` | 58,31 % | 58,31 % | **limite nommée**, reste `image-boundary` |

Ce que SC-003 interdit est un chiffre **qui ne mesure rien**, jamais un chiffre élevé. Les quatre
lignes restantes mesurent des faits réels, chacun re-mesuré et re-classé.

### SC-004 · La pire ligne est un écart réel — **TENU, et pas comme prévu**

La pire ligne reste `realisation` à 99,43 %, et **la mesure a renversé sa cause**. Relevé REST du
set `2095:2484` : le master ne porte **aucun paint IMAGE** — root `#dfdfdf`, un seul enfant
`Image` en aplat `#d9d9d9`. Prêter une photo à notre côté aurait **créé** un écart. C'est un écart
d'aplat, dont le moteur d'écart dominant est une divergence **entre nos deux surfaces** :
l'émetteur figma pose le lavis de réservation d'une part `img`, `emit-html` ne le pose pas.

### SC-005 · 100 % des défauts révélés sont consignés — **TENU**

**7 items** dans [`registre/defauts-decouverts.json`](registre/defauts-decouverts.json), dont
**cinq découverts par l'exécution** :

| id | ce que c'est |
|---|---|
| `D-017-MOCK-FILLS-EN-PLACE` | le faux-Figma accepte la mutation en place de `node.fills`, que le vrai Figma ignore |
| `D-017-PLAN-62-SANS-DRAPEAU` | le plan de restauration de 016 n'a pas de drapeau machine « à reposer » |
| `D-017-REALISATION-PAS-UNE-FRONTIERE-IMAGE` | les deux pires lignes de la porte n'étaient pas une frontière image |
| `D-017-ASSETS-MEMBER-PICTURE-DEJA-EPINGLES` | les assets « manquants » étaient au manifeste depuis toujours |
| `D-017-MEMBER-PICTURE-SURVOL-2E-PLAN` | deux parts `img`, une seule prop d'URL — le 2ᵉ plan n'a aucune route |
| `D-017-CARTE-DEUX-PHOTOS-UNE-PROP` | deux photos distinctes par variante, une seule prop |
| `D-017-MEMBER-PICTURE-ORDRE-DES-PLANS` | le contrat **inverse** l'ordre des deux plans par rapport au master |

Le dernier mérite d'être lu : il a été découvert **parce que** prêter la photo de `normal` a fait
**empirer** l'écart (58,32 % → 60,97 %). Avec celle de `funIa` — le plan que Figma met dessus —
la ligne tombe à **0,00 %**. La remise à armes égales n'a pas seulement corrigé une mesure, elle
a révélé un fait que rien ne regardait.

### SC-006 · La clause est émise, pour les 9 et pour eux seuls — **TENU**

Relevé sur les scripts générés ([diff](proofs/us3-legendes-diff.txt)) : la clause est sur **9
composants**, ce sont exactement les porteurs de part `img` (12 parts sur 9 contrats), aucune
légende n'est multi-ligne, la dague reste en fin.

**Le compte annoncé était « 9 changent, 25 inchangées » ; le relevé dit « 10 et 24 ».** La 10ᵉ est
`ds.member-card`, dont la **version** a bumpé (patch, description ajoutée par T035) — sa légende
porte le numéro de version, elle devait bouger. Elle ne porte **aucune** clause. Écart nommé, pas
lissé.

### SC-006-vif · Le designer la lit **dans Figma** — **TENU le 2026-08-07**

*Ce critère était NON TENU à la clôture du 2026-08-06. Le pont a été débloqué le lendemain et
il a été honoré. Reçu : [`proofs/vif/recu-clause-legende.json`](proofs/vif/recu-clause-legende.json).*

**11 légendes écrites, dont 9 portant la clause** — exactement les 9 contrats à part `img`.
Vérifié au canevas après écriture : **34 légendes, 9 avec la clause, 0 multi-ligne, 0 dague mal
placée**, et **14/14 hôtes photos conformes** (l'écriture n'a touché aucune photo). Point de
restauration posé avant : `017/clause-legende/avant`.

**Le geste choisi, et pourquoi** : écriture **directe** du champ `description`, **sans reconstruire
les masters**. La clause est une chaîne de légende ; reconstruire les 9 masters trois minutes après
avoir reposé 45 photos aurait fait courir un risque réel pour rien.

**Les 2 écritures qui ne sont PAS des gains de clause**, dites plutôt que fondues dans le compte :
`ds.button` (le canevas était resté en v1.6.0 depuis 016) et `ds.member-card` (bump patch de T035).

**La limite demeure entière** : `parity/diff.ts` ne compare toujours pas les descriptions. Cette
preuve est un **relevé vif**, pas une porte — rien ne détectera une dérive future de la légende
sur le canevas.

### (2026-08-06) SC-006-vif — l'état à la clôture, conservé

**Le canevas n'a pas reçu la clause.** Elle n'y arrivera qu'au lot de régénération de la fenêtre
vive, qui n'a pas eu lieu (§4). D'ici là, un designer qui ouvre le fichier client lit **l'ancienne
légende**.

**Et aucune porte automatique ne détecte cet écart** : `parity/diff.ts` ne compare jamais le champ
`description` (son interface `FigmaSet`, `:89-96`, ne le porte pas). SC-006 et SC-006-vif sont
**deux critères distincts** ; croire le second acquis parce que l'émetteur émet, ce serait refaire
exactement le défaut que 017 répare.

### SC-007 · La doc répond seule — **TENU, ET ADOSSÉ À UN CONTRÔLE**

`docs/handoff/08-status-what-doesnt-work.md` §6 répond en trois lignes et pointe vers la matrice ;
`docs/FIGMA-CAPABILITY-MATRIX.md` §(b) porte la ligne image et son **addendum daté** (sans lui la
ligne serait incohérente : §(b) est réservée aux canaux `CARRY-CODE-ONLY` alors que la ligne 91
verdicte l'image `CARRY-BOTH` — l'absence n'était pas un oubli, elle était structurelle).

**Le point qui compte** : relevé le 2026-08-06, **aucun cas de `evals/run.ts` ne lisait `docs/`**.
La règle « aucune phrase de capacité en doc sans son eval derrière » n'était donc, côté
documentation, **tenue par rien**. `img-part-canvas-placeholder-named` est **le premier cas du
dépôt à lire `docs/`**, et il est **prouvé adverse** : un seul mot altéré dans la copie fait
tomber la suite à `193/194` avec le refus nommé ([preuve](proofs/us3-pin-doc-rouge.txt)).

### SC-008 · La porte tourne sans le fichier client — **TENU**

`photos-instance-overrides-preserved`, claim `C2-refusal`, dans `npm run eval`. Pas une extension
de `plugin:check`, dont les trois cas sont en quarantaine et qu'aucun cas actif ne lance : une
fixture que rien ne lance ne protège rien.

### SC-009 · Deux exécutions sans geste rendent le même verdict — **TENU**

Côté photos : le 4ᵉ cas de la fixture normalise les ids de nœud et compare les deux rapports.
Côté mesure : [`proofs/us2-determinisme.txt`](proofs/us2-determinisme.txt).

---

## 3 · Deux décisions d'exécution, écrites parce qu'elles s'écartent du plan

Détail complet dans [`decisions.md`](decisions.md).

**O-1 · Le repli « premier paint non réclamé » est *narrowé*, pas supprimé.** T012 disait
« supprimer ». Le supprimer sèchement **aurait perdu la photo du Hero à chaque régénération** — sa
photo est un fill de **racine** alors que le contrat modélise un enfant `Background`, et aucun
chemin exact ne les apparie. C'est le cas B d'une eval verte depuis le 2026-07-26, mesuré. Le
choix **arbitraire** disparaît ; une **bijection d'ordre** le remplace : chemin exact d'abord,
puis ordre du document, un pour un. L'interversion devient structurellement impossible, le nom de
calque ne participe plus à aucune comparaison, et un rehébergement licite (`rehebergees`) est
distingué d'une interversion (`deplacees` ⇒ **rouge**). *La lettre de T012 n'est pas tenue au mot
près ; son fond l'est.*

**O-2 · Écart à la règle F1.** Le worktree a été retiré à la demande de l'owner : les portes ne
tournent plus **en isolation**. Risque pratique faible (aucun autre chantier sur ce dépôt,
`evals/.scratch` surveillé), mais c'est un écart à une règle constitutionnelle, et il est nommé.

---

## 4 · La Phase 6 a eu lieu le 2026-08-07 — les deux blocages levés

*Cette section disait « n'a pas eu lieu » à la clôture du 2026-08-06. Le lendemain le pont a été
débloqué et la phase a tourné. Le texte d'origine est conservé plus bas, daté.*

| geste | résultat |
|---|---|
| sonde `getInstancesAsync` (T005) | **levée** — elle existe, rend **33 instances** de page, en **15 ms**, très loin du seuil de saturation |
| capture d'avant §X | [`proofs/vif/census-avant.json`](proofs/vif/census-avant.json) — 97 photos, 14 hôtes, hashes complets par position |
| restauration des photos | **45 reposées, 0 refus, 52 déjà intactes** — [reçu](proofs/vif/recu-restauration.json) |
| clause de légende au canevas (SC-006-vif) | **11 écrites, 9 avec la clause** — [reçu](proofs/vif/recu-clause-legende.json) |

**Le piège évité, et c'est le travail de la veille qui l'a rendu visible.** Le plan de 016 liste
`fun-ia` avant `normal` ; le canevas expose `normal` avant `funIa`. Un appariement **par index** —
celui que le plan suggère — **aurait interverti les 32 photos de l'Equipe**, soit exactement le
dégât que 017 existe pour empêcher. L'appariement a été fait **par carte puis par nom de calque**,
résolu localement et affiché avant d'écrire. C'est `D-017-MEMBER-PICTURE-ORDRE-DES-PLANS`,
consigné la veille, qui a servi d'alerte.

**Deux comptes du dépôt corrigés par le relevé vif.** (1) Le pont n'était pas « déconnecté » mais
**saturé** : 13 serveurs pour 10 ports, dont **3 squattés par des processus de ce dépôt** laissés
tourner depuis 016 (2× `serve-scripts.mjs`, 1× `page-parity/receiver.mjs`). Correctif durable :
`FIGMA_WS_PORT=9232` dans `.claude/settings.json`. (2) Le dépôt annonçait **62** photos perdues ;
le relevé photo-par-photo en compte **45** — l'écart est de méthode, un comptage par *ensemble*
classait une section entière comme perdue alors que ses plans `funIa` génériques étaient corrects.

### (2026-08-06) La Phase 6 n'a pas eu lieu — deux blocages, aucun levé

[`proofs/recu-vif-photos.md`](proofs/recu-vif-photos.md) · [`proofs/precondition-fr005.md`](proofs/precondition-fr005.md)

1. **La précondition FR-005 n'est pas levée** : la restauration des 62 photos appartient à 016 et
   attend le pont. Avec sa réserve, nommée : son plan liste **97** photos **sans drapeau machine**
   distinguant « déjà bonne » de « à reposer ».
2. **Le pont est saturé, pas mort** — et c'est une correction du dépôt : Figma tourne, le Desktop
   Bridge est ouvert (connexions `ESTABLISHED` sur 9223-9232), mais le serveur MCP de cette
   session n'a pas pu réserver de port (`EADDRINUSE`, dix instances concurrentes). Tuer les
   processus des autres sessions de l'owner n'est pas une décision d'agent ; **ce non-geste est
   écrit**.

`verdict: "empeche"`. **Un contrôle empêché n'est jamais un contrôle vert.**

---

## 5 · Ce que 017 laisse derrière — à ne pas croire fermé

| | état |
|---|---|
| **`DW-014-002`** | **ENTIER.** L'instrument rend `emit-html`, **jamais la surface React livrée**. 017 répare la **donnée** mesurée, pas la **surface** mesurée. Dit trois fois (REPORT.md, registre, règle de triage) parce que le risque réel est qu'on le croie fermé par la remise à armes égales |
| **La lacune A5** | **OUVERTE et NOMMÉE.** C'est une lacune de **transport** (ligne 91, colonne Bindable : `— (image content not bindable)`), **pas** un défaut de fidélité mesuré — les 99 % étaient un artefact d'instrument. La matrice cesse de confondre les deux |
| **SC-006-vif** | la clause n'atteint le canevas qu'au lot de régénération, et **aucune porte ne détecte l'écart** |
| **La sonde `getInstancesAsync`** | **DUE.** L'émetteur emprunte la voie éprouvée (registre orchestré) ; la voie API est marquée **non mesurée sur le fichier client**, à l'endroit où le code la prend |
| **`D-017-MEMBER-PICTURE-ORDRE-DES-PLANS`** et **`-SURVOL-2E-PLAN`** | deux parts `img`, une seule prop d'URL, et un ordre de plans inversé. Non réparés : toucher les props ou l'anatomie d'un contrat est hors périmètre |
| **`D-017-REALISATION-PAS-UNE-FRONTIERE-IMAGE`** | le contrat ne porte ni le `#dfdfdf` du root ni le `#d9d9d9` du plan image ; `emit-html` ne pose pas le lavis que l'émetteur figma pose. Non réparé — l'un touche une anatomie, l'autre un émetteur |
| **`D-017-MOCK-FILLS-EN-PLACE`** | le mock accepte la mutation en place de `fills` ; classe orthogonale, découverte ici, non réparée ici |
| **`D-016-REPEAT-SAMPLE-PAR-VARIANTE`**, **`D-016-SECTIONS-LOCALES-CARTES`**, **`D-016-CARTE-BOUTON`** | hors périmètre, inchangés. `D-016-CARTE-BOUTON` était attendu sous les 56,56 % de `carte / Categorie` : à **0,64 %** il n'est **pas** le résiduel dominant — re-mesuré plutôt que ré-affirmé |
| **Le 2ᵉ plan photo de MemberCard** | toujours bloqué, honnêtement |
| **Les 89 littéraux hors géométrie** | inchangés |

---

## 6 · Le trou de journal, nommé plutôt que comblé en silence

`MILESTONES.md` s'arrête à la spec **010** : les specs **011, 012, 013, 014 et 016** n'y ont
aucune entrée datée (015 en a une, déposée par-dessus le trou). L'entrée 017 est déposée de la
même façon — **par-dessus le trou, en le nommant**, plutôt qu'en faisant comme s'il n'était pas là.

---

## 7 · La fenêtre vive du 2026-08-07 — ce qu'elle a réellement changé, et ce qu'elle a découvert

*Ajouté après coup. La clôture du 2026-08-06 disait `verdict: "empeche"` sur toute la Phase 6.
Le pont a été débloqué le lendemain et elle a tourné — en révélant quatre choses que ni 016 ni
017 n'avaient vues.*

### Ce qui a changé sur le fichier client

| geste | résultat | reçu |
|---|---|---|
| sonde `getInstancesAsync` | **levée** — 33 instances, 15 ms | `proofs/sonde-getinstances.md` |
| restauration des instances de page | **45 reposées, 0 refus** | `proofs/vif/recu-restauration.json` |
| clause de légende au canevas (SC-006-vif) | **11 écrites, 9 avec la clause** | `proofs/vif/recu-clause-legende.json` |
| ordre des plans photo de MemberPicture | **corrigé sur le master**, 33 instances suivies | `proofs/vif/recu-ordre-plans.json` |
| restauration des MASTERS | **3 sur 4**, 9 autres intacts | `proofs/vif/recu-masters.json` |

### Quatre découvertes, et trois d'entre elles corrigent le dépôt

1. **Le dégât était plus large que le dépôt ne l'annonçait — sur les deux axes.** Ni « 62 photos »
   (le relevé photo-par-photo en compte **45** côté instances), ni « seulement les instances » :
   **les masters du design system avaient subi le même effondrement** — `Equipe` 17 → 2,
   `Reassurances` 13 → 1, `ProduitsECommerce` 4 → 1. Le plan de restauration de 016 ne listait
   que 14 hôtes de maquette ; les masters n'y figuraient pas.
2. **016 avait aussi inversé l'ordre des deux plans photo.** Prouvé par lecture REST à la version
   d'avant-016 : `fun-ia` y est à l'index 0 et `normal` à l'index 1, donc `normal` **dessus**.
   L'inversion faite le matin même — pour une autre raison — a restauré l'ordre d'origine.
3. **Le piège d'appariement, évité de justesse.** Le plan de 016 liste `fun-ia` avant `normal`,
   le canevas expose `normal` avant `funIa`. Un appariement **par index** — celui que le plan
   suggère — **aurait interverti les 32 photos de l'Equipe**. C'est
   `D-017-MEMBER-PICTURE-ORDRE-DES-PLANS`, consigné la veille, qui a servi d'alerte.
4. **Trois images sont définitivement purgées du fichier.** Sur `CategoriesPrincipales` :
   `getImageByHash` rend `null` et `figma.createImageAsync` **refuse les URLs S3 signées** de
   l'API Figma. Récupérées par REST à la version d'avant-016 et déposées sur le bureau pour
   repose manuelle. **La spec ne les compte pas comme restaurées.**

### La leçon de méthode, et elle est à mon compte

J'ai annoncé « Equipe : 2 images distinctes → 17 » en comptant des **hashes**. L'owner voyait la
même photo sur les 16 cartes, et il avait raison : les portraits reposés étaient sur le plan
**masqué**. Puis j'ai affirmé « c'est réparé » alors qu'il regardait un **autre nœud** — le master,
que je n'avais pas traité. Deux fois, j'ai conclu sur la donnée au lieu de regarder l'image.

**Règle qui en sort, et qui vaut plus que le correctif** : un plan correct mais masqué se compte
comme réparé et ne répare rien. Toute vérification photo doit résoudre **l'ordre z et l'opacité**,
identifier **le nœud que l'owner regarde**, et conclure sur une **capture**, jamais sur un compte
de hashes.

### Ce que la fenêtre vive laisse ouvert

- **Les 3 images purgées** de `CategoriesPrincipales` — fichiers fournis, repose manuelle.
- **Le cliché de parité n'a PAS été rafraîchi.** `parity/snapshots/figma-components.json` ignore
  les nouvelles légendes et les photos reposées : `npm run parity` compare donc le contrat à un
  canevas périmé. Il reste vert, mais sur un état qui n'est plus celui du fichier. **Dit plutôt
  que masqué par un rafraîchissement bâclé** — le geste demande une capture vive complète, qui
  est un chantier à part.
- Tout ce que la §5 listait déjà : `DW-014-002`, la lacune A5, `realisation`, le 2ᵉ plan photo.
