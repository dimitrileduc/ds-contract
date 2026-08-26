# H1 — Delta du baseline frais

**Source relue :** Figma `d9FYAUcqdcNtsuaMgLefvJ`, version courante
`2391670501431838845`  
**Audit :** `2026-08-25T20:46:26.183Z` par REST, complété à
`2026-08-25T20:49:58.205Z` par un Bridge strictement read-only  
**Historique comparé :** H1/H2 acceptés de 027 et leurs captures versionnées  
**Écritures :** `figmaWrites=[]`, `pageWrites=[]`

## Verdict

`baseline-confirmed/no-responsive-drift`

La version courante est toujours celle du baseline 027 accepté. Les exports du
master, de l'instance Home et du contexte Home+Header sont octet pour octet
identiques aux preuves historiques. L'audit générique reste `green` avec zéro
finding. Aucun component set ni frame responsive 028 n'existe encore.

## Comparaison

| Fait | Baseline 027 | Audit frais 028 | Classification |
|---|---|---|---|
| Version Figma | `2391670501431838845` | identique, relue en direct | baseline confirmé |
| Master public | `2151:5552`, key `36011e…c4490` | identique, unique, `COMPONENT` | baseline confirmé |
| Container local | `2448:4731`, Auto Layout, master Fill | identique, un seul enfant composant | baseline confirmé |
| Structure master | sha256 `fa1577…d88e16d` | même sha256 | aucune dérive |
| Propriétés master | sha256 `762e61…38fa4` | même sha256 | aucune dérive |
| Faits master | sha256 `7934d1…b5d5074` | même sha256 | aucune dérive |
| PNG master 1728×720 | sha256 `beff92…7659ac` | même sha256, revue visuelle PASS | aucune dérive |
| Usage Home | unique instance `2170:6351` → `2151:5552` | identique, unique | baseline confirmé |
| Structure/propriétés/faits Home | hashes 027 | mêmes hashes | aucune dérive |
| PNG Home 1728×720 | sha256 `af47cd…d12b3e` | même sha256, revue visuelle PASS | aucune dérive |
| Contexte Home+Header | capture 1728×5462 de 027 | structure, propriétés, faits et PNG identiques | aucune dérive |
| Header | contexte read-only `210:473` | export frais 1728×86 valide | contexte confirmé |
| Poster | façade `8eb8b9…9ad32`, FILL | identique, transform identité | baseline confirmé |
| Deux voiles | stops `0.8→1` et `0.75→1`, alpha final `0.5` | identiques | baseline confirmé |
| Titre master | `Titre Hero vidéo`, Montserrat Regular 44/48 | identique, `named-exact` | baseline confirmé |
| Button master | `6:135`, Outline blanc, label 16/22 | identique, `named-exact` | enfant read-only confirmé |
| CTA Home | « En savoir plus », Outline blanc, icône droite | identique | fait protégé confirmé |
| Text Style du CTA Home | lien absent, métriques Montserrat Medium 16/22 | défaut toujours présent à l'identique | défaut préexistant, read-only, non bloquant |
| Descendants recréés avant 027 | `2563:5956…2563:5966` | mêmes IDs et chemins | dérive de provenance inchangée |
| Bindings Wide | `space/10`, `space/48`, `space/89`, `size/hero-video/root` | IDs et noms relus via Bridge | baseline confirmé |

## Séparation des écarts

- **Baseline** : identité, Container, rendu Wide, Home, médias, textes,
  propriétés, bindings et overrides utiles sont confirmés.
- **Dérive historique** : la recréation antérieure des descendants reste une
  provenance documentée ; 028 ne restaure aucun ID.
- **Défaut CTA préexistant** : le lien Text Style du label Home reste absent.
  La clarification 028 remplace l'ancien blocage de 027 : ce défaut reste visible,
  strictement read-only et non bloquant pour les décisions réalisables sur le parent.
- **Delta responsive 028** : aucun à H1. Les frames de travail restent interdites
  jusqu'à une acceptation owner explicite de ce gate.

## Blast radius proposé après H1

H1 peut autoriser uniquement des frames de travail séparées du Container gouverné
et des Pages. Le master, le Container, Home, Header, Button, les médias et tous les
enfants restent en lecture seule. H1 n'autorise ni snapshot d'application, ni
component set, ni mutation du master.

## Preuves

- `specs/component-repairs/hero-video/run-003/audit.json`
- `specs/028-figma-responsive-hero-video/proofs/H1-surface-manifest.json`
- `specs/028-figma-responsive-hero-video/proofs/H1-bridge-read-only.json`
- `specs/028-figma-responsive-hero-video/inventory/H1-primitives.json`
- `specs/027-responsive-hero-video/inventory/H1-fresh-audit.json`
- `specs/027-responsive-hero-video/decisions/H1-baseline.json`
- `specs/027-responsive-hero-video/decisions/H2-responsive.json`
