/**
 * Le harnais visuel se prouve LUI-MÊME — hors ligne, sans instance Odoo.
 * Spec 019, T004.
 *
 * Pourquoi ce fichier existe : `integrations/` n'est pas dans le `include` du
 * tsconfig racine, donc `npx tsc --noEmit` ne voit rien ici. Le tsconfig local
 * (`integrations/odoo/qa/tsconfig.json`) répare la moitié du trou ; ce self-test
 * répare l'autre. **Un instrument que rien ne typecheck ET que rien n'exécute est
 * un instrument dont on ne sait rien** — ce dépôt s'est déjà fait mordre
 * exactement là (`evals/fixtures`, où changer une signature partagée laissait
 * `tsc` vert et cassait `npm run eval` au runtime).
 *
 * ── Comptabilité honnête ─────────────────────────────────────────────────────
 * Un contrôle non exécutable est SAUTÉ et dit comme tel — jamais agrégé comme
 * réussi. `--strict` transforme tout saut en échec : c'est la forme qu'emploient
 * les portes de clôture (T071/T074), où un saut permanent serait un trou.
 *
 * Usage :
 *   npx tsx integrations/odoo/qa/visual/selftest.mts
 *   npx tsx integrations/odoo/qa/visual/selftest.mts --subjects <mod> [--strict]
 */
import { readFileSync, existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { embeddedFontFaces, launchBrowser } from '../../../../extract/figma/visual-parity/render.js';
import { readPng } from '../../../../extract/figma/visual-parity/img.js';
import { Tally } from '../../../../scripts/odoo/lib/tally.js';
import {
  DEVICE_SCALE_FACTOR,
  FRAME_PADDING_TOKEN,
  arg,
  loadSubjects,
  viewportFor,
  type Subject,
} from './subject.mts';
import { renderSubject } from './render-html.mts';
import { capturePage } from './capture-odoo.mts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..', '..', '..');
const ADDON = path.resolve(HERE, '..', '..', 'addons', 'piqueray_ds');
const FONTS_DIR = path.join(ADDON, 'static', 'src', 'fonts');
const FONTS_CSS = path.join(ADDON, 'static', 'src', 'css', 'generated', 'fonts.pqr.css');
const ADDON_QA = path.resolve(HERE, '..', '..', 'addons', 'piqueray_ds_qa');
const HARNESS_XML = path.join(ADDON_QA, 'views', 'harness.xml');

// `saute` = non exécutable ICI ET MAINTENANT, avec la raison qui le rendrait
// exécutable. Les trois compteurs et la règle de sortie sont partagés avec les
// portes de `scripts/odoo/` : une politique en deux copies se corrige d'un seul
// côté sans que rien ne le dise.
const tally = new Tally();
const { ok, ko, saute } = tally;

// ---------------------------------------------------------------------------
// 1. LE REFUS ATTENDU quand les dimensions divergent, et la mesure quand elles
//    sont égales. C'est la propriété sur laquelle repose tout le protocole :
//    sans elle, un écart de géométrie serait redimensionné puis masqué.
//    Entièrement hors ligne, sans instance et sans sujets.
// ---------------------------------------------------------------------------
function testRefus() {
  const dir = mkdtempSync(path.join(tmpdir(), 'pqr019-selftest-'));
  const png = (w: number, h: number, f: string) => {
    const p = new PNG({ width: w, height: h });
    p.data.fill(255);
    writeFileSync(path.join(dir, f), PNG.sync.write(p));
    return path.join(dir, f);
  };
  const a = png(40, 40, 'a.png');
  const b = png(41, 40, 'b.png');
  const cli = ['tsx', 'extract/image-parity/cli.ts'];
  const r = spawnSync('npx', [...cli, '--before', a, '--after', b, '--out', path.join(dir, 'out')], {
    cwd: REPO,
    encoding: 'utf8',
  });
  if (r.status !== 2) return ko("l'instrument REFUSE deux tailles différentes", `code ${r.status}, attendu 2`);
  ok("l'instrument REFUSE deux tailles différentes", "code 2 — un refus honnête plutôt qu'un écart masqué");

  // Et il MESURE quand elles sont égales — sinon le refus ne prouverait rien.
  const c = png(40, 40, 'c.png');
  const r2 = spawnSync('npx', [...cli, '--before', a, '--after', c, '--out', path.join(dir, 'out2')], {
    cwd: REPO,
    encoding: 'utf8',
  });
  if (r2.status !== 0) return ko("l'instrument MESURE deux tailles égales", `code ${r2.status}, attendu 0`);
  ok("l'instrument MESURE deux tailles égales", 'code 0');
}

