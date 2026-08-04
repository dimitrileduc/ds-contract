# Feature Specification: Mesure juste et triage complet

**Feature Branch**: `014-mesure-juste-triage`  
**Created**: 2026-07-31  
**Status**: Draft  
**Input**: User description: "Rendre la mesure de fidélité juste et complète avant le chantier géométrie — plus aucun chiffre publié qui ne soit pas une mesure, plus aucune ligne sans cause attribuée. Trois trous connus : le défaut d'instrument DW-006 (reassurances publié 39,78 % contre le SET trois-variantes au lieu du node du cas, mesure de contrôle ~3,30 %) ; quatre lignes UNTRIAGED du rapport de parité visuelle (member-picture ×2, section-header Avec CTA, google-reviews) ; select jamais mesuré (33/34). Figma en lecture seule ; aucune correction de contrat/token (015) ni mutation Figma (016) ; fixture rouge d'abord ; gate machine fail-closed ; un triage n'est pas une réparation ; avant/après attribuable ; critères 011/013 non assouplis."

## Clarifications

### Session 2026-07-31

- Q: L'exclusion de select reposait sur une prémisse fausse, non testable et non publiée. Jusqu'où 014 doit-il remonter cette classe de décisions ? → A: Toute cause affirmée qui retire ou requalifie une mesure est re-testée dans cette fonctionnalité et ne survit que si un reçu reproductible la soutient — l'exclusion de select, chaque règle de triage existante (rendu/rastérisation, frontière image, défaut d'instrument, défaut moteur) et le blocage des trois organismes sans cas. Re-tester une prémisse reste une mesure : aucun contrat, token ni source Figma n'est touché.
- Q: Le vocabulaire fermé de la spec (5 valeurs) ne correspond pas à celui du code, et n'a pas de valeur pour les défauts de source Figma que la spec prévoit pourtant de consigner. Quelle forme lui donner ? → A: Six valeurs, vocabulaire publié et énumération de l'instrument alignés 1:1 — géométrie du contrat (ajoutée), frontière image, rendu/rastérisation, défaut moteur, défaut d'instrument, défaut de source Figma (la valeur déjà déclarée côté instrument et jamais employée). Le comptage par cause devient directement lisible comme entrée de 015 (géométrie) et de 016 (source).
- Q: Le node du set alimente le PNG, la largeur de rendu, le cadre d'alignement, la provenance des reçus et le relevé des valeurs épinglées. Jusqu'où va la correction DW-006 ? → A: Tout ce qui dérive de la référence bascule sur le node du cas — capture, largeur de mise en page du côté généré, cadre d'alignement et de recadrage, provenance citée dans les reçus — et les valeurs épinglées des faits sont re-relevées sur ce même node. Les comptes de faits de reassurances peuvent donc varier, ce que le registre avant/après attribue à la correction d'instrument.
- Q: Aucun reçu n'enregistre le navigateur de mesure, et sa révision change silencieusement. Sur quoi se fonde l'état « avant » du registre ? → A: L'« avant » est une re-mesure de l'état initial faite dans la fenêtre de la fonctionnalité, avec le même navigateur que l'« après » et sa révision enregistrée dans chaque reçu. Un écart entre cette re-mesure et les chiffres déjà commités est publié et attribué avant tout autre travail.
- Q: Sur quelle population porte le classement complet par cause, sachant que le triage s'arrête à 3 % et que le registre DW a sa propre taxonomie ? → A: Toute ligne mesurée des deux instruments — le seuil de triage à 3 % tombe, chaque ligne divergente du rapport de parité porte une cause — et les entrées du registre des travaux reportés sont re-classées dans le même vocabulaire à six valeurs. Un comptage unique, une seule taxonomie, lisible directement par 015 et par 016.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Chaque chiffre publié est une mesure (Priority: P1)

En tant qu'owner du design system, je veux que la référence visuelle de chaque cas audité soit le node du cas — la variante effectivement rendue — jamais un ensemble plus large, afin que le chiffre publié de reassurances (et de tout futur sujet dont le set diffère du cas) soit une mesure de fidélité et non un artefact d'instrument.

**Why this priority**: Le dossier reassurances publie aujourd'hui 39,78 % — un chiffre qu'aucun réviseur ne peut relier à la fidélité du composant, puisque la comparaison oppose une variante rendue (1550×731) à trois variantes photographiées empilées (1552×2451). Un instrument qui ment est pire que pas d'instrument : tout le chantier 015 se dimensionne sur ces chiffres.

