# Feature Specification: Réparer la convergence des dernières molécules

**Feature Branch**: `011-fix-molecule-convergence`
**Created**: 2026-07-28  
**Status**: Implemented with honest blocked visual verdict (2026-07-29)
**Input**: Reprendre le chantier de convergence Figma → contrat → code depuis le checkpoint historique `45e2a7d5a950e3d6ccc2a0dd62982b7c288210c5`, préserver le WIP partagé, réparer les sept molécules encore non validées et produire une comparaison visuelle probante sans aucune mutation de Figma ni correction directe des sorties générées.

## État d'implémentation (2026-07-29)

La campagne finale a comparé 98/98 cas avec 227/227 faits couverts et aucune référence Figma manquante. La suite de dépôt est verte (153/153 évaluations), mais la validation visuelle reste volontairement bloquée : 91 cas sont sous le seuil pixel de 2,5 % et 7 cas restent rouges (Carte 03/08/11, Field optionnel et trois NavItem). Les limites Figma non prouvables restent nommées pour les variantes Field absentes, le plan d'image partagé MemberCard et ProductCard `Bouton=true`.

La décision est donc `blocked` (code 2), conformément à FR-016, FR-017, FR-021 et FR-023. Le détail inspectable se trouve dans `proofs/visual/REPORT.md` et `proofs/visual/result.json`; `T051` et la clôture terminale `T053` restent volontairement ouvertes tant qu'un verdict visuel positif n'est pas démontré.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Valider chaque molécule sur une preuve visuelle probante (Priority: P1)

En tant que responsable du design system, je veux que chaque variante, état et image observable des sept molécules restantes soit réellement comparé à la référence Figma immuable, afin de pouvoir distinguer une convergence démontrée d'un score artificiellement favorable.

Les sept molécules dans le périmètre sont **Carte, Field, MemberCard, NavItem, ProductCard, Realisation et Tab**.

**Why this priority**: La preuve visuelle est la condition de clôture du chantier. Le rapport précédent montre des scores supérieurs au seuil pour six molécules et un score nul non concluant pour NavItem.

**Independent Test**: Pour une molécule donnée, un réviseur parcourt sa matrice de couverture, vérifie que chaque cas montre du contenu utile dans les deux rendus, puis confirme que chaque score probant est inférieur ou égal à 2,5 % et associé à un triptyque permettant d'identifier les écarts.

**Acceptance Scenarios**:

1. **Given** une variante ou un état légal de la molécule dans Figma ou dans son contrat, **When** la campagne de comparaison est produite, **Then** ce cas apparaît explicitement dans la matrice de couverture avec une référence Figma, un rendu généré, un diff lisible et un résultat.
2. **Given** un cas dont le masque retire tout ou partie du signal utile, **When** son résultat est évalué, **Then** le score masqué n'est pas accepté comme preuve et une mesure non masquée ou limitée à une région qui conserve le signal utile fait foi.
3. **Given** un composant clair ou transparent qui disparaît sur le fond de capture, **When** il est comparé, **Then** une surface de contraste fidèle et commune aux deux rendus rend le contenu visible sans changer la géométrie du composant.
4. **Given** un cas dont le score probant dépasse 2,5 %, **When** le rapport de clôture est revu, **Then** la molécule reste non validée, même si un autre score masqué ou agrégé passe sous le seuil.
5. **Given** une molécule contenant une image, **When** elle est comparée, **Then** les pixels d'image réellement visibles dans Figma et dans le rendu généré participent à la preuve ; un placeholder, une zone vide ou un masque de l'image ne vaut pas comparaison.

---

### User Story 2 - Faire du contrat la cause vérifiable du rendu généré (Priority: P1)

En tant que développeur consommateur, je veux que l'anatomie, les propriétés, la composition et la sémantique de chaque molécule soient exprimées dans son contrat puis respectées par le rendu généré, afin que la correction soit durable et reproductible.

**Why this priority**: Une ressemblance pixel obtenue au prix d'une structure ou d'une sémantique incorrecte ne constitue pas une convergence contrat → code.

**Independent Test**: Pour une molécule donnée, un réviseur relie chaque fait visible et sémantique attendu à un fait du contrat, régénère le rendu sans retouche manuelle et vérifie la structure, les états et la comparaison visuelle.

**Acceptance Scenarios**:

