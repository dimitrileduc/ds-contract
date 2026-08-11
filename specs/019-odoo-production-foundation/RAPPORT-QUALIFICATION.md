# Rapport de qualification — Fondation Odoo 019

## État

Les deux sections de production sont installables, éditables, sauvegardables et publiques sur Odoo 19 épinglé. Les scénarios obligatoires sont séparés en reçus machine-readable; le manifeste reste l'autorité pour le statut final.

## Réussites exercées

- Google Reviews : deux instances, collection 0/1/5/6, média, sécurité, sauvegarde et public.
- Presentation : deux instances, CTA opposés, rich-text contrôlé, sauvegarde et public; SectionHeader Fill et Button Hug/nowrap vérifiés sans overflow à 1728 et 1440 px.
- Versioning : états current, policy-stale, structure-stale et unknown; aucune migration structurelle implicite.
- Installation/update : contenu et métadonnées intacts; public anonyme non éditable et rédacteur standard autorisé.
- Coexistence : deux instances de chaque section restent isolées avant/après sauvegarde.
- Dérivation : 16 blocs manuels enregistrés, aucune adaptation non classée.

## Limites acceptées

- Les temps de gestes ne sont pas mesurés : aucun p95 n'est revendiqué.
- La parité visuelle n'est pas pixel parfaite : Google Reviews 1.5961313885326982 %, Presentation 2.6092857142857144 %, causes attribuées dans les rapports canoniques.

## Hors contrat et non exercé

- Aucune migration automatique du HTML structure-stale.
- Repin 2026-08-11 appliqué : SectionHeader 2.2.0 et Button 2.0.1; le lock, l'authoring, les assets, les métadonnées et les preuves utilisent le même graphDigest `9cf060ab…`.
- Les composants internes ne sont pas posables séparément.

Le statut final et les éventuels fail/skipped sont générés dans `proofs/qualification-manifest.json` après le sweep constitutionnel.
