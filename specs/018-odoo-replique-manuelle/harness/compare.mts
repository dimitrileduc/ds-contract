/**
 * La comparaison : appelle `npm run images:compare` (`extract/image-parity/cli.ts`)
 * SANS le modifier, une fois par sujet, et produit les 3 lignes du schéma de
 * `../contracts/visual-comparison.md` §4.
 *
 * ── Pourquoi réutiliser ce CLI tel quel ─────────────────────────────────────
 * Il est écrit pour ça : générique et agnostique du moteur de rendu — « it does
 * not know about Figma, manifests, pages, or React. Consumers decide how their
 * images were made ». Et il REFUSE deux images de tailles différentes
 * (`dimension-mismatch`, code 2) au lieu de les redimensionner, « because it
 * would otherwise hide a visual change ».
 *
 * Le clip épinglé de `subjects.mts` rend les tailles égales PAR CONSTRUCTION :
 * la comparaison stricte s'applique donc telle quelle, et une différence de
 * géométrie se lit en PIXELS DE DIFF — jamais en refus qui aurait dissimulé la
 * mesure.
 *
 * Usage :
 *   npx tsx specs/018-…/harness/compare.mts --html <dir> --odoo <dir> --out <dir>
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBJECTS } from './subjects.mts';

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
 *  Le score est celui que l'instrument imprime — jamais estimé (invariant C4). */
export function comparerUn(avant: string, apres: string, out: string): number | { impossible: string } {
  for (const [role, p] of [['avant', avant], ['après', apres]] as const) {
    if (!existsSync(p)) return { impossible: `Capture « ${role} » absente : ${p}` };
  }
  mkdirSync(out, { recursive: true });
  const r = spawnSync(
    'npx',
    ['tsx', 'extract/image-parity/cli.ts', '--before', avant, '--after', apres, '--out', out],
    { cwd: REPO, encoding: 'utf8' },
  );
  // exit 0 = identique, 1 = diff (les deux sont des MESURES), 2 = refus.
  if (r.status === 2) {
    const detail = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim().split('\n').pop() ?? '(sans détail)';
    return { impossible: `L'instrument a REFUSÉ la comparaison (code 2) : ${detail}` };
  }
  if (r.status !== 0 && r.status !== 1) {
    return { impossible: `L'instrument est sorti en ${r.status} : ${`${r.stdout ?? ''}${r.stderr ?? ''}`.trim().slice(0, 300)}` };
  }
  let rapport: { diffPct?: number | null; status?: string };
  try {
    rapport = JSON.parse((r.stdout ?? '').trim().split('\n').pop() ?? '{}');
  } catch {
    return { impossible: `Sortie de l'instrument illisible : ${(r.stdout ?? '').slice(0, 200)}` };
  }
  if (typeof rapport.diffPct !== 'number') {
    return { impossible: `L'instrument n'a pas rendu de pourcentage (status=${rapport.status ?? '?'})` };
  }
  return rapport.diffPct;
}

async function main() {
  const args = process.argv.slice(2);
  const read = (f: string) => {
    const i = args.indexOf(f);
    return i >= 0 ? args[i + 1] : null;
  };
  const html = read('--html');
  const odoo = read('--odoo');
  const out = read('--out');
  if (!html || !odoo || !out) throw new Error('Usage : --html <dir> --odoo <dir> --out <dir>');
  mkdirSync(out, { recursive: true });

  const lignes: Ligne[] = [];
  for (const s of SUBJECTS) {
    const avant = path.join(html, `${s.key}.png`);
    const apres = path.join(odoo, `${s.key}.png`);
    const res = comparerUn(avant, apres, path.join(out, s.key));
    if (typeof res === 'number') {
      lignes.push({
        composant: s.contractId,
        statut: 'mesurée',
        avant: path.relative(REPO, avant),
        apres: path.relative(REPO, apres),
        score: res,
        // La cause dominante est écrite à la main, APRÈS lecture du triptyque, et
        // prise au vocabulaire FERMÉ de 014. L'instrument ne la devine pas.
        cause: null,
        justification: null,
        raisonImpossible: null,
      });
      console.log(`  ${s.key.padEnd(16)} ${res.toFixed(4)} % de pixels différents`);
    } else {
      lignes.push({
        composant: s.contractId,
        statut: 'impossible',
        avant: existsSync(avant) ? path.relative(REPO, avant) : null,
        apres: existsSync(apres) ? path.relative(REPO, apres) : null,
        score: null,
        cause: null,
        justification: null,
        raisonImpossible: res.impossible,
      });
      // Invariant C5 : une comparaison impossible est DITE, jamais comptée réussie.
      console.log(`  ${s.key.padEnd(16)} IMPOSSIBLE — ${res.impossible}`);
    }
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

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
