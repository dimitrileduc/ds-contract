# T023 — La reprise de Home et Portes de garage ne change rien de visible

Date : 2026-09-08 · Instance `piqueray-odoo-037` (8109) · comparaison **stricte** (`extract/image-parity`, tailles
identiques exigées, aucun recadrage, aucun redimensionnement).

Les deux descripteurs ne portent plus aucune copie locale de Devis, Réassurances ou Avis Google : ils les REPRENNENT
(`{"commun": …}`). Ils portent en plus les destinations qui étaient tranchées. La question posée ici est simple :
**est-ce que quelque chose a bougé à l'écran ?**

| Page | Largeur | Taille avant → après | Verdict |
|---|---|---|---|
| home | 390 | 390×9019 → 390×9019 | **identique** (0 pixel) |
| home | 834 | 834×8242 → 834×8242 | 2 pixels — *instabilité de capture, voir ci-dessous* |
| home | 1200 | 1200×6175 → 1200×6175 | **identique** (0 pixel) |
| home | 1728 | 1728×6411 → 1728×6411 | 183 pixels — *instabilité de capture, voir ci-dessous* |
| portes-de-garage | 390 | 390×8152 → 390×8152 | **identique** (0 pixel) |
| portes-de-garage | 834 | 834×7303 → 834×7303 | **identique** (0 pixel) |
| portes-de-garage | 1200 | 1200×5151 → 1200×5151 | **identique** (0 pixel) |
| portes-de-garage | 1728 | 1728×5258 → 1728×5258 | **identique** (0 pixel) |

## Les deux écarts ne viennent PAS de la reprise, et c'est mesuré, pas supposé

Une deuxième capture de l'état d'APRÈS, sans rien changer, donne :

- `après₁` vs `après₂` : **exactement le même écart** — 2 pixels à `(819, 76, 11×7)` en 834, 183 pixels à
  `(18, 132, 1589×221)` en 1728. Le même compte, la même boîte.
- `avant` vs `après₂` : **identique aux quatre largeurs, 0 pixel**.

Donc l'état d'après est byte-identique à l'état d'avant ; c'est la CAPTURE qui a deux états possibles. La boîte
incriminée est celle du **hero vidéo** (relevé visuel du recadrage `y = 120…370` : la façade Piqueray) : le
`<video>` en fond peint tantôt son affiche, tantôt une image décodée légèrement différente, selon l'instant où la photo
est prise. L'écart vaut **0,0017 %** de la page à 1728 et **0,00003 %** à 834 — trois ordres de grandeur sous le seuil
de 5 %, donc invisible aux verdicts, mais réel et nommé plutôt que tu.

**Conséquence pour le déterminisme (SC-005)** : sur les pages qui portent le hero vidéo — c'est-à-dire la home — le
`sha256` de la capture peut changer d'une passe à l'autre sans que rien n'ait bougé. Ligne au registre des restes
(`instabilité-de-capture (home, hero vidéo, ≤ 0,002 %)`), et le déterminisme est prouvé sur `scorePct` et
`ecartHauteurPx`, qui eux ne bougent pas.

**Verdict de la tâche : reprise sans régression.** Six largeurs sur huit à zéro pixel, et les deux autres expliquées
par une mesure, pas par un raisonnement.
