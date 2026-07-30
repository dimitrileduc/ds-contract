# Feature Specification: Auditer la fidélité des organismes

**Feature Branch**: `013-auditer-fidelite-organismes`  
**Created**: 2026-07-29  
**Status**: Planned — plan, research, data-model, contracts, quickstart et tasks produits ; analyse de cohérence passée le 2026-07-30  
**Input**: User description: "Objectif : auditer et prouver la fidélité Figma → contrats → code des 12 organismes déjà générés. Ordre prévu : 1. Coordonnees, Devis, Hero, Presentation, SAV, TexteSEO. 2. FAQ, Footer, Reassurances. 3. Equipe, Formulaire, Header — après leurs dépendances encore bloquées : MemberCard, Field et NavItem. Hors périmètre : conversion des 89 valeurs en dur et autres corrections globales de tokens, reportées à plus tard."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Établir la première vague de preuves (Priority: P1)

En tant que responsable du design system, je veux auditer Coordonnees, Devis, Hero, Presentation, SAV et TexteSEO avant les autres organismes afin de disposer rapidement de six preuves complètes reliant la référence Figma, le contrat et le rendu généré.

**Why this priority**: Ces six organismes ne dépendent pas des trois molécules encore bloquées et constituent la première vague explicitement prioritaire.

**Independent Test**: Un réviseur peut ouvrir le dossier de preuve de chacun des six organismes, suivre chaque fait observé de Figma jusqu'au contrat puis au rendu généré, et vérifier le verdict associé.

**Acceptance Scenarios**:

1. **Given** l'un des six organismes de la première vague, **When** son audit est terminé, **Then** son dossier de preuve relie explicitement sa référence Figma, les faits de son contrat et le rendu généré correspondant.
2. **Given** un fait visuel, structurel ou de contenu observé dans Figma, **When** il est comparé au contrat et au rendu, **Then** il est soit démontré conforme, soit décrit comme un écart ou une limite nommée.
3. **Given** une comparaison obligatoire de la première vague, **When** elle est examinée, **Then** la référence et le rendu contiennent tous deux un signal utile et permettent à un réviseur de contrôler le verdict.

---

### User Story 2 - Étendre la preuve aux organismes indépendants suivants (Priority: P2)

En tant que responsable du design system, je veux auditer FAQ, Footer et Reassurances après la première vague, afin de poursuivre la campagne dans un ordre connu sans mélanger des dépendances encore non résolues.

**Why this priority**: Ces trois organismes sont la deuxième vague définie par l'objectif et peuvent être évalués sans attendre MemberCard, Field ou NavItem.

**Independent Test**: Les trois dossiers de preuve de la deuxième vague peuvent être revus séparément avec les mêmes critères de traçabilité et de fidélité que la première vague.

**Acceptance Scenarios**:

1. **Given** les audits de la première vague clôturés ou honnêtement signalés, **When** FAQ, Footer ou Reassurances est audité, **Then** son résultat ne dépend pas d'un verdict implicite d'une molécule encore bloquée.
2. **Given** une divergence entre Figma, le contrat et le rendu généré, **When** elle est identifiée, **Then** sa source est localisée dans la chaîne et la conclusion ne peut pas être présentée comme une fidélité prouvée.

---

### User Story 3 - Auditer les organismes composés une fois leurs prérequis validés (Priority: P3)

En tant que responsable du design system, je veux auditer Equipe, Formulaire et Header seulement après la résolution de MemberCard, Field et NavItem, afin qu'une preuve de leurs compositions ne masque pas une divergence de dépendance connue.

**Why this priority**: La fidélité d'un organisme composé inclut celle de ses éléments imbriqués ; conclure avant leur validation produirait un faux vert.

**Independent Test**: Après validation des prérequis, un réviseur vérifie pour chaque organisme composé la trace de sa dépendance et la fidélité de sa propre structure, de son contenu et de son rendu.

**Acceptance Scenarios**:

