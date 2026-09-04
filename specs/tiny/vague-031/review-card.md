# Journal de molécule — `ds.review-card` → Odoo (vague 031)

**Date** : 2026-09-03. **Cible** : la CARTE seule (décision owner : « juste card pour le moment »,
la section Avis Google suit dans un round séparé).

## Entrées

- Maître 031 : `ReviewCard` **2700:26539**, clé `cd8095ef0d8c2f529d7b4ecda6eaf14ffcb39c30`,
  page « 031 · Planches de validation ». Ce n'est PAS un set : un maître unique, sans axe de variantes.
- Relevé : `.page-parity/vague-031/dumps/ReviewCard.live.dump.json`, repris le 2026-09-03
  (celui du 2026-09-02 est conservé sous `dumps-avant-2026-09-03/`).
- Proposition : `.page-parity/vague-031/proposals/ReviewCard-2026-09-03/` — **0 valeur non liée**.
- Références visuelles : les instances de carte des 4 vues du set `AvisGoogle` 2700:28391
  (2700:27829 / 27922 / 28077 / 28232), exportées à l'échelle 1.

## Étape 0 — nettoyage de source (2026-09-03, avant tout relevé)

Le set `AvisGoogle` et le maître `ReviewCard` ont été nettoyés le matin même, sur décision owner,
avec captures avant/après à chaque geste (**8 puis 5 captures identiques à l'octet près**) :

- **6 flèches supprimées** (`flecheGauche` / `flecheDroite`) — masquées en Mobile/Tablette/Wide,
  déjà absentes en Desktop. Décision owner : « masqué partout, c'est que tu peux delete partout ».
- **279 rattachements** de valeurs brutes vers des variables, sur les 4 variantes du set.
- **14 rattachements sur le MAÎTRE de la carte** — les 279 précédents avaient atterri en
  surcharges d'instance ; le maître, lui, était resté brut. *Leçon : rattacher une valeur sur une
  instance ne rattache rien sur le maître, et c'est le maître que l'extraction lit.*
- **7 variables créées** : `radius/8`, `radius/20`, `space/15`, `space/40`,
  `size/review-card/min-w`, `typography/review/note-size`, `typography/review/libelle-size`.
- **Logo Google remplacé par le SVG officiel** (Google 2015, 272×92) : c'étaient six lettres
  Montserrat coloriées à la main, dont le « e » final était tronqué en Desktop et Wide.
  Seul changement visible du chantier, validé par l'owner sur planche de comparaison
  (`2726:8761`, page de validation).

Après nettoyage : **zéro géométrie brute, zéro taille de texte brute**. Ne restent brutes que les
couleurs des tracés des deux logos (le mot « Google » et l'icône « G » ronde) — un logo est un
dessin, il n'a pas à être tokenisé.

## Étape 1 — jetons

`radius.8` et `radius.20` **mintés from-dump** dans `tokens/primitives.tokens.json`, avec provenance.
Tout le reste existait : `size.review-card.*`, `spacing.review.gap`, `typography.review.*` (12 feuilles
× 4 écrans), `color.noir-pur`, `color.orange`, `border-width.1`, `space.2/3/8/12/24`.

## Étape 2 — contrat `ds.review-card` **2.0.0 → 3.0.0** (MAJEUR)

Majeur pour deux raisons, chacune suffisante : les ancres Figma quittent l'ancien maître
`2480:5253` (clé `864876fc…`) pour le maître 031, et la prop `verifie` apparaît.

| Fait relevé | Où il est porté |
|---|---|
| Typographie par écran (5 textes × taille + interligne, + la graisse de la date) | `typography.review.*` — jetons qui varient par écran. **Une molécule n'a pas d'axe de présentation** (mode d'emploi) : c'est le jeton qui porte l'écran, pas une variante. |
| Écart intérieur 16/16/14/14 | `spacing.review.gap` |
| Rayons 8 et 20 | `radius.8`, `radius.20` — deux mints |
| Bordure 1px | `border-width.1` (existait) |
| Couleurs des textes | `color.noir-pur` — **changement de rendu assumé** : 2.0.0 portait `#8A8A8A` pour la date et « Lire la suite », le maître 031 les dessine en noir |
| Interlignes 19.2 / 16.8 / 19.6 de 2.0.0 | remplacés par les valeurs dessinées 20 / 24 / 24 |
| Initiale 18px de 2.0.0 | remplacée par `typography.review.initiale-size` (14 en Mobile, 18 en Desktop/Wide) |
| Largeur fixe 299 et hauteur mini 239 de 2.0.0 | **RETIRÉES** — la boîte d'une molécule appartient à sa section (mode d'emploi) ; la racine passe en `layout.width: fill`, comme `ds.carte` 3.0.0 |
| Pastille de vérification | nouvelle prop `verifie` (booléen, **défaut faux**) + `visibleWhen` — le calque est masqué sur le maître ET sur les 5 instances des 4 vues, donc jamais dessiné aujourd'hui |

### Déviations nommées

1. **Le relevé de canevas n'enregistre pas les liaisons de variables des textes.**
   `extract/figma/dump.plugin.js` capture `fontSize`, `lineHeight` et `fontStyle` comme des
   NOMBRES, et seul le remplissage porte sa variable (`fillVar`). Une typographie responsive est
   donc aplatie en silence, et l'extraction propose à la place des jetons provisoires
   (`imported.shared.size-16`…). Les jetons de typographie de ce contrat ont donc été liés
   **à la main** vers les variables réellement posées sur le maître — jamais vers une valeur.
   *C'est un trou d'instrument, pas une limite de Figma : les liaisons existent et se lisent en
   une ligne (`node.boundVariables.fontSize`).* → **Bloqué / à trancher**.
2. **Le logo Google de la carte est un fait code-only.** Visible sur les instances Mobile et
   Tablette, masqué sur Desktop et Wide. Une part instance ne porte aucun canal par mode et une
   molécule n'a pas d'axe de présentation : la bascule vit dans `responsive/review-card.pqr.css`,
   nommée dans la description de la part `marque`.

## Étape 3 — miroirs Odoo

- `integrations/odoo/config/google-reviews.authoring.json` : **56 épingles** `ds.review-card@2.0.0`
  → `@3.0.0`, **+1 contrôle** `review-verifie` (`fixed-by-composition` / `none` — la pastille n'est
  pas offerte au rédacteur tant que le dessin ne la montre pas).
- `integrations/odoo/config/figma-panels.json` : panneau en 3.0.0.
- `views/components.xml` : la pastille passe sous `t-if="review.get('verifie')"`.
- `static/src/css/responsive/review-card.pqr.css` — **NOUVELLE** zone manuelle (une seule règle),
  ajoutée au manifeste après `devis.pqr.css`.
- `authoring/pages/avis-test.json` — **NOUVELLE** page de mesure, la section seule, texte de la
  planche 031 Desktop.

## Étape 4 — le CSS : presque rien, et c'est le résultat

**La carte ne demande aucun CSS de typographie écrit à la main.** Tout roule sur des jetons qui
varient par écran, et `tokens.pqr.css` émet déjà leurs blocs `@media` (768 / 992 / 1400).
La feuille manuelle ne porte **qu'une seule règle** : masquer le logo Google au-delà de 992 px.
À comparer aux cinq feuilles de sections de la vague (49 à 150 lignes chacune).

## Étape 5 — mesure (page `/avis-test`, instance jetable `piqueray-odoo-pilote`, port 8087)

### Sonde des boîtes — Odoo contre canevas, aux 4 largeurs

Toutes les valeurs relevées côté Odoo correspondent **exactement** aux variables Figma :

| | 390 | 834 | 1200 | 1728 |
|---|---|---|---|---|
| écart intérieur | 16 | 16 | 14 | 14 |
| initiale | 14/24 | 14/24 | 18/18 | 18/18 |
| auteur | 16/20 | 16/20 | 16/20 | 18/27 |
| date | 14/24 · 400 | 14/24 · 400 | 14/24 · 400 | 18/27 · **500** |
| témoignage | 16/24 | 16/24 | 14/20 | 16/24 |
| « Lire la suite » | 14/24 | 14/24 | 14/24 | 16/24 |
| hauteur de carte | **230 = canvas** | **206 = canvas** | **236 = canvas** | 234 (canvas 258, voir plus bas) |

### Les quatre chiffres

Carte comparée à largeur égale (la boîte appartient à la section, pas encore portée) :

| largeur | écart | causes, toutes nommées |
|---|---|---|
| **390** | **2,10 %** | (1) **différence de CONTENU, pas de rendu** : la planche Mobile écrit « pho syster », la planche Desktop — d'où vient le texte de la page de test — écrit « p. syster » ; (2) lissage du texte. |
| **834** | **1,09 %** | lissage du texte seul. **Le meilleur chiffre du lot.** |
| **1200** | **1,63 %** | lissage du texte seul — structure identique, vérifiée au triptyque. |
| **1728** | **2,41 %** | (1) **hauteur −24 px** : en Wide les cartes sont en `FILL` vertical, donc **étirées à la hauteur de la plus haute de la rangée** (258) alors que leur contenu en fait 234 — mesuré sur le canevas. C'est la grille de la SECTION, elle sera portée au round suivant ; (2) lissage. |

**Lecture** : aucun défaut de code restant sur la carte. Les deux chiffres au-dessus de 2 % sont
faits d'une différence de copie et d'un étirement qui appartient à la section.

## À corriger à la source (Figma) — écritures à porter à l'owner

1. **Le maître 031 de la carte n'expose AUCUNE propriété de composant.** La parité relève 9 constats
   (`ReviewCard.Auteur`, `.Date`, `.Initiale`, `.Témoignage`, `.Avatar`, `.Notation`, `.URL photo`,
   `.Alt photo`, `.Verifie`) : le contrat déclare ces props, le maître ne les porte pas. L'ancien
   maître les avait. Même geste que celui déjà fait pendant la vague sur CarteCategorie et
   CarteReassurance (« propriétés TEXT posées sur les deux cartes »).
2. **Les planches Mobile/Tablette et Desktop/Wide ne portent pas la même copie** : noms complets
   d'un côté (« pho syster », « Petit Nicole », « Aun Bukhari »), abrégés de l'autre
   (« p. syster », « P. Nicole », « A. Bukhari »). Différence de contenu, pas de rendu — à trancher.

## Bloqué / à trancher (owner)

1. **Le relevé perd les liaisons de typographie** (déviation 1 ci-dessus). Deux lignes à ajouter à
   `extract/figma/dump.plugin.js` — instrument partagé, hors du périmètre d'un agent de section.
   Tant qu'il n'est pas corrigé, **chaque composant à typographie responsive devra être lié à la
   main**, et rien ne le signale.
2. **`exportAsync({format:'SVG'})` BLOQUE le fil du bac à sable** sur les vecteurs de cette carte —
   ni rejet, ni délai de garde ne passent. Contourné par une rustine locale non committée
   (promotion des vecteurs désactivée) ; sans elle le relevé de ce composant est impossible.
   Le relevé du 2026-09-02 ne promouvait déjà aucun vecteur de cette carte : la rustine ne perd rien.
3. **Le verrou de versions** (`inputs.lock.json`) épingle encore `ds.review-card@2.0.0` avec
   l'ancien sha — re-épinglage global, il appartient à l'orchestrateur.

## Fichiers touchés

`contracts/review-card.contract.json` (3.0.0) · `tokens/primitives.tokens.json` (+2 mints) ·
`integrations/odoo/config/google-reviews.authoring.json` · `integrations/odoo/config/figma-panels.json` ·
`integrations/odoo/addons/piqueray_ds/views/components.xml` ·
`integrations/odoo/addons/piqueray_ds/static/src/css/responsive/review-card.pqr.css` (nouveau) ·
`integrations/odoo/addons/piqueray_ds/__manifest__.py` ·
`integrations/odoo/authoring/pages/avis-test.json` (nouveau) ·
`.page-parity/probe-carte-avis.mts` et `.page-parity/capture-carte-avis.mts` (nouveaux instruments) ·
`specs/031-vague-responsive-sections/inventory/registre-ecarts.json` (dette E-031-044).


## Étape 6 — réparations de source Figma (2026-09-03, après-midi)

Trois écritures sur le maître, chacune encadrée d'une version nommée et de captures
avant/après. **Cinq captures sur cinq identiques à chaque geste** (le maître + les quatre
instances des vues d'accueil) :

1. **Sept propriétés de composant posées** : `Auteur`, `Initiale`, `Date`, `Témoignage`
   (liées à leur nœud texte), `URL photo` et `Alt photo` (porteuses, aucun nœud texte à
   piloter — même forme que l'ancien maître), `Verifie` (booléen lié à la visibilité de
   la pastille). Le maître 031 n'en exposait aucune.
2. **Les cinq étoiles libres remplacées par une instance de `Notation`** (variante `Note=5`,
   set gouverné `2480:5365`). Même mécanique que la réparation des vingt cartes de
   Réassurances : un cadre libre ne propage rien.
3. **La carte transformée en jeu de deux variantes `Avatar` (Initiale | Photo)** — le contrat
   déclare cet axe, le maître 031 était un composant unique. Nouveau set `2731:9375`,
   clé `7da404ac…` ; les cinq instances de la section suivent `Avatar=Initiale`.
   Les ancres du contrat suivent le set.

**Un essai annulé, noté pour la prochaine fois** : aligner les défauts des propriétés
`Auteur` et `Témoignage` sur ceux du contrat (texte neutre) a **changé les quatre vues** —
les instances de la section n'avaient pas de surcharge propre, elles suivaient le défaut.
Remis immédiatement, 5/5 identiques. *Leçon : le défaut d'une propriété de composant n'est
pas un réglage de maître, il se propage aux instances qui ne l'ont pas surchargé.*
Les deux écarts de défaut sont donc **acquittés** dans `parity/baseline.json` : le défaut
Figma porte l'avis d'exemple que dessine la planche, le contrat porte un texte neutre —
un bloc Odoo neuf ne doit pas livrer l'avis d'un vrai client.

## Étape 7 — cinq jetons promus

Les cinq variables créées le matin dans Figma et qui n'existaient pas côté dépôt ont été
ajoutées : `space.15`, `space.40`, `size.review-card.min-w`, `typography.review.note-size`
et `typography.review.libelle-size` (les deux dernières avec leurs quatre valeurs par écran).
Elles servent la SECTION, portée au round suivant ; elles sont dans `tokens/` dès maintenant
pour que l'axe des jetons cesse d'être en retard sur le canevas.

## État des portes à la clôture du round carte

| Porte | État |
|---|---|
| `npm run build` | **vert** |
| `npm run geometry:gate` | **vert** — 0 littéral invisible |
| `npm run odoo:authoring:check` | **vert** |
| `npm run odoo:module:check` | **vert 23/23** |
| `npm run emitters:check` · types | **vert** |
| `npm run parity` | **1 constat** (+31 acquittés) |
| `npm run eval` | **238/243** |

### Le constat qui reste, et pourquoi il ne se ferme pas dans ce round

`[figma BEHIND] GoogleReviews.ReviewCard` — le contrat `ds.google-reviews` compose
`ds.review-card`, mais le maître DS `Avis Google` auquel il est ancré contient une instance
de l'ANCIENNE carte (`Review-card`), pas du set 031 (`ReviewCard`). C'est l'état transitoire
exact entre les deux rounds : la carte a déménagé vers le set 031, la section pas encore.
Il se fermera au round section, quand `ds.google-reviews` sera ré-ancré sur `AvisGoogle`
(2700:28391), dont le relevé porte déjà `ReviewCard` dans ses instances imbriquées.

**Cinq évaluations dépendent de ce seul constat** : `baseline-parity-clean`,
`baseline-acknowledges-without-failing`, `promotion-converges`,
`preservation-013-clobber-detected` et `detect-figma-missing-nested-instance`.

**Il a été acquitté un moment, puis DÉSACQUITTÉ.** L'acquitter rendait la parité verte —
et rendait aveugle `detect-figma-missing-nested-instance`, dont le rôle est précisément de
surveiller cette famille de dérive : le cas mute le cliché pour retirer l'instance imbriquée
et attend un constat, or ce constat était désormais absous d'avance. Un vert obtenu en
éteignant l'instrument qui regarde n'est pas un vert. L'acquittement a donc été retiré et le
constat reste visible, avec sa cause écrite ici.

Corollaire pour le round section : le littéral `GoogleReviews.Review-card` de ce cas d'évaluation
devra devenir `GoogleReviews.ReviewCard` — le renommage est réel et voulu (la carte est devenue
un set), ce n'est pas la régression vers l'appariement par nom que le commentaire du cas redoute.
Mais il ne faudra le changer QU'UNE FOIS la composition réparée, sinon la sonde devient creuse :
elle attendrait un constat déjà présent sans sa mutation.
