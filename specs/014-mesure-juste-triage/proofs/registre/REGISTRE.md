# Registre avant/après — Mesure juste et triage complet (014)

> Rendu depuis `avant.json`, `apres.json` et `causes.json` — jamais écrit à la main. Voir [data-model.md §4](../../data-model.md#4-registre-avantaprès) et [contracts/receipts.schema.md §2](../../contracts/receipts.schema.md).

## 1. Provenance

- navigateur : `151.0.7922.34` (révision `1234`) — **le même** aux deux phases (FR-009, I-4.1)
- avant : capturé `2026-08-03T10:13:52.505Z` · reçu parité visuelle `2026-08-03T10:08:43.511Z` · refus `0`
- après : capturé `2026-08-03T13:06:48.557Z` · reçu parité visuelle `2026-08-03T13:03:01.178Z` · refus `0`
- 0 refus des deux côtés ⟹ les deux registres font foi (sinon : "écrit, mais ne fait pas foi")

## 2. Ce qui a changé

| instrument | ligne | avant | après | delta | attribution |
|---|---|---:|---:|---:|---|
| organism-audit | reassurances/reassurances-disposition-4-cartes | 39.7844 % | 3.2989 % | -36.4855 % | correction d'instrument DW-006 |

**Reassurances n'est pas un progrès de fidélité.** DW-006 corrigeait un défaut d'**instrument** (la référence de mesure était le *set*, jamais le *node du cas*) — le chiffre change parce que la mesure devient juste, pas parce que le composant s'est amélioré (SC-004, I-4.5).

## 3. Ce qui n'a pas changé (invariance vérifiée, pas supposée)

- **8/8** organismes à cas hors reassurances : `delta.rawPct == 0` et `delta.facts == null` (T035)
- **39/39** lignes de parité visuelle préexistantes : aucune n'a bougé sans attribution (T036)
- **47** lignes au total, sur les deux instruments, strictement inchangées entre avant et après

## 4. Nouveauté

- **select :: Select** (visual-parity) — première mesure, gate/raw 0.8501 % ; aucun `before`, n'existait pas avant US3 (34/34 composants désormais mesurés)

## 5. Causes — entrées DW re-classées (registre des travaux reportés de 013)

| DW | sujet | cause | reçu | même défaut que |
|---|---|---|---|---|
| DW-001 | footer | contract-geometry | `dw-001-contract-geometry` | — |
| DW-002 | reassurances | contract-geometry | `dw-002-contract-geometry` | organismLine `reassurances/reassurances-disposition-4-cartes` |
| DW-003 | faq | figma-source | `dw-003-figma-source` | — |
| DW-004 | footer | contract-geometry | `dw-004-contract-geometry` | — |
| DW-005 | footer | contract-geometry | `dw-005-contract-geometry` | — |
| DW-006 | reassurances | instrument | `dw-006-instrument` | — |

**Déduplication** : une entrée DW et une ligne d'organisme liées par `sameDefectAs` décrivent un seul défaut vu de deux endroits — le compte par cause du gate les compte pour **un** (contracts/measure-gate.interface.md §4).

## 6. Causes — les neuf lignes divergentes de l'audit d'organismes

| ligne | score brut | cause | reçu |
|---|---:|---|---|
| hero/hero-master-defaults | 27.8290 % | image-boundary | `org-hero-image` |
| faq/faq-master-defaults | 3.6723 % | figma-source | `org-faq-source` |
| texte-seo/texte-seo-master-defaults | 1.8376 % | contract-geometry | `org-texte-seo-geometry` |
| footer/footer-master-defaults | 1.0440 % | contract-geometry | `org-footer-geometry` |
| sav/sav-master-defaults | 0.6652 % | image-boundary | `org-sav-image` |
| coordonnees/coordonnees-master-defaults | 0.5223 % | contract-geometry | `org-coordonnees-geometry` |
| presentation/presentation-master-defaults | 0.3531 % | rendering | `org-presentation-rendering` |
| devis/devis-master-defaults | 0.1354 % | image-boundary | `org-devis-image` |
| reassurances/reassurances-disposition-4-cartes | 3.2989 % | contract-geometry | `org-reassurances-geometry` |

## 7. Contrôle

- `delta-without-attribution` : 0 (aucun refus émis par `build-registre.mts --phase apres` — T034)
- invariance des 8 organismes hors reassurances : **PASS** (T035)
- aucune dérive de parité visuelle sans attribution : **PASS** (T036)
- attribution reassurances = `correction d'instrument DW-006`, jamais présentée comme un progrès de fidélité : **PASS** (T037)

Le compte par cause qui fait foi est celui de `npm run measure:gate -- --json` (`counts.byCause`) — jamais figé en prose ici (I-6.3).

