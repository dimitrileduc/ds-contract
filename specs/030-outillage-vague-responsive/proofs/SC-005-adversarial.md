# SC-005 — l'ordre fixture → eval → capacité, et la preuve adverse (T026)

**SC-005** : « La suite d'evals est verte avec les nouveaux cas enregistrés, et chaque
nouvelle capacité tombe adversarialement (capacité retirée → suite rouge) ; l'unique
rouge préexistant (dette golden 028) reste identique. »

Date : 2026-08-27.

---

## 1. L'ordre constitutionnel, capacité par capacité

Chaque rouge a été **exécuté et consigné avant** son implémentation. Les diagnostics
rouges sont les vrais, pas des reconstitutions.

| # | Capacité | Fixture | Rouge prouvé — diagnostic exact | Puis |
|---|---|---|---|---|
| 1 | Générateur de manifeste | `manifest-generator-check.ts` | `ERR_MODULE_NOT_FOUND: …/manifest-generator.js` — le module n'existait pas | T007 |
| 2 | Preflight verrous hérités | `inherited-lock-preflight-check.ts` | `SyntaxError: … does not provide an export named 'buildPreflightLockReport'` | T009/T010 |
| 3 | **E8** | `shared-decision-root-check.ts` | `E8: carte-categorie cannot close from the shared directory: owner-decision@$[4].targetId: owner decision targets an undeclared campaign target: categories-principales` | T015 |
| 4 | Capture allégée | `capture-light-verdicts-check.ts` | `light mode saved only 59.2 % of the proof volume; SC-004 requires at least 80 %` | T016/T017 |
| 5 | Driver | `driver-chain-resume-check.ts` | `FR-011: a truthful declared create in an existing set was refused — master-drift, responsive-member-identity-drift` | T018 + correctif W1 |
| 6 | Planche owner | `board-structural-witness-check.ts` | `ERR_MODULE_NOT_FOUND: …/board-generator.js` | T021/T022 |

Les rouges 3, 4 et 5 sont les plus intéressants : ce ne sont pas des « module absent »,
ce sont **les défauts eux-mêmes**, reproduits sur des artefacts réels. Le rouge n°3 est
E8 rejoué sur les décisions committées de 029. Le rouge n°5 est le défaut W1 de la
branche jamais exercée, trouvé par la répétition générale.

Reçus d'exécution : `proofs/red/us1-red.txt` et les diagnostics ci-dessus.

## 2. La preuve adverse — retirer la capacité, la fixture tombe

Protocole : muter le source, exécuter **la seule** fixture concernée, restaurer le
source, consigner le premier `Error:`. Six mutations, six rouges.

| Capacité | Retrait appliqué | Verdict | Diagnostic |
|---|---|---|---|
| **E8** | `targetId` étranger redevient une `issue()` au lieu d'un `continue` | 🔴 | `E8: carte-categorie cannot close from the shared directory: … undeclared campaign target: categories-principales` |
| **Générateur de manifeste** | l'espacement d'authoring cesse d'être nommé non déductible | 🔴 | `non-deducible field componentSetTopology.authoringLayout.gap was silently invented instead of being named` |
| **Capture allégée** | le cycle d'idempotence redevient photographié | 🔴 | `light mode saved only 72.7 % of the proof volume; SC-004 requires at least 80 %` |
| **Driver** | la chaîne continue après un refus au lieu de s'arrêter | 🔴 | `a refused chain exited 0, expected 2` |
| **Preflight verrous** | tout verrou est auto-dérogé au lieu de bloquer | 🔴 | `expected exactly one blocking lock, got 0` |
| **Planche** | un fait structurel témoigné par un rendu passe | 🔴 | `a structural fact with no picker witness: structural-fact-unwitnessed was not refused` |

Le script est reproductible et se restaure lui-même ; il sort en code 0 seulement si les
six sont rouges. Après exécution, `git diff extract/ scripts/` ne montre que les
changements de la feature — aucune mutation résiduelle.

## 3. Ce que cette passe a trouvé, et que la suite verte cachait

Deux mutations sont d'abord passées **au vert**. Les deux ont été instructives, et
aucune des deux n'a été résolue en réécrivant l'assertion pour qu'elle passe.

### (a) Une mutation inefficace, pas une fixture faible

Retirer `role === 'master'` du filtre du mode allégé ne changeait rien : dans la campagne
de la fixture, le master est **aussi** dans `writeBoundary.allowedExistingNodeIds`, donc
toujours déclaré. La fixture était bonne ; c'est la mutation qui ne retirait aucune
capacité. Remplacée par une mutation qui en retire une vraie — le cycle d'idempotence
redevient photographié — et la fixture tombe sur la mesure de volume.

### (b) Un vrai défaut : la garde du driver est du code mort

Désactiver `drive-write-without-dry-run` ne faisait tomber aucune assertion. Diagnostic,
en regardant la boucle plutôt qu'en durcissant le test : **la garde est inatteignable**.
La chaîne place `dry-run` avant chaque écriture, et la boucle retourne au premier refus ;
donc quand une écriture est atteinte, le dry-run est nécessairement vert (il a tourné
vert, ou il était déjà vert, ou la chaîne s'est arrêtée sur lui).

Deux façons de traiter ça. La mauvaise : écrire une assertion tarabiscotée qui teste la
garde et prétendre que l'invariant est prouvé. La retenue :

1. la garde **reste**, déplacée avant le saut « déjà vert » et **nommée code défensif**
   dans le source — elle existe pour qu'un futur réordonnancement de la chaîne échoue
   fermé au lieu de poser silencieusement une mutation sans plan ;
2. la fixture teste l'invariant **tel qu'il est réellement porté** : un dry-run qui refuse
   arrête la chaîne avant toute écriture (`bridge-first`, `normalize-apply-first`,
   `record-apply-first`, `bridge-second`, `finalize` : aucun n'est appelé), et une reprise
   remet le dry-run devant les écritures ;
3. la ligne de sortie de la fixture le dit à voix haute : *« no write reachable before a
   green dry-run (carried by the order + the stop, not by the backstop) »* ;
4. la capacité mise sous preuve adverse pour le driver devient **l'arrêt au premier
   refus**, qui est load-bearing et qui, lui, tombe.

Sans cette passe adverse, `drive-write-without-dry-run` serait resté dans le dépôt comme
une garantie apparente que rien ne testait. C'est exactement le genre de chose que la
règle des claims existe pour attraper.

## 4. La suite

```
242/243 evals passed — evals/results.json
```

Six nouveaux cas enregistrés (237 → 243), tous verts. **Le seul rouge reste
`golden-generated-output`** — la dette golden 028, 25 sorties, mot pour mot inchangée
depuis la baseline du 2026-08-27 consignée dans `proofs/phase-2-non-regression.md` :

> Generated output diverges from golden manifest (25 file[s]):
> src/components/Carte/Carte.module.css, src/components/Carte/Carte.stories.tsx,
> src/components/Carte/Carte.tsx, src/components/GoogleReviews/GoogleReviews.stories.tsx,
> src/components/GoogleReviews/GoogleReviews.tsx — if intentional, npm run golden:update
> in a reviewed change

Ni résorbée, ni aggravée — c'est ce que FR-012 demande.

## 5. Ce que SC-005 ne prouve pas

La preuve adverse retire **une** capacité à la fois, avec une mutation choisie. Elle
montre que chaque fixture est reliée à sa capacité ; elle ne prouve pas que chaque
fixture attrape **toute** régression possible de cette capacité. Le §3(a) ci-dessus en
est l'illustration : une mutation mal choisie ne dit rien, ni sur le code ni sur la
fixture.
