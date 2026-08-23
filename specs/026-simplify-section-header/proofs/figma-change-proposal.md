# Proposition de réconciliation Figma — SectionHeader v3

**Statut : en attente du GO explicite du propriétaire.** Cette proposition ne
constitue pas une autorisation de mutation. Le checkpoint source est
`2390951111569267738` du 2026-08-23 17:45:18Z ; toute application doit refuser
si la version courante a changé et doit créer un nouveau checkpoint avant
l'écriture.

## Périmètre vérifié

- Fichier : `d9FYAUcqdcNtsuaMgLefvJ`.
- Master générique : `2090:2397` (`SectionHeader`, 16 variantes actuelles).
- Masters propriétaires : Hero `2111:3382`, Présentation `2103:2824`, Texte SEO
  `2108:3123`, Produits e-commerce `2116:4475`.
- Usages : 45 capturés et épinglés dans
  `inventory/migration-ledger.json` : 24 génériques, 8 Hero, 3 Présentation,
  8 Texte SEO et 2 Produits e-commerce.
- Preuves avant : neuf frames et 45 crops dans `proofs/before/manifest.json`.
- Écriture interdite sur les nodes de pages : seules les définitions de
  composants listées ci-dessus peuvent être modifiées par l'unique writer.

## Mutation proposée

### 1. Master SectionHeader (`2090:2397`)

1. Conserver la propriété texte riche `Titre` et la propriété texte `Accroche`.
2. Renommer la propriété booléenne `Accroche2` en `Afficher accroche` sans
   inversion de valeur.
3. Remplacer les axes de variantes `Disposition` et `Emphase` par le seul axe
   `Alignement=Centre|Gauche` ; aucune variante CTA, Hero, Moyen ou Compact ne
   doit rester exposée.
4. Rendre les deux variantes avec un titre sombre 40/50 et le même espacement
   d'accroche ; `Centre` est la valeur par défaut.
5. Supprimer le CTA de l'anatomie générique. Ne pas créer d'alias caché pour les
   axes retirés.

### 2. Masters spécialisés

| Master | Opération | Faits à préserver |
| --- | --- | --- |
| Hero `2111:3382` | Remplacer l'instance SectionHeader par son titre direct et exposer `Titre` en TEXT. | gauche, blanc, 54/68, poids parent 300 et plages fortes en bold ; CTA Hero inchangé. |
| Présentation `2103:2824` | Remplacer l'instance par le titre direct et exposer `Titre` en TEXT. | gauche, sombre, 32/40 ; contenu et CTA propres à la section inchangés. |
| Texte SEO `2108:3123` | Remplacer l'instance par le titre direct et exposer `Titre` en TEXT. | gauche, sombre, 24/30 ; paragraphes et accordéon inchangés. |
| Produits `2116:4475` | Déplacer le titre et CTA dans l'anatomie directe et exposer `Titre` en TEXT. | gauche, sombre, 32/40, sans accroche ; ProductCards et contrôles de carrousel inchangés. |

### 3. Réconciliation des instances de pages

- `section-header-v3-02,03,04,08,09,12,13,16,17,18,19,25,26,27,28,31,32,33,34,38,39,42,44,45` : conserver le lien SectionHeader, mapper `accroche2` vers `Afficher accroche`, conserver `Alignement` et la totalité du contenu/plages riches.
- `section-header-v3-01,06,11,15,21,24,30,36` : raccorder au titre direct Hero ; conserver les 54/68 et le CTA du Hero.
- `section-header-v3-07,37,41` : raccorder au titre direct Présentation ; conserver 32/40.
- `section-header-v3-05,10,14,20,23,29,35,40` : raccorder au titre direct Texte SEO ; conserver 24/30.
- `section-header-v3-22,43` : raccorder au titre direct Produits. C'est le seul delta autorisé : titre 32/40 à gauche, sans accroche, CTA détenu par Produits (`product-intermediate-left-no-eyebrow-cta`).

## Garde-fous d'exécution

1. Rechercher à nouveau les cinq composants dans Figma au début de la session ;
   les IDs d'une session antérieure ne sont jamais réutilisés sans recherche.
2. Relever le numéro de version Figma et refuser tout décalage avec le checkpoint
   ci-dessus jusqu'à un nouveau snapshot et une nouvelle revue.
3. Écrire les cinq masters, puis laisser Figma propager les instances ; aucune
   sélection/copie manuelle dans une page.
4. Capturer les cinq masters, les 45 usages et les neuf frames après écriture.
5. Exiger l'identité des 43 routes non-Produits et n'accepter que le delta
   Produits ci-dessus ; une capture vide ou de taille différente est un échec.
6. Créer `owner-go.json` avant le premier appel mutant, puis le premier reçu live
   immédiatement après. La seconde application doit être un no-op prouvé.

## GO demandé

Le GO attendu est : **« GO Figma SectionHeader v3 selon
`figma-change-proposal.md` »**. Il autorise uniquement les cinq masters et la
réconciliation induite de leurs instances ; il n'autorise aucune modification
de copy, média, navigation, page, token ou composant tiers.
