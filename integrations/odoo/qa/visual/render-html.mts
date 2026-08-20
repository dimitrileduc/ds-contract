/**
 * Côté RÉFÉRENCE de la comparaison d'image : rend un contrat par la surface HTML
 * existante du dépôt (`emitHtml`), au clip épinglé du sujet. Spec 019, T004.
 *
 * ── Ce qui est RÉUTILISÉ, et pourquoi jamais ré-implémenté ───────────────────
 * `launchBrowser()` et `embeddedFontFaces()` viennent de
 * `extract/figma/visual-parity/render.ts`, importés SANS le modifier :
 *   · `launchBrowser()` rend `{ browser, version, executablePath }` — un harnais
 *     qui écrit des reçus doit pouvoir dire quel Chromium a produit ses chiffres ;
 *   · la police : un second harnais qui refait son chargement retombe dans le bug
 *     daté du 2026-07-23 — Chromium substituait silencieusement une police système
 *     pendant que `document.fonts.check` répondait « disponible », et toutes les
 *     mesures comparaient alors code-en-repli contre référence-en-vraie-police ;
 *   · le binaire : le cache Playwright nomme ses répertoires par architecture
 *     (`chrome-mac-arm64` / `chrome-mac-x64` / `chrome-mac`). Une découverte maison
 *     qui n'essaie qu'un seul de ces noms ne trouve rien, EN SILENCE.
 *
 * ── Ce que 019 généralise par rapport à 018 ──────────────────────────────────
 * Les sujets ne sont plus compilés dans l'instrument : ils arrivent par
 * `--subjects <module>`. L'instrument ne connaît donc aucun composant, aucun clip
 * et aucun verdict — c'est exactement ce que T004 demande.
 *
 * Usage :
 *   npx tsx integrations/odoo/qa/visual/render-html.mts --subjects <mod> --out <dir>
 *   npx tsx integrations/odoo/qa/visual/render-html.mts --subjects <mod> --measure
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Browser } from 'playwright-core';
import { embeddedFontFaces, launchBrowser } from '../../../../extract/figma/visual-parity/render.js';
import { loadRepoData } from '../../../../extract/fidelity-matrix/scripts/lib.js';
import { emitHtml } from '../../../../core/index.js';
import {
  DEVICE_SCALE_FACTOR,
  FONT_SETTLE_MS,
  FRAME_PADDING_TOKEN,
  arg,
  loadSubjects,
  runAsCli,
  viewportFor,
  type Subject,
} from './subject.mts';

// ---------------------------------------------------------------------------
// Le contexte d'émission — contrats, jetons, icônes, en DONNÉES (jamais des
// chemins) : c'est le contrat du barrel `core/`. Le chargement est celui du
// dépôt, `loadRepoData()`, pas une seconde lecture maison : elle découvre les
// modes et marques par motif et échoue par le NOM du contrat fautif, là où une
// version maison épinglerait les fichiers en dur et sauterait les invalides en
// silence.
// ---------------------------------------------------------------------------
export function buildEmitCtx() {
  const { inventory, icons, contracts, tokensCss } = loadRepoData();
  return { tokens: inventory, icons, contracts, tokensCss };
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..', '..', '..');

/**
 * Injecte les SVG des parts `vectorAsset` gouvernées dans le fragment de
 * référence (spec 022). RAISON : `core/emit-html.ts` ne rend AUCUN vectorAsset —
 * il émet une `<span data-part="…"></span>` VIDE là où la CSS générée attend
 * `.piqueray-logo__Marque svg`. La surface RÉELLE (React, et le QWeb livré) inline
 * pourtant le SVG depuis `assets/vectors/`. Sans cette réparation d'INSTRUMENT, la
 * vitrine de référence du header rendrait un logo vide et SC-001 mesurerait ce
 * vide contre le vrai logo. On lit la MÊME source gouvernée (`assets/vectors/`),
 * on n'invente rien. Aucun effet sur les sections 019 : elles ne portent pas de
 * vectorAsset (leurs icônes sont des `icon` du registre, que emit-html inline).
 */
function collectVectorParts(anatomy: Record<string, unknown> | undefined): Array<{ key: string; asset: string }> {
  const out: Array<{ key: string; asset: string }> = [];
  const walk = (parts: Record<string, unknown> | undefined) => {
    for (const key of Object.keys(parts ?? {})) {
      const part = (parts as Record<string, { vectorAsset?: { asset?: string }; parts?: Record<string, unknown> }>)[key];
      const asset = part?.vectorAsset?.asset;
      if (typeof asset === 'string') out.push({ key, asset });
      if (part?.parts) walk(part.parts);
    }
  };
  walk(anatomy);
  return out;
}

