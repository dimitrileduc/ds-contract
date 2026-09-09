# Édition Odoo — registre des défauts trouvés (2026-09-09)

Compagnon de `odoo-edition-panneaux.md`. Source : `integrations/odoo/qa/scenarios/edition-generique.spec.mts`
(`npm run odoo:qa:edition`, 5 min, instance jetable, rôle rédacteur), 4 passages, résultats stables.
Registre machine : `integrations/odoo/qa/fixtures/edition-bugs.json`. Reçus : `specs/tiny/proofs/odoo-edition/`.
**Le rapport à jour se lit ici ; la colonne Décision se remplit cas par cas avec l'owner.**

## État par bloc

| Bloc | ✔ | ✖ | ⊘ | Principal |
|---|---|---|---|---|
| realisations | 11 | 5 | 4 | aucune gouvernance : panneau vide, textes fermés, pas d'ajout de photo |
| formulaire | 0 | 1 | 0 | panneau vide, la frappe ne prend sur aucun texte, pas d'ajout d'avantage |
| produits-ecommerce | 15 | 4 | 3 | titre et prix des cartes fermés, pas d'ajout de produit |
| reassurances | 10 | 4 | 3 | accroche et titre fermés, poignée de déplacement absente |
| google-reviews | 24 | 7 | 4 | la section laisse passer resize, fond, « sauver comme custom » |
| equipe | 18 | 1 | 8 | vidée, plus rien ne permet de ré-ajouter |
| coordonnees | 14 | 2 | 2 | adresse et horaires ouverts, config dit fermés |
| presentation | 16 | 3 | 2 | libellé du CTA ouvert, config dit fermé |
| hero-video | 21 | 1 | 2 | le champ alt du panneau ne pose rien |
| categories | 28 | 2 | 6 | gras survit là où toute marque est interdite ; sélecteurs morts |
| hero | 16 | 2 | 2 | idem sous-titre ; sélecteurs morts |
| devis · sav · texte-seo · faq | 22 · 20 · 23 · 12 | 1 | | sélecteurs de config morts uniquement |
| header · footer · menu-mobile · sous-menu | | | 1 | pas des snippets : scénarios dédiés |

Ce qui tient partout où c'est câblé : insertion, actions racine, texte simple, gras autorisé, collections
(ajouter · supprimer · monter · borne), save, relecture publique, second save, dupliquer sans toucher l'original.

## Les cas, un par un

Statut : 🔴 rouge prouvé · 🟢 corrigé (reçu vert daté) · ⚪ tranché sans code. Décision : vide = à voir ensemble.

### A. Trous d'édition (déclaré ouvert, l'écran refuse — ou l'inverse)

