# Feature Specification: Rendre HeroVideo responsive

**Feature Branch**: `027-responsive-hero-video`

**Created**: 2026-08-25

**Status**: Superseded

> **Avis de remplacement — 2026-08-25** : cette feature a été arrêtée après le gate humain H2. Son audit, le baseline XL, les options étudiées, la décision de layout, les recherches et les preuves restent conservés comme historique réutilisable. Les exigences et étapes situées après H2 ne sont plus autorisées et ne doivent pas être implémentées. Le périmètre de remplacement sera défini dans une nouvelle spec séparée.

**Input**: User description: "Faire du HeroVideo le premier composant responsive complet de Piqueray : protéger le design actuel 1728 comme XL, concevoir Mobile et Desktop, contrôler Tablet sans lui imposer une variante, promouvoir la décision dans le contrat, régénérer les surfaces de référence et Odoo sans régression, puis conserver toutes les décisions et preuves utiles à une future skill `component-to-responsive`."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Co-concevoir et valider Mobile et Desktop (Priority: P1)

Le propriétaire du design system et l’agent examinent ensemble le HeroVideo XL existant, confrontent plusieurs propositions Mobile/Desktop et choisissent explicitement celles qui répondent au besoin métier avant toute modification de la source.

**Why this priority**: Cette étape fixe seulement la structure responsive : présence, ordre, axe, alignement, stratégie de hauteur, comportement du média et point de bascule. Les valeurs de spacing, la typographie responsive et les adaptations internes des enfants sont des décisions transverses du design system, pas des valeurs à improviser dans HeroVideo.

**Independent Test**: À partir du HeroVideo XL actuel, l’agent présente des options Mobile/Desktop comparables avec leurs compromis. L’owner choisit une direction de layout suffisamment précise pour qu’un designer distinct puisse reproduire la structure des trois compositions, tout en identifiant immédiatement les valeurs simulées qui restent hors décision.

**Acceptance Scenarios**:

1. **Given** le HeroVideo XL actuel et ses usages recensés, **When** l’agent prépare la discussion responsive, **Then** il distingue les faits existants, les contraintes techniques, les options Mobile/Desktop et les choix réservés à l’humain.
2. **Given** plusieurs propositions viables, **When** elles sont présentées à l’owner, **Then** chaque option montre pour Mobile et Desktop les éléments conservés ou retirés, leur ordre, leur axe, leurs alignements, la stratégie de hauteur, le comportement du média, le rôle du titre et le placement du CTA actuel ; tout padding, gap ou valeur typographique utilisé pour rendre l’option est marqué comme simulation.
3. **Given** qu’aucune option n’a encore été acceptée, **When** le travail atteint une décision qui modifierait l’apparence mobile, **Then** aucune mutation Figma, aucun changement de contrat et aucune adaptation du site ne sont autorisés.
4. **Given** une option choisie, **When** l’owner valide sa direction de layout, **Then** les structures Mobile/Desktop et le profil 992/1400 sont consignés comme décision autoritative et datée ; les valeurs de spacing, la typographie responsive et les adaptations internes des enfants restent explicitement différées et cette décision n’autorise aucune mutation Figma.
5. **Given** une nouvelle observation pendant la réalisation, **When** elle remet en cause une décision humaine approuvée, **Then** le travail revient devant l’owner au lieu de choisir silencieusement une autre solution.

---

### User Story 2 - Préserver le HeroVideo XL et ajouter un vrai Desktop (Priority: P1)

Un visiteur sur grand écran retrouve le HeroVideo 1728 validé, tandis qu’un ordinateur standard reçoit une composition Desktop adaptée plutôt que le design XL simplement réduit.

**Why this priority**: Le design actuel est validé à 1728 mais paraît trop grand aux largeurs Desktop. Il doit devenir la référence XL sans être refondu involontairement.

**Independent Test**: Le HeroVideo est observé à 1200, 1440 et 1728 px ; Desktop et XL remplissent leur surface, ne débordent pas et correspondent chacun à leur témoin approuvé.

**Acceptance Scenarios**:

1. **Given** la référence XL de 1728 px, **When** le HeroVideo est rendu après l’évolution, **Then** sa composition, sa hauteur, son média, ses voiles, son titre et son CTA restent conformes à la référence approuvée.
2. **Given** un viewport de 1440 px, **When** le HeroVideo wide se redimensionne, **Then** le média et les voiles couvrent toute la section et aucun descendant ne déborde.
3. **Given** un viewport Desktop de 1200 px, **When** le HeroVideo est rendu, **Then** il utilise la composition Desktop approuvée, distincte du XL lorsqu’un delta a été décidé.
4. **Given** une différence visible au XL, **When** elle n’appartient pas à la décision responsive approuvée, **Then** la livraison est refusée ou la différence revient devant l’owner.

---

### User Story 3 - Offrir une vraie composition mobile (Priority: P1)

Un visiteur sur mobile voit un HeroVideo pleine largeur et pleine hauteur visible, avec le groupe titre–CTA centré horizontalement et verticalement, lisible sur le média et utilisable sans débordement.

**Why this priority**: Cette expérience mobile est le résultat métier principal de la feature et constitue le premier témoin d’un changement de composition responsive gouverné de bout en bout.

**Independent Test**: Le HeroVideo est rendu sur les largeurs mobiles de contrôle, avec un contenu court et un contenu long. La composition choisie par l’owner reste lisible, centrée et contenue, en portrait comme dans un paysage court.

**Acceptance Scenarios**:

1. **Given** un viewport mobile portrait, **When** la page s’affiche, **Then** le HeroVideo occupe la largeur et la hauteur visibles, sans bande vide ni débordement horizontal.
2. **Given** la structure mobile approuvée, **When** le contenu est affiché, **Then** le groupe de contenu est centré sur les deux axes, le titre est centré et le CTA reste entièrement accessible.
3. **Given** un titre plus long que le défaut, **When** il passe sur plusieurs lignes, **Then** la section conserve ses marges de sécurité, le titre n’est pas rogné et le CTA ne sort pas du viewport.
4. **Given** un écran mobile en paysage ou de faible hauteur, **When** le contenu ne tient plus dans un centrage strict, **Then** tout le contenu reste accessible sans recouvrement silencieux ni coupe.
5. **Given** un média vidéo indisponible, **When** le HeroVideo s’affiche, **Then** le poster couvre toujours la section et maintient la lisibilité du contenu.

---

### User Story 4 - Maintenir une seule décision responsive sur toutes les surfaces (Priority: P2)

Un mainteneur peut faire converger Figma, le contrat, la référence web et le site administrable vers le responsive approuvé sans créer de seconde vérité ni perdre les usages existants.

**Why this priority**: Le pilote n’a de valeur que si la décision humaine devient une règle gouvernée et reproductible, au lieu de rester une maquette mobile isolée ou une correction locale du site.

**Independent Test**: La décision responsive approuvée est représentée une seule fois dans la source gouvernée, puis toutes les surfaces produisent les mêmes états compact, Desktop et wide. Une seconde génération n’ajoute aucune modification.

**Acceptance Scenarios**:

1. **Given** une modification proposée depuis Figma, **When** elle est acceptée, **Then** elle entre dans le système sous la forme d’un changement de contrat revu avant d’être propagée aux autres surfaces.
2. **Given** le contrat responsive approuvé, **When** les surfaces sont régénérées, **Then** elles expriment les mêmes contenus, compositions, valeurs et limites aux largeurs de contrôle.
3. **Given** le master historique et l’instance Home, **When** la structure responsive est introduite, **Then** l’identité publique, le média, les propriétés, les liens d’instance et les overrides existants restent protégés.
4. **Given** une seconde génération sans changement de décision, **When** elle est appliquée, **Then** elle est entièrement sans effet supplémentaire et ne crée aucun doublon.
5. **Given** une capacité responsive non représentable honnêtement sur toutes les surfaces, **When** elle est détectée, **Then** elle est nommée et soumise à décision au lieu d’être simulée par une fausse propriété ou un correctif local.

---

### User Story 5 - Conserver l’édition et le rendu dans le site administrable (Priority: P3)

