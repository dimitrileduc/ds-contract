# Recherche — Mesure juste et triage complet (014)

**Date** : 2026-08-03 · **Branche** : `014-mesure-juste-triage` · **Spec** : [spec.md](./spec.md)

Toutes les valeurs ci-dessous sont relevées dans le dépôt à la tête de branche
(`f06f942`). Chaque relevé cite son fichier et sa ligne : ce document est une
lecture, pas une déduction.

---

## 0. Ce que la lecture du dépôt établit (avant toute décision)

### 0.1 Les deux instruments et leur population

| instrument | entrée | sujets | lignes publiées | rapport |
|---|---|---:|---:|---|
| parité visuelle | `extract/figma/visual-parity/subjects.ts` (`PARITY_SUBJECTS`) | 22 | 36 diffées + 3 non diffées | `extract/figma/visual-parity/REPORT.md` |
| audit d'organismes (013) | `specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json` | 12 | 12 dossiers | `specs/013-…/proofs/REPORT.md` |

**Couverture 33/34 vérifiée par recomptage**, pas reprise de la spec :
les 34 fichiers `contracts/*.contract.json` portent 34 identifiants ; la parité
visuelle en couvre 21 distincts (`ds.button` sert deux sujets, `button` et
`button-with-icons`), l'audit d'organismes 12, sans recouvrement. 21 + 12 = 33.
**Le seul contrat sans ligne est `ds.select`.** SC-001 est donc exact.

### 0.2 Le défaut DW-006, localisé à la ligne près

`extract/figma/organism-audit/pilot.ts` photographie `subject.figmaSetNodeId`
et **tout** ce qui sert la comparaison en dérive :

| dérivée (FR-001) | ligne | ce qui est employé aujourd'hui |
|---|---|---|
| capture photographiée | `pilot.ts:234-241` | `fetchNodePngs(…, subject.figmaSetNodeId, …)` |
| valeurs du node lues | `pilot.ts:223-232` | cache `nodes-<fileKey>-<setNodeId>.json` → `document` |
| largeur imposée au code | `pilot.ts:291-294` | `document.absoluteBoundingBox.width` (donc celle du set) |
| cadre d'alignement/recadrage | `pilot.ts:302-308` | `rootInReferenceRenderBounds(document.absoluteBoundingBox, …)` |
| provenance citée dans les reçus | `pilot.ts:505` | `` `${subject.figmaSetNodeId}#${channel}` `` |

Le node du cas existe déjà dans le manifeste (`cases[].figmaNodeId`) et n'est
utilisé qu'à un seul endroit : `pilot.ts:614`, pour l'écrire dans
`metadata.json`. **Il est enregistré, jamais employé.**

Relevé des 12 organismes du manifeste : `figmaSetNodeId === cases[0].figmaNodeId`
pour les 8 organismes ayant un cas, **sauf reassurances** (set `2114:3721`,
cas `2114:3619`). Les trois organismes de la vague 3 n'ont aucun cas. C'est la
confirmation mesurée de l'edge case « les huit autres ne bougent pas ».

Le reçu du défaut, dans
`specs/013-…/proofs/organisms/reassurances/cases/reassurances-disposition-4-cartes/metadata.json` :
`figma.width×height = 3104×4902` (trois variantes empilées, ×2) contre
`geometry.generatedRoot = 3100×1462` — un `deltaPx.height` de **−3440**.
`pixels.rawPct = 39.78437291157622`.

> **Distinction à ne pas manquer.** `run.ts:199` vérifie que
> `contract.anchors.figma.nodeId === subject.figmaSetNodeId`. Cette vérification
> porte sur l'**ancre du contrat**, qui pointe légitimement le set. La correction
> ne consiste donc pas à remplacer `figmaSetNodeId` partout : le set reste
> l'ancre, le **cas** devient la référence de mesure.

### 0.3 Les quatre lignes UNTRIAGED et le seuil de 3 %

`extract/figma/visual-parity/run.ts:122` — `const TRIAGE_LINE_PCT = 3.0;` ;
`run.ts:2258-2261` — `causeCell()` n'imprime `**UNTRIAGED**` qu'au-dessus de ce
seuil, et `—` en dessous. C'est exactement la dispense que FR-015 supprime.

Effet mesuré de la suppression, par recomptage du rapport courant : **13 lignes
aujourd'hui à `—`** (footer-column 2,77 % · section-header Standard 1,91 % ·
avantage 1,81 % · review-card 1,68 % · nav-item 1,25 % · carousel-controls
0,41 % · input 0,17 % · accordion-row ×4 · textarea 0,06 % · copyright 0,00 %)
devront porter une cause, en plus des 4 UNTRIAGED. C'est le volume réel de US2.

