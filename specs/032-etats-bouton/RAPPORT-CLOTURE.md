# Rapport de clôture — 032, états d'interaction du Bouton gouverné

**Date** : 2026-09-04 · **Branche** : `oceanic-oak` · **Ligne de base** : `9e57c15f`

---

## 1. Ce que la vague a livré, et ce qu'elle n'a pas livré

Le canal d'états du schéma existait depuis longtemps, rendu par les trois
émetteurs, **vide sur les 39 contrats**. La vague 032 le remplit pour `ds.button`
et fait descendre le résultat jusqu'au site.

**Livré et prouvé** — le dépôt et le site :

| Fait | Preuve |
|---|---|
| 7 primitives + 35 alias `color.etat.<style>.<canal>` | `proofs/etape2/conformite-matrice.txt` |
| `ds.button` 2.1.0 → **2.2.0**, additif seul | `proofs/etape2/diff-additif.txt` |
| Les trois surfaces générées | `proofs/etape2/greps.txt` — 35 jetons, 14 `:hover`, 14 `:active`, 9 `:focus-visible` |
| **Le repos n'a pas bougé d'un pixel** | `proofs/etape2/repos-pixel.txt` — **0,0000 % sur les 7 styles** |
| Cascade Odoo alignée, six portes vertes | `proofs/etape2/portes-odoo.txt` |
| **Zéro re-pin d'émetteur** | `examples/polaris/` : 0 fichier modifié |
| Le site répond au geste | `proofs/etape3/contraste.md` |
| L'anneau clavier est visible partout | `proofs/etape3/anneau.md` — 16/16, `solid 2px` |
| Le clic souris ne l'arme pas | `proofs/etape3/anneau.md` — 16/16 `outline-style: none` |
| Zéro bloc en structure périmée | `proofs/etape3/scan-saved-versions.json` |
| Deux évaluations sorties de quarantaine, **dont une prouvée par sabotage** | `proofs/etape5/adverse.txt` |

**Le canevas Figma est synchronisé.** Les quatre gestes ont été posés, dans
l'ordre imposé par §X :

| Geste | Preuve |
|---|---|
| Photographie §X, 10 planches, juste avant la première mutation | `extract/figma/state-photo/out/snapshots/032-avant-vif.json` |
| Relevé des instances par identifiant de nœud | `proofs/T0/canvas-avant.json` — 7 variantes, **369 instances** |
| Version nommée « 032 — avant états du Bouton » | `proofs/T0/version-nommee.txt` — `versionId 2395422089842572433` |
| Marqueurs d'identité sur 2 styles de texte | `proofs/etape1/marqueurs.json` — métadonnée pure, 0 conflit |
| **42 variables** (7 primitives + 35 alias) | Primitives 193 → **200**, Semantic 83 → **118** |
| **Axe `State` sur le master `6:122`** | 7 → **28** variantes |

Contrôle d'identité, qui est le cœur de SC-003 (`proofs/etape4/instances-apres.json`) :

- le set garde son identifiant `6:122` **et sa clé** — amendement en place ;
- les **7 variantes d'origine sont renommées sur place**, mêmes identifiants,
  même parent : `6:107`, `6:123`, `6:129`, `6:135`, `9:206`, `28:114`,
  `2238:4417` ;
- **369 instances avant, 369 après**, zéro orpheline, zéro doublon ;
- **idempotence** : le même script relancé rend `skipped: true,
  reason: "unchanged"`, `createdNodeIds: []` — zéro nœud touché.

`npm run parity` → **`✔ No new drift`**, et `parity/baseline.json` est resté à
**40 entrées**. Rien n'a été acquitté pour faire passer le vert : c'est la dette
que 015 avait créée et que 016 a dû rembourser, et la vague ne la reproduit pas.

### Le transport, et l'erreur que j'ai faite avant de le trouver

