# Feature Specification: Spec A — Source Figma propre (naming, styles, descriptions, géométrie) avant extraction

**Feature Branch**: `005-figma-source-cleanup`  
**Created**: 2026-07-25  
**Status**: Draft  
**Input**: User description (brief owner livré en session du 2026-07-25, repris de `specs/003-externalize-figma-components/BACKLOG-SPEC-A-figma-propre.md`) : « **Spec A — Figma propre + finitions.** 100 % canvas, preuve pixel (même méthode que la 003). **Prérequis de la Spec B** : on n'extrait rien vers du code tant que les calques mentent. Audits de référence : `audits/bonnes-pratiques-{atomes,molecules,organisms}.md`. Hors périmètre (décision owner) : refacto Header nav (seul son padding 88→89 reste — bug validé) ; tout changement de design (contrastes, taille Checkbox, scrim). » Le brief porte 4 règles (3×, jamais de fix design, zéro dégradation non signalée, naming d'abord), 5 tâches globales G1-G5, un découpage par niveau (atomes / molécules / organisms), un protocole de preuve et de cadence, 3 décisions ouvertes, et 5 blocs de détail D1-D5. Le volet « comment » (ordre exact des gestes, scripts de pont, découpage en tâches) est parqué pour `/speckit.plan`. **Le périmètre de ce brief a été amendé par l'owner le 2026-07-25** au cours de la session de clarification : trois zones qu'il déclarait hors périmètre y sont entrées (refacto de l'en-tête de navigation, rangement de la page fourre-tout, renommage du master sous contrat) et une en est sortie (carte d'avis). Les amendements font foi sur le brief d'origine ; voir `## Clarifications`.

## Clarifications

### Session 2026-07-25

- Q: Tab — les 3 variants sont identiques (souligné 2px partout) alors que la description du composant annonce un soulignement réservé à l'état sélectionné : la source se contredit. Retirer le soulignement du variant `Défaut` (fix design assumé) ou rester fidèle à une source fausse ? → A: **Retirer le soulignement de `Défaut`** — fix design explicitement assumé, seule entorse à la règle « jamais de fix design » de cette itération. L'axe `État` devient fonctionnel. Diff non nul attendu sur les seules maquettes portant un Tab, validé sur crop, avec son propre cycle de preuve.
- Q: Périmètre du master hero vidéo d'accueil — vidéo + titre + bouton seuls, ou fusion avec le bloc de catégories qui le suit ? → **Question close par l'audit `hero-et-categories.md` de l'itération 003, pas par une décision nouvelle.** La fusion a déjà été mesurée et écartée : le cadre `Hero et catégories` est un assemblage de page sans identité propre (gap 48, `fills` vide, aucun stroke/effet/rayon/padding, identique sur les 6 pages qui le portent), et sur Accueil son premier enfant n'est **pas** un Hero (`Hero video` `210:330`, 1728×720, enfants directs `Text`+`Bouton`, contre 640 px et un nesting `wrapper/Titres` pour les 8 vrais Hero). Un master composite forcerait donc soit `Hero video` à se faire passer pour un Hero, soit l'externalisation d'un contrôle négatif délibérément laissé de côté — deux régressions de fidélité. **Le master couvre exactement le cadre `Hero video` existant, rien de plus** ; le cadre d'assemblage reste un cadre d'assemblage.
- Q: Un master de mise en page de section (le gabarit partagé par plusieurs sections) fait-il partie de cette itération ? → A: **Non — hors périmètre.** On corrige l'existant ; aucune nouvelle structure de gabarit n'est construite. La décision est reportée avec celle du gabarit pleine page. L'exigence correspondante est retirée de la spec, pas mise en attente.
- Q: Le Bouton — son axe `Property 1` et sa valeur fautive « Outilne noir » sont **dans le contrat** `ds.button` (vérifié : `bindings.figma` porte `"property": "Property 1"` et `"outilneNoir": "Outilne noir"`). Le renommer côté source rend le contrat faux ; ne pas le renommer laisse un renommage dû à la Spec B, ce que SC-013 interdit. → A: **Renommage côté source, contrat laissé en l'état.** La source doit être propre ; la divergence contrat ↔ canvas qui en résulte est **nommée au rapport de clôture** et réparée en Spec B, où le contrat passera en **majeur** (une valeur de variant renommée = major au sens du semver contrat). Le dépôt n'est pas modifié : FR-033 tient, SC-013 tient. Précédent : la divergence 13-vs-16 glyphes de la spec 004.
- Q: Que devient la page `Assets`, fourre-tout hérité de l'import initial (Bouton, logo, member-picture, Header nav posée hors section, 15 icônes du registre, un master fantôme, 2 planches de référence) ? → A: **Vidée puis supprimée.** Bouton + logo + member-picture + les 15 icônes rejoignent `DS · Atomes` — où vivent déjà les 3 icônes sociales, ce qui **réunit enfin les 18 icônes physiques sur une seule page** ; les planches Typo/Couleurs rejoignent `DS · Tokens` ; Header nav est éclatée selon la découpe ci-dessous. Vérifié avant décision : **aucun script du dépôt ne cible une page Figma par son nom** (le walk prend un id de frame en paramètre) et l'ancre du Bouton est `componentSetKey` + `nodeId`, deux identifiants qui survivent à un changement de page — le déplacement est donc sans effet sur la chaîne code.
- Q: Jusqu'où descend la découpe du Header nav ? → A: **2 niveaux, pas 3.** `Nav-item` devient un master (la brique réellement répétée ×4) ; `Header` devient l'organism qui l'assemble, sur `DS · Organisms`, axe `Property 1` renommé et ses 2 variantes `Solid|Transparent` conservées. **Aucun master `Nav` intermédiaire** : il n'aurait qu'un seul consommateur, donc un niveau d'indirection sans cas de réutilisation.
- Q: Le chevron fantôme `octicon:chevron-down-12` (`6:119`, détaché du canvas, hors du registre gouverné, instancié ×4 par Header nav) est-il re-swappé vers le `chevron-down` du registre, au risque d'un écart de dessin sur les 9 maquettes ? → A: **Non — le glyphe n'est pas touché.** Conséquence directe de la suppression d'`Assets` : le fantôme est **déplacé, pas supprimé** (ses 4 instances doivent continuer à résoudre), posé sur `DS · Atomes` avec une description qui le marque explicitement hors registre. La décision voyage avec le contrat Header nav en Spec B.
- Q: À quoi pointe le « lien node de l'avant » du rapport, sachant qu'un état antérieur n'est plus rendable une fois la mutation faite (aucun outil ne rend l'image d'une version passée, et le retour arrière rétroactif est exclu) ? → A: **Lien node + identifiant de la version Figma sauvegardée juste avant la passe.** Le triptyque porte les pixels, la version porte la structure restaurable. L'archive vectorielle reste réservée aux gestes destructifs.
- **Décisions owner complémentaires, même session** (données hors questionnaire, intégrées telles quelles) : (1) **la carte d'avis « Avis Google » sort du périmètre** — traitée à part, plus tard ; (2) le rapport de sortie porte, **par geste**, un triptyque avant/après, les liens node avant et après, et une explication courte ; (3) les composants qui traînent sur `Assets` sont rangés, doublons compris — « le figma → contrat → code resyncera après » ; (4) **une version Figma est sauvegardée à chaque grosse passe** ; (5) le Header nav est déplacé et splitté par strate, **sans perte design** ; (6) le principe général qui gouverne les trois : **on corrige la source d'abord, le code se resynchronise ensuite**.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Les noms disent la vérité (Priority: P1)

