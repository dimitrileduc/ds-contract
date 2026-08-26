# Feature Specification: Finaliser HeroVideo responsive dans Figma

**Feature Branch**: `emerald-jodhpur`

**Created**: 2026-08-25

**Status**: Draft

**Input**: User description: "Rendre HeroVideo réellement responsive dans Figma uniquement. Reprendre le baseline XL et la direction de layout déjà validés, brainstormer les valeurs directement dans des frames Figma de travail, construire puis nettoyer les variantes Compact, Desktop et Wide, utiliser les primitives existantes pour le spacing et le padding, ne toucher à aucun enfant partagé, et autoriser une typographie locale temporaire sur une nouvelle variante lorsque le Text Style actuel ne permet pas de juger correctement le design. Les variables et Text Styles responsive communs seront décidés après la campagne responsive des composants de la Home. Aucun contrat, HTML, code produit ou Odoo dans cette feature ; l’outillage interne strictement nécessaire pour appliquer et prouver les variantes fait partie de 028."

## Clarifications

### Session 2026-08-25

- Q: Le défaut historique du CTA Home ou un besoin d’un enfant partagé doit-il bloquer la campagne HeroVideo ? → A: Non ; le CTA et tous les enfants restent strictement en lecture seule, ne sont ni corrigés ni reconfigurés dans 028, et ne bloquent pas la mutation du parent HeroVideo.
- Q: La capacité manquante de l’outil pour créer et vérifier les variantes doit-elle être traitée séparément ? → A: Non ; elle est intégrée à 028 afin que le plan et les tâches couvrent toute la livraison de bout en bout.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Concevoir le vrai HeroVideo responsive dans Figma (Priority: P1)

Le propriétaire du design system et l’agent travaillent directement dans des frames Figma dédiées pour transformer la direction de layout déjà choisie en compositions Compact, Desktop et Wide visuellement crédibles, sans toucher au master avant un nouveau GO explicite.

**Why this priority**: La direction générale est connue, mais les vrais choix de spacing, de padding et de typographie n’ont pas encore été éprouvés dans la source de design. Cette exploration doit produire un design utilisable, pas seulement une maquette technique ou des valeurs inventées hors Figma.

**Independent Test**: À partir du baseline Wide et de la direction « centrage immersif », l’owner peut comparer dans Figma les témoins Compact, Desktop et Wide avec contenu normal, contenu long et faible hauteur, puis accepter ou réorienter chaque décision avant toute mutation du master.

**Acceptance Scenarios**:

1. **Given** le baseline Wide validé et les preuves historiques de la feature 027, **When** l’exploration commence, **Then** ces preuves sont réutilisées comme historique et un audit frais confirme que le master, son unique usage Home et ses dépendances n’ont pas dérivé.
2. **Given** des frames Figma de travail séparées du master, **When** les compositions sont explorées, **Then** le groupe titre–CTA est centré horizontalement et verticalement en Compact et Desktop, tandis que Wide conserve la composition historique.
3. **Given** qu’un gap ou un padding doit varier entre compositions, **When** une valeur est proposée, **Then** elle est choisie parmi les primitives existantes du design system et sa liaison exacte est visible dans la proposition.
4. **Given** que le Text Style actuel empêche de juger correctement une composition, **When** une autre taille ou hauteur de ligne est testée, **Then** l’override local est limité à la variante de travail concernée, conserve le rôle « Titre Hero vidéo » et est signalé comme dette typographique à externaliser.
5. **Given** plusieurs résultats visuels viables, **When** l’owner les examine, **Then** aucune décision finale ni écriture du master n’est attribuée implicitement à l’agent.

---

### User Story 2 - Installer les variantes dans le composant sans casser l’existant (Priority: P1)

Après validation humaine du design, le HeroVideo devient un composant Figma responsive explicite tout en préservant son état Wide historique, son poster, ses voiles, son contenu éditorial, son Button et son instance Home.

**Why this priority**: Le responsive n’a de valeur que si la source partagée reste fiable. Une reconstruction du master, une perte d’override ou une correction locale de Page annulerait le bénéfice du travail.

