# Verdict de parité pixel — page-parity

**Statut global** : refus
**Code de sortie** : 2

| Maquette | Statut | diffCount | diffBox | Refus |
|---|---|---|---|---|
| depannage-sav | diff | 4563 | x=456, y=835, w=815, h=41 | — |
| master-tab | dimension-mismatch | 0 | — | dimensions before 106x261 != after 163x202 |

Crops (avant | après | diff), un par écart :

- depannage-sav : `crops/depannage-sav.png`

Un code de sortie 2 signifie que la preuve n'a **pas eu lieu** (refus) — ce n'est jamais un verdict « identical ».
