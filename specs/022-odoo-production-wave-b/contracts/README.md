# contracts/ — artefacts du gate « périmètre éditable » (022)

Deux fichiers, un par section : la **table de verdicts d'éditabilité** en JSON, à granularité
décision. C'est l'artefact que l'owner valide (FR-002) et qui est archivé en faisant foi
(FR-003). La version lisible vit en tête de `../plan.md` — même contenu, mêmes identifiants
(C*/P* pour Coordonnées, R*/S* pour Réassurances).

- `coordonnees.editable-scope.json` — `ds.coordonnees@2.2.0` : 10 verdicts de props
  (4 publiques + 6 de l'occurrence SectionHeader), 21 verdicts de parts, 6 actions de racine.
  Questions ouvertes : Q-C1 (bloc Tél/Email), Q-C2 (icônes sociales).
- `reassurances.editable-scope.json` — `ds.reassurances@1.2.0` : verdicts de props (racine +
  occurrences ds.carte / ds.section-header / ds.button, plans non rendus groupés), 12 lignes de
  parts, 6 actions de racine. Questions ouvertes : Q-R1 (disposition), Q-R2 (CTA), Q-R3
  (gestes de collection).

## Cycle de vie

1. `status: "proposed"` — l'état de ce dossier tant que l'owner n'a pas tranché.
2. Validation owner → `status: "validated"`, bloc `gate` rempli (qui, quand, écarts), et le
   registre du gate dans `plan.md` mis à jour en miroir.
3. Transcription 1:1 vers `integrations/odoo/config/<section>.authoring.json` (schéma figé
   `specs/019-odoo-production-foundation/contracts/authoring-config.schema.json`) — les lignes
   groupées ici (« toutes les props de l'occurrence ») y sont dépliées entrée par entrée ;
   `npm run odoo:authoring:check` refuse tout verdict manquant.
4. Toute divergence ultérieure entre table validée, config et comportement livré = défaut ou
   retour au gate (SC-007) — jamais un ajustement silencieux.

## Ce que ces fichiers ne sont pas

- Pas le format d'exécution : les sélecteurs DOM (`targetSelector`, `selector`) et les
  `decisionId` définitifs appartiennent aux configs d'authoring, écrites en phase
  d'implémentation depuis la table validée.
- Pas une extension de schéma : le vocabulaire (verdicts, mécanismes, marques, actions) est
  strictement celui de 019.
