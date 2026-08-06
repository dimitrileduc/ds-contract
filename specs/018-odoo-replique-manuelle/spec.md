# Feature Specification: Répliquer à la main une chaîne gouvernée en blocs Odoo 19

**Feature Branch**: `018-odoo-replique-manuelle`
**Created**: 2026-08-06
**Status**: Draft
**Input**: Énoncé construit à partir de la session d'exploration du 2026-08-06 (voir § Ce que la session a établi) : « Répliquer à la main une chaîne de trois composants gouvernés — `ds.presentation → ds.section-header → ds.button` — en blocs Odoo 19 sur une instance jetable, aux usages d'Odoo, avec nos jetons pour tout le style ; puis mesurer ce qu'il faut pour décider si un émetteur vaut le coup. L'émetteur n'est pas dans le périmètre. La décision l'est. »

## Ce que cette spec est, et ce qu'elle n'est pas

C'est une spec de **dérisquage**, du même genre que la 014 : elle ne livre pas une capacité au produit, elle produit **des faits mesurés et une décision documentée**. Elle écrit un artefact de référence, jamais du code livré.

Elle existe parce que tout ce qu'on sait aujourd'hui d'Odoo 19 vient de la **lecture de son code source**. Rien n'a jamais tourné. Une spec de génération écrite sur des faits lus spécifierait probablement la mauvaise chose.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - La chaîne de trois composants existe sur une page Odoo (Priority: P1)

En tant que mainteneur, j'installe un module sur une instance Odoo 19 neuve, je pose la section `Présentation` sur une page, et j'obtiens à l'écran ce que les trois contrats décrivent — la section, son en-tête, son bouton — sans qu'aucune valeur de style n'ait été écrite à la main.

**Why this priority**: C'est la tranche entière en un geste. Elle prouve d'un coup les quatre mécanismes qui portent tout le reste : un modèle par composant, l'appel d'un modèle par un autre sur trois niveaux, un seul bloc posable pour trois composants, et nos jetons comme source de tout le style. Si cette user story seule est faite, on sait déjà si le projet est possible.

**Independent Test**: Sur une instance jetable et neuve, installer le module, ouvrir l'éditeur, poser la section depuis le panneau, enregistrer, recharger la page publique — et constater que les trois composants sont rendus, imbriqués, habillés par les jetons.

**Acceptance Scenarios**:

1. **Given** une instance Odoo 19 neuve, **When** le module est installé, **Then** l'installation se termine sans erreur et la section apparaît dans le panneau de blocs.
2. **Given** la section posée sur une page, **When** la page publique est rechargée, **Then** l'en-tête et le bouton sont rendus à l'intérieur — l'imbrication sur trois niveaux tient.
3. **Given** le module produit, **When** on cherche une valeur de style invisible, **Then** il n'y en a aucune : toute couleur, tout espacement, toute typographie vient du vocabulaire de jetons gouverné — à l'exception des littéraux **déclarés au registre du module**, épinglés contre leur contrat, qui se comptent à part et jamais en silence.
4. **Given** le panneau de blocs, **When** on cherche l'en-tête et le bouton comme entrées posables, **Then** ils n'y figurent pas — seule la section est posable, les deux autres sont des modèles appelés par elle.

---

### User Story 2 - Le rédacteur ne peut faire que ce qui a été décidé (Priority: P2)

En tant qu'owner, je veux qu'un rédacteur posé devant ce bloc puisse modifier exactement ce que nous avons décidé qu'il modifie — et rien d'autre. Ni déplacer un élément, ni en supprimer un, ni se voir proposer un réglage que nous n'avons pas mis là.

**Why this priority**: C'est la promesse de gouvernance, et c'est la partie la moins certaine de tout le dossier. Les leviers existent tous, vérifiés un par un dans le code d'Odoo 19 — mais **leur combinaison n'est attestée nulle part** : c'est un montage, pas un patron éprouvé. Cette user story est la seule qui puisse le confirmer ou l'infirmer.

**Independent Test**: Poser le bloc, puis tenter méthodiquement chaque geste — taper dans chaque texte, cliquer chaque élément, ouvrir le panneau à chaque niveau, essayer de supprimer, déplacer, dupliquer — et comparer ce qui répond à ce qui a été déclaré.

**Acceptance Scenarios**:

1. **Given** un bloc posé, **When** le rédacteur tente de supprimer, déplacer ou dupliquer un élément intérieur, **Then** l'éditeur ne le propose pas.
2. **Given** un bloc posé, **When** le rédacteur clique successivement sur chaque partie, **Then** le panneau n'affiche **que** les réglages déclarés par nous — aucun réglage natif d'Odoo que nous n'aurions pas voulu (marges, colonnes, fond, recadrage, animation).
3. **Given** les zones déclarées modifiables, **When** le rédacteur les modifie et enregistre, **Then** la modification est celle rendue sur la page publique.
4. **Given** un texte déclaré modifiable, **When** la page est enregistrée **puis rouverte en édition**, **Then** il est **toujours** modifiable — le mécanisme survit à la sauvegarde.
5. **Given** la variante du bouton et la disposition de l'en-tête, **When** le rédacteur les change depuis le panneau, **Then** elles changent sur place, sans remplacer le bloc.

