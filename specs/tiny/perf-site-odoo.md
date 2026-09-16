# Performance du site Piqueray sur Odoo — relevé et arriéré

**Ouvert le** : 2026-09-09 · **Dernière mesure** : 2026-09-10
**Mesuré sur** : `piqueray-srl-feat-website-ds-37748541.dev.odoo.com` (build Odoo.sh, branche `feat/website-ds`, addon `piqueray_ds` 19.0.1.19.0)
**Outils** : Chrome DevTools (traces de navigation, minutage), `curl` (en-têtes et temps de réponse), lecture directe de la configuration du serveur en SSH.
**Statut** : document de travail. Rien de ce qui suit n'est traité, sauf les deux correctifs de la §1.

---

## 0. Le diagnostic en trois phrases

Le symptôme rapporté par l'owner — *« au clic pour changer de page, c'est très long : le temps que ça bascule, puis le temps que ça charge »* — se décompose en **deux causes distinctes** qui n'ont rien à voir l'une avec l'autre.

1. **Le temps avant que la page bascule** = l'attente du serveur, et rien d'autre. Une fois qu'il répond, la page s'affiche en 50 ms.
2. **Le temps de chargement qui suit** = le poids de la page. Là, c'est notre contenu.

Le reste de ce document sépare ces deux moitiés, puis liste l'arriéré.

---

## 1. Ce qui est DÉJÀ corrigé (2026-09-09, vérifié en ligne)

| Défaut | État avant | État après | Preuve |
|---|---|---|---|
| **Image du hero différée** | `loading="lazy"` ajouté automatiquement par Odoo → l'image est exclue du préchargeur, demandée seulement après calcul de la mise en page → aplat gris ~0,5 s | `loading="eager"` + `fetchpriority="high"` posés explicitement | vérifié sur les 8 pages à hero image ; la 9ᵉ (accueil) a une vidéo |
| **Images non cachables** | `Cache-Control: no-cache` → revalidation bloquante à **chaque** navigation, retour arrière compris (~170 ms d'attente sur une image déjà sur le disque) | `public, max-age=31536000, immutable` | **112 URLs sur 112**, zéro exception ; au second passage `transferSize = 0` |
| **Fuite de pièces jointes** | `create()` inconditionnel à chaque composition (286 → 399 après une seule reconstruction) | réutilisation par (checksum, taille, type) | — |

**Effet mesuré** : à la deuxième page visitée, plus aucune image n'est retéléchargée et l'accueil s'affiche en **380 ms**.

**Détails techniques, pour ne pas les redécouvrir :**
- `website/models/ir_qweb.py::_post_processing_att` ajoute `loading="lazy"` à **toute** `<img>` rendue sur un site, *sauf si l'attribut est déjà présent*. C'est la seule échappatoire propre (l'autre, `data-no-post-process`, couperait aussi le CDN et la réécriture d'URL).
- `fetchpriority="high"` **n'annule pas** `lazy` : le premier fixe la priorité d'une requête, le second le moment où elle part. Il fallait retirer le différé, pas le compenser.
- `Binary.content_image` ne pose `max_age` que si l'URL porte un jeton. Sans lui, `send_file` répond `no-cache` — mécaniquement, quel que soit le mode du serveur (vérifié sur trois preuves : le code lu sur le build, la mesure comparative, et l'absence de tout chemin où le mode dev dégraderait ce cache).
- La forme d'URL retenue est celle qu'Odoo écrit lui-même (`html_editor/models/ir_attachment.py::_compute_image_src`) : `/web/image/<id>-<checksum[:8]>/<nom>`. **Effet de bord favorable** : l'éditeur retrouve nos images, donc son panneau « Format » cesse d'être vide dessus.
- **Contrainte dure introduite** : l'URL est désormais adressée par le contenu. Remplacer un fichier dans `assets/` **sans relancer la composition** laisse les visiteurs sur l'ancienne image jusqu'à un an.

---

## 2. LA MOITIÉ SERVEUR — « le temps que ça bascule »

### 2.1 Ce n'est pas notre code

Configuration lue en SSH sur le build :

```
--workers=0  --dev=reload  --max-cron-threads=2
1 processeur
```