En tant qu'owner du design system, et au nom de la chaîne d'extraction qui suivra, je veux que **chaque calque, axe de variant et valeur de variant porte un nom qui décrit ce qu'il EST** — pas son contenu rédactionnel, pas `Vector`, pas `Property 1` — afin qu'aucun identifiant du code généré ne naisse d'un nom faux.

**Why this priority**: C'est la règle « naming d'abord » du brief, et elle est bloquante par construction : les noms de calques **deviennent** les identifiants du code généré. Extraire avant de nettoyer, c'est graver `vector`, `frame8` et `property1` dans des contrats versionnés, puis payer un renommage cassant (majeur au sens du semver contrat) pour en sortir. Les audits chiffrent la dette : ~69 échos de noms par défaut sur `Assets`, ~29 propagés dans les instances des organisms, 4 sets à axe `Property 1`.

**Independent Test**: Un relevé du fichier ne renvoie plus aucun nom par défaut ni aucun nom tiré du contenu dans le périmètre couvert ; le lot passe 9/9 pages identiques (0 pixel). Testable seul, sans qu'aucune autre histoire ne soit livrée.

**Acceptance Scenarios**:

1. **Given** les ~69 échos de noms par défaut dont la racine est dans les 18 masters d'icônes, **When** le lot de renommage est appliqué, **Then** plus aucun enfant du périmètre ne s'appelle `Vector`, `Vector (Stroke)`, `Group N`, `Frame N`, `Text` ou `text`, **et** les 9 pages sont identiques au pixel.
2. **Given** le titre du Hero nommé « Portes de garage industrielles » et répété sur 8 pages, **When** il est renommé, **Then** le nom décrit son rôle dans le composant et non le texte qu'il porte, et un changement de contenu ne rendra plus le nom faux.
3. **Given** les sets `piqueray_logo` et `member-picture` dont l'axe s'appelle `Property 1`, **When** l'axe est renommé, **Then** il porte un nom qui décrit la dimension qu'il fait varier.
4. **Given** la collision de nom entre le calque interne « Présentation » de Réalisations et le master « Présentation », et la valeur de variant « Presentation » écrite sans accent, **When** les deux sont corrigés, **Then** il n'existe plus de collision et l'accentuation est cohérente avec le reste du fichier.
5. **Given** un renommage quelconque, **When** la mesure de preuve est prise, **Then** le diff attendu est **0 pixel** ; tout écart non nul déclenche un STOP et l'annulation du geste, jamais une validation au jugé.

---

### User Story 2 - Les affordances officieuses deviennent officielles (Priority: P1)

En tant qu'owner, je veux qu'**aucun calque masqué ne subsiste sans propriété qui le pilote**, qu'aucun variant fantôme ne traîne, et qu'aucun état interactif ne soit modélisé comme une valeur d'axe anonyme — afin que ce qui sera extrait décrive le composant réel et non un bricolage.

**Why this priority**: C'est littéralement « la leçon Button » inscrite dans les règles du dépôt : le Button avait expédié depuis un set non nettoyé (visibilité d'icône bricolée via calques cachés ×42) et cela a coûté une journée de reprise. Les audits identifient trois récidives vérifiées en direct le 2026-07-25 : Product-card (`2068:1972`) masque une instance `Bouton` avec des références de propriété vides, Tab (`2061:1588`) porte un variant `État3` auto-généré absent de sa propre description, member-picture (`274:2389`) encode un survol comme valeur d'axe `Default|hover`. Chacune, extraite telle quelle, produirait un contrat qui ment.

**Independent Test**: Un relevé du périmètre renvoie zéro calque masqué non piloté par une propriété, zéro variant non décrit, et un axe d'état de Tab qui fait réellement varier le rendu. Tous les gestes passent 9/9 identiques **sauf un**, isolé dans son propre cycle : le retrait du soulignement du variant `Défaut` de Tab, seul fix design assumé de l'itération, dont le diff attendu est annoncé avant exécution et validé sur crop.

**Acceptance Scenarios**:

1. **Given** l'instance `Bouton` masquée de Product-card sans propriété qui la pilote, **When** l'affordance est rendue officielle, **Then** une propriété booléenne la commande explicitement (ou le calque est retiré), et le rendu des 9 pages est inchangé.
2. **Given** le variant `État3` de Tab, absent de la description du composant, **When** il est supprimé, **Then** l'ancien master a d'abord été cloné sur la page d'archive avec ses vecteurs, et le set ne contient plus que des variants décrits.
3. **Given** les 3 variants de Tab strictement identiques alors que la description annonce un soulignement réservé à l'état sélectionné, **When** le soulignement est retiré du variant `Défaut`, **Then** l'axe `État` fait réellement varier le rendu, le diff se limite aux maquettes portant un Tab, et il est montré sur crop et assumé — jamais présenté comme zéro-pixel.
4. **Given** l'axe `Property 1 = Default|hover` de member-picture, **When** la décision est appliquée, **Then** soit l'axe est nommé comme axe d'état avec des valeurs cohérentes, soit le variant de survol est retiré — dans les deux cas le choix est écrit, pas subi.
5. **Given** un geste destructif quelconque, **When** il est exécuté, **Then** l'archive préalable existe et conserve les vecteurs (pas seulement une image), et cette archive est supprimée à la clôture de l'itération.