| # | Bloc | Constat | Attendu | Décision |
|---|---|---|---|---|
| EB-001 🟢 | realisations | panneau vide ; accroche/titre/texte `contenteditable=false` ; pas de bouton Ajouter photo — 6 contrôles déclarés | option de panneau + textes ouverts + ajout | **2026-09-09, owner : FIX COMPLET** — sur-titre, titre, paragraphe éditables (gras sur titre/paragraphe) ; photos remplaçables par l'outil image natif d'Odoo + alt éditable ; ajout/retrait/ordre des tuiles au panneau. Modèle : Catégories. **Fait** : parts rouvertes, panneaux racine + tuile, actions de collection et d'image, registre d'adaptations, liens Figma (23 panneaux). Reçus `tdd/EB-001.{rouge,vert}.json` : titre et paragraphe (gras) éditables et sauvés, ajouter/supprimer/monter/vider/annuler verts. Le sur-titre est masqué par la variante d'en-tête `presentation` (voulu : la variante `accroche` montre le sur-titre et cache le paragraphe) — sauté nommé `ODOO-LIMIT-PART-MASQUEE`. Photos : outil natif (déjà OK) + « Remplacer » et alt au panneau |
| EB-002 ⚪ | formulaire | **Les 5 textes S'ÉDITENT** (owner à l'œil + instrument corrigé : frappe, save, relecture, second save, dupliquer — 26 constats verts). Restent : panneau vide (pas d'ajout/retrait/ordre des avantages `features`), message de succès `hidden` donc inéditable dans l'éditeur, et **cliquer un LABEL du formulaire ouvre « Oops! Something went wrong » (OwlError) qui bloque toute la session d'édition** | panneau des avantages ; décider pour le message de succès ; le label ne doit pas planter | |
| EB-003 🔴 | produits-ecommerce | titre et prix carte fermés ; pas d'ajout produit — déclarés `controlled` | ouvrir, ou passer la config en `fixed-by-composition` (vague 034) | **2026-09-09, owner : NORMAL, on ne touche pas** — les produits seront bridgés sur l'e-commerce (Malin Signe). Config à passer en `fixed-by-composition` ; statut ⚪ |
| EB-004 🟢 | reassurances | accroche et titre de section fermés ; config dit `controlled`, le scénario dédié dit « en-tête FIXÉ » | une seule vérité : config = scénario = bloc | **2026-09-09, owner : FIX** — accroche et titre de section à ouvrir. **Fait le jour même** : `REASSURANCES_EDITABLE_PARTS` (+2 sélecteurs), scénario dédié aligné, reçus `proofs/odoo-edition/tdd/EB-004.{rouge,vert}.json` — frappe, save, relecture publique, second save, duplication verts |
| EB-005 ⚪ | reassurances | `move` déclaré allowed, poignée absente (duplicate/remove offertes) — **intermittent** : verte au passage rouge d'EB-004, rouge au passage vert | poignée offerte, à observer sur 3 passages | **Artefact de l'instrument** : Odoo n'offre `move` que si le bloc a un voisin ; la page de test n'en a qu'un. Vue verte dès qu'un second bloc existait. Le générique saute ce cas nommé (`ODOO-LIMIT-MOVE-BLOC-SEUL`) |
| EB-006 🔴 | equipe | collection vidée → panneau racine disparaît (0 contrôle), aucun ré-ajout possible (les avis Google, eux, restent ajoutables) | l'état vide reste ajoutable | |
| EB-007 🔴 | google-reviews | « Voir tous les avis » déclaré plain-text `controlled`, `contenteditable=false` | ouvrir, ou config en fixed | **2026-09-09, owner : NORMAL, fermé** — config à passer en `fixed-by-composition` ; statut ⚪ |
| EB-008 ⚪ | hero-video | le contrôle alt vise `hero-video-poster` (une VIDEO) : champ présent, `alt=null` après saisie | le champ alt écrit sur le nœud qui le porte | **2026-09-09, owner : FIX** → **faux rouge de l'instrument** : une `<video>` n'a pas d'alt, le champ écrit `aria-label` (contrat hero-video 2.0.0, `SetHeroVideoPosterAltAction`). Le générique lisait `alt` ; corrigé, hero-video 23 ✔ / 0 ✖ sans toucher au bloc |

### B. Chrome natif qui fuit

| # | Bloc | Constat | Attendu | Décision |
|---|---|---|---|---|
| EB-009 🟢 | google-reviews | sur la racine de la SECTION, save-as-custom, resize, background OFFERTS ; la politique vise `.s_pqr_google_reviews`, le snippet inséré est `…_section` | les trois absentes | **2026-09-09, owner : FIX** — virer Background / Height / Visibility et tout réglage Odoo par défaut sur la section. **Fait** : `PIQUERAY_SECTION_WRAPPERS` gouverne l'enveloppe comme une racine pour le natif (sans verrouiller ses descendants) ; reçus `tdd/EB-009.{rouge,vert}.json` |

### C. Config contredite par l'écran (déclaré fermé, l'éditeur ouvre)

| # | Bloc | Constat | Attendu | Décision |
|---|---|---|---|---|
| EB-010 🔴 | coordonnees | `address-value`, `hours-value`, `contact-block` ouverts et frappe acceptée ; config : not-editable | config alignée (033 a ouvert le contact ?) | |
| EB-011 🔴 | presentation | libellé du CTA ouvert, frappe acceptée ; config : not-editable | config ou bloc | |
| EB-012 🔴 | google-reviews | `volume`, `auteur`, `date`, `temoignage` ouverts (4 frappes/5) ; config : not-editable | config alignée | |
| EB-013 🔴 | categories | `carte-text` allowedMarks vide, un `<strong>` collé SURVIT au save | aplati, ou allowedMarks [strong] | |
| EB-014 🔴 | hero | `hero-subtitle` idem | aplati, ou allowedMarks [strong] | |

### D. Sélecteurs de config morts (verdict invérifiable, aucune porte ne le voit)

| # | Bloc | Constat | Attendu | Décision |
|---|---|---|---|---|
| EB-015 🔴 | 11 blocs | parts résolues dans le DOM inséré : texte-seo 0/13 · reassurances 1/27 · hero 1/14 · faq 2/19 · presentation 6/9 · devis 7/9 · sav 10/13 · produits 11/23 · categories 4/10 · google-reviews 37/112 · formulaire 50/63 — sélecteurs dérivés du partPath (`root-bouto-in-artes`), pas du QWeb | ≥ 80 % résolus + une porte `odoo:authoring:check` qui compare au QWeb rendu | **CÔTÉ CONTRÔLES : réglé (EB-016).** Reste le côté PARTS (verrous « non modifiable ») : adresses générées avec des noms tronqués (`root-ico-eft`, `chevro-own`) au lieu des vrais `data-pqr-part` — défaut de FABRICATION de la fiche, côté règle sur toute la ligne, jamais côté bloc. Chantier séparé : régénérer les sélecteurs de parts depuis le QWeb rendu + garde-fou. Non fait |
| EB-016 🟢 | categories · reassurances · google-reviews | `targetSelector` absents : categories `carte-cta-lien button-label` ×2, `carte-cta-bouton button-label` ; ~~reassurances `section-header-eyebrow`~~ (corrigé → `carte-body`, 2026-09-09) ; google-reviews `accroche`, `google-reviews-header-title` | 100 % des contrôles résolus | |

### E. Limites d'instrument (nommées, pas des bugs de bloc)

| # | Constat | Suite |
|---|---|---|
| EB-017 | `categories.spec.mts` attend `categories-colonnes`, retiré à la vague 031 (`21b08be0`) pour `categories-style` | mettre le scénario et sa fixture à jour |
| EB-018 | non prouvés par le générique v1 : enum, computed-display (URL d'image, chevrons), native-menu, traduction `arch_db`, annulation d'un ajout de collection (Ctrl+Z/Cmd+Z sans effet sur categories) | v2 du générique ou scénarios dédiés |

## Passe à l'œil — home, instance 8109 (037), Claude in Chrome, admin, 2026-09-09

**Ce qui marche, vu et sauvé** : Hero vidéo (titre, libellé et lien du CTA) · Catégories (titre, texte, ajouter, supprimer, monter/descendre, type de carte, image + alt + lien) · Présentation (titre, texte avec gras, interrupteur CTA, lien) · SAV (titre, CTA, image de fond + photo + alt, lien) · Produits (titre de section) · Devis (titre, CTA, image + alt + lien) · Réassurances (titre de carte, libellé et lien CTA, ajouter une carte) · Avis Google (ajouter un avis, qualificatif, note, nombre, étoiles, lien ; auteur, date, témoignage des cartes). **Enregistrer → relu en public → second enregistrement : OK.**

**Rouges confirmés à l'écran** : EB-003 (titre/prix de carte produit fermés, panneau de carte = lien seul) · EB-004 (accroche et titre Réassurances fermés) · ~~EB-020 texte de carte Réassurances fermé~~ **retiré** (owner : le texte s'édite — c'est `carte-body` qui est ouvert, `carte-text` n'est que le conteneur ; mon sélecteur était faux) · EB-007 (« Voir tous les avis » fermé) · EB-008 (champ Alternative du hero vidéo accepte la saisie, `alt` jamais posé sur la vidéo) · EB-009 (la section Avis Google offre Background / Height / Visibility natifs) · EB-010/011/012 (config « fermé » contredite : le rédacteur édite bien).

**Observations neuves, à trancher** :
- **EB-021** — l'admin a l'anglais comme langue : l'URL passe en `/en` et l'éditeur s'ouvre en **mode traduction** (« Translate to English (US) ») au lieu d'éditer la page maître. Un rédacteur anglophone éditerait une traduction sans le voir. Ouvrir sur `/fr` contourne.
- **EB-022** — « Supprimer la catégorie » (et les autres suppressions de collection) agit sur la carte sélectionnée **sans confirmation** ; un clic raté pendant un défilement a effacé la mauvaise carte. Question d'ergonomie, pas de bug.
- **EB-023** — au chargement public, une erreur JS `Cannot read properties of null (reading 'querySelector')` dans `web.assets_frontend_minimal` (un de nos scripts d'interaction avant que son nœud existe ?). À identifier.
- Discard avec « Connection lost » → « Oops » (`onIframeLoad`, `null.body`) : survenu quand Colima s'effondrait ; à re-vérifier sur instance saine avant de l'inscrire.
- Sur 8109, images produits / devis / réassurances cassées (`/web/image/1657…` vides) : état de l'instance 037, pas un défaut d'édition.

**Faux rouges de l'instrument, corrigés le même jour** : frappe (clic forcé hors écran → curseur nulle part), textes du Formulaire, un titre de Catégories. Règle retenue : **un rouge « la frappe ne prend pas » n'est inscrit qu'après contrôle à l'œil.**

## Passe à l'œil — Portes de garage, instance 8109, 2026-09-09 (soir)

Blocs de la page : Hero (image), Catégories (2 cartes), Présentation, Devis, Réassurances (5 cartes), Section Avis Google, Texte SEO (3 questions).

**Tout s'édite, panneaux complets** : Hero (titre, sous-titre + son interrupteur qui masque/affiche, libellé et lien du CTA, image + alt) · Catégories (titre/texte de carte, type de carte, ajouter, image, alt, lien, ordre, supprimer) · Présentation (titre, texte gras, interrupteur et lien du CTA) · Devis (titre, CTA, image, alt, lien) · Réassurances (**accroche et titre désormais éditables — correctif EB-004 vu en place**, titre/texte de carte, image, alt, ordre, supprimer, ajouter, CTA) · Section Avis Google (**plus aucun réglage natif — correctif EB-009 vu en place**) · Texte SEO (titre, paragraphe, sous-titre, question/réponse en ligne, « ouverte au chargement », ordre, supprimer, ajouter une question). Abandon des essais propre (pas d'« Oops » cette fois : celui de la home tenait à la connexion perdue).

**Soucis relevés, aucun bloquant** :
- **EB-024 · Réassurances à 4 colonnes avec 5 cartes** : la 5ᵉ carte se retrouve seule sur une seconde ligne. Ce n'est pas l'édition, c'est le contenu (5) contre la grille (4) — à trancher : 4 cartes sur cette page, ou grille qui s'adapte.
- **EB-025 · Section Avis Google : deux panneaux pour un bloc** — cliquer l'accroche ou le titre sélectionne la SECTION (« Structure gouvernée », rien d'autre), les réglages (ajouter un avis, note, étoiles, lien) n'apparaissent qu'en cliquant une carte d'avis. Un rédacteur peut croire la section sans réglage. Ergonomie, à trancher.