**Independent Test**: Après application, le master historique et l’instance Home conservent leurs identités et faits protégés ; les témoins Compact, Desktop et Wide présentent la composition acceptée, et aucune Page n’a été modifiée directement.

**Acceptance Scenarios**:

1. **Given** le master historique et son instance Home, **When** les variantes responsive sont installées, **Then** le master Wide conserve son identité exploitable, sa key publique, son rendu 1728, son poster et ses propriétés existantes.
2. **Given** les états Compact, Desktop et Wide, **When** un designer change explicitement l’état de présentation, **Then** les mêmes contenus et propriétés éditoriales restent disponibles et les noms de calques communs permettent de préserver les overrides.
3. **Given** le Button partagé imbriqué, **When** le parent change de composition, **Then** HeroVideo ne modifie que son placement et son alignement ; sa variante, sa typographie, son padding et ses enfants restent inchangés.
4. **Given** qu’un enfant partagé gêne réellement la composition, **When** le problème est constaté, **Then** HeroVideo ne modifie ni ne reconfigure cet enfant ; le sujet est seulement inventorié et renvoyé vers une spec séparée sans bloquer les autres décisions du parent qui restent réalisables.
5. **Given** l’usage Home et le Header superposé, **When** le responsive est appliqué au master, **Then** ils servent de contextes de vérification en lecture seule et aucun nœud Page n’est écrit.
6. **Given** que l’outil actuel ne représente pas encore honnêtement la transition standalone vers component set, **When** 028 prépare l’application, **Then** l’outil est étendu dans cette feature avec fixtures et evals avant toute mutation live.

---

### User Story 3 - Livrer une source Figma vérifiable pour la campagne Home (Priority: P2)

L’équipe dispose d’un HeroVideo responsive propre, de preuves avant/après et d’un inventaire lisible des choix locaux qui alimentera la future campagne des composants de la Home puis l’externalisation des variables et Text Styles responsive.

**Why this priority**: Le pilote doit apprendre quelque chose de réutilisable sans prétendre avoir déjà défini la fondation responsive globale à partir d’un seul composant.

**Independent Test**: Un mainteneur distinct peut identifier les compositions, les primitives utilisées, les overrides typographiques temporaires, les sujets enfants différés, les faits protégés et les contrôles réalisés sans contexte oral.

**Acceptance Scenarios**:

1. **Given** le HeroVideo final, **When** les preuves sont consultées, **Then** elles relient chaque témoin à sa composition, ses primitives de spacing/padding et son éventuel override typographique local.
2. **Given** une valeur locale observée sur le pilote, **When** le dossier de handoff est produit, **Then** elle est décrite comme observation candidate et non comme variable responsive globale de Piqueray.
3. **Given** une seconde application de la même décision, **When** elle est exécutée, **Then** elle ne crée ni ne modifie aucun nœud et ne change aucun fait protégé.
4. **Given** la clôture Figma, **When** la prochaine campagne commence, **Then** aucun résultat ne prétend que le contrat, HTML, Odoo ou les breakpoints automatiques ont déjà été validés.

### Edge Cases

