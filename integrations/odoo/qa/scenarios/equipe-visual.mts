import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROOFS, Recueil } from '../lib/receipt.mts';

const ROOT = path.join(PROOFS, 'equipe-visual');
const HTML = path.join(ROOT, 'html', 'equipe-default.png');
const ODOO = path.join(ROOT, 'odoo', 'equipe-default.png');
const REPORT = path.join(ROOT, 'diff', 'comparaison-image.json');

async function main() {
  const started = Date.now();
  const receipt = new Recueil('equipe-visual', 'odoo-019-foundation', 'equipe-default');
  const filesPresent = [HTML, ODOO, REPORT].every(existsSync);
  receipt.constateSi('captures — référence HTML, public Odoo et rapport existent', filesPresent, '3 artefacts', filesPresent ? '3 artefacts' : 'artefact absent');
  if (!filesPresent) {
    receipt.ecrire('equipe-visual.json', Date.now() - started);
    process.exit(1);
  }
  const report = JSON.parse(readFileSync(REPORT, 'utf8'));
  const line = report.lignes?.[0];
  receipt.constateSi('comparaison — dimensions identiques et score mesuré', line?.statut === 'mesurée' && typeof line?.score === 'number', 'statut mesurée, score numérique', `${line?.statut ?? '(absent)'} · ${typeof line?.score === 'number' ? `${line.score} %` : 'score absent'}`);
  receipt.constateSi('rendu — sample contractuel strictement identique', line?.score === 0 && line?.cause === null && line?.justification === null, '0 % de pixels différents, aucun résidu', `${line?.score ?? '(absent)'} % · cause=${String(line?.cause)} · justification=${String(line?.justification)}`);
  receipt.artefact(HTML, readFileSync(HTML), 'image');
  receipt.artefact(ODOO, readFileSync(ODOO), 'image');
  receipt.artefact(REPORT, readFileSync(REPORT), 'report');
  const done = receipt.ecrire('equipe-visual.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
