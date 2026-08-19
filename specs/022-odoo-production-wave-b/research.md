# Research — 022 odoo-production-wave-b

**Date**: 2026-08-19 · **Entrées lues avant toute décision** (constitution §IX, auggie MCP
indisponible HTTP 402 → lecture directe, fallback nommé) : `integrations/odoo/README.md`
(workflow de portage en 5 étapes, quatre frontières, règles média/canvas), 
`specs/019-odoo-production-foundation/contracts/authoring-config.schema.json` (vocabulaire figé
des verdicts), configs/QWeb/ponts/QA de 019 (précédents exécutés), dossiers 020
(`dossiers/{coordonnees,reassurances}/`), commit `cc6cd0d4` (CTA-link, 2026-08-18),
`contracts/{coordonnees,reassurances,carte,section-header}.contract.json`.

Aucun NEEDS CLARIFICATION dans la spec — les inconnues étaient volontairement déférées au gate
humain. Les décisions ci-dessous préparent le gate (recommandations) et fixent le HOW technique.

---

## D1 — Workflow de portage : celui de 019, sans variation

**Decision**: suivre à la lettre la séquence du README (`Porter un contrat vers Odoo`) :
(1) `ROOT_CONTRACT_IDS` + repin explicite du lock ; (2) `<section>.authoring.json` exhaustif ;
(3) spike de tout mécanisme incertain AVANT le QWeb ; (4) QWeb + options + adaptations
enregistrées ; (5) assets régénérés + preuves (fonctionnel, save/reopen/public, isolation,
responsive, visuel mesuré).
**Rationale**: prouvé 8 fois ; la spec l'impose (FR-005) ; toute variation serait une exception
que la vague « contenu » exclut par hypothèse d'entrée.
**Alternatives considered**: aucune — c'est l'autorité de départ du brief owner.

## D2 — Fermeture du lock : 15 → 18 contrats, `ds.carte` entre par la fermeture

**Decision**: ajouter `ds.coordonnees` et `ds.reassurances` aux racines ; la fermeture calculée
(jamais écrite à la main — `closureOf` dans `repo-data.ts`) tire `ds.carte` (2.0.1) en plus des
déjà-épinglés `ds.section-header` et `ds.button`. Repin explicite → nouveau `graphDigest` →
réalignement des `data-ds-graph-digest` et versions ancrées sur les **10** QWeb.
**Rationale**: le lock porte version + SHA-256 (l'un sans l'autre ne détecte pas tout) ; le
digest est embarqué dans chaque racine posée et vérifié par `odoo:module:check` — un repin
partiel laisserait 8 sections mentir sur leur graphe.
**Alternatives considered**: repin limité aux 2 nouvelles racines — rejeté : `graphDigest` est
global par construction, un digest à deux valeurs n'existe pas dans le schéma du lock.

## D3 — Vocabulaire des verdicts : le schéma 019 figé, mapping français explicite

**Decision**: les 4 verdicts de la spec mappent 1:1 sur le schéma 019 (`controlled` /
`directly-editable`, `fixed-by-composition`, `not-editable`, `out-of-capacity` + `reasonCode`),
mécanismes parmi {plain-text, rich-text, boolean, enum, number, media, ordered-repeat,
computed-display, none}, marques parmi {strong, em, link, line-break}. Aucune extension de
schéma.
**Rationale**: `odoo:authoring:check` valide contre ce schéma ; FR-001 exige un des quatre
verdicts — ils existent déjà, mot pour mot.
**Alternatives considered**: nouveau format de table — rejeté : deuxième source de vérité.

## D4 — Adaptation de largeur (« w-auto ») : pont d'addon root-scopé, enregistré

