# Mode d'emploi — rendre une section responsive et gouvernée

**Statut** : éprouvé sur `HeroVideo` (2026-09-01). À valider sur une 2ᵉ section avant
généralisation. Ce document est vivant : chaque section traitée le met à jour.

**Origine** : session du 2026-09-01, premier passage complet sur le hero. Chaque règle
ci-dessous a été payée par un incident réel de cette session — aucune n'est théorique.

---

## Le pipeline (l'ordre qui ne change pas)

```
planche de validation  →  validation owner  →  substitution progressive
dans les vues responsive  →  pivot final vers le DS et tokens/
```

- On ne touche **jamais** le master DS ni le dépôt avant la fin de la vague.
- Odoo vient après — media queries CSS sur un DOM unique, déjà instruit
  (un bloc posé est du HTML figé ; layout différent = tout rendre + masquer ;
  jamais de re-parentage entre largeurs).

## Ce qui est déjà construit (réutiliser, ne pas recréer)

| Acquis | Détail |
|---|---|
| Collection **`Responsive`** | 4 modes : Mobile · Tablette · Desktop · Wide |
| Style **`H1`** | lié à `typography/h1/size` (32·32·40·54) + `line-height` (40·40·50·68) |
| Style **`Libellé bouton`** | taille liée à `typography/button/size` (16·16·16·18) — un seul bind sur le style, tous les boutons du fichier suivent |
| `space/56` | minté (padding horizontal hero Desktop) |
| Pad Typographie | ligne `typo-H1` en 4 démos réelles portant chacune leur mode, légendes, marquage « 031 provisoire », compte 18 → 19 styles |
| Set **`HeroVideo`** | 4 variantes, prop `Presentation`, structure plate (Background / Voiles / Text / Bouton en enfants directs) |

Pour une nouvelle section : le mécanisme existe. Ajouter seulement les **variables du
rôle** manquantes (ex. `typography/h2/size` = 24·24·32·40 — l'échelle validée descend
d'un cran par niveau et par étage), puis lier.

## Les règles Figma (chacune a coûté un incident)

1. **Ne JAMAIS toucher le menu `Presentation` sur une variante du set.** Sur une
   variante, ce menu **renomme** au lieu de basculer → doublon de nom → set entier en
   état d'erreur (« properties and values conflicting ») → la valeur disparaît du
   sélecteur. Le test se fait **toujours sur une instance**. C'est l'incident le plus
   cher de la session.
2. **Le mode voyage avec le composant.** Posé une fois par variante du set, il suit
   l'instance partout (il est même plus fort que le mode du cadre hôte — prouvé par
   test). Rien à poser sur les cadres consommateurs. Sans mode dans la chaîne →
   mode par défaut de la collection (Mobile) : un texte isolé lié à `H1` rend 32,
   c'est normal.
3. **Les breakpoints natifs des styles de texte sont hors API** (ni écrivables ni
   lisibles par script) → inutilisables pour la chaîne générée. Notre voie — style
   lié à des variables à modes — est la méthode documentée par Figma. Défaut connu :
   la liaison est **invisible dans « Edit style »** (le panneau affiche la valeur
   résolue au mode par défaut). Compensation obligatoire : la **description du
   style** porte la table des valeurs.
4. **Remplacer un nœud dans un auto-layout exige de répliquer TOUT** :
   `layoutPositioning` (+ x/y si ABSOLUTE), `layoutAlign`, `layoutGrow`, sizing
   horizontal **et** vertical. La largeur seule ne suffit pas — un enfant absolu
   lâché dans le flux repousse toute la mise en page. (A cassé le layout deux fois.)
5. **`combineAsVariants`** : noms `Presentation=X` posés **avant** de combiner ;
   détacher les instances d'abord ; **aplatir** le wrapper hérité des planches
   (la variante reprend le layout du wrapper, les enfants remontent, absolus
   préservés) ; puis **refixer les tailles en FIXED** (`primaryAxisSizingMode` +
   `resize`) — sinon le hug recalcule tout. Après aplatissement, redonner aux plans
   absolus (Background, voiles) la boîte entière.
