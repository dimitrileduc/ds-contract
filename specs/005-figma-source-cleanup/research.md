# Research — Source Figma propre avant extraction (spec 005)

**Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Toutes les inconnues du Technical Context et les arbitrages que la checklist de spec avait
explicitement renvoyés au plan sont tranchés ici. Format : Décision / Rationale /
Alternatives. Les receipts cités sont ceux des audits du 2026-07-25 et de la 003 — **rien
n'est re-mesuré ici de ce qu'un audit a déjà mesuré** (règle docs-first).

---

## R1 — Route d'écriture sur le canvas

**Décision** : pont desktop **figma-console** (`figma_execute`), avec
`figma.loadAllPagesAsync()` en préambule de chaque script, contre `Piqueray (Copy)`
(fileKey `d9FYAUcqdcNtsuaMgLefvJ`).

**Rationale** : c'est la **seule route qui voit la page `Pages`** (`210:325`, les 9
maquettes) — locale, non synchronisée côté serveur, invisible à tout outil REST ou MCP
serveur (receipt R1 de la 003, re-constaté à chaque session depuis). Or les 9 maquettes
sont le **juge** de cette itération : sans elles, aucun verdict. Les masters, eux, sont
lisibles côté serveur, mais utiliser deux routes pour un même geste multiplierait les modes
d'échec sans rien gagner.

**Alternatives considérées** :
- *REST / MCP serveur* — rejeté : aveugle à `Pages`, et en lecture seule pour l'essentiel.
- *Plugin Sync Runner du dépôt* — rejeté : c'est l'exécuteur des scripts **générés** par le
  pipeline de contrats ; ici il n'y a aucun contrat à générer.

## R2 — Points de version, et la seule édition du dépôt

**Décision** : `bridge/checkpoint.js` réutilisé, avec sa regex de libellé généralisée de
`^003\/[^/]+\/[^/]+$` à `^\d{3}\/[^/]+\/[^/]+$` (et le message d'erreur aligné). Convention
de libellé : **`005/<passe>/<étape>`** — une passe = une phase P1…P7, l'étape nommant le
geste (`005/noms/icones`, `005/geometrie/sav`, `005/strates/suppression-assets`).

**Rationale** : FR-040 impose un point de version **avant chaque grosse passe** et FR-027
impose son identifiant au rapport ; le validateur actuel refuse tout libellé non préfixé
`003/`. La généralisation est de 4 caractères et ne relâche aucune garantie : un libellé
malformé reste un **refus nommé**, jamais un enregistrement silencieux. Le validateur
existe précisément parce qu'« un checkpoint anonyme est un checkpoint que personne ne
retrouve sous pression » — le préfixe reste obligatoire, seul son numéro devient variable.

**Alternatives considérées** :
- *Poser des libellés `003/…`* — rejeté : un point de version qui ment sur l'itération qui
  l'a créé, dans l'historique d'un fichier client, est la classe de dégradation silencieuse
  que le principe V classe la plus grave. On corrigerait un fichier en salissant son
  historique.
- *Dupliquer en `checkpoint-005.js`* — rejeté : deux validateurs pour 4 caractères, qui
  divergeront à la 006.

**Limite nommée** : **aucune API de restauration programmatique n'existe** (vérifié
2026-07-23, inchangé). Le retour arrière est un geste humain guidé par l'UI native, puis
re-prouvé par l'instrument — jamais un bouton de script.

## R3 — Cadence : comment 41 exigences tiennent en 12 cycles

**Décision** : **12 cycles de preuve + 1 étalonnage**, répartis ainsi — 5 lots zéro-pixel
(L1–L5) et 7 gestes à effet visuel (V1–V7) :