- Le titre par défaut ou un titre long passe sur plusieurs lignes : le texte reste entièrement visible, centré et contenu sans masque ni troncature.
- Le libellé du CTA est plus long que le défaut : le Button reste accessible ; HeroVideo ne modifie pas son anatomie pour le faire tenir.
- Le viewport est très étroit ou en paysage de faible hauteur : le contenu reste accessible et la composition peut grandir verticalement plutôt que couper silencieusement ses descendants.
- Le poster possède un point d’intérêt derrière le groupe centré : le recouvrement est présenté à l’owner ; aucun nouveau média, recadrage ou point focal n’est inventé.
- Compact et Desktop partagent la même organisation mais utilisent des primitives différentes : les états restent explicitement identifiés dans cette feature afin de conserver les décisions observées avant leur éventuelle externalisation future.
- Une valeur de spacing ou de padding nécessaire n’existe pas dans les primitives : la proposition s’arrête devant l’owner ; aucune valeur brute ni nouvelle primitive n’est créée silencieusement.
- La typographie locale temporaire convient au HeroVideo mais ressemble à un besoin global : elle reste locale et inventoriée jusqu’à la campagne transverse ; elle n’est pas publiée comme Text Style responsive.
- Le passage du composant autonome à un ensemble de variantes menace l’identité du master ou le lien de l’instance Home : la mutation est refusée tant qu’une transition préservant ces faits n’est pas prouvée.
- Le défaut préexistant du Text Style du libellé CTA sur l’instance Home existe toujours : il est enregistré comme contexte Page read-only, mais 028 ne le corrige pas et il ne bloque pas la mutation responsive du parent.
- Un simple redimensionnement du frame Figma ne change pas automatiquement la variante : cette limite reste visible dans les témoins et la documentation du composant.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La feature MUST cibler uniquement le master Figma HeroVideo, son Container local, ses frames de travail dédiées et les preuves nécessaires à ses usages ; aucun autre composant partagé ou contexte Page ne devient modifiable implicitement.
- **FR-002**: La feature MUST reprendre comme historique le baseline XL et la direction « centrage immersif » acceptés dans la feature 027, sans reprendre ses exigences de contrat, génération, HTML ou Odoo.
- **FR-003**: Un audit frais MUST précéder toute proposition ou mutation et MUST identifier le master par identité et position, son état Wide, son Container, son unique usage Home, le Header en contexte, le Button imbriqué, les textes, les variables, les médias, les propriétés et les overrides.
- **FR-004**: Tout défaut préexistant MUST être séparé du delta responsive ; en particulier, la liaison Text Style perdue sur le libellé CTA Home MUST rester un contexte Page read-only, non corrigé et non bloquant pour 028.
- **FR-005**: Le brainstorming MUST avoir lieu dans des frames Figma de travail distinctes du master gouverné et MUST pouvoir explorer plusieurs valeurs et compositions sans les présenter comme déjà appliquées.
- **FR-006**: La politique de présentation MUST conserver les témoins Compact 390, Tablet 834 utilisant Compact, Desktop 1200 et Wide 1728, sous le profil historique Compact `<992`, Desktop `992–1399` et Wide `>=1400`.
- **FR-007**: La composition Compact MUST présenter le contenu en colonne, centré horizontalement et verticalement, avec titre centré, CTA suivant le titre et média couvrant la surface.
- **FR-008**: La composition Desktop MUST conserver la direction centrée validée jusqu’à 1399, tout en pouvant utiliser ses propres primitives de spacing et de padding lorsque l’owner le valide.
- **FR-009**: La composition Wide MUST préserver la référence historique 1728×720, son organisation horizontale basse, ses valeurs gouvernées, son poster, ses deux voiles et son Button.
- **FR-010**: La hauteur Compact et Desktop MUST remplir au minimum la hauteur visible prévue tout en pouvant grandir avec le contenu ; aucun contenu ne peut être rendu inaccessible pour maintenir une hauteur fixe.
- **FR-011**: Tout gap, padding ou dimension d’espacement modifié dans une nouvelle composition MUST être lié directement à une primitive existante du design system ; cette feature MUST NOT créer de variable responsive sémantique, de mode responsive global ou de nouvelle primitive.
- **FR-012**: Chaque proposition de valeur MUST indiquer la primitive utilisée et la propriété qu’elle pilote afin que la future campagne puisse comparer les choix entre composants.
- **FR-013**: Le rôle typographique du titre MUST rester « Titre Hero vidéo » dans toutes les compositions ; la feature MUST NOT substituer un rôle voisin comme Titre 2 ou Titre 3 selon le viewport.
- **FR-014**: Le texte Wide historique MUST conserver son Text Style exact et ses métriques approuvées.
- **FR-015**: Une nouvelle composition MAY utiliser une taille, une hauteur de ligne ou un alignement typographique local lorsque l’owner juge cette adaptation nécessaire pour valider le design et qu’aucun Text Style responsive n’existe encore.
- **FR-016**: Tout override typographique local MUST conserver la famille, le poids, le contenu et le rôle métier attendus, être limité aux propriétés approuvées, être inventorié avec sa composition et être marqué `pending-responsive-text-style` pour la future externalisation.
- **FR-017**: La feature MUST NOT créer, modifier, publier ou prétendre valider un Text Style responsive global ; la stratégie typographique transverse appartient à une feature ultérieure fondée sur plusieurs composants de la Home.
- **FR-018**: Le Button actuel MUST être réutilisé sans modification de son master, de sa variante, de son padding, de sa typographie, de ses icônes ou de sa largeur intrinsèque ; HeroVideo peut uniquement décider son placement et son alignement.
- **FR-019**: La feature MUST NOT modifier, reconfigurer ou changer une propriété d’un enfant partagé ; tout besoin enfant observé MUST être inventorié puis transféré vers une spec dédiée sans être traité dans 028.
- **FR-020**: Le poster propriétaire, son cadrage approuvé, les deux voiles, les textes et les propriétés éditoriales MUST être préservés dans toutes les compositions ; aucun second asset ni changement de message n’entre dans le scope.
- **FR-021**: Les calques communs aux variantes MUST conserver des noms et rôles cohérents afin que les contenus et overrides puissent être préservés lors d’un changement explicite de variante.
- **FR-022**: La transition vers des variantes MUST préserver le nœud historique comme état Wide exploitable, sa key publique, ses propriétés, son Container, le lien de l’instance Home et les overrides existants ; une reconstruction destructive est interdite.
- **FR-023**: Avant toute mutation live, toutes les surfaces affectées MUST posséder des captures avant vérifiées, incluant le master, l’instance Home et son contexte avec Header.
- **FR-024**: Aucune écriture directe de Page MUST être effectuée par la campagne HeroVideo ; tout besoin Page nécessite une autorisation et une preuve séparées.
- **FR-025**: Un GO owner explicite MUST être obtenu après présentation de la proposition exacte et avant toute mutation du master ou de ses variantes.
- **FR-026**: Les contrôles responsive MUST couvrir au minimum 320, 390, 834, 1200, 1440 et 1728 px, un titre long, un CTA long et un paysage mobile de faible hauteur.
- **FR-027**: À chaque largeur de contrôle, le HeroVideo et tous ses descendants visibles MUST rester contenus, lisibles et accessibles, sans débordement horizontal, recouvrement non approuvé, coupe involontaire ni masquage par un ancêtre.
- **FR-028**: Les états Figma MUST être sélectionnés explicitement ; la feature MUST NOT prétendre qu’un simple redimensionnement déclenche automatiquement un breakpoint dans Figma Design.
- **FR-029**: Une seconde application de la décision finale MUST produire zéro création, zéro modification, zéro doublon, zéro écriture Page et aucune variation des faits protégés.
- **FR-030**: Le dossier de clôture MUST inventorier, pour chaque composition, la structure, les primitives retenues, les overrides typographiques locaux, les limites, les enfants différés et les décisions owner afin d’alimenter la campagne responsive des composants de la Home.
- **FR-031**: Le résultat produit de la feature MUST rester Figma-only et MUST NOT modifier ni revendiquer la convergence du contrat HeroVideo, des tokens globaux, des émetteurs de surfaces, du HTML, du code applicatif ou d’Odoo ; seuls le runner de réparation Figma, son transport, ses modèles de campagne et ses tests peuvent évoluer pour livrer 028 en sécurité.
- **FR-032**: La feature MUST étendre l’outillage interne afin de représenter et vérifier honnêtement le component set, les créations Compact/Desktop, le membre Wide historique, les bindings de primitives, les overrides typographiques locaux approuvés et la sélection explicite de chaque composition dans la matrice responsive.
- **FR-033**: Toute nouvelle capacité d’outillage MUST être générique, bornée par allowlist, couverte par fixture négative et eval avant sa première utilisation live, et MUST refuser les créations non déclarées, les écritures Page, les mutations d’enfants partagés et les seconds passages non no-op.

