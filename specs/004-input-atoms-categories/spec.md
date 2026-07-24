# Feature Specification: Atomes de saisie gouvernés par contrat + notion de catégorie (et 3 icônes sociales)

**Feature Branch**: `004-input-atoms-categories`  
**Created**: 2026-07-24  
**Status**: Draft  
**Input**: User description (brief complet livré en session du 2026-07-24) : « Rendre les 4 atomes de saisie livrés par le programme 003 (Input, Textarea, Select, Checkbox) disponibles comme composants gouvernés par contrat — mêmes garanties que le Button — et donner au système la notion de catégorie (atome / molécule / section) qui existe déjà côté Figma mais qu'aucune surface côté code ne reflète. Ajouter les icônes Facebook, Instagram et Étoile au jeu d'icônes gouverné. Le tout **en lecture seule sur le fichier Figma**, en coexistence avec le programme 003 qui y travaille encore. » (Le volet « comment » — champ de schéma, surfaces à modifier, montées de version, chaîne d'extraction — a été explicitement parqué par l'owner pour `/speckit.plan`.)

## Clarifications

### Session 2026-07-24

- Q: Si 003 modifie le master d'un atome APRÈS sa contractualisation par 004 (avant clôture), la comparaison trois voies de clôture montrerait un écart — quelle règle ? → A: Gel convenu + ré-extraction nommée : 003 ne touche plus aux masters des 4 atomes pendant 004 ; si une édition s'impose malgré tout, elle passe par les gates de 003 puis 004 ré-extrait l'atome concerné avant de clore (événement nommé). Parité finale mesurée sur le fichier vivant.
- Q: Dans quelle langue vit la catégorie côté code — valeur dans le contrat et libellé de groupe affiché ? → A: Tout anglais côté code : valeurs canoniques `atom` / `molecule` / `section` dans le contrat ; groupes affichés « Atoms / Molecules / Sections » sur Storybook, Contract Hub et catalog. Le miroir avec les pages Figma porte sur la structure (le groupement), pas sur la langue.
- Q: Si un défaut de master bloquait la contractualisation d'UN atome (cas hypothétique — aucun défaut connu), l'itération peut-elle clore à 3/4 avec écart nommé ? → A: Non — clôture bloquée à 4/4 : l'atome touché attend le fix passé par les gates de 003 puis est ré-extrait (chemin FR-004) ; les 3 autres atomes, la catégorie et les icônes avancent pendant ce temps. SC-001 reste 4/4, pas de clôture partielle.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Le développeur dispose des 4 atomes de saisie gouvernés par contrat (Priority: P1)

En tant que développeur consommateur de la bibliothèque, je veux importer et utiliser **Input, Textarea, Select et Checkbox** générés depuis leur contrat — exactement comme le Button — afin de construire les pages Piqueray avec le même niveau de preuve de fidélité, sans bricoler de composants à la main.

**Why this priority**: C'est la valeur centrale de l'itération. La Phase A du programme 003 a produit des masters Figma propres et validés, mais ils n'existent ni en contrat ni en code : la bibliothèque générée ne contient aujourd'hui que le Button. Tant que les 4 atomes ne sont pas contractualisés, aucune page Piqueray n'est constructible avec les garanties du système.

**Independent Test**: Un développeur importe les 4 atomes depuis la bibliothèque générée et les rend ; toutes les vérifications du dépôt passent sur ces composants comme sur le Button — génération déterministe (byte-identique deux fois de suite), comparaison trois voies à zéro écart, contrôle visuel dans la tolérance de l'instrument existant, et la suite d'évals au complet.

**Acceptance Scenarios**:

1. **Given** les masters propres d'Input, Textarea, Select et Checkbox déjà présents dans Figma (issus de 003), **When** chacun est extrait puis contractualisé, **Then** un contrat versionné existe pour chaque atome et génère son composant de code, exactement selon la chaîne déjà prouvée pour le Button.
2. **Given** les 4 contrats livrés, **When** le développeur importe et utilise les 4 atomes, **Then** ils s'utilisent avec le même niveau de preuve que le Button (aucun composant écrit ni corrigé à la main).
3. **Given** un master dont le nom d'affichage est en français (ex. « Case à cocher »), **When** il est contractualisé, **Then** le nommage suit le précédent établi — français côté Figma, anglais côté code (Bouton ↔ Button) — et le rapprochement master ↔ contrat se fait par identité stable (clé de composant), jamais par nom d'affichage.
4. **Given** un atome dont l'audit de source 003 n'est pas confirmé, **When** on tente de le contractualiser, **Then** l'opération n'a pas lieu tant que l'audit validé n'est pas en main (l'étape 0 « source propre » reste le préalable, ici satisfaite en réutilisant l'audit de 003, pas en le refaisant).

