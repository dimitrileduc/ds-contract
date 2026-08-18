# Rapport de qualification — Fondation Odoo 019

## État

Les quatre sections de production sont installables, éditables, sauvegardables et publiques sur Odoo 19 épinglé. Les scénarios obligatoires sont séparés en reçus machine-readable; le manifeste reste l'autorité pour le statut final.

## Réussites exercées

- Google Reviews : deux instances, collection 0/1/5/6, média, sécurité, sauvegarde et public.
- Presentation : deux instances, CTA opposés, rich-text contrôlé, sauvegarde et public; SectionHeader Fill et Button Hug/nowrap vérifiés sans overflow à 1728 et 1440 px.
- Hero : deux instances sans image embarquée, textes/CTA et média Odoo isolés, sauvegarde et public; fond Fill et CTA Hug/nowrap vérifiés sans overflow à 1728 et 1440 px.
- Équipe : deux instances, collection 0/1/16/17, nom/poste, portrait Odoo avec alt, save/reopen/public; grille native quatre colonnes sans overflow à 1728 et 1440 px.
- Versioning : états current, policy-stale, structure-stale et unknown; aucune migration structurelle implicite.
- Installation/update : contenu et métadonnées intacts; public anonyme non éditable et rédacteur standard autorisé.
- Coexistence : deux instances de chacune des quatre sections restent isolées avant/après sauvegarde.
- Dérivation : 66/66 props et 100/100 parts décidées; 8 sorties générées propres; delta manuel mesuré à 10 fichiers, 25 blocs, 1 298 lignes et 72 706 octets, sans adaptation non classée.
- Médias : Hero, Google Reviews et Équipe se remplacent depuis leur panneau métier; le clic canvas direct n'expose aucun outil image natif de remplacement, crop, filtre, lien, forme, format, transformation, alignement ou style.
- Équipe : upload et resélection d'une pièce jointe existante sont exercés séparément; une source sûre devient visible immédiatement, y compris avec l'alternative décorative vide remise par Odoo.

## Limites acceptées

- Les temps de gestes ne sont pas mesurés : aucun p95 n'est revendiqué.
- La parité visuelle globale n'est pas déclarée pixel parfaite : Équipe est strictement identique à 0 %, Hero est mesuré à 0.007386110674628117 %; les mesures Google Reviews et Presentation restent attribuées dans leurs rapports canoniques.

## Hors contrat et non exercé

- Aucune migration automatique du HTML structure-stale.
- Repin 2026-08-11 appliqué : Équipe 1.2.0, MemberCard 1.3.0 et MemberPicture 1.3.0 rejoignent le lock actif; l'authoring, les assets, les métadonnées et les preuves utilisent le même graphDigest `96f4b959…`.
- Les composants internes ne sont pas posables séparément.

Le statut final et les éventuels fail/skipped sont générés dans `proofs/qualification-manifest.json` après le sweep constitutionnel.
