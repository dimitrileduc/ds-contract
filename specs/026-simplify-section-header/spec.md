# Feature Specification: Simplify Section Header

**Feature Branch**: `main`

**Created**: 2026-08-23

**Status**: Draft

**Input**: User description: "Réduire les variantes illisibles de SectionHeader, remettre le centre là où la base historique l’utilisait, déplacer les comportements spécialisés vers leurs sections, puis aligner les usages des pages, la sortie HTML et Odoo sans dégradation non déclarée."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Composer un titre de section lisible (Priority: P1)

Un designer peut insérer un titre de section courant sans devoir interpréter des variantes qui correspondent en réalité à d’autres sections de la page.

**Why this priority**: Le composant est partagé par de nombreuses pages ; une API lisible réduit directement les erreurs de composition et les écarts de rendu.

**Independent Test**: Un designer choisit un titre de section, règle l’alignement et l’affichage de l’accroche, puis obtient le rendu attendu sans avoir à choisir une emphase, une mise en page CTA ou une taille de titre.

**Acceptance Scenarios**:

1. **Given** un nouveau titre de section standard, **When** le designer le configure, **Then** les seuls choix de variante proposés sont `Centre` et `Gauche`.
2. **Given** un titre de section avec ou sans accroche, **When** le designer active ou désactive l’accroche, **Then** le contenu du titre et son style standard restent inchangés.
3. **Given** aucune sélection explicite, **When** un titre de section est ajouté, **Then** il est centré par défaut.

---

### User Story 2 - Conserver des pages cohérentes après simplification (Priority: P1)

Un visiteur retrouve les pages existantes avec leur contenu, leur hiérarchie et leur rendu préservés après la migration des titres de section.

**Why this priority**: La simplification ne doit pas dégrader les 45 usages actuels identifiés dans les pages ni modifier discrètement des sections sans rapport.

**Independent Test**: Chaque usage de page recensé est comparé avant et après migration ; tout écart est soit absent, soit relié à un delta explicitement accepté dans cette spécification.

**Acceptance Scenarios**:

1. **Given** un titre standard historiquement centré, **When** la page est migrée, **Then** il reste centré avec son contenu et son niveau de lecture inchangés.
2. **Given** un contexte qui porte sa propre hiérarchie typographique, **When** la page est migrée, **Then** il conserve sa hiérarchie sans dépendre d’une variante spécialisée du titre générique.
3. **Given** une comparaison avant/après, **When** un élément hors périmètre diffère, **Then** la migration est refusée jusqu’à ce que cet écart soit supprimé ou explicitement accepté.

---

### User Story 3 - Retrouver les rôles propres à chaque section (Priority: P2)

Un designer ou un rédacteur compose un Hero, une Présentation, un Texte SEO ou une liste de produits avec un titre adapté au rôle de la section, sans détourner le composant générique.

**Why this priority**: Les anciens paramètres mélangeaient plusieurs responsabilités et rendaient les intentions de chaque section difficiles à lire.

**Independent Test**: Chacun des quatre contextes spécialisés rend son titre prévu sans exposer d’emphase ni de CTA sur le composant générique.

**Acceptance Scenarios**:

1. **Given** un Hero, **When** son titre est affiché, **Then** il garde sa présentation claire, grande et alignée à gauche.
2. **Given** une Présentation ou un Texte SEO, **When** son titre est affiché, **Then** il garde le niveau typographique propre à cette section et l’alignement à gauche.
3. **Given** une section Produits e-commerce, **When** son titre et son appel à l’action sont affichés, **Then** le titre est à gauche, au niveau intermédiaire, sans accroche, conformément à la référence historique.

---

### User Story 4 - Publier sans surprendre les administrateurs du site (Priority: P3)

Un administrateur peut continuer à composer les sections prises en charge dans le site, avec des réglages compréhensibles et sans réécriture silencieuse d’une page déjà sauvegardée.

**Why this priority**: Une page sauvegardée est un contenu éditorial ; la mise à jour du système ne doit jamais la transformer à l’insu de son propriétaire.

**Independent Test**: Les réglages publiés correspondent à la nouvelle responsabilité de chaque section, et une page existante reste intacte tant qu’une migration explicitement validée n’est pas appliquée.

**Acceptance Scenarios**:

1. **Given** une nouvelle section prise en charge, **When** l’administrateur la configure, **Then** les réglages exposés correspondent uniquement à son rôle réel.
2. **Given** une page déjà sauvegardée, **When** le système est mis à jour, **Then** sa structure et son contenu ne sont pas réécrits automatiquement.

### Edge Cases

