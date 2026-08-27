# Interface Contract — Mutation non destructive d'un set existant (029)

Ce contrat interne définit ce que la capacité runner doit prouver AVANT toute
écriture live, et ce qu'elle doit refuser durablement. Il adapte
`028/contracts/non-destructive-transition.md` au cas « set déjà formé + carte
exclusive » — l'écart est consigné dans le registre écarts-028.

## Preserved facts (les deux campagnes)

| Fact | Contract |
| --- | --- |
| Identité du set | `setNodeId` et key inchangés; aucun re-parentage destructif |
| Membres ×4 | node id + key de chaque combinaison Style×Colonnes inchangés |
| Axes | Noms `Style`/`Colonnes` et valeurs `{Superpose,Empile}×{2,3}` préservés; tout ajout est une création déclarée et justifiée |
| Carte | `cardNodeId` + key inchangés; 2 variantes Style atteignables |
| Usages ×7 | `mainComponentId`, liens d'instance et overrides préservés |
| Calques | Noms et rôles communs aux variantes cohérents (contenus/overrides survivent au changement d'état) |
| Médias / textes | Paints IMAGE, copy et rôles inchangés sauf acceptation owner |
| Pages | Aucun nœud de Page écrit, jamais |

## Propagation contract (campagne section)

Le SEUL canal légitime de changement des instances de carte est la propagation
master→instances de Figma. Le plan déclare `expectedPropagatedDeltas`; le verify
classe chaque delta observé comme « propagé attendu et attribué » ou échec. Toute
écriture directe d'une instance de carte, d'un enfant partagé ou d'une Page est
refusée avant émission Bridge.

## Ordering contract

Carte d'abord, section ensuite. Les captures before de TOUTES les surfaces —
2 masters (par variante) et 7 usages — sont prises et vérifiées non vides et
correctement dimensionnées AVANT la première écriture du premier run (§X). Un seul
writer, un seul cycle global de vérification pixel (§XI), possédé par
l'orchestrateur.

## Required proofs before H3

1. Fixtures négatives rouges puis evals verts, ids stables, pour: topologie de set
   existant mal identifiée, création non déclarée, mauvaise paire Style×Colonnes
   sélectionnée en scénario, binding détaché, écriture de Page, écriture d'enfant
   (y compris instance de carte côté section), second passage non no-op.
2. Spike hors source autoritative: identités ×4 + carte + liens usages préservés,
   propagation attribuée, créations honnêtes (possiblement zéro), second passage
   strictement no-op.
3. Aucun id ni nom `CategoriesPrincipales`/`Carte/Categorie` codé dans le runner.

## Stable refusal diagnostics

| Classe de défaut | Diagnostic |
| --- | --- |
| Capacité ad hoc au composant | `responsive-capability-not-generic` |
| Mécanisme/champ hors allowlist | `responsive-operation-not-allowlisted` |
| Création non déclarée | `unexpected-created-node` |
| Mauvaise combinaison active en scénario | `presentation-not-selected` |
| Binding absent/détaché | `primitive-binding-detached` |
| Champ typographique non autorisé | `typography-field-not-allowlisted` |
| Écriture Page | `page-write-forbidden` |
| Écriture enfant (Bouton, icône, instance de carte côté section) | `shared-child-write-forbidden` |
| Second passage crée ou modifie | `second-pass-not-noop` |

Un reçu qui normaliserait une création cachée vers une liste vide est un défaut de
la plus haute sévérité (Principe V).
