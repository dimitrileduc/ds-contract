# Quickstart de validation : réparation de la projection Figma

Ce guide décrit le parcours exécutable attendu après implémentation. Il valide la feature de bout en
bout; il ne contient ni corps de moteur, ni script complet de mutation.

## 1. Prérequis

- être dans le worktree de la branche `021-figma-projection-repair`;
- utiliser Node.js 20 ou plus récent;
- disposer des accès Figma attendus par les outils existants;
- ouvrir le fichier Piqueray autorisé et son Desktop Bridge uniquement au moment des étapes live;
- ne lancer aucun autre writer canvas pendant la campagne.

Rendre le worktree autonome :

```bash
npm install
npx playwright install chromium
```

Vérifier l'état de départ sans mutation :

```bash
npm run build
npm run parity
npm run eval
npm run plugin:check
```

Résultat attendu : les gates existants sont verts avant la campagne. Un gate rouge bloque la suite;
il n'est pas attribué automatiquement à la feature.

## 2. Préparer et contrôler le manifeste

Le manifeste d'implémentation doit valider
[`contracts/repair-campaign.schema.json`](contracts/repair-campaign.schema.json) et reprendre les
sept références de 020.

```bash
npm run projection:repair -- \
  --campaign specs/021-figma-projection-repair/campaign/campaign.json \
  --preflight
```

Résultat attendu :

- fichier `d9FYAUcqdcNtsuaMgLefvJ` et version courante épinglés;
- exactement 7/7 cibles;
- tous les masters, variantes, usages et consommateurs listés;
- aucune opération hors allowlist;
- état `preflight-valid`;
- zéro écriture canvas.

Cas de refus à vérifier : changer localement un node id ou le pin de version dans une copie du
manifeste. Le préflight doit sortir non-zéro et le fichier Figma doit rester inchangé.

## 3. Capturer tout l'avant

```bash
npm run projection:repair -- \
  --campaign specs/021-figma-projection-repair/campaign/campaign.json \
  --capture-before
```

Résultat attendu :

- un PNG valide et un état structurel pour chaque surface affectée;
- dimensions conformes à la matrice du manifeste;
- inventaire positionnel de toutes les peintures IMAGE;
- liens master→instance et digests d'overrides;
- état `captured`, puis `ready-to-apply` uniquement si tout est complet.

Cas de refus à vérifier : remplacer une capture dans une copie de travail par un fichier vide ou
déclarer une mauvaise dimension. La validation doit bloquer avant mutation.

## 4. Prouver les trois correctifs partagés headlessly

Exécuter les fixtures rouges devenues vertes via la porte publique :

```bash
npm run eval
node scripts/plugin-engine-check.mjs
node scripts/core-browser-check.mjs
```

Les preuves minimales sont :

1. un enfant `position:absolute` ne contribue plus à la taille ou au gap de son parent et conserve
   son placement attendu;
2. modifier `Titre`/`Accroche` sur une instance Coordonnées ou Formulaire modifie le texte visible du
   SectionHeader imbriqué;
3. les propriétés d'icône de Button changent réellement l'instance visible et CarouselControls
   rend un contrôle gauche puis un contrôle droit;
4. les témoins sans `position:absolute`, sans mapping parent et à icône statique restent inchangés.

## 5. Examiner le dry-run live

Avec le Desktop Bridge ouvert sur le fichier épinglé :

```bash
npm run projection:repair -- \
  --campaign specs/021-figma-projection-repair/campaign/campaign.json \
  --dry-run
```

Résultat attendu : le rapport annonce uniquement les changements suivants :

- Hero/SAV : géométrie hors flux et composition restaurées;
- Coordonnées/Formulaire : références de propriétés composées rendues vivantes;
- Button/CarouselControls/Produits e-commerce : glyphes swap pilotables et directions opposées;
- Catégories : variante `2115:4275`, trois cartes aux mesures de référence;
- Réalisations : bloc d'en-tête de `2117:4690`, grille et contenu exclus du diff autorisé.

Le dry-run doit refuser une photo sans accueil, une propriété enfant introuvable, un composant
d'icône absent ou une structure différente du manifeste.

## 6. Appliquer le lot unique

L'action `--apply` est la seam réservée au `CanvasWriter`; elle ne fabrique jamais une autorité de
mutation depuis un token REST. Dans une session agent, injecter le plan de l'étape 5 dans
`applyCampaign(plan, writer)` avec le **writer Desktop Bridge connecté**, puis exécuter les scripts
générés et les deux opérations directes de façon sérialisée. Le CLI Node seul refuse cette action
quand l'adaptateur MCP `figma_execute` n'est pas présent.

Résultat attendu : état `applied`; chaque opération consigne ses pré/postconditions et son node id
dans les reçus live. Une opération échouée arrête le lot, produit `application-failed` et interdit
toute présentation comme succès.

## 7. Capturer et comparer l'après

```bash
npm run projection:repair -- \
  --campaign specs/021-figma-projection-repair/campaign/campaign.json \
  --capture-after

npm run projection:repair -- \
  --campaign specs/021-figma-projection-repair/campaign/campaign.json \
  --verify
```

Résultat attendu :

- 7/7 cibles correspondent aux faits de leur référence;
- zéro changement significatif hors allowlist;
- mêmes images au même `hostId + structuralPath + paintIndex`;
- mêmes identités master→instance et mêmes overrides non autorisés;
- tous les consommateurs partagés portent `unchanged` ou `revalidated`;
- toute qualification Odoo 019 potentiellement touchée a une décision explicite;
- état `verified`.

Un résidu pixel n'est jamais automatiquement toléré. Il reste un finding visible jusqu'à décision
owner, avec sa boîte de diff et son attribution.

## 8. Prouver l'idempotence

Sans modifier aucune entrée, relancer exactement le même lot avec le writer Desktop Bridge, puis la
capture dédiée :

```bash
npm run projection:repair -- \
  --campaign specs/021-figma-projection-repair/campaign/campaign.json \
  --capture-idempotence

npm run projection:repair -- \
  --campaign specs/021-figma-projection-repair/campaign/campaign.json \
  --verify-idempotence
```

Résultat attendu : le deuxième apply ne produit que des no-op; géométrie, PNG, propriétés, images,
liens et digests normalisés sont identiques au premier après.

## 9. Tenir le gate owner

Pour chaque cible, enregistrer une décision conforme à
[`contracts/repair-receipt.schema.json`](contracts/repair-receipt.schema.json), puis consolider :

```bash
npm run projection:repair -- \
  --campaign specs/021-figma-projection-repair/campaign/campaign.json \
  --finalize
```

Résultat attendu : exactement sept reçus; chaque cible vaut `accepted` ou `refused`, jamais un succès
implicite. Un reçu accepté exige zéro diff inattendu, préservation images/instances, impacts clos et
idempotence verte.

## 10. Sweep constitutionnel de clôture

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Résultat attendu : toutes les portes sont vertes depuis ce worktree. Les comptes d'evals sont lus
dans la sortie vivante et ne sont pas recopiés comme nombre durable dans la documentation.
