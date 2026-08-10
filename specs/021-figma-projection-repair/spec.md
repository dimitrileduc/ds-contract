# Feature Specification: Réparer la projection Figma

**Feature Branch**: `main`  
**Created**: 2026-08-09  
**Status**: Draft  
**Input**: Réparer les défauts validés pendant la readiness 020 : Hero, SAV, flèches des produits e-commerce, titre des Réalisations, recadrage des Catégories, ainsi que les propriétés orphelines de Coordonnées et Formulaire, sans dégrader les autres composants ni leurs images.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Restaurer les sections visuellement cassées (Priority: P1)

En tant qu’owner du site, je veux retrouver les apparences saines validées pour Hero, SAV,
Catégories principales et Réalisations, afin que les sections visibles ne soient plus rognées,
décalées ou désorganisées.

**Why this priority**: Ces défauts touchent directement les sections principales du fichier de
design et empêchent de les utiliser comme références fiables pour la production.

**Independent Test**: Comparer chaque section réparée à sa référence validée dans 020 et vérifier
que sa géométrie, son contenu visible, ses images et ses alignements correspondent sans nouveau
défaut autour de la zone réparée.

**Acceptance Scenarios**:

1. **Given** le Hero actuel rogné, **When** la réparation est appliquée, **Then** le fond couvre de nouveau toute la section et le titre, le sous-titre et l’action sont entièrement visibles.
2. **Given** le SAV actuel dont les deux colonnes sont coupées, **When** la réparation est appliquée, **Then** le fond, le texte, l’action et l’image retrouvent la composition à deux colonnes validée.
3. **Given** les cartes de Catégories qui débordent, **When** la réparation est appliquée, **Then** les trois cartes tiennent entièrement dans la section aux positions validées.
4. **Given** le titre des Réalisations décalé, **When** la réparation est appliquée, **Then** le bloc de titre est réaligné au-dessus de la grille selon la référence validée.

---

### User Story 2 - Corriger les contrôles et propriétés composées (Priority: P1)

En tant que designer, je veux que les flèches et les propriétés exposées pilotent réellement le
contenu visible, afin que le fichier dise la vérité sur les réglages disponibles.

**Why this priority**: Une propriété qui affiche le mauvais symbole ou ne contrôle aucun élément
crée une fausse promesse et reproduit la panne à chaque réutilisation.

**Independent Test**: Changer chaque propriété concernée sur une instance témoin et vérifier que le
symbole ou le contenu attendu change, puis revenir à la valeur initiale sans modifier la géométrie.

**Acceptance Scenarios**:

1. **Given** les deux contrôles e-commerce affichant une flèche gauche, **When** les valeurs précédent et suivant sont appliquées, **Then** le premier contrôle pointe à gauche et le second à droite.
2. **Given** les propriétés orphelines de Coordonnées et Formulaire, **When** leur valeur change, **Then** le contenu enfant correspondant change visiblement et aucune propriété déclarée ne reste sans effet.
3. **Given** un autre consommateur des mêmes contrôles, **When** la correction partagée est appliquée, **Then** son état existant reste identique ou reçoit une revalidation explicite.

---

### User Story 3 - Empêcher le retour des mêmes régressions (Priority: P2)

En tant que responsable du design system, je veux qu’une nouvelle projection reproduise les
compositions superposées, les icônes choisies et les propriétés composées, afin que la réparation
ne soit pas annulée au prochain cycle.

**Why this priority**: Une correction uniquement visuelle serait temporaire et remettrait le fichier
en danger dès la prochaine synchronisation.

**Independent Test**: Reproduire deux fois les composants concernés depuis leur source gouvernée et
vérifier que le second résultat est identique au premier, tout en conservant les références saines.

**Acceptance Scenarios**:

1. **Given** un enfant déclaré hors du flux, **When** sa section est reconstruite, **Then** il reste superposé et ne contribue pas à la taille ou à l’espacement des autres enfants.
2. **Given** un choix d’icône ou de texte transmis à un composant enfant, **When** le parent est reconstruit, **Then** la valeur transmise pilote toujours le contenu visible.
3. **Given** une seconde reconstruction sans changement de source, **When** elle se termine, **Then** aucune géométrie, image, propriété ou instance ne change.

---

