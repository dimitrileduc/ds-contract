/**
 * La comparaison : appelle l'instrument générique du dépôt SANS le modifier, une
 * fois par sujet, et produit les 3 lignes du schéma de
 * `../contracts/visual-comparison.md` §4.
 *
 * ── Pourquoi réutiliser cet instrument tel quel ─────────────────────────────
 * Il est écrit pour ça : générique et agnostique du moteur de rendu — « it does
 * not know about Figma, manifests, pages, or React. Consumers decide how their
 * images were made ». Et il REFUSE deux images de tailles différentes
 * (`dimension-mismatch`) au lieu de les redimensionner, « because it would
 * otherwise hide a visual change ».
 *
 * Le clip épinglé de `subjects.mts` rend les tailles égales PAR CONSTRUCTION :
 * la comparaison stricte s'applique donc telle quelle, et une différence de
 * géométrie se lit en PIXELS DE DIFF — jamais en refus qui aurait dissimulé la
 * mesure.
 *
 * ── Par la PORTE BIBLIOTHÈQUE, pas par la porte processus ───────────────────
 * `compareImageFiles` + `writeImageParityReport` sont exactement ce que
 * `extract/image-parity/cli.ts` appelle : ce CLI est une enveloppe de 20 lignes
 * qui lit trois drapeaux et imprime le rapport en JSON. Les importer est donc la
 * MÊME réutilisation, non modifiée — mais sans lancer trois `npx tsx` (≈ 2,5 s
 * de démarrage pour ≈ 0,2 s de calcul), et surtout sans dépendre du format de la
 * DERNIÈRE LIGNE DE STDOUT du CLI, qui était le couplage le plus fragile du
 * harnais : un `console.log` de plus dans le CLI et toutes les mesures se
 * dégradaient en « sortie illisible ».
 *
 * Gagné au passage : `status` est désormais lu tel que l'instrument le nomme
 * (`input-invalid` ≠ `dimension-mismatch`, distinction que le code de sortie
 * écrasait en un seul « code 2 »). Le fichier écrit sur disque est le MÊME que
 * produisait le CLI — `writeImageParityReport` écrit `result.json` et le
 * triptyque exactement comme avant : les reçus déjà commités restent valides.
 *
 * Usage :
 *   npx tsx specs/018-…/harness/compare.mts --html <dir> --odoo <dir> --out <dir>
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareImageFiles } from '../../../extract/image-parity/compare.js';
import { writeImageParityReport } from '../../../extract/image-parity/report.js';
import { SUBJECTS, arg, runAsCli } from './subjects.mts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..', '..');

export interface Ligne {
  composant: string;
  statut: 'mesurée' | 'impossible';
  avant: string | null;
  apres: string | null;
  score: number | null;
  cause: string | null;
  justification: string | null;
  raisonImpossible: string | null;
}

/** Une comparaison. Ne juge RIEN : elle mesure, et dit quand elle ne peut pas.
 *  Le score est celui que l'instrument calcule — jamais estimé (invariant C4). */
export function comparerUn(
  avant: string,
  apres: string,
  out: string,
): { score: number } | { impossible: string } {
  for (const [role, p] of [['avant', avant], ['après', apres]] as const) {
    if (!existsSync(p)) return { impossible: `Capture « ${role} » absente : ${p}` };
  }
  mkdirSync(out, { recursive: true });
  const resultat = compareImageFiles(avant, apres);
  const rapport = writeImageParityReport(out, resultat);
  // `identical` et `diff` sont des MESURES ; les deux autres statuts sont des
  // refus HONNÊTES de l'instrument, rendus tels qu'il les nomme.
  if (rapport.diffPct === null) {
    return {
      impossible: `L'instrument a REFUSÉ la comparaison (${rapport.status}) : ${rapport.reason ?? 'sans détail'}`,
    };
  }
  return { score: rapport.diffPct };
}

async function main() {
  const args = process.argv.slice(2);
  const html = arg(args, '--html');
  const odoo = arg(args, '--odoo');
  const out = arg(args, '--out');
  if (!html || !odoo || !out) throw new Error('Usage : --html <dir> --odoo <dir> --out <dir>');
  mkdirSync(out, { recursive: true });

  const lignes: Ligne[] = [];
  for (const s of SUBJECTS) {
    const avant = path.join(html, `${s.key}.png`);
    const apres = path.join(odoo, `${s.key}.png`);
    const res = comparerUn(avant, apres, path.join(out, s.key));
    const mesuree = 'score' in res;
    lignes.push({
      composant: s.contractId,
      statut: mesuree ? 'mesurée' : 'impossible',
      // Sur une mesure les deux captures existent par construction ; sur un refus
      // c'est justement l'absence éventuelle qu'il faut consigner.
      avant: mesuree || existsSync(avant) ? path.relative(REPO, avant) : null,
      apres: mesuree || existsSync(apres) ? path.relative(REPO, apres) : null,
      score: mesuree ? res.score : null,
      // La cause dominante est écrite à la main, APRÈS lecture du triptyque, et
      // prise au vocabulaire FERMÉ de 014. L'instrument ne la devine pas.
      cause: null,
      justification: null,
      raisonImpossible: mesuree ? null : res.impossible,
    });
    // Invariant C5 : une comparaison impossible est DITE, jamais comptée réussie.
    console.log(
      mesuree
        ? `  ${s.key.padEnd(16)} ${res.score.toFixed(4)} % de pixels différents`
        : `  ${s.key.padEnd(16)} IMPOSSIBLE — ${res.impossible}`,
    );
  }

  const dest = path.join(out, 'comparaison-image.json');
  writeFileSync(
    dest,
    JSON.stringify(
      {
        schemaVersion: 1,
        // Invariant C3 : DÉCLARÉ à la première mesure, avec sa raison — jamais
        // deviné au plan, jamais choisi après avoir vu les scores.
        plancherDeTolerance: null,
        raisonDuPlancher: null,
        lignes,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`\n→ ${path.relative(REPO, dest)}`);
  const mesurees = lignes.filter((l) => l.statut === 'mesurée').length;
  console.log(`${mesurees}/${lignes.length} comparaisons mesurées, ${lignes.length - mesurees} impossible(s).`);
}

runAsCli(import.meta.url, main);
