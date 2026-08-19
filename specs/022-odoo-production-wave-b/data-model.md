# Data Model — 022 odoo-production-wave-b

Aucune entité de schéma nouvelle : tout instancie des modèles 019 figés. Ce document nomme les
instances et leurs invariants.

## 1. Table de verdicts d'éditabilité (artefact du gate — 2 instances)

Livrable du gate humain (FR-001..003). Vit en deux formes équivalentes :
- lisible : les tables 1 et 2 en tête de `plan.md` ;
- machine : `contracts/{coordonnees,reassurances}.editable-scope.json` (ce dossier de spec).

| Champ | Règle |
|---|---|
| `entry.address` | adresse contractuelle (componentPath + prop \| partPath) — même grammaire que le schéma 019 |
| `entry.verdict` | `controlled` \| `directly-editable` \| `fixed-by-composition` \| `not-editable` \| `out-of-capacity` |
| `entry.mechanism` / `contentKind` / `marks` | vocabulaire 019 fermé (D3) |
| `entry.gesture` | pour éditable : le geste rédacteur en clair (français) |
| `entry.note` | justification / limite nommée |
| `status` | `proposed` → `validated` (stampé par la décision owner, avec date et écarts) |

**Invariants** : couverture 100 % des props ET parts du graphe (occurrences imbriquées et
répétées comprises) ; zéro entrée sans verdict ; `out-of-capacity` ⇒ `reasonCode`. Après
validation : transcription 1:1 vers `config/<section>.authoring.json` — toute divergence
table↔config↔comportement est un défaut (SC-007).

**Transitions** : `proposed` →(validation owner)→ `validated` →(transcription)→ config active.
Un retour au gate ré-ouvre `proposed` avec journal des écarts.

## 2. Config d'authoring (2 nouvelles instances du schéma 019)

`integrations/odoo/config/{coordonnees,reassurances}.authoring.json` — schéma
`specs/019-odoo-production-foundation/contracts/authoring-config.schema.json` (inchangé).
`authoringVersion` initiale `1.0.0` ; `snapshotId` = celui du lock repinné ; `rootContract`
épinglé (`ds.coordonnees@2.2.0`, `ds.reassurances@1.2.0`).
Validation : `npm run odoo:authoring:check` (occurrences résolues sans ambiguïté, sélecteurs
root-scopés, aucun verdict manquant).

## 3. Lock des entrées (repin — 1 instance modifiée)

`integrations/odoo/config/inputs.lock.json` : contrats 15 → **18** (+`ds.coordonnees@2.2.0`,
+`ds.reassurances@1.2.0`, +`ds.carte@2.0.1` — la fermeture est CALCULÉE par `closureOf`, jamais
écrite) ; `graphDigest` recalculé ; tokens/registres/fonts inchangés sauf empreintes si le build
les re-signe. Conséquence en cascade : les attributs `data-ds-graph-digest`, `data-vcss/vxml/
vjs` des **10** racines QWeb et la version module (`19.0.1.5.0`) — ancrage vérifié par
`odoo:module:check`.

## 4. Registre d'adaptations (entrées ODOO-022-*)

`integrations/odoo/config/adaptation-registry.json` — un bloc manuel = un marqueur = une entrée
(reasonCodes existants uniquement) :

