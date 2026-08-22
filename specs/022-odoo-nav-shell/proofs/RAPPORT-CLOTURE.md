# Rapport de clôture — 022 Barre de navigation Piqueray dans Odoo (le shell)

**Date** : 2026-08-20 · **État** : livré, portes vertes.

La barre de navigation Piqueray est livrée comme **header système** d'Odoo 19 :
gabarit qui hérite `website.layout` et remplace la zone nav native, rendant la
barre gouvernée (logo, liens, CTA, icônes) depuis la donnée native `website.menu`.
Deux temps stricts tenus : (1) remise à niveau gouvernée amont (`ds.header`
**1.0.0 → 2.0.0** MAJOR, retrait Solid ; `ds.piqueray-logo` **1.0.0** adopté) close
en phase 2 ; (2) projection Odoo (ce document).

## Preuves (reçus sous `proofs/`)

| Critère | Reçu | Verdict |
|---|---|---|
| **SC-001** barre au design exact | `header-visual.json` | **0,0129 %** de pixels (sous le plafond 0,1 %) |
| **SC-002/003** menu éditable, contenu conservé | `header-menu.json` | pass (ajout/renommage/réordre/imbrication/URL externe/menu vide) |
| **SC-004/005** déroulants + état actif | `header-nav.json` | pass (2 déroulants ouvrent ; actif exact, cas parent-d'enfant compris) |
| **SC-006 / FR-016** apparence régénérable, menu intact | `header-regen.json`, `sc-006-regeneration.json` | pass — CSS reproduite à l'octet ; `website.menu` **byte-identique** avant/après régénération |
| **FR-012** 8 sections intactes | `sections-intact.json` | pass (8/8) |
| retrait Solid (amont, §VIII/§X) | `canvas/`, `PHASE-AMONT-CLOSURE.md` | geste canvas unique + version nommée |

## Portes vertes

Sweep constitutionnel **219/219 evals** + suite Odoo (`inputs`, `authoring`,
`assets --check`, `module`, `derivation`, `typecheck`, `visual:selftest --strict`)
— toutes vertes DANS le worktree.

## Limites nommées (constitution V)

1. **Icônes search/user/cart inertes** — spans `aria-hidden`, aucun comportement
   (recherche/compte/panier différés à leurs specs). Verdict authoring
   `fixed-by-composition`.
2. **Sous-menu au style Odoo/Bootstrap par défaut** (FR-009) — le panneau déroulant
   n'est PAS piquerayisé ; seuls les liens de tête portent le style `ds.nav-item`.
3. **Hover / mobile / overlay-hero différés** — aucun état interactif (`states: []`,
   cohérent avec tout Piqueray) ; pas de barre mobile/burger ; la superposition sur
   le hero est hors périmètre.
4. **Largeur pleine — RÉSOLU (header 2.1.0, correction à la SOURCE §VIII).**
   Le header était `size.header.root` = 1728 px FIXED — l'intrus face aux sections
   qui sont FILL. Corrigé À LA SOURCE, pas contourné en Odoo : geste canvas §X
   (master `Fond=Transparent` passé de `layoutSizingHorizontal` FIXED → **FILL**,
   le stroke 1 px du set retiré pour que le master reste EXACTEMENT 1728, **les 10
   usages intacts à 1728**, version nommée « 022 — header master FILL 1728 »), puis
   re-mirroir dans le contrat (`anatomy.root.layout.width: "fill"`, `referenceWidth:
   1728`, jeton `width` fixe lâché — comme hero) → bump **2.1.0** → CSS `width: 100%`
   des deux côtés (React + Odoo). Mesuré : la barre remplit la largeur (1920 → 1920).
   SC-001 tient à **0,0129 %** (dans le cadre 1728, `fill` = 1728, pixel-identique).
   Jeton `size.header.root` devient orphelin (nommé). Re-pins : contrat, authoring,
   lock (header@2.1.0), golden, engine.receipt, catalog, figma-sync. **Reste différé**
   nommé : le responsive MOBILE (burger, réagencement < ~1000 px, menu très long) —
   le full-width DESKTOP est acquis, pas la barre mobile.
5. **Sémantique React `<div>` racine différée** — la surface LIVRÉE (QWeb) obtient
   sa sémantique du gabarit (`<header>` natif d'Odoo, notre `<nav>`, icônes
   `aria-hidden`) ; la surface **React** reste `<div>` (fait 013 ouvert).
6. **Options natives de header d'Odoo non restreintes** — `rootActions` du shell
   tout `forbidden`, mais l'apparence peut dévier par les options natives de header
   (déviation acceptée, nommée dans `header.authoring.json`).
7. **Placement « Motorisation » `inferred`** — la maquette ne dessine aucun panneau
   de sous-menu ; enfant de « Portes d'entrée » par inférence (chevron du master).
   Marqué en commentaire dans `data/menu_seed.xml` ; le menu appartient au client
   dès la livraison.
8. **Flèche du CTA — résidu SC-001 hérité de 019** : la vitrine `emit-html` rend la
   flèche PLEINE du registre d'icônes ; `pqr_button` (patron 019 réutilisé, D10)
   inline `pqr_arrow_right` (tracé). C'est la quasi-totalité du 0,0129 % — une
   caractéristique de `pqr_button`, PAS un défaut de 022 (`limitCode`
   `SC-001-CTA-ARROW-GLYPH-INHERITED-019`).
9. **FR-016 — suppression d'un menu semé** : `noupdate="1"` protège de l'ÉCRASEMENT
   (renommer/ajouter/réordonner/imbriquer survivent à `-u`, prouvé SC-006), mais
   SUPPRIMER un enregistrement semé le fait **recréer** au `-u` suivant (son xml_id
   disparaît → noupdate le crée à nouveau, sans parent → invisible dans la barre,
   mais présent en base). Différé nommé. Le test « menu vidé » (T026) détache donc
   les tops (parent_id) au lieu de les supprimer — même résultat visuel, sans perte
   d'xml_id (`limitCode` `SC-002-003-ORM-EDIT-NOT-OWL-DIALOG` couvre aussi ce point).
10. **SC-002/003 appliqués par l'ORM, pas par l'UI OWL du dialogue** — les éditions
    passent par le MÊME `website.menu` que le dialogue « Éditer le menu » persiste ;
    l'invariant prouvé est STRUCTUREL (notre gabarit re-rend n'importe quel état de
    menu, le design ne peut pas casser). Piloter le dialogue OWL de bout en bout est
    un différé nommé.