### User Story 4 - Réparer sans autre dégradation (Priority: P2)

En tant qu’owner, je veux disposer d’un avant vérifiable et d’un après limité aux cibles autorisées,
afin de pouvoir accepter la réparation sans craindre une nouvelle cascade de régressions.

**Why this priority**: Les régressions observées sont elles-mêmes issues d’un précédent cycle de
reconstruction; la sécurité de la réparation fait donc partie du résultat attendu.

**Independent Test**: Capturer toutes les cibles et tous leurs usages avant le premier changement,
réparer, puis comparer les mêmes cibles et confirmer que les changements hors zones autorisées sont
nuls ou explicitement refusés.

**Acceptance Scenarios**:

1. **Given** une cible dont la capture avant est absente, vide ou mal dimensionnée, **When** une réparation est demandée, **Then** le changement est refusé avant toute mutation.
2. **Given** des images portées par les masters ou leurs instances, **When** la réparation est appliquée, **Then** chaque image reste associée au même emplacement visible.
3. **Given** un changement inattendu hors des zones autorisées, **When** la comparaison finale est exécutée, **Then** le lot est refusé et n’est pas présenté comme réparé.
4. **Given** toutes les preuves après réparation, **When** l’owner tient le gate final, **Then** il peut accepter ou refuser chaque résultat sans écraser les décisions de référence de 020.

### Edge Cases

- Une image historique existe dans la référence mais ses pixels ne sont plus récupérables dans le fichier courant.
- Une réparation d’un composant partagé change un consommateur qui semblait sain lors de 020.
- Un master est corrigé mais une instance de page conserve une surcharge devenue incompatible.
- Deux images de mêmes dimensions risquent d’être échangées alors que leur nombre total reste stable.
- Une propriété possède le bon nom et la bonne valeur mais le calque visible reste statique.
- Une composition hors du flux ne fournit pas de coordonnées explicites et dépend de l’alignement de son parent.
- La référence historique contient une ancienne structure saine mais un contenu devenu volontairement obsolète.
- Le fichier actif ou la version active ne correspond pas aux pins autorisés par 020.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La réparation MUST couvrir exactement Hero, SAV, Catégories principales, Réalisations, les contrôles de Produits e-commerce, Coordonnées et Formulaire.
- **FR-002**: Chaque cible MUST utiliser la référence owner validée dans 020; aucun état courant cassé ne peut devenir la référence par défaut.
- **FR-003**: Toutes les cibles et tous leurs usages connus MUST disposer d’une capture avant vérifiée avant le premier changement.
- **FR-004**: Une capture absente, vide, illisible ou de dimensions inattendues MUST bloquer la mutation de la cible concernée.
- **FR-005**: Hero MUST retrouver son cadre complet, son plan image pleine section et l’intégralité de ses contenus visibles.
- **FR-006**: SAV MUST retrouver la composition, les dimensions et la superposition des plans validées dans 020.
- **FR-007**: Catégories principales MUST retrouver trois cartes entièrement visibles aux dimensions et positions validées.
- **FR-008**: Réalisations MUST retrouver un bloc de titre aligné selon la référence validée sans modifier le contenu ou la grille de cartes.
- **FR-009**: Les contrôles précédent et suivant de Produits e-commerce MUST afficher deux directions opposées et cohérentes avec leur rôle.
- **FR-010**: Toute propriété exposée et retenue sur Coordonnées et Formulaire MUST piloter un élément visible ou être explicitement retirée comme propriété non contractuelle.
- **FR-011**: Une composition déclarée hors du flux MUST rester hors du flux lors de toute reconstruction et ne MUST pas agrandir ni décaler ses voisins.
- **FR-012**: Un choix d’icône, de texte ou de visibilité transmis à un composant enfant MUST piloter le contenu réellement visible après reconstruction.
- **FR-013**: Les corrections partagées MUST inventorier tous leurs consommateurs connus avant application.
- **FR-014**: Chaque consommateur affecté par une correction partagée MUST être revalidé; aucun statut requis ne peut rester ouvert à la clôture.
- **FR-015**: Toute qualification antérieure de production potentiellement affectée MUST recevoir une décision explicite de maintien ou de revalidation.
- **FR-016**: Les images, surcharges d’instance, identités de masters et liens master-vers-instance MUST être préservés.
- **FR-017**: L’appariement des images et usages MUST reposer sur leur emplacement structurel et leur identité, jamais uniquement sur leur nom de calque.
- **FR-018**: Les réparations MUST rester limitées aux cibles autorisées; une modification inattendue ailleurs MUST rendre le lot non acceptable.
- **FR-019**: Deux reconstructions successives sans changement de source MUST produire le même état observable.
- **FR-020**: Chaque classe de panne réparée MUST disposer d’une vérification qui échoue sur l’ancien comportement et réussit sur le nouveau.
- **FR-021**: Les réparations directes de Catégories principales et Réalisations MUST rester ciblées; cette feature ne les transforme pas en nouveaux organismes gouvernés.
- **FR-022**: Aucun nouveau contenu, redessin ou changement esthétique volontaire ne MUST être introduit sous couvert de restauration.
- **FR-023**: Un gate owner après réparation MUST accepter ou refuser le résultat visuel de chaque cible réparée.
- **FR-024**: La clôture MUST produire un bilan avant/après listant les changements attendus, les zones inchangées, les consommateurs revalidés et toute limite restante.

