# Interface — Une ligne de mesure compare des choses comparables

**Spec**: 017 · US2 (P2) · FR-006, FR-006a, FR-006b, FR-007, FR-008, FR-009 · SC-003, SC-004, SC-005
**Surface**: `extract/figma/visual-parity/` — `subjects.ts`, `run.ts`, `triage.ts`, `fixture-assets/manifest.json`

**Pourquoi un contrat d'interface.** Le pire chiffre du système — 99,97 % — ne mesure aucun défaut : il mesure qu'on n'a pas donné de photo à notre côté. Ce document fixe ce qu'« armes égales » veut dire exactement, et ce qu'une ligne a le droit de rendre quand l'égalité est impossible.

---

## 1 · Le geste : deux champs sur le sujet, un argument passé

Rien à inventer. La chaîne complète existe, est éprouvée et vérifiée par SHA-256 ; seul le chemin du *live gate* ne l'emprunte pas.

```
subjects.ts        + comparisonProps?: Record<string, unknown>     (additif)
                   + fixtureAssetIds?: string[]                    (additif)

run.ts (live gate) renderVariant(page, pkg, subst, bools, interaction, fonts)         ← 6 args aujourd'hui
                   renderVariant(page, pkg, subst, bools, interaction, fonts, props)  ← le 7e, déjà déclaré

render.ts          comparisonProps: Record<string, unknown> = {}   ← paramètre EXISTANT (:816)
                   resolveComparisonOnlyProps → materializeFixtureAsset → withOverridesAsDefaults
```

`{ "$asset": "<id>" }` → reçu du manifeste → revérification **taille + extension + octets + SHA-256** au moment du rendu → data URL **dans le document de comparaison seulement**. L'injection **clone** le contrat (`structuredClone`) : `contracts/*.contract.json` n'est jamais touché.

---

## 2 · Les règles

1. **L'égalité se fait en donnant la photo à NOTRE surface.** Le côté Figma n'est pas modifié. C'est la réponse de première intention.
2. **« Non comparable » est le recours**, réservé aux lignes où aucune photo ne peut être obtenue — jamais la réponse de première intention (FR-006a).
3. **L'échantillon vit dans l'instrument.** Il n'entre pas au contrat et n'y est pas référencé. `runtimeDefault: false` sur tous les reçus ; aucun défaut de prop d'URL ne devient non vide (FR-006b).
4. **`status: "incomparable"` exige `incomparableReason` non vide.** Sans raison écrite, la ligne refuse.
5. **Une ligne incomparable est visible et comptée** — section « Not diffed (named, never dropped) » et ligne de comptage. Jamais masquée, jamais à 0 %, jamais absorbée dans une tolérance (FR-007).
6. **Une ligne incomparable ne porte pas de score de porte.** Un `unmaskedPct` relevé pour information n'entre pas au verdict.
7. **Le vocabulaire de causes reste fermé à six.** « Non comparable » est un **statut**, pas une septième cause : l'un dit si la mesure a un sens, l'autre explique un écart mesuré. Les deux axes sont orthogonaux.
8. **Aucune cause n'est héritée** (FR-008). Les six règles de triage couvrant les huit lignes sont réécrites d'après la mesure d'après. La règle D8 déjà en vigueur le rend exécutoire : toute ligne à score brut strictement positif doit matcher une règle, sinon `UNTRIAGED`, classée première.
9. **Tout défaut révélé est nommé et consigné**, même non réparé ici (FR-009) — destination : le registre, jamais une note en prose seule.

---

## 3 · La population à re-mesurer et ce qu'elle exige

Ligne de porte : **2 %**. Toutes ces lignes portent `diagnosis: "overall ink differs"` avec une géométrie exacte à ±1-2 px près — l'écart est de l'encre, donc de la donnée.

| Sujet | Variante | Brut | Prop d'accueil | Asset |
|---|---|---:|---|---|
| `realisation` | `Taille=Grand` | 99,97 % | `imageUrl` | 27 au manifeste |
| `realisation` | `Taille=Petit` | 99,86 % | `imageUrl` | ✔ |
| `member-picture` | `Etat=Defaut` | 64,48 % | **`src`** | **absent — à épingler** |
| `carte` | `Disposition=Reassurance` | 64,14 % | `imageUrl` | 28 au manifeste |
| `member-picture` | `Etat=Survol` | 58,33 % | **`src`** | **absent — à épingler** |
| `carte` | `Disposition=Categorie` | 56,56 % | `imageUrl` | ✔ |
| `member-card` | `MemberCard` | 52,52 % | `imageUrl` | 17 au manifeste |
| `product-card` | `ProductCard` | 15,64 % | `imageUrl` | 4 au manifeste |

**Deux pièges épinglés.** (1) `ds.member-picture` nomme sa prop **`src`** — un preset calqué sur les autres sujets ne prendrait pas ; ses 17 portraits présents au manifeste sont classés `subject: "member-card"`, donc à relever sur le set `274:2389`. (2) Son root porte `"background-color": "#D9D9D9"` en littéral (« generic technical A5 preview base ») : c'est l'encre mesurée. Si le lavis reste visible une fois la photo donnée, **c'est un fait de contrat, pas une frontière image**.

---

## 4 · Ce qui est attendu à l'arrivée

- **Zéro** ligne conservant un score qui mesure l'absence de données (SC-003).
- Chaque ligne finit dans **l'une de trois issues, et aucune autre** : sous 2 % · **incomparable avec sa raison**, visible et comptée · **re-classée à une cause réelle re-mesurée**, acquittée avec son motif écrit et visible. La troisième est attendue au moins trois fois (le survol non modélisé, le lavis `#D9D9D9`, `D-016-CARTE-BOUTON`) : ce n'est pas une échappatoire, c'est ce qu'US2 va découvrir. **Ce qui est interdit, ce n'est pas un chiffre élevé — c'est un chiffre qui ne mesure rien.**
- La **pire ligne** de la porte est un écart réel, re-mesuré et re-classé (SC-004).
- **100 %** des défauts révélés sont consignés (SC-005) — dont, très probablement, `D-016-CARTE-BOUTON`, qui se cache aujourd'hui **sous** les 56,56 % de `carte / Disposition=Categorie`.
- Deux exécutions sans geste rendent des scores identiques (SC-009).

**Ce que cette réparation NE ferme PAS, et qu'il ne faut pas laisser croire fermé** : `DW-014-002` — l'instrument rend `emit-html`, **jamais la surface React livrée**. 017 répare la **donnée** mesurée, pas la **surface** mesurée. L'angle mort demeure entier ; la roadmap le tient pour « le plus gênant ».