Un administrateur du site peut continuer à modifier le poster, le texte et le CTA du HeroVideo, tandis que les visiteurs obtiennent automatiquement la composition adaptée à leur largeur d’écran.

**Why this priority**: Le responsive ne doit ni retirer les possibilités éditoriales existantes ni demander au rédacteur de choisir manuellement une composition.

**Independent Test**: Un administrateur modifie les contenus autorisés, sauvegarde et rouvre la page. Les changements restent isolés à l’instance et les rendus compact/Desktop/wide restent conformes à la même décision responsive.

**Acceptance Scenarios**:

1. **Given** le HeroVideo existant dans le site, **When** l’administrateur change le poster, le titre ou le CTA puis sauvegarde, **Then** ces changements persistent dans les trois compositions responsive.
2. **Given** deux occurrences administrables, **When** une seule est modifiée, **Then** l’autre reste inchangée.
3. **Given** une page déjà sauvegardée, **When** le système est mis à jour, **Then** son contenu éditorial n’est pas réécrit silencieusement.
4. **Given** un visiteur mobile, **When** il ouvre la page, **Then** la composition compact est choisie automatiquement sans réglage éditorial de composition exposé.

---

### User Story 6 - Capitaliser le pilote pour un futur workflow réutilisable (Priority: P4)

L’équipe dispose à la clôture d’un dossier lisible qui explique comment le HeroVideo XL historique est devenu un composant responsive gouverné, y compris les décisions humaines, les refus, les preuves et les limites.

**Why this priority**: Le HeroVideo doit servir de cas réel pour concevoir ultérieurement une skill `component-to-responsive`, sans transformer trop tôt une expérience unique en automatisme général.

**Independent Test**: Un autre mainteneur lit le dossier sans contexte oral et peut identifier les entrées nécessaires, les décisions réservées à l’humain, les contrôles automatisables, les points d’arrêt et les preuves attendues pour un second composant.

**Acceptance Scenarios**:

1. **Given** le dossier de clôture, **When** un mainteneur le consulte, **Then** il distingue clairement audit, décision humaine, modélisation, génération, validation et publication.
2. **Given** une étape qui dépend du jugement esthétique ou métier, **When** elle est documentée, **Then** elle est marquée comme gate humain et non comme action automatisable.
3. **Given** un contrôle mécanique répétable, **When** il est documenté, **Then** ses entrées, son résultat attendu et sa condition de refus sont explicites.
4. **Given** les enseignements du pilote, **When** la future skill est envisagée, **Then** ils constituent une entrée candidate à sa spécification mais aucune généralisation n’est déclarée prouvée par ce seul composant.

### Edge Cases

