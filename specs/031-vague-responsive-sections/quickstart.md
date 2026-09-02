# Quickstart — vérifier la vague 031 de bout en bout

Guide de **validation**, pas d'implémentation. Il dit comment prouver que la
vague a fait ce qu'elle annonce, et où regarder quand un chiffre ne colle pas.

Prérequis : worktree autosuffisant (`npm install`, `npx playwright install
chromium` — Worktree Gates F1). Un pont Figma est requis pour les étapes 2, 5 et
6 ; les étapes 1, 3, 4 et 7 tournent hors ligne sur les artefacts committés.

---

## 1. Le socle n'a pas bougé (SC-008)

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check
npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs
npx tsc --noEmit && npx tsc -p tsconfig.build.json
git status --porcelain src/ figma-sync/ catalog/ contracts/ tokens/ core/ evals/
```

Attendu : dernière commande **vide**. Le `N/N` de `npm run eval` est celui d'avant
la vague — 031 n'ajoute aucun cas (FR-015). Seul rouge toléré : la dette golden
028 préexistante, **strictement inchangée**.

`npm run parity` proposera de promouvoir `Presentation` en prop de contrat :
**ce patch ne doit pas avoir été accepté** (D1/FR-013). La forme gouvernée est
l'acquittement, vérifié à l'étape 4.

---

## 2. Les prérequis de G0 ont été mesurés, pas supposés (R4, R5)

```bash
cat specs/031-vague-responsive-sections/inventory/prerequis-g0.md
cat specs/031-vague-responsive-sections/inventory/partition-zones.json
```

Attendu :
- une **comparaison** du cliché de parité vif à
  `parity/snapshots/figma-components.json`, avec son verdict (frais / rafraîchi) ;
- l'état des ports 9223-9232 avec `portFallbackUsed:false` et le nombre de
  writers sains — si < 3, le repli séquentiel doit être **annoncé avec son coût**,
  pas subi ;
- le **parent relevé** de chacun des 13 masters, et la partition qui en découle.
  Deux campagnes de la même zone ne peuvent pas avoir tourné en parallèle.

---

## 3. Les treize dossiers sont complets — et rien de plus (SC-003)

Table de contrôle : [`contracts/dossier-campagne.md`](./contracts/dossier-campagne.md).

```bash
ls specs/031-vague-responsive-sections/decisions/*.json | wc -l   # ≥ 13
node -e "const r=require('./specs/031-vague-responsive-sections/inventory/registre-ecarts.json');
const c=r.filter(l=>l.famille==='campagne');
console.log('lignes campagne:', c.length);
console.log('verdicts:', c.reduce((a,l)=>(a[l.verdict]=(a[l.verdict]||0)+1,a),{}));
console.log('sans exigences citées:', c.filter(l=>!(l.exigencesCouvertes||[]).length).map(l=>l.campagne));"
```

Attendu : **13** lignes de campagne, chacune avec un verdict et des exigences
citées ; la somme `appliquée + sans changement` = les sections livrées, comptée
séparément des `reportée` (SC-001).

Pour chaque campagne, vérifier le **supplément** de son verdict :
- `appliquée` ⇒ `apply-second.json` avec `createdNodeIds: []`,
  `changedNodeIds: []`, `pageWrites: []`, `childWrites: []` (SC-005) ;
- `sans changement` ⇒ **aucun** `apply-*.json`, **aucune** capture `after` ;
- `reportée` ⇒ preuve du blocage + `briefSuivant` + décision de report si le
  blocage est postérieur à la séance.

---

## 4. L'axe est dans Figma, pas dans le contrat (FR-013)

```bash
node -e "const b=require('./parity/baseline.json');
console.log(b.filter(x=>x.includes('.Presentation')).sort().join('\n'));
console.log('total acquittements:', b.length);"
grep -l '"presentation"' contracts/*.contract.json   # attendu : aucun résultat
```

Attendu, **deux chiffres qu'il ne faut pas confondre** :

- entrées `.Presentation` : **2 → 14** (les deux préexistantes sont
  `CategoriesPrincipales.Presentation` et `HeroVideo.Presentation`, héritées de
  028/029 ; +12 si les douze sections passent) ;
- entrées **au total** dans `parity/baseline.json` : **12 → 24**.

La 13ᵉ campagne n'ajoute pas de ligne : si le renommage `HeroVideo` a été
appliqué, l'acquittement existant a été **re-qualifié** ; s'il a été reporté, il
est inchangé. Et **zéro** prop `presentation` dans un contrat.

---

## 5. Le sélecteur montre bien ce qui a été validé (SC-001, SC-009)

Sur le canevas, pour chaque section livrée : le sélecteur porte
`Presentation{Wide, Desktop, Mobile}`, la matrice est complète avec les axes
existants, et le défaut est le **membre historique**. Pour `Reassurances` :
9 membres (`Presentation{3} × Disposition{3}`).

Puis, dans les décisions :

```bash
node -e "const fs=require('fs'),p='specs/031-vague-responsive-sections/decisions';
for(const f of fs.readdirSync(p).filter(f=>f.endsWith('.json'))){
  const d=JSON.parse(fs.readFileSync(p+'/'+f,'utf8'));
  const facts=Array.isArray(d.acceptedFacts)?d.acceptedFacts:[];
  const struct=facts.filter(x=>x&&x.nature==='structurel');
  console.log(f, '| pickerConsequence:', d.pickerConsequence?'oui':'MANQUANTE',
    '| faits structurels sans témoin:', struct.filter(x=>!x.witnessRef).length);
}"
```

Attendu : `pickerConsequence` présente partout, **zéro** fait structurel sans
témoin de sélecteur. C'est SC-009, et c'est la parade à l'écart E2 de 029.

---

## 6. Les identités historiques sont intactes (SC-004)

Comparer `031-avant-vague` et `031-apres-vague` dans l'historique de versions
Figma : aucun composant ne change d'identité (`componentKey` préservée pour
chaque membre historique), aucun usage sur les Pages ne se détache, et
`pageWrites` / `childWrites` sont vides dans **tous** les reçus.

```bash
node -e "const fs=require('fs'),g=require('node:child_process');
const files=g.execSync('ls specs/component-repairs/*/run-*/receipts/apply-*.json 2>/dev/null || true')
 .toString().trim().split('\n').filter(Boolean);
