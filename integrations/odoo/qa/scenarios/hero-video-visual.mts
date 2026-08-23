import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROOFS, Recueil } from '../lib/receipt.mts';

/**
 * Parité visuelle Odoo ↔ emit-html pour `ds.hero-video` (spec 025).
 *
 * Les deux captures rendent le MÊME défaut contractuel (poster vide des deux
 * côtés — le harness n'est pas composé) : la cible est donc 0.0000 %, tout
 * résidu étant de l'anti-aliasing nommé (`plancherDeTolerance`), jamais un seuil
 * silencieux. Le scénario ASSERTE les captures produites par le pipeline
 * (`render-html` → référence, `capture-odoo` → public, `compare` → rapport) ;
 * il ne les produit pas lui-même.
 */
const ROOT = path.join(PROOFS, 'hero-video-visual');
const HTML = path.join(ROOT, 'reference', 'hero-video-default.png');
const ODOO = path.join(ROOT, 'odoo', 'hero-video-default.png');
const REPORT = path.join(ROOT, 'diff', 'comparaison-image.json');

/** Plancher de tolérance déclaré : résidu d'anti-aliasing admissible sur une
 *  comparaison de composition identique des deux côtés. Tout score en-dessous est
 *  une mesure nommée, pas une revendication pixel-perfect. */
const PLANCHER = 0.05;
const RAISON_DU_PLANCHER = 'composition, dimensions et contenu alignés des deux côtés (poster vide symétrique) ; résidu d’anti-aliasing uniquement';

async function main() {
  const started = Date.now();
  const receipt = new Recueil('hero-video-visual', 'odoo-019-foundation', 'hero-video-default');
  const filesPresent = [HTML, ODOO, REPORT].every(existsSync);
  receipt.constateSi('captures — référence HTML, public Odoo et rapport existent', filesPresent, '3 artefacts', filesPresent ? '3 artefacts' : 'artefact absent');
  if (!filesPresent) {
    receipt.ecrire('hero-video-visual.json', Date.now() - started);
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
    'résidu — sous le plancher déclaré, mesure nommée sans revendication pixel-perfect',
    typeof line?.score === 'number' && line.score <= PLANCHER,
    `≤ ${PLANCHER} % — ${RAISON_DU_PLANCHER}`,
    `${line?.score ?? '(absent)'} %`,
  );
  receipt.artefact(HTML, readFileSync(HTML), 'image');
  receipt.artefact(ODOO, readFileSync(ODOO), 'image');
  receipt.artefact(REPORT, readFileSync(REPORT), 'report');
  const done = receipt.ecrire('hero-video-visual.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
