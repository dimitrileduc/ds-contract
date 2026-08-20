# Feature Specification: Bloc « Catégories principales » gouverné (molécule + section + module Odoo)

**Feature Branch**: `023-categories-gouvernees`
**Created**: 2026-08-20
**Status**: Draft
**Input**: User description :

> Gouverner le bloc « Catégories principales » (aujourd'hui hors contrat, uniquement réparé visuellement par 021) pour que ses cartes cessent de dériver et que le client puisse gérer ses catégories dans Odoo sans jamais sortir du design approuvé.
>
> Déclencheur : étude live du 2026-08-20 sur le fichier Piqueray (Copy). Le master mélange dans un seul axe « Disposition » (4 variantes) trois choses distinctes : le style de carte, le nombre de colonnes et un cas particulier mal nommé. La moitié des cartes sont des copies locales qui échappent à la molécule et dérivent déjà.

## Contexte & autorité de départ *(relevés live, ne pas rejouer)*

- **Ce que 021 a fait, ce que 023 fait.** Le bloc a été **réparé visuellement** par 021 : son rendu actuel sur le canvas est l'apparence approuvée. 023 ne rouvre pas cette apparence — il ajoute la **gouvernance structurelle** (molécule + parent sains, contrats, couverture du différentiel) **sans changer le rendu**. L'apparence post-021 est la **référence pixel** de cette spec.
- **Faits durs relevés le 2026-08-20** (mesurés sur le fichier Piqueray (Copy), pas supposés) :
  - **7 usages réels**, tous sur la page **Pages** : **6 à 2 colonnes, 1 à 3 colonnes**. Le nombre de colonnes est un **choix de design**, jamais dérivé du nombre de cartes.
  - **Deux styles de carte réels**, même sémantique (titre, description, lien) : (a) **texte superposé à la photo, avec une flèche** ; (b) **photo et texte empilés, avec un bouton lien gouverné**.
  - Le master empile dans un seul axe « **Disposition** » (4 variantes) **trois choses distinctes** : le style de carte, le nombre de colonnes, et un **cas particulier mal nommé** — « **Rdv** », qui est un **contenu différent**, pas une disposition.
  - **3 copies locales** de carte à rebrancher en instances ; la molécule existante est **saine à l'intérieur** (enfants en **Fill**, bouton gouverné).
- **Décalage de roadmap assumé.** 022 avait pré-affecté « 023 » au workstream *shell* (en-tête / pied de page) ; l'owner a redirigé 023 vers le bloc **Catégories principales**. Ce n'est pas un conflit : la présente entrée fait foi pour 023.

## User Scenarios & Testing *(mandatory)*

### Gates humains bloquants — l'owner valide avant chaque phase

Tu es le gate à **quatre moments**. **Aucune phase aval ne démarre avant que tu aies validé le gate qui la précède** — c'est un arrêt réel du déroulé, pas une case cochée d'office. On ne lance pas Odoo si tu ne valides pas ; on ne mute pas le canvas si tu n'as pas validé le modèle cible.

| Gate | Quand | Tu valides quoi | Bloque quoi |
|---|---|---|---|
| **A** | après l'audit, **avant toute mutation Figma** | le modèle cible (2 styles, colonnes sur le parent, « Rdv » → contenu, renommage) **+ le sort de chaque copie dérivée** (préserver le pixel ou re-caler sur la molécule) | toute mutation du canvas |
| **B** | après mutation, sur les captures | la **comparaison pixel avant/après** des 7 usages ; chaque écart chiffré et attribué | la déclaration « repair neutre » et l'extraction des contrats |
| **C** | contrats extraits | les **deux contrats** comme diff révisable (le diff **est** la revue design system, Principe VI) | le câblage du différentiel et tout travail Odoo |
| **D** | avant l'implémentation Odoo | la **table d'éditabilité** (100 % des props/parts des deux contrats, 4 verdicts) | tout Odoo : code de module, instance, couche d'authoring |

Chaque validation est **tracée** (datée, consignée dans les preuves de la spec). Toute divergence découverte après un gate est un défaut à corriger ou un **retour au gate** — jamais un ajustement silencieux. Détail testable en **FR-001 → FR-005**.

---

### User Story 1 — Molécule unique à deux styles et parent à axes sensés (Priority: P1)

En tant qu'**owner du design system**, je veux une **molécule carte-catégorie unique à deux styles** et un **parent à axes sensés**, afin que **toute carte sur le canvas soit une instance gouvernée** et cesse de dériver.

Concrètement : le master de la carte n'expose plus qu'**un seul axe utile — le style de carte, deux valeurs** (texte-sur-photo-avec-flèche / photo-texte-empilés-avec-bouton), de sémantique identique (titre, description, lien, image). Le **nombre de colonnes quitte la carte** pour vivre sur le **parent/section** comme **enum fermé 2 | 3**. Le cas « **Rdv** » redevient un **contenu** (une instance renseignée), plus une variante de disposition ; l'axe « Disposition » mal nommé est supprimé ou renommé pour dire la vérité (§VIII). Les **3 copies locales** (et toute autre copie trouvée à l'audit) sont **rebranchées en instances** ; les **7 usages** sont re-pointés sur le master gouverné en préservant leur colonnage actuel. Deux contrats (molécule + section) sont extraits de la source **nettoyée**.

