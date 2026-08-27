# Contrats CLI — 030

Trois surfaces nouvelles, une étendue. Tout refus est nommé et cité tel quel par l'appelant.

## 1. Générateur de manifeste (nouveau)

```bash
npm run component:repair:manifest -- --releve <audit.json|dump.json> --out <campaign.json> [--component <id>]
```

- Entrée : un relevé existant (audit runner ou dump bridge read-only). AUCUNE lecture Figma vive.
- Sortie : `campaign.json` (validé par `validateRepairCampaign` avant écriture) + rapport `manifest-report.json` (`nonDeductible[]`).
- Déterminisme : deux exécutions sur le même relevé ⇒ sorties byte-identiques.
- Refus nommés : `releve-unreadable`, `component-not-found-in-releve`, `generated-campaign-invalid` (avec les issues de validation verbatim).

## 2. Capture allégée (extension d'actions existantes)

```bash
npm run component:repair -- --campaign <c.json> --capture-before --capture-mode light
npm run component:repair -- --campaign <c.json> --capture-after  --capture-mode light
npm run component:repair -- --campaign <c.json> --capture-idempotence --capture-mode light
```

- `--capture-mode` absent ⇒ `full` (comportement actuel, intact).
- Premier usage écrit `captureMode` dans la campagne ; usage contradictoire ensuite ⇒ refus `capture-mode-mismatch`.
- Light : facts+structure sur toutes les surfaces ; PNG before = surfaces déclarées, PNG after = surfaces changées, idempotence = zéro PNG.
- Invariant contractuel : verdicts des portes identiques à `full` sur le même scénario.

## 3. Driver de campagne (nouveau)

```bash
node scripts/component-repair-drive.mjs --campaign <c.json> [--capture-mode light] [--until <action>] [--resume]
```

- Enchaîne la chaîne complète du workflow dans l'ordre du runner ; `--until` s'arrête après l'action nommée (ex. `--until dry-run` pour la préparation de vague).
- Sortie : `drive-journal.jsonl` + code retour 0 (chaîne verte) / 2 (refus, cité sur stderr verbatim) / 3 (interruption, reprise possible).
- `--resume` : reprend à la première étape non verte du journal ; jamais d'étape d'écriture sans son dry-run ; étapes vertes non rejouées.
- Le driver n'implémente AUCUNE porte : il invoque le CLI et le bridge existants et rapporte leurs verdicts.

## 4. Preflight verrous (extension du preflight existant)

- Le preflight produit `preflight-locks.json` et refuse `inherited-size-lock` si un verrou non couvert par `lockWaivers[]` touche une surface cible.
- Message de refus : `inherited-size-lock: <nodeId>.<property>=<value> (hérité de <inheritedFrom>) — corriger à la source ou déclarer une dérogation référencée`.

## 5. Générateur de planche (nouveau)

```bash
npm run component:repair:board -- --decisions <dir> --witnesses <manifest.json> --usages <inventaire.json> --out <dir>
```

- Sortie : `board.bridge.js` (script de construction, exécutable pont OU mock) + `zones.json` (contrat des 7 zones + checks).
- Refus nommés : `structural-fact-unwitnessed`, `witness-missing-for-width`, `negative-statements-missing`.
- Exécution vive du script : HORS périmètre 030 (031).
