# Interface — preuve par région (`pages:compare --regions`)

**Statut** : épinglée par la spec 006. Toute évolution passe par une entrée `decisions.md`.

Étend l'instrument de la spec 003 (`extract/figma/page-parity/`) **par addition stricte**.
L'interface 003 `contracts/page-proof.md` reste valide **sans amendement** : c'est la condition
d'acceptation de ce flag.

---

## 1. Pourquoi ce flag existe

`pages:compare` compare des **planches entières** et publie un `diffCount` **absolu**. FR-016 exige
un pourcentage **par occurrence**. Calculé sur la page, ce pourcentage serait creux : le bloc pèse
≈ 5 % des pixels d'une maquette, donc 2 % de page autorisent **26 à 46 %** de bloc faux selon la page
(chiffres en `research.md` R3). Le dénominateur doit être **la boîte de l'occurrence**.

---

## 2. Entrée

```
npm run pages:compare -- --before <dir> --after <dir> --out <dir> [--regions <fichier.json>]
```

`--regions` pointe un side-car JSON, **une entrée par maquette** (chaque frame a son propre décalage
en Y) :

```json
{
  "Accueil":         { "x": 389,  "y": 4384, "w": 1552, "h": 328 },
  "Contactez-nous":  { "x": 15813,"y": 2344, "w": 1552, "h": 328 }
}
```

- Les rectangles proviennent du **scan committé**, jamais saisis à la main.
- Une maquette absente du side-car est comparée **exactement comme aujourd'hui**.
- Coordonnées **relatives à la frame capturée**, en pixels de capture (`exportAsync` @1×).
- **Refus nommé** si `regionAvant ≠ regionAprès` : mesurer un rectangle mouvant n'est pas une preuve,
  c'est le piège `GROUP` qui se déclenche.
- Argument inconnu ⇒ erreur d'usage, exit 2 (comportement 003 inchangé, « jamais de défaut
  silencieux »).

---

## 3. Sortie

`PixelVerdict` gagne **quatre champs optionnels, ajoutés EN FIN** :

| Champ | Sens |
|---|---|
| `region` | le rectangle appliqué (rappel, pour relecture) |
| `regionDiffCount` | pixels rouges **dans** le rectangle |
| `regionPct` | `regionDiffCount / (w × h)`, **le chiffre de FR-016** |
| `outsideDiffCount` | pixels rouges **hors** du rectangle — **doit valoir 0** (SC-003) |

**Règle de détermination byte** : sans `--regions`, aucun de ces champs n'est posé ;
`JSON.stringify` omet `undefined` ⇒ `verdict.json` est **byte-identique** à la sortie actuelle. Le
cas de selftest qui compare deux exécutions par `Buffer.equals` continue de passer **sans
modification**.

`verdict.md` gagne les quatre colonnes **uniquement** si au moins une entrée porte une région ;
sinon le markdown est byte-identique.

**Calcul** : un **seul** `pixelmatch` pleine planche, comme aujourd'hui ; les deux compteurs se
lisent sur **le même bitmap de diff**. Aucun second diff, **aucun rééchantillonnage, aucun
recalage** — la règle R2 de la recherche 003 (« comparer le même rendu à lui-même dans le temps »)
tient toujours.

**Crops** : quand une région existe, le triptyque cadre `région ∪ diffBox padded`, pour montrer le
bloc et non une lamelle de 24 px.

---

## 4. Codes de sortie — **inchangés**

`0` = 9/9 identical · `1` = au moins un écart chiffré · `2` = refus (capture vide, dimensions,
entrée manquante) — « la preuve n'a pas eu lieu ».

Un écart **dans** le bloc est **attendu** : le verdict normal d'une adoption est donc **exit 1**,
avec 8 `diff` nommés et `Motorisation` `identical`. Écrire « l'instrument est passé » n'aurait ici
aucun sens ; ce qui se rapporte, c'est **8 diff + 1 identical**, et toute autre combinaison est un
STOP.

L'assertion `outsideDiffCount === 0` vit dans la **checklist de tâche** et dans `quickstart.md`,
comme une lecture explicite de `verdict.json` — **pas** dans le code de sortie, pour ne pas
amender l'interface 003.

---

## 5. ⚠ Le piège que ce flag ne rattrape pas

Quand les dimensions avant/après diffèrent, `compare.ts` produit `dimension-mismatch` avec
**`diffCount: 0`, `diffBox: null`, aucune image** — donc **aucun crop**, et exit 2.

**Une occurrence dans cet état n'a ni image, ni chiffre, ni crop : les quatre champs exigés par
FR-014 sont tous absents, et son chiffre vaut littéralement `0`.** Quiconque somme ou moyenne les
`diffCount` lit alors un résultat **plus propre** que la réalité.

**Règle dure** : toute ligne `dimension-mismatch` ou `capture-failed` est un **STOP avec décision
owner**, **jamais** un point de donnée. Parade en amont : contraindre le master de section à la
hauteur mesurée de l'aplat (neutralité de hauteur) et vérifier la hauteur de page immédiatement
après chaque adoption (FR-012).

---

## 6. Selftest — +2 cas (5 → 7)

- `region-inside` : un pixel inversé **dans** le rectangle ⇒ `regionDiffCount 1`,
  `outsideDiffCount 0`.
- `region-outside` : le miroir ⇒ `regionDiffCount 0`, `outsideDiffCount 1`.

Réutilise la paire de fixtures `one-pixel` existante — **aucun PNG nouveau**, seulement des
rectangles différents. Mettre à jour le compteur dans `extract/figma/page-parity/README.md`.
