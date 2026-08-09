# `integrations/odoo/` — l'addon Odoo 19 de production

Spec propriétaire : `specs/019-odoo-production-foundation/`.

Ce répertoire possède **le produit déployable** (`addons/piqueray_ds`), **les décisions
d'authoring** (`config/`) et **sa QA réutilisable** (`qa/`). Il ne dépend d'aucun répertoire de
spec : le POC `specs/018-odoo-replique-manuelle/` fournit des *mécanismes à réexaminer*, jamais
une dépendance d'exécution ni une preuve de production.

## Les quatre frontières

Tout fichier d'ici appartient à exactement une des quatre catégories ci-dessous. Savoir laquelle
décide qui a le droit de l'éditer, et ce qu'un écart signifie.

### 1. Canonique — la source de vérité, **lue, jamais copiée**

Les cinq contrats, les jetons et les registres du dépôt.

```text
contracts/{presentation,section-header,button,google-reviews,review-card}.contract.json
tokens/*.tokens.json
contracts/icons.registry.json · contracts/named-literals.registry.json
```

Rien ici n'en est une copie. `integrations/odoo/config/inputs.lock.json` les **épingle** par
chemin, version et SHA-256 ; il ne les duplique pas. Une modification amont (typiquement par la
spec 020, qui avance en parallèle) fait échouer `npm run odoo:inputs:check` jusqu'à un **repin
explicite**, qui invalide les preuves affectées.

> La version seule ne détecte pas une modification non bumpée ; le hash seul ne porte pas de
> sémantique. Les deux sont requis, c'est pourquoi le lock porte les deux.

### 2. Décision — écrit par l'owner, relu, versionné

```text
config/presentation.authoring.json      # T042
config/google-reviews.authoring.json    # T026
config/adaptation-registry.json         # T062
config/inputs.lock.json                 # T010
```

Ces fichiers portent des **verdicts**, pas du code : ce qu'un rédacteur de site a le droit de
modifier, par quel mécanisme, à quelle adresse contractuelle. Il n'existe **aucun verdict par
défaut** — une prop ou une part sans décision fait échouer `npm run odoo:authoring:check`, avec son
adresse canonique dans le message.

Leurs formats sont figés par `specs/019-odoo-production-foundation/contracts/*.schema.json`.

### 3. Généré — produit par un script, **jamais édité à la main**

```text
addons/piqueray_ds/static/src/css/generated/tokens.pqr.css
addons/piqueray_ds/static/src/css/generated/components.pqr.css
addons/piqueray_ds/static/src/css/generated/fonts.pqr.css
addons/piqueray_ds/static/src/fonts/
addons/piqueray_ds/static/src/img/
derivation-report.json
```

**Interdit d'éditer quoi que ce soit sous `static/src/css/generated/`.** Ce n'est pas une
convention de politesse :

- ces fichiers sont **intégralement réécrits** par `npm run odoo:assets` ; une retouche est perdue
  au prochain build, silencieusement ;
- `npm run odoo:assets -- --check` régénère en mémoire et compare : une retouche rend la porte
  **rouge** avec le statut `tampered` ;
- une retouche est **indistinguable d'un drift** — c'est précisément la raison pour laquelle une
  valeur de design retapée à la main n'a pas sa place ici.

Chaque fichier généré porte un en-tête `DO NOT EDIT` nommant la commande qui le refait.

**Si une valeur manque, elle manque en amont.** La corriger ici, c'est la rendre invisible au
différentiel : la règle du dépôt est que la géométrie se porte en jetons, jamais en littéraux, et
un littéral posé dans une sortie générée ne siège sur aucun axe.

### 4. Manuel — source cible-spécifique, isolée, **comptée**

```text
addons/piqueray_ds/views/*.xml
addons/piqueray_ds/static/src/js/*.js
addons/piqueray_ds/static/src/xml/*.xml
addons/piqueray_ds/static/src/css/odoo-bridge.css
```

Ce sont de **vraies sources**, pas des sorties déguisées : QWeb, options du builder, actions de
collection, média, garde de version, mécanique Odoo. 019 les écrit à la main **et les mesure** —
c'est la mesure qui décidera en 025 si un émetteur `odoo` vaut le coup, pas une impression.

Chaque bloc manuel est encadré par un marqueur unique :

```xml
<!-- ODOO-019-XXXX BEGIN -->
…
<!-- ODOO-019-XXXX END -->
```

et enregistré dans `config/adaptation-registry.json` avec son `reasonCode` et son `mechanism`.
Un bloc sans entrée de registre, une entrée sans bloc, ou deux marqueurs qui se chevauchent font
échouer `npm run odoo:derivation:check`. Il n'existe **aucun champ « dérivable »** : l'auteur d'un
bloc ne peut pas juger objectivement si son travail était dérivable, donc le rapport compte des
fichiers, des blocs, des lignes et des octets — jamais un avis.

