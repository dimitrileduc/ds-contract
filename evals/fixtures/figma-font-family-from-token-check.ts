/**
 * LA FAMILLE DE POLICE PRESCRITE PAR LES TOKENS DOIT ARRIVER SUR LE NŒUD.
 *
 * Défaut constaté sur le canvas réel (016, régénération de ds.tab) : les nœuds
 * TEXT affichent Inter alors que le contrat prescrit `{font.family.montserrat}`
 * (= "Montserrat, sans-serif").
 *
 * La chaîne d'émission est correcte jusqu'au bout du texte :
 *   contracts/tab.contract.json:140  "font-family": "{font.family.montserrat}"
 *   core/emit-figma-script.ts:969    canal font-family → ctx.fontFamily
 *   core/emit-figma-script.ts:1892   ctx.fontFamily → NodeSpec.fontFamily
 *   figma-sync/34-tab.js:48/88       "fontFamily": "Montserrat" DANS LA SPEC
 *
 * Ce qui casse est le RUNTIME, en deux temps :
 *   1. core/emit-figma-script.ts:3378 crée TOUT nœud texte en Inter, en dur,
 *      avec le nom de style Inter (`FONT_STYLE_BY_WEIGHT`, l.374-384) ;
 *   2. core/emit-figma-script.ts:2946-2951 tente ensuite la vraie famille —
 *      mais demande `{ family:'Montserrat', style:'Semi Bold' }`, orthographe
 *      Inter. Sur la vraie police, le style s'écrit « SemiBold », sans espace :
 *        • specs/007-figma-extractable-source/data-model.md:134 (relevé vif) :
 *          `fontName {family, style}` = Montserrat × {Regular, Medium,
 *          SemiBold, Bold}
 *        • extract/figma/visual-parity/out/_cache/nodes-*.json (dumps REST du
 *          fichier réel) : "fontPostScriptName": "Montserrat-SemiBold" ×36
 *        • contracts/tab.contract.json (geometryJustification) : « Pinned GET
 *          records Montserrat-SemiBold 600 »
 *      `loadFontAsync` rejette la paire, le `catch` l'avale EN SILENCE, et
 *      l'Inter posé à l'étape 1 reste. Le commentaire du catch dit « family
 *      unavailable » alors que la famille EST disponible : c'est le STYLE qui
 *      ne l'est pas.
 *
 * Le filet de rattrapage (spec.textStyle → setTextStyleIdAsync, l.3381-3386)
 * ne rattrape rien : `deriveTextStyles()` (l.435-449) balaye les tokens
 * SÉMANTIQUES à la recherche de `font.<groupe>.size`, et tokens/semantic.tokens.json
 * n'a qu'un groupe `typography` — zéro correspondance → TEXT_STYLES = [].
 * (Assertion C ci-dessous, calculée en vif sur les vrais tokens du dépôt.)
 *
 * FIDÉLITÉ DU MOCK (règle du dépôt : un bug qui n'apparaît que sur le canvas
 * réel se répare en deux temps — l'émetteur ET le mock). Le mock actuel
 * (scripts/plugin-engine-mock-figma.mjs:337, note l.16) fait « les polices se
 * chargent toujours » : `loadFontAsync()` est un no-op qui n'échoue jamais.
 * C'est exactement pourquoi cette classe de défaut a franchi toutes les portes
 * headless. Cette fixture installe un INVENTAIRE de polices fidèle au fichier
 * réel — Inter à l'orthographe Figma (avec espaces), Montserrat à la sienne
 * (sans espaces) — et refuse les paires inconnues comme le fait l'API réelle.
 *
 * Lancement isolé :  npx tsx evals/fixtures/figma-font-family-from-token-check.ts
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitFigmaScript, createFigmaEngine } from '../../core/emit-figma-script.js';
// @ts-expect-error — le mock est un .mjs non typé (le harnais plugin-check l'importe pareil)
import { createFigmaMock } from '../../scripts/plugin-engine-mock-figma.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const readJson = (p: string) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));

const failures: string[] = [];
const note = (m: string) => failures.push(m);

// ---------------------------------------------------------------------------
// Inventaire de polices — MESURÉ sur le fichier Piqueray, pas inventé.
// Montserrat : specs/007-figma-extractable-source/data-model.md:134 +
// "fontPostScriptName": "Montserrat-{Regular,Medium,SemiBold,Bold,Light}" dans
// les dumps REST (extract/figma/visual-parity/out/_cache/nodes-*.json).
// Inter : orthographe Figma native (styles composés séparés par une espace).
// ---------------------------------------------------------------------------
const FONT_INVENTORY: Record<string, string[]> = {
  Inter: ['Thin', 'Extra Light', 'Light', 'Regular', 'Medium', 'Semi Bold', 'Bold', 'Extra Bold', 'Black'],
  Montserrat: ['Thin', 'ExtraLight', 'Light', 'Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold', 'Black'],
};

// ---------------------------------------------------------------------------
// Le sujet : un contrat qui prescrit Montserrat, deux poids — 600 (dont le nom
// de style diffère entre Inter et Montserrat) et 400 (dont il ne diffère pas).
// Même forme que ds.tab : font-family + font-weight portés par la racine.
// ---------------------------------------------------------------------------
const contract = ContractSchema.parse({
  id: 'fixture.fontfamily',
  name: 'FontFamilyFixture',
  version: '1.0.0',
  status: 'draft',
  description: 'Deux textes Montserrat, poids 600 et 400 — le canvas doit rendre Montserrat dans les deux cas.',
  semantics: { element: 'div' },
  props: [],
  states: [],
  events: [],
  anatomy: {
    root: {
      layout: { display: 'flex', direction: 'column' },
      tokens: {
        'font-family': '{font.family.montserrat}',
        'font-size': '{font.size.20}',
        'font-weight': '{font.weight.semibold}',
      },
      parts: {
        Semibold: { text: 'SIX CENTS' },
        Regular: { text: 'QUATRE CENTS', tokens: { 'font-weight': '{font.weight.regular}' } },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/FontFamilyFixture', export: 'FontFamilyFixture' },
  },
});

// Les valeurs de tokens utilisées ici sont celles de la fondation Piqueray :
// on les REVÉRIFIE contre tokens/primitives.tokens.json plutôt que de les
// supposer (si la fondation change, la fixture le dit au lieu de mentir).
const realPrimitives = readJson('tokens/primitives.tokens.json') as any;
const realFamily = realPrimitives?.font?.family?.montserrat?.$value;
const realSemibold = realPrimitives?.font?.weight?.semibold?.$value;
if (realFamily !== 'Montserrat, sans-serif') {
  note(`prémisse : tokens/primitives.tokens.json font.family.montserrat = ${JSON.stringify(realFamily)}, attendu "Montserrat, sans-serif"`);
}
if (realSemibold !== 600) {
  note(`prémisse : tokens/primitives.tokens.json font.weight.semibold = ${JSON.stringify(realSemibold)}, attendu 600`);
}

const tokenTree = {
  primitives: {
    font: {
      family: { montserrat: { $type: 'fontFamily', $value: 'Montserrat, sans-serif' } },
      size: { $type: 'dimension', '20': { $value: '20px' } },
      weight: { $type: 'fontWeight', regular: { $value: 400 }, semibold: { $value: 600 } },
    },
  },
  semantic: {},
  light: {},
  dark: {},
  brands: { default: {} },
};

const script = emitFigmaScript(contract, {
  tokens: tokenTree,
  icons: new Map(),
  contracts: new Map([[contract.id, contract]]),
});

// ---------------------------------------------------------------------------
// Le mock, rendu fidèle sur le seul point qui compte ici : une police se charge
// si et seulement si la paire (famille, style) EXISTE.
// ---------------------------------------------------------------------------
const { figma, root } = createFigmaMock();
const loaded = new Set<string>();
const key = (f: string, s: string) => `${f}|${s}`;
const refusals: string[] = [];

figma.loadFontAsync = async ({ family, style }: { family: string; style: string }) => {
  const styles = FONT_INVENTORY[family];
  if (!styles || !styles.includes(style)) {
    refusals.push(`${family} ${style}`);
    // Message calqué sur l'API réelle.
    throw new Error(`in loadFontAsync: Cannot load font ${family} ${style}`);
  }
  loaded.add(key(family, style));
};

const createTextRaw = figma.createText;
figma.createText = () => {
  const n: any = createTextRaw();
  let current = { family: 'Inter', style: 'Regular' };
  Object.defineProperty(n, 'fontName', {
    get: () => current,
    set: (v: { family: string; style: string }) => {
      // Figma refuse d'écrire sur un nœud dont la police n'est pas chargée.
      if (!loaded.has(key(v.family, v.style))) {
        throw new Error(`Cannot write to node with unloaded font "${v.family} ${v.style}"`);
      }
      current = v;
    },
    configurable: true,
    enumerable: true,
  });
  return n;
};

const scriptCtx = vm.createContext({ figma, console: { log() {}, warn() {}, error() {} } });
let report: any;
try {
  report = await vm.runInContext(`(async () => {\n${script}\n})()`, scriptCtx, { timeout: 120_000 });
} catch (e) {
  note(`le script généré a levé une erreur : ${(e as Error).message}`);
}

// ---------------------------------------------------------------------------
// A — chaque nœud texte porte la famille prescrite par le token.
// ---------------------------------------------------------------------------
const texts = root.findAll((n: any) => n.type === 'TEXT');
if (texts.length === 0) note('A : aucun nœud TEXT créé — le script n\'a rien produit');

const observed = texts.map((t: any) => ({
  name: t.name,
  characters: t.characters,
  family: t.fontName.family,
  style: t.fontName.style,
}));
const wrongFamily = observed.filter((t) => t.family !== 'Montserrat');
if (wrongFamily.length > 0) {
  note(
    `A : ${wrongFamily.length}/${observed.length} nœuds TEXT ne portent PAS la famille prescrite ` +
      `({font.family.montserrat} → "Montserrat"). Observé : ${JSON.stringify(observed)}. ` +
      `Refus de chargement : ${JSON.stringify(refusals)}`,
  );
}

// ---------------------------------------------------------------------------
// B — une dégradation se NOMME (règle d'honnêteté du dépôt). Si le runtime
// retombe sur Inter, le rapport du script doit le dire.
// ---------------------------------------------------------------------------
// Attention : un REFUS de chargement n'est pas en soi une dégradation — un
// runtime qui essaie deux orthographes en essuie un et n'a rien dégradé. Ce
// qui doit être nommé, c'est un nœud qui FINIT dans une autre famille que
// celle prescrite. (Chercher « font » dans le rapport ne vaudrait rien non
// plus : le nom du composant contient déjà ce mot.)
const reportText = JSON.stringify(report ?? null);
if (wrongFamily.length > 0 && !reportText.includes('Montserrat')) {
  note(
    `B : ${wrongFamily.length} nœud(s) retombé(s) sur une autre famille et le rapport du script ne nomme ` +
      `PAS la famille perdue — le catch de emit-figma-script.ts:2950 avale la dégradation. Rapport : ${reportText.slice(0, 300)}`,
  );
}

// ---------------------------------------------------------------------------
// C — le filet « style de texte nommé » est vide sur la vraie fondation.
// Calculé en vif : buildTokensScript sur les tokens du dépôt.
// ---------------------------------------------------------------------------
const brandNames = readdirSync(path.join(ROOT, 'tokens', 'modes'))
  .filter((f) => /^brand\.[a-z][a-z0-9-]*\.tokens\.json$/.test(f))
  .map((f) => f.replace(/^brand\.|\.tokens\.json$/g, ''));
const realEngine = createFigmaEngine({
  tokens: {
    primitives: readJson('tokens/primitives.tokens.json'),
    semantic: readJson('tokens/semantic.tokens.json'),
    light: readJson('tokens/modes/semantic.light.tokens.json'),
    dark: existsSync(path.join(ROOT, 'tokens', 'modes', 'semantic.dark.tokens.json'))
      ? readJson('tokens/modes/semantic.dark.tokens.json')
      : {},
    brands: Object.fromEntries(brandNames.map((n) => [n, readJson(`tokens/modes/brand.${n}.tokens.json`)])),
  },
  icons: new Map(),
});
const tokensScript = realEngine.buildTokensScript(null);
const styleLine = /const TEXT_STYLES = (\[.*?\]);/s.exec(tokensScript)?.[1] ?? '(introuvable)';
const styleCount = styleLine === '[]' ? 0 : (JSON.parse(styleLine) as unknown[]).length;

// CONSTAT NOMMÉ, non bloquant : ce défaut-ci n'est PAS celui que la fixture
// garde, et le correctif proposé pour A/B ne le répare pas. Il est imprimé à
// chaque exécution plutôt que tu, parce qu'il explique pourquoi rien ne
// rattrape le codage en dur : le filet est vide.
const constatC =
  styleCount === 0
    ? 'CONSTAT (hors périmètre de cette porte) : TEXT_STYLES = [] sur la vraie fondation — ' +
      'le filet spec.textStyle → setTextStyleIdAsync ne peut RIEN rattraper ' +
      '(tokens/semantic.tokens.json ne porte aucun `font.<groupe>.size` ; deriveTextStyles(), ' +
      'core/emit-figma-script.ts:435-449, ne trouve rien). Et quand il se remplira, ' +
      'core/emit-figma-script.ts:674/676 posera Inter en dur dans chaque style nommé.'
    : `CONSTAT : ${styleCount} style(s) de texte nommé(s) dérivé(s) de la fondation.`;

// ---------------------------------------------------------------------------
console.log(constatC);
if (failures.length > 0) {
  console.error('✘ figma-font-family-from-token — la famille prescrite par les tokens n\'arrive pas au nœud :');
  for (const f of failures) console.error(`  · ${f}`);
  process.exit(1);
}

console.log(
  `figma-font-family-from-token ok : ${observed.length}/${observed.length} nœuds TEXT en Montserrat ` +
    `(styles retenus : ${observed.map((t) => t.style).join(', ')}), aucune dégradation silencieuse.`,
);