| # | Cycle | Type | Diff annoncé |
|---|---|---|---|
| É | Étalonnage — double capture, aucun geste | contrôle | 9/9 `identical`, sinon **STOP programme** |
| L1 | Noms (≈69 échos) + 15 descriptions | lot 0-px | **0 pixel** |
| L2 | Style 54 + liaisons variables + ajouts 3× | lot 0-px | **0 pixel** |
| L3 | Affordances : Product-card, Tab `État3`, member-picture | lot 0-px | **0 pixel** |
| V1 | Coquille Header nav (padL/R 88→89, 2 variantes) | visuel | bande ~1 px aux bords, **9/9 pages** |
| V2 | Coquille Devis (Container x 88→89, w 1552→1550) | visuel | bande ~1 px + 2 px de largeur, pages portant Devis |
| V3 | Coquille SAV (w 1552→1550) | visuel | 2 px de largeur, pages portant SAV |
| V4 | Coquille Réassurances ×3 variants | visuel | 2 px de largeur, pages portant Réassurances |
| V5 | Section-header 1552 → 1550 | visuel | ~2 px sur les pages portant le variant Avec CTA |
| V6 | Footer : reconstruction + coquille (cumulés) | visuel | bande aux bords + 2 px de largeur, **9/9 pages** |
| L5 | Adoption Section-header ×6 + master Hero vidéo | lot 0-px | **0 pixel** (pré-diff structurel préalable) |
| L4 | Strates : déplacements, éclatement Header nav, suppression `Assets` | lot 0-px | **0 pixel** + 0 instance cassée |
| V7 | Tab : retrait du soulignement de `Défaut` | visuel **assumé** | visible sur les seules maquettes portant un Tab, validé **sur crop** |

**Rationale** : le budget ne se tient pas en fusionnant des gestes visuels (SC-009 l'interdit
nommément) mais en **groupant tout ce qui ne peut pas déplacer un pixel par construction**.
Quatre familles sont zéro-pixel *par nature*, pas par espoir : un nom ou une description
n'a aucune expression rendue ; une liaison de variable vers une valeur strictement égale
change le porteur, pas la valeur ; un déplacement de master ne change ni sa clé ni son node
id (prouvé sur 14 masters en 003) ; une propriété booléenne qui reproduit l'état de
visibilité courant ne change rien de visible. Les regrouper n'affaiblit pas le verdict — un
lot annoncé 0 qui rend ≠ 0 déclenche STOP et annulation du **lot entier** (FR-029), ce qui
est plus sévère, pas moins.

**L5 est un lot, pas deux cycles visuels** : l'adoption d'un Section-header et la
componentisation d'un cadre existant sont **annoncées** à 0 pixel, donc relèvent de FR-030
côté lot. Elles sont précédées d'un **pré-diff structurel par position**
(`bridge/customizations.js`) qui décide avant l'écriture : si un delta géométrique apparaît
sur l'un des 6 organisms ou sur le hero vidéo, **ce geste sort du lot et prend son cycle
propre** — le budget passe à 13 et le dépassement est signalé au moment constaté.

**Alternatives considérées** :
- *Un cycle unique pour les 5 coquilles* — rejeté : FR-030 est explicite, et surtout D1
  documente **5 mécanismes différents** dont un piège vérifié (l'enfant GROUP de SAV, déjà
  responsable d'un arrêt avant écriture). Un diff hors attendu dans un cycle à 5 gestes
  n'est pas diagnosticable.
- *Un cycle par composant, comme la 003* — rejeté : ~30 cycles pour un périmètre qui ne
  remplace presque aucune copie. La 003 payait ce prix parce que chaque incrément était un
  **remplacement** de copie ; ici l'écrasante majorité des gestes est métadonnée.

## R4 — Instrument de preuve : réutilisé, pas réécrit

**Décision** : `extract/figma/page-parity/` **tel quel**, zéro fichier ajouté. Capture
`exportAsync` @1x des 9 frames via `bridge/capture.js` → `receiver.mjs` (port 9227,
transport b-fetch) ; comparaison `npm run pages:compare` (`pixelmatch` seuil 0.1 +
détecteur AA, dimensions strictes, jamais `alignPair`) ; `verdict.json` + `verdict.md` +
crops triptyques du `diffBox`. Exit codes load-bearing : `0` = 9/9 identical, `1` = écart
mesuré, `2` = **la preuve n'a pas eu lieu** (capture vide / dimensions / entrée manquante) —
jamais dégradé en « identique ».

**Étalonnage obligatoire en ouverture** : double capture sans aucun geste entre les deux →
doit rendre 9/9 `identical`. Sinon le plancher de bruit de l'instrument n'est pas nul et
tout verdict aval serait faux : **STOP**, retour owner. (Passé 9/9 + sha256 reproductibles
en 003 ; re-fait ici parce que le fichier a changé depuis.)

**Rationale** : l'instrument est déjà prouvé par ses 5 fixtures (`pages:selftest`, sans
Figma) et ses limites sont documentées dans son propre README — là où la capacité vit
(principe V). Écrire une variante « spéciale 005 » ajouterait un harnais non prouvé au
milieu de l'itération censée prouver quelque chose d'autre.