11. **`parity/snapshots/figma-components.json`** rafraîchi après le geste canvas
    amont, mais entre ce geste et la merge, `main` compare son vieux snapshot à son
    vieux contrat (vert sur un état périmé) — limite standard du dépôt (mémoire 017),
    résorbée à la merge.
12. **Rouges pré-existants, cités sans re-diagnostic** (mémoire de projet) :
    `odoo:qualification` (reçu 019 incohérent) et `editability-boundary` 43/44
    (champ périmé depuis `cc6cd0d4`). **T033 (conditionnel) : NON déclenché** — la
    qualification de 022 n'exige pas de manifeste 019 vert (scénarios 022 =
    `scenarioId` distincts) ; politique respectée : ne pas aggraver.

13. **Plage desktop 1000–1728 px — NON couverte, mesurée après coup (2026-08-22).**
    La limite 3 ci-dessus différait le responsive « MOBILE (burger, réagencement
    < ~1000 px) » et déclarait le full-width desktop acquis. Entre les deux, rien :
    ni décision, ni mesure, ni porte. Relevé sur instance neuve
    (`proofs/header-bande-desktop.json`, 17 largeurs) : l'espace logo↔nav décroît
    1:1 depuis 222 px et atteint **0 à 1506 px** ; les libellés se replient sur
    **2 lignes à ≤ 1470**, sur **3 lignes à ≤ 1320** ; et **à ≤ 1220 la PAGE
    déborde horizontalement** (11 px à 1220, 207 px à 1024). Cause : `.header`
    porte `padding-inline: 89px` + `gap` 64/32 en valeurs fixes avec
    `justify-content: space-between`, sans règle intermédiaire. SC-001 n'est pas
    en cause (mesuré dans le cadre 1728). Ce qui manquait n'était pas la règle
    CSS — c'était le fait que **la limite nommée bornait au mauvais endroit**.