6. **Un revert Figma emporte tout ce qui est postérieur au point choisi** — il a
   tué le set une fois, et aurait pu tuer la collection (donc casser les liaisons de
   styles dans tout le fichier). Règles : owner **signale avant de restaurer** ;
   agent pose une **version nommée avant chaque bloc de mutation** pour des points
   de retour fins.
7. **Le bandeau d'erreur de l'UI peut survivre à la réparation** des données —
   désélectionner puis resélectionner avant de conclure que c'est encore cassé.
8. **Les dégradés ne sont pas liables à une variable** (pas de type « dégradé » ;
   lier arrêt par arrêt est absurde à 9-16 arrêts). Porté comme **littéral gouverné**
   via le canal `background-image` (spec 015) — se propage par régénération. Nommé,
   pas bloquant.

## Les règles de méthode

1. **Le design des planches est validé — on ne redessine jamais.** Le rôle de la
   passe : rendre propre, pas rendre joli. Aucune « amélioration » au passage.
2. **Minter APRÈS, depuis le relevé.** Les valeurs bougent pendant la validation
   (44→48→54 ; 128→160→192 dans la même journée) — minter avant crée des jetons
   morts. Une seule passe de mint, en fin.
3. **Lier seulement à l'exact.** Style ou jeton lié uniquement si la valeur
   correspond au pixel. Tout écart = décision owner séparée. Jamais de « plus
   proche ».
4. **Une liaison ne change aucun pixel** → la preuve est **structurelle** (relevé
   de données avant/après : compte de nœuds liés, valeurs résolues), jamais une
   capture. La capture prouve le layout, pas la gouvernance. (= écart E2 de 029.)
5. **Ce qui n'appartient pas au composant sort du composant.** Le header n'a rien à
   faire dans le hero (retiré des 3 variantes). Les valeurs d'un autre composant
   (5 et 26 = header) ne se mintent pas avec la section en cours.
6. **Un enfant gouverné est une instance, jamais une copie.** Les CTA détachés sont
   re-liés au master `Bouton` avec leurs surcharges (largeur, visibilité d'icône,
   libellé) — règle Figma n°4 pour la pose.
7. **Une variante d'abord, capture, validation owner, puis les trois autres.**
   C'est ce qui a permis d'attraper le piège de l'absolu sans tout casser.
8. **Tout nouveau style / variable se présente au pad** du DS, au format des lignes
   existantes, marqué **« 031 provisoire »** jusqu'au pivot. Un style responsive se
   présente en **démos répétées portant chacune leur mode** (les vraies tailles se
   voient), jamais en une ligne unique.
9. **Vérifier l'état réel avant d'affirmer.** Chaque réponse de mémoire de la
   session s'est révélée fausse. Un relevé lecture seule coûte 10 secondes.

## Le processus rejouable (section suivante)

1. **Version nommée** (`031 — avant <étape> <section>`)
2. **Cloner les 4 planches validées** côte à côte dans une section
   `031 · <SECTION> — 4 variantes` de la page de validation
3. **Sortir les composants étrangers** (header, etc.)
4. **Audit read-only** : typo / espacements / couleurs bruts vs DS, classification
   des textes (named-exact / rich-ranges / historical-custom / defect), liste des
   mints proposés → **GO owner**
5. **Mints** depuis le relevé + variables responsive du rôle si besoin
6. **Liaisons exactes** + **modes posés** sur les 4 cadres + **enfants gouvernés
   re-liés en instances** (répliquer absolu / x/y / align / grow / sizing)
7. **Capture par variante** → **validation visuelle owner**
8. Noms `Presentation=X` → `combineAsVariants` → **aplatir** → **tailles FIXED** →
   vérifier que `variantGroupProperties` se lit **sans erreur**
9. **Instance de test posée** sous le set → l'owner bascule `Presentation` dessus
10. **Pad mis à jour** + **reçu écrit**
11. **Substituer l'instance du set dans les 4 vues home** de la page de validation
    (mobile 390 · tablette 834 · desktop 1200 · wide 1728) : relevé de la position
    de l'ancienne copie → **composants étrangers (header…) re-parentés en frères**
    (absolu au-dessus, modèle de la home Wide) → remplacement par l'instance avec la
    bonne valeur de `Presentation` → **capture avant/après par vue, à l'identique
    près** → validation owner → section suivante

