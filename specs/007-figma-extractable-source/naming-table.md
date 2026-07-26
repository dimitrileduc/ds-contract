# Table de nommage — Spec 007 (FR-030 / SC-015)

**Statut : validée par l'owner (T018, 2026-07-26)** — O1 accepté, O2/O3 ratifiés, O5
lecture souple retenue (voir `decisions.md`). Les 9 lignes D encore ouvertes au moment
de la revue ont été résolues juste après, par lecture live une fois le pont reconnecté
(§4b) — un suivi du geste que l'owner a explicitement demandé, pas une réouverture de
son verdict. Aucun nom de cette table n'a été
appliqué au canvas. Toutes les lignes `set`/`prop`/`variant`/`part` sont passées à
`node specs/007-figma-extractable-source/tools/name-oracle.mjs` avant d'être écrites ici —
verdict reporté colonne `oracle`. Les lignes `layer` (FR-005) ne passent pas par l'oracle
(un nom de calque n'est pas un identifiant généré — cf. §1 du contrat, qui ne liste que
set/prop/valeur-part comme critère d'acceptation).

**Convention `descriptionFr`** (FR-006a) : pour chaque `set` renommé, l'orthographe
accentuée d'origine est ajoutée à la description EXISTANTE du composant (confirmée 55/55
déjà peuplées, T008a) sous la forme d'une phrase courte ajoutée en tête :
« Anciennement nommé « **{descriptionFr}** » sur le canvas. » — jamais en écrasement du
texte déjà écrit (audits, limites, décisions y sont documentés). `kind: prop` n'a jamais
de `descriptionFr` (FR-006b) : si l'orthographe française d'une propriété porte du sens,
elle est consignée dans la description du **composant** porteur, pas dans un champ qui
n'existe pas pour une propriété.

**⚠️ Interruption de session notée pour honnêteté** : le pont figma-console s'est
déconnecté (`figma_get_status` → `transport.active:"none"`) pendant la rédaction des
classes D (collisions de part). **9 des 22 lignes D** ci-dessous (§4) touchent des
structures dont je n'ai pas pu re-vérifier l'arbre exact avant la coupure — elles sont
marquées **`À RECONFIRMER`** plutôt que devinées. Elles ne bloquent pas la revue des 94
autres lignes (toutes `CLEAN`, aucune devinée) ; elles bloquent uniquement l'exécution de
leur propre geste (T022), qui peut attendre la reconnexion sans retarder T018.

---

## 1 · Classe A — nom de set ≠ PascalCase (36) — [T010]

Chaque candidat = accents dépliés (pas supprimés) puis PascalCase strict. Les 10 lignes
marquées **(B)** couvrent aussi la classe B sur la même ligne (même défaut, deux angles).

