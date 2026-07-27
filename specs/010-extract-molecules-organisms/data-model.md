# Phase 1 — Data Model: extraction des molécules et organismes

**Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

Aucune entité nouvelle n'est introduite dans le schéma (`packages/schema/src/contract-schema.ts`
inchangé — Constitution VI). Ce document fixe les entités **manipulées** par l'itération, leurs
champs pertinents, leurs règles de validation et leurs transitions d'état.

---

## 1. Contract (entité principale — schéma existant, v14+)

Source de vérité versionnée d'un composant. Champs sollicités par 010 :

| Champ | Rôle dans 010 | Règle de validation |
|---|---|---|
| `id` | `ds.<kebab>` — ex. `ds.member-picture`, `ds.footer-column` | unique ; jamais recyclé |
| `name` | PascalCase anglais côté code (`MemberPicture`, `FooterColumn`) | table de nommage 007 (accents dépliés) |
| `version` | `1.0.0` à l'adoption (la proposition est `0.1.0` draft) | semver ; règles VI pour toute évolution |
| `category` | `atom` (2) / `molecule` (13) / `section` (12) — **dérivée de la page DS du master** (FR-008) | enum Zod strict, refus par nom ; précédent 004 |
| `semantics.provenance` | `"extracted"` pour les 27 (vs `"authored"` en 006) | ajouté à l'adoption |
| `props[]` | doubles bindings : `bindings.figma` (VARIANT/TEXT/BOOLEAN/INSTANCE_SWAP) + `bindings.code` | `validateContract` refuse par nom |
| `anatomy` | `Record<string, Part>` — multi-racine possible (US3 scénario 3) | parts liées par `{dot.path}` token ou canal `literals` |
| `literals` / `literalsByProp` | canal honnête des valeurs sans token (précédent 004/006) | `LITERAL_CHANNELS` / `LITERAL_VALUE_RE` whitelistés |
| `anchors.figma` | `{ fileKey, componentSetKey, nodeId, dumpedAt }` — `dumpedAt` ajouté à l'adoption | fileKey Piqueray = `d9FYAUcqdcNtsuaMgLefvJ` |
| `anchors.code` | `{ importPath: "src/components/<Name>", export: "<Name>" }` | régénéré, jamais édité |

**Composition (champs de Part existants, aucun nouveau)** :
- `component: { id, props?, text? }` — instance fixe d'un autre contrat, **par clé** (FR-009).
  Limite nommée : pas d'injection de prop TEXTE parent dans l'enfant.
- `repeat: { itemsProp, sample[] }` + `component` — collection sur prop `arrayOf`
  (champs item : `text|number|boolean` seulement ; enums par item refusés par nom). Exercé
  uniquement en rangée horizontale à largeurs égales (006).
- `slot: { name, accepts?, acceptsMode?, defaultContent?, figmaProperty? }` — zone ouverte ;
  en schéma mais **jamais exercé sur Piqueray** (décision Field, research D9.3).

**Transitions d'état**: `proposition (0.1.0, draft, dans extract/out/figma/)` →
`reviewée (notes corrigées, unbound résolus — hors fichier, dans figma-proposals.md)` →
`adoptée (1.0.0, contracts/, category + provenance + dumpedAt)` → `générée + prouvée
(parity zéro, golden pinné, sujet visuel baselined)`.

---

## 2. Proposal (artefact transitoire — PAS un contrat)

Point de départ généré par 007 (`proposeBatchFromDump`, pur). Jamais modifié à la main : la
review produit un **contrat adopté** (fichier distinct dans `contracts/`), pas une proposition
éditée.

| Champ | Contenu |
|---|---|
| JSON (`*.contract.proposed.json`) | contrat schéma-valide draft (props, anatomie, anchors sans `dumpedAt`) |
| Notes (dans `figma-proposals.md`) | sémantique inférée à confirmer, convention `children`/`value`, stubs d'enfants inconnus à trancher |
| Unbound values (dans `figma-proposals.md`) | chemin de nœud, propriété, valeur brute, candidats tokens les plus proches — résolution : lier à un token existant OU canal `literals` ; jamais inventé, jamais silencieux (V) |

**Dédup** : identité = `anchors.figma.componentSetKey`. 11 doublons accent-manglés écartés
(canonique = fichier non mangle, ex. `coordonnees`, jamais `coordonn-es`).

---

## 3. IconRegistry + IconEntry (schéma existant — extension de données)

`contracts/icons.registry.json` — singleton `id: "ds.icons"`.

| Champ | Règle |
|---|---|
| `version` | `1.1.0` → `1.2.0` (widening = minor ; les 16 entrées existantes inchangées) |
| `source` | `{ fileKey, zoneNodeId: "6:111", dumpedAt }` — `dumpedAt` rafraîchi |
| `icons[]` | `name` kebab `^[a-z][a-z0-9-]*$` unique ; `figma: { componentName (verbatim), key (stable), nodeId }` ; `asset` → `assets/icons/<asset>.svg` (existence = refus au build, pas au schéma) ; `size` entier > 0 (20/32) ; `description` depuis le master |

