# Feature Specification: Liens Figma dans l’éditeur Odoo

**Feature Branch**: `tough-falcon`

**Created**: 2026-08-23

**Status**: Draft

**Input**: User description: "Pour chaque section Piqueray, ainsi que pour chaque enfant visible dans le panneau de l’éditeur Odoo, fournir un lien qui ouvre le composant correspondant dans Figma dans un nouvel onglet."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ouvrir la section sélectionnée dans Figma (Priority: P1)

En tant que rédacteur ou intégrateur travaillant dans l’éditeur de site, je peux ouvrir directement la référence Figma de la section Piqueray sélectionnée afin de comparer le bloc édité avec sa définition de design sans devoir rechercher manuellement le composant.

**Why this priority**: C’est la valeur principale de la fonctionnalité : réduire la friction entre l’édition du site et la consultation de la référence de design.

**Independent Test**: Sélectionner successivement chaque type de section Piqueray disposant d’un panneau d’édition, utiliser son accès Figma, puis vérifier que chaque action ouvre un nouvel onglet sur le composant attendu sans modifier la page Odoo en cours.

**Acceptance Scenarios**:

1. **Given** une section Piqueray est sélectionnée et sa référence Figma est disponible, **When** le rédacteur active « Ouvrir dans Figma », **Then** un nouvel onglet s’ouvre sur le nœud Figma précis correspondant à ce type de section.
2. **Given** une page Odoo comporte plusieurs instances d’un même type de section, **When** le rédacteur utilise le lien depuis l’une de ces instances, **Then** la référence du composant maître correspondant s’ouvre et aucune instance de la page n’est modifiée.
3. **Given** le nouvel onglet Figma a été ouvert, **When** le rédacteur revient à l’éditeur Odoo, **Then** sa sélection et ses modifications non sauvegardées sont conservées.

---

### User Story 2 - Ouvrir un enfant sélectionnable dans Figma (Priority: P2)

En tant que rédacteur ou intégrateur, lorsque je sélectionne un enfant qui possède son propre panneau dans l’éditeur, je peux ouvrir directement la référence Figma propre à son type de composant.

**Why this priority**: Les cartes et rangées imbriquées sont précisément les éléments pour lesquels une recherche manuelle dans Figma est la plus coûteuse et la correspondance avec la section parente la moins évidente.

**Independent Test**: Dans les sections qui exposent des panneaux enfants, sélectionner au moins un avis, un membre, une question FAQ, une ligne Texte SEO, une carte Réassurances et une carte Catégorie, puis vérifier que chaque panneau ouvre le bon composant maître Figma.

**Acceptance Scenarios**:

1. **Given** un enfant sélectionnable possède son propre panneau et une référence Figma, **When** le rédacteur active « Ouvrir dans Figma », **Then** un nouvel onglet s’ouvre sur le nœud Figma précis du type de cet enfant plutôt que sur celui de la section parente.
2. **Given** plusieurs enfants d’un même type sont présents dans une collection, **When** le rédacteur ouvre Figma depuis chacun d’eux, **Then** ils conduisent tous vers la même référence de composant maître et aucune donnée d’instance n’est altérée.
3. **Given** un composant est visible dans le rendu mais ne possède aucun panneau propre dans l’éditeur, **When** le rédacteur sélectionne la section ou un autre élément exposé, **Then** aucun accès distinct n’est inventé pour ce composant interne.

---

### User Story 3 - Garantir des liens fiables et gouvernés (Priority: P3)

En tant qu’owner du design system, je peux faire évoluer les références Figma des contrats sans devoir maintenir une seconde liste indépendante de liens dans l’intégration Odoo, et je peux détecter avant livraison toute couverture manquante ou destination incohérente.

**Why this priority**: Un accès rapide n’est durable que si les destinations restent alignées sur la source gouvernée et si les omissions deviennent visibles plutôt que silencieuses.

**Independent Test**: Contrôler automatiquement la couverture de tous les panneaux Piqueray concernés, modifier une référence dans une donnée source de test, puis vérifier que la destination attendue évolue sans modification manuelle d’une URL propre au panneau.

**Acceptance Scenarios**:

1. **Given** la référence Figma gouvernée d’un composant change, **When** les artefacts destinés à l’éditeur sont actualisés selon le flux normal du projet, **Then** le panneau utilise la nouvelle destination sans exiger la mise à jour manuelle d’une URL dupliquée.
2. **Given** un nouveau panneau Piqueray racine ou enfant entre dans le périmètre de l’éditeur, **When** la couverture de la fonctionnalité est contrôlée, **Then** l’absence de correspondance Figma est signalée explicitement avant qualification.
3. **Given** une référence Figma requise est absente ou invalide, **When** le panneau concerné est affiché, **Then** aucune destination trompeuse ou mal formée n’est ouverte et l’indisponibilité est explicitement identifiable.

### Edge Cases

