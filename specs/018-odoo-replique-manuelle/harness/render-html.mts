/**
 * Côté « avant » de la comparaison d'image (US3) : rend chaque contrat par la
 * surface HTML EXISTANTE du dépôt (`emitHtml`), au clip épinglé.
 *
 * ── Ce qui est RÉUTILISÉ, et pourquoi jamais ré-implémenté ───────────────────
 * `launchBrowser()` et `embeddedFontFaces()` viennent de
 * `extract/figma/visual-parity/render.ts`, importés SANS le modifier. Ils sont
 * exportés avec cette intention écrite : « for reuse … never re-implemented ».
 *   · le lancement : `launchBrowser()` rend `{ browser, version, executablePath }`.
 *     Ces trois lignes avaient été recopiées ici, ce qui marchait mais PERDAIT la
 *     version — un harnais qui écrit des reçus sous proofs/ doit pouvoir dire
 *     quel Chromium a produit ses chiffres, comme le font visual-parity/run.ts
 *     et canvas-gate/run.ts ;
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
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Browser } from 'playwright-core';
import { embeddedFontFaces, launchBrowser } from '../../../extract/figma/visual-parity/render.js';
import { loadRepoData } from '../../../extract/fidelity-matrix/scripts/lib.js';
import { emitHtml } from '../../../core/index.js';
import {
  SUBJECTS,
  DEVICE_SCALE_FACTOR,
  FONT_SETTLE_MS,
  FRAME_PADDING_TOKEN,
  arg,
  runAsCli,
  viewportFor,
  type Subject,
} from './subjects.mts';

// ---------------------------------------------------------------------------
// Le contexte d'émission — contrats, jetons, icônes, en DONNÉES (jamais des
// chemins) : c'est le contrat du barrel `core/`. Le chargement est celui du
// dépôt, `loadRepoData()`, pas une seconde lecture maison.
//
// Ce qu'on gagne à ne PAS le refaire, et ce n'est pas cosmétique : la version
// maison épinglait les quatre fichiers de jetons en dur, donc restaurer le mode
// sombre ou ajouter une marque aurait laissé l'inventaire du harnais en arrière
// EN SILENCE — `loadRepoData` découvre `modes/brand.*.tokens.json` par motif et
// traite l'absence du fichier sombre explicitement. Elle validait aussi les
// contrats en `safeParse` puis SAUTAIT les invalides sans rien dire, ce qui
// ressortait bien plus tard en « Contrat absent : … » ; `loadRepoData` fait
// `.parse` et échoue par le nom du contrat fautif.
//
// Équivalence vérifiée par exécution avant la bascule, en ENSEMBLES et pas en
// comptes : inventaire 231 = 231 (0 en trop, 0 manquant), 34 contrats,
// 23 icônes — et les 3 PNG de sortie sont restés identiques octet pour octet.
// ---------------------------------------------------------------------------
export function buildEmitCtx() {
  const { inventory, icons, contracts, tokensCss } = loadRepoData();
  return { tokens: inventory, icons, contracts, tokensCss };
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

/** `tokensCss` est la feuille de jetons SANS préfixe (`src/styles/tokens.css`),
 *  incluse dans la page — condition documentée de cet émetteur : « the page must
 *  include the token stylesheet or the custom properties resolve to nothing ».
 *  Elle vient du même `loadRepoData()` que le reste du contexte. */
export function documentFor(subject: Subject, body: string, css: string, tokensCss: string): string {
  return [
    '<!doctype html>',
    '<html lang="fr"><head><meta charset="utf-8">',
    embeddedFontFaces(),
    `<style>${tokensCss}</style>`,
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
    // la sonde. Le plafond vient de `subjects.mts` — LE MÊME que le côté Odoo.
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
  const out = arg(args, '--out');
  if (!measure && !out) throw new Error('Usage : --out <dir>  |  --measure');
  if (out) mkdirSync(out, { recursive: true });

  const ctx = buildEmitCtx();
  const { browser, version } = await launchBrowser();
  console.log(`Chromium ${version}`);
  try {
    for (const s of SUBJECTS) {
      const { body, css } = fragmentFor(s, ctx);
      const { png, box } = await renderSubject(browser, s, documentFor(s, body, css, ctx.tokensCss));
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

runAsCli(import.meta.url, main);