---

### User Story 3 - Chaque master se documente lui-même (Priority: P2)

En tant que futur lecteur du fichier — humain ou chaîne d'extraction — je veux que **tout master sans description en reçoive une** (15 aujourd'hui, plus ceux que l'itération crée), qui dise ce que fait le composant et nomme ses limites connues, afin que l'intention ne vive plus uniquement dans la tête de celui qui l'a construit.

**Why this priority**: Zéro pixel, mécanique, sans dépendance — mais pas cosmétique : c'est le seul endroit où une limite assumée (ex. « aucune référence dans les 9 maquettes ») survit au départ de son auteur. Les audits comptent 8 molécules sur 12 sans description, 3 organisms sur 14, et 3 atomes hérités de l'import initial. Le fichier entier est à 37/52 composants décrits.

**Independent Test**: Plus aucun master n'est sans description à la clôture (départ : 37 décrits sur 52), masters créés par l'itération compris ; le lot passe 9/9 identiques.

**Acceptance Scenarios**:

1. **Given** les 8 molécules sans description (Carte, Product-card, Member-card, Carousel-controls, Footer-column, Copyright, Avantage, Section-header), **When** les descriptions sont écrites, **Then** chacune décrit le rôle du composant et ses propriétés pilotables.
2. **Given** les 3 organisms sans description (Équipe, Catégories principales, Produits e-commerce), **When** les descriptions sont écrites, **Then** chacune nomme aussi les limites connues de la source (placeholders, éléments non pilotables).
3. **Given** les 3 masters atomes hérités sans description, **When** elles sont écrites, **Then** elles suivent la même convention que les 7 masters déjà décrits de `DS · Atomes`.
4. **Given** l'ensemble du lot descriptions, **When** la preuve est prise, **Then** 9/9 pages identiques — une description ne déplace jamais un pixel.

---

### User Story 4 - Les valeurs répétées deviennent des variables et des styles (Priority: P2)

En tant qu'owner, je veux qu'**une valeur typographique ou chromatique qui se répète au moins 3 fois soit portée par un style ou une variable**, et qu'une valeur nouvelle mais répétée donne lieu à l'**ajout** d'une variable — jamais au remplacement de la maquette par une couleur voisine déjà existante.

**Why this priority**: Aujourd'hui **aucun des 8 styles de texte n'est appliqué nulle part** (37 textes en littéraux côté molécules, ~100 échos côté organisms) : si un style change, rien ne suit. Côté couleurs, plusieurs valeurs identiques à une variable existante sont posées en dur. La règle 3× borne le chantier (on ne systématise pas ce qui n'apparaît qu'une fois) et la règle « jamais de fix design » garantit que gouverner ne veut pas dire uniformiser.

**Independent Test**: Toute valeur du périmètre répétée ≥ 3 fois est reliée à un style ou une variable ; les valeurs vues < 3 fois sont laissées littérales **et** listées dans le rapport de clôture ; le lot passe 9/9 identiques.

**Acceptance Scenarios**:

