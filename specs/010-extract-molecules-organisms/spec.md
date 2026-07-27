# Feature Specification: Extraction des molécules et organismes du canvas Figma — passage de 7 à 34 composants gouvernés

**Feature Branch**: `010-extract-molecules-organisms`  
**Created**: 2026-07-27  
**Status**: Draft  
**Input**: User description (brief owner livré en session du 2026-07-27) : « Passer de 7 composants gouvernés (les atoms : Button, Checkbox, Input, Select, Textarea, Review-card, Google Reviews) à ~30 — en extrayant tous les molécules et organismes du canvas Figma qui n'ont pas encore de contrat. 57 propositions de contrats ont été générées depuis le canvas (chacune un point de départ : anatomie, props, tokens, lié au Figma par componentSetKey). Workflow rodé : prendre une proposition → la reviewer + corriger notes et unbound values → copier dans contracts → générer → vérifier parité trois voies. » Le volet « comment » (découpage en lots, séquence d'extraction, instrument de diff, méthode de mesure) a été explicitement parqué par l'owner pour `/speckit.plan`.

**Inventaire réel vérifié sur le fichier Figma vivant** (2026-07-27, page par page) : le fichier est rangé en 3 pages DS (Atomes / Molécules / Organisms). Tout composant sur ces pages est à contractualiser, sauf les 4 organismes complexes exclus par l'owner (grid, repeat-root, embed). Les icônes (19) relèvent du registre d'icônes gouverné, pas des contrats de composants. Le doublon `Bouton` (français) = le `Button` déjà contractualisé.

## Clarifications

### Session 2026-07-27

