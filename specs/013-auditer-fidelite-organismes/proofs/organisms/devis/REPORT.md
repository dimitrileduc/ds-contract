# Dossier d'audit — Devis (`ds.devis`)

> Généré depuis `result.json` — le Markdown n'est jamais l'autorité du verdict.

## 1. Identité

| Champ | Valeur |
|---|---|
| Sujet | `devis` (Devis) |
| Vague | 1 |
| Contrat | `ds.devis` v1.2.0 — `contracts/devis.contract.json` |
| Node master Figma | `2096:2524` |
| Référence Figma | `d9FYAUcqdcNtsuaMgLefvJ` @ version `2381581871281042338` (lecture seule) |

## 2. Audits de propreté réutilisés (Step 0)

- `specs/003-externalize-figma-components/audits/devis-cta.md`
- `specs/010-extract-molecules-organisms/audit-reuse-map.md`

## 3. Dépendance

Aucune — cet organisme ne déclare pas de dépendance de clôture.

## 4. Couverture exacte

- attendus : 21
- observés : 21
- manquants : **aucun**
- inattendus : **aucun**

## 5. Faits

| Fait | Catégorie | Représentabilité | Jambe Figma | Jambe contrat | Jambe générée | Verdict | Source localisée | Motifs |
|---|---|---|---|---|---|---|---|---|
| `devis.structure.root` | structure | carry-both | {"nodeId":"2096:2524","detail":"COMPONENT root (standalone, pas un COMPONENT_SET — 1 seule variante nommée « Devis ») >  | ds.devis@1.2.0#/anatomy/root | src/components/Devis/Devis.tsx#[class*="Devis__root"] | **proved** | — | — |
| `devis.structure.container` | structure | carry-both | {"nodeId":"2096:2525","detail":"FRAME « Container », layoutMode=VERTICAL, counterAxisAlignItems=CENTER, sizing=FIXED(155 | ds.devis@1.2.0#/anatomy/root/parts/Container | src/components/Devis/Devis.tsx#[class*="Devis__Container"] | **proved** | — | — |
| `devis.structure.root-flex-direction` | structure | carry-both | 2096:2524#root.flex-direction | ds.devis@1.2.0#/anatomy/root/layout/direction | src/components/Devis/Devis.tsx#[class*="Devis__root"] | **proved** | — | — |
| `devis.structure.root-align-items` | structure | carry-both | 2096:2524#root.align-items | ds.devis@1.2.0#/anatomy/root/layout/align | src/components/Devis/Devis.tsx#[class*="Devis__root"] | **proved** | — | — |
| `devis.structure.root-padding` | structure | carry-both | 2096:2524#root.paddingTop | ds.devis@1.2.0#/anatomy/root/layout/padding | src/components/Devis/Devis.tsx#[class*="Devis__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:root.paddingTop=96 |
| `devis.structure.container-gap` | structure | carry-both | 2096:2524#Container.itemSpacing | ds.devis@1.2.0#/anatomy/root/parts/Container/layout/gap | src/components/Devis/Devis.tsx#[class*="Devis__Container"] | **divergent** | contract | contract-does-not-carry-figma-fact:Container.itemSpacing=32 |
| `devis.content.titre` | content | carry-both | {"nodeId":"2096:2524","property":"Titre#2096:49","textLayer":"2096:2526","detail":"componentPropertyDefinitions.defaultV | ds.devis@1.2.0#/props/0/default | src/components/Devis/Devis.tsx#[class*="Devis__Titre"] | **proved** | — | — |
| `devis.property.titre` | property | carry-both | {"nodeId":"2096:2524","property":"Titre#2096:49","detail":"TEXT property, seule propriété de composant déclarée par le m | ds.devis@1.2.0#/props/0 | src/components/Devis/Devis.tsx#[class*="Devis__Titre"] | **proved** | — | — |
| `devis.composition.button` | composition | carry-both | {"nodeId":"2096:2527","mainComponent":"6:135","observedInstanceProperties":{"Libelle#2044:28":"Prendre rendez-vous","Sty | ds.devis@1.2.0#/anatomy/root/parts/Container/parts/Bouton/component | src/components/Devis/Devis.tsx#[class*="Button__root"] | **proved** | — | — |
| `devis.composition.button-libelle` | composition | carry-both | 2096:2524#Bouton.Libelle | ds.devis@1.2.0#/anatomy/root/parts/Container/parts/Bouton/component/props/children | src/components/Devis/Devis.tsx#[class*="Button__label"] | **proved** | — | — |
| `devis.composition.button-style` | composition | carry-both | 2096:2524#Bouton.Style | ds.devis@1.2.0#/anatomy/root/parts/Container/parts/Bouton/component/props/variant | src/components/Devis/Devis.tsx#[class*="Button__root"] | **proved** | — | — |
| `devis.composition.button-icone-droite` | composition | carry-both | 2096:2524#Bouton.iconRight | ds.devis@1.2.0#/anatomy/root/parts/Container/parts/Bouton/component/props/iconRight | src/components/Devis/Devis.tsx#[class*="Button__root"] | **proved** | — | — |
| `devis.visual.root` | visual | carry-both | {"nodeId":"2096:2524","export":"png@2x","detail":"absoluteBoundingBox 1728×378 ; absoluteRenderBounds identique."} | ds.devis@1.2.0#/anatomy/root | src/components/Devis/Devis.tsx#[class*="Devis__root"] | **proved** | — | — |
| `devis.visual.root-background-image` | visual | carry-both | 2096:2524#root.fills[0].type | ds.devis@1.2.0#/anatomy/root/tokens/background-image | src/components/Devis/Devis.tsx#[class*="Devis__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:root.fills[0].type="IMAGE" |
| `devis.visual.root-scrim-color` | visual | carry-both | 2096:2524#root.fills[1].color | ds.devis@1.2.0#/anatomy/root/tokens/background-color | src/components/Devis/Devis.tsx#[class*="Devis__root"] | **divergent** | contract | contract-value-differs:root.fills[1].color:"{color.noir-pur}"!="#000000" |
| `devis.visual.root-scrim-opacity` | visual | carry-both | 2096:2524#root.fills[1].opacity | ds.devis@1.2.0#/anatomy/root/tokens/background-overlay-opacity | src/components/Devis/Devis.tsx#[class*="Devis__root"] | **divergent** | contract | contract-does-not-carry-figma-fact:root.fills[1].opacity=0.3019607961177826 |
| `devis.visual.titre-font-size` | visual | carry-both | 2096:2524#Titre.font-size | ds.devis@1.2.0#/anatomy/root/parts/Container/parts/Titre/tokens/font-size | src/components/Devis/Devis.tsx#[class*="Devis__Titre"] | **divergent** | contract | contract-value-differs:Titre.font-size:"{font.size.40}"!="40px" |
| `devis.visual.titre-line-height` | visual | carry-both | 2096:2524#Titre.line-height | ds.devis@1.2.0#/anatomy/root/parts/Container/parts/Titre/tokens/line-height | src/components/Devis/Devis.tsx#[class*="Devis__Titre"] | **divergent** | contract | contract-does-not-carry-figma-fact:Titre.line-height="50px" |
| `devis.visual.titre-text-align` | visual | carry-both | 2096:2524#Titre.text-align | ds.devis@1.2.0#/anatomy/root/parts/Container/parts/Titre/tokens/text-align | src/components/Devis/Devis.tsx#[class*="Devis__Titre"] | **divergent** | contract | contract-does-not-carry-figma-fact:Titre.text-align="center" |
| `devis.visual.titre-width` | visual | carry-both | 2096:2524#Titre.width | ds.devis@1.2.0#/anatomy/root/parts/Container/parts/Titre/layout/width | src/components/Devis/Devis.tsx#[class*="Devis__Titre"] | **divergent** | contract | contract-does-not-carry-figma-fact:Titre.width="900px" |
| `devis.semantic.titre-element` | semantic | carry-both | {"nodeId":"2096:2526","detail":"TEXT layer « Titre », lié à la propriété Titre#2096:49 via componentPropertyReferences.c | ds.devis@1.2.0#/anatomy/root/parts/Container/parts/Titre/content/prop | src/components/Devis/Devis.tsx#[class*="Devis__Titre"] | **proved** | — | — |

## 6. Cas et artefacts

### Cas `devis-master-defaults`

| Mesure | Valeur |
|---|---|
| Verdict | **pass** (probant : true) |
| Node Figma | `2096:2524` @ v`2381581871281042338` — PNG 3456×756, sha `18ca822d3e73` |
| Rendu généré | `src/components/Devis/Devis.tsx` export `Devis`, bundle `62db8b1c2844`, fonts chargées |
| Pixels | brut 0.135 % (seuil 2.5 %) — diagnostic masqué — (hors calcul autoritaire) |
| Régions | `whole` 0.135 %/2.5 % (2570774 px signal) |
| Géométrie racine | Figma 3456×756 vs généré 3456×756 (Δ 0×0) — pass |
| Visibilité | signal Figma 2575964 px · généré 2570774 px · contraste ok |
| Motifs | — |

| Assertion sémantique | Sélecteur | Pointeur contractuel | Verdict |
|---|---|---|---|
| `titre-element` | `[class*="Devis__Titre"]` | `/anatomy/root/parts/Container/parts/Titre/content/prop` | pass |
| `bouton-label-derive-du-contrat-enfant` | `[class*="Button__label"]` | `/anatomy/root/parts/Container/parts/Bouton/component` | fail |

| Probe de projection (D6) | Prop | Valeur injectée | Valeur observée dans le DOM | Projetée |
|---|---|---|---|---|
| `devis.property.titre` | `titre` | "PREUVE-013 — TITRE devis 4b91" | PREUVE-013 — TITRE devis 4b91 | oui |

| Artefact | Chemin | sha256 | Taille |
|---|---|---|---|
| figma | `specs/013-auditer-fidelite-organismes/proofs/organisms/devis/cases/devis-master-defaults/figma.png` | `586f84038933` | 3456×756, 2929253 o |
| generated | `specs/013-auditer-fidelite-organismes/proofs/organisms/devis/cases/devis-master-defaults/generated.png` | `18e075df7a44` | 3456×756, 2904194 o |
| diff | `specs/013-auditer-fidelite-organismes/proofs/organisms/devis/cases/devis-master-defaults/diff.png` | `fac8082b1e94` | 3456×756, 675840 o |
| triptych | `specs/013-auditer-fidelite-organismes/proofs/organisms/devis/cases/devis-master-defaults/triptych.png` | `15b4f221a5e7` | 6646475 o |
| metadata | `specs/013-auditer-fidelite-organismes/proofs/organisms/devis/cases/devis-master-defaults/metadata.json` | `aa1599dcd9ef` | 3824 o |

## 7. Divergences, limites nommées et travaux reportés

- **Divergence** `devis.structure.root-padding` — source : **contract** — contract-does-not-carry-figma-fact:root.paddingTop=96
- **Divergence** `devis.structure.container-gap` — source : **contract** — contract-does-not-carry-figma-fact:Container.itemSpacing=32
- **Divergence** `devis.visual.root-background-image` — source : **contract** — contract-does-not-carry-figma-fact:root.fills[0].type="IMAGE"
- **Divergence** `devis.visual.root-scrim-color` — source : **contract** — contract-value-differs:root.fills[1].color:"{color.noir-pur}"!="#000000"
- **Divergence** `devis.visual.root-scrim-opacity` — source : **contract** — contract-does-not-carry-figma-fact:root.fills[1].opacity=0.3019607961177826
- **Divergence** `devis.visual.titre-font-size` — source : **contract** — contract-value-differs:Titre.font-size:"{font.size.40}"!="40px"
- **Divergence** `devis.visual.titre-line-height` — source : **contract** — contract-does-not-carry-figma-fact:Titre.line-height="50px"
- **Divergence** `devis.visual.titre-text-align` — source : **contract** — contract-does-not-carry-figma-fact:Titre.text-align="center"
- **Divergence** `devis.visual.titre-width` — source : **contract** — contract-does-not-carry-figma-fact:Titre.width="900px"

## 8. Verdict

**`divergent`** — motifs : `divergent-facts:9`

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
