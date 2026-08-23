# Workflow de réparation Figma mono-composant

Ce workflow v2 généralise les portes utiles de la campagne 021 sans généraliser
son lot de sept cibles. Il traite exactement un composant par manifeste et ne
donne jamais au CLI Node une autorité d'écriture Figma.

La commande publique est :

```bash
npm run component:repair -- --campaign <campaign.json> <action>
```

L'audit initial s'exécute avec :

```bash
npm run component:repair -- --campaign <campaign.json> --audit
```

Cette commande est strictement read-only côté Figma. Elle écrit uniquement le
rapport `audit.json` dans le dossier de preuve du run.

La campagne 021 au format `1.0.0` reste compatible avec
`npm run projection:repair`. Les nouvelles campagnes utilisent
`schemaVersion: "2.0.0"` et `workflow.mode: "single-component"`.

## Ordre obligatoire

```text
audit read-only du composant, de ses dépendances et de ses usages
  → classification des écarts
  → verdict sans changement ou proposition minimale
  → GO owner si une écriture est proposée
  → source snapshot
  → preflight read-only
  → capture before
  → dry-run
  → application live externe + reçu first
  → capture after
  → verify
  → seconde application externe + reçu second
  → capture idempotence
  → verify-idempotence
  → décision owner
  → finalize
```

Une étape rouge bloque les suivantes. Le runner ne propose aucun fallback par
nom, aucune correction locale et aucune écriture de Page.

Un `verify` rouge peut être relancé dans l'état `verification-failed` uniquement
après correction d'un gate non-canvas ou d'une classification du manifeste. La
comparaison complète est recalculée et l'unique sortie autorisée est
`verified` ; cet état ne permet ni nouvel apply, ni saut vers `finalize`.

L'audit initial n'autorise aucune mutation, y compris lorsqu'un correctif paraît
évident. Pour un composant déjà conforme, sa sortie attendue est explicitement
`aucun changement proposé`. Pour un nouveau composant ou un composant non
conforme, il classe les écarts, désigne leur source probable et s'arrête sur une
proposition avant toute modification du contrat, de l'émetteur ou de Figma.

## Périmètre et dépendances

Le manifeste distingue trois ensembles :

- le master cible ;
- ses dépendances structurelles réelles, c'est-à-dire les composants qu'il
  instancie ou dont son contrat dépend directement ;
- ses contextes d'usage, notamment les Pages et les composants superposés.

Un contexte d'usage sert à vérifier le rendu mais n'étend jamais implicitement
le périmètre d'écriture. Par exemple, un Header superposé à un Hero doit être
capturé avec lui, mais le Header et ses NavItem ne deviennent pas pour autant
des dépendances modifiables du Hero. Toute extension à un composant partagé doit
être déclarée dans le manifeste, accompagnée de son blast radius puis acceptée
explicitement par l'owner.

## Audit et proposition

Avant le snapshot source, lire les spécifications, décisions et preuves
historiques pertinentes, puis inspecter le master, ses dépendances déclarées et
tous ses usages Page sans écriture. Chaque anomalie est rattachée à sa source
la plus basse : contrat ou token, authoring Figma, contenu ou média, capacité
générique manquante de l'émetteur, ou donnée historique insuffisante.

Ne jamais modifier l'émetteur pour corriger un cas particulier. Un changement
d'émetteur n'est proposé que si une lacune générique reproductible est prouvée,
que les spécifications existantes ne la couvrent pas et qu'un fixture ciblé peut
la verrouiller. Les sorties générées ne sont jamais éditées manuellement.

Le rapport d'audit rend exactement l'un de ces verdicts :

- `green` : tous les faits protégés passent ; aucun changement proposé ;
- `proposal` : liste minimale des changements, source par source, blast radius
  et gates de vérification ; arrêt obligatoire avant écriture ;
- `blocked` : référence, version, preuve ou connexion manquante empêchant une
  conclusion factuelle.

Par défaut, exécuter uniquement les vérifications ciblées nécessaires au
composant. Une suite globale n'est lancée que si le changement touche réellement
une primitive ou une capacité partagée et que son blast radius la justifie.

## Manifeste v2

Le manifeste déclare notamment :

- un `sourceBaseline` récupérable dans `refs/codex/backups/*` ;
- `workflow.subjectKind: "organism"` pour activer le gate Container, ou
  `"shared-component"` pour auditer un composant partagé sans lui inventer un
  Container d'organisme ;
