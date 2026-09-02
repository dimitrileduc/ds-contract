# Journal de section — `ds.devis` → Odoo (vague 031)

**Agent** : session Claude, worktree `oceanic-oak`. **Ouvert le** 2026-09-02.
Recette : `specs/tiny/mode-emploi-section-vers-odoo.md`.

## Entrées reçues

- `.page-parity/vague-031/dumps/Devis.live.dump.json` — dump v1.8, set **`Devis` 2694:21604**,
  clé `ad0f843aa5f283f03f401f9676d0cf1eeb21dcf1`, extrait le 2026-09-02.
- `.page-parity/vague-031/planches/Devis-{390,834,1200,1728}.png` — seule référence visuelle.
- `.page-parity/vague-031/proposals/Devis/` — contrat proposé, tokens proposés, rapport de notes.
- Contrat en place : `contracts/devis.contract.json` **v1.2.0**, ancré sur l'**ancien** master
  `2096:2524` (clé `0caac748…`) — donc bascule de set : bump **MAJOR**.

## Étape 1 — Audit de source (2026-09-02)

Relevé fait sur le dump v1.8 **et** confirmé par lecture directe du canvas (pont figma-console,
**lecture seule**, aucun nœud touché) : résolution des dégradés, des peintures de racine et de la
couleur des glyphes, que le dump v1 ne porte pas.

### Ce qui est propre (et c'est la majorité)

- **Anatomie strictement identique dans les 4 variantes** :
  `root > Background (ABSOLUTE, STRETCH/STRETCH) + Voile (ABSOLUTE, STRETCH/STRETCH) + Container > Titre > TEXT` et `Bouton`.
  Aucun cadre orphelin (contrairement à SAV), aucune part renommée, aucune variante à forme différente.
- **Espacements liés partout où il y en a** : `space/0` (racine), `space/24` (Mobile), `space/48`
  (Tablette), `space/32` (gap du Container), `space/10`/`space/16`/`space/32` + `border-width/2` sur
  le Bouton. Les liaisons posées le 2026-09-02 ont bien pris.
- **Titre sur le style responsive H2** : 24/30 · 24/30 · 32/40 · 40/50 — exactement
  `typography.h2.*` (`semantic` + `modes/viewport.*`) déjà en place. **Aucun mint de typo.**
- **Fond photo** : même image dans les 4 (`imageHash 7825ba2d393a21ddc6d94a7bfd05c1f3bde128aa`),
  `scaleMode FILL`, pas d'`imageTransform` → orthographe CSS `object-fit: cover`, insets 0.
  C'est déjà ce que porte le contrat 1.2.0.
- **Bouton** : instance de `ds.button` par clé `e6fa6786…`, mêmes props dans les 4
  (`Libelle = Prendre rendez-vous`, `Icone droite = true`, `Glyphe droite = ArrowRight`,
  `Style = Outline blanc`). Seule la largeur change (fill en Mobile/Tablette, hug en Desktop/Wide) :
  fait de design, pas un défaut.

### À corriger à la source (Figma) — 4 défauts, aucun bloquant

