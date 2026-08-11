# Organisms — audit responsive Figma

> État au 2026-08-11 : ce document consigne l'audit et les décisions de
> préparation. Les contrats et projections sont en cours de stabilisation ;
> aucune application Figma n'est réputée validée par ce document. Les masters
> seront traités par lots avec validation humaine. Les neuf Pages restent
> strictement en lecture seule jusqu'au message explicite `GO Pages`. Odoo et
> les interactions restent hors scope.

## Périmètre et règle

- Source auditée en direct : page Figma `DS · Organisms`, soit 17 organisms, plus leurs instances dans `Pages`.
- Test desktop : les roots pleine largeur passent de 1728 à 1440 px ; les organisms contenus passent de 1550/1552 à 1262 px, soit un Container de 1440 px avec 89 px de gouttière de chaque côté.
- Règle : le parent choisit la largeur. L'organism remplit la largeur disponible ; un Container explicite porte les gouttières ou la largeur de contenu.
- Les probes initiaux ont été faits sur des clones temporaires supprimés après mesure. Ils constituent des observations, pas une preuve d'application finale.
- Cet audit porte sur l'authoring Figma. La propagation contrats, React/HTML et Figma doit être régénérée et vérifiée avant toute écriture ; Odoo reste reporté sans repin.
- Règle de non-régression : toute simplification de master doit conserver un équivalent pour chaque variante et chaque instance actuellement utilisée dans `Pages`, avec un match visuel vérifié au viewport de référence avant validation.

## Vue d'ensemble

| Organism | Instances dans les pages | Verdict desktop | Scope pressenti |
|---|---:|---|---|
| Devis | 8 × `FIXED 1728` | Le contenu tient à 1440 si le root passe en Fill. | Mécanique |
| Formulaire | 1 × `FIXED 1550` | Root, titres, avantages et champs ne suivent pas tous leur parent. | Mécanique + contrôle visuel |
| Presentation | 3 × `HUG 1287` | Colonnes fixes et `SectionHeader` massivement rogné. | Mécanique |
| FAQ | 3 × `FIXED 1728` | Root, `SectionHeader` et lignes d'accordéon incohérents. | Mécanique + dépendances partagées |
| Coordonnees | 1 × `HUG 1728` | Colonnes 1152/576 fixes et titre rogné. | Décision de ratio/breakpoint |
| SAV | 1 × `HUG 1550` | Composition interne fixe ; titre rogné dans une colonne de 546. | Décision de composition |
| TexteSEO | 8 × `FILL 1728` | Root correct ; éléments imbriqués encore fixes. | Mécanique + dépendances partagées |
| Hero | 8 × `FILL 1728` | Root corrigé ; contenu interne ne tient pas encore à 1440. | Mécanique + dépendance partagée |
| Reassurances | 6 × `FIXED 1550` | Root, rangée et cartes fixes produisent le débordement, y compris sur le cas 5 cartes. | Refactor grid approuvé |
| Equipe | 1 × `FILL 1728` | Root et grille tiennent à 1440 sans débordement. Le contrat reflète maintenant ce Fill déjà présent dans le master. | Contrôle visuel, sans changement d'apparence |
| CategoriesPrincipales | 5 × `FILL 1728`, 2 × `HUG 1552` | Architecture cible approuvée : root Fill et grid responsive, sans variante de largeur/colonnes. | Décision approuvée ; refactor à faire |
| ProduitsECommerce | 2 × `FIXED 1596` | Track de carousel fixe ; déborde dès que le parent rétrécit. | Décision carousel |
| Realisations | 3 × `FILL 1728` | Root correct ; en-têtes et grille restent partiellement fixes. | Mécanique + décision grille |
| Footer | 9 × `FIXED 1728` | La rangée principale dépasse à 1440. | Mécanique desktop |
| Header | 9 × `FIXED 1728` | Le passage en Fill seul crée un chevauchement à 1440. | Décision navigation/breakpoint |
| HeroVideo | 1 × `FIXED 1728` | Le passage du root en Fill suffit à 1440. | Mécanique |
| Avis Google | 8 × `FIXED 1552` | Carousel/crop implicite et flèches dans des wrappers quasi nuls. | Décision carousel + fix structurel |

