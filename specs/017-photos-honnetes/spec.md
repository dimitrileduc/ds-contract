# Feature Specification: Photos honnêtes

**Feature Branch**: `017-photos-honnetes`
**Created**: 2026-08-06
**Status**: Draft
**Input**: User description: "Les photos ne mentent plus. Deux rapports du système disent aujourd'hui le faux sur les images : le rapport de photos passe au vert alors que 62 photos du client sont perdues, et la porte de parité visuelle annonce 99,97 % de divergence là où elle compare simplement un cadre vide à un cadre rempli. On répare les deux, et on fait parler la marque † qui devait avertir le designer et ne dit rien."

## Pourquoi maintenant — et pourquoi ce n'est PAS « gouverner les images »

Ce chantier était inscrit à la feuille de route sous le nom « images A5 », avec l'idée que le contrat devait finir par porter l'image. **Le relevé du 2026-08-06 a montré que cette prémisse était fausse**, et le dépôt le disait déjà dans ses propres mots.

Une part image est un **cadre photo vide**. Côté code, le cadre reçoit la photo que le site lui donne à l'exécution. Côté Figma, le designer a posé une photo dedans pour que la maquette ressemble à quelque chose. Ce ne sont pas deux versions d'un même fait : c'est **un emplacement** d'un côté et **un exemple** de l'autre. Les deux ont raison.

Trois relevés, tous vérifiés ce jour :

1. **La convention est déjà écrite.** Les 12 parts image des 9 contrats portent une prop d'URL de type texte, défaut vide, sans liaison Figma. Un contrat le dit noir sur blanc : *« Figma n'expose aucune propriété de composant pour ces pixels. **Le contrat porte donc la ROUTE, jamais les octets** »*. La seule URL liée à une propriété Figma se décrit elle-même comme *« inerte sur le canevas »*.
2. **Figma ne peut pas lier un contenu d'image.** Le dossier de capacité, colonne « liable », ligne 91 : `— (image content not bindable)`. L'image ne roulera jamais sur l'axe des variables, quoi qu'on fasse.
3. **Le mécanisme d'avertissement existe déjà — et il est muet.** Le moteur marque bien le composant Figma quand une part porte un fait qui n'existe qu'en code. La marque, en entier, c'est : `Nom — generated from contract ds.x v1.2.0 †`. Un `†`. La table de phrases d'avertissement du dossier de capacité (« le curseur n'existe qu'en code », « l'animation ne tourne qu'en code »…) **n'a aucune ligne pour l'image**.

Donc l'image reste dynamique, et 017 ne la gouverne pas. Ce qui reste à réparer, ce sont **deux rapports qui disent le faux**, et **une phrase qui manque**.

**Le rapport de photos ment.** Reconstruire un composant Figma depuis son contrat en repeint l'intérieur. Le moteur sauve les photos — mais seulement celles posées **sur le composant maître**. Celles posées **page par page** ne sont pas vues, et le recensement par maître ne peut structurellement pas voir la perte : la limite était nommée d'avance. Résultat mesuré le 2026-08-06 : **62 photos à reposer sur 10 sections de 8 maquettes**. Sur la page À Propos, section Équipe : **17 portraits distincts à l'origine, 2 au vif**. Les portraits de l'équipe sont tous faux, et le rapport de clôture annonçait « 57/57 photos préservées » — en toute bonne foi.

**La porte de parité ment aussi.** L'instrument rend notre composant **sans aucune donnée** (URL vide) et le compare au maître Figma **où la photo du designer est cuite**. Huit lignes en sortent, classées « frontière image », la pire à **99,97 %**. Ce nombre ne mesure aucun défaut : il mesure qu'on n'a pas donné de photo à notre côté. C'est la pire ligne du système, et c'est un artefact.

La règle du dépôt vaut pour les deux : *ce que le contrat ne gouverne pas, la régénération ne doit pas prétendre le posséder — et une omission silencieuse est la classe de bug la plus grave d'ici.*

## Clarifications

### Session 2026-08-06