- Le titre ou le libellé du CTA est nettement plus long que le contenu par défaut : le texte se replie sans crop et le CTA reste contenu.
- Le viewport se trouve exactement à 992 ou 1400 px, ou à un pixel de chaque côté : une seule composition est active et aucun état intermédiaire incohérent n’apparaît.
- Le mobile est très étroit, très haut ou en paysage très court : le contenu reste accessible et les marges de sécurité sont respectées.
- Le média possède un cadrage défavorable sur mobile : le recadrage est présenté à l’owner ; aucun second asset, point focal ou déplacement arbitraire n’est inventé.
- Le Header est superposé au HeroVideo : son contexte est capturé pour vérifier la lisibilité, mais son propre responsive ne devient pas implicitement modifiable.
- Le CTA mobile semble nécessiter une autre taille, un retour à la ligne ou une variante : le besoin est consigné pour la passe dédiée au Button partagé ; HeroVideo ne modifie pas son padding, sa typographie, sa largeur intrinsèque ni ses enfants.
- La conversion du composant autonome en ensemble de variantes menace l’identité historique ou les instances : la mutation est refusée tant qu’une migration préservant ces faits n’est pas prouvée.
- Figma Design ne bascule pas automatiquement de composition lors d’un simple resize : cette limite est indiquée aux designers ; le site conserve, lui, un changement automatique selon la largeur.
- Une différence n’est visible que dans Figma, le web ou le site administrable : elle est classée et résolue à sa source la plus basse, jamais compensée sur une autre surface.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: La feature MUST cibler uniquement `ds.hero-video`, son master historique, son unique usage Home déclaré et ses dépendances directes nécessaires ; aucun autre composant ou contexte de page ne devient modifiable implicitement.
- **FR-002**: L’état de départ MUST être capturé avant toute mutation : identité du master, structure, dimensions, média, voiles, textes, styles, variables, CTA, propriétés, instance Home, overrides et contexte visuel.
- **FR-003**: Le premier gate humain MUST valider que l’état de départ 1728 constitue la référence XL/wide à préserver et nommer tout défaut préexistant séparément du responsive.
- **FR-004**: Avant toute mutation, l’agent MUST présenter à l’owner des options Mobile/Desktop avec leurs compromis ; il MUST NOT choisir seul les structures finales.
- **FR-005**: La décision humaine de cette étape MUST couvrir au minimum, pour Mobile et Desktop : éléments présents, éléments absents, ordre, axe de composition, alignements, stratégie de hauteur, contraintes structurelles de largeur, rôle Text Style conservé, placement du CTA actuel et comportement du média. Elle MUST NOT approuver de padding, gap, taille typographique ou dimension interne d’enfant.
- **FR-006**: La politique responsive autoritative de cette feature MUST être Mobile/compact sous 992 px, Desktop de 992 à 1399 px inclus et XL/wide à partir de 1400 px. Elle réemploie les seuils Odoo/Bootstrap `lg` et `xxl` sans modifier la grille globale ; tout changement de seuil exige une nouvelle décision owner.
- **FR-007**: L’acceptation du layout H2 autorise uniquement le passage à une future décision transverse sur le spacing, la typographie responsive et les composants enfants. Aucun changement Figma, contrat, référence web ou site administrable MUST commencer avant qu’une décision transverse approuvée fournisse les valeurs exactes nécessaires et soit liée à cette feature.
- **FR-008**: La composition wide MUST conserver la référence 1728 px et rester sans débordement à 1440 px ; la composition Desktop MUST avoir un témoin approuvé à 1200 px.
- **FR-009**: La composition mobile MUST remplir la largeur et la hauteur visibles du viewport, avec le groupe de contenu centré horizontalement et verticalement selon la décision owner.
- **FR-010**: Le titre mobile MUST être centré, pouvoir se replier sur plusieurs lignes et conserver le rôle sémantique gouverné `Titre Hero vidéo`. Cette feature MUST NOT substituer `Titre2` ou `Titre3` selon le viewport ni fixer une taille responsive brute ; les valeurs du rôle seront définies dans une passe typographique transverse.
- **FR-011**: Le CTA mobile MUST réutiliser le Button actuel sans modifier sa variante, sa taille, sa typographie, son padding, ses icônes ou sa largeur intrinsèque ajustée au contenu. HeroVideo décide uniquement de son placement et de son alignement ; toute évolution interne du Button nécessite une décision transverse et une analyse de l’impact partagé.
- **FR-012**: Le média et les deux voiles MUST couvrir l’intégralité du HeroVideo dans chaque composition et préserver le poster propriétaire actuel. Le canal vidéo reste distinct du poster statique utilisé dans la source de design.
- **FR-013**: La méthode de design MUST utiliser l’adaptation fluide tant que la composition reste identique, des valeurs responsive lorsque seules des valeurs changent, et une variante responsive uniquement pour une différence réelle de composition.
- **FR-014**: La source de design MUST présenter quatre témoins identifiés : Mobile 390, Tablet 834 utilisant compact, Desktop 1200 et XL 1728. Tablet MUST NOT devenir une quatrième composition dans cette feature ; un échec à 834 retourne devant l’owner.
- **FR-015**: Dans Figma Design, le changement de mode ou de variante est une action de présentation explicite ; la feature MUST NOT prétendre qu’un simple resize déclenche automatiquement un breakpoint.
- **FR-016**: Sur les surfaces destinées aux visiteurs, la composition responsive MUST être choisie automatiquement selon la largeur du viewport et MUST NOT dépendre d’une fausse propriété publique `viewport` que le rédacteur ou le consommateur devrait fournir. La garantie actuelle porte sur l’usage Home full-bleed ; un futur usage contenu nécessite une décision séparée sur les container queries.
- **FR-017**: La décision responsive approuvée MUST être promue dans le contrat comme source commune avant propagation vers les autres surfaces ; Figma et la référence web MUST NOT se synchroniser directement entre eux.
- **FR-018**: Si le format de contrat ne peut pas représenter une décision approuvée, la feature MUST nommer la capacité manquante, prouver son caractère générique et obtenir une décision avant d’étendre le format ; aucun contournement propre au HeroVideo n’est autorisé.
- **FR-019**: Toute évolution du format ou de la génération MUST être accompagnée d’une preuve adversariale démontrant la même décision sur la source de design et la référence web avant qu’une capacité responsive soit revendiquée.
- **FR-020**: La migration éventuelle du composant autonome vers un ensemble responsive MUST préserver le nœud historique comme composition XL/wide, son identité exploitable, les propriétés publiques, le média, l’instance Home et ses overrides ; une migration destructive est refusée.
- **FR-021**: La génération MUST préserver les faits non gouvernés mais propriétaires, en particulier le poster, et MUST refuser avant mutation tout fait qu’elle ne peut pas replacer avec certitude.
- **FR-022**: Une seconde génération sans changement de décision MUST produire zéro création, zéro modification supplémentaire, zéro doublon et aucune écriture directe de Page.
- **FR-023**: Les contrôles responsive MUST couvrir au minimum 320, 390, 834, 991, 992, 993, 1024, 1200, 1399, 1400, 1401, 1440 et 1728 px, ainsi qu’un viewport mobile paysage de faible hauteur.
- **FR-024**: Pour chaque largeur de contrôle, le HeroVideo et tous ses descendants visibles MUST rester dans leur surface, sans crop involontaire, recouvrement ni débordement horizontal.
- **FR-025**: Les quatre témoins 390, 834, 1200 et 1728 MUST être comparés Figma↔référence web puis référence web↔Odoo dans des conditions identiques de contenu, média, police, viewport et composition. Les contrôles de frontières restent géométriques et ne prétendent pas à un basculement Figma automatique.
- **FR-026**: La version administrable MUST préserver l’édition actuelle du poster, du titre, du libellé et du lien du CTA, ainsi que la sauvegarde, la réouverture et l’isolation entre instances.
- **FR-027**: Une page déjà sauvegardée MUST NOT être réécrite silencieusement ; toute migration de contenu persistant nécessite une décision et une preuve distinctes.
- **FR-028**: Quatre gates humains MUST être tracés : validation du baseline XL, choix des structures Mobile/Desktop, acceptation des quatre témoins de design, puis acceptation du résultat convergé sur toutes les surfaces.
- **FR-029**: Chaque gate humain MUST enregistrer les options examinées, la décision, le décideur, la date, les preuves consultées, les compromis acceptés et les sujets refusés ou différés.
- **FR-030**: La clôture MUST fournir un dossier réutilisable décrivant les entrées, sorties, décisions humaines, contrôles mécaniques, conditions d’arrêt, limites et preuves du pilote HeroVideo.
- **FR-031**: La présente feature MUST NOT créer ni prétendre valider la future skill `component-to-responsive` ; elle produit seulement le cas de référence et les exigences candidates nécessaires à une spécification ultérieure.
- **FR-032**: Les comparateurs MUST utiliser le viewport navigateur exact de chaque cas et enregistrer le témoin, la composition et la fixture actifs ; une largeur de root, un clip rembourré ou une capture périmée MUST NOT être accepté comme preuve du breakpoint.
- **FR-033**: Les règles responsive MUST provenir du contrat, rester limitées au HeroVideo et MUST NOT modifier la politique globale de breakpoints, de grille ou de containers du site Odoo.
- **FR-034**: La décision H2 MUST porter uniquement sur le layout de HeroVideo : présence, ordre, axe, alignement, stratégie de hauteur, relation structurelle entre enfants directs et contraintes de placement. Le spacing de section et le layout interne, padding ou dimensions intrinsèques de chaque enfant restent hors de cette décision.
- **FR-035**: Le harness de brainstorm MAY utiliser ou faire varier padding, gap, taille et hauteur de ligne afin d’éprouver la robustesse du layout. Toute valeur simulée MUST être identifiée comme non autoritative et rester hors de la décision H2 et de la source Figma ; l’agent MAY tester plusieurs valeurs plausibles sans modifier la direction approuvée.
- **FR-036**: La future décision transverse MUST déterminer si le spacing responsive sélectionne directement des primitives stables ou justifie des rôles sémantiques multi-modes à partir de patterns observés sur plusieurs composants. Cette feature MUST NOT créer seule une variable générique `spacing S/M`.

