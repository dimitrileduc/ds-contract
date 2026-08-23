# Implementation Plan: Pied de page Piqueray dans Odoo (footer shell)

**Branch**: `023-odoo-footer-shell` (worktree : `jelly-concavenator`) | **Date**: 2026-08-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/023-odoo-footer-shell/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Livrer la **seconde moitié du shell** : le pied de page Piqueray comme **footer système** de
`website.layout` (patron exact du header 022 — gabarit standalone + héritage `active="False"`
activé par la finalisation, re-rendu à chaque requête, jamais sauvegardé en HTML).

**Le plan OUVRE par la gate humaine bloquante** : la table de verdicts d'éditabilité couvrant
100 % des props et parts de `ds.footer` 1.1.0 et `ds.footer-column` 1.1.0 (occurrences imbriquées
comprises) est proposée dans
[contracts/verdicts-editabilite.md](./contracts/verdicts-editabilite.md) — **aucune
implémentation avant validation explicite de l'owner** ; la table validée fait foi. Surface
éditable proposée : les 3 textes de colonnes + le copyright (donnée semée une fois, mécanisme
décidé au spike S2 — candidat `t-field` inline, jamais de DOM sauvegardé/COW), plus 2 réglages
(URLs Facebook/Instagram, candidat champs natifs `website.social_*`, spike S3). Tout le reste est
structure gouvernée, panneaux natifs retirés.