- **`--workers=0`** : aucun processus de travail. Tout est servi par un seul fil d'exécution. La documentation et la pratique sont unanimes : ce réglage est **réservé au développement**.
- **`--dev=reload`** : un surveillant de fichiers tourne en permanence.
- **1 CPU.**

C'est la configuration que **Odoo.sh attribue délibérément aux branches de type « développement »**. `feat/website-ds` en est une. Les branches de type test ou production reçoivent une vraie configuration — mais changer le type d'une branche se fait dans l'interface Odoo.sh **du client**, et une branche de test recopie leur base de production. Ce n'est pas un geste technique anodin ni une décision d'agence.

### 2.2 Ce que ça donne, mesuré

| Situation | Temps de réponse |
|---|---|
| **En usage continu** (20 appels consécutifs, 4 pages alternées) | **78 à 266 ms** — médiane ~100 ms, aucun dépassement |
| 6 appels lancés **en parallèle** | 323 à 377 ms — pas de sérialisation observée |
| Après ~45 s d'inactivité | 283 ms |
| **Pointes isolées observées** | **950 ms · 1 774 ms · 1 863 ms** |
| **Tout premier appel après une longue inactivité** | **10 222 ms** |

**Conclusion** : le serveur est rapide quand on l'utilise, et lent quand on le réveille. Le ressenti « chaque clic est long » vient très probablement de l'usage réel — on clique, on attend, on regarde ailleurs, on reclique plus tard — où chaque clic retombe sur un serveur assoupi.

### 2.3 Décomposition d'un clic (trace Chrome, page `/a-propos`, serveur tiède)

| Étape | Durée |
|---|---|
| Attente du serveur | **348 ms** |
| Téléchargement du HTML | 1 ms |
| **Premier pixel affiché** | **400 ms** |
| Page utilisable | 402 ms |
| Chargement complet | 403 ms |

→ **Entre la réponse du serveur et l'affichage : 52 ms.** Tout le délai perçu avant la bascule est l'attente du serveur. Rien à optimiser côté navigateur sur ce trajet.

### 2.4 Remède gratuit et immédiat

**Parcourir les 9 pages une fois avant toute démonstration.** Le serveur reste réveillé, et toutes les images passent en cache d'un an — elles ne seront plus jamais retéléchargées. Trente secondes.

### 2.5 Deux faux coupables écartés

- **Le préfixe de langue** : les liens du menu ne portent **pas** `/fr`. Après la première page, aucun clic ne subit de redirection. *(Seules les adresses `/fr/…` tapées à la main coûtent un aller-retour supplémentaire : ouvrir `/fr` une fois, puis naviguer normalement.)*
- **Le retour arrière** : instantané, la page ne se recharge pas du tout (prouvé deux fois — un marqueur JavaScript survit au retour, et `pageshow.persisted === true`). Le symptôme du retour arrière venait uniquement des images en `no-cache`, désormais corrigé.

---

## 3. LA MOITIÉ POIDS — « et puis le temps que ça charge »

### 3.1 La vidéo du hero : le plus gros poste du site, et de loin

| Fait | Mesure |
|---|---|
| Transféré au chargement de l'accueil (macOS/Safari, piste HEVC) | **6 198 Ko** |
| **Sur Chrome Windows, Firefox, Android (piste H.264)** | **15 954 295 octets — 15,9 Mo** |
| Mode de téléchargement | **fichier entier, une seule requête** — pas de lecture par tranches |
| Saturation du lien (Fast 4G) | départ 1 292 ms → fin 9 773 ms = **8,5 s** |
| Effet mesuré sur le reste de la page | les 4 images de catégories du premier écran, démarrées à 1 276 ms, ne finissent qu'à **3 312 / 3 876 / 3 980 / 4 036 ms** au lieu de ~500 ms |
| Source | 42,4 s en **1920×1080** pour un cadre affiché **1440×720** |

→ **L'accueil pèse 15,5 Mo sur un Mac et ≈ 25 Mo sur un PC Windows.**

**Correctif** : ré-encoder à 1280 de large, viser **< 2 Mo**, ajouter une piste WebM/AV1, et surtout **remplacer la piste H.264 de 15,9 Mo**.
**Piège connu, ne pas y retomber** : `preload="none"` tue le démarrage automatique (mesuré le 2026-09-08 ; mémoire projet `odoo-video-fond-hero`).

