# Feature Specification: Les neuf pages du site sur Odoo — contenu, navigation, mesure au pixel

**Feature Branch**: `037-pages-odoo-navigation-pixel`

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "Monter sur Odoo les sept pages manquantes du site Piqueray (Portes de garage résidentielles, industrielles, Portes d'entrée, Motorisation, Dépannage/SAV, À Propos, Contactez-nous), brancher la navigation, et mesurer chaque page au pixel contre ses quatre vues Figma v2 validées. Home et Portes de garage, déjà en ligne, passent au même standard. […] Hors périmètre : l'envoi du formulaire de contact, le bloc Avis Google partagé côté Odoo, la boutique, les brochures PDF, les réalisations cliquables, la promotion Figma des anciennes maquettes."

## Contexte

Le site Piqueray sur Odoo compte aujourd'hui **deux pages réelles** (Home et Portes de garage), composées depuis un fichier de contenu par page et les blocs gouvernés du module. Le menu semé à la livraison (spec 022) et les deux boutons « Contactez-nous » (en-tête, pied de page) pointent vers **sept adresses qui n'ont pas de page** : un visiteur y tombe sur du vide. Les blocs communs aux pages (Devis, Réassurances, Avis Google) sont **recopiés à la main** dans chaque fichier de contenu, et cette copie a déjà divergé une fois (la copy des Réassurances de la home était celle des portes industrielles, corrigée le 2026-09-07). Les boutons posés dans les sections n'ont **aucune destination** : le fichier de contenu sait changer un libellé, pas un lien. Enfin, la comparaison au pixel d'une **page entière** contre ses quatre vues Figma a été faite une fois, sur Portes de garage, avec un script hors dépôt et des images hors dépôt : ni l'outil ni le rapport ne sont conservés, et la home n'a jamais eu ce rapport (sa mesure du 2026-09-04 dit explicitement ne pas rapporter de score).

Côté Figma, la vague 031 a posé pour chaque page une section « 4 vues (instances v2) » — un cadre par largeur d'écran (390 · 834 · 1200 · 1728), chaque section étant une instance du set v2 dans son mode. Ces vues sont la **référence** de la mesure : même page, même contenu, quatre largeurs. Cette spec ne les modifie pas ; elle les lit.

Ce que cette spec livre : les sept pages manquantes composées depuis leur fichier de contenu, le contenu commun écrit une fois, chaque bouton avec sa destination quand elle est tranchée, une navigation où chaque entrée mène quelque part et où l'entrée active est marquée, et un **outil du dépôt** qui compare une page Odoo entière à ses quatre vues et conserve le rapport — prouvé d'abord sur les deux pages existantes, puis appliqué aux neuf.

## Clarifications

### Session 2026-09-08

- Q: Quel seuil de différence au pixel une page doit-elle respecter, à chaque largeur, pour être déclarée fidèle à sa vue Figma ? (FR-016) → A: 5 % par largeur, en-tête inclus, écart de hauteur rapporté à côté du score ; raison owner : la marge couvre le bruit de rendu du texte (polices, antialiasing) entre le rendu Figma et le rendu navigateur.
- Q: Où l'entrée « Motorisation » doit-elle se placer dans le menu, et l'arbre semé à la livraison est-il validé tel quel pour le reste ? (FR-008) → A: Motorisation devient un enfant de « Portes de garage », aux côtés de résidentielles et industrielles ; le reste de l'arbre semé est validé tel quel.
- Q: Que fait-on des trois pages dont les quatre vues Figma ne sont pas attestées (Portes industrielles, Motorisation, Contactez-nous) ? (Assumptions, FR-017) → A: elles ne manquent pas : l'owner confirme le 2026-09-08 que les quatre vues des neuf pages existent sur le canevas et sont validées. Les neuf pages sont donc mesurables et les 36 rapports sont exigibles.
  - **Rectificatif daté (2026-09-08, relevé de planification — la réponse ci-dessus était exacte pour huit pages sur neuf, pas pour neuf).** Le relevé REST du canevas (research R1) a trouvé **sept** sections « 4 vues (instances v2) » plus les quatre frames de la home : **Contactez-nous n'avait aucune vue v2**, seule sa base v1 `2782:44493` existait. À la demande de l'owner, les quatre vues ont été **montées en session le jour même** (section `2782:46963`, journal `specs/tiny/vague-031/page-contactez-nous.md`) puis validées — version Figma nommée avant le geste, capture de la base avant, relevé après (constitution §X respectée). La conclusion tient donc à nouveau (36 rapports exigibles), mais **par une mutation du canevas faite hors spec sur décision owner**, pas parce que les vues préexistaient. Écart de source ouvert au registre : le formulaire v2 n'a ni champ Adresse, ni champ Sujet, ni les deux boutons de la base v1.
