# Feature Specification: Bloc « Avis Google » — reconstruction native gouvernée (dernier aplat tiers du fichier)

**Feature Branch**: `006-google-reviews-block`  
**Created**: 2026-07-25  
**Status**: Draft  
**Input**: User description (brief owner livré en session du 2026-07-25) : « Le bloc **Avis Google** de la page d'accueil est aujourd'hui un **screenshot aplati d'un widget tiers (Trustindex)** — la dernière zone de maquette du fichier Piqueray hors gouvernance du système de composants. L'objectif est de le reconstruire en vrai(s) composant(s) Figma natifs, avec leur contrat et leur code générés comme le reste du système, pour fermer ce dernier gap. » Le brief porte son déclencheur (report explicite de la spec 003 / T053, levé ici : **l'owner accepte le risque net-new**), 3 besoins priorisés, 6 contraintes métier, un périmètre inclus/exclu et 4 critères de succès. Le volet « comment » (découpage en COMPONENT_SET, propriétés nommées, icône net-new, méthode de mesure, séquence de gestes, instrument de diff) a été **explicitement parqué par l'owner pour `/speckit.plan`** ; trois questions ont été laissées ouvertes pour `/speckit.clarify`.

## Clarifications

### Session 2026-07-25

- Q: La preuve de non-régression porte-t-elle sur les seules maquettes qui portent le bloc ? → A: **Deux populations distinctes.** Les maquettes **porteuses** sont les sujets de preuve (écart non nul attendu, documenté un par un) ; une maquette **témoin** qui ne porte pas le bloc mais instancie les mêmes masters partagés (bouton, icônes) est mesurée à **0 pixel** — c'est le seul endroit où une retouche accidentelle d'un master partagé se lit sans être noyée dans l'écart attendu du bloc. `Motorisation` remplit ce rôle. ⚠️ **Portée réelle, vérifiée** : elle instancie `Bouton` et les glyphes flèches, mais **ni `Étoile` ni `check`** — donc elle est **aveugle** aux deux pièces gouvernées que cette itération réemploie. Ces deux-là exigent une garde distincte : relecture directe avant/après du master, aucune page ne pouvant les observer. Coût nul : l'instrument de photographie de pages capture la planche entière en une passe.
- Q: Le brief dit « le bloc de la page d'accueil » mais son critère de succès dit « plus aucune occurrence », et la mesure 003 en compte 8 sur 9 maquettes — on en remplace combien ? → A: **Toutes (8 attendues).** C'est la seule lecture qui ferme le trou de gouvernance et rend SC-008 atteignable ; un sous-ensemble laisserait 7 aplats et maintiendrait le bloc « reporté » au rapport d'honnêteté. Le relevé exhaustif (FR-001) fait foi sur le chiffre exact.
- Q: Que voit-on sur les 8 maquettes après remplacement — le contenu réel des avis, ou un exemple générique ? → A: **Le contenu réel, porté par les instances.** Le contenu passe par des propriétés comme pour tout autre composant du système : le master reste générique (aucune carte figée en dur), les instances reçoivent les avis actuels. Pattern déjà appliqué à tous les blocs adoptés en 003. Conséquence directe sur la mesure : plus aucune part « changement de contenu » dans l'écart, donc **pas** de passe de mesure à contenu égalisé — l'écart mesuré se lit directement comme un écart de fidélité. Limite nommée : les textes sont **retranscrits à l'œil** depuis l'aplat (aucun calque texte n'existe), fidèles au visible mais non garantis au caractère près.
- Q: Quel seuil d'écart pixel fait STOP, sachant que 0 % est hors d'atteinte ? → A: **un seuil chiffré par occurrence, décidé par l'owner sur mesure de plancher, avant toute écriture de contrat.** La valeur « ≤ 2 % » avancée en session vient de `extract/figma/visual-parity/tolerance.ts` — **un autre instrument** ; `pages:compare` ne publie qu'un `diffCount` absolu et n'a jamais porté de tolérance. ⚠️ **Amendé au plan (R3)** : dénominateur = **bbox de l'aplat** (≈ 509 056 px, publiée à côté de celle du `GROUP`) ; plancher de fidélité estimé **8-12 % de la région** — la substitution de police (Montserrat contre le raster Trustindex) fait diverger l'encre de ~650 glyphes avant tout déplacement. Le seuil réel est **fixé par la sonde de plancher puis écrit dans `decisions.md`**, avant qu'un contrat ne soit rédigé. Le seuil ne remplace pas l'œil : revue visuelle sur crops obligatoire avant acceptation de chaque occurrence — précédent 003 où une graisse de police perdue et un espacement de paragraphe, tous deux sous le seuil, n'ont été trouvés qu'en regardant les images.
- Q: L'itération 005 écrit dans le même fichier vivant et mesure ses lots par « 9 pages identiques, 0 pixel » ; quand la 006 peut-elle écrire à son tour ? → A: **Séquentiel — aucune écriture canevas avant la clôture de la 005.** Deux raisons mesurées : (1) toute mutation concurrente sur les pages porteuses rend le « 0 pixel » de la 005 illisible ; (2) la 005 renomme l'axe de variant du Bouton, que ce bloc imbrique — contractualiser avant elle graverait une identité condamnée. Tout ce qui ne touche pas le canevas (mesures depuis l'aplat, contrat, code, évals) avance en parallèle. Corollaire : recensement et captures « avant » se font **après** la clôture 005, jamais sur un état périmé. ⚠️ **Statut au 2026-07-25, corrigé au plan (R12)** : la spec 005 est **CLOSE** (`cc048a4`, 8/8 gates verts, suite 108/108) mais **non mergée** — la branche 006 part de `8f3137d` et ne contient aucun de ses commits. Le gel d'écriture est **levé** ; le verrou qui le remplace est le **merge de 005 dans la branche 006**, prérequis dur du premier geste (il apporte aussi la regex `\d{3}/` de `checkpoint.js`, sans laquelle aucun label `006/…` n'est posable ⇒ FR-003 inatteignable).
- Q: L'un des 5 avatars visibles est une vraie photo ; sa seule source fidèle est un recadrage bitmap de l'aplat — contradiction avec « aucun pixel aplati ne subsiste » (FR-004/SC-001) ? → A: **Non : la photo est du contenu, pas de la structure.** La règle « zéro aplat » vise l'aplat de **widget** (structure, chrome, texte, icônes rendus en pixels) ; un fill image de **contenu** porté par propriété reste légitime — même classe que les photos de contenu ailleurs dans le fichier (réalisations, hero). L'avatar photo est recadré depuis l'aplat, provenance et limite de résolution nommées au rapport ; contenu réel conservé, mesure non polluée.
- Q: Le widget d'origine est un carrousel interactif sur le site réel — le composant code doit-il porter un comportement de défilement ? → A: **Non — présentation statique, zéro comportement, sur les deux surfaces.** Le composant rend l'état figé de l'aplat ; tout chrome de navigation visible (flèches, points) est reconstruit comme pièce visuelle gouvernée sans logique (précédent exact : Carousel-controls, 003). Le défilement/l'interactivité entre en Out of Scope ; toute revendication contraire exigerait une éval derrière (claims rule).

### Session 2026-07-26 — T016, STOP-GATE du seuil (résolu)

- Q: Sonde de plancher exécutée (`tasks.md` T014-T015, `extract/figma/aplat-parity/`) : une carte d'essai rendue en Montserrat contre le crop natif de l'aplat donne **5,761 %** de la région (une carte, 176 341 px) — sous l'estimation pessimiste de 8-12 %. Quel seuil retenir pour FR-016/SC-004 ? → A: **≤ 9,76 % de la bbox de l'aplat** (plancher mesuré 5,761 % + 4 points de marge, décision owner — la marge couvre le logo Google multicolore, le CTA « Écrire un avis » et les flèches de carrousel, non exercés par la sonde à une carte). Dénominateur = bbox de l'aplat, **1552 × ~328 ≈ 509 056 px** (publié à côté de celui du `GROUP`, 1552 × 459, pour qu'aucun des deux ne soit accusé d'être le choix flatteur). Fidélité **structurelle** (boîtes, positions, comptes, couleurs) et **raster** (rastérisation des glyphes, dominée par la substitution de police — conséquence de la gouvernance, pas un défaut) restent séparées au rapport. **Règle 005 doublée, reconfirmée par l'owner** : chaque exécution future (jambe A en convergence, jambe C par occurrence) écrit son écart attendu avant de s'exécuter, et **l'owner revoit et valide personnellement le triptyque** à chaque fois que l'écart mesuré dévie de plus de 4 points par rapport à l'écart attendu — dans les deux sens, un écart plus petit que prévu étant tout aussi suspect. Receipt complet (calcul, triptyque, sonde) : `specs/006-google-reviews-block/decisions.md` § T016.

## Contexte hérité — faits mesurés, pas des hypothèses

Ces faits proviennent des preuves déjà produites par la spec 003 ; ils ne sont pas re-dérivés ici.

| Fait | Chiffre / valeur | Receipt |
|---|---|---|
| Nature de la source | `RECTANGLE` à fill `IMAGE` nommé `trustindex-google-reviews-widget` — **zéro vecteur récupérable** | `specs/003-.../audits/review-card.md` |
| Un seul et même screenshot recopié | `imageHash` `ea17d86d…cff2` **identique**, vérifié sur 2 pages (`Accueil`, `Contactez-nous`) — **2 des 8 vérifiées** | `specs/003-.../decisions.md` (2026-07-24) |
| Nombre d'occurrences | **8 des 9 maquettes** — absent sur `Motorisation` | `COMPONENT-INVENTORY.md`, `proofs/honesty-report.md` §1 |
| Structure de l'occurrence | un `GROUP` = **instance Section-header déjà gouvernée** (T063-T064) + l'aplat | `decisions.md` (adoption Section-header) |
| Report d'origine | Review-card (T053-T054) + section Avis Google (T089-T090) reportés, condition de reprise écrite : « owner valide un design net-new » | `proofs/honesty-report.md` §1 |
| Pièces gouvernées réutilisables | icône `star` (registre v1.1.0, **orange intrinsèque : ne se recolore pas**), contrat Button, `assets/icons/check.svg` (glyphe interne, classe de parité D7) | `contracts/icons.registry.json`, spec 004 |
| Piège connu sur ce bloc précis | une mutation partielle **dans le `GROUP`** a fait doubler la hauteur d'une page (5928→10168px) pendant 003 — l'origine d'un `GROUP` se recalcule et désynchronise les enfants non touchés | `decisions.md` (incident Section-header) |

**Conséquence** : c'est le dernier bloc du fichier resté hors gouvernance, et le seul dont la source ne peut pas être auditée-puis-extraite (règle « source propre d'abord ») — il n'y a **rien à nettoyer, seulement à reconstruire**. L'itération s'inscrit donc dans le précédent déjà accepté de l'icône Étoile (net-new depuis un rendu observé), à une échelle plus grande et avec le risque de fidélité correspondant, assumé par l'owner.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Le dernier aplat tiers devient un composant gouverné (Priority: P1)

En tant qu'owner du design system, je veux que le bloc « Avis Google » — aujourd'hui une image aplatie d'un widget tiers — devienne un vrai composant Figma gouverné, avec son contrat et son code générés comme tout autre composant, afin qu'il ne reste **plus aucune zone de maquette hors gouvernance** dans le fichier.

**Why this priority**: C'est l'objet même de l'itération et le dernier trou du programme d'externalisation. Tant qu'il subsiste, le fichier contient une zone que le système ne sait ni décrire, ni régénérer, ni surveiller : une image opaque qu'aucune vérification ne peut lire, qu'aucun changement de token ne suit, et que personne ne peut faire évoluer sans rouvrir un outil tiers. Le compteur « blocs reportés » du rapport d'honnêteté 003 passe de 2 à 0 (la carte d'avis et sa section parente ferment ensemble).

**Independent Test**: Un relevé du fichier vivant, fait par position et non par nom, ne retourne plus aucun nœud portant l'image aplatie du widget dans le périmètre du bloc ; à la place, chaque occurrence est une instance d'un master gouverné, et le composant correspondant existe en contrat et en code généré.

**Acceptance Scenarios**:

1. **Given** les occurrences du bloc recensées exhaustivement avant tout geste, **When** la reconstruction est livrée et adoptée, **Then** aucune occurrence de l'aplat ne subsiste sur le canevas et chacune est devenue une instance gouvernée.
2. **Given** le bloc reconstruit, **When** on suit la chaîne figma → contrat → code, **Then** le composant la traverse **sans étape manuelle additionnelle** et sans qu'aucun fichier généré soit écrit ou retouché à la main.
3. **Given** l'instance de Section-header déjà gouvernée qui vit dans le même `GROUP` que l'aplat, **When** le remplacement a lieu, **Then** cette instance est conservée telle quelle — ni recréée, ni détachée, ni dupliquée.
4. **Given** une occurrence qui diverge des autres (largeur, nombre d'avis visibles, imbrication différente), **When** elle est rencontrée, **Then** la divergence est nommée et tranchée avant remplacement — jamais absorbée silencieusement dans un cas moyen.
5. **Given** la maquette qui ne porte pas le bloc, **When** l'itération se termine, **Then** elle n'en a pas reçu un.

---

### User Story 2 - Preuve visuelle avant/après honnête, occurrence par occurrence (Priority: P2)

En tant qu'owner, je veux une **preuve visuelle avant/après** de la reconstruction, afin de documenter honnêtement l'écart pixel réel **même en l'absence de vérité terrain vectorielle** — et de le documenter pour chaque occurrence touchée, pas pour un échantillon.

**Why this priority**: C'est la seule chose qui distingue une reconstruction assumée d'un « à peu près » non mesuré. Il n'existe aucune source en calques contre laquelle valider : la seule référence est le rendu aplati lui-même. La preuve ne peut donc pas prouver la justesse du design — elle documente l'écart réel, ce qui est exactement ce que l'owner demande. La règle de capture-avant du dépôt est ici structurante : une fois une occurrence remplacée, son état antérieur n'est plus rendable (aucun outil ne produit l'image d'une version Figma passée, et le retour arrière rétroactif est exclu).

**Independent Test**: Le rapport de sortie contient autant d'entrées avant/après qu'il y a d'occurrences recensées — chacune avec son image, son écart mesuré et son explication. Une entrée manquante est un échec, pas une omission acceptable.

**Acceptance Scenarios**:

1. **Given** l'inventaire des occurrences, **When** la première mutation démarre, **Then** l'état « avant » de **toutes** les occurrences a déjà été capturé et chaque capture vérifiée non vide et à la bonne taille — jamais un sous-ensemble pilote.
2. **Given** une occurrence remplacée, **When** son écart est mesuré, **Then** le chiffre est publié tel quel, y compris non nul, avec une explication courte de ce que l'écart contient.
3. **Given** un écart au-delà du seuil convenu, **When** il est constaté, **Then** il déclenche un arrêt et une décision explicite — jamais une validation au jugé.
4. **Given** que le contenu réel est conservé dans les instances (FR-010), **When** l'écart est mesuré, **Then** il ne contient aucune part « changement de contenu » et se lit directement comme un écart de fidélité ; si un fragment a dû être substitué faute d'être lisible, sa contribution est isolée et nommée.
5. **Given** une preuve avant/après qui s'avérerait manquante après coup, **When** on cherche à la combler, **Then** elle est déclarée manquante — aucun retour arrière rétroactif du fichier vivant n'est tenté.

---

### User Story 3 - Aucune régression, ni dans le système ni sur les maquettes (Priority: P2)

En tant qu'owner, je veux que ce nouveau composant soit vérifié par **les mêmes contrôles que les autres composants du système**, afin de garantir qu'il n'introduit aucune régression — ni dans la bibliothèque générée, ni sur les maquettes du fichier (les porteuses du bloc **et** la maquette témoin qui ne le porte pas).

**Why this priority**: Un composant qui n'est pas soumis aux mêmes vérifications que les autres n'est pas gouverné, il est seulement dessiné. Et c'est ce bloc précis qui a produit l'incident le plus spectaculaire de la spec 003 (une page qui double de hauteur après une mutation partielle dans son `GROUP`) : le risque de casse collatérale sur les maquettes est mesuré, pas théorique.

**Independent Test**: Toutes les vérifications déjà en place du dépôt passent au vert après la livraison ; les zones hors bloc des maquettes porteuses restent identiques au pixel, et la maquette témoin affiche 0 pixel d'écart.

**Acceptance Scenarios**:

1. **Given** le composant livré, **When** les vérifications existantes du dépôt sont exécutées, **Then** elles passent toutes — génération déterministe, comparaison trois voies sans écart, suite d'évals au complet.
2. **Given** une capacité nouvelle revendiquée quelque part dans la documentation, **When** cette phrase est écrite, **Then** une vérification automatisée la couvrait déjà (fixture → éval → affirmation), jamais l'inverse.
3. **Given** les maquettes porteuses (zones hors bloc) **et** la maquette témoin qui ne porte pas le bloc mais instancie les mêmes masters partagés (bouton, icônes), **When** les pages sont comparées avant/après, **Then** elles sont identiques au pixel ; tout écart hors bloc est un échec à investiguer, pas un bruit à tolérer — c'est précisément sur la témoin qu'une retouche accidentelle d'un master **qu'elle instancie** se voit, l'écart y étant impossible à confondre avec celui du bloc — **et, pour les pièces qu'elle n'instancie pas (`Étoile`, `check`), une relecture directe avant/après du master tient lieu de garde, l'angle mort étant nommé au rapport**.
4. **Given** le piège connu du `GROUP` (hauteur de page qui explose sur mutation partielle), **When** une occurrence est adoptée, **Then** la hauteur totale de la page est contrôlée immédiatement après le geste, avant de passer à la suivante.
5. **Given** un point de restauration, **When** la première mutation démarre, **Then** il a déjà été enregistré et est identifié nommément dans le rapport.

---

### User Story 4 - Une nouvelle carte d'avis se produit par propriétés, pas par redessin (Priority: P3)

En tant qu'utilisateur du design system (designer ou développeur), je veux pouvoir produire une carte d'avis différente — autre auteur, autre note, autre texte, avec ou sans photo — **en changeant des propriétés**, afin que le bloc soit réellement réutilisable et pas une reproduction figée d'un état daté.

**Why this priority**: C'est ce qui sépare « le screenshot est devenu du vectoriel » de « le bloc est gouverné ». Sans propriétés, on aurait remplacé une image opaque par un dessin opaque. Valeur réelle mais non bloquante pour fermer le gap de gouvernance, d'où P3.

**Independent Test**: Sans aucune opération de dessin, **un opérateur qui n'a pas construit le composant** — l'owner, ou quiconque disposant seulement du composant livré et de sa documentation — produit une carte d'avis au contenu entièrement différent de l'exemple livré, sur les deux surfaces (canevas et code).

**Acceptance Scenarios**:

1. **Given** le composant livré, **When** un utilisateur veut une autre carte d'avis, **Then** il change des propriétés (identité de l'auteur, note, date, texte, marqueur de vérification, présence d'une photo) — aucun calque n'est dessiné, dupliqué ni détaché.
2. **Given** le fait mesuré que 4 des 5 avatars visibles suivent le motif d'avatar généré par défaut (pastille colorée + initiale) et qu'un seul est une photo, **When** le composant est livré, **Then** les deux cas existent comme choix gouverné, pas comme deux dessins séparés.
3. **Given** une pièce visuelle déjà gouvernée ailleurs (étoile de notation, bouton, glyphe de validation), **When** le composant en a besoin, **Then** il la réutilise — le dessin n'est pas dupliqué.
4. **Given** une pièce visuelle nouvelle nécessaire au bloc et absente du système, **When** elle est introduite, **Then** elle entre dans le jeu gouverné correspondant, jamais posée en vecteur libre hors gouvernance.

---

### Edge Cases

- **Les 8 occurrences ne sont vérifiées identiques que sur 2 d'entre elles.** Que se passe-t-il si le relevé exhaustif en trouve une avec une autre image, une autre largeur ou un autre nombre d'avis ? → traitée comme divergence nommée et tranchée (FR-006), jamais absorbée.
- **Le contenu réel doit être retranscrit à la main.** Il n'existe aucun calque texte : noms, dates et textes des avis se relisent à l'œil sur un aplat. Fidèle au visible, mais pas garanti au caractère près (espace de fin, apostrophe typographique, accent mangé par la compression) — même classe d'honnêteté que la restauration depuis capture pixel déjà documentée en 003. Un fragment illisible ou tronqué à la source doit être signalé, jamais inventé en douce.
- **Aucune vérité terrain.** Deux mesures successives de la même valeur (couleur, taille de texte, espacement) prises à l'œil sur un aplat peuvent diverger. Il faut une règle de tranchage écrite, et la provenance « mesurée depuis un aplat » doit rester attachée à la valeur — jamais présentée comme extraite d'une source.
- **Le fichier est vivant et écrit en parallèle** par l'itération 005 (nettoyage de source : renommages, suppression de la page fourre-tout, découpe du Header). Une page peut changer entre la capture « avant » et le remplacement ; et le protocole de preuve de 005 (9/9 pages identiques, 0 pixel) est mécaniquement pollué par toute mutation concurrente sur 8 pages.
- **Le `GROUP` piégé.** Toute mutation partielle dans le `GROUP` du bloc peut désynchroniser les enfants non touchés — incident déjà survenu sur ce bloc précis.
- **Le résumé et la carte n'ont pas la même granularité.** La barre-résumé (note globale, volume d'avis, marque de la source) n'apparaît qu'une fois par bloc, la carte se répète : une seule brique pour les deux serait fausse.
- **L'étoile gouvernée est orange intrinsèque et ne se recolore pas.** Une note partiellement remplie (demi-étoile, étoile grise) n'est pas exprimable avec la pièce existante en l'état — à trancher si le design l'exige.
- **Aucune source de données d'avis n'existe.** Le composant doit être complet et utilisable sans, et ne rien préjuger d'un branchement futur.

## Requirements *(mandatory)*

### Functional Requirements

**Recensement et sauvegarde (avant tout geste)**

- **FR-001**: Le système MUST recenser **exhaustivement** toutes les occurrences du bloc dans le fichier, par position et non par nom, et publier cet inventaire avant toute mutation. Le périmètre de remplacement est **toutes les occurrences** (8 attendues d'après la mesure 003, le relevé faisant foi sur ce chiffre) — jamais la seule page d'accueil, jamais un sous-ensemble pilote.
- **FR-002**: Le système MUST capturer l'état « avant » de **chaque** occurrence recensée avant que la première mutation ne commence, et MUST vérifier chaque capture non vide et à la bonne taille — jamais un sous-ensemble pilote d'abord.
- **FR-003**: Le système MUST enregistrer un point de restauration du fichier, identifié nommément dans le rapport, avant la première mutation.

**Reconstruction et gouvernance**

- **FR-004**: Le système MUST livrer le bloc sous forme de composant(s) Figma natifs gouvernés — plus aucun aplat de **widget** (structure, chrome, texte, icônes rendus en pixels) ne subsiste dans le périmètre du bloc. Exception nommée : un fill image de **contenu** porté par propriété (l'avatar photo d'un avis réel) est légitime — même classe que les photos de contenu ailleurs dans le fichier ; ce bitmap est recadré depuis l'aplat, provenance et limite de résolution déclarées (FR-009, FR-010).
- **FR-005**: Le composant MUST exposer par propriétés les éléments variables d'une carte d'avis (identité de l'auteur, apparence de l'avatar, note, date, texte, marqueur de vérification, présence ou non d'une photo) ; produire une carte différente MUST NOT exiger de dessin, de duplication ni de détachement.
- **FR-006**: Toute occurrence divergente (image, dimensions, nombre d'avis, imbrication) MUST être nommée et tranchée avant remplacement.
- **FR-007**: Le système MUST réutiliser les pièces déjà gouvernées dont le bloc a besoin (icône de notation, bouton, glyphe de validation) plutôt que d'en redessiner l'équivalent ; toute pièce visuelle nouvelle MUST entrer dans le jeu gouverné correspondant, jamais rester un vecteur libre.
- **FR-008**: L'instance de Section-header présente dans le bloc MUST être conservée telle quelle — hors périmètre, ni recréée ni détachée.
- **FR-009**: Toute valeur de design non lisible dans une source en calques MUST être mesurée depuis l'aplat **et déclarée comme mesurée** (provenance conservée) — jamais présentée comme extraite d'une source.
- **FR-010**: Le master MUST rester générique (aucune carte d'avis figée en dur) ; les **instances sur le canevas MUST porter le contenu réel actuellement affiché**, transmis par propriétés comme pour tout autre composant du système. Ce contenu MUST être retranscrit depuis l'aplat — aucun calque texte n'existe — et cette limite (fidélité au visible, **non garantie au caractère près**) MUST être nommée au rapport. Tout fragment illisible ou tronqué à la source MUST être signalé nommément avec la valeur retenue à la place, jamais comblé en silence. L'avatar photo d'un avis réel suit la même logique côté image : un recadrage bitmap depuis l'aplat porté par la propriété correspondante, provenance et limite de résolution nommées au rapport — jamais une photo de substitution.

**Adoption sur le canevas**

- **FR-011**: Le système MUST remplacer **toutes** les occurrences recensées et retenues ; une occurrence non remplaçable MUST être signalée nommément avec sa raison — jamais laissée silencieusement.
- **FR-012**: Après chaque adoption, le système MUST contrôler immédiatement la hauteur totale de la page concernée avant de passer à la suivante (garde-fou de l'incident `GROUP` connu).
- **FR-013**: Le système MUST NOT modifier les zones des maquettes situées hors du bloc, et MUST mesurer cette absence de dégât sur **deux populations** : les maquettes porteuses (hors périmètre du bloc) et **au moins une maquette témoin qui ne porte pas le bloc** mais instancie les mêmes masters partagés. Tout écart hors bloc MUST être traité comme un échec à investiguer.

**Preuve**

- **FR-014**: Le système MUST produire un rapport avant/après **par occurrence**, contenant l'image, l'écart mesuré, une explication courte, et l'identification de l'état avant et après.
- **FR-015**: L'écart mesuré MUST être publié tel quel, y compris non nul. Le contenu réel étant conservé (FR-010), l'écart mesuré **est** l'écart de fidélité — aucune part « changement de contenu » ne doit venir le gonfler. Si un fragment de contenu a dû être substitué faute d'être lisible, sa contribution à l'écart MUST être isolée et nommée.
- **FR-016**: Le seuil d'acceptation par occurrence est **≤ 9,76 % de la bbox de l'aplat** (décidé le 2026-07-26, voir Clarifications ci-dessus et `decisions.md` § T016 — plancher mesuré 5,761 % + 4 points de marge). Le seuil MUST être **chiffré, écrit dans `decisions.md` avant qu'un contrat ne soit rédigé, et adossé à une mesure de plancher publiée** (rendu d'essai contre recadrage de l'aplat : chiffre + triptyque remis à l'owner). Le dénominateur MUST être la **bbox de l'aplat**, publiée à côté de celle du `GROUP` — calculé sur la page entière, le pourcentage serait creux (2 % de page autorisent **26 à 46 %** de bloc faux selon la maquette). Le rapport MUST séparer **fidélité structurelle** (boîtes, positions, comptes, couleurs — verrouillable) et **fidélité raster** (rastérisation des glyphes, dominée par la substitution de police : conséquence de la gouvernance, pas défaut). Au-delà du seuil retenu : arrêt et décision explicite — jamais une validation au jugé ; **un écart plus petit que prévu est tout aussi suspect** et déclenche le même arrêt. Le seuil NE remplace PAS l'examen visuel : chaque occurrence MUST être revue à l'œil sur crops avant acceptation, un écart sous le seuil pouvant masquer un défaut réel (précédent 003 : graisse de police perdue et espacement de paragraphe, tous deux invisibles au chiffre et trouvés à l'œil).
- **FR-017**: Une preuve avant/après constatée manquante MUST être déclarée manquante ; aucun retour arrière rétroactif du fichier vivant MUST être tenté pour la combler.

**Chaîne et non-régression**

- **FR-018**: Le composant MUST traverser la chaîne figma → contrat → code sans étape manuelle additionnelle, et aucun fichier généré MUST être écrit ou retouché à la main.
- **FR-019**: Toutes les vérifications déjà en place du dépôt MUST rester vertes après la livraison.
- **FR-020**: Toute capacité nouvelle revendiquée en documentation MUST être couverte au préalable par une vérification automatisée (fixture → éval → affirmation).
- **FR-021**: ~~Cette itération MUST NOT écrire sur le canevas Figma tant que l'itération 005 n'est pas clôturée~~ — **levée le 2026-07-25**, 005 est close (`cc048a4`). **Ce qui la remplace** : cette itération MUST NOT écrire sur le canevas tant que **005 n'est pas mergée dans la branche 006**, sans quoi le dépôt décrit un fichier Figma qui n'existe plus et aucun point de restauration `006/…` n'est posable (FR-003). Les travaux qui ne touchent pas le canevas (mesures, contrat, code, vérifications) MAY avancer en parallèle. Les mutations de cette itération MUST rester distinguables de celles de la 005 dans l'historique du fichier — par le préfixe de label `006/…` des points de restauration.
- **FR-022**: Le recensement des occurrences (FR-001) et les captures « avant » (FR-002) MUST être (re)faits **après** la clôture de la 005 et non avant, la 005 modifiant le fichier entre-temps ; une capture « avant » prise sur un état périmé MUST NOT être utilisée comme référence.
- **FR-023**: Les pièces gouvernées réutilisées par le bloc MUST être prises dans leur état **post-005** (noms d'axes et de valeurs compris) ; aucun contrat de cette itération MUST être construit sur une identité que la 005 est en train de changer.

### Key Entities

- **Bloc « Avis Google » (section)** : la zone de maquette complète — un en-tête de section déjà gouverné, une barre-résumé, une série de cartes d'avis. Présente sur 8 des 9 maquettes, absente sur `Motorisation`. Aujourd'hui : un groupe contenant l'en-tête gouverné + une image aplatie.
- **Carte d'avis (brique répétée)** : auteur (avatar coloré à initiale **ou** photo, nom), date, note en étoiles, texte du témoignage, marqueur « vérifié ». C'est l'unité qui se répète dans le bloc.
- **Barre-résumé** : note globale, volume d'avis, marque de la source, action associée. Apparaît une seule fois par bloc.
- **Occurrence** : une instance du bloc sur une maquette donnée — porte son état « avant », son état « après », son écart mesuré et son emplacement.
- **Rapport avant/après** : le document de sortie ; une entrée par occurrence, plus la synthèse des écarts et de ce qu'ils contiennent.
- **Maquette témoin** : une maquette qui **ne porte pas** le bloc mais instancie les mêmes masters partagés (bouton, icônes). Son écart attendu est 0 pixel : c'est le seul endroit où une retouche accidentelle d'un master **qu'elle instancie** se lit sans ambiguïté, l'écart n'y étant pas mélangé à celui du bloc. `Motorisation` remplit ce rôle — **pour `Bouton` et les glyphes flèches seulement**. **Angle mort nommé** : elle n'instancie ni `Étoile` ni `check`, les deux pièces gouvernées que le bloc réemploie ; leur garde est une relecture directe du master, pas la témoin.
- **Point de restauration** : l'état du fichier enregistré avant la première mutation, référencé nommément.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un relevé du fichier vivant, fait par position, retourne **0 occurrence** de l'image aplatie **du widget** dans le périmètre du bloc — contre **N** recensées au départ, **N** étant le nombre fixé par le recensement FR-001 (**8 attendues**, le scan faisant foi). Seul fill image restant admis : l'avatar photo de contenu porté par propriété (FR-004), qui ne compte pas comme aplat.
- **SC-002**: **N/N** occurrences traitées (même **N** qu'en SC-001) disposent chacune de leur preuve avant/après publiée (image + chiffre + explication) ; aucune entrée manquante, aucun échantillonnage.
- **SC-003**: Zéro dégât collatéral, mesuré sur deux populations distinctes : sur les **maquettes porteuses**, tout ce qui est hors du bloc est **identique au pixel** ; sur la **maquette témoin** (`Motorisation`, qui ne porte pas le bloc mais instancie les mêmes masters partagés), l'écart est **0 pixel** et aucun bloc ne lui a été ajouté. **Limite nommée, à côté du critère** : la témoin ne couvre que les masters qu'elle instancie (`Bouton`, glyphes flèches) ; `Étoile` et `check` ne sont observables par **aucune** maquette et sont couverts par une relecture directe avant/après du master, dont le résultat est publié avec SC-003.
- **SC-004**: L'écart mesuré est **≤ au seuil décidé (FR-016, 9,76 %) sur chacune des occurrences**, chaque chiffre publié à côté du **plancher mesuré** et du **dénominateur employé** — contenu réel conservé, donc mesure de fidélité pure — et chaque occurrence a été revue à l'œil sur crops avant acceptation. Le critère porte sur « aucune occurrence au-dessus du seuil décidé », **pas** sur une valeur absolue fixée avant la mesure.
- **SC-005**: Une carte d'avis entièrement différente de l'exemple livré est produite **sans aucune opération de dessin**, sur les deux surfaces.
- **SC-006**: Le composant est produit de bout en bout **sans étape manuelle** : une régénération à blanc redonne exactement le même résultat, et aucun fichier généré n'a été retouché.
- **SC-007**: Toutes les vérifications existantes du dépôt sont vertes après la livraison, avec les compteurs à jour et zéro phrase de capacité sans vérification derrière.
- **SC-008**: Le compteur « blocs reportés faute de source exploitable » du rapport d'honnêteté passe de **2 à 0** (la carte d'avis et sa section parente ferment ensemble), et le fichier ne contient plus **aucune** zone de maquette hors gouvernance.

## Assumptions

- **Décomposition en deux niveaux** : une brique répétée (la carte d'avis) et le bloc qui l'assemble (la section), conformément à la granularité déjà établie par l'inventaire du dépôt, qui les traite comme deux entrées distinctes et dépendantes. Le brief dit « composant(s) » sans trancher ; la modélisation exacte relève de `/speckit.plan`.
- **Aucune source d'avis live.** Le contenu est saisi, pas alimenté : aucun branchement sur un flux d'avis en production, aucune décision à ce sujet dans cette itération (exclusion explicite du brief). Le composant doit être complet et utilisable sans.
- **Le contenu réel est conservé, le master reste générique.** Les instances portent les avis actuels via leurs propriétés — c'est le pattern déjà appliqué à tous les blocs adoptés en 003 (master générique, contenu réel par instance). L'exclusion du brief (« pas une reproduction des 5 avis réels ») est lue comme « le master ne fige pas 5 cartes en dur », **pas** comme « les maquettes perdent leur contenu » — lecture confirmée par l'owner en session.
- **Format de la preuve** : à défaut d'instruction contraire, le format déjà utilisé dans le dépôt pour les preuves avant/après de mutation de canevas est réutilisé tel quel — pas d'invention d'un format propre à ce composant. (Question laissée ouverte par le brief ; défaut retenu à ce stade.)
- **La règle « source propre d'abord » est structurellement inapplicable ici** : il n'y a pas de source à nettoyer, seulement un aplat. C'est ce qui rend cette itération exceptionnelle, et c'est précisément le risque que l'owner déclare accepter. Le précédent invoqué est l'icône Étoile (net-new depuis un rendu observé).
- **Le glyphe de validation et l'icône de notation existent déjà** côté système ; leur réemploi est un fait acquis du brief, pas une découverte à faire.
- **Aucun retour arrière rétroactif** du fichier vivant ne sera proposé pour combler une preuve manquante (règle owner établie).
- **La maquette `Motorisation` ne porte pas le bloc** et n'en reçoit pas — l'itération ne complète pas les maquettes, elle gouverne l'existant. Elle sert de **maquette témoin** (écart attendu : 0 pixel). Le coût est nul : l'instrument de photographie de pages du dépôt capture la planche entière en une passe, pas page par page.

## Dependencies

- **Itération 005 (nettoyage de la source Figma)** — **close le 2026-07-25** (`cc048a4`), **non mergée** dans la branche 006. Elle a renommé, déplacé et découpé des masters : deux pages supprimées (`Assets`, `Archive`) et la copie de la maquette Accueil, 18 icônes déplacées, Section-header redimensionné 1552→1550, Footer reconstruit, Header découpé. **Conséquences dures** : (1) le merge de 005 est le prérequis du premier geste (FR-021) ; (2) **tous les node ids de l'ère 003 sont périmés** jusqu'au re-scan (FR-022). L'owner avait explicitement sorti la carte d'avis du périmètre de 005 (« traitée à part, plus tard »).
- **En-tête de section gouverné** (livré par la spec 003) : présent dans le bloc, conservé tel quel.
- **Pièces gouvernées réutilisées** : icône de notation, contrat du bouton, glyphe de validation.
- **Instrument de photographie de pages** (livré par la spec 003) : la capacité de capturer et comparer les 9 maquettes avant/après existe déjà, elle n'est pas à construire.

## Out of Scope *(cette itération)*

- L'en-tête de section du bloc — déjà gouverné.
- Le **figement** des 5 avis actuels dans le master : il reste générique, le contenu réel vit dans les instances (FR-010).
- Toute décision sur un branchement à une source d'avis live en production.
- **Tout comportement interactif du bloc** (défilement du carrousel, flèches actives, pagination) : sur les deux surfaces, le composant est une **présentation statique** de l'état figé de l'aplat. Le chrome de navigation visible, s'il existe, est reconstruit comme pièce visuelle gouvernée **sans logique** (précédent : Carousel-controls, 003).
- Toute autre zone du fichier : cette itération ne profite pas du passage pour ranger, renommer ou corriger ailleurs (ce travail appartient à l'itération 005).

## Addendum de drift — 2026-08-23

La frontière « SectionHeader hors scope » reste vraie pour le widget historique
`ds.google-reviews`, mais elle est remplacée pour la surface publique par le
parent composé `ds.google-reviews-section`. La décision, les IDs Figma, la
compatibilité Odoo et les gates de clôture sont consignés dans
`specs/tiny/google-reviews-section-composition.md`.
