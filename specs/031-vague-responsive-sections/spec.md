# Feature Specification: Vague responsive des sections

**Feature Branch**: `just-euphonium` (worktree Superset actif ; le plan nomme `031-vague-responsive-sections`)

**Created**: 2026-08-27

**Status**: Draft

**Input**: Décisions owner du 2026-08-27, en conversation, sur la base de la rétro 029 (`specs/029-figma-responsive-categories/RETRO-PROCESS.md`) et de l'outillage livré par 030.

**Le résultat, en une phrase et en langage designer** : chaque section livrée reçoit un
axe `Presentation` **visible dans le sélecteur de variantes Figma**, avec les valeurs
**Wide / Desktop / Mobile**, matrice complète, défaut = le membre historique ; toute
section bloquée est reportée par nom, avec son relais vers le chantier suivant.

---

## Clarifications

### Session 2026-08-27

- Q: Le renommage `HeroVideo.Presentation=Compact` vers `Mobile` doit-il constituer une treizième campagne autonome, en plus des douze sections de FR-002 ? → A: Oui — treizième campagne autonome avec capture avant, décision owner, application, vérification et registre ; les douze sections restent comptées séparément.
- Q: Si une des douze sections sort de la vague à cause d'un blocage nommé, la vague peut-elle être clôturée sans lui ajouter l'axe `Presentation` ? → A: Oui — clôture autorisée avec statut reporté, cause, décision owner et inscription obligatoire dans le brief du chantier suivant.
- Q: Lorsqu'une section possède déjà la matrice `Presentation` conforme, doit-elle se clôturer comme une campagne « sans changement » distincte des campagnes appliquées et reportées ? → A: Oui — audit vert, preuve de conformité, décision owner et ligne de registre, sans reçus d'application.
- Q: Si toutes les campagnes n'ont pas été examinées après 40 minutes, comment la séance doit-elle se terminer pour respecter la limite de 45 minutes ? → A: Continuer la séance au-delà de 45 minutes jusqu'à ce que chaque campagne ait reçu sa décision individuelle.
- Q: Si une campagne se bloque après la séance de validation, quand l'owner doit-il prendre la décision individuelle de report exigée par FR-018 ? → A: Pendant l'acceptation finale, avant que l'owner accepte la clôture globale.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - L'owner voit ce qu'il valide, et surtout ce qu'il n'aura pas (Priority: P1)

L'owner reçoit, pour chacune des treize campagnes, une planche au gabarit fixe qui dit en
français ce qu'il **verra** et ce qu'il **n'aura pas**, montre le sélecteur de variantes
**avant → après**, et présente les rendus à taille réelle **uniquement aux largeurs où la
sortie diffère**. Il valide campagne par campagne, en une séance.

**Why this priority**: C'est la parade directe à l'écart E2 de 029 — une conséquence
structurelle (le panneau de variantes) scellée en anglais abstrait, validée par un « go »
qui portait sur autre chose, découverte par l'owner à 20h45 et corrigée le soir même. Sans
cette story, la vague reproduit le malentendu douze fois.

**Independent Test**: Prendre une campagne préparée, générer sa planche, vérifier les 7
zones, la présence des mentions négatives en français, et la capture du sélecteur
avant→après. Une planche dont la zone « ce que vous n'aurez pas » est vide n'est pas
présentable.

**Acceptance Scenarios**:

1. **Given** une campagne préparée avec ses témoins, **When** sa planche est produite,
   **Then** elle porte les 7 zones, la distribution d'usage réelle (configuration
   dominante d'abord, exception marquée), les mentions négatives en français, et
   l'archive technique **référencée sans être étalée**.
2. **Given** une décision de design dont un fait accepté touche la topologie du set, le
   sélecteur, les axes ou les Text Styles, **When** la décision est validée, **Then**
   elle est refusée par nom si elle ne porte pas sa phrase française de conséquence
   sélecteur **et** sa capture du sélecteur.
