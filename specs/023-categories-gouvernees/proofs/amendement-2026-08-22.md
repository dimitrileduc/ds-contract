# Amendement du 2026-08-22 — le style de carte devient un réglage rédacteur

**Statut** : appliqué · **Décision** : owner, en session, 2026-08-22
**Portée** : contrat `ds.carte-categorie` (1.0.0 → 1.1.0) · émetteur `core/emit-figma-script.ts` ·
module Odoo (QWeb, panneau, actions) · `integrations/odoo/config/categories.authoring.json` (1.1.0 → 1.2.0)

Ce document est un **reçu daté**. Il n'efface rien : les relevés et les gates antérieurs restent
exacts **à leur date**. Il dit ce qui a changé, pourquoi, et ce qui devient faux ailleurs.

---

## 1. Ce qui a déclenché la session

L'owner a demandé à voir le bloc tourner dans Odoo, puis a posé deux questions sur ce qu'il voyait :
« pourquoi les images n'ont pas la même hauteur d'une carte à l'autre ? » et « pourquoi la carte
ajoutée n'a pas de cadre ? ». La première a ouvert **trois défauts réels**, tous mesurés, aucun
supposé.

## 2. Défaut A — `layout.grow` est ambigu d'axe (défaut de MOTEUR, pas de contrat)

| champ | projection CSS | projection Figma |
|---|---|---|
| `layout.grow: true` | `flex: 1 1 auto` → axe **PRINCIPAL** | `layoutSizingHorizontal = FILL` → **horizontal** |
| `layout.width: "fill"` | `width: 100%` → **horizontal** | `layoutAlign STRETCH` → **horizontal** |

Sous un root en **ligne** les deux coïncident ; sous un root en **colonne** — le cas de
`ds.carte-categorie` — ils désignent des axes **différents**. `categorieImage` portait `grow`, donc
Figma remplissait la largeur pendant que le CSS étirait la **hauteur**.

**Effet mesuré** (instance QA, éditeur, carte 600 px) : en rallongeant le texte de la carte 0 de deux
lignes, sa voisine — texte inchangé — voyait sa photo passer de **418 à 472 px**. La carte au texte
le plus court héritait de la photo la plus haute.

**Correctif** : `layout.grow` → `layout.width: "fill"` sur `categorieImage`.

**Effet de bord réparé dans la foulée** : le garde `constrainProportions` de
`core/emit-figma-script.ts` était conditionné à `spec.grow` — et son commentaire nomme littéralement
« the 743px category card ». La bascule vers `fillWidth` l'aurait rendu **muet sur ce nœud précis**.
Garde élargi à `(spec.grow || spec.fillWidth)`.

**Scan croisé** (38 contrats) : quatre autres parts déclarent `grow` sous un parent en colonne.
Une seule porte la même signature complète (grow + hauteur figée) : **`ds.carte` / `root/categorieImage`**.
Non traitée — hors du périmètre demandé. `ds.faq/accordion`, `ds.formulaire/SectionHeader` et
`ds.formulaire/FormulaireBouton` déclarent `grow` sans hauteur figée : cas distinct, non instruit.

## 3. Défaut B — la photo est PROPORTIONNELLE, le contrat la figeait

Le master mesure 743×418 ; les variantes de section confirment le rapport à trois largeurs :

| largeur de carte | hauteur de photo | rapport |
|---|---|---|
| 744 (master) | 418 | 1.780 |
| 832 (Superpose/2, Empile/2) | 468 | 1.778 |
| 533 (Superpose/3, Empile/3) | 300 | 1.777 |

Le moteur Figma tenait déjà cette règle (`constrainProportions`) ; **seule la projection CSS ne la
portait pas** — elle figeait 418 px à toute largeur.

**Correctif** : `categorieImage` perd ses jetons `height`/`min-height` et gagne
`layout.aspectRatio = 743/418`.

## 4. Défaut C — la carte SUPERPOSÉE n'avait aucune hauteur

Le contrat ne portait **aucune** hauteur pour le style superposé : `photoSuperpose` était en
`position: absolute` (hors flux), donc rien ne poussait la carte. **Mesuré : 743×149 au lieu de
744×418** — la carte s'écrasait à la hauteur de son texte. Invisible jusqu'ici parce que le style
superposé n'était rendu nulle part.

**Correctif, sans toucher au schéma** (`aspectRatio` n'existe pas en surcharge par variante dans
`VariantLayoutSchema`) : les deux plans échangent leur rôle.

- `photoSuperpose` passe **en flux**, `width: fill` + `aspectRatio = 744/418` → c'est elle qui donne
  sa hauteur à la carte.
