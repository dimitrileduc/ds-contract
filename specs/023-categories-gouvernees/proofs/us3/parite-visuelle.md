# US3 — Parité visuelle des 2 contrats (T035 + moitié apparence de T036)

**Date** : 2026-08-21 · `FIGMA_TOKEN` fourni (copié de `main/.env.local`, gitignored).
**But** : fermer l'angle mort où les sections échappaient à la parité visuelle (FR-021)
et prouver que l'axe **apparence** détecte une dérive sur les nouveaux contrats.

## Défaut réel trouvé (corrigé) — le loader ignorait `assets/vectors/`

En câblant les 2 sujets, l'instrument a **refusé** de rendre `ds.carte-categorie` :
*« part "decor" needs vector asset "assets/vectors/carte-categorie-decor.svg" which does
not exist »* — alors que le fichier existe et est committé.

Cause : `loadRepoData` (`extract/fidelity-matrix/scripts/lib.ts`) construisait sa map
d'assets depuis **`assets/icons/` seulement**, jamais `assets/vectors/`. Tout contrat
portant un `vectorAsset` était donc refusé au rendu (`validateContract`). **Gap silencieux
pré-existant** : `ds.piqueray-logo` (vectors `piqueray-logo-marque/wordmark`) est un sujet
et était refusé sans bruit.

Correctif : la map lit `['icons','vectors']` (miroir de `generate-components` /
`build-plugin-zip` / `emitters-check`). Preuve : après correctif, `piqueray-logo` rend à
**0.02 % / 0.00 %** (« near-identical ») — il était refusé avant.

## +2 sujets (subjects.ts) — mesurés

| Sujet | Variante | score brut | note |
|---|---|---|---|
| `carte-categorie` | Style=Superpose | 70.04 % | plan photo absolu → hauteur ours 325 vs figma 836 ; frontière image + artefact `emit-html` |
| `carte-categorie` | Style=Empile | 45.54 % | fixture `carte-categorie` prêtée (patron 017) |
| `categories-principales` | Superpose ×2 col | 82.64 % | section, photos répétées non prêtées (frontière image) |
| `categories-principales` | Empile ×2 col | 57.77 % | |
| `categories-principales` | Empile ×3 col | 40.17 % | |
| `categories-principales` | Superpose ×3 col | 84.62 % | |

Scores hauts mais **du même ordre que des sujets déjà baselinés** (`member-picture` 61 %
`[image-boundary]`, `realisation` ~99 % `[flat-fill]`) : ce sont des frontières image + un
artefact de mesure connu — **DW-014-002 nommé** (l'instrument rend `emit-html`, pas la
surface React livrée). Le triage des causes (image-boundary vs rendering) suit la mécanique
014/017.

## Moitié APPARENCE de T036 — l'axe détecte une dérive (démonstration)

Dérive apparence injectée sur la molécule : `empile.background-color`
`{color.blanc}` → `{color.noir-bleute}` (fond blanc → sombre).

| Variante | avant | après drift | verdict |
|---|---|---|---|
| Style=Empile | 45.54 % | **70.65 %** (+25 pts, ink #5b5c59 vs #757672) | **dérive mesurée** |
| Style=Superpose | 70.04 % | 70.04 % | contrôle : inchangé (drift ciblé sur `empile`) |

→ L'axe apparence **répond** à un changement d'apparence, spécifiquement sur la variante
touchée. Dérive retirée, contrat restauré (git propre).

## Limite nommée — écriture de la baseline = rafraîchissement transverse (différé)

`--write-baseline` **écrase la baseline EN BLOC** (tool, `run.ts:2231-2263`) et la baseline
date de **2026-08-06 (017)**. Un `--summary` complet donne **38 échecs vs baseline**, mais
ils sont majoritairement de la **dérive d'AUTRES specs** : `section-header` ré-axé depuis 017
(2 variantes disparues + ~14 nouvelles, chaîne 016/018), `review-card` promu 2.0.0
(`1d33bce6`), plus `piqueray-logo` (rend maintenant) et mes 2 sujets.

Écrire la baseline maintenant **épinglerait silencieusement** la dérive de section-header /
review-card sous 023 — hors périmètre. La **pin des scores** (donc le proof de régression
« gate exit 1 » de l'axe apparence) attend un **rafraîchissement complet, revu, de la
baseline** — décision visible de l'owner, même classe que la limite nommée de 017 (cliché
`figma-components` périmé). Le loader est réparé et les 2 sujets rendent : l'angle mort
structurel (FR-021) est fermé ; seule la pin des scores est différée, nommée.
