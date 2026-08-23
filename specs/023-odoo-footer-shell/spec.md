# Feature Specification: Pied de page Piqueray dans Odoo (footer shell)

**Feature Branch**: `023-odoo-footer-shell`  
**Created**: 2026-08-22  
**Status**: Draft  
**Input**: Description utilisateur : « Livrer le pied de page Piqueray dans le site Odoo, au design gouverné exact. C'est la seconde moitié du "cadre" (shell) qui manque pour compléter le site — le header a été livré par 022-odoo-nav-shell, les 10 sections de contenu sont déjà en ligne. Le footer est un composant SYSTÈME (il vit dans `website.layout`, pas un snippet droppable) et se re-rend à chaque requête. Le visiteur voit le pied de page au design exact (logo blanc, 3 colonnes d'informations, icônes réseaux sociaux, bouton CTA, séparateur, copyright) ; le rédacteur peut modifier les contenus textuels décidés (adresse, horaires, contact) sans toucher au design ; l'owner garde l'apparence gouvernée par le contrat `ds.footer` v1.1.0. Référence Figma : node 2120:4785 dans le fichier client. »

## Périmètre de la feature

Cette feature livre la **seconde moitié du shell** manquant : le pied de page Piqueray, projeté dans
le **footer système d'Odoo** (`website.layout`). Elle ne pose pas un bloc de contenu droppable —
elle habille la zone footer du layout et rend le design gouverné sur chaque page du site.

Le design du footer est gouverné par deux contrats — `ds.footer` (la composition complète : logo,
colonnes, réseaux, séparateur, copyright) et `ds.footer-column` (une colonne : titre orange + texte
blanc). Les contrats sont à v1.1.0 (géométrie portée par 015, tokens bindés par 016) — **aucune
remise à niveau n'est attendue** contrairement au header de 022 (pas de variante morte, pas de
props manquantes). Le footer est projeté **épinglé**.

Elle sépare nettement deux responsabilités :

- **l'apparence** (structure, couleurs, espacements, typographie, logo, icônes) reste gouvernée par
  le contrat ;
- **le contenu textuel** des colonnes (adresse, horaires, coordonnées de contact) est modifiable par
  le rédacteur dans les limites décidées à la gate humaine.

Le site cible a déjà ses **10 sections de contenu en ligne** et son **header shell** ; cette feature
complète le cadre autour d'elles sans les toucher.

## Clarifications

### Session 2026-08-22

