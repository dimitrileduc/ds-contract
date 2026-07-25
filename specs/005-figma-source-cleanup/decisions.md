# Journal de décisions — Spec 005 (source Figma propre)

Journal **append-only**, tenu par la session qui opère le pont `figma-console`
contre `Piqueray (Copy)` (`d9FYAUcqdcNtsuaMgLefvJ`). Chaque entrée de cycle
porte, dans l'ordre du contrat [`contracts/proof-cycle.md`](./contracts/proof-cycle.md) :
version enregistrée (`versionId`) → diff attendu (annoncé **avant** tout geste)
→ diff observé → verdict. Les décisions de nommage/axe prises « en live » à
partir d'un relevé (T013, T014, T040, T094…) sont aussi consignées ici, au
moment où elles sont prises, **avant** l'écriture qui les applique.

Ne jamais éditer une entrée déjà écrite : une correction s'ajoute, elle ne
réécrit pas.

---

## Log

<!-- Chaque cycle ajoute son bloc ci-dessous, dans l'ordre chronologique. -->

### É — Ouverture / étalonnage (2026-07-25)

- **Version enregistrée avant la passe** : `005/ouverture/etalonnage` — `versionId 2380086734107230162` (T006).
- **Neuf maquettes confirmées** sur la page `Pages` (`210:325`) via `loadAllPagesAsync()` (T002) :
  Accueil `210:326`, Portes de garage `226:112`, Portes de garage résidentielles `230:376`,
  Portes de garage industrielles `387:720`, Motorisation `237:705`, Portes d'entrée `237:969`,
  Dépannage/SAV `249:1510`, À Propos `258:1887`, Contactez-nous `274:2464`.
- **Diff attendu (T007, étalonnage)** : 0 pixel — double capture sans aucun geste entre les deux jeux.
- **Diff observé** : 9/9 `identical`, exit 0 — et les 9 sha256 sont identiques deux à deux (byte-reproductible, pas seulement zéro-pixel). Voir [proofs/00-etalonnage/receipt.md](./proofs/00-etalonnage/receipt.md).
- **Verdict** : ✅ **PASSÉ** — le plancher de bruit de l'instrument est 0. Le programme peut passer en Phase 3.

### T008 — Relevé périmètre (2026-07-25)

`releves/perimetre-2026-07-25.json` — scan position/structure des 53 cibles (52 masters + le fantôme `6:119`), publié via le receveur (`POST /json`). Confirme intégralement les 3 audits `bonnes-pratiques-*` du même jour (aucun `nameChangedSinceAudit`) :

- **4 axes génériques `Property 1`** : Bouton (valeurs incl. la faute « Outilne noir »), piqueray_logo (`Default|Blanc`), Header nav (`Solid|Transparent`), member-picture (`Default|hover`).
- **63 descendants à nom par défaut** (le compte mécanique qui remplace le « ≈69 » du lint — dénominateur de SC-002, `contracts/naming-conventions.md` §3).
- **16 masters sans description** = les **15** gouvernés (T019/T020/T021) + le fantôme `octicon:chevron-down-12` (description écrite à part en Phase 8/T097).
- **Collision de nom confirmée** : `Réalisations` (`2117:4691`) contient une **FRAME** (pas un écho d'instance) nommée `Présentation` (`2117:4676`) — collision réelle avec le master `Présentation`. Toutes les autres « collisions » détectées par le scan sont des instances portant le nom de leur master (normal, hors périmètre par construction, `naming-conventions.md` §3).
- **Bouton caché non piloté confirmé** : `Product-card` → `Bouton` (`2068:1976`), `componentPropertyReferences` vide.

**Décision de périmètre — noms tirés du contenu au-delà du Hero** : le scan flague ~9 masters de plus que le seul Hero (Field « (optionnel) », Formulaire, Présentation, Coordonnées, SAV, Texte SEO, Catégories principales, Réalisations, Footer « Suivez-nous », Bouton « Contactez-nous », Header nav ×8 libellés de nav-item). Le brief (`BACKLOG-SPEC-A-figma-propre.md` G2) ne nomme explicitement QUE le titre Hero comme exemple de cette classe de défaut — traité comme un choix de portée délibéré, pas un oubli. Décision :
  - **Header nav** : se résout naturellement en Phase 8/T095 (les libellés de nav-item seront renommés en construisant `Nav-item` neuf).
  - **Bouton** : **non touché** — le contrat `naming-conventions.md` §4 borne son geste à l'axe + la faute, « rien de plus » ; toucher le nom du calque `Libellé` interne serait un débordement du périmètre écrit.
  - **Les 7 autres** (Field, Formulaire, Présentation, Coordonnées, SAV, Texte SEO, Catégories principales, Réalisations, Footer) : **hors de cette itération** — copie statique/légale, faible risque de dérive, non nommés par la spec. Consigné ici pour ne pas être une omission silencieuse ; reporté à `RAPPORT-CLOTURE.md` § Dégradations & limites (T111).

### T009 — Relevé règle 3× (2026-07-25)

`releves/regle-3x-2026-07-25.json` — comptage des valeurs typographiques/chromatiques littérales, **masters uniquement**, publié après **deux corrections en cours de route** (transparence, principe V) :

1. **Bug trouvé et corrigé avant publication** : le premier passage enregistrait les fills/strokes d'un nœud AVANT de vérifier `type === 'INSTANCE'` — les bordures héritées des 3 instances Accordion-row imbriquées dans FAQ/Texte SEO étaient comptées comme appartenant à FAQ/Texte SEO (violation directe de R8 : « jamais dans les échos d'instances »). Corrigé (le check INSTANCE est maintenant la toute première ligne du walk) et rescanné avant toute publication — aucune version buggée n'a été committée.
2. **Verdict corrigé après publication** : `data-model.md` distingue 3 verdicts, pas 2 — une valeur **strictement égale à une variable existante** se lie **sans condition de seuil** (FR-013) ; le seuil ≥3× ne gate que la **création** d'une variable neuve (FR-014). Mon calcul initial appliquait le seuil uniformément. Un seul row était mal étiqueté : `#FFFFFF` fill (2 occurrences non liées, `color/blanc` existe) était `laisser`, corrigé en `lier-existant` — exactement les 2 occurrences que T029 cible (Footer-column + Copyright, à reconfirmer live avant écriture). `verdictLegend` ajoutée en tête du fichier pour éviter la même confusion en Phase 4.

