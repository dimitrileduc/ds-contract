# Data Model — 023 Catégories gouvernées

**Entrées**: [spec.md](./spec.md) · [research.md](./research.md)

Les deux premières entités sont des **contrats à extraire de la source nettoyée** (§VIII) :
leur forme définitive sort de l'extraction, pas de ce document. Ce qui suit fixe le
**modèle cible** (l'objet du Gate A) et les invariants que l'extraction devra vérifier.
Les esquisses détaillées vivent dans [contracts/](./contracts/).

## 1. `ds.carte-categorie` — la molécule (NOUVEAU contrat)

| Champ | Modèle cible | Invariant |
|---|---|---|
| `props.style` | enum `superpose \| empile`, binding VARIANT `Style` (`Superpose`/`Empile`), défaut relevé à l'audit | **le seul axe de variante** (FR-007) |
| `props.titre` | `text`, binding TEXT | sémantique partagée entre les 2 styles |
| `props.description` | `text` (ou `rich-text` si le relevé observe des segments mixtes), binding TEXT | idem |
| `props.imageUrl` / `imageAlt` | `text`, binding NONE (route A5, défaut `""`) | jamais d'octets ; lavis `#D9D9D9` au canvas |
| `props.ctaLabel` | `text`, binding NONE (précédent `ds.carte.ctaLabel`) | n'affecte que le style `empile` |
| `anatomy` — style `superpose` | plan photo `img` en `position: absolute` + contenu `relative` + flèche = icône `arrow-right` du registre (parts en `visibleWhen: {prop: style, equals: superpose}`) | patron `ds.hero` ; l'affordance est une part officielle |
| `anatomy` — style `empile` | image en flux (`grow`), texte, part `Bouton` composant `ds.button` `variant: link` (parts en `visibleWhen: … empile`) | reprise pixel de l'actuel `Carte/Categorie` |
| `anatomy.root` | enfants en Fill (source saine confirmée par l'étude) ; largeur gouvernée par la CELLULE de grille du parent, pas par la carte | évite la limite nommée « parent ne restyle pas une instance » |
| tokens | tout en `{…}` : réutilisation `space.N`, mint from-dump `size.carte-categorie.*` | `geometry:gate` = 0 littéral invisible |
| `version` | `1.0.0` | — |
| `category` | `"molecule"` | — |

**Relation à `ds.carte`** (Gate A, research D3) : si l'option recommandée est retenue,
`ds.carte` → v3.0.0 (majeur : retrait de `disposition: categorie` + props CTA associées) ;
`ds.reassurances` (compose `disposition: reassurance`) fonctionnellement intact ;
épinglages Odoo (`inputs.lock.json`, authoring configs) rafraîchis.

## 2. `ds.categories-principales` — la section (NOUVEAU contrat)

| Champ | Modèle cible | Invariant |
|---|---|---|
| `props.style` | enum `superpose \| empile`, VARIANT `Style`, **transmis** à la carte répétée (`component.props: {"style": "{style}"}`) | verdict Odoo `fixed-by-composition` (pas un choix rédacteur) |
| `props.colonnes` | enum `'2' \| '3'`, VARIANT `Colonnes` | **enum fermé** — aucune autre valeur offrable (FR-008/FR-017) |
| `props.cartes` | `arrayOf {titre, description}` + `sample` relevé | patron `ds.equipe.items` |
| `anatomy.root > grid` | `display: grid`, `columns: 2` (base) + `layoutByProp {prop: colonnes, map: {"3": {columns: 3}}}` ; gaps en tokens | **nécessite l'extension de schéma E1** ; wrap natif au-delà du compte (FR-018) |
| `anatomy.…grid > CarteCategorie` | `component {id: ds.carte-categorie, props: {style: "{style}"}}` + `repeat {itemsProp: cartes, sample}` ; `width: fill` (la cellule gouverne) | zéro copie locale possible par construction |
| `version` / `category` | `1.0.0` / `"section"` | — |

**Côté Figma** : COMPONENT_SET `CategoriesPrincipales` nettoyé → axes orthogonaux
`Style × Colonnes` (≤ 4 variantes, combinaisons sans réalité design retirables au
Gate A) ; l'axe « Disposition » et ses valeurs mensongères disparaissent (FR-009).
« Rdv » = **instance renseignée** de la section (contenu préservé à l'identique), plus
jamais une variante.

## 3. E1 — Extension additive du schéma (la seule de la spec)

| Élément | Contenu |
|---|---|
| Champ | `VariantLayoutSchema.columns?: number` (entier positif, optionnel) — `packages/schema/src/contract-schema.ts:207` |
| Refus nommé | override `columns` licite seulement si la part a `layout.display: "grid"` en base (`validateContract`) |
| Émetteurs | `emit-react` : `grid-template-columns: repeat(N, minmax(0,1fr))` dans la règle d'enum-classe ; `emit-figma-script` : le combo compilé porte `columns` → `gridColumnCount`/`gridRowCount` existants (l. 3568-3572) |
| Doc | bump `docs/02-contract-spec.md` (Principe VI) |
| Eval | cas de refus (columns hors grid → refus par nom) + déterminisme via re-pin golden — AVANT toute phrase de capacité (Principe II) |

## 4. Registre d'avant-capture (§X) — `specs/023-…/proofs/captures/`

| Champ | Description |
|---|---|
| `targetId` | usage-1 … usage-7 (page `Pages` 210:325, identifiés par POSITION), master-categories (2115:4277, 4 variantes), master-carte (2063:1622, 2 variantes) |
| `nodeId` + `structuralPath` | relevés à l'audit |
| `capture` | PNG rendu + dump structure ; **vérifiée non vide + dimensions attendues** |
| `capturedAt` | horodaté AVANT toute mutation ; le registre couvre 100 % des cibles, jamais un pilote |

## 5. Artefacts de gates (state machine de la spec)

```
audit (lecture seule, par position)
  → GATE A  gates/gate-a-modele-cible.json   status: validated + proofs/gate-a.md
  → captures §X (registre 4) — puis mutations canvas
  → GATE B  gates/gate-b-pixel.json          7 deltas chiffrés/attribués + proofs/gate-b.md
  → extraction + build + gates repo
  → GATE C  gates/gate-c-contrats.json       diff révisable validé + proofs/gate-c.md
  → câblage différentiel (US3)
  → GATE D  contracts/categories.editable-scope.json (100 % props+parts, 4 verdicts)
            + proofs/gate-d.md → transcription 1:1 authoring config
  → Odoo (US2) → clôture
```

Invariant FR-005 : une phase aval ne démarre que si l'artefact du gate amont existe avec
`status: validated` et une trace datée ; toute divergence découverte ensuite = défaut ou
retour au gate, tracé au même endroit.

## 6. Table d'éditabilité (Gate D) — `contracts/categories.editable-scope.json`

Format 022 (`editable-scope`, granularité décision), vocabulaire du schéma authoring 019 :

| Verdict spec | Verdict machine | Exemples attendus (à valider par l'owner, pas ici) |
|---|---|---|
| éditable | `directly-editable` / `controlled` + mécanisme | titre, description (texte) ; image (`computed-display`) ; lien (URL picker par carte) ; collection (`ordered-repeat`) ; colonnes (`enum` {2,3}) |
| fixé par composition | `fixed-by-composition` | `style` (section et carte), glyphe de flèche |
| non éditable | `not-editable` | parts structurelles (root, grid, plans photo du canvas) |
| hors capacité | `hors-capacite` (+ justification) | ce que l'éditeur Website ne sait pas offrir sans casse |

Exhaustivité : 100 % des props ET des parts des DEUX contrats (FR-004), zéro verdict par
défaut, vérifiée mécaniquement par `npm run odoo:authoring:check` après transcription.

## 7. Couche Odoo dérivée (après Gate D)

| Artefact | Rôle |
|---|---|
| `integrations/odoo/config/categories.authoring.json` | transcription 1:1 du Gate D (schéma 019) |
| Snippet + panneau (`piqueray_ds`) | QWeb `t-call` composé ; contrôles : `ordered-repeat`, `plain-text`/`rich-text`, `computed-display`, `enum` (colonnes), `BuilderUrlPicker`/`pqrSetCtaHref` par carte (assemblage nommé, research D5) |
| `adaptation-registry.json` | +1 entrée `ODOO-023-CATEGORIES-QWEB` (raison `odoo-qweb-composition`) |
| `inputs.lock.json` | épinglage des versions des 2 contrats (+ `ds.carte` si D3-recommandée) |
| Preuves US2 | scénario rédacteur sur instance jetable ; 3 points de contrôle (sauvegarde, réouverture, page publique) ; frontière prouvée par `editability-boundary` |

## 8. Couverture du différentiel (US3)

| Axe | Câblage | Preuve |
|---|---|---|
| code ⟷ contrat | automatique (readdir `contracts/`) | `npm run parity` classe les 2 contrats |
| canvas ⟷ contrat | refresh lecture `parity/snapshots/figma-components.json` (post-mutation) | idem + solde la limite « cliché périmé » de 017 |
| variables ⟷ tokens | inchangé (mints from-dump côté tokens) | `npm run parity` |
| parité visuelle | +2 sujets `subjects.ts` + baseline (+ prêt d'actifs fixture si besoin, patron `ds.carte`) | dérive injectée signalée par nom, retour au vert (protocole archivé dans `proofs/`) |
