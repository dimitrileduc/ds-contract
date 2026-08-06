# Research — 018 · Répliquer à la main une chaîne gouvernée en blocs Odoo 19

**Date des relevés** : 2026-08-06. Tout ce qui est chiffré ici a été **mesuré sur le dépôt**, pas
estimé. Tout ce qui concerne Odoo 19 est marqué par son statut : **lu** (dans le code source ou
la doc officielle) ou **confirmé** (sur une instance en fonctionnement) — et à ce stade, **rien
n'est confirmé**. C'est exactement ce que la spec existe pour changer.

Format : Décision · Pourquoi · Ce qui a été écarté et à quel prix.

---

## Partie I — Le dépôt

### D1 — Remettre la branche à niveau sur `main` avant tout montage

**Décision.** La première tâche du chantier est de **fusionner `main`** dans
`018-odoo-replique-manuelle`, puis de **re-relever** l'inventaire de la chaîne sur l'état fusionné
avant d'écrire une seule ligne de module.

**Pourquoi.** Ce worktree est basé sur `3c63c05` (post-015), et `main` contient déjà **toute la
spec 016**. Vérifié : `git merge-base --is-ancestor f39bbe0 HEAD` → **non** ;
`… main` → **oui**. Les entrées de 018 diffèrent, et pas à la marge :

| Entrée | ce worktree | `main` |
|---|---|---|
| `ds.button` | v1.6.0, variant `outilneNoir` | **v2.0.0**, variant `outlineNoir` — bump **MAJEUR** |
| `ds.presentation` | v2.1.0 | v2.2.0 |
| `ds.section-header` | v2.0.0 | v2.1.1 |
| `tokens/primitives.tokens.json` | — | 345 lignes changées ; 2 tokens de plus consommés par la chaîne (`size.presentation.col-gauche`, `size.section-header.root`) |

Le variant que `ds.section-header` passe à son bouton s'appelle `outilneNoir` ici et
`outlineNoir` sur `main` : monter le module sur cette base graverait la **coquille corrigée** dans
l'artefact de référence, et les volumes de FR-017 seraient mesurés sur un état de contrat qui
n'existe plus.

**Sur la lecture des Dependencies.** La spec dit « dans l'état où la spec 015 les a laissés ». Son
**intention** est « géométrie gouvernée, post-015 » — la propriété dont FR-005 dépend — et non une
épingle sur un commit. 016 conserve et étend cette propriété. Rebaser sert donc l'intention ;
rester ici la trahirait en la respectant à la lettre.

**Écarté.** Monter sur la base actuelle puis rebaser à la fin : le module aurait à être relu
intégralement contre trois contrats changés, et le rapport de décision aurait mesuré le mauvais
montage. Plus cher, et faux entre-temps.

### D2 — La 4ᵉ sortie de jetons : forme, emplacement, et surface de re-pin

**Décision.** `scripts/build-tokens.mjs` gagne une quatrième écriture : un fichier de propriétés
personnalisées CSS sur `:root`, **préfixé**, écrit **directement dans le module** sous la spec.
Interface complète : [`contracts/odoo-tokens-output.md`](./contracts/odoo-tokens-output.md).

**Pourquoi ce producteur.** Le pipeline est **sans dépendance** et sa règle de nommage est déjà
écrite (`cssName()` : chemin du token joint par `-`). Ajouter une quatrième cible, c'est réutiliser
la fonction pure existante avec un préfixe — pas écrire un deuxième compilateur de jetons.

**Pourquoi le vocabulaire en entier.** Les Assumptions l'exigent : produire seulement ce que les
trois composants consomment rendrait un quatrième composant impossible sans retoucher la sortie.
La carte compilée est celle qui alimente déjà `:root` — **222 propriétés** au relevé du 2026-08-06,
**231 après la fusion `main`** de D1. Le nombre se re-relève en T004 ; l'invariant I4 est une
bijection avec `:root`, donc il se vérifie sans jamais coder le compte.

**Surface de re-pin : zéro, et c'est vérifié.**

- `scripts/update-golden.mjs` ne parcourt que `src/` (tout) et `figma-sync/*.js` (hors `plugin`,
  hors `arrange.js`). **`specs/` n'y entre jamais** ⇒ la 4ᵉ sortie n'a aucune entrée dans
  `evals/golden.json`.
- `figma-sync/plugin/engine.receipt.json` dérive sur édition de tokens / contrats / icônes —
  **tous inchangés** ici.
- `examples/polaris/figma/*.figma.js` dérive sur édition d'**émetteur** — aucun émetteur touché.

Une tâche du chantier **vérifie ces trois non-dérives par exécution**. Si l'une tombe, elle est
consignée avec sa cause — jamais absorbée par un re-pin silencieux.

**Conséquence assumée.** `npm run tokens` acquiert une écriture **permanente** dans le dossier
d'une spec. Si 018 est un jour archivée ou déplacée, `npm run build` casse tant que
`build-tokens.mjs` n'est pas mis à jour. Le coût est nommé ici pour qu'il ne se relise pas plus
tard comme un oubli ; les alternatives (le dossier d'exemples, la transcription à la main, la
consommation de la sortie non préfixée) sont toutes rejetées par un FR explicite — voir
`contracts/odoo-tokens-output.md` §1.

### D3 — L'eval de la 4ᵉ sortie : une capacité, donc une eval avant sa phrase de doc

