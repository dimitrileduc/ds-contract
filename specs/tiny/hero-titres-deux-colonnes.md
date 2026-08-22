# TinySpec: hero-titres-deux-colonnes — Figma → contrat → HTML → Odoo

**Branch**: main · **Date**: 2026-08-22 · **Status**: done — source + contrat + Odoo + revue /simplify, 16 portes vertes · **Complexity**: **au-dessus du format tinyspec, assumé par décision owner** (2026-08-22) — 12 fichiers, 18 tâches, 5 re-pins. Gardé en un seul document à la demande ; `/speckit.specify` reste l'option si la chaîne se complique.

## What

Le master Figma `Hero` (`2111:3382`) porte deux défauts de source, et le contrat les hérite. (1) L'instance `SectionHeader` est en `layoutSizingVertical: FIXED` à 65 px alors que toute la chaîne autour est en HUG : son `Titre` déborde et peint par-dessus la ligne du CTA. (2) Le titre est pleine largeur au-dessus, le CTA sur la ligne d'en dessous avec le sous-titre : sous-titre vide, le CTA reste seul sur sa ligne au lieu de s'aligner avec le titre. On répare la source, puis on propage jusqu'à Odoo.

## Diagnostic (mesuré, REST + rendu Odoo)

```
blocTexte HUG ✓ · Titres HUG ✓ (pad 96/48, gap 16)
    SectionHeader  FIXED 65  ✗   ← le seul écart de la chaîne
    wrapper HUG ✓ · sousTitre HUG ✓ · Bouton HUG ✓
```

| usage | Titre | débord | chevauchement |
|---|---|---|---|
| 7 pages, 1 ligne | 68 | 3 px | — (absorbé par le gap) |
| `Portes de garage` (`2111:3402`) | 136 | 71 px | **55 px** |

Le rendu Odoo actuel ne chevauche pas (titre `472→608`, wrapper `624→678`) : le contrat ne fige pas cette hauteur. Mesuré aussi, et sans effet sur la position du CTA : la div de sous-titre vide garde 32 px **dans l'éditeur** (boîte de ligne d'un `contenteditable`), 0 px en public.

## Verdict de la répétition sur clone (T2 — fait le 2026-08-22, master jamais touché)

Clone du master + instance de test porteuse de 3 overrides, restructurée, mesurée, puis page de brouillon supprimée. Trois résultats :

1. **Les overrides survivent.** Titre, sous-titre et libellé de CTA identiques avant/après reparentage (`identique: true`). Le risque principal du spec tombe — la repose du point 5 devient un filet, pas un plan.
2. **Changer `layoutMode` réinitialise les DEUX axes de sizing.** `Titres` est retombé en `HUG` horizontal (1728 → 664, titre à 4 lignes) **et** en `FIXED` vertical (359). Il faut réaffirmer `layoutSizingHorizontal = FILL` **et** `layoutSizingVertical = HUG` après le passage en `HORIZONTAL`, sinon on remplace un défaut par un autre, plus gros.
3. **Vider le texte ne suffit pas — il faut le masquer.** Mesuré sur le clone :

| sous-titre | hauteur | bas(Titre) vs bas(CTA) |
|---|---|---|
| `characters = ""` (0 caractère) | **32 px** — la boîte de ligne reste | **48 px d'écart** |
| `visible = false` | 0 px | **0 px — aligné** |

Cohérent avec la mesure Odoo : span vide = 32 px dans l'éditeur, 0 px en public. **Les trois surfaces ne s'accordent que si le sous-titre est masqué, pas vidé.** Le modèle deux colonnes a donc besoin d'un booléen d'affichage — même mécanique qu'`accroche2` sur `ds.section-header`.

## Cible

```
Titres (row, align: end, gap 32)
├─ colGauche (column, gap 16)   SectionHeader + sousTitre
└─ Bouton
```
Sous-titre **masqué** (booléen `sousTitre2`, défaut `true`) → la colonne gauche rétrécit → les deux colonnes étant alignées en bas, le bas du titre tombe sur le bas du CTA. Aucune variante de composant : un booléen, comme `accroche2`. **Contrepartie acceptée par l'owner** : le titre perd la pleine largeur (1550 → ~1164 avec le CTA le plus large) — à vérifier, pas à supposer.

