# Quickstart — Validate Figma Responsive HeroVideo

Ce guide valide la future exécution de 028. Il n'accorde aucun GO et ne doit pas
être utilisé pour contourner H1–H4. Les modèles de preuve sont dans
[data-model.md](data-model.md) et les contrats internes dans [contracts/](contracts/).

## État actuel et lignée des runs

Les sections 1 à 6 décrivent l'installation initiale et restent attachées à
run-003. Elles ne doivent pas être rejouées sur la source actuelle :

- run-003 a installé le Component Set et prouvé un premier second passage no-op ;
- run-004 a corrigé les largeurs d'aperçu mais son verify a refusé la dérive de
  valeur par défaut Wide vers Compact ;
- run-005 a restauré Wide par défaut, conservé les aperçus 390/1200/1728 et
  constitue la campagne canonique vérifiée pour H4 et finalize.

Pour reprendre le résultat courant sans écriture, lire d'abord le
[ledger](proofs/ledger.json), les trois documents de [handoff](handoff/) et la
[preuve de correction](proofs/phase-4-authoring-layout-correction.md), puis
contrôler les reçus et verifies de run-005. H4 reste obligatoire : run-005 ne
qualifie ni breakpoint automatique, ni contrat, ni code, ni HTML, ni Odoo.

## Prerequisites

- Utiliser le worktree Superset actif; ne pas créer ou sélectionner un autre
  worktree.
- Ouvrir le fichier Piqueray attendu dans Figma Desktop avec le Bridge disponible.
- Créer une campagne fraîche
  `specs/component-repairs/hero-video/run-003/campaign.json`; ne pas modifier le
  brouillon `run-002` lié à 027.
- Installer les dépendances du workspace si nécessaire avec `npm install`.
- Ne modifier aucun contrat HeroVideo, token, émetteur de surface, HTML, React ou
  fichier Odoo. Seuls le runner/transport Figma et leurs fixtures/evals peuvent
  changer côté code.

Vérifier les commandes exposées:

```bash
npm run component:repair -- --help
```

## 1. Audit read-only et H1

```bash
npm run component:repair -- \
  --campaign specs/component-repairs/hero-video/run-003/campaign.json \
  --audit
```

Résultat attendu:

- pin Figma frais;
- master, key, Container, usage Home et contexte Header identifiés par position;
- Button, textes, Text Styles, variables, poster/crop, voiles, propriétés, liens et
  overrides inventoriés;
- primitives disponibles listées avec ids, valeurs et propriétés compatibles;
- statut du défaut CTA Home explicite, read-only et non bloquant;
- `figmaWrites=[]` et `pageWrites=[]`.

Enregistrer H1 dans `specs/028-figma-responsive-hero-video/decisions/H1-audit.json`.
H1 autorise seulement les frames de travail hors du Container et des Pages.

## 2. Frames de travail et H2

Dans Figma, préparer des témoins séparés du master:

```text
390  → Presentation=Compact
834  → Presentation=Compact
1200 → Presentation=Desktop
1728 → Presentation=Wide reference
```

Ajouter les contrôles 320, 1440 et paysage court. Tester le contenu par défaut, un
titre long et un CTA long. Pour chaque proposition:

- enregistrer chaque binding primitive par propriété;
- enregistrer toute adaptation locale `pending-responsive-text-style`;
- vérifier min-height + croissance, absence de clipping et accessibilité;
- conserver le même poster/crop, les mêmes voiles et le même Button;
- nommer tout conflit avec le point focal du poster ou une capacité enfant.

Valider la décision contre
[figma-design-decision.md](contracts/figma-design-decision.md), puis enregistrer H2.
H2 n'autorise toujours aucune mutation du master.

## 3. Étendre et qualifier le runner avant H3

028 implémente elle-même la capacité décrite dans
[non-destructive-transition.md](contracts/non-destructive-transition.md). Avant le
spike ou toute écriture live, vérifier que les evals couvrent et refusent:

- set ou membre Wide mal identifié;
- création non déclarée;
- mauvais état `Presentation` dans un scénario;
- binding de primitive absent ou détaché;
- Page write ou mutation d'un enfant partagé;
- second passage qui crée ou modifie encore un nœud.

Exécuter les validations ciblées puis globales:

```bash
npm run eval
npx tsc --noEmit
npx tsc -p tsconfig.build.json
```

Le CTA Home n'entre dans aucun gate: il reste seulement visible dans les captures
read-only. Une fois la capacité runner verte, exécuter le spike hors source
autoritative. Le spike et son second passage no-op doivent être verts avant H3.

## 4. Préparer le plan de mutation et H3

