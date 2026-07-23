# Contrat — Instrument de preuve zéro-pixel (`extract/figma/page-parity/`)

L'interface que le reste du programme (et l'owner en revue) peut tenir pour acquise.
Deux moitiés : la **capture** (côté canevas, via le pont — live-only) et la
**comparaison** (Node pur, déterministe, exécutable sans Figma).

## 1. Capture (bridge, live-only)

Script bridge `capture.js` exécuté via `figma_execute` (transport : R3, sondé en T0).

**Entrées** : liste des 9 frames maquettes `{ maquette, nodeId }` (issue du dernier
scan d'inventaire), répertoire de sortie local.

**Invariants** :
- `figma.loadAllPagesAsync()` d'abord — la page `Pages` (`210:325`) est locale.
- Export `exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } })` sur
  **le node frame** de chaque maquette.
- **Read-only** sur le document. Exception unique documentée : le transport (c)
  (slices temporaires) — posées hors du contenu des maquettes, retirées après, couvertes
  par checkpoint.
- Toujours **frais** : aucune réutilisation d'une capture d'une autre session/version
  (R4). Chaque preuve refait ses 18 captures (9 before + 9 after).

**Sortie** : par maquette, un PNG `@1x` + un `manifest.json` :

```json
{
  "maquette": "Accueil",
  "nodeId": "210:1234",
  "width": 1728,
  "height": 8241,
  "scale": 1,
  "sha256": "…",
  "capturedAt": "2026-07-23T14:02:11+02:00",
  "transport": "b-chunked-global",
  "statut": "ok"
}
```

`statut: "vide" | "echec"` quand l'export échoue, revient à 0 octet, sans dimensions,
ou intégralement transparent — le PNG éventuel est conservé pour diagnostic mais le
manifeste porte le refus.

## 2. Comparaison (Node, déterministe, sans Figma)

```bash
npm run pages:compare -- --before <dir> --after <dir> --out <dir>
```

**Sémantique du verdict par maquette** :

| Condition | `status` |
|---|---|
| une des deux captures `vide`/`echec`/manquante | `capture-failed` — **jamais** `identical` (FR-016) |
| `width`/`height` before ≠ after | `dimension-mismatch` — un resize est un écart réel |
| `pixelmatch(before, after, { threshold: 0.1, détecteur AA actif })` → `diffCount === 0` | `identical` |
| `diffCount > 0` | `diff` — chiffré (`diffCount`, `diffBox`), crop-triptyque écrit |

- **Aucune normalisation** : pas de recadrage content-box, pas de centrage, pas de
  resampling (contrairement à `visual-parity/alignPair` — voir R2). Comparaison brute
  dans le repère de l'export.
- Le seuil 0.1 est une **tolérance de couleur par pixel** absorbant le bruit de
  ré-échantillonnage/anti-aliasing (sémantique clarifiée en spec) — le **compte** de
  pixels au-delà doit être 0. Aucun « pourcentage acceptable » n'existe.

**Sorties** : `verdict.json` (schéma = PixelVerdict[9] + statut global, voir
data-model), `verdict.md` (résumé lisible owner : tableau 9 lignes), crops-triptyques
des écarts.

**Codes de sortie** (distincts — un refus n'est pas un écart) :

| Code | Sens |
|---|---|
| `0` | 9/9 `identical` |
| `1` | ≥1 `diff` — écart(s) chiffré(s), à présenter à l'owner (FR-015) |
| `2` | ≥1 `capture-failed` / `dimension-mismatch` / entrée manquante — refus, la preuve n'a pas eu lieu |

## 3. Selftest (fixtures, la moitié « fixture → eval → claim »)

```bash
npm run pages:selftest   # exit 0 = l'instrument se prouve lui-même
```

Cas obligatoires (fixtures committées dans `page-parity/fixtures/`) :
1. paire identique → `identical`, `diffCount 0`, exit 0 ;
2. paire à 1 pixel modifié au-delà du seuil → `diff`, `diffCount ≥ 1`, `diffBox` le localise, exit 1 ;
3. capture vide (0×0 / intégralement transparente) → `capture-failed`, exit 2 ;
4. dimensions différentes → `dimension-mismatch`, exit 2 ;
5. déterminisme : deux exécutions sur les mêmes entrées → `verdict.json` byte-identique.

## 4. Étalonnage live (T0, avant toute opération)

Double capture des 9 maquettes **sans aucune opération entre les deux** →
`pages:compare` doit rendre 9/9 `identical`. Si non : **STOP programme**, le bruit
propre de l'instrument n'est pas 0, retour owner. Ce receipt est commité dans
`proofs/T0-calibration/`.

## 5. Limites (nommées ici ET dans le README de l'instrument)

- La **capture** exige le canevas live (pont desktop) — elle n'est ni évaluable
  headless ni exécutable en CI. Seule la **comparaison** est autoportante.
- La preuve porte sur le **rendu des 9 frames maquettes** (clippé à leurs bounds) —
  pas sur les calques hors-canvas ni sur d'autres pages.
- Pas de câblage `evals/run.ts` dans cette spec ; aucune claim de capacité en
  README/docs tant qu'un eval ne la porte pas (R12).
