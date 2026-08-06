# T005 — Étalonnage (veto) : reçu

**Date** : 2026-08-05 · **Verdict final** : ✅ **9/9 `identical`, exit 0** — le plancher de
bruit est nul et le chantier peut commencer.

Ce reçu raconte **les deux passes**, pas seulement celle qui a réussi. La première a
déclenché le veto ; le diagnostic qu'elle a imposé a produit une correction de
protocole qui vaut pour tout le chantier.

---

## Passe 1 — VETO déclenché

| | |
|---|---|
| Jeux comparés | `a` (nonce `949076dc2fa22410`) ⟷ `b` (nonce `8862b0673a32859e`) |
| Gestes entre les deux | **aucun** — lectures seules (`loadAllPagesAsync`, parcours, `exportAsync`) |
| Verdict | ❌ **8/9 `identical`, 1 `diff`** (exit 1) |
| Maquette instable | `accueil` — `diffCount=75`, `diffBox = x=609, y=2655, w=83, h=128` |

Conformément à T005, **zéro écriture** a été tentée à partir de ce moment.

### Diagnostic

Sondage par POSITION de la zone instable (absolu : x=910, y=2655, 83×128) dans
`210:326` — 4 nœuds l'intersectent :

| Chemin | Nom | Type | Bounds |
|---|---|---|---|
| `/3` | ProduitsECommerce | INSTANCE | 367,2477 · 1596×414 |
| `/3/1/0/1` | ProductCard | INSTANCE | 781,2579 · 364×312 |
| **`/3/1/0/1/0`** | **Image** | **RECTANGLE, `fills: [IMAGE]`** | **843,2579 · 240×240** |
| `/3/1/1` | CarouselControls | INSTANCE | 363,2709 · 1604×52 |

La boîte de diff recouvre partiellement le rectangle porteur d'un paint `IMAGE`.

### Preuve de la cause — 4 passes de la même frame, aucun geste

| Passe | Octets | sha256[:16] |
|---|---:|---|
| **A** (toute première du chantier) | 5 087 927 | `bef70b6bef4d941c` |
| B (2ᵉ) | 5 089 303 | `79df421d626b18ff` |
| C (3ᵉ) | 5 089 303 | `79df421d626b18ff` |
| C-bis (4ᵉ) | 5 089 303 | `79df421d626b18ff` |

**Seule la première passe diffère ; les trois suivantes sont identiques au byte près.**

### Cause retenue

La **première** capture d'une frame dont un paint `IMAGE` n'est pas encore décodé
produit un export incomplet. Une fois l'image chaude, `exportAsync` est byte-déterministe
(3 passes consécutives identiques). C'est un **artefact d'instrument**, jamais un
changement du document.

### Correction de protocole — vaut pour tout 016

> **Le premier jeu de capture d'une session ne sert jamais de référence.**
> Toute capture AVANT au sens de §X est précédée d'une passe de préchauffage sur les
> mêmes cibles ; c'est le second jeu qui fait foi.

Sans cette règle, une capture AVANT prise à froid documenterait un état antérieur qui
n'a jamais existé — et §X reposerait sur une preuve fausse. La règle est reprise dans
`decisions.md` (O-3) pour être appliquée à chaque lot.

**Cette découverte n'est écrite dans aucun document du projet** (`contracts/proof-cycle.md`,
`docs/`, les reçus de 003/005/007 sont muets dessus). Elle est portée au rapport de
clôture comme acquis d'instrument.

---

## Passe 2 — étalonnage propre, veto levé

| | |
|---|---|
| Jeux comparés | `b` ⟷ `d` (nonce `4dea91062451fd07`) — **les deux à chaud** |
| Gestes entre les deux | **aucun** |
| Verdict | ✅ **9/9 `identical`, 0 diff, 0 capture-failed, 0 dimension-mismatch** (exit 0) |
| Artefacts | `verdict.json`, `verdict.md` (ce dossier) |

Les 9 maquettes, vérifiées non vides et aux dimensions attendues avant comparaison :

| Maquette | nodeId | PNG |
|---|---|---|
| accueil | `210:326` | 1728×5430 · 5,09 Mo |
| portes-de-garage | `226:112` | 1728×4372 · 4,82 Mo |
| portes-garage-residentielles | `230:376` | 1728×6575 · 6,91 Mo |
| portes-garage-industrielles | `387:720` | 1728×6762 · 6,08 Mo |
| motorisation | `237:705` | 1728×3334 · 3,25 Mo |
| portes-entree | `237:969` | 1728×6534 · 6,60 Mo |
| depannage-sav | `249:1510` | 1728×4242 · 3,64 Mo |
| a-propos | `258:1887` | 1728×5928 · 6,53 Mo |
| contactez-nous | `274:2464` | 1728×3901 · 2,13 Mo |

## Périmètre réellement étalonné — limite nommée

L'étalonnage porte sur les **9 maquettes**, pas sur les 58 masters des pages DS relevés
en T004. Ce que cela couvre et ne couvre pas :

- ✅ Il établit le **plancher de bruit de l'instrument** (export + transport + comparaison)
  sur les frames les plus exigeantes du fichier — jusqu'à 1728×6762 et 6,9 Mo.
- ⚠️ Il n'établit pas ce plancher **frame par frame pour chaque master**. Le cycle de
  preuve l'exige de toute façon lot par lot : chaque lot capture ses propres cibles
  (maquettes **et** masters touchés) avec sa passe de préchauffage.

Cette réduction est **délibérée et nommée** : capturer 58 masters ×2 pour un étalonnage
d'ouverture coûterait plus que ce qu'il prouve, puisque le bruit mesuré est une propriété
de l'instrument et non du sujet — et que la cause trouvée (image froide) est précisément
celle qu'une passe de préchauffage éteint, quel que soit le sujet.

## Reproduction

```bash
node extract/figma/page-parity/receiver.mjs .page-parity/00-etalonnage/<jeu> 9231
# relever le nonce imprimé, puis par lots de 3 via figma_execute :
#   globalThis.__dsc003_input = { maquette, nodeId, port: 9231, expectNonce: <nonce> }
#   eval(await (await fetch('http://localhost:9231/file?name=bridge/capture.js')).text())
npm run pages:compare -- --before .page-parity/00-etalonnage/b \
                         --after  .page-parity/00-etalonnage/d \
                         --out    specs/016-canvas-vrai/proofs/00-etalonnage
```

`crops/accueil.png` conservé dans ce dossier est le triptyque du **diff de la passe 1**
(la preuve visuelle de l'image froide), pas un défaut de l'état final.