---

### User Story 2 - L'itération ne touche pas au fichier Figma (garde-fou lecture seule, coexistence avec 003) (Priority: P1)

En tant qu'owner du design system, et pour protéger le travail en cours du programme 003, je veux la **preuve que cette itération n'a apporté aucune modification au fichier Figma** — masters, pages, variables, rangement — afin que les deux programmes coexistent sans risque : 003 écrit dans Figma (et le protège par photographies de pages), 004 lit seulement.

**Why this priority**: C'est le risque maximal de l'itération, comme la préservation des maquettes l'était en 002. Le fichier Figma est vivant : 003 y construit encore molécules et sections. Une écriture accidentelle depuis 004 corromprait un travail en cours protégé. La garantie « rien n'a bougé de notre fait » est la condition de la coexistence.

**Independent Test**: L'historique de versions du fichier Figma est relevé au début et à la fin de l'itération ; aucune entrée n'est imputable à 004. Toute modification présente dans l'historique est soit attendue (émise par 003), soit un échec du garde-fou.

**Acceptance Scenarios**:

1. **Given** le fichier Figma vivant partagé avec 003, **When** l'itération 004 s'exécute (extraction, contractualisation, génération), **Then** l'historique de versions ne montre aucune modification issue de 004 — extraction et enregistrement seulement, zéro écriture.
2. **Given** l'extraction ou l'audit qui révélerait un défaut de master, **When** ce défaut est rencontré, **Then** il est signalé nommément et coordonné avec 003 — jamais corrigé ici, jamais contourné en modélisant autour d'une source défectueuse.
3. **Given** une correction de master qui s'avérerait un jour nécessaire, **When** elle est envisagée, **Then** elle passe d'abord par les gates de photographie de pages de 003 — donc hors du périmètre de cette itération.

---

### User Story 3 - Chaque composant porte sa catégorie, et les surfaces générées groupent par catégorie (Priority: P2)

En tant qu'owner du design system, je veux que chaque composant porte sa **catégorie** (atome / molécule / section) et que les surfaces générées — Storybook, Contract Hub, catalog — **groupent par catégorie**, afin de retrouver côté code la même organisation que les pages Figma (DS · Atomes / Molécules / Sections), au lieu du groupe unique « à plat » actuel.

**Why this priority**: Le fichier Figma est désormais rangé par catégorie ; côté code, tout est présenté à plat. C'est une incohérence d'organisation qui grandira avec chaque composant ajouté. La catégorie donne au code le miroir de la structure design. Valeur forte, mais non bloquante pour utiliser les atomes eux-mêmes.

**Independent Test**: On ouvre Storybook et le Contract Hub : les composants apparaissent groupés par catégorie (les 4 atomes + le Button sous « Atoms »), et il ne reste aucun groupe résiduel incohérent — aucun composant orphelin sous un groupe « à plat » par défaut.

**Acceptance Scenarios**:

1. **Given** le système doté de la notion de catégorie, **When** un composant déclare sa catégorie, **Then** les surfaces générées (Storybook, Contract Hub, catalog) le rangent sous cette catégorie.
2. **Given** le Button existant, **When** il reçoit la catégorie `atom`, **Then** sa catégorisation est une évolution rétrocompatible (rien d'existant ne casse) et se fait **sans aucune modification de son master Figma**.
3. **Given** un composant qui ne déclarerait pas de catégorie, **When** il est traité, **Then** il reste valide (le mécanisme est tolérant) ; mais dans cette itération, **tous** les composants existants (les 4 atomes + le Button) portent leur catégorie — l'usage est exhaustif, aucun groupe orphelin ne subsiste.
4. **Given** les surfaces groupées par catégorie, **When** on les compare à l'organisation des pages Figma, **Then** elles reflètent la même structure (les molécules et sections restant hors périmètre tant que 003 ne les a pas closes).

---

### User Story 4 - Les 3 icônes sociales entrent dans le jeu d'icônes gouverné (Priority: P3)

En tant qu'owner du design system, je veux ajouter **Facebook, Instagram et Étoile** au jeu d'icônes gouverné, afin qu'elles soient vérifiées registre ↔ code ↔ Figma exactement comme les 13 icônes déjà en place — et donc utilisables partout avec la même garantie.

**Why this priority**: Additif et à faible risque : le mécanisme du jeu gouverné et son axe de vérification existent déjà (002). Ces trois icônes sont des **icônes, pas des composants** (l'inventaire de référence les route déjà vers le jeu d'icônes). Valeur réelle mais moindre que les atomes et la catégorisation.

**Independent Test**: Le jeu d'icônes gouverné passe de 13 à 16 entrées ; l'axe de vérification des icônes du dépôt (celui qui couvre les 13) valide les 3 nouvelles sur les trois surfaces — registre, code, Figma — sans nouvel instrument.

**Acceptance Scenarios**:

1. **Given** les masters Facebook, Instagram et Étoile déjà présents dans Figma (créés par 003), **When** ils sont extraits et enregistrés au jeu gouverné, **Then** le registre compte 16 entrées et chacune est vérifiée registre ↔ code ↔ Figma comme les 13 existantes — sans aucune écriture dans Figma.
2. **Given** l'extraction des SVG des 3 icônes, **When** elle s'exécute, **Then** les tracés proviennent du fichier Figma réel uniquement — jamais repris de l'ancien jeu démo (dont l'artwork diffère sous des noms parfois identiques).
3. **Given** une divergence introduite entre le registre et l'une des trois surfaces, **When** la vérification s'exécute, **Then** la divergence est détectée et listée en clair — jamais silencieuse.

---

### Edge Cases

- **L'extraction révèle un défaut sur un master** (contrainte manquante, branchement douteux, structure inattendue) : signalé nommément et coordonné avec 003 — jamais corrigé ici, jamais modélisé autour (la règle « source propre avant contrat », en version lecture seule). Pas de clôture partielle : l'itération ne clôt qu'à 4/4 — l'atome touché attend le fix via les gates de 003 puis ré-extraction, les autres livrables avancent.
- **Un atome n'a pas d'audit de source 003 validé** : il n'est pas contractualisé tant que l'audit n'est pas confirmé — l'étape 0 reste le préalable obligatoire (ici réutilisée, pas refaite).
- **Une icône sociale n'existe pas (encore) comme master dans Figma** : refusé — Figma-first ; on ne dessine pas l'icône côté code, et on n'édite pas Figma dans cette itération (on coordonne avec 003).
- **Un nom d'affichage Figma diffère du nom de code** (Case à cocher ↔ Checkbox) : le rapprochement se fait par clé de composant, jamais par nom d'affichage — sinon échec silencieux (leçon « Button » vs « Bouton » de 002).
- **Un composant reste sans catégorie après l'itération** : détecté — l'usage étant exhaustif, aucun groupe orphelin résiduel ne doit subsister sur les surfaces générées.
- **Le fichier Figma a bougé entre la mesure et l'extraction** (003 travaille en parallèle) : les comptes sont reconfirmés au moment de l'extraction ; les chiffres re-mesurés font foi.
- **Une modification apparaît dans l'historique de versions Figma pendant l'itération** : si elle vient de 003, c'est attendu (coexistence) — sauf sur un master d'atome gelé (voir bullet suivant) ; si elle viendrait de 004, c'est un échec du garde-fou lecture seule à traiter comme tel.
- **003 doit modifier un master d'atome malgré le gel convenu** (les masters des 4 atomes sont gelés pendant 004) : l'édition passe par les gates de 003, puis 004 ré-extrait l'atome concerné avant la clôture — événement nommé, jamais silencieux ; la parité finale se mesure sur le fichier vivant.
- **Réutilisation par erreur de l'ancien jeu démo pour une icône** : refusé — SVG extraits du fichier réel uniquement.
- **Un cas d'éval quarantainé redevient activable** du fait de cette itération (ex. les cas exigeant « un second composant Piqueray » ; nota : le cas « checkbox + switch » reste, lui, en quarantaine — il exige aussi un Switch) : il est réactivé selon la règle hybride, le retrait/ajout de cas est nommé, et les compteurs cités sont re-synchronisés avec le compte vivant.

