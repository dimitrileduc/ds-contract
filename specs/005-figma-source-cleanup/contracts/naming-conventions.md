# Contrat — Conventions de nommage

**Pourquoi c'est un contrat et pas une préférence** : les noms de calques **deviennent** les
identifiants du code généré à l'itération suivante. Extraire avant de nettoyer, c'est graver
`vector`, `frame8` et `property1` dans des contrats versionnés, puis payer un renommage
cassant (majeur au sens du semver contrat) pour en sortir. D'où la règle 4 du brief :
**naming d'abord**.

## 1 · Ce qui est un nom faux

| Classe | Exemples relevés | Exigence |
|---|---|---|
| **Généré par défaut** | `Vector`, `Vector (Stroke)`, `Group 2`, `Group 6`, `Group 7`, `Frame 8`, `Text`, `text` | FR-001 |
| **Tiré du contenu rédactionnel** | le titre Hero nommé « Portes de garage industrielles » (×8) | FR-002 |
| **Axe générique** | `Property 1` sur `piqueray_logo` (`4:14`), `Bouton` (`6:122`), `Header nav` (`84:285`), `member-picture` (`274:2389`) | FR-003 |
| **Orthographe / accent incohérents** | « Outilne noir » (Bouton), « Presentation » (valeur de variant de Réalisations) | FR-004 |
| **Collision** | le calque interne « Présentation » de Réalisations vs le master « Présentation » | FR-005 |

## 2 · Ce qui les remplace

- **Un nom décrit un rôle**, jamais un contenu. Un changement de texte ne doit plus rendre
  un nom faux. (« Titre » — pas « Portes de garage industrielles ».)
- **Un axe nomme la dimension qu'il fait varier**, pas une valeur ni un rang.
- **Français**, cohérent avec l'existant du fichier — `Checkbox`, `Field`, `Défaut`,
  `Coché`, `Optionnel`, `Saisie` sont déjà en français ; le mélange anglais/français est
  précisément l'incohérence que FR-004 vise.
- **Casse et accentuation stables** : `Text` vs `text` ne coexistent pas ; « Presentation »
  devient « Présentation ».

## 3 · La racine plutôt que l'écho

Les ≈69 « noms par défaut » du lint ne sont **pas 69 défauts** : ce sont une poignée de
racines et leurs échos dans les instances. Un calque d'instance porte le nom de son master —
il n'est pas renommable, et il ne doit pas l'être.

| Racine | Effet |
|---|---|
| Enfants des **18 masters d'icônes** (15 sur `Assets` + 3 sociales sur `DS · Atomes`) | éteint les ~29 échos vus dans les instances des organisms |
| Enfants de `piqueray_logo` (~20 nœuds) | éteint ses échos partout |
| `Frame 8` (Coordonnées), `Text` (Hero), `Vector` ×2 (Catégories principales), `Frame 8`/`Group 6`/`Group 7`/`Vector` ×2 (Footer) | défauts **propres** aux organisms, à corriger sur place |

**Conséquence de méthode** : le dénominateur de SC-002 est le relevé
`releves/perimetre-<date>.json` (scan par position), pas le compte brut du lint. Un nom du
relevé qui survit au lot L1 est un échec ; un écho d'instance qui persiste alors que son
master est corrigé est un artefact d'affichage, pas un défaut.

## 4 · Le cas du seul master sous contrat

`Bouton` (`6:122`) est dans `contracts/button.contract.json` : `bindings.figma` porte
`"property": "Property 1"` et la valeur `"outilneNoir": "Outilne noir"`.

**Ce que fait cette itération** (FR-039), et rien de plus :
1. renommer l'**axe** `Property 1` ;
2. corriger la **faute** « Outilne noir » → « Outline noir ».

**Ce qu'elle ne fait pas** : modifier le contrat (FR-033), ni retoucher le reste du
vocabulaire de valeurs (`Default`, `Link`, `Orange`, `Blanc`, `Outline blanc`) — la spec
mandate l'axe et la faute, pas une refonte du vocabulaire, et chaque valeur renommée est une
correspondance de plus à rétablir en Spec B.

**Résultat assumé** : le contrat devient faux vis-à-vis de la source. C'est le résultat
**attendu**, pas un accident — la divergence est écrite au rapport de clôture avec sa
réparation (bump **majeur**, une valeur de variant renommée). Ce qui serait un échec, c'est
qu'elle ne soit pas écrite.

## 5 · Vérifications obligatoires autour d'un renommage

- **Une instance survit-elle au renommage de son master / de son axe ?** Vérifié, jamais
  supposé (edge case de la spec). Les overrides d'instance sont référencés par identifiant
  de propriété, pas par libellé — mais c'est la vérification qui le prouve, pas la doctrine.
- **Le relevé se fait par POSITION, jamais par nom.** Un nom peut mentir : c'est exactement
  le défaut que cette itération corrige. On ne cherche pas les défauts avec l'outil défectueux.
