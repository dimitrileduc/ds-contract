# Feature Specification: HeroVideo gouverné côté Odoo + bascule de la home

**Feature Branch**: `025-odoo-hero-video`

**Created**: 2026-08-23

**Status**: Complete

**Input**: User description: "ok donc on implemente le hero video + on propage la data pr la home via json — Figma node 2170:6351 (Piqueray Copy)"

## Contexte (constaté, pas supposé)

La home Odoo compose aujourd'hui `s_pqr_hero` (contrat `ds.hero`) alors que le design de l'Accueil dans Figma est **HeroVideo** (`ds.hero-video`, extrait du nœud historique `2151:5552`, réf. de travail `2170:6351`). D'où l'écart visible : titre **Light 300 / 54-68** au lieu de **Regular 400 / 44-48**, hauteur **640** au lieu de **720**, pas de scrims.

Faits vérifiés :
- `ds.hero-video` existe déjà en **contrat v1.0.0 + surface React/HTML** ; son titre est **direct** (prop `accroche`), **sans `ds.section-header`** ; il porte **2 scrims gouvernés** et un **poster statique** (le `videoUrl` est un canal code-side, le canvas/Odoo n'affiche que le poster — décision déterministe documentée dans le contrat).
- L'addon Odoo a déjà les **tokens** hero-video (`--pqr-size-hero-video-root: 720px`, titre 44/48 Regular) **mais aucun bloc QWeb `s_pqr_hero_video`**.
- `s_pqr_hero` n'est utilisé **que** sur la home (aucune autre page descriptor).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - La home affiche le bon hero (Priority: P1)

En tant que visiteur/propriétaire, je vois sur l'Accueil le hero conforme à la maquette : titre **Regular 44/48** sur une ligne, hauteur **720**, pleine largeur, **poster** en fond, **scrims** haut/bas, CTA.

**Why this priority**: C'est le défaut visible et la raison du chantier. Sans lui, rien n'a de valeur.

**Independent Test**: Composer la home sur une instance jetable et comparer le hero rendu au master Figma hero-video (parité visuelle sous le seuil du projet) ; le titre tient sur une ligne à la largeur de référence.

**Acceptance Scenarios**:
1. **Given** la home composée avec le nouveau bloc, **When** on la charge, **Then** le hero rend titre Regular 44/48, 720px, full-bleed, poster + 2 scrims + CTA, fidèle au master.
2. **Given** la maquette n'a pas de vidéo, **When** le bloc rend sans `videoUrl`, **Then** il affiche le poster statique (comportement déterministe attendu), sans zone vide ni erreur.

---

### User Story 2 - Bloc HeroVideo gouverné et éditable (Priority: P2)

En tant que rédacteur du site, je peux poser/éditer le bloc HeroVideo dans le Website Builder — changer le **titre**, le **libellé du CTA** et l'**image poster** — comme les autres blocs Piqueray, sans pouvoir éditer/retirer ce qui n'est pas prévu.

**Why this priority**: La gouvernance et la réutilisabilité (le bloc doit vivre comme les ~10 autres), au-delà de la seule home.

**Independent Test**: Dans l'éditeur, ouvrir le bloc, modifier titre/CTA/poster, enregistrer, rouvrir : les changements survivent ; les parts non prévues ne sont ni éditables ni supprimables.

**Acceptance Scenarios**:
1. **Given** le bloc déposé, **When** le rédacteur édite le titre et le CTA et enregistre, **Then** les valeurs persistent après réouverture.
2. **Given** le bloc déposé, **When** le rédacteur tente d'éditer une part non gouvernée, **Then** l'action n'est pas offerte.
3. **Given** le bloc déposé puis réordonné/dupliqué, **When** la page est enregistrée, **Then** le bloc rend correctement en autonomie (copie HTML figée).

---

### User Story 3 - Source Figma auditée et contrat prouvé fidèle (Priority: P3)

En tant que mainteneur du design system, avant de projeter le bloc je vérifie que le master Figma hero-video est **propre** (Step 0 §VIII) et que le contrat existant lui est **fidèle** ; toute anomalie de source est corrigée **à la source**.

**Why this priority**: Fondation de la fidélité ; évite de modéliser autour d'une source sale.

**Independent Test**: Relevé du master (nœud `2170:6351` / `2151:5552`) comparé au contrat `ds.hero-video` ; écarts documentés, repair au master si nécessaire, sinon « conforme, rien à faire ».

**Acceptance Scenarios**:
1. **Given** l'audit du master, **When** un écart avec le contrat est trouvé, **Then** il est corrigé côté Figma (jamais contourné en code) et le contrat re-vérifié.
2. **Given** aucun écart, **When** l'audit se termine, **Then** un reçu « source conforme » est produit.

### Edge Cases

- **Vidéo absente de Figma** : attendu et voulu — le poster statique EST la surface déterministe ; `videoUrl` reste un canal code-side hors périmètre de ce spec.
- **Full-bleed** : le bloc doit être pleine largeur dans la home (couche `o_pqr_page` / `s_pqr_bleed` déjà en place), sans gutter.
- **Resize étroit** : le crop vertical du hero (hauteur fixe + cover) est **inhérent et hors périmètre** ici (concerne le contrat, pas ce bloc) ; le titre Regular 44 tient sur une ligne à la largeur de référence.
- **Bloc déposé/réordonné** : rendu autonome garanti (HTML figé Odoo).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système MUST fournir un bloc Odoo gouverné **`s_pqr_hero_video`** projetant `ds.hero-video`, enregistré comme snippet Website comme les autres blocs Piqueray.
- **FR-002**: Le bloc MUST rendre l'anatomie hero-video fidèlement : **titre direct** (sans SectionHeader) à la taille/graisse du contrat (**44/48 Regular**), hauteur **720**, les **2 scrims** gouvernés, et le **plan poster**.
- **FR-003**: L'**image poster** MUST être réglable par page (comme les images des autres blocs) ; la source vidéo est code-side et **non requise** pour le rendu déterministe (le poster est le placeholder).
- **FR-004**: Les parts éditables inline au Website Builder MUST se limiter au **titre** et au **libellé CTA** ; l'**image poster** est remplaçable uniquement via le panneau. Le texte alternatif du poster et l'URL du CTA sont des réglages contrôlés du panneau, pas des parts éditables. Rien d'autre n'est éditable ou supprimable.
- **FR-005**: Le descriptor de la home MUST utiliser **`s_pqr_hero_video`** à la place de `s_pqr_hero`, avec le contenu de l'Accueil (poster, titre, CTA).
- **FR-006**: Step 0 (§VIII) — le master Figma hero-video MUST être audité ; tout défaut de source corrigé **à la source**, le contrat prouvé fidèle (ou mis à jour via diff revu).
- **FR-007**: **Aucun SectionHeader** dans le bloc (titre direct). `ds.hero` et `ds.section-header` **ne sont PAS modifiés** par ce spec (parkés).
- **FR-008**: Toutes les portes de qualité MUST rester vertes (build, `odoo:module:check`, parity, parité visuelle, eval) ; tout changement d'octets généré MUST être **re-pinné avec une raison explicite** dans le reçu de clôture.
- **FR-009**: La QA MUST tourner sur une instance **jetable** uniquement (**jamais** `piqueray-odoo-test`, 8071).

### Key Entities *(include if feature involves data)*

- **`ds.hero-video` (contrat, existant)** : SSoT du composant ; titre direct, poster, 2 scrims, 720px, video code-side.
- **`s_pqr_hero_video` (bloc Odoo, NOUVEAU)** : projection QWeb gouvernée du contrat + enregistrement snippet + réglages éditeur.
- **`home.json` (descriptor, mis à jour)** : bascule `s_pqr_hero` → `s_pqr_hero_video` + contenu Accueil.
- **Tokens hero-video (existants)** : déjà générés côté Odoo (720, 44/48 Regular).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Le hero de la home rend **fidèle au master Figma hero-video** à la largeur de référence **1728 px** (titre une ligne, hauteur 720, full-bleed, poster + 2 scrims) — parité automatisée Figma ↔ emit-html **≤ 2.0 %**.
- **SC-002**: Le rédacteur peut changer **titre, CTA, poster** dans l'éditeur et ne peut **pas** toucher aux parts non prévues ; les changements survivent à l'enregistrement.
- **SC-003**: Le bloc **survit** au dépôt/réordonnancement/duplication/enregistrement (rendu autonome).
- **SC-004**: **Toutes les portes** passent ; **zéro re-pin inexpliqué**. Les re-pins admis pour cette feature sont `inputs.lock.json` (ajout gouverné de `ds.hero-video`) et l'entrée HeroVideo de `evals/golden.json` (correctif de l'émetteur `video` documenté dans le reçu de clôture).
- **SC-005**: **Aucune modification** de `ds.hero`, `ds.section-header`, ni d'un contrat non concerné.

