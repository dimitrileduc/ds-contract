# Spec B — Design-to-code

100 % repo (schéma, contrats, émetteurs), gates habituels (build, parity, eval).
**Prérequis : Spec A finie** — les noms de calques deviennent les identifiants du
code généré ; on n'extrait rien tant qu'ils mentent.

## Règle

**Props TEXT** — un texte devient prop ssi son contenu doit être pilotable de
l'extérieur. Jamais automatique : c'est un geste explicite côté Figma, lu par
l'extracteur. Un texte constant reste figé (`part.text`).

**Cible Odoo (owner, 2026-07-25)** : dans le web builder Odoo, tout texte visible
d'un snippet est éditable inline par défaut — donc pour les composants destinés aux
pages, la logique s'inverse : **prop/éditable par défaut, figé = exception rare à
justifier** (mention légale, libellé système). B3 applique ce défaut-là.

## Tâches

| # | Tâche | Note |
|---|---|---|
| B1 | **Schéma : type rich-text** + rendu brut dans les émetteurs | aujourd'hui `type:'text'` plat seul, les 2 émetteurs échappent le contenu → le gras inline est impossible en prop. Fix additif : `dangerouslySetInnerHTML` (déjà utilisé pour les icônes SVG dans `emit-react.ts`) / `t-raw` côté Qweb. Le master Figma montre UN exemple figé du gras ; le vrai contenu vient du CMS |
| B2 | **Contrat Bouton** : axe `Property 1` → nom parlant + « Outilne noir » → « Outline noir » + description | l'axe et les valeurs vivent dans `ds.button` (`bindings.figma`) → changement de contrat + régénération des 2 surfaces (le flux differ/parity normal). Valeur renommée = **bump majeur** (`outilneNoir` est un identifiant généré) |
| B3 | **Props CMS** : trancher composant par composant ce qui devient prop | cas connus : Carousel-controls (0 prop), 6 organisms sans prop (Réassurances, Catégories, Réalisations, Texte SEO, Équipe, Produits), textes riches (Hero, Texte SEO, FAQ → dépend de B1) |
| B4 | **Extraction** : masters Phase 7/8 → contrats | aujourd'hui 5 contrats réels, tous atomes, zéro composition exercée — les molécules/organisms sont 100 % Figma-only. Ordre : après B1-B3 et après le naming (Spec A/G2) |

## Contexte utile

- Extracteur (`core/propose-figma.ts`) : prop TEXT exposée → `part.content={prop}` →
  vraie prop générée ; sinon `part.text` figé. La structure (colonnes, layout) vient
  de l'arborescence du frame, jamais des props.
- Naming → code (`partKey`, L2408/L2440) : nom de calque → clé d'anatomie → classe
  CSS + identifiant. Nom tiré du contenu tronqué à 24 car. (« Portes de garage
  industrielles » → `portesDeGarageIndustrie`) ; un axe `Property 1` → prop
  `property1`. D'où le prérequis Spec A.
- Précédent composition : archive `demo-51` — 2/51 contrats avec `component`
  (Card, Table), 0 `repeat`, plafond = échelle molécule. Aucun précédent
  organism/section : B4 essuiera les plâtres, prévoir petit.
