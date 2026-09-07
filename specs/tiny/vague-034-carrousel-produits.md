# Vague 034 — le carrousel Produits e-commerce défile

**Date** : 2026-09-07 · **Branche** : `oceanic-oak` · **Décision owner** : scroll-snap natif (ni le carrousel
Odoo, ni Embla), quatre choix « tout comme recommandé » — geste Figma, `aria-disabled` seul, instance jetable
propre, scénario QA officiel.

**Contrat** : `ds.produits-ecommerce` 2.1.0 → **2.2.0** (MINOR). **Set Figma** : `ProduitsECommerce` `2694:21337`.
**Module** : `19.0.1.14.0 → 19.0.1.15.0` (un asset JS de plus). **Registre différé** :
`specs/tiny/proofs/vague-034-carrousel-produits/travail-differe.json` (DW-034-001 à 003).

## Pourquoi ce round

La vague 031 a livré la section avec un mécanisme **différé** (owner, 2026-09-04 : « en mobile et tablette
ce sera du glissement au doigt plus tard »). Le cadre était `overflow: hidden` : rien ne défilait, ni au
bouton ni au doigt — alors que les cartes débordent déjà. En Mobile, 4 × 260 + 3 × 16 = **1088 px dans une
piste de 366** (dump `.page-parity/vague-031/dumps/Produits.live.dump.json`). « Les cartes rétrécissent
sous 992 » était faux ; elles sont rognées.

## Les trois options, instruites en ligne (2026-09-07)

| | Natif Odoo (`o_carousel_multi_items`) | **CSS scroll-snap + ~90 lignes JS** | Embla 8.6 |
|---|---|---|---|
| Mobile / tactile | rien sous 768 px (SCSS natif sous `media-breakpoint-up(md)`) | swipe natif du navigateur | drag géré |
| Largeurs fixes 260·322·326·363 | non (% du conteneur) | oui | oui (mesure la CSS) |
| Éditeur | panneau natif accroché à `section > .carousel` : fuite de gouvernance (leçon 018) | rien à neutraliser | non instancié en édition |
| Dépendance | zéro, mais `min-height` forcé, `data-bs-ride` réécrit | zéro | +7 ko gzip, mainteneur unique, v9 en RC depuis 8 mois |

Le natif résout le desktop, que nous avions presque, et pas le mobile, qui est le besoin. Embla ne se
justifie qu'avec boucle ou autoplay, non demandés. Les pseudo-éléments CSS Overflow 5 (`::scroll-button`,
`::scroll-marker`, `scroll-state()`) ne sont pas utilisables en production au 2026-09-07 (Chrome seul).

## Ce que le contrat porte — et ce qu'il ne peut pas porter

- `carrouselProduits.declared["overflow-x"] = "auto"`, **`layout.clip: true` conservé** : l'émetteur pousse
  `overflow: hidden` puis les faits `declared` → `overflow-x: auto` gagne, `overflow-y` reste `hidden`. Sur
  le canvas rien ne change (`declared` est `annotate`, `clip` reste `clipsContent`). Matrice l. 64 et 178.
- La piste `Produits` perd son `layoutByProp` (`width: fill` Mobile/Tablette) : au contenu aux quatre
  largeurs, comme la source réparée.
- `scroll-snap-type`, `scroll-snap-align`, `scroll-padding-left`, `scrollbar-width`, `overscroll-behavior`,
  le padding de fin de piste : **aucun canal du schéma** (ni `declared`, ni `literals`, ni la whitelist
  `stylesWhen`) → zone manuelle `responsive/produits-ecommerce.pqr.css`
  (`ODOO-034-PRODUITS-CARROUSEL-SNAP`), CARRY-CODE-ONLY par la matrice. Le glissement lui-même n'est pas
  un `events` (docs/02 l. 143 : « drag … stays a hand-written layer »).
- Le pas des boutons, `aria-disabled` aux bouts, la numérotation « n sur N » des diapositives et
  l'alignement au focus clavier : `produits_ecommerce_carrousel_interaction.js`
  (`ODOO-034-PRODUITS-CARROUSEL-INTERACTION`, patron `menu_mobile_interaction.js`, aucune variante
  `.edit`). Rien n'y est en dur : le pas est lu dans le DOM (largeur de carte + `column-gap`).
