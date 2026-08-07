# Rapport de décision — un émetteur Odoo vaut-il le coup ?

**Spec 018** · relevé du 2026-08-06 au 2026-08-07 · instance `odoo:19.0-20260803`, montée puis détruite.

Ce rapport **fournit de quoi décider ; il ne rend pas un verdict**. Aucun seuil n'a été préétabli —
c'est un choix assumé (spec.md § Clarifications Q1), et il rend la section **Angles morts**
obligatoire : sans elle, une décision à l'humeur se déguiserait en décision informée.

> **⚠️ À lire avant les chiffres.** Le montage est **incomplet**. La couche de réglages (T031–T035 :
> les composants OWL, les leviers L2 et L3) **n'a pas été écrite**. Tous les chiffres ci-dessous
> portent donc sur un bloc gouverné **par son balisage seul**. C'est un état réel et instructif —
> mais ce n'est pas le montage que la spec décrivait, et le coût du mécanisme de réglages reste
> **non mesuré**.

---

## 1. Volumes — ce que la réplique a coûté

Relevé par exécution (`proofs/volumes.json`, invariants M1–M4 vérifiés par programme).

| | Lignes |
|---|---|
| Écrites en tout | **899** |
| dont **commentaires** | 306 (34 %) |
| dont vides | 88 |
| **Lignes de code** | **505** |

**La distinction commentaires/code est décisive et elle joue CONTRE l'émetteur** : un émetteur ne
rédige pas les justifications que ce montage porte. Compter les 899 gonflerait l'argument. Le
chiffre qui vaut est **505**.

| Classement | Lignes | Part |
|---|---|---|
| **Mécanique** — un émetteur déterministe l'aurait produite sans jugement | **399** | **79 %** |
| **Cas particulier** — un humain a dû trancher | **106** | 21 % |

En retirant l'instrument de mesure (72 lignes, qui ne dérivent d'aucun contrat et qu'un émetteur de
composants n'aurait aucune raison de produire) : **433 lignes pour la réplique elle-même, dont 92 %
mécaniques**.

### Les trois postes mécaniques, et ce qu'ils pèsent

| Poste | Lignes | Origine |
|---|---|---|
| Renommage `var(--x)` → `var(--pqr-x)` de la feuille de référence | 191 | la sortie de `emitHtml` (554 lignes de CSS pour la chaîne) |
| Les 19 règles de glyphe | 88 | `contracts/icons.registry.json` v1.2.0 |
| Balisage de verrouillage par élément | 14 | les 3 tableaux des zones |

*Répétitif n'est pas la même chose que non mécanique* : 19 entrées dérivées d'un registre gouverné
sont exactement ce qu'un émetteur fait à coût nul.

### Les cas particuliers, et pourquoi ils comptent plus que leur volume

Seulement 106 lignes — mais **aucun des quatre n'était trouvable dans un contrat** :

1. **Les 2 glyphes à couleur figée** (18 l.) — 17 des 19 SVG portent `currentColor`, deux non. Il
   fallait ouvrir les 19 fichiers pour le voir.
2. **Le bouton livré présent-mais-masqué** (8 l.) — un snippet Odoo est rendu une fois puis stocké ;
   un bouton absent serait irrécupérable. Contrainte du modèle d'exécution, pas du contrat.
3. **La clé `description` du manifeste** (8 l.) — trouvée par un défaut : sans elle, Odoo rend le
   README en RST et l'installation imprime des erreurs.
4. **L'instrument de mesure** (72 l.) — n'appartient à aucun contrat.

**Le plus cher n'a coûté aucune ligne.** L'attribut `group` manquant sur la déclaration de bloc :
le module s'installait à **0 erreur**, l'xpath matchait, et le bloc était **introuvable dans tout
l'éditeur**. Aucune porte, aucun journal, aucune validation de schéma ne l'aurait signalé — seul un
geste sur l'instance l'a fait apparaître. Un émetteur qui dérive cet attribut ne peut pas l'oublier.

---

## 2. Leviers — la gouvernance tient-elle ?

`proofs/verdicts-leviers.json`. **4 verdicts sur 4**, aucun silence.

| Levier | Verdict | En une phrase |
|---|---|---|
| **L1** verrouiller la structure | **lâché** | les marqueurs survivent à l'enregistrement, mais les zones déclarées figées restent éditables au clavier |
| **L2** empêcher un réglage natif | **lâché** | 4 réglages natifs non déclarés s'affichent sur notre bloc |
| **L3** tronquer l'héritage du parent | **non exercé** | T035 non écrite ; un verdict sans geste serait interdit (V4) |
| **L4** rouvrir une image | **non exercé** | aucun des 3 contrats ne porte d'image |

