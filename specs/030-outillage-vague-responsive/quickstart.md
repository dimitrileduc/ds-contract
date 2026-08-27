# Quickstart — valider 030 de bout en bout

Prérequis : worktree autosuffisant (`npm install`, `npx playwright install chromium` — Worktree Gates F1). Aucun pont Figma requis : tout tourne sur fixtures, mock et artefacts 029 committés.

## 1. Les six fixtures rouges → vertes (l'ordre constitutionnel)

```bash
npm run eval   # imprime le N/N vivant — les 6 nouveaux IDs doivent y être verts :
# figma-projection-repair-shared-decision-root      (E8 : rejeu des 2 campagnes 029, un dossier, zéro déplacement)
# figma-projection-repair-manifest-generator        (029 rejoué : manifeste généré ≡ validé ; non-déductibles NOMMÉS)
# figma-projection-repair-capture-light-verdicts    (même scénario full vs light ⇒ verdicts identiques, volume −80 %+)
# figma-projection-repair-driver-chain-resume       (chaîne complète sur mock ; arrêt sur refus cité ; reprise sans rejeu ; créations déclarées exercées)
# figma-projection-repair-inherited-lock-preflight  (verrou classe-744px ⇒ refus inherited-size-lock AVANT dry-run)
# figma-projection-repair-board-structural-witness  (7 zones présentes ; fait structurel sans témoin ⇒ refus nommé)
```

Preuve adverse (SC-005) : retirer une capacité (ex. rétablir l'`issue()` E8) ⇒ la suite tombe.

## 2. Le générateur de manifeste sur le cas réel 029 (SC-001)

```bash
npm run component:repair:manifest -- \
  --releve specs/component-repairs/categories-principales/run-001/audit.json \
  --out /tmp/030-check/campaign.generated.json
# Attendu : < 2 min, validation verte, manifest-report.json avec nonDeductible[] explicites,
# et le diff sémantique contre le campaign.json écrit main de 029 n'expose AUCUNE invention.
```

## 3. La chaîne driver sur mock (SC-002)

```bash
node scripts/component-repair-drive.mjs --campaign <campagne-mock> --capture-mode light
# Attendu : drive-journal.jsonl complet, exit 0, < 25 min.
# Interrompre (Ctrl+C) puis --resume : les étapes vertes ne sont pas rejouées.
```

## 4. Le sweep de clôture (FR-012 / SC-007)

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check
npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs
npx tsc --noEmit && npx tsc -p tsconfig.build.json
git status --porcelain src/ figma-sync/ catalog/   # attendu : VIDE (re-pin zéro)
```

Le seul rouge toléré : la dette golden 028 préexistante (25 sorties, nommée dans `specs/028-…/proofs/runner-full-gates.md`), STRICTEMENT inchangée.

## 5. Ce que ce quickstart ne valide PAS (et où ça se valide)

- L'exécution VIVE du script de planche et le pilote live de la chaîne (section 1) → spec 031, §X/§XI applicables là-bas.
- Les décisions de vague D1–D9 → fiche d'ouverture de 031.