- Q: Le contrat `ds.footer` v1.1.0 est-il prêt pour projection tel quel, ou nécessite-t-il un bump ? → A: **Prêt épinglé.** La géométrie est gouvernée depuis 015 (border-box corrigé, 3 largeurs source réparées), les tokens sont bindés depuis 016, la description porte le reçu de la correction DW-004/DW-005. Aucun bump nécessaire — projection directe de v1.1.0.
- Q: Le footer compose `ds.piqueray-logo` avec `couleur: "blanc"` et `ds.button` avec `variant: "outlineBlanc"` — ces compositions tiennent-elles ? → A: **Oui.** `ds.piqueray-logo` est à 1.0.0 (adopté par 022) et accepte `blanc` ; `ds.button` est à 2.0.1 et accepte `outlineBlanc`. Les deux sont déjà projetés dans l'addon (le logo via le header, le bouton via les sections de contenu).
- Q: Le CTA « Contactez-nous » du footer est-il éditable ou fixé ? → A: **Fixé par composition** cette itération — même patron que le header (libellé et cible fixés dans le gabarit, non éditables). Le libellé vient du contrat (`text: "Contactez-nous"`), la cible pointe vers `/contactez-nous`.
- Q: Les icônes réseaux sociaux (Facebook, Instagram) sont-elles des liens ? Leurs URLs sont-elles éditables ? → A: **Oui, les icônes sont des liens ET les URLs sont éditables.** Les URLs de Facebook et Instagram vivent dans une donnée Odoo (`ir.config_parameter` ou équivalent) — le rédacteur peut les modifier via un panneau ou un réglage. Mécanisme exact à spiker.
- Q: Quels contenus textuels des 3 colonnes sont éditables par le rédacteur ? → A: **Textes éditables, titres fixés.** Les titres des colonnes (« Adresse », « Horaires », « Contact ») sont fixés par composition dans le gabarit ; seul le texte sous chaque titre (l'adresse réelle, les horaires réels, les coordonnées réelles) est modifiable par le rédacteur.
- Q: Le copyright en bas est-il un texte statique ou régénéré (année courante) ? → A: **Éditable.** Le texte du copyright est modifiable par le rédacteur (en inline ou via un réglage) pour qu'il puisse mettre à jour l'année ou les mentions légales sans intervention technique.

## User Scenarios & Testing *(mandatory)*

### Checkpoint bloquant — gate humain « périmètre éditable » (avant toute implémentation)

Exigence de processus (reprise du précédent wave-b) :

- Le plan ouvre par la proposition d'une **table de verdicts d'éditabilité** couvrant **100 % des props et des parts** du contrat `ds.footer` (et du contrat enfant `ds.footer-column`). Chaque entrée porte un des quatre verdicts : `éditable` / `fixé par composition` / `non éditable` / `hors capacité`.
- **L'owner valide explicitement la table.** Aucune implémentation ne démarre avant.
- La table validée **fait foi** pour la suite.

### User Story 1 - Voir le pied de page Piqueray au design exact (Priority: P1)

En tant que visiteur, je vois le pied de page Piqueray au design gouverné exact — logo blanc, trois
colonnes d'information (adresse, horaires, contact), section réseaux sociaux, bouton CTA, séparateur
et mention copyright — sur chaque page du site.

**Why this priority**: C'est la promesse visible de la feature. Sans un footer au design exact, le
shell n'est pas complet et le site reste visuellement inachevé.

**Independent Test**: Sur l'instance où la home et ses sections + le header sont en ligne, charger
plusieurs pages et comparer le footer rendu à la référence validée (node Figma 2120:4785) ; vérifier
logo, colonnes, icônes, bouton, séparateur et copyright sans écart visible.

**Acceptance Scenarios**:

1. **Given** le shell installé et le site en ligne, **When** un visiteur charge n'importe quelle page, **Then** le footer affiche le design Piqueray (logo blanc, fond sombre, colonnes d'info) sans écart visible par rapport à la référence.
2. **Given** le footer rendu, **When** on inspecte sa composition, **Then** on retrouve : logo (variante blanc), 3 colonnes (Adresse, Horaires, Contact), titre « Suivez-nous » + icônes Facebook/Instagram, bouton « Contactez-nous » (outlineBlanc), séparateur et copyright.
3. **Given** le footer, **When** on compare pixel-à-pixel avec la référence Figma, **Then** le delta est sous la tolérance de référence du projet (même instrument que les sections en ligne).

---

### User Story 2 - Modifier les contenus textuels autorisés (Priority: P1)

En tant que rédacteur du site, je modifie les contenus textuels des colonnes du footer (ceux
validés à la gate « éditable ») via l'éditeur Odoo, sans toucher à la structure ni au design.

**Why this priority**: Le contenu du footer (adresse, horaires, numéro de téléphone) change dans
la vie réelle. Le rédacteur doit pouvoir le mettre à jour sans intervention technique.

**Independent Test**: Dans l'éditeur Odoo, modifier un texte autorisé dans une colonne du footer,
enregistrer, rouvrir : le contenu est conservé et le design reste intact.

**Acceptance Scenarios**:

1. **Given** le footer sur une page, **When** le rédacteur modifie un texte au verdict « éditable » dans l'éditeur, **Then** la modification est visible et le design reste intact.
2. **Given** une modification de texte enregistrée, **When** le rédacteur rouvre l'éditeur puis la page publique, **Then** le contenu modifié est conservé aux deux endroits.
3. **Given** le footer, **When** le rédacteur tente de modifier un élément d'un autre verdict (structure, logo, icônes, séparateur), **Then** le geste d'édition est bloqué et les panneaux natifs indésirables ne sont pas proposés.

---

### User Story 3 - Garder l'apparence gouvernée par le contrat (Priority: P2)

En tant qu'owner du design system, l'apparence du footer reste gouvernée par le contrat et
régénérable par projection : elle évolue par le contrat, sans toucher au contenu du rédacteur.

**Why this priority**: C'est la valeur durable. Garantit que le footer ne devient pas une copie
HTML morte. Puisque le footer vit dans `website.layout` (re-rendu à chaque requête), la
gouvernance est structurellement tenable — même argument que le header.