**Why this priority**: c'est le socle. Sans une molécule et un parent gouvernés, il n'y a ni couche Odoo (US2) ni couverture du différentiel (US3). À elle seule, cette histoire supprime la dérive à la source : zéro copie locale, chaque carte devient une instance gouvernée — valeur autonome et démontrable.

**Independent Test**: après nettoyage Figma et extraction, vérifier sur le canvas que (1) il ne reste **aucune copie locale** de carte-catégorie, (2) les **7 usages** rendent **au pixel** comme leur capture d'avant-mutation, et (3) les deux contrats valident au schéma et **régénèrent les deux surfaces à l'identique sur deux exécutions**.

**Acceptance Scenarios**:

1. **Given** la source Figma auditée et l'état d'avant-mutation capturé pour les 7 usages et le master (§X), **When** le master est nettoyé, **Then** il n'expose plus qu'un axe « style » à deux valeurs, sans axe « Disposition » mélangeant colonnes et contenu, et le colonnage n'est plus une propriété de la carte.
2. **Given** les 3 copies locales identifiées (et toute copie supplémentaire trouvée par un scan **par position, jamais par nom**), **When** la réparation s'exécute, **Then** chaque copie devient une instance du master gouverné et il reste **zéro** copie locale.
3. **Given** le cas « Rdv », **When** il est remodelé, **Then** il est une instance renseignée d'un des deux styles (contenu), et non une variante de disposition ; son texte, son lien et son apparence sont préservés à l'identique.
4. **Given** les 7 usages re-pointés, **When** on compare avant/après par image, **Then** chacun rend **au pixel** identique à sa capture d'avant-mutation ; tout écart non nul est **chiffré et attribué à une cause nommée**.
5. **Given** les deux contrats extraits de la source nettoyée, **When** `npm run build` puis un second run s'exécutent, **Then** React et Figma sont régénérés **octet pour octet identiques** et la géométrie est portée en **tokens, jamais en littéraux bruts**.

---

### User Story 2 — Un éditeur Odoo gère ses catégories sans casser le layout (Priority: P2)

En tant que **client éditeur Odoo**, je veux **ajouter / retirer / réordonner** mes catégories, **changer l'image, les textes et le lien** de chaque carte, et **choisir 2 ou 3 colonnes desktop**, afin de gérer mon contenu **sans jamais produire un layout non approuvé**.