1. **Given** les 8 titres Hero en taille 54 sans style, **When** le style correspondant est créé et appliqué, **Then** les 8 titres le portent et le rendu est inchangé au pixel.
2. **Given** les textes `#FFFFFF` de Footer-column et Copyright alors que la variable blanc existe, **When** ils sont reliés, **Then** la couleur est bindée et le rendu est inchangé.
3. **Given** la bordure `#26282C` des variants Petit d'Accordion-row, identique à la variable noir-bleuté mais non reliée, **When** elle est bindée, **Then** la correction se propage à FAQ et Texte SEO sans geste supplémentaire.
4. **Given** une valeur chromatique hors palette et répétée ≥ 3 fois (`#000` d'Accordion Grand, fond Devis, `#E0E0E0` de Réalisation), **When** la règle 3× est appliquée, **Then** une **nouvelle** variable est ajoutée pour cette valeur — le geste interdit étant de la remplacer par une variable existante proche.
5. **Given** une valeur vue 1 ou 2 fois (taille 44, vue 1×), **When** la règle est appliquée, **Then** elle est **laissée telle quelle** et son statut est écrit, pas silencieusement normalisé.

---

### User Story 5 - La géométrie dit la vérité (Priority: P3)

En tant qu'owner, je veux que **les 5 masters restés sur l'hypothèse de brief 88 px passent à la valeur mesurée 89 px**, et que les deux variants de Section-header partagent la même largeur — chaque geste appliqué avec son mécanisme propre et son diff attendu annoncé avant exécution.

**Why this priority**: C'est le premier bloc à diff **non nul** : il ne peut pas être groupé en lot avec les tâches zéro-pixel, et une première tentative a déjà été stoppée avant écriture à cause d'un piège de structure. La valeur 89 est mesurée sur le contenu réel (relevés `categories-principales` et `hero`) ; 88 est une hypothèse de brief jamais corrigée. Chaque master a un mécanisme différent — rejouer un geste en bloc sur les 5 est le mode d'échec identifié.

**Independent Test**: Les 5 masters visés portent la coquille mesurée, les 2 variants de Section-header ont la même largeur, et le diff observé sur les 9 pages correspond à la bande attendue annoncée avant exécution — ni plus, ni moins.

**Acceptance Scenarios**:

1. **Given** un master dont le geste est annoncé avec son diff attendu, **When** le geste est exécuté et mesuré, **Then** le diff observé est conforme à l'attendu ; tout dépassement déclenche un STOP.
2. **Given** un master dont un enfant est un GROUP, **When** le parent est redimensionné, **Then** le fait que l'enfant ne suive pas le redimensionnement est traité **avant** l'écriture (conversion ou repositionnement), pas découvert après.
3. **Given** les deux variants de Section-header à 1550 et 1552, **When** ils sont alignés sur la grille du site, **Then** ils partagent la même largeur et le diff se limite à la zone attendue.
4. **Given** les masters explicitement exclus du geste (dont ceux déjà corrects et ceux à mécanisme différent), **When** le lot est appliqué, **Then** aucun d'eux n'est touché.

---

### User Story 6 - Plus aucun master construit à l'ancienne (Priority: P3)

En tant qu'owner, je veux que le **Footer soit reconstruit** comme les 25 autres masters — mise en page automatique à la racine, atomes sociaux instanciés au lieu d'être recopiés en vecteurs bruts, calques nommés — afin qu'il ne reste plus une seule copie détachée dans le système.

**Why this priority**: Le Footer est le **seul** master à racine sans mise en page automatique sur les 26 des deux pages DS, et le seul à recopier en vecteurs bruts deux atomes qui existent et que d'autres organisms instancient déjà. C'est exactement le périmètre que l'itération précédente avait pour but d'éliminer. Il cumule en plus un geste de géométrie, ce qui en fait son propre cycle de preuve.

**Independent Test**: Le Footer a une racine en mise en page automatique, instancie les deux atomes sociaux, ne porte plus de nom par défaut, et l'état des 9 pages est vérifié avant reconstruction puis mesuré après.

**Acceptance Scenarios**:

1. **Given** l'état réel du Footer sur les 9 maquettes relevé **avant** toute écriture, **When** la reconstruction est lancée, **Then** elle part de cet état constaté et non d'une supposition.
2. **Given** les vecteurs sociaux recopiés, **When** ils sont remplacés par les instances des atomes existants, **Then** aucune copie détachée d'un atome existant ne subsiste dans le master.
3. **Given** la reconstruction, geste destructif par nature, **When** elle démarre, **Then** l'ancien master a été cloné au préalable sur la page d'archive avec ses vecteurs.
4. **Given** le Footer reconstruit, **When** la preuve est prise, **Then** le diff observé est conforme à l'attendu annoncé, et toute différence résiduelle est nommée — pas absorbée dans « bruit de rendu ».

---

### User Story 7 - Un seul endroit gouverne l'en-tête de section (Priority: P3)

En tant qu'owner, je veux que les **6 organisms dont le titre est fait à la main instancient le master d'en-tête de section**, afin qu'un changement de l'en-tête se fasse à 1 endroit au lieu de 6.

**Why this priority**: C'est la valeur de composition du système, appliquée au dernier endroit où elle manque. Les organisms sont déjà massivement composés d'instances ; ces 6 titres faits main sont l'exception résiduelle. Sans dépendance sur les autres histoires, mais à faire **après** l'alignement de largeur de Section-header pour ne pas propager une géométrie qui va changer.

**Independent Test**: Les 6 organisms visés instancient l'en-tête gouverné ; un changement appliqué au master se répercute sur les 6 ; le diff sur les 9 pages est conforme à l'attendu.

**Acceptance Scenarios**:

1. **Given** un organism au titre fait main, **When** l'en-tête gouverné est adopté, **Then** le rendu de la page qui le contient est inchangé, ou la différence est mesurée et nommée.
2. **Given** les 6 organisms convertis, **When** une modification est appliquée au master d'en-tête, **Then** elle se propage aux 6 sans geste supplémentaire.

---

### User Story 8 - Le dernier trou de la source est comblé (Priority: P4)

En tant qu'owner, je veux que le **hero vidéo de la page d'accueil**, aujourd'hui sans master, en devienne un — afin qu'il ne reste plus de zone de maquette hors gouvernance dans le périmètre de cette itération.

**Why this priority**: C'est le dernier élément de maquette encore hors gouvernance ici, et son périmètre est déjà arrêté : le cadre existant, sans fusion avec le bloc de catégories. Valeur réelle mais isolée — donc en dernier, sans bloquer les 7 autres histoires. *(La carte d'avis « Avis Google » faisait partie de cette histoire jusqu'à la décision owner du 2026-07-25 qui la sort du périmètre : sa source est un screenshot aplati de widget tiers, sans un seul vecteur, et elle sera traitée à part.)*

**Independent Test**: Le master hero vidéo existe, l'emplacement correspondant de la page d'accueil l'instancie, et le diff observé est conforme à l'attendu annoncé avant exécution.

**Acceptance Scenarios**:

1. **Given** le hero vidéo d'accueil aujourd'hui sans master, **When** le master est créé, **Then** il couvre exactement le cadre existant — ni le bloc de catégories qui le suit, ni un variant du master Hero dont il ne partage ni la structure ni la hauteur.
2. **Given** le cadre qui assemble hero et catégories sur 6 maquettes, **When** l'itération se clôt, **Then** il est resté un cadre d'assemblage, sans master — décision déjà mesurée, non rejouée.
3. **Given** le master hero vidéo, net-new, **When** il est créé, **Then** il naît avec sa description — un master créé dans cette itération n'a aucune raison de naître non documenté.

---

### User Story 9 - Chaque master vit à sa strate (Priority: P3)

En tant qu'owner, je veux que **la page fourre-tout héritée de l'import initial disparaisse** et que chaque master qu'elle contenait rejoigne la strate qui lui correspond — l'en-tête de navigation compris, éclaté en la brique qu'il répète et l'organism qui l'assemble — afin qu'il n'existe plus un seul endroit du système où l'on range « en attendant ».

**Why this priority**: `Assets` est le dernier vestige de l'import initial : elle mélange un atome contractualisé, un logo, une image de membre, un en-tête de navigation posé hors section, 15 icônes du registre, un master fantôme et 2 planches de référence. Tant qu'elle existe, la strate d'un master ne se lit pas — elle se devine. Et les 18 icônes physiques sont éclatées sur 2 pages, ce qui rend leur gouvernance invérifiable d'un coup d'œil. Le geste est techniquement gratuit : un déplacement de master ne change ni sa clé ni son node id, ne touche aucun pixel et ne casse aucune instance — déjà prouvé à l'itération précédente sur 14 masters déplacés.

**Independent Test**: La page fourre-tout n'existe plus, les 18 icônes sont réunies sur une seule page, l'en-tête de navigation existe en deux masters (la brique répétée et l'organism), et le lot passe 9/9 pages identiques — aucune instance cassée.

**Acceptance Scenarios**:

1. **Given** les masters de la page fourre-tout, **When** ils sont déplacés vers leur strate, **Then** aucune instance n'est cassée — vérifié, pas supposé — et les 9 pages sont identiques au pixel.
2. **Given** les 18 icônes physiques réparties sur 2 pages, **When** le rangement est fait, **Then** elles vivent toutes sur la même page, à côté des atomes.
3. **Given** l'en-tête de navigation, un seul master qui répète 4 fois la même brique, **When** il est éclaté, **Then** la brique devient un master et l'en-tête devient l'organism qui l'instancie, ses 2 variantes de fond conservées et son axe renommé — sans perte de design.
4. **Given** le master fantôme hors registre, détaché du canvas mais instancié 4 fois, **When** la page qui l'hébergeait disparaît, **Then** il est **déplacé et non supprimé**, sa description le marque explicitement hors registre, et ses 4 instances résolvent toujours.
5. **Given** la page fourre-tout vidée, **When** elle est supprimée, **Then** les 9 pages restent identiques — la suppression est vérifiée, pas supposée.

---

### Edge Cases

- **Un lot annoncé zéro-pixel rend un diff non nul.** → STOP immédiat, annulation du lot, cause identifiée avant toute reprise. Le verdict est mécanique : on ne requalifie pas après coup un écart imprévu en « bruit de rendu ».
- **Un écart attendu se révèle plus petit ou différent que l'attendu.** → Traité comme un échec de prédiction : le geste n'a pas fait ce qu'on croyait, on ne valide pas parce que « c'est joli ».
- **Un enfant de type GROUP ne suit pas le redimensionnement de son parent.** Piège vérifié, déjà responsable d'un arrêt avant écriture → détecté par relevé de structure **avant** le geste, variante par variante.
- **Un redimensionnement appliqué à l'enfant d'une instance n'a aucun effet, silencieusement.** → Le geste doit porter sur le niveau qui répond, sinon on croit avoir écrit sans avoir écrit.
- **Rejouer les propriétés d'un Bouton réinitialise l'override de couleur de son glyphe.** → L'ordre des gestes doit reconnecter après, sinon on introduit une régression invisible en croyant ne rien changer.
- **Une capture « avant » manque sur une page pourtant affectée.** → Interdit : une fois la mutation faite, l'état antérieur est irrécupérable (aucun outil ne rend une image d'une version passée). La capture porte sur **toutes** les pages affectées, jamais sur un pilote.
- **Une capture « avant » est vide ou mal dimensionnée.** → Détecté avant de continuer, pas au moment de comparer.
- **Un renommage casse un override ou une instance.** → Vérification que les instances survivent au renommage, comme lors du déplacement des 14 masters (0 instance cassée).
- **Une valeur nouvelle apparaît exactement 2 fois.** → La règle 3× ne s'applique pas : on laisse, et on l'écrit dans le rapport. Le silence serait la dégradation.
- **La suppression de la page d'archive en fin d'itération.** → Doit être sans effet sur les 9 pages ; vérifié, pas supposé.
- **Un master du périmètre est aussi utilisé hors des 9 maquettes.** → Le relevé d'usage se fait par position, jamais par nom.
- **Un déplacement de master casse une instance.** → Ne doit pas arriver (clé et identifiant survivent au changement de page) mais se vérifie avant de continuer, master par master — c'est la vérification qui a été faite lors du déplacement des 14 masters de l'itération précédente.
- **Un master hors registre disparaîtrait avec la page qui l'héberge.** → Interdit tant qu'il a des instances : il est déplacé, jamais supprimé par effet de bord de la suppression de sa page.
- **Le renommage de l'axe et des valeurs du seul master sous contrat rend le contrat faux.** → C'est le résultat attendu, pas un accident : la divergence est nommée au rapport de clôture et réparée à l'itération suivante avec le contrat. Ce qui serait un échec, c'est qu'elle ne soit pas écrite.
- **Une grosse passe démarre sans point de version enregistré.** → Interdit : la version est sauvegardée avant, sinon le rapport ne peut pas produire le lien de l'état antérieur qu'il doit porter.
- **Le nombre de cycles dépasse le budget annoncé.** → Se signale au moment où c'est constaté, pas à la clôture ; le budget est une mesure de la discipline de groupement, pas un plafond à respecter en fusionnant des gestes à effet visuel.

## Requirements *(mandatory)*

### Functional Requirements

**Noms (US1)**

- **FR-001**: Aucun calque du périmètre ne conserve un nom généré par défaut (`Vector`, `Vector (Stroke)`, `Group N`, `Frame N`, `Text` / `text`).
- **FR-002**: Aucun nom de calque n'est dérivé de son contenu rédactionnel ; un nom décrit un rôle.
- **FR-003**: Aucun axe de variant du périmètre ne conserve un nom généré par défaut ; chaque axe nomme la dimension qu'il fait varier.
- **FR-004**: Les valeurs de variant du périmètre sont orthographiées et accentuées de façon cohérente avec le reste du fichier.
- **FR-005**: Aucune collision de nom ne subsiste entre un calque interne et un master du système.
- **FR-006**: Le renommage précède l'extraction ; aucun élément du périmètre ne part vers un contrat avant que son nom soit arrêté.
- **FR-039**: Le seul master déjà sous contrat est renommé **comme les autres** — axe générique et valeur mal orthographiée corrigés dans la source. Le contrat correspondant n'est pas modifié par cette itération (FR-033) : la divergence contrat ↔ source qui en résulte est **nommée au rapport de clôture** et réparée à l'itération suivante, où le contrat changera de version majeure puisqu'une valeur de variant y est renommée.

**Affordances (US2)**

- **FR-007**: Aucun calque masqué ne subsiste sans une propriété qui le pilote explicitement ; à défaut, le calque est retiré.
- **FR-008**: Aucun variant non décrit par la description de son composant ne subsiste.
- **FR-009**: Aucun état interactif n'est modélisé comme valeur d'un axe anonyme ; il est soit porté par un axe d'état nommé, soit retiré.

**Documentation (US3)**

- **FR-010**: Tout master sans description en reçoit une, décrivant le rôle du composant, ses propriétés pilotables et ses limites connues — les 15 masters aujourd'hui vides comme ceux que l'itération crée, qui naissent décrits.

**Variables et styles (US4)**

- **FR-011**: Toute valeur typographique ou chromatique répétée au moins 3 fois dans le périmètre est portée par un style ou une variable.
- **FR-012**: Toute valeur répétée moins de 3 fois est laissée littérale **et** listée dans le rapport de clôture.
- **FR-013**: Une valeur posée en dur mais strictement égale à une variable existante est reliée à cette variable.
- **FR-014**: Une valeur nouvelle atteignant le seuil de 3 occurrences donne lieu à l'**ajout** d'une variable ; le remplacement par une variable existante voisine est interdit.
- **FR-015**: Le système ne normalise aucune valeur de la maquette ; aucun changement de design n'est appliqué sans être explicitement assumé, isolé dans son propre cycle de preuve et validé sur crop.
- **FR-015a**: Le variant par défaut du composant Tab perd son soulignement, de sorte que son axe d'état fasse réellement varier le rendu. C'est l'**unique** fix design de l'itération, assumé au titre de FR-015 : la source se contredit aujourd'hui (3 variants identiques contre une description qui réserve le soulignement à l'état sélectionné), et la fidélité stricte reviendrait à conserver un axe sans effet.

