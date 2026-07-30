# Implementation Plan: Auditer la fidélité des organismes

**Branch**: `013-auditer-fidelite-organismes` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-auditer-fidelite-organismes/spec.md`

## Summary

Auditer exactement les douze organismes déjà générés dans trois vagues ordonnées et
produire, pour chacun, une chaîne inspectable `fait Figma → JSON Pointer du contrat →
fait généré → preuve → verdict`. L'implémentation réutilise le moteur de campagne
visuelle probante livré par 011, le généralise de façon additive pour accepter un
périmètre déclaré au lieu de ses sept sujets historiques codés en dur, puis ajoute une
couche d'audit d'organismes qui orchestre les vagues, les dépendances, les catégories de
faits et les cinq verdicts métier.

Figma reste une référence versionnée et strictement en lecture seule. Les audits
003/005/007 satisfont l'étape de propreté historique mais ne remplacent pas la preuve
actuelle. Les dossiers 013 contiennent les captures Figma et générées, diff, triptyque,
métadonnées, traces contractuelles et conclusion. `Equipe`, `Formulaire` et `Header`
reçoivent immédiatement un dossier bloqué si les reçus frais de `MemberCard`, `Field` et
`NavItem` ne sont pas positifs et probants ; les derniers reçus retenus les donnent
respectivement `blocked`, `blocked` et `fail` (vocabulaire brut v1, que le gate mappe
normativement — `fail→divergent`, seul un `pass` probant devient `proved`).

Une divergence locale peut être corrigée uniquement depuis sa source autorisée, avec
fixture avant changement générique, régénération et nouvel audit. Toute conversion d'une
valeur en dur inventoriée ou correction globale de tokens est consignée comme travail
reporté et ne
peut jamais fabriquer un verdict positif.

## Technical Context

**Language/Version**: TypeScript 6.x, Node.js ≥20, ESM exécuté via `tsx`
**Primary Dependencies**: React 19, Zod 4 (`@ds-contracts/schema`), `playwright-core`
1.61, `pixelmatch` 7, `pngjs` 7, API REST Figma en HTTP GET uniquement
**Storage**: contrats JSON versionnés ; campagne d'audit JSON ; reçus Figma et
dépendances hashés ; fixtures image PNG/JPEG test-only ; résultats JSON, rapports
Markdown, diffs et triptyques sous `specs/013-*/proofs/`
**Testing**: fixtures adversariales enregistrées dans `evals/run.ts`, validation de
campagne, campagne visuelle par vague, cohérence résultat↔rapport, `npm run parity` et
sweep constitutionnel complet
**Target Platform**: CLI Node ; composants React/Storybook générés ; moteur `core/`
browser-pur ; fichier Figma Piqueray consulté en lecture seule
**Project Type**: générateur contract-driven avec instrument CLI d'audit et de preuve
**Performance Goals**: sorties déterministes à entrées identiques ; 12/12 dossiers et
verdicts ; couverture exacte de tous les faits obligatoires ; synthèse navigable en moins
de 10 minutes
**Constraints**: ordre strict des trois vagues ; verdict positif = conjonction de toutes
les preuves obligatoires ; référence Figma immuable ; zéro push/writeback ; aucune
édition directe de sortie générée ; aucun faux vert par masque, moyenne, baseline ou
limite ; zéro conversion d'une valeur en dur inventoriée ; zéro correction globale de
tokens
**Scale/Scope**: 12 organismes (`Coordonnees`, `Devis`, `Hero`, `Presentation`, `SAV`,
`TexteSEO`, `FAQ`, `Footer`, `Reassurances`, `Equipe`, `Formulaire`, `Header`), 3
dépendances de clôture (`MemberCard`, `Field`, `NavItem`), leurs contrats et sorties
générées, plus les mécanismes génériques de campagne/rapport nécessaires ; le nombre de
cas et de faits est dérivé du census Figma piné et des contrats, jamais recopié comme
constante documentaire

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` (v1.2.0).

- [x] **I. Determinism (NON-NEGOTIABLE)** — La campagne, les références, les hashes,
      l'agrégation des faits et les verdicts sont des entrées et calculs déterministes.
      Aucun modèle n'intervient dans le chemin contrat→surface ou dans le verdict.
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — Toute généralisation du format de campagne,
      du gate, du rapport ou d'un émetteur commence par une fixture adversariale rouge,
      est enregistrée dans `npm run eval`, puis seulement revendiquée.
- [x] **III. Contract is the SSoT** — La chaîne passe par le contrat gouvernant et cite
      ses JSON Pointers. Figma et le code ne se synchronisent jamais latéralement ; une
      correction de fidélité est promue dans la source autorisée puis régénérée.
- [x] **IV. No hand-edited output** — `src/components/`, `figma-sync/`, `catalog/`,
      `core/samples/` et `contracts/contract.schema.json` restent générés. Les captures et
      rapports sont des preuves, jamais des correctifs de surface.
- [x] **V. Honesty** — Chaque fait reçoit `proved`, `divergent`, `limited` ou
      `not-proven`; chaque organisme reçoit `proved`, `divergent`, `limited`,
      `not-proven` ou `blocked`. Toute donnée absente ou non probante reste rouge/bloquée.
- [x] **VI. Additive evolution** — Le support d'un périmètre de campagne déclaré est
      optionnel et conserve le comportement v1 des sept sujets 011. Le modèle d'audit est
      une nouvelle interface versionnée. Toute évolution éventuelle du schéma public des
      contrats reste optionnelle, documentée et versionnée selon semver.
