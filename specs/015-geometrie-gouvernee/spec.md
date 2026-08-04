# Feature Specification: Géométrie gouvernée

**Feature Branch**: `015-geometrie-gouvernee`  
**Created**: 2026-08-04  
**Status**: Draft  
**Input**: User description (brief du 2026-08-04, condensé — les sections « à parquer pour /speckit.plan » et « questions ouvertes pour /speckit.clarify » sont conservées verbatim dans [notes-pour-plan.md](./notes-pour-plan.md)) : "Faire entrer toute la géométrie des 34 composants dans la boucle de gouvernance — aucune dimension (largeur, hauteur, marge interne, espacement) ne doit plus vivre comme un nombre écrit en dur qu'aucun contrôle ne surveille — et réparer les défauts de géométrie que la campagne de mesure (014) a prouvés. Relevé du 2026-08-03 : ~260 valeurs géométriques en dur dans 28 des 34 contrats, contre 220 références gouvernées. Reçu du risque (013) : un pied de page corrigé avec des nombres en dur est passé de 96,91 % à 1,04 % d'écart — rendu vert sur un fait invisible. La bibliothèque livrée est la seule des quatre surfaces à calculer la taille d'une boîte différemment — 9 composants rendent plus larges chez les consommateurs, et l'instrument de mesure ne peut pas le voir. Figma en lecture seule ; les corrections manuelles de 013 survivent ; hors périmètre attribué, aucun chiffre publié ne varie ; le compte « géométrie du contrat » de la porte de mesure passe de 7 à 0."

## Clarifications

### Session 2026-08-04

