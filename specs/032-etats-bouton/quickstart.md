# Quickstart — vérifier les états du Bouton de bout en bout

**Spec** : [spec.md](spec.md) · **Plan** : [plan.md](plan.md) · **Date** : 2026-09-04

Ce guide **valide**, il n'implémente pas. Chaque étape produit un reçu sous
`specs/032-etats-bouton/proofs/`. Les commandes sont à lancer **dans ce
worktree** (§Worktree Gates, F1).

---

## Prérequis

```bash
node -v                              # >= 20
ls node_modules >/dev/null           # présent, sinon : npm install
ls ~/Library/Caches/ms-playwright    # chromium présent, sinon : npx playwright install chromium
```

Pour les étapes canevas uniquement :

- Figma Desktop ouvert sur **« Piqueray (Copy) »** (`d9FYAUcqdcNtsuaMgLefvJ`),
  plugin **Desktop Bridge** lancé ;
- `mcp__figma-console__figma_get_status` → `portFallbackUsed: false`
  (sinon : recette « pont-figma-ports-satures » en mémoire projet) ;
- `FIGMA_TOKEN` lisible (`.env.local` du checkout principal).

Pour l'étape Odoo : une instance Docker **jetable**.
**Jamais `piqueray-odoo-test` (8071)** — c'est celle de l'owner.

---

## Étape 0 — La ligne de base, avant de toucher quoi que ce soit

```bash
npm run build && npm run parity && npm run eval
npm run plugin:check
npx tsx scripts/deterministic-roundtrip.mjs
node scripts/core-browser-check.mjs
npx tsc --noEmit && npx tsc -p tsconfig.build.json
npm run odoo:inputs:check && npm run odoo:authoring:check && npm run odoo:module:check
npm run odoo:derivation:check && npm run odoo:figma-links:check && npm run odoo:typecheck
git status --short
```

**Attendu** : tout vert, arbre propre hors `specs/032-etats-bouton/`.
Le `N/N` d'`npm run eval` est **relevé, jamais recopié depuis une prose** — c'est
la seule valeur qui compte pour SC-005 et SC-007.

Reçu : `proofs/T0/gates.txt`.

### 0b — La photo du repos (elle ne se rattrape pas)

```bash
npx tsx specs/032-etats-bouton/tools/render-repos.mts --out proofs/T0/repos/
```

Rend les **7 styles au repos** par `emit-html` dans Chromium, un PNG par style.
C'est l'avant de SC-006 ; une fois le contrat modifié, il est perdu.

### 0c — La photo du canevas (§X — avant toute mutation)

```bash
npx tsx extract/figma/state-photo/run.ts capture 032-avant --refresh
```

Puis, par le pont, un relevé des instances **par identifiant**, pas par nom :

```js
// figma_execute
await figma.loadAllPagesAsync();
const set = await figma.getNodeByIdAsync('6:122');
const inst = await set.getInstancesAsync();
JSON.stringify({ variantes: set.children.map(c => ({ id: c.id, nom: c.name })),
                 instances: inst.length,
                 parVariante: inst.reduce((a,i)=>((a[i.mainComponent.id]=(a[i.mainComponent.id]||0)+1),a),{}) });
```

Reçu : `proofs/T0/canvas-avant.json` — **le compte d'instances de référence**
(la spec en annonce 354 ; c'est ce relevé qui fait foi, pas le chiffre).
Poser ensuite une version nommée sur le fichier
(`saveVersionHistoryAsync('032 — avant états du Bouton')`).

**Vérifier chaque capture non vide et correctement dimensionnée avant de
continuer.** Une capture ratée découverte après la mutation est irrécupérable.

---

## Étape 1 — Débloquer le sync de jetons (migration de marqueur)

Sans elle, `01-tokens.js` refuse **avant** d'écrire la moindre variable.

```js
// figma_execute — écriture de métadonnée pure, aucun pixel ne bouge
const styles = await figma.getLocalTextStylesAsync();
const cibles = [['Entrée menu','typography.menu-entree.size'],
                ['Sous-entrée menu','typography.menu-sous-entree.size']];
const rapport = cibles.map(([nom, chemin]) => {
  const s = styles.find(x => x.name === nom);
  if (!s) return { nom, verdict: 'ABSENT' };
  const deja = s.getSharedPluginData('ds_contracts','textStyleToken');
  return { nom, id: s.id, marqueurExistant: deja || null,
           recette: { police: s.fontName, taille: s.fontSize,
                      interligne: s.lineHeight, casse: s.textCase } };
});
JSON.stringify(rapport);
```

**Vérifier d'abord** que la recette vive correspond au jeton (la spec l'affirme,
ce relevé le prouve), **puis** poser le marqueur. Un marqueur déjà présent sur un
autre style est un **doublon** : le préflight lève
`Duplicate Text Style identity marker` — arrêter, ne pas forcer.