- Q: Le contrat doit-il porter l'image (échantillon de canvas, ou route résolue à la synchronisation) ? → A: **Non.** L'image est du contenu dynamique ; le contrat porte la route, jamais les octets — convention déjà écrite au dépôt et re-vérifiée ce jour. Le périmètre retenu est **mesure juste + préservation**. La lacune de capacité A5 reste **ouverte et nommée**, elle n'est pas fermée par cette spec.
- Q: Que devient la marque `†` posée sur les composants Figma ? → A: elle est conservée et **complétée** pour l'image — c'est le mécanisme d'avertissement prévu par le système, aujourd'hui présent mais vide. La forme exacte de ce complément est tranchée plus bas.
- Q: Par quel moyen remet-on les deux côtés à armes égales pour les lignes « frontière image » ? → A: **on donne à notre surface la photo de maquette exportée**, en échantillon de mesure ; le côté Figma reste tel quel. La déclaration « non comparable » devient le **recours**, réservé aux lignes où aucune photo ne peut être obtenue. L'échantillon vit dans l'instrument de mesure, jamais au contrat.
- Q: Sur quoi le contrôle des photos s'appuie-t-il pour dire « c'est la même photo » ? → A: **une empreinte d'image relevée par emplacement** — `(hôte, part/rang) → empreinte` — comparée avant et après reconstruction. C'est la branche qui **ferme** le risque d'interversion au lieu de le reconduire ; le comptage d'images distinctes par hôte reste, en second, pour dire la perte et l'effondrement en clair.
- Q: Quelle surface fait foi pour la preuve d'US1 ? → A: **le sans-tête**. Le faux-Figma apprend les instances de page et leurs surcharges de peinture, et le contrôle devient une **porte rejouable du dépôt**, exécutable sans le fichier ouvert. Une **rejouée sur le fichier client** sert de reçu daté, planifiée avec l'owner. C'est la discipline de fidélité du faux-Figma déjà écrite au dépôt : réparer l'émetteur, puis apprendre au faux-Figma à attraper la classe de défaut pour toujours.
- Q: Que fait la reconstruction quand une photo relevée n'a nulle part où être reposée ? → A: **elle se refuse avant toute mutation** et nomme la photo bloquante — rien n'est touché. L'owner peut **lever au cas par cas, par acquittement écrit**, pour le cas légitime d'une part retirée du contrat. Motif : ce qui est écrasé au canevas ne revient pas, et le dépôt refuse déjà par le nom plutôt que de générer à moitié.
- Q: Où loge la phrase destinée au designer, sachant que la description est tenue à **une seule ligne** par une directive owner du 2026-07-19 ? → A: **une clause courte ajoutée à la ligne de légende**, pour les composants à cadre photo seulement — la description reste une ligne, la directive tient, et le détail long part à la documentation (FR-011).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Les photos du designer ne disparaissent plus (Priority: P1)

Le fichier Figma est un fichier client vivant. Chaque page y pose ses propres photos : une rangée de cartes porte cinq images différentes, une section équipe porte dix-sept portraits. Ces photos sont du contenu de page — elles n'ont pas vocation à entrer au contrat, et elles n'y entreront pas. Mais aujourd'hui elles n'ont **aucune protection réelle** : reconstruire le composant maître les écrase, la sauvegarde du moteur ne descend pas jusqu'aux pages, et le contrôle qui devrait le voir regarde au mauvais endroit.

En tant qu'utilisateur du fichier client, je veux que **les photos posées page par page survivent à une reconstruction**, et que **le contrôle échoue franchement si l'une d'elles tombe**, afin qu'aucun rapport ne puisse plus être vert pendant que dix-sept portraits deviennent deux.

**Why this priority**: c'est un dégât réel, sur un fichier client livrable, et il est reproductible à chaque reconstruction. C'est aussi exactement la classe de bug que ce dépôt déclare la plus grave : une perte silencieuse derrière un rapport vert. Rien d'autre ne passe devant.

