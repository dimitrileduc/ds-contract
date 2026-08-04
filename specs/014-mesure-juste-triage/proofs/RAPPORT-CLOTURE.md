# Rapport de clôture — Mesure juste et triage complet (014)

> Rendu depuis la sortie EN DIRECT de `npm run measure:gate -- --json` — jamais un compte figé en prose (I-6.3). Voir [contracts/measure-gate.interface.md](../contracts/measure-gate.interface.md) et [proofs/registre/REGISTRE.md](./registre/REGISTRE.md).

## Verdict

**PASS** — code de sortie `0` — navigateur `151.0.7922.34`

Les quatre conditions de FR-007 sont tenues : zéro ligne divergente sans cause, les 34 contrats portent une ligne de mesure, la référence de chaque ligne d'organisme est le node du cas, et toute cause publiée porte un reçu re-testé.

## Comptage (en direct, jamais figé)

- contrats gouvernés : **34**
- lignes mesurées (deux instruments) : **52**
- dont divergentes (score brut > 0) : **42**
- travaux découverts par 014, non réparés (§4 ter, distincts du registre DW re-classé) : **1**

## Sortie dimensionnante FR-011 — compte par cause

Agrégé sur les lignes des **deux** instruments et sur le registre des travaux reportés de 013 re-classé (dédupliqué par `sameDefectAs` — un fait épinglé et la ligne qui en résulte comptent pour un, jamais deux).

| cause | libellé publié | compte | destination |
|---|---|---:|---|
| `contract-geometry` | géométrie du contrat | 8 | **015** — géométrie gouvernée |
| `image-boundary` | frontière image (limite A5) | 11 | **017** — limite nommée jusque-là |
| `rendering` | rendu/rastérisation | 22 | plancher assumé, jamais toléré au score |
| `engine` | défaut moteur | 3 | défaut suivi, ouvert |
| `instrument` | défaut d'instrument | 1 | corrigé **ici** (DW-006) |
| `figma-source` | défaut de source Figma | 1 | **016** — canvas vrai |

## Règles retirées (`RETIRED_RULES`) — une cause qui ne peut plus rien causer

Trois règles héritées visaient des contrats supprimés à la reconversion Piqueray. Elles ne comptent dans aucune cause ci-dessus (leur classe d'origine n'est plus une des six valeurs) — un constat publié, pas un ménage silencieux (cause-vocabulary.md §4.2) :

| sujet | classe d'origine | motif |
|---|---|---|
| heading | `renderer` | ds.heading was removed at the Piqueray reconversion (the 51-component demo system archived, 001-piqueray-button); no contract, no parity subject, live or quarantined. |
| switch | `renderer` | ds.switch was removed at the Piqueray reconversion; no contract, no parity subject, live or quarantined. |
| badge | `renderer` | ds.badge was removed at the Piqueray reconversion; no contract, no parity subject, live or quarantined. |

## Ce que ce rapport ne fait pas

- **Il ne répare rien** — un triage nomme, il ne corrige pas (FR-005).
- **Il ne fige aucun compte** — relancer `npm run measure:gate -- --json` est la seule autorité ; ce fichier n'est qu'un rendu daté de cette sortie.
- **Il ne lève aucun blocage** — les trois organismes bloqués (equipe, formulaire, header) restent bloqués ; leur re-test va à 016 (US5, T031).

