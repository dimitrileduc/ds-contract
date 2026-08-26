# Runner responsive — sweep complet

**Exécuté le :** 2026-08-26, après le premier passage vérifié et le second passage no-op  
**Requalifié par l'owner le :** 2026-08-26  
**Verdict T038 :** PASS avec dette baseline préexistante explicitement conservée.

## Commandes et résultats

```bash
npm run eval
npx tsc --noEmit
npx tsc -p tsconfig.build.json
```

- `npx tsc --noEmit` : PASS.
- `npx tsc -p tsconfig.build.json` : PASS.
- `npm run eval` : FAIL, 229/234.
- Les quatre evals 028 sont PASS dans ce sweep :
  `figma-responsive-component-set-declared-creates`,
  `figma-responsive-presentation-scenarios-explicit`,
  `figma-responsive-bindings-typography-allowlisted` et
  `figma-responsive-boundary-idempotence`.

## Gates globales rouges

| Eval ID | Observation du runner |
| --- | --- |
| `baseline-parity-clean` | six propriétés `GoogleReviewsSection` manquent dans le set Figma courant |
| `baseline-acknowledges-without-failing` | la baseline de parité courante ne ferme plus le cas attendu |
| `promotion-converges` | findings supplémentaires Button/GoogleReviewsSection dans la parité courante |
| `golden-generated-output` | 25 sorties générées divergent du golden courant |
| `preservation-013-clobber-detected` | la parité n'est plus propre pour cette fixture historique |

Ces gates ne passent pas par les modules `extract/figma/projection-repair/*`, le
transport `component-repair-bridge.mjs` ni les quatre fixtures 028. Elles
reproduisent l'état de parité/golden déjà divergent du worktree inventorié avant
l'implémentation. Les deux typechecks, les quatre evals 028 et leurs fixtures
historiques voisines passent : aucune régression attribuable à la capacité
responsive n'est observée.

Le sweep a été rejoué après les derniers durcissements natifs et après le reçu
live no-op. Le résultat reste exactement 229/234 avec les cinq mêmes IDs rouges ;
aucune sixième régression n'est apparue. Le fichier `evals/results.json` contient
ce dernier run.

Le sweep a été rejoué une nouvelle fois après la correction des largeurs
d'aperçu et de la valeur par défaut Wide. Résultat inchangé : 229/234, avec les
mêmes cinq IDs rouges et les quatre evals responsive vertes. Les deux typechecks
restent PASS ; aucune régression supplémentaire n'a été introduite par `run-005`.

Le 2026-08-26, après présentation exacte de ce delta, l'owner a demandé de
continuer en traitant ces cinq rouges comme une dette préexistante. Cette
disposition n'est pas renommée `full-suite-green` et n'efface pas la dette ; elle
autorise uniquement le spike jetable puis la préparation du plan H3.

## Disposition

- La capacité responsive est qualifiée par ses gates ciblés et les deux
  typechecks, avec cinq rouges globaux préexistants nommés ci-dessus.
- Le statut honnête reste
  `qualified-with-owner-accepted-pre-existing-baseline-debt`, jamais
  `full-suite-green`.
- Le mechanism spike T039/T040 et la préparation read-only T041/T042 peuvent
  avancer.
- Aucune mutation du master n'est autorisée avant présentation de cette
  exception et GO explicite H3.
