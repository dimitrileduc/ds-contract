# Quickstart: valider la readiness des onze sections

## Prérequis

- Node.js ≥ 20, dépendances du worktree installées avec `npm install`.
- Chromium local: `node node_modules/playwright-core/cli.js install chromium`.
- Accès en lecture au fichier Figma et identifiants requis par les outils REST existants.
- Pour une réparation autorisée seulement: fenêtre owner, pont live et captures avant validées.

## 1. Vérifier le socle sans mutation

```bash
npm run audit:organisms -- --help
npm run pages:selftest
npm run images:selftest
npm run extract:figma:visual:summary
```

Attendu: instruments disponibles; aucune écriture canvas. Un échec ou skip est conservé comme preuve
indisponible, pas transformé en succès.

## 2. Auditer la propreté des sources

Pour chaque section, auditer le master et tous ses usages par position/node id avant de normaliser
une preuve historique. Vérifier structure, contraintes, propriétés, bindings de variables, tailles
et descriptions, puis produire le reçu `sourceAudit`.

Attendu: une source `clean` peut entrer dans la chronologie; une source `dirty` ou `blocked` conserve
ses défauts et sa destination, sans être extraite ni promue comme référence saine.

## 3. Construire la campagne 020

Après implémentation des tâches, exécuter la commande readiness exposée par le package script :

```bash
npm run audit:readiness -- --campaign specs/020-figma-contract-readiness/registry/campaign.json --write-inventory
```

Attendu: exactement onze dossiers; chronologie stable; 0..3 candidats; état courant jamais promu
implicitement; `blocked-history` si les preuves nécessaires sont irrécupérables. Valider les sorties
avec les schémas de [contracts/](contracts/) et les règles de [data-model.md](data-model.md).

## 4. Tenir le premier gate owner

Ouvrir le rapport de chacune des onze sections, démarrer le chronomètre actif du packet, comparer
candidats et manques, puis enregistrer la décision et son `reviewTiming` conformément à
[owner-decision.schema.json](contracts/owner-decision.schema.json). Toute exploration historique
supplémentaire est chronométrée séparément. Relancer la campagne seulement lorsque chaque section
possède un reçu de premier gate, y compris lorsqu’il constate un blocage.

Attendu: sans décision, aucune réparation ni valeur `ready`; avec `more-evidence-required`, le dossier
reste ouvert; une référence validée rend la comparaison autorisable.

## 5. Diagnostiquer et router

Lancer la comparaison des trois surfaces et vérifier les cas composés sur la dépendance isolée et
ses autres consommateurs. Relancer la consolidation.

Attendu: chaque finding significatif a une cause; chaque dépendance partagée a tous ses consommateurs;
tout changement touchant 019 porte décision de repin; toute réparation non locale pointe vers une
sous-spec nommée.

## 6. Réparation locale éventuelle

Avant le premier geste, générer le manifest des cibles, capturer toutes les cibles et vérifier
dimensions/contenu. En parallèle, partitionner par nodes disjoints et confier le cycle pixel global
à un seul orchestrateur. Après le geste, tenir le gate visuel final.

Attendu: une décision `repair-accepted` ferme la réparation; `repair-refused` conserve l'écart et
interdit `ready`. Aucune réparation partagée n'est exécutée dans 020.

## 7. Clôturer et exécuter les portes

```bash
npm run audit:readiness -- --campaign specs/020-figma-contract-readiness/registry/campaign.json --check
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Attendu: bilan 11/11, verdict et destination uniques, aucun consommateur requis sans revalidation,
aucun pin 019 touché sans repin, métriques SC-003/SC-008 explicites, et sweep vert. La documentation
de capacité n’est finalisée qu’après l’enregistrement et l’exécution réussie des evals concernés.
Les commandes `audit:readiness` sont le contrat de
validation planifié; leur ajout appartient à `tasks.md`/implémentation, pas à cette phase de design.

## État de l’implémentation et contrôle hermétique

La commande est maintenant disponible et peut contrôler le périmètre sans ouvrir Figma :

```bash
npm run audit:readiness -- --campaign specs/020-figma-contract-readiness/registry/campaign.json --check
```

Elle refuse un périmètre autre que les onze IDs, une identité fondée sur un nom, une preuve
indisponible sans raison, une source non propre, une réparation sans reçu owner/capture et une
consolidation incomplète. Les checks enregistrés dans `npm run eval` couvrent notamment la limite
de trois candidats, les deux gates owner distincts, les impacts de dépendance et le routage 019.
La campagne versionnée part honnêtement sans preuve Figma historique ni décision owner : ses
dossiers initiaux sont donc bloqués, et non « prêts ».