**Alternative rejetée** : le gate visuel existant `extract:figma:visual` — REST +
code ↔ master, **aveugle à la page `Pages`** : il ne prouve rien sur les 9 maquettes.

## R5 — Fraîcheur et before-capture

**Décision** : capture **avant** systématique sur les **9 pages**, jamais un pilote, avec
vérification que chaque PNG est non vide et correctement dimensionné **avant** d'écrire
quoi que ce soit. Aucun cache, aucune baseline persistante (l'instrument n'en a pas, par
conception).

**Rationale** : c'est la règle before-capture du dépôt, née d'un coût réel — plusieurs
molécules de la 003 ont expédié avec une preuve pixel sur 1-2 maquettes seulement, et le
trou s'est révélé **définitivement irrécupérable** : aucun outil ne rend l'image d'une
version passée (`figma_get_file_at_version` rend la structure, pas les pixels). Et le
retour arrière rétroactif pour combler une preuve manquante est explicitement **exclu** par
l'owner (« encore plus dangereux »). Corollaire de cadence : une capture des 9 pages coûte
la même chose qu'une capture d'une page dans le budget de cycles — il n'y a donc aucune
tentation légitime de sous-capturer.

## R6 — Ce qu'est « le périmètre », et pourquoi ~69 échos coûtent 18 gestes