3. **Given** la séance owner, **When** l'owner prononce un mot d'accord, **Then** ce mot
   couvre **exactement une** décision d'**une** campagne ; aucun accord ne couvre un lot.

---

### User Story 2 - Les 12 sections sont proposées, l'owner ne corrige que ce qui cloche (Priority: P1)

Pour chaque section, la version mobile est **dérivée de ce que la section est réellement**
— grille, formulaire, liste, média — et de son usage relevé sur les Pages. L'owner reçoit
12 propositions finies et n'intervient que là où la proposition est fausse.

**Why this priority**: C'est le modèle de travail tranché par l'owner le 2026-08-27. Une
règle mobile globale unique a été **explicitement rejetée** : une FAQ, un formulaire et
une grille d'équipe ne deviennent pas la même chose en mobile. À l'inverse, faire arbitrer
l'owner section par section sans proposition ferait passer sa séance de 45 min à ~2 h et le
remettrait en position de rattraper le travail.

**Independent Test**: Sur une section, vérifier que la proposition mobile est justifiée
par des faits relevés (structure observée + usages comptés) et non par une règle générique
appliquée aveuglément ; vérifier que les défauts D1–D9 sont appliqués et que toute
dérogation porte sa ligne motivée.

**Acceptance Scenarios**:

1. **Given** une section relevée, **When** sa proposition mobile est produite, **Then**
   elle applique les défauts de la fiche D1–D9, et **chaque écart** à ces défauts porte une
   ligne motivée sur la planche.
2. **Given** une section qui ne peut pas être traitée proprement — capacité runner
   manquante, enfant qui casse, structure hors vocabulaire — **When** l'anomalie est
   constatée, **Then** la section **sort de la vague** avec une décision nommée, et les
   autres continuent. Elle n'est jamais bricolée ; la vague peut se clore avec cette
   campagne au statut « reporté » et son relais nommé vers le chantier suivant.

---

### User Story 3 - Une journée, deux touches owner, aucune dérive silencieuse (Priority: P2)

La vague s'exécute en une journée : préparation parallèle sans owner, **une** séance de
validation, une section pilote, l'application en lot, **un** cycle de vérification global,
la clôture. L'owner est sollicité **deux fois** : la séance, et l'acceptation finale.

**Why this priority**: P2 parce que le résultat serait juste même en séquentiel — le
parallélisme fait gagner du temps, pas de la justesse. Les puits mesurés en 029 (82 min
d'attente owner à vide, 47 min de refonte de présentation, un axe de livraison faux jamais
re-vérifié contre la spec) sont adressés ici.

**Independent Test**: Rejouer le déroulé sur les artefacts d'une section et vérifier que
chaque gate re-cite les exigences du résultat attendu et coche celles que la campagne
couvre.

**Acceptance Scenarios**:

1. **Given** un gate de la vague, **When** il est franchi, **Then** il re-cite les
   exigences de ce document et coche explicitement lesquelles la campagne couvre — un
   livrable ne peut pas suivre le mauvais axe une journée entière sans que rien ne le dise.
2. **Given** la section pilote, **When** sa chaîne complète échoue ou dérive, **Then** la
   vague **s'arrête**, un correctif et sa fixture sont produits, et aucun contournement
   manuel n'est posé.
3. **Given** la séance owner, **When** elle dépasse 45 minutes, **Then** elle continue
   jusqu'à ce que chaque campagne ait reçu sa décision individuelle ; aucune campagne
   n'est reportée ou approuvée en rafale pour tenir une limite de durée.
4. **Given** une campagne bloquée après la séance de validation, **When** l'acceptation
   finale commence, **Then** l'owner prend d'abord sa décision individuelle de report,
   avant de pouvoir accepter la clôture globale.

---

### Edge Cases

