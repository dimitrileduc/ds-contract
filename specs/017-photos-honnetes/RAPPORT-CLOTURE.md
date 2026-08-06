# Rapport de clôture — 017 · Photos honnêtes

**Date** : 2026-08-06 · **Branche** : `017-photos-honnetes` · [spec](spec.md) · [plan](plan.md) · [décisions d'exécution](decisions.md)

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

**Ce que ce zéro NE couvre pas** : le fichier client. Le reçu vif est `empeche`
([reçu](proofs/recu-vif-photos.md)) — voir §4.

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

### SC-006-vif · Le designer la lit **dans Figma** — **NON TENU, ET C'EST DIT**

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

## 4 · La Phase 6 n'a pas eu lieu — deux blocages, aucun levé

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