## Constats détaillés

### Devis

- Le root et ses 8 instances sont `FIXED 1728`.
- `Voile` et `Background` ont des contraintes qui s'étirent correctement ; le contenu central reste `HUG 900` et centré.
- Probe à 1440 avec root Fill : aucun débordement.
- Proposition : root et instances en Fill ; Container de démonstration côté page Figma. Aucun autre changement desktop.

### Formulaire

- Le root est `FIXED 1550`; ses deux colonnes sont déjà Fill avec un gap de 32.
- À la largeur nominale, un `SectionHeader` de 1550 est placé dans une colonne de 759 et rogné de 791 px.
- À 1262, les colonnes deviennent 615/615, mais les quatre `Avantage` restent à 759 et empiètent de 144 px.
- Les champs restent `HUG` à 125 ou 208 px dans des lignes disponibles de 551 à 695 px ; ils ne suivent donc pas la largeur des lignes.
- Les libellés `MentionOptionnelle` dépassent aussi plusieurs wrappers de label.
- Décision : root Fill dans un Container ; deux colonnes Fill avec gap 32 ; `SectionHeader`, avantages, champs et contrôles internes en Fill ; corriger le layout des labels. Le padding interne de 32 px du panneau formulaire reste au composant.
- Composition à préserver : Prénom/Nom et Email/Téléphone en deux colonnes égales ; Adresse, Sujet et Message en pleine largeur ; 5 `Input`, 1 `Select` pour Sujet et 1 `Textarea` pour Message.
- Les 3 boutons sont intentionnels mais leur projection actuelle est fausse : `Appeler pour une urgence` (filled + téléphone), `Voir la FAQ` (outline + flèche) et `Envoyer` (outline + flèche), et non trois fois `Contactez-nous`.
- Scope actuel strictement statique : structure, dimensions, composants imbriqués, variantes visuelles et libellés. Les interactions, validations, soumission, navigation, ouverture du Select et états fonctionnels seront traités plus tard.
- Un probe partiel confirme que cette direction supprime le débordement principal.

### Presentation

- Le root est `HUG 1287`; les colonnes sont fixes à 628 et 627 avec un gap de 32.
- Un `SectionHeader` de 1550 est rogné dans la colonne gauche de 628, soit 922 px hors parent dès la largeur nominale.
- À 1262, les colonnes fixes débordent encore de 12,5 px de chaque côté.
- Proposition testée : root Fill, deux colonnes Fill et `SectionHeader` Fill. Résultat à 1262 : aucun débordement.

### FAQ

- Le root et les 3 instances sont fixes à 1728 ; l'organism porte des gouttières de 89 px.
- À 1440, le `SectionHeader` fixe à 1550 dépasse de 55 px de chaque côté.
- Le conteneur d'accordéon devient bien 1262, mais ses trois `AccordionRow` restent à 1550 et dépassent de 144 px de chaque côté.
- Proposition testée : root Fill, `SectionHeader` Fill et toutes les lignes Fill. Résultat : aucun débordement à 1440.

### Coordonnees

- Le root est `HUG 1728`; les deux colonnes sont fixes à 1152 et 576.
- Le `SectionHeader` de 1550 est placé dans la colonne de 576 et rogné de 1022 px dès la largeur nominale.
- À 1440, le root Fill seul conserve 1728 px de colonnes et déborde de 288 px.
- Décision : root et `SectionHeader` en Fill. La grille conserve le rapport visuel actuel avec deux colonnes flexibles `2fr / 1fr` ; aucun panneau n'impose une largeur fixe ou un `max-width`. Le parent de page porte la largeur et les gouttières.
- Les deux colonnes et leurs enfants remplissent leur cellule. L'empilement mobile et les interactions de carte/contact restent hors scope.

