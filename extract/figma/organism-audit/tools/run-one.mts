/**
 * Audite UN organisme — l'outil de boucle des agents de remédiation.
 *
 *   npx tsx extract/figma/organism-audit/tools/run-one.mts <subjectId>
 *
 * - Fusionne l'override optionnel `out/overrides/<id>.json` dans le CAS du
 *   sujet ({reactProps, fixtureAssetIds}) SANS toucher au manifeste partagé —
 *   un seul écrivain par fichier, pas de goulot.
 * - Résout les valeurs `{"$asset":"id"}` de reactProps en URL file:// depuis
 *   le manifeste fixture-assets, en vérifiant le SHA-256 des octets sur
 *   disque : des octets non pinés ne peuvent pas servir de preuve.
 *
 * Le Chromium épinglé est résolu par `chromiumExecutable()`
 * (visual-parity/render.ts), qui sonde chrome-mac-x64/ comme les autres
 * architectures — plus de chemin absolu ni de révision figée ici.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

const { auditOrganism } = await import('../pilot.js');
const { applySubjectOverrides } = await import('./overrides.mjs');

const id = process.argv[2];
if (!id) { console.error('usage: run-one.mts <subjectId>'); process.exit(2); }

const campaign = JSON.parse(readFileSync(
  path.join(REPO, 'specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json'), 'utf8')) as any;
const subject = campaign.subjects.find((s: any) => s.id === id);
if (!subject) { console.error(`sujet inconnu : ${id}`); process.exit(2); }
if (!subject.facts?.length) { console.error(`${id} : aucun fait déclaré`); process.exit(2); }

const notes = applySubjectOverrides(REPO, subject);
for (const note of notes) console.log(note);

// ---- audit ----------------------------------------------------------------
const { result } = await auditOrganism({
  repoRoot: REPO,
  outRoot: path.join(REPO, 'specs/013-auditer-fidelite-organismes/proofs'),
  scratchDir: path.join(REPO, 'extract/figma/organism-audit/out/harness'),
  campaign, subject, refresh: false,
});

const caseResult = result.cases[0];
const by = (o: string) => result.facts.filter((f: any) => f.outcome === o).length;
const raw = caseResult.pixels.rawPct;
console.log(`\n${'='.repeat(56)}`);
console.log(`${id} → ${result.verdict}`);
console.log(`pixels : ${raw.toFixed(2)} % (seuil ${caseResult.pixels.thresholdPct}) — ${raw <= caseResult.pixels.thresholdPct ? 'SOUS LE SEUIL ✓' : 'au-dessus'}`);
console.log(`faits  : ${by('proved')} prouvés · ${by('divergent')} divergents · ${by('limited')} limités · ${by('not-proven')} non prouvés`);
console.log(`géo    : ${caseResult.geometry.verdict} · probes : ${caseResult.domProbes.map((p: any) => `${p.prop}:${p.projected ? 'ok' : 'NON'}`).join(' ') || '—'}`);
const dir = path.join(REPO, 'specs/013-auditer-fidelite-organismes/proofs/organisms', id, 'cases', `${id}-master-defaults`);
console.log(`images : ${path.relative(REPO, dir)}/{figma,generated,diff,triptych}.png`);
process.exit(0);