---

### User Story 3 - Le rendu Odoo coïncide avec notre surface existante (Priority: P3)

En tant que mainteneur, je veux savoir si nos jetons traversent réellement Odoo — c'est-à-dire si le même contrat, rendu par notre surface HTML existante et rendu dans Odoo, donne la même chose.

**Why this priority**: C'est le contrôle le moins cher qui existe et il teste le risque le plus concret : Odoo sert un cadre CSS sur toutes ses pages, et ce cadre style aussi les balises nues — marges de titres, hauteurs de ligne, apparence des liens. Nos contrats ont été extraits d'un contexte propre. Ce contrôle dit, en une journée, si le socle tient. Il ne demande ni maquette, ni instrument de mesure, ni décision préalable.

**Independent Test**: Rendre les trois contrats par la surface HTML du dépôt, rendre la page Odoo, comparer les deux images composant par composant — et nommer la cause dominante de chaque ligne qui dépasse le plancher de tolérance déclaré.

**Acceptance Scenarios**:

1. **Given** les trois contrats, **When** ils sont rendus par notre surface HTML et par Odoo, **Then** les deux rendus sont comparés par image — une ligne par composant, jamais à l'œil, et sans toucher à l'instrument de parité visuelle existant.
2. **Given** une ligne au-dessus du plancher de tolérance déclaré, **When** on cherche pourquoi, **Then** une cause dominante et une seule lui est attribuée, au vocabulaire de causes déjà gouverné — un style d'Odoo qui traverse, un jeton qui ne passe pas, une différence de balisage assumée.
3. **Given** une comparaison impossible, **When** le rapport est produit, **Then** il le dit — une mesure sautée n'est jamais comptée comme réussie.

---

### User Story 4 - La décision sur l'émetteur est prise sur des chiffres (Priority: P4)

En tant qu'owner, je veux décider si construire un générateur vaut le coup — sur ce qu'a réellement coûté le montage à la main, pas sur une intuition.

**Why this priority**: C'est la raison d'être de la spec. Elle est en dernier parce qu'elle mesure les trois précédentes : sans elles, il n'y a rien à chiffrer.

**Independent Test**: Lire le rapport de décision et pouvoir répondre oui ou non sans rouvrir le code.

**Acceptance Scenarios**:

1. **Given** les trois composants montés, **When** le rapport est produit, **Then** il donne, pour chacun : le volume écrit, la part **mécanique** (dérivable du contrat) et la part **cas particulier** (qui a demandé un jugement).
2. **Given** le montage terminé, **When** on regarde les quatre leviers de gouvernance, **Then** le rapport dit lequel a tenu, lequel a lâché et par quoi il a fallu le remplacer, et lequel **n'a pas été exercé** et pourquoi.
3. **Given** le rapport, **When** l'owner le lit, **Then** il contient une recommandation argumentée : construire l'émetteur, écrire les blocs à la main et les gouverner autrement, ou arrêter.
4. **Given** la recommandation « construire », **When** on cherche son dimensionnement, **Then** le rapport donne un ordre de grandeur adossé aux volumes mesurés et au précédent interne du dépôt.
5. **Given** le rapport, **When** on cherche ses angles morts, **Then** il nomme ce que ses chiffres ne permettent pas de conclure — notamment ce que vaut le passage de 3 composants à 34, et ce que la chaîne retenue n'a pas exercé.

---

### Edge Cases

- **Un des quatre leviers de gouvernance ne tient pas.** C'est le risque principal : la combinaison est un montage, pas un patron attesté. Le repli est de tomber sur l'exclusion explicite, réglage par réglage. Ce n'est pas un échec silencieux — le levier qui a lâché est consigné avec ce qui l'a remplacé.
- **Le mécanisme de réglages d'Odoo 19 s'avère plus coûteux que lu.** Il a été entièrement remplacé entre la 18 et la 19, il est en JavaScript, et la documentation officielle ne couvre qu'une petite partie de ce qu'on utilise. Si le coût explose, c'est un **résultat** de la spec, pas un dépassement.
- **Le cadre CSS d'Odoo traverse malgré la portée.** Ses styles s'appliquent aux balises nues, pas seulement à ses classes. Si une portée bornée ne suffit pas, l'écart est mesuré et sa cause nommée, jamais absorbée.
- **Un texte déclaré modifiable ne l'est plus après enregistrement.** Vérifié dans le code : l'attribut qui rend un texte modifiable est effacé à la sauvegarde. Si le mécanisme de remplacement ne tient pas, c'est une découverte à consigner, pas à contourner.
- **Un fait qu'un contrat porte et que le montage n'exprime pas.** Il est déclaré comme non-porté nommé, lisible depuis l'artefact — jamais omis en silence.
- **L'instance jetable ne se monte pas.** La preuve se fait à la demande et se consigne ; la suite de contrôles standard du dépôt reste hermétique et n'en dépend jamais.

