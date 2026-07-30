# Dossier d'audit — Reassurances (`ds.reassurances`)

> Généré depuis `result.json` — le Markdown n'est jamais l'autorité du verdict.

## 1. Identité

| Champ | Valeur |
|---|---|
| Sujet | `reassurances` (Reassurances) |
| Vague | 2 |
| Contrat | `ds.reassurances` v1.2.0 — `contracts/reassurances.contract.json` |
| Node master Figma | `2114:3721` |
| Référence Figma | `d9FYAUcqdcNtsuaMgLefvJ` @ version `2381581871281042338` (lecture seule) |

## 2. Audits de propreté réutilisés (Step 0)

- `specs/003-externalize-figma-components/audits/reassurances.md`
- `specs/010-extract-molecules-organisms/audit-reuse-map.md`

## 3. Dépendance

Aucune — cet organisme ne déclare pas de dépendance de clôture.

## 4. Couverture exacte

- attendus : 44
- observés : 44
- manquants : **aucun**
- inattendus : **aucun**

## 5. Faits

| Fait | Catégorie | Représentabilité | Jambe Figma | Jambe contrat | Jambe générée | Verdict | Source localisée | Motifs |
|---|---|---|---|---|---|---|---|---|
| `reassurances.structure.root` | structure | carry-both | {"nodeId":"2114:3619","detail":"COMPONENT « Disposition=4 cartes » du COMPONENT_SET Reassurances 2114:3721 — la variante | ds.reassurances@1.2.0#/anatomy/root | src/components/Reassurances/Reassurances.tsx#[class*="Reassurances__root"] | **proved** | — | — |
| `reassurances.structure.root-gap` | structure | carry-both | 2114:3721#root.gap | ds.reassurances@1.2.0#/anatomy/root/literals/gap | src/components/Reassurances/Reassurances.tsx#[class*="Reassurances__root"] | **proved** | — | — |
| `reassurances.structure.root-width` | structure | carry-both | 2114:3721#root.width | ds.reassurances@1.2.0#/anatomy/root/literals/width | src/components/Reassurances/Reassurances.tsx#[class*="Reassurances__root"] | **proved** | — | — |
| `reassurances.structure.items` | structure | carry-both | {"nodeId":"2114:3613","detail":"FRAME « items » 1550x498 layoutMode=HORIZONTAL primaryAxis=CENTER itemSpacing=32 sizeH=F | ds.reassurances@1.2.0#/anatomy/root/parts/items | src/components/Reassurances/Reassurances.tsx#[class*="Reassurances__items"] | **proved** | — | — |
| `reassurances.structure.items-gap` | structure | carry-both | 2114:3721#items.gap | ds.reassurances@1.2.0#/anatomy/root/parts/items/literals/gap | src/components/Reassurances/Reassurances.tsx#[class*="Reassurances__items"] | **proved** | — | — |
| `reassurances.structure.items-fill` | structure | carry-both | 2114:3721#items.layoutSizingHorizontal | ds.reassurances@1.2.0#/anatomy/root/parts/items/layout/grow | src/components/Reassurances/Reassurances.tsx#[class*="Reassurances__items"] | **divergent** | contract | contract-does-not-carry-figma-fact:items.layoutSizingHorizontal="FILL" |
| `reassurances.structure.carte-count` | structure | carry-both | 2114:3721#items.materialised-carte-count@Disposition=4 cartes | ds.reassurances@1.2.0#/anatomy/root/parts/items/parts/Carte/repeat/sample | src/components/Reassurances/Reassurances.tsx#[class*="Reassurances__items"] | **divergent** | contract | contract-value-differs:items.materialised-carte-count@Disposition=4 cartes:[{"texte":"Respectent les normes des bâtiment |
| `reassurances.structure.carte-largeur-quatre-cartes` | structure | carry-both | {"nodeId":"2114:3614","mainComponent":"2063:1606","channel":"absoluteBoundingBox.width / layoutSizingHorizontal=FIXED"," | ds.reassurances@1.2.0#/anatomy/root/parts/items/parts/Carte | src/components/Reassurances/Reassurances.tsx#[class*="Carte__root"] | **proved** | — | — |
| `reassurances.structure.carte-largeur-cinq-cartes` | structure | carry-both | 2114:3721#Carte.width@Disposition=5 cartes | ds.reassurances@1.2.0#/anatomy/root/parts/items/parts/Carte/literalsByProp | src/components/Reassurances/Reassurances.tsx#[class*="Carte__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:Carte.width@Disposition=5 cartes="285px" |
| `reassurances.content.section-header-titre` | content | carry-both | 2114:3721#SectionHeader.Titre | ds.reassurances@1.2.0#/anatomy/root/parts/SectionHeader/component/props/titre | src/components/Reassurances/Reassurances.tsx#[class*="SectionHeader__Titre"] | **divergent** | contract | contract-value-differs:SectionHeader.Titre:[{"text":"Pourquoi choisir nos portes de garage industrielles ?"}]!="Pourquoi |
| `reassurances.content.section-header-accroche` | content | carry-both | 2114:3721#SectionHeader.Accroche | ds.reassurances@1.2.0#/anatomy/root/parts/SectionHeader/component/props/accroche | src/components/Reassurances/Reassurances.tsx#[class*="SectionHeader__Accroche"] | **proved** | — | — |
| `reassurances.content.carte-1-titre` | content | carry-both | 2114:3721#items[0].Carte.Titre | ds.reassurances@1.2.0#/anatomy/root/parts/items/parts/Carte/repeat/sample/0/titre | src/components/Reassurances/Reassurances.tsx#[class*="Carte__TitreReassurance"] | **proved** | — | — |
| `reassurances.content.carte-2-titre` | content | carry-both | 2114:3721#items[1].Carte.Titre | ds.reassurances@1.2.0#/anatomy/root/parts/items/parts/Carte/repeat/sample/1/titre | src/components/Reassurances/Reassurances.tsx#[class*="Carte__TitreReassurance"] | **proved** | — | — |
| `reassurances.content.carte-3-titre` | content | carry-both | 2114:3721#items[2].Carte.Titre | ds.reassurances@1.2.0#/anatomy/root/parts/items/parts/Carte/repeat/sample/2/titre | src/components/Reassurances/Reassurances.tsx#[class*="Carte__TitreReassurance"] | **proved** | — | — |
| `reassurances.content.carte-4-titre` | content | carry-both | 2114:3721#items[3].Carte.Titre | ds.reassurances@1.2.0#/anatomy/root/parts/items/parts/Carte/repeat/sample/3/titre | src/components/Reassurances/Reassurances.tsx#[class*="Carte__TitreReassurance"] | **proved** | — | — |
| `reassurances.content.carte-1-texte` | content | carry-both | 2114:3721#items[0].Carte.Texte | ds.reassurances@1.2.0#/anatomy/root/parts/items/parts/Carte/repeat/sample/0/texte | src/components/Reassurances/Reassurances.tsx#[class*="Carte__TexteReassurance"] | **proved** | — | — |
| `reassurances.content.carte-2-texte` | content | carry-both | 2114:3721#items[1].Carte.Texte | ds.reassurances@1.2.0#/anatomy/root/parts/items/parts/Carte/repeat/sample/1/texte | src/components/Reassurances/Reassurances.tsx#[class*="Carte__TexteReassurance"] | **proved** | — | — |
| `reassurances.content.carte-3-texte` | content | carry-both | 2114:3721#items[2].Carte.Texte | ds.reassurances@1.2.0#/anatomy/root/parts/items/parts/Carte/repeat/sample/2/texte | src/components/Reassurances/Reassurances.tsx#[class*="Carte__TexteReassurance"] | **proved** | — | — |
| `reassurances.content.carte-4-texte` | content | carry-both | 2114:3721#items[3].Carte.Texte | ds.reassurances@1.2.0#/anatomy/root/parts/items/parts/Carte/repeat/sample/3/texte | src/components/Reassurances/Reassurances.tsx#[class*="Carte__TexteReassurance"] | **proved** | — | — |
| `reassurances.content.sample-entree-orpheline` | content | carry-both | 2114:3721#items.sample[4].variante-d-origine | ds.reassurances@1.2.0#/anatomy/root/parts/items/parts/Carte/repeat/sample/4 | src/components/Reassurances/Reassurances.tsx#[class*="Carte__TitreReassurance"] | **divergent** | contract | contract-does-not-carry-figma-fact:items.sample[4].variante-d-origine="Disposition=5 cartes" |
| `reassurances.property.disposition` | property | carry-both | {"nodeId":"2114:3619","property":"Disposition","raw":"4 cartes \| QuatreCartesDeuxCta \| 5 cartes","detail":"Reassurance | ds.reassurances@1.2.0#/props/0 | src/components/Reassurances/Reassurances.tsx#[class*="Reassurances__root"] | **divergent** | generated | probe-not-projected:child-renders-a-literal |
| `reassurances.property.disposition-defaut` | property | carry-both | 2114:3721#Disposition.defaultValue (VARIANT « 4 cartes » → valeur d'enum contractuelle, mappage /props/0/bindings/figma/ | ds.reassurances@1.2.0#/props/0/default | src/components/Reassurances/Reassurances.tsx#[class*="Reassurances__root"] | **proved** | — | — |
| `reassurances.property.disposition-valeurs` | property | carry-both | 2114:3721#Disposition.variantOptions (mappage enum ↔ VARIANT) | ds.reassurances@1.2.0#/props/0/bindings/figma/values | src/components/Reassurances/Reassurances.tsx#[class*="Reassurances__root"] | **proved** | — | — |
| `reassurances.property.items-sans-defaut` | property | carry-both | 2114:3721#items.default | ds.reassurances@1.2.0#/props/1/default | src/components/Reassurances/Reassurances.tsx#[class*="Reassurances__items"] | **divergent** | contract | contract-does-not-carry-figma-fact:items.default=[{"texte":"Respectent les normes des bâtiments publics et les réglement |
| `reassurances.property.items-binding-none` | property | carry-with-named-limit | {"nodeId":"2114:3613","property":"componentPropertyDefinitions","detail":"Figma n'a aucune propriété de composant de typ | ds.reassurances@1.2.0#/props/1/bindings/figma/kind | src/components/Reassurances/Reassurances.tsx#[class*="Reassurances__items"] | **limited** | — | representability:carry-with-named-limit |
| `reassurances.composition.section-header` | composition | carry-both | {"nodeId":"2114:3612","mainComponent":"2090:2385","observedInstanceProperties":{"Accroche2#2169:64":true,"Titre#2090:47" | ds.reassurances@1.2.0#/anatomy/root/parts/SectionHeader/component | src/components/Reassurances/Reassurances.tsx#[class*="SectionHeader__root"] | **proved** | — | — |
| `reassurances.composition.section-header-disposition` | composition | carry-both | 2114:3721#SectionHeader.Disposition (VARIANT « Standard » → valeur d'enum contractuelle, mappage déclaré par ds.section- | ds.reassurances@1.2.0#/anatomy/root/parts/SectionHeader/component/props/disposition | src/components/Reassurances/Reassurances.tsx#[class*="SectionHeader__root"] | **proved** | — | — |
| `reassurances.composition.section-header-accroche2` | composition | carry-both | 2114:3721#SectionHeader.Accroche2 (BOOLEAN) | ds.reassurances@1.2.0#/anatomy/root/parts/SectionHeader/component/props/accroche2 | src/components/Reassurances/Reassurances.tsx#[class*="SectionHeader__Accroche"] | **proved** | — | — |
| `reassurances.composition.section-header-rename-accroche2-pendant` | composition | carry-with-named-limit | {"nodeId":"2114:3612","property":"Accroche2#2169:64","detail":"limite déjà nommée, source specs/010-extract-molecules-or | ds.reassurances@1.2.0#/anatomy/root/parts/SectionHeader | src/components/Reassurances/Reassurances.tsx#[class*="SectionHeader__Accroche"] | **limited** | — | representability:carry-with-named-limit |
| `reassurances.composition.carte-repeat` | composition | carry-both | {"nodeId":"2114:3614","mainComponent":"2063:1606","detail":"les 4 INSTANCE Carte 2114:3614, 2114:3615, 2114:3616, 2114:3 | ds.reassurances@1.2.0#/anatomy/root/parts/items/parts/Carte/repeat/itemsProp | src/components/Reassurances/Reassurances.tsx#[class*="Carte__root"] | **proved** | — | — |
| `reassurances.composition.carte-disposition` | composition | carry-both | 2114:3721#Carte.Disposition (VARIANT « Reassurance » → valeur d'enum contractuelle, mappage déclaré par ds.carte /props/ | ds.reassurances@1.2.0#/anatomy/root/parts/items/parts/Carte/component/props/disposition | src/components/Reassurances/Reassurances.tsx#[class*="Carte__root"] | **proved** | — | — |
| `reassurances.composition.carte-texte-propriete-partagee` | composition | carry-with-named-limit | {"nodeId":"2114:3614","property":"Texte#2063:29","detail":"limite déjà nommée, source specs/010-extract-molecules-organi | ds.reassurances@1.2.0#/anatomy/root/parts/items/parts/Carte/component | src/components/Reassurances/Reassurances.tsx#[class*="Carte__TexteReassurance"] | **limited** | — | representability:carry-with-named-limit |
| `reassurances.composition.bouton-quatre-cartes` | composition | carry-both | {"nodeId":"2114:3618","mainComponent":"28:114","observedInstanceProperties":{"Libelle#2044:28":"Contactez-nous","Style": | ds.reassurances@1.2.0#/anatomy/root/parts/BoutonQuatreCartes/component | src/components/Reassurances/Reassurances.tsx#[class*="Button__root"] | **proved** | — | — |
| `reassurances.composition.bouton-visible-when` | composition | carry-both | {"nodeId":"2114:3618","detail":"la variante « 4 cartes » matérialise BoutonQuatreCartes ; le contrat porte visibleWhen { | ds.reassurances@1.2.0#/anatomy/root/parts/BoutonQuatreCartes/visibleWhen | src/components/Reassurances/Reassurances.tsx#[class*="Button__root"] | **proved** | — | — |
| `reassurances.composition.bouton-libelle` | composition | carry-both | 2114:3721#BoutonQuatreCartes.Libelle | ds.reassurances@1.2.0#/anatomy/root/parts/BoutonQuatreCartes/component/text | src/components/Reassurances/Reassurances.tsx#[class*="Button__root"] | **proved** | — | — |
| `reassurances.composition.bouton-variant` | composition | carry-both | 2114:3721#BoutonQuatreCartes.Style (VARIANT « Outline noir » → valeur d'enum contractuelle, mappage déclaré par ds.butto | ds.reassurances@1.2.0#/anatomy/root/parts/BoutonQuatreCartes/component/props/variant | src/components/Reassurances/Reassurances.tsx#[class*="Button__root"] | **proved** | — | — |
| `reassurances.composition.bouton-icone-droite` | composition | carry-both | 2114:3721#BoutonQuatreCartes.Icone droite (BOOLEAN) | ds.reassurances@1.2.0#/anatomy/root/parts/BoutonQuatreCartes/component/props/iconRight | src/components/Reassurances/Reassurances.tsx#[class*="Button__iconRight"] | **proved** | — | — |
| `reassurances.composition.bouton-glyphe-droite` | composition | carry-both | 2114:3721#BoutonQuatreCartes.Glyphe droite (INSTANCE_SWAP) | ds.reassurances@1.2.0#/anatomy/root/parts/BoutonQuatreCartes/component/props/iconRightGlyph | src/components/Reassurances/Reassurances.tsx#[class*="Button__iconRight"] | **proved** | — | — |
| `reassurances.visual.root` | visual | carry-both | {"nodeId":"2114:3619","export":"png@2x"} | ds.reassurances@1.2.0#/anatomy/root | src/components/Reassurances/Reassurances.tsx#[class*="Reassurances__root"] | **divergent** | comparison | raw-over-threshold:38.613450729282505>2.5; region-over-budget:whole:38.613450729282505>2.5 |
| `reassurances.visual.carte-images` | visual | carry-both | 2114:3721#items[*].Carte.img.fills[0].IMAGE.imageRef | ds.reassurances@1.2.0#/anatomy/root/parts/items/parts/Carte/component/props/imageUrl | src/components/Reassurances/Reassurances.tsx#[class*="Carte__reassuranceImage"] | **divergent** | contract | contract-does-not-carry-figma-fact:items[*].Carte.img.fills[0].IMAGE.imageRef=["ab6a82d4b83b657d48c90b5e253f82459fd505bf |
| `reassurances.visual.bouton-contour` | visual | carry-both | 2114:3721#BoutonQuatreCartes.border | ds.reassurances@1.2.0#/anatomy/root/parts/BoutonQuatreCartes/literals/border | src/components/Reassurances/Reassurances.tsx#[class*="Button__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:BoutonQuatreCartes.border="2px solid {color.noir-bleute}" |
| `reassurances.semantic.root-element` | semantic | carry-both | {"nodeId":"2114:3619","detail":"COMPONENT frame sans sémantique de document (Figma n'a pas de notion d'élément HTML) ; l | ds.reassurances@1.2.0#/semantics/element | src/components/Reassurances/Reassurances.tsx#[class*="Reassurances__root"] | **proved** | — | — |
| `reassurances.semantic.section-header-titre-sans-titre-de-niveau` | semantic | carry-code-only | {"nodeId":"I2114:3612;2090:2387","detail":"calque TEXT « Titre » du SectionHeader — Figma ne peut exprimer aucun niveau  | ds.reassurances@1.2.0#/anatomy/root/parts/SectionHeader/component/props/titre | src/components/Reassurances/Reassurances.tsx#[class*="SectionHeader__Titre"] | **limited** | — | representability:carry-code-only |
| `reassurances.semantic.carte-texte-segments` | semantic | carry-both | {"nodeId":"I2114:3614;2063:1610","detail":"calque TEXT « Texte » de la première carte, characterStyleOverrides = [] et s | ds.reassurances@1.2.0#/anatomy/root/parts/items/parts/Carte/repeat/sample/0/texte | src/components/Reassurances/Reassurances.tsx#[class*="Carte__TexteReassurance"] | **proved** | — | — |

## 6. Cas et artefacts

### Cas `reassurances-disposition-4-cartes`

| Mesure | Valeur |
|---|---|
| Verdict | **fail** (probant : true) |
| Node Figma | `2114:3619` @ v`2381581871281042338` — PNG 3104×4902, sha `781f59cb8135` |
| Rendu généré | `src/components/Reassurances/Reassurances.tsx` export `Reassurances`, bundle `341a2ea1d3be`, fonts chargées |
| Pixels | brut 38.613 % (seuil 2.5 %) — diagnostic masqué 37.323 % (hors calcul autoritaire) |
| Régions | `whole` 38.613 %/2.5 % (389100 px signal) |
| Géométrie racine | Figma 3104×4902 vs généré 3100×1462 (Δ -4×-3440) — fail |
| Visibilité | signal Figma 7180924 px · généré 389100 px · contraste ok |
| Motifs | `raw-over-threshold:38.613450729282505>2.5`, `region-over-budget:whole:38.613450729282505>2.5` |

| Assertion sémantique | Sélecteur | Pointeur contractuel | Verdict |
|---|---|---|---|
| `section-header-titre` | `[class*="SectionHeader__Titre"]` | `/anatomy/root/parts/SectionHeader/component/props/titre` | pass |
| `section-header-accroche` | `[class*="SectionHeader__Accroche"]` | `/anatomy/root/parts/SectionHeader/component/props/accroche` | pass |
| `carte-1-titre` | `[class*="Carte__TitreReassurance"]` | `/anatomy/root/parts/items/parts/Carte/repeat/sample/0/titre` | pass |
| `carte-1-texte` | `[class*="Carte__TexteReassurance"]` | `/anatomy/root/parts/items/parts/Carte/repeat/sample/0/texte` | pass |
| `bouton-libelle-defaut-de-l-enfant` | `[class*="Button__root"]` | `/anatomy/root/parts/BoutonQuatreCartes/component` | pass |

| Probe de projection (D6) | Prop | Valeur injectée | Valeur observée dans le DOM | Projetée |
|---|---|---|---|---|
| `reassurances.property.disposition` | `disposition` | "5Cartes" | Plus de 50 ans d’expériencePourquoi choisir nos portes de garage industrielles ?Sécurité et conformitéRespectent les nor | **non** |

| Artefact | Chemin | sha256 | Taille |
|---|---|---|---|
| figma | `specs/013-auditer-fidelite-organismes/proofs/organisms/reassurances/cases/reassurances-disposition-4-cartes/figma.png` | `3406e9233385` | 3110×4898, 9932797 o |
| generated | `specs/013-auditer-fidelite-organismes/proofs/organisms/reassurances/cases/reassurances-disposition-4-cartes/generated.png` | `a2286b469be1` | 3110×4898, 300854 o |
| diff | `specs/013-auditer-fidelite-organismes/proofs/organisms/reassurances/cases/reassurances-disposition-4-cartes/diff.png` | `a405724eae29` | 3110×4898, 749734 o |
| triptych | `specs/013-auditer-fidelite-organismes/proofs/organisms/reassurances/cases/reassurances-disposition-4-cartes/triptych.png` | `cb7f12b7db0a` | 11302160 o |
| metadata | `specs/013-auditer-fidelite-organismes/proofs/organisms/reassurances/cases/reassurances-disposition-4-cartes/metadata.json` | `f877a14d132a` | 8016 o |

## 7. Divergences, limites nommées et travaux reportés

- **Divergence** `reassurances.structure.items-fill` — source : **contract** — contract-does-not-carry-figma-fact:items.layoutSizingHorizontal="FILL"
- **Divergence** `reassurances.structure.carte-count` — source : **contract** — contract-value-differs:items.materialised-carte-count@Disposition=4 cartes:[{"texte":"Respectent les normes des bâtiments publics et les réglementations pompiers.","titre":"Sécurité et conformité","imageUrl":""},{"texte":"Conçues pour recevoir tout type de bardage (Renson, Trespa, Alubond, Bois ou Eternit).","titre":"Intégration parfaite","imageUrl":""},{"texte":"Ouverture silencieuse, fluide et ultra-rapide jusqu’à 1 m/s pour un confort optimal.","titre":"Moteur performant","imageUrl":""},{"texte":"Réactivité maximale garantie grâce à nos techniciens et notre important stock de pièces.","titre":"SAV & maintenance dédiés","imageUrl":""}]!=4
- **Divergence** `reassurances.structure.carte-largeur-cinq-cartes` — source : **contract** — contract-does-not-carry-figma-fact:Carte.width@Disposition=5 cartes="285px"
- **Divergence** `reassurances.content.section-header-titre` — source : **contract** — contract-value-differs:SectionHeader.Titre:[{"text":"Pourquoi choisir nos portes de garage industrielles ?"}]!="Pourquoi choisir nos portes de garage industrielles ?"
- **Divergence** `reassurances.content.sample-entree-orpheline` — source : **contract** — contract-does-not-carry-figma-fact:items.sample[4].variante-d-origine="Disposition=5 cartes"
- **Divergence** `reassurances.property.disposition` — source : **generated** — probe-not-projected:child-renders-a-literal
- **Divergence** `reassurances.property.items-sans-defaut` — source : **contract** — contract-does-not-carry-figma-fact:items.default=[{"texte":"Respectent les normes des bâtiments publics et les réglementations pompiers.","titre":"Sécurité et conformité"},{"texte":"Conçues pour recevoir tout type de bardage (Renson, Trespa, Alubond, Bois ou Eternit).","titre":"Intégration parfaite"},{"texte":"Ouverture silencieuse, fluide et ultra-rapide jusqu’à 1 m/s pour un confort optimal.","titre":"Moteur performant"},{"texte":"Réactivité maximale garantie grâce à nos techniciens et notre important stock de pièces.","titre":"SAV & maintenance dédiés"}]
- **Divergence** `reassurances.visual.root` — source : **comparison** — raw-over-threshold:38.613450729282505>2.5 ; region-over-budget:whole:38.613450729282505>2.5
- **Divergence** `reassurances.visual.carte-images` — source : **contract** — contract-does-not-carry-figma-fact:items[*].Carte.img.fills[0].IMAGE.imageRef=["ab6a82d4b83b657d48c90b5e253f82459fd505bf","8d05df2058fe88fa4b14e4472c9746f03fd100a2","d00de3d48206b57be5125a2d01e8595d3eca56de","7bd2daf5061e3af6ff4a671f8eca2be1bc10b6fb"]
- **Divergence** `reassurances.visual.bouton-contour` — source : **contract** — contract-does-not-carry-figma-fact:BoutonQuatreCartes.border="2px solid {color.noir-bleute}"
- **Limite** `reassurances.property.items-binding-none` — representability:carry-with-named-limit
- **Limite** `reassurances.composition.section-header-rename-accroche2-pendant` — representability:carry-with-named-limit
- **Limite** `reassurances.composition.carte-texte-propriete-partagee` — representability:carry-with-named-limit
- **Limite** `reassurances.semantic.section-header-titre-sans-titre-de-niveau` — representability:carry-code-only
- **Limite déclarée d'avance** `reassurances.carte.residu-canvas-3488px` (impact attendu : limited) — Résidu canvas 3 488 px de Carte, composée en répétition par Reassurances.

## 8. Verdict

**`divergent`** — motifs : `divergent-facts:10`, `failed-cases:1`

Règle d'agrégation appliquée (fail-closed, data-model §10) :

```text
blocked    si dependencyOpen == false
divergent  sinon si au moins un fait/cas est divergent/fail
not-proven sinon si couverture inexacte ou preuve non probante
limited    sinon si au moins un fait est limited
proved     sinon si tous les faits requis et cas sont proved/pass
```

## 9. Historique initial → remédié

Aucun — aucune remédiation locale n'a été appliquée à cet organisme.
