# T017 — Sonde du transport des octets de capture (R3)

**Date** : 2026-07-23 · session live, pont desktop figma-console (websocket port 9224,
plugin Desktop Bridge 1.35.0, probe 6 ms) · fichier `Piqueray (Copy)`
(`d9FYAUcqdcNtsuaMgLefvJ`), page `Pages` (`210:325`).

## Décision

**Transport retenu : (b-fetch)** — `exportAsync({ format: 'PNG', constraint:
{ type: 'SCALE', value: 1 } })` dans le sandbox plugin, puis **POST `fetch()` direct
vers un receveur HTTP localhost dédié** (`extract/figma/page-parity/receiver.mjs`,
port **9227**). Un appel `figma_execute` par maquette ; les octets ne transitent
jamais par un résultat d'outil ; `sha256`, `capturedAt` et `transport` du
CaptureManifest sont complétés **côté Node** en relisant le fichier reçu.

**Fallback nommé : (b-tranches)** — base64 par tranches via `globalThis` persistée
(prouvé praticable ci-dessous, conservé si `fetch`/réseau venait à être retiré du
sandbox). L'option (c) (bandes par slices, mutante) n'a **pas eu besoin** d'être
sondée : (b) est prouvé au-delà du nécessaire.

**Invariant R3 tenu** : l'octet comparé est une sortie de rendu Figma @1x ; sha256 au
manifeste ; le verdict est rendu par le comparateur Node uniquement.

## Preuves, dans l'ordre R3

### (a) Outils MCP de capture nodale — REJETÉS, avec preuve

| Outil | Constat | Verdict |
|---|---|---|
| `figma_capture_screenshot` | plafond **1568 px** documenté dans son schéma (« automatic downscaling so the longest side stays within the 1568px AI vision ceiling ») — maquettes hautes de 3 334–6 761 px | rejeté sans essai (downscale garanti) |
| `figma_take_screenshot` | **essayé** sur `Motorisation` (237:705) avec `scale: 1` demandé → réponse `"scale": 0.4702508423109545` : **rééchantillonnage silencieux** au même plafond 1568 px, non documenté dans son schéma ; image renvoyée inline (vision), pas d'écriture fichier pleine résolution | rejeté sur receipt |
| `figma_get_component_image` | REST — **aveugle à la page locale `Pages`** (constat R1) | rejeté d'office |

Le critère R3 (« export au niveau node, échelle déterministe @1x, écriture fichier
pleine résolution — le zoom viewport n'est pas acceptable ») n'est tenu par aucun des
trois. C'est précisément le piège que la sonde devait attraper.

### (b) Prérequis du sandbox — PROUVÉS un par un

| Prérequis | Preuve (session 2026-07-23) |
|---|---|
| Persistance de `globalThis` entre appels `figma_execute` | valeur posée à l'appel 1 (`epoch 1784840462725`) relue intacte à l'appel 2 (même epoch) |
| Intégrité binaire dans le stash | `Uint8Array([1,2,3,4,5])` intact ; `figma.base64Encode` → `"AQIDBAU="` ✓ |
| Export @1x **pleine résolution** dans le sandbox (pas de plafond) | `Motorisation` : **1728 × 3335**, 3 255 849 octets, 1 670 ms |
| `fetch()` disponible dans le sandbox | `typeof fetch === 'function'` ✓ |
| Réseau localhost autorisé | manifest du plugin : `networkAccess.allowedDomains` inclut `http://localhost` + ports 9223–9232 |

### (b-tranches) — praticable, coûteux → fallback

Tranche de 768 KiB binaire → résultat d'outil de 1 048 721 caractères : dépasse la
limite de tokens, **spillé sur fichier local par le harnais** (contenu vérifié intègre).
Praticable, mais ~5 appels + 5 extractions par maquette de 3,3 Mo (≈ 90–140 appels par
incrément de 18 captures). Conservé comme fallback nommé, jamais comme choix par défaut.

### (b-fetch) — RETENU : aller-retour complet byte-exact

| Étape | Receipt |
|---|---|
| POST depuis le sandbox | 3 255 849 octets en **68 ms**, HTTP 200, ack `{ ok: true, bytes: 3255849 }` |
| Taille côté Node | `stat` = **3 255 849** octets (= envoyés, à l'octet) |
| Magic | `89 50 4E 47 0D 0A 1A 0A` ✓ |
| Décodage | `pngjs` → PNG valide **1728 × 3335** |
| sha256 (côté Node) | `6eddd3e5782939277d3a6fa89c3bfe8d6af4804b00a9d863fb5a03fcf9c03fec` |

## Incident consigné (honnêteté) — et durcissements qui en sortent

Le premier POST de sonde a atterri dans le **receveur d'une session antérieure**
(PID 59793, lancé 22:03 depuis le checkout principal, port 9226 — le port du receveur
*gauntlet* de la spec 001 — outDir `/tmp/parity-capture`) : mon receveur avait échoué en
`EADDRINUSE` pendant que le POST réussissait ailleurs. Le fichier a été récupéré et
validé (receipts ci-dessus), le process périmé arrêté. Deux durcissements dans
`receiver.mjs` en réponse :

1. **Port dédié 9227** (≠ 9226 gauntlet) — les deux outils ne peuvent plus se squatter.
2. **`GET /health`** retourne `{ instrument: "page-parity", outDir, nonce, startedAt }` —
   le harnais de capture **vérifie l'identité du receveur avant d'envoyer un octet**
   (un octet confié à un inconnu est un octet perdu en silence).
3. (Receveur) **magic-check PNG sur `/png`** : un body non-PNG est refusé 400, nommé —
   jamais banké en silence.

## Notes de mesure

- **3334 vs 3335** : les bounds arrondis de la frame donnaient h=3334 ; l'export @1x
  produit **3335** (géométrie fractionnaire arrondie au pixel entier par l'export).
  Sans conséquence : le critère du verdict est `dims(before) === dims(after)`, jamais
  `dims === bounds`.
- Les nodeIds de cette sonde valent pour cette session ; la re-mesure par position fait
  foi (FR-002).
- `capture.js` (T016) doit être aligné sur le transport retenu : export + POST
  `/png?name=<maquette>` + résumé par maquette en retour d'appel ; manifeste complété
  côté Node — T016/T017 étaient annoncées « paire itérative », c'est le cas.