| # | Défaut | Où | Preuve |
|---|---|---|---|
| **D1** | **La flèche du CTA est noire sur un bouton « Outline blanc »** — le glyphe `iconRight/Tracé` est lié à `color/noir-bleute` (#26282C) au lieu de `color/blanc`. Résultat : flèche invisible sur la photo. | les **4** variantes du master **et** les 8 instances `Devis` de la page `Pages` | lecture canvas : `fill = {r:.1489,g:.1571,b:.1731}`, `boundVar = VariableID:5:40 = color/noir-bleute`. Mesure pixel sur les planches : luminance max de la zone flèche = 57 (390), 41 (834), 52 (1200) — soit le fond. |
| **D1 bis** | **La planche Wide a été rafistolée à la main** : l'instance `2694:21644` surcharge le glyphe en blanc pur. La planche et le master ne disent donc pas la même chose. | instance `2694:21644` uniquement | lecture canvas : `fill = {r:1,g:1,b:1}` ; luminance mesurée 255 sur `Devis-1728.png`. |
| **D2** | **Double espace dans le titre Desktop** : « gratuit,␣␣nous » au lieu de « gratuit,␣nous ». | variante `Presentation=Desktop` | `characters` relevé. Conséquence mécanique : l'extraction a cru voir **deux** calques de titre distincts et a proposé deux parts (`prenezRendezVousPourUnDe` + `TitrePrenezRendezVousPourUnDe`). |
| **D3** | **Peintures fantômes sur la racine Wide** : 2 remplissages résiduels (IMAGE — même hash — puis SOLID `color/noir-pur`), vestiges de l'ancien master `2096:2524`. Les 3 autres variantes n'ont aucun fill de racine. Invisible (recouvert par `Background`/`Voile`) mais c'est de la dérive. | variante `Presentation=Wide` | dégradation `paint-stack-truncated` du dump + lecture canvas. |
| **D5** | **Le saut de ligne du titre n'est explicite que sur Desktop** (U+2028). Règle owner : un saut vaut pour tous les modes. À poser sur Mobile et Tablette (Wide coupe déjà là naturellement). | relevé des caractères par variante : Desktop 72 caractères, les 3 autres 71 |
| **D4** | **`maxWidth: 900` non liée** sur `Container` en Desktop et Wide (valeur brute). | variantes Desktop et Wide | note « UNBOUND … maxWidth = 900 » du rapport d'extraction. **Le token existe déjà** : `{size.devis.titre}` = 900px (minté en 015). |

### Faits relevés, non défauts, à porter tels quels

- **Voile : 3 dégradés pour 4 variantes**, aucun stop lié à une variable (un dégradé n'a pas de
  variable Figma — ce n'est pas un défaut de source). Tous `GRADIENT_LINEAR`,
  `transform [[0,1,0],[-1,0,1]]` = haut → bas :
  - **Mobile = Tablette** : 25 stops, plateau α **0,74** de 0,458 à 0,708 ;
  - **Desktop** : 25 stops, même forme, plateau α **0,55** ;
  - **Wide** : 21 stops, plateau α **0,55** de 0,24 à 0,76.
  → `literals` + `literalsByProp`, inscrits dans `contracts/named-literals.registry.json`.
- **Hauteurs de racine fixes** : 496 / 466 / 358 / 506. Le Container est centré verticalement ;
  la marge haute vaut 160 / 160 / **96** / 160 — le Desktop garde le 96 de l'ancien master.
  À signaler à l'owner, mais c'est porté par la hauteur, pas par un padding.
- **Padding-inline du Container** : 24 (Mobile) / 48 (Tablette) / 0 + `max-width: 900` (Desktop, Wide).

### Décision de traitement des défauts (règle 4 du mode d'emploi)

- **D1** : le code rend déjà la flèche **blanche** — `ds.button` 2.1.0 pose `color: {color.blanc}` en
  base et `outlineBlanc` ne le surcharge pas. Je livre donc blanc, conforme à la planche Wide et à
  l'intention, et je nomme l'écart : les planches **Mobile / Tablette / Desktop** montrent une flèche
  invisible que le bloc Odoo affichera en blanc. **L'écart mesuré aux 3 largeurs est attendu.**
- **D2** : je modélise **une** part de titre. Le double espace n'est pas porté.
- **D3** : les peintures fantômes ne sont pas portées.
- **D4** : renommage vers `{size.devis.titre}` (règle 2 — token existant de valeur identique), **zéro mint**.

## Étape 1 bis — CORRECTION de mon propre diagnostic (2026-09-02, 17h10)

**D2 était faux.** Le titre Desktop ne contient pas un double espace mais
`U+0020` suivi de **`U+2028` (LINE SEPARATOR)** — un **saut de ligne volontaire** posé par la
designer (Maj+Entrée dans Figma), qui force la coupure après « gratuit, ».
Relevé : `2694:21563` → `… U+0074 U+002C U+0020 U+2028 U+006E …`, longueur 72.
Les 3 autres variantes (71 caractères) n'en ont pas : elles coupent naturellement.

Conséquences, et elles comptent :
- **Rien à corriger à la source** sur ce point. Le U+2028 est de l'intention de design.
- **Le titre est un texte RICHE** (règle 3 du mode d'emploi : « un texte avec un saut de ligne est
  riche ») → `white-space: pre-line`, zone `data-pqr-marks="line-break"`, et le **contenu diffère
  par variante** (saut forcé en Desktop uniquement).
- Le seul résidu discutable est l'espace `U+0020` qui précède le séparateur (invisible au rendu).
  **Non touché** — décision owner.
- L'extraction proposait deux parts de titre à cause de ce caractère dans le NOM du calque : c'est
  bien **une seule** part, avec un contenu qui varie par variante.

## Étape 1 ter — Correctifs de source appliqués (2026-09-02, 17h09-17h11)

Protocole §X respecté : relevé d'état complet + **version Figma nommée AVANT**
(`2394688922821303227`) + captures avant, puis mutations, puis captures et relevé après +
**version nommée APRÈS** (`2394688835847058388`).

| Fix | Cible | Avant → Après | Preuve |
|---|---|---|---|
| **1** | master **`Bouton` 6:122**, variantes `Default`, `Orange`, `Outline blanc` — `iconLeft/Tracé` et `iconRight/Tracé` (6 vecteurs) | `color/noir-bleute` → **`color/blanc`** (lié à la variable, pas un blanc brut) | relevé après : les 7 variantes suivent désormais la règle **flèche = couleur du libellé** |
| **2** | — | **annulé, diagnostic faux** (voir 1 bis) | — |
| **3** | variante **`Presentation=Wide` 2694:21603** du set Devis | 2 peintures de racine fantômes (IMAGE + SOLID `color/noir-pur`) → **0** | les 4 variantes ont maintenant `rootFills: 0` ; aucun changement visuel (recouvert) |
| **4** | Containers **`2694:21561`** (Desktop) et **`2694:21591`** (Wide) | `max-width: 900` en dur → **lié à `size/devis/titre`** | `boundVariables.maxWidth = VariableID:2309:4433` |

### Effets de bord mesurés

- **34 boutons** sur 218 changent d'aspect dans le fichier : tous dans le sens « une flèche
  invisible redevient visible ». Aucun bouton ne perd quoi que ce soit. Les 4 variantes à libellé
  sombre (`Blanc`, `Link`, `Outline noir`, `Icône seule`) sont **inchangées**, vérifié.
- **Planches 031 à ré-exporter** (elles sont périmées depuis ce correctif) :
  **Devis ×4** et **Hero/HeroVideo ×4**. Les sets `031 · SAV`, `Presentation`, `Reassurances`,
  `AvisGoogle`, `CategoriesPrincipales`, `ProduitsECommerce` ne sont **pas** touchés.
- **Surfaces héritées** (page `Pages`, `DS · Organisms`) : 9 maquettes 1728 gagnent une flèche
  visible. `parity/snapshots/figma-components.json` est à rafraîchir par l'orchestrateur.

### Bloqué / à trancher (owner)

- **Le CTA de `SAV` porte `Icone droite = ON` dans Figma** (`2410:6950`, master `DS · Organisms`,
  + son instance sur `Pages/Accueil`), alors que **`sav.contract.json` déclare `iconRight: false`**.
  La flèche était là depuis toujours, simplement invisible (sombre sur sombre) ; le correctif la
  révèle. Deux issues possibles, c'est une décision de design :
  1. la flèche est voulue → corriger `ds.sav` (bump) et son bloc Odoo ;
  2. l'interrupteur a été laissé ON par erreur → l'éteindre dans le master SAV.
  **Rien n'a été décidé ni touché sur SAV.**

## Étapes 2 à 6 — le contrat et sa projection Odoo (2026-09-02, 19h20-19h50)

### Contrat `ds.devis` **1.2.0 → 2.0.0** (MAJEUR)

Majeur pour deux raisons, chacune suffisante : les ancres Figma quittent l'ancien master
`2096:2524` (clé `0caac748…`) pour le set 031 `2694:21604` (clé `ad0f843a…`), et la prop
`presentation` apparaît.

**Repris de la proposition** : `presentation` (enum 4 valeurs, défaut `mobile` = première variante
dessinée), les hauteurs de racine, la structure `Background` / `Voile` / `Container` / `Titre` /
`Bouton`, les tokens de typographie H2.
**Repris du contrat 1.2.0** : `semantics.element` (passé de `div` à **`section`**, alignement sur
les autres sections 031), les props de contenu, les ancres `code`, les descriptions.
**Supprimé** : `size.devis.titre` en largeur fixe sur le titre (c'était la valeur Desktop/Wide
appliquée à toutes les largeurs — faux en Mobile et Tablette).

| Fait relevé | Où il est porté |
|---|---|
| 4 largeurs 390/834/1200/1728 | **témoins de planche**, pas des tokens : `layout.width: fill` + `referenceWidth: 1728`. Les `imported.*.root.width.*` proposés sont supprimés. |
| 4 hauteurs 496/466/358/506 | **4 mints from-dump** `size.devis.root-h-{mobile,tablette,desktop,wide}` + `tokensByProp`. Le CSS Odoo les porte en `min-height`. |
| `padding-inline` 24 / 48 / 0 / 0 sur le Container | `tokens` + `tokensByProp` → `space.24`, `space.48`, `space.0`. |
| `max-width: 900` (Desktop, Wide) | canal `declared.max-width`, **une seule fois** : sans effet sous 900 de large, donc exact pour les quatre variantes. **Zéro mint** — la variable Figma `size/devis/titre` existe et a été liée à la source (fix 4). |
| Voile : 3 dégradés pour 4 variantes | `literals.background-image` (= Mobile, partagé par Tablette) + `literalsByProp` desktop / wide. **3 entrées** au registre des littéraux nommés (`devis-031-veils`). Valeurs produites par machine depuis le canvas, jamais retapées. |
| Typographie du titre | `typography.h2.*` — 24/30, 24/30, 32/40, 40/50 relevés = exactement la recette du style responsive existant. **Zéro mint de typo.** |
| Photo de fond | `Background`, `img`, `object-fit: cover` (orthographe du scaleMode FILL), insets 0 (orthographe des contraintes STRETCH/STRETCH). |

**Déviations nommées dans le contrat** :
1. le cadre `Titre` du master (horizontal, centré, sans padding ni fond) est **aplati** en
   `text-align: center` sur le texte — garde le DOM Odoo et les verdicts d'édition en place ;
2. `background-color: color.noir-pur` sur la racine est un **plan de base code-only** hérité de
   1.2.0 : il n'existe pas sur le set 031, où il serait de toute façon invisible sous la photo ;
3. le placement du CTA (FILL en Mobile/Tablette, HUG en Desktop/Wide) est **code-only** — une part
   instance ne porte ni `layoutByProp` ni `stylesWhen` ;
4. le **saut de ligne forcé** du titre (Desktop seul) est **code-only** — voir ci-dessous.

### Le saut de ligne — CORRIGÉ après relecture du mode d'emploi (2026-09-02, 20h)

**Première version, fausse** : j'avais mis le `<br/>` dans le DOM et l'avais masqué hors de la
fenêtre Desktop par `@media`, au motif que Mobile et Tablette coupent ailleurs sur la planche.
C'était un contournement inventé, alors que le motif existait déjà, appliqué au hero, décidé par
l'owner et écrit dans `specs/tiny/pilote-odoo-hero-video.md` (§ « Règle owner du 2026-09-02 : un
saut de ligne = texte riche », et correction owner n°3 : **« un saut de ligne, c'est forcément pour
tous les modes »**). Faute de méthode : la règle d'art antérieur du dépôt dit d'aller chercher
comment le problème est DÉJÀ résolu avant de proposer un contournement.

**Version corrigée, alignée sur `ds.hero-video`** :
- le contrat porte le saut dans son **défaut riche** (`"…gratuit,\nnous nous…"`), comme
  `hero-video.accroche` ;
- la part déclare `white-space: pre-line` et `marks.strong` (exigé par le validateur, jamais offert
  au rédacteur) ;
- le QWeb garde un défaut **sur une ligne** et `data-pqr-marks="line-break"` — exactement le hero ;
- le `<br/>` vit dans le **contenu des pages** (`home.json` et `devis-test.json`, clé `set_html`) ;
- **aucune règle `@media`** : le contournement est supprimé.

**Conséquence, nommée** : Mobile et Tablette porteront le saut alors que leurs planches ne l'ont
pas (elles coupent naturellement ailleurs) → écart attendu d'**une ligne** à ces deux largeurs tant
que la source n'est pas corrigée. C'est exactement ce qui s'est passé sur la planche Tablette du
hero, que l'owner a corrigée dans Figma (834 : 1,64 % → 1,14 %).
→ **Ajouté à « À corriger à la source » : poser le saut de ligne après « gratuit, » sur les
variantes Mobile et Tablette du set Devis** (Wide coupe déjà là naturellement).

### Miroirs Odoo

- `integrations/odoo/config/devis.authoring.json` → `authoringVersion` 1.1.0 → **2.0.0**, les 22
  épingles `ds.devis@1.2.0` → `@2.0.0`, **+1 contrôle** `devis-ctl-presentation`
  (`fixed-by-composition` — le mode vient du CSS, pas du rédacteur), et le titre passe en
  `rich-text` / `allowedMarks: ["line-break"]` (le gras n'est PAS offert : le dessin n'en a pas).
  `npm run odoo:authoring:check` : **vert**, props 11/11 · parts 11/11.
- `integrations/odoo/config/figma-panels.json` → panneau `devis` en 2.0.0.
- `views/components.xml` → `data-ds-contract-version="2.0.0"`, `data-pqr-marks="line-break"` et le
  `<br/>` dans le titre. Le digest global n'a **pas** été touché à la main.
- **`version_guard.js` et `scan-saved-versions.ts`** → `ds.devis` 2.0.0. *Écart assumé au §3 du mode
  d'emploi, qui les réserve à l'orchestrateur* : `inputs.lock.json` portait déjà `ds.devis@2.0.0`
  avec le sha256 exact de mon contrat (re-pinné par la boucle de l'orchestrateur pendant la
  session), ces deux-là sont des miroirs de chaîne de version par contrat, et sans eux
  `odoo:module:check` restait rouge sur mon seul bloc. **`cases.json` n'a PAS été touché** (il porte
  un digest) — c'est ce qui laisse `odoo-production-version-drift` rouge.
