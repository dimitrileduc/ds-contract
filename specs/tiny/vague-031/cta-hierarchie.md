# Hiérarchie des CTA — « Voir les produits », « Voir tous les avis », et le style Link en SemiBold (2026-09-09)

**Demande owner** : « certains CTA sont trop dominants par rapport aux CTA principaux (e-commerce : Voir les produits ; avis
Google : Voir tous les avis) — que proposes-tu, quelles options en respectant le DS ? » puis « ce CTA link ne devrait-il pas
être plus gras pour tout le monde ? » puis « pourquoi lui [Présentation d'À Propos] n'utilise pas le bon CTA ? ».

## Décisions
- **Option A « lien en place »** (planche `031 · 25`, 3 options dessinées, supprimée après décision) : les deux CTA de
  navigation passent en style **Link + flèche**, là où ils sont. Périmètre strict : e-commerce + Avis Google. Réassurances
  garde Outline noir (conversion). Orange écarté par mesure : blanc sur `color/orange` ≈ 2,5:1 < AA.
- **Le style Link en SemiBold au repos, pour tout le monde** : un seul style, 24 contextes, 468 instances suivent.
  Style de texte dédié « Libellé bouton lien » (jamais une graisse par surcharge). Survol : soulignement + noir pur,
  plus de changement de graisse.
- **Trois défauts de source corrigés (§VIII)** : 40 libellés Link détachés de leur style dans les vues démo (Catégories
  principales, 5 pages) ; « En savoir plus » de Présentation dessiné à la main en Mobile/Tablette/Desktop ; « Contactez-nous »
  de Réassurances dessiné à la main sur 4 variantes (rendu identique à l'octet après remise en instance).

## Dépôt
`ds.button` 2.4.1 · `ds.produits-ecommerce` 2.2.1 · `ds.google-reviews` 3.1.2 · `ds.presentation` 4.2.1 · `ds.reassurances` 2.2.1 ;
deux CSS Odoo allégés ; miroirs, repin, build, figma:plan, catalog, golden, reçu ; parité verte sur cliché frais.
`npm run eval` non lancé (demande owner). `odoo:derivation:check` rouge sur une entrée d'une autre session.

## Preuves
`specs/tiny/proofs/cta-hierarchie/` — `cta-`, `lien-`, `catprin-`, `pres-`, `rea-` × avant/après (100 PNG, ~45 Mo : les deux
exports de sets entiers pèsent 12 Mo à eux seuls — à alléger avant commit si l'owner le souhaite). Versions Figma nommées
avant/après chaque geste. Détail, pièges et commandes : `docs/16-mode-emploi-composant-vers-odoo.md`, compléments du 2026-09-09.
