# Dossier d'audit — Coordonnees (`ds.coordonnees`)

> Généré depuis `result.json` — le Markdown n'est jamais l'autorité du verdict.

## 1. Identité

| Champ | Valeur |
|---|---|
| Sujet | `coordonnees` (Coordonnees) |
| Vague | 1 |
| Contrat | `ds.coordonnees` v2.2.0 — `contracts/coordonnees.contract.json` |
| Node master Figma | `2104:2904` |
| Référence Figma | `d9FYAUcqdcNtsuaMgLefvJ` @ version `2381581871281042338` (lecture seule) |

## 2. Audits de propreté réutilisés (Step 0)

- `specs/003-externalize-figma-components/audits/coordonnees.md`
- `specs/010-extract-molecules-organisms/audit-reuse-map.md`

## 3. Dépendance

Aucune — cet organisme ne déclare pas de dépendance de clôture.

## 4. Couverture exacte

- attendus : 46
- observés : 46
- manquants : **aucun**
- inattendus : **aucun**

## 5. Faits

| Fait | Catégorie | Représentabilité | Jambe Figma | Jambe contrat | Jambe générée | Verdict | Source localisée | Motifs |
|---|---|---|---|---|---|---|---|---|
| `coordonnees.structure.root` | structure | carry-both | {"nodeId":"2104:2904","detail":"COMPONENT root 1728x597, layoutMode=GRID (2 colonnes) > [google-map RECTANGLE 2104:2899  | ds.coordonnees@2.2.0#/anatomy/root | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__root"] | **proved** | — | — |
| `coordonnees.structure.wrapper` | structure | carry-both | {"nodeId":"2104:2879","detail":"FRAME wrapper 576x589, layoutMode=VERTICAL, layoutSizingHorizontal=FIXED > [SectionHeade | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__wrapper"] | **proved** | — | — |
| `coordonnees.structure.google-map` | structure | carry-with-named-limit | {"nodeId":"2104:2899","detail":"RECTANGLE google-map 1152x597 (66,7 % de la largeur du composant), fills=[IMAGE] — colon | ds.coordonnees@2.2.0#/anatomy/root/parts/googleMap | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__googleMap"] | **limited** | — | representability:carry-with-named-limit |
| `coordonnees.structure.colonnes-ordre` | structure | carry-both | 2104:2904#root.visualColumnOrder | ds.coordonnees@2.2.0#/anatomy/root/layout/direction | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__root"] | **divergent** | contract | contract-value-differs:root.visualColumnOrder:"row"!="row-reverse" |
| `coordonnees.structure.gap-wrapper` | structure | carry-both | 2104:2904#wrapper.itemSpacing | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/literals/gap | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__wrapper"] | **proved** | — | — |
| `coordonnees.structure.padding-block-wrapper` | structure | carry-both | 2104:2904#wrapper.paddingTop+paddingBottom | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/literals/padding-block | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__wrapper"] | **proved** | — | — |
| `coordonnees.structure.padding-inline-wrapper` | structure | carry-both | 2104:2904#wrapper.paddingLeft+paddingRight | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/literals/padding-inline | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__wrapper"] | **proved** | — | — |
| `coordonnees.structure.width-wrapper` | structure | carry-both | 2104:2904#wrapper.absoluteBoundingBox.width | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/literals/width | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__wrapper"] | **proved** | — | — |
| `coordonnees.structure.gap-adresse` | structure | carry-both | 2104:2904#Adresse.itemSpacing | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Adresse/literals/gap | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__Adresse"] | **proved** | — | — |
| `coordonnees.structure.gap-horaires` | structure | carry-both | 2104:2904#Horaires.itemSpacing | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Horaires/literals/gap | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__Horaires"] | **proved** | — | — |
| `coordonnees.structure.gap-contact` | structure | carry-both | 2104:2904#Contact.itemSpacing | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Contact/literals/gap | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__Contact"] | **proved** | — | — |
| `coordonnees.structure.gap-suivez-nous` | structure | carry-both | 2104:2904#suivezNous.itemSpacing | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/suivezNous/literals/gap | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__suivezNous"] | **proved** | — | — |
| `coordonnees.structure.gap-reseaux-sociaux` | structure | carry-both | 2104:2904#rseauxSociaux.itemSpacing | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/suivezNous/parts/rseauxSociaux/literals/gap | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__rseauxSociaux"] | **proved** | — | — |
| `coordonnees.property.accroche` | property | carry-both | {"nodeId":"2104:2904","property":"Accroche#2104:57","detail":"Propriété TEXT du COMPONENT racine (defaultValue \"Contact | ds.coordonnees@2.2.0#/props/0 | src/components/Coordonnees/Coordonnees.tsx#[class*="SectionHeader__Accroche"] | **proved** | — | — |
| `coordonnees.property.titre` | property | carry-both | {"nodeId":"2104:2904","property":"Titre#2104:58","detail":"Propriété TEXT du COMPONENT racine (defaultValue \"Nos coordo | ds.coordonnees@2.2.0#/props/1 | src/components/Coordonnees/Coordonnees.tsx#[class*="SectionHeader__Titre"] | **proved** | — | — |
| `coordonnees.content.accroche` | content | carry-both | {"nodeId":"2104:2904","property":"Accroche#2104:57","textLayer":"I2169:6216;2090:2386"} | ds.coordonnees@2.2.0#/props/0/default | src/components/Coordonnees/Coordonnees.tsx#[class*="SectionHeader__Accroche"] | **proved** | — | — |
| `coordonnees.content.titre` | content | carry-both | {"nodeId":"2104:2904","property":"Titre#2104:58","textLayer":"I2169:6216;2090:2387"} | ds.coordonnees@2.2.0#/props/1/default | src/components/Coordonnees/Coordonnees.tsx#[class*="SectionHeader__Titre"] | **proved** | — | — |
| `coordonnees.content.adresse-etiquette` | content | carry-both | {"nodeId":"2104:2884","detail":"TEXT layer AdresseEtiquette","channel":"characters"} | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Adresse/parts/AdresseEtiquette/text | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__AdresseEtiquette"] | **proved** | — | — |
| `coordonnees.visual.adresse-etiquette-font-size` | visual | carry-both | 2104:2904#AdresseEtiquette.font-size | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Adresse/parts/AdresseEtiquette/tokens/font-size | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__AdresseEtiquette"] | **divergent** | contract | contract-value-differs:AdresseEtiquette.font-size:"{font.size.24}"!="24px" |
| `coordonnees.visual.adresse-etiquette-line-height` | visual | carry-both | 2104:2904#AdresseEtiquette.line-height | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Adresse/parts/AdresseEtiquette/tokens/line-height | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__AdresseEtiquette"] | **divergent** | contract | contract-value-differs:AdresseEtiquette.line-height:"{font.line-height.30}"!="30px" |
| `coordonnees.content.adresse-valeur` | content | carry-both | {"nodeId":"2104:2885","detail":"TEXT layer AdresseValeur","channel":"characters"} | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Adresse/parts/AdresseValeur/text | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__AdresseValeur"] | **proved** | — | — |
| `coordonnees.visual.adresse-valeur-font-size` | visual | carry-both | 2104:2904#AdresseValeur.font-size | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Adresse/parts/AdresseValeur/tokens/font-size | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__AdresseValeur"] | **divergent** | contract | contract-value-differs:AdresseValeur.font-size:"{font.size.18}"!="18px" |
| `coordonnees.visual.adresse-valeur-line-height` | visual | carry-both | 2104:2904#AdresseValeur.line-height | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Adresse/parts/AdresseValeur/tokens/line-height | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__AdresseValeur"] | **divergent** | contract | contract-value-differs:AdresseValeur.line-height:"{font.line-height.27}"!="27px" |
| `coordonnees.content.horaires-etiquette` | content | carry-both | {"nodeId":"2104:2887","detail":"TEXT layer HorairesEtiquette","channel":"characters"} | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Horaires/parts/HorairesEtiquette/text | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__HorairesEtiquette"] | **proved** | — | — |
| `coordonnees.visual.horaires-etiquette-font-size` | visual | carry-both | 2104:2904#HorairesEtiquette.font-size | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Horaires/parts/HorairesEtiquette/tokens/font-size | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__HorairesEtiquette"] | **divergent** | contract | contract-value-differs:HorairesEtiquette.font-size:"{font.size.24}"!="24px" |
| `coordonnees.visual.horaires-etiquette-line-height` | visual | carry-both | 2104:2904#HorairesEtiquette.line-height | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Horaires/parts/HorairesEtiquette/tokens/line-height | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__HorairesEtiquette"] | **divergent** | contract | contract-value-differs:HorairesEtiquette.line-height:"{font.line-height.30}"!="30px" |
| `coordonnees.content.horaires-valeur` | content | carry-both | {"nodeId":"2104:2888","detail":"TEXT layer HorairesValeur","channel":"characters"} | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Horaires/parts/HorairesValeur/text | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__HorairesValeur"] | **proved** | — | — |
| `coordonnees.visual.horaires-valeur-font-size` | visual | carry-both | 2104:2904#HorairesValeur.font-size | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Horaires/parts/HorairesValeur/tokens/font-size | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__HorairesValeur"] | **divergent** | contract | contract-value-differs:HorairesValeur.font-size:"{font.size.18}"!="18px" |
| `coordonnees.visual.horaires-valeur-line-height` | visual | carry-both | 2104:2904#HorairesValeur.line-height | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Horaires/parts/HorairesValeur/tokens/line-height | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__HorairesValeur"] | **divergent** | contract | contract-value-differs:HorairesValeur.line-height:"{font.line-height.27}"!="27px" |
| `coordonnees.content.contact-etiquette` | content | carry-both | {"nodeId":"2104:2890","detail":"TEXT layer ContactEtiquette","channel":"characters"} | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Contact/parts/ContactEtiquette/text | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__ContactEtiquette"] | **proved** | — | — |
| `coordonnees.visual.contact-etiquette-font-size` | visual | carry-both | 2104:2904#ContactEtiquette.font-size | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Contact/parts/ContactEtiquette/tokens/font-size | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__ContactEtiquette"] | **divergent** | contract | contract-value-differs:ContactEtiquette.font-size:"{font.size.24}"!="24px" |
| `coordonnees.visual.contact-etiquette-line-height` | visual | carry-both | 2104:2904#ContactEtiquette.line-height | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Contact/parts/ContactEtiquette/tokens/line-height | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__ContactEtiquette"] | **divergent** | contract | contract-value-differs:ContactEtiquette.line-height:"{font.line-height.30}"!="30px" |
| `coordonnees.content.contact-valeur` | content | carry-both | {"nodeId":"2104:2891","detail":"TEXT layer ContactValeur","channel":"characters"} | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Contact/parts/tl32087463266EmailInfopi/text | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__tl32087463266EmailInfopi"] | **proved** | — | — |
| `coordonnees.visual.contact-valeur-font-size` | visual | carry-both | 2104:2904#ContactValeur.font-size | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Contact/parts/tl32087463266EmailInfopi/tokens/font-size | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__tl32087463266EmailInfopi"] | **divergent** | contract | contract-value-differs:ContactValeur.font-size:"{font.size.18}"!="18px" |
| `coordonnees.visual.contact-valeur-line-height` | visual | carry-both | 2104:2904#ContactValeur.line-height | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Contact/parts/tl32087463266EmailInfopi/tokens/line-height | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__tl32087463266EmailInfopi"] | **divergent** | contract | contract-value-differs:ContactValeur.line-height:"{font.line-height.27}"!="27px" |
| `coordonnees.content.suivez-nous-etiquette` | content | carry-both | {"nodeId":"2104:2893","detail":"TEXT layer SuivezNousEtiquette","channel":"characters"} | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/suivezNous/parts/SuivezNousEtiquette/text | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__SuivezNousEtiquette"] | **proved** | — | — |
| `coordonnees.visual.suivez-nous-etiquette-font-size` | visual | carry-both | 2104:2904#SuivezNousEtiquette.font-size | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/suivezNous/parts/SuivezNousEtiquette/tokens/font-size | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__SuivezNousEtiquette"] | **divergent** | contract | contract-value-differs:SuivezNousEtiquette.font-size:"{font.size.24}"!="24px" |
| `coordonnees.visual.suivez-nous-etiquette-line-height` | visual | carry-both | 2104:2904#SuivezNousEtiquette.line-height | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/suivezNous/parts/SuivezNousEtiquette/tokens/line-height | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__SuivezNousEtiquette"] | **divergent** | contract | contract-value-differs:SuivezNousEtiquette.line-height:"{font.line-height.30}"!="30px" |
| `coordonnees.composition.section-header` | composition | carry-both | {"nodeId":"2169:6216","mainComponent":"2090:2385","observedInstanceProperties":{"Accroche2#2169:64":true,"Titre#2090:47" | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/SectionHeader/component | src/components/Coordonnees/Coordonnees.tsx#[class*="SectionHeader__root"] | **proved** | — | — |
| `coordonnees.composition.section-header-props` | composition | carry-both | 2104:2904#SectionHeader.props.titre | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/SectionHeader/component/props/titre | src/components/Coordonnees/Coordonnees.tsx#[class*="SectionHeader__Titre"] | **proved** | — | — |
| `coordonnees.composition.section-header-accroche` | composition | carry-both | 2104:2904#SectionHeader.props.accroche | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/SectionHeader/component/props/accroche | src/components/Coordonnees/Coordonnees.tsx#[class*="SectionHeader__Accroche"] | **proved** | — | — |
| `coordonnees.composition.icone-facebook` | composition | carry-both | {"nodeId":"2104:2900","mainComponent":"2053:1259","detail":"INSTANCE Facebook 32x31.857126235961914 > VECTOR I2104:2900; | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/suivezNous/parts/rseauxSociaux/parts/Facebook/icon | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__Facebook"] | **proved** | — | — |
| `coordonnees.composition.icone-instagram` | composition | carry-both | {"nodeId":"2104:2902","mainComponent":"2053:1261","detail":"INSTANCE Instagram 32x32 > VECTOR I2104:2902;2053:1260, fill | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/suivezNous/parts/rseauxSociaux/parts/Instagram/icon | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__Instagram"] | **proved** | — | — |
| `coordonnees.visual.root` | visual | carry-both | {"nodeId":"2104:2904","export":"png@2x"} | ds.coordonnees@2.2.0#/anatomy/root | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__root"] | **proved** | — | — |
| `coordonnees.visual.root-background` | visual | carry-both | {"nodeId":"2104:2904","channel":"fills[0]","detail":"SOLID #F4F6FA lié à VariableID:5:63 — le token {color.bleu-clair} v | ds.coordonnees@2.2.0#/anatomy/root/tokens/background-color | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__root"] | **proved** | — | — |
| `coordonnees.semantic.contact-valeur` | semantic | carry-both | {"nodeId":"2104:2891","detail":"TEXT ContactValeur — contient deux caractères invisibles : U+000D (CR) puis U+2028 (LINE | ds.coordonnees@2.2.0#/anatomy/root/parts/wrapper/parts/Contact/parts/tl32087463266EmailInfopi/text | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__tl32087463266EmailInfopi"] | **proved** | — | — |

## 6. Cas et artefacts

### Cas `coordonnees-master-defaults`

| Mesure | Valeur |
|---|---|
| Verdict | **pass** (probant : true) |
| Node Figma | `2104:2904` @ v`2381581871281042338` — PNG 3456×1194, sha `869e55fa76f2` |
| Rendu généré | `src/components/Coordonnees/Coordonnees.tsx` export `Coordonnees`, bundle `0e51bb9b38bb`, fonts chargées |
| Pixels | brut 0.523 % (seuil 2.5 %) — diagnostic masqué — (hors calcul autoritaire) |
| Régions | `whole` 0.523 %/2.5 % (3973172 px signal) |
| Géométrie racine | Figma 3456×1194 vs généré 3456×1194 (Δ 0×0) — pass |
| Visibilité | signal Figma 3973172 px · généré 3979215 px · contraste ok |
| Motifs | — |

| Assertion sémantique | Sélecteur | Pointeur contractuel | Verdict |
|---|---|---|---|
| `accroche-defaut` | `[class*="SectionHeader__Accroche"]` | `/props/0/default` | pass |
| `titre-defaut` | `[class*="SectionHeader__Titre"]` | `/props/1/default` | pass |
| `adresse-valeur` | `[class*="Coordonnees__AdresseValeur"]` | `/anatomy/root/parts/wrapper/parts/Adresse/parts/AdresseValeur/text` | fail |
| `horaires-valeur` | `[class*="Coordonnees__HorairesValeur"]` | `/anatomy/root/parts/wrapper/parts/Horaires/parts/HorairesValeur/text` | pass |
| `contact-valeur` | `[class*="Coordonnees__tl32087463266EmailInfopi"]` | `/anatomy/root/parts/wrapper/parts/Contact/parts/tl32087463266EmailInfopi/text` | fail |
| `suivez-nous-etiquette` | `[class*="Coordonnees__SuivezNousEtiquette"]` | `/anatomy/root/parts/wrapper/parts/suivezNous/parts/SuivezNousEtiquette/text` | pass |

| Probe de projection (D6) | Prop | Valeur injectée | Valeur observée dans le DOM | Projetée |
|---|---|---|---|---|
| `coordonnees.property.accroche` | `accroche` | "PREUVE-013 — ACCROCHE 4a1e" | PREUVE-013 — ACCROCHE 4a1e | oui |
| `coordonnees.property.titre` | `titre` | [{"text":"PREUVE-013 — TITRE 4a1e"}] | PREUVE-013 — TITRE 4a1e | oui |

| Artefact | Chemin | sha256 | Taille |
|---|---|---|---|
| figma | `specs/013-auditer-fidelite-organismes/proofs/organisms/coordonnees/cases/coordonnees-master-defaults/figma.png` | `3d08f1c33583` | 3456×1194, 932377 o |
| generated | `specs/013-auditer-fidelite-organismes/proofs/organisms/coordonnees/cases/coordonnees-master-defaults/generated.png` | `7d41d921e1c3` | 3456×1194, 1119494 o |
| diff | `specs/013-auditer-fidelite-organismes/proofs/organisms/coordonnees/cases/coordonnees-master-defaults/diff.png` | `586763f0191d` | 3456×1194, 524781 o |
| triptych | `specs/013-auditer-fidelite-organismes/proofs/organisms/coordonnees/cases/coordonnees-master-defaults/triptych.png` | `1e9391ab6bb2` | 2589072 o |
| metadata | `specs/013-auditer-fidelite-organismes/proofs/organisms/coordonnees/cases/coordonnees-master-defaults/metadata.json` | `751c4ced2dfa` | 7179 o |

## 7. Divergences, limites nommées et travaux reportés

- **Divergence** `coordonnees.structure.colonnes-ordre` — source : **contract** — contract-value-differs:root.visualColumnOrder:"row"!="row-reverse"
- **Divergence** `coordonnees.visual.adresse-etiquette-font-size` — source : **contract** — contract-value-differs:AdresseEtiquette.font-size:"{font.size.24}"!="24px"
- **Divergence** `coordonnees.visual.adresse-etiquette-line-height` — source : **contract** — contract-value-differs:AdresseEtiquette.line-height:"{font.line-height.30}"!="30px"
- **Divergence** `coordonnees.visual.adresse-valeur-font-size` — source : **contract** — contract-value-differs:AdresseValeur.font-size:"{font.size.18}"!="18px"
- **Divergence** `coordonnees.visual.adresse-valeur-line-height` — source : **contract** — contract-value-differs:AdresseValeur.line-height:"{font.line-height.27}"!="27px"
- **Divergence** `coordonnees.visual.horaires-etiquette-font-size` — source : **contract** — contract-value-differs:HorairesEtiquette.font-size:"{font.size.24}"!="24px"
- **Divergence** `coordonnees.visual.horaires-etiquette-line-height` — source : **contract** — contract-value-differs:HorairesEtiquette.line-height:"{font.line-height.30}"!="30px"
- **Divergence** `coordonnees.visual.horaires-valeur-font-size` — source : **contract** — contract-value-differs:HorairesValeur.font-size:"{font.size.18}"!="18px"
- **Divergence** `coordonnees.visual.horaires-valeur-line-height` — source : **contract** — contract-value-differs:HorairesValeur.line-height:"{font.line-height.27}"!="27px"
- **Divergence** `coordonnees.visual.contact-etiquette-font-size` — source : **contract** — contract-value-differs:ContactEtiquette.font-size:"{font.size.24}"!="24px"
- **Divergence** `coordonnees.visual.contact-etiquette-line-height` — source : **contract** — contract-value-differs:ContactEtiquette.line-height:"{font.line-height.30}"!="30px"
- **Divergence** `coordonnees.visual.contact-valeur-font-size` — source : **contract** — contract-value-differs:ContactValeur.font-size:"{font.size.18}"!="18px"
- **Divergence** `coordonnees.visual.contact-valeur-line-height` — source : **contract** — contract-value-differs:ContactValeur.line-height:"{font.line-height.27}"!="27px"
- **Divergence** `coordonnees.visual.suivez-nous-etiquette-font-size` — source : **contract** — contract-value-differs:SuivezNousEtiquette.font-size:"{font.size.24}"!="24px"
- **Divergence** `coordonnees.visual.suivez-nous-etiquette-line-height` — source : **contract** — contract-value-differs:SuivezNousEtiquette.line-height:"{font.line-height.30}"!="30px"
- **Limite** `coordonnees.structure.google-map` — representability:carry-with-named-limit
- **Limite déclarée d'avance** `coordonnees.residu-88px` (impact attendu : limited) — Résidu 88 px nommé par l'audit 003 + 005 L5.

## 8. Verdict

**`divergent`** — motifs : `divergent-facts:15`

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
