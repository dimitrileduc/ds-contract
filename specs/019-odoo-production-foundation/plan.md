# Implementation Plan: Fondation Odoo de production

**Branch**: `019-odoo-production-foundation` | **Date**: 2026-08-07 | **Spec**:
[`spec.md`](spec.md)  
**Input**: Feature specification from `specs/019-odoo-production-foundation/spec.md`

## Summary

Construire un addon Odoo 19 de production neuf couvrant les deux sections posables
`ds.presentation` et `ds.google-reviews`, avec leurs trois dépendances internes. Les décisions
d'authoring sont exhaustives et versionnées par prop et par occurrence de part imbriquée. Les
tokens, styles contractuels, fontes et assets sont générés et inviolables; QWeb et la mécanique
d'éditeur restent des adaptateurs Odoo manuels en 019, isolés et mesurés automatiquement pour
alimenter le builder 025.

Le premier spike porte sur `GoogleReviews`, pas sur le cas déjà monté `Presentation` : liste vide et
N éléments, ajout/suppression/réordre, ciblage d'une carte, image + alt, rich-text limité, deux
instances et persistance complète. Un **second spike** lui est de rang égal et traverse les deux
sections : reproduire dans l'addon de production la fermeture/réouverture sélective mesurée 7/7 en
018, puis fermer le trou structurel resté ouvert (`Drag and move`, `Duplicate`, `Remove` sur les
descendants). FR-009 et FR-010 reposent donc sur un précédent réel, mais ne sont prouvés pour 019
qu'après un nouveau reçu concluant. Détail historique : `proofs/correction-premisse-018.md`.

**État exécuté au 2026-08-08** : le reçu de fondation est concluant (44/44, aucun saut/échec).
Il qualifie les mécanismes communs et l'inventaire du banc hostile ; GoogleReviews et Presentation
doivent encore produire leurs reçus de section en Phases 3 et 4 avant tout claim de livraison.

Le module n'est qualifié qu'après installation propre, mise à
jour avec contenu, save/reopen/public, sécurité, inventaire exhaustif des options, version drift et
diff pixel des deux sections.

## Technical Context

**Language/Version**: TypeScript 6 / Node.js ≥ 20 (validation, génération et QA); JavaScript Odoo
19 modules, OWL/XML, QWeb XML et CSS (addon); manifeste Python Odoo 19  
**Primary Dependencies**: core existant `emitHtml`, `@ds-contracts/schema`/Zod 4, loader
`extract/fidelity-matrix`, Playwright, `pixelmatch`, `pngjs`, Odoo Website/HTML Builder 19,
PostgreSQL 15, Docker Compose  
**Storage**: contrats/tokens/configs/locks/rapports JSON dans Git; assets générés dans l'addon;
architecture de page sauvegardée par Odoo dans `ir.ui.view`  
**Testing**: contrôles TypeScript ciblés et nouveaux cas eval, checks XML/static, installation/update
Docker, gestes Playwright dans éditeur et public, tests de sanitization, scanner de versions,
comparaison PNG stricte  
**Target Platform**: Odoo Website 19 épinglé sur `odoo:19.0-20260803`, Chromium de qualification,
Linux conteneurisé  
**Project Type**: intégration/addon Odoo avec outillage déterministe au niveau du monorepo  
**Performance Goals**: génération et rapport identiques à l'octet ×2; 0,0000 % de pixel diff cible;
≥ 95 % des éditions texte/booléen/ordre visibles en moins de 1 s hors réseau/média  
**Constraints**: 5 jours pour la totalité de la roadmap; 019 J1–J2 en parallèle de l'audit 020;
aucune modification des contrats/Figma; aucune retouche d'une sortie générée; options non déclarées
absentes; structure sauvegardée non migrée implicitement; API Odoo interne isolée et sentinellée;
pas de carousel/hover/comportement hors contrat  
**Scale/Scope**: 2 sections racines, 5 contrats, 30 props, 61 parts locales, 91 verdicts de base,
12 parts conditionnelles, 4 références de composant, 1 repeat ordonné, 1 branche média, 2 instances
concurrentes de chaque racine dans la qualification

## Constitution Check

*GATE initial puis recontrôlé après le design de Phase 1. Toute exception est consignée dans
Complexity Tracking.*