1. **Given** MemberCard n'a pas de verdict positif et probant, **When** Equipe est examiné, **Then** Equipe ne peut pas recevoir de verdict final positif.
2. **Given** Field n'a pas de verdict positif et probant, **When** Formulaire est examiné, **Then** Formulaire ne peut pas recevoir de verdict final positif.
3. **Given** NavItem n'a pas de verdict positif et probant, **When** Header est examiné, **Then** Header ne peut pas recevoir de verdict final positif.
4. **Given** le prérequis concerné est validé, **When** l'organisme composé est audité, **Then** la preuve couvre à la fois la composition et les faits propres à l'organisme.

---

### User Story 4 - Disposer d'une conclusion honnête et exploitable (Priority: P1)

En tant que mainteneur, je veux un rapport de campagne qui permet de savoir rapidement quels organismes sont prouvés, lesquels sont bloqués et pourquoi, afin que les chantiers ultérieurs puissent partir de faits vérifiables plutôt que d'une impression de parité.

**Why this priority**: Un résultat silencieux ou agrégé pourrait confondre une absence de preuve, une limite déclarée et une fidélité établie.

**Independent Test**: Un réviseur peut retrouver les 12 organismes dans le rapport, vérifier leur ordre de traitement, leur verdict et la preuve ou le blocage qui le justifie sans inspecter le code source.

**Acceptance Scenarios**:

1. **Given** un organisme sans preuve complète, **When** le rapport est publié, **Then** il est affiché comme non prouvé ou bloqué avec sa cause précise, jamais comme conforme par défaut.
2. **Given** une limite reconnue de la chaîne de fidélité, **When** elle empêche une comparaison ou une conclusion, **Then** la limite, son organisme affecté et son effet sur le verdict sont nommés.
3. **Given** une divergence relevant d'une valeur en dur inventoriée ou d'une correction globale de tokens, **When** elle est rencontrée, **Then** elle est enregistrée comme travail reporté sans conversion ni correction globale dans cette fonctionnalité.

### Edge Cases

