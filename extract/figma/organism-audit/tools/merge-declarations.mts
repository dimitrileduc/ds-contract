/** Fusionne les déclarations VÉRIFIÉES dans le manifeste (goulot : un seul écrivain). */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Le dépôt est déduit de l'emplacement de CE fichier : lancés depuis un
// worktree (Worktree Gates F1), ces outils doivent auditer l'arbre courant,
// jamais le checkout principal.
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
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
  // Sous porte de dépendance FERMÉE la déclaration ne porte aucun cas, et le
  // manifeste n'en fabrique pas : `cases: []` est le résultat correct, pas un
  // trou. Les faits, eux, restent déclarés — c'est ce qui rend le blocage
  // lisible plutôt qu'un dossier vide.
  subject.cases = decl.case ? [decl.case] : [];
  subject.coverage.requiredFactIds = decl.facts.map((f: any) => f.id);
  console.log(
    `+ ${id} : ${decl.facts.length} faits, ${subject.cases.length} cas` +
      (subject.cases.length === 0 ? ' (porte fermée — aucun cas parent fabriqué)' : ''),
  );
  merged += 1;
}

writeFileSync(MANIFEST, JSON.stringify(campaign, null, 2) + '\n');
console.log(`\n${merged} sujet(s) fusionné(s)`);
