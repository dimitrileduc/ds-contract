# US1 — reçu des gestes sur l'instance (T027, T028)

**Instance** : `odoo:19.0-20260803`, base `odoo` recréée · **Date** : 2026-08-06
**Méthode** : Chromium épinglé, connecté en `admin`, éditeur ouvert par
`/odoo/action-website.website_preview?path=/&enable_editor=1`.

Aucun de ces faits n'est établi par lecture de XML (FR-013). Chacun est le résultat d'un geste.

---

## Le défaut trouvé en fonctionnement, et qu'aucune porte n'aurait attrapé

**Le module s'installait à 0 erreur, l'xpath matchait, et le bloc n'apparaissait NULLE PART.**

Relevé : la chaîne `piqueray` était absente de **tout** le DOM du builder. Pas « au mauvais
endroit » — absente.

**Cause**, remontée dans la source 19.0 puis corrigée : les entrées de `snippet_structure`
**doivent porter un attribut `group`**. `html_builder` n'affiche d'abord que les **catégories**
(`snippet_groups`) ; les blocs ne sont rendus qu'une fois une catégorie ouverte, et une entrée sans
`group` n'appartient à aucune catégorie. Elle est donc chargée, valide, et **inatteignable**.
Toutes les entrées natives en portent un (`group="intro"`, `"content"`, `"columns"`…).

**À qui la faute** : `research.md` §D10 mentionnait bien `group="…"` dans sa description du
mécanisme. C'est le montage qui l'a omis. Corrigé en `group="content"`.

**Ce que ça vaut pour le rapport de décision** : c'est un défaut **silencieux à l'installation**.
Aucune porte, aucun journal, aucune validation de schéma ne l'aurait signalé — seul un geste sur
l'instance l'a fait apparaître. C'est un argument direct en faveur de SC-009 (« rien de lu n'est
acquis avant qu'une instance le confirme ») et, pour un émetteur, un argument pour que l'attribut
`group` soit **dérivé** plutôt que tapé.

---

## US1-4 · le panneau ne contient QUE la section (FR-003, cardinalité 1)

Geste : ouvrir le dialogue « Insert a block », catégorie **Content**, et chercher trois termes dans
le champ de recherche du panneau — le geste exact d'un rédacteur.

| Terme cherché | Cartes d'aperçu | Dont portant NOTRE balisage | Lecture |
|---|---|---|---|
| `Piqueray` | 1 | **1** | notre bloc, et lui seul |
| `Bouton` | 1 | **0** | la carte trouvée est le « Button » natif d'Odoo |
| `En-tête` | 1 | **0** | idem, aucune entrée de nous |

Extrait du DOM de l'aperçu, relevé dans son iframe :

```html
<div data-snippet-id="s_presentation" data-label="" class="o_snippet_preview_wrap" …>
```

**VERDICT FR-003 / SC-002 (cardinalité)** : **1 seule entrée posable** pour les trois composants.
`ds.section-header` et `ds.button` sont **présents dans le module et absents du panneau** —
l'acceptation US1-4 est tenue, et elle est tenue par un geste.

> **Piège d'instrument, nommé** : un premier relevé a conclu « 0 entrée Piqueray » alors que le
> bloc était bien là. Cause : Odoo rend les aperçus de blocs **dans des iframes**, donc
> `modal.innerHTML` ne les contient pas. Le relevé est refait en parcourant les frames. Un
> instrument qui interroge le mauvais document rend un faux négatif parfaitement crédible.

## US1-1 · les trois composants, rendus et imbriqués

L'aperçu du panneau (capture `05-une-seule-entree.png`) montre le bloc rendu : le titre
« **Piqueray,** une histoire de famille » dans la colonne gauche, le paragraphe de présentation dans
la colonne droite — la grille à deux colonnes du contrat, avec son gras gouverné.

Le rendu des trois composants est par ailleurs établi **au pixel près** par la US3, sur les pages de
mesure : `ds.button` et `ds.section-header` à **0,0000 %** d'écart contre la surface de référence,
et la page de l'en-tête **exerce le `t-call` de niveau 3** vers le bouton. Voir
[`comparaison-image.json`](./comparaison-image.json).

## Ce qui n'est PAS établi ici, et qui reste ouvert

- **La pose du bloc sur une page, l'enregistrement et le rechargement** (le reste de US1-2) :
  non exécutés. Le glisser-déposer du builder d'Odoo est un geste à événements de pointeur
  personnalisés, et il n'a pas été automatisé.
- **Les 19 glyphes et l'exercice du choix de glyphe** (SC-002, FR-004b) : les glyphes sont embarqués
  et vérifiés côté fichiers (19/19, `glyphes-19.md`), mais le **choix** n'a pas été exercé comme
  réglage sur l'instance — c'est un geste de US2, et US2 n'a pas été menée.
- **Toute la US2** : les 4 verdicts de levier restent à rendre. Ils sont donc, à ce stade,
  **sans preuve** — et un verdict établi par lecture de code est interdit (V4, FR-013, SC-009).