1. **Given** un fait observable dans le master Figma en lecture seule, **When** il est retenu dans la cible de convergence, **Then** il est représenté par un fait explicite du contrat ou par une limite honnêtement nommée qui interdit la validation.
2. **Given** un contrat corrigé, **When** les sorties sont régénérées, **Then** aucune retouche des composants, styles, récits de démonstration, catalogues, échantillons ou scripts Figma générés n'est nécessaire pour obtenir le résultat.
3. **Given** un état qui modifie la sémantique ou la composition, **When** le rendu généré est inspecté, **Then** sa structure sémantique correspond au contrat et pas seulement à son apparence.
4. **Given** une correction qui améliore uniquement la capture de référence mais dégrade l'usage normal, **When** sa justification est examinée, **Then** elle est rejetée comme correction spécifique au screenshot.

---

### User Story 3 - Mesurer fidèlement les cas difficiles sans faux vert (Priority: P1)

En tant que réviseur, je veux que l'instrument de comparaison détecte les contenus invisibles, les masques qui annulent le signal, les différences de géométrie et les cas non couverts, afin que son verdict soit fiable.

**Why this priority**: Le rapport précédent contient un score nul non concluant pour NavItem et plusieurs images non transportées ; la fiabilité de l'instrument conditionne toute décision de validation.

**Independent Test**: Des fixtures adversariales connues — contenu blanc sur fond blanc, masque couvrant toute l'encre, image manquante, racines décalées et variante omise — doivent être rejetées ou signalées comme non probantes.

**Acceptance Scenarios**:

1. **Given** une capture vide ou dont le contenu utile est invisible, **When** le verdict est calculé, **Then** le cas est déclaré non probant et ne peut pas valider le composant.
2. **Given** deux racines de tailles ou de positions différentes, **When** elles sont comparées, **Then** l'écart géométrique est mesuré et empêche la validation sauf justification explicite fondée sur le contrat.
3. **Given** une variante, un état ou une image attendu mais absent de la campagne, **When** la couverture est contrôlée, **Then** la campagne échoue comme incomplète.
4. **Given** une fixture qui retire artificiellement le signal utile, **When** la suite de vérification est exécutée, **Then** elle prouve que l'instrument refuse le faux vert.

---

### User Story 4 - Clore sans altérer Figma ni écraser le WIP (Priority: P2)

En tant que mainteneur du dépôt partagé, je veux que la convergence soit établie depuis le checkpoint historique tout en préservant les changements en cours, afin que la preuve soit attribuable et que le travail des autres contributeurs reste intact.

**Why this priority**: Le workspace contient déjà de nombreux changements partagés. Une fermeture obtenue par mutation de Figma, écrasement global ou retouche d'une sortie générée serait irréversible ou non reproductible.

**Independent Test**: Le diff final est comparé au WIP initial et au checkpoint historique ; seules les sources autorisées et les preuves attendues ont changé, aucune écriture Figma n'a eu lieu, et la régénération reproduit les sorties.

**Acceptance Scenarios**:

1. **Given** le fichier Figma de référence, **When** tout le chantier est exécuté, **Then** chaque accès Figma est strictement en lecture seule et aucune création, mise à jour, suppression ou writeback de node n'a lieu.
2. **Given** le WIP partagé au démarrage, **When** les changements de la fonctionnalité sont examinés, **Then** aucun changement préexistant hors périmètre n'a été écrasé ou annulé.
3. **Given** le commit `45e2a7d5a950e3d6ccc2a0dd62982b7c288210c5`, **When** le rapport final est produit, **Then** il distingue les faits historiques, le WIP préexistant et les corrections attribuables à ce chantier.
4. **Given** une sortie générée modifiée, **When** sa provenance est auditée, **Then** elle est reproductible depuis une source autorisée et ne contient aucune retouche directe.

### Edge Cases

