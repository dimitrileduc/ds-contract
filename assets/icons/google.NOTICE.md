# Note de marque — `google.svg`

Le glyphe `google.svg` reproduit le logomark « G » multicolore de Google (marque déposée de
Google LLC). Il est consommé par `ds.google-reviews` comme **glyphe interne** (classe D7,
`parity/diff.ts:809-833` : un asset consommé par un `icon.asset` non templaté n'est pas orphelin
sans entrée au registre) — même mécanisme que `check.svg` / `close.svg`.

**Décision (R4, `specs/006-google-reviews-block/research.md`)** : ce glyphe reste **hors**
`contracts/icons.registry.json` — la marque d'un tiers n'entre jamais dans le menu d'icônes offert
à tous les composants du système. Il est fixe, propre à ce composant, jamais proposé comme choix
générique.

Usage prévu : identification visuelle du fait que l'avis provient de Google (barre-résumé du
bloc « Avis Google »), à l'identique de l'usage du logo Google sur le widget tiers d'origine
(Trustindex) que ce composant remplace.