- [x] **I. Determinism (NON-NEGOTIABLE)** — L'agent n'est jamais dans le chemin
  contrat→sorties. Les assets et rapports sont produits par scripts purs, sans timestamp/chemin
  absolu, régénérés par `npm run build` et comparés à l'octet ×2.
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — Les cas nommés
  `odoo-production-generated-output`, `odoo-authoring-coverage-refusal` et
  `odoo-production-version-drift` sont créés avant les claims. Les preuves éditeur ont également un
  `scenarioId` stable. Aucun `/eval` n'a été relancé pendant la planification, conformément à la
  demande de l'owner.
  **Écart nommé, que ce plan ne résout pas** : FR-024 exige un contrôle nommé pour huit familles, et
  seules trois sont représentables dans `npm run eval`, qui doit rester hermétique et sans réseau.
  Les cinq autres — isolation de deux blocs, gestes d'édition, save/reopen, rendu public, comparaison
  visuelle — exigent une instance Odoo et un Chromium, et vivent dans la QA sous `scenarioId` et reçu
  daté. Tant que l'owner n'a pas tranché entre « les porter dans la suite » et « les nommer comme
  limite », aucun claim portant sur ces cinq familles ne peut s'appuyer sur la formule « couvert par
  les evals » : le reçu de qualification en est la seule preuve, et le rapport de clôture le dit.
- [x] **III. Contract is the SSoT** — Les cinq contrats sont lus à leurs chemins canoniques et
  épinglés par version + hash; aucun n'est copié ou modifié. L'HTML sert de référence rendue, jamais
  de nouvelle SSoT.
- [x] **IV. No hand-edited output** — Tokens/CSS/fontes/assets Odoo vivent sous `generated/`,
  portent `DO NOT EDIT` et sont comparés à la régénération. QWeb/JS/bridge sont explicitement des
  sources manuelles classées, pas des sorties déguisées.
- [x] **V. Honesty** — Un skip, une limite, un mécanisme interne Odoo, un écart pixel ou une
  capacité hors contrat reçoit un code et n'est jamais agrégé comme succès.
- [x] **VI. Additive evolution** — 019 ne change ni schéma ni contrat existant. Les nouveaux
  formats d'intégration sont versionnés `1.0.0`; leur évolution suivra semver et restera additive.
- [x] **VII. Engine integrity** — `core/` n'est pas modifié. Le build Odoo orchestre le core
  browser-pure depuis `scripts/odoo/`; les gestes live nouveaux ont des contrôles headless associés.
- [x] **VIII. Source cleanliness** — N/A : 019 ne lit ni ne modifie le canvas Figma. Les deux
  racines sont les références déclarées propres; toute correction amont appartient à 020 et
  déclenche un repin explicite.
- [x] **IX. Docs-first** — Les documents versionnés `docs/` et `docs/handoff/` ont été consultés
  avant le design. L'accès a été direct dans le worktree, car le MCP auggie n'est pas disponible
  dans cette session; cette exception d'outil est consignée ci-dessous.
- [x] **X. Before-capture** — N/A : aucune mutation de canvas Figma.
- [x] **XI. Multi-writer bridge** — N/A : aucune écriture de canvas; 020 reste une feature
  parallèle distincte et ne peut modifier une entrée épinglée sans signal de croisement.

**Gate post-design**: PASS avec une exception opérationnelle documentée sur le moyen d'accès aux
docs. Aucun `NEEDS CLARIFICATION` et aucune violation d'architecture non justifiée ne subsistent.

Le sweep constitutionnel complet reste la porte de clôture de l'implémentation, après les cas eval
de 019 :

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Il s'exécute dans ce worktree après installation de ses dépendances et de Chromium.

## Project Structure

### Documentation (this feature)

```text
specs/019-odoo-production-foundation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── adaptation-registry.schema.json
│   ├── authoring-config.schema.json
│   ├── derivation-report.schema.json
│   ├── input-snapshot.schema.json
│   └── qualification-manifest.schema.json
├── checklists/
│   └── requirements.md
└── proofs/                         # reçus datés créés par l'implémentation
```

### Source Code (repository root)