| Marqueur | reasonCode | mechanism |
|---|---|---|
| ODOO-022-COORDONNEES-QWEB / -SNIPPET | odoo-qweb-composition | qweb |
| ODOO-022-REASSURANCES-QWEB / -SNIPPET | odoo-qweb-composition | qweb |
| ODOO-022-COORDONNEES-PANEL / ODOO-022-REASSURANCES-PANEL / ODOO-022-CARTE-PANEL | odoo-builder-policy | builder-option |
| ODOO-022-REASSURANCES-REPEAT | odoo-repeat-dom | repeat-action |
| ODOO-022-REASSURANCES-MEDIA (images de cartes ; le plan Google n'a AUCUNE action média — placeholder, décision gate 2026-08-19) | odoo-media-dialog | media |
| ODOO-022-COORDONNEES-BRIDGE / ODOO-022-REASSURANCES-BRIDGE (+ grille 4 colonnes de la collection) | odoo-layout-bridge | odoo-bridge |
| ODOO-022-CONTACT-LIENS / ODOO-022-SOCIAL-LIENS (Q-C1=A et Q-C2=A validées au gate) | odoo-builder-policy | builder-option |

Invariant `odoo:derivation:check` : bloc sans entrée = rouge ; entrée sans bloc = rouge ;
chevauchement = rouge.

## 5. Modèle DOM des deux snippets (contrat d'interface éditeur)

Patrons 019 obligatoires :
- racine `<section class="s_pqr_<x> <x>" data-snippet data-ds-contract(+version)
  data-ds-authoring-version data-ds-graph-digest data-vcss/vxml/vjs
  data-pqr-root-actions="move duplicate remove" data-pqr-instance data-pqr-part="root">` ;
- adressage : `data-pqr-part` = adresse de part ; zones texte éditables `o_pqr_editable` +
  `data-pqr-marks` (allowlist exacte) ; structurels `oe_unremovable oe_unmovable` ;
- médias : `<img class="o_editable_media …">` SANS src à la pose ;
- répétition (Réassurances) : liste `data-pqr-carte-list`, item `data-pqr-carte-marker="carte-N"`
  (par POSITION), blueprint `<template data-pqr-carte-blueprint>` ;
- CTA : template partagé `pqr_button` (`link_href` ⇒ `<a>`, sinon `<button>`) — jamais dupliqué ;
- SectionHeader : template partagé `pqr_section_header` (title_part propre à la section) ;
- icônes : templates inline `pqr_facebook` / `pqr_instagram` transcrits de `assets/icons/`.

## 6. Sujets visuels (2 nouvelles instances du contrat `Subject`)

`integrations/odoo/qa/visual/subjects/{coordonnees,reassurances}.mts` — clip épinglé obtenu par
`render-html.mts --measure` (le refus donne le nombre), `odooPath` = page de mesure publique de
`piqueray_ds_qa`. Constantes partagées (`FRAME_PADDING_TOKEN` 24, `DEVICE_SCALE_FACTOR` 2)
inchangées.

## 7. Scénarios QA & preuves

- `qa/scenarios/coordonnees-spike.spec.mts` — spike D9 (Tél/Email : line-break + soulignement à
  travers pose/édition/save/reopen/public). Sort AVANT l'intégration finale ; échec ⇒ retour au
  gate.
- `qa/scenarios/{coordonnees,reassurances}.spec.mts` — un `scenarioId` par fichier ; couvrent
  FR-015 : pose, défauts, w-auto 1728/1440 (racine + enfants, zéro débordement), éditions
  autorisées, tentatives interdites (geste de texte direct sur CHAQUE zone non éditable du
  scénario + gestes natifs de collection), isolation (2 pages, 2 instances même page),
  persistance (save/reopen/public identiques).
- Rejeu : 8 scénarios sections + `combined-isolation` + `editability-boundary` + `versioning` +
  `install-update` ; fixtures d'inventaire 8 → 10.
- Preuves : `specs/022-odoo-production-wave-b/proofs/` (reçus JSON par scénario, mesures
  visuelles chiffrées + attribution des écarts, rapport de qualification).

## 8. Relations (vue d'ensemble)

```
table validée (gate) ──transcription──▶ authoring.json ──vérifiée──▶ odoo:authoring:check
        │                                    │
        │                              dérive les listes/panneaux (authoring.js, authoring.xml)
        ▼                                    ▼
contrats (lock 18, digest) ──emitHtml──▶ css générés + référence visuelle
        │                                    ▼
        └──▶ QWeb manuel (marqueurs 022) ──▶ instance Docker ──▶ scénarios QA + compare.mts
                                                                    ▼
                                                    proofs/ + rapport de qualification
```