### Key Entities

- **Baseline Wide**: État historique 1728×720 du HeroVideo, protégé comme référence visuelle et structurelle.
- **Frame de travail**: Surface Figma séparée du master où les options et valeurs sont éprouvées avant décision humaine.
- **Composition responsive**: État Compact, Desktop ou Wide du même HeroVideo, choisi explicitement dans Figma Design.
- **Primitive de design system**: Valeur stable déjà disponible, directement liée à une propriété de spacing, padding ou dimension sans lui attribuer encore un rôle responsive global.
- **Override typographique temporaire**: Adaptation locale, datée et approuvée d’une nouvelle composition, conservant le rôle du titre mais différée pour externalisation dans un futur Text Style responsive.
- **Fait protégé**: Identité, média, texte, style historique, propriété, lien d’instance ou override qui ne peut changer sans autorisation explicite.
- **Gate humain**: Point d’arrêt où l’owner accepte, refuse ou réoriente le travail à partir de preuves visibles.
- **Handoff Home**: Inventaire des décisions et observations du pilote destiné à la future campagne responsive des composants de la Home.
- **Capacité runner responsive**: Extension générique et bornée du workflow mono-composant qui sait créer, appliquer, inspecter et rejouer sans effet une transition vers des compositions Figma explicites.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % des quatre gates humains sont datés et acceptés avant l’étape qu’ils autorisent ; aucune décision de design ou mutation source n’est attribuée implicitement à l’agent.
- **SC-002**: Les six largeurs de contrôle et le paysage mobile court présentent zéro débordement horizontal, zéro coupe involontaire et zéro contenu inaccessible avec le contenu par défaut et les contenus longs.
- **SC-003**: 100 % des gaps, paddings et dimensions d’espacement modifiés dans les nouvelles compositions sont liés à des primitives existantes ; zéro valeur brute non autorisée et zéro nouvelle primitive sont introduites.
- **SC-004**: Le témoin Wide 1728 conserve son apparence approuvée sans delta visible non autorisé, ainsi que son identité, son poster, ses voiles, son Text Style et son Button.
- **SC-005**: 100 % des overrides typographiques temporaires sont liés à une composition, une décision owner et une entrée de handoff ; aucun n’est présenté comme Text Style responsive final.
- **SC-006**: Le master, sa key publique, l’instance Home, ses propriétés éditoriales, son contenu et ses overrides protégés restent conservés après la mutation.
- **SC-007**: Zéro nœud Page est modifié par la campagne responsive HeroVideo.
- **SC-008**: La seconde application produit zéro nœud créé, zéro nœud modifié et zéro changement de fait protégé.
- **SC-009**: Un mainteneur distinct peut retrouver sans aide orale les primitives et adaptations typographiques utilisées dans chacune des trois compositions ainsi que tous les sujets différés.
- **SC-010**: Zéro capacité du contrat, du HTML, d’Odoo ou de breakpoint automatique n’est déclarée validée par cette feature.
- **SC-011**: 100 % des créations et modifications du premier passage sont déclarées dans le reçu, et 100 % des fixtures/evals de la nouvelle capacité runner passent avant l’application live.