**Décision** : le périmètre des exigences de nommage (FR-001…FR-005) est
**l'ensemble des masters** des 4 pages `DS · {Atomes, Molécules, Organisms, Tokens}` **et**
de la page `Assets`, plus les **cadres d'assemblage nommés par les audits** dans les 9
maquettes (les wrappers 1:1 d'Accueil). Il **exclut** l'intérieur des instances : un calque
d'instance porte le nom de son master.

**Rationale** : les ~69 « noms par défaut » du lint ne sont pas 69 défauts mais **une
poignée de racines et leurs échos** — l'audit atomes le mesure explicitement : « tous les
enfants aux noms par défaut […] c'est la source racine des ~69 échos ». Renommer les
enfants des **18 masters d'icônes** (15 sur `Assets` + 3 sociales sur `DS · Atomes`) éteint
mécaniquement les ~29 échos vus dans les instances des organisms. Traiter les échos un par
un serait à la fois impossible (on ne renomme pas le calque d'une instance) et le signe
qu'on a raté la cause.

**Relevé committé** : un scan lecture seule (`bridge/scan.js`, par position) publié dans
`releves/perimetre-<date>.json` **avant** L1 fixe la liste exacte et sert de dénominateur à
SC-002. Un nom qui n'est pas dans le relevé n'est pas dans le périmètre — et un nom du
relevé qui survit à L1 est un échec, pas un oubli.

## R7 — Les deux affordances laissées ouvertes par la spec

**Décision** :
- **Product-card (`2068:1972`)** → une propriété **BOOLEAN officielle** `Bouton`, valeur par
  défaut **`false`** (l'état actuel du master), liée à la visibilité de l'instance masquée.
- **member-picture (`274:2389`)** → l'axe `Property 1` devient un **axe d'état nommé**
  `État`, valeurs `Défaut | Survol` (accentuation et casse cohérentes avec le fichier).

**Rationale** : ce sont les défauts que la spec pose en Assumptions, et ils suivent la
leçon Button à la lettre — elle dit « rendre officiel », pas « supprimer ». Le défaut
`false` est le seul choix zéro-pixel : toute autre valeur ferait apparaître un bouton
aujourd'hui invisible sur toutes les instances. Pour member-picture, nommer l'axe préserve
l'intention de design (un survol existe) là où retirer le variant la perdrait sans
compensation.

**Réversibilité nommée** : si l'owner constate que le bouton de Product-card n'a aucun
usage réel, le retrait reste possible — mais c'est alors un geste **destructif** (archive
préalable) et il change de cycle. La décision par défaut est celle qui ne détruit rien.

## R8 — Règle 3× : où l'on compte, et ce qu'on fait du reste

**Décision** : les occurrences se comptent **dans les masters du périmètre uniquement**,
jamais dans les instances. Le comptage est un **relevé lecture seule publié avant L2**
(`releves/regle-3x-<date>.json`) : valeur littérale, type (typo / couleur), liste des nœuds
porteurs, verdict `≥3 → gouverner` / `<3 → laisser + déclarer`.

**Rationale** : compter dans les instances ferait franchir le seuil à n'importe quoi (le
master Réalisation a 45 instances — une valeur vue une fois y apparaîtrait 45 fois) et
transformerait une règle de gouvernance en machine à uniformiser. On gouverne ce qui se
répète **dans le système**, pas ce qui se répète **dans les pages**. Corollaire dur, déjà
écrit en FR-014 : une valeur hors palette qui atteint 3 donne lieu à l'**ajout** d'une
variable — jamais au remplacement par une variable existante voisine. Précédent : `color/rouge`
minée côté Figma seul en 003, `tokens/*.tokens.json` non touché.

**Cas connus à trancher par le relevé, pas a priori** : `#000` d'Accordion Grand, fond du
bloc Devis, `#E0E0E0` de Réalisation, taille 44 (vue 1× → laissée + déclarée), taille 54
(vue 8× → gouvernée).

## R9 — Éclatement de l'en-tête de navigation

**Décision** : **2 masters, pas 3**. `Nav-item` devient un master (la brique réellement
répétée ×4) rangé sur `DS · Molécules` ; `Header` devient l'organism qui l'assemble, rangé
sur `DS · Organisms`, ses 2 variantes de fond `Solid | Transparent` conservées et son axe
`Property 1` renommé. Aucun master `Nav` intermédiaire. La découpe **exacte de la brique**
(où s'arrête un nav-item : le libellé seul, ou libellé + chevron) est arrêtée par un relevé
de structure préalable, pas par une décision a priori.

**Rationale** : un bloc à consommateur unique ne devient pas un master — ce serait un niveau
d'indirection sans cas de réutilisation, et la spec l'interdit nommément (FR-037). Le
chevron fantôme `octicon:chevron-down-12` (`6:119`) **n'est pas touché** : il est déplacé
sur `DS · Atomes` avec une description qui le marque hors registre, pour que ses 4 instances
continuent de résoudre. Le re-swapper vers le `chevron-down` du registre risquerait un écart
de dessin sur 9 maquettes pour un gain qui appartient à la Spec B.

**Ordre imposé** : la coquille du Header nav (V1) passe **avant** l'éclatement (L4).
Corriger 2 variantes d'un master existant est un geste connu et chiffré (D1) ; le même
geste réparti sur 2 masters neufs devrait être re-caractérisé.

## R10 — Archive et gestes destructifs

**Décision** : page temporaire **`Archive · Spec A`**, recevant un **clone vectoriel**
(jamais une image) avant chacun des 2 gestes destructifs identifiés :
1. suppression du variant `État3` de Tab (`2061:1588`) ;
2. reconstruction du Footer (`2120:4785`).

La suppression de la page `Assets` **n'est pas un geste destructif au sens de FR-031** :
elle est précédée du déplacement de 100 % de son contenu (4 sets + 15 icônes + fantôme +
2 planches), donc rien n'est perdu — mais elle est **vérifiée** : relevé du contenu à zéro
avant suppression, puis preuve pixel après. La page d'archive est supprimée en P8, avec sa
propre preuve (SC-012).

**Rationale** : un clone d'image ne permet pas de restaurer un composant, seulement de le
regarder. L'archive existe pour pouvoir **remettre** ce qu'on a enlevé, pas pour le
documenter. Les points de version natifs suffisent au reste (lots zéro-pixel) — ils
permettent déjà de recopier un élément précis depuis une version passée.

## R11 — Le rapport de sortie, et l'unique ledger

**Décision** :
- **`RAPPORT-CLOTURE.md`** porte, **par geste** : le triptyque avant/après/différence, le
  lien de l'élément **avant** et **après**, l'**identifiant de la version enregistrée avant
  la passe**, et une explication courte. Un geste sans son quadruplet est un geste non
  prouvé (SC-015).
- **Un seul ledger** est requis : `ledger/section-header.json`, pour l'unique geste
  d'adoption copie→instance de l'itération (les 6 titres faits main de P5). Validé par
  `npm run pages:ledger:check` (exit non-zéro sur entrée incomplète). Un ledger **vide
  explicite** est requis si le pré-diff ne trouve aucune personnalisation — jamais un
  fichier absent.
- Les **divergences ouvertes volontairement** (renommage de l'axe du Bouton → contrat faux ;
  master hors registre conservé) ont leur section dédiée, avec la réparation attendue en
  Spec B. Une divergence ouverte et non écrite **bloque la clôture** (SC-017).

**Rationale** : c'est le format donné par l'owner, et le choix « lien + identifiant de
version » plutôt que « lien vers l'état d'avant » est une contrainte physique, pas une
préférence : une fois la mutation faite, aucun outil ne rend l'image d'un état passé. Le
triptyque porte les pixels, la version porte la structure restaurable — les deux ensemble
sont le seul « avant » atteignable.

## R12 — Rapport aux gates et aux claims (principes II & III)

**Décision** :
- **Aucune claim de capacité** ajoutée à README/docs par cette itération, donc **aucun eval
  à ajouter** : la claims rule impose fixture → eval → claim, elle n'impose pas d'eval pour
  du travail qui ne revendique rien.
- Les gates du dépôt doivent finir au **statu quo strict** : 8/8 verts, suite **108/108**,
  `parity` à zéro écart actif. **Aucune dérogation n'est demandée** — contrairement à la
  003, il n'y a plus de bloc rouge hérité (les 3 evals quarantainés sont verts depuis
  `c8512f7`). Tout rouge est donc une régression et bloque.
- Vérification qui rend cela possible, faite **avant** la décision de vider `Assets` :
  aucun script du dépôt ne cible une page Figma par son nom (le walk prend un id de frame en
  paramètre), et l'ancre du seul contrat concerné est `componentSetKey` + `nodeId` — deux
  identifiants qui survivent à un changement de page. Le déplacement est donc sans effet sur
  la chaîne code, et `npm run parity` reste au statu quo malgré le rangement.
- `npm run eval` **ne tourne pas en worktree** (il symlinke `ROOT/node_modules`) → le sweep
  final se fait sur le checkout principal.

**Rationale** : rester dans la lettre du principe II sans inventer un eval pour un livrable
canvas, et rester dans la lettre du principe III en nommant la seule divergence
volontairement ouverte plutôt qu'en la corrigeant en douce des deux côtés.

---

## Ce qui n'a PAS été re-mesuré (docs-first)

| Question | Déjà tranchée par | Conclusion reprise telle quelle |
|---|---|---|
| Périmètre du master hero vidéo | `003/audits/hero-et-categories.md` | Le master couvre exactement le cadre `Hero video` (`210:330`, 1728×720) ; le cadre `Hero et catégories` reste un cadre d'assemblage — un master composite falsifierait Accueil |
| Un déplacement de master casse-t-il des instances ? | 003, 14 masters déplacés | Non : clé et node id survivent, 0 instance cassée, 0 pixel |
| Valeur de la coquille : 88 ou 89 ? | `003/audits/{categories-principales,hero}.md` | **89**, mesuré sur le contenu réel ; 88 était une hypothèse de brief jamais corrigée |
| Les 3 défauts d'affordance existent-ils vraiment ? | audits bonnes-pratiques du 2026-07-25, vérifiés live | Oui : Product-card `propRefs:{}`, Tab `État3` absent de sa description, member-picture `Default\|hover` |
| Le fond des 5 coquilles et leurs pièges | `BACKLOG-SPEC-A`, § D1 | 5 mécanismes distincts, dont l'enfant GROUP de SAV qui ne suit pas le resize (arrêt avant écriture déjà provoqué) |
| Pièges Figma récurrents | `BACKLOG-SPEC-A`, § D5 | `resize()` sans effet sur l'enfant d'une instance ; GROUP qui ne suit pas ; props de Bouton rejouées qui réinitialisent l'override de couleur du glyphe (relier **après**) ; `setBoundVariableForPaint` dont le retour peut mentir (relire séparément) ; `figma.currentPage =` interdit → `setCurrentPageAsync` ; `fetch()` limité aux ports 9223-9232 |
