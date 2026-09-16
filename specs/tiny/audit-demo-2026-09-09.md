# Audit avant démo client — site Piqueray sur Odoo

**Date** : 2026-09-09 · **Démo visée** : vendredi 2026-09-12
**Mesuré sur** : `https://piqueray-srl-feat-website-ds-37748541.dev.odoo.com` (build Odoo.sh, branche `feat/website-ds`, addon `piqueray_ds` 19.0.1.19.0)
**Méthode** : trois audits indépendants — vitesse (Chrome, 1440×900 dpr 2, câble + Fast 4G), visuel/contenu (9 pages parcourues en 1440 puis 390, accordéons ouverts, en visiteur anonyme), navigation (373 liens rendus, 23 destinations distinctes, 113 médias, toutes testées).
**Portée** : les 9 pages du site. Aucun fichier modifié pendant l'audit.

---

## 0. L'état en une page

Le site **fonctionne** : 9 pages servies, aucune erreur serveur, aucun bloc cassé, aucun décalage visuel au chargement (CLS mesuré = 0,00), formulaire de contact propre, sous-menu et menu mobile conformes, retour arrière instantané.

Ce qui cloche se range en **quatre familles**, et trois d'entre elles se voient à l'écran :

| Famille | Ampleur | Qui corrige |
|---|---|---|
| **A · Poids et vitesse** | 15,5 Mo sur l'accueil (25 Mo hors Mac), 6,5 Mo sur À propos avant tout défilement | code + ré-export des médias |
| **B · Contenu manquant ou faux** | 26 réponses d'accordéon vides sur 35, 3 fiches d'équipe « Prénom/Poste », 4 fautes, contenus d'une gamme sur une autre | **owner** (rédaction) + code |
| **C · Restes d'Odoo par défaut** | page fantôme US publiée, site nommé « My Website », copyright 2025 | code |
| **D · Liens qui sortent du site** | 20 liens vers un domaine inexistant, 36 liens sociaux en 404 | décision + réglage |

**Deux correctifs ont déjà été posés et vérifiés en ligne le 2026-09-09** : l'image du hero n'est plus différée (`loading="eager"` + `fetchpriority="high"`, tenu sur les 8 pages concernées) et les 112 images sont servies en cache d'un an (`public, max-age=31536000, immutable`, zéro exception). Conséquence mesurée : à la deuxième page visitée, plus aucune image n'est retéléchargée et l'accueil s'affiche en 380 ms.

---

## 1. POIDS ET VITESSE — la famille que l'œil ressent en premier

### 1.1 La vidéo du hero : le plus gros défaut de performance du site

| Fait | Mesure |
|---|---|
| Poids transféré au chargement de l'accueil | **6 198 Ko** (piste HEVC, macOS/Safari) |
| Poids sur Chrome Windows, Firefox, Android | **15 954 295 octets — 15,9 Mo** (piste H.264) |
| Mode de téléchargement | **fichier entier, une seule requête**, pas de lecture par tranches |
| Durée de saturation du lien (Fast 4G) | départ 1 292 ms → fin 9 773 ms = **8,5 s** |
| Effet mesuré sur le reste | les 4 images de catégories du premier écran, démarrées à 1 276 ms, ne finissent qu'à **3 312 / 3 876 / 3 980 / 4 036 ms** au lieu de ~500 ms |
| Format source | 42,4 s en 1920×1080 pour un cadre affiché 1440×720 |

**C'est elle qui rend l'accueil poussif, pas les photos.** Et le poids annoncé de 6 Mo est le cas *favorable* : sur la machine d'un client sous Windows, l'accueil pèse **≈ 25 Mo**.

**Correctif** : ré-encoder à 1280 de large, viser **< 2 Mo**, ajouter une piste WebM/AV1, et surtout remplacer la piste H.264 de 15,9 Mo.
**Piège connu, ne pas y retomber** : `preload="none"` tue le démarrage automatique (mesuré le 2026-09-08, mémoire projet `odoo-video-fond-hero`).

