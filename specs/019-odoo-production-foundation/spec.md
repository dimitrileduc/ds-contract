# Feature Specification: Fondation Odoo de production

**Feature Branch**: `019-odoo-production-foundation`  
**Created**: 2026-08-07  
**Status**: Draft  
**Input**: User description: « Construire la fondation Odoo de production sur les deux sections déclarées propres, `ds.presentation` et `ds.google-reviews`, pendant que la 020 qualifie les autres sections. Le travail est mené avec un agent guidé, mais chaque décision et chaque écart doivent devenir des entrées versionnées et mesurables pour un futur builder déterministe. »

## Périmètre de la fondation

Cette feature livre le premier module Odoo destiné à la production, séparé du POC 018. Elle couvre
deux sections posables et la fermeture de leurs dépendances :

- `ds.presentation` → `ds.section-header` → `ds.button` ;
- `ds.google-reviews` → répétition de `ds.review-card`.

Cela représente **2 sections posables et 5 contrats couverts**. La feature doit établir le niveau de
qualité, le vocabulaire de décision et les preuves que les vagues 021 et 022 réutiliseront. Elle ne
construit pas encore le builder générique et ne corrige pas les contrats consommés.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Composer une Présentation sans casser le design system (Priority: P1)

En tant que rédacteur du site, je peux insérer plusieurs sections Présentation, modifier uniquement
les contenus et choix autorisés, puis enregistrer la page sans pouvoir altérer leur structure ou
faire apparaître des réglages étrangers au design system.

**Why this priority**: Cette section reprend la chaîne imbriquée déjà mesurée dans le POC et permet
de transformer les faits de 018 en une base réellement livrable, tout en vérifiant le défaut majeur
encore ouvert : plusieurs blocs indépendants sur une même page.

**Independent Test**: Sur une installation propre, insérer deux Présentations sur la même page, leur
donner des contenus et états de CTA différents, enregistrer, rouvrir l'éditeur puis la page publique,
et vérifier que les deux instances sont intactes et indépendantes.

**Acceptance Scenarios**:

1. **Given** le module installé, **When** le rédacteur ouvre la bibliothèque de sections, **Then** une seule entrée Présentation est disponible et ses composants internes ne sont pas posables séparément.
2. **Given** deux Présentations sur la même page, **When** le rédacteur modifie leurs textes, leur texte riche et l'état autorisé du CTA différemment, **Then** chaque modification reste limitée à l'instance ciblée après sauvegarde et réouverture.
3. **Given** une Présentation sélectionnée, **When** le rédacteur parcourt son panneau et ses zones de texte, **Then** seuls les contrôles et parts déclarés dans ses décisions d'authoring sont disponibles.
4. **Given** une part déclarée figée, **When** le rédacteur tente de l'éditer, la déplacer, la supprimer, la dupliquer ou la restructurer, **Then** l'action intérieure est refusée sans empêcher les actions explicitement autorisées sur la section entière.
5. **Given** un texte simple et un texte riche, **When** le rédacteur les édite, **Then** le texte simple ne reçoit aucune mise en forme non contractuelle et le texte riche n'offre que les marques portées par son contrat.

---

### User Story 2 - Administrer les avis et leurs images (Priority: P1)

En tant que rédacteur du site, je peux insérer Google Reviews, modifier son résumé et administrer sa
collection de cartes d'avis, y compris les avatars, sans connaître la composition interne de la
section.

**Why this priority**: Cette deuxième section est volontairement différente de Présentation. Elle
exerce la répétition, des chemins d'authoring traversant un composant imbriqué, plusieurs booléens et
une image — les mécanismes qui doivent être connus avant les vagues suivantes.

**Independent Test**: Insérer Google Reviews, partir de la liste échantillon, ajouter un avis, en
retirer un, réordonner la liste, modifier tous les champs d'une carte et remplacer son avatar ; puis
enregistrer et rouvrir la page publique et l'éditeur.

**Acceptance Scenarios**:

