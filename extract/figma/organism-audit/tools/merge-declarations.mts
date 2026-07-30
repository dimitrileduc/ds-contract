/** Fusionne les déclarations VÉRIFIÉES dans le manifeste (goulot : un seul écrivain). */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const REPO = '/Users/dlstudio/.superset/projects/ds-contract';
const DECL = path.join(REPO, 'specs/013-auditer-fidelite-organismes/proofs/declarations');
const MANIFEST = path.join(REPO, 'specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json');

const campaign = JSON.parse(readFileSync(MANIFEST, 'utf8')) as any;
let merged = 0;

for (const file of readdirSync(DECL).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort()) {
  const id = path.basename(file, '.json');
  const subject = campaign.subjects.find((s: any) => s.id === id);
  if (!subject) throw new Error(`sujet inconnu : ${id}`);
  if (subject.facts?.length) { console.log(`= ${id} déjà déclaré (${subject.facts.length} faits) — inchangé`); continue; }
  const decl = JSON.parse(readFileSync(path.join(DECL, file), 'utf8'));
  subject.facts = decl.facts;
  subject.cases = [decl.case];
  subject.coverage.requiredFactIds = decl.facts.map((f: any) => f.id);
  console.log(`+ ${id} : ${decl.facts.length} faits, 1 cas`);
  merged += 1;
}

writeFileSync(MANIFEST, JSON.stringify(campaign, null, 2) + '\n');
console.log(`\n${merged} sujet(s) fusionné(s)`);
