# Implementation Plan: Réparer la projection Figma

**Branch**: `021-figma-projection-repair` | **Date**: 2026-08-09 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/021-figma-projection-repair/spec.md`

## Summary

Réparer exactement sept cibles validées pendant la readiness 020 sans modifier leur intention :
Hero, SAV, Catégories principales, Réalisations, contrôles de Produits e-commerce, Coordonnées et
Formulaire. Le chantier corrige trois classes partagées dans l'émetteur Figma — sortie de flux des
parts absolues, transmission vivante des propriétés parent→enfant et icônes réellement pilotées par
`INSTANCE_SWAP` — puis applique deux restaurations canvas strictement locales aux organismes non
gouvernés. Un manifeste épinglé refuse toute mutation avant capture globale, protège images et
overrides par identité positionnelle, inventorie tous les consommateurs, rejoue la reconstruction
deux fois et produit un reçu owner par cible.

## Technical Context

**Language/Version**: TypeScript 6, Node.js ≥ 20; JavaScript Figma Plugin API; JSON Schema/Markdown pour les artefacts de campagne  
**Primary Dependencies**: Zod 4, tsx, API REST et Plugin API Figma, bridge figma-console existant, Playwright Core, pixelmatch/pngjs  
**Storage**: contrats JSON et registres versionnés dans Git; PNG, dumps structurels, manifests de hashes et reçus Markdown/JSON sous la spec  
**Testing**: fixtures adverses enregistrées dans `evals/run.ts`, mock Figma, build/parity/plugin checks, page/image parity, reconstruction déterministe ×2  
**Target Platform**: CLI Node headless + scripts Figma générés; session live dans le fichier `d9FYAUcqdcNtsuaMgLefvJ` épinglé par 020  
**Project Type**: bibliothèque/générateur TypeScript, plugin Figma et orchestration CLI de réparation gouvernée  
**Performance Goals**: 7/7 cibles et 100 % des usages/consommateurs comptabilisés; zéro mutation si une capture manque; deux reconstructions observablement identiques; paquet owner examinable cible par cible  
**Constraints**: aucun modèle dans le chemin; aucun fichier généré édité; ids/positions/hashes plutôt que noms; images et overrides préservés; Catégories/Réalisations restent non gouvernées; un seul writer canvas; aucune tolérance ajoutée après mesure  
**Scale/Scope**: 7 cibles directes; 8 usages Hero, 1 usage SAV, 7 usages Catégories, 3 usages Réalisations, 2 usages Produits e-commerce, 1 usage Coordonnées, 1 usage Formulaire, plus tous les consommateurs contractuels de Button/SectionHeader et tout organisme utilisant le lowering absolu

## Constitution Check

*GATE initial et recontrôlé après le design de Phase 1.*

- [x] **I. Determinism** — compilation, manifests, placement et reçus sont purs; le writer live
      exécute des scripts générés depuis des entrées versionnées. Deux reconstructions identiques
      sont comparées explicitement.
- [x] **II. Claims Rule** — chaque classe de panne reçoit d'abord une fixture rouge : absolute hors
      flux, propriété composée vivante, glyph swap visible, pin/capture/image/impact manquant et
      seconde reconstruction divergente. Les docs ne sont mises à jour qu'après les evals.
- [x] **III. Contract is the SSoT** — Hero, SAV, Coordonnées, CarouselControls et Button restent
      pilotés par leurs contrats. Formulaire corrige sa source contractuelle minimale avant
      régénération. Les gestes Catégories/Réalisations sont des restaurations explicitement hors
      contrat, bornées par la spec, pas une nouvelle vérité produit.
- [x] **IV. No hand-edited output** — `src/components/`, `figma-sync/*.js`, catalogue et schéma
      généré sont produits par `npm run build`; seuls contrat, moteur, mock, evals et sources de
      campagne sont édités.
- [x] **V. Honesty** — parent non auto-layout, pin différent, preuve illisible, propriété non
      routable, icône introuvable, image sans accueil, consommateur ouvert ou diff inattendu sont
      des refus nommés.
- [x] **VI. Additive evolution** — aucune extension de schéma composant n'est requise. Le changement
      Formulaire conserve son API et suit semver; les schémas 021 commencent à `1.0.0`.
- [x] **VII. Engine integrity** — le correctif reste browser-pur dans `core/`; chaque défaut observé
      live est enseigné au mock et enregistré dans `npm run eval`.
- [x] **VIII. Source cleanliness** — les audits 020 sont l'entrée autoritaire et un nouveau
      préflight vérifie masters et usages par position avant capture/mutation. Une divergence de
      pin ou de structure bloque le lot.
- [x] **IX. Docs-first** — capability matrix, handoff 08, preuves 016/017 et clôture 020 ont été
      consultés. Le MCP auggie est indisponible dans cette session; la lecture directe et les docs
      officielles Figma sont consignées dans [research.md](research.md).
- [x] **X. Before-capture** — chaque master, variante, usage et consommateur affecté est capturé et
      validé avant la première écriture. Le schéma interdit l'état `ready-to-apply` si une preuve
      est absente ou mal dimensionnée.
- [x] **XI. Multi-writer bridge** — N/A par décision de design : un seul writer canvas exécute tout
      le lot et un seul cycle global avant/après l'enveloppe.

**Gate post-design**: PASS. Aucun `NEEDS CLARIFICATION` ne subsiste et aucune violation ne demande
de dérogation. Le sweep complet reste la porte de clôture de l'implémentation :

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Le worktree est rendu autonome avant l'implémentation avec `npm install` puis
`npx playwright install chromium` conformément à F1.

## Project Structure

### Documentation (this feature)

```text
specs/021-figma-projection-repair/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── repair-campaign.schema.json
│   └── repair-receipt.schema.json
├── campaign/                       # manifeste et décisions créés en implémentation
├── repairs/                        # opérations ciblées Catégories/Réalisations
└── proofs/                         # captures, comparaisons et reçus immuables
```

### Source Code (repository root)

```text
core/emit-figma-script.ts                  # lowering absolute, prop forwarding, icon swap
scripts/plugin-engine-mock-figma.mjs       # sémantique live enseignée au mock
scripts/generate-figma.ts                  # régénération des scripts depuis les sources
contracts/formulaire.contract.json         # transmission explicite titre/accroche
contracts/icons.registry.json              # identités des composants d'icône, lecture
evals/fixtures/figma-projection-repair/     # cas rouges + témoins négatifs
evals/run.ts                                # enregistrement des claims

extract/figma/projection-repair/
├── types.ts                                # modèles runtime validés
├── campaign.ts                             # pins, exhaustivité, transitions/refus
├── capture.ts                              # preuves visuelles/structurelles globales
├── impact.ts                               # graphe dépendance → consommateurs
├── apply.ts                                # dry-run et application live bornée
├── verify.ts                               # après, images, idempotence, hors-zone
├── report.ts                               # reçus machine et owner
└── cli.ts                                  # interface décrite dans quickstart.md

extract/figma/{page-parity,photo-parity,state-photo,rest}/
                                              # instruments réutilisés
figma-sync/*.js                                # générés, jamais édités
src/components/**                              # générés, jamais édités
```

**Structure Decision**: le comportement reproductible rejoint l'émetteur et l'orchestrateur
générique `projection-repair`; les références, opérations directes et preuves propres à Piqueray
restent sous la spec 021. Cette frontière ferme les classes moteur sans promouvoir Catégories ou
Réalisations au rang d'organismes gouvernés.

## Design de la solution

### 0. Préflight du worktree et des autorités

Rendre le worktree autonome, charger les décisions 020 et refuser tout fichier/version/nœud qui ne
correspond pas aux pins autorisés. Construire la liste fermée des sept cibles et le graphe complet
des consommateurs depuis les contrats, les usages Figma et les qualifications Odoo 019. Le
préflight est read-only et produit le premier reçu.

### 1. Capture globale avant toute écriture

Capturer masters/variantes et tous leurs usages connus. Vérifier dimensions, décodage PNG, zone
visible et hash; relever structure, propriétés, références master→instance, overrides et peintures
IMAGE par `hostId + cheminPosition + imageHash`. Le lot ne peut pas quitter `draft` avant que la
matrice soit complète. Les fichiers desktop historiques de 020 restent des références, jamais des
substituts à la capture courante.

### 2. Fixtures rouges et correctifs du moteur

Ajouter trois familles adverses avant le code :

1. une part absolue avec insets, une part image plein parent, une boîte à position statique et un
   témoin en flux; le parent doit ignorer totalement la géométrie absolue;
2. un parent TEXT qui transmet `{prop}` à une propriété TEXT d'un enfant composé; changer l'instance
   parente doit changer le nœud visible sans détacher l'enfant;
3. une icône statique et une icône pilotée par enum `INSTANCE_SWAP`; seule la seconde devient une
   instance gouvernée et change réellement de composant.

Étendre `NodeSpec` avec les plans compilés nécessaires, exécuter les liaisons après création des
clés de propriétés suffixées et rendre les erreurs impossibles à avaler silencieusement. Enseigner
les recalculs de layout, références de propriété et swaps au mock.

### 3. Source contractuelle et régénération

Router `titre`/`accroche` de Formulaire vers SectionHeader dans le contrat, versionner le changement
et mettre à jour la documentation seulement après les evals. Régénérer toutes les sorties. Les
scripts Hero/SAV doivent maintenant porter la sortie de flux; Button doit porter de vraies instances
d'icône reliées; Coordonnées/Formulaire doivent porter les liaisons parent→enfant. Un second build
sans changement doit être byte-identique.

### 4. Dry-run de campagne

Compiler le manifeste de réparation et les opérations directes, sans mutation. Le dry-run vérifie
les pins, l'ordre des enfants, l'existence des cibles de propriété, les composants d'icône, les
accueils photo, les captures et le graphe d'impact. Il imprime le diff autorisé par cible et refuse
toute opération hors allowlist.

### 5. Application live en un lot

Exécuter par un writer unique : reconstruire/amender les dépendances partagées puis Hero, SAV,
Coordonnées et Formulaire via les scripts générés; revalider Button/CarouselControls et leurs
consommateurs; appliquer les deux opérations directes à la variante Catégories et au bloc d'en-tête
Réalisations. Les réparations directes modifient seulement les nœuds/pistes explicitement listés et
ne touchent ni contenu, ni images, ni grille.

### 6. Vérification après et impact

Recapturer exactement la matrice avant. Comparer la référence owner et l'avant courant séparément :
les zones autorisées doivent rejoindre leur référence; toutes les autres zones doivent rester
inchangées. Relever à nouveau images, overrides, ids de masters, liens d'instances et propriétés.
Chaque consommateur partagé reçoit `unchanged`, `revalidated` ou `refused`; aucun `pending` n'est
acceptable. Toute qualification Odoo 019 touchée reçoit maintien/repin explicite.

### 7. Deuxième reconstruction et idempotence

Relancer le même lot sans changer aucune entrée, recapturer et comparer à l'octet/structure. Zéro
diff observable est exigé sur géométrie, propriétés, images, instances et reçus normalisés. Le
second run doit rapporter uniquement des no-op; une différence refuse la campagne avant le gate
owner.

### 8. Gate owner et clôture

Présenter sept lignes indépendantes avec référence, avant, après, diff autorisé, zones inchangées,
images, consommateurs et limites. L'owner accepte ou refuse chaque résultat; aucun succès implicite
n'existe. Générer `repair-receipt` seulement après validation du schéma, puis exécuter le sweep
constitutionnel complet.

## Complexity Tracking

Aucune violation à justifier. La lecture directe des docs remplace uniquement le canal auggie
indisponible; elle ne modifie pas les décisions documentaires. Le writer unique rend la règle
multi-writer sans objet pour l'exécution prévue.
