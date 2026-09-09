# Mode d'emploi — porter UN composant v2 (Figma → contrat → Odoo), responsive et mesuré

**Place** : ce document a vécu jusqu'au 2026-09-07 sous `specs/tiny/mode-emploi-section-vers-odoo.md`. Il n'est
plus une note de spec : c'est **LA référence** de ce type de chantier, citée comme telle dans `CLAUDE.md`.
Ce qu'un chantier apprend revient ICI — document vivant, pas archive.

**Version** : 2026-09-08 (runbook consolidé après 3 agents seuls sur la recette : AccordionRow, TexteSEO, Hero ; un
orchestrateur + owner pour la partie Figma). **Pour** : un agent d'exécution qui n'a PAS le contexte de la journée.
La PARTIE A dit quoi faire, dans l'ordre, avec la commande exacte, ce que tu dois obtenir, et quand t'arrêter.
La PARTIE B (plus bas) est l'historique daté : les leçons y sont, la PARTIE A les a déjà intégrées.

---

# PARTIE A — RUNBOOK D'EXÉCUTION (lis tout, puis exécute dans l'ordre)

## A0. Ce que tu es, ce que tu n'es pas

- Tu es **l'agent** d'UN composant (`<set>` ci-dessous = son nom Figma, ex. `TexteSEO` ; `<slug>` = son id de contrat
  sans préfixe, ex. `texte-seo` ; `<bloc>` = son snippet Odoo, ex. `s_pqr_texte_seo`). Tu livres le contrat, les miroirs
  Odoo, le CSS par écran, la page de test, la mesure, le test d'édition, le journal, le rapport.
- Tu n'es PAS l'orchestrateur. L'orchestrateur : touche Figma, prépare tes entrées, possède le digest/verrou, fusionne,
  lance `npm run eval`. Toi : **jamais** `npm run eval` (deux evals dans le même worktree se faussent), **jamais**
  `git commit` / `git checkout --` / `git stash`, **jamais** Figma, **jamais** `inputs.lock.json`, `version_guard.js`,
  `scan-saved-versions.ts`, `evals/fixtures/odoo-production/version-drift/cases.json`, `evals/golden.json`,
  `figma-sync/`, `core/`, `packages/schema`, les autres contrats. Une exception : minter un jeton primitif FROM-DUMP
  dans TON bloc de `tokens/primitives.tokens.json`, avec provenance (set, nœud, date) dans `$description`.
- Instance Odoo : **`piqueray-odoo-pilote`** (conteneur `piqueray-odoo-pilote-odoo-1`, base `piqueray_pilote`,
  port **8087**) et rien d'autre. **INTERDIT ABSOLU** : `piqueray-odoo-test` (8071, owner) et `npm run odoo:save`.
- Si tu es bloqué par quelque chose qui demande l'orchestrateur : écris-le au journal sous « Bloqué / à trancher »
  et **continue** sur le reste. Une déviation silencieuse est le défaut le plus grave de ce dépôt.
- Ce shell : `grep` peut rendre vide sur les gros fichiers → utilise `/usr/bin/grep`.

## A1. Ce que tu reçois (l'orchestrateur te donne ces chemins ; s'il en manque un, arrête-toi et demande)

| Entrée | Chemin | Ce que c'est |
|---|---|---|
| Relevé du set | `.page-parity/vague-031/dumps-*/<Set>.live.dump.json` | dump v1.8 du set candidat (clé + nodeId dedans, `_degradations` = ce que le dump ne porte pas : IMAGE, dégradés) |
| Proposition | `.page-parity/vague-031/proposals/<Set>/` | `<slug>.contract.proposed.json`, `<slug>.tokens.proposed.json`, **`figma-proposals.md` = ta liste de travail** |
| Planches | `.page-parity/vague-031/planches-*/<Set>-{390,834,1200,1728}.png` | export 1x d'INSTANCES témoins (la seule référence visuelle), contenu = défauts du set |
| Contenu des planches | dans le brief | titre, textes riches (gras entre `**`), lignes… — c'est le contenu de ta page de test, à l'identique |
| Photos | `.page-parity/vague-031/planches-*/<Set>-photo-original.png` | l'image D'ORIGINE du paint Figma (taille native), jamais un cadre exporté |
| Décisions owner | dans le brief | rôles typo (H1/H2/H4/body), jetons à utiliser, ce qui reste littéral, version cible |

## A2. Lecture obligatoire, dans cet ordre (avant d'écrire quoi que ce soit)

1. `CLAUDE.md` — règles : géométrie sur jetons (jamais un chiffre tapé à la main), déterminisme, honnêteté.
2. Ce document en entier.
3. `specs/tiny/vague-031/<slug>.md` — le journal du composant (étape 0, candidat, décisions). Tu y AJOUTES ta section.
4. Un journal modèle du même type : molécule → `specs/tiny/vague-031/accordion-row.md` ; section →
   `specs/tiny/vague-031/texte-seo.md` et `hero.md` (sections « Contrat … + Odoo (agent…) »).
5. `figma-proposals.md` en entier, puis les deux `.proposed.json`.
6. Le contrat actuel `contracts/<slug>.contract.json`, ses voisins de forme (`contracts/sav.contract.json` = section
   à 4 présentations ; `contracts/hero-video.contract.json` = voiles en `literalsByProp` ; `contracts/accordion-row.contract.json`
   = molécule sans axe présentation), `contracts/named-literals.registry.json`.
7. Côté Odoo : le bloc dans `integrations/odoo/addons/piqueray_ds/views/components.xml`, `integrations/odoo/config/<slug>.authoring.json`,
   les feuilles `static/src/css/responsive/*.pqr.css` (forme à reproduire), `__manifest__.py` (bundle),
   `integrations/odoo/authoring/README.md` et `compose_page.py` (clés `set_html`, `set_button`, `images`, `cards`, `rows`).

## A3. Les règles de modélisation (chacune a été payée)

1. **Figma est la référence, le contrat en est la traduction, Odoo la projection.** On ne tord jamais le contrat
   pour qu'il colle à Odoo ; un écart Odoo se corrige côté Odoo (CSS/QWeb) et se nomme.
2. **Chaque valeur vient de la proposition ou d'un jeton existant de valeur identique.** Un `imported.*` proposé se
   renomme vers le jeton existant (`space.24`, `typography.h2.size`, `font.weight.bold`…) ; s'il n'existe pas, mint
   from-dump avec provenance. **Les largeurs de racine proposées comme jetons (`imported.<slug>.root.width.*`,
   `.voile.width.*`, `.trigger.width`) sont des TÉMOINS, pas des jetons → supprime-les** ; la racine porte
   `layout.width: "fill"` + `referenceWidth: 1728` (ou 1550 pour une molécule posée dans la gouttière).
3. **Typographie hiérarchisée sur le DS, pas de variable custom.** Rôles responsive existants : `typography.h1.*`,
   `h2.*`, `h4.*`, `body.*` (size / line-height ; `body.weight` varie Regular→Medium à 992), `card-desc.*`,
   `overline.*`, `button.size`. L'extraction reconnaît H1/H2/H4 (styles avec marqueur) mais **pas un texte lié aux
   variables sans style** (body) : elle minte `imported.<slug>.<part>.font-size.<mode>` → tu renommes à la main vers
   `{typography.body.size}` / `{typography.body.line-height}` et une graisse (`{font.weight.regular|bold}` fixe, ou
   `{typography.body.weight}` si le brief dit que la graisse varie par écran).
4. **Texte riche** (gras ou saut de ligne) : prop `rich-text`, `content.marks.strong` porté, liaison Figma TEXT si le set
   expose la propriété, sinon `NONE`. Un texte avec saut de ligne déclare `white-space: pre-line`.
5. **Ce qu'une part instance (`component`) ne peut PAS porter** — refusé par le validateur : `layoutByProp`,
   `tokensByProp`, `literalsByProp`, `stylesWhen`, `declared`. Bouton pleine largeur sous 992, icône par mode, ordre de
   peinture : **fait code-only** dans ton CSS Odoo, nommé dans la `description` de la part ET au journal.
6. **Dégradés et voiles** : littéraux gouvernés (`background-image` / `background-color` sur une part absolue `inset 0`),
   chaque valeur inscrite dans `contracts/named-literals.registry.json` (pointeur JSON exact, provenance, date) sinon
   `npm run geometry:gate` refuse. Un fond plein sur jeton (`{color.noir-voile-55}`) n'a pas besoin du registre.
7. **Directions inversées** (`row-reverse`, `column-reverse`) : seulement dans `layoutByProp` (override), jamais en base.
   L'anatomie garde l'ordre des enfants de la variante par défaut (Mobile).
8. **Hauteurs** : `height` du contrat → `min-height` dans le CSS Odoo (Odoo force `section { height: auto !important }`
   sous 768). Un texte qui se replie n'a PAS de hauteur fixe : cadre HUG, texte `width: fill`.
9. **Version** : MAJEUR si les ancres changent de set ou si un prop disparaît ; MINEUR sinon. Ancres = `anchors.figma`
   du set candidat (`componentSetKey`, `nodeId`, `dumpedAt`), lus dans le dump (`key`, `nodeId`).
10. **Descriptions** : jamais un jeton entre accolades dans une description (écris « jeton space.3 »).
11. **Pas de valeur tapée à la main, pas de déviation silencieuse.** Chaque écart au dump est écrit dans la
    `description` de la part et au journal.

## A4. Les étapes, avec la commande, le résultat attendu, et quand s'arrêter

### Étape 1 — Classer la liste de travail
- Ouvre `figma-proposals.md`. Pour CHAQUE note, écris dans ton journal son sort : *adopté tel quel* / *renommé vers
  <jeton existant>* / *minté* / *décision (laquelle)* / *déviation nommée*.
- **Fait quand** : chaque note a une ligne. **Arrête-toi si** : une note demande une modification d'émetteur, de schéma
  ou d'un autre contrat → « Bloqué / à trancher », et continue.

### Étape 2 — Le contrat
- Pars de `<slug>.contract.proposed.json`, reprends du contrat actuel : `semantics`, les props de contenu et leurs
  bindings, les descriptions, les parts d'image (`Background`, `declared`), les ancres `code`, les `visibleWhen`,
  les `events`. Applique A3. Bump la version.
- `npm run build` → **attendu** : vert (le schéma valide par nom ; lis chaque refus, ne contourne pas).
  Puis `npm run geometry:gate` → « zero invisible literal, zero registry refusal ».
- **Arrête-toi si** : `build` rouge autrement que sur l'étape « derivation-report » (celle-là peut rester rouge à cause
  du digest, c'est attendu et à noter).

### Étape 3 — Les miroirs Odoo (tous obligatoires)
- `integrations/odoo/config/<slug>.authoring.json` : toutes les épingles `"id": "ds.<slug>", "version"` → nouvelle
  version ; un contrôle `presentation` (`fixed-by-composition`, `mechanism: none`) pour une section ; un verdict pour
  chaque prop/part nouvelle. Les autres `*.authoring.json` qui épinglent ton contrat (une molécule est épinglée par ses
  parents : `/usr/bin/grep -l '"ds.<slug>"' integrations/odoo/config/*.json`).
- `integrations/odoo/config/figma-panels.json` : la version du panneau.
- `views/components.xml` : `data-ds-contract-version` du bloc. **Ne touche PAS** `data-ds-graph-digest`.
- `npm run odoo:authoring:check` → « Toutes les configs couvrent leur graphe. » · `npm run odoo:module:check` → 23/23
  sauf la ligne du verrou (attendu). `npm run odoo:inputs:check` rouge sur ton contrat = attendu.

### Étape 4 — Le CSS Odoo par écran (seulement ce que le contrat ne peut pas dire)
- `npm run odoo:assets` puis lis ce que `static/src/css/generated/components.pqr.css` émet pour `.<slug>*` : les
  classes `.<slug>--presentation-<mode>` existent mais **aucun QWeb ne les pose** — c'est pourquoi tu écris une feuille.
- **La typographie par écran ne se recopie JAMAIS** : `tokens.pqr.css` porte déjà ses `@media` pour `--pqr-typography-*`.
  Une molécule dont seul le texte change par écran n'a **aucune** feuille responsive (cas AccordionRow).
- Sinon, crée `static/src/css/responsive/<slug>.pqr.css`, forme fixe :
  ```
  base = Mobile (déjà dans components.pqr.css)
  @media (min-width: 768px)  { … Tablette … }
  @media (min-width: 992px)  { … Desktop … }
  @media (min-width: 1600px) { … Wide … }
  ```
  Vocabulaire `var(--pqr-…)` uniquement. Chaque fait code-only commenté (pourquoi le contrat ne peut pas le dire).
  Un bloc borné `(min-width: 768px) and (max-width: 991.98px)` pour ce qui ne vit qu'en tablette. Jamais les classes
  `ptN/pbN` de l'éditeur (`!important`). Ajoute la feuille au bundle dans `__manifest__.py` après les autres
  `responsive/*.pqr.css`. Pas de `s_pqr_bleed`, pas de container : le bloc est pleine largeur, la gouttière est dans le contrat.

