# TinySpec: les photos de page en WebP, à leur taille d'affichage

**Date**: 2026-09-15
**Status**: converti, recomposé et **mesuré en parité sur instance jetable** — production non faite
**Complexity**: medium

## What

Les 131 photos de page pesaient **42,5 Mo**. Elles pèsent **6,9 Mo** — **−84 %**.
Cause traitée : la dimension, pas le format. Les images étaient 2 à 6 fois plus
larges que l'emplacement où elles s'affichent.

Traite **P3** et **P4** de l'arriéré de `specs/tiny/perf-site-odoo.md`, mais P4
par un chemin différent de celui qu'il proposait : redimensionnement en amont au
lieu de `srcset`.

## Authority and observed facts

### Les quatre décisions d'owner (2026-09-15)

1. **Pas d'adaptatif.** Une seule image par emplacement. Zéro `srcset`, zéro
   `<picture>` — vérifié : le module n'en contient aucun.
2. **WebP partout.** Nos images sont servies par `/web/image/<id>-<checksum>/<nom>`,
   une URL **sans dimension** : Odoo rend les octets tels quels sans jamais ouvrir
   l'image. Son moteur `ImageProcess` — qui refuse le WebP en entrée — n'est pas
   sur ce chemin. Et quand le client remplace une image depuis l'éditeur, c'est
   **son** fichier qui passe par la chaîne Odoo ; le format du nôtre n'y change rien.
3. **Double densité sous 400 px d'emplacement.** Les vignettes sont nettes
   aujourd'hui sur un écran Retina ; les réduire à la taille exacte aurait été la
   seule régression visible de la passe.
4. **Images seules.** La vidéo du hero (P1, 15,9 Mo) reste dehors : elle vit dans
   le module gouverné et dans le dépôt client, pas dans le contenu.

### La largeur cible est le MAXIMUM sur les quatre paliers, pas le desktop

Le fait le moins intuitif de la passe, et celui qui aurait cassé le résultat s'il
avait été manqué. Il n'y a qu'une image pour tous les écrans : elle doit couvrir
son cas le plus large, **et ce cas n'est pas toujours le grand écran** — le nombre
de colonnes change avec le palier.

| Carte réassurance | 390 | 834 | 1200 | 1728 |
|---|---:|---:|---:|---:|
| disposition | 1/ligne | **1/ligne** | 4 colonnes | 5 colonnes |
| largeur de l'image | 342 | **738** | 248 | 284 |

Dimensionner « au desktop » (284) aurait étiré l'image à 738 sur **toutes les
tablettes**. Même inversion pour la photo SAV (563 en wide, **738** en tablette).

Colonne de contenu par palier : **342 / 738 / 1088 / 1550** — aucune gouttière de
page, la gouttière vit dans chaque section (24/48/56/89). Confirmé
`responsive/categories-principales.pqr.css:24-25`.

| Famille | Cible | Règle |
|---|---:|---|
| fond hero, affiche vidéo, fond devis | 1728 | pleine largeur, `object-fit: cover` — `generated/components.pqr.css:3092` |
| fond SAV | 1550 | `calc(100% - 2×89)` — `responsive/sav.pqr.css:139` |
| carte catégorie | 818 | 743 en wide (2 cartes, `flex: 1 1 0`) × 1,1 du zoom au survol — `responsive/carte-categorie.pqr.css:118` |
| grande tuile de réalisation | 743 | `grid-column: span 2` — `responsive/realisations.pqr.css:19` |
| carte réassurance | 738 | une carte par ligne sous 992 |
| photo SAV | 738 | colonne unique sous 992 |
| tuile de réalisation normale | 743 | couverte par la grande tuile (340 × 2 = 680 < 743) |
| photo d'équipe (repos et survol) | 284 **→ 568** | grille 5 colonnes — `responsive/equipe.pqr.css:99`. Fondu croisé, pas un zoom : même boîte |
| produit e-commerce | 230 **→ 460** | carte à largeur fixe 288 en wide |

### Le défaut que seule la mesure a attrapé : la rotation EXIF

**Quatorze des 131 fichiers portent une consigne de rotation.** Leur en-tête
annonce 1920×1440 quand l'image se voit en 1440×1920.

- Les **navigateurs** appliquent cette consigne — `image-orientation: from-image`
  est la valeur initiale en CSS depuis 2020.