### Key Entities

- **Baseline HeroVideo**: L’état XL/wide 1728 protégé avant responsive, incluant le master, son média, ses propriétés, son CTA et son usage Home.
- **Option responsive**: Une proposition comparable qui décrit les structures Mobile/Desktop, leur contenu, alignements, média, rôle typographique et placement CTA, avec des valeurs de preview clairement non autoritatives, sans modifier le XL protégé.
- **Décision responsive owner**: Le choix humain daté d’une direction de layout Mobile/Desktop sous le profil 992/1400. Tant que la décision transverse de fondation est absente, elle n’autorise aucune mutation source.
- **Reçu de fondation transverse**: La référence vérifiée vers une future décision owner couvrant spacing responsive, typographie responsive et composants enfants. Elle est obligatoire avant toute reprise de la campagne source.
- **Composition responsive**: Un état `compact`, `desktop` ou `wide` du même HeroVideo métier, avec ses règles fluides et ses valeurs gouvernées.
- **Témoin responsive**: Un frame de revue à largeur exacte, distinct d’un breakpoint runtime ; les témoins sont 390, 834, 1200 et 1728 px.
- **Fait protégé**: Une identité, un contenu, un média, un style, un lien ou un override qui ne peut pas changer sans autorisation explicite.
- **Gate humain**: Un point d’arrêt obligatoire où l’owner accepte, refuse ou réoriente le travail à partir de preuves visibles.
- **Preuve responsive**: Une capture, une mesure ou une comparaison liée à une largeur, un contenu, un média, une police et un état précis.
- **Dossier de capitalisation**: Le récit vérifiable du pilote, destiné à informer ultérieurement la conception de `component-to-responsive`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100 % des quatre gates humains sont datés et acceptés avant le passage à l’étape qu’ils autorisent ; aucune décision de design Mobile/Desktop n’est attribuée implicitement à l’agent.
- **SC-002**: Aux largeurs 1728 et 1440 px, le rendu wide ne présente aucun delta non approuvé et reste sous le seuil visuel de 2 % par rapport à la référence comparable.
- **SC-003**: Aux treize largeurs de contrôle et au paysage mobile court, aucun descendant visible ne produit de débordement horizontal, de coupe involontaire ou de recouvrement.
- **SC-004**: Sur mobile, le centre du groupe de contenu reste aligné sur les axes approuvés avec une tolérance maximale de 2 px lorsque le contenu tient dans le viewport.
- **SC-005**: Le titre par défaut et un titre long de contrôle restent entièrement lisibles à 390 et 320 px, et le CTA reste entièrement accessible.
- **SC-006**: Les huit comparaisons appariées des témoins Mobile, Tablet, Desktop et XL — quatre source de design↔référence web et quatre référence web↔site administrable — restent chacune sous 2 %, ou toute zone exclue est nommée et approuvée.
- **SC-007**: 100 % des faits protégés du master et de l’instance Home sont conservés après génération, à l’exception des deltas responsive explicitement approuvés.
- **SC-008**: La seconde génération produit zéro création, zéro modification supplémentaire, zéro doublon et zéro écriture directe de Page.
- **SC-009**: 100 % des contrôles éditoriaux existants du HeroVideo restent utilisables après sauvegarde et réouverture, sans fuite de contenu entre deux instances.
- **SC-010**: Le dossier de capitalisation permet à un mainteneur distinct d’identifier sans aide orale les entrées, les quatre gates humains, les contrôles automatisables, les conditions de refus et les limites pour un second composant.
- **SC-011**: Zéro capacité responsive, automatique ou bidirectionnelle n’est revendiquée sans preuve nommée ; toute limite découverte apparaît dans le même document que la capacité concernée.

