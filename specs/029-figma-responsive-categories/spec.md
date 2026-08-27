# Feature Specification: Rendre CategoriesPrincipales responsive dans Figma

**Feature Branch**: `just-euphonium`

**Created**: 2026-08-26

**Status**: Draft

**Input**: User description: "Rendre CategoriesPrincipales responsive dans Figma uniquement, avec sa carte Carte/Categorie, en suivant le même déroulé que HeroVideo (spec 028) : audit frais → design validé par l'owner → GO → application prouvée. La carte n'est utilisée que par CategoriesPrincipales : elle fait partie du périmètre. Tous les autres enfants partagés restent en lecture seule. D'abord un audit frais du master, de ses 4 variantes actuelles et de ses usages dans Pages. L'ancien audit desktop sert d'historique, pas de décision. Le design se cherche dans des frames de travail Figma : comment la grille et les cartes se comportent en mobile, desktop et wide, avec contenu normal et contenu long. Rien n'est appliqué au master avant validation owner. Spacing et padding pris dans les primitives existantes uniquement. Typographie locale temporaire autorisée, marquée pending-responsive-text-style. Aucun contrat, code, HTML ou Odoo. Aucune écriture de Page. Second passage no-op exigé. Clôture en figma-ahead, comme 028. Réutiliser le runner de 028, et noter chaque écart par rapport au gabarit 028 pour préparer la future skill component-to-responsive."

## Clarifications

### Session 2026-08-26

- Q: Le nombre de colonnes doit-il devenir un axe multiplié par la présentation ? → A: Non. Le nombre de colonnes est un réglage **desktop uniquement** ; en mobile le composant retombe à **une carte par ligne**, sans réglage possible. Le choix rédacteur reste **« 2 ou 3 colonnes »** et n'est pas remplacé par une case à cocher : la couche Odoo livrée par 023 expose déjà ce choix 2|3, et un énuméré s'étend là où un booléen imposerait une migration.
- Q: Le cas 3 colonnes produit une ligne orpheline (2 + 1) aux largeurs intermédiaires. Faut-il trancher maintenant ? → A: Non. C'est une décision de design qui se prend devant les témoins au **gate H2**, sur maquettes, et non au moment de la spécification. La spec l'inscrit comme question ouverte obligatoire, pas comme parti pris.
- Q: La carte `Carte/Categorie` est-elle mutable, et jusqu'où ? → A: Elle est **dans le périmètre** parce qu'elle n'a qu'un seul composeur. L'étendue exacte de ses changements (adaptation interne seule, ou états explicites) est une **décision owner au gate H2**, prise sur preuve que l'adaptation interne ne suffit pas.
- Q: Quelle posture pour `npm run parity` en clôture figma-ahead ? → A: **Décision owner au gate H4**, prise sur le rapport de dérive réel produit après mutation, et non anticipée à l'écriture de la spec.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Chercher le vrai comportement responsive dans Figma (Priority: P1)

L'owner du design system et l'agent travaillent dans des frames Figma de travail, séparées du master gouverné, pour établir comment la grille de catégories et ses cartes se comportent réellement en mobile, en desktop et en grand écran, avec du contenu normal et du contenu long — avant que quoi que ce soit ne touche la source.

**Why this priority**: Le composant est déjà gouverné et déjà livré côté Odoo. Une décision responsive prise hors Figma, ou appliquée directement au master, se paierait sur sept pages et sur une couche rédacteur en production. Le design doit être vu et accepté avant d'exister dans la source.

**Independent Test**: À partir d'un audit frais, l'owner peut comparer dans Figma des témoins mobile, desktop et grand écran pour les configurations 2 colonnes et 3 colonnes, avec titres courts et titres longs, puis accepter ou réorienter chaque décision sans qu'aucun nœud du master n'ait été modifié.

**Acceptance Scenarios**:

1. **Given** l'historique des specs 021 et 023 sur ce bloc, **When** la campagne démarre, **Then** ces preuves sont traitées comme historique consultable et un audit frais mesure l'état réel du master, de ses variantes, de sa carte et de ses usages avant toute proposition.
2. **Given** des frames de travail distinctes du master gouverné, **When** les comportements sont explorés, **Then** plusieurs options peuvent coexister sans qu'aucune ne soit présentée comme déjà appliquée.
3. **Given** un besoin d'espacement ou de padding différent d'une composition à l'autre, **When** une valeur est proposée, **Then** elle est prise dans les primitives existantes du design system et sa liaison exacte est visible dans la proposition.
4. **Given** la configuration 3 colonnes, **When** les largeurs intermédiaires sont examinées, **Then** le cas de la ligne incomplète est montré explicitement à l'owner comme une décision à prendre, jamais résolu silencieusement par l'agent.
5. **Given** que la carte doit s'adapter, **When** une modification de la carte est envisagée, **Then** la proposition démontre d'abord si une adaptation interne suffit, et ne propose des états explicites que si cette démonstration échoue visiblement.
6. **Given** plusieurs résultats visuels viables, **When** l'owner les examine, **Then** aucune décision finale ni écriture de la source n'est attribuée implicitement à l'agent.

---

### User Story 2 - Installer le responsive sans casser les sept usages ni la couche livrée (Priority: P1)

Après validation humaine, le master `CategoriesPrincipales` et sa carte deviennent responsive dans Figma, tandis que les sept usages existants sur la page Pages, l'apparence approuvée par 021, les identités de composants et la couche rédacteur Odoo livrée par 023 restent intacts.

**Why this priority**: Ce composant n'est pas un pilote isolé. Il porte deux contrats gouvernés, sept usages réels et une surface rédacteur en production. Une mutation qui perdrait une identité, un override ou l'apparence d'une page annulerait tout le bénéfice.

**Independent Test**: Après application, les sept usages rendent comme leur capture d'avant-mutation, les deux masters conservent leur identité et leurs propriétés, aucune Page n'a été écrite, et les témoins responsive présentent le comportement accepté.

**Acceptance Scenarios**:

1. **Given** l'état avant mutation capturé pour les deux masters et les sept usages, **When** le responsive est appliqué, **Then** chaque usage rend comme sa capture, et tout écart non nul est chiffré et attribué à une cause nommée.
2. **Given** les quatre combinaisons actuelles du master, **When** la mutation s'exécute, **Then** chacune reste atteignable et son rendu desktop approuvé est préservé, sauf changement explicitement accepté par l'owner.
3. **Given** le réglage de colonnes, **When** il est présenté après mutation, **Then** il dit la vérité sur ce qu'il pilote — un choix de desktop — et le mobile retombe à une carte par ligne sans réglage exposé.
4. **Given** la carte `Carte/Categorie` et son unique composeur, **When** la carte est modifiée dans les limites acceptées au gate design, **Then** aucun autre composant partagé n'est modifié, reconfiguré ni vu changer une de ses propriétés.
5. **Given** un enfant partagé qui gênerait réellement la composition, **When** le problème est constaté, **Then** il est inventorié et renvoyé vers une spec séparée sans bloquer les décisions réalisables du parent.
6. **Given** la page Pages et ses sept usages, **When** le responsive est appliqué aux masters, **Then** ils servent de contextes de vérification en lecture seule et aucun nœud de Page n'est écrit.
7. **Given** la couche rédacteur Odoo livrée par 023, **When** la campagne se termine, **Then** elle n'a été ni modifiée, ni migrée, ni déclarée convergente avec la nouvelle source Figma.

---

### User Story 3 - Livrer une source vérifiable et le relevé des écarts avec 028 (Priority: P2)

L'équipe dispose d'un `CategoriesPrincipales` responsive dans Figma, de preuves avant/après, d'un inventaire lisible des choix locaux, et d'un relevé explicite de chaque écart entre ce déroulé et celui de la spec 028 — matière première de la future skill `component-to-responsive`.

