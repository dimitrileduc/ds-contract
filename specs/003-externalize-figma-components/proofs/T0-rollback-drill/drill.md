# T021 — Drill de rollback de bout en bout : **PASSÉ**

**Date** : 2026-07-24 · restore **manuel exécuté par l'owner** (historique de
versions natif — aucune API programmatique, R5) · verdict collatéral :
[verdict.json](./verdict.json) / [verdict.md](./verdict.md), **9/9 `identical`, exit 0**.

## Séquence exécutée

| # | Étape | Receipt |
|---|---|---|
| 1 | Captures fraîches `before/` ×9 (transport b-fetch, nonce `65c5fa8d…`) | manifestes drill-before, 9/9 ok |
| 2 | Checkpoint `003/rollback-drill/avant` | versionId `2379687215163752024` |
| 3 | Mutation témoin sur **page bac à sable** (jamais les 9 maquettes) : page `003 · Bac à sable (drill)` (`2049:1002`) + rectangle `TEMOIN-T021` 200×100 (`2049:1003`) | fichier passé à 3 pages |
| 4 | Preuve de **présence** (relecture par appel séparé, post-recyclage sandbox) | page + rect trouvés par id |
| 5 | **Restore manuel owner** : Show version history → `003/rollback-drill/avant` → Restore | geste humain guidé (quickstart §Rollback) |
| 6 | Preuve **positive de disparition** : relecture par id ET par nom → `DISPARUE` / `DISPARU`, fichier revenu à 2 pages (`Assets`, `Pages`) | sans cette preuve le drill ne peut pas échouer (les maquettes n'étant pas touchées, le 9/9 passerait même sur un restore silencieusement raté) |
| 7 | Captures fraîches `after/` ×9 (receveur neuf, nonce `c557d85b…`) → `pages:compare` | **9/9 `identical`, exit 0** |

## Observations de conditions réelles (nommées, pas cachées)

1. **Le restore ferme le plugin Desktop Bridge** (rechargement du document) —
   procédure augmentée : après un restore, relancer le plugin (Plugins →
   Development → Figma Desktop Bridge) avant toute vérification.
2. **Octets ≠ pixels — la sémantique du seuil validée en réel** : après le
   rechargement, `Portes de garage résidentielles` s'est ré-encodée
   (+1 042 octets, sha256 différent) mais le verdict est `identical` :
   **0 pixel hors bruit AA** (re-rasterisation subpixel des glyphes, classée
   anti-aliasing par le détecteur). C'est exactement le comportement clarifié
   en spec — le compte HORS bruit AA doit être 0, et il l'est.
3. **Dérive nocturne détectée AVANT le drill** (receipts committés dans
   [derive-nocturne/](./derive-nocturne/)) : entre les captures du 23 au soir
   (étalonnage T018) et celles du 24 au matin, 2 maquettes ont bougé —
   `Portes de garage` (diffCount **2 039**, diffBox 534×116 @ y=390) et
   `Portes de garage résidentielles` (diffCount **4 080**, diffBox 601×52 @
   y=456), les 7 autres byte-identiques. Les crops montrent les **titres hero**
   avec glyphes déplacés (~1 px, HORS bruit AA — un vrai déplacement, pas du
   ré-encodage). Aucune police manquante détectée (`hasMissingFont` = 0 sur
   les 9 maquettes). **Cause à trancher par l'owner** (édition des titres ?
   mise à jour Figma ?) — anomalie en attente, entrée journal à la décision.
   Le drill n'est **pas contaminé** : ses `before/` ont été refaits frais le
   matin même, après la dérive.
4. **Le sandbox plugin est recyclé entre appels** aujourd'hui (il persistait le
   23) — les scripts bridge sont invoqués de façon autonome (re-fetch du
   source via `GET /file` à chaque appel). Aucun impact sur le transport :
   (b-fetch) ne dépend pas de la persistance inter-appels.

## Conséquence

La réversibilité est **prouvée, pas supposée** : tout geste mutant du programme
est désormais couvert par un filet exercé de bout en bout (checkpoint nommé →
restore manuel guidé → preuve positive → contrôle pixel collatéral).
Le harnais d'incrément (US1 pixel + US5 rollback + US4 ledger) est complet.