## Requirements *(mandatory)*

### Ce qui est produit

- **FR-001**: Le montage MUST couvrir exactement trois composants gouvernés — `ds.presentation`, `ds.section-header`, `ds.button` — et la chaîne d'imbrication qui les relie.
- **FR-002**: Chaque composant MUST devenir un modèle Odoo distinct, la section appelant l'en-tête et le bouton. L'imbrication MUST être portée par le mécanisme d'appel entre modèles d'Odoo, jamais par de la duplication de balisage.
- **FR-003**: **Seule la section** MUST être déclarée comme bloc posable dans le panneau. L'en-tête et le bouton restent des modèles appelés — présents dans le module, absents du panneau.
- **FR-004**: Le montage MUST être écrit **à la main**, aux usages d'Odoo, jamais généré. C'est délibéré : on ne peut pas écrire un générateur pour une cible qu'on n'a jamais produite une fois. **Une seule exception, nommée : le fichier de jetons du module** (FR-005b), qui est produit par le pipeline — recopier des centaines de valeurs à la main serait exactement la dérive que FR-005 interdit. La règle se lit donc : le *balisage*, les *réglages* et la *déclaration de bloc* sont écrits à la main ; le *style* ne l'est jamais.
- **FR-004b**: Le montage MUST exprimer **en entier** la dimension d'icône que le contrat du bouton porte : les **19 glyphes du registre d'icônes gouverné** embarqués dans le module, la présence d'une icône et le choix du glyphe tous deux exprimables. Le **choix du glyphe** MUST en outre être exercé comme réglage sur l'instance — c'est la seule liaison par échange d'instance de toute la chaîne, et la seule fois qu'un registre gouverné franchit la frontière Odoo : elle doit recevoir une confirmation en fonctionnement (FR-013), pas une lecture. Ce que le tableau des zones (FR-009) offre au rédacteur pour les **autres** réglages d'icône reste la décision de ce tableau.

### Le style

- **FR-005**: Toute valeur de style MUST provenir du vocabulaire de jetons gouverné. **Aucune valeur invisible** — c'est-à-dire aucune valeur que rien ne compare et que rien ne surveille. C'est la dérive exacte que la spec 015 a fermée côté code, et sa doctrine est écrite mot pour mot dans le registre qu'elle a produit : *« la doctrine vise zéro valeur INVISIBLE, pas zéro littéral »*. **Conséquence tenue, et bornée** : un littéral qu'un contrat porte **déjà** et pour lequel **aucun token de même valeur n'existe** MAY être exprimé comme **littéral nommé** — inscrit dans un registre local au module, de la même forme que `contracts/named-literals.registry.json`, sa valeur **épinglée byte-à-byte contre celle du contrat**, avec sa raison. Tout le reste MUST venir d'une référence de token. Un nombre écrit à la main **sans être déclaré** reste le défaut que cette exigence existe pour fermer.
- **FR-005b**: Le vocabulaire de jetons MUST arriver dans le module par une **sortie supplémentaire et additive du pipeline de jetons existant** — un fichier généré, jamais écrit ni recopié à la main. Trois conséquences tenues ensemble : (a) c'est du code de dépôt, donc la suite de contrôles standard s'applique intégralement au changement ; (b) la sortie est **additive** — les sorties existantes ne changent pas d'un octet, la surface livrée aux consommateurs n'est pas touchée ; (c) la sortie porte le préfixe exigé par FR-008, que les sorties existantes ne portent pas.
- **FR-006**: Nos composants MUST porter leurs propres classes et leur propre habillage, sans dépendre des classes du cadre CSS d'Odoo pour ce que les contrats décrivent.
- **FR-007**: Le cadre CSS d'Odoo MUST rester en place et n'être ni retiré ni neutralisé — le squelette du site (en-tête, menu, pied de page) en dépend. Ce qui déborde de lui sur nos composants MUST être repris dans une portée qui nous appartient, jamais par une bataille globale.
- **FR-008**: Nos noms de variables de style MUST être préfixés de façon à ne pouvoir entrer en collision avec ceux qu'Odoo publie. Le préfixe est porté **par la sortie Odoo seule** (FR-005b) : les sorties existantes du pipeline restent sans préfixe, les renommer ferait onduler le changement à travers toutes les surfaces générées — hors de proportion avec une spec de dérisquage, et sans rapport avec ce qu'elle cherche à savoir.

### La gouvernance

