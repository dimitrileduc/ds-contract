# Feature Specification: Externalisation des maquettes Piqueray — ~35 blocs recopiés → composants gouvernés, preuve zéro-pixel

**Feature Branch**: `003-externalize-figma-components`  
**Created**: 2026-07-23  
**Status**: Draft  
**Input**: User description: "Externaliser les ~34 blocs recopiés à la main dans les 9 maquettes Piqueray (sections, molécules, atomes) en composants Figma propres, gouvernés et réutilisables, remplacer les copies par des instances, et le prouver au pixel près sur les 9 maquettes à chaque étape. C'est du nettoyage Figma pur — le figma→code est une phase ultérieure séparée. Ces maquettes sont la preuve sur un vrai fichier client : une source propre est le préalable obligatoire à toute contractualisation future."

## Clarifications

### Session 2026-07-23

- Q: Seuil « zéro pixel » — quelle est la définition chiffrée de « identique » (strict 0 vs tolérance anti-aliasing) ? → A: « Identique » = **0 pixel réellement différent** après neutralisation du bruit d'anti-aliasing (tolérance de couleur par pixel absorbant uniquement le ré-échantillonnage, ex. `threshold` pixelmatch ≈ 0,1). Le compte de pixels différents au-delà de ce bruit doit être 0 ; tout pixel au-delà est un écart à chiffrer, expliquer et faire accepter explicitement par l'owner.
- Q: Composants inférés (Review-card, gallery-item, icône étoile) — dans le périmètre ou écartés jusqu'à confirmation visuelle ? → A: **Fermement dans le périmètre** — l'owner les confirme (l'owner EST l'autorité de confirmation) ; pas de passe visuelle bloquante préalable. Ils sont externalisés comme tout autre bloc (construits propres, localisés par position). Si l'un ne peut pas être localisé dans le fichier au moment de l'externalisation, c'est reporté (FR-018), jamais abandonné en silence.
- Q: Cadence de validation owner — bloquante par composant, groupée par niveau, ou hybride ? → A: **Hybride** — bloquante par composant pour les net-new (Input/Textarea/Select/Checkbox, icônes) et les inférés (Review-card, gallery-item, icône étoile) ; groupée par niveau (atomes → molécules → sections) pour les extractions simples. Le gate pixel automatisé reste le filet à chaque adoption.
- Q: Où vit la trace auditable des acceptations owner (écarts pixel + validations de masters) ? → A: **Un journal de décisions versionné dans le repo** (ex. `specs/003-externalize-figma-components/decisions.md`) — chaque validation de master et chaque écart pixel accepté y est consigné (composant, date, verdict, écart chiffré + raison), commité dans git ; les gestes Figma n'étant pas dans git, c'est le support relisible en revue. Les points de restauration Figma (FR-017) couvrent le versant checkpoint.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Preuve mesurée qu'aucun pixel n'a bougé sur les 9 maquettes (Priority: P1)

L'owner veut, après chaque externalisation, la preuve **mesurée** — pas à l'œil — qu'aucune des 9 maquettes n'a changé d'un seul pixel. C'est la garantie qui rend la démarche digne de confiance sur un vrai fichier client.

**Why this priority**: Le risque maximal est concentré dans l'**adoption** (remplacer une copie dessinée à la main par une instance) — c'est là qu'un pixel peut bouger. Sans preuve mesurée à chaque étape, les composants créés ne valent rien : toute la confiance repose sur « le client reconnaît son fichier au pixel près ». C'est la valeur différenciante de l'itération.

**Independent Test**: Sur un bloc déjà externalisé, on capture l'état des 9 maquettes avant et après l'adoption, on les compare par mesure, et on obtient un verdict par maquette (identique, ou écart chiffré). La comparaison lit l'état **réel du canevas live** — les 9 maquettes vivent sur une page locale invisible à l'état « serveur ».

**Acceptance Scenarios**:

1. **Given** un bloc vient d'être adopté (copie → instance) sur les 9 maquettes, **When** la comparaison avant/après s'exécute, **Then** chaque maquette est déclarée identique au pixel, ou tout écart est chiffré et présenté à l'owner.
2. **Given** un écart est détecté sur une maquette, **When** il n'est pas expliqué et explicitement accepté par l'owner, **Then** l'étape est un échec — l'adoption n'est pas considérée comme « faite ».
3. **Given** une capture échoue ou revient vide (ex. bloc clippé ou hors-canvas), **When** la comparaison s'exécute, **Then** la capture vide n'est **jamais** comptée comme « identique » — l'échec de capture est signalé explicitement.

