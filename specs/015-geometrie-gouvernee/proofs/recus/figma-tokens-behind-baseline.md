# Reçu — 81 acquittements `figma-tokens|behind` (mint from-dump, 015 lecture-seule)

**Date** : 2026-08-04
**Contexte** : après conversion d'accordion-row (T041, premier lot) et le fix
émetteur icône (`tokensByProp` mirror SVG), la sweep de vérification échoue à
`npm run parity` avec 81 nouveaux `[figma-tokens BEHIND]`.

## Le fait

`parity/diff.ts` `checkTokens()` compare chaque feuille de
`tokens/primitives.tokens.json` à un **cliché commité**
(`parity/snapshots/figma-tokens.json`), jamais une lecture Figma live. Les 6
`space.N` et 77 `size.<contrat>.<usage>` mintés en Phase 4 (§E, T037-T039)
existent dans `tokens/` mais n'ont **aucune variable Figma correspondante**
dans ce cliché — normal : ils viennent d'être mintés from-dump, jamais
poussés côté canvas.

## Pourquoi ce n'est pas un bug

- **FR-010** : 015 est Figma lecture-seule de bout en bout. Le remède que le
  différentiel lui-même imprime — « Re-run figma-sync token script (or
  figma_import_tokens ≥1.34 with creation support) » — est une **écriture**
  canvas, hors périmètre de cette spec.
- **research.md ligne 65** qualifie explicitement `parity/baseline.json`
  comme mécanisme pour « des tolérances de dérive **en cours** », par
  opposition à un vocabulaire de décision permanent (rejeté pour un autre
  usage dans la même ligne). C'est exactement ce cas : un écart temporaire,
  nommé, en attente d'un chantier canvas qui le referme.
- C'est la preuve que **le principe géométrie-en-tokens fonctionne** : avant
  conversion, ces valeurs étaient des littéraux invisibles à tout axe. Après
  conversion, elles siègent sur l'axe `canvas variables ⟷ tokens/` et le
  différentiel rapporte honnêtement que Figma n'a pas encore rattrapé le
  token — visible et tracé, au lieu d'invisible et silencieux.
- Séquence attendue (mémoire `sequence-specs-014-017.md`) : 015 = géométrie
  → tokens (lecture-seule) ; 016 = canvas. Le rattrapage Figma de ces 83
  tokens est le travail de 016, pas de 015.

## Ce qui a été fait

Les 81 sujets `figma-tokens|behind|Primitives/...` (6 `space.N` + 75
`size.*` déjà mintés au moment du contrôle — les 2 restants du total 77
apparaîtront au fil des lots T040-T043) ont été ajoutés à
`parity/baseline.json`, au même format que les 4 acquittements préexistants
(`surface|classification|subject`). Aucune valeur n'a été modifiée ; aucune
mutation canvas n'a eu lieu.

## Vérification

`npm run parity` repasse vert après l'ajout (0 drift non-acquitté, 85
acquittements désormais actifs sur les 6+81 possibles selon l'état des
conversions). Voir `proofs/check-emitter-fix-2.txt` pour la sortie complète
post-acquittement.