1. **Given** une nouvelle section Google Reviews, **When** elle est insérée, **Then** elle affiche la collection initiale définie par l'échantillon épinglé du contrat.
2. **Given** la collection d'avis, **When** le rédacteur ajoute, retire ou réordonne une carte, **Then** l'ordre et le nombre obtenus survivent à la sauvegarde et à la réouverture.
3. **Given** une carte d'avis, **When** le rédacteur modifie l'auteur, l'initiale, la date, le témoignage et les choix de visibilité prévus, **Then** chaque valeur modifie uniquement cette carte et aucun autre avis.
4. **Given** une carte configurée avec une photo, **When** le rédacteur choisit une image et renseigne son alternative textuelle, **Then** l'image et son alternative sont conservées sur la page publique ; le retour au mode initiale restaure le comportement prévu sans donnée exécutable cachée.
5. **Given** le résumé de Google Reviews, **When** le rédacteur modifie la note globale, le qualificatif, le volume ou la visibilité des contrôles, **Then** le rendu correspond exactement aux décisions déclarées.
6. **Given** les flèches visibles, **When** la section est qualifiée, **Then** elles sont traitées comme le contrat les décrit ; aucun comportement de carrousel non contractuel n'est revendiqué.

---

### User Story 3 - Maintenir des blocs sauvegardés en connaissance de leur version (Priority: P2)

En tant que mainteneur, je peux installer et mettre à jour le module, identifier le contrat exact qui
a produit chaque bloc sauvegardé et savoir quand une évolution exige une migration structurelle.

**Why this priority**: Odoo stocke la structure insérée. Sans identité, version et politique
explicites, une correction ultérieure pourrait donner l'impression d'avoir mis à jour des blocs qui
sont en réalité restés anciens.

**Independent Test**: Sauvegarder les deux types de sections, installer une version ultérieure de la
politique d'édition puis une version structurelle simulée, et vérifier respectivement l'application
de la nouvelle politique et le signalement des structures anciennes.

**Acceptance Scenarios**:

1. **Given** une installation propre puis une mise à jour du module, **When** les deux opérations se terminent, **Then** les sections nouvelles sont disponibles et les pages déjà sauvegardées restent lisibles.
2. **Given** un bloc sauvegardé, **When** un mainteneur l'inspecte, **Then** son identité de contrat et sa version d'origine sont disponibles sans déduction visuelle.
3. **Given** une évolution de la seule politique d'édition, **When** une page existante est rouverte dans l'éditeur, **Then** la nouvelle politique s'applique au bloc sans prétendre en avoir migré la structure.
4. **Given** une version structurelle différente de celle d'un bloc sauvegardé, **When** le contrôle de version est lancé, **Then** le bloc est signalé avec une action explicite ; il n'est jamais déclaré mis à jour automatiquement.

---

### User Story 4 - Transformer le travail manuel en connaissance pour le builder (Priority: P3)

En tant qu'owner, je peux lire les décisions d'authoring et un rapport calculé des adaptations
manuelles pour savoir ce que le futur builder pourra dériver, sans dépendre de l'avis de l'agent qui
a monté les sections.

**Why this priority**: L'agent sert à livrer vite et à découvrir la cible. La valeur durable vient de
la séparation mécanique entre ce que la configuration prédit et ce qu'Odoo a réellement exigé.

**Independent Test**: Régénérer les sorties prédictibles et le rapport de dérivation deux fois,
comparer les résultats, puis introduire successivement une décision manquante, un chemin imbriqué
invalide et une adaptation manuelle afin de vérifier le refus ou le comptage attendu.

**Acceptance Scenarios**:

1. **Given** les cinq contrats couverts, **When** les décisions d'authoring sont contrôlées, **Then** chaque prop, chaque part visible et chaque chemin imbriqué reçoit exactement un verdict explicite.
2. **Given** une prop sans verdict ou un chemin de part qui ne résout pas dans le graphe épinglé, **When** la qualification est lancée, **Then** elle échoue en nommant l'entrée fautive.
3. **Given** la configuration et les adaptations réellement nécessaires, **When** le rapport de dérivation est produit, **Then** il calcule l'écart sans saisie d'un jugement de « dérivabilité » par l'agent.
4. **Given** les mêmes entrées épinglées, **When** les sorties prédictibles et le rapport sont produits deux fois, **Then** ils sont identiques à l'octet.
5. **Given** le guide de construction issu de Présentation, **When** il est appliqué à Google Reviews, **Then** aucune catégorie obligatoire de décision, de preuve ou de limitation n'est oubliée ; toute insuffisance du guide est corrigée avant la clôture.