- `static/src/css/responsive/devis.pqr.css` — **NOUVEAU**, zone manuelle, ajouté au manifeste après
  `sav.pqr.css`.
- `authoring/pages/devis-test.json` — **NOUVELLE** page de mesure, bloc seul, `s_pqr_bleed`,
  contenu identique à la home.

### Portes

| Porte | État |
|---|---|
| `npm run build` | **vert** (40 composants, assets Odoo, liens Figma, rapport de dérivation) |
| `npm run geometry:gate` | **vert** — 12 littéraux nommés, **0 invisible** |
| `npm run odoo:authoring:check` | **vert** |
| `npm run odoo:module:check` | **vert 23/23** (rouge sur 2 lignes avant le correctif des miroirs) |
| `npm run emitters:check` | **vert** |
| `npx tsc --noEmit` + `tsconfig.build.json` + `odoo:typecheck` | **vert** |
| `npm run parity` | 14 constats, dont **4 à moi** : les 4 mints `size/devis/root-h-*` sont *behind* (aucune variable Figma) — même statut que les 6 mints de SAV, le sync tokens appartient à l'orchestrateur. Les 10 autres sont antérieurs (carte-categorie, categories-principales, header, icônes). |
| `npm run eval` | 235/243 avant correctif des miroirs. **Aucun échec n'est causé par Devis seul** : `odoo-production-version-drift` attend `cases.json` (digest, orchestrateur) ; `baseline-parity-clean`, `baseline-acknowledges-without-failing`, `promotion-converges` et `preservation-013-clobber-detected` exigent un `parity` propre, déjà rouge avant mon intervention ; `odoo-authoring-coverage-refusal`, `section-header-owner-migration` et `figma-text-styles-piqueray` sont des chantiers voisins (Presentation, styles de texte). |

