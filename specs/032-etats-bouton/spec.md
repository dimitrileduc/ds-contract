# Feature Specification: États d'interaction du Bouton gouverné

**Feature Branch**: `032-etats-bouton`

**Created**: 2026-09-04

**Status**: Draft

**Input**: User description: « États d'interaction du Bouton gouverné — survol, pressé, focus clavier. Périmètre `ds.button` seul. L'apparence au repos ne change pas, orange compris. »

## Contexte

La home v2 (Figma → contrat → Odoo) ne répond à aucun geste de l'utilisateur. Relevé le 2026-09-04 : les 39 contrats déclarent des états vides, le CSS livré dans l'addon Odoo ne contient pas une seule règle de survol, et le fichier Figma ne porte aucune variable de survol, de focus ou de pressé sur ses 298 variables.

Le seul survol qui existe aujourd'hui sur le site est écrit **à la main** dans la couche de pont Odoo, pour les deux icônes sociales du pied de page. Il est invisible du différentiel des trois surfaces, donc hors gouvernance. C'est exactement la dette que cette vague remplace par un mécanisme.

Sur la planche `031 · DEMO HOME DESKTOP`, **14 des 18 éléments cliquables** de la page sont des instances de `ds.button` : tous les appels à l'action, « Lire la suite », « Voir tous les avis », le lien PDF des catégories et les flèches du carrousel. Traiter le Bouton couvre donc l'essentiel du besoin en un seul composant.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Le bouton répond au geste, sur le site (Priority: P1)

Un visiteur arrive sur la home. Il promène sa souris : chaque bouton qu'il survole change d'aspect, il comprend qu'il est cliquable avant de cliquer. Sur téléphone, où le survol n'existe pas, l'appui du doigt provoque un changement visible : c'est le seul retour qui confirme que le geste a été pris.

**Why this priority** : c'est le besoin métier. Un site qui ne réagit pas au survol est perçu comme cassé ou figé. Le pressé n'est pas du confort : sur mobile, sans lui, l'utilisateur ne sait pas si son doigt a porté.

**Independent Test** : ouvrir la home Odoo, survoler puis presser chacun des 7 styles de bouton, et constater un changement visible à chaque fois. Livrable seul, sans le focus clavier ni la planche Figma.

**Acceptance Scenarios** :

1. **Given** la home Odoo affichée sur ordinateur, **When** le visiteur survole un bouton plein, **Then** son fond change de manière perceptible à l'œil.
2. **Given** la home Odoo affichée, **When** le visiteur survole un bouton à simple contour, **Then** le bouton se remplit et son texte s'inverse pour rester lisible.
3. **Given** la home Odoo affichée, **When** le visiteur survole « Lire la suite » ou « Voir tous les avis » (style Link, sans fond), **Then** la couleur du libellé change.
4. **Given** la home Odoo sur téléphone, **When** le visiteur appuie sur un bouton, **Then** le bouton se contraste davantage pendant l'appui.
5. **Given** n'importe quel bouton survolé ou pressé, **When** on mesure le contraste du libellé sur son fond, **Then** il n'est jamais inférieur au contraste du même bouton au repos.

---

### User Story 2 — Le focus clavier est visible partout (Priority: P2)

Une personne qui navigue au clavier parcourt la page par tabulations. À chaque arrêt sur un bouton, un contour net apparaît autour de lui. Cela vaut sur les sections claires comme sur les sections sombres — le hero vidéo et le pied de page ont un fond foncé.

**Why this priority** : c'est une obligation d'accessibilité, pas un choix de style. Le contour est aujourd'hui totalement absent. C'est en second rang parce que le survol sert plus de visiteurs, mais l'écart de conformité est plus grave.

**Independent Test** : parcourir la home au clavier uniquement, de haut en bas, et vérifier qu'aucun bouton ne prend le focus sans contour visible, y compris dans le hero et le pied de page.

**Acceptance Scenarios** :

1. **Given** la home affichée, **When** l'utilisateur atteint un bouton par tabulation, **Then** un contour plein d'au moins 2 pixels apparaît autour du bouton.
2. **Given** un bouton posé sur une section à fond sombre, **When** il reçoit le focus, **Then** le contour reste distinguable de ce fond.
3. **Given** un bouton posé sur une section à fond clair, **When** il reçoit le focus, **Then** le contour reste distinguable de ce fond.
4. **Given** un utilisateur qui clique à la souris, **When** le bouton est activé, **Then** le contour de focus n'apparaît pas — il est réservé à la navigation clavier.

---

### User Story 3 — Le designer lit les états sans lancer le site (Priority: P3)

Un designer ouvre le master Bouton dans Figma. Il y trouve une grille : ses styles en lignes, les états en colonnes. Il voit d'un coup à quoi ressemble un bouton orange survolé sans démarrer le site. Cette grille est **fabriquée par le moteur depuis le contrat**, jamais dessinée à la main, donc elle ne peut pas se désynchroniser du site.

