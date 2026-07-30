/** Lance le pilote d'audit sur un sujet déclaré du manifeste. */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditOrganism } from '../pilot.js';

// Le dépôt est déduit de l'emplacement de CE fichier : lancés depuis un
// worktree (Worktree Gates F1), ces outils doivent auditer l'arbre courant,
// jamais le checkout principal.
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const SUBJECT_ID = process.argv[2] ?? 'presentation';

const campaign = JSON.parse(
  readFileSync(path.join(REPO, 'specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json'), 'utf8'),
) as any;

const subject = campaign.subjects.find((s: any) => s.id === SUBJECT_ID);
if (!subject) throw new Error(`sujet inconnu : ${SUBJECT_ID}`);
if (!subject.facts?.length) throw new Error(`${SUBJECT_ID} : aucun fait déclaré`);

const { result, writtenPaths } = await auditOrganism({
  repoRoot: REPO,
  outRoot: path.join(REPO, 'specs/013-auditer-fidelite-organismes/proofs'),
  scratchDir: path.join(REPO, 'extract/figma/organism-audit/out/harness'),
  campaign,
  subject,
  refresh: false,
});

console.log(`\n========== ${result.displayName} — verdict : ${result.verdict.toUpperCase()} ==========`);
console.log('motifs :', result.reasons.join(', ') || '(aucun)');
console.log(`couverture : ${result.coverage.observed.length}/${result.coverage.expected.length} · manquants ${result.coverage.missing.length} · inattendus ${result.coverage.unexpected.length}`);

const c = result.cases[0];
console.log(`\ncas ${c.id} : ${c.verdict} (probant : ${c.probative})`);
console.log(`  pixels   : brut ${c.pixels.rawPct.toFixed(3)} % / seuil ${c.pixels.thresholdPct} % → ${c.pixels.verdict}`);
console.log(`  masqué   : ${c.pixels.maskedDiagnosticPct === null ? '—' : c.pixels.maskedDiagnosticPct.toFixed(3) + ' %'} (diagnostic, hors calcul)`);
console.log(`  régions  : ${c.pixels.regions.map((r) => `${r.id} ${r.score.toFixed(3)}%/${r.maxDiffPct}% (${r.signalPixels}px)`).join(' · ')}`);
console.log(`  géométrie: Figma ${c.geometry.figmaRoot.width}×${c.geometry.figmaRoot.height} vs généré ${c.geometry.generatedRoot.width}×${c.geometry.generatedRoot.height} → ${c.geometry.verdict}`);
console.log(`  fonts    : ${c.generated.fontsLoaded ? 'chargées' : 'NON CHARGÉES'}`);
console.log(`  visibilité: Figma ${c.visibility.figma.signalPixels}px · généré ${c.visibility.generated.signalPixels}px`);

console.log('\n--- probes de projection (D6) ---');
for (const p of c.domProbes) {
  console.log(`  ${p.prop.padEnd(8)} injecté=${JSON.stringify(p.probeValue).slice(0, 34).padEnd(36)} observé=${JSON.stringify(p.observedDomValue)?.slice(0, 40)} → ${p.projected ? 'PROJETÉ' : 'NON PROJETÉ'}`);
}

console.log('\n--- faits ---');
for (const f of result.facts) {
  console.log(`  ${f.outcome.padEnd(11)} ${f.id.padEnd(42)} ${f.localizedSource ? '[' + f.localizedSource + '] ' : ''}${f.reasons.join('; ')}`);
}

console.log('\n--- sémantique ---');
for (const s of c.semantics) console.log(`  ${s.verdict.padEnd(5)} ${s.id} (${s.contractPointer})`);

console.log('\n--- artefacts ---');
for (const a of c.artifacts) console.log(`  ${a.kind.padEnd(10)} ${a.path} ${a.width ? a.width + '×' + a.height : ''} ${a.bytes} o`);
console.log('\nécrits :', writtenPaths.length, 'fichiers');
