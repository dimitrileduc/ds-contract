# Rapport de clôture — spec 023 · Pied de page Piqueray dans Odoo (footer shell)

**Date de rédaction** : 2026-08-23 (branche `jelly-concavenator`, avant fusion)
**Clôture vérifiée** : 2026-08-23, sur `main` après la fusion `4c1204bf`
**Statut** : **clôturé — les 6 SC tiennent ; une porte reste rouge, pré-existante et nommée (§7)**

---

## 1. Ce qui tient

### SC-001 — Apparence au design exact
Le footer rend le design gouverné ds.footer **1.2.0** à **0.57 %** de pixels différents
(référence `emitHtml` vs capture Odoo sur le banc QA dédié).
- Reçu visuel : `proofs/footer-visual/comparison/comparaison-image.json`
- Triptyque : `proofs/footer-visual/comparison/footer-default/triptych.png`
- L'écart résiduel est de l'anti-aliasing de police (Montserrat rendu par deux
  moteurs différents — emit-html vs Chromium sur Odoo).

### SC-002 / SC-003 — Édition des textes autorisés
Les 4 champs `t-field` (3 colonnes + copyright) sont modifiés par l'ORM, conservés
après rechargement, et le design reste intact (logo, CTA, réseaux, séparateur).
- Reçu : `proofs/footer-edit.json` — 9/9 constats pass

### SC-004 / FR-014 — Survie au module update
Les textes du rédacteur survivent intégralement à un cycle `odoo -u piqueray_ds`.
Digest global identique avant/après.
- Reçu : `proofs/footer-update.json` — 9/9 constats pass

### SC-005 / FR-008 — Footer sur chaque page
Le footer shell est présent sur 4 pages testées (homepage + 3 bancs de sections).
Le header shell (ds.header) reste intact sur chaque page.
- Reçu : `proofs/footer-pages.json` — 20/20 constats pass

### SC-006 — Apparence régénérable
`npm run build && npm run odoo:assets --check` reproduit la CSS du footer
à l'octet (déterministe, non figée). Les textes survivent au cycle complet
build → assets → update module.
- Reçu : `proofs/footer-regen.json` — 7/7 constats pass

---

## 2. Portes constitutionnelles

| Porte | Résultat |
|-------|----------|
| `npm run build` | vert |
| `npm run parity` | vert — « No new drift », 10 acquittements dans `parity/baseline.json` |
| `npm run eval` | **220/220** (remesuré le 2026-08-23 après réparation — voir §7) |
| `npm run plugin:check` | **rouge PRÉ-EXISTANT** — engine receipt périmé. Non causé par 023, ni par la réparation de §7 : prouvé par exécution sur `HEAD` nu (§7.4) |
| `npx tsx scripts/deterministic-roundtrip.mjs` | vert |
| `node scripts/core-browser-check.mjs` | vert |
| `npx tsc --noEmit && npx tsc -p tsconfig.build.json` | vert |

### Portes Odoo

| Porte | Résultat |
|-------|----------|
| `odoo:inputs:check` | vert |
| `odoo:authoring:check` | vert |
| `odoo:assets -- --check` | vert |
| `odoo:module:check` | vert — 19/19 après réparation (§7.1) |
| `odoo:derivation:check` | vert — **71 blocs** après réparation (62 au moment de la rédaction) |
| `odoo:typecheck` | vert |
| `odoo:visual:selftest -- --strict` | vert (6 pass, 1 sauté — instrument générique) |

---

## 3. Surface de re-pin

| Fichier | Cause |
|---------|-------|
| `evals/fixtures/odoo-production/version-drift/cases.json` | Le `current` case portait `data-v*='19.0.1.6.0'` ; mis à jour à `19.0.1.7.0` après le bump de version module (T015) |

Aucun re-pin de `evals/golden.json`, `figma-sync/plugin/engine.receipt.json`, ou
`examples/polaris/figma/*.figma.js`. Aucun contrat, token, ou schéma modifié.

---

## 4. Ce qui reste ouvert

### Différés nommés

1. **Responsive mobile** : le footer est rendu à largeur fixe 1728px (comme le
   header). Le responsive mobile est un différé global (nommé dans 022, applicable
   à tous les shells).

2. **Icônes Facebook/Instagram** : les SVG sont inlinés dans le QWeb. Si le
   registre d'icônes gouvernées s'enrichit de ces glyphes, le QWeb devra les
   remplacer par des `t-call` sur les gabarits SVG du registre.

3. **Sémantique `<footer>` hôte** : le footer est un `<div>` (la racine du composant
   `ds.footer` est un `<div>`). Le `<footer>` natif d'Odoo est remplacé par notre
   xpath. La sémantique `<footer>` pourrait être réintroduite via un wrapper, mais
   cela modifierait la cascade CSS.