## Assumptions

- Le master historique reste `2151:5552`, sa key publique reste `36011e51b8bc0b221a1ba6f9108709b5bd1c4490`, et l’usage Home de contrôle reste `2170:6351` tant qu’une nouvelle preuve ne signale pas un changement.
- Le baseline XL/wide approuvé conserve notamment 1728×720, le titre Montserrat Regular 44/48, le poster façade Piqueray, les deux voiles et le CTA Outline blanc.
- Le besoin mobile initial exprimé par l’owner est : pleine largeur, pleine hauteur visible, titre et CTA centrés horizontalement et verticalement. Les détails non décidés restent réservés au gate de co-conception.
- Le profil retenu est Mobile/compact `<992`, Desktop `992–1399` et XL/wide `>=1400`. Il réemploie un sous-ensemble des seuils Odoo/Bootstrap 19 ; ce n’est pas un override de leur grille globale.
- La largeur Tablet 834 utilise compact et reste un témoin de contrôle, sans composition Tablet dédiée dans cette feature.
- Le 1728 actuel est le témoin XL historique, pas un breakpoint. Le témoin Desktop est 1200.
- Le poster actuel, la copy et le rôle métier du CTA ne changent pas dans cette feature.
- Le Header superposé est un contexte de vérification, pas une dépendance modifiable du HeroVideo.
- La création effective d’une skill `component-to-responsive` fera l’objet d’une feature séparée après comparaison d’au moins un second composant de nature différente.

