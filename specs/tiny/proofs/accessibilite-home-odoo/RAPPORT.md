# Rapport — accessibilité de la home Odoo (2026-09-04)

## Le résultat en une ligne

La page n'avait **aucune** structure de titres. Elle en a une : un titre principal, six
titres de section, neuf titres secondaires. La langue et le titre de page, tous deux
faux, sont corrigés. **Aucun pixel n'a bougé** (mesuré, 10 composants × 4 largeurs).

## Avant / après (axe-core 4.10.2, instance pilote, quatre largeurs)

| | avant | après |
|---|---|---|
| Balises de titre dans la page | **0** | **15** |
| Violations automatiques (desktop) | 1 | 1 |
| Points à trancher | 19–23 | 19–23, **tous tranchés** |
| Règles passées | 34–38 | 37–41 |
| Langue déclarée | `en-US` sur un site francophone | `fr-BE` |
| Titre de page | « Home \| My Website » (valeur d'usine) | titre réel, gouverné |

## Ce que l'automatisme ne voit pas — à lire avant toute conclusion

**L'absence TOTALE de titres ne produisait qu'UNE alerte automatique.** Aucun outil ne
peut deviner qu'un texte aurait dû être un titre : axe ne voyait que le titre de niveau
un manquant au niveau page. C'est pour cette raison exacte que le défaut a survécu sans
que rien ne le signale. **Ne jamais lire « zéro violation » comme « accessible ».**

## La violation restante est voulue

`heading-order`, deux à trois nœuds selon la largeur. Ce sont les **deux sauts de rang
acceptés par le propriétaire le 2026-09-04** : les cartes catégories en niveau trois sans
titre de section au-dessus, les cartes réassurances en niveau quatre sous un niveau deux.
La décision a été prise avant la mesure ; la mesure confirme qu'elle produit une alerte
modérée permanente. Deux corrections possibles si le propriétaire change d'avis : donner
un titre à la section catégories, ou passer les cartes réassurances en niveau trois.

## Un défaut RÉEL introduit puis corrigé — et il valide une intuition

Le passage du titre « Suivez-nous » en balise de niveau quatre l'a exposé à une règle
d'Odoo, `.o_footer h4`, dont la spécificité (0,1,1) **bat** celle de notre classe
(0,1,0). Le titre est passé de l'orange du contrat à un quasi-noir sur fond sombre :
contraste **1.23**, invisible. Le propriétaire avait soupçonné ce type de conflit dès le
départ ; l'enquête a montré qu'aucune décision de renoncement n'avait jamais été écrite,
mais **le mécanisme, lui, est bien réel** — il ne s'était simplement jamais déclenché,
faute de titre à déclencher.

Correction posée au bon endroit : la zone de pont `ODOO-023-FOOTER-BRIDGE`, qui existe
précisément pour neutraliser les conflits Bootstrap/Odoo, et dont la règle (3) traite le
même conflit pour le bouton. **Portée vérifiée** : sur les dix titres gouvernés, seul
celui-ci perdait sa couleur — Odoo ne pose de règle de titre que dans `.o_footer` et
`.o_cc2`. Les neuf autres gardent la couleur de leur contrat, mesuré.

## Ce qui reste ouvert, nommé

1. **L'initiale d'avatar des avis** est à 2.50 de contraste. Décorative (elle double le
   nom affiché à côté), donc non corrigée ici : la corriger demande une décision de
   design. Voir `contrastes.md` §C.
2. **La section devis n'a aucun voile** : son texte blanc repose sur la photo. La
   conformité dépend de l'image que le rédacteur choisit, et aucune porte ne la garde.
3. **Sept sections restent sans titre gouverné** : hero, texte SEO, équipe, FAQ,
   coordonnées, en-tête, formulaire. Elles utilisent l'ancienne famille de styles
   `Titre 1`…`Titre 6`, dont le niveau n'est pas déductible et demande un arbitrage.
4. **La langue est un réglage d'instance**, pas une donnée gouvernée : elle vit sur le
   site Odoo (`website.default_lang_id`), pas dans notre descripteur de page. Le titre,
   lui, est désormais gouverné (`meta_title`).
5. **L'extracteur ignore toujours le nom du style Figma.** Le relevé le transporte, le
   proposeur de contrats ne le lit pas. Sans cela, un NOUVEAU composant ne saura pas
   proposer son niveau de titre tout seul. Corrigé dans la doc, pas dans le code.