### Étape 5 — Le QWeb, seulement si le DOM doit changer
- Une part nouvelle (un voile, une icône présente sur certains modes) doit être **dans le DOM** (toujours rendue),
  masquée par `@media`. Ordre de peinture respecté. Un titre avec saut de ligne : `data-pqr-marks="line-break"` ; un
  texte avec gras : `data-pqr-marks="strong"` (sinon la garde de saisie déplie le gras à l'enregistrement).

### Étape 6 — La page de test
- `integrations/odoo/authoring/pages/<slug>-test.json` : `url: "/<slug>-test"`, `key: "<slug>_test"`, le bloc seul,
  `header_overlay: false` (true pour un hero). Contenu = **celui des planches**, à l'identique (gras avec `<strong>`,
  lignes par la clé `rows`, images par la clé `images` avec le nom d'asset sans extension). Modèle : `pages/sav-test.json`,
  `pages/portes-de-garage.json`.
- Image : copie la photo D'ORIGINE dans `integrations/odoo/authoring/assets/<nom>.jpg` **en JPEG à la largeur du cadre**
  (`sips -s format jpeg -s formatOptions 82 -Z 1728 <src.png> --out <nom>.jpg`) — jamais un PNG de plusieurs Mo, jamais un
  cadre déjà recadré (`object-fit: cover` le recadrerait une seconde fois : 11–13 % d'écart pur cadrage).

### Étape 7 — Déploiement (pilote uniquement)
```
docker exec piqueray-odoo-pilote-odoo-1 odoo -d piqueray_pilote --db_host=db --db_user=odoo --db_password=odoo -u piqueray_ds --stop-after-init
docker restart piqueray-odoo-pilote-odoo-1        # puis attendre que http://localhost:8087/web/login réponde 200
npm run odoo:page -- <slug>-test piqueray-odoo-pilote
```
- **Les identifiants sur `-u` sont OBLIGATOIRES** : sans eux « no password supplied », et la composition qui suit se fait
  sur l'ancien gabarit sans le dire. Attendu : `COMPOSE_OK /<slug>-test …`. Vérifie servi : `curl -s http://localhost:8087/<slug>-test | /usr/bin/grep -o 'data-ds-contract="ds.<slug>" data-ds-contract-version="[0-9.]*"'`.

### Étape 8 — La mesure (bloc contre planche, MÊME boîte)
- Capture : `.page-parity/capture-bloc.mts <baseUrl> <outDir> <selector> <url>` (viewport 390/834/1200/1728, clip =
  boîte du bloc, en-tête et autres blocs masqués ; modèles : `capture-sav.mts`, `capture-hero-image.mts`).
- Comparaison : `node .page-parity/mesure-bloc.mjs <planche.png> <odoo.png> <outDir>` par largeur → triptyque pleine
  taille + % (une différence de hauteur est rapportée, jamais masquée).
- Sonde des boîtes (modèle `.page-parity/probe-sav.mts`) : gouttières, largeur de contenu, tailles/interlignes/graisses
  du titre et des textes, hauteurs des enfants, position du CTA — contre les valeurs attendues du contrat.
- **Molécule dans un parent encore v1** (gouttière fixe 89) : viewports 520 → 342, 916 → 738, 1266 → 1088, 1728 → 1550
  (même largeur témoin ET même bande de breakpoint). Pixel exact seulement à 1728 sinon ; dis-le.
- Résidu attendu : lissage du texte + 1 px d'arrondi de boîte de ligne, nombre de pixels constant (~4 500 pour une
  ligne, ~10 000 pour un hero, ~15 000 pour une section) — 1 à 5 % selon la taille de la boîte. Au-delà : une cause à
  nommer (voisin qui déborde, voile hérité, saut de ligne, bouton sous le voile, `@media` non borné, libellé 16 vs 18,
  cadrage photo, contenu différent).

- **Avant d'annoncer un %, REGARDE le triptyque.** Un panneau uni (blanc) = la capture est vide et le % est la
  couverture d'encre de l'autre côté, pas un résidu. C'est le défaut le plus grave du dépôt (spec 017 : mesurer
  l'absence de données). Ton outil de capture doit **refuser** une boîte de moins de 10 px et imprimer les boîtes
  relevées ; ta lecture doit commencer par « les trois panneaux ont-ils du contenu ? ». Modèle :
  `.page-parity/capture-carte-empile-v2.mts`.
- **Compare à contenu ÉGAL.** Une planche au contenu du set et une page au contenu réel ne se comparent pas :
  l'écart de hauteur est du texte, pas du rendu. Soit tu mets le contenu du set dans la page, soit tu exportes une
  planche au contenu de la page (une instance posée dans une vue le fait).

### Étape 8bis — La mesure de PAGE ENTIÈRE (spec 037)

L'étape 8 mesure **un bloc contre sa planche**. Depuis le 2026-09-08 il existe l'instrument de l'étage au-dessus :
**une page Odoo livrée contre sa vue Figma v2**, aux quatre largeurs.

```bash
npm run odoo:pages:selftest                        # la preuve HORS LIGNE que l'instrument voit
npm run odoo:pages:measure -- <page> [--base URL]  # 4 rapports + 4 triptyques 1:1
```

Ce qu'il faut savoir avant de lire un chiffre :

- **Deux verdicts, jamais un seul.** Le score au pixel est calculé sur la **hauteur commune**, les deux images
  **alignées en haut** ; l'écart de hauteur (`ecartHauteurPx`) est rapporté **à côté**, avec sa propre tolérance.
  Compléter la plus courte en blanc — ce que faisait la mesure manuelle — compte le bas manquant comme une
  différence et mélange « ça ne se dessine pas pareil » avec « ça ne fait pas la même hauteur ».
- **Seuil 5 %, tolérance de hauteur 10 px** (owner, 2026-09-08). Ils vivent dans `extract/odoo-page-parity/views.json`
  avec leur date et leur raison. **Aucun drapeau de la ligne de commande ne les change** — sinon on pourrait les
  choisir après avoir lu les scores.
- **Trois codes de sortie, jamais confondus** : `0` vert, `1` rouge, `2` impossible. « Je n'ai pas pu voir » n'est pas
  « je n'ai rien vu ».
- **Le Header et le Footer sont retirés du côté Figma** avant l'appariement des sections : le `#wrap` d'Odoo ne
  contient ni l'un ni l'autre, les vues v2 les portent comme enfants. Sans ce retrait, chaque page sort un faux
  « 8 vs 10 sections ».
- **Un enfant MASQUÉ dans la vue coûte sa hauteur si tu le composes quand même.** Relevé le 2026-09-08 : une rangée
  de FAQ masquée et un sur-titre masqué valaient +80 px sur une page par ailleurs juste. La page suit la vue.
- **`scorePct` et `ecartHauteurPx` sont déterministes ; le compte brut de pixels ne l'est pas** (12 à 19 unités sur
  1,9 million entre deux lancements de navigateur). L'empreinte d'une capture porte sur les **pixels décodés**, pas
  sur les octets du PNG — l'encodeur de Chromium ne rend pas deux fois le même flux.

### Étape 9 — Le test d'édition (OBLIGATOIRE, jamais sauté)
- **Depuis le 2026-09-09, l'instrument est générique** : `npm run odoo:qa:edition -- --only <bloc>` lit la config
  d'authoring du bloc et prouve chaque verdict dans le VRAI éditeur (rôle rédacteur, instance jetable À SOI :
  `COMPOSE_PROJECT_NAME` + `PQR_ODOO_PORT` propres — jamais une instance où quelqu'un édite en même temps, ses saves
  cassent les pages de test). Un bloc neuf est couvert par sa config, sans scénario dédié. Les règles d'édition
  tranchées sont en §A7 ; les cas ouverts dans `specs/tiny/odoo-edition-registre.md`.
- **Un rouge « la frappe ne prend pas » n'est inscrit qu'après contrôle à l'œil** (Claude in Chrome ou l'owner) :
  l'instrument a produit deux faux rouges le 2026-09-09 (clic forcé hors écran → curseur nulle part ; taper dans un
  champ du formulaire ouvre « Oops » et bloque la session). Il s'auto-vérifie depuis (curseur contrôlé, frappe à
  40 ms/touche, verrous testés dans une session à part).
- Ancien modèle, toujours valable pour un test ciblé : `.page-parity/edit-accordion.mts` / `edit-hero-image.mts` / `edit-linebreak.mts`. Env :
  `PQR_ODOO_PORT=8087 PQR_DB_NAME=piqueray_pilote` (le script lit `.env.example` sinon). Rédacteur `editor@example.test`.
- Modifier un texte simple ET un mot en gras → enregistrer (RPC 200) → relire en public → **remettre l'original**
  (pour ne pas polluer la mesure). Le gras doit survivre à la garde de saisie.

### Étape 10 — Le journal et le rapport
- `specs/tiny/vague-031/<slug>.md`, section « ## Contrat X.Y.Z + Odoo (agent, <date>) » : classement des notes (étape 1),
  ce que le contrat porte (table par mode), la table de mesure (4 largeurs : Odoo vs planche, %, cause), les faits
  code-only, les déviations nommées, « À corriger à la source (Figma) », « Bloqué / à trancher », « Fichiers touchés ».
- Rapport final (ta réponse) : fichiers touchés, les 4 %, la sonde, l'état exact de chaque porte (vert / rouge et
  pourquoi), et **TOUTES les questions que tu as tranchées seul** — une question tranchée seule et non listée est un défaut.

## A4bis. Relever un set toi-même (quand l'orchestrateur ne t'a pas donné le dump)

- Le dump est produit par `extract/figma/dump.plugin.js`, exécuté DANS Figma. Le serveur de scripts
  (`specs/016-canvas-vrai/tools/serve-scripts.mjs`, port **9230**, plage 9223-9232 imposée par le manifeste du
  plugin) est **jailé sur `figma-sync/`** : dépose une copie temporaire du script là, sers-la, **supprime-la après**.
  Deux sets peuvent porter le même NOM (le master v1 et le candidat v2) — filtre sur le `node.id`, pas sur le nom.
- Le retour d'un `figma_execute` doit rester petit : range le JSON dans `figma.clientStorage`, puis, dans un
  second appel, `POST` vers `extract/figma/page-parity/receiver.mjs <dossier> 9230` (`/json?name=…`).
  Un seul port libre à la fois : arrête le serveur de scripts avant de lancer le receveur.
- Puis `npm run extract:figma -- <dump.json> --out <dossier>` produit contrat proposé, jetons proposés et
  `figma-proposals.md`.
- **Piège d'outil** : dans une sonde Playwright écrite en `.mts`, n'écris **aucune fonction nommée à l'intérieur
  de `page.evaluate`** — tsx y injecte un helper `__name` que le navigateur ne connaît pas (`ReferenceError`).
  Passe le corps de la sonde en **chaîne** à `page.evaluate`.

## A5. Portes à passer avant de rendre (toutes, dans cet ordre)
```
npm run build            # vert (derivation-report rouge acceptée si c'est le digest, à noter)
npm run geometry:gate    # zero invisible literal
npm run odoo:authoring:check
npm run odoo:module:check   # 23/23 sauf la ligne du verrou
npm run emitters:check   # core/samples/*.inline.tsx périmés qui bougent : attendu, à signaler, pas à corriger
npx tsc --noEmit
npm run parity           # peut proposer des patchs : N'EN ACCEPTE AUCUN ; un cliché périmé se signale
```
Jamais `npm run eval` (orchestrateur).

