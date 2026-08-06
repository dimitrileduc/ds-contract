/**
 * Côté « avant » de la comparaison d'image (US3) : rend chaque contrat par la
 * surface HTML EXISTANTE du dépôt (`emitHtml`), au clip épinglé.
 *
 * ── Ce qui est RÉUTILISÉ, et pourquoi jamais ré-implémenté ───────────────────
 * `chromiumExecutable()` et `embeddedFontFaces()` viennent de
 * `extract/figma/visual-parity/render.ts`, importés SANS le modifier. Ils sont
 * exportés avec cette intention écrite : « for reuse … never re-implemented ».
 *   · la police : un second harnais qui refait son chargement retombe dans le
 *     bug daté du 2026-07-23 — Chromium substituait silencieusement une police
 *     système pendant que `document.fonts.check` répondait « disponible », et
 *     toutes les mesures comparaient alors code-en-repli contre référence-en-
 *     vraie-police ;
 *   · le binaire : le cache Playwright nomme ses répertoires par architecture
 *     (`chrome-mac-arm64` / `chrome-mac-x64` / `chrome-mac`). Une découverte
 *     maison qui n'essaie qu'un seul de ces noms ne trouve rien, EN SILENCE.
 *
 * Prior art : `extract/figma/aplat-parity/render.ts` (spec 006) est exactement
 * ce patron. Le harnais de 018 est le TROISIÈME du même, pas une invention.
 *
 * Usage :
 *   npx tsx specs/018-…/harness/render-html.mts --out <dir>
 *   npx tsx specs/018-…/harness/render-html.mts --measure     (boîtes réelles)
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser } from 'playwright-core';
import { chromiumExecutable, embeddedFontFaces } from '../../../extract/figma/visual-parity/render.js';
import { ContractSchema, tokenInventoryFromJson, emitHtml, type Contract } from '../../../core/index.js';
import { SUBJECTS, DEVICE_SCALE_FACTOR, FRAME_PADDING_TOKEN, viewportFor, type Subject } from './subjects.mts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..', '..');
const readJson = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));

// ---------------------------------------------------------------------------
// Le contexte d'émission — contrats, jetons, icônes, en DONNÉES (jamais des
// chemins) : c'est le contrat du barrel `core/`.
// ---------------------------------------------------------------------------
export function buildEmitCtx() {
  const contracts = new Map<string, Contract>();
  for (const f of readdirSync(path.join(REPO, 'contracts'))) {
    if (!f.endsWith('.contract.json')) continue;
    const parsed = ContractSchema.safeParse(readJson(path.join(REPO, 'contracts', f)));
    if (parsed.success) contracts.set(parsed.data.id, parsed.data);
  }
  const tokens = tokenInventoryFromJson([
    readJson(path.join(REPO, 'tokens', 'primitives.tokens.json')),
    readJson(path.join(REPO, 'tokens', 'semantic.tokens.json')),
    readJson(path.join(REPO, 'tokens', 'modes', 'semantic.light.tokens.json')),
    readJson(path.join(REPO, 'tokens', 'modes', 'brand.default.tokens.json')),
  ]);
  const icons = new Map(
    readdirSync(path.join(REPO, 'assets', 'icons'))
      .filter((f) => f.endsWith('.svg'))
      .map((f) => [f.replace(/\.svg$/, ''), readFileSync(path.join(REPO, 'assets', 'icons', f), 'utf8').trim()] as const),
  );
  return { tokens, icons, contracts };
}

/** Le fragment rendu pour un sujet : la vignette du showcase que `subjects.mts`
 *  NOMME, et que la page de mesure Odoo reproduit prop pour prop (invariant
 *  §3.2 : props identiques des deux côtés). Prendre « la première » a été la
 *  première version, et elle était fausse : la page Odoo de l'en-tête rendait
 *  `avecCta` pendant que le côté HTML rendait `default`. */