**Decision**: les largeurs fixes des contrats (Réassurances racine 1550 ; Coordonnées plan
1152 + `min-width` 1152, wrapper 576 ; cartes 364) ne sont PAS imposées à la page : deux blocs
`ODOO-022-COORDONNEES-BRIDGE` et `ODOO-022-REASSURANCES-BRIDGE` dans `odoo-bridge.css`
(reasonCode `odoo-layout-bridge`) rendent la racine fluide (plafonnée à sa largeur naturelle),
neutralisent le `min-width` du plan et rendent les cartes rétrécissables (`min-width: 0`), le
wrapper Coordonnées gardant ses 576px. Contrats intacts (FR-005/FR-007).
**Rationale**: relevé sur les 8 sections montées — les 4 racines « naturellement » adaptatives
portent `width: fill` AU CONTRAT (hero, presentation, equipe, sav : `width:100%; min-width:0`
générés) ; nos deux contrats portent des largeurs FIXED fidèles à Figma. Le précédent du geste
est exact : `ODOO-019-GOOGLE-REVIEWS-BRIDGE` pose `width:100%; min-width:0` sur les cartes
répétées sans toucher le contrat de ReviewCard. Limite connue portée au dossier : DW-002 — la
source Réassurances déborde d'elle-même de 2px (4×364+3×32=1552 dans 1550), le CSS rétrécit,
c'est le comportement fidèle documenté.
**Alternatives considered**: (a) modifier les contrats vers `width: fill` — interdit par la spec
(consommés tels quels, 020/021 non rouverts) ; (b) poser un `.container` Odoo — interdit :
`section > .container` est un sélecteur d'OUVERTURE d'édition du noyau (leçon 018, mesurée,
documentée en tête d'`authoring.js`) ; (c) transformer les largeurs dans `build-assets` — rejeté
: la sortie générée doit rester la dérivation pure du contrat, l'adaptation est une décision
d'addon qui se voit au registre.

## D5 — Plan Google & images de cartes : le patron média 019, pose sans src

**Decision**: `mapUrl` → `controlled / computed-display` (bouton métier au panneau → dialogue
média natif, persistance `/web/image`, same-origin, ni URL externe ni exécutable) ; `mapAlt` →
`plain-text`. Idem par carte pour `items[].imageUrl` (+ champ alt d'instance). Les `<img>` sont
livrés SANS attribut src (comme `hero__Background`) : une section posée n'affiche jamais d'image
cassée ; les valeurs de production entrent par le rédacteur au montage.
**Rationale**: précédents exécutés : hero `backgroundUrl`, équipe portrait (avec la règle du
`o_modified_image_to_save` déjà résolue en 019) ; règle canvas commune : un clic direct sur le
bitmap n'ouvre JAMAIS les conteneurs natifs (`ReplaceMediaOption`, `ImageToolOption`,
`ImageAndFaOption`).
**Rationale (route alt)**: la route `items` du contrat ne porte pas d'alt (`ds.carte.imageAlt`
défaut "") — l'alt vit dans l'instance Odoo comme l'URL ; limite nommée dans la table (R2d),
pas un contournement silencieux.
**Alternatives considered**: embarquer les photos Piqueray dans l'addon — rejeté (« aucune image
métier dans l'addon », règle média du Hero) ; default non vide — rejeté (le contrat dit :
un défaut non vide substituerait une image).

## D6 — Collection Réassurances : `ordered-repeat` + blueprint, gestes natifs neutralisés

**Decision**: `items` → `controlled / ordered-repeat` ; gestes proposés {ajouter, supprimer,
monter, descendre} via `repeat_action.js` (Add/Remove/MoveUp/MoveDown CarteAction), blueprint
`<template data-pqr-carte-blueprint>` sans src, marqueurs par POSITION
(`data-pqr-carte-marker="carte-N"`), bornes 0..n. Duplication/suppression/déplacement NATIFS
d'une carte fermés par `is_unremovable_selector` (descendants) — déjà en place, à éprouver au
scénario.
**Rationale**: précédents : équipe (0/1/16/17 testé), google-reviews, faq, texte-seo — le
mécanisme est le plus rejoué de l'addon ; le DOM sauvegardé est la seule source (aucune liste
JSON parallèle ne survit au premier save — commentaire QWeb 019).
**Alternatives considered**: geste « dupliquer une carte » — non proposé : n'existe dans aucun
panneau 019 (Add part du blueprint neutre) ; l'owner peut l'exiger au gate, coût faible mais
nommé.

## D7 — `disposition` Réassurances : recommandation « figée 4 cartes » (Q-R1 au gate)

