# Interface — Les 4 atomes de saisie gouvernés

Chaîne par atome (ordre imposé, identique ×4) :

```text
0. Audit 003 confirmé (réutilisé, jamais refait)          → pointeur dans proofs/audits-003.md
1. npm run extract:figma:rest -- <url node> --target <N>  → dump v1 (lecture seule, _provenance + dumpedAt)
2. npm run extract:figma -- <dump>                        → <atome>.contract.proposed.json + notes/unbound NOMMÉS
3. Review humaine → adoption                              → contracts/<atome>.contract.json v1.0.0 (+ category: "atom")
4. npm run build                                          → src/components/<Name>/ généré, refus par nom sinon
5. npm run parity                                         → zéro finding actif pour l'atome
6. Contrôle visuel (subject ajouté)                       → dans la tolérance existante
```

## Ce que chaque contrat garantit (« ni plus ni moins » que le master)

| | `ds.input` | `ds.textarea` | `ds.select` | `ds.checkbox` |
|---|---|---|---|---|
| `name` | `Input` | `Textarea` | `Select` | `Checkbox` |
| `semantics.element` | `input` | `textarea` | `select` | spike (label + input natif non-dessiné, sinon repli nommé) |
| Props | `value` ← TEXT « Valeur » | `value` ← TEXT¹ | `value` ← TEXT¹ | `checked` enum `['non','oui']` ← VARIANT « Coché » |
| Icon part | — | — | `chevron-down` fixe (registre) | `check` fixe, `visibleWhen: {prop:'checked', equals:'oui'}` |
| `category` | `atom` | `atom` | `atom` | `atom` |
| Version | 1.0.0 | 1.0.0 | 1.0.0 | 1.0.0 |

¹ nom réel de la propriété relu au dump. Les bindings tokens (blanc/bleu-gris/texte)
sont ceux que le master expose réellement — extraction fait foi, écarts nommés.

## Règles transverses

- **Identité** : `anchors.figma.componentSetKey` (+ nodeId + dumpedAt) — jointure par
  CLÉ, jamais par nom d'affichage (français côté Figma, anglais côté code).
- **Interdits** : props inventées (label, size, disabled, events…) absentes du master ;
  toute édition Figma ; modélisation autour d'un défaut (défaut ⇒ signalement + gel
  FR-004, ré-extraction après fix 003).
- **Blocage** : un atome sans audit 003 validé n'est pas contractualisé (FR-006) ;
  clôture à 4/4 uniquement (pas de clôture partielle).
- **Générés, jamais édités** : `src/components/*`, stories, catalog — régénérés.

## Gates de sortie (SC-001)

`npm run build` ✚ `npm run parity` (zéro actif) ✚ `npm run eval` (compte vivant) ✚
`npx tsx scripts/deterministic-roundtrip.mjs` ✚ visual (tolérance existante) ✚
`npm run plugin:check` ✚ `node scripts/core-browser-check.mjs` ✚ `tsc` ×2.
