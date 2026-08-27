# Quickstart — Validate Figma Responsive CategoriesPrincipales

Ce guide valide l'exécution de 029. Il n'accorde aucun GO et ne doit pas être
utilisé pour contourner H1–H4. Les modèles de preuve sont dans
[data-model.md](data-model.md) et les contrats internes dans
[contracts/](contracts/). Le gabarit d'origine est la spec 028; tout point où ce
guide diverge de `028/quickstart.md` correspond à une entrée du registre
[écarts-028](contracts/proof-ledger.md#deviation-register).

## Prerequisites

- Utiliser le worktree Superset actif; ne pas en créer ou sélectionner un autre.
- Rendre le worktree autosuffisant: `npm install` puis
  `npx playwright install chromium` (Worktree Gates F1).
- Ouvrir le fichier Piqueray `d9FYAUcqdcNtsuaMgLefvJ` dans Figma Desktop avec le
  Desktop Bridge disponible (un seul pont, un seul writer).
- Créer DEUX campagnes fraîches:
  `specs/component-repairs/carte-categorie/run-001/campaign.json` puis
  `specs/component-repairs/categories-principales/run-001/campaign.json`.
- Ne modifier aucun contrat, token, émetteur, HTML, React ou fichier Odoo. Seuls
  le runner/transport Figma et leurs fixtures/evals peuvent changer côté code.

Vérifier les commandes exposées:

```bash
npm run component:repair -- --help
```

## 1. Audit read-only et H1

L'audit couvre LES DEUX masters, l'exclusivité de la carte et LES 7 usages, par
identité et par position:

```bash
npm run component:repair -- \
  --campaign specs/component-repairs/categories-principales/run-001/campaign.json \
  --audit
npm run component:repair -- \
  --campaign specs/component-repairs/carte-categorie/run-001/campaign.json \
  --audit
```

Résultat attendu:

- pin Figma frais; set `CategoriesPrincipales` (4 combinaisons Style×Colonnes,
  ids/keys relevés) et carte `Carte/Categorie` identifiés par position;
- exclusivité de la carte prouvée sur tout le fichier (un seul composeur), sinon
  la carte sort du périmètre mutable et la décision remonte à l'owner;
- 7 usages recensés par position avec configuration, nombre de cartes et rendu de
  référence;
- primitives numériques disponibles listées (ids, valeurs, propriétés compatibles);
- défauts préexistants séparés du delta responsive; contradictions avec 021/023
  nommées et retournées à H1;
- `figmaWrites=[]` et `pageWrites=[]`.

Enregistrer H1 dans `specs/029-figma-responsive-categories/decisions/H1-audit.json`.
H1 autorise seulement les frames de travail, hors masters et hors Pages.

## 2. Frames de travail et H2

Dans Figma, préparer des témoins séparés des masters, pour les configurations
2 ET 3 colonnes, avec contenu normal et contenu long:

```text
mobile   → 1 carte/ligne, aucun réglage de colonnes
desktop  → énuméré 2|3 effectif
wide     → comportement proposé à l'owner
contrôles → 320, 390, 834, 1200, 1440, 1728
```

Pour chaque proposition:

- montrer explicitement le 3 colonnes aux largeurs intermédiaires, ligne
  incomplète 2+1 comprise — décision owner, jamais tranchée par l'agent;
- démontrer d'abord si l'adaptation interne de la grille et de la carte suffit;
  ne proposer des états explicites que si cette démonstration échoue visiblement;
- enregistrer chaque binding primitive par propriété; s'arrêter devant l'owner si
  une primitive manque (aucune valeur brute, aucune création);
- enregistrer toute adaptation locale `pending-responsive-text-style`;
- montrer les cas sans image, image de rapport très différent, compte de cartes ≠
  colonnes, et la lisibilité du texte sur photo (style superposé) en mobile;
- ne modifier aucun master ni aucune Page.

Valider la décision contre
[figma-design-decision.md](contracts/figma-design-decision.md) — avec
`orphanRowDecision` et `cardExtentDecision` — puis enregistrer H2. H2 n'autorise
toujours aucune mutation de master.

## 3. Étendre et qualifier le runner avant H3

029 implémente la capacité décrite dans
[non-destructive-mutation.md](contracts/non-destructive-mutation.md). Avant le
spike ou toute écriture live, vérifier que des fixtures négatives puis des evals
couvrent et refusent:

- topologie de set existant mal identifiée (4 membres, créations possiblement
  nulles);
- création non déclarée;
- mauvaise paire Style×Colonnes active dans un scénario;
- binding de primitive absent ou détaché;
- écriture de Page ou d'un enfant partagé — y compris une instance de carte côté
  campagne section;
- second passage qui crée ou modifie encore un nœud.

```bash
npm run eval
npx tsc --noEmit
npx tsc -p tsconfig.build.json
```

Une fois la capacité verte, exécuter le spike hors source autoritative: identités
des 4 membres + carte + liens des usages préservés, propagation carte attribuée,
second passage no-op. Le spike doit être vert avant H3.

## 4. Captures globales, plan de mutation et H3

Repinner Figma, puis snapshot et captures — les captures before couvrent TOUTES
les surfaces des DEUX runs avant la première écriture (§X):

```bash
for RUN in carte-categorie categories-principales; do
  npm run component:repair -- \
    --campaign specs/component-repairs/$RUN/run-001/campaign.json \
    --snapshot-source \
    --backup-ref refs/codex/backups/029-$RUN-responsive
  npm run component:repair -- \
    --campaign specs/component-repairs/$RUN/run-001/campaign.json \
    --preflight
  npm run component:repair -- \
    --campaign specs/component-repairs/$RUN/run-001/campaign.json \
    --capture-before
  npm run component:repair -- \
    --campaign specs/component-repairs/$RUN/run-001/campaign.json \
    --dry-run
done
```

Avant H3, vérifier:

- captures des 2 masters (par variante) et des 7 usages non vides et correctement
  dimensionnées — jamais un sous-ensemble pilote;
- créations attendues explicitement comptées (possiblement zéro);
- identités du set, des 4 membres et de la carte inchangées au dry-run;
- deltas propagés attendus déclarés et attribués côté section;
- toutes les opérations correspondent exactement à H2; `pageWrites=[]`;
- rollback et blast radius présentés à l'owner.

Seul H3 approuvé autorise la suite.

## 5. Premier passage et vérification (carte PUIS section)

Pour chaque run, dans l'ordre `carte-categorie` puis `categories-principales`:

```bash
RUN=carte-categorie   # puis categories-principales
BASE=specs/component-repairs/$RUN/run-001
npm run component:repair -- --campaign $BASE/campaign.json \
  --emit-bridge-script --run first
npm run component:repair:bridge -- \
  --script $BASE/bridge-first.js \
  --output $BASE/bridge-first.raw.json \
  --file-key d9FYAUcqdcNtsuaMgLefvJ
npm run component:repair -- --campaign $BASE/campaign.json \
  --normalize-apply --run first \
  --bridge-result $BASE/bridge-first.raw.json \
  --receipt $BASE/apply-first.json
npm run component:repair -- --campaign $BASE/campaign.json \
  --record-apply --run first --receipt $BASE/apply-first.json
npm run component:repair -- --campaign $BASE/campaign.json --capture-after
npm run component:repair -- --campaign $BASE/campaign.json --verify
```

Comparer au [proof-ledger](contracts/proof-ledger.md). Tout overflow, binding
détaché, écart d'usage non attribué, écriture de Page, écriture d'enfant, création
inattendue ou fait protégé modifié est rouge. Contrôler la matrice scénarios:
6 largeurs × 2 configurations × contenus normal/long, sélection explicite,
mobile = 1 carte/ligne sans réglage exposé.

## 6. Second passage no-op

Pour chaque run, mêmes commandes avec `--run second`, puis:

```bash
npm run component:repair -- --campaign $BASE/campaign.json --capture-idempotence
npm run component:repair -- --campaign $BASE/campaign.json --verify-idempotence
```

Résultat attendu: toutes les opérations `no-op`, `createdNodeIds=[]`,
`changedNodeIds=[]`, `pageWrites=[]` (et `childWrites=[]` côté section); captures
et faits protégés after/idempotence identiques.

## 7. H4, finalize et handoff

Après revue owner des preuves finales — y compris le rapport de dérive réel qui
fonde la décision `parityPosture` — enregistrer H4 puis:

```bash
npm run component:repair -- \
  --campaign specs/component-repairs/categories-principales/run-001/campaign.json \
  --finalize
npm run component:repair -- \
  --campaign specs/component-repairs/carte-categorie/run-001/campaign.json \
  --finalize
```

Le handoff final doit:

- inventorier structure, primitives et typographie locale par comportement;
- marquer toutes les valeurs comme observations candidates;
- enregistrer `figma-ahead/pending-home-responsive-promotion` et nommer la dérive
  vis-à-vis des deux contrats gouvernés;
- porter le registre complet des écarts au gabarit 028, chacun avec sa cause;
- activer la garde contre une régénération Figma non coordonnée;
- déclarer que contrats, code, HTML, Odoo, couche rédacteur 023 et breakpoints
  automatiques ne sont pas qualifiés par 029.