### 0.4 L'exclusion de select n'est pas du code

`subjects.ts:236-247` : l'exclusion est un **bloc de commentaire**, il n'existe
aucune entrée `select` dans `PARITY_SUBJECTS`. La prémisse écrite est « a native
`<select>` does NOT render its selected-option TEXT in headless Chromium ». La
retirer = ajouter une entrée + remplacer le commentaire par le reçu de son
infirmation. Le master est ancré dans le contrat :
`contracts/select.contract.json` → `anchors.figma.nodeId = 2053:1249`.

### 0.5 Deux autres décisions qui retirent une mesure (FR-012 s'y applique aussi)

La rubrique « Not diffed (named, never dropped) » du rapport en porte deux, que
la spec ne nomme pas mais que FR-012 couvre par définition :

| ligne | statut | cause affirmée |
|---|---|---|
| `button-with-icons :: Property 1=Outilne noir` | skipped | « axis has no contract binding » |
| `piqueray-logo :: Couleur=Default, Couleur=Blanc` | refused | « part "Marque" needs vector asset … which does not exist » |

Ce sont des causes affirmées qui retirent une mesure : elles entrent dans le
périmètre de re-test de US5 au même titre que l'exclusion de select.

### 0.6 Le navigateur de mesure dérive en silence

`extract/figma/visual-parity/render.ts:455-499` — `chromiumExecutable()` trie les
répertoires `chromium-<révision>` du cache Playwright et **prend le plus élevé**,
avec repli sur le Chrome système (qui s'auto-met à jour). Le cache local contient
aujourd'hui **quatre révisions** (1217, 1223, 1228, 1234) et
`/Applications/Google Chrome.app` existe. Aucun reçu n'enregistre laquelle a
produit une mesure. C'est la faille que FR-014 ferme, et la raison pour laquelle
FR-009 impose une **re-mesure** de l'état initial plutôt que la relecture des
chiffres commités.

### 0.7 Le gate permanent est périmé et ne couvre presque rien

`extract/figma/visual-parity/baseline.json` : écrit le 2026-07-26 au commit
`82c3f29a`, épinglé sur la version Figma `2380472820518738371` (la campagne 013
tourne sur `2381581871281042338`), **7 sujets et 13 lignes**, dont 8 `skipped`,
1 `figma-declined` et **4 réellement diffées**. Le rapport publie 36 lignes
diffées sur 22 sujets.

Conséquence directe pour 014 : `-- --summary` ne peut pas servir d'état
« avant ». La comparaison avant/après doit venir d'une re-mesure complète, ce que
FR-009 exige déjà. Le décalage est ici **nommé**, pas contourné.

### 0.8 Trois règles de triage sont mortes

`triage.ts` porte **25 règles** (recomptées, pas estimées) nommant 17 sujets.
Trois d'entre elles — `heading`, `switch`, `badge` — visent des contrats
**supprimés à la reconversion Piqueray** : aucun n'existe dans `contracts/`,
aucun n'est sujet de parité (ni `PARITY_SUBJECTS`, ni `LEGACY_SUBJECTS`). Elles
ne peuvent donc jamais s'appliquer.

Elles sont publiées comme telles au re-classement — une cause qui ne peut plus
rien causer est une donnée, pas un déchet. Leur retrait éventuel est une décision
explicite, jamais un effet de bord.

### 0.9 Un écart entre la spec et le rapport, signalé et non absorbé

SC-002 écrivait « sur les 63 lignes du rapport ». Le rapport courant en porte
**39** (36 diffées + 3 non diffées), et son bloc Distribution l'imprime :
`diffed: 36 · skipped/refused/declined: 3`. L'ajout de `select` n'en ajoute
qu'une.

Aucun chiffre n'est recopié : le contrôle de clôture **compte en direct** et
publie le compte obtenu, conformément à la règle du dépôt (« la sortie vive est
la seule autorité, jamais un compte figé en prose »).

> **Résolu depuis** (analyse croisée du 2026-08-03) : plutôt que de publier
> l'écart, SC-002 a été corrigé à la source — il ne cite plus de nombre de
> lignes. Un compte figé dans un document vivant est un défaut, y compris quand
> il est nommé ailleurs : la spec est ce que 015 lira.

---

## 1. Décisions

### D1 — Vocabulaire à six valeurs : l'énumération de l'instrument devient le vocabulaire publié

**Décision.** `CauseClass` (`triage.ts:32`) passe de cinq à six valeurs, en
slugs stables, et chaque slug porte un libellé français publié. La
correspondance est **bijective** et vérifiée par le contrôle de clôture.

| libellé publié (spec) | slug instrument | origine |
|---|---|---|
| géométrie du contrat | `contract-geometry` | **nouveau** |
| frontière image (limite A5) | `image-boundary` | ex-`capture-gap` (règles A5) |
| rendu/rastérisation | `rendering` | ex-`renderer` |
| défaut moteur | `engine` | inchangé |
| défaut d'instrument | `instrument` | ex-`harness` + ex-`capture-gap` (limites de canal) |
| défaut de source Figma | `figma-source` | ex-`design` |

**Justification.** La clarification de la spec dit « la valeur déjà déclarée
côté instrument et jamais employée » : le relevé le confirme — `design` est
déclaré dans l'union (`triage.ts:32`) et documenté (« the FIGMA side draws
something else ») mais **aucune des 25 règles ne l'emploie**. C'est bien lui.

