# Research — 028 Finaliser HeroVideo responsive dans Figma

Cette recherche borne une campagne Figma-only. Elle ne promeut aucun fait dans le
contrat HeroVideo, ne modifie aucun émetteur et ne qualifie ni le web ni Odoo.

## R1 — Autorité historique réutilisable

**Decision**: reprendre uniquement le baseline H1 et la direction de layout H2 de
la feature 027 comme historique. Le baseline attendu est le HeroVideo Wide
1728×720, master `2151:5552`, key
`36011e51b8bc0b221a1ba6f9108709b5bd1c4490`, Container `2448:4731` et usage
Home `2170:6351`. La direction retenue est `centre-immersif`: Compact et Desktop
en colonne centrée, Wide identique à l'historique.

**Rationale**: `decisions/H1-baseline.json`, `decisions/H2-responsive.json` et
`inventory/H2-option-packet.md` de 027 enregistrent ces deux décisions owner. Le
plan 027 est toutefois marqué `Superseded`; ses phases contrat, code, Odoo et ses
valeurs de preview ne sont plus exécutables.

**Alternatives considered**: rejouer le plan 027; prendre ses captures comme
audit frais; réutiliser automatiquement `{space.24}`, `{space.48}` ou 44/48 en
Compact/Desktop.

## R2 — Audit frais et défaut CTA Home read-only

**Decision**: ouvrir 028 par un audit live en lecture seule, par identité et
position. Le défaut historique du label CTA Home — lien au Text Style
`2162:5834` perdu alors que les métriques restent Montserrat Medium 16/22 — est
enregistré comme contexte Page read-only. Il n'est ni corrigé ni bloquant. Le CTA
et tous les enfants restent hors du périmètre d'écriture.

**Rationale**: l'audit 027 est daté et ne prouve pas l'état courant. La clarification
owner de 028 supersède son ancienne disposition bloquante: cette campagne modifie
uniquement le parent HeroVideo et vérifie ses contextes sans écrire la Page.

**Alternatives considered**: corriger silencieusement l'instance Home; traiter le
CTA comme prérequis; réinitialiser le Button ou le Hero; omettre le défaut de
l'inventaire historique.

## R3 — Variants de présentation et Auto Layout interne

**Decision**: représenter la rupture réelle de composition par une propriété
sémantique `Presentation=Compact|Desktop|Wide`, jamais par des variants nommés
d'après des largeurs. Chaque membre utilise Auto Layout pour le reflow, Fill/Hug,
les alignements et la croissance avec le contenu. Tablet 834 sélectionne
explicitement `Compact`; aucun état Tablet n'est créé.

**Rationale**: la composition centrée de Compact/Desktop et l'organisation basse
horizontale de Wide ne sont pas le même design. Les variants sont donc adaptés à
la différence d'organisation, tandis qu'Auto Layout gère les adaptations internes.
La documentation Figma confirme que « Combine as variants » crée un component set
et déplace les composants existants sous ce parent, ce qui impose une preuve de
préservation avant application.

**Alternatives considered**: Auto Layout seul; modes responsive globaux; deux
composants métier séparés; un variant Tablet; `Width=390|834|1200|1728`.

