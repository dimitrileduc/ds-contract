# Verdict de parité pixel — page-parity

**Statut global** : refus
**Code de sortie** : 2

| Maquette | Statut | diffCount | diffBox | Refus |
|---|---|---|---|---|
| Accueil | diff | 8466 | x=225, y=1320, w=589, h=563 | — |
| Contactez-nous | diff | 26613 | x=90, y=456, w=1523, h=2503 | — |
| Dépannage_SAV | dimension-mismatch | 0 | — | dimensions before 1728x4242 != after 1728x4266 |
| Motorisation | dimension-mismatch | 0 | — | dimensions before 1728x3334 != after 1728x3358 |
| Portes d_entrée | dimension-mismatch | 0 | — | dimensions before 1728x6534 != after 1728x6558 |
| Portes de garage | diff | 35545 | x=92, y=389, w=1239, h=3043 | — |
| Portes de garage industrielles | dimension-mismatch | 0 | — | dimensions before 1728x6762 != after 1728x6698 |
| Portes de garage résidentielles | diff | 29600 | x=90, y=456, w=1262, h=5177 | — |
| À Propos | diff | 23442 | x=92, y=454, w=1253, h=4532 | — |

Crops (avant | après | diff), un par écart :

- Accueil : `crops/Accueil.png`
- Contactez-nous : `crops/Contactez-nous.png`
- Portes de garage : `crops/Portes de garage.png`
- Portes de garage résidentielles : `crops/Portes de garage résidentielles.png`
- À Propos : `crops/À Propos.png`

Un code de sortie 2 signifie que la preuve n'a **pas eu lieu** (refus) — ce n'est jamais un verdict « identical ».
