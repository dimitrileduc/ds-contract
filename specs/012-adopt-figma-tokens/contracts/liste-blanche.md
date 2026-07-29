# Contrat d'interface — Liste blanche & protocole d'alarme (FR-006/007, SC-004)

La preuve « dégradation impossible par construction » : ce qui a le droit de bouger,
comment on le vérifie, et ce qu'on fait quand autre chose bouge.

## La liste blanche (exhaustive)

Surfaces générées autorisées à changer — et le diff attendu de chacune :

| Surface | Diff attendu |
|---|---|
| `src/styles/tokens.css` | +77 custom properties dans `:root` (compteur build : 62 → 139) ; primitives littérales, sémantiques en `var(--…)` |
| `figma-sync/01-tokens.js` | `PRIMITIVES` 38 → 67 entrées, `SEMANTIC` 24 → 72 entrées ; `TEXT_STYLES` reste `[]`, `BRAND` reste `[]`, `SEMANTIC_HAS_DARK` reste `false` |
| `evals/golden.json` | **exactement 2 lignes de hash modifiées** (les deux surfaces ci-dessus) |

## Vérification (commandes, pas d'opinion)

Après `npm run build && npm run figma:plan && npm run golden:update` :

```bash
git diff --stat                      # le périmètre D12, rien d'autre
git diff evals/golden.json           # exactement 2 lignes -/+ de hash
git status --porcelain               # aucun fichier inattendu (untracked compris)
```

Surfaces prédites **byte-identiques** (leur hash golden ne bouge pas) :
`src/components/**`, `src/styles/tokens.dark.css`, `src/styles/tokens.brands.css`,
`figma-sync/NN-*.js` (02…), `figma-sync/batch-*.js`. Non régénérés donc intacts :
`catalog/catalog.json`, `contracts/contract.schema.json` (régénéré par le build mais
indépendant des tokens → byte-identique).

## Hors alarme (nommés, pour que l'alarme reste nette)

- `tokens/*.tokens.json` — la **source** éditée, pas une sortie générée.
- `parity/snapshots/figma-tokens.json` — entrée capturée (FR-004a).
- `parity/report.json` — reçu d'exécution du differ (réécrit par le run final propre).
- `specs/012-adopt-figma-tokens/**` — artefacts de spec et rapport.
- `parity/baseline.json` — **5ᵉ entrée ajoutée en exécution** (research D14/D15) :
  `figma-tokens|mismatch|Primitives/font/family/montserrat [Value]`, acquittement d'un
  écart pré-existant hors périmètre des 77 tokens (montserrat fait partie des 62
  EXISTANTS), jamais un acquittement des 77 eux-mêmes.
- `figma-sync/plugin/engine.receipt.json` — **amendement post-planification (D15)**,
  absent du tableau D12 d'origine : re-pin du bundle du plugin Figma (`window.DSC`),
  qui embarque `tokens/contracts/icons` et dérive donc avec toute édition de `tokens/`.
  Mécanisme séparé de `evals/golden.json`/`golden:update`, vérifié par
  `npm run plugin:check` → `verifyEngineReceipt`. Remède :
  `node scripts/build-plugin-zip.mjs --update-engine-receipt`, puis commit du reçu.

## Protocole d'alarme (FR-007)

Tout écart hors des tableaux ci-dessus — un 3ᵉ hash dans le diff du golden, un
composant régénéré différemment, un fichier untracked inattendu :

1. **ARRÊT** immédiat de l'adoption (pas de commit, pas d'acquittement baseline).
2. Diagnostic : l'écart est-il causé par l'adoption (bug de générateur révélé ?) ou
   préexistant (worktree sale) ? `git stash` des tokens + régénération à blanc pour
   isoler.
3. Explication **nommée** au rapport — et si c'est un défaut réel, il suit sa propre
   route (fixture → eval → fix), jamais un contournement dans ce chantier.
4. Le re-épinglage reste limité aux 2 entrées : un `golden:update` qui « absorberait »
   l'écart est un acquittement silencieux — **refusé**.
