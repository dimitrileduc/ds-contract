# Interface Contract — Non-Destructive Figma Transition

Ce contrat est la porte mécanique de H3. La capacité générique ajoutée au runner
par 028 doit le satisfaire avant toute mutation du master live.

## Preconditions

- H1 et H2 sont approuvés et liés.
- La version Figma est fraîche et repinnée.
- Le CTA Home et tous les enfants sont inventoriés read-only, non bloquants et absents
  des opérations.
- Les fixtures négatives, evals ciblés et suite complète de la capacité runner sont
  verts.
- Le `MechanismSpike` est `pass` hors source autoritative.
- Les captures master, Home et Home+Header sont complètes, non vides et correctement
  dimensionnées.
- Le dry-run déclare toutes les créations et modifications attendues.
- `pageWrites=[]`.

## Required topology

```text
Container · HeroVideo
└── Component set HeroVideo
    ├── Presentation=Compact
    ├── Presentation=Desktop
    └── Presentation=Wide  ← historical component node/key preserved
```

L'ordre visuel dans le set peut suivre la proposition H2, mais le membre Wide doit
rester le composant historique exploitable. Le set reçoit une identité additive.

## Protected invariants

- node id et key du membre Wide;
- lien de l'instance Home et tous ses overrides;
- propriété Accroche, contenus et noms/rôles communs;
- poster propriétaire, crop/FILL et deux voiles;
- Text Style et métriques Wide;
- Button master/variant/typographie/padding/icônes/largeur intrinsèque;
- Container local unique et absence de doublon de démonstration;
- Page et Header inchangés.

## Expected changes

Le premier passage peut uniquement:

- créer l'identité additive du component set;
- créer les membres Compact et Desktop approuvés;
- reparenting non destructif du membre Wide;
- appliquer les layouts, bindings et overrides typographiques exacts de H2;
- poser les métadonnées de dette et de présentation approuvées.

Chaque création apparaît dans `createdNodeIds` avec son rôle; chaque mutation apparaît
dans `changedNodeIds`. Les cacher derrière un reçu vide est un échec.

## Required scenario support

Le mécanisme sélectionne explicitement la composition de chaque scénario et vérifie
ses descendants visibles. Il ne se contente pas de redimensionner un seul root actif.
L'overflow, un ancestor clipping, un binding détaché ou un contenu inaccessible est
un gate rouge.

## Refusal conditions

- identité Wide, Home link ou overrides non prouvés;
- création non déclarée;
- Page write ou mutation d'une dépendance partagée;
- absence de primitive compatible;
- besoin de modifier le Button, le Header, le poster ou le crop;
- capacité runner encore incapable de représenter set + membre Wide;
- deuxième passage non no-op.

Un refus maintient H3 bloqué et retourne aux tâches runner de 028 ou devant l'owner.
Il ne permet jamais une reconstruction locale.