Le seul point non trivial est `capture-gap`, qui recouvre aujourd'hui deux
choses : la frontière image A5 (member-card, product-card, realisation) et les
limites du canal de capture (géométrie VECTOR absente d'un dump, `lineHeight`
non porté, enfants réduits à des stubs — toutes sur des sujets `LEGACY_SUBJECTS`
mis en quarantaine, donc jamais exécutés par le gate vivant). La coupe suit le
sens : la frontière image va sur `image-boundary`, les limites du canal sur
`instrument` — un canal qui ne peut pas transporter un fait est un défaut de
l'instrument de mesure, pas de la géométrie, ni du moteur, ni de la source. Ces
règles de quarantaine sont re-classées **avec une note d'une ligne**, jamais
supprimées.

**Alternatives écartées.**
- *Garder les cinq slugs et publier une table de correspondance à six.* Rejetée :
  FR-004 exige une correspondance « valeur pour valeur » dans les deux sens ;
  une valeur publiée sans classe d'instrument est précisément l'état refusé.
- *Nommer les slugs en français.* Rejetée : `visual-parity/` est commenté en
  anglais de bout en bout ; le libellé français vit dans la table de publication,
  qui est le lieu que FR-004 rend vérifiable.

### D2 — La référence de cas est calculée par une fonction pure, et son emploi est reçu

**Décision.** Introduire dans `organism-audit/` une fonction pure
`resolveCaseReference(subject, case)` qui rend le node id de référence — le node
du cas — et faire écrire au pilote un bloc `referenceProvenance` nommant, pour
**chacune des cinq dérivées de FR-001**, le node effectivement employé. Le
contrôle refuse si l'une d'elles cite autre chose que le node du cas.

**Justification.** FR-002 exige que la vérification « couvre chaque dérivée
nommée en FR-001, pas seulement la capture ». Un contrôle qui ne regarderait que
le PNG laisserait passer une largeur imposée ou un cadre d'alignement pris sur le
set — c'est-à-dire la moitié du défaut. Un reçu par dérivée rend la propriété
observable, donc testable par une fixture de données pure, sans Chromium ni
Figma — la forme qu'ont déjà `visual-parity/gate.ts` et
`organism-audit/campaign.ts`, tous deux couverts par une fixture d'eval.

**Alternative écartée.** *Comparer a posteriori les dimensions du PNG à celles du
node du cas.* Rejetée : c'est un symptôme, pas la propriété. Un set dont la
variante unique aurait la même taille passerait le contrôle en photographiant
quand même le mauvais node.

### D3 — La fixture rouge précède la correction, et porte sur l'état défectueux reconstitué

**Décision.** La fixture d'eval est **data-only** : elle construit un
`referenceProvenance` reproduisant l'état antérieur (capture = set, largeur =
set, cadre = set, provenance = set, valeurs de faits = set) et exige un refus
nommé ; puis un second cas avec les cinq dérivées sur le node du cas et exige un
accord. Elle est écrite et **rouge avant** la correction du pilote.

**Justification.** Constitution §II — fixture → eval → claim, dans cet ordre.
Reconstituer l'état défectueux en données (plutôt que de faire tourner l'ancien
pilote) garde la fixture déterministe et exécutable pour toujours, y compris
après la correction : c'est ce que FR-002 demande par « conservée après (elle
empêche la réintroduction) ».

### D4 — Ce que la correction DW-006 touche, et ce qu'elle ne touche pas

**Décision.** Bascule sur le node du cas : le PNG (`pilot.ts:234-241`), le node
lu (`:223-232`), `rootWidthCss` (`:291-294`), `rootInReferenceRenderBounds`
(`:302-308`), la provenance des jambes Figma (`:505`). **Restent sur le set** :
la vérification d'ancre du contrat (`run.ts:199`) et le contrôle de version de
fichier (`pilot.ts:211-222`), qui sont des propriétés du set, pas de la mesure.

