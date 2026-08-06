# Implementation Plan: Répliquer à la main une chaîne gouvernée en blocs Odoo 19

**Branch**: `018-odoo-replique-manuelle` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/018-odoo-replique-manuelle/spec.md`

## Summary

Monter **à la main**, dans un module Odoo 19 installé sur une instance jetable, la chaîne
`ds.presentation → ds.section-header → ds.button` : trois modèles QWeb qui s'appellent, **une
seule** entrée dans le panneau de blocs, les 19 glyphes du registre gouverné embarqués, et
**zéro valeur de style invisible** — tout le style passe par une 4ᵉ sortie **additive et
préfixée** du pipeline de jetons existant, écrite directement dans le module par
`npm run tokens`, à la seule exception des littéraux **déclarés au registre du module**, épinglés
byte-à-byte contre leur contrat et comptés à part (FR-005, `research.md` §D4 — 1 attendu).

Puis mesurer trois choses et n'en livrer qu'une : les **volumes** (part mécanique / part cas
particulier), l'**état des quatre leviers de gouvernance** (dont un déclaré non exercé), et
l'**écart d'image** contre notre surface HTML — pour que l'owner décide, sur des chiffres, si un
émetteur `odoo` vaut le coup. **L'émetteur n'est pas dans le périmètre ; la décision l'est.**

Le seul code de dépôt touché est `scripts/build-tokens.mjs`. Tout le reste vit sous
`specs/018-odoo-replique-manuelle/` et n'est gouverné par personne — délibérément, et dit comme
tel (FR-015).

## Technical Context

**Language/Version**: Python 3 / XML QWeb / JavaScript (module Odoo 19.0, écrit à la main) ·
Node ≥ 20 + ESM via `tsx` (le harnais de mesure, spec-local) · JavaScript sans dépendance
(`scripts/build-tokens.mjs`, la seule édition de dépôt)
**Primary Dependencies**: Odoo **19.0** — vues QWeb (`<template>` + `t-call`), déclaration de
snippet par héritage `xpath` de `website.snippets`, système de réglages **`html_builder`**
(OWL : `BaseOptionComponent` + `Plugin` enregistré dans `registry.category("website-plugins")`),
bundles `web.assets_frontend` et `website.website_builder_assets`, Bootstrap **5.3.3** servi sans
condition. Le module déclare `depends: ['website']` — `html_builder` arrive par transitivité.
· Docker + Docker Compose (instance jetable : daemon vérifié 29.2.1, `linux/x86_64`) ·
`playwright-core` + Chromium épinglé (cache `ms-playwright` présent) · `pixelmatch`/`pngjs` via
`extract/image-parity/` **réutilisé tel quel** · `@fontsource/montserrat` (faces embarquées des
deux côtés de la comparaison)
**Storage**: JSON/CSS/XML sur disque. Édité : `scripts/build-tokens.mjs` (+1 sortie). Généré :
`specs/018-…/module/piqueray_ds/static/src/css/tokens.pqr.css`. Écrit à la main :
le module Odoo, les 3 tableaux des zones, les reçus, le rapport de décision. **Aucun**
`contracts/*.contract.json`, **aucun** `tokens/*.tokens.json`, **aucun** `src/`, **aucun**
`figma-sync/` touché.
**Testing**: la suite standard du dépôt en entier (`npm run build|parity|eval|plugin:check`,
roundtrip, core-browser-check, `tsc` ×2) + **1 nouvelle eval** C1 pour la 4ᵉ sortie (Principe II,
fixture → eval → claim) + le self-test du harnais de mesure + la preuve manuelle sur instance
(reçu de spec, jamais une porte permanente).
**Target Platform**: page publique et éditeur de site Odoo 19 sur instance Docker locale
éphémère ; Chromium headless pour les captures.
**Project Type**: spec de **dérisquage** — produit des faits mesurés et une décision documentée,
pas une capacité livrée. Un artefact de référence, hors de toute porte.
**Performance Goals**: la 4ᵉ sortie de jetons est **byte-identique ×2** et **strictement
additive** (les 3 sorties existantes inchangées au byte près) ; l'installation du module se
termine à 0 erreur ; les captures des deux côtés sont déterministes (viewport épinglé, DPR
épinglé, polices embarquées).
**Constraints**: aucun modèle de langage dans un chemin de génération (I) ; le pipeline reste
sans dépendance ; **aucune instance Odoo sur le chemin de la suite de contrôles standard** ;
l'instrument de parité visuelle gated n'est **ni étendu ni modifié** ; les 3 contrats sont pris
tels quels, jamais renégociés.
**Scale/Scope**: 3 contrats (**relevé du 2026-08-06, AVANT la fusion `main` — à re-relever en
T004** : 32 références de tokens, 9 littéraux dont 4 actifs sur le chemin emprunté), 1 registre
d'icônes (19 glyphes — inchangé sur `main`, vérifié), 1 fichier de dépôt édité, 1 eval ajoutée,
3 lignes de comparaison d'image, 4 verdicts de levier. Le vocabulaire de jetons passe de **222 à
231** propriétés `:root` avec la fusion : tout compte de token cité avant T002 est périmé par
construction.

### Décision de départ — le worktree doit être remis à niveau avant tout montage

**Fait mesuré le 2026-08-06** : ce worktree est basé sur `3c63c05` (post-015), alors que `main`
contient déjà **toute la spec 016**. Les trois contrats de la chaîne **et** le fichier de jetons
diffèrent :

| Entrée | ce worktree | `main` |
|---|---|---|
| `ds.button` | v1.6.0, variant `outilneNoir` | **v2.0.0**, variant `outlineNoir` (MAJEUR) |
| `ds.presentation` | v2.1.0 | v2.2.0 |
| `ds.section-header` | v2.0.0 | v2.1.1 |
| `tokens/primitives.tokens.json` | — | +345 lignes ; 2 tokens de plus consommés par la chaîne |

Monter le module ici produirait un artefact de référence sur un état de contrat **périmé** et des
volumes (FR-017) mesurés sur le mauvais état. Les Dependencies de la spec disent « dans l'état où
015 les a laissés » : l'**intention** est « géométrie gouvernée, post-015 », que 016 conserve et
étend — pas une épingle sur un commit. **La première tâche du chantier est donc de fusionner
`main` dans la branche**, puis de re-relever l'inventaire de la chaîne sur l'état fusionné.

### Ce que la Phase 0 a réfuté — trois choses à savoir avant d'écrire une ligne

Le relevé de recherche a lu la source d'Odoo 19.0 (branche `19.0`, version certifiée par
`odoo/release.py`). Trois résultats changent le cadrage, et les trouver ici coûte une relecture
au lieu d'un chantier. Détail complet et chemins de fichiers : `research.md` §D11–D13.

1. **Le « seul marqueur » de verrouillage n'existe pas.** La spec écrit « un seul marqueur, posé
   sur un conteneur, ferme d'un coup la suppression, la duplication et le déplacement de tout ce
   qu'il contient ». Faux comme énoncé : `o_not_editable` ferme les réglages et le dépôt sur le
   **sous-arbre**, mais `oe_unremovable` (suppression + duplication) et `oe_unmovable`
   (déplacement) sont **par élément**. Le levier L1 reste atteignable — Odoo compose exactement
   ces trois classes sur son propre `s_dynamic_snippet` — mais il se paie **en balisage sur chaque
   élément intérieur**. Ce coût est **entièrement mécanique** (dérivable du tableau des zones),
   donc il gonfle le volume sans gonfler la part de jugement : c'est un chiffre **en faveur** d'un
   émetteur, et le rapport doit le porter comme tel.
2. **`@layer` est un piège, pas une solution.** Odoo 19 n'emploie `@layer` nulle part (0
   occurrence) ni `:where()`. Le réflexe « isoler notre CSS dans une couche » **ferait perdre** :
   les déclarations non superposées l'emportent sur toute couche, donc le reboot de Bootstrap
   battrait notre couche. La voie qui marche est celle que FR-006 décrit déjà — nos propres
   classes, dont la spécificité l'emporte sur les sélecteurs de type du reboot.
3. **L'éditabilité durable est pire que « un attribut effacé », et se contourne par le balisage.**
   `contenteditable` **et** `.o_editable` sont tous deux retirés à chaque enregistrement (le
   sélecteur de nettoyage est littéralement `[contenteditable]`). Mais un texte placé sous
   `section > .container` est éditable **automatiquement, sans aucun attribut ni JavaScript**.
   Structurer nos gabarits ainsi achète une réduction de coût réelle — et mesurable, donc elle
   appartient au rapport de décision.

Une prémisse favorable est **confirmée** au passage, et elle est structurante : le noyau d'Odoo et
un module tiers s'inscrivent dans le **même registre de réglages, sans aucun filtrage par
origine** (`website_sale` et `mass_mailing` emploient l'appel du noyau à l'identique).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` (v1.2.0). Chaque point est vrai, ou justifié dans
Complexity Tracking.

- [x] **I. Determinism (NON-NEGOTIABLE)** — Le seul artefact **généré** de cette spec est la 4ᵉ
      sortie de jetons, produite par la même fonction pure sans dépendance que les trois autres,
      byte-identique ×2 (eval dédiée). Aucun modèle de langage dans ce chemin. Le module Odoo
      n'est **pas** une sortie générée : il est écrit à la main, et
      `deterministic-roundtrip.mjs` ne le couvre pas — **c'est la définition même de l'artefact**
      (FR-004/FR-015), pas un trou.
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — « le pipeline de jetons a une 4ᵉ sortie additive et
      préfixée » est une capacité : elle reçoit **son eval avant sa phrase de doc**
      (`docs/03-token-pipeline.md` n'est bumpé qu'après l'eval verte). Aucune autre capacité n'est
      revendiquée : les résultats Odoo sont des **faits mesurés consignés**, pas des capacités du
      dépôt.
- [x] **III. Contract is the SSoT** — Flux strictement sortant. « Toute remontée d'Odoo vers les
      contrats » est explicitement hors périmètre. `npm run parity` doit rester propre : la
      surface Odoo **n'ajoute aucun axe** au différentiel (les trois axes de
      `docs/06-parity-loop.md` sont inchangés).
- [x] **IV. No hand-edited output** — `src/components/`, `figma-sync/*.js`,
      `catalog/catalog.json`, `contracts/contract.schema.json` : aucun touché. Le fichier de
      jetons du module porte un en-tête **GENERATED — DO NOT EDIT** et se refait par
      `npm run tokens`.
- [x] **V. Honesty** — FR-014 (non-porté nommé), FR-016 (levier lâché consigné avec son
      remplaçant, levier non exercé avec sa raison), SC-009 (0 fait lu-dans-le-code présenté
      comme acquis), SC-006 (0 verdict rendu à l'œil, une mesure sautée jamais comptée réussie)
      *sont* ce principe, écrits en exigences.
- [x] **VI. Additive evolution** — **Aucun** changement de schéma, **aucun** contrat modifié,
      donc aucun semver de contrat à bumper. Le seul additif est une sortie de pipeline :
      `docs/03-token-pipeline.md` est bumpé avec elle (après l'eval).
- [x] **VII. Engine integrity** — `core/` n'est pas touché ; `core-browser-check` reste vert.
      `scripts/build-tokens.mjs` n'est pas dans `core/` et n'a jamais été browser-pur. Aucun bug
      canvas en jeu, donc aucune dette de fidélité de mock.
- [x] **VIII. Source cleanliness** — **N/A, déclaré** : cette spec ne lit ni ne mute aucune
      source Figma. Elle ne contracte rien : elle consomme trois contrats déjà extraits et
      adoptés.
- [x] **IX. Docs-first** — `docs/` consulté via auggie MCP **avant** toute décision de
      modélisation (03-token-pipeline, 15-engine-as-library, 06-parity-loop, handoff/05, le
      registre des littéraux nommés de 015). Ce que la doc répond est repris tel quel et cité
      dans `research.md` ; ce sur quoi elle est muette (aucune cible CMS/serveur tiers/Odoo
      documentée nulle part) est **dit comme un silence de la doc**, pas comblé par inférence.
- [x] **X. Before-capture** — **N/A, déclaré** : aucune mutation de canvas Figma.
- [x] **XI. Multi-writer bridge** — **N/A, déclaré** : aucune écriture canvas, aucun pont.

**All gates green:**

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Spec exécutée en worktree ⇒ la passe tourne **dans** le worktree (Constitution : Worktree Gates
F1). `node_modules` y est **absent** aujourd'hui : `npm install` + `npx playwright install
chromium` d'abord, avant toute porte.

**Surface de re-pin attendue : zéro** — et c'est vérifié, pas supposé.
`scripts/update-golden.mjs` ne parcourt que `src/` et `figma-sync/*.js` ; `specs/` n'y entre
jamais, donc la 4ᵉ sortie n'a **aucune** entrée golden. `figma-sync/plugin/engine.receipt.json`
ne dérive que sur édition tokens/contracts/icons — tous inchangés.
`examples/polaris/figma/*.figma.js` ne dérive que sur édition d'émetteur — aucun émetteur touché.
Une tâche du chantier **vérifie ces trois non-dérives par exécution** ; si l'une tombe, elle est
consignée, jamais absorbée.

## Project Structure

### Documentation (this feature)

```text
specs/018-odoo-replique-manuelle/
├── plan.md              # ce fichier
├── research.md          # Phase 0 — les décisions, avec ce qui a été écarté et pourquoi
├── data-model.md        # Phase 1 — les entités de la spec, leurs champs, leurs invariants
├── quickstart.md        # Phase 1 — monter l'instance, installer, prouver, détruire
├── contracts/           # Phase 1 — les interfaces que la spec expose
│   ├── odoo-tokens-output.md      # la 4ᵉ sortie du pipeline : nom, forme, invariants
│   ├── zone-table.schema.md       # le tableau des zones (FR-009)
│   ├── governance-verdicts.schema.md  # les 4 verdicts de levier (FR-016/SC-007)
│   ├── visual-comparison.md       # le protocole de comparaison d'image (SC-006)
│   └── volumes.schema.md          # la règle de classement mécanique/cas particulier
│                                  # (FR-017b) — écrite AVANT le montage, jamais au moment
│                                  # de compter
└── tasks.md             # Phase 2 — produit par /speckit.tasks, PAS par /speckit.plan
```

### Source Code (repository root)

```text
scripts/
└── build-tokens.mjs               # ÉDITÉ — la seule ligne de code de dépôt que 018 touche
                                   # (+1 sortie additive, préfixée, écrite dans le module)

evals/
└── run.ts                         # ÉDITÉ — +1 cas C1 pour la 4ᵉ sortie (Principe II)

docs/
└── 03-token-pipeline.md           # ÉDITÉ — après l'eval, jamais avant (Principe II)

specs/018-odoo-replique-manuelle/
├── module/piqueray_ds/            # L'ARTEFACT — écrit à la main, gouverné par personne
│   ├── __init__.py
│   ├── __manifest__.py
│   ├── README.md                  # ce que l'artefact EST (FR-015), + lien vers NON-PORTES.md
│   ├── NON-PORTES.md              # les non-portés nommés (FR-014), lisibles DEPUIS l'artefact
│   ├── named-literals.registry.json  # les littéraux nommés (FR-005), épinglés contre le contrat
│   ├── views/
│   │   ├── templates.xml          # les 3 modèles QWeb, chaînés par appel de modèle
│   │   ├── snippets.xml           # LA seule déclaration de bloc posable (FR-003)
│   │   └── harness.xml            # 3 pages de mesure US3 — non posables, hors panneau
│   ├── static/src/
│   │   ├── css/tokens.pqr.css     # GÉNÉRÉ par npm run tokens — ne jamais éditer
│   │   ├── css/components.css     # écrit à la main, 0 valeur littérale (que des var())
│   │   ├── js/                    # les réglages du panneau (FR-009/FR-011)
│   │   ├── fonts/                 # Montserrat — les mêmes faces que le harnais embarque
│   │   └── img/icons/             # les 19 glyphes du registre gouverné (FR-004b)
│   └── (autres fichiers de module selon research.md)
├── harness/                       # instrument de mesure spec-local (US3)
│   ├── tsconfig.json              # typecheck spec-local — specs/ est HORS du tsconfig racine
│   ├── render-html.mts            # rend un contrat par emit-html, clip épinglé
│   ├── capture-odoo.mts           # capture la page Odoo, MÊME clip épinglé
│   ├── compare.mts                # appelle npm run images:compare, 1 ligne par composant
│   └── selftest.mts               # le harnais se prouve sur fixtures, hors ligne
├── instance/                      # compose.yaml de l'instance jetable (quickstart §1)
├── zones/                         # les 3 tableaux des zones (FR-009), écrits avant montage
├── proofs/                        # captures, triptyques, reçus, verdicts, volumes.json
└── RAPPORT-DECISION.md            # LE livrable (FR-017, FR-018, FR-018b)
```

**Structure Decision.** Trois zones, trois régimes, et la frontière entre elles est la thèse de
la spec :

1. **Le dépôt** — `scripts/build-tokens.mjs`, `evals/run.ts`, `docs/03-token-pipeline.md`. Sous
   porte, intégralement. C'est le seul endroit où 018 modifie le produit, et c'est assumé par
   FR-005b(a).
2. **L'artefact** — `specs/018-…/module/`. Écrit à la main, hors de toute porte, **sur aucun axe
   du différentiel**. Ce n'est pas une négligence : `docs/06-parity-loop.md` n'a que trois axes
   (`code ⟷ contract`, `canvas ⟷ contract`, `canvas variables ⟷ tokens/`) et une quatrième
   surface n'en a aucun. C'est le fait qui **fonde** FR-015 — l'artefact ne va sur aucun site
   parce que rien ne le surveillerait.
3. **L'instrument** — `specs/018-…/harness/`. Spec-local comme `specs/007-…/tools/`, jamais dans
   `extract/` : les Assumptions disent que la sortie de jetons est *le seul* endroit où 018
   touche au code du dépôt. **Piège nommé** : `specs/` n'est pas dans le `include` du `tsconfig`
   racine (comme `evals/fixtures`, dont le même trou a déjà mordu ce dépôt) — d'où un
   `tsconfig.json` spec-local et un self-test hors ligne, pour que le harnais soit vérifié par
   exécution même là où `npx tsc --noEmit` ne le regarde pas.

Le module s'appelle `piqueray_ds` et vit **sous la spec** (FR-015b) : pas dans `examples/`, qui
est déjà touché par les re-pins et où un artefact que rien ne gouverne deviendrait une source de
faux rouges.

## Complexity Tracking

> Trois conséquences assumées, écrites ici pour qu'elles ne se relisent pas plus tard comme des
> oublis. Aucune n'est une violation de la constitution ; chacune est un coût choisi.

| Point | Pourquoi c'est nécessaire | Alternative plus simple, et pourquoi elle est rejetée |
|---|---|---|
| `npm run tokens` acquiert une écriture **permanente** dans le dossier d'une spec | FR-005b + FR-015b l'imposent ensemble : la sortie doit être **générée** (FR-005 interdit de recopier à la main les quelque 230 valeurs du vocabulaire) **et** vivre sous la spec (l'artefact est un reçu, hors de toute porte). Le pipeline doit donc écrire là. | (a) Écrire dans `examples/` — rejeté par FR-015b : ce dossier est déjà touché par les re-pins, un artefact non gouverné y devient une source de faux rouges. (b) Transcrire à la main — rejeté par FR-005. (c) Consommer `tokens.css` tel quel — rejeté par FR-008 (pas de préfixe). **Conséquence à porter** : si 018 est un jour archivé ou déplacé, `npm run build` casse tant que `build-tokens.mjs` n'est pas mis à jour. C'est le prix du choix, il est nommé. |
| Une spec de **dérisquage** modifie du code de dépôt | FR-005b(a) l'assume explicitement et en tire la règle : la suite de contrôles standard s'applique **intégralement** à ce point. | Ne rien toucher au dépôt et écrire les jetons à la main : c'est exactement la dérive que 015 a fermée côté code — un nombre écrit à la main ne siège sur aucun axe. |
| L'instrument de mesure vit hors du `tsconfig` racine | Les Assumptions bornent le contact avec le dépôt à un seul point ; mettre le harnais dans `extract/` en ferait un deuxième. | Le mettre dans `extract/` — rejeté ci-dessus. **Mitigation obligatoire** : `tsconfig.json` spec-local + self-test hors ligne, parce qu'un instrument que rien ne typecheck et que rien n'exécute est un instrument dont on ne sait rien. |

## Constitution Check — re-vérification après la Phase 1

La conception ne déplace aucun verdict. Trois points méritent d'être re-dits parce que la Phase 1
les a rendus plus précis, pas parce qu'ils ont changé.

- **Principe I (déterminisme)** — la conception a resserré le périmètre : le seul artefact généré
  est la sortie de jetons, et son déterminisme est prouvé par une eval dédiée (invariant I2), pas
  par `evals/golden.json`, qui ne parcourt pas `specs/`. La frontière est nette : ce qui est
  généré est prouvé déterministe ; ce qui est écrit à la main est déclaré comme tel.
- **Principe II (claims rule)** — l'ordre est câblé dans les tâches : eval d'abord
  (`evals/run.ts`), phrase de doc ensuite (`docs/03-token-pipeline.md`). L'invariant I5 est le
  contrôle adversarial : il distingue « dérivé » de « recopié une fois », ce qu'une simple
  comparaison d'existence ne ferait pas.
- **Principe V (honnêteté)** — la Phase 0 en a produit une application immédiate : deux prémisses
  de la spec sont **réfutées** et écrites comme telles (voir ci-dessus), plutôt que discrètement
  contournées au montage. Sept points restés ouverts sont listés en fin de `research.md`, chacun
  avec ce qui n'a pas pu être vérifié.

Les quatre `N/A` (VIII source Figma, X capture-avant, XI pont multi-écrivains, plus l'absence de
changement de schéma sous VI) restent des `N/A` : la conception n'a introduit ni source Figma, ni
mutation canvas, ni pont, ni champ de schéma.

## Ce que ce plan NE tranche pas

Par construction, et c'est écrit dans la spec :

- **Le tableau des zones** se décide *pendant* l'exécution, une section réelle sous les yeux
  (Assumptions). `contracts/zone-table.schema.md` fixe sa **forme** et ses invariants ; son
  **contenu** est un livrable de chantier, pas un préalable de plan.
- **Le plancher de tolérance** de SC-006 est déclaré au moment de la première mesure, sur des
  captures réelles, et consigné avec sa raison — le fixer ici serait inventer un chiffre avant de
  savoir ce qu'on mesure, exactement l'erreur que la clarification sur le seuil de décision a
  refusée.
- **La recommandation** de FR-018 : elle appartient à l'owner, au vu du rapport. Le plan
  garantit que le rapport contienne de quoi décider — jamais quoi décider.
