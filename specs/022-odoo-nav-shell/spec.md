# Feature Specification: Barre de navigation Piqueray dans Odoo (le shell)

**Feature Branch**: `022-odoo-nav-shell`  
**Created**: 2026-08-20  
**Status**: Draft  
**Input**: Description utilisateur : « Livrer la barre de navigation Piqueray dans le site Odoo, au design gouverné exact, tout en gardant le menu éditable par le client. C'est le "cadre" (shell) qui manque pour compléter la home — les 8 sections de contenu sont déjà en ligne. Odoo gère la nav comme un composant système (le header du site + un menu piloté par données), pas comme un bloc droppable : il faut y projeter notre design sans casser ce mécanisme. Le visiteur voit la barre au design exact (logo, liens, état de la page courante, déroulants) ; le client gère ses liens (ajouter, renommer, réordonner, imbriquer, pointer vers une page ou une URL) sans toucher au design ; l'owner garde l'apparence gouvernée par le contrat. Les déroulants fonctionnent dès la livraison au style Odoo par défaut ; leur design Piqueray, l'état survol et le menu mobile sont hors de cette itération. »

## Périmètre de la feature

Cette feature livre le **shell** manquant de la home : la barre de navigation Piqueray, projetée
dans le **header système d'Odoo**. Elle ne pose pas un bloc de contenu de plus — elle habille le
header du site et branche ses liens sur le **menu éditable natif** d'Odoo.

Le design de la nav est gouverné par trois contrats — `ds.header` (la barre), `ds.nav-item`
(un lien : libellé, cible, chevron, état actif) et `ds.piqueray-logo` (le logo). Les reçus du
dépôt (013, 020) montrent que `ds.header` v1.0.0 **ne porte pas encore l'apparence Transparent
validée** (logo gelé en variante sombre, style du bouton, encre des icônes — la taille 24 est
portée depuis 016) et que `ds.piqueray-logo` est encore en **draft 0.1.0**. Cette feature procède
donc en deux temps : **(1) remise à niveau versionnée MAJEURE** de `ds.header` (retrait de la
variante Solid sans usage + apparence Transparent) et **adoption** de `ds.piqueray-logo`, gates du
dépôt au vert ; **(2) projection** des versions re-épinglées dans Odoo. `ds.nav-item` (v1.2.0) est
projeté épinglé, non modifié. Elle sépare nettement deux responsabilités :

- **l'apparence** (barre, logo, liens, état actif, chevron) reste gouvernée par le contrat ;
- **le contenu du menu** (libellés, cibles, ordre, imbrication) reste une donnée éditable qui
  appartient au client.

La home cible a déjà ses **8 sections de contenu en ligne** ; cette feature complète le cadre autour
d'elles sans les toucher.

## Clarifications

### Session 2026-08-20