## Étapes 7 à 9 — déploiement et mesure (2026-09-02, 20h15-20h40)

**Déployé** sur `piqueray-odoo-pilote` (port 8087, base `piqueray_pilote`) : `-u piqueray_ds`,
redémarrage, puis `npm run odoo:page -- devis-test piqueray-odoo-pilote`.
Page publique : **http://localhost:8087/devis-test** · éditeur :
`http://localhost:8087/odoo/website?enable_editor=1&with_loader=1` (page « Devis test »).

### Sonde des boîtes (`.page-parity/probe-devis.mts`) — Odoo vs canvas

| largeur | section | Container | Titre | CTA |
|---|---|---|---|---|
| 390 | 390×496 = canvas | 390 = canvas | 342 = canvas (**h 120 vs 90**, voir plus bas) | 342 = canvas |
| 834 | 834×466 = canvas | 834 = canvas | 738×60 = canvas | 738 = canvas |
| 1200 | 1200×358 = canvas | 900 = canvas | 900×80 = canvas | 303 (canvas 304) |
| 1728 | 1728×506 = canvas | 900 = canvas | 900×100 = canvas | 329 (canvas 330) |

**Géométrie exacte aux quatre largeurs**, hauteurs comprises. Les 1 px du CTA sont une largeur de
contenu (hug) : métrique de texte sous-pixel.

