# Dossier d'audit — SAV (`ds.sav`)

> Généré depuis `result.json` — le Markdown n'est jamais l'autorité du verdict.

## 1. Identité

| Champ | Valeur |
|---|---|
| Sujet | `sav` (SAV) |
| Vague | 1 |
| Contrat | `ds.sav` v1.2.0 — `contracts/sav.contract.json` |
| Node master Figma | `2108:3105` |
| Référence Figma | `d9FYAUcqdcNtsuaMgLefvJ` @ version `2381581871281042338` (lecture seule) |

## 2. Audits de propreté réutilisés (Step 0)

- `specs/003-externalize-figma-components/audits/sav.md`
- `specs/010-extract-molecules-organisms/audit-reuse-map.md`

## 3. Dépendance

Aucune — cet organisme ne déclare pas de dépendance de clôture.

## 4. Couverture exacte

- attendus : 18
- observés : 18
- manquants : **aucun**
- inattendus : **aucun**

## 5. Faits

| Fait | Catégorie | Représentabilité | Jambe Figma | Jambe contrat | Jambe générée | Verdict | Source localisée | Motifs |
|---|---|---|---|---|---|---|---|---|
| `sav.structure.root` | structure | carry-both | {"nodeId":"2108:3105","detail":"COMPONENT root > section 2169:6222 > [background 2108:3094, row 2169:6200 > [wrapper 216 | ds.sav@1.2.0#/anatomy/root | src/components/SAV/SAV.tsx#[class*="SAV__root"] | **proved** | — | — |
| `sav.content.texte` | content | carry-both | {"nodeId":"2108:3103","property":"characters","textLayer":"2108:3103"} | ds.sav@1.2.0#/anatomy/root/parts/section/parts/row/parts/wrapper/parts/inner/parts/vousRencontrezUnProblmeA/text | src/components/SAV/SAV.tsx#[class*="SAV__vousRencontrezUnProblmeA"] | **proved** | — | — |
| `sav.property.titre` | property | carry-both | {"nodeId":"2108:3105","property":"Titre#2108:60"} | ds.sav@1.2.0#/props/0 | src/components/SAV/SAV.tsx#[class*="SectionHeader__Titre"] | **divergent** | generated | probe-not-projected:child-renders-a-literal |
| `sav.composition.section-header` | composition | carry-both | {"nodeId":"2169:6258","mainComponent":"2090:2385","observedInstanceProperties":{"Accroche2#2169:64":false,"Titre#2090:47 | ds.sav@1.2.0#/anatomy/root/parts/section/parts/row/parts/wrapper/parts/inner/parts/SectionHeader/component | src/components/SAV/SAV.tsx#[class*="SectionHeader__root"] | **proved** | — | — |
| `sav.composition.button` | composition | carry-both | {"nodeId":"2108:3104","mainComponent":"6:107","observedInstanceProperties":{"Libelle#2044:28":"Demander de l’aide","Styl | ds.sav@1.2.0#/anatomy/root/parts/section/parts/row/parts/wrapper/parts/inner/parts/Bouton/component | src/components/SAV/SAV.tsx#[class*="Button__root"] | **proved** | — | — |
| `sav.visual.root` | visual | carry-both | {"nodeId":"2108:3105","export":"png@2x"} | ds.sav@1.2.0#/anatomy/root | src/components/SAV/SAV.tsx#[class*="SAV__root"] | **proved** | — | — |
| `sav.semantic.texte-element` | semantic | carry-both | {"nodeId":"2108:3103","detail":"TEXT layer, 2 paragraphes separes par un saut de ligne dur"} | ds.sav@1.2.0#/anatomy/root/parts/section/parts/row/parts/wrapper/parts/inner/parts/vousRencontrezUnProblmeA | src/components/SAV/SAV.tsx#[class*="SAV__vousRencontrezUnProblmeA"] | **proved** | — | — |
| `sav.structure.gap-root` | structure | carry-both | 2108:3105#root.itemSpacing | ds.sav@1.2.0#/anatomy/root/layout/gap | src/components/SAV/SAV.tsx#[class*="SAV__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:root.itemSpacing=10 |
| `sav.structure.gap-inner` | structure | carry-both | 2108:3105#inner.itemSpacing | ds.sav@1.2.0#/anatomy/root/parts/section/parts/row/parts/wrapper/parts/inner/layout/gap | src/components/SAV/SAV.tsx#[class*="SAV__inner"] | **divergent** | contract | contract-does-not-carry-figma-fact:inner.itemSpacing=32 |
| `sav.visual.texte-font-size` | visual | carry-both | 2108:3105#vousRencontrezUnProblmeA.font-size | ds.sav@1.2.0#/anatomy/root/parts/section/parts/row/parts/wrapper/parts/inner/parts/vousRencontrezUnProblmeA/tokens/font- | src/components/SAV/SAV.tsx#[class*="SAV__vousRencontrezUnProblmeA"] | **proved** | — | — |
| `sav.visual.texte-line-height` | visual | carry-both | 2108:3105#vousRencontrezUnProblmeA.line-height | ds.sav@1.2.0#/anatomy/root/parts/section/parts/row/parts/wrapper/parts/inner/parts/vousRencontrezUnProblmeA/tokens/line- | src/components/SAV/SAV.tsx#[class*="SAV__vousRencontrezUnProblmeA"] | **proved** | — | — |
| `sav.visual.background-image` | visual | carry-with-named-limit | 2108:3105#background.fills[0].imageRef | ds.sav@1.2.0#/anatomy/root/parts/section/parts/background/tokens/background-image | src/components/SAV/SAV.tsx#[class*="SAV__background"] | **divergent** | contract | contract-does-not-carry-figma-fact:background.fills[0].imageRef="3e173874828861c294938a12deea5a5a7a1799dd" |
| `sav.visual.img-image` | visual | carry-with-named-limit | 2108:3105#img.fills[0].imageRef | ds.sav@1.2.0#/anatomy/root/parts/section/parts/row/parts/imgGroup/parts/img/tokens/background-image | src/components/SAV/SAV.tsx#[class*="SAV__img"] | **divergent** | contract | contract-does-not-carry-figma-fact:img.fills[0].imageRef="429c615cb090b3aa0800188acda4bc59cc6445b0" |
| `sav.composition.section-header-titre` | composition | carry-both | 2108:3105#SectionHeader.Titre | ds.sav@1.2.0#/anatomy/root/parts/section/parts/row/parts/wrapper/parts/inner/parts/SectionHeader/component/props/titre | src/components/SAV/SAV.tsx#[class*="SectionHeader__Titre"] | **divergent** | contract | contract-value-differs:SectionHeader.Titre:[{"text":"Dépannage / SAV"}]!="Dépannage / SAV" |
| `sav.composition.section-header-accroche` | composition | carry-both | 2108:3105#SectionHeader.Accroche | ds.sav@1.2.0#/anatomy/root/parts/section/parts/row/parts/wrapper/parts/inner/parts/SectionHeader/component/props/accroch | src/components/SAV/SAV.tsx#[class*="SectionHeader__Accroche"] | **proved** | — | — |
| `sav.composition.section-header-accroche2` | composition | carry-both | 2108:3105#SectionHeader.Accroche2 | ds.sav@1.2.0#/anatomy/root/parts/section/parts/row/parts/wrapper/parts/inner/parts/SectionHeader/component/props/accroch | src/components/SAV/SAV.tsx#[class*="SectionHeader__Accroche"] | **proved** | — | — |
| `sav.composition.button-libelle` | composition | carry-both | 2108:3105#Bouton.Libelle | ds.sav@1.2.0#/anatomy/root/parts/section/parts/row/parts/wrapper/parts/inner/parts/Bouton/component/props/children | src/components/SAV/SAV.tsx#[class*="Button__root"] | **proved** | — | — |
| `sav.composition.button-icon-right` | composition | carry-both | 2108:3105#Bouton.Icone droite | ds.sav@1.2.0#/anatomy/root/parts/section/parts/row/parts/wrapper/parts/inner/parts/Bouton/component/props/iconRight | src/components/SAV/SAV.tsx#[class*="Button__root"] | **proved** | — | — |

## 6. Cas et artefacts

### Cas `sav-master-defaults`

| Mesure | Valeur |
|---|---|
| Verdict | **pass** (probant : true) |
| Node Figma | `2108:3105` @ v`2381581871281042338` — PNG 3100×1354, sha `1213b4e3ce7e` |
| Rendu généré | `src/components/SAV/SAV.tsx` export `SAV`, bundle `4f143a89f927`, fonts chargées |
| Pixels | brut 0.665 % (seuil 2.5 %) — diagnostic masqué — (hors calcul autoritaire) |
| Régions | `whole` 0.665 %/2.5 % (2575702 px signal) |
| Géométrie racine | Figma 3100×1354 vs généré 3100×1354 (Δ 0×0) — pass |
| Visibilité | signal Figma 2575702 px · généré 2588393 px · contraste ok |
| Motifs | — |

| Assertion sémantique | Sélecteur | Pointeur contractuel | Verdict |
|---|---|---|---|
| `texte-element` | `[class*="SAV__vousRencontrezUnProblmeA"]` | `/anatomy/root/parts/section/parts/row/parts/wrapper/parts/inner/parts/vousRencontrezUnProblmeA/text` | pass |
| `titre-element` | `[class*="SectionHeader__Titre"]` | `/props/0/default` | pass |

| Probe de projection (D6) | Prop | Valeur injectée | Valeur observée dans le DOM | Projetée |
|---|---|---|---|---|
| `sav.property.titre` | `titre` | "PREUVE-013 — TITRE SAV b48e" | Dépannage / SAV | **non** |

| Artefact | Chemin | sha256 | Taille |
|---|---|---|---|
| figma | `specs/013-auditer-fidelite-organismes/proofs/organisms/sav/cases/sav-master-defaults/figma.png` | `316b6717cf2e` | 3100×1354, 2729161 o |
| generated | `specs/013-auditer-fidelite-organismes/proofs/organisms/sav/cases/sav-master-defaults/generated.png` | `3ec5c1e6b50b` | 3100×1354, 2805736 o |
| diff | `specs/013-auditer-fidelite-organismes/proofs/organisms/sav/cases/sav-master-defaults/diff.png` | `6cb38e124244` | 3100×1354, 836261 o |
| triptych | `specs/013-auditer-fidelite-organismes/proofs/organisms/sav/cases/sav-master-defaults/triptych.png` | `75e2ef19b9ad` | 6509224 o |
| metadata | `specs/013-auditer-fidelite-organismes/proofs/organisms/sav/cases/sav-master-defaults/metadata.json` | `2754b93a8839` | 4317 o |

## 7. Divergences, limites nommées et travaux reportés

- **Divergence** `sav.property.titre` — source : **generated** — probe-not-projected:child-renders-a-literal
- **Divergence** `sav.structure.gap-root` — source : **contract** — contract-does-not-carry-figma-fact:root.itemSpacing=10
- **Divergence** `sav.structure.gap-inner` — source : **contract** — contract-does-not-carry-figma-fact:inner.itemSpacing=32
- **Divergence** `sav.visual.background-image` — source : **contract** — contract-does-not-carry-figma-fact:background.fills[0].imageRef="3e173874828861c294938a12deea5a5a7a1799dd"
- **Divergence** `sav.visual.img-image` — source : **contract** — contract-does-not-carry-figma-fact:img.fills[0].imageRef="429c615cb090b3aa0800188acda4bc59cc6445b0"
- **Divergence** `sav.composition.section-header-titre` — source : **contract** — contract-value-differs:SectionHeader.Titre:[{"text":"Dépannage / SAV"}]!="Dépannage / SAV"

## 8. Verdict

**`divergent`** — motifs : `divergent-facts:6`

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
