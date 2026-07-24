# Feature Specification: Icônes gouvernées + finalisation du Bouton (choix d'icône et mise à jour du master)

**Feature Branch**: `002-governed-icons-button`  
**Created**: 2026-07-23  
**Status**: Draft  
**Input**: User description: "Donner aux icônes du design system Piqueray une existence gouvernée — le menu d'icônes du designer et ce que le développeur peut utiliser en code doivent être une seule et même liste, garantie — puis finir le composant Bouton : ses deux emplacements d'icône deviennent pilotables des deux côtés (quelle icône, affichée ou non), et l'unique mise à jour du master Figma clôt l'alignement complet contrat/code/Figma, sans rien casser des maquettes." (Brief complet livré en session du 2026-07-23, avec mesures et périmètre de nettoyage décidés par l'owner.)

## Clarifications

### Session 2026-07-23

- Q: Forme de l'existence gouvernée des icônes (registre unique vs un contrat par icône vs au rang des tokens) → A: **Registre unique** — UN document versionné listant les icônes garanties du jeu ; le menu du designer côté Figma et la liste utilisable côté code en dérivent et sont vérifiés mécaniquement contre lui. C'est la pratique standard des design systems (un jeu + son manifeste, jamais un contrat par glyphe), et cela s'emboîte dans le mécanisme d'acceptation des emplacements déjà présent (élargir la liste = évolution mineure, la réduire = majeure).
- Q: Mécanique des emplacements d'icône du Bouton (garder l'actuel vs basculer au slot natif de l'outil de design) → A: **Garder l'actuel** — le mécanisme prouvé de la 001 (menu de remplacement + interrupteur d'affichage). La mise à jour du master reste UNIQUE et minimale ; zéro risque ajouté sur les 26 icônes choisies des maquettes. Le slot natif reste explicitement hors périmètre (spec future éventuelle).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - La mise à jour du master ne casse rien des maquettes (Priority: P1)

L'owner veut que l'unique mise à jour du master Bouton dans le fichier Figma ne casse AUCUNE personnalisation des 9 pages de maquettes (43 textes personnalisés, 26 icônes choisies), preuve mesurée à l'appui — afin de faire confiance au système sur un vrai fichier client, pas seulement sur une page de laboratoire.

**Why this priority**: C'est le risque maximal de l'itération : le master est utilisé partout dans un vrai fichier. Une mise à jour qui écrase les personnalisations détruirait la confiance que toute la démarche cherche à construire. La preuve « rien n'a bougé » est la condition de tout le reste.

**Independent Test**: Une photographie d'état des 9 pages est prise avant l'opération ; la mise à jour du master est appliquée ; la photographie d'après est comparée à celle d'avant — identiques (dans la tolérance de l'instrument), et les 43 textes + 26 icônes choisies sont intégralement retrouvés.

**Acceptance Scenarios**:

1. **Given** les 9 pages avec leurs 43 textes personnalisés et 26 icônes choisies, photographiées avant l'opération, **When** l'unique mise à jour du master est appliquée, **Then** la photographie d'après est identique à celle d'avant (mesure, pas à l'œil) et chaque personnalisation est intégralement restaurée.
2. **Given** des points de restauration en place avant l'opération, **When** la mise à jour échoue en cours de route, **Then** le fichier est ramené intégralement à son état antérieur.
3. **Given** une personnalisation que l'opération ne sait pas restaurer automatiquement, **When** la restauration s'exécute, **Then** cette personnalisation est listée nommément (jamais perdue en silence) et son traitement est validé par l'owner.

---

### User Story 2 - Le développeur a exactement le menu d'icônes du designer (Priority: P1)

Le développeur veut utiliser les icônes du design system dans le code et dans les deux emplacements du Bouton, avec la garantie que son choix = le menu du designer — afin de reproduire n'importe quel bouton des maquettes sans bricoler de SVG à la main.

**Why this priority**: C'est la promesse centrale de l'itération : une seule liste d'icônes, garantie des deux côtés. Sans elle, le choix d'icône reste un bricolage côté code et le Bouton n'est pas finissable.

**Independent Test**: La liste des icônes utilisables côté code est confrontée mécaniquement au menu du designer côté Figma : c'est la même liste, élément par élément. Un bouton avec icône pris dans les maquettes est reproduit en code en nommant l'icône — sans aucun SVG ajouté à la main.

**Acceptance Scenarios**:

1. **Given** le jeu d'icônes gouverné, **When** le développeur liste les icônes disponibles côté code, **Then** la liste est exactement celle du menu du designer côté Figma — vérifié mécaniquement, pas sur parole.
2. **Given** un bouton des maquettes avec une icône choisie, **When** le développeur le reproduit en code en nommant cette icône, **Then** le rendu est conforme sans aucun SVG bricolé à la main.
3. **Given** les deux emplacements d'icône du Bouton, **When** le designer règle « quelle icône » et « affichée ou non » côté Figma, ou le développeur côté code, **Then** les deux côtés offrent les mêmes réglages avec les mêmes choix possibles.
4. **Given** une divergence introduite entre le menu du designer et la liste côté code, **When** la comparaison s'exécute, **Then** la divergence est détectée et listée en clair (jamais silencieuse).

---

### User Story 3 - Un jeu d'icônes propre, audité AVANT toute contractualisation (Priority: P2)

Le designer veut un jeu d'icônes propre — couleurs branchées aux variables, règles d'échelle posées, documenté, sans dépendance à une bibliothèque tierce — afin de travailler sereinement dans son fichier. L'owner veut que ce nettoyage soit **l'étape 0**, exécutée et validée AVANT toute extraction : on ne contractualise jamais une source sale (règle projet gravée, leçon de la 001).

**Why this priority**: P2 en valeur pour l'owner, mais **séquentiellement première** : toute la suite (contrat, code, master) hérite de la qualité de la source. Développer sur une mauvaise source coûte des jours de rework (receipts : le Bouton de la 001).

**Independent Test**: Un audit outillé de la source produit un rapport en clair (masters ET usage, repéré par position) ; les 4 items de nettoyage décidés sont appliqués ; toute anomalie supplémentaire est proposée à l'owner qui tranche ; l'owner valide la source nettoyée — et rien n'a été extrait avant cette validation.

**Acceptance Scenarios**:

1. **Given** la source Figma des icônes, **When** l'audit étape 0 s'exécute, **Then** il produit un rapport en clair couvrant les masters (structure, contraintes, branchements aux variables, tailles, descriptions) ET l'usage (toutes les instances de toutes les pages, repérées par position, jamais par nom).
2. **Given** les 4 items de nettoyage décidés par l'owner, **When** le nettoyage est appliqué dans Figma, **Then** la couleur de l'icône mail est branchée aux variables (la seule figée), les 4 icônes sans règles d'échelle en ont, les 15 masters portent une description, et le chevron de bibliothèque externe est remplacé par un master local sur ses 22 usages.
3. **Given** une anomalie découverte par l'audit hors des 4 items décidés, **When** elle est rencontrée, **Then** elle est proposée à l'owner comme changement nommé (jamais corrigée en silence, jamais contournée par le modèle) et l'owner tranche AVANT la contractualisation.
4. **Given** la source pas encore validée par l'owner, **When** une extraction est tentée, **Then** elle n'a pas lieu — l'étape 0 validée est le préalable obligatoire.
5. **Given** les deux tailles d'icônes (20 et 32), **When** le nettoyage s'exécute, **Then** elles sont respectées telles quelles — c'est un choix de design voulu, pas une incohérence à « harmoniser ».

---

### User Story 4 - L'owner constate lui-même que c'est fini (Priority: P2)

L'owner veut voir la preuve finale dans le dashboard et Storybook : alignement contrat/code/Figma à zéro écart, suite de vérification entièrement verte, et un exemple de bouton avec icônes — afin de constater lui-même que c'est fini, sans avoir à croire sur parole.

**Why this priority**: Restitution et clôture — la valeur est dans le constat autonome par l'owner. Non bloquant pour la garantie elle-même, mais c'est le critère de fin de l'itération.

**Independent Test**: L'owner ouvre le dashboard : la comparaison affiche zéro écart et un bouton avec icônes est visible. Il ouvre Storybook : l'exemple avec icônes s'affiche. Il lance la suite de vérification : entièrement verte.

**Acceptance Scenarios**:

1. **Given** l'itération livrée, **When** l'owner ouvre le dashboard, **Then** la comparaison contrat/code/Figma affiche ZÉRO écart (le dernier écart déclaré de la 001 a disparu) et un bouton avec icônes y est visible.
2. **Given** l'itération livrée, **When** l'owner lance la suite de vérification, **Then** elle passe au complet — les 3 vérifications volontairement rouges de la 001 se sont éteintes.
3. **Given** l'itération livrée, **When** l'owner ouvre Storybook, **Then** un exemple de bouton avec icônes (dans ses deux emplacements) s'affiche.

---

### Edge Cases

- **L'audit découvre une anomalie hors des 4 items décidés** : proposition nommée à l'owner qui tranche AVANT contractualisation — jamais de correction silencieuse, jamais de modélisation autour d'une source sale.
- **Le remplacement du chevron externe modifie le rendu d'un pixel** : la photographie d'état le mesure ; l'écart est soit nul, soit expliqué et accepté explicitement par l'owner (c'est un changement de source voulu, pas un accident).
- **Une instance d'icône hors du jeu gouverné subsiste** (ex. un chevron externe résiduel parmi les 22 usages) : détectée et listée — jamais ignorée.
- **Le menu du designer et la liste code divergent après livraison** (icône ajoutée/retirée d'un seul côté) : la divergence est détectée mécaniquement et listée en clair.
- **Une icône naîtrait côté code sans exister dans Figma** : refusé — toute nouvelle capacité naît DANS Figma puis est extraite (Figma-first), jamais l'inverse.
- **La mise à jour du master échoue en cours de route** : points de restauration en place ; retour intégral à l'état antérieur ; l'opération reste UNIQUE (pas de série de retouches).
- **Une personnalisation non restaurable automatiquement** : listée nommément, traitement validé par l'owner — l'omission silencieuse est la faute la plus grave.
- **Une vérification voudrait « harmoniser » les tailles 20/32** : hors périmètre — les deux tailles sont un choix de design voulu, à respecter tel quel.

## Requirements *(mandatory)*

### Functional Requirements

**Étape 0 — source propre avant tout contrat (règle projet)**

- **FR-001**: Un audit outillé de la source Figma des icônes MUST être exécuté AVANT toute extraction, couvrant les masters (structure, contraintes, branchements aux variables, tailles, descriptions) ET l'usage (toutes les instances de toutes les pages, repérées par position, jamais par nom), et produire un rapport en clair.
- **FR-002**: Les 4 items de nettoyage décidés par l'owner MUST être appliqués dans Figma : (a) la couleur de l'icône mail branchée aux variables (la seule figée) ; (b) des règles d'échelle posées sur les 4 icônes qui n'en ont pas ; (c) une description sur chacun des 15 masters ; (d) le chevron de bibliothèque externe remplacé par un master local sur ses 22 usages (zéro dépendance tierce restante).
- **FR-003**: Toute anomalie supplémentaire découverte par l'audit MUST être proposée à l'owner comme un changement nommé — jamais corrigée en silence, jamais contournée en modélisant autour — et l'owner MUST trancher avant la contractualisation.
- **FR-004**: Aucune extraction ni contractualisation MUST n'avoir lieu avant la validation par l'owner de la source nettoyée (étape 0 close).
- **FR-005**: Les deux tailles d'icônes (20 et 32) MUST être respectées telles quelles — choix de design voulu, aucune « harmonisation ».

**Existence gouvernée des icônes**

- **FR-006**: Les icônes du design system MUST exister sous une forme gouvernée et versionnée : la liste offerte au designer (le menu côté Figma) et la liste utilisable par le développeur en code MUST être une seule et même liste, garantie mécaniquement (vérification automatique, pas sur parole). Cette liste MUST prendre la forme d'un **registre unique** (clarifié 2026-07-23) : un seul document versionné listant les icônes garanties du jeu, dont le menu du designer et la liste côté code dérivent et contre lequel ils sont vérifiés ; élargir le jeu = évolution mineure, le réduire = majeure, selon les règles de versionnage du dépôt.
- **FR-007**: Toute divergence entre le menu du designer et la liste côté code MUST être détectée et listée en clair — jamais silencieuse.
- **FR-008**: Les icônes MUST naître dans Figma puis être extraites (Figma-first) — jamais dessinées ou ajoutées côté code d'abord — et le jeu MUST être sans dépendance à une bibliothèque tierce.
- **FR-009**: Les 268 instances d'icônes du fichier (boutons, header, champs de formulaire ×23, FAQ ×12) MUST continuer à s'afficher à l'identique ; cette itération gouverne l'**existence** des icônes (utilisables partout) mais ne contractualise que le Bouton.

**Bouton v1.3 — choix d'icône pilotable des deux côtés**

- **FR-010**: Les deux emplacements d'icône du Bouton MUST devenir pilotables des deux côtés : **quelle icône** (choisie dans le jeu gouverné) et **affichée ou non** — le designer via les réglages du composant dans Figma, le développeur via l'interface du composant généré.
- **FR-011**: Cette capacité MUST naître DANS Figma (les menus de choix d'icône existent déjà côté Figma) puis être extraite et garantie par le contrat — le contrat MUST garantir exactement les choix du menu Figma, ni plus ni moins.
- **FR-012**: N'importe quel bouton des maquettes MUST être reproductible en code en nommant son icône dans le jeu gouverné — sans aucun SVG bricolé à la main.
- **FR-013**: La montée de version du Bouton (v1.3) MUST suivre les règles de versionnage du dépôt — un ajout rétrocompatible (rien d'existant ne casse).

**L'unique mise à jour du master**

- **FR-014**: La mise à jour du master Figma du Bouton MUST être UNIQUE et finale : elle embarque en une seule opération tout ce qui manque au master — dont le libellé du Bouton devenant un réglage côté Figma (l'écart déclaré de la 001) et les réglages d'icônes — et clôt l'alignement complet contrat/code/Figma.
- **FR-015**: Une photographie d'état des 9 pages MUST être prise avant ET après la mise à jour ; la comparaison MUST être mesurée (jamais à l'œil).
- **FR-016**: Les personnalisations des maquettes (43 textes, 26 icônes choisies) MUST être intégralement restaurées ; toute personnalisation non restaurable automatiquement MUST être listée nommément et son traitement validé par l'owner.
- **FR-017**: Des points de restauration MUST être en place avant l'opération ; en cas d'échec en cours de route, le fichier MUST revenir intégralement à son état antérieur.

**Preuves finales**

- **FR-018**: La comparaison contrat/code/Figma MUST afficher ZÉRO écart à la clôture — le dernier écart déclaré de la 001 disparaît.
- **FR-019**: La suite de vérification MUST passer au complet — les 3 vérifications volontairement rouges de la 001 s'éteignent (102/102 au compte du 2026-07-24 ; le compte vivant affiché par la suite fait foi, et tout compte cité dans les documents MUST rester synchronisé).
- **FR-020**: Un exemple de bouton avec icônes MUST être visible dans le dashboard et dans Storybook.
- **FR-021**: La couverture visuelle des icônes MUST être rétablie : le jeu d'icônes est couvert par la comparaison visuelle du dépôt, dans la tolérance de l'instrument existant.

### Key Entities *(include if feature involves data)*

- **Jeu d'icônes gouverné (registre unique)** : la liste unique, versionnée et garantie des icônes du design system — UN document versionné dont le menu designer et la liste développeur dérivent (menu = liste, vérifié mécaniquement). 15 masters au compte du 2026-07-23, deux tailles voulues (20 et 32).
- **Icône (master)** : une icône du jeu — nom (l'identifiant que designer et développeur partagent), couleur branchée aux variables, règle d'échelle, description. Née dans Figma, extraite ensuite.
- **Bouton v1.3** : le composant Bouton finalisé — deux emplacements d'icône pilotables des deux côtés (quelle icône, affichée ou non) et libellé réglable côté Figma. Montée de version rétrocompatible depuis la v1.2.
- **Master Figma du Bouton** : l'objet de l'unique mise à jour finale — la source design du Bouton dans le fichier client.
- **Personnalisations des maquettes** : ce que les 9 pages ont réglé sur leurs instances du Bouton — 43 textes, 26 icônes choisies — à préserver intégralement.
- **Photographie d'état avant/après** : la preuve mesurée que les 9 pages sont visuellement identiques avant et après l'opération.
- **Points de restauration** : les états de reprise posés avant l'opération, permettant le retour intégral en cas d'échec.
- **Rapport d'audit étape 0 & propositions de changement** : le constat outillé de l'état de la source (masters + usage par position), les 4 items décidés, et toute proposition supplémentaire soumise à l'arbitrage de l'owner avant contractualisation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La comparaison contrat/code/Figma affiche ZÉRO écart — le dernier écart déclaré de la 001 (libellé non réglable côté Figma) a disparu.
- **SC-002**: La suite de vérification passe au complet — les 3 rouges volontaires éteints (102/102 au compte du 2026-07-24 ; le compte vivant fait foi).
- **SC-003**: Les 9 pages sont visuellement identiques avant/après la mise à jour du master — mesuré par photographie d'état, pas à l'œil ; tout écart résiduel est expliqué et explicitement accepté par l'owner, sinon l'opération est un échec.
- **SC-004**: Le designer choisit une icône dans son menu, le développeur a exactement le même choix — vérifié mécaniquement, pas sur parole.
- **SC-005**: Un bouton avec icônes est visible dans le dashboard et dans Storybook.
- **SC-006**: La source a été validée par l'owner AVANT toute contractualisation — étape 0 tracée : audit produit, 4 items appliqués, propositions supplémentaires tranchées.
- **SC-007**: Zéro dépendance d'icône à une bibliothèque tierce — les 22 usages du chevron externe pointent vers un master local.
- **SC-008**: Aucune personnalisation perdue ni altérée en silence — les 43 textes et 26 icônes choisies sont restaurés, ou nommés un par un avec traitement validé.

## Assumptions

- **Les comptes sont des mesures de session (2026-07-23)** : 15 masters, 268 instances, 22 usages du chevron, 43 textes, 26 icônes choisies, 9 pages. Ils sont re-mesurés en étape 0 (le fichier peut avoir bougé) ; les chiffres re-mesurés font foi et les comptes cités dans les documents sont resynchronisés.
- **Les menus de choix d'icône existent déjà côté Figma** (nés en 001 avec les emplacements et leurs interrupteurs d'affichage) ; cette itération ne les invente pas, elle les **garantit** par le contrat.
- **Réutilisation de l'outillage existant du dépôt, zéro outillage jetable** (règle owner) : audit, extraction, génération, différentiel trois voies, comparaison visuelle, photographie d'état et points de restauration passent par l'outillage en place ; toute capacité manquante est ajoutée à l'outillage commun du dépôt (au bon endroit, réutilisable), jamais en script à côté ni en contrat écrit à la main.
- **L'audit étape 0 est outillé** (analyse mécanique du fichier — lint de la source et scan des instances par position), pas à l'œil.
- **La photographie d'état est re-capturée après chaque modification du fichier** — jamais de comparaison contre une photo périmée.
- **Le master local remplaçant le chevron externe reproduit le dessin à l'identique** ; l'écart de rendu attendu est nul, et tout écart mesuré doit être explicitement accepté par l'owner.
- **La tolérance visuelle est celle de l'instrument existant du dépôt** ; aucun nouveau seuil n'est défini dans cette itération.
- **Mono-thème, mono-brand** : inchangé — hors périmètre de cette itération.

### Out of Scope (this iteration)

- Les autres composants (header, champs de formulaire, FAQ, sections des pages) — leurs icônes restent affichées à l'identique mais ne sont pas contractualisées.
- Toute re-mesure de l'expérience « génération gouvernée vs libre ».
- L'extension du jeu d'icônes (nouvelles icônes au-delà du nettoyage décidé).
- L'évolution vers le mécanisme de slot natif de l'outil de design — exclusion **confirmée** (clarifié 2026-07-23) : les emplacements du Bouton restent sur le mécanisme prouvé de la 001 (menu de remplacement + interrupteur d'affichage).

### Dependencies

- Accès à la source Figma Piqueray — fichier « Piqueray (Copy) » (`d9FYAUcqdcNtsuaMgLefvJ`), zone des icônes indiquée par l'owner (nœud `6-111`).
- Les acquis de la 001 (close) : Bouton v1.2 avec emplacements et interrupteurs d'affichage vivants dans Figma, fondation de tokens poussée, boucle contrat→code→Figma prouvée.
- L'outillage du dépôt existant, réutilisé en place : extraction, génération, différentiel trois voies, comparaison visuelle, dashboard, Storybook.
