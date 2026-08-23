# Rapport de clôture — spec 023 · Pied de page Piqueray dans Odoo (footer shell)

**Date** : 2026-08-23
**Branche** : `jelly-concavenator`
**Statut** : **clôturé — les 6 SC tiennent**

---

## 1. Ce qui tient

### SC-001 — Apparence au design exact
Le footer rend le design gouverné ds.footer 1.1.0 à **0.57 %** de pixels différents
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
| `npm run parity` | vert (baseline acquittée, pré-existant) |
| `npm run eval` | **219/219** |
| `npm run plugin:check` | rouge PRÉ-EXISTANT (engine receipt mismatch — pas causé par 023) |
| `npx tsx scripts/deterministic-roundtrip.mjs` | vert |
| `node scripts/core-browser-check.mjs` | vert |
| `npx tsc --noEmit && npx tsc -p tsconfig.build.json` | vert |

### Portes Odoo

| Porte | Résultat |
|-------|----------|
| `odoo:inputs:check` | vert |
| `odoo:authoring:check` | vert |
| `odoo:assets -- --check` | vert |
| `odoo:module:check` | vert |
| `odoo:derivation:check` | vert (62 blocs) |
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

- `plugin:check` : engine receipt mismatch (`375caafa` vs `a018853b`). Présent
  avant 023, cité tel quel. Pas causé par cette feature, pas réparé ici.

---

## 5. Fichiers créés ou modifiés

### Addon `piqueray_ds` (module principal)

- `views/footer.xml` — gabarit QWeb du footer (1 zone comptée `ODOO-023-FOOTER-QWEB`)
- `models/website.py` — 4 champs `Text` sur le modèle `website`
- `models/__init__.py` — import du modèle
- `__init__.py` — import des modèles + `post_init_hook`
- `hooks.py` — `_finalize_footer()` (idempotent, garde `piqueray_ds.footer_finalized`)
- `migrations/19.0.1.7.0/post-migration.py` — appel de `_finalize_footer`
- `__manifest__.py` — version 19.0.1.7.0, description enrichie
- `static/src/js/version_guard.js` — version 19.0.1.7.0
- `static/src/css/generated/components.pqr.css` — régénéré (fermeture élargie)

### Addon `piqueray_ds_qa` (module QA)

- `views/harness.xml` — banc visuel footer (`piqueray_ds_qa.harness_footer_visual`)

### Configurations

- `integrations/odoo/config/footer.authoring.json` — verdicts d'éditabilité
- `integrations/odoo/config/adaptation-registry.json` — +1 zone `ODOO-023-FOOTER-QWEB`
- `integrations/odoo/config/inputs.lock.json` — +3 entrées (ds.footer, ds.footer-column, ds.copyright)
- `integrations/odoo/derivation-report.json` — régénéré (62 blocs)

### Scripts

- `scripts/odoo/lib/repo-data.ts` — `SHELL_CONTRACT_IDS += 'ds.footer'`
- `scripts/odoo/scan-saved-versions.ts` — MODULE 19.0.1.7.0
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

Toutes les portes sont vertes (sauf `plugin:check` pré-existant), les 6 SC tiennent,
et la surface de re-pin est limitée à une fixture de test de version.
