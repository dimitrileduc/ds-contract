---
name: "odoo-component-production"
description: "Porter une section gouvernée du design system Piqueray dans l'addon Odoo 19 de production : snapshot, décisions d'authoring, spike de mécanisme, QWeb, preuves, delta mesuré."
compatibility: "Requiert integrations/odoo/ (spec 019) et une instance Odoo jetable épinglée"
metadata:
  author: "spec 019 — odoo-production-foundation"
  status: "éprouvé sur GoogleReviews et Presentation, corrigé après usage réel (T067)"
---

# Produire une section Odoo gouvernée

Ce guide impose un **ordre**. Il n'est pas une liste de bonnes intentions : chacune de ses étapes
existe parce que l'inverser a déjà coûté quelque chose, dans 018 ou ailleurs dans ce dépôt.

> **Statut honnête de ce document.** Le workflow a été exercé sur GoogleReviews puis Presentation.
> Les corrections de T067 ci-dessous viennent des écarts réellement rencontrés ; toute nouvelle
> catégorie manquante doit encore être ajoutée ici, jamais improvisée en silence.

## L'ordre, et pourquoi il n'est pas négociable

```text
1. snapshot   →  2. décisions  →  3. spike mécanisme  →  4. QWeb + authoring
                                        ↓ (si le mécanisme ne tient pas)
                                   nommer la limite AVANT tout claim
                                                            ↓
                              5. preuves  →  6. delta mesuré
```

### 1. Snapshot — figer ce qu'on lit avant de lire

```bash
npm run odoo:inputs:check
```

Vert obligatoire **avant** d'ouvrir un contrat. Une dérive signifie qu'une entrée a bougé (la spec
020 travaille en parallèle sur les mêmes contrats) : décider, repinner, et **rejouer les reçus
affectés**. Un lock ne se répare jamais tout seul.

### 2. Décisions — un verdict explicite par occurrence

Écrire `integrations/odoo/config/<section>.authoring.json` **avec l'owner**. Trois règles :

- **Aucun verdict par défaut.** Une prop sans décision n'est pas « non éditable » : c'est un trou.
- **L'adresse est le chemin de composants complet, jamais un nom.** `ds.button` apparaît deux fois
  sous `ds.presentation` — directement, et à travers `ds.section-header`. Ce sont deux boutons
  gouvernables séparément. Une table indexée par nom les confondrait.
- **Tout sélecteur est préfixé par la racine du snippet.** Sans préfixe, deux instances de la même
  section sur une page partagent leurs contrôles.

```bash
npm run odoo:authoring:check
```

La porte nomme chaque défaut par sa classe : manquant, surnuméraire, doublon, ambigu, incohérent.

### 3. Spike de mécanisme — AVANT le polish, jamais après

C'est l'étape que l'on saute quand on est pressé, et c'est celle qui décide.

Monter la version minimale qui exerce **le mécanisme risqué** sur une vraie instance — pas la
version jolie. Pour GoogleReviews : la collection à 0, 1, 5 et 6 éléments, le média, deux instances,
save/reopen. Pour n'importe quelle section : la fermeture sélective de l'éditabilité.

> **Le précédent qui justifie cette étape — corrigé le 2026-08-08.** Une version antérieure de ce
> guide affirmait que 018 avait mesuré « zéro levier tenu » et que
> `content_not_editable_selectors` / `content_editable_selectors` n'avaient **jamais été exercés**.
> C'était faux, et la faute est instructive : 018 a écrit son rapport à 07 h 52 sur un montage
> **à balisage seul**, puis livré sa couche de réglages à 17 h 57 **sans jamais réémettre ses
> verdicts**. 019 a cité le rapport comme s'il décrivait l'état final.
>
> Ce que 018 a réellement obtenu, avec ses reçus : un `Plugin` contribuant les deux ressources
> (`piqueray_option.js:156-168`), **7 attentes sur 7 tenues** — 3 textes ouverts, 4 conteneurs
> fermés (`gestes-us2-gouverne.json:7-17`) — et 8 familles d'options natives écartées du panneau.
>
> Ce qui reste VRAIMENT ouvert, et qui est donc le vrai sujet du spike :
> · le **verrou structurel** — l'éditeur propose toujours `Drag and move`, `Duplicate`, `Remove`
>   sur les éléments intérieurs (`gestes-us2-gouverne.json:23-29`) ;
> · `o_not_editable` ne ferme ni le texte ni les réglages natifs à lui seul ;
> · les leviers L3 et L4 ne sont toujours pas exercés.
>
> Leçon de méthode, plus large que ce guide : **un verdict daté n'est pas un fait courant.** Avant
> de bâtir sur la conclusion d'une spec, vérifier qu'aucun commit postérieur ne l'a démentie sans
> la réécrire. Voir `specs/019-odoo-production-foundation/proofs/correction-premisse-018.md` (2026-08-08).

