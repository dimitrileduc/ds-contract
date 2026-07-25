# Interface — La catégorie de composant

## 1. Schéma (`packages/schema/src/contract-schema.ts`) — additif-optionnel

```ts
// Dans ContractSchema (voisin de status) :
/** Organizational tier mirrored from the Figma DS pages (structure, not language).
 *  Optional (a contract without one stays valid); unknown values are refused by name. */
category: z.enum(['atom', 'molecule', 'section']).optional(),

// Export voisin — the ONE definition of the English display labels:
export const CATEGORY_LABELS: Record<'atom' | 'molecule' | 'section', string> = {
  atom: 'Atoms', molecule: 'Molecules', section: 'Sections',
};
```

- Jamais de repurposing d'un champ existant ; `docs/02-contract-spec.md` bumpé avec le
  champ (Principe VI).
- Refus : `category: "atome"` (ou toute valeur hors enum) = erreur Zod nommée au build.

## 2. Stories (`core/emit-react.ts`, generateStories)

| Contrat | `meta.title` émis |
|---|---|
| `category: 'atom'` | `Atoms/<Name>` |
| `category: 'molecule'` | `Molecules/<Name>` |
| `category: 'section'` | `Sections/<Name>` |
| sans `category` | `Components/<Name>` (fallback = comportement actuel, tolérance) |

Sortie byte-pinnée par `evals/golden.json` (re-pin explicite après revue).

## 3. Catalog (`scripts/generate-catalog.ts`)

- `catalog.components[]` : `+ category?` (présent seulement si le contrat le porte).
- `index.json.components[]` (shards) : `+ category?` — même règle.
- `npm run verify:catalog` reste vert (shards régénérés).

## 4. Contract Hub (`dashboard/`)

- `data.ts` : `RawContract.category?: 'atom' | 'molecule' | 'section'`.
- `ComponentsList.tsx` : sections groupées dans l'ordre `Atoms → Molecules → Sections`,
  libellés via `CATEGORY_LABELS` ; les composants sans catégorie apparaissent sous un
  groupe résiduel rendu **seulement s'il est non vide** (un composant sans catégorie
  n'est jamais caché ; un groupe vide ne se rend pas — SC-002 net) — absent dans cette
  itération (usage exhaustif : les 4 atomes + Button portent tous `atom`).

## 5. Évals (fixture → eval → claim)

1. Contrat catégorisé → story title groupé + `category` au catalog (C6/C1).
2. `category` inconnue → refus par nom (C2).
3. Contrat sans catégorie → build OK + fallback `Components/` (tolérance FR-013).

## Critères d'acceptation (US3)

- SC-002 : Storybook + Contract Hub groupés, zéro groupe résiduel incohérent.
- SC-005 : Button porte `atom` sans édition de master ; aucun composant sans catégorie.
- Rétrocompatible : un dépôt sans aucun `category` build à l'identique (hors title).
