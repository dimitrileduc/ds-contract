# Quickstart — un cycle de bout en bout

La boucle que **chacun des 12 cycles** exécute. Rien ici n'est optionnel : chaque étape
existe parce que son absence a déjà coûté quelque chose de réel dans une itération passée.

## Prérequis de session

```bash
node -v                       # ≥ 20
npm run pages:selftest        # 5 fixtures, sans Figma — doit sortir 0
```

- **Figma desktop ouvert** sur `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`), pont
  figma-console connecté. C'est la seule route qui voit la page `Pages` (`210:325`).
- **Receveur démarré** — laisser tourner pendant tout le cycle :

```bash
node extract/figma/page-parity/receiver.mjs .page-parity/<cycle>/before 9227
curl -s localhost:9227/health   # doit répondre { "instrument": "page-parity", … }
```

> Le contrôle d'identité n'est pas une politesse : en 003, le premier POST d'une sonde a
> atterri dans un receveur mort d'une autre session qui squattait un port. Un octet confié à
> un puits inconnu est un octet perdu en silence.

## Étape 0 — Étalonnage (une seule fois, en ouverture)

Capturer les 9 maquettes **deux fois sans rien faire entre les deux**, puis comparer.

```bash
npm run pages:compare -- --before .page-parity/00-etalonnage/a \
                         --after  .page-parity/00-etalonnage/b \
                         --out    specs/005-figma-source-cleanup/proofs/00-etalonnage
```

**9/9 `identical` exigé.** Sinon le plancher de bruit de l'instrument n'est pas nul et tout
verdict aval serait faux : **STOP programme**, retour owner.

## La boucle, cycle par cycle

### 1. Poser le point de version — avant tout

```js
// figma_execute #1
globalThis.__dsc003_input = { label: "005/<passe>/<étape>" };
// figma_execute #2 : le texte de bridge/checkpoint.js  → { label, versionId }
```

Noter le `versionId` : c'est le champ 3 du quadruplet du rapport. **Une passe qui démarre
sans point de version est arrêtée** (FR-040) — sans lui, le rapport ne peut pas produire le
lien d'état antérieur qu'il doit porter.

### 2. Relever la structure — par position, jamais par nom

`bridge/scan.js` sur la cible → `releves/<…>.json`, committé.

Pour un geste géométrique, le relevé est **obligatoire avant l'écriture** et cherche
nommément le piège : **un enfant de type GROUP ne suit jamais le resize de son parent**
(le cas SAV a déjà provoqué un arrêt avant écriture). Il se traite — conversion ou
repositionnement — **avant**, pas après.

### 3. Annoncer le diff attendu — par écrit, avant d'écrire

Une ligne dans `decisions.md` : `aucun pixel` | `bande de ~N px sur telle zone` |
`différence visible sur telles maquettes`. Le verdict comparera l'observé à **cette**
prédiction.

### 4. Capturer l'AVANT — les 9 pages, jamais un pilote

Une invocation de `bridge/capture.js` par maquette (9 frames dépassent le budget d'un seul
appel), puis **vérifier chaque PNG non vide et correctement dimensionné avant de continuer**.

> Une fois la mutation faite, l'état antérieur est **définitivement** irrécupérable : aucun
> outil ne rend l'image d'une version passée, et le retour arrière rétroactif pour combler
> une preuve après coup est exclu par l'owner. Plusieurs molécules de la 003 ont expédié avec
> une preuve sur 1-2 maquettes ; le trou s'est révélé impossible à combler.

### 5. Archiver — si et seulement si le geste est destructif

Clone **vectoriel** (jamais une image) sur la page `Archive · Spec A`. Concerne exactement
deux gestes : la suppression du variant `État3` de Tab, et la reconstruction du Footer.

### 6. Le(s) geste(s)

Script `figma_execute`, transcrit verbatim dans `proofs/<cycle>/gestes.md`.