**Si le spike échoue** : écrire la limite dans `specs/019-…/proofs/limits.json` **immédiatement**,
et interdire les claims correspondants. Une limite nommée le jour où on la découvre coûte une
ligne ; découverte trois semaines plus tard par un rédacteur, elle coûte la confiance.

### 4. QWeb et authoring — la partie mécanique

- une racine `<section>`, **jamais** de `<section>` imbriquée ;
- les dépendances par `t-call` vers des gabarits nommés, **jamais** aplaties ;
- les composants internes ne sont **pas** inscrits comme snippets ;
- chaque bloc manuel encadré par son marqueur `ODOO-019-* BEGIN/END` unique, enregistré dans
  `integrations/odoo/config/adaptation-registry.json`.

```bash
npm run odoo:module:check
npm run odoo:assets -- --check
```

### 5. Preuves — une instance propre, jamais un souvenir

Chaque scénario porte un `scenarioId` stable et produit un reçu daté sous `specs/019-…/proofs/`.
Un scénario non exécutable est `skipped` **et dit comme tel** : `skipped` n'est jamais agrégé
comme `pass`.

Refaire les preuves sur **installation propre**. Ne jamais importer un reçu de 018 comme preuve de
production : 018 est un POC, ses conclusions se contredisent partiellement, et son module n'est pas
celui-ci.

Retours de terrain obligatoires :

- une capture Odoo doit être ancrée sur le cadre du composant, pas à `(0,0)` de `website.layout` ;
  sinon le header est mesuré comme s'il appartenait au contrat ;
- tout résidu visuel doit porter `cause` et `justification` dans le rapport canonique, pas seulement
  dans un reçu narratif ;
- une politique d'options se vérifie dans le **chrome visible**. Lire uniquement un attribut
  `data-pqr-root-actions` prouve la déclaration, pas l'absence réelle des commandes natives ;
- une photo n'existe que si son conteneur est visible et si `src` et `alt` sont exploitables. La
  présence d'une balise `<img>` vide après fermeture du dialogue est un faux positif ;
- l'iframe à qualifier est identifiée par son URL de banc. Le chrome Odoo contient lui aussi des
  contenteditables et peut produire un faux vert ;
- la sélection qui engage le builder exige un vrai geste Playwright. `HTMLElement.click()` ne
  traverse pas toujours la pipeline de sélection native.
- fermer les options natives de la racine ne ferme pas les conteneurs image qui ciblent directement
  `img`. Exclure explicitement `ReplaceMediaOption`, `ImageToolOption` et `ImageAndFaOption` sur les
  images de chaque racine, puis cliquer le bitmap réel et inventorier le chrome visible. Une preuve
  faite sur la carte parente ne détecte pas ce trou (constaté avec Équipe, 2026-08-11).
- un upload et la sélection d'une pièce jointe existante ne sont pas le même chemin média. Tester
  les deux avec deux images distinctes, comparer réellement les `src`, puis save/public/reopen.
  Odoo peut remettre `alt=""` lors d'une sélection existante : si l'alt vide est admis comme texte
  décoratif, il ne doit pas masquer la nouvelle source (constaté avec Équipe, 2026-08-11).
- un saut de ligne dur d'un contrat rich-text voyage en `<br/>` dans le QWeb (zone tenue sur UNE
  ligne XML — `white-space: pre-line` dessinerait aussi les retours du pretty-print), et la zone
  doit déclarer `line-break` dans `data-pqr-marks` : le guard supprime silencieusement tout `<br>`
  non déclaré au premier save — y compris celui du contenu PAR DÉFAUT, avant toute édition du
  rédacteur. Shift+Enter produit un `<br>` réel qui survit une fois la marque déclarée
  (constaté avec SAV, 2026-08-12 — reçu `sav-mechanism-spike.json`, 9/9).

