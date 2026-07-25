# Vérification bonnes pratiques Figma — atomes : page `DS · Atomes` (2052:1144) + atomes d'`Assets` (0:1)

**Date** : 2026-07-25 · **Fichier** : Piqueray (Copy) `d9FYAUcqdcNtsuaMgLefvJ` · **Lecture seule** : aucune modification apportée au fichier Figma. Jumeau de [bonnes-pratiques-molecules.md](bonnes-pratiques-molecules.md) et [bonnes-pratiques-organisms.md](bonnes-pratiques-organisms.md).

**Outils** : `figma_lint_design` ×2 (DS · Atomes : 21 nœuds ; Assets : 213 nœuds), `figma_audit_design_system_report` (fichier entier, déjà couru : 67/100), `figma_analyze_component_set` (Bouton), `figma_audit_component_accessibility` ×2 (Checkbox, Bouton), scans structure `figma_execute` lecture seule (bindings, propriétés, calques cachés, registre icônes).

**Verdict global : deux mondes.** La page `DS · Atomes` (masters récents, specs 003/004) est **la plus propre des 4 pages auditées** : 7/7 décrits, tokens bindés partout, zéro hack. Les dettes vivent sur **Assets** (masters hérités de l'import initial, pré-spec-001) : axe `Property 1` sur les 4 sets, valeurs de variant visuelles avec une **faute d'orthographe** (« Outilne noir »), un **chevron fantôme** instancié ×4 par Header nav, ~30 calques `Vector`/`Group` aux noms par défaut, 4 descriptions manquantes.

## Page `DS · Atomes` — 7 masters (sections Formulaire + Icônes)

| Master | Node | Type | Desc | Verdict | L'essentiel |
|---|---|---|---|---|---|
| Input | `2053:1245` | Simple | ✓ 251 c | ✅ | Prop `Valeur:TEXT`, tout bindé ; bordure `#9BA4B5` = 2,5:1 (token) |
| Textarea | `2053:1247` | Simple | ✓ 305 c | ✅ | Idem, propre |
| Select | `2053:1249` | Simple | ✓ 358 c | ✅ | Instancie le bon `chevron-down` du registre ✓ |
| Checkbox | `2053:1256` | Set 2 variants | ✓ 330 c + notes a11y | 🟡 | Case 20×20 < 24×24 (WCAG 2.5.8) ; pas de variant focus (doctrine code) |
| Facebook | `2053:1259` | Simple | ✓ 149 c | 🟡 | Enfant `Vector` nom par défaut |
| Instagram | `2053:1261` | Simple | ✓ 150 c | 🟡 | Idem |
| Étoile | `2053:1263` | Simple | ✓ 240 c | 🟡 | Idem (`Vector` de type STAR) |

**Bon (vérifié)** : 7/7 vrais composants, **7/7 décrits** (Checkbox avec notes a11y honnêtes — « atome net-new, aucune référence dans les 9 maquettes »), **zéro couleur non bindée**, zéro calque caché, zéro position absolue, props typées (`Valeur:TEXT` ×3, `Coché:VARIANT Non|Oui`).

**Écarts réels** :
- **Bordure de l'Input `#9BA4B5` sur blanc = 2,5:1** — sous les 3:1 exigés pour les composants d'interface (WCAG 1.4.11). Même token `color/bleu-gris` que les labels de Field : la décision token couvre les deux.
- **Checkbox 20×20** sous le minimum tactile 24×24 (WCAG 2.5.8) sur ses 2 variants — a11y 45/100 à cause de ça + focus (porté par le code, doctrine repo ; le contrat devra le prévoir).
- 3 enfants `Vector` aux noms par défaut (icônes sociales) ; 3 « Texte de saisie » sans text style (systémique fichier).

## Atomes sur `Assets` — 4 sets + registre de 15 icônes

| Master | Node | Desc | Verdict | L'essentiel |
|---|---|---|---|---|
| Bouton | `6:122` | **0** | 🟠 | Structure propre, nommage et contraste pas |
| piqueray_logo | `4:14` | **0** | 🟠 | `Property 1`, ~20 `Vector`/`Text` par défaut |
| Header nav | `84:285` | **0** | 🔴 | Instancie ×4 un chevron fantôme ; posé hors section |
| member-picture | `274:2389` | **0** | 🟠 | `Property 1=Default\|hover` (état comme valeur d'axe) |
| 15 icônes registre | section Icônes | ✓ ×15 (34-58 c) | 🟡 | Toutes avec enfant `Vector (Stroke)`/`Group` par défaut |

### 🔴 Header nav (`84:285`) — chevron fantôme
Instancie ×4 **`octicon:chevron-down-12`** (`6:119`) : un master **détaché du canvas** (il ne vit sur aucune page — reste de l'import initial), alors que le `chevron-down` du registre existe (`226:373`, Assets). Doublon d'icône hors registre + composant fantôme → à re-swapper vers le registre. Aussi : posé directement sur la page (seul master hors section), axe `Property 1` (Solid|Transparent), description vide. Les « blanc sur blanc » du lint sur ses nav items = artefact (variant Transparent destiné à être posé sur photo).

### 🟠 Bouton (`6:122`) — structure exemplaire, habillage pas
- **La leçon spec 001 a bien été appliquée, vérifié** : les 12 calques arrow cachés sont **officiellement bindés** (`visible` → BOOLEAN `Icône gauche/droite`, `mainComponent` → INSTANCE_SWAP `Glyphe gauche/droite`), `Libellé` bindé TEXT. Ce n'est PAS le hack d'avant-001. A11y 85/100.
- **Axe `Property 1`** (nom par défaut) avec 6 **valeurs visuelles** : `Default | Orange | Blanc | Outline blanc | Link | Outilne noir` — dont la **faute « Outilne »**. (Le « Property 1=Orange » de l'audit fichier vient d'ici.)
- **Texte blanc sur fond orange `#F98A0B` = 2,4:1** (variant Orange — le CTA principal). Même paire tokens que Poste/titres orange : une seule décision design corrige tout.
- Description vide (l'atome le plus instancié du fichier — 14+ usages vus sur les 2 pages DS).
- Le menu du swap `Glyphe` reste à 13 icônes vs registre contractuel 16 — divergence déjà acquittée (spec 004), léguée à la prochaine itération d'écriture.

### 🟠 piqueray_logo (`4:14`) / member-picture (`274:2389`)
- Logo : axe `Property 1` avec `Default|Blanc` (mélange anglais/français + valeur visuelle), ~20 nœuds `Vector`/`Text` par défaut, variants sans auto-layout (défendable : lettrage vectoriel figé), description vide, set 220×128 pour des variants 180×34.
- member-picture : axe `Property 1` avec `Default|hover` — un **état interactif modélisé comme valeur d'axe anonyme** (casse incohérente en prime) ; images `fun-ia`/`normal` sans note alt ; variants sans auto-layout ; description vide.

### 🟡 Registre icônes (15 masters, section Icônes)
external-link, arrow-left/right, cart, chevron-up/down/left/right, user, search, pdf, download, phone, mail, piqueray. **Toutes décrites** ✓. Tous les enfants aux noms par défaut (`Vector (Stroke)`, `Vector`, `Group`, `Group 2`) — c'est la **source racine des ~69 échos default-name** du lint d'Assets et des flags vus dans les instances sur les 3 autres pages. Tailles mixtes : 32×32 sauf arrow-left/right 20×20. Gouvernance des comptes (15 ici + 3 sociales sur DS · Atomes = 18 physiques, registre contractuel 16, menu Bouton 13) : déjà tracée specs 002/004, pas re-tranchée ici.

**Non audités en tant que composants** : sections Typo (8 spécimens texte) et Couleurs (10 pastilles) = planches de référence, pas des masters.

## Scores des outils, et le bruit écarté

- **Lint DS · Atomes** : 10 findings (4 critiques) — tous cités ci-dessus, quasi zéro bruit. Le « fond blanc sur blanc » de l'Input = artefact de canvas (le champ est délimité par sa bordure).
- **Lint Assets** : 103 findings (6 critiques) — signal : contraste Bouton Orange 2,4:1, ~30 noms par défaut racine (le reste = échos ×69 dans les instances), 8 « sans auto-layout » dont 3 = les SETs (faux positif habituel) et 4 = les variants logo/member-picture (réels mais défendables). Bruit : « blanc sur blanc » du Header nav Transparent et du Bouton Outline blanc (destinés aux fonds sombres/photos — le lint compare au canvas).
- **A11y** : Checkbox **45/100** (cible 20×20 + focus), Bouton **85/100** (il ne perd que sur la documentation).

## Lot de correction proposé (non appliqué)

1. **Header nav** : re-swapper les 4 `octicon:chevron-down-12` vers `chevron-down` (`226:373`) — supprime le fantôme ; ranger le set dans une section.
2. **Bouton** : renommer l'axe `Property 1` → un nom parlant, corriger « **Outilne** noir » → « Outline noir » (⚠︎ renommages = coordonner avec le contrat/parity côté repo — l'axe et les valeurs sont dans `bindings.figma`), écrire la description.
3. **Renommages `Property 1`** idem sur logo / Header nav / member-picture (+ trancher `hover` de member-picture : axe d'état nommé ou variant retiré).
4. **4 descriptions** (Bouton, logo, Header nav, member-picture).
5. Nommer les enfants des 18 icônes (mécanique, ~5 min via script).
6. Décisions design (pas à moi) : contraste blanc/orange 2,4:1 (CTA), bordure Input 2,5:1, taille Checkbox 20→24.