4. **Édition inline via l'éditeur website** : les scénarios QA modifient les champs
   via l'ORM (Python shell). L'édition inline dans l'éditeur Odoo (clic sur le
   `t-field`, frappe, save) n'est pas testée programmatiquement — c'est un différé
   nommé, pas une lacune silencieuse. Le mécanisme `t-field` est natif Odoo et
   prouvé sur chaque site Odoo ; ce que nous prouvons ici est que nos champs
   existent, sont rendus, et que leur contenu survit aux opérations système.

5. **Liens sociaux** : les URLs Facebook/Instagram passent par les routes contrôleur
   natives `/website/social/*`. Si les champs `website.social_facebook` /
   `website.social_instagram` sont vides, les liens renvoient vers des pages vides.
   Le scénario ne teste pas le cas vide (les champs sont pré-remplis par défaut
   dans Odoo 19).

### Porte rouge pré-existante

- `plugin:check` : engine receipt périmé. Au 2026-08-23 le bundle frais hashe
  `0ebc73ae2e0a…` (667 425 o) quand le reçu commité enregistre `42b377ee0ede…`
  (667 559 o). **Vérifié pré-existant par exécution** : mis de côté toutes les
  corrections de §7, `plugin:check` échoue sur `HEAD` nu avec les deux mêmes
  hashes. Cause : le bundle scelle core + tokens + contrats + icônes, et la
  fusion a changé des contrats. Correctif nommé, non appliqué ici (hors périmètre
  footer) : `node scripts/build-plugin-zip.mjs --update-engine-receipt`.

---

## 5. Fichiers créés ou modifiés

### Addon `piqueray_ds` (module principal)

- `views/footer.xml` — gabarit QWeb du footer (1 zone comptée `ODOO-023-FOOTER-QWEB`)
- `models/website.py` — 4 champs `Text` sur le modèle `website`
- `models/__init__.py` — import du modèle
- `__init__.py` — import des modèles + `post_init_hook`
- `hooks.py` — `_finalize_footer()` (idempotent, garde `piqueray_ds.footer_finalized`)
- `migrations/19.0.1.7.0/post-migration.py` — appel de `_finalize_footer`
- `__manifest__.py` — version **19.0.1.8.0** (19.0.1.6.0 → 19.0.1.8.0, deux crans : champs texte puis champs CTA), description enrichie
- `static/src/js/version_guard.js` — version **19.0.1.8.0** (recalée en §7.1)
- `static/src/css/generated/components.pqr.css` — régénéré (fermeture élargie)

### Addon `piqueray_ds_qa` (module QA)

- `views/harness.xml` — banc visuel footer (`piqueray_ds_qa.harness_footer_visual`)

### Configurations

- `integrations/odoo/config/footer.authoring.json` — verdicts d'éditabilité
- `integrations/odoo/config/adaptation-registry.json` — **+3 zones** : `ODOO-023-FOOTER-QWEB`, plus `ODOO-023-FOOTER-PANEL` et `ODOO-023-FOOTER-BRIDGE` ajoutées en §7.2 (elles existaient dans le code sans être déclarées)
- `integrations/odoo/config/inputs.lock.json` — +3 entrées (ds.footer, ds.footer-column, ds.copyright)
- `integrations/odoo/derivation-report.json` — régénéré (**71 blocs**, digest `661910cb5c1b…`)

### Scripts

- `scripts/odoo/lib/repo-data.ts` — `SHELL_CONTRACT_IDS += 'ds.footer'`
- `scripts/odoo/scan-saved-versions.ts` — MODULE **19.0.1.8.0** (recalé en §7.1)
- `scripts/odoo/check-authoring.ts` — ROOT_SELECTOR += `'ds.footer': '.footer'`

### Sujets et scénarios QA

- `integrations/odoo/qa/visual/subjects/footer.mts` — sujet visuel
- `integrations/odoo/qa/scenarios/footer-edit.spec.mts` — SC-002/SC-003
- `integrations/odoo/qa/scenarios/footer-update.spec.mts` — SC-004/FR-014
- `integrations/odoo/qa/scenarios/footer-regen.spec.mts` — SC-006
- `integrations/odoo/qa/scenarios/footer-pages.spec.mts` — SC-005/FR-008

### Fixtures et reçus

- `evals/fixtures/odoo-production/version-drift/cases.json` — re-pin 19.0.1.7.0
- `specs/023-odoo-footer-shell/proofs/footer-visual/` — référence + capture + triptyque
- `specs/023-odoo-footer-shell/proofs/footer-edit.json`
- `specs/023-odoo-footer-shell/proofs/footer-update.json`
- `specs/023-odoo-footer-shell/proofs/footer-regen.json`
- `specs/023-odoo-footer-shell/proofs/footer-pages.json`

---

## 6. Résumé