14. **Les scénarios QA du header ne sont valides que dans UN ordre, non écrit.**
    `header-nav` exige le menu semé **intact** (il déclare en tête réutiliser
    l'instance sans réinstaller) ; `header-regen` exige au contraire les
    **éditions posées par `header-menu`** (son premier constat est « menu client
    capturé, modifié par US2, non trivial »). Le seul ordre valide est donc
    `header-visual → header-nav → header-menu → header-regen → sections-intact`.
    Constaté le 2026-08-22 en rejouant la suite sur une machine neuve : deux
    ordres différents ont produit deux rouges — `header-nav` mesurant le menu
    édité par son voisin, puis `header-regen` mesurant un menu pristine. Les deux
    reçus commités sont exacts ; c'est leur **reproductibilité** qui dépend d'un
    ordre que rien ne déclare et qu'aucun runner n'impose. Différé nommé : la
    réparation juste est que chaque scénario POSE l'état qu'il mesure.

15. **Le correctif de largeur 2.1.0 n'est sur AUCUN axe de porte** (constaté
    2026-08-22). Trois axes, trois angles morts. (a) `parity` : le **second** geste
    canvas (master `Fond=Transparent` FIXED → FILL) n'a **pas** rafraîchi
    `parity/snapshots/figma-components.json` — dernière écriture du cliché : le commit
    du geste **amont** (`9b2841ec`), alors que le bump 2.1.0 est arrivé en `ecb8ac81`.
    La limite 11 ci-dessus ne couvre que le geste amont. (b) Cela ne changerait rien :
    le cliché ne porte **aucune géométrie** (`name`, `nodeId`, `key`, `description`,
    `properties`, `nestedInstances` — rien d'autre) ; et 2.1.0 ayant **lâché** le jeton
    de largeur, l'axe `canvas variables ⟷ tokens/` ne le voit plus non plus. La
    géométrie roule sur les jetons **par construction** — une géométrie qui quitte les
    jetons quitte l'axe. (c) `visual-parity` ne peut pas le voir : SC-001 est mesuré
    dans le cadre 1728, où `fill` **vaut** 1728 — pixel-identique avant/après, ce
    document le dit lui-même au n°4. **Net : le passage en pleine largeur est attesté
    par UNE mesure manuelle (1920 → 1920) consignée au n°4, et par rien d'autre,
    jamais plus.** La liste de re-pins du n°4 (contrat, authoring, lock, golden,
    engine.receipt, catalog, figma-sync) est exacte et **ne contient pas** le cliché
    parity : c'est le fait, pas un oubli de rédaction.

16. **`docs/` portait déjà la décision — et la moitié livrée est celle contre laquelle
    il met en garde** (§IX, receipt du 2026-08-22).
    `docs/organisms-responsive-decisions.md` (2026-08-11), section `### Header`,
    écrivait **avant** 022 : « Le root passé **seul** en Fill à 1440 ne déborde pas du
    frame, mais le logo finit à `x = 269` alors que `navWrapper` commence à `x = 231` :
    **chevauchement de 38 px** » — et décidait : « root **et conteneur interne** en
    Fill ; logo et icônes en Hug ; **zone de navigation en Fill avec espacement
    compressible, sans largeur fixe de nav** », plus la correction des wrappers de
    chevrons. 2.1.0 a livré **le root seul** : `anatomy.root.parts.navWrapper` ne porte
    **ni `width` ni `grow`**. Puis le n°13 a **re-mesuré depuis zéro**, sur instance
    neuve, la conséquence que ce document énonçait — sans le citer. Aucun artefact de
    022 ne le référence (`grep organisms-responsive specs/022-odoo-nav-shell/` → **0** ;
    `research.md` cite `docs/` **une seule fois** au total). Le coût n'est pas la règle
    CSS manquante : c'est d'avoir payé deux fois une mesure déjà écrite. La moitié
    restante de la décision (navWrapper/nav en Fill, chevrons contenus) n'était portée
    par **aucun** registre de différés — un addendum daté a été posé dans le document
    source le 2026-08-22 pour qu'elle cesse d'être orpheline.

17. **Trois fichiers LIVRÉS affirment encore l'état 2.0.0** (relevé 2026-08-22 ;
    **nommés, non corrigés** — décision owner du jour : réparer les `.md`, pas le
    code) :
    · `integrations/odoo/addons/piqueray_ds/static/src/css/odoo-bridge.css:212,219-221`
    — dans le bloc d'adaptation **gouverné** `ODOO-022-FOND-SOMBRE` : « Le contrat
    ds.header **2.0.0** » et « La largeur de la barre est celle du contrat
    (`size.header.root` = 1728px, **fixe**) : le comportement plein-largeur/responsive
    est un **différé nommé** » — les deux faux depuis le n°4, où le full-width desktop
    est au contraire déclaré acquis ;
    · `integrations/odoo/qa/visual/subjects/header.mts:8,33` — « Largeur du cadre =
    `size.header.root` (1728px, **fixe** — responsive différé nommé) » et
    `CONDITIONS.content` = « ds.header **2.0.0** mono-variante… », dans le fichier même
    qui documente les conditions de mesure de la porte SC-001 ;
    · `core/samples/header.css:233` (`width: var(--size-header-root)`) et
    `core/samples/Header.inline.tsx:36` (`"width": "1728px"`) contre le livré
    `src/components/Header/Header.module.css:18` (`width: 100%`) — instance fraîche du
    trou déjà nommé au 018 (« `core/samples/` n'est PAS régénéré par `npm run build` ») ;
    dernier commit du dossier : **2026-08-11**, avant 022.

## Faits renversés par la mesure (patron SC-009 de 018)

Plusieurs prémisses tenues pour acquises se sont révélées fausses à l'exécution —
consignées, pas contournées :

- **`emit-html` ne rend AUCUN vectorAsset** (grep : zéro occurrence) : la vitrine de
  référence SC-001 laissait le logo VIDE. Réparé côté **instrument** (non émetteur) :
  `render-html.mts` injecte les SVG gouvernés (`assets/vectors/`) + une surface
  `dark` ajoutée au `Subject` (encre claire sur fond sombre). PHASE-AMONT gap n°2 clos.
- **Le header système pousse la `.pqr-mesure` de ~86 px** sur TOUTES les pages de
  mesure une fois le shell actif : la garde de viewport de 80 px tronquait la capture
  de 6 px. Portée à 200 (`viewportFor`) — latent pour les sections aussi.
- **Le `<a>` d'accueil autour du logo** (nom accessible, projection §2) remontait le
  logo de 3,5 px (hauteur de ligne inline > boîte 34 px). Corrigé par
  `.header__logoLink { display: flex }` au pont (mesuré : logo y 46,5 → 50).
- **Odoo met en cache le rendu de la page d'accueil PAR URL** : un scénario qui
  ÉDITE le menu entre deux lectures mesurait un rendu figé. Corrigé par clé de cache
  unique (`/?pqr=N`).
- **Les menus par site n'ont AUCUN xml_id** (spike S2) : le `parent_id` des tops
  n'est pas référençable en XML → posé en Python (`hooks._finalize_shell`,
  garde d'idempotence par drapeau) ; le retrait des défauts se fait par (website_id,
  url), jamais par xml_id.
