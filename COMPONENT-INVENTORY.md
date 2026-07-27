# Inventaire des composants — maquettes Piqueray

**But** : la liste complète des composants à externaliser depuis les maquettes, atome → molécule → section, **avec leurs dépendances**, pour cadrer les prochaines specs.

> **✅ Clôture spec 003 (2026-07-25, scan final par position — fait foi)** :
> voir `specs/003-externalize-figma-components/inventory/scan-final-2026-07-25.json` et
> `proofs/honesty-report.md`. **Tous les atomes/molécules/sections listés ci-dessous comme
> « à faire » sont maintenant construits et adoptés**, sauf 2 blocs explicitement reportés
> à la clôture 003 (raison nommée, condition de reprise claire — voir
> `proofs/honesty-report.md` §1) : **Review-card** (source = capture d'écran aplatie d'un
> widget tiers, zéro vecteur) et **Avis Google** (bloqué par Review-card). Le tableau
> ci-dessous garde sa forme T0 d'origine pour la trace historique ; chaque ligne construite
> porte maintenant ✓ + un renvoi vers son entrée `decisions.md`. `dependancesTierces = 0`
> confirmé à nouveau par le scan final (inchangé depuis T0).
>
> **✅ Mise à jour à la clôture spec 006 (2026-07-26)** : les **2 blocs reportés** ci-dessus
> sont **livrés** — `ds.review-card` et `ds.google-reviews`, net-new (l'owner a validé un
> design net-new plutôt que d'extraire la capture Trustindex aplatie), adoptés sur les 8
> occurrences (`specs/006-google-reviews-block/`). L'icône étoile avait déjà été livrée au
> registre en spec 004 (`contracts/icons.registry.json`, `name: "star"`). Le tableau
> ci-dessous porte désormais ✓ sur ces trois lignes ; le compteur « blocs reportés » du
> rapport d'honnêteté 003 passe de **2 à 0** (SC-008, `specs/006-google-reviews-block/`).
>
> **Une divergence notée à la clôture, pas silencieuse** : la Checkbox listée ci-dessous
> comme atome « à faire » n'a **jamais été construite** — l'audit du Formulaire (T091) a
> trouvé que le consentement RGPD source est un simple texte, pas une checkbox (prémisse
> T0 invalidée à la mesure, voir `decisions.md`, anomalie-tranchee Formulaire).
>
> **Note structurelle héritée de T0, toujours vraie** : la plupart des masters Phase 8
> (« Sections » ci-dessous) ont été construits sur la page `DS · Molécules` au lieu de
> `DS · Sections` — une erreur de catégorisation reconnue en cours de route et
> **explicitement reportée à un futur ménage** (hors périmètre spec 003, voir mémoire
> projet `future-ds-atoms-molecules-sections-reorg`), pas corrigée ici.
>
> <details><summary>Note T0 d'origine (2026-07-23), conservée pour la trace</summary>
>
> **⚠️ Re-mesure T0 (2026-07-23, scan par position — le dernier scan fait foi)** :
> voir `specs/003-externalize-figma-components/inventory/scan-2026-07-23.json` et le
> tableau des divergences dans [`inventory/dag.md`](specs/003-externalize-figma-components/inventory/dag.md).
> Corrections principales : **category-card 41** (pas ~15 — 3 formes de layout, une seule cle),
> **footer-column 27** (3 colonnes × 9 pages, pas 9), **gallery-item CONFIRMÉ** (27 tuiles
> mosaïque sur 3 pages), Hero solo ×2 seulement (le reste vit dans des composites, dont
> « Hero et FAQ » sur Dépannage/SAV et un GROUP « Header + Hero + Cat » sur Portes d'entrée),
> jeu d'icônes réel plus riche (cart, search, user, arrow-left, chevron-left/right,
> octicon:chevron-down-12). **dependancesTierces = 0 sur les 9 maquettes.**
>
> </details>

## Source & méthode (à re-mesurer avant contractualisation)

- **Fichier** : `Piqueray (Copy)` — fileKey `d9FYAUcqdcNtsuaMgLefvJ`.
- **Périmètre scanné** : page **`Pages`** (`210:325`) — 9 maquettes pleine largeur 1728px : Accueil, Portes de garage (+ résidentielles / industrielles), Motorisation, Portes d'entrée, Dépannage/SAV, À Propos, Contactez-nous.
- **Méthode** : scan via le **pont desktop** (`figma_execute` + `figma.loadAllPagesAsync()`), instances résolues avec `getMainComponentAsync()`, graphe de dépendances reconstruit par containment. ⚠️ Les outils MCP **serveur** ne voient QUE la page `Assets` (la page `Pages` est locale, non synchro serveur).
- **Statut des chiffres** : mesures de session **2026-07-23**. Comme la règle projet (étape 0 / source-cleanliness), ils sont **re-mesurés avant toute extraction** — le fichier peut bouger, les chiffres re-mesurés font foi.
- **Légende** : ✓ = existe déjà comme composant · **gras** = à faire · *(inféré)* = déduit, bloc non nommé dans la maquette, à confirmer sur passe visuelle.

---

## Déjà des composants → NE PAS refaire

`Bouton` (×68) · `Header nav` (×9) · `piqueray_logo` (×9) · `member-picture` (×16) · les icônes (`chevron-up/down`, `arrow-right`, `piqueray`…). Total : **145 instances locales**, toutes bien instanciées dans les maquettes.

---

## ATOMES (T0 : à faire → clôture 2026-07-25)

| Atome | Preuve (état brut) | Dépend de | Statut |
|---|---|---|---|
| **Input** (texte) | `input` brut ×6 | tokens | ✓ fait |
| **Textarea** | 1 champ 161px (Message) | tokens | ✓ fait |
| **Select** (liste déroulante) | 1 `input` contient un `chevron-down` | chevron-down ✓ | ✓ fait |
| **Checkbox** | **inexistant** (le consentement RGPD est un simple texte) | tokens | **jamais construit** — prémisse invalidée à l'audit T091, rien à externaliser (voir bandeau ci-dessus) |
| **Icônes sociales** | groupes bruts dans `Suivez-nous` | — *(à ajouter au jeu d'icônes)* | ✓ fait |
| **Icône étoile** (note avis) | Avis Google *(inféré)* | — | ✓ fait (spec 004 — livrée au registre `contracts/icons.registry.json`, `name: "star"`, master `Étoile` `2053:1263`) |

## MOLÉCULES (T0 : à faire → clôture 2026-07-25)

| Molécule | Preuve | Dépend de | Statut |
|---|---|---|---|
| **Field** (label + saisie + erreur) | `field` brut ×7 | **Input / Select / Textarea** | ✓ fait (T039-T040) |
| **Accordion-row** (ligne FAQ, ouvert/fermé) | `item` / `item open` ~34 | chevron-up/down ✓ | ✓ fait (T041-T042) |
| **Accordion** (groupe de lignes) | `accordion` brut ×12 | **Accordion-row** | ✓ fait (T067-T068) |
| **Category-card** (image + titre + CTA) | `item` 41 (re-mesuré T0, pas ~15) | Bouton ✓ | ✓ fait (T045-T046) |
| **Product-card** (`Thumbnail produit`) | brut ×8 | Bouton ✓ | ✓ fait (T047-T048) |
| **Member-card** (photo + nom + rôle) | `member` brut ×16 | member-picture ✓ | ✓ fait (T049-T050) |
| **Reassurance-item** (icône + texte) | `item` ~26 | icônes | ✓ fait (T051-T052) |
| **Review-card** (avatar + étoiles + texte) | Avis Google *(inféré)* | **Icône étoile** ✓ | ✓ fait (spec 006-google-reviews-block — `ds.review-card`, net-new sur les avatars/étoile/texte réels, plus une capture d'écran aplatie) |
| **Tabs / Tab** | `tab` brut ×4 | tokens | ✓ fait (T043-T044) |
| **Carousel-controls** (prev / next) | `Controls` brut ×2 | Bouton ✓ | ✓ fait (T055-T056) |
| **Footer-column** + **Copyright** | brut ×27 / ×9 (re-mesuré T0) | liens | ✓ fait (T057-T060) |
| **Contact-info-row** (adresse / horaires / …) | brut ×4 | icônes sociales | ✓ fait (T061-T062) |
| **Section-header** (surtitre + titre + CTA) | `Titres` brut ×9 | Bouton ✓ | ✓ fait (T063-T064) |
| **Gallery-item** *(inféré à T0, confirmé)* | 27 tuiles mosaïque sur 3 pages | — | ✓ fait (T065-T066) |

## SECTIONS (T0 : à faire → clôture 2026-07-25)

| Section | Pages | Dépend de | Statut |
|---|---|---|---|
| **Footer (+ Devis)** | 9 | logo ✓ + **Footer-column** + **Copyright** + Bouton ✓ | ✓ fait (T099-T100) — « + Devis » du nom = artefact, aucun Devis fusionné trouvé |
| **Devis / CTA** | 8 | Bouton ✓ | ✓ fait (T069-T070) |
| **Hero** | 8 | **Section-header** (dépendance de séquencement, pas de composition) | ✓ fait (T075-T076) — **1 écart pixel resté ouvert**, voir `proofs/honesty-report.md` §7 |
| **Avis Google** | 8 | **Review-card** ✓ | ✓ fait (spec 006-google-reviews-block — `ds.google-reviews`, `repeat` de 5 `ds.review-card`, adopté sur les 8 occurrences) |
| **Texte SEO** | 8 | **Accordion** | ✓ fait (T081-T082) — 1 reflow réel accepté et documenté (À Propos) |
| **Réassurances** | 6 | **Reassurance-item** + Bouton ✓ | ✓ fait (T077-T078) — COMPONENT_SET 3 variantes (prémisse « 1 seule structure » invalidée à l'audit) |
| **Catégories principales** (+ alt) | 7 | **Category-card** | ✓ fait (T079-T080) — COMPONENT_SET 4 variantes (tuiles nav natives + Carte gouvernée + variante RDV) |
| **Hero et catégories** (composite) | 6 | Hero + Catégories | ✓ fait (T097-T098) — **par vérification, pas construction** : composite déjà gouverné par T076+T080, aucun master séparé nécessaire (décision mesurée) |
| **Présentation** | 3 (re-mesuré T0, pas 5) | Bouton ✓ | ✓ fait (T071-T072) |
| **FAQ** | 3 (Dépannage/SAV exclu, composite « Hero et FAQ » distinct) | **Tabs** + **Accordion** + Bouton ✓ | ✓ fait (T083-T084) |
| **Réalisations** | 3 | Gallery-item ✓ | ✓ fait (T095-T096) — régression de contenu réelle trouvée par revue et corrigée avant commit |
| **Produits e-commerce** | 2 | **Product-card** + **Carousel-controls** | ✓ fait (T085-T086) — byte-identique sur les 2 pages |
| **Formulaire** | 1 | **Field** + Bouton ✓ (pas de Checkbox — inexistante à la source) | ✓ fait (T091-T092) |
| **Coordonnées** | 1 | **Contact-info-row** + icônes sociales + carte | ✓ fait (T093-T094) |
| **Équipe** | 1 | **Member-card** | ✓ fait (T087-T088) — preuve byte-identique raw→adopté |
| **SAV** | 1 | Bouton ✓ (+ image) | ✓ fait (T073-T074) — plus petit écart pixel de toute la spec (3px) |

---

## Ordre de construction (imposé par les dépendances) — suivi tel quel, clôturé 2026-07-25

Le modèle de contrats impose le bottom-up : un contrat d'organisme référence les contrats de ses atomes. On ne peut donc pas contractualiser une section avant ses molécules, ni une molécule avant ses atomes.

1. **Tokens** — nettoyage (odeurs connues : `nav/state` en STRING, `orange-12/42` mintés, `space`/`radius` nommés par valeur). ✓ fait (`nav-state` réglé avant spec 003 ; `orange-12/42` et `space`/`radius` déclinés par l'owner, pas des odeurs à corriger).
2. **Atomes** — `Input` d'abord, puis `Textarea` / `Select` / `Checkbox` ; + icônes sociales & étoile. ✓ fait, sauf `Checkbox` (jamais construite — inexistante à la source) ; icône étoile livrée au registre en spec 004.
3. **Molécules** — `Field`, `Accordion-row` → `Accordion`, les 4 cartes (category / product / member / review), `Reassurance-item`, `Tabs`, `Carousel-controls`, `Footer-column`, `Contact-row`, `Section-header`. ✓ fait — `Review-card` livrée en spec 006-google-reviews-block (était reportée à la clôture 003).
4. **Sections** — d'abord les triviales (`Devis`, `Présentation`, `SAV` = juste Bouton), puis `Hero`, `Réassurances`, `Catégories`, `Texte SEO`, `FAQ`, `Produits`, `Équipe`, `Avis Google`, `Formulaire`, `Coordonnées` → enfin les **composites** (`Hero et catégories`, `Footer + Devis`). ✓ fait — `Avis Google` livrée en spec 006-google-reviews-block (était reportée, bloquée par Review-card, à la clôture 003).

**Détail complet de chaque décision, chiffre et écart accepté** : `specs/003-externalize-figma-components/decisions.md` (journal complet, append-only) et `specs/003-externalize-figma-components/proofs/honesty-report.md` (synthèse SC-009).

---

## Précisions honnêtes

- **`item` (×71) = 3 molécules distinctes** sous un même nom Figma : Accordion-row (~34) + Category-card (~15) + Reassurance-item (~26). Séparées au nommage à la construction — trois masters distincts, jamais confondus.
- **Review-card, icône étoile, Avis Google = livrés** — l'icône étoile au registre en spec 004, Review-card et Avis Google (net-new, `repeat` de 5 cartes) en spec 006-google-reviews-block. À l'origine reportés (source Trustindex = capture d'écran aplatie, zéro vecteur) ; l'owner a validé un design net-new plutôt que d'extraire la capture.
- **Gallery-item (Réalisations) = inféré à T0, confirmé et construit** (T065-T066) — 27 tuiles mosaïque sur 3 pages, exactement comme prévu.
- **`Header nav` et `Footer`** apparaissent aussi comme frames brutes : ce sont des conteneurs de positionnement autour de l'instance / des atomes — le Header est bien un composant, le Footer **est devenu** un composant à la clôture (T099, master `Footer`) ; le wrapper `Footer + Devis` qui le contient, lui, reste volontairement un simple FRAME (zéro identité visuelle propre, décision mesurée, même logique que `Hero et catégories`).
- **Scan final (2026-07-25)** : `dependancesTierces = []` confirmé à nouveau, inchangé depuis T0 — voir `specs/003-externalize-figma-components/inventory/scan-final-2026-07-25.json`.
