# Reçu — hero-gradient-carry (T035, US1, FR-012, cause 015 `gradient-carry`)

**Date** : 2026-08-04 · **Cause 015** (data-model.md §8) : `gradient-carry` · **Ligne** : `hero/hero-master-defaults` (audit d'organismes).

## 1. Ce qui était prévu (re-triage, pas une découverte)

`specs/014-mesure-juste-triage/proofs/registre/causes.json` § `organismLines` classe déjà la ligne hero `image-boundary` (reçu `org-hero-image`, 27,83 % mesuré). La description datée du contrat `ds.hero` v1.3.0 chiffrait précisément la part attribuable aux deux voiles GRADIENT_LINEAR (jusque-là non représentés) : « the two veils darken 452 of the root's 640 px rows and account for 28.07 % of the master's pixels ». Cette re-mesure vérifie cette prévision, elle ne la découvre pas.

## 2. Re-mesure (scratch, non-officielle — la mesure officielle 015 se fait à la clôture, Phase 7)

Audit d'organismes re-mesuré (`build-registre.mts --phase avant --out-dir <scratch jetable>`, jamais les registres officiels de 014 ni l'« avant » verrouillé de T005) :

| État | `rawPct` |
|---|---:|
| Avant T031 (voiles absents, encore un `invisible-literal`) | 27,829047 % |
| Après T031 (voiles portés en littéraux nommés, `GRADIENT_LINEAR` natif côté canvas via T030) | 10,661689 % |
| **Delta** | **−17,167 points** |

## 3. Attribution

Le mouvement de −17,17 points est la **réparation attribuée** `gradient-carry` : les deux voiles, absents avant 015, sont maintenant portés fidèlement sur les 4 surfaces (reçu `hero-gradients-named-literal.md`). Le résiduel de 10,66 % restant n'est **pas** un défaut nouveau : la même description du contrat (§ ci-dessus, non modifiée par 015) documente la cause exacte — le plan photo (`fills[0]`, `backgroundUrl`) n'a toujours aucun transport contrat→canvas (limite A5/§a.7 de `docs/FIGMA-CAPABILITY-MATRIX.md`, hors périmètre de 015) ; c'est le plancher de rastérisation/photo déjà nommé, pas un écart que T031 aurait dû fermer. La ligne reste classée `image-boundary` dans le registre vivant de la porte de mesure (`causes.json`) — 015 ne réclasse PAS cette ligne, seule sa magnitude a bougé, et la cause `image-boundary` continue de la décrire correctement.

## 4. Conséquence sur le comptage de la porte de mesure

Aucune. `evaluateMeasureGate` compte par **cause**, pas par magnitude (`rawPct > 0` suffit) — la ligne hero comptait déjà 1 sous `image-boundary` avant 015 et continue de compter 1 sous `image-boundary` après. Le comptage `contract-geometry` (celui que 015 doit amener à 0, SC-005) n'inclut jamais la ligne hero. Cette réparation est réelle et mesurée, mais elle ne fait PAS partie du critère de clôture SC-005 — elle est publiée ici par honnêteté (FR-011 : toute variation porte une cause), pas parce qu'un gate en dépend.

## 5. Attribution consignée

`specs/015-geometrie-gouvernee/proofs/registre/attributions.json § byKey["hero/hero-master-defaults"] = "gradient-carry"` — prête pour la re-mesure officielle de clôture (Phase 7, T064-T065), qui confirmera ce chiffre dans le registre avant/après verrouillé plutôt que dans ce scratch jetable.