### Edge Cases

- Deux instances du même type portent des valeurs opposées pour un booléen : aucune option, règle d'édition ou donnée ne doit fuir d'une instance à l'autre.
- Une part porte le même nom dans deux composants imbriqués : seul son chemin complet peut l'identifier ; un nom court ambigu est refusé.
- Une nouvelle prop ou part apparaît dans un contrat épinglé : la couverture redevient rouge jusqu'à ce qu'un verdict soit ajouté.
- Une part conditionnelle est absente du rendu courant : elle garde malgré tout un verdict et redevient gouvernée quand sa condition la rend visible.
- La collection d'avis est vide, contient un seul élément ou dépasse les cinq échantillons : la section reste éditable et le rendu ne fabrique ni doublon ni contenu silencieux.
- Une carte demande une photo sans source exploitable ou sans alternative : l'éditeur refuse l'état incomplet ou applique le repli explicitement décidé ; il ne publie pas une image cassée.
- Un contenu riche tente d'introduire un script, un gestionnaire d'événement, une URL dangereuse ou un balisage non autorisé : le contenu exécutable est refusé ou neutralisé avant publication.
- Une option native d'Odoo change de nom ou de disponibilité dans une version ultérieure : la compatibilité devient rouge et la section n'est pas déclarée gouvernée par défaut.
- Une régénération rencontre une adaptation manuelle : elle préserve l'adaptation dans sa zone déclarée et la compte dans le rapport ; elle ne la recopie pas dans une sortie générée.
- Une évolution structurelle arrive après insertion : le bloc ancien est détecté ; aucune migration implicite n'est inventée.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La feature MUST livrer un module de production distinct du POC 018 couvrant exactement `ds.presentation`, `ds.section-header`, `ds.button`, `ds.google-reviews` et `ds.review-card`.
- **FR-002**: Le module MUST exposer exactement deux sections posables, Présentation et Google Reviews ; les trois contrats dépendants MUST rester des composants internes réutilisés, absents de la bibliothèque de sections.
- **FR-003**: La feature MUST consommer des versions épinglées des cinq contrats, des tokens et des registres associés, et MUST NOT modifier ces sources. Toute correction amont appartient à 020 ou à une décision séparée.
- **FR-004**: Chaque section MUST rendre sa composition par référence aux composants dépendants ; elle MUST NOT dupliquer silencieusement leur définition ou leurs décisions.
- **FR-005**: Une configuration d'authoring versionnée MUST séparer les décisions portant sur les props des décisions portant sur les parts rendues.
- **FR-006**: Chaque prop des cinq contrats et chaque part visible ou conditionnellement visible atteignable depuis les deux sections racines MUST recevoir exactement un verdict, pris dans l'ensemble propre à sa nature. Une **prop** est : contrôlée, fixée par la composition, non éditable, ou hors capacité avec justification. Une **part rendue** est : éditable directement, fixée par la composition, non éditable, ou hors capacité avec justification. « Contrôlée » ne s'applique qu'à une prop et « éditable directement » qu'à une part ; les deux ensembles ne se mélangent pas. Aucun verdict implicite n'est autorisé.
- **FR-007**: Une décision portant sur une part imbriquée MUST l'identifier par son chemin complet dans le graphe de composition. Les chemins absents, ambigus ou incompatibles avec le type de contenu MUST être refusés en nommant leur origine.
- **FR-008**: Les capacités d'édition MUST respecter la sémantique déclarée : texte simple sans enrichissement, texte riche limité aux marques contractuelles, booléen comme choix binaire, collection comme liste ordonnée et image comme média remplaçable avec alternative textuelle.
- **FR-009**: La structure intérieure de chaque section MUST être verrouillée. Les actions autorisées sur la section entière MUST faire l'objet d'un verdict distinct et ne MUST pas ouvrir les mêmes actions sur ses descendants.
- **FR-010**: Le panneau d'édition MUST afficher uniquement les contrôles explicitement déclarés pour la section et la cible sélectionnées. Toute option native non déclarée MUST être absente, jamais seulement inopérante.
- **FR-011**: Deux instances ou plus d'une même section MUST pouvoir coexister sur une page avec des contenus et réglages différents, sans partage involontaire d'état ou de politique locale.
- **FR-012**: Une nouvelle Google Reviews MUST initialiser sa collection depuis l'échantillon épinglé du contrat, puis permettre l'ajout, la suppression, le réordonnancement et l'édition indépendante des cartes selon les verdicts déclarés.
- **FR-013**: Le remplacement d'un avatar par une image MUST utiliser un média publiable, conserver son alternative textuelle et respecter les choix contractuels entre photo et initiale. Une source invalide MUST échouer ou produire le repli déclaré, jamais une publication cassée silencieuse.
- **FR-014**: Toute modification autorisée MUST survivre à l'enregistrement, à la fermeture puis réouverture de l'éditeur, et au rendu de la page publique.
- **FR-015**: Chaque section MUST être comparée à la surface HTML issue des mêmes entrées, dans des conditions de contenu, police, viewport et état identiques. Chaque différence MUST être chiffrée et attribuée, ou la mesure déclarée impossible.
- **FR-016**: Les tokens et styles contractuels destinés à Odoo MUST être des sorties reproductibles et remplaçables intégralement. Une modification directe de ces sorties MUST être détectée et bloquer la qualification.
- **FR-017**: Toute adaptation spécifique à Odoo qui ne peut pas provenir des sorties reproductibles MUST vivre dans une zone déclarée séparée, porter une raison codifiée et ne MUST pas introduire de valeur de design non reliée à une source gouvernée ou à une limite nommée.
- **FR-018**: Un rapport de dérivation lisible par machine, `derivation-report.json`, MUST être calculé à partir de l'écart entre les sorties prédites et les adaptations déclarées. Il MUST compter et nommer les écarts sans demander à l'auteur de déclarer subjectivement ce qui est dérivable.
- **FR-019**: Les sorties prédites et le rapport de dérivation MUST être identiques à l'octet pour deux exécutions portant sur les mêmes versions épinglées.
- **FR-020**: Chaque bloc sauvegardé MUST porter l'identité et la version de son contrat racine. Les composants imbriqués et leurs versions MUST rester retrouvables depuis le manifeste de qualification du bloc.
- **FR-021**: La politique de version MUST distinguer une évolution d'authoring applicable à la réouverture d'une évolution de structure stockée. Une structure ancienne MUST être détectée et orientée vers une action explicite ; aucune migration automatique n'est revendiquée dans cette feature.
- **FR-022**: Le module MUST s'installer sur une instance propre et se mettre à jour sur une instance contenant déjà les deux sections, sans perte silencieuse de contenu ni indisponibilité de la page publique.
- **FR-023**: Seuls les rédacteurs autorisés MUST pouvoir modifier les sections. Le contenu public MUST être passif : aucun texte riche, média ou champ édité ne peut injecter de script, de gestionnaire d'événement ou d'URL exécutable non autorisée.
- **FR-024**: Chaque nouveau claim de capacité MUST être précédé d'un contrôle nommé. La qualification MUST au minimum couvrir le déterminisme, le refus d'un verdict manquant, le refus d'un chemin invalide, l'isolation de deux blocs, les gestes d'édition, la sauvegarde/réouverture, le rendu public et la comparaison visuelle.
- **FR-025**: La feature MUST produire un guide d'agent réutilisable décrivant les entrées requises, l'ordre des décisions, les gestes de preuve, les interdits et la manière de consigner une exception. Ce guide MUST être exercé puis corrigé sur la seconde section avant clôture.
- **FR-026**: Un rapport de qualification MUST distinguer les capacités tenues, les limites acceptées, les mécanismes non exercés et les comportements hors contrat. Une mesure sautée ou une interaction non contractuelle ne MUST jamais être comptée comme réussie.
- **FR-027**: Si le travail parallèle de 020 modifie une dépendance épinglée de Présentation ou Google Reviews, 019 MUST signaler le croisement, repinner explicitement l'entrée et rejouer toutes les qualifications affectées avant clôture. À l'ouverture de 019, 020 est déclarée dans `ROADMAP.md` mais n'a pas encore de spécification ; la détection ne MUST pas dépendre d'elle — elle repose sur le verrou d'entrées de 019, qui échoue sur tout hash ou version modifié, quelle qu'en soit l'origine.
- **FR-028**: La clôture MUST fournir aux vagues 021 et 022 un paquet de fondation réutilisable : décisions d'authoring validées, guide d'agent, règles de version, preuves, rapport de dérivation et liste des mécanismes réellement prouvés.

