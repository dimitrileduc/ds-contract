# Gestes — cycle L2 (Variables & styles)

Détail complet des scripts, des trois défauts trouvés, et de leur correctif dans
`decisions.md` §L2 (append-only, chronologique). Résumé des scripts exécutés :

## Geste 1 — T027 (style Titre Hero) + T028 (21 liaisons) + T029/T030 (4 liaisons couleur)

Script exécuté verbatim : création du style texte `Titre Hero` (Montserrat Bold,
54px, lineHeight 68px PIXELS, letterSpacing 0%) ; appliqué au titre Hero
(`2111:3378`) puis correctif immédiat `setRangeFontName` pour restaurer le
segment `Light` (" industrielles") écrasé par l'application du style — détecté
et corrigé **avant** toute capture. 21 liaisons `setTextStyleIdAsync` sur les
nœuds confirmés par vérification fontName/lineHeight/letterSpacing. Liaisons
couleur via `figma.variables.setBoundVariableForPaint` + relecture séparée
(D5) sur `2079:2248`, `2086:2331` (→ `color/blanc`), `2059:1383`, `2059:1411`
(→ `color/noir-bleute`).

## Geste 2 — correctif casse (7 nœuds)

`setRangeTextCase(0, characters.length, 'UPPER')` sur `2061:1585`, `2061:1587`,
`2063:1604`, `2115:4165`, `2115:4173`, `2063:1614`, `2115:4249` — restaure la
transformation majuscule écrasée par le geste 1.

## Geste 3 — correctif graisse par instance (15 occurrences)

Scan des 117 occurrences réelles (pas seulement les masters) des 21 nœuds liés
sur les 9 maquettes, comparaison octet-exacte avant/après → 15 occurrences de
`2115:4165`/`2115:4173`/`2063:1614`/`2115:4249` corrigées via
`setRangeFontName(0, len, {family:'Montserrat', style:'Medium'})` **sur
l'instance**, pas le master (l'override de graisse est indépendant par
instance).

## Geste 4 — correctif opacité de bordure Accordion-row (26 instances)

Scan de toutes les instances `Accordion-row` sur les 9 maquettes, filtrées sur
`boundVariables.strokes[0].id === 'VariableID:5:40'` (liées à
`color/noir-bleute`) avec `opacity !== 0x52/255` → réaffectation
`node.strokes = strokes.map(p => ({...p, opacity: 0x52/255}))`.

**Résultat final** : 9/9 `identical`, exit 0, après 4 tentatives de capture
(la 1ʳᵉ a STOPpé conforme FR-029 ; les 3 suivantes ont progressivement isolé
et corrigé les 3 défauts). Toutes les tentatives intermédiaires et leurs
verdicts sont committées (`proofs/L2/`, `proofs/L2-retest/`,
`proofs/L2-retest3/`, `proofs/L2-retest4/`) — rien n'est effacé, la trajectoire
complète du diagnostic reste auditable.
