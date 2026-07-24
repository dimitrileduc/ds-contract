# Data Model — 004-input-atoms-categories

Toutes les entités sont des documents JSON versionnés sur disque (le modèle du dépôt).
Les shapes ci-dessous sont les ATTENDUS du plan — le dump d'extraction fait foi sur les
détails (propriétés réelles des masters, bindings de couleur) ; tout écart est nommé à
l'adoption.

## 1. `Contract.category` (nouveau champ, schéma)

| Champ | Type | Règles |
|---|---|---|
| `category` | `'atom' \| 'molecule' \| 'section'` — **optionnel** | Valeur inconnue = refus Zod par nom (build rouge). Absent = valide (tolérance FR-013), surfaces en fallback `Components/`. |

- Libellés d'affichage : `CATEGORY_LABELS` (export schéma) — `atom→Atoms`,
  `molecule→Molecules`, `section→Sections`. Unique source des libellés.
- Propagation : stories title (`emit-react`), catalog (monolithe + shards + index),
  Contract Hub (groupes de la liste).
- Semver contrat : ajouter `category` à un contrat existant = **minor**.

## 2. Les 4 contrats d'atomes (nouveaux, v1.0.0 chacun)

Communs : `id: ds.<atome>`, `name` anglais, `status: draft`, `anchors.figma` par
**componentSetKey** (+ `nodeId`, `dumpedAt`), `anchors.code` `src/components/<Name>`,
`category: "atom"`, `states: []`, tokens Piqueray existants (`color.blanc`,
`color.bleu-gris`, `color.noir`*, `font.*`, `space.*`) — *le binding réel du texte est
relu au dump (construction 003 owner-validée).

| Contrat | `semantics.element` | Props attendues (bindings) | Anatomy (attendu) |
|---|---|---|---|
| `ds.input` (`Input`) | `input` | `value` : text, TEXT « Valeur » | root box HORIZONTAL (pad 12, gap 8, radius 0, fond blanc, bordure bleu-gris) + contenu texte |
| `ds.textarea` (`Textarea`) | `textarea` | `value` : text, TEXT « Valeur »¹ | même boîte, hauteur 128 portée par le container, texte aligné haut |
| `ds.select` (`Select`) | `select` | `value` : text, TEXT « Valeur »¹ | même boîte, `justify: space-between`, + icon part FIXE `chevron-down` (24) |
| `ds.checkbox` (`Checkbox`) | à trancher au spike (label+input natif non-dessiné, pattern démo, sinon repli) | `checked` : enum `['non','oui']`, VARIANT « Coché » `{non→Non, oui→Oui}` | box ~carrée ; décoché = blanc + bordure bleu-gris ; coché = bleu plein + coche blanche (`visibleWhen: {prop: 'checked', equals: 'oui'}`) |

¹ nom réel de la propriété TEXT relu au dump (les validations 003-T033/003-T034 ne le citent pas explicitement).

**Rejets nommés (par contraste avec l'archive demo-51)** : pas de label/description/help
(la molécule Field les possède), pas d'axe `size`, pas d'`indeterminate`, pas d'events
déclarés, pas d'états d'interaction — le master n'expose rien de tel (FR-008).

## 3. `ds.icons` — registre v1.0.0 → **v1.1.0** (13 → 16)

3 entrées ajoutées (clés/nodeIds RELUS au dump — ceux-ci sont les repères 003) :

| `name` (canonique) | `figma.componentName` (verbatim) | Master (repère) | `asset` | `size` | Note |
|---|---|---|---|---|---|
| `facebook` | relu au dump (« Facebook ») | `2053:1259` | `facebook` | 32 | fill bindé `color/noir-bleute` → bake `currentColor` standard |
| `instagram` | relu au dump (« Instagram ») | `2053:1261` | `instagram` | 32 | idem |
| `star` | relu au dump (« Étoile ») | `2053:1263` | `star` | 32² | **couleur fixe `color/orange`** — ne se recolore pas ; nommé dans `description` |

² taille réelle relue au dump.

- `source.dumpedAt` mis à jour. Semver : élargissement `icons[]` = **minor**.
- `assets/icons/` : +3 SVG extraits du fichier réel (export REST `format=svg`) ; **+
  `check.svg`** (glyphe interne Checkbox, hors registre — voir §5).

## 4. `ds.button` v1.4.0 → **v1.5.0**

- `+ category: "atom"` (FR-015, zéro toucher au master).
- Enums `iconLeftGlyph`/`iconRightGlyph` : 13 → 16 valeurs + `bindings.figma.values`
  complétées (`star → « Étoile »` etc. — componentName verbatim). Forcé par le gate
  « ni plus ni moins » (build) dès que le registre passe à 16.
- Conséquence canvas nommée : menu `preferredValues` du master reste à 13 — divergence
  acquittée si l'axe composant la remonte (D5), léguée à la prochaine itération
  d'écriture.

## 5. Axe icônes de parity — la classe « glyphe interne » (si retenue, D7)

| Situation d'un `assets/icons/<x>.svg` | Aujourd'hui | Après |
|---|---|---|
| Entrée registre | ✅ vérifié 3 voies | inchangé |
| Pas d'entrée registre, **consommé par un `icon.asset` fixe d'un contrat du catalog** | finding `ahead` | **pas de finding** (classe nommée, éval-couverte) |
| Ni registre ni consommé | finding `ahead` | inchangé (finding) |

Repli sans changement d'outillage : finding `icons|ahead|assets/icons/check.svg`
acquitté dans `parity/baseline.json` (décision owner enregistrée).

## 6. Surfaces générées (jamais éditées à la main — régénérées)

- `src/components/{Input,Textarea,Select,Checkbox}/…` + `Button` régénéré (ICONS map 16,
  title `Atoms/Button`) + `src/components/index.ts` (5 exports).
- `catalog/catalog.json` + shards + `index.json` : 5 composants, champ `category`.
- Stories : `title: 'Atoms/<Name>'` ×5.
- `figma-sync/*.js` : régénérés si le build les touche (aucun push canvas dans cette
  itération — génération locale seulement).
- `evals/golden.json` : re-pin explicite (`npm run golden:update`) après revue.

## 7. Preuves d'itération (`specs/004-input-atoms-categories/proofs/`)

| Artefact | Contenu |
|---|---|
| `read-only/versions.before.json` / `versions.after.json` | relevés REST `/versions` (T0 / clôture) |
| `read-only/attribution.md` | table : chaque entrée nouvelle → imputation (003 = attendu / 004 = échec du garde-fou) |
| `audits-003.md` | pointeurs vers les audits 003 réutilisés (branche + chemins + validations owner) — FR-005/006, jamais recopiés ni refaits |
| dumps committés | 1 dump REST par atome (au moins un promu fixture sous `extract/figma/rest/fixtures/` si les évals L509/523/538 se réactivent) |

## Relations

```text
audits 003 (réutilisés) ─┐
                         ▼
masters Figma (gelés) ──REST dump──▶ propose ──review/adopt──▶ contracts/*.contract.json
                                                                    │ category
   icons.registry.json v1.1.0 (16) ◀── dump + SVG export            ▼
        │                                        npm run build ──▶ src/components/ + catalog + stories
        └──▶ parity axe icônes ◀── snapshots (refresh lecture) ◀── npm run parity (3 voies, zéro actif)
                                                                    ▼
                                    visual-parity subjects (+4) ──▶ baseline re-pinnée
```
