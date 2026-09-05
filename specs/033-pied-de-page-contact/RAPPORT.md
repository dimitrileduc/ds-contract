# 033 — le téléphone et l'email du pied de page deviennent de vrais liens

**Date** : 2026-09-05 · **Branche** : `oceanic-oak`

## Ce qui change

La colonne « Contact » du pied de page portait un bloc de texte plat. Le
téléphone et l'email n'étaient donc ni cliquables, ni modifiables séparément.

Ils sont maintenant **deux lignes distinctes**, chacune un vrai lien, **éditées
dans la page** : un clic sur le lien ouvre la fenêtre native d'Odoo, qui porte
la destination et son bouton *Edit*. Texte et destination au même endroit, sans
détour par le panneau.

**AUCUN contrat, AUCUN jeton, AUCUN fichier du moteur touché.** `graphDigest`
inchangé, `examples/polaris` intact, `parity/baseline.json` à 40.

## Le point qui a décidé de la solution

Le pied de page **n'est pas un bloc déposé** : c'est un gabarit système, re-rendu
à chaque requête. Éditer du balisage écrit en dur dans ce gabarit fait
sauvegarder **l'arch de la vue** — et `odoo -u piqueray_ds` la recharge depuis le
XML. L'édition du client aurait disparu au déploiement suivant, sans un mot.
Et sauvegarder une arch fait, chez Odoo, **copier la vue pour ce site**
(copy-on-write) : le pied aurait été gelé, hors d'atteinte de toute correction
future. *Dit comme il a été établi : ce dernier point vient de la lecture du
code d'Odoo, je ne l'ai pas mesuré sur la version abandonnée. Ce que le scénario
mesure, c'est que la version livrée ne provoque **aucune** copie.*

