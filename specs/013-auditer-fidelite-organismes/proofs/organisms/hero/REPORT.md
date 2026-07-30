# Dossier d'audit — Hero (`ds.hero`)

> Généré depuis `result.json` — le Markdown n'est jamais l'autorité du verdict.

## 1. Identité

| Champ | Valeur |
|---|---|
| Sujet | `hero` (Hero) |
| Vague | 1 |
| Contrat | `ds.hero` v1.3.0 — `contracts/hero.contract.json` |
| Node master Figma | `2111:3382` |
| Référence Figma | `d9FYAUcqdcNtsuaMgLefvJ` @ version `2381581871281042338` (lecture seule) |

## 2. Audits de propreté réutilisés (Step 0)

- `specs/003-externalize-figma-components/audits/hero.md`
- `specs/010-extract-molecules-organisms/audit-reuse-map.md`

## 3. Dépendance

Aucune — cet organisme ne déclare pas de dépendance de clôture.

## 4. Couverture exacte

- attendus : 37
- observés : 37
- manquants : **aucun**
- inattendus : **aucun**

## 5. Faits

| Fait | Catégorie | Représentabilité | Jambe Figma | Jambe contrat | Jambe générée | Verdict | Source localisée | Motifs |
|---|---|---|---|---|---|---|---|---|
| `hero.structure.root` | structure | carry-both | {"nodeId":"2111:3382","detail":"COMPONENT autonome \"Hero\" (aucun COMPONENT_SET, une seule variante) 1728x640 FIXED/FIX | ds.hero@1.3.0#/anatomy/root | src/components/Hero/Hero.tsx#[class*="Hero__root"] | **proved** | — | — |
| `hero.property.aucune-propriete-exposee` | property | carry-both | {"nodeId":"2111:3382","detail":"componentPropertyDefinitions ABSENT du master (clés du node : absoluteBoundingBox, absol | ds.hero@1.3.0#/props | src/components/Hero/Hero.tsx#[class*="Hero__root"] | **proved** | — | — |
| `hero.structure.bloc-texte` | structure | carry-both | {"nodeId":"2111:3376","detail":"FRAME \"Bloc texte\" 1728x292, layoutMode=VERTICAL layoutGrow=1 layoutSizingHorizontal=F | ds.hero@1.3.0#/anatomy/root/parts/blocTexte | src/components/Hero/Hero.tsx#[class*="Hero__blocTexte"] | **proved** | — | — |
| `hero.structure.titres` | structure | carry-both | {"nodeId":"2111:3377","detail":"FRAME \"Titres\" 1728x292, layoutMode=VERTICAL layoutAlign=STRETCH layoutSizingHorizonta | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres | src/components/Hero/Hero.tsx#[class*="Hero__Titres"] | **proved** | — | — |
| `hero.structure.wrapper` | structure | carry-both | {"nodeId":"2111:3379","detail":"FRAME \"wrapper\" 1550x64, layoutMode=HORIZONTAL primaryAxis=CENTER counterAxis=MAX layo | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/wrapper | src/components/Hero/Hero.tsx#[class*="Hero__wrapper"] | **proved** | — | — |
| `hero.content.sous-titre` | content | carry-both | {"nodeId":"2111:3380","detail":"TEXT \"Sous-titre\" — characters littéraux du master (aucune propriété TEXT ne les pilot | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/wrapper/parts/sousTitre/text | src/components/Hero/Hero.tsx#[class*="Hero__sousTitre"] | **proved** | — | — |
| `hero.semantic.sous-titre-element` | semantic | carry-both | {"nodeId":"2111:3380","detail":"TEXT layer \"Sous-titre\" — projeté en <span> par l'émetteur react (part sans element dé | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/wrapper/parts/sousTitre | src/components/Hero/Hero.tsx#[class*="Hero__sousTitre"] | **proved** | — | — |
| `hero.composition.section-header` | composition | carry-both | {"nodeId":"2169:6264","mainComponent":"2090:2385","observedInstanceProperties":{"Accroche2#2169:64":false,"Titre#2090:47 | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/SectionHeader/component | src/components/Hero/Hero.tsx#[class*="SectionHeader__root"] | **proved** | — | — |
| `hero.composition.button` | composition | carry-both | {"nodeId":"2111:3381","mainComponent":"6:135","observedInstanceProperties":{"Libelle#2044:28":"Demander un devis gratuit | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/wrapper/parts/Bouton/component | src/components/Hero/Hero.tsx#[class*="Button__root"] | **proved** | — | — |
| `hero.visual.root` | visual | carry-both | {"nodeId":"2111:3382","export":"png@2x"} | ds.hero@1.3.0#/anatomy/root | src/components/Hero/Hero.tsx#[class*="Hero__root"] | **divergent** | comparison | raw-over-threshold:27.82904730902778>2.5; region-over-budget:whole:27.82904730902778>2.5 |
| `hero.structure.gap-root` | structure | carry-both | 2111:3382#root.gap | ds.hero@1.3.0#/anatomy/root/literals/gap | src/components/Hero/Hero.tsx#[class*="Hero__root"] | **proved** | — | — |
| `hero.structure.gap-bloc-texte` | structure | carry-both | 2111:3382#blocTexte.gap | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/literals/gap | src/components/Hero/Hero.tsx#[class*="Hero__blocTexte"] | **proved** | — | — |
| `hero.structure.gap-titres` | structure | carry-both | 2111:3382#Titres.gap | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/literals/gap | src/components/Hero/Hero.tsx#[class*="Hero__Titres"] | **proved** | — | — |
| `hero.structure.gap-wrapper` | structure | carry-both | 2111:3382#wrapper.gap | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/wrapper/literals/gap | src/components/Hero/Hero.tsx#[class*="Hero__wrapper"] | **proved** | — | — |
| `hero.structure.padding-titres-top` | structure | carry-both | 2111:3382#Titres.padding-top | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/literals/padding-top | src/components/Hero/Hero.tsx#[class*="Hero__Titres"] | **proved** | — | — |
| `hero.structure.padding-titres-bottom` | structure | carry-both | 2111:3382#Titres.padding-bottom | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/literals/padding-bottom | src/components/Hero/Hero.tsx#[class*="Hero__Titres"] | **proved** | — | — |
| `hero.structure.padding-titres-left` | structure | carry-both | 2111:3382#Titres.padding-left | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/literals/padding-left | src/components/Hero/Hero.tsx#[class*="Hero__Titres"] | **proved** | — | — |
| `hero.structure.padding-titres-right` | structure | carry-both | 2111:3382#Titres.padding-right | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/literals/padding-right | src/components/Hero/Hero.tsx#[class*="Hero__Titres"] | **proved** | — | — |
| `hero.structure.root-height` | structure | carry-both | 2111:3382#root.height | ds.hero@1.3.0#/anatomy/root/literals/height | src/components/Hero/Hero.tsx#[class*="Hero__root"] | **proved** | — | — |
| `hero.structure.sous-titre-grow` | structure | carry-both | 2111:3382#sousTitre.layout.grow | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/wrapper/parts/sousTitre/layout/grow | src/components/Hero/Hero.tsx#[class*="Hero__sousTitre"] | **proved** | — | — |
| `hero.structure.section-header-fill` | structure | carry-both | 2111:3382#SectionHeader.layoutSizingHorizontal | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/SectionHeader/literals/width | src/components/Hero/Hero.tsx#[class*="SectionHeader__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:SectionHeader.layoutSizingHorizontal="FILL" |
| `hero.visual.sous-titre-font-size` | visual | carry-both | 2111:3382#sousTitre.font-size | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/wrapper/parts/sousTitre/tokens/font-size | src/components/Hero/Hero.tsx#[class*="Hero__sousTitre"] | **proved** | — | — |
| `hero.visual.sous-titre-line-height` | visual | carry-both | 2111:3382#sousTitre.line-height | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/wrapper/parts/sousTitre/tokens/line-height | src/components/Hero/Hero.tsx#[class*="Hero__sousTitre"] | **proved** | — | — |
| `hero.visual.root-image-fill` | visual | carry-both | 2111:3382#root.fills[0].IMAGE.imageRef | ds.hero@1.3.0#/anatomy/root/literals/background-image | src/components/Hero/Hero.tsx#[class*="Hero__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:root.fills[0].IMAGE.imageRef="b9ae58d2e309c55241eb843c1a36d90d087c1483" |
| `hero.visual.root-gradient-overlay` | visual | carry-both | 2111:3382#root.fills[2].GRADIENT_LINEAR | ds.hero@1.3.0#/anatomy/root/literals/background-image | src/components/Hero/Hero.tsx#[class*="Hero__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:root.fills[2].GRADIENT_LINEAR="linear-gradient(to top, rgba(0,0,0,0) 75%, rgba(0,0,0, |
| `hero.visual.titres-gradient` | visual | carry-both | 2111:3382#Titres.fills[0].GRADIENT_LINEAR | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/literals/background-image | src/components/Hero/Hero.tsx#[class*="Hero__Titres"] | **divergent** | contract | contract-does-not-carry-figma-fact:Titres.fills[0].GRADIENT_LINEAR="linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0, |
| `hero.composition.section-header-titre` | composition | carry-both | 2111:3382#SectionHeader.Titre | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/SectionHeader/component/props/titre | src/components/Hero/Hero.tsx#[class*="SectionHeader__Titre"] | **divergent** | contract | contract-value-differs:SectionHeader.Titre:[{"text":"Portes de garage","strong":true},{"text":" industrielles"}]!="Porte |
| `hero.composition.section-header-accroche` | composition | carry-both | 2111:3382#SectionHeader.Accroche | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/SectionHeader/component/props/accroche | src/components/Hero/Hero.tsx#[class*="SectionHeader__Accroche"] | **proved** | — | — |
| `hero.composition.section-header-disposition` | composition | carry-both | 2111:3382#SectionHeader.Disposition (VARIANT "Standard" → valeur d'enum contractuelle "standard", mappage déclaré par ds | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/SectionHeader/component/props/disposition | src/components/Hero/Hero.tsx#[class*="SectionHeader__root"] | **proved** | — | — |
| `hero.composition.section-header-accroche2` | composition | carry-both | 2111:3382#SectionHeader.Accroche2 (BOOLEAN) | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/SectionHeader/component/props/accroche2 | src/components/Hero/Hero.tsx#[class*="SectionHeader__Accroche"] | **proved** | — | — |
| `hero.visual.section-header-titre-color` | visual | carry-both | 2111:3382#SectionHeader.Titre.color | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/SectionHeader/tokens/color | src/components/Hero/Hero.tsx#[class*="SectionHeader__Titre"] | **divergent** | contract | contract-does-not-carry-figma-fact:SectionHeader.Titre.color="{color.blanc}" |
| `hero.visual.section-header-titre-font-size` | visual | carry-both | 2111:3382#SectionHeader.Titre.font-size | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/SectionHeader/tokens/font-size | src/components/Hero/Hero.tsx#[class*="SectionHeader__Titre"] | **divergent** | contract | contract-does-not-carry-figma-fact:SectionHeader.Titre.font-size="54px" |
| `hero.visual.section-header-titre-line-height` | visual | carry-both | 2111:3382#SectionHeader.Titre.line-height | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/SectionHeader/tokens/line-height | src/components/Hero/Hero.tsx#[class*="SectionHeader__Titre"] | **divergent** | contract | contract-does-not-carry-figma-fact:SectionHeader.Titre.line-height="68px" |
| `hero.visual.section-header-titre-font-weight` | visual | carry-both | 2111:3382#SectionHeader.Titre.font-weight | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/SectionHeader/tokens/font-weight | src/components/Hero/Hero.tsx#[class*="SectionHeader__Titre"] | **divergent** | contract | contract-does-not-carry-figma-fact:SectionHeader.Titre.font-weight="700" |
| `hero.composition.button-libelle` | composition | carry-both | 2111:3382#Bouton.Libelle | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/wrapper/parts/Bouton/component/text | src/components/Hero/Hero.tsx#[class*="Button__root"] | **proved** | — | — |
| `hero.composition.button-variant` | composition | carry-both | 2111:3382#Bouton.Style (VARIANT "Outline blanc" → valeur d'enum contractuelle "outlineBlanc", mappage déclaré par ds.but | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/wrapper/parts/Bouton/component/props/variant | src/components/Hero/Hero.tsx#[class*="Button__root"] | **proved** | — | — |
| `hero.composition.button-icone-droite` | composition | carry-both | 2111:3382#Bouton.Icone droite (BOOLEAN) | ds.hero@1.3.0#/anatomy/root/parts/blocTexte/parts/Titres/parts/wrapper/parts/Bouton/component/props/iconRight | src/components/Hero/Hero.tsx#[class*="Button__root"] | **proved** | — | — |

## 6. Cas et artefacts

### Cas `hero-master-defaults`

| Mesure | Valeur |
|---|---|
| Verdict | **fail** (probant : true) |
| Node Figma | `2111:3382` @ v`2381581871281042338` — PNG 3456×1280, sha `dfb4ac2b8fa2` |
| Rendu généré | `src/components/Hero/Hero.tsx` export `Hero`, bundle `ca7b7c8a91d1`, fonts chargées |
| Pixels | brut 27.829 % (seuil 2.5 %) — diagnostic masqué — (hors calcul autoritaire) |
| Régions | `whole` 27.829 %/2.5 % (4336683 px signal) |
| Géométrie racine | Figma 3456×1280 vs généré 3456×1280 (Δ 0×0) — pass |
| Visibilité | signal Figma 4349312 px · généré 4336683 px · contraste ok |
| Motifs | `raw-over-threshold:27.82904730902778>2.5`, `region-over-budget:whole:27.82904730902778>2.5` |

| Assertion sémantique | Sélecteur | Pointeur contractuel | Verdict |
|---|---|---|---|
| `sous-titre-element` | `[class*="Hero__sousTitre"]` | `/anatomy/root/parts/blocTexte/parts/Titres/parts/wrapper/parts/sousTitre/text` | pass |
| `section-header-titre` | `[class*="SectionHeader__Titre"]` | `/anatomy/root/parts/blocTexte/parts/Titres/parts/SectionHeader/component/props/titre` | pass |
| `section-header-accroche-rendue` | `[class*="SectionHeader__Accroche"]` | `/anatomy/root/parts/blocTexte/parts/Titres/parts/SectionHeader/component/props/accroche` | fail |
| `button-libelle-defaut-de-l-enfant` | `[class*="Button__root"]` | `/anatomy/root/parts/blocTexte/parts/Titres/parts/wrapper/parts/Bouton/component` | fail |

| Artefact | Chemin | sha256 | Taille |
|---|---|---|---|
| figma | `specs/013-auditer-fidelite-organismes/proofs/organisms/hero/cases/hero-master-defaults/figma.png` | `595fa3df930b` | 3456×1280, 3992283 o |
| generated | `specs/013-auditer-fidelite-organismes/proofs/organisms/hero/cases/hero-master-defaults/generated.png` | `14c7bb50de3f` | 3456×1280, 3801862 o |
| diff | `specs/013-auditer-fidelite-organismes/proofs/organisms/hero/cases/hero-master-defaults/diff.png` | `e8ecd9e3bc56` | 3456×1280, 689250 o |
| triptych | `specs/013-auditer-fidelite-organismes/proofs/organisms/hero/cases/hero-master-defaults/triptych.png` | `4d3920a80415` | 8787631 o |
| metadata | `specs/013-auditer-fidelite-organismes/proofs/organisms/hero/cases/hero-master-defaults/metadata.json` | `f4f37173250e` | 5473 o |

## 7. Divergences, limites nommées et travaux reportés

- **Divergence** `hero.visual.root` — source : **comparison** — raw-over-threshold:27.82904730902778>2.5 ; region-over-budget:whole:27.82904730902778>2.5
- **Divergence** `hero.structure.section-header-fill` — source : **contract** — contract-does-not-carry-figma-fact:SectionHeader.layoutSizingHorizontal="FILL"
- **Divergence** `hero.visual.root-image-fill` — source : **contract** — contract-does-not-carry-figma-fact:root.fills[0].IMAGE.imageRef="b9ae58d2e309c55241eb843c1a36d90d087c1483"
- **Divergence** `hero.visual.root-gradient-overlay` — source : **contract** — contract-does-not-carry-figma-fact:root.fills[2].GRADIENT_LINEAR="linear-gradient(to top, rgba(0,0,0,0) 75%, rgba(0,0,0,0.5) 100%)"
- **Divergence** `hero.visual.titres-gradient` — source : **contract** — contract-does-not-carry-figma-fact:Titres.fills[0].GRADIENT_LINEAR="linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 60%)"
- **Divergence** `hero.composition.section-header-titre` — source : **contract** — contract-value-differs:SectionHeader.Titre:[{"text":"Portes de garage","strong":true},{"text":" industrielles"}]!="Portes de garage industrielles"
- **Divergence** `hero.visual.section-header-titre-color` — source : **contract** — contract-does-not-carry-figma-fact:SectionHeader.Titre.color="{color.blanc}"
- **Divergence** `hero.visual.section-header-titre-font-size` — source : **contract** — contract-does-not-carry-figma-fact:SectionHeader.Titre.font-size="54px"
- **Divergence** `hero.visual.section-header-titre-line-height` — source : **contract** — contract-does-not-carry-figma-fact:SectionHeader.Titre.line-height="68px"
- **Divergence** `hero.visual.section-header-titre-font-weight` — source : **contract** — contract-does-not-carry-figma-fact:SectionHeader.Titre.font-weight="700"
- **Limite déclarée d'avance** `hero.section-header.accroche2-rename` (impact attendu : limited) — Rename Accroche2 en attente sur SectionHeader, composé par Hero.

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