**Why this priority**: Le deuxième composant d'une campagne apprend ce que le premier ne pouvait pas apprendre. Un déroulé qui ne se compare pas au précédent produit une réussite ponctuelle au lieu d'une méthode.

**Independent Test**: Un mainteneur distinct peut retrouver, sans contexte oral, les compositions retenues, les primitives utilisées, les adaptations typographiques temporaires, les sujets différés, les faits protégés — et la liste des points où ce composant a demandé autre chose que HeroVideo.

**Acceptance Scenarios**:

1. **Given** la source finale, **When** les preuves sont consultées, **Then** chaque témoin est relié à son comportement, à ses primitives d'espacement et à son éventuelle adaptation typographique locale.
2. **Given** une valeur locale observée, **When** le dossier de handoff est produit, **Then** elle est décrite comme observation candidate et non comme variable ou style responsive global de Piqueray.
3. **Given** le gabarit de la spec 028, **When** la campagne se déroule, **Then** chaque écart est consigné au moment où il apparaît, avec sa cause, et non reconstitué après coup.
4. **Given** une seconde application de la décision finale, **When** elle est exécutée, **Then** elle ne crée ni ne modifie aucun nœud et ne change aucun fait protégé.
5. **Given** la clôture Figma, **When** la prochaine campagne commence, **Then** aucun résultat ne prétend que les contrats, le code, le HTML, Odoo ou des breakpoints automatiques ont été validés.

### Edge Cases

- Un titre de catégorie passe sur plusieurs lignes en mobile : le texte reste entièrement visible et la carte grandit plutôt que de couper.
- Une description est nettement plus longue que les autres : les cartes d'une même ligne restent cohérentes entre elles sans qu'aucun contenu ne soit masqué.
- La configuration 3 colonnes est vue à une largeur intermédiaire : le nombre de cartes par ligne présenté à l'owner est celui qui se produit réellement, ligne incomplète comprise.
- Le style superposé place du texte sur la photo : en mobile, la lisibilité du texte sur le média est vérifiée explicitement et non supposée.
- Une carte n'a pas d'image, ou une image de rapport très différent : la composition reste tenable et le comportement est montré, pas contourné par un média inventé.
- Le nombre de cartes d'un usage ne correspond pas au réglage de colonnes : le comportement de remplissage est montré à l'owner comme un cas à valider.
- Une valeur d'espacement nécessaire n'existe pas dans les primitives : la proposition s'arrête devant l'owner ; aucune valeur brute ni nouvelle primitive n'est créée silencieusement.
- Une adaptation typographique locale convient ici mais ressemble à un besoin global : elle reste locale et inventoriée jusqu'à la campagne transverse.
- L'audit frais contredit l'audit historique de 023 (nombre de variantes, usages, identités) : la contradiction retourne au gate d'audit au lieu d'être résolue silencieusement.
- L'audit frais révèle que la carte a un second composeur : l'hypothèse d'exclusivité tombe, la carte sort du périmètre mutable et la décision revient à l'owner.
- La mutation menace une identité de composant, un lien d'instance ou un override : elle est refusée tant qu'une transition préservant ces faits n'est pas prouvée.
- Un simple redimensionnement d'un frame Figma ne change pas automatiquement un état : cette limite reste visible dans les témoins et la documentation du composant.

## Requirements *(mandatory)*

### Functional Requirements

#### Périmètre