// ---------------------------------------------------------------------------
// 2. SYMÉTRIE DES POLICES. Si un côté sert la vraie Montserrat et l'autre un
//    repli système, la mesure n'est pas approximative : elle est FAUSSE. C'est le
//    bug daté du 2026-07-23, où `document.fonts.check` répondait « disponible »
//    pendant que Chromium substituait une police système.
// ---------------------------------------------------------------------------
function testPolices() {
  const faces = embeddedFontFaces();
  const poids = [...faces.matchAll(/font-weight:(\d+)/g)].map((m) => m[1]).sort();
  if (poids.length !== 4) return ko('le harnais embarque 4 faces', `il en embarque ${poids.length}`);
  if (!/base64,[A-Za-z0-9+/]{500,}/.test(faces)) {
    return ko('les faces embarquées sont de VRAIS woff2', 'aucune charge base64 substantielle');
  }
  ok('le harnais embarque 4 faces Montserrat réelles', `poids ${poids.join(', ')}`);

  // L'addon doit servir LES MÊMES octets — pas « des Montserrat ». Ces fichiers
  // sont produits par T012/T013 ; avant elles, le contrôle est SAUTÉ, pas réussi.
  if (!existsSync(FONTS_DIR) || !existsSync(FONTS_CSS)) {
    return saute(
      "l'addon sert les mêmes faces, octet pour octet",
      `sorties générées absentes (${path.relative(REPO, FONTS_CSS)}) — elles arrivent avec T012/T013`,
    );
  }
  for (const w of poids) {
    const source = path.join(REPO, 'node_modules', '@fontsource', 'montserrat', 'files', `montserrat-latin-${w}-normal.woff2`);
    const servie = path.join(FONTS_DIR, `montserrat-latin-${w}-normal.woff2`);
    if (!existsSync(servie)) return ko(`l'addon sert le poids ${w}`, `absent : ${path.relative(REPO, servie)}`);
    if (!readFileSync(source).equals(readFileSync(servie))) {
      return ko(`le poids ${w} servi est IDENTIQUE à celui embarqué`, 'les octets diffèrent');
    }
  }
  ok("l'addon sert les mêmes faces, octet pour octet", `${poids.length}/4`);

  const css = readFileSync(FONTS_CSS, 'utf8');
  const declarees = (css.match(/@font-face/g) ?? []).length;
  if (declarees !== 4) return ko('fonts.pqr.css déclare les 4 faces', `il en déclare ${declarees}`);
  ok('fonts.pqr.css déclare les 4 faces');
}

// ---------------------------------------------------------------------------
// 3. LES DEUX CHEMINS DE CAPTURE PRODUISENT LA MÊME GÉOMÉTRIE. Le même document
//    passé par `renderSubject` (référence) et par `capturePage` (Odoo) doit donner
//    des PNG de dimensions IDENTIQUES — sinon `image-parity` refuserait toute
//    comparaison réelle, et on ne le découvrirait qu'avec une instance allumée.
//
//    Le sujet employé ici est SYNTHÉTIQUE, écrit dans ce fichier : le contrôle
//    porte sur les deux sondes, pas sur les composants de 019.
// ---------------------------------------------------------------------------
async function testGeometrie() {
  const sujet: Subject = {
    key: 'selftest-synthetique',
    contractId: 'n/a',
    odooPath: '/n-a',
    showcaseLabel: 'n/a',
    clip: { width: 200, height: 120 },
  };
  const doc = `<!doctype html><html><head><meta charset="utf-8"><style>
      html,body{margin:0;padding:0;background:#fff}
      .pqr-mesure{position:absolute;top:0;left:0;padding:${FRAME_PADDING_TOKEN}px;background:#fff}
      .b{width:120px;height:40px;background:#26282C}
    </style></head><body><div class="pqr-mesure"><div class="b"></div></div></body></html>`;
  let browser;
  try {
    ({ browser } = await launchBrowser());
  } catch (e) {
    return saute(
      'les 2 chemins de capture produisent la même géométrie',
      `aucun Chromium lançable (${String(e)}) — voir PLAYWRIGHT_CHROMIUM_PATH`,
    );
  }
  try {
    const viaHtml = await renderSubject(browser, sujet, doc);
    const viaOdoo = await capturePage(browser, sujet, `data:text/html;charset=utf-8,${encodeURIComponent(doc)}`);
    const a = readPng(viaHtml.png);
    const b = readPng(viaOdoo);
    if (a.width !== b.width || a.height !== b.height) {
      return ko('les 2 chemins de capture produisent la même géométrie', `référence ${a.width}×${a.height} vs Odoo ${b.width}×${b.height}`);
    }
    const attendu = { w: sujet.clip.width * DEVICE_SCALE_FACTOR, h: sujet.clip.height * DEVICE_SCALE_FACTOR };
    if (a.width !== attendu.w || a.height !== attendu.h) {
      return ko('la géométrie est celle du clip épinglé × DSF', `obtenu ${a.width}×${a.height}, attendu ${attendu.w}×${attendu.h}`);
    }
    ok(
      'les 2 chemins de capture produisent la même géométrie',
      `${a.width}×${a.height} px appareil (clip ${sujet.clip.width}×${sujet.clip.height} × DSF ${DEVICE_SCALE_FACTOR})`,
    );
  } finally {
    await browser.close();
  }
}