- Une variante existe dans Figma mais pas dans le contrat, ou réciproquement : la couverture est incomplète et la molécule ne peut pas être validée.
- Une image Figma est un override ou une ressource non transportée : elle doit être promue en fait contractuel légitime ou la molécule reste non validée ; elle ne peut être remplacée par une image inventée.
- Le score global passe sous 2,5 % alors qu'une région utile échoue : le cas échoue sur la mesure qui conserve le signal utile.
- Le score est indéfini parce que le masque couvre toute l'encre : le cas est non probant, jamais assimilé à 0 %.
- Les dimensions diffèrent à cause d'un choix de contenu ou de fixture : le cas doit être rendu avec des entrées équivalentes ; aucune normalisation arbitraire de largeur ou de hauteur n'est admise.
- Une différence géométrique est intentionnelle et décrite par le contrat : sa justification et son effet doivent être visibles dans la preuve ; sinon elle bloque la validation.
- Une correction générique affecte des composants déjà validés : leurs preuves et vérifications doivent rester valides avant que la correction soit acceptée.
- Un état interactif ne peut pas être stabilisé dans les conditions de capture : il est déclaré non couvert et empêche la validation complète tant qu'une preuve fidèle n'existe pas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le périmètre MUST couvrir exactement les sept molécules non validées par le rapport du 2026-07-28 : Carte, Field, MemberCard, NavItem, ProductCard, Realisation et Tab.
- **FR-002**: Figma MUST rester la vérité visuelle immuable et MUST être utilisé exclusivement en lecture seule pendant tout le chantier.
- **FR-003**: Aucune opération de push, writeback, update, création, suppression ou mutation du canvas Figma MUST avoir lieu.
- **FR-004**: Le checkpoint historique `45e2a7d5a950e3d6ccc2a0dd62982b7c288210c5` MUST servir de point d'attribution historique sans remplacer ni annuler le WIP partagé actuel.
- **FR-005**: Le chantier MUST préserver tous les changements préexistants hors périmètre et MUST interdire les opérations globales ou destructives qui les écraseraient.
- **FR-006**: Les sorties générées — composants, styles, récits de démonstration, catalogues, échantillons et scripts Figma — MUST NOT être éditées directement.
- **FR-007**: Les seules sources de correction autorisées MUST être les contrats, le schéma, les émetteurs génériques après preuve indépendante, le dispositif de comparaison uniquement pour fidéliser la mesure, ainsi que les fixtures et vérifications.
- **FR-008**: Toute modification d'un mécanisme générique MUST être précédée d'une fixture indépendante qui reproduit le défaut et suivie d'une vérification qui empêcherait sa réapparition.
- **FR-009**: Chaque fait visuel nécessaire à la convergence MUST provenir de Figma en lecture seule et être promu dans le contrat ; chaque fait structurel ou sémantique MUST être explicite dans le contrat et aucun fait MUST être inventé uniquement à partir du rendu souhaité.
- **FR-010**: Le rendu de code MUST être intégralement régénéré depuis le contrat et MUST respecter son anatomie, sa composition, ses propriétés, ses états et sa structure sémantique.
- **FR-011**: La campagne visuelle MUST comparer exhaustivement toutes les variantes et tous les états légaux présents dans Figma ou dans le contrat, avec une correspondance explicite entre les deux ensembles.
- **FR-012**: Chaque image visible qui participe à une variante ou à un état MUST être réellement rendue et comparée ; un placeholder, une suppression, une transparence ou un masque qui retire l'image MUST rendre la preuve invalide.
- **FR-013**: Chaque cas de comparaison MUST montrer un contenu utile visible dans les deux rendus sous des conditions de capture équivalentes.
- **FR-014**: Chaque cas MUST fournir une preuve inspectable comprenant la référence Figma, le rendu généré, le diff et les métadonnées de couverture nécessaires à son identification.
- **FR-015**: Le score qui décide de la validation MUST conserver le signal utile. Si un masque retire ce signal, une mesure non masquée ou régionale fidèle MUST remplacer le score masqué.
- **FR-016**: Une molécule MUST NOT être validée si l'un de ses cas probants dépasse 2,5 % de différence.
- **FR-017**: Une molécule MUST NOT être validée si sa capture est vide, invisible, non équivalente, si une variante, un état ou une image manque, ou si sa géométrie diffère sans justification fondée sur le contrat.
- **FR-018**: Les dimensions, l'alignement des racines et la géométrie interne MUST être comparés séparément du score pixel afin qu'un cadrage ou un redimensionnement ne puisse pas masquer un écart.
- **FR-019**: Une modification introduite uniquement pour satisfaire les conditions de capture MUST être rejetée ; les fixtures peuvent fournir le contenu et la surface nécessaires mais MUST NOT modifier le comportement normal du composant.
- **FR-020**: La validation finale MUST inclure une matrice de traçabilité reliant, pour chaque molécule et chaque cas, le fait Figma, le fait du contrat, le rendu généré, la preuve visuelle et le verdict.
- **FR-021**: Le rapport final MUST nommer honnêtement tout cas non prouvé, toute limite, toute dégradation et toute vérification non exécutée ; aucun silence MUST être interprété comme une réussite.
- **FR-022**: La clôture MUST démontrer que les vérifications du dépôt pertinentes pour la génération, la parité, le déterminisme, la sémantique et la fidélité visuelle sont toutes réussies sur l'état final.
- **FR-023**: La clôture MUST être refusée tant que les sept molécules ne satisfont pas simultanément les exigences visuelles, contractuelles, sémantiques et de couverture de cette spécification.