## Context

| Fichier / nœud | Rôle |
|---|---|
| Figma master `2111:3382` | **Muté** — seul geste d'écriture canvas |
| Figma `2111:3388/3402/3416/3430/3444/3458/3472/3486` | 8 instances — relevées, **jamais éditées** |
| `contracts/hero.contract.json` | Anatomie restructurée + bump (voir Décision de version) |
| `src/components/Hero/**`, `figma-sync/*.js`, `catalog/catalog.json` | **Générés** — `npm run build`, jamais à la main |
| `integrations/odoo/addons/piqueray_ds/views/components.xml` | QWeb `s_pqr_hero` restructuré + `data-ds-contract-version` + `data-ds-graph-digest` |
| `integrations/odoo/config/hero.authoring.json` | Les `partPath` codent `root/blocTexte/Titres/wrapper/sousTitre` — **l'adresse change** |
| `integrations/odoo/addons/piqueray_ds/static/src/js/version_guard.js` | Constantes en dur : `ds.hero`, `CURRENT_GRAPH_DIGEST`, `CURRENT_MODULE_VERSION` |
| `integrations/odoo/addons/piqueray_ds/__manifest__.py` | Version de module à bumper |
| `.../css/generated/components.pqr.css` | **Généré** — `npm run odoo:assets` |
| Re-pins (5) | `evals/golden.json` · `figma-sync/plugin/engine.receipt.json` · `integrations/odoo/config/inputs.lock.json` · `extract/figma/visual-parity/baseline.json` · `parity/snapshots/figma-components.json` |
| `specs/tiny/proofs/hero-titres-deux-colonnes/` | Reçus : overrides, géométries, PNG + diffs, avant/après |

## Décision de version

`ds.hero` **1.5.0 → 1.6.0 (MINOR)** : une prop **ajoutée** (`sousTitre2`, booléen, défaut `true`) — aucune retirée ni renommée, les trois existantes sont intactes. Prop optionnelle ajoutée = MINOR, règle du dépôt. L'anatomie n'est pas l'API publique de props. **Mais** les adresses de parts changent, et `hero.authoring.json` les code en dur : la config Odoo doit bouger dans le **même** changement, sinon `npm run odoo:authoring:check` rougit sur une adresse fantôme.

## Conséquence à annoncer avant de commencer

Le `graphDigest` change. `version_guard.js` compare ce digest sur **toute** racine sauvegardée : au prochain chargement, **les 10 sections déjà posées sur toutes les pages passent `structure-stale`**, pas seulement le hero. Odoo ne migre rien — il faudra re-poser et re-saisir. C'est la raison de faire ce changement **avant** de monter les pages, pas après.

## Résultats de la mutation (T3–T8 — 2026-08-22)

Version Figma d'avant : `2390641745092529658`. Master muté, **aucune instance éditée**.

**Overrides : 8/8 intacts** — titre, sous-titre, libellé de CTA. La répétition avait vu juste.

| page | lignes sous-titre | bas(Titre) avant → après | décalage | chevauchement avant → après |
|---|---|---|---|---|
| PdG-industrielles | 2 | 515 → 512 | −3 | 0 → 0 |
| **Portes-de-garage** | 2 | 583 → 512 | **−71** | **55 → 0** |
| Contactez-nous | 2 | 515 → 512 | −3 | 0 → 0 |
| À-Propos | 2 | 515 → 512 | −3 | 0 → 0 |
| Dépannage-SAV | 1 | 525 → 544 | **+19** | 0 → 0 |
| Portes-d-entrée | 1 | 525 → 544 | **+19** | 0 → 0 |
| Motorisation | 1 | 525 → 544 | **+19** | 0 → 0 |
| PdG-résidentielles | 2 | 515 → 512 | −3 | 0 → 0 |

**Correction du spec** : le décalage annoncé de « 3 px sur les 7 pages » était faux. Mesuré, il dépend du nombre de lignes du sous-titre — **−3 px** à 2 lignes, **+19 px** à 1 ligne. Cause : empilé en colonne, `titre + gap 16 + sousTitre(32)` = 116 px, contre `SectionHeader(65) + gap 16 + wrapper(54)` = 135 px avant. Le bloc raccourcit, et comme il est ancré en bas, le titre descend.