- Côté React la coquille générée reste inerte : DW-034-001.

## TDD — le rouge, puis le vert, sur la même page et la même instance

Scénario `integrations/odoo/qa/scenarios/produits-ecommerce-carrousel.spec.mts` (banc
`/piqueray-harness/produits-ecommerce`, nouveau dans `piqueray_ds_qa`), instance jetable
`piqueray-odoo-carrousel` :8093, mode `PQR_QA_REUSE=1` ajouté à `qa/run.mts` (`withInstanceExistante`,
code de limite `ODOO-LIMIT-INSTANCE-REUTILISEE` — le rejeu de release passe par `withInstance`).

| | tenus | en échec | sautés | reçu |
|---|---|---|---|---|
| **Rouge** (code 2.1.0) | 15 | **45** | 1 | `proofs/…/rouge/recu.json` |
| **Vert** (2.2.0 + Odoo) | **61** | 0 | 1 | `proofs/…/vert/recu.json` |

Le constat sauté est le glissement tactile (`L-034-TOUCH`, DW-034-003) : Playwright headless ne sait que
`tap`. Ce que le vert prouve à la place, aux quatre largeurs : la **molette horizontale** fait défiler le
cadre (un `overflow: hidden` la refuse — c'est ce constat, et non `scrollWidth > clientWidth`, qui
distingue le rouge du vert), le focus clavier montre la carte entière, le pas d'un bouton vaut exactement
largeur de carte + écart (276 · 338 · 342 · 387), Précédent et Suivant sont `aria-disabled` aux bouts,
`prefers-reduced-motion` rend le pas instantané, et dans l'éditeur la section et une carte se
sélectionnent, le titre accepte une frappe, le save passe, la relecture publique porte l'ARIA.

## Trois choses que la mesure a corrigées

**1. Le bout de piste n'était pas une position de snap.** En Wide (5 cartes), le focus clavier sur la 5e
carte était ramené à 0 et un pas plafonnait à 361 sans s'y accrocher. Première réponse : un padding de fin
« largeur du cadre − carte » pour que chaque carte s'aligne au début — **retirée** sur deux constats
convergents, l'owner (« la dernière position, c'est quand le dernier élément est entièrement visible, pas
quand il revient à gauche ») et la revue (A2 : ce padding rendait le cadre défilable même quand tout
tenait, Suivant menait au vide). Réponse retenue : padding de fin = gouttière du mode,
`scroll-snap-align: end` sur la dernière carte, `scroll-padding-right` = gouttière — le bout de piste
tombe exactement sur le défilement maximal, la dernière carte s'y montre entière, calée à droite.

**2. Chrome ne défile pas pour une carte partiellement visible.** La 5e carte à 1637 sur 1728 restait
coupée au focus. L'Interaction demande le défilement **minimal** (`scrollIntoView` « nearest ») sur
`:focus-visible` seulement, et le snap termine — au clic souris, déplacer la carte sous le pointeur entre
`mousedown` et `mouseup` ferait perdre le clic sur le lien.

**3. Le gabarit QWeb avait 4 cartes, le `repeat.sample` du contrat en a 5.** Wide en dessine cinq ; en
Wide le banc ne débordait pas. Le bloc suit le contrat : 5.

## Canevas — geste d'écriture sur le fichier client (§VIII, §X)