### SAV

- Le root et sa section interne sont `HUG/FIXED 1550`.
- Le `SectionHeader` de 1550 est placé dans un bloc de 546 et rogné de 1004 px dès la largeur nominale.
- La rangée de contenu est fixe à 1288 ; les deux moitiés photo/texte restent autour de 641/647.
- À 1262, le root seul déborde de 288 px. Une simple normalisation du root ne suffit pas : section, rangée, colonnes et backgrounds doivent être coordonnés.
- Proposition : root/section/rangée Fill, colonnes flexibles, `SectionHeader` Fill ; conserver les éléments photo décoratifs fixes ou absolus à l'intérieur de la zone image. À valider visuellement car c'est une composition, pas une simple grille.

### TexteSEO

- Les 8 instances de root sont déjà Fill et les quatre blocs directs suivent la largeur interne.
- À 1440, le `SectionHeader` reste à 1550 dans un parent de 1262 ; les trois `AccordionRow` font de même.
- Certaines variantes de `SectionHeader` conservent aussi leur `Accroche` interne à 1550 après redimensionnement de l'instance.
- Proposition : conserver le root ; passer les instances imbriquées en Fill et normaliser les variantes partagées de `SectionHeader`/`AccordionRow`.

### Hero

- Décision root retenue pour la préparation : root Fill ; le Container local de démonstration porte les 1728 px. Les huit instances de Page ne doivent pas être modifiées avant `GO Pages`.
- Le background s'étire correctement.
- Le nouvel audit complet montre encore deux problèmes internes à 1440 : `SectionHeader` reste à 1550 et la ligne `sousTitre 1164 + bouton 354 + gap 32` reste dimensionnée pour 1550.
- Résultat actuel à 1440 : dépassement du titre jusqu'à 199 px à droite et empiètement de 144 px autour de la ligne texte/bouton.
- Proposition : `SectionHeader` et son texte interne en Fill ; `sousTitre` en Fill, bouton en Hug. Le root est bon, l'organism complet n'est pas encore validé responsive.

### Reassurances

- Les 6 instances de page sont fixes à 1550.
- Variantes 4 cartes : `SectionHeader` fixe 1550, frame `items` en HUG 1550, quatre cartes fixes à 363,5 avec gaps de 32. À 1262, le titre et la rangée dépassent de 144 px de chaque côté.
- Probe validé pour les deux variantes 4 cartes : root, header, `items` et cartes en Fill donnent quatre cartes de 291,5 px et aucun débordement.
- Variante 5 cartes : le track HUG fait 1945,5 px parce qu'il additionne cinq cartes fixes de 363,5 px et quatre gaps de 32 px, puis il est centré à `x = -197,75` dans un root de 1550. Le crop est la conséquence de ces largeurs fixes ; il ne définit pas un comportement carousel.
- Décision approuvée : root Fill dans le Container parent, `items` devient une grille responsive Fill et toutes les instances `Carte/Reassurance` deviennent Fill. Le cas 5 cartes suit exactement la même règle que les autres ; la grille choisit le nombre de colonnes selon sa largeur disponible.
- Correspondances obligatoires après refactor : `4 cartes + 1 CTA`, `4 cartes + 2 CTA` et `5 cartes + 1 CTA` doivent toutes rester représentables et matcher chacune de leurs instances actuelles dans `Pages`. Le nombre de CTA peut devenir une propriété/slot de l'organism ; cela ne supprime aucun état existant.

### Equipe

- Root et instance déjà Fill ; grille interne Fill.
- Probe à 1440 : aucun débordement root ou imbriqué détecté.
- Proposition : aucun changement desktop de largeur. Garder uniquement une vérification visuelle lors de la campagne globale.

### CategoriesPrincipales