### 1.2 Les images : 35,6 Mo pour 112 fichiers

**Six PNG photographiques pèsent à eux seuls 6,3 Mo** — et cinq d'entre eux sont sur l'accueil *et* sur Portes de garage :

| Fichier | Poids | Affiché dans |
|---|---|---|
| `pqr_rea1.png` | 1 455 518 o | vignette de 310 px |
| `pqr_rea5.png` | 1 351 681 o | vignette |
| `pqr_rea2.png` | 1 246 343 o | vignette |
| `pqr_rea4.png` | 1 072 680 o | vignette |
| `pqr_devis.png` | 892 191 o | bandeau, sur 5 pages |
| `pqr_rea3.png` | 698 502 o | vignette |

→ **1,4 Mo pour une vignette de 310 px.** Constaté pendant l'audit : en 4G, des cases grises restent plusieurs secondes à l'écran.
**Correctif** : conversion en WebP qualité 80 — gain attendu de l'ordre de 80 % sur ces six.

**Aucune image du site n'est servie à la bonne taille** (`srcset` : zéro occurrence sur les 9 pages). Pires cas, largeur source ÷ largeur d'affichage réelle :

| Fichier | Source | Affiché | Facteur | Page |
|---|---|---|---|---|
| `pqr_prod_mot_2.jpg` | 1440 px | 206 px | **×3,50** | motorisation |
| `pqr_rlz_res_8.jpg` | 1600 px | 284 px | ×2,82 | résidentielles |
| `pqr_rea_res_3` / `rea_ind_2` / `rea_ent_4` / `equipe_survol_04→08` | 1728 px | 308 px | ×2,81 | 4 pages |
| `pqr_prod_mot_1.jpg` | 1080 px | 206 px | ×2,62 | motorisation |
| `pqr_rlz_ind_9.jpg` | 1386 px | 284 px | ×2,44 | industrielles |

**Correctif** : Odoo sait redimensionner nativement (`/web/image/<id>/<w>x<h>/`) — poser `srcset` + `sizes` dans le composeur.

**Cas inverse, une seule fois** : le hero de `/portes-residentielles` est en **1200×650 pour un cadre de 1440×640** — agrandi de 20 %, donc flou. Les 7 autres heros sont en 1696–1728 px. À réexporter.

### 1.3 À propos charge 6,5 Mo avant qu'on ait bougé

Mesure à `scrollY = 0`, 3,5 s après chargement : **38 requêtes, 6 560 Ko**, dont **12 fichiers `pqr_equipe_survol_*` = 5 508 Ko**. Ce sont les photos qui ne servent qu'au survol d'un portrait. Elles portent bien `loading="lazy"` et sont à 1 940 px sous la ligne de flottaison — Chrome les prend quand même.

**Correctif** : ne pas les poser dans le DOM au rendu ; les insérer au premier survol. À défaut, les recompresser (1728 px pour un cadre de 308 px).

### 1.4 Polices et bundles

| Fait | Mesure | Correctif |
|---|---|---|
| Deux feuilles Google Fonts **bloquantes** (Inter, Inter Tight) | démarrées à 191 ms, bloquantes | Inter n'habille que **2 éléments** (un lien invisible + un `h4` du pied) contre 126 en Montserrat → **supprimer les deux appels** |
| `preconnect` mal ciblé | vise `fonts.gstatic.com`, **pas** `fonts.googleapis.com` qui est le domaine bloquant | corriger ou supprimer avec le point ci-dessus |
| Montserrat non préchargé | démarre à 288 ms, découvert par le CSS ; `font-display: swap` → **saut de texte réel sur 126 éléments**, visible en 4G | `<link rel="preload" as="font" crossorigin>` sur les poids 400 et 700 |
| FontAwesome préchargé en priorité maximale | **76 Ko**, sur les 9 pages, pour **0 icône utilisée** (comptage `.fa` = 0) | retirer le preload du bundle frontend |
| `web.assets_frontend_lazy.min.js` | 654 Ko compressés / 2 257 Ko décompressés | bundle Odoo natif, non bloquant, peu actionnable |