- **FR-001**: La feature MUST cibler uniquement le master Figma `CategoriesPrincipales`, sa carte `Carte/Categorie`, leurs frames de travail dédiées et les preuves nécessaires à leurs usages ; aucun autre composant partagé ni contexte de Page ne devient modifiable implicitement.
- **FR-002**: La carte MUST être traitée comme mutable uniquement tant qu'un audit frais confirme qu'elle n'a qu'un seul composeur ; si un second composeur est trouvé, la carte MUST sortir du périmètre mutable et la décision MUST remonter à l'owner.
- **FR-003**: La feature MUST NOT modifier, reconfigurer ou changer une propriété d'un enfant partagé autre que la carte ; tout besoin enfant observé MUST être inventorié puis transféré vers une spec dédiée sans être traité ici.
- **FR-004**: Le résultat produit MUST rester Figma-only et MUST NOT modifier ni revendiquer la convergence des contrats `ds.categories-principales` et `ds.carte-categorie`, des tokens globaux, des émetteurs de surfaces, du HTML, du code applicatif ou d'Odoo ; seuls le runner de réparation Figma, son transport, ses modèles de campagne et ses tests peuvent évoluer.

#### Audit frais

- **FR-005**: Un audit frais MUST précéder toute proposition ou mutation et MUST identifier, par identité et par position, le master, ses variantes actuelles, ses axes, sa carte, les instances de carte, les usages sur la page Pages, les textes, les médias, les variables, les propriétés et les overrides.
- **FR-006**: L'audit MUST recenser les usages PAR POSITION et jamais par nom, et MUST relever pour chaque usage sa configuration, son nombre de cartes et son rendu de référence.
- **FR-007**: Les preuves des specs antérieures sur ce bloc MUST être traitées comme historique consultable et MUST NOT servir de décision ; toute contradiction entre l'état frais et l'historique MUST retourner au gate d'audit.
- **FR-008**: Tout défaut préexistant MUST être séparé du delta responsive, inventorié, et MUST NOT bloquer les décisions réalisables du parent.

#### Design dans Figma

- **FR-009**: Le brainstorming MUST avoir lieu dans des frames Figma de travail distinctes des masters gouvernés et MUST pouvoir explorer plusieurs options sans les présenter comme appliquées.
- **FR-010**: Les témoins MUST couvrir le mobile, le desktop et le grand écran, pour les configurations 2 colonnes et 3 colonnes, avec contenu normal et contenu long.
- **FR-011**: Le nombre de colonnes MUST rester un réglage de desktop ; en mobile le composant MUST présenter une carte par ligne et MUST NOT exposer de réglage de colonnes.
- **FR-012**: Le choix rédacteur de colonnes MUST rester un choix entre deux valeurs nommées « 2 » et « 3 » et MUST NOT être remplacé par une case à cocher ; son intitulé MUST dire qu'il s'applique au desktop.
- **FR-013**: Le comportement de la configuration 3 colonnes aux largeurs intermédiaires, ligne incomplète comprise, MUST être présenté à l'owner comme une décision explicite au gate design, et MUST NOT être tranché par l'agent.
- **FR-014**: La proposition MUST démontrer si une adaptation interne de la grille et de la carte suffit avant de proposer des états explicites ; des états explicites MUST NOT être proposés sans cette démonstration.
- **FR-015**: Le nombre d'états ou de variantes ajoutés MUST être justifié un par un ; la feature MUST NOT créer de combinaison qu'aucun usage ni aucune décision owner ne demande.
- **FR-016**: Le rendu desktop approuvé des quatre combinaisons actuelles MUST être préservé, sauf changement explicitement accepté par l'owner et consigné.

#### Valeurs

- **FR-017**: Tout gap, padding ou dimension d'espacement modifié MUST être lié directement à une primitive existante du design system ; la feature MUST NOT créer de variable responsive sémantique, de mode responsive global ou de nouvelle primitive.
- **FR-018**: Chaque proposition de valeur MUST indiquer la primitive utilisée et la propriété qu'elle pilote, afin que la campagne suivante puisse comparer les choix entre composants.
- **FR-019**: Une composition MAY utiliser une taille, une hauteur de ligne ou un alignement typographique local lorsque l'owner juge cette adaptation nécessaire et qu'aucun style responsive n'existe encore.
- **FR-020**: Tout override typographique local MUST conserver la famille, le poids, le contenu et le rôle métier attendus, être inventorié avec sa composition et être marqué `pending-responsive-text-style`.
- **FR-021**: La feature MUST NOT créer, modifier, publier ou prétendre valider un style typographique responsive global.