- Les cinq usages pleine largeur sont déjà Fill ; les deux usages `Standard` restent `HUG 1552` et simulent les gouttières par centrage à `x = 88`.
- `Standard` : deux items fixes à 744. Dans un Container de 1262, le second déborde de 290 px.
- `Pleine largeur` : deux cartes fixes à 743. À 1440, elles dépassent de 55 px de chaque côté.
- `PleineLargeurTroisCartes` : trois cartes fixes à 474. Même dépassement de 55 px de chaque côté.
- `PleineLargeurRdv` : première carte fixe à 743, seconde en Fill. À 1440, elles deviennent 743/455 : pas de débordement, mais des colonnes déséquilibrées.
- Probe validé avec cartes/items Fill : 599/599 pour deux cartes, 378/378/378 pour trois cartes et 599/599 pour RDV, sans débordement.
- Décision approuvée : `CategoriesPrincipales` devient un root `Fill container` / `width: 100%`. Le parent de page ou son Container porte la largeur et les gouttières.
- Le root est un grid container responsive. Le nombre de colonnes dépend du nombre d'items, de la largeur disponible et d'une largeur minimale de carte à calibrer ; il ne devient pas une variante du composant.
- Les variantes `Standard`, `Pleine largeur`, `PleineLargeurTroisCartes` et `PleineLargeurRdv` ne doivent plus encoder la largeur ou le nombre de colonnes. Seules d'éventuelles différences sémantiques de contenu peuvent rester des variantes.
- Les `item` locaux de Standard et RDV seront externalisés en molécules explicites, même s'ils ne sont aujourd'hui utilisés qu'ici. Leur structure reste ainsi gouvernée et testable comme celle de `Carte/Categorie`.
- Garde-fou obligatoire : snapshot avant refactor, comparaison visuelle à 1728 sans delta non voulu, puis validation du reflow à 1440. L'externalisation ne doit produire aucune dégradation visuelle du desktop de référence.

### ProduitsECommerce

- Les deux instances sont fixes à 1596, centrées à `x = 66` dans les pages de 1728.
- `SectionHeader` reste fixe à 1550 ; `Carrousel produits` reste fixe à 1604.
- Au test Container réduit, le header dépasse de 121 px et le carousel de 148 px de chaque côté.
- Les `ProductCard` font 364 px : cette largeur fixe peut être correcte pour un track de carousel, mais pas pour le viewport.
- Proposition : root et header Fill ; viewport Fill et clip explicite ; track en HUG avec cartes fixes ; contrôles ancrés au viewport. Ne pas convertir toutes les ProductCard en Fill sans décider le comportement du carousel.

### Realisations

- Les 3 instances de root sont déjà Fill et les grids directs passent bien à 1262.
- Variante `Accroche` : le `SectionHeader` reste à 1550 et dépasse de 55 px de chaque côté à 1440.
- Variante `Presentation` : le bloc d'en-tête est fixe à 1319 ; son `SectionHeader` contient encore un texte de 1550 dans une colonne de 628, soit 922 px hors parent dès la largeur nominale.
- Les cartes de la grille restent à 339,5 ; à 1440, plusieurs dépassent leur grid de 72 px. Le root peut donc être correct alors que les tracks internes ne le sont pas.
- Proposition : en-têtes Fill + correction partagée de `SectionHeader`; rendre les colonnes/tracks de grid flexibles ou définir un changement de nombre de colonnes. Ce dernier point doit être scoppé comme comportement responsive.

### Footer

- Les 9 instances sont fixes à 1728.
- À 1440, la `Row` reste à 1385 dans une largeur interne de 1262 et dépasse le root de 34 px à droite.
- Probe validé : root et Row Fill, plus les trois `FooterColumn` en Fill, suppriment le débordement à 1440 ; background, séparateurs et spacers suivent déjà correctement.
- Décision : root Fill, fond pleine largeur, puis rangée et trois `FooterColumn` en Fill dans le Container de contenu. Le futur empilement mobile et les interactions des liens restent hors scope.

### Header