---

### User Story 2 - Les copies deviennent des composants gouvernés, les maquettes sont pilotées par des instances (Priority: P1)

L'owner veut que chaque bloc recopié à la main (Footer ×9, Hero ×8, Devis ×8, formulaire, FAQ, cartes, réassurances…) devienne un composant propre et gouverné, et que les 9 maquettes soient pilotées par des **instances** de ces composants — pour que la design system cesse d'être pauvre et devienne maintenable.

**Why this priority**: C'est le résultat même de l'itération : ~35 blocs aujourd'hui dessinés page par page deviennent une bibliothèque de masters, et les maquettes deviennent des assemblages d'instances. Sans cela, le fichier reste une collection de copies impossibles à maintenir.

**Independent Test**: Pour un bloc donné, un master propre existe, et un scan des 9 maquettes montre que chaque copie brute de ce bloc a été remplacée par une instance du master — zéro copie brute restante.

**Acceptance Scenarios**:

1. **Given** un bloc identifié dans l'inventaire, **When** il est externalisé, **Then** un master unique existe et toutes ses occurrences dans les 9 maquettes sont des instances de ce master.
2. **Given** le nom Figma `item` recouvre 3 molécules distinctes (Accordion-row ~34, Category-card ~15, Reassurance-item ~26), **When** elles sont externalisées, **Then** elles deviennent 3 masters séparés portant chacun un nom vrai — jamais un seul master fourre-tout.
3. **Given** un bloc dépend d'autres blocs (une section contient des molécules, une molécule des atomes), **When** on tente de l'externaliser, **Then** il n'est externalisé qu'après tous les blocs qu'il contient (ordre imposé : tokens → atomes → molécules → sections).
4. **Given** les 5 composants déjà instanciés (Bouton, Header nav, logo, icônes, member-picture — 145 instances), **When** l'externalisation se déroule, **Then** ils ne sont pas re-créés : ils sont exclus du périmètre.

---

### User Story 3 - Chaque composant est construit propre AVANT d'être externalisé (Priority: P2)

En tant que designer, je veux que chaque composant soit construit propre **avant** toute externalisation — nom vrai, couleurs branchées aux variables (pas de valeurs brutes), propriétés officielles (pas de hacks par calques cachés), description — afin de ne jamais modéliser autour d'une source sale.

**Why this priority**: C'est la règle apprise à la dure sur le Button (une source sale a coûté une journée de rework). L'audit de la source — structure du master **et** usage réel de chaque instance, scanné **par position, jamais par nom** — précède la création. Secondaire à la production du résultat, mais c'est le préalable qui en garantit la qualité.

**Independent Test**: Avant qu'un master n'existe, un audit de sa source Figma est produit (structure, contraintes, bindings de variables, tailles, description) ainsi qu'un relevé de son usage réel (chaque instance, par position) ; l'owner valide ; toute anomalie hors périmètre est **proposée** à l'owner, jamais corrigée en silence.

**Acceptance Scenarios**:

1. **Given** un bloc à externaliser, **When** on prépare son master, **Then** ses couleurs sont branchées à des variables (aucune valeur brute) et ses affordances sont des propriétés officielles (aucun hack par calque caché), avec un nom vrai et une description.
2. **Given** l'audit découvre une anomalie hors périmètre, **When** elle est constatée, **Then** elle est proposée à l'owner qui tranche — jamais corrigée en silence.
3. **Given** un bloc « inféré » non nommé dans la maquette (Review-card, gallery-item, icône étoile) mais confirmé dans le périmètre par l'owner, **When** on l'externalise, **Then** il est traité comme tout autre bloc (construit propre, localisé par position) ; s'il est introuvable dans le fichier, c'est reporté, pas abandonné en silence.

---

### User Story 4 - Chaque personnalisation d'instance est retrouvée, nommée, préservée (Priority: P2)

L'owner veut que chaque personnalisation d'une copie (texte propre, icône choisie, image spécifique) soit retrouvée, nommée et préservée quand la copie devient une instance — afin qu'aucune ne soit perdue en silence.

**Why this priority**: Remplacer 9 Footers dessinés à la main par 9 instances d'un master ne doit pas écraser les différences réelles entre pages. Silence = perte de contenu client. La convention d'honnêteté du projet interdit l'omission silencieuse (c'est la classe de bug la plus grave ici).