## Reste ouvert (hero)

- [x] Substituer le set `HeroVideo` dans les vues responsive — **fait le 2026-09-01**,
      preuve à l'octet près sur les 4 vues (PNG avant/après identiques). Méthode :
      export clippé de la zone avant → header re-parenté en frère absolu de la vue →
      instance insérée au même index, sizing répliqué → export clippé après →
      comparaison des octets. L'ancien master DS n'a plus aucun usage vivant.
- [ ] Supprimer l'instance `TEST · instance — changez Presentation ICI` après validation
- [ ] Ancien master DS `HeroVideo` (3 membres) : intact, pivot en fin de vague
- [ ] Pivot `tokens/` : collection `Responsive`, `H1`, `typography/button/size`,
      `space/56` vivent côté Figma, marqués provisoires — à re-créer dans `tokens/`
      au pivot pour que le pipeline les régénère
- [ ] Libellés bruts à 18 des autres sections du Wide (produits, réassurances, avis) :
      à lier au style lors du traitement de leur section
- [ ] `5` et `26` (header) : au nettoyage du header
- [ ] Le CTA Wide : largeur 249 vs 219 expliquée par le 18 — plus d'anomalie

## Leçons de la 2ᵉ section (CarteCategorie, molécule — 2026-09-01)

1. **Variante = état visible dans le set ; mode = état visible en contexte seulement.**
   Un composant à modes ne peut montrer qu'UNE résolution dans son set (le mode par
   défaut). Pour voir les autres rendus : des **témoins en INSTANCES** dans des cadres
   à modes, sous le set — jamais des cadres morts (ils dérivent). Le hero montre ses
   4 étages dans son set parce que ses étages SONT des variantes ; la carte, non.
2. **Un membre de set ne porte JAMAIS de mode explicite** quand l'adaptation doit
   venir du contexte — le mode du master gagne sur celui de l'hôte (prouvé), il
   figerait toutes les instances.
3. **Un style écrase la casse (`textCase`) et l'interlettrage du nœud.** Relever ces
   champs avant de lier ; les porter DANS le style s'ils font partie du rôle
   (Titre carte = UPPER).
4. **Ne jamais re-componentiser un composant** : le clone d'un COMPONENT du DS est
   déjà un COMPONENT — `createComponentFromNode` refuse. Tester `type` d'abord.
5. **Refixer les tailles après `combineAsVariants` ET sur les instances témoins**
   (le hug/auto recalcule) ; re-vérifier les largeurs après toute pose.
6. **Hauteur par étage d'un composant mono-variante** : liaison **par usage** aux
   jetons-valeur (`space/288`, `space/418`) — sur l'instance, posée par la section
   consommatrice. Pas de variable de rôle : c'est le mécanisme des contrats
   (`tokensByProp` → jetons-valeur), vérifié dans `carte-categorie.contract.json`.
7. **Rich text (`figma.mixed`)** : charger les polices segment par segment, ne
   jamais lier un nœud à segments mixtes — signaler, laisser intact.
8. **Déclinaisons non couvertes par les planches** (Empilé, futurs Colonnes=3…) :
   portées telles quelles, typo alignée quand identique, design **non revalidé**,
   marqué — traitées à leur premier usage réel.

## Leçons de la section CategoriesPrincipales (2026-09-01, soir)

1. **YAGNI sur les déclinaisons.** Ne construire QUE ce que les planches validées
   couvrent (ici : Superposé, 4 étages). Empilé et Colonnes : reportés, nommés —
   l'ancien set DS continue de les gouverner jusqu'à leur traitement. Tenter la
   matrice complète en une passe (16 variantes générées) a produit un bordel
   illisible, supprimé.
