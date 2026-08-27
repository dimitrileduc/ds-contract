# Data Model — CategoriesPrincipales responsive Figma

Ce modèle décrit les décisions et preuves de la campagne 029. Il ne constitue ni
un contrat produit ni un schéma responsive global. Il dérive du modèle 028
(`specs/028-figma-responsive-hero-video/data-model.md`); chaque divergence
structurelle est un écart au gabarit consigné (voir `TemplateDeviation`).

## 1. FreshAudit

Relevé live read-only qui ouvre H1. Couvre LES DEUX masters et LES SEPT usages.

| Field | Type | Rules |
| --- | --- | --- |
| `auditId` | string | Unique dans 029 |
| `fileKey` | string | Fichier Piqueray autorisé (`d9FYAUcqdcNtsuaMgLefvJ`) |
| `fileVersionId` | string | Frais et repinné avant chaque phase live |
| `capturedAt` | datetime | UTC |
| `sectionSet` | `SectionSetIdentity` | Unique par id, key, nom et position |
| `card` | `CardIdentity` | Unique par id, key, nom et position |
| `cardExclusivity` | `CardExclusivity` | Composeurs recensés sur TOUT le fichier |
| `pageUsages` | `PageUsage[]` | Toutes les occurrences trouvées PAR POSITION |
| `sharedChildren` | object[] | Bouton/action, icônes… — read-only, inventoriés |
| `texts` / `mediaFacts` | facts | Copy, styles, images, ratios, cartes sans image |
| `primitiveInventory` | `PrimitiveCandidate[]` | Variables numériques disponibles |
| `preexistingDefects` | `AuditFinding[]` | Séparés du delta responsive (FR-008) |
| `historicalContradictions` | object[] | Vs 023/021 — chaque entrée retourne à H1 |
| `figmaWrites` / `pageWrites` | string[] | Toujours vides |

Validation: pin absent, master homonyme, usage non inventorié, contradiction
historique non nommée ou exclusivité carte non prouvée rend H1 `blocked`.

## 2. SectionSetIdentity

Identité protégée du component set gouverné.

| Field | Expected baseline (historique 023, à re-mesurer) |
| --- | --- |
| `setNodeId` | `2115:4277` jusqu'à preuve fraîche contraire acceptée |
| `name` | `CategoriesPrincipales` |
| `axes` | `Style {Superpose, Empile}` × `Colonnes {2, 3}` |
| `members` | 4 combinaisons, chacune avec nodeId + key relevés à H1 |
| `subjectKind` | section |
| `desktopReference` | rendu approuvé 021/023 de chacune des 4 combinaisons |

La mutation opère À L'INTÉRIEUR de ce set: identité du set, ids/keys des 4
membres, axes et valeurs préservés. Tout membre ou valeur d'axe AJOUTÉ est une
création déclarée, justifiée une par une à H2 (FR-015).

## 3. CardIdentity et CardExclusivity

| Field | Rules |
| --- | --- |
| `cardNodeId` | `2063:1611` (historique) — carte `Carte/Categorie`, 2 variantes Style |
| `composers` | Liste par position de TOUT nœud composant la carte, fichier entier |
| `exclusive` | `true` seulement si l'unique composeur est le set section |
| `mutableScope` | `in-scope` si `exclusive`; sinon `out-of-scope/owner-decision` |
| `extentDecisionRef` | Décision H2: adaptation interne seule OU états explicites |

Si `exclusive=false`, la campagne carte n'existe pas et la décision remonte à
l'owner (FR-002).

## 4. HistoricalEvidenceLink

Lien vers un fait 021/023 réutilisé comme contexte. Fields: `evidenceRef`,
`decisionId`, `reusedFact`, `freshAuditRef`, `status` ∈ {`confirmed`, `drifted`,
`superseded`}. Aucun fait 023 n'est `confirmed` sans re-mesure fraîche.

## 5. PageUsage (×7 attendus)

Surface de contrôle en LECTURE SEULE, une par usage recensé.

| Field | Rules |
| --- | --- |
| `instanceNodeId` | Identifié par position; baseline historique: `2115:4392, 2115:4278, 2115:4438, 2115:4297, 2115:4411, 2115:4324, 2115:4364` |
| `pageFrame` | Frame hôte sur la page `Pages` `210:325` |
| `mainComponentId` | Doit rester lié au set gouverné |
| `configuration` | Style, Colonnes, nombre de cartes, taille |
| `overrides` | Contenus, propriétés, liens digérés |
| `writePolicy` | Toujours `read-only`; `pageWrites=[]` |
| `expectedPropagatedDeltas` | Deltas visuels attendus par propagation master, chacun chiffré et attribué à une cause nommée (FR-027) |

## 6. WorkFrame

Surface Figma d'exploration séparée des masters et des Pages.