**Independent Test**: Après adoption, un relevé (ledger) liste chaque personnalisation par instance (texte, icône, image) et chacune est bien présente sur l'instance correspondante ; aucune n'est perdue.

**Acceptance Scenarios**:

1. **Given** une copie porte une personnalisation (texte, icône choisie, image), **When** elle devient une instance, **Then** la personnalisation est reportée sur l'instance et inscrite au relevé.
2. **Given** une personnalisation ne peut pas être portée par une propriété du master, **When** on l'adopte, **Then** le manque est signalé explicitement — jamais abandonné en silence.

---

### User Story 5 - Retour arrière intégral si une opération dérape (Priority: P2)

L'owner veut pouvoir revenir intégralement à l'état antérieur du fichier si une opération dérape — afin de ne jamais risquer le vrai fichier client.

**Why this priority**: Les opérations se font **en place** sur un fichier client réel. Un point de restauration avant chaque opération, et un retour arrière intégral, sont le filet de sécurité qui rend la démarche acceptable.

**Independent Test**: Un point de restauration existe avant une opération ; déclencher le retour arrière ramène le fichier exactement à son état antérieur.

**Acceptance Scenarios**:

1. **Given** un point de restauration pris avant une opération, **When** l'opération dérape, **Then** le fichier peut revenir intégralement à l'état d'avant l'opération.
2. **Given** une externalisation est annulée, **When** on relit les 9 maquettes, **Then** elles sont dans l'état exact d'avant l'opération (constaté par la même mesure que la preuve zéro-pixel).

---

### Edge Cases

- **Dépendance non prête** : on tente d'externaliser une section avant que ses molécules (ou une molécule avant ses atomes) n'existent → l'ordre bottom-up est imposé, le bloc n'est pas externalisable tant que ses dépendances ne le sont pas.
- **Page locale invisible au serveur** : les 9 maquettes vivent sur une page locale non synchro « serveur » → la preuve doit lire l'état **réel du canevas live**, pas une vue serveur/REST (qui ne les voit pas).
- **Capture vide** : un bloc clippé ou hors-canvas peut produire une capture vide → une capture vide n'est **jamais** comptée comme « identique » ; l'échec est signalé.
- **Anomalie hors périmètre** : toute anomalie découverte à l'audit (au-delà du bloc traité) est **proposée** à l'owner qui tranche — jamais corrigée en silence.
- **Nom `item` ambigu (~71 nœuds nommés `item` ; ~75 occurrences des 3 molécules en comptant les variantes type `item open` — le scan re-mesuré fait foi, FR-002)** : un même nom Figma recouvre 3 molécules distinctes → elles sont séparées en 3 masters nommés vrais, jamais fusionnées.
- **Blocs inférés** : Review-card, gallery-item (Réalisations) et icône étoile ne sont pas nommés dans les maquettes → **confirmés dans le périmètre par l'owner**, externalisés comme les autres ; si l'un s'avère introuvable dans le fichier au moment de l'externaliser, c'est reporté (FR-018), pas abandonné en silence.
- **Personnalisation non portable** : une perso qu'aucune propriété du master ne peut porter → signalée, jamais abandonnée en silence.
- **Atome manquant** : Input, Textarea, Select, Checkbox et les icônes (sociales, étoile) n'existent pas → créés de zéro (net-new), pas extraits.
- **Frames de positionnement** : `Header nav` et `Footer` apparaissent aussi comme frames brutes autour d'une instance / d'atomes → le Header **est** un composant (ne pas re-créer) ; le Footer non (à externaliser).

## Requirements *(mandatory)*

### Functional Requirements

**Périmètre & inventaire**

- **FR-001**: Le système MUST externaliser en masters propres les ~35 blocs (re-mesure 2026-07-23) aujourd'hui recopiés à la main dans les 9 maquettes (répartis en atomes, molécules, sections), tels qu'énumérés par l'inventaire ; les 5 composants déjà instanciés (Bouton, Header nav, piqueray_logo, member-picture, icônes) MUST être exclus (ne pas re-créer).
- **FR-002**: Les chiffres et la liste de l'inventaire (le « ~34 ») MUST être re-mesurés sur le canevas live **avant** chaque extraction ; les chiffres re-mesurés font foi (le fichier peut bouger entre deux passes).
- **FR-003**: Les atomes manquants (Input, Textarea, Select, Checkbox) et les icônes manquantes (sociales, étoile) MUST être créés de zéro (net-new), et non extraits d'un existant.

