import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROOFS, REPO, Recueil } from '../lib/receipt.mts';
import { scanCases, type SavedCase } from '../../../../scripts/odoo/scan-saved-versions.js';

async function main() {
  const started = Date.now();
  const receipt = new Recueil('version-policy', 'odoo-019-foundation', 'version-drift/cases');
  const fixturePath = path.join(REPO, 'evals/fixtures/odoo-production/version-drift/cases.json');
  const cases = JSON.parse(readFileSync(fixturePath, 'utf8')) as SavedCase[];
  const report = scanCases(cases);
  receipt.artefact(path.join(PROOFS, 'version-policy.scan.json'), Buffer.from(JSON.stringify(report, null, 2) + '\n'), 'report');
  for (const state of ['current', 'policy-stale', 'structure-stale', 'unknown'] as const) {
    const observed = report.entries.find((entry) => entry.caseId === state)?.state;
    receipt.constateSi(`scanner — état ${state}`, observed === state, state, observed ?? '(absent)');
  }
  const guard = readFileSync(path.join(REPO, 'integrations/odoo/addons/piqueray_ds/static/src/js/version_guard.js'), 'utf8');
  receipt.constateSi(
    'politique — seul policy-stale est remis au courant',
    /if \(state === "policy-stale"\)/.test(guard) && !/innerHTML\s*=|outerHTML\s*=|replaceWith\(/.test(guard),
    'réapplication de métadonnées sans réécriture HTML',
    'branche policy-stale explicite et aucune API de remplacement structurel',
  );
  receipt.constateSi(
    'structure — aucun claim de migration automatique',
    report.entries.some((entry) => entry.state === 'structure-stale') && guard.includes('pqr-structure-stale'),
    'structure-stale signalé seulement',
    'classe pqr-structure-stale, aucune mutation de structure',
  );
  const done = receipt.ecrire('version-policy.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${String(error)}`); process.exit(1); });
}
