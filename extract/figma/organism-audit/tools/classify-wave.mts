/**
 * Émet le reçu de classification d'une vague — DÉRIVÉ, jamais saisi.
 *
 *   npx tsx extract/figma/organism-audit/tools/classify-wave.mts <1|2|3>
 *
 * `classified` signifie « verdict final honnête », pas « verdict positif » :
 * six divergences classifiées ouvrent légitimement la vague suivante.  Le reçu
 * refuse donc de mentir dans les deux sens — un dossier absent ou sans verdict
 * laisse `classified: false`, et un dossier divergent le laisse `true`.
 *
 * Il porte aussi le contrôle d'indépendance exigé par US2 scénario 1 : aucun
 * verdict d'une vague ne doit dépendre d'un verdict IMPLICITE de `ds.member-card`,
 * `ds.field` ou `ds.nav-item`.  Le contrôle est textuel et volontairement large —
 * il scanne les références Figma/contrat/générées ET les raisons de chaque fait ;
 * une dépendance réelle est nommée dans `dependency`, une mention ailleurs est
 * signalée pour revue plutôt que tue.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const PROOFS = path.join(REPO, 'specs/013-auditer-fidelite-organismes/proofs');

const GATED_DEPENDENCIES = ['ds.member-card', 'ds.field', 'ds.nav-item'] as const;

const wave = Number(process.argv[2]);
if (!Number.isInteger(wave) || wave < 1 || wave > 3) {
  console.error('usage: classify-wave.mts <1|2|3>');
  process.exit(2);
}

const campaign = JSON.parse(
  readFileSync(path.join(REPO, 'specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json'), 'utf8'),
) as any;

const subjects = campaign.subjects.filter((s: any) => s.wave === wave);
const rows: Array<Record<string, unknown>> = [];
let classifiedAll = true;
let positiveLeak = 0;

for (const subject of subjects) {
  const dossier = path.join(PROOFS, 'organisms', subject.id);
  const resultPath = path.join(dossier, 'result.json');
  const reportPath = path.join(dossier, 'REPORT.md');

  if (!existsSync(resultPath)) {
    classifiedAll = false;
    rows.push({ id: subject.id, classified: false, verdict: null, reasons: ['dossier-absent'] });
    continue;
  }

  const result = JSON.parse(readFileSync(resultPath, 'utf8')) as any;
  const verdict = typeof result.verdict === 'string' ? result.verdict.trim() : '';
  const classified = verdict !== '';
  if (!classified) classifiedAll = false;

  const by = (o: string) => result.facts.filter((f: any) => f.outcome === o).length;

  // Indépendance : une dépendance DÉCLARÉE est légitime (vague 3) ; une simple
  // mention textuelle dans une vague non gatée est remontée pour revue.
  const declaredDependency: string | null = result.dependency?.dependencyContractId ?? null;
  const haystack = JSON.stringify(result.facts);
  const mentions = GATED_DEPENDENCIES.filter(
    (dep) => dep !== declaredDependency && haystack.includes(dep),
  );

  if (verdict === 'proved' && (result.dependency?.open === false)) positiveLeak += 1;

  rows.push({
    id: subject.id,
    classified,
    verdict: verdict || null,
    facts: result.facts.length,
    proved: by('proved'),
    divergent: by('divergent'),
    limited: by('limited'),
    notProven: by('not-proven'),
    coverageExact:
      Array.isArray(result.coverage?.missing) &&
      Array.isArray(result.coverage?.unexpected) &&
      result.coverage.missing.length === 0 &&
      result.coverage.unexpected.length === 0,
    declaredDependency,
    gatedDependencyMentions: mentions,
    reportPresent: existsSync(reportPath),
    reasons: result.reasons ?? [],
  });
}

const receipt = {
  schemaVersion: 1,
  campaignId: campaign.campaignId ?? '013-auditer-fidelite-organismes',
  wave,
  waveIndex: wave - 1,
  reference: { fileKey: campaign.reference.fileKey, fileVersion: campaign.reference.fileVersion, readOnly: campaign.reference.readOnly },
  expectedSubjectIds: subjects.map((s: any) => s.id),
  subjects: rows,
  classified: classifiedAll,
  // Un verdict positif ne peut pas coexister avec une porte de dépendance fermée.
  positiveVerdictsUnderClosedGate: positiveLeak,
  independenceFromGatedDependencies: rows.every(
    (r) => (r.gatedDependencyMentions as string[]).length === 0,
  ),
  note:
    'classified = verdict final honnête, PAS verdict positif. Un dossier divergent classifié ouvre la vague suivante.',
};

const outPath = path.join(PROOFS, 'organisms', `wave-${wave}-classification.json`);
writeFileSync(outPath, `${JSON.stringify(receipt, null, 2)}\n`);

console.table(rows);
console.log(`\nclassified: ${classifiedAll} · indépendance dépendances gatées: ${receipt.independenceFromGatedDependencies}`);
console.log(`verdicts positifs sous porte fermée: ${positiveLeak}`);
console.log(`reçu → ${path.relative(REPO, outPath)}`);
process.exit(classifiedAll ? 0 : 1);