**Why this priority** : c'est du confort de conception, pas du service rendu au visiteur. Mais c'est aussi ce qui empêche la grille de pourrir : dans les systèmes où elle est dessinée à la main, elle diverge toujours.

**Independent Test** : ouvrir le master Bouton dans Figma et constater la grille complète. Livrable après les deux autres histoires, sur lesquelles il n'a aucun effet.

**Acceptance Scenarios** :

1. **Given** le contrat déclare ses états, **When** le sync est lancé sur le fichier, **Then** le master porte un axe État avec une case par style et par état.
2. **Given** le master gagne cet axe, **When** l'opération se termine, **Then** les 354 instances du fichier restent rattachées à leur master, aucune n'est orpheline.
3. **Given** un designer modifie une case de la grille à la main, **When** le différentiel est relancé, **Then** l'écart est signalé comme dérive.

---

### Edge Cases

- **Un bouton sur fond sombre.** Le hero vidéo et le pied de page ont un fond foncé. Aucune couleur unique de la palette n'atteint le seuil de contraste sur fond clair **et** sur fond sombre : le mécanisme du contour de focus doit résoudre ce cas, pas le contourner.
- **Le style Link n'a pas de fond.** Il n'a rien à assombrir. Son retour au survol doit passer par un autre canal.
- **Le bouton icône seule n'a pas de libellé.** Son retour repose entièrement sur le fond et la bordure.
- **Le survol collant sur écran tactile.** Sur certains navigateurs mobiles, l'état de survol reste appliqué après un appui, jusqu'au geste suivant. Le comportement attendu doit être décidé.
- **Les pages Odoo déjà posées.** Un bloc posé dans Odoo est du HTML figé : rien ne s'y propage. Toucher le contrat fait basculer les 13 blocs installés en « structure périmée », et chaque page composée doit être reconstruite puis resauvegardée.
- **Un jumeau préexistant dans le master.** Si le fichier contient déjà une case portant le nom qu'une nouvelle case devrait prendre, elle ne doit jamais être supprimée : la supprimer orphelinerait ses instances de façon irréversible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001** : Chacun des 7 styles du Bouton MUST présenter un changement d'aspect perceptible au survol.
- **FR-002** : Les deux styles à simple contour MUST se remplir au survol, avec un libellé inversé qui reste lisible.
- **FR-003** : Chacun des 7 styles MUST présenter un état pressé, distinct du survol et du repos.
- **FR-004** : Le focus clavier MUST afficher un contour en trait plein d'au moins 2 pixels, distinct de l'état de survol.
- **FR-005** : Le contour de focus MUST atteindre un contraste d'au moins 3 pour 1 avec son environnement immédiat, sur fond clair **comme** sur fond sombre.
- **FR-006** : Le contour de focus MUST NOT apparaître lors d'une activation à la souris.
- **FR-007** : Toute valeur de couleur d'état MUST être portée par un jeton gouverné. Aucune valeur écrite en dur n'est acceptée : une valeur littérale est invisible du différentiel par construction.
- **FR-008** : Le master Figma MUST recevoir son axe d'états **généré depuis le contrat**. Aucune case ne doit être dessinée à la main.
- **FR-009** : L'opération sur le canevas MUST préserver le rattachement des 354 instances existantes, sans créer de doublon ni orpheliner de case.
- **FR-010** : L'apparence **au repos** des 7 styles MUST rester strictement identique sur les trois surfaces (code livré, canevas, site Odoo).
- **FR-011** : Le CSS livré à Odoo MUST recevoir les règles d'état par génération. Aucune règle d'état écrite à la main ne doit subsister dans le dépôt à la fin de la vague.
- **FR-012** : Le défaut de contraste préexistant du style Orange (libellé blanc sur fond orange, 2,42 pour 1 face à un minimum de 4,5) MUST être consigné comme limite nommée et documentée. Il n'est **pas** corrigé par cette vague.
- **FR-013** : Le style Link, qui n'a ni fond ni bordure, MUST signaler son survol et son pressé par un **changement de couleur de son libellé** (décision owner du 2026-09-04). L'impossibilité d'exprimer un soulignement style par style MUST être nommée comme limite dans la documentation de capacité, avec cette décision pour repli.
- **FR-014** : L'absence de réaction de prototype dans Figma (le « play mode ») MUST être nommée comme limite. Un ajout manuel serait effacé au prochain sync.
- **FR-015** : Au moins une des trois évaluations aujourd'hui en quarantaine que ce changement débloque MUST être restaurée et passer. Une capacité ne s'annonce jamais sans évaluation derrière.
- **FR-016** : Avant toute écriture sur le canevas vif, l'état antérieur de toutes les cibles touchées MUST être capturé et un point de retour nommé posé sur le fichier.
- **FR-017** : Une seconde exécution du sync sur le canevas MUST être sans effet (aucun nœud créé, aucun modifié). C'est la preuve d'idempotence.
- **FR-018** : Après le changement de contrat, la page composée dans Odoo MUST être reconstruite et resauvegardée, et plus aucun bloc ne doit rester signalé en structure périmée.
- **FR-019** : Aucun état ne MUST rendre un bouton **moins** lisible qu'au repos. Le contraste du libellé sur son fond, dans chaque état, doit être supérieur ou égal à celui du même style au repos. C'est le seul garde-fou cohérent avec la décision de ne pas corriger le défaut préexistant du style Orange (FR-012) : la vague n'a pas le droit d'aggraver ce qu'elle a défense de réparer.

