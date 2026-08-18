# US3 — round-trip headless ×2

Deux cycles successifs `npm run build` puis `npm run figma:plan`, sans modification d'entrée, ont produit des sorties **octet-identiques**.

- fichiers gouvernés comparés : 218
- SHA-256 du manifeste trié, run 1 : `2b5c85579fb5c2e174cb174f31bce6a17e2452297419dfb8a9833178e845c72a`
- SHA-256 du manifeste trié, run 2 : `2b5c85579fb5c2e174cb174f31bce6a17e2452297419dfb8a9833178e845c72a`

Sorties US2 témoins :

| Sortie | SHA-256 run 1 = run 2 |
|---|---|
| `figma-sync/04-button.js` | `7307942aff99dc09493352f753a3aa51aa81014498804178b3c09c0f40af9770` |
| `figma-sync/05-carouselcontrols.js` | `2985502b74be78833f2b1254434e005e45130803e6c577525b610cc1c025a15d` |
| `figma-sync/09-coordonnees.js` | `6d9707cdb885543b80533f0f7031f829f54f55fd1a2f744d9680a986db37b201` |
| `figma-sync/23-formulaire.js` | `ace61c3adbf52f19d24f6eaae328e48f676693ece18a9c8aabc930e4ff2bbf45` |
| `src/components/Formulaire/Formulaire.tsx` | `8ffb87dd4ef6dfd2712aa939bd82d56083900a4fb1b2efc74d4af2a3a9c2b634` |

Les deux builds ont aussi régénéré avec succès 34 composants, les assets Odoo et le rapport de dérivation Odoo.
