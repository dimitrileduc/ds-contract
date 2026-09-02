# Pilote Odoo — Presentation 031

Date : 2026-09-02  
Statut : **déployé, mesuré et validé owner** (2026-09-02) — 4 largeurs au pixel près, édition testée, résidu nommé

## Source figée

- Dump : `.page-parity/vague-031/dumps/Presentation.live.dump.json`
- Planches : 390×544, 834×394, 1200×351 et composant wide 1287×332.
- Ancre adoptée : set `77a8baf2adfdba3bc6470c693c0fc717c99a33fc`, nœud `2693:20805`.

## Portage

- Contrat `ds.presentation` 4.0.0 : axe `presentation` Mobile / Tablette / Desktop / Wide, avec H2 et body responsive existants.
- Projection Odoo : pile sous 992px ; deux colonnes dès 992px ; padding 24 / 48 / 56 / 0 et wrapper 32 / 32 / 24 / 32.
- CTA : largeur pleine et padding vertical 16 sur Mobile/Tablette, Link compact avec padding 4 dès Desktop. Cette variation d’une part component est code-only et explicitement nommée dans le contrat.
- Texte : les deux séparations de paragraphes sont des doubles retours, rendus par `<br/><br/>`, avec les marques `strong,line-break` autorisées.

## Décision owner

La variante Wide du composant mesure 1287px : c’est la référence volontaire de Presentation, pas une planche 1728px à étirer. **Confirmée par l'owner le 2026-09-02** (relecture d'orchestration). La règle existante de composition Odoo (`odoo-bridge.css` : `max-width: 1287px; margin-inline: auto` sur `.s_pqr_presentation`) conserve ce cadre, et la mesure le vérifie : à 1728 le bloc rend 1287×332, exactement la planche.

## Composition — ajout d'orchestration (2026-09-02, après portage)

La grille de page pose une gouttière fixe de 89px à toutes les largeurs. Les planches 031 de Presentation font 390 / 834 / 1200 de large aux trois premiers témoins : la section est **pleine largeur** et porte elle-même son padding (24 / 48 / 56). Avec la gouttière, le bloc rendait 212 / 656 / 1022 — trois tailles fausses sur quatre.

Correctif posé (motif déjà utilisé par hero-video et sav) : `"add_class": ["s_pqr_bleed"]` sur la section Presentation dans `home.json` et `presentation-test.json`. La section prend `grid-column: full`, et son `max-width: 1287px` déjà présent la recentre au-delà de 1400. Aucune modification de la grille de page, aucun effet sur les autres sections.

Le bundle référence désormais `static/src/css/responsive/presentation.pqr.css` (`__manifest__.py`, après `components.pqr.css`).

## Bloqué / à trancher

- **`typography.h2.weight` doit devenir responsive** (`wide` = Regular). Token partagé : hors périmètre agent, à trancher par l'owner. C'est la seule cause structurelle du résidu (cf. « Causes nommées », n°1).
- **Soulignement de « Hörmann »** dans la planche : défaut de source ou intention à porter ? Le dump ne porte pas les décorations de texte.
- ~~Déploiement, page de test, captures et triptyques~~ — **faits le 2026-09-02** par l'orchestrateur, voir « Mesure finale ».
- ~~Bundle~~ — **fait**, `responsive/presentation.pqr.css` est dans `__manifest__.py`.
- ~~Test d'édition rédacteur~~ — **joué et validé par l'owner le 2026-09-02** (éditer / enregistrer / rouvrir sur `/presentation-test`, marques `strong,line-break`).
- ~~CTA détaché dans 3 variantes sur 4~~ — **acquitté**, décision owner, voir la section dédiée.
- **Repin global du verrou et du digest** (`odoo:inputs:check --repin`, `version_guard.js`) : `4.0.0` → `4.0.1`. Geste d'orchestration, à jouer une fois pour toute la vague.
- **`parity/snapshots/figma-components.json`** à rafraîchir : il date d'avant la réparation des graisses du 2026-09-02.

## Mesure finale

Instance `piqueray-odoo-pilote` (8087), page `/presentation-test`, bloc seul, en-tête masqué, capture 1x clippée sur la boîte du bloc (`.page-parity/capture-bloc.mts`), comparaison `.page-parity/mesure-bloc.mjs` contre `planches/Presentation-<w>.png`.