### Key Entities

- **Jeton d'état** : une couleur gouvernée, nommée par style et par état, qui relie le contrat, le fichier de conception et le site. C'est le seul canal par lequel une couleur d'état peut voyager.
- **Axe d'états du master** : la dimension supplémentaire que le master Bouton gagne dans le fichier de conception. Elle appartient au moteur, jamais au designer.
- **Contrat du Bouton** : le document de référence unique. Il déclare quels états existent et quelle couleur chacun porte, et les deux surfaces en découlent.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001** : Sur les 7 styles, 7 présentent un survol et un pressé visibles à l'œil sur la home Odoo.
- **SC-002** : Le contour de focus atteint au moins 3 pour 1 sur les quatre fonds de page utilisés par le site, dont le fond sombre du hero et du pied de page.
- **SC-003** : 354 instances sur 354 restent rattachées à leur master après l'opération sur le canevas. Zéro orpheline, zéro doublon.
- **SC-004** : Zéro règle d'état écrite à la main subsiste dans le dépôt.
- **SC-005** : Le compte d'évaluations passe de 244 sur 244 à au moins 245 sur 245, la case supplémentaire couvrant la capacité annoncée.
- **SC-006** : La comparaison d'image de l'état **au repos**, avant et après la vague, donne un écart nul sur les 7 styles.
- **SC-007** : Toutes les portes du dépôt sont vertes, comparées à la ligne de base relevée avant de commencer (244 sur 244, arbre propre, différentiel sans écart actif, six portes Odoo vertes).
- **SC-008** : La home Odoo est reconstruite et resauvegardée, et le contrôle de version des blocs ne signale plus aucune structure périmée.
- **SC-009** : Une seconde exécution du sync ne modifie aucun nœud.

## Assumptions

- Les cinq couleurs d'état proposées ont été calculées (assombrissement de 10 %, éclaircissement de 12 %) puis **posées et validées** par l'owner sur la planche `PROPOSITION — États du Bouton`, nœud `2738:15904`, page `DS · Atomes`. Le relevé est donc postérieur au calcul : cette entorse à la règle de propreté de source doit être écrite dans les descriptions de jetons, pas passée sous silence.
- L'état désactivé est hors périmètre : aucun bouton de la home n'est inactif.
- Une seule page Odoo réelle est composée aujourd'hui (`home`). Les huit autres descripteurs sont des pages de test.
- Le fichier de conception de travail est « Piqueray (Copy) », pas le fichier du client.
- Toute écriture sur le canevas vif est arbitrée par l'owner, jamais décidée par l'agent.
- Le mécanisme d'ajout d'axe préserve les identifiants : vérifié sur le simulateur du dépôt, non encore vérifié sur le fichier vif.

## Faits déjà établis — à ne pas re-découvrir

- **Prouvé sur le simulateur du dépôt** (contrat modifié en local puis intégralement reverti, 2026-09-04) : le générateur accepte les états sans refus ; le script du Bouton déclare 7 cases de base plus 14 cases d'état ; l'ajout de l'axe sur un set existant conserve le nœud et la clé, **renomme les 7 cases d'origine sur place en préservant leurs identifiants**, crée 14 cases neuves, et ne produit aucun doublon. Le CSS Odoo et le CSS React reçoivent les règles d'état sans qu'une ligne soit écrite à la main.
- **Blocage mesuré, et bon marché à lever.** Le sync des jetons refuse aujourd'hui : deux styles de texte du menu n'ont pas leur marqueur d'identité, alors que leurs définitions vives sont identiques à leur recette. Le déblocage est une migration de marqueur seul, écriture de métadonnée pure, sans effet visuel. La documentation de la chaîne de jetons désigne les mauvais styles et doit être corrigée.
- **Piège écarté.** Une bague de focus à deux tons obtenue par ombre portée entrerait en collision avec la propriété que le Bouton utilise déjà pour dessiner ses bordures, et les effacerait pendant le focus, **sans erreur ni signalement**. Ce mécanisme est interdit pour cette vague.
- **Cascade Odoo cartographiée.** Toucher le contrat déplace l'empreinte de graphe globale, recopiée à la main dans quatre endroits, dont quatorze fois dans un même fichier de vues.

## Hors périmètre

- Toute modification de l'apparence au repos, style Orange compris.
- L'élément de navigation `ds.nav-item` et le nettoyage du survol manuel du pied de page : vague suivante.
- Les réactions de prototype dans Figma.
- L'état désactivé.
