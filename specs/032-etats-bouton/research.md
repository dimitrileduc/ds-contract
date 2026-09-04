# Phase 0 — Recherche : États d'interaction du Bouton gouverné

**Spec** : [spec.md](spec.md) · **Date** : 2026-09-04 · **Branche** : `oceanic-oak` (feature `032-etats-bouton`)

Toutes les décisions ci-dessous sont **relevées**, pas dérivées : chaque ligne
porte le fichier et la ligne qui la prouve. Les questions de capacité ont été
posées à `docs/` et au code avant d'être répondues (§IX).

---

## D1 — Le moteur sait déjà faire les états. Rien à inventer.

**Décision** : n'ajouter **aucune** capacité au schéma ni aux émetteurs pour les
états. Le canal existe, il est documenté, il est validé, il est simplement **vide
sur les 39 contrats Piqueray**.

**Relevé** :

| Fait | Preuve |
|---|---|
| `contract.states` accepte `hover · active · focus-visible · disabled` | `packages/schema/src/contract-schema.ts:1316` |
| `anatomy.<part>.states` = état → canal CSS → réf de jeton | `contract-schema.ts:1057` et `:1177` |
| La racine porte le **vocabulaire complet** ; une part non-racine est bornée aux canaux couleur | `core/emit-react.ts:92` (`PART_STATE_CHANNELS`) |
| Sélecteurs émis : `:hover:not(:disabled)`, `:active:not(:disabled)`, `:focus-visible` | `core/emit-react.ts:81-86`, miroir `core/emit-html.ts:73` |
| La bague de focus est émise d'office dès que `focus-visible` est déclaré | `emit-react.ts:2004` et `emit-html.ts:400` — `outline-style: solid; outline-offset: 2px` |
| `figmaStatePreviews` fabrique l'axe **State** sur le canevas depuis le contrat | `contract-schema.ts:1338`, compilation `core/emit-figma-script.ts:3032` |
| L'ajout de l'axe **renomme les variantes en place** (identifiants préservés) | `emit-figma-script.ts:5180-5215` |
| `ds.button` déclare aujourd'hui `"states": []` | `contracts/button.contract.json` |

**Conséquence** : le périmètre de code du dépôt se réduit à **un contrat, des
jetons, et des evals**. Aucun émetteur n'est touché. C'est ce qui rend la vague
petite malgré l'ampleur de son effet.

