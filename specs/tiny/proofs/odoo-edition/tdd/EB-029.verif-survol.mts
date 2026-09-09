import { launchBrowser } from '/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/comet-yogurt/extract/figma/visual-parity/render.js';
import { readQaEnv, ouvrirSessionEditeur, baseUrl } from '/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/comet-yogurt/integrations/odoo/qa/run.mts';
import { enterEditor } from '/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/comet-yogurt/integrations/odoo/qa/lib/editor.mts';
const env = readQaEnv(); const { browser } = await launchBrowser(); const { context } = await ouvrirSessionEditeur(browser, env);
const page = await context.newPage(); const frame = (await enterEditor(page, env, '/qa-edition/equipe-compose'))!;
const card = frame.locator('.s_pqr_equipe [data-pqr-member-card]').first();
await card.locator('.member-picture__normal').click({ position: { x: 8, y: 8 }, timeout: 5000 }).catch(()=>{});
await page.waitForTimeout(800);
const controls = await page.locator('.o_customize_tab .options-container:visible [data-pqr-control]').evaluateAll(ns => [...new Set(ns.map(n => n.getAttribute('data-pqr-control')))]);
console.log('contrôles du panneau membre:', JSON.stringify(controls));
const survolReplace = controls.includes('member-image-survol-url');
const survolAlt = controls.includes('member-image-survol-alt');
// poser l'alt de survol
let posé = false;
const champ = page.locator('.o_customize_tab .options-container:visible [data-pqr-control="member-image-survol-alt"] input').first();
if (await champ.count()) { await champ.fill('QA survol alt'); await champ.press('Tab'); await page.waitForTimeout(400); posé = (await card.locator('.member-picture__funIa').getAttribute('alt')) === 'QA survol alt'; }
console.log('RESULTAT panneau survol Remplacer=' + survolReplace + ' Alt=' + survolAlt + ' altPosé=' + posé);
await browser.close();
