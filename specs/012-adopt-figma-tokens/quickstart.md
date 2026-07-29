# Quickstart — Session d'adoption (~30 min, vérification comprise)

Le déroulé nominal, dans l'ordre. Chaque étape a son reçu ; toute sortie inattendue =
arrêt (protocole : `contracts/liste-blanche.md`). Tout s'exécute DANS le worktree (F1).

## 0 · Worktree prêt + état des lieux (≈3 min)

```bash
npx playwright install chromium        # idempotent ; npm install déjà fait (tsx présent)
git status --porcelain                 # doit être propre (hors specs/012-*)
npm run build && npm run parity && npm run eval   # baseline verte AVANT tout geste
```

## 1 · Rafraîchir le cliché (lecture seule — contrat : `cliche-refresh.md`) (≈5 min)

Pont figma-console connecté au fichier `d9FYAUcqdcNtsuaMgLefvJ` :
`figma_execute` ← contenu de `parity/extract-figma.plugin.js`, puis sauver
`{fileName, fileKey, extractedAt, collections}` du retour dans
`parity/snapshots/figma-tokens.json` (2 espaces, LF, newline final ; la partie `sets`
est ignorée). Vérifier : `fileKey` attendu, 2 collections (`Primitives`/`Semantic`),
comptes non vides. Pont indisponible → **arrêt nommé**, l'adoption ne démarre pas.

**Avant d'écrire le cliché — ancrages d'evals (D13).** Ce fichier est aussi une fixture
de la suite d'evals. Sur le retour *frais*, vérifier :

```bash
python3 - <<'EOF'   # sur le retour frais, AVANT de l'écrire sur disque
import json; snap = json.load(open('/tmp/figma-tokens.fresh.json'))
prim = next(c for c in snap['collections'] if c['name'] == 'Primitives')
by = {v['name']: v for v in prim['variables']}
bw = by.get('border-width/1')
assert bw and bw['values'].get('Value') == 1, 'ARRET D13: border-width/1 absent ou != 1'
assert 'color/orange' in by, 'ARRET D13: color/orange absent'
print('ancrages OK')
EOF
```

Échec → **arrêt**, arbitrage §VIII à la source, rubrique 3. Jamais l'eval réécrit.

**Reçu lecture seule (FR-010).** Noter dans le reçu : exactement UN `figma_execute`, en
lecture. C'est la seule preuve de FR-010 — elle s'écrit, elle ne se sous-entend pas.

## 2 · Re-relever les comptes + photographier l'angle mort (≈3 min)

```bash
python3 - <<'EOF'   # dénombrement, même méthode des deux côtés (reçu → proofs/)
import json
snap = json.load(open('parity/snapshots/figma-tokens.json'))
for c in snap['collections']: print(c['name'], len(c['variables']))
print('TOTAL Figma:', sum(len(c['variables']) for c in snap['collections']))
EOF
npm run parity || true                 # attendu : N findings figma-tokens/ahead (=77) — le reçu de l'angle mort
```

**Différence d'ensembles dans les deux sens** — des totaux justes ne prouvent rien, un
échange (une feuille perdue, une gagnée) passerait un contrôle de cardinal :

```bash
npx tsx -e '
import {readFileSync} from "node:fs";
const snap = JSON.parse(readFileSync("parity/snapshots/figma-tokens.json","utf8"));
const figma = new Set(snap.collections.flatMap((c:any)=>c.variables.map((v:any)=>v.name)));
const flat = (o:any,p:string[]=[]):string[] => o && typeof o==="object" && !("$value" in o)
  ? Object.entries(o).filter(([k])=>!k.startsWith("$")).flatMap(([k,v])=>flat(v,[...p,k]))
  : [p.join("/")];
const repo = new Set(["primitives","semantic"].flatMap(f =>
  flat(JSON.parse(readFileSync(`tokens/${f}.tokens.json`,"utf8")))));
const manquants = [...figma].filter(n=>!repo.has(n));
const perdues  = [...repo].filter(n=>!figma.has(n));
console.log("A adopter (cliché \\ dépôt):", manquants.length); console.log(manquants.join("\n"));
console.log("PERDUES (dépôt \\ cliché) — doit être VIDE:", perdues.length); console.log(perdues.join("\n"));
'
```

`perdues` non vide → **arrêt** : une des 62 a disparu ou été renommée côté Figma.
Arbitrage §VIII à la source, rubrique 3 — jamais une suppression côté dépôt pour faire
coller les comptes (FR-003 : les 62 sont intouchables).

Si les comptes dérivent de 139/77 : recalculer la liste des manquants depuis CE cliché
et poursuivre sur les comptes re-relevés (FR-004). Si les manquants n'existent pas dans
le vivant : arrêt.

## 3 · Adopter (édition des 2 seuls fichiers sources — contrat : `format-adoption.md`) (≈10 min)

- `tokens/primitives.tokens.json` : +29 feuilles littérales (hex MAJ, `"Npx"`, nombres nus).
- `tokens/semantic.tokens.json` : +48 feuilles alias forme point (`{font.size.25}`).
- Jamais une feuille existante modifiée/renommée/supprimée ; jamais `tokens/modes/*` ;
  jamais `contracts/*`.

## 4 · Régénérer + re-épingler (≈4 min)

```bash
npm run build                          # tokens (62→139 propriétés) + schema + composants
npm run figma:plan                     # 01-tokens.js enrichi ; 02+… byte-identiques
npm run golden:update
git diff evals/golden.json             # EXACTEMENT 2 lignes de hash (tokens.css, 01-tokens.js)
git diff --stat && git status --porcelain   # périmètre D12 uniquement — sinon ALARME + arrêt
```

## 5 · Reçu de liabilité en scratch (FR-009a — décision D8) (≈3 min)

```bash
S="$CLAUDE_SCRATCHPAD/essai-liaison" ; mkdir -p "$S"
rsync -a --exclude node_modules --exclude .git ./ "$S"/ && ln -s "$PWD/node_modules" "$S/node_modules"
# acceptation : retargeter UNE liaison d'un contrat de la copie vers un token adopté de même nature
#   (ex. {radius.32} → {radius.<adopté>} ou une feuille typography.* sur une liaison typo)
(cd "$S" && npm run build)             # attendu : accepté → reçu
# refus (porte existante, inchangée) : retargeter vers {typography.inexistant.size}
(cd "$S" && npm run build)             # attendu : échec nommant le token → reçu
rm -rf "$S"                            # le contrat d'essai disparaît ; contracts/ du dépôt jamais touché
```

## 6 · Sweep complet F1 + clôture (≈5 min)

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Attendu : parité propre (139 ↔ 139, exit 0 — l'axe tokens ne voit plus d'angle mort),
`N/N` vivant à l'eval. Puis : rédiger `adoption-report.md` (gabarit :
`contracts/rapport-adoption.md`, reçus sous `proofs/`) et committer — sources tokens,
2 surfaces liste blanche, golden (2 lignes), cliché rafraîchi, rapport.

## Rappels non négociables

- Figma en **lecture seule** de bout en bout (FR-010) — `01-tokens.js` régénéré n'est
  PAS exécuté sur le canvas dans ce chantier.
- Zéro nouveau contrôle (FR-008) ; zéro valeur en dur convertie (FR-009).
- Tout écart hors liste blanche = arrêt + explication nommée, jamais d'acquittement
  silencieux (FR-007).
