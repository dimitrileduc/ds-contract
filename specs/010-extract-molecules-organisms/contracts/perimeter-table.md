# Interface Contract — Table de périmètre (US5, FR-010..016, SC-005)

**Règle de compte** : contractualisés + exclus nommés + doublons nommés = total des composants du
fichier Figma. Cible : 7 existants + 27 nouveaux = **34** ; tout écart est nommé et justifié
(FR-016). Rapprochement par clé de composant, jamais par nom d'affichage (FR-006).

## A. À contractualiser — 27 (ordonnés par lot, research D5)

Légende audit : reçu réutilisé (research D4) · caveat déjà nommé dans les artefacts 003/005/007.
Légende archive : match demo-51 (research D9) — voler/rejeter avec motif à la review.

| # | Composant (Figma ↔ code) | Page DS → category | Lot | Audit réutilisé + caveat | Inspiration archive |
|---|---|---|---|---|---|
| 1 | MemberPicture ↔ MemberPicture | Atomes → `atom` | L1 | 005 L3/L4 | ✅ `ds.avatar` (initiales vs photo = décision de modélisation) |
| 2 | PiquerayLogo ↔ PiquerayLogo | Atomes → `atom` | L1 | 005 L1/L4 | ❌ aucun (first-of-its-kind ; cousin mécanique `ds.heading.elementByProp` si rendu contextuel) |
| 3 | AccordionRow ↔ AccordionRow | Molécules → `molecule` | L2 | 003 + 005 L2 + 007 (asymétrie Ouvert nommée) | ✅ `ds.accordion-item` (enum d'état + icône `{state}`) |
| 4 | Avantage (= Contact-info-row) ↔ Avantage | Molécules → `molecule` | L2 | 003 (pixel 4/4 complet) | 🟡 `ds.card`/`ds.empty-state` (rejeter actions si pas de CTA) |
| 5 | CarouselControls ↔ CarouselControls | Molécules → `molecule` | L2 | 003 (byte-exact) | 🟡 `ds.pagination` (icônes fixes prev/next = forme 006) |
| 6 | Carte ↔ Carte | Molécules → `molecule` | L2 | 003 + 007 — **résidu canvas 3 488 px (nommé)** | ✅ `ds.card` |
| 7 | Copyright ↔ Copyright | Molécules → `molecule` | L2 | 003 + 005 L2 | 🟡 faible (`ds.metadata-list-item` ; probablement simple part texte) |
| 8 | Field ↔ Field | Molécules → `molecule` | L2 | 003 + 007 | ✅ `ds.field` — **décision slot `Saisie` nommée à la review (D8/D9.3)** |
| 9 | FooterColumn ↔ FooterColumn | Molécules → `molecule` | L2 | 003 + 005 L2 | 🟡 `ds.list` (collection de liens) |
| 10 | NavItem ↔ NavItem | Molécules → `molecule` | L2 | 005 L4 (créé là) — **dette item 8 ouverte (nommée)** | ✅ `ds.top-nav-item` |
| 11 | ProductCard ↔ ProductCard | Molécules → `molecule` | L2 | 003 + 005 L3 (BOOLEAN Bouton officialisé) | 🟡 `ds.card` (+ delta image/prix) |
| 12 | Realisation (= Gallery-item) ↔ Realisation | Molécules → `molecule` | L2 | 003 (3/3 byte-exact) + 005 ménage | 🟡 `ds.card` (+ delta média) |
| 13 | SectionHeader ↔ SectionHeader | Molécules → `molecule` | L2 | 003 + 005 V5/cycle 14 — rename `Accroche2` en attente (nommé) | ✅ `ds.heading` (`elementByProp` si niveau variable) |
| 14 | Tab ↔ Tab | Molécules → `molecule` | L2 | 003 (9/9) + 005 L3/V7 | ✅ `ds.tab` (enum d'état) |
| 15 | MemberCard ↔ MemberCard | Molécules → `molecule` | L3 (compose MemberPicture) | 003 (pixel complet) | 🟡 `ds.card`+`ds.avatar` (ref component) |
| 16 | Coordonnees ↔ Coordonnees | Organisms → `section` | L4 | 003 + 005 L5 (rollback byte-exact nommé) — **résidu 88 px (nommé)** | 🟡 `ds.metadata-list` (+ icônes phone/mail → FR-014a) |
| 17 | Devis ↔ Devis | Organisms → `section` | L4 | 003 + 005 V2/ménage | 🟡 `ds.banner` (rejeter `role=alert` si CTA marketing) |
| 18 | Hero ↔ Hero | Organisms → `section` | L4 | 003 + 005 L1 | 🟡 `ds.banner`/`ds.section` |
| 19 | Presentation ↔ Presentation | Organisms → `section` | L4 | 003 + 005 L5 | 🟡 `ds.section`/`ds.blockquote` |
| 20 | SAV ↔ SAV | Organisms → `section` | L4 | 003 + 005 V3/cycle 14 | 🟡 faible (`ds.empty-state` : slot icône + actions bouton) |
| 21 | TexteSEO ↔ TexteSEO | Organisms → `section` | L4 | 003 + 005 cycle 14 — **résidu 3 351 px + dette rich-text B1 (nommés)** | 🟡 faible (prose riche sans précédent demo) |
| 22 | Equipe ↔ Equipe | Organisms → `section` | L5 (compose MemberCard/MemberPicture) | 003 (byte-identical légitime 1/1) | 🟡 `ds.avatar-group` — **rejeter overlap** ; collection = `repeat` (006), pas de slot demo |
| 23 | FAQ ↔ FAQ | Organisms → `section` | L5 (compose AccordionRow) | 003 (2/4, cause racine nommée) | 🟡 item = `ds.accordion-item` ; **conteneur ❌ → `repeat` 006** |
| 24 | Footer ↔ Footer | Organisms → `section` | L5 (compose FooterColumn, PiquerayLogo, icônes) | 003 + 005 V6 (rebuild complet) | 🟡 `ds.top-nav` (régions) |
| 25 | Formulaire ↔ Formulaire | Organisms → `section` | L5 (compose Field + atomes) | 003 + 005 L5 + 007 | 🟡 `ds.field` + atomes 004 |
| 26 | Header ↔ Header | Organisms → `section` | L5 (compose NavItem + PiquerayLogo) | 005 V1/L4 — partage dette item 8 | ✅ `ds.top-nav` |
| 27 | Reassurances ↔ Reassurances | Organisms → `section` | L5 (compose Carte ?) | 003 + 005 V4/cycle 14 | 🟡 `ds.list`/`ds.card` ; collection → `repeat` si homogène |

Les dépendances exactes (colonnes « compose ») sont **confirmées à la lecture des propositions** à
l'adoption ; une dépendance surprise déplace le composant au lot suivant (nommé au journal).

## B. Déjà contractualisés — 7

| Composant | Contrat | Catégorie |
|---|---|---|
| Button / Checkbox / Input / Select / Textarea | `ds.button`, `ds.checkbox`, `ds.input`, `ds.select`, `ds.textarea` | `atom` |
| ReviewCard / GoogleReviews | `ds.review-card`, `ds.google-reviews` | `molecule` / `section` |

## C. Exclus — motif par composant (FR-013, FR-014)

| Composant | Motif (par organisme, research D7) | Report |
|---|---|---|
| **HeroVideo** | `embed` — contenu vidéo externe sans vocabulaire schéma/émetteur ; image fills elles-mêmes limite nommée ouverte (A5/a.7) | future itération |
| **Realisations** | `grid` — grille 2D native non contractable (reçu 003 ; `display` schéma = flex seulement) | future itération |
| **ProduitsECommerce** | `grid` — grille 2D de cartes produit (même absence de capacité) | future itération |
| **CategoriesPrincipales** | `grid` — grille 2D de cartes catégorie (même absence) | future itération |
| **19 icônes seules** (ArrowLeft, ArrowRight, Cart, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Download, ExternalLink, Facebook, Instagram, Mail, Pdf, Phone, Search, User, Etoile, OcticonChevronDown12, Piqueray) | instances, pas composants à contracter — relèvent du registre gouverné (`contracts/icons.registry.json`, 19 entrées après FR-014a) | — |

## D. Doublons — motif nommé (FR-015)

| Composant | Motif |
|---|---|
| **Bouton** (français, page Atomes) | doublon de `ds.button` déjà contractualisé — rapprochement par clé de composant (leçon 002) |

## E. Règles de tenue de la table

1. Aucun composant orphelin non décidé (SC-005) — tout nouveau composant découvert sur le canvas
   entre ici avec statut tranché + motif.
2. Un composant reclassé (ex. « molécule simple » s'avère porter un grid) migre de A vers C avec
   motif **par organisme** — le compte 34 est ajusté et justifié (FR-016) ; le compte vivant des
   outils fait foi (FR-019).
3. Le doublon accent-manglé d'une proposition (ex. `coordonn-es`) n'est PAS une ligne : la dédup
   par clé est couverte par research D1.
