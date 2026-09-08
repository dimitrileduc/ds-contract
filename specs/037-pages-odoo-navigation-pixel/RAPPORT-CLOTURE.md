# Rapport de clôture — 037 · Les neuf pages du site sur Odoo

**Date** : 2026-09-08 · **Branche** : `comet-yogurt` · **Instance de travail** : `piqueray-odoo-037` (8109, jetable)

---

## 1. Ce qui est livré

**Les neuf adresses du site répondent.** Sept n'existaient pas ; le menu et les boutons y menaient déjà.

- **Un contenu commun, écrit une fois.** Devis, Réassurances et Avis Google vivent dans
  `integrations/odoo/authoring/commun/`. Une page les reprend en une ligne (`{"commun": "devis"}`) et les
  **surcharge champ par champ** quand elle en a besoin. Écrire l'un d'eux en clair dans une page est **refusé**.
- **Un résolveur qui refuse avant Docker** (`scripts/odoo/resolve-page.ts`) : sept familles de refus, chacune nommant
  le fichier, la section, la clé et la valeur. Une destination absente n'est pas une faute — le bouton garde
  `href="#"` et part au registre.
- **Les destinations viennent du fichier**, avec une grammaire fermée (`links`, `cards[].lien`, `reviews[].lienAvis`)
  et le même adressage que le panneau d'édition. Une seule addition au composeur : `set_link`.
- **L'arbre du menu validé est posé** : Motorisation sous Portes de garage, avec une migration `19.0.1.17.0` **gardée**
  qui ne corrige que notre propre inférence, jamais le rangement du client.
- **Un scénario de navigation sur les neuf VRAIES pages**, avec assertion anti-souche et preuve rouge conservée.
- **Un instrument de mesure de page entière** (`extract/odoo-page-parity/`), prouvé hors ligne avant de servir, et
  **36 rapports** conservés.

Trois évals neuves couvrent les trois mécanismes, et chacune précède la phrase de documentation correspondante (§II).

---

## 2. Ce que la mesure dit, sans arrondir

**18 rapports verts sur 36.** Deux pages sont vertes aux quatre largeurs — **Dépannage/SAV** et **Contactez-nous** ;
**Motorisation** à trois sur quatre, et à 1728 **toutes ses sections sont à zéro d'écart de hauteur**.
Les 36 rapports portent `structure: "égale"` : le nombre de sections rendues est celui de la vue, partout.

**La cause dominante est UNE, et elle est mesurée.** La carte de Réassurances rend **30 px plus court** qu'en vue :
au 1200 sur l'accueil, la grille fait 1094 px côté Odoo contre 1154 en vue, à structure identique — 531 px par carte
contre 561, soit 60 px sur deux rangées. Le reste de la section est au pixel (en-tête 76 = 76, écarts 48 = 48,
bouton 54 = 54). C'est un écart de **bloc**, pas de page : le corriger sortirait du périmètre (SC-010).

