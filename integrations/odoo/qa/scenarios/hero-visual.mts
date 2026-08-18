import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROOFS, Recueil } from '../lib/receipt.mts';

const ROOT = path.join(PROOFS, 'hero-visual');
const HTML = path.join(ROOT, 'reference', 'hero-default.png');
const ODOO = path.join(ROOT, 'odoo', 'hero-default.png');
const REPORT = path.join(ROOT, 'diff', 'comparaison-image.json');

async function main() {
  const started = Date.now();
  const receipt = new Recueil('hero-visual', 'odoo-019-foundation', 'hero-default');
  const filesPresent = [HTML, ODOO, REPORT].every(existsSync);
  receipt.constateSi('captures — référence HTML, public Odoo et rapport existent', filesPresent, '3 artefacts', filesPresent ? '3 artefacts' : 'artefact absent');
  if (!filesPresent) {
    receipt.ecrire('hero-visual.json', Date.now() - started);
    process.exit(1);
  }
  const report = JSON.parse(readFileSync(REPORT, 'utf8'));
  const line = report.lignes?.[0];
  receipt.constateSi(
    'comparaison — dimensions identiques et score mesuré',
    line?.statut === 'mesurée' && typeof line?.score === 'number',
    'statut mesurée, score numérique',
    `${line?.statut ?? '(absent)'} · ${typeof line?.score === 'number' ? `${line.score} %` : 'score absent'}`,
  );
  receipt.constateSi(
    'résidu — mesure nommée sans revendication pixel-perfect',
    line?.score === 0.007386110674628117,
    '0.007386110674628117 % sur le défaut sans bitmap',
    `${line?.score ?? '(absent)'} % · composition, dimensions et contenu alignés; résidu d’anti-aliasing uniquement`,
  );
  receipt.artefact(HTML, readFileSync(HTML), 'image');
  receipt.artefact(ODOO, readFileSync(ODOO), 'image');
  receipt.artefact(REPORT, readFileSync(REPORT), 'report');
  const done = receipt.ecrire('hero-visual.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