Le pied de page Piqueray est livré comme gabarit système dans Odoo, au même titre
que le header (spec 022). Les deux composent le shell complet du site. Les textes
sont éditables inline via `t-field`, les URLs sociales passent par les champs natifs
Odoo, et l'apparence est gouvernée par le contrat (régénérable, déterministe, jamais
figée à la main).

Les 6 SC tiennent. Toutes les portes sont vertes **sauf `plugin:check`**, rouge avant
cette feature et prouvé tel (§7.4).

La surface de re-pin annoncée ci-dessus (§3) était celle de la branche. **Elle a été
élargie à la clôture** : la fusion des deux branches parallèles a périmé quatre
artefacts que ni l'une ni l'autre ne pouvait voir seule. Le détail, la cause et les
mesures sont en §7 — c'est la partie de ce rapport qu'il faut lire avant de bâtir
sur 023.

---

## 7. Vérification de clôture — 2026-08-23, sur `main` après fusion

Ce rapport a été rédigé sur la branche `jelly-concavenator`, où tout était vert.
La branche a ensuite été fusionnée dans `main` (`4c1204bf`) **en même temps** qu'une
seconde branche parallèle (`incongruous-ski` — hero deux colonnes, `ds.hero` 1.6.0).

À la re-vérification, **deux portes étaient rouges et deux evals échouaient**. Aucun
des deux workers n'avait tort : chaque branche était verte seule. **C'est la fusion
qui a périmé quatre artefacts dérivés**, et par construction aucune des deux branches
ne pouvait le voir. C'est le fait le plus utile de ce rapport.

### 7.1 Miroirs de version désaccordés — `odoo:module:check` rouge

Le commit 023 a porté le manifeste de `19.0.1.6.0` à `19.0.1.8.0` (deux crans, deux
migrations : champs texte du footer, puis champs CTA). **Les trois transcriptions
manuelles sont restées à `19.0.1.7.0`** :

| Transcription | Avant | Après |
|---|---|---|
| `static/src/js/version_guard.js` (`CURRENT_MODULE_VERSION`) | 19.0.1.7.0 | 19.0.1.8.0 |
| `scripts/odoo/scan-saved-versions.ts` (`MODULE`) | 19.0.1.7.0 | 19.0.1.8.0 |
| `views/components.xml` (`data-vcss/vxml/vjs`, 11 racines) | 19.0.1.7.0 | 19.0.1.8.0 |

Ces trois-là sont exactement ce que la porte existe pour ancrer : un détecteur de
dérive qui annonce la mauvaise version ne détecte plus rien. **Après recalage :
`odoo:module:check` 19 passés, 0 échoué.**

### 7.2 Deux zones manuelles jamais déclarées — `odoo:derivation:check` rouge

La régénération du rapport de dérivation a révélé une lacune que le rouge précédent
masquait : le travail footer a créé **trois** zones manuelles et n'en a déclaré
**qu'une**.

| Zone | Fichier | État à la rédaction |
|---|---|---|
| `ODOO-023-FOOTER-QWEB` | `views/footer.xml` | déclarée |
| `ODOO-023-FOOTER-PANEL` | `static/src/xml/authoring.xml` | **absente du registre** |
| `ODOO-023-FOOTER-BRIDGE` | `static/src/css/odoo-bridge.css` | **absente du registre** |

La spec voisine (`023-categories-gouvernees`) déclare ses six zones, PANEL et BRIDGE
comprises — le motif était établi, il n'a pas été suivi. Les deux entrées ont été
ajoutées, motifs vérifiés contre le contenu réel des zones :

- `ODOO-023-FOOTER-PANEL` → `odoo-builder-policy` / `builder-option` (le bloc porte
  des `BuilderRow` et un `BuilderUrlPicker` — panneau du Website Builder)
- `ODOO-023-FOOTER-BRIDGE` → `odoo-layout-bridge` / `odoo-bridge` (le bloc déclare
  quatre neutralisations de conflits Bootstrap/Odoo, aucune valeur de design dupliquée)

**Après déclaration : `odoo:derivation:check` propre, 71 blocs, `661910cb5c1b…`.**

### 7.3 Deux evals cassés par la fusion

**`golden-generated-output`** — 5 fichiers divergeaient. Cause établie : le commit 023
a épinglé `figma-sync/22-footer.js` ; l'autre branche a renuméroté le fichier en
`24-footer.js` ; la fusion a gardé le nom neuf avec le hash ancien. **Preuve que le
code était sain et le pin en retard** : `npm run build` reproduit des fichiers
strictement identiques à `HEAD` (aucun diff). Re-pin par `npm run golden:update` —
exactement les 5 hashes annoncés par l'eval, aucun autre.

