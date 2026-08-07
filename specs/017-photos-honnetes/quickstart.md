# Quickstart — Photos honnêtes (017)

**Date**: 2026-08-06 · [spec.md](spec.md) · [plan.md](plan.md) · [research.md](research.md)

Comment exécuter ce chantier, dans l'ordre, avec ce qui se vérifie à chaque étape. **Le compte vif imprimé par la commande fait foi** — aucun nombre de ce document n'est à recopier dans une preuve.

---

## 0 · Le worktree, avant tout

```bash
# depuis le checkout principal — COMMITER d'abord les documents de planning,
# sinon le worktree les manque (leçon 015/T001, intégrée en amont par 016)
git add specs/017-photos-honnetes && git commit -m "docs(017): plan, research, data-model, contracts"
git worktree add ../ds-contract-017 017-photos-honnetes

cd ../ds-contract-017
npm install                          # `npm run eval` symlinke le node_modules du checkout : il refuse sans
npx playwright install chromium      # deux contrôles pilotent un vrai Chromium
```

Puis **prouver le point de départ vert**, archivé dans `proofs/depart-sweep.txt` :

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

> Jamais deux sweeps en parallèle : `evals/.scratch` est un chemin unique, et une collision rend de **faux rouges**.

---

## 1 · La sonde `getInstancesAsync` — en lecture seule, avant d'écrire une ligne de moteur

C'est la seule prémisse du plan qui n'est pas déjà mesurée : la méthode **n'a aucun usage dans ce dépôt**. Elle se sonde par le pont, sur le fichier client, **sans muter quoi que ce soit** :

```js
// via figma_execute — LECTURE SEULE
await figma.loadAllPagesAsync();
const comp = await figma.getNodeByIdAsync('<id d’un maître porteur de photos>');
const t0 = Date.now();
const insts = await comp.getInstancesAsync();
return { existe: typeof comp.getInstancesAsync === 'function', n: insts.length, ms: Date.now() - t0 };
```

- **La sonde rend des instances** → D1 tient, le moteur descend par `getInstancesAsync()`.
- **La sonde refuse ou sature** → le repli nommé s'applique : registre orchestré `(hostId, ordre) → hash` passé au script, forme déjà éprouvée par `specs/016-canvas-vrai/proofs/repose/photos-instances.json`.
- **La sonde est empêchée** (pont déconnecté — l'état documenté au 2026-08-06) → consignée `empeche` avec sa raison, **et US1 démarre sur le repli**. Le sans-tête fait foi : un pont indisponible ne devient pas un blocage produit. La sonde reste due, et la bascule ultérieure vers `getInstancesAsync` sera additive, avec sa propre preuve.

Le résultat, quel qu'il soit, va dans `proofs/sonde-getinstances.md`. **Une sonde empêchée se dit** ; elle ne se contourne pas par inférence — mais elle n'arrête pas le chantier non plus.

---

## 2 · US1 sans tête — la boucle qui fait foi

L'ordre est imposé par §II (fixture → eval → claim) et par §VII (l'émetteur, puis le mock).

```bash
# 1. le faux-Figma apprend les instances miroir, l'ImagePaint et getInstancesAsync
#    scripts/plugin-engine-mock-figma.mjs

# 2. la fixture REJOUE la perte du 2026-08-06 — elle doit ÉCHOUER avant le correctif
npx tsx evals/fixtures/photos-instance-overrides-preserved-check.ts     # attendu : rouge

# 3. l'émetteur est réparé — core/emit-figma-script.ts
npm run build

# 4. la même fixture, maintenant verte
npx tsx evals/fixtures/photos-instance-overrides-preserved-check.ts     # attendu : vert

# 5. les trois re-pins, dans cet ordre (research D14)
npm run golden:update
node scripts/build-plugin-zip.mjs --update-engine-receipt
#    + régénérer examples/polaris/figma/*.figma.js  ← le troisième reçu, celui qu'on oublie

# 6. la porte est branchée : le cas dans evals/run.ts, puis
npm run eval          # imprime son N/N vif — c'est le seul compte qui fait foi
```

**Les trois cas adverses sont obligatoires et s'écrivent AVANT la revendication** : photo perdue → échec nommé ; deux photos interverties → échec nommant les deux emplacements ; photo sans accueil → refus **sans avoir touché un seul nœud**.

> `evals/fixtures/` est **hors `tsconfig`** : changer une signature partagée laisse `tsc` vert et casse `npm run eval` au runtime. Lancer la fixture à la main après toute édition de signature.

---

## 3 · US2 — la mesure remise à armes égales

```bash
# état de départ, à archiver avant de toucher à l'instrument
npm run extract:figma:visual -- --summary                 # les 8 lignes « frontière image »

# épingler les assets manquants de member-picture (set 274:2389)
node extract/figma/visual-parity/fixture-assets/fetch.mjs # + reçu au manifeste : sha256, imageRef, runtimeDefault:false

# déclarer comparisonProps + fixtureAssetIds sur les 5 sujets, puis re-mesurer
npm run extract:figma:visual -- realisation carte member-card product-card member-picture --refresh
npm run extract:figma:visual -- --summary
```