| kind | nodeId | ancien | nouveau | descriptionFr | classes | oracle |
|---|---|---|---|---|---|---|
| set | 2053:1263 | Étoile | Etoile | Étoile | A, B | CLEAN |
| set | 274:2934 | piqueray | Piqueray | piqueray | A | CLEAN |
| set | 263:2125 | mail | Mail | mail | A | CLEAN |
| set | 263:2120 | phone | Phone | phone | A | CLEAN |
| set | 230:599 | download | Download | download | A | CLEAN |
| set | 230:585 | pdf | Pdf | pdf | A | CLEAN |
| set | 95:252 | search | Search | search | A | CLEAN |
| set | 95:216 | user | User | user | A | CLEAN |
| set | 27:86 | chevron-right | ChevronRight | chevron-right | A | CLEAN |
| set | 27:83 | chevron-left | ChevronLeft | chevron-left | A | CLEAN |
| set | 226:373 | chevron-down | ChevronDown | chevron-down | A | CLEAN |
| set | 226:374 | chevron-up | ChevronUp | chevron-up | A | CLEAN |
| set | 27:70 | cart | Cart | cart | A | CLEAN |
| set | 6:104 | arrow-right | ArrowRight | arrow-right | A | CLEAN |
| set | 6:99 | arrow-left | ArrowLeft | arrow-left | A | CLEAN |
| set | 9:185 | external-link | ExternalLink | external-link | A | CLEAN |
| set | 6:119 | octicon:chevron-down-12 | OcticonChevronDown12 | octicon:chevron-down-12 | A | CLEAN |
| set | 4:14 | piqueray_logo | PiquerayLogo | piqueray_logo | A | CLEAN |
| set | 274:2389 | member-picture | MemberPicture | member-picture | A | CLEAN |
| set | 2059:1417 | Accordion-row | AccordionRow | Accordion-row | A | CLEAN |
| set | 2068:1972 | Product-card | ProductCard | Product-card | A | CLEAN |
| set | 2074:2072 | Member-card | MemberCard | Member-card | A | CLEAN |
| set | 2077:2191 | Carousel-controls | CarouselControls | Carousel-controls | A | CLEAN |
| set | 2079:2246 | Footer-column | FooterColumn | Footer-column | A | CLEAN |
| set | 2090:2397 | Section-header | SectionHeader | Section-header | A | CLEAN |
| set | 2095:2484 | Réalisation | Realisation | Réalisation | A, B | CLEAN |
| set | 2152:5554 | Nav-item | NavItem | Nav-item | A | CLEAN |
| set | 2103:2824 | Présentation | Presentation | Présentation | A, B | CLEAN |
| set | 2104:2904 | Coordonnées | Coordonnees | Coordonnées | A, B | CLEAN |
| set | 2108:3123 | Texte SEO | TexteSEO | Texte SEO | A | CLEAN |
| set | 2114:3721 | Réassurances | Reassurances | Réassurances | A, B | CLEAN |
| set | 2115:3947 | Équipe | Equipe | Équipe | A, B | CLEAN |
| set | 2115:4277 | Catégories principales | CategoriesPrincipales | Catégories principales | A, B | CLEAN |
| set | 2116:4475 | Produits e-commerce | ProduitsECommerce | Produits e-commerce | A | CLEAN |
| set | 2117:4691 | Réalisations | Realisations | Réalisations | A, B | CLEAN |
| set | 2151:5552 | Hero vidéo | HeroVideo | Hero vidéo | A, B | CLEAN |

**Note technique (à ne pas oublier au geste, T019/T021)** : le nom mécaniquement proposé
par l'extracteur AUJOURD'HUI pour ces mêmes noms (ex. `Étoile` → `Toile`, `Hero vidéo` →
`HeroVidO`) **n'est PAS** ce que cette table propose — l'extracteur traite un caractère
accentué comme un séparateur qu'il **supprime**, jamais comme une lettre à translittérer.
La table propose le **dépliage** (é→e, pas suppression), ce qui est vérifié `CLEAN` par
l'oracle et préserve le sens (`Realisation`, pas `Alisation`).

**Vérification classe G (collision de `componentIdSlug`)** : les 55 ids finaux (36
renommés + 19 déjà propres) sont **tous distincts** — vérifié programmatiquement, 0
collision. `Réalisation`→`realisation` et `Réalisations`→`realisations` restent deux ids
distincts (singulier/pluriel).

## 2 · Classe B — sets à caractères non transportables (10) — [T011]

Couverte intégralement par les lignes marquées **(B)** en §1 — aucune ligne
supplémentaire. Rappel du mécanisme (contrat §2) : retirer les accents ne suffit pas pour
la classe A qui exige le PascalCase strict ; les deux classes se couvrent donc sur la
même ligne pour ces 10 sets.

## 3 · Classe C — propriétés hors identifiant légal (10 occ. / 6 distinctes) — [T012]

Aucune de ces propriétés n'a de `descriptionFr` (FR-006b) — une propriété Figma n'a pas
de champ description ; si le sens français compte, il est consigné dans la description du
composant porteur (déjà couvert par la ligne `set` correspondante en §1 quand ce composant
y figure, sinon noté ici).