Une fois le runner et le spike verts, repinner Figma puis créer un snapshot source
récupérable:

```bash
npm run component:repair -- \
  --campaign specs/component-repairs/hero-video/run-003/campaign.json \
  --snapshot-source \
  --backup-ref refs/codex/backups/028-hero-video-responsive

npm run component:repair -- \
  --campaign specs/component-repairs/hero-video/run-003/campaign.json \
  --preflight

npm run component:repair -- \
  --campaign specs/component-repairs/hero-video/run-003/campaign.json \
  --capture-before

npm run component:repair -- \
  --campaign specs/component-repairs/hero-video/run-003/campaign.json \
  --dry-run
```

Avant H3, vérifier:

- toutes les captures master/Home/Home+Header sont non vides et correctement
  dimensionnées;
- les créations du set, Compact et Desktop sont explicitement comptées;
- le membre Wide conserve id/key et l'instance Home conserve lien/overrides;
- toutes les opérations correspondent exactement à H2;
- `pageWrites=[]`;
- rollback et blast radius sont présentés à l'owner.

Seul H3 approuvé autorise la suite.

## 5. Premier passage et vérification

Émettre puis transporter le script borné:

```bash
npm run component:repair -- \
  --campaign specs/component-repairs/hero-video/run-003/campaign.json \
  --emit-bridge-script --run first

npm run component:repair:bridge -- \
  --script specs/component-repairs/hero-video/run-003/bridge-first.js \
  --output specs/component-repairs/hero-video/run-003/bridge-first.raw.json \
  --file-key d9FYAUcqdcNtsuaMgLefvJ

npm run component:repair -- \
  --campaign specs/component-repairs/hero-video/run-003/campaign.json \
  --normalize-apply --run first \
  --bridge-result specs/component-repairs/hero-video/run-003/bridge-first.raw.json \
  --receipt specs/component-repairs/hero-video/run-003/apply-first.json

npm run component:repair -- \
  --campaign specs/component-repairs/hero-video/run-003/campaign.json \
  --record-apply --run first \
  --receipt specs/component-repairs/hero-video/run-003/apply-first.json

npm run component:repair -- \
  --campaign specs/component-repairs/hero-video/run-003/campaign.json \
  --capture-after

npm run component:repair -- \
  --campaign specs/component-repairs/hero-video/run-003/campaign.json \
  --verify
```

Comparer le résultat à [proof-ledger.md](contracts/proof-ledger.md). Tout overflow,
binding détaché, delta Wide, Page write, création inattendue ou fait protégé modifié
est rouge.

## 6. Second passage no-op

```bash
npm run component:repair -- \
  --campaign specs/component-repairs/hero-video/run-003/campaign.json \
  --emit-bridge-script --run second

npm run component:repair:bridge -- \
  --script specs/component-repairs/hero-video/run-003/bridge-second.js \
  --output specs/component-repairs/hero-video/run-003/bridge-second.raw.json \
  --file-key d9FYAUcqdcNtsuaMgLefvJ

npm run component:repair -- \
  --campaign specs/component-repairs/hero-video/run-003/campaign.json \
  --normalize-apply --run second \
  --bridge-result specs/component-repairs/hero-video/run-003/bridge-second.raw.json \
  --receipt specs/component-repairs/hero-video/run-003/apply-second.json

npm run component:repair -- \
  --campaign specs/component-repairs/hero-video/run-003/campaign.json \
  --record-apply --run second \
  --receipt specs/component-repairs/hero-video/run-003/apply-second.json

npm run component:repair -- \
  --campaign specs/component-repairs/hero-video/run-003/campaign.json \
  --capture-idempotence

npm run component:repair -- \
  --campaign specs/component-repairs/hero-video/run-003/campaign.json \
  --verify-idempotence
```

Résultat attendu: tous les operation ids sont `no-op`, avec
`createdNodeIds=[]`, `changedNodeIds=[]` et `pageWrites=[]`; les captures et faits
protégés after/idempotence sont identiques.

## 7. H4, finalize et handoff

Après revue owner des preuves finales, enregistrer H4 puis:

```bash
npm run component:repair -- \
  --campaign specs/component-repairs/hero-video/run-005/campaign.json \
  --finalize
```

Le handoff final doit:

- inventorier structure, primitives et typographie locale par composition;
- marquer toutes les valeurs comme observations candidates;
- enregistrer `figma-ahead/pending-home-responsive-promotion`;
- activer la garde contre une régénération Figma non coordonnée;
- déclarer explicitement que contrat, code, HTML, Odoo et breakpoints automatiques
  ne sont pas qualifiés par 028.