**Independent Test**: prendre une section dont les instances portent plusieurs photos distinctes, relever l'empreinte de chaque photo **par emplacement**, reconstruire son composant maître, puis relever à nouveau. Chaque empreinte doit être retrouvée au même emplacement, et le compte d'images **distinctes par hôte** doit être identique — et le contrôle doit **échouer** quand on lui soumet volontairement un cas où une photo a été perdue, et un cas où deux photos ont échangé leur place.

**Acceptance Scenarios**:

1. **Given** une section dont les instances portent N photos distinctes, **When** son composant maître est reconstruit, **Then** les N photos distinctes sont toujours là, chacune à sa place — vérifié **à l'instance**, jamais seulement au maître.
2. **Given** une reconstruction qui perd, effondre ou intervertit une photo, **When** le contrôle tourne, **Then** il **échoue** et nomme la photo, l'hôte et le rang concernés.
3. **Given** une photo qu'aucun emplacement ne peut accueillir, **When** la reconstruction est demandée, **Then** elle **se refuse avant de toucher quoi que ce soit** et nomme la photo bloquante, son hôte et son rang — sauf acquittement écrit de l'owner sur cette photo, qui reste visible au rapport.
4. **Given** deux plans photo de même taille sur un même composant, **When** la reconstruction les intervertit, **Then** le contrôle **échoue** et nomme les deux emplacements concernés — l'identité de chaque photo est vérifiée à sa place, jamais supposée.
5. **Given** le contrôle en place, **When** il tourne deux fois de suite sans qu'on touche à rien, **Then** le verdict est identique les deux fois.

---

### User Story 2 - La porte de parité cesse de mesurer un cadre vide (Priority: P2)

Huit lignes de la porte de parité visuelle sont aujourd'hui classées « frontière image », de 99,97 % à 15,64 %, alors que la ligne de porte est à 2 %. Aucune ne mesure un défaut : l'instrument affiche notre composant **sans donnée** et le compare à une maquette **avec la photo du designer**. Tant que ces lignes restent, le pire chiffre du système est un artefact, et il masque ce qui se cache dessous.

En tant qu'owner du système, je veux que **chaque ligne mesurée compare des choses comparables**, afin que le pire chiffre de la porte redevienne un vrai défaut et que je puisse enfin voir ce que la frontière image cachait.

**Why this priority**: sans cette réparation, la mesure ne sert plus à décider. Elle vient après US1 parce qu'un chiffre trompeur coûte moins cher qu'un fichier client abîmé.

**Independent Test**: re-mesurer les huit lignes, notre surface tenant cette fois la photo de maquette exportée. Chacune doit soit passer sous la ligne de porte, soit être **déclarée non comparable avec sa raison écrite** — et aucune ne doit plus porter un score qui mesure l'absence de données.

**Acceptance Scenarios**:

1. **Given** une ligne dont le maître Figma porte une photo, **When** la mesure tourne, **Then** les deux côtés montrent la même chose, ou la ligne est déclarée non comparable avec sa raison — jamais un score qui mesure l'absence de données.
2. **Given** une ligne déclarée non comparable, **When** le rapport est lu, **Then** elle est **visible et comptée** comme telle ; elle n'est ni masquée, ni affichée à 0 %, ni absorbée dans une tolérance.
3. **Given** une ligne re-mesurée à armes égales, **When** un écart subsiste, **Then** il est **re-classé à sa cause réelle re-mesurée** — jamais hérité de l'ancienne étiquette, jamais requalifié en bruit acceptable.
4. **Given** la réparation de la mesure, **When** elle révèle un défaut jusqu'ici caché sous la frontière image, **Then** ce défaut est **nommé et consigné**, même s'il n'est pas réparé par cette spec.
5. **Given** l'état final, **When** la mesure tourne deux fois sans qu'on touche à rien, **Then** les scores sont identiques.

---

### User Story 3 - Le designer comprend enfin ce qu'est ce cadre (Priority: P3)

