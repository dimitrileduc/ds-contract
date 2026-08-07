# Ce que ce module NE porte PAS

Les faits que les trois contrats portent et que ce montage **n'exprime pas** — nommés un par un,
avec leur raison. Une omission silencieuse est le défaut de sévérité maximale de ce dépôt ; c'est
aussi le vocabulaire que `docs/15-engine-as-library.md` impose déjà à tout émetteur : *named no-ops,
never silent drops*.

**Lisible depuis l'artefact** : ce fichier est lié depuis [`README.md`](./README.md), qui est le
premier fichier qu'un lecteur du module ouvre. Il n'y a pas à connaître la spec pour le trouver.

---

## Frontière à ne pas confondre

Trois régimes différents, et ils ne vivent pas au même endroit :

| Régime | Ce que c'est | Où c'est déclaré |
|---|---|---|
| **Figé** | exprimé par le montage, fermé au rédacteur | [`../../zones/*.json`](../../zones/) |
| **Littéral nommé** | une valeur écrite en clair, héritée du contrat, épinglée byte-à-byte | [`named-literals.registry.json`](./named-literals.registry.json) |
| **Non porté** | **pas exprimé du tout** | ce fichier |

Un réglage figé est porté. Un littéral nommé est porté. Seul ce qui suit ne l'est pas.

---

## 1. Les états interactifs — **RIEN à ne pas porter** (vérifié, pas supposé)

| | |
|---|---|
| **Contrats** | les trois |
| **Pointeur** | `/states` |
| **Fait** | Aucun des trois contrats ne porte d'état interactif : `states` vaut `[]` partout. |
| **Raison** | Il n'y a donc **rien à omettre**. Ce point est listé parce que c'était un candidat annoncé (`tasks.md` T025) — et le vérifier valait mieux que l'affirmer dans un sens ou dans l'autre. Le moteur du dépôt et l'archive demo-51 savent générer `:hover` / `:focus-visible` / `:disabled` ; la fondation Piqueray ne les emploie pas encore. |
| **Conséquence** | Le module ne génère aucun style d'état, exactement comme la surface de référence. La comparaison d'image de la US3 n'en est pas affectée : elle capture un état au repos des deux côtés. |

## 2. Les variables de thème d'Odoo ne sont pas alimentées

| | |
|---|---|
| **Origine** | `../../contracts/odoo-tokens-output.md` §5 |
| **Fait** | La 4ᵉ sortie du pipeline publie nos jetons sous `--pqr-*`. Elle **n'écrit rien** dans les variables SCSS de thème d'Odoo (`$o-color-1..5`, alimentées par `web._assets_primary_variables`). |
| **Raison** | Aucune exigence ne le demande, la chaîne des trois composants n'en a pas besoin, et l'ajouter fabriquerait une sortie de plus que personne n'a spécifiée. |
| **Conséquence** | Le squelette du site — en-tête, menu, pied de page — reste habillé par Odoo, ce que FR-007 exige explicitement. Notre portée s'arrête à nos propres classes. |

## 3. `ds.presentation` / prop `titre` — orpheline en amont

| | |
|---|---|
| **Contrat** | `ds.presentation` v2.5.0 |
| **Pointeur** | `/props[name=titre]` |
| **Fait** | La prop est déclarée, dotée d'un défaut, liée à la propriété Figma TEXT « Titre » — et **consommée par aucune part de l'anatomie**. Le React généré l'accepte puis l'ignore (`Presentation.tsx` la déclare l. 16/23, et passe l. 47 un littéral rich-text à `SectionHeader`, pas `titre={titre}`). |
| **Raison** | L'offrir au rédacteur donnerait un champ **sans effet** — le pire des réglages. Le module ne l'exprime donc pas. |
| **Ce n'est pas un défaut de 018** | C'est un défaut de source Figma **déjà enregistré** : `Titre#2103:53` sur le master Presentation, entrée **B013-1** de `specs/016-canvas-vrai/registre/defauts-source.json`, encore `orphelineEncore: true` au relevé vif du 2026-08-05. La spec 018 est en **lecture seule** sur Figma : elle le nomme et ne le corrige pas. |

## 4. Les branches de props figées ne sont pas offertes — mais leur CSS est écrite

