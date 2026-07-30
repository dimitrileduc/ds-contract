# Dossier d'audit — Presentation (`ds.presentation`)

> Généré depuis `result.json` — le Markdown n'est jamais l'autorité du verdict.

## 1. Identité

| Champ | Valeur |
|---|---|
| Sujet | `presentation` (Presentation) |
| Vague | 1 |
| Contrat | `ds.presentation` v2.1.0 — `contracts/presentation.contract.json` |
| Node master Figma | `2103:2824` |
| Référence Figma | `d9FYAUcqdcNtsuaMgLefvJ` @ version `2381581871281042338` (lecture seule) |

## 2. Audits de propreté réutilisés (Step 0)

- `specs/003-externalize-figma-components/audits/presentation.md`
- `specs/010-extract-molecules-organisms/audit-reuse-map.md`

## 3. Dépendance

Aucune — cet organisme ne déclare pas de dépendance de clôture.

## 4. Couverture exacte

- attendus : 13
- observés : 13
- manquants : **aucun**
- inattendus : **aucun**

## 5. Faits

| Fait | Catégorie | Représentabilité | Jambe Figma | Jambe contrat | Jambe générée | Verdict | Source localisée | Motifs |
|---|---|---|---|---|---|---|---|---|
| `presentation.structure.root` | structure | carry-both | {"nodeId":"2103:2824","detail":"COMPONENT root > [SectionHeader instance 2169:6246, wrapper frame 2103:2820 > [Texte 210 | ds.presentation@2.1.0#/anatomy/root | src/components/Presentation/Presentation.tsx#[class*="Presentation__root"] | **proved** | — | — |
| `presentation.content.texte` | content | carry-both | {"nodeId":"2103:2824","property":"Texte#2103:54","textLayer":"2103:2821"} | ds.presentation@2.1.0#/props/0/default | src/components/Presentation/Presentation.tsx#[class*="Presentation__Texte"] | **proved** | — | — |
| `presentation.property.titre` | property | carry-both | {"nodeId":"2103:2824","property":"Titre#2103:53"} | ds.presentation@2.1.0#/props/2 | src/components/Presentation/Presentation.tsx#[class*="SectionHeader__Titre"] | **divergent** | generated | probe-not-projected:child-renders-a-literal |
| `presentation.property.texte` | property | carry-both | {"nodeId":"2103:2824","property":"Texte#2103:54"} | ds.presentation@2.1.0#/props/0 | src/components/Presentation/Presentation.tsx#[class*="Presentation__Texte"] | **proved** | — | — |
| `presentation.property.bouton` | property | carry-both | {"nodeId":"2103:2824","property":"Bouton#2103:55"} | ds.presentation@2.1.0#/props/1 | src/components/Presentation/Presentation.tsx#[class*="Button__root"] | **proved** | — | — |
| `presentation.composition.section-header` | composition | carry-both | {"nodeId":"2169:6246","mainComponent":"2090:2385","observedInstanceProperties":{"Accroche2#2169:64":false,"Titre#2090:47 | ds.presentation@2.1.0#/anatomy/root/parts/SectionHeader/component | src/components/Presentation/Presentation.tsx#[class*="SectionHeader__root"] | **proved** | — | — |
| `presentation.composition.button` | composition | carry-both | {"nodeId":"2103:2822","mainComponent":"9:206","visibleByDefault":false,"observedInstanceProperties":{"Libelle#2044:28":" | ds.presentation@2.1.0#/anatomy/root/parts/wrapper/parts/Bouton/component | src/components/Presentation/Presentation.tsx#[class*="Button__root"] | **not-proven** | — | leg-unavailable:generated; agreement-unknown |
| `presentation.visual.root` | visual | carry-both | {"nodeId":"2103:2824","export":"png@2x"} | ds.presentation@2.1.0#/anatomy/root | src/components/Presentation/Presentation.tsx#[class*="Presentation__root"] | **proved** | — | — |
| `presentation.semantic.texte-element` | semantic | carry-both | {"nodeId":"2103:2821","detail":"TEXT layer Texte"} | ds.presentation@2.1.0#/anatomy/root/parts/wrapper/parts/Texte/content/prop | src/components/Presentation/Presentation.tsx#[class*="Presentation__Texte"] | **proved** | — | — |
| `presentation.structure.gap-root` | structure | carry-both | 2103:2824#root.itemSpacing | ds.presentation@2.1.0#/anatomy/root/literals/gap | src/components/Presentation/Presentation.tsx#[class*="Presentation__root"] | **divergent** | contract | contract-value-differs:root.itemSpacing:"32px"!=32 |
| `presentation.structure.gap-wrapper` | structure | carry-both | 2103:2824#wrapper.itemSpacing | ds.presentation@2.1.0#/anatomy/root/parts/wrapper/literals/gap | src/components/Presentation/Presentation.tsx#[class*="Presentation__wrapper"] | **divergent** | contract | contract-value-differs:wrapper.itemSpacing:"16px"!=16 |
| `presentation.visual.texte-font-size` | visual | carry-both | 2103:2824#Texte.font-size | ds.presentation@2.1.0#/anatomy/root/parts/wrapper/parts/Texte/tokens/font-size | src/components/Presentation/Presentation.tsx#[class*="Presentation__Texte"] | **divergent** | contract | contract-value-differs:Texte.font-size:"{font.size.14}"!="14px" |
| `presentation.visual.texte-line-height` | visual | carry-both | 2103:2824#Texte.line-height | ds.presentation@2.1.0#/anatomy/root/parts/wrapper/parts/Texte/literals/line-height | src/components/Presentation/Presentation.tsx#[class*="Presentation__Texte"] | **proved** | — | — |

## 6. Cas et artefacts

### Cas `presentation-master-defaults`

| Mesure | Valeur |
|---|---|
| Verdict | **pass** (probant : true) |
| Node Figma | `2103:2824` @ v`2381581871281042338` — PNG 2574×192, sha `a02293e14188` |
| Rendu généré | `src/components/Presentation/Presentation.tsx` export `Presentation`, bundle `86e1f8c60cc8`, fonts chargées |
| Pixels | brut 0.353 % (seuil 2.5 %) — diagnostic masqué — (hors calcul autoritaire) |
| Régions | `whole` 0.353 %/2.5 % (49664 px signal) |
| Géométrie racine | Figma 2574×192 vs généré 2574×192 (Δ 0×0) — pass |
| Visibilité | signal Figma 49664 px · généré 57489 px · contraste ok |
| Motifs | — |

| Assertion sémantique | Sélecteur | Pointeur contractuel | Verdict |
|---|---|---|---|
| `texte-element` | `[class*="Presentation__Texte"]` | `/anatomy/root/parts/wrapper/parts/Texte/content/prop` | fail |

| Probe de projection (D6) | Prop | Valeur injectée | Valeur observée dans le DOM | Projetée |
|---|---|---|---|---|
| `presentation.property.titre` | `titre` | "PREUVE-013 — TITRE 7f3c" | Piqueray, une histoire de famille | **non** |
| `presentation.property.texte` | `texte` | [{"text":"PREUVE-013 — TEXTE 7f3c"}] | PREUVE-013 — TEXTE 7f3c | oui |
| `presentation.property.bouton` | `bouton` | true | 1 element(s) | oui |

| Artefact | Chemin | sha256 | Taille |
|---|---|---|---|
| figma | `specs/013-auditer-fidelite-organismes/proofs/organisms/presentation/cases/presentation-master-defaults/figma.png` | `a0b1ea70f445` | 2574×192, 91038 o |
| generated | `specs/013-auditer-fidelite-organismes/proofs/organisms/presentation/cases/presentation-master-defaults/generated.png` | `1d1531e4cb71` | 2574×192, 116802 o |
| diff | `specs/013-auditer-fidelite-organismes/proofs/organisms/presentation/cases/presentation-master-defaults/diff.png` | `79a2995f6a9d` | 2574×192, 74025 o |
| triptych | `specs/013-auditer-fidelite-organismes/proofs/organisms/presentation/cases/presentation-master-defaults/triptych.png` | `ca79fd64eb1e` | 301150 o |
| metadata | `specs/013-auditer-fidelite-organismes/proofs/organisms/presentation/cases/presentation-master-defaults/metadata.json` | `8aac93114bba` | 4321 o |

## 7. Divergences, limites nommées et travaux reportés

- **Divergence** `presentation.property.titre` — source : **generated** — probe-not-projected:child-renders-a-literal
- **Divergence** `presentation.structure.gap-root` — source : **contract** — contract-value-differs:root.itemSpacing:"32px"!=32
- **Divergence** `presentation.structure.gap-wrapper` — source : **contract** — contract-value-differs:wrapper.itemSpacing:"16px"!=16
- **Divergence** `presentation.visual.texte-font-size` — source : **contract** — contract-value-differs:Texte.font-size:"{font.size.14}"!="14px"
- **Non prouvé** `presentation.composition.button` — leg-unavailable:generated ; agreement-unknown
- **Limite déclarée d'avance** `presentation.section-header.accroche2-rename` (impact attendu : limited) — Rename Accroche2 en attente sur SectionHeader, composé par Presentation.

## 8. Verdict

**`divergent`** — motifs : `divergent-facts:4`

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
