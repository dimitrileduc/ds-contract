# Quickstart — valider l'audit des douze organismes

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) |
**Campaign interface**: [contracts/audit-campaign.interface.md](./contracts/audit-campaign.interface.md) |
**Result interface**: [contracts/audit-result.interface.md](./contracts/audit-result.interface.md)

Ce guide valide le résultat de bout en bout. Il ne contient ni implémentation de
composant, ni mutation Figma, ni procédure de conversion des valeurs en dur.

## Prerequisites

Depuis la racine du **checkout primaire**, sur la branche
`013-auditer-fidelite-organismes` (dérogation F1 actée — pas de worktree dédié, voir
plan.md et tasks.md T001) :

```bash
npm install
npx playwright install chromium
```

Préparer l'accès GET au fichier Figma Piqueray selon les variables déjà utilisées par
`extract/figma/visual-parity/`. Aucun token ne doit être imprimé dans les reçus.

Vérifier la branche et le périmètre :

```bash
git branch --show-current
test "$(git branch --show-current)" = "013-auditer-fidelite-organismes"
test -f specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json
```

## Scenario 1 — preflight without side effects

```bash
npm run audit:organisms -- \
  --campaign specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json \
  --out specs/013-auditer-fidelite-organismes/proofs \
  --check
```

Expected:

- exact 12-subject scope and exact three-wave order accepted;
- all contract IDs, versions, paths and master node IDs resolve;
- Figma reference is pinned and `readOnly=true`;
- output path resolves only under `specs/013-auditer-fidelite-organismes/proofs/`;
- no Figma write/push/update path exists;
- no proof artifact is written in `--check` mode.

Any missing subject, stale version, unknown dependency or path escape must exit `2`.

## Scenario 2 — inventory exact facts before capture

```bash
npm run audit:organisms -- \
  --campaign specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json \
  --out specs/013-auditer-fidelite-organismes/proofs \
  --inventory
```

Expected:

- required facts are derived from the pinned Figma census, contracts and actual React
  projections;
- every target has content, structure, property, composition, visual and semantic facts
  where applicable;
- every non-default prop probe and every `bindings.figma.kind: "NONE"` collection is
  explicit;
- `missing=[]` and `unexpected=[]`;
- no case is invented without a real Figma node or typed blocking reason.

Inspect the machine inventory:

```bash
jq '{
  subjects: [.subjects[].id],
  missing: [.subjects[].coverage.missing[]],
  unexpected: [.subjects[].coverage.unexpected[]]
}' specs/013-auditer-fidelite-organismes/proofs/baseline/inventory.json
```

## Scenario 3 — capture the protected baseline

Before any allowed local remediation:

```bash
npm run audit:organisms -- \
  --campaign specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json \
  --out specs/013-auditer-fidelite-organismes/proofs \
  --capture-baseline
```

Expected files:

- `proofs/baseline/hardcoded-values.json`;
- `proofs/baseline/react-bundle.json`;
- `proofs/baseline/inventory.json`;
- pinned Figma and dependency receipts.

Validate the baseline:

```bash
jq -e '
  .literalInventory
  and .tokenBindingInventory
  and (.literalToTokenConversions == [])
  and (.tokenFoundationChanges == [])
' specs/013-auditer-fidelite-organismes/proofs/baseline/hardcoded-values.json
```

The live inventory is authoritative; the prose number 89 is never used to conceal an
inventory mismatch.

## Scenario 4 — execute wave 1

```bash
npm run audit:organisms -- \
  --campaign specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json \
  --out specs/013-auditer-fidelite-organismes/proofs \
  --wave 1 \
  --refresh
```

Expected subjects, in order:

```text
coordonnees, devis, hero, presentation, sav, texte-seo
```

For every non-blocked case, retain:

```text
figma.png
generated.png
diff.png
triptych.png
metadata.json
```

Each organism must end with one explicit verdict and a dossier, even if divergent,
limited or not proven. A red fact is not omitted to let the wave finish.

## Scenario 5 — execute wave 2 only after wave 1 is classified

```bash
npm run audit:organisms -- \
  --campaign specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json \
  --out specs/013-auditer-fidelite-organismes/proofs \
  --wave 2 \
  --refresh
```

Expected subjects:

```text
faq, footer, reassurances
```

Wave 2 may start when all six wave-1 organisms have honest final classifications; they
do not all need to be `proved`. A missing wave-1 dossier exits `2`.

## Scenario 6 — validate dependency gates and wave 3

First inspect dependency receipts:

```bash
npm run audit:organisms -- \
  --campaign specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json \
  --out specs/013-auditer-fidelite-organismes/proofs \
  --check-dependencies
```

