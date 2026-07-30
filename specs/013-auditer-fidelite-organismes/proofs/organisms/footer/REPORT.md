# Dossier d'audit — Footer (`ds.footer`)

> Généré depuis `result.json` — le Markdown n'est jamais l'autorité du verdict.

## 1. Identité

| Champ | Valeur |
|---|---|
| Sujet | `footer` (Footer) |
| Vague | 2 |
| Contrat | `ds.footer` v1.0.0 — `contracts/footer.contract.json` |
| Node master Figma | `2120:4785` |
| Référence Figma | `d9FYAUcqdcNtsuaMgLefvJ` @ version `2381581871281042338` (lecture seule) |

## 2. Audits de propreté réutilisés (Step 0)

- `specs/003-externalize-figma-components/audits/footer-devis.md`
- `specs/010-extract-molecules-organisms/audit-reuse-map.md`

## 3. Dépendance

Aucune — cet organisme ne déclare pas de dépendance de clôture.

## 4. Couverture exacte

- attendus : 57
- observés : 57
- manquants : **aucun**
- inattendus : **aucun**

## 5. Faits

| Fait | Catégorie | Représentabilité | Jambe Figma | Jambe contrat | Jambe générée | Verdict | Source localisée | Motifs |
|---|---|---|---|---|---|---|---|---|
| `footer.structure.root` | structure | carry-both | {"nodeId":"2120:4785","detail":"COMPONENT autonome \"Footer\" (aucun COMPONENT_SET parent, une seule variante) 1728x459  | ds.footer@1.0.0#/anatomy/root | src/components/Footer/Footer.tsx#[class*="Footer__root"] | **proved** | — | — |
| `footer.structure.root-gap` | structure | carry-both | 2120:4785#root.itemSpacing | ds.footer@1.0.0#/anatomy/root/layout | src/components/Footer/Footer.tsx#[class*="Footer__root"] | **divergent** | contract | contract-value-differs:root.itemSpacing:{"display":"flex","direction":"column"}!=0 |
| `footer.structure.root-width` | structure | carry-both | 2120:4785#root.width | ds.footer@1.0.0#/anatomy/root/literals/width | src/components/Footer/Footer.tsx#[class*="Footer__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:root.width="1728px" |
| `footer.structure.padding-root-top` | structure | carry-both | 2120:4785#root.padding-top | ds.footer@1.0.0#/anatomy/root/literals/padding-top | src/components/Footer/Footer.tsx#[class*="Footer__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:root.padding-top="128px" |
| `footer.structure.padding-root-right` | structure | carry-both | 2120:4785#root.padding-right | ds.footer@1.0.0#/anatomy/root/literals/padding-right | src/components/Footer/Footer.tsx#[class*="Footer__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:root.padding-right="89px" |
| `footer.structure.padding-root-bottom` | structure | carry-both | 2120:4785#root.padding-bottom | ds.footer@1.0.0#/anatomy/root/literals/padding-bottom | src/components/Footer/Footer.tsx#[class*="Footer__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:root.padding-bottom="32px" |
| `footer.structure.padding-root-left` | structure | carry-both | 2120:4785#root.padding-left | ds.footer@1.0.0#/anatomy/root/literals/padding-left | src/components/Footer/Footer.tsx#[class*="Footer__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:root.padding-left="89px" |
| `footer.visual.background-color` | visual | carry-both | 2120:4785#Background.fills[0] | ds.footer@1.0.0#/anatomy/root/parts/Background/tokens/background-color | src/components/Footer/Footer.tsx#[class*="Footer__Background"] | **proved** | — | — |
| `footer.structure.background-absolute` | structure | carry-both | 2120:4785#Background.layoutPositioning | ds.footer@1.0.0#/anatomy/root/parts/Background/layout/position | src/components/Footer/Footer.tsx#[class*="Footer__Background"] | **divergent** | contract | contract-does-not-carry-figma-fact:Background.layoutPositioning="ABSOLUTE" |
| `footer.structure.background-size` | structure | carry-both | 2120:4785#Background.height | ds.footer@1.0.0#/anatomy/root/parts/Background/literals/height | src/components/Footer/Footer.tsx#[class*="Footer__Background"] | **divergent** | contract | contract-does-not-carry-figma-fact:Background.height="459px" |
| `footer.structure.row` | structure | carry-both | {"nodeId":"2170:7022","detail":"FRAME \"Row\" 1385x127 @129,18713, layoutSizingHorizontal=FIXED layoutSizingVertical=FIX | ds.footer@1.0.0#/anatomy/root/parts/Row | src/components/Footer/Footer.tsx#[class*="Footer__Row"] | **proved** | — | — |
| `footer.structure.row-no-autolayout` | structure | carry-with-named-limit | 2120:4785#Row.layoutMode | ds.footer@1.0.0#/anatomy/root/parts/Row/layout | src/components/Footer/Footer.tsx#[class*="Footer__Row"] | **divergent** | contract | contract-does-not-carry-figma-fact:Row.layoutMode="absent (aucun auto-layout — enfants positionnés en absolu)" |
| `footer.structure.row-width` | structure | carry-both | 2120:4785#Row.width | ds.footer@1.0.0#/anatomy/root/parts/Row/literals/width | src/components/Footer/Footer.tsx#[class*="Footer__Row"] | **divergent** | contract | contract-does-not-carry-figma-fact:Row.width="1385px" |
| `footer.structure.row-visual-order` | structure | carry-with-named-limit | 2120:4785#Row.visualColumnOrder | ds.footer@1.0.0#/anatomy/root/parts/Row/parts | src/components/Footer/Footer.tsx#[class*="Footer__Row"] | **divergent** | contract | contract-value-differs:Row.visualColumnOrder:{"col5":{"layout":{"direction":"column"},"parts":{"TitreReseaux":{"text":"S |
| `footer.structure.col5` | structure | carry-both | {"nodeId":"2169:5851","detail":"FRAME \"Col 5\" 145x78 @1369,18713, layoutMode=VERTICAL layoutSizingHorizontal=HUG layou | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col5 | src/components/Footer/Footer.tsx#[class*="Footer__col5"] | **proved** | — | — |
| `footer.structure.gap-col5` | structure | carry-both | 2120:4785#col5.gap | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col5/literals/gap | src/components/Footer/Footer.tsx#[class*="Footer__col5"] | **divergent** | contract | contract-does-not-carry-figma-fact:col5.gap="16px" |
| `footer.content.titre-reseaux` | content | carry-both | {"nodeId":"2120:4773","detail":"TEXT \"TitreReseaux\" — characters littéraux du master (aucune propriété TEXT ne les pil | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col5/parts/TitreReseaux/text | src/components/Footer/Footer.tsx#[class*="Footer__TitreReseaux"] | **proved** | — | — |
| `footer.visual.titre-reseaux-color` | visual | carry-both | 2120:4785#TitreReseaux.color | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col5/parts/TitreReseaux/tokens/color | src/components/Footer/Footer.tsx#[class*="Footer__TitreReseaux"] | **proved** | — | — |
| `footer.visual.titre-reseaux-font-size` | visual | carry-both | 2120:4785#TitreReseaux.font-size | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col5/parts/TitreReseaux/tokens/font-size | src/components/Footer/Footer.tsx#[class*="Footer__TitreReseaux"] | **divergent** | contract | contract-does-not-carry-figma-fact:TitreReseaux.font-size="24px" |
| `footer.visual.titre-reseaux-line-height` | visual | carry-both | 2120:4785#TitreReseaux.line-height | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col5/parts/TitreReseaux/tokens/line-height | src/components/Footer/Footer.tsx#[class*="Footer__TitreReseaux"] | **divergent** | contract | contract-does-not-carry-figma-fact:TitreReseaux.line-height="30px" |
| `footer.semantic.titre-reseaux-element` | semantic | carry-both | {"nodeId":"2120:4773","detail":"TEXT layer \"TitreReseaux\" — projeté en <span> par l'émetteur react (part avec text et  | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col5/parts/TitreReseaux | src/components/Footer/Footer.tsx#[class*="Footer__TitreReseaux"] | **proved** | — | — |
| `footer.structure.reseaux-sociaux` | structure | carry-both | {"nodeId":"2120:4774","channel":"layoutMode + counterAxisAlignItems","raw":"HORIZONTAL, counterAxisAlignItems=CENTER","d | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col5/parts/rseauxSociaux/layout | src/components/Footer/Footer.tsx#[class*="Footer__rseauxSociaux"] | **proved** | — | — |
| `footer.structure.gap-reseaux-sociaux` | structure | carry-both | 2120:4785#rseauxSociaux.gap | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col5/parts/rseauxSociaux/literals/gap | src/components/Footer/Footer.tsx#[class*="Footer__rseauxSociaux"] | **divergent** | contract | contract-does-not-carry-figma-fact:rseauxSociaux.gap="16px" |
| `footer.composition.icone-facebook` | composition | carry-both | {"nodeId":"2147:5474","mainComponent":"2053:1259","detail":"INSTANCE \"Facebook\" 32x31.857126235961914 @1369,18759.0722 | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col5/parts/rseauxSociaux/parts/Facebook/icon | src/components/Footer/Footer.tsx#[class*="Footer__Facebook"] | **proved** | — | — |
| `footer.composition.icone-instagram` | composition | carry-both | {"nodeId":"2147:5476","mainComponent":"2053:1261","detail":"INSTANCE \"Instagram\" 32x32 @1417,18759 > VECTOR \"Tracé\"  | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col5/parts/rseauxSociaux/parts/Instagram/icon | src/components/Footer/Footer.tsx#[class*="Footer__Instagram"] | **proved** | — | — |
| `footer.visual.icones-couleur` | visual | carry-both | 2120:4785#Facebook.Tracé.fills[0] | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col5/parts/rseauxSociaux/parts/Facebook/tokens/color | src/components/Footer/Footer.tsx#[class*="Footer__Facebook"] | **divergent** | contract | contract-does-not-carry-figma-fact:Facebook.Tracé.fills[0]="{color.noir-bleute}" |
| `footer.structure.facebook-hauteur` | structure | carry-with-named-limit | 2120:4785#Facebook.height | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col5/parts/rseauxSociaux/parts/Facebook/icon/size | src/components/Footer/Footer.tsx#[class*="Footer__Facebook"] | **divergent** | contract | contract-value-differs:Facebook.height:32!="31.857126235961914px" |
| `footer.composition.footer-column-repeat` | composition | carry-both | 2120:4785#Row.FooterColumn.instanceCount | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/FooterColumn/component | src/components/Footer/Footer.tsx#[class*="FooterColumn__root"] | **divergent** | contract | contract-value-differs:Row.FooterColumn.instanceCount:{"id":"ds.footer-column"}!=3 |
| `footer.structure.repeat-sample-non-projete` | structure | carry-both | 2120:4785#FooterColumn.renderedCount@defaults | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/FooterColumn/repeat/sample | src/components/Footer/Footer.tsx#[class*="FooterColumn__root"] | **divergent** | contract | contract-value-differs:FooterColumn.renderedCount@defaults:[{"texte":"Tél : +32 (0)87 46 32 66\r  Email: info@piqueray.b |
| `footer.structure.footer-column-width` | structure | carry-both | 2120:4785#FooterColumn.width | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/FooterColumn/repeat | src/components/Footer/Footer.tsx#[class*="FooterColumn__root"] | **divergent** | contract | contract-value-differs:FooterColumn.width:{"itemsProp":"items","sample":[{"texte":"Tél : +32 (0)87 46 32 66\r  Email: in |
| `footer.content.footer-column-titres` | content | carry-both | 2120:4785#FooterColumn[2120:4779].Titre#2079:38 | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/FooterColumn/repeat/sample/0/titre | src/components/Footer/Footer.tsx#[class*="FooterColumn__Titre"] | **proved** | — | — |
| `footer.content.footer-column-textes` | content | carry-both | 2120:4785#FooterColumn[2120:4779].Texte#2079:39 | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/FooterColumn/repeat/sample/0/texte | src/components/Footer/Footer.tsx#[class*="FooterColumn__Texte"] | **divergent** | contract | contract-value-differs:FooterColumn[2120:4779].Texte#2079:39:"Tél : +32 (0)87 46 32 66\r  Email: info@piqueray.be"!="Tél |
| `footer.semantic.footer-column-texte-underline` | semantic | carry-with-named-limit | 2120:4785#FooterColumn[2120:4779].Texte.styleOverrideTable["2"].textDecoration | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/FooterColumn/repeat/sample/0/texte | src/components/Footer/Footer.tsx#[class*="FooterColumn__Texte"] | **divergent** | contract | contract-value-differs:FooterColumn[2120:4779].Texte.styleOverrideTable["2"].textDecoration:"Tél : +32 (0)87 46 32 66\r  |
| `footer.semantic.footer-column-texte-caracteres-invisibles` | semantic | carry-both | {"nodeId":"I2120:4779;2079:2248","channel":"characters","raw":"\"Tél : +32 (0)87 46 32 66\\r  Email: info@piqueray.be\"  | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/FooterColumn/repeat/sample/0/texte | src/components/Footer/Footer.tsx#[class*="FooterColumn__Texte"] | **not-proven** | — | leg-unavailable:generated; agreement-unknown |
| `footer.property.items` | property | carry-code-only | {"nodeId":"2120:4785","property":"componentPropertyDefinitions","detail":"MESURÉ : le master 2120:4785 n'expose AUCUNE p | ds.footer@1.0.0#/props/0 | src/components/Footer/Footer.tsx#[class*="FooterColumn__Titre"] | **divergent** | generated | probe-not-projected:child-renders-a-literal |
| `footer.property.items-binding-none` | property | carry-code-only | 2120:4785#root.componentPropertyDefinitions | ds.footer@1.0.0#/props/0/bindings/figma/kind | src/components/Footer/Footer.tsx#[class*="FooterColumn__root"] | **divergent** | contract | contract-value-differs:root.componentPropertyDefinitions:"NONE"!="absent — le master n'expose aucune propriété de compos |
| `footer.structure.col1` | structure | carry-both | {"nodeId":"2169:5850","detail":"FRAME \"Col 1\" 219.5x120 @129,18713 — comme Row, AUCUN layoutMode et aucune clé de dime | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col1 | src/components/Footer/Footer.tsx#[class*="Footer__col1"] | **proved** | — | — |
| `footer.structure.col1-axe` | structure | carry-both | 2120:4785#col1.flex-direction | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col1/layout | src/components/Footer/Footer.tsx#[class*="Footer__col1"] | **divergent** | contract | contract-does-not-carry-figma-fact:col1.flex-direction="column" |
| `footer.structure.col1-gap` | structure | carry-both | 2120:4785#col1.gap | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col1/literals/gap | src/components/Footer/Footer.tsx#[class*="Footer__col1"] | **divergent** | contract | contract-does-not-carry-figma-fact:col1.gap="32px" |
| `footer.composition.piqueray-logo` | composition | carry-both | {"nodeId":"2120:4783","mainComponent":"4:15","observedInstanceProperties":{"Couleur":"Blanc"},"detail":"INSTANCE \"Pique | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col1/parts/PiquerayLogo/component | src/components/Footer/Footer.tsx#[class*="PiquerayLogo__root"] | **proved** | — | — |
| `footer.composition.piqueray-logo-couleur` | composition | carry-both | 2120:4785#PiquerayLogo.Couleur (VARIANT "Blanc" → valeur d'enum contractuelle "blanc", mappage déclaré par ds.piqueray-l | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col1/parts/PiquerayLogo/component/props/couleur | src/components/Footer/Footer.tsx#[class*="PiquerayLogo__couleur-blanc"] | **proved** | — | — |
| `footer.structure.piqueray-logo-size` | structure | carry-both | 2120:4785#PiquerayLogo.width | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col1/parts/PiquerayLogo/literals/width | src/components/Footer/Footer.tsx#[class*="PiquerayLogo__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:PiquerayLogo.width="180.0985565185547px" |
| `footer.composition.button` | composition | carry-both | {"nodeId":"2120:4784","mainComponent":"6:135","observedInstanceProperties":{"Libelle#2044:28":"Contactez-nous","Style":" | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col1/parts/Bouton/component | src/components/Footer/Footer.tsx#[class*="Button__root"] | **proved** | — | — |
| `footer.composition.button-variant` | composition | carry-both | 2120:4785#Bouton.Style (VARIANT "Outline blanc" → valeur d'enum contractuelle "outlineBlanc", mappage déclaré par ds.but | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col1/parts/Bouton/component/props/variant | src/components/Footer/Footer.tsx#[class*="Button__variant-outlineBlanc"] | **divergent** | contract | contract-does-not-carry-figma-fact:Bouton.Style (VARIANT "Outline blanc" → valeur d'enum contractuelle "outlineBlanc", m |
| `footer.composition.button-libelle` | composition | carry-both | 2120:4785#Bouton.Libelle | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col1/parts/Bouton/component/text | src/components/Footer/Footer.tsx#[class*="Button__label"] | **divergent** | contract | contract-does-not-carry-figma-fact:Bouton.Libelle="Contactez-nous" |
| `footer.composition.button-icones` | composition | carry-both | 2120:4785#Bouton.Icone droite (BOOLEAN) | ds.footer@1.0.0#/anatomy/root/parts/Row/parts/col1/parts/Bouton/component/props/iconRight | src/components/Footer/Footer.tsx#[class*="Button__iconRight"] | **divergent** | contract | contract-does-not-carry-figma-fact:Bouton.Icone droite (BOOLEAN)=false |
| `footer.structure.spacer-height` | structure | carry-both | 2120:4785#Spacer.height | ds.footer@1.0.0#/anatomy/root/parts/Spacer/literals/height | src/components/Footer/Footer.tsx#[class*="Footer__Spacer"] | **divergent** | contract | contract-does-not-carry-figma-fact:Spacer.height="121px" |
| `footer.structure.spacer2-height` | structure | carry-both | 2120:4785#spacer2.height | ds.footer@1.0.0#/anatomy/root/parts/spacer2/literals/height | src/components/Footer/Footer.tsx#[class*="Footer__spacer2"] | **divergent** | contract | contract-does-not-carry-figma-fact:spacer2.height="27px" |
| `footer.visual.separator-color` | visual | carry-both | 2120:4785#Separator.strokes[0] | ds.footer@1.0.0#/anatomy/root/parts/Separator/tokens/border-color | src/components/Footer/Footer.tsx#[class*="Footer__Separator"] | **proved** | — | — |
| `footer.visual.separator-width` | visual | carry-both | 2120:4785#Separator.border-width | ds.footer@1.0.0#/anatomy/root/parts/Separator/tokens/border-width | src/components/Footer/Footer.tsx#[class*="Footer__Separator"] | **divergent** | contract | contract-does-not-carry-figma-fact:Separator.border-width="1px" |
| `footer.semantic.separator-line` | semantic | carry-both | {"nodeId":"2120:4770","channel":"type","raw":"LINE 1550x0 — une géométrie à une seule arête, fills=[] et strokes=[SOLID  | ds.footer@1.0.0#/anatomy/root/parts/Separator | src/components/Footer/Footer.tsx#[class*="Footer__Separator"] | **proved** | — | — |
| `footer.structure.separator-largeur` | structure | carry-both | 2120:4785#Separator.layoutSizingHorizontal | ds.footer@1.0.0#/anatomy/root/parts/Separator/layout/grow | src/components/Footer/Footer.tsx#[class*="Footer__Separator"] | **divergent** | contract | contract-does-not-carry-figma-fact:Separator.layoutSizingHorizontal="FILL" |
| `footer.composition.copyright` | composition | carry-both | {"nodeId":"2120:4769","mainComponent":"2086:2330","observedInstanceProperties":{"Texte#2086:40":"© 2025 Piqueray - CGV - | ds.footer@1.0.0#/anatomy/root/parts/Copyright/component | src/components/Footer/Footer.tsx#[class*="Copyright__root"] | **proved** | — | — |
| `footer.composition.copyright-texte` | composition | carry-both | 2120:4785#Copyright.Texte#2086:40 | ds.footer@1.0.0#/anatomy/root/parts/Copyright/component/props/texte | src/components/Footer/Footer.tsx#[class*="Copyright__Texte"] | **divergent** | contract | contract-value-differs:Copyright.Texte#2086:40:"© 2025 Piqueray - CGV - Politique de confidentialité \| Création de site |
| `footer.visual.root-font-family` | visual | carry-both | 2120:4785#root.font-family | ds.footer@1.0.0#/anatomy/root/tokens/font-family | src/components/Footer/Footer.tsx#[class*="Footer__root"] | **proved** | — | — |
| `footer.semantic.root-element` | semantic | carry-both | {"nodeId":"2120:4785","detail":"COMPONENT racine — le contrat déclare semantics.element = \"div\" et semantics.provenanc | ds.footer@1.0.0#/semantics/element | src/components/Footer/Footer.tsx#[class*="Footer__root"] | **proved** | — | — |
| `footer.visual.root` | visual | carry-both | {"nodeId":"2120:4785","export":"png@2x"} | ds.footer@1.0.0#/anatomy/root | src/components/Footer/Footer.tsx#[class*="Footer__root"] | **divergent** | comparison | raw-over-threshold:96.91433672234325>2.5; region-over-budget:whole:96.91433672234325>2.5 |

## 6. Cas et artefacts

### Cas `footer-master-defaults`

| Mesure | Valeur |
|---|---|
| Verdict | **fail** (probant : true) |
| Node Figma | `2120:4785` @ v`2381581871281042338` — PNG 3456×918, sha `2f36972b1bf4` |
| Rendu généré | `src/components/Footer/Footer.tsx` export `Footer`, bundle `fab00f03b13c`, fonts chargées |
| Pixels | brut 96.914 % (seuil 2.5 %) — diagnostic masqué 98.841 % (hors calcul autoritaire) |
| Régions | `whole` 96.914 %/2.5 % (54184 px signal) |
| Géométrie racine | Figma 3456×918 vs généré 3456×168 (Δ 0×-750) — fail |
| Visibilité | signal Figma 3142422 px · généré 54184 px · contraste ok |
| Motifs | `raw-over-threshold:96.91433672234325>2.5`, `region-over-budget:whole:96.91433672234325>2.5` |

| Assertion sémantique | Sélecteur | Pointeur contractuel | Verdict |
|---|---|---|---|
| `titre-reseaux` | `[class*="Footer__TitreReseaux"]` | `/anatomy/root/parts/Row/parts/col5/parts/TitreReseaux/text` | pass |
| `copyright-texte-route` | `[class*="Copyright__Texte"]` | `/anatomy/root/parts/Copyright/component/props/texte` | fail |
| `button-libelle-defaut-de-l-enfant` | `[class*="Button__label"]` | `/anatomy/root/parts/Row/parts/col1/parts/Bouton/component` | pass |
| `footer-column-titre-premiere-colonne` | `[class*="FooterColumn__Titre"]` | `/anatomy/root/parts/Row/parts/FooterColumn/repeat/sample/0/titre` | fail |

| Probe de projection (D6) | Prop | Valeur injectée | Valeur observée dans le DOM | Projetée |
|---|---|---|---|---|
| `footer.property.items` | `items` | [{"titre":"PREUVE-013 — TITRE b7d2","texte":"PREUVE-013 — TEXTE b7d2"}] | PREUVE-013 — TITRE b7d2 | **non** |

| Artefact | Chemin | sha256 | Taille |
|---|---|---|---|
| figma | `specs/013-auditer-fidelite-organismes/proofs/organisms/footer/cases/footer-master-defaults/figma.png` | `246115276313` | 3456×918, 110410 o |
| generated | `specs/013-auditer-fidelite-organismes/proofs/organisms/footer/cases/footer-master-defaults/generated.png` | `f961c9844400` | 3456×918, 30731 o |
| diff | `specs/013-auditer-fidelite-organismes/proofs/organisms/footer/cases/footer-master-defaults/diff.png` | `9975023a1b51` | 3456×918, 48773 o |
| triptych | `specs/013-auditer-fidelite-organismes/proofs/organisms/footer/cases/footer-master-defaults/triptych.png` | `ec94070b5b5e` | 198455 o |
| metadata | `specs/013-auditer-fidelite-organismes/proofs/organisms/footer/cases/footer-master-defaults/metadata.json` | `0e8a00f70035` | 6091 o |

## 7. Divergences, limites nommées et travaux reportés

- **Divergence** `footer.structure.root-gap` — source : **contract** — contract-value-differs:root.itemSpacing:{"display":"flex","direction":"column"}!=0
- **Divergence** `footer.structure.root-width` — source : **contract** — contract-does-not-carry-figma-fact:root.width="1728px"
- **Divergence** `footer.structure.padding-root-top` — source : **contract** — contract-does-not-carry-figma-fact:root.padding-top="128px"
- **Divergence** `footer.structure.padding-root-right` — source : **contract** — contract-does-not-carry-figma-fact:root.padding-right="89px"
- **Divergence** `footer.structure.padding-root-bottom` — source : **contract** — contract-does-not-carry-figma-fact:root.padding-bottom="32px"
- **Divergence** `footer.structure.padding-root-left` — source : **contract** — contract-does-not-carry-figma-fact:root.padding-left="89px"
- **Divergence** `footer.structure.background-absolute` — source : **contract** — contract-does-not-carry-figma-fact:Background.layoutPositioning="ABSOLUTE"
- **Divergence** `footer.structure.background-size` — source : **contract** — contract-does-not-carry-figma-fact:Background.height="459px"
- **Divergence** `footer.structure.row-no-autolayout` — source : **contract** — contract-does-not-carry-figma-fact:Row.layoutMode="absent (aucun auto-layout — enfants positionnés en absolu)"
- **Divergence** `footer.structure.row-width` — source : **contract** — contract-does-not-carry-figma-fact:Row.width="1385px"
- **Divergence** `footer.structure.row-visual-order` — source : **contract** — contract-value-differs:Row.visualColumnOrder:{"col5":{"layout":{"direction":"column"},"parts":{"TitreReseaux":{"text":"Suivez-nous","tokens":{"color":"{color.orange}"}},"rseauxSociaux":{"layout":{"direction":"row","align":"center"},"parts":{"Facebook":{"icon":{"asset":"facebook","size":32}},"Instagram":{"icon":{"asset":"instagram","size":32}}}}}},"FooterColumn":{"component":{"id":"ds.footer-column"},"repeat":{"itemsProp":"items","sample":[{"texte":"Tél : +32 (0)87 46 32 66\r  Email: info@piqueray.be","titre":"Contact"},{"texte":"Du lundi au vendredi  de 8h00 à 12h00 et  de 13h30 à 17h00","titre":"Horaires"},{"texte":"Rue Alfred Drèze 7,  4860 Pepinster","titre":"Adresse"}]}},"col1":{"parts":{"PiquerayLogo":{"component":{"id":"ds.piqueray-logo","props":{"couleur":"blanc"}}},"Bouton":{"component":{"id":"ds.button"}}}}}!="row-reverse"
- **Divergence** `footer.structure.gap-col5` — source : **contract** — contract-does-not-carry-figma-fact:col5.gap="16px"
- **Divergence** `footer.visual.titre-reseaux-font-size` — source : **contract** — contract-does-not-carry-figma-fact:TitreReseaux.font-size="24px"
- **Divergence** `footer.visual.titre-reseaux-line-height` — source : **contract** — contract-does-not-carry-figma-fact:TitreReseaux.line-height="30px"
- **Divergence** `footer.structure.gap-reseaux-sociaux` — source : **contract** — contract-does-not-carry-figma-fact:rseauxSociaux.gap="16px"
- **Divergence** `footer.visual.icones-couleur` — source : **contract** — contract-does-not-carry-figma-fact:Facebook.Tracé.fills[0]="{color.noir-bleute}"
- **Divergence** `footer.structure.facebook-hauteur` — source : **contract** — contract-value-differs:Facebook.height:32!="31.857126235961914px"
- **Divergence** `footer.composition.footer-column-repeat` — source : **contract** — contract-value-differs:Row.FooterColumn.instanceCount:{"id":"ds.footer-column"}!=3
- **Divergence** `footer.structure.repeat-sample-non-projete` — source : **contract** — contract-value-differs:FooterColumn.renderedCount@defaults:[{"texte":"Tél : +32 (0)87 46 32 66\r  Email: info@piqueray.be","titre":"Contact"},{"texte":"Du lundi au vendredi  de 8h00 à 12h00 et  de 13h30 à 17h00","titre":"Horaires"},{"texte":"Rue Alfred Drèze 7,  4860 Pepinster","titre":"Adresse"}]!=3
- **Divergence** `footer.structure.footer-column-width` — source : **contract** — contract-value-differs:FooterColumn.width:{"itemsProp":"items","sample":[{"texte":"Tél : +32 (0)87 46 32 66\r  Email: info@piqueray.be","titre":"Contact"},{"texte":"Du lundi au vendredi  de 8h00 à 12h00 et  de 13h30 à 17h00","titre":"Horaires"},{"texte":"Rue Alfred Drèze 7,  4860 Pepinster","titre":"Adresse"}]}!="310px"
- **Divergence** `footer.content.footer-column-textes` — source : **contract** — contract-value-differs:FooterColumn[2120:4779].Texte#2079:39:"Tél : +32 (0)87 46 32 66\r  Email: info@piqueray.be"!="Tél : +32 (0)87 46 32 66\r  Email: info@piqueray.be"
- **Divergence** `footer.semantic.footer-column-texte-underline` — source : **contract** — contract-value-differs:FooterColumn[2120:4779].Texte.styleOverrideTable["2"].textDecoration:"Tél : +32 (0)87 46 32 66\r  Email: info@piqueray.be"!="UNDERLINE"
- **Divergence** `footer.property.items` — source : **generated** — probe-not-projected:child-renders-a-literal
- **Divergence** `footer.property.items-binding-none` — source : **contract** — contract-value-differs:root.componentPropertyDefinitions:"NONE"!="absent — le master n'expose aucune propriété de composant"
- **Divergence** `footer.structure.col1-axe` — source : **contract** — contract-does-not-carry-figma-fact:col1.flex-direction="column"
- **Divergence** `footer.structure.col1-gap` — source : **contract** — contract-does-not-carry-figma-fact:col1.gap="32px"
- **Divergence** `footer.structure.piqueray-logo-size` — source : **contract** — contract-does-not-carry-figma-fact:PiquerayLogo.width="180.0985565185547px"
- **Divergence** `footer.composition.button-variant` — source : **contract** — contract-does-not-carry-figma-fact:Bouton.Style (VARIANT "Outline blanc" → valeur d'enum contractuelle "outlineBlanc", mappage déclaré par ds.button /props/0/bindings/figma/values)="outlineBlanc"
- **Divergence** `footer.composition.button-libelle` — source : **contract** — contract-does-not-carry-figma-fact:Bouton.Libelle="Contactez-nous"
- **Divergence** `footer.composition.button-icones` — source : **contract** — contract-does-not-carry-figma-fact:Bouton.Icone droite (BOOLEAN)=false
- **Divergence** `footer.structure.spacer-height` — source : **contract** — contract-does-not-carry-figma-fact:Spacer.height="121px"
- **Divergence** `footer.structure.spacer2-height` — source : **contract** — contract-does-not-carry-figma-fact:spacer2.height="27px"
- **Divergence** `footer.visual.separator-width` — source : **contract** — contract-does-not-carry-figma-fact:Separator.border-width="1px"
- **Divergence** `footer.structure.separator-largeur` — source : **contract** — contract-does-not-carry-figma-fact:Separator.layoutSizingHorizontal="FILL"
- **Divergence** `footer.composition.copyright-texte` — source : **contract** — contract-value-differs:Copyright.Texte#2086:40:"© 2025 Piqueray - CGV - Politique de confidentialité | Création de site internet ProduWeb"!="© 2025 Piqueray - CGV - Politique de confidentialité | Création de site internet ProduWeb"
- **Divergence** `footer.visual.root` — source : **comparison** — raw-over-threshold:96.91433672234325>2.5 ; region-over-budget:whole:96.91433672234325>2.5
- **Non prouvé** `footer.semantic.footer-column-texte-caracteres-invisibles` — leg-unavailable:generated ; agreement-unknown

## 8. Verdict

**`divergent`** — motifs : `divergent-facts:36`, `failed-cases:1`

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
