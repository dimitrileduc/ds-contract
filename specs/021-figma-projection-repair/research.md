# Recherche : réparation de la projection Figma

## R1 — Autorité des références et périmètre exact

**Decision**: reprendre sans les rejouer les décisions owner et les pins de la readiness 020. Les
sept cibles sont `hero`, `sav`, `categories-principales`, `realisations`,
`produits-e-commerce`, `coordonnees` et `formulaire`. Hero et SAV utilisent les versions historiques
validées; Coordonnées et Formulaire conservent leur apparence courante validée; les trois extensions
visuelles utilisent les références consignées dans
`specs/020-figma-contract-readiness/proofs/visual-reference-review-2026-08-09.json`.

**Rationale**: FR-001/002 interdisent de transformer l'état cassé courant en nouvelle référence. Le
reçu 020 fournit les identités, dimensions, hashes et faits visibles nécessaires : Hero 1728×640,
SAV 1550×677, trois cartes Catégories de 474 px en x=89/627/1165, en-tête Réalisations
x=204,5/w=1319, et chevrons opposés sur CarouselControls.

**Alternatives considered**: ré-auditer l'intention (duplique 020 et risque de déplacer la décision
owner); prendre le canvas courant (explicitement cassé); choisir la version la plus récente
(récence non probante).

## R2 — Modèle unique pour `position:absolute`

**Decision**: étendre la compilation Figma afin que toute part déclarant `position:absolute` porte
un plan de placement hors flux explicite. Le runtime applique `layoutPositioning = "ABSOLUTE"`
seulement après `appendChild`, puis résout l'un des trois modes : insets explicites, étirement plein
parent pour un plan image sans boîte propre, ou position statique calculée depuis l'alignement du
parent et `align-self` pour une boîte mesurée. Une impossibilité de placement devient un refus nommé,
jamais un `catch` qui laisse silencieusement l'enfant dans le flux.