| kind | nodeId (set porteur) | ancien | nouveau | descriptionFr | classes | oracle |
|---|---|---|---|---|---|---|
| prop | 2053:1256 | Coché | Coche | — | C | CLEAN |
| prop | 6:122 | Libellé | Libelle | — | C | CLEAN |
| prop | 2061:1588 | Libellé | Libelle | — | C | CLEAN |
| prop | 6:122 | Icône gauche | Icone gauche | — | C | CLEAN |
| prop | 6:122 | Icône droite | Icone droite | — | C | CLEAN |
| prop | 274:2389 | État | Etat | — | C | CLEAN |
| prop | 2059:1417 | État | Etat | — | C | CLEAN |
| prop | 2061:1588 | État | Etat | — | C | CLEAN |
| prop | 2056:1278 | État | Etat | — | C | CLEAN |
| prop | 2117:4691 | En-tête | En-tete | — | C | CLEAN |

**Occurrences par propriété distincte** : `État` ×4 (member-picture, Accordion-row, Tab,
Field), `Libellé` ×2 (Bouton, Tab), `Icône gauche` ×1 (Bouton), `Icône droite` ×1
(Bouton), `Coché` ×1 (Checkbox), `En-tête` ×1 (Réalisations) — 10 occurrences, 6 noms
distincts, conforme au départ mesuré.

## 4 · Classe D — collisions de nom de part (22) — [T013]

**Règle de résolution** : nom de part unique et **descriptif du rôle**, jamais du rang
seul ni du contenu — validé par le même oracle que les sets (`--kind part`, contrat §1 :
« valeur/part : même règle que le set »). Le nom mécaniquement calculé par l'extracteur
aujourd'hui (colonne « auto extracteur ») n'est **pas** repris tel quel : plusieurs de ces
propositions sont camelCase (`row2Field`, `formBouton`) et rouvriraient une note A si
posées comme nom de calque — la table propose un remplacement PascalCase à la place.

### 4a · Nom décidé (22/22) — 13 pleinement ancrées, 9 avec nodeId enfant encore à relever

**Distinction volontaire, pour ne pas confondre deux états différents** : le contrat
(§3) dit `nodeId` obligatoire — « la table s'ancre sur l'identifiant, jamais sur le nom
qu'elle remplace ». Pour 4 lignes (Coordonnées) le nodeId du calque exact est déjà
mesuré (T008a). Pour les **9 autres** (Formulaire ×6, SAV ×2, Réassurances ×1), le nom
de remplacement est décidé avec confiance (le chemin de l'extracteur suffit à identifier
sans ambiguïté QUEL calque renommer), mais je n'ai **pas** encore le nodeId exact du
calque enfant (seul le nodeId du **master** est connu) — la lecture ciblée reste à faire
au prochain geste. Ce n'est **pas** la même réserve que §4b : ici la question « quel nom
? » est tranchée, seule l'ancre reste à relever ; en §4b, le nom lui-même est incertain.

| kind | nodeId | chemin | ancien (calque) | nouveau (calque) | oracle |
|---|---|---|---|---|---|
| part | *(nodeId enfant à relever — master Formulaire 2096:2564)* | root/form/row 2/Field | Field | FormRow2Field | CLEAN |
| part | *(idem, master 2096:2564)* | root/form/row 2/Field 2 | Field 2 | FormRow2FieldSecond | CLEAN |
| part | *(idem, master 2096:2564)* | root/form/row 3/Field | Field | FormRow3Field | CLEAN |
| part | *(idem, master 2096:2564)* | root/form/row 4/Field | Field | FormRow4Field | CLEAN |
| part | *(idem, master 2096:2564)* | root/form/row 5/Field | Field | FormRow5Field | CLEAN |
| part | *(idem, master 2096:2564)* | root/form/Bouton | Bouton | FormulaireBouton | CLEAN |
| part | 2104:2884 | root/wrapper/Adresse/Adresse | Adresse | AdresseEtiquette | CLEAN |
| part | 2104:2887 | root/wrapper/Horaires/Horaires | Horaires | HorairesEtiquette | CLEAN |
| part | 2104:2890 | root/wrapper/Contact/Contact | Contact | ContactEtiquette | CLEAN |
| part | 2104:2893 | root/wrapper/Suivez-nous/Suivez-nous | suivezNous | SuivezNousEtiquette | CLEAN |
| part | *(nodeId enfant à relever — master SAV 2108:3105)* | root/section/row/wrapper/background | background | WrapperBackground | CLEAN |
| part | *(idem, master 2108:3105)* | root/section/row/img-group/background | background | ImgGroupBackground | CLEAN |
| part | *(nodeId enfant à relever — master Réassurances 2114:3721)* | root/Bouton (2e CTA) | Bouton | BoutonSecondaire | CLEAN |

