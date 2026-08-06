# `piqueray_ds` — ce que cet artefact est, et ce qu'il n'est pas

**Lisez ceci avant de réutiliser une seule ligne de ce module.**

## Ce que c'est

Un module Odoo 19 **écrit entièrement à la main**, qui réplique trois composants gouvernés du
design system Piqueray — `ds.presentation`, `ds.section-header`, `ds.button` — pour **mesurer ce
que cette réplique coûte**. C'est un instrument de mesure, produit par la spec
[`018-odoo-replique-manuelle`](../../spec.md). Son livrable réel n'est pas ce module : c'est le
[rapport de décision](../../RAPPORT-DECISION.md) qu'il permet d'écrire.

## Ce que ce n'est pas

**Ce module ne va sur aucun site.** Ce n'est ni une prudence de rédaction ni une réserve
juridique — c'est une conséquence mécanique, et elle mérite d'être comprise :

Le différentiel du dépôt a **trois axes**, et trois seulement
([`docs/06-parity-loop.md`](../../../../docs/06-parity-loop.md)) :

| Axe | Ce qu'il surveille |
|---|---|
| `code ⟷ contract` | la bibliothèque React générée contre les contrats |
| `canvas ⟷ contract` | la bibliothèque Figma contre les contrats |
| `canvas variables ⟷ tokens/` | les variables Figma contre le vocabulaire de jetons |

**Une quatrième surface n'en a aucun.** Rien, dans ce dépôt, ne compare ce module aux contrats.
Si un contrat change demain, `npm run parity` reste vert et ce module devient **silencieusement
faux**. Aucune porte ne s'allume, aucun rapport ne le signale. C'est le fait qui **fonde** FR-015 :
un artefact que rien ne surveille ne peut pas être posé devant un client.

Il n'est pas non plus **généré** : il est tapé au clavier. La seule chose que le dépôt produit ici
est `static/src/css/tokens.pqr.css`, écrit par `npm run tokens` et porteur de son en-tête
`GENERATED FILE — DO NOT EDIT.`. Tout le reste est manuel — **c'est la définition de l'artefact**
(FR-004/FR-015), pas un trou dans sa fabrication.

## Ce qu'il ne porte pas

Les faits que les contrats portent et que ce montage **n'exprime pas** sont nommés, un par un, dans
[`NON-PORTES.md`](./NON-PORTES.md) — jamais laissés en silence. Une omission silencieuse est le
défaut de sévérité maximale de ce dépôt.

Les valeurs de style écrites en clair — il y en a, et elles sont comptées à part — sont inscrites
et épinglées dans [`named-literals.registry.json`](./named-literals.registry.json). La doctrine
du dépôt vise **zéro valeur invisible**, pas zéro littéral : un littéral nommé, épinglé
byte-à-byte contre son contrat et comparé est conforme ; un nombre écrit à la main et déclaré
nulle part ne l'est pas.

## Comment il se remonte

Instance jetable, installation, gestes, destruction : [`../../quickstart.md`](../../quickstart.md).

## Ce qui est GÉNÉRÉ ici — ne jamais éditer à la main

| Fichier | Producteur |
|---|---|
| `static/src/css/tokens.pqr.css` | `npm run tokens` (`scripts/build-tokens.mjs`) |

**Conséquence permanente, nommée pour qu'elle ne se redécouvre pas plus tard** : `npm run tokens`
écrit désormais **dans le dossier de cette spec**. Archiver ou déplacer `specs/018-…/` cassera
`npm run build` tant que `scripts/build-tokens.mjs` n'aura pas été mis à jour. C'est le prix
assumé du choix — voir `plan.md` § Complexity Tracking.