**Décision.** Un cas ajouté à `evals/run.ts`, famille **C1 (déterminisme)**, écrit **avant** que
`docs/03-token-pipeline.md` mentionne la quatrième sortie.

**Pourquoi.** « Le pipeline de jetons a une 4ᵉ sortie additive et préfixée » **est** une phrase de
capacité, et le Principe II ne connaît qu'un ordre : fixture → eval → claim. C'est aussi la seule
manière de prouver que la sortie est **dérivée** et non **recopiée une fois** — le contrôle
adversarial I5 du contrat d'interface (modifier une valeur source doit changer la sortie).

**Comment.** Le harnais d'eval fournit déjà le crochet : `evals/harness.ts:123` expose
`buildTokens = () => run(process.execPath, ['scripts/build-tokens.mjs'])`, exécuté dans une copie
de travail. Le cas y vérifie les sept invariants I1–I7.

**Écarté.** Ranger la 4ᵉ sortie dans `evals/golden.json` en étendant le parcours de
`update-golden.mjs` à `specs/` : ça mettrait un artefact de spec sous porte permanente, ce que
FR-015b refuse explicitement — et ça ferait de chaque spec future une source potentielle de
re-pins. L'eval dédiée prouve la même chose sans ce coût.

### D4 — `letter-spacing: 3px` : un littéral **nommé**, pas un token minté, pas un silence

**Le fait mesuré.** La chaîne porte **9 littéraux numériques**, tous typographiques. Sur le chemin
réellement emprunté (`presentation` passe `emphase: "moyen"`, `disposition: "standard"`,
`alignement: "gauche"`), **4 sont actifs** :

| Littéral | Contrat / part | Token de même valeur |
|---|---|---|
| `line-height: 24px` | `ds.presentation` / `wrapper.Texte` | `font.line-height.24` ✅ |
| `line-height: 25px` | `ds.section-header` / `Accroche` | `font.line-height.25` ✅ |
| `line-height: 40px` | `ds.section-header` / `Titre` (emphase `moyen`) | `font.line-height.40` ✅ |
| `letter-spacing: 3px` | `ds.section-header` / `Accroche` | **aucun** — `font.letter-spacing` ne contient que `15` ❌ |

**Ces littéraux sont légitimes, et la doc le dit.** La porte de 015
(`specs/015-…/contracts/geometry-gate.interface.md` §2) gouverne un ensemble **fermé** de canaux
de **mise en page** — `width · height · min-width · min-height · gap · padding-*`, plus
`background-image` en exception déclarée. La typographie n'y est pas. Le `RAPPORT-CLOTURE.md` de
015 le dit dans sa section « Ce que « 0 » ne dit pas », et `ROADMAP.md` range les « **89
littéraux** de trait, peinture et typographie » dans le travail **non assigné**. Ce n'est donc pas
un défaut de 018 : c'est un trou connu, documenté, et non encore fermé du vocabulaire.

**Décision.** Trois des quatre se rendent en **référence de token** — la valeur vient du
vocabulaire, seule la référence est écrite. Le quatrième, `letter-spacing: 3px`, est porté comme
**littéral nommé** dans un registre **local au module**, de la même forme que
`contracts/named-literals.registry.json` : `{ contractId, pointer, channel, value, reason,
decidedOn, receiptId }`, la `value` **épinglée byte-à-byte** contre celle du contrat.

**Pourquoi c'est la bonne lecture de FR-005 et SC-003.** La doctrine du dépôt est écrite mot pour
mot dans le registre de 015 : *« La doctrine vise zéro valeur **INVISIBLE**, pas zéro littéral. »*
Un littéral **nommé, épinglé et comparé** est conforme — c'est le régime exact des deux dégradés
du hero. FR-005 donne d'ailleurs sa propre raison : « écrire un nombre à la main réintroduirait
exactement la dérive que 015 a fermée » — et la dérive que 015 a fermée, c'est l'**invisibilité**,
pas la présence d'un nombre. SC-003 se rapporte donc ainsi, sans arrondi : **0 valeur invisible ;
1 littéral nommé, hérité du contrat, épinglé et surveillé.**

**Écarté — et c'est le point le plus discutable de la spec, donc écrit en entier.**

- **Minter `font.letter-spacing.3` dans `tokens/primitives.tokens.json`.** C'est la doctrine
  « géométrie en tokens » appliquée à la lettre, et ce serait le vrai correctif de fond. Rejeté
  ici pour trois raisons cumulées : (1) ce serait un **deuxième** point de contact avec le code du
  dépôt, alors que les Assumptions bornent explicitement ce contact à la sortie de jetons ; (2) le
  coût réel est de **trois re-pins** (`src/styles/tokens.css` et `figma-sync/01-tokens.js` dans
  `golden.json`, plus `engine.receipt.json`) **et** d'un acquittement de parité de plus sur l'axe
  `variables canvas ⟷ tokens/` — l'axe que 016 vient précisément de rebrancher ; (3) **aucun
  contrat ne référencerait ce token** : il serait minté pour servir un artefact écrit à la main,
  ce qui est l'inverse du sens de circulation du modèle. Ce correctif appartient à la spec des 89
  littéraux, pas à une spec de dérisquage — et il reste disponible, à ce prix nommé.
