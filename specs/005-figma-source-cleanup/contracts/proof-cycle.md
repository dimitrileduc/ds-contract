# Contrat — Le cycle de preuve

**L'interface la plus load-bearing de l'itération** : elle décide ce qui compte comme
« fait ». Tenue pour acquise par toutes les tâches. Instrument :
`extract/figma/page-parity/`, **réutilisé tel quel** (son README porte ses limites).

## 1 · La séquence, dans cet ordre exact

```text
0. version enregistrée      figma.saveVersionHistoryAsync("005/<passe>/<étape>")   → versionId
1. relevé de structure      bridge/scan.js (lecture seule, par POSITION)           → releves/*.json
2. diff attendu ANNONCÉ     écrit dans decisions.md AVANT toute écriture
3. capture AVANT × 9        receiver.mjs :9227 + bridge/capture.js                 → .page-parity/<cycle>/before/
4. vérification des 9 PNG   non vides, dimensions plausibles                       → sinon STOP, aucune écriture
5. [archive]                clone vectoriel sur `Archive · Spec A` si destructif
6. LE(S) GESTE(S)           figma_execute — script transcrit dans proofs/<cycle>/gestes.md
7. capture APRÈS × 9        même receveur, même transport
8. verdict                  npm run pages:compare -- --before … --after … --out …
9. artefacts                proofs/<cycle>/{verdict.json,verdict.md,crops/,gestes.md}
```

**Les étapes 0 à 4 précèdent toute écriture. Sans exception.** Une passe qui démarre sans
`versionId` est arrêtée (FR-040) : sans lui, le rapport ne peut pas produire le lien d'état
antérieur qu'il doit porter.

## 2 · Le verdict — mécanique, jamais une appréciation

`pixelmatch` seuil **0.1**, détecteur anti-aliasing **actif**, dimensions **strictes**
(aucune normalisation, aucun recadrage, jamais `alignPair`). Le before/after sort du **même
renderer** (`exportAsync`, même node) : un écart de taille ou de position **est** le signal.

| Statut par maquette | Signification | Exit du run |
|---|---|---|
| `identical` | 0 pixel différent hors bruit AA | `0` si 9/9 |
| `diff` | écart mesuré, localisé par `diffBox`, crop triptyque émis | `1` |
| `capture-failed` | capture vide / transparente | `2` |
| `dimension-mismatch` | before ≠ after en dimensions | `2` |

**Exit 2 = la preuve n'a pas eu lieu.** C'est un refus, jamais une dégradation vers
« identique » : une capture vide n'est pas la preuve que rien n'a bougé.

## 3 · Les deux verdicts d'itération

| Le lot annonçait | Observé | Verdict |
|---|---|---|
| **0 pixel** | 9/9 `identical` | ✅ acquis |
| **0 pixel** | ≥1 `diff` | ❌ **STOP** — lot annulé **en entier**, cause identifiée **avant** toute reprise. On ne requalifie jamais après coup un écart imprévu en « bruit de rendu » |
| **un diff nommé** | conforme à l'annoncé | ✅ acquis, crop joint |
| **un diff nommé** | plus grand que l'annoncé | ❌ **STOP** — dépassement |
| **un diff nommé** | plus petit / ailleurs | ❌ **échec de prédiction** — le geste n'a pas fait ce qu'on croyait. On ne valide pas parce que « c'est joli » |

## 4 · Étalonnage d'ouverture (bloquant, une fois)

Double capture des 9 maquettes **sans rien faire entre les deux** → doit rendre **9/9
`identical`**. Sinon le plancher de bruit de l'instrument n'est pas nul et tout verdict aval
serait faux : **STOP programme**, retour owner. Receipt committé dans
`proofs/00-etalonnage/`.

## 5 · Ce que le pixel ne voit pas — et qui le rattrape

Le gate pixel attrape la perte **visuelle**. Il est aveugle par construction à la perte
d'**intention** : une personnalisation écrasée par une valeur au rendu identique ne bouge
aucun pixel. C'est le rôle du **ledger** (`contracts/` de la 003, validateur
`npm run pages:ledger:check`), requis pour l'unique geste d'adoption de l'itération
(Section-header ×6). Un ledger **vide explicite** (`entrees: []`) est requis si le pré-diff
ne trouve rien — jamais un fichier absent.

## 6 · Fraîcheur

Aucun cache, aucune baseline, aucun `--refresh` — **par conception**. Chaque preuve
re-capture ses 18 PNG dans la même session que le geste. (L'autre harnais du dépôt,
`visual-parity`, cache par version de fichier et a coûté du temps réel en spec 001 sur un
`--refresh` oublié. Celui-ci n'a rien à oublier.)

## 7 · Retour arrière

**Aucune API de restauration programmatique n'existe.** La restauration est un geste
humain guidé par l'historique de versions natif (Figma desktop → Show version history →
restaurer le point nommé), puis **re-prouvée par l'instrument** : capture fraîche vs les
captures `before` du cycle annulé → doit rendre 9/9 `identical`. L'échec et le retour
arrière sont consignés dans `decisions.md`.

## 8 · Périmètre et limites nommées

- **La capture est live-only** : pont desktop figma-console contre une app Figma ouverte.
  Non headless, non CI.
- **Le périmètre du juge est les 9 frames maquettes, clippées à leurs bounds** — rien
  d'autre. Les masters eux-mêmes ne sont pas capturés : ils sont prouvés **par leur effet**
  sur les 9 pages.
- **Non câblé dans `evals/run.ts`** : la suite ne tourne pas en worktree et la capture exige
  un canvas live. Aucune claim de capacité n'est ajoutée par cette itération (principe II).
- **Le transport (b-fetch, port 9227) exige le receveur démarré et identifié** (`/health`
  doit répondre `instrument: "page-parity"` + le nonce de session) : un octet confié à un
  puits inconnu est un octet perdu en silence.
