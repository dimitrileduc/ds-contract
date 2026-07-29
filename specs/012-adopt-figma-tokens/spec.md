# Feature Specification: Adopter les tokens Figma manquants — parité complète

**Feature Branch**: `012-adopt-figma-tokens`
**Created**: 2026-07-29
**Status**: Draft
**Input**: User description: "Le problème — Figma a 139 tokens, le dépôt en a 62. Le contrôle de parité compare le code à une photo incomplète : il ne peut pas signaler ce qu'il ne voit pas. C'est un angle mort, pas une erreur. Ce qu'on adopte — 29 primitives (couleurs, tailles de police, interlignes, espacements, rayons) + 48 tokens sémantiques de typographie (typography/titre-1…6, lead, libelle-bouton, paragraphe…). Ces 48 sont des alias vers les primitives — j'ai vérifié : zéro alias cassé après adoption. Ce qu'on ne fait pas — Convertir les 89 valeurs en dur des contrats. Vérification — aucun nouveau contrôle : le build refuse déjà un contrat pointant un token inexistant. Parity compare tokens ↔ Figma. Le golden prouve octet par octet ce qui change. Rien à ajouter. Dégradation : impossible par construction — les valeurs sont identiques (25px reste 25). Le golden ne devrait montrer que src/styles/tokens.css enrichi. S'il montre autre chose, c'est un signal d'alarme. Durée : ~30 minutes, vérification comprise. Résultat : parity compare enfin du complet à du complet. Et les tokens deviennent disponibles pour supprimer les valeurs en dur des contrats — quand tu voudras."

## Clarifications

### Session 2026-07-29

- Q: Quelle est la liste blanche des surfaces générées autorisées à changer, sachant que le script de tokens Figma est lui aussi généré depuis la fondation et épinglé à l'octet ? → A: `src/styles/tokens.css` + `figma-sync/01-tokens.js` + le re-pin de ces deux entrées dans la preuve octet par octet ; toute autre surface identique à l'octet, sinon alarme + arrêt.
- Q: Quelle est la source de vérité du re-relevé, sachant que l'axe tokens de la parité lit un cliché commité (62 variables) et non le fichier Figma vivant ? → A: le cliché de variables Figma est rafraîchi en lecture depuis le fichier vivant **et commité** dans cette fonctionnalité ; il devient la référence des 139 et la preuve que la parité voit le complet.
- Q: Ajouter une feuille (ex. `line-height`) à un groupe de typographie existant viole-t-il l'additivité stricte de FR-003 ? → A: non — « additif » se mesure **à la feuille**. Ajouter une feuille à un groupe existant est autorisé ; modifier, renommer ou supprimer une feuille existante reste interdit.
- Q: Comment démontrer qu'un token adopté est liable, sans ajouter de contrôle, sans convertir de valeur en dur et sans faire bouger un composant généré ? → A: par un contrat d'essai **temporaire et non commité** liant un token adopté, validé par le build pendant l'implémentation, reçu consigné dans le dossier de spec, puis retiré.
- Q: Où atterrissent les comptes re-relevés, les limites nommées et le reçu du contrat d'essai temporaire ? → A: dans un **rapport d'adoption commité** sous le dossier de spec — comptes avant/après, liste nommée des 77 feuilles, limites nommées, reçu du contrat d'essai, diff attendu des deux surfaces de la liste blanche.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Combler l'angle mort du contrôle de parité (Priority: P1)

En tant que responsable du design system, je veux que la fondation de tokens du dépôt porte l'intégralité des 139 tokens gouvernés dans Figma, afin que le contrôle de parité compare du complet à du complet et puisse enfin signaler une divergence sur n'importe quel token — y compris les 77 qu'il ne voyait pas.

**Why this priority**: C'est le problème nommé. Tant que le dépôt ne connaît que 62 tokens sur 139, la parité travaille sur une photo incomplète : elle ne peut pas signaler ce qu'elle ne voit pas. L'angle mort n'est pas une erreur du contrôle — c'est un manque de matière, et seule l'adoption le comble.

**Independent Test**: Après adoption, un réviseur dénombre les **feuilles** des deux côtés — fondation du dépôt et cliché Figma rafraîchi —, constate l'égalité des ensembles (139 ↔ 139), puis vérifie que le rapport de parité couvre désormais chacune des 77 feuilles adoptées.

**Acceptance Scenarios**:

1. **Given** les 77 tokens manquants adoptés dans la fondation du dépôt, **When** le contrôle de parité est exécuté, **Then** son axe tokens compare l'ensemble Figma complet à un ensemble dépôt de même couverture, sans token Figma invisible.
2. **Given** l'adoption terminée, **When** les deux ensembles sont dénombrés par la même méthode, **Then** les comptes sont égaux et chaque token Figma a son correspondant dans le dépôt.
3. **Given** une divergence future sur l'un des 77 tokens nouvellement adoptés (valeur modifiée côté Figma), **When** la parité est exécutée, **Then** la divergence est signalée — elle n'est plus dans l'angle mort.

---

### User Story 2 - Prouver la non-dégradation par construction (Priority: P1)

En tant que mainteneur du dépôt, je veux que l'adoption soit strictement additive et à valeurs identiques, afin que les seules traces observables soient les **surfaces de tokens de la liste blanche** — et que toute autre trace soit traitée comme un signal d'alarme, jamais acquittée en silence.

**Why this priority**: La promesse « dégradation impossible par construction » n'a de valeur que prouvée. La preuve octet par octet existante doit montrer exactement le changement attendu et rien d'autre ; c'est elle qui transforme « les valeurs sont identiques » en fait vérifié.

**Independent Test**: Un réviseur régénère toutes les sorties après adoption, compare octet par octet à l'état antérieur, et constate que seules les surfaces de tokens de la liste blanche se sont enrichies — aucun composant généré, aucun autre script de sync, aucun catalogue n'a bougé.

**Acceptance Scenarios**:

1. **Given** l'adoption appliquée, **When** toutes les sorties sont régénérées et comparées octet par octet, **Then** seules les surfaces de tokens de la liste blanche sont enrichies ; toute autre surface est identique à l'octet près.
2. **Given** un écart apparaissant hors de la liste blanche des surfaces de tokens, **When** la preuve est revue, **Then** l'écart est traité comme un signal d'alarme : l'adoption s'arrête jusqu'à explication nommée — jamais d'acquittement silencieux.
3. **Given** les 62 feuilles existantes, **When** l'adoption est auditée, **Then** aucune n'a été modifiée, renommée ou supprimée — l'ajout d'une feuille nouvelle à un groupe existant n'étant pas une modification.
4. **Given** les 48 feuilles sémantiques de typographie adoptées, **When** leurs alias sont résolus, **Then** chacune aboutit à une primitive existante — zéro alias cassé.

---

### User Story 3 - Rendre les tokens disponibles pour le dé-durcissement futur (Priority: P2)

En tant qu'auteur de contrat, je veux pouvoir lier n'importe lequel des 77 tokens adoptés depuis un contrat, afin que la suppression des 89 valeurs en dur devienne possible plus tard — sans qu'aucune conversion n'ait lieu dans cette itération.

**Why this priority**: C'est le bénéfice différé nommé dans la demande (« quand tu voudras »). L'adoption ouvre la porte ; la conversion des valeurs en dur est un chantier ultérieur, explicitement hors périmètre ici.

**Independent Test**: Un réviseur lie un token adopté depuis un contrat d'essai temporaire non commité et constate que le build l'accepte ; il lie un token inexistant et constate que le build le refuse par son nom — la porte existante, inchangée. Le contrat d'essai est retiré, `contracts/` reste intact.

**Acceptance Scenarios**:

1. **Given** un contrat pointant l'un des 77 tokens adoptés, **When** le build est exécuté, **Then** la liaison est acceptée.
2. **Given** un contrat pointant un token toujours inexistant, **When** le build est exécuté, **Then** la liaison est refusée en nommant le token — comportement existant, non modifié.
3. **Given** les 89 valeurs en dur des contrats, **When** la fonctionnalité est close, **Then** aucune n'a été convertie en liaison de token.

---

### Edge Cases

