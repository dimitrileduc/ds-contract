/** Lance le pilote sur tous les sujets déclarés de la vague 1 et résume. */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { auditOrganism } from '../pilot.js';

const REPO = '/Users/dlstudio/.superset/projects/ds-contract';
const campaign = JSON.parse(
  readFileSync(path.join(REPO, 'specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json'), 'utf8'),
) as any;

const targets = campaign.subjects.filter((s: any) => s.wave === 1 && s.facts?.length);
console.log(`vague 1 : ${targets.length} sujet(s) déclaré(s)\n`);

const rows: Array<Record<string, unknown>> = [];
for (const subject of targets) {
  process.stdout.write(`… ${subject.id}`);
  try {
    const { result } = await auditOrganism({
      repoRoot: REPO,
      outRoot: path.join(REPO, 'specs/013-auditer-fidelite-organismes/proofs'),
      scratchDir: path.join(REPO, 'extract/figma/organism-audit/out/harness'),
      campaign, subject, refresh: false,
    });
    const c = result.cases[0];
    const by = (o: string) => result.facts.filter((f: any) => f.outcome === o).length;
    rows.push({
      sujet: result.id, verdict: result.verdict, faits: result.facts.length,
      prouvés: by('proved'), divergents: by('divergent'), limités: by('limited'), nonProuvés: by('not-proven'),
      pixels: `${c.pixels.rawPct.toFixed(2)}%`, geo: c.geometry.verdict,
      probes: c.domProbes.map((p: any) => `${p.prop}:${p.projected ? 'ok' : 'NON'}`).join(' '),
    });
    console.log(` → ${result.verdict}`);
  } catch (error) {
    rows.push({ sujet: subject.id, verdict: 'ERREUR', faits: 0, prouvés: 0, divergents: 0, limités: 0,
                nonProuvés: 0, pixels: '—', geo: '—', probes: (error as Error).message.slice(0, 70) });
    console.log(` → ERREUR : ${(error as Error).message.slice(0, 90)}`);
  }
}

console.log('\n');
console.table(rows);

console.log('\n--- divergences par source ---');
for (const subject of targets) {
  const p = path.join(REPO, 'specs/013-auditer-fidelite-organismes/proofs/organisms', subject.id, 'result.json');
  try {
    const r = JSON.parse(readFileSync(p, 'utf8'));
    for (const f of r.facts.filter((x: any) => x.outcome === 'divergent')) {
      console.log(`  ${String(f.localizedSource).padEnd(11)} ${f.id.padEnd(40)} ${f.reasons.join('; ').slice(0, 80)}`);
    }
  } catch { /* dossier absent */ }
}