- **Ne pas l'exprimer du tout** (non-porté nommé, FR-014). Moins cher, et SC-003 resterait à 0
  sans discussion. Rejeté parce que ça **abîme la mesure** : un `letter-spacing` de 3 px sur une
  accroche en capitales de 20 px change visiblement la largeur de la ligne. La ligne de
  comparaison de `ds.section-header` porterait alors comme cause dominante **notre propre
  choix** — au lieu d'un fait sur Odoo. SC-006 demande une cause dominante par ligne ; en injecter
  une artificiellement viderait la US3 de son objet.
- **L'écrire en dur sans le déclarer.** C'est le défaut de sévérité maximale du dépôt. Jamais
  envisagé sérieusement, mentionné pour que la liste soit complète.

### D5 — Le harnais de mesure : le troisième harnais du même patron, jamais une extension de l'instrument gated

**Décision.** Un harnais **spec-local** qui (a) rend chaque contrat par `emitHtml`, (b) capture la
page Odoo, **les deux dans un `clip` de taille identique et épinglée**, puis (c) appelle
`npm run images:compare` **sans le modifier**. Protocole complet :
[`contracts/visual-comparison.md`](./contracts/visual-comparison.md).

**Pourquoi ce montage précis.** `images:compare` **refuse** deux images de tailles différentes
plutôt que de les redimensionner — délibérément, « because it would otherwise hide a visual
change ». Capturer chaque composant à sa boîte naturelle donnerait donc deux tailles et **aucun
pourcentage**. Le `clip` épinglé rend les tailles égales **par construction** : la comparaison
stricte s'applique telle quelle, et une différence de géométrie se lit en pixels de diff au lieu
de disparaître dans un refus.

**Prior art, vérifié avant de proposer quoi que ce soit** (règle du prior-art) :
`extract/figma/aplat-parity/render.ts` (spec 006, R11) est **exactement** ce patron — un deuxième
harnais qui importe `chromiumExecutable` et `embeddedFontFaces` depuis `visual-parity/render.ts`
**sans le modifier**, rend du HTML arbitraire à viewport épinglé, capture un `clip` fixe. Le
harnais de 018 est le **troisième** du même patron. `embeddedFontFaces` est d'ailleurs exporté
avec cette intention écrite : « for reuse … never re-implemented », parce qu'un harnais qui refait
son chargement de police retombe dans le bug daté du 2026-07-23 (Chromium substituait
silencieusement une police système pendant que `document.fonts.check` répondait « disponible »).

**Conséquence à porter jusqu'au module** : le module Odoo **doit servir les mêmes faces
Montserrat**. Sinon la comparaison oppose un repli système à la vraie police, et elle est fausse —
pas approximative, fausse. C'est l'invariant C7 du protocole.