### 3.2 Les images : 35,6 Mo pour 112 fichiers

**Six PNG photographiques pèsent 6,3 Mo à eux seuls**, et cinq sont présents sur l'accueil *et* sur Portes de garage :

| Fichier | Poids | Affiché dans |
|---|---|---|
| `pqr_rea1.png` | 1 455 518 o | vignette de 310 px |
| `pqr_rea5.png` | 1 351 681 o | vignette |
| `pqr_rea2.png` | 1 246 343 o | vignette |
| `pqr_rea4.png` | 1 072 680 o | vignette |
| `pqr_devis.png` | 892 191 o | bandeau, sur 5 pages |
| `pqr_rea3.png` | 698 502 o | vignette |

→ **1,4 Mo pour une vignette de 310 px.** Constaté pendant l'audit : en 4G, des cases grises restent plusieurs secondes à l'écran.
**Correctif** : conversion en WebP qualité 80 — gain attendu de l'ordre de 80 %.

### 3.3 Aucune image n'est servie à la bonne taille

`srcset` : **zéro occurrence** sur les 9 pages. Pires cas (largeur source ÷ largeur d'affichage réelle, dpr 2) :

| Fichier | Source | Affiché | Facteur | Page |
|---|---|---|---|---|
| `pqr_prod_mot_2.jpg` | 1440 px | 206 px | **×3,50** | motorisation |
| `pqr_rlz_res_8.jpg` | 1600 px | 284 px | ×2,82 | résidentielles |
| `pqr_rea_res_3` · `rea_ind_2` · `rea_ent_4` · `equipe_survol_04→08` | 1728 px | 308 px | ×2,81 | 4 pages |
| `pqr_prod_mot_1.jpg` | 1080 px | 206 px | ×2,62 | motorisation |
| `pqr_rlz_ind_9.jpg` | 1386 px | 284 px | ×2,44 | industrielles |

**Correctif** : Odoo redimensionne nativement (`/web/image/<id>/<w>x<h>/`) — il « suffit » de poser `srcset` + `sizes` dans le composeur.
**À savoir** : Odoo ne met **aucune** variante redimensionnée en cache côté serveur — il recalcule à chaque requête non conditionnelle. Mieux vaut pré-redimensionner à la création de la pièce jointe.

**Cas inverse, une seule fois** : le hero de `/portes-residentielles` est en **1200×650 pour un cadre de 1440×640** — agrandi de 20 %, donc flou. Les 7 autres heros sont en 1696–1728 px. À réexporter.

### 3.4 À propos charge 6,5 Mo avant qu'on ait bougé

Mesure à `scrollY = 0`, 3,5 s après chargement : **38 requêtes, 6 560 Ko**, dont **12 fichiers `pqr_equipe_survol_* = 5 508 Ko`**. Ce sont les photos qui ne servent **qu'au survol** d'un portrait. Elles portent bien `loading="lazy"` et se situent à 1 940 px sous la ligne de flottaison — **Chrome les charge quand même**.

**Correctif** : ne pas les poser dans le DOM au rendu ; les insérer au premier survol. À défaut, les recompresser (1728 px pour un cadre de 308 px).

### 3.5 Polices et bundles

| Fait | Mesure | Correctif |
|---|---|---|
| **Deux feuilles Google Fonts bloquantes** (Inter, Inter Tight) | démarrées à 191 ms, `renderBlockingStatus: blocking` | Inter n'habille que **2 éléments** (un lien d'évitement invisible + un `h4` du pied) contre **126** en Montserrat → **supprimer les deux appels** et basculer ces 2 textes sur Montserrat |
| `preconnect` mal ciblé | vise `fonts.gstatic.com`, **pas** `fonts.googleapis.com` qui est le domaine bloquant | corriger, ou disparaît avec le point ci-dessus |
| **Montserrat non préchargé** | les 4 fichiers (19 Ko chacun) ne démarrent qu'à **288 ms**, découverts par le CSS ; `font-display: swap` → **saut de texte réel sur 126 éléments**, visible en 4G | `<link rel="preload" as="font" crossorigin>` sur les poids **400 et 700** |
| **FontAwesome préchargé en priorité maximale** | **76 Ko**, sur les 9 pages, pour **0 icône utilisée** (comptage `.fa` = 0) | retirer le preload du bundle frontend |
| `web.assets_frontend_lazy.min.js` | 654 Ko compressés / **2 257 Ko décompressés**, dont 20 Ko de rustines inutiles | bundle Odoo natif, **non bloquant** (chargé en `data-src`), peu actionnable |

