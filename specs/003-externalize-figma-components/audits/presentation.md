# Audit — Section Présentation (T071)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — re-mesure live par nom **puis vérification structurelle
par position** (jamais par confiance dans le nom seul, leçon Gallery-item/Réalisations), scan des 9
maquettes.

## Correction du compte annoncé — 3 occurrences réelles, pas 5

`tasks.md` annonçait 5 pages. La re-mesure live (`findAll(n => n.name === 'Présentation')` sur les 9
maquettes) donne **3 occurrences réelles** :

| Maquette | nodeId (avant) | Taille |
|---|---|---|
| À Propos | `263:2104` | 1287×96 |
| Portes de garage | `226:150` | 1287×96 |
| Accueil | `210:364` | 1287×230 |

Les 2 autres endroits portant le nom « Présentation » (`387:788` sur **Portes de garage
industrielles**, `370:2765` sur **Portes de garage résidentielles**) sont le **titre interne de la
section Réalisations** sur ces pages — même collision de nom que celle déjà documentée pour
`gallery-item`. Vérifié par structure, pas par nom : les deux vivent sous un ancêtre `Réalisations`
(`387:787` / `230:614`), leurs enfants sont un texte de titre différent (« Nos réalisations
industrielles et installations de qualité » / « Quelques réalisations et installations de qualité »)
+ un wrapper nommé différemment (`wrapper` vs `text`) — **hors périmètre, non touchés**, confirmés
intacts après l'adoption (même `nodeId`, même type `FRAME`, cf. § Preuve).

Zéro occurrence sur Contactez-nous, Dépannage/SAV, Portes d'entrée, Motorisation — confirmé au scan,
pas supposé.

## Structure réelle (FRAME propre, pas de GROUP)

Les 3 occurrences partagent une structure strictement identique :

```
Présentation (FRAME, HORIZONTAL auto-layout, HUG×HUG, itemSpacing 32, fills/strokes/effects vides)
├── [Titre] (TEXT, largeur FIXE 628px, textAutoResize HEIGHT — hauteur suit le contenu)
└── wrapper (FRAME, VERTICAL auto-layout, largeur FIXE 627px, HUG hauteur, itemSpacing 16,
    fills/strokes/effects vides — wrapper de pure disposition, même famille que `row`/`tabs`/
    `accordion` déjà traités cette spec)
    ├── [Texte] (TEXT, largeur FIXE 627px, textAutoResize HEIGHT)
    └── Bouton (INSTANCE, optionnelle — voir § CTA)
```

`Présentation` est déjà une `FRAME` (pas un `GROUP`) sur les 3 occurrences — aucun nettoyage
structurel séparé requis, cf. `CLAUDE.md`. Confirmé : la largeur du Titre (628px) et du wrapper
(627px) est **fixe et identique sur les 3** — aucune variante de taille n'est nécessaire, la
hauteur de la frame racine (96 / 96 / 230) est un pur effet du contenu (auto-layout HUG), pas un
réglage manuel. Ceci confirme le a priori du brief (« pas de variante de taille attendue »).

## Trouvaille — le CTA n'est pas un simple "toujours présent", c'est une vraie variance mesurée

Le brief anticipait une instance Bouton « existante ». La mesure par position montre une réalité
plus fine, sur les 3 occurrences réelles :

| Maquette | Bouton dans l'arbre ? | `.visible` |
|---|---|---|
| À Propos | oui (`263:2108`) | **`false`** |
| Portes de garage | **absent** (`wrapper` n'a qu'1 enfant) | n/a |
| Accueil | oui (`210:368`) | **`true`** |

Seule **Accueil** rend réellement le CTA « En savoir plus ». À Propos a le calque mais masqué
(même famille que le CTA Product-card jamais rendu, T047) ; Portes de garage n'a même pas le
calque. Vérifié `.visible` explicitement dès l'audit (leçon Product-card appliquée d'emblée, pas
redécouverte après un gros diff).

**Traitement retenu** : propriété **BOOLEAN officielle `Bouton`** sur le master (et non un hack de
visibilité caché ou une variante de taille) — cohérent avec le principe `CLAUDE.md` « affordances
non officielles rendues officielles » et avec le vocabulaire déjà établi dans ce fichier
(`Icône gauche`/`Icône droite` sur Bouton lui-même, `Optionnel` sur Field). **Défaut `false`**
(majorité mesurée : 2/3 occurrences masquées), cohérent avec la convention « majorité = défaut »
déjà utilisée cette spec (Field/État, Section-header/Disposition). Résolu par construction
directement — pattern entièrement précédenté (BOOLEAN de visibilité + majorité par défaut), aucune
décision de contenu/design à arbitrer.