### 1.5 Cache : conforme, sauf trois fichiers

**115 ressources sur 118 en `immutable`.** Les trois exceptions : `hero-video.hevc.mp4`, `hero-video.h264.mp4` et `fontawesome-webfont.woff2` sortent en `max-age=86400` **sans** `immutable` → une revalidation par jour et par visiteur, sur un fichier de 6,2 Mo.
Cas mineur : `favicon` et `logo` en `private` au lieu de `public` (cache navigateur OK, cache partagé/CDN non).

### 1.6 Temps de réponse par page

| Page | 1er octet à froid | à chaud | Affichage principal (câble) | 1er écran | Total | Requêtes |
|---|---|---|---|---|---|---|
| `/` accueil | 890 ms | 125 / 1038 ms | **620 ms** | 2 302 Ko | **15 486 Ko** | 28 |
| `/portes-de-garage` | 134 ms | 120 / 119 ms | 480 ms | 2 433 Ko | 8 123 Ko | 22 |
| `/portes-residentielles` | 137 ms | 149 / 394 ms | 288 ms | 3 803 Ko | 7 836 Ko | 29 |
| `/portes-industrielles` | 419 ms | **1 863** / 126 ms | 280 ms | 2 748 Ko | 5 073 Ko | 30 |
| `/portes-entree` | 126 ms | 783 / 137 ms | 304 ms | 3 144 Ko | 4 812 Ko | 29 |
| `/motorisation` | 147 ms | 302 / 131 ms | 332 ms | 2 737 Ko | 2 737 Ko | 22 |
| `/depannage-sav` | 127 ms | 335 / 124 ms | **1 492 ms** | 2 125 Ko | 2 125 Ko | 17 |
| `/a-propos` | 408 ms | 352 / 148 ms | 548 ms | **6 560 Ko** | **10 493 Ko** | 51 |
| `/contactez-nous` | 127 ms | 294 / 152 ms | 316 ms | 777 Ko | 777 Ko | 15 |

**Deux faits d'exploitation, hors code :**
- **Le tout premier appel au site a mis 10,22 s** — l'instance de test s'endort. *Ouvrir le site 3 minutes avant la démo et cliquer deux pages.*
- **Le temps de réponse est erratique sur un build de test** : médiane 55–150 ms, mais pointes mesurées à 1 863 ms, 1 182 ms et 1 038 ms sur des passes consécutives. Pour une démo fiable, viser un build de production.
- Les adresses en `/fr/…` répondent **303 vers l'adresse sans `/fr`** : un aller-retour de plus par page. *Ouvrir `/fr` une seule fois au début, puis naviguer sans — la langue tient par cookie.*

---

## 2. CONTENU MANQUANT OU FAUX

### 2.1 Les accordéons — 26 réponses vides sur 35