## Assumptions

- `ds.hero-video` (contrat + React) est la SSoT et déjà fidèle **sous réserve** de l'audit Step 0 (US3).
- La surface hero déterministe est le **poster statique** ; la lecture vidéo est **hors périmètre** (canal `videoUrl` code-side, différé).
- Le bloc `s_pqr_hero` (`ds.hero`) **reste** dans l'addon mais devient **inutilisé** sur les pages authored ; il n'est **pas** retiré par ce spec.
- La couche de layout de page (full-bleed `s_pqr_bleed`, gutter/gap `o_pqr_page`) déjà mergée est **réutilisée** telle quelle.
- La QA tourne sur une instance Docker **jetable** ; l'instance owner (8071) reste intouchée.
- `s_pqr_hero` sert de **référence structurelle** pour construire `s_pqr_hero_video` (enregistrement snippet, parts éditables, image de fond), adapté à la forme hero-video.

## Release & Evidence Requirements

- La liste canonique des portes est celle de `quickstart.md` §1 : build, assets/inputs/authoring/module/derivation/typecheck Odoo, parity, eval, plugin, round-trip, browser-core et les deux commandes TypeScript. Une porte rouge bloque la livraison ; aucun défaut préexistant n'est accepté silencieusement.
- La preuve Figma est obligatoire et archivée : master `2151:5552`, rendu à 1728×720 CSS pixels / 2×, Chromium Playwright épinglé, Montserrat embarquée, poster fourni par une fixture dont les octets et le SHA-256 sont contrôlés. Un asset absent ou incohérent bloque la preuve ; il ne produit jamais un rendu vide accepté.
- Les références Figma ont cette priorité : master historique `2151:5552` comme autorité du composant, instance de travail `2170:6351` comme contrôle d'usage. Un désaccord entre les deux rouvre l'audit Step 0 avant livraison.
- La preuve Odoo de cette livraison est la recette owner datée, archivée dans `proofs/release-closure.md`, couvrant dépôt, édition, sauvegarde/réouverture, gouvernance, duplication, réordonnancement et rendu home. Le scénario automatisé reste le mécanisme rejouable recommandé ; si l'instance jetable tombe avant capture, elle est restaurée depuis le seed et la recette est reprise, sans bascule vers l'instance owner.
- Lorsqu'il est rejoué, le scénario automatisé Odoo ↔ emit-html exige **0.0000 %** d'écart : aucun résidu n'est admis par défaut. Un plancher non nul constituerait une nouvelle décision de release à documenter et revoir, pas une tolérance implicite.
- Le pair descriptor + addon doit reconstruire la page après restore. Un échec de restauration bloque la livraison et impose de restaurer le dernier seed connu puis de re-semer depuis une instance jetable saine.
- Chaque SC doit pointer vers un reçu ou une décision owner explicite. Les preuves obligatoires de cette livraison sont : Step 0, Figma visual-parity, recette owner Odoo, captures home, sweep des portes et liste des re-pins.
- Les re-pins autorisés sont exclusivement ceux nommés dans SC-004 et `proofs/release-closure.md`. Tout autre re-pin bloque la livraison jusqu'à explication et revue.
