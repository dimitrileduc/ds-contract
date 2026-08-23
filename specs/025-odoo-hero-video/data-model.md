# Data Model — 025 HeroVideo côté Odoo

**Date** : 2026-08-23 · Toutes les entités sont des documents JSON/XML sur disque ; aucune base de données applicative (la DB Odoo de QA est un artefact jetable, le seed un snapshot dérivé).

## Entités

### 1. `ds.hero-video` — contrat (EXISTANT, NON MODIFIÉ)

`contracts/hero-video.contract.json` — id `ds.hero-video`, **v1.0.0**, `category: "section"`, élément `section`.

**Props** (4) : `backgroundUrl` (poster), `videoUrl` (canal code-side, hors périmètre), `backgroundAlt`, `accroche` (défaut « Le numéro 1 des portes HÖRMANN en Province de Liège ! »).

**Anatomie** (parts contrat → rôle) :

| Part (chemin contrat) | Élément | Rôle |
|---|---|---|
| `root` | section | 720px (`{size.hero-video.root}`), flex, referenceWidth 1728, `position: relative` |
| `root.Background` | video (poster) | plan poster, absolute inset 0, `object-fit: cover`, z 0 |
| `root.VoileBas` | div | scrim bas `to bottom, α0 80% → α0.5 100%`, z 1 |
| `root.VoileNavigation` | div | scrim haut `to top, α0 75% → α0.5 100%`, z 1 |
| `root.Text` | div | colonne, z 2 |
| `root.Text.Accroche` | span | titre direct, `{font.size.44}`/`{font.line-height.48}` Regular, blanc |
| `root.Bouton` | component `ds.button` | CTA `outlineBlanc`, **frère de `Text`, dernier enfant du root** |

**Invariant** : ce document n'est pas touché par 025 (SC-005). Fermeture calculée : `ds.hero-video → ds.button` (+ registre d'icônes via ds.button).

### 2. `s_pqr_hero_video` — bloc Odoo (NOUVEAU)

Projection QWeb du contrat dans `views/components.xml` (zone manuelle comptée `ODOO-025-HERO-VIDEO-QWEB`). Voir le contrat de projection : [contracts/s-pqr-hero-video.qweb.md](contracts/s-pqr-hero-video.qweb.md).

**Mapping parts contrat → `data-pqr-part` Odoo** (l'adressage du composeur et de l'éditeur passe exclusivement par ces noms) :

| Part contrat | `data-pqr-part` | Classe (CSS générée) | Gouvernance |
|---|---|---|---|
| `root` | `root` | `hero-video` (+ `s_pqr_hero_video`) | fermé ; actions root `move duplicate remove` |
| `root.Background` | `hero-video-poster` | `hero-video__Background` | média seul (`o_editable_media`), via panneau — nommé « poster » côté Odoo (clarté rédacteur) ; la classe BEM reste `__Background` (CSS générée, convention contrat) |
| `root.VoileBas` | `hero-video-voile-bas` | `hero-video__VoileBas` | verrouillé |
| `root.VoileNavigation` | `hero-video-voile-navigation` | `hero-video__VoileNavigation` | verrouillé |
| `root.Text` | `hero-video-content` | `hero-video__Text` | verrouillé |
| `root.Text.Accroche` | `hero-video-title` | `hero-video__Accroche` | **éditable**, plain-text, marks `[]` |
| `root.Bouton` | `button-root` / `button-label` (émis par `pqr_button`) | `button button--variant-outlineBlanc …` | **libellé éditable** ; href via panneau |

**Attributs de gouvernance du root** (mêmes clés que les 11 blocs) : `data-snippet="s_pqr_hero_video"`, `data-name`, `data-ds-contract="ds.hero-video"`, `data-ds-contract-version="1.0.0"`, `data-ds-authoring-version`, `data-ds-graph-digest` (recalculé), `data-v{css,xml,js}` (= version manifest), `data-pqr-root-actions`, `data-pqr-instance`.

### 3. `hero-video.authoring.json` — config de décision (NOUVEAU)

`integrations/odoo/config/hero-video.authoring.json`, schéma `specs/019-odoo-production-foundation/contracts/authoring-config.schema.json`. Une décision explicite **par prop et par part de toute la fermeture** (`ds.hero-video` + `ds.button` sous ce root) — `check-authoring.ts` n'a aucun verdict par défaut. Détail : [contracts/authoring-decisions.md](contracts/authoring-decisions.md).

Champs : `schemaVersion 1.0.0`, `configId "odoo-hero-video-authoring"`, `authoringVersion` (alignée sur la valeur courante des autres configs), `snapshotId "odoo-019-foundation"`, `rootContract {id, version 1.0.0}`, `rootActions` (move/duplicate/remove **allowed** ; save-as-custom/resize/background **forbidden**), `controls[]`, `parts[]` (sélecteurs préfixés `.s_pqr_hero_video `).

### 4. `home.json` — descriptor de contenu (MIS À JOUR)