Contrairement à 022, **aucune phase amont** : les 3 contrats nouveaux au lock (`ds.footer` 1.1.0,
`ds.footer-column` 1.1.0, `ds.copyright` 1.0.0) sont consommés **épinglés** — aucun bump, aucun
canal de schéma, aucun geste canvas (Figma lecture seule). `ds.footer` devient la racine shell
n° 2 (`SHELL_CONTRACT_IDS`), la fermeture CSS s'élargit par `npm run odoo:assets`, et trois
spikes mécanisme (S1 zone footer / S2 persistance du texte libre / S3 réglages sociaux) précèdent
toute écriture QWeb (README d'intégration, étape 3). Preuves : mêmes instruments que le header —
sujet visuel `footer.mts` + cinq scénarios (visual, edit, **update de module**, pages,
regen) couvrant SC-001…SC-006.

## Technical Context

**Language/Version**: TypeScript (pin dépôt `typescript@^6`), Node ≥ 20, ESM via `tsx` ; Python 3 / XML QWeb / JavaScript (addon Odoo 19, zones manuelles comptées `ODOO-023-*`)
**Primary Dependencies**: Zod (`@ds-contracts/schema` — **NON modifié**), React 19 + CSS Modules (émetteur `react`, non touché), `core/emit-html.ts` (référence visuelle + source de `components.pqr.css`), Docker + Compose (instance `odoo:19.0-20260803` + `postgres:15` épinglées), `playwright-core` + `extract/image-parity` (instrument visuel réutilisé tel quel), Figma en **LECTURE SEULE** intégrale (référence node 2120:4785 — aucun geste canvas)
**Storage**: JSON/XML sur disque — `integrations/odoo/config/{inputs.lock.json (repin +3), footer.authoring.json (NOUVEAU), adaptation-registry.json (+ODOO-023-*)}`, `integrations/odoo/addons/piqueray_ds/views/footer.xml` (NOUVEAU, manuel compté), semis des contenus (mécanisme décidé au spike S2) + activation (hook/migration), reçus sous `specs/023-odoo-footer-shell/proofs/`
**Testing**: portes constitutionnelles (build, parity, eval, plugin:check, roundtrip ×2, core-browser, tsc ×2) + suite Odoo (`odoo:inputs:check`, `odoo:authoring:check`, `odoo:assets -- --check`, `odoo:module:check`, `odoo:derivation:check`, `odoo:typecheck`, `odoo:visual:selftest -- --strict`) + scénarios QA Playwright sur l'instance jetable
**Target Platform**: addon Odoo 19 Website (`integrations/odoo/addons/piqueray_ds`) servi par l'instance épinglée ; bibliothèque React inchangée
**Project Type**: monorepo contrats→surfaces + intégration cible (addon Odoo de production)
**Performance Goals**: régénération byte-identique (roundtrip ×2, `odoo:assets --check` propre) ; aucune revendication de p95 (limite 019 reprise)
**Constraints**: zéro `node:*` dans `core/` ; **aucun émetteur `odoo` dans `core/`** (réservé spec 025) ; **aucun contrat/token/schéma/émetteur modifié** (⇒ zéro re-pin golden/engine/catalog/polaris) ; contenu rédacteur = donnée, jamais re-semé ni écrasé par update/régénération ; **jamais de DOM sauvegardé (COW) pour un shell** ; responsive mobile hors périmètre (différé nommé)
**Scale/Scope**: 0 contrat modifié, +3 entrées au lock, 1 racine shell ajoutée (`ds.footer`, fermeture + `ds.footer-column` + `ds.copyright`), 1 gabarit QWeb + semis de contenus + liens sociaux, 3 spikes, ~34 verdicts d'authoring, 1 sujet visuel + 5 scénarios QA ; seul re-pin : `inputs.lock.json`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` (v1.2.0). Every item MUST be true, or be
justified in Complexity Tracking below.

- [x] **I. Determinism (NON-NEGOTIABLE)** — Aucun modèle dans la chaîne : schéma, émetteurs et
      contrats **intouchés** ; `odoo:assets` déterministe par construction ; le QWeb est une
      source manuelle comptée, pas une sortie générée. Preuves : roundtrip ×2,
      `odoo:assets --check`.
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — Aucune capacité nouvelle du moteur, aucun canal
      nouveau : pas de nouvel eval exigé ; le `N/N` vivant fait foi. L'éventuelle extension de
      l'enum `mechanism` du schéma d'authoring 019 (`native-settings`/`inline-field`) est
      additive et de configuration, pas une capacité du moteur (précédent : `native-menu`, 022).
- [x] **III. Contract is the SSoT** — Les 5 contrats sont consommés épinglés via
      `inputs.lock.json` (version + SHA-256, repin explicite +3) ; le contenu rédacteur est une
      **donnée** (spike S2), jamais du balisage figé ; `npm run parity` propre exigé — aucun
      geste canvas, le snapshot n'a pas à bouger.
- [x] **IV. No hand-edited output** — `static/src/css/generated/*` uniquement via `odoo:assets`
      (retouche = `tampered`) ; aucun contrat modifié ⇒ `src/components/`, `catalog`, golden,
      engine.receipt inchangés — toute divergence serait une erreur de périmètre, pas un re-pin.
- [x] **V. Honesty** — Limites nommées d'avance (research D12) : responsive mobile différé,
      icônes sociales fixées (URL vide ne retire pas l'icône), titres figés, sémantique
      `<footer>` portée par l'hôte layout, panneau minimal, portes rouges pré-existantes citées
      sans re-diagnostic ; tout verdict de repli (S2) remonte à l'owner avant le QWeb.
- [x] **VI. Additive evolution** — Schéma Zod non modifié ; aucun bump de contrat ; l'éventuel
      ajout d'un `mechanism` à l'enum du schéma d'authoring (config 019) est strictement
      additif ; `docs/02-contract-spec.md` non bumpé.
- [x] **VII. Engine integrity** — `core/` intouché, browser-pur (`core-browser-check`) ; aucune
      classe de bug d'émetteur nouvelle à enseigner au mock (aucune édition d'émetteur).
- [x] **VIII. Source cleanliness** — **N/A (aucun travail de source Figma)** : lecture seule
      intégrale, aucune extraction ni contractualisation nouvelle ; la source du footer
      (master 2120:4785) a été auditée/relevée par le census 013 et la géométrie portée par 015
      — les contrats sont consommés tels quels.
- [x] **IX. Docs-first** — auggie MCP indisponible cette session : repli nommé = lecture directe
      AVANT toute décision (`integrations/odoo/README.md` — frontières + séquence de portage,
      contrats footer/footer-column/copyright, `header.xml` + `header.authoring.json` + lock,
      `repo-data.ts`, artefacts + spike 022, constitution). Recherche préalable : aucun relevé
      existant du mécanisme footer/`t-field`/réglages sociaux dans le dépôt ⇒ spikes S1–S3
      réellement requis (research, préambule).
- [x] **X. Before-capture** — **N/A** : aucune mutation canvas Figma (spec, Out of Scope).
- [x] **XI. Multi-writer bridge** — **N/A** : aucune écriture canvas, mono-agent.

**All gates green:**

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Specs executing in a git worktree run this sweep INSIDE the worktree (Constitution:
Worktree Gates F1) — `npm install` + `npx playwright install chromium` there first.

Suite cible (intégration) : `npm run odoo:inputs:check && npm run odoo:authoring:check &&
npm run odoo:assets -- --check && npm run odoo:module:check && npm run odoo:derivation:check &&
npm run odoo:typecheck && npm run odoo:visual:selftest -- --strict`.

## Project Structure

### Documentation (this feature)

```text
specs/023-odoo-footer-shell/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── verdicts-editabilite.md   # LA GATE HUMAINE — table 100 % props/parts, owner valide AVANT tout
│   └── odoo-projection.md        # interface de la projection (lock, shell, QWeb, donnée, preuves)
├── proofs/              # reçus d'exécution (spikes, visuel, edit, update, pages, regen) — créés en implémentation
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# ── AUCUNE phase amont : contrats, tokens, schéma, émetteurs, evals — INTOUCHÉS ──

# ── Projection Odoo (seule phase) ──────────────────────────────────────────
scripts/odoo/lib/repo-data.ts                    # + 'ds.footer' dans SHELL_CONTRACT_IDS (catégorie 022 existante)
integrations/odoo/config/inputs.lock.json        # repin explicite : +footer 1.1.0, +footer-column 1.1.0, +copyright 1.0.0
integrations/odoo/config/footer.authoring.json   # NOUVEAU — la table de verdicts VALIDÉE, transcrite (schéma 019)
integrations/odoo/config/adaptation-registry.json # +ODOO-023-* (QWeb, semis, liens sociaux, [fond/largeur si mesuré])
integrations/odoo/addons/piqueray_ds/views/footer.xml        # NOUVEAU — footer_bar + héritage layout (actif=False, xpath S1)
integrations/odoo/addons/piqueray_ds/{hooks.py|migrations/…} # activation + semis unique des contenus (S2, idempotent)
integrations/odoo/addons/piqueray_ds/__manifest__.py         # bump version module (migration d'activation)
integrations/odoo/addons/piqueray_ds/static/src/css/generated/*  # régénérés — fermeture élargie (jamais à la main)
integrations/odoo/qa/visual/subjects/footer.mts              # NOUVEAU sujet (clip épinglé du footer)
integrations/odoo/qa/scenarios/footer-visual.mts             # capture du sujet (SC-001, US1)
integrations/odoo/qa/scenarios/footer-edit.spec.mts          # textes autorisés : edit/save/reopen/public (SC-002/003, US2)
integrations/odoo/qa/scenarios/footer-update.spec.mts        # update module après édition → contenu intact (SC-004)
integrations/odoo/qa/scenarios/footer-pages.spec.mts         # footer partout, header + sections intacts (SC-005, FR-008)
integrations/odoo/qa/scenarios/footer-regen.spec.mts         # variation token → requête suivante (SC-006, US3)
```

**Structure Decision**: monorepo existant — tout vit dans `integrations/odoo/` + `scripts/odoo/`
(propriété 019, étendus additivement), aucun nouveau répertoire de premier niveau, aucun fichier
gouverné touché. Le QWeb du footer est une **zone manuelle comptée** (marqueurs `ODOO-023-*`
BEGIN/END + registre), jamais une sortie générée.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Aucune violation. Deux choix méritent d'être nommés sans en être :

| Choix | Pourquoi | Alternative plus simple rejetée parce que |
|---|---|---|
| Contenu éditable en **donnée** rendue par le gabarit système (spike S2), pas en zone éditable COW | FR-004/FR-014 ensemble : l'apparence doit rester re-rendue par projection ET le texte doit survivre à l'update. La copie COW fige l'arch entière — le « HTML mort » de 018 appliqué au shell ; interdite par le commentaire de `SHELL_CONTRACT_IDS` | Laisser Odoo sauvegarder le footer édité (mécanisme natif, zéro code) : rejeté — SC-006 survivrait (classes CSS intactes) mais FR-004 non : toute évolution du gabarit cesserait de se propager |
| Verdicts CTA `fixé par composition` là où 022 disait `not-editable` (research D4, écart nommé) | Exactitude vis-à-vis du contrat : `ds.footer` fige lui-même `variant`/`children`/`iconRight` | Copier 022 à l'identique : acceptable, tranché par l'owner à la gate — aucun mécanisme n'en dépend |