### Key Entities

- **Section de production**: Bloc racine proposé au rédacteur ; possède une identité, une version de contrat, une composition interne et une politique d'authoring.
- **Snapshot d'entrées**: Ensemble épinglé des contrats, tokens, registres et échantillons utilisés pour produire et qualifier une version du module.
- **Décision de contrôle**: Verdict appliqué à une prop ; précise si elle est exposée, fixée ou écartée, avec la capacité d'édition attendue et sa justification.
- **Décision de part**: Verdict appliqué à un chemin complet de part rendue ; précise son éditabilité, ses marques autorisées et les conditions où elle existe.
- **Instance sauvegardée**: Copie d'une section stockée dans une page ; conserve son contenu, son identité racine et sa version d'origine.
- **Élément d'avis**: Entrée ordonnée de la collection Google Reviews ; rassemble les valeurs gouvernées par `ds.review-card`, y compris le mode et l'alternative de l'avatar.
- **Adaptation Odoo**: Écart cible-specific déclaré en dehors des sorties reproductibles, associé à une cause mesurable et à la section concernée.
- **Rapport de dérivation**: Relevé calculé des adaptations et de leur distance à la sortie prédite ; entrée factuelle du futur builder.
- **Reçu de qualification**: Preuve datée reliant un scénario, les versions testées, le résultat obtenu et toute limite observée.

