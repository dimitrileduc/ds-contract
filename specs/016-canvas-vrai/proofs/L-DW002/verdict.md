# Verdict de parité pixel — page-parity

**Statut global** : diff
**Code de sortie** : 1

| Maquette | Statut | diffCount | diffBox | Refus |
|---|---|---|---|---|
| a-propos | diff | 24859 | x=88, y=3643, w=1552, h=469 | — |
| accueil | diff | 37086 | x=87, y=3656, w=1554, h=470 | — |
| contactez-nous | identical | 0 | — | — |
| depannage-sav | identical | 0 | — | — |
| master-reassurances | diff | 72031 | x=0, y=131, w=1552, h=2218 | — |
| motorisation | identical | 0 | — | — |
| portes-de-garage | diff | 37235 | x=87, y=2091, w=1554, h=470 | — |
| portes-entree | diff | 18461 | x=88, y=2075, w=1552, h=492 | — |
| portes-garage-industrielles | diff | 15182 | x=88, y=2102, w=1552, h=469 | — |
| portes-garage-residentielles | diff | 16903 | x=88, y=2075, w=1552, h=493 | — |

Crops (avant | après | diff), un par écart :

- a-propos : `crops/a-propos.png`
- accueil : `crops/accueil.png`
- master-reassurances : `crops/master-reassurances.png`
- portes-de-garage : `crops/portes-de-garage.png`
- portes-entree : `crops/portes-entree.png`
- portes-garage-industrielles : `crops/portes-garage-industrielles.png`
- portes-garage-residentielles : `crops/portes-garage-residentielles.png`

Un code de sortie 2 signifie que la preuve n'a **pas eu lieu** (refus) — ce n'est jamais un verdict « identical ».
