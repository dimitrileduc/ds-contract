# Notes parquées — entrées pour /speckit.plan et /speckit.clarify

> Provenance : brief owner du 2026-08-04 (sections 2 et 3, verbatim), volontairement tenues HORS de spec.md — ce sont des choix d'implémentation et des questions ouvertes, pas des exigences.
>
> Mise à jour depuis la feuille de route (ROADMAP.md § Prochaines specs, entrée 015 — qui fait foi) : **box-sizing et DW-001 sont TRANCHÉS le 2026-08-04** (un oubli à corriger / l'idiome de l'archive, pas des arbitrages ouverts), et **DW-002 est SORTI de 015** (re-classé `figma-source` → 016, reçu `dw-002-reclasse-figma-source`).

## 2) À parquer pour /speckit.plan (verbatim)

- Box-sizing : une règle dans core/emit-react.ts alignée sur celle de emit-html.ts (`.k, .k *, ::before, ::after { box-sizing: border-box }`) — 3 surfaces sur 4 l'ont déjà (Figma via strokeAlign: INSIDE, emit-html, playground/preview). Relevé complet : DW-014-002 + reçu react-box-sizing-absent. Les 9 contrats à re-mesurer : accordion-row, carte, coordonnees, faq, footer, google-reviews, review-card, sav, textarea.
- DW-001 (logo) : l'idiome est dans l'archive (avatar.contract.json, demo-51) — prop enum + token au chemin interpolé (`"width": "{size.avatar.{size}}"`). Travail : prop taille sur ds.piqueray-logo, minter `{size.logo.*}` (aucun token logo n'existe), remplacer literals {width:180px, height:34px} ; footer/header passent la valeur comme couleur.
- DW-004 : déplacer la valeur ET le contractPointer du fait (`/literals/` → `/tokens/`) ensemble ; `{space.89}`, `{space.128}`, `{space.48/32/16}` existent déjà (mintés par 012).
- DW-005 : mint from-dump — la doctrine est écrite dans tokens/primitives.tokens.json (space.$description).
- Hero : 2 littéraux background-image à écrire, zéro code moteur (linear-gradient CARRY-BOTH depuis v15, parseCssGradient → GRADIENT_LINEAR).
- Instruments 014 à réutiliser : `npm run measure:gate`, build-registre.mts --phase avant|apres, out/rows.json (pleine précision), attributions.json, causes.json (sameDefectAs, deferredWork).
- Re-pins si un émetteur bouge : evals/golden.json, figma-sync/plugin/engine.receipt.json, examples/polaris/figma/*.figma.js (3 reçus distincts).
- Pièges connus : grep sans -a ment (octet NUL dans les sources) ; evals/fixtures hors tsconfig (tsc vert ≠ eval vert) ; scratch d'eval en liste blanche (copier ciblé, pas un répertoire entier).
- Préservation 013 : fixture d'abord (Claims Rule) — reproduire le cas « une ré-extraction écrase un correctif manuel » en rouge avant d'outiller.

## 3) Questions ouvertes → /speckit.clarify (verbatim)

> **TRANCHÉES le 2026-08-04** — les quatre réponses font foi dans `spec.md` § Clarifications (session 2026-08-04) ; cette section reste le verbatim d'origine, à ne pas re-trancher en /plan.

Les trois premières sont posées dans spec.md comme marqueurs [NEEDS CLARIFICATION] (FR-006, FR-003, FR-002 respectivement) ; la quatrième est consignée en Out of Scope.

- Le comptage publié : « éléments constatés » ou « travaux à faire » ? La ligne footer est la conséquence de 3 entrées DW (1 ligne + 3 faits = 3 travaux, pas 4) — la relation 1:N n'est pas modélisée (aggregateOf proposé, jamais tranché).
- La frontière exacte des littéraux nommés : quels canaux géométriques n'ont légitimement pas de vocabulaire token (dégradés — quoi d'autre ?) et où cette liste vit-elle pour que le contrôle la connaisse ?
- La politique de mint : les valeurs sans token existant rejoignent-elles l'échelle space/size existante, ou des tokens sémantiques par composant ? (La doctrine dit « from-dump », pas la granularité.)
- DW-014-001 (hors 015, confirmé) : dans quelle spec l'ordonnancer, pour qu'il ne meure pas au registre ?