Aucun titre n'a gagné de ligne malgré la colonne réduite à 1164 px : le pire cas (`Motorisations intelligentes et sécurisées`, 41 car.) tient toujours sur une ligne.

**Diff pixel** (`npx tsx specs/tiny/proofs/hero-titres-deux-colonnes/diff.mjs`) : 0,48 % à 1,83 % sur les 7 pages — la signature du décalage vertical — et **8,99 %** sur `Portes-de-garage`, la page réparée.

**Alignement prouvé** : démo permanente `Hero — SousTitre2 = false` (`2538:5208`) posée dans la Section `Hero` de `DS · Organisms`, sous le conteneur du master. `bas(Titre)` = `bas(CTA)` = 1856 → **écart 0 px**.

## Requirements

1. Plus aucun `FIXED` vertical dans la chaîne `blocTexte → Bouton` du master Figma.
2. `bottom(Titre) < top(bloc suivant)` sur les **8** instances, titre 1 ou 2 lignes ; `blocTexte` reste dans les 640 px.
3. **Aucun override perdu** : les 8 pages conservent titre, sous-titre, libellé de CTA et photo. Toute perte est repossée depuis le relevé d'avant.
4. Aucune dégradation non nommée : diff `pixelmatch` avant/après des 8 heroes ; tout titre passant de 1 à 2 lignes est nommé page par page.
5. Le contrat porte la cible ; les 4 surfaces sont **régénérées**, jamais éditées.
6. Odoo : sous-titre **masqué** → `bottom(titre) == bottom(CTA)` à ±2 px, mesuré **en public ET dans l'éditeur** (un texte seulement vidé ne suffit pas — mesuré). Sous-titre affiché → rendu inchangé hors la largeur du titre.
7. Toutes les portes vertes (`build`, `parity`, `eval`, `plugin:check`, roundtrip, `core-browser-check`, `tsc` ×2, `odoo:*`). Les 5 re-pins relus un par un, jamais acceptés en bloc.
8. §X tenu : capture des 9 nœuds vérifiée non vide **avant** le premier `set` ; version Figma nommée posée avant mutation.

## Plan

**A — Source.** Répétition sur clone du master (constater ce que Figma casse côté overrides) → relevé AVANT (overrides + géométries + PNG des 8) → version nommée → mutation du master → vérification overrides, géométries, diff d'image.
**B — Contrat.** Porter la cible dans `contracts/hero.contract.json`, bump 1.6.0 → `npm run build` → relire les 4 surfaces générées.
**C — Odoo.** QWeb restructuré, `hero.authoring.json` réadressé, `version_guard.js` + `__manifest__.py` bumpés, `npm run odoo:assets`, addon mis à jour sur l'instance jetable.
**D — Portes et preuves.** Sweep complet, 5 re-pins relus, mesures d'acceptation §6 capturées sur les deux surfaces.

## Tasks

- [ ] T1 — pont figma-console prouvé (`figma_get_status --probe`)
- [x] T2 — répétition sur clone : overrides survivants · sizing à réaffirmer sur 2 axes · masquer ≠ vider (verdict ci-dessus)
- [x] T3 — relevé AVANT des 9 nœuds : overrides + géométries + PNG (§X)
- [x] T4 — version Figma nommée
- [x] T5 — mutation du master : HUG + deux colonnes + **réaffirmer FILL/HUG sur `Titres`** + booléen d'affichage du sous-titre
- [x] T6 — overrides vérifiés sur les 8 ; repose depuis T3 si perte
- [x] T7 — géométries APRÈS : zéro chevauchement, zéro débord des 640
- [x] T8 — diff `pixelmatch` des 8 heroes + compte de lignes de titre avant/après
- [x] T9 — `contracts/hero.contract.json` : anatomie cible + prop `sousTitre2` + bump 1.6.0
- [x] T10 — `npm run build` ; les 4 surfaces relues, aucune édition manuelle
- [x] T11 — QWeb `s_pqr_hero` restructuré (+ `data-ds-contract-version`, `data-ds-graph-digest`)
- [x] T12 — `hero.authoring.json` réadressé ; `npm run odoo:authoring:check` vert
- [x] T13 — `version_guard.js` (3 constantes) + `__manifest__.py` bumpés
- [x] T14 — `npm run odoo:assets` ; `--check` sans `tampered`
- [x] T15 — addon mis à jour sur l'instance ; hero reposé sur une page fraîche
- [x] T16 — acceptation §6 mesurée **public + éditeur**, capturée
- [x] T17 — sweep complet des portes + `odoo:*` ; 5 re-pins relus un par un
- [x] T18 — signaler sans corriger : `Accroche` (`sizV: FIXED` 25) — vivante là où `accroche2: true` (FAQ, Réassurances, Coordonnées, Formulaire) — et le `U+2028` du titre de `Portes de garage`

