# Lot `U1a-variables` — GESTES (transcription)

**Date** : 2026-08-05 · **Fichier** : `d9FYAUcqdcNtsuaMgLefvJ` (« Piqueray (Copy) »)
**Point de restauration** : `016/U1a-variables/avant` → `versionId 2384251202054787848`

---

## Le geste (T012)

Exécution de **`figma-sync/01-tokens.js` tel quel** — script généré par `npm run build`,
servi verbatim au sandbox (38 085 octets sur disque = 38 085 servis), jamais retranscrit.

```js
const resp = await fetch('http://localhost:9231/script?name=01-tokens.js');
const src  = await resp.text();
if (src.length < 30000) throw new Error('script suspect (trop court): ' + src.length);
if (!/EXPECTED_FILE_KEY = "d9FYAUcqdcNtsuaMgLefvJ"/.test(src)) throw new Error('garde de fichier absent du script servi');
if (figma.fileKey !== 'd9FYAUcqdcNtsuaMgLefvJ') throw new Error('MAUVAIS FICHIER: ' + figma.fileKey);
const rapport = await eval('(async () => {\n' + src + '\n})()');
```

Trois gardes avant la moindre écriture : taille du script, présence de son propre garde de
`fileKey`, et vérification du fichier cible côté appelant.

### Rapport du script — passe 1

```json
{
  "primitives": { "collectionId": "VariableCollectionId:4:26",    "total": 150, "created": 83 },
  "brand":      { "skipped": "no brand tokens — collection not created (T037c)" },
  "semantic":   { "collectionId": "VariableCollectionId:2027:975", "modes": ["Light"], "total": 72, "created": 0 },
  "textStyles": { "total": 0, "created": 0 }
}
```

| Annoncé | Observé | |
|---|---|---|
| 83 créations (77 `size/*` + 6 `space/*`) | **83** | ✅ |
| 0 création Semantic | **0** | ✅ |
| Collection `Brand` non créée | `skipped` | ✅ |
| 0 style de texte touché | `total: 0` | ✅ |

## Idempotence (T013)

Ré-exécution du **même** script, sans rien changer :

```json
{
  "primitives": { "total": 150, "created": 0 },
  "brand":      { "skipped": "no brand tokens — collection not created (T037c)" },
  "semantic":   { "modes": ["Light"], "total": 72, "created": 0 },
  "textStyles": { "total": 0, "created": 0 }
}
```

**Zéro création au second passage** — l'upsert converge (Performance Goals du plan).

### Relevé de contrôle après les deux passes

| Fait | Valeur vive |
|---|---|
| Primitives, total | **150** (67 avant + 83 créées) |
| dont géométriques | **99** = 78 `size/*` + 21 `space/*` |
| `font/family/montserrat` | **`"Montserrat, sans-serif"`** — la mise à jour annoncée a eu lieu |
| Collections | `Primitives`, `Semantic` — **aucune `Brand` inventée** |

## Verdict pixel (T014)

```
npm run pages:compare -- --before .page-parity/U1a-variables/before \
                         --after  .page-parity/U1a-variables/after  \
                         --out    specs/016-canvas-vrai/proofs/U1a-variables

page-parity: identical — 9/9 identical, 0 diff, 0 capture-failed, 0 dimension-mismatch (exit 0)
```

**✅ `conforme`** — l'annonce disait « `identique` sur toutes les cibles, zéro pixel ».
Les 9 maquettes le confirment. Captures AVANT vérifiées 9/9 non vides, aux dimensions
attendues, et **byte-identiques au jeu `d` de l'étalonnage** (double preuve : frames
chaudes ET rien n'avait bougé entre l'étalonnage et le lot).

---

## Trois obstacles d'outillage rencontrés, et ce qu'ils apprennent (O-5)

Le geste n'a pas abouti du premier coup. Aucun n'a touché le fichier client — tous ont
échoué **avant** toute écriture — mais ils valent d'être écrits : les trois se
reproduiront à chaque lot de US3, qui exécute 35 scripts générés de la même façon.

### 1. Les scripts générés ne sont pas servables par le receveur

`receiver.mjs` sert des fichiers (`GET /file`) mais il est **jailé sur son propre dossier**
(`extract/figma/page-parity/`) — par conception, et cet instrument est réutilisé *tel quel*.
Retranscrire 38 Ko dans l'appel d'outil aurait ouvert la porte à une divergence entre le
fichier généré et ce qui s'exécute : exactement ce que §I interdit.

**Réponse** : `specs/016-canvas-vrai/tools/serve-scripts.mjs`, un serveur spec-local en
lecture seule, jailé sur `figma-sync/`, qui sert le script **verbatim** (taille servie
vérifiée contre le disque à chaque appel).

### 2. Le manifest du plugin est figé au chargement du plugin

Premier échec : `Failed to fetch` sur le port 9230, pourtant listé dans
`~/.figma-console-mcp/plugin/manifest.json`.

Cause : le manifest sur disque a été **réécrit à 15:54:43** — quand les serveurs MCP se
sont relancés après le nettoyage d'ouverture (O-2) — alors que le plugin s'était connecté
à **15:46:18**. Le plugin exécute la liste d'origines qu'il avait au chargement ; une
modification ultérieure du fichier ne l'atteint pas.

**Règle** : les ports joignables sont ceux du manifest **au moment où le plugin a été
ouvert**, pas ceux du fichier courant. Un port se prouve par un `fetch` de test depuis le
sandbox, jamais en lisant le manifest.

### 3. CORS — le sandbox du plugin est une origine étrangère

Deuxième échec : `Failed to fetch` **aussi sur 9231**, où le receveur fonctionnait. Ce
n'était donc ni le port ni le bind. `receiver.mjs:56-59` pose
`Access-Control-Allow-Origin: *` et répond aux `OPTIONS` ; `serve-scripts.mjs` ne le
faisait pas. Sans ces en-têtes, `fetch` échoue en `Failed to fetch` **sans autre indice** —
le message est identique à celui d'un port fermé, ce qui rend le diagnostic trompeur.

### 4. Un script généré n'est pas une IIFE

Troisième échec : `SyntaxError: expecting ';'`. Les scripts *bridge* (`capture.js`,
`checkpoint.js`) sont des IIFE `(async () => {…})()` et s'évaluent directement. Les scripts
**générés** (`figma-sync/NN-*.js`) sont du code plat terminé par un `return` top-level :
ils sont conçus pour être passés en `code` à `figma_execute`, qui les enveloppe lui-même.
Servis puis `eval`és, il faut reproduire cette enveloppe :

```js
await eval('(async () => {\n' + src + '\n})()')
```

Le texte du script n'est **ni modifié ni réécrit** — seule l'enveloppe d'exécution que
`figma_execute` fournit d'ordinaire est reconstituée à l'identique.
