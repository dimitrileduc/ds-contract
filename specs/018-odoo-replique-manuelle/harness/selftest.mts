/**
 * Le harnais se prouve LUI-MÊME — hors ligne, sans instance Odoo, sur fixtures.
 *
 * Pourquoi ce fichier existe : `specs/` est HORS du `include` du tsconfig racine,
 * donc `npx tsc --noEmit` ne voit rien ici. Le `tsconfig.json` spec-local répare
 * la moitié du trou ; celui-ci répare l'autre. **Un instrument que rien ne
 * typecheck ET que rien n'exécute est un instrument dont on ne sait rien** — et
 * ce dépôt s'est déjà fait mordre exactement là (`evals/fixtures`, où changer une
 * signature partagée laissait `tsc` vert et cassait `npm run eval` au runtime).
 *
 *   npx tsx specs/018-…/harness/selftest.mts
 */
import { readFileSync, existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { embeddedFontFaces } from '../../../extract/figma/visual-parity/render.js';
import { SUBJECTS, DEVICE_SCALE_FACTOR, viewportFor } from './subjects.mts';
import { launchBrowser, renderSubject } from './render-html.mts';
import { capturePage, FONT_SETTLE_MS } from './capture-odoo.mts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..', '..');
const MODULE = path.join(HERE, '..', 'module', 'piqueray_ds');

let failed = 0;
const ok = (name: string, detail = '') => console.log(`  ✔ ${name}${detail ? ` — ${detail}` : ''}`);
const ko = (name: string, why: string) => {
  failed++;
  console.log(`  ✖ ${name}\n      ${why}`);
};

// ---------------------------------------------------------------------------
// 1. SYMÉTRIE DES POLICES (invariant C7) — le contrôle le plus important, et
//    entièrement hors ligne. Si un côté sert la vraie Montserrat et l'autre un
//    repli système, la mesure n'est pas approximative : elle est FAUSSE, et elle
//    est à refaire, pas à trier. C'est le bug daté du 2026-07-23.
// ---------------------------------------------------------------------------
function testPolices() {
  const faces = embeddedFontFaces();
  const poids = [...faces.matchAll(/font-weight:(\d+)/g)].map((m) => m[1]).sort();
  if (poids.length !== 4) return ko('C7 · le harnais embarque 4 faces', `il en embarque ${poids.length}`);
  if (!/base64,[A-Za-z0-9+/]{500,}/.test(faces)) return ko('C7 · les faces sont de VRAIS woff2', 'aucune charge base64 substantielle');
  ok('C7 · le harnais embarque 4 faces Montserrat réelles', `poids ${poids.join(', ')}`);

  // Et le module doit servir LES MÊMES, octet pour octet — pas « des Montserrat ».
  let same = 0;
  for (const w of poids) {
    const source = path.join(REPO, 'node_modules', '@fontsource', 'montserrat', 'files', `montserrat-latin-${w}-normal.woff2`);
    const servie = path.join(MODULE, 'static', 'src', 'fonts', `montserrat-latin-${w}-normal.woff2`);
    if (!existsSync(servie)) return ko(`C7 · le module sert le poids ${w}`, `absent : ${servie}`);
    if (!readFileSync(source).equals(readFileSync(servie))) {
      return ko(`C7 · le poids ${w} servi est IDENTIQUE à celui embarqué`, 'les octets diffèrent');
    }
    same++;
  }
  ok('C7 · le module sert les MÊMES faces, octet pour octet', `${same}/4`);

  // Et il les déclare vraiment, sinon les fichiers ne servent à rien.
  const css = readFileSync(path.join(MODULE, 'static', 'src', 'css', 'fonts.css'), 'utf8');
  const declarees = (css.match(/@font-face/g) ?? []).length;
  if (declarees !== 4) return ko('C7 · fonts.css déclare les 4 faces', `il en déclare ${declarees}`);
  ok('C7 · fonts.css déclare les 4 faces');
}

