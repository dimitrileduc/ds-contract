# Quickstart — preuve de convergence des molécules 011

Ce guide sépare les diagnostics disponibles dans le WIP des commandes qui deviennent
contractuelles après implémentation. Une commande visuelle ne vaut jamais preuve de
clôture si elle omet un cas, rend un sujet invisible ou s'appuie sur une référence stale.

## Préconditions

- Node.js 20 ou supérieur ;
- dépendances installées dans ce worktree avec `npm install` ;
- Chromium Playwright installé avec `npx playwright install chromium` ;
- `FIGMA_TOKEN` disponible dans `.env.local`, limité aux lectures nécessaires ;
- branche de feature `011-fix-molecule-convergence`.

Les accès Figma de ce workflow sont exclusivement des `GET`. Ne jamais afficher le token,
conserver une URL CDN signée ou exécuter un script généré dans Figma.

## Scénario 0 — figer l'attribution avant correction

```bash
git rev-parse HEAD
git status --short
git diff --name-status 45e2a7d5a950e3d6ccc2a0dd62982b7c288210c5..HEAD
```

Attendu au début de la campagne :

- checkpoint historique :
  `45e2a7d5a950e3d6ccc2a0dd62982b7c288210c5` ;
- baseline WIP :
  `29d70187cdb7c7e45ca3bbc4f2d75da64bcd31b5` ;
- les changements `checkpoint→WIP` restent historiques ;
- seuls les changements `WIP→final` sont attribuables à 011.

Conserver le status et les hashes dans le futur rapport de clôture. Un fichier hors
périmètre modifié sans cause autorisée impose un arrêt.

## Scénario 1 — vérifier l'instrument actuel

```bash
npm run images:selftest
npx tsx evals/fixtures/visual-mask-false-green-check.ts
npx tsx evals/fixtures/visual-root-alignment-check.ts
npx tsx evals/fixtures/visual-transparent-ink-surface-check.ts
```

Attendu :

- le masque ne peut pas convertir un écart brut en succès ;
- les racines sont comparées sans translation calculée ;
- une surface commune contrastée révèle l'encre transparente ou blanche ;
- toute image manquante, non décodée ou invisible échoue.

Ces checks protègent l'instrument ; ils ne prouvent pas à eux seuls la convergence des
sept molécules.

## Scénario 2 — matérialiser les images de preuve

```bash
set -a
source .env.local
set +a
node extract/figma/visual-parity/fixture-assets/fetch.mjs
```

Le fetch doit :

- employer uniquement `GET /v1/files/:fileKey/images` et les GET CDN associés ;
- refuser un `fileVersion`, un nombre d'octets, un media type ou un SHA-256 différent ;
- écrire uniquement dans `extract/figma/visual-parity/fixture-assets/` ;
- ne jamais faire d'une image de preuve un défaut runtime.

Avant clôture, le manifeste doit couvrir les images exigées par tous les cas Carte,
MemberCard, ProductCard et Realisation, pas seulement les quatre reçus WIP.

## Scénario 3 — diagnostic WIP, non probant pour la clôture

```bash
npm run extract:figma:visual -- \
  carte field member-card nav-item product-card realisation tab \
  --refresh
```

Cette commande historique est utile au diagnostic, mais son énumération implicite ne
couvre pas encore l'inventaire complet. Son `REPORT.md`, sa baseline et ses dix
triptyques copiés ne constituent donc pas le verdict 011.

## Scénario 4 — campagne 011 après implémentation

```bash
npm run extract:figma:visual -- \
  --campaign specs/011-fix-molecule-convergence/contracts/visual-campaign.json \
  --out specs/011-fix-molecule-convergence/proofs/visual \
  --refresh
node scripts/verify-011-closure.mjs
```

Le runner implémenté doit suivre
`contracts/visual-campaign.interface.md` et produire
`proofs/visual/result.json` conformément à
`contracts/evidence-result.interface.md`.

Vérification machine minimale :