- **`ffprobe`, `sips` et `cwebp` ne l'appliquent pas** : ils lisent l'en-tête.

La première conversion, faite en appelant `cwebp` directement, a donc produit
**quatorze images couchées à 90°** — et un WebP ne porte plus d'EXIF, donc plus
rien ne rattrape le coup côté navigateur. Le fond de la section devis partait de
travers sur huit pages.

Aucune relecture de code ne l'aurait vu : le fichier était valide, du bon poids,
aux bonnes proportions déclarées. **C'est la mesure de parité qui l'a montré**,
par une bande entièrement rouge sur le diff, puis par la comparaison des deux
rendus côte à côte.

Correctif : **tout passe désormais par `ffmpeg`**, qui applique la rotation au
décodage — y compris les 117 fichiers non tournés. Une règle qui ne vaut que pour
certains fichiers est une règle qu'on oubliera. Vérifié au passage : le profil ICC
survit au PNG intermédiaire, sans quoi les couleurs auraient glissé en silence.

Les quatorze : `devis`, `rea_ind_4`, `rea_res_1`, `rlz_ent_3..9` (sept),
`rlz_res_2..5` (quatre).

### Ce que la mesure a trouvé, et que personne n'avait vu

- **Cinq fichiers `.png` contenaient des octets JPEG** (`cat_entree`, `cat_garage`,
  `devis`, `hero`, `sav_bg`). `img_url` déduit le MIME de l'extension : Odoo les
  publiait en `image/png`. Corrigé mécaniquement.
- **Deux orphelins** : `hero.png` (655 Ko, plus cité que par un exemple du README)
  et `hero_video.png` (**2,4 Mo**, conservé par `hero-video-facade.md:41` sans usage).
- **Deux images mortes qui coûtaient quand même** : `coordonnees_plan` et
  `coordonnees_plan_v2` (292 Ko). La part `coordonnees-map` porte un `<iframe>`
  Google Maps ; `set_img` ne pose un média que sur `<video>` ou `<img>` et
  **retourne en silence**. Mais `img_url()` est évalué AVANT l'appel : les octets
  étaient lus, hashés et publiés en `ir.attachment`. Une image publiée que
  personne ne voyait.
- **Trois paires d'octets rigoureusement identiques** (SHA-256) :
  `cat_ent_1`=`rea_ent_2`, `cat_mot_1`=`rea_res_2`, `hero_portes_residentielles`=`rea_res_4`.
  **Non fusionnées** : elles servent des emplacements de tailles différentes et
  divergent après redimensionnement.
- **Une seule image utilise vraiment la transparence** : `sav_tech` (40,12 % de
  pixels non opaques). Onze autres PNG déclaraient un canal alpha entièrement
  opaque. Le WebP la porte nativement, sans cas particulier.
- **Le dossier n'était surveillé par rien** : ni `evals/golden.json`, ni un cliché
  de parité, ni un `*:check`. Le seul filet était le `FileNotFoundError` de
  `img_url`, qui ne se déclenche qu'en composant contre une instance vivante.

## Changes

1. **`scripts/odoo/optimize-images.ts`** (NOUVEAU) — outil d'**auteur**, hors de
   `npm run build`, hors de toute porte. Table de familles écrite en clair ;
   **`ffmpeg 9.0.1` décode et redimensionne** (Lanczos), `cwebp 1.6.0` encode
   (q82, `-metadata icc` pour garder le profil couleur, `-alpha_q 100`).
   N'écrit rien sans `--write`. Écrit `assets/MANIFEST.json`.
2. **`scripts/odoo/check-images.ts`** + **`npm run odoo:images:check`** (NOUVEAU) —
   la porte. Elle **n'encode rien** : elle mesure les octets committés. Six refus,
   nommés. Le nom est délibérément distinct de `odoo:assets`, qui existe déjà et
   désigne les assets **du module**, un dossier sans rapport.
3. **`integrations/odoo/authoring/assets/`** — 126 fichiers convertis, 4 supprimés,
   1 déjà conforme (`hero_video_facade.webp`, que la conversion aurait **alourdi**
   de 61 à 67 Ko). Tout est en `.webp`.
4. **`pages/contactez-nous.json`**, **`pages/coordonnees-test.json`** — clés
   `coordonnees-map` retirées.