**Ordre de construction (bottom-up imposé par les dépendances)**

- **FR-004**: Un bloc MUST n'être externalisé qu'après tous les blocs qu'il contient — l'ordre tokens → atomes → molécules → sections est imposé : aucune section avant ses molécules, aucune molécule avant ses atomes.
- **FR-005**: La fondation de tokens MUST être propre avant que les atomes ne s'y branchent (première étape de l'ordre de construction) ; les odeurs de tokens connues sont traitées comme prérequis, pas contournées.

**Source propre (étape 0, la règle du Button)**

- **FR-006**: Avant la création de tout master, le système MUST produire un audit de sa source Figma couvrant à la fois la **structure** (master : structure, contraintes, bindings de variables, tailles, description) **et** l'**usage** (chaque instance du bloc, sur chaque maquette, scanné **par position, jamais par nom**).
- **FR-007**: Chaque master livré MUST être propre **avant** externalisation : nom vrai, couleurs branchées aux variables (aucune valeur brute), affordances portées par des propriétés officielles (aucun hack par calque caché), et une description.
- **FR-008**: Le nom Figma `item` (qui recouvre Accordion-row, Category-card et Reassurance-item) MUST être résolu en 3 masters distincts portant chacun un nom vrai.
- **FR-009**: Les 3 blocs inférés (Review-card, gallery-item, icône étoile), bien que non nommés dans les maquettes, sont **confirmés dans le périmètre par l'owner** (l'owner est l'autorité de confirmation) — aucune passe visuelle bloquante préalable n'est requise ; ils MUST être externalisés comme tout autre bloc (construits propres, localisés par position). Si l'un ne peut pas être localisé dans le fichier au moment de l'externalisation, ce MUST être reporté (voir FR-018), jamais abandonné en silence.
- **FR-010**: Toute anomalie hors périmètre découverte à l'audit MUST être proposée à l'owner qui tranche — jamais corrigée en silence.

**Adoption (copie → instance)**

- **FR-011**: Chaque copie brute d'un bloc externalisé MUST être remplacée, sur les 9 maquettes, par une instance de son master ; à l'issue, aucune copie brute de ce bloc ne MUST subsister.
- **FR-012**: Chaque personnalisation d'instance (texte, icône choisie, image) MUST être retrouvée, nommée et reportée sur l'instance ; toute personnalisation qu'aucune propriété du master ne peut porter MUST être signalée, jamais abandonnée en silence.
- **FR-013**: Chaque master MUST être validé par l'owner avant son adoption sur les maquettes, selon une cadence **hybride** : validation **bloquante par composant** pour les net-new (Input, Textarea, Select, Checkbox, icônes) et les inférés (Review-card, gallery-item, icône étoile) ; validation **groupée par niveau** (atomes, puis molécules, puis sections) pour les extractions simples. Le gate pixel automatisé (FR-014) reste actif à chaque adoption quelle que soit la cadence.

**Preuve zéro-pixel (le risque max)**