`__manifest__.py` est manuel mais **hors registre** : il n'est encadré par aucun marqueur.

## Cartographie

```text
integrations/odoo/
├── README.md                     ← ce fichier
├── tsconfig.json                 ← `integrations/` est hors du tsconfig racine (voir plus bas)
├── config/                       ← décisions (2)
├── addons/piqueray_ds/           ← généré (3) + manuel (4)
└── qa/
    ├── compose.yaml · .env.example   ← instance jetable épinglée
    ├── visual/                       ← instruments de comparaison d'image
    ├── scenarios/                    ← gestes Playwright, un `scenarioId` par fichier
    └── fixtures/                     ← inventaires attendus, charges hostiles
```

## Le harnais visuel

Quatre instruments **agnostiques des composants** (`qa/visual/`), plus le contrat de sujet :

| Fichier | Rôle |
|---|---|
| `subject.mts` | le type `Subject`, la géométrie épinglée, le chargement validé des sujets |
| `render-html.mts` | côté **référence** : rend un contrat par `emitHtml` au clip épinglé |
| `capture-odoo.mts` | côté **Odoo** : capture la page de mesure, publique et sans session |
| `compare.mts` | appelle `extract/image-parity` sans le modifier, une fois par sujet |
| `selftest.mts` | prouve le harnais hors ligne, sans instance |

Les **sujets** ne sont pas dans l'instrument : ils arrivent par `--subjects <module>` et sont
écrits par T025 (`visual/subjects/google-reviews.mts`) et T041 (`visual/subjects/presentation.mts`).
C'est ce qui distingue 019 de 018, où type, constantes et trois sujets vivaient dans un fichier
unique.

> **Écart nommé** : T004 énumère quatre fichiers ; il y en a cinq. `subject.mts` existe parce que
> les trois instruments *et* les modules de sujets ont besoin du même type et des mêmes constantes,
> et que le loger dans `render-html.mts` forcerait `capture-odoo.mts` à importer `emitHtml` et
> `loadRepoData` pour lire une interface.

```bash
npx tsx integrations/odoo/qa/visual/selftest.mts            # hors ligne
npx tsx integrations/odoo/qa/visual/selftest.mts --strict   # un saut devient un échec
```

Un contrôle non exécutable est **sauté et dit comme tel**, jamais agrégé comme réussi. `--strict`
est la forme qu'emploient les portes de clôture, où un saut permanent serait un trou.

## Typage

`integrations/` **n'est pas** dans le `include` du `tsconfig.json` racine. Sans le `tsconfig.json`
local, rien ici ne serait typé par `npx tsc --noEmit` — le trou exact qui a déjà mordu ce dépôt sur
`evals/fixtures`, où changer une signature partagée laissait `tsc` vert et cassait `npm run eval`
au runtime.

```bash
npx tsc -p integrations/odoo/tsconfig.json --noEmit
```

`scripts/odoo/` n'a pas besoin de cette mitigation : `scripts` est déjà dans le `include` racine.

## Instance de qualification

```bash
cp integrations/odoo/qa/.env.example integrations/odoo/qa/.env
docker compose -f integrations/odoo/qa/compose.yaml --env-file integrations/odoo/qa/.env up -d
```

Images épinglées, identiques à `config/inputs.lock.json` :

| Image | Épinglage |
|---|---|
| `odoo:19.0-20260803` | tag **daté**, jamais flottant |
| `postgres:15` | tag **mineur** — voir la limite ci-dessous |

> **Limite `ODOO-LIMIT-PG-TAG`** — `postgres:15` est un tag mineur mouvant : deux
> qualifications à des dates éloignées peuvent tourner sur deux correctifs différents de
> PostgreSQL 15. L'image Odoo, elle, est datée. Cette asymétrie est assumée : la base ne participe
> ni au rendu ni aux décisions d'authoring. Elle est nommée ici pour ne pas être découverte comme
> une surprise.

Le `healthcheck` d'Odoo interroge `/web/health` : il prouve que le serveur **écoute**, pas que
`piqueray_ds` est installé. Ce verdict appartient aux scénarios de qualification.

## Ce que ce répertoire ne fait pas

- **Aucun émetteur `odoo` dans `core/`.** Le générateur générique est le sujet de la spec 025, après
  accumulation des faits ; `core/` reste vendor-neutral.
- **Aucune migration du HTML déjà posé.** Odoo clone puis sauvegarde l'`outerHTML` du bloc : mettre
  à jour un template n'altère pas les copies existantes. 019 **signale** une structure ancienne
  (`structure-stale`) et exige une action humaine ; il ne réécrit jamais une arche.
- **Aucune modification de contrat, de token ou de `core/`** pour faire passer Odoo.