**Écarté.** Étendre l'instrument de parité visuelle d'un canal Odoo : chantier de dépôt plus gros
que la spec **et** violation directe des Assumptions (une instance Odoo se retrouverait sur le
chemin d'une porte permanente). Une maille de comparaison par zone plutôt que par composant :
plus chère, sans rien apporter au rapport de décision.

### D6 — Où vivent le module et l'instrument — et le piège `tsconfig` nommé

**Décision.** Le module sous `specs/018-…/module/piqueray_ds/` ; l'instrument sous
`specs/018-…/harness/`, avec un **`tsconfig.json` spec-local** et un **self-test hors ligne**.

**Pourquoi.** FR-015b range l'artefact sous la spec — le patron de 003, 005 et 007, qui gardent
preuves et outils sous leur propre dossier. `examples/` est exclu par FR-015b : il est déjà touché
par les re-pins, un artefact que rien ne gouverne y deviendrait une source de faux rouges.

**Le piège, mesuré.** Le `include` du `tsconfig.json` racine est
`["src", "scripts", "core", ".storybook", "extract", "parity", "evals", "figma-sync/plugin/engine"]`.
**`specs/` n'y est pas.** Un instrument écrit là est donc **invisible à `npx tsc --noEmit`** — le
même trou que `evals/fixtures`, qui a déjà mordu ce dépôt (changer une signature partagée laissait
`tsc` vert et cassait `npm run eval` au runtime). Mitigation obligatoire, en deux temps : un
`tsconfig.json` spec-local qui étend la racine et n'inclut que le harnais, et un **self-test hors
ligne** sur fixtures — parce qu'un instrument que rien ne typecheck **et** que rien n'exécute est
un instrument dont on ne sait rien.

**Écarté.** Mettre le harnais dans `extract/` (couvert par le `tsconfig` racine) : ce serait un
**deuxième** point de contact avec le code du dépôt, contre l'Assumption explicite qui le borne à
un seul.

### D7 — Les 19 glyphes viennent du **registre**, jamais du répertoire

**Décision.** Embarquer exactement les **19 icônes** de `contracts/icons.registry.json` (v1.2.0),
résolues vers leur fichier `assets/icons/<asset>.svg`.

**Pourquoi c'est un piège réel.** `assets/icons/` contient **23 SVG** — `check`, `close`, `google`
et `google-wordmark` **ne sont pas gouvernés** par le registre. Embarquer le répertoire donnerait
23 glyphes et ferait rater SC-002 (« **19 glyphes** du registre gouverné embarqués ») tout en ayant
l'air de le dépasser. Le registre est la source ; le répertoire est un détail d'implémentation.

**Note de portée.** Le choix du glyphe est la **seule liaison par échange d'instance** de toute la
chaîne, et le seul franchissement de frontière d'un registre gouverné (FR-004b). Il doit être
**exercé sur l'instance**, pas seulement exprimé dans le module.

### D8 — Ce que la doc répond déjà, et ce sur quoi elle est muette

Consulté via auggie MCP avant toute décision de modélisation (Principe IX). Ce que les documents
répondent est repris tel quel ; ce sur quoi ils sont muets est **dit comme un silence**, pas
comblé par inférence.

| Question | Ce que la doc répond | Conséquence pour 018 |
|---|---|---|
| Quelles sont les sorties du pipeline de jetons ? | `docs/03-token-pipeline.md` : les passes et leur destination `:root` / `[data-theme]` | La 4ᵉ sortie s'y ajoute, et **ce document est bumpé avec elle** — après l'eval, jamais avant |
| Qu'est-ce qu'un émetteur, et que coûte-t-il ? | `docs/15-engine-as-library.md` : `{ name, label, emit(contract, ctx) → files[] }`, quatre enregistrés, `registerEmitter()` ouvre le registre | Le chiffrage de FR-018 s'adosse à ce modèle, pas à une intuition |
| Que vaut le précédent interne ? | `packages/emitter-web-components/src/emit-wc.ts` = **1353 lignes** (+196 et +255 pour ses deux contrôles) | Le « ~1350 lignes » des Dependencies est confirmé **à la ligne près** — avec la réserve déjà écrite : il produit **un seul** type de fichier, là où Odoo en demande trois |
| Comment un émetteur déclare-t-il ce qu'il ne porte pas ? | `docs/15` et le README de l'émetteur tiers : *« named no-ops, never silent drops »*, listés dans l'en-tête de chaque fichier émis | FR-014 n'invente rien : c'est le vocabulaire déjà imposé à tout émetteur, appliqué à un montage manuel |
| Combien d'axes a le différentiel ? | `docs/06-parity-loop.md` : **trois** — `code ⟷ contract`, `canvas ⟷ contract`, `canvas variables ⟷ tokens/` | Une **quatrième surface n'a aucun axe**. C'est le fait qui **fonde** FR-015, et pas une prudence de rédaction |
| Existe-t-il une doctrine documentée sur une cible CMS / serveur tiers / Odoo ? | **Rien, nulle part dans `docs/`** | Terrain neuf — et c'est la **doc** qui le dit, pas une déduction. À traiter comme tel : tout ce qui suit sur Odoo est une hypothèse jusqu'à l'instance |

### D9 — Le volume de référence, mesuré et non estimé (entrée de FR-017)

`core/samples/` contient les sorties `emit-html` **commitées** pour les trois composants :
`presentation.css` **231 lignes**, `section-header.css` **197**, `button.css` **118** (la CSS des
dépendances est incluse et dédupliquée dans celle du parent). Classes BEM préfixées par composant
(`button`, `button--variant-default`, `button__label`) plus un attribut `data-part`.

**Ce que ça donne au rapport de décision** : un dénominateur réel pour la « part mécanique ». Les
références de tokens y sont **sans préfixe** (`var(--font-family-montserrat)`), donc la CSS du
module n'est **pas** un copier-coller : c'est un renommage mécanique — mesurable comme tel, et
c'est précisément le genre de travail qu'un émetteur ferait à coût nul.

Détail moteur à connaître avant de relire cette CSS : la bordure passe par
`box-shadow: inset … var(--dsc-border-width) var(--dsc-border-color)` — des propriétés internes
au moteur, déjà préfixées `--dsc-`, qui ne sont pas des jetons.

---

## Partie II — Odoo 19

> **Statut de toute cette partie : LU, jamais CONFIRMÉ.** Elle vient de la lecture du code source
> d'Odoo 19.0 (branche `19.0`, version certifiée par `odoo/release.py` :
> `version_info = (19, 0, 0, FINAL, 0, '')`) et de sa documentation officielle. SC-009 en fait une
> exigence, pas une note de bas de page : aucun de ces faits ne peut être présenté comme acquis
> avant qu'une instance ne le confirme, et ceux qui ne le seront pas resteront marqués « non
> confirmé ».
>
> Chaque affirmation ci-dessous porte son chemin de fichier. Ce qui n'a pas pu être vérifié est
> **nommé comme non vérifié**, jamais lissé.

### D10 — Les noms techniques réels (la spec paraphrase, le plan nomme)

La spec paraphrase volontairement le vocabulaire d'Odoo pour rester lisible sans connaître le
produit. Voici la correspondance, vérifiée dans la source 19.0.