- **Un enfant casse** (témoin mobile inaccessible, contenu qui déborde) : la section sort
  du lot avec une décision nommée, la preuve du blocage et une entrée au brief du chantier
  suivant ; les autres continuent et la vague peut se clore avec la campagne reportée.
- **Un verrou de largeur hérité** est trouvé sur une surface cible : il est nommé avant
  toute mutation ; il est corrigé à la source, ou porté en dérogation motivée référencée à
  une décision owner. Jamais ignoré.
- **Le renommage `Compact` → `Mobile`** sur `HeroVideo` est une mutation d'un master déjà
  livré : elle constitue la treizième campagne autonome de la vague, avec capture avant,
  décision owner, application, vérification et ligne de registre propres.
- **Moins de trois canaux d'écriture sains** vers Figma : repli séquentiel, annoncé, avec
  son coût en temps — jamais deux agents sur la même zone.
- **Une section dont le sélecteur change** ne peut pas passer en lot standard : elle sort
  d'office vers le lot à décisions.
- **Une section déjà responsive** : le relevé le constate et la section se clôture sans
  mutation, avec un verdict « sans changement », un audit vert, sa preuve de conformité,
  une décision owner et une ligne de registre ; aucun reçu d'application n'est fabriqué.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Chaque section du périmètre qui n'est pas reportée selon FR-018 MUST recevoir
  un axe `Presentation` visible dans le sélecteur de variantes, avec les valeurs `Wide`,
  `Desktop` et `Mobile`, la matrice complète des combinaisons avec les axes existants, et
  le membre historique comme défaut.
- **FR-002**: Le périmètre MUST être exactement : `faq`, `sav`, `reassurances`, `equipe`,
  `coordonnees`, `formulaire`, `google-reviews-section`, `presentation`, `devis`, `hero`,
  `produits-ecommerce`, `texte-seo`. Ces douze sections forment douze campagnes distinctes.
  Le renommage `Compact` → `Mobile` de `HeroVideo`, composant distinct de `hero`, forme une
  treizième campagne autonome. `header` et `footer` sont **hors périmètre**.
- **FR-003**: La version mobile de chaque section MUST être dérivée de la structure
  observée de cette section et de son usage relevé sur les Pages. Aucune règle mobile
  unique n'est appliquée uniformément aux douze.
- **FR-004**: Les défauts de la fiche de décisions D1–D9 MUST s'appliquer à chaque section ;
  toute dérogation MUST porter une ligne motivée sur la surface de décision owner.
- **FR-005**: Chacune des treize campagnes MUST recevoir une surface de décision owner au
  gabarit fixe : usage réel pondéré, « ce que vous verrez », « ce que vous n'aurez pas »,
  sélecteur avant→après, témoins à taille réelle **seulement aux largeurs où la sortie
  diffère**, décisions en une ligne, pied référençant l'archive technique sans l'étaler.
- **FR-006**: Toute conséquence **invisible dans un rendu** — topologie du set, sélecteur
  de variantes, axes, Text Styles — MUST figurer sur la surface de décision en langage
  designer **et** porter une capture du sélecteur. Une décision qui n'en porte pas MUST
  être refusée par nom.
- **FR-007**: L'état de chaque cible MUST être capturé **avant** toute mutation, pour
  **toutes** les cibles concernées et non pour un sous-ensemble pilote, chaque capture
  vérifiée non vide et correctement dimensionnée.
- **FR-008**: Les verrous dimensionnels hérités MUST être relevés et nommés avant toute
  tentative d'application ; un verrou non couvert par une dérogation référencée MUST
  refuser l'application.
- **FR-009**: La première section traitée MUST exercer en conditions réelles la capacité
  « créations déclarées dans un set existant », avec son second passage sans effet
  automatisé. Un échec MUST arrêter la vague et produire un correctif accompagné de sa
  vérification automatisée — jamais un contournement manuel.
- **FR-010**: Les écritures parallèles MUST porter sur des zones disjointes, avec **un
  seul** cycle de vérification global possédé par l'orchestrateur ; aucun agent d'écriture
  ne conduit sa propre vérification.