| | |
|---|---|
| **Contrat** | `ds.section-header` v2.1.1 |
| **Pointeur** | `/props[name=emphase]`, `[name=alignement]`, `[name=disposition]`, `[name=accroche2]`, `[name=accroche]`, `[name=titre]` |
| **Fait** | Les six props sont **figées** par le tableau des zones : le composant n'a aucun panneau de réglages. Leurs valeurs autres que celles de la composition (`emphase=hero\|standard\|compact`, `alignement=centre`, `disposition=avecCta`) ne sont donc **jamais atteignables sur le bloc posé**. |
| **Raison** | La composition de `ds.presentation` les fixe. Les ouvrir ne serait pas répliquer le contrat mais lui ajouter une capacité (décision d'owner du 2026-08-06). |
| **Précision qui compte** | Ce n'est **pas** un non-porté au sens plein : leur **CSS est écrite** dans `components.css`, parce que la surface de référence l'émet. Ce qui n'est pas porté est l'**accès du rédacteur**, pas la règle. La branche `disposition=avecCta` est même **exercée en fonctionnement** sur la page de mesure `/piqueray-mesure/section-header`. |

## 5. Le troisième niveau ne se rend pas sur le bloc posé

| | |
|---|---|
| **Contrat** | `ds.presentation` v2.5.0 → `ds.section-header` v2.1.1 → `ds.button` v2.0.0 |
| **Pointeur** | `/anatomy/root/parts/colGauche/parts/SectionHeader/component/props/disposition` |
| **Fait** | `ds.presentation` fixe `disposition: "standard"` **en dur** dans sa composition, ce qui ferme l'unique chemin de niveau 3 vers `ds.button`. **Aucune valeur de prop** ne fait rendre les trois niveaux du bloc posé. |
| **Raison** | Le schéma offre pourtant le report de prop du parent (`ComponentRefSchema` : une valeur `"{parentProp}"` fait suivre une prop scalaire), et le contrat ne l'emploie pas. Le répliquer fidèlement, c'est écrire la valeur littérale. |
| **Ce qui est porté quand même** | Le `t-call` de niveau 3 **est écrit** dans `views/templates.xml`, avec sa condition — la chaîne d'appels compte bien trois niveaux, vérifiable en lisant les appels. Et il est **exercé en fonctionnement** sur `/piqueray-mesure/section-header`. Ce qui n'est pas porté, c'est son rendu **sur le bloc posé**. |

## 6. Le squelette du site n'est pas mesuré

| | |
|---|---|
| **Fait** | Les trois pages de mesure (`views/harness.xml`) chargent `web.assets_frontend` — donc Bootstrap 5.3.3 et son reboot, le vrai cadre CSS d'Odoo — mais **pas** `website.layout` : ni en-tête, ni menu, ni pied de page. |
| **Raison** | Le protocole de comparaison exige un `clip` de taille **et** d'origine identiques des deux côtés. Le squelette déplacerait le composant à une position qui dépend du contenu du site. |
| **Conséquence à porter au rapport** | L'écart mesuré par la US3 est celui du **cadre CSS de base**, pas celui d'une page de site complète. Les styles qu'apporteraient les classes de `<body>` et les conteneurs `o_*` du squelette ne sont pas dans la mesure. |

## 7. Les deux glyphes à couleur figée n'héritent pas de la couleur du bouton

| | |
|---|---|
| **Registre** | `contracts/icons.registry.json` v1.2.0 — `star`, `octicon-chevron-down12` |
| **Fait** | 17 des 19 glyphes gouvernés portent `fill="currentColor"` et suivent donc la couleur du texte du bouton. Ces deux-là portent une couleur **figée dans le fichier** (`#F98A0B` pour l'étoile, `white` pour le chevron) et sont rendus en image de fond plutôt qu'en masque, pour ne pas effacer cette couleur. |
| **Raison** | Un masque les aurait rendus dans la couleur du texte — une étoile grise est un défaut visible. Le jugement rendu : la fidélité de couleur l'emporte sur l'uniformité du mécanisme. |
| **Ce qui n'est pas porté** | Leur adaptation à la couleur du bouton. Ce n'est pas une perte : **la surface de référence ne l'a pas non plus**, leur SVG ne portant pas `currentColor`. Le comportement est donc identique des deux côtés. |