Les scripts générés pèsent 65 Ko (`01-tokens.js`) et 138 Ko (`04-button.js`) —
trop pour être retranscrits dans un appel de pont. J'ai d'abord testé un `fetch`
depuis le bac à sable du plugin vers un serveur local sur le port **8799**, il a
échoué, et **j'en ai conclu à tort que le transport était impossible**.

C'était une infraction à la règle du travail antérieur : avant de déclarer
qu'une capacité manque, aller voir comment le dépôt l'a déjà résolue. L'outil
existait — `specs/016-canvas-vrai/tools/serve-scripts.mjs`, écrit exactement
pour ce besoin, et son en-tête dit même pourquoi : *« retranscrire le script
dans l'appel d'outil ouvrirait la porte à une divergence entre le fichier généré
et ce qui s'exécute réellement »*. Le bac à sable **peut** faire un `fetch`, mais
seulement vers `localhost:9223-9232`, la plage déclarée par le manifeste du
plugin. Mon test portait sur un port hors plage : c'est le test qui était faux,
pas la capacité.

Le script du Bouton a donc été exécuté **tel quel**, servi sur le port 9227.
Une seule adaptation, qui ne touche pas un octet du script : il porte un `await`
et un `return` de premier niveau, qu'`eval()` refuse — il est exécuté par un
constructeur de fonction asynchrone, qui les accepte nativement.

### La photographie §X, avant et après

