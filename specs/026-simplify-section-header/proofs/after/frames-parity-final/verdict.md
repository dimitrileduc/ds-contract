# Verdict de parité pixel — page-parity

**Statut global** : refus
**Code de sortie** : 2

| Maquette | Statut | diffCount | diffBox | Refus |
|---|---|---|---|---|
| frame-01 | identical | 0 | — | — |
| frame-02 | identical | 0 | — | — |
| frame-03 | identical | 0 | — | — |
| frame-04 | identical | 0 | — | — |
| frame-05 | dimension-mismatch | 0 | — | dimensions before 1728x3361 != after 1728x3335 |
| frame-06 | identical | 0 | — | — |
| frame-07 | identical | 0 | — | — |
| frame-08 | diff | 408016 | x=0, y=2114, w=1728, h=497 | — |
| frame-09 | dimension-mismatch | 0 | — | dimensions before 1728x5488 != after 1728x5462 |

Crops (avant | après | diff), un par écart :

- frame-08 : `crops/frame-08.png`

Un code de sortie 2 signifie que la preuve n'a **pas eu lieu** (refus) — ce n'est jamais un verdict « identical ».
