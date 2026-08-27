# Research — 030 outillage de la vague responsive

Zéro `NEEDS CLARIFICATION` dans la spec (source : rétro validée). Les décisions ci-dessous fixent le COMMENT, chacune avec son antériorité dans le dépôt (règle prior-art).

## R1 — E8 : ignorer, pas refuser, les décisions des autres cibles

**Decision** : dans `selectFinalOwnerDecisions` (`extract/figma/projection-repair/campaign.ts`), un fichier de décision dont le `targetId` n'appartient pas aux cibles de LA campagne est ignoré (`continue`), exactement comme les fichiers sans `targetId` le sont déjà. Restent des erreurs : doublon interne, décision manquante, décision malformée pour une cible déclarée.

**Rationale** : le sélecteur lit un DOSSIER partagé ; refuser le fichier du voisin rend toute vague multi-campagnes infinalisable (constaté et contourné à la main en 029, écart E8). La sécurité ne perd rien : chaque cible exige toujours SA décision.

**Alternatives considered** : dossiers de décisions séparés par campagne (déplace le problème : H1/H2 de FEATURE sont partagés par nature) ; filtrage par convention de nommage de fichier (fragile, le champ `targetId` est déjà l'autorité).

## R2 — Générateur de manifeste : fonction pure sur relevé existant

**Decision** : `manifest-generator.ts`, fonction pure `(relevé JSON, options) → campaign.json + rapport`. Entrée = un relevé DÉJÀ acquis (l'`audit.json` du runner ou un dump du type `H1-bridge-read-only.json`) ; aucune nouvelle route de lecture Figma. Tout champ non déductible sort dans le rapport `nonDeductible[]` ET comme marqueur explicite dans le manifeste — jamais de valeur inventée. Le manifeste généré repasse par `validateRepairCampaign` avant tout usage (FR-003).

**Rationale** : les 25–30 Ko de manifeste écrits main sont le poste d'heures n°1 (rétro COUT CODE) ; la matière (ids, keys, axes, positionPaths) est intégralement présente dans les relevés que le runner produit déjà. Pureté = déterminisme byte-stable, testable en fixture sans pont.

**Alternatives considered** : générer depuis un appel REST vif (nouvelle route de lecture, hors périmètre no-canvas) ; générer depuis `parity/snapshots` (trop pauvre : pas de positionPaths d'usages).

**Prior art** : `core/propose-figma.ts` inverse déjà les règles du générateur sur un dump (extraction = inversion) ; le générateur de manifeste applique le même geste à `facts.ts`.

## R3 — Capture allégée : opt-in CLI, persistée dans l'état de campagne

**Decision** : flag CLI `--capture-mode light` sur les actions de capture ; le mode choisi est écrit dans l'état de la campagne au premier usage et les reçus le portent (un run ne mélange pas les modes silencieusement). Light = facts+structure partout ; PNG uniquement before(surfaces déclarées) et after(surfaces changées) ; zéro PNG au cycle d'idempotence — le no-op reste prouvé par le reçu normalisé et les faits (la porte `second-pass-not-noop` est structurelle, pas pixel).

**Rationale** : en 029 le pixel n'a jamais été l'instrument du verdict d'idempotence (le hash de reçu l'était) ; 80 %+ du volume était des PNG. Verdicts identiques exigés par FR-005 et prouvés par fixture (même scénario joué dans les deux modes → mêmes verdicts).

**Alternatives considered** : champ déclaratif dans campaign.json (l'opérateur devrait éditer le manifeste généré) ; light par défaut (changerait le comportement des campagnes existantes — interdit, FR-004 = opt-in).

## R4 — Driver : machine d'états déjà existante, pilotée par un script de transport

**Decision** : `scripts/component-repair-drive.mjs` enchaîne la chaîne complète (audit → snapshot-source → preflight → capture-before → dry-run → emit-bridge-script → exécution bridge → normalize-apply → record-apply → capture-after → verify → cycle idempotence → finalize) en invoquant le CLI existant action par action et `component-repair-bridge.mjs` pour le transport. Journal JSONL par étape (verdict, durée, refus cité). Reprise = relire `campaign.state` (la machine d'états persistée existe déjà) et reprendre à la première étape non verte ; AUCUNE étape d'écriture rejouée sans son dry-run.

**Rationale** : toute l'intelligence (états, refus, portes) est déjà dans le runner ; le driver n'ajoute QUE l'enchaînement et le journal — 13 invocations manuelles → 1. Pas de logique de gate dupliquée dans le driver (sinon deux autorités).

**Alternatives considered** : mode `--all` dans cli.ts (mélange orchestration et portes dans le même binaire, grossit la surface à re-tester) ; orchestration par agent IA (interdit par le principe I sur un chemin d'exécution).

**Prior art** : `evals/run.ts` enchaîne déjà pipeline réel + assertions dans un scratch ; `extract/figma/page-parity/cli` pilote scan/capture/compare en séquence.

## R5 — Preflight verrous hérités : relevé dans facts, refus nommé dans preflight

**Decision** : le relevé des surfaces cibles (`facts.ts`) capture min/max/dimensions figées de CHAQUE surface cible et de ses ancêtres porteurs ; le preflight (`cli.ts`/`capture.ts` chemin existant) compare au comportement déclaré par la campagne et refuse par nom (`inherited-size-lock`, avec nœud/propriété/valeur) tout verrou non couvert par une dérogation déclarée (`lockWaivers[]`, additif au schéma).

**Rationale** : la classe « verrou 744px » a coûté 33 min + un revert manuel en 029 parce que la vérification la découvrait APRÈS la pose. La détection au preflight est la parade nommée par la rétro (puits B) — et le preflight existant fait déjà ce genre de contrôle (topologie, exclusivité).

**Alternatives considered** : correction automatique du verrou (écriture canvas implicite — interdit ici, et décision de design qui appartient à l'owner) ; simple warning (un warning non bloquant serait ignoré en batch — refus fail-closed, cohérent avec le dépôt).

## R6 — Générateur de planche : script bridge déterministe + manifeste de zones, exécution en 031

**Decision** : `board-generator.ts`, fonction pure `(décisions, témoins, inventaire d'usages) → { script bridge de construction de planche, zones.json }`. Le script est du même genre que les scripts `figma-sync/*` : déterministe, exécutable par le pont OU par le mock. Dans 030 il est PROUVÉ sur le mock (structure des 7 zones, mentions négatives présentes, refus si témoin manquant) ; l'exécution vive appartient à 031. `zones.json` est le contrat vérifiable machine (checks du manifeste H2 étendus : `structuralFactsAllWitnessed`, `negativeStatementsInFrench`).

**Rationale** : sépare le calcul (pur, testable) du transport (031), exactement le partage `emit-figma-script` spec/runtime ; la planche cesse d'être artisanale (47 min de churn en 029) et devient un artefact généré conforme §XII par construction.

**Alternatives considered** : planche composée à la main avec checklist (c'est le mode 029 — le churn mesuré) ; HTML hors Figma (l'owner décide DANS Figma, à taille réelle, avec le vrai rendu — §XII).

## R7 — `pickerConsequence` + natures : schéma de décision étendu, validé par une porte

**Decision** : le schéma de décision design (celui de `decisions/README` 029, repris par 031) gagne deux champs additifs : `pickerConsequence` (phrase française obligatoire décrivant l'état du sélecteur après application) et, par fait accepté, `nature: "visuel" | "structurel"` + `witnessRef` (témoin 1:1 pour visuel, capture du sélecteur pour structurel). Un validateur (`board-generator.ts` côté planche + porte de décision côté runner) refuse par nom un fait structurel sans témoin. Le README 029 n'est PAS réécrit (histoire) ; le schéma étendu vit dans `contracts/decision-design.md` de 030.

**Rationale** : E2 est né d'un fait structurel invisible dans un rendu, scellé en anglais abstrait. La phrase sélecteur + le témoin de sélecteur sont la parade minimale ; le corollaire §XII identifié par la rétro (« toute conséquence structurelle figure sur la surface de décision en langage designer »).

**Alternatives considered** : amender la constitution (geste owner, hors périmètre agent — proposé comme différé) ; tout mettre en texte libre (invalidable machine, donc invérifiable en batch).

## R8 — Fixtures/evals : six IDs, un par capacité, adverses par construction

**Decision** : six fixtures rouges nouvelles (voir plan, `evals/fixtures/figma-projection-repair/*-check.ts` — la famille existante du runner, IDs `figma-projection-repair-*`), enregistrées dans `evals/run.ts` AVANT l'implémentation de chaque capacité. Chacune échoue sur le dépôt actuel (rouge prouvé), passe après, et retombe si la capacité est retirée (SC-005). Le rejeu E8 utilise les VRAIS artefacts 029 committés (deux campagnes, un dossier).

**Rationale** : ordre constitutionnel (claims rule) ; leçon 028/029 — le runner ne doit plus changer pendant la vague, donc toute sa surface nouvelle est éprouvée ICI.

**Alternatives considered** : une méga-fixture couvrant tout (diagnostics illisibles, échecs non attribuables — contraire aux refus nommés).

## R9 — Créations déclarées en set existant : exercée sur mock par le driver

**Decision** : la fixture driver (R8) déroule sur le mock un scénario avec `expectedCreates > 0` dans un set existant : créations déclarées appliquées, `unexpected-created-node` toujours refusé, second passage no-op. C'est la répétition générale de la branche jamais exercée en vif (RAPPORT-CLOTURE 029 §4.2) ; le pilote LIVE reste la section 1 de 031.

**Rationale** : mock-fidelity discipline du dépôt — une classe de bug attrapée headless pour toujours ; on ne découvre pas la branche en batch sur 12 sections.

**Alternatives considered** : premier exercice directement en vif sur la section 1 (c'est le plan 031, mais y arriver SANS répétition mock violerait fixture→eval→capacité).
