# Feature Specification: Vague contenu Odoo (wave B) — sections Coordonnées & Réassurances

**Feature Branch**: `022-odoo-production-wave-b`
**Created**: 2026-08-19
**Status**: Draft
**Input**: User description:

> Monter deux sections gouvernées de plus dans l'addon Odoo de production (`integrations/odoo/`) : COORDONNÉES et RÉASSURANCES. C'est la vague « contenu » du roadmap (022 wave-b) : deux sections dont l'authoring ne réclame que des mécanismes déjà éprouvés par 019, sans exception structurelle.
>
> CONTEXTE / AUTORITÉ DE DÉPART (ne pas rejouer) : le workflow de portage est celui de 019 (odoo-production-foundation), déjà prouvé sur 8 sections : contrat → QWeb + tokens générés → couche d'authoring gouvernée → preuves sur instance Docker propre → delta pixel mesuré. Les références visuelles sont celles validées par l'owner dans 020 ; le Figma des deux sections a été réparé et accepté par l'owner dans 021. On ne rouvre ni 020 ni 021. Les contrats sont consommés TELS QUELS : ds.coordonnees (2.2.0, un en-tête de section + une carte/plan) et ds.reassurances (des cartes répétées). Aucun changement de contrat, de Figma, de tokens ni de core dans cette spec.
>
> CE QU'IL FAUT OBTENIR : chaque section est posable dans l'éditeur Website, rendue fidèlement depuis son contrat. Chaque section porte une couche d'authoring gouvernée : le rédacteur peut modifier exactement les contenus décidés (et rien d'autre), les panneaux natifs Odoo indésirables sont retirés, et chaque prop/part du contrat reçoit un verdict explicite (éditable / fixé par composition / non éditable / hors capacité). Les modifications restent propres à l'instance et survivent à sauvegarde + réouverture de l'éditeur + page publique. Les deux sections sont qualifiées : versions/lock/digest alignés, portes Odoo vertes, scénario QA par section sur instance propre, et un delta visuel mesuré contre la référence 020 (chiffré et attribué si non nul).
>
> USER STORIES (priorités) : US1 (P1) Coordonnées montée, éditable et gouvernée, isolée par instance. US2 (P1) Réassurances montée, idem, y compris ses cartes répétées. US3 (P2) les deux qualifiées ensemble (lock repinné, QA verte, delta mesuré).
>
> HORS PÉRIMÈTRE (explicite) : le FORMULAIRE (spec séparée : l'envoi du formulaire est un inconnu à spiker). L'EN-TÊTE et le PIED DE PAGE (workstream « shell », spec séparée / 023). Toute réparation Figma (faite en 021) et toute nouvelle capacité de contrat.
>
> **Exigence de processus ajoutée par l'owner** : « attention tu dois me proposer les élément modifiables ou non dans le panel edit avant tout dans le plan et je dois valider — gate humain. »

## Clarifications

### Session 2026-08-19

- Q: « Les sections doivent être w-auto comme pour les autres » (exigence ajoutée par l'owner en séance) — quelle garantie exacte ? → A: **Adaptation desktop selon le précédent 019** : chaque section posée s'adapte à la largeur de la page — racine ET enfants, aucune largeur fixe du contrat n'est imposée à la page — avec zéro débordement horizontal vérifié aux largeurs de contrôle du QA (largeur de référence et 1440 px). L'adaptation est un geste d'addon ; les contrats restent consommés tels quels. Le responsive mobile complet reste hors périmètre, comme pour les sections déjà montées.

## User Scenarios & Testing *(mandatory)*

### Checkpoint bloquant — gate humain « périmètre éditable » (avant toute implémentation)

Exigence de processus posée par l'owner, reprise ici pour qu'aucune phase aval ne puisse la manquer :

- Le plan (`/speckit.plan`) **ouvre** par la proposition de **deux tables de verdicts d'éditabilité** — une par section — couvrant **100 % des props et des parts** du contrat de la section (parts imbriquées, compositions enfants et éléments répétés compris). Chaque entrée porte un des **quatre verdicts** : `éditable` / `fixé par composition` / `non éditable` / `hors capacité`, avec sa justification et, pour `éditable`, le geste rédacteur correspondant (texte en ligne, remplacement d'image, réglage de panneau…).
- **L'owner valide explicitement chaque table.** Aucune tâche d'implémentation de la couche d'authoring d'une section ne démarre avant la validation de **sa** table. La validation est un arrêt réel du déroulé, pas une case cochée d'office.
- La table validée **fait foi** pour toute la suite : le comportement livré doit lui être conforme ; toute divergence découverte en cours de route est soit un défaut à corriger, soit un **retour au gate** — jamais un ajustement silencieux.

### User Story 1 - Coordonnées montée, éditable et gouvernée (Priority: P1)

Un rédacteur du site pose la section **Coordonnées** depuis l'éditeur Website. Elle s'affiche fidèlement depuis son contrat (`ds.coordonnees` 2.2.0) : le plan Google à gauche, et à droite l'en-tête de section suivi des blocs Adresse, Horaires, Contact et Suivez-nous. Le rédacteur modifie exactement les contenus validés « éditable » à la gate ; tout le reste est verrouillé et les panneaux natifs indésirables sont absents. Ses modifications restent propres à sa page et survivent à la sauvegarde, à la réouverture de l'éditeur et à l'affichage public.

**Why this priority**: première des deux sections de la vague « contenu » ; à elle seule elle ajoute une section de production utilisable — valeur autonome, sans dépendre de US2/US3.

**Independent Test**: sur instance propre, poser Coordonnées, dérouler le scénario QA de la section (rendu par défaut, éditions autorisées, tentatives interdites, isolation, persistance) et mesurer le delta visuel contre la référence 020.

**Acceptance Scenarios**:

1. **Given** la table de verdicts Coordonnées validée par l'owner, **When** le rédacteur insère la section depuis la palette de blocs, **Then** elle s'affiche avec le contenu par défaut de son contrat et son rendu correspond à la référence 020 (delta mesuré ; tout écart non nul est chiffré et attribué).
2. **Given** la section posée, **When** le rédacteur modifie un contenu au verdict « éditable », **Then** la modification est visible dans l'éditeur, après sauvegarde, après réouverture de l'éditeur et sur la page publique — identique aux trois points de contrôle.
3. **Given** la section posée, **When** le rédacteur tente de modifier un élément d'un autre verdict (structure, styles, éléments fixés), **Then** le geste d'édition lui-même est bloqué — pas seulement le panneau absent — et les panneaux natifs indésirables ne sont pas proposés.
4. **Given** deux pages portant chacune une instance de Coordonnées, **When** le rédacteur modifie l'une, **Then** l'autre reste inchangée.

---

### User Story 2 - Réassurances montée, cartes répétées comprises (Priority: P1)

Un rédacteur pose la section **Réassurances** (`ds.reassurances` 1.2.0) : l'en-tête de section (dont les textes sont fixés par la composition du contrat), la rangée de cartes répétées (titre, texte, image par carte) et le bouton d'appel à l'action. Il édite les cartes individuellement selon les verdicts validés ; les gestes de collection (ajouter, dupliquer, supprimer une carte) suivent exactement la décision de la gate. Isolation et persistance identiques à US1.

**Why this priority**: deuxième section de la vague, même valeur autonome ; c'est aussi la première section montée dont le contenu principal est une **collection répétée** — la preuve que le mécanisme de répétition prouvé par 019 tient sur un cas de production de plus.

**Independent Test**: sur instance propre, poser Réassurances, éditer la carte N sans toucher la carte N+1, exercer les gestes de collection décidés (et vérifier que les gestes non validés sont neutralisés), puis mesurer le delta visuel contre la référence 020.

**Acceptance Scenarios**:

1. **Given** la table de verdicts Réassurances validée par l'owner, **When** le rédacteur insère la section, **Then** elle s'affiche avec le contenu par défaut du contrat (en-tête, cartes, bouton) et son rendu correspond à la référence 020 (delta mesuré, écarts attribués).
2. **Given** la section posée, **When** le rédacteur modifie le titre ou le texte d'une carte, **Then** seule cette carte change, et la modification tient aux trois points de contrôle (sauvegarde, réouverture, page publique).
3. **Given** la section posée, **When** le rédacteur tente d'éditer un élément fixé par composition (textes de l'en-tête, bouton) ou tout élément hors verdict « éditable », **Then** le geste est bloqué conformément à la table validée.
4. **Given** la section posée, **When** le rédacteur exerce un geste de collection sur les cartes, **Then** seuls les gestes validés à la gate aboutissent ; tout geste non validé (y compris les gestes natifs de duplication/suppression de l'éditeur) est neutralisé.

---

### User Story 3 - Les deux sections qualifiées ensemble (Priority: P2)

L'intégrateur clôt la vague : versions, lock et digest de l'addon réalignés pour couvrir les deux sections, toutes les portes de qualification Odoo vertes sur instance propre, scénario QA rejoué vert pour chaque section, delta visuel chiffré contre la référence 020 — chaque écart non nul attribué à une cause nommée — et non-régression des sections déjà montées.

**Why this priority**: P2 parce qu'elle dépend de US1 et US2 ; c'est elle qui transforme deux montages qui marchent en un état de l'addon **prouvé** et repartable.

**Independent Test**: sur instance propre reconstruite, exécuter la qualification complète (portes, QA des deux sections, mesure visuelle, vérification lock/digest) et produire le dossier de preuves.

**Acceptance Scenarios**:

1. **Given** US1 et US2 livrées, **When** la qualification s'exécute sur instance propre, **Then** toutes les portes Odoo passent au vert et versions/lock/digest sont alignés sans divergence résiduelle.
2. **Given** la qualification en cours, **When** le delta visuel de chaque section est mesuré contre la référence 020, **Then** le résultat est chiffré et chaque écart non nul est attribué à une cause nommée — aucun écart inexpliqué n'est accepté.
3. **Given** l'addon étendu à deux sections de plus, **When** les scénarios QA des sections déjà montées sont rejoués, **Then** ils restent verts (zéro régression).

### Edge Cases

- **Verrou contourné** : une tentative d'édition d'un élément verrouillé par un chemin détourné (édition en ligne directe, collage, raccourci) doit échouer. Reçu 018 à ne pas oublier : un mécanisme qui ferme les réglages et les zones de dépôt sans fermer l'édition du texte a déjà été observé — le scénario QA teste **le geste de texte lui-même** sur chaque élément non éditable.
- **Deux instances sur la même page** : chacune s'édite isolément, aucune fuite de contenu de l'une vers l'autre.
- **Collection aux bornes** : vider entièrement le texte d'une carte, éditer la première et la dernière carte, et exercer un geste de collection interdit — le comportement observé est exactement celui de la table validée.
- **Contenus par défaut délicats** : les défauts du contrat comportent un saut de ligne dans le bloc Tél/Email et des segments soulignés — la pose puis l'édition ne doivent ni les perdre ni les déformer.
- **Valeurs fournies par le consommateur** : le plan Google (`mapUrl`/`mapAlt`, défaut vide par conception) et les images des cartes (`items[].imageUrl`, défaut vide) n'ont pas de valeur dans le contrat — qui fournit la valeur de production et si le rédacteur peut la changer est tranché à la gate ; une section posée ne doit jamais afficher une image cassée.
- **Bloc déjà posé = copie figée** (fait établi en 018) : une mise à jour ultérieure de l'addon ne repropage rien vers les blocs déjà posés. La qualification se fait sur pose fraîche et cette limite reste documentée, pas cachée.
- **Page plus étroite que la référence** : posée dans une page affichée à 1440 px, la section s'adapte (« w-auto ») sans débordement horizontal — les largeurs fixes des contrats (racine Réassurances 1550 px ; plan 1152 px et colonne 576 px de Coordonnées) ne sont pas imposées à la page. L'adaptation vit côté addon ; le contrat, lui, n'est pas modifié.
- **Écart visuel sans cause** : un delta non nul qui ne peut pas être attribué à une cause nommée est un échec de qualification, pas une tolérance.

## Requirements *(mandatory)*

### Functional Requirements

**Gouvernance du périmètre éditable (gate humain)**

- **FR-001**: Pour chaque section, une table de verdicts d'éditabilité DOIT être produite couvrant 100 % des props et des parts de son contrat (parts imbriquées, compositions enfants, éléments répétés et valeurs fournies par le consommateur compris), chaque entrée portant un des quatre verdicts — `éditable` / `fixé par composition` / `non éditable` / `hors capacité` — avec justification et, pour `éditable`, le geste rédacteur correspondant.
- **FR-002**: Les deux tables DOIVENT être soumises à l'owner comme **premier livrable du plan**, avant toute tâche d'implémentation ; l'implémentation de la couche d'authoring d'une section ne DOIT PAS démarrer avant la validation explicite de sa table (gate bloquant).
- **FR-003**: La table validée fait foi : le comportement d'édition livré DOIT lui être conforme à 100 % ; toute divergence découverte est traitée comme défaut ou repasse par le gate, jamais ajustée en silence. Les tables validées DOIVENT être archivées dans les artefacts de la spec.

**Montage et fidélité**

- **FR-004**: Chaque section (Coordonnées, Réassurances) DOIT être posable par un rédacteur depuis l'éditeur Website de l'addon de production et rendre, à la pose, le contenu par défaut de son contrat.
- **FR-005**: Le rendu DOIT être dérivé des contrats consommés tels quels — `ds.coordonnees` 2.2.0 et `ds.reassurances` 1.2.0 — par le workflow de portage déjà prouvé (019), sans modification de contrat, de tokens, de Figma ni du moteur.
- **FR-006**: La fidélité visuelle de chaque section DOIT être mesurée contre sa référence validée en 020 ; le résultat est chiffré et tout écart non nul est attribué à une cause nommée.
- **FR-007**: Chaque section posée DOIT s'adapter à la largeur de la page (« w-auto », comme les sections déjà montées) : aucune largeur fixe portée par le contrat — racine (Réassurances 1550 px) ou enfants (plan 1152 px et colonne 576 px de Coordonnées) — n'est imposée à la page, et aucun débordement horizontal n'apparaît aux largeurs de contrôle du QA (largeur de référence et 1440 px). L'adaptation est réalisée côté addon, les contrats restant consommés tels quels (FR-005) ; le responsive mobile complet reste hors périmètre, au même titre que pour les sections déjà montées.

**Authoring gouverné**

- **FR-008**: Le rédacteur DOIT pouvoir modifier exactement les contenus au verdict « éditable » — et rien d'autre ; pour tout autre verdict, le geste d'édition lui-même DOIT être bloqué (l'absence de panneau ne suffit pas).
- **FR-009**: Les panneaux natifs Odoo indésirables DOIVENT être retirés pour les deux sections, conformément aux règles établies par 019 et à la table validée.
- **FR-010**: Pour Réassurances, chaque carte répétée DOIT être éditable individuellement selon les verdicts ; les gestes de collection (ajouter, dupliquer, supprimer) DOIVENT suivre exactement la décision de la gate, et tout geste non validé DOIT être neutralisé — y compris les gestes natifs de l'éditeur.

**Isolation et persistance**

- **FR-011**: Les modifications d'un rédacteur DOIVENT rester propres à l'instance posée : aucune propagation vers d'autres instances, d'autres pages ou le bloc source.
- **FR-012**: Les modifications DOIVENT survivre aux trois points de contrôle — sauvegarde, réouverture de l'éditeur, page publique — avec un contenu identique aux trois.

**Qualification**

- **FR-013**: Versions, lock et digest de l'addon DOIVENT être réalignés pour couvrir les deux sections, sans divergence résiduelle.
- **FR-014**: Toutes les portes de qualification Odoo existantes DOIVENT passer au vert sur instance propre, y compris la non-régression des sections déjà montées.
- **FR-015**: Un scénario QA par section, exécuté sur instance propre, DOIT couvrir : pose, rendu par défaut, adaptation en largeur (zéro débordement horizontal aux largeurs de contrôle — référence et 1440 px), éditions autorisées, tentatives interdites, gestes de collection (Réassurances), isolation et persistance ; son résultat est archivé dans les preuves de la spec.

### Key Entities

- **Section gouvernée** : unité posable dans l'éditeur Website, dérivée d'un contrat, portant une couche d'authoring gouvernée. Deux nouvelles dans cette vague : Coordonnées et Réassurances (portant le total de l'addon de 8 à 10).
- **Contrat consommé (tel quel)** :
  - `ds.coordonnees` 2.2.0 — props : `mapUrl`, `mapAlt` (fournis par le consommateur, défaut vide par conception), `accroche`, `titre` (texte riche) ; parts : plan Google (image), en-tête de section (titre/accroche routés depuis les props publiques), blocs Adresse, Horaires, Contact (avec segments soulignés et saut de ligne), Suivez-nous (icônes Facebook/Instagram).
  - `ds.reassurances` 1.2.0 — props : `disposition` (3 variantes, défaut « 4 cartes »), `items` (cartes : `titre`, `texte`, `imageUrl` fourni par le consommateur) ; parts : en-tête de section **fixé par composition** (titre, accroche, accroche2), cartes répétées (composition `ds.carte`), boutons d'appel à l'action propres à chaque variante, fixés par composition.
- **Table de verdicts d'éditabilité** : le livrable du gate humain — une par section, couvrant 100 % des props/parts, quatre verdicts possibles, validée par l'owner, archivée, et faisant foi pour le comportement livré.
- **Référence visuelle 020** : l'image de référence validée par l'owner pour chaque section ; base unique du delta visuel.
- **Lock / digest de l'addon** : l'alignement versions ↔ artefacts générés ↔ addon qui fait foi de la qualification (mécanisme 019).
- **Scénario QA** : parcours rejouable sur instance propre et jetable, à verdict binaire, archivé en preuve.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 2 tables de verdicts couvrant 100 % des props/parts de leur contrat sont validées par l'owner **avant** la première tâche d'implémentation d'authoring — zéro entrée sans verdict, zéro implémentation anticipée.
- **SC-002**: Les 2 sections se posent depuis l'éditeur sans erreur et affichent à la pose le contenu par défaut de leur contrat.
- **SC-003**: Le delta visuel contre la référence 020 est mesuré pour 2/2 sections ; 100 % des écarts non nuls sont chiffrés et attribués à une cause nommée ; zéro écart inexpliqué.
- **SC-004**: Au scénario QA, 100 % des éléments « éditable » sont modifiables avec succès et 0 élément d'un autre verdict n'est modifiable — toutes les tentatives interdites du scénario échouent, y compris sur le geste de texte direct et les gestes natifs de collection.
- **SC-005**: Le contenu modifié est identique aux 3 points de contrôle (sauvegarde, réouverture de l'éditeur, page publique) et 0 fuite n'est observée entre instances ou entre pages.
- **SC-006**: 100 % des portes de qualification Odoo sont vertes sur instance propre, versions/lock/digest alignés sans divergence, et les sections déjà montées restent toutes vertes (zéro régression).
- **SC-007**: Le comportement d'édition livré est conforme à 100 % aux tables validées (vérifié par les scénarios QA) — zéro divergence silencieuse entre le verdict et le comportement.
- **SC-008**: Aux deux largeurs de contrôle du QA (référence et 1440 px), 2/2 sections posées s'adaptent à la largeur de la page : zéro débordement horizontal, zéro largeur fixe de contrat imposée à la page.

## Assumptions

- **Hypothèse d'entrée de la vague « contenu »** : les mécanismes d'authoring prouvés par 019 (texte/texte riche, média, répétition simple, composition imbriquée, retrait de panneaux natifs, isolation d'instance) suffisent aux deux sections, sans exception structurelle. Si une capacité manquante apparaît en cours de route, elle est **nommée et remontée à l'owner** (arrêt sur la section concernée) — jamais contournée en silence.
- Les références visuelles validées en 020 existent pour les deux sections et font foi ; le Figma des deux sections est réparé et accepté (021). Ni 020 ni 021 ne sont rouverts.
- Les valeurs « fournies par le consommateur » (plan Google : `mapUrl`/`mapAlt` ; images de cartes : `items[].imageUrl`) reçoivent leur valeur de production au montage ; qui les fournit et leur statut d'édition sont tranchés à la gate humaine.
- La non-régression des 8 sections déjà montées fait partie de la qualification (le lock couvre l'addon entier), même si la demande ne la nomme pas explicitement.
- La qualification s'exécute sur instance propre et jetable, reconstruite pour l'occasion ; un bloc déjà posé étant une copie figée, la QA se fait sur pose fraîche.
- La version de `ds.reassurances` est **1.2.0** (relevée au dépôt — le brief ne la nommait pas) ; sa disposition par défaut est « 4 cartes ». Le choix de la ou des variantes exposées au rédacteur est une entrée de la table de verdicts (prop `disposition`), pas une décision prise ici.

## Out of Scope

- Le **formulaire** (spec séparée : l'envoi du formulaire est un inconnu à spiker).
- L'**en-tête** et le **pied de page** du site (workstream « shell », spec séparée / 023).
- Toute **réparation Figma** (faite en 021) et toute **nouvelle capacité** de contrat, de schéma, de moteur ou de tokens.
- Toute modification des contrats consommés, des tokens ou du core — les deux contrats entrent tels quels.
- Toute refonte des sections déjà montées : seule leur non-régression est due.
