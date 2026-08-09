/**
 * La comparaison : appelle l'instrument générique du dépôt SANS le modifier, une
 * fois par sujet, et produit un rapport de mesure. Spec 019, T004.
 *
 * ── Pourquoi réutiliser `extract/image-parity` tel quel ─────────────────────
 * Il est écrit pour ça : générique et agnostique du moteur de rendu — « it does
 * not know about Figma, manifests, pages, or React. Consumers decide how their
 * images were made ». Et il REFUSE deux images de tailles différentes
 * (`dimension-mismatch`) au lieu de les redimensionner, « because it would
 * otherwise hide a visual change ». Le clip épinglé des sujets rend les tailles
 * égales par construction : la comparaison stricte s'applique donc telle quelle.
 *
 * ── Par la PORTE BIBLIOTHÈQUE, pas par la porte processus ───────────────────
 * `compareImageFiles` + `writeImageParityReport` sont exactement ce qu'appelle
 * `extract/image-parity/cli.ts`. Les importer est la même réutilisation, non
 * modifiée — sans payer un `npx tsx` par sujet, et surtout sans dépendre du
 * format de la dernière ligne de stdout du CLI : un `console.log` de plus et
 * toutes les mesures se dégraderaient en « sortie illisible ». On lit ainsi
 * `status` tel que l'instrument le nomme (`input-invalid` ≠ `dimension-mismatch`),
 * distinction que le code de sortie écrase en un seul « code 2 ».
 *
 * ── Ce que cet instrument ne fait PAS ────────────────────────────────────────
 * Il ne juge pas. Il mesure, et il dit quand il ne peut pas. La cause dominante
 * d'un écart et sa justification restent `null` ici : elles s'écrivent à la main
 * APRÈS lecture du triptyque, jamais devinées par le programme. Le plancher de
 * tolérance aussi : il se déclare à la première mesure avec sa raison, jamais
 * choisi après avoir vu les scores.
 *
 * Usage :
 *   npx tsx integrations/odoo/qa/visual/compare.mts \
 *     --subjects <module> --html <dir> --odoo <dir> --out <dir>
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareImageFiles } from '../../../../extract/image-parity/compare.js';
import { writeImageParityReport } from '../../../../extract/image-parity/report.js';
import { arg, loadSubjects, runAsCli } from './subject.mts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..', '..', '..');

export interface Ligne {
  composant: string;
  sujet: string;
  statut: 'mesurée' | 'impossible';
  avant: string | null;
  apres: string | null;
  score: number | null;
  cause: string | null;
  justification: string | null;
  raisonImpossible: string | null;
}

/** Une comparaison. Ne juge RIEN : elle mesure, et dit quand elle ne peut pas.
 *  Le score est celui que l'instrument calcule — jamais estimé. */
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
  // `identical` et `diff` sont des MESURES ; les autres statuts sont des refus
  // HONNÊTES de l'instrument, rendus tels qu'il les nomme.
  if (rapport.diffPct === null) {
    return {
      impossible: `L'instrument a REFUSÉ la comparaison (${rapport.status}) : ${rapport.reason ?? 'sans détail'}`,
    };
  }
  return { score: rapport.diffPct };
}

async function main() {
  const args = process.argv.slice(2);
  const subjectsArg = arg(args, '--subjects');
  const html = arg(args, '--html');
  const odoo = arg(args, '--odoo');
  const out = arg(args, '--out');
  if (!subjectsArg || !html || !odoo || !out) {
    throw new Error('Usage : --subjects <module> --html <dir> --odoo <dir> --out <dir>');
  }
  mkdirSync(out, { recursive: true });

  const subjects = await loadSubjects(subjectsArg);
  const lignes: Ligne[] = [];
  for (const s of subjects) {
    const avant = path.join(html, `${s.key}.png`);
    const apres = path.join(odoo, `${s.key}.png`);
    const res = comparerUn(avant, apres, path.join(out, s.key));
    const mesuree = 'score' in res;
    lignes.push({
      composant: s.contractId,
      sujet: s.key,
      statut: mesuree ? 'mesurée' : 'impossible',
      // Sur une mesure les deux captures existent par construction ; sur un refus
      // c'est justement l'absence éventuelle qu'il faut consigner.
      avant: mesuree || existsSync(avant) ? path.relative(REPO, avant) : null,
      apres: mesuree || existsSync(apres) ? path.relative(REPO, apres) : null,
      score: mesuree ? res.score : null,
      cause: null,
      justification: null,
      raisonImpossible: mesuree ? null : res.impossible,
    });
    // Une comparaison impossible est DITE, jamais comptée réussie.
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
        subjectsModule: path.relative(REPO, path.resolve(process.cwd(), subjectsArg)),
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
  // Une mesure impossible ne doit pas s'agréger comme un succès jusque dans le
  // code de sortie : le pipeline qui appelle cet instrument doit le voir rouge.
  if (mesurees !== lignes.length) process.exit(1);
}

runAsCli(import.meta.url, main);
