/**
 * Audite UN organisme — l'outil de boucle des agents de remédiation.
 *
 *   npx tsx extract/figma/organism-audit/tools/run-one.mts <subjectId>
 *
 * Ce runner ne porte AUCUNE entrée d'audit : tout vient du manifeste commité.
 * Les entrées de comparaison (`reactProps`, `fixtureAssetIds`) sont déclarées
 * par le cas, et `auditOrganism` résout lui-même les `{"$asset":"id"}` en URL
 * `data:` après vérification du SHA-256 — donc un dossier est reproductible
 * depuis le dépôt seul. Un canal parallèle gitignoré a existé ici ; il rendait
 * les preuves commitées irreproductibles et un runner qui oubliait de
 * l'appeler fabriquait une fausse régression (devis 0,14 % → 72 %).
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

const id = process.argv[2];
if (!id) { console.error('usage: run-one.mts <subjectId>'); process.exit(2); }

const campaign = JSON.parse(readFileSync(
  path.join(REPO, 'specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json'), 'utf8')) as any;
const subject = campaign.subjects.find((s: any) => s.id === id);
if (!subject) { console.error(`sujet inconnu : ${id}`); process.exit(2); }
if (!subject.facts?.length) { console.error(`${id} : aucun fait déclaré`); process.exit(2); }

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
