# Research — 025 HeroVideo gouverné côté Odoo + bascule de la home

**Date** : 2026-08-23 · **Entrées** : spec.md, `proofs/step0-audit.md` (Step 0 §VIII déjà concluant), relevé exhaustif du dépôt (addon `piqueray_ds`, portes `scripts/odoo/*`, patron de vague `specs/022-odoo-production-wave-b/tasks.md`, docs `integrations/odoo/*/README.md`). Auggie MCP indisponible dans cette session — docs lues directement (§IX tenu, dérogation d'outil nommée).

Aucun NEEDS CLARIFICATION dans le spec ; les décisions ci-dessous tranchent les choix de projection que le spec laisse ouverts.

---

## D1 — Bloc écrit à la main selon le patron de vague, pas d'émetteur `odoo`

**Decision** : `s_pqr_hero_video` est écrit à la main comme les 11 blocs existants, en suivant la checklist canonique de la vague 022 (`specs/022-odoo-production-wave-b/tasks.md`, phase Foundational T003–T007 puis story). Aucun émetteur `odoo` n'est construit ni amorcé par ce spec.

**Rationale** : c'est le patron éprouvé (019 fondation, 022 vagues) ; le spec 025 demande UN bloc + une bascule de contenu, pas une décision d'industrialisation. `integrations/odoo/README.md` réserve la décision d'émetteur à une mesure dédiée — ce bloc fournit un point de mesure de plus (le « coût du N-ième bloc ») sans préjuger.

**Alternatives considered** : amorcer un émetteur `core/emit-odoo.ts` — rejeté : hors périmètre spec (FR-001..009 ne le demandent pas), et la leçon 018 dit que seule la couche gouvernance décide, or elle reste manuelle ici aussi.

---

## D2 — Le plan poster est un `<img>` en QWeb, pas un `<video poster>` (adaptation tracée)

**Decision** : la part contrat `root.Background` (élément `video`, `poster={backgroundUrl}`) se projette en Odoo comme `<img class="hero-video__Background" data-pqr-part="hero-video-poster">` (nommé « poster » côté Odoo pour clarté rédacteur ; la classe BEM reste `__Background`, CSS générée). Adaptation enregistrée au registre (reason code `odoo-media-dialog` + `odoo-qweb-composition`), avec renvoi vers la décision du contrat lui-même (le canvas/Odoo n'affiche QUE le poster ; `videoUrl` est un canal code-side hors périmètre — spec, Edge Cases).

**Rationale** : (1) toute la mécanique éditeur existante est image-centrée — `openMediaDialog({visibleTabs:["IMAGES"]})`, `o_editable_media`, et `compose_page.py::set_img` pose `src` sur un `<img>` (un `<video src=<png>>` ne rendrait rien) ; (2) fidélité pixel intacte : les deux éléments sont remplacés, absolute inset 0 + `object-fit: cover`, la classe `.hero-video__Background` (CSS générée) s'applique à l'identique ; (3) c'est la matérialisation Odoo de la décision déterministe déjà documentée dans le contrat, pas un contournement.

**Alternatives considered** : `<video t-att-poster>` fidèle à l'élément — rejeté : exigerait d'adapter `set_img`, l'action média et le dialogue Odoo au canal `poster` (3 mécanismes forkés) pour un rendu pixel identique ; coût de gouvernance sans gain de fidélité.

---

## D3 — Structure QWeb : copie de la sortie `emit-html`, Bouton dernier enfant direct du root

**Decision** : le DOM du bloc reproduit `core/samples/hero-video.html` : `section.hero-video` > [`img` Background, `div` VoileBas, `div` VoileNavigation, `div.hero-video__Text` > `span.hero-video__Accroche`, puis `t-call piqueray_ds.pqr_button` en **dernier enfant direct du root** — PAS dans `Text`, PAS de wrapper]. **Aucun `t-call pqr_section_header`** (titre direct, FR-007). Le CTA est rendu par le template utilitaire `pqr_button` existant (variant `outlineBlanc`), qui émet `data-pqr-part="button-root"/"button-label"`.

**Rationale** : la référence de la chaîne visuelle Odoo est `emit-html` — même DOM ⇒ même CSS générée s'applique ⇒ cible 0 %. La position du bouton (frère de `Text`, différent de `ds.hero` où il vit dans `hero__Titres`) est un fait du contrat vérifié dans l'échantillon.

**Alternatives considered** : wrapper `div` CTA comme dans `s_pqr_hero` (`hero__Bouton`) — rejeté : n'existe pas dans l'anatomie `ds.hero-video` ; un div de plus casserait la correspondance DOM↔CSS générée.

---

## D4 — CSS du composant : génération via `ROOT_CONTRACT_IDS`, zéro CSS écrite à la main

**Decision** : ajouter `'ds.hero-video'` à `ROOT_CONTRACT_IDS` (`scripts/odoo/lib/repo-data.ts:34`) et `ROOT_SELECTOR['ds.hero-video'] = '.s_pqr_hero_video'` (`:45-57`), puis `npm run odoo:assets` — les styles `.hero-video__*` entrent dans `components.pqr.css` par le pipeline déterministe (emitHtml → stripShowcaseChrome → dédup → préfixage). Vérif : `npm run odoo:assets -- --check`.

**Rationale** : frontière 3 (généré, jamais à la main) ; les tokens hero-video sont déjà présents dans `tokens.pqr.css` (`--pqr-size-hero-video-root: 720px`, typo 44/48 vérifiées ligne à ligne). Écrire cette CSS à la main serait un drift par définition (§IV).

**Alternatives considered** : aucune sérieuse.

---

## D5 — Cascade de versions : conséquence obligatoire, faite en bloc Foundational

**Decision** : l'ajout de `ds.hero-video` à la fermeture change le `graphDigest` ⇒ cascade complète en une passe, AVANT la story : repin explicite `inputs.lock.json` (`odoo:inputs:check --repin` — fermeture et digest **calculés**, jamais écrits à la main), propagation du digest + `data-v{css,xml,js}` + `data-ds-authoring-version` sur **les 11 racines existantes** de `components.xml`, mise à jour `version_guard.js` (CONTRACT_VERSIONS + digest + module) et `scan-saved-versions.ts`, bump `__manifest__.py` `19.0.1.8.0` → `19.0.1.9.0`.

**Rationale** : `check-module.ts::testVersions()` ancre ces trois transcriptions au lock — toute incohérence rougit la porte. C'est exactement le T003–T007 de 022 (« cascade de non-régression »). Le repin est l'unique re-pin attendu du spec ⇒ SC-004 « zéro re-pin inexpliqué » : `evals/golden.json` ne doit PAS bouger (aucun contrat, token, ni générateur touché).

**Alternatives considered** : cascade au fil de l'eau pendant la story — rejeté : chaque état intermédiaire laisse `odoo:module:check` rouge ; la vague 022 a réglé ce séquencement.

---

## D6 — Gouvernance éditeur : 3 ouvertures nommées, tout le reste fermé

**Decision** : parts éditables limitées à (FR-004) : **titre** (`hero-video-title`, plain-text, `allowedMarks: []`), **libellé CTA** (`button-label` sous ce root), **image poster** (via action média du panneau, pas d'édition inline). Mécanique identique aux autres blocs : root dans `PIQUERAY_ROOTS` (fermeture via `content_not_editable_selectors`), réouvertures nommées root-scopées (`.s_pqr_hero_video …` — `check-authoring.ts` refuse un sélecteur non préfixé), `oe_unremovable oe_unmovable` sur chaque nœud structurel, `data-pqr-root-actions="move duplicate remove"`, panneau OWL `HeroVideoOption` (remplacer le poster, alt, href CTA), action média dédiée dans `media_action.js`. Chaque contrôle enveloppé d'un `<span data-pqr-control="<decisionId>">` tracé vers `hero-video.authoring.json`.

**Rationale** : patron 019 vérifié sur 11 blocs ; le titre hero-video est à poids **unique** Regular (Step 0) ⇒ pas de marks, contrairement à `ds.hero` — la surface rich-text n'est pas ouverte sans besoin.

**Alternatives considered** : autoriser `strong` sur le titre par symétrie avec hero — rejeté : le master n'a aucun poids mixte ; ouvrir un mark sans fait source serait une affordance non fidèle.

---

## D7 — Bascule home : descriptor seul, poster exporté du master, seed re-semé

**Decision** : dans `home.json`, remplacer la section 1 par `s_pqr_hero_video` avec `add_class: ["s_pqr_bleed"]` (full-bleed, confirmé par l'instance Figma 1728 bord à bord — Step 0), `set_html` du titre (« Le numéro 1 des portes HÖRMANN en Province de Liège ! »), `set_button` CTA « En savoir plus » (libellé relevé sur le master au Step 0 ; le défaut du contrat « Contactez-nous » est un contenu, pas une loi), `images: { "hero-video-poster": "hero_video" }`. Le poster est exporté du fichier Figma en **lecture** (image hash `dfaa8d2046343398e067aade577f177137d32cce`, non purgée — vérifié au Step 0) vers `authoring/assets/hero_video.png`. Après bascule : `npm run odoo:page -- home <projet-jetable>`, vérifs, puis `npm run odoo:save` (le seed est un snapshot DÉRIVÉ — règle 024). `s_pqr_hero` **reste** dans l'addon, inutilisé (spec, Assumptions).

**Rationale** : le contenu vit dans le descriptor (spec 024) ; le gutter/gap reste sur `o_pqr_page` — « NE JAMAIS cuire le gutter dans un contrat » (authoring/README, règle non négociable) ; asset nommé sans collision avec `hero.png` (fond de `ds.hero`).

**Alternatives considered** : réutiliser `hero.png` comme poster — rejeté sans vérification d'identité des deux images ; l'export du hash relevé est la seule source prouvée fidèle.

---

## D8 — Preuve visuelle : deux chaînes, deux sujets nouveaux

**Decision** :
1. **`emit-html ↔ master Figma`** (SC-001, seuil projet **2.0 %**, `extract/figma/visual-parity/tolerance.ts:9`) : ajouter le sujet `hero-video` à `extract/figma/visual-parity/subjects.ts` + baseline. Il n'existe pas aujourd'hui — c'est l'écart connu « sections non couvertes » (CLAUDE.md, constat 018) réduit d'une unité, dans le fil direct du spec.
2. **`Odoo ↔ emit-html`** (fidélité de la projection) : sujet `integrations/odoo/qa/visual/subjects/hero-video.mts` (géométrie épinglée : `frameContentWidth` 1728, clip 1776 × 768 = 720 + 2×24 de padding harness, à confirmer par `render-html.mts --measure` qui refuse un clip trop petit) + page harness `/piqueray-harness/hero-video-visual` dans `piqueray_ds_qa/views/harness.xml` + scénario `qa/scenarios/hero-video-visual.mts`. Cible **0.0000 %** ; tout résidu est chiffré et sa raison déclarée (`plancherDeTolerance`/`raisonDuPlancher`), patron 019.

**Rationale** : la chaîne QA Odoo compare Odoo à `emit-html`, PAS à Figma (relevé `compare.mts`) ; SC-001 (« fidèle au master ») exige donc la première chaîne, la fidélité de projection la seconde. Les outlines `ODOO-PAGE-DEBUG` (actives, `odoo-bridge.css:388-396`) ne touchent pas le clip harness (hors `.o_pqr_page`) ; toute capture **pleine page** produite en preuve nomme les outlines dans son reçu (§V) au lieu de les désactiver silencieusement.

**Alternatives considered** : comparaison manuelle export REST ↔ capture via `npm run images:compare` — gardée comme repli documenté si l'ajout du sujet visual-parity bute sur un vrai blocage, avec le blocage nommé.

---

## D9 — Registre d'adaptation : entrées `ODOO-025-HERO-VIDEO-*`

**Decision** : chaque zone manuelle porte un marqueur apparié 1↔1 à `adaptation-registry.json` : `-QWEB` (components.xml, `odoo-qweb-composition`), `-SNIPPET` (snippets.xml), `-PANEL` (authoring.xml, `odoo-builder-policy`), `-MEDIA` (media_action.js, `odoo-media-dialog`), touches `authoring.js` sous les marqueurs existants étendus ou un `-AUTHORING` dédié selon le grain déjà pratiqué, et `-BRIDGE` (odoo-bridge.css) **seulement si** le CTA rendu en `<a>` exige la neutralisation `text-decoration` (la règle existante `.s_pqr_hero a.button` est root-scopée, elle ne couvre pas le nouveau root). Porte : `odoo:derivation:check`.

**Rationale** : frontière 4 — un bloc de marqueur sans entrée (ou l'inverse) rougit la porte ; le grain suit le patron hero (`ODOO-019-HERO-{QWEB,SNIPPET,PANEL,MEDIA}`).

**Alternatives considered** : aucune — mécanisme imposé par les portes.

---

## Risques nommés (pas des inconnues bloquantes)

- **R1 — `set_button` et le CTA sans wrapper** : `compose_page.py::set_button` remplace le premier nœud texte de la part visée ; sans wrapper `hero-cta`, la part d'adressage est `button-root` (émise par `pqr_button`). Si le sélecteur d'unicité pose problème (plusieurs boutons par page — non : adressage root-scopé par section), le repli est un paramètre de part sur le `t-call` comme `title_part` de `pqr_section_header`. À trancher à l'implémentation, les deux voies sont dans le patron existant.
- **R2 — clip du harness** : la boîte réelle de `emit-html` fait foi (`render-html.mts --measure` refuse et imprime le nombre) ; les 1776 × 768 sont une hypothèse de départ, pas une valeur promise.
- **R3 — seed & branche** : la branche porte déjà `integrations/odoo/qa/seed/` non commité et `restore-seed.sh` modifié (état antérieur au plan) ; la story home re-sème par-dessus — l'état final du seed est celui d'après bascule, à commettre en connaissance.
