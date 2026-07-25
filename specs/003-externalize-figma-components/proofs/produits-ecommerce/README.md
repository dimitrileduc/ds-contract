# Preuve — Produits e-commerce (T085-T086)

**Date** : 2026-07-25
**Master** : `COMPONENT` `Produits e-commerce` (`2116:4475`), plain (aucune variante) — voir
`audits/produits-ecommerce.md`.
**Adoption** : 2 pages, 2 instances 0-override (`2116:4531` Motorisation, `2116:4595` Accueil),
0 copie brute restante.
**Particularité** : rapport de l'agent constructeur **null** — la preuve ci-dessous a été
**reconstituée et contre-vérifiée par un agent indépendant**, pas recopiée d'un rapport.

## Verdict pixel — 2/2 identical, byte-identique, contre-vérifié à froid

`verdict.json` / `verdict.md` : **2/2 `identical`, 0 diff, exit 0**. Et sha256 identiques sur
**trois** jeux de captures, dont un appartenant au vérificateur :

```
before (00:38Z, builder)      f92ce3f9fc8f…  Accueil.png       (1728×5430)
after  (00:42Z, builder)      f92ce3f9fc8f…  Accueil.png
frais  (02:56Z, vérificateur) f92ce3f9fc8f…  Accueil.png

before (00:38Z, builder)      4d07354350f8…  Motorisation.png  (1728×3334)
after  (00:42Z, builder)      4d07354350f8…  Motorisation.png
frais  (02:56Z, vérificateur) 4d07354350f8…  Motorisation.png
```

Le jeu « frais » a été capturé par le vérificateur avec **son propre receveur** (port 9225,
nonce `95dbe147143ff741`, identité `/health` contrôlée par `capture.js` avant chaque octet),
2 h après l'adoption : le canvas **actuel** (instances en place, vérifiées structurellement au
même moment) rend byte-identique à l'état pré-adoption.

### Ce byte-identique est-il dégénéré comme Réassurances ? NON — corroboré par un jeu antérieur.

Réassurances était dégénéré parce qu'un fork avait adopté **avant** la capture `before`. Ici la
provenance du `before` est corroborée par le jeu de captures du bloc **Catégories principales**
(session de capture distincte, antérieure à toute mutation produits — le master produits
n'existait pas encore) :

- `categories-principales/before/Motorisation` (23:43:22Z) porte **déjà** `4d07354350f8…`
- `categories-principales/after/Accueil` (00:04:52Z) porte **déjà** `f92ce3f9fc8f…`

Ces pixels contiennent donc les **copies brutes** produits (personne n'y avait touché à ces
heures-là). before(raw) → after(adopté) → frais(adopté, vérifié) : **zéro pixel bougé**.

### Reproduction déterministe du verdict

Le vérificateur a re-run `pages:compare` sur les dirs du builder : le `verdict.json` re-produit
est **byte-identique** au `verdict.json` livré ici (diff vide). Idem pour le verdict
frais-vs-before.

## La preuve structurelle (corrobore le pixel)

1. **2 instances, 0 override** : `overrides: []`, `componentProperties: {}` sur les deux ;
   textes == défauts du master mot pour mot (mêmes 4 produits Hörmann sur les 2 pages).
2. **Gouvernance** : sous-arbre 100 % local — Section-header (`2090:2388`), 4× Product-card
   (`2068:1972`, T048), Carousel-controls (`2077:2191`, T056), tous `remote:false` ; 0 tierce.
3. **Master unique** (1 seul nœud « Produits e-commerce » COMPONENT dans le fichier),
   0 copie brute restante sur les 9 maquettes.
4. **Confirmation visuelle** (rôle du vérificateur) : export du master (fond transparent,
   416 170 px alpha 0) composité sur blanc vs crops des instances alignés sur
   `absoluteRenderBounds` (1604×414) : **0 px** de diff ; crop Accueil vs crop Motorisation :
   **0 px**. Glyphes contrôlés : flèche CTA sombre, chevrons Précédent/Suivant sombres —
   aucun glyphe blanchi/décoloré.

## Receipts

- Before/After (builder) : `.page-parity/produits-ecommerce/{before,after}/` (2 PNG + manifestes
  chacun, transport b-fetch, 1728 px de large — pas le plafond MCP)
- Frais (vérificateur) : `.page-parity/produits-verify/fresh/` (nonce `95dbe147143ff741`) ;
  export master : `.page-parity/produits-verify/master/` (nonce `8dabdaa11f651204`) ; crops et
  diffs de vérification dans `.page-parity/produits-verify/` (gitignoré, comme tous les PNG de
  travail)
- Comparaisons : `npm run pages:compare -- --before .page-parity/produits-ecommerce/before
  --after .page-parity/produits-ecommerce/after …` → `identical — 2/2 (exit 0)` ;
  re-run vérificateur byte-identique ; frais-vs-before également `2/2 identical (exit 0)`
- Ledger : `ledger/produits-ecommerce.json` (**vide explicite** 0/0, `pages:ledger:check`
  exit 0) — 0 override mesuré sur les deux instances, le vide est honnête
- Checkpoints : **non vérifiables** — token REST expiré (401) pendant la vérification, rapport
  builder null (aucun ID transmis). Nommé, pas tu. Impact nul : la preuve pixel est
  byte-identique trois voies et l'état actuel est vérifié.
- Pas de crops de diff (0 diff) — la revue visuelle repose sur l'export du master et les crops
  d'instances (0 px), pas sur des triptyques de diff (inexistants ici).