- Les 9 instances sont fixes à 1728.
- Le root passé seul en Fill à 1440 ne déborde pas du frame, mais le logo finit à `x = 269` alors que `navWrapper` commence à `x = 231` : chevauchement de 38 px.
- `navWrapper` reste HUG à 1120 ; son `nav` fait 952 avec gaps de 32, puis un gap de 64 avant 104 px d'icônes.
- Deux chevrons de `NavItem` dépassent aussi leur instance de 49 et 106 px dès la largeur nominale.
- Décision : root et conteneur interne en Fill ; logo et icônes en Hug ; zone de navigation en Fill avec espacement compressible, sans largeur fixe de nav. Corriger les wrappers/contraintes des chevrons afin qu'ils restent dans chaque `NavItem`.
- Le breakpoint compact/mobile, l'ouverture des menus et toutes les interactions de navigation restent hors scope.

### HeroVideo

- Décision validée : même règle que Hero, le root remplit son parent.
- Le master et l'unique instance sont encore `FIXED 1728`.
- Probe à 1440 avec root Fill : texte flexible, bouton Hug, aucun débordement.
- Proposition : root et instance Fill ; Container de démonstration pour la présentation Figma. Aucun autre changement desktop identifié.

### Avis Google

- Les 8 instances sont fixes à 1552 et placées dans des `GROUP`, pas dans des Containers auto-layout.
- Le root, `resume` et `cartes` savent se réduire, mais le groupe de cartes conserve ses cartes fixes ; à 1262, la cinquième dépasse de 287 px et est rognée.
- Les wrappers `flecheGauche` et `flecheDroite` font environ `0,0001 px` alors que leurs pastilles font 30 px et sont clippées. C'est un défaut structurel présent à la largeur nominale.
- Décision statique : remplacer les groupes de page par des Containers, root et viewport en Fill avec clip explicite, track en Hug et cartes à largeur fixe de carousel. Les contrôles sont ancrés au viewport et sortent des wrappers quasi nuls.
- Le crop doit être déterminé uniquement par la largeur du viewport. Défilement, nombre de pas, boucle et autres interactions du carousel restent hors scope ; chaque instance actuelle doit conserver son rendu de référence.

## Dépendances partagées à traiter une seule fois

- `SectionHeader` : 16 variantes de master à 1550. Une taille de master fixe est acceptable dans le component set, mais les instances doivent être Fill dans leur parent. Plusieurs variantes gardent encore `Accroche` ou `Titre` en Fixed après resize ; leurs enfants doivent être normalisés.
- `AccordionRow` : 4 variantes de master à 1550. Les instances utilisées dans FAQ et TexteSEO doivent remplir le frame `accordion` ; leurs enfants internes doivent suivre.
- Cartes de grille : `Carte/Reassurance` (363,5) et `Carte/Categorie` (743) peuvent être redimensionnées correctement quand l'instance est Fill. Leur largeur fixe actuelle doit rester uniquement dans un vrai track de carousel.
- `ProductCard` (364) et les cartes d'avis peuvent légitimement rester fixes dans un track, à condition que viewport, clipping et contrôles soient explicitement modélisés.

## Lots possibles pour le scope

1. **Fixes Fill desktop vérifiés** : Devis, HeroVideo, CategoriesPrincipales, Presentation, FAQ, variantes Reassurances 4 cartes, Footer, plus les corrections internes Hero/TexteSEO.
2. **Fixes imbriqués à contrôler visuellement** : Formulaire, SectionHeader partagé, AccordionRow partagé.
3. **Comportements à décider avant modification** : Coordonnees, SAV, Header, Reassurances 5 cartes, ProduitsECommerce, grille Realisations, Avis Google.
4. **Contrôle seulement** : Equipe.

Après validation d'un lot : modifier Figma, régénérer/mettre à jour les contrats gouvernés, inspecter les diffs React/HTML, tester, puis comparer visuellement à 1728 et 1440 avant toute adaptation Odoo.