| Field | Rules |
| --- | --- |
| `frameId` | Stable pendant H2 |
| `behaviorId` | `mobile`, `desktop` ou `wide` |
| `columnsConfig` | `2` ou `3` |
| `witnessWidth` | Témoins mobile/desktop/wide; contrôles 320/390/834/1200/1440/1728 |
| `fixtureId` | `default`, `long-title`, `long-description`, `no-image`, `odd-count` |
| `authority` | Toujours `proposal` avant H2 |
| `masterMutation` / `pageMutation` | Toujours `false` |
| `disposition` | `retained`, `archived` ou `removed` après H2 |

## 7. ResponsiveBehavior

Comportement accepté de la grille et de la carte à une classe de largeur.

| Field | Mobile | Desktop | Wide |
| --- | --- | --- | --- |
| `cardsPerRow` | **1, sans réglage exposé** | 2 ou 3 selon l'énuméré | décision H2 |
| `columnsSetting` | non exposé | énuméré `{2,3}`, intitulé « desktop » | idem desktop |
| `obtainedBy` | `internal-adaptation` OU `explicit-state` (H2, preuve interne-d'abord) | idem | idem |
| `orphanRowRef` | N/A | décision H2 obligatoire (3 col. intermédiaire, 2+1) | idem |
| `fillBehaviorRef` | cas montré (cartes ≠ colonnes) | idem | idem |
| `selection` | explicite | explicite | explicite |

Chaque comportement référence des `PrimitiveBinding[]`, zéro ou plus
`TemporaryTypographyOverride`, les mêmes médias et rôles de calques.

## 8. PrimitiveCandidate / PrimitiveBinding

Identiques au modèle 028 (§7/§8): une candidate existe dans le pin frais et n'est
jamais créée par 029; une liaison approuvée enregistre `behaviorId`,
`nodeIdOrPath`, `property` (gap/padding/dimension allowlistée), `variableId`,
`variableName`, `resolvedValue`, `ownerDecisionRef`, `boundAfter`. Une valeur
correcte sans `boundVariables` exact est un échec.

## 9. TemporaryTypographyOverride

Identique au modèle 028 (§9), adapté: `sourceRole` ∈ rôles texte de la carte ou de
la section (titre, description, CTA — famille, poids, contenu et rôle inchangés),
`fields` ⊆ {`fontSize`, `lineHeight`, `textAlignHorizontal`}, `debtStatus` toujours
`pending-responsive-text-style`, `ownerDecisionRef` H2, `handoffRef` obligatoire
avant H4. Aucun Text Style global créé, modifié ou publié (FR-021).

## 10. ProtectedFact

Catégories minimales: `set-identity`, `member-ids-keys` (×4), `axis-names-values`,
`card-identity-key`, `card-variant-cardinality`, `component-properties`,
`layer-names-roles`, `image-paints`, `text-content`, `usage-instance-links` (×7),
`usage-overrides`, `page-node-identity`, `columns-enum-honesty` (énuméré 2|3,
intitulé desktop, aucun réglage mobile), `primitive-bindings`,
`responsive-overflow` (toujours `false`, jamais tolérable).

## 11. HumanGateDecision

| Gate | Contenu obligatoire de la décision |
| --- | --- |
| H1 | Source, variantes, exclusivité carte, usages, défauts préexistants, périmètre; autorise uniquement les WorkFrames |
| H2 | Comportement exact: grille, carte, valeurs, primitives, typographie, `orphanRowDecision`, `cardExtentDecision`; n'autorise pas le master |
| H3 | Plan de mutation exact des DEUX runs, captures before complètes (2 masters + 7 usages), capacités runner vertes, spike passé; autorise la première écriture |
| H4 | Source finale, limites, `parityPosture` (sur rapport de dérive réel), handoff, écarts-028; sans H4 la feature n'est pas close |

Fields et transitions identiques au modèle 028 (§11); une décision `approved` est
immuable et se supersède par référence.

## 12. RunnerCapability (extension 029)

Fields: `capabilityId`, `existingSetTopology`, `multiAxisScenarioSelection`,
`authorizedCardTarget`, `multiUsageCaptures`, `propagatedDeltaAttribution`,
`forbiddenWrites`, `negativeFixtureRefs`, `registeredEvalIds`, `status`.

`status` suit `red-fixtures → implemented → targeted-green → full-suite-green`.
H3 exige `full-suite-green` (ou l'exception nommée exacte des dettes préexistantes,
jamais renommée verte). `forbiddenWrites` contient toujours Pages, enfants partagés
hors carte, et — pour la campagne section — tout child write y compris les
instances de carte. Aucun id/nom `CategoriesPrincipales` dans le runner.

## 13. MechanismSpike

Preuve préalable, hors source autoritative, de la mutation non destructive d'un
set existant + propagation carte. Fields: `spikeId`, `environment`,
`inputTopology` (set 4 membres + carte 2 variantes), `outputTopology`,
`expectedCreatedNodeRoles` (possiblement vide), `memberIdentityBeforeAfter` (×4),
`cardIdentityBeforeAfter`, `usageLinksBeforeAfter`, `propagatedDeltaLedger`,
`scenarioCoverage` (multi-axes), `bindingCoverage`, `typographyExceptionCoverage`,
`result`, `evidenceRefs`. `result=pass` exige déclaration honnête des créations et
un second passage no-op.

## 14. MutationPlan

Plan exact présenté à H3 — UN par campagne, DEUX campagnes ordonnées.

| Field | Rules |
| --- | --- |
| `campaignRef` | `carte-categorie/run-001` PUIS `categories-principales/run-001` |
| `globalCaptureCycleRef` | Cycle §X/§XI unique: before de TOUTES les surfaces avant la PREMIÈRE écriture du premier run |
| `filePin` / `sourceBaselineRef` | Version fraîche + snapshot récupérable |
| `operations` / `expectedCreatedNodes` / `expectedChangedNodes` | Exacts, allowlistés |
| `expectedPropagatedDeltas` | Section: deltas carte attendus, attribués |
| `protectedFacts` / `rollbackRef` / `runnerCapabilityRef` / `spikeRef` / `h2DecisionRef` | Obligatoires |
| `pageWrites` | Toujours vide; aucun nœud Bouton, icône ou Page |

## 15. ProofCaptureSet et ScenarioResult

`ProofCaptureSet` ∈ {`before`, `after`, `idempotence`} couvre CHAQUE surface —
les 2 masters (par variante) et les 7 usages — avec PNG, structure, propriétés,
faits, dimensions et digest, vérifiés non vides.

`ScenarioResult`: `behaviorId`, `styleValue`, `columnsValue`, `width` ∈
{320, 390, 834, 1200, 1440, 1728}, `fixtureId` (normal, contenu long au minimum),
`rootBounds`, `descendantBounds`, `overflow=false`, `clippedBy=[]`,
`contentAccessible=true`, `mobileCardsPerRow=1` sur les témoins mobiles,
`captureRef`, `run`. La matrice minimale = 6 largeurs × {2, 3} colonnes ×
{normal, long} (FR-028, SC-002, SC-003).

## 16. ApplyReceipt et NoOpReceipt

Par campagne. Premier reçu: 100 % des créations/modifications déclarées,
`pageWrites=[]`; campagne section: `childWrites=[]` avec deltas propagés attribués.
Second reçu: operation ids `no-op`, `createdNodeIds=[]`, `changedNodeIds=[]`,
mêmes faits protégés (FR-031, SC-010, SC-011).

## 17. TemplateDeviation (écart au gabarit 028)

| Field | Rules |
| --- | --- |
| `deviationId` | Stable, séquentiel |
| `phase` | Où l'écart est apparu (A–E) |
| `template028Ref` | Le point du gabarit 028 concerné |
| `deviation` | Ce que 029 a demandé d'autre |
| `cause` | Consignée AU MOMENT de l'apparition, jamais reconstituée |
| `skillDisposition` | Ce que `component-to-responsive` doit en retenir |

Trois entrées d'office (research R12): set existant, deux masters/deux runs,
sélection multi-axes.

## 18. CampaignHandoff

Inventaire final. Fields: `behaviorObservations`, `primitiveObservations`,
`typographyDebts`, `deferredChildNeeds`, `mediaLimits`, `ownerDecisions`,
`templateDeviations`, `nonConvergenceStatus`, `parityPostureRef` (décision H4),
`regenerationGuard`, `futurePromotionScope`.

`nonConvergenceStatus` = `figma-ahead/pending-home-responsive-promotion`; la dérive
est nommée vis-à-vis de `ds.categories-principales` v1.0.0 et `ds.carte-categorie`
v1.1.0. Aucune observation n'est nommée variable, mode ou Text Style global validé.

## Relationships

```text
FreshAudit ──confirms──> SectionSetIdentity + CardIdentity/CardExclusivity
     │                        + PageUsage(×7) + PrimitiveCandidate
     └──authorizes H1──> WorkFrame ──proposes──> ResponsiveBehavior
                                           ├── PrimitiveBinding
                                           ├── TemporaryTypographyOverride
                                           ├── orphanRowDecision (H2)
                                           └── cardExtentDecision (H2)

H2 + RunnerCapability(full-suite-green) + MechanismSpike(pass)
     └──authorize review──> MutationPlan(carte → section, cycle global §X/§XI)
                                 ──H3──> ApplyReceipt(×2)
                                       ├── ProofCaptureSet(after, 2 masters + 7 usages)
                                       └── NoOpReceipt(×2) + idempotence
                                              └──H4──> CampaignHandoff + TemplateDeviation[]
```
