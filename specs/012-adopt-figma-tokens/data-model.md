# Data Model — Adopter les tokens Figma manquants (012)

**Date**: 2026-07-29 · **Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

Aucune entité de code nouvelle — ce chantier est une opération **données** sur des
artefacts existants. Le modèle ci-dessous fixe la forme exacte de chacun.

## 1 · Feuille (l'unité de compte)

Le token terminal : une entrée de la `flatten()` du differ — chemin joint par `/`
(`color/bleu`, `typography/titre-1/size`) portant `$value` (littéral ou alias).
C'est à CE niveau que se mesurent les comptes (62 → 139) et l'additivité (FR-003) :
ajouter une feuille à un groupe existant = additif ; modifier/renommer/supprimer une
feuille existante = interdit.

**Validation** : une feuille est identifiée par son chemin complet ; deux feuilles de
même chemin pour des valeurs différentes = collision → arbitrage côté source (§VIII),
jamais d'écrasement.

**Glossaire — un seul mot, trois vocabulaires** (les documents alternent, l'unité est la
même) : **feuille** = une entrée de la `flatten()` du differ côté dépôt = une entrée de
`collections[].variables[]` côté cliché Figma = une custom property de
`src/styles/tokens.css`. Quand un texte dit « token », « variable » ou « entrée », c'est
de cette unité qu'il parle ; les comptes (62 → 139) et l'additivité (FR-003) ne se
mesurent jamais au groupe.

## 2 · Token primitif (29 à adopter)

| Champ | Forme | Exemple |
|---|---|---|
| chemin | groupe existant de `tokens/primitives.tokens.json` | `color.terracotta`, `font.size.25`, `font.line-height.30`, `space.24`, `radius.16` |
| `$type` | hérité du groupe (`color`, `dimension`, …) ou posé sur la feuille | `"dimension"` |
| `$value` | littéral, convention du groupe d'accueil (research D4) | `"25px"`, `"#AABBCC"`, `500` |