- **FR-011**: Chaque gate MUST re-citer les exigences de ce document et cocher lesquelles
  la campagne couvre.
- **FR-012**: L'owner MUST être sollicité exactement deux fois : la séance de validation et
  l'acceptation finale. Un mot de l'owner MUST couvrir exactement une décision. L'ordre
  interne de la seconde sollicitation est fixé par FR-018.
- **FR-013**: L'axe `Presentation` MUST rester non promu dans le contrat du composant. Le
  comportement responsive appartient au code ; promouvoir l'axe en réglage d'auteur MUST
  être refusé. Chaque campagne livrée, y compris le renommage de `HeroVideo`, MUST porter
  son acquittement de parité nommé ; une campagne reportée MUST prouver qu'aucune mutation
  n'a introduit de nouvelle dérive.
- **FR-014**: Chacune des treize campagnes — les douze sections et le renommage autonome
  de `HeroVideo` — MUST produire exactement un manifeste généré, un audit frais, **une**
  décision de validation owner et **une ligne** au registre d'écarts de vague. Une campagne
  « appliquée » MUST en plus porter les reçus machine de son application et de sa
  vérification ; une campagne « sans changement » MUST porter un audit vert et la preuve
  de conformité existante, sans reçu d'application ; une campagne « reportée » MUST porter
  la preuve du blocage, la référence de son entrée au brief suivant et, dans le cas prévu
  par FR-018, sa décision de report. Aucune prose de spécification, de plan ou de recherche
  par campagne.
- **FR-015**: Le runner MUST rester inchangé pendant la vague. Une section exigeant une
  capacité nouvelle MUST sortir de la vague et faire l'objet d'un chantier dédié.
- **FR-016**: Les réductions typographiques mobiles MUST être posées en override local
  étiqueté comme dette à unifier, jamais comme nouveau style gouverné. L'inventaire
  complet MUST exister à la clôture, comme entrée de la décision d'unification ultérieure.
- **FR-017**: La clôture MUST produire un état avant et un état après épinglés et nommés,
  la finalisation des treize campagnes depuis un dossier de décisions partagé, le registre
  d'écarts, et une entrée datée au journal des jalons.
- **FR-018**: Une campagne bloquée MAY être finalisée au statut « reporté » sans sa
  mutation attendue afin que la vague se clôture ; pour une section, l'axe `Presentation`
  peut donc rester absent. Ce statut MUST nommer la cause, référencer la preuve du blocage
  et la décision owner, et inscrire la cible dans le brief du chantier suivant. Si le
  blocage apparaît après la séance de validation, la décision de report MUST être
  recueillie au début de l'acceptation finale, avant l'acceptation de la clôture globale.
  Il compte comme campagne finalisée, jamais comme résultat livré.
- **FR-019**: Une section dont l'audit prouve que la matrice `Presentation` attendue est
  déjà entièrement conforme MUST être finalisée au statut « sans changement », sans
  mutation ni reçu d'application. Son audit vert, sa preuve de conformité, sa décision
  owner et sa ligne de registre constituent son dossier de clôture ; elle compte comme
  section livrée.

### Key Entities

- **Section** : un des douze composants du périmètre, avec sa structure observée, ses
  usages relevés sur les Pages et son verdict de fin de vague.
- **Surface de décision owner** : la planche d'une campagne — sept zones, français, delta
  seulement, conséquence sélecteur incluse.
- **Décision de design** : un choix owner enregistré, avec sa phrase de conséquence
  sélecteur, la nature de chaque fait accepté et son témoin.
- **Décision de report** : la disposition owner d'une campagne bloquée après validation ;
  elle remplace l'autorisation d'appliquer tout en conservant la décision de design déjà
  enregistrée.
- **Registre d'écarts de vague** : une ligne par campagne — ce qui a dévié du défaut, avec
  sa cause datée et sa disposition.