## Texte riche — gras par plage sur les 3 occurrences, jamais un style uniforme

Titre ET Texte portent des spans **Bold** mesurés par `getStyledTextSegments` (jamais supposé
uniforme malgré `fontName` rapportant `MIXED` sur la plage complète) :

- **À Propos / Titre** : `"Piqueray, "` **Bold** + `"une histoire de famille "` Regular
- **À Propos / Texte** : 4 segments Bold dispersés (`"Depuis plus de 50 ans,"`,
  `"proximité et d'excellence technique"`, `"Hörmann"`, `"la souplesse d'une PME locale"`)
- **Portes de garage / Titre** : `"L'excellence allemande "` Regular + `"chez Piqueray"` **Bold**
- **Portes de garage / Texte** : 3 segments Bold (`"Depuis plus de 50 ans,"`,
  `"une longévité exceptionnelle"`, `"des systèmes anti-effraction certifiés"`)
- **Accueil / Titre** : `"Piqueray, votre distributeur de portes Hörmann "` Regular +
  `"en Province de Liège"` **Bold**
- **Accueil / Texte** : 4 segments Bold (`"Depuis plus de 50 ans,"`, `"Hörmann"` (voir § hyperlink),
  `"région verviétoise"`, `"Piqueray vous accompagne de A à Z"`)

Couleurs déjà bindées sur les 3 (zéro brut) : Titre → `color/noir-bleute` (`VariableID:5:40`),
Texte → `color/noir` (`VariableID:24:52`) — identiques sur les 3 occurrences, vérifié.

**Piège anticipé, pas re-découvert** (leçon Formulaire T092 appliquée d'emblée) : lier `Titre`/
`Texte` comme propriétés TEXTE officielles (`componentPropertyReferences`) **aplatit le style mixte
du master lui-même** — confirmé en comparant les plages avant/après liaison sur le master
(`titleFlattened: true`, `bodyFlattened: true`). Réappliqué immédiatement via `setRangeFontName`
sur les plages exactes mesurées AVANT liaison, sur le master d'abord (revérifié identique
avant/après fix), puis sur **chaque instance** après chaque `setProperties()` (le même aplatissement
se reproduit à chaque override d'instance, pas seulement sur le master — leçon déjà nommée
Formulaire, confirmée ici sur un 2e cas).

## Trouvaille — un vrai hyperlink légitime (pas un résidu de template, contrairement à Formulaire)

Le mot **« Hörmann »** dans le Texte d'Accueil (position 70-77) porte un hyperlink réel :
`https://www.hormann.be/`, **souligné**, en gras. Vérifié via `getStyledTextSegments`, pas supposé
depuis le rendu visuel. **Contrairement au lien `jonckers-clabots.be` trouvé dans Formulaire**, ce
lien est légitime : Hörmann est la marque partenaire officielle de Piqueray, citée et confirmée
dans plusieurs autres blocs déjà adoptés cette spec (Formulaire, Section-header, etc. — « Dépositaire
officiel Hörmann »). Reproduit fidèlement sur l'instance Accueil (`setRangeTextDecoration` +
`setRangeHyperlink` sur la plage exacte, après binding — même geste que Formulaire mais ici sans
ambiguïté de contenu à signaler à l'owner, puisque le lien est correct).

Absent sur les 2 autres occurrences (À Propos, Portes de garage) — confirmé, pas supposé.

## Récapitulatif du master

| Élément | Détail |
|---|---|
| Nom | `Présentation` (nom réel du layer, cloné depuis À Propos) |
| Type | `COMPONENT` (pas de variante — structure 100% identique sur les 3, seul le contenu et la visibilité du CTA diffèrent, portés par des propriétés) |
| Propriétés | `Titre` (TEXTE, défaut = contenu À Propos), `Texte` (TEXTE, défaut = contenu À Propos), `Bouton` (BOOLEAN, défaut `false`) |
| Structure | `Présentation` (HORIZONTAL, HUG×HUG) → `Titre` (628px fixe) + `wrapper` (VERTICAL, 627px fixe) → `Texte` + `Bouton` (instance baked du Bouton existant, `Property 1=Link`, zéro dépendance tierce, `remote:false` vérifié) |
| Page | `DS · Molécules`, nouvelle section blanche `Présentation` (0, 6230), marge interne 40/60/40/40 (même convention que les 14 sections existantes, mesurée sur `Devis`) |
| nodeId | `COMPONENT` `2103:2824` ; section `2103:2823` ; `Titre#2103:53` / `Texte#2103:54` / `Bouton#2103:55` |
| Zéro dépendance tierce | confirmé — Bouton `getMainComponentAsync().remote === false` |