| Largeur | Planche | Bloc Odoo | Écart hauteur | Différence |
|---|---|---|---|---|
| 390 | 390×544 | 390×544 | 0 | **4,78 %** |
| 834 | 834×394 | 834×394 | 0 | **3,10 %** |
| 1200 | 1200×351 | 1200×351 | 0 | **2,34 %** |
| 1728 | 1287×332 | 1287×332 | 0 | **2,59 %** |

Colonne titre : **0,04 %** à 1200, **0,02 %** à 1728.

Chemin : 4.0.0 sur source d'origine → 3,73 % / 6,03 % · contrat 4.0.1 (corps en `typography.body.weight`) → 2,50 % / 4,88 % · source réparée (graisses du titre) → **2,34 % / 2,59 %**. 390 et 834 ne bougent à aucune étape : leurs variantes n'étaient pas en cause.

**Les quatre tailles tombent au pixel près.** Triptyques : `.page-parity/presentation-mesure/triptyques/`.

Diagnostic par colonne (`.page-parity/zones-bloc.mjs`) :

| | colonne titre | colonne texte |
|---|---|---|
| 1200 | 0,40 % | 8,09 % |
| 1728 | 4,70 % | 7,67 % |

### Graisses — relevé à la source par le pont (2026-09-02, lecture seule)

`getRangeFontName` sur le set 2693:20805, plage par plage :

| | Mobile | Tablette | Desktop | Wide |
|---|---|---|---|---|
| Titre — base | SemiBold | SemiBold | SemiBold | **Regular** |
| Titre — segment gras | Bold | Bold | **aucun** | Bold |
| Corps — base | Regular | Regular | **Medium** | **Medium** |
| « Hörmann » | Bold + **UNDERLINE** | idem | idem | idem |