- **FR-014**: Après chaque externalisation/adoption, le système MUST prouver **par mesure** (pas à l'œil) que les 9 maquettes sont identiques avant/après, en lisant l'état **réel du canevas live** (la page locale, invisible à l'état « serveur »). « Identique » = **0 pixel réellement différent** après neutralisation du bruit d'anti-aliasing (tolérance de couleur par pixel absorbant uniquement le ré-échantillonnage ; le nombre de pixels différents au-delà de ce bruit doit être 0).
- **FR-015**: Tout écart pixel détecté (un pixel différant au-delà du bruit d'anti-aliasing défini en FR-014) MUST être chiffré, expliqué et **explicitement accepté par l'owner** ; un écart non expliqué ou non accepté MUST faire échouer l'étape.
- **FR-016**: Une capture qui échoue ou revient vide (bloc clippé / hors-canvas) MUST ne jamais être comptée comme « identique » — l'échec de capture MUST être signalé.

**Retour arrière (filet de sécurité)**

- **FR-017**: Un point de restauration MUST exister avant chaque opération ; en cas d'échec, le fichier MUST pouvoir revenir intégralement à son état antérieur.

**Honnêteté & indépendance**

- **FR-018**: La dégradation MUST être nommée, jamais silencieuse : tout ce que l'audit ou la preuve peut voir mais ne peut pas résoudre (bloc illisible, écart, perso non portable, capture vide) MUST être reporté.
- **FR-019**: Les composants livrés MUST n'avoir aucune dépendance tierce (zéro dépendance externe).

**Traçabilité (trace auditable)**

- **FR-020**: Les décisions de l'owner MUST être consignées dans un **journal de décisions versionné dans le repo** (ex. `specs/003-externalize-figma-components/decisions.md`) : chaque validation de master et chaque écart pixel accepté (composant, date, verdict, écart chiffré + raison), commité dans git. Les gestes Figma n'étant pas dans git, ce journal EST la trace auditable relisible ; les points de restauration Figma (FR-017) en couvrent le versant checkpoint.

### Key Entities *(include if feature involves data)*

- **Les 9 maquettes** : la surface de preuve. 9 pages pleine largeur (1728px) — Accueil, Portes de garage (+ résidentielles / industrielles), Motorisation, Portes d'entrée, Dépannage/SAV, À Propos, Contactez-nous — vivant sur une page locale du fichier, invisible à l'état « serveur ». Elles doivent rester identiques au pixel de bout en bout.
- **Bloc recopié** : un ensemble dessiné à la main, répété page par page (Footer, Hero, Devis, cartes, réassurances, formulaire, FAQ…). Le matériau d'entrée à externaliser (~35, re-mesure 2026-07-23).
- **Master (composant propre)** : le composant gouverné créé pour un bloc — nom vrai, couleurs branchées aux variables, propriétés officielles, description, zéro dépendance tierce.
- **Instance** : une occurrence d'un master posée dans une maquette, remplaçant une copie brute et portant ses personnalisations.
- **Personnalisation** : la valeur propre à une instance (texte, icône choisie, image) — à retrouver, nommer, préserver.
- **Relevé des personnalisations (ledger)** : la liste, par instance, des personnalisations retrouvées et reportées — la preuve qu'aucune n'a été perdue.
- **Audit de source** : le constat, avant création, de la structure d'un bloc **et** de son usage réel (chaque instance, par position) ; supporte la validation owner et le signalement des anomalies.
- **Graphe de dépendances** : l'ordre bottom-up (tokens → atomes → molécules → sections) qui contraint la séquence d'externalisation.
- **Preuve zéro-pixel** : la comparaison mesurée avant/après des 9 maquettes, avec un verdict par maquette (identique / écart chiffré).
- **Point de restauration** : l'état du fichier capturé avant une opération, permettant un retour arrière intégral.
- **Anomalie hors périmètre** : une découverte de l'audit au-delà du bloc traité — proposée à l'owner qui tranche.
- **Journal de décisions** : la trace auditable, versionnée dans le repo, des décisions de l'owner (validations de masters, écarts pixel acceptés + raison, arbitrages d'anomalies) — commité dans git, relisible en revue.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: À chaque externalisation, les 9 maquettes sont identiques avant/après — **mesuré, pas à l'œil** : **0 pixel différent** hors bruit d'anti-aliasing ; tout écart au-delà est chiffré, expliqué et explicitement accepté par l'owner (acceptation consignée au journal de décisions), sinon l'étape est un échec.
- **SC-002**: Les ~35 blocs existent comme masters propres (nom vrai, couleurs aux variables, propriétés officielles, description), chacun validé par l'owner avant son adoption (par composant pour les net-new et inférés, par lot de niveau sinon).
- **SC-003**: Toutes les copies brutes des blocs externalisés sont remplacées par des instances — un scan des 9 maquettes ne montre aucune copie brute restante d'un bloc externalisé.
- **SC-004**: Chaque personnalisation d'instance est retrouvée et nommée au relevé ; aucune n'est perdue (toute perso non portable est signalée, pas abandonnée).
- **SC-005**: En cas d'échec d'une opération, le fichier revient intégralement à son état antérieur.
- **SC-006**: L'ordre de construction est respecté — aucun bloc n'est externalisé avant les blocs qu'il contient.
- **SC-007**: Les 5 composants déjà instanciés (Bouton, Header nav, logo, member-picture, icônes) sont laissés intacts comme masters — non re-créés.
- **SC-008**: Aucune dépendance tierce dans les composants livrés (zéro dépendance externe).
- **SC-009**: Aucune dégradation passée sous silence : chaque bloc illisible, écart, perso non portable ou capture vide figure dans un rapport en langage clair.

## Assumptions

Les points suivants sont des **défauts raisonnables** retenus faute de précision explicite. Ceux qui portaient une décision ont été tranchés par `/speckit.clarify` (voir la section **Clarifications** en tête de spec) ; les choix d'organisation restants sont listés sous **Décisions différées à `/speckit.plan`** plus bas.

- **Seuil « zéro pixel »** (tranché — voir Clarifications) : « identique » = **0 pixel réellement différent** après neutralisation du bruit d'anti-aliasing (tolérance de couleur par pixel absorbant uniquement le ré-échantillonnage) ; tout pixel différent au-delà est expliqué et explicitement accepté par l'owner, sinon l'étape échoue.
- **Une seule spec de programme** : cette spec couvre les ~35 blocs et est exécutée en incréments dans l'ordre des dépendances (tokens → atomes → molécules → sections), plutôt qu'une spec par niveau.
- **Granularité par défaut** : un composant = un incrément ; les atomes net-new de formulaire (Input / Textarea / Select / Checkbox), qui ne remplacent aucune copie existante, peuvent être groupés.
- **Réorganisation Figma** : les masters existants (Bouton, icônes, logo, member-picture) ne sont **pas** déplacés ni redessinés ; les nouveaux masters sont rangés sur des pages de niveau (Atomes / Molécules / Sections). Aucun redesign — l'existant est préservé au pixel.
- **Blocs inférés fermement dans le périmètre** (tranché — voir Clarifications) : Review-card, gallery-item et icône étoile sont confirmés en scope par l'owner ; pas de passe visuelle bloquante. Ils sont externalisés comme les autres ; tout bloc introuvable au moment de l'externalisation est reporté (FR-018).
- **Validation owner hybride** (tranché — voir Clarifications) : bloquante par composant pour les net-new et les inférés ; groupée par niveau pour les extractions simples. Le gate pixel automatisé reste actif à chaque adoption.
- **Lecture du canevas live** : l'état réel des 9 maquettes est lu directement dans le fichier live (la page locale `Pages` étant invisible aux vues serveur/REST). Le mécanisme exact relève de `/speckit.plan`.
- **Inventaire de référence** : `COMPONENT-INVENTORY.md` est la liste de travail (atomes / molécules / sections + graphe de dépendances), re-mesurée avant chaque extraction.
- **Rollback = historique natif** : le retour arrière s'appuie sur l'historique de versions natif du fichier (aucun mécanisme de restauration programmatique n'est supposé exister).

### Décisions différées à `/speckit.plan`

Ces choix sont d'organisation / d'exécution — ils ne changent ni le périmètre livré, ni les tests d'acceptation, ni les pixels — et sont donc tranchés au plan, pas ici :

- **Une seule spec de programme, ou une spec par niveau** (fond → sections) ?
- **Granularité des incréments** : 1 composant = 1 incrément partout, ou grouper les créations net-new (atomes de formulaire de la même famille) ?
- **Réorganisation Figma** : déplacer aussi les masters existants (Bouton, icônes) vers les pages de niveau — housekeeping sans impact pixel (déplacer un master ne bouge pas ses instances), donc non bloquant pour cette spec.

Les autres points sont tranchés dans la section **Clarifications** (en tête de spec).

### Out of Scope (this iteration)

- Le **figma → code** : contrats, génération, gates déterministes. C'est une phase ultérieure, séparée. Cette itération est du nettoyage Figma pur.
- Toute **extension du DS** au-delà de ce que les 9 maquettes utilisent.
- Toute **refonte de design** : l'existant est préservé au pixel (aucune amélioration visuelle).
- La **re-création** des 5 composants déjà instanciés.

### Dependencies

- Accès au **fichier Figma live** `Piqueray (Copy)` et à sa page locale `Pages` (les 9 maquettes), lisible via le pont desktop.
- `COMPONENT-INVENTORY.md` comme inventaire de travail, re-mesuré avant chaque extraction.
- L'**historique de versions natif** de Figma comme mécanisme de points de restauration / retour arrière.
- Une **fondation de tokens propre** comme base de l'ordre de construction (odeurs connues à traiter en premier : `orange-12/42` mintés, `space` / `radius` nommés par valeur). `nav/state` en STRING est le mécanisme interne du Button — exclu du périmètre (FR-001) : son **report** est arbitré par l'owner (2026-07-23), l'entrée formelle au journal reste due en phase T (T027) ; à traiter dans la spec Button (002).