### Out of Scope

- Les 11 autres sections et les corrections Figma ↔ contrat instruites en parallèle par 020.
- Le builder Odoo générique et déterministe ; il consommera les faits consolidés en 025.
- Header et Footer dans le squelette global du site, prévus en 023.
- La migration structurelle automatique des blocs déjà sauvegardés.
- La synchronisation avec une API d'avis externe ou l'actualisation automatique des notes.
- Le comportement de carrousel, les hovers et les interactions web non déclarées par les contrats actuels.
- L'invention d'un comportement responsive absent des contrats ; les limites de viewport doivent être nommées dans le rapport.
- Toute modification des contrats, de Figma ou de la surface React existante.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Les 2 sections de production sont installables, visibles une seule fois dans la bibliothèque et posables ; les 3 composants internes ne créent aucune entrée supplémentaire.
- **SC-002**: 100 % des props et des parts rendues couvertes par les 5 contrats reçoivent exactement un verdict, avec 0 chemin absent ou ambigu.
- **SC-003**: Deux instances de chaque section, configurées différemment sur une même page, conservent 100 % de leurs différences après sauvegarde, réouverture et rendu public, sans fuite entre instances.
- **SC-004**: Sur Google Reviews, un cycle ajouter → modifier → réordonner → supprimer une carte, ainsi qu'un remplacement d'avatar, conserve 100 % des valeurs attendues après réouverture.
- **SC-005**: La revue exhaustive du panneau et des zones de sélection constate 0 option d'édition non déclarée et 0 geste intérieur permettant de modifier la structure verrouillée.
- **SC-006**: Les 2 sections obtiennent un écart visuel de **0,0000 %** contre leur référence HTML dans les conditions épinglées ; si cette valeur est techniquement impossible, chaque pixel résiduel est chiffré, attribué et soumis à acceptation explicite avant clôture. Le précédent était mal cité, et sa correction change la lecture de ce critère (**2026-08-08**, `proofs/correction-premisse-018.md`) : les **4,1707 %** sont la mesure du 2026-08-06, et 018 les a ramenés à **0 sur les trois composants** dès le lendemain, en remplaçant le `.container` de Bootstrap par une borne maison sans gouttière. La clause d'acceptation n'est donc PAS « l'issue attendue » : l'obstacle a été vaincu une fois, et 0,0000 % est atteignable avec un balisage porteur d'éditabilité. Deux mises en garde subsistent : l'artefact à 0 % de 018 porte `plancherDeTolerance: null` et viole l'invariant C3 de son propre contrat ; et le 0 % a d'abord été obtenu en retirant le conteneur, ce qui **cassait la vraie page** — « l'instrument a récompensé la suppression de ce qui faisait marcher la page ». Un résidu attribué à cette cause MUST être présenté comme le prix d'un choix, jamais comme une fatalité d'Odoo.
- **SC-007**: Deux productions successives des sorties reproductibles et du rapport de dérivation sont identiques à l'octet ; toute altération directe volontaire d'une sortie est détectée avant qualification.
- **SC-008**: 100 % des blocs sauvegardés inspectés exposent leur identité et version, et 100 % des blocs simulés anciens sont signalés sans faux message de migration accomplie.
- **SC-009**: Tous les scénarios de contenu hostile prévus sont refusés ou neutralisés, avec 0 script, gestionnaire d'événement ou URL exécutable non autorisée sur la page publique.
- **SC-010**: Une installation propre et une mise à jour avec contenu existant se terminent sans erreur bloquante et sans perte de contenu observée sur les 2 sections.
- **SC-011**: 100 % des adaptations manuelles présentes dans le périmètre déclaré apparaissent automatiquement dans `derivation-report.json`; aucune adaptation n'est classée par une opinion libre de l'agent.
- **SC-012**: Dans l'environnement de qualification local, au moins 95 % des changements de texte, booléen et ordre de liste sont visibles dans l'éditeur en moins d'une seconde, hors téléversement d'image et sauvegarde réseau. L'échantillon MUST être déclaré avant la mesure — liste nommée des gestes couverts, nombre de répétitions, et instrument qui les chronomètre. Sans instrument livré, le critère est déclaré **non mesuré** dans le rapport de clôture ; il n'est jamais réputé tenu par observation à l'œil.
- **SC-013**: L'owner peut affecter chaque mécanisme observé à 021, 022 ou 025 depuis les artefacts de clôture sans relire le code du module ni demander à l'agent de reconstituer son raisonnement.