Les **44 faits épinglés** de reassurances sont re-relevés sur `2114:3619` avec
les outils de census existants (`tools/fetch-census.mts`,
`tools/verify-declarations.mts`), et le manifeste `audit-campaign.json` est mis à
jour si besoin. Le manifeste n'est ni un contrat, ni un token, ni une sortie
générée, ni la source Figma : l'éditer ne viole pas SC-005.

> **Raffinement, à l'implémentation (2026-08-03).** « Suivre la même bascule »
> était trop simple pour le contrôle d'existence de `verify-declarations.mts`.
> La cible affichée et la version vérifiée basculent bien sur le cas, mais
> l'existence d'un node cité se recoupe contre l'**union cas ∪ set** — et
> `fetch-census.mts` cache donc les deux. Raison : certains faits référencent
> légitimement un node hors du cas, soit parce qu'ils documentent le
> COMPONENT_SET lui-même (`reassurances.property.disposition-*`), soit parce
> qu'ils comparent délibérément une variante sœur (`carte-largeur-cinq-cartes`,
> `sample-entree-orpheline`). Le cas étant un sous-arbre du set, l'union
> n'admet jamais une hallucination que le cas seul aurait rejetée — elle évite
> seulement de rejeter des faits réels. La classe d'erreur que ce contrôle
> existe pour attraper est **un node qui n'existe pas dans le fichier**, pas un
> node réel hors du cas mesuré.