## Requirements *(mandatory)*

### Functional Requirements

**Garde-fou lecture seule & coexistence avec 003**

- **FR-001**: Cette itération MUST être strictement en lecture seule sur le fichier Figma — aucune modification de master, de page, de variable ou de rangement. L'historique de versions du fichier MUST ne montrer aucune modification issue de cette itération.
- **FR-002**: Tout défaut de master révélé par l'audit réutilisé ou par l'extraction MUST être signalé nommément et coordonné avec le programme 003 — jamais corrigé ici, jamais contourné en modélisant autour d'une source défectueuse. Un défaut bloquant n'autorise PAS de clôture partielle : l'itération ne clôt qu'avec les 4 atomes contractualisés — l'atome touché attend le fix passé par les gates de 003 puis est ré-extrait (chemin FR-004), pendant que les autres livrables avancent.
- **FR-003**: Toute édition de master qui s'avérerait nécessaire MUST passer d'abord par les gates de photographie de pages de 003 — donc hors du périmètre de cette itération.
- **FR-004**: Les masters des 4 atomes de saisie (livrables clos de la Phase A de 003) MUST être gelés par accord de coordination pendant cette itération — 003 ne les modifie plus. Si une édition s'impose malgré le gel, elle passe par les gates de 003, puis 004 MUST ré-extraire l'atome concerné avant la clôture — événement nommé, jamais silencieux. La comparaison trois voies de clôture se mesure sur le fichier vivant.

**Étape 0 — source déjà propre, audits de 003 réutilisés**

- **FR-005**: L'étape 0 (« source propre avant contrat ») MUST être satisfaite en RÉUTILISANT les audits de source produits par 003 (structure + usage repéré par position), jamais en les refaisant — les masters sont nés propres et validés par l'owner via 003.
- **FR-006**: La contractualisation d'un atome MUST être précédée de la confirmation que son audit de source 003 existe et est validé ; à défaut, l'atome n'est pas contractualisé.

**Les 4 atomes de saisie gouvernés par contrat**

- **FR-007**: Input, Textarea, Select et Checkbox MUST devenir des composants gouvernés par contrat — un contrat versionné par atome, générant son composant de code, exactement selon la chaîne déjà prouvée pour le Button.
- **FR-008**: Chaque atome MUST être extrait de son master Figma (Figma-first) puis garanti par son contrat — le contrat garantit exactement ce que le master expose, ni plus ni moins.
- **FR-009**: Le développeur MUST pouvoir importer et utiliser les 4 atomes depuis la bibliothèque générée avec le même niveau de preuve que le Button (génération déterministe, comparaison trois voies, contrôle visuel).
- **FR-010**: Le nommage MUST suivre le précédent : français côté Figma, anglais côté code (Bouton ↔ Button).
- **FR-011**: Le rapprochement master ↔ contrat MUST se faire par identité stable (clé de composant), jamais par nom d'affichage.

**La notion de catégorie & les surfaces groupées**

