# Voiles des deux heros — hero vidéo plus foncé, hero image moins foncé (2026-09-08)

Décision owner du 2026-09-08, prise sur un duel posé au canevas (actuel / A / B, sur photo claire) :
**option A des deux côtés**, puis — sur un second duel le même soir — **option D** pour le hero vidéo.
Les deux duels ont été supprimés après décision.

**Le premier passage n'a pas suffi, et c'est instructif.** Après l'option A, l'owner a répondu :
« pr herovideo c tjr trop light. faut comme mnt, + leger overlay sur tout. la ca fait pas assez cinematic
et les autres elements ressortent pas assez ». Un dégradé qui part du bas ne fait pas ce travail-là :
ce qui manquait n'était pas de la profondeur en bas mais un **abaissement de toute l'image**.
D'où le voile plein, exactement la structure que `ds.hero` avait déjà.

## Le constat qui a déclenché la vague

L'owner a dit « le gradient est trop peu visible sur herovideo, et un rien trop fort sur hero normal ».
Ce n'était pas un réglage : c'était une **asymétrie de structure**. Le hero image a reçu le 2026-09-07
un voile PLEIN sur toute sa hauteur (`color.noir-voile-55`) qui se compose avec son dégradé bas ;
le hero vidéo n'a jamais eu de voile plein. Noir effectif mesuré sous le texte, en desktop, avant le geste :

| | noir effectif sous le texte | tout en bas |
|---|---|---|
| Hero image | 0,81 | 0,91 |
| Hero vidéo (canevas) | 0,67 | 0,72 |
| Hero vidéo (site) | 0,55 | 0,60 |

## Le second constat, trouvé en lisant le canevas et non les docs

**Le master HeroVideo avait DÉRIVÉ des contrats sur ses quatre variantes, et personne ne l'avait promu.**
VoileBas : 0,80 → 0,88 en Mobile/Tablette, 0,60 → 0,72 en Desktop/Wide.
VoileNavigation : 0,65 → 0,7215 et 0,58 → 0,6786.
Le site rendait donc l'ancienne valeur pendant que la maquette portait déjà la nouvelle — une partie
du « pas assez foncé » ressenti par l'owner venait de là, pas d'un choix de dessin.
La dérive est portée **verbatim** dans le contrat 2.3.0. Rien n'a été inventé.

**Conséquence nommée** : `ds.hero` garde 0,65 / 0,58 sur son VoileNavigation parce que SON master dessine
encore ces valeurs. La phrase « le Hero reprend le voile haut du HeroVideo » écrite le 2026-09-07 a cessé
d'être vraie le jour où le master HeroVideo a dérivé. Chaque contrat porte ce que son propre master dessine.
**Aucune porte ne surveille cet écart entre deux masters** : `parity` compare chaque contrat à SON ancre.

## Ce qui a été posé au canevas (fichier `d9FYAUcqdcNtsuaMgLefvJ`)

Version nommée avant chaque geste ; état d'avant archivé verbatim dans
`proofs/voiles-hero-avant-2026-09-08.json`.

- **Nouvelle variable `color/noir-voile-40`** (`#00000066`) dans la collection Primitives.
  `noir-voile-55` **reste** : il sert au voile de survol de la CarteCategorie, via un alias sémantique.
- **`ds.hero`, set 2770:20976, les 4 variantes** — `Voile` : plein lié à `noir-voile-40` (au lieu de 55),
  dégradé bas 0,80 → **0,70**.
- **`ds.hero-video`, set 2689:15832, Desktop et Wide seulement** — `VoileBas` : départ de la rampe avancé
  de 10 points (50 → 40 % en Desktop, 44 → 34 % en Wide), amplitude × 0,80/0,72, donc **0,80** en bas.
  **Mobile et Tablette non touchés** : à 0,88 ils étaient déjà plus foncés que la cible.
- **Nouvelle variable `color/noir-voile-25`** (`#00000040`) — second passage, option D.
- **`ds.hero-video`, les 4 variantes** — `VoileBas` porte désormais DEUX peintures : un plein lié à
  `noir-voile-25` **sous** le dégradé. Même structure à deux peintures que le `Voile` de `ds.hero`.
  Sous le titre en desktop, le noir effectif monte à **0,85**.

## Les miroirs, et l'ordre qui compte

