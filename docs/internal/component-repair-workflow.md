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

Un organisme est présenté une seule fois par sa racine authoring, directement
dans une FRAME locale auto-layout nommée `Container`. Tant que le composant est
autonome, cette racine est le master historique. Après une transition gouvernée
vers un component set, la racine devient le set et le membre historique reste
un enfant protégé de celui-ci. Dans les deux cas, la racine directe du Container
doit avoir `layoutSizingHorizontal = FILL`.

Les membres directs d'un component set forment le catalogue d'authoring, pas
des parents breakpoint. Ils gardent donc des largeurs d'aperçu `FIXED`
explicitement déclarées, tandis que les instances transitoires placées dans les
frames de contrôle exercent `FILL`. Une largeur d'aperçu ne devient ni une
propriété de variante ni une largeur fixe du contrat/code. Le Container ne doit
contenir ni second master ni instance de démonstration du même organisme.

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

Une racine de variante peut explicitement retirer un ancien `minWidth` avec la
valeur `null`. Cette capacité est volontairement
fermée : elle sait supprimer un verrou de largeur hérité, jamais en ajouter un.

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

### Transition responsive additive vers un component set

Le mécanisme générique `responsive-component-set` couvre une transition bornée
d'un composant historique autonome vers un set de présentations explicites. Il
est protégé par les evals enregistrées
`figma-responsive-component-set-declared-creates`,
`figma-responsive-presentation-scenarios-explicit`,
`figma-responsive-bindings-typography-allowlisted` et
`figma-responsive-boundary-idempotence`.

La campagne déclare avant émission :

- le nom de la propriété de présentation, le membre historique et sa key, les
  membres créés et les noms finaux du set ;
- chaque création attendue avec un rôle, un nom et un compte exacts ;
- les layouts Auto Layout autorisés, les bindings de variables existantes et
  les seuls champs typographiques locaux permis ;
- chaque scénario avec présentation, largeur, hauteur et fixture de contenu
  explicitement sélectionnées ;
- les nœuds existants autorisés, les surfaces Page en lecture seule, les
  dépendances et enfants protégés, ainsi que les rôles de création autorisés.
- l'état du set (`additive` ou `existing`), sa présentation par défaut, l'ordre
  d'authoring et la largeur d'aperçu de chaque membre ; la présentation par
  défaut doit rester le premier membre de cet ordre ;
- séparément, les nœuds existants autorisés pour une traversée sûre et les IDs
  exacts attendus comme modifiés au premier passage.

Le parent local qui accueille le nouveau component set est lui aussi un nœud
existant modifié par la transition : son id doit être explicitement allowlisté
et apparaître dans `changedNodeIds` avec le membre historique. Le masquer comme
une simple conséquence de la création du set est refusé par
`responsive-operation-not-allowlisted`.

Le transport clone les nouveaux membres depuis le composant historique, adopte
ce dernier comme membre préservé et crée le set comme identité additive. Il ne
reconstruit pas le membre historique et ne change aucun descendant existant. Les
preuves de scénario utilisent uniquement des instances transitoires hors Page,
puis les suppriment après capture.

Le set reste un catalogue libre (`layoutMode=NONE`) et remplit le Container.
Ses membres utilisent les largeurs d'aperçu déclarées en `FIXED`; leurs enfants
internes peuvent rester Fill/Hug. Chaque scénario crée ensuite une instance dans
une frame à la largeur contrôlée, sélectionne explicitement `Presentation` et
met cette instance en `FILL`. Le runner refuse un set auto-layout qui égalise les
largeurs, une présentation par défaut non déclarée ou un membre dont la largeur
d'aperçu dérive.

Le premier reçu doit énumérer exactement `createdNodes` avec les rôles déclarés,
la topologie set+membres, l'identité du membre historique, la présentation active
de chaque scénario, les bindings attachés, les overrides typographiques bornés et
les faits communs des membres. Les diagnostics stables sont
`responsive-operation-not-allowlisted`, `unexpected-created-node`,
`presentation-not-selected`, `primitive-binding-detached`,
`typography-field-not-allowlisted`, `page-write-forbidden`,
`shared-child-write-forbidden` et `second-pass-not-noop`.

Au second passage, les mêmes operation ids sont rejoués. Le reçu n'est accepté
que si toutes les opérations sont `no-op`, avec `createdNodeIds: []`,
`createdNodes: []`, `changedNodeIds: []`, `pageWrites: []` et `childWrites: []`.
Les captures after/idempotence et tous les faits protégés restent ensuite soumis
à la comparaison canonique du workflow.