- Un organisme existe dans Figma, le contrat ou le code mais pas sur l'une des deux autres surfaces : sa chaîne de preuve est incomplète et son verdict ne peut pas être positif.
- La référence Figma ou le rendu généré est vide, invisible, non comparable ou ne représente pas le même contenu : le cas est non probant et ne peut pas être assimilé à une conformité.
- Une instance diffère de son master par une surcharge légitime : la surcharge doit être distinguée du fait du master et tracée jusqu'à son contrat ou être nommée comme limite.
- Une dépendance déjà identifiée reste bloquée : l'organisme composé conserve un verdict bloqué ; l'absence de test ne vaut pas validation.
- Une correction proposée exigerait de convertir une valeur en dur inventoriée, de modifier une fondation de tokens ou d'affecter plusieurs composants hors cible : elle est reportée et documentée, sans étendre le périmètre.
- Une comparaison agrégée semble positive alors qu'un fait couvert ne l'est pas : le fait divergent prévaut et l'organisme reste non prouvé.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La campagne MUST couvrir exactement les 12 organismes déjà générés : Coordonnees, Devis, Hero, Presentation, SAV, TexteSEO, FAQ, Footer, Reassurances, Equipe, Formulaire et Header.
- **FR-002**: La campagne MUST traiter les organismes dans trois vagues ordonnées : d'abord Coordonnees, Devis, Hero, Presentation, SAV et TexteSEO ; ensuite FAQ, Footer et Reassurances ; enfin Equipe, Formulaire et Header.
- **FR-003**: Pour chaque organisme, l'audit MUST établir une chaîne de traçabilité explicite entre la référence Figma, les faits pertinents du contrat et le rendu généré.
- **FR-004**: Chaque fait audité MUST recevoir l'un des résultats explicites suivants : conforme et prouvé, divergent avec une source localisée, limite nommée, ou non prouvé faute de preuve comparable.
- **FR-005**: Un organisme MUST recevoir un verdict positif uniquement lorsque tous ses faits obligatoires et toutes ses compositions obligatoires sont reliés à une preuve inspectable sans divergence non résolue.
- **FR-006**: Une preuve de fidélité MUST permettre de contrôler la présence du contenu utile, la structure visible, les propriétés observables, la composition, le résultat visuel et les assertions sémantiques de l'organisme concerné — chaque assertion sémantique citant le pointeur contractuel qui la gouverne. Ces six catégories de faits (contenu, structure, propriété, composition, visuel, sémantique) sont celles que la campagne classe et couvre.
- **FR-007**: Toute comparaison utilisée pour un verdict positif MUST porter sur des entrées équivalentes et conservant un signal utile des deux côtés ; une capture vide, masquée, invisible ou non équivalente MUST être déclarée non probante.
- **FR-008**: Chaque divergence MUST être attribuée à Figma, au contrat, au rendu généré, à une dépendance ou à une limite de comparaison ; une simple différence constatée sans localisation ne suffit pas au rapport final.
- **FR-009**: Figma MUST rester une référence consultée en lecture seule pendant la campagne ; aucune preuve ne peut être obtenue par mutation, remplacement ou écrasement de la référence.
- **FR-010**: Les sorties générées MUST NOT être corrigées directement ; toute correction nécessaire à la fidélité MUST préserver le contrat comme source gouvernante et permettre une régénération reproductible.
- **FR-011**: L'audit d'Equipe MUST attendre un verdict positif et probant de MemberCard ; à défaut, Equipe MUST être signalé bloqué sans conclusion positive.
- **FR-012**: L'audit de Formulaire MUST attendre un verdict positif et probant de Field ; à défaut, Formulaire MUST être signalé bloqué sans conclusion positive.
- **FR-013**: L'audit de Header MUST attendre un verdict positif et probant de NavItem ; à défaut, Header MUST être signalé bloqué sans conclusion positive.
- **FR-014**: Le rapport de campagne MUST présenter un dossier de preuve et un verdict individuel pour chacun des 12 organismes, ainsi qu'une synthèse des preuves, divergences, limites et blocages.
- **FR-015**: Toute limite, dégradation, vérification absente ou dépendance non résolue MUST être nommée avec l'organisme affecté et son effet sur le verdict ; aucune absence de donnée MUST être assimilée à une conformité.
- **FR-016**: La fonctionnalité MUST NOT convertir vers des liaisons de tokens les valeurs en dur des contrats recensées par l'inventaire de baseline de la campagne. Cet inventaire vivant est la seule autorité de périmètre : aucun nombre recopié en prose ne peut le remplacer ni masquer un écart d'inventaire — le « 89 » nommé par la spec 012 reste une référence historique datée, jamais un compte vérifié.
- **FR-017**: La fonctionnalité MUST NOT engager de correction globale de tokens, de fondation de tokens ou de règles partagées au-delà du minimum strictement nécessaire pour constater et documenter un écart.
- **FR-018**: Lorsqu'un écart relève de FR-016 ou FR-017, la campagne MUST le consigner dans le rapport de travail reporté sans modifier son périmètre ni présenter l'organisme concerné comme fidèlement prouvé.
- **FR-019**: La conclusion finale MUST distinguer sans ambiguïté les organismes positivement prouvés, les organismes divergent, les organismes limités et les organismes bloqués par une dépendance.
- **FR-020**: Une valeur en dur portée par un contrat **enfant** composé par un organisme cible MUST être traitée comme relevant du périmètre uniquement lorsqu'elle cause une divergence observée sur cet organisme ; elle est alors consignée en travail reporté en nommant le contrat porteur et son pointeur. Une valeur en dur d'un enfant qui ne produit aucune divergence observée MUST NOT être recensée comme constat de la campagne, et son absence de recensement MUST NOT être présentée comme une preuve de fidélité.

### Key Entities