**Sources**: [Responsive dans Figma Design](../../docs/responsive-figma.md),
[Figma — Create and use variants](https://help.figma.com/hc/en-us/articles/360056440594-Create-and-use-variants),
[Figma Plugin API — combineAsVariants](https://developers.figma.com/docs/plugins/api/properties/figma-combineasvariants/).

## R4 — Sélection explicite, sans breakpoint automatique

**Decision**: les témoins choisissent leur état manuellement: 390 et 834 utilisent
Compact, 1200 utilise Desktop, 1728 utilise Wide. Les contrôles 320 et 1440 ainsi
que le paysage court sélectionnent eux aussi explicitement la composition attendue.
Le resize ne démontre que le comportement fluide de l'état actif.

**Rationale**: Figma Design applique Auto Layout, Fill/Hug, Min/Max et le reflow,
mais ne change automatiquement ni mode ni variant au redimensionnement. Les media
queries et container queries restent absentes du canvas Design.

**Alternatives considered**: déclarer un breakpoint automatique; lier une variable
globale `viewport`; utiliser les breakpoints de Figma Sites, qui est un autre
produit.

## R5 — Choix et preuve des primitives

**Decision**: inventorier dans l'audit frais les primitives numériques existantes,
puis lier directement chaque gap, padding et dimension d'espacement approuvée. La
proposition H2 enregistre `composition → node/path → propriété → variable id/nom →
valeur résolue`. Une primitive absente ou incompatible arrête la proposition; aucune
valeur brute ni nouvelle variable n'est créée.

**Rationale**: Figma permet d'appliquer des number variables aux dimensions,
min/max, padding, gap, font size et line height. Une liaison directe rend les
observations comparables pendant la campagne Home sans leur attribuer prématurément
un rôle responsive global. Les contrôles sur canvas peuvent détacher une variable
de padding/gap: l'audit after doit donc vérifier les `boundVariables`, pas seulement
la valeur résolue.

**Alternatives considered**: reprendre les valeurs de preview 027; choisir la
primitive la plus proche; accepter un literal temporaire; créer une collection ou
un mode responsive HeroVideo.

**Source**: [Figma — Apply variables to designs](https://help.figma.com/hc/en-us/articles/15343107263511-Apply-variables-to-designs).

## R6 — Typographie locale temporaire

**Decision**: Wide garde exactement le Text Style `Titre Hero vidéo` et ses
métriques historiques. Compact ou Desktop peuvent, après H2, appliquer localement
uniquement `fontSize`, `lineHeight` et `textAlignHorizontal`. Famille, poids,
contenu et rôle restent inchangés. Chaque delta porte le marqueur
`pending-responsive-text-style`, la composition, les valeurs avant/après et la
décision owner.

**Rationale**: le manque de Text Style responsive ne doit ni empêcher de juger le
design ni conduire à substituer un rôle voisin. Le caractère local et inventorié
préserve cette dette pour la campagne transverse. Le runner actuel classe cependant
un texte sans style exact comme `defect` et ne sait pas représenter cette exception
sur de nouveaux nœuds: 028 étend cette capacité de façon générique avant H3.

**Alternatives considered**: utiliser `Titre 2` ou `Titre 3`; créer un Text Style
global maintenant; modifier famille ou graisse; conserver 44/48 partout sans le
tester.

## R7 — Hauteur minimum et croissance de contenu

**Decision**: Compact et Desktop combinent une hauteur minimale approuvée et une
croissance verticale par le contenu. Le texte est Fill en largeur et Hug/Auto en
hauteur; le root et le Container ne clippent pas et n'introduisent pas de scroll
interne. Les cas titre long, CTA long et paysage court doivent pouvoir augmenter
la hauteur.

**Rationale**: Figma permet de combiner min-height et Hug/Fill dans Auto Layout.
Une hauteur fixe peut masquer un descendant alors que le contour du composant semble
correct. Le contrôle doit donc inspecter tous les descendants visibles et les
ancêtres `clipsContent`.

**Alternatives considered**: hauteur fixe 720; pseudo-`100vh`; troncature ou
masque; scroll interne; compaction du Button.

**Source**: [Figma — Guide to auto layout](https://help.figma.com/hc/en-us/articles/360040451373-Explore-auto-layout-properties).

## R8 — Transition standalone vers component set

**Decision**: exiger avant H3 un spike mécanique enregistré prouvant que le master
historique devient le membre Wide sans perdre son node id, sa key, le lien de
l'instance Home, ses propriétés ou ses overrides. Le nouveau set et les membres
Compact/Desktop doivent être inventoriés comme créations attendues et être no-op au
second passage. 028 ajoute les capacités génériques manquantes avant toute mutation;
un échec maintient H3 bloqué dans la même feature. Aucune reconstruction ou
substitution Page n'est admise.

**Rationale**: `combineAsVariants` crée un nouveau set en reparentant des composants,
mais la documentation ne garantit pas les faits Piqueray protégés. Surtout, le
runner actuel cible soit le composant historique, auquel cas les siblings/variants
sont invisibles, soit le nouveau set, auquel cas l'identité du target change. Son
wrapper `generated-amend` déclare toujours `createdNodeIds: []`, et son contrôle
responsive ne sélectionne pas une variante par scénario. La feature doit corriger
ces limites avec fixture négative et eval avant l'application live.

**Alternatives considered**: faire confiance à l'API; cibler uniquement le nouveau
set; cacher les créations dans `generated-amend`; remplacer l'instance Home; déclarer
la préservation à partir des seuls noms de calques.

## R9 — Workflow de preuve et quatre gates humains

**Decision**: réutiliser le runner v2 mono-composant pour l'audit, le pin, les
captures et la séquence post-GO, mais créer une campagne fraîche `run-003` liée à
028. Le workflow est: audit/H1 → frames de travail/H2 → extension runner +
fixtures/evals + spike → captures before/H3 → snapshot, preflight, dry-run, apply →
after/verify → second apply no-op → idempotence/H4 → finalize. Les frames de travail
restent hors du Container gouverné et des Pages, puis sont nettoyées ou archivées
explicitement.

**Rationale**: `run-002` pointe vers la feature 027 superseded, une ancienne version
Figma, un script absent, une seule largeur et aucun `sourceBaseline`. Les quatre gates
de 028 ne sont pas encodés par le gate owner unique du runner: leurs reçus restent
des préconditions humaines obligatoires autour de la mécanique existante.

**Alternatives considered**: réutiliser `run-002`; laisser les preconditions JSON
déclaratives tenir lieu de GO; capturer uniquement le master; omettre le second
passage.

## R10 — Extension bornée du runner dans 028

**Decision**: intégrer à 028 l'évolution générique minimale du workflow
mono-composant. Elle doit représenter set et membre historique, déclarer les créations,
sélectionner une composition par scénario, vérifier les `boundVariables`, accepter
les overrides typographiques locaux explicitement approuvés et refuser les Page writes,
les mutations d'enfants et les seconds passages non no-op. Les types, validateurs,
transport, reçus et faits évoluent ensemble, précédés de fixtures rouges puis d'evals
verts.

**Rationale**: séparer cette capacité laisserait le plan et les tâches incomplets,
alors qu'elle est petite, directement nécessaire et réutilisable. L'intégrer ne change
pas le résultat produit Figma-only: aucun contrat HeroVideo, token global, émetteur de
surface, code applicatif ou Odoo n'est modifié.

**Alternatives considered**: feature préalable séparée; script HeroVideo ad hoc;
application manuelle sans reçu; élargissement général du runner au-delà des opérations
nécessaires.

## R11 — Frontière contractuelle et état Figma-ahead

**Decision**: qualifier le résultat uniquement comme source Figma pilote, marquée
`figma-ahead/pending-home-responsive-promotion`. Aucun résultat ne prétend que le
contrat, les tokens globaux, le code, les breakpoints automatiques ou Odoo convergent.
Le handoff interdit une régénération Figma non coordonnée susceptible d'écraser les
choix locaux jusqu'à leur disposition transverse.

**Rationale**: la constitution conserve le contrat comme source de vérité, tandis
que la demande owner isole volontairement une phase d'authoring Figma. Cette tension
est acceptable uniquement comme état temporaire, nommé, borné et non propagé; elle
est consignée dans le plan plutôt que maquillée en parité. La future promotion reste
une feature distincte.

**Alternatives considered**: déclarer le canvas nouvelle source de vérité; modifier
le contrat dans 028; prétendre une parité complète; laisser le drift sans statut ni
protection contre une régénération.

## Clarifications techniques résolues

- La propriété est `Presentation`, pas une largeur ni un breakpoint.
- Les états sont exactement Compact, Desktop et Wide; Tablet 834 utilise Compact.
- Les valeurs 027 sont non autoritatives; seules des primitives fraîches et approuvées
  peuvent entrer dans H2.
- Les overrides typographiques locaux sont permis mais restent une dette explicitement
  marquée; Wide ne change pas.
- Le défaut CTA Home reste un contexte read-only non bloquant; 028 ne touche aucun
  enfant partagé.
- Les capacités runner manquantes sont implémentées et testées dans 028 avant H3.
- Aucune clarification technique non résolue ne subsiste dans le plan.
