# Reçu Docs-First — HeroVideo responsive Figma

**Feature :** `028-figma-responsive-hero-video`  
**Lecture terminée :** `2026-08-25`  
**Portée :** setup et fondations de la campagne `run-003`; aucune mutation Figma

## Ordre d'autorité consulté

### 1. Constitution

- `.specify/memory/constitution.md`
  (`sha256:80b45507d38aa407f501c869c7f0148bc29f88deff0c2c2b665a6fe9fccf3802`)

Décisions reprises : déterminisme, fixture → eval → claim, contrat SSoT,
sorties générées non éditables, limites nommées, audit source avant travail,
docs-first, captures complètes avant mutation et une seule zone d'écriture
HeroVideo.

### 2. Workflow mono-composant et documentation Figma

- `docs/internal/component-repair-workflow.md`
  (`sha256:c13104f10023d1cc60d1c0cd3998aecc5c18d5c1c46a5a8a45887a809249c2bc`)
- `.agents/skills/figma-component-repair/SKILL.md`
- `docs/responsive-figma.md`
  (`sha256:327ecc3db6a9052539f0e4f7c42e20a2e3780b21594434bd5c13aa4746385929`)
- `docs/FIGMA-CAPABILITY-MATRIX.md`
  (`sha256:abd4b1119be05b3675bc8734203d0dd74f5e3b5638f147b0cc4ef4dcfe1b41ed`)

Décisions reprises : audit initial strictement read-only; une campagne v2 à une
cible; Pages comme contextes, jamais cibles implicites; Auto Layout pour le
reflow, variants seulement pour une vraie rupture de composition; aucun
breakpoint automatique dans Figma Design; bindings de gap, padding, min-height,
font size et line height inspectés par identité de variable; application live
interdite avant captures before et GO owner.

### 3. Autorité 028

- `specs/028-figma-responsive-hero-video/spec.md`
- `specs/028-figma-responsive-hero-video/plan.md`
- `specs/028-figma-responsive-hero-video/research.md`
- `specs/028-figma-responsive-hero-video/data-model.md`
- `specs/028-figma-responsive-hero-video/quickstart.md`
- `specs/028-figma-responsive-hero-video/contracts/figma-design-decision.md`
- `specs/028-figma-responsive-hero-video/contracts/non-destructive-transition.md`
- `specs/028-figma-responsive-hero-video/contracts/proof-ledger.md`

Ces documents bornent le résultat à Figma, avec trois présentations explicites
`Compact|Desktop|Wide`, Tablet 834 utilisant Compact, Wide historique préservé,
primitives existantes uniquement et typographie locale éventuellement
allowlistée comme `pending-responsive-text-style`. Les quatre gates H1–H4 sont
des arrêts réels. 028 autorise seulement l'évolution générique du runner, de son
transport, de ses modèles, fixtures, evals et docs internes; contrat, tokens
globaux, HTML, code produit, Odoo, Pages et enfants partagés restent hors scope.

### 4. Historique 027 consulté comme contexte seulement

- `specs/027-responsive-hero-video/inventory/H1-fresh-audit.json`
- `specs/027-responsive-hero-video/inventory/H1-baseline-delta.md`
- `specs/027-responsive-hero-video/decisions/H1-baseline.json`
- `specs/027-responsive-hero-video/proofs/audit.json`
- `specs/027-responsive-hero-video/proofs/H1-before.manifest.json`
- `specs/027-responsive-hero-video/inventory/H2-option-packet.md`
- `specs/027-responsive-hero-video/decisions/H2-responsive.json`

Faits historiques réutilisables : master `2151:5552`, key
`36011e51b8bc0b221a1ba6f9108709b5bd1c4490`, Container `2448:4731`, usage Home
`2170:6351`, contexte Header `210:473`, Wide 1728×720 et direction H2
`centre-immersif`. Les pins, captures et valeurs de preview de 027 ne remplacent
jamais l'audit frais ni H2 de 028.

## Résolution des conflits documentaires

- Le plan 027 est `Superseded`; ses travaux contrat/web/Odoo ne sont pas
  exécutables dans 028.
- La disposition 027 qui exigeait une correction CTA avant une écriture
  responsive est supersédée par la clarification owner de 028. Le CTA Home,
  le Button partagé, le Header et tous les enfants restent strictement
  read-only, non corrigés, non reconfigurés et non bloquants.
- Les valeurs `{space.24}`, `{space.48}` et 44/48 de l'ancien harness sont des
  previews historiques. Seuls un inventaire frais de primitives et une décision
  H2 de 028 pourront autoriser des bindings ou overrides locaux.
- L'ancien `run-002` est un brouillon obsolète. `run-003` doit être neuf et ne
  doit reprendre aucune preuve d'exécution de `run-002`.

## Questions de capacité résolues

| Question | Réponse gouvernée |
|---|---|
| Le resize Figma choisit-il un variant ? | Non; chaque présentation est sélectionnée explicitement. |
| Une valeur brute ou une nouvelle primitive est-elle permise ? | Non; absence de primitive compatible = arrêt. |
| Wide peut-il être reconstruit ? | Non; le nœud historique et sa key doivent rester exploitables. |
| Une Page ou un enfant partagé peut-il être écrit ? | Non; refus explicite et `pageWrites=[]`. |
| Les créations set/Compact/Desktop peuvent-elles rester implicites ? | Non; elles doivent être allowlistées, comptées et receipted. |
| Peut-on appliquer avec la capacité actuelle non qualifiée ? | Non; fixtures rouges, evals vertes et spike no-op sont obligatoires avant H3. |

## Conclusion

Le setup et les fondations peuvent être écrits dans Git. Aucun audit Figma live,
frame de travail, snapshot source, apply ou Page write n'est autorisé par ce reçu.