**Decision (proposée au gate)**: `not-editable`, valeur posée `4Cartes` ; seuls les plans de la
variante 4 cartes existent dans le DOM ; `BoutonCinqCartes` et `Boutons{...}` = fixés par
composition, jamais rendus.
**Rationale**: (a) un bloc posé ne se re-rend jamais (fait 018) — une variante ne peut pas
ajouter/retirer des cartes d'un DOM sauvegardé ; le NOMBRE de cartes appartient déjà aux gestes
de collection (D6) ; (b) « 5 cartes » implique une largeur de carte par variante du parent
(285px — limite nommée au contrat) et « QuatreCartesDeuxCta » une rangée de CTA différente :
plans + styles par variante = exception structurelle exclue de la vague « contenu » ;
(c) le census 013 a mesuré la variante « 4 cartes » comme l'état de production.
**Alternatives considered**: `controlled / enum` à la review-note (bandes cachées) — faisable
(précédent exécuté sur ds.notation) mais ce serait la première variante STRUCTURELLE gouvernée :
3 plans de CTA + interaction variante×collection non triviale ; proposé seulement si l'owner le
demande au gate, comme exception nommée.

## D8 — CTA Réassurances : libellé éditable + lien au panneau (Q-R2 au gate)

**Decision (proposée au gate)**: `children` (« Contactez-nous ») → `controlled / plain-text`
(édition en ligne du `button-label`) ; le lien via `SetCtaHrefAction` existant (gabarit
`actionParam`, `BuilderUrlPicker`, repli same-origin, `javascript:` refusé) ; variante/glyphes
fixés par composition. L'hôte `<a>`/`<button>` suit `link_href` (template `pqr_button` partagé,
parade focus `button-root` déjà posée au pont).
**Rationale**: cohérence mesurable — les six CTA posés (hero, presentation, faq, devis, sav)
ont tous libellé éditable + lien panneau ; le mécanisme date d'hier (commit `cc6cd0d4`), rejoué
vert 13/13-15/15.
**Alternatives considered**: bouton entièrement figé (lecture littérale du scénario 3 US2) —
présenté au gate ; ce serait le premier CTA posé non éditable de l'addon, incohérence à assumer
explicitement si choisie.

## D9 — Bloc Tél/Email : deux options au gate (Q-C1), spike avant claim