- les `directDependencies` structurelles du composant, distinctes des
  `sharedDependencies` dont une modification aurait un blast radius ;
- un fichier et une version Figma épinglés ;
- exactement un target ;
- l'id et le nom attendus du master ;
- la liste exacte des noms de variantes ;
- toutes les instances et un `page-context` pour chaque usage Page ;
- les largeurs de contrôle propres au composant dans `responsiveWidths` ;
- les opérations autorisées ;
- les faits protégés et ceux dont le changement est explicitement attendu ;
- un dossier de preuve et deux chemins distincts de reçus live.

Les faits suivants doivent être soit protégés, soit explicitement autorisés à
changer :

```text
master-identity
variant-cardinality
variant-names
image-paints
gradient-paints
text-content
text-ranges
text-styles
instance-links
instance-overrides
page-node-identity
```

`video-paints`, `geometry` et `responsive-overflow` sont des canaux
supplémentaires. Par exemple HeroVideo autorise la disparition du VideoPaint
mais protège son poster IMAGE et ses gradients.

### Container local obligatoire pour un organisme

Un organisme est présenté une seule fois par son master historique, directement
dans une FRAME locale auto-layout nommée `Container`. Le master garde son id et
doit avoir `layoutSizingHorizontal = FILL` dans ce parent. Le Container ne doit
pas contenir un second master ou une instance de démonstration du même
organisme : le master lui-même exerce le Fill.

La règle n'impose aucune largeur universelle. La largeur de référence vient de
la cible et les largeurs réduites viennent de son tableau `responsiveWidths` ;
elles peuvent donc varier d'un organisme à l'autre. L'absence du Container, un
root `FIXED` ou un doublon de présentation force un verdict `proposal` avant
toute écriture.

Pour une grille, le gate vérifie en plus le mode natif `GRID`, le nombre fixe
de colonnes, les deux gaps, l'ordre visuel des enfants et leur Fill. Une
ancienne grille MANUAL dont l'ordre d'arbre diffère de l'ordre visuel doit être
réordonnée en place avant reconstruction ; les contenus et photos voyagent avec
leurs instances. Un `flex-wrap` visuellement proche n'est pas une preuve Grid.

### Classification obligatoire des textes

Pour chaque nœud texte du master et de ses dépendances déclarées, enregistrer
son contenu, ses plages, ses métriques, son poids et son TextStyle id, puis le
classer dans une seule catégorie :

1. `named-exact` : lié au Text Style gouverné dont la définition correspond
   exactement au rôle sémantique attendu ;
2. `rich-ranges` : plusieurs styles natifs sont appliqués par plages ; le nœud
   n'a pas de Text Style global et cette absence est justifiée par la preuve des
   ranges ;
3. `historical-custom` : exception documentée par une décision existante et par
   une valeur pixel-fidèle qui ne doit pas être rapprochée arbitrairement d'un
   style voisin ;
4. `defect` : texte brut sans justification, mauvais style, métrique incorrecte
   ou lien perdu.

Le matching d'un Text Style est exact ; aucun choix « le plus proche » n'est
autorisé. Un rich text ne constitue pas une permission générale de laisser ses
autres textes frères en valeurs brutes. Toute catégorie `historical-custom`
sans décision traçable devient `defect`.

Une exception historique déclarée dans
`workflow.historicalTextDecisions` relie l'id exact du nœud texte à une
`authorityRef` du manifeste. Elle protège les métriques et plages existantes ;
elle n'autorise ni matching approché ni Text Style global de remplacement.

La création ou la migration de Text Styles reste une opération séparée : elle
doit vérifier la cardinalité et les définitions historiques exactes avant toute
écriture, ne jamais adopter un style homonyme non marqué, puis produire un vrai
no-op à la seconde application.

## Snapshot source

Avant tout changement de source :

```bash
npm run component:repair -- \
  --campaign <campaign.json> \
  --snapshot-source \
  --backup-ref refs/codex/backups/<run-id>
```

Le snapshot utilise un index Git temporaire. Il archive les octets tracked et
untracked dans une ref atteignable, sans stasher, nettoyer ou modifier l'index
réel. Le préflight refuse une ref absente ou un tree/parent différent.

## Preflight et captures

Le preflight REST est strictement read-only. Il refuse :

- un autre fichier ou une autre version avant mutation ;
- un master absent ou deux masters portant le nom épinglé ;
- une variante ajoutée, retirée ou renommée ;
- une instance non déclarée ou une instance attendue absente ;
- une référence owner/source manquante ;
- un impact partagé non inventorié.

