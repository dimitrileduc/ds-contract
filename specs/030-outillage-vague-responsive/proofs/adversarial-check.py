"""SC-005 — retirer chaque capacité doit faire tomber sa fixture."""
import subprocess, json, sys

CASES = [
    dict(
        id='E8 — clôture multi-campagnes',
        file='extract/figma/projection-repair/campaign.ts',
        fixture='shared-decision-root-check.ts',
        old='    if (!expected.has(targetId)) continue;',
        new="""    if (!expected.has(targetId)) {
      issue(issues, 'owner-decision', `${entryPath}.targetId`, `owner decision targets an undeclared campaign target: ${targetId}`);
      continue;
    }""",
        what='le targetId etranger redevient une erreur au lieu d etre ignore',
    ),
    dict(
        id='Generateur de manifeste — honnetete',
        file='extract/figma/projection-repair/manifest-generator.ts',
        fixture='manifest-generator-check.ts',
        old="  name('componentSetTopology.authoringLayout.gap', 'espacement d’authoring du catalogue : décision de mise en page, absente du relevé — émis à 0');",
        new='  // capacite retiree : le champ est emis sans etre nomme',
        what='l espacement d authoring cesse d etre nomme comme non deductible',
    ),
    dict(
        id='Capture allegee — zero cliche a l idempotence',
        file='extract/figma/projection-repair/campaign.ts',
        fixture='capture-light-verdicts-check.ts',
        old="  if (phase === 'idempotence') return new Set();",
        new='  // capacite retiree : le cycle d idempotence redevient photographie',
        what='le mode allege re-photographie le cycle d idempotence',
    ),
    dict(
        id='Driver — arret au premier refus',
        file='scripts/component-repair-drive.mjs',
        fixture='driver-chain-resume-check.ts',
        old="    record({ step: step.step, action: step.action, startedAt, endedAt, verdict: 'refused', refusal });\n    return { code: result.interrupted ? 3 : 2, entries, refusal };",
        new="    record({ step: step.step, action: step.action, startedAt, endedAt, verdict: 'refused', refusal });\n    continue;",
        what='la chaine continue apres un refus au lieu de s arreter',
    ),
    dict(
        id='Preflight verrous herites',
        file='extract/figma/projection-repair/campaign.ts',
        fixture='inherited-lock-preflight-check.ts',
        old='      blocking.push(lockRef);',
        new="      waived.push({ lockRef, waiverRef: 'auto' });",
        what='tout verrou est auto-deroge au lieu de bloquer',
    ),
    dict(
        id='Planche — fait structurel sans temoin',
        file='extract/figma/projection-repair/board-generator.ts',
        fixture='board-structural-witness-check.ts',
        old='      if (fact.nature === STRUCTURAL && !pickerRefs.has(fact.witnessRef)) {',
        new='      if (false && fact.nature === STRUCTURAL && !pickerRefs.has(fact.witnessRef)) {',
        what='un fait structurel temoigne par un rendu passe',
    ),
]

rows = []
for case in CASES:
    path = case['file']
    original = open(path, encoding='utf8').read()
    if case['old'] not in original:
        print(f"SETUP FAILURE: anchor absent in {path} for {case['id']}", file=sys.stderr)
        sys.exit(1)
    open(path, 'w', encoding='utf8').write(original.replace(case['old'], case['new'], 1))
    try:
        proc = subprocess.run(['npx', 'tsx', f"evals/fixtures/figma-projection-repair/{case['fixture']}"],
                              capture_output=True, text=True)
    finally:
        open(path, 'w', encoding='utf8').write(original)
    stream = proc.stderr + proc.stdout
    first_error = next((line.strip() for line in stream.split('\n') if line.strip().startswith('Error:')), '(aucune ligne Error)')
    rows.append(dict(capacite=case['id'], fixture=case['fixture'], retrait=case['what'],
                     rouge=proc.returncode != 0, diagnostic=first_error[:200]))

print(json.dumps(rows, ensure_ascii=False, indent=2))
sys.exit(0 if all(row['rouge'] for row in rows) else 1)
