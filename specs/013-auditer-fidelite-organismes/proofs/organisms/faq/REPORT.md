# Dossier d'audit — FAQ (`ds.faq`)

> Généré depuis `result.json` — le Markdown n'est jamais l'autorité du verdict.

## 1. Identité

| Champ | Valeur |
|---|---|
| Sujet | `faq` (FAQ) |
| Vague | 2 |
| Contrat | `ds.faq` v1.1.0 — `contracts/faq.contract.json` |
| Node master Figma | `2104:2914` |
| Référence Figma | `d9FYAUcqdcNtsuaMgLefvJ` @ version `2381581871281042338` (lecture seule) |

## 2. Audits de propreté réutilisés (Step 0)

- `specs/003-externalize-figma-components/audits/faq.md`
- `specs/010-extract-molecules-organisms/audit-reuse-map.md`

## 3. Dépendance

Aucune — cet organisme ne déclare pas de dépendance de clôture.

## 4. Couverture exacte

- attendus : 34
- observés : 34
- manquants : **aucun**
- inattendus : **aucun**

## 5. Faits

| Fait | Catégorie | Représentabilité | Jambe Figma | Jambe contrat | Jambe générée | Verdict | Source localisée | Motifs |
|---|---|---|---|---|---|---|---|---|
| `faq.structure.root` | structure | carry-both | {"nodeId":"2104:2914","detail":"COMPONENT autonome \"FAQ\" (aucun COMPONENT_SET — 003 le note : « pas de variant réel, j | ds.faq@1.1.0#/anatomy/root | src/components/FAQ/FAQ.tsx#[class*="FAQ__root"] | **proved** | — | — |
| `faq.structure.root-direction` | structure | carry-both | 2104:2914#root.layoutMode | ds.faq@1.1.0#/anatomy/root/layout/direction | src/components/FAQ/FAQ.tsx#[class*="FAQ__root"] | **proved** | — | — |
| `faq.structure.root-align` | structure | carry-both | 2104:2914#root.counterAxisAlignItems | ds.faq@1.1.0#/anatomy/root/layout/align | src/components/FAQ/FAQ.tsx#[class*="FAQ__root"] | **proved** | — | — |
| `faq.structure.gap-root` | structure | carry-both | 2104:2914#root.gap | ds.faq@1.1.0#/anatomy/root/literals/gap | src/components/FAQ/FAQ.tsx#[class*="FAQ__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:root.gap="48px" |
| `faq.structure.padding-root-left` | structure | carry-both | 2104:2914#root.padding-left | ds.faq@1.1.0#/anatomy/root/literals/padding-left | src/components/FAQ/FAQ.tsx#[class*="FAQ__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:root.padding-left="89px" |
| `faq.structure.padding-root-right` | structure | carry-both | 2104:2914#root.padding-right | ds.faq@1.1.0#/anatomy/root/literals/padding-right | src/components/FAQ/FAQ.tsx#[class*="FAQ__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:root.padding-right="89px" |
| `faq.structure.root-width` | structure | carry-both | 2104:2914#root.width | ds.faq@1.1.0#/anatomy/root/literals/width | src/components/FAQ/FAQ.tsx#[class*="FAQ__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:root.width="1728px" |
| `faq.structure.accordion` | structure | carry-both | {"nodeId":"2104:2908","detail":"FRAME \"accordion\" 1550x248 (= 64 + 120 + 64, les trois lignes sans écart), layoutMode= | ds.faq@1.1.0#/anatomy/root/parts/accordion | src/components/FAQ/FAQ.tsx#[class*="FAQ__accordion"] | **proved** | — | — |
| `faq.structure.accordion-direction` | structure | carry-both | 2104:2914#accordion.layoutMode | ds.faq@1.1.0#/anatomy/root/parts/accordion/layout/direction | src/components/FAQ/FAQ.tsx#[class*="FAQ__accordion"] | **proved** | — | — |
| `faq.structure.accordion-align` | structure | carry-both | 2104:2914#accordion.counterAxisAlignItems | ds.faq@1.1.0#/anatomy/root/parts/accordion/layout/align | src/components/FAQ/FAQ.tsx#[class*="FAQ__accordion"] | **proved** | — | — |
| `faq.structure.accordion-fill` | structure | carry-both | 2104:2914#accordion.layoutSizingHorizontal=FILL | ds.faq@1.1.0#/anatomy/root/parts/accordion/layout/grow | src/components/FAQ/FAQ.tsx#[class*="FAQ__accordion"] | **divergent** | contract | contract-does-not-carry-figma-fact:accordion.layoutSizingHorizontal=FILL=true |
| `faq.structure.accordion-row-fill` | structure | carry-both | 2104:2914#accordion.AccordionRow[*].layoutSizingHorizontal | ds.faq@1.1.0#/anatomy/root/parts/accordion/parts/AccordionRow/literals/width | src/components/FAQ/FAQ.tsx#[class*="AccordionRow__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:accordion.AccordionRow[*].layoutSizingHorizontal="FILL" |
| `faq.structure.section-header-height` | structure | carry-both | 2104:2914#SectionHeader.height (layoutSizingVertical=FIXED) | ds.faq@1.1.0#/anatomy/root/parts/SectionHeader/literals/height | src/components/FAQ/FAQ.tsx#[class*="SectionHeader__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:SectionHeader.height (layoutSizingVertical=FIXED)="50px" |
| `faq.structure.ligne3-cible-visibilite` | structure | carry-both | 2104:2914#accordion.AccordionRow[2].visible ← Ligne 3#2104:59 | ds.faq@1.1.0#/anatomy/root/parts/accordion/parts/AccordionRow/visibleWhen | src/components/FAQ/FAQ.tsx#[class*="AccordionRow__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:accordion.AccordionRow[2].visible ← Ligne 3#2104:59={"prop":"ligne3","equals":true} |
| `faq.structure.button-libelle-carrier` | structure | carry-both | {"nodeId":"I2104:2912;28:116","detail":"TEXT \"Libellé\" 155x22 HUG/HUG, characters=\"Contactez-nous\", style Montserrat | ds.faq@1.1.0#/anatomy/root/parts/Bouton/component | src/components/FAQ/FAQ.tsx#[class*="Button__label"] | **proved** | — | — |
| `faq.property.ligne3` | property | carry-both | {"nodeId":"2104:2914","property":"Ligne 3#2104:59","raw":"BOOLEAN, defaultValue true","detail":"côté Figma la propriété  | ds.faq@1.1.0#/props/1 | src/components/FAQ/FAQ.tsx#[class*="AccordionRow__root"] | **divergent** | generated | boolean-prop-did-not-materialise-its-subtree |
| `faq.property.items` | property | carry-with-named-limit | {"nodeId":"2104:2914","property":"componentPropertyDefinitions","raw":"AUCUNE propriété de collection — le master n'expo | ds.faq@1.1.0#/props/0 | src/components/FAQ/FAQ.tsx#[class*="AccordionRow__Titre"] | **divergent** | generated | probe-not-projected:child-renders-a-literal |
| `faq.content.accordion-rows-default` | content | carry-with-named-limit | 2104:2914#accordion.children.count (défaut du master) | ds.faq@1.1.0#/props/0/default | src/components/FAQ/FAQ.tsx#[class*="AccordionRow__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:accordion.children.count (défaut du master)=3 |
| `faq.content.accordion-rows-sample` | content | carry-both | 2104:2914#accordion.AccordionRow[0..2].{Contenu, Titre} | ds.faq@1.1.0#/anatomy/root/parts/accordion/parts/AccordionRow/repeat/sample | src/components/FAQ/FAQ.tsx#[class*="AccordionRow__Titre"] | **proved** | — | — |
| `faq.composition.accordion-row` | composition | carry-both | {"nodeId":"2104:2909","mainComponent":"2059:1373","observedInstanceProperties":{"Contenu#2059:18":"Réponse","Titre#2059: | ds.faq@1.1.0#/anatomy/root/parts/accordion/parts/AccordionRow/component | src/components/FAQ/FAQ.tsx#[class*="AccordionRow__root"] | **not-proven** | — | leg-unavailable:generated; agreement-unknown |
| `faq.composition.accordion-row-taille` | composition | carry-both | 2104:2914#accordion.AccordionRow[*].Taille | ds.faq@1.1.0#/anatomy/root/parts/accordion/parts/AccordionRow/component/props/taille | src/components/FAQ/FAQ.tsx#[class*="AccordionRow__root"] | **proved** | — | — |
| `faq.composition.accordion-row-etat` | composition | carry-both | 2104:2914#accordion.AccordionRow[1].Etat | ds.faq@1.1.0#/anatomy/root/parts/accordion/parts/AccordionRow/component/props/etat | src/components/FAQ/FAQ.tsx#[class*="AccordionRow__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:accordion.AccordionRow[1].Etat="ouvert" |
| `faq.composition.section-header` | composition | carry-both | {"nodeId":"2104:2907","mainComponent":"2090:2385","observedInstanceProperties":{"Accroche2#2169:64":true,"Titre#2090:47" | ds.faq@1.1.0#/anatomy/root/parts/SectionHeader/component | src/components/FAQ/FAQ.tsx#[class*="SectionHeader__root"] | **proved** | — | — |
| `faq.composition.section-header-titre` | composition | carry-both | 2104:2914#SectionHeader.Titre | ds.faq@1.1.0#/anatomy/root/parts/SectionHeader/component/props/titre | src/components/FAQ/FAQ.tsx#[class*="SectionHeader__Titre"] | **divergent** | contract | contract-value-differs:SectionHeader.Titre:[{"text":"Questions fréquentes"}]!="Questions fréquentes" |
| `faq.composition.section-header-accroche` | composition | carry-both | 2104:2914#SectionHeader.Accroche | ds.faq@1.1.0#/anatomy/root/parts/SectionHeader/component/props/accroche | src/components/FAQ/FAQ.tsx#[class*="SectionHeader__Accroche"] | **proved** | — | — |
| `faq.composition.section-header-disposition` | composition | carry-both | 2104:2914#SectionHeader.Disposition | ds.faq@1.1.0#/anatomy/root/parts/SectionHeader/component/props/disposition | src/components/FAQ/FAQ.tsx#[class*="SectionHeader__root"] | **proved** | — | — |
| `faq.composition.section-header-accroche2` | composition | carry-both | 2104:2914#SectionHeader.Accroche2 (BOOLEAN) | ds.faq@1.1.0#/anatomy/root/parts/SectionHeader/component/props/accroche2 | src/components/FAQ/FAQ.tsx#[class*="SectionHeader__Accroche"] | **divergent** | contract | contract-does-not-carry-figma-fact:SectionHeader.Accroche2 (BOOLEAN)=true |
| `faq.composition.button` | composition | carry-both | {"nodeId":"2104:2912","mainComponent":"28:114","observedInstanceProperties":{"Libelle#2044:28":"Contactez-nous","Style": | ds.faq@1.1.0#/anatomy/root/parts/Bouton/component | src/components/FAQ/FAQ.tsx#[class*="Button__root"] | **proved** | — | — |
| `faq.composition.button-libelle` | composition | carry-both | 2104:2914#Bouton.Libelle | ds.faq@1.1.0#/anatomy/root/parts/Bouton/component/text | src/components/FAQ/FAQ.tsx#[class*="Button__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:Bouton.Libelle="Contactez-nous" |
| `faq.composition.button-variant` | composition | carry-both | 2104:2914#Bouton.Style | ds.faq@1.1.0#/anatomy/root/parts/Bouton/component/props/variant | src/components/FAQ/FAQ.tsx#[class*="Button__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:Bouton.Style="outilneNoir" |
| `faq.composition.button-icone-droite` | composition | carry-both | 2104:2914#Bouton.Icone droite (BOOLEAN) | ds.faq@1.1.0#/anatomy/root/parts/Bouton/component/props/iconRight | src/components/FAQ/FAQ.tsx#[class*="Button__iconRight"] | **divergent** | contract | contract-does-not-carry-figma-fact:Bouton.Icone droite (BOOLEAN)=true |
| `faq.visual.root` | visual | carry-both | {"nodeId":"2104:2914","export":"png@2x","detail":"référence pixel du master entier, 1728x448 à deviceScaleFactor 2. Limi | ds.faq@1.1.0#/anatomy/root | src/components/FAQ/FAQ.tsx#[class*="FAQ__root"] | **divergent** | comparison | raw-over-threshold:4.366393293238564>2.5; region-over-budget:whole:4.366393293238564>2.5 |
| `faq.visual.root-font-family` | visual | carry-both | 2104:2914#root.font-family (fontName de chaque calque TEXT descendant) | ds.faq@1.1.0#/anatomy/root/tokens/font-family | src/components/FAQ/FAQ.tsx#[class*="FAQ__root"] | **proved** | — | — |
| `faq.semantic.root-element` | semantic | carry-code-only | {"nodeId":"2104:2914","detail":"La matrice ne comporte AUCUNE ligne pour le choix de l'élément HTML : un node Figma n'a  | ds.faq@1.1.0#/semantics/element | src/components/FAQ/FAQ.tsx#[class*="FAQ__root"] | **limited** | — | representability:carry-code-only |

## 6. Cas et artefacts

### Cas `faq-master-defaults`

| Mesure | Valeur |
|---|---|
| Verdict | **fail** (probant : true) |
| Node Figma | `2104:2914` @ v`2381581871281042338` — PNG 3456×896, sha `9702432e988e` |
| Rendu généré | `src/components/FAQ/FAQ.tsx` export `FAQ`, bundle `7c29cebab8d5`, fonts chargées |
| Pixels | brut 4.366 % (seuil 2.5 %) — diagnostic masqué 2.177 % (hors calcul autoritaire) |
| Régions | `whole` 4.366 %/2.5 % (61468 px signal) |
| Géométrie racine | Figma 3456×896 vs généré 3456×274 (Δ 0×-622) — fail |
| Visibilité | signal Figma 103781 px · généré 61468 px · contraste ok |
| Motifs | `raw-over-threshold:4.366393293238564>2.5`, `region-over-budget:whole:4.366393293238564>2.5` |

| Assertion sémantique | Sélecteur | Pointeur contractuel | Verdict |
|---|---|---|---|
| `root-element` | `[class*="FAQ__root"]` | `/semantics/element` | pass |
| `accordion-vide-avec-les-defauts-du-contrat` | `[class*="FAQ__accordion"]` | `/anatomy/root/parts/accordion` | pass |
| `section-header-titre` | `[class*="SectionHeader__Titre"]` | `/anatomy/root/parts/SectionHeader/component/props/titre` | pass |
| `section-header-accroche` | `[class*="SectionHeader__Accroche"]` | `/anatomy/root/parts/SectionHeader/component/props/accroche` | pass |
| `button-libelle-defaut-de-l-enfant` | `[class*="Button__root"]` | `/anatomy/root/parts/Bouton/component` | pass |

| Probe de projection (D6) | Prop | Valeur injectée | Valeur observée dans le DOM | Projetée |
|---|---|---|---|---|
| `faq.property.ligne3` | `ligne3` | false | — | **non** |
| `faq.property.items` | `items` | [{"contenu":"PREUVE-013 — RÉPONSE 4b1e","titre":"PREUVE-013 — QUESTION 4b1e"}] | PREUVE-013 — QUESTION 4b1e | **non** |

| Artefact | Chemin | sha256 | Taille |
|---|---|---|---|
| figma | `specs/013-auditer-fidelite-organismes/proofs/organisms/faq/cases/faq-master-defaults/figma.png` | `303b0f4d6a9e` | 3100×885, 153466 o |
| generated | `specs/013-auditer-fidelite-organismes/proofs/organisms/faq/cases/faq-master-defaults/generated.png` | `cf8eae55fdb3` | 3100×885, 44622 o |
| diff | `specs/013-auditer-fidelite-organismes/proofs/organisms/faq/cases/faq-master-defaults/diff.png` | `3890e8a739ce` | 3100×885, 64182 o |
| triptych | `specs/013-auditer-fidelite-organismes/proofs/organisms/faq/cases/faq-master-defaults/triptych.png` | `38096fa46522` | 270692 o |
| metadata | `specs/013-auditer-fidelite-organismes/proofs/organisms/faq/cases/faq-master-defaults/metadata.json` | `b5f584b0e431` | 5409 o |

## 7. Divergences, limites nommées et travaux reportés

- **Divergence** `faq.structure.gap-root` — source : **contract** — contract-does-not-carry-figma-fact:root.gap="48px"
- **Divergence** `faq.structure.padding-root-left` — source : **contract** — contract-does-not-carry-figma-fact:root.padding-left="89px"
- **Divergence** `faq.structure.padding-root-right` — source : **contract** — contract-does-not-carry-figma-fact:root.padding-right="89px"
- **Divergence** `faq.structure.root-width` — source : **contract** — contract-does-not-carry-figma-fact:root.width="1728px"
- **Divergence** `faq.structure.accordion-fill` — source : **contract** — contract-does-not-carry-figma-fact:accordion.layoutSizingHorizontal=FILL=true
- **Divergence** `faq.structure.accordion-row-fill` — source : **contract** — contract-does-not-carry-figma-fact:accordion.AccordionRow[*].layoutSizingHorizontal="FILL"
- **Divergence** `faq.structure.section-header-height` — source : **contract** — contract-does-not-carry-figma-fact:SectionHeader.height (layoutSizingVertical=FIXED)="50px"
- **Divergence** `faq.structure.ligne3-cible-visibilite` — source : **contract** — contract-does-not-carry-figma-fact:accordion.AccordionRow[2].visible ← Ligne 3#2104:59={"prop":"ligne3","equals":true}
- **Divergence** `faq.property.ligne3` — source : **generated** — boolean-prop-did-not-materialise-its-subtree
- **Divergence** `faq.property.items` — source : **generated** — probe-not-projected:child-renders-a-literal
- **Divergence** `faq.content.accordion-rows-default` — source : **contract** — contract-does-not-carry-figma-fact:accordion.children.count (défaut du master)=3
- **Divergence** `faq.composition.accordion-row-etat` — source : **contract** — contract-does-not-carry-figma-fact:accordion.AccordionRow[1].Etat="ouvert"
- **Divergence** `faq.composition.section-header-titre` — source : **contract** — contract-value-differs:SectionHeader.Titre:[{"text":"Questions fréquentes"}]!="Questions fréquentes"
- **Divergence** `faq.composition.section-header-accroche2` — source : **contract** — contract-does-not-carry-figma-fact:SectionHeader.Accroche2 (BOOLEAN)=true
- **Divergence** `faq.composition.button-libelle` — source : **contract** — contract-does-not-carry-figma-fact:Bouton.Libelle="Contactez-nous"
- **Divergence** `faq.composition.button-variant` — source : **contract** — contract-does-not-carry-figma-fact:Bouton.Style="outilneNoir"
- **Divergence** `faq.composition.button-icone-droite` — source : **contract** — contract-does-not-carry-figma-fact:Bouton.Icone droite (BOOLEAN)=true
- **Divergence** `faq.visual.root` — source : **comparison** — raw-over-threshold:4.366393293238564>2.5 ; region-over-budget:whole:4.366393293238564>2.5
- **Limite** `faq.semantic.root-element` — representability:carry-code-only
- **Non prouvé** `faq.composition.accordion-row` — leg-unavailable:generated ; agreement-unknown
- **Limite déclarée d'avance** `faq.couverture-pixel-003-2-sur-4` (impact attendu : limited) — Couverture pixel de l'audit 003 à 2/4, cause racine nommée.

## 8. Verdict

**`divergent`** — motifs : `divergent-facts:18`, `failed-cases:1`

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