5. **`specs/037-…/tools/poser-photo.sh`** — écrivait `$NOM.jpg` en dur, et
   redimensionnait avec `sips` (macOS seul). Passe au WebP par `cwebp`, sans
   décider de la taille : il dépose, l'outil d'optimisation applique la règle.
6. **`integrations/odoo/authoring/README.md`** — la doc disait `assets/<nom>.png`.

## Invariants

- **Aucun contrat, aucun jeton, aucun gabarit QWeb, aucune CSS touchés.**
  Surface de re-scellement : **zéro** (`assets/` n'entre dans aucune empreinte).
- Aucun nom de fichier ne change, à l'extension près : les descripteurs
  référencent par stem, ils sont inchangés sauf les deux clés mortes.
- `compose_page.py` non modifié.
- Les six parts qui portent `data-pqr-native-image` gardent les outils natifs
  d'Odoo : le client peut toujours remplacer ces images depuis l'éditeur.

## Done when

- [x] 127 photos, toutes en WebP, chacune sous la largeur cible de sa famille.
- [x] `npm run odoo:images:check` vert, et **prouvé refusant** : un JPEG déposé à
      côté d'un WebP, un octet altéré et un fichier hors manifeste ont chacun été
      refusés par leur nom.
- [x] L'outil est **idempotent** : un WebP déjà à sa taille n'est pas réencodé —
      sans cette garde, chaque relance le dégraderait en silence.
- [x] `npm run odoo:pages:check` vert.
- [x] **Les 9 pages recomposées en local** et mesurées en A/B contre les mêmes
      pages composées avec les anciennes images : **8 verts avant, 8 verts après,
      les mêmes**.
- [ ] **Production** — geste séparé, sur mot de l'owner, hors heures.

## Evidence

### Le relevé, par page

Poids d'images par page, avant pris dans `git ls-tree HEAD`, après dans le
manifeste. Les colonnes « avant » recoupent le relevé réseau indépendant du
2026-09-10 (`perf-site-odoo.md` §4) : home 8,74 Mo, portes-de-garage 7,59 Mo,
motorisation 2,33 Mo, depannage-sav 1,73 Mo — à l'identique.

| Page | images | avant | après | gain |
|---|---:|---:|---:|---:|
| `/a-propos` | 38 | 10,49 Mo | **1,31 Mo** | −88 % |
| `/` accueil | 15 | 8,74 Mo | **1,08 Mo** | −88 % |
| `/portes-de-garage` | 9 | 7,59 Mo | **1,01 Mo** | −87 % |
| `/portes-residentielles` | 17 | 7,59 Mo | **2,03 Mo** | −73 % |
| `/portes-entree` | 17 | 4,67 Mo | **1,68 Mo** | −64 % |
| `/portes-industrielles` | 17 | 4,60 Mo | **0,77 Mo** | −83 % |
| `/motorisation` | 9 | 2,33 Mo | **0,89 Mo** | −62 % |
| `/depannage-sav` | 4 | 1,73 Mo | **0,65 Mo** | −62 % |
| `/contactez-nous` | 1 | 0,41 Mo | **0,12 Mo** | −71 % |
| **moyenne** | | **5,35 Mo** | **1,06 Mo** | **−80 %** |

### Parité visuelle — la vraie preuve

Mesure A/B sur la même instance jetable (`piqueray-odoo-037`), même module, mêmes
descripteurs : composition des 9 pages avec les ANCIENNES images, mesure, puis
avec les nouvelles, mesure. Seule la variable « images » change.

**Instrument prouvé répétable** avant de conclure quoi que ce soit : trois passes
consécutives sans rien changer rendent exactement les mêmes scores à la décimale.

| | avant | après |
|---|---:|---:|
| rapports verts | **8 / 36** | **8 / 36** — les mêmes |
| scores en baisse (meilleurs) ou inchangés | | **32 / 36** |
| scores en hausse | | 4, de +0,6 à +1,8 point, tous sur des pages déjà à 12–22 % |

Aucun rapport ne passe de vert à rouge. Les 8 verts sont identiques à ±0,03 point.
*(L'instance est dans un état ancien — ses 8 verts ne sont pas les 25 de la
campagne 037. C'est sans effet sur un A/B : les deux mesures partagent le même
état.)*

### Qualité

Contrôle à l'œil sur les deux plus fortes réductions, rendus à leur taille
d'affichage : `rea1` (900 → 738 px, 1 421 → 69 Ko) et `equipe_survol_12`
(1728 → 568 px, **604 → 23 Ko**). Aucun artefact visible, texte du logo net.

**Limite réelle et nommée** : pour les ~100 images redimensionnées, une
comparaison pixel à pixel avec l'original n'a pas de sens. La seule garantie de
qualité est le score de parité de la page.

### Un défaut de l'INSTRUMENT, trouvé en s'en servant — et il n'est pas corrigé

`extract/odoo-page-parity/capture.ts` fait défiler la page pour déclencher les
images en chargement différé, puis attend un délai fixe — **il n'attend jamais que
les images soient effectivement chargées**. Une sonde le montre : après le
défilement, treize `<img>` de `portes-residentielles` rendent encore
`naturalWidth === 0`.

Conséquence observée : la dernière carte de Réassurances sortait **blanche** sur
la capture, de façon reproductible, alors que son image répond `200` avec le bon
type et se rend parfaitement **seule dans un navigateur** (vérifié : 738×400,
`complete: true`). C'est ~2 % de pixels attribués à tort à la conversion.

Ce n'est pas corrigé ici — c'est le périmètre de l'instrument, pas celui des
images — mais **tout score de parité porte cette incertitude** tant que la boucle
n'attend pas `img.complete`.

### Déterminisme

Reçu obtenu par accident : un fichier a été altéré pendant le test adversarial de
la porte, son original restauré depuis git, puis reconverti. **`sha256` identique
à la première conversion** (`a21459b1b865…`). Même source, même octets.

On ne cherche pas pour autant à épingler l'encodeur : rien ne garantit sa
stabilité **entre versions de libwebp ni entre plateformes**. On rend sa
reproductibilité **inutile** en committant sa sortie — git est le sceau.

## Pièges, chacun payé

**L'ordre de `IMG_EXTENSIONS` décide en silence.** `compose_page.py:55` cherche
`.jpg .jpeg .png .webp` et prend **le premier trouvé**. Un original laissé à côté
de son WebP gagne sans un mot. La conversion supprime la source dans le même
commit, et la porte refuse tout non-WebP dans le dossier.

**`--only` avec `--write` écrivait un manifeste partiel**, qui condamnait ensuite
les 120 autres fichiers en « absent du manifeste ». Trouvé en s'y faisant prendre.
La combinaison est maintenant refusée par son nom.

**Le manifeste ne porte aucun champ « avant ».** Une deuxième exécution lit des
fichiers déjà convertis : un `octetsAvant` y aurait recopié la taille d'après et
menti sans rien signaler — constaté, puis retiré. Le manifeste décrit l'état
courant ; le relevé avant/après est daté et vit ici.

**Le MIME `.webp` n'est garanti qu'à partir de Python 3.11.** En dessous il dépend
de `/etc/mime.types` de l'image Docker ; s'il manque, le fallback est
`application/octet-stream` et le rendu casse. Preuve empirique contraire :
`hero_video_facade.webp` est **déjà servi en production**. À vérifier au premier
`COMPOSE_OK`, pas à supposer.

**Les anciens `ir.attachment` deviennent orphelins et rien ne les nettoie.** La
réutilisation par checksum ne retrouvera pas des octets convertis ; aucun script
de GC n'existe dans le dépôt. En local, `odoo:restore` repart d'une base propre.
En production, `compose_website_page.sh --clean-attachments` purge les `pqr_%`
avant de composer — destructif : il faut composer les neuf pages derrière, sans
exception.

## Ce qui reste, et ce n'est pas un détail

**Conversion et recomposition sont une seule opération.** L'URL publiée porte le
checksum et sort en `immutable, max-age` un an. Tant que les pages ne sont pas
recomposées, **le site sert encore les anciennes images** — le gain ci-dessus est
acquis dans le dépôt, pas chez les visiteurs.

Ordre : recomposer les 9 pages en local (~15 min, mesuré) → mesurer → refaire le
seed (`odoo:save -- --project <jetable>`, `--project` **obligatoire**, `PQR_PROJECT`
n'a aucun effet sur ce script) → puis la production, séparément.

**Le chemin de production existe** et avait été annoncé absent : il est dans le
dépôt client, `scripts/compose_website_page.sh` — transposition SSH du composeur
local, une page par appel, avec redémarrage des workers http.