## Assumptions

- Le baseline H1 et la direction de layout H2 de la feature 027 restent des entrées historiques valides, mais leur version source doit être confirmée par un audit frais avant réutilisation.
- Le master historique attendu reste `2151:5552`, sa key publique reste `36011e51b8bc0b221a1ba6f9108709b5bd1c4490`, son Container local reste `2448:4731` et l’usage Home de contrôle reste `2170:6351` tant qu’un audit frais ne prouve pas le contraire.
- La direction acceptée reste « centrage immersif » pour Compact et Desktop, avec retour au baseline historique en Wide.
- Tablet 834 utilise la composition Compact ; aucune quatrième composition Tablet n’est créée dans cette feature.
- Le poster façade actuel, les deux voiles, le message, le CTA et le Header superposé ne changent pas de rôle.
- Le Text Style historique `Titre Hero vidéo` reste l’autorité Wide. Les éventuelles métriques locales des nouvelles compositions sont des observations temporaires destinées à la future stratégie typographique transverse.
- Le défaut préexistant de liaison du Text Style du libellé CTA Home reste visible dans l’audit comme contexte Page read-only ; il n’est ni traité ni bloquant dans cette feature.
- La future campagne responsive de la Home réutilisera le handoff de cette feature ; une feature encore ultérieure décidera quelles répétitions méritent des variables, modes et Text Styles responsive partagés.

