# Feature Specification: Readiness Figma–contrat des sections

**Feature Branch**: `020-figma-contract-readiness`  
**Created**: 2026-08-09  
**Status**: Complete  
**Input**: Revoir avec l’owner les 11 sections restantes lorsque le Figma vivant peut être cassé, retrouver leur dernière référence saine, comparer Figma, contrat et rendu, traiter les causes composées et décider leur destination Odoo sans transformer l’audit en chantier illimité.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Retrouver une référence saine (Priority: P1)

En tant qu’owner, je veux voir pour chaque section une courte chronologie de ses états disponibles et un nombre limité de références saines candidates, afin de ne jamais promouvoir comme vérité un Figma actuel déjà dégradé.

**Why this priority**: Toute comparaison ou réparation ultérieure serait trompeuse si sa référence de départ était cassée.

**Independent Test**: Choisir une section dont une régression historique est connue, retrouver le premier état dégradé, présenter au plus trois candidats antérieurs avec leurs preuves, et vérifier que la version actuelle n’est pas déclarée saine par défaut.

**Acceptance Scenarios**:

1. **Given** une section actuelle visiblement dégradée et plusieurs états historiques, **When** l’analyse est préparée, **Then** elle présente la chronologie, le changement de rupture probable et au plus trois candidats de référence ordonnés.
2. **Given** des preuves historiques partielles ou contradictoires, **When** aucune référence ne peut être établie honnêtement, **Then** la section reçoit le statut `blocked-history` avec les preuves manquantes nommées.
3. **Given** une ancienne version visuellement plausible, **When** sa structure ou ses dépendances sont incomplètes, **Then** elle n’est pas proposée comme saine sans signaler cette contradiction.

---

### User Story 2 - Décider avec l’owner avant réparation (Priority: P1)

En tant qu’owner, je veux examiner la référence recommandée face à l’état actuel et aux autres candidats plausibles, afin de confirmer l’intention de design avant toute modification.

**Why this priority**: L’analyse peut détecter une rupture technique, mais seule la décision de l’owner distingue une régression d’une évolution volontaire lorsque plusieurs designs sont plausibles.

**Independent Test**: Présenter le dossier d’une section sans la modifier, enregistrer le verdict de l’owner, puis vérifier qu’aucune réparation ni qualification Odoo ne précède ce verdict.

**Acceptance Scenarios**:

1. **Given** une recommandation et deux intentions plausibles, **When** l’owner tient le gate de décision, **Then** il peut choisir une référence, confirmer un changement volontaire, accepter un défaut ou demander une preuve supplémentaire.
2. **Given** un dossier sans verdict owner, **When** une réparation est proposée, **Then** elle reste bloquée et la section ne peut pas devenir `ready`.
3. **Given** une réparation conforme à la décision enregistrée, **When** le résultat est présenté, **Then** l’owner peut l’accepter ou le refuser lors d’un second gate visuel court.

---

### User Story 3 - Attribuer la panne au bon niveau (Priority: P2)

En tant que responsable du design system, je veux savoir si une section est fautive elle-même, utilise mal une dépendance correcte, ou hérite d’un atome ou d’une molécule réellement cassé, afin d’éviter une correction locale qui dégrade les autres consommateurs.

**Why this priority**: Une dépendance partagée corrigée pour un seul cas peut propager une nouvelle régression à de nombreuses sections.

**Independent Test**: Partir d’une section dont un enfant composé semble incorrect, comparer cet enfant seul et dans ses autres consommateurs, puis produire une cause et un graphe d’impact qui distinguent défaut partagé et mauvaise composition locale.

**Acceptance Scenarios**:

1. **Given** une dépendance incorrecte dans plusieurs consommateurs, **When** la cause est attribuée, **Then** tous les consommateurs affectés sont listés et doivent être revalidés après réparation.
2. **Given** une dépendance correcte seule mais incorrectement configurée dans une section, **When** la cause est attribuée, **Then** la réparation reste locale à la composition.
3. **Given** une modification potentielle d’une dépendance déjà qualifiée en production Odoo, **When** elle est approuvée, **Then** les qualifications antérieures affectées sont explicitement identifiées comme à rejouer.

---

### User Story 4 - Orienter chaque section vers la bonne suite (Priority: P2)

En tant que pilote de la livraison Odoo, je veux un verdict complet et comparable pour chacune des 11 sections restantes, afin de savoir lesquelles peuvent entrer en vague standard, lesquelles exigent une exception et lesquelles nécessitent d’abord une réparation séparée.

**Why this priority**: La revue n’apporte de valeur à la livraison que si chaque dossier se termine par une destination exploitable et justifiée.

**Independent Test**: Vérifier que les 11 dossiers possèdent chacun une référence validée ou un blocage honnête, une cause, un impact, un verdict et une destination unique.

**Acceptance Scenarios**:

1. **Given** une section cohérente et gouvernable avec les mécanismes déjà prouvés, **When** son dossier est clos, **Then** elle reçoit `ready` et la destination vague A.
2. **Given** une section livrable avec une exception explicitement acceptée, **When** son dossier est clos, **Then** elle reçoit `ready-with-exception` et la destination vague B.
3. **Given** une évolution partagée, une restauration importante, une image non récupérable ou plusieurs décisions humaines, **When** le dossier est clos, **Then** une affectation vers une sous-spec de réparation nommée est enregistrée comme destination au lieu d’élargir silencieusement 020.

### Edge Cases

- Une section actuelle paraît correcte mais aucune preuve historique ne permet d’affirmer qu’elle respecte encore l’intention initiale.
- La dernière capture saine et le dernier état structurel sain ne datent pas de la même version.
- Deux anciennes versions sont complètes mais correspondent à deux intentions visuelles différentes.
- Une image historique possède une empreinte connue mais ses pixels ne sont plus récupérables.
- Une section a changé volontairement, mais la décision n’a jamais été consignée.
- Une dépendance partagée est saine dans son état par défaut mais cassée dans une seule variante.
- Une réparation locale évidente révèle en cours d’analyse une évolution de schéma ou un impact transversal.
- Header et Footer sont évalués dans 020 mais restent destinés au chantier de shell, pas à une vague de snippets ordinaires.
- Une dépendance de Presentation ou Google Reviews change pendant 020 et invalide une preuve de 019.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La revue MUST couvrir exactement les 11 sections restantes du périmètre des 13 sections, y compris Header et Footer, en excluant Presentation et Google Reviews déjà qualifiées par 019 sauf comme consommateurs affectés.
- **FR-002**: Chaque section MUST disposer d’un dossier unique reliant son état actuel, ses états historiques disponibles, son contrat actuel, son rendu actuel et ses défauts déjà connus.
- **FR-003**: Le Figma actuel MUST être traité comme une surface à diagnostiquer et MUST NOT devenir la référence saine par défaut.
- **FR-004**: Pour chaque section, l’analyse MUST rechercher les états historiques disponibles dans les versions de design, captures, représentations structurelles, maquettes de pages et versions du contrat et du rendu.
- **FR-005**: Chaque candidat de référence MUST indiquer sa période, les preuves qui le soutiennent, les preuves manquantes ou contradictoires et la raison de son classement.
- **FR-006**: L’analyse MUST proposer au plus trois candidats au gate owner et MUST recommander un candidat lorsqu’une recommandation honnête est possible.
- **FR-007**: Une référence MUST NOT être qualifiée de saine sur sa seule ancienneté ou sur une capture isolée lorsque des preuves structurelles contradictoires existent.
- **FR-008**: Aucune réparation de design, contrat ou rendu MUST commencer avant un verdict owner enregistré pour la section concernée.
- **FR-009**: Le gate owner MUST permettre les décisions suivantes : référence validée, évolution volontaire, défaut accepté, capacité hors contrat, preuve supplémentaire requise ou aucune référence récupérable.
- **FR-010**: Chaque décision owner MUST conserver la section, la référence ou le changement choisi, la justification, la date et les conséquences acceptées.
- **FR-011**: Après une réparation, un gate visuel owner MUST confirmer ou refuser que le résultat corresponde à la décision initiale.
- **FR-012**: Chaque différence significative MUST être attribuée à l’une des causes suivantes : régression design, régression contrat, régression des deux, rendu fautif, image manquante, évolution volontaire, défaut accepté, hors contrat ou historique insuffisant.
- **FR-013**: Lorsqu’une cause implique une dépendance composée, le dossier MUST distinguer défaut de la dépendance et mauvaise utilisation locale.
- **FR-014**: Toute dépendance partagée potentiellement modifiée MUST avoir un graphe d’impact listant tous ses consommateurs connus et leur besoin de revalidation.
- **FR-015**: Une dépendance partagée MUST NOT être modifiée uniquement pour améliorer une section sans preuve qu’elle est elle-même fautive et sans revalidation de ses consommateurs affectés.
- **FR-016**: Toute modification affectant une dépendance déjà qualifiée par 019 MUST déclencher une décision explicite de repin et la liste des preuves 019 à rejouer.
- **FR-017**: Les réparations locales, réversibles, sans évolution de modèle partagé et conformes à une décision owner MAY être réalisées dans 020.
- **FR-018**: Une évolution de schéma, de moteur, de dépendance partagée, une restauration massive, un problème d’image non local ou un besoin de plusieurs gates MUST être orienté vers une sous-spec de réparation nommée.
- **FR-019**: Chaque section MUST recevoir exactement un verdict final parmi `ready`, `ready-with-exception`, `repair-figma`, `repair-contract`, `repair-renderer`, `accepted-defect`, `out-of-contract` ou `blocked-history`.
- **FR-020**: Chaque section MUST recevoir exactement une destination : vague A, vague B, chantier shell ou sous-spec de réparation nommée.
- **FR-021**: Une section MUST NOT être déclarée `ready` si elle n’a pas une référence validée par l’owner, une comparaison des trois surfaces actuelles, une cause attribuée, un graphe d’impact examiné et un gate final lorsque réparation il y a eu.
- **FR-022**: Les preuves indisponibles, refusées ou impossibles à récupérer MUST être nommées et MUST NOT être agrégées comme réussite.
- **FR-023**: La clôture MUST produire une vue consolidée des 11 sections, de leurs dépendances touchées, de leurs décisions owner, de leurs verdicts et de leurs destinations.
- **FR-024**: La revue MUST préserver les images et les états actuels de toutes les cibles potentiellement modifiées avant la première mutation, afin que l’avant reste vérifiable.
- **FR-025**: Une différence MUST être classée `significant` lorsqu’elle change l’intention visuelle, la structure, le contenu, le comportement, une dépendance, la disponibilité d’une image ou le verdict possible; elle MAY être `informational` uniquement lorsqu’elle ne change aucune de ces dimensions, avec une justification enregistrée.
- **FR-026**: Pour les sections autres que Header et Footer, la destination MUST suivre cette matrice : `ready` vers vague A; `ready-with-exception`, `accepted-defect` ou `out-of-contract` vers vague B; `repair-figma`, `repair-contract`, `repair-renderer` ou `blocked-history` vers une sous-spec nommée. Header et Footer MUST rester destinés au chantier shell, quel que soit leur verdict.
- **FR-027**: Chacune des 11 sections MUST recevoir un reçu du premier gate owner avant diagnostic; ce reçu peut enregistrer une référence validée, une autre décision autorisée par FR-009 ou un blocage, mais son absence MUST bloquer les phases suivantes pour la section.