Le dépôt le savait déjà et l'avait écrit : `specs/023-odoo-footer-shell/proofs/
spike-persistance.json` conclut que **seul un champ du modèle `website` persiste**
pour ce gabarit. La première version de 033 l'ignorait.

Les deux lignes sont donc deux champs **`Html`** du modèle `website`
(`x_pqr_footer_tel`, `x_pqr_footer_email`), lus par `t-field`. `Html` et non
`Text` : un champ `Text` retire le balisage à la sauvegarde, il ne peut pas
porter d'ancre — c'est précisément pourquoi l'ancienne colonne était du texte
plat. Deux champs et non un : deux informations distinctes, deux destinations.

## La preuve, exécutée et non supposée

`integrations/odoo/qa/scenarios/footer-contact.spec.mts` (nouveau) mesure la
chaîne complète sur l'instance jetable de qualification :

| # | ce qui est prouvé |
|---|---|
| 1 | un clic sur le lien ouvre la fenêtre de lien **native** |
| 1 bis | aucune barre de mise en forme sur ces zones |
| 2 | la sauvegarde part et répond 2xx |
| 3 | l'édition atterrit dans le **champ du modèle** |
| 3 bis | le gabarit du pied n'a **pas** été copié pour ce site |
| 4 | italique déplié, `javascript:` refusé, liens conservés |
| 5 | après `-u piqueray_ds` + redémarrage, **l'édition est toujours là** |

**11 constats sur 11 au vert**, reçu : `proofs/footer-contact.json`. Le constat
3 bis est celui qui distingue la bonne solution de la mauvaise : les deux
ouvrent la fenêtre de lien, une seule ne gèle pas le pied de page.

Une chose vue en passant et dite comme telle : la garde retire bien la
destination `javascript:`, mais **laisse l'ancre vide en place**. Elle est
inerte — aucune URL exécutable ne survit — et c'est le comportement voulu
(déplier plutôt que supprimer, pour ne jamais perdre le texte d'un rédacteur).
Ce n'est donc pas un défaut, mais ce n'était écrit nulle part.

Une conséquence mesurée du passage à un champ `Html` : Odoo enregistre le
contenu d'un tel champ **enveloppé dans un `<p>`**, qui apporte la marge de
paragraphe de Bootstrap. Relevé sur la page vive : 16 px sous chaque ligne, la
colonne Contact à 132 px contre 100 pour Adresse. Une règle de pont l'annule —
c'est la boîte que l'hôte impose au contenu du rédacteur, pas un fait de design
à gouverner.

## Rien n'a bougé à l'écran

`specs/033-pied-de-page-contact/tools/mesure-pied.mts` simule l'**avant** dans la
page même — un seul `span`, texte plat du champ `x_pqr_footer_col3`, mêmes
classes, même colonne — et le compare à l'**après**. Aux trois largeurs :

| largeur | colonne | avant | après |
|---|---|---|---|
| 1200 px | 226 px | 54 px | 54 px |
| 1440 px | 212 px | 81 px | 81 px |
| 1728 px | 308 px | 54 px | 54 px |

**Identique partout.** Et la colonne entière retombe exactement sur son témoin :
100 px à 1200 comme à 1728, la même hauteur que la colonne « Adresse ».
Captures : `proofs/pied-1200.png`, `-1440`, `-1728`.

Et un défaut **antérieur**, trouvé en mesurant : à 1440 px la colonne est plus
étroite qu'à 1200 px (212 contre 226), donc l'email passe à la ligne. La bande
« wide » démarre à 1400 alors que la maquette large est dessinée à 1728 : entre
les deux, la colonne « Suivez-nous » revient et la gouttière passe de 56 à 89.
Ce creux existait avant cette vague (mesuré : 81 px des deux côtés) et n'est pas
de son ressort — il appartient au responsive du pied.

## Le canevas Figma n'a pas bougé

Relevé sur le canevas vif au moment de la clôture : `FooterColumn` est un
COMPONENT simple, nœud `2079:2246`, deux propriétés (`Titre`, `Texte`), une
variante. Photographie des 10 pages avant/après : **écart maximal 0,021 %**,
zéro page au-dessus du seuil (`proofs/033-avant-vs-033-apres.md`).

## Ce que j'ai fabriqué puis démonté — et pourquoi c'est la leçon de cette spec

Avant de trouver le précédent, j'ai construit successivement **deux solutions
entières, toutes deux fausses** :

1. **Une variante de composant Figma** (`Type=Texte` / `Type=Contact`) avec deux
   lignes icône + valeur, deux propriétés de texte, un canal ajouté au schéma,
   les deux émetteurs modifiés, une règle de pont CSS, deux champs Odoo, une
   migration.
2. **Deux lignes de réglage au panneau** avec une action de persistance dédiée,
   quatre champs Odoo et une seconde migration.

Puis une troisième, à moitié fausse : le bon patron d'édition, posé sur du
balisage en dur — celui que la section « Le point qui a décidé » démonte.

**La cause, une seule, répétée : je n'ai pas cherché ce que le dépôt savait
déjà avant de construire.** Le patron d'édition était à un `grep data-pqr-marks`
de distance ; le reçu de persistance, à un `ls specs/023-*/proofs/`. L'owner a
dû le répéter quatre fois, dont une en majuscules.

**Deuxième cause : j'ai mal lu le mot « canvas ».** L'owner parlait de l'éditeur
Odoo. J'ai compris Figma, et j'ai modifié un master à 69 instances pour un
besoin qui ne le concernait pas.

Un reçu du démontage est resté sur place jusqu'à la revue : le CSS de la
variante Figma (`a.footer-column__numero`, `a.footer-column__adresse`) était
entré au commit `d04e7aab` et **y est resté après le retour en arrière du
canevas**, avec une légende annonçant un défaut mesuré qui n'existait plus. Il
est supprimé. *Démonter une solution, ce n'est pas démonter ce qui se voit.*

## Ce que la revue à quatre agents a trouvé, et ce qui en a été fait

| constat | fait |
|---|---|
| l'édition en dur ne survit pas au déploiement, et gèle la vue | **corrigé** — deux champs `Html` du modèle |
| aucune barre de mise en forme n'était éteinte : Odoo offrait gras/italique/couleurs que la sauvegarde annule | **corrigé** — `FOOTER_CONTACT_NO_FORMAT` |
| le document d'authoring disait encore « texte simple, aucune marque » | **corrigé** — `rich-text` + `link`, `authoringVersion` 2.1.0 |
| deux noms de part inventés (`footer-column-tel/-email`) qu'aucun contrat ne porte | **corrigé** — les deux lignes gardent l'adresse `footer-column-texte` ; ce qui les distingue est `data-pqr-footer-contact`, attribut d'hôte |
| CSS mort de la variante démontée, disant l'inverse des règles vives | **corrigé** — supprimé |
| la neutralisation ne couvrait que le repos ; au survol elle ne gagnait que par ordre des feuilles | **corrigé** — repos + `:hover` `:focus` `:active` `:visited`, et la cause re-mesurée sur le balisage livré : nos règles coupées, les liens tombent de blanc souligné à `#583B51` sans soulignement |
| deux paragraphes numérotés (6) dans la légende de zone | **corrigé** |
| des scénarios QA lisaient la 3ᵉ colonne par position | **corrigés et rejoués** — `footer-edit` 10/10, `footer-update` 9/9 ; `footer-regen` ne lit que la 1ʳᵉ colonne, vérifié, rien à changer |
| rien ne vérifiait que le lien résiste à une insertion hostile | **corrigé** — constat 4 du nouveau scénario |
| deux captures documentaient la solution démontée | **corrigé** — retirées |
| *(trouvé en mesurant, pas par la revue)* le `<p>` qu'Odoo pose autour d'un champ Html ajoutait 16 px sous chaque ligne | **corrigé** — marge annulée dans la zone de pont |

## Ce qui reste ouvert, nommé

- **`x_pqr_footer_col3` n'est plus rendu.** Le champ reste déclaré : le retirer
  effacerait le contenu d'une instance déjà en ligne. **Aucune migration ne
  reporte son contenu vers les deux nouveaux champs** — sur une instance qui
  avait un contact personnalisé, le pied repart aux valeurs d'usine et l'ancien
  contenu dort en base. C'est un choix, pas un oubli ; la raison est écrite dans
  `models/website.py`.