**Règles** : hex en MAJUSCULES (8 chiffres si alpha — casse stricte, non neutralisée
par `norm()`) ; dimensions en `"Npx"` ; nombres nus pour poids/opacité. Valeur
strictement identique au relevé (`norm()` fait l'équivalence `"25px"` ↔ `25`).

## 3 · Token sémantique de typographie (48 feuilles à adopter)

| Champ | Forme | Exemple |
|---|---|---|
| chemin | `typography.<groupe>.<feuille>` dans `tokens/semantic.tokens.json` | `typography.libelle-bouton.size`, `typography.titre-1.line-height` |
| `$type` | par feuille : `fontFamily` / `dimension` / `fontWeight` | `"dimension"` |
| `$value` | **alias obligatoire, forme point** vers une primitive | `"{font.size.25}"` |

**Règles** : le générateur Figma REFUSE une feuille sémantique non-alias (« Semantic
token "X" must be an alias ») — la forme alias n'est pas un choix, c'est une porte.
Groupes : nouveaux (`libelle-bouton`, …) **ou** feuille nouvelle dans un groupe
existant (`titre-1.line-height`) — les deux sont additifs à la feuille (clarification
2026-07-29). La validité d'une feuille = son alias se résout (deux portes, research D5).

## 4 · Fondation de tokens du dépôt

Les fichiers édités (les DEUX seuls édités à la main dans ce chantier) :
- `tokens/primitives.tokens.json` — 38 feuilles → 67 attendues
- `tokens/semantic.tokens.json` — 24 feuilles → 72 attendues

Non touchés : `tokens/modes/semantic.light.tokens.json` (`{}`),
`tokens/modes/brand.default.tokens.json` (`{"brand": {}}`) — mono-marque / mono-mode
préservé (assumption de la spec).

**Transition d'état** : 62 feuilles → 139 feuilles, aucune feuille existante altérée
(SC-003 : 62/62 inchangées).

## 5 · Relevé Figma (cliché de variables) — entrée capturée

`parity/snapshots/figma-tokens.json` — la référence unique des comptes (FR-004),
rafraîchie en lecture au démarrage puis commitée. **Jamais une sortie générée**
(FR-004a : son évolution ne déclenche pas l'alarme).

```
{ fileName, fileKey: "d9FYAUcqdcNtsuaMgLefvJ", extractedAt: <epoch ms>,
  collections: [
    { name: "Primitives", modes: ["Value"], variables: [{ name, type, scopes, codeSyntax, values: {Value} }] },
    { name: "Semantic",   modes: ["Light"], variables: [{ …, values: {Light} }] } ] }
```

**Validation (existante, diff.ts)** : `fileKey` = ancre des contrats sinon finding
`mismatch/snapshot-provenance` ; `extractedAt` < 14 jours sinon `snapshot-stale` ;
alias sérialisés `{cible/slash}` ; hex avec alpha 8 chiffres MAJ (règle v4).
**Garde-fou D2** : autre chose que les deux collections attendues → arrêt nommé.
**Garde-fou D13 — ce fichier est aussi une fixture d'evals** : trois cas de la suite en
dépendent par nom (`Primitives/border-width/1 = 1` ; `Primitives/color/orange` ×2). Ces
ancrages sont vérifiés survivants **avant** écriture du cliché ; absents → arrêt, jamais
l'eval retouché. Le statut « entrée capturée » (FR-004a) l'exempte de l'alarme liste
blanche, pas de cette responsabilité.
**Garde-fou D5-bis (conservation)** : `dépôt \ cliché` doit être vide — des cardinaux
égaux ne prouvent rien, un échange passerait.

**Transition d'état** : 62 variables (extrait 2026-07-28) → comptes re-relevés
(139 attendues : 67 Primitives + 72 Semantic) ; en cas de dérive, la liste des
manquants est recalculée depuis ce fichier.

## 6 · Correspondance dépôt ↔ cliché (la jointure de l'axe tokens)

| Côté dépôt | Côté cliché | Pont |
|---|---|---|
| `tokens/primitives.tokens.json`, chemins point | collection `Primitives`, mode `Value`, noms slash | jointure par nom (`.`→`/`) |
| `tokens/semantic.tokens.json` (+ light/dark) | collection `Semantic`, mode `Light` (mode `Dark` demandé → bridgé sur l'unique mode, noté) | idem |
| `"Npx"` / hex / `{alias.point}` | FLOAT / hex MAJ / `{alias/slash}` | `norm()` |

**Verdicts** : token dépôt sans variable → `behind` ; variable sans token → `ahead`
(l'angle mort = 77 `ahead` attendus après refresh, 0 après adoption) ; valeurs ≠ →
`mismatch` + patch proposé.

## 7 · Liste blanche des surfaces de tokens (FR-006/007)

Exactement : `src/styles/tokens.css` + `figma-sync/01-tokens.js` + leurs **2 lignes de
hash** dans `evals/golden.json`. Diff attendu par surface : research D6. Tout écart
au-delà = signal d'alarme (protocole : `contracts/liste-blanche.md`).

## 8 · Preuve octet par octet

`evals/golden.json` — manifeste SHA-256 de tout `src/` + `figma-sync/*.js` (hors
plugin/arrange), recalculé par `npm run golden:update`, vérifié en continu par l'eval
`golden-generated-output`. La preuve de SC-004 = le diff git du manifeste (2 lignes) +
`git status` propre hors périmètre D12.

## 9 · Rapport d'adoption (FR-011, SC-008)

`specs/012-adopt-figma-tokens/adoption-report.md` (+ reçus bruts sous
`specs/012-adopt-figma-tokens/proofs/`). Rubriques obligatoires : gabarit dans
`contracts/rapport-adoption.md`. Reçu écrit, jamais contrôle (pas en conflit avec
FR-008). Un rapport sans limite doit **le dire** (« aucune limite rencontrée »).

## 10 · Contrat d'essai temporaire (FR-009a) — existe puis disparaît

Copie scratch d'un contrat existant avec UNE liaison retargetée vers un token adopté
(accepté) puis vers un token inexistant (refusé par nom). Vit uniquement dans la copie
scratch (research D8) ; ne touche jamais `contracts/` ni aucune sortie générée du
dépôt ; seul son **reçu** (sorties console) survit, dans le rapport.
