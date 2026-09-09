import { launchBrowser } from '/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/comet-yogurt/extract/figma/visual-parity/render.js';
import { readQaEnv, ouvrirSessionEditeur } from '/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/comet-yogurt/integrations/odoo/qa/run.mts';
import { enterEditor } from '/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/comet-yogurt/integrations/odoo/qa/lib/editor.mts';
const env = readQaEnv(); const { browser } = await launchBrowser(); const { context } = await ouvrirSessionEditeur(browser, env);
const page = await context.newPage(); const frame = (await enterEditor(page, env, '/qa-edition/form-compose'))!;
const labels = frame.locator('.s_pqr_formulaire label');
const n = await labels.count(); console.log('étiquettes:', n);
let oops = 0, edite = 0;
for (let i = 0; i < n; i++) {
  const l = labels.nth(i);
  await l.scrollIntoViewIfNeeded().catch(() => {});
  try { await l.click({ timeout: 4000 }); } catch {}
  await page.waitForTimeout(1500);
  const m = await page.locator('.modal.show:has-text("Oops")').count();
  const panneau = await page.locator('.o_customize_tab .options-container:visible').count();
  console.log(`label ${i}: Oops=${m} panneaux=${panneau}`);
  if (m) { oops++; await page.locator('.modal.show button:has-text("Close")').first().click({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(300); }
}
// et une frappe sur un texte gouverné doit toujours marcher après
const t = frame.locator('.s_pqr_formulaire [data-pqr-part="formulaire-eyebrow"]').first();
await t.click({ timeout: 4000 }).catch(() => {}); await page.keyboard.press('End'); await page.keyboard.type(' OK', { delay: 40 }); await page.waitForTimeout(300);
const txt = (await t.textContent() ?? '').trim();
console.log('RESULTAT oops=' + oops + '/' + n + ' · accroche éditable après=' + txt.endsWith('OK'));
await browser.close();