// ---------------------------------------------------------------------------
// 4. CONTRÔLES DÉPENDANT DES SUJETS — seulement si `--subjects` est fourni.
//    Sans module de sujets, l'instrument est générique : il n'a rien à dire sur
//    des clips qu'il ne connaît pas, et il le DIT au lieu de rendre vert.
// ---------------------------------------------------------------------------
function testSujets(subjects: readonly Subject[]) {
  for (const s of subjects) {
    const v = viewportFor(s);
    if (v.width < s.clip.width || v.height < s.clip.height) {
      return ko(`clip de ${s.key} contenu dans le viewport`, `viewport ${v.width}×${v.height} < clip ${s.clip.width}×${s.clip.height}`);
    }
  }
  ok(`les ${subjects.length} clip(s) tiennent dans leur viewport`);

  // Les pages de mesure doivent EXISTER côté Odoo. Un `odooPath` non déclaré
  // donnerait une 404 capturée comme une image valide, et la comparaison
  // mesurerait une page d'erreur contre un composant.
  if (!existsSync(HARNESS_XML)) {
    return saute(
      'chaque page de mesure est déclarée dans harness.xml',
      `${path.relative(REPO, HARNESS_XML)} absent — il arrive avec T017`,
    );
  }
  const harness = readFileSync(HARNESS_XML, 'utf8');
  for (const s of subjects) {
    if (!harness.includes(`<field name="url">${s.odooPath}</field>`)) {
      return ko(`la page ${s.odooPath} est déclarée dans harness.xml`, 'introuvable');
    }
  }
  ok(`les ${subjects.length} URL de mesure sont déclarées dans harness.xml`);

  // La marge du cadre vaut DES DEUX CÔTÉS : `render-html.mts` la lit dans
  // FRAME_PADDING_TOKEN, la page Odoo l'écrit dans son propre gabarit. Rien ne
  // les tiendrait ensemble sans ce contrôle — changer la constante ne déplacerait
  // QUE la référence, et l'écart tomberait dans le pourcentage comme un défaut de
  // composant.
  const margeOdoo = `padding: var(--pqr-space-${FRAME_PADDING_TOKEN})`;
  if (!harness.includes(margeOdoo)) {
    return ko(
      'les 2 cadres de mesure appliquent la MÊME marge',
      `harness.xml ne contient pas « ${margeOdoo} » — le côté Odoo a divergé de la référence`,
    );
  }
  ok('les 2 cadres de mesure appliquent la même marge', `space-${FRAME_PADDING_TOKEN} des deux côtés`);
}

async function main() {
  const args = process.argv.slice(2);
  const strict = args.includes('--strict');
  const subjectsArg = arg(args, '--subjects');

  console.log('Self-test du harnais visuel 019 — hors ligne, sans instance Odoo.\n');
  testRefus();
  testPolices();
  if (subjectsArg) {
    testSujets(await loadSubjects(subjectsArg));
  } else {
    saute('contrôles de sujets (clips, URL, marge)', 'aucun --subjects fourni — instrument générique');
  }
  await testGeometrie();

  const code = tally.resume(strict);
  if (code !== 0) process.exit(code);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