## Assumptions

- `ds.presentation` et `ds.google-reviews` sont les deux références déclarées propres au départ ; 020 ne les réaudite que si elle touche une dépendance commune.
- Les versions observées à l'ouverture de la feature sont `ds.presentation@2.5.0`, `ds.section-header@2.1.1`, `ds.button@2.0.0`, `ds.google-reviews@1.0.0` et `ds.review-card@1.0.0`. Le snapshot effectif de qualification reste l'autorité si une coordination 020 impose un repin explicite.
- Le repin explicite du 2026-08-11 fixe le snapshot effectif à `ds.presentation@2.5.0`, `ds.section-header@2.2.0`, `ds.button@2.0.1`, `ds.google-reviews@1.0.0` et `ds.review-card@1.0.0`, avec `graphDigest=9cf060ab2f36fecfcf9f54903725ef86648b1fd43cdb8f57acedc66e89d8f9f0`. Les changements Fill/Hug sont dérivés des contrats et non recopiés depuis Figma.
- La cible de qualification reste Odoo 19 épinglé sur la même lignée que le POC 018 ; un changement de version cible exige une nouvelle qualification de compatibilité.
- Présentation et Google Reviews sont des sections de contenu. Les rédacteurs utilisent les permissions standard du site ; cette feature n'introduit pas un nouveau modèle de rôles.
- Le rendu HTML produit depuis le contrat est la référence visuelle de la cible Odoo. Figma reste la surface amont déjà qualifiée pour ces deux sections, pas une source de styles à recopier directement.
- Les cinq avis du sample servent de contenu initial et de fixture de qualification, pas de promesse de connexion à un service Google.
- Le POC 018 est une source de faits et de mécanismes vérifiés, mais aucun de ses fichiers n'est promu tel quel comme module de production.
- Un agent peut authorer le module, les décisions et les adaptations ; il ne participe jamais à la production reproductible des sorties générées ni au calcul du rapport de dérivation.
- La gouvernance de l'éditeur reproduit un mécanisme que 018 a exercé et mesuré tenu sur un bloc : fermeture de la racine puis réouverture sélective par sélecteurs d'éditabilité (7 attentes sur 7). 019 doit le requalifier dans l'addon de production et fermer le trou resté ouvert en 018 : déplacement, duplication et suppression des descendants. Tant que ce spike n'est pas concluant, FR-009 / FR-010 restent non prouvés et toute limite est nommée avant claim.
- Le calendrier de la feature n'appartient pas à cette spec : J1–J2 pour 019 et l'objectif J5 pour les 13 sections sont fixés par la séquence approuvée le 2026-08-07 dans `ROADMAP.md`. C'est la source à citer quand le plan ou la recherche écartent une alternative pour raison de délai.