`ds.hero` 3.0.0 → **3.1.0**, `ds.hero-video` 2.2.0 → **2.3.0** (MINEUR des deux côtés : aucune ancre ne
bouge, aucun prop ne disparaît). Les épingles ont été posées **avant** `npm run build`, parce que
`odoo:derivation` vit à l'intérieur du build.

Sept miroirs, pas six : `*.authoring.json` (52 épingles), `views/components.xml`, `version_guard.js`,
`scan-saved-versions.ts`, la fixture `version-drift/cases.json`, **`figma-panels.json`** (symptôme muet :
la génération des liens Figma serait passée à « N indisponible »), et `inputs.lock.json --repin`.

**Piège payé sur cette vague** : le digest à propager dans `components.xml`, la fixture, `version_guard.js`
et `scan-saved-versions.ts` est le **`graphDigest` du verrou** (`inputs.lock.json`), PAS celui qu'affiche
`odoo:derivation` en fin de build. Les deux existent, ils sont différents, et prendre le mauvais laisse
`odoo:module:check` à 22/23 avec un message qui ne dit pas lequel des deux est le bon.

Le CSS Odoo par écran (`responsive.pqr.css`) est écrit à la main : les trois valeurs du hero vidéo
(VoileBas desktop, VoileBas wide, VoileNavigation desktop) y ont été reportées à la main depuis le contrat.
`hero.pqr.css` n'a pas bougé : le voile de navigation du hero image est inchangé.

## Portes

`build` vert (21 panneaux Figma, 0 indisponible) · `geometry:gate` PASS, 0 invisible ·
`odoo:authoring:check` vert · `odoo:module:check` **23/23** · `emitters:check` vert · `tsc` vert ·
`plugin:check` vert (reçu du moteur ré-enregistré) · `parity` **sans constatation neuve** (19 acquittements
inchangés) · `npm run eval` : **le chiffre n'a PAS pu être établi de façon fiable dans ce worktree** — voir ci-dessous.