**Géométrie (US5, US7)**

- **FR-016**: Les 5 masters portant encore la coquille de 88 px issue d'une hypothèse de brief passent à la valeur mesurée sur le contenu réel, 89 px ; les largeurs de contenu associées passent de 1552 à 1550 px.
- **FR-017**: Chaque geste géométrique est appliqué avec le mécanisme propre à son master ; aucun geste n'est rejoué à l'identique sur un lot de masters.
- **FR-018**: Les masters explicitement exclus du geste de coquille ne sont pas touchés.
- **FR-019**: Les deux variants du master d'en-tête de section partagent la même largeur, 1550 px — la grille du site — au lieu de 1550 et 1552 aujourd'hui.
- **FR-020**: Les 6 organisms dont le titre est fait à la main instancient le master d'en-tête de section.

**Composition (US6, US8)**

- **FR-021**: Aucun master ne subsiste avec une racine sans mise en page automatique.
- **FR-022**: Aucune copie détachée d'un atome existant ne subsiste dans un master ; les atomes disponibles sont instanciés.
- **FR-023**: **(retirée — décision owner du 2026-07-25.)** La carte d'avis sort du périmètre et sera traitée à part : sa source est un aplat sans vecteur, elle n'a aucune dépendance avec le reste de l'itération, et elle était le seul livrable dont le diff ne pouvait pas être annoncé. Voir « Hors périmètre ». Le numéro est conservé pour ne pas casser les renvois existants.
- **FR-024**: Le hero vidéo de la page d'accueil devient un master distinct, couvrant **exactement** le cadre existant (fond vidéo, titre, bouton d'appel) et rien de plus. Il ne fusionne pas avec le bloc de catégories qui le suit, et il n'est pas modélisé comme un variant du master Hero : sa structure et sa hauteur diffèrent de celles des 8 hero de la source.
- **FR-025**: Le cadre qui assemble le hero et le bloc de catégories **reste un cadre d'assemblage** et ne devient pas un master : il ne porte aucune identité visuelle propre, et le composant qu'il contient sur la page d'accueil n'est pas un hero.