#### Application et préservation

- **FR-022**: Un GO owner explicite MUST être obtenu après présentation de la proposition exacte et avant toute mutation d'un master.
- **FR-023**: Avant toute mutation live, toutes les surfaces affectées MUST posséder des captures avant vérifiées non vides et correctement dimensionnées — les deux masters ET la totalité des usages recensés, jamais un sous-ensemble pilote.
- **FR-024**: La mutation MUST préserver l'identité exploitable de chaque master, ses clés publiques, ses propriétés, les liens de ses instances et les overrides existants ; une reconstruction destructive est interdite.
- **FR-025**: Les calques communs aux variantes MUST conserver des noms et rôles cohérents afin que contenus et overrides soient préservés lors d'un changement explicite d'état.
- **FR-026**: Aucune écriture directe de Page MUST être effectuée ; tout besoin de Page nécessite une autorisation et une preuve séparées.
- **FR-027**: Chaque usage recensé MUST rendre comme sa capture d'avant-mutation ; tout écart non nul MUST être chiffré et attribué à une cause nommée.

#### Vérification

- **FR-028**: Les contrôles responsive MUST couvrir au minimum 320, 390, 834, 1200, 1440 et 1728 px, pour les configurations 2 et 3 colonnes, avec contenu normal et contenu long.
- **FR-029**: À chaque largeur de contrôle, le composant et tous ses descendants visibles MUST rester contenus, lisibles et accessibles, sans débordement horizontal, recouvrement non approuvé, coupe involontaire ni masquage par un ancêtre.
- **FR-030**: Les états Figma MUST être sélectionnés explicitement ; la feature MUST NOT prétendre qu'un redimensionnement déclenche automatiquement un état dans Figma Design.
- **FR-031**: Une seconde application de la décision finale MUST produire zéro création, zéro modification, zéro doublon, zéro écriture de Page et aucune variation des faits protégés.

#### Outillage et clôture

- **FR-032**: La feature MUST réutiliser le runner de réparation Figma de la spec 028 ; toute extension MUST rester générique, bornée par allowlist, couverte par fixture négative et eval avant sa première utilisation live, et MUST refuser les créations non déclarées, les écritures de Page, les mutations d'enfants hors périmètre et les seconds passages non no-op.
- **FR-033**: Chaque écart entre ce déroulé et le gabarit de la spec 028 MUST être consigné au moment où il apparaît, avec sa cause, en vue de la future skill `component-to-responsive`.
- **FR-034**: Le dossier de clôture MUST inventorier, pour chaque comportement retenu, la structure, les primitives, les overrides typographiques locaux, les limites, les enfants différés et les décisions owner.
- **FR-035**: La clôture MUST déclarer l'état comme source Figma en avance non convergée, MUST nommer la dérive introduite vis-à-vis des deux contrats gouvernés, et MUST interdire une régénération Figma non coordonnée susceptible d'écraser les choix locaux.
- **FR-036**: La posture exacte vis-à-vis du différentiel trois-voies MUST être décidée par l'owner au gate d'acceptation, sur la base du rapport de dérive réel produit après mutation, et MUST NOT être anticipée avant cette mesure.

### Key Entities

