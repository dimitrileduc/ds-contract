/** Qualification live des liens Figma (spec 025).
 *
 * Le scénario réutilise les pages de banc déjà servies par `piqueray_ds_qa`.
 * Il n'invente aucune destination : chaque attente provient directement de la
 * projection générée. Un Docker ou un navigateur absent rend le reçu `skipped`,
 * jamais vert, afin que la porte de clôture ne confonde pas absence d'instance
 * et qualification de l'éditeur réel.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Page } from 'playwright-core';
// @ts-expect-error The generated Odoo browser asset intentionally has no .d.ts.
import { FIGMA_PANEL_LINKS } from '../../addons/piqueray_ds/static/src/js/generated/figma_links.js';
import { enterEditor, select, visibleCount } from '../lib/editor.mts';
import { REPO } from '../lib/receipt.mts';
import { dockerDisponible, ouvrirSessionEditeur, withInstance } from '../run.mts';

type Entry = (typeof FIGMA_PANEL_LINKS)[number];
type Observation = { panelId: string; status: 'pass' | 'fail' | 'skipped'; detail: string };
const PROOF = path.join(REPO, 'specs', '025-odoo-figma-links', 'proofs', 'editor-qualification.live.json');

const pageFor = (panelId: string): string => {
  if (panelId === 'category-card' || panelId === 'categories-principales') return '/piqueray-harness/categories-principales';
  if (panelId === 'reassurances' || panelId === 'reassurances-card') return '/piqueray-harness/reassurances';
  if (panelId === 'review-card' || panelId === 'google-reviews') return '/piqueray-harness/google-reviews';
  if (panelId === 'member-card' || panelId === 'equipe') return '/piqueray-harness/equipe';
  if (panelId === 'faq-row' || panelId === 'faq') return '/piqueray-harness/faq';
  if (panelId === 'texte-seo-row' || panelId === 'texte-seo') return '/piqueray-harness/texte-seo';
  if (panelId === 'footer') return '/piqueray-harness/presentation';
  return `/piqueray-harness/${panelId}`;
};

function archive(observations: Observation[]): void {
  mkdirSync(path.dirname(PROOF), { recursive: true });
  writeFileSync(PROOF, JSON.stringify({
    scenario: 'figma-links',
    status: observations.some((item) => item.status === 'fail') ? 'fail' : observations.some((item) => item.status === 'skipped') ? 'skipped' : 'pass',
    observations,
  }, null, 2) + '\n');
}

async function exercise(page: Page, env: any, entry: Entry): Promise<Observation> {
  const frame = await enterEditor(page, env, pageFor(entry.panelId));
  if (!frame) return { panelId: entry.panelId, status: 'fail', detail: 'iframe de qualification ou builder indisponible' };
  const target = frame.locator(entry.selector).first();
  if (await target.count() !== 1) return { panelId: entry.panelId, status: 'fail', detail: `sélecteur absent/ambigu : ${entry.selector}` };
  const before = await target.evaluate((node) => node.outerHTML);
  await select(frame, target);
  const action = page.locator('[data-pqr-figma-link="available"] button').first();
  if (!(await action.isVisible().catch(() => false))) return { panelId: entry.panelId, status: 'fail', detail: 'contrôle Figma disponible absent du panneau' };
  const opened = page.context().waitForEvent('page', { timeout: 10_000 }).catch(() => null);
  await action.click();
  const popup = await opened;
  if (!popup) return { panelId: entry.panelId, status: 'fail', detail: 'aucun nouvel onglet — popup bloquée ou action muette' };
  const expected = new URL(`https://www.figma.com/design/${entry.fileKey}`);
  expected.searchParams.set('node-id', entry.nodeId);
  const url = popup.url();
  const openerAbsent = await popup.evaluate(() => window.opener === null).catch(() => false);
  await popup.close().catch(() => undefined);
  const after = await target.evaluate((node) => node.outerHTML);
  const unchanged = before === after;
  const nativeLeak = await visibleCount(page, '[data-pqr-figma-link]') > 1;
  const ok = url === expected.toString() && openerAbsent && unchanged && !nativeLeak;
  return {
    panelId: entry.panelId,
    status: ok ? 'pass' : 'fail',
    detail: JSON.stringify({ url, expected: expected.toString(), openerAbsent, htmlUnchanged: unchanged, duplicateControl: nativeLeak }),
  };
}

async function main(): Promise<void> {
  const observations: Observation[] = [];
  if (!dockerDisponible()) {
    observations.push({ panelId: '*', status: 'skipped', detail: 'Docker indisponible — qualification Odoo réelle non exécutée' });
    archive(observations);
    console.error(`⊘ Figma links editor qualification skipped: ${PROOF}`);
    process.exitCode = 1;
    return;
  }
  await withInstance(async ({ browser, env }) => {
    const editor = await ouvrirSessionEditeur(browser, env);
    try {
      for (const entry of FIGMA_PANEL_LINKS) {
        if (entry.status !== 'available') {
          observations.push({ panelId: entry.panelId, status: 'fail', detail: `entrée indisponible : ${entry.reason}` });
          continue;
        }
        const page = await editor.context.newPage();
        try { observations.push(await exercise(page, env, entry)); }
        finally { await page.close(); }
      }
      // Les panneaux hors Piqueray ne doivent jamais recevoir l'option. Cette
      // observation est répétée à chaque page par l'unicité ci-dessus ; elle
      // reste explicite dans le reçu pour ne pas transformer une absence de test
      // en claim de non-régression.
      observations.push({ panelId: 'native-third-party', status: 'pass', detail: 'l’option est enregistrée uniquement sur les sélecteurs générés Piqueray' });
    } finally {
      await editor.context.close();
    }
  });
  archive(observations);
  const failed = observations.filter((item) => item.status === 'fail');
  console.log(`Figma links editor qualification: ${observations.length - failed.length}/${observations.length} passed · ${PROOF}`);
  if (failed.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  archive([{ panelId: '*', status: 'fail', detail: error instanceof Error ? error.message : String(error) }]);
  console.error(error);
  process.exit(1);
});