- **Fiche de décisions D1–D9** : les règles de vague signées avant la première section,
  entrée de tout le travail.
- **Verdict de campagne** : exactement l'un des trois états terminaux `appliquée`, `sans
  changement` ou `reportée`, chacun avec le dossier de preuve défini par FR-014.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Chaque section livrée porte un sélecteur `Presentation` avec `Wide`,
  `Desktop` et `Mobile`, et chaque combinaison d'axes commute correctement — vérifié
  section par section, pas par sondage. Le bilan nomme séparément le nombre de sections
  livrées sur douze et chaque section reportée selon FR-018 ; zéro section reste sans
  verdict.
- **SC-002**: L'owner est sollicité **exactement deux fois** au total : une séance de
  validation qui couvre individuellement les treize propositions, puis l'acceptation
  finale qui tranche d'abord chaque report apparu après la séance avant la clôture globale.
- **SC-003**: Les treize campagnes portent chacune l'ensemble minimal conditionnel de
  FR-014 — application prouvée, conformité existante prouvée ou report prouvé — et
  **rien d'autre**.
- **SC-004**: Toutes les identités historiques sont préservées : aucun composant ne change
  d'identité, aucun usage sur les Pages ne se détache, et rien n'est écrit directement sur
  une Page.
- **SC-005**: Le second passage de chaque campagne appliquée est **entièrement sans
  effet** : zéro nœud créé, zéro nœud modifié.
- **SC-006**: Zéro campagne bricolée : toute cible non conforme au défaut porte soit une
  dérogation motivée, soit une sortie de vague nommée.
- **SC-007**: La séance de validation ne se termine qu'après une décision individuelle
  pour chacune des treize campagnes ; zéro campagne est reportée ou approuvée en groupe
  pour tenir une limite de durée.
- **SC-008**: Aucune surface générée existante ne change : le contrôle des sorties
  générées est vide à la clôture, hors dette déjà nommée et inchangée.
- **SC-009**: Chaque conséquence invisible au rendu introduite par la vague figure sur une
  surface de décision en français, avec sa capture du sélecteur — zéro exception.

---

## Assumptions

- **La fiche D1–D9 est signée** (2026-08-27) et fait autorité :
  `specs/030-outillage-vague-responsive/inventory/fiche-decisions-vague.md`. Les sections
  ne re-posent que leurs dérogations.
- **L'outillage de 030 est consommé tel quel** et ne change pas pendant la vague :
  génération de manifeste, allègement des preuves, enchaînement de la chaîne en une
  invocation avec reprise, relevé des verrous hérités, génération de planche, schéma de
  décision étendu. Aucune vérification automatisée nouvelle n'est attendue par section.
- **Deux prérequis sont MESURÉS au lancement, pas supposés** : (1) la fraîcheur du cliché
  de référence des composants Figma est **établie par comparaison** — la limite ouverte
  depuis 017 a pu être refermée par 029 sans que la prose le dise ; un cliché divergent est
  rafraîchi avant la première mutation. (2) Le nombre de canaux d'écriture sains est
  **compté**. Moins de trois n'est **pas un blocage** : c'est un repli séquentiel annoncé
  avec son coût en temps, jamais subi. Un seul prérequis est bloquant : la fiche D1–D9
  signée.
- **Le responsive vit dans le code**, pas dans le contrat. L'axe `Presentation` reste un
  outil de conception et de validation côté Figma ; il ne devient pas un réglage que
  l'auteur d'une page choisit.
- **La séance owner se tient sur des planches finies**, produites avant la séance et non
  retouchées pendant.
- **Le renommage `Compact` → `Mobile`** de `HeroVideo` fait partie de la vague comme
  treizième campagne autonome, distincte des douze campagnes de section.
- Le registre des enfants restés à traiter en fin de vague constitue le brief du chantier
  suivant ; il n'est pas traité ici.