**Strates et rangement (US9)**

- **FR-035**: La page fourre-tout héritée de l'import initial est vidée puis supprimée ; chaque master qu'elle contenait rejoint la strate qui lui correspond, et les planches de référence (typographie, couleurs) rejoignent la page des tokens.
- **FR-036**: Les 18 icônes physiques vivent sur une seule et même page, à côté des atomes — elles ne sont plus réparties sur deux pages.
- **FR-037**: L'en-tête de navigation est éclaté en **deux** masters : la brique qu'il répète devient un master, et l'en-tête devient l'organism qui l'instancie. Ses deux variantes de fond sont conservées et son axe générique est renommé. **Aucun master intermédiaire n'est créé** : un bloc à consommateur unique ne devient pas un master.
- **FR-038**: Un master hors registre encore instancié est **déplacé, jamais supprimé** ; sa description le marque explicitement comme hors registre et la décision à son sujet est reportée à l'itération d'extraction.
- **FR-041**: Aucun déplacement de master ne casse d'instance ; le fait est **vérifié** master par master, jamais supposé.

**Preuve et cadence (transverse)**

- **FR-026**: Avant toute mutation, l'état antérieur est capturé pour **toutes** les pages affectées — jamais un sous-ensemble pilote — et chaque capture est vérifiée non vide et correctement dimensionnée avant de continuer.
- **FR-027**: Chaque cycle produit un score par page et des crops de comparaison, conservés comme artefacts de l'itération. Le **rapport de sortie porte, pour chaque geste** : le triptyque de comparaison avant / après / différence, le **lien vers l'élément dans la source de design** accompagné de l'**identifiant de la version enregistrée avant le geste** (c'est cette version qui rend l'état antérieur atteignable — une image d'un état passé n'est pas reproductible après coup), et une **explication courte** de ce qui a été fait et pourquoi.
- **FR-040**: Une version de la source de design est **enregistrée avant chaque grosse passe**, et son identifiant est reporté dans le rapport. Une passe qui démarre sans point de version enregistré est arrêtée : sans lui, le rapport ne peut pas produire le lien d'état antérieur que FR-027 exige.
- **FR-028**: Chaque geste annonce son diff attendu **avant** exécution ; le verdict est la conformité à cet attendu, pas une appréciation après coup.
- **FR-029**: Un lot annoncé sans effet visuel doit rendre les 9 pages identiques ; à défaut, le lot est arrêté et annulé.
- **FR-030**: Les gestes sans effet visuel sont groupés en lots partageant un seul cycle de preuve ; les gestes à effet visuel ont chacun leur cycle.
- **FR-031**: Avant tout geste destructif, l'élément supprimé ou remplacé est cloné sur une page d'archive dédiée, en conservant ses vecteurs ; cette page est supprimée à la clôture, sans effet sur les 9 pages.
- **FR-032**: Toute dégradation, limite ou divergence est nommée dans le rapport de clôture ; l'omission silencieuse est un échec de l'itération, pas un détail.
- **FR-033**: L'itération n'écrit que dans la source de design ; aucun composant de code, contrat ou jeu de tokens du dépôt n'est modifié. Le principe qui gouverne l'ordre est explicite : **on corrige la source d'abord, la chaîne code se resynchronise ensuite**, à l'itération d'extraction.
- **FR-034**: Aucune nouvelle structure de **gabarit de section ou de page** n'est construite ; l'itération corrige l'existant. Les masters créés par FR-024 et FR-037 ne sont pas des gabarits : ce sont des composants qui existent déjà dans la maquette sans être gouvernés, ou une brique déjà répétée à l'intérieur d'un master existant.

