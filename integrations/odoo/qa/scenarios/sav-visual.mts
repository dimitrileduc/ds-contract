import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROOFS, Recueil } from '../lib/receipt.mts';

const ROOT = path.join(PROOFS, 'sav-visual');
const HTML = path.join(ROOT, 'html', 'sav-default.png');
const ODOO = path.join(ROOT, 'odoo', 'sav-default.png');
const REPORT = path.join(ROOT, 'diff', 'comparaison-image.json');

async function main() {
  const started = Date.now();
  const receipt = new Recueil('sav-visual', 'odoo-019-foundation', 'sav-default');
  const filesPresent = [HTML, ODOO, REPORT].every(existsSync);
  receipt.constateSi('captures — référence HTML, public Odoo et rapport existent', filesPresent, '3 artefacts', filesPresent ? '3 artefacts' : 'artefact absent');
  if (!filesPresent) {
    receipt.ecrire('sav-visual.json', Date.now() - started);
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
    'résidu — mesure nommée, cause et justification portées au rapport canonique',
    line?.score === 0.030015968236157268 && Boolean(line?.cause) && Boolean(line?.justification),
    '0.030015968236157268 % · cause et justification non nulles',
    `${line?.score ?? '(absent)'} % · cause=${line?.cause ? 'portée' : 'null'} · justification=${line?.justification ? 'portée' : 'null'} — icônes src=\"\" des deux plans A5 côté référence + glyphe de flèche du gabarit partagé; le paragraphe (5 insécables, 3 strong, 1 br) casse à l'identique`,
  );
  receipt.artefact(HTML, readFileSync(HTML), 'image');
  receipt.artefact(ODOO, readFileSync(ODOO), 'image');
  receipt.artefact(REPORT, readFileSync(REPORT), 'report');
  const done = receipt.ecrire('sav-visual.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
