# Implementation Plan: Vague contenu Odoo (wave B) — sections Coordonnées & Réassurances

**Branch**: `022-odoo-production-wave-b` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/022-odoo-production-wave-b/spec.md`

---

## ⛔ GATE HUMAIN — tables de verdicts d'éditabilité (premier livrable, FR-001/FR-002)

> Exigence de processus de l'owner : « tu dois me proposer les éléments modifiables ou non
> dans le panel edit avant tout dans le plan et je dois valider — gate humain. »
>
> **Statut : PROPOSÉ — en attente de validation owner.** Aucune tâche d'implémentation
> d'authoring ne démarre avant la validation de la table de SA section (SC-001). La table
> validée fait foi (FR-003) ; elle sera transcrite telle quelle en
> `integrations/odoo/config/<section>.authoring.json` (schéma 019
> `specs/019-odoo-production-foundation/contracts/authoring-config.schema.json`) et vérifiée
> par `npm run odoo:authoring:check` (aucun verdict par défaut, 100 % des props/parts).
>
> Vocabulaire (mapping exact vers le schéma 019) :
> **éditable** = `controlled` (prop) / `directly-editable` (part) ·
> **fixé par composition** = `fixed-by-composition` ·
> **non éditable** = `not-editable` · **hors capacité** = `out-of-capacity` (+ reasonCode).
> Copie machine archivée : `contracts/coordonnees.editable-scope.json` et
> `contracts/reassurances.editable-scope.json` (dossier de cette spec).

### Table 1 — `ds.coordonnees` 2.2.0

**Actions de racine** (politique uniforme des 8 sections déjà montées) :

| Action | Verdict |
|---|---|
| move / duplicate / remove | autorisé |
| save-as-custom / resize / background | interdit |

**Props (4 publiques + 6 héritées de l'occurrence SectionHeader)** :

| # | Élément (adresse contrat) | Type | Verdict | Geste rédacteur si éditable | Justification |
|---|---|---|---|---|---|
| C1 | `mapUrl` | text, défaut vide (consommateur) | **non éditable** *(décision gate 2026-08-19)* | — | **Décision owner au gate** : le plan sera alimenté plus tard via une **API custom** (hors vague 022) ; d'ici là la section pose un **placeholder** aux dimensions du contrat, sans src — identique des deux côtés de la mesure visuelle, jamais d'image cassée. La proposition initiale (remplacement média au panneau, précédent hero) est **retirée**. |
| C2 | `mapAlt` | text, défaut vide | **non éditable** *(décision gate 2026-08-19)* | — | Suit C1 : l'alt entrera avec l'intégration API custom, pas par le rédacteur. |
| C3 | `accroche` | text, défaut « Contact » | **éditable** | Édition en ligne de l'accroche (eyebrow du SectionHeader) | Prop publique **routée** par le contrat vers l'enfant — la valeur entre par la racine, c'est là qu'on l'édite (précédent : presentation `titre`). |
| C4 | `titre` | rich-text, défaut « Nos coordonnées » | **éditable** | Édition en ligne + bouton gras (marque `strong`) | Précédent : hero-title (rich-text routé). |
| C5 | SectionHeader.`disposition` | enum, fixé `standard` | **fixé par composition** | — | Littéral de composition. |
| C6 | SectionHeader.`alignement` | enum, fixé `gauche` | **fixé par composition** | — | Littéral de composition. |
| C7 | SectionHeader.`emphase` | enum, défaut `standard` | **fixé par composition** | — | Défaut d'enfant, non routé. |
| C8 | SectionHeader.`accroche2` | boolean, défaut true | **fixé par composition** | — | Défaut d'enfant (accroche visible). |
| C9 | SectionHeader.`titre` | rich-text | **fixé par composition** | — | La valeur vit sur C4 (routage) ; l'éditer ici n'existe pas. |
| C10 | SectionHeader.`accroche` | text | **fixé par composition** | — | Idem, valeur sur C3. |

**Parts (21, racine et imbriquées comprises)** :

| # | Part (chemin anatomie) | Verdict | Geste si éditable / marques | Justification |
|---|---|---|---|---|
| P1 | `root` | **non éditable** | — | Structure. |
| P2 | `googleMap` (img 1152×597) | **non éditable** (média) | — | Aucun remplacement, ni au clic direct (conteneurs natifs ReplaceMediaOption/ImageToolOption/ImageAndFaOption fermés — règle canvas commune) **ni au panneau** : placeholder jusqu'à l'API custom (décision gate, voir C1). |
| P3 | `wrapper` | **non éditable** | — | Structure (colonne 576px). |
| P4 | `SectionHeader` (root de l'occurrence) | **non éditable** | — | Structure. |
| P5 | SectionHeader → `Accroche` | **éditable** | En ligne, texte simple | Surface d'édition de C3. |
| P6 | SectionHeader → `Titre` | **éditable** | En ligne, rich-text `strong` | Surface d'édition de C4. |
| P7 | SectionHeader → `Bouton` | **fixé par composition** | — | Jamais rendu (`disposition=standard`). |
| P8 | `Adresse` | **non éditable** | — | Structure. |
| P9 | `AdresseEtiquette` (« Adresse ») | **éditable** | En ligne, texte simple | Contenu, pas structure (précédent : sous-titre texte-seo). |
| P10 | `AdresseValeur` | **éditable** | En ligne, texte simple + `line-break` | Le **soulignement est un style de la part** (CSS `text-decoration-line` du contrat) : il survit à toute édition — aucune limite à nommer ici. |
| P11 | `Horaires` | **non éditable** | — | Structure. |
| P12 | `HorairesEtiquette` (« Horaires ») | **éditable** | En ligne, texte simple | Contenu. |
| P13 | `HorairesValeur` | **éditable** | En ligne, texte simple + `line-break` | Contenu (le pre-line du contrat honore les sauts). |
| P14 | `Contact` | **non éditable** | — | Structure. |
| P15 | `ContactEtiquette` (« Contact ») | **éditable** | En ligne, texte simple | Contenu. |
| P16 | Bloc Tél/Email (`tl32087463266EmailInfopi`) | **éditable** — 2 options, voir **Q-C1** | Option A (recommandée) : marques `link` + `line-break` | Le défaut porte un saut de ligne (`\r`, pre-line) et 2 segments **soulignés** (tél + email). **Option A (recommandée)** : tél et email deviennent de vrais liens `tel:` / `mailto:` — le soulignement est rendu par le lien (visuel identique), l'édition ne peut pas le perdre, et le site gagne le clic-pour-appeler. Adaptation Odoo au registre (précédent : lien CTA, décision owner 2026-08-18 — aucun contrat ne porte de notion de lien). **Option B** : spans soulignés statiques + texte simple — limite nommée : une réécriture complète du bloc peut perdre le soulignement segmentaire. |
| P17 | `suivezNous` | **non éditable** | — | Structure. |
| P18 | `SuivezNousEtiquette` (« Suivez-nous ») | **éditable** | En ligne, texte simple | Contenu. |
| P19 | `rseauxSociaux` | **non éditable** | — | Structure. |
| P20 | `Facebook` (icône 32) | **non éditable** (média) + option lien, voir **Q-C2** | Option A : URL réglée au panneau (« Lien Facebook ») | L'icône elle-même n'est jamais remplaçable. **Option A (recommandée)** : l'icône devient cliquable, URL au panneau, même grammaire que le lien CTA (`/`, `https:`, `mailto:`, `tel:` ; `javascript:` refusé). **Option B** : statique, conforme au contrat strict. |
| P21 | `Instagram` (icône 32) | idem P20 | idem P20 | idem P20. |

**Questions de la table 1 — RÉSOLUES au gate (2026-08-19)** : **Q-C1** = Option A (liens
`tel:`/`mailto:`, marques `link`+`line-break` — spike D9 maintenu avant intégration) ·
**Q-C2** = Option A (icônes cliquables, URL au panneau, grammaire CTA-href).

**Adaptation largeur (FR-007, hors verdicts — geste d'addon enregistré)** : racine étirée à la
page ; `googleMap` perd son `min-width` de contrat (pont root-scopé `ODOO-022-COORDONNEES-BRIDGE`,
précédent `ODOO-019-GOOGLE-REVIEWS-BRIDGE`) et fléchit, le wrapper garde ses 576px ; zéro
débordement horizontal à 1728 et 1440 px. Le contrat n'est pas modifié.

### Table 2 — `ds.reassurances` 1.2.0

**Actions de racine** : identiques à la table 1 (move/duplicate/remove autorisés ; save-as-custom/resize/background interdits).

**Props (2 publiques + occurrences imbriquées)** :

| # | Élément (adresse contrat) | Type | Verdict | Geste rédacteur si éditable | Justification |
|---|---|---|---|---|---|
| R1 | `disposition` | enum {4Cartes, quatrecartesdeuxcta, 5Cartes}, défaut 4Cartes | **non éditable** (figée « 4 cartes » — **validé au gate**, réponse owner : « c'est une grille de 4 colonnes ») | — | (a) Le nombre de cartes vit déjà dans les gestes de collection — une variante ne peut ni ajouter ni retirer une carte d'un DOM sauvegardé (un bloc posé ne se re-rend jamais) ; (b) les 2 autres variantes changent la rangée de CTA **et** la largeur de carte (285px) : plans supplémentaires + largeur par variante = exception structurelle que la vague « contenu » exclut par hypothèse d'entrée. Alternative si voulue : `enum` à la review-note (bandes cachées) — coût nommé, première variante *structurelle* gouvernée. |
| R2 | `items` | arrayOf {titre, texte, imageUrl} (consommateur) | **éditable** (collection ordonnée) | Panneau : **ajouter** (blueprint), **supprimer**, **monter**, **descendre** — les gestes natifs de l'éditeur sur une carte (dupliquer/supprimer/déplacer) sont neutralisés. Bornes : 0..n (précédent équipe 0/1/16/17). Voir **Q-R3** | Précédent exact : équipe `items`, google-reviews `avis` (ordered-repeat). |
| R2a | `items[].titre` | text | **éditable** | En ligne, texte simple (par carte) | Contenu de carte. |
| R2b | `items[].texte` | rich-text | **éditable** | En ligne, rich-text `strong` (par carte) | Le défaut porte une première phrase en gras (contrat ds.carte 2.0.x). |
| R2c | `items[].imageUrl` | text, défaut vide (consommateur) | **éditable** | Bouton « Remplacer l'image » par carte → dialogue média natif (`/web/image`) | Précédent : portrait équipe. Pose **sans** src → jamais d'image cassée ; photos de production posées au montage. |
| R2d | alt de l'image de carte | (hors route contrat) | **éditable** | Champ alt au panneau de carte | **Limite nommée** : la route `items` du contrat ne porte pas d'alt (`ds.carte.imageAlt` défaut "") — la valeur vit dans l'instance Odoo, comme l'URL. Précédent : `SetMemberPortraitAltAction`. |
| R3 | SectionHeader.* (6 props : titre, accroche, accroche2, disposition, emphase, alignement) | — | **fixé par composition** | — | La composition passe des **littéraux** (« Pourquoi choisir nos portes de garage industrielles ? », « Plus de 50 ans d'expérience », accroche2=true) — aucune prop racine ne route (contrairement à Coordonnées). C'est la lecture de la US2 : « textes fixés par la composition du contrat ». |
| R4 | Carte.`disposition` | enum, fixé `reassurance` | **fixé par composition** | — | Littéral de composition. |
| R5 | Carte.`ctaLabel` / `ctaIconLeftGlyph` / `ctaIconRightGlyph` | — | **fixé par composition** | — | Props du plan Categorie, jamais rendu (R4). |
| R6 | BoutonQuatreCartes (ds.button) : `children` (libellé « Contactez-nous ») | text | **éditable** — voir **Q-R2** | En ligne, texte simple + **lien réglé au panneau** (BuilderUrlPicker, grammaire same-origin/`https`/`mailto:`/`tel:`, `javascript:` refusé) | Cohérence : les 6 CTA déjà posés (hero, presentation, faq, devis, sav ×2) ont tous le libellé éditable + le lien au panneau. Alternative (lecture littérale du scénario 3 de la US2) : bouton entièrement figé. |
| R7 | BoutonQuatreCartes : `variant`, `iconLeft/Right`, `iconLeft/RightGlyph` | — | **fixé par composition** | — | Style/glyphes = identité du DS, jamais au rédacteur (politique constante des 8 sections). |
| R8 | BoutonCinqCartes + Boutons{Bouton, BoutonSecondaire} : toutes les props | — | **fixé par composition** | — | Plans des variantes non exposées, jamais rendus (R1). |

**Parts** :

| # | Part (chemin anatomie) | Verdict | Geste si éditable / marques | Justification |
|---|---|---|---|---|
| S1 | `root` | **non éditable** | — | Structure. |
| S2 | `SectionHeader` (root + Accroche + Titre + Bouton) | **fixé par composition** (Accroche/Titre : non éditables) | — | Textes fixés par la composition (R3) ; le geste de texte lui-même est bloqué (edge case « verrou contourné »). Bouton du header jamais rendu. |
| S3 | `items` (rangée de cartes) | **non éditable** | — | Conteneur du repeat ; gestes de collection via R2 uniquement. |
| S4 | Carte → `root` (répétée, marquée par position) | **non éditable** | — | Structure ; suppression/duplication natives neutralisées (S3/R2). |
| S5 | Carte → `reassuranceImage` | **non éditable** (média) | — | Clic direct fermé (règle canvas commune) ; remplacement via R2c. |
| S6 | Carte → `categorieImage` | **fixé par composition** | — | Jamais rendu (R4). |
| S7 | Carte → `text` | **non éditable** | — | Structure. |
| S8 | Carte → `TitreReassurance` | **éditable** | En ligne, texte simple | Surface de R2a. |
| S9 | Carte → `TexteReassurance` | **éditable** | En ligne, rich-text `strong` | Surface de R2b. |
| S10 | Carte → `TitreCategorie` / `TexteCategorie` / `Bouton`(+`action`) | **fixé par composition** | — | Plans Categorie, jamais rendus. |
| S11 | `BoutonQuatreCartes` (hôte) | **non éditable** (structure) — libellé selon Q-R2 | Le libellé (`button-label`) est la seule zone rouverte si Q-R2 = éditable | Précédent : parade focus `button-root` (pont CTA-LIEN, 2026-08-18). |
| S12 | `BoutonCinqCartes`, `Boutons`, `Boutons→Bouton`, `Boutons→BoutonSecondaire` | **fixé par composition** | — | Jamais rendus (R1). |

**Questions de la table 2 — RÉSOLUES au gate (2026-08-19)** : **Q-R1** = disposition figée
« 4 cartes », la collection se comporte en **grille de 4 colonnes** (au-delà de 4 cartes :
passage à la ligne, précédent Équipe — geste d'addon exercé au QA) · **Q-R2** = libellé
éditable + lien au panneau · **Q-R3** = les 4 gestes {ajouter, supprimer, monter, descendre},
bornes 0..n.

**Adaptation largeur (FR-007)** : racine 1550px non imposée à la page (pont
`ODOO-022-REASSURANCES-BRIDGE` : largeur fluide plafonnée au naturel) ; cartes 364px
rétrécissables (`min-width: 0`) ; **comportement de collection validé au gate** : grille de
4 colonnes — au-delà de 4 cartes, passage à la ligne (précédent Équipe), en dessous, rangée
centrée ; **DW-002 nommé** : la source Figma déborde d'elle-même de 2px
(4×364 + 3×32 = 1552 dans 1550) — le CSS rétrécit, comportement fidèle connu, pas un écart à
expliquer deux fois. Zéro débordement à 1728 et 1440 px.

### Registre du gate

| Table | Statut | Décidé par | Date | Écarts vs proposition |
|---|---|---|---|---|
| Coordonnées | **VALIDÉE avec 1 écart** | owner (séance /plan) | 2026-08-19 | **C1/C2 modifiés** : le plan Google sera alimenté plus tard **via une API custom** (hors vague 022) — d'ici là, **placeholder** à la pose, AUCUN remplacement média offert au rédacteur (la proposition « bouton média au panneau » est retirée). Le rédacteur édite « du texte et des liens réseaux sociaux ». Q-C1 = **Option A** (liens `tel:`/`mailto:`) ; Q-C2 = **Option A** (icônes cliquables via panneau). Le reste : tel que proposé. |
| Réassurances | **VALIDÉE** | owner (séance /plan) | 2026-08-19 | Q-R1 = **figée** — réponse owner : « bah c'est une grille de 4 colonnes » (pas de réglage de variante ; la collection se comporte en **grille de 4 colonnes** : au-delà de 4 cartes, passage à la ligne — précédent Équipe — comportement à exercer au QA). Q-R2 = **libellé éditable + lien panneau**. Q-R3 = **les 4 gestes** {ajouter, supprimer, monter, descendre}, bornes 0..n. |

> Toute divergence découverte en aval entre le comportement livré et une table validée est un
> défaut ou un retour au gate — jamais un ajustement silencieux (FR-003, SC-007).

---

## Summary

Monter **Coordonnées** (`ds.coordonnees` 2.2.0) et **Réassurances** (`ds.reassurances` 1.2.0)
dans l'addon de production `integrations/odoo/addons/piqueray_ds` (8 → 10 sections), par le
workflow 019 inchangé : gate humain de verdicts (ci-dessus) → repin du lock (fermeture 15 → 18
contrats, `ds.carte` entre par la fermeture de Réassurances) → configs d'authoring exhaustives →
QWeb + panneaux + actions (collection de cartes, images de cartes, CTA lien, liens tel:/mailto:
et réseaux sociaux ; plan Google en **placeholder** — décision gate) + ponts de largeur
root-scopés → assets régénérés → QA par section sur instance Docker propre + delta visuel mesuré
contre la référence 020 (validée par l'owner le 2026-08-09 pour les deux sections) →
qualification (portes odoo vertes, non-régression 8 sections, versions/lock/digest réalignés).
Aucun contrat, token, Figma ni `core/` modifié. Aucun mécanisme non prouvé par 019 : texte/rich-
text, média panneau, ordered-repeat, enum, CTA-href, fermeture/réouverture nommée — tout existe ;
la seule zone d'incertitude mesurable (survie du saut de ligne + soulignement du bloc Tél/Email à
l'édition) reçoit un spike dédié avant intégration (leçon 018 : « lu mais non confirmé » = à
exécuter).

## Technical Context

**Language/Version**: Python 3 / XML QWeb / JavaScript (addon Odoo 19 écrit à la main, zones
enregistrées) ; TypeScript (pin dépôt `typescript@^6`), Node ≥ 20, ESM via `tsx` (scripts
`scripts/odoo/*`, QA `integrations/odoo/qa/*`, tsconfig local `integrations/odoo/tsconfig.json`)
**Primary Dependencies**: Odoo 19 épinglé (`odoo:19.0-20260803` + `postgres:15`, compose QA) ;
`html_builder` via `website` ; `playwright-core` + `extract/image-parity` (réutilisé tel quel) ;
frontière unique APIs internes Odoo = `odoo19_compat.js` — **aucune dépendance nouvelle**
**Storage**: JSON sur disque — 2 NOUVELLES configs `integrations/odoo/config/{coordonnees,reassurances}.authoring.json`
(schéma 019 figé) ; `config/inputs.lock.json` repinné (contrats 15 → 18 : +`ds.coordonnees`
+`ds.reassurances` +`ds.carte`, `graphDigest` recalculé) ; `config/adaptation-registry.json`
(+entrées `ODOO-022-*`) ; preuves sous `specs/022-odoo-production-wave-b/proofs/`
**Testing**: portes Odoo (`odoo:inputs:check`, `odoo:authoring:check`, `odoo:assets -- --check`,
`odoo:derivation:check`, `odoo:module:check`, `odoo:typecheck`, `odoo:visual:selftest --strict`,
`odoo:qualification`) ; scénarios Playwright par section sur instance propre (+ rejeu des 8
existants) ; harnais visuel `qa/visual` (sujets ajoutés, largeurs de contrôle 1728 et 1440) ;
sweep dépôt complet (constitution) — trivialement stable, exécuté quand même
**Target Platform**: éditeur Website Odoo 19 (builder) + page publique, instance Docker jetable
**Project Type**: extension d'un addon CMS gouverné par contrats (zone manuelle mesurée + sorties générées)
**Performance Goals**: `odoo:assets` déterministe (digest canonique du rapport de dérivation) ;
delta visuel chiffré par section, chaque écart non nul attribué (SC-003)
**Constraints**: contrats consommés TELS QUELS (FR-005) ; adaptation de largeur côté addon
uniquement, root-scopée, enregistrée (FR-007) ; interdiction d'éditer `static/src/css/generated/`
; aucun verdict par défaut ; Figma en lecture zéro (020/021 non rouverts)
**Scale/Scope**: 2 sections (racines 8 → 10), fermeture +3 contrats, ~31 verdicts (Coordonnées) +
~40 verdicts (Réassurances, occurrences ds.carte/ds.button/ds.section-header comprises), 2
scénarios QA + 1 spike, 2 sujets visuels, bump module `19.0.1.5.0`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` (v1.2.0).

- [x] **I. Determinism (NON-NEGOTIABLE)** — aucun modèle dans la génération : `npm run odoo:assets`
      est un script pur (digest canonique) ; le QWeb/JS est zone manuelle enregistrée, pas une
      sortie. Le pipeline contrat→surfaces du dépôt n'est pas touché.
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — aucune phrase de capacité ajoutée aux docs sans
      preuve : chaque claim de la vague sort d'un scénario QA archivé (reçus JSON) ou d'une porte
      exécutable ; le spike Tél/Email précède toute affirmation sur l'édition de ce bloc.
- [x] **III. Contract is the SSoT** — contrats lus aux chemins canoniques, épinglés par le lock
      (version + SHA-256), jamais copiés ni modifiés ; `npm run parity` reste vert (aucune
      surface du dépôt ne bouge).
- [x] **IV. No hand-edited output** — `static/src/css/generated/*` uniquement régénéré
      (`--check` = statut `tampered` sinon) ; `src/components/`, `figma-sync/*`, `catalog/`
      intouchés.
- [x] **V. Honesty** — limites nommées dans le plan et portées aux artefacts : alt de carte hors
      route contractuelle (R2d), DW-002 (débordement source de 2px), disposition figée si Q-R1
      validée, option B de Q-C1 si retenue (perte possible du soulignement segmentaire), bloc
      posé = copie figée (constat 018, re-documenté). Un contrôle sauté est dit sauté
      (`selftest --strict` en clôture).
- [x] **VI. Additive evolution** — zéro changement de schéma, de contrat, de token ; versions
      d'addon en bump mineur (`19.0.1.5.0`), `authoringVersion` neuves à `1.0.0`.
- [x] **VII. Engine integrity** — `core/` intouché ; aucun canvas Figma, donc pas de mock à
      étendre.
- [x] **VIII. Source cleanliness** — pas de nouvelle extraction : sources auditées en 020
      (dossiers clos), Figma réparé/accepté en 021, références owner du 2026-08-09 épinglées.
      Wave B ne touche pas Figma (lecture zéro).
- [x] **IX. Docs-first** — consulté AVANT ce plan : `integrations/odoo/README.md` (workflow de
      portage, 4 frontières, règles média/canvas), constitution, schémas 019, configs/QWeb/ponts
      019 (précédents), dossiers 020 (verdicts + références), commit `cc6cd0d4` (CTA-link).
      auggie MCP indisponible (HTTP 402) → fallback nommé : lecture directe des documents.
- [x] **X. Before-capture** — N/A : aucune mutation de canvas Figma.
- [x] **XI. Multi-writer bridge** — N/A : aucun écrivain canvas.

**All gates green:**

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

plus les portes Odoo de la vague :

```bash
npm run odoo:inputs:check && npm run odoo:authoring:check \
  && npm run odoo:assets -- --check && npm run odoo:derivation:check \
  && npm run odoo:module:check && npm run odoo:typecheck \
  && npm run odoo:visual:selftest -- --strict
```

Spec exécutée en worktree git : sweep COMPLET dans le worktree (Constitution, Worktree Gates F1)
— `npm install` + `npx playwright install chromium` d'abord.

## Project Structure

### Documentation (this feature)

```text
specs/022-odoo-production-wave-b/
├── plan.md              # Ce fichier — OUVERT par les tables de verdicts (gate humain)
├── research.md          # Phase 0 — décisions et précédents (12 décisions, toutes tranchées)
├── data-model.md        # Phase 1 — entités (verdicts, lock, registre, DOM snippet, QA, preuves)
├── quickstart.md        # Phase 1 — instance, portes, QA des deux sections
├── contracts/           # Phase 1 — tables de verdicts en JSON (artefact du gate, archivé)
│   ├── README.md
│   ├── coordonnees.editable-scope.json
│   └── reassurances.editable-scope.json
├── checklists/requirements.md
└── tasks.md             # (/speckit.tasks — pas créé par /speckit.plan)
```

### Source Code (repository root)

```text
integrations/odoo/
├── config/
│   ├── coordonnees.authoring.json      # NOUVEAU — transcription de la table 1 validée
│   ├── reassurances.authoring.json     # NOUVEAU — transcription de la table 2 validée
│   ├── inputs.lock.json                # REPIN — +ds.coordonnees +ds.reassurances +ds.carte, graphDigest recalculé
│   └── adaptation-registry.json        # +ODOO-022-* (QWeb, snippet, panneau, repeat, média, ponts)
├── addons/piqueray_ds/
│   ├── __manifest__.py                 # 19.0.1.4.0 → 19.0.1.5.0
│   ├── views/components.xml            # +carte interne, +icônes facebook/instagram, +2 racines s_pqr_*
│   ├── views/snippets.xml              # +2 inscriptions bibliothèque (group="content")
│   └── static/src/
│       ├── css/generated/              # RÉGÉNÉRÉ par `npm run odoo:assets` — jamais à la main
│       ├── css/odoo-bridge.css         # +ODOO-022-COORDONNEES-BRIDGE, +ODOO-022-REASSURANCES-BRIDGE
│       ├── js/authoring.js             # +2 roots, +parts rouvertes, +panneaux, +actions inscrites
│       ├── js/repeat_action.js         # +Add/Remove/MoveUp/MoveDown CarteAction
│       ├── js/media_action.js          # +ReplaceCarteImageAction(+Alt) — plan Google : AUCUNE action média (placeholder, décision gate)
│       └── xml/authoring.xml           # +panneaux Coordonnées / Réassurances / Carte
├── qa/
│   ├── scenarios/
│   │   ├── coordonnees-spike.spec.mts  # spike Tél/Email (line-break + soulignement à l'édition)
│   │   ├── coordonnees.spec.mts        # scénario QA section (FR-015)
│   │   └── reassurances.spec.mts       # scénario QA section (collection comprise)
│   ├── visual/subjects/
│   │   ├── coordonnees.mts             # sujet mesuré (clip épinglé par --measure)
│   │   └── reassurances.mts
│   └── fixtures/                       # inventaires attendus 8 → 10
scripts/odoo/lib/repo-data.ts           # ROOT_CONTRACT_IDS += ds.coordonnees, ds.reassurances
specs/022-odoo-production-wave-b/proofs/ # reçus QA, mesures visuelles, rapport de qualification
```

**Structure Decision** : extension in-place de l'addon 019 — mêmes quatre frontières
(canonique / décision / généré / manuel), chaque bloc manuel neuf sous marqueur `ODOO-022-*`
enregistré au registre d'adaptations ; aucun nouveau répertoire, aucun nouveau framework.

## Points d'attention nommés (pour /speckit.tasks)

1. **Le gate d'abord** : aucune tâche d'authoring d'une section avant la validation de SA table
   (SC-001). Les tâches de fondation neutres (lock, assets, icônes) peuvent précéder.
2. **Repin = réalignement global** : le `graphDigest` change → les **8 QWeb existants** portent
   `data-ds-graph-digest` (+`data-vcss/vxml/vjs`, versions ancrées par `odoo:module:check`) à
   réécrire en cohérence, et la non-régression des 8 sections se rejoue (FR-013/FR-014).
3. **Spike avant claim** (leçon 018, 6 prémisses fausses) : le bloc Tél/Email (survie `\r`
   → line-break + soulignement à travers pose/édition/save/public) s'exécute AVANT l'intégration
   QWeb finale ; échec → retour au gate, jamais contourné.
4. **Repeat + photos** : le blueprint de carte naît sans src (pas d'image cassée) ; l'edge
   « vider le texte », « première/dernière carte », « geste interdit » est dans le scénario QA.
5. **W-auto mesuré, pas déclaré** : assertions à 1728 **et** 1440 (racine et enfants, zéro
   débordement, largeurs fixes non imposées) dans chaque scénario (SC-008).
6. **Référence visuelle** : côté référence = `emitHtml` du contrat au clip épinglé (mécanisme
   019) — c'est la même apparence que la référence validée en 020 (les dossiers 020 épinglent le
   contrat par SHA et la version Figma) ; tout delta non nul est chiffré + attribué (SC-003).
7. **Icônes** : `facebook.svg` / `instagram.svg` transcrits en templates QWeb inline (précédent
   pqr_star/pqr_arrow_right) depuis `assets/icons/` (registre gouverné, non modifié).

## Complexity Tracking

> Aucune violation constitutionnelle — tableau vide.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