### Key Entities

- **Repair Target**: Une section, un contrôle ou une propriété autorisée, liée à son identité actuelle, sa référence validée et tous ses usages connus.
- **Validated Reference**: L’état historique ou courant choisi par l’owner dans 020, avec les faits visuels et structurels à restaurer.
- **Before Capture Set**: L’ensemble complet et vérifié des preuves précédant la première mutation de toutes les cibles affectées.
- **Projection Defect**: Une règle partagée qui transforme correctement ou incorrectement une intention gouvernée en structure visible.
- **Consumer Impact**: Un composant, une section, une page ou une qualification antérieure susceptible de changer à cause d’une correction partagée.
- **Repair Receipt**: Le bilan d’une cible après réparation, avec comparaison, préservation des images, impacts et décision owner finale.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Les cinq défauts visuels signalés par l’owner — Hero, SAV, Catégories, flèches e-commerce et titre des Réalisations — correspondent tous à leur référence validée après réparation.
- **SC-002**: 100 % des propriétés retenues sur Coordonnées et Formulaire pilotent un élément visible; zéro propriété orpheline ne subsiste.
- **SC-003**: 100 % des cibles et usages affectés possèdent une preuve avant et une preuve après valides.
- **SC-004**: Zéro image est perdue, échangée ou déplacée vers un autre emplacement visible.
- **SC-005**: Zéro changement significatif non autorisé est observé hors des zones réparées.
- **SC-006**: 100 % des consommateurs connus d’une correction partagée reçoivent un verdict de revalidation.
- **SC-007**: Deux reconstructions successives sans changement produisent un résultat identique sur toutes les cibles concernées.
- **SC-008**: Toutes les classes de panne identifiées dans 020 sont détectées automatiquement si l’ancien comportement est réintroduit.
- **SC-009**: 100 % des cibles présentées au gate final sont acceptées par l’owner ou restent explicitement refusées; aucune cible ne reçoit un succès implicite.
- **SC-010**: Le bilan final relie 7/7 cibles, leurs références, leurs changements, leurs consommateurs et leurs décisions sans entrée manquante.

## Assumptions

- Les décisions et références de `020-figma-contract-readiness` sont l’autorité de départ et ne sont pas rejouées.
- Hero et SAV sont restaurés vers les versions historiques validées dans 020; les autres cibles suivent les décisions enregistrées dans le même dossier.
- Catégories principales et Réalisations restent des organismes complexes non gouvernés dans cette feature; seule leur restauration ciblée est autorisée.
- Produits e-commerce est concerné uniquement par ses contrôles précédent/suivant et leurs impacts partagés.
- Les contrats courants sont présumés corrects jusqu’à preuve contraire; tout changement contractuel découvert doit être nommé et revalidé avant d’entrer dans le lot.
- La réparation s’effectue dans le fichier Figma et sur les pins identifiés par 020; un autre fichier ou une autre version exige un nouveau préflight.
- La qualification Odoo n’est pas étendue ici; seules les éventuelles revalidations rendues nécessaires par une dépendance partagée entrent dans le périmètre.