## Propagation contrat → Odoo (T9–T17 — 2026-08-23)

`ds.hero` **1.6.0** : anatomie en deux colonnes + prop `sousTitre2` (booléen, défaut `true`). Les 4 surfaces régénérées, jamais éditées.

**Le compte de copies des mêmes constantes était faux dans ce spec : il y en a CINQ, pas trois.** Découvertes une par une, chacune par une porte :

| copie | fichier | trouvée par |
|---|---|---|
| 1 | `views/components.xml` (9 gabarits) | édition directe |
| 2 | `static/src/js/version_guard.js` | lecture préalable |
| 3 | `__manifest__.py` | lecture préalable |
| 4 | `scripts/odoo/scan-saved-versions.ts` | `odoo:module:check` |
| 5 | `evals/fixtures/odoo-production/version-drift/cases.json` | `npm run eval` |

Corollaire : **la version d'authoring et le digest sont module-wide, pas par section.** Bumper le seul Hero l'aurait rendu `policy-stale` en permanence ; les 9 gabarits ont donc été portés ensemble (authoring 1.1.0 → 1.2.0, module 19.0.1.6.0 → **19.0.1.7.0**, digest → `0e65b5e4…`).

**Bascule d'affichage** : `pqr-soustitre-on` sur la racine (motif `pqr-cta-on` de la Présentation) + `BuilderCheckbox` dans le panneau Hero + bloc CSS `ODOO-024-HERO-SOUSTITRE-MECHANICS` dans `odoo-bridge.css`, inscrit au registre (67 → 68 adaptations).

### Acceptation §6 — mesurée sur les DEUX surfaces (localhost:8071, hero posé et sauvegardé)

| surface | sous-titre | bas(Titre) | bas(CTA) | écart |
|---|---|---|---|---|
| public | affiché | 598 | 678 | 80 |
| public | **masqué** | 678 | 678 | **0** |
| éditeur | affiché | 566 | 678 | 112 |
| éditeur | **masqué** | 678 | 678 | **0** |

Le sous-titre masqué tombe à `h = 0` sur les deux surfaces — c'est le `display: none` qui le retire du flux, là où un texte vidé gardait 32 px dans l'éditeur (et 96 px ici, la boîte de ligne éditable). La prop était bien nécessaire.

**Parité visuelle Odoo ↔ contrat** : `hero-default` **0,0071 %** (`specs/tiny/proofs/hero-titres-deux-colonnes/odoo-visual/out/comparaison-image.json`).

### Portes — sweep final, tout vert

`build` · `parity` (0 dérive nouvelle, 10 acquittements pré-existants) · `eval` **220/220** · `plugin:check` · `deterministic-roundtrip` · `core-browser-check` · `tsc` ×3 · `odoo:assets --check` · `odoo:inputs:check` · `odoo:authoring:check` · `odoo:module:check` **19/19** · `odoo:derivation:check` (68 blocs) · `odoo:visual:selftest --strict --subjects` 9/9.

**Re-pins relus, quatre et non cinq** : `evals/golden.json` (199 fichiers), `figma-sync/plugin/engine.receipt.json`, `integrations/odoo/config/inputs.lock.json`, `parity/snapshots/figma-components.json`. `extract/figma/visual-parity/baseline.json` **n'a pas bougé** — le sujet `hero` y compare le rendu à la référence, pas à une empreinte de position.

> **Limite nommée** : le cliché `figma-components.json` a été rafraîchi **sur la seule entrée `Hero`**, pas par une extraction intégrale — le cliché complet ne passait pas dans une réponse du pont. Les autres entrées gardent donc leur date d'avant.

## Revue `/simplify` (4 agents) — ce qui a été corrigé, ce qui est parqué

