# Implementation Plan: Réparer la convergence des dernières molécules

**Branch**: 011-fix-molecule-convergence | **Date**: 2026-07-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from /specs/011-fix-molecule-convergence/spec.md

## Summary

Réparer Carte, Field, MemberCard, NavItem, ProductCard, Realisation et Tab depuis les
sources autorisées uniquement, puis produire une campagne de preuve exhaustive et
reproductible contre une version Figma immuable. Le chantier part du checkpoint historique
45e2a7d5a950e3d6ccc2a0dd62982b7c288210c5 sans y restaurer le dépôt : le commit WIP partagé
29d70187cdb7c7e45ca3bbc4f2d75da64bcd31b5 est la baseline de travail à préserver, et le
delta 011 est attribué séparément.

L'approche est contract-first : promouvoir les faits Figma manquants dans les contrats,
ajouter uniquement le vocabulaire additif et les corrections génériques prouvés par des
fixtures indépendantes, puis régénérer toutes les sorties. Le comparateur visuel reçoit un
contrat de campagne propre à 011 qui exige la couverture exacte, une référence Figma
concrète par cas, des images de test issues de Figma en lecture seule et hashées, une
pré-vérification de visibilité, une mesure géométrique séparée, un score probant par cas
et un triptyque pour chaque ligne. Le masque texte reste diagnostique et ne peut jamais
faire passer un cas.

Avant toute clôture, les evals hérités contaminés par le drift
Primitives/border-width/1 sont résolus sans mutation Figma, les sorties finales sont
régénérées, puis la campagne 011 complète est rejouée. Le rapport, l'attribution et les
receipts de gates sont produits dans une séquence terminale qui exclut uniquement ses
propres fichiers auto-référentiels du hash de provenance.

## Technical Context

**Language/Version**: TypeScript 6.x, Node.js ≥20, ESM exécuté via tsx  
**Primary Dependencies**: Zod 4 (@ds-contracts/schema), React 19, CSS Modules,
playwright-core 1.61, pixelmatch 7, pngjs 7, API REST Figma en HTTP GET uniquement  
**Storage**: contrats et manifestes JSON versionnés ; tokens DTCG JSON ; fixtures image
PNG/JPEG hashées ; rapports Markdown/JSON et triptyques PNG sous specs/011-*/proofs/  
**Testing**: evals/run.ts, fixtures adversariales visuelles, récupération du baseline
Primitives/border-width/1, images:selftest, campagne visuelle 011, parity quatre axes,
plugin check, round-trip déterministe, browser-purity, TypeScript root/build  
**Target Platform**: CLI Node, moteur core/ browser-pur, composants React générés,
scripts Figma générés mais jamais exécutés dans ce chantier  
**Project Type**: générateur contract-driven + instrument de comparaison visuelle  
**Performance Goals**: sorties byte-identiques sur deux régénérations ; 7/7 molécules
validées ; 100 % des cas obligatoires probants ; chaque score décisif ≤2,5 % ; rapport
de clôture lisible en moins de 10 minutes  
**Constraints**: Figma strictement immuable ; zéro push/writeback ; aucune édition directe
de src/components/, figma-sync/, catalog/, core/samples/ ou du schéma JSON généré ;
aucune moyenne ou baseline ne peut accorder l'acceptation ; aucune image de preuve comme
défaut runtime ; aucune mutation/reconstruction globale du WIP  
**Scale/Scope**: exactement 7 molécules cibles ; l'inventaire strict connu comprend
12 cas Field, 4 NavItem, 8 ProductCard, 16 MemberCard, 27 Realisation, 26 images Carte
dans 36 occurrences, et 2 Tab, sous réserve de déduplication explicite par faits
identiques ; 4 fixtures image WIP à matérialiser/vérifier et l'inventaire restant à
pinner ; résolution documentée des evals baseline-parity-clean,
baseline-acknowledges-without-failing, promotion-converges et
detect-icon-registry-divergence ; régression des composants affectés par tout mécanisme
générique

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from .specify/memory/constitution.md (v1.2.0).

- [x] **I. Determinism (NON-NEGOTIABLE)** — Le contrat de campagne, les contrats de
      composants, les fixtures hashées et les émetteurs sont déterministes. L'IA ne
      participe jamais au chemin contrat→surface ni au calcul du verdict.
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — Toute évolution générique commence par une
      fixture indépendante rouge, devient un éval vert, puis seulement une revendication.
      Les trois fixtures WIP existantes (faux vert masqué, ancrage racine, encre
      transparente) restent attribuées au WIP et sont complétées pour les nouveaux défauts.