## Scope Boundaries

**In scope**:

- La co-conception humain–agent des structures Mobile/Desktop HeroVideo.
- Le responsive Mobile/Desktop/XL du HeroVideo dans la source de design, le contrat, les références web et le site administrable.
- La préservation du master historique, du poster, du CTA, de l’instance Home et des contrôles éditoriaux.
- Les preuves aux largeurs de contrôle, la parité visuelle et l’idempotence.
- La documentation du pilote en vue d’une future skill.

**Out of scope**:

- Le responsive du Header ou de tout autre composant partagé, sauf décision explicite après inventaire de son impact.
- Une composition Tablet distincte ; le frame 834 de contrôle réutilise compact.
- Figma Sites et ses breakpoints automatiques ; la cible de design est Figma Design.
- Une refonte du média, du message marketing, de la vidéo, des interactions ou du comportement d’autoplay.
- La définition des valeurs responsive de spacing, de typographie ou des composants enfants ; elles relèvent d’une future spec transverse avant reprise de l’implémentation source.
- La migration silencieuse des pages déjà sauvegardées.
- La création de la skill `component-to-responsive` elle-même.

## Human Gates

| Gate                           | Décision humaine obligatoire                                            | Preuve minimale avant décision                                               | Interdit avant acceptation                       |
| ------------------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| **H1 — Baseline**              | Confirmer l’état XL 1728 à protéger et séparer les défauts préexistants | Inventaire du master, usage Home et captures avant                           | Toute mutation Figma ou contrat                  |
| **H2 — Direction de layout**   | Choisir uniquement la structure Mobile/Desktop sous le profil 992/1400 ; conserver le rôle du titre et le Button actuel | Options comparées à 390/834/1200/1728, valeurs de preview signalées et probes de frontières | Toute mutation source ; H2 autorise seulement la spec transverse de fondation |
| **H3 — Source de design**      | Accepter les quatre témoins Mobile/Tablet/Desktop/XL et leurs limites   | Captures, contrôles de texte, CTA, média et overflow                         | Promotion dans le contrat et propagation         |
| **H4 — Convergence**           | Accepter le résultat sur toutes les surfaces et les différés            | Parités, contrôles éditoriaux, préservation et second passage sans effet     | Clôture et déclaration du pilote comme référence |

## Normative References and Existing Instruments

Cette section identifie les autorités et instruments déjà disponibles. Elle ne constitue pas un plan d’implémentation.

### Références locales