- Le relevé Figma a bougé depuis l'audit (139 n'est plus 139, ou la liste des 77 a changé) : le cliché est rafraîchi au démarrage, les comptes sont re-relevés depuis lui et la liste des manquants est recalculée — jamais d'adoption en aveugle sur des chiffres périmés.
- Le rafraîchissement du cliché est impossible (fichier Figma inaccessible, pont indisponible) : arrêt nommé — l'adoption ne démarre pas sur le cliché périmé, car la parité continuerait alors de comparer 62 à 62 en se déclarant propre.
- Le relevé frais ne porte plus une entrée dont un eval existant dépend nommément (le cliché est une entrée de la suite d'évaluations, pas seulement du differ) : arrêt nommé **avant écriture** du cliché, arbitrage §VIII à la source — jamais l'eval réécrit pour absorber l'écart, ce qui reviendrait à supprimer une porte au lieu d'en traiter la cause.
- Une des 62 feuilles existantes a disparu ou été renommée côté Figma (les totaux peuvent rester justes par échange) : détecté par la différence d'ensembles dans le sens `dépôt \ cliché`, arrêt nommé et arbitrage à la source — jamais une suppression côté dépôt pour faire coller les comptes.
- Une feuille sémantique du relevé est un **littéral** et non un alias (Figma le permet ; le générateur du dépôt le refuse) : elle est écrite comme alias si sa valeur correspond exactement à une primitive existante ou adoptée — sinon elle n'est pas adoptée et devient une limite nommée, jamais une primitive inventée pour atteindre le compte cible.
- Un des 48 alias pointe une primitive absente de l'ensemble adopté + existant : alias cassé — l'adoption échoue en le nommant ; il n'est jamais résolu par une valeur inventée.
- Un token manquant porte un nom en collision avec un token existant du dépôt pour une valeur différente : conflit nommé et arbitré côté source (d'abord décider si c'est un défaut Figma, §VIII) — jamais d'écrasement silencieux du token existant.
- Un token Figma n'est pas représentable dans la fondation du dépôt (type ou unité non supporté) : limite nommée dans le rapport d'adoption — jamais omise en silence.
- La preuve octet par octet montre un écart hors de la liste blanche des surfaces de tokens : signal d'alarme — arrêt et explication, pas de contournement.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La fondation de tokens du dépôt MUST adopter les 29 primitives manquantes (couleurs, tailles de police, interlignes, espacements, rayons) avec des valeurs strictement identiques au relevé Figma (25px reste 25).
- **FR-002**: La fondation MUST adopter les 48 feuilles sémantiques de typographie manquantes (titres 1…6, lead, libellé-bouton, paragraphe, …) comme alias vers des primitives ; chaque alias MUST se résoudre — zéro alias cassé. Ces 48 feuilles peuvent relever de nouveaux groupes de typographie **ou** compléter un groupe existant par une feuille absente (ex. `line-height`), selon le relevé de démarrage.
- **FR-003**: L'adoption MUST être strictement additive, **l'additivité se mesurant à la feuille** : aucune des 62 feuilles existantes n'est modifiée, renommée ou supprimée. Ajouter une feuille nouvelle à un groupe de typographie existant est autorisé — aucune valeur existante n'en est altérée.
- **FR-004**: Le **cliché de variables Figma** que lit l'axe tokens de la parité MUST être rafraîchi en lecture depuis le fichier Figma vivant, puis commité, au démarrage de l'implémentation ; ce cliché rafraîchi devient la référence unique des comptes. Les comptes (139 côté Figma, 62 côté dépôt, 77 manquants) MUST être re-relevés depuis lui ; en cas de dérive, la liste des manquants MUST être recalculée avant toute adoption. Le re-relevé MUST comparer les deux ensembles **dans les deux sens** — des cardinaux égaux ne prouvent rien, un échange (une feuille perdue, une gagnée) passerait un contrôle de totaux : `dépôt \ cliché` MUST être vide, faute de quoi une feuille gouvernée a disparu côté Figma et l'adoption s'arrête pour arbitrage à la source (§VIII). Le cliché rafraîchi étant également une **entrée de la suite d'évaluations** et non du seul differ, les entrées dont un eval existant dépend nommément MUST être vérifiées survivantes avant écriture ; leur disparition MUST provoquer un arrêt nommé, jamais la réécriture de l'eval.
- **FR-004a**: Le rafraîchissement du cliché est une **entrée capturée**, pas une sortie générée : son évolution (62 → comptes relevés) MUST NOT déclencher le signal d'alarme de FR-007, qui ne porte que sur les sorties générées.
- **FR-005**: Après adoption, le contrôle de parité MUST comparer du complet à du complet **contre le cliché rafraîchi** : chaque token gouverné dans Figma a un correspondant dans le dépôt, et toute divergence future sur l'un des 77 tokens adoptés est signalable.
- **FR-006**: Les seules traces observables de l'adoption sur les sorties générées MUST être l'enrichissement des **surfaces de tokens de la liste blanche** — la feuille de styles de tokens générée et le script de synchronisation des variables Figma généré depuis la même fondation, plus le re-épinglage de ces deux entrées dans la preuve octet par octet ; toutes les autres surfaces générées (composants, autres scripts de synchronisation, catalogue) MUST rester identiques octet pour octet.
- **FR-007**: Tout écart observé hors de la liste blanche des surfaces de tokens MUST être traité comme un signal d'alarme : arrêt et explication nommée — jamais d'acquittement silencieux. Le re-épinglage MUST se limiter aux deux entrées de la liste blanche ; un re-épinglage plus large MUST être refusé.
- **FR-008**: La fonctionnalité MUST NOT ajouter de nouveau contrôle : la vérification repose exclusivement sur les portes existantes (refus au build d'un token inexistant, parité tokens ↔ Figma, preuve octet par octet, suite d'évaluations), toutes vertes à la clôture. Vérifier la **prémisse** d'une porte existante — par exemple qu'une entrée qu'un eval exige est toujours présente après un rafraîchissement — n'est pas ajouter un contrôle ; réécrire une porte existante pour qu'elle cesse de signaler un écart MUST être refusé.
- **FR-009**: Les 89 valeurs en dur des contrats MUST NOT être converties dans cette fonctionnalité ; chaque token adopté MUST néanmoins être liable par un contrat dès la clôture (le refus par nom d'un token inexistant restant intact).
- **FR-009a**: La liabilité MUST être démontrée par un **contrat d'essai temporaire et non commité** liant un token adopté, accepté par le build pendant l'implémentation, dont le reçu est consigné dans le dossier de spec ; le contrat d'essai MUST être retiré avant clôture. La fonctionnalité MUST NOT ajouter ni modifier un fichier de `contracts/`, et MUST NOT faire bouger une sortie générée hors liste blanche de ce fait. La moitié « refus » repose sur la porte existante, inchangée.
- **FR-010**: Le fichier Figma MUST rester en lecture seule pendant tout le chantier : l'adoption est un geste côté dépôt qui reflète Figma, jamais l'inverse. Cette exigence étant prouvée par l'**absence** de geste, elle MUST porter un reçu écrit dans le rapport d'adoption — le nombre et la nature exacts des gestes de pont exécutés (attendu : un seul, en lecture) — car une vérification qui repose sur une absence doit dire ce qui a eu lieu, sans quoi elle est indiscernable d'une vérification omise.
- **FR-011**: Un **rapport d'adoption** MUST être commité dans le dossier de la fonctionnalité, portant au minimum : les comptes avant/après re-relevés depuis le cliché rafraîchi, la liste nommée des 77 feuilles adoptées, toute limite nommée (token Figma non représentable, conflit arbitré), le reçu du contrat d'essai temporaire, et le diff attendu des deux surfaces de la liste blanche. Un rapport vide de limites MUST le dire explicitement — l'absence de mention n'est jamais une preuve d'absence de limite. Le rapport est un reçu écrit, pas un contrôle : il n'entre pas en conflit avec FR-008.

### Key Entities

- **Token primitif**: valeur de design nommée et autonome (couleur, taille de police, interligne, espacement, rayon) ; 29 sont à adopter.
- **Token sémantique de typographie**: groupe d'usage (titre-1…6, lead, libellé-bouton, paragraphe, …) composé de **feuilles** (famille, taille, graisse, interligne…), chacune définie comme alias vers une primitive ; 48 feuilles sont à adopter ; la validité d'une feuille dépend de la résolution de son alias.
- **Feuille**: l'unité de compte de la fondation — un token terminal porteur d'une valeur ou d'un alias. C'est à ce niveau que se mesurent les comptes (62 / 139) et l'additivité.
- **Fondation de tokens du dépôt**: l'ensemble gouverné côté code ; 62 feuilles aujourd'hui, 139 après adoption ; source des liaisons de contrats.
- **Relevé Figma (cliché de variables)**: l'artefact commité que lit l'axe tokens de la parité, portant l'ensemble des tokens observés côté Figma ; référence unique de complétude, rafraîchi en lecture depuis le fichier vivant puis commité au démarrage. Entrée capturée, jamais une sortie générée.
- **Rapport de parité (axe tokens)**: le verdict comparant fondation du dépôt et relevé Figma ; son angle mort actuel est l'objet de la fonctionnalité.
- **Liste blanche des surfaces de tokens**: les deux sorties générées depuis la fondation de tokens et autorisées à changer — la feuille de styles de tokens et le script de synchronisation des variables Figma — plus leur re-épinglage dans la preuve octet par octet. Tout écart hors de cette liste est un signal d'alarme.
- **Preuve octet par octet**: la comparaison exhaustive des sorties générées avant/après ; c'est elle qui démontre « seules les surfaces de tokens de la liste blanche s'enrichissent ».
- **Rapport d'adoption**: l'artefact écrit commité dans le dossier de la fonctionnalité ; seul lieu où survivent les comptes re-relevés, la liste nommée des 77 feuilles, les limites nommées et le reçu du contrat d'essai temporaire (qui, lui, disparaît par construction). Reçu, jamais contrôle.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Couverture de parité complète : 100 % des tokens du cliché Figma rafraîchi ont un correspondant dans le dépôt (139/139 au relevé actuel) — zéro token dans l'angle mort. Seule exception admise : les tokens explicitement nommés comme limites au rapport (non représentables, ou sémantiques littérales sans primitive correspondante) ; la couverture s'annonce alors « 139 − k » avec les k limites énumérées et acquittées par la route existante `parity/baseline.json`, jamais arrondie à 139/139. Un token dans l'angle mort et un token nommé comme limite sont deux choses opposées : le second est visible.
- **SC-002**: 48/48 alias sémantiques résolus — zéro alias cassé après adoption.
- **SC-003**: 62/62 feuilles préexistantes inchangées (aucune modification de valeur, aucun renommage, aucune suppression).
- **SC-004**: Zéro changement observable sur les composants générés : la preuve octet par octet ne montre que les deux surfaces de tokens de la liste blanche enrichies, et rien d'autre.
- **SC-005**: Zéro nouveau contrôle ajouté, et 100 % des portes de qualité existantes vertes à la clôture.
- **SC-006**: Zéro valeur en dur convertie et zéro fichier de `contracts/` touché ; au moins un token adopté démontré liable via un contrat d'essai temporaire non commité (accepté au build, reçu consigné, contrat retiré) pendant que la liaison d'un token inexistant reste refusée par la porte existante.
- **SC-007**: L'adoption complète tient dans une session de travail courte — **estimation indicative de ~30 minutes**, mesurée du rafraîchissement du cliché à la fin du reçu de liabilité, hors préparation d'environnement (installation Chromium) et hors sweep de clôture, dont les durées dépendent de la machine et du cache. La durée observée est consignée au rapport comme information ; **un dépassement n'est pas un échec** et ne justifie jamais de sauter une vérification.
- **SC-008**: Un rapport d'adoption est commité et couvre 100 % de ses rubriques obligatoires (comptes re-relevés, liste nommée des 77 feuilles, limites nommées ou mention explicite d'absence de limite, reçu du contrat d'essai, diff attendu des deux surfaces de la liste blanche).

## Assumptions

- Les comptes 139 / 62 / 77 (= 29 primitives + 48 sémantiques) proviennent de l'audit de l'utilisateur au moment de la rédaction ; ils sont re-relevés au démarrage (FR-004) et la spec suit les comptes re-relevés si dérive.
- Les 62 feuilles existantes sont déjà conformes à leurs homologues Figma — la parité actuelle est verte sur ce qu'elle voit ; la fonctionnalité étend la couverture, elle ne corrige pas l'existant.
- Les valeurs sont reprises à l'identique, conventions d'unités du dépôt préservées (25px reste 25) — aucune conversion ni normalisation de valeur.
- La fondation reste mono-marque / mono-mode Piqueray : l'adoption n'introduit ni marque ni mode.
- La vérification « zéro alias cassé » déjà faite par l'utilisateur est re-prouvée par les portes existantes lors de l'adoption — jamais prise sur parole.
- Aucune écriture Figma n'est nécessaire ni autorisée.

## Out of Scope

- La conversion des 89 valeurs en dur des contrats vers des liaisons de tokens (chantier ultérieur, rendu possible par cette adoption).
- Tout nouveau contrôle, instrument ou vérification (le rapport d'adoption de FR-011 est un reçu écrit, pas un contrôle — il ne relève pas de cette exclusion).
- Toute modification du fichier Figma (masters, variables, styles).
- L'ajout d'une marque, d'un mode ou d'un thème.
