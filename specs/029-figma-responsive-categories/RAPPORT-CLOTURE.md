# 029 — Rapport de clôture (2026-08-26)

## §1 Ce qui est livré

- **Canvas** : `CategoriesPrincipales` (2115:4277) responsive — 12 membres,
  `Presentation{Wide,Desktop,Mobile} × Style{Superpose,Empile} × Colonnes{2,3}`,
  matrice complète (12/12 combinaisons commutent), défaut historique conservé
  (2115:4273). Grille en wrap, mobile 1 carte/ligne, orpheline 3-colonnes à sa
  largeur de piste (option A H2). Les 7 usages Pages : mêmes membres, dimensions
  au pixel. `Carte/Categorie` adaptée dans son périmètre exclusif.
- **Runner** : extension générique v2 (set existant, multi-axes, deltas propagés,
  refus `unexpected-created-node`/`shared-child-write-forbidden`), ~20 fichiers,
  4 fixtures rouges nouvelles enregistrées dans `evals/run.ts`.
- **Campagnes** : les deux runs `owner-accepted` après `--finalize`, reçus
  schema-valid, `pageWrites=[]`/`childWrites=[]` partout, idempotence no-op.

## §2 Le fait central : conforme à la spec ≠ conforme à l'intention

Le run-001 a livré exactement ce que R3 + H2 décrivaient — une adaptation interne
sans nouvelle variante — et l'owner attendait des breakpoints visibles comme
HeroVideo. La chaîne de causes est le registre `inventory/ecarts-028.md` (E2) ;
le correctif est `specs/component-repairs/categories-principales/run-002/`
(geste manuel bridge, 2 versions Figma épinglées : `2392109833678654034`,
`2392110086515334936`). La leçon est devenue le principe constitutionnel XII
(Decision Surface Fidelity, constitution 1.3.0).

## §3 Gates à la clôture

- `npm run build`, `npx tsc --noEmit`, `tsc -p tsconfig.build.json`,
  `plugin:check`, `deterministic-roundtrip`, `core-browser-check` : **verts**.
- `npm run parity` : **vert**, 7 acquittements nommés dans `parity/baseline.json`
  dont 2 nouveaux de cette clôture : `figma|ahead|CategoriesPrincipales.Presentation`
  et `figma|ahead|HeroVideo.Presentation` (028 révélé par le cliché frais).
- `npm run eval` : **236/237** — l'unique rouge est la dette golden préexistante nommée par la clôture 028 (25 sorties générées vs golden, `specs/028-figma-responsive-hero-video/proofs/runner-full-gates.md`), non repinnée ici volontairement ; 4 des 5 dettes rouges héritées de 028 sont résorbées par cette clôture (229/234 → 236/237) (résultat autoritatif : `evals/results.json`).

## §4 Ce qui reste ouvert, nommé

1. **Promotion contrat** de l'axe `Presentation` (Categories ET HeroVideo) :
   le canvas est en avance, les patchs proposés sont dans la sortie de parité.
2. **run-002 hors runner** : pas de second-passage no-op automatisé sur le geste
   Presentation ; filet = versions épinglées + reçu manuel. La capacité
   « créations déclarées dans un set existant » construite par 029 n'a pas été
   exercée en live — à faire au premier composant de la vague 030.
3. **Bug runner E8** : `ownerDecisionRoot` partagé entre deux campagnes fait
   échouer `--finalize` (contourné par déplacement temporaire) — à corriger
   avant toute feature multi-campagnes.
4. **Césure carte** à 390 px (« RÉSIDENTIEL-LES ») — retouche carte si l'owner la
   demande.
5. **Nommage** `Compact` (028) vs `Mobile` (029) — unification = décision owner.
6. Cliché `parity/snapshots/figma-tokens.json` non rafraîchi (T057 ne portait que
   figma-components) ; variables inchangées aujourd'hui.

## §5 T062 — relecture de clôture

Registre écarts et handoff relus à la clôture : aucun écart constaté sans entrée
datée ; E8 ajouté au moment de sa découverte (20h15).
