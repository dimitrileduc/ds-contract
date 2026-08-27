# Reçu docs-first — 030 (T002)

Constitution §IX : les docs sont lues AVANT de dériver. Ordre imposé par T002 :
constitution → `docs/internal/component-repair-workflow.md` → `RETRO-PROCESS.md` (P1–P7)
→ `inventory/runner-capability-plan.md` (conventions de fixtures du runner).

Date de lecture : 2026-08-27. Worktree : `just-euphonium` @ `448244fa`.

---

## 1. `.specify/memory/constitution.md`

Lu : sommaire complet (I–XII, Quality Gates, Development Workflow, Worktree Gates F1,
Governance) ; §XII et §Quality Gates + §F1 lus **intégralement** (l. 326–400).

Ce que 030 en retient, article par article :

| Principe | Ce qu'il impose à 030 |
|---|---|
| **I. Déterminisme** | Les deux générateurs (manifeste, planche) sont des **fonctions pures**, byte-stables ×2. Aucune IA dans le chemin d'exécution. Le driver n'est qu'un enchaînement d'appels — il ne décide rien. |
| **II. Claims rule** | Ordre **fixture rouge → eval enregistré → capacité**, six fois. Le doc (T025) ne peut être écrit qu'APRÈS le vert des evals concernés. |
| **V. Honnêteté** | Le générateur de manifeste **NOMME** ce qu'il ne sait pas déduire (`nonDeductible[]`) au lieu d'inventer. Le mode light **dit** ce qu'il ne capture pas. |
| **VII. Mock-fidelity** | La branche « créations déclarées en set existant » est répétée sur `scripts/plugin-engine-mock-figma.mjs` avant tout live (031). |
| **VIII. Source-cleanliness** | N/A par périmètre : aucune source Figma nouvelle n'est extraite ni modélisée. Entrées = relevés 029 déjà audités. |
| **IX. Docs-first** | Ce reçu. Aucune phrase « rien ne surveille / ce n'est pas possible » n'a été écrite avant lecture. |
| **X. Before-capture** | Le driver **implémente** la capture-avant obligatoire dans sa chaîne, et le mode light **ne l'affaiblit pas** : une surface déclarée mais vide reste un refus nommé (spec Edge Cases). Aucune mutation vive dans 030. |
| **XI. Multi-writer** | N/A : le driver reste mono-campagne. L'orchestration à zones disjointes appartient à 031. |
| **XII. Decision Surface Fidelity** | Le générateur de planche produit les 7 zones §XII **et** le corollaire E2 (zones 3 « ce que vous n'aurez pas » + 4 « picker avant→après »). `noScaledThumbnails` est un check machine, pas une intention. |
| **Quality Gates** | Sweep complet en clôture (T027). **Le N/N vivant imprimé par `npm run eval` est la seule autorité** — jamais codé en dur dans un document vivant ; seul `MILESTONES.md` (daté) peut citer un chiffre. |
| **Worktree Gates F1** | Worktree vérifié autosuffisant — voir `worktree-pin.json` (node_modules + chromium présents, aucune action requise). |

**Point §XII important, et il vient de la rétro, pas de la constitution** : la première
phrase de §XII (« MUST show only the alternatives that produce a visible difference »)
**pourrait légitimer l'omission** d'un delta structurel, puisque les pixels sont
identiques. C'est exactement le mécanisme E2. 030 ne réécrit pas la constitution
(geste owner) : il ajoute la parade dans le **schéma de décision**
(`contracts/decision-design.md` : `pickerConsequence` + natures VISUEL/STRUCTUREL)
et dans les **checks machine** de la planche.

---

## 2. `docs/internal/component-repair-workflow.md` (431 l.)

Lu : §Ordre obligatoire, §Périmètre, §Audit, §Manifeste v2, §Snapshot source,
§Preflight et captures, §Application live, §Transition responsive additive,
§Adaptation dans un set existant, §Comparaison, §Frontière actuelle.

Faits qui **contraignent la conception de 030** (et qu'on ne re-dérive donc pas) :

- **La chaîne d'ordre obligatoire est écrite ici** (l. 28–45) : `audit → classification →
  verdict/GO → source snapshot → preflight → capture before → dry-run → apply live +
  reçu first → capture after → verify → seconde application + reçu second → capture
  idempotence → verify-idempotence → décision owner → finalize`. **Le driver (T018)
  suit CET ordre, il ne l'invente pas.** « Une étape rouge bloque les suivantes » est
  déjà la loi — le driver la *transporte*, il ne la re-décide pas.
- **Le CLI n'a AUCUNE autorité d'écriture Figma** (l. 4–5, 240). Le driver hérite de
  cette frontière : il invoque le CLI + `component-repair-bridge.mjs`, jamais Figma.
- **La porte no-op du second passage est structurelle, pas pixel** (l. 288–289 :
  « chaque opération doit être `no-op`, avec zéro nœud créé et zéro nœud modifié »).
  → C'est la justification **documentée** du mode light : couper le cycle PNG
  d'idempotence ne touche pas la porte qui prouve le no-op. R3 le disait ; le doc
  le confirme.
- **La capture écrit PNG + structure + propriétés + facts par surface** (l. 229–231),
  et un usage Page a **deux** surfaces (instance + contexte). Le mode light coupe des
  **PNG**, jamais des facts/structure.
- **`hidden-instance` est le précédent d'un allègement gouverné** (l. 233–236) : une
  occurrence `visible:false` garde structure/propriétés/faits obligatoires mais
  n'exige aucun PNG — et si elle redevient visible, **la capture refuse**. Le mode
  light suit ce patron déjà existant (prior-art interne) : alléger le PNG, jamais le
  fait, et refuser le changement silencieux (`capture-mode-mismatch`).
- **Le retrait d'un `minWidth` hérité est une capacité déjà présente et volontairement
  fermée** (l. 270–272 : « elle sait supprimer un verrou de largeur hérité, jamais en
  ajouter un »). → Le preflight verrous (T009/T010) **détecte et nomme** ; il ne
  corrige pas. La correction reste une opération déclarée du manifeste ou une
  dérogation owner (`lockWaivers`). Cohérent avec la capacité fermée existante.
- **Le preflight refuse déjà par nom** (l. 220–227 : autre fichier/version, master
  absent ou dupliqué, variante ajoutée/retirée/renommée, instance non déclarée,
  référence manquante, impact partagé non inventorié). `inherited-size-lock` rejoint
  cette liste — même chemin, même forme.

---

## 3. `specs/029-figma-responsive-categories/RETRO-PROCESS.md` (243 l., lu en entier)

Les sept prérequis P1–P7 sont **la spécification amont de 030**. Correspondance
tâche par tâche :

| Prérequis rétro | Estimation rétro | Tâches 030 |
|---|---|---|
| **P1 — E8** : `targetId` étranger → `continue` (campaign.ts:84-86), garder doublon interne + « missing final owner decision » | 15–30 min | T012 (fixture) + T015 (fix) |
| **P2 — Générateur de manifeste** (inversion de `facts.ts`) | 2–3 h | T005 + T007 + T008 + T011 |
| **P3 — `--capture-mode light`** : facts+structure toujours ; PNG before (déclarées) + after (changées) ; zéro PNG idempotence ; preflight/dry-run/porte de reçu/no-op/finalize **intacts** | 1–2 h | T013 + T016 + T017 |
| **P4 — Driver** enchaînant les actions CLI + `component-repair-bridge.mjs`, arrêt sur refus | 60–90 min | T014 + T018 |
| **P5 — Preflight verrous hérités** (min/max/fixed sur surfaces cibles) + fixture | ~1 h | T006 + T009 + T010 |
| **P6 — Générateur de planche 7 zones** + checks manifeste étendus | ~45 min | T020 + T021 + T023 + T024 |
| **P7 — `pickerConsequence` + natures VISUEL/STRUCTUREL** dans le schéma de décision | ~15 min | T022 (+ `contracts/decision-design.md`, déjà écrit) |

**La rétro a vérifié le site E8 sur le dépôt elle-même** (l. 131) : « le `continue`
existe déjà pour `targetId === undefined`, le cas targetId-étranger tombe dans
`issue()` ». Vérifié à nouveau ici : `campaign.ts:79` (`continue`) vs `campaign.ts:84-87`
(`issue`). Le correctif est bien à cet endroit et nulle part ailleurs.

**Ce que la rétro interdit explicitement à 030** :
- ne PAS sur-corriger §XII en remettant l'archive technique sous les yeux de l'owner
  (VALIDATION a-bis, l. 108–111) — l'archive **reste masquée**, le correctif est
  **additif** (zones 3 + 4) ;
- ne PAS mettre de porte dans le driver (COUT CODE : toute l'intelligence est déjà
  dans le runner ; deux autorités = dérive) ;
- ne PAS rendre le mode light par défaut (P3 : les portes restent intactes, l'opt-in
  protège les campagnes existantes).

**Ce que la rétro laisse HORS de 030 et que 030 ne fait donc pas** : les décisions de
vague D1–D9 (fiche d'ouverture de 031), le pilote LIVE de la chaîne (section 1 de 031),
P9 (ports bridge) et P10 (spec-résultat tinyspec de la vague).

---

## 4. `specs/029-figma-responsive-categories/inventory/runner-capability-plan.md` (50 l.)

C'est le **gabarit de conception** que 030 réutilise tel quel — pas une lecture
d'ambiance.

**Convention de fixtures reprise (l. 6–14)** : une capacité = une ligne de matrice avec
(a) le modèle générique à ajouter, (b) ses **refus stables nommés**, (c) sa **fixture
rouge** (un fichier), (d) son **eval enregistré** (un ID). 030 applique exactement
cette forme, six fois — d'où six fichiers `evals/fixtures/figma-projection-repair/*-check.ts`
et six IDs `figma-projection-repair-*`.

**Séquence fixture-first reprise (l. 16–26)** : ajouter les fixtures **sans étendre le
runner** → enregistrer les IDs → exécuter et **retenir les diagnostics rouges comme
baseline** → étendre types → validation → planification → transport → facts/capture/
reçus/audit/report → verify → re-exécuter le ciblé puis la suite complète et les deux
configurations TypeScript. **C'est l'ordre des phases de `tasks.md` de 030** (T003/T004
types+validation d'abord, puis fixtures rouges prouvées, puis implémentation).

**Discipline d'écart reprise (l. 46–50)** : toute différence nouvellement observée est
**ajoutée immédiatement** à un registre d'écarts avec phase, cause datée et disposition.
→ 030 tient `inventory/ecarts.md`, **créé au premier écart, jamais après coup** (T028).

**Nommage générique (l. 3–4)** : « No component name or node id may enter runner code. »
→ Le générateur de manifeste et le générateur de planche sont **génériques** : aucun
nom de section ni node id de 029 ne peut entrer dans `manifest-generator.ts` ou
`board-generator.ts` ; les artefacts 029 sont des **entrées de fixture**, pas des
constantes de code.

---

## 5. Ce que ces lectures ont ÉVITÉ de re-dériver

Quatre décisions qui auraient été des inventions si le doc n'avait pas été ouvert :

1. **L'ordre de la chaîne du driver** — écrit tel quel dans le workflow doc (l. 28–45),
   pas reconstruit depuis `cli.ts`.
2. **Pourquoi couper les PNG d'idempotence est sûr** — la porte no-op est structurelle
   (workflow doc l. 288–289), pas pixel. Sans ça, l'allègement aurait dû être argumenté
   à partir du code.
3. **Le patron d'allègement gouverné existait déjà** — `hidden-instance` (l. 233–236) :
   alléger le PNG, garder le fait, refuser le changement silencieux. Le mode light le
   copie au lieu d'inventer sa propre forme (**règle prior-art**).
4. **Le preflight verrou ne corrige pas** — parce que le retrait de `minWidth` est une
   capacité déjà existante et **délibérément fermée** (l. 270–272). Proposer une
   correction automatique aurait été proposer d'ouvrir une porte que le dépôt a fermé
   exprès.