```text
integrations/odoo/
├── config/
│   ├── inputs.lock.json
│   ├── presentation.authoring.json
│   ├── google-reviews.authoring.json
│   └── adaptation-registry.json
├── addons/piqueray_ds/
│   ├── __init__.py
│   ├── __manifest__.py
│   ├── views/
│   │   ├── components.xml          # cinq templates composés; source manuelle classée
│   │   ├── snippets.xml            # deux inscriptions seulement
│   │   └── harness.xml
│   └── static/src/
│       ├── css/
│       │   ├── generated/
│       │   │   ├── tokens.pqr.css
│       │   │   ├── components.pqr.css
│       │   │   └── fonts.pqr.css
│       │   └── odoo-bridge.css
│       ├── js/
│       │   ├── odoo19_compat.js    # unique frontière avec APIs internes
│       │   ├── authoring.js
│       │   ├── repeat_action.js
│       │   └── version_guard.js
│       ├── xml/
│       │   └── authoring.xml
│       ├── fonts/
│       └── img/
├── qa/
│   ├── compose.yaml
│   ├── fixtures/
│   ├── scenarios/
│   └── visual/
└── derivation-report.json          # sortie générée

scripts/odoo/
├── build-assets.ts
├── check-inputs.ts
├── check-authoring.ts
├── build-derivation-report.ts
├── check-module.ts
├── scan-saved-versions.ts
└── qualification-manifest.ts

.agents/skills/odoo-component-production/
└── SKILL.md

evals/
├── fixtures/                       # fixtures C1/C2/C3 de 019
└── run.ts                           # enregistrement des cas nommés
```

**Structure Decision**: `integrations/odoo/` possède le produit déployable et sa QA réutilisable;
`scripts/odoo/` possède l'orchestration filesystem → core pur → sorties; la spec conserve les
schémas, décisions de design et reçus de la feature. Aucun fichier produit ne dépend du POC 018.

## Design de la solution

### 1. Snapshot et couverture avant code Odoo

1. Construire `inputs.lock.json` depuis les sources canoniques et leurs hashes.
2. Écrire les deux configs à partir des contrats, pas des `zones/*.json` de 018.
3. Résoudre les chemins complets dans le graphe, y compris le wildcard de chaque `ReviewCard`.
4. Refuser toute décision manquante, dupliquée, ambiguë ou incompatible avec le type de contenu.
5. Figer séparément les actions de racine pour ne pas confondre suppression du bloc et mutation
   d'un descendant.

La config ne choisit pas un sélecteur comme identité : elle porte à la fois l'adresse contractuelle
canonique et le sélecteur DOM attendu. Leur concordance est contrôlée.

### 2. Build d'assets mince et déterministe

`build-assets.ts` charge le dépôt par les loaders existants, appelle `emitHtml()` pour chacune des
deux racines, conserve la CSS de fermeture dependency-first et retire uniquement le chrome de
showcase identifié. Il normalise les références de tokens sous le préfixe Odoo `--pqr-`, copie les
fontes/assets épinglés et sérialise dans un ordre stable.

Le script ne produit ni QWeb, ni options Odoo, ni migrations. `npm run build` l'appelle, tandis que
`odoo:assets --check` compare sans écrire. L'ancienne sortie tokens de 018 n'est pas repointée : la
sortie de production est additive et isolée.

### 3. Frontière de compatibilité Odoo 19

`odoo19_compat.js` concentre les imports et patchs internes : exclusions des options natives,
ressources d'éditabilité, namespace de toolbar, média et hooks nécessaires. Une sentinelle échoue
bruyamment si une classe/ressource attendue disparaît sur l'image épinglée.

Les capacités documentées (`BaseOptionComponent`, selectors, `applyTo`, QWeb `t-call`, bundles) sont
préférées. Les mécanismes internes ne sont employés que lorsque FR-010 exige de retirer une option
native ou de fermer précisément la toolbar; ils sont classés `compatibility` dans le delta manuel.

### 4. Spike prioritaire `GoogleReviews`

Avant le polish, monter une version fonctionnelle sur vraie instance :

- racine `section`, jamais de `section` imbriquée;
- `ReviewCard` via QWeb et DOM réel sauvegardé;
- blueprint QWeb/DOM inerte pour ajouter depuis une liste vide;
- actions locales ajouter/supprimer/monter/descendre intégrées à l'historique Odoo;
- cible par carte, sélecteurs root-scoped et aucune fuite entre deux sections;
- picker média Odoo réutilisé derrière un panneau Piqueray minimal `remplacer + alt`;
- quatre états photo/initiale respectés sans inventer d'exclusivité;
- toolbar Piqueray « gras uniquement » et allowlist dure avant sauvegarde pour bloquer les formats
  introduits par raccourci ou collage;
- `o_no_save` sur les sections/cartes pour retirer « enregistrer comme bloc personnalisé » si cette
  action est interdite par `rootActions`.

Le spike n'est accepté qu'après liste 0/1/5/6, média, deux instances et save/reopen/public. S'il
révèle un besoin non représentable, le vocabulaire de config ou le registre est corrigé avant de
continuer; aucun cas spécial silencieux n'est ajouté.

### 5. Reproduction de `Presentation`