## Passe à l'œil — Portes d'entrée, Dépannage/SAV, À propos, Contact (8109, 2026-09-09 soir)

**Blocs vus, OK** : Hero image (sous-titre et interrupteur, CTA, image, alt) · Catégories empilées · Devis · Réassurances (4 cartes) · **Réalisations avec sa couche neuve en place** (sur-titre en variante `accroche`, titre, panneau racine « Ajouter une réalisation » → 10 tuiles, panneau de tuile Photo / Alternative / Ordre / Supprimer) · FAQ (titre, question/réponse en ligne, « question ouverte », ordre, supprimer, ajouter, CTA + lien) · Section Avis Google (sans réglages natifs) · Texte SEO · Équipe (nom, poste, portrait « Remplacer » + alt, ordre, supprimer, ajouter → 17) · Coordonnées (titre, adresse, horaires, contact, adresse du plan avec aide, liens Facebook / Instagram). Dépannage/SAV n'a que des blocs déjà validés.

**Vrais soucis, hors décisions déjà prises** :

| # | Bloc / page | Constat | Attendu |
|---|---|---|---|
| **EB-019 🟢** | Formulaire (Contact) | **Confirmé sur la vraie page** : un clic sur une étiquette de champ (« Prénom ») ouvre « Oops! Something went wrong » et **l'erreur revient à chaque geste suivant** — la session d'édition est perdue, il faut recharger. Cause lue dans le rapport technique : `TypeError: Cannot read properties of null (reading 'classList') at getLabelPosition … SelectLabelPositionAction.isApplied` — l'option NATIVE « position de l'étiquette » du form Odoo s'applique à nos champs `s_website_form_field`, dont le DOM n'a pas la structure qu'elle attend | **Fait 2026-09-09** : `excludeNativeFormOptionsForRoots([".s_pqr_formulaire"])` écarte FormOption / FormFieldOption / FormFieldOptionRedraw / WebsiteFormSubmitOption sous notre bloc (odoo19_compat.js + authoring.js). Vérifié session rédacteur sur 8113 (page composée) : **0 « Oops! » sur les 5 étiquettes**, panneau gouverné intact. Rouge confirmé sur la vraie page 8109 (trace `getLabelPosition`→`null.classList`) |
| **EB-027 ⚪** | Réalisations | les **10 tuiles portent le même alt « Nouvelle réalisation »** (le composeur `fill_list` ne transporte pas l'alt par photo — déviation nommée au journal 031, jamais corrigée) ; le rédacteur peut le corriger tuile par tuile au panneau, mais rien ne l'y invite | **2026-09-09, owner : VOULU** — pas de correctif |
| **EB-029 🟢** | Équipe | la **photo de survol** (`member-picture-underlay`) n'a **aucun réglage** : pas au panneau (seul le portrait a « Remplacer » + alt), pas d'outil natif (`o_editable_media` absent). La config déclare pourtant `member-image-survol-url` / `-alt` contrôlés | **Fait 2026-09-09** : actions `pqrReplaceMemberSurvol` / `pqrSetMemberSurvolAlt` + lignes « Portrait de survol » / « Alternative du survol » au panneau (la config le déclarait `controlled` depuis 2.1.1, rien ne le servait). Vérifié : panneau porte les 2 contrôles, alt de survol posé sur `.member-picture__funIa` |
| **EB-030 ⚪** | Équipe (contenu) | alt vide sur tous les portraits ; 11 membres sur 16 s'appellent « Prénom » / « Poste » (contenu de composition, visible en ligne) | **2026-09-09, owner : on s'en fout (contenu, pas édition)** |
| **EB-031 ⚪** | Coordonnées | le texte du téléphone s'édite, mais le **lien `tel:` ne suit pas** (`tel:+3287463266` reste après « +32 (0)87 46 32 66 T ») ; idem probable pour `mailto:`. Un numéro changé en ligne appelle encore l'ancien | **2026-09-09, owner : NORMAL, pas de correctif** — le rédacteur choisit le libellé ET le lien lui-même (outil lien d'Odoo, marque `link` autorisée sur le bloc). Rien à faire |
| **EB-032 🔴** | Tout le site (catalogue de blocs) | **Cliquer une vignette du catalogue pose le bloc dans la zone de dépôt la plus proche du centre de l'écran (hors quart supérieur), sinon la DERNIÈRE — et le champ copyright du pied de page (`t-field`) est une zone de dépôt valable.** Sur une page courte, ou avec le pied de page à l'écran, le bloc atterrit DANS le texte du copyright, et se retrouve sur toutes les pages (le pied est global). Mesuré : 3 formulaires fantômes sur 8113 ; règle lue dans `html_builder/sidebar/block_tab.js` l. 102-119 | les champs éditables du pied de page (et de l'en-tête) ne doivent pas être des zones de dépôt ; à défaut, une page vide doit offrir sa zone en premier. **2026-09-09, owner : à voir plus tard, noté** |
| **EB-026 ⚪** | Réalisations (et toute image `data-pqr-native-image`) | le panneau natif « Image » d'Odoo expose Shape, Filter, Padding, Animation, Effect, Trigger… — rien n'empêche un rédacteur de poser un filtre ou une animation hors design | **2026-09-09, owner : VOULU là où l'image est marquée native. Pas de correctif** |

## Méthode pour chaque cas

1. Rejouer le rouge : `PQR_QA_REUSE=1 npm run odoo:qa:edition -- --only <bloc>` sur l'instance `piqueray-odoo-qa-edition` (8111).
2. Trancher : bloc, config, ou les deux (colonne Décision, datée).
3. Corriger dans la source manuelle (QWeb, `authoring.js`, options, config) — jamais `generated/`.
4. Rejouer : vert daté ici + statut 🟢. Portes : `odoo:authoring:check`, `odoo:module:check`, `odoo:derivation:check`, `tsc` Odoo.

## Journal

- 2026-09-09 (soir, suite) — passe à l'œil des 4 autres pages : EB-019 confirmé sur Contact avec sa cause, EB-026/027/029/030/031 neufs (voir la section dédiée).
- 2026-09-09 (soir) — TDD rouge → vert sur 8113 : **EB-004 🟢, EB-009 🟢, EB-001 🟢** (Réalisations : `ODOO-038-REALISATIONS-{OPTIONS,PANEL,REPEAT,MEDIA}`, 23 panneaux Figma, schéma du registre étendu à `ds.realisations`). EB-003 et EB-007 en `fixed-by-composition` (owner : normal). EB-005 et EB-008 étaient des artefacts de l'instrument (bloc seul → pas de poignée `move` ; `aria-label` sur une vidéo). Porte `odoo:authoring:check` rouge **à cause de l'autre session** (reassurances 2.2.1 en cours, config épinglée 2.2.0) — pas de ce chantier.

- 2026-09-09 (après-midi) — passe à l'œil sur la home (8109) : 3 cas neufs (EB-020 à EB-023), EB-002 reformulé, instrument corrigé (frappe auto-vérifiée, verrous en session à part, instance à soi). Colima s'est arrêté en cours de route (charge 81, Spotlight) ; relancé.
- 2026-09-09 — instrument livré, 18 cas, aucun correctif encore. Deux échecs « entrée éditeur » de la suite complète étaient transitoires (rejoués : 17 s). Une autre session travaille dans ce worktree (hero 3.2.0) : ne rien committer d'autre que ces fichiers.