- jamais deux vagues de qualification sur la même instance : `qa/run.mts` honore les
  variables de processus (`COMPOSE_PROJECT_NAME`, `PQR_ODOO_PORT`, `PQR_ODOO_GEVENT_PORT`,
  `PQR_DB_NAME`), donc chaque vague prend SA pile et SES volumes. Trois sections portées en
  parallèle visaient la même base jetable — les reçus se seraient écrasés mutuellement
  (constaté avec Devis/SAV/FAQ, 2026-08-12).
- un callback `evaluate()` Playwright ne doit contenir AUCUNE fonction nommée imbriquée :
  tsx/esbuild (keepNames) y injecte le helper `__name`, absent du contexte de page, et le
  scénario meurt d'un `ReferenceError` APRÈS le save — les constats déjà émis semblent bons
  et le reçu n'est jamais écrit (constaté avec Devis, 2026-08-12).
- le code de sortie du scénario fait foi : jamais de `| tail` (ni aucun pipe) sur la commande
  qui l'exécute — un crash sort en 0 à travers le pipe et se lit comme un vert
  (constaté avec Devis, 2026-08-12).
- un état contractuel piloté par `visibleWhen` (accordéon fermé/ouvert) exige un DOM à DEUX
  plans : le rendu de référence `emitHtml` OMET les parts invisibles, mais un HTML sauvegardé ne
  se re-rend jamais — sans le plan inactif posé sous `hidden`, la réponse d'une rangée fermée
  n'existerait nulle part, ni pour le rédacteur ni pour le visiteur. Le bridge doit porter
  `<racine> [hidden] { display: none !important; }` : les classes générées posent des `display`
  plus spécifiques que la règle UA (constaté avec FAQ, 2026-08-12 — spike 15/15, visuel 0,0173 %).
- un déclencheur en overlay absolu au-dessus d'un texte éditable intercepte le clic du rédacteur
  sur la moitié qu'il couvre. En édition il est inerte (les interactions publiques ne tournent pas
  dans l'iframe d'édition — mesuré : le clic ne bascule pas, `website/__manifest__.py` retire les
  `*.edit.js` du bundle frontend), donc la parade est un `pointer-events: none` scopé par la classe
  d'éditeur du noyau `.odoo-editor-editable` (posée par `html_editor/editor.js:144`) ; la bascule
  d'édition passe alors par le panneau, jamais par le bitmap (constaté avec FAQ, 2026-08-12).
- `keyboard.press('End')` ne déplace PAS le curseur dans un contenteditable de l'éditeur : une
  frappe réelle s'insère au point de clic, ce qui est le comportement que le rédacteur obtient.
  Asserter l'INSERTION (`includes` + longueur), jamais la position — deux reçus ont viré au rouge
  sur une assertion `endsWith` qui testait la navigation clavier au lieu du geste
  (constaté avec FAQ, 2026-08-12).
- un geste public sur une Interaction ne part qu'après une PORTE DE DISPONIBILITÉ : le module
  présent dans `odoo.loader.modules` ET la file `odoo.loader.jobs` vide (puis ~400 ms de marge).
  Cliquer dès `domcontentloaded` frappe un déclencheur SANS handler : le clic « réussit », rien ne
  bascule, zéro erreur console — le reçu lit un faux négatif pendant qu'une sonde à +3 s bascule
  parfaitement. Un `waitForTimeout` nu est un pari ; la porte sur le loader est un fait
  (constaté avec Texte SEO, 2026-08-12 — run 4 rouge, run 5 17/17).
- « `<html> intercepts pointer events` » en boucle peut vouloir dire : le point de clic est HORS
  VIEWPORT. Une rangée dont le contrat gèle la largeur (accordion-row : 1550 px) démarre à
  `bbox.x` NÉGATIF dans l'iframe d'édition (~1300 px utiles avec le panneau) — un clic à (8,8)
  ne touche RIEN (`elementsFromPoint` : pile vide). Sonder les coordonnées AVANT d'accuser un
  overlay — trois relances sur hypothèses ont coûté ce qu'une sonde de 30 lignes a tranché —
  puis viser la zone visible de la rangée (extrémité chevron, `x = largeur − 24`)
  (constaté avec Texte SEO, 2026-08-12).
- le mécanisme accordéon de l'addon est UNIQUE : `faq_toggle.js` est la machine d'état partagée
  (classes `accordion-row--etat-*`, `hidden` des deux plans, aria resynchronisé). Un nouveau
  porteur d'accordéon IMPORTE `setFaqRowState`/`isFaqRowOpen`/`toggleFaqRow` et n'en réécrit
  aucune ligne ; seuls ses marqueurs de rangée/liste et son Interaction root-scopée lui
  appartiennent. Candidat au renommage `accordion_toggle.js` à un moment calme, quand plus
  aucune vague n'a le fichier en vol (Texte SEO réutilise FAQ, 2026-08-12 — spike 17/17,
  visuel 0,0074 %).