Le système possède déjà le mécanisme pour prévenir : quand une part porte un fait qui n'existe qu'en code, le composant Figma reçoit une marque. Mais pour l'image, cette marque est **une croix sans phrase**. Un designer qui ouvre le fichier voit un `†` et ne peut pas savoir que le cadre est un emplacement dynamique, ni que la photo qu'il voit est un exemple de maquette, ni ce qui arrivera à sa photo si le composant est reconstruit.

La légende du canevas est tenue à **une ligne** par une directive owner du 2026-07-19 — les paragraphes de copie du dossier de capacité y avaient été jugés sans intérêt pour les designers, et renvoyés à la documentation. Cette spec ne rouvre pas ce choix : elle ajoute **une clause courte** à la ligne existante, et laisse le reste à la documentation.

En tant que designer travaillant dans le fichier, je veux **lire en clair ce qu'est ce cadre**, et trouver dans la documentation ce qui arrivera à ma photo, afin de ne pas découvrir la règle par accident.

**Why this priority**: petit, borné, et c'est exactement ce que le mécanisme d'avertissement du système est censé faire. Il vient en dernier parce que les deux rapports faux coûtent davantage.

**Independent Test**: ouvrir un composant porteur de cadre photo et lire sa légende ; en une ligne, elle doit dire ce qu'est le cadre. Puis poser à la documentation seule la question « que devient ma photo à la reconstruction ? » : elle doit y répondre **sans qu'on ait à lire le code**.

**Acceptance Scenarios**:

1. **Given** un composant dont une part est un cadre photo, **When** un designer lit sa légende dans Figma, **Then** il apprend, en une ligne, que le cadre est un emplacement dynamique et que l'image visible est un exemple — et la documentation lui dit ce qui arrive à sa photo si le composant est reconstruit.
2. **Given** la table d'avertissements du dossier de capacité, **When** on y cherche l'image, **Then** elle a sa ligne, au même format que les autres.
3. **Given** la question « que devient une image à la régénération ? », **When** on la pose à la documentation seule, **Then** elle y répond — le paquet d'accueil cesse d'être muet sur le sujet qui porte le pire écart mesuré du système.

---

### Edge Cases