Then execute wave 3:

```bash
npm run audit:organisms -- \
  --campaign specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json \
  --out specs/013-auditer-fidelite-organismes/proofs \
  --wave 3 \
  --refresh
```

Expected mappings:

```text
equipe     → ds.member-card
formulaire → ds.field
header     → ds.nav-item
```

At planning time, the latest retained receipt says MemberCard and Field are blocked and
NavItem fails. Unless newer positive, probative receipts are supplied, the expected 013
result is three complete `blocked` dossiers—not three missing rows and not three passes.

V1 receipts speak `pass`/`fail`/`blocked` and carry `probative` per case only; the gate
derives `probative` from the required cases and maps the vocabulary normatively
(`pass→proved` only when the derived `probative` holds, `fail→divergent`,
`blocked→blocked`, unreadable→`not-proven`). Only a fresh mapped `proved` opens a
parent; the manifest cannot override the mapping.

Validate:

```bash
jq -e '
  [.subjects[]
    | select(.id == "equipe" or .id == "formulaire" or .id == "header")
    | {id, verdict, dependency: .dependency.dependencyContractId}
  ] | length == 3
' specs/013-auditer-fidelite-organismes/proofs/result.json
```

## Scenario 7 — inspect one complete fidelity chain

Example for Presentation:

```bash
jq '
  .subjects[]
  | select(.id == "presentation")
  | {
      coverage,
      verdict,
      facts: [.facts[] | {
        id,
        figma: .figma.reference,
        contract: .contract.reference,
        generated: .generated.reference,
        outcome,
        localizedSource,
        evidenceIds
      }]
    }
' specs/013-auditer-fidelite-organismes/proofs/result.json
```

Expected:

- every required fact has all required legs or a typed absent/limited reason;
- a property-projection fact uses a non-default React probe where necessary;
- `divergent` names its source;
- `proved` has probative evidence and no deferred work;
- artifact paths and hashes resolve under the organism dossier.

## Scenario 8 — bounded local remediation

When an initial result localizes a correctable in-scope source:

1. retain the initial result and evidence;
2. add/register a red fixture first for any generic mechanism;
3. edit only the authorized source (contract/schema/generic emitter/tool);
4. regenerate through repository commands;
5. rerun the affected organism and its wave;
6. preserve initial and final outcomes in the report.

Regeneration commands:

```bash
npm run build
npm run figma:plan
npm run emitters:check
npm run catalog
npm run verify:catalog
```

`npm run figma:plan` only emits local scripts. Do not execute them in Figma.

Stop and create deferred work when the proposed correction would:

- convert one of the inventoried hard-coded values into a token binding — including one
  held by a **child** contract composed by the target (FR-020);
- edit `tokens/**` or a global token rule;
- affect components outside the declared perimeter;
- require a Figma mutation or direct generated-file edit.

## Scenario 9 — run the full campaign and verify reports

```bash
npm run audit:organisms -- \
  --campaign specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json \
  --out specs/013-auditer-fidelite-organismes/proofs \
  --refresh

npm run audit:organisms -- \
  --campaign specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json \
  --out specs/013-auditer-fidelite-organismes/proofs \
  --verify-report \
  --verify-deferred-scope
```

Expected:

- `proofs/result.json` has exactly 12 ordered subjects;
- each subject has `result.json` and `REPORT.md`;
- the campaign report matches all machine IDs, counters, reasons and hashes;
- exactly three dependency rows exist;
- `literalToTokenConversions=[]`;
- `tokenFoundationChanges=[]`;
- all token/hardcoded findings appear in deferred work with verdict impact;
- exit `0` only when all 12 are proved; exit `1` for an honest complete campaign with
  non-positive organisms; exit `2` only for invalid/incomplete evidence or tooling.

## Scenario 10 — full repository closure gates

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
npm run emitters:check
npm run catalog && npm run verify:catalog
npm run images:selftest
```

Expected:

- every technical command exits `0`;
- `npm run eval` prints its live `N/N`; do not copy a fixed count into living docs;
- `npm run parity` is supporting evidence, not a substitute for the 12 dossiers;
- generated outputs trace to authorized sources;
- no Figma mutation and no direct generated-file edit is attributable to 013.

## Review-time receipt

Open `proofs/REPORT.md`, then one dossier/evidence or dependency receipt per subject.
Write `proofs/closure/review.json` per
[contracts/campaign-report.interface.md](./contracts/campaign-report.interface.md).

Expected:

- all 12 subjects reviewed in wave order;
- at least one concrete path opened per subject;
- all verdicts match `proofs/result.json`;
- `elapsedSeconds <= 600`.
