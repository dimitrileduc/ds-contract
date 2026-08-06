/**
 * Une photo posée sur une INSTANCE DE PAGE survit à une reconstruction — et le
 * contrôle ÉCHOUE FRANCHEMENT si elle tombe, s'effondre ou change de place.
 *
 * CE QUE CETTE FIXTURE REJOUE. Le 2026-08-06, une régénération a effondré
 * **62 photos** sur 10 sections de 8 maquettes du fichier client, **derrière un
 * rapport vert**. Le sauvetage (`harvestImagePaints` / `restoreImagePaints`) ne
 * voyait que le composant MAÎTRE, alors que **255 des 349 photos vivantes sont
 * des surcharges d'instance de page** — les trois quarts de la population
 * (016/proofs/photos/RECONCILIATION.md:26). Les deux chemins d'amend font
 * `for (const child of [...comp.children]) child.remove()` ; Figma propage la
 * démolition aux instances, et les surcharges de peinture meurent avec les nœuds
 * qui les portaient.
 *
 * L'APPARIEMENT EST POSITIONNEL, JAMAIS NOMINAL (§VIII, FR-002/FR-004). La clé
 * d'un emplacement est `(hostId, cheminPosition)` — indices depuis l'hôte. Le nom
 * de calque est documentaire : un renommage n'est pas une perte, deux homonymes
 * ne se confondent pas. L'ancien appariement faisait l'inverse — nom d'abord,
 * puis « le premier paint non réclamé », le repli qui rendait l'interversion
 * structurellement invisible.
 *
 * LES QUATRE CAS (contracts/preservation-photos.interface.md §4) :
 *   A — PERTE       : l'accueil d'une empreinte disparaît du contrat → refus
 *                     nommant photo, hôte et rang, AUCUN nœud touché.
 *   B — INTERVERSION: deux plans de même taille dont les empreintes s'échangent
 *                     → le contrôle échoue en nommant LES DEUX emplacements.
 *   C — SANS ACCUEIL: une empreinte qu'aucune part `img` ne peut recevoir →
 *                     refus avant toute mutation ; avec acquittement écrit au
 *                     registre, elle passe ET l'acquittement est IMPRIMÉ.
 *   D — DÉTERMINISME: deux exécutions sans geste rendent le même verdict (SC-009).
 *
 * ⚠️ `evals/fixtures/` est hors `tsconfig` : `tsc --noEmit` ne voit pas ce
 * fichier. Il se prouve en l'EXÉCUTANT.
 */
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitFigmaScript } from '../../core/emit-figma-script.js';
// @ts-expect-error — the mock ships as untyped .mjs (the plugin-check harness imports it the same way)
import { createFigmaMock } from '../../scripts/plugin-engine-mock-figma.mjs';

const NOM = 'photos-instance-overrides-preserved';
const fail = (message: string): never => {
  console.error(`✘ ${NOM}: ${message}`);
  process.exit(1);
};

const tokenTree = { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } };

type Acquittement = {
  hostId: string;
  cheminPosition: string;
  imageHash: string;
  motif: string;
  decidePar: string;
  decideLe: string;
  receiptId: string;
};

/** Un contrat à DEUX plans photo de même taille (le montage de l'interversion)
 *  plus un bloc de texte. `gap` sert uniquement à faire changer le specHash,
 *  donc à déclencher l'amend. `plans` permet de RETIRER un plan — c'est le
 *  montage du cas A. */
const mk = (id: string, name: string, gap: string, plans: string[] = ['PhotoA', 'PhotoB']) => {
  const parts: Record<string, unknown> = {};
  for (const p of plans) {
    parts[p] = {
      element: 'img',
      attrs: { src: '{photoUrl}', alt: '{photoAlt}' },
      literals: { width: '120px', height: '80px' },
    };
  }
  parts.Contenu = { text: 'Bonjour' };
  return ContractSchema.parse({
    id, name, version: '1.0.0', status: 'draft',
    description: 'Section with photo planes (runtime URL props) and text content.',
    semantics: { element: 'div' },
    props: [
      { name: 'photoUrl', type: 'text', default: '', bindings: { figma: { kind: 'NONE' }, code: { prop: 'photoUrl' } } },
      { name: 'photoAlt', type: 'text', default: '', bindings: { figma: { kind: 'NONE' }, code: { prop: 'photoAlt' } } },
    ],
    states: [], events: [],
    anatomy: { root: { layout: { display: 'flex', direction: 'column' }, literals: { gap }, parts } },
    anchors: {
      figma: { fileKey: null, componentSetKey: null },
      code: { importPath: `src/components/${name}`, export: name },
    },
  });
};