- **Une photo n'a aucun emplacement où être reposée** → la reconstruction se refuse avant toute mutation et nomme la photo ; seul un acquittement écrit de l'owner lève le refus, et il reste visible au rapport. Aucun rapport ne peut être vert sur une photo perdue.
- **Deux plans photo de même taille sur un même composant** → l'interversion silencieuse est fermée par l'empreinte relevée à l'emplacement : deux photos échangées font échouer le contrôle et sont nommées.
- **Le contrôle ne peut pas s'exécuter** (source inaccessible, relevé impossible) → il le **dit** ; un contrôle empêché n'est jamais un contrôle vert.
- **La mesure à armes égales révèle un défaut plus grave que la frontière image** → il est nommé et consigné, pas dissimulé par la réparation qui l'a découvert.
- **L'état de survol d'un cadre photo** : la maquette photographie un portrait assombri, les contrats n'ont aucun état interactif. Une fois la mesure réparée, l'écart résiduel **change de cause** et doit être re-mesuré, pas hérité.
- **Une ligne devient non comparable pour de bon** → c'est une limite nommée, comptée et visible au rapport ; jamais une ligne discrètement retirée de la liste.
- **La clause est émise, mais le canevas ne l'a pas encore reçue** → 017 ne mute pas le fichier client : la légende que lit un designer dans Figma reste l'ancienne jusqu'au lot de régénération de la fenêtre vive. Reporté et nommé (SC-006-vif), jamais compté comme acquis parce que l'émetteur l'émet.
- **Le fichier client est encore abîmé** au moment où cette spec démarre : la restauration des 62 photos relève de la spec précédente et attend le pont. Aucune reconstruction des composants concernés ne démarre avant qu'elle soit faite et prouvée.
- **Un composant à répétition** ne dispose que d'un seul échantillon pour toutes ses variantes : une carte et sa photo se reperdent à chaque reconstruction. Défaut déjà nommé, **hors périmètre** — mais la consigne de reposer la carte à la main reste valable tant qu'il vit.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La préservation des photos hors contrat DOIT descendre jusqu'aux **surcharges posées sur les instances de page**, pas seulement aux peintures du composant maître.
- **FR-002**: Le contrôle des photos DOIT relever une **empreinte d'image par emplacement** — `(hôte, part/rang) → empreinte` — avant et après reconstruction, et **échouer** sur toute empreinte manquante, dupliquée ou déplacée. Il DOIT aussi rendre le compte d'images **distinctes par hôte**, pour dire la perte et l'effondrement en clair. Un rapport vert en présence d'une perte est interdit.
- **FR-002a**: Le contrôle DOIT être **rejouable sans le fichier client ouvert** et faire porte au dépôt : le faux-Figma DOIT apprendre les instances de page et leurs surcharges de peinture, de sorte que la perte constatée le 2026-08-06 soit attrapée sans tête, pour toujours.
- **FR-002b**: Une **rejouée sur le fichier client**, planifiée avec l'owner, DOIT être produite comme reçu daté ; elle confirme le contrôle, elle ne le remplace pas.
- **FR-003**: Toute photo non replacée DOIT être rapportée nommément, avec son hôte et son rang.
- **FR-003a**: Dès qu'une photo relevée n'a **aucun emplacement d'accueil**, la reconstruction DOIT **se refuser avant toute mutation** — aucun nœud touché — et nommer la photo bloquante, son hôte et son rang.
- **FR-003b**: Ce refus DOIT être levable **au cas par cas par un acquittement écrit de l'owner**, nommant la photo levée et son motif ; l'acquittement DOIT rester visible au rapport, jamais fondu dans le vert.
- **FR-004**: Le risque d'interversion entre deux plans de même taille DOIT être **fermé** par la comparaison d'empreintes par emplacement de FR-002 : deux photos qui échangent leur place font échouer le contrôle et sont nommées. Il n'est pas reconduit comme limite.
- **FR-005**: Aucune reconstruction **sur le fichier client** des composants touchés par l'effondrement des 62 photos ne DOIT démarrer avant que leur restauration soit exécutée et prouvée. Le travail sans tête n'est pas bloqué par cette précondition.
- **FR-006**: Chaque ligne de la porte de parité visuelle DOIT comparer des états comparables : même contenu des deux côtés, ou ligne **déclarée non comparable avec sa raison écrite**.
- **FR-006a**: La remise à armes égales DOIT se faire **en donnant à notre surface la photo de maquette exportée**, en échantillon de mesure ; le côté Figma n'est pas modifié. La déclaration « non comparable » est le **recours**, réservé aux lignes où aucune photo ne peut être obtenue — jamais la réponse de première intention.
- **FR-006b**: L'échantillon de mesure DOIT vivre dans l'instrument de mesure et NE DOIT PAS entrer au contrat, ni y être référencé — la convention de FR-012 reste entière.
- **FR-007**: Une ligne déclarée non comparable DOIT rester **visible et comptée** au rapport — jamais masquée, jamais affichée comme conforme, jamais absorbée dans une tolérance.
- **FR-008**: Tout écart subsistant après la remise à armes égales DOIT être **re-mesuré et re-classé à sa cause réelle** ; aucune cause n'est héritée, aucun résiduel n'est requalifié en bruit acceptable.
- **FR-009**: Tout défaut révélé par la remise à armes égales DOIT être nommé et consigné, même si cette spec ne le répare pas.
- **FR-010**: La description du composant Figma DOIT porter, pour un composant à part cadre photo, une **clause courte ajoutée à sa ligne de légende** disant que le cadre est un emplacement dynamique et que l'image visible est un exemple de maquette. La description DOIT rester **une seule ligne** — la directive owner du 2026-07-19 tient, aucun retour aux paragraphes de copie.
- **FR-010a**: Ce qui arrive à la photo à la reconstruction DOIT être dit par la documentation (FR-011), pas par la légende du canevas.
- **FR-011**: La documentation DOIT porter la ligne d'avertissement correspondante et répondre à la question « que devient une image à la régénération ? » **sans qu'on ait à lire le code**.
- **FR-012**: La convention en vigueur DOIT être réaffirmée et non contredite : le contrat porte la route de l'image, jamais ses octets. Aucune image n'entre au contrat par cette spec.
- **FR-013**: La lacune de capacité relative aux images DOIT rester **ouverte et nommée** ; le dossier de capacité DOIT cesser de la confondre avec un défaut de fidélité mesuré.
- **FR-014**: Chaque capacité revendiquée DOIT être adossée à un contrôle adverse re-jouable écrit **avant** la revendication.
- **FR-015**: Toute vérification empêchée ou incomplète DOIT être dite et consignée — jamais comptée comme un succès silencieux.