**Attendu** :

```bash
npm run tokens && node -e "1" # 01-tokens.js régénéré sans erreur de préflight
```

Reçu : `proofs/etape1/marqueurs.json` (avant/après).
Corriger dans la foulée les styles nommés à tort dans `docs/03-token-pipeline.md`.

---

## Étape 2 — Les jetons, puis le contrat, puis les trois surfaces

```bash
npm run build
```

**Attendu, à vérifier ligne à ligne** :

```bash
# 42 feuilles neuves atteignent le CSS livré
grep -c -- "--color-etat-" src/styles/tokens.css          # 35
grep -c -- "--color-noir-profond\|--color-transparent" src/styles/tokens.css

# le React livré porte les 7 x 3 règles d'état
# une règle par (état x canal x style) ; les canaux sans substitution en font une seule
grep -c ":hover"          src/components/Button/Button.module.css   # 14 = 7 fonds + 7 libellés
grep -c ":active"         src/components/Button/Button.module.css   # 14 = 7 fonds + 7 libellés
grep -c ":focus-visible"  src/components/Button/Button.module.css   # 9  = 7 anneaux + outline-width + la bague d'office
grep -n  "outline-style: solid" src/components/Button/Button.module.css

# le CSS Odoo les porte aussi — par génération, pas à la main
grep -c ":hover" integrations/odoo/addons/piqueray_ds/static/src/css/generated/components.pqr.css

# le repos n'a pas bougé : le diff de l'or ne montre que des AJOUTS
git diff src/components/Button/Button.module.css | grep "^-" | grep -v "^---"   # vide
```

**Attendu FR-010/SC-006** — la dernière commande ne doit **rien** afficher.
Une ligne supprimée signifie que le repos a bougé : arrêter.

Puis la preuve pixel :

```bash
npx tsx specs/032-etats-bouton/tools/render-repos.mts --out proofs/etape2/repos/
for v in default orange blanc outlineBlanc link outlineNoir iconOnly; do
  npm run images:compare -- --before proofs/T0/repos/$v.png \
                            --after  proofs/etape2/repos/$v.png \
                            --out    proofs/etape2/diff/$v
done
```

**Attendu** : `0.0000 %` sur les 7. C'est SC-006.

---

## Étape 3 — Les états sur le site Odoo (US1, US2)

```bash
npm run odoo:page -- home <projet-docker-jetable>
```

Puis, dans le navigateur (`/odoo/website?enable_editor=1&with_loader=1` pour
l'éditeur, l'URL visiteur pour le test) :

| Vérification | Attendu | Exigence |
|---|---|---|
| survoler chaque style présent sur la home | l'aspect change, visible à l'œil | FR-001, SC-001 |
| survoler « Lire la suite » / « Voir tous les avis » (Link) | le libellé passe au noir pur | FR-013 |
| survoler un bouton à contour | il se remplit, le libellé s'inverse | FR-002 |
| presser (souris maintenue, ou doigt) | teinte distincte du survol | FR-003 |
| parcourir la page à la seule touche Tab | aucun bouton ne prend le focus sans anneau | FR-004, US2 |
| Tab dans le hero et le pied de page (fond sombre) | anneau blanc, nettement visible | FR-005, SC-002 |
| **cliquer** un bouton à la souris | **aucun** anneau | FR-006 |

Mesure du contraste de l'anneau sur les fonds réels (SC-002) : capture d'écran +
pipette, ou `getComputedStyle` sur la page vive. Le registre attendu est dans
`contracts/state-tokens.matrix.json` → `focusRingLedger`.

Reçu : `proofs/etape3/` — captures et tableau de relevés.

### 3b — Reconstruire et resauvegarder (FR-018, SC-008)