La section « Catégories principales » se pose dans l'éditeur Website et se rend fidèlement depuis son contrat. Les cartes sont une **collection gouvernée** (même mécanisme éprouvé que la section Équipe) : le rédacteur les ajoute, les supprime, les réordonne, et édite par carte l'image, le titre, la description et le lien. Un **sélecteur de colonnes** propose **2 ou 3**, et rien d'autre. Au-delà du nombre de colonnes choisi, les cartes **passent à la ligne** en suivant la même grille. Le **style de carte** n'est **pas** un choix rédacteur dans cette itération : il est fixé par le design (composition). Les modifications restent **propres à l'instance** et **survivent** à sauvegarde + réouverture de l'éditeur + page publique.

**Why this priority**: c'est la valeur livrée au client. Elle dépend d'US1 (les contrats gouvernés) mais, une fois le socle posé, elle est indépendamment démontrable sur une instance propre.

**Independent Test**: sur instance Odoo propre, poser la section, dérouler le scénario rédacteur (contenu par défaut, ajout/suppression/réordonnancement de cartes, édition image/titre/description/lien, bascule 2↔3 colonnes, ajout d'une 4ᵉ carte) et vérifier qu'aucun geste ne produit un colonnage hors {2,3} ni une carte non gouvernée ; contrôler l'isolation et la persistance aux trois points de contrôle.

**Acceptance Scenarios**:

1. **Given** les tables de verdicts d'éditabilité validées par l'owner, **When** le rédacteur insère la section, **Then** elle s'affiche avec le contenu par défaut de son contrat et son rendu correspond à la référence approuvée (delta mesuré ; écart non nul chiffré et attribué).
2. **Given** la section posée, **When** le rédacteur ajoute, supprime ou réordonne une carte, **Then** la collection reflète le geste, chaque carte reste une instance gouvernée, et la modification tient aux trois points de contrôle (sauvegarde, réouverture, page publique).
3. **Given** la section posée, **When** le rédacteur change l'image, le titre, la description ou le lien d'une carte, **Then** seule cette carte change et la modification survit aux trois points de contrôle.
4. **Given** une section à 2 colonnes, **When** le rédacteur bascule à 3 colonnes puis ajoute une 4ᵉ carte, **Then** le rendu reste dans le design approuvé : colonnage exactement 3, 4ᵉ carte **passée à la ligne** sur la même grille, aucune carte non gouvernée, aucun colonnage hors {2,3} offrable.
5. **Given** la section posée, **When** le rédacteur tente d'éditer un élément d'un autre verdict que `éditable` (style de carte, structure, éléments fixés par composition), **Then** le **geste lui-même est bloqué** — pas seulement le panneau absent — conformément à la table validée, et les panneaux natifs Odoo indésirables ne sont pas proposés.
6. **Given** deux pages portant chacune une instance de la section, **When** le rédacteur en modifie une, **Then** l'autre reste inchangée.

---

### User Story 3 — Le différentiel trois-voies couvre les deux contrats (Priority: P3)

En tant que **mainteneur**, je veux que le **différentiel trois-voies** couvre les deux nouveaux contrats **comme les autres**, afin qu'une dérive future soit **détectée, pas découverte à l'œil**.

Les deux contrats (molécule + section) sont câblés dans `npm run parity` sur ses trois axes (code ⟷ contrat, canvas ⟷ contrat, variables canvas ⟷ tokens) et ajoutés comme **sujets de parité visuelle**, de sorte qu'une dérive de structure, de binding ou d'apparence soit relevée automatiquement — fermant, pour ces deux-là, l'angle mort connu où les sections échappaient à la parité visuelle.

**Why this priority**: P3 parce qu'elle dépend d'US1 (les contrats doivent exister) ; c'est le filet de sécurité qui transforme un bloc « réparé » en un bloc **gardé**. Sans elle, la prochaine dérive se redécouvre à l'œil — exactement ce que 023 veut abolir.

**Independent Test**: injecter une dérive contrôlée sur chaque contrat (une valeur de structure, une valeur d'apparence) et vérifier que `npm run parity` et l'instrument de parité visuelle la **signalent** ; retirer la dérive et vérifier le retour au vert.

**Acceptance Scenarios**:

1. **Given** les deux contrats livrés et câblés, **When** `npm run parity` s'exécute, **Then** les deux sont classés et comparés sur les trois axes, sans exclusion silencieuse.
2. **Given** les deux contrats ajoutés comme sujets de parité visuelle, **When** une dérive d'apparence est injectée sur l'un, **Then** l'instrument mesure un delta au-dessus du seuil et **nomme** le sujet en dérive.
3. **Given** une dérive de structure ou de binding injectée sur un contrat, **When** le différentiel s'exécute, **Then** elle est signalée comme écart (ahead/behind/mismatched) avec un remède proposé, et non passée sous silence.

---

### Edge Cases

- **Moins de cartes que de colonnes** (ex. 2 cartes en 3 colonnes) : les cartes gardent leur **largeur gouvernée** et s'alignent selon la grille approuvée (pas d'étirement improvisé pour combler la rangée), conformément au design.
- **Débordement de rangée** (ex. 4 cartes en 3 colonnes) : la 4ᵉ carte **passe à la ligne** dans la première colonne de la rangée suivante, même largeur que les autres — le colonnage reste exactement celui choisi.
- **Section vidée de ses cartes** : le rendu reste un état propre défini par le design (pas de layout cassé), et le geste reste réversible côté rédacteur ; la définition de cet état vide est **arrêtée au Gate D** (table d'éditabilité), jamais improvisée à l'implémentation.
- **Copie locale non répertoriée trouvée à l'audit** : le nombre de copies à rebrancher est **celui que l'audit révèle** (scan par position), pas le « 3 » supposé ; toute copie supplémentaire est rebranchée au même titre.
- **Contenu long** (titre/description qui déborde, libellé de lien long sur le style à bouton) : géré par les enfants en **Fill** et le **bouton gouverné**, sans casser le layout de la carte.
- **Style de carte** : n'étant pas éditable en Odoo cette itération, aucune bascule de style ne doit être offerte au rédacteur ; le style suit la composition de la section posée.

## Requirements *(mandatory)*

### Functional Requirements

**Gates humains bloquants — l'owner valide avant chaque phase (§ autorité owner)**

- **FR-001** *(Gate A — modèle cible, AVANT toute mutation Figma)*: Après l'audit lecture seule (§VIII, scan par position), le **modèle cible** MUST être proposé à l'owner — axe « style » à deux valeurs, colonnes portées par le parent, ce que devient « Rdv », renommage du master — **avec une décision par copie** pour chaque copie locale ayant visiblement dérivé : **préserver le pixel actuel** ou **re-caler sur la molécule**. L'owner valide **avant qu'aucune mutation du canvas ne commence**. Arrêt réel.
- **FR-002** *(Gate B — comparaison pixel, APRÈS mutation)*: Après mutation et capture d'après, la **comparaison avant/après** des 7 usages MUST être présentée à l'owner pour validation ; chaque delta non nul chiffré et attribué ; les corrections des copies dérivées MUST être conformes à ce qui a été décidé au Gate A (FR-001). Le repair n'est **déclaré neutre** (et l'extraction n'est engagée) qu'après cette validation.
- **FR-003** *(Gate C — contrats, AVANT câblage & Odoo)*: Les deux contrats extraits MUST être présentés à l'owner comme **diff révisable** (le diff de contrat **est** la revue de changement du design system, Principe VI) et validés **avant** d'être câblés dans le différentiel (US3) et **avant** tout travail Odoo (US2).
- **FR-004** *(Gate D — table d'éditabilité, AVANT tout Odoo)*: Une **table de verdicts d'éditabilité** couvrant **100 % des props et des parts des deux contrats** MUST être proposée et **explicitement validée par l'owner** ; chaque entrée porte l'un des quatre verdicts (`éditable` / `fixé par composition` / `non éditable` / `hors capacité`) avec justification et, pour `éditable`, le geste rédacteur. **Rien d'Odoo ne démarre sans cette validation** : ni code de module, ni provisionnement d'instance pour l'authoring, ni tâche de couche d'authoring.
- **FR-005** *(discipline des gates)*: Chaque gate est un **arrêt réel** ; aucune phase aval ne démarre avant la validation de **son** gate ; toute divergence découverte ensuite est un défaut à corriger ou un **retour au gate**, jamais un ajustement silencieux ; chaque validation est **tracée** (datée, consignée dans les preuves de la spec).

**Nettoyage & gouvernance de la source Figma (§VIII, §X)**

- **FR-006**: Avant toute mutation du canvas, l'état d'avant-changement de **tous les 7 usages** et du/des master(s) concerné(s) MUST être capturé (image rendue + structure), chaque capture **vérifiée non vide et correctement dimensionnée** (§X — before-capture, jamais un sous-ensemble pilote).
- **FR-007**: Le master de la carte-catégorie MUST n'exposer **qu'un seul axe de variante utile** — le **style de carte** — à **exactement deux valeurs** : (a) texte superposé à la photo avec **flèche**, (b) photo et texte empilés avec **bouton lien gouverné** ; les deux styles partagent la même sémantique (titre, description, lien, image).
- **FR-008**: Le **nombre de colonnes** MUST NE PAS être une propriété de la carte ; il MUST vivre sur le **parent/section** comme **enum fermé à deux valeurs {2, 3}**. Le colonnage est un choix de design, jamais dérivé du nombre de cartes.
- **FR-009**: Le cas « **Rdv** » MUST être modélisé comme **contenu gouverné** (une instance renseignée d'un des deux styles), jamais comme variante de disposition ; l'axe « **Disposition** » mal nommé et ses valeurs non-layout MUST être supprimés ou renommés pour dire la vérité sur ce qu'ils portent.
- **FR-010**: Toutes les **copies locales** de carte-catégorie sur le canvas (les 3 identifiées **et toute autre trouvée à l'audit par position**) MUST être rebranchées en **instances** du master gouverné ; après réparation, **zéro** copie locale subsiste.
- **FR-011**: Les **7 usages réels** de la page « Pages » MUST être re-pointés sur le master gouverné en **préservant le colonnage actuel** (6 à 2 colonnes, 1 à 3 colonnes) et le contenu de chaque usage.
- **FR-012**: La réparation structurelle MUST être **neutre en apparence** : chacun des 7 usages MUST rendre **au pixel** identique à sa capture d'avant-mutation (preuve par comparaison d'images ; tout delta non nul chiffré et attribué à une cause nommée), **sous réserve des re-calages de copies dérivées décidés au Gate A**.

**Contrats — source de vérité (§I, §III, geometry-rides-tokens)**

- **FR-013**: Un **contrat molécule** gouverné MUST être extrait de la source Figma **nettoyée** pour la carte-catégorie, portant l'axe de style à deux valeurs, la sémantique partagée (titre, description, lien, image), la **flèche** du style superposé et le **bouton gouverné** du style empilé, avec la **géométrie portée en tokens, jamais en littéraux bruts**.
- **FR-014**: Un **contrat section** gouverné MUST être extrait pour le bloc « Catégories principales », composant une **collection répétée** de la carte-molécule et portant l'**enum colonnes {2, 3}**.
- **FR-015**: Les deux contrats MUST valider au schéma et **régénérer les deux surfaces (React + Figma) de façon déterministe** — sortie **octet pour octet identique sur deux exécutions**, sans AI dans le chemin de génération.

**Couche d'authoring Odoo (le périmètre éditable est arrêté au Gate D — FR-004)**

- **FR-016**: Dans l'éditeur Website Odoo, un rédacteur MUST pouvoir **ajouter, supprimer et réordonner** les cartes-catégories comme **collection gouvernée** (mécanisme éprouvé de collection répétée, type section Équipe), et éditer par carte l'**image, le titre, la description et le lien**.
- **FR-017**: Un rédacteur MUST pouvoir choisir **2 ou 3 colonnes desktop** via un sélecteur gouverné ; **aucun autre nombre de colonnes** n'est offrable.
- **FR-018**: Quand le nombre de cartes dépasse le nombre de colonnes choisi, les cartes MUST **passer à la ligne** en suivant la même grille ; le rédacteur MUST NE PAS pouvoir produire un layout hors design approuvé (pas de colonnage hors {2,3}, pas de carte non gouvernée, pas de bascule de style).
- **FR-019**: Les modifications rédacteur MUST rester **propres à l'instance** et **survivre** à sauvegarde + réouverture de l'éditeur + page publique (trois points de contrôle), conformément à la table d'éditabilité validée au Gate D.

**Couverture du différentiel & portes (§V)**

- **FR-020**: Les deux nouveaux contrats MUST être couverts par le différentiel trois-voies (`npm run parity`) sur ses trois axes (code ⟷ contrat, canvas ⟷ contrat, variables canvas ⟷ tokens), **sans exclusion silencieuse**.
- **FR-021**: Les deux nouveaux contrats MUST être ajoutés comme **sujets de parité visuelle**, afin qu'une dérive d'apparence soit **mesurée automatiquement** (fermeture, pour ces deux-là, de l'angle mort où les sections échappaient à la parité visuelle).
- **FR-022**: Toutes les **portes du dépôt** MUST rester vertes à la clôture (build, parity, eval, plugin:check, roundtrip déterministe, core-browser-check, tsc) ; toute **limite ou dégradation** MUST être nommée là où la capacité est revendiquée — jamais silencieuse.

### Key Entities

- **Molécule carte-catégorie** *(nouveau contrat, ex. `ds.category-card`)* : la carte gouvernée. Axe **style** (2 valeurs : superposé-flèche / empilé-bouton) ; sémantique partagée titre, description, lien, image ; affordances par style (flèche / bouton lien gouverné). Enfants en **Fill** (source saine).
- **Section « Catégories principales »** *(nouveau contrat, ex. `ds.categories`)* : le parent gouverné. Compose une **collection répétée** de cartes-catégories et porte l'**enum colonnes {2, 3}**. C'est ici que vit le choix de colonnage, jamais sur la carte.
- **Style de carte** : les deux apparences approuvées (texte-sur-photo + flèche ; photo/texte empilés + bouton). Propriété de **design/composition**, non éditable côté rédacteur cette itération.
- **Choix de colonnes** : enum fermé **2 | 3**, décision de design portée par le parent ; au-delà du compte, les cartes passent à la ligne.
- **Les 7 usages** : les instances réelles sur la page « Pages » (6 à 2 colonnes, 1 à 3 colonnes) ; plus le cas de contenu « **Rdv** » (une instance renseignée, pas une variante).
- **Collection de catégories Odoo** : la liste éditable de cartes (ajout / suppression / réordonnancement), chacune portant image / titre / description / lien ; plus le **sélecteur de colonnes** {2,3}.
- **Table de verdicts d'éditabilité** : la carte owner-validée de chaque prop/part des deux contrats vers l'un des quatre verdicts — l'autorité qui régit la couche Odoo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **Zéro** copie locale de carte-catégorie sur le canvas après réparation ; **100 %** des cartes-catégories du canvas sont des instances gouvernées (compté avant/après).
- **SC-002**: Les **7 usages** rendent **au pixel** identiques à leur capture d'avant-mutation, **sous réserve des re-calages de copies dérivées décidés au Gate A** (même réserve que FR-012) — **0** pixel de delta hors ces re-calages ; tout delta non nul chiffré et attribué à une cause nommée.
- **SC-003**: Un rédacteur Odoo peut **basculer une section de 2 à 3 colonnes et ajouter une 4ᵉ carte** en restant dans le design approuvé — colonnage exactement dans {2,3}, cartes surnuméraires passées à la ligne, **aucune** carte non gouvernée — vérifié sur instance propre.
- **SC-004**: Un rédacteur Odoo peut **ajouter, supprimer, réordonner** des cartes et éditer **image / titre / description / lien** de chacune ; les modifications restent propres à l'instance et **survivent** à sauvegarde + réouverture + page publique (trois points de contrôle).
- **SC-005**: Les deux nouveaux contrats sont couverts par le **différentiel trois-voies** et par la **parité visuelle** ; une dérive injectée sur l'un ou l'autre est **signalée automatiquement**, pas découverte à l'œil.
- **SC-006**: Toutes les **portes du dépôt** sont vertes à la clôture et les deux surfaces se régénèrent **octet pour octet identiques sur deux exécutions**.
- **SC-007**: Les **quatre gates humains** (A modèle cible, B comparaison pixel, C contrats, D éditabilité) ont été **validés par l'owner dans l'ordre et tracés** ; aucune phase aval n'a démarré avant la validation de son gate (vérifiable dans les preuves de la spec).

## Out of Scope *(cette itération)*

- **Le mobile** : responsive complet ; le **mono-colonne forcé** en petit écran est différé à une itération ultérieure.
- **Produits e-commerce** : la molécule/section produit reste hors périmètre.
- **La navigation** (nav) : hors périmètre.
- **Le choix de style de carte côté rédacteur** : cette itération fixe le style par composition ; un sélecteur de style éventuel serait une itération future.
- **Toute nouvelle capacité de contrat non nécessaire aux deux styles + l'enum colonnes** : ajoutée seulement si le plan la démontre indispensable, en additif au schéma (Principe VI).

## Assumptions

- **Référence pixel = capture d'avant-mutation.** « Rendre au pixel comme avant la réparation » se lit comme : la gouvernance/rebranchement est **neutre en apparence**, prouvée contre la capture prise **juste avant** les mutations de 023 (l'apparence approuvée héritée de 021). C'est la lecture cohérente avec §X.
- **Le style de carte n'est pas un choix rédacteur** (cette itération) : le module Odoo listé par l'owner porte un **sélecteur de colonnes** et un **lien par carte**, pas un sélecteur de style — le style suit la composition de la section posée.
- **Mécanisme de colonnes 2|3** : la façon exacte de porter l'enum colonnes (réutilisation d'un mécanisme de variante/prop existant ou **champ de schéma additif** avec bump de `docs/02-contract-spec.md`) est une **décision de `/speckit.plan`**, tranchée en consultant `docs/FIGMA-CAPABILITY-MATRIX.md` d'abord (docs-first §IX). La spec fixe le **quoi** (2|3, wrap au-delà), pas le **comment**.
- **Collection « type Équipe »** : réutilisation du **mécanisme de collection répétée déjà éprouvé** pour l'authoring des cartes (add/remove/reorder), pas une nouvelle mécanique.
- **Ids de contrats** : `ds.category-card` (molécule) et `ds.categories` (section) sont des **noms de travail** ; l'id final est arrêté au plan, cohérent avec la nomenclature du dépôt.
- **Scan par position, jamais par nom** : l'audit des usages et des copies suit §VIII (par position), donc le décompte « 3 copies / 7 usages » est **re-vérifié live** au démarrage et fait foi s'il diffère.
- **Instance Odoo propre** : les preuves d'authoring se déroulent sur une instance Docker reconstruite, selon le workflow de portage déjà éprouvé (référence 019/022).
