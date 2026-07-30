# Dossier d'audit — Coordonnees (`ds.coordonnees`)

> Généré depuis `result.json` — le Markdown n'est jamais l'autorité du verdict.

## 1. Identité

| Champ | Valeur |
|---|---|
| Sujet | `coordonnees` (Coordonnees) |
| Vague | 1 |
| Contrat | `ds.coordonnees` v1.0.0 — `contracts/coordonnees.contract.json` |
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
| `coordonnees.structure.root` | structure | carry-both | {"nodeId":"2104:2904","detail":"COMPONENT root 1728x597, layoutMode=GRID (2 colonnes) > [google-map RECTANGLE 2104:2899  | ds.coordonnees@1.0.0#/anatomy/root | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__root"] | **proved** | — | — |
| `coordonnees.structure.wrapper` | structure | carry-both | {"nodeId":"2104:2879","detail":"FRAME wrapper 576x589, layoutMode=VERTICAL, layoutSizingHorizontal=FIXED > [SectionHeade | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__wrapper"] | **proved** | — | — |
| `coordonnees.structure.google-map` | structure | carry-with-named-limit | {"nodeId":"2104:2899","detail":"RECTANGLE google-map 1152x597 (66,7 % de la largeur du composant), fills=[IMAGE] — colon | ds.coordonnees@1.0.0#/anatomy/root/parts/googleMap | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__googleMap"] | **not-proven** | — | leg-unavailable:generated; agreement-unknown |
| `coordonnees.structure.colonnes-ordre` | structure | carry-both | 2104:2904#root.visualColumnOrder | ds.coordonnees@1.0.0#/anatomy/root/layout/direction | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__root"] | **divergent** | contract | contract-value-differs:root.visualColumnOrder:"row"!="row-reverse" |
| `coordonnees.structure.gap-wrapper` | structure | carry-both | 2104:2904#wrapper.itemSpacing | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/literals/gap | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__wrapper"] | **divergent** | contract | contract-does-not-carry-figma-fact:wrapper.itemSpacing="16px" |
| `coordonnees.structure.padding-block-wrapper` | structure | carry-both | 2104:2904#wrapper.paddingTop+paddingBottom | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/literals/padding-block | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__wrapper"] | **divergent** | contract | contract-does-not-carry-figma-fact:wrapper.paddingTop+paddingBottom="48px" |
| `coordonnees.structure.padding-inline-wrapper` | structure | carry-both | 2104:2904#wrapper.paddingLeft+paddingRight | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/literals/padding-inline | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__wrapper"] | **divergent** | contract | contract-does-not-carry-figma-fact:wrapper.paddingLeft+paddingRight="48px" |
| `coordonnees.structure.width-wrapper` | structure | carry-both | 2104:2904#wrapper.absoluteBoundingBox.width | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/literals/width | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__wrapper"] | **divergent** | contract | contract-does-not-carry-figma-fact:wrapper.absoluteBoundingBox.width="576px" |
| `coordonnees.structure.gap-adresse` | structure | carry-both | 2104:2904#Adresse.itemSpacing | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Adresse/literals/gap | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__Adresse"] | **divergent** | contract | contract-does-not-carry-figma-fact:Adresse.itemSpacing="8px" |
| `coordonnees.structure.gap-horaires` | structure | carry-both | 2104:2904#Horaires.itemSpacing | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Horaires/literals/gap | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__Horaires"] | **divergent** | contract | contract-does-not-carry-figma-fact:Horaires.itemSpacing="8px" |
| `coordonnees.structure.gap-contact` | structure | carry-both | 2104:2904#Contact.itemSpacing | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Contact/literals/gap | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__Contact"] | **divergent** | contract | contract-does-not-carry-figma-fact:Contact.itemSpacing="8px" |
| `coordonnees.structure.gap-suivez-nous` | structure | carry-both | 2104:2904#suivezNous.itemSpacing | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/suivezNous/literals/gap | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__suivezNous"] | **divergent** | contract | contract-does-not-carry-figma-fact:suivezNous.itemSpacing="8px" |
| `coordonnees.structure.gap-reseaux-sociaux` | structure | carry-both | 2104:2904#rseauxSociaux.itemSpacing | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/suivezNous/parts/rseauxSociaux/literals/gap | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__rseauxSociaux"] | **divergent** | contract | contract-does-not-carry-figma-fact:rseauxSociaux.itemSpacing="16px" |
| `coordonnees.property.accroche` | property | carry-both | {"nodeId":"2104:2904","property":"Accroche#2104:57","detail":"Propriété TEXT du COMPONENT racine (defaultValue \"Contact | ds.coordonnees@1.0.0#/props/0 | src/components/Coordonnees/Coordonnees.tsx#[class*="SectionHeader__Accroche"] | **divergent** | generated | probe-not-projected:child-renders-a-literal |
| `coordonnees.property.titre` | property | carry-both | {"nodeId":"2104:2904","property":"Titre#2104:58","detail":"Propriété TEXT du COMPONENT racine (defaultValue \"Nos coordo | ds.coordonnees@1.0.0#/props/1 | src/components/Coordonnees/Coordonnees.tsx#[class*="SectionHeader__Titre"] | **divergent** | generated | probe-not-projected:child-renders-a-literal |
| `coordonnees.content.accroche` | content | carry-both | {"nodeId":"2104:2904","property":"Accroche#2104:57","textLayer":"I2169:6216;2090:2386"} | ds.coordonnees@1.0.0#/props/0/default | src/components/Coordonnees/Coordonnees.tsx#[class*="SectionHeader__Accroche"] | **proved** | — | — |
| `coordonnees.content.titre` | content | carry-both | {"nodeId":"2104:2904","property":"Titre#2104:58","textLayer":"I2169:6216;2090:2387"} | ds.coordonnees@1.0.0#/props/1/default | src/components/Coordonnees/Coordonnees.tsx#[class*="SectionHeader__Titre"] | **proved** | — | — |
| `coordonnees.content.adresse-etiquette` | content | carry-both | {"nodeId":"2104:2884","detail":"TEXT layer AdresseEtiquette","channel":"characters"} | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Adresse/parts/AdresseEtiquette/text | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__AdresseEtiquette"] | **proved** | — | — |
| `coordonnees.visual.adresse-etiquette-font-size` | visual | carry-both | 2104:2904#AdresseEtiquette.font-size | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Adresse/parts/AdresseEtiquette/tokens/font-size | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__AdresseEtiquette"] | **divergent** | contract | contract-does-not-carry-figma-fact:AdresseEtiquette.font-size="24px" |
| `coordonnees.visual.adresse-etiquette-line-height` | visual | carry-both | 2104:2904#AdresseEtiquette.line-height | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Adresse/parts/AdresseEtiquette/tokens/line-height | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__AdresseEtiquette"] | **divergent** | contract | contract-does-not-carry-figma-fact:AdresseEtiquette.line-height="30px" |
| `coordonnees.content.adresse-valeur` | content | carry-both | {"nodeId":"2104:2885","detail":"TEXT layer AdresseValeur","channel":"characters"} | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Adresse/parts/AdresseValeur/text | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__AdresseValeur"] | **proved** | — | — |
| `coordonnees.visual.adresse-valeur-font-size` | visual | carry-both | 2104:2904#AdresseValeur.font-size | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Adresse/parts/AdresseValeur/tokens/font-size | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__AdresseValeur"] | **divergent** | contract | contract-does-not-carry-figma-fact:AdresseValeur.font-size="18px" |
| `coordonnees.visual.adresse-valeur-line-height` | visual | carry-both | 2104:2904#AdresseValeur.line-height | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Adresse/parts/AdresseValeur/tokens/line-height | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__AdresseValeur"] | **divergent** | contract | contract-does-not-carry-figma-fact:AdresseValeur.line-height="27px" |
| `coordonnees.content.horaires-etiquette` | content | carry-both | {"nodeId":"2104:2887","detail":"TEXT layer HorairesEtiquette","channel":"characters"} | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Horaires/parts/HorairesEtiquette/text | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__HorairesEtiquette"] | **proved** | — | — |
| `coordonnees.visual.horaires-etiquette-font-size` | visual | carry-both | 2104:2904#HorairesEtiquette.font-size | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Horaires/parts/HorairesEtiquette/tokens/font-size | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__HorairesEtiquette"] | **divergent** | contract | contract-does-not-carry-figma-fact:HorairesEtiquette.font-size="24px" |
| `coordonnees.visual.horaires-etiquette-line-height` | visual | carry-both | 2104:2904#HorairesEtiquette.line-height | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Horaires/parts/HorairesEtiquette/tokens/line-height | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__HorairesEtiquette"] | **divergent** | contract | contract-does-not-carry-figma-fact:HorairesEtiquette.line-height="30px" |
| `coordonnees.content.horaires-valeur` | content | carry-both | {"nodeId":"2104:2888","detail":"TEXT layer HorairesValeur","channel":"characters"} | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Horaires/parts/HorairesValeur/text | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__HorairesValeur"] | **proved** | — | — |
| `coordonnees.visual.horaires-valeur-font-size` | visual | carry-both | 2104:2904#HorairesValeur.font-size | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Horaires/parts/HorairesValeur/tokens/font-size | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__HorairesValeur"] | **divergent** | contract | contract-does-not-carry-figma-fact:HorairesValeur.font-size="18px" |
| `coordonnees.visual.horaires-valeur-line-height` | visual | carry-both | 2104:2904#HorairesValeur.line-height | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Horaires/parts/HorairesValeur/tokens/line-height | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__HorairesValeur"] | **divergent** | contract | contract-does-not-carry-figma-fact:HorairesValeur.line-height="27px" |
| `coordonnees.content.contact-etiquette` | content | carry-both | {"nodeId":"2104:2890","detail":"TEXT layer ContactEtiquette","channel":"characters"} | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Contact/parts/ContactEtiquette/text | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__ContactEtiquette"] | **proved** | — | — |
| `coordonnees.visual.contact-etiquette-font-size` | visual | carry-both | 2104:2904#ContactEtiquette.font-size | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Contact/parts/ContactEtiquette/tokens/font-size | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__ContactEtiquette"] | **divergent** | contract | contract-does-not-carry-figma-fact:ContactEtiquette.font-size="24px" |
| `coordonnees.visual.contact-etiquette-line-height` | visual | carry-both | 2104:2904#ContactEtiquette.line-height | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Contact/parts/ContactEtiquette/tokens/line-height | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__ContactEtiquette"] | **divergent** | contract | contract-does-not-carry-figma-fact:ContactEtiquette.line-height="30px" |
| `coordonnees.content.contact-valeur` | content | carry-both | {"nodeId":"2104:2891","detail":"TEXT layer ContactValeur","channel":"characters"} | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Contact/parts/tl32087463266EmailInfopi/text | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__tl32087463266EmailInfopi"] | **proved** | — | — |
| `coordonnees.visual.contact-valeur-font-size` | visual | carry-both | 2104:2904#ContactValeur.font-size | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Contact/parts/tl32087463266EmailInfopi/tokens/font-size | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__tl32087463266EmailInfopi"] | **divergent** | contract | contract-does-not-carry-figma-fact:ContactValeur.font-size="18px" |
| `coordonnees.visual.contact-valeur-line-height` | visual | carry-both | 2104:2904#ContactValeur.line-height | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Contact/parts/tl32087463266EmailInfopi/tokens/line-height | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__tl32087463266EmailInfopi"] | **divergent** | contract | contract-does-not-carry-figma-fact:ContactValeur.line-height="27px" |
| `coordonnees.content.suivez-nous-etiquette` | content | carry-both | {"nodeId":"2104:2893","detail":"TEXT layer SuivezNousEtiquette","channel":"characters"} | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/suivezNous/parts/SuivezNousEtiquette/text | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__SuivezNousEtiquette"] | **proved** | — | — |
| `coordonnees.visual.suivez-nous-etiquette-font-size` | visual | carry-both | 2104:2904#SuivezNousEtiquette.font-size | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/suivezNous/parts/SuivezNousEtiquette/tokens/font-size | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__SuivezNousEtiquette"] | **divergent** | contract | contract-does-not-carry-figma-fact:SuivezNousEtiquette.font-size="24px" |
| `coordonnees.visual.suivez-nous-etiquette-line-height` | visual | carry-both | 2104:2904#SuivezNousEtiquette.line-height | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/suivezNous/parts/SuivezNousEtiquette/tokens/line-height | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__SuivezNousEtiquette"] | **divergent** | contract | contract-does-not-carry-figma-fact:SuivezNousEtiquette.line-height="30px" |
| `coordonnees.composition.section-header` | composition | carry-both | {"nodeId":"2169:6216","mainComponent":"2090:2385","observedInstanceProperties":{"Accroche2#2169:64":true,"Titre#2090:47" | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/SectionHeader/component | src/components/Coordonnees/Coordonnees.tsx#[class*="SectionHeader__root"] | **proved** | — | — |
| `coordonnees.composition.section-header-props` | composition | carry-both | 2104:2904#SectionHeader.props.titre | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/SectionHeader/component/props/titre | src/components/Coordonnees/Coordonnees.tsx#[class*="SectionHeader__Titre"] | **divergent** | contract | contract-value-differs:SectionHeader.props.titre:"Nos coordonnées"!="{titre}" |
| `coordonnees.composition.section-header-accroche` | composition | carry-both | 2104:2904#SectionHeader.props.accroche | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/SectionHeader/component/props/accroche | src/components/Coordonnees/Coordonnees.tsx#[class*="SectionHeader__Accroche"] | **divergent** | contract | contract-value-differs:SectionHeader.props.accroche:"Contact"!="{accroche}" |
| `coordonnees.composition.icone-facebook` | composition | carry-both | {"nodeId":"2104:2900","mainComponent":"2053:1259","detail":"INSTANCE Facebook 32x31.857126235961914 > VECTOR I2104:2900; | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/suivezNous/parts/rseauxSociaux/parts/Facebook/icon | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__Facebook"] | **proved** | — | — |
| `coordonnees.composition.icone-instagram` | composition | carry-both | {"nodeId":"2104:2902","mainComponent":"2053:1261","detail":"INSTANCE Instagram 32x32 > VECTOR I2104:2902;2053:1260, fill | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/suivezNous/parts/rseauxSociaux/parts/Instagram/icon | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__Instagram"] | **proved** | — | — |
| `coordonnees.visual.root` | visual | carry-both | {"nodeId":"2104:2904","export":"png@2x"} | ds.coordonnees@1.0.0#/anatomy/root | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__root"] | **divergent** | comparison | raw-over-threshold:8.989682207332962>2.5; region-over-budget:whole:8.989682207332962>2.5 |
| `coordonnees.visual.root-background` | visual | carry-both | {"nodeId":"2104:2904","channel":"fills[0]","detail":"SOLID #F4F6FA lié à VariableID:5:63 — le token {color.bleu-clair} v | ds.coordonnees@1.0.0#/anatomy/root/tokens/background-color | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__root"] | **divergent** | comparison | raw-over-threshold:8.989682207332962>2.5; region-over-budget:whole:8.989682207332962>2.5 |
| `coordonnees.semantic.contact-valeur` | semantic | carry-both | {"nodeId":"2104:2891","detail":"TEXT ContactValeur — contient deux caractères invisibles : U+000D (CR) puis U+2028 (LINE | ds.coordonnees@1.0.0#/anatomy/root/parts/wrapper/parts/Contact/parts/tl32087463266EmailInfopi/text | src/components/Coordonnees/Coordonnees.tsx#[class*="Coordonnees__tl32087463266EmailInfopi"] | **proved** | — | — |

## 6. Cas et artefacts

### Cas `coordonnees-master-defaults`

| Mesure | Valeur |
|---|---|
| Verdict | **fail** (probant : true) |
| Node Figma | `2104:2904` @ v`2381581871281042338` — PNG 3456×1194, sha `869e55fa76f2` |
| Rendu généré | `src/components/Coordonnees/Coordonnees.tsx` export `Coordonnees`, bundle `ad3218cf8082`, fonts chargées |
| Pixels | brut 8.990 % (seuil 2.5 %) — diagnostic masqué 8.538 % (hors calcul autoritaire) |
| Régions | `whole` 8.990 %/2.5 % (1738368 px signal) |
| Géométrie racine | Figma 3456×1194 vs généré 3456×503 (Δ 0×-691) — fail |
| Visibilité | signal Figma 3973172 px · généré 1738368 px · contraste ok |
| Motifs | `raw-over-threshold:8.989682207332962>2.5`, `region-over-budget:whole:8.989682207332962>2.5` |

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
| `coordonnees.property.accroche` | `accroche` | "PREUVE-013 — ACCROCHE 4a1e" | Contact | **non** |
| `coordonnees.property.titre` | `titre` | "PREUVE-013 — TITRE 4a1e" | Nos coordonnées | **non** |

| Artefact | Chemin | sha256 | Taille |
|---|---|---|---|
| figma | `specs/013-auditer-fidelite-organismes/proofs/organisms/coordonnees/cases/coordonnees-master-defaults/figma.png` | `3d08f1c33583` | 3456×1194, 932377 o |
| generated | `specs/013-auditer-fidelite-organismes/proofs/organisms/coordonnees/cases/coordonnees-master-defaults/generated.png` | `fd6bc308aafd` | 3456×1194, 112102 o |
| diff | `specs/013-auditer-fidelite-organismes/proofs/organisms/coordonnees/cases/coordonnees-master-defaults/diff.png` | `f82bf1cdb083` | 3456×1194, 201831 o |
| triptych | `specs/013-auditer-fidelite-organismes/proofs/organisms/coordonnees/cases/coordonnees-master-defaults/triptych.png` | `7140d99e85f7` | 1310806 o |
| metadata | `specs/013-auditer-fidelite-organismes/proofs/organisms/coordonnees/cases/coordonnees-master-defaults/metadata.json` | `38ccb714a9a5` | 7034 o |

## 7. Divergences, limites nommées et travaux reportés

- **Divergence** `coordonnees.structure.colonnes-ordre` — source : **contract** — contract-value-differs:root.visualColumnOrder:"row"!="row-reverse"
- **Divergence** `coordonnees.structure.gap-wrapper` — source : **contract** — contract-does-not-carry-figma-fact:wrapper.itemSpacing="16px"
- **Divergence** `coordonnees.structure.padding-block-wrapper` — source : **contract** — contract-does-not-carry-figma-fact:wrapper.paddingTop+paddingBottom="48px"
- **Divergence** `coordonnees.structure.padding-inline-wrapper` — source : **contract** — contract-does-not-carry-figma-fact:wrapper.paddingLeft+paddingRight="48px"
- **Divergence** `coordonnees.structure.width-wrapper` — source : **contract** — contract-does-not-carry-figma-fact:wrapper.absoluteBoundingBox.width="576px"
- **Divergence** `coordonnees.structure.gap-adresse` — source : **contract** — contract-does-not-carry-figma-fact:Adresse.itemSpacing="8px"
- **Divergence** `coordonnees.structure.gap-horaires` — source : **contract** — contract-does-not-carry-figma-fact:Horaires.itemSpacing="8px"
- **Divergence** `coordonnees.structure.gap-contact` — source : **contract** — contract-does-not-carry-figma-fact:Contact.itemSpacing="8px"
- **Divergence** `coordonnees.structure.gap-suivez-nous` — source : **contract** — contract-does-not-carry-figma-fact:suivezNous.itemSpacing="8px"
- **Divergence** `coordonnees.structure.gap-reseaux-sociaux` — source : **contract** — contract-does-not-carry-figma-fact:rseauxSociaux.itemSpacing="16px"
- **Divergence** `coordonnees.property.accroche` — source : **generated** — probe-not-projected:child-renders-a-literal
- **Divergence** `coordonnees.property.titre` — source : **generated** — probe-not-projected:child-renders-a-literal
- **Divergence** `coordonnees.visual.adresse-etiquette-font-size` — source : **contract** — contract-does-not-carry-figma-fact:AdresseEtiquette.font-size="24px"
- **Divergence** `coordonnees.visual.adresse-etiquette-line-height` — source : **contract** — contract-does-not-carry-figma-fact:AdresseEtiquette.line-height="30px"
- **Divergence** `coordonnees.visual.adresse-valeur-font-size` — source : **contract** — contract-does-not-carry-figma-fact:AdresseValeur.font-size="18px"
- **Divergence** `coordonnees.visual.adresse-valeur-line-height` — source : **contract** — contract-does-not-carry-figma-fact:AdresseValeur.line-height="27px"
- **Divergence** `coordonnees.visual.horaires-etiquette-font-size` — source : **contract** — contract-does-not-carry-figma-fact:HorairesEtiquette.font-size="24px"
- **Divergence** `coordonnees.visual.horaires-etiquette-line-height` — source : **contract** — contract-does-not-carry-figma-fact:HorairesEtiquette.line-height="30px"
- **Divergence** `coordonnees.visual.horaires-valeur-font-size` — source : **contract** — contract-does-not-carry-figma-fact:HorairesValeur.font-size="18px"
- **Divergence** `coordonnees.visual.horaires-valeur-line-height` — source : **contract** — contract-does-not-carry-figma-fact:HorairesValeur.line-height="27px"
- **Divergence** `coordonnees.visual.contact-etiquette-font-size` — source : **contract** — contract-does-not-carry-figma-fact:ContactEtiquette.font-size="24px"
- **Divergence** `coordonnees.visual.contact-etiquette-line-height` — source : **contract** — contract-does-not-carry-figma-fact:ContactEtiquette.line-height="30px"
- **Divergence** `coordonnees.visual.contact-valeur-font-size` — source : **contract** — contract-does-not-carry-figma-fact:ContactValeur.font-size="18px"
- **Divergence** `coordonnees.visual.contact-valeur-line-height` — source : **contract** — contract-does-not-carry-figma-fact:ContactValeur.line-height="27px"
- **Divergence** `coordonnees.visual.suivez-nous-etiquette-font-size` — source : **contract** — contract-does-not-carry-figma-fact:SuivezNousEtiquette.font-size="24px"
- **Divergence** `coordonnees.visual.suivez-nous-etiquette-line-height` — source : **contract** — contract-does-not-carry-figma-fact:SuivezNousEtiquette.line-height="30px"
- **Divergence** `coordonnees.composition.section-header-props` — source : **contract** — contract-value-differs:SectionHeader.props.titre:"Nos coordonnées"!="{titre}"
- **Divergence** `coordonnees.composition.section-header-accroche` — source : **contract** — contract-value-differs:SectionHeader.props.accroche:"Contact"!="{accroche}"
- **Divergence** `coordonnees.visual.root` — source : **comparison** — raw-over-threshold:8.989682207332962>2.5 ; region-over-budget:whole:8.989682207332962>2.5
- **Divergence** `coordonnees.visual.root-background` — source : **comparison** — raw-over-threshold:8.989682207332962>2.5 ; region-over-budget:whole:8.989682207332962>2.5
- **Non prouvé** `coordonnees.structure.google-map` — leg-unavailable:generated ; agreement-unknown
- **Limite déclarée d'avance** `coordonnees.residu-88px` (impact attendu : limited) — Résidu 88 px nommé par l'audit 003 + 005 L5.

## 8. Verdict

**`divergent`** — motifs : `divergent-facts:30`, `failed-cases:1`

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