**Corrigé dans ce changement — six constats, dont trois que le diff avait cassés :**

1. **Deux fichiers de test visaient encore la part supprimée.** `integrations/odoo/qa/scenarios/hero.spec.mts` interrogeait `hero-wrapper` → le scénario serait parti rouge ; `evals/fixtures/hero-responsive-render-check.ts` cherchait `.hero__wrapper` (fixture orpheline, appelée par aucune porte — l'agent la croyait vive, elle ne l'est pas). Les deux portés.
2. **La fixture du panneau ne listait pas le nouveau contrôle** — l'inventaire strict du scénario aurait échoué. `hero-subtitle-visible` ajouté.
3. **Le levier booléen n'avait aucun reçu.** Règle du dépôt : fixture → eval → claim. Un constat mesure désormais, par bascule réelle dans l'éditeur, que le sous-titre masqué quitte le flux et que `bas(Titre) == bas(CTA)` — et que c'est réversible. Scénario Hero : **14/14**.
4. **Le nom de part cassait la convention voisine** : `hero-colgauche` était la seule occurrence de cette forme ; la Présentation nomme la même part `left-column`. Renommé `hero-left-column` avant qu'il n'entre dans des blocs sauvegardés.
5. **819 lignes de bruit dans `adaptation-registry.json`** : j'avais re-trié le fichier après insertion. Revenu à l'ordre d'origine → **13 lignes**. `odoo:derivation:check` confirme que l'ordre n'a aucun effet.
6. **Deux descriptions de contrat mentaient** : celle de `sousTitre` décrivait « le bouton Hug voisin », qui n'est plus son voisin ; celle de `sousTitre2` taisait sa provenance Figma, contrairement à toutes les autres props booléennes issues d'un master.

**La porte de versions a été étendue — c'est le vrai gain de la revue.** `check-module.ts` n'ancrait qu'**un quart** des littéraux recopiés : les paires `data-ds-contract-version`, et rien d'autre. Le digest (×11), les versions de module (×33), la version d'authoring (×11) et la constante `AUTHORING` de `scan-saved-versions.ts` n'étaient comparés à **rien** — c'est précisément pourquoi `AUTHORING` m'avait échappé jusqu'à l'eval. Les quatre familles sont désormais fail-closed. Effet immédiat : la correction des descriptions a changé le hash du contrat donc le `graphDigest` (`0e65b5e4…` → `c00ad023…`), et la porte étendue a vérifié les 15 occurrences portées.

**Parqué, nommé, pas fait :**

- **La chaîne `mechanism: boolean` n'est gouvernée à aucun maillon** — la classe-drapeau (`pqr-soustitre-on`) doit être écrite à l'identique dans le QWeb, le panneau et la CSS de pont, et n'apparaît dans aucune config ni schéma. Une faute de frappe donne un contrôle silencieusement inerte, aucune porte ne rougit. Un champ `toggleClass` dans le schéma d'authoring + ~40 lignes de porte. **Rentable dès le 3ᵉ usage, et on y est.**
- **`data-ds-authoring-version` est un scalaire module-wide qui porte le même nom qu'`authoringVersion`, per-config et allant de 1.0.0 à 2.0.0.** Deux choses différentes, un seul nom. À trancher : renommer, ou lier.
- **Le cas `current` de la fixture d'eval est écrit à la main** au lieu d'être dérivé du lock — 5ᵉ copie, la seule encore hors porte.
- **~60 répétitions de la version dans `hero.authoring.json`** : bruit de revue réel, mais chaque occurrence est comparée au dépôt et refusée par nom. Épinglage volontaire, pas dérive silencieuse. Laissé.
- **`scan-saved-versions.ts` pourrait dériver du lock** plutôt que transcrire (il importe déjà `repo-data.js`) — mais la porte regexe ces constantes, donc les deux bougent ensemble. Spec séparée.

## Done When

- [ ] Toutes les tâches cochées
- [ ] Zéro chevauchement sur les 8 instances, aucun override perdu
- [ ] Sous-titre vide → titre et CTA alignés en bas, prouvé sur les deux surfaces
- [ ] Portes vertes, re-pins relus, diffs d'image archivés sous `specs/tiny/proofs/hero-titres-deux-colonnes/`