2. **Porter = cloner la source validée et échanger le minimum** (les cartes),
   jamais régénérer une variante de zéro : chaque régénération réintroduit les
   pièges déjà payés (FILL qui ne se replie pas, hauteurs écrasées, align stretch).
3. **La photo d'une carte est un CONTENU** : au remplacement par une instance,
   copier les fills (racine en Superposé, `categorieImage` en Empilé) et les textes.
4. **Lier la hauteur d'une INSTANCE à une variable ne pilote pas le rendu**
   (l'entrée `boundVariables.height` existe mais Figma l'ignore) : redimensionner ;
   la gouvernance de la valeur vivra dans le contrat (`tokensByProp`).
5. **`layoutAlign: STRETCH` copié écrase une hauteur fixe** — remettre `INHERIT`
   quand on fixe une hauteur.
6. **`Colonnes` de l'ancien set n'est pas un axe de layout** : conteneur identique,
   seule change la quantité de cartes démontrée. À re-modéliser plus tard (le
   nombre de cartes réel est dynamique, prop `cartes` du contrat).
7. **Emboîtement des mécanismes prouvé** : variantes de section à modes explicites
   → les instances de carte (sans mode) héritent et se résolvent seules
   (20/24/24/32). C'est le patron section×molécule de toute la vague.
8. **Le relevé structurel attrape ce que les octets ne localisent pas.** À la
   substitution, comparer l'arbre complet (nom + x,y,w,h de chaque nœud) avant/après :
   diff attendu = vide sauf écarts nommés. C'est lui qui a trouvé la régression
   padding 24→32 du mobile, invisible dans un simple delta d'octets.
9. **Un espacement qui varie par étage se lie DANS le master** à une variable de
   la collection Responsive (`spacing/card-categorie/pad-h` = 24·32·32·32) — les
   liaisons de nœuds internes se résolvent par mode, contrairement à la
   taille d'une instance. Une régression d'étage = une variable, pas quatre retouches.

## Leçons de Presentation + SAV (2026-09-01, soir)

1. **Titre simple vs titre enrichi — deux voies, une règle** : titre à UNE plage →
   style **`H2`** (SemiBold, lié aux variables `typography/h2`) ; titre à plages
   (gras enrichi) → liaison `fontSize`/`lineHeight` **au nœud** (les plages
   survivent — sondé), style interdit (il écrase les plages). Presentation est
   l'exception enrichie ; SAV et la suite prennent `H2`.
2. **L'égalité de deux variables se vérifie mode par mode, jamais de tête** —
   la fusion `card-desc`→`body` a régressé la tablette (18→16) : annulée,
   `card-desc` diffère de `body` en Tablette. Les deux rôles coexistent, raison
   écrite dans la description du style.
3. **Le gras perdu se restaure par la carte des plages** : même texte aux 4 étages
   → lire `getStyledTextSegments` sur l'étage qui a le gras, reporter les index
   par `setRangeFontName`. 7 plages restaurées sur mobile/tablette SAV.
4. **Jamais `figma.currentPage` dans un script de création** — la page se résout
   par NOM (`figma.root.children.find`). La section SAV a atterri sur « Pages »
   parce que l'owner y naviguait.
5. **Rôles typo en place** : `h1` · `h2` (24/24/32/40) · `body` (16/16/18/18) ·
   `card-title` · `card-desc` · `button/size`. Les nouvelles sections consomment,
   ne créent plus — SAV : zéro mint.
6. **Un écart de substitution peut être vertueux** : le CTA Wide 16→18 est la
   décision d'unification qui s'applique via la variable. Un diff n'est pas une
   régression s'il porte une décision — le nommer, pas l'effacer.
7. **Défaut préexistant découvert par la mesure** : icône fantôme (flèche sombre
   sur fond sombre, 20 px actifs) dans le CTA SAV — le texte semblait décentré
   (32/62). Corrigé au master du candidat → les 4 vues suivent (instances).
   Chercher ce fantôme dans les CTA des sections restantes.

## Leçons de Produits (2026-09-01, nuit)