- **Organisme cible**: L'un des 12 composants de section déjà générés soumis à l'audit, avec sa référence Figma, son contrat, son rendu généré et son verdict propre.
- **Fait audité**: Une propriété observable, un élément de structure, un contenu, une composition ou un résultat visuel qui doit être traçable entre les trois surfaces.
- **Chaîne de fidélité**: La relation vérifiable Figma → contrat → rendu généré d'un fait audité.
- **Dossier de preuve**: L'ensemble inspectable des références, comparaisons, traces et verdicts permettant à un réviseur d'évaluer un organisme sans inférence implicite.
- **Dépendance bloquante**: MemberCard, Field ou NavItem lorsqu'elle ne possède pas encore de verdict positif et empêche respectivement la conclusion d'Equipe, Formulaire ou Header.
- **Verdict d'audit**: La conclusion individuelle d'un organisme — prouvé, divergent, limité, non prouvé ou bloqué — accompagnée de sa justification.
- **Travail reporté**: Un écart correctement identifié mais hors périmètre, notamment la conversion d'une valeur en dur inventoriée ou une correction globale de tokens.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Les 12 organismes sur 12 possèdent un dossier de preuve individuel, un verdict explicite et une place dans la synthèse de campagne.
- **SC-002**: 100 % des faits obligatoires retenus pour chaque organisme positivement prouvé disposent d'une trace Figma, d'un fait contractuel correspondant, d'un rendu généré comparable et d'une preuve inspectable.
- **SC-003**: 100 % des organismes positivement prouvés satisfont tous les critères de fidélité de la campagne ; 0 organisme avec divergence non résolue, limite non nommée, preuve non probante ou dépendance bloquée n'est annoncé conforme.
- **SC-004**: Les trois vagues sont consignées dans l'ordre prévu, et 100 % des verdicts d'Equipe, Formulaire et Header indiquent la validation ou le blocage de leur dépendance respective.
- **SC-005**: 0 valeur en dur de l'inventaire de baseline n'est convertie et 0 correction globale de tokens n'est introduite par cette fonctionnalité, prouvé par le diff typé entre l'inventaire de baseline et celui de clôture.
- **SC-006**: Un réviseur peut retrouver, pour chacun des 12 organismes, sa référence, ses preuves et la cause de son verdict en moins de 10 minutes à partir du rapport de campagne.
- **SC-007**: 100 % des limites, divergences et travaux reportés relevés par la campagne sont nommés avec leur organisme affecté et leur impact sur le verdict.
- **SC-008**: 0 mutation de la référence Figma et 0 retouche directe d'une sortie générée ne sont attribuables à la campagne.

## Assumptions

- Les 12 organismes listés sont déjà générés et disposent chacun d'une référence Figma, d'un contrat et d'un rendu généré qui peuvent être inspectés.
- La fidélité attendue couvre les faits observables et les compositions pertinents pour l'organisme ; les limites connues restent acceptables uniquement si elles sont nommées et empêchent un faux verdict positif.
- Les critères de comparaison déjà établis dans le dépôt restent la référence pour décider qu'une preuve visuelle est probante ; la présente fonctionnalité ne les assouplit pas.
- MemberCard, Field et NavItem restent les seules dépendances bloquantes explicitement connues pour la troisième vague au démarrage.
- Les écarts purement locaux, dont la cause est établie sans élargir le chantier, peuvent être traités selon les règles de gouvernance ; les corrections globales demeurent reportées.

## Out of Scope

- Convertir vers des liaisons de tokens les valeurs en dur des contrats recensées par l'inventaire de baseline.
- Corriger, compléter, renommer ou restructurer globalement les tokens, leur fondation ou leurs règles partagées.
- Auditer des composants autres que les 12 organismes nommés, sauf la vérification du verdict des trois dépendances explicitement bloquantes.
- Déclarer Equipe, Formulaire ou Header conforme avant la validation probante de MemberCard, Field ou NavItem.
- Modifier le fichier Figma de référence ou retoucher directement des sorties générées.
- Étendre l'audit à l'assemblage des pages, au comportement responsive ou à des fonctionnalités non représentées par les 12 organismes.

## Dependencies

- Références Figma accessibles en lecture seule pour les 12 organismes et leurs cas représentatifs.
- Contrats et rendus générés correspondants, disponibles pour inspection et régénération.
- Verdicts positifs et probants de MemberCard, Field et NavItem avant les conclusions finales d'Equipe, Formulaire et Header.
- Les mécanismes existants de comparaison, de parité et de validation, employés pour établir les preuves sans modifier leur intention ni masquer leurs résultats.