- Q: Faut-il traiter un écart de hauteur entre la page Odoo et sa vue Figma comme un défaut à corriger plutôt que comme une différence à cadrer ? (FR-014) → A: tolérance de 10 px. En-dessous, comparaison sur la hauteur commune alignée en haut, écart noté au rapport. Au-dessus, la page est rouge sur la hauteur même si le score au pixel passe, et l'écart est diagnostiqué section par section.
- Q: Quand une page reprend un bloc commun et n'en remplace qu'une partie, la surcharge porte-t-elle sur le champ précis ou sur le bloc entier ? (FR-003) → A: surcharge par champ. La page ne réécrit que ce qu'elle change ; tout champ non surchargé suit le commun, y compris après une correction ultérieure du commun.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Les sept pages existent, depuis leur fichier de contenu (Priority: P1)

Le rédacteur du site écrit **un fichier de contenu par page** (textes, photos, cartes, lignes d'accordéon, et désormais la **destination** de chaque bouton ou carte) et reconstruit la page d'une commande. Les blocs sont ceux qui existent déjà dans le module : aucun bloc nouveau. Le **contenu commun** (Devis, Réassurances, Avis Google) est écrit **une seule fois** et repris par chaque page qui l'affiche ; une page peut **surcharger** ce contenu commun (exemple réel : la page À Propos affiche quatre cartes de Réassurances là où la home en affiche cinq). Home et Portes de garage sont reprises dans le même modèle : leurs copies locales du contenu commun disparaissent au profit de la source partagée.

**Why this priority**: c'est la valeur visible — sept adresses vides deviennent sept pages — et c'est le préalable des deux autres histoires : on ne peut ni vérifier une navigation vers des pages absentes, ni mesurer une page qui n'existe pas.

**Independent Test**: reconstruire les neuf pages depuis leurs fichiers sur une instance jetable, ouvrir chacune des neuf adresses : la page s'affiche avec ses sections dans l'ordre de sa vue Figma, avec ses textes, ses photos et ses boutons ; modifier un texte du contenu commun, reconstruire : toutes les pages qui le reprennent l'affichent, la page qui le surcharge garde sa surcharge.

**Acceptance Scenarios**:

1. **Given** les neuf fichiers de contenu et une instance jetable vierge, **When** on reconstruit les neuf pages, **Then** chacune des neuf adresses répond par une page qui porte les sections de sa vue Figma, dans le même ordre, avec le même contenu (textes, gras, photos, nombre de cartes ou de lignes).
2. **Given** un texte présent dans le contenu commun (par exemple le titre du bloc Devis), **When** on le modifie à sa source unique et qu'on reconstruit, **Then** toutes les pages qui affichent ce bloc portent le nouveau texte, et aucune page ne porte plus l'ancien.
3. **Given** une page qui surcharge un bloc commun (À Propos : Réassurances à quatre cartes, titre propre), **When** on reconstruit après une modification du contenu commun, **Then** la surcharge de la page est conservée pour les éléments surchargés, et les éléments non surchargés suivent le commun.
4. **Given** un bouton dont la destination est écrite dans le fichier de contenu, **When** la page est reconstruite et ouverte, **Then** le bouton mène à cette destination ; **Given** un bouton dont la destination n'est pas tranchée, **Then** il est rendu sans destination et figure dans la liste des restes de la page.
5. **Given** les deux pages existantes (Home, Portes de garage), **When** elles sont reprises dans le modèle à contenu commun et reconstruites, **Then** ce qui s'affiche est identique à ce qu'elles affichaient avant (aucune régression de contenu), et leurs fichiers ne contiennent plus de copie locale du contenu commun.
6. **Given** un fichier de contenu qui référence une destination interdite (adresse exécutable, adresse externe non prévue) ou une page inexistante du site, **When** on reconstruit, **Then** la reconstruction refuse par un message qui nomme le fichier, la section et la destination fautive.
7. **Given** une reconstruction déjà faite, **When** on relance la même reconstruction sans changement, **Then** les neuf pages sont identiques à la passe précédente (reconstruction rejouable).

---

### User Story 2 — La navigation mène toujours quelque part, et sait où on est (Priority: P2)

L'owner **valide l'arbre du menu** (entrées, imbrication, ordre, adresses) avant qu'il ne soit posé. Ensuite chaque entrée du menu de bureau, chaque entrée du menu mobile, et chaque bouton de l'en-tête et du pied de page (« Contactez-nous », logo vers l'accueil, liens du pied) mène à une page qui **existe**. Sur chaque page, l'entrée de menu correspondante est **marquée active** (y compris le parent quand la page est un enfant du menu). Tout cela est vérifié par un **test rejouable** sur les vraies pages, pas sur des pages-fixtures et pas à la main.

**Why this priority**: sans navigation vérifiée, les sept pages neuves restent inaccessibles ou mal signalées ; mais cette histoire dépend de l'existence des pages (P1) pour être testée contre le vrai site.

**Independent Test**: lancer le test de navigation sur une instance où les neuf pages sont construites : il visite chaque page, énumère tous les liens de l'en-tête (bureau et mobile) et du pied de page, vérifie que chacun répond par une page existante, et vérifie que l'entrée active est celle attendue ; le test rougit si l'on retire une page ou si l'on casse une adresse.

**Acceptance Scenarios**:

1. **Given** l'arbre du menu validé par l'owner (entrées, parents, ordre, adresses), **When** le site est construit, **Then** le menu de bureau et le menu mobile affichent exactement cet arbre — mêmes libellés, même ordre, même imbrication.
2. **Given** n'importe laquelle des neuf pages ouverte, **When** on énumère les liens du menu de bureau, du menu mobile, de l'en-tête et du pied de page, **Then** chacun mène à une page qui existe (aucune page vide, aucune erreur).
3. **Given** une page enfant du menu ouverte (par exemple Portes de garage résidentielles), **When** on regarde le menu, **Then** l'entrée enfant et son parent sont marqués actifs, et aucune autre entrée ne l'est ; **Given** la page d'accueil, **Then** aucune entrée n'est marquée active.
4. **Given** le test de navigation, **When** on retire volontairement une page ou qu'on change une adresse de menu vers une page absente, **Then** le test échoue en nommant le lien fautif et la page où il se trouve (preuve rouge → vert).
5. **Given** un site déjà livré dont le client a édité le menu, **When** on rejoue la construction des pages, **Then** le menu du client n'est pas réécrit (règle existante de la spec 022, conservée).

---

### User Story 3 — Chaque page entière est mesurée contre ses quatre vues Figma, et le rapport reste (Priority: P3)

Un outil **du dépôt** prend une page Odoo entière et ses quatre vues Figma de référence, capture la page aux quatre largeurs (390 · 834 · 1200 · 1728), la compare à la vue correspondante, et écrit un **rapport conservé** : par largeur, le score, les hauteurs des deux côtés et leur écart, le seuil retenu et le verdict, plus l'image de comparaison. Il est **prouvé d'abord sur Home et Portes de garage** — les deux pages existantes, dont l'une a déjà une mesure manuelle à retrouver — avant d'être appliqué aux sept autres. Le **seuil est fixé par l'owner** avant la première mesure, avec sa raison, jamais après avoir vu les scores.

**Why this priority**: c'est la preuve que les pages sont fidèles, et la seule façon de ne plus dépendre d'une mesure à la main ; elle vient en troisième parce qu'elle mesure ce que P1 construit, mais son instrument peut être développé en parallèle sur les deux pages existantes.

**Independent Test**: lancer l'outil sur Home et Portes de garage contre leurs vues : quatre rapports par page, chaque rapport lisible sans rien relancer ; relancer sans changement : mêmes scores ; introduire un écart volontaire (décaler une section) : le score bouge et le rapport le montre.

**Acceptance Scenarios**:

1. **Given** une page construite et ses quatre vues Figma de référence, **When** on lance l'outil, **Then** il produit quatre rapports (un par largeur) qui portent : score, hauteur Figma, hauteur Odoo, écart de hauteur, seuil, verdict, image de comparaison côte à côte.
2. **Given** deux hauteurs différentes entre la vue Figma et la page Odoo, **When** l'outil compare, **Then** il ne redimensionne jamais en silence : il aligne en haut, compare sur la hauteur commune, et écrit l'écart de hauteur avec la règle appliquée ; **Given** un écart supérieur à 10 px (la home du 2026-09-04 : +34 à +128 px), **Then** le verdict de hauteur est rouge même si le score au pixel passe, et le rapport nomme la section où le décalage naît ; **Given** un écart d'au plus 10 px (Portes de garage : +2 à +8 px), **Then** il est noté comme bruit d'arrondi de rendu et n'emporte pas de verdict.
3. **Given** un contenu qui diffère entre la vue Figma et la page (un double espace, une coupure de ligne dure, un titre erroné à la source), **When** l'écart est identifié, **Then** il est **nommé** dans le rapport comme écart de contenu, et il est corrigé **à la source Figma** avant re-mesure, jamais contourné dans la page (règle de propreté de la source).
4. **Given** les mêmes entrées, **When** on relance l'outil, **Then** les scores sont identiques (mesure rejouable).
5. **Given** un cas volontairement rouge (section décalée ou retirée), **When** on lance l'outil, **Then** le score dépasse le seuil et le verdict est « au-dessus du seuil » (preuve que l'outil voit ce qu'il doit voir).
6. **Given** les rapports des neuf pages, **When** l'owner les ouvre, **Then** il voit, page par page et largeur par largeur, le verdict et la comparaison à taille réelle, sans rien recalculer.

---

### User Story 4 — L'owner valide chaque page à l'écran, et ce qui reste à l'ancienne est écrit (Priority: P4)

L'owner ouvre chaque page dans l'éditeur du site pilote et la valide (ou renvoie une correction). À la clôture, un **registre des restes** nomme tout ce qui reste à l'ancienne : les destinations non tranchées laissées vides (par page, par bouton), le fait que le contenu commun reste **figé par page** une fois posé dans Odoo (Odoo ne propage rien : une modification du commun exige de reconstruire chaque page), et toute vue Figma manquante ou tout écart resté au-dessus du seuil.

**Why this priority**: c'est la clôture ; elle ne peut venir qu'après les trois autres, et sa valeur est l'honnêteté du livrable — rien de « à peu près fini » qui ne soit écrit.

**Independent Test**: le registre des restes existe, chaque ligne nomme une page ou un mécanisme, et chaque page a une trace de validation owner (date, page, verdict).

**Acceptance Scenarios**:

1. **Given** les neuf pages construites, **When** l'owner les parcourt dans l'éditeur du pilote, **Then** chaque page reçoit un verdict daté (validée / à corriger, avec la correction demandée), et une page « à corriger » repasse par P1 puis P3 avant un nouveau verdict.
2. **Given** la clôture, **When** on lit le registre des restes, **Then** on y trouve : la liste des boutons sans destination (page, section, bouton), la mention que le contenu commun est figé par page dans Odoo et la commande qui le rafraîchit, et les éventuels écarts au-dessus du seuil avec leur cause dominante.

---

### Edge Cases

- **Une vue Figma attendue est introuvable au relevé** (les neuf pages ont leurs quatre vues validées au 2026-09-08 ; ce cas ne devrait donc pas se produire) : la page est construite depuis la maquette de référence existante, sa mesure est marquée **« impossible — vue introuvable »** dans le rapport, jamais mesurée contre autre chose, et la vue manquante figure au registre des restes.
- **Le contenu commun change alors que des pages sont déjà posées dans Odoo** : Odoo ne propage rien ; la reconstruction des pages est la seule voie, et le registre le dit.
- **Une page surcharge un élément du commun qui n'existe plus** (le commun a été réduit) : la reconstruction refuse en nommant la page et l'élément orphelin plutôt que de poser une page incomplète.
- **Deux pages veulent le même bloc commun avec un nombre de cartes différent** (Réassurances : cinq sur la home, quatre ailleurs) : c'est une surcharge de page, pas un second commun.
- **Une destination pointe vers une adresse qui n'est pas une page du site** (boutique, brochure PDF — hors périmètre) : la destination est laissée vide et listée comme non tranchée, jamais inventée.
- **Le formulaire de la page Contactez-nous** : il s'affiche et se mesure ; son envoi est hors périmètre et le rapport de la page le dit.
- **La page Odoo est plus haute que la vue Figma** (décalage cumulé section après section, 34 à 128 px mesurés sur la home) : au-delà de 10 px c'est un défaut, pas un paramètre de lecture — verdict de hauteur rouge, diagnostic section par section, et le score n'est jamais présenté seul.
- **Le menu a été édité par le client** sur une instance livrée : la reconstruction des pages ne touche pas au menu ; le test de navigation lit le menu tel qu'il est.
- **La copie d'une vue Figma est fausse à la source** (À Propos : les Réassurances y parlent de portes industrielles) : ce n'est pas la page Odoo qui corrige ; l'écart est nommé et tranché par l'owner à la source.
- **Deux sessions travaillent dans la même instance ou le même dossier de travail** : les mesures se font sur une instance jetable nommée dans le rapport, jamais sur l'instance de l'owner.

## Requirements *(mandatory)*

### Functional Requirements

**Pages et contenu**

- **FR-001**: Chacune des sept pages manquantes (Portes de garage résidentielles, Portes de garage industrielles, Portes d'entrée, Motorisation, Dépannage/SAV, À Propos, Contactez-nous) MUST exister sur le site à l'adresse que le menu ou les boutons lui donnent déjà, avec les sections de sa vue Figma v2 dans le même ordre, composées uniquement avec les blocs gouvernés existants du module.
- **FR-002**: Le contenu de chaque page (textes et gras, photos, cartes, lignes d'accordéon, libellés de boutons, titre de page pour le navigateur) MUST venir d'un fichier de contenu par page, versionné, et la page MUST pouvoir être reconstruite depuis ce fichier d'une seule action rejouable.
- **FR-003**: Le contenu commun aux pages (au minimum Devis, Réassurances, Avis Google) MUST être écrit une seule fois dans une source partagée, et chaque page qui l'affiche MUST le reprendre de cette source ; une page MUST pouvoir surcharger ce contenu commun **champ par champ** — son fichier ne porte que les champs qu'elle change (exemple : À Propos remplace le titre des Réassurances et leur liste de cartes), et tout champ non surchargé MUST suivre le commun, y compris après une correction ultérieure du commun. La surcharge MUST être visible dans le fichier de la page.
- **FR-004**: Les fichiers de Home et de Portes de garage MUST être repris dans ce modèle (plus de copie locale du contenu commun) sans changement de ce qui s'affiche.
- **FR-005**: Chaque bouton ou carte cliquable d'une section MUST pouvoir recevoir sa destination depuis le fichier de contenu ; une destination absente MUST produire un bouton sans lien et une ligne dans le registre des restes, jamais une destination inventée.
- **FR-006**: La reconstruction MUST refuser, en nommant le fichier, la section et la valeur, une destination interdite (adresse exécutable, adresse externe non prévue) ou une surcharge d'un élément commun qui n'existe pas.
- **FR-007**: La reconstruction des neuf pages MUST être rejouable : deux passes sans changement produisent le même résultat.

**Navigation**

- **FR-008**: L'arbre du menu posé MUST être celui validé par l'owner le 2026-09-08 : Portes de garage › (résidentielles, industrielles, **Motorisation**) ; Portes d'entrée ; Dépannage/SAV ; À propos — « Contactez-nous » restant un bouton et non une entrée de menu. Le rattachement inféré de « Motorisation » sous « Portes d'entrée » MUST NOT être conservé.
- **FR-009**: Chaque entrée du menu de bureau, du menu mobile, et chaque bouton ou lien de l'en-tête et du pied de page MUST mener à une page qui existe sur le site.
- **FR-010**: Sur chaque page, l'entrée de menu correspondante MUST être marquée active, et le parent d'une page enfant MUST l'être aussi ; aucune autre entrée ne l'est.
- **FR-011**: La navigation MUST être vérifiée par un test rejouable qui parcourt les neuf vraies pages, et ce test MUST échouer en nommant le lien fautif quand une page manque ou qu'une adresse est cassée.
- **FR-012**: La construction des pages MUST NOT réécrire le menu d'un site déjà livré (règle conservée de la livraison du menu).

**Mesure au pixel**

- **FR-013**: Un outil du dépôt MUST comparer une page Odoo entière à ses quatre vues Figma de référence, aux quatre largeurs 390 · 834 · 1200 · 1728, à contenu égal, et produire un rapport conservé dans le dépôt : score, hauteur des deux côtés et écart, seuil, verdict. L'**image de comparaison côte à côte à taille réelle** est produite à chaque mesure et **référencée par son empreinte** dans le rapport ; elle n'est pas committée (décision owner du 2026-08-27 sur les images lourdes) et MUST être rejouable à l'identique par l'outil depuis le rapport seul.
- **FR-014**: L'outil MUST NOT redimensionner ni recaler en silence deux images de hauteurs différentes. La règle est : les deux images sont **alignées en haut** et comparées **sur leur hauteur commune** ; l'écart de hauteur MUST figurer en clair dans le rapport, avec la règle de cadrage appliquée. Un écart **au plus égal à 10 px** est du bruit d'arrondi de rendu et n'emporte pas de verdict propre ; un écart **supérieur à 10 px** MUST rendre la page rouge sur la hauteur, même quand le score au pixel passe sous les 5 %, et MUST être diagnostiqué section par section pour nommer la section où le décalage naît.
- **FR-015**: L'outil MUST être prouvé sur Home et Portes de garage avant toute mesure d'une page nouvelle, et sa capacité à voir un écart MUST être prouvée par un cas volontairement rouge.
- **FR-016**: Le seuil de réussite est fixé par l'owner avant toute mesure des neuf pages à **5 % de différence au pixel par largeur**, en-tête inclus, l'écart de hauteur étant rapporté à côté du score ; raison owner : cette marge couvre le bruit de rendu du texte entre Figma et le navigateur. Ce seuil MUST être appliqué tel quel aux 36 rapports et MUST NOT être modifié après lecture des scores sans une décision owner datée.
- **FR-017**: Une mesure impossible (vues Figma manquantes, page absente, capture en erreur) MUST être rapportée comme telle, jamais comptée comme réussie ni comme échouée.
- **FR-018**: Un écart de contenu entre la vue Figma et la page (copie, espaces, coupures de ligne) MUST être nommé dans le rapport et corrigé à la source Figma avant re-mesure, jamais contourné dans la page.

**Honnêteté et clôture**

- **FR-019**: Tout mécanisme ajouté par cette spec (contenu commun, destinations, outil de mesure de page, test de navigation) MUST être couvert par une vérification automatique avant qu'une phrase de documentation ne l'annonce.
- **FR-020**: Chaque page MUST recevoir une validation owner datée à l'écran, sur le site pilote, et une page renvoyée MUST repasser par la reconstruction et la mesure avant un nouveau verdict.
- **FR-021**: Un registre des restes MUST nommer, à la clôture : les destinations non tranchées (page, section, bouton), le contenu commun figé par page dans Odoo et l'action qui le rafraîchit, les vues Figma manquantes, et tout écart resté au-dessus du seuil avec sa cause dominante.
- **FR-022**: Aucune mutation du canevas Figma n'est prévue par cette spec ; si une correction à la source s'impose (FR-018), elle suit la règle de capture-avant existante et est tracée. *(Une mutation a eu lieu le 2026-09-08 — le montage des quatre vues de Contactez-nous, décidé par l'owner en session, hors du périmètre de cette spec : voir le rectificatif des Clarifications. Elle a suivi la règle de capture-avant et porte une version Figma nommée.)*

### Key Entities

- **Page** : une adresse du site, un nom, un titre pour le navigateur, une liste ordonnée de sections, un réglage d'en-tête (en superposition ou non). Neuf pages : Home, Portes de garage, Portes de garage résidentielles, Portes de garage industrielles, Portes d'entrée, Motorisation, Dépannage/SAV, À Propos, Contactez-nous.
- **Fichier de contenu de page** : la source versionnée d'une page ; chaque section y nomme son bloc, son contenu propre, ses destinations, et le cas échéant le bloc commun qu'elle reprend avec ses surcharges.
- **Contenu commun** : un bloc écrit une fois (Devis, Réassurances, Avis Google), repris par plusieurs pages ; une **surcharge** est le ou les **champs** de ce contenu qu'une page remplace pour elle seule, les autres champs continuant de suivre le commun.
- **Destination** : l'adresse vers laquelle un bouton ou une carte mène ; interne au site ou non tranchée (vide, listée).
- **Arbre du menu** : les entrées de navigation (libellé, adresse, parent, ordre), validées par l'owner, lues par le menu de bureau et le menu mobile ; l'**entrée active** est celle de la page courante ou de son parent.
- **Vue Figma de référence** : pour une page et une largeur, le cadre Figma v2 validé qui fait foi (quatre par page).
- **Rapport de mesure de page** : pour une page et une largeur, le score, les deux hauteurs et leur écart, la règle de cadrage, le seuil, le verdict, l'image de comparaison, la cause dominante quand elle est écrite à la main, et « impossible » avec sa raison quand la mesure n'a pas pu se faire.
- **Registre des restes** : la liste datée de ce qui reste à l'ancienne à la clôture.
- **Validation owner** : par page, une date et un verdict (validée / à corriger avec la demande).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Les neuf pages ont chacune quatre rapports de mesure de page entière (36 rapports), **aucun manquant**. Chaque rapport est **soit sous 5 %**, **soit au-dessus avec sa cause dominante nommée au registre des restes et une décision owner datée** (garder tel quel, ou ouvrir une vague séparée) — cette seconde branche existe parce que SC-010 interdit de toucher aux contrats, aux jetons et aux blocs : un écart dont la cause est le dessin du set ou la copie de la source **ne peut pas** être résorbé dans cette spec, il ne peut qu'être nommé et tranché (écarts déjà connus au 2026-09-08 : graisse Regular du titre hero de Motorisation et d'À Propos, hauteur du set Équipe en Desktop, formulaire v2 amputé). Zéro rapport au-dessus du seuil **sans** cause nommée. Les neuf pages ayant leurs vues validées, aucun rapport ne peut être « impossible » pour vue manquante, et une mesure « impossible » pour une autre raison (capture en erreur) doit être nommée au registre des restes.
- **SC-002**: Sur chacune des neuf pages, 100 % des liens du menu de bureau, du menu mobile, de l'en-tête et du pied de page mènent à une page existante, vérifié par le test rejouable ; le test rougit quand on retire une page (preuve rouge → vert conservée).
- **SC-003**: Sur chacune des neuf pages, l'entrée de menu marquée active est exactement celle attendue (enfant et parent pour une page enfant, aucune sur l'accueil), vérifié par le même test.
- **SC-004**: Une modification d'un champ du contenu commun suivie d'une reconstruction se retrouve sur 100 % des pages qui reprennent ce bloc — **y compris les pages qui en surchargent d'autres champs** — et sur 0 % des champs surchargés ; les fichiers de Home et de Portes de garage ne contiennent plus aucune copie locale du contenu commun.
- **SC-005**: Deux reconstructions successives des neuf pages sans changement donnent un résultat identique ; deux mesures successives d'une page donnent des scores identiques.
- **SC-006**: L'outil de mesure est prouvé sur Home et Portes de garage avant la première mesure d'une page nouvelle, et la mesure manuelle de Portes de garage du 2026-09-07 est retrouvée par l'outil dans le même ordre de grandeur, écart de hauteur compris ; les quatre largeurs de Portes de garage (+2 à +8 px) sortent sous la tolérance de 10 px, et les écarts de la home au-dessus sont rendus rouges sur la hauteur avec leur section d'origine nommée.
- **SC-007**: Chaque mécanisme ajouté est couvert par une vérification automatique qui existait avant sa première phrase de documentation ; zéro phrase de capacité sans vérification derrière.
- **SC-008**: Les neuf pages portent une validation owner datée ; zéro page « validée » sans trace.
- **SC-009**: Le registre des restes existe et nomme, sans exception, chaque bouton laissé sans destination (page, section, bouton), le contenu commun figé par page, les vues Figma manquantes et tout écart au-dessus du seuil.
- **SC-010**: Zéro modification de contrat, de jeton ou de bloc gouverné n'est nécessaire pour livrer les neuf pages ; si une l'est, elle sort de cette spec et est nommée.

## Assumptions

- **Les adresses des pages sont celles déjà données par le menu semé et les boutons** : `/` (Home), `/portes-de-garage`, `/portes-residentielles`, `/portes-industrielles`, `/portes-entree`, `/motorisation`, `/depannage-sav`, `/a-propos`, `/contactez-nous`. Les changer est une décision owner prise dans la validation de l'arbre (FR-008).
- **L'arbre validé (owner, 2026-09-08) est le menu semé à la livraison avec Motorisation déplacée** : Portes de garage › résidentielles, industrielles, Motorisation ; Portes d'entrée ; Dépannage/SAV ; À propos. « Contactez-nous » reste un bouton, pas une entrée de menu. Le menu semé rattachait Motorisation à « Portes d'entrée » par inférence : ce rattachement est abandonné, donc la page Motorisation a « Portes de garage » pour parent actif (FR-010).
- **Les quatre largeurs de référence sont 390 · 834 · 1200 · 1728** (Mobile, Tablette, Desktop, Wide), celles des vues « 4 vues (instances v2) » de la vague 031.
- **Les vues Figma v2 « validées » sont les sections « 4 vues (instances v2) » de la page de validation 031**, une par page : elles existent et sont validées par l'owner pour **les neuf pages** — pour huit d'entre elles depuis la vague 031, **pour Contactez-nous depuis leur montage en session du 2026-09-08** (voir le rectificatif des Clarifications) ; donc les 36 rapports sont exigibles. Si le relevé du canevas en trouvait une introuvable, elle ne serait pas fabriquée par cette spec : elle serait nommée au registre des restes et sa création serait une décision owner.
- **Le contenu de chaque page suit sa vue Figma** ; quand la copie de la vue est fausse à la source (À Propos : titre des Réassurances), c'est l'owner qui tranche à la source, et la page suit.
- **Le seuil est fixé à 5 % par largeur** (décision owner du 2026-09-08, FR-016), en-tête inclus : les mesures existantes (Portes de garage : 1,7 % à 3,7 % selon la largeur, en-tête inclus ; sections seules : 0 à 3 %) l'ont éclairé, et la marge au-dessus de 3,67 % est là pour le bruit de rendu du texte, pas pour absorber une faute de mise en page.
- **Le contenu commun couvre Devis, Réassurances et Avis Google** ; l'en-tête et le pied de page sont déjà partagés par construction (gabarits système) et ne sont pas concernés. Le bloc Avis Google reste posé par page côté Odoo (le bloc partagé côté Odoo est hors périmètre) : le commun porte son **contenu**, pas son mécanisme.
- **Les pages sont construites et mesurées sur une instance jetable ou sur le pilote** ; l'instance de l'owner n'est jamais ciblée par une construction automatique. La validation owner à l'écran se fait sur le pilote, par le lien éditeur.
- **La mesure se fait sur la page publique, sans session**, en-tête inclus comme sur la mesure manuelle de Portes de garage, à contenu égal avec la vue.
- **Les images de comparaison lourdes restent hors du dépôt** (décision owner du 2026-08-27 pour les preuves de la vague responsive) ; le rapport conservé dans le dépôt porte les chiffres, les verdicts et une empreinte des images, et les images sont rejouables par l'outil.
- **Aucun nouveau bloc, aucun nouveau contrat** : les neuf pages se composent avec les treize blocs existants du module. Si une page en exigeait un autre, ce serait une vague composant séparée, nommée.

## Faits déjà établis — à ne pas re-découvrir

- Une page Odoo posée est un **HTML figé** : Odoo ne propage rien. Après une modification de bloc ou de contenu commun, la seule voie est de reconstruire la page ; c'est pour cela que le registre des restes nomme « contenu commun figé par page ».
- **Le pourcentage seul ment sur deux pages de hauteurs différentes** (home, 2026-09-04 : +34 à +128 px selon la largeur) : il mesure le décalage, pas la fidélité. D'où FR-014, sa tolérance de 10 px et la lecture par section dans le rapport. Au-delà de cette tolérance, rien ne justifie deux hauteurs différentes : c'est un défaut de page à corriger, pas un écart à cadrer.
- **La mesure manuelle de Portes de garage existe** (2026-09-07 : 3,67 % · 2,41 % · 1,71 % · 1,90 %, écarts de hauteur +4 · +4 · +2 · +8, en-tête inclus) — elle est le point de comparaison de SC-006, et son script vivait hors dépôt : c'est exactement ce que FR-013 corrige.
- **Les tests de navigation existants (spec 022) tournent sur des pages-fixtures** créées par le test, pas sur les vraies pages, et ils dépendent d'un ordre d'exécution ; le test de cette spec parcourt les neuf vraies pages.
- **La destination d'une carte appartient au rédacteur** (décision du 2026-09-05, panneau d'édition) ; cette spec l'étend au fichier de contenu, pour tous les boutons de section, sans toucher aux contrats (le lien est une adaptation d'hôte).
- **La copy des Réassurances de la home a déjà divergé** (corrigée le 2026-09-07) : c'est le cas concret que le contenu commun ferme.
- **Deux défauts de copie connus à la source Figma** : le titre du Devis v2 porte une coupure de ligne dure (deux lignes partout), et la vue À Propos fait dire aux Réassurances « portes de garage industrielles ». Ni l'un ni l'autre ne se corrige dans la page.
- **La FAQ de Dépannage/SAV a perdu ses quatre onglets** dans les vues v2 (décision owner du 2026-09-08) : la page Odoo suit les vues, pas l'ancienne maquette.
- **Équipe v2 en Desktop fait 2652 px de haut, plus que le Wide** : dessin du set jamais validé à l'écran ; la page À Propos le montrera tel quel et l'owner tranchera sur la vue, pas sur la page.

## Hors périmètre

- L'envoi du formulaire de contact (la page Contactez-nous affiche le formulaire ; aucune expédition n'est prouvée).
- Le bloc Avis Google partagé côté Odoo (un seul bloc réutilisé par mécanisme) : le commun ne porte que le contenu.
- La boutique et ses liens (cartes produit, panier, compte) : destinations laissées vides et listées.
- Les brochures PDF et les réalisations cliquables.
- La promotion Figma des anciennes maquettes vers les sets v2, et toute autre mutation du canevas hors correction de source tracée.
- Tout nouveau bloc, contrat ou jeton.
- La correction de la hauteur de la section Équipe en Desktop (dessin du set, décision owner sur la vue).