### 3.6 Cache : trois fichiers hors régime

`hero-video.hevc.mp4`, `hero-video.h264.mp4` et `fontawesome-webfont.woff2` sortent en `max-age=86400` **sans** `immutable` → **une revalidation par jour et par visiteur, sur un fichier de 6,2 Mo**.
Cas mineur : `favicon` et `logo` en `private` au lieu de `public` (cache navigateur correct, cache partagé/CDN impossible).

**À savoir** : `^/web/image` fait partie des filtres CDN par défaut d'Odoo. Tant que les URL sortaient en `no-cache`, **aucun CDN ne pouvait rien mettre en cache partagé**. Le correctif de la §1 débloque ça aussi.

---

## 4. Relevé par page

TTFB froid = première mesure ; TTFB chaud = médiane des 2 passes suivantes. « 1er écran » = octets transférés avant tout défilement.

| Page | TTFB froid | TTFB chaud | Affichage principal | 1er écran | Total | Requêtes | Images |
|---|---|---|---|---|---|---|---|
| `/` accueil | 890 ms | 125 / 1038 ms | **620 ms** (poster vidéo) | 2 302 Ko | **15 486 Ko** | 28 | 8,74 Mo |
| `/portes-de-garage` | 134 ms | 120 / 119 ms | 480 ms | 2 433 Ko | 8 123 Ko | 22 | 7,59 Mo |
| `/portes-residentielles` | 137 ms | 149 / 394 ms | 288 ms | 3 803 Ko | 7 836 Ko | 29 | 7,30 Mo |
| `/portes-industrielles` | 419 ms | **1 863** / 126 ms | 280 ms | 2 748 Ko | 5 073 Ko | 30 | 4,60 Mo |
| `/portes-entree` | 126 ms | 783 / 137 ms | 304 ms | 3 144 Ko | 4 812 Ko | 29 | 4,35 Mo |
| `/motorisation` | 147 ms | 302 / 131 ms | 332 ms | 2 737 Ko | 2 737 Ko | 22 | 2,33 Mo |
| `/depannage-sav` | 127 ms | 335 / 124 ms | **1 492 ms** (TTFB 1 182 ms) | 2 125 Ko | 2 125 Ko | 17 | 1,73 Mo |
| `/a-propos` | 408 ms | 352 / 148 ms | 548 ms | **6 560 Ko** | **10 493 Ko** | 51 | 9,89 Mo |
| `/contactez-nous` | 127 ms | 294 / 152 ms | 316 ms | 777 Ko | 777 Ko | 15 | 0,41 Mo |

---

## 5. Ce qui va bien, et qu'il ne faut pas casser

- **Décalage visuel au chargement : 0,00.** Rien ne bouge pendant que la page se charge.
- **Affichage principal sous 620 ms sur 8 pages sur 9** en réseau câblé.
- **En navigation à chaud, toutes les images reviennent du cache** (`transferSize = 0`) et l'accueil s'affiche en **380 ms**.
- **Retour arrière instantané**, sans rechargement.
- **Un seul CSS bloquant** de 164 Ko (hors les deux Google Fonts à supprimer).
- **Aucune erreur 4xx/5xx**, **113 médias sur 113 servis**.

---

## 6. Arriéré, par gain décroissant

