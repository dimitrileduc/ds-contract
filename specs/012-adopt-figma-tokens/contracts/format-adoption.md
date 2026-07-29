# Contrat d'interface — Format d'adoption des 77 feuilles (FR-001/002/003)

Les règles d'écriture dans `tokens/primitives.tokens.json` et
`tokens/semantic.tokens.json` — les deux SEULS fichiers édités à la main.

## Règle cardinale — additivité à la feuille (FR-003, SC-003)

- Une feuille existante n'est JAMAIS modifiée, renommée ou supprimée (62/62 intactes).
- Ajouter une feuille à un groupe existant est autorisé (`font.line-height.30` à côté
  de `font.line-height.22` ; `typography.titre-1.line-height` dans le groupe
  `titre-1`).
- Collision de nom pour une valeur différente → conflit nommé, arbitré côté source
  d'abord (§VIII), consigné au rapport — jamais d'écrasement.

## Primitives (29) — valeurs littérales, conventions du groupe d'accueil

| Groupe | `$type` | Forme `$value` | Garde |
|---|---|---|---|
| `color.*` | `color` (posé au groupe) | hex MAJUSCULES `#RRGGBB` / `#RRGGBBAA` | 8 chiffres : casse stricte (non neutralisée par `norm()`) — MAJ obligatoires |
| `font.size.*` | `dimension` | `"Npx"` | `norm()` fait `"25px"` ↔ `25` — on n'écrit jamais le nombre nu |
| `font.line-height.*` | `dimension` | `"Npx"` | modèle existant : `font.line-height.22` |
| `space.*` | `dimension` | `"Npx"` | |
| `radius.*` | `dimension` | `"Npx"` | |
| `font.letter-spacing.*` | `dimension` | `"Npx"` | **groupe nouveau, découvert au relevé frais** (research D15) — absent de ce tableau à la planification, nécessaire à `typography.accroche.letter-spacing` ; même convention que `font.size`/`font.line-height`, additif au sens de FR-003 |

Valeur = strictement celle du cliché rafraîchi (aucune conversion, aucun arrondi,
aucune « normalisation esthétique »). Un `$description` de provenance est permis
(pratique existante du fichier) mais jamais obligatoire.

## Sémantiques (48) — alias obligatoires, forme point

```json
"typography": {
  "libelle-bouton": {
    "family": { "$type": "fontFamily", "$value": "{font.family.montserrat}" },
    "size":   { "$type": "dimension",  "$value": "{font.size.14}" },
    "weight": { "$type": "fontWeight", "$value": "{font.weight.semibold}" }
  }
}
```

- Alias en **forme point** (`{font.size.14}`) — le cliché les porte en slash, `norm()`
  convertit à la comparaison.
- Chaque alias se résout vers une primitive (existante ou adoptée) — sinon DEUX portes
  échouent en le nommant : `npm run tokens` (« references "{X}" which does not
  exist ») et `npm run figma:plan` (« Cannot resolve token »). Un alias cassé n'est
  JAMAIS résolu par une valeur inventée : l'adoption échoue et le nomme.
- Un littéral en position sémantique est refusé par le générateur (« Semantic token
  must be an alias ») — si le relevé montrait une sémantique littérale côté Figma,
  c'est une limite/conflit à consigner, pas à contourner.
- `$type` par feuille : `fontFamily` → STRING, `dimension` → FLOAT, `fontWeight` →
  FLOAT (l'inférence `figmaType`/`scopesFor` du moteur fait le reste — aucun scope à
  écrire à la main).

## Interdits absolus

- Toucher `tokens/modes/*` (mono-marque / mono-mode préservé).
- Toucher `contracts/*` (FR-009 : zéro conversion de valeur en dur).
- Éditer une sortie générée (`src/styles/tokens.css`, `figma-sync/01-tokens.js` ne
  changent QUE par régénération — principe IV).
