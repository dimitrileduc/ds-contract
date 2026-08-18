# Quickstart de qualification — Fondation Odoo de production

Ce guide décrit la validation de bout en bout attendue **après implémentation**. Il ne remplace ni
les décisions d'authoring ni les tâches. Les noms de scripts ci-dessous sont les interfaces à
livrer par 019.

## Prérequis

- Node.js ≥ 20 et dépendances du worktree installées;
- Docker avec les images exactes du snapshot;
- Chromium Playwright installé dans le worktree;
- aucun changement non repinné dans les neuf contrats de la fermeture ou leurs entrées;
- ports locaux de la QA Odoo disponibles.

Le lock à contrôler est `integrations/odoo/config/inputs.lock.json`. Les formats attendus sont dans
`specs/019-odoo-production-foundation/contracts/`.

## 1. Contrôler les entrées et décisions

```bash
npm run odoo:inputs:check
npm run odoo:authoring:check
```

Résultat attendu :

- 4 racines et 9 contrats résolus aux versions/hash épinglés;
- couverture complète des props et parts annoncées par chaque config, puis de leurs occurrences imbriquées;
- 0 verdict manquant/dupliqué, 0 chemin ambigu/invalide;
- tout sélecteur de part préfixé par sa racine.

Les fixtures négatives du validateur doivent aussi prouver qu'une prop sans verdict et qu'un chemin
imbriqué invalide sont refusés avec une adresse canonique lisible.

## 2. Régénérer sans permettre de retouche

```bash
npm run odoo:assets
npm run odoo:assets -- --check
npm run odoo:derivation:check
```

Résultat attendu :

- les tokens/CSS/fontes/assets générés sont à jour;
- une deuxième génération ne modifie aucun octet;
- chaque bloc manuel marqué est classé dans le registre;
- `unclassified.files`, `unclassified.blocks` et `unclassified.registryEntries` sont vides;
- `derivation-report.json` est identique à l'octet sur deux productions.

Modifier temporairement une copie de fixture d'une sortie générée doit rendre `odoo:assets --check`
rouge sans que le test ne touche le fichier de travail réel.

## 3. Démarrer une installation propre

```bash
npm run odoo:qa:up
npm run odoo:qa:install
npm run odoo:qa:smoke
```

Résultat attendu : module `piqueray_ds` installé sur l'image exacte, aucune erreur JS/XML bloquante,
exactement quatre entrées de snippets (`Presentation`, `Google Reviews`, `Hero`, `Équipe`) et aucun composant interne
posable.

## 4. Qualifier `GoogleReviews` en premier

```bash
npm run odoo:qa:google-reviews
```

Le scénario automatisé et ses gestes guidés doivent couvrir :

1. insérer deux sections Google Reviews;
2. vérifier les cinq avis du sample initial;
3. exercer les états 0, 1, 5 et 6 avis;
4. ajouter, cibler, modifier, monter/descendre et supprimer une carte;
5. modifier tous les champs contrôlés d'une carte sans toucher sa voisine;
6. tester séparément les quatre combinaisons photo/initiale;
7. remplacer l'avatar par le média Odoo, renseigner `alt`, sauver et rouvrir;
8. inventorier le panneau : uniquement les contrôles Piqueray attendus;
9. vérifier que la racine est manipulable seulement selon `rootActions` et que ses descendants
   structurels restent verrouillés;
10. sauver, fermer, rouvrir l'éditeur, puis observer la page publique sans session.

Le picker image ne doit laisser disponibles que les capacités déclarées (`remplacer` et `alt`);
crop, filtres, lien, tooltip, dimensions et format restent absents si non déclarés.

## 5. Qualifier `Presentation`

```bash
npm run odoo:qa:presentation
```

Le scénario insère deux Présentations, applique contenus et CTA opposés, puis vérifie isolation,
panneau, textes simples, rich-text gras uniquement, save/reopen et rendu public. La preuve ne peut
pas être reprise telle quelle de 018 : elle est refaite dans le module produit sur base propre.

## 6. Qualifier `Hero`

