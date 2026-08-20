# Phase amont (Foundational) — CLOSE le 2026-08-20

État de reprise pour un contexte neuf / un autre agent. **La Phase 2 est verte et close.**
Prochaine étape : **Phase 3 = US1 (projection Odoo), à partir de T014.**

## Portes — toutes vertes (sweep DANS le worktree)
- `npm run build` ✅ (36 composants)
- `npm run figma:plan` ✅ (figma-sync régénéré 2.0.0 — **build ne régénère PAS figma-sync**, voir gap ci-dessous)
- `npm run parity` ✅ (Header.Fond acquitté au baseline — décision owner)
- `npm run eval` ✅ **219/219** (compte imprimé qui fait foi)
- `npm run plugin:check` ✅ (engine.receipt re-pin)
- `deterministic-roundtrip` ✅ · `core-browser-check` ✅ · `tsc --noEmit` ✅ · `tsc -p tsconfig.build.json` ✅
- Re-pins : golden (189 fichiers), engine.receipt, catalog (36 composants). **Pas de polaris** (aucune édition d'émetteur). ✅

## Fait
- **Geste canvas §X (UNIQUE écriture Figma de 022)** : master `Fond=Solid` (84:284) retiré ; set `84:285` mono-variante Transparent ; 10 usages intacts par POSITION ; version nommée `2389749288451172052`. Reçus `proofs/canvas/`.
- **Contrats re-épinglés** : `ds.header` **2.0.0** (7 éditions du delta), `ds.piqueray-logo` **1.0.0** (adopté), `ds.nav-item` 1.2.0 inchangé.
- **Snapshot** `parity/snapshots/figma-components.json` rafraîchi (Header variantCount 2→1) — dérive vérifiée = Header seul.
- **3 spikes OBSERVÉS** : `spike-header.json`, `spike-actif.json`, `spike-seed.json`.

## Gaps NOMMÉS (non silencieux — pour T024/T032)
1. **Texte de T009 faux** : « `npm run build` régénère figma-sync/*.js » — FAUX. C'est `npm run figma:plan` (séparé). Détecté par l'eval `golden-generated-output` (2 régressions, corrigées). À porter au rapport de clôture (T032) comme un « fait de tâche renversé par la mesure » (patron SC-009 de 018).
2. **Logo dans la vitrine `emit-html`** : le contrat 2.0.0 émet bien le logo (`piqueray-logo--couleur-blanc`, SVG inlinés, marque orange `currentColor` + wordmark blanc). **6/7 critères de sortie visuels confirmés** (mono-variante, 4 libellés exacts, chevrons, CTA blanc + flèche, icônes 24px blanches, aucun fond). **Le 7e — visibilité pixel du logo dans la vitrine dark — n'a PAS été confirmé** (le rendu jetable laissait la zone logo vide ; l'émission standalone bute sur un check d'existence d'asset = quirk de harnais, les fichiers existent). **À VÉRIFIER à SC-001 (T024)** avec l'instrument réel (`integrations/odoo/qa/visual/render-html.mts`) : si la vitrine (RÉFÉRENCE de SC-001) ne rend pas le logo, c'est un souci d'instrument à traiter là.
3. **Résiduel `Fond:[Transparent]`** au canvas (Figma garde la propriété mono-valeur) — acquitté baseline (owner), raison durable dans `proofs/canvas/parity-baseline-header-fond.md`. Dette : une spec future peut dissoudre le set. **S'y ajoute (revue 2026-08-20)** : le figma-sync régénéré porte `isSet: false` face à un COMPONENT_SET vivant → toute exécution future du script Header prendra la branche `skipped` (shape mismatch, « a human retires the old node ») sans autre signal — la régénération canvas de ds.header est morte jusqu'à la dissolution, qui résout les deux dettes d'un geste (détail : `parity-baseline-header-fond.md`).
