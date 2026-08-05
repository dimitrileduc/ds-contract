/**
 * REPRO HEADLESS — « le token est corrigé, le script porte 32, le canvas reste à 64 ».
 *
 *   npx tsx evals/fixtures/016-accordionrow-amend-skip-repro.mjs
 *
 * Rejoue, dans le mock fidèle de l'API Figma (scripts/plugin-engine-mock-figma.mjs),
 * la séquence exacte vécue sur le fichier client :
 *
 *   RUN 0  figma-sync/01-tokens.js @5c102f2^   → publie les variables (trigger = 64)
 *                                                = l'état MESURÉ du fichier client
 *                                                  (parity/snapshots/figma-tokens.json)
 *   RUN 1  figma-sync/02-accordionrow.js @5c102f2^ (px 64) → création du set
 *   RUN 2  figma-sync/02-accordionrow.js @HEAD    (px 32) → amend, amended:true
 *   RUN 3  figma-sync/02-accordionrow.js @HEAD    (px 32) → SKIP, amended:undefined
 *   RUN 4  01-tokens.js @HEAD (publie 32) puis 02 @HEAD    → SKIP encore
 *   RUN 5  marqueur specHash effacé + 01-tokens @HEAD      → l'amend prend enfin
 *
 * Deux fidélités du mock sont explicitement ENRICHIES ICI (et signalées à l'écran),
 * parce que le mock ne les modélise pas :
 *   (a) l'autorité d'une variable liée sur width/height — le mock enregistre la
 *       liaison (plugin-engine-mock-figma.mjs:137) mais ne touche pas la valeur ;
 *       Figma, lui, résout la variable et l'applique.
 * Sans (a) le mock ne peut pas montrer le blocage géométrique ; le blocage du
 * specHash, lui, est reproduit par le mock TEL QUEL, sans aucun enrichissement.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createFigmaMock } from '../../scripts/plugin-engine-mock-figma.mjs';

const ROOT = process.cwd();
const OLD = '5c102f2^'; // avant la correction du token 64 → 32
const gitShow = (ref, p) =>
  execFileSync('git', ['show', `${ref}:${p}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const head = (p) => readFileSync(path.join(ROOT, p), 'utf8');

const TOK_OLD = gitShow(OLD, 'figma-sync/01-tokens.js');
const TOK_NEW = head('figma-sync/01-tokens.js');
const ACC_OLD = gitShow(OLD, 'figma-sync/02-accordionrow.js');
const ACC_NEW = head('figma-sync/02-accordionrow.js');

const pxOf = (src, varName) => {
  const i = src.indexOf(`"varName": "${varName}"`);
  const before = src.slice(Math.max(0, i - 200), i);
  return before.match(/"px":\s*([0-9.]+)/g)?.pop();
};
console.log('— ce que portent les scripts (fait de dépôt) —');
console.log(`  02-accordionrow.js @${OLD} : trigger ${pxOf(ACC_OLD, 'size/accordion-row/trigger')}`);
console.log(`  02-accordionrow.js @HEAD   : trigger ${pxOf(ACC_NEW, 'size/accordion-row/trigger')}`);

// --- le mock, + l'enrichissement (a) ---------------------------------------
const { figma, root, variables } = createFigmaMock();
figma.fileKey = 'd9FYAUcqdcNtsuaMgLefvJ';
const proto = Object.getPrototypeOf(figma.createFrame());
const origBind = proto.setBoundVariable;
let VARIABLE_AUTHORITY = true; // (a)
proto.setBoundVariable = function (field, variable) {
  origBind.call(this, field, variable);
  if (!VARIABLE_AUTHORITY) return;
  if (field !== 'width' && field !== 'height') return;
  const r = variable.resolveForConsumer ? variable.resolveForConsumer(this) : null;
  if (r && typeof r.value === 'number') this[field] = r.value; // Figma applique la variable
};

const ctx = vm.createContext({ figma, console: { log() {}, warn() {}, error() {} } });
const run = (code) => vm.runInContext(`(async () => {\n${code}\n})()`, ctx, { timeout: 120_000 });

const varValue = (name) => {
  const v = variables.find((x) => x.name === name);
  return v ? v.resolveForConsumer().value : '(absente)';
};
const triggers = () => {
  const set = root.findOne((n) => n.type === 'COMPONENT_SET');
  if (!set) return '(pas de set)';
  return (set.children ?? [])
    .filter((c) => /Etat=Ferme/.test(c.name))
    .map((c) => {
      const t = c.findAll((n) => n.name === 'trigger')[0];
      return `${c.name} → trigger h=${t ? t.height : '?'}${t?.boundVariables?.height ? ' [height liée à une variable]' : ''}`;
    })
    .join('\n      ');
};
const shape = (r) =>
  `amended=${r.amended} skipped=${r.skipped}${r.reason ? ` reason="${r.reason}"` : ''} clés=[${Object.keys(r).join(',')}]`;

const step = async (label, code) => {
  const out = await run(code);
  const r = out.results[0];
  console.log(`\n${label}`);
  console.log(`   rapport : ${shape(r)}`);
  console.log(`   variable size/accordion-row/trigger sur le "canvas" = ${varValue('size/accordion-row/trigger')}`);
  console.log(`      ${triggers()}`);
  return r;
};

console.log('\n============ RUN 0 — publier les variables telles que le fichier client les a ============');
await run(TOK_OLD);
console.log(`   size/accordion-row/trigger       = ${varValue('size/accordion-row/trigger')}   (cliché canvas : 64)`);
console.log(`   size/accordion-row/trigger-petit = ${varValue('size/accordion-row/trigger-petit')}   (cliché canvas : 40)`);

await step(`============ RUN 1 — 02-accordionrow.js @${OLD} (px 64) : création ============`, ACC_OLD);
await step('============ RUN 2 — 02-accordionrow.js @HEAD (px 32) : 1re exécution après la correction ============', ACC_NEW);
await step('============ RUN 3 — 02-accordionrow.js @HEAD (px 32) : RE-EXÉCUTION (le symptôme rapporté) ============', ACC_NEW);

console.log('\n============ RUN 4 — on publie enfin les tokens corrigés (01-tokens.js @HEAD), puis on relance 02 ============');
await run(TOK_NEW);
console.log(`   size/accordion-row/trigger = ${varValue('size/accordion-row/trigger')} (la variable est enfin à jour)`);
await step('   … et on relance 02-accordionrow.js @HEAD :', ACC_NEW);

console.log('\n============ RUN 5 — on casse le marqueur specHash pour forcer l’amend ============');
const set = root.findOne((n) => n.type === 'COMPONENT_SET');
set.setSharedPluginData('ds_contracts', 'specHash', '');
await step('   02-accordionrow.js @HEAD, marqueur effacé :', ACC_NEW);

console.log('\n============ CONTRE-ÉPREUVE — mock BRUT (sans l’enrichissement (a)) ============');
VARIABLE_AUTHORITY = false;
set.setSharedPluginData('ds_contracts', 'specHash', '');
// on remet la variable à la valeur périmée du canvas client
variables.find((v) => v.name === 'size/accordion-row/trigger').setValueForMode(
  Object.keys(variables.find((v) => v.name === 'size/accordion-row/trigger').valuesByMode)[0], 64,
);
await step('   variable=64, script px=32, liaison SANS autorité (mock tel quel) :', ACC_NEW);
console.log(
  '\n   → sans (a) le mock rend 32 : il ne modélise pas l’autorité de la variable liée.\n' +
  '     C’est le trou de fidélité qui a laissé passer ce défaut headless.',
);