**`odoo-production-version-drift`** — le cas `current` classait `structure-stale`.
Trois causes empilées, découvertes dans cet ordre (l'eval s'arrête au premier écart,
ce qui masquait les suivants) :

1. versions module `19.0.1.7.0` → `19.0.1.8.0` (cas `current`)
2. digest de graphe `e8b7e2127b…` → `c00ad0235a…` (cas `current` **et** `policy-stale`
   — un digest périmé court-circuite en `structure-stale`, donc `policy-stale` aurait
   échoué juste après)
3. version d'authoring `1.1.0` → `1.2.0` (cas `current`)

Les cas `structure-stale` et `unknown` sont inchangés : leur péremption est
intentionnelle.

**Après réparation : `npm run eval` → 220/220.**

### 7.4 Ce qui reste rouge, et la preuve que ce n'est pas de 023

`npm run plugin:check` échoue : bundle frais `0ebc73ae2e0a…` (667 425 o) contre reçu
commité `42b377ee0ede…` (667 559 o).

Méthode de vérification, pas raisonnement : toutes les corrections de §7 ont été
mises de côté (`git stash`), `plugin:check` relancé sur `HEAD` nu — **même échec,
mêmes deux hashes**. Aucun des sept fichiers touchés ici n'alimente le bundle du
plugin. Le rouge est antérieur et sans lien.

Correctif nommé, délibérément non appliqué (hors périmètre footer, et c'est un
re-scellement de garde d'octets qui mérite sa propre revue) :
`node scripts/build-plugin-zip.mjs --update-engine-receipt`.

### 7.5 Ce qui a été mesuré à la clôture, et ce qui ne l'a pas été

| Porte | Résultat vérifié le 2026-08-23 |
|---|---|
| `npm run build` | vert |
| `npm run eval` | **220/220** |
| `npm run parity` | vert — « No new drift », 10 acquittements |
| `npx tsc --noEmit` + `tsconfig.build.json` | vert |
| `npx tsx scripts/deterministic-roundtrip.mjs` | vert |
| `node scripts/core-browser-check.mjs` | vert |
| `odoo:module:check` | vert, 19/19 |
| `odoo:derivation:check` | vert, 71 blocs |
| `odoo:inputs:check` · `odoo:authoring:check` | verts |
| `odoo:assets -- --check` | vert — 8 sorties conformes, deux constructions identiques à l'octet |
| `npm run plugin:check` | **rouge, pré-existant** (§7.4) |

**Non re-mesuré, et il faut le savoir** : les quatre reçus QA (`footer-edit`,
`footer-update`, `footer-regen`, `footer-pages`) et le reçu visuel à 0,57 % datent
tous du commit `02d8f914`, **avant la fusion**. Ils exigent une instance Odoo vivante
et n'ont pas été rejoués ici.

Ce qui *a* été vérifié à leur place, faute de mieux, et qui est un argument sérieux
mais pas une re-mesure : la fusion a bien régénéré `components.pqr.css` (+174 lignes),
mais **aucune de ces lignes ne concerne le footer** — elles sont toutes du
`ds.carte-categorie` / `ds.categories-principales` venu de l'autre branche. Le rendu
du footer est donc inchangé par la fusion, et le 0,57 % reste représentatif.

### 7.6 Surface de re-pin réelle de la clôture

| Fichier | Cause |
|---|---|
| `evals/golden.json` | 5 hashes — renumérotation `22-footer.js` → `24-footer.js` perdue à la fusion |
| `evals/fixtures/odoo-production/version-drift/cases.json` | digest de graphe (2 cas), authoring et version module (cas `current`) |
| `integrations/odoo/addons/piqueray_ds/static/src/js/version_guard.js` | miroir de version |
| `scripts/odoo/scan-saved-versions.ts` | miroir de version |
| `integrations/odoo/addons/piqueray_ds/views/components.xml` | miroir de version, 11 racines |
| `integrations/odoo/config/adaptation-registry.json` | +2 zones manuelles jamais déclarées |
| `integrations/odoo/derivation-report.json` | régénéré (généré, générateur dédié) |

Aucun contrat, aucun token, aucun schéma touché à la clôture.

### 7.7 La leçon, parce qu'elle se reproduira

Deux agents ont travaillé en parallèle sur deux worktrees. **Les deux ont annoncé
vert, et les deux disaient vrai.** Ce qui a cassé, c'est la fusion — et elle a cassé
précisément les artefacts *dérivés* de l'ensemble du graphe : manifeste de golden,
rapport de dérivation, digest de graphe, numérotation des scripts figma-sync.

La règle qui en sort : **après toute fusion de branches parallèles, re-jouer la
totalité des portes sur le résultat fusionné, jamais sur les branches.** Une branche
verte ne dit rien de la fusion. Et un rapport de clôture rédigé sur la branche décrit
un état qui n'existe plus dès que la fusion a lieu.