```bash
jq -e '
  .schemaVersion == 1
  and .campaignId == "011-fix-molecule-convergence"
  and .exitCode == 0
  and .verdict == "pass"
  and (.coverage.missing | length) == 0
  and (.coverage.unexpected | length) == 0
  and (.subjects | length) == 7
  and all(.subjects[]; .verdict == "pass")
  and all(.cases[];
    .verdict == "pass"
    and .probative == true
    and .geometry.verdict == "pass"
    and .pixels.verdict == "pass"
    and .pixels.rawPct <= 2.5
    and .semantics.verdict == "pass"
  )
' specs/011-fix-molecule-convergence/proofs/visual/result.json
```

Chaque cas doit conserver `figma.png`, `generated.png`, `diff.png`, `triptych.png` et
`metadata.json`. Le score masqué reste diagnostique ; le score brut et chaque région
obligatoire gouvernent le verdict.

## Scénario 5 — régénérer depuis les seules sources autorisées

Après une correction dans un contrat, le schéma ou un émetteur générique déjà protégé par
fixture :

```bash
npm run build
npm run figma:plan
npm run emitters:check
npm run catalog
npm run verify:catalog
```

`npm run figma:plan` ne fait que générer des scripts locaux : ne pas les exécuter dans
Figma. Relancer ensuite la campagne 011 complète et vérifier que les sorties générées
modifiées remontent à une source causale nommée.

## Scénario 6 — gates complets de clôture

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
npm run emitters:check
npm run catalog && npm run verify:catalog
npm run images:selftest
npm run extract:figma:visual -- \
  --campaign specs/011-fix-molecule-convergence/contracts/visual-campaign.json \
  --out specs/011-fix-molecule-convergence/proofs/visual \
  --refresh
```

Attendu :

- chaque commande sort avec le code `0` ;
- `npm run eval` fournit son compte vivant, sans nombre recopié comme constante ;
- les sept molécules ont une couverture exacte et un verdict `pass` ;
- le rapport suit `contracts/traceability-report.interface.md` ;
- `proofs/closure/review.json` documente la revue des sept verdicts en 600 secondes ou moins ;
- `proofs/attribution/final.json` et `proofs/closure/gates.json` sont produits ensemble ;
- aucun échec hérité, y compris le drift `Primitives/border-width/1`, n'est renommé,
  masqué ou attribué à tort à 011.

## Conditions d'arrêt

## État observé de la dernière exécution

Le 2026-07-29, `npm run eval` a réussi avec 153/153 évaluations. La campagne visuelle a capturé et comparé les 98 cas attendus, avec une couverture exacte de 227/227 faits et une validation des références Figma, mais son verdict reste `blocked` avec le code 2 : les sept écarts pixel et les limites d'instances immuables sont détaillés dans `proofs/visual/REPORT.md`. Cette sortie est attendue tant que T051 ne peut pas satisfaire son exigence d'un code 0 ; elle ne doit pas être transformée en succès par un seuil élargi ou une suppression de cas.

| Situation | Résultat requis |
|---|---|
| Référence Figma absente, stale ou modifiée temporairement | `blocked`, code `2` ; trouver une instance immuable par lecture seule |
| `ProductCard bouton=true` sans instance réelle prouvée | couverture incomplète, jamais `pass` |
| Image absente, hash différent, décodage ou région visible en échec | `asset-invalid` ou preuve non probante, code `2` |
| Cas attendu manquant ou cas inattendu | couverture incomplète, code `2` |
| Masque, crop ou translation améliore artificiellement le score | instrument invalide, code `2` |
| Géométrie différente sans pointeur de contrat justifiant la différence | `fail` |
| Score brut ou région obligatoire au-dessus de 2,5 % | `fail`, code `1` si la campagne reste complète et probante |
| Modification d'un émetteur sans fixture rouge préalable | arrêt avant génération |
| Gate dépôt rouge, hérité ou nouveau | clôture refusée ; attribution explicite dans le rapport |
| Toute mutation Figma détectée | clôture refusée |
