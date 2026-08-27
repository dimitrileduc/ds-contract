# SC-002 / SC-003 / SC-004 — driver, E8, volume (T019)

Date : 2026-08-27. Aucune mutation de canevas.

---

## SC-003 — la clôture multi-campagnes, sur les artefacts RÉELS de 029

> « Le scénario de clôture 029 rejoué (deux campagnes, un dossier de décisions partagé)
> se clôture sans déplacement de fichiers. »

**Tenu.** `figma-projection-repair-shared-decision-root` lit
`specs/029-figma-responsive-categories/decisions/` **en place**, tel qu'il est commité —
`H1-audit.json`, `H2-design.json`, `H3-mutation.json`, `H4-carte-categorie.json`,
`H4-categories-principales.json` — et fait tourner le vrai `selectFinalOwnerDecisions`
pour les deux vraies campagnes.

Le rouge, avant correctif, mot pour mot :

```
E8: carte-categorie cannot close from the shared directory:
owner-decision@$[4].targetId: owner decision targets an undeclared campaign target: categories-principales
```

Le vert, après :

```
✔ shared owner-decision root: the two real 029 campaigns
  (carte-categorie←H4-carte-categorie.json, categories-principales←H4-categories-principales.json)
  both close from specs/029-figma-responsive-categories/decisions with nothing moved,
  3 targetless gate record(s) still ignored, and duplicate / missing / malformed /
  non-string decisions still refused by name
```

Chaque campagne prend **son** fichier : ignorer le voisin n'est pas le choisir. Le
correctif fait 3 lignes utiles dans `selectFinalOwnerDecisions` — un `targetId` étranger
est ignoré comme un enregistrement de gate sans `targetId` l'était déjà. Ce que la
fixture vérifie **ensuite**, et qui est le vrai risque d'un correctif comme celui-là :

- doublon interne à la campagne → toujours refusé ;
- décision manquante pour une cible déclarée → toujours refusée ;
- décision **malformée** pour une cible déclarée → toujours refusée (ignorer le voisin
  ne doit pas devenir ignorer un fichier cassé chez soi) ;
- `targetId` non-string → refusé, c'est un fichier cassé, pas celui d'un voisin ;
- les 3 enregistrements de gate sans `targetId` (H1/H2/H3) → toujours ignorés.

029 contournait ce bug **en déplaçant un fichier à la main**. Douze sections partageant
un dossier ne peuvent pas faire ça douze fois.

Chrono : **0,22 s**.

---

## SC-004 — volume de preuve allégé, à verdicts identiques

> « Le volume de preuve produit par une campagne en mode allégé est réduit d'au moins
> 80 % par rapport au mode complet de 029, à verdicts identiques. »

**Tenu : 81,3 %.**

La mesure est faite sur le **recensement de surfaces réel de 029** — pas sur un jouet,
parce que le 80 % de SC-004 est référencé à 029 : 1 master + 4 membres + 7 usages Page,
chacun doublé de son contexte visuel = **19 surfaces**, dont 14 en lecture seule. Ce sont
ces doubles clichés de contexte qui font le gros de la dépense en mode complet, et
exactement ce que la rétro nomme comme coupable.

| | Mode complet | Mode allégé |
|---|---|---|
| PNG (3 phases) | 57 | **10** |
| avant | 19 | 5 (master + 4 membres) |
| après | 19 | 5 (les nœuds que la campagne dit changés) |
| idempotence | 19 | **0** |
| facts + structure + properties | 19 surfaces × 3 phases | **identique** |
| volume octets | référence | **−81,3 %** |

Contexte réel : `specs/component-repairs/categories-principales/run-001` pèse
**299 fichiers, 104 Mo, 105 PNG** pour UNE section.

**Verdicts identiques (FR-005) — 9 portes comparées**, le même scénario joué deux fois :
`draftValid`, `readyToApplyValid`, `verifiedValid`, `beforeComplete`, `afterComplete`,
`idempotenceComplete`, `dryRunGate`, `emptyDeclaredSurfaceRefused`, `factsEverywhere`.
Les neuf sont `true` dans les deux modes ; la fixture échoue si l'une diverge **et**
échoue si l'une valait déjà `false` en mode complet (comparer deux `false` ne prouve rien).

Pourquoi c'est sûr, et ce n'est pas un raisonnement de 030 : la porte de no-op du second
passage est **structurelle, pas pixel** — `docs/internal/component-repair-workflow.md`
l. 288-289 : « chaque opération doit être `no-op`, avec zéro nœud créé et zéro nœud
modifié ». Le cycle PNG d'idempotence ne portait aucun verdict.

**§X ne s'affaiblit pas** : une surface qui DOIT un cliché et revient vide est refusée en
allégé exactement comme en complet (`emptyDeclaredSurfaceRefused`). Et le mode est
**opt-in** : une campagne qui ne déclare rien capture comme avant, ce que la fixture
vérifie aussi.