### Key Entities

- **Le cadre photo** : l'emplacement qu'une part image représente. Il porte une route (fournie à l'exécution), jamais des octets. Il n'est pas la photo.
- **La photo de maquette** : l'image posée par le designer dans Figma, sur un composant maître ou sur une instance de page. Contenu, jamais donnée du contrat. Toujours préservée, désormais vérifiée jusqu'à l'instance.
- **Le rapport de photos** : par composant et par hôte — attendues, préservées, non replacées, l'**empreinte relevée à chaque emplacement** avant/après, et le compte d'images **distinctes**. Il peut échouer ; c'est sa raison d'être.
- **L'échantillon de mesure** : la photo de maquette exportée, donnée à notre surface le temps d'une mesure pour que les deux côtés montrent la même chose. Elle appartient à l'instrument, jamais au contrat, et n'est pas une donnée d'exécution.
- **La ligne de mesure** : une comparaison entre notre surface et la maquette. Elle est soit comparable et notée, soit **déclarée non comparable avec sa raison** — jamais un score qui mesure l'absence de données.
- **L'avertissement de canvas** : la ligne de légende que le composant Figma porte pour un fait qui n'existe qu'en code — une ligne, marquée d'un `†`. Le mécanisme existe ; pour l'image il est vide, et reçoit ici une clause courte.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **Zéro** photo perdue, effondrée ou intervertie lors d'une reconstruction complète — vérifié **à l'instance**, par comparaison d'empreintes relevées à chaque emplacement et par comptage d'images distinctes par hôte. Référence actuelle : 62 photos perdues sur 10 sections de 8 maquettes, avec un rapport vert.
- **SC-002**: Soumis à un cas où une photo a été volontairement perdue, **et** à un cas où deux photos ont volontairement échangé leur place, le contrôle **échoue** dans les deux — un rapport vert en présence d'une perte ou d'une interversion devient impossible. Soumis à une photo sans emplacement d'accueil, la reconstruction **se refuse sans avoir touché un seul nœud**.
- **SC-003**: **Zéro** ligne de la porte de parité visuelle ne conserve un score qui mesure l'absence de données. Les huit lignes classées « frontière image » aujourd'hui — 99,97 %, 99,86 %, 64,48 %, 64,14 %, 58,33 %, 56,56 %, 52,52 %, 15,64 % — finissent dans **l'une de trois issues, et aucune autre** : (a) sous la ligne de porte de 2 % ; (b) **déclarées non comparables avec leur raison**, visibles et comptées ; (c) **re-classées à une cause réelle re-mesurée** et acquittées avec leur motif écrit, visible au rapport. La troisième issue n'est pas une échappatoire, c'est la réussite d'US2 : un écart réel au-dessus de la porte est exactement ce que la frontière image cachait (SC-004). Ce que SC-003 interdit n'est pas un chiffre élevé — c'est un chiffre qui ne mesure rien.
- **SC-004**: Après remise à armes égales, la **pire ligne** de la porte est un écart réel, re-mesuré et re-classé à sa cause — plus aucune cause héritée sur ces lignes.
- **SC-005**: **100 %** des défauts révélés par la remise à armes égales sont nommés et consignés, y compris ceux que cette spec ne répare pas.
- **SC-006**: La clause est **émise pour les 9 composants à cadre photo et pour eux seuls** — les 25 autres légendes inchangées au caractère près — en **une ligne**, la marque `†` cessant d'être muette sur l'image ; ce qui arrive à sa photo se lit dans la documentation. Prouvé **sur la surface générée, sans le fichier client ouvert**.
- **SC-006-vif**: Qu'un designer la **lise dans Figma** exige une écriture au canevas, que FR-005 interdit tant que la restauration des 62 photos n'est pas faite et prouvée. C'est donc **reporté et nommé** — porté par le lot de régénération de la fenêtre vive (Phase 6), jamais supposé acquis par le seul fait que l'émetteur l'émet. Tant que la fenêtre n'est pas passée, la légende vue par un designer est l'ancienne, et le rapport de clôture le dit.
- **SC-007**: La question « que devient une image à la régénération ? » trouve sa réponse dans la documentation seule, sans lecture de code — et cette réponse, comme la copie d'avertissement de la matrice, est **épinglée par un cas d'eval** : une doc qui affirme sans contrôle derrière est exactement le défaut que cette spec répare ailleurs (FR-014, §II).
- **SC-008**: **100 %** des capacités revendiquées ont leur contrôle adverse re-jouable, écrit avant la revendication ; la suite déterministe reste verte au compte imprimé du jour, et le contrôle des photos y tourne **sans le fichier client ouvert**.
- **SC-009**: Deux exécutions successives sans aucun geste rendent des verdicts et des scores identiques — zéro faux signal.

## Assumptions

- **L'image reste dynamique, et le contrat porte la route, jamais les octets.** C'est la convention déjà écrite au dépôt ; 017 la réaffirme et ne la change pas.
- **Les photos de maquette restent du contenu Figma.** Elles sont de la décoration destinée à faire ressembler la maquette à quelque chose ; aucune n'entre au contrat.
- **La lacune de capacité relative aux images n'est pas fermée par cette spec.** Elle reste ouverte et nommée. 017 arrête seulement de la confondre avec un défaut mesuré.
- **La restauration des 62 photos effondrées relève de la spec précédente** — son plan est au dépôt, son exécution attend le pont. 017 en dépend comme d'une précondition, empêche la récidive et la rend détectable ; il ne refait pas la restauration.
- **Le défaut « un seul échantillon par répétition »** reste nommé et hors périmètre : c'est une extension distincte.
- **L'absence d'état interactif** dans les contrats reste vraie : une fois la mesure réparée, l'écart résiduel d'un état de survol changera de cause et devra être re-classé.
- **Toute prémisse héritée est re-mesurée avant d'être utilisée.** C'est la règle du dépôt, et c'est elle qui a produit cette spec : la prémisse « il faut gouverner les images » a été mesurée au lieu d'être héritée, et elle était fausse.
- **Le contrôle fait foi sans tête ; le fichier client fournit le reçu.** La porte tourne sans le fichier ouvert, et la rejouée vive la confirme. Cette rejouée exige le fichier ouvert avec le pont branché : elle ne tourne ni sans surveillance ni en intégration continue, et sa fenêtre se planifie avec l'owner.

## Out of Scope

- **Gouverner une image au contrat**, sous quelque forme que ce soit — image de référence, échantillon de canvas, ou route résolue à la synchronisation. Écarté le 2026-08-06, motif au registre des clarifications.
- **Le second plan photo de MemberCard** et son blocage nommé. Il est devenu bon marché et sans rapport avec la frontière image — nommé ici, non fait.
- **L'extension de schéma « un échantillon par variante »** pour les composants à répétition.
- **L'angle mort d'instrument voisin** : la mesure visuelle rend une surface qui n'est pas celle que les consommateurs installent. Défaut connu, consigné ailleurs, non traité ici.
- **Les autres lacunes classées du dossier de capacité** (modes de fusion, motifs de tirets, flous), et les littéraux de trait, peinture et typographie encore hors gouvernance.
- **L'arbitrage ouvert sur les sections client non gouvernées** — les gouverner ou reposer leurs mises en page.