```bash
npx tsx integrations/odoo/qa/scenarios/hero.spec.mts
```

Le scénario insère deux Hero sans image embarquée, exerce les textes, le CTA, le remplacement média
natif et le `alt`, puis contrôle isolation, save/reopen et public. Le média temporaire appartient au
cycle de sauvegarde Odoo et doit devenir une URL locale `/web/image/...`; les sources externes,
exécutables ou data arbitraires sont refusées. À 1728 et 1440 px, le fond remplit la section sans
overflow et le CTA conserve son comportement hug/nowrap.

## 7. Vérifier sécurité et compatibilité

Avant cette étape, qualifier Équipe :

```bash
npx tsx integrations/odoo/qa/scenarios/equipe.spec.mts
```

Le scénario couvre deux instances, les cardinalités 0/1/16/17, l’édition nom/poste, le portrait
Odoo avec alt, save/reopen/public et la grille quatre colonnes sans overflow à 1728/1440.

```bash
npm run odoo:qa:security
npm run odoo:qa:compat
npm run odoo:qa:versions
```

Attendus :

- un utilisateur public ne peut pas éditer;
- scripts, handlers, URL exécutables, tags/styles/classes non autorisés et formats collés sont
  refusés ou neutralisés sur le public;
- tout import interne Odoo nécessaire est présent sur l'image épinglée;
- les sélecteurs/options natives non déclarés restent exclus;
- une politique d'authoring plus récente est réappliquée à la réouverture;
- un digest structurel ancien est signalé, jamais prétendument migré.

## 8. Installation, mise à jour et persistance

```bash
npm run odoo:qa:update
```

Le test part d'une base contenant les quatre sections remplies, met à jour l'addon, puis contrôle la
lisibilité, le contenu, les métadonnées de version et le public. Il distingue explicitement ce que
`-u` met à jour (assets/politique/templates futurs) de ce qu'il ne réécrit pas (HTML déjà posé).

## 9. Comparaison visuelle

```bash
npm run odoo:qa:visual
```

Pour chacune des quatre racines, la référence HTML et Odoo utilisent le même snapshot, contenu,
viewport, fontes, état et clip. Le reçu fournit les deux PNG, le diff et le JSON de mesure. La cible
est `0.0000 %`; tout résidu est chiffré et accepté explicitement. Un smoke séparé vérifie la vraie
page Odoo, sans confondre son chrome avec le clip strict du composant.

## 10. Contrôles nommés et sweep final

Après l'ajout des nouveaux cas de 019, exécuter le sweep du dépôt avant clôture. **Il n'existe pas de
filtre par cas** : `npm run eval` est câblé sur `tsx evals/run.ts` et ne lit aucun argument de
sélection, la suite se joue donc en entier. Les trois cas de 019 —
`odoo-production-generated-output`, `odoo-authoring-coverage-refusal` et
`odoo-production-version-drift` — se vérifient dans le `N/N` imprimé et dans `evals/results.json`.
Les contrôles ciblés existants (`npm run emitters:check`, `npm run mint:check`, …) ne couvrent pas
ces cas.

```bash
npm run build
npm run parity
npm run eval
npm run plugin:check
npx tsx scripts/deterministic-roundtrip.mjs
node scripts/core-browser-check.mjs
npx tsc --noEmit
npx tsc -p tsconfig.build.json
```

Le plan n'a relancé aucun `/eval`; ces commandes appartiennent à la qualification de
l'implémentation. Le harness d'eval doit copier `integrations/` dans son scratch avant d'activer les
nouveaux cas.

## 11. Reçu de sortie

La clôture exige :

- un `qualification-manifest.json` conforme à son schéma;
- tous les scénarios obligatoires en `pass` (jamais `skipped` compté comme succès);
- `derivation-report.json` propre et déterministe;
- les limites acceptées, comportements hors contrat et mécanismes non exercés séparés;
- une table d'affectation des mécanismes prouvés vers 021, 022 et 025.

Arrêter la qualification si 020 modifie une entrée épinglée : repinner, reconstruire et rejouer les
scénarios affectés avant de reprendre.
