# Plan de capacité runner — FR-032 / FR-033

**Feature :** `028-figma-responsive-hero-video`  
**Statut :** plan de test fondation; aucune capacité n'est encore revendiquée  
**Portée :** runner Figma générique, transport Bridge, fixtures, evals et documentation interne

## Baseline mécanique observée

| Surface actuelle | Capacité présente | Lacune bloquante pour 028 |
|---|---|---|
| `types.ts` | campagne v2 mono-composant, variantes attendues, largeurs, faits protégés | aucun modèle de set+membre historique, créations attendues, scénario, binding ou override typographique local |
| `campaign.ts` | cible unique, Page operation refusée, protections minimales, captures/gates | accepte les champs supplémentaires et un mécanisme inconnu sans les qualifier; aucune allowlist de créations, membres, bindings, typographie ou enfants |
| `apply.ts` | plan borné par opérations déclarées et état `ready-to-apply` | recopie l'opération sans comparer créations prévues/réelles ni sélection de présentation |
| `bridge-script.ts` | Container, `set-properties`, réordre, generated amend, reporting created/changed de base | pas de transition générique standalone→set; `generated-amend` annonce toujours zéro création; pas de Compact/Desktop créés honnêtement |
| `facts.ts` | cardinalité/noms de variantes et faits texte/média existants | ne sépare pas identité additive du set, membre Wide historique, bindings effectifs et exceptions locales par composition |
| `capture.ts` | resize et contrôle de plusieurs largeurs d'un root | ne sélectionne pas explicitement `Presentation`; ne joue pas les fixtures de contenu par composition |
| `apply-receipt.ts` | `createdNodeIds`, `changedNodeIds`, `pageWrites=[]`, second passage no-op | aucune égalité avec une liste de créations attendues; aucune détection de création cachée, rôle créé, child write ou composition active |
| `verify.ts` / rapport | comparaison des canaux protégés existants | aucune vérification set + Wide, noms/rôles communs, binding attaché, override local allowlisté ou matrice composition×fixture |

Conclusion : les contrôles Page et no-op existants sont des briques utiles, mais
ils ne suffisent pas à satisfaire FR-032/FR-033. Une sortie verte actuelle ne
doit pas être interprétée comme preuve de la transition responsive.

## Vocabulaire additif requis

Les champs sont génériques et ne contiennent aucun id ou nom propre à HeroVideo.

| Bloc | Champs minimaux |
|---|---|
| `componentSetTopology` | `propertyName`, `historicalMember`, `createdMembers`, `preservedMemberNodeId`, `preservedMemberKey`, `expectedMemberNames`, `setIdentityPolicy` |
| `expectedCreates` | `role`, `operationId`, `count`, `declaredName`; node id absent avant apply puis obligatoire dans le reçu |
| `presentationScenarios` | `scenarioId`, `presentationValue`, `width`, `height`, `fixtureId`, `expectedOverflow=false` |
| `primitiveBindings` | `presentationValue`, `nodePath`, `property`, `variableId`, `variableName`, `resolvedValue` |
| `typographyOverrides` | `presentationValue`, `nodePath`, `sourceRole`, `sourceTextStyleId`, `allowedFields`, `before`, `after`, `debtStatus`, `ownerDecisionRef` |
| `writeBoundary` | `allowedParentNodeIds`, `readOnlySurfaceNodeIds`, `protectedDependencyIds`, `forbiddenNodeIds`, `pageWrites=[]`, `childWrites=[]` |
| reçu live | `expectedCreatedRoles`, `createdNodes[{nodeId,role}]`, `changedNodeIds`, `pageWrites`, `childWrites`, `selectedPresentationByScenario`, `bindingFacts`, `typographyFacts` |

Le membre historique et le nouveau set sont deux identités distinctes : le set
est additif; le membre Wide conserve son node id et sa key. Les créations
Compact/Desktop/set doivent être déclarées avant apply puis reliées à leurs node
ids réels. Une création sans rôle attendu est refusée.

## Mapping FR-032 → capacité → preuve