Les 10 planches de maquette qui hébergent les 369 instances, photographiées
juste avant la première mutation (`032-avant-vif`) et après la pose de l'axe
(`032-apres`), diffées par identifiant de nœud :

    10 diffed, 0 not-diffed, 0 over 2%
    pire écart : 0,001 %  (Motorisation, Dépannage/SAV, Portes d'entrée, …)
    dimensions identiques sur les 10

C'est la preuve qui compte pour un designer : le master a été reconstruit de
7 à 28 variantes, et **rien n'a bougé sur les pages**. Rapport archivé :
`proofs/etape4/state-photo/032-avant-vif-vs-032-apres.md`.

### Une exception assumée sur les jetons

Les 42 variables n'ont **pas** été posées par `01-tokens.js` mais par un script
de pont reprenant sa logique **verbatim** (garde de fichier, `hexToRgb`,
préflight des styles de texte, boucles d'upsert), avec les données filtrées aux
42 feuilles que la parité signalait absentes. Raison : au moment de cette étape
je n'avais pas encore trouvé `serve-scripts.mjs`.

Le résultat est vérifié feuille par feuille sur le canevas (7 valeurs exactes,
35 alias tous en `VARIABLE_ALIAS`, zéro peinte en dur) et la parité le confirme
indépendamment. Mais l'écart est réel et il est écrit ici plutôt que dissimulé : le
chemin canonique était `serve-scripts.mjs`, et il aurait dû être employé pour
les deux.

## 2. Ce qui a été tranché, en toutes lettres

### 2.1 La lecture littérale de l'exigence de contraste, rejetée — et pourquoi

FR-019 dit qu'un état ne doit jamais être moins lisible que le repos. Lu à la
lettre comme un plancher AA absolu, il **refusait la palette que l'owner avait
lui-même validée, sur 5 styles sur 7** : tous partent d'un repos à 14,76 et
descendent en s'assombrissant, ce qui est le dessin voulu.

La lecture retenue, arbitrée le 2026-09-04 : **plancher AA 4,5 pour les six
styles conformes** — le minimum mesuré est **8,50** — **plus une clause de
non-régression** pour le style `orange`, déjà sous AA au repos.

### 2.2 Le défaut de contraste de l'Orange : consigné, NON corrigé

`orange` est à **2,42** au repos, sous le minimum de 4,5. L'owner a décidé de ne
pas le corriger, et l'a réaffirmé. La vague n'a donc **pas le droit d'aggraver ce
qu'elle n'a pas le droit de réparer** : ses états vont en croissant,
**2,42 → 2,98 → 3,74**.

**Limite de cette preuve, à ne pas surestimer** : `orange` n'est posé sur **aucun
bouton de la home**. Ces trois chiffres restent une prévision de la matrice, pas
un relevé. Les six autres styles, eux, sont mesurés sur la page vive.

### 2.3 L'exception FR-011 / SC-004, lue dans le périmètre du Bouton

La spec exige « aucune règle d'état écrite à la main » **et** met explicitement
hors périmètre le survol manuel des icônes sociales du pied de page. Les deux
phrases ne peuvent pas être vraies ensemble sur tout le dépôt.

Lecture retenue : **dans le périmètre de `ds.button`**. La règle survivante
(`odoo-bridge.css`, règle (2) de `ODOO-023-FOOTER-BRIDGE`) porte `opacity`, qui
n'est pas un canal d'état de part — l'élargir serait une modification d'émetteur.
Elle est nommée, pas supprimée : `DW-032-002`.

### 2.4 L'entorse à §VIII, écrite là où on la lira

Les cinq teintes validées ont été **calculées puis posées** par l'owner ; le
relevé de la planche est postérieur au calcul. Ce n'est pas un fait préexistant
du fichier, c'est une décision de couleur.

L'entorse est écrite **dans la `$description` de chacune des sept primitives**,
pas dans une note de bas de page — c'est là que quelqu'un la lira au moment où
elle compte.

### 2.5 L'écart de compte des cases d'état

La spec citait une sonde à deux états, d'où un compte attendu de 14 cases.
Avec `focus-visible`, il en faut **21**. **Vérifié sur le canevas** : le master
est passé de 7 à **28** variantes — 7 renommées en place, 21 créées.

Deuxième écart de compte, du même genre : la spec annonçait **~354 instances**
rattachées au master. Le relevé vif en compte **369**. C'est le relevé qui fait
foi, et il est conservé (`proofs/T0/canvas-avant.json`).

---

## 3. Ce que la vague a trouvé et qui n'était pas au plan

### 3.1 Le CTA du pied de page devenait invisible au survol

**Prédit** par arithmétique de spécificité avant qu'une ligne soit écrite, puis
**mesuré** sur la page vive : au survol, le fond du CTA passait au blanc pendant
que son libellé restait blanc. **Contraste 1,00, libellé effacé** — précisément
ce que la clause de non-régression interdit.

La règle gagnante, nommée par `el.matches()` sur `document.styleSheets` :
`.footer[data-pqr-shell="footer"] a.button` (**0,3,1**) battait le sélecteur
d'état émis `.button--variant-outlineBlanc:hover:not(:disabled)` (**0,3,0**).

**Ce que la prédiction n'avait pas vu** : un **second** prétendant existe à la
même spécificité, `.o_footer a:not(.btn):hover`, venu d'Odoo. Neutraliser
simplement la règle du pont pendant les états n'aurait donc pas suffi — Odoo
aurait repris la main avec une couleur non gouvernée. Le correctif devait battre
les deux.

Correctif : règle (6) de la même zone, à **0,5,1**, qui reprend le canal du
contrat **par la variable de jeton, jamais par une valeur littérale**, sur les
sept styles — un seul est posé dans le pied aujourd'hui, mais aucune porte ne
surveille ce conflit et un changement de style ferait revenir le défaut en
silence. Après correctif : **14,76 / 14,76 / 11,18**, les valeurs exactes de la
matrice. Reçu : `proofs/etape3/conflit-bootstrap.md`.

### 3.2 Trois erreurs du plan, corrigées à l'exécution

1. **L'ordre de la cascade Odoo était faux.** Le plan plaçait l'alignement des
   épingles de version *après* le build. Or `odoo:derivation` est **à l'intérieur**
   de `npm run build` et refuse tant que les épingles pointent l'ancienne version
   — **528 violations**. L'ordre correct est : épingles → build → preuves.
2. **Le compte d'épingles était faux : 264, pas 253.** La répartition par fichier
   du plan est exacte (55, 55, 22, 22, 22, puis 11×8) mais elle **somme à 264**.
   Erreur d'addition dans la prose.
3. **`npm run odoo:save` vise l'instance de l'OWNER par défaut**, et `PQR_PROJECT`
   n'a aucun effet sur ce script — il attend `--project`. Lancé tel que la tâche
   le formulait, il a sauvegardé la base de l'owner et écrasé deux fichiers suivis
   du dépôt. **L'instance de l'owner n'a pas été modifiée** — le script ne fait que
   lire (`pg_dump` + `tar`) — et les deux fichiers ont été rendus à leur état
   committé. Détail : `proofs/etape3/scan-saved-versions.md`.

### 3.3 L'affirmation L5 de la spec était fausse

La spec affirmait que les six glyphes sans `currentColor` ne sont portés par
aucun bouton. **Faux** : `star` et `octicon-chevron-down12` sont dans l'énuméré
`iconLeftGlyph`/`iconRightGlyph` de `ds.button`.

Le risque reste borné — les 13 fichiers d'édition classent **toutes** les
décisions de glyphe en `not-editable` ou `fixed-by-composition`, donc aucun
éditeur de site ne peut les choisir. Mais un développeur le peut à la
composition, et rien ne le vérifie. L5 est réécrite juste, dans la `description`
des deux glyphes concernés. Registre : `DW-032-004`.

### 3.4 Un piège d'instrument qui aurait donné un faux négatif

Chromium n'arme `:focus-visible` que si la dernière interaction était au
**clavier**. Un `.focus()` posé juste après un geste souris hérite de la modalité
pointeur et ne peint **aucun** anneau. La première version de l'instrument de
mesure faisait exactement cela et aurait conclu que le focus ne marchait pas. La
mesure repasse en modalité clavier par une frappe réelle avant chaque relevé.

---

### 3.5 Deux erreurs de méthode que j'ai faites, écrites plutôt que tues

**J'ai déclaré une incapacité sans vérifier le travail antérieur.** Le transport
des scripts générés vers le canevas a été annoncé impossible après UN test raté
sur un port hors de la plage autorisée par le manifeste du plugin
(`9223-9232`). L'outil existait depuis la vague 016 —
`specs/016-canvas-vrai/tools/serve-scripts.mjs` — et son en-tête explique
exactement le besoin. La règle du dépôt est claire : avant de conclure « le
moteur ne peut pas », aller chercher comment il l'a déjà fait. Le coût : un
aller-retour inutile avec l'owner, qui a eu raison d'insister.

**J'ai lancé deux balayages de clôture en parallèle sur le même fichier de
sortie.** Le premier, antérieur à la synchronisation du canevas, s'est terminé
APRÈS le second et a écrasé son résultat. J'ai d'abord lu ce résultat périmé
comme un vrai échec de parité, avant de comprendre en comparant les
horodatages. Un instrument dont deux exécutions écrivent la même cible n'est pas
un instrument : le balayage final a été rejoué seul, après nettoyage.

## 4. Les évaluations : deux restaurées, une prouvée par sabotage

L'exigence était **au moins une** évaluation sortie de quarantaine. La vague en
sort **deux** :

- **`focus-not-pressed-browser-probe`** — prouve dans un vrai Chromium que
  l'arrivée au clavier peint l'anneau **sans** peindre le fond de survol.
  Repointée de la famille de jetons de la démo vers Piqueray ; sa référence au
  fichier de mode sombre a été retirée (Piqueray est mono-mode, le fichier
  n'existe pas — c'est ce qui l'a fait échouer au premier essai).
- **`refuse-hollow-state-previews`** — garde `figmaStatePreviews` honnête : refuse
  **par nom** des previews sans états, et un état sans surcharge de jeton.

**Le contrôle adverse, non négociable, a été fait** (`proofs/etape5/adverse.txt`) :

| sabotage | attendu | obtenu |
|---|---|---|
| retirer `focus-visible` de `contract.states` | ROUGE | ROUGE, par nom |
| faire porter au `:focus-visible` le fond de survol | ROUGE | ROUGE, avec les couleurs mesurées |
| restauration du contrat sain | VERT | VERT |

`evals/REMOVED-CASES.md` porte la sortie de quarantaine, datée, avec une section
« Revivals » — la quarantaine n'est jamais silencieuse.

---

## 4bis. Le balayage de clôture (T057)

Rejoué en entier après la synchronisation du canevas, sur un arbre propre, une
seule exécution (`proofs/cloture/gates.txt`) :

    21 portes / 21 vertes

    build · parity · plugin:check · deterministic-roundtrip · core-browser-check
    tsc --noEmit · tsc -p tsconfig.build.json
    odoo:inputs:check · odoo:authoring:check · odoo:module:check
    odoo:derivation:check · odoo:figma-links:check · odoo:typecheck
    eval · geometry:gate · mint:check · mint:code:check · verify:catalog
    polaris re-pin (zéro) · git status

    npm run eval        : 248 / 248        (ligne de base : 245 / 245)
    quarantaine         : 48 → 46
    parity/baseline.json: 40 entrées       (inchangé — aucun acquittement neuf)
    examples/polaris/   : 0 fichier modifié (aucun émetteur touché)

Comparé à la ligne de base de `proofs/T0/gates.txt` : **toutes les portes qui
étaient vertes le sont restées**, et le compte d'évaluations a monté de 2 — les
deux cas sortis de quarantaine. SC-005 exigeait au moins +1.

## 4ter. La revue de nettoyage, et ce qu'elle a corrigé de ce rapport

Quatre revues indépendantes (réutilisation, simplification, efficacité,
altitude) ont été passées sur le code écrit à la main. Elles ont produit un
constat qui **corrige ce rapport** et trois qui corrigent la vague.

**Le report de `DW-032-007` était injustifié.** Ce rapport écrivait que poser un
refus sur les alias primitifs sortait du périmètre « aucun émetteur re-pinné ».
Faux, vérifié par exécution : les trois boucles sœurs de la même fonction
(`brand`, `semantic`, `modes`) refusent déjà le cas MIROIR par nom
(« must be an alias »), `aliasTarget` y est déjà importé, et
`examples/polaris/generate.ts:112` résout ses alias AVANT d'alimenter le créneau
primitif — le refus ne s'y déclenche jamais. Après pose : sortie générée
**byte-identique**, `examples/polaris/` **0 fichier modifié**. L'entrée passe à
`resolved`, et le trou est gardé par un cas C2 avec contrôle négatif.

Trois défauts d'honnêteté dans le travail de la vague, corrigés :

1. **La sonde du contrôle adverse était une COPIE de celle du cas d'éval** —
   déjà divergente d'une ligne. Un contrôle adverse qui sabote une copie reste
   VERT quand la vraie sonde change : exactement la classe de défaut qu'il
   existe pour interdire. Source unique désormais
   (`evals/probes/focus-not-pressed.ts`), importée des deux côtés.
2. **`tools/mesure-etats.mts` écrivait un reçu VIDE sur une page d'erreur.**
   Sans contrôle du statut HTTP, une 404 rendait « 0 boutons mesurés » et une
   sortie à 0 — un reçu vide se lit comme une mesure. Refus posé sur le patron
   de `capture-odoo.mts:45-68`, et testé : `répond HTTP 404 — refus de mesurer
   une page d'erreur`.
3. **Deux des sept primitives se contredisaient dans leur `$description`** —
   « POSÉE PAR LA SPEC, NON RELEVÉE » suivi de « Relevée le 2026-09-04 […] par
   l'owner ». Le gabarit de l'entorse §VIII avait été préfixé au lieu d'être
   écrit. C'est l'endroit exact où §2.4 de ce rapport fonde son honnêteté.
   Réécrites.

Deux causes ont aussi été ajoutées au registre, qui n'y étaient pas :
`DW-032-008` (les sélecteurs d'état sortent à (0,3,0) — aucun crochet ne résiste
à une enveloppe d'hôte ; distinct de la porte manquante de `DW-032-003`) et
`DW-032-009` (la liste des 7 styles est écrite deux fois).

Enfin, un gaspillage causé par la vague : le cache de photographie
(376 Mo, gitignoré, lu par **zéro** éval) n'était pas dans les exclusions de
l'espace de travail copié — soit ~93 Go recopiés par exécution de `npm run eval`.
Une ligne dans `evals/harness.ts`.

**Vérifié après refactor** : les 7 PNG du repos sont **bit-à-bit identiques**,
la mesure sur page vive rend le même relevé, et le contrôle adverse repasse — en
sabotant désormais la vraie sonde.

## 5. Ce que la vague laisse derrière elle

Six entrées au registre `registre/travail-differe.json`, chacune avec sa raison :

| id | sujet | pourquoi reporté |
|---|---|---|
| `DW-032-001` (L4) | garde `@media (hover: hover)` | modification d'émetteur, 39 contrats |
| `DW-032-002` (L6) | survol manuel des icônes sociales | `opacity` hors des canaux d'état de part |
| `DW-032-003` | **aucune porte ne surveille la cascade CSS d'Odoo** | instrument à construire |
| `DW-032-004` (L5) | six glyphes sans `currentColor` | non atteignables par un éditeur |
| `DW-032-005` | enveloppe de section sans attributs de version | pré-existant, prouvé |
| `DW-032-006` | deux évaluations d'états encore en quarantaine | écrites contre le Bouton de la démo |

`DW-032-003` est le plus important des six : **le défaut du pied de page n'a été
vu que parce qu'une mesure manuelle a été faite.** `parity` ne rend aucune page
Odoo et ne connaît pas sa cascade. Le point de départ d'un futur instrument
existe : `tools/mesure-etats.mts`.

Trois limites sont écrites **là où la capacité est annoncée**, dans
`docs/FIGMA-CAPABILITY-MATRIX.md`, à la ligne même qui revendique les previews
d'états : L1 (pas de variation par valeur d'énuméré — d'où le repli couleur pour
`link`), L2 (aucune réaction de prototype, et un ajout manuel est effacé au sync
suivant), L3 (`outline-offset` non porté au canevas).

---

## 6. L'état exact à la remise

**Les trois histoires sont livrées et vérifiables séparément.**

- **US1** — le site répond au geste : survol et pressé sur les six styles
  présents sur la home, contrastes mesurés conformes au registre au centième.
- **US2** — le focus clavier est visible partout (16/16, `solid 2px`), et ne
  s'arme jamais au clic souris (16/16 `outline-style: none`). Une évaluation
  adversariale tient la promesse.
- **US3** — le designer lit la grille dans le master : 7 styles × 4 états, sans
  qu'aucune instance ait bougé.

### Ce qu'il faut savoir avant de reprendre ce travail

1. **Un alias dans la couche `primitives` peint des variables NaN sur le
   canevas, en silence.** Trouvé en lisant le code avant de l'exécuter, jamais
   refusé par aucune porte. `DW-032-007`, et c'est le legs le plus dangereux de
   cette vague.
2. **Aucune porte ne surveille la cascade CSS d'Odoo.** Le défaut du pied de
   page n'a été vu que par une mesure manuelle. `DW-032-003`.
3. **`npm run odoo:save` vise l'instance de l'OWNER par défaut**, et
   `PQR_PROJECT` n'a aucun effet sur lui. Toujours passer `--project`.
4. **`odoo:derivation` vit à l'intérieur de `npm run build`** : les épingles de
   version doivent être alignées AVANT le build, pas après.
5. **Le transport des scripts générés vers le canevas passe par
   `specs/016-canvas-vrai/tools/serve-scripts.mjs`**, sur un port de la plage
   `9223-9232` — hors de cette plage le bac à sable du plugin ne peut rien
   atteindre, et l'échec ressemble à une incapacité alors qu'il n'est qu'un
   mauvais port.