- **FR-009**: Pour chacun des trois composants, un **tableau des zones** MUST être écrit avant son montage : chaque réglage porté par le contrat, déclaré modifiable ou figé, **avec sa raison**. La règle est : un réglage est offert au rédacteur s'il a une raison métier de le changer sur son site.
- **FR-010**: Une fois posé, un bloc MUST avoir sa structure verrouillée : aucun élément intérieur supprimable, déplaçable, dupliquable ou ajoutable, hors de ce que le tableau des zones déclare.
- **FR-011**: Le panneau de réglages MUST n'afficher, sur nos blocs, que ce que nous y avons inscrit. Aucun réglage natif d'Odoo non voulu.
- **FR-012**: Un texte déclaré modifiable MUST le rester **après enregistrement et réouverture** de la page.
- **FR-013**: Les mécanismes de gouvernance MUST être vérifiés **en fonctionnement**, pas par lecture de code. Ce qui a été établi en lisant le code d'Odoo est une hypothèse jusqu'à ce qu'une instance le confirme.

### L'honnêteté

- **FR-014**: Tout concept qu'un contrat porte et que le montage n'exprime pas MUST être déclaré comme non-porté nommé, lisible depuis l'artefact. Une omission silencieuse est un défaut de sévérité maximale.
- **FR-015**: L'artefact produit MUST être identifié comme une **référence**, jamais comme un livrable client. Il est écrit à la main, donc gouverné par personne : le poser sur un site réel créerait une surface que rien ne surveille.
- **FR-015b**: L'artefact MUST vivre **sous le dossier de cette spec**, et la sortie de jetons de FR-005b MUST y être écrite directement par le pipeline — marquée comme générée, refaite par la commande de jetons ordinaire. Il ne va **pas** dans le dossier d'exemples du dépôt : celui-ci est déjà touché par les re-pins, et y ranger un artefact que rien ne gouverne en ferait une source de faux rouges. Le ranger sous la spec **dit ce qu'il est** — un reçu de spec, hors de toute porte —, ce qui est le patron déjà employé par les specs 003, 005 et 007.
- **FR-016**: Chaque levier de gouvernance qui **lâche** MUST être consigné avec ce qui l'a remplacé — jamais corrigé en silence. Un levier que la chaîne retenue **n'exerce pas** MUST recevoir le verdict explicite « non exercé » assorti de sa raison — un levier sans verdict est un défaut, un verdict négatif n'en est pas un.

### La décision

