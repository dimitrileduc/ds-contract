# Verdict de parité pixel — page-parity

**Statut global** : refus
**Code de sortie** : 2

| Maquette | Statut | diffCount | diffBox | Refus |
|---|---|---|---|---|
| a-propos | dimension-mismatch | 0 | — | dimensions before 1728x5928 != after 1728x5940 |
| accueil | dimension-mismatch | 0 | — | dimensions before 1728x5430 != after 1728x5422 |
| contactez-nous | dimension-mismatch | 0 | — | dimensions before 1728x3901 != after 1728x3883 |
| depannage-sav | dimension-mismatch | 0 | — | dimensions before 1728x4242 != after 1728x4278 |
| motorisation | dimension-mismatch | 0 | — | dimensions before 1728x3334 != after 1728x3370 |
| portes-de-garage | diff | 1367025 | x=0, y=16, w=1728, h=4356 | — |
| portes-entree | dimension-mismatch | 0 | — | dimensions before 1728x6534 != after 1728x6611 |
| portes-garage-industrielles | dimension-mismatch | 0 | — | dimensions before 1728x6762 != after 1728x6627 |
| portes-garage-residentielles | dimension-mismatch | 0 | — | dimensions before 1728x6575 != after 1728x6624 |

Crops (avant | après | diff), un par écart :

- portes-de-garage : `crops/portes-de-garage.png`

Un code de sortie 2 signifie que la preuve n'a **pas eu lieu** (refus) — ce n'est jamais un verdict « identical ».
