# T007 — Étalonnage de l'instrument (STOP-GATE) : **PASSÉ, 9/9 identical**

**Date** : 2026-07-25 · double capture des 9 maquettes **sans aucune opération
entre les deux jeux** · verdict rendu par `npm run pages:compare` (exit **0**)
— [verdict.json](./verdict.json) · [verdict.md](./verdict.md).

## Résultat

| Mesure | Constat |
|---|---|
| Verdict | **9/9 `identical`**, 0 diff, 0 capture-failed, 0 dimension-mismatch, exit 0 |
| Bruit propre de l'instrument | **0** |
| Au-delà de l'exigence | les **sha256 des deux jeux sont identiques maquette par maquette** (voir tableau) — le rendu `exportAsync` @1x de cette session est **byte-reproductible**, pas seulement zéro-pixel |

## sha256 des deux jeux (identiques deux à deux)

| Maquette | Dimensions | Octets | sha256 (a = b) |
|---|---|---|---|
| Accueil | 1728×5430 | 5 169 365 | `cd96a88da848…` |
| Portes de garage | 1728×4372 | 4 900 866 | `847f75164901…` |
| Portes de garage résidentielles | 1728×6575 | 6 983 720 | `3ceedee6a76f…` |
| Portes de garage industrielles | 1728×6762 | 6 163 442 | `afc8b45d024f…` |
| Motorisation | 1728×3334 | 3 250 617 | `34c6f8b43da8…` |
| Portes d'entrée | 1728×6534 | 6 691 866 | `58985ce9d177…` |
| Dépannage/SAV | 1728×4242 | 3 715 162 | `7e30a00830fc…` |
| À Propos | 1728×5928 | 6 611 259 | `f0c16823fcbe…` |
| Contactez-nous | 1728×3901 | 2 207 821 | `3a6d9fdf6f3b…` |

Nonces de session distincts entre les deux jeux (`15eb949186294fe0` puis
`7d403c060c44fee2`) — l'identité du receveur a été vérifiée avant chaque jeu,
jamais supposée.

## Conséquence

Le harnais de preuve est opérationnel pour cette itération : le programme peut
être gaté par la mesure. Le programme peut passer en Phase 3.