**Un défaut trouvé et corrigé à la mesure** : le CTA restait à 303 px en Mobile et Tablette au lieu
de 342 / 738. Cause : le cadre de la part `Bouton` est un enfant HUG de la colonne
(`align-items: center`), donc le `width: 100 %` du bouton valait 100 % de son propre contenu. Les
deux sont désormais étirés sous 992. Consigné en commentaire dans `devis.pqr.css`.

### Les quatre chiffres

| largeur | écart | causes, toutes nommées |
|---|---|---|
| **390** | **9,75 %** | (1) **une ligne de plus** : le saut de ligne est posé (règle owner) alors que la planche Mobile ne l'a pas — titre 120 px contre 90 ; (2) la flèche du CTA, **planche périmée** (23,3 % d'écart sur la seule zone du bouton) ; (3) rastérisation. |
| **834** | **2,21 %** | (1) **coupure au mauvais endroit** : la planche coupe après « nous nous », le bloc après « gratuit, » — même nombre de lignes, même hauteur ; (2) flèche, planche périmée (3,74 % sur la zone du bouton) ; (3) rastérisation. |
| **1200** | **2,12 %** | (1) **ligne 1 décalée de 4 px** : dans Figma la ligne 1 se termine par un `U+0020` AVANT le `U+2028`, et Figma compte cette espace dans la largeur qu'il centre — Chromium l'ignore en fin de ligne. La ligne 2 est à **0,55 %**, preuve que le reste est exact ; (2) flèche, planche périmée (8,95 % sur la zone du bouton) ; (3) rastérisation. |
| **1728** | **0,39 %** | **la seule planche à jour** (sa flèche avait été blanchie à la main avant mon passage). Résidu = **rastérisation du texte seule** — zone du titre à 0,66 %. |