Réimplémenter ensuite dans le module produit ce que 018 a effectivement prouvé : composition
`Presentation → SectionHeader → Button`, trois zones textuelles rouvertes, racine et conteneurs
fermés à l'édition, label simple sans toolbar, CTA ciblé et huit options natives écartées. Le verrou
structurel des descendants n'en fait pas partie : 018 proposait encore déplacement, duplication et
suppression. Il arrive ici avec le résultat du spike structurel de 019. Refaire les preuves sur
installation propre avec deux instances et CTA opposés; ne pas importer les reçus historiques comme
preuve de production.

### 6. Versionnement du HTML sauvegardé

Chaque racine porte :

- `data-ds-contract`;
- `data-ds-contract-version`;
- `data-ds-authoring-version`;
- `data-ds-graph-digest`;
- les marqueurs de compatibilité Odoo `data-vcss`, `data-vxml`, `data-vjs` décidés pour l'addon.

Le scanner classe `current`, `policy-stale`, `structure-stale` ou `unknown`. La politique est
réappliquée à l'ouverture; le scanner ne réécrit jamais l'architecture. Une mise à jour `-u` est
testée sur contenu existant sans prétendre migrer la structure posée.

### 7. Delta manuel calculé

Chaque bloc source manuel est encadré par un ID `ODOO-019-*` et référencé dans
`adaptation-registry.json`. Le rapport recalcule :

- couverture attendue/réelle des décisions;
- hash/état de chaque sortie générée;
- fichiers, blocs, lignes et octets manuels;
- agrégation par `reasonCode` et mécanisme;
- fichiers/blocs/entrées de registre non classés.

Les listes sont triées et les chemins relatifs; aucun timestamp n'entre dans le fichier. Le rapport
est donc une mesure factuelle à réduire en 025, pas une recommandation écrite par l'agent.

### 8. Qualification et ordre d'exécution

L'ordre de travail de 019 est volontairement :

1. **Fondation de connaissance** — schémas, lock, configs, reason codes, skill;
2. **Portes déterministes** — input check, authoring check, asset build/check, rapport;
3. **Risques principaux** — GoogleReviews repeat + média + sécurité sur vraie instance, reproduction
   de la fermeture sélective déjà prouvée en 018, puis fermeture structurelle des descendants qui ne
   l'était pas; si le spike 019 ne tient pas, la limite est nommée avant tout claim FR-009 / FR-010;
4. **Cas connu** — Presentation dans l'addon produit;
5. **Durcissement** — deux instances, panneaux complets, gestes interdits, save/reopen/public,
   install/update, version drift;
6. **Fidélité** — clips stricts des deux racines + smoke page réelle;
7. **Handoff** — manif de qualification, skill corrigé, mécanismes affectés à 021/022/025.

Les changements parallèles de 020 sont surveillés par le lock. Un croisement ne fusionne pas
silencieusement : il déclenche repin et requalification affectée.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Constitution IX demande auggie MCP; outil absent de la session | Les mêmes docs versionnées ont été lues directement avant toute décision et les chemins consultés sont traçables dans `research.md` | Suspendre le plan n'ajouterait aucune information et empêcherait la livraison; ignorer les docs aurait violé le fond de la règle |

Les adaptateurs QWeb/JS manuels et la frontière d'API Odoo interne ne sont pas des violations de
sortie générée : ils sont des sources cible-specific, isolées, testées et comptées. Le générateur
générique qui pourrait les supprimer reste volontairement dans 025 après accumulation des faits.

## Extension d'exécution — `ds.hero` (2026-08-11)

L'extension réutilise la fondation dans son ordre prescrit : snapshot/repin, décisions exhaustives,
spike du média natif, QWeb et options, puis preuves. Elle ajoute `hero.authoring.json`, le template
et l'entrée de snippet Hero, un contrôle média qui laisse Odoo posséder le remplacement/sauvegarde
du nœud, et les scénarios fonctionnel, visuel, isolation combinée et install/update à trois racines.
Le résultat n'ajoute ni émetteur Odoo dans `core/`, ni bitmap de contenu dans l'addon, ni migration
automatique du HTML déjà sauvegardé.

## Extension d'exécution — `ds.equipe` (2026-08-11)

L'extension suit le même ordre : snapshot vert puis repin, authoring exhaustif sur les chemins
Équipe → MemberCard[] → MemberPicture, spike repeat/fermeture, QWeb composé, façade média native,
preuves fonctionnelle et visuelle, isolation combinée 2×4 et install/update à quatre racines. Le
premier spike média a révélé puis fermé la perte `src`/`alt` causée par une réécriture prématurée de
`src`; la pipeline finale laisse `ImageSavePlugin` produire l'URL `/web/image` au save.