La capture écrit pour chaque surface : PNG, structure, propriétés et
`facts.json`. Un usage Page possède deux surfaces : l'instance exacte et son
contexte visuel, afin de voir notamment un Header superposé à un Hero.

Une occurrence explicitement `visible:false` peut être déclarée
`hidden-instance` : sa structure, ses propriétés et ses faits protégés restent
obligatoires, mais aucun PNG n'est exigé puisque l'API Figma n'en exporte pas.
Si elle redevient visible, la capture refuse cette classification.

## Application live

Le CLI ne pilote pas Figma. Le Desktop Bridge ou le plugin exécute le plan
généré et renvoie le résultat natif des scripts avec une inspection post-apply.
Le runner transforme cette enveloppe en reçu stable puis la valide :

```bash
npm run component:repair -- \
  --campaign <campaign.json> \
  --normalize-apply --run first \
  --bridge-result <bridge-first.json> \
  --receipt <apply-first.json>
```

Ce reçu est ensuite enregistré avec :

```bash
npm run component:repair -- \
  --campaign <campaign.json> \
  --record-apply --run first --receipt <apply-first.json>
```

Le reçu doit contenir exactement les opérations du dry-run, `pageWrites: []`,
un seul master avec le même id/key, les mêmes variantes et un contrôle sans
overflow pour chaque largeur de `responsiveWidths` avec sa capture.

Le contrôle responsive inspecte le master et tous ses descendants effectivement
visibles. Il refuse aussi un descendant coupé par un ancêtre `clipsContent`, même
si le contour externe du master reste dans le Container. Le Container garde sa
largeur de référence mais HUG sa hauteur afin qu'un texte qui reflowe ne soit pas
maquillé par une hauteur fixe.

Le transport générique accepte quatre familles bornées : création/adoption du
Container d'organisme, propriétés Auto Layout explicitement allowlistées sur un
nœud résolu par chemin structurel (sizing, padding, axe, positionnement et
contraintes), réordonnancement de la liste exacte d'enfants existants d'un master
(IDs épinglés, ensemble inchangé, aucune création/suppression), et typographie gouvernée (`Text Style` identifié par le marqueur
`ds_contracts/textStyleToken`, plages de fontes explicitement déclarées, ou
alignement texte borné `textAlign` ∈ LEFT|CENTER|RIGHT|JUSTIFIED — ajouté le
2026-08-18 par le run member-card : `textAlignHorizontal` est un fait natif TEXT
hors Text Style, et un `generated-amend` est disproportionné pour lui — la
pré-passe photos 017 refuse à juste titre toute reconstruction d'un composite
porteur de paints, 66 empreintes relevées sur member-card). Les valeurs libres,
homonymes non marqués, chemins ambigus, contenus texte différents et opérations
sur Page sont refusés avant mutation.

Le second reçu passe par la même porte avec `--run second`. Chaque opération
doit alors être `no-op`, avec zéro nœud créé et zéro nœud modifié.

## Comparaison

La vérification compare séparément :

- identité du master et des instances ;
- cardinalité et noms de variantes ;
- IMAGE et VIDEO paints ;
- piles de gradients et leurs stops/transforms ;
- copy des textes ;
- plages rich text ;
- poids, métriques et TextStyle id ;
- liens d'instances, propriétés et overrides ;
- structure du nœud Page ;
- géométrie et overflow lorsque ces faits sont protégés.

Une différence de PNG ou de structure dans la surface autorisée n'est pas à
elle seule une réussite : tous les faits protégés doivent rester identiques et
le gate owner reste obligatoire.

## Frontière actuelle

Le runner prend en charge l'audit read-only et écrit son rapport avant le
`source snapshot`. Il ne peut poursuivre vers le snapshot et le preflight
post-GO qu'après acceptation owner d'un verdict `proposal`. Un verdict `green`
s'arrête sans génération ni application.

Le workflow headless post-GO, ses refus, l'adaptateur de résultats Bridge et le
format des reçus existent. La seule frontière live restante est le transport :
ouvrir le Desktop Bridge sur le fichier épinglé et lui faire exécuter le script
généré. Après validation owner du workflow éprouvé, la skill repo-locale
`.agents/skills/figma-component-repair` en orchestre l'audit et le transport.
Elle ne contient aucune logique de composant et ne contourne aucune validation
du runner.