### Adaptation responsive dans un set existant et sélection multi-axes

Le même mécanisme `responsive-component-set` accepte aussi une topologie déjà
formée. Dans ce cas, l'opération cible l'identité épinglée du set, et non un nom
de composant. Le manifeste sépare explicitement `preservedMembers` (node IDs et
keys inchangés) de `createdMembers` (créations réellement attendues, liste vide
autorisée). Le dry-run et le reçu ne peuvent donc pas transformer une création
nulle en création implicite ni masquer une création inattendue.

Cette branche est qualifiée par les evals
`figma-responsive-existing-set-topology`,
`figma-responsive-multiaxis-scenarios`,
`figma-responsive-bindings-typography-allowlisted` et
`figma-responsive-boundary-propagation-idempotence`. Elle ajoute aux déclarations
de campagne :

- le vocabulaire fermé de chaque axe de variante (`variantProperties`) et la
  sélection exacte de chaque membre ;
- la paire ou combinaison d'axes sélectionnée pour chaque scénario, binding,
  layout et override typographique — une largeur seule ne sélectionne jamais un
  état ;
- les `authorizedTargetNodeIds`, disjoints des Pages, dépendances et enfants
  partagés protégés ;
- chaque usage read-only par `surfaceId`, node ID et chemin de position ;
- les deltas de propagation attendus avec surface, source, fait et attribution.

Le Bridge ne modifie jamais une instance d'usage. Il applique seulement les
layouts, bindings et exceptions typographiques déclarés à l'intérieur du set,
sur les membres sélectionnés. Les changements master→instances sont transportés
dans `propagatedDeltas` et le reçu refuse toute ligne absente, supplémentaire ou
`unattributed`. `pageWrites` et `childWrites` restent des listes vides ; côté
composite, une instance du composant enfant appartient à la frontière
`shared-child-write-forbidden`, même si son rendu évolue par propagation native.

Le parent document d'un set existant (`Page`, `Section` ou `Frame`) est
strictement traversé pour retrouver le set : il n'est ni allowlisté comme cible,
ni déclaré modifié. Seule une transition additive qui combine des composants en
nouveau set peut modifier la topologie de son parent.

La capture de scénarios utilise des instances transitoires et sélectionne la
combinaison d'axes déclarée avant d'appliquer la fixture. Les surfaces d'usage
restent couvertes par le cycle global before/after/idempotence et ne sont jamais
réutilisées comme surfaces de mutation. Le reçu distingue créations, changements
existants, no-op et propagations attribuées. Au second passage, toute création,
mutation ou propagation non identique est refusée par `second-pass-not-noop`.

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

## Outillage de vague (spec 030)

Cinq ajouts, tous **additifs** : une campagne qui n'en déclare aucun se comporte
exactement comme avant. Chacun a sa fixture rouge et son eval enregistrée sous
`figma-projection-repair-*` ; les limites sont écrites ici, à l'endroit où la
capacité est revendiquée.

### Générateur de manifeste

```bash
npm run component:repair:manifest -- --releve <audit.json|dump.json> --out <campaign.json> [--component <id>]
```

Inverse un relevé **déjà acquis** vers un `campaign.json`. Aucune lecture Figma
vive. Le manifeste produit repasse par `validateRepairCampaign` avant d'être
écrit : la génération ne contourne aucun refus. Sorties : le manifeste et
`manifest-report.json`.

Fonction pure, sans horloge — `createdAt` et `filePin.capturedAt` sont lus dans
le relevé, donc deux exécutions sur la même entrée sont byte-identiques. Le CLI
lit les documents que le relevé **nomme** (`*Ref` bornés) et les lui passe ; le
générateur, lui, ne touche pas au système de fichiers.

Refus nommés : `releve-unreadable`, `component-not-found-in-releve`,
`generated-campaign-invalid` (avec les issues de validation citées verbatim).

**Ce qu'il ne fait pas, et c'est écrit dans le manifeste.** Tout champ qu'il ne
sait pas déduire est émis à sa valeur la plus conservatrice **et nommé** dans
`generated.nonDeductible[]`. Sur la section de 029 cela fait 17 champs, dont
l'espacement d'authoring du catalogue, les largeurs témoins, la référence de
décision owner et les fixtures de contenu. Un manifeste généré est **légal**,
pas **prêt à poser** : les 17 sont des décisions.