Le défaut de contenu le plus étendu du site. Seule la question ouverte par défaut porte un texte ; les autres sont vides. **Et deux affichent littéralement le mot « Réponse »** (`/portes-de-garage` : « Budget et Devis sur mesure », « Zone d'intervention Piqueray »).

Les plus graves, parce que la page promet explicitement d'y répondre :

| Page | Question sans réponse |
|---|---|
| `/depannage-sav` | « Votre porte ne se ferme plus ? » et « Votre télécommande ne semble plus fonctionner ? » — sur une page titrée *« Nous pouvons peut-être déjà vous aider ! »* |
| `/portes-residentielles` | « Quelle est la différence entre une porte sectionnelle et basculante ? » — la question phare de la page |
| `/portes-industrielles` | 2 réponses sur 3 vides |
| `/portes-entree` | 2 sur 3 vides |
| `/motorisation` | 2 sur 3 vides |
| `/a-propos` | 2 sur 3 vides |
| `/contactez-nous` | « Accès et parking », « Zones de déplacement pour devis » |

**Owner uniquement.** À lancer immédiatement, c'est le seul poste qui demande de l'écriture métier.

### 2.2 Les trois fiches d'équipe d'usine

`/a-propos`, positions 6, 7 et 8 : **« Prénom » / « Poste »**, avec de vraies photos affichées. Visible au bureau comme en mobile. Le défaut le plus voyant du site.

### 2.3 Quatre fautes visibles

| Faute | Où |
|---|---|
| **« alluminium »** (deux L) | titre de FAQ, `/portes-entree` |
| **« Marque Hormann renommée »** (tréma manquant) | réassurance, `/a-propos` |
| **« W/m³K »** au lieu de **W/m²K** | réassurance « Isolation thermique », `/portes-residentielles` (la page Portes d'entrée l'écrit correctement) |
| **« correctement ?Pas de panique »** (espace manquant) | bloc SAV, accueil en mobile |

À quoi s'ajoute, invisible à l'écran mais lu par Google : le titre de l'accueil se lit « …portes HÖRMANN**en** Province de Liège ».

### 2.4 Contenu d'une gamme sur la page d'une autre

- **Le bandeau Devis affiche des portes de garage sur `/portes-entree`** (`pqr_devis.png`).
- **La seule réponse de FAQ non vide de `/portes-entree`** (« Peut-on motoriser une ancienne porte ? ») est recopiée de la page portes de garage — hors sujet.
- **La carte « Pour portes de garage » de `/motorisation`** réutilise `pqr_rea_res_2.jpg`, une photo de maison de la page Résidentielles, qui ne montre aucune motorisation.

### 2.5 La photo au filigrane d'un site tiers

`pqr_cat_entree.png` / `pqr_cat_ent_1.jpg` portent le filigrane **« Mūsų… »** (site lituanien) dans une bulle blanche. Recadré et invisible à 1440, **bien visible en mobile sur l'accueil**. La même photo sert **trois fois** sur le site : carte catégorie de l'accueil, carte « Portes en acier » et réassurance « Isolation thermique » de Portes d'entrée. **Risque juridique, pas seulement esthétique.**

### 2.6 Deux jeux de textes de réassurance coexistent

`/a-propos` et `/contactez-nous` portent **4 cartes** avec des formulations différentes du reste du site (« Conseils personnalisés » vs « Conseil personnalisé », « Devis gratuits **effectués** » vs « **réalisés** », pas de point final). Les autres pages en portent 5.

---

## 3. RESTES D'ODOO PAR DÉFAUT

**C'est la famille la moins chère à corriger et la plus embarrassante si on tombe dessus.**

| # | Fait | Où ça se voit |
|---|---|---|
| C1 | **Une page fantôme `/contactus` est PUBLIÉE** : page de démonstration Odoo intégrale en anglais — « My Company », « 3575 Fake Buena Vista Avenue », « +1 555-555-5556 », « info@yourcompany.example.com », bouton « Submit » violet hors charte | atteignable depuis « Plan du site », dans le pied des 9 pages |
| C2 | **« Plan du site » (`/pages`) est une page Odoo brute** : pas d'en-tête, titre « Pages », champ « Search… », entrée « Home » — en anglais | pied des 9 pages |
| C3 | **Le nom du site n'a jamais été renseigné** : « My Website » apparaît dans le titre d'onglet de `/pages`, `/contactus` et de la page 404 | 3 pages |
| C4 | **Copyright « © 2025 »** | pied des 9 pages |
| C5 | **Meta-description = « This is the homepage of the website »** (anglais, valeur Odoo par défaut) sur l'accueil ; **aucune** sur les 8 autres | ce que Google affichera |
| C6 | **Page 404** sans en-tête ni navigation, bouton violet hors charte | — |
| C7 | **Une version `/en/` est active** et sert le contenu français à l'identique | contenu dupliqué indexable |
| C8 | **Le site de test n'a pas de `noindex`** | Google peut l'indexer |

---

## 4. LIENS QUI SORTENT DU SITE

Sur **373 liens rendus** et **23 destinations distinctes**, tout répond — **sauf deux destinations**, et elles totalisent 56 liens.

| Destination | Occurrences | Verdict |
|---|---|---|
| `https://shop.piqueray.be` | **20** (16 fiches produit + 4 boutons « Voir les produits », accueil et motorisation) | **le domaine n'existe pas** (NXDOMAIN). Pas de `target="_blank"` : le client **quitte le site** sur une erreur DNS du navigateur. `piqueray.be/shop` répond 500. |
| `/website/social/facebook` et `/instagram` | **36** (4 par page × 9) | **404** — les champs sociaux d'Odoo sont vides. **Les bonnes adresses existent déjà dans le contenu de la page Contact** (`facebook.com/piqueraysprl/` et `instagram.com/piqueraysrl/`, toutes deux en 200) : il suffit de les recopier dans les réglages. |

**Point à noter, qui corrige une alerte précédente** : les 24 `href="#"` du HTML sont **tous** dans des gabarits d'éditeur jamais rendus. **Zéro lien mort visible.** Vérifié deux fois (analyse du HTML + comptage sur le DOM vif).

### 4.1 La page Portes de garage est orpheline du menu

« Portes de garage » dans la barre **n'est pas un lien** : c'est un bouton de dépliage (limite Odoo — un parent qui a des enfants perd son adresse, `ODOO-LIMIT-MENU-PARENT-HREF`). Et **la page ne figure pas non plus dans son propre sous-menu**, qui ne liste que Résidentielles / Industrielles / Motorisation.
→ **La page `/portes-de-garage` n'est atteignable depuis aucun menu**, uniquement par la carte de l'accueil. Un seul lien dans tout le site y mène.
Corollaire : sur cette page, **aucune entrée du menu n'est marquée active**.

### 4.2 Trois icônes mortes dans l'en-tête

Compte, panier, enveloppe : décoratives, aucun lien. **Le panier laisse croire à une boutique intégrée** — d'autant plus gênant que les liens boutique sont morts (§4).

### 4.3 Une erreur JavaScript sur les 9 pages

`TypeError: Cannot read properties of null (reading 'querySelector')` — la routine `autohideMenu` d'Odoo cherche un `.top_menu` que notre en-tête gouverné n'a pas. **Aucun effet visible** (la fonction abandonnée est le repli du menu natif, inutilisé), mais la console est sale à chaque chargement. Consigné comme `B-007` depuis le 2026-08-31.

---

## 5. DÉFAUTS DE MISE EN PAGE

| Fait | Où |
|---|---|
| **La 5ᵉ carte de réassurance reste seule sur une deuxième ligne**, avec 3 emplacements vides à droite (grille de 4, contenu de 5) | accueil, portes-de-garage |
| **La 5ᵉ fiche du carrousel produits est coupée net au bord droit** (piste de 2272 px dans 1440), alors que la marge de gauche fait 48 px | accueil, motorisation |
| **Les titres des fiches produit sont tronqués** — deux télécommandes Hörmann deviennent indiscernables | accueil, motorisation |
| **Le bouton de fin de carrousel ne se grise pas** en bout de piste | accueil, motorisation |
| « LIRE LA SUITE » des avis **non aligné en bas** (2 hauteurs différentes) ; un avis affiché **en entier** garde son « lire la suite » | 8 pages |
| **La carte Google reste un bloc vide de 1040 × 665 px** plusieurs secondes ; en mobile la zone reste blanche pendant tout le défilement | contactez-nous |
| **La carte Google déborde jusqu'au bord gauche** et sa vignette d'info est coupée | contactez-nous |
| Le bloc Présentation laisse **~200 px de vide** sous le titre de la colonne de gauche | accueil, portes-de-garage, a-propos |
| La photo détourée du technicien **déborde de la carte et est coupée net en bas** | accueil, bloc SAV |
| **Le bandeau Devis est un collage de deux photos** : raccord vertical net, températures de couleur différentes | 6 pages |
| En mobile, le bandeau Devis recadré ne montre **plus aucune porte** — que du ciel et des pavés | portes-de-garage |
| **Deux mises en page pour le même composant** : cartes catégories en texte incrusté (accueil, portes-de-garage) vs image + texte dessous (résidentielles) | — |
| Un badge de certification **coupé au bord droit** | portes-entree, réassurance « Sécurité renforcée » |
| **La section Équipe n'a aucun titre** — la grille de portraits démarre sans introduction | a-propos |
| Entre **992 et 1113 px de largeur de fenêtre, la nav chevauche le logo** de jusqu'à 121 px (connu, non corrigé) | 9 pages |
| En mobile, un glissé sur le plan Google **panote la carte** au lieu de faire défiler la page | contactez-nous |

---

## 6. CHOIX D'IMAGES ET DE CONTENU DISCUTABLES

- **Réassurance « Sécurité renforcée »** (`/portes-entree`) : photo d'un **cambrioleur au pied-de-biche**. Anxiogène.
- **Réassurance « SAV & maintenance »** (`/portes-entree`) : image de synthèse d'enfants qui jouent — sans rapport avec le SAV.
- **Réassurance « SAV & maintenance »** (`/portes-industrielles`) : utilitaire dans un hangar sombre et encombré, cadrage coupé, très en dessous des trois autres.
- **Galerie Réalisations** (`/portes-industrielles`) : la grande photo d'ouverture est **à 60 % de la neige** ; plusieurs autres sont des chantiers avec terre retournée et gravats.
- **Carte « Portes avec portillon intégré »** : ne montre aucun portillon.
- **« Portes en acier »** (`/portes-entree`) : visuel de catalogue Hörmann visiblement daté.
- **« Pilotez à distance »** (`/motorisation`) : photo stock très datée (iPhone 6, plage), basse définition.
- **Galerie** (`/portes-residentielles`) : photos amateur (ciel gris, herbes folles) à côté de photos studio ; la photo « Porte basculante » est nettement plus sombre et bleutée que sa voisine.
- **Quatre pictogrammes identiques** (le logo Piqueray) pour quatre arguments différents, page Contact.
- **Les 5 avis Google sont espacés d'exactement un mois** (« il y a 2, 3, 4, 5, 6 mois ») — suite trop parfaite.
- **La note affichée se contredit sur la même page** : notre bloc annonce **4,8 / 93 avis**, la carte Google juste à côté affiche **4,7 / 112 avis**.
- **Trois cartes « BROCHURE … »** (`/motorisation`) ne mènent à aucune brochure — les trois pointent sur le formulaire de contact.
- **« EN SAVOIR PLUS »** du hero de l'accueil mène au formulaire : promesse d'information, arrivée sur un formulaire.
- **« Hörmann » est souligné** dans le texte de présentation **sans être un lien** — ressemble à un lien cassé.
- **`/motorisation` est deux fois plus courte que ses sœurs** (3 468 px contre ~6 300) : ni réassurances, ni avis Google, ni réalisations. *À confirmer : voulu ou oublié ?*

---

## 7. CONFORMITÉ ET RÉFÉRENCEMENT

| Fait | Conséquence |
|---|---|
| **« CGV » et « Politique de confidentialité » du pied ne sont pas des liens**, et les pages n'existent pas (`/cgv`, `/politique-de-confidentialite` → 404) — alors que **le formulaire fait signer « j'ai lu et accepté la politique de confidentialité »** | juridique |
| **Aucun numéro de TVA / BCE ni mention légale** au pied, pour une société belge | juridique |
| **Aucune bannière cookies** alors que Google Maps est chargé | RGPD |
| **Textes alternatifs absents en masse** : 18/23 images sur l'accueil, 39/43 sur À propos, 13/13 sur Motorisation, 9/9 sur Dépannage, 6/6 sur Contact | accessibilité + référencement |
| Meta-descriptions absentes ou en anglais (voir C5) | référencement |
| Version `/en/` active servant le contenu français (voir C7) | contenu dupliqué |
| Pas de `noindex` sur le site de test (voir C8) | indexation involontaire |
| **Pas de reCAPTCHA** sur le formulaire | spam, pas un problème de démo |
| Horaires : le **samedi manque** au pied de page | information |

---

## 8. CE QUI VA BIEN, ET QU'IL FAUT DIRE

- **Décalage visuel au chargement : 0,00.** Rien ne bouge pendant que la page se charge.
- **En navigation à chaud — le cas réel d'une démo qui enchaîne les pages — toutes les images reviennent du cache**, et l'accueil s'affiche en **380 ms**.
- **Affichage principal sous 620 ms sur 8 pages sur 9** en réseau câblé.
- **Retour arrière instantané**, sans rechargement (prouvé deux fois : marqueur JS survivant + `pageshow.persisted === true`).
- **Aucune erreur 4xx/5xx** sur les pages, **113 médias sur 113 servis**, aucune image de remplacement déguisée.
- **Formulaire de contact** : 5 étiquettes liées, `autocomplete` correct, champs requis signalés, résumé d'erreurs accessible, validation vérifiée sans envoi.
- **Sous-menu desktop** : ouverture au clic, fermeture par Échap avec retour du focus, fermeture au clic dehors. Conforme.
- **Menu mobile à 390 px** : s'ouvre, l'accordéon se déplie, la page courante est signalée, Échap ferme et rend le focus. *(Un seul défaut : `aria-expanded` du burger reste « false ».)*
- **Zéro lien mort visible** sur 373 liens rendus.

---

## 9. RÉPARTITION DU TRAVAIL

### 9.1 Ce qui ne peut venir que de l'owner

| # | Quoi | Volume |
|---|---|---|
| O1 | **Rédiger les 26 réponses d'accordéon** | ~26 paragraphes courts |
| O2 | **Les 3 noms et fonctions de l'équipe** | 3 lignes |
| O3 | **Une photo de remplacement** pour la photo filigranée (utilisée 3 fois) | 1 fichier |
| O4 | **Le texte des CGV et de la politique de confidentialité** + le n° de TVA | 2 pages |
| O5 | **Décider du sort des 20 liens boutique** : créer le sous-domaine, pointer vers la vraie boutique, ou rediriger vers Contact | 1 décision |
| O6 | **Décider des réassurances à 5 cartes** : en retirer une, ou assumer la 5ᵉ seule sur sa ligne | 1 décision |
| O7 | **Confirmer que `/motorisation` est volontairement plus pauvre** (ni avis, ni réassurances, ni réalisations) | 1 décision |
| O8 | Fournir de meilleures photos pour les cas du §6 | selon arbitrage |

### 9.2 Ce qui se corrige dans le code et survit aux envois

| # | Quoi | Effort |
|---|---|---|
| K1 | Dépublier `/contactus`, corriger « Plan du site », renseigner le nom du site | 30 min |
| K2 | Copyright 2026, horaires du samedi, n° de TVA au pied | 15 min |
| K3 | Les 4 fautes (§2.3) + l'espace manquant du titre de l'accueil | 15 min |
| K4 | Renseigner les URL sociales **dans le module** (pour qu'elles survivent à un build neuf) — corrige 36 liens | 20 min |
| K5 | Rendre `/portes-de-garage` atteignable (entrée dans le sous-menu) | 20 min |
| K6 | Téléphone et e-mail cliquables sur la page Contact | 15 min |
| K7 | Remettre les bonnes images de gamme (bandeau Devis, carte motorisation) | 20 min |
| K8 | `noindex` sur le site de test + décider du sort de `/en/` | 20 min |
| K9 | Retirer les 3 icônes mortes de l'en-tête (au minimum le panier) | 15 min |
| K10 | `aria-expanded` du burger mobile | 10 min |
| K11 | Supprimer les deux appels Google Fonts, précharger Montserrat 400 et 700, retirer le preload FontAwesome | 45 min |
| K12 | Corriger l'erreur JavaScript `autohideMenu` (B-007) | 30 min |

### 9.3 Ce qui demande un ré-export de médias

| # | Quoi | Gain attendu |
|---|---|---|
| M1 | **Ré-encoder la vidéo du hero** (1280 de large, < 2 Mo, remplacer la piste H.264 de 15,9 Mo) | **le plus gros gain de tout le site** |
| M2 | **Convertir les 6 PNG en WebP** (6,3 Mo) | ~80 % sur ces fichiers |
| M3 | **Poser `srcset` + `sizes`** dans le composeur (Odoo redimensionne nativement) | jusqu'à ×3,5 d'économie par image |
| M4 | **Charger les 12 photos de survol de l'équipe au survol**, pas au rendu | −5,5 Mo sur À propos |
| M5 | Réexporter le hero de `/portes-residentielles` à 1728 px | image nette |
| M6 | Servir les vidéos et FontAwesome en `immutable` | plus de revalidation quotidienne |

---

## 10. CONSIGNES POUR LE JOUR DE LA DÉMO

1. **Ouvrir le site 3 minutes avant** et cliquer deux pages — la première visite a mis **10,22 s** (l'instance dort).
2. **Ouvrir `/fr` une seule fois**, puis naviguer sans le préfixe (sinon une redirection par page).
3. **Vérifier que « Réduire les animations » est désactivé** sur le Mac, sinon la vidéo du hero ne démarre pas.
4. **Ne pas cliquer** : les fiches produit et « Voir les produits » (domaine mort), les icônes sociales du pied (404), « Plan du site » (page Odoo brute menant au fantôme US), les trois icônes de l'en-tête (inertes).
5. **Ne pas redimensionner la fenêtre en direct** entre 992 et 1113 px (la nav chevauche le logo).
6. **Ne pas commencer par `/a-propos`** (6,5 Mo au chargement, et les 3 fiches « Prénom / Poste »).
7. **Ne pas tester l'envoi du formulaire** (pas de serveur de messagerie sur un build de test).
8. **Si l'éditeur est montré** : l'ouvrir sur `/fr` (sinon il s'ouvre en mode traduction), et ne pas poser de bloc avec le pied de page à l'écran (la zone du copyright est une cible de dépôt valable, et le pied est global — le bloc atterrirait sur les 9 pages).
9. **Le build est marqué « failed » chez Odoo** à cause d'un module comptable du client : c'est normal et documenté, le site fonctionne. Ne pas montrer la page du build.
10. **Un build de test vit 24 à 48 h** et **chaque envoi détruit le précédent** : refaire l'envoi jeudi, pas mercredi, et ne rien pousser vendredi matin.

---

## Annexe · Ce que cet audit corrige d'affirmations antérieures

| Affirmation antérieure | Ce que la mesure dit |
|---|---|
| « Des liens morts `href="#"` subsistent » | **Faux** : les 24 occurrences sont dans des gabarits d'éditeur jamais rendus. Zéro lien mort visible sur 373. |
| « Le retour arrière recharge la page » | **Faux** : le retour arrière est instantané. Le symptôme venait des images en `no-cache`, désormais corrigé. |
| « Les arguments industriels s'affichent sur Portes d'entrée » | **Corrigé** dans le dépôt le 2026-09-09 ; vérifié en ligne. |
| « 11 membres d'équipe en « Prénom/Poste » » | **3**, comptés dans le descripteur et confirmés à l'écran. |
| « Les images du hero sont trop lourdes » | **Faux** : 0,24 à 0,53 Mo, chargées en 44 à 110 ms. Le retard venait du différé et du cache, pas du poids. |
| « Composer les 9 pages prend une heure » | **~15 min** — le renvoi des images est incrémental. |
