# Prépa — les 2 specs suivantes

**Intention de ce document** : poser le périmètre et les décisions à trancher, pas les gestes.
Aucun « comment » ici — l'ordre exact des opérations appartient à `/speckit.plan` de chaque spec.

## D'où viennent les chiffres

Relevé du **2026-07-26**, en **lecture seule** (aucune écriture canvas) : les 55 masters du
fichier live dumpés via le pont, passés à `npm run extract:figma`. Résultat brut :
**55 contrats proposés, 55/55 valides pour le schéma, 704 notes réparties en 196 classes.**

Reproductible : banker `extract/figma/dump.plugin.js` avec `TARGET_SETS = []`, le servir au
sandbox via `capture-receiver.mjs`, POSTer le dump, puis `npm run extract:figma -- <dump>`.
Le relevé n'est pas committé (300 KB, reproductible en 2 minutes).

**Ce que ce relevé prouve** : la machinerie d'extraction n'est pas le facteur limitant. Elle avale
les organisms, détecte 75 références de composition et 9 collections répétées sans être guidée.
Ce qui bloque est **entièrement du côté de la source**.

## La règle qui fixe l'ordre

Le coût d'inversion n'est pas le même selon le chantier — c'est lui qui décide de l'ordre,
pas une préférence :

| Chantier | Fait après l'adoption d'un contrat | Verdict |
|---|---|---|
| Renommer un master, une prop, une valeur de variant | **bump majeur** par composant touché (un nom devient un identifiant généré) | doit passer **avant** |
| Valeur non tokenisée | le code généré ne porte pas la valeur → **le diff pixel ne peut pas être vert** | doit passer **avant** |
| Exposer une prop sur un master | **bump mineur** (prop ajoutée) | peut glisser, par vagues |

Précédent qui chiffre la règle : le Bouton. **Une seule** valeur mal orthographiée
(« Outilne noir ») coûte déjà un bump majeur à elle seule.

---

# SPEC 1 — Canvas : rendre la source extractible

**Intention.** Le fichier Figma est propre *pour un humain* depuis la 005. Il ne l'est pas encore
*pour un extracteur* : les noms ne sont pas des identifiants et les valeurs ne sont pas des tokens.
Cette spec ferme cet écart, et rien d'autre. Elle ne génère aucun code et ne touche pas au dépôt.

**Condition de sortie** : un nouveau relevé identique au précédent doit sortir **zéro** note de
classe « identifiant » et « valeur sans token » — mesuré, pas jugé.

## Chantier 1.1 — Les identifiants (80 cas)

| Classe | Cas | Ce que ça produit aujourd'hui |
|---|---|---|
| Nom de set qui n'est pas un nom de composant | **36** | nom de contrat inventé par l'extracteur |
| Nom de set avec caractères qu'un id ne peut pas porter | **12** | `Étoile` → `toile`, `Équipe` → `quipe`, `Hero vidéo` → `HeroVidO` |
| Nom de propriété hors identifiant légal | **10** | `État` → `tat`, `Libellé` → `libell` |
| Deux parts d'un même contrat avec le même nom | **22** | collision — les noms de parts sont uniques par contrat |

**Le fait à trancher** : les accents. Le nommage français est une décision owner assumée
(cohérence avec Checkbox, spec 003). Ce relevé montre qu'un identifiant de code ne les porte pas.
Trois issues possibles — nom d'affichage accentué + nom technique sans accent, renommage sans
accent, ou acceptation de la translittération automatique. **À décider, pas à supposer.**

Second fait : plusieurs calques sont nommés d'après leur contenu (des phrases entières
deviennent des clés d'anatomie). Même classe de problème, même décision.

## Chantier 1.2 — Les valeurs sans token (234 cas)

C'est le plus gros poste, et il n'était pas anticipé.

| Canal | Cas sans token | Dont sans même un token proche |
|---|---|---|
| `itemSpacing` (espacement auto-layout) | **58** | — |
| `fontWeight` | **48** | — |
| `lineHeight` | **46** | — |
| `padding` | **22** | — |
| `strokeWeight` | 9 | — |
| `fontSize` | 5 | — |
| `cornerRadius` | 3 | — |
| `opacity`, `minHeight` | 2 | — |
| **Total « no token invented »** | **193** | **60** |
| Style de texte non dérivé d'un token | **41** | — |

L'extracteur n'invente jamais : il note la valeur et propose les tokens les plus proches.
Conséquence concrète : ces valeurs **n'entrent pas dans le contrat**, donc le code généré ne les
porte pas, donc le composant est visuellement faux, donc **le diff pixel ne peut pas passer**.

**Le fait nouveau à porter à l'owner** : les tokens d'espacement (space/radius) ont été
**déclinés en spec 003**, et la note de suivi dit « ne pas re-proposer sans fait nouveau ».
Les 58 `itemSpacing` + 22 `padding` non tokenisés qui bloquent l'extraction **sont** ce fait
nouveau. La décision est rouverte sur cette base, pas sur une préférence.

## Chantier 1.3 — La structure (backlog déjà écrit)