**Construction** : clone de À Propos (`263:2104`, choisi comme base — structure initialement
scopée sur cette occurrence, et son Bouton `visible:false` correspond directement au défaut
`Bouton=false` retenu pour le master ; **correction** : À Propos n'est pas la seule occurrence
dont le Bouton existe dans l'arbre — Accueil l'a aussi, visible celle-là — seule Portes de garage
en est totalement dépourvue, cf. tableau ci-dessus) → reparenté dans une section neuve sur
`DS · Molécules` → `figma.createComponentFromNode()` → 3 propriétés ajoutées et liées → styles
riches réappliqués (voir § piège ci-dessus) → description non vide (signale la règle du gras par
plage et l'origine du booléen Bouton) → **test bout en bout** : instance de test avec les 3
propriétés poussées à leur valeur non-défaut (Titre/Texte custom + Bouton=true), capture de
vérification, instance supprimée après (précédent Field).

**Placement sans coordonnée manuelle** : sur les 3 maquettes, `Présentation` est un enfant direct
(jamais nested dans un `GROUP`) de la frame top-level, elle-même en auto-layout `VERTICAL`
(`itemSpacing` 128) — toujours à l'index 1 (juste après `Hero`/`Hero et catégories`). L'adoption
utilise donc systématiquement `parent.insertChild(index, instance)` au même index que l'ancien
frame, jamais un `.x`/`.y` direct (qui serait silencieusement ignoré sous un parent auto-layout —
piège déjà nommé cette spec). Les tailles finales (1287×96 / 1287×96 / 1287×230) confirment que
l'instance occupe exactement la même place que l'original, sans aucun réglage de position manuel.

## À Propos — le master n'a pas d'override à l'adoption (contenu = défaut par construction)

À Propos étant la source du contenu par défaut du master, son instance adoptée ne nécessite **aucun**
`setProperties()` — elle affiche déjà le bon Titre/Texte/Bouton sans rien pousser. Même convention
que Devis-cta (7/8 occurrences au texte par défaut n'ont pas d'entrée ledger dédiée) : **0 entrée
ledger pour À Propos**, ce n'est pas une omission — documenté ici explicitement.

## Preuve — 3/3 adoptées, structure vérifiée, écarts pixel dans l'enveloppe déjà acceptée

**Structure** : 0 copie brute restante sur les 3 occurrences réelles (scan post-remplacement), les 2
décoys Réalisations intacts (même nodeId, même type `FRAME`, non touchés). Les 3 instances résolvent
au nouveau master, tailles strictement identiques aux frames sources (1287×96 / 1287×96 / 1287×230).
Grille d'audit texte complète re-vérifiée post-adoption sur les 6 nœuds texte (fontSize, lineHeight,
letterSpacing, textCase, align H/V, paragraphSpacing, fills/bindings, effects) : **zéro écart**
trouvé nulle part face aux valeurs mesurées avant remplacement.

**Pixel** (`npm run pages:compare`, 9 maquettes) : **5/9 identical, 3/9 diff sur les pages réelles**
(Accueil, Portes de garage, À Propos), mesurés en % de la page (jamais accepté sur un compte brut
seul) :

| Maquette | diffCount | % de la page |
|---|---|---|
| Accueil | 13 | 0.000138% |
| À Propos | 2439 | 0.0238% |
| Portes de garage | 3543 | 0.0469% |

Portes de garage est le plus élevé des 3 mais reste **sous le maximum déjà accepté** cette
session (Accordion-row, 0.050%) ; les 3 sont dans la même famille de bruit sub-pixel déjà nommée
pour Devis-cta/Accordion-row/Carte/Formulaire — voir `decisions.md` pour l'acceptation détaillée. Un
**4e diff, sur Contactez-nous, est hors périmètre de cet incrément** : cette page n'a jamais été
touchée (0 occurrence de Présentation, confirmé au scan avant ET après) ; investigation a tracé
l'écart à une construction concurrente en cours sur cette même page par un autre agent pendant la
fenêtre de capture (section « Coordonnées », nodeIds `2104:2882-2887`/`2105:2968`, dans la même
plage d'allocation temporelle que mes propres nodeIds) — détail complet dans `decisions.md` et
`proofs/presentation/README.md`.

**Preuve** : `proofs/presentation/{verdict.json,verdict.md,crops/}` ; `ledger/presentation.json` (5
entrées, `pages:ledger:check` exit 0).
