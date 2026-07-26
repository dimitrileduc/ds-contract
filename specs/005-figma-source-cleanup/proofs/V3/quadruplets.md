> Base des liens : `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 6 (V3) · T059 — SAV, coquille 88→89 (piège GROUP contourné)

- **Cible** : [SAV 2108:3105](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2108-3105) — avant → après (même id, propriétés + descendants modifiés en place)
- **Version enregistrée** : `005/geometrie/sav` — `2380204794170636895` (posée **après** le geste — voir déviation de processus ci-dessous ; le vrai point de restauration antérieur est le checkpoint V2, `2380183199065576591`)
- **Diff annoncé** : 2px de largeur, page(s) portant SAV (annoncé après coup) · **Diff observé** : 8/9 `identical`, 1/9 `diff` (Accueil), `diffCount=7291` — **conforme**
- **Preuve** : [verdict](./verdict.md) · triptyque `crops/Accueil.png`
- **Pourquoi** : `section`/`row` sont des GROUP (bbox toujours dérivée des enfants — un `resize()` direct aurait scalé photo et texte). Contournement : redimensionner la feuille non-GROUP qui fixe la largeur (`background` RECTANGLE) et translater (jamais redimensionner) le GROUP `row` pour recentrer — `section` recalcule seule sa bbox au bon width, zéro déformation du contenu (vérifié : tous les descendants décalés de −1px exactement, tailles inchangées).
- **⚠️ Déviation de processus (nommée, pas cachée)** : l'exploration en lecture seule du piège GROUP a directement enchaîné sur ces 3 écritures, avant le checkpoint dédié et avant la capture "avant" dédiée — ordre exigé par `contracts/proof-cycle.md` §1 violé. Rattrapage : `.page-parity/V2/after/` (vérifié inchangé dans l'intervalle, 9/9 manifests `ok`, sha256 pinnés) réutilisé honnêtement comme référence "avant". Reportée en toutes lettres dans `RAPPORT-CLOTURE.md` § Dégradations & limites (T111).
