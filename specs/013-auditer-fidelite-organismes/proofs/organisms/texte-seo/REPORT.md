# Dossier d'audit — TexteSEO (`ds.texte-seo`)

> Généré depuis `result.json` — le Markdown n'est jamais l'autorité du verdict.

## 1. Identité

| Champ | Valeur |
|---|---|
| Sujet | `texte-seo` (TexteSEO) |
| Vague | 1 |
| Contrat | `ds.texte-seo` v1.0.0 — `contracts/texte-seo.contract.json` |
| Node master Figma | `2108:3123` |
| Référence Figma | `d9FYAUcqdcNtsuaMgLefvJ` @ version `2381581871281042338` (lecture seule) |

## 2. Audits de propreté réutilisés (Step 0)

- `specs/003-externalize-figma-components/audits/texte-seo.md`
- `specs/010-extract-molecules-organisms/audit-reuse-map.md`

## 3. Dépendance

Aucune — cet organisme ne déclare pas de dépendance de clôture.

## 4. Couverture exacte

- attendus : 39
- observés : 39
- manquants : **aucun**
- inattendus : **aucun**

## 5. Faits

| Fait | Catégorie | Représentabilité | Jambe Figma | Jambe contrat | Jambe générée | Verdict | Source localisée | Motifs |
|---|---|---|---|---|---|---|---|---|
| `texte-seo.structure.root` | structure | carry-both | {"nodeId":"2108:3123","detail":"COMPONENT root (VERTICAL, itemSpacing 32, paddingLeft/Right 89, 1728x383) > [h2 2169:629 | ds.texte-seo@1.0.0#/anatomy/root | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__root"] | **proved** | — | — |
| `texte-seo.structure.h2` | structure | carry-both | {"nodeId":"2169:6291","name":"h2","layoutMode":"NONE","itemSpacing":0,"size":"1550x30"} | ds.texte-seo@1.0.0#/anatomy/root/parts/h2 | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__h2"] | **proved** | — | — |
| `texte-seo.structure.p` | structure | carry-both | {"nodeId":"2170:6308","name":"p","layoutMode":"VERTICAL","itemSpacing":0,"size":"1550x72"} | ds.texte-seo@1.0.0#/anatomy/root/parts/p | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__p"] | **proved** | — | — |
| `texte-seo.structure.h3` | structure | carry-both | {"nodeId":"2170:6309","name":"h3","layoutMode":"NONE","itemSpacing":0,"size":"1550x25"} | ds.texte-seo@1.0.0#/anatomy/root/parts/h3 | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__h3"] | **proved** | — | — |
| `texte-seo.structure.accordion` | structure | carry-both | {"nodeId":"2108:3119","name":"accordion","layoutMode":"VERTICAL","itemSpacing":0,"size":"1550x160"} | ds.texte-seo@1.0.0#/anatomy/root/parts/accordion | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__accordion"] | **proved** | — | — |
| `texte-seo.structure.gap-root` | structure | carry-both | 2108:3123#root.itemSpacing | ds.texte-seo@1.0.0#/anatomy/root/tokens/gap | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:root.itemSpacing=32 |
| `texte-seo.structure.padding-inline-root` | structure | carry-both | 2108:3123#root.paddingInline | ds.texte-seo@1.0.0#/anatomy/root/tokens/padding-inline | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:root.paddingInline=89 |
| `texte-seo.structure.width-root` | structure | carry-both | 2108:3123#root.width | ds.texte-seo@1.0.0#/anatomy/root/literals/width | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:root.width=1728 |
| `texte-seo.content.paragraphe` | content | carry-with-named-limit | {"nodeId":"2108:3116","detail":"TEXT Paragraphe — 4 séquences Montserrat-Bold dans un calque unique (« Notre showroom », | ds.texte-seo@1.0.0#/anatomy/root/parts/p/parts/Paragraphe/text | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__Paragraphe"] | **limited** | — | representability:carry-with-named-limit |
| `texte-seo.content.sous-titre` | content | carry-both | {"nodeId":"2108:3118","characters":"Infos pratiques"} | ds.texte-seo@1.0.0#/anatomy/root/parts/h3/parts/SousTitre/text | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__SousTitre"] | **proved** | — | — |
| `texte-seo.composition.section-header` | composition | carry-both | {"nodeId":"2170:6361","mainComponent":"2090:2385","observedInstanceProperties":{"Accroche2#2169:64":false,"Titre#2090:47 | ds.texte-seo@1.0.0#/anatomy/root/parts/h2/parts/SectionHeader/component | src/components/TexteSEO/TexteSEO.tsx#[class*="SectionHeader__root"] | **proved** | — | — |
| `texte-seo.content.section-header-titre` | content | carry-both | 2108:3123#SectionHeader.Titre | ds.texte-seo@1.0.0#/anatomy/root/parts/h2/parts/SectionHeader/component/props/titre | src/components/TexteSEO/TexteSEO.tsx#[class*="SectionHeader__Titre"] | **proved** | — | — |
| `texte-seo.content.section-header-accroche` | content | carry-both | 2108:3123#SectionHeader.Accroche | ds.texte-seo@1.0.0#/anatomy/root/parts/h2/parts/SectionHeader/component/props/accroche | src/components/TexteSEO/TexteSEO.tsx#[class*="SectionHeader__Accroche"] | **proved** | — | — |
| `texte-seo.content.section-header-disposition` | property | carry-both | 2108:3123#SectionHeader.Disposition | ds.texte-seo@1.0.0#/anatomy/root/parts/h2/parts/SectionHeader/component/props/disposition | src/components/TexteSEO/TexteSEO.tsx#[class*="SectionHeader__root"] | **proved** | — | — |
| `texte-seo.composition.section-header-accroche2` | composition | carry-both | 2108:3123#SectionHeader.Accroche2 | ds.texte-seo@1.0.0#/anatomy/root/parts/h2/parts/SectionHeader/component/props/accroche2 | src/components/TexteSEO/TexteSEO.tsx#[class*="SectionHeader__Accroche"] | **divergent** | contract | contract-does-not-carry-figma-fact:SectionHeader.Accroche2=false |
| `texte-seo.content.section-header-titre-rich-text` | content | carry-with-named-limit | {"nodeId":"I2170:6361;2090:2387","detail":"TEXT Titre de l’instance — « showroom à Pepinster » (offsets 14..33) en Monts | ds.texte-seo@1.0.0#/anatomy/root/parts/h2/parts/SectionHeader/component/props/titre | src/components/TexteSEO/TexteSEO.tsx#[class*="SectionHeader__Titre"] | **limited** | — | representability:carry-with-named-limit |
| `texte-seo.visual.section-header-titre-font-size` | visual | carry-with-named-limit | 2108:3123#SectionHeader.Titre.font-size | ds.texte-seo@1.0.0#/anatomy/root/parts/h2/parts/SectionHeader/tokens/font-size | src/components/TexteSEO/TexteSEO.tsx#[class*="SectionHeader__Titre"] | **divergent** | contract | contract-does-not-carry-figma-fact:SectionHeader.Titre.font-size="24px" |
| `texte-seo.visual.section-header-titre-line-height` | visual | carry-with-named-limit | 2108:3123#SectionHeader.Titre.line-height | ds.texte-seo@1.0.0#/anatomy/root/parts/h2/parts/SectionHeader/tokens/line-height | src/components/TexteSEO/TexteSEO.tsx#[class*="SectionHeader__Titre"] | **divergent** | contract | contract-does-not-carry-figma-fact:SectionHeader.Titre.line-height="30px" |
| `texte-seo.visual.paragraphe-font-size` | visual | carry-both | 2108:3123#Paragraphe.font-size | ds.texte-seo@1.0.0#/anatomy/root/parts/p/parts/Paragraphe/tokens/font-size | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__Paragraphe"] | **divergent** | contract | contract-does-not-carry-figma-fact:Paragraphe.font-size="14px" |
| `texte-seo.visual.paragraphe-line-height` | visual | carry-both | 2108:3123#Paragraphe.line-height | ds.texte-seo@1.0.0#/anatomy/root/parts/p/parts/Paragraphe/tokens/line-height | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__Paragraphe"] | **divergent** | contract | contract-does-not-carry-figma-fact:Paragraphe.line-height="24px" |
| `texte-seo.visual.sous-titre-font-size` | visual | carry-both | 2108:3123#SousTitre.font-size | ds.texte-seo@1.0.0#/anatomy/root/parts/h3/parts/SousTitre/tokens/font-size | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__SousTitre"] | **divergent** | contract | contract-does-not-carry-figma-fact:SousTitre.font-size="20px" |
| `texte-seo.visual.sous-titre-line-height` | visual | carry-both | 2108:3123#SousTitre.line-height | ds.texte-seo@1.0.0#/anatomy/root/parts/h3/parts/SousTitre/tokens/line-height | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__SousTitre"] | **divergent** | contract | contract-does-not-carry-figma-fact:SousTitre.line-height="25px" |
| `texte-seo.visual.sous-titre-font-weight` | visual | carry-both | 2108:3123#SousTitre.font-weight | ds.texte-seo@1.0.0#/anatomy/root/parts/h3/parts/SousTitre/tokens/font-weight | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__SousTitre"] | **divergent** | contract | contract-does-not-carry-figma-fact:SousTitre.font-weight=600 |
| `texte-seo.visual.paragraphe-color` | visual | carry-both | 2108:3123#Paragraphe.color | ds.texte-seo@1.0.0#/anatomy/root/parts/p/parts/Paragraphe/tokens/color | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__Paragraphe"] | **proved** | — | — |
| `texte-seo.visual.sous-titre-color` | visual | carry-both | 2108:3123#SousTitre.color | ds.texte-seo@1.0.0#/anatomy/root/parts/h3/parts/SousTitre/tokens/color | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__SousTitre"] | **proved** | — | — |
| `texte-seo.visual.root-font-family` | visual | carry-both | 2108:3123#root.font-family | ds.texte-seo@1.0.0#/anatomy/root/tokens/font-family | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__root"] | **proved** | — | — |
| `texte-seo.property.items` | property | carry-both | {"nodeId":"2108:3119","detail":"la collection n’a AUCUN pendant Figma : le master fige 3 instances AccordionRow, le cont | ds.texte-seo@1.0.0#/props/0 | src/components/TexteSEO/TexteSEO.tsx#[class*="AccordionRow__Titre"] | **not-proven** | — | leg-unavailable:generated; agreement-unknown |
| `texte-seo.property.items-default` | property | carry-both | 2108:3123#accordion.rowCount | ds.texte-seo@1.0.0#/props/0/default | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__accordion"] | **divergent** | contract | contract-does-not-carry-figma-fact:accordion.rowCount=3 |
| `texte-seo.composition.accordion-row` | composition | carry-both | {"nodeId":"2108:3120","mainComponent":"2059:1383","observedInstanceProperties":[{"nodeId":"2108:3120","mainComponent":"2 | ds.texte-seo@1.0.0#/anatomy/root/parts/accordion/parts/AccordionRow/component | src/components/TexteSEO/TexteSEO.tsx#[class*="AccordionRow__root"] | **not-proven** | — | leg-unavailable:generated; agreement-unknown |
| `texte-seo.composition.accordion-repeat` | composition | carry-both | {"nodeId":"2108:3119","detail":"3 instances AccordionRow empilées en auto-layout VERTICAL"} | ds.texte-seo@1.0.0#/anatomy/root/parts/accordion/parts/AccordionRow/repeat/itemsProp | src/components/TexteSEO/TexteSEO.tsx#[class*="AccordionRow__root"] | **not-proven** | — | leg-unavailable:generated; agreement-unknown |
| `texte-seo.property.accordion-row-taille` | property | carry-both | 2108:3123#AccordionRow.Taille | ds.texte-seo@1.0.0#/anatomy/root/parts/accordion/parts/AccordionRow/component/props/taille | src/components/TexteSEO/TexteSEO.tsx#[class*="AccordionRow__root"] | **proved** | — | — |
| `texte-seo.content.accordion-row-1-titre` | content | carry-both | 2108:3123#AccordionRow[0].Titre | ds.texte-seo@1.0.0#/anatomy/root/parts/accordion/parts/AccordionRow/repeat/sample/0/titre | src/components/TexteSEO/TexteSEO.tsx#[class*="AccordionRow__Titre"] | **proved** | — | — |
| `texte-seo.content.accordion-row-2-titre` | content | carry-both | 2108:3123#AccordionRow[1].Titre | ds.texte-seo@1.0.0#/anatomy/root/parts/accordion/parts/AccordionRow/repeat/sample/1/titre | src/components/TexteSEO/TexteSEO.tsx#[class*="AccordionRow__Titre"] | **proved** | — | — |
| `texte-seo.content.accordion-row-3-titre` | content | carry-both | 2108:3123#AccordionRow[2].Titre | ds.texte-seo@1.0.0#/anatomy/root/parts/accordion/parts/AccordionRow/repeat/sample/2/titre | src/components/TexteSEO/TexteSEO.tsx#[class*="AccordionRow__Titre"] | **proved** | — | — |
| `texte-seo.content.accordion-row-2-contenu` | content | carry-with-named-limit | 2108:3123#AccordionRow[1].Contenu | ds.texte-seo@1.0.0#/anatomy/root/parts/accordion/parts/AccordionRow/repeat/sample/1/contenu | src/components/TexteSEO/TexteSEO.tsx#[class*="AccordionRow__Contenu"] | **proved** | — | — |
| `texte-seo.structure.accordion-row-2-etat` | structure | carry-both | 2108:3123#AccordionRow[1].Etat | ds.texte-seo@1.0.0#/anatomy/root/parts/accordion/parts/AccordionRow/repeat/sample/1/etat | src/components/TexteSEO/TexteSEO.tsx#[class*="AccordionRow__TitreOuvert"] | **divergent** | contract | contract-does-not-carry-figma-fact:AccordionRow[1].Etat="ouvert" |
| `texte-seo.visual.root` | visual | carry-both | {"nodeId":"2108:3123","export":"png@2x"} | ds.texte-seo@1.0.0#/anatomy/root | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__root"] | **divergent** | comparison | raw-over-threshold:4.7389954918240385>2.5; region-over-budget:whole:4.7389954918240385>2.5 |
| `texte-seo.semantic.paragraphe-element` | semantic | carry-both | {"nodeId":"2108:3116","detail":"TEXT layer Paragraphe"} | ds.texte-seo@1.0.0#/anatomy/root/parts/p/parts/Paragraphe/text | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__Paragraphe"] | **proved** | — | — |
| `texte-seo.semantic.sous-titre-element` | semantic | carry-both | {"nodeId":"2108:3118","detail":"TEXT layer SousTitre"} | ds.texte-seo@1.0.0#/anatomy/root/parts/h3/parts/SousTitre/text | src/components/TexteSEO/TexteSEO.tsx#[class*="TexteSEO__SousTitre"] | **proved** | — | — |

## 6. Cas et artefacts

### Cas `texte-seo-master-defaults`

| Mesure | Valeur |
|---|---|
| Verdict | **fail** (probant : true) |
| Node Figma | `2108:3123` @ v`2381581871281042338` — PNG 3456×766, sha `f917774e7233` |
| Rendu généré | `src/components/TexteSEO/TexteSEO.tsx` export `TexteSEO`, bundle `0375d39ed8aa`, fonts chargées |
| Pixels | brut 4.739 % (seuil 2.5 %) — diagnostic masqué 3.663 % (hors calcul autoritaire) |
| Régions | `whole` 4.739 %/2.5 % (109702 px signal) |
| Géométrie racine | Figma 3456×766 vs généré 3456×322 (Δ 0×-444) — fail |
| Visibilité | signal Figma 116120 px · généré 109702 px · contraste ok |
| Motifs | `raw-over-threshold:4.7389954918240385>2.5`, `region-over-budget:whole:4.7389954918240385>2.5` |

| Assertion sémantique | Sélecteur | Pointeur contractuel | Verdict |
|---|---|---|---|
| `paragraphe-element` | `[class*="TexteSEO__Paragraphe"]` | `/anatomy/root/parts/p/parts/Paragraphe/text` | pass |
| `sous-titre-element` | `[class*="TexteSEO__SousTitre"]` | `/anatomy/root/parts/h3/parts/SousTitre/text` | pass |
| `section-header-titre` | `[class*="SectionHeader__Titre"]` | `/anatomy/root/parts/h2/parts/SectionHeader/component/props/titre` | pass |

| Artefact | Chemin | sha256 | Taille |
|---|---|---|---|
| figma | `specs/013-auditer-fidelite-organismes/proofs/organisms/texte-seo/cases/texte-seo-master-defaults/figma.png` | `afceb73e3828` | 3447×756, 212217 o |
| generated | `specs/013-auditer-fidelite-organismes/proofs/organisms/texte-seo/cases/texte-seo-master-defaults/generated.png` | `34dea8bd3d7e` | 3447×756, 240828 o |
| diff | `specs/013-auditer-fidelite-organismes/proofs/organisms/texte-seo/cases/texte-seo-master-defaults/diff.png` | `ec965774b191` | 3447×756, 146008 o |
| triptych | `specs/013-auditer-fidelite-organismes/proofs/organisms/texte-seo/cases/texte-seo-master-defaults/triptych.png` | `3140465703a8` | 646055 o |
| metadata | `specs/013-auditer-fidelite-organismes/proofs/organisms/texte-seo/cases/texte-seo-master-defaults/metadata.json` | `a36188ee6470` | 5717 o |

## 7. Divergences, limites nommées et travaux reportés

- **Divergence** `texte-seo.structure.gap-root` — source : **contract** — contract-does-not-carry-figma-fact:root.itemSpacing=32
- **Divergence** `texte-seo.structure.padding-inline-root` — source : **contract** — contract-does-not-carry-figma-fact:root.paddingInline=89
- **Divergence** `texte-seo.structure.width-root` — source : **contract** — contract-does-not-carry-figma-fact:root.width=1728
- **Divergence** `texte-seo.composition.section-header-accroche2` — source : **contract** — contract-does-not-carry-figma-fact:SectionHeader.Accroche2=false
- **Divergence** `texte-seo.visual.section-header-titre-font-size` — source : **contract** — contract-does-not-carry-figma-fact:SectionHeader.Titre.font-size="24px"
- **Divergence** `texte-seo.visual.section-header-titre-line-height` — source : **contract** — contract-does-not-carry-figma-fact:SectionHeader.Titre.line-height="30px"
- **Divergence** `texte-seo.visual.paragraphe-font-size` — source : **contract** — contract-does-not-carry-figma-fact:Paragraphe.font-size="14px"
- **Divergence** `texte-seo.visual.paragraphe-line-height` — source : **contract** — contract-does-not-carry-figma-fact:Paragraphe.line-height="24px"
- **Divergence** `texte-seo.visual.sous-titre-font-size` — source : **contract** — contract-does-not-carry-figma-fact:SousTitre.font-size="20px"
- **Divergence** `texte-seo.visual.sous-titre-line-height` — source : **contract** — contract-does-not-carry-figma-fact:SousTitre.line-height="25px"
- **Divergence** `texte-seo.visual.sous-titre-font-weight` — source : **contract** — contract-does-not-carry-figma-fact:SousTitre.font-weight=600
- **Divergence** `texte-seo.property.items-default` — source : **contract** — contract-does-not-carry-figma-fact:accordion.rowCount=3
- **Divergence** `texte-seo.structure.accordion-row-2-etat` — source : **contract** — contract-does-not-carry-figma-fact:AccordionRow[1].Etat="ouvert"
- **Divergence** `texte-seo.visual.root` — source : **comparison** — raw-over-threshold:4.7389954918240385>2.5 ; region-over-budget:whole:4.7389954918240385>2.5
- **Limite** `texte-seo.content.paragraphe` — representability:carry-with-named-limit
- **Limite** `texte-seo.content.section-header-titre-rich-text` — representability:carry-with-named-limit
- **Non prouvé** `texte-seo.property.items` — leg-unavailable:generated ; agreement-unknown
- **Non prouvé** `texte-seo.composition.accordion-row` — leg-unavailable:generated ; agreement-unknown
- **Non prouvé** `texte-seo.composition.accordion-repeat` — leg-unavailable:generated ; agreement-unknown
- **Limite déclarée d'avance** `texte-seo.residu-3351px` (impact attendu : limited) — Résidu 3 351 px nommé par l'audit 003 + 005 cycle 14.
- **Limite déclarée d'avance** `texte-seo.dette-rich-text-b1` (impact attendu : limited) — Dette rich-text B1 ouverte et nommée.

## 8. Verdict

**`divergent`** — motifs : `divergent-facts:14`, `failed-cases:1`

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