- **Le document d'authoring ne sait pas dire « la 3ᵉ colonne seulement ».** Il
  adresse les parts du contrat, pas les occurrences d'une répétition : la
  décision `footer-column-part-texte` déclare donc `link` pour les trois
  colonnes, alors que seule la troisième l'exerce. Le précédent `ds.coordonnees`
  bute sur la même limite.
- **Le numéro et l'email sont écrits à TROIS endroits** : les valeurs d'usine du
  pied (`models/website.py`), le bloc de `ds.coordonnees`
  (`views/components.xml:467`) et le menu mobile (`views/header.xml:234`). Rien
  ne garde les trois cohérents ; changer le numéro demande trois éditions.
- **Aucune porte ne relit le balisage.** `check-authoring` compare les décisions
  aux parts du **contrat**, jamais au gabarit : un `data-pqr-part` inventé, ou un
  `data-pqr-marks` en désaccord avec la décision, reste invisible. C'est ce trou
  qui a laissé passer la première version.
- **Le repli de l'email entre 1400 et 1728 px** (voir plus haut) — antérieur,
  responsive du pied.
- **Les icônes sociales** gardent leur survol manuel en `opacity`, hors des
  canaux d'état de part (`DW-032-002`).

## Une chose trouvée en passant, sans rapport avec cette vague

`integrations/odoo/derivation-report.json` était **périmé au commit `d04e7aab`** :
il déclarait 84 blocs manuels quand l'arbre en contenait 85. Recalculé sur
l'arbre de HEAD sans mes modifications : 85 blocs / 4 638 lignes. La vague 033
n'ajoute **aucun bloc** ; le commit remet le fichier d'aplomb.

## L'état des portes, dit exactement

**20 portes sur 21 vertes**, dont toutes celles qui touchent cette vague :
`build`, `parity`, `plugin:check`, la ronde déterministe, `core-browser-check`,
les deux `tsc`, les six portes Odoo, `geometry:gate`, les deux `mint`,
`verify:catalog`, le compte de `baseline.json` (40) et le re-pin polaris (zéro).
Les trois scénarios QA du pied ont été rejoués après les dernières retouches :
`footer-contact` 11/11, `footer-edit` 10/10, `footer-update` 9/9.

**La 21ᵉ — les évaluations — n'a pas pu recevoir de lecture propre, et la raison
est dite plutôt que masquée.** Ce worktree est partagé avec une autre session qui
travaille en parallèle sur les états des cartes ; l'espace de travail copié des
évaluations (`evals/.scratch`) est unique pour le dépôt, et les deux campagnes
s'y marchent dessus. Trois lectures, trois résultats différents, aucun échec ne
nommant jamais le pied :
· 248/248 à deux reprises, avant que l'autre session ne commence ;
· 244/248 pendant qu'elle éditait contrats et jetons — les quatre cas
  nommaient `CarteCategorie`, `ProductCard`, `ReviewCard` et ses nouveaux jetons
  (tableau ci-dessous) ;
· 246/248 après son commit — les deux cas restants échouent sur un
  `MODULE_NOT_FOUND` visant `core/extract-react-tsx.js`, **un fichier qui existe
  et qui est bien présent dans l'espace copié**. C'est une faute de copie, pas un
  défaut de code.
Une quatrième lecture, lancée seule, a été interrompue : l'autre session avait
repris et modifiait de nouveau contrats, manifeste d'or et surfaces générées.

**Un balayage intermédiaire a rendu 20/21 (244/248), et le rouge n'était pas de
cette vague.** À 13:45, pendant qu'il tournait, une autre session a modifié les
contrats `carte-categorie`, `product-card` et `review-card` ainsi que les jetons
**dans ce même worktree** — l'élévation des cartes au survol, depuis commitée
(`1d6eb254`). Les quatre cas qui tombaient la désignaient tous, aucun ne parlait
du pied :

| cas | ce qu'il nommait |
|---|---|
| `golden-generated-output` | 20 fichiers de `CarteCategorie` et `ProductCard` |
| `emitter-invariants-hold-and-fail` | `ReviewCard`, une référence de jeton non résolue |
| `baseline-acknowledges-without-failing` | jetons `shadow/etat/*/survol`, `noir-voile-55` |
| `promotion-converges` | les mêmes jetons, sans variable Figma |

C'étaient ses jetons et ses contrats, saisis avant qu'elle n'ait re-épinglé le
manifeste d'or et synchronisé les variables Figma. Rien n'a été touché de son
côté. **La leçon vaut d'être écrite : dans un worktree partagé, un balayage
mesure les deux travaux à la fois — un rouge n'y appartient pas d'office à celui
qui le lit.** Le verdict ci-dessus est mesuré après son commit, sur un arbre qui
ne porte plus que cette vague.