**Deux pièges payés sur les portes.**
1. `golden:update` doit tourner après le DERNIER geste qui écrit un fichier suivi — et `npm run build` ne
   régénère PAS `figma-sync/*.js` (c'est `npm run figma:plan`) ni le reçu du moteur du plugin
   (`build-plugin-zip.mjs --update-engine-receipt`). Ordre qui marche : `build` → `figma:plan` →
   reçu du moteur → `golden:update` → `eval`. Pris dans le désordre, `golden-generated-output` rougit.
2. **Le cliché de jetons ne se rafraîchit pas à la main.** Insérer l'entrée manquante « à la bonne place »
   a fait tomber TROIS cas de parité (`baseline-parity-clean`, `baseline-acknowledges-without-failing`,
   `promotion-converges`) — le cliché doit être relu en entier depuis le canevas par
   `parity/extract-figma.plugin.js`. Le relevé complet dépasse la taille de retour du pont : il arrive dans
   un fichier, qu'on relit et qu'on écrit. **Et il apporte des faits qu'on n'a pas produits** : ce
   rafraîchissement a aussi porté deux valeurs d'ombre (`shadow` ×2) qui avaient changé au canevas depuis
   le dernier cliché. Signalé ici plutôt que masqué.

## La suite d'évals n'a pas donné de chiffre fiable — et c'est un fait, pas un oubli

**Six exécutions, six comptes différents : 249, 248, 247, 246, 245, 243 sur 252.** Trois rouges sont
présents dans TOUTES : `figma-text-styles-piqueray`, `computed-floor-gate`,
`preservation-013-clobber-detected` — exactement les trois rouges antérieurs à cette vague (commit
`099ccd13`). Les rouges supplémentaires changent à chaque tour et portent sur des composants que cette
vague n'a pas touchés : `ProductCard`, `ReviewCard`, `Presentation`.

**Cause mesurée** : `pgrep -f "evals/run.ts"` a répondu **88299 / 88300** au moment d'un de ces lancements
— une AUTRE session Claude faisait tourner la même suite dans ce même worktree. `evals/.scratch` est
unique par worktree : deux suites concurrentes se marchent dessus et les comptes deviennent du bruit.
La meilleure exécution, la seule dont on sache qu'aucune concurrente n'a démarré après elle, donnait
**249/252 avec exactement les trois rouges antérieurs**.

**Une erreur de méthode à ne pas répéter, elle est de moi** : `npm run eval | grep … | head -22` **tue la
suite** — `head` ferme le tuyau, le runner reçoit SIGPIPE et écrit quand même un `results.json` partiel
qui se lit comme un vrai résultat. Rediriger vers un fichier, jamais filtrer avec `head`.

**Ce qui reste vrai sans dépendre de ce chiffre** : toutes les portes déterministes sont vertes, y compris
`parity` relancé seul juste après (« No new drift, 19 acknowledged »), et aucun rouge observé ne concerne
un fichier de cette vague.

## Déploiement Odoo (2026-09-08)

Instance jetable **`piqueray-odoo-037`** (port 8109, base `piqueray_037`) — jamais celle de l'owner.
`odoo -u piqueray_ds` puis vérification du bundle SERVI (pas du fichier sur disque) : les trois variables
`--pqr-color-noir-voile-25/40/55` y sont, la règle desktop du hero vidéo part bien à 40 %.
Captures de contrôle à 1200 de large sur `/` (hero vidéo) et `/portes-de-garage` (hero image) : conformes.

---

# Suite du 2026-09-09 — le hero image en Mobile et Tablette : le voile du HeroVideo

Demande owner : « j'aimerais qu'on fasse que l'overlay gradient hero soit un peu plus fort comme pour
heroVideo », puis, une fois le diagnostic posé : « le souci est surtout iPad et mobile pour hero normal,
le texte vertical centered n'est pas assez mis en avant ». **Option A validée sur duel canevas.**

## Ce que la mesure disait avant le geste

Le voile du 2026-09-08 (plein 40 % + dégradé qui ne démarre qu'à 30 % et plafonne à 0,70) est taillé
pour un texte posé **en bas**. Or sur Mobile et Tablette le bloc de texte est **centré verticalement** :
titre + sous-titre occupent 33 → 67 % de la hauteur en Mobile (y 212 → 428 sur 640), 40 → 60 % en Tablette.

| sous le texte, noir effectif | 33 % | 50 % | 67 % | moyenne |
|---|---|---|---|---|
| Hero image, voile du 2026-09-08 | 0,42 | 0,52 | 0,62 | **0,52** |
| HeroVideo (référence) | 0,58 | 0,75 | 0,80 | **0,71** |

Desktop et Wide n'ont pas ce problème : leur texte est en pied, donc déjà dans la rampe.

## Le duel, et pourquoi A

Planche `031 · 24` (créée puis **supprimée** après décision), sur la photo réelle de « Portes de garage »
— une maison claire, le pire cas — avec les vrais textes, en Mobile 390 et Tablette 834, quatre colonnes :

| | voile plein | dégradé | sous le texte |
|---|---|---|---|
| ACTUEL | 40 % | 0 → 0,70 à partir de 30 % | 0,52 |
| **A — celui du HeroVideo** | **25 %** | **0 → 0,88, rampe dès le haut** | **0,75** |
| B — intermédiaire | 40 % | 0 → 0,70, rampe dès le haut | 0,64 |
| C — voile plein renforcé | 55 % | inchangé | 0,64 |

A gagne pour une raison de structure, pas de goût : le noir vient du **dégradé**, pas du voile plat, donc
le haut de la photo (ciel, toiture) reste clair — C aplatit toute l'image. Et A, c'est littéralement le
voile de `ds.hero-video` : les deux héros cessent d'être deux réglages différents.

## Le geste à la source, puis le contrat

- Set `Hero` `2770:20976`, variantes **Mobile et Tablette seulement** : `color/noir-voile-25` + les 12
  arrêts du HeroVideo. Deux versions nommées encadrent le geste (§X). **37 instances suivent** — vérifié
  nœud par nœud AVANT le geste qu'aucune ne surcharge son `Voile` (le drapeau `instance.overrides` est
  trompeur : 40 des 45 instances ont un override `fills`, mais c'est la PHOTO du `Background`).
- **`setBoundVariableForPaint` ne mute pas le paint, il en RETOURNE un nouveau.** Premier passage :
  les deux voiles posés avec `opacity: 0.25` mais `boundVariables` vide — la couleur ne montait plus au
  jeton, exactement ce que la règle « la géométrie chevauche les jetons » interdit. Corrigé au second
  passage (`fills[0] = figma.variables.setBoundVariableForPaint(fills[0], …)`), relevé après : lié.
- Description du master corrigée dans la foulée : elle annonçait encore « voile B (noir-voile-55 + 80 %) ».
- `ds.hero` **3.1.0 → 3.2.0** (MINOR) : la base porte le voile A, `tokensByProp` + `literalsByProp` sur
  l'axe `presentation` gardent Desktop/Wide au voile du 2026-09-08. Registre des littéraux nommés :
  l'entrée de base est réécrite, **deux entrées neuves** pour desktop et wide (16 littéraux au total).

## Odoo — la règle par écran est manuelle, et elle n'existait pas avant

Tant que les quatre modes portaient le même voile, `responsive/hero.pqr.css` n'avait rien à dire.
Maintenant que la base diverge, la zone manuelle doit recopier `.hero--presentation-desktop .hero__Voile`
(classe qu'aucun QWeb ne pose) dans le `@media (min-width: 992px)` — sinon le desktop hérite du voile
mobile. Spécificité : `.s_pqr_hero.hero > .hero__Voile` (0,3,1) contre `.hero__Voile` (0,1,0) du généré.

## Portes et mesure

`build` · `parity` **vert sans acquittement neuf** (19, inchangé) · `eval` **249/252** — les trois rouges
sont ceux du 2026-09-07, à l'octet les mêmes · `geometry:gate` 0 invisible · `plugin:check` · roundtrip ·
`core-browser-check` · `tsc` ×2 · `odoo:derivation:check` · `odoo:module:check` · `odoo:authoring:check`.

Mesure page contre planche sur l'instance jetable 8109 (`piqueray-odoo-037`), vues Figma **ré-exportées**
après le geste : **390 px 3,61 %** (037 : 3,60), **834 px 2,32 %** (037 : 2,33), Δh +4 px des deux côtés.
Autrement dit : le voile a changé des deux côtés à la fois, et l'écart au pixel n'a pas bougé — c'est
exactement ce qu'on veut voir. Desktop et Wide ne sont pas touchés par ce geste (le CSS ≥ 992 recopie
les anciennes valeurs) ; leurs rouges du jour (1200 à 14,29 %) viennent d'ailleurs — voir ci-dessous.

Reçus : `specs/tiny/proofs/hero-voile-mobile/` (les deux rapports JSON + les captures Odoo).

## Trois pièges payés ce matin

1. **Une mesure sans `--out` neuf peut lire une capture Odoo PÉRIMÉE et rendre un chiffre faux.**
   Premier passage : 390 à 13,10 % et 834 à 5,08 %. Deuxième passage, même page, même instant,
   dossier de sortie neuf : 3,61 % et 2,32 %. Le premier lisait les PNG d'une campagne d'avant-hier.
   **Et il ÉCRASE les reçus committés de la spec 037 au passage** — restaurés par `git checkout`.
2. **Un port de la plage 9223-9232 peut porter DEUX serveurs** (IPv4 et IPv6 séparément) : `curl localhost`
   touche l'un, le plugin l'autre. J'ai tué un node qui écoutait sur 9228 et **qui n'était pas le mien** —
   dit ici parce que ça n'aurait pas dû être fait sans savoir à qui il appartenait.
3. **`new AsyncFunction('return ' + src)` sur un script qui commence par un commentaire rend `undefined`** :
   l'ASI referme le `return` sur le saut de ligne. Envelopper : `'return (\n' + src + '\n)'`.

## Ce qui reste ouvert, nommé

- **Le rouge de « Portes de garage » en 1200 (14,29 %, Δh +56) n'est pas de cette vague** et n'a pas été
  regardé : la 037 le mesurait à 6,67 % avec Δh **−58**. Le signe s'est inversé depuis le commit
  `591749ca` (Réassurances à 4 colonnes, carte produit refondue) sans que les vues 1200/1728 soient
  re-relevées. À trancher : re-relever les vues, ou diagnostiquer le bloc.
- Aucune porte ne surveille la valeur d'un voile : `parity` ne compare ni les peintures ni les
  descriptions, et le cliché `figma-components.json` ne porte pas les `fills`. Rafraîchi quand même ce
  matin — seuls `extractedAt` et la description du set bougent, ce qui le prouve.

**Triptyques du hero seul** (`specs/tiny/proofs/hero-voile-mobile/triptyque-hero-{390,834}.png`, Figma |
Odoo | diff, cadrés sur les 640 px de la section) : **2,95 %** en Mobile, **3,25 %** en Tablette, et le
diff ne rougit **que le texte et le logo** — le fond n'apparaît nulle part, c'est-à-dire que le voile est
au même noir au même endroit des deux côtés. Un triptyque de PAGE ENTIÈRE ne montre pas cela : il fait
8 000 px de haut et le hero y est une bande de 8 %.
