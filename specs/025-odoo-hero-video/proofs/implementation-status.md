# Implementation status — spec 025 (HeroVideo Odoo + bascule home)

**Date** : 2026-08-23 · Session `/speckit-implement`.

## Fait et vérifié par les portes (Phases 1–3 + fondation)

- **Poster** exporté par REST (lecture seule) → `integrations/odoo/authoring/assets/hero_video.png` (1728×720 PNG, node `2439:4691`, hash `dfaa8d20…`).
- **Cascade de versions** (D5) : `ds.hero-video` ajouté à `ROOT_CONTRACT_IDS`, lock repinné (nouveau `graphDigest a0104a93…`), digest + `data-v*=19.0.1.9.0` propagés sur les 11 racines de `components.xml`, `version_guard.js` / `scan-saved-versions.ts` / `__manifest__.py` mis à jour.
- **CSS générée** : `.hero-video__*` (5 classes) émises par `odoo:assets`, `--check` clean + byte-identique ×2.
- **Bloc `s_pqr_hero_video`** : QWeb (DOM contractuel exact, nbsp du titre préservé), snippet, panneau OWL (3 réglages + info), action média poster, réouvertures root-scopées (titre + libellé CTA, texte simple), href CTA via `pqrSetLinkHref` `actionParam='button-root'`, bridge `a.button` (règle partagée), `hero-video.authoring.json` (10 controls / 12 parts, fermeture ds.hero-video → ds.button), registre (+4 entrées `ODOO-025-HERO-VIDEO-*`, bridge étendu), page harness.
- **Bascule home** (`home.json`) : section 1 = `s_pqr_hero_video` + `s_pqr_bleed`, titre, CTA « En savoir plus », poster `hero_video`.

### Portes vertes

| Porte | Résultat |
|---|---|
| `odoo:inputs:check` | ✓ (lock repinné, ds.hero-video dans la fermeture) |
| `odoo:module:check` | ✓ 19/19 (12 racines, 11 snippets, transcriptions ancrées) |
| `odoo:authoring:check` | ✓ (hero-video.authoring.json couvre la fermeture) |
| `odoo:assets --check` | ✓ (8 sorties conformes, identiques à l'octet) |
| `odoo:typecheck` | ✓ |
| `tsc --noEmit` / `tsc -p tsconfig.build.json` | ✓ |
| `core-browser-check` / `deterministic-roundtrip` | ✓ |
| `parity` | ✓ (exit 0 ; AHEAD/BEHIND = drift canvas informatif) |
| `derivation` — appariement de MES marqueurs | ✓ 4/4 pairés, `unclassified: []` (vérifié via registre temporaire) |

### Invariants

- **SC-004** : re-pins bornés et expliqués — `inputs.lock.json` pour la fermeture Odoo, puis une entrée HeroVideo de `evals/golden.json` après le correctif émetteur décrit plus bas. ✓
- **SC-005** : `contracts/` et `tokens/` **inchangés** (dont `hero`, `section-header`). ✓
- **Clip Odoo** (T028) mesuré : `emit-html` = **1776×768**, clip épinglé TIENT.
- **Référence emit-html** rendue (`proofs/reference/emit-html-hero-video-default.png`, 3552×1536 @2×).

### Fixture d'eval mis à jour (conséquence directe de la cascade)

`evals/fixtures/odoo-production/version-drift/cases.json` : les cas `current` et `policy-stale` épinglaient l'ancien digest/module ; mis au nouveau digest `a0104a93…` + `19.0.1.9.0` pour rester « structure courante ». Vérifié : les 4 cas se classent correctement (`current/policy-stale/structure-stale/unknown`).

## Défauts préexistants rencontrés puis réparés à la clôture

Prouvés antérieurs par (a) le log du build de référence T001 qui porte les mêmes erreurs, et (b) un test « changes remisées » qui les reproduit.

1. **`plugin:check`** : le reçu moteur périmé a été rafraîchi après revue du correctif émetteur ; la porte est verte et confirme le hash du bundle courant.
2. **`odoo:derivation:check` / build / eval** : l'entrée spec-024 est devenue `ODOO-024-PAGE-LAYOUT`, avec les racines concernées et le mécanisme `odoo-bridge`. La dérivation, le build et l'eval sont verts.

Conséquence finale : `npm run eval` = **220/220**.

## Correctif d'émetteur (bug réel trouvé en vérifiant la home)

**Symptôme** (relevé par l'owner) : le poster ne COUVRE pas quand la fenêtre s'élargit — pas de souci sur le hero normal.

**Cause** : `core/emit-html.ts` et `core/emit-react.ts` n'ajoutaient le « chrome d'élément remplacé » (`width:100%; height:100%` sous `position:absolute` + insets) que pour `element === 'img'`. Le Background de `ds.hero-video` est `element: "video"` — un élément remplacé lui AUSSI, ignoré par la garde. Sans `width/height:100%`, l'`<img>` (projection Odoo) et le `<video>` (surface React) gardent leur taille intrinsèque (le navigateur honore `top/left`, lâche `bottom/right`) → `object-fit: cover` opère sur la mauvaise boîte.

**Portée** : les DEUX surfaces étaient touchées — `src/components/HeroVideo/HeroVideo.module.css` `.Background` ET `components.pqr.css` `.hero-video__Background` manquaient `width/height:100%`. Ce n'est PAS un défaut Odoo, c'est un trou d'émetteur sur la surface livrée.

**Correctif** : garde élargie à `(element === 'img' || element === 'video')` dans les deux émetteurs. Régénéré : les deux `.Background` portent maintenant `width/height:100%`. `object-fit: cover` couvre. Idempotent, `odoo:assets --check` identique à l'octet.

**Conséquence sur SC-004** : `evals/golden.json` re-pinné — **1 seule entrée** (`src/components/HeroVideo/HeroVideo.module.css`), re-pin explicite et minimal, conséquence directe d'un vrai bug. (Le seul autre re-pin reste `inputs.lock.json`.) Vérifié sur l'instance isolée (upgrade `piqueray_ds` → poster couvre à 2000px de large).

## Décisions finales de preuve

- **Odoo** : recette éditeur et rendu confirmés par l'owner le 2026-08-23 ; le scénario automatisé reste rejouable mais n'est pas présenté comme exécuté dans cette session. Voir `release-closure.md`.
- **Figma** : sujet et baseline ajoutés en réutilisant la fixture déjà épinglée sous le même `imageRef`; résultat brut **0.4875 %**, sous le seuil de 2 %.
