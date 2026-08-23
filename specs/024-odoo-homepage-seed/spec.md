# Feature Specification: Odoo Homepage Seed

**Feature Branch**: `incongruous-ski`

**Created**: 2026-08-23

**Status**: Draft

**Input**: User description: "En tant que owner du site Piqueray, je veux que la homepage de mon instance Odoo (port 8071) reproduise fidèlement la maquette Figma, et que mon contenu soit persisté dans un seed SQL versionnable, afin que je puisse éditer dans l'éditeur Odoo sans risquer de perdre mon travail, même si un agent détruit un Docker."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Montage fidèle de la homepage (Priority: P1)

En tant que owner du site, je pose les 7 sections de la homepage dans l'instance Odoo owner (port 8071) pour qu'elles reproduisent la maquette Figma : les textes, le rich text, les images et l'ordre de la page.

**Why this priority**: Sans la page montée, il n'y a rien à persister ni à distribuer. C'est le socle de tout le reste.

**Independent Test**: Ouvrir `http://localhost:8071` en visiteur et comparer visuellement avec la maquette Figma (node `210-326`). Les 7 sections sont présentes dans l'ordre, les textes et images correspondent.

**Acceptance Scenarios**:

1. **Given** l'instance owner tourne avec l'addon `piqueray_ds` installé, **When** on visite la homepage en mode visiteur, **Then** les 7 sections apparaissent dans l'ordre : Hero → Catégories (2 cartes, empilé) → Présentation → SAV → Devis → Réassurances (5 cartes) → Google Reviews.
2. **Given** la page est montée, **When** on compare les textes visibles avec ceux du Figma, **Then** chaque section porte son texte exact, bold compris (titres en Montserrat Bold, sous-titres et corps correspondant au rich text du Figma).
3. **Given** la page est montée, **When** on inspecte les images affichées, **Then** chaque image provient du Figma (chargée, visible, pas de placeholder cassé ni d'image vide).
4. **Given** la page est montée, **When** on ouvre l'éditeur Odoo (`/odoo/website?enable_editor=1&with_loader=1`), **Then** la page est éditable : on peut cliquer sur un texte et le modifier, on peut accéder aux panneaux des blocs.

---

### User Story 2 — Persistance du contenu dans un seed versionnable (Priority: P1)

En tant que owner, j'exporte l'état de ma DB dans un fichier seed SQL versionnable, et je peux le restaurer dans une instance fraîche pour retrouver ma page exactement telle que je l'ai laissée.

**Why this priority**: Le contenu Odoo vit dans la DB, un `down -v` le détruit. Sans seed versionné, le travail du montage est fragile et non reproductible.

**Independent Test**: Exécuter `npm run odoo:save`, détruire l'instance (`down -v`), recréer (`up -d`), exécuter `npm run odoo:restore`, recharger la page — le contenu est identique.

**Acceptance Scenarios**:

1. **Given** la homepage est montée et éditée dans l'instance owner, **When** on exécute `npm run odoo:save`, **Then** un fichier seed est écrit dans un emplacement versionnable (par ex. `integrations/odoo/qa/seed.sql`) et peut être commité.
2. **Given** un seed existe, **When** on détruit l'instance (`docker compose down -v`) puis on la recrée et on exécute `npm run odoo:restore`, **Then** la homepage s'affiche identiquement à ce qui a été sauvegardé, sans intervention manuelle.
3. **Given** un seed existe et une instance fraîche est lancée sur un autre port, **When** on exécute `npm run odoo:restore` en ciblant cette instance, **Then** le contenu y est restauré de manière identique.

---

### User Story 3 — Instances jetables agents à partir du seed (Priority: P2)

En tant que owner, je veux que les agents lancent leurs instances jetables à partir du seed exporté, pour qu'ils héritent de mon contenu sans toucher mon instance.

**Why this priority**: Dépend du seed (US2). Le bénéfice est la sécurité du workflow multi-agent : l'instance owner n'est jamais exposée.

**Independent Test**: Un agent crée une instance jetable sur un port libre, la restaure depuis le seed, vérifie la page, la détruit — l'instance owner (8071) n'a pas été touchée.

**Acceptance Scenarios**:

1. **Given** un seed versionné existe, **When** un agent lance une instance jetable via `docker compose` sur un port différent de 8071, **Then** il peut restaurer le seed dans cette instance et voir la homepage montée.
2. **Given** un agent travaille sur une instance jetable, **When** il détruit cette instance, **Then** l'instance owner (port 8071) n'est pas affectée — son contenu et sa DB restent intacts.

---

### Edge Cases

- Que se passe-t-il si `npm run odoo:save` est exécuté alors que l'instance owner n'est pas démarrée ? L'erreur doit être explicite.
- Que se passe-t-il si `npm run odoo:restore` est exécuté sur une instance qui contient déjà du contenu ? Le seed remplace entièrement la DB (comportement attendu d'un `pg_restore` complet).
- Que se passe-t-il si le port 8071 est déjà occupé par un agent ? Le script de save/restore cible l'instance owner par son nom de projet Docker (`piqueray-odoo-test`), pas par port — un agent sur un autre projet ne peut pas interférer.
- Que se passe-t-il si une image du Figma n'est pas exportable (hash purgé) ? La section est montée avec un placeholder vide nommé, et la lacune est documentée dans un relevé de montage.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La homepage DOIT afficher les 7 sections dans l'ordre exact : Hero, Catégories, Présentation, SAV, Devis, Réassurances, Google Reviews.
- **FR-002**: Les textes de chaque section DOIVENT correspondre à ceux du Figma, y compris les segments en gras (rich text).
- **FR-003**: Les images de chaque section DOIVENT être celles du Figma, chargées et visibles dans le rendu visiteur.
- **FR-004**: La page DOIT être éditable dans l'éditeur Odoo — les textes modifiables, les panneaux de blocs accessibles.
- **FR-005**: Aucun fichier du dépôt (contracts, tokens, core, src, figma-sync, evals) NE DOIT être modifié. Tout le contenu vit dans la DB Odoo.
- **FR-006**: `npm run odoo:save` DOIT exporter un dump PostgreSQL de la DB owner dans un fichier versionnable.
- **FR-007**: `npm run odoo:restore` DOIT restaurer ce dump dans une instance Odoo fraîche, reconstituant la homepage à l'identique.
- **FR-008**: Le seed DOIT être utilisable par les agents pour initialiser leurs instances jetables sans toucher l'instance owner.
- **FR-009**: Les scripts save/restore DOIVENT refuser de cibler une instance nommée `piqueray-odoo-test` pour restore (protection owner), sauf en mode explicite.
- **FR-010**: Les sections hors périmètre (Produits e-commerce, Coordonnées, Footer) NE DOIVENT PAS être montées par cette spec.

### Key Entities

- **Seed SQL** : un fichier dump PostgreSQL représentant l'état complet de la DB Odoo (schéma + données), exportable et restaurable.
- **Instance owner** : le projet Docker `piqueray-odoo-test` (port 8071), propriété du owner, interdit aux agents.
- **Instance jetable** : un projet Docker éphémère créé par un agent, initialisé depuis le seed, détruisable sans conséquence.
- **Section montée** : un snippet Piqueray posé dans la homepage via l'éditeur Odoo, dont le HTML est gelé dans la DB (COW view).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Les 7 sections sont visibles dans l'ordre correct sur la homepage visiteur — vérifiable par inspection visuelle ou capture.
- **SC-002**: Le cycle save → destroy → restore → reload reproduit la page à l'identique — aucune section manquante, aucun texte perdu, aucune image cassée.
- **SC-003**: Le seed SQL fait moins de 50 Mo et se restaure en moins de 2 minutes sur une instance fraîche.
- **SC-004**: L'instance owner (port 8071) reste intacte après qu'un agent ait créé, utilisé et détruit une instance jetable depuis le même seed.
- **SC-005**: La page est éditable dans l'éditeur Odoo : un texte modifié, sauvegardé et rechargé persiste.

## Assumptions

- L'instance owner (`piqueray-odoo-test`, port 8071) est déjà démarrée et opérationnelle avec `piqueray_ds` installé.
- L'addon `piqueray_ds` contient déjà les templates des snippets pour les 7 sections en périmètre (posés par les specs 019, 022, 022-b et 023). Le montage consiste à poser ces blocs dans l'éditeur, pas à écrire de nouveaux templates.
- Les images Figma sont exportables via l'API REST Figma (`FIGMA_TOKEN` disponible). Si un hash est purgé, un placeholder vide est posé et nommé.
- Le format du seed est un `pg_dump` standard (format custom ou plain SQL), restaurable par `pg_restore` ou `psql`.
- Le header et le footer sont traités par d'autres specs (022, futur) et ne font pas partie du montage homepage.
- Les commandes `npm run odoo:save` et `npm run odoo:restore` seront ajoutées au `package.json` racine comme des scripts shell appelant `docker exec` + `pg_dump` / `pg_restore`.