- Une ancienne configuration demande une emphase, une disposition CTA ou un nom de propriété retiré : elle doit être explicitement mappée vers une section spécialisée ou signalée, jamais interprétée silencieusement.
- Une accroche est vide ou masquée : le titre standard conserve son espacement et son alignement prévus.
- Un usage de page est masqué, hors viewport ou contenu dans un contexte visuel complexe : il reste recensé et protégé, même si sa capture visible nécessite une méthode distincte.
- Un contenu riche comporte plusieurs styles typographiques : ses plages et sa hiérarchie sont préservées lors de la migration.
- Une page du site a été sauvegardée avec une version antérieure : son évolution nécessite une décision de migration distincte et traçable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système MUST offrir un composant `SectionHeader` générique ayant exactement deux variantes d’alignement : `Centre` et `Gauche`.
- **FR-002**: Le système MUST faire de `Centre` le comportement par défaut du composant générique.
- **FR-003**: Le composant générique MUST exposer uniquement un titre riche, une accroche textuelle, la visibilité de cette accroche et l’alignement ; les propriétés doivent être nommées selon leur intention, notamment `afficherAccroche` plutôt qu’un nom ambigu.
- **FR-004**: Le composant générique MUST présenter un titre de section standard sombre de 40/50, quelle que soit sa variante d’alignement.
- **FR-005**: Le composant générique MUST NOT exposer d’emphase (`hero`, `moyen`, `compact`) ni de disposition incluant un appel à l’action.
- **FR-006**: Le Hero MUST porter son propre titre clair de niveau Hero, aligné à gauche.
- **FR-007**: La Présentation MUST porter son propre titre intermédiaire, aligné à gauche, et le Texte SEO MUST porter son propre titre compact, aligné à gauche.
- **FR-008**: La section Produits e-commerce MUST porter son propre titre intermédiaire et son appel à l’action ; ce titre MUST être aligné à gauche et ne MUST NOT afficher d’accroche.
- **FR-009**: Tous les usages actuels de `SectionHeader` dans les pages MUST être recensés, capturés avant toute mutation et migrés vers le composant ou la section qui correspond à leur rôle.
- **FR-010**: La migration MUST préserver l’identité, le contenu, les styles de texte, les médias, la géométrie, les liens d’instance et les contextes de page de chaque usage, sauf les deltas explicitement autorisés par FR-011.
- **FR-011**: Les seuls deltas visuels autorisés sont la suppression des variantes illisibles du composant générique et la restauration, pour Produits e-commerce, du titre intermédiaire aligné à gauche sans accroche. Tout autre changement visible MUST être refusé ou faire l’objet d’une approbation explicite.
- **FR-012**: Les sorties de référence et la version administrable du site MUST exprimer les mêmes responsabilités fonctionnelles pour le composant générique et les quatre sections spécialisées.
- **FR-013**: Une page du site déjà sauvegardée MUST NOT être modifiée automatiquement par cette évolution ; toute migration de page persistée MUST être proposée, approuvée et prouvée séparément.
- **FR-014**: La livraison MUST produire une preuve de non-régression de tous les usages page, ainsi qu’une seconde exécution sans modification supplémentaire.

### Key Entities

- **Titre de section générique**: Le composant réutilisable de titre standard ; il possède un alignement, un titre, une accroche et sa visibilité.
- **Contexte de titre spécialisé**: Une section qui possède sa propre hiérarchie de titre et, le cas échéant, son appel à l’action.
- **Usage de page**: Une occurrence existante du titre ou d’un contexte spécialisé dans une page, avec son contenu et son environnement visuel.
- **Page sauvegardée du site**: Une composition éditoriale persistée dont l’évolution requiert une décision explicite de migration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un designer peut configurer un titre de section standard à partir de deux variantes d’alignement et de quatre propriétés de contenu/comportement, sans variante d’emphase ni CTA.
- **SC-002**: Les 45 usages actuels identifiés dans les pages sont tous classés, capturés et vérifiés après migration ; aucun ne reste sans destination documentée.
- **SC-003**: 100 % des différences observées hors des deux deltas autorisés par FR-011 sont éliminées avant livraison.
- **SC-004**: Les quatre contextes spécialisés affichent chacun leur hiérarchie propre, sans recourir à une variante spécialisée du composant générique.
- **SC-005**: Les nouvelles compositions administrables respectent la même responsabilité fonctionnelle que les références, et 0 page sauvegardée n’est modifiée sans une migration explicitement approuvée.
- **SC-006**: Une seconde application de la migration ne produit aucune modification supplémentaire du composant, de ses usages ou des preuves associées.

## Assumptions

- L’inventaire de départ est celui établi le 23 août 2026 : 45 usages dans les pages, dont 24 titres standards et 21 contextes spécialisés.
- La référence historique confirme que les titres de réassurance, FAQ, avis et réalisations sont majoritairement centrés ; l’alignement à gauche n’est conservé que lorsqu’il correspond au rôle réel de la section.
- La restauration du comportement Produits e-commerce — titre intermédiaire à gauche, CTA, sans accroche — est un correctif volontaire, pas une régression.
- La présente spécification autorise la préparation et la vérification de la migration des usages des pages. Toute mutation du fichier de design reste soumise à une proposition détaillée, une capture complète avant changement et un GO explicite du propriétaire.
- La publication du site peut prendre en charge les nouvelles compositions ; les compositions déjà sauvegardées ne font pas partie d’une migration implicite.

## Scope Boundaries

**In scope**:

- La simplification du titre de section générique et la clarification de ses propriétés.
- La réattribution des hiérarchies spécialisées à Hero, Présentation, Texte SEO et Produits e-commerce.
- La migration vérifiée de leurs usages dans les pages.
- L’alignement des références de rendu et de la version administrable du site.

**Out of scope**:

- Une refonte visuelle générale des pages ou des sections non concernées.
- Toute modification de copy, de média, de navigation ou de mise en page qui n’est pas nécessaire à cette migration.
- La réécriture automatique de pages du site déjà sauvegardées.
- L’ajout de nouvelles hiérarchies de titres ou de nouveaux comportements CTA hors des quatre contextes spécialisés.
