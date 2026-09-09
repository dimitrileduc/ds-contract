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
