/** Browser proof for the Hero pilot at its reference and reduced widths. */
import { mkdirSync, readFileSync } from 'node:fs';
import { launchBrowser } from '../../extract/figma/visual-parity/render.js';
import { emitHtml } from '../../core/emit-html.js';
import { ContractSchema } from '../../packages/schema/src/contract-schema.js';

const contractNames = ['button', 'section-header', 'hero'];
const contracts = contractNames.map((name) =>
  ContractSchema.parse(JSON.parse(readFileSync(`contracts/${name}.contract.json`, 'utf8'))),
);
const byId = new Map(contracts.map((contract) => [contract.id, contract]));
const hero = byId.get('ds.hero');
if (!hero) throw new Error('Hero contract is missing');

const emitted = emitHtml(hero, { contracts: byId, icons: new Map(), tokenInventory: new Set() });
const tokens = readFileSync('src/styles/tokens.css', 'utf8');
const markup = emitted.html.replace(
  'src=""',
  'src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="',
);
const { browser } = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1728, height: 700 } });
const failures: string[] = [];
const evidenceRoot = '/tmp/hero-pilot-evidence/code-after';
mkdirSync(evidenceRoot, { recursive: true });

try {
  await page.setContent(`<!doctype html><style>${tokens}\n${emitted.css}\n
    html, body, .showcase, .showcase__item { margin: 0; width: 100%; }
    .showcase__label { display: none; }
    .hero__Background { background: linear-gradient(135deg, #8397ad, #10273d); }
  </style>${markup}`);
  for (const width of [1728, 1440]) {
    await page.setViewportSize({ width, height: 700 });
    const facts = await page.evaluate(() => {
      const root = document.querySelector<HTMLElement>('.hero')!;
      const colonneGauche = document.querySelector<HTMLElement>('.hero__colGauche')!;
      const subtitle = document.querySelector<HTMLElement>('.hero__sousTitre')!;
      const button = document.querySelector<HTMLElement>('.button')!;
      const label = document.querySelector<HTMLElement>('.button__label')!;
      const veil = document.querySelector<HTMLElement>('.hero__VoileNavigation')!;
      const rootRect = root.getBoundingClientRect();
      const colonneGaucheRect = colonneGauche.getBoundingClientRect();
      const subtitleRect = subtitle.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const labelRect = label.getBoundingClientRect();
      const veilRect = veil.getBoundingClientRect();
      const lineHeight = Number.parseFloat(getComputedStyle(label).lineHeight);
      return {
        rootWidth: rootRect.width,
        rootOverflow: root.scrollWidth - root.clientWidth,
        rootClip: getComputedStyle(root).overflow,
        colonneGaucheOverflow: colonneGauche.scrollWidth - colonneGauche.clientWidth,
        subtitleWidth: subtitleRect.width,
        buttonWidth: buttonRect.width,
        buttonRight: buttonRect.right,
        colonneGaucheRight: colonneGaucheRect.right,
        buttonLines: Math.round(labelRect.height / lineHeight),
        veil: { width: veilRect.width, height: veilRect.height, z: getComputedStyle(veil).zIndex },
      };
    });
    if (Math.abs(facts.rootWidth - width) > 0.5) failures.push(`${width}: Hero width is ${facts.rootWidth}`);
    if (facts.rootOverflow > 0.5 || facts.colonneGaucheOverflow > 0.5) failures.push(`${width}: overflow ${facts.rootOverflow}/${facts.colonneGaucheOverflow}`);
    if (facts.rootClip !== 'hidden') failures.push(`${width}: Hero root does not own clipping`);
    if (facts.buttonLines !== 1) failures.push(`${width}: Button label wraps to ${facts.buttonLines} lines`);
    if (facts.buttonRight > facts.colonneGaucheRight + 0.5) failures.push(`${width}: Button leaves the left column`);
    if (facts.veil.width !== width || facts.veil.height !== 640 || facts.veil.z !== '1') failures.push(`${width}: veil geometry/stack drifted`);
    await page.screenshot({ path: `${evidenceRoot}/hero-${width}.png`, fullPage: false });
    console.log(`${width}: ${JSON.stringify(facts)}`);
  }
} finally {
  await browser.close();
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('✔ Hero browser render: 1728/1440 are fluid, clipped correctly and keep a one-line CTA');