**Limite.** Un dump de pont read-only (`H1-bridge-read-only.json`) inventorie les
nœuds mais **n'épingle aucune version de fichier**. Seul, il est refusé
`releve-unreadable` en nommant la version manquante, plutôt que de se voir
inventer un pin ; accompagné d'un document qui en épingle une, il produit le même
set et les mêmes membres qu'un audit.

**Limite.** Le générateur refuse de choisir : un relevé portant plusieurs
component sets exige `--component`.

### Preflight des verrous hérités

Le preflight écrit `preflight-locks.json` (`locks` / `waived` / `blocking`) dans
le dossier de run, et refuse `inherited-size-lock` **avant le dry-run** si un
verrou n'est couvert ni par une dérogation ni par une suppression déclarée.

```
inherited-size-lock: <nodeId>.<property>=<value> (hérité de <inheritedFrom>) — corriger à la source ou déclarer une dérogation référencée
```

La distinction sur laquelle tout repose :

- un **plancher ou un plafond** (`minWidth`/`maxWidth`/`minHeight`/`maxHeight`)
  contredit un comportement responsive où qu'il soit. C'est la classe du verrou
  744 px qui a coûté 33 minutes et une restauration manuelle en 029 ;
- une **dimension figée** n'est un verrou que si un **ancêtre** la porte. Une
  racine de variante `FIXED` à sa largeur d'authoring est la convention de
  catalogue que ce runner exige déjà (`responsive-authoring-preview-required`) ;
  la bloquer bloquerait toutes les campagnes du dépôt.

Une dérogation (`lockWaivers[]`) exige un `decisionRef` : le runner ne
s'auto-autorise jamais. Un plancher que la campagne déclare retirer
(`presentationLayouts[].properties.minWidth: null`, la capacité fermée
removal-only décrite plus haut) est enregistré comme **déclaré**, pas comme
bloquant — refuser la réparation qui supprime le verrou serait absurde.

**Limite de portée.** Le relevé remonte depuis chaque surface master/variant et
**s'arrête au premier ancêtre qui n'est ni COMPONENT ni COMPONENT_SET** : un
plancher posé sur la frame de canevas qui héberge le catalogue n'est pas
rapporté par cette porte. Les verrous de **descendants** sont capturés — dans
`facts.sizeLocks`, sur toute la sous-arborescence — mais ne bloquent pas non
plus. La classe « enfants re-fixés par héritage » est donc **visible** dans la
preuve, pas **bloquante** au preflight.

### Capture allégée

```bash
npm run component:repair -- --campaign <c.json> --capture-before --capture-mode light
```

**Opt-in.** Sans le drapeau, le mode reste `full` et le comportement est
inchangé. Le mode est écrit dans la campagne au premier usage ; une
contradiction ensuite est refusée `capture-mode-mismatch` — un run ne change pas
de mode en cours de route, sinon l'avant et l'après ne mesurent pas la même chose.

Ce que `light` change, et rien d'autre : **les PNG**.

