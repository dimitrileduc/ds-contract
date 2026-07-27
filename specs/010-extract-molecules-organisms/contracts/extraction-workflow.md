# Interface Contract — Workflow d'extraction par lots (le « comment » tranché)

**Principe** : 6 lots ordonnés par dépendance (research D5). Chaque lot se termine par le **sweep
complet des gates dans le worktree** (Constitution, Worktree Gates F1). Aucun lot ne démarre avec
un gate rouge.

## 0. Précondition worktree (F1) — avant L0

```bash
npm install && npx playwright install chromium   # DANS le worktree
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json   # baseline verte de départ
```

## 1. Les 6 lots

| Lot | Contenu | Sortie attendue |
|---|---|---|
| **L0** | Registre icônes 16 → 19 (détail : `icons-registry-extension.md`) + élargissement enums Button si le gate d'exactitude se déclenche (minor) + re-point éval C5 | `npm run build` vert ; axe icons de parity vert |
| **L1** | MemberPicture, PiquerayLogo | 2 contrats `atom` 1.0.0 ; 34 → compte vivant +2 |
| **L2** | 12 molécules sans dépendance inter-molécule (AccordionRow, Avantage, CarouselControls, Carte, Copyright, Field, FooterColumn, NavItem, ProductCard, Realisation, SectionHeader, Tab) — **décision slot Field nommée ici** | 12 contrats `molecule` |
| **L3** | MemberCard + toute molécule reclassée de L2 pour dépendance surprise (nommée) | molécules complètes (13) |
| **L4** | 6 organismes composant l'existant (Coordonnees, Devis, Hero, Presentation, SAV, TexteSEO) | 6 contrats `section` |
| **L5** | 6 organismes composant des molécules (Equipe, FAQ, Footer, Formulaire, Header, Reassurances) | 12 sections ; compte = 34 (ou écart nommé, FR-016) |
| **Clôture** | Réactivations d'évals (`eval-revival.md`) + table de périmètre figée + rapport de clôture (compte vivant, retraits/ajouts nommés, dette adjacente triée) | tous gates verts + compteurs re-synchronisés |

## 2. Chaîne par lot (après adoption des contrats du lot)

```bash
# 1. Génération — refusal gate par nom à chaque étape
npm run build                                   # tokens → schema → generate-components
npm run figma:plan                              # figma-sync/*.js regénérés (RENUMÉROTATION)
npm run catalog && npm run verify:catalog

# 2. Discipline orphelins (leçon 006 T037 — BLOQUANT)
git status figma-sync/                          # identifier les scripts orphelins renumérotés
git rm <orphelins>                              # dans le MÊME commit revu que l'adoption
npm run golden:update                           # re-pin explicite — le diff du manifest est le blast radius revu

# 3. Parité trois voies
#    (refresh lecture des snapshots si le canvas a bougé : pont figma-console, script v4)
npm run parity                                  # 4 axes, auto-découverte ; zéro écart actif

# 4. Contrôle visuel
#    +1 entrée PARITY_SUBJECTS par composant du lot (subjects.ts) puis :
npm run extract:figma:visual                    # run complet revu
npm run extract:figma:visual -- --write-baseline    # re-pin explicite de la baseline

# 5. Sweep complet F1 (dans le worktree)
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

## 3. Discipline d'adoption d'UNE proposition (répétée 27 fois)

1. Lire `extract/out/figma/<slug>.contract.proposed.json` + sa section `## <Set>` dans
   `figma-proposals.md` (notes + UNBOUND). Dédup par `componentSetKey` (écarter le doublon
   accent-manglé).
2. Re-confirmer l'état live du master (re-mesure — le fichier fait foi ; research D4 caveats).
3. Review : confirmer/corriger la sémantique inférée ; convention prop principale
   (`children`/`value`) ; trancher chaque stub ; résoudre chaque unbound → token existant ou
   canal `literals` (jamais inventé, rapporté).
4. Adopter : `contracts/<name>.contract.json` — `version: 1.0.0`, `category` (page DS, FR-008),
   `semantics.provenance: "extracted"`, `anchors.figma.dumpedAt`, composition par clé (FR-009).
5. Si la review révèle une capacité non couverte (grid, embed, repeat-variante) → STOP adoption :
   reclassement en exclu avec motif par organisme (`perimeter-table.md` §A→§C), jamais de
   contournement (FR-013, VI).
6. Si la review révèle un défaut de SOURCE (§VIII) → STOP adoption : bascule §4 ci-dessous.

## 4. Protocole correction de source (si re-mesure révèle un défaut)

1. **§X avant tout** : capture avant de TOUTES les cibles affectées (pas un pilote), chaque
   capture vérifiée non-vide et correctement dimensionnée.
2. Correction à la source (affordance officieuse → propriété officielle ; jamais de hack de
   calque caché). `saveVersionHistoryAsync` à chaque geste, versionIds journalisés.
3. **§XI si corrections parallèles** : zones disjointes (masters/pages/nodes distincts), agents
   interdits de capture hors zone, UN seul cycle pixel global avant/après tenu par
   l'orchestrateur (précédent 005 cycle 14 ; contre-exemple fork Réassurances rappelé).
4. Re-générer la proposition du composant corrigé (le dump refait foi), reprendre §3.
5. Si un bug n'apparaît que sur le canvas live → fix en DEUX parties : émetteur + mock
   (`scripts/plugin-engine-mock-figma.mjs`) qui rejette la classe de bug headless pour toujours
   (Constitution VII).

## 5. Règles d'arrêt (STOP conditions — nommées, jamais silencieuses)

- **Gate rouge en fin de lot** → le lot suivant ne démarre pas ; cause fixée ou waiver
  Governance time-boxé (jamais de suppression de gate, IV).
- **Proposition non reviewable** (dump obsolète, master renommé/déplacé) → re-dump du composant
  seul (route 004 : `extract:figma:rest -- <url> --target "<Master>"` puis `extract:figma`),
  nommé au journal.
- **Compte 34 non atteint** → écart nommé + justifié dans `perimeter-table.md` et le rapport de
  clôture (FR-016) ; le compte vivant fait foi.
- **Dette adjacente d'évals** (~12 cas déjà réactivables depuis 004/006) → triage owner à la
  clôture : réactivés dans 010 (mécanisme identique) ou reportés — chaque cas tranché est nommé.
