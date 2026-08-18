import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROOFS, Recueil } from '../lib/receipt.mts';

const ROOT = path.join(PROOFS, 'devis-visual');
const HTML = path.join(ROOT, 'reference', 'devis-default.png');
const ODOO = path.join(ROOT, 'odoo', 'devis-default.png');
const REPORT = path.join(ROOT, 'diff', 'comparaison-image.json');

async function main() {
  const started = Date.now();
  const receipt = new Recueil('devis-visual', 'odoo-019-foundation', 'devis-default');
  const filesPresent = [HTML, ODOO, REPORT].every(existsSync);
  receipt.constateSi('captures — référence HTML, public Odoo et rapport existent', filesPresent, '3 artefacts', filesPresent ? '3 artefacts' : 'artefact absent');
  if (!filesPresent) {
    receipt.ecrire('devis-visual.json', Date.now() - started);
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
    line?.score === 0.02663314723173878 && line?.cause === 'anti-aliasing',
    '0.02663314723173878 % · cause anti-aliasing portée au rapport canonique',
    `${line?.score ?? '(absent)'} % · cause ${line?.cause ?? '(absente)'} · fond noir + voile sans bitmap, texte et liseré du CTA seuls contours`,
  );
  receipt.artefact(HTML, readFileSync(HTML), 'image');
  receipt.artefact(ODOO, readFileSync(ODOO), 'image');
  receipt.artefact(REPORT, readFileSync(REPORT), 'report');
  const done = receipt.ecrire('devis-visual.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