### Key Entities

- **Master** — un composant ou set de composants de la source de design. Porte un nom, une description, des axes et valeurs de variant, des propriétés pilotables, et une structure de calques. C'est l'unité que la Spec B extraira.
- **Page maquette** — l'une des 9 pages de rendu qui servent de juge : elles consomment les masters et révèlent tout effet visuel non voulu.
- **Lot** — un ensemble de gestes partageant le même diff attendu, mesuré par un seul cycle de preuve. Les lots sans effet visuel sont groupés ; les gestes à effet visuel forment chacun leur lot.
- **Cycle de preuve** — capture avant, geste, capture après, score par page, crops de comparaison, verdict. L'unité de cadence de l'itération.
- **Diff attendu** — la prédiction écrite **avant** le geste (aucun pixel / bande sur telle zone / différence visible sur telles pages). Le verdict compare l'observé à cette prédiction.
- **Page d'archive** — page temporaire recevant le clone vectoriel de tout élément avant un geste destructif ; supprimée à la clôture.
- **Style de texte / variable de couleur** — les porteurs des valeurs répétées. Une valeur atteint le seuil de gouvernance à 3 occurrences.
- **Règle 3×** — le seuil qui borne le chantier : ≥ 3 occurrences → style ou variable ; < 3 → laissé littéral et déclaré.
- **Strate** — le niveau d'un master dans le système (brique, assemblage de briques, bloc de page). Un master rangé à sa strate se lit sans être deviné ; c'est ce que la page fourre-tout empêche aujourd'hui.
- **Version enregistrée** — un point nommé dans l'historique de la source, posé **avant** chaque grosse passe. C'est le seul ancrage qui rend l'état antérieur atteignable une fois la mutation faite, et c'est lui que le rapport cite.
- **Divergence nommée** — un écart connu entre la source et un contrat du dépôt, écrit au rapport de clôture et légué à l'itération suivante. Une divergence nommée est un livrable ; la même divergence tue si elle est silencieuse.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % des lots annoncés sans effet visuel rendent les 9 pages identiques (aucun pixel de différence). Un seul manquement bloque la clôture.
- **SC-002**: 0 nom généré par défaut subsiste dans le périmètre, contre environ 69 échos relevés au départ.
- **SC-003**: **0 master sans description à la clôture** (départ : 15 sans description sur 52). Les masters créés par l'itération — le hero vidéo et les deux issus de l'éclatement de l'en-tête — **naissent décrits**, et le master hors registre conservé porte une description qui le dit. *(Le compte de départ 37/52 et les 14 descriptions à écrire restent valides ; le dénominateur, lui, bouge avec les masters créés, d'où une formulation en « zéro restant » plutôt qu'en ratio figé. Le seul master dont la description pouvait partir avec son contrat à l'itération suivante est désormais couvert ici aussi : rien ne justifie de le laisser vide alors qu'on renomme son axe dans la même passe.)*
- **SC-004**: 0 calque masqué sans propriété qui le pilote et 0 variant non décrit subsistent, contre 3 défauts vérifiés au départ.
- **SC-005**: 0 master conserve la valeur de coquille issue d'une hypothèse, et les 2 variants d'en-tête de section partagent la même largeur.
- **SC-006**: 0 master à racine sans mise en page automatique (1 au départ) et 0 copie détachée d'un atome existant (2 au départ).
- **SC-007**: L'en-tête de section est gouverné depuis 1 seul endroit au lieu de 7.
- **SC-008**: 100 % des gestes à effet visuel ont un diff observé conforme au diff annoncé avant exécution.
- **SC-009**: La discipline de groupement tient : **100 % des gestes sans effet visuel sont mesurés en lots**, et seuls les gestes à effet visuel consomment un cycle chacun. Le budget est de **12 cycles ou moins** — relevé de 8 à 12 le 2026-07-25 pour absorber le périmètre ajouté par l'owner (rangement de la page fourre-tout, éclatement de l'en-tête de navigation), et à comparer aux ~30 cycles de l'itération précédente pour un périmètre comparable. Un dépassement se signale quand il est constaté, et **ne se rattrape jamais en fusionnant deux gestes à effet visuel dans un même cycle**.
- **SC-010**: 0 écart, limite ou dégradation non signalé au rapport de clôture.
- **SC-011**: 100 % des valeurs répétées au moins 3 fois dans le périmètre sont portées par un style ou une variable ; 100 % des valeurs sous le seuil sont listées comme laissées littérales.
- **SC-012**: La page d'archive est supprimée à la clôture et les 9 pages restent identiques après suppression.
- **SC-013**: La chaîne d'extraction de l'itération suivante peut démarrer sans qu'aucun renommage de la source ne soit encore nécessaire — **y compris pour le master déjà sous contrat**, renommé ici même (FR-039).
- **SC-014**: La page fourre-tout n'existe plus, les 18 icônes physiques sont réunies sur une seule page, et l'en-tête de navigation existe en 2 masters au lieu d'1 — **avec 0 instance cassée** sur l'ensemble des déplacements.
- **SC-015**: 100 % des gestes du rapport de clôture portent leur triptyque, leur lien d'élément, l'identifiant de la version enregistrée avant le geste, et leur explication courte. Un geste sans son quadruplet est un geste non prouvé.
- **SC-016**: 100 % des grosses passes ont une version enregistrée **avant** leur premier geste.
- **SC-017**: Les divergences contrat ↔ source ouvertes volontairement par l'itération (le renommage du master sous contrat, le master hors registre conservé) sont **toutes** écrites au rapport de clôture avec la réparation attendue à l'itération suivante. Une divergence ouverte et non écrite bloque la clôture.

## Assumptions