type Scene = {
  figma: any;
  root: any;
  runScript: (code: string) => Promise<unknown>;
  emit: (c: ReturnType<typeof mk>, acquittements?: Acquittement[]) => string;
};

const scene = (): Scene => {
  const { figma, root } = createFigmaMock();
  const scriptCtx = vm.createContext({ figma, console: { log() {}, warn() {}, error() {} } });
  const runScript = (code: string): Promise<unknown> =>
    vm.runInContext(`(async () => {\n${code}\n})()`, scriptCtx, { timeout: 120_000 });
  const emit = (c: ReturnType<typeof mk>, acquittements?: Acquittement[]) =>
    emitFigmaScript(c, {
      tokens: tokenTree,
      icons: new Map(),
      contracts: new Map([[c.id, c]]),
      ...(acquittements ? { acquittementsPhotos: acquittements } : {}),
    } as never);
  return { figma, root, runScript, emit };
};

const marker = (root: any, contractId: string) =>
  root.findOne(
    (n: any) =>
      (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') &&
      n.getSharedPluginData('ds_contracts', 'contractId') === contractId,
  );
const at = (node: any, chemin: string): any => {
  if (chemin === '') return node;
  let n = node;
  for (const seg of chemin.split('/')) {
    n = (n.children ?? [])[Number(seg)];
    if (!n) return null;
  }
  return n;
};
const imageHashesAt = (node: any, chemin: string): string[] => {
  const n = at(node, chemin);
  if (!n) return [];
  return (Array.isArray(n.fills) ? n.fills : [])
    .filter((f: any) => f && f.type === 'IMAGE')
    .map((f: any) => f.imageHash);
};
const paint = (hash: string) => [{ type: 'IMAGE', imageHash: hash, scaleMode: 'FILL', visible: true }];
const photoReportOf = (res: any) => {
  const list = res && res.results ? res.results : Array.isArray(res) ? res : [];
  return list.map((r: any) => r && r.photos).find(Boolean) ?? null;
};

// ===========================================================================
// LE CAS CENTRAL — un maître, trois instances de page, six empreintes distinctes
// ===========================================================================
async function casCentral() {
  const s = scene();
  await s.runScript(s.emit(mk('fixture.photos-inst', 'PhotosInst', '8px')));
  const comp = marker(s.root, 'fixture.photos-inst');
  if (!comp) fail('création : aucun composant marqué');

  // le maître porte ses propres photos…
  at(comp, '0').fills = paint('H-M-A');
  at(comp, '1').fills = paint('H-M-B');

  // …et trois instances de page portent chacune LES SIENNES (des surcharges).
  const page = s.figma.currentPage;
  const insts: any[] = [];
  for (let i = 1; i <= 3; i++) {
    const inst = comp.createInstance();
    page.appendChild(inst);
    if (!at(inst, '0') || !at(inst, '1')) {
      fail(`montage : l'instance ${i} ne miroite pas le sous-arbre de son maître — le faux-Figma doit l'apprendre (FR-002a)`);
    }
    at(inst, '0').fills = paint(`H-${i}-A`);
    at(inst, '1').fills = paint(`H-${i}-B`);
    insts.push(inst);
  }

  const res = await s.runScript(s.emit(mk('fixture.photos-inst', 'PhotosInst', '12px')));
  const comp2 = marker(s.root, 'fixture.photos-inst');

  const manques: string[] = [];
  if (imageHashesAt(comp2, '0')[0] !== 'H-M-A') manques.push(`maître 0 → ${JSON.stringify(imageHashesAt(comp2, '0'))} (attendu H-M-A)`);
  if (imageHashesAt(comp2, '1')[0] !== 'H-M-B') manques.push(`maître 1 → ${JSON.stringify(imageHashesAt(comp2, '1'))} (attendu H-M-B)`);
  for (let i = 1; i <= 3; i++) {
    const inst = insts[i - 1];
    if (imageHashesAt(inst, '0')[0] !== `H-${i}-A`) manques.push(`instance ${i} rang 0 → ${JSON.stringify(imageHashesAt(inst, '0'))} (attendu H-${i}-A)`);
    if (imageHashesAt(inst, '1')[0] !== `H-${i}-B`) manques.push(`instance ${i} rang 1 → ${JSON.stringify(imageHashesAt(inst, '1'))} (attendu H-${i}-B)`);
  }
  if (manques.length > 0) {
    fail(
      `LA PERTE DU 2026-08-06 SE REJOUE — ${manques.length} empreinte(s) sur 8 n'ont pas survécu à la reconstruction :\n` +
        manques.map((m) => `      · ${m}`).join('\n') +
        '\n    Le sauvetage ne descend pas aux instances du maître reconstruit.',
    );
  }

  const rapport = photoReportOf(res);
  if (!rapport) fail('le rapport de photos (RapportDePhotos, data-model §3) est absent des résultats de l\'amend');
  if (rapport.verdict !== 'vert') fail(`le rapport devrait être vert ici — got ${JSON.stringify(rapport.verdict)}`);
  if (!Array.isArray(rapport.hotes) || rapport.hotes.length !== 4) {
    fail(`le rapport doit porter 4 hôtes (le maître + ses 3 instances) — got ${JSON.stringify(rapport.hotes?.length)}`);
  }
  for (const h of rapport.hotes) {
    if (h.distinctesApres < h.distinctesAvant) {
      fail(`effondrement non signalé sur ${h.hostId} : ${h.distinctesAvant} → ${h.distinctesApres}`);
    }
  }
  console.log(`  ✔ central : 8 empreintes (maître + 3 instances) retrouvées à leur emplacement ; rapport ${rapport.verdict}, ${rapport.hotes.length} hôtes`);
  return rapport;
}

// ===========================================================================
// A — PERTE : l'accueil d'une empreinte disparaît du contrat
// ===========================================================================
async function casA() {
  const s = scene();
  await s.runScript(s.emit(mk('fixture.photos-a', 'PhotosA', '8px')));
  const comp = marker(s.root, 'fixture.photos-a');
  const inst = comp.createInstance();
  s.figma.currentPage.appendChild(inst);
  at(inst, '0').fills = paint('H-A-0');
  at(inst, '1').fills = paint('H-A-1'); // celle-ci va perdre son accueil
  const enfantsAvant = comp.children.length;

  let leve: string | null = null;
  try {
    // PhotoB est RETIRÉE du contrat : l'empreinte du rang 1 n'a plus d'accueil.
    await s.runScript(s.emit(mk('fixture.photos-a', 'PhotosA', '12px', ['PhotoA'])));
  } catch (e) {
    leve = e instanceof Error ? e.message : String(e);
  }
  if (!leve) fail('A : la reconstruction a été menée alors qu\'une empreinte perdait son accueil — elle devait REFUSER');
  for (const attendu of ['H-A-1', inst.id, '1']) {
    if (!leve.includes(attendu)) {
      fail(`A : le refus doit nommer photo, hôte ET rang — ${JSON.stringify(attendu)} absent de : ${leve.slice(0, 400)}`);
    }
  }
  if (comp.children.length !== enfantsAvant) fail(`A : le refus a touché des nœuds (${enfantsAvant} → ${comp.children.length}) — il doit précéder la première démolition (§X)`);
  if (imageHashesAt(inst, '0')[0] !== 'H-A-0') fail('A : le refus a détruit une autre photo — AUCUN nœud ne doit être touché');
  console.log('  ✔ A (perte) : refus nommant photo, hôte et rang, aucun nœud touché');
}

// ===========================================================================
// B — INTERVERSION : le contrôle nomme LES DEUX emplacements
// ===========================================================================
function casB() {
  // Le contrôle d'identité est le comparateur promu en T006 — l'instrument
  // INDÉPENDANT de celui qu'il contrôle. On lui soumet deux recensements où
  // deux empreintes de même taille ont échangé leur place.
  const dir = mkdtempSync(path.join(tmpdir(), 'photos-b-'));
  const photo = (chemin: string, hash: string) => ({
    racine: 'Section', racineId: '9:1', racineType: 'INSTANCE',
    cheminPosition: chemin, nomCalque: `plan-${chemin}`, typeNoeud: 'FRAME',
    champ: 'fills', indexPaint: 0,
    bounds: { x: 0, y: 0, w: 120, h: 80 },
    imageHash: hash, scaleMode: 'FILL', opacity: 1, visible: true,
    porteur: 'instance-override' as const,
  });
  const census = (photos: unknown[]) => ({
    schemaVersion: 1, nom: 'cas-B', fileKey: 'K', fileName: 'F', photos,
    octetsParHash: { h1: { base64: Buffer.from('A').toString('base64') }, h2: { base64: Buffer.from('B').toString('base64') } },
    refus: [],
  });
  const avant = path.join(dir, 'avant.json');
  const apres = path.join(dir, 'apres.json');
  const out = path.join(dir, 'rapport.json');
  writeFileSync(avant, JSON.stringify(census([photo('0', 'h1'), photo('1', 'h2')])));
  writeFileSync(apres, JSON.stringify(census([photo('0', 'h2'), photo('1', 'h1')])));

  let sortie = '';
  let code = 0;
  try {
    sortie = execFileSync('npx', ['tsx', 'extract/figma/photo-parity/photos-verify.mts', avant, apres, '--out', out], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (e: any) {
    sortie = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    code = e.status ?? 1;
  }
  if (code === 0) fail(`B : deux empreintes interverties doivent faire ÉCHOUER le contrôle — il a rendu 0.\n${sortie.slice(0, 600)}`);
  if (!/interverti/i.test(sortie)) fail(`B : l'échec doit nommer l'interversion — got : ${sortie.slice(0, 600)}`);
  for (const emplacement of ['0', '1']) {
    if (!sortie.includes(`::${emplacement}::`) && !sortie.includes(`/${emplacement} `) && !sortie.includes(`"${emplacement}"`)) {
      // dernier recours : le rapport écrit sur disque doit porter les deux rangs
      const rapport = JSON.parse(require('node:fs').readFileSync(out, 'utf8'));
      const rangs = JSON.stringify(rapport).match(/"cheminPosition":"(\d)"/g) ?? [];
      if (rangs.length < 2) fail(`B : le contrôle doit nommer LES DEUX emplacements — got : ${sortie.slice(0, 600)}`);
    }
  }
  console.log('  ✔ B (interversion) : le contrôle échoue et nomme les deux emplacements');
}

// ===========================================================================
// C — SANS ACCUEIL : refus avant mutation ; l'acquittement lève ET s'imprime
// ===========================================================================
async function casC() {
  // Montage : une empreinte posée sur un nœud qui n'est PAS une part `img`
  // (le bloc de texte du contrat) — aucune part `img` ne peut la recevoir une
  // fois les deux plans photo déjà réclamés par leurs propres empreintes.
  const monter = async (acquittements?: Acquittement[]) => {
    const s = scene();
    await s.runScript(s.emit(mk('fixture.photos-c', 'PhotosC', '8px')));
    const comp = marker(s.root, 'fixture.photos-c');
    const inst = comp.createInstance();
    s.figma.currentPage.appendChild(inst);
    at(inst, '0').fills = paint('H-C-0');
    at(inst, '1').fills = paint('H-C-1');
    at(inst, '2').fills = paint('H-C-ORPHELINE'); // sur le TEXTE : aucun accueil
    const enfantsAvant = comp.children.length;
    let leve: string | null = null;
    let res: unknown = null;
    try {
      res = await s.runScript(s.emit(mk('fixture.photos-c', 'PhotosC', '12px'), acquittements));
    } catch (e) {
      leve = e instanceof Error ? e.message : String(e);
    }
    return { s, comp, inst, enfantsAvant, leve, res };
  };

  const sans = await monter();
  if (!sans.leve) fail('C : une empreinte sans accueil doit faire REFUSER la reconstruction');
  if (!sans.leve.includes('H-C-ORPHELINE')) fail(`C : le refus doit nommer l'imageHash — got : ${sans.leve.slice(0, 300)}`);
  if (sans.comp.children.length !== sans.enfantsAvant) fail('C : le refus a touché des nœuds — il doit précéder la première démolition');

  const avecInst = await monter([]); // registre vide → toujours refus
  if (!avecInst.leve) fail('C : un registre VIDE ne lève rien — le refus doit tenir');

  // Le même montage, mais l'orpheline est acquittée nommément.
  const s2 = scene();
  await s2.runScript(s2.emit(mk('fixture.photos-c2', 'PhotosC2', '8px')));
  const comp2 = marker(s2.root, 'fixture.photos-c2');
  const inst2 = comp2.createInstance();
  s2.figma.currentPage.appendChild(inst2);
  at(inst2, '0').fills = paint('H-C2-0');
  at(inst2, '1').fills = paint('H-C2-1');
  at(inst2, '2').fills = paint('H-C2-ORPHELINE');
  const acquit: Acquittement[] = [{
    hostId: inst2.id,
    cheminPosition: '2',
    imageHash: 'H-C2-ORPHELINE',
    motif: 'La part a été retirée du contrat — la photo n\'a plus d\'accueil par décision, pas par accident.',
    decidePar: 'owner',
    decideLe: '2026-08-06',
    receiptId: 'acq-fixture-c',
  }];
  let res2: any = null;
  try {
    res2 = await s2.runScript(s2.emit(mk('fixture.photos-c2', 'PhotosC2', '12px'), acquit));
  } catch (e) {
    fail(`C : l'acquittement écrit doit LEVER le refus — il a encore refusé : ${e instanceof Error ? e.message : String(e)}`);
  }
  const rapport2 = photoReportOf(res2);
  if (!rapport2) fail('C : aucun rapport de photos après l\'acquittement');
  const imprime = JSON.stringify(rapport2);
  if (!imprime.includes('acq-fixture-c') || !imprime.includes('H-C2-ORPHELINE')) {
    fail(`C : l'acquittement doit être IMPRIMÉ dans sa propre section, jamais fondu dans le vert (FR-003b) — got ${imprime.slice(0, 400)}`);
  }

  // Une entrée incomplète refuse AU CHARGEMENT (les sept champs, data-model §4).
  const s3 = scene();
  await s3.runScript(s3.emit(mk('fixture.photos-c3', 'PhotosC3', '8px')));
  let leveIncomplet: string | null = null;
  try {
    await s3.runScript(
      s3.emit(mk('fixture.photos-c3', 'PhotosC3', '12px'), [{ hostId: 'x', cheminPosition: '0', imageHash: 'h' } as Acquittement]),
    );
  } catch (e) {
    leveIncomplet = e instanceof Error ? e.message : String(e);
  }
  if (!leveIncomplet || !/acquittement/i.test(leveIncomplet)) {
    fail(`C : une entrée d'acquittement incomplète doit REFUSER au chargement (7 champs obligatoires) — got ${JSON.stringify(leveIncomplet)}`);
  }
  console.log('  ✔ C (sans accueil) : refus avant mutation ; acquittement complet → passe et s\'imprime ; entrée incomplète → refus au chargement');
}

// ===========================================================================
// D — DÉTERMINISME (SC-009) : deux exécutions sans geste, même verdict
// ===========================================================================
async function casD(premier: any) {
  const second = await (async () => {
    const s = scene();
    await s.runScript(s.emit(mk('fixture.photos-inst', 'PhotosInst', '8px')));
    const comp = marker(s.root, 'fixture.photos-inst');
    at(comp, '0').fills = paint('H-M-A');
    at(comp, '1').fills = paint('H-M-B');
    for (let i = 1; i <= 3; i++) {
      const inst = comp.createInstance();
      s.figma.currentPage.appendChild(inst);
      at(inst, '0').fills = paint(`H-${i}-A`);
      at(inst, '1').fills = paint(`H-${i}-B`);
    }
    return photoReportOf(await s.runScript(s.emit(mk('fixture.photos-inst', 'PhotosInst', '12px'))));
  })();

  // Les ids de nœud diffèrent d'une exécution à l'autre (compteur global) : on
  // compare le rapport avec les hostId NORMALISÉS à leur rang d'apparition.
  const normaliser = (r: any) => {
    const ids = new Map<string, string>();
    const n = (v: any): any => {
      if (Array.isArray(v)) return v.map(n);
      if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, n(x)]));
      if (typeof v === 'string' && /^\d+:\d+$/.test(v)) {
        if (!ids.has(v)) ids.set(v, `hote#${ids.size}`);
        return ids.get(v);
      }
      return v;
    };
    const copie = n(r);
    delete copie.executeLe;
    return JSON.stringify(copie);
  };
  const a = normaliser(JSON.parse(JSON.stringify(premier)));
  const b = normaliser(JSON.parse(JSON.stringify(second)));
  if (a !== b) fail(`D : deux exécutions sans geste rendent des verdicts différents (SC-009)\n    A: ${a.slice(0, 300)}\n    B: ${b.slice(0, 300)}`);
  console.log('  ✔ D (déterminisme) : deux exécutions sans geste rendent le même rapport');
}

// ---------------------------------------------------------------------------
const rapportCentral = await casCentral();
await casA();
casB();
await casC();
await casD(rapportCentral);

console.log(
  `${NOM} ok: une photo posée sur une INSTANCE DE PAGE survit à la reconstruction, appariée par (hôte, chemin de position) et jamais par nom ; ` +
    'une empreinte qui perd son accueil fait REFUSER avant la première démolition en nommant photo, hôte et rang ; ' +
    'une interversion fait échouer le contrôle en nommant les deux emplacements ; ' +
    'un acquittement écrit lève à la photo près et reste imprimé ; deux exécutions rendent le même verdict.',
);