1. **Un enfant peut n'avoir RIEN de responsive** : la ProductCard est identique aux
   4 étages (16/20 SemiBold partout = `Titre 6`, style statique existant). Alors :
   candidat **mono-composant**, pas de set, pas de variable, zéro mint. Le responsive
   vit dans la SECTION (piste, largeurs, amorce), pas dans la carte. Vérifier ça
   AVANT de créer quoi que ce soit.
2. **Lier le titre de section à `H2` est une étape SYSTÉMATIQUE** (oubliée sur
   produits, rattrapée) — l'ajouter au réflexe de l'étape 6 du processus.
3. **Les textes d'un master consommé à plusieurs largeurs doivent être FILL +
   retour à la ligne + centrage posé sur le texte** — un titre en largeur libre
   (hug) déborde de la carte étroite au lieu de se replier (titre à −29 px).
4. **Titre produit trop long — décision owner : troncature 1 ligne + « … » (option
   C)**, posée au master. Le repli cassait l'alignement des prix ; le débordement
   validé desktop n'était pas généralisable. `textTruncation='ENDING'` PUIS
   `maxLines=1` (l'ordre compte).
5. **UX carrousel : l'amorce doit être FRANCHE (~90-110 px)**. Une carte coupée de
   26 px se lit comme un bug, pas comme un carrousel (tablette 234→110, wide
   111→91). Ajustée au set → les vues suivent seules (instances).
6. **Après `combineAsVariants`, repositionner le set** par rapport au contenu déjà
   présent dans la section de travail — 3ᵉ chevauchement de la session.
7. Vérification fantôme d'icône (leçon SAV) : produits = 0 trouvé.

## Leçons du chantier « fill / containers / resize » (2026-09-01, suite)

1. **Pas de `Container · X` sur la planche de validation.** Il ne sert que sur
   l'étagère du VRAI DS (banc d'essai du `width: fill` du contrat — fill n'existe
   que dans un parent auto-layout). Sur la planche, les variantes ont leurs largeurs
   de démo fixes : le container n'apporte rien et a produit deux incidents
   (largeur +80 fantôme, containers imbriqués DANS les variantes). La convention
   Container se pose **au pivot DS final**, pas avant.
2. **Le fill vit sur les INSTANCES dans les vues** (déjà en place), jamais sur le
   master. Un master garde ses largeurs de démo ; le contrat dit déjà
   `width: "fill"` + `referenceWidth` — rien à inventer.
