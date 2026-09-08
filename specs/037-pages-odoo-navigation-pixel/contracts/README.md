# Contracts — 037

Les interfaces que cette spec expose : quatre documents JSON (schémas draft-07 ici, **descriptifs** — la validation vivante
est celle du résolveur et de l'instrument, prouvée par les évals) et trois commandes npm. Aucun contrat de composant.

| Document | Schéma | Produit / lu par |
|---|---|---|
| Descripteur de page `integrations/odoo/authoring/pages/<page>.json` | `page-descriptor.schema.json` | écrit par le rédacteur ; lu par `scripts/odoo/resolve-page.ts` |
| Contenu commun `integrations/odoo/authoring/commun/<bloc>.json` | `commun.schema.json` | idem |
| Manifeste des vues `extract/odoo-page-parity/views.json` | `views.schema.json` | lu par l'instrument |
| Rapport de mesure `specs/037-…/proofs/mesure/<page>/<largeur>.json` | `rapport-mesure.schema.json` | écrit par l'instrument, `cause`/`justification`/`ecartsContenu` complétés à la main |
| Arbre du menu validé | `menu-tree.json` (donnée, pas schéma) | lu par `pages-navigation.spec.mts` et l'éval `odoo-pages-navigation-tree` |

## Commandes

| Commande | Rôle | Sortie / code |
|---|---|---|
| `npm run odoo:page -- <page> <projet>` | (existante) résout **puis** compose ; refuse avant Docker | `COMPOSE_OK <url> views […]` ; refus : `refus: <fichier> › section <n> (<component|commun>) › <clé|part> : <valeur> — <raison>` exit 1 |
| `npm run odoo:pages:check [-- --json]` | résout toutes les pages du site, imprime le registre des restes | texte ou JSON `{ pages: {…}, restes: [{page, section, part}] }` ; exit 1 au premier refus |
| `npm run odoo:pages:measure -- <page> [--base URL] [--out DIR] [--only-odoo\|--only-figma]` | 4 rapports pour une page | JSON par largeur + triptyques ; exit 0 si 4 `mesurée`, 1 si un `rouge`, 2 si un `impossible` (jamais confondus) |
| `npm run odoo:pages:selftest` | preuve hors ligne de l'instrument | `✔`/`✖` par assertion ; exit ≠ 0 au premier écart |
| `npx tsx integrations/odoo/qa/scenarios/pages-navigation.spec.mts [--red <url>]` | navigation sur les 9 vraies pages ; `--red` dépublie, exige l'échec nommé, republie | reçu JSON `proofs/navigation/` |

Le résolveur ne lit **que** `pages/`, `commun/` et `scripts/odoo/lib/pages.ts` ; il n'invente ni destination ni contenu.