**Zéro tenu.** Ce n'est pas un échec de spec — FR-016 dit exactement cela : *un levier qui lâche est
un résultat*.

### Ce qui a lâché, et pourquoi c'est structurel

`o_not_editable` ferme les **réglages** et le **dépôt** sur son sous-arbre — il ne ferme **pas**
l'édition de texte. Or l'éditabilité vient de l'ancêtre `.container`, que nous avons mis nous-mêmes
pour rendre le texte modifiable, et elle est **héritée par tout le sous-arbre**. *Le mécanisme qui
ouvre le texte de la colonne droite ouvre aussi celui de la colonne gauche.* Les deux besoins
entrent en collision dans le même balisage.

Relevé : sur la page rouverte en édition, `isContentEditable` vaut `true` sur la colonne gauche, le
titre de l'en-tête et le libellé du bouton — trois zones déclarées **figées**.

Et le panneau affiche, **identiquement à chaque clic** : *Background Colors*, *Content Width*,
*Height*, *Visibility*. Aucun n'a été déclaré par nous.

### Ce qui TIENT, et qu'il serait malhonnête de noyer

**FR-012 / SC-005 tient sur la zone déclarée modifiable.** Le texte de présentation est **encore
éditable après enregistrement puis réouverture**, et son ancêtre éditable est bien `.container` —
exactement le mécanisme identifié en recherche, obtenu **sans un seul attribut ni une ligne de
JavaScript**. La réduction de coût que ce choix de balisage achète est réelle et confirmée en
fonctionnement.

---

## 3. Écart visuel — nos jetons traversent-ils Odoo ?

`proofs/comparaison-image.json`. Plancher de tolérance : **0** (le plus strict possible).

| Composant | Écart | Cause dominante |
|---|---|---|
| `ds.button` | **0,0000 %** | — (sous le plancher) |
| `ds.section-header` | **0,0000 %** | — (sous le plancher) |
| `ds.presentation` | **4,1707 %** | `engine` |

**C'est le résultat le plus favorable du dossier.** Deux composants sur trois sont identiques **au
pixel près**. La ligne de `section-header` en dit le plus : sa page rend `disposition=avecCta`,
donc elle **exerce en fonctionnement le `t-call` de niveau 3** — la chaîne à trois niveaux marche,
et son rendu est exact.

Le 4,17 % est un **décalage horizontal pur de 15 px CSS**, sans aucune déformation : la boîte
d'encre fait **2545 × 173 px des deux côtés**. Remonté jusqu'à sa règle sur la page vivante :
`.container` d'Odoo déclare `--gutter-x: 30px` puis `padding-left: calc(var(--gutter-x) * .5)`.
**Et ce `.container`, c'est nous qui l'avons mis**, pour l'éditabilité. L'écart est le **prix mesuré
d'un choix assumé**, pas une fatalité d'Odoo.

---

## 4. SC-009 — ce qui est confirmé, et ce qui reste lu

| Mécanisme | Statut |
|---|---|
| Snippet déclaré par héritage `xpath` de `website.snippets` | **CONFIRMÉ** — et l'attribut `group` s'est révélé obligatoire |
| `t-call` imbriqué sur 3 niveaux avec passage de paramètres | **CONFIRMÉ** — rendu exact, 0,0000 % d'écart |
| `section > .container` rend le texte éditable sans attribut | **CONFIRMÉ** — survit à l'enregistrement |
| `contenteditable` et `.o_editable` effacés à l'enregistrement | **CONFIRMÉ** — 0 des deux sur la page publique |
| `oe_unremovable` / `oe_unmovable` survivent à l'enregistrement | **CONFIRMÉ** — 8 et 8 encore présents |
| `o_not_editable` ferme les réglages sur son sous-arbre | **NON CONFIRMÉ** — il ne ferme pas l'édition de texte, et les réglages natifs remontent quand même |
| Classes d'exclusion (`s_col_no_resize`, `o_snippet_not_selectable`…) | **NON CONFIRMÉ** — jamais essayées |
| `patch_builder_options` (L3, dernier recours) | **NON CONFIRMÉ** — jamais employé |
| `o_editable_media` (L4) | **NON CONFIRMÉ** — non exerçable par cette chaîne |
| Un module tiers s'inscrit au même registre de réglages que le noyau | **NON CONFIRMÉ** — T031–T033 non écrites |

---

## 5. Recommandation

**Construire l'émetteur — mais pas avant d'avoir instruit la gouvernance.**