- Q: Granularité des références créées from-dump (FR-002) — échelle générique, sémantique par composant, ou hybride ? → A: Hybride selon la famille : les espacements (marges internes, gaps) rejoignent l'échelle générique existante (`space.N`, idiome 012) ; les tailles intrinsèques d'un composant (largeur/hauteur d'une part) reçoivent des références sémantiques `size.<composant>.*` (idiome demo-51) — obligatoirement sémantiques dès qu'une taille varie par variante.
- Q: Forme et gouvernance de la liste des littéraux nommés (FR-003) — liste fermée d'entrées, critère par type de canal, ou déclaration dans le contrat ? → A: Liste fermée d'exceptions, machine-lisible, à l'entrée près (contrat + part + canal), amorcée aux 2 dégradés du hero, lue en direct par le contrôle ; toute addition est une décision consignée avec reçu — jamais un ajout silencieux. Le chemin exact du fichier est un choix de /plan ; l'exigence : une seule source, lisible par le contrôle.
- Q: Sémantique du compte « géométrie du contrat » de la porte (FR-006) — éléments constatés ou travaux à faire, et la relation 1:N ? → A: L'unité publiée est le travail à faire ; la relation 1:N entre une ligne mesurée et les faits qui l'expliquent est modélisée (aggregateOf) : une ligne conséquence de N faits compte pour ces N travaux, jamais N+1. La sortie = 0 travail restant, relue en direct — le chiffre d'ouverture est re-lu après modélisation (il peut différer de 7 ; le compte vif fait foi).
- Q: Dans quelle spec ordonnancer DW-014-001 (défaut moteur : `core/emit-html.ts` émet le texte de select en enfant nu de `<select>`, capture vide — la surface livrée React est correcte) ? → A: Une tinyspec moteur dédiée, ordonnancée immédiatement après la clôture de 015 (avant ou en parallèle de 016 — sans collision : 016 ne touche pas core/) : fixture d'abord (Claims Rule), puis la branche d'émetteur + les 3 re-pins connus. La destination au registre est mise à jour vers cette tinyspec nommée — l'entrée ne reste pas « sans spec assignée ».

## User Scenarios & Testing *(mandatory)*

### User Story 1 - La fin de l'angle mort (Priority: P1)

En tant qu'owner du design system, je veux que toute dimension géométrique des 34 composants siège sur un axe surveillé du différentiel — référence gouvernée, ou littéral nommé que le contrôle connaît — afin qu'une marge changée d'un côté (code ou Figma) soit signalée et proposée de l'autre, au lieu de laisser la parité verte pendant que les surfaces s'écartent.

**Why this priority**: Le différentiel surveille la géométrie à travers l'axe des références gouvernées : une valeur écrite en dur ne siège sur aucun axe — personne ne la propose, rien ne la signale. Le reçu du risque existe : en 013, un pied de page « corrigé » avec des nombres en dur est passé de 96,91 % à 1,04 % d'écart — un rendu vert sur un fait invisible. Relevé du 2026-08-03 : ~260 valeurs en dur dans 28 des 34 contrats, contre 220 références gouvernées — l'angle mort est plus grand que la partie surveillée.

**Independent Test**: Un réviseur prend n'importe quel contrat, énumère ses dimensions géométriques et vérifie que chacune est soit une référence gouvernée, soit un littéral nommé d'un canal déclaré — zéro valeur invisible ; puis il introduit une modification de géométrie en test, de chaque côté de la boucle, et constate que le contrôle la détecte et la signale.

**Acceptance Scenarios**:

1. **Given** les 34 contrats à la clôture, **When** leurs dimensions géométriques sont énumérées, **Then** chacune siège sur un axe surveillé (référence gouvernée) ou est un littéral nommé d'un canal déclaré — 0 valeur invisible au contrôle.
2. **Given** une modification de géométrie introduite en test côté code (une dimension générée qui dévie de sa référence), **When** le contrôle s'exécute, **Then** l'écart est détecté et signalé avec sa localisation.
3. **Given** une modification de géométrie introduite en test côté canvas (sur une copie ou un relevé d'instrument — jamais le fichier client), **When** le contrôle s'exécute, **Then** l'écart est détecté et signalé — la boucle est prouvée, pas supposée.
4. **Given** une valeur géométrique dont aucune référence n'existe, **When** elle est convertie, **Then** sa référence est créée depuis la valeur observée de la source — jamais inventée, jamais écrite à la main.

---

### User Story 2 - Les mêmes boîtes partout (Priority: P2)

En tant que développeur consommateur, je veux que la bibliothèque livrée mesure les mêmes boîtes que la maquette et que les trois autres surfaces, afin que les 9 composants concernés (accordion-row, carte, coordonnees, faq, footer, google-reviews, review-card, sav, textarea) cessent de rendre plus larges chez moi que chez le designer.

**Why this priority**: La bibliothèque livrée est la seule des quatre surfaces à compter bordures et marge interne EN PLUS de la taille posée — et l'instrument de mesure ne peut pas le voir : la surface qui diverge n'est mesurée par rien sur cet axe. Cette question se tranche avant toute conversion : la règle décide quelle boîte le nombre décrit — convertir d'abord, c'est convertir deux fois.

**Independent Test**: Un consommateur rend un des 9 composants avec la bibliothèque livrée et compare sa boîte à la maquette et aux autres surfaces : mêmes dimensions. Un réviseur vérifie que chaque chiffre qui a bougé est re-mesuré et attribué à cette cause.

**Acceptance Scenarios**:

1. **Given** un des 9 composants dont une part porte à la fois une taille et une marge interne, **When** il est rendu par la bibliothèque livrée, **Then** sa boîte mesurée est la même que celle de la maquette et des trois autres surfaces.
2. **Given** la correction du modèle de boîte, **When** les composants affectés sont re-mesurés, **Then** chaque chiffre qui change est attribué à cette cause dans le registre avant/après — et un chiffre qui change sur un composant hors des 9 attendus suspend la publication jusqu'à attribution.
3. **Given** l'ordre du chantier, **When** la première conversion de dimension commence, **Then** la question du modèle de boîte est déjà tranchée et appliquée — aucune dimension n'est convertie deux fois.

---

### User Story 3 - Les défauts mesurés sont réparés (Priority: P3)

En tant qu'owner, je veux que les défauts de géométrie que 014 a prouvés soient réparés — l'en-tête de section « Avec CTA » (8,78 %, rendu à 2174 px au lieu de 3093) et les trois sections divergentes (texte-seo 1,84 %, footer 1,04 %, coordonnees 0,52 %) — afin que le rapport de parité reflète des composants justes, pas des divergences cataloguées.

**Why this priority**: 014 a livré le devis exact — les travaux classés « géométrie du contrat » (compte de la porte : 7) — et la discipline pour les vérifier (registre avant/après, attribution). P3 parce que la valeur durable est la boucle (US1) et la justesse des boîtes (US2) ; ces réparations en sont la première récolte.

**Independent Test**: Un réviseur relance la mesure : l'en-tête de section « Avec CTA » repasse sous le seuil ; les trois sections redeviennent conformes ou portent une nouvelle attribution prouvée ; le compte « géométrie du contrat » de la porte est à 0.

**Acceptance Scenarios**:

1. **Given** l'en-tête de section « Avec CTA » (8,78 % — largeur rendue 2174 px contre 3093 attendus), **When** sa géométrie est réparée et re-mesurée, **Then** sa ligne repasse sous le seuil de réussite existant, sans qu'aucun seuil ni région n'ait été assoupli.
2. **Given** les trois sections divergentes (texte-seo 1,84 %, footer 1,04 %, coordonnees 0,52 %), **When** leurs travaux de géométrie sont exécutés et re-mesurés, **Then** chacune redevient conforme OU porte une nouvelle attribution prouvée — jamais une divergence résiduelle silencieuse.
3. **Given** la porte de mesure de 014, **When** la clôture est tentée, **Then** son compte « géométrie du contrat » (7 à l'ouverture) est à 0 — relu en direct, jamais recopié.

---

### User Story 4 - Un composant, deux tailles, zéro nombre figé (Priority: P3)

En tant que designer, je veux que le logo partagé par l'en-tête et le pied de page porte ses tailles de façon gouvernée, afin qu'un composant utilisé à deux tailles cesse de figer un seul nombre — et que chaque usage déclare la sienne comme il déclare déjà sa couleur.

**Why this priority**: C'est le cas d'école de l'angle mort à l'échelle d'un composant partagé : un seul nombre figé, deux usages réels. L'archive du système démontre qu'une taille gouvernée par variante est un idiome établi — aucune capacité nouvelle n'est requise.

**Independent Test**: Un réviseur vérifie que le logo n'embarque plus de dimension figée unique, que l'en-tête et le pied de page déclarent chacun leur taille, et que les deux rendus sont fidèles à la maquette.

**Acceptance Scenarios**:

1. **Given** le logo gouverné, **When** l'en-tête et le pied de page le consomment, **Then** chacun déclare sa taille par le même mécanisme que sa couleur, et les dimensions rendues correspondent à la maquette des deux côtés.
2. **Given** les tailles du logo, **When** elles sont relevées, **Then** ce sont des références gouvernées créées depuis la source — pas des nombres recopiés à la main.

---

### Edge Cases

- Une valeur géométrique n'a ni référence existante ni place évidente dans le vocabulaire : elle est créée depuis la valeur observée (doctrine from-dump) — jamais arrondie vers une valeur voisine pour « rentrer dans l'échelle » : une conversion qui change le rendu n'est pas une conversion, c'est une réparation non attribuée.
- Un canal géométrique n'a légitimement aucun vocabulaire (les 2 dégradés de fond du hero) : la valeur reste un littéral nommé, déclaré là où le contrôle le connaît — la doctrine vise zéro valeur invisible, pas zéro littéral.
- Une ré-extraction ou une régénération écrase un correctif manuel de 013 : le cas est détecté et refusé — et sa détectabilité est prouvée AVANT que le chantier s'y fie (le cas reproduit en échec d'abord).
- L'unification du modèle de boîte fait bouger un chiffre sur un composant hors des 9 attendus : la publication est suspendue jusqu'à attribution — aucune variation orpheline.
- Un travail de réparation révèle un fait de géométrie nouveau (le compte remonte avant de descendre) : le compte vif fait foi, la découverte est attribuée puis traitée ou consignée — jamais absorbée en silence.
- Une dimension porte fidèlement la valeur d'un défaut de source consigné pour 016 (les cartes de reassurances : la source déborde d'elle-même de 2 px) : sa visibilité est requise ici, sa valeur reste le fait porté, et sa correction appartient au chantier canvas — la conversion n'anticipe jamais l'arbitrage de design.
- Deux usages consomment la même dimension partagée (le logo) : elle est gouvernée une fois et déclarée par usage — jamais dupliquée en copies figées.
- La conversion d'une dimension change des octets des sorties générées sans changer le rendu (même valeur, référence au lieu du nombre) : les reçus d'octets attendus sont re-épinglés en revue — un reçu qui dérive se re-épingle, il ne se contourne pas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Chaque dimension géométrique portée par les 34 contrats — largeur, hauteur, marge interne, espacement, et toute valeur de mise en page de même nature relevée par l'inventaire — MUST siéger sur un axe surveillé du différentiel (référence gouvernée) ou être un littéral nommé d'un canal déclaré (FR-003). Une valeur géométrique invisible au contrôle est un état refusé. La frontière de « même nature » est un ensemble fermé de canaux, déclaré une fois et lisible par le contrôle ; l'élargir est une évolution versionnée de cette déclaration, jamais un réglage silencieux. Les valeurs de trait, de peinture et de typographie que les contrats portent aussi en dur sont HORS de cette fonctionnalité — limite nommée, pas oubli.
- **FR-002**: Une dimension dont aucune référence n'existe MUST recevoir une référence créée depuis la valeur observée de la source (doctrine from-dump) — jamais inventée, jamais arrondie, jamais écrite à la main. Granularité tranchée (session 2026-08-04) : un espacement (marge interne, gap) rejoint l'échelle générique existante (`space.N`, idiome 012) ; une taille intrinsèque d'un composant (largeur/hauteur d'une part) reçoit une référence sémantique portée par ce composant (`size.<composant>.*`, idiome demo-51) — obligatoirement sémantique dès que la taille varie par variante.
- **FR-003**: Les canaux géométriques qui n'ont légitimement pas de vocabulaire MUST être recensés dans une liste fermée d'exceptions, machine-lisible, à l'entrée près (contrat + part + canal), lue en direct par le contrôle ; hors de cette liste, aucun littéral géométrique ne survit. La liste est amorcée aux 2 dégradés de fond du hero ; toute addition découverte pendant l'inventaire est une décision consignée avec reçu — jamais un ajout silencieux. L'emplacement exact du fichier est un choix d'implémentation ; l'exigence est : une seule source, lisible par le contrôle.
- **FR-004**: La question du modèle de boîte MUST être tranchée et appliquée AVANT toute conversion de dimension — la règle décide quelle boîte le nombre décrit ; convertir d'abord, c'est convertir deux fois. La surface livrée MUST mesurer les mêmes boîtes que les trois autres surfaces ; les 9 composants concernés MUST être re-mesurés, chaque chiffre qui bouge attribué à cette cause.
- **FR-005**: La boucle MUST être prouvée, pas supposée : une modification de géométrie introduite en test, de chaque côté (côté code ; côté canvas via copie ou relevé d'instrument — jamais le fichier client), est détectée et signalée par le contrôle.
- **FR-006**: Les travaux « géométrie du contrat » du registre de 014 MUST être exécutés. Sémantique du comptage tranchée (session 2026-08-04) : l'unité publiée est le **travail à faire** ; la relation 1:N entre une ligne mesurée et les faits du registre qui l'expliquent est modélisée (`aggregateOf`) — une ligne conséquence de N faits compte pour ces N travaux, jamais N+1. Le compte de la porte MUST atteindre 0, relu en direct ; le chiffre d'ouverture est re-lu après modélisation (7 au relevé du 2026-08-03 — le compte vif fait foi).
- **FR-007**: L'en-tête de section « Avec CTA » MUST repasser sous le seuil de réussite existant ; texte-seo, footer et coordonnees MUST redevenir conformes ou porter une nouvelle attribution prouvée.
- **FR-008**: Le logo partagé MUST porter ses tailles de façon gouvernée, chaque usage (en-tête, pied de page) déclarant la sienne par le même mécanisme que sa couleur — plus aucun nombre unique figé pour deux usages.
- **FR-009**: Les corrections manuelles issues de 013 MUST survivre au chantier ; le cas « une ré-extraction écrase un correctif manuel » MUST être détecté et refusé, et sa détectabilité MUST être prouvée (le cas reproduit en échec) avant que le chantier s'y fie.
- **FR-010**: Figma MUST rester en lecture seule de bout en bout ; aucun seuil, aucune région déclarée, aucun critère de preuve n'est assoupli.
- **FR-011**: Tout chiffre publié qui change MUST être attribué à sa cause (unification du modèle de boîte, conversion, réparation nommée) dans le registre avant/après ; hors périmètre attribué, aucun chiffre publié ne varie. L'« avant » MUST être une re-mesure de l'état initial dans la fenêtre de la fonctionnalité, même navigateur que l'« après », révision enregistrée.
- **FR-012**: Une conversion pure (littéral → référence de même valeur) MUST NOT changer le rendu d'aucune surface ; tout changement de rendu MUST appartenir à une réparation attribuée (FR-004, FR-006, FR-007, FR-008).
- **FR-013**: La porte de mesure installée par 014 MUST rester verte à la clôture, ses comptes relus en direct — jamais figés en prose.

### Key Entities

- **Dimension géométrique**: Toute valeur de mise en page portée par un contrat (largeur, hauteur, marge interne, espacement, et valeurs de même nature). À la clôture, chacune est dans exactement un des deux états visibles : référence gouvernée (sur un axe surveillé) ou littéral nommé (canal déclaré). Le troisième état — nombre invisible — n'existe plus.
- **Littéral nommé**: Une valeur géométrique dont le canal n'a légitimement pas de vocabulaire, déclarée sur la liste fermée d'exceptions (à l'entrée près : contrat + part + canal) que le contrôle lit en direct. Nommé ≠ invisible.
- **Référence créée (from-dump)**: Une référence gouvernée créée depuis la valeur observée de la source — provenance citée, jamais inventée.
- **Registre avant/après**: L'instrument de 014, réutilisé : chiffres initiaux re-mesurés et chiffres finaux côte à côte, chaque variation attribuée à sa cause.
- **Attribution de cause**: Le lien entre un chiffre qui change et le travail qui l'explique — unification du modèle de boîte, conversion, réparation nommée. Une variation sans cause bloque la publication.
- **Correctif manuel 013**: Une valeur posée à la main pendant la campagne 013, à préserver ; son écrasement par ré-extraction est la classe d'erreur à détecter et refuser.
- **Compte par cause de la porte**: La sortie dimensionnante de 014 (« géométrie du contrat » = 7 au relevé d'ouverture), relue en direct ; unité : le travail à faire, la relation 1:N ligne↔faits modélisée (`aggregateOf`) pour ne jamais compter N+1 ; son passage à 0 est la condition de sortie.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % des dimensions géométriques des 34 composants siègent sur un axe surveillé ou sont des littéraux nommés d'un canal déclaré — 0 valeur invisible. **Population gouvernée : les canaux de mise en page** (largeur, hauteur, largeur/hauteur minimales, espacement, marges internes) — relevé du 2026-08-04 : **183 valeurs en dur dans 27 contrats**. Les 77 autres valeurs en dur que portent les contrats (trait, peinture, typographie) restent hors périmètre et donc invisibles au contrôle : la clôture doit le dire, et « 0 valeur invisible » ne se lit jamais « 260 → 0 ». Le compte vif à la clôture fait foi.
- **SC-002**: Une modification de géométrie introduite en test de chaque côté de la boucle est détectée et signalée par le contrôle — 2 détections sur 2, 0 angle mort démontré.
- **SC-003**: Les 9 composants au modèle de boîte divergent mesurent les mêmes boîtes que la maquette sur les quatre surfaces ; 100 % des chiffres qui ont bougé sont attribués à cette cause.
- **SC-004**: L'en-tête de section « Avec CTA » est sous le seuil de réussite ; texte-seo, footer et coordonnees sont conformes ou portent une attribution nouvelle prouvée — 0 divergence résiduelle silencieuse.
- **SC-005**: Le compte « géométrie du contrat » de la porte de mesure (unité : travaux à faire, relation 1:N modélisée) atteint 0, et la porte rend PASS (code de sortie 0) à la clôture — chiffre d'ouverture re-lu en direct (7 au relevé du 2026-08-03).
- **SC-006**: Hors périmètre attribué, 0 chiffre publié ne varie ; 100 % des corrections manuelles de 013 sont présentes à la clôture (0 écrasée).
- **SC-007**: Un réviseur retrouve pour n'importe quelle dimension convertie sa valeur d'origine, sa provenance et sa cause en moins de 5 minutes.

## Assumptions

- Le relevé du 2026-08-03 (~260 valeurs en dur, 28 contrats sur 34, 220 références gouvernées) est l'entrée dimensionnante — mais il compte **toutes** les valeurs en dur, tous canaux confondus. Le re-relevé du 2026-08-04 sépare les deux populations : **183 valeurs de mise en page dans 27 contrats** (le périmètre de cette fonctionnalité) et 77 valeurs de trait, peinture et typographie (hors périmètre, cf. FR-001). Le compte vif au moment de l'exécution fait foi — aucun compte n'est figé en prose.
- L'unification du modèle de boîte est la correction d'un oubli, pas une capacité nouvelle : trois surfaces sur quatre partagent déjà la même règle, la surface livrée les rejoint (décision du 2026-08-04, consignée dans la feuille de route — ROADMAP.md § Prochaines specs).
- Le logo gouverné par variante ne demande aucune capacité nouvelle : l'archive du système (demo-51) emploie cet idiome pour toute taille par variante (décision du 2026-08-04, même source), et la référence de doctrine (52 contrats archivés, zéro littéral) montre la cible.
- Les instruments de 014 (porte de mesure, registre avant/après, attributions, reçus de cause) sont réutilisés tels quels, leur intention inchangée.
- Une dimension liée à un défaut de source consigné pour 016 (le débordement des cartes de reassurances) est rendue visible ici sans que sa valeur soit « réparée » ici — l'arbitrage de design appartient à 016.
- La preuve côté canvas (FR-005, SC-002) s'obtient en lecture seule — copie de relevé ou instrument ; aucune vérification ne demande une mutation du fichier client.

## Out of Scope

- Toute mutation Figma : le débordement de 2 px des cartes de reassurances (DW-002, re-classé défaut de source le 2026-08-04) et l'en-tête figé de la FAQ (DW-003) partent au chantier canvas (016).
- Les photos non transportées (frontière image, limite A5) : chantier 017.
- Le plancher de rendu/rastérisation : assumé, jamais toléré au score, pas traité ici.
- Le déblocage de MemberCard, Field ou NavItem.
- Le défaut du texte de select (DW-014-001) : hors de cette fonctionnalité, confirmé — ordonnancé (session 2026-08-04) dans une tinyspec moteur dédiée, immédiatement après la clôture de 015 (avant ou en parallèle de 016). La seule action de 015 à son égard : mettre à jour la destination au registre vers cette tinyspec nommée — plus de « à ordonnancer, sans spec assignée », jamais un abandon silencieux.

## Dependencies

- Les sorties de 014, disponibles sur la branche de départ : la porte de mesure et son compte par cause (« géométrie du contrat » = 7), le registre avant/après, les attributions et reçus de cause, le registre des travaux reportés re-classé.
- Les dossiers de la campagne 013, dont l'inventaire des corrections manuelles à préserver.
- L'accès Figma en lecture seule (relevés existants, dumps) pour créer les références depuis la source et re-mesurer.
- L'archive de référence du système (demo-51) comme doctrine de la cible : zéro littéral géométrique invisible.