**Deux attributions corrigées APRÈS avoir regardé les triptyques**, et c'est la leçon de `docs/16` payée une fois de
plus (« avant d'annoncer un %, REGARDE le triptyque ») :

- **Accueil** — la **vue Figma** porte la copie des Réassurances des portes **industrielles**, pas celle de l'accueil.
  Photos identiques des deux côtés : l'écart est du **texte**. Vérifié au pont sur les vues 1200 et 1728. Même
  copier-coller que sur la vue Portes d'entrée. **Correction à la source ; la page ne bouge pas.**
- **À propos** — notre section **Équipe** ne portait pas les membres dans le même ordre que la vue : le contenu venait
  du banc de la vague 035. **Corrigé le 2026-09-08** : les seize suivent désormais l'ordre de la vue, et les portraits
  n'ont pas bougé — la vue et la planche de base portent les mêmes photos appariées aux mêmes personnes. La page passe
  de 8,29 / 6,63 / 10,92 / 7,13 % à **3,47 / 2,07 / 6,50 / 1,53 %**, trois largeurs sur quatre au vert.
  Reste ouvert : les **seize photos de survol** de la vue, toutes distinctes, n'ont pas pu être exportées — les dix
  ports que le manifeste du plugin autorise étaient tous pris, dont un par une autre session travaillant précisément
  sur ces photos.

La carte de Réassurances 30 px plus courte **reste vraie** : c'est la cause de l'écart de HAUTEUR partout où le bloc
apparaît. Ce qui était faux, c'était d'en faire la cause du score au pixel de l'accueil.

Détail complet : `proofs/RAPPORT-MESURE.md`. Ce qui reste : `proofs/registre-restes.md`.

---

## 3. Ce qui a été trouvé en chemin — et que personne ne regardait

1. **Un enfant MASQUÉ dans une vue coûte sa hauteur si on le compose quand même.** L'auto-layout Figma ne compte pas
   un enfant invisible ; le DOM, si. La FAQ de Portes résidentielles était à +80 px : 64 pour une rangée masquée,
   16 pour un sur-titre masqué. Δh est retombé à +18/+17/+11/+24 en suivant la vue. Le même retrait vaut pour la
   5ᵉ carte de Réassurances et la 3ᵉ carte de Catégories, sur quatre pages.
2. **Odoo force `url = '#'` sur une entrée de menu qui a des enfants.** Mesuré sur base fraîche ET sur base mise à
   jour. Conséquence restée invisible depuis la spec 022 : « Portes d'entrée » avait perdu son adresse tant que
   Motorisation vivait dessous, et le « # » survivait au départ de l'enfant. La migration le restaure. Corollaire
   non réparable : « Portes de garage » a des enfants, donc ne mène pas à sa page et n'est jamais soulignée dessus.
3. **Les icônes sociales du pied répondent 404 sur les neuf pages** — les champs sociaux du site sont vides.
4. **`compose_page.py::img_url` crée une nouvelle pièce jointe à chaque composition** : 286 → 399 après une seule
   reconstruction complète, soit **+113**. Le stock grossit indéfiniment et le HTML sauvegardé change alors que rien
   n'a changé.
5. **L'empreinte d'une capture ne peut pas porter sur les octets du PNG.** Deux captures aux pixels *rigoureusement
   identiques* pesaient 1 123 307 et 1 124 418 octets : l'encodeur de Chromium ne rend pas deux fois le même flux.
   Elle porte désormais sur les pixels décodés. **Le schéma de rapport annonçait « mêmes `scorePct`,
   `ecartHauteurPx` et `sha256` » : la partie `sha256` était fausse.**
6. **Le compte exact de pixels d'une capture n'est pas reproductible** — 12 à 19 unités sur 1,9 million entre deux
   lancements de navigateur. `scorePct` et `ecartHauteurPx`, eux, le sont : ce sont les deux nombres que le rapport
   présente, et les deux que SC-005 nomme.
7. **Une seconde base dans le même conteneur Odoo fait tomber toutes les pages en 404** : le serveur ne sait plus
   laquelle servir. Coûté vingt minutes de faux diagnostic.
8. **`mktemp` crée en 0600 et `docker cp` conserve le mode** : le composeur lisait « Permission denied » sur un
   descripteur parfaitement valide.
9. **Un `${var:?message}` contenant une apostrophe casse bash** avec un « unexpected EOF » qui ne pointe pas la
   bonne ligne.

---

## 4. Ce qui n'est PAS fait, nommé

- **Aucune des neuf pages n'est validée par l'owner.** Les neuf lignes sont ouvertes dans
  `proofs/validations-owner.md`.
- **Le pilote 8087 n'a pas pu servir** : il est levé par un autre worktree (`oceanic-oak`) et monte les addons de
  celui-ci. Le mettre à jour ferait servir un module qui n'est pas celui de cette vague et dérangerait une autre
  session. La validation est proposée sur 8109, qui porte exactement le module et les pages de ce commit.
  **Décision attendue** : valider là, ou relever le pilote depuis ce worktree.
- **66 destinations ne sont pas tranchées**, dont l'adresse de la fiche Google et les deux comptes sociaux. La liste
  fermée des adresses externes autorisées est **vide** : aucune `https://` ne passe aujourd'hui.
- **21 écarts au-dessus du seuil et 15 hauteurs rouges** attendent chacun une décision — corriger le bloc dans une
  vague suivante, corriger la source, ou acquitter.
- **Les réponses des rangées d'accordéon FERMÉES n'existent nulle part dans les vues.** Elles sont **vides** dans les
  pages plutôt qu'inventées. Elles se verront à l'écran : c'est voulu.

---

## 5. Écart au plan, assumé et tracé

Le plan (D8) exportait les 36 vues par la **REST API** avec `FIGMA_TOKEN`. Le jeton n'existe pas sur ce poste ;
l'owner a tranché en session : **passer par le pont figma-console**. L'instrument sait faire les deux — la REST
quand le jeton est là, le cache du pont sinon — et **il ne change pas de règles** : même contrôle de largeur, même
refus nommé. Le piège daté du 2026-09-04 (`exportAsync` rendant 149 octets) est fermé par trois gardes ; l'une
d'elles a d'ailleurs **refusé les sept premières photos**, qui étaient en JPEG et non en PNG.

---

## 6. Les portes

Toutes vertes ; codes de sortie dans `proofs/portes.md`.

`npm run eval` : **une éval a rougi à cause de cette vague, et elle est corrigée**.
`reassurances-grid-variant-isolation` lisait le bloc Réassurances dans le FICHIER de `pages/home.json` ; la home le
reprend désormais du commun. L'éval lit maintenant le descripteur **résolu** — là où le composeur lit — au lieu
d'exiger la copie locale que SC-004 interdit. Les **trois autres rouges sont antérieurs** et déjà nommés dans
`specs/tiny/vague-033-etats-cartes.md` (2026-09-07) : ils portent sur `ds.footer` / `ds.faq` / `ds.reassurances`, sur
un recensement de styles de texte déplacé par des chantiers concurrents, et sur le plancher du replay calculé.
Aucun contrat de cette vague n'y est pour quelque chose — le re-pin zéro le prouve. **Re-pin ZÉRO vérifié sur sept chemins** —
`evals/golden.json`, `figma-sync/plugin/engine.receipt.json`, `examples/polaris/`, `src/`, `contracts/`, `tokens/`,
`catalog/` : aucun n'a bougé. Aucune version Figma neuve datée de cette vague (FR-022) : tous les gestes de pont
étaient en lecture.