### Key Entities

- **Molécule cible**: Un des sept composants restant à converger, avec son identité Figma immuable, son contrat, ses sorties générées et son verdict.
- **Cas de comparaison**: Une combinaison déterminée de variante, état, contenu, image et conditions de capture qui doit être présente des deux côtés.
- **Fait du contrat**: Une déclaration versionnée représentant un fait Figma observable ou une sémantique attendue et gouvernant les sorties générées.
- **Preuve visuelle probante**: Un ensemble inspectable de rendus et de mesures dans lequel le contenu utile reste visible, couvert et mesuré.
- **Matrice de traçabilité**: La relation exhaustive entre molécules, cas Figma, faits du contrat, rendus générés, preuves et verdicts.
- **Verdict de validation**: Un résultat binaire par molécule, accompagné de ses causes ; il ne peut être positif que si tous les cas obligatoires passent.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Les 7 molécules sur 7 disposent d'un verdict positif fondé sur l'intégralité de leurs variantes, états et images attendus.
- **SC-002**: 100 % des cas recensés dans la matrice de couverture disposent d'une référence Figma visible, d'un rendu généré visible, d'un diff inspectable et d'un score probant inférieur ou égal à 2,5 %.
- **SC-003**: 0 cas validé ne repose sur un masque qui retire le signal utile, une capture vide ou invisible, une image absente, un placeholder non équivalent ou une variante omise.
- **SC-004**: 100 % des différences de dimensions, d'alignement ou de géométrie sont soit supprimées, soit justifiées explicitement par un fait du contrat ; aucune justification implicite n'est acceptée.
- **SC-005**: 100 % des structures sémantiques contrôlées dans les rendus générés correspondent aux faits de leurs contrats.
- **SC-006**: 0 modification directe d'une sortie générée et 0 mutation Figma sont attribuables au chantier.
- **SC-007**: 100 % des corrections de mécanismes génériques sont accompagnées d'une preuve indépendante qui échoue avant la correction et réussit après.
- **SC-008**: La régénération complète reproduit les sorties attendues sans retouche, et toutes les vérifications de clôture pertinentes réussissent.
- **SC-009**: Un réviseur peut déterminer en moins de 10 minutes, à partir du rapport et de la matrice, pourquoi chacune des sept molécules est validée et quels cas ont fondé son verdict.

## Assumptions

- Le rapport de validation du 2026-07-28 est l'inventaire de départ : six molécules de la campagne précédente sont déjà probantes et les sept nommées ici constituent le reliquat.
- Le seuil de 2,5 % s'applique à chaque cas probant, pas à une moyenne par composant ni à un score agrégé de campagne.
- Lorsqu'un masque est légitime pour neutraliser une instabilité sans rapport avec le composant, il ne peut être utilisé que si la région utile reste intégralement mesurée et visible.
- Une surface de contraste ajoutée par le dispositif de comparaison est acceptable si elle est identique des deux côtés, extérieure au composant et n'en change ni les dimensions ni le rendu normal.
- Les entrées de comparaison peuvent être des fixtures déterministes lorsqu'elles servent uniquement à fournir le même contenu réel aux deux rendus.
- Les sorties générées déjà présentes dans le WIP peuvent changer à la suite d'une régénération légitime, mais ne peuvent jamais être la source d'une correction.
- Toute incapacité à transporter fidèlement une image, un état, une variante ou une sémantique maintient la molécule concernée au statut non validé ; aucun waiver implicite n'est admis.

### Out of Scope

- Modifier, nettoyer ou réorganiser le fichier Figma.
- Revalider les six molécules déjà probantes, sauf si une correction générique les affecte.
- Ajouter de nouvelles molécules ou de nouveaux organismes.
- Refaire l'historique ou restaurer globalement le dépôt au checkpoint.
- Améliorer le dispositif de comparaison au-delà de ce qui est nécessaire pour empêcher un faux verdict ou rendre la mesure fidèle.
- Introduire des différences de production destinées uniquement à l'environnement de capture.

### Dependencies

- Accès en lecture seule au fichier Figma et à ses ressources visuelles de référence.
- WIP partagé actuel, conservé comme état de travail de départ.
- Checkpoint historique `45e2a7d5a950e3d6ccc2a0dd62982b7c288210c5` disponible pour l'attribution et la comparaison.
- Rapports et preuves existants de la campagne molécules du 2026-07-28.
- Chaîne déterministe existante de contrat, génération, vérification et comparaison visuelle.