`integrations/odoo/authoring/pages/home.json` — la section 1 passe de `s_pqr_hero` à :

```json
{
  "component": "s_pqr_hero_video",
  "add_class": ["s_pqr_bleed"],
  "set_html": { "hero-video-title": "Le numéro 1 des portes HÖRMANN en Province de Liège !" },
  "set_button": { "<part CTA — button-root, cf. R1>": "En savoir plus" },
  "images": { "hero-video-poster": "hero_video" }
}
```

Les 7 autres sections sont inchangées. **Transitions d'état** : descriptor édité → `odoo:page` (compose) → vérifs → `odoo:save` (seed dérivé re-semé). Un seed antérieur ne reflète JAMAIS un bloc modifié (HTML figé — règle 024).

### 5. `hero_video.png` — asset poster (NOUVEAU)

`integrations/odoo/authoring/assets/hero_video.png` — export REST (lecture) de l'image hash `dfaa8d2046343398e067aade577f177137d32cce` (non purgée, vérifié Step 0). Référencé sans extension dans le descriptor. Injection : `compose_page.py::img_url` → `ir.attachment` public → `/web/image/<id>`.

### 6. Chaîne de versions (MISE À JOUR EN CASCADE)

| Document | Champ | Valeur |
|---|---|---|
| `__manifest__.py` | version | `19.0.1.8.0` → **`19.0.1.9.0`** |
| `inputs.lock.json` | `contracts[]` (+`ds.hero-video` v1.0.0 + sha256), `graphDigest` | recalculés au repin explicite |
| `components.xml` (×12 roots) | `data-ds-graph-digest`, `data-v{css,xml,js}` | nouveau digest / nouvelle version |
| `version_guard.js` | `CURRENT_*`, `CONTRACT_VERSIONS` | +`ds.hero-video: "1.0.0"` |
| `scan-saved-versions.ts` | `EXPECTED_GRAPH`, `MODULE`, `CONTRACTS` | idem |
| `scripts/odoo/lib/repo-data.ts` | `ROOT_CONTRACT_IDS`, `ROOT_SELECTOR` | +`ds.hero-video` / `.s_pqr_hero_video` |

**Règle de validation** : `check-module.ts::testVersions()` exige l'égalité des trois transcriptions avec le lock ; `t-snippet` ≤ `ROOT_CONTRACT_IDS.length`.

### 7. Registre d'adaptation (ENTRÉES AJOUTÉES)

`integrations/odoo/config/adaptation-registry.json` — une entrée par bloc de marqueur `ODOO-025-HERO-VIDEO-*` (QWEB, SNIPPET, PANEL, MEDIA, ± AUTHORING, ± BRIDGE), chacune : `adaptationId`, `path`, `rootContracts: ["ds.hero-video"]`, `reasonCode` (codes existants — `odoo-qweb-composition`, `odoo-builder-policy`, `odoo-media-dialog`, `odoo-layout-bridge`), `decisionRefs`, `mechanism`. Validation : appariement 1↔1 par `odoo:derivation:check`.

### 8. Sujets d'instrument visuel (NOUVEAUX)

- `extract/figma/visual-parity/subjects.ts` + `baseline.json` : sujet `hero-video` (emit-html ↔ master `2151:5552`), seuil 2.0 %.
- `integrations/odoo/qa/visual/subjects/hero-video.mts` : `key 'hero-video-default'`, `contractId 'ds.hero-video'`, `odooPath '/piqueray-harness/hero-video-visual'`, `odooClipSelector '.pqr-mesure'`, `frameContentWidth 1728`, clip mesuré par `render-html.mts --measure` (hypothèse 1776×768) ; conditions épinglées identiques aux autres sujets (viewport @2, light, fr-FR).
- `piqueray_ds_qa/views/harness.xml` : page `/piqueray-harness/hero-video-visual`, `.pqr-mesure` padding `--pqr-space-24` fond blanc, `t-call piqueray_ds.s_pqr_hero_video`.
- Reçus : `qa/scenarios/hero-video-visual.mts` → dossier proofs de l'instrument (constante `PROOFS`, `receipt.mts`) + reçus 025 dans `specs/025-odoo-hero-video/proofs/`.

## Relations

```
contracts/hero-video.contract.json (SSoT, gelé)
  ├─(emitHtml)→ core/samples/hero-video.{html,css}        # référence visuelle
  │               └─(build-assets)→ components.pqr.css     # CSS du bloc (généré)
  ├─(projection manuelle comptée)→ s_pqr_hero_video (QWeb) # même DOM, data-pqr-part
  │               ├─ hero-video.authoring.json             # décisions éditeur (fermeture complète)
  │               ├─ adaptation-registry.json               # marqueurs 1↔1
  │               └─ inputs.lock.json                       # épinglage version+sha (repin)
  └─(mesure)→ visual-parity (Figma ↔ emit-html, ≤2%) + qa/visual (emit-html ↔ Odoo, →0%)

home.json ─(odoo:page)→ page composée (HTML figé) ─(odoo:save)→ seed dérivé
```
