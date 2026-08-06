# Reçu — quickstart rejoué de bout en bout sur l'état final (T077)

**Date** : 2026-08-06 · **État** : après la sweep de clôture · **Méthode** : chaque
commande du quickstart relancée telle quelle ; le compte VIF fait foi, l'écart avec
la prose du quickstart est nommé, jamais lissé.

## Les commandes du dépôt (relancées maintenant)

```
$ curl -s localhost:9227/health
{"instrument":"page-parity","outDir":"/Users/dlstudio/.superset/projects/ds-contract/.page-parity/FINAL21/apres","nonce":"c8e56ae3cbaaa1ba","startedAt":"2026-08-06T14:27:35.664Z"}
$ npm run parity

  [icons AHEAD] assets/icons/close.svg
    code has an icon asset with no registry entry (Figma-first: every icon is born in Figma, FR-008)
    → Review: add to the registry (promotion, requires a Figma master) or delete the orphaned asset


$ npm run build (résumé)
✔ contracts/contract.schema.json emitted from Zod schema
✔ Generated 34 component(s) from contracts: AccordionRow, Avantage, Button, CarouselControls, Carte, Checkbox, Coordonnees, Copyright, Devis, Equipe, FAQ, Field, Footer, FooterColumn, Formulaire, GoogleReviews, Header, Hero, Input, MemberCard, MemberPicture, NavItem, PiquerayLogo, Presentation, ProductCard, Realisation, Reassurances, ReviewCard, SAV, SectionHeader, Select, Tab, Textarea, TexteSEO

$ npm run plugin:check
plugin-engine-check: all flows green (bundle, generate, update-report, apply, propose-diff, pr-dry-run) — 3 flow(s) SKIPPED and named above; see evals/REMOVED-CASES.md

$ npm run geometry:gate
  contracts 34 · geometric entries 2 · governed refs 244 · named literals 2 · invisible 0
✓ zero invisible literal, zero registry refusal
```

## Les gestes canvas (relevés, non rejoués — le canvas est à son état final)

- **Historique des versions Figma** : les points nommés existent et sont listables
  (`016/U1a-variables/avant`, `016/R1-sans-photos/avant`, `016/Devis-photos/avant`,
  `016/repose-overrides/avant`, `016/rangement-atelier/avant`, `016/nettoyage-debris/avant`,
  `016/B013-lots/avant`, `016/R2-photos/avant`, `016/text-flow/avant`) — le moyen n°1
  du quickstart (vérification owner sans aucun outil du dépôt) est **opérationnel**.
- **La sentinelle** a été rejouée intégralement ce jour sur l'état final :
  `proofs/recus/sentinelle-T073.md` (dérèglement → détection classée → annulation exacte).
- **La revue visuelle** se regénère et s'ouvre : `tools/revue-visuelle.mts` relancé
  sur `00-REFERENCE-AVANT-CHANTIER` vs `FINAL21` (9 maquettes, page autonome).

## Écarts entre le quickstart écrit et la réalité — nommés

1. **`npm run golden:update`** n'existe pas comme script npm ; le re-pin réel est
   `node scripts/update-golden.mjs`, et il y en a **trois** (golden, engine.receipt
   via `build-plugin-zip.mjs --update-engine-receipt`, polaris via
   `examples/polaris/generate.ts`) — le quickstart n'en nomme qu'un.
2. **`measure:gate` attendu à `figma-source: 0`** : le résumé imprime **2** alors que
   `rows.json` du même run compte **0** ligne figma-source. Écart d'instrument
   (le résumé compte des règles, pas des lignes) consigné dans
   `proofs/measure-gate-post-dw.txt` — le verdict reste PASS.
3. **Le census photos annonçait 9 porteurs**, le vif en a donné 14 puis **11 amendés** :
   `CategoriesPrincipales` et `ProduitsECommerce` sont des sections client non
   gouvernées (défaut `D-016-SECTIONS-LOCALES-CARTES`), `MemberCard` reste bloqué A5.
4. **`photos-verify.mts` / `photos-report.json`** : la vérification d'identité a été
   faite par **census de hashes par master** (`proofs/photos/CENSUS-APRES.md`), pas par
   l'outil — même garantie (identité, pas seulement présence), chemin différent.
