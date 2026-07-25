# Audit — Section Produits e-commerce (T085)

**Date** : 2026-07-25
**Contexte particulier** : le rapport de l'agent constructeur est revenu **null**. Cet audit a été
écrit par l'agent de **vérification indépendante**, à partir de mesures live refaites de zéro
(structure, overrides, captures pixel, provenance) — pas à partir du rapport absent. Voir la
section « Incident » en bas.

## Usage — localisation par position (2 des 9 maquettes)

| Maquette | Frame | Occurrence d'origine (scan) | État actuel (vérifié live 02:5x UTC) |
|---|---|---|---|
| Motorisation | `237:705` | wrapper `Produits e-commerce` `237:911` (1596×414), interne `Produits` `237:916` (1552×312) | instance `2116:4531` à (66, 1846), 1596×414, enfant direct du frame |
| Accueil | `210:326` | wrapper `210:382` (mêmes dimensions), interne `210:387` | instance `2116:4595` à (66, 2477), 1596×414, enfant direct du frame |

Les wrappers et internes d'origine n'existent plus (remplacés) ; **aucun** nœud nommé
« Produits e-commerce » autre que les 2 instances ne subsiste sur les maquettes — zéro copie
brute restante.

## Structure (mesurée live sur le master)

`COMPONENT` **`2116:4475`** « Produits e-commerce », 1596×414, dans la section `2116:4465`
(0, 15100) de `DS · Molécules`. Auto-layout **VERTICAL**, itemSpacing **48**, padding 0,
sizing FIXED (H) / HUG (V). Description : vide (cohérent avec les autres masters de la nuit).

```
COMPONENT Produits e-commerce (2116:4475)            1596×414
├─ INSTANCE Section-header (2116:4467)               1552×54   → Section-header / Disposition=Avec CTA (2090:2388, remote:false)
└─ GROUP Carrousel produits (2116:4468)              1604×312
   ├─ FRAME Produits (2116:4469)                     1552×312
   │  ├─ INSTANCE Product-card ×4 (2116:4470→4473)   364×312   → Product-card (2068:1972, remote:false)
   └─ INSTANCE Carousel-controls (2116:4474)         1604×52   → Carousel-controls (2077:2191, remote:false)
```

Contenu par défaut : « Découvrez nos produits disponibles en ligne » + CTA « Voir  les
produits » ; 4 produits Hörmann (Télécommande HSE4-868BS 74,99€, Clavier FCT3-1BS 139,99€,
Bouton poussoir FIT2-1-868-BS 89,99€, Passerelle BiSecure 74,99€) ; contrôles
Précédent/Suivant.

**Débordement assumé** : le GROUP « Carrousel produits » fait 1604 px de large dans un master
de 1596 px (`clipsContent:false`, `absoluteRenderBounds` 1604×414 — les chevrons dépassent de
4 px de chaque côté). Hérité de la source : la preuve byte-identique avant/après démontre que
les copies brutes rendaient exactement pareil. Pas une régression de construction.

## Zéro dépendance tierce

Tous les `mainComponent` du sous-arbre sont **locaux** (`remote:false`) et déjà gouvernés :
Section-header, Product-card (T048), Carousel-controls (T056). Aucun composant de librairie
externe.

## Variations réelles trouvées : AUCUNE

- Les 2 instances portent **0 override** (`overrides: []`, `componentProperties: {}`).
- Contenus texte des 2 instances == défauts du master, **mot pour mot** (mêmes 4 produits,
  mêmes prix, sur les deux pages — la source dupliquait le même carrousel).
- Pixel : crop Accueil vs crop Motorisation (1604×414, alignés sur `absoluteRenderBounds`)
  = **0 px** de différence (pixelmatch 0.1).
- Le ledger vide (`entrees: []`, 0/0) est donc **honnête**, pas paresseux.

## Pièges vérifiés

1. **Glyphes de Bouton (pièges 5/7)** : flèche du CTA « Voir les produits » sombre sur fond
   clair, chevrons Précédent/Suivant sombres — vérifiés visuellement sur l'export du master ET
   les crops des 2 instances ; diff master-composité-sur-blanc vs crop instance = **0 px**.
   (Le master exporte avec fond transparent — 416 170 px d'alpha 0 — d'où un faux diff massif
   tant qu'on ne composite pas ; mesuré et expliqué, pas contourné.)
2. **Coordonnées relatives en section (piège 3)** : le master est à (106, 103) *relatif* à la
   section `2116:4465`, elle-même à (0, 15100) sur la page.
3. **Placement sans chevauchement** : Catégories principales finit à y=14934, Produits
   e-commerce occupe 15100→15720, Réalisations commence à 16120. Frais et propre.
4. **Piège 4 (attribution des écarts)** : scope de preuve = les 2 seules maquettes porteuses
   (précédent établi : sav 1 maquette, equipe 1 maquette). Verdict 2/2 identical — aucun écart
   à attribuer.

## Preuve pixel — byte-identique, provenance corroborée (voir `proofs/produits-ecommerce/`)

`before` (00:38 UTC) == `after` (00:42 UTC) == **capture fraîche indépendante du vérificateur**
(02:56 UTC, receveur port 9225, nonce `95dbe147143ff741`) — sha256 identiques deux pages.
Le scénario dégénéré type Réassurances (before capturé déjà-adopté) est **exclu** : les captures
du bloc Catégories (jeu indépendant, antérieur à toute mutation produits) portent déjà ces
mêmes shas — Motorisation `4d07354350f8…` dès 23:43:22Z, Accueil `f92ce3f9fc8f…` dès 00:04:52Z.

## Incident — rapport builder null, vérification reconstruite

- L'agent constructeur a livré : master + adoption + captures before/after + verdict + ledger,
  **sans** audit, sans entrée decisions.md, sans README de preuve, sans cocher tasks.md, et son
  rapport final est revenu null.
- Le vérificateur a reconstitué la preuve **sans réutiliser le travail invérifiable** : capture
  fraîche indépendante (receveur + nonce à lui), re-run de `pages:compare` (verdict re-produit
  **byte-identique** au `verdict.json` livré), lecture live de la structure et des overrides,
  corroboration de provenance par le jeu de captures Catégories.
- **Checkpoints non vérifiables** : le token REST a expiré (401) au moment de la vérification et
  le rapport null ne donne aucun ID — impossible de confirmer que
  `saveVersionHistoryAsync("003/produits-ecommerce/…")` a été appelé (règle 9). Impact nul sur
  la preuve (byte-identique 3 voies) ; nommé par honnêteté, jamais tu.
- **Aucun fork détecté** : 1 seul master « Produits e-commerce » dans tout le fichier, pas de
  receiver fantôme (le seul port occupé, 9224, est le bridge MCP lui-même), un seul jeu de
  captures produits sur disque.

## Récapitulatif

| Question | Réponse |
|---|---|
| Master unique, structure gouvernée ? | Oui — `2116:4475`, 100 % instances locales |
| Copies brutes restantes ? | 0 |
| Overrides à reporter ? | 0 (ledger vide honnête) |
| Pixels bougés ? | 0 — byte-identique before/after/frais, 2/2 maquettes |
| Provenance du before ? | Corroborée par le jeu Catégories (antérieur, indépendant) |
| Glyphes/couleurs ? | Vérifiés visuellement + 0 px après compositing |
| Checkpoints ? | Non vérifiables (token REST expiré + rapport null) — nommé |
