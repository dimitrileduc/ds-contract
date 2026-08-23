# Verdict de parité pixel — page-parity

**Statut global** : refus
**Code de sortie** : 2

| Maquette | Statut | diffCount | diffBox | Refus |
|---|---|---|---|---|
| frame-01 | diff | 9539 | x=99, y=456, w=684, h=2503 | — |
| frame-02 | diff | 12741 | x=93, y=454, w=973, h=54 | — |
| frame-03 | diff | 7678 | x=99, y=488, w=689, h=52 | — |
| frame-04 | diff | 12940 | x=93, y=488, w=1065, h=49 | — |
| frame-05 | dimension-mismatch | 0 | — | dimensions before 1728x3361 != after 1728x3335 |
| frame-06 | diff | 11793 | x=93, y=456, w=815, h=52 | — |
| frame-07 | diff | 13113 | x=93, y=456, w=973, h=52 | — |
| frame-08 | diff | 419951 | x=0, y=389, w=1728, h=2222 | — |
| frame-09 | dimension-mismatch | 0 | — | dimensions before 1728x5488 != after 1728x5462 |

Crops (avant | après | diff), un par écart :

- frame-01 : `crops/frame-01.png`
- frame-02 : `crops/frame-02.png`
- frame-03 : `crops/frame-03.png`
- frame-04 : `crops/frame-04.png`
- frame-06 : `crops/frame-06.png`
- frame-07 : `crops/frame-07.png`
- frame-08 : `crops/frame-08.png`

Un code de sortie 2 signifie que la preuve n'a **pas eu lieu** (refus) — ce n'est jamais un verdict « identical ».