- **Les 3 masters atomes à documenter** sont ceux d'`Assets` hérités de l'import initial et encore sans description. **Amendé le 2026-07-25** : l'atome Bouton, initialement excepté parce que sa documentation devait partir avec son contrat, est désormais documenté ici aussi — puisque son axe et ses valeurs sont renommés dans cette même itération (FR-039), le laisser sans description n'a plus de justification. Le compte des descriptions à écrire passe donc de 14 à 15, plus celles des masters net-new.
- **Un déplacement de master entre pages est sans effet** : il ne change ni la clé du composant ni son identifiant de nœud, ne touche aucun pixel et ne casse aucune instance. Vérifié à l'itération précédente sur 14 masters déplacés, et vérifié côté dépôt avant décision : aucun script ne cible une page de la source par son nom, et l'ancre du seul contrat concerné est une clé de set plus un identifiant de nœud.
- **Le master hors registre conservé** garde ses 4 instances telles quelles ; l'itération ne présume pas de ce que l'itération d'extraction en fera (l'adopter au registre, ou le remplacer). Elle se contente de ne pas le perdre et de l'écrire.
- **Product-card** : par défaut l'affordance masquée est rendue **officielle** (propriété booléenne) plutôt que retirée — la leçon Button dit « rendre officiel », pas « supprimer ». Le retrait reste possible si l'owner constate que le bouton n'a aucun usage.
- **member-picture** : par défaut le survol devient un **axe d'état nommé** plutôt qu'un variant retiré — zéro pixel, et l'intention de design est préservée plutôt que perdue.
- **Valeurs chromatiques hors palette** (`#000` d'Accordion Grand, fond du bloc Devis, `#E0E0E0` de Réalisation) : la règle 3× tranche mécaniquement — on compte les occurrences **d'abord**, on décide ensuite. Aucune de ces valeurs n'est remplacée par une variable existante voisine, quel que soit le compte.
- **Variables et styles nouveaux sont créés côté source de design uniquement.** Leur reprise dans le jeu de tokens du dépôt relève de l'itération suivante — précédent établi lors de l'itération 003 avec la couleur rouge, minée côté Figma seul.
- **L'instrument de preuve est celui de l'itération 003**, réutilisé tel quel : capture des 9 pages, score par page, crops de comparaison. Aucun nouvel instrument n'est à construire.
- **Le fichier de design est celui de l'itération 003** et il est la seule source touchée. L'itération est à 100 % dans la source de design : aucun composant de code, contrat ou token du dépôt n'est modifié.
- **Les points de restauration natifs de la source suffisent** pour les lots sans effet visuel ; l'archive vectorielle n'est requise que pour les gestes destructifs.
- **Le retour arrière rétroactif est exclu** comme moyen de combler une preuve manquante après coup : la capture avant est obligatoire au moment du geste, pas reconstituable ensuite.
- **Le relevé d'usage se fait par position, jamais par nom** — un nom peut mentir, c'est précisément le défaut que cette itération corrige.

## Hors périmètre

- ~~**Refacto du composant de navigation d'en-tête**~~ — **rentré dans le périmètre le 2026-07-25** (décision owner) : l'en-tête est déplacé et éclaté en 2 masters, sans perte de design (US9, FR-037). Sa correction de coquille reste elle aussi dans le périmètre. **Une seule chose en reste dehors** : le remplacement de son glyphe hors registre, laissé intact (FR-038).
- **Carte d'avis « Avis Google »** — **sortie du périmètre le 2026-07-25** (décision owner) : traitée à part, plus tard. Sa source est un aplat de widget tiers sans un seul vecteur ; c'était le seul livrable de l'itération dont le diff ne pouvait pas être annoncé à l'avance, et il n'a aucune dépendance avec le reste.
- **Tout changement de design** : contrastes de couleur (les paires sous le seuil d'accessibilité relèvent d'une décision de design sur les tokens), taille de la case à cocher, voile de lisibilité sur le hero. **Une seule exception, tranchée et assumée** : le retrait du soulignement du variant par défaut de Tab (FR-015a), isolé dans son propre cycle et validé sur crop.
- **Extraction vers le code** : contrats, composants générés, tokens du dépôt. C'est l'objet de l'itération suivante, dont celle-ci est le prérequis.
- ~~**Réorganisation des pages du système de design**~~ — **rentrée dans le périmètre le 2026-07-25** (décision owner) pour sa partie amont : la page fourre-tout héritée de l'import initial est vidée et supprimée, chaque master rejoint sa strate, les doublons et les mal-rangés sont traités (US9). **Reste dehors** : la re-répartition des masters déjà rangés sur les pages du système, qui garde son passage de nettoyage dédié.
- **Master de mise en page de section** — décision owner du 2026-07-25 : on corrige l'existant, on ne construit aucune nouvelle structure de gabarit. Les 4 regroupements mesurés (couvrant 7, 6, 6 et 3 maquettes sur 9) restent des mesures, pas un livrable.
- **Gabarit de page pleine** — un seul regroupement couvre 100 % de ses pages sur 3 des 9 maquettes ; reporté en attente d'une décision extérieure, avec le point précédent.
- **Master du cadre « hero + catégories »** — déjà mesuré et écarté à l'itération 003 : cadre d'assemblage sans identité propre, et un master composite falsifierait la page d'accueil. Décision non rejouée ici.

## Dépendances

- Les **3 audits de bonnes pratiques** (atomes, molécules, organisms) datés du 2026-07-25 constituent la base factuelle chiffrée de cette itération : comptes de masters, verdicts par composant, identifiants de nœuds, propagations molécules → organisms.
- L'**audit du composite hero + catégories** de l'itération 003 tranche déjà le périmètre du master hero vidéo (FR-024, FR-025) : sa conclusion est reprise, pas re-mesurée.
- L'**instrument de preuve par page** livré à l'itération 003 (capture, score, crops) doit rester opérationnel.
- L'**accès en écriture à la source de design**, y compris à la page de maquettes qui n'est atteignable que par le pont applicatif.
- La capacité d'**enregistrer une version nommée de la source** depuis l'outillage (FR-040) : c'est elle qui fournit le lien d'état antérieur que le rapport doit porter (FR-027).
- Les **lots de correction proposés en fin des 3 audits** cessent d'être indicatifs : la décision owner du 2026-07-25 en fait entrer une partie dans le périmètre (rangement de la page fourre-tout, éclatement de l'en-tête de navigation). Ils restent la liste de départ, pas la liste finale.