Cibles : pistes `Produits` `2694:21090` (Mobile) et `2694:21149` (Tablette), FILL → **HUG**, comme Desktop
`2694:21216` et Wide `2694:21271`. Captures AVANT des **8 instances** du set (toutes sur « 031 · Planches
de validation ») : 4 exportées et vérifiées (390×490, 834×460, 1200×490, 1728×490), **4 vides à 149
octets** parce que leurs hôtes vivent dans la section masquée « 031 · MENU MOBILE — 2 variantes »
(`visible: false`) — rien à capturer, consigné. Les variantes du set exportent vides elles aussi (rappel du
mode d'emploi : exporter des instances, jamais des variantes). Transport : le receveur JSON de l'autre
session sur :9228 (les dix ports du pont étaient pris), fichiers préfixés `034-`, déplacés aussitôt.

| Version Figma | id |
|---|---|
| avant | `2396423436246074729` |
| après (1) — pistes HUG | `2396428224592792964` |
| après (2) — cadres alignés au début | `2396429110435865682` |

**Le premier « après » a échoué à la mesure, et c'est la §X qui l'a vu** : 29,7 % de pixels en Mobile,
38,8 % en Tablette (`proofs/…/figma/diff1-defaut-alignement-cadre/`). Cause : les cadres `Carrousel
produits` Mobile `2694:21089` et Tablette `2694:21148` alignaient leur contre-axe à la **fin** (`MAX`),
contrairement à Desktop, Wide et au contrat (`align: start`) — invisible tant que la piste était FILL ; en
HUG la piste de 1088 se calait à droite (x = −698) et l'instance montrait la fin de la piste. Corrigé à la
source (`MIN`). Après (2) : **0 pixel** d'écart avec l'avant sur les quatre instances visibles ;
**8 instances avant, 8 après**.

## Mesures — bloc Odoo au repos, quatre largeurs

Page `/produits-ecommerce-test` (descripteur nouveau, 5 cartes copiées de la home), `scrollLeft = 0`,
avant (2.1.0) contre après (2.2.0 + CSS + JS) : **0 pixel** à 390 · 834 · 1200 · 1728
(`proofs/…/pixels/diff/`). Le mécanisme n'a rien bougé au repos.

## Ce qui reste ouvert, nommé

- **DW-034-001** — la bibliothèque React reste inerte (patron docs/09 documenté, pas outillé).
- **DW-034-002** — pas d'état `disabled` sur `ds.button` : le bouton en bout de piste porte `aria-disabled`
  mais ne se grise pas (la planche Figma le montre gris par une surcharge brute).
- **DW-034-003** — le glissement tactile n'est prouvé que par la molette et le focus, pas par un geste.
- **DW-034-004** — le `t-set` QWeb est une copie manuelle du `repeat.sample` du contrat (4 copies avec les
  deux descripteurs), et aucune porte ne les compare : à HEAD le bloc avait 4 cartes pour un sample de 5.
- `parity/snapshots/figma-components.json` est un index de sets sans géométrie : le geste (sizing, alignement
  de nœuds internes) n'y a rien à rafraîchir, et `parity` ne le verrait pas non plus s'il était défait.
- Le seed Odoo n'a **pas** été re-sauvé : `odoo:save` exporte la page d'accueil de l'instance **owner**, et
  l'instance de cette vague n'en a pas. Après merge, sur l'instance owner : `-u piqueray_ds`, re-`odoo:page
  home`, puis `odoo:save` — le HTML sauvegardé en 2.1.0 est `structure-stale` (jamais migré, par doctrine) ;
  le JS pose son ARIA à l'exécution pour fonctionner aussi sur cet ancien DOM.
- `snap proximity` plutôt que `mandatory` : choix mesuré (la piste montre volontairement une carte coupée),
  à revoir sur appareil si un arrêt flottant gêne.

## Revue de code (2026-09-07, après livraison)

Cinq constats vérifiés sur le code, quatre appliqués dans la foulée :
- `aria-disabled` ne coupe ni le survol ni `cursor: pointer` des boutons en bout de piste : les émetteurs
  ne connaissent que `:disabled` (`core/emit-react.ts` l. 81-86). Et **ajouter l'état `disabled` à
  `ds.button` par la méthode 032 ne les griserait pas non plus** sans élargir le sélecteur ou poser
  l'attribut natif — dépendance consignée dans DW-034-002, pas corrigée ici.
- Les écouteurs `scroll`/`resize`/`focusin` de l'Interaction relançaient `updateContent()` du noyau à
  chaque événement brut, pour rien : suffixe `.noUpdate` posé.
- Le constat QA « scroll-padding-left » ne vérifiait que `> 0` : il vérifie maintenant l'égalité avec le
  `padding-left` calculé du cadre, aux quatre largeurs — c'est l'invariant du pas.
- `withInstanceExistante` acceptait n'importe quel port, y compris celui de l'owner : refus par nom de
  `:8071` / `piqueray-odoo-test`.
- Le commentaire du banc disait « 4 cartes » pour un gabarit qui en rend 5 : corrigé, et DW-034-004 ouvert.
Un constat réfuté : `.nth(n-2)` avec moins de deux cartes est inatteignable sur le banc (sample fixe).

Seconde passe (un seul agent Opus, après restauration), trois constats de plus, tous appliqués :
- **A1** — le reçu du scénario, écrit dans `specs/019-…/proofs/`, aurait fait basculer le manifeste de
  qualification en `failed` (codes de limite hors `ACCEPTED_LIMITS`). `Recueil.ecrire` accepte désormais
  un dossier de destination (additif) ; le reçu 034 vit sous `specs/tiny/proofs/vague-034-…/`.
- **A2** — la course à vide du padding de fin (voir « Trois choses », 1).
- **A3** — `role="group"` sur une carte qui est un `<a href>` retirait la sémantique de lien et
  l'`aria-label` faisait disparaître le prix. La carte reste un lien sans role, nommée « Titre, prix —
  produit n sur N » ; le JS retire les attributs périmés d'un HTML sauvegardé entre-temps.
- B — `destroy()` défait ce que `start()` pose (l'éditeur démarre puis détruit les Interactions avant de
  sauver) ; le nom de la région suit le titre éditable. Ouverts, nommés : l'ordre de tabulation (piste puis
  contrôles, l'APG les met avant) et la mémoïsation du cadre.

## Incident de worktree (2026-09-07, 13:13)

L'autre session du worktree a remis à HEAD tous les fichiers de cette vague et supprimé les nouveaux,
pour committer sa propre vague sans le carrousel — après une sauvegarde intégrale dans
`/tmp/carrousel-wip/` (70 fichiers), mais sans prévenir. Rien n'a été perdu : fichiers exclusifs
restaurés depuis la sauvegarde, hunks ré-appliqués sur les fichiers partagés du commit `c6789471`,
verrou re-piné (digest `cac4ddb8…`), chaîne build → déploiement → scénario vert → pixels rejouée
entièrement. Les captures Figma « avant » sont celles de la sauvegarde : elles ne peuvent pas être
refaites (le canevas est déjà à l'état après).

## Portes

`build` · `parity` (**aucune dérive neuve**, 20 acquittements inchangés) · `plugin:check` · `roundtrip` ·
`core-browser-check` · `tsc` (× 2) · `odoo:typecheck` · `odoo:module:check` (23/23) · `odoo:authoring:check`
· `odoo:inputs:check` · `odoo:derivation:check` (86 blocs) · `odoo:assets --check` · `odoo:figma-links:check`
· `geometry:gate` (0 invisible) · `emitters:check` — toutes vertes. Re-pins : `evals/golden.json`,
`figma-sync/plugin/engine.receipt.json`, `catalog/`, `inputs.lock.json` (graphDigest
`947b3211…`, propagé aux 14 blocs de `components.xml`, `version_guard.js`, `scan-saved-versions.ts`,
`cases.json`). `npm run eval` : **248/248**, lancé seul — trois fois dans la journée (12:15 avant l'incident, puis deux
fois après la restauration et les correctifs de revue). Rejouées entièrement après restauration : toutes
vertes. `odoo:qualification` (hors liste des portes) est rouge **à HEAD déjà** — hash incohérent du reçu
`google-reviews-functional.json`, sans rapport avec cette vague ; vérifié sur une copie du dossier de
preuves de HEAD.

## Note de coordination

Une autre session travaille dans le **même worktree** (hero, accordion-row, texte-seo, page portes de
garage) et y fait tourner `npm run eval`. Aucun commit n'est fait ici ; les fichiers de cette vague sont
listés nominativement dans le compte rendu. Trois fichiers sont **partagés** avec l'autre session et ne
peuvent pas être stagés séparément : `views/components.xml`, `config/figma-panels.json`, et les générés
globaux (`catalog/`, `components.pqr.css`, `golden.json`, `derivation-report.json`). L'entrée « Recent
Changes » de `CLAUDE.md` n'est délibérément pas écrite, comme pour la 033 : à poser au merge.
