# Preuve — Catégories principales (T079-T080)

**Date** : 2026-07-25
**Master** : `COMPONENT_SET` `Catégories principales` (`2115:4277`), propriété `Disposition`
(`Standard` / `Pleine largeur` / `Pleine largeur · 3 cartes` / `Pleine largeur · RDV`) — voir
`audits/categories-principales.md`.
**Adoption** : 7 pages, 7 instances, 0 copie brute restante :
PdG `2115:4278` (Standard) · Accueil `2115:4392` (Standard) · Dépannage/SAV `2115:4364` (RDV) ·
Portes d'entrée `2115:4411` (Pleine largeur) · Motorisation `2115:4324` (3 cartes) ·
industrielles `2115:4297` (Pleine largeur) · résidentielles `2115:4438` (Pleine largeur).

## Verdict pixel — 5/7 byte-identiques, 2 écarts sous-pixel ACCEPTÉS par l'owner (exit 1)

`pages:compare` (raw-avant vs adopté-après, capture réelle des 2 côtés — preuve pixel standard,
**pas** dégénérée comme Réassurances) :

| Maquette | Statut | diffCount | Nature |
|---|---|---|---|
| Dépannage/SAV | **identical** | 0 | sha256 avant==après (`fdf2dfa329d7`) |
| Portes d'entrée | **identical** | 0 | sha256 avant==après (`ed5f4800ca39`) — **page à override lourd** |
| Motorisation | **identical** | 0 | sha256 avant==après (`4d07354350f8`) |
| industrielles | **identical** | 0 | sha256 avant==après (`2dbf35762826`) |
| résidentielles | **identical** | 0 | sha256 avant==après (`4675c795886d`) — **page à override lourd** |
| Portes de garage | diff | 2624 (0,034 %) | AA sous-pixel, bande sous-titre tuile `x124 y1026 w1344 h43` |
| Accueil | diff | 2500 (0,028 %) | AA sous-pixel, bande sous-titre tuile `x150 y1133 w1252 h18` |

**5/7 byte-identiques** — dont **les 2 pages à override lourd** (entrée, résidentielles : Titre +
Texte + libellé bouton + image + hauteur re-normalisée sur chaque carte) : la fidélité de
l'adoption Carte est **pixel-parfaite** (sha256 avant==après). Les 3 ancres alt (SAV, Motorisation,
industrielles) le sont aussi.

## Les 2 écarts — regardés, pas arrondis en bruit (règle owner)

Les 2 seuls écarts sont sur les **pages à tuiles** (variante `Standard`), bande du **sous-titre**
de tuile (fs18), 0,03 % des pixels. **Portes de garage est l'ANCRE Standard (zéro override)** —
l'écart ne vient donc PAS d'un override mais du re-rendu clone→instance du texte natif de la tuile.
Diagnostic exhaustif (crops `crops/*.png` + zoom 3× + lecture live) :

1. **Empattement (gras) — vérifié, pas perdu.** Les runs de police du sous-titre sont **un seul
   run `Regular`** dans le master, l'instance PdG ET l'instance Accueil (relecture live). Le zoom
   3× avant/après montre « Sectionnelles, basculantes ou enroulables. Alliez… » en **Regular
   uniforme identique** des deux côtés — aucun gras aplati (le piège Carte ne s'applique pas ici,
   le sous-titre de tuile n'a pas d'amorce grasse, contrairement au `Texte` de Carte).
2. **Propriétés texte — identiques.** master vs instance PdG : `letterSpacing` 0 %, `lineHeight`
   27px, `paragraphSpacing` 8, `LEFT`/`TOP`, `textAutoResize` HEIGHT, largeur 628,75, `y` 108,
   `absY` **entier** 1020 — **toutes égales** (seul `absY` diffère, car page différente). Aucun
   décalage de position, d'interlettrage, d'interligne ou d'espacement de paragraphe.
3. **Contenu — identique** (mêmes caractères, même casse).
4. **bbox `{0,0,0,0}`** sur les 7 instances (position + taille exactes de la copie brute).

**Conclusion** : re-rendu AA sous-pixel **irréductible** du texte natif de tuile cloné (l'instance
reproduit son clone au pixel de propriété près ; le résidu vient de la rastérisation du texte, pas
d'une perte). 0,03 % ≪ la tolérance visuelle ≤2 % de la spec, et **prouvé non-régressif** sur
toutes les propriétés plausibles. Écart nommé, jamais maquillé (exit 1 conservé tel quel dans
`verdict.json` — ce fichier ne ment jamais). Les cartes gouvernées (Carte), elles, sont
byte-identiques.

**Verdict owner (2026-07-25)** : **accepté**. Même famille que tous les écarts déjà acceptés cette
nuit (Devis/Présentation/FAQ/SAV/Texte SEO/Hero) ; l'owner note ce diagnostic-ci comme plus solide
que la plupart des précédents — Portes de garage étant l'ancre à 0 override, l'écart ne peut
structurellement pas venir d'un contenu substitué, et l'investigation complète (polices, toutes les
propriétés texte, zoom 3×) a été faite **avant** l'acceptation, pas supposée après coup. Raisonnement
et décision tracés dans `decisions.md` (entrée `ecart-pixel-accepte` du 2026-07-25) — `verdict.json`
lui-même reste `diff`/exit 1, l'acceptation vit uniquement dans la décision, jamais dans le fichier
de preuve.

## Zéro dépendance tierce (SC-008)

`findAll(INSTANCE)` sous les 7 instances adoptées + sous les 4 variantes du master :
**0 instance remote** (Carte + Bouton + glyphes tous locaux, `remote:false`).

## Receipts

- Before (copies brutes, provenance nommée) : `.page-parity/categories-principales/before/` (7 PNG,
  nonce receveur `461400ba33c31f64`), manifests sha256 complets (7/7 ok).
- After (adopté) : `.page-parity/categories-principales/after/` (7 PNG, nonce `32bf642e5f3f8a82`),
  manifests 7/7 ok.
- Comparaison : `npm run pages:compare -- --before .page-parity/categories-principales/before --after .page-parity/categories-principales/after --out specs/003-externalize-figma-components/proofs/categories-principales` → `diff — 5/7 identical, 2 diff (exit 1)`.
- sha256 avant==après sur 5/7 (SAV, entrée, Motorisation, industrielles, résidentielles).
- Crops (avant | après | diff) : `crops/Portes de garage.png`, `crops/Accueil.png`.
- Ledger : `ledger/categories-principales.json` (23 reportee / 0 non-portable, `pages:ledger:check` exit 0).
- Checkpoints Figma : `003/categories-principales/master` (`2379926299894749252`),
  `003/categories-principales/adoption` (`2379927416113640765`),
  `003/categories-principales/finalize` (`2379923559176343741`).