`BACKLOG-SPEC-006-figma-styles-structure.md` (racine) tient toujours : Section-header FIXED → FILL
et sa cascade, 11 GROUPs à dé-grouper, styles sous seuil, Nav-item. **Rien à réécrire** — ce
document est le contenu de ce chantier. Les items 1 et 6 de son parent (`RAPPORT-CLOTURE.md`
de 005) sont en revanche **déjà faits** au cycle 14 : le rapport ne le dit pas encore.

## Hors périmètre de la Spec 1

- Exposer les props sur les masters → coût mineur, glisse en Spec 2
- Tout changement de design (règle 005 reconduite)
- Toute écriture dans le dépôt

---

# SPEC 2 — Repo : design-to-code

**Intention.** Transformer les 55 masters en contrats gouvernés et en code généré, chaque
composant prouvé par le differ et par le pixel. C'est le document
`specs/003-externalize-figma-components/BACKLOG-SPEC-B-design-to-code.md`, jamais ouvert,
augmenté de ce que le relevé a révélé.

**Condition de sortie — 3 compteurs, tous verts :**

1. **55/55 contrats adoptés** (aujourd'hui : **5**, tous des atomes)
2. **diff pixel vert pour chaque composant photographiable**, les exclusions nommées une par une
   (précédent 004 : Input/Textarea/Select exclus car fluides ; `<select>` natif ne rend pas son
   texte en headless)
3. **0 écart au differ** sur les trois axes (contrat ↔ code ↔ Figma ↔ tokens)

## Chantier 2.1 — Ce que le document B portait déjà

| | Intention | Mesure du relevé |
|---|---|---|
| B1 | Le schéma doit savoir porter du gras au milieu d'une phrase | 6 textes concernés (005), aujourd'hui impossible : `type:'text'` est plat et les émetteurs échappent le contenu |
| B2 | Le contrat Bouton doit redevenir vrai vis-à-vis de sa source | bump **majeur** — la source a été corrigée en 005, le contrat non |
| B3 | Décider composant par composant ce qui est pilotable depuis le site | **24 composants à zéro prop**, 56 props pour 55 composants |
| B4 | Extraire les masters en contrats | 55 proposés, 55 valides — la chaîne est prête |

Sur B3, la cible Odoo inverse le défaut (éditable par défaut, figé = exception) : cette règle est
déjà écrite dans le document B et tient.

## Chantier 2.2 — Ce que le relevé ajoute

| Classe | Cas | Intention |
|---|---|---|
| Balise HTML / rôle ARIA absents de la source | **55** | rien de tout ça ne se dessine dans Figma. C'est **55 décisions humaines**, une par composant — pas une inférence à laisser tourner |
| Instance imbriquée sans contrat connu | **46** | conséquence directe de l'ordre d'adoption (atomes → molécules → organisms) : disparaît en avançant dans le bon ordre |
| Props d'instance non mappables ou non capturées | **55** | à arbitrer : porter dans le contrat parent, ou nommer la limite |
| Layout qui change selon un axe de variant | 5 | le vocabulaire existe (`layoutByProp`) — à confirmer sur chaque cas |
| Typo qui varie selon les variants | 5 | aucun style de texte unique ne peut la porter — décision par cas |
| Visibilité liée à un booléen | 6 | devient une prop booléenne, à valider |

## Ce qui peut glisser dans la Spec 2

Les props exposées sur les masters (chantier écarté de la Spec 1) : ajouter une prop est un bump
**mineur**, donc l'adoption d'un contrat n'a pas à l'attendre. Un composant peut être adopté figé
puis gagner ses props en vague suivante. **C'est un choix de rythme, pas une contrainte.**

---

# Ce qui n'est dans aucune des deux specs

- **Les pages.** L'assemblage des sections n'est pas un composant : ni le differ ni le pixel ne le
  couvrent, avant comme après. Les 3 compteurs peuvent être verts avec une page cassée.
- **Le responsive.** Aucun vocabulaire dans le schéma, `@media` / `@container` sont classés
  « code seulement » dans `docs/FIGMA-CAPABILITY-MATRIX.md`. Si le mobile entre un jour, il entre
  par les modes de variables (valeurs) — sujet distinct, à ne pas mélanger ici.
- **Le bloc Google reviews** de la branche `006-google-reviews-block` : ne correspond ni à l'une
  ni à l'autre, et son worktree est **16 commits en retard** (base = merge de la 003, sans la 005).

# À régler avant de lancer quoi que ce soit

1. `RAPPORT-CLOTURE.md` de 005 est périmé d'un cycle : il annonce 13 cycles au lieu de 14, donne
   encore les divergences 5 et 6 pour ouvertes alors que le cycle 14 les a closes, et ne porte ni
   le verdict 5/9 ni les 4 résidus sub-pixel (PdE 17 / PdG 20 / AP 99 / CN 469 px).
2. Les 4 résidus sub-pixel attendent une confirmation owner.
3. Les 4 divergences restantes de 005 (Bouton, `octicon:chevron-down-12`, Checkbox sans usage,
   Étoile/mail/external-link sans usage) sont léguées à la Spec 2 mais ne figurent pas dans son
   document.
4. Le token REST est absent de l'environnement : toute extraction passe par le pont desktop.
5. La numérotation « 006 » est prise par une branche qui ne traite ni la Spec 1 ni la Spec 2.
