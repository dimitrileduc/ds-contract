# Lot `L-DW002` — ANNONCE

**Écrite le 2026-08-05, AVANT toute écriture.** · Point de restauration :
`016/L-DW002/avant` → `versionId 2384258061656145845`

**Défaut corrigé** : les cartes de `reassurances` débordent de leur conteneur.
Diagnostic **re-relevé au vif** (T026) — pas recopié du registre 013.

---

## Le fait, mesuré

| Variante | Cartes | Largeur | Somme | Gaps | Total | Frame `items` | **Débordement** |
|---|---:|---:|---:|---:|---:|---:|---:|
| `Disposition=4 cartes` (`2114:3619`) | 4 | 364 | 1456 | 96 | 1552 | 1550 | **+2 px** |
| `Disposition=QuatreCartesDeuxCta` (`2114:3653`) | 4 | 364 | 1456 | 96 | 1552 | 1550 | **+2 px** |
| `Disposition=5 cartes` (`2114:3693`) | 5 | **285** | 1425 | 128 | **1553** | 1550 | **+3 px** |

Le débordement est réel et visible dans les coordonnées : la première carte de la
variante `4 cartes` commence à **x = 39** pour un frame à **x = 40** — 1 px de trop de
chaque côté.

> **Le diagnostic 013 était incomplet** : il ne décrivait que `4×364 + 3×32 = 1552`.
> La variante `5 cartes` déborde davantage, et sa largeur de **285 n'est portée par
> aucun token** — invisible du différentiel par construction.

## Le geste

**Les cartes s'ajustent. Le conteneur (1550) et les gaps (32) ne bougent pas** —
décision owner, deux passes (2026-08-05).

| Cible | Avant | Après | Calcul |
|---|---:|---:|---|
| 4 cartes de `2114:3619` | 364 | **363,5** | 4 × 363,5 + 96 = **1550** ✓ |
| 4 cartes de `2114:3653` | 364 | **363,5** | idem |
| 5 cartes de `2114:3693` | 285 | **284,4** | 5 × 284,4 + 128 = **1550** ✓ |

Node ids exacts (par POSITION, relevés au vif) :
`2114:3614-3617` · `2114:3646-3649` · `2114:3687-3691`.

### Le plan image intérieur : aucun geste

Relevé vif : `img` (`I2114:3614;2063:1607`) est **`layoutSizingHorizontal: FILL`** — il
suivra la largeur de sa carte automatiquement. Sa hauteur est `FIXED` à 364 et **reste
à 364** (décision owner) : l'image cessera d'être exactement carrée (363,5 × 364).

**Écart de 0,5 px assumé et nommé ici**, plutôt que corrigé au prix d'un décalage réel
de tout le contenu situé sous l'image dans chaque carte.

## Écart visuel attendu, par cible

### Page `DS · Organisms` — le master `Reassurances` (`2114:3721`)

**Des pixels DOIVENT bouger.** Sur chacune des 3 variantes, les cartes rétrécissent et
se redistribuent : la 1ʳᵉ carte se décale de +1 px vers la droite, la dernière de −1 px
vers la gauche (−1,5 px pour la variante à 5 cartes). Le débordement s'éteint.

Un verdict `identical` sur ce master **invaliderait le lot** : il signifierait que le
geste n'a pas pris.

### Page `Pages` — les 9 maquettes

Écart attendu **partout où une instance de `Reassurances` est posée** : même
redistribution de 2 à 3 px, propagée depuis le master.

Les maquettes qui n'instancient pas `reassurances` doivent rester **strictement
identiques**. La liste exacte des maquettes porteuses est **dérivée du verdict**, pas
décrétée ici : toute maquette modifiée sans instance de `Reassurances` serait un écart
imprévu et annulerait le lot.

## Promotions code-side, dans le même lot

| Fichier | Changement |
|---|---|
| `tokens/primitives.tokens.json` | `size.carte.root` : 364 → **363,5** |
| `tokens/primitives.tokens.json` | **MINT from-dump** : un token pour la largeur des cartes de la variante 5 (284,4) — aujourd'hui valeur brute non gouvernée |
| — | `size.carte.reassurance-image` **inchangé** à 364 (décision owner) |

**Aucun nombre écrit à la main dans un contrat** : la géométrie se porte en tokens.
Aucun bump de contrat — seuls des tokens changent.

Puis : `npm run build`, ré-exécution de `figma-sync/01-tokens.js` (attendu : **1 mise à
jour**, `size/carte/root` 364 → 363,5, **zéro création**), et les re-pins dérivés
(`golden.json`, `engine.receipt.json`).

## Preuve côté code attendue

Mesure du rendu de `ds.carte` avant/après : **delta 0**. La décision owner repose sur le
fait que le CSS flex rétrécissait déjà les cartes à 363,5 — la source rejoint ce que le
code livre. **Un delta non nul contredirait la prémisse de la décision** : le consigner
et suspendre avant de continuer.

Limite nommée : l'instrument de parité visuelle rend `emit-html`, jamais la surface
React livrée (**DW-014-002**, hors périmètre). S'il sert quand même de mesure, la limite
est écrite dans le reçu — elle n'est pas tue.

## Critère de verdict

| Verdict | Condition |
|---|---|
| `conforme` | master `Reassurances` **modifié** conformément aux chiffres ci-dessus ; maquettes porteuses modifiées de 2–3 px ; maquettes non porteuses `identical` ; rapport `01-tokens.js` = 1 MAJ / 0 création |
| `annulé` | tout écart hors annonce — restauration manuelle depuis `016/L-DW002/avant`, cause écrite avant reprise (`PROCEDURE-ANNULATION.md`) |

**Cibles capturées** : les 9 maquettes de `Pages` **+** le master `Reassurances` sur
`DS · Organisms`, précédées d'une passe de préchauffage (règle O-3).