- Q: Le contrat épinglé `ds.header` v1.0.0 ne peut pas rendre la référence validée (Transparent — reçus 013 : logo gelé en variante sombre, bouton sans style Blanc, encre/taille des icônes non portées) ; « projeter sans modifier aucun contrat » et « sans écart visible » sont incompatibles. Où vit la remise à niveau du contrat ? → A: 022 répare puis projette — phase amont de remise à niveau versionnée de `ds.header` (apparence Transparent) + adoption de `ds.piqueray-logo` (draft 0.1.0), gates au vert, puis projection Odoo des versions re-épinglées ; SC-006 est prouvé par cette évolution réelle.
- Q: La référence validée compose logo + 4 liens + bouton CTA « Contactez-nous » + 3 icônes (search, user, cart) ; la spec ne citait pas les icônes et laissait le CTA « à confirmer ». Que contient la barre livrée ? → A: Composition complète, fidèle à la référence — CTA inclus (libellé « Contactez-nous », cible fixe vers la page contact, non éditable cette itération) et 3 icônes rendues comme sur la maquette, **sans comportement** (limite nommée : recherche/compte/panier inertes, différés).
- Q: Les 9 maquettes utilisent toutes Fond=Transparent (barre flottant sur le hero) ; le défaut du contrat est « solid ». Quelle variante la barre en ligne livre-t-elle ? → A: **Transparent uniquement** ; la **superposition sur le hero n'est pas gérée cette itération** — côté Odoo (et uniquement côté Odoo, ni Figma ni contrat), la barre est posée sur un **fond sombre/noir uni** pour que l'encre claire reste lisible et que le rendu se vérifie bien.
- Q: Que fait 022 du contenu initial du menu à l'installation (le menu Odoo actuel est celui par défaut, la maquette porte une arborescence réelle) ? → A: **Semer une fois, à la livraison, l'arborescence de la maquette** (liens + sous-liens) comme donnée de menu native Odoo — ensuite le menu appartient au client ; SC-001 et SC-005 se vérifient sur ce menu réel.
- Q: Quand la page courante est un enfant d'un déroulant, où l'état actif Piqueray (soulignement) se porte-t-il dans la barre ? → A: **Le lien parent est souligné** (sémantique native d'Odoo : le parent d'une page active est actif) ; l'entrée du sous-menu est marquée au style Odoo par défaut.
- Q: Le master `Fond=Solid` n'a **aucun usage** (audit 020 : les 9 maquettes sont toutes en Transparent) ; faut-il maintenir la variante au contrat — et le canal conditionnel de schéma qu'elle exigerait pour les props d'enfant (logo, bouton) ? → A (owner, 2026-08-20) : **Solid est retiré.** `ds.header` passe en **MAJOR 2.0.0 mono-variante** (la prop `fond` disparaît) et le master Figma `Fond=Solid` est **supprimé du set** dans 022 — un geste canvas unique, précédé d'une répétition sur clone, de la capture complète (§X) et d'une version nommée. Conséquence : l'apparence Transparent se porte par des **canaux existants** (props d'enfant figées, jetons simples) — **aucun nouveau canal de schéma n'est requis**.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Voir la barre Piqueray au design exact (Priority: P1)

En tant que visiteur, je vois la barre de navigation Piqueray au design gouverné exact — logo en
encre claire, liens, CTA, icônes, état de la page courante et affordance de déroulant — sur chaque
page du site (la home et les pages atteignables depuis le menu semé).

**Why this priority**: C'est la promesse visible de la feature. Sans une barre au design exact, le
shell ne complète pas la home et le design system n'est pas tenu là où il se voit le plus.

**Independent Test**: Sur une installation où la home et ses 8 sections sont en ligne, charger
plusieurs pages et comparer la barre rendue à la référence validée ; vérifier logo, liens simples,
état actif et chevron sans écart visible, indépendamment de toute édition de menu.

**Acceptance Scenarios**:

1. **Given** le shell installé et la home en ligne, **When** un visiteur charge une page, **Then** la barre affiche le design Piqueray (logo en encre claire, liens, fond sombre) sans écart visible par rapport à la référence.
2. **Given** une page atteinte depuis un lien simple, **When** elle s'affiche, **Then** le lien correspondant porte l'état actif Piqueray de la page courante.
3. **Given** un lien qui possède des sous-liens, **When** la barre est rendue, **Then** ce lien expose l'affordance de déroulant (chevron) au design Piqueray.
4. **Given** un lien de déroulant, **When** le visiteur l'ouvre, **Then** le sous-menu s'ouvre et navigue correctement (style de sous-menu Odoo par défaut accepté à ce stade).

---

### User Story 2 - Gérer mes liens de menu sans toucher au design (Priority: P1)

En tant que client / rédacteur du site, je gère mes liens de menu — ajouter, renommer, réordonner,
imbriquer en sous-menus, pointer vers une page interne ou une URL externe — via l'édition standard
d'Odoo, sans jamais toucher au design de la barre.

**Why this priority**: Le menu appartient au client et doit rester le sien. La valeur de la feature
est de projeter notre design **par-dessus** une donnée qui reste éditable, pas de figer le contenu.

**Independent Test**: Dans l'éditeur Odoo, partir du menu existant, ajouter un lien, en renommer un,
réordonner la liste, imbriquer un lien sous un autre, faire pointer un lien vers une page et un autre
vers une URL externe ; enregistrer, rouvrir l'éditeur et la page publique, et vérifier que le contenu
est conservé et que le design des liens simples est intact.

**Acceptance Scenarios**:

1. **Given** le menu du site, **When** le rédacteur ajoute, renomme ou réordonne un lien via l'édition standard d'Odoo, **Then** la barre reflète le changement et le design des liens simples reste intact.
2. **Given** un lien, **When** le rédacteur le fait pointer vers une page interne puis vers une URL externe, **Then** la navigation fonctionne correctement dans les deux cas.
3. **Given** deux liens, **When** le rédacteur en imbrique un sous l'autre, **Then** le lien parent obtient le chevron et le sous-menu contient l'enfant, sans intervention sur le design.
4. **Given** des modifications de menu, **When** la page est enregistrée puis rouverte (éditeur et page publique), **Then** les libellés, cibles, ordre et imbrication sont conservés à l'identique.

---

### User Story 3 - Garder l'apparence de la nav gouvernée par le contrat (Priority: P2)

En tant qu'owner du design system, l'apparence de la nav reste gouvernée par le contrat et jamais
figée en dur : elle évolue par le contrat comme les autres composants, sans toucher au contenu du
menu du client.

**Why this priority**: C'est la valeur durable, mais elle vient après la livraison visible et
l'éditabilité. Elle garantit que la nav ne devient pas une copie HTML morte que plus personne ne
peut faire évoluer par la source de vérité.

**Independent Test**: Introduire une évolution d'apparence dans le design gouverné de la nav,
régénérer la projection Odoo, et vérifier que la barre en ligne reflète la nouvelle apparence sans
réédition manuelle et sans altérer le contenu du menu. La **remise à niveau FR-013 fournit cette
évolution réelle** — aucun changement jetable n'est nécessaire.

**Acceptance Scenarios**:

1. **Given** la nav en ligne, **When** on inspecte son apparence, **Then** celle-ci provient du design gouverné (contrat header / nav-item / logo) et n'est pas figée à la main d'une manière non régénérable.
2. **Given** une évolution du design gouverné de la nav, **When** la projection Odoo est régénérée, **Then** la barre en ligne reflète la nouvelle apparence sans réédition manuelle et sans modifier les liens du client.
3. **Given** les 8 sections de contenu déjà en ligne, **When** le shell est livré, **Then** ces sections restent intactes ; la nav complète le cadre sans les modifier.

### Edge Cases

- **Menu vide** (aucun lien) : la barre (logo, éléments de shell) se rend quand même correctement, sans zone cassée.
- **Menu très long** dépassant la largeur de la barre : comportement par défaut d'Odoo (le responsive et le menu mobile sont hors périmètre) — nommé, non traité cette itération.
- **Imbrication profonde** (3 niveaux et plus) : la barre ne casse pas ; les niveaux profonds suivent le style de sous-menu par défaut (design Piqueray du sous-menu déféré).
- **Cible externe vs interne** : un lien vers une URL externe et un lien vers une page interne fonctionnent tous les deux.
- **État actif via un sous-menu** : quand la page courante est un enfant d'un déroulant, le **lien parent** dans la barre porte le soulignement Piqueray ; l'entrée du sous-menu est marquée au style Odoo par défaut.
- **Édition native du header** : le client modifie l'apparence via les options natives de header d'Odoo (non restreintes cette itération) — l'apparence peut dévier ; accepté et nommé pour cette itération.
- **Icônes sans comportement** : search, user et cart sont rendues à l'identique de la maquette mais restent inertes (pas de recherche, de compte ni de panier) — limite nommée, comportements différés.
- **Évolution du design après mise en ligne** : le design gouverné change ; la barre se régénère par projection (le header est un gabarit vivant, non un bloc figé) et le contenu du menu n'est pas touché.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La nav MUST être livrée comme le **header système** du site Odoo (le shell), et non comme un bloc de contenu droppable.
- **FR-002**: La barre **complète** — logo, liens simples, **bouton CTA** et **3 icônes (search, user, cart)** — MUST rendre le design Piqueray gouverné **sans écart visible** par rapport à la référence validée.
- **FR-003**: La nav MUST être rendue en **encre claire** (logo et liens en variante claire), pensée pour un fond sombre.
- **FR-004**: Le contenu du menu (libellés, cibles, ordre, imbrication) MUST provenir des **données de menu éditables natives d'Odoo** et MUST NOT être figé dans le balisage du gabarit.
- **FR-005**: Un rédacteur MUST pouvoir **ajouter, renommer, réordonner et imbriquer** des liens (en sous-menus), et faire pointer chaque lien vers une **page interne** ou une **URL externe**, via l'édition de menu standard d'Odoo, sans toucher au design.
- **FR-006**: Les modifications de menu MUST être **conservées après enregistrement puis réouverture** (éditeur et page publique).
- **FR-007**: Le lien de la **page courante** MUST porter l'**état actif** Piqueray (le soulignement) ; quand la page courante est un **enfant d'un déroulant**, c'est le **lien parent** dans la barre qui le porte.
- **FR-008**: Un lien simple MUST rendre le design Piqueray ; un lien **possédant des enfants** MUST exposer l'affordance de déroulant (**chevron**) au design Piqueray.
- **FR-009**: Les déroulants MUST **s'ouvrir et fonctionner dès la livraison**, au **style de sous-menu par défaut d'Odoo** (design Piqueray du sous-menu déféré).
- **FR-010**: L'apparence de la nav MUST être **gouvernée par le contrat** (header / nav-item / logo) et **régénérable par projection**, jamais figée à la main dans le balisage d'une manière non régénérable.
- **FR-011**: Toute modification du contenu du menu (ajout, renommage, réordonnancement, imbrication) MUST NOT **casser le design** de la barre ni des liens simples.
- **FR-012**: La nav MUST s'intégrer à la **home existante**, aux côtés des 8 sections de contenu déjà en ligne, **sans les modifier**.
- **FR-013**: Avant projection, `ds.header` MUST être **remis à niveau par une évolution versionnée MAJEURE (mono-variante)** : la variante Solid — **sans usage relevé** (audit 020) — est **retirée du contrat ET du set Figma** (suppression du master précédée d'une répétition sur clone, de la capture §X et d'une version nommée), et l'apparence Transparent validée est portée par des **canaux existants** (logo en variante claire, style Blanc et flèche du bouton, encre des icônes — la taille 24 est portée depuis 016) ; `ds.piqueray-logo` MUST être **adopté** (sortie du statut draft) ; les gates du dépôt MUST rester au vert et la projection MUST consommer les versions **re-épinglées**.
- **FR-014**: La barre livrée MUST inclure le **bouton CTA** (libellé « Contactez-nous », **cible fixe** vers la page contact, non éditable cette itération) et les **3 icônes** (search, user, cart) rendues à l'identique de la maquette, **sans comportement** — recherche, compte et panier restent inertes, en **limite nommée** (comportements différés).
- **FR-015**: La barre MUST être livrée dans **l'unique variante du contrat** (Transparent — l'usage des 9 maquettes ; la variante Solid est retirée par FR-013) ; la **superposition sur le hero** MUST NOT être gérée cette itération. Côté Odoo — et **uniquement** côté Odoo, sans rien écrire dans les contrats ni dans Figma au-delà du retrait FR-013 — la barre MUST être posée sur un **fond sombre/noir uni** afin que l'encre claire reste lisible et vérifiable.
- **FR-016**: À la livraison, 022 MUST **semer une fois** l'arborescence de menu de la maquette (liens et sous-liens) comme **donnée de menu native d'Odoo** ; après ce semis initial, le menu appartient au client et MUST NOT être re-semé ni écrasé par une régénération de la projection.

