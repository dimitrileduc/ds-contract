# Mode d'emploi — porter UNE section 031 vers Odoo, responsive et mesurée

**Version** : 2026-09-02 (écrit depuis le pilote hero, `specs/tiny/pilote-odoo-hero-video.md`).
**Pour** : un agent, une section, une journée. Le hero est la référence exécutée ; ce document est la
recette rejouable. **Statut : brouillon, à valider par l'owner avant lancement.**

## Le but, en une phrase

Le bloc Odoo de la section affiche, aux 4 largeurs (390 / 834 / 1200 / 1728), ce que la planche 031
montre, mesuré par `images:compare` bloc contre planche, avec un écart sous le seuil que l'owner fixe
après lecture des triptyques. Le rédacteur garde ses possibilités d'édition. Tout ce qui reste à
l'ancienne est nommé.

## Ce que l'agent reçoit (préparé par l'orchestrateur, hors ligne — AUCUN accès Figma nécessaire)

Dans `.page-parity/vague-031/` (dossier de travail, ignoré par git) :
- `dumps/<Set>.live.dump.json` — le dump v1.8 du set 031, **après liaison** des paddings/gaps des
  racines de variantes (111 liaisons posées le 2026-09-02, valeurs identiques avant/après).
- `planches/<Set>-<390|834|1200|1728>.png` — l'export 1x de l'instance posée dans chaque vue home 031.
  **C'est la seule référence visuelle.**
- `proposals/<Set>/` — la sortie de `npm run extract:figma` sur le dump : contrat proposé, tokens
  proposés (`imported.*`), et **`figma-proposals.md`, le rapport de notes : c'est la liste de travail.**

## Les règles qui ne se discutent pas

1. **Figma est la référence, le contrat en est la traduction, Odoo en est la projection.** On ne
   « corrige » jamais un écart en tordant le contrat pour qu'il colle à Odoo.
2. **Pas de valeur tapée à la main dans un contrat.** Chaque valeur vient de la proposition ou d'un
   token existant. Un `imported.*` proposé se **renomme** vers un token existant s'il en existe un de
   valeur identique ; sinon on le **minte from-dump** dans `tokens/primitives.tokens.json` avec sa
   provenance (`$description` : set, nœud, date). Jamais de chiffre inventé.
3. **Un texte avec un saut de ligne est riche ; un texte avec du gras est riche** (règle owner
   2026-09-02). Un texte riche se lie à la propriété TEXT du set si elle existe, sinon `NONE`.
   Il déclare `white-space: pre-line` sur sa part et `content.marks.strong` (le validateur l'exige).
4. **Ne touche pas à Figma.** Si la source est fausse (valeur non liée, style manquant, variante
   parasite), tu l'écris dans ton journal, section « À corriger à la source », et tu continues avec
   la valeur observée. L'orchestrateur porte les écritures Figma à l'owner.
5. **Ne touche pas aux émetteurs, au schéma, aux tokens partagés, au verrou Odoo, aux golden.**
   Un besoin dans l'un d'eux = une ligne dans ton journal, section « Bloqué / à trancher ».
   Exception : minter un token primitif from-dump (règle 2) est autorisé — **dans un bloc à toi**,
   avec provenance.
6. **Chaque déviation est nommée**, dans le contrat (`description`) et dans ton journal. Une
   déviation silencieuse est le défaut le plus grave de ce dépôt.
7. **Tu mesures un bloc, pas une page.** Page de test dédiée, bloc seul, en-tête masqué.

## Les 12 étapes

### 1. Lire, avant d'écrire
- `proposals/<Set>/figma-proposals.md` en entier. Classer chaque note : *adopté tel quel* /
  *renommé vers token existant* / *minté* / *décision* / *déviation nommée*.
- Le contrat actuel `contracts/<set>.contract.json` : ce que le bloc Odoo porte aujourd'hui (props,
  parts, `data-pqr-part`), pour ne rien casser côté édition.
- `integrations/odoo/config/<set>.authoring.json` : les verdicts d'édition existants.