- Q: Les annexes COMPONENT_SET (Realisation, MemberPicture, PiquerayLogo, AccordionRow, Field, Bouton) — contractées comme composants autonomes, traitées comme sous-composants consommés, ou exclues ? → A: **Tranché par l'inventaire Figma réel.** Le fichier est rangé par page DS : tout composant sur la page « DS · Atomes » est un atome, tout composant sur « DS · Molécules » est une molécule, tout composant sur « DS · Organisms » est un organisme. Les 6 « annexes » se répartissent ainsi : MemberPicture et PiquerayLogo sont sur la page Atomes → **contractés comme atomes** ; AccordionRow, Field, Realisation, SectionHeader, Tab sont sur la page Molécules → **contractés comme molécules** ; Bouton est un doublon du Button déjà contractualisé → **exclu**. La notion d'« annexe » n'existe pas : la page Figma décide du statut, pas un tableau de brief.
- Q: Les 4 organismes complexes (HeroVideo, ProduitsECommerce, Realisations, CategoriesPrincipales) entrent dans le périmètre aussi, ou restent exclus ? → A: **Exclus pour cette itération** (décision owner, 2026-07-27). Motif : grid, repeat-root, embed — capacités non couvertes par le moteur actuel. Reportés à une future itération avec motif nommé.
- Q: Les 3 icônes présentes sur le canvas Figma mais absentes du registre gouverné (ExternalLink, Mail, OcticonChevronDown12) — étendre le registre, ou le laisser figé ? → A: **Étendre le registre** (Option A). Ces 3 icônes sont déjà sur la source Figma — la même logique qui contractualise les 2 atomes manquants s'applique : on contracte ce que le canvas expose. Les laisser non enregistrées bloquerait les contrats d'organismes qui les instancient (Header, Footer, Formulaire, SAV, etc.) au niveau du gate de refus existant. La ligne de périmètre « pas d'extension du registre » visait des icônes *nouvelles*, pas des icônes *déjà présentes mais non enregistrées*.
- Q: Le motif d'exclusion des 4 organismes complexes (« grid, repeat-root, embed ») est-il toujours exact sachant que 006 a livré un `repeat + component` ? → A: **Corriger le motif** (Option B). Les 4 organismes restent exclus cette itération (décision owner), mais le motif doit refléter ce que le moteur couvre réellement post-006 : `repeat-root` est couvert (006 a livré `ds.google-reviews` composant `ds.review-card` via `repeat + component`) ; les capacités réellement non couvertes sont `grid` (grille 2D), `embed` (contenu externe intégré), et toute variante de `repeat` au-delà de ce que 006 a exercé (rangée horizontale à largeurs égales). Le motif devient **par organisme**, pas un label générique de 3 mots — sinon violation de Principle V (honesty — degradation is named, never silent).
- Q: La « règle hybride » de réactivation des évals quarantainées (FR-018) doit-elle être définie inline ou renvoyer aux docs existantes ? → A: **Renvoyer aux docs existantes** (Option B). La règle hybride est déjà documentée à deux endroits : `docs/handoff/09-testing-and-gates.md` (§testing-and-gates, lignes 22-28) et `evals/REMOVED-CASES.md` (§Re-enabling a case, avec le mécanisme exact : déplacer le bloc de `legacy-cases.ts` vers `run.ts`, le retirer du tableau, rien d'autre à éditer ; chaque cas porte un commentaire `RE-ENABLE WHEN:` — sa condition de réactivation). La redéfinir inline violerait la constitution §IX (docs-first — ne pas re-dériver ce que la doc établit déjà) et créerait un risque de drift entre la spec et les docs. La spec nomme les sources, ne redéfinit pas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Les 2 atomes manquants deviennent des composants gouvernés par contrat (Priority: P1)

En tant que développeur consommateur de la bibliothèque, je veux importer et utiliser **MemberPicture** et **PiquerayLogo** — les 2 atomes présents sur la page « DS · Atomes » du fichier Figma mais pas encore contractualisés — générés depuis leur contrat, exactement comme le Button et les 4 atomes de saisie.

**Why this priority**: PiquerayLogo est le logo de marque, instancié par Header et Footer (partout). MemberPicture est la photo d'un membre, instanciée par Equipe. Ce sont des atomes au même titre que le Button — la page Figma les range en Atomes, le système les contractualise comme atomes. Ils sont les briques dont les organismes dépendent.

**Independent Test**: Un développeur importe les 2 atomes depuis la bibliothèque générée et les rend ; toutes les vérifications du dépôt passent comme sur le Button.

**Acceptance Scenarios**:

1. **Given** MemberPicture et PiquerayLogo présents sur la page « DS · Atomes », **When** chacun est extrait puis contractualisé, **Then** un contrat versionné existe pour chaque atome et génère son composant de code, avec la catégorie `atom`.
2. **Given** PiquerayLogo instancié par Header et Footer, **When** ces organismes sont contractualisés, **Then** la composition est déclarée par lien de clé de composant vers le contrat PiquerayLogo.

---

### User Story 2 - Les 13 molécules deviennent des composants gouvernés par contrat (Priority: P1)

En tant que développeur consommateur de la bibliothèque, je veux importer et utiliser les **13 molécules** présentes sur la page « DS · Molécules » du fichier Figma — générées depuis leur contrat, exactement comme le Button — afin de construire les pages Piqueray avec le même niveau de preuve de fidélité, sans bricoler de composants à la main.

Les 13 molécules : **AccordionRow, Avantage, CarouselControls, Carte, Copyright, Field, FooterColumn, MemberCard, NavItem, ProductCard, Realisation, SectionHeader, Tab**.

**Why this priority**: C'est la valeur centrale de l'itération. Les propositions générées depuis le canvas sont des points de départ, pas des contrats finis : chacune doit être reviewée, ses notes et unbound values corrigées, puis contractualisée. Tant que les molécules ne sont pas contractualisées, aucune page Piqueray au-delà des atomes n'est constructible avec les garanties du système. Les molécules sont les briques dont les organismes dépendent — elles doivent précéder les organismes dans la chaîne d'extraction.

**Independent Test**: Un développeur importe les 13 molécules depuis la bibliothèque générée et les rend ; toutes les vérifications du dépôt passent sur ces composants comme sur le Button — génération déterministe (byte-identique deux fois de suite), comparaison trois voies à zéro écart, contrôle visuel dans la tolérance de l'instrument existant, et la suite d'évals au complet.

**Acceptance Scenarios**:

1. **Given** les propositions de contrat générées depuis le canvas pour chaque molécule, **When** chacune est reviewée (notes corrigées, unbound values résolues) puis contractualisée, **Then** un contrat versionné existe pour chaque molécule et génère son composant de code, avec la catégorie `molecule`.
2. **Given** les 13 contrats de molécules livrés, **When** le développeur importe et utilise les molécules, **Then** elles s'utilisent avec le même niveau de preuve que le Button (aucun composant écrit ni corrigé à la main).
3. **Given** une molécule dont la proposition contient des valeurs non liées à un token (unbound values), **When** elle est reviewée, **Then** chaque valeur non liée est soit liée à un token existant, soit mintée comme token `imported.*` provisoire (jamais inventée, toujours rapportée) — jamais laissée silencieusement non liée.
4. **Given** une molécule qui instancie un composant déjà gouverné (ex. un Button, une icône du registre), **When** elle est contractualisée, **Then** la composition est déclarée dans le contrat (lien par clé de composant, jamais par nom d'affichage) et la parité trois voies confirme que l'instance canvas correspond.

---

### User Story 3 - Les 12 organismes simples deviennent des composants gouvernés par contrat (Priority: P1)

En tant que développeur consommateur de la bibliothèque, je veux importer et utiliser les **12 organismes simples** présents sur la page « DS · Organisms » du fichier Figma (hors les 4 complexes exclus) — générés depuis leur contrat — afin de disposer des sections de page complètes avec les mêmes garanties que les atomes et molécules.

Les 12 organismes : **Coordonnees, Devis, Equipe, FAQ, Footer, Formulaire, Header, Hero, Presentation, Reassurances, SAV, TexteSEO**.

**Why this priority**: Les organismes sont la couche qui assemble molécules et atomes en sections de page utilisables. Sans eux, le système fournit les briques mais pas les assemblages. Ils dépendent des molécules (US2) — leur extraction suit la contractualisation des molécules, mais leur valeur est équivalente : un organisme gouverné ferme un niveau entier de la page.

**Independent Test**: Un développeur importe les 12 organismes depuis la bibliothèque générée et les rend ; toutes les vérifications du dépôt passent comme sur le Button.

**Acceptance Scenarios**:

1. **Given** les propositions de contrat générées depuis le canvas pour chaque organisme, **When** chacune est reviewée puis contractualisée, **Then** un contrat versionné existe pour chaque organisme et génère son composant de code, avec la catégorie `section`.
2. **Given** un organisme qui compose des molécules déjà contractualisées (ex. Footer composant FooterColumn, Header composant NavItem, Equipe composant MemberPicture), **When** il est contractualisé, **Then** la composition est déclarée dans le contrat par lien de clé de composant, et la parité trois voies confirme la concordance.
3. **Given** un organisme dont la proposition contient une structure complexe (plusieurs niveaux d'imbrication), **When** elle est reviewée, **Then** l'anatomie multi-racine est correctement déclarée et chaque partie est liée à son token ou mintée provisoirement.

---

### User Story 4 - La source Figma de chaque composant est auditée et nettoyée avant l'extraction (Priority: P1)

En tant qu'owner du design system, je veux que l'étape 0 (« source propre avant contrat », constitution §VIII) soit satisfaite pour **chaque** composant avant son extraction — audit de la source (masters : structure, contraintes, branchements de variables, tailles, descriptions) ET de l'usage (toutes les instances sur toutes les pages, repérées par POSITION jamais par nom) — afin qu'aucun contrat ne soit modélisé autour d'une source défectueuse.

**Why this priority**: La règle « source propre avant contrat » est non-négociable (constitution §VIII). Le Button a coûté une journée de rework pour avoir été contractualisé depuis une source non nettoyée. Les molécules et organismes sont plus complexes que les atomes — le risque de launder un hack en loi est proportionnellement plus grand. L'audit peut confirmer que la source est déjà propre (issue de 003/005) ; dans ce cas, il est réutilisé, pas refait.

**Independent Test**: Pour chaque composant contractualisé, un constat d'audit existe (structure + usage par position) ; si l'audit révèle un défaut, le composant n'est pas contractualisé tant que le défaut n'est pas corrigé à la source — jamais contourné en modélisant autour.

**Acceptance Scenarios**:

1. **Given** un composant candidat à la contractualisation, **When** l'étape 0 s'exécute, **Then** un audit de source (masters + usage par position) est produit ou réutilisé, et la contractualisation ne commence qu'après sa validation.
2. **Given** un audit qui révèle un défaut de master (contrainte manquante, branchement douteux, structure inattendue, affordance officieuse cachée), **When** le défaut est rencontré, **Then** il est corrigé à la source Figma (rendant l'affordance officielle comme propriété de composant, jamais en hack de calque caché) AVANT l'extraction — jamais contourné en modélisant autour.
3. **Given** un master déjà propre et validé (issu de 003/005), **When** l'audit s'exécute, **Then** le constat existant est réutilisé, pas refait — l'étape 0 est satisfaite par réutilisation, pas par duplication.
4. **Given** une correction de source qui s'avère nécessaire, **When** elle est envisagée, **Then** la capture avant (constitution §X) de TOUTES les cibles affectées est faite et vérifiée non-vide et correctement dimensionnée AVANT la moindre mutation du canevas — pas un sous-ensemble pilote, pas une première page seulement.

---

### User Story 5 - Les frontières du périmètre sont explicites et nommées (Priority: P2)

En tant qu'owner du design system, je veux que chaque composant du fichier Figma ait un statut **explicite et nommé** — contractualisé, exclu avec motif, ou doublon — afin qu'aucun composant ne soit laissé dans une zone grise non décidée et que le compte cible (34) soit vérifiable.

**Why this priority**: Le fichier Figma contient 3 pages DS avec 60+ composants. Laisser un composant non tranché crée une zone grie : un composant ni contractualisé ni explicitement exclu est un composant dont le statut sera redébatu à chaque future itération. La clarté du périmètre est la condition de la clôture vérifiable.

**Independent Test**: Un tableau de périmètre liste chaque composant du fichier Figma avec son statut et son motif ; le compte de contractualisés + le compte d'exclus nommés + le compte de doublons = le total des composants du fichier (aucun orphelin non décidé).

**Acceptance Scenarios**:

1. **Given** les 4 organismes complexes (HeroVideo, ProduitsECommerce, Realisations, CategoriesPrincipales), **When** le périmètre est finalisé, **Then** chacun est explicitement EXCLU avec un motif **par organisme** (reflétant les capacités réellement non couvertes post-006 : `grid`, `embed`, variants de `repeat` au-delà de 006 — pas un label générique) et reporté à une future itération.
2. **Given** les 19 icônes seules (ArrowLeft, ArrowRight, Cart, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Download, ExternalLink, Facebook, Instagram, Mail, Pdf, Phone, Search, User, Etoile, OcticonChevronDown12, Piqueray), **When** le périmètre est finalisé, **Then** elles sont explicitement EXCLUES de la contractualisation en tant que composants avec un motif nommé — ce sont des instances, pas des composants à contracter ; elles relèvent du jeu d'icônes gouverné (registre), pas des contrats de composants.
3. **Given** le doublon `Bouton` (français, page Atomes) = le `Button` déjà contractualisé en `ds.button`, **When** le périmètre est finalisé, **Then** il est explicitement EXCLU avec un motif nommé (doublon du contrat existant — rapprochement par clé de composant, jamais par nom d'affichage).
4. **Given** le périmètre finalisé, **When** on compte les composants contractualisés, **Then** le total (7 existants + 27 nouveaux = 34) est atteint, et tout écart est nommé et justifié.

---

### User Story 6 - Toutes les vérifications du dépôt restent vertes et les évals quarantainées se réactivent (Priority: P2)

En tant qu'owner du design system, je veux que l'ajout de 27 composants gouvernés laisse toutes les vérifications du dépôt vertes — génération déterministe, comparaison trois voies, contrôle visuel, suite d'évals — et que les cas d'évals quarantainés qui redeviennent activables du fait de cette itération soient réactivés selon la règle hybride.

**Why this priority**: Les gates sont la portion automatisée de la revue de conformité (constitution, Quality Gates). Un gate rouge bloque le merge — sans exception. L'ajout de 27 composants est la plus grosse extension depuis la reconversion Piqueray ; le risque de régression sur l'existant est réel. Les cas d'évals quarantainés (ceux qui exigent « des molécules Piqueray », « des organismes ») deviennent activables à mesure que les composants atterrissent — leur réactivation est nommée, jamais silencieuse.

**Independent Test**: Le sweep complet des gates s'exécute à chaque checkpoint et à la clôture ; le compte vivant d'évals (affiché par l'outil) fait foi ; tout cas réactivé est nommé dans le rapport de clôture.

**Acceptance Scenarios**:

1. **Given** l'ajout progressif de 27 contrats, **When** le sweep des gates s'exécute à un checkpoint, **Then** la génération est déterministe (byte-identique deux fois de suite), la comparaison trois voies est à zéro écart, le contrôle visuel est dans la tolérance de l'instrument existant, et la suite d'évals passe au complet.
2. **Given** un cas d'éval quarantainé qui exigeait des molécules ou organismes Piqueray, **When** les composants nécessaires sont contractualisés, **Then** le cas est réactivé selon la règle hybride (définie dans `docs/handoff/09-testing-and-gates.md` et `evals/REMOVED-CASES.md` §Re-enabling a case), son retrait de quarantaine est nommé, et les compteurs cités sont re-synchronisés avec le compte vivant.
3. **Given** un compteur cité dans un document vivant (nombre d'évals, de composants, d'icônes), **When** il est référencé, **Then** il reste synchronisé avec le compte vivant affiché par les outils — le compte vivant fait foi, jamais un chiffre codé en dur (constitution, Principle II).

---

### Edge Cases

- **L'audit révèle un défaut sur un master** : corrigé à la source AVANT l'extraction (constitution §VIII) — jamais contourné en modélisant autour. La capture avant (§X) de toutes les cibles affectées précède la correction. Le composant touché attend le fix ; les autres composants avancent en parallèle.
- **Une proposition contient des valeurs non liées à un token (unbound values)** : chaque valeur est soit liée à un token existant, soit mintée comme token `imported.*` provisoire (jamais inventée, toujours rapportée) — jamais laissée silencieusement non liée (constitution, Principle V).
- **Une molécule instancie un composant pas encore contractualisé** (ex. un organisme instancie une molécule encore en cours d'extraction) : l'organisme attend que la molécule soit contractualisée — la composition se déclare par lien de clé de composant, jamais par nom d'affichage.
- **Un composant du canvas n'apparaît dans aucune catégorie décidée** : il est identifié et son statut est tranché — aucun composant orphelin non décidé ne subsiste (US5).
- **Le compte cible (34) n'est pas atteint exactement** : l'écart est nommé et justifié (ex. un composant s'avère être un doublon, un composant s'avère plus complexe que prévu et est reclassé en exclu) — le compte vivant fait foi.
- **Un nom d'affichage Figma diffère du nom de code** (ex. « Équipe » ↔ « Equipe », « Coordonnées » ↔ « Coordonnees ») : le rapprochement se fait par clé de composant, jamais par nom d'affichage — sinon échec silencieux (leçon « Button » vs « Bouton » de 002).
- **Une proposition contient un dump dupliqué** (noms accentués vs non-accentés, ex. « coordonn-es » et « coordonnees ») : la proposition canonique est identifiée, la dupliquée est écartée — le rapprochement par clé de composant désambiguïse.
- **Un composant s'avère plus complexe que prévu** (ex. une « molécule simple » contient en fait un `grid`, un `embed`, ou un variant de `repeat` non couvert par 006) : il est reclassé en « complexe » et exclu avec motif **par organisme** — jamais forcé dans le périmètre au prix d'un contournement.
- **Le doublon `Bouton` (français) est confondu avec le `Button` déjà contractualisé** : refusé — rapprochement par clé de composant, le doublon est écarté avec motif nommé.
- **Le fichier Figma a bougé entre la génération des propositions et l'extraction** : les propositions sont re-confirmées au moment de l'extraction ; l'état re-mesuré fait foi.
- **Un cas d'éval quarantainé redevient activable** : réactivé selon la règle hybride (définie dans `docs/handoff/09-testing-and-gates.md` et `evals/REMOVED-CASES.md` §Re-enabling a case), retrait/ajout nommé, compteurs re-synchronisés (constitution, Principle II).

## Requirements *(mandatory)*

### Functional Requirements

**Étape 0 — source propre avant contrat (constitution §VIII)**

- **FR-001**: Chaque composant candidat à la contractualisation MUST être précédé d'un audit de source (masters : structure, contraintes, branchements de variables, tailles, descriptions) ET de l'usage (toutes les instances sur toutes les pages, repérées par POSITION jamais par nom de calque). L'audit peut être réutilisé s'il existe et est validé (issu de 003/005) — jamais refait dans ce cas.
- **FR-002**: Tout défaut de master révélé par l'audit MUST être corrigé à la source Figma AVANT l'extraction — l'affordance officieuse MUST devenir une propriété de composant officielle, jamais un hack de calque caché. Aucun contrat MUST jamais être modélisé autour d'une source défectueuse.
- **FR-003**: Avant toute mutation du canevas Figma (correction de source), la capture avant (constitution §X) de TOUTES les cibles affectées MUST être faite et vérifiée non-vide et correctement dimensionnée — pas un sous-ensemble pilote, pas une première page seulement. Chaque capture est irréversible une fois la mutation commencée.

**Extraction et contractualisation — la chaîne prouvée**

- **FR-004**: Chaque composant MUST être extrait de son master Figma (Figma-first) puis garanti par son contrat — le contrat garantit exactement ce que le master expose, ni plus ni moins. La proposition générée depuis le canvas est un point de départ, pas un contrat fini : elle MUST être reviewée (notes corrigées, unbound values résolues) avant d'être contractualisée.
- **FR-005**: Chaque valeur non liée à un token (unbound value) découverte dans une proposition MUST être soit liée à un token existant, soit mintée comme token `imported.*` provisoire — jamais inventée, toujours rapportée, jamais laissée silencieusement non liée (constitution, Principle V).
- **FR-006**: Le rapprochement master ↔ contrat MUST se faire par identité stable (clé de composant), jamais par nom d'affichage — sinon échec silencieux (leçon « Button » vs « Bouton » de 002).
- **FR-007**: Le nommage MUST suivre le précédent établi : français côté Figma, anglais côté code (Bouton ↔ Button, Équipe ↔ Equipe, Coordonnées ↔ Coordonnees).
- **FR-008**: Chaque composant contractualisé MUST porter sa catégorie (`atom`, `molecule`, ou `section`) — l'usage est exhaustif, aucun composant orphelin sans catégorie ne subsiste (précédent établi en 004). La catégorie est déterminée par la page Figma où le master réside (DS · Atomes → `atom`, DS · Molécules → `molecule`, DS · Organisms → `section`).
- **FR-009**: La composition (un composant qui en instancie un autre) MUST être déclarée dans le contrat par lien de clé de composant — jamais par nom. Un organisme qui compose des molécules MUST attendre que ces molécules soient contractualisées.

**Périmètre — frontières explicites**

- **FR-010**: Les **2 atomes** manquants (MemberPicture, PiquerayLogo) MUST devenir des composants gouvernés par contrat — un contrat versionné par atome, générant son composant de code, catégorie `atom`.
- **FR-011**: Les **13 molécules** (AccordionRow, Avantage, CarouselControls, Carte, Copyright, Field, FooterColumn, MemberCard, NavItem, ProductCard, Realisation, SectionHeader, Tab) MUST devenir des composants gouvernés par contrat — un contrat versionné par molécule, catégorie `molecule`.
- **FR-012**: Les **12 organismes simples** (Coordonnees, Devis, Equipe, FAQ, Footer, Formulaire, Header, Hero, Presentation, Reassurances, SAV, TexteSEO) MUST devenir des composants gouvernés par contrat — un contrat versionné par organisme, catégorie `section`.
- **FR-013**: Les **4 organismes complexes** (HeroVideo, ProduitsECommerce, Realisations, CategoriesPrincipales) MUST être explicitement EXCLUS avec un motif **par organisme** (pas un label générique) et reportés à une future itération. Le motif MUST refléter ce que le moteur couvre réellement post-006 : `repeat + component` est couvert (006 a livré `ds.google-reviews` composant `ds.review-card`) ; les capacités réellement non couvertes sont `grid` (grille 2D), `embed` (contenu externe intégré), et toute variante de `repeat` au-delà de ce que 006 a exercé (rangée horizontale à largeurs égales). Aucun contournement MUST être construit pour les forcer dans le périmètre.
- **FR-014**: Les **19 icônes seules** (ArrowLeft, ArrowRight, Cart, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Download, ExternalLink, Facebook, Instagram, Mail, Pdf, Phone, Search, User, Etoile, OcticonChevronDown12, Piqueray) MUST être explicitement EXCLUES de la contractualisation en tant que composants avec un motif nommé — ce sont des instances, pas des composants à contracter ; elles relèvent du jeu d'icônes gouverné (registre), pas des contrats de composants.
- **FR-014a**: Les **3 icônes présentes sur le canvas Figma mais absentes du registre gouverné** (ExternalLink, Mail, OcticonChevronDown12) MUST être enregistrées dans le registre d'icônes gouverné (`contracts/icons.registry.json`) comme extension mineure (semver minor) — elles sont sur la source Figma, donc contractées par la même logique que les 2 atomes manquants. Le registre passe de 16 à **19 entrées**. Les 16 autres icônes déjà enregistrées ne sont PAS touchées. Cette extension est la condition pour que les organismes qui instancient ces icônes (Header, Footer, Formulaire, SAV, etc.) puissent être contractualisés sans heurter le gate de refus existant (icône non enregistrée = refus par nom).
- **FR-015**: Le doublon `Bouton` (français, page Atomes) MUST être explicitement EXCLU avec un motif nommé — doublon du contrat `ds.button` déjà existant ; rapprochement par clé de composant, jamais par nom d'affichage.
- **FR-016**: Le compte final de composants contractualisés (7 existants + 27 nouveaux) MUST atteindre **34** ; tout écart MUST être nommé et justifié (ex. un composant reclassé en exclu après audit, un doublon identifié).

**Preuves finales — les gates**

- **FR-017**: Toutes les vérifications existantes du dépôt MUST rester vertes à chaque checkpoint et à la clôture : génération déterministe (byte-identique deux fois de suite), comparaison trois voies à zéro écart, contrôle visuel dans la tolérance de l'instrument existant, suite d'évals au complet.
- **FR-018**: Les cas d'évals quarantainés qui redeviennent activables du fait de cette itération (ex. ceux exigeant « des molécules Piqueray », « des organismes », « un second composant au-delà des atomes ») MUST être réactivés selon la **règle hybride** — définie dans `docs/handoff/09-testing-and-gates.md` (§testing-and-gates) et `evals/REMOVED-CASES.md` (§Re-enabling a case : déplacer le bloc de `legacy-cases.ts` vers `run.ts`, le retirer du tableau, rien d'autre à éditer ; chaque cas porte un commentaire `RE-ENABLE WHEN:` — sa condition de réactivation). La spec ne redéfinit pas la règle (constitution §IX — docs-first) ; elle renvoie aux sources. Tout retrait ou ajout de cas MUST être nommé.
- **FR-019**: Tout compteur cité (nombre d'évals, de composants, d'icônes) MUST rester synchronisé avec le compte vivant affiché par les outils — le compte vivant fait foi, jamais un chiffre codé en dur (constitution, Principle II).

### Key Entities *(include if feature involves data)*

- **Atome manquant (contrat)** : MemberPicture, PiquerayLogo — composants gouvernés par contrat, extraits de leur master Figma sur la page « DS · Atomes », catégorie `atom`. Nom français côté Figma, anglais côté code.
- **Molécule (contrat)** : AccordionRow, Avantage, CarouselControls, Carte, Copyright, Field, FooterColumn, MemberCard, NavItem, ProductCard, Realisation, SectionHeader, Tab — 13 composants gouvernés par contrat, extraits de la page « DS · Molécules », catégorie `molecule`.
- **Organisme simple (contrat)** : Coordonnees, Devis, Equipe, FAQ, Footer, Formulaire, Header, Hero, Presentation, Reassurances, SAV, TexteSEO — 12 composants gouvernés par contrat, extraits de la page « DS · Organisms », catégorie `section`. Composent des molécules et atomes déjà contractualisés.
- **Organisme complexe (exclu)** : HeroVideo, ProduitsECommerce, Realisations, CategoriesPrincipales — explicitement exclus avec motif **par organisme** (capacités réellement non couvertes post-006 : `grid`, `embed`, variants de `repeat` au-delà de 006), reportés à une future itération.
- **Icône seule (exclue)** : 19 icônes sur la page « DS · Atomes » — instances, pas composants à contracter ; relèvent du jeu d'icônes gouverné (registre), pas des contrats de composants.
- **Doublon (exclu)** : `Bouton` (français) — doublon du contrat `ds.button` déjà existant ; rapprochement par clé de composant.
- **Proposition de contrat (point de départ)** : le résultat de l'extraction automatique depuis le canvas — anatomie, props, tokens, lié au Figma par componentSetKey. Pas un contrat fini : doit être reviewée (notes corrigées, unbound values résolues) avant contractualisation.
- **Audit de source (étape 0)** : le constat outillé (structure + usage repéré par position) produit pour chaque master, réutilisé s'il existe et est validé (issu de 003/005), jamais refait dans ce cas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un développeur importe et utilise les 27 nouveaux composants (2 atomes + 13 molécules + 12 organismes) avec le même niveau de preuve que le Button — toutes les vérifications du dépôt passent (génération déterministe, comparaison trois voies, contrôle visuel, suite d'évals complète).
- **SC-002**: Le nombre de composants gouvernés passe de 7 à **34** ; le compte vivant (affiché par les outils du dépôt) fait foi ; tout écart par rapport à 34 est nommé et justifié.
- **SC-003**: Chaque composant contractualisé s'appuie sur un audit de source validé (réutilisé ou produit) — aucun composant n'est contractualisé sur une source non auditée.
- **SC-004**: Toute correction de source Figma nécessaire a été précédée d'une capture avant de TOUTES les cibles affectées (vérifiées non-vides et correctement dimensionnées) — aucune mutation n'a commencé sur un sous-ensemble pilote.
- **SC-005**: Chaque composant du fichier Figma a un statut explicite et nommé (contractualisé, exclu avec motif, ou doublon) — aucun composant orphelin non décidé ne subsiste.
- **SC-006**: Les 4 organismes complexes sont exclus avec motif **par organisme** (reflétant les capacités réellement non couvertes post-006 : `grid`, `embed`, variants de `repeat` au-delà de 006) et reportés ; les 19 icônes seules sont exclues avec motif nommé (instances, pas composants) ; le doublon `Bouton` est exclu avec motif nommé (doublon de `ds.button`).
- **SC-007**: Les cas d'évals quarantainés activables du fait de cette itération sont réactivés selon la règle hybride (définie dans `docs/handoff/09-testing-and-gates.md` et `evals/REMOVED-CASES.md` §Re-enabling a case — retrait nommé) ; les compteurs cités sont synchronisés avec le compte vivant.
- **SC-008**: Aucune valeur non liée à un token n'est laissée silencieusement non liée — chaque unbound value est liée à un token existant ou mintée provisoirement avec rapport (constitution, Principle V).
- **SC-009**: Le registre d'icônes gouverné passe de 16 à **19 entrées** (ExternalLink, Mail, OcticonChevronDown12 ajoutées — icônes déjà présentes sur le canvas Figma) ; le compte vivant affiché par les outils fait foi ; les organismes qui instancient ces icônes ne heurtent aucun gate de refus.

## Assumptions

- **Les propositions existent déjà** : 57 propositions de contrats ont été générées depuis le canvas Figma (extract/out/figma/) ; chacune est un point de départ (anatomie, props, tokens, lié par componentSetKey), pas un contrat fini.
- **Les masters sont issus de 003/005** : les molécules et organismes ont été externalisés et nettoyés par les programmes 003 (externalisation) et 005 (source cleanup) ; l'audit de source (étape 0) peut confirmer qu'ils sont déjà propres et être réutilisé — pas refait.
- **Cette itération est autorisée à éditer le fichier Figma** : contrairement à 004 (lecture seule, coexistence avec 003), 003 et 005 sont clos ; les corrections de source nécessaires (§VIII) sont autorisées, avec capture avant (§X) de toutes les cibles affectées.
- **Réutilisation de l'outillage existant du dépôt, zéro outillage jetable** (règle owner) : extraction, génération, différentiel trois voies, comparaison visuelle passent par l'outillage en place ; toute capacité manquante est ajoutée au bon endroit dans l'outillage commun, réutilisable — jamais en script à côté, jamais en contrat écrit à la main.
- **La chaîne prouvée en 002/004/006 est réutilisée** : extraction depuis le fichier réel → proposition reviewée → contrat → génération → comparaison trois voies → contrôle visuel ; rapprochement par clé de composant, jamais par nom.
- **Règle standing d'archive** : pour chaque composant, l'archive `demo-51` est consultée comme inspiration de structure (voler ou rejeter avec motif nommé, au moment du `/plan`), le nommage restant français côté Figma.
- **Mono-thème, mono-brand** : inchangé — hors périmètre.
- **Ordre d'extraction** : les atomes manquants précèdent les molécules, qui précèdent les organismes (les organismes composent des molécules, qui composent des atomes) ; au sein de chaque couche, l'ordre est par dépendance croissante (les composants sans dépendance d'abord, ceux qui en composent d'autres ensuite).
- **La tolérance visuelle est celle de l'instrument existant du dépôt** ; aucun nouveau seuil n'est défini dans cette itération.
- **Cas d'évals quarantainés** : ceux qui redeviennent activables du fait de cette itération sont réactivés selon la règle hybride ; tout retrait/ajout de cas est nommé et les compteurs re-synchronisés.

### Out of Scope (this iteration)

- **Les 4 organismes complexes** (HeroVideo, ProduitsECommerce, Realisations, CategoriesPrincipales) — capacités non couvertes par le moteur actuel, identifiées **par organisme** : `grid` (grille 2D), `embed` (contenu externe intégré), variants de `repeat` au-delà de ce que 006 a exercé (rangée horizontale à largeurs égales). `repeat + component` est couvert depuis 006. Reportés à une future itération avec motif nommé par organisme.
- **Les 19 icônes seules** — instances, pas composants à contracter ; relèvent du jeu d'icônes gouverné (registre), pas des contrats de composants.
- **Le doublon `Bouton`** (français) — doublon du contrat `ds.button` déjà existant.
- **Multi-thème / multi-brand.**
- **L'extension du jeu d'icônes gouverné** au-delà des 19 entrées atteintes par cette itération (16 existantes + 3 icônes déjà présentes sur le canvas Figma mais non enregistrées — voir FR-014a). Les icônes *nouvelles* (non présentes sur la source Figma) restent hors périmètre.
- **La vérification automatique « catégorie du contrat ↔ page Figma du master »** — bonus ultérieur nommé, non implémenté cette itération.

### Dependencies

- **Les acquis de 003 (close)** : les masters externalisés des molécules et organismes, avec leurs audits de source.
- **Les acquis de 005 (close)** : le nettoyage de source Figma (structure, contraintes, branchements de variables).
- **Les acquis de 002/004/006 (close)** : la chaîne d'extraction/génération/parité prouvée, le Button et les 4 atomes finalisés, le jeu d'icônes gouverné (16 entrées, porté à 19 par FR-014a cette itération), la notion de catégorie (atom/molecule/section).
- **Les 57 propositions générées depuis le canvas** : points de départ pour la contractualisation, à reviewer (notes, unbound values) avant copie en contrats.
- **L'outillage du dépôt réutilisé en place** : extraction, génération, différentiel trois voies, comparaison visuelle, Storybook, Contract Hub, catalog.
- **Accès à la source Figma Piqueray** (lecture pour l'extraction, écriture pour les corrections de source §VIII avec capture avant §X).