## A6. Pièges (tous ceux qui ont coûté du temps, du plus fréquent au plus rare)
- **`justify: space-between` + `gap` ne disent PAS la même chose des deux côtés** (trouvé le 2026-09-07, FAQ v2).
  Figma IGNORE l'itemSpacing sous space-between ; en CSS le `gap` reste un minimum et se cumule. Un enfant FILL
  est donc rendu plus étroit en code qu'au canevas — de la valeur exacte du gap — et un texte se replie une ligne
  plus tôt (mesuré : +25 px de haut en Mobile, +18 en Tablette sur la FAQ). Si ta mesure montre un écart de hauteur
  ET des retours à la ligne différents, **sonde la largeur du texte des deux côtés avant toute autre hypothèse**.
  Corrige le contrat (gap → `{space.0}` sur l'état concerné) ET la règle de pont qui reposerait le même gap.
- **L'en-tête d'une section v2 ne s'instancie pas** : aucune section de la vague n'utilise `SectionHeader` — chacune
  DESSINE son accroche et son titre avec les rôles responsive (le composant commun n'a aucune dimension par écran
  et figerait le titre). Modèle à cloner : l'en-tête d'`AvisGoogle`. Modèle de contrat : `ds.google-reviews` 3.1.0.
- Le parent d'une molécule fixe SA boîte : ne porte pas la hauteur de la molécule, garde un rapport par défaut que la
  section écrase. Une molécule n'a pas d'axe présentation : ce qui change par écran passe par des jetons par écran.
- Un `<img>` absolu ne s'étire pas par ses insets : `width: 100 %` ; un plan de fond dans le padding →
  `width: calc(100% - 2 × inset)`.
- `emit-react` casse sur un retour de ligne dans un défaut de prop **texte simple** (un riche va bien).
- `figma:plan` refuse deux styles de même recette.
- Un cliché de parité périmé rend vert un canevas qui a bougé ; `parity` apparie par clé de set puis par nom : deux sets
  du même nom (l'ancien du DS, le nouveau 031) sont un piège connu.
- Le composeur (`compose_page.py`) écrit `arch_db` dans TOUTES les langues et rend les lignes d'accordéon par le gabarit
  QWeb : si « j'ai recomposé, rien ne change à l'écran », vérifie d'abord que `-u` a bien eu ses identifiants.
- Le bouton en pied sous 992, le `flex: 0 0 auto` d'une colonne, la hauteur → `min-height` : trois lacunes connues du
  contrat/émetteur, à porter en CSS et à nommer, pas à « corriger » ailleurs.
- **Poser une graisse sur un libellé lié à un style de texte le DÉTACHE de ce style** — donc de la liaison
  `fontSize → typography/<role>/size` qui le rend responsive, et rien ne le signale. Dans une INSTANCE, la surcharge
  ne prend même pas : elle est avalée en silence. Si un état demande une autre graisse, crée un **style de texte
  dédié** et recopie les champs du style source **un par un** — appliquer un style neuf écrase tout, `textCase`
  compris (un libellé en capitales est tombé de 156 à 130 px pour cette seule raison, 2026-09-07).
- **Avant de proposer un fait d'état, lis les jetons d'état existants.** `color.etat.<style>.<canal>` et
  `decoration.etat.<style>.survol` couvrent déjà beaucoup : le « noir pur au survol » demandé le 2026-09-07 était
  posé depuis la vague 032, la proposition ne contenait donc qu'un seul fait neuf. Un canal d'état neuf se calque
  sur cette forme : une valeur PAR STYLE, les styles inchangés reprenant explicitement la valeur du repos.
- **Le canal d'états d'une part NON-RACINE n'accepte que `color`, `background-color`, `border-color`**
  (`PART_STATE_CHANNELS`). Un zoom, un glissement, un écart qui change au survol sont des faits **code-only**, à
  écrire dans le CSS Odoo et à nommer dans la `description` de la part — jamais à forcer dans le contrat.
- **Au survol d'une carte, le pointeur n'est pas sur le bouton** : `.button:hover` ne s'applique pas. Re-porte les
  canaux du bouton par leurs variables de jeton sous le survol de la carte — précédent : règle (6) de la zone
  `ODOO-023-FOOTER-BRIDGE`.
- Le dégradé du voile de navigation d'un hero est celui du HeroVideo par mode : réutilise les entrées de registre
  existantes, ne retape pas 11 arrêts.
- Un fichier étranger dans le worktree (`v9.js`, autres contrats) : une autre session travaille peut-être ici. Ne touche
  pas, ne supprime pas, signale.
- **Exporter un nœud posé DANS une SECTION de la page 031 rend 149 octets** (mesuré le 2026-09-08 : `Header` Wide 031,
  `MenuEntree`, la vue « menu ouvert » — tous à 149 ; le cadre `Accueil`, hors section, exporte normalement).
  `exportAsync({ useAbsoluteBounds: true })` rend l'image réelle (149 → 4 908 octets sur le même nœud). Les outils
  `figma_capture_screenshot` / `figma_take_screenshot` n'ont pas cette option : pour un nœud en section, passe par
  `figma_execute` + POST au receveur. Et **ne renvoie JAMAIS un PNG en base64 dans le retour d'un `figma_execute`** :
  45 Ko de base64 dans le contexte de l'agent, pour rien — le receveur existe pour ça.
- **Vérifie `/health` d'un receveur AVANT d'y envoyer un octet.** Le 2026-09-08, 9228 et 9230 répondaient tous deux —
  deux receveurs d'autres sessions (`/tmp/equipe-survol`, `.page-parity/037/vues`) : un POST y aurait « réussi »
  en rangeant les images ailleurs. Un port qui répond n'est pas ton port ; 9224 et 9226 étaient libres.
- **Dans une instance, `rotation` (relative-transform) n'est pas surchargeable** — `fills` et `visible` le sont. Pour
  montrer un chevron retourné sur une instance de Header : masquer le chevron de l'instance, poser un vecteur
  à toi au même endroit, positionné depuis `absoluteBoundingBox` APRÈS que la mise en page a tourné (les positions
  lues juste après `createInstance` sont fausses de 25 px).
- `figma.currentPage = page` est refusé (`documentAccess: dynamic-page`) : `await figma.setCurrentPageAsync(page)`.

---

# PARTIE B — HISTORIQUE ET LEÇONS DATÉES (la recette d'origine, telle qu'écrite le 2026-09-02, et ses compléments)

## A7. Règles d'édition tranchées par l'owner (2026-09-09) — valables pour TOUTES les pages

Ce que le rédacteur peut toucher est une décision, pas un accident du gabarit. Avant d'ouvrir ou de fermer une part
sur un bloc neuf, lire ce tableau ; une règle absente ici se tranche avec l'owner et s'ajoute ici, jamais dans le code seul.
Registre des cas et des reçus : `specs/tiny/odoo-edition-registre.md`. Instrument : `npm run odoo:qa:edition` (§ Étape 9).

| Bloc | Ouvert au rédacteur | Fermé, et c'est voulu | Décision / motif |
|---|---|---|---|
| Tous | textes déclarés `controlled` dans la config, images par l'outil natif Odoo + alt, liens des CTA au panneau | structure, styles, tout réglage Odoo par défaut (Background, Height, Visibility, save-as-custom, resize) | le panneau ne montre QUE la politique Piqueray ; un réglage natif visible = défaut à corriger (EB-009) |
| Collections (catégories, membres, avis, FAQ, tuiles) | ajouter / supprimer / monter / descendre au panneau ; l'état VIDE reste ajoutable | — | Équipe vidée ne se ré-ajoute pas = défaut (EB-006). Pas de confirmation à la suppression : ergonomie acceptée, à surveiller (EB-022) |
| Produits e-commerce | titre de section | titre, prix, image, ajout de produit | **normal** : sera bridgé sur l'e-commerce (Malin Signe). Config en `fixed-by-composition` (EB-003) |
| Réassurances | titre de carte, texte de carte (`carte-body`), CTA, ajout de carte, **accroche et titre de section (à ouvrir)** | — | EB-004 : fix |
| Avis Google | accroche, titre, qualificatif, note, nombre, étoiles, lien du bouton, cartes (auteur, date, témoignage, note) | libellé « Voir tous les avis » | **normal** fermé (EB-007) ; la section doit perdre ses réglages natifs (EB-009) |
| Hero vidéo | titre, libellé + lien du CTA, image d'attente + description | — | la description va en `aria-label` sur la `<video>` (pas d'alt sur une vidéo) — un test qui lit `alt` se trompe (EB-008, faux rouge) |
| Réalisations | titre, paragraphe (gras), photos par l'outil natif + « Remplacer » + alt, ajout/retrait/ordre des tuiles | le sur-titre OU le paragraphe selon la variante d'en-tête (`accroche` / `presentation`), posée par la composition | couche d'édition écrite le 2026-09-09 sur le modèle Catégories (EB-001). Zones `ODOO-038-REALISATIONS-*` |
| Formulaire | accroche, titre (gras), consentement, avantages (titre, texte) | le formulaire lui-même (champs, étiquettes, bouton) | pas d'ajout d'avantage aujourd'hui (à faire) ; le message de succès est `hidden` donc inéditable (à trancher) ; **cliquer une étiquette ne doit pas ouvrir « Oops »** (EB-002/EB-019) |
| Coordonnées, Présentation (libellé CTA), cartes d'avis | ouverts à l'écran alors que la config dit fermé | — | à trancher : on garde ouvert et on aligne la config (EB-010/011/012) |
| Catégories `carte-text`, Hero sous-titre | le gras passe alors que `allowedMarks` est vide | — | à trancher : autoriser le gras dans la config, ou aplatir (EB-013/014) |

**Deux pièges de l'éditeur lui-même, à connaître avant de tester une page :**
- Un utilisateur dont Odoo est en **anglais** ouvre l'éditeur en **mode traduction** (« Translate to English (US) ») — l'URL passe en `/en`. Il éditerait une traduction sans le voir. Toujours ouvrir la page maître : `…website_preview?path=/fr&enable_editor=1`, ou mettre le rédacteur en français (EB-021).
- Le curseur peut être dans le texte d'une carte alors que le panneau de droite montre une AUTRE carte (clic pendant un défilement) : vérifier le panneau avant « Supprimer ».

## Le but, en une phrase

Le bloc Odoo de la section affiche, aux 4 largeurs (390 / 834 / 1200 / 1728), ce que la planche 031
montre, mesuré par `images:compare` bloc contre planche, avec un écart sous le seuil que l'owner fixe
après lecture des triptyques. Le rédacteur garde ses possibilités d'édition. Tout ce qui reste à
l'ancienne est nommé.

## Ce que l'agent reçoit (préparé par l'orchestrateur, hors ligne — AUCUN accès Figma nécessaire)

Dans `.page-parity/vague-031/` (dossier de travail, ignoré par git) :
- `dumps/<Set>.live.dump.json` — le dump v1.8 du set 031, **après liaison** des paddings/gaps des
  racines de variantes (111 liaisons posées le 2026-09-02, valeurs identiques avant/après).
- `planches/<Set>-<390|834|1200|1728>.png` — l'export 1x de l'instance posée dans chaque vue home 031.
  **C'est la seule référence visuelle.**
- `proposals/<Set>/` — la sortie de `npm run extract:figma` sur le dump : contrat proposé, tokens
  proposés (`imported.*`), et **`figma-proposals.md`, le rapport de notes : c'est la liste de travail.**

## Les règles qui ne se discutent pas

1. **Figma est la référence, le contrat en est la traduction, Odoo en est la projection.** On ne
   « corrige » jamais un écart en tordant le contrat pour qu'il colle à Odoo.
2. **Pas de valeur tapée à la main dans un contrat.** Chaque valeur vient de la proposition ou d'un
   token existant. Un `imported.*` proposé se **renomme** vers un token existant s'il en existe un de
   valeur identique ; sinon on le **minte from-dump** dans `tokens/primitives.tokens.json` avec sa
   provenance (`$description` : set, nœud, date). Jamais de chiffre inventé.
3. **Un texte avec un saut de ligne est riche ; un texte avec du gras est riche** (règle owner
   2026-09-02). Un texte riche se lie à la propriété TEXT du set si elle existe, sinon `NONE`.
   Il déclare `white-space: pre-line` sur sa part et `content.marks.strong` (le validateur l'exige).
4. **Ne touche pas à Figma.** Si la source est fausse (valeur non liée, style manquant, variante
   parasite), tu l'écris dans ton journal, section « À corriger à la source », et tu continues avec
   la valeur observée. L'orchestrateur porte les écritures Figma à l'owner.
5. **Ne touche pas aux émetteurs, au schéma, aux tokens partagés, au verrou Odoo, aux golden.**
   Un besoin dans l'un d'eux = une ligne dans ton journal, section « Bloqué / à trancher ».
   Exception : minter un token primitif from-dump (règle 2) est autorisé — **dans un bloc à toi**,
   avec provenance.
6. **Chaque déviation est nommée**, dans le contrat (`description`) et dans ton journal. Une
   déviation silencieuse est le défaut le plus grave de ce dépôt.
7. **Tu mesures un bloc, pas une page.** Page de test dédiée, bloc seul, en-tête masqué.

## Les 12 étapes

### 1. Lire, avant d'écrire
- `proposals/<Set>/figma-proposals.md` en entier. Classer chaque note : *adopté tel quel* /
  *renommé vers token existant* / *minté* / *décision* / *déviation nommée*.
- Le contrat actuel `contracts/<set>.contract.json` : ce que le bloc Odoo porte aujourd'hui (props,
  parts, `data-pqr-part`), pour ne rien casser côté édition.
- `integrations/odoo/config/<set>.authoring.json` : les verdicts d'édition existants.

### 2. Le contrat 2.x.0, depuis la proposition
- Partir de `proposals/<Set>/<set>.contract.proposed.json`. Garder : `presentation` (enum 4 valeurs,
  **défaut = première variante du set**, la parité l'exige), `layoutByProp`, `tokensByProp`,
  `literalsByProp`, les tokens de texte (`typography.h1.*`, `typography.h2.*`, …).
- Reprendre du contrat actuel : `semantics.element` (`section`), les props de contenu et leurs
  bindings, les descriptions, les parts d'image (`Background`, `declared` position/object-fit), les
  ancres `code`.
- Ancres Figma : `componentSetKey` + `nodeId` du **set 031** (dans le dump, `key` et `nodeId`).
- Largeurs 390/668/1200/1728 proposées comme tokens de largeur : **témoins, pas des tokens**.
  Le root garde `layout.width: "fill"` + `referenceWidth: 1728`. Supprimer les `imported.*.root.width.*`.
- Hauteurs fixes : garder `height` dans le contrat (fidèle) ; c'est le CSS Odoo qui en fait un
  `min-height` (Odoo force `height: auto` sur les sections sous 768).
- Voiles / dégradés : `literals` + `literalsByProp` par présentation, chaque valeur inscrite dans
  `contracts/named-literals.registry.json` (pointeur exact, provenance, date), sinon `geometry:gate` refuse.
- Ce qu'une **part instance** (`component`) ne peut PAS porter — refusé par le validateur :
  `layoutByProp`, `tokensByProp`, `literalsByProp`, `stylesWhen`, `declared`. Placement d'un CTA,
  icône par mode, ordre de peinture au-dessus d'un voile : **fait code-only**, dans ton CSS Odoo,
  nommé dans la description de la part et dans le journal.
- Version : MAJOR si les ancres changent de set ou si un prop disparaît ; MINOR sinon.
- `npm run build` : le schéma valide par nom. Lire chaque refus, ne pas contourner.

### 3. Les miroirs Odoo (mécanique, tous obligatoires)
- `integrations/odoo/config/<set>.authoring.json` : toutes les épingles `"id": "ds.<set>", "version"`
  → nouvelle version ; un contrôle pour `presentation` (`fixed-by-composition`, `none`) ; un verdict
  pour chaque prop/part nouvelle. `npm run odoo:authoring:check` liste ce qui manque.
- `integrations/odoo/config/figma-panels.json` : la version du panneau.
- `views/components.xml` : `data-ds-contract-version` du bloc. Ne touche PAS au digest à la main.
- **Le digest est global et appartient à l'orchestrateur** : ne lance pas `check-inputs --repin`,
  ne modifie ni `inputs.lock.json`, ni `version_guard.js`, ni `scan-saved-versions.ts`, ni
  `cases.json`. Ton `npm run build` peut rester rouge sur l'étape derivation-report pour cette seule
  raison : note-le, c'est attendu.

### 4. Le CSS Odoo par écran, à la main, depuis le contrat
- **Un fichier à toi** : `integrations/odoo/addons/piqueray_ds/static/src/css/responsive/<set>.pqr.css`
  (l'orchestrateur l'ajoute au bundle après `components.pqr.css`).
- Forme fixe, toujours la même :
  ```
  base = Mobile (déjà dans components.pqr.css)
  @media (min-width: 768px)  { … Tablette … }
  @media (min-width: 992px)  { … Desktop … }
  @media (min-width: 1600px) { … Wide … }
  ```
  Chaque bloc recopie les déclarations que `components.pqr.css` émet pour la classe
  `.<bloc>--presentation-<mode>` (racine et parts). Même vocabulaire (`var(--pqr-…)`), rien d'autre.
- La typographie n'a rien à faire ici : `tokens.pqr.css` porte déjà ses blocs `@media`.
- `height` du contrat → `min-height` (Odoo force `height:auto` sous 768).
- Les faits code-only (CTA épinglé, icône masquée, ordre de peinture) : dans ce fichier, chacun avec
  un commentaire qui dit pourquoi le contrat ne peut pas le dire.
- **Un bloc `@media` borné** (`(min-width: 768px) and (max-width: 991.98px)`) pour tout ce qui ne doit
  vivre qu'en tablette — le hero a perdu une heure sur un `left: 48px` non borné.
- Ne t'appuie jamais sur les classes de padding de l'éditeur (`pt64`) : elles sont en `!important`.

### 5. Le QWeb, seulement si le DOM doit changer
- Une icône présente sur certains modes seulement : elle doit être **dans le DOM** (toujours rendue),
  masquée par `@media`. C'est une ligne de QWeb + une recomposition de page.
- Une zone de titre avec saut de ligne : `data-pqr-marks="line-break"` (zone riche, marque unique).
  La toolbar ne propose Gras que si `strong` est dans la liste.

### 6. La page de test
- `integrations/odoo/authoring/pages/<set>-test.json` : `url: "/<set>-test"`, le bloc seul, le
  contenu de la home. Copier la section depuis `home.json`.
- Si le contenu de la home doit changer (saut de ligne, texte), c'est du **contenu** : dans
  `home.json` ET dans ta page de test, jamais dans le contrat.

### 7. Déploiement (instance de l'orchestrateur, protocole)
- Une seule instance jetable partagée, projet `piqueray-odoo-pilote`, port **8087**. Les agents ne
  lancent ni `-u piqueray_ds`, ni `docker restart` : ils déposent, l'orchestrateur déploie par lots.
- Après déploiement : `npm run odoo:page -- <set>-test piqueray-odoo-pilote`.

### 8. La mesure
- Capture : `.page-parity/capture-hero.mts` généralisé (`capture-bloc.mts <baseUrl> <outDir> <selector> <url>`)
  — viewport = largeur témoin, clip = boîte du bloc, en-tête et autres blocs masqués.
- Comparaison : `npm run images:compare -- --before planches/<Set>-<w>.png --after odoo/<w>.png --out …`.
  Refuse deux tailles différentes : une hauteur différente est déjà un écart, nommé.
- Triptyque **pleine taille** : `.page-parity/triptych-full.mjs` (l'instrument recadre sur la zone
  de différence, illisible quand l'écart est petit).
- Diagnostic avant de conclure : `.page-parity/bands.mjs` (luminance par bande : un voile ?),
  `.page-parity/pair.mjs` (paire découpée à l'échelle 1), une sonde Playwright des boîtes
  (`probe-cta.mts` : positions réelles vs planche).

### 9. Lecture des triptyques : nommer chaque écart
Pour chaque largeur : la cause, et où elle vit. Les causes vues sur le hero, dans l'ordre où elles
sont apparues :
1. un **voisin qui déborde** dans la capture → page de test bloc seul ;
2. les **voiles** du contrat hérités de l'ancien master → lire les stops sur le set 031, `literalsByProp` ;
3. un **saut de ligne** absent/présent → contenu (`<br/>`), texte riche, zone `line-break` ;
4. un **bouton sous le voile** → ordre de peinture, fait code-only ;
5. un **décalage** → une règle `@media` non bornée ;
6. un **libellé de bouton** 16 vs 18 en wide → le style « Libellé bouton » est responsive (réglé une fois
   pour tous, contrat Button 2.1.0) ;
7. le **lissage du texte** → résidu, pas un défaut.

### 10. L'édition
- Un contrôle par prop, un verdict par part. Test à l'écran : éditer, enregistrer, rouvrir
  (`.page-parity/edit-linebreak.mts` comme modèle : session rédacteur, `enterEditor`, save RPC 200,
  relecture publique).

### 11. Le journal de section
`specs/tiny/vague-031/<set>.md` : faits datés, valeurs relevées, écarts par largeur avec cause,
déviations nommées, **À corriger à la source (Figma)**, **Bloqué / à trancher**, mesure finale.

### 12. Livraison
Fichiers touchés listés (contrat, authoring, panneau, QWeb, CSS, page de test, journal, mints), les
4 triptyques, les 4 chiffres, la liste des déviations. Rien n'est committé par l'agent.

## Pièges connus (chacun a coûté du temps le 2026-09-02)

- La commande `grep` de ce shell est une fonction qui rend vide sur les gros fichiers : `/usr/bin/grep`.
- Les ports 9223–9229 sont squattés par les serveurs figma-console (IPv6) : un `localhost:9226` répond
  404 depuis un autre serveur. Récepteurs locaux sur 9230+.
- Odoo : `section { height: auto !important }` sous 768 ; `ptN/pbN` en `!important` ; l'aperçu mobile
  de l'éditeur ≈ 370–400 px ; pas d'aperçu tablette (redimensionner la fenêtre).
- La garde de saisie déplie tout `<br>`/`<strong>` non autorisé **à l'enregistrement** : ce qu'on voit
  pendant l'édition n'est pas ce qui est sauvé.
- `emit-react` casse sur un retour de ligne dans un défaut de prop **texte simple** (un riche va bien).
- `figma:plan` refuse deux styles de même recette : un style responsive n'est monté que par un texte
  lié à son propre token.
- Le sync tokens ne connaît pas la collection Responsive : ne jamais le lancer sans l'orchestrateur.
- Un cliché de parité périmé rend vert un canvas qui a bougé : rafraîchir avant de conclure.

## Ce que l'orchestrateur fait, et seulement lui
Figma (écritures, dumps, planches) · tokens partagés et mints en collision · digest/lock/golden/reçus ·
bundle du manifeste (`responsive/*.pqr.css`) · déploiement sur l'instance · fusion des worktrees ·
séance de lecture des triptyques avec l'owner.

## Complément du 2026-09-02 (soir) — appris sur SAV et Presentation

- **Un set peut porter deux formes** (SAV : Wide = ancien master avec un cadre en plus). L'extraction le dit
  (« present in 3/4 variants », parts renommées `row2`, `background2`). Modéliser la forme MAJORITAIRE, remonter les
  faits du cadre orphelin sur son parent, nommer, et lister la variante dans « À corriger à la source ».
- **Une section n'est pas forcément pleine largeur** (Presentation en Wide : 1287 borné, padding 0, centré par la
  page). Le contrat porte la largeur bornée ; le CSS fait `max-width` + centrage ; la mesure se fait sur la largeur
  du bloc, pas sur 1728.
- **Directions inversées** : `row-reverse` / `column-reverse` seulement dans `layoutByProp` (override), jamais en base.
  L'anatomie garde l'ordre des enfants de la variante par défaut (mobile).
- **Photos** : un `IMAGE` avec transformation (CROP, ou FILL avec `imageTransform`) n'a pas d'orthographe CSS. Porter
  `object-fit` (FIT = contain, FILL = cover), nommer l'écart, et laisser l'outil image natif d'Odoo au rédacteur
  (`data-pqr-native-image="1"` sur l'`img`, verdict `directly-editable` média).
- **Mesure** : `.page-parity/mesure-bloc.mjs <planche> <odoo> <outDir>` aplatit la planche (transparence → blanc,
  sinon les marges comptent comme écart), aligne les hauteurs, sort le triptyque et le %. Une différence de hauteur
  est rapportée, jamais masquée.
- **Descriptions** : jamais un token entre accolades dans une description (`emitters:check` le lit comme non résolu).
- **Aucun `git checkout --` sur un fichier partagé** (tokens, verrou) : les ajouts du jour ne sont pas committés
  pendant la vague. Reçu : 11 tokens perdus et reconstruits depuis le CSS construit, 2026-09-02 18h30.
- **Digest global** : chaque contrat livré le fait bouger ; l'orchestrateur re-pinne et propage aux 4 miroirs
  (components.xml ×14, version_guard, scan-saved-versions, cases.json) après CHAQUE fusion, pas seulement à la fin.
- **La graisse d'un texte riche se lit par PLAGE et par VARIANTE**, jamais par le mint de l'extraction (SAV : Regular
  en Mobile/Tablette, Medium en Desktop/Wide ; l'extraction avait minté 500 partout). Lecture : `getStyledTextSegments`
  via l'orchestrateur, ou le rapport « typography varies across variants ». Si la graisse varie par mode → token
  responsive (`typography.body.weight`, fait une fois pour toutes le 2026-09-02).
- **Un `<img>` absolu ne s'étire pas par ses insets** : components.pqr.css lui met `width: 100 %`. Un plan de fond
  dessiné DANS le padding se porte en `width: calc(100% - 2 × inset)`, jamais en `left/right` seuls (SAV : 24 px
  de fuite à droite, 1728 passé de 15.6 % à 1.1 % une fois corrigé).
- **Un saut de ligne absent sur une variante** se voit au triptyque comme « une ligne de plus » et un CTA décalé de
  la hauteur d'une ligne. Vérifier les caractères du texte par variante (LF / U+2028) avant de chercher un padding.
- **Lire chaque triptyque avec l'owner, chiffres à l'appui** : positions sondées (`probe-sav.mts`) avant de
  conclure « rendu texte ». Trois fois ce soir la cause réelle était ailleurs (fuite du fond, graisse, source).
- **Une molécule n'a PAS d'axe présentation** : ce qui change par écran passe par des tokens qui varient par écran
  (`spacing.card-categorie.pad-h`, `typography.h3.*`, `typography.card-desc.*`). Sa BOÎTE appartient à la section :
  ne pas porter sa hauteur, garder un rapport par défaut que la section écrase.
- **Un calque masqué dans l'usage** (visible=false sur les instances, jamais sur le master) devient une **option
  gouvernée** du contrat que le parent passe — jamais un calque caché (§VIII). Le schéma n'admet qu'UNE condition de
  présence par part : si la part en a déjà une, la descendre sous un parent qui porte l'autre.
- **Deux sets peuvent porter le même nom** (l'ancien du DS, le nouveau de 031). Vérifier lequel la section instancie
  AVANT d'écrire les ancres : `getMainComponentAsync` sur une instance de la section le dit en une ligne.
- **Un style de texte lié à ses variables mais sans marqueur de token** n'est pas reconnu par l'extraction. La liaison
  se fait alors à la main vers le token existant (jamais une valeur), et le marqueur manquant part en correction source.
- **Avant de modéliser une molécule, vérifier qu'elle est INSTANCIÉE dans sa section** (`getMainComponentAsync`
  sur un enfant). Des cadres libres = le maître ne propage rien. La réparation se fait par instanciation, avec
  capture avant/après par vue et preuve à 0,00 % ; penser à reporter ce qui vivait sur les cadres et pas sur le
  maître (largeur minimale, sizing, ancres). Les propriétés de grille ne sont pas modifiables par script.
- **Une différence de contenu n'est pas un défaut de rendu** : la planche 031 et la home peuvent porter deux
  copies différentes. Le dire, et laisser l'owner trancher, plutôt que d'aligner l'un sur l'autre.
- **Un en-tête de section composé (ds.section-header) fige sa typographie** : si le set 031 le dessine à plat,
  le modéliser DANS la section (sur-titre sur typography.overline.*, titre sur H2). Sinon le titre reste à 40 px
  sur les quatre écrans — mesuré : 258 px de haut au lieu de 88 en mobile.
- **Une rangée qui passe à la ligne a DEUX écarts** : colonne (itemSpacing) et rangée (counterAxisSpacing).
  Avec une carte par ligne seul celui de rangée compte. L'extraction ne propose pas le second : le lire au dump.
- **Chercher les plafonds hérités dans `odoo-bridge.css`** avant de mesurer une section : une `max-width`
  d'adaptation d'hôte peut rétrécir silencieusement les cartes au-delà d'une certaine largeur.

## Deux observations de relecture (2026-09-02, fin de vague) — À TRANCHER, rien fait

Quatre relectures croisées du CSS écrit à la main pendant la vague. **Aucune correction appliquée** :
ces feuilles sont dérivées du contrat et du relevé Figma, et mesurées au pixel ; les raboter pour la
forme risquerait une régression sans gain. Deux constats méritent quand même une décision de spec.

1. **Les feuilles manuelles recopient ce que le dépôt sait déjà générer.** `components.pqr.css` émet des
   règles `.<bloc>--presentation-<mode>` qu'aucun QWeb ne pose jamais : Odoo n'a pas de moyen d'appliquer
   une classe selon la fenêtre. Le bundle transporte donc les deux copies, la générée inerte et la
   manuelle vive (~9 Ko), dégradés de voile compris. La bonne réponse n'est pas de raboter les feuilles :
   c'est de **transformer ces classes en `@media` à la construction des assets**, là où
   `scripts/odoo/build-assets.ts` post-traite déjà le CSS. Les cinq feuilles deviendraient dérivées.
2. **Les cinq feuilles manuelles échappent au rapport de dérivation.** `build-derivation-report.ts` compte
   les zones manuelles par marqueurs `ODOO-NNN-… BEGIN/END` dans une liste de fichiers où
   `responsive.pqr.css` et `responsive/` n'entrent pas. Une vingtaine de kilo-octets écrits à la main sont
   invisibles à l'instrument censé les compter, et absents de `adaptation-registry.json`.

Autres points relevés, mineurs, laissés en l'état pour la même raison : la gouttière 24/48/56/89 réécrite
dans cinq feuilles, le CTA pleine largeur écrit cinq fois en trois orthographes, quelques déclarations
sans effet, et des textes de panneau Odoo devenus faux (« grille de 4 colonnes », « 2 ou 3 colonnes »).
Ces deux derniers sont visibles par le rédacteur : à corriger dans la prochaine spec.

**Ajouts à cette liste, même relecture, mêmes réserves (rien fait) :**

3. **Deux dégradés recopiés à la main sans filet.** `responsive/devis.pqr.css` porte deux dégradés de 25 et
   21 arrêts, identiques à ceux que le contrat émet et que `contracts/named-literals.registry.json` protège
   côté contrat. La copie Odoo, elle, n'est comparée à rien : une correction du voile au contrat laisserait
   Odoo sur l'ancienne valeur, en silence. Un contrôle de trois lignes suffirait.
4. **Le panneau d'édition contredit la gouvernance.** `categories.authoring.json` déclare le style de carte
   `fixed-by-composition` / `mechanism: none`, mais `authoring.xml` offre toujours le sélecteur « Type de
   carte ». Et `SetColonnesAction` reste définie dans `authoring.js` après le retrait du réglage Colonnes,
   pilotant une classe que le générateur n'émet plus. **C'est le seul point visible par le rédacteur.**
   Cause de fond : `check-authoring.ts` vérifie la couverture des verdicts mais ne lit jamais `authoring.xml`
   — aucune porte ne confronte le verdict déclaré à ce que le panneau propose réellement.
5. **Le compte du canal manquant : dix.** Dix faits « code-only » de cette vague ont une seule cause — une
   part instance ne porte aucun canal par mode. Cinq sont la même phrase (le CTA pleine largeur sous 992).
   Deux relèvent d'un canal de props par mode, envisagé puis abandonné le 2026-08-20 au motif qu'il ne
   servait qu'une variante morte : six composants le réclament maintenant. Un manque inscrit dans une
   recette cesse d'être un manque et devient une politique — celle-ci a été adoptée sans que le compte
   soit sur la table.

## Ce que les évaluations couvrent de cette vague — et ce qu'elles ne couvrent PAS (mesuré le 2026-09-02)

**Couvert.** `src/styles/tokens.css` est figé octet par octet dans `evals/golden.json` : les blocs par écran
ne peuvent pas bouger en silence. `reassurances-grid-variant-isolation` vérifie la grille par écran sur
TROIS surfaces (contrat, CSS React généré, script Figma). Les titres de section, leur typographie et leurs
liaisons Figma ont chacun leur porte, resserrée en fin de vague.

**Non couvert, et c'est le trou principal :**

- **Les cinq feuilles écrites à la main ne sont dans AUCUNE porte.** Mesuré : zéro occurrence de
  `css/responsive` dans `evals/run.ts`, aucune entrée `responsive` dans `evals/golden.json`, rien côté
  `parity/`. ~450 lignes qui décident du rendu Odoo aux quatre largeurs, et rien ne les regarde : les
  effacer laisserait toutes les portes vertes. À rapprocher du point 2 ci-dessus (rapport de dérivation) :
  ces feuilles échappent aux DEUX instruments.
- **La dimension par écran des jetons n'a pas de porte à elle.** Zéro occurrence de `viewport`,
  `breakpoint` ou `@media` dans `evals/run.ts` — le mécanisme ajouté le 2026-09-02 dans `build-tokens.mjs`
  (lecture de `tokens/modes/viewport.*`, validation, émission des blocs) n'est protégé qu'indirectement,
  par le figement de la feuille produite. Une règle de validation retirée passerait tant que la sortie ne
  change pas.
- `components.pqr.css`, la feuille servie à Odoo, n'est pas figée non plus (seule celle du dépôt l'est).

**Priorité proposée** : figer les cinq feuilles manuelles au golden et poser une porte qui vérifie que
chaque seuil qu'elles écrivent correspond à un jeton `breakpoint.*`. Deux gestes courts, aucun effet visuel.

## Complément du 2026-09-07 — pilote AccordionRow (molécule, 1er agent seul sur la recette)

Le pilote a été fait en deux temps : candidat Figma avec l'owner (orchestrateur), puis contrat + Odoo par un agent
de fond, seul, sur ce document. Chaque point ci-dessous a coûté un aller-retour ; il est écrit pour que le suivant
n'ait pas à le retrouver. Journal complet : `specs/tiny/vague-031/accordion-row.md`.

### Ce que l'orchestrateur prépare (et comment, exactement)

- **Receveurs** : deux ports libres de la plage 9223-9232, vérifiés par `lsof -nP -iTCP:<port> -sTCP:LISTEN`. Un
  port tenu par un `node …/receiver*.mjs` d'une session morte (voir `ps -p <pid> -o lstart=,command=`, `/health`
  répond avec un `outDir` d'un scratchpad d'une autre session) se **tue**, il ne se contourne pas. PNG :
  `node extract/figma/page-parity/receiver.mjs <outDir> 9228` (noter le **nonce** imprimé par `/health`, capture.js
  l'exige). JSON : `node extract/figma/gauntlet/live/capture-receiver.mjs <outDir> 9230`.
- **Dump** : `extract/figma/dump.plugin.js` patché en mémoire (`TARGET_SETS = ['<Set>']` + `if (node.id !==
  '<id du set>') continue;` — deux sets portent souvent le même nom — et `return dumps` remplacé par un `fetch` POST
  vers `http://localhost:9230/chunk?name=<Set>.live.dump`). Le script fait 30 Ko : le servir par le receveur
  page-parity (`/file?name=bridge/_tmp-dump-<set>.js`, dossier jailé = `extract/figma/page-parity/`) et l'exécuter
  dans `figma_execute` par `new AsyncFunction(src)`. Supprimer le fichier temporaire après.
- **Planches** : `bridge/capture.js` via le même `/file`, avec `globalThis.__dsc003_input = { maquette, nodeId,
  port: 9228, expectNonce }`. **Piège ASI** : `new AsyncFunction('return ' + src)` rend `undefined` (le fichier
  commence par un commentaire → `return` seul sur sa ligne) ; écrire `'return (\n' + src + '\n)'` après avoir retiré
  le `;` final.
- **Exporter depuis des INSTANCES, jamais depuis une variante du set.** La variante Mobile de TexteSEO exportait
  683 px pour 771 réels (accordéon rendu à sa hauteur v1), six remèdes sans effet ; l'instance rend juste.
- Un cadre témoin créé par script : `primaryAxisSizingMode = 'AUTO'` **après** `resize()`, et l'export dans un
  **appel séparé** (hauteurs fantômes). Un témoin destiné au diff ne porte **pas d'étiquette** dans le cadre (sinon
  l'agent doit deviner où découper — il a déduit y = 39 par bandes d'encre) : étiquette à côté, pas dedans.
- **Témoins « contenu = page de test »** : un jeu de témoins par mode avec exactement le contenu de la page de test
  (mêmes lignes, mêmes textes), en plus des témoins de design. C'est celui-là qui donne un triptyque par mode.

### Ce que l'agent doit savoir (tranché seul la première fois, écrit maintenant)

- **Typographie par écran = zéro CSS à la main** : `tokens.pqr.css` porte les `@media`, `components.pqr.css`
  référence `var(--pqr-typography-…)`. Une molécule dont seul le texte change par écran n'a **aucune** feuille
  `responsive/`. Vérifier avant d'en créer une.
- **L'extraction ne reconnaît pas un texte lié aux variables SANS style** (body : il n'y a pas de style Figma) : elle
  minte `imported.<set>.<part>.font-size.<mode>`. Renommer à la main vers `typography.body.size` /
  `line-height`, graisse vers `font.weight.<x>`. H2 / H4 (styles avec marqueur) sont reconnus.
- **Composeur de pages** : la clé `rows` (liste `{titre, contenu, etat}`) remplit les lignes d'accordéon
  (Texte SEO, FAQ) et pose l'état ouvert/fermé dans le DOM — ajoutée le 2026-09-07 dans `compose_page.py`.
- **Instance pilote** : `docker exec piqueray-odoo-pilote-odoo-1 odoo -d piqueray_pilote -u piqueray_ds
  --stop-after-init` puis `docker restart piqueray-odoo-pilote-odoo-1`. Un `odoo shell` exige
  `--db_host=db --db_user=odoo --db_password=odoo`. Le test d'édition (`edit-*.mts`) lit `.env.example` : passer
  `PQR_ODOO_PORT=8087 PQR_DB_NAME=piqueray_pilote` ; le rédacteur `editor@example.test` existe déjà ; **remettre le
  texte d'origine** après le test pour ne pas polluer la page de mesure.
- **Mesurer une molécule dans un parent encore v1** (gouttière fixe 89) : choisir des viewports qui donnent la
  largeur témoin **et** restent dans la bande de breakpoint — 520 → 342 (Mobile), 916 → 738 (Tablette), 1266 → 1088
  (Desktop), 1728 → 1550. `capture-accordion.mts <base> <out> 520 916 1266 1728` puis `mesure-bloc.mjs` par mode.
- **Ce qu'un seul agent peut faire** : déployer sur le pilote (pas d'autre agent dessus), **jamais** `npm run eval`
  (deux evals dans le même worktree se faussent), jamais le verrou/digest (`odoo:inputs:check` reste rouge, attendu).
- `core/samples/*.inline.tsx` périmés (depuis 033) bougent sous `emitters:check` : attendu, à signaler, pas à corriger.
- Le `trigger` d'une ligne dont le titre se replie ne couvre que la première ligne : limite nommée, à trancher au
  contrat, pas au canevas.

### Ajouts du 2026-09-07 après-midi (agents TexteSEO et Hero, orchestrateur)

- **`arch_db` est un champ TRADUIT.** Le composeur n'écrivait que `en_US` ; dès que l'éditeur a enregistré une page
  sous la langue du site (`fr_BE`), la page servie restait celle d'AVANT la recomposition, en silence. Corrigé dans
  `compose_page.py` (écriture dans toutes les langues installées). Symptôme à reconnaître : « j'ai recomposé, rien ne
  change à l'écran ».
- **`-u piqueray_ds` exige les identifiants** : `docker exec <odoo> odoo -d <base> --db_host=db --db_user=odoo
  --db_password=odoo -u piqueray_ds --stop-after-init`. Sans eux : « no password supplied », et la composition qui
  suit se fait sur l'ancien gabarit sans le dire.
- **Rangée → colonne par script** : remettre `layoutSizingVertical = 'HUG'` sur le cadre ET ses enfants (un
  `colGauche` passé FILL/FILL a mesuré 6988 px). Relever après, dans un appel séparé.
- **Un port de la plage peut être repris en cours de journée** par un serveur figma-console d'une autre session
  (repli de port) : le `POST` du dump arrive sur le mauvais process (404) sans erreur côté plugin. Vérifier
  `/health` juste avant (un figma-console répond `{"status":"ok","version":…}`, un receveur répond `{"instrument":…}`).
  Repli : `return dumps` par le résultat de `figma_execute` (≈ 20 Ko) et écriture à la main.
- **Le voile d'un hero se juge sur une photo CLAIRE** (chaque page a la sienne), jamais sur la photo de démo du
  master. Poser le duel sur la photo de la page de référence, avec ses textes réels.
- **Un fichier étranger peut apparaître dans le worktree** (`v9.js`, bundle Embla, 2026-09-07 11:07, d'aucun agent
  de la journée) : le signaler, ne pas le supprimer, ne pas le committer.
- **L'asset image d'une page Odoo est l'image D'ORIGINE du paint Figma** (`getImageByHash(hash)` → taille native via
  `getSizeAsync`, export d'un cadre temporaire à cette taille), jamais un cadre exporté : un cadre 1728 recadré puis
  recadré à nouveau par `object-fit: cover` a donné 11–13 % d'écart pur cadrage ; avec l'original, `cover` centré =
  FILL centré, 0,9 à 3,5 % de résidu de lissage (Hero, 2026-09-07).

## Complément du 2026-09-08 — Formulaire (section avec un `<form>` natif Odoo, option 2)

Premier bloc dont la mécanique n'est pas à nous : le contrat gouverne l'apparence et les états, Odoo (`s_website_form`)
envoie. Chaque point a coûté un aller-retour.

- **`FORMULAIRE_EDITABLE_PARTS` dans `authoring.js` est un MIROIR de la config d'authoring, et aucune porte ne le vérifie.**
  Sans lui, le QWeb pose `o_pqr_editable` mais la politique ne pose jamais `o_editable` : tout le bloc reste
  `contenteditable=false`, le rédacteur ne peut rien toucher — et `odoo:authoring:check` + `odoo:module:check` sont verts.
  Seul le test d'édition (étape 9) le voit. Ajouter à l'étape 3 : `<ROOT>_EDITABLE_PARTS` (+ `<ROOT>_RICH_TEXT` si gras),
  agrégés dans `PIQUERAY_REOPENED` et `PIQUERAY_RICH_TEXT`.
- **Le test d'édition doit lire `textContent`, pas `innerText`** : un sur-titre en `text-transform: uppercase` rend
  « (ÉDITÉ) » par `innerText` et le verdict passe à PERDU à tort.
- **`form.s_website_form` sur la balise `<form>` elle-même**, jamais sur un ancêtre : les panneaux natifs « + champ »
  ne se branchent pas, la structure reste gouvernée. `action="/website/form/"`, `data-model_name="mail.mail"`, un
  `email_to` caché (signé HMAC au rendu, un `website_form_signature` s'ajoute), `span#s_website_form_result` OBLIGATOIRE
  et **`hidden` au repos** (vide, il ajoutait 32 px de gap flex), déclencheur `<a role="button" class="… s_website_form_send">`.
- **Les états sont observés, pas calculés** : une `Interaction` avec `MutationObserver` reflète `o_has_error`/`is-invalid`
  et `#s_website_form_result.text-success|danger` dans les classes d'état du contrat, pose `aria-invalid`, focalise le
  résumé (patron GOV.UK) et cache la ligne générique d'Odoo. Elle ne valide rien, n'envoie rien.
- **Un titre de section est `element: h2` au contrat.** Le `<h2>` du gabarit héritait la marge basse de Bootstrap
  (8 px) et faisait +8 px en 390/834 ; déclarer l'élément au contrat suffit, l'émetteur remet la marge UA à zéro.
- **Mesurer le comportement, pas seulement la boîte** : `.page-parity/vague-036/comportement-formulaire.mts` (envoi vide →
  états ; envoi plein → ligne verte + `select count(*) from mail_mail` +1 ; axe-core aux trois états). Sans SMTP, l'état
  `exception` est ATTENDU sur le pilote — ce n'est pas un défaut du bloc.
- **axe-core sur le bloc à chaque état** (`axe-core` en devDependency) : a trouvé un contraste 2,23:1 sur les liens
  orange du résumé, invisible à toute autre porte. Un contraste vient de Figma → décision owner → source d'abord (§VIII).
- **Le registre d'adaptations refuse un `mechanism` hors énumération** (`adaptation-registry.schema.json`) : ajouter la
  valeur au schéma AVANT `npm run build`, sinon `odoo:derivation` est rouge pour tout le monde dans le worktree.
- **Un résumé d'erreurs se teste APRÈS correction partielle, pas seulement à vide** : l'owner a trouvé à la main que les
  deux liens restaient après correction d'un seul champ. Chaque lien du résumé suit son champ (`href="#<id du contrôle>"`,
  `hidden` sinon) ; l'instrument de comportement enchaîne vide → un champ corrigé → plein.

## Complément du 2026-09-08 (soir) — Sous-menu desktop : la proposition Figma AVANT le contrat

Premier composant de ce dépôt dont la source Figma n'existait pas : la barre (`ds.header` 3.0.0) dessine le chevron,
le menu mobile (`ds.menu-entree`) dessine des sous-entrées, mais **aucun panneau de sous-menu desktop/wide n'a jamais
été dessiné** (vérifié sur le canevas vif : `NavItem`, `VoileNavigation`, rien d'autre). Odoo sert donc le déroulant
Bootstrap par défaut depuis la spec 022 (FR-009, différé nommé) — panneau blanc, entrée active en violet Odoo.
L'ordre §VIII s'applique dans ce cas aussi : **on dessine la source d'abord, puis on contracte, puis on projette** —
jamais un CSS Odoo « en attendant » qui deviendrait la référence par défaut.

- **Ce qui a été posé** : page `031 · Planches de validation`, section `031 · 22 · SOUS-MENU DESKTOP — ds.sous-menu
  (proposition · 3 options · 2026-09-08)` (`2793:49079`, à −12000 / 59700, sous Formulaire). Six cadres de démo
  (Wide 1728 + Desktop 1200 par option) : instance du Header 031 sur la photo du hero + voile, parent « Portes de
  garage » en état ouvert (libellé orange, chevron retourné), panneau posé sous la barre, texte des sous-entrées
  aligné sur le libellé du parent. Rien du DS existant n'a été touché : seule une section neuve a été créée.
- **Les trois options** — A « Rail » (le minimum : trois liens, rail orange 2 px + retrait 22 = le menu mobile ;
  recommandée pour trois liens) · B « Rail + repères » (une ligne d'aide par lien en bleu-gris + un lien « Toutes nos
  portes de garage ») · C « Bandeau pleine largeur » (colonne d'intro + trois colonnes avec photo des catégories ;
  plus lourd, à réserver si le catalogue grandit). Vocabulaire strictement existant : `color/noir-bleute`, `blanc`,
  `orange`, `blanc-14`, `bleu-gris` ; `space/2·4·12·16·24·32·48` ; `border-width/1` ; styles de texte « Sous-entrée
  menu » (18/27) et « Paragraphe » (14/24). Aucun jeton neuf, aucun littéral hors la gouttière 89 de Wide (celle du
  Header) et le retrait 22 du rail (celui de `MenuEntree`, non lié à une variable là non plus — à lier à la source).
- **Règles d'interaction proposées, à porter côté Odoo quand l'owner aura choisi** : ouverture au CLIC (pattern
  « disclosure » : bouton + `aria-expanded`, liste de liens, Échap et clic dehors ferment, **pas de `role="menu"`**),
  jamais au survol seul (NN/g : déclenchement accidentel, inexistant au tactile). Le parent qui a une page se rend
  joignable par le lien « Toutes nos … » dans le panneau (B, C) — Odoo force `url='#'` sur une entrée qui a des enfants
  (`ODOO-LIMIT-MENU-PARENT-HREF`, spec 037). États : parent ouvert = orange + chevron haut ; sous-entrée repos blanc,
  survol orange, page courante orange + soulignement 2 px.
- **La suite, dans l'ordre du runbook** : l'owner choisit (ou corrige) une option sur la planche → l'orchestrateur
  en fait un set propre (`SousMenu`, variantes par état, rail et retrait liés aux variables, `MenuEntree` idem) →
  dump + `extract:figma` → contrat `ds.sous-menu` (molécule, pas d'axe présentation ; ce qui change entre Desktop et
  Wide passe par des jetons par écran) → `header.xml` remplace le `dropdown-menu` Bootstrap par le gabarit gouverné,
  `menu_mobile_interaction.js` sert de modèle pour la bascule → portes A5 + test clavier (Tab, Entrée, Échap).
- **Ce que cette soirée a coûté et qui est maintenant en A6** : l'export à 149 octets des nœuds en section
  (`useAbsoluteBounds`), deux receveurs fantômes sur 9228/9230, la rotation non surchargeable dans une instance,
  `setCurrentPageAsync`, et 45 Ko de base64 renvoyés dans un retour d'outil au lieu du receveur.

### Suite du même soir — option A retenue, portée de bout en bout (journal `specs/tiny/vague-031/sous-menu.md`)

- **Fait dans l'ordre du runbook, en une session** : sets propres `SousEntree` (Etat Repos|Actif) + `SousMenu` sur la
  planche · dump (0 dégradation) · extraction (0 non lié) · contrats `ds.sous-entree` / `ds.sous-menu` 1.0.0 · racine
  **shell** côté Odoo (`repo-data.ts`, comme le menu mobile — sans quoi la fermeture CSS n'est pas émise) · gabarit
  `piqueray_ds.sous_menu` + `sous_menu_interaction.js` + `responsive/sous-menu.pqr.css` · miroirs, repin, figma:plan,
  catalogue, reçu, golden · sonde sur l'instance qui monte CE worktree (8109 ; le pilote 8087 montait un autre worktree —
  **vérifie les montages `docker inspect` avant de déployer**, sinon tu mesures un addon qui n'est pas le tien).
- **Un cadre créé par API a `strokesIncludedInLayout = true`** : le filet de 1 px ajoute 2 px à la boîte Figma alors que le
  CSS border-box la garde — 252×190 contre 250×188, invisible au dump (le drapeau n'y est pas). Corrigé à la source ; le
  contrat ne change pas. Regarde ce drapeau sur tout set dessiné par script.
- **Une zone manuelle ne s'imbrique pas dans une autre** : `odoo:derivation:check` refuse « ODOO-031-… dans
  ODOO-022-… ». Un ajout dans un gabarit déjà zoné se fait dans un gabarit à part, appelé par `t-call`.
- **Le rapport de dérivation est signé** : toute édition d'un fichier zoné après `npm run build` le rend « tampered » —
  rebuild avant `odoo:derivation:check`.
- **Un pattern disclosure sur la barre = `<button class="nav-item">`** : les classes générées de `ds.nav-item` s'appliquent
  quel que soit l'élément ; seul l'habillage natif du bouton est à retirer (feuille responsive). `aria-current="page"`
  sur un bouton est licite.
- **Le survol/l'actif d'une sous-entrée sont des canaux de PART** (`states.hover.color` sur `texte`) : l'émetteur les
  rend sous `.sous-entree:hover .sous-entree__texte` — rien à écrire côté Odoo.
- **Mouvement, les repères qui tiennent (2026-09-08)** : entrée < 300 ms, décélération franche (Material 3
  « emphasized » `cubic-bezier(0.2, 0, 0, 1)`), translation petite (4–12 px), sortie plus courte ou instantanée, jamais
  d'ease-in à l'entrée, `prefers-reduced-motion` toujours. **Bootstrap offcanvas pose `showing` PUIS `show`** : une
  animation d'enfants keyée sur `show` seul ne part qu'à la fin du fondu (deux apparitions, mesuré) — keyer sur les deux
  classes avec la même déclaration. Un plan `hidden` s'anime à l'entrée avec `@starting-style` (sortie instantanée), pas
  besoin de JS. Sondes : `.page-parity/sous-menu/{mobile,desktop}-anim.mts` (relevé toutes les 25–30 ms).
- **Une erreur de page n'est à toi que si elle n'existe pas AVANT** : `TypeError … querySelector` au chargement était
  identique sur le pilote non touché. Compare toujours avec une instance d'avant avant d'accuser ton script.

## Complément du 2026-09-09 — Réassurances Desktop : la photo trop haute, proposition Figma AVANT le contrat

- **Le défaut et sa cause, mesurés sur le canevas** : le passage du bureau à 4 colonnes (2.2.0, 2026-09-08) a fait tomber
  la carte de 341 à 248 px, mais la variable `spacing/carte-reassurance/photo-h` en mode Desktop est restée à 364. Même
  valeur, autre proportion : 248 × 364 est un portrait 2:3 quand le Wide fait 284 × 364 (≈ 4:5) et le Mobile 342 × 192.
  **Un jeton par écran survit à un changement de colonnes sans que rien ne le signale** — quand une grille change de
  compte, relire chaque hauteur fixe des enfants.
- **Le débordement de texte est Figma-seulement** : la rangée de la grille est FIGÉE à 561 (mesurée pour 341 de large) ;
  à 248 le texte se replie plus et sort. Le site a `grid-auto-rows: 1fr`, pas ce défaut.
- **Planche posée** : `031 · 24 · RÉASSURANCES DESKTOP — hauteur de photo (proposition · 3 options · 2026-09-09)`
  (`2798:54146`, cadre auto-layout à −12000 / 67000, sous la 031 · 23) : « Aujourd'hui » (instance intacte, le
  débordement visible) puis A 4:5 (310), B carré (248, recommandée), C 4:3 (186). Copies DÉTACHÉES, la section et les
  masters n'ont pas été touchés. Suite si l'owner tranche : la valeur Desktop de la variable → un primitif
  `size.carte-reassurance.photo-h.<N>` minté from-dump + `tokens/modes/viewport.desktop.tokens.json` (l. 190) ; la
  rangée du master `Presentation=Desktop` en HUG ; `ds.carte` bump patch/mineur + les CINQ miroirs Odoo ; `figma:plan`.
- **Trois faits d'API corrigent le journal `carte-reassurance.md`** (vérifiés par sonde, 2026-09-09) :
  (1) **`gridRowSizes` EST scriptable** (`items.gridRowSizes = [{type:'HUG'}]` ou `{type:'FIXED', value}` — accepté sur
  une instance comme sur un cadre) ; le journal du 2026-09-02 disait le contraire.
  (2) **Redimensionner un cadre imbriqué DANS une instance échoue en silence** (`resize` rend 364 → 364, aucune erreur,
  même après `setBoundVariable('height', null)`) — pour une démo, détacher l'instance ET les instances imbriquées
  (les cartes), puis redimensionner.
  (3) **Un cadre de premier niveau sur la page 031 s'exporte normalement** avec `figma_capture_screenshot` (472 Ko) —
  les 149 octets ne frappent que les nœuds posés DANS une SECTION ; d'où le choix du cadre auto-layout pour toute
  planche (mémoire `figma-section-vs-frame-coordonnees`), qui évite en plus le receveur. Ce jour-là, **aucun port de
  la plage 9223-9232 n'était libre** (8 serveurs figma-console + 2 receveurs fantômes du 09-08 sur 9228/9230).

## Complément du 2026-09-09 — un réglage d'apparence par écran (voile du Hero image, Mobile/Tablette)

Le plus petit job possible du runbook — aucune anatomie, aucun prop, deux peintures sur deux variantes —
et il a quand même payé quatre pièges qui valent pour tous les autres.

- **Une valeur qui ne vaut que pour certains écrans se pose à la BASE et se re-pose par mode pour les
  autres.** La base d'un contrat = Mobile (mobile-first) ; `tokensByProp` / `literalsByProp` portent les
  modes qui gardent l'ancienne valeur. **Corollaire Odoo, facile à oublier tant que les quatre modes sont
  identiques** : `components.pqr.css` émet `.<bloc>--presentation-desktop …`, **qu'aucun QWeb ne pose** —
  donc dès que la base diverge, la zone manuelle `responsive/<bloc>.pqr.css` doit recopier la règle dans
  son `@media (min-width: 992px)`, sinon le desktop hérite silencieusement de la valeur mobile.
- **`figma.variables.setBoundVariableForPaint` ne mute pas le paint : il en retourne un nouveau.**
  Écrire `figma.variables.setBoundVariableForPaint(s, 'color', v); node.fills = [s, …]` pose la bonne
  couleur avec `boundVariables` VIDE — la peinture cesse de chevaucher le jeton et rien ne le dit.
  Toujours relire `node.fills[i].boundVariables` après le geste.
- **`instance.overrides` ne répond pas « cette instance surcharge-t-elle CE nœud »** : il liste tout le
  sous-arbre. 40 des 45 instances du Hero portaient un override `fills` — c'était la PHOTO du
  `Background`. La bonne question est `i.overrides.find(o => o.id === <id du nœud visé>)`.
- **Mesurer sans `--out` neuf peut lire une capture Odoo périmée** : 13,10 % au premier passage, 3,61 %
  au second, même page, même minute. Et `odoo:pages:measure` **écrit dans les reçus committés de la
  spec 037** — donc une mesure de contrôle se fait toujours avec `--out` vers un dossier jetable.
- **Un port de la plage 9223-9232 peut porter deux serveurs à la fois** (une socket IPv4, une IPv6) :
  `curl localhost` en touche un, le plugin l'autre, et un POST peut disparaître dans le mauvais. Vérifier
  `lsof -nP -iTCP:<port> -sTCP:LISTEN` (deux PID = piège) et ne jamais tuer un process sans savoir à qui
  il est. Pour rejouer un script du dépôt dans le bac à sable : le servir en HTTP puis
  `new (Object.getPrototypeOf(async function(){}).constructor)('return (\n' + src + '\n)')` — le
  `'return ' + src` seul rend `undefined` par ASI dès que le script commence par un commentaire.
- **Un duel d'apparence se juge sur la photo de la page réelle** (règle du 2026-09-07, re-payée) : la
  planche a été posée sur « Portes de garage », maison blanche plein cadre, puis **supprimée** après
  décision. Le journal garde le tableau des options mesurées ; le canevas ne garde rien.

Journal complet : `specs/tiny/vague-031/voiles-hero.md` (§ Suite du 2026-09-09).

## Complément du 2026-09-09 — Hiérarchie des CTA : proposition Figma AVANT le contrat (3 options, aucun style neuf)

- **Le constat, relevé sur la home 031** : trois sections posent le même Outline noir — Produits e-commerce (« Voir les
  produits »), Réassurances (« Contactez-nous »), Avis Google (« Voir tous les avis ») — pour deux intentions
  différentes (navigation vs conversion). Présentation et les cartes disent déjà la bonne chose avec le style **Link**.
  La règle proposée n'invente rien : conversion = Default (noir plein) / Outline blanc sur photo ; action secondaire =
  Outline ; navigation « voir plus » = Link + flèche. Planche : `031 · 25 · HIÉRARCHIE DES CTA` (`2798:54491`, cadre
  auto-layout à −12000 / 71200, sous la 031 · 24), quatre rangées Wide 1728 + Mobile 390 : Aujourd'hui, A (lien en
  place, recommandée), B (A + Réassurances en noir plein), C (A + lien en pied de section). A et B sont des instances
  des sets 031 avec surcharges ; C et le Réassurances de B sont détachés. Aucun master touché.
- **Orange est écarté par la mesure, pas par goût** : blanc sur `color/orange` (#f98a0b) ≈ 2,5:1, sous les 4,5:1 du AA
  pour un libellé de 16 px. Le style existe dans le DS ; il ne peut pas porter ce libellé-là.
- **Défaut de source trouvé en passant (§VIII)** : dans le set `Reassurances` 031, le « Contactez-nous » n'est PAS une
  instance du Bouton mais un cadre dessiné (`BoutonCinqCartes`), en Wide comme en Mobile — alors que `ds.reassurances`
  2.2.0 le déclare `ds.button`. À remettre en instance à la source avant tout contrat, quelle que soit l'option.
- **`setProperties` sur une instance imbriquée MASQUÉE la rend visible** (vérifié : master Mobile `visible=false`,
  l'instance surchargée passe à `true` sans qu'on l'ait demandé). Le master Mobile de ProduitsECommerce porte deux
  boutons (en-tête masqué + conteneur pleine largeur) : après une surcharge de style, re-poser `visible = false`, sinon
  le lien apparaît deux fois.
- **Un cadre auto-layout créé par script puis `resize()` retombe en FIXED sur l'axe principal** : après avoir ajouté les
  enfants, poser `layoutSizingVertical = 'HUG'` sur la colonne ET sur la rangée — sinon la planche fait 10 px de haut
  et l'export montre un fond noir avec les instances qui débordent.
- **Ce que coûte chaque option si l'owner tranche** : A = valeur par défaut du bouton imbriqué dans 2 contrats (patch)
  + les cinq miroirs Odoo (§ « le CINQUIÈME miroir ») ; B = A + `ds.reassurances` (3 contrats) ; C = anatomie de 2
  contrats (mineur) + `responsive/*.pqr.css`. Dans tous les cas : corriger la source Réassurances d'abord, puis dump,
  extraction, contrat, miroirs, `figma:plan`, mesure — l'ordre du runbook, pas un CSS Odoo « en attendant ».
- **Tranché le même matin — option B (carré) posée sur le canevas, planche retirée.** Variable
  `spacing/carte-reassurance/photo-h` mode Desktop 364 → **248** ; rangées de grille en **HUG** sur le master
  `Presentation=Desktop` (2 rangées) ET sur ses 6 instances de vues (elles portaient une surcharge `FIXED:561` qui aurait
  survécu au master). Versions nommées avant et après. **Preuve sans receveur** : `exportAsync` dans le bac à sable +
  empreinte FNV-1a sur les octets, gardée dans `globalThis` entre deux `figma_execute` — 35 cibles (4 masters + 31
  instances) ; les **26** cibles Mobile/Tablette/Wide sont **identiques à l'octet**, les 8 Desktop ont changé et seulement
  elles. Résultat à 1200, 4 cartes : carte 526 (au lieu de 561 figé), section 752 (au lieu de 787) — plus aucun débordement.
  Deux pièges de plus : (4) **cloner une instance perd sa surcharge de rangées** (`HUG` → `FLEX:1` sur la copie, cartes
  coupées à 485) — un clone témoin doit re-poser la surcharge avant capture ; (5) **une autre session travaillait dans le
  fichier en même temps** (deux instances `2798:5xxxx` nées puis disparues entre l'AVANT et l'APRÈS) — l'empreinte doit
  tolérer une cible DISPARUE et la nommer, jamais l'ignorer. **Côté dépôt, rien n'est fait** : `tokens/modes/viewport.desktop`
  (l. 190) pointe encore `photo-h.364`, le primitif `photo-h.248` n'existe pas, `ds.carte` n'a pas bougé — c'est la
  prochaine étape du runbook (jeton, contrat, cinq miroirs, `figma:plan`, mesure Odoo).

### Suite du même jour — option A retenue (e-commerce + Avis Google SEULEMENT), source posée, planche supprimée

- **Périmètre tranché par l'owner** : « Voir les produits » et « Voir tous les avis » en Link + flèche, rien d'autre —
  le « Contactez-nous » de Réassurances (cadre dessiné, pas une instance) reste tel quel, à traiter à part.
- **Geste, dans l'ordre §X** : version nommée « Avant 031·25 option A » → export des 8 variantes (`useAbsoluteBounds`)
  vers le receveur 9230 de CE worktree (celui de la spec 037, encore vivant ; noms préfixés `cta-avant-`, fichiers
  déplacés ensuite) → `setProperties({Style:'Link','Icone droite':true})` sur les **12** boutons des deux sets
  (ProduitsECommerce en porte 2 par variante : en-tête + conteneur pleine largeur, l'un des deux masqué selon l'écran ;
  AvisGoogle 1) en RE-POSANT la visibilité lue avant → 60 instances relues sur tout le fichier, aucune surcharge de
  style, toutes en Link → export `cta-apres-` → planche `031 · 25` supprimée → version « Après 031·25 option A ».
  Reçus : `specs/tiny/proofs/cta-hierarchie/cta-{avant,apres}-<Set>-<Ecran>.png` (16 fichiers).
- **Ce que ça change de mesurable, à retrouver dans le contrat** : le bouton passe de 54 à 30 de haut, donc les
  sections raccourcissent (produits Wide 522 → 518, Mobile 454 → 430 ; avis Wide 493 → 469, Mobile 1755 → 1731).
  En Mobile/Tablette le conteneur pleine largeur garde son bouton en FILL : le libellé du lien se centre dans la
  largeur — c'est la boîte du master, pas un choix neuf. En Desktop les DEUX boutons portent `visible=true` mais le
  conteneur n'est pas rendu (son parent est masqué) : à relire au dump avant de modéliser.
- **Aucun port libre dans 9223-9232 ce jour-là non plus** : 9230 était le receveur 037 (vivant depuis le 09-08, `/health`
  le nomme et pointe un dossier de ce worktree) — utilisé sans le tuer, avec des noms qui ne peuvent pas entrer en
  collision avec les vues 037, puis les fichiers déplacés. Un receveur qu'on n'a pas lancé se lit à `/health` avant
  tout POST et ne se tue jamais.
- **Suite (« le reste », à voir avec l'owner)** : `parity/snapshots/figma-components.json` est maintenant périmé pour ces
  deux sets ; puis dump → `extract:figma` → `ds.produits-ecommerce` 2.2.x et `ds.google-reviews` 3.1.x (valeur par
  défaut `variant: "link"` + `iconRight: true` du bouton imbriqué, description du changement) → les cinq miroirs Odoo,
  `inputs.lock.json --repin`, `figma:plan`, golden → recomposition des pages qui posent ces blocs (avis : les neuf ;
  produits : home, Motorisation) → mesure.
- **Côté dépôt, fait dans la foulée (même matin)** : primitif `size.carte-reassurance.photo-h.248` (from-dump),
  `viewport.desktop` → `.248`, `ds.carte` 3.1.0 → **3.1.1** (description seule : la part suit toujours le même jeton),
  33 épingles (`reassurances.authoring.json` 30, `figma-panels.json` 3), repin du verrou et **nouveau digest dans les
  quatre miroirs** (`version_guard.js`, `scan-saved-versions.ts`, `cases.json` ×2, `components.xml` ×16), `figma:plan`
  (`01-tokens.js`, `07-carte.js`, `batch-02.js`), catalogue, golden, reçu moteur. Variable primitive
  `size/carte-reassurance/photo-h/248` créée sur le canevas (miroir du jeton, scopes et codeSyntax copiés de la 364).
  **Cliché de parité mis à jour sans receveur** : le cliché local patché a la MÊME empreinte FNV que l'extraction vive
  (`JSON.stringify(collections)` dans le bac à sable : `3259b7c3` / 63 523) — `parity` vert, 19 acquittés inchangés.
  **Mesure Odoo (037, 8109, `/portes-residentielles`) = Figma aux quatre largeurs** : 390 → 1666, 834 → 1748,
  **1200 → 752 (carte 526, photo 248)**, 1728 → 799 — les mêmes hauteurs que les vues `Portes de garage résidentielles`.
- **Quatre pièges d'instrument, ce matin** : (6) `page.evaluate(() => …)` sous `tsx` lève `__name is not defined`
  (helper esbuild injecté dans le code envoyé au navigateur) — passer le corps en CHAÎNE ; (7) une sonde hors du dépôt
  ne résout pas `playwright-core` — la poser sous `.page-parity/` (gitignoré) ; (8) le `playwright-core` du dépôt attend
  Chromium **1228**, le cache n'a que **1243** — `PLAYWRIGHT_CHROMIUM_PATH` explicite ; (9) **une seconde base est apparue
  dans le conteneur 037** (`piqueray_pilote`, créée 07:13 UTC par une autre session) et toutes les pages sont tombées en
  404 (le piège 037) — sans toucher à sa base, ouvrir d'abord `/web/login?db=piqueray_037` pour lier la session, puis
  la page. **Deux sessions dans ce worktree** ce matin : leurs miroirs (digest) ont été réécrits par mon repin — c'est
  la mécanique attendue (le digest est global), mais elles doivent rebâtir avant leur `derivation:check`.

### Suite du même jour — le style Link en SemiBold au repos, pour tout le monde (décision owner)

- **La question de l'owner** : « ce CTA link ne devrait-il pas être plus gras pour tout le monde — c'est réutilisé ou pas ? »
  Réponse relevée sur le canevas : OUI, un seul style, `Style=Link` du set Bouton (`6:122`), posé dans 24 contextes
  (« Lire la suite » ×204, « Contactez-nous » des cartes de catégorie, « En savoir plus », brochures, « Voir les
  produits », « Voir tous les avis »…). Son libellé portait le style de texte **« Libellé bouton » (Medium 16), le même
  que TOUS les autres styles du Bouton** — donc « plus gras pour le lien » ne peut pas passer par ce style-là.
- **Le geste, sans dégradation (piège A6 « poser une graisse détache du style »)** : un style de texte DÉDIÉ
  « Libellé bouton lien » copié champ par champ depuis « Libellé bouton » (SemiBold, `fontSize` re-lié à
  `typography/button/size` par `setBoundVariable` sur le STYLE, textCase UPPER, interligne 22, description datée),
  puis `setTextStyleIdAsync` sur le libellé des variantes Link Repos / Actif / Focus. Survol inchangé (« Libellé bouton
  survol », SemiBold + soulignement) : le lien perd le changement de graisse au survol, garde soulignement + noir pur.
  Vérifié après : `fontSize` lié, `fills` lié (couleur d'état), largeur 155 → 156.
- **`textNode.boundVariables.fontSize` est un TABLEAU** (`[{type, id}]`), pas un objet : `.id` dessus rend `undefined`,
  `getVariableByIdAsync(undefined)` rend `null`, et le script plante APRÈS la première mutation. Lire `fs[0].id`.
  Un script qui plante à mi-course laisse un état intermédiaire (ici : style créé + 1 variante sur 3) — relire l'état
  avant de relancer, jamais relancer à l'aveugle.
- **Trouvé par le contrôle global, invisible autrement** : 468 instances Link hors survol, 428 suivaient. Les 40 autres
  = les « action » des cartes de `CategoriesPrincipales` dans les vues démo de CINQ pages (Résidentielles, Motorisation,
  Portes d'entrée, SAV, Industrielles ; 2 par instance × 4 vues × 5 pages) : libellé **détaché de tout style**, Medium,
  et en Wide **taille 18 en dur, non liée** — un texte re-saisi avec mise en forme à la construction des vues (spec 037).
  Re-liés au style par `setTextStyleIdAsync` sur le texte de l'instance (une surcharge d'instance qui, elle, prend) :
  40/40, caractères inchangés, taille re-liée. Contrôle final : **468/468**. Leçon : après tout geste sur un style
  partagé, compter les instances qui suivent — un libellé détaché ne se voit pas, il se compte.
- **§X tenu** : versions nommées « Avant/Après Link SemiBold », exports `lien-{avant,apres}-*` (4 variantes + 8 contextes)
  et `catprin-{avant,apres}-<vue>` (20 instances touchées), tous non vides, rangés dans
  `specs/tiny/proofs/cta-hierarchie/`. Receveur 9230 (037) réutilisé comme le matin, sans le tuer.
- **Suite côté dépôt (« le reste »)** : `ds.button` — `tokensByProp.variant.link["font-weight"] = "{font.weight.semibold}"`
  (le jeton existe) + `typography.etat.link.graisse-survol` reste semibold (le survol ne change plus de graisse) ; bump
  patch/mineur du Bouton = **264 épingles Odoo** + les cinq miroirs (§ « le CINQUIÈME miroir ») + `version_guard`,
  `scan-saved-versions`, fixture `version-drift`, `figma-panels.json`, `golden:update` après le dernier build. Puis les
  deux contrats de l'option A. Cliché `figma-components.json` à rafraîchir AVANT `parity`.

### Suite du même jour — Presentation : le « En savoir plus » n'était une instance du Bouton qu'en Wide

- **Signalé par l'owner** sur l'instance `Presentation=Desktop` d'À Propos (« pourquoi lui n'utilise pas le bon CTA ? »).
  Relevé : dans le set `Presentation` (`2693:20805`), Mobile / Tablette / Desktop portaient un cadre « Bouton »
  DESSINÉ (iconLeft + label + iconRight, texte libre Medium 16 **sans style de texte**, taille liée au primitif
  `font/size/16` au lieu de `typography/button/size`) ; seule Wide portait l'instance `Style=Link`. Le SemiBold posé
  sur le style Link ne pouvait donc pas l'atteindre — c'est ainsi que le défaut s'est vu.
- **Correction à la source** (§VIII, versions « Avant/Après Presentation », exports `pres-{avant,apres}-<Écran>` dans
  `specs/tiny/proofs/cta-hierarchie/`) : instance du Bouton `Style=Link` « En savoir plus » + flèche insérée au même
  index du `wrapper`, dimensionnement repris du cadre (FILL quand le cadre centrait en pleine largeur, HUG sinon), cadre
  supprimé. 16 instances du set relues : 16/16 portent l'instance, 0 cadre restant. Hauteurs : Mobile 544 → 520,
  Tablette 394 → 370 (le cadre faisait 54, un Link fait 30), Desktop et Wide inchangés.
- **Balayage de TOUS les sets de la page 031** (texte de CTA hors instance du Bouton) : il ne reste que le
  « Contactez-nous » de `Reassurances` (`BoutonCinqCartes`, 4 variantes, sans style, 18 en dur en Wide) — déjà nommé
  deux fois ce jour, non touché faute de décision owner. Règle qui en sort : **avant de toucher un style partagé, balayer
  les textes de CTA hors instance** — un CTA dessiné ne suit ni le style, ni la taille responsive, ni le contrat.

## Complément du 2026-09-09 — Équipe : changer un compte de colonnes (Desktop 3→4, Wide 4→5), le plus court chemin complet

Journal : `specs/tiny/equipe-v2/equipe.md` (§ 2026-09-09). Le job entier — source, contrat, miroirs, mesure — tient
en une heure quand la source est propre ; ce qui suit est ce qu'il faut savoir pour qu'il tienne la prochaine fois.

- **Un compte de colonnes se change à la SOURCE en un champ** : `gridColumnCount` sur la grille du master ; Figma
  recompte les rangées tout seul et garde `HUG`. Relire ensuite les INSTANCES : si aucune ne surcharge la grille
  (`i.overrides.find(o => o.id === grid.id)` vide), elles suivent. Preuve §X sans receveur ni capture d'écran :
  empreinte des cibles NON visées identique à l'octet, seules les cibles visées changent.
- **Quand une grille change de compte, relire chaque hauteur fixe des enfants** (leçon Réassurances du même jour).
  Ici la carte est `aspectRatio 1` + `width: fill` : rien à relire, la carte suit. C'est le cas facile — le vérifier
  reste obligatoire.
- **Une rangée orpheline est un fait de dessin, pas un défaut de code** : 16 cartes sur 5 colonnes laissent une carte
  seule. Le dire à l'owner avec la capture ; ne pas « corriger » en CSS.
- **`parity` ne regarde PAS le nombre de colonnes** : le cliché `figma-components.json` ne porte ni `gridColumnCount`
  ni `columns`. Un `layoutByProp.columns` peut diverger du canevas sans qu'aucune porte rougisse — la seule preuve est
  la mesure (planche contre bloc) et l'empreinte avant/après.
- **`odoo -d <base> -u …` avec un mauvais nom de base CRÉE la base** et fait tomber toutes les pages du conteneur en
  404 « No database is selected ». Lire la liste des bases (`psql -U odoo -d postgres`) avant le `-u` ; l'instance
  `piqueray-odoo-037` est sur **`piqueray_037`**, seul le pilote est sur `piqueray_pilote`. Si c'est fait :
  `DROP DATABASE … WITH (FORCE)` après avoir vérifié la date de création et le compte de modules.
- **Les outils de mesure hors git disparaissent avec leur worktree** (`.page-parity/equipe-v2/tools/` n'existait plus
  nulle part). Un outil de mesure qui a servi à prouver un chiffre committé devrait vivre dans le dépôt ; en attendant,
  `.page-parity/equipe-colonnes/mesure-equipe.mjs` est la version réécrite (capture clippée, refus de boîte dégénérée,
  sonde, triptyque, `X-Odoo-Database` en option).

### Suite du même jour — Réassurances remis en instance, puis contrats et Odoo (option A + Link SemiBold), sans eval

- **Réassurances** : même protocole (versions « Avant/Après Reassurances », exports `rea-{avant,apres}-<Écran>`) — le cadre
  `BoutonCinqCartes` remplacé par une instance `Style=Outline noir` « Contactez-nous » + flèche, même index, même
  dimensionnement (FILL sous 992, HUG au-dessus). **Les 4 exports avant/après sont identiques à l'octet** (`cmp`) : le
  cadre dessiné rendait exactement le style du DS ; la marge 24 de Mobile/Tablette n'était pas visible (contenu centré
  en pleine largeur). 28 instances suivent. Plus AUCUN texte de CTA hors instance du Bouton sur la page 031.
- **Cinq contrats, tous en patch** : `ds.button` 2.4.1 (`tokensByProp.map.link.font-weight = font.weight.semibold`),
  `ds.produits-ecommerce` 2.2.1 (3 parts Bouton/BoutonWide/BoutonPied → link + iconRight), `ds.google-reviews` 3.1.2
  (`ecrireAvis` → link + iconRight), `ds.presentation` 4.2.1 et `ds.reassurances` 2.2.1 (descriptions : le fait
  code-only disparu avec le cadre dessiné). Deux feuilles Odoo allégées d'autant : `responsive/presentation.pqr.css`
  (plus de `padding-block: 16` sous 992 ni de `padding-block: 4` au-dessus — c'est le style link) et
  `responsive/reassurances.pqr.css` (plus de `padding-inline` 24/32 — c'est le style outline).
- **Les miroirs, mécaniquement** : 275 épingles `ds.button` dans 14 `*.authoring.json` + 146 avis + 85 produits +
  22 présentation + 91 réassurances ; `figma-panels.json` (7) ; `components.xml` (5 versions + **16 digests**, que
  la dérivation n'écrit PAS — miroir manuel) ; `version_guard.js` et `scan-saved-versions.ts` (4 versions + digest) ;
  fixture `version-drift` (1 version + 2 digests). Ordre tenu : épingles → `check-inputs --repin` (digest
  `a283f37e…` → `874da6c2…`) → digests → `build` → `figma:plan` → `catalog` → `emitters:check` → `golden:update` →
  reçu du plugin. Cliché de parité rafraîchi AVANT `parity` : le script `parity/extract-figma.plugin.js` passé tel quel
  à `figma_execute` avec son `return` remplacé par un POST `/json` au receveur 9230 (120 Ko, jamais dans un retour
  d'outil), puis scindé en `figma-components.json` (94 sets) et `figma-tokens.json` (3 collections).
- **Portes** : parity ✔ (aucune dérive neuve, 14 acquittements inchangés), geometry:gate ✔, authoring ✔, module 23/23,
  inputs ✔, figma-links ✔, assets ✔ (deux constructions identiques), tsc ×2 ✔, plugin:check ✔, core-browser ✔.
  **`npm run eval` NON lancé** (demande owner). **`odoo:derivation:check` rouge sur une entrée qui n'est pas de cette
  vague** : `adaptation-registry.json` #93 `ODOO-A11Y-ANCRE-FORMULAIRE`, mécanisme `css-bridge` hors schéma — travail
  non committé d'une AUTRE session (accessibilité passe 2) dans le même worktree.
- **Le piège du jour : deux sessions dans le même worktree, et la seconde faisait tourner build + golden + repin
  pendant que la première relevait Figma.** `git status` montrait une quarantaine de fichiers étrangers modifiés
  (Équipe v2) — dont les CINQ miroirs à éditer. Ce qui a tenu : ne toucher que ses lignes (regex à comptage attendu,
  écriture différée jusqu'à validation de tous les fichiers) ; lire les mtimes ET `ps` (un `tsx integrations/odoo/qa/run.mts`
  tournait : QA, pas de miroirs) et lancer son propre cycle dans la fenêtre entre deux cycles de l'autre ; le digest
  étant GLOBAL, le repin englobe l'état courant de l'autre — **le dernier qui finit re-pin, et le dit**.
- **Odoo** : instance `piqueray-odoo-037` (8109, la seule qui monte CE worktree — `docker inspect`), `-u piqueray_ds`
  avec identifiants, restart, les NEUF pages recomposées (`COMPOSE_OK` ×9), versions servies vérifiées par `curl`
  (`3.1.2`, `2.2.1`, `4.2.1`, `2.2.1`). La capture par bloc (`.page-parity/capture-bloc.mts`) n'existe plus dans ce
  worktree (dossier gitignoré, recréé vide) — voir la ligne suivante pour la mesure faite.
- **Le SIXIÈME miroir d'un changement de prop sur un bouton imbriqué : le `t-call="piqueray_ds.pqr_button"` du gabarit
  QWeb.** Après build + recomposition, Odoo servait ENCORE `button--variant-outlineNoir` sur produits et avis : la variante
  et `icon_right` du bouton imbriqué sont écrits en dur dans `components.xml` (`<t t-set="variant" t-value="'outlineNoir'"/>`),
  jamais dérivés du contrat. Trois `t-call` passés en `'link'` + `icon_right True` (lignes ecrireAvis, root-entete-bouton,
  root-bouton-conteneur), `-u`, restart, recomposition ×9. Vérifié par sonde Playwright sur la home 8109 (Chromium 1243 du
  cache, `waitUntil: 'load'` — `networkidle` n'arrive JAMAIS sur Odoo, longpolling) : `button--variant-link`, `font-weight 600`,
  30 px, sur produits, avis et présentation ; réassurances `outlineNoir` 54 px. Hauteurs de bloc contre les variantes Figma :
  produits **518 / 484 / 430 = 518 / 484 / 430**, présentation **520 / 351 / 332 = 520 / 351 / 332**, avis 477 / 459 / 1741 contre
  469 / 459 / 1731 (+8 en Wide, +10 en Mobile — écart ANTÉRIEUR, identique avant la vague : 501 vs 493). Captures :
  `specs/tiny/proofs/cta-hierarchie/odoo-apres-*.png`. Un bloc gouverné change de rendu quand le CONTRAT ET le t-call
  changent — le contrat seul ne fait bouger que le CSS.

## Complément du 2026-09-09 — La vidéo du hero : décider le format AVANT d'encoder, mesurer au VMAF, deux sources

- **Le symptôme** : « la vidéo est pixellisée depuis qu'un agent l'a compressée ». Le fichier commité le 2026-09-08
  (`hero-video.mp4`, 1600×900, 0,86 Mbit/s, 4,6 Mo) mesurait **VMAF 85** contre l'original (1920×1080, 3 Mbit/s, 16 Mo,
  `~/Downloads/piqueray-hero-video.mp4` — à mettre à l'abri, il n'est nulle part dans le dépôt). Sous 90, l'œil voit les blocs ;
  au-dessus de 95, il ne distingue plus de l'original. La recette de compression n'était écrite nulle part : c'est ici qu'elle vit.
- **La mesure, pas l'impression** : `ffmpeg … -lavfi libvmaf=n_threads=4:pool=harmonic_mean` contre l'original, **un fichier
  à la fois** (deux mesures en parallèle + les encodeurs = 12 Go de RAM, tués par l'owner). Un `<video>` sur Odoo est servi avec
  `Cache-Control: max-age=604800` sur une URL fixe : remplacer le fichier ne change RIEN dans un navigateur qui l'a déjà vu —
  comparer avec des noms de fichiers neufs, ou renommer.
- **Le résultat** (42 s, 25 i/s) : H.264 crf 21 veryslow 15,6 Mo / VMAF 97 (= l'original : rien à gratter dans ce codec, la
  source est déjà un H.264 efficace) ; **HEVC crf 27 (`-tag:v hvc1`) 6,2 Mo / 95,3** ; HEVC crf 24 9,6 Mo / 96,9 ;
  AV1 SVT preset 4 crf 34 6,3 Mo / 95,5 ; AV1 crf 30 8,2 Mo / 96,4. **AV1 = HEVC sur cette vidéo** : le « 20 % de mieux »
  publié dépend du contenu (animation, images propres) ; sur un plan d'atelier bruité, zéro. Écarté : une source de moins à tenir.
- **Décision : deux `<source>` dans la balise, HEVC puis l'original H.264.** Le navigateur prend la première qu'il décode ;
  l'attribut `type="video/mp4; codecs=hvc1.1.6.L120.B0"` / `avc1.4D4029` (profil+niveau lus par ffprobe) le laisse trancher sans
  télécharger. HEVC : Safari iOS 11+ (tous les iPhone), macOS 13+, Android matériel ; Chrome/Firefox « partiel » (selon la puce)
  → le H.264 les rattrape. AV1 serait sûr en tête (vérifié : sur un iPhone 13 mini `canPlayType` rend `""` et Safari saute à la
  source suivante — `AV1UtilitiesCocoa.mm` refuse sans décodeur), mais il n'apporte rien ici.
- **L'autoplay iOS ne dépend pas du codec** (WebKit : `muted` ou sans piste audio, `playsinline`, visible à l'écran). Le repli
  existait déjà : l'affiche (`poster`) reste si le film ne joue pas (économie d'énergie, `prefers-reduced-motion`).
- **Le piège de code** : `hero_video_interaction.js` coupait le film en lisant l'attribut `src` — avec des `<source>` enfants,
  il n'y a plus de `src`, et la coupure « réduire les animations » cessait de fonctionner sans erreur. Il retire et remet
  désormais les `<source>` (gardées hors DOM, dans l'ordre), et garde le chemin `src` pour une page composée AVANT (HTML figé).
  Vérifié par sonde Playwright sur 8109 : normal → `currentSrc` HEVC, 1920 large, joue ; `reducedMotion: 'reduce'` → zéro
  source, en pause, affiche seule.
- **Chaîne complète** : fichiers dans `static/src/video/` (`hero-video.hevc.mp4` + `hero-video.h264.mp4` = l'original (renommé : l'ancien nom est en cache 7 jours chez qui l'a vu)) →
  `components.xml` (balise à deux sources) → `-u piqueray_ds` avec identifiants → restart → `npm run odoo:page -- home
  piqueray-odoo-037` (le HTML de page est figé : sans recomposition, l'ancienne balise `src` reste) → `odoo:module:check` 23/23.
  Recette d'encodage : `ffmpeg -i original.mp4 -an -c:v libx265 -preset slow -crf 27 -tag:v hvc1 -pix_fmt yuv420p
  -movflags +faststart hero-video.hevc.mp4`.
- **Piège trouvé en vérifiant, pas en lisant : après `-u` + recomposition, `arch_db` de la page était à jour en `en_US` et
  PAS en `fr_BE` (la langue servie) — `write_arch` écrit pourtant les deux langues. Une SECONDE recomposition a posé fr_BE.
  Cause non élucidée (cache de traduction du champ `translate=xml` après le restart ?). Règle : après toute recomposition,
  **lire la vue par langue** (`select k, … from ir_ui_view, jsonb_each_text(arch_db)`) ou `curl` la home, et ne jamais
  conclure sur `COMPOSE_OK` seul.

## Complément du 2026-09-09 — L'édition Odoo : un instrument générique, un registre, et les règles tranchées (§A7)

- **Demande** : vérifier tout le panneau d'édition, bloc par bloc (ce qui doit être éditable l'est, l'édition prend,
  les collections s'ajoutent / se retirent / s'ordonnent). Le dépôt avait 31 scénarios Playwright datés d'août,
  jamais relancés en série, et cinq blocs sans scénario.
- **Fait** : `integrations/odoo/qa/scenarios/edition-generique.spec.mts` (19 configs, 5 min), `run.mts --all`
  (tableau `suite.json`), le registre `specs/tiny/odoo-edition-registre.md`, le fichier machine
  `integrations/odoo/qa/fixtures/edition-bugs.json`, et une passe à l'œil sur la home (8109) avec Claude in Chrome.
- **Ce qui a coûté** : cinq corrections de l'instrument avant qu'il soit fiable, deux faux rouges vus par l'owner
  avant moi, des relances de suite pendant que le poste était saturé (charge 81 : Spotlight, quatre sessions Claude),
  Colima tombé en route. Règle qui en sort : **pas de test tant que la charge dépasse ~10, pas de lancement programmé
  sans l'owner, jamais sur son instance, et confronter un rouge de frappe à l'écran avant de l'écrire.**
- **Trouvé, hors registre initial** : mode traduction quand l'utilisateur est en anglais (EB-021) ; suppression de
  carte sans confirmation (EB-022) ; une erreur JS au chargement public (`web.assets_frontend_minimal`,
  `null.querySelector`, EB-023, cause à identifier) ; les sélecteurs `parts[].selector` des configs ne résolvent
  presque rien dans le DOM (EB-015 : les 480 verdicts `not-editable` sont invérifiables, aucune porte ne le voit).
- **Suite (TDD, rouge d'abord, un bloc à la fois sur 8113)** : Réassurances accroche/titre → section Avis Google
  sans réglages natifs → alt du hero vidéo → Réalisations (couche entière) → configs Produits et « Voir tous les avis »
  en `fixed-by-composition`.

## Complément du 2026-09-09 — Arrondis : un seul rayon (4 px) posé sur tout le DS, Figma d'abord, 12 contrats ensuite

Journal complet : `specs/tiny/vague-031/arrondis.md`. Ce qui vaut pour toutes les vagues suivantes :

- **Une planche, deux colonnes, puis suppression** : « Aujourd'hui » (instance intacte) / « Proposé » (instance avec
  surcharges) sur une page à part, cadre auto-layout. Une fois le geste posé à la source, la colonne « Aujourd'hui »
  montre le nouveau master — la planche n'a plus de sens, on la supprime (versions nommées gardent l'avant).
- **Un geste sur un master composé peut écraser les surcharges de DIMENSION des instances** (CategoriesPrincipales
  Wide : 474×267 FILL → 743×418 FIXED après un `clipsContent` + liaison de rayon sur CarteCategorie). Le patron des vues
  est « visibles en FILL, masquée en FIXED » : relire les instances dans les vues après tout geste, pas seulement les
  empreintes des masters. Et **un geste de dimension par appel `figma_execute`** : Figma ne recalcule qu'après.
- **Une surcharge posée à l'instance bloque la propagation** (20 ReviewCard liées à `radius/8` à l'instance). L'empreinte
  avant/après le dit (« N inchangées ») ; la correction est de re-lier à l'instance.
- **Schéma** : `declared.overflow` est refusé, `overflow-x` / `overflow-y` sont les canaux (comme la carte produit).
- **Clichés de parité sans REST** : `parity/extract-figma.plugin.js` dans le bac à sable → `fetch` vers le receveur 9230
  (`POST /json?name=…`) → `mv` dans `parity/snapshots/`. Le receveur de la spec 037 sert aussi à ça.
- **Réexporter les 36 vues** (bridge `export-vues.js`, receveur 9230, nonce lu à `/health`) avant toute mesure de page :
  des vues de la veille font porter aux blocs les gestes canvas du jour.
- **Après un `-u` sur une instance neuve** : `restore-seed.sh` demande que `…/Odoo/filestore` existe (`mkdir -p` en root).
- **Worktree partagé par trois sessions** : dire ses fichiers par message, laisser la chaîne de build à une seule, garder
  `npm run eval` pour le repos des autres (`evals/.scratch` est unique). Une épingle périmée trouvée en chemin
  (`reassurances.authoring.json` @2.2.0 / bouton @2.4.0) est corrigée et nommée, pas contournée.
- **Limite nommée du jour** : la mesure de page est rouge au pixel (5,9 à 22,8 %) sur 28 rapports **à structure et
  hauteurs égales**, sur chaque glyphe — sur l'instance de la vague ET sur l'instance 037 aux blocs d'avant. Ce n'est pas
  un écart de composant ; la cause (rendu texte de l'export Figma du jour, ou rendu Odoo posé par une autre session) est
  à trancher avant de relire ces scores.
