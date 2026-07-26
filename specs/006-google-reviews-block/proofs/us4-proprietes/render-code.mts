/**
 * T071 [US4] — code-surface governance proof.
 *
 * Renders the GENERATED `ds.google-reviews` block from its contract with an
 * `avis` array entirely different from the master's neutral sample (one item
 * `photo:true` + photoUrl/photoAlt), proving the same block is a GOVERNED
 * CHOICE in code — not a second drawing. Reuses the shipping visual-parity
 * machinery unmodified: composeSubject() for tokens/icons/contracts,
 * emitHtml() for the surface, render.ts's embedded-Montserrat + playwright
 * pipeline (so the render never silently falls back to a system font).
 *
 * core/ is untouched: the only mutation is a structuredClone of the contract
 * whose repeat.sample (itemsProp "avis") is swapped for the manufactured
 * array — exactly the withOverridesAsDefaults trick, extended to the repeat
 * collection the scalar substitution path does not reach.
 *
 * Run (from the worktree, node_modules present):
 *   npx tsx specs/006-google-reviews-block/proofs/us4-proprietes/render-code.mts
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { emitHtml, type Contract } from '../../../../core/index.js';
import { composeSubject } from '../../../../extract/figma/visual-parity/compose.js';
import { PARITY_SUBJECTS } from '../../../../extract/figma/visual-parity/subjects.js';
import { embeddedFontFaces, launchBrowser } from '../../../../extract/figma/visual-parity/render.js';

// The manufactured content — five real reviews, NONE matching the master's
// neutral sample; item #3 is the governed avatar-PHOTO variant.
const AVIS = [
  { auteur: 'Marc Lefèvre', initiale: 'M', date: 'il y a 1 semaine', texte: "Intervention rapide et soignée sur ma porte de garage. Technicien ponctuel et pro.", tronque: false, initialeVisible: true, photo: false, photoUrl: '', photoAlt: '', verifie: true },
  { auteur: 'Sophie Nguyen', initiale: 'S', date: 'il y a 2 semaines', texte: 'Devis clair, pose impeccable. Je recommande sans hésiter cette entreprise.', tronque: false, initialeVisible: true, photo: false, photoUrl: '', photoAlt: '', verifie: true },
  { auteur: 'Karim Benali', initiale: 'K', date: 'il y a 3 semaines', texte: 'Excellent SAV, dépannage le jour même. Merci pour votre réactivité !', tronque: false, initialeVisible: false, photo: true, photoUrl: 'https://i.pravatar.cc/96?img=12', photoAlt: 'Karim Benali', verifie: true },
  { auteur: 'Claire Dubois', initiale: 'C', date: 'il y a 1 mois', texte: "Motorisation installée parfaitement, silencieuse. Personnel à l'écoute.", tronque: false, initialeVisible: true, photo: false, photoUrl: '', photoAlt: '', verifie: true },
  { auteur: 'Thomas Roy', initiale: 'T', date: 'il y a 2 mois', texte: 'Rapport qualité-prix imbattable. Travail propre du début à la fin.', tronque: false, initialeVisible: true, photo: false, photoUrl: '', photoAlt: '', verifie: true },
];

/** Swap the repeat.sample (itemsProp === "avis") for the manufactured array,
 *  and re-point the summary chrome — properties only, no structural edit. */
function withManufacturedAvis(contract: Contract): Contract {
  const clone = structuredClone(contract);
  for (const p of clone.props) {
    if (p.name === 'qualificatif') p.default = 'Exceptionnel';
    if (p.name === 'noteGlobale') p.default = '4.9';
    if (p.name === 'volume') p.default = '247 avis';
  }
  let swapped = false;
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) { for (const v of node) walk(v); return; }
    if (node && typeof node === 'object') {
      const o = node as Record<string, unknown>;
      const rep = o.repeat as { itemsProp?: string; sample?: unknown } | undefined;
      if (rep && rep.itemsProp === 'avis') { rep.sample = AVIS; swapped = true; }
      for (const v of Object.values(o)) walk(v);
    }
  };
  walk(clone.anatomy);
  if (!swapped) throw new Error('render-code: repeat.sample (itemsProp "avis") introuvable dans le contrat');
  return clone;
}

const FRAME_CSS = `
  body { margin: 0; padding: 32px; background: #ffffff; color: #1a1a1a;
         font-family: var(--font-family-sans, system-ui, sans-serif); }
  .showcase__label { display: none; }
  *, *::before, *::after { animation-play-state: paused !important; transition: none !important; }
`;

async function main(): Promise<void> {
  const subject = PARITY_SUBJECTS.find((s) => s.id === 'google-reviews');
  if (!subject) throw new Error('render-code: sujet google-reviews absent de PARITY_SUBJECTS');
  const pkg = composeSubject(subject);
  const contract = withManufacturedAvis(pkg.contract);
  const emitted = emitHtml(contract, { tokens: pkg.inventory, icons: pkg.icons, contracts: pkg.contracts });

  const doc = [
    '<!doctype html><html><head><meta charset="utf-8">',
    embeddedFontFaces(),
    `<style>${pkg.tokensCss}</style>`,
    `<style>${FRAME_CSS}</style>`,
    `<style>${emitted.css}</style>`,
    '</head><body>', emitted.html, '</body></html>',
  ].join('\n');

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ deviceScaleFactor: 2 });
    await page.setContent(doc, { waitUntil: 'load' });
    await page.evaluate('Promise.race([document.fonts.ready, new Promise((r)=>setTimeout(r,5000))])');
    const root = page.locator('.showcase > .showcase__item:first-child > :nth-child(2)');
    if ((await root.count()) === 0) throw new Error('render-code: root du composant introuvable');
    const box = await root.boundingBox();
    if (!box) throw new Error('render-code: pas de boîte de layout');
    const out = path.join(path.dirname(new URL(import.meta.url).pathname), 'code-avis-manufacture@2x.png');
    await page.screenshot({ path: out, clip: { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: box.height + 16 } });
    console.log(`✔ rendu code écrit: ${out} (${Math.round(box.width)}×${Math.round(box.height)} css px)`);
    console.log(`  5 avis manufacturés, dont 1 photo:true (Karim Benali) — gouverné par la prop \`avis\`, aucun dessin.`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