- [Responsive dans Figma Design](../../docs/responsive-figma.md) — choix métier entre adaptation fluide, variables et variantes ; limite des breakpoints automatiques dans Figma Design.
- [Figma Capability Matrix](../../docs/FIGMA-CAPABILITY-MATRIX.md) — capacités et limites vérifiées de Fill/Hug/Fixed, Grid, texte, variables et médias.
- [Audit responsive des organisms](../../docs/organisms-responsive-decisions.md) — décision historique HeroVideo : root Fill suffisant au desktop 1440, mobile encore à décider.
- [Figma → contrat → HTML → Odoo](../../docs/figma-contrat-html-odoo.md) — rôle de chaque surface et absence de synchronisation latérale.
- [Contrat HeroVideo](../../contracts/hero-video.contract.json) — baseline gouverné actuel.
- [Façade HeroVideo](../tiny/hero-video-facade.md) — autorité média et preuves de parité existantes.
- [Architecture déterministe](../../docs/handoff/03-determinism.md) et [outillage](../../docs/handoff/06-tooling.md) — génération sans IA et rôle des outils de vérification.

### Sources Figma consultées

- [Figma — Responsive website design](https://www.figma.com/resource-library/responsive-website-design/)
- [Figma — Guide to Auto Layout](https://help.figma.com/hc/en-us/articles/360040451373-Explore-auto-layout-properties)
- [Figma — Grid Auto Layout](https://help.figma.com/hc/en-us/articles/31289469907863-Use-the-grid-auto-layout-flow)
- [Figma — Apply variables to designs](https://help.figma.com/hc/en-us/articles/15343107263511-Apply-variables-to-designs)
- [Figma — Modes for variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)
- [Figma — Variants, slots et instance swaps](https://help.figma.com/hc/en-us/articles/38741465279895-The-difference-between-slots-instance-swaps-and-variants)
- [Figma — Préservation des changements entre variants](https://help.figma.com/hc/en-us/articles/360039150733-Apply-changes-to-instances)
- [Figma Sites — composant par breakpoint](https://help.figma.com/hc/en-us/articles/31242826664983-Create-a-responsive-component-that-automatically-adapts-to-each-breakpoint) — référence comparative uniquement, Figma Sites étant hors scope.
- [Devōt — Responsive Design in Figma](https://devot.team/blog/figma-responsive-design)

### Sources Odoo consultées

- [Odoo 19 — variables Bootstrap embarquées](https://github.com/odoo/odoo/blob/19.0/addons/web/static/lib/bootstrap/scss/_variables.scss) — grille complète et provenance des seuils `lg=992` et `xxl=1400` réemployés par le profil Piqueray.
- [Odoo 19 — responsive layout](https://www.odoo.com/documentation/19.0/developer/howtos/website_themes/layout.html) — intégration Bootstrap dans les thèmes et comportement responsive de l’éditeur.
- [Odoo 19 — theming](https://www.odoo.com/documentation/19.0/developer/howtos/website_themes/theming.html) — possibilité et portée globale des overrides Bootstrap, explicitement évités ici.

### Instruments existants à employer comme preuves

| Besoin de preuve                                  | Instrument existant                                               | Rôle autorisé                                                                            |
| ------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Inspecter, capturer et vérifier le fichier vivant | Figma Console MCP                                                 | Inspection, captures et transport contrôlé ; jamais auteur probabiliste de la conversion |
| Produire les sorties depuis le contrat            | Build déterministe et Sync Runner Figma                           | Conversion contractuelle reproductible                                                   |
| Détecter les écarts entre contrat et surfaces     | Parity, emitter checks et evals                                   | Refus mécanique et preuves de capacité                                                   |
| Comparer les pixels                               | Visual parity Figma/web et QA visuelle du site                    | Mesure à contenu, police, viewport et état identiques                                    |
| Vérifier l’intégration administrable              | Contrôles authoring, assets, dérivation, module et scénarios live | Édition, sauvegarde, isolation et rendu public                                           |
| Réparer un défaut de source séparé                | Workflow mono-composant `component:repair`                        | Seulement après diagnostic et GO ; ce n’est pas la voie normale de régénération          |
