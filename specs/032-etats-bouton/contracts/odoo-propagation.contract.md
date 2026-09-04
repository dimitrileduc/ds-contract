# Contrat d'interface — propagation Odoo d'un bump de `ds.button`

**Spec** : 032-etats-bouton · **Date** : 2026-09-04

`ds.button` passe **2.1.0 → 2.2.0**. Le `graphDigest` du verrou est calculé sur
**tous** les contrats : il bouge donc aussi, et il est recopié à la main en
plusieurs endroits. Ce document est la liste close de ces endroits. Une omission
ne casse pas le build — elle fait rougir une porte Odoo, ou pire, elle passe et
le site classe ses blocs à tort.

## Les six miroirs

| # | Fichier | Ce qui change | Volume mesuré (2026-09-04) | Porte qui l'attrape |
|---|---|---|---|---|
| 1 | `integrations/odoo/config/*.authoring.json` | `"id": "ds.button"` → `"version": "2.2.0"` | **253 épingles** / 13 fichiers | `npm run odoo:authoring:check` |
| 2 | `integrations/odoo/addons/piqueray_ds/views/components.xml` | `data-ds-graph-digest` | **14 occurrences** | `npm run odoo:module:check` |
| 3 | `…/static/src/js/version_guard.js` | `CURRENT_GRAPH_DIGEST` | 1 | `npm run odoo:module:check` |
| 4 | `scripts/odoo/scan-saved-versions.ts` | `EXPECTED_GRAPH` (jumeau manuel du #3) | 1 | `npm run odoo:module:check` compare les deux au verrou |
| 5 | `evals/fixtures/odoo-production/version-drift/cases.json` | digest des cas `current` **et** `policy-stale` | 2 | eval `odoo-production-version-drift` |
| 6 | `integrations/odoo/config/inputs.lock.json` | version + sha256 + `graphDigest` | régénéré | `npm run odoo:inputs:check` |

Le verrou (#6) se régénère : `npx tsx scripts/odoo/check-inputs.ts --repin`.
Les cinq autres sont manuels.

### Répartition des 253 épingles

| Fichier | épingles `ds.button` |
|---|---|
| `produits-ecommerce.authoring.json` | 55 |
| `reassurances.authoring.json` | 55 |
| `categories.authoring.json` | 22 |
| `google-reviews.authoring.json` | 22 |
| `menu-mobile.authoring.json` | 22 |
| `devis`, `faq`, `footer`, `header`, `hero`, `hero-video`, `presentation`, `sav` | 11 chacun |

## Ordre d'exécution — non négociable

```
npm run build          # tokens → schema → generate → odoo:assets → figma-links → derivation
npm run figma:plan     # ⚠ build NE régénère PAS figma-sync/*.js
npm run emitters:check
npm run catalog
npm run golden:update
node scripts/build-plugin-zip.mjs --update-engine-receipt
npx tsx scripts/odoo/check-inputs.ts --repin
```

**Le piège, mesuré** : figer l'or après le seul `build` produit un
`figma-sync/NN-button.js` périmé. `emitters:check` le compare à lui-même et
paraît vert ; l'eval `golden-generated-output` relance `figma:plan` frais et
attrape la divergence. Coût constaté sur `ds.sav` : une reprise complète.

## Re-pins attendus

- `evals/golden.json`
- `figma-sync/plugin/engine.receipt.json`
- `integrations/odoo/config/inputs.lock.json`
- `catalog/catalog.json`
- `examples/polaris/figma/*.figma.js` — **aucun** : cette vague ne touche pas
  d'émetteur. Si un re-pin y apparaît, c'est le signe qu'un émetteur a bougé
  sans qu'on l'ait voulu : arrêter et chercher pourquoi.

## Conséquence sur les pages composées

Le déplacement du `graphDigest` fait basculer **les 13 blocs** en
`structure-stale` (`version_guard.js:19`). Une page composée est du HTML **figé** :
Odoo n'y propage rien. La séquence obligatoire, sur l'instance jetable de l'agent
— **jamais `piqueray-odoo-test` (8071), qui est à l'owner** :

1. `odoo -u piqueray_ds` dans l'instance ;
2. `npm run odoo:page -- home <projet-docker-jetable>` ;
3. `npm run odoo:save` ;
4. `npx tsx scripts/odoo/scan-saved-versions.ts` → **zéro** `structure-stale`.

Le semis est un **instantané dérivé**, jamais la source : un semis fabriqué avec
l'ancien bloc ne reflète pas le bloc modifié.

## Piège de rédaction

Une `$description` de contrat ne doit **pas** contenir un chemin de jeton entre
accolades. L'invariant « zéro accolade non résolue » d'`emitters:check` scanne
l'inline émis, description comprise, et lève un faux positif. Écrire
« jeton color.etat.default.fond-survol », sans accolades.