**+3 entrées (FR-014a)** : `external-link` (node `9:185`), `mail` (node `263:2125`),
`octicon-chevron-down12` (node `6:119`) — identités à re-vérifier live (clés stables, noms non).

**Relations vérifiées** : registry ↔ assets (build gate), registry ↔ canvas (axe icons de
parity), registry ↔ enums INSTANCE_SWAP des contrats (exactitude « ni plus ni moins » — couplage
Button, research D6.1), registry ↔ SVG canvas (export REST déterministe + `bakeCurrentColor`).

---

## 4. PerimeterEntry (artefact de gouvernance — US5/FR-010..016)

Table de périmètre (`contracts/perimeter-table.md`) : **chaque** composant des 3 pages DS du
fichier Figma a un statut explicite.

| Champ | Valeurs |
|---|---|
| `composant` | nom Figma (français) ↔ nom code (anglais), rapprochement par clé |
| `page DS` | Atomes / Molécules / Organisms → détermine `category` |
| `statut` | `contractualisé (existant)` ×7 · `à contractualiser` ×27 · `exclu` (motif nommé) · `doublon` (motif nommé) |
| `motif` | obligatoire pour exclu/doublon — par organisme pour les 4 complexes (research D7) |
| `lot` | L0–L5 pour les 27 (research D5) |
| `audit` | reçu 003/005/007 réutilisé + caveat nommé le cas échéant (research D4) |
| `inspiration archive` | match demo-51 volé/rejeté avec motif (research D9) |

**Règle de compte (SC-005/FR-016)** : contractualisés (34) + exclus nommés (4 organismes
complexes + 19 icônes seules) + doublons nommés (Bouton) = total des composants du fichier ;
tout écart au 34 est nommé et justifié. Les 19 icônes relèvent du registre (entité 3), pas des
contrats.

---

## 5. EvalCase — cycle de vie de quarantaine (FR-018)

| État | Transition |
|---|---|
| `quarantainé` (bloc dans `evals/legacy-cases.ts`, commentaire `RE-ENABLE WHEN:` + ligne dans `evals/REMOVED-CASES.md`) | → `actif` : **move** du bloc vers `evals/run.ts` (pas rewrite — harnais partagé `evals/harness.ts`), re-pointage des chaînes de fixture sur le sujet Piqueray si besoin (précédent 006 T061), retrait du tableau REMOVED-CASES, compteurs re-synchronisés (datés) |
| `réactivé` | nommé dans le rapport de clôture (règle hybride) ; jamais silencieux |

Triage 010 (détail : `contracts/eval-revival.md`) : obligatoire (débloqué par les 27) /
conditionnel (si une capacité est adoptée) / famille slot (suspendu à la décision Field) /
dette adjacente (triage owner à la clôture) / gelés (thème, brand, switch, fixtures d'écran).

---

## 6. VisualSubject (instrument existant — config par composant)

`extract/figma/visual-parity/subjects.ts` — une entrée par composant adopté :

| Champ | Règle |
|---|---|
| `kind: 'contract'`, `contractId`, `fileKey`, `setNodeId` | obligatoires ; `setNodeId` = node du set sur le canvas |
| `renderWidth` | si le composant est FILL-width (précédent Input/Textarea 280) |
| `instanceOverride` | si le combo de props par défaut ne suffit pas (précédent button-with-icons) |
| exclusion nommée | écrite dans subjects.ts là où la capacité est revendiquée (précédent Select) |

Baseline : un run complet revu puis `--write-baseline` explicite (jamais un re-run ordinaire).
Tolérances nommées, inchangées : diff 2.0 %, triage 3.0 % (cause nommée), epsilon summary 0.1 pp.

---

## 7. Relations (graphe de dépendance des 34 contrats)

```
tokens/*.tokens.json ──lie──▶ toutes les anatomies ({dot.path} ou literals)
icons.registry.json ──énumère──▶ enums INSTANCE_SWAP (Button, CarouselControls…) + parts icône
MemberPicture ──component──▶ MemberCard ──component/repeat──▶ Equipe
PiquerayLogo ──component──▶ Header, Footer
Input/Select/Textarea ──slot? accepts──▶ Field ──component──▶ Formulaire
Button ──component──▶ ProductCard, Devis, SectionHeader(CTA)?…  (lu dans les propositions)
AccordionRow ──repeat──▶ FAQ · FooterColumn ──repeat──▶ Footer · NavItem ──repeat──▶ Header
Carte ──repeat?──▶ Reassurances · Avantage ──?──▶ Reassurances (à la review)
```

`sortByDependencies` fait respecter l'ordre au build ; une dépendance surprise déplace le
composant au lot suivant (nommé). Aucune relation ne se déclare par nom d'affichage (FR-006/009).