| Paraphrase de la spec | Mécanisme réel 19.0 | Source |
|---|---|---|
| « modèle » | vue QWeb déclarée par `<template id="…" name="…">` (raccourci d'un enregistrement `ir.ui.view`) | `reference/backend/data.rst` |
| « mécanisme d'appel entre modèles » | `<t t-call="module.template_id"/>`, contexte du parent hérité ; paramètres passés en attributs (`name.f="…"` = chaîne formatée, `name="…"` = expression) | `ir_qweb.py` `_compile_directive_call` (l. 2532–2645) |
| « bloc posable » | *snippet* déclaré par héritage `xpath` de `website.snippets`, `<t t-snippet="module.s_x" string="…" group="…">` | `addons/website/views/snippets/snippets.xml` |
| « panneau de blocs » | `<snippets id="snippet_groups\|snippet_structure\|snippet_content">` | idem |
| « réglage » | classe OWL `BaseOptionComponent` + classe `Plugin` enregistrée dans `registry.category("website-plugins")`, + un gabarit OWL XML | `addons/html_builder/static/src/core/builder_options_plugin.js` |
| « se branchent par classe CSS » | `static selector` (+ `static exclude`, `static applyTo`) sur le composant d'option | idem, l. 302–322 / 574–575 / 632–641 |
| « le cadre CSS d'Odoo » | Bootstrap **5.3.3**, chargé sans condition dans `web.assets_frontend` | bandeau de version de `addons/web/static/lib/bootstrap/js/dist/base-component.js` |
| « les variables de thème d'Odoo » | variables SCSS `$o-color-1..5`, alimentées par `web._assets_primary_variables` | `addons/web/__manifest__.py` l. 376–379 |

**Architecture 19.0, vérifiée par existence de branche** : `addons/html_builder/` **n'existe ni en
17.0 ni en 18.0** (404 sur les deux) et est bien **neuf en 19.0** ; l'ancien éditeur de snippets à
widgets jQuery (`web_editor/static/src/js/editor/snippets.editor.js`) **a disparu** en 19.0 (404).
`addons/website/__manifest__.py` en 19.0 dépend de `html_editor` **et** `html_builder`, et ne
dépend plus de `web_editor`. Pour notre module, `depends: ['website']` suffit — `html_builder`
arrive par transitivité.

**Profondeur d'imbrication** : la limite est réelle et chiffrée — `ir_qweb.py` `_render_iterall`
(l. 766–769) lève `RecursionError('Qweb template infinite recursion')` **au-delà de 50 cadres de
rendu**. Notre chaîne en a 3. Aucun risque, et le chiffre est connu au lieu d'être supposé.

**Un modèle non déclaré comme bloc peut être appelé par un bloc — CONFIRMÉ**, avec trois exemples
natifs vérifiés (`s_masonry_block`, `s_dynamic_snippet_template`, `website_search_box_input`),
chacun absent du registre `t-snippet` et appelé par un modèle qui, lui, y est. C'est un patron
courant de la source 19.0, pas une astuce.

### D11 — Deux prémisses de la session du 2026-08-06 sont RÉFUTÉES par la source 19.0

C'est le résultat le plus utile de cette phase : les trouver maintenant coûte une relecture ; les
trouver sur l'instance aurait coûté un chantier.

#### P1 — « Un seul marqueur, posé sur un conteneur, ferme d'un coup la suppression, la duplication et le déplacement de tout ce qu'il contient. » → **FAUX comme énoncé**

Vérifié dans la source 19.0 : **il n'existe aucun marqueur unique**. La fermeture se compose, et
les marqueurs de structure sont **par élément**, pas par sous-arbre.

| Marqueur | Ce qu'il ferme | Portée | Source |
|---|---|---|---|
| `oe_unremovable` | suppression **et** duplication (le clonage retombe sur la testabilité de suppression) | **l'élément lui-même** | `html_editor/…/core/delete_plugin.js` (`unremovableNodePredicates`) ; `html_builder/…/core/clone_plugin.js` (`isClonable(el) { return el.matches(clonableSelector) \|\| isRemovable(el); }`) |
| `oe_unmovable` | déplacement (la poignée disparaît) | l'élément lui-même | `html_builder/…/core/drag_and_drop_plugin.js` (`isDraggable`) |
| `o_not_editable` | **tous** les réglages, natifs comme tiers, **et** l'usage comme zone de dépôt | **sous-arbre** | `builder_options_plugin.js` (`checkElement`, l. 632–650) ; `drop_zone_plugin.js` (exclusion dure de `.o_not_editable *`) |
| `data-oe-protected="true"` | édition de contenu **et** mutations exclues de l'historique/normalisation/sauvegarde | sous-arbre, avec ré-ouverture locale possible par `data-oe-protected="false"` | `html_editor/…/core/protected_node_plugin.js` |

**Ce que ça change concrètement.** Le levier L1 reste **atteignable**, mais il se paie en balisage :
`o_not_editable` sur le conteneur ferme les réglages et le dépôt sur tout le sous-arbre, et il faut
**en plus** `oe_unremovable oe_unmovable` **sur chaque élément intérieur** que le rédacteur ne doit
pas pouvoir supprimer, dupliquer ou déplacer. Odoo fait exactement ça sur son propre
`s_dynamic_snippet` : `class="… oe_unremovable oe_unmovable o_not_editable …"`, les trois ensemble.

**Conséquence pour le rapport de décision (FR-017).** Ce balisage est **entièrement mécanique** —
il se dérive du contrat (toute part qui n'est pas une zone déclarée modifiable reçoit les classes)
— donc il gonfle le volume écrit **sans** gonfler la part de jugement. C'est précisément le genre
de fait que le rapport doit chiffrer, et c'est un argument mesurable **en faveur** d'un émetteur.
`oe_unmovable` n'est d'ailleurs **pas documenté** comme entrée propre dans la doc officielle
(`building_blocks.rst` ne documente que `o_not_editable` et `oe_unremovable`) : il est réel,
employé par Odoo, mais non engagé — exactement la réserve que la spec formulait déjà.

**Fait favorable trouvé au passage** : rien n'est zone de dépôt par défaut. Le mécanisme
`dropzone_selector` est une **liste blanche** (`drop_zone_plugin.js`) — un conteneur qui ne
s'enregistre pas et n'imite pas les sélecteurs génériques d'Odoo (`.oe_structure`, `.row > div`)
n'accepte aucun dépôt. Ne rien faire est ici la bonne action ; `o_not_editable` est la ceinture.

#### P2 — « Nos noms de variables actuels n'entrent en collision avec aucun des noms testés parmi ceux qu'Odoo publie. » → **vrai, mais pour une raison qui rend la conclusion fragile**

Vérifié : Odoo 19 force `$variable-prefix: ''` dans **trois** fichiers indépendants
(`addons/website/static/src/scss/bootstrap_overridden.scss` l. 29,
`addons/web/…/bootstrap_overridden.scss` l. 51, `addons/html_editor/…/bootstrap_overridden.scss`
l. 6), chargés **avant** le `_variables.scss` de Bootstrap — la sémantique `!default` fait gagner la
chaîne vide. **Sur une page Odoo 19, les propriétés personnalisées de Bootstrap ne s'appellent donc
pas `--bs-primary` mais `--primary`**, `--body-bg`, `--border-radius`, `--box-shadow`,
`--font-sans-serif`… Et Odoo publie lui-même des noms nus : `--header-font-size`, `--base-white`,
`--base-100`…`--base-900`, `--palette-names`, `--headings-font`.

Relevé de nos propres noms contre cette surface : **aucune collision exacte aujourd'hui** — nos
familles sont `--color-*`, `--space-*`, `--font-*`, `--size-*`, `--radius-*`, `--border-width-*`,
plus `--nav-state` et `--opacity-base`. Les voisinages les plus proches (`--radius-32` contre
`--border-radius`, `--font-size-16` contre `--header-font-size`) ne se touchent pas.

**Mais la conclusion à en tirer est l'inverse de rassurante** : l'espace de noms non préfixé est
**occupé, dense, et généré par des boucles `@each`** sur les palettes de couleurs et de gris — le
nombre de noms produits n'est pas stable d'une version à l'autre. Un design system tiers ne peut
pas parier sur ce terrain. **FR-008 est donc vérifié comme nécessaire**, pas comme une précaution
de principe. Le préfixe retenu **ne doit être ni `o-`** (convention d'Odoo lui-même) **ni `bs-`**
(nom que Bootstrap portait avant qu'Odoo ne le supprime — le réintroduire serait un piège de
lecture).

### D12 — Le cadre CSS d'Odoo : ce qui traverse, et le piège `@layer`

**Ce qui traverse — confirmé.** Bootstrap 5.3.3 est importé sans condition dans
`web.assets_frontend`, et `import_bootstrap.scss` importe `reboot` inconditionnellement. Le reboot
agit sur les **balises nues** — sélecteur universel `*, *::before, *::after { box-sizing:
border-box; }`, `ul, dl { margin-top: 0; margin-bottom: 1rem; }`, `a { color: …; text-decoration:
… }`, `button { border-radius: 0; }`. Il s'applique donc à nos composants même s'ils n'emploient
aucune classe Bootstrap. C'est exactement le risque que la US3 existe pour mesurer.

**Le piège, et il aurait coûté une journée.** Odoo 19 **n'emploie `@layer` nulle part** (0
occurrence dans tout `odoo/odoo`) et `:where()` non plus (0 occurrence). L'idée réflexe — « on met
notre CSS dans une couche pour l'isoler » — **ferait perdre** : les déclarations **non
superposées** l'emportent sur toute couche. Mettre notre CSS dans un `@layer` le ferait perdre
contre le reboot d'Odoo, qui n'est dans aucune couche. **Décision : pas de `@layer`.**

**Ce qui marche, et pourquoi.** Nos composants portent leurs propres classes (FR-006), et une règle
de classe (spécificité 0-1-0) l'emporte sur une règle de type du reboot (0-0-1). Poser le style sur
nos classes suffit donc, sans bataille globale — ce qui est précisément la portée bornée que FR-007
demande. Les propriétés **héritées** (famille, hauteur de ligne, couleur) restent le point de
vigilance : elles doivent être posées explicitement sur la racine de chaque composant, ce que les
contrats font déjà (`font-family` sur les racines de `ds.presentation` et `ds.section-header`).

**Ce qui n'existe pas, et il faut le dire** : Odoo 19 n'offre **aucun mécanisme de première partie**
pour isoler du CSS tiers sur une page publique. L'iframe employée par le builder n'isole que
l'édition, jamais la page que voit un visiteur. C'est une **absence constatée après recherche**,
pas un engagement d'Odoo à ne rien offrir — nuance à garder telle quelle.

### D13 — L'éditabilité durable : la prémisse défavorable est CONFIRMÉE, et précisée

Vérifié, et c'est pire que « un attribut est effacé » : **deux** couches transitoires sont effacées
à chaque enregistrement.

- `contenteditable` — `html_editor/…/core/content_editable_plugin.js` `cleanForSave()` supprime
  l'attribut sur tout ce que désigne `contenteditable_to_remove_selector`, et html_builder fixe ce
  sélecteur à **`"[contenteditable]"`**, c'est-à-dire littéralement tout.
- `.o_editable` — `html_builder/…/core/setup_editor_plugin.js` `cleanForSave()` retire la classe de
  la racine et de tous ses descendants.

**Écrire `contenteditable="true"` ou `class="o_editable"` dans un gabarit de snippet ne produit donc
rien de durable** — les deux disparaissent au premier enregistrement.

**Le mécanisme durable, nommé.** Le texte d'un snippet posé dans une zone déjà éditable est
modifiable **automatiquement, sans aucun attribut ajouté à la main**, dès qu'il tombe sous les
sélecteurs par défaut : `section > .container`, `section > .o_container_small`,
`section > .container-fluid`, `.o_editable`
(`html_builder/…/core/builder_content_editable_plugin.js`). Si notre balisage niche du texte hors
de ces défauts, le point d'extension supporté est une **contribution de ressource** depuis un
`Plugin` : `resources = { content_editable_selectors: [".s_…  .mon_texte"] }`.

**Conséquence de conception, à porter dans le montage** : structurer nos gabarits en
`<section class="s_…"><div class="container">…</div></section>` fait tomber le texte sous les
défauts et **évite d'écrire du JavaScript pour l'éditabilité**. C'est un choix de balisage qui
achète une réduction de coût réelle, et il est mesurable — donc il appartient au rapport.

**Réserve honnête** : cette mécanique (`data-oe-*` / `.o_editable` / `contenteditable`) n'est
documentée **nulle part** dans la doc officielle 19.0 ; elle est établie **par la source seule**.
Elle entre donc dans la catégorie que la spec nomme déjà : réelle, employée par Odoo, non engagée.

### D14 — Les quatre leviers, traduits en mécanismes 19.0 nommés

| Levier | Mécanisme 19.0 retenu | Statut de la lecture |
|---|---|---|
| **L1** — verrouiller la structure | `o_not_editable` sur le conteneur (réglages + dépôt, sous-arbre) **+** `oe_unremovable oe_unmovable` sur chaque élément intérieur | composé, **pas** un marqueur unique (D11/P1). `o_not_editable` et `oe_unremovable` documentés ; `oe_unmovable` source seule |
| **L2** — empêcher un réglage natif d'apparaître | ne pas correspondre au `static selector` du réglage natif (voie passive, la moins chère) ; classes d'exclusion documentées (`s_col_no_resize`, `s_nb_column_fixed`, `s_col_no_bgcolor`, `o_not-animable`) ; `o_snippet_not_selectable`, toujours ajouté à la vérification du noyau | documenté pour les classes d'exclusion ; source pour le reste |
| **L3** — tronquer ce qui remonte du parent | le panneau empile **un bloc de réglages par ancêtre correspondant** (`getClosestElements` remonte tout `closest(selector)`). Tronquer = ne pas imiter les sélecteurs larges du noyau (`section`, `.row > div`), et au besoin `patch_builder_options` pour ajouter notre sélecteur à l'`exclude` d'une option existante, **par son nom** | source seule. `patch_builder_options` est marqué `@deprecated` dans les types **mais livré et employé** par `website_sale` et `mass_mailing` — à n'employer qu'en dernier recours, et à consigner si employé |
| **L4** — rouvrir une image dans un cadre figé | `o_editable_media` sur le média, à l'intérieur d'un conteneur `o_not_editable` — patron natif employé par `s_company_team` et `s_social_media` | **non exercé** par cette chaîne (aucune image) ⇒ verdict `non exercé` (SC-007) |

**Fait de gouvernance majeur, vérifié** : le noyau d'Odoo et un module tiers s'inscrivent dans le
**même registre, sans aucun filtrage par origine** — `website_sale` et `mass_mailing`, deux modules
séparés, emploient exactement l'appel `registry.category("…-plugins").add(id, Class)` du noyau, et
le code d'assemblage (`website_builder.js`) concatène les catégories sans discriminer. L'ordre
relatif ne dépend que d'une position numérique (`withSequence`), jamais d'une préséance du noyau.
La prémisse favorable de la session est donc **confirmée**.

### D15 — Ce que le montage demandera d'écrire (entrée du chiffrage FR-017)

Confirmé : **trois** types de fichiers, et c'est la différence structurante avec le précédent
interne (l'émetteur tiers du dépôt n'en produit qu'un).

1. **XML QWeb** — un `<template>` par composant + la déclaration de bloc par héritage `xpath` de
   `website.snippets` + les pages de mesure de la US3.
2. **JavaScript + XML OWL** — un `BaseOptionComponent` et un `Plugin` par composant portant des
   réglages, enregistrés dans `registry.category("website-plugins")`, plus leur gabarit OWL.
   Composants disponibles vérifiés : `BuilderRow`, `BuilderSelect`/`BuilderSelectItem` (énumération
   → classe CSS, via l'action intégrée `ClassAction`), `BuilderCheckbox` (booléen),
   `BuilderButtonGroup`, `BuilderTextInput`, `BuilderColorPicker`, `BuilderList`.
3. **CSS + assets** — notre CSS de composants, la sortie de jetons préfixée, les 19 glyphes, les
   faces Montserrat. Bundles vérifiés : `web.assets_frontend` pour la page publique,
   `website.website_builder_assets` pour le JS/XML des réglages.

**Le choix du glyphe (FR-004b)** se rend le plus naturellement par un `BuilderSelect` dont chaque
`BuilderSelectItem` porte un `classAction` — 19 valeurs, une classe par glyphe. Le patron natif le
plus proche d'un échange d'instance visuel est `ShapeSelector` (grille paginée de vignettes sur un
catalogue fixe d'assets SVG) ; Odoo n'a **aucun** terme pour « échange d'instance », et le
rapprochement est le nôtre, pas le sien. Ce point est **massivement mécanique** — 19 entrées
dérivées d'un registre — donc précisément le chiffre que le rapport cherche.

### D16 — L'instance jetable : montée, mesurée, détruite

**Décision.** Image Docker officielle `odoo:19.0-<date>` + `postgres:15`, deux services, deux
volumes nommés, un nom de projet dédié. Recette complète et pièges : `quickstart.md`.

**Ce qui a été vérifié en exécutant, pas en lisant.** Le relevé a monté la pile en vrai, installé
un module de site jetable, servi la page publique, capturé un PNG déterministe avec le Chromium
déjà en cache du dépôt, puis tout détruit — et chronométré chaque étape.

| Fait | Valeur mesurée |
|---|---|
| De rien à un onglet qui marche | **~4 min** (2 min de `pull`, 2 min d'installation, ~5 s de démarrage) |
| Destruction complète | ~3 s (+4 s si on retire aussi les images) |
| Cache d'images, **une seule fois** | ~3,9 Go sur disque |
| État réellement jetable, par instance | **~100 Mo** |

**Trois faits qui changent une commande.**

- **Le tag `odoo:19.0` flotte** : il est reconstruit chaque nuit. Épingler le **tag daté** est ce
  qui rend le reçu relisable dans six mois. L'image publie bien un manifeste `arm64` — aucune
  émulation, aucun `--platform` à passer, et `wkhtmltopdf` y est déjà résolu par architecture
  (le `Dockerfile` officiel branche sur `TARGETARCH` avec un SHA1 par cible).
- **Odoo 19 exige PostgreSQL ≥ 13** — le minimum est passé de 12 à 13 avec cette version.
- **`--dev` en 19.0 n'a pas de fonction `assets`.** La liste réelle est
  `all | xml | reload | qweb | werkzeug | replica | access`. C'est une confusion facile avec des
  versions antérieures, et elle coûterait une demi-journée à diagnostiquer.

**Quatre pièges pour la capture d'écran**, tous nommés dans `quickstart.md` §4 : capturer la page
**publique sans session** (l'éditeur superpose sa barre de backoffice et son panneau latéral et
change la mise en page) ; épingler viewport **et** clip des deux côtés (sinon `images:compare`
refuse) ; servir les **mêmes** faces Montserrat des deux côtés ; ne jamais attendre sans borne (le
client web d'Odoo garde une connexion longue ouverte, donc `networkidle` peut ne jamais rendre la
main).

**Un piège d'environnement trouvé en le heurtant** : le cache Playwright nomme ses répertoires par
architecture (`chrome-mac-arm64` / `chrome-mac-x64` / `chrome-mac`). Une découverte de binaire qui
n'essaie qu'un seul de ces noms **ne trouve rien, en silence**. `chromiumExecutable()` du dépôt les
essaie tous : le réutiliser tel quel, jamais en recopier une version raccourcie — c'est exactement
la raison pour laquelle il est exporté.

**Piège d'installation** : un module de site sans `"application": True` **n'apparaît pas** sous le
filtre « Apps » par défaut (il faut le mode développeur, *Update Apps List*, puis le filtre
« Extra »). La voie CLI `-i` évite tout ça — et `-i`/`-u` **exigent `-d`**.

---

## Ce que cette recherche laisse ouvert

Nommé ici pour que le chantier ne le redécouvre pas comme une surprise, et pour que le rapport de
décision puisse s'y adosser.

- **Tout le §II est LU, jamais CONFIRMÉ.** C'est l'objet même de la spec. SC-009 exige que rien de
  ce qui n'aura pas été confirmé sur l'instance ne soit présenté comme acquis.
- **`t-snippet-call`** (employé par `s_masonry_block` pour composer des variantes) n'apparaît pas
  dans la liste des directives du moteur QWeb, et son point de compilation n'a pas été localisé.
  Sans conséquence pour notre chaîne — elle n'emploie que `t-call`, entièrement documenté — mais à
  ne pas employer sans le comprendre.
- **`patch_builder_options`** (levier L3 de dernier recours) est marqué `@deprecated` dans les
  types **tout en étant livré et employé** par deux modules du noyau. Si le montage doit y
  recourir, c'est à consigner comme tel.
- **La mécanique d'éditabilité** (`data-oe-*` / `.o_editable` / `contenteditable`) n'est documentée
  **nulle part** dans la doc officielle 19.0 : elle est établie par la source seule. Réelle,
  employée par Odoo, non engagée.
- **`oe_unmovable`** est réel et employé par Odoo, mais absent de la doc officielle, qui ne
  documente que `o_not_editable` et `oe_unremovable`.
- **Aucun mécanisme de première partie n'isole du CSS tiers** sur une page publique Odoo. C'est une
  **absence constatée après recherche exhaustive**, pas un engagement d'Odoo — la nuance se garde.
- **Le coût d'un changement de version majeure reste le risque de fond**, et il n'a pas été
  ré-instruit ici : la spec l'a déjà relevé (la communauté OCA passée de 22 modules maintenus à 4
  entre la 18 et la 19). Le remplacement complet du système de réglages entre 18 et 19, confirmé
  par l'absence de `html_builder` sur les deux branches antérieures **et** la disparition de
  l'ancien éditeur à widgets, en est la démonstration la plus directe.