La correction datée et ses reçus sont conservés dans `proofs/correction-premisse-018.md`.

## Extension gouvernée — Hero (2026-08-11)

À la demande de portage `ds.hero`, le snapshot actif étend la fondation historique sans réécrire
son périmètre initial : 3 racines posables et 6 contrats dans la fermeture, avec
`ds.hero@1.5.0` et `graphDigest=cac34666a20a13d86d285e8d600e9fbf8da86b56e08404afba6ee5949c2fff1b`.
Pour cette extension, les exigences FR-006 à FR-011 et FR-014 à FR-024 s'appliquent aussi au Hero.

Le Hero est un bloc CMS instanciable. Sa valeur `backgroundUrl` est vide dans le template de
production : aucune image métier n'est livrée par l'addon. Chaque rédacteur choisit un média via le
sélecteur natif Odoo ; après sauvegarde, la source publiée doit être locale (`/web/image/...` ou
`/web/content/...`) et rester propre à l'instance. `backgroundAlt`, titre, sous-titre et label CTA
suivent les verdicts exhaustifs de `hero.authoring.json`. Le fond suit Fill, le CTA Hug/nowrap, et
la qualification couvre 1728 et 1440 px sans inventer un breakpoint absent du contrat.

Les critères SC-001, SC-002, SC-003, SC-006 et SC-010 se lisent donc, pour le snapshot actif,
respectivement comme 3 sections, 6 contrats, deux instances de chacune, trois comparaisons et une
installation/update des trois sections. Les formulations à 2/5 plus haut restent le dossier
historique de la fondation initiale, pas l'état courant du lock.

## Extension gouvernée — Équipe (2026-08-11)

Le portage `ds.equipe@1.2.0` ajoute une quatrième racine et les dépendances
`ds.member-card@1.3.0` et `ds.member-picture@1.3.0`. Le snapshot actif contient donc 4 racines,
9 contrats et porte `graphDigest=96f4b959c53e893983181fd16bd6a9b19713a9f03b73af2f1b13e00db07c02c0`.

La politique autorise la collection ordonnée, le nom, le poste, le portrait et son alternative.
L’état et la taille de MemberPicture ainsi que toute la structure restent fixés par composition.
La qualification couvre deux instances, les cardinalités 0/1/16/17, save/reopen/public, un média
same-origin exploitable, la grille 4 colonnes à 1728/1440 et une comparaison visuelle stricte.
Les critères de sortie actifs se lisent désormais comme 4 sections, 9 contrats, deux instances de
chacune, quatre comparaisons et une installation/update des quatre sections.