- **Ripple du bump de version module** (19.0.1.4.0 → 19.0.1.5.0, requis par la
  migration du semis) : NON listé au plan, mais imposé par les portes —
  `version_guard.js`, `scan-saved-versions.ts`, la fixture d'eval `version-drift`
  et les `data-v*` de `components.xml` re-épinglés (24 valeurs, même longueur d'octet).
- **`build-derivation-report` ne scannait que `ODOO-019-*`** et non `data/` :
  régex généralisée `ODOO-0(19|22)-`, `data/` ajouté aux cibles ; schémas 019
  `authoring-config` (+`native-menu`) et `adaptation-registry` (+`ODOO-022`,
  +`ds.header`, +mécanisme `seed`) étendus ADDITIVEMENT.

## Décision d'architecture nommée — `graphDigest` posable seul (Option B)

Le lock (`inputs.lock.json`) couvre la fermeture **posables ∪ shell** (18 contrats),
mais le `graphDigest` reste celui des SEULES posables (`102c372a…`, inchangé). Raison :
le digest signe la structure du HTML **sauvegardé** (staleness des sections) ; le
header, rendu à chaque requête et JAMAIS sauvegardé, ne peut pas le rendre périmé —
l'y fondre marquerait à tort « structure-stale » chaque section au premier changement
du header. Le shell entre au lock par son **sha256 par-entrée**, hors digest. Bonus :
zéro touche à la fixture d'eval `version-drift`, aux deux transcriptions de version,
ni au digest — la surface de ripple reste minimale.

## Instance de qualification — isolation (collision worktree)

L'instance Docker partagée (`piqueray-odoo-qa`) était montée par un AUTRE worktree
(`…/a768cf04-…/2-others/…`) : les commandes compose du projet partagé visaient SON
conteneur. Conformément à `run.mts` (« plusieurs vagues… COMPOSE_PROJECT_NAME +
PQR_ODOO_PORT propres »), toutes les preuves 022 ont tourné sur une instance
**isolée** (`COMPOSE_PROJECT_NAME=pqr022nav`, ports 8089/8092). La base de QA étant
jetable par conception (chaque scénario `DROP`+réinstalle), aucun état persistant
n'a été perdu.

## Surface de dépôt touchée

- **Amont** (phase 2) : `contracts/{header,piqueray-logo}.contract.json`, re-pins
  golden/engine.receipt/catalog, snapshot parity, reçus canvas.
- **Scripts d'intégration** : `scripts/odoo/lib/repo-data.ts` (+`SHELL_CONTRACT_IDS`,
  `ALL_ROOT_CONTRACT_IDS`), `build-assets.ts`, `check-inputs.ts`, `check-module.ts`,
  `check-authoring.ts`, `build-derivation-report.ts`, `scan-saved-versions.ts`.