### 2. Le contrat 2.x.0, depuis la proposition
- Partir de `proposals/<Set>/<set>.contract.proposed.json`. Garder : `presentation` (enum 4 valeurs,
  **défaut = première variante du set**, la parité l'exige), `layoutByProp`, `tokensByProp`,
  `literalsByProp`, les tokens de texte (`typography.h1.*`, `typography.h2.*`, …).
- Reprendre du contrat actuel : `semantics.element` (`section`), les props de contenu et leurs
  bindings, les descriptions, les parts d'image (`Background`, `declared` position/object-fit), les
  ancres `code`.
- Ancres Figma : `componentSetKey` + `nodeId` du **set 031** (dans le dump, `key` et `nodeId`).
- Largeurs 390/668/1200/1728 proposées comme tokens de largeur : **témoins, pas des tokens**.
  Le root garde `layout.width: "fill"` + `referenceWidth: 1728`. Supprimer les `imported.*.root.width.*`.
- Hauteurs fixes : garder `height` dans le contrat (fidèle) ; c'est le CSS Odoo qui en fait un
  `min-height` (Odoo force `height: auto` sur les sections sous 768).
- Voiles / dégradés : `literals` + `literalsByProp` par présentation, chaque valeur inscrite dans
  `contracts/named-literals.registry.json` (pointeur exact, provenance, date), sinon `geometry:gate` refuse.
- Ce qu'une **part instance** (`component`) ne peut PAS porter — refusé par le validateur :
  `layoutByProp`, `tokensByProp`, `literalsByProp`, `stylesWhen`, `declared`. Placement d'un CTA,
  icône par mode, ordre de peinture au-dessus d'un voile : **fait code-only**, dans ton CSS Odoo,
  nommé dans la description de la part et dans le journal.
- Version : MAJOR si les ancres changent de set ou si un prop disparaît ; MINOR sinon.
- `npm run build` : le schéma valide par nom. Lire chaque refus, ne pas contourner.

### 3. Les miroirs Odoo (mécanique, tous obligatoires)
- `integrations/odoo/config/<set>.authoring.json` : toutes les épingles `"id": "ds.<set>", "version"`
  → nouvelle version ; un contrôle pour `presentation` (`fixed-by-composition`, `none`) ; un verdict
  pour chaque prop/part nouvelle. `npm run odoo:authoring:check` liste ce qui manque.
- `integrations/odoo/config/figma-panels.json` : la version du panneau.
- `views/components.xml` : `data-ds-contract-version` du bloc. Ne touche PAS au digest à la main.
- **Le digest est global et appartient à l'orchestrateur** : ne lance pas `check-inputs --repin`,
  ne modifie ni `inputs.lock.json`, ni `version_guard.js`, ni `scan-saved-versions.ts`, ni
  `cases.json`. Ton `npm run build` peut rester rouge sur l'étape derivation-report pour cette seule
  raison : note-le, c'est attendu.

### 4. Le CSS Odoo par écran, à la main, depuis le contrat
- **Un fichier à toi** : `integrations/odoo/addons/piqueray_ds/static/src/css/responsive/<set>.pqr.css`
  (l'orchestrateur l'ajoute au bundle après `components.pqr.css`).
- Forme fixe, toujours la même :
  ```
  base = Mobile (déjà dans components.pqr.css)
  @media (min-width: 768px)  { … Tablette … }
  @media (min-width: 992px)  { … Desktop … }
  @media (min-width: 1400px) { … Wide … }
  ```
  Chaque bloc recopie les déclarations que `components.pqr.css` émet pour la classe
  `.<bloc>--presentation-<mode>` (racine et parts). Même vocabulaire (`var(--pqr-…)`), rien d'autre.
- La typographie n'a rien à faire ici : `tokens.pqr.css` porte déjà ses blocs `@media`.
- `height` du contrat → `min-height` (Odoo force `height:auto` sous 768).
- Les faits code-only (CTA épinglé, icône masquée, ordre de peinture) : dans ce fichier, chacun avec
  un commentaire qui dit pourquoi le contrat ne peut pas le dire.
- **Un bloc `@media` borné** (`(min-width: 768px) and (max-width: 991.98px)`) pour tout ce qui ne doit
  vivre qu'en tablette — le hero a perdu une heure sur un `left: 48px` non borné.
- Ne t'appuie jamais sur les classes de padding de l'éditeur (`pt64`) : elles sont en `!important`.

### 5. Le QWeb, seulement si le DOM doit changer
- Une icône présente sur certains modes seulement : elle doit être **dans le DOM** (toujours rendue),
  masquée par `@media`. C'est une ligne de QWeb + une recomposition de page.
- Une zone de titre avec saut de ligne : `data-pqr-marks="line-break"` (zone riche, marque unique).
  La toolbar ne propose Gras que si `strong` est dans la liste.

### 6. La page de test
- `integrations/odoo/authoring/pages/<set>-test.json` : `url: "/<set>-test"`, le bloc seul, le
  contenu de la home. Copier la section depuis `home.json`.
- Si le contenu de la home doit changer (saut de ligne, texte), c'est du **contenu** : dans
  `home.json` ET dans ta page de test, jamais dans le contrat.

### 7. Déploiement (instance de l'orchestrateur, protocole)
- Une seule instance jetable partagée, projet `piqueray-odoo-pilote`, port **8087**. Les agents ne
  lancent ni `-u piqueray_ds`, ni `docker restart` : ils déposent, l'orchestrateur déploie par lots.
- Après déploiement : `npm run odoo:page -- <set>-test piqueray-odoo-pilote`.

### 8. La mesure
- Capture : `.page-parity/capture-hero.mts` généralisé (`capture-bloc.mts <baseUrl> <outDir> <selector> <url>`)
  — viewport = largeur témoin, clip = boîte du bloc, en-tête et autres blocs masqués.
- Comparaison : `npm run images:compare -- --before planches/<Set>-<w>.png --after odoo/<w>.png --out …`.
  Refuse deux tailles différentes : une hauteur différente est déjà un écart, nommé.
- Triptyque **pleine taille** : `.page-parity/triptych-full.mjs` (l'instrument recadre sur la zone
  de différence, illisible quand l'écart est petit).
- Diagnostic avant de conclure : `.page-parity/bands.mjs` (luminance par bande : un voile ?),
  `.page-parity/pair.mjs` (paire découpée à l'échelle 1), une sonde Playwright des boîtes
  (`probe-cta.mts` : positions réelles vs planche).

### 9. Lecture des triptyques : nommer chaque écart
Pour chaque largeur : la cause, et où elle vit. Les causes vues sur le hero, dans l'ordre où elles
sont apparues :
1. un **voisin qui déborde** dans la capture → page de test bloc seul ;
2. les **voiles** du contrat hérités de l'ancien master → lire les stops sur le set 031, `literalsByProp` ;
3. un **saut de ligne** absent/présent → contenu (`<br/>`), texte riche, zone `line-break` ;
4. un **bouton sous le voile** → ordre de peinture, fait code-only ;
5. un **décalage** → une règle `@media` non bornée ;
6. un **libellé de bouton** 16 vs 18 en wide → le style « Libellé bouton » est responsive (réglé une fois
   pour tous, contrat Button 2.1.0) ;
7. le **lissage du texte** → résidu, pas un défaut.

### 10. L'édition
- Un contrôle par prop, un verdict par part. Test à l'écran : éditer, enregistrer, rouvrir
  (`.page-parity/edit-linebreak.mts` comme modèle : session rédacteur, `enterEditor`, save RPC 200,
  relecture publique).

### 11. Le journal de section
`specs/tiny/vague-031/<set>.md` : faits datés, valeurs relevées, écarts par largeur avec cause,
déviations nommées, **À corriger à la source (Figma)**, **Bloqué / à trancher**, mesure finale.

### 12. Livraison
Fichiers touchés listés (contrat, authoring, panneau, QWeb, CSS, page de test, journal, mints), les
4 triptyques, les 4 chiffres, la liste des déviations. Rien n'est committé par l'agent.

## Pièges connus (chacun a coûté du temps le 2026-09-02)

- La commande `grep` de ce shell est une fonction qui rend vide sur les gros fichiers : `/usr/bin/grep`.
- Les ports 9223–9229 sont squattés par les serveurs figma-console (IPv6) : un `localhost:9226` répond
  404 depuis un autre serveur. Récepteurs locaux sur 9230+.
- Odoo : `section { height: auto !important }` sous 768 ; `ptN/pbN` en `!important` ; l'aperçu mobile
  de l'éditeur ≈ 370–400 px ; pas d'aperçu tablette (redimensionner la fenêtre).
- La garde de saisie déplie tout `<br>`/`<strong>` non autorisé **à l'enregistrement** : ce qu'on voit
  pendant l'édition n'est pas ce qui est sauvé.
- `emit-react` casse sur un retour de ligne dans un défaut de prop **texte simple** (un riche va bien).
- `figma:plan` refuse deux styles de même recette : un style responsive n'est monté que par un texte
  lié à son propre token.
- Le sync tokens ne connaît pas la collection Responsive : ne jamais le lancer sans l'orchestrateur.
- Un cliché de parité périmé rend vert un canvas qui a bougé : rafraîchir avant de conclure.

## Ce que l'orchestrateur fait, et seulement lui
Figma (écritures, dumps, planches) · tokens partagés et mints en collision · digest/lock/golden/reçus ·
bundle du manifeste (`responsive/*.pqr.css`) · déploiement sur l'instance · fusion des worktrees ·
séance de lecture des triptyques avec l'owner.

## Complément du 2026-09-02 (soir) — appris sur SAV et Presentation

- **Un set peut porter deux formes** (SAV : Wide = ancien master avec un cadre en plus). L'extraction le dit
  (« present in 3/4 variants », parts renommées `row2`, `background2`). Modéliser la forme MAJORITAIRE, remonter les
  faits du cadre orphelin sur son parent, nommer, et lister la variante dans « À corriger à la source ».
- **Une section n'est pas forcément pleine largeur** (Presentation en Wide : 1287 borné, padding 0, centré par la
  page). Le contrat porte la largeur bornée ; le CSS fait `max-width` + centrage ; la mesure se fait sur la largeur
  du bloc, pas sur 1728.
- **Directions inversées** : `row-reverse` / `column-reverse` seulement dans `layoutByProp` (override), jamais en base.
  L'anatomie garde l'ordre des enfants de la variante par défaut (mobile).
- **Photos** : un `IMAGE` avec transformation (CROP, ou FILL avec `imageTransform`) n'a pas d'orthographe CSS. Porter
  `object-fit` (FIT = contain, FILL = cover), nommer l'écart, et laisser l'outil image natif d'Odoo au rédacteur
  (`data-pqr-native-image="1"` sur l'`img`, verdict `directly-editable` média).
- **Mesure** : `.page-parity/mesure-bloc.mjs <planche> <odoo> <outDir>` aplatit la planche (transparence → blanc,
  sinon les marges comptent comme écart), aligne les hauteurs, sort le triptyque et le %. Une différence de hauteur
  est rapportée, jamais masquée.
- **Descriptions** : jamais un token entre accolades dans une description (`emitters:check` le lit comme non résolu).
- **Aucun `git checkout --` sur un fichier partagé** (tokens, verrou) : les ajouts du jour ne sont pas committés
  pendant la vague. Reçu : 11 tokens perdus et reconstruits depuis le CSS construit, 2026-09-02 18h30.
- **Digest global** : chaque contrat livré le fait bouger ; l'orchestrateur re-pinne et propage aux 4 miroirs
  (components.xml ×14, version_guard, scan-saved-versions, cases.json) après CHAQUE fusion, pas seulement à la fin.
- **La graisse d'un texte riche se lit par PLAGE et par VARIANTE**, jamais par le mint de l'extraction (SAV : Regular
  en Mobile/Tablette, Medium en Desktop/Wide ; l'extraction avait minté 500 partout). Lecture : `getStyledTextSegments`
  via l'orchestrateur, ou le rapport « typography varies across variants ». Si la graisse varie par mode → token
  responsive (`typography.body.weight`, fait une fois pour toutes le 2026-09-02).
- **Un `<img>` absolu ne s'étire pas par ses insets** : components.pqr.css lui met `width: 100 %`. Un plan de fond
  dessiné DANS le padding se porte en `width: calc(100% - 2 × inset)`, jamais en `left/right` seuls (SAV : 24 px
  de fuite à droite, 1728 passé de 15.6 % à 1.1 % une fois corrigé).
- **Un saut de ligne absent sur une variante** se voit au triptyque comme « une ligne de plus » et un CTA décalé de
  la hauteur d'une ligne. Vérifier les caractères du texte par variante (LF / U+2028) avant de chercher un padding.
- **Lire chaque triptyque avec l'owner, chiffres à l'appui** : positions sondées (`probe-sav.mts`) avant de
  conclure « rendu texte ». Trois fois ce soir la cause réelle était ailleurs (fuite du fond, graisse, source).