Le patron n'est pas inventé — c'est celui de `hidden-instance`, déjà dans le dépôt
(workflow doc l. 233-236) : alléger le cliché, garder le fait, refuser le changement
silencieux (`capture-mode-mismatch`).

Chrono : **0,22 s**.

---

## SC-002 — la chaîne complète en UNE invocation

> « La chaîne complète d'une campagne (audit → clôture, hors décision owner) s'exécute en
> UNE invocation sur le mock, journal complet, en moins de 25 minutes. »

**Tenu — et il faut lire la mesure honnêtement, voir §« ce que ce chrono n'est pas ».**

`node scripts/component-repair-drive.mjs --campaign <c.json> [--capture-mode light]
[--until <action>] [--resume]` enchaîne les **17 étapes** de
`docs/internal/component-repair-workflow.md` § « Ordre obligatoire » :

```
audit → preflight → capture-before → dry-run
  → emit-bridge-script-first → bridge-first → normalize-apply-first → record-apply-first
  → capture-after → verify
  → emit-bridge-script-second → bridge-second → normalize-apply-second → record-apply-second
  → capture-idempotence → verify-idempotence → finalize
```

(18 avec `--backup-ref`, qui insère `snapshot-source`.) L'ordre n'est pas re-dérivé : il
est **lu dans le document**, et la fixture échoue si le driver s'en écarte d'une étape.

Ce que la fixture prouve, mesuré :

| Claim | Preuve |
|---|---|
| une invocation, 17 étapes en ordre | la liste d'appels observée est byte-égale à l'ordre du document |
| journal complet | `drive-journal.jsonl`, **une ligne par étape**, avec verdict et intervalle |
| arrêt au premier refus | 2 appels puis stop ; code retour **2** |
| refus cité **verbatim** | la fixture compare le texte du runner au texte du journal, caractère pour caractère |
| `--resume` ne rejoue rien de vert | 0 étape rejouée sur les 9 déjà vertes ; reprise à `verify` |
| `--until` | s'arrête après l'action nommée, `bridge-first` jamais atteint ; un `--until` inconnu → `drive-unknown-action` |
| **jamais d'écriture sans son dry-run** | un journal forgé s'arrêtant entre l'émission et le pont ne laisse PAS la reprise démarrer au pont ; et un journal prétendant tout vert SAUF le dry-run refuse au premier write |
| aucune porte dupliquée | chaque étape invoque `npm run component:repair` ou `scripts/component-repair-bridge.mjs` — la fixture refuse tout autre binaire |

Chrono mesuré : **0,25 s**, contre un plafond de 1 500 s.

### Ce que ce chrono N'EST PAS

Le runner est **injecté** dans la fixture : `exec` est scripté, donc les 0,25 s mesurent
**le driver lui-même** — l'enchaînement, le journal, la reprise — et rien d'autre. Le
coût réel d'une chaîne, ce sont les appels REST du preflight et des captures, les
allers-retours du pont Figma et les temps de rendu, qu'aucune fixture headless ne peut
faire tourner.

Donc : ce chrono **prouve « une invocation, journal complet, arrêt sur refus, reprise »**.
Il **ne mesure pas** le gain de 25 min/section. Cette mesure-là appartient au pilote vif
de la section 1 de 031, et elle n'est pas prise ici — la dire prise serait exactement la
classe d'erreur que la rétro de 029 a mesurée (« lu mais non confirmé »).

### FR-011 — la répétition générale, dans la même fixture

La branche « créations déclarées dans un set existant » que 029 a **construite et jamais
exécutée** (run-002 l'a court-circuitée en gestes manuels, RAPPORT-CLOTURE §4.2) est
déroulée ici avec `expectedCreates > 0` dans un set multi-axes existant, à travers les
**vraies** portes de reçu : création déclarée acceptée, création non déclarée refusée
`unexpected-created-node`, création manquante refusée pareil, second passage no-op strict,
re-création au second passage refusée `second-pass-not-noop`.

**La répétition a trouvé un vrai défaut, et c'était le but.** Voir
`inventory/ecarts.md` — écart **W1** : les deux portes d'identité de membre
(`master-drift` et `responsive-member-identity-drift`) exigeaient qu'un membre **créé**
porte l'identité que le manifeste épingle. Or un membre créé n'en a pas : Figma lui
attribue son id à la création, ce que le schéma dit déjà en rendant
`ResponsiveComponentMember.nodeId` optionnel. Un reçu **honnête** pour une création
déclarée était donc refusé — la branche entière était inutilisable en vif. Corrigée :
un membre créé est tenu à une règle plus stricte là où ça compte (adressé par sa paire
d'axes exacte, portant un id et une key réels, jamais ceux d'un membre préservé, et — au
premier passage — un id que le run a effectivement déclaré créer).

Sans cette répétition, la vague l'aurait découvert **en vif, sur la section 1**, après la
pose. C'est précisément le puits que 029 a payé 33 minutes.