| Phase | `full` | `light` |
|---|---|---|
| faits + structure + propriétés | toutes les surfaces | **toutes les surfaces** |
| PNG avant | toutes | surfaces **déclarées** (master, membres, allowlist d'écriture) |
| PNG après | toutes | surfaces que la campagne dit **changées** + deltas propagés déclarés |
| PNG idempotence | toutes | **aucune** |

Pourquoi couper le cycle d'idempotence est sûr : la porte de no-op du second
passage est **structurelle, pas pixel** — « chaque opération doit être `no-op`,
avec zéro nœud créé et zéro nœud modifié », plus haut dans ce document. Le pixel
n'a jamais porté ce verdict.

**§X ne s'affaiblit pas.** Une surface qui doit un cliché et revient vide ou mal
dimensionnée est refusée en `light` exactement comme en `full`. Le patron est
celui de `hidden-instance`, déjà dans ce document : alléger le cliché, garder le
fait, refuser le changement silencieux.

Une seule autorité décide quelle surface doit un cliché
(`pngRequiredSurfaceIds`), lue par la capture qui écrit, la validation qui garde
les transitions et la comparaison qui relit — elles ne peuvent pas diverger.
Mesure sur le recensement réel de 029 (19 surfaces) : **57 clichés → 10**, soit
**−81,3 % de volume**, à verdicts identiques sur les neuf portes comparées.

### Driver de campagne

```bash
node scripts/component-repair-drive.mjs --campaign <c.json> [--capture-mode full|light] [--until <action>] [--backup-ref <ref>] [--resume] [--journal <path>]
```

Enchaîne les 17 étapes de « Ordre obligatoire » ci-dessus (18 avec
`--backup-ref`, qui insère `snapshot-source`) en **une** invocation, au lieu des
treize appels manuels de 029. Écrit `drive-journal.jsonl` : une ligne par étape,
avec son verdict, son intervalle et — en cas de refus — **le texte du runner cité
verbatim**. Codes retour : 0 chaîne verte, 2 refus, 3 interruption.

`--resume` reprend à la première étape non verte du journal et ne rejoue rien de
vert. `--until <action>` s'arrête après l'action nommée.

**Le driver n'implémente AUCUNE porte.** Il invoque `npm run component:repair` et
`scripts/component-repair-bridge.mjs`, et rapporte leurs verdicts sans les
reformuler. Deux autorités sur la même question, c'est ainsi qu'elles divergent.

L'invariant « jamais d'écriture sans son dry-run » est porté par **l'ordre de la
chaîne et l'arrêt au premier refus**, pas par une garde : la garde
`drive-write-without-dry-run` existe dans le source, mais elle est
**inatteignable par construction** et nommée comme telle — un filet pour qu'un
futur réordonnancement échoue fermé.

### Décision de design : `pickerConsequence` et natures VISUEL / STRUCTUREL

Schéma dans `specs/030-outillage-vague-responsive/contracts/decision-design.md`.
Le README de décisions de 029 n'est pas réécrit : l'histoire se lit, elle ne se
falsifie pas.

Deux champs obligatoires pour toute décision de design à partir de 030 :

- `pickerConsequence` — **une phrase française** décrivant l'état du sélecteur de
  variantes après application ;
- par fait accepté, `nature` (`visuel` | `structurel`) et `witnessRef`.

Un fait `visuel` est témoigné par un rendu 1:1. Un fait **`structurel`** — topologie
du set, sélecteur, axes, Text Styles — est témoigné par une **capture du
sélecteur** : aucun rendu ne peut le montrer, un wrap interne et un axe
Presentation ont les mêmes pixels. C'est l'écart E2 de 029, qui a coûté une
journée, et le principe §XII ne le couvre pas : §XII impose la fidélité de
*présentation*, et sa première phrase (« seulement les alternatives qui produisent
une différence visible ») pourrait même légitimer l'omission.

Refus nommés : `picker-consequence-missing`, `picker-consequence-not-in-french`,
`structural-fact-unwitnessed`, `accepted-fact-short-form` (la forme
`acceptedFacts: string[]` de 029 est **lue** pour l'histoire, jamais écrite).

### Générateur de planche owner

```bash
npm run component:repair:board -- --decisions <dir> --witnesses <manifest.json> --usages <inventaire.json> --out <dir>
```

Produit `zones.json` (le contrat vérifiable machine) et `board.bridge.js` (le
script de construction, exécutable par le pont **ou** par le mock). Les 7 zones
du gabarit §XII + corollaire E2 : usage pondéré · « ce que vous verrez » · « ce
que vous n'aurez pas » · sélecteur avant→après · témoins 1:1 delta-only ·
décisions une-ligne · pied avec archive référencée.

Checks machine : `structuralFactsAllWitnessed`, `negativeStatementsInFrench`,
`noScaledThumbnails`, `archiveRef`. Ce sont des **reçus de portes qui ont
tourné** : chaque chemin de refus sort avant de les poser.

Refus nommés : `structural-fact-unwitnessed`, `witness-missing-for-width`,
`negative-statements-missing`, `scaled-witness-refused`,
`board-input-unreadable`.

L'archive technique reste **référencée, pas étalée** : zéro image au pied. Le
défaut de 029 était l'absence de témoin structurel, pas l'existence de l'archive
— ne pas sur-corriger.

**Limite.** `negativeStatementsInFrench` **n'identifie pas une langue**. Il
vérifie que chaque mention négative ouvre sur un marqueur d'une liste française
fermée (« Vous n'aurez pas », « Aucun/Aucune », « Pas de », « Le sélecteur
ne »…) et porte des marqueurs grammaticaux français. C'est assez pour attraper la
panne qui s'est produite — une conséquence scellée en anglais abstrait — et c'est
vérifiable par machine, ce que de la prose libre n'est pas.

**Limite.** L'exécution vive du script est **hors du périmètre de 030**, qui ne
mute aucun canevas : la pose appartient à la spec de vague, où §X s'applique.

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