// ---------------------------------------------------------------------------
// 2. LES DEUX CHEMINS DE CAPTURE PRODUISENT LA MÊME GÉOMÉTRIE.
//    Le même document passé par `renderSubject` (côté HTML) et par `capturePage`
//    (côté Odoo) doit donner des PNG de dimensions IDENTIQUES. Sinon
//    `images:compare` refuserait toute comparaison réelle, et on ne le
//    découvrirait qu'avec une instance allumée.
// ---------------------------------------------------------------------------
async function testGeometrie() {
  const sujet = SUBJECTS[0];
  const doc = `<!doctype html><html><head><meta charset="utf-8"><style>
      html,body{margin:0;padding:0;background:#fff}
      .pqr-mesure{position:absolute;top:0;left:0;padding:24px;background:#fff}
      .b{width:120px;height:40px;background:#26282C}
    </style></head><body><div class="pqr-mesure"><div class="b"></div></div></body></html>`;
  const browser = await launchBrowser();
  try {
    const viaHtml = await renderSubject(browser, sujet, doc);
    const viaOdoo = await capturePage(browser, sujet, `data:text/html;charset=utf-8,${encodeURIComponent(doc)}`);
    const a = PNG.sync.read(viaHtml.png);
    const b = PNG.sync.read(viaOdoo);
    if (a.width !== b.width || a.height !== b.height) {
      return ko('les 2 chemins de capture produisent la même géométrie', `HTML ${a.width}×${a.height} vs Odoo ${b.width}×${b.height}`);
    }
    const attendu = { w: sujet.clip.width * DEVICE_SCALE_FACTOR, h: sujet.clip.height * DEVICE_SCALE_FACTOR };
    if (a.width !== attendu.w || a.height !== attendu.h) {
      return ko('la géométrie est celle du clip épinglé × DSF', `obtenu ${a.width}×${a.height}, attendu ${attendu.w}×${attendu.h}`);
    }
    ok('les 2 chemins de capture produisent la même géométrie', `${a.width}×${a.height} px appareil (clip ${sujet.clip.width}×${sujet.clip.height} × DSF ${DEVICE_SCALE_FACTOR})`);
  } finally {
    await browser.close();
  }
}

// ---------------------------------------------------------------------------
// 3. LE REFUS ATTENDU quand les dimensions divergent. On vérifie que
//    l'instrument générique refuse (code 2) plutôt que de redimensionner — la
//    propriété sur laquelle repose tout le protocole.
// ---------------------------------------------------------------------------
function testRefus() {
  const dir = mkdtempSync(path.join(tmpdir(), 'pqr-selftest-'));
  const png = (w: number, h: number, f: string) => {
    const p = new PNG({ width: w, height: h });
    p.data.fill(255);
    writeFileSync(path.join(dir, f), PNG.sync.write(p));
    return path.join(dir, f);
  };
  const a = png(40, 40, 'a.png');
  const b = png(41, 40, 'b.png');
  const r = spawnSync('npx', ['tsx', 'extract/image-parity/cli.ts', '--before', a, '--after', b, '--out', path.join(dir, 'out')], {
    cwd: REPO,
    encoding: 'utf8',
  });
  if (r.status !== 2) return ko("l'instrument REFUSE deux tailles différentes", `code ${r.status}, attendu 2`);
  ok("l'instrument REFUSE deux tailles différentes", 'code 2 — un refus honnête plutôt qu'.concat(' un écart masqué'));

  // Et il MESURE quand elles sont égales — sinon le refus ne prouverait rien.
  const c = png(40, 40, 'c.png');
  const r2 = spawnSync('npx', ['tsx', 'extract/image-parity/cli.ts', '--before', a, '--after', c, '--out', path.join(dir, 'out2')], {
    cwd: REPO,
    encoding: 'utf8',
  });
  if (r2.status !== 0) return ko("l'instrument MESURE deux tailles égales", `code ${r2.status}, attendu 0`);
  ok("l'instrument MESURE deux tailles égales", 'code 0');
}

// ---------------------------------------------------------------------------
// 4. Les clips épinglés contiennent réellement leur sujet — sinon la mesure
//    comparerait deux composants coupés, et le dirait « identiques ».
// ---------------------------------------------------------------------------
function testClips() {
  for (const s of SUBJECTS) {
    const v = viewportFor(s);
    if (v.width < s.clip.width || v.height < s.clip.height) {
      return ko(`clip de ${s.key} contenu dans le viewport`, `viewport ${v.width}×${v.height} < clip ${s.clip.width}×${s.clip.height}`);
    }
  }
  ok('les 3 clips tiennent dans leur viewport');
  const attendus = new Set(SUBJECTS.map((s) => s.odooPath));
  if (attendus.size !== SUBJECTS.length) return ko('les 3 pages de mesure ont des URL distinctes', 'doublon');
  const harness = readFileSync(path.join(MODULE, 'views', 'harness.xml'), 'utf8');
  for (const s of SUBJECTS) {
    if (!harness.includes(`<field name="url">${s.odooPath}</field>`)) {
      return ko(`la page ${s.odooPath} est déclarée dans harness.xml`, 'introuvable');
    }
  }
  ok('les 3 URL de mesure sont déclarées dans harness.xml');
}

async function main() {
  console.log('Self-test du harnais 018 — hors ligne, sans instance Odoo.\n');
  testPolices();
  testClips();
  testRefus();
  await testGeometrie();
  console.log();
  if (failed > 0) {
    console.log(`${failed} contrôle(s) en échec.`);
    process.exit(1);
  }
  console.log('Tous les contrôles passent.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
