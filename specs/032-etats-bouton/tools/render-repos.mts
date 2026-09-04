/**
 * Vague 032 — rendu du REPOS des 7 styles de `ds.button`.
 *
 * Sert une seule preuve : SC-006 / FR-010, « l'apparence au repos n'a pas
 * bougé ». On rend les 7 styles AVANT d'éditer le contrat (proofs/T0/repos/),
 * puis APRÈS (proofs/etape2/repos/), et on compare au pixel en mode strict.
 *
 * Pourquoi cet outil vit dans le dossier de la spec et non dans le dépôt :
 * il ne sert qu'à cette preuve, il n'est appelé par aucune porte, et la
 * Structure Decision du plan lui interdit d'entrer dans `core/` ou `scripts/`.
 *
 * Ce qu'il réutilise du dépôt, plutôt que de le réécrire :
 *   - `loadRepoData()`      — contrats, icônes, inventaire de jetons, tokens.css
 *   - `emitHtml()`          — l'émetteur HTML, tel quel, non modifié
 *   - `embeddedFontFaces()` — Montserrat encastré en base64. NE PAS retirer :
 *     sans lui Chromium substitue une police système EN SILENCE, et les deux
 *     côtés du diff ne comparent plus la même chose (bug de 2026-07-23,
 *     nommé dans l'en-tête de extract/figma/visual-parity/render.ts).
 *   - `launchBrowser()`     — le lancement de Chromium du dépôt (chemin épinglé
 *     du cache machine + version du navigateur, consignée au manifeste).
 *   - `ROOT_SELECTOR` et `withOverridesAsDefaults()` — la structure de la
 *     vitrine émise et l'astuce du playground. Ce sélecteur décrit le balisage
 *     de `core/emit-html.ts` : recopié, il divergerait en silence le jour où
 *     l'émetteur change (la leçon écrite sur `CLIP_MARGIN`, render.ts:450).
 *
 * Ce qu'il ne réutilise PAS : `renderVariant()` et son `RenderablePackage`,
 * qui portent tout l'appareil de campagne (dumps, couches captées, jetons
 * mintés, interactions). Ici la scène est fixe et volontairement pauvre : un
 * seul style, au repos, sur un fond opaque, à dimensions figées.
 *
 * Emploi :
 *   npx tsx specs/032-etats-bouton/tools/render-repos.mts --out <dir>
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { emitHtml } from '../../../core/index.js';
import { loadRepoData } from '../../../extract/fidelity-matrix/scripts/lib.js';
import {
  ROOT_SELECTOR,
  embeddedFontFaces,
  launchBrowser,
  withOverridesAsDefaults,
} from '../../../extract/figma/visual-parity/render.js';

/** Les 7 valeurs de l'énuméré `variant` du contrat, dans l'ordre du contrat. */
const VARIANTS = [
  'default',
  'orange',
  'blanc',
  'outlineBlanc',
  'link',
  'outlineNoir',
  'iconOnly',
] as const;

/**
 * Fonds de scène. Trois des sept styles sont dessinés POUR un fond sombre
 * (`blanc`, `outlineBlanc`) ou disparaissent sur blanc. Les poser tous sur
 * blanc rendrait deux PNG quasi vides — un diff sur du vide ne prouve rien.
 * Le fond ne fait pas partie de la mesure : il est identique avant et après.
 */
const GROUND: Record<string, string> = {
  default: '#FFFFFF',
  orange: '#FFFFFF',
  blanc: '#26282C',
  outlineBlanc: '#26282C',
  link: '#FFFFFF',
  outlineNoir: '#FFFFFF',
  iconOnly: '#FFFFFF',
};

/** Dimensions FIGÉES de la scène. La comparaison est stricte : aucun
 *  redimensionnement, aucun alignement. Deux PNG de tailles différentes sont
 *  un échec, pas une tolérance. */
const SCENE = { width: 640, height: 200 } as const;
const DEVICE_SCALE_FACTOR = 2;