- [x] **III. Contract is the SSoT** — Les faits visuels, structurels et sémantiques sont
      promus dans contracts/*.contract.json ; aucune surface ne corrige une autre surface.
      npm run parity doit être propre à la clôture.
- [x] **IV. No hand-edited output** — Les composants, styles, stories, catalogues,
      échantillons et scripts Figma sont régénérés. Les éventuels orphelins générés sont
      supprimés explicitement après vérification de leur provenance, jamais retouchés.
- [x] **V. Honesty** — Un cas manquant, invisible, vide, refusé, non rendu, sans image ou
      sans justification géométrique fait échouer la campagne. Une cause de triage explique
      un échec mais ne le transforme pas en réussite.
- [x] **VI. Additive evolution** — Le schéma ne reçoit que des champs optionnels. Chaque
      contrat affecté suit semver ; tout changement de forme de prop (par exemple texte
      plat → texte riche) est majeur. docs/02-contract-spec.md est mis à jour si le
      vocabulaire public du schéma évolue.
- [x] **VII. Engine integrity** — core/ reste browser-pur. Toute correction d'émetteur
      générique est protégée par une fixture ; tout défaut visible uniquement sur canvas
      exige aussi une amélioration du mock.
- [x] **VIII. Source cleanliness** — Les audits 003/005/007 déjà réalisés sont réutilisés
      pour les sept cibles. Si la relecture immuable révèle une nouvelle saleté de source,
      011 s'arrête sur ce cas au lieu de la modéliser ou de muter Figma.
- [x] **IX. Docs-first** — Les handoffs architecture/outillage/statut/gates, la matrice de
      capacités Figma, les docs contrat/génération/parité/validation/honnêteté et les
      artefacts 003/010 ont été consultés avant les décisions. Le connecteur auggie n'étant
      pas exposé dans cette session, les mêmes sources autoritatives ont été lues directement
      depuis le dépôt.
- [x] **X. Before-capture** — N/A : FR-002/003 interdisent toute mutation du canvas.
      Les captures et exports sont des GET en lecture seule.
- [x] **XI. Multi-writer bridge** — N/A : aucun writer Figma n'est autorisé.

**All gates green:**

~~~bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
~~~

Le worktree doit d'abord être autonome avec npm install et npx playwright install chromium.
La clôture ajoute npm run emitters:check, npm run catalog && npm run verify:catalog,
npm run images:selftest et la campagne visuelle 011 complète. Les échecs eval
hérités de 010 — baseline-parity-clean, baseline-acknowledges-without-failing,
promotion-converges et detect-icon-registry-divergence — partagent le drift
Primitives/border-width/1. Ils doivent être reproduits, corrigés depuis un reçu Figma GET
et tous repasser au vert ; aucune baseline ou waiver ne les masque.

### Post-design re-check

Le design Phase 1 conserve les onze principes : le manifeste de campagne est une
interface déclarative, les assets de référence sont test-only et hashés, les changements
de schéma prévus sont additifs, et les preuves sont produites sans écriture Figma. Les
aliases de couverture sont déclaratifs et exigent leurs empreintes d'égalité ; la clôture
terminale isole explicitement ses seuls receipts auto-référentiels. Aucune exception
constitutionnelle ni mécanisme de complexité supplémentaire n'est requis.

## Project Structure

### Documentation (this feature)

~~~text
specs/011-fix-molecule-convergence/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── visual-campaign.interface.md
│   ├── evidence-result.interface.md
│   └── traceability-report.interface.md
├── proofs/                              # créé par l'implémentation, pas par /speckit.plan
│   ├── attribution/
│   ├── closure/
│   └── visual/
└── tasks.md                             # Phase 2, créé par /speckit.tasks
~~~

### Source Code (repository root)

~~~text
contracts/
├── carte.contract.json
├── field.contract.json
├── member-card.contract.json
├── member-picture.contract.json         # dépendance affectée seulement si la photo est propagée
├── nav-item.contract.json
├── product-card.contract.json
├── realisation.contract.json
└── tab.contract.json

packages/schema/src/contract-schema.ts    # champs optionnels seulement, si nécessaires
core/
├── emit-react.ts
├── emit-react-inline.ts
├── emit-html.ts
└── emit-figma-script.ts                  # changement générique seulement après fixture

extract/figma/visual-parity/
├── run.ts
├── gate.ts
├── img.ts
├── render.ts
├── subjects.ts
└── fixture-assets/
    ├── manifest.json
    ├── fetch.mjs
    └── *.{png,jpg}                       # preuves test-only, jamais défauts runtime

parity/
└── snapshots/figma-tokens.json           # snapshot de référence actualisé par GET seulement

evals/
├── run.ts
├── fixtures/
└── golden.json

src/components/                           # GÉNÉRÉ, jamais édité
figma-sync/                               # GÉNÉRÉ localement, jamais exécuté sur Figma
catalog/                                  # GÉNÉRÉ
core/samples/                             # GÉNÉRÉ par emitters:check
~~~

**Structure Decision**: Étendre l'outillage existant au lieu de créer un comparateur
jetable. La seule nouvelle interface durable est le contrat de campagne feature-scoped,
consommé par extract/figma/visual-parity/run.ts. Les contrats restent la cause du rendu ;
les assets Figma ne sont que des entrées de test à provenance vérifiable. Toute sortie
générée qui change doit être reproductible depuis ces sources. Le snapshot de tokens est
une référence Figma lue par GET, jamais une écriture vers le canvas.

## Complexity Tracking

Aucune violation constitutionnelle à justifier.