## Scope Boundaries

**In scope**:

- Audit frais et réutilisation contrôlée des preuves H1/H2 de la feature 027.
- Brainstorm responsive directement dans des frames Figma de travail.
- Compositions Compact, Desktop et Wide de HeroVideo dans Figma Design.
- Choix et liaison directe de primitives existantes pour spacing, padding et dimensions.
- Overrides typographiques locaux, bornés et inventoriés sur les nouvelles compositions lorsque nécessaires au design.
- Préservation du master Wide, de son Container, de l’instance Home, des médias, propriétés et overrides.
- Captures, contrôles responsive, gates humains et second passage no-op.
- Handoff détaillé vers la campagne responsive des composants de la Home.
- Extension bornée du runner et du transport Figma pour créer et vérifier la topologie responsive, les bindings, les scénarios par composition et le second passage no-op.
- Fixtures, evals et refus couvrant créations non déclarées, Page writes, mutations d’enfants, bindings détachés, mauvais état sélectionné et idempotence.

**Out of scope**:

- Création ou modification de variables responsive sémantiques, modes globaux, primitives ou Text Styles responsive partagés.
- Toute modification, reconfiguration ou changement de propriété du Button ou d’un autre enfant partagé ; un besoin enfant est seulement inventorié pour une spec séparée.
- Modification directe de l’instance Home, du Header ou de tout autre nœud Page dans la campagne HeroVideo.
- Contrat HeroVideo, schéma produit, tokens globaux, émetteurs de surfaces, HTML, React, Web Components, CSS ou Odoo.
- Breakpoints automatiques dans Figma Design.
- Responsive des autres composants de la Home.
- Création d’une skill dédiée ou élargissement du runner au-delà des opérations strictement nécessaires et testées pour une transition responsive générique.

## Human Gates

| Gate | Décision humaine obligatoire | Preuve minimale avant décision | Interdit avant acceptation |
| --- | --- | --- | --- |
| **H1 — Audit frais** | Confirmer la source, le baseline Wide, les usages, les défauts préexistants et le périmètre exact | Audit par identité et position, preuves historiques reliées, inventaire des dépendances et contextes | Toute proposition présentée comme autoritative et toute mutation Figma |
| **H2 — Design responsive** | Accepter les compositions et les valeurs exactes à installer, y compris chaque primitive et éventuel override typographique local | Frames de travail aux témoins, contenus normal/long, faible hauteur, compromis et sujets différés | Snapshot d’application et mutation du master |
| **H3 — GO source** | Autoriser la transition exacte du master après preuve qu’elle préserve identité, instances et faits protégés | Plan de mutation minimal, captures before complètes, capacité runner verte et preuve de transition non destructive ; le CTA et les enfants restent read-only et hors décision | Toute écriture live du master ou de ses variantes |
| **H4 — Acceptation Figma** | Accepter la source finale, ses limites nommées et le handoff vers la campagne Home | Captures after/idempotence, contrôles d’overflow, faits protégés, zéro Page write et second passage no-op | Clôture de la feature et déclaration du pilote comme référence Figma |

## Historical Inputs

- La feature 027 est `Superseded` et ne doit pas être reprise comme plan d’implémentation.
- Son audit H1, son baseline accepté, son option packet et sa décision H2 « centrage immersif » restent des preuves historiques consultables.
- Toute contradiction entre l’état Figma frais et ces preuves retourne devant H1 au lieu d’être résolue silencieusement.
- Les valeurs de preview de la feature 027 ne sont pas des décisions source et ne sont pas réutilisées automatiquement.