- `contenuSuperpose` (voile + texte) passe **en absolu**, calé sur les trois bords bas.

L'ordre z est inchangé. **Mesuré après correctif** : 744 de large → **744×418** ; 664 de large →
**664×373**.

## 5. L'amendement de gouvernance — Q-C2 renversée

**Énoncé d'origine** (Gate D, validé le 2026-08-21) :

> « Style de carte (superpose/empile) = FIXÉ par la composition — pas un choix rédacteur cette itération. »

**Ce que l'owner a tranché le 2026-08-22** : le style devient un **enum FERMÉ {superpose, empile}
offert au panneau de la SECTION**.

Deux options lui ont été présentées avant décision — (A) deux blocs distincts au catalogue, le
rédacteur choisit son bloc ; (B) un bloc + un réglage de type au panneau. **Le risque de (B) a été
nommé avant la décision** : les deux styles ne partagent **aucun nœud** (empilé = photo + texte +
bouton ; superposé = photo pleine + voile + flèche, **sans CTA**), donc basculer **reconstruit**
chaque carte, et le CTA n'a pas de destination côté superposé. L'owner a choisi **B**.

**Ce qui tient de l'énoncé d'origine** : au niveau de la **CARTE**, le style reste fixé par
composition (`cat-ctl-carte-style` inchangé). La section le transmet ; la carte ne le choisit pas.
Seul `cat-ctl-sec-style` bascule `not-editable` → `controlled` / `enum`.

**La perte de CTA a été évitée** plutôt qu'acceptée : le libellé et le lien sont **mis de côté** sur
la racine de la carte (`data-pqr-cta-label` / `data-pqr-cta-href`) pendant qu'elle est superposée, et
restitués à l'aller-retour. Ces attributs ne peignent rien et ne sont pas des faits de contrat : ils
sont la mémoire d'un geste d'éditeur, portée par l'instance.

## 6. Défaut D — trouvé par l'owner à l'essai

Le bouton « Remplacer » de l'image était **inerte sur le style superposé**. Cause :
`carteCategorieImage()` (media_action.js) localisait la photo par la **seule** classe de la carte
empilée (`.carte-categorie__categorieImage`). Le superposé porte `.carte-categorie__photoSuperpose`.
Le sélecteur accepte désormais les deux ; la bascule de style utilise le même repli par classe, car
le dialogue média reconstruit le nœud et lui retire son `data-pqr-part`.

**Vérifié en pilotant le geste réel** : bascule → sélection de carte → « Remplacer » → upload →
`src` renseigné, carte à 337 px, voile et texte par-dessus.

## 7. Portes

`npm run build` ✔ · `geometry:gate` ✔ (0 invisible) · `parity` ✔ (9 acquittements, aucun nouveau) ·
`plugin:check` ✔ · `deterministic-roundtrip` ✔ · `tsc` ✔ · `core-browser-check` ✔ ·
`odoo:{assets,authoring,module,derivation}:check` ✔ (module 18/18) · **`npm run eval` 220/220**.

Re-pins exécutés : `evals/golden.json`, `figma-sync/plugin/engine.receipt.json`,
`examples/polaris/figma/*`, `integrations/odoo/config/inputs.lock.json` (graphDigest propagé à
`version_guard.js`, `scan-saved-versions.ts`, `components.xml` et la fixture
`evals/fixtures/odoo-production/version-drift/cases.json`).

## 8. Ce qui reste ouvert

- **Les réglages « Libellé du CTA » et « Lien du CTA » restent affichés** au panneau quand la carte
  est superposée, alors qu'elle n'a pas de bouton. La condition qui les masquait
  (`t-if` sur `editingElement.dataset.pqrCarteStyle`) a fait **sauter l'enregistrement du panneau
  entier** — plus aucun réglage visible. Retirée pour livrer un panneau qui fonctionne ; à reprendre
  avec le bon idiome OWL.
- **Le scénario QA `categories.spec.mts` n'a pas été rejoué** après l'amendement : il repart d'une
  base neuve et aurait effacé l'instance en cours d'essai par l'owner. La fixture
  `categories-panel.json` a été mise à jour (`categories-style` ajouté à `expectedControls`) mais
  **le scénario n'a pas été exécuté** — et il ne couvre pas encore la bascule de style.
- **`ds.carte` / `root/categorieImage`** porte le même défaut d'axe que celui corrigé ici (§2).
- **La parité visuelle du style superposé** n'a pas été rechiffrée après le changement de modèle.
