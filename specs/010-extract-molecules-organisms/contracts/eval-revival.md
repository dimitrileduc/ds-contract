# Interface Contract — Réactivation des évals quarantainées (FR-018, règle hybride)

**Sources (docs-first §IX, ne pas re-définir)** : `docs/handoff/09-testing-and-gates.md` +
`evals/REMOVED-CASES.md` §Re-enabling a case. Mécanisme exact : déplacer le bloc de
`evals/legacy-cases.ts` vers le tableau `cases` de `evals/run.ts` (move, pas rewrite — harnais
partagé), retirer la ligne du tableau REMOVED-CASES, re-synchroniser les compteurs datés.
Re-pointage des chaînes de fixture sur le sujet Piqueray si besoin (précédent 006 T061).
Compte vivant à la date du plan : 113 actives / 48 quarantainées.

## A. Obligatoire — débloqué par les 27 composants de 010

| Cas | Condition `RE-ENABLE WHEN:` (citée) | Déclencheur 010 |
|---|---|---|
| `heading-margin-reset` | « a Piqueray component whose root is a UA-margined element (h1-h6, p, blockquote, ul, hr) » | TexteSEO / FAQ / Presentation / Copyright — confirmé à l'adoption (racine h1–h6/p probable) |
| `design-roundtrip-anatomy-zero-mismatch` | « a Piqueray component whose contract was GENERATED to the canvas (not authored away from it), so the round trip is an identity » | toute cible 010 dont la review ne change rien à la proposition (round-trip identité) |
| `design-roundtrip-uncorrelated-binding-is-mismatch-not-guess` | (même condition) | idem |

## B. Conditionnel — seulement si une capacité est adoptée (nommé à la clôture)

| Cas / famille | Condition | Sonde 010 |
|---|---|---|
| Famille états (`refuse-hollow-state-previews`, `state-previews-bounded-canvas-only`, `state-axis-drift-both-directions`, `focus-not-pressed-browser-probe`, `wc-emitter-css-parity`) | « a Piqueray component with interaction states » | Tab / NavItem portent-ils hover/selected dans leur proposition ? |
| `detect-code-removed-event` | « a Piqueray contract with a declared event » | CarouselControls déclare-t-il des events ? |
| `refuse-elementByProp-gaps` | « host element varies by prop (elementByProp) » | NavItem/Tab `<a>` vs `<button>` ? SectionHeader h1–h6 ? |
| `token-size-live`, `naxis-full-cartesian-product` | « size/secondary enum axis » / « two or more enum axes » | lu dans les propositions |
| `switch-canvas-thumb`, `refuse-stylesWhen-outside-whitelist`, `refuse-overlay-inflow-conflicts`, `layoutByProp-flip-both-surfaces` | capacités spécifiques | improbable — confirmé absent à la review |
| `design-rest-*` ×3, `design-mcp-roundtrip-fixture-replay` | fixture REST / enregistrement MCP d'un composant Piqueray | capture dédiée — décision à la clôture (effort nommé) |
| `judge-passes-canonical-screen`, `judge-catches-all-violation-classes`, `wc-emitter-roundtrip`, `depth-composite-child-collection`, `playground-caption-consistency` | fixtures d'écran/catalogue à ré-écrire | effort séparé — décision à la clôture |

## C. Famille SLOT — suspendue à la décision Field (L2)

La proposition `field.contract.proposed.json` porte un `slot` (`Saisie`, accepts
`[ds.input, ds.select, ds.textarea]`, `acceptsMode: prefer`, `defaultContent`).

- **Si Field adopte le slot** (premier exercice Piqueray) → réactiver :
  `detect-figma-missing-slot-property`, `detect-figma-accepts-drift`,
  `detect-code-removed-slot-prop`, `refuse-defaultContent-outside-accepts`,
  `detect-figma-missing-multislot-content`, `slot-empty-not-placeholder`,
  `preferred-values-accepts` — **du fait de cette itération**.
- **Si Field est adopté sans slot** (INSTANCE_SWAP laissé côté Figma seulement, statu quo 003) →
  la famille reste en quarantaine ; la décision est nommée avec motif dans le rapport de clôture.

## D. Dette adjacente — conditions déjà remplies depuis 004/006 (triage owner à la clôture)

Hors « du fait de cette itération » au sens strict, mais mécanisme identique et coût marginal :
`plugin-propose-dry-run` (re-point de chaînes seulement — REMOVED-CASES : « nothing » d'autre),
`plugin-update-report`, `plugin-engine-bundle`, `repeated-children-collection` (reçu rouge
pré-existant nommé 006 T062 — fixtures à re-pointer), `array-prop-code-only-skipped-everywhere`
(fixture CrumbTrail liée à des tokens demo supprimés), `key-based-linking`, `stub-geometry-render`,
`design-census-unmappable-child-props-dropped`, `design-census-boolean-visiblewhen-truthy-form`,
`design-census-digit-led-prop-binding-prefixed`, `pending-first-sync-not-drift` (bloqué sur
baseline parité — séparé de 010), `checkbox-native-input` (toujours bloqué : pas de switch),
`refuse-role-recreating-native-control` (sauf si un contrat 010 déclare `roleException`).

**Règle** : chaque cas trié (réactivé dans 010 / reporté) est nommé dans le rapport de clôture —
jamais de réactivation silencieuse.

## E. Restent gelés (hors 010 — rappelé pour honnêteté)

`refuse-incomplete-mode-set`, `brand-added-token-layer-only` (pas de second thème/brand),
`text-styles-from-typography-tokens` (gap moteur nommé : corpus dérive de `font.<group>.size`,
la typographie Piqueray vit à `typography.<role>.*`).

## F. Compteurs à re-synchroniser à chaque réactivation

1. Ligne datée « Counts » de `evals/REMOVED-CASES.md` (règle hybride).
2. Rapport de clôture 010 : retraits/ajouts nommés + compte vivant final (jamais codé en dur
   ailleurs — Principle II).