for(const f of files){const r=JSON.parse(fs.readFileSync(f,'utf8'));
 const bad=(r.pageWrites||[]).length||(r.childWrites||[]).length;
 if(bad) console.log('ÉCRITURE INTERDITE:', f);}
console.log('reçus inspectés:', files.length);"
```

---

## 7. Les gates ont re-cité la spec (FR-011)

```bash
ls specs/031-vague-responsive-sections/proofs/gate-G*.md
```

Attendu : six fichiers, chacun portant sa table d'exigences re-citées avec, par
ligne, « couverte / non couverte » **et un chemin de preuve**. Une exigence
marquée couverte sans preuve rend le gate non franchi — c'est exactement ce que
029 n'avait pas et qui a laissé un livrable suivre le mauvais axe une journée.

---

## 8. Ce que ce quickstart ne valide PAS

- **La justesse esthétique des rendus mobiles** : elle appartient à la séance
  owner, pas à une commande. Aucun instrument du dépôt ne juge un design.
- **La parité visuelle des sections** : `visual-parity` ne couvre aucune des 12
  sections (limite connue, nommée dans `CLAUDE.md`). 031 ne la referme pas.
- **Le comportement responsive en code** : il n'existe pas. L'axe est un outil
  Figma ; `docs/FIGMA-CAPABILITY-MATRIX.md` classe `@media`/`@container`
  **CARRY-CODE-ONLY**.
- **Les enfants restés à traiter** : ils forment le brief du chantier suivant.