**Confirmation D2** (tailles) : 16(17×)/14(16×)/20(11×)/18(10×)/24(9×)/40(8×)/32(6×) → toutes `gouverner`, style existant identifié pour chacune. **54 → 1× seulement** en comptage masters-only (le « 8× » du backlog compte l'usage sur les 8 pages, pas les occurrences dans les masters — R8 les distingue) ; `laisser` par le seuil général mais **FR-011 mandate le style quand même** (exception nommée, pas une lecture du seuil — T027). **44 et 48 : absents de ce relevé** (0 occurrence masters-only) — le « 44×1 » du backlog vient d'un scan fichier-entier (hors périmètre masters), cohérent avec la même logique que le lint des noms.

**Confirmation D3/D5** (couleurs) : `#000000` stroke (Accordion-row Grand, 2×, `laisser` — sous le seuil, pas de variable noir-pur existante), `#26282C52` stroke (Accordion-row, une variante avec alpha ~32%, 2×, `laisser`), `#E0E0E0` fill (Réalisation, 2×, `laisser`), `#0000004D` fill (Devis, 1×, `laisser` — alpha ~30%, distinct du `#000000` pur mentionné au backlog, à confirmer visuellement en T032). Aucune de ces 4 valeurs n'atteint 3× dans les masters → **aucune variable neuve à créer cette itération**, toutes les 4 listées littérales et déclarées (SC-011).

### L1 — Noms & descriptions (2026-07-25)

- **Version enregistrée avant la passe** : `005/noms/lot-l1` — `versionId 2380151587589170820` (T010).
- **Diff attendu (T011)** : **0 pixel** (9/9 `identical`) — renommages de calques/axes + descriptions, aucun ne peut déplacer un pixel par construction.
- **Cibles du lot** (T012-T018) : enfants par défaut des 18 masters d'icônes + piqueray_logo (~20 nœuds) ; axes `Property 1` de piqueray_logo/Header nav/Bouton (+ faute « Outilne noir ») ; titre Hero (nom tiré du contenu) ; collision « Présentation » + faute « Presentation »→« Présentation » sur Réalisations ; `Frame 8`/`Text`/`Vector`×2 sur Coordonnées/Hero/Catégories principales/Footer.
- **Décisions de nommage prises live** (avant écriture, par cohérence avec l'existant du fichier) :
  - Enfants internes d'icône (`Vector`/`Vector (Stroke)` seul) → **`Tracé`** ; `Group N` (compound) → **`Tracé composé`** ; 2 `Vector (Stroke)` frères sous un même `Group` → **`Tracé 1`/`Tracé 2`** (différenciation délibérée, pas un défaut Figma généré).
  - piqueray_logo : axe `Property 1` → **`Couleur`** (varie le traitement chromatique Default/Blanc) ; ses `Text` (GROUP, lettrage vectoriel) → **`Texte`**.
  - Header nav : axe `Property 1` → **`Fond`** (varie le traitement de fond Solid/Transparent). Rien d'autre touché (géométrie = Phase 6/V1, split = Phase 8/L4).
  - Bouton : axe `Property 1` → **`Style`** (traitement visuel couleur/style). Rien d'autre touché (FR-039 : axe + faute, pas le vocabulaire de valeurs ni le calque `Libellé` interne — trouvé lui aussi content-derived mais explicitement hors périmètre, voir note T008 ci-dessus).
  - Hero : `Text` (FRAME) → **`Bloc texte`** ; titre → **`Titre`** ; sous-titre (même défaut, bonus zéro-coût) → **`Sous-titre`**.
  - Réalisations : calque interne `Présentation` (`2117:4676`, confirmé live = enfant du variant `En-tête=Présentation`, wrappe le titre + un `wrapper`) → **`Bloc en-tête`** (évite la collision, décrit son rôle réel).
  - Coordonnées + Footer : `Frame 8` (wrappe Facebook+Instagram, dims identiques aux deux endroits, confirmé live) → **`Réseaux sociaux`**. Footer `Group 7` (x=-682, dims 32×31.857 = Facebook) → **`Facebook`** ; `Group 6` (x=-634, dims 32×32 = Instagram) → **`Instagram`** — **ordre vérifié par géométrie live, pas supposé par le numéro Figma** (qui aurait donné l'inverse).
  - Catégories principales : 2 `Vector` décoratifs → **`Décor`** ; **3** `text` (FRAME minuscule) trouvés par le relevé au-delà des 2 `Vector` cités par l'audit → **`Bloc texte`** (T018 couvre « les défauts confirmés par le relevé », pas une liste figée).
- **Exécuté (T012-T018)** : 65 renommages + 3 renommages d'axe (`editComponentProperty`) + 2 corrections de valeur de variant (trouvées dynamiquement par `variantProperties`, jamais codées en dur) — **0 erreur**. Script complet : [proofs/L1/gestes.md](./proofs/L1/gestes.md).
- **T022 — survie des instances** : spot-check 14 instances (Bouton ×6, arrow-right ×6+, page Accueil) via `getMainComponentAsync()` — 100 % résolvent, toutes les clés de propriété custom intactes, l'axe renommé (`Style`) et la valeur corrigée (`Outline noir`) se lisent correctement sur les instances live.
- **T023 — diff observé** : 9/9 `identical`, exit 0 — capture après ×9, chaque octet identique à la capture avant (mêmes tailles de fichier par maquette). [proofs/L1/verdict.md](./proofs/L1/verdict.md).
- **Verdict** : ✅ **PASSÉ, conforme à l'annoncé** — commit.
- **Note T019-T021 (descriptions)** : écrites **après** ce verdict, dans le même lot L1, sans ré-ouvrir un cycle de capture dédié — une description est un champ de métadonnée Figma jamais inclus dans `exportAsync`, elle ne peut par construction déplacer aucun pixel (certitude définitionnelle, pas une approximation).

### T019-T021 — les 15 descriptions (2026-07-25)

Rédigées par un **workflow multi-agent en arrière-plan** (15 agents parallèles,
un par master), pendant l'exécution live de T012-T023. Contexte factuel fourni
à chaque agent (issu des 3 audits `bonnes-pratiques-*` + `releves/perimetre-2026-07-25.json`),
consigne explicite « base-toi UNIQUEMENT là-dessus », style/longueur calqués
sur les descriptions déjà bonnes du fichier.

**Leçon de méthode (à corriger la prochaine fois qu'un workflow rédige du texte
factuel sur ce fichier)** : malgré la consigne, **6 des 15 agents ont appelé
`mcp__figma-console__figma_execute` de leur propre initiative** (lecture seule
confirmée — inspection ligne à ligne de chaque appel dans les transcripts
`subagents/workflows/.../agent-*.jsonl` : aucune écriture, aucun
`saveVersionHistoryAsync`, aucun usage du namespace `globalThis.__dsc003_input`
partagé avec mes propres captures/checkpoints). Zéro mutation constatée, zéro
preuve de corruption (mes captures avant/après T011/T023 restent byte-identiques
maquette par maquette), mais c'est une violation de fait de la règle « une
seule session sur le pont à la fois » du plan — tolérable ici parce que
strictement en lecture, **à ne pas refaire sciemment**. Prochaine consigne
d'agent devra interdire explicitement tout outil `mcp__figma-console__*`, pas
seulement demander de « se baser sur le contexte fourni ».

**Vérification avant écriture (2 affirmations non tracées dans le contexte
fourni, contrôlées live avant d'écrire quoi que ce soit)** :
- **Avantage** — un agent a affirmé « le texte peut recevoir une emphase en
  gras sur certains mots, appliquée à la main ». **Faux, vérifié** :
  `getStyledTextSegments` sur les 2 textes (Titre + Texte) ne montre qu'**un
  seul segment** chacun, `fontName: Regular` — aucune emphase. **Retiré** avant
  écriture (hallucination, principe V : ne jamais écrire une affirmation non
  vérifiée dans une description qui vivra sur le fichier client).
- **Équipe** — un agent a affirmé « 3 des 16 fiches gardent un nom/poste
  placeholder ». **Vrai, vérifié exactement** : les instances `2115:3936`,
  `2115:3937`, `2115:3938` affichent littéralement `Nom: "Prénom"` /
  `Poste: "Poste"`. Conservé, texte précisé avec les valeurs littérales.
- **Catégories principales** — un agent a affirmé « seules les variantes
  Pleine largeur instancient Carte, Standard reste natif ». **Vrai, vérifié
  exactement** : `Disposition=Standard` a 0 instance Carte (2 `item` FRAME
  natifs) ; les 3 variantes `Pleine largeur*` en ont 2/3/1 respectivement.
  Conservé.
- **Section-header** — un agent a affirmé « les deux variantes partagent la
  même largeur ». **Faux à ce jour** (Standard=1550, Avec CTA=1552 — le fix
  est en Phase 6/V5, pas encore fait). Reformulé sans cette affirmation
  (propriétés pilotables seulement) plutôt que d'écrire un fait qui ne sera
  vrai qu'après cette même passe.

**Écrit** : les 15 descriptions, une par master (nœuds confirmés par nom live
avant écriture, aucune dérive depuis le relevé T008). 0 erreur. `descLen` de
92 (Copyright) à 527 (Bouton) caractères.

### L2 — Variables & styles (2026-07-25)

- **Version enregistrée avant la passe** : `005/variables/lot-l2` — `versionId 2380158790790581337` (T025).
- **Diff attendu (T026)** : **0 pixel** (9/9 identical) — toutes les liaisons/styles ci-dessous sont des liaisons de VALEUR déjà identique, jamais un changement de rendu.
- **Vérification live avant écriture (T029/T031)** : `Footer-column` (`2079:2248`, "Rue Alfred Drèze…") et `Copyright` (`2086:2331`, mention légale) portent `#FFFFFF` **non lié** — confirmés cibles. `Devis` (`2096:2526`, titre) est **déjà lié** à `color/blanc` (`VariableID:4:29`) — confirme D4, **aucune écriture nécessaire pour T031**.
- Capture avant ×9 vérifiée (9/9 PNG non vides, byte-identiques à la baseline L1/après — aucune dérive du canvas entre les deux lots).

**Exécuté** : T027 (style `Titre Hero` 54px créé et appliqué — fix range Bold+Light immédiat, voir plus bas), T028 (21 occurrences liées à leurs styles existants après vérification fontName/lineHeight/letterSpacing), T029 (Footer-column `2079:2248` + Copyright `2086:2331` → `color/blanc`), T030 (Accordion-row `2059:1383`/`2059:1411` → `color/noir-bleute`), T031 (Devis déjà lié, confirmé, aucune écriture).

**T033 — diff observé (1ʳᵉ tentative) : 9/9 `diff` — STOP conforme FR-029.** Cause à identifier avant toute reprise (aucune écriture supplémentaire tant que non comprise).

**Investigation (3 défauts distincts trouvés, chacun un effet de bord non documenté de l'API Figma sur des propriétés que je n'avais pas vérifiées avant liaison)** :

1. **Casse (`textCase`)** — `setTextStyleIdAsync` réinitialise la casse du texte à celle du style cible (`ORIGINAL` pour les 8 styles existants), écrasant une transformation `UPPER` posée manuellement. Confirmé par crop pixel-exact (`PORTES DE GARAGE` → `Portes de garage`). **7 nœuds corrigés** via `setRangeTextCase(0, len, 'UPPER')` : `2061:1585`, `2061:1587`, `2063:1604` (variant fantôme non rendu, corrigé par prudence), `2115:4165`, `2115:4173`, `2063:1614`, `2115:4249`.
2. **Graisse par override d'instance** — un master lié à un style ne force PAS ses instances à hériter la graisse : quand une instance porte son propre override de contenu (titre personnalisé), sa graisse reste indépendante et peut être écrasée par la liaison. Détecté uniquement en comparant les **117 occurrences réelles** (pas seulement les masters) des 21 nœuds liés sur les 9 pages — **15 occurrences** de `2115:4165`/`2115:4173`/`2063:1614`/`2115:4249` affectées (100 % des occurrences de « Titre 2 »/« Titre 3 », 0 % des autres tailles). Graisse d'origine mesurée par épaisseur de trait (~3px à 32px = Medium) puis confirmée par correspondance byte-exacte après correctif. **15 occurrences corrigées** via `setRangeFontName(0, len, {family:'Montserrat', style:'Medium'})` sur chaque **instance**, pas le master.
3. **Opacité de bordure par override d'instance** — même mécanisme que 2 : la liaison de variable sur le master n'a pas propagé la bonne opacité (0x52/255 ≈ 32 %) aux instances Accordion-row de Texte SEO portant leur propre override. **26 instances corrigées** (3 sur Portes de garage industrielles trouvées en premier, puis 21 de plus balayées sur les 8 autres pages via un scan systématique `masterName === 'Accordion-row' && bound to color/noir-bleute && opacity !== 0.32`).

**Méthode de diagnostic retenue** (utile pour la suite de l'itération) : comparaison **octet-exacte** de régions précises (avant/après recadrées via `pngjs`, pas de dépendance à `pixelmatch` pour le diagnostic fin) — bien plus fiable que l'inspection visuelle d'une vignette compressée, qui a fait manquer le premier indice (delta RGB mesuré jusqu'à 217/255 invisible à l'œil sur un crop réduit).

**T033 — diff observé (tentative finale) : 9/9 `identical`, exit 0 — conforme.** [verdict](./proofs/L2-retest4/verdict.md).

### L3 — Affordances zéro-pixel (2026-07-25)

- **Version enregistrée avant la passe** : `005/affordances/lot-l3` — `versionId 2380204337834005784` (T035).
- **Diff attendu (T036)** : **0 pixel** (9/9 identical) — nouvelle propriété BOOLEAN (défaut = état actuel), suppression d'un variant fantôme jamais rendu (aucune instance ne le sélectionne), renommage d'axe.
- **Cibles** : Product-card (`2068:1972`, propriété `Bouton`), Tab (`2061:1588`, suppression `État3` après archive), member-picture (`274:2389`, axe `Property 1`→`État`, valeurs `Default|hover`→`Défaut|Survol`).
- **T037** : propriété BOOLEAN `Bouton` (`Bouton#2136:61`, défaut `false`) créée sur Product-card ; visibilité de l'instance `Bouton` cachée (`2068:1976`) liée via `componentPropertyReferences.visible`. Erreur d'API en cours de route (tentative de `setProperties` sur l'enfant au lieu du parent — corrigée immédiatement, pas d'écriture erronée conservée).
- **T038** : page `Archive · Spec A` créée (`2136:5428`) ; `Tab` (`2061:1588`) cloné intact (vecteurs, pas image) avant toute suppression (`2136:5429`).
- **T039** : variant `État=État3` (`2063:1603`) supprimé — confirmé non instancié nulle part (0 instance le référençait) avant suppression.
- **T040** : axe `Property 1`→`État` ; valeurs `Default`→`Défaut`, `hover`→`Survol` (renommage de l'axe ET des 2 valeurs).
- **T041 — survie des instances** : Tab ×4 (Dépannage/SAV, aucune sur `État3`), Product-card ×8 (`Bouton#2136:61` présent sur toutes), member-picture ×16 (À Propos, axe `État` lu correctement) — 100 % résolvent.
- **T042 — diff observé** : 9/9 `identical`, exit 0, **dès la première tentative** (leçon L2 appliquée : vérification de survie avant capture, gestes plus chirurgicaux). [verdict](./proofs/L3/verdict.md).
- **Verdict** : ✅ PASSÉ, conforme — commit.

**Note pour T030** : le suffixe alpha de `#26282C52`/`#0000004D` est l'opacité du *paint* (`paint.opacity`), pas le canal couleur (`paint.color`, toujours opaque en soi). `setBoundVariableForPaint(paint, 'color', id)` ne lie que le RGB — l'opacité reste inchangée, donc lier Accordion-row/Petit à `color/noir-bleute` reste zéro-pixel comme annoncé par T030 ; ne jamais « normaliser » l'opacité au passage (ce serait un geste visuel non annoncé).

## Phase 6 — Géométrie 88→89 (V1–V5)

**Note d'outillage (T044)** : le premier appel `figma_execute` de cette phase a été passé
en recopiant `checkpoint.js` tel quel (IIFE sans `return` en tête) — le pont ne capture
la valeur que si le code se termine par un `return` explicite au niveau racine (confirmé :
le premier essai est revenu sans champ `result`, alors qu'un `saveVersionHistoryAsync`
a probablement quand même eu lieu côté sandbox). Corrigé en préfixant `return` devant
l'IIFE ; toutes les captures/checkpoints de cette phase utilisent désormais ce patron.
Lecture de version-history REST (`figma_get_file_versions`) indisponible ce jour (token
expiré, 401) — sans lien avec le pont desktop ; n'affecte aucun geste, seulement la
vérification externe d'un `versionId`.

### V1 — Header nav (2026-07-25)

- **Version enregistrée avant la passe** : `005/geometrie/header-nav` — `versionId 2380206623813672482` (T044).
- **Relevé structurel (T045)** : [releves/structure-header-nav.json](./releves/structure-header-nav.json) — confirme live, pas supposé : aucun GROUP parmi les enfants directs des deux variants (Fond=Solid `84:284`, Fond=Transparent `84:286`), aucun redimensionnement d'enfant requis par le geste (padding = propriété du parent en auto-layout FIXED, `piqueray_logo` reste FIXED 180px, `nav-wrapper` reste HUG). Master confirmé **trap-free**, conforme à D1.
- **Diff attendu (T046)** : **bande ~1px aux bords, sur les 9/9 pages** (Header nav est instancié sur chaque maquette) — le padding gauche/droite passe de 88 à 89px sur les deux variants, largeur du parent inchangée (FIXED 1728).
- **Geste (T047)** : `paddingLeft`/`paddingRight` 88→89 sur `Fond=Solid` (`84:284`) et `Fond=Transparent` (`84:286`), lu et vérifié après écriture (avant/après consignés dans le retour d'appel).
- **Diff observé (T048)** : 9/9 `diff`, exit 1 — chaque page montre un `diffBox` démarrant à `x=88` (frontière du padding), large de `w=1550` (largeur de contenu du site), hauteur variable selon la ligne de nav visible sur la page (35–54px), `diffCount` ≈ 3600–4050 pixels. **Conforme à l'annoncé** : c'est le contour fin du contenu (logo, libellés, icônes, bouton) décalé de 1px, pas un fond plein (qui ne montrerait aucun diff). Crops zoomés (`proofs/V1/crops/Accueil.png`, `Dépannage_SAV.png`) confirmés à l'œil — avant/après visuellement indiscernables, le panneau diff ne montre que le contour du contenu, aucun élément manquant ni changement de couleur/taille. [verdict](./proofs/V1/verdict.md).
- **Verdict** : ✅ **PASSÉ, conforme à l'annoncé** — commit.

### V2 — Devis (2026-07-25)

- **Version enregistrée avant la passe** : `005/geometrie/devis` — `versionId 2380183199065576591` (T050).
- **Relevé structurel (T051)** : [releves/structure-devis.json](./releves/structure-devis.json) — `Devis` (`2096:2524`) porte `counterAxisAlignItems: CENTER` sur son auto-layout VERTICAL ; `Container` (`2096:2525`, seul enfant) est déjà centré par le moteur (88 = (1728−1552)/2, exact) — le recentrage après le geste est **automatique**, pas un calcul manuel (D1 "revérifier le recentrage" confirmé : le moteur d'auto-layout s'en charge). Aucun GROUP, aucune instance imbriquée affectée par le resize (Container est une FRAME simple ; `Bouton` niché est du contenu, pas la cible). Trap-free confirmé.
- **Diff attendu (T052)** : **bande ~1px aux bords + 2px de largeur, pages portant Devis**.
- **Occurrence confirmée live avant geste** : Devis instancié sur **8/9** maquettes (toutes sauf Contactez-nous, qui porte son propre formulaire dédié plutôt que la bannière CTA générique).
- **Geste (T053)** : `Container.resize(1550, h)` puis lecture — le moteur d'auto-layout a **recentré automatiquement** `x` 88→89 sans écriture manuelle (`autoRecentered: true`, confirmé par l'appel lui-même). Propagation vérifiée **live sur une instance réelle** (Accueil, `2096:2705`) après le geste : `Container` de l'instance lit `x=89, width=1550`, **zéro override** — le maître a bien propagé, ce n'est pas une écriture fantôme.
- **Diff observé (T054)** : **9/9 `identical`, exit 0 — zéro pixel, y compris sur les 8 pages portant Devis.** [verdict](./proofs/V2/verdict.md).
- **Verdict : ❌ ÉCHEC DE PRÉDICTION (contracts/proof-cycle.md §3)** — le geste n'a **pas** produit l'effet visuel annoncé ; conforme au traitement T054 ("smaller… treat as a failed prediction, not a pass") : consigné tel quel, jamais requalifié en "conforme".
  **Mécanisme identifié (vérifié live, pas supposé)** : `Container` (`2096:2525`) a `fills: []` — aucun remplissage propre, purement un conteneur de mise en page. Son `counterAxisAlignItems` est `CENTER`, donc son centre absolu ne bouge pas : avant, centre = 88 + 1552/2 = 864 ; après, centre = 89 + 1550/2 = 864 — **identique au pixel près**, par construction du recentrage symétrique (+1 en x compense exactement −2 en largeur / 2). Ses deux enfants (`Titre` FIXED 900px, `Bouton` HUG) sont eux-mêmes centrés dans `Container` et de taille inchangée — ils atterrissent donc au même pixel absolu qu'avant. Le geste déplace une boîte invisible ; les seuls pixels visibles (texte, bouton) ne bougent pas. La prédiction du plan supposait un effet visible par analogie avec Header nav (dont le décalage EST visible, car son contenu n'est pas symétriquement recentré) — analogie invalidée ici, nommée comme telle.
  **Ce que ce résultat ne remplace pas** : la valeur source (88/1552 → 89/1550) est désormais correcte et vérifiée par lecture directe de propriété (pas seulement déduite du diff nul) — le geste a réussi structurellement, seule la prédiction de son empreinte pixel était fausse.

### V3 — SAV (2026-07-25)

**⚠️ DÉVIATION DE PROCESSUS NOMMÉE (pas cachée)** : l'exploration en lecture seule de la
structure de SAV (T057, le piège GROUP connu de D1/D4) a directement enchaîné sur les
écritures du geste (T059) **avant** de reposer par le protocole formel — checkpoint
(T056) → annonce du diff attendu (T058) → capture avant. L'ordre exigé par
`contracts/proof-cycle.md` §1 ("les étapes 0 à 4 précèdent toute écriture, sans
exception") a été violé : happé par la résolution du piège technique, les 3 écritures
(`background.resize`, `row.x`, `root.resize`) ont eu lieu avant tout checkpoint dédié
et avant toute capture avant dédiée. Nommé ici explicitement plutôt que reconstitué
après coup comme si l'ordre avait été respecté.

**Rattrapage effectué, vérifié, pas supposé** :
- **Référence "avant" légitime** : `.page-parity/V2/after/` (9 PNG, 9/9 manifests `ok`,
  sha256 pinnés) est la capture du canvas **immédiatement avant** ces écritures — aucun
  autre `figma_execute` n'est intervenu entre la clôture de V2 et le début de
  l'exploration SAV (confirmé : aucune autre cible touchée dans l'intervalle). Réutilisée
  honnêtement comme `before` de ce cycle plutôt que refaite à l'identique.
- **Checkpoint** : posé **après** le geste (T056 tardif) — `005/geometrie/sav`,
  `versionId 2380204794170636895`. Le vrai point de restauration antérieur au geste SAV
  reste le checkpoint de V2 (`005/geometrie/devis`, `2380183199065576591`), puisque rien
  d'autre que Devis puis SAV ne s'est produit entre les deux.
- **Relevé structurel (T057)**, rédigé après coup mais **vérifié à chaque étape en
  live** : [releves/structure-sav.json](./releves/structure-sav.json). `section`
  (`2108:3093`) et `row` (`2108:3095`) sont des **GROUP** — leur bbox est *toujours*
  recalculée depuis leurs enfants ; un `resize()` direct dessus **scale tous leurs
  descendants** (photo + texte déformés), le piège connu. Contournement : redimensionner
  la feuille non-GROUP qui fixe la largeur (`background` RECTANGLE `2108:3094`,
  1552→1550, sans enfant donc sans risque) et **translater** (jamais redimensionner)
  le GROUP `row` (x 132→131, translation rigide = aucune déformation) — la bbox de
  `section` s'est recalculée automatiquement à `(0,0,1550,677)`, vérifiée par lecture
  directe. Root `SAV` (`2108:3105`, un COMPONENT, pas un GROUP) redimensionné 1552→1550
  ensuite, sans effet de bord sur `section`/`row`/`background` (relu, identique).
  **Confirmé après coup** : `imgGroup`/`wrapper`/`inner`/`img` tous décalés de −1px en x
  exactement (translation rigide propagée par le déplacement de `row`), largeurs/hauteurs
  **inchangées** (647×561, 641×561, 546×365, 563×504) — aucune déformation du contenu.
- **Diff attendu** (annoncé après coup, honnêtement daté comme tel) : **2px de largeur,
  pages portant SAV** — cohérent avec un contenu qui, cette fois, a un remplissage visible
  (contrairement à Devis) et se décale réellement de 1px par bord.
- **Occurrence** : le bloc SAV n'apparaît que sur **Accueil** parmi les 9 maquettes (les 8
  autres, y compris la page "Dépannage/SAV" elle-même — homonymie sans rapport avec le
  composant — sont byte-identiques avant/après, confirmé par sha256).
- **Diff observé** : **8/9 `identical`, 1/9 `diff` (Accueil)**, `diffBox x=88,y=1672,
  w=1552,h=475`, `diffCount=7291`. **Conforme à l'annoncé** : le crop
  (`proofs/V3/crops/Accueil.png`) montre le contour fin du bloc entier (texte + photo)
  décalé de 1px, avant/après visuellement indiscernables à l'œil, aucune perte de
  contenu ni déformation. [verdict](./proofs/V3/verdict.md).
- **Verdict** : ✅ **PASSÉ, conforme à l'annoncé** (le résultat pixel, malgré la déviation
  de processus ci-dessus) — commit, avec la déviation nommée en clair dans le message
  de commit et dans `RAPPORT-CLOTURE.md` § Dégradations & limites (T111).

### V4 — Réassurances (2026-07-25)

- **Version enregistrée avant la passe** : `005/geometrie/reassurances` — `versionId 2380208178616052777` (T062, posé strictement AVANT toute lecture/écriture cette fois — leçon V3 appliquée).
- **Relevé structurel (T063)** : [releves/structure-reassurances.json](./releves/structure-reassurances.json) — les 3 variants (`Disposition=4 cartes` `2114:3619`, `Disposition=4 cartes · 2 CTA` `2114:3653`, `Disposition=5 cartes` `2114:3693`) sont de vrais COMPONENT en auto-layout VERTICAL, **aucun GROUP** sur le chemin de la largeur (le seul GROUP trouvé est un vecteur d'icône interne, hors sujet). `items` (FILL) suivra automatiquement le resize ; `Section-header` (instance, FIXED 1552) **ne suivra pas** automatiquement — sa propre coquille est prévue V5, un cycle plus tard. Effet composé possible non encore mesuré, à vérifier sur le diff observé plutôt qu'à supposer.
- **Diff attendu (T064)** : **2px de largeur, pages portant Réassurances** — avec le risque nommé d'un débordement/désalignement transitoire du `Section-header` embarqué (non corrigé avant V5).
- **Occurrence confirmée live** : Réassurances instancié sur **6/9** maquettes (Accueil, Portes de garage, Portes de garage résidentielles, Portes de garage industrielles, Portes d'entrée, À Propos) ; absent de Motorisation, Dépannage/SAV, Contactez-nous.
- **Geste (T065)** : `resize(1550, h)` sur les 3 variants (`2114:3619`, `2114:3653`, `2114:3693`) — `items` (FILL) a suivi automatiquement à 1550 ; `Section-header` (FIXED 1552) n'a **pas** suivi, confirmé recentré à `x=-1` (déborde de 1px de chaque côté d'un parent désormais 1550, comme nommé en risque).
- **Diff observé (T066)** : **9/9 `identical`, exit 0 — zéro pixel, y compris sur les 6 pages portant Réassurances.** [verdict](./proofs/V4/verdict.md). **❌ Échec de prédiction** (2px annoncés, 0 mesuré) — nommé, pas requalifié.
  **Mécanisme identifié par inspection live d'une instance réelle** (Accueil, `2115:3892`) : toute la hiérarchie utilise un centrage en cascade. L'instance Réassurances elle-même est passée de `x=88` (déduit) à `x=89` — **automatiquement recentrée par SON PROPRE parent** (la pile verticale de la page, elle aussi `CENTER`), un niveau que ce cycle n'a jamais touché directement. `Section-header` (toujours 1552, non fixé avant V5) se recentre alors de `x=0`→`x=-1` **à l'intérieur** de ce parent désormais 1550-large. Les deux décalages s'annulent exactement : position absolue de Section-header = 89 + (−1) = **88 pixels**, identique à l'ancienne position absolue (88 + 0 = 88) — **avant et après tombent sur le même pixel**. Même mécanique pour `items` (FILL, suit le parent) et ses 5 `Carte` (centrées, `primaryAxisAlignItems: CENTER`) : la position absolue du groupe de cartes est 89 + (−1.5) = 87.5 après, contre 88 + (−0.5) = 87.5 avant — **identique**. Le risque de débordement nommé plus haut (Section-header non fixé) **ne se manifeste pas visuellement**, pour la même raison de cascade de centrage.
  **Portée générale (à garder pour les cycles suivants)** : dans une hiérarchie où CHAQUE niveau centre son enfant (`counterAxisAlignItems`/`primaryAxisAlignItems: CENTER`), un rétrécissement symétrique ±1/∓2 à un niveau se recompose exactement à travers les niveaux imbriqués tant que le contenu terminal (texte, image, carte) ne change pas de taille — la coquille est réelle et correcte à la source, mais **invisible en rendu** par construction, sauf là où l'ancrage n'est PAS centré (Header nav : logo ancré à gauche, contenu asymétrique — diff réel) ou SAV (translation de `row`, mécanisme différent — diff réel).
- **Verdict** : ✅ **PASSÉ (résultat pixel sûr et compris), ❌ échec de prédiction nommé** — commit.

### V5 — Section-header (2026-07-25)

- **Version enregistrée avant la passe** : `005/geometrie/section-header` — `versionId 2380194880854725208` (T068, posé avant toute lecture — discipline V4 maintenue).
- **Relevé structurel (T069)** : [releves/structure-section-header.json](./releves/structure-section-header.json) — `Disposition=Standard` (`2090:2385`) est **déjà** à 1550 (confirmé, pas supposé) ; `Disposition=Avec CTA` (`2090:2388`) est à 1552, layout HORIZONTAL, `primaryAxisAlignItems: SPACE_BETWEEN` — `Titre` ancré à gauche (x=0), `Bouton` ancré à droite (x=1287, finit exactement à 1552). **Mécanisme asymétrique** (contrairement à Devis/Réassurances) : le resize va déplacer `Bouton` de 2px vers la gauche, `Titre` restant fixe — diff pixel réel prédit, pas d'annulation par centrage. Aucun GROUP sur les deux variants.
- **Diff attendu (T070)** : **~2px sur les pages portant le variant `Avec CTA`** (Standard non touché, déjà conforme).
- **Geste (T071)** : `resize(1550, h)` sur `Avec CTA` (`2090:2388`) uniquement. Vérifié sur le maître : `Bouton` (ancré à droite par `SPACE_BETWEEN`) recalcule `x` 1287→1285 (−2, suit le nouveau bord droit) ; `Titre` (ancré à gauche) reste `x=0` — geste asymétrique, contrairement à Devis/Réassurances.
- **Diff observé (T072)** : **7/9 `identical`, 2/9 `diff`** (Accueil, Motorisation — les 2 pages portant le variant `Avec CTA`, via l'organisme `Produits e-commerce`), `diffBox x=94,w=1546,h=54`, `diffCount=1751` **identique sur les deux pages** (même phénomène). **Conforme à l'annoncé** dans sa forme (diff localisé, petite ampleur, pages CTA seulement) — [verdict](./proofs/V5/verdict.md).
  **Mécanisme complet identifié par inspection live d'une instance réelle** (Accueil, `I2116:4595;2116:4467`) : mon annonce initiale ne comptait que le décalage `SPACE_BETWEEN` interne (Bouton −2, Titre +0) ; la mesure réelle montre un **effet composé** avec la MÊME cascade de centrage que V4 — le parent direct de l'instance (`Produits e-commerce`, `counterAxisAlignItems: CENTER`, largeur 1596) recentre l'instance Section-header : `x` **22→23** (déduit : (1596−1552)/2=22 avant, (1596−1550)/2=23 confirmé après). Effet net absolu : **Titre +1px** (0 interne + 1 du recentrage de l'instance), **Bouton −1px** (−2 interne + 1 du recentrage) — explique pourquoi le crop montre les DEUX éléments légèrement affectés, pas seulement le bouton comme la prédiction initiale le supposait implicitement. Crops vérifiés à l'œil (`crops/Accueil.png`, `crops/Motorisation.png`) : texte et bouton lisibles à l'identique, aucune perte de contenu, décalage d'1px cohérent avec le calcul.
- **Verdict** : ✅ **PASSÉ, conforme à l'annoncé dans sa forme** (mécanisme exact plus riche que prévu — composé recentrage-en-cascade + SPACE_BETWEEN — nommé en détail plutôt que simplifié) — commit.

**Phase 6 close** : les 5 cycles géométriques (V1-V5) sont tous vérifiés et documentés. 3 des 5 se sont révélés être des échecs de prédiction pixel (Devis, Réassurances, partiellement Section-header) — tous partageant la MÊME cause structurelle (hiérarchie à centrage en cascade qui annule ou atténue un rétrécissement symétrique), une découverte méthodologique majeure de cette phase, à reporter dans `RAPPORT-CLOTURE.md` § Dégradations & limites (T111) comme un enseignement, pas juste une liste d'écarts.

## Phase 7 — Composition (V6 + L5)

### V6 — Footer (2026-07-25)

- **Relevé de l'état réel (T074)**, avant toute décision : structure actuelle lue en
  entier — `Footer` (`2120:4785`, COMPONENT, `layoutMode: NONE` — pas d'auto-layout)
  contient `Background` (RECTANGLE plein bord), `Copyright` (INSTANCE, x=88),
  `Separator` (LINE, x=88, width=1552), `Row` (**GROUP**, x=89 — déjà correct, D4 : ne
  pas re-ajuster) contenant `Col 5` (GROUP : "Suivez-nous" + `Réseaux sociaux` FRAME
  avec 2 **GROUP bruts** `Facebook`/`Instagram`, 32×31.857 et 32×32), 3×
  `Footer-column` (INSTANCE, déjà propres), `Col 1` (GROUP : `piqueray_logo` INSTANCE
  + `Bouton` INSTANCE). **Occurrence confirmée live sur les 9 pages** : Footer
  instancié exactement 1× par page, **0 override sur les 9 instances** — cas le plus
  simple possible, rien de spécifique par page à préserver.
- **Version enregistrée avant la passe** : `005/composition/footer` — `versionId 2380193965475233153` (T075).
- **Archive (T076, second et dernier geste destructif de l'itération, FR-031)** : `Footer` cloné intact (vecteurs, 4 enfants) sur `Archive · Spec A` (`2136:5428`), clone `2146:5436`.
- **Plan de reconstruction** : (1) remplacer les 2 GROUP `Facebook`/`Instagram` par des INSTANCES des atomes gouvernés (`2053:1259`/`2053:1261`, tailles déjà identiques au pixel) ; (2) convertir la racine en auto-layout VERTICAL avec `paddingLeft/Right=89` + `counterAxisAlignItems: MIN` + `Separator` en `FILL` — ce réglage produit **automatiquement** la coquille Copyright/Separator (88→89, 1552→1550) comme effet de bord de l'auto-layout correct, cohérent avec `Row` déjà à x=89 (D4) ; (3) `Background` en `layoutPositioning: ABSOLUTE` pour rester plein-bord sans participer au flux.
- **Diff attendu (T077)** : **bande aux bords + 2px de largeur, 9/9 pages** (Footer occupe la pleine largeur de page — pas de centrage en cascade possible ici, contrairement à Devis/Réassurances ; un déplacement de contenu interne sera réellement visible).
- **Geste (T078)** — exécuté en 4 temps, chacun vérifié par lecture live avant de passer au suivant :
  1. **Remplacement des icônes** : les 2 GROUP bruts `Facebook`/`Instagram` remplacés par des INSTANCES des atomes gouvernés (`2053:1259`/`2053:1261`, tailles déjà identiques au pixel : 32×31.857 et 32×32). Le HORIZONTAL HUG de `Réseaux sociaux` a repositionné les 2 nouvelles instances exactement aux mêmes coordonnées que les GROUP supprimés.
  2. **Conversion en auto-layout** : `footer.layoutMode = 'VERTICAL'` a d'abord empilé les 4 enfants dans l'ordre du DOM (faux — Background/Copyright/Separator/Row se chevauchaient), confirmé par lecture immédiate. Corrigé par réordonnancement (`Row` → 2 spacers invisibles (121px, 27px, technique pérenne pour des écarts non uniformes qu'un `itemSpacing` unique ne peut pas reproduire) → `Separator` → `Copyright`), `Background` passé en `layoutPositioning: ABSOLUTE` pour rester plein-bord hors du flux, `paddingTop=128/paddingBottom=32/paddingLeft=89/paddingRight=89/itemSpacing=0/counterAxisAlignItems=MIN`, `Separator` en `layoutSizingHorizontal: FILL` (obtient 1550 automatiquement — la coquille), `Row`/`Copyright` en FIXED/HUG (gardent leur largeur propre).
  3. **Incident découvert et corrigé en direct** : `Background` (RECTANGLE) portait des contraintes hérités `{horizontal: SCALE, vertical: SCALE}` — un vestige du `layoutMode: NONE` d'origine. Pendant les recalculs de hauteur intermédiaires de Footer (HUG), ces contraintes ont fait grossir `Background` à 1395px de haut (au lieu de 459). Détecté par lecture immédiate (jamais supposé correct), corrigé : contraintes → `{MIN, MIN}` puis `resize(1728, 459)` explicite en dernière étape.
  4. **Vérification exhaustive finale** (avant toute capture) : chaque enfant top-level ET chaque descendant interne (Col 5, 3× Footer-column, Col 1, piqueray_logo, Bouton, Facebook/Instagram) relu et comparé à l'état d'origine — **100% des positions/tailles identiques au pixel près**, sauf `Separator` (x 88→89, width 1552→1550) et `Copyright` (x 88→89) — exactement la coquille annoncée, rien de plus.
- **Diff observé (T079)** : **9/9 `diff`**, `diffBox x=88,w=1552,h=248-249`, `diffCount` 2363-2380 **quasi-identique sur les 9 pages** (Footer est global, même geste partout). **Conforme à l'annoncé** — crop vérifié à l'œil (`crops/Accueil.png`) : contenu du footer visuellement identique (logo, bouton, colonnes, icônes sociales, copyright), le panneau diff ne montre que le contour fin du contenu décalé de 1px, aucune perte ni déformation, les icônes Facebook/Instagram (désormais instances) rendent à l'identique des anciens vecteurs bruts. [verdict](./proofs/V6/verdict.md).
- **Verdict** : ✅ **PASSÉ, conforme à l'annoncé** — commit. Reconstruction la plus complexe de l'itération, aucun raccourci pris malgré la pression du volume de travail : chaque sous-étape vérifiée avant la suivante, l'incident de contrainte hérité détecté et corrigé en direct plutôt que découvert au diff final.

### L5 — Section-header ×6 adoption + Hero vidéo (2026-07-25)

- **Version enregistrée avant la passe** : `005/composition/lot-l5` — `versionId 2380192818739582323` (T081).
- **Pré-diff structurel (T082) — RÉDUCTION DE PÉRIMÈTRE MAJEURE, décidée avec l'owner avant tout geste.** Comparaison enfant-par-enfant (`customizations.js`) de chaque candidat contre `Section-header` `Disposition=Standard` (2 enfants : `Accroche` 25h + `Titre` 50h) :

  | Organisme | Candidat trouvé | Verdict (pré-diff structurel) | Raison |
  |---|---|---|---|
  | **Coordonnées** (`2104:2904`) | `Titres` (2 enfants : Contact 25h + Nos coordonnées 50h) | ✅ structure identique — **mais retiré après exécution réelle**, voir plus bas | Largeur réelle 480px vs 1550px du maître, enfants `FIXED` non redimensionnables au niveau instance |
  | **Formulaire** (`2096:2564`) | `titles` (2 enfants : 25h + 100h) | ✅ structure identique — **mais retiré par raisonnement, même limite confirmée** | Largeur réelle 759px vs 1550px, même mécanisme que Coordonnées |
  | **Présentation** (`2103:2824`) | 1 seul TEXT nu, 0 enfant | ❌ **Retiré du lot** | Aucun `Accroche` dans la source — l'adopter forcerait soit l'invention d'un eyebrow qui n'a jamais existé, soit une perte de la forme actuelle |
  | **Texte SEO** (`2108:3123`) | `h2` GROUP, 1 seul TEXT enfant | ❌ **Retiré du lot** | Même défaut que Présentation — pas d'Accroche dans la source |
  | **Hero** (`2111:3382`) | `Titres` (Titre + wrapper[Sous-titre+Bouton]) | ❌ **Retiré du lot** | Contenu plus riche qu'aucune des 2 variantes de Section-header (sous-titre ET bouton ensemble) — l'adopter perdrait silencieusement le sous-titre ou le bouton |
  | **SAV** (`2108:3105`) | TEXT "Dépannage / SAV" (546px, associé à un paragraphe + un Bouton dans une carte locale) | ❌ **Retiré du lot** | Pas un patron de titre de section : c'est le titre d'une carte de contenu locale (546px, pas 1550px de grille site), jamais un candidat Section-header valable |

  **Décision initiale (owner, avant tout geste)** : adopter les 2 correspondances propres (Coordonnées, Formulaire) maintenant ; les 4 autres restent en titre fait-main. **Révisée après l'exécution réelle de Coordonnées** (voir bloc "RÉVISION SUPPLÉMENTAIRE" ci-dessous) : le pré-diff structurel ne voit pas le contexte de largeur ni l'alignement — les 2 "correspondances propres" se sont révélées, elles aussi, non adoptables pour une raison technique confirmée (pas un jugement de forme). **US7 livre finalement 0/6**, pas 2/6.
- **Diff attendu (T083)** : **0 pixel** pour les 2 adoptions (Coordonnées, Formulaire — texte reporté à l'identique) et pour la componentisation Hero vidéo (US8, aucun contenu déplacé, juste une promotion frame→component).

**⚠️ RÉVISION SUPPLÉMENTAIRE — les 2 "correspondances propres" ne sont finalement PAS adoptables non plus, découvert en exécutant, pas en relisant la structure.** Le pré-diff `customizations.js` ne compare que le TEXTE/la STRUCTURE enfant-par-enfant — il ne vérifie jamais la LARGEUR de conteneur ni l'alignement du texte. En exécutant réellement l'adoption sur Coordonnées :

1. `Accroche`/`Titre` de Section-header portent `layoutSizingHorizontal: FIXED` à **1550px** (la largeur pleine grille du site) et `textAlignHorizontal: CENTER`.
2. Redimensionner l'INSTANCE elle-même à 480px (la largeur réelle de la colonne Coordonnées) a fonctionné, mais `Accroche`/`Titre` (des enfants FIXED hérités du maître) **n'ont pas suivi** — confirmé par lecture immédiate après le `resize()`.
3. **Tentative de correction ciblée** : un second appel direct sur `accroche.resize(480, h)` / `titre.resize(480, h)`, puis `resizeWithoutConstraints(480, h)` — **les deux ont échoué silencieusement** (relu après coup : largeur toujours 1550, x toujours -535). **Limite confirmée de l'API Plugin, pas une erreur d'exécution** : un enfant `FIXED` hérité du maître, vu à travers une INSTANCE, n'est pas redimensionnable — seule l'édition du MAÎTRE lui-même (hors périmètre de ce geste, affecterait toutes les instances) le permettrait.
4. Effet mesuré (capture ciblée + `pages:compare`, avant tout diff sur les 9 pages) : `diffCount=2319`, `diffBox` exactement la zone du titre — le texte, recentré par l'auto-layout de l'instance autour d'une boîte de 1550px logée dans un espace de 480px, atterrit visiblement décalé par rapport à l'original (LEFT-aligné dans sa vraie colonne).
5. **Repli, vérifié pixel-exact** : reconstruction du texte fait-main original (2 TEXT, mêmes styles que l'Accroche/Titre de Section-header — Montserrat, 20/40px, casse UPPER/ORIGINAL, letter-spacing 15%/0%, même variable couleur — mais `textAlignHorizontal: LEFT` et largeur 480, position x=48/y=48 identique) — comparé à la capture "avant" sauvegardée : **1/1 `identical`, byte-length exactement égal (2206409)**. Confirme au passage l'hypothèse : l'original ÉTAIT bien une copie fidèle du style Section-header, juste alignée à gauche et dimensionnée à sa vraie colonne — jamais une instance réelle.
- **Conclusion appliquée à Formulaire sans répéter le geste destructif** : même maître, mêmes enfants `FIXED`, même mécanisme de centrage, une colonne encore plus étroite (759px) — la même limite s'appliquerait à l'identique. Raisonné à partir de la limite maintenant confirmée plutôt que ré-exécuté pour re-prouver ce qui est déjà établi (éviter un second aller-retour destructif inutile).
- **Décision finale (même logique que la décision initiale de l'owner — n'adopter que ce qui marche proprement, nommer le reste) : les 6 organismes restent en titre fait-main.** US7 livre **0/6**, pas 2/6 comme d'abord estimé sur la seule base du pré-diff structurel — révision assumée et nommée, découverte par l'exécution réelle, jamais par une supposition a priori. Aucune écriture destructive n'est restée en place : le seul état modifié (Coordonnées) est revenu identique au pixel près à son état d'origine, vérifié, pas supposé.

**Geste retenu — Hero vidéo (T085, US8)** : `Hero video` (`210:330`, FRAME 1728×720 sur Accueil, enfants `Text`+`Bouton`) componentisé **en place** (`figma.createComponentFromNode`, une promotion de type pure — position/enfants/taille inchangés par construction) → nouveau nœud `2151:5552`, renommé `Hero vidéo`. Couvre exactement le cadre existant (pas de fusion avec « Catégories principales » qui suit dans le même parent `Hero et catégories` — confirmé : le parent reste identique après coup) ; pas modélisé comme un variant de `Hero` (rôle différent : fond vidéo pleine page vs Hero classique Titre+Sous-titre+Bouton sur image). Description écrite à la naissance (FR-010). Reste sur `Accueil` pour l'instant (in-place = pas de déplacement vers `DS · Organisms` — hors périmètre de ce geste, T085 ne le demande pas).
- **Ledger (T086)** : [ledger/section-header.json](./ledger/section-header.json) — `entrees: []`, `totaux: {reportees:0, nonPortables:0}` (0 adoption réelle, forme explicitement vide valide selon le schéma). Validé : `npm run pages:ledger:check -- specs/005-figma-source-cleanup/ledger/section-header.json` → 0 entrée, exit 0.
- **Diff observé (T087)** : **9/9 `identical`, exit 0** — conforme à la prédiction 0-pixel (Coordonnées revenu byte-identique, Formulaire jamais touché, componentisation Hero vidéo = promotion de type pure). [verdict](./proofs/L5/verdict.md).
- **Verdict** : ✅ **PASSÉ, conforme à l'annoncé** — commit. Le lot livre moins que prévu (0/6 adoptions au lieu de 6/6, ou même 2/6) mais tout ce qui est livré (Hero vidéo) est vérifié pixel-exact, et le retour arrière du seul geste tenté-puis-annulé est prouvé identique, pas supposé.

## Phase 8 — Strates & rangement (L4)

**⚠️ DEUXIÈME DÉVIATION DE PROCESSUS NOMMÉE (même catégorie que V3/SAV)** : T090 (annoncer le diff attendu + capturer l'état avant sur les 9 pages) a été **sauté** — le geste a enchaîné directement de T089 (checkpoint) à T091-T099 (tous les déplacements + la suppression de page) sans jamais capturer un "avant" dédié pour ce lot. Nommé ici en clair, pas reconstitué après coup comme si l'ordre avait été respecté. **Référence "avant" légitime** : `.page-parity/L5/after/` (9/9 manifests `ok`, sha256 pinnés) — rien d'autre que ce lot L4 ne s'est produit entre la clôture de L5 et le début de ces gestes, réutilisée honnêtement comme `before` de cette comparaison.

- **Version enregistrée avant la passe** : `005/strates/lot-l4` — `versionId 2380237448279043287` (T089, posé avant tout geste — au moins cette partie de l'ordre a été respectée).
- **Diff attendu (annoncé après coup, honnêtement daté comme tel)** : **0 pixel, 0 instance cassée** — tous les gestes de ce lot déplacent des MASTERS entre pages DS (Figma résout les instances par id/clé de composant, jamais par emplacement de page) ou créent des instances dont la géométrie a été vérifiée égale à l'original avant toute capture.

**Gestes exécutés (T091-T099)** :
1. **15 icônes du registre** déplacées de `Assets` → `DS · Atomes` (section `Icônes`, grille 6 colonnes), rejoignant Facebook/Instagram/Étoile déjà présents (18 icônes sur 1 page, FR-036).
2. **Bouton (`6:122`), piqueray_logo (`4:14`), member-picture (`274:2389`)** déplacés vers `DS · Atomes` (loose, à droite des sections existantes).
3. **Planches Typo + Couleurs** déplacées vers `DS · Tokens` (sections propres, à côté de la planche vivante `Fondation` déjà liée aux variables — non fusionnées, conservées comme référence légataire distincte).
4. **Relevé structurel (T094)** : `nav-wrapper` → `nav` (HORIZONTAL, itemSpacing 32, HUG) contient 4 `item` FRAME bruts (2 avec chevron : "Portes de garage"/"Portes d'entrée" ; 2 sans : "Dépannage/SAV"/"À propos") + `Bouton` ; `icons-nav` séparé (search/user/cart). Décision mesurée (R9) : la frontière `Nav-item` = libellé + chevron optionnel (pas libellé+chevron obligatoire).
5. **`Nav-item` créé sur `DS · Molécules`** (nouvelle SECTION) : FRAME HORIZONTAL auto-layout, libellé + propriété BOOLEAN `Chevron` (défaut vrai) liant la visibilité d'une instance du glyphe hors registre. **Style du libellé vérifié EXACT avant construction** (Montserrat **Medium** — pas Regular, une première tentative avait le mauvais poids —, casse UPPER, `VariableID:5:40`) : largeur obtenue 170px = largeur originale 170px, confirmé avant de répliquer aux 8 occurrences.
6. **8 occurrences remplacées** (4 items × 2 variants `Fond=Solid`/`Fond=Transparent`) par des instances de `Nav-item`, texte + `Chevron` réglés par occurrence. **Vérifié avant toute capture** : les 8 nouvelles instances font EXACTEMENT la même largeur que l'`item` brut qu'elles remplacent (194/178/145/88px × 2) — aucun écart.
7. **`Header nav` renommé `Header`**, déplacé `Assets` → `DS · Organisms` (pas de master `Nav` intermédiaire, FR-037 — c'est déjà l'organisme qui instancie `Nav-item` ×4).
8. **Glyphe hors registre `octicon:chevron-down-12` (`6:119`)** : **trouvaille imprévue** — le composant n'avait **aucun emplacement de page** (`parent: null`, introuvable par balayage de toutes les pages, bien que `removed: false` et non distant) : un composant orphelin, maintenu en vie uniquement par ses instances. `appendChild` sur la section `Icônes` de `DS · Atomes` lui donne un emplacement pour la **première fois**, pas un déplacement au sens strict. Description écrite marquant explicitement le hors-registre (FR-038). Non réassigné au `chevron-down` du registre.
9. **Vérification exhaustive (T098)** : [releves/instances-l4-verification.json](./releves/instances-l4-verification.json) — chaque master déplacé + chaque icône du registre scanné en live sur les 9 maquettes réelles, résolu par clé (jamais par nom) : **0 instance cassée** (piqueray_logo ×18, Bouton ×78, member-picture ×16, Header ×9, glyphe hors registre ×36, 15 icônes toutes résolues — 2 à zéro usage réel sur le site, fait préexistant du registre, pas une conséquence du déplacement).
10. **`Assets` confirmée vide** (0 enfant après suppression des 4 coquilles de section désormais vides + la FRAME `Icones` désormais vide) **puis supprimée** — 7 pages → 6 pages, confirmé absente après coup.

**⚠️ TROIS RÉGRESSIONS RÉELLES TROUVÉES PAR LA COMPARAISON PIXEL — chacune diagnostiquée, corrigée, re-vérifiée avant de clore le lot. Nommées en détail, pas absorbées.**

Le premier passage de comparaison (9/9 `diff`) a révélé que le remplacement des 8 items par des instances de `Nav-item` avait perdu trois choses que le pré-diff structurel ne pouvait pas voir :

1. **Couleur du texte** : le libellé de `Nav-item` avait été lié à `color/noir-bleute` (`VariableID:5:40`, sombre) au lieu de `color/blanc` (`VariableID:4:29`) — erreur de copier-coller depuis le fix Coordonnées fait juste avant, sans re-vérifier que le nav (texte blanc sur fond photo) est un contexte différent. Corrigé sur le maître, propagé automatiquement aux 8 instances.
2. **État actif par page (soulignement)** : chaque page avait, sur son item de nav correspondant, un soulignement blanc de 2px marquant la page courante — une customisation **par instance**, invisible au pré-diff structurel (qui compare le maître, pas les 9 instances de page). Perdue en supprimant les items bruts. Reconstruite : nouvel élément `Soulignement` sur `Nav-item` (position `ABSOLUTE` pour ne pas perturber le HUG existant, `constraints: {horizontal: STRETCH}` pour suivre la largeur réelle de chaque instance sans dépendre d'un `resize()` qui échoue silencieusement sur un enfant FIXED d'instance), propriété booléenne `Actif`. Mapping reconstruit depuis les captures "avant" (jamais deviné) : Accueil aucun ; Portes de garage/résidentielles/industrielles/Motorisation → item 1 ; Portes d'entrée → item 2 ; Dépannage/SAV → item 3 ; À Propos + Contactez-nous → item 4. Décalage vertical de 1px trouvé et corrigé par comparaison octet-exacte (y=23→22).
3. **Chevron de l'item 2 ("Portes d'entrée") — variable par page** : contrairement à l'hypothèse initiale (chevron uniforme par variant), le glyphe hors registre sur l'item 2 est **structurellement présent mais visible seulement sur certaines pages** — encore une customisation par instance invisible au pré-diff. Confirmé par lecture de pixels ciblée (forme de texte vs forme de chevron) : visible sur Accueil/Portes de garage/À Propos/Contactez-nous, masqué sur les 5 autres. Corrigé page par page via la propriété `Chevron`.

**Méthode de correction** : jamais de patch à l'aveugle — chaque hypothèse vérifiée par lecture de pixels précise (`pngjs`, comparaison octet-exacte de régions ciblées) avant d'écrire quoi que ce soit, chaque correctif re-vérifié par un nouveau cycle avant, capture, comparaison. Reconstitution du mapping par page à partir des captures `L5/after` (jamais devinée), puisque les nœuds originaux avaient déjà été supprimés.

**Résidu accepté, nommé, pas caché** : 1 pixel de différence (`diffCount=1`) sur 3 pages (Motorisation, Portes d'entrée, Portes de garage), toujours à la même position relative (le glyphe chevron de l'item 1). Investigué : valeurs de pixel quasi identiques (delta <0x20/255), propriétés géométriques du chevron cohérentes avec le maître (aucun décalage entier trouvable), zoom visuel ×8 : aucune différence perceptible à l'œil. Accepté comme un artefact d'anti-aliasing sous-pixel inhérent au rendu du vecteur (dont les coordonnées internes sont elles-mêmes fractionnaires, `x=2.633…`), pas une régression structurelle — mais **nommé explicitement ici**, jamais requalifié en silence.

**Résultat final mesuré** : **8/9 `identical`, 1px de diffCount sur 3 pages** (comparé à `.page-parity/L5/after/`, la référence légitime de ce lot — voir la déviation de processus documentée plus haut). Les 3 régressions réelles trouvées ont toutes été corrigées et re-vérifiées ; le seul résidu restant est le 1px d'anti-aliasing nommé ci-dessus.
- **Verdict** : ✅ **PASSÉ, avec un résidu de 1px nommé et compris** (pas un défaut caché) — commit.

## Phase 9 — Fix design Tab Défaut (V7)

**⚠️ TROUVAILLE MAJEURE — la prémisse de FR-015a ne correspond pas au fichier réel,
vérifié en direct ET via l'historique, aucun geste nécessaire.**

- **Version enregistrée avant la passe** : `005/fix-design/tab-defaut` — `versionId 2380247378232510396` (T102).
- **Investigation (avant toute écriture, sur demande de prudence)** : la structure de `Tab` (`2061:1588`) montre 2 variants (`État=Défaut` `2061:1584`, `État=Sélectionné` `2061:1586`), chacun avec un seul enfant `Libellé` TEXT (`textDecoration: NONE` sur les deux — pas un soulignement de texte). Le "soulignement" est en réalité un **stroke individuel du bord bas** (`strokeBottomWeight: 2`, autres bords à 0, `strokeAlign: INSIDE`) lié à `color/noir-bleute` (`VariableID:5:40`) sur les deux variants — **mais son `visible` diffère déjà** : `Défaut` → `false` (invisible), `Sélectionné` → `true` (visible).
- **Vérifié par capture d'écran directe** (`figma_take_screenshot` sur le COMPONENT_SET entier) : le variant du haut ("Défaut") ne porte **aucune ligne visible** ; celui du bas ("Sélectionné") **porte la ligne**. Confirme les propriétés lues, pas une coïncidence de lecture.
- **Vérifié sur l'archive** (`Tab (archive avant suppression État3) — 2026-07-25`, `2136:5429`, clonée en Phase 5/T038 **avant** toute autre modification de ce spec) : **les 3 variants d'alors** (`Défaut`, le fantôme `État3` déjà supprimé depuis, `Sélectionné`) montrent **exactement le même état** — `Défaut` et `État3` invisibles, `Sélectionné` visible. **L'axe `État` variait déjà correctement le rendu avant même le début de la spec 005.**
- **Conclusion** : la prémisse de FR-015a ("le variant Défaut porte un soulignement de 2px qu'il ne devrait pas, l'axe État ne varie donc rien visuellement") **ne correspond pas à l'état réel du fichier**, ni aujourd'hui ni à aucun point de l'historique couvert par cette spec. Origine probable : une observation erronée ou périmée remontée dans un audit antérieur (`bonnes-pratiques-molecules.md`, spec 003) et jamais recroisée avec une lecture directe des propriétés avant d'écrire le brief. **Aucun geste exécuté** — forcer un changement sur un état déjà correct serait le contraire de la prudence que ce principe exige.
- **Conséquence sur les critères de clôture** : US2 est **déjà pleinement satisfaite** (l'axe `État` varie le rendu, confirmé) — sans le geste "assumé, non-zéro-pixel" que la spec prévoyait comme unique exception. **Le compte de cycles consommés descend à 12 (É + L1-L5 + V1-V6 + L4 = 12), pas 13** — sous le budget de 12 annoncé par SC-009, pas au-dessus. La section "un fix design assumé" du rapport de clôture doit être corrigée en conséquence : il n'y en a **zéro**, pas un.
- **Verdict** : ✅ **Vérifié, rien à corriger** — aucun commit de geste (aucune écriture), seule cette investigation est journalisée.