**Independent Test**: Un réviseur ouvre le dossier reassurances re-rendu, vérifie que la référence photographiée est le node du cas, que le chiffre publié en découle, et que l'ancien chiffre reste consultable avec sa cause (« défaut d'instrument ») nommée.

**Acceptance Scenarios**:

1. **Given** un sujet dont le node de cas diffère du set qui le contient, **When** son audit s'exécute, **Then** la capture, la largeur imposée au côté généré, le cadre d'alignement, la provenance des reçus et les valeurs de faits proviennent toutes du node du cas, et le dossier publie le chiffre mesuré contre cette référence.
2. **Given** l'état antérieur du défaut (référence = set), **When** la vérification automatique de cette classe d'erreur s'exécute sur cet état, **Then** elle échoue de façon reproductible — la fixture est rouge AVANT la correction et reste en place après.
3. **Given** le dossier reassurances re-rendu, **When** un réviseur le consulte, **Then** l'ancien chiffre (39,78 %) et le nouveau figurent côte à côte et l'écart est attribué à la correction d'instrument, jamais présenté comme une amélioration de fidélité.
4. **Given** un sujet dont le set et le node du cas coïncident déjà, **When** son audit se ré-exécute après la correction, **Then** son chiffre publié est inchangé.

---

### User Story 2 - Zéro ligne sans cause (Priority: P1)

En tant qu'owner, je veux que chacune des quatre lignes UNTRIAGED du rapport de parité visuelle — member-picture Etat=Defaut (64,48 %), member-picture Etat=Survol (58,33 %), section-header Disposition=Avec CTA (8,78 %, largeur 2174 vs 3093 px), google-reviews (3,32 %) — reçoive une cause localisée et prouvée, afin que le périmètre du chantier géométrie (015) soit dimensionné sur des faits et non sur des présomptions.

**Why this priority**: Deux de ces lignes comptent parmi les plus gros écarts mesurés. Écrire 015 avec ces causes inconnues reproduirait l'erreur que la campagne 013 existe pour refuser : une ligne de base partiellement fausse.

**Independent Test**: Pour chaque ligne anciennement UNTRIAGED, un réviseur retrouve dans le rapport la cause attribuée, la preuve qui la soutient (mesure, référence, justification) et vérifie qu'aucune correction n'a été appliquée au passage.

**Acceptance Scenarios**:

1. **Given** une ligne UNTRIAGED, **When** son triage est terminé, **Then** elle porte exactement une cause du vocabulaire fermé à six valeurs — géométrie du contrat, frontière image (limite A5), rendu/rastérisation, défaut moteur, défaut d'instrument, défaut de source Figma — avec une preuve inspectable.
2. **Given** une ligne triée « géométrie », « frontière image » ou « défaut de source Figma », **When** le rapport est publié, **Then** la ligne reste divergente : la cause est nommée, jamais corrigée dans cette fonctionnalité.
3. **Given** une ligne qui ne rentre dans aucune cause du vocabulaire, **When** la clôture est tentée, **Then** elle reste UNTRIAGED et la clôture est refusée — il n'existe pas de catégorie fourre-tout.

---

### User Story 3 - Aucun composant sans chiffre (Priority: P2)

En tant qu'owner, je veux que select — le seul des 34 composants générés sans mesure, écarté par une exclusion nommée dont la prémisse ne tient plus — rejoigne la mesure de parité visuelle avec les mêmes critères que les 33 autres, afin qu'aucune surface générée ne reste sans chiffre opposable.

**Why this priority**: Un composant absent de la mesure est exactement la « absence de donnée assimilée à une conformité » que les conventions d'honnêteté du dépôt interdisent — mais il ne bloque pas la correction d'instrument ni le triage, d'où P2. L'exclusion invoquait un rendu défaillant du contrôle natif dans le navigateur de mesure ; re-testée, la prémisse est fausse, et elle n'était adossée à aucune vérification ni publiée dans la documentation.

**Independent Test**: La ligne select apparaît dans le rapport de parité avec un chiffre mesuré, ses régions et sa cause si elle diverge, produite par les mêmes critères (régions déclarées, seuils, preuve probante) que les autres lignes ; l'exclusion qui l'écartait a disparu du harnais avec le reçu de son infirmation.

**Acceptance Scenarios**:

1. **Given** select généré et son master Figma, **When** la mesure s'exécute, **Then** le rapport porte une ligne select avec un chiffre mesuré selon les critères existants, sans aucun critère assoupli.
2. **Given** l'exclusion nommée qui écartait select, **When** sa prémisse est re-testée, **Then** le reçu de l'infirmation est publié et l'exclusion est retirée — une limite sans preuve ne survit pas à son re-test.
3. **Given** un empêchement de mesure établi par re-test (capture invalide, cas non probant), **When** la ligne est publiée, **Then** elle est déclarée non probante avec sa cause et son reçu — jamais absente en silence, jamais sur une prémisse non vérifiée.

---

### User Story 4 - Toute évolution de chiffre est attribuable (Priority: P1)

En tant qu'owner, je veux les résultats initiaux conservés à côté des résultats corrigés, afin que toute variation de chiffre soit attribuable à sa cause exacte et qu'aucune amélioration ne puisse passer pour un progrès de fidélité qu'elle n'est pas.

**Why this priority**: La valeur de la campagne 013 est son opposabilité. Un chiffre qui change sans cause tracée détruit la confiance dans tous les autres.

**Independent Test**: Un réviseur compare l'état avant/après de chaque ligne dont le chiffre a changé et trouve la cause du changement ; il vérifie qu'aucune ligne n'a changé sans cause.

**Acceptance Scenarios**:

1. **Given** la clôture de la fonctionnalité, **When** les chiffres avant/après sont comparés, **Then** seul reassurances a changé — chiffre pixel comme comptes de faits — et sa cause (« correction d'instrument DW-006 ») est nommée.
2. **Given** une amélioration de chiffre constatée ailleurs que reassurances, **When** elle est détectée, **Then** la publication est suspendue jusqu'à ce que sa cause soit établie et nommée — aucune amélioration n'est attendue ailleurs.
3. **Given** un chiffre cité par la synthèse de campagne 013, **When** il change, **Then** la synthèse est re-rendue depuis son autorité — une synthèse qui publie un chiffre qu'aucun dossier ne porte est refusée.

---

### User Story 5 - Aucune cause sans preuve re-testée (Priority: P1)

En tant qu'owner, je veux que chaque décision qui retire ou requalifie une mesure — l'exclusion d'un sujet, la cause attribuée à une ligne divergente, le blocage d'un organisme — soit re-testée et ne survive que si un reçu reproductible la soutient, afin qu'aucun chiffre publié ne descende d'une affirmation que personne n'a vérifiée.

**Why this priority**: L'exclusion de select tenait sur une prémisse fausse, non testée et invisible hors d'un commentaire de code. Rien ne distingue a priori cette décision des autres causes affirmées de la même façon — et le dimensionnement du chantier géométrie (015) s'appuie précisément sur l'une d'elles, le plancher de rendu. Une cause héritée sans preuve est le même défaut que le chiffre non mesuré que la fonctionnalité existe pour supprimer.

**Independent Test**: Un réviseur prend n'importe quelle cause publiée, retrouve son reçu daté, le rejoue et obtient le même verdict ; il vérifie qu'aucune cause ne subsiste sur la seule foi d'une décision antérieure.

**Acceptance Scenarios**:

1. **Given** une cause affirmée qui retire ou requalifie une mesure, **When** la clôture est tentée, **Then** elle est refusée tant que cette cause ne porte pas un reçu reproductible et daté.
2. **Given** une cause dont le re-test infirme la prémisse, **When** le rapport est publié, **Then** la ligne est re-classée sur la cause que le re-test établit, l'ancienne attribution reste consultable avec son infirmation, et aucune correction de contrat, de token ou de source n'est appliquée.
3. **Given** un blocage d'organisme dont le re-test montre qu'il n'est pas fondé, **When** le constat est publié, **Then** il est consigné comme entrée du chantier canvas (016) — le constat est nommé ici, le déblocage n'est pas fait ici.
4. **Given** une cause dont le re-test confirme la prémisse, **When** le rapport est publié, **Then** la cause est inchangée et porte désormais son reçu — une confirmation se prouve autant qu'une infirmation.

### Edge Cases

- Le set d'un sujet coïncide déjà avec le node de son cas (les huit autres organismes ayant un cas capturé) : la correction d'instrument ne change ni leur chiffre ni leurs comptes de faits, et cette invariance est vérifiée, pas supposée.
- Une ligne triée ne correspond à aucune cause du vocabulaire fermé : elle reste UNTRIAGED et le contrôle de clôture refuse — le vocabulaire s'étend par décision explicite, jamais par catégorie « divers ».
- La mesure de select se révèle impossible (master absent, capture non probante) : la ligne est publiée non probante avec sa cause **et le reçu qui l'établit** ; l'absence silencieuse et l'empêchement affirmé sans preuve sont les deux issues interdites.
- Le re-test d'une cause affirmée l'infirme : la ligne est re-classée sur ce que le re-test établit, l'ancienne attribution reste consultable avec son infirmation, et la ligne reste divergente — infirmer une cause n'autorise aucune correction.
- Le re-test montre qu'un des trois organismes bloqués n'aurait pas dû l'être : le constat est publié et consigné comme entrée de 016 ; l'organisme reste bloqué dans cette fonctionnalité, puisque le débloquer demanderait une réparation.
- Le re-test d'une cause est lui-même impraticable dans la fenêtre de la fonctionnalité : la cause est publiée comme non re-testée, nommément, et bloque la clôture — une cause héritée ne passe jamais pour une cause vérifiée.
- La re-mesure de l'état initial ne retrouve pas les chiffres déjà publiés dans le dépôt : l'écart est publié et attribué (révision de navigateur, police, non-déterminisme) avant tout autre travail, et c'est cette re-mesure — pas les chiffres commités — qui sert d'« avant ».
- Le re-rendu de reassurances fait diverger un chiffre cité ailleurs (synthèse 013, registre DW) : chaque document citant ce chiffre est re-rendu depuis son autorité.
- La mesure corrigée de reassurances s'écarte sensiblement de la valeur de contrôle consignée (~3,30 %) : le chiffre publié est celui mesuré, et l'écart avec la valeur de contrôle est nommé — la valeur de contrôle n'est jamais recopiée comme résultat.
- Un composant mesuré des deux côtés (parité visuelle et dossier 013) présente deux chiffres : chacun cite sa référence et son cas ; aucun des deux n'est supprimé pour « simplifier ».

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La référence d'un cas audité MUST être le node du cas — la variante effectivement rendue — jamais le set qui le contient ni aucun ensemble plus large. TOUT ce qui dérive de cette référence MUST provenir de ce même node : la capture photographiée, la largeur de mise en page imposée au côté généré, le cadre d'alignement et de recadrage, la provenance citée dans les reçus, et les valeurs de faits relevées côté Figma.
- **FR-002**: La classe d'erreur « une dérivée de la référence provient d'un node autre que celui du cas » MUST être détectée par une vérification automatique reproductible, établie AVANT la correction (elle échoue sur l'état défectueux) et conservée après (elle empêche la réintroduction) ; elle MUST couvrir chaque dérivée nommée en FR-001, pas seulement la capture.
- **FR-003**: Le dossier reassurances MUST être re-rendu depuis la référence correcte, valeurs de faits re-relevées sur le node du cas comprises ; son chiffre antérieur (39,78 %) et ses comptes de faits antérieurs MUST rester consultables à côté des valeurs corrigées, l'écart attribué à la correction d'instrument.
- **FR-004**: Chaque ligne UNTRIAGED du rapport de parité visuelle MUST recevoir exactement une cause d'un vocabulaire fermé à six valeurs — géométrie du contrat, frontière image (limite A5), rendu/rastérisation, défaut moteur, défaut d'instrument, défaut de source Figma — accompagnée d'une preuve inspectable (mesure, référence, justification). Le vocabulaire publié et l'énumération de causes de l'instrument MUST se correspondre exactement, valeur pour valeur : une cause publiable que l'instrument ne connaît pas, ou une classe de l'instrument qui n'est pas publiable, est un état refusé.
- **FR-005**: Un triage MUST NOT modifier un contrat, un token, une sortie générée ou la source Figma ; une ligne triée reste divergente si elle l'était — la cause est nommée, jamais corrigée ici.
- **FR-006**: select MUST rejoindre la mesure de parité visuelle avec les critères existants (régions déclarées, seuils, preuve probante), sans aucun assouplissement ; l'exclusion nommée qui l'écartait MUST être retirée avec le reçu qui infirme sa prémisse ; un empêchement de mesure MUST produire une ligne non probante causée et prouvée, jamais une absence.
- **FR-007**: La clôture MUST être gardée par un contrôle automatique fail-closed qui refuse (code de sortie non nul) tant qu'une ligne mesurée reste UNTRIAGED, qu'un composant généré n'a pas de ligne de mesure, qu'un chiffre publié repose sur une référence qui n'est pas le node de son cas, ou qu'une cause publiée ne porte pas de reçu re-testé.
- **FR-008**: Figma MUST rester consulté en lecture seule pendant toute la fonctionnalité ; aucune mutation, aucun nettoyage de source, aucune régénération de canvas.
- **FR-009**: Les résultats initiaux MUST être conservés à côté des résultats finaux ; toute ligne dont le chiffre change MUST nommer la cause du changement ; aucune amélioration n'est attendue hors reassurances. L'état « avant » MUST être une re-mesure de l'état initial exécutée dans la fenêtre de la fonctionnalité, sur le même navigateur que l'état « après » ; un écart entre cette re-mesure et les chiffres déjà publiés dans le dépôt MUST être publié et attribué avant tout autre travail.
- **FR-010**: Tout document qui cite un chiffre modifié — la synthèse de campagne 013 en premier — MUST être re-rendu depuis son autorité ; un document publiant un chiffre qu'aucun dossier ne porte est un état refusé.
- **FR-011**: La sortie de la fonctionnalité MUST inclure le classement complet des écarts mesurés par cause (le compte par catégorie, sur les six valeurs), publié comme entrée dimensionnante du chantier géométrie (015) et, pour la part « défaut de source Figma », du chantier canvas (016). La population MUST être toute ligne mesurée des deux instruments : aucun seuil ne dispense une ligne divergente de porter une cause.
- **FR-012**: Toute décision qui retire ou requalifie une mesure — exclusion d'un sujet, cause attribuée à une ligne divergente, blocage d'un organisme, déclaration de non-probant — MUST être re-testée dans cette fonctionnalité et MUST porter un reçu reproductible et daté ; une décision qui ne survit pas à son re-test MUST être retirée, une décision non re-testable MUST être publiée comme telle et bloque la clôture.
- **FR-013**: Un re-test MUST NOT réparer : une cause infirmée fait re-classer la ligne, jamais corriger le contrat, le token, la sortie générée ou la source Figma ; l'attribution antérieure MUST rester consultable à côté de son infirmation, et un blocage jugé infondé MUST être consigné comme entrée de 016 sans être levé ici.
- **FR-014**: Chaque reçu de mesure MUST enregistrer la révision du navigateur qui l'a produit ; une cause attribuée au rendu ou à la rastérisation MUST nommer cette révision — une cause qui met le navigateur en accusation sans dire lequel n'est pas un reçu.
- **FR-015**: Le seuil de triage à 3 % MUST cesser de conditionner l'attribution d'une cause : toute ligne divergente du rapport de parité visuelle en porte une, quelle que soit son amplitude. Ce seuil ne conditionne QUE l'obligation de causer une ligne — les seuils de réussite/échec, les régions déclarées et les critères de preuve restent intacts. Les entrées du registre des travaux reportés de 013 MUST être re-classées dans le vocabulaire commun à six valeurs — une seule taxonomie pour l'ensemble du classement publié.

### Key Entities

- **Ligne de mesure**: Le chiffre publié d'un composant/variante — sa référence, son cas, ses régions, son verdict et sa cause si elle diverge.
- **Cause de divergence**: Une valeur du vocabulaire fermé à six valeurs (géométrie du contrat, frontière image, rendu/rastérisation, défaut moteur, défaut d'instrument, défaut de source Figma) portée par une ligne avec sa preuve — le même vocabulaire, valeur pour valeur, côté rapport publié et côté instrument.
- **Référence de cas**: Le node Figma dont dérive toute la comparaison — capture, largeur imposée au côté généré, cadre d'alignement, provenance des reçus, valeurs de faits relevées. Par exigence, le node du cas rendu, jamais son set.
- **Registre avant/après**: La conservation côte à côte des chiffres initiaux et finaux, avec la cause de chaque variation. L'état initial y est une re-mesure datée, produite sur le même navigateur que l'état final et portant sa révision.
- **Reçu de cause**: La preuve reproductible et datée qui soutient une cause publiée, une exclusion ou un blocage — rejouable par un réviseur, et sans laquelle la cause ne survit pas à la clôture.
- **Contrôle de clôture**: La vérification fail-closed qui conditionne la fin de la fonctionnalité (zéro UNTRIAGED, 34/34 mesurés, références conformes, zéro cause sans reçu re-testé).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 34 composants générés sur 34 possèdent une ligne de mesure publiée (33 aujourd'hui) ; 0 absence silencieuse.
- **SC-002**: 0 ligne UNTRIAGED dans le rapport de parité visuelle (4 aujourd'hui, comptées au-dessus du seuil de 3 %) ; 100 % des lignes divergentes portent une cause du vocabulaire fermé à six valeurs avec preuve, sans exemption de seuil — sur **toutes les lignes du rapport de parité (compte vif publié par le contrôle de clôture, jamais figé ici)** et sur les dossiers d'organismes, registre des travaux reportés re-classé dans le même vocabulaire.
- **SC-003**: 100 % des chiffres publiés sont mesurés contre le node de leur cas, dérivées comprises (capture, largeur imposée, cadre d'alignement, provenance, valeurs de faits) ; le contrôle automatique de cette propriété échoue sur l'état antérieur (reassurances contre son set) et passe sur l'état final.
- **SC-004**: Le chiffre publié de reassurances reflète la mesure sur la référence correcte, l'ancien chiffre reste consultable, et l'écart est attribué à l'instrument — 0 amélioration présentée comme un progrès de fidélité.
- **SC-005**: 0 contrat modifié, 0 token modifié, 0 sortie générée retouchée, 0 mutation Figma attribuables à cette fonctionnalité.
- **SC-006**: Hors reassurances, 0 chiffre publié ne varie entre l'état initial et l'état final — chiffres pixel comme comptes de faits ; toute variation constatée a bloqué la clôture jusqu'à attribution de sa cause.
- **SC-007**: Un réviseur retrouve pour n'importe quelle ligne du rapport sa cause et sa preuve en moins de 5 minutes, et le compte par cause (entrée de 015, et de 016 pour la part « défaut de source Figma ») figure dans la sortie publiée.
- **SC-008**: 100 % des causes publiées — exclusions, causes de divergence, blocages, non-probants — portent un reçu re-testé et daté ; 0 cause héritée d'une décision antérieure sans re-test ; toute cause infirmée par son re-test est retirée ou re-classée, avec son infirmation consultable.

## Assumptions

- Les critères de comparaison établis par 011 et 013 (régions déclarées, seuils de réussite/échec, preuve probante, refus du non-probant) restent la référence et ne sont pas modifiés par cette fonctionnalité. Seule exception, et dans le sens d'un durcissement : le seuil de 3 % qui dispensait les petites lignes de porter une cause disparaît (FR-015).
- La valeur de contrôle consignée pour reassurances (~3,30 %, dont ~1,74 % de plancher de rééchantillonnage) est une attente, pas un résultat : le chiffre publié sera celui mesuré, et un écart notable avec la valeur de contrôle sera nommé.
- select dispose d'un master Figma et d'un composant généré comparables — il fait partie des 34 générés ; l'exclusion qui l'écartait a été re-testée et infirmée avant l'écriture de cette spec, donc la mesure est attendue probante ; si elle ne l'est pas, la ligne le dira avec son reçu.
- Le vocabulaire de causes à six valeurs est présumé suffisant pour les lignes à trier et pour les causes re-testées ; son extension éventuelle est une décision explicite consignée, jamais une catégorie implicite ni une valeur fourre-tout.
- Les trois organismes bloqués (equipe, formulaire, header) n'ont pas de cas capturé, donc pas de chiffre à corriger ici ; leur blocage est re-testé comme toute autre cause, et un blocage jugé infondé est consigné pour 016 sans être levé dans cette fonctionnalité.
- Le re-test d'une cause se fait avec les instruments existants et en lecture seule ; aucune cause ne demande, pour être vérifiée, une capacité que la fonctionnalité n'a pas le droit de construire.

## Out of Scope

- Corriger la géométrie, convertir un littéral en référence de token, minter ou adopter un token (chantier 015).
- Muter, nettoyer ou régénérer quoi que ce soit côté Figma (chantier 016) ; corriger un défaut de source Figma identifié par un triage — il est consigné, pas corrigé.
- Construire la capacité de transport des pixels d'image (limite A5) : une ligne triée « frontière image » reste une limite nommée.
- Débloquer MemberCard, Field ou NavItem, ou changer le verdict d'un organisme autrement que par la correction d'instrument DW-006.
- Assouplir un seuil, une région déclarée ou un critère de preuve pour faire passer une ligne.

## Dependencies

- Le rapport de parité visuelle et les dossiers de la campagne 013 (dont le registre des travaux reportés qui consigne DW-006 et sa mesure de contrôle), disponibles et à jour sur la branche de départ.
- L'accès en lecture seule à la référence Figma pour re-capturer la référence correcte de reassurances, y re-relever ses valeurs de faits, et mesurer select.
- Les mécanismes de mesure existants (capture, alignement, diff, régions, rapport), employés sans en modifier l'intention.
