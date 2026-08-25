# Implementation Plan: Rendre HeroVideo responsive

**Branch**: `027-responsive-hero-video` | **Date**: 2026-08-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/027-responsive-hero-video/spec.md`

## Summary

Faire de `ds.hero-video` le premier composant responsive Piqueray gouverné de bout en bout. L’exécution protège d’abord le master historique 1728 comme référence XL/wide et son unique usage Home (H1), puis fait choisir à l’owner les compositions Mobile et Desktop dans un cadre déjà fixé : Mobile/compact sous 992 px, Desktop de 992 à 1399 px et XL/wide à partir de 1400 px (H2). La largeur Tablet 834 reste un témoin obligatoire de la composition compacte, sans quatrième composition dans cette feature. La source Figma est ensuite adaptée sous capture complète et acceptée (H3) avant que ses faits ne soient promus dans un modèle responsive contractuel générique, optionnel et déterministe.

Ce modèle n’ajoute aucune prop publique `viewport` : les émetteurs web et Odoo appliquent la même CSS mobile-first avec `min-width: 992px` puis `min-width: 1400px`, tandis que Figma Design expose quatre témoins explicites — Mobile 390, Tablet 834, Desktop 1200 et XL 1728 — au moyen d’Auto Layout, de modes ou de variants selon la nature du delta approuvé. Les témoins sont des références de comparaison, jamais des breakpoints Figma automatiques. La génération conserve le poster, le master, la key publique, l’instance Home, ses overrides et les contrôles Odoo existants ; le dernier gate owner (H4) repose sur une matrice à viewport exact, les parités à moins de 2 %, la persistance éditoriale et un second passage strictement sans effet.

## Technical Context

**Language/Version**: TypeScript 6 / Node.js >=20 (ESM/`tsx`); React 19 TSX and HTML/CSS outputs; generated Figma JavaScript; Odoo 19 XML/QWeb, browser JavaScript and CSS; Python authoring helpers

**Primary Dependencies**: Zod 4 contract schema, DTCG JSON tokens, deterministic React/HTML/Figma generators, Figma Plugin API through the Desktop bridge, React 19, Playwright Core 1.61, pixelmatch/pngjs, Odoo 19 Website Builder, PostgreSQL 15 in disposable QA

**Storage**: versioned JSON/Markdown decisions, contracts, tokens, locks, manifests, captures and receipts in Git; disposable Odoo QA database only; no new production datastore

**Testing**: contract fixtures and registered evals; build/parity/plugin/deterministic/type gates; component-repair and page-capture proofs; responsive browser geometry and pixel comparisons; Odoo static, public, editor, save/reopen, two-instance isolation, update and visual qualification

**Target Platform**: Figma Desktop/Figma Design; generated React/HTML in current desktop and mobile browsers; Odoo 19 Website Builder and public website in the pinned disposable Docker QA stack

**Project Type**: contract-driven multi-surface design-system evolution with Figma authoring and Odoo CMS integration

**Performance Goals**: CSS-driven runtime switching with no new resize listener or client state; deterministic local generation; no horizontal overflow or unintended crop; centring within 2 px when content fits; visual deltas below 2 % under matched conditions

**Constraints**: four explicit human gates; no source mutation before H2; no cross-surface side-sync; no generated-file hand edit; no public/editor `viewport` control; historical XL reference 1728×720 and wide continuity at 1440 preserved; Mobile/compact `<992`, Desktop `992–1399`, XL/wide `>=1400`; Tablet 834 maps to compact; Figma resize is not claimed to trigger a breakpoint; saved Odoo HTML is never silently rewritten; Header is read-only context; Odoo/Bootstrap globals and `.o_pqr_page` are not overridden

**Scale/Scope**: one contract (`ds.hero-video`), one historical XL master (`2151:5552`, key `36011e51b8bc0b221a1ba6f9108709b5bd1c4490`), one Home usage (`2170:6351`), one direct `ds.button` dependency, three responsive compositions, four design witnesses, three primary projected surfaces plus every generated code emitter, fourteen required viewport probes including a short landscape viewport and default/long-content cases

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **I. Determinism** — the responsive model is structured contract data compiled by pure emitters; no model or manual runtime switch enters generation, and the unchanged second run must be byte- and canvas-stable.
- [x] **II. Claims Rule** — negative fixtures and registered evals must precede claims for breakpoint compilation, Figma presentation, protected-media migration, boundary exclusivity and no-op reconciliation.
- [x] **III. Contract SSoT** — Figma is the reviewed authoring input through H3; only the approved facts promoted into `ds.hero-video` and the generic schema propagate to web and Odoo. Figma, web and Odoo never synchronize laterally.
- [x] **IV. Generated Output** — edits are limited to contracts, tokens, schema/generators, proof instruments and registered manual Odoo adaptations. `src/components/`, `figma-sync/`, catalog, samples and generated Odoo assets are regenerated.
- [x] **V. Honesty** — the plan names the current `@media`/Figma breakpoint gap, the static-poster Figma projection, the Odoo video omission and any saved-markup incompatibility. A skipped or inexpressible state blocks rather than degrades silently.
- [x] **VI. Semver** — the generic responsive vocabulary is additive and optional; schema documentation is bumped. `ds.hero-video` receives an additive minor version when responsive behavior is promoted without removing or repurposing its public content props.
- [x] **VII. Engine Integrity** — every emitter change remains browser-pure; a live-only component/set or media-preservation failure adds mock fidelity and an adversarial eval before correction is claimed.
- [x] **VIII. Source Cleanliness** — the 2026-08-11/23 audits are supporting history only. A fresh master-and-usage audit by identity/position precedes H1 and every source change.
- [x] **IX. Docs-First** — `docs/responsive-figma.md`, the capability matrix, handoff determinism/tooling, page-parity and Odoo documentation define the design and proof routes used here.
- [x] **X. Before-Capture** — master, Home instance, page context, poster, properties, links and overrides are captured and validated non-empty before any live Figma mutation.
- [x] **XI. Multi-Writer Bridge** — HeroVideo and its presentation frames form one write zone owned by a single Figma writer and one global proof cycle; no Page writer is authorised.

**Post-design re-check**: passed. The design separates the owner-approved composition values from the settled 992/1400 profile and four witnesses, introduces only an optional generic capability, preserves the contract as the propagation point, and gives every destructive or persistent-state risk a refusal gate. No constitutional waiver is required. Planning occurs in the current dirty `main` checkout; implementation must move to a clean self-sufficient `027-responsive-hero-video` worktree before mutation.

## Project Structure

### Documentation (this feature)

```text
specs/027-responsive-hero-video/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── hero-video-responsive.interface.md
│   ├── responsive-decision.schema.json
│   ├── proof-ledger.schema.json
│   └── odoo-transition.md
├── decisions/                       # implementation: H1–H4 records
├── inventory/                       # implementation: fresh audit and option packet
├── proofs/                          # implementation: captures, diffs and no-op receipts
├── capitalization/                  # implementation: reusable pilot dossier
└── tasks.md                         # created by /speckit-tasks
```

### Source Code (repository root)

```text
contracts/hero-video.contract.json
packages/schema/src/contract-schema.ts
scripts/{emit-schema.ts,generate-components.ts,generate-figma.ts}
core/{emit-html.ts,emit-react.ts,emit-react-inline.ts,emit-figma-script.ts}
packages/emitter-web-components/src/emit-wc.ts
tokens/{primitives.tokens.json,semantic.tokens.json,modes/}
evals/{run.ts,fixtures/}
extract/figma/
├── projection-repair/
├── page-parity/
└── visual-parity/{subjects.ts,baseline.json}
src/components/HeroVideo/             # generated
core/samples/hero-video.*             # generated reference
figma-sync/32-herovideo.js             # generated
catalog/components/hero-video.json     # generated
integrations/odoo/
├── config/{hero-video.authoring.json,inputs.lock.json,adaptation-registry.json}
├── authoring/pages/home.json
├── addons/piqueray_ds/{views,static}/
└── qa/{scenarios,visual}/
docs/{02-contract-spec.md,responsive-figma.md,FIGMA-CAPABILITY-MATRIX.md}
```

**Structure Decision**: conserver l’architecture contract-first existante. Le nouveau vocabulaire responsive vit dans le schéma générique et un compilateur partagé par les émetteurs, tandis que `ds.hero-video` ne contient que les faits compact/Desktop/wide approuvés. Les surfaces générées restent des sorties. Odoo réutilise le DOM et les parts éditoriales actuels ; toute anatomie incompatible avec le HTML sauvegardé est un arrêt explicite, pas une migration implicite. Le profil Piqueray réemploie seulement les seuils Odoo/Bootstrap `lg=992` et `xxl=1400` sans modifier `$grid-breakpoints`, `.container`, `.row`, `.col-*` ni la grille `.o_pqr_page`.

## Design Phases

### Phase A — Geler l’autorité et obtenir H1

1. Avant toute modélisation, fixture ou décision de capacité, consulter via auggie les handoffs, `docs/responsive-figma.md`, la capability matrix, la page-parity et la documentation Odoo applicables ; enregistrer les documents, questions et réponses utilisées dans un reçu Docs-First. Une réponse documentaire existante n’est jamais redérivée localement.
2. Créer un worktree `027-responsive-hero-video` autosuffisant, y exécuter `npm install` et `npx playwright install chromium`, vérifier que la baseline de parité visuelle est versionnée dans ce worktree, puis épingler le commit, le tree Git et la version Figma avant de calibrer les transports/captures sans mutation.
3. Réauditer par identité et position le master `2151:5552`, le Container local, l’usage Home `2170:6351` et son contexte. Capturer structure, dimensions, styles, variables, poster/crop, voiles, textes, Button imbriqué, propriétés, liens et overrides.
4. Comparer ce relevé aux preuves historiques sans les substituer à la capture fraîche. Présenter les défauts préexistants séparément.
5. Enregistrer H1 avec décideur, date, preuves, compromis, refus et différés. Aucun travail responsive n’avance si le baseline n’est pas accepté.

### Phase B — Co-concevoir Mobile/Desktop et figer H2

1. Produire au moins deux options comparables Mobile/Desktop dans un harness local non autoritatif, sans écrire la source Figma. Chaque option renseigne présence, ordre DOM/visuel, axe, alignements, hauteur, marges, Text Style gouverné, CTA, média et repli faible hauteur ; XL reste le baseline actuel.
2. Tester chaque option avec le contenu par défaut et long aux témoins 390, 834, 1200 et 1728, à 320, en paysage court, puis autour de 992 et 1400. La largeur 834 utilise compact ; si elle ne respecte pas les critères, arrêter et revenir devant l’owner plutôt que créer silencieusement Tablet.
3. Appliquer la règle de mécanisme : Auto Layout si la composition reste identique, modes si seules des valeurs changent, variant uniquement pour un changement réel d’organisation. Les trois compositions runtime sont `compact`, `desktop` et `wide`; aucun variant Tablet séparé n’est créé.
4. Enregistrer H2 dans un document conforme à `contracts/responsive-decision.schema.json` : option retenue, profil 992/1400, valeurs Mobile/Desktop, limites, décideur, date, preuves et options refusées. Tout fait encore indécis bloque la mutation ; changer les seuils exige une nouvelle décision owner.

### Phase C — Adapter la source et obtenir H3

1. Après H2 et immédiatement avant toute écriture Figma — puis de nouveau avant chaque écriture ultérieure de la même campagne — réauditer le master et tous les usages par identité et position. Si une source non propre est observée, arrêter la campagne ; elle est nettoyée uniquement avec une autorisation owner distincte, puis réauditée. Ce nettoyage ne peut pas être requalifié comme delta responsive implicite.
2. Étendre la campagne mono-composant pour la seule opération approuvée. Une fixture puis un spike hors source autoritative doivent prouver toute conversion composant→set : le composant historique garde son node id/key comme membre wide/XL, ses propriétés, son poster et son Button ; l’instance Home conserve son lien et ses overrides.
3. Si le spike échoue, arrêter la migration ; ne pas reconstruire le master et ne pas remplacer l’instance Page. S’il passe, prendre le checkpoint et le jeu complet de captures avant, puis appliquer sous allowlist avec `pageWrites: []`.
4. Présenter quatre frames identifiés : Mobile 390, Tablet 834 utilisant compact, Desktop 1200 et XL 1728. Le témoin 1728 conserve le design actuel et 1440 vérifie sa continuité wide ; le simple resize Figma ne promet aucun changement de mode/variant.
5. Capturer après, vérifier texte long, CTA, média, faible hauteur, liens, overrides et absence de delta XL inattendu, puis enregistrer H3. Une observation contraire à H2 revient devant l’owner.

### Phase D — Promouvoir le modèle responsive dans le contrat

1. Ajouter des fixtures adversariales avant le code : base `minWidthPx: 0`, seuils uniques/triés, frontières 991/992/993 et 1399/1400/1401, état adjacent sans delta, absence de prop publique `viewport`, compilation automatique côté code, projection Figma explicite, refus des part paths/valeurs/Text Styles non gouvernés, placement du Button imbriqué sur toutes les sorties, conservation des images et conversion historique non destructive.
2. Ajouter au schéma un bloc `responsive` optionnel et générique. Il porte `basis: viewport-width`, une copie gouvernée des seuils, des compositions ordonnées par `minWidthPx`, des témoins Design séparés et des overrides bornés par part ; il réutilise le vocabulaire layout/token/literal existant et nomme les canaux code-only. Il ne devient ni une prop métier ni un réglage Odoo. Les nombres du contrat restent l’autorité, la référence Odoo n’est qu’une provenance vérifiée.
3. Compiler cette source par un lowering partagé : base compact puis `@media (min-width: 992px)` et `@media (min-width: 1400px)` pour HTML, CSS Modules React, référence inline, Web Components et CSS Odoo. L’inline déplace tout canal responsive dans un `<style>` déterministe et scoppé, ou refuse explicitement le contrat ; aucune propriété inline ne doit neutraliser les media queries. Figma projette Auto Layout/modes/variants selon H2 et annote ses limites de canvas.
4. Promouvoir les faits H3 dans `ds.hero-video` avec une version mineure, repinner les ancres de set/compositions sans perdre l’ancre wide historique, puis exécuter `schema`, `generate`, `figma:plan`, `catalog`, `build` et tous les quality gates constitutionnels, notamment `parity`, `eval`, `plugin:check`, le roundtrip déterministe, `core-browser-check` et les deux typechecks. La réconciliation Figma issue du contrat doit être un no-op contre la source H3 acceptée.

### Phase E — Régénérer les références et aligner Odoo

1. Régénérer React, HTML/CSS, Web Components, catalog, Figma sync, schéma et assets Odoo. Les sorties visiteurs appliquent automatiquement compact `<992`, Desktop `992–1399` et wide `>=1400`; aucun consommateur ne fournit de viewport.
2. Préserver le DOM QWeb actuel : les mêmes parts BEM et contrôles de poster, alt, titre, libellé/href CTA reçoivent la CSS responsive générée. Le Button garde un seul nœud focusable et un marqueur de placement stable si H2 exige de le dimensionner ; aucun CTA dupliqué ni `order` CSS ne peut désynchroniser l’ordre visuel et l’ordre de lecture. Le canal vidéo reste code-only et le poster reste le repli Odoo/Figma nommé.
3. Prouver qu’un `odoo -u` ne réécrit pas le `outerHTML` sauvegardé. Si H2 exige une nouvelle anatomie impossible avec le DOM existant, classer la page `structure-stale` et obtenir une décision de migration séparée avant de revendiquer la convergence.
4. Repinner lock, digest, version manifest et métadonnées uniquement après revue ; apparier toute adaptation manuelle à son marqueur du registre. Ne jamais patcher `components.pqr.css`. Qualifier séparément Odoo public et iframe éditeur à partir de leur propre `window.innerWidth`; le Header superposé reste un contexte de page distinct du composant isolé.

### Phase F — Prouver H4 et capitaliser

1. Exécuter et enregistrer la matrice de référence web 320, 390, 834, 991/992/993, 1024, 1200, 1399/1400/1401, 1440, 1728 et paysage court, avec contenu par défaut/long et vidéo indisponible. Mesurer le viewport réel, la largeur root, l’état actif, les bounds de l’union des descendants, overflow, crop, accessibilité CTA et centrage.
2. Comparer les quatre témoins 390/834/1200/1728 Figma↔référence puis référence↔Odoo sous 2 %, soit exactement huit paires fraîches, à fixture, média, police, viewport et composition identiques. Faire en plus un contrôle visuel de continuité wide Figma↔référence à 1440 sous 2 % ; il ne constitue ni un cinquième témoin de design ni une quatrième composition. Les probes de frontières restent géométriques et n’exigent pas de faux Figma automatique. Toute exclusion est localisée et approuvée.
3. Faire du viewport exact une donnée obligatoire des deux runners visuels : ni `renderWidth` dans une page fixe, ni `frameContentWidth`, ni `clip + 80` ne peuvent déterminer seuls l’état responsive. Le rapport enregistre `witnessId` ou l’identifiant de continuité, `compositionId`, `fixtureId` et les digests de conditions ; il refuse une paire manquante, répétée, périmée ou capturée dans le mauvais état.
4. Qualifier Odoo public/éditeur, sauvegarde-réouverture, deux instances et update sans mutation persistante. Vérifier tous les faits protégés et capturer Home+Header séparément du Hero isolé.
5. Rejouer génération et réconciliation sans changement : zéro fichier, création, modification, doublon, Page write ou preuve dérivante. Exécuter une dernière fois l’intégralité des quality gates constitutionnels depuis le worktree épinglé. Enregistrer H4, puis produire le dossier de capitalisation distinguant gates humains, contrôles mécaniques, arrêts, refus et limites ; ne pas créer la future skill.

## Complexity Tracking

No constitution waiver is needed. The generic responsive schema slice and the guarded standalone-component migration are justified by a demonstrated cross-surface capability gap; a HeroVideo-only CSS exception, duplicate contract or public viewport prop would be simpler locally but would violate the contract SSoT and honesty requirements.