export function fragmentFor(subject: Subject, ctx: ReturnType<typeof buildEmitCtx>) {
  const contract = ctx.contracts.get(subject.contractId);
  if (!contract) throw new Error(`Contrat absent : ${subject.contractId}`);
  const { html, css } = emitHtml(contract, ctx);
  const esc = subject.showcaseLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `<div class="showcase__item">\\s*<p class="showcase__label">${esc}<\\/p>\\s*([\\s\\S]*?)\\n {2}<\\/div>`,
  );
  const m = html.match(re);
  if (!m) {
    const seen = [...html.matchAll(/showcase__label">([^<]*)</g)].map((x) => x[1]);
    throw new Error(
      `Vignette « ${subject.showcaseLabel} » introuvable pour ${subject.contractId}. Présentes : ${seen.join(' · ')}`,
    );
  }
  return { body: m[1].trim(), css };
}

/** La feuille de jetons SANS préfixe, incluse dans la page — condition
 *  documentée de cet émetteur : « the page must include the token stylesheet or
 *  the custom properties resolve to nothing ». */
const tokensCss = () => readFileSync(path.join(REPO, 'src', 'styles', 'tokens.css'), 'utf8');

export function documentFor(subject: Subject, body: string, css: string): string {
  return [
    '<!doctype html>',
    '<html lang="fr"><head><meta charset="utf-8">',
    embeddedFontFaces(),
    `<style>${tokensCss()}</style>`,
    // Le MÊME cadre que la page de mesure Odoo : fond opaque, marge identique,
    // animations neutralisées, composant à une origine fixe.
    `<style>
      html, body { margin: 0; padding: 0; background: var(--color-blanc); }
      *, *::before, *::after { animation: none !important; transition: none !important; }
      .pqr-mesure { position: absolute; top: 0; left: 0; padding: var(--space-${FRAME_PADDING_TOKEN}); background: var(--color-blanc); }
    </style>`,
    `<style>${css}</style>`,
    '</head><body>',
    `<div class="pqr-mesure">${body}</div>`,
    '</body></html>',
  ].join('\n');
}

export async function launchBrowser(): Promise<Browser> {
  return chromium.launch({ executablePath: chromiumExecutable(), headless: true });
}

/** Rend un sujet et renvoie le PNG au clip épinglé, plus la boîte réellement
 *  occupée par le composant (utile au mode --measure). */
export async function renderSubject(browser: Browser, subject: Subject, doc: string) {
  const context = await browser.newContext({
    viewport: viewportFor(subject),
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    colorScheme: 'light',
  });
  try {
    const page = await context.newPage();
    await page.setContent(doc, { waitUntil: 'load' });
    // Attente BORNÉE : un `document.fonts.ready` qui pend ne doit jamais figer
    // la sonde. Même plafond de 5 s que visual-parity/render.ts.
    await page.evaluate('Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5000))])');
    const box = await page.evaluate(() => {
      const el = document.querySelector('.pqr-mesure') as HTMLElement | null;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { width: Math.ceil(r.width), height: Math.ceil(r.height) };
    });
    const png = await page.screenshot({
      clip: { x: 0, y: 0, width: subject.clip.width, height: subject.clip.height },
    });
    return { png: Buffer.from(png), box };
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  const measure = args.includes('--measure');
  const outIdx = args.indexOf('--out');
  const out = outIdx >= 0 ? args[outIdx + 1] : null;
  if (!measure && !out) throw new Error('Usage : --out <dir>  |  --measure');
  if (out) mkdirSync(out, { recursive: true });

  const ctx = buildEmitCtx();
  const browser = await launchBrowser();
  try {
    for (const s of SUBJECTS) {
      const { body, css } = fragmentFor(s, ctx);
      const { png, box } = await renderSubject(browser, s, documentFor(s, body, css));
      if (measure) {
        const fits = box && box.width <= s.clip.width && box.height <= s.clip.height;
        console.log(
          `${s.key.padEnd(16)} boîte réelle ${String(box?.width).padStart(5)}×${String(box?.height).padEnd(5)}` +
            ` · clip épinglé ${String(s.clip.width).padStart(5)}×${String(s.clip.height).padEnd(5)}` +
            ` · ${fits ? 'TIENT' : '*** DÉBORDE — le clip couperait le composant ***'}`,
        );
      }
      if (out) {
        writeFileSync(path.join(out, `${s.key}.png`), png);
        if (!measure) console.log(`✔ ${s.key} → ${path.join(out, `${s.key}.png`)}`);
      }
    }
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