**Ce qui porte cette recommandation :** 79 % du code écrit est mécanique, 92 % en excluant
l'instrument. La part de jugement est de **106 lignes sur 505**, et elle est concentrée dans quatre
décisions nommables — donc apprenables par un émetteur, une fois formulées. Et les jetons traversent
Odoo sans altération sur deux composants sur trois, ce qui veut dire que le socle qu'un émetteur
produirait est **juste**.

**Ce qui la retient :** la gouvernance, qui est la raison d'être du projet, **n'est pas obtenue**.
Zéro levier tenu. Un émetteur qui génère parfaitement des blocs qu'un rédacteur peut ensuite
déstructurer ne résout pas le problème posé — il l'industrialise.

**Ordre de grandeur, adossé au précédent interne mesuré :** l'émetteur tiers du dépôt,
`packages/emitter-web-components/src/emit-wc.ts`, fait **1353 lignes** (+196 et +255 pour ses deux
contrôles). **Réserve à écrire en toutes lettres** : il produit **un seul** type de fichier, là où
Odoo en demande **trois** (XML QWeb, JS+XML OWL, CSS+assets). Le facteur n'est pas linéaire, mais un
ordre de grandeur de **2 à 3×** ce précédent est le point de départ honnête — et il ne couvre PAS la
couche de réglages, dont le coût est inconnu (§6).

**Si « construire » est retenu** : FR-019 tient. L'émetteur reste une **transformation
déterministe**, aucun modèle de langage dans le chemin de génération. Rouvrir cette règle serait une
décision explicite, jamais un repli.

**La séquence que ces chiffres suggèrent** — et ce n'est qu'une suggestion, la décision appartient à
l'owner :

1. **D'abord** une spec courte qui instruit la gouvernance sur ce même module : écrire T031–T035,
   rendre les 4 verdicts pour de bon. Sans ça, on construirait un émetteur pour une cible dont on
   ignore si elle peut être gouvernée.
2. **Ensuite** seulement, l'émetteur — avec un coût de réglages enfin chiffré.

---

## 6. Angles morts — ce que ces chiffres ne permettent PAS de conclure

**Obligatoires (FR-018b), et ils sont cinq.**

1. **Le coût de la couche de réglages est INCONNU.** T031–T035 n'ont pas été écrites : **0 ligne**
   de `js-owl`, **0** de `xml-owl`. Or la US2 vient de montrer que le balisage seul ne gouverne
   rien. C'est l'angle mort principal : le poste le plus incertain du chiffrage est celui qui n'a
   pas été mesuré, et le 79 % de mécanique ne dit rien sur lui.

2. **Ce que vaut le passage de 3 composants à 34.** La chaîne retenue n'exerce ni la **répétition
   d'un élément** (aucun des 3 contrats n'en porte, alors que **8** sections du catalogue en
   dépendent), ni les **slots**, ni les **états interactifs** (les 34 contrats Piqueray portent
   `states: []`). Extrapoler linéairement serait une erreur de méthode.

3. **Le levier L4 (images) n'a aucun coût connu.** Aucun des 3 contrats ne porte d'image. C'est la
   **première** chose qu'une chaîne à photo aurait à instruire, et le catalogue en est plein.

4. **Le squelette du site n'est pas mesuré.** Les pages de mesure chargent `web.assets_frontend`
   (donc Bootstrap et son reboot) mais pas `website.layout` : ni en-tête, ni menu, ni pied de page.
   L'écart de 4,17 % est celui du **cadre CSS de base**, pas d'une page de site complète.

5. **Le coût d'un changement de version majeure n'a pas été ré-instruit.** La spec l'avait relevé
   (la communauté OCA passée de 22 modules maintenus à 4 entre la 18 et la 19), et 019 en donne une
   démonstration directe : `html_builder` est **neuf en 19.0**, et l'ancien éditeur à widgets a
   disparu. Un émetteur écrit contre 19.0 est un pari sur la stabilité de 20.0 — pari non évalué.

**Un sixième, découvert en chemin.** Plusieurs faits que les documents de conception donnaient pour
acquis se sont révélés faux à la mesure : `core/samples/` périmé de deux versions, « 1 littéral
attendu » alors qu'il y en a 4, « archiver la spec cassera le build » (faux — elle recrée un
répertoire fantôme), la chaîne à 3 niveaux qui ne se rend sous aucune valeur de prop, et l'attribut
`group` oublié. **Le taux d'erreur des faits lus-mais-non-confirmés a été élevé dans cette spec.**
C'est un argument pour SC-009 — et une raison de traiter avec prudence tout chiffre de ce rapport
qui ne serait pas adossé à un geste.