- **Master section**: Le composant Figma `CategoriesPrincipales`, ses axes et ses variantes actuelles, référence structurelle et visuelle protégée.
- **Carte de catégorie**: Le composant `Carte/Categorie`, dans le périmètre tant que son exclusivité de composeur est confirmée.
- **Usage**: Une instance du master posée sur la page Pages, contexte de vérification en lecture seule et référence pixel d'avant-mutation.
- **Frame de travail**: Surface Figma séparée des masters où les options sont éprouvées avant décision humaine.
- **Comportement responsive**: La manière dont la grille et ses cartes se réorganisent d'une largeur à l'autre, qu'elle soit obtenue par adaptation interne ou par un état explicite.
- **Réglage de colonnes**: Choix de desktop entre deux valeurs nommées, sans effet ni exposition en mobile.
- **Primitive de design system**: Valeur stable déjà disponible, liée directement à une propriété d'espacement ou de dimension, sans lui attribuer encore un rôle responsive global.
- **Override typographique temporaire**: Adaptation locale, datée et approuvée, conservant le rôle du texte mais différée pour externalisation.
- **Fait protégé**: Identité, clé publique, média, texte, propriété, lien d'instance ou override qui ne peut changer sans autorisation explicite.
- **Gate humain**: Point d'arrêt réel où l'owner accepte, refuse ou réoriente le travail à partir de preuves visibles.
- **Écart au gabarit 028**: Point où ce composant a demandé un traitement différent de HeroVideo, consigné avec sa cause.
- **Handoff campagne**: Inventaire des décisions et observations destiné à la future skill `component-to-responsive`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % des quatre gates humains sont datés et acceptés avant l'étape qu'ils autorisent ; aucune décision de design ni mutation de source n'est attribuée implicitement à l'agent.
- **SC-002**: Les six largeurs de contrôle, pour les configurations 2 et 3 colonnes, avec contenu normal et contenu long, présentent zéro débordement horizontal, zéro coupe involontaire et zéro contenu inaccessible.
- **SC-003**: En mobile, 100 % des témoins présentent une carte par ligne et aucun réglage de colonnes n'est exposé.
- **SC-004**: 100 % des gaps, paddings et dimensions d'espacement modifiés sont liés à des primitives existantes ; zéro valeur brute non autorisée et zéro nouvelle primitive sont introduites.
- **SC-005**: 100 % des usages recensés rendent comme leur capture d'avant-mutation, ou présentent un écart chiffré et attribué à une cause nommée acceptée par l'owner.
- **SC-006**: Les identités, clés publiques, propriétés, liens d'instance et overrides protégés des deux masters sont conservés après la mutation.
- **SC-007**: Zéro nœud de Page est modifié par la campagne.
- **SC-008**: Zéro composant partagé hors périmètre est modifié, reconfiguré ou vu changer une propriété.
- **SC-009**: 100 % des overrides typographiques temporaires sont liés à un comportement, une décision owner et une entrée de handoff ; aucun n'est présenté comme style responsive final.
- **SC-010**: La seconde application produit zéro nœud créé, zéro nœud modifié et zéro changement de fait protégé.
- **SC-011**: 100 % des créations et modifications du premier passage sont déclarées dans le reçu, et 100 % des fixtures et evals des capacités du runner utilisées passent avant l'application live.
- **SC-012**: Un mainteneur distinct retrouve sans aide orale, pour chaque comportement retenu, ses primitives, ses adaptations typographiques et ses sujets différés.
- **SC-013**: 100 % des écarts constatés vis-à-vis du gabarit de la spec 028 sont consignés avec leur cause.
- **SC-014**: Zéro capacité des contrats, du code, du HTML, d'Odoo ou de breakpoint automatique n'est déclarée validée par cette feature ; la dérive introduite est nommée et sa disposition est décidée par l'owner.

## Assumptions

- Le composant est déjà gouverné par 023 : `ds.categories-principales` et `ds.carte-categorie` existent, et une couche rédacteur Odoo est livrée. Cette feature n'y touche pas et ne prétend pas la faire converger.
- L'apparence desktop actuelle du bloc est l'apparence approuvée, héritée de la réparation visuelle de 021 ; elle reste la référence de non-régression.
- L'audit historique du 2026-08-20 relève un master à quatre variantes, une carte à un seul composeur et sept usages sur la page Pages. Ces faits sont des entrées historiques et MUST être re-mesurés par l'audit frais avant toute décision.
- Le nombre de colonnes est un choix de design assumé côté rédacteur, et non une conséquence du nombre de cartes.
- Les identifiants de nœuds, clés publiques et emplacements attendus sont ceux de l'historique tant qu'un audit frais ne prouve pas le contraire.
- Le fichier Figma est épinglé à une version fraîche avant chaque phase live, et la campagne s'exécute sur un seul pont, sur des zones disjointes.
- La future campagne responsive réutilisera le handoff de cette feature ; une feature ultérieure décidera quelles répétitions méritent des variables, modes et styles responsive partagés.

