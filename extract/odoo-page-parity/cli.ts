/**
 * `npm run odoo:pages:measure -- <page> [options]` — la mesure d'UNE page aux
 * quatre largeurs. Spec 037, T053.
 *
 * ── Ce qu'AUCUN drapeau ne peut faire ───────────────────────────────────────
 * Changer le seuil (5 %) ou la tolérance de hauteur (10 px). Ces deux nombres
 * vivent dans `views.json` avec leur date et leur raison ; les déplacer dans la
 * ligne de commande, c'est permettre de les choisir APRÈS avoir lu les scores,
 * ce que FR-016 interdit nommément. Une décision owner datée modifie le
 * fichier, jamais l'invocation.
 *
 * ── Trois codes de sortie, jamais confondus ─────────────────────────────────
 *   0 — les quatre largeurs sont mesurées ET vertes
 *   1 — au moins un ROUGE (l'instrument a vu quelque chose)
 *   2 — au moins un IMPOSSIBLE (l'instrument n'a pas pu voir)
 * Confondre 1 et 2 ferait passer une campagne aveugle pour une campagne propre.
 *
 * Options : `--base <url>` (défaut http://localhost:8109 — l'instance jetable
 * 037), `--out <dir>`, `--instance <nom>`, `--only-odoo` / `--only-figma`.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from '../figma/visual-parity/render.js';
import { capturerPage } from './capture.js';
import { comparer } from './compare.js';
import { MesureImpossible, exporterVue, jetonFigma } from './figma-views.js';
import { ecrireRapport, rapportImpossible, rapportMesure, reprendreAnnotations } from './report.js';
import { diagnostiquer } from './sections.js';
import type { Manifeste, Rapport } from './types.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, '..', '..');
export const MANIFESTE = path.join(HERE, 'views.json');

export const lireManifeste = (abs: string = MANIFESTE): Manifeste =>
  JSON.parse(readFileSync(abs, 'utf8')) as Manifeste;

const sha = (b: Buffer): string => createHash('sha256').update(b).digest('hex');

/** Les drapeaux qui consomment la valeur suivante — pour ne pas prendre celle-ci
 *  pour le nom de la page. */
const DRAPEAUX_A_VALEUR = new Set(['--base', '--out', '--instance']);

const positionnel = (argv: readonly string[]): string | null => {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) { if (DRAPEAUX_A_VALEUR.has(argv[i])) i++; continue; }
    return argv[i];
  }
  return null;
};

const arg = (argv: readonly string[], nom: string, defaut: string): string => {
  const i = argv.indexOf(nom);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : defaut;
};

async function mesurer(argv: string[]): Promise<number> {
  const page = positionnel(argv);
  if (!page) {
    console.error('usage : npm run odoo:pages:measure -- <page> [--base URL] [--out DIR] [--instance NOM] [--only-odoo|--only-figma]');
    return 2;
  }
  const manifeste = lireManifeste();
  const entree = manifeste.pages[page];
  if (!entree) {
    console.error(`page inconnue du manifeste : ${page} (attendu : ${Object.keys(manifeste.pages).join(', ')})`);
    return 2;
  }

  const base = arg(argv, '--base', 'http://localhost:8109');
  const instance = arg(argv, '--instance', 'piqueray-odoo-037');
  const sortie = path.resolve(arg(argv, '--out', path.join(REPO, 'specs/037-pages-odoo-navigation-pixel/proofs/mesure', page)));
  const triptyques = path.join(REPO, '.page-parity', '037', page);
  const seulOdoo = argv.includes('--only-odoo');
  const seulFigma = argv.includes('--only-figma');
  const date = new Date().toISOString();

  const { browser } = await launchBrowser();
  let pire = 0;
  try {
    for (const largeur of manifeste.largeurs) {
      const vue = entree.vues[String(largeur)];
      const e = {
        page, url: entree.url, largeur, instance, date,
        seuilPct: manifeste.seuilPct, toleranceHauteurPx: manifeste.toleranceHauteurPx,
      };
      const cible = path.join(sortie, `${largeur}.json`);
      let rapport: Rapport;
      try {
        if (!vue) throw new MesureImpossible(`vue absente du manifeste pour ${largeur} px`);
        const odoo = seulFigma ? null : await capturerPage(browser, base, entree.url, largeur);
        if (seulOdoo) {
          // Le volet « capture seule » : il sert la CAPTURE DE L'AVANT (§X,
          // T020). Aucun rapport n'est écrit — un rapport sans vue serait un
          // rapport à moitié, et on ne range pas un demi-résultat dans le
          // dossier des preuves.
          mkdirSync(triptyques, { recursive: true });
          const png = path.join(triptyques, `${largeur}.odoo.png`);
          writeFileSync(png, odoo!.octets);
          console.log(`  ✔ ${page} ${String(largeur).padStart(4)} px · capture ${odoo!.largeur}×${odoo!.hauteur} · sha256 ${odoo!.sha256.slice(0, 12)} · ${path.relative(REPO, png)}`);
          continue;
        }
        const figma = await exporterVue(manifeste.fileKey, vue.nodeId, largeur, jetonFigma());
        if (seulFigma) {
          mkdirSync(triptyques, { recursive: true });
          const png = path.join(triptyques, `${largeur}.figma.png`);
          writeFileSync(png, figma.octets);
          console.log(`  ✔ ${page} ${String(largeur).padStart(4)} px · vue ${figma.largeur}×${figma.hauteur} · ${path.relative(REPO, png)}`);
          continue;
        }
        const c = comparer(odoo!.png, figma.png, manifeste.seuilPct, manifeste.toleranceHauteurPx);
        const d = diagnostiquer(figma.enfants, odoo!.sections, manifeste.toleranceHauteurPx);
        rapport = rapportMesure({
          entree: e, nodeId: vue.nodeId,
          hauteurFigma: figma.hauteur, sha256Figma: sha(figma.octets),
          hauteurOdoo: odoo!.hauteur, sha256Odoo: odoo!.sha256,
          comparaison: c, diagnostic: d,
          dossierTriptyques: triptyques,
          annotations: reprendreAnnotations(cible),
        });
      } catch (err) {
        if (!(err instanceof MesureImpossible)) throw err;
        rapport = rapportImpossible(e, err.raison);
      }
      ecrireRapport(cible, rapport);
      pire = Math.max(pire, rapport.statut === 'impossible' ? 2 : rapport.verdictPage === 'rouge' ? 1 : 0);
      console.log(ligne(rapport));
    }
  } finally {
    await browser.close();
  }
  return pire;
}

/** Le score n'est JAMAIS montré seul : Δh est à côté, sur la même ligne (§XII). */
function ligne(r: Rapport): string {
  const t = `  ${r.page} ${String(r.largeur).padStart(4)} px`;
  if (r.statut === 'impossible') return `  ⊘ ${t.trim()} · impossible — ${r.raisonImpossible}`;
  const marque = r.verdictPage === 'vert' ? '✔' : '✖';
  const dh = (r.ecartHauteurPx ?? 0) >= 0 ? `+${r.ecartHauteurPx}` : String(r.ecartHauteurPx);
  return `  ${marque}${t} · ${r.scorePct?.toFixed(2)} % (seuil ${r.seuilPct}) · Δh ${dh} px (${r.verdictHauteur})`
    + ` · ${r.structure}${r.sectionOrigineDecalage ? ` · décalage dès « ${r.sectionOrigineDecalage} »` : ''}`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  mesurer(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (err) => { console.error(`✖ ${err instanceof Error ? err.message : String(err)}`); process.exit(2); },
  );
}