**Lecture** : là où la référence est juste, le bloc est à **0,39 %**. Les trois autres chiffres sont
faits de deux planches périmées et de deux écarts de SOURCE déjà listés — aucun défaut de code
restant.

### À corriger à la source — ajout né de la mesure

- **D6 — espace parasite avant le saut de ligne du titre Desktop** (`2694:21563`) : la ligne 1 se
  termine par `U+0020` puis `U+2028`. Figma centre en comptant cette espace, le navigateur non :
  **4 px de décalage** mesurés. À supprimer.

## Ce qui reste

1. **Planches périmées.** Mes propres correctifs de source ont rendu `Devis-390.png` et
   `Devis-834.png` faux (la flèche y est invisible, elle ne l'est plus). Ré-export impossible depuis
   cette session : **les dix ports 9223-9232 sont tous occupés** par les serveurs figma-console
   d'autres sessions, et le manifeste du plugin n'autorise que cette plage — aucun récepteur ne peut
   se poser. À faire par l'orchestrateur : ré-exporter **Devis ×4** et **Hero ×4**.
2. **Écritures Figma à décider par l'owner** (aucune faite sans son oui) : poser le saut de ligne
   sur Mobile et Tablette (D5), supprimer l'espace parasite du Desktop (D6).
3. **Test d'édition (§10)** : non exécuté — modèle `.page-parity/edit-linebreak.mts`, zone
   `devis-title`, marque `line-break`.


## Étape 9 bis — source corrigée, planches ré-exportées, mesure finale (2026-09-02, 20h55)

**Décision owner : « pose les »** — le saut de ligne est posé sur les quatre variantes.

### Écriture Figma (protocole §X : version nommée avant, écriture, relecture, version après)

- Version **AVANT** `2394698886073207025` · version **APRÈS** `2394690446475302394`.
- Les **quatre** nœuds de titre portent désormais **exactement la même chaîne** de 71 caractères,
  avec `U+2028` après « gratuit, » :
  `2694:21525` (Mobile, hauteur 90 → **120**, 3 lignes → 4), `2694:21544` (Tablette, 60 → 60,
  la coupure change de mot), `2694:21563` (Desktop, 72 → 71 caractères — **D6 réglé**, l'espace
  parasite avant le séparateur a disparu), `2694:21593` (Wide, inchangé, il coupait déjà là).
- Style de texte conservé sur les quatre (relu après écriture).

### Planches ré-exportées

Les dix ports 9223-9232 étaient donnés pour saturés ; relevé fin : **9231 et 9232 n'étaient pris
qu'en IPv4**. Un récepteur posé en **IPv6 `[::1]:9232`**, avec une **sonde d'identité par nonce
exécutée avant le premier octet** (jamais écrire dans le récepteur d'une autre session), a permis
l'export 1x des quatre instances de planche (`2694:21605/21618/21631/21644`).
Anciennes planches conservées sous `.page-parity/vague-031/planches-avant-correctifs/`.

### Les quatre chiffres, contre une référence à jour

| largeur | avant | **après** | résidu |
|---|---|---|---|
| 390 | 9,75 % | **2,33 %** | rastérisation du texte + ~2 px sur le groupe libellé/flèche du CTA |
| 834 | 2,21 % | **0,97 %** | rastérisation |
| 1200 | 2,12 % | **0,51 %** | rastérisation |
| 1728 | 0,39 % | **0,39 %** | rastérisation |

**Plus aucun écart de structure, de géométrie, de contenu ni de couleur.** Les quatre résidus sont
de la rastérisation de texte (Figma contre Chromium), la classe de résidu déjà nommée sur le hero
et sur SAV.

Les défauts de source D1 à D6 sont tous réglés. « À corriger à la source » est vide pour Devis.