**Corrigé (contrat 4.0.1)** : la part `Texte` liait le primitif brut `{font.weight.regular}` alors que le token sémantique **`typography.body.weight` existe déjà et est déjà responsive** (400 / 400 / 500 / 500 — exactement la source ; `ds.sav` l'utilise). Une ligne. C'est ce qui décalait toutes les casses de ligne du corps : au Desktop/Wide notre texte, trop léger, faisait tenir un mot de plus par ligne et l'écart se propageait. Mesuré : 1200 3,73 % → **2,50 %**, 1728 6,03 % → **4,88 %**, colonne texte 8,09 % → 5,28 %.

### Causes nommées du résidu

1. **Le poids du H2 n'est pas responsive alors qu'il l'est dans Figma.** Au Wide, le titre du set 031 est en **Regular** avec seulement « en Province de Liège » en gras ; le contrat le lie à `{typography.h2.weight}`, un token à valeur unique (`semibold`) sans mode viewport — on rend donc tout le titre en semibold+bold. C'est **toute** la différence de la colonne titre à 1728 (4,70 % contre 0,40 % à 1200, où Figma est bien en semibold). Correctif hors périmètre de l'agent : c'est le **token partagé** `typography.h2.weight` qui doit recevoir un mode `wide` (règle 5 → « Bloqué / à trancher »).
2. **« Hörmann » est souligné dans la planche, pas chez nous.** Le dump v1.8 ne porte aucune décoration de texte ; le contrat ne peut donc pas la voir. À trancher : défaut de source (soulignement parasite) ou intention à porter.
3. **Le corps de texte casse ses lignes un mot plus tôt dans Figma** (à colonne identique, 528 px vérifiés). Métriques de fonte entre le rendu Figma et Chromium ; l'écart se propage sur toutes les lignes suivantes et explique l'essentiel des 8 % de la colonne texte.
4. **Lissage du texte** : c'est désormais **tout ce qui reste**. Le diff de la colonne texte est jaune (anti-crénelage) de bout en bout, avec une seule tache rouge sur le soulignement de « Hörmann ». Résidu de rastérisation Figma vs Chromium, pas un défaut (plan §9.7).

## Réparation Figma — 2026-09-02 (§VIII / §X)

Décision owner : le titre doit être **SemiBold + Bold sur les quatre variantes**. Deux défauts de source, réparés au canvas, pas contournés en code.

| Variante | Avant | Après |
|---|---|---|
| Mobile | SemiBold + Bold | inchangé |
| Tablette | SemiBold + Bold | inchangé |
| Desktop `2693:20766` | SemiBold **uniforme** (pas de gras) | SemiBold + **Bold** sur « en Province  de Liège » |
| Wide `2693:20790` | **Regular** + Bold | **SemiBold** + Bold |

Protocole §X respecté : cibles recensées avant le geste (les 4 instances du set sont les 4 planches, `2693:20806 / 20819 / 20832 / 20845` — aucune autre usage), planches d'avant archivées sous `proofs/presentation-titre-wide/avant/`, deux versions nommées dans l'historique Figma (`2394663993764943231` avant, `2394680255064303008` après), relecture plage par plage après le geste, planches réexportées.

**Conséquence côté code : aucune.** Le contrat liait déjà `{typography.h2.weight}` (= semibold) — c'était juste depuis le début. `ds.sav`, qui partage ce token et porte SemiBold aux quatre variantes, est intact. Aucun token minté, aucune modification de schéma.

## CTA détaché — acquitté (décision owner, 2026-09-02)

`npm run parity` levait `[figma BEHIND] Presentation.Bouton` : le contrat compose `ds.button`, mais dans le set 031 le CTA n'est une INSTANCE du master `Bouton / Style=Link` que sur la variante **Wide** ; Mobile, Tablette et Desktop portent une FRAME détachée (mêmes enfants `iconLeft` masqué / `label` / `iconRight`).

**Décision owner : c'est normal et volontaire** — ce CTA est un lien utilisé une seule fois, il n'a pas vocation à suivre le master. Consigné tel quel pour que le contrôle cesse de le lever : `parity/baseline.json` reçoit `figma|behind|Presentation.Bouton`, au même titre que `Carte.Bouton`, `CarteCategorie.Bouton` et `SectionHeader.Bouton` déjà acquittés. Le fichier n'accepte qu'une liste de clés : le motif vit ici.

Conséquence assumée, écrite pour qu'elle ne se redécouvre pas : une modification du master Button ne se propagera pas aux CTA Mobile / Tablette / Desktop de cette section.

## À corriger à la source (Figma)

Le portage initial notait « rien relevé ». Relecture du dump :

- **Variante Wide : le nœud `Bouton` n'a aucun enfant** (ni `iconLeft`, ni `label`, ni `iconRight`), alors que sa boîte 168×30 correspond exactement à label 138 + gap 10 + icône 20. Traversée du dump ou instance détachée : à regarder sur le canevas.
- **Le titre Desktop contient un saut de ligne** (`U+2028`, « Province ⏎ de Liège ») que les trois autres variantes n'ont pas. Non porté : la part titre n'autorise que `strong` et ne déclare pas `pre-line`. Sans effet mesuré à 1200 (0,40 %), mais la déviation existe.
- **`fontStyle` du titre lu à SemiBold en Desktop et à `null` en Mobile / Tablette / Wide** — le dump ne lit pas le style quand il n'est pas posé en dur. C'est ce trou qui masque le fait n°1 ci-dessus.
- **`_degradations` du dump** : export SVG refusé sur les deux vecteurs d'icône du bouton, et `textCase UPPER` du libellé sans projection dump v1.

## Déviations nommées — complété le 2026-09-02

- **Frame `Titre direct` supprimée** de l'anatomie (031 : `colGauche > Titre direct > Titre` ; contrat : `colGauche > Titre`), avec son `gap: {space.8}`. Sans effet visible — la frame n'a qu'un enfant — mais l'anatomie n'est plus isomorphe à la source.
- **`U+2028 + \n` rendu en `<br/><br/>`** dans le contenu (deux sauts visuels dans Figma, deux sauts en HTML).

## Contrôles locaux

- `npm run build` : vert ; contrat, composants, assets, liens Figma et rapport de dérivation régénérés.
- `npm run odoo:authoring:check` : vert, 10 props et 11 parts couvertes pour Presentation.
- `npm run odoo:assets -- --check`, `npm run odoo:figma-links:check` et `npm run odoo:derivation:check` : verts.
- `npm run odoo:inputs:check` et `npm run odoo:module:check` : attendent volontairement le repin du lock et l’alignement global de `version_guard.js` par l’orchestrateur ; aucun de ces fichiers n’a été modifié ici.