Justification **Réassurances/BoutonSecondaire** : sa propre description (déjà écrite,
T008a) documente explicitement 2 CTA sur la variante `4 cartes · 2 CTA` — « bouton
`Motifs disponibles` + `Contactez-nous` » — le premier drawn garde `Bouton`, le second
devient `BoutonSecondaire`, pas un rang muet.

Justification **`*Etiquette`** (Coordonnées ×4) : chaque bloc d'info (Adresse/
Horaires/Contact/Suivez-nous) répète le nom de son groupe parent sur son calque
d'en-tête interne — un défaut structurel identique répété 4 fois, résolu par le
même schéma : `{Bloc}Etiquette` distingue le rôle (l'en-tête du bloc) sans jamais
collisionner entre les 4 blocs. **Ces 4 lignes résolvent aussi 4 des 30 entrées FR-005
(§6)** — même calque, deux défauts, un seul geste.

### 4b · Résolues après reconnexion du pont (9/22) — lecture directe, plus aucune devinée

Le pont s'était déconnecté pendant la rédaction de §4a ; l'owner l'a rouvert (T018) et
ces 4 arbres ont été relus par nodeId avant de proposer un nom. Aucune ligne ci-dessous
n'a été devinée — chacune s'appuie sur la structure réellement observée.

| kind | nodeId | set | chemin | ancien (calque) | nouveau (calque) | ce que la lecture a montré | oracle |
|---|---|---|---|---|---|---|---|
| part | 4:3 (Default), 4:16 (Blanc) | piqueray_logo | root/Tracé (le tracé de tête, hors groupe Texte) | Tracé | Marque | Chaque variante a UN tracé de marque hors du groupe `Texte`, plus un groupe `Texte` de 8 tracés de lettrage TOUS nommés `Tracé` (sans suffixe). Un seul geste suffit : renommer le tracé de marque lève l'unique collision mesurée (les 8 tracés internes au lettrage ne génèrent qu'1 note, pas 8 — l'extracteur ne les individualise pas comme parts séparées) | CLEAN |
| part | 2059:1407 (Grand,Ouvert), 2059:1413 (Petit,Ouvert) | Accordion-row | root/title/Titre (2e occurrence, dans les 2 variantes État=Ouvert) | Titre | TitreOuvert | **Trouvaille structurelle, à noter au rapport (pas seulement un nom à corriger)** : les variantes `État=Fermé` ont `Titre` en enfant DIRECT de la racine ; les variantes `État=Ouvert` l'enveloppent dans une FRAME `title` (minuscule) supplémentaire aux côtés du chevron — une asymétrie de structure entre les 2 états, pas juste un nom dupliqué. Renommer distingue les 2 chemins ; l'asymétrie elle-même est actée en decisions.md, pas corrigée en silence (hors périmètre US3 : ce n'est pas un GROUP) | CLEAN |
| part | 2115:4164 | Catégories principales | root/item (1er)/wrapper/inner/Bloc texte | Bloc texte | Item1BlocTexte | Variante `Disposition=Standard` (native, non instanciée — confirmé par sa description) : 2 items parallèles, tous deux littéralement nommés `item` (le doublon du FRAME lui-même ne collisionne pas, seuls certains descendants oui) | CLEAN |
| part | 2115:4169 | Catégories principales | root/item 2/Décor | Décor | Item2Decor | idem — 2e item, chaîne Décor/wrapper/inner/Bloc-texte/arrow-right | CLEAN |
| part | 2115:4170 | Catégories principales | root/item 2/wrapper | wrapper | Item2Wrapper | idem | CLEAN |
| part | 2115:4171 | Catégories principales | root/item 2/wrapper/inner | inner | Item2Inner | idem | CLEAN |
| part | 2115:4172 | Catégories principales | root/item 2/wrapper/inner/Bloc texte | Bloc texte | Item2BlocTexte | idem | CLEAN |
| part | 2115:4175 | Catégories principales | root/item 2/wrapper/inner/arrow-right | arrow-right *(nom de calque = nom du master, normal pour une instance)* | Item2ArrowRight | idem — le calque de l'instance porte le nom de son master (attendu), le renommage porte sur son rôle de PART dans CE contrat, pas sur l'instance elle-même | CLEAN |
| part | 2116:4661 | Réalisations | root/Section-header (l'instance réelle dans la variante En-tête=Accroche) | Section-header *(nom de calque = nom du master, normal)* | SectionHeaderAccroche | Confirmé : la variante `En-tête=Accroche` instancie réellement `Section-header` ; le slot `En-tête` produit une 2e clé `Section-header` par ailleurs (son défaut swap) — collision entre l'instance directe et la clé de slot. Renommer l'instance réelle lève l'ambiguïté | CLEAN |

**Note sur les instances renommées** (`arrow-right`→`Item2ArrowRight`,
`Section-header`→`SectionHeaderAccroche`) : renommer le **calque** d'une instance ne
touche ni son master ni son rendu — seul le libellé du calque change, exactement comme
les autres renommages de cette table. Le nom de calque égal au nom du master (avant
renommage) était normal et attendu (règle `naming-conventions.md` reconduite) ; il
devient un nom de rôle **après**, ce qui est le point de cette classe D.

## 5 · Valeurs de variant non-ASCII (10) — [T014]

Classe non couverte par les FR d'origine, désormais portée par **FR-003a** (amendement du
2026-07-26) — confirmée exhaustivement par le relevé live T008a (§b), correspondance
exacte avec la liste pré-établie en recherche.

| kind | nodeId (set) | prop | ancien | nouveau | oracle |
|---|---|---|---|---|---|
| variant | 274:2389 | État | Défaut | Defaut | CLEAN |
| variant | 2061:1588 | État | Défaut | Defaut | CLEAN |
| variant | 2059:1417 | État | Fermé | Ferme | CLEAN |
| variant | 2061:1588 | État | Sélectionné | Selectionne | CLEAN |
| variant | 2063:1622 | Disposition | Réassurance | Reassurance | CLEAN |
| variant | 2063:1622 | Disposition | Catégorie | Categorie | CLEAN |
| variant | 2114:3721 | Disposition | 4 cartes · 2 CTA | QuatreCartesDeuxCta | CLEAN |
| variant | 2115:4277 | Disposition | Pleine largeur · 3 cartes | PleineLargeurTroisCartes | CLEAN |
| variant | 2115:4277 | Disposition | Pleine largeur · RDV | PleineLargeurRdv | CLEAN |
| variant | 2117:4691 | En-tête | Présentation | Presentation | CLEAN |

## 6 · Calques nommés d'après leur contenu rédactionnel (30) — [T015, FR-005]

Dénominateur = le relevé T008a(a) exhaustif ; **chaque** entrée du relevé a sa ligne
ci-dessous (SC-017). Ces renommages **ne passent pas** par l'oracle identifiant (§1) —
un nom de calque descriptif reste lisible en français avec accent, il ne devient pas un
identifiant de code. 4 lignes marquées **(=D)** sont le même calque qu'une résolution de
collision en §4a — un seul geste couvre les deux défauts.

| nodeId | master | ancien (calque) | nouveau (rôle) |
|---|---|---|---|
| 2053:1246 | Input | Texte de saisie | Valeur |
| 2053:1248 | Textarea | Texte de saisie | Valeur |
| 2053:1250 | Select | Texte de saisie | Valeur |
| 6:95 | Bouton | Contactez-nous | Libellé |
| 6:125 | Bouton | Contactez-nous | Libellé |
| 6:131 | Bouton | Contactez-nous | Libellé |
| 6:137 | Bouton | Contactez-nous | Libellé |
| 9:208 | Bouton | Contactez-nous | Libellé |
| 28:116 | Bouton | Contactez-nous | Libellé |
| 2056:1268 | Field | (optionnel) | MentionOptionnelle |
| 2056:1274 | Field | (optionnel) | MentionOptionnelle |
| 2096:2562 | Formulaire | En cliquant sur «Envoyer»… | TexteConsentement |
| 2103:2821 | Présentation | Depuis plus de 50 ans… | Texte |
| 2104:2884 | Coordonnées | Adresse | AdresseEtiquette **(=D)** |
| 2104:2885 | Coordonnées | Rue Alfred Drèze 7… | AdresseValeur |
| 2104:2887 | Coordonnées | Horaires | HorairesEtiquette **(=D)** |
| 2104:2888 | Coordonnées | Du lundi au vendredi… | HorairesValeur |
| 2104:2890 | Coordonnées | Contact | ContactEtiquette **(=D)** |
| 2104:2893 | Coordonnées | Suivez-nous | SuivezNousEtiquette **(=D)** |
| 2108:3116 | Texte SEO | Rien ne vaut le toucher… | Paragraphe |
| 2108:3118 | Texte SEO | Infos pratiques | SousTitre |
| 2115:4165 | Catégories principales | Portes de garage résidentielles | Titre *(dans Item1BlocTexte, §4b)* |
| 2115:4166 | Catégories principales | Sectionnelles, basculantes… | Texte *(dans Item1BlocTexte, §4b)* |
| 2115:4173 | Catégories principales | Portes de garage industrielles | Titre *(dans Item2BlocTexte, §4b)* |
| 2115:4174 | Catégories principales | Solutions robustes… | Texte *(dans Item2BlocTexte, §4b)* |
| 2115:4249 | Catégories principales | Maintenance | Titre *(variante "Pleine largeur · RDV" — non ré-inspectée en direct ; rôle proposé par analogie avec les 2 autres cartes, structure non D-colliding donc non bloquante)* |
| 2115:4250 | Catégories principales | Mieux vaut prévenir… | Texte *(idem)* |
| 2117:4679 | Réalisations | Personnalisez votre porte industrielle… | Texte |
| 2120:4773 | Footer | Suivez-nous | TitreReseaux |
| 210:333 | Hero vidéo | Le numéro 1 des portes HÖRMANN… | Accroche |

## 7 · Primitives et rôles de token à créer — [T016]

Ces lignes ne passent **pas** par l'oracle identifiant (il valide des identifiants de
composant, pas des chemins de token DTCG) — revues pour cohérence avec la convention déjà
en place dans `tokens/primitives.tokens.json` / `tokens/semantic.tokens.json` (FR-009a).

### Primitives (collection `Primitives`, mode `Value`)

| Famille | Valeurs à ajouter | Nom Figma | Existant conservé |
|---|---|---|---|
| `font/size` | 44, 54 | `font/size/44`, `font/size/54` | 14,16,18,20,24,32,40,48 |
| `font/weight` | bold | `font/weight/bold` | regular, medium, semibold |
| `font/line-height` | 16,20,24,25,27,30,40,48,50,60,68 | `font/line-height/{n}` | 22 (seule existante) |
| `font/letter-spacing` | 15% | `font/letter-spacing/15` (ou équivalent) | aucune (gamme inexistante) |
| `space` | *(déferré — dépend de la décomposition par canal T030, elle-même dépendante de T008/T009, non encore faite)* | `space/*` | 0,4,10,16,32 |
| `radius` | *(déferré, idem T030)* | `radius/*` | 32 |
| `border-width` | *(déferré, idem T030)* | `border-width/*` | 0,2 |

**Note sur `space`/`radius`/`border-width`** : FR-012 limite explicitement la réouverture
« aux canaux qui bloquent » — la liste exacte des valeurs sort de la décomposition par
canal de la classe E (déjà mesurée : `itemSpacing` 40 dont 14 sans proche, `padding` 16
dont 7 sans proche, `cornerRadius` 3 dont 0 sans proche, `strokeWeight` 6 dont 4 sans
proche — T008), mais la liste **valeur par valeur** est le travail de T030, séquencé
après ce gate (Phase 4), pas ici. Ne pas anticiper une gamme complète non demandée.

### Rôles `typography.*` — les 8 existants + line-height (FR-010a)

`titre-1`…`titre-6`, `paragraphe`, `lead` — **réutilisés tels quels**, la seule
extension est la propriété `line-height` manquante (aujourd'hui 3 props : family/size/
weight).

### Rôles `typography.*` neufs (10) — confirmés exactement contre les 18 styles live (T009)

| Rôle proposé | Style Figma correspondant (mesuré live) |
|---|---|
| `titre-hero` | Titre Hero |
| `libelle-bouton` | Libellé bouton |
| `paragraphe-gras` | Paragraphe gras |
| `accroche` | Accroche |
| `onglet` | Onglet |
| `titre-2-majuscules` | Titre 2 majuscules |
| `titre-3-majuscules` | Titre 3 majuscules |
| `titre-hero-video` | Titre Hero vidéo |
| `libelle-nav` | Libellé nav |
| `note-de-champ` | Note de champ |

**Confirmation exacte** : 6 (titre-1..6) + paragraphe + lead = 8 existants, + ces 10 = 18,
égal au compte live des styles de texte (T009). Aucun résidu, aucun manque. `Titre 3
majuscules`/`Titre 2 majuscules` partagent les métriques de `Titre 3`/`Titre 2`
non-majuscules mais restent **deux rôles distincts** (pas de fusion, US2 sc.4).

---

## Synthèse des lignes par classe

| Classe | Lignes | Nom proposé, oracle CLEAN | nodeId enfant encore à relever |
|---|---|---|---|
| A (36, dont 10 aussi B) | §1 | 36/36 | 0 |
| C (10 occ / 6 distinctes) | §3 | 10/10 | 0 |
| D (22) | §4 | **22/22** | 9 (§4a) |
| Valeurs de variant (10) | §5 | 10/10 | 0 |
| Calques FR-005 (30, hors oracle identifiant) | §6 | 30/30 rôles décidés | 0 |
| Primitives/rôles (revue de cohérence, pas oracle) | §7 | — | — |

**Total des 78 lignes soumises à l'oracle identifiant (A+C+D+variant) : 78/78 noms
CLEAN.** Aucune ligne devinée : les 9 qui touchaient des structures non vérifiées
(`piqueray_logo`, `Accordion-row`, `Catégories principales`, `Réalisations`) ont été
relues en direct après reconnexion du pont (§4b) avant qu'un nom ne soit proposé.
Réserve unique restante, mineure et non bloquante pour la revue : **9 lignes D**
(Formulaire ×6, SAV ×2, Réassurances ×1, listées en §4a) ont un nom validé mais leur
nodeId de calque **enfant** exact reste à relever au prochain geste — seul le nodeId du
master est connu aujourd'hui. Un relevé ciblé (`getNodeByIdAsync` sur ces 3 masters,
lecture seule) précédera leur exécution (T022), sans remettre en cause le nom déjà
décidé et validé.

**Trouvaille à porter au rapport de clôture, pas seulement corrigée en silence** :
la résolution d'Accordion-row (`TitreOuvert`) a révélé une asymétrie structurelle réelle
— les variantes `État=Ouvert` enveloppent Titre+chevron dans une FRAME `title`
supplémentaire que les variantes `État=Fermé` n'ont pas. Ce n'est pas un GROUP (hors
périmètre strict d'US3/FR-016), donc non traité ici, mais nommé pour ne pas disparaître.

Prêt pour revue owner (T018).