### Key Entities

- **Section Readiness Dossier**: Dossier d’une section reliant chronologie, état courant, candidats historiques, surfaces actuelles, causes, décision owner, impact, verdict et destination.
- **Historical State**: État daté d’une section ou dépendance, avec preuves visuelles et/ou structurelles disponibles et limites de récupération.
- **Reference Candidate**: État historique proposé comme intention saine possible, classé et justifié sans être encore autoritaire.
- **Owner Decision**: Verdict humain qui transforme un candidat en référence, confirme une évolution ou accepte explicitement une limite.
- **Difference Finding**: Écart observable entre référence validée et une surface actuelle, avec importance et cause attribuée.
- **Dependency Impact Graph**: Relation entre une dépendance potentiellement fautive et toutes les sections ou composants qui la consomment.
- **Repair Assignment**: Destination bornée d’un travail restant, soit réparation locale dans 020, soit sous-spec nommée.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Les 11 sections restantes disposent chacune d’un dossier complet ou d’un blocage historique explicitement prouvé; aucune section ne disparaît silencieusement du bilan.
- **SC-002**: 100 % des références utilisées pour autoriser une réparation ont reçu un verdict owner avant le premier changement.
- **SC-003**: Pour chacune des 11 sections présentées au premier gate, le temps actif entre l’ouverture du paquet et la décision ou demande d’exploration est enregistré; l’owner doit pouvoir identifier la rupture probable, les candidats, la recommandation et la prochaine action en moins de 10 minutes actives, toute exploration supplémentaire étant chronométrée séparément.
- **SC-004**: 100 % des différences significatives reçoivent une cause et 100 % des causes impliquant une dépendance partagée possèdent un graphe d’impact.
- **SC-005**: Aucune réparation d’une dépendance partagée ne laisse un consommateur connu sans verdict de revalidation.
- **SC-006**: 100 % des sections reçoivent une destination unique parmi vague A, vague B, chantier shell ou sous-spec nommée.
- **SC-007**: Aucune évolution de modèle partagé, restauration massive ou réparation d’image transversale n’élargit 020 sans une affectation séparée explicitement approuvée.
- **SC-008**: Parmi les réparations réalisées dans 020 et effectivement présentées au gate visuel final, au moins 90 % sont acceptées au premier passage; le rapport conserve le numérateur, le dénominateur et chaque refus. Si aucune réparation n’atteint ce gate, le résultat est `not-applicable` et ne compte ni comme réussite ni comme échec.
- **SC-009**: Toute modification touchant le périmètre déjà qualifié par 019 est détectée avant clôture et possède une décision de repin et de revalidation.

## Assumptions

- L’owner est l’autorité finale sur l’intention visuelle lorsqu’au moins deux états historiquement plausibles existent.
- Les preuves historiques disponibles peuvent être incomplètes; l’absence honnête de référence produit `blocked-history` plutôt qu’une reconstruction inventée.
- Les 11 sections sont Coordonnees, Devis, Equipe, FAQ, Formulaire, Header, Hero, Footer, Reassurances, SAV et TexteSEO; Presentation et Google Reviews constituent les deux références déjà qualifiées.
- Header et Footer sont audités avec les autres sections mais leur destination normale reste le chantier de shell.
- Les captures seules prouvent une apparence; elles ne suffisent pas à prouver une structure ou une intention de propriété.
- Les représentations structurelles seules prouvent une organisation; elles ne suffisent pas à prouver les pixels d’images historiques.
- 020 privilégie le diagnostic, la décision et le routage; il ne garantit pas que toute réparation importante soit réalisée dans la même feature.
- Toute cible susceptible d’être modifiée conserve un état avant vérifié avant la première mutation.