- **FR-017**: Un **rapport de décision** MUST être produit, donnant pour chaque composant : le volume écrit, la part mécanique et la part de cas particulier.
- **FR-017b**: La **règle qui décide** si une ligne écrite est mécanique ou cas particulier MUST être écrite **avant le montage**, pas au moment de compter. C'est le chiffre porteur de toute la spec : une règle posée après avoir vu le code classerait ce qu'on a envie de classer, et la mesure ne serait plus falsifiable. Le classement se fait **en écrivant**, il ne se reconstitue pas après.
- **FR-018**: La décision de construire ou non l'émetteur appartient à l'owner, **au vu du rapport et sans seuil préétabli**. Le rapport MUST donc fournir de quoi décider plutôt qu'un verdict : les volumes mesurés, la part mécanique, l'état des leviers, une recommandation argumentée avec ses raisons, et un ordre de grandeur si la recommandation est de construire.
- **FR-018b**: Le rapport MUST nommer **ce que ses chiffres ne permettent pas de conclure** — au minimum : ce que vaut l'extrapolation de 3 composants à 34, et ce que la chaîne retenue n'a pas exercé (la répétition d'un élément). Sans seuil préétabli, l'honnêteté sur les angles morts du rapport est la seule chose qui empêche une décision à l'humeur de se déguiser en décision informée.
- **FR-019**: Si la voie retenue est de construire l'émetteur, celui-ci MUST rester une transformation déterministe : **aucun modèle de langage dans le chemin de génération**. Un modèle peut aider à écrire l'émetteur ; il ne peut pas être l'émetteur. C'est la règle n°1 du dépôt, et la rouvrir serait une décision explicite, jamais un repli.

### Key Entities

- **Modèle de composant** : le morceau de balisage réutilisable produit pour un contrat. Un par composant, appelable par les autres. Invisible au rédacteur.
- **Bloc posable** : l'entrée du panneau correspondant à la section. Une seule pour les trois composants.
- **Tableau des zones** : pour un composant, la liste de ses réglages avec, pour chacun, « modifiable » ou « figé », et la raison métier.
- **Levier de gouvernance** : un des quatre mécanismes d'Odoo qui ferme une porte — (1) verrouiller la structure, (2) empêcher un réglage d'apparaître, (3) tronquer ce qui remonte du parent, (4) rouvrir une image dans un cadre figé. Les trois premiers sont exercés par la chaîne retenue ; le quatrième ne l'est pas, et reçoit à ce titre un verdict « non exercé ».
- **Instance jetable** : l'environnement Odoo 19 neuf et éphémère où tout est prouvé, puis détruit.
- **Rapport de décision** : le livrable réel de la spec — les volumes, la part mécanique, l'état des leviers, la recommandation.
- **Non-porté nommé** : la déclaration lisible d'un fait qu'un contrat porte et que le montage n'exprime pas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sur une instance Odoo 19 neuve, l'installation se termine avec **0 erreur**, et la section se pose sur une page depuis le panneau.
- **SC-002**: **3 composants** rendus, **3 niveaux** d'imbrication portés par des appels entre modèles, **1 seule** entrée dans le panneau, **19 glyphes** du registre gouverné embarqués et le choix du glyphe exercé au moins une fois sur l'instance.
- **SC-003**: **0 valeur de style invisible** dans tout ce qui est produit : chaque valeur vient soit d'une **référence au vocabulaire de jetons**, soit d'une **entrée du registre de littéraux nommés** du module — épinglée contre le contrat, avec sa raison. Les deux comptes sont rapportés **séparément**, jamais agrégés en un « 0 » qui cacherait le second. Relevé du 2026-08-06, **à re-vérifier sur l'état fusionné** : **1** littéral nommé attendu (`letter-spacing: 3px` sur `ds.section-header/Accroche`, le seul littéral actif de la chaîne sans token de même valeur).
- **SC-004**: Sur un bloc posé, **0 réglage** non déclaré n'apparaît dans le panneau, et **0 élément** de structure n'est supprimable, déplaçable ou dupliquable hors de ce que le tableau des zones autorise.
- **SC-005**: **100 %** des zones déclarées modifiables le sont encore **après un enregistrement et une réouverture** de la page.
- **SC-006**: Le rendu Odoo et le rendu de notre surface HTML sont comparés par image, à la maille **un composant = une ligne**, soit **3 lignes**, chacune portant **exactement une cause dominante** prise au vocabulaire de causes déjà gouverné par le dépôt, sous un **plancher de tolérance déclaré** en dessous duquel aucune cause n'est due. **0 ligne** au-dessus du plancher ne reste sans cause, **0** verdict rendu à l'œil. La comparaison est **autonome** : l'instrument de parité visuelle gated n'est ni étendu ni modifié, et aucune instance Odoo n'entre sur le chemin de la suite de contrôles standard.
- **SC-007**: **4 leviers sur 4** ont un verdict écrit : tenu, lâché avec son remplaçant, ou **non exercé avec sa raison**. Aucun n'est laissé sans réponse. Le levier « rouvrir une image dans un cadre figé » est connu d'avance comme non exerçable — la chaîne retenue ne porte aucune image — et son verdict est donc « non exercé », jamais un silence ni un 4/4 obtenu en élargissant le périmètre.
- **SC-008**: Le rapport de décision donne les volumes des **3** composants, leur part mécanique et leur part de cas particulier — **chaque ligne classée par la règle écrite avant le montage** (FR-017b), **0** ligne non classée —, se conclut par **1** recommandation argumentée, et nomme **au moins 2** choses que ses chiffres ne permettent pas de conclure.
- **SC-009**: **0 fait** vérifié uniquement par lecture de code ne reste présenté comme acquis — chaque mécanisme utilisé a été confirmé sur l'instance, ou est marqué comme non confirmé.

## Assumptions

- **« Instance jetable » = neuve, éphémère, locale.** Montée puis détruite. C'est un environnement de preuve, jamais une cible de déploiement : aucun site client n'est touché par cette spec.
- **Les trois contrats sont pris tels qu'ils sont aujourd'hui**, sans les modifier. Cette spec teste une surface ; elle ne renégocie aucun contrat.
- **Le vocabulaire de jetons est produit en entier**, pas seulement ce que les trois composants consomment — c'est ce qui rendra un quatrième composant possible sans retouche. Il est **généré** par une sortie additive du pipeline existant (FR-005b) : c'est le seul endroit où cette spec touche au code du dépôt, et la seule chose qu'elle produise qui ne soit pas écrite à la main.
- **Les blocs natifs d'Odoo restent dans le panneau.** Les retirer est réversible en une ligne et relève d'une décision produit, pas de cette spec — qui ne livre à aucun client.
- **La preuve est un reçu de spec, pas une porte permanente.** La suite de contrôles standard du dépôt reste hermétique : aucune dépendance à une instance Odoo pour qu'elle passe. La preuve se lance à la demande et se consigne, comme les cycles de pont Figma des specs 003/005/007.
- **Le tableau des zones se décide pendant l'exécution**, une section réelle sous les yeux — sa rédaction est un livrable, pas un préalable. Son absence avant le montage n'est pas un trou : c'est l'ordre choisi.

## Out of Scope

Nommé explicitement — ce sont des décisions, pas des oublis :

- **L'émetteur.** Cette spec produit la décision de le construire ou non, jamais le générateur lui-même.
- **Le reste du catalogue.** Les 31 autres contrats ne sont pas montés.
- **La répétition d'un élément.** La chaîne retenue n'en contient pas. C'est une limite assumée : les 8 sections qui en dépendent restent non instruites, et ce sera le premier sujet de la spec suivante.
- **La livraison à un site client.** L'artefact est une référence, pas un produit.
- **Le retrait des blocs natifs d'Odoo du panneau**, et plus généralement la curation du catalogue offert au client.
- **La mise à jour d'un module déjà installé** et ce que deviennent les pages en place.
- **Le multilinguisme.**
- **La mesure de fidélité contre la maquette.** Le seul contrôle visuel de cette spec est la comparaison avec notre surface HTML — beaucoup moins cher, et suffisant pour ce qu'on cherche à savoir.
- **Toute remontée d'Odoo vers les contrats.** La surface Odoo est une sortie, jamais une entrée.

## Dependencies

- **Les trois contrats et le vocabulaire de jetons gouverné**, dans l'état où la spec 015 les a laissés — la géométrie côté code y siège sur des références gouvernées, ce dont FR-005 dépend directement.
- **Une instance Odoo 19 montable et détruisible.**
- **La surface HTML existante du dépôt**, qui fournit le terme de comparaison de la US3 sans rien construire de neuf.
- **Précédent interne à consulter** (règle du prior-art) : le dépôt a déjà livré un émetteur tiers enregistrable en exemple — environ 1350 lignes pour une surface complète. C'est l'ordre de grandeur auquel comparer le chiffrage du rapport de décision, avec une réserve : cet exemple produit **un seul** type de fichier, là où Odoo en demande trois.

### Ce que la session du 2026-08-06 a établi

Tout ce qui suit vient de la lecture du code source d'Odoo 19 et de sa documentation. **Rien n'a été exécuté.** C'est précisément ce que cette spec existe pour confirmer.

**Vérifié, et favorable :**

- Un modèle ordinaire, non déclaré comme bloc, peut être appelé par un bloc. Odoo le fait lui-même dans sept familles de composants natifs. L'imbrication n'a pas de limite de profondeur : la chaîne retenue en a 3, Odoo va jusqu'à 6.
- Les réglages se branchent par **classe CSS**, dans un registre unique où Odoo et un tiers inscrivent à égalité. Un même réglage sert donc un composant posé seul comme un composant imbriqué — un par contrat suffit.
- Un seul marqueur, posé sur un conteneur, ferme d'un coup la suppression, la duplication et le déplacement de tout ce qu'il contient.
- Une image reste remplaçable dans un cadre verrouillé : c'est un patron natif d'Odoo.
- Les réglages natifs peuvent être évités **sans les neutraliser**, en ne correspondant pas à leurs sélecteurs. Trois leviers existent pour ça, tous attestés isolément.
- Nos jetons peuvent alimenter les variables de thème d'Odoo, pour que son squelette ressemble au design system sans qu'on le reconstruise.
- Nos noms de variables actuels n'entrent en collision avec aucun des noms testés parmi ceux qu'Odoo publie.

**Vérifié, et défavorable :**

- Odoo 19 a **entièrement remplacé** le système de réglages de la 18. Un réglage est désormais du **code JavaScript**, pas une déclaration. Le générateur, s'il est construit, devra produire trois choses : des modèles, du JavaScript, et une déclaration par bloc.
- L'attribut qui rend un texte modifiable est **effacé à chaque enregistrement**. Le rendre durablement modifiable demande du code.
- La documentation officielle ne couvre **que deux** des marqueurs qu'on utilisera. Le reste est réel et employé par Odoo, mais non documenté : on s'appuie sur son code, pas sur un engagement.
- Le coût d'un changement de version majeure est élevé : entre la 18 et la 19, la communauté OCA est passée de 22 modules maintenus à 4, et le seul intégrateur publiant une rétrospective conclut qu'il faut « rester aussi proche que possible du standard ».

**Écarté sur preuve :**

- **Retirer le cadre CSS d'Odoo** : aucun récit de réussite, toutes versions confondues, et il sert aussi aux documents imprimés.
- **Ajouter un autre cadre CSS** : un seul dépôt public au monde, dont le code montre qu'il n'a jamais fonctionné.

**Non tranché, et honnêtement :**

- Aucun précédent **public** de design system externe branché sur Odoo. Réserve importante : l'écosystème des thèmes Odoo est fermé et payant, il ne vit pas sur les dépôts publics. C'est une absence de preuve, pas une preuve d'absence.

## Limites nommées (déclarées, jamais silencieuses)

- **L'artefact est écrit à la main, donc gouverné par personne.** Aucun différentiel ne le surveille, aucun contrat ne le prouve. C'est une exception délibérée et bornée : il sert de référence à un générateur futur, et il ne va sur aucun site.
- **La combinaison des leviers de gouvernance n'est pas un patron attesté.** Chaque levier existe seul dans le code d'Odoo ; leur emploi ensemble est une construction de cette spec. C'est le risque n°1 et l'objet de la US2.
- **La répétition n'est pas instruite.** La chaîne retenue n'en contient pas, alors que 8 des sections du catalogue en dépendent. La spec ne dit rien de ce que ça coûtera.
- **Une seule chaîne, choisie pour être lisible.** Ses deux composants enfants sont déjà mesurés propres. Les chaînes passant par un composant à photo auraient noyé toute mesure sous la frontière image, limite connue et non repoussée ici.
- **Le levier « rouvrir une image dans un cadre figé » n'est pas exercé.** Conséquence directe du choix de chaîne ci-dessus : aucun des trois contrats ne porte d'image. Le levier reste donc une hypothèse lue dans le code d'Odoo, jamais confirmée en fonctionnement — il reçoit un verdict écrit « non exercé » (SC-007), et le rapport de décision ne peut rien conclure sur son coût. C'est la première chose qu'une chaîne à photo aurait à instruire.
- **Le contrôle visuel n'est pas une mesure de fidélité.** Comparer Odoo à notre surface HTML dit si les jetons traversent ; ça ne dit rien de la conformité à la maquette. Cette question est renvoyée, nommée.
- **La typographie n'est pas dans le vocabulaire de géométrie gouverné.** La porte de 015 ferme un ensemble **fermé** de canaux de mise en page (`width`, `height`, `min-*`, `gap`, `padding-*`, plus `background-image` en exception) ; `line-height` et `letter-spacing` n'y sont pas, et `ROADMAP.md` range les 89 littéraux de trait, peinture et typographie dans le travail **non assigné**. 018 hérite donc de ce trou, elle ne le crée pas et ne le ferme pas : elle le rend **visible** par un registre local (FR-005). Minter le token manquant est le vrai correctif de fond ; il appartient à la spec des 89 littéraux, et son prix est chiffré dans `research.md` §D4.

## Clarifications

### Session 2026-08-06

- Q: Qu'est-ce qui fait qu'un émetteur « vaut le coup » ? Sans critère écrit **avant** le montage, le rapport de décision (US4) n'est pas falsifiable — on regarde les chiffres à la fin et on tranche à l'humeur. → A: **Aucun seuil préétabli. L'owner décide au vu du rapport.** Les deux seuils envisagés étaient faux pour la même raison : fixer « 80 % de part mécanique » ou « plus cher que 34 montages manuels » avant de savoir ce qu'on mesure, c'est inventer un chiffre puis s'y soumettre. La conséquence est portée dans FR-018 : le rapport **fournit de quoi décider, il ne rend pas un verdict**. Et dans FR-018b, son contrepoids obligatoire : il doit **nommer ce que ses chiffres ne permettent pas de conclure** — sans quoi l'absence de seuil laisserait une décision à l'humeur se déguiser en décision informée. L'absence de seuil est un choix assumé, écrit ici pour qu'elle ne se relise pas plus tard comme un oubli.
- Q: SC-007 exige un verdict sur **4 leviers sur 4**, alors que le quatrième — « rouvrir une image dans un cadre figé » — n'est exerçable par aucun des trois contrats de la chaîne, qui ne portent aucune image. Que devient le 4/4 ? → A: **3 leviers exercés + 1 déclaré « non exercé » avec sa raison.** Le compte de verdicts reste 4, dont un négatif assumé : c'est la convention d'honnêteté du dépôt appliquée telle quelle — une mesure sautée n'est jamais comptée comme réussie. Les trois autres voies étaient toutes plus chères ou moins vraies : renuméroter les leviers pour rendre le 4/4 exact aurait fait disparaître le levier image du dossier sans jamais l'instruire ; l'exercer sur un bloc d'essai hors chaîne aurait mesuré un montage qui n'est pas le montage ; faire entrer une image dans la chaîne contredit la raison écrite de son choix. Porté par SC-007, FR-016, les Key Entities, l'acceptation US4-2, et une Limite nommée dédiée qui dit ce que le rapport ne pourra pas conclure.
- Q: Par quel chemin le vocabulaire de jetons entre-t-il dans le module, sachant que le pipeline n'a **aucune sortie Odoo** et que sa sortie existante est **sans préfixe**, ce que FR-008 interdit ? → A: **Une 4ᵉ sortie additive au pipeline de jetons, préfixée, générée.** C'est la seule voie qui satisfasse FR-005 (rien d'écrit à la main) et FR-008 (préfixe) en même temps, et l'idiome est déjà en place — le pipeline a trois cibles, on en ajoute une. Le caractère additif est la garantie : les sorties existantes ne bougent pas, la surface livrée n'est pas touchée. Écartées : consommer la sortie existante telle quelle demandait d'assouplir FR-008 ; préfixer à la source faisait onduler le changement sur les 34 modules CSS générés et le fichier de pinning ; transcrire à la main enfreignait FR-005. Conséquence assumée : cette spec **touche du code de dépôt** en un point, et la suite de contrôles standard s'applique intégralement à ce point. Porté par FR-005b (nouveau), FR-004, FR-008 et les Assumptions.
- Q: La spec ne mentionne l'icône nulle part, alors que `ds.button` porte une dimension d'icône gouvernée — présence, plus un **choix parmi 19 glyphes** adossé au registre `icons.registry.json`. Portée, ou déclarée non-portée nommée (FR-014) ? → A: **Portée en entier**, les 19 glyphes embarqués, le choix du glyphe exercé sur l'instance. C'est la seule liaison **par échange d'instance** de toute la chaîne et le seul franchissement de frontière d'un registre gouverné : un émetteur devra la traiter sur tout le catalogue, donc l'omettre rendrait les volumes du rapport non représentatifs — l'angle mort exact que FR-018b existe pour refuser. Et le travail est massivement **mécanique**, c'est-à-dire précisément le chiffre que le rapport cherche. Écartées : porter la seule présence en figeant le glyphe, ou tout déclarer non-porté — moins chères, mais elles auraient laissé le rapport muet sur une liaison que le catalogue emploie partout. Porté par FR-004b (nouveau) et SC-002.
- Q: SC-006 exige « 0 écart sans cause nommée » sans dire avec quel instrument ni à quelle maille une cause est due — or l'instrument de parité visuelle du dépôt compare **Figma ⟷ notre surface HTML**, pas Odoo, et les Assumptions interdisent qu'une instance Odoo se retrouve sur le chemin d'une porte permanente. → A: **Comparaison autonome, maille composant.** 3 lignes, une par composant, **exactement une cause dominante** chacune au vocabulaire de causes déjà gouverné, sous un **plancher de tolérance déclaré**. L'instrument gated n'est ni étendu ni modifié : c'est le seul montage hermétique par construction, et il réutilise ce qui a de la valeur (le vocabulaire de causes de la 014) sans toucher à ce qui est sous porte. Écartées : étendre l'instrument d'un canal Odoo aurait été un chantier de dépôt plus gros que la spec **et** aurait posé une instance Odoo sur le chemin de la porte ; une maille par zone aurait coûté plus cher sans rien apporter au rapport de décision. Porté par SC-006, l'acceptation US3-1 et US3-2, et l'*Independent Test* de la US3.
- Q: FR-005 et SC-003 exigent « **aucune** valeur de style écrite à la main », mais la chaîne porte un littéral — `letter-spacing: 3px` sur `ds.section-header/Accroche` — pour lequel **aucun token de même valeur n'existe** (`font.letter-spacing` ne contient que `15`). Le critère est donc inatteignable tel qu'écrit. → A: **Reformulés en « 0 valeur INVISIBLE », avec un registre de littéraux nommés local au module.** C'est la doctrine du dépôt reprise telle quelle — 015 l'écrit mot pour mot dans son registre : *« la doctrine vise zéro valeur INVISIBLE, pas zéro littéral »* —, et la dérive que 015 a fermée est l'invisibilité, pas la présence d'un nombre. Un littéral **nommé, épinglé byte-à-byte contre son contrat et compté à part** est conforme ; un nombre non déclaré ne l'est pas. Écartées, avec leur prix, dans `research.md` §D4 : minter `font.letter-spacing.3` (le vrai correctif de fond — mais un 2ᵉ point de contact avec le code du dépôt, 3 re-pins et un acquittement de parité de plus, pour un token qu'**aucun contrat** ne référencerait) ; ne pas l'exprimer du tout (moins cher, mais 3 px de `letter-spacing` sur une accroche en capitales change visiblement la largeur de ligne — la US3 mesurerait alors **notre propre choix** au lieu d'un fait sur Odoo). Porté par FR-005, SC-003, l'acceptation US1-3 et une Limite nommée dédiée.
- Q: FR-017 fait de la **part mécanique** vs **part cas particulier** le chiffre porteur de la spec, mais aucune règle ne dit dans quel seau tombe une ligne écrite — et `volumes.json` est le seul artefact mesuré sans contrat d'interface, là où les zones, les verdicts et la comparaison en ont un. → A: **Une règle écrite avant le montage, et son contrat d'interface.** Trois postes mécaniques étaient déjà identifiés (le balisage de verrouillage par élément, les 19 entrées du sélecteur de glyphe, le renommage des références de tokens) ; ce qui manquait était la règle qui tranche **le reste**. Elle est posée dans `contracts/volumes.schema.md` avec ses invariants, et le classement se fait **en écrivant chaque fichier**, jamais reconstitué à la fin. Écartée : classer après coup, au moment de compter — c'est exactement ce que l'absence de seuil de décision (Q1) rend dangereux, puisque rien d'autre ne retiendrait le chiffre. Porté par FR-017b (nouveau), SC-008 et `contracts/volumes.schema.md`.
- Q: Puisque le fichier de jetons est désormais **généré** (FR-005b), le pipeline doit savoir où écrire — ce qui décide du même coup où vit le module. Sous la spec, dans le dossier d'exemples du dépôt, ou hors du dépôt ? → A: **Sous le dossier de cette spec**, la sortie de jetons écrite directement dedans. C'est le patron des specs 003, 005 et 007, qui gardent preuves et outils sous leur propre dossier, et c'est le seul endroit qui **dise ce que l'artefact est** : un reçu, hors de toute porte. Écartées : le dossier d'exemples est déjà touché par les re-pins — un artefact que rien ne gouverne y deviendrait une source de faux rouges ; et le laisser hors du dépôt le ferait mourir avec l'instance jetable, alors que FR-015 le veut disponible pour un générateur futur. Porté par FR-015b (nouveau).