- [x] **VII. Engine integrity** — Le chantier vise d'abord `extract/`, hors graphe
      browser-pur. Si un défaut d'émetteur `core/` est établi, sa correction reçoit une
      fixture et, s'il est live-only, une extension du mock avant de passer au vert.
- [x] **VIII. Source cleanliness** — Les audits 003/005/007 et leur carte de réutilisation
      010 sont cités comme Step 0. Le census courant relit les masters et usages par
      position ; une nouvelle saleté bloque le fait puisque 013 n'autorise aucune mutation.
- [x] **IX. Docs-first** — Les handoffs architecture/outillage/statut/gates, les docs
      contrat/génération/parité, `STYLE-FIDELITY`, `FIGMA-CAPABILITY-MATRIX` et les
      artefacts 003/005/007/010/011/012 ont été consultés avant le design. Le connecteur
      auggie n'est pas exposé dans cette session ; les sources autoritatives ont été lues
      directement depuis le dépôt et cette dégradation est nommée.
- [x] **X. Before-capture** — N/A : Figma est strictement en lecture seule ; les captures
      sont des GET et aucune référence n'est remplacée.
- [x] **XI. Multi-writer bridge** — N/A : aucun writer Figma n'existe dans 013. La
      parallélisation éventuelle concerne uniquement des lectures ou zones de fichiers
      disjointes.

**All gates green:**

~~~bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
~~~

**Dérogation F1 actée (owner, 2026-07-30)** : 013 s'exécute dans le **checkout primaire**
`/Users/dlstudio/.superset/projects/ds-contract`, pas dans un worktree dédié —
`git worktree list` n'en montre aucun. Le MUST de la doctrine F1 (autonomie avant
implémentation) est satisfait ICI : `npm install` puis
`npx playwright install chromium` dans ce checkout, où tourne le sweep complet à chaque
checkpoint et en clôture (cf. tasks.md T001). Contrepartie assumée : aucune isolation —
les régénérations `npm run build` touchent la seule copie du dépôt, et consulter `main`
exige un stash ou un commit.
La clôture ajoute `npm run emitters:check`, `npm run catalog &&
npm run verify:catalog`, `npm run images:selftest` et la campagne 013. Le compte
`N/N` vivant de `npm run eval` est l'unique autorité.

### Post-design re-check

Les interfaces Phase 1 conservent les onze principes : un manifeste déclaratif pilote
une lecture Figma pinée ; les faits et dépendances ont une provenance/hash et les reçus
de dépendance v1 sont traduits par un mappage normatif fail-closed (jamais un `proved`
littéral exigé d'un format qui ne le contient pas) ; les sorties
de preuve sont bornées au dossier 013 ; les verdicts sont fail-closed ; les anciens
documents v1 restent compatibles ; les valeurs en dur inventoriées et les fondations
de tokens sont protégées par un reçu de non-conversion et un registre de travaux
reportés. Aucun writer canvas ni exception constitutionnelle n'est introduit.

## Project Structure

### Documentation (this feature)

~~~text
specs/013-auditer-fidelite-organismes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── audit-campaign.interface.md
│   ├── audit-result.interface.md
│   └── campaign-report.interface.md
├── proofs/                              # créé par l'implémentation
│   ├── baseline/
│   ├── dependencies/
│   ├── organisms/
│   │   └── <organism-id>/
│   │       ├── result.json
│   │       ├── REPORT.md
│   │       └── cases/<case-id>/
│   ├── deferred/
│   └── closure/
└── tasks.md                             # Phase 2, créé par /speckit.tasks
~~~

### Source Code (repository root)

~~~text
contracts/
├── coordonnees.contract.json
├── devis.contract.json
├── hero.contract.json
├── presentation.contract.json
├── sav.contract.json
├── texte-seo.contract.json
├── faq.contract.json
├── footer.contract.json
├── reassurances.contract.json
├── equipe.contract.json
├── formulaire.contract.json
├── header.contract.json
├── member-card.contract.json            # reçu de dépendance seulement
├── field.contract.json                  # reçu de dépendance seulement
└── nav-item.contract.json               # reçu de dépendance seulement

extract/figma/visual-parity/
├── campaign.ts                          # périmètre déclaré optionnel, compat v1
├── evidence.ts
├── gate.ts
├── render.ts
├── run.ts
└── fixture-assets/

extract/figma/organism-audit/
├── campaign.ts                          # vagues, sujets et politiques de périmètre
├── dependencies.ts                      # validation/fraîcheur + mappage normatif v1→013
├── facts.ts                             # chaîne Figma→contrat→généré
├── render-react.ts                      # harness de capture du React généré (D4)
├── verdict.ts                           # algèbre fail-closed
├── report.ts                            # résultat machine → rapport humain
└── run.ts                               # CLI et bornage des sorties

evals/
├── run.ts
└── fixtures/                            # campagne, dépendances, verdicts, rapport, périmètre

src/components/                          # GÉNÉRÉ, jamais édité
figma-sync/                              # GÉNÉRÉ localement, jamais exécuté dans Figma
catalog/                                 # GÉNÉRÉ
core/samples/                            # GÉNÉRÉ
~~~

**Structure Decision**: Réutiliser les mesures et receipts génériques de
`extract/figma/visual-parity/` et ajouter une couche d'orchestration étroite plutôt que
dupliquer le comparateur. Le format historique v1 continue à accepter exactement ses
sept sujets quand aucun périmètre explicite n'est fourni ; 013 fournit son périmètre,
ses vagues et ses dépendances. Le résultat JSON reste l'autorité et le Markdown est
généré depuis lui, ce qui permet de tester leur cohérence.

## Complexity Tracking

Aucune violation constitutionnelle à justifier.