Puis **re-classer** : les six règles de `triage.ts` couvrant ces huit lignes se réécrivent d'après la mesure d'après. La règle D8 le rend exécutoire — toute ligne à score brut strictement positif sans règle sort en `UNTRIAGED`, classée première.

La baseline ne se déplace qu'avec le motif écrit :

```bash
npm run extract:figma:visual -- --write-baseline          # geste délibéré, jamais un réflexe
```

> `extract/figma/visual-parity/run.ts` contient **2 octets NUL légitimes** : `grep`/`rg` BSD le croit binaire et rend **0 résultat sans erreur**. Utiliser `grep -a` / `rg -a` ou Python.

---

## 4 · US3 — la clause et la documentation

```bash
npm run build                        # la légende change sur 9 composants, pas 34
# la preuve se lit sur les scripts générés — 71 fichiers portent « generated from contract »
grep -a -h -o "generated from contract [^\"']*" figma-sync/*.js | sort -u
npm run parity                       # les autres axes ; il ne voit PAS la description (voir ci-dessous)
```

> **Deux prémisses corrigées le 2026-08-06, relevées et non supposées.** (1) `npm run parity` **ne compare pas la description** : `parity/diff.ts` ne lit jamais ce champ (son interface `FigmaSet`, `:89-96`, ne le porte pas). Il ne peut donc ni prouver cette étape, ni rougir dessus. (2) `parity/snapshots/figma-components.json` ne bouge **que** par une capture vive au pont, et 017 ne mute pas le canevas : le differ contre son propre archivage rendrait **0 changement**. La preuve vit côté généré, avec le re-pin `evals/golden.json` en second reçu.

Vérification à l'œil, celle que la spec demande : lire la légende émise pour un composant à cadre photo — **une ligne**, elle dit ce qu'est le cadre. Puis poser à `docs/` seule la question « que devient ma photo à la reconstruction ? » : elle doit répondre **sans qu'on lise le code** — et cette réponse est désormais **épinglée par un cas d'eval** (T036a), le premier du dépôt à lire `docs/`.

**Ce que cette étape n'atteint pas** : le canevas. Tant que le lot de régénération de §5 n'a pas tourné, un designer qui ouvre le fichier lit encore l'ancienne légende. C'est **SC-006-vif** — reporté et nommé, jamais compté comme acquis.

---

## 5 · Le reçu vif (FR-002b) — planifié, jamais improvisé

**Précondition bloquante** : la restauration des 62 photos effondrées appartient à 016 et attend le pont. **Aucune reconstruction sur le fichier client** ne démarre avant qu'elle soit exécutée et prouvée. Le travail des étapes 1 à 4 n'est pas bloqué par cette précondition.

Quand la fenêtre est ouverte avec l'owner, dans cet ordre :

Deux outils, deux rôles — la CLI ci-dessous est celle qu'ils ont **réellement**, relevée le 2026-08-06 : `photos-census.js` tourne **dans le bac à sable via le pont** (receiver local requis), `photos-verify.mts` est un comparateur **hors ligne à deux chemins positionnels** — il n'a ni `--avant` ni `--apres`, et appelé nu il sort en `exit(2)`.

```bash
# §X — capturer l'état AVANT de CHAQUE cible, jamais un sous-ensemble pilote,
#      et vérifier chaque capture non vide et correctement dimensionnée
#   1. recensement AVANT, par POSITION, masters ET instances — via le pont (figma_execute)
#      → specs/017-photos-honnetes/proofs/vif/census-avant.json
#   2. … le lot de régénération … (c'est lui qui porte enfin la clause au canevas)
#   3. recensement APRÈS → proofs/vif/census-apres.json
#   4. le verdict, hors ligne :
npm run photos:verify -- \
  specs/017-photos-honnetes/proofs/vif/census-avant.json \
  specs/017-photos-honnetes/proofs/vif/census-apres.json \
  --out specs/017-photos-honnetes/proofs/recu-vif-photos.md
```

Le pont sature sur un parcours global (≈ 5 350 nœuds) : **le lotissement est obligatoire**, pas une optimisation.

---

## 6 · Clôture

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json \
  && npm run extract:figma:visual -- --summary \
  && npm run photos:verify -- --selftest        # le SEUL mode sans tête de cet outil
```

> `--selftest` prouve le **comparateur**, pas les photos du client. **La porte photos sans tête, celle qui fait foi (SC-008), est le cas d'eval branché en T019** — il tourne dans le `npm run eval` ci-dessus, partout et sans le fichier ouvert.

Archivé dans `proofs/sweep-cloture.txt`. Et la règle qui vaut plus que le sweep : **toute vérification empêchée ou incomplète se dit et se consigne** — jamais comptée comme un succès silencieux (FR-015).
