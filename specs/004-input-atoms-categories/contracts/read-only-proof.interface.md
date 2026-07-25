# Interface — Garde-fou lecture seule & preuve de coexistence avec 003

## Protocole

| Moment | Geste | Artefact |
|---|---|---|
| T0 (avant tout) | `GET /v1/files/d9FYAUcqdcNtsuaMgLefvJ/versions` (REST direct authentifié — précédent 002 P5) | `proofs/read-only/versions.before.json` |
| Pendant | UNIQUEMENT des lectures : dumps REST, exports SVG/PNG (images API), lectures pont desktop, refresh snapshot parity (script d'inventaire, n'édite pas) | — |
| Clôture | re-relevé `/versions` + diff | `proofs/read-only/versions.after.json` + `attribution.md` |

## Règles d'attribution (SC-004)

- Entrée nouvelle imputable à **003** (molécules/sections en cours) → **attendu**
  (coexistence), consigné.
- Entrée nouvelle sur un **master d'atome gelé** → événement FR-004 : édition passée par
  les gates 003 ⇒ **ré-extraction nommée** de l'atome avant clôture, parité mesurée sur
  le fichier vivant.
- Entrée imputable à **004** → **échec du garde-fou**, traité comme tel (jamais minimisé).

## Interdits stricts (FR-001/002/003)

- Aucun outil MCP mutant (`figma_execute` mutant, set_*, create_*, delete_*…), aucune
  édition de master/page/variable/rangement, aucun « petit fix » de défaut découvert —
  un défaut est signalé nommément et coordonné avec 003, point.
- Le rangement de la page « Assets » reste hors périmètre (suivi déjà noté dans la spec).

## Réutilisation des audits 003 (FR-005/006, SC-006)

`proofs/audits-003.md` référence, SANS les recopier ni les refaire :
- `specs/003-…/audits/atomes-formulaire.md` (003-T031) + validations owner 003-T032-T035
  (Input `2053:1245`, Textarea `2053:1247`, Select `2053:1249`, Checkbox `2053:1256`).
- `specs/003-…/audits/atomes-icones.md` (003-T036) + validations 003-T037-T038
  (Facebook `2053:1259`, Instagram `2053:1261`, Étoile `2053:1263` — net-new décidé owner).

Un atome sans pointeur d'audit validé n'est pas contractualisé.
