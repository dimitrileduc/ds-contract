# T014 — les 19 glyphes embarqués, résolus DEPUIS le registre

**Source** : `contracts/icons.registry.json` v1.2.0 — `icons[].name` → `assets/icons/<icons[].asset>.svg`.
**Destination** : `module/piqueray_ds/static/src/img/icons/`.
**Date** : 2026-08-06.

## Pourquoi le registre et jamais le répertoire

`assets/icons/` contient **23 SVG**, le registre en gouverne **19**.
Embarquer le répertoire aurait donné 23 glyphes et fait **rater SC-002** — qui exige
exactement les 19 du registre — tout en ayant l’air de le dépasser. Le registre est la
source ; le répertoire est un détail d’implémentation.

## Les 19 retenus

| # | `name` (contrat) | `asset` (fichier) | `size` | octets |
|---|---|---|---|---|
| 1 | `piqueray` | `piqueray.svg` | 32 | 856 |
| 2 | `phone` | `phone.svg` | 32 | 1797 |
| 3 | `download` | `download.svg` | 32 | 1204 |
| 4 | `pdf` | `pdf.svg` | 32 | 3727 |
| 5 | `search` | `search.svg` | 32 | 1436 |
| 6 | `user` | `user.svg` | 32 | 1641 |
| 7 | `chevron-right` | `chevron-right.svg` | 32 | 441 |
| 8 | `chevron-left` | `chevron-left.svg` | 32 | 440 |
| 9 | `chevron-down` | `chevron-down.svg` | 32 | 445 |
| 10 | `chevron-up` | `chevron-up.svg` | 32 | 445 |
| 11 | `cart` | `cart.svg` | 32 | 1966 |
| 12 | `arrow-right` | `arrow-right.svg` | 20 | 265 |
| 13 | `arrow-left` | `arrow-left.svg` | 20 | 262 |
| 14 | `facebook` | `facebook.svg` | 32 | 844 |
| 15 | `instagram` | `instagram.svg` | 32 | 1601 |
| 16 | `star` | `star.svg` | 20 | 278 |
| 17 | `external-link` | `external-link.svg` | 32 | 1437 |
| 18 | `mail` | `mail.svg` | 32 | 1347 |
| 19 | `octicon-chevron-down12` | `octicon-chevron-down12.svg` | 16 | 485 |

## Les 4 écartés — présents sur disque, **non gouvernés**

| `asset` | Pourquoi il n’entre pas |
|---|---|
| `check.svg` | absent de `contracts/icons.registry.json` — aucune entrée ne le nomme |
| `close.svg` | absent de `contracts/icons.registry.json` — aucune entrée ne le nomme |
| `google.svg` | absent de `contracts/icons.registry.json` — aucune entrée ne le nomme |
| `google-wordmark.svg` | absent de `contracts/icons.registry.json` — aucune entrée ne le nomme |

## Contrôle

Le script de copie **refuse** (`throw`) si une entrée du registre pointe vers un SVG absent :
un registre qui pointe dans le vide est un défaut, pas un glyphe manquant en silence.
Aucune entrée n’a levé.
