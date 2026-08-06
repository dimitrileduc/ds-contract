# Interface — le test de sentinelle de l'axe variables (US1, SC-002)

Prouve que la surveillance géométrie est **rebranchée** : un écart introduit côté maquette est signalé, classé, avec remède — puis que l'instrument est stable (deux passes sans geste, même verdict).

## Protocole

```text
1. état de référence      parity/extract-figma.plugin.js (figma_execute) → snapshots frais
                          npm run parity → vert, zéro acquittement de couverture géométrie
2. GESTE sentinelle       bridge : une variable de géométrie change de valeur
                          (ex. Primitives size/carte/root : 363,5 → 999) — geste consigné, réversible
3. détection              ré-extraction du cliché figma-tokens.json → npm run parity
                          ATTENDU (exact) : finding actif
                            figma-tokens|mismatch|Primitives/size/carte/root [Value]
                            detail  "tokens/ says …, Figma says 999"
                            proposedPatch { tokenPath, mode, adoptFigmaValue: 999 }
                            remedy  "Adopt into tokens/ (promotion) … or push tokens/ to Figma"
                          → signalé ET classé ET remédiable : FR-002 tenu
4. annulation             la variable reprend sa valeur ; ré-extraction ; npm run parity → vert
5. stabilité ×2 (SC-002)  deux exécutions consécutives sans AUCUN geste entre elles :
                          verdicts byte-comparables identiques (mêmes findings, mêmes comptes)
```

## Règles

- La sentinelle passe par la **valeur de variable** : c'est le canal gouverné d'une dimension liée. Le reçu (`proofs/recus/sentinelle-variables.md`) transcrit geste, sortie parity verbatim, annulation, et les deux verdicts de stabilité.
- **Limite nommée (§V)** : un détachement de liaison au niveau du nœud (detach + valeur brute) n'est pas vu en continu par l'axe tokens — il est rattrapé par l'audit de liaison (D2) et par toute régénération. Documentée dans le rapport de clôture, à l'endroit où la capacité est revendiquée.
- Le test tourne AVANT les lots US2/US3 (la surveillance protège la suite du chantier) ; il est répété en clôture sur l'état final.

## Audit de liaison (la seconde moitié de FR-001, post-US3)

`specs/016-canvas-vrai/bridge/bindings-audit.js` (lecture seule) : pour chaque master régénéré, relève `boundVariables` des champs `width`/`height`/`minWidth`/`minHeight`/`itemSpacing`/`padding*` et les confronte aux specs des scripts `figma-sync/NN-*.js` (les `fixedWidth.varName` / `bindings.*`). Sortie : `proofs/bindings-audit.json` — attendu/observé/manquant par master, zéro manquant à la clôture, tout manquant NOMMÉ (FR-011).