**Alternatives écartées** : écrire les règles à la main dans `odoo-bridge.css`
(c'est exactement la dette que la spec remplace — invisible du différentiel) ;
étendre le schéma (inutile, le canal existe).

---

## D2 — Les couleurs viennent du canevas, relevées, pas recalculées

**Décision** : reprendre **verbatim** les fills de la planche
`PROPOSITION — États du Bouton (à valider) · ne PAS synchroniser`, nœud
`2738:15904`, lue par REST le 2026-09-04.

**Relevé complet** (fills SOLID, lecture REST `GET /v1/files/…/nodes?ids=2738:15904`) :

| Style | Repos | Survol | Pressé | Libellé survol / pressé |
|---|---|---|---|---|
| Default | `#26282C` | `#404245` | `#4A4D51` | blanc / blanc |
| Orange | `#F98A0B` | `#E07C0A` | `#C76D09` | blanc / blanc |
| Blanc | `#FFFFFF` | `#E0E0E0` | `#CFCFCF` | noir-bleuté / noir-bleuté |
| Outline blanc | (contour) | `#FFFFFF` | `#E0E0E0` | noir-bleuté / noir-bleuté |
| Link | (aucun) | (aucun) | (aucun) | **non posé — voir D6** |
| Outline noir | (contour) | `#26282C` | `#404245` | blanc / blanc |
| Icône seule | (contour) | `#26282C` | `#404245` | blanc / blanc |

**Cinq teintes sont neuves** — exactement le compte annoncé par la spec :
`#404245`, `#4A4D51`, `#E07C0A`, `#C76D09`, `#CFCFCF`.
`#E0E0E0` **existe déjà** (`color.gris-clair`) et est réutilisée telle quelle.

**Vérification arithmétique** (elle confirme le récit de la spec, elle ne le
remplace pas) : `#F98A0B → #E07C0A` est exactement ×0,90 et `→ #C76D09` ×0,80 ;
`#26282C → #404245` est exactement un éclaircissement de 12 % vers le blanc.
Le calcul a précédé la pose ; le **relevé** est postérieur. Cette entorse à §VIII
est écrite dans la `$description` de chaque jeton, pas passée sous silence
(exigence de la spec, section Assumptions).

**Écart nommé** : la planche est une **maquette**, pas des instances du Bouton
(son propre sous-titre le dit). Elle n'est donc pas un master à extraire : elle est
une décision de couleur, relevée comme telle.

---

## D3 — FR-019 refusait la palette validée. Arbitrage owner du 2026-09-04.

**Fait mesuré** (WCAG 2.x, libellé sur fond) :

| Style | Repos | Survol | Pressé |
|---|---|---|---|
| Default | 14,76 | **10,08** | **8,50** |
| Orange | 2,42 | 2,98 | 3,74 |
| Blanc | 14,76 | **11,18** | **9,48** |
| Outline blanc | 14,76 | 14,76 | **11,18** |
| Outline noir | 14,76 | 14,76 | **10,08** |
| Icône seule | 14,76 | 14,76 | **10,08** |

Lu à la lettre — « le contraste de chaque état ≥ celui du repos » — **FR-019
refuse la palette que l'owner a validée, sur 5 styles sur 7**, parce que la
palette éclaircit les fonds sombres au lieu de les assombrir. Le seul style que
FR-019 laissait passer est précisément celui qu'il visait (Orange).

**Décision owner (2026-09-04)** : FR-019 se lit désormais comme **un plancher AA
plus une clause de non-régression** :

> Aucun état ne descend sous **4,5 pour 1**. Un style déjà sous AA au repos
> (Orange, FR-012) ne doit jamais empirer : son contraste croît, état après état.

Sous cette lecture la palette passe intégralement : minimum **8,50** pour les six
styles conformes, et Orange **monte** 2,42 → 2,98 → 3,74. La lecture littérale est
consignée comme rejetée, avec sa raison, dans le rapport de clôture.

**Alternatives écartées** : garder la lettre (obligeait à refaire la palette
validée et à désynchroniser la planche du site) ; retirer FR-019 (plus aucun
garde-fou : la vague pourrait aggraver l'Orange sans que rien ne le voie).

---

## D4 — La bague de focus : un ton par style, pas deux tons superposés

**Décision owner (2026-09-04)** : `outline` de 2 px dont la **couleur suit le
style**, via le canal à substitution `{variant}` déjà supporté.

**Pourquoi le deux-tons de la planche est écarté** — trois faits :

1. **L'ombre portée est interdite, et le mécanisme du piège est nommé.**
   La racine du Bouton dessine ses bordures par
   `box-shadow: inset 0 0 0 var(--dsc-border-width) var(--dsc-border-color)`
   (`src/components/Button/Button.module.css`, règle `.root`). `rootBorderPlan`
   (`core/emit-react.ts:126-151`) débranche ce rendu dès qu'un canal `box-shadow`
   apparaît **où que ce soit sur la racine, états compris** (`:134` collecte
   `root.states`). Une bague en ombre portée ferait donc retomber les bordures sur
   `border-style`, qui **fait grossir la boîte** — FR-010 tombe, sans erreur.
2. **`outline-offset` n'est pas un canal gouverné.** Le registre
   `DECLARED_CHANNELS` (`packages/schema/src/contract-schema.ts:383`) porte
   `outline-style` mais **pas** `outline-offset` : coller deux anneaux l'un à
   l'autre demanderait d'ouvrir un canal, donc une modification de schéma pour un
   gain visuel, contre la règle du moindre ajout.
3. **Le deux-tons n'est de toute façon pas universel.** Sur `Outline noir`,
   l'anneau intérieur se confond avec la bordure du bouton, qui est déjà de cette
   teinte : le style perdrait son signal de focus.

**Pourquoi un ton par style suffit, et c'est mesuré.** Les styles posés sur fond
sombre sont exactement `blanc` et `outlineBlanc` — relevé par lecture des 18
contrats qui instancient `ds.button` :

| Style | Sections qui l'utilisent | Fond |
|---|---|---|
| `outlineBlanc` | `devis`, `footer`, `hero`, `hero-video`, `menu-mobile` | sombre |
| `blanc` | `header`, `menu-mobile` | sombre |
| `outlineNoir` | `faq`, `google-reviews`, `produits-ecommerce`, `reassurances`, `carte-categorie` | clair |
| `link` | `carte`, `carte-categorie`, `presentation`, `review-card` | clair |
| `iconOnly` | `carousel-controls` | clair |
| `default`, `orange` | aucune section — valeurs par défaut seulement | — |

Contrastes de l'anneau sur les fonds réellement employés :

| Fond de page | anneau `#26282C` | anneau `#FFFFFF` |
|---|---|---|
| `color.blanc` `#FFFFFF` | **14,76** | 1,00 |
| `color.bleu-clair` `#F4F6FA` (`coordonnees`) | **13,65** | 1,08 |
| `color.beige-clair` `#FFF3E2` | **13,48** | 1,10 |
| `color.noir-bleute` `#26282C` (hero, pied de page) | 1,00 | **14,76** |
| `color.noir-pur` `#000000` (`devis`) | 1,00 | **21,00** |

FR-005 (3 pour 1) et SC-002 sont tenus avec une marge d'un facteur 4.

**Limite nommée, à écrire dans la doc de capacité** : l'anneau est choisi par
style, donc il suppose que le style reste posé sur le fond pour lequel il est
dessiné. Poser un `blanc` sur une section claire donnerait un anneau blanc sur
blanc. Rien ne le détecte automatiquement aujourd'hui — c'est un fait à écrire,
pas un garde-fou à inventer dans cette vague.

---

## D5 — Le canal à substitution impose une famille de jetons COMPLÈTE

**Fait** : `.variant-<valeur><sélecteur>` n'est émis que si le jeton résolu
existe, et **un jeton manquant est un refus par nom**, pas un saut silencieux
(`core/emit-react.ts:1627-1635`, appelé en `:2043`). Déclarer
`states.hover["background-color"] = "{color.etat.{variant}.fond-survol}"` oblige
donc les **sept** valeurs de l'énuméré à exister.

**Décision** : introduire une famille d'alias `color.etat.<style>.<canal>` —
7 styles × 5 canaux = **35 alias**, chacun pointant sur une primitive. Les styles
dont un canal ne change pas alias la valeur de repos ; rien n'est inventé, tout
est traçable.

**Conséquence** : deux primitives supplémentaires, **posées par le plan et non par
l'owner** — la spec parle de cinq couleurs, il en faudra sept :

- `color.transparent` `#FFFFFF00` — le style `Link` n'a pas de fond ; son
  `fond-survol` doit exister pour que la famille soit complète, et doit ne rien
  peindre. La racine émet déjà `background-color: transparent` au repos, donc
  c'est la valeur de repos aliasée, pas une invention de couleur.
- `color.noir-profond` `#131416` — le pressé du `Link` (voir D6).

Ces deux-là portent dans leur `$description` la mention « posé par la spec 032,
non relevé de la planche owner ».

**Alternative écartée** : peindre le survol du `Link` en `{color.blanc}`. Cela
marche aujourd'hui parce que ses quatre hôtes sont sur fond blanc, et cassera le
jour où l'un passera sur `bleu-clair` — un fait vrai par accident.

---

## D6 — Le style Link : la planche est muette, l'owner a tranché

**Fait** : sur la planche, `Link / repos`, `Link / survol` et `Link / pressé`
portent **le même libellé `#26282C`**. La décision FR-013 (« changement de couleur
du libellé ») n'a donc pas de couleur derrière elle.

**Contrainte** : le repos est à 14,76 sur blanc. Toute teinte plus claire fait
chuter la lisibilité — `color.orange` tombe à **2,42**, sous AA et sous le repos.

**Décision owner (2026-09-04)** : survol → `color.noir-pur` `#000000` (**21,00**),
pressé → un ton minté entre le repos et le noir pur, `color.noir-profond`
`#131416` (**18,43**).

**Observation consignée, non corrigée** : le pressé est ainsi *moins* extrême que
le survol, là où l'usage veut une progression. Les deux teintes restent
très au-dessus de AA et distinctes du repos ; l'ordre est celui que l'owner a
choisi et il est écrit ici pour qu'il ne soit pas redécouvert comme un bug.

**Limite nommée (FR-013)** : le soulignement au survol serait plus lisible, et il
est **impossible par style**. `declaredStates` est indexé
`état → canal → valeur` sur la racine (`contract-schema.ts:1046`, rendu
`emit-react.ts:2055`) : **aucune dimension par valeur d'énuméré**. Souligner le
`Link` au survol soulignerait les sept styles. Cette limite va dans
`docs/FIGMA-CAPABILITY-MATRIX.md` avec la décision owner comme repli.

---

## D7 — Le survol collant sur écran tactile : accepté et nommé

**Fait** : les émetteurs ne gardent pas les règles de survol derrière
`@media (hover: hover)` — vérifié, aucune occurrence dans `core/emit-react.ts` ni
`core/emit-html.ts`.

**Décision (défaut raisonnable, la spec le demande)** : **accepter** le
comportement de la plateforme et l'écrire comme limite. Trois raisons :
`:active` fournit déjà le retour d'appui exigé par FR-003 ; les navigateurs
mobiles purgent l'état au geste suivant ; et poser la garde `hover: hover`
serait une modification d'**émetteur** touchant les 39 contrats et re-pinnant
tout l'or — un coût sans rapport avec le bénéfice, et hors du périmètre annoncé.

**Report inscrit** : « garde `@media (hover: hover)` sur les règles de survol,
tous contrats » part au registre de travail différé, avec cette raison.

---

## D8 — Le sync de jetons est bloqué, et le déblocage est une écriture de métadonnée

**Fait** : `figma-sync/01-tokens.js` exécute un **préflight des styles de texte
avant la première mutation de variable** et lève
`Missing historical Text Style marker for …` (`core/emit-figma-script.ts:729`).
Le marqueur d'identité est `ds_contracts / textStyleToken`
(`emit-figma-script.ts:695`), et **tout** groupe `typography.*` portant une
extension `figmaTextStyle` exige ce marqueur
(`core/text-styles.ts:131`, `requiresExistingMarker: true`).

**Les deux styles concernés** — relevés dans `tokens/semantic.tokens.json` :

| Groupe | Style Figma | Recette |
|---|---|---|
| `typography.menu-entree` | « Entrée menu » | Montserrat Medium 24/30, capitales |
| `typography.menu-sous-entree` | « Sous-entrée menu » | Montserrat Regular 18/27 |

Tous deux créés par la vague 031 le 2026-09-04, **sans marqueur**.

**Décision** : une **migration de marqueur seule** — un script de pont qui pose
`setSharedPluginData('ds_contracts','textStyleToken', 'typography.<rôle>.size')`
sur les deux styles existants, **après avoir vérifié que leur définition vive est
identique à la recette** (`sameTextStyleDefinition`, `emit-figma-script.ts:717`).
Écriture de métadonnée pure : aucun pixel ne bouge, aucun nœud n'est créé.

**Pourquoi c'est un préalable dur** : sans elle, `01-tokens.js` refuse **avant**
d'écrire la moindre variable, donc les 42 variables d'état ne peuvent pas naître,
donc l'axe canevas des jetons reste rouge et FR-007 n'est pas tenable.

**Défaut de doc à corriger** : `docs/03-token-pipeline.md` désigne les mauvais
styles pour cette migration (constat de la spec, section Faits établis) — la
correction fait partie de la vague.

---

## D9 — Les quatre évaluations que ce changement débloque

**Relevé** dans `evals/legacy-cases.ts`, chacune annotée `RE-ENABLE WHEN: un
composant Piqueray avec des états d'interaction` :

| Cas | Ligne | Famille | Ce qu'il prouve | Adaptation |
|---|---|---|---|---|
| `refuse-hollow-state-previews` | 357 | C2-refus | l'opt-in `figmaStatePreviews` est refusé **par nom** s'il est creux | directe : le fixture manipule déjà `CONTRACT` |
| `focus-not-pressed-browser-probe` | 865 | C1-déterminisme | dans un vrai Chromium, le focus clavier **ne rend pas** le fond de survol | quasi directe : lit déjà `contracts/button.contract.json`, seuls les noms de jetons changent |
| `state-axis-drift-both-directions` | 411 | C3-détection | l'axe State est surface déclarée quand opté, dérive sinon | réécriture des comptes de variantes (12 → 28) |
| `state-previews-bounded-canvas-only` | 377 | C1-déterminisme | l'explosion est bornée au seul axe primaire | réécriture : le fixture suppose un Bouton à deux axes (Variant × Size), Piqueray n'en a qu'un |

**Décision** : restaurer **`focus-not-pressed-browser-probe`** en premier — c'est
la seule qui prouve FR-006 (« pas de bague à la souris ») **et** FR-004 dans un
navigateur réel, et c'est la moins réécrite. Restaurer ensuite
`refuse-hollow-state-previews` (elle garde FR-008 honnête). Les deux autres sont
proposées, chiffrées, et laissées au registre si le budget de la vague se tend :
FR-015 n'en exige qu'une, SC-005 exige au moins +1.

`evals/REMOVED-CASES.md` est mis à jour à la sortie de quarantaine — la
quarantaine n'est jamais silencieuse (`evals/run.ts:6686`).

---

## D10 — La cascade Odoo : cartographiée, mécanique, et large

**Fait** : `graphDigest` est **global** — calculé sur tous les contrats. Toucher
`ds.button` le déplace, donc **les 13 blocs** installés basculent en
`structure-stale` (`version_guard.js:19`).

**Miroirs manuels à aligner** — relevés, comptés :

| Miroir | Ce qui bouge | Volume mesuré |
|---|---|---|
| `integrations/odoo/config/*.authoring.json` | version de `ds.button` dans les `componentPath` | **253 épingles** dans 13 fichiers (55 pour `produits-ecommerce` et `reassurances`, 22 pour `categories`, `google-reviews`, `menu-mobile`, 11 pour les huit autres) |
| `integrations/odoo/addons/piqueray_ds/views/components.xml` | `data-ds-graph-digest` | **14 occurrences** |
| `…/static/src/js/version_guard.js` | `CURRENT_GRAPH_DIGEST` | 1 |
| `scripts/odoo/scan-saved-versions.ts` | `EXPECTED_GRAPH` (jumeau manuel du précédent) | 1 |
| `evals/fixtures/odoo-production/version-drift/cases.json` | digest dans les cas `current` **et** `policy-stale` | 2 |
| `integrations/odoo/config/inputs.lock.json` | version + sha256 + digest | régénéré par `check-inputs.ts --repin` |

**Ordre d'exécution obligatoire** (piège mesuré, mémoire projet
`odoo-contract-version-bump-propagation`) :
`build` → `figma:plan` → `emitters:check` / `catalog` → `golden:update`.
`npm run build` **ne régénère pas** `figma-sync/*.js` ; figer l'or après le seul
`build` produit un `figma-sync/NN-button.js` périmé qui passe `emitters:check`
et se fait attraper par l'eval `golden-generated-output`.

**Re-pins attendus** : `evals/golden.json`,
`figma-sync/plugin/engine.receipt.json`, `inputs.lock.json`,
`examples/polaris/figma/*.figma.js` si un émetteur bougeait (il ne bouge pas ici).

**Piège de rédaction** : une `$description` de contrat ne doit pas contenir
`{x.y.z}` — l'invariant « zéro accolade non résolue » d'`emitters:check` scanne
l'inline émis et lève un faux positif. Écrire « jeton color.etat.default.fond-survol »
sans accolades.

---

## D11 — Le nettoyage manuel du pied de page : une contradiction de la spec, tranchée

**Fait** : le dépôt ne contient **qu'une seule** règle d'état écrite à la main —
`integrations/odoo/addons/piqueray_ds/static/src/css/odoo-bridge.css:334-340`, le
survol des quatre icônes sociales du pied de page (`color` + `opacity`).

FR-011 et SC-004 exigent « zéro règle d'état écrite à la main dans le dépôt » ;
la section **Hors périmètre** de la même spec renvoie « le nettoyage du survol
manuel du pied de page » à la vague suivante. Les deux ne peuvent pas être vrais.

**Décision** : FR-011 et SC-004 se lisent **dans le périmètre du Bouton**, et le
survol du pied de page reste, nommé, avec sa raison technique :

- il porte `opacity`, qui **n'est pas** un canal d'état de part
  (`PART_STATE_CHANNELS` = `color`, `background-color`, `border-color`,
  `emit-react.ts:92`) ;
- le gouverner demanderait donc d'élargir ce registre — une modification
  d'émetteur, hors du périmètre « `ds.button` seul » annoncé en tête de spec.

Le rapport de clôture porte cette exception en toutes lettres, et le report part
au registre. C'est la lecture qui respecte la phrase la plus précise de la spec
(le périmètre) sans faire semblant que la règle a disparu.

---

## D12 — Ce que l'axe State fait aux 354 instances, et ce qu'il ne fait pas

**Relevé** (`core/emit-figma-script.ts:5180-5215`) : un set qui gagne l'axe State
est réconcilié **par renommage**. Une variante existante dont le nom correspond au
nom attendu **moins** le segment `, State=Default` **est** cette variante — elle
est renommée sur place, son identifiant de nœud est préservé. Le commentaire du
code date le contre-exemple : « 2026-07-08 : la correspondance par nom seul a
fabriqué 12 doublons et laissé 12 originaux orphelins hors axe. »

**Volume attendu** : 7 variantes de base → 7 renommées `…, State=Default` + **21
cases neuves** (7 styles × 3 états). Le set passe de 7 à **28** variantes.

**Note d'écart avec la spec** : la spec annonce « 7 cases de base plus 14 cases
d'état » — ce chiffre vient de la sonde locale, qui n'avait déclaré que deux états.
Avec `focus-visible`, la bague étant dessinable (la paire
`outline-color` + `outline-width` est complète, condition de
`translateStateOverrides`, `emit-figma-script.ts:1730`), le compte est **21**.

**Le jumeau préexistant** (cas limite de la spec) : le code ne supprime un jumeau
que lorsqu'il l'a **lui-même fabriqué dans le même amendement**
(`emit-figma-script.ts:5205`, « le jumeau est le nôtre et sans instance »). Un
jumeau **antérieur** n'entre pas dans cette branche. Le plan pose quand même une
sonde de comptage avant/après (§X) : le fait est relevé, pas supposé.

---

## D13 — Ce que la parité verra, et pourquoi le canevas doit être écrit

**Fait** (`parity/diff.ts:765`) : un jeton présent dans `tokens/` sans variable
Figma est classé `figma-tokens | behind`. Les **42 nouvelles feuilles** (7
primitives + 35 alias) produiraient donc 42 constats rouges si le canevas n'était
pas écrit.

**Décision** : écrire le canevas — `01-tokens.js` puis le script du Bouton — et
**ne pas acquitter dans `parity/baseline.json`**. La ligne de base est
aujourd'hui à 40 entrées ; la vague doit la laisser à 40, pas à 82. C'est
exactement la dette que 015 avait laissée (7 → 89) et que 016 a dû rembourser.

---

## D14 — Ce qui prouve que le repos n'a pas bougé (SC-006)

**Décision** : `npm run images:compare` (`extract/image-parity/cli.ts`), comparaison
**stricte** — dimensions identiques, aucun redimensionnement, aucun alignement.
Rendu des 7 styles au repos par `emit-html` dans Chromium, avant la vague et
après, PNG contre PNG, écart attendu **0,0000 %**.

C'est l'instrument que la vague 018 a déjà employé pour prouver `0.0000 %` sur
`ds.button`, et il ne demande aucun code neuf.

**Complément gratuit** : `evals/golden.json` prouve par ailleurs que les
déclarations de repos de `Button.module.css` sont inchangées — un diff de l'or
montre uniquement des règles **ajoutées**. La preuve pixel reste celle que SC-006
demande ; l'or est le contrôle croisé.

---

## D15 — Les glyphes qui ne suivront pas la couleur d'état

**Relevé** : 18 des 24 SVG gouvernés portent `fill="currentColor"`. Six ne le
portent pas : `check`, `google`, `google-wordmark`, `octicon-chevron-down12`,
`star`, `star-empty`.

**Fait** : les glyphes réellement portés par des boutons aujourd'hui —
`chevron-left`, `chevron-right`, `arrow-left`, `arrow-right`, `download`, `pdf` —
sont **tous** en `currentColor`. Le recolorage de l'icône au survol du style
`Icône seule` fonctionne donc sur l'usage réel.

**Limite nommée** : poser `star` ou `octicon-chevron-down12` dans un bouton
donnerait un glyphe qui ne change pas d'état. Écrit, non corrigé — hors périmètre.

---

## Récapitulatif des NEEDS CLARIFICATION

| Question ouverte à l'entrée du plan | État |
|---|---|
| Lecture de FR-019 face à la palette validée | **Résolue** — arbitrage owner 2026-09-04 (D3) |
| Couleur de survol / pressé du style `Link` | **Résolue** — arbitrage owner 2026-09-04 (D6) |
| Mécanisme de la bague de focus | **Résolue** — arbitrage owner 2026-09-04 (D4) |
| Survol collant sur écran tactile | **Résolue** — défaut raisonnable, accepté et nommé (D7) |
| Contradiction FR-011/SC-004 vs Hors périmètre | **Résolue** — lecture bornée au Bouton, exception écrite (D11) |
| Compte de cases d'état sur le canevas | **Résolu** — 21, pas 14 (D12) |

Aucun `NEEDS CLARIFICATION` ne subsiste.