| Exigence | Capacité attendue | Fixture rouge | Eval stable | Critère vert |
|---|---|---|---|---|
| Component set explicite | Former un set à trois membres en adoptant le composant historique comme Wide | `evals/fixtures/figma-responsive-component-set-check.ts` | `figma-responsive-component-set-declared-creates` | propriété `Presentation`; exactement Compact/Desktop/Wide; id/key Wide inchangés |
| Créations honnêtes | Déclarer set, Compact et Desktop puis comparer exactement les créations du reçu | même fixture | même eval | rôles et compte exacts; aucun id créé caché; second passage `createdNodeIds=[]` |
| Sélection explicite | Choisir une présentation avant chaque capture/mesure | `evals/fixtures/figma-responsive-presentation-scenarios-check.ts` | `figma-responsive-presentation-scenarios-explicit` | composition réellement active égale au scénario aux contrôles 320/390/834/1200/1440/1728 et paysage court |
| Fixtures de contenu | Jouer défaut, titre long et CTA long sans Page write | même fixture | même eval | chaque couple scénario/fixture possède bounds descendants, clipping et accessibilité |
| Bindings de primitives | Appliquer et inspecter le `boundVariables` exact de chaque propriété allowlistée | `evals/fixtures/figma-responsive-bindings-and-typography-check.ts` | `figma-responsive-bindings-typography-allowlisted` | variable id/nom/valeur attendus; binding encore attaché after et idempotence |
| Typographie locale | Autoriser seulement `fontSize`, `lineHeight`, `textAlignHorizontal` sur les compositions et paths déclarés | même fixture | même eval | famille, poids, copy et rôle préservés; Wide inchangé; dette `pending-responsive-text-style` présente |

## Mapping FR-033 → refus durable

| Classe de défaut | Diagnostic stable attendu | Fixture/eval | Refus obligatoire |
|---|---|---|---|
| Capacité ad hoc HeroVideo | `responsive-capability-not-generic` | les quatre fixtures / revue des payloads | aucun id Figma, nom HeroVideo ou largeur Piqueray codé dans le runner |
| Mécanisme ou champ absent de l'allowlist | `responsive-operation-not-allowlisted` | component-set + bindings | refus avant émission Bridge |
| Création non déclarée ou rôle/count différent | `unexpected-created-node` | component-set | refus du reçu first; jamais normalisé vers une liste vide |
| Mauvaise présentation active | `presentation-not-selected` | scenarios | scénario rouge même si le root redimensionné tient |
| Binding absent/détaché/mauvaise variable | `primitive-binding-detached` | bindings/typography | valeur résolue correcte insuffisante; binding exact obligatoire |
| Champ typographique, path ou composition non autorisé | `typography-field-not-allowlisted` | bindings/typography | refus avant écriture; Wide, famille, poids et contenu intouchables |
| Écriture Page/Home/Header | `page-write-forbidden` | `evals/fixtures/figma-responsive-write-boundary-idempotence-check.ts` / `figma-responsive-boundary-idempotence` | refus avant mutation et reçu avec `pageWrites=[]` |
| Mutation/reconfiguration du Button ou d'un enfant | `shared-child-write-forbidden` | même fixture/eval | refus d'un node id/path protégé, y compris propriété d'instance |
| Second passage crée ou change | `second-pass-not-noop` | même fixture/eval | toutes opérations `no-op`, créations/modifications/Page/enfant vides |

## Matrice minimale des scénarios

| Cas | Présentation explicite | Fixtures obligatoires |
|---|---|---|
| 320 | Compact | default, long-title, long-cta |
| 390 | Compact | default, long-title, long-cta |
| 834 | Compact | default, long-title, long-cta |
| 1200 | Desktop | default, long-title, long-cta |
| 1440 | Wide | default, long-title, long-cta |
| 1728 | Wide | default, long-title, long-cta |
| paysage court | Compact | short-landscape et contenus longs pertinents |

Chaque résultat porte `selectedPresentation`, root bounds, descendant bounds,
`overflow`, `clippedBy`, `contentAccessible`, `posterCoverage` et une référence
de capture. Un resize sans sélection explicite est un échec de preuve.

## Ordre TDD et gate d'utilisation

1. T021–T024 ajoutent les quatre fixtures et observent leur échec contre la
   baseline actuelle.
2. T025 enregistre exactement les quatre IDs d'eval ci-dessus avec diagnostics
   visibles.
3. T026–T035 implémentent le vocabulaire, la validation, le plan, le Bridge,
   les faits, captures, reçus et vérifications sans logique HeroVideo.
4. T037 exige les quatre evals vertes; T038 exige la suite complète et les deux
   typechecks verts.
5. Le mechanism spike doit réussir deux fois, dont un second passage strictement
   no-op, avant que la capacité puisse entrer dans la campagne live.

Avant ces preuves, le mécanisme `responsive-component-set` déclaré dans
`run-003/campaign.json` reste volontairement non exécutable et H3 reste bloqué.