**Rationale**: l'API Figma n'accepte le positionnement absolu que pour un enfant direct d'une frame
auto-layout et précise que ce changement retire l'enfant du calcul de taille du parent. C'est
exactement l'invariant cassé sur Hero et SAV. L'émetteur possède déjà des chemins partiels
(`applyShapeAbsolute`, `applyInsetOverlay`), mais le `position:absolute` générique de ces contrats ne
les atteint pas. Voir la documentation Figma sur
[`layoutPositioning`](https://developers.figma.com/docs/plugins/api/properties/nodes-layoutpositioning/).

**Alternatives considered**: cas spéciaux Hero/SAV (ne prévient pas la régression); convertir les
parts en `overlay` de bord (sémantique différente); ajouter des tailles/insets artificiels aux
contrats (modélise autour du défaut moteur et viole l'autorité du contrat).

## R3 — Transmission vivante des propriétés composées

**Decision**: compiler les valeurs enfant de forme exacte `{propParent}` comme des liaisons de
propriété, en plus de leur défaut statique. Après création des propriétés du parent et obtention de
leurs clés Figma suffixées, le runtime repère la propriété native correspondante du composant enfant
par identité de définition/référence et relie le nœud visible imbriqué à la clé du parent via
`componentPropertyReferences`. La résolution ne dépend jamais du nom d'un calque. Le mock doit
propager cette référence afin qu'un changement sur une instance du parent modifie le texte visible.

**Rationale**: Figma documente que les propriétés de composant sont appliquées aux sous-calques par
`componentPropertyReferences`, et que la clé complète retournée par `addComponentProperty` doit être
conservée. Le code actuel remplace `{titre}` par son défaut lors de la compilation, puis pose ce
défaut une fois sur l'instance enfant : l'API est déclarée mais morte. Cette décision conserve la
frontière d'instance et rend la propriété réellement pilotable. Voir
[`componentPropertyDefinitions`](https://developers.figma.com/docs/plugins/api/properties/ComponentPropertiesMixin-componentpropertydefinitions/)
et [`InstanceNode`](https://developers.figma.com/docs/plugins/api/InstanceNode/).

**Alternatives considered**: exposer toute l'instance enfant avec `isExposedInstance` (expose aussi
des propriétés non contractuelles); aplatir SectionHeader dans le parent (perd l'identité composée);
garder une copie littérale (reproduit l'orphelin).

## R4 — Correction contractuelle minimale de Formulaire

**Decision**: modifier la source `contracts/formulaire.contract.json` pour que les props de son
SectionHeader soient `{titre}` et `{accroche}`, comme Coordonnées le fait déjà, puis appliquer le bump
semver approprié et régénérer. Aucun fichier sous `src/components/` ou `figma-sync/` n'est édité à la
main.

**Rationale**: le contrat Formulaire déclare des propriétés racines mais transmet aujourd'hui des
littéraux à son enfant. Le moteur ne peut pas inférer honnêtement une liaison absente de la source.
La découverte constitue le changement contractuel nommé prévu par les hypothèses de la spec; l'API
publique ne change pas, mais sa projection Figma devient conforme à l'intention déjà déclarée.

**Alternatives considered**: règle spéciale basée sur les noms `Titre`/`Accroche` (heuristique
silencieuse); supprimer les propriétés (casse l'API déjà gouvernée); éditer le master seul (perdu à
la reconstruction suivante).

## R5 — Une `INSTANCE_SWAP` doit piloter une instance visible

**Decision**: lorsqu'un `icon.asset` est alimenté par une prop enum liée à Figma en
`INSTANCE_SWAP`, compiler le glyph en instance du composant d'icône gouverné, résolu depuis
`contracts/icons.registry.json`, et relier `mainComponent` à la propriété de swap. Les icônes
statiques restent des SVG. Les valeurs préférées et les identités viennent du registre; aucun nom de
calque consommateur n'est utilisé comme clé.

**Rationale**: Button possède déjà `Glyphe gauche`/`Glyphe droite`, mais l'émetteur bake le défaut en
SVG; changer la propriété n'a donc aucun effet visible. La documentation Figma donne précisément le
patron `INSTANCE_SWAP` → `componentPropertyReferences.mainComponent`. Cette correction rend le
second contrôle de CarouselControls réellement droit et ferme la limite D8 documentée au lieu de la
contourner.

**Alternatives considered**: retourner directement le SVG du second bouton (répare une seule
instance); créer une variante Button par icône (explosion cartésienne); rotation CSS/Figma du même
glyph (faux choix sémantique et mauvaise identité d'icône).

## R6 — Réparations directes de Catégories et Réalisations

**Decision**: conserver ces organismes hors gouvernance nouvelle et appliquer deux opérations
déclaratives bornées par node id et version : restaurer uniquement la variante Catégories
`2115:4275` et uniquement le bloc d'en-tête de la variante Réalisations `2117:4690`. Les opérations
portent les dimensions/positions issues de 020 et refusent toute structure ou pin inattendu.

**Rationale**: FR-021 interdit de transformer ces sections en nouveaux organismes gouvernés. Leurs
défauts sont locaux et leurs références sont mesurées. Une mutation déclarative, préflightée et
rejouable donne une preuve plus forte qu'une correction manuelle sans reçu.

**Alternatives considered**: importer les contrats proposés de `extract/out/figma/` (élargissement
de périmètre); reconstruire les sets complets (risque images/overrides); correction manuelle non
rejouable (pas d'idempotence ni de check adversarial).

## R7 — Capture globale, images et refus avant mutation

**Decision**: un manifeste de campagne inventorie masters, variantes, usages et consommateurs
partagés. `capture-before` doit produire pour chaque entrée un PNG non vide aux dimensions attendues,
un état structurel, les identités master→instance, les propriétés et un inventaire positionnel des
peintures IMAGE. Le lot entier reste en `draft` tant qu'une seule preuve manque. La passe de sauvetage
photo existante est réutilisée; les appariements restent `hostId + cheminPosition + imageHash`.

**Rationale**: principes X et FR-003/004/016/017. Les docs du dépôt établissent qu'une version
historique Figma ne redonne pas les pixels et que la reconstruction détruit les overrides d'image si
elle n'est pas précédée de la pré-passe. Un compteur de hashes ne détecte pas une permutation.

**Alternatives considered**: capturer cible par cible juste avant son écriture (une mutation
partagée peut déjà affecter les suivantes); compter les images (ne détecte pas l'échange); apparier
par nom (interdit par la constitution VIII).

## R8 — Orchestration, idempotence et impact partagé

**Decision**: exécuter un seul writer canvas pour ce lot. L'ordre est : préflight/capture globale,
fixtures rouges, correctifs moteur/contrat, build et gates headless, dry-run, application engine,
réparations directes, capture après, reconstruction identique une seconde fois, nouvelle capture et
comparaison. Tout consommateur contractuel de Button, SectionHeader ou du lowering absolu reçoit un
verdict; les pins Odoo 019 potentiellement affectés reçoivent maintien ou revalidation explicite.

**Rationale**: le writer unique rend le principe XI N/A et réduit la coordination sur un fichier
partagé. Deux reconstructions prouvent FR-019. L'inventaire par graphe empêche qu'une correction de
Button soit validée uniquement sur Produits e-commerce alors que onze autres contrats le composent.

**Alternatives considered**: writers parallèles (aucun gain requis pour sept cibles et cycle pixel
plus délicat); valider uniquement les cibles visibles (ignore les consommateurs partagés); un seul
rebuild (ne prouve pas la stabilité).

## R9 — Stockage et contrats de workflow

**Decision**: ajouter deux schémas JSON spec-locaux : `repair-campaign.schema.json` pour les pins,
cibles, références, captures, impacts et états; `repair-receipt.schema.json` pour le résultat,
l'idempotence, la préservation d'images et la décision owner. L'orchestrateur générique vit dans
`extract/figma/projection-repair/`; les valeurs propres aux sept cibles restent sous cette spec.

**Rationale**: JSON versionné rend les refus automatisables et les diffs revus; Markdown reste la
vue humaine. La séparation évite de faire des reçus de campagne une nouvelle source de vérité du
produit.

**Alternatives considered**: Markdown seul (gates non fiables); incorporer au schéma composant
(mauvais domaine); scripts ad hoc sans données structurées (impossible à rejouer proprement).

## R10 — Docs-first et source technique

**Decision**: appliquer `docs/FIGMA-CAPABILITY-MATRIX.md`,
`docs/handoff/08-status-what-doesnt-work.md`, les reçus 016/017 et la clôture 020. Le MCP auggie
n'étant pas disponible dans cette session, ces sources ont été lues directement dans le worktree;
la documentation Figma officielle complète seulement les signatures Plugin API.

**Rationale**: respecte le fond du principe IX sans redériver les décisions FIXED/HUG/FILL, la
préservation des photos ou les limites du bridge.

**Alternatives considered**: bloquer le plan faute de canal auggie (aucune ambiguïté documentaire);
inférer depuis le code seul (violation docs-first).