- Figma est inaccessible, le navigateur est hors ligne ou l’utilisateur ne possède pas les droits sur le fichier : l’éditeur Odoo reste utilisable et aucune donnée de page n’est modifiée.
- Le navigateur bloque l’ouverture d’un nouvel onglet : l’action ne doit pas remplacer l’éditeur Odoo dans l’onglet courant ni déclencher une modification de contenu.
- Une référence de fichier existe mais le nœud précis est absent : la couverture est considérée incomplète ; la fonctionnalité ne doit pas dégrader silencieusement la destination vers la seule racine du fichier.
- Plusieurs panneaux Odoo représentent le même contrat : ils doivent aboutir à une destination cohérente, sans duplication divergente.
- Un élément masqué, un blueprint de collection ou un composant purement interne ne doit pas être compté comme un enfant visible disposant de son propre panneau.
- Une page contient des sections natives Odoo ou issues d’un autre addon : aucun accès Figma Piqueray ne doit apparaître dans leurs panneaux.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Chaque panneau d’une section racine Piqueray sélectionnable MUST présenter un accès clairement libellé « Ouvrir dans Figma » lorsque sa référence gouvernée est disponible.
- **FR-002**: Chaque panneau propre à un enfant Piqueray sélectionnable MUST présenter le même accès pour le type de composant enfant correspondant.
- **FR-003**: Le périmètre enfant de la V1 MUST couvrir au minimum les types actuellement exposés par un panneau propre : carte d’avis, carte membre, rangée FAQ, rangée Texte SEO, carte Réassurances et carte Catégorie.
- **FR-004**: L’accès MUST ouvrir la destination dans un nouvel onglet ou contexte de navigation sans remplacer ni quitter l’éditeur Odoo courant.
- **FR-005**: La destination MUST identifier le fichier Figma et le nœud précis du composant maître correspondant ; un simple lien générique vers le fichier ne satisfait pas cette exigence.
- **FR-006**: L’activation de l’accès MUST être une action de consultation sans mutation du contenu, de la structure, de la sélection ou de l’état de sauvegarde de la page Odoo.
- **FR-007**: Deux instances Odoo d’un même type de composant MUST utiliser la même référence de composant maître, indépendamment de leur contenu édité.
- **FR-008**: Les destinations Figma MUST être dérivées des références gouvernées des contrats ; une liste d’URLs complète maintenue manuellement et indépendamment dans les panneaux Odoo est interdite.
- **FR-009**: La couverture MUST inclure tous les panneaux racines et enfants Piqueray présents dans la surface d’édition au moment de la qualification.
- **FR-010**: Tout panneau Piqueray couvert MUST avoir exactement une correspondance de contrat et une destination Figma non ambiguë.
- **FR-011**: Une référence requise absente, incomplète ou invalide MUST produire un état d’indisponibilité explicite et un échec de qualification ; elle MUST NOT ouvrir une destination approchée ou trompeuse.
- **FR-012**: Les composants internes qui ne disposent pas de leur propre panneau visible MUST rester hors périmètre et ne MUST pas recevoir artificiellement un contrôle distinct.
- **FR-013**: Les panneaux non Piqueray MUST rester inchangés et ne MUST afficher aucun accès Figma introduit par cette fonctionnalité.
- **FR-014**: L’accès MUST être identifiable comme une navigation vers un service externe et rester compréhensible sans connaissance préalable de la structure du fichier Figma.
- **FR-015**: L’ouverture externe MUST empêcher la nouvelle page de prendre le contrôle du contexte de l’éditeur d’origine.
- **FR-016**: La qualification MUST vérifier au moins une fois chaque type de panneau couvert sur une instance réelle de l’éditeur Odoo, en plus du contrôle exhaustif des correspondances.
- **FR-017**: L’ajout futur d’un panneau Piqueray couvert sans référence Figma associée MUST être détecté avant que la fonctionnalité soit déclarée qualifiée.

### Key Entities

- **Panneau d’édition Piqueray**: Surface de contrôle affichée lorsque le rédacteur sélectionne une section racine ou un enfant explicitement sélectionnable ; possède un type de composant unique.
- **Référence Figma gouvernée**: Identité du fichier et du nœud précis du composant maître, portée par la source contractuelle du design system.
- **Correspondance panneau–contrat**: Association unique entre un type de panneau Odoo couvert et le contrat qui fournit sa référence Figma.
- **Destination Figma**: Adresse externe finale construite à partir de la référence gouvernée et ouverte en consultation par le rédacteur.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % des types de panneaux Piqueray racines et enfants inclus dans le périmètre présentent une destination Figma correcte lors du contrôle de couverture.
- **SC-002**: Pour 100 % des types couverts testés dans l’éditeur réel, l’utilisateur atteint le nœud Figma attendu en une seule action depuis le panneau sélectionné.
- **SC-003**: Dans 100 % des essais d’ouverture, l’éditeur Odoo reste dans son onglet initial avec la sélection et l’état de sauvegarde inchangés.
- **SC-004**: Zéro URL Figma complète n’est maintenue manuellement comme seconde source indépendante dans les définitions des panneaux couverts.
- **SC-005**: Toute référence manquante ou invalide parmi les panneaux couverts est détectée avant qualification, avec zéro repli silencieux vers une destination générique.
- **SC-006**: Lors d’un test utilisateur guidé, au moins 90 % des participants identifient et ouvrent la référence Figma correcte en moins de 10 secondes après avoir sélectionné le composant dans Odoo.
- **SC-007**: Aucun panneau natif Odoo ou tiers inspecté dans le scénario de non-régression n’affiche le contrôle Piqueray.

## Assumptions

- La fonctionnalité vise les utilisateurs autorisés à ouvrir l’éditeur Website Odoo ; elle n’ajoute aucun contrôle sur le site public.
- « Chaque section » désigne les sections Piqueray possédant un panneau dans l’éditeur, y compris les surfaces système uniquement si elles exposent effectivement un tel panneau sélectionnable.
- « Enfant visible dans le panneau editor » désigne un enfant possédant son propre panneau de sélection, et non chaque sous-composant rendu visuellement dans une section.
- La destination attendue est le composant maître gouverné, pas une instance Figma de page correspondant au contenu particulier de l’instance Odoo.
- L’accès au fichier Figma et les permissions Figma restent gérés par Figma ; cette feature ne modifie ni l’authentification ni le partage du fichier.
- Les références Figma existantes des contrats sont la source autoritative ; leur correction éventuelle relève du flux de gouvernance déjà établi.
- Cette feature ajoute une aide de consultation dans l’éditeur et ne change ni l’éditabilité, ni la composition, ni le rendu public des sections.