### Key Entities *(include if feature involves data)*

- **Barre de navigation (shell / header)** : la surface gouvernée du header du site — **mono-variante Transparent** (la variante Solid, sans usage, est retirée du contrat et du set Figma par FR-013), encre claire sur fond sombre uni côté Odoo ; porte le logo, les liens, le **bouton CTA** et les **3 icônes** (search, user, cart — apparence seule, sans comportement cette itération).
- **Lien de menu (nav-item)** : un lien de la barre — libellé, cible (page interne ou URL externe), présence d'un déroulant (chevron), état actif. Son **design** est gouverné par le contrat ; son **contenu** est une donnée éditable.
- **Menu** : l'arbre ordonné de liens (donnée native d'Odoo), propriété du client, éditable — ordre et imbrication compris.
- **Logo** : le logo Piqueray gouverné, rendu en variante claire.
- **État actif** : l'indication de la page courante (le soulignement Piqueray), portée par le lien correspondant — ou par le **lien parent** quand la page courante est un enfant de déroulant.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La barre complète (logo, liens simples, CTA, icônes) rend le design Piqueray **sans écart visible** par rapport à la référence — variante **Transparent**, comparée **sur fond sombre uni** (comparaison visuelle sous la tolérance de référence du projet, même instrument que celui des sections en ligne).
- **SC-002**: Un rédacteur peut **ajouter, renommer, réordonner et imbriquer** un lien via l'édition standard, la barre gardant son design **intact**, sans aucune intervention technique.
- **SC-003**: **100 %** des modifications de menu (ajout, renommage, réordonnancement, imbrication, changement de cible) sont **conservées** après enregistrement et réouverture.
- **SC-004**: Les déroulants **s'ouvrent et naviguent correctement** pour chaque lien possédant des enfants.
- **SC-005**: Le lien de la **page courante** porte l'**état actif** sur chaque page atteignable depuis le menu semé — le **parent souligné** quand la page courante est un enfant de déroulant.
- **SC-006**: Une évolution du design gouverné de la nav se **répercute sur la barre en ligne par régénération**, sans réédition manuelle et sans altérer le contenu du menu du client — prouvé par la **remise à niveau réelle de `ds.header` (FR-013)** : la barre en ligne rend le contrat re-épinglé (ce que la version d'avant ne rendait pas), et une régénération complète reproduit cette apparence sans réédition manuelle, le menu du client restant byte-identique ; aucun changement jetable n'est nécessaire. (La projection consommant d'emblée les versions re-épinglées, il n'existe pas d'état « avant » en ligne à capturer — la preuve porte sur la dérivation et la régénérabilité, l'évolution étant attestée par les reçus de la remise à niveau.)

## Assumptions

- Les **8 sections de contenu** de la home sont déjà en ligne ; cette feature ajoute uniquement le **shell** (la nav) et ne modifie pas ces sections.
- Le design de la nav est gouverné par `ds.header`, `ds.nav-item` et `ds.piqueray-logo`. **Constat des reçus (013, 020)** : `ds.header` v1.0.0 ne porte pas l'apparence Transparent validée et `ds.piqueray-logo` est en draft 0.1.0 — cette feature les **remet à niveau / adopte** (FR-013, remise à niveau **majeure** : la variante Solid, sans usage, est retirée du contrat et du set Figma) avant de projeter ; seul `ds.nav-item` (v1.2.0) est projeté tel quel, non modifié.
- Le menu est une **donnée native d'Odoo** (libellés, cibles, ordre, imbrication) et reste **entièrement éditable** par le client ; **aucune restriction** n'est posée cette itération. Son **contenu initial** est semé une fois à la livraison depuis l'arborescence de la maquette (FR-016) ; SC-001 et SC-005 se vérifient sur ce menu réel.
- Le header d'Odoo est un **gabarit rendu à chaque affichage** (et non un bloc droppable figé) : l'apparence est gouvernée centralement, tandis que les liens sont des données — ce qui rend la gouvernance de l'apparence (FR-010) tenable ici, contrairement aux blocs de contenu figés.
- Le **design du panneau de sous-menu** (déroulant) n'est pas encore dessiné ; le style de sous-menu **par défaut d'Odoo** est accepté pour la livraison.
- Le contrat `ds.header` compose en réalité **logo + liens + bouton CTA + 3 icônes** (la prop `fond` disparaît avec la variante Solid — FR-013) ; la barre livrée reprend cette composition **complète** (FR-014). Le libellé du CTA (« Contactez-nous ») vient aujourd'hui du **défaut de `ds.button`** par coïncidence (reçu 013 `header.content.bouton-libelle`) — la remise à niveau FR-013 le porte explicitement dans `ds.header`.
- La **comparaison visuelle** s'appuie sur l'instrument déjà employé pour les sections en ligne, contre la référence validée.

## Dependencies

- Le **module Odoo de production** (fondation posée en spec 019) et la chaîne de **projection** des composants gouvernés vers Odoo.
- Les contrats gouvernés `ds.header` (re-épinglé après la remise à niveau FR-013), `ds.piqueray-logo` (re-épinglé après adoption) et `ds.nav-item` v1.2.0 (épinglé, non modifié).
- La **référence validée** du header : décision owner `020-reference-header-20260809` (Figma courant, node `84:285`, version `2385391614633344086`), verdict 020 `ready-with-exception`, destination `shell-workstream`.
- Le **mécanisme natif de menu d'Odoo** comme source des liens éditables.

## Out of Scope *(cette itération)*

- Le **design Piqueray des sous-menus** (déféré — style Odoo par défaut en attendant).
- L'**état survol** (hover) des liens.
- Le **menu mobile** et le comportement responsive de la barre.
- La **restriction** de ce que le client peut faire du menu (l'édition du menu reste ouverte ; on pourra restreindre plus tard).
- La **superposition de la barre par-dessus le hero** (header overlay) — la barre est posée sur un fond sombre uni côté Odoo en attendant.
- Les **comportements** des 3 icônes (recherche, compte, panier) — apparence seule cette itération.