```bash
# dans l'instance jetable
odoo -u piqueray_ds
npm run odoo:page -- home <projet-docker-jetable>
npm run odoo:save
npx tsx scripts/odoo/scan-saved-versions.ts
```

**Attendu** : zéro bloc en `structure-stale`.

---

## Étape 4 — Le canevas (US3)

**Ordre obligatoire** : jetons d'abord (les cases d'état lient des variables),
Bouton ensuite.

```bash
npm run figma:plan
```

Exécuter par le pont `figma-sync/01-tokens.js`, puis `figma-sync/NN-button.js`.

**Attendu** :

| Vérification | Attendu | Exigence |
|---|---|---|
| variantes du set `Bouton` | 7 → **28** (7 renommées `, State=Default` + 21 créées) | FR-008 |
| identifiants des 7 variantes d'origine | **inchangés** vs `proofs/T0/canvas-avant.json` | FR-009 |
| instances rattachées | même compte qu'à l'étape 0, zéro orpheline, zéro doublon | FR-009, SC-003 |
| variables `color/etat/…` | 35 créées, plus 7 primitives | FR-007 |

```bash
npx tsx extract/figma/state-photo/run.ts capture 032-apres --refresh
npx tsx extract/figma/state-photo/run.ts compare 032-avant 032-apres
```

### 4b — L'idempotence (FR-017, SC-009)

Relancer **le même** script du Bouton sans rien changer.

**Attendu** : rapport `skipped: true, reason: "unchanged"`, ou
`addedVariants: [], rebuiltVariants: 0` — **zéro nœud créé, zéro modifié**.

Reçu : `proofs/etape4/idempotence.json`.

---

## Étape 5 — L'évaluation qui tient la promesse (FR-015, SC-005)

`focus-not-pressed-browser-probe` sort de quarantaine et pointe sur les jetons
Piqueray.

```bash
npm run eval
```

**Attendu** : le `N/N` relevé à l'étape 0, **plus au moins 1**, et la ligne de
quarantaine décrémentée d'autant.

**Contrôle adverse — obligatoire, sinon la promesse n'est pas prouvée** :

```bash
# casser volontairement, une seule ligne, puis revenir
# 1) retirer "focus-visible" de contract.states  → l'eval doit ROUGIR par nom
# 2) faire porter au :focus-visible le fond de survol → l'eval doit ROUGIR
```

Un cas qui reste vert quand on le sabote ne prouve rien. Reçu :
`proofs/etape5/adverse.txt` (les deux rouges, puis le vert restauré).

Mettre à jour `evals/REMOVED-CASES.md` : la quarantaine n'est jamais silencieuse.

---

## Étape 6 — Le balayage de clôture

Reprendre **l'intégralité** de l'étape 0, plus :

```bash
npm run geometry:gate
npm run mint:check && npm run mint:code:check
npm run verify:catalog
```

**Attendu (SC-007)** : tout vert, et `parity/baseline.json` **toujours à 40
entrées** — pas une de plus. Un acquittement neuf signifierait qu'on a laissé un
axe rouge derrière soi ; c'est exactement la dette que 015 avait créée et que 016
a dû rembourser.

---

## Tableau de correspondance — critère → preuve

| Critère | Étape | Reçu |
|---|---|---|
| SC-001 (7 styles, survol + pressé visibles) | 3 | `proofs/etape3/` |
| SC-002 (anneau ≥ 3:1 sur les fonds réels) | 3 | `proofs/etape3/anneau.md` |
| SC-003 (354/354 instances rattachées) | 0c + 4 | `proofs/T0/canvas-avant.json`, `proofs/etape4/` |
| SC-004 (zéro règle d'état à la main, périmètre Bouton) | 2 | `proofs/etape2/grep-manuel.txt` |
| SC-005 (compte d'evals +1 minimum) | 5 | `proofs/etape5/` |
| SC-006 (repos : écart nul sur 7 styles) | 0b + 2 | `proofs/etape2/diff/` |
| SC-007 (toutes les portes vertes vs T0) | 0 + 6 | `proofs/T0/gates.txt`, `proofs/cloture/gates.txt` |
| SC-008 (home reconstruite, zéro structure périmée) | 3b | `proofs/etape3/scan-saved-versions.json` |
| SC-009 (second sync sans effet) | 4b | `proofs/etape4/idempotence.json` |