## Scope Boundaries

**In scope**:

- Audit frais du master, de ses variantes, de sa carte et de ses usages.
- Brainstorm responsive dans des frames Figma de travail.
- Comportement responsive de la grille et de la carte, en mobile, desktop et grand écran, pour les configurations 2 et 3 colonnes.
- Choix et liaison directe de primitives existantes pour espacement, padding et dimensions.
- Overrides typographiques locaux, bornés et inventoriés.
- Préservation des masters, des usages, des médias, des propriétés et des overrides.
- Captures, contrôles responsive, gates humains et second passage no-op.
- Réutilisation du runner de la spec 028 et extension bornée, testée avant usage live.
- Relevé des écarts avec le gabarit 028 et handoff vers la future skill `component-to-responsive`.

**Out of scope**:

- Création ou modification de variables responsive sémantiques, modes globaux, primitives ou styles typographiques partagés.
- Toute modification d'un enfant partagé autre que la carte.
- Modification directe d'un usage, d'un contexte ou de tout autre nœud de Page.
- Contrats, schéma produit, tokens globaux, émetteurs de surfaces, HTML, React, Web Components, CSS ou Odoo.
- Migration ou adaptation de la couche rédacteur Odoo livrée par 023.
- Breakpoints automatiques dans Figma Design.
- Responsive des autres composants de la Home.
- Création de la skill `component-to-responsive` elle-même ; cette feature en produit la matière, pas l'outil.

## Human Gates

| Gate | Décision humaine obligatoire | Preuve minimale avant décision | Interdit avant acceptation |
| --- | --- | --- | --- |
| **H1 — Audit frais** | Confirmer la source, les variantes, l'exclusivité de la carte, les usages, les défauts préexistants et le périmètre exact | Audit par identité et par position, usages recensés par position, historique relié et contradictions nommées | Toute proposition présentée comme autoritative et toute mutation Figma |
| **H2 — Design responsive** | Accepter le comportement exact à installer : grille, carte, valeurs, primitives, adaptations typographiques, sort du cas 3 colonnes aux largeurs intermédiaires, et étendue exacte des changements de la carte | Frames de travail aux témoins mobile / desktop / grand écran, configurations 2 et 3 colonnes, contenus normal et long, compromis et sujets différés | Snapshot d'application et mutation d'un master |
| **H3 — GO source** | Autoriser la transition exacte après preuve qu'elle préserve identités, instances, usages et faits protégés | Plan de mutation minimal, captures avant complètes sur les deux masters et la totalité des usages, capacités runner vertes, preuve de transition non destructive | Toute écriture live d'un master |
| **H4 — Acceptation Figma** | Accepter la source finale, ses limites nommées, la posture vis-à-vis du différentiel trois-voies et le handoff | Captures après et d'idempotence, comparaison pixel des usages, contrôles d'overflow, faits protégés, zéro écriture de Page, second passage no-op, rapport de dérive réel | Clôture de la feature et déclaration de la source comme référence |

## Historical Inputs

- La spec 021 a réparé visuellement ce bloc ; son rendu est l'apparence approuvée et la référence de non-régression.
- La spec 023 l'a gouverné : deux contrats, une molécule assainie, des axes redressés et une couche rédacteur Odoo livrée. Ses audits sont consultables comme historique et ne valent pas décision.
- La spec 028 fournit le gabarit de déroulé, ses gates et son runner. Ce composant n'est pas HeroVideo : chaque écart au gabarit est un résultat attendu de cette feature, pas un accident.
- Toute contradiction entre l'état Figma frais et ces preuves retourne au gate H1 au lieu d'être résolue silencieusement.
