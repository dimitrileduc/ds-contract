# T018 — Étalonnage de l'instrument (STOP-GATE) : **PASSÉ, 9/9 identical**

**Date** : 2026-07-23 · double capture des 9 maquettes **sans aucune opération
entre les deux jeux** · transport (b-fetch) retenu en T017 · verdict rendu par
`npm run pages:compare` (exit **0**) — [verdict.json](./verdict.json) ·
[verdict.md](./verdict.md).

## Résultat

| Mesure | Constat |
|---|---|
| Verdict | **9/9 `identical`**, 0 diff, 0 capture-failed, 0 dimension-mismatch, exit 0 |
| Bruit propre de l'instrument | **0** — le modèle de seuil (pixelmatch 0.1 + AA, dimensions strictes) tient |
| Au-delà de l'exigence | les **sha256 des deux jeux sont identiques maquette par maquette** : le rendu `exportAsync` @1x de ce fichier est **byte-reproductible**, pas seulement zéro-pixel |

## sha256 des deux jeux (identiques deux à deux)

| Maquette | Dimensions | Octets | sha256 (cal-1 **=** cal-2) |
|---|---|---|---|
| Accueil | 1728×5430 | 5 185 128 | `55a9c4085d2d…` |
| Portes de garage | 1728×4372 | 4 911 555 | `fd5acb71b1e2…` |
| Portes de garage résidentielles | 1728×6575 | 7 013 429 | `3f3b4c9163ba…` |
| Portes de garage industrielles | 1728×6762 | 6 106 863 | `ef28e5571450…` |
| Motorisation | 1728×3335 | 3 255 849 | `6eddd3e57829…` (= la sonde T017, session antérieure — reproductible **entre sessions**) |
| Portes d'entrée | 1728×6534 | 6 715 012 | `a13909f9af84…` |
| Dépannage/SAV | 1728×4242 | 3 701 072 | `a6b0ec23b600…` |
| À Propos | 1728×5928 | 6 625 178 | `f674c6c9bbca…` |
| Contactez-nous | 1728×3901 | 2 208 667 | `40de07ab14a0…` |

Dimensions d'export = géométrie fractionnaire arrondie au pixel entier
(ex. node 3334.39 → PNG 3335) — le critère du verdict est
`dims(before) === dims(after)`, jamais `dims === bounds` (note T017).

## Incident consigné (honnêteté) — et durcissement

Au premier essai du jeu 2, le receveur cal-2 est mort en `EADDRINUSE` (le
receveur cal-1 tournait encore — un kill conditionné à un `&&` n'avait pas été
exécuté après un crash antérieur de `manifests.mjs` sur « Dépannage/SAV »,
nom à `/` non sanitisé, corrigé depuis). Les 3 premiers POST « cal-2 » ont
atterri dans le receveur **cal-1** encore vivant — détecté par le **nonce**
identique dans les résumés de capture. Les deux jeux ont été jetés et refaits
proprement.

**Durcissement** (la leçon T017 complétée) : `capture.js` exige désormais
`input.expectNonce` — l'identité de **session** du receveur (imprimée par
`receiver.mjs` au démarrage), pas seulement l'identité d'instrument ; un
mismatch est un refus nommé AVANT tout octet. Un jeu = un receveur = un nonce.

## Conséquence

Le harnais de preuve est opérationnel : le programme peut être gaté par la
mesure. Prochain geste = **T021 (rollback drill)** — premier geste **mutant**
sur le fichier client (checkpoint + modification bac à sable + restore manuel
prouvé) : ne se lance qu'avec le go explicite de l'owner.