**Independent Test**: Introduire une évolution simulée dans l'apparence du contrat (changement de
couleur d'un token, par exemple), régénérer la feuille CSS, et vérifier que le footer en ligne
reflète le changement sans réédition manuelle et sans altérer le contenu textuel du rédacteur.

**Acceptance Scenarios**:

1. **Given** le footer en ligne, **When** on inspecte son apparence, **Then** celle-ci provient du design gouverné (contrats footer / footer-column / piqueray-logo / button / copyright) et n'est pas figée à la main.
2. **Given** une évolution de la CSS gouvernée, **When** l'addon est mis à jour, **Then** le footer reflète le changement sur la requête suivante, et les textes du rédacteur restent intacts.
3. **Given** les 10 sections de contenu et le header déjà en ligne, **When** le footer est livré, **Then** ces éléments restent intacts ; le footer complète le cadre sans les modifier.

---

### Edge Cases

- **Footer sur page sans contenu** (page vide au-dessus) : le footer se rend correctement seul.
- **Texte très long dans une colonne** : le texte wrape dans sa colonne sans casser la mise en page des colonnes voisines.
- **Retrait d'un lien réseau social** : hors périmètre cette itération (les icônes sont fixées par le gabarit).
- **Responsive / mobile** : hors périmètre — le footer rend le design desktop de la référence ; le comportement mobile est déféré, nommé.
- **Mise à jour du module** : le contenu textuel éventuellement modifié par le rédacteur survit à une mise à jour de l'addon (le footer est un template système, pas un bloc HTML sauvegardé — le contenu éditable doit utiliser un mécanisme qui survit à la mise à jour du template).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le footer MUST être livré comme le **footer système** du site Odoo (dans `website.layout`), et non comme un snippet de contenu droppable.
- **FR-002**: Le footer MUST rendre le design Piqueray gouverné **sans écart visible** par rapport à la référence (node Figma 2120:4785) — logo blanc, 3 colonnes, icônes réseaux, bouton CTA (outlineBlanc), séparateur, copyright.
- **FR-003**: Le footer MUST apparaître sur **chaque page** du site (propriété de `website.layout`).
- **FR-004**: L'apparence du footer MUST être **gouvernée par les contrats** (`ds.footer` 1.1.0, `ds.footer-column` 1.1.0, `ds.piqueray-logo` 1.0.0, `ds.button` 2.0.1, `ds.copyright`) et **régénérable par projection**, jamais figée à la main.
- **FR-005**: Les contenus textuels au verdict « éditable » (décidés à la gate humaine) MUST être modifiables par le rédacteur via l'éditeur standard d'Odoo.
- **FR-006**: Les modifications de contenu textuel MUST être **conservées** après enregistrement, réouverture de l'éditeur et affichage public.
- **FR-007**: Les éléments aux verdicts « fixé par composition » / « non éditable » / « hors capacité » MUST NOT être modifiables par le rédacteur — les panneaux natifs indésirables sont retirés.
- **FR-008**: Le footer MUST coexister avec le **header shell** (022) et les **10 sections de contenu** déjà en ligne, sans les modifier.
- **FR-009**: Le bouton CTA « Contactez-nous » MUST rendre le design Piqueray (variante `outlineBlanc`) avec une **cible fixe** vers `/contactez-nous` — non éditable cette itération.
- **FR-010**: Le logo MUST rendre la **variante `blanc`** de `ds.piqueray-logo` (marque orange + wordmark blanc).
- **FR-011**: Les icônes réseaux sociaux (Facebook, Instagram) MUST être rendues au design exact du contrat (taille, couleur), MUST être des **liens cliquables**, et leurs **URLs MUST être éditables** par le rédacteur via un mécanisme de réglage Odoo.
- **FR-012**: Le séparateur MUST être rendu au design exact du contrat, en élément non éditable.
- **FR-015**: Le texte du **copyright** MUST être **éditable** par le rédacteur (mise à jour de l'année ou des mentions légales sans intervention technique).
- **FR-016**: Les **titres** des colonnes (« Adresse », « Horaires », « Contact ») MUST être **fixés par composition** dans le gabarit ; seul le **texte** sous chaque titre MUST être **éditable** par le rédacteur.
- **FR-013**: La livraison MUST laisser toutes les **portes du dépôt au vert** (`npm run build`, `npm run parity`, `npm run eval`, etc.) — aucun contrat modifié = aucun re-pin attendu.
- **FR-014**: Le contenu textuel éditable MUST **survivre à une mise à jour de l'addon** (mécanisme de persistance adapté au footer comme gabarit système).

### Key Entities

- **Footer (shell)** : la surface gouvernée du pied de page du site — fond sombre (plan absolu `{color.noir-bleute}`), composition complète en lecture du contrat `ds.footer` 1.1.0.
- **Colonne de footer** : une des 3 colonnes de contenu (titre orange + texte blanc), instance de `ds.footer-column` ; son contenu textuel est la donnée potentiellement éditable.
- **Logo** : le logo Piqueray gouverné, rendu en variante `blanc`.
- **Bouton CTA** : « Contactez-nous », variante `outlineBlanc`, cible fixe `/contactez-nous`.
- **Icônes réseaux** : Facebook et Instagram, taille ~32px, couleur `{color.noir-bleute}`, liens vers les profils Piqueray.
- **Copyright** : texte porté par `ds.copyright`, statique.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Le footer complet (logo, colonnes, icônes, bouton, séparateur, copyright) rend le design Piqueray **sans écart visible** par rapport à la référence — comparé sous la tolérance de référence du projet (même instrument que les sections et le header).
- **SC-002**: Un rédacteur peut **modifier les textes autorisés** (gate humaine) dans les colonnes, le footer gardant son design **intact**, sans intervention technique.
- **SC-003**: **100 %** des modifications de texte sont **conservées** après enregistrement et réouverture (éditeur + page publique).
- **SC-004**: Une mise à jour de l'addon (simulate upgrade) **préserve le contenu modifié** par le rédacteur.
- **SC-005**: Le footer apparaît sur **chaque page** du site, fidèlement et sans dégradation des sections et du header déjà en ligne.
- **SC-006**: La CSS gouvernée étant la seule source d'apparence, un changement de token dans `components.pqr.css` se **répercute sur le footer en ligne à la requête suivante** — prouvé par une variation d'apparence mesurable.

## Assumptions

- Le **header shell** (022) et les **10 sections de contenu** sont déjà en ligne ; cette feature ajoute uniquement le footer.
- Les contrats `ds.footer` 1.1.0 et `ds.footer-column` 1.1.0 sont **consommés tels quels** — aucun bump, aucune modification de contrat dans cette spec.
- Le footer est un **gabarit système** re-rendu à chaque requête (comme le header) : la gouvernance de l'apparence est structurellement tenable.
- Le mécanisme de **persistance du contenu éditable** dans un gabarit système est un point technique à spiker — le header avait `website.menu` (donnée native) ; le footer a du texte libre. Un spike déterminera si le texte vit en donnée (`ir.config_parameter`, `website.footer_text`, ou un modèle ad hoc) ou dans le DOM sauvegardé par Odoo (comme les snippets mais appliqué au footer).
- La **comparaison visuelle** s'appuie sur l'instrument existant (`extract/image-parity/`), contre la référence Figma node 2120:4785.
- Le responsive mobile est **hors périmètre** — le footer rend la largeur desktop de référence.

## Dependencies

- Le **module Odoo de production** (fondation 019, extensions 022/wave-b) et sa chaîne de projection.
- Les contrats gouvernés `ds.footer` 1.1.0, `ds.footer-column` 1.1.0, `ds.piqueray-logo` 1.0.0, `ds.button` 2.0.1, `ds.copyright`.
- La **CSS générée** (`components.pqr.css`) contenant la fermeture des 5 contrats ci-dessus.
- Le **header shell** (022) déjà en ligne — le footer se branche dans le même layout.
- La **référence validée** du footer : node Figma 2120:4785 dans le fichier client `d9FYAUcqdcNtsuaMgLefvJ`.

## Out of Scope *(cette itération)*

- Le **responsive mobile** du footer (adaptation aux petits écrans).
- L'**éditabilité des titres** des colonnes (fixés par composition).
- L'**ajout/suppression de colonnes** ou de réseaux sociaux (la structure est fixée).
- Le **design d'un panneau de settings** au-delà du minimum nécessaire pour les URLs et le copyright.
- Tout **changement de contrat** (`ds.footer`, `ds.footer-column`) — consommés épinglés.
- Toute **mutation canvas Figma** — lecture seule sur le fichier client.
