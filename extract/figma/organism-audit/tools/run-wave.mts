/**
 * Lance le pilote sur tous les sujets déclarés d'une vague et résume.
 *
 *   npx tsx extract/figma/organism-audit/tools/run-wave.mts 2
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditOrganism } from '../pilot.js';
import { evaluateWaveEntry } from '../campaign.js';
import { applySubjectOverrides } from './overrides.mjs';

// Le dépôt est déduit de l'emplacement de CE fichier : lancés depuis un
// worktree (Worktree Gates F1), ces outils doivent auditer l'arbre courant,
// jamais le checkout principal.
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const PROOFS = path.join(REPO, 'specs/013-auditer-fidelite-organismes/proofs');

const wave = Number(process.argv[2]);
if (!Number.isInteger(wave) || wave < 1 || wave > 3) {
  console.error('usage: run-wave.mts <1|2|3>');
  process.exit(2);
}

const campaign = JSON.parse(
  readFileSync(path.join(REPO, 'specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json'), 'utf8'),
) as any;

// La règle d'entrée de vague est appliquée ICI, avant toute capture.  Une
// convention ne refuse rien : sans cet appel, `run-wave.mts 3` s'exécuterait
// joyeusement sur une vague 2 vide.  `classified` se lit sur le dossier réel —
// un verdict, quel qu'il soit, pas un verdict positif.
const priorSubjectStates = campaign.subjects
  .filter((s: any) => s.wave < wave)
  .map((s: any) => {
    const resultPath = path.join(PROOFS, 'organisms', s.id, 'result.json');
    if (!existsSync(resultPath)) return { id: s.id, classified: false, verdict: null };
    const result = JSON.parse(readFileSync(resultPath, 'utf8')) as { verdict?: string };
    return {
      id: s.id,
      classified: typeof result.verdict === 'string' && result.verdict.trim() !== '',
      verdict: result.verdict ?? null,
    };
  });

const entry = evaluateWaveEntry({
  waveNumber: wave as 1 | 2 | 3,
  waves: campaign.waves,
  priorSubjectStates,
});
if (!entry.allowed) {
  console.error(`REFUSÉ — vague ${wave} ne peut pas s'ouvrir :`);
  for (const reason of entry.reasons) console.error(`  ✗ ${reason}`);
  process.exit(entry.exitCode);
}
if (priorSubjectStates.length > 0) {
  console.log(
    `règle d'entrée OK — ${priorSubjectStates.length} sujet(s) antérieur(s) classifié(s) : ` +
      `${priorSubjectStates.map((s: any) => `${s.id}=${s.verdict}`).join(', ')}\n`,
  );
}

const targets = campaign.subjects.filter((s: any) => s.wave === wave && s.facts?.length);
console.log(`vague ${wave} : ${targets.length} sujet(s) déclaré(s)\n`);

const rows: Array<Record<string, unknown>> = [];
for (const subject of targets) {
  process.stdout.write(`… ${subject.id}`);
  try {
    applySubjectOverrides(REPO, subject);
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