export function injectGovernedVectors(body: string, ctx: ReturnType<typeof buildEmitCtx>): string {
  let out = body;
  const done = new Set<string>();
  for (const contract of ctx.contracts.values()) {
    for (const { key, asset } of collectVectorParts((contract as { anatomy?: Record<string, unknown> }).anatomy)) {
      if (done.has(key)) continue;
      const svgPath = path.join(REPO, 'assets', 'vectors', `${asset}.svg`);
      if (!existsSync(svgPath)) continue;
      const svg = readFileSync(svgPath, 'utf8').trim();
      const escKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // La span vectorAsset émise par emit-html est TOUJOURS vide : on n'injecte
      // que dans une paire ouvrante/`</span>` immédiatement adjacente.
      const re = new RegExp(`(<span\\b[^>]*\\bdata-part="${escKey}"[^>]*>)</span>`, 'g');
      out = out.replace(re, `$1${svg}</span>`);
      done.add(key);
    }
  }
  return out;
}

/** Le fragment rendu pour un sujet : la vignette du showcase que le module de
 *  sujets NOMME, et que la page de mesure Odoo doit reproduire prop pour prop.
 *  Prendre « la première » vignette est faux : le showcase varie une prop à la
 *  fois, donc la première est `default` et pas forcément ce que la page Odoo rend. */
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
  // Répare le trou vectorAsset d'emit-html AVANT la mesure (spec 022) : la
  // référence doit porter le MÊME logo gouverné que la surface livrée.
  return { body: injectGovernedVectors(m[1].trim(), ctx), css };
}

/** `tokensCss` est la feuille de jetons SANS préfixe (`src/styles/tokens.css`) :
 *  condition documentée de cet émetteur — « the page must include the token
 *  stylesheet or the custom properties resolve to nothing ». Côté Odoo, la même
 *  matière arrive préfixée `--pqr-` par la sortie générée (T012). */
export function documentFor(body: string, css: string, tokensCss: string, frameContentWidth?: number, surface: 'light' | 'dark' = 'light'): string {
  // Fond du cadre, DES DEUX CÔTÉS (spec 022). `dark` = `--pqr-color-noir-bleute`
  // côté Odoo ; ici, côté référence, la feuille de jetons est NON préfixée
  // (`src/styles/tokens.css`), donc `--color-noir-bleute`. La page de mesure Odoo
  // pose le même fond sombre sur son propre cadre (harness.xml).
  const surfaceBg = surface === 'dark' ? 'var(--color-noir-bleute)' : 'var(--color-blanc)';
  return [
    '<!doctype html>',
    '<html lang="fr"><head><meta charset="utf-8">',
    embeddedFontFaces(),
    `<style>${tokensCss}</style>`,
    // Le MÊME cadre que la page de mesure Odoo : fond opaque, marge identique,
    // animations neutralisées, composant à une origine fixe.
    `<style>
      html, body { margin: 0; padding: 0; background: ${surfaceBg}; }
      *, *::before, *::after { animation: none !important; transition: none !important; }
      .pqr-mesure { position: absolute; top: 0; left: 0; padding: var(--space-${FRAME_PADDING_TOKEN}); background: ${surfaceBg};${frameContentWidth ? ` width: ${frameContentWidth}px; box-sizing: content-box;` : ''} }
    </style>`,
    `<style>${css}</style>`,
    '</head><body>',
    `<div class="pqr-mesure">${body}</div>`,
    '</body></html>',
  ].join('\n');
}

/** Rend un document au clip épinglé du sujet et renvoie le PNG, plus la boîte
 *  réellement occupée (utile au mode `--measure`). */
export async function renderSubject(browser: Browser, subject: Subject, doc: string) {
  const context = await browser.newContext({
    viewport: viewportFor(subject),
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    colorScheme: 'light',
  });
  try {
    const page = await context.newPage();
    await page.setContent(doc, { waitUntil: 'load' });
    // Attente BORNÉE, plafond partagé avec le côté Odoo.
    await page.evaluate(
      `Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, ${FONT_SETTLE_MS}))])`,
    );
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
  const subjectsArg = arg(args, '--subjects');
  const out = arg(args, '--out');
  if (!subjectsArg) throw new Error('Usage : --subjects <module> [--out <dir>] [--measure]');
  if (!measure && !out) throw new Error('Usage : --subjects <module> --out <dir>  |  --measure');
  if (out) mkdirSync(out, { recursive: true });

  const subjects = await loadSubjects(subjectsArg);
  const ctx = buildEmitCtx();
  const { browser, version } = await launchBrowser();
  console.log(`Chromium ${version} · ${subjects.length} sujet(s) depuis ${subjectsArg}`);
  let deborde = 0;
  try {
    for (const s of subjects) {
      const { body, css } = fragmentFor(s, ctx);
      const { png, box } = await renderSubject(browser, s, documentFor(body, css, ctx.tokensCss, s.frameContentWidth, s.surface));
      if (measure) {
        const fits = box !== null && box.width <= s.clip.width && box.height <= s.clip.height;
        if (!fits) deborde++;
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
  // Un clip trop petit couperait le composant et la comparaison dirait
  // « identiques » sur deux moitiés. C'est un échec, pas une remarque.
  if (deborde > 0) {
    console.error(`\n${deborde} sujet(s) débordent de leur clip — corriger le clip AVANT toute mesure.`);
    process.exit(1);
  }
}

runAsCli(import.meta.url, main);