function sceneCss(ground: string): string {
  return `
  html, body { margin: 0; padding: 0; }
  body { width: ${SCENE.width}px; height: ${SCENE.height}px; background: ${ground};
         display: grid; place-items: center;
         font-family: var(--font-family-sans, system-ui, sans-serif); }
  .showcase > .showcase__item:nth-child(n + 2) { display: none; }
  .showcase__label { display: none; }
  /* Rien ne doit bouger entre deux rendus : ni animation, ni transition,
     ni caret clignotant. Une seule image animée suffirait à faire échouer
     une comparaison stricte pour une raison qui n'est pas la nôtre. */
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    caret-color: transparent !important;
  }
`;
}

function parseOut(argv: string[]): string {
  const i = argv.indexOf('--out');
  if (i === -1 || !argv[i + 1]) {
    throw new Error('emploi : render-repos.mts --out <dir>');
  }
  return path.resolve(argv[i + 1]);
}

async function main(): Promise<void> {
  const outDir = parseOut(process.argv.slice(2));
  mkdirSync(outDir, { recursive: true });

  const repo = loadRepoData();
  const button = repo.contracts.get('ds.button');
  if (!button) throw new Error('contrat ds.button introuvable dans le dépôt');

  const ctx = { tokens: repo.inventory, icons: repo.icons, contracts: repo.contracts };
  const { browser, version, executablePath } = await launchBrowser();
  const receipts: Array<Record<string, unknown>> = [];

  try {
    for (const variant of VARIANTS) {
      const emitted = emitHtml(withOverridesAsDefaults(button, { variant }, {}), ctx);
      const doc = [
        '<!doctype html><html><head><meta charset="utf-8">',
        embeddedFontFaces(),
        `<style>${repo.tokensCss}</style>`,
        `<style>${emitted.css}</style>`,
        `<style>${sceneCss(GROUND[variant])}</style>`,
        '</head><body>',
        emitted.html,
        '</body></html>',
      ].join('\n');

      const page = await browser.newPage({
        viewport: { width: SCENE.width, height: SCENE.height },
        deviceScaleFactor: DEVICE_SCALE_FACTOR,
      });
      await page.setContent(doc, { waitUntil: 'domcontentloaded' });
      // Bornée : `document.fonts.ready` ne se résout pas toujours en headless
      // (constaté trois fois sur la campagne de 1 106 rendus). 5 s couvre
      // largement une police encastrée, et une promesse pendue n'immobilise
      // plus l'outil.
      await page.evaluate(
        'Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5000))])',
      );
      // La souris virtuelle GARDE sa position d'une page à l'autre : sans ce
      // recentrage, un survol résiduel s'appliquerait au style suivant — et
      // c'est précisément l'état que cette preuve ne doit PAS capturer.
      await page.mouse.move(0, 0);

      const root = page.locator(ROOT_SELECTOR);
      if ((await root.count()) === 0) {
        throw new Error(`${variant} : la vitrine émise ne porte pas ${ROOT_SELECTOR}`);
      }
      const box = await root.boundingBox();

      const file = path.join(outDir, `${variant}.png`);
      // Capture de la SCÈNE entière, pas de la boîte du bouton : si une règle
      // d'état faisait grossir la boîte, un cadrage sur la boîte suivrait le
      // défaut et le rendrait invisible. La scène fixe le montre.
      const buf = await page.screenshot({ type: 'png' });
      writeFileSync(file, buf);
      await page.close();

      receipts.push({
        variant,
        file: path.relative(process.cwd(), file),
        bytes: buf.length,
        ground: GROUND[variant],
        scene: { ...SCENE, deviceScaleFactor: DEVICE_SCALE_FACTOR },
        rootBox: box ? { w: box.width, h: box.height } : null,
      });
      const shown = box ? `${box.width.toFixed(2)}x${box.height.toFixed(2)}` : 'sans boîte';
      console.log(`  ✔ ${variant.padEnd(13)} ${String(buf.length).padStart(7)} o   boîte ${shown}`);
    }
  } finally {
    await browser.close();
  }

  const manifest = {
    spec: '032-etats-bouton',
    generatedAt: new Date().toISOString(),
    contract: { id: button.id, version: button.version },
    chromium: { executablePath, version },
    scene: { ...SCENE, deviceScaleFactor: DEVICE_SCALE_FACTOR },
    rootSelector: ROOT_SELECTOR,
    variants: receipts,
  };
  writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\n${receipts.length} PNG + manifest.json → ${path.relative(process.cwd(), outDir)}`);
  console.log(`contrat rendu : ${button.id} ${button.version}`);
}

await main();