**Decision (proposée au gate)**: Option A recommandée — téléphone et email deviennent de vrais
liens `tel:` / `mailto:` (marques `link` + `line-break`) : le soulignement du contrat est rendu
par le lien (visuel identique), l'édition ne peut pas le perdre, le site gagne le
clic-pour-appeler. Adaptation Odoo enregistrée — précédent de principe : lien CTA (décision
owner 2026-08-18 : les contrats ne portent aucune notion de lien ; la gouvernance du lien vit au
registre d'adaptations). Option B : spans soulignés statiques + texte simple — limite nommée :
une réécriture complète du bloc peut perdre le soulignement segmentaire (le garde rich-text ne
connaît pas `u`).
**Décision ferme (indépendante du gate)**: un SPIKE exécute pose → édition → save → reopen →
public sur ce bloc (survie du saut de ligne `\r`/pre-line et du soulignement) AVANT l'intégration
finale — leçon 018 : six prémisses « lues » se sont révélées fausses à l'exécution.
**Alternatives considered**: `out-of-capacity` sur le bloc — faux : le mécanisme existe dans les
deux options ; réserver ce verdict aux vrais murs.

## D10 — Icônes sociales : proposition « cliquables via panneau » (Q-C2 au gate)

**Decision (proposée au gate)**: icônes Facebook/Instagram jamais remplaçables (média
non éditable) ; Option A recommandée — chacune devient cliquable, URL réglée au panneau (« Lien
Facebook », « Lien Instagram »), même grammaire/action que le lien CTA (une seule mécanique,
paramétrée par part). Option B : icônes statiques, contrat strict.
**Rationale**: une icône sociale morte sur un site public n'a pas d'usage ; mécaniquement
identique au CTA-href (aucun mécanisme nouveau) ; adaptation enregistrée, contrat intact.
**Alternatives considered**: liens en dur dans le QWeb — rejeté : une URL métier cuite dans
l'addon viole la règle « aucune donnée métier embarquée » (même famille que les images).

## D11 — Référence visuelle : le mécanisme 019 mesure l'apparence validée en 020

**Decision**: côté référence = `emitHtml` du contrat au clip épinglé (`render-html.mts
--measure` imprime la boîte et refuse un clip trop petit) ; côté Odoo = `capture-odoo.mts` sur
page publique sans session ; `compare.mts` via `extract/image-parity` inchangé. Sujets ajoutés :
`qa/visual/subjects/{coordonnees,reassurances}.mts`. Largeurs de contrôle QA : 1728 (référence)
et 1440 (assertions racine + enfants, zéro débordement).
**Rationale**: les décisions 020 (`reference-validated`, 2026-08-09, owner) épinglent le contrat
par SHA et la version Figma 2385391614633344086 — le rendu du contrat EST l'apparence validée ;
021 a réparé la projection Figma de Coordonnées (verdict 020 `repair-renderer` → contrat 2.2.0
au dépôt) ; Réassurances est `ready-with-exception` → destination `wave-b`, exception nommée
(endpoint variables 403) qui ne bloque pas la mesure d'image.
**Alternatives considered**: comparer aux PNG Figma de 020 — rejeté : le harnais 019 refuse les
dimensions différentes par construction (pas de redimensionnement silencieux) et la chaîne
emitHtml↔Odoo est celle qui a produit les 0,0000 % mesurés.

## D12 — QA & preuves : un scénario par section + rejeu intégral, reçus archivés

**Decision**: `coordonnees.spec.mts` et `reassurances.spec.mts` (pose, rendu par défaut,
adaptation 1728/1440, éditions autorisées, tentatives interdites — y compris le geste de texte
direct sur chaque zone non éditable et les gestes natifs de collection —, isolation 2 pages +
2 instances même page, persistance save/reopen/public) ; `coordonnees-spike.spec.mts` (D9) ;
rejeu des scénarios existants (8 sections + combined-isolation + editability-boundary +
versioning + install-update, inventaires fixtures 8 → 10) ; reçus JSON sous
`specs/022-odoo-production-wave-b/proofs/`, rapport de qualification final.
**Rationale**: FR-014/FR-015/SC-004..008 ; le patron de reçus (`receipt.constateSi`) et
l'instance compose épinglée existent ; l'edge « verrou contourné » vient du reçu 018 (un
mécanisme fermait réglages et drop zones sans fermer l'édition du texte).
**Alternatives considered**: étendre `editability-boundary` au lieu de scénarios dédiés —
rejeté : la spec exige un scénario PAR SECTION archivé (FR-015) ; le banc partagé reste le
témoin transversal.

---

## Addendum post-gate (2026-08-19) — décisions owner, datées, qui priment sur les propositions

Le gate humain a été exécuté en séance (/speckit.plan, AskUserQuestion). Trois rulings :

1. **Plan Google : PLACEHOLDER, pas de média** (écarte la moitié « plan » de D5). L'owner
   alimente le plan plus tard **via une API custom** (hors vague 022 — à spécifier dans une spec
   future). D'ici là : `mapUrl`/`mapAlt` → `not-editable`, la section pose une boîte aux
   dimensions du contrat SANS src (identique des deux côtés de la mesure visuelle — leçon 017 :
   ne jamais mesurer `<img src="">` contre une photo), aucune action média au panneau, clic
   direct toujours fermé. D5 reste valide en entier pour les **images de cartes** de
   Réassurances. Le périmètre rédacteur de Coordonnées, dans les mots de l'owner : « du texte et
   des liens réseaux sociaux ».
2. **Q-C1 = Option A, Q-C2 = Option A** (D9/D10 confirmées) : tél/email en liens
   `tel:`/`mailto:`, icônes sociales cliquables via panneau. Le spike D9 reste obligatoire avant
   intégration.
3. **Réassurances validée telle que proposée ; Q-R1 précisée** : pas de réglage de variante —
   « c'est une grille de 4 colonnes » (owner). Conséquence d'addon (complète D4/D6) : la rangée
   de cartes se comporte en **grille de 4 colonnes** — 4 cartes = la référence exacte ; au-delà,
   passage à la ligne (précédent Équipe) ; en dessous, rangée centrée. Comportement exercé au
   scénario QA (gestes 0..n). Q-R2 (libellé + lien) et Q-R3 (4 gestes) validées.