3. **Un overlay absolu doit porter ses contraintes** : CTA hero Mobile/Tablette en
   MIN/MIN (reste d'un remplacement de CTA) → ne suivait pas le resize. Fix :
   STRETCH (horizontal) / MAX (vertical). Tout remplacement d'un nœud absolu doit
   reposer les contraintes, pas seulement x/y.
4. **Changer l'axe (`layoutMode`) ou le wrap (`layoutWrap`) d'un parent RÉINITIALISE
   en silence le sizing des enfants.** Deux morsures le même soir : Mobile passé en
   vertical → cartes transposées en FILL vertical, écrasées 418→391 ; Desktop/Wide
   passés en NO_WRAP → cartes FILL retombées en FIXED. Règle : poser l'axe et le
   wrap D'ABORD, re-poser FILL/FIXED des enfants APRÈS, puis re-mesurer.
5. **Un mode = UNE disposition, pas de wrap.** Le breakpoint est géré par le
   changement de mode, jamais par un retour à la ligne fluide dans le mode
   (vieille recette du runner : WRAP+minWidth — retirée partout). Au resize, les
   cartes s'étirent, elles ne recoulent pas.
6. **Chaîne des hauteurs dans le bon sens** : seule la carte est FIXE (418/288 =
   design validé), rangée et variante en HUG — la hauteur remonte du contenu.
7. **La preuve resize standard** : instance jetable hors écran, +200 px de large,
   vérifier que les enfants s'étirent de la même quantité et qu'aucun nœud ne
   déborde, puis supprimer. Une ligne de script, à rejouer après chaque fix.
8. **La hauteur du MODE (racine de variante) n'est pas importante — ne pas y
   toucher.** Le mode est une étagère : les instances tiennent leur comportement
   du composant, pas du cadre du mode. Forcer HUG dessus n'apporte que du confort
   d'édition et a effondré le hero (contenu absolu : 746 → 288, restore owner).
   Règle : hauteur du composant d'abord (elle, doit être juste) ; le mode reste
   comme il est ; toute retouche de mode doit être un no-op visuel prouvé.
9. **Un restore Figma peut être PARTIEL vis-à-vis du travail de la session** :
   après celui du hero, 3 acquis tenaient (fenêtre carrousel, plaques SAV, CTA
   hero) et 2 étaient perdus (cartes FILL Desktop, conteneur CTA produits).
   Après tout restore : re-mesurer les sentinelles, ne rien supposer.
10. **Les contrôles de carrousel sont MASQUÉS sur Mobile/Tablette** (décision
   d'époque) — tout détecteur doit filtrer `visible=false` avant de rapporter.
11. **Convention de structure : le mode EST le composant (à plat).** Les cadres
   intermédiaires (mode > SAV > section > …) n'étaient pas un choix mais la
   provenance des clones (bloc cloné depuis une vue = son cadre de section vient
   avec). Mise à plat exécutée sur SAV, Produits, Devis, CategoriesPrincipales —
   diff de relevé « identique au pixel » exigé à chaque variante, preuves resize
   rejouées après. Recette du transfert : axe, gap, alignements ET paddings du
   cadre remontent sur le mode (le padding oublié = le contenu Desktop SAV
   remonté de 89) ; absolus repositionnés en coordonnées mode + STRETCH/STRETCH ;
   sizing des enfants re-posé après reparentage (leçon 4). **Presentation mise à
   plat aussi (décision owner revenue dessus)** — les 7 sets sont à plat, hero et
   les Wide l'étaient déjà. Les vues substituées (instances) ont suivi sans
   dégât — vérifié sur la vue Mobile.

## Leçons de Réassurances (2026-09-02 — molécule + section)

1. **COMPARER avant de livrer.** Le premier jet de la molécule avait des hauteurs
   fausses sur les 4 modes — livré sans diff contre les cartes des vues. La
   comparaison nœud-à-nœud (hauteurs, pads, gaps, alignements) a tout révélé en
   une passe. Le diff vue↔candidat est OBLIGATOIRE avant toute présentation.
2. **Ce qu'une variable ne sait pas porter devient une VARIANTE** (décision
   owner : « si var faut var », jamais d'unification du design validé).
   L'alignement de texte n'est pas liable → axe `Alignement=Gauche/Centré`
   (Gauche en Mobile/Tablette, Centré en Desktop/Wide).
3. **Consolider les respirations avant de créer des variables.** Les vues
   portaient les mêmes espacements éparpillés différemment (pad interne du bloc
   texte sur Tablette, pad racine sur Desktop). Consolidé : `gap` 16/24/24/24 et
   `pad-bas` 16/24/24/24 sur la racine, bloc texte constant — 2 variables au
   lieu de 4.
4. **Les hauteurs égalisées d'une grille ne sont PAS une propriété de la carte.**
   Desktop/Wide vues = 561/588 par FILL vertical dans la grille ; la carte
   naturelle fait 531/561. Master HUG, usage-grille FILL — ne jamais figer
   l'égalisation dans la molécule.
5. **Mesure après mutation = attendre le recalcul.** Un relevé pris dans le même
   script que la mutation a lu des hauteurs fantômes (1496 vs 1749 réels) ;
   re-mesuré au script suivant : identique. Toujours re-mesurer dans un
   second appel avant de conclure à un écart.
6. **Wide au pivot des gouttières** : l'ancienne vue portait la gouttière en
   centrant un bloc 1550 ; la variante candidate est pleine largeur 1728 avec
   pad 89 intégré (convention des autres sections). L'écart de relevé w
   1550→1728 est VOULU, le rendu est identique.

## Leçons d'Avis Google (2026-09-02 — ReviewCard + section)

1. **La troncature (et toute propriété non-liable) peut vivre en OVERRIDE
   D'INSTANCE** au lieu d'une variante : master sans troncature, les corps
   Desktop/Wide posent `ENDING` puis `maxLines=3` sur leurs instances — prouvé
   persistant. Décision owner : « surtout pas 2 versions » → c'est LA réponse
   quand une variable ne sait pas porter et qu'une variante serait de trop.
   Même mécanique pour la visibilité du logo Google (M/T visible, D/W non).
2. **Nettoyer une propriété du master EFFACE les overrides identiques des
   instances** — la troncature D/W a sauté quand le master est passé à
   DISABLED ; re-posée après. Ordre : nettoyer le master D'ABORD, poser les
   overrides ENSUITE.
3. **`maxHeight` n'est pas liable sur un nœud TEXTE** (probe : « invalid field
   for text node ») — la piste « hauteur max par variable » est morte, d'où
   l'override.
4. **Un clone porte les artefacts d'égalisation** : la carte Wide clonée avait
   `minHeight: 239` figé (ancienne égalisation manuelle) qui bloquait tout HUG
   en silence. Après tout clonage : chasser les min/max hérités.
5. **`resize(w, h)` sur une instance FIGE la hauteur en override** — poser
   le HUG vertical APRÈS, et jamais de resize ensuite ; ou travailler dans un
   parent auto-layout (rangée de témoins) où `layoutSizingVertical='HUG'` tient.
6. **Un GROUP se dissout seul quand on reparente son dernier enfant** — garder
   `if (!w.removed)` autour du remove, sinon le script meurt à mi-course.
7. **FILL dans un WRAP ne force pas 1 carte par rangée** (elles se compressent
   à 103 px) — un `minWidth` d'usage sur les instances rétablit l'empilement.

## État de la vague (2026-09-01, fin de session)

| section | candidat | substitué 4 vues | score |
|---|---|---|---|
| HeroVideo | set 4 var. | ✅ | octets identiques 4/4 |
| CarteCategorie | set 1 var. (Superpose) | via section | — |
| CategoriesPrincipales | set 4 var. | ✅ | écarts nommés (voiles, pad-h corrigé) |
| Presentation | set 4 var. | ✅ | octets identiques 4/4 |
| SAV | set 4 var. + `H2` | ✅ | écarts nommés (gras restauré, CTA 18, fantôme corrigé) |
| ProduitsECommerce | carte + set 4 var. | ✅ | écarts = décision C + amorces ajustées |
| CarteReassurance | set 2 var. (Alignement) + H4 + 3 vars | via section | hauteurs pixel-exactes 4 modes |
| Reassurances | set 4 var. (cartes = instances molécule) | ✅ (2026-09-02) | M/T/D identiques pixel ; Wide 1550→1728 voulu |
| ReviewCard | master unique + 12 vars review/* | via section | naturelles 230/206/236/234 ; troncature+logo = overrides |
| AvisGoogle | set 4 var. (cartes = instances ReviewCard) | ✅ (2026-09-02) | M/T/W pixel ; D cartes 236 vs 239 (minHeight artificiel retiré, nommé) |

**La vague home est COMPLÈTE côté candidats** : les 8 sections + 3 molécules de
la home sont candidates, substituées dans les 4 vues. Restent : (formulaire,
coordonnées, FAQ, texte-SEO, équipe — hors home) · header/footer hors vague ·
Empilé+Colonnes reportés · pivot final `tokens/`+DS (avec la mise à plat comme
convention de structure).

## Journal des mises à jour

- **2026-09-01** — v1, écrit après le premier passage complet (HeroVideo).
- **2026-09-01** — étape 11 exécutée sur les 4 vues : la preuve de substitution est
  la **comparaison des octets du PNG clippé** avant/après (même zone, même encodeur) —
  plus forte et moins chère qu'une comparaison visuelle. À réutiliser tel quel.
- **2026-09-01 (suite)** — chantier fill/containers : les 7 `Container` de planche
  supprimés (erreur, voir leçons), CTA hero re-contraint, CategoriesPrincipales
  uniformisé (FILL + HUG + pas de wrap), preuves resize passées sur hero,
  Desktop et Wide.