- **Schémas 019** (additifs) : `authoring-config.schema.json`,
  `adaptation-registry.schema.json`.
- **Addon** : `views/header.xml` (NOUVEAU), `data/menu_seed.xml` (NOUVEAU),
  `hooks.py` (NOUVEAU), `migrations/19.0.1.5.0/post-migration.py` (NOUVEAU),
  `__init__.py`, `__manifest__.py` (19.0.1.5.0 + post_init_hook + data),
  `static/src/css/odoo-bridge.css` (FOND-SOMBRE + logoLink + CTA header),
  `static/src/js/version_guard.js`, `views/components.xml` (data-v* bump).
- **Config** : `inputs.lock.json` (repin, 18 contrats), `header.authoring.json`
  (NOUVEAU, 12 contrôles + 22 parts), `adaptation-registry.json` (+4 `ODOO-022-*`,
  +2 reasonCodes, `ds.header` au CTA-bridge), `derivation-report.json` (régénéré).
- **QA visuelle** : `subject.mts` (+`surface`, garde viewport 200), `render-html.mts`
  (dark + injection vecteurs), `subjects/header.mts` (NOUVEAU), `harness.xml`
  (banc header), 5 scénarios `scenarios/header-*.mts` + `sections-intact.spec.mts`.
- **Addon QA** : `piqueray_ds_qa/views/harness.xml` (banc visuel header).
- **Eval** : `evals/fixtures/odoo-production/version-drift/cases.json` (bump).

**Re-pin polaris : zéro** (aucune édition d'émetteur, vérifié). Schéma de contrat :
**non modifié** (canal `propsByProp` abandonné avec Solid).