> **Constat mesuré (2026-08-03).** Le re-relevé sur le node du cas n'a changé
> **aucun** `figmaExpectation` et **aucun** compte de faits (30 prouvés / 10
> divergents / 4 limités / 0 non-prouvé, à l'identique). La clarification de la
> spec autorisait leur variation ; elle n'a pas eu lieu — les faits portent sur
> les parts du cas, que le census les atteigne par le set ou par le cas. Le
> manifeste est donc resté inchangé. Le chiffre pixel, lui, passe de 39,78437 %
> à **3,29889 %**, contre une valeur de contrôle consignée de ~3,30 %.

**Conséquence assumée et publiée.** Les comptes de faits de reassurances peuvent
varier ; le registre avant/après l'attribue à la correction d'instrument, comme
la clarification de la spec l'a arrêté.

### D5 — L'état « avant » est une re-mesure T0, prise avant toute autre écriture

**Décision.** Premier acte d'implémentation : exécuter les deux instruments
**sans aucune modification** et figer chaque chiffre publié dans
`proofs/registre/avant.json`, avec la révision de navigateur. Comparer ensuite à
ce que le dépôt publie déjà (REPORT.md de parité, `proofs/result.json` de 013) et
publier l'écart **avant tout autre travail**.

**Justification.** FR-009 l'exige mot pour mot, et §0.6/§0.7 montrent pourquoi :
le navigateur n'est pas épinglé et le baseline commité ne couvre que 4 lignes
mesurées sur 36. Sans re-mesure, « avant » serait un chiffre dont personne ne
connaît les conditions de production.

**Alternative écartée.** *Prendre `baseline.json` comme « avant ».* Rejetée
sur relevé : 7 sujets, 13 lignes, version Figma périmée.

### D6 — La révision du navigateur entre dans les reçus des deux instruments

**Décision.** Enregistrer, à chaque capture, `browser.version()` de
`playwright-core` **et** le chemin de l'exécutable résolu par
`chromiumExecutable()`. Les deux points de lancement sont
`visual-parity/render.ts:501-503` (`launchBrowser`, partagé) et son emploi par
`organism-audit/harness.ts:619`.

**Justification.** FR-014 : « une cause qui met le navigateur en accusation sans
dire lequel n'est pas un reçu ». Le chemin est enregistré en plus de la version
parce que §0.6 montre que la résolution peut tomber sur le Chrome système, qui
n'a ni révision épinglée ni stabilité.

### D7 — Le contrôle de clôture est un instrument permanent, évaluateur pur + CLI mince

**Décision.** `extract/figma/measure-gate/` : `gate.ts` pur (aucun `node:*`
d'effet, aucune capture) qui évalue les quatre conditions de FR-007, `run.ts`
CLI qui lit les artefacts et applique le code de sortie, script npm
`measure:gate`, et une fixture d'eval data-only.

Les quatre conditions, telles que FR-007 les pose :
1. zéro ligne mesurée sans cause (population : toute ligne divergente des deux
   instruments) ;
2. tout composant généré porte une ligne de mesure (34/34) ;
3. tout chiffre publié repose sur le node de son cas (les cinq dérivées de D2) ;
4. toute cause publiée porte un reçu re-testé et daté.

**Justification.** C'est la forme déjà éprouvée deux fois dans le dépôt
(`visual-parity/gate.ts`, `organism-audit/campaign.ts`) : une politique pure que
l'eval peut exercer sans réseau ni navigateur, et un CLI qui n'a que la
plomberie. FR-002 demande une vérification **conservée** ; un outil jetable dans
`specs/` ne serait pas conservé.

### D8 — Définition opérationnelle de « ligne divergente » (population de FR-015)

**Décision.** Une ligne est divergente **si et seulement si son score brut
autoritaire est strictement supérieur à 0**. Le contrôle lit le nombre, jamais
la chaîne formatée à deux décimales (une ligne affichée `0.00%` peut valoir
0,004 %). Une ligne exactement à 0 ne porte aucune cause, et ce n'est pas une
dispense : il n'y a rien à causer.

**Justification.** FR-015 supprime le seuil de 3 % « quelle que soit son
amplitude ». Toute autre borne réintroduirait un seuil sous un autre nom.
L'effet mesuré est chiffré en §0.3 : 13 lignes supplémentaires à causer.

**Précision de périmètre, littérale dans FR-015.** Cette règle ne touche **que**
l'obligation de causer. Les seuils de réussite/échec (`THRESHOLD_PCT`,
`acceptance.maxRawDiffPct = 2,5`), les régions déclarées et les critères de
preuve restent intacts — l'hypothèse « critères 011/013 non assouplis » est
tenue.

### D9 — Le re-test des causes héritées : périmètre exact

**Décision.** Sont re-testées, chacune avec son reçu daté et rejouable :

| décision affirmée | où elle vit | forme du re-test |
|---|---|---|
| exclusion de `select` | `subjects.ts:236-247` (commentaire) | rendre Select dans le harnais, observer le texte de l'option |
| `button-with-icons` *skipped* | rapport, rubrique « Not diffed » | ré-exécuter, lire le motif d'axe |
| `piqueray-logo` *refused* | idem | vérifier l'existence de l'asset vectoriel déclaré |
| les 25 règles de `TRIAGE` | `triage.ts:43-226` | re-mesurer la ligne, confronter la cause écrite au relevé |
| blocage des 3 organismes | `audit-campaign.json` → `dependencyGates` | rejouer `--check-dependencies` |
| DW-001 … DW-006 | `specs/013-…/proofs/deferred/work.json` | re-classer dans le vocabulaire à six valeurs |

**Constat déjà acquis par la lecture, à re-tester et non à recopier.** Les trois
`dependencyGates` épinglent `expectedFigmaFileVersion: 2381568261081914456`
alors que la campagne tourne sur `2381581871281042338` — c'est la raison
`figma-file-version-moved` visible dans les trois verdicts `blocked`. Une part du
blocage est donc un **épinglage périmé**, pas un défaut de composant. Si le
re-test le confirme, FR-013 s'applique mot pour mot : le constat est consigné
comme entrée de 016, **le déblocage n'est pas fait ici**.

### D10 — Le re-classement du registre DW est un artefact de 014, pas une réécriture de 013

**Décision.** Le re-classement des six entrées DW est publié dans
`specs/014-…/proofs/registre/causes.json`, qui **référence** les identifiants
DW ; `specs/013-…/proofs/deferred/work.json` n'est pas modifié.

Sont en revanche re-rendus, parce que FR-003 et FR-010 l'exigent : le dossier
`organisms/reassurances/` (via `tools/run-one.mts reassurances`) et la synthèse
de campagne (via `tools/build-campaign.mts`, dont `--verify` recalcule tout
depuis `result.json` et refuse tout écart, code 2).

**Justification.** 013 est une campagne close : ses reçus sont datés et signés
par des hashes d'arbre. Y injecter une taxonomie postérieure les rendrait
irreproductibles. Le re-rendu de reassurances est différent — il est **exigé**
par FR-003, et l'ancien chiffre survit dans le registre avant/après (D5) plus
l'historique git.

### D11 — Le T0 de l'audit d'organismes se mesure dans un dossier de travail, jamais dans `specs/013-…/proofs/`

**Le trou.** La commande que D5 laissait porter le T0 côté audit d'organismes —
`tools/build-campaign.mts --verify` — ne **remesure rien** : elle relit les
`result.json` déjà commités de chaque organisme et recalcule seulement le
rollup depuis ces octets (`build-campaign.mts:8` : « recalcule tout depuis le
JSON » — le JSON en question est celui déjà sur disque, jamais reproduit).
C'est un contrôle de cohérence de 013, pas une re-mesure sur le navigateur du
jour. Prise telle quelle, l'« avant » de l'audit d'organismes serait une
relecture — exactement ce que FR-009 interdit.

**La contrainte double.** Re-mesurer « naïvement » via `tools/run-one.mts`
réécrirait `specs/013-…/proofs/organisms/<id>/` pour les 9 sujets à cas — donc
la campagne close, ce que D10 réserve au seul reassurances (parce que FR-003
l'exige, pas les 8 autres).

**Décision.** Un nouvel outil,
`extract/figma/organism-audit/tools/build-registre.mts` (CLI, pas pur — il
pilote la mesure), avec un drapeau `--phase avant|apres` :

1. Il re-mesure lui-même les **9 sujets à cas** — vagues 1 et 2, confirmées par
   lecture directe du manifeste (`coordonnees, devis, hero, presentation, sav,
   texte-seo` en vague 1 ; `faq, footer, reassurances` en vague 2 ; les 3 sujets
   de vague 3 n'ont aucun cas, rien à remesurer ici) — en import direct de
   `auditOrganism` (la même fonction que `tools/run-one.mts` emploie déjà), avec
   `outRoot` pointé sur `extract/figma/organism-audit/out/registre-scratch/<phase>/`
   — un chemin **déjà gitignoré** (`.gitignore:37`,
   `extract/figma/organism-audit/out/`), donc rien de nouveau à ignorer et
   aucune écriture possible dans `specs/013-…/proofs/`.
2. Il lit le reçu machine de la parité visuelle, produit fraîchement par
   `npm run extract:figma:visual` l'instant d'avant — machine-lisible, jamais
   parsé en Markdown.

   > **Prémisse fausse, corrigée le 2026-08-03 (revue des phases 1-2).** Ce
   > point affirmait « confirmé : `run.ts:1814` écrit ce JSON à côté de
   > `REPORT.md` ». C'est faux : `run.ts:1814` est dans `runVisualCampaign()`,
   > le chemin `--campaign`. Le `main()` ordinaire n'écrivait **que**
   > `REPORT.md` (`run.ts:2405`) — un `npm run extract:figma:visual` ne
   > produisait aucun JSON machine.
   >
   > La première implémentation a buté là-dessus et s'est repliée sur un
   > parsing du Markdown **sans le dire** : `avant.json` a alors comparé
   > `REPORT.md` à lui-même, et ses « 0 écart sur 36 lignes » étaient une
   > tautologie, pas une mesure. C'est exactement la faute que la
   > fonctionnalité existe pour supprimer, commise par la fonctionnalité
   > elle-même.
   >
   > **Correctif** : `main()` écrit désormais `out/rows.json` — les lignes en
   > **pleine précision**, avec la révision du navigateur (`writeMachineRows`,
   > à côté de `writeReport`). C'est la même relation que 013 tient déjà
   > (« `result.json` est l'AUTORITÉ ; `REPORT.md` en est rendu »). Le
   > registre lit ce reçu, et **refuse** (`visual-parity-not-remeasured`) si sa
   > date est antérieure au démarrage de l'outil — le garde-fou qui aurait
   > attrapé le défaut du premier coup.
3. Pour la comparaison « committed » : côté audit d'organismes, il lit
   directement les `specs/013-…/proofs/organisms/<id>/result.json` déjà commités
   — intacts au T0, puisque rien n'a encore été corrigé. Côté parité visuelle,
   il lit le `REPORT.md` **tel que git le connaît**
   (`git show HEAD:extract/figma/visual-parity/REPORT.md`), parce que
   `npm run extract:figma:visual` vient d'écraser la copie de travail avec les
   chiffres frais : la copie de travail n'est donc plus le committed au moment
   où l'agrégateur tourne.
4. Il écrit `proofs/registre/avant.json` (premier appel, avant toute
   correction) ou `apres.json` (second appel, **une seule fois**, à la
   clôture — étape 7 du quickstart) ; jamais entre-temps, parce que `select`
   (étape 5) ajoute une ligne de parité visuelle qui n'existe pas encore juste
   après DW-006 : figer l'« après » plus tôt obligerait à le refaire. Jamais
   assemblé à la main (constitution I).

   En phase `apres`, il **relit `avant.json`** et porte `before` et `after`
   côte à côte dans un même document : `delta = after − before`, valant **0**
   quand rien n'a bougé — jamais `null`, qu'aucun contrôle ne saurait
   distinguer de « pas mesuré ». Sans cette relecture, `apres.json` ne
   comparerait qu'au dépôt, c'est-à-dire à la mesure que FR-009 a précisément
   jugée non fiable.

### D13 — L'attribution est écrite à la main, dans son propre document

**Le trou.** `attribution` est un jugement : aucun outil ne peut le calculer. Or
le registre est déclaré « jamais assemblé à la main » (constitution I) et
`build-registre.mts` réécrit `avant.json`/`apres.json` à chaque appel — une
attribution éditée dans le registre serait écrasée au passage suivant.

**Décision.** Un seul document du registre est écrit à la main :
`proofs/registre/attributions.json` (`byKey: { "<clé de ligne>": "<cause>" }`).
L'outil le lit et fusionne ses valeurs ; le registre reste généré de bout en
bout. Ce qui, lui, **est** calculable, c'est le refus : tout écart — delta entre
phases, écart avec le dépôt, ou changement de statut — sans attribution fait
sortir l'outil en code non nul (`delta-without-attribution`).

**Justification.** La règle du dépôt n'est pas « aucun humain n'écrit rien »,
c'est « aucun artefact publié n'est assemblé à la main ». Séparer le jugement de
son rendu tient les deux : l'attribution est relisible et versionnée dans son
document, et le registre qui la publie reste reproductible.

**Justification.** C'est la même forme que D2 et D7 : réutiliser une fonction
déjà pure/éprouvée (`auditOrganism`) plutôt qu'écrire un second chemin de
mesure, et faire porter la comparaison « committed » par le git déjà versionné
plutôt que par un parsing ad hoc du Markdown ou par `baseline.json` (écarté par
D5). Le tool est nouveau, la mesure ne l'est pas.

**Alternative écartée.** *Demander à l'opérateur de lancer
`organism-audit/run.ts --wave 1 --out <scratch>` et `--wave 2 --out <scratch>`
à la main, puis un second outil pour agréger.* Rejetée : deux commandes à tenir
synchronisées (le chemin scratch de l'une doit être celui que l'autre relit)
pour un geste qui n'a qu'un seul invariant à respecter — ne jamais écrire dans
`specs/013-…/proofs/`. Un seul outil qui pilote sa propre mesure ferme cette
fenêtre d'erreur.

### D12 — La cause d'une ligne d'audit d'organismes vit dans `causes.json`, pas dans les dossiers de 013

**Le trou.** FR-011 et SC-002 portent la population sur les **deux** instruments,
et le relevé montre **9 lignes divergentes** côté audit d'organismes (recomptées
dans `specs/013-…/proofs/organisms/*/result.json`, toutes `rawPct > 0` donc
divergentes au sens de D8) :

| ligne | `rawPct` | | ligne | `rawPct` |
|---|---:|---|---|---:|
| hero | 27,8290 | | sav | 0,6652 |
| reassurances | 39,7844 | | coordonnees | 0,5223 |
| faq | 3,6723 | | presentation | 0,3531 |
| texte-seo | 1,8376 | | devis | 0,1354 |
| footer | 1,0440 | | | |

Or `triage.ts` est un module de `visual-parity/` : **rien ne porte la cause d'une
ligne d'organisme**. Les 6 entrées DW ne comblent pas le trou — elles ne nomment
que `footer`, `reassurances` et `faq`, et elles décrivent des *faits*, pas la
divergence pixel de la ligne.

**Décision.** `specs/014-…/proofs/registre/causes.json` devient le registre unique
des causes qui ne sont pas des règles de `TRIAGE` : les 6 entrées DW re-classées
**et** les 9 lignes d'organismes. Aucun dossier de 013 n'est modifié (D10), aucun
code d'instrument n'est touché.

**Justification.** Les deux autres routes se ferment d'elles-mêmes :

- *Ajouter `cause`/`causeReceiptId` aux dossiers de 013* (donc à `pilot.ts` et
  `report.ts`) imposerait de re-rendre les 9 dossiers, alors que FR-003 n'exige
  le re-rendu que de reassurances et que D10 réserve strictement l'écriture dans
  `specs/013-…/proofs/` à ce seul sujet.
- *Étendre `TRIAGE` aux clés d'organismes* : la table est indexée
  `subject` + `variant` et n'est lue que par `visual-parity/run.ts`, qui ne
  connaît pas l'audit d'organismes.

Le comptage reste **unique** : le gate agrège `triage.ts` (parité visuelle) et
`causes.json` (organismes + DW) sur le même vocabulaire à six valeurs — une seule
taxonomie, comme FR-015 l'exige.

**Conséquence assumée.** La cause de la ligne `reassurances` est celle du
**résidu re-mesuré** après la correction DW-006, pas « défaut d'instrument » :
l'instrument expliquait les 39,78 %, il n'explique pas ce qui reste.

---

## 2. Hypothèses de triage à mesurer (aucune n'est une conclusion)

Les quatre lignes UNTRIAGED portent des indices lisibles dans le rapport. Ils
sont consignés ici **comme pistes à falsifier**, pas comme causes : US2 exige une
preuve inspectable par ligne, et l'objet même de 014 est de refuser la cause
affirmée sans mesure.

| ligne | indice au rapport | piste | ce qui la falsifierait |
|---|---|---|---|
| `member-picture :: Etat=Defaut` (64,48 %) | encre nôtre `#d9d9d9` vs figma `#aba198`, tailles 728 vs 727 | frontière image — le placeholder technique documenté face au portrait réel, comme la règle existante de member-card | une géométrie fausse sous l'aplat, ou un écart hors du plan photo |
| `member-picture :: Etat=Survol` (58,33 %) | même encre, figma `#6d6d6c` | idem, l'état de survol assombrissant la photo | idem |
| `section-header :: Disposition=Avec CTA` (8,78 %) | **2174 vs 3093 px**, la variante Standard tombant juste (1082 vs 1081) | géométrie : le master de la variante CTA est plus large et le sujet ne déclare pas de `renderWidth` — mais `renderWidth` est **par sujet, pas par variante**, ce qui peut en faire un défaut d'instrument | un master à la même largeur que Standard, qui déplacerait la cause vers le contrat |
| `google-reviews :: Avis Google` (3,32 %) | tailles **identiques** 3104×656, masqué 1,51 %, couverture de masque 13,89 % | rendu/rastérisation : géométrie exacte, résidu sur le texte | un résidu localisé hors des zones de texte |

---

## 3. Environnement d'exécution — vérifié, pas supposé

- `node_modules/` présent dans ce checkout ; `npx tsx` disponible.
- Cache Playwright : `chromium-1217/1223/1228/1234` + les `headless_shell`
  correspondants. La révision employée sera **enregistrée** (D6), pas devinée.
- Le travail se déroule dans le checkout principal, pas un worktree
  (`git worktree list` n'en montre qu'un) : la clause F1 de la constitution
  (`npm install` + `npx playwright install chromium` dans le worktree) est sans
  objet ici, et la balayée de portes tourne directement.
- Accès Figma : REST en **lecture seule** (`FIGMA_TOKEN`), déjà la seule route de
  013 (`run.ts:5-9` — aucun chemin d'écriture dans l'arbre de modules).

---

## 4. Ce que la recherche laisse ouvert

Rien qui bloque la conception. Deux points sont **volontairement** laissés à la
mesure, parce que les trancher ici serait exactement la faute que 014 corrige :

1. **Les causes des quatre lignes UNTRIAGED** — §2 donne des pistes, la mesure
   donnera les causes.
2. **Le chiffre corrigé de reassurances** — la valeur de contrôle consignée
   (~3,30 %) est une attente. Le chiffre publié sera celui mesuré, et un écart
   notable avec l'attente sera nommé (FR-003, edge case de la spec).

### Une hypothèse de la spec, infirmée par la mesure (2026-08-03)

`spec.md` § Assumptions affirme : « Le re-test d'une cause se fait avec les
instruments existants et en lecture seule ; **aucune cause ne demande, pour être
vérifiée, une capacité que la fonctionnalité n'a pas le droit de construire.** »

**C'est faux, et une ligne le prouve.** Le résidu de `reassurances` (3,30 %) a
deux causes réelles en concurrence — quatre photos de cartes non transportées
(`image-boundary`) et un échec de la porte géométrique à −4 px déjà enregistré
comme DW-002 (`contract-geometry`). Le vocabulaire n'en admet qu'une. Or
départager les deux demande un score par région isolant les zones d'image des
cartes, et le cas ne déclare qu'une région `whole` (2 408 529 px de signal, sans
ventilation). Construire ce masquage est une capacité de mesure, que FR-005
interdit ici.

**Ce que 014 fait donc, et qui est la seule issue honnête** : la cause repose sur
ce qui **est** mesuré — le verdict géométrique, binaire, produit par
l'instrument — et non sur l'argument de dominance, qui est une inférence. Le
fait image reste nommé à côté (`coOccurring` dans `causes.json`, détaillé dans le
reçu), et la question de la répartition est transmise à 015, là où la mesure a le
droit d'être construite. Si 015 mesure les photos comme dominantes, la ligne se
re-classe et le reçu porte son infirmation.

C'est le motif que le dépôt connaît déjà : une décision écrite dans le dépôt
n'est pas un fait tant qu'elle n'a pas été re-testée — y compris quand la
décision est une hypothèse de la spec elle-même.
