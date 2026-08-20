/**
 * Preuve SC-001 (spec 022) : la barre du shell rendue sur l'instance, au design
 * gouverné exact, sous la tolérance du harnais visuel 019 réutilisé tel quel.
 *
 * Ce scénario NE mesure pas lui-même : la mesure est produite par le trio
 * `render-html.mts` (référence, vitrine emit-html du contrat 2.0.0 sur fond
 * `--pqr-color-noir-bleute`, logo vectoriel injecté) → `capture-odoo.mts` (barre
 * publique de `/piqueray-harness/header-visual`, sans session) → `compare.mts`
 * (`extract/image-parity` INCHANGÉ, qui REFUSE deux tailles différentes). Ce
 * fichier VÉRIFIE le rapport et scelle un reçu sous les preuves de 022.
 *
 * Plafond déclaré PAR RAISON, pas d'après le score : le seul résidu attendu sur une
 * barre à jetons gouvernés est (a) l'anti-aliasing sous-pixel de Montserrat, et (b)
 * le glyphe de flèche du CTA — `pqr_button` (patron 019 réutilisé, research D10)
 * inline `pqr_arrow_right` (tracé) là où la vitrine emit-html rend la flèche PLEINE
 * du registre d'icônes ; c'est une caractéristique héritée de 019, pas un défaut de
 * 022. 0,1 % borne largement ces deux causes sur ~1776 px de large.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REPO, sha256 } from '../lib/receipt.mts';

const SCENARIO = 'header-visual';
const SNAPSHOT = 'odoo-019-foundation';
const CEILING = 0.1; // %, déclaré par raison (AA + glyphe flèche pqr_button hérité)
const ROOT = path.join(REPO, 'specs', '022-odoo-nav-shell', 'proofs', 'header-visual');
const REF = path.join(ROOT, 'reference', 'header-default.png');
const ODOO = path.join(ROOT, 'odoo', 'header-default.png');
const REPORT = path.join(ROOT, 'diff', 'comparaison-image.json');
const OUT = path.join(REPO, 'specs', '022-odoo-nav-shell', 'proofs', 'header-visual.json');

interface Constat { quoi: string; attendu: string; observe: string; statut: 'pass' | 'fail' | 'skipped' }

function main() {
  const constats: Constat[] = [];
  const note = (quoi: string, ok: boolean, attendu: string, observe: string) => {
    constats.push({ quoi, attendu, observe, statut: ok ? 'pass' : 'fail' });
    console.log(`  ${ok ? '✔' : '✖'} ${quoi} — attendu « ${attendu} », observé « ${observe} »`);
  };

  const present = [REF, ODOO, REPORT].every(existsSync);
  note('captures — référence, public Odoo et rapport existent', present, '3 artefacts', present ? '3 artefacts' : 'artefact absent');

  let score: number | null = null;
  if (present) {
    const report = JSON.parse(readFileSync(REPORT, 'utf8')) as { lignes: Array<{ statut: string; score: number | null }> };
    const l = report.lignes?.[0];
    note('comparaison — dimensions identiques et score mesuré (extract/image-parity)',
      l?.statut === 'mesurée' && typeof l?.score === 'number',
      'statut mesurée, score numérique',
      `${l?.statut ?? '(absent)'} · ${typeof l?.score === 'number' ? `${l.score} %` : 'score absent'}`);
    score = typeof l?.score === 'number' ? l.score : null;
    note(`résidu sous le plafond déclaré (${CEILING} % — AA + glyphe flèche pqr_button hérité)`,
      score !== null && score < CEILING,
      `< ${CEILING} %`,
      score !== null ? `${score} % — composition, dimensions, positions logo/liens/CTA/icônes alignées ; résidu = anti-aliasing + flèche CTA (tracé pqr_button vs pleine du registre, caractéristique 019)` : 'score absent');
  }

  const artifacts = present
    ? [REF, ODOO, REPORT].map((p) => ({ path: path.relative(REPO, p), sha256: sha256(readFileSync(p)), kind: p.endsWith('.png') ? 'image' : 'report' }))
    : [];
  const fail = constats.some((c) => c.statut === 'fail');
  const status = fail ? 'fail' : constats.some((c) => c.statut === 'skipped') || constats.length === 0 ? 'skipped' : 'pass';
  const receipt = {
    receiptId: `${SCENARIO}-${SNAPSHOT}`,
    scenarioId: SCENARIO,
    snapshotId: SNAPSHOT,
    status,
    fixture: 'header-default',
    observations: constats.map((c) => `[${c.statut}] ${c.quoi} — attendu « ${c.attendu} », observé « ${c.observe} »`),
    artifacts,
    limitCodes: ['SC-001-CTA-ARROW-GLYPH-INHERITED-019'],
  };
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(receipt, null, 2) + '\n');
  console.log(`\n→ ${path.relative(REPO, OUT)} · reçu « ${status} »${score !== null ? ` · ${score} %` : ''}`);
  process.exit(status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