| # | Chantier | Gain attendu | Effort | Nature |
|---|---|---|---|---|
| **P1** | **Ré-encoder la vidéo du hero** (1280 de large, < 2 Mo, WebM/AV1, remplacer la piste H.264 de 15,9 Mo) | **−13 à −24 Mo sur l'accueil**, fin de la saturation de 8,5 s | moyen | média |
| **P2** | **Charger les 12 photos de survol de l'équipe au survol**, pas au rendu | **−5,5 Mo sur À propos** | moyen | code |
| **P3** | **Convertir les 6 gros PNG en WebP** | **−5 Mo environ** sur 2 pages | faible | média |
| **P4** | **Poser `srcset` + `sizes`** dans le composeur (pré-redimensionner à la création de la pièce jointe) | jusqu'à ×3,5 par image | moyen | code |
| **P5** | **Supprimer les deux appels Google Fonts** et basculer les 2 textes concernés sur Montserrat | −2 requêtes bloquantes | faible | code |
| **P6** | **Précharger Montserrat 400 et 700** | fin du saut de texte sur 126 éléments | faible | code |
| **P7** | **Retirer le preload FontAwesome** | −76 Ko en priorité maximale, sur 9 pages | faible | code |
| **P8** | **Servir vidéos et FontAwesome en `immutable`** (nom de fichier versionné) | fin de la revalidation quotidienne d'un fichier de 6,2 Mo | faible | code |
| **P9** | **Réexporter le hero de `/portes-residentielles`** à 1728 px | image nette au lieu d'agrandie de 20 % | faible | média |
| **P10** | *(décision client)* **Type de branche Odoo.sh** : une branche de développement reçoit 1 CPU et aucun processus de travail | fin des pointes à 1–2 s | — | décision |

---

## 7. Consignes d'exploitation, tant que l'arriéré n'est pas traité

1. **Préchauffer** : parcourir les 9 pages une fois avant toute démonstration. Le serveur reste réveillé et les images passent en cache. *(Sans ça, le premier appel peut prendre 10 s.)*
2. **Ouvrir `/fr` une seule fois**, puis naviguer normalement — les liens du menu sont déjà propres.
3. **Ne pas commencer par `/a-propos`** (6,5 Mo au chargement).
4. **Vérifier que « Réduire les animations » est désactivé** sur le poste, sinon la vidéo du hero ne démarre pas (comportement voulu).
5. **Ne pas juger la vitesse depuis un Mac** : la vidéo y pèse 6 Mo au lieu de 15,9 Mo. Tester au moins une fois sur Chrome Windows ou Firefox.

---

## Annexe · Ce que les mesures ont démenti

| Hypothèse | Ce que la mesure dit |
|---|---|
| « Les images du hero sont trop lourdes » | **Faux** : 0,24 à 0,53 Mo, chargées en 44 à 110 ms. Le retard venait du différé et du cache. |
| « `fetchpriority=high` suffit à corriger le différé » | **Faux** : les deux attributs sont indépendants. Une image `lazy` + priorité haute reste différée, puis cherchée en priorité haute — le pire des deux. |
| « `loading="eager"` améliore les performances » | **Faux en théorie** (c'est la valeur par défaut). Sa seule utilité ici : empêcher Odoo de réinjecter `lazy`. Gain réel : ~400 ms, pour cette raison-là uniquement. |
| « Un `<link rel=preload>` sur le hero aiderait » | **Non** : l'image est une vraie `<img>` avec son adresse dans le HTML, le préchargeur la trouve déjà. Le preload n'aurait servi que si c'était une image de fond CSS. |
| « Le `no-cache` est un artefact du serveur de test » | **Faux**, sur trois preuves indépendantes : le code lu sur le build, la mesure comparative (même image, seul le jeton change), et l'absence de tout chemin où le mode dev dégraderait ce cache. |
| « Un placeholder flou (LQIP) comblerait l'attente » | **À ne pas faire** : ça remplace un aplat gris par un aplat flou sans avancer l'arrivée de l'image, et ça n'améliore généralement pas la mesure. |
| « Le retour arrière recharge la page » | **Faux** : instantané, prouvé deux fois. |
| « Chaque clic subit une redirection à cause de `/fr` » | **Faux** : les liens du menu sont sans préfixe. Seules les adresses tapées à la main coûtent un aller-retour. |
| « Le serveur sérialise les requêtes » (hypothèse tirée de `--workers=0`) | **Non observé** : 6 appels parallèles répondent tous en 323–377 ms. |
| « Composer les 9 pages prend une heure » | **~15 min** — le renvoi des images est incrémental. |