### 5 bis. Versions — signaler sans migrer

Le template QWeb sert à l'insertion ; le HTML posé est ensuite sauvegardé dans la page. Une mise à
jour du template ne remplace donc pas les anciennes copies. Persister séparément version de contrat,
digest de graphe et version d'authoring, puis classer `current`, `policy-stale`, `structure-stale` ou
`unknown`. Seule la politique peut être réappliquée automatiquement. Une structure ancienne est
signalée ; elle n'est jamais réécrite sans migration explicite et qualifiée.

Au repin, réaligner LES DEUX classificateurs — `version_guard.js` (le vif) ET
`scripts/odoo/scan-saved-versions.ts` (l'arbitre) avec son fixture d'eval
`evals/fixtures/odoo-production/version-drift/cases.json`. L'arbitre est auto-cohérent :
resté deux repins en arrière, il demeurait vert tout en classant « structure-stale » des
blocs parfaitement courants (constaté le 2026-08-12).

### 6. Delta mesuré — laisser les chiffres parler

```bash
npm run odoo:derivation:check
```

Le rapport compte fichiers, blocs, lignes et octets manuels par `reasonCode`. Il n'existe **aucun
champ « dérivable »** : l'auteur d'un bloc ne peut pas juger objectivement si son travail était
dérivable, et un rapport écrit par l'agent serait flatteur et non reproductible. C'est ce delta,
pas une impression, qui dimensionnera le builder de la spec 025.

## Interdits

| Interdit | Pourquoi |
|---|---|
| Éditer quoi que ce soit sous `static/src/css/generated/` | réécrit au prochain build ; indistinguable d'un drift |
| Modifier un contrat, un token ou `core/` pour faire passer Odoo | la cible ne dicte pas la source de vérité |
| Ajouter un émetteur `odoo` dans `core/` | `core/` est vendor-neutral ; le générateur est le sujet de 025 |
| Dépendre de `specs/018-…/` à l'exécution | 018 fournit des mécanismes à réexaminer, pas une dépendance |
| Retaper une valeur de design dans `odoo-bridge.css` | la géométrie se porte en jetons ; un littéral ne siège sur aucun axe du différentiel |
| Annoncer qu'une mise à jour `-u` migre les blocs posés | faux : Odoo sauvegarde l'`outerHTML`, aucun helper de migration n'existe |
| Compter un `skipped` comme un succès | la dégradation se nomme, jamais ne se tait |

## Protocole d'exception

Une situation que ce guide ne couvre pas se traite ainsi, **dans cet ordre** :

1. **Lire `docs/` avant de dériver.** Une question de capacité, de limite, de « est-ce supporté,
   porté, écrasé » se répond depuis la documentation versionnée, et sa réponse fait foi sur toute
   inférence tirée du code.
2. **Chercher l'art antérieur avant de proposer un contournement.** `docs/reference/demo-archive/`,
   `git log -S`, les émetteurs existants. « Le moteur ne sait pas faire X » est une conclusion, pas
   une hypothèse de départ.
3. **Si le vocabulaire de config ou le registre manque d'un terme**, le corriger **là**, tout de
   suite, plutôt que d'ajouter un cas spécial silencieux. Un cas spécial non enregistré est
   exactement ce que le rapport de dérivation existe pour rendre impossible.
   Lors de l'ajout d'une racine posable, vérifier aussi les schémas qui énumèrent encore les
   `rootContracts` connus : le registre peut être exhaustif tout en restant impossible à valider
   si son vocabulaire est resté figé à la vague précédente (constaté avec `ds.equipe`, 2026-08-11).
4. **Écrire la découverte dans ce guide.** Ce qui n'est pas écrit ici sera redécouvert au prix fort
   par la vague suivante.

## Questions encore ouvertes

- le seuil visuel acceptable reste une décision d'owner à fixer avant la première mesure d'une
  future section ; les résidus actuels sont chiffrés et attribués, pas transformés en seuil a posteriori ;
- une migration structurelle automatisée reste hors 019 et doit posséder son propre protocole de
  sauvegarde, rollback et preuve publique.