**Pièges Figma à avoir en tête** (D5, tous vérifiés) :

| Piège | Contournement |
|---|---|
| `resize()` sur une instance imbriquée liée par INSTANCE_SWAP ne fait **rien**, en silence | redimensionner l'instance **top-level**, puis `layoutSizingVertical: FILL` sur l'enfant swappé |
| Un enfant **GROUP** ne suit pas le resize de son parent | détecté à l'étape 2, traité **avant** |
| Rejouer les propriétés d'un Bouton **réinitialise l'override de couleur** de son glyphe | relier la couleur **après** avoir rejoué les props |
| Le retour de `setBoundVariableForPaint` **peut mentir** | relire la liaison séparément |
| `figma.currentPage = …` est interdit | `setCurrentPageAsync` |
| `fetch()` hors des ports 9223-9232 échoue **en silence** | rester sur 9227 |

### 7. Capturer l'APRÈS + rendre le verdict

```bash
npm run pages:compare -- --before .page-parity/<cycle>/before \
                         --after  .page-parity/<cycle>/after \
                         --out    specs/005-figma-source-cleanup/proofs/<cycle>
```

| Annoncé | Observé | Suite |
|---|---|---|
| 0 pixel | 9/9 `identical` | ✅ commit |
| 0 pixel | ≥1 `diff` | ❌ **STOP** — annuler le **lot entier**, identifier la cause avant toute reprise |
| diff nommé | conforme | ✅ joindre le crop, commit |
| diff nommé | plus grand | ❌ **STOP** |
| diff nommé | plus petit / ailleurs | ❌ **échec de prédiction** — le geste n'a pas fait ce qu'on croyait |
| — | exit `2` | ❌ **la preuve n'a pas eu lieu** — jamais lu comme « identique » |

> Avant de classer un diff en « bruit de rendu » : **zoomer dans le crop** et vérifier
> toutes les propriétés plausibles (graisse par plage, interlettrage, espacement de
> paragraphe, bordures), pas seulement couleur et position. Deux bugs réels ont été trouvés
> par l'owner de cette manière, sur des diffs déjà classés bruit.

### 8. Consigner

- `proofs/<cycle>/` : `verdict.json`, `verdict.md`, `crops/`, `gestes.md`.
- `decisions.md` : le diff annoncé, le diff observé, le verdict, le `versionId`.
- Le **quadruplet** du geste, prêt à recopier dans `RAPPORT-CLOTURE.md`
  ([contracts/gesture-record.md](./contracts/gesture-record.md)).
- Pour l'unique adoption (Section-header ×6) : `ledger/section-header.json`, validé par
  `npm run pages:ledger:check` — un ledger **vide explicite** si le pré-diff ne trouve rien,
  jamais un fichier absent.

## Retour arrière (quand un cycle échoue)

Aucune API de restauration n'existe. C'est un geste **humain guidé** :

1. Figma desktop → File → **Show version history**.
2. Restaurer le point `005/<passe>/<étape>` posé avant le cycle annulé.
3. **Re-prouver** : capture fraîche des 9 pages vs les captures `before` du cycle →
   `pages:compare` doit rendre 9/9 `identical`.
4. Consigner l'échec **et** le retour arrière dans `decisions.md`.

## Clôture (P8)

```bash
# sur le CHECKOUT PRINCIPAL — npm run eval ne tourne pas en worktree
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Attendu : **statu quo strict** — 8/8 verts, suite **108/108**, `parity` à zéro écart actif.
Aucune dérogation n'est demandée : tout rouge est une régression et bloque.

Puis : suppression de la page `Archive · Spec A` **avec sa propre preuve** (les 9 pages
restent identiques — vérifié, pas supposé), et `RAPPORT-CLOTURE.md` complet — quadruplet par
geste, divergences ouvertes avec leur réparation, valeurs laissées littérales, cadence
réelle vs budget 12, compteurs de clôture.