- **FR-012**: Le système MUST porter la notion de catégorie sur chaque composant, avec pour valeurs canoniques **`atom` / `molecule` / `section`** (anglais côté code, comme le reste du contrat), reflétant l'organisation déjà présente côté Figma (pages DS · Atomes / Molécules / Sections).
- **FR-013**: La catégorie MUST être un attribut tolérant : un composant sans catégorie reste valide. Mais dans cette itération, TOUS les composants existants (les 4 atomes + le Button) MUST porter leur catégorie — l'usage est exhaustif.
- **FR-014**: Les surfaces générées (Storybook, Contract Hub, catalog) MUST grouper les composants par catégorie, avec des libellés de groupe en anglais — « Atoms / Molecules / Sections » — le miroir des pages Figma portant sur la structure du groupement, pas sur la langue ; sans groupe résiduel incohérent (aucun composant orphelin sous un groupe « à plat » par défaut).
- **FR-015**: Le Button existant MUST recevoir la catégorie `atom` (les molécules de l'inventaire en dépendent), **sans aucune modification de son master Figma** ; sa catégorisation MUST être une évolution rétrocompatible.

**Les 3 icônes sociales dans le jeu gouverné**

- **FR-016**: Facebook, Instagram et Étoile MUST entrer dans le jeu d'icônes gouverné en tant qu'ICÔNES (pas composants) — l'inventaire de référence les route déjà vers le jeu d'icônes.
- **FR-017**: Le jeu d'icônes gouverné MUST passer de 13 à 16 entrées, chacune vérifiée registre ↔ code ↔ Figma comme les 13 existantes — l'axe de vérification des icônes du dépôt couvre les 3 nouvelles, sans nouvel instrument.
- **FR-018**: Les SVG des 3 icônes MUST être extraits du fichier Figma réel uniquement — jamais repris de l'ancien jeu démo (artwork différent sous des noms parfois identiques).
- **FR-019**: L'ajout des 3 icônes MUST se faire sans édition Figma (les masters existent déjà, créés par 003) — extraction et enregistrement seulement.

**Preuves finales (mêmes gates que le Button)**

- **FR-020**: Toutes les vérifications existantes du dépôt MUST rester vertes : génération déterministe (byte-identique deux fois de suite), comparaison trois voies à zéro écart, contrôle visuel dans la tolérance de l'instrument existant, et la suite d'évals au complet.
- **FR-021**: Tout compteur cité (nombre d'évals, d'icônes 13 → 16, de composants) MUST rester synchronisé avec le compte vivant affiché par les outils — le compte vivant fait foi.
- **FR-022**: Les cas d'évals quarantainés qui redeviennent activables du fait de cette itération MUST être réactivés selon la règle hybride ; tout retrait ou ajout de cas MUST être nommé.

### Key Entities *(include if feature involves data)*

- **Atome de saisie (contrat)** : Input / Textarea / Select / Checkbox — chacun un composant gouverné par contrat, extrait de son master Figma, générant son composant de code. Nom français côté Figma, anglais côté code.
- **Catégorie** : l'attribut porté par chaque composant — valeurs canoniques `atom` / `molecule` / `section` (anglais côté code), groupes affichés « Atoms / Molecules / Sections » sur les surfaces — miroir structurel des pages DS de Figma. Tolérant (optionnel) mais renseigné exhaustivement dans cette itération.
- **Jeu d'icônes gouverné (registre)** : la liste versionnée et garantie des icônes du design system — 13 → 16 avec Facebook, Instagram, Étoile — vérifiée registre ↔ code ↔ Figma.
- **Icône sociale (master)** : Facebook / Instagram / Étoile — masters existant déjà dans Figma (créés par 003), extraits en lecture seule puis enregistrés.
- **Button (catégorisé)** : le composant Button existant recevant la catégorie « atome » sans édition de master — évolution rétrocompatible.
- **Audit de source 003 (réutilisé)** : le constat outillé (structure + usage repéré par position) produit et validé par 003 pour chaque master, réutilisé ici et jamais refait.
- **Surfaces générées (Storybook, Contract Hub, catalog)** : les vues code de la bibliothèque, désormais groupées par catégorie.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un développeur importe et utilise les 4 atomes (Input, Textarea, Select, Checkbox) avec le même niveau de preuve que le Button — toutes les vérifications du dépôt passent (génération déterministe, comparaison trois voies, contrôle visuel, suite d'évals complète).
- **SC-002**: Storybook et le Contract Hub présentent les composants groupés par catégorie, sans groupe résiduel incohérent.
- **SC-003**: Le jeu d'icônes gouverné compte 16 entrées (contre 13), chacune vérifiée sur les trois surfaces (registre, code, Figma).
- **SC-004**: L'historique de versions du fichier Figma ne montre AUCUNE modification issue de cette itération — preuve de la lecture seule et de la coexistence avec 003.
- **SC-005**: Le Button porte la catégorie `atom` sans aucune modification de son master ; aucun composant existant ne reste sans catégorie.
- **SC-006**: Chaque atome contractualisé s'appuie sur un audit de source 003 existant et validé — aucun atome contractualisé sur une source non validée.
- **SC-007**: Tout défaut de master éventuellement découvert est signalé et coordonné avec 003 — zéro correction Figma faite dans cette itération.
- **SC-008**: Les compteurs cités (icônes, évals, composants) sont synchronisés avec le compte vivant des outils.

## Assumptions

- **Les masters existent déjà, propres et validés** : les 4 atomes de saisie et les 3 icônes sociales ont été construits et validés par l'owner via la Phase A de 003 ; cette itération ne les crée pas, elle les extrait.
- **Réutilisation de l'outillage existant du dépôt, zéro outillage jetable** (règle owner) : audit, extraction, génération, différentiel trois voies, comparaison visuelle passent par l'outillage en place ; toute capacité manquante est ajoutée au bon endroit dans l'outillage commun, réutilisable — jamais en script à côté, jamais en contrat écrit à la main.
- **La chaîne prouvée en 002 est réutilisée** : extraction depuis le fichier réel → proposition de contrat → génération → comparaison trois voies → contrôle visuel ; rapprochement par clé de composant, jamais par nom.
- **Règle standing d'archive** : pour chaque atome, l'archive `demo-51` est consultée comme inspiration de structure (voler ou rejeter avec motif nommé, au moment du `/plan`), le nommage restant français côté Figma.
- **Les 3 icônes sont couvertes par l'axe de vérification des icônes existant** (celui qui couvre les 13) — aucun nouvel instrument, aucun nouveau seuil.
- **La tolérance visuelle est celle de l'instrument existant du dépôt** ; aucun nouveau seuil n'est défini dans cette itération.
- **Mono-thème, mono-brand** : inchangé — hors périmètre.
- **Cas d'évals quarantainés** : ceux qui redeviennent activables du fait de cette itération (ex. « second composant Piqueray ») sont réactivés selon la règle hybride ; tout retrait/ajout de cas est nommé et les compteurs re-synchronisés.
- **Coexistence en lecture seule avec 003** : pendant que 003 écrit dans Figma, 004 lit seulement ; les mesures (nombre d'icônes, d'instances) peuvent avoir bougé et sont reconfirmées à l'extraction. Les masters des 4 atomes, eux, sont gelés par accord de coordination pendant l'itération (voir FR-004).

### Out of Scope (this iteration)

- **Les molécules et les sections** — on attend leur clôture par le programme 003.
- **Toute édition du fichier Figma** : masters, pages, variables, **et le rangement de la page « Assets »** (voir la note de suivi ci-dessous).
- **La vérification automatique « catégorie du contrat ↔ page Figma du master »** — bonus ultérieur nommé, non implémenté cette itération.
- **L'extension du jeu d'icônes** au-delà des 3 entrées décidées.
- **Multi-thème / multi-brand.**

### Suivi / prochaines itérations (à ne pas oublier)

- **Rangement de la page « Assets » (Figma)** : des éléments sont aujourd'hui posés sur la page « Assets » et devront être **déplacés vers la page DS où ils appartiennent** (Atomes / Molécules / Sections / Tokens). Ce rangement est **hors périmètre ici** (itération en lecture seule) et devra se faire dans une itération autorisée à éditer Figma — donc coordonnée avec / après 003, sous ses gates de photographie de pages. **Caveat obligatoire au moment de ranger** : vérifier que le déplacement **n'impacte pas le code généré** (l'extraction se fait par clé de composant et non par page — à confirmer explicitement avant de déplacer quoi que ce soit). Noté ici pour ne pas l'oublier.

### Dependencies

- **Les acquis de 003 (Phase A)** : les masters propres et validés d'Input, Textarea, Select, Checkbox + les icônes Facebook, Instagram, Étoile, avec leurs audits de source.
- **Les acquis de 002 (close)** : le jeu d'icônes gouverné (registre + axe de vérification des icônes) à 13 entrées, la chaîne d'extraction/génération/parité prouvée, le Button déjà finalisé.
- **L'outillage du dépôt réutilisé en place** : extraction, génération, différentiel trois voies, comparaison visuelle, Storybook, Contract Hub, catalog.
- **Accès en lecture seule à la source Figma Piqueray.**
- **La coordination avec le programme 003** — qui détient les droits d'édition Figma et protège le fichier par photographies de pages ; inclut le gel convenu des masters des 4 atomes pendant l'itération.
