/**
 * Preuve FR-012 (spec 022, scénario d'acceptation US3) : les 8 sections de contenu
 * déjà en ligne restent INTACTES après la livraison du shell header.
 *
 * Contrôle DOM live sur chaque banc visuel de section : après que le header système
 * 022 est actif (il coiffe désormais toutes les pages), chaque section rend encore
 * son `data-ds-contract`, sa racine BEM et une part représentative — sans erreur
 * console, sans zone cassée. La CSS de section est d'ailleurs inchangée : le build
 * d'assets émet la fermeture des posables PUIS celle du shell (dédup), donc seuls
 * des blocs header/nav-item/logo s'ajoutent — les blocs de section restent à
 * l'octet (attesté par `odoo:assets --check` en T027). Reçu sous specs/022.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from '../../../../extract/figma/visual-parity/render.js';
import { REPO } from '../lib/receipt.mts';
import { baseUrl, readQaEnv } from '../run.mts';

const SNAPSHOT = 'odoo-019-foundation';
const OUT = path.join(REPO, 'specs', '022-odoo-nav-shell', 'proofs', 'sections-intact.json');

const SECTIONS = [
  { id: 'ds.google-reviews', url: '/piqueray-harness/google-reviews-visual', root: '.google-reviews', part: '[data-pqr-part="resume"]' },
  { id: 'ds.presentation', url: '/piqueray-harness/presentation-visual', root: '.presentation', part: '[data-pqr-part="presentation-text"]' },
  { id: 'ds.hero', url: '/piqueray-harness/hero-visual', root: '.hero', part: '[data-pqr-part="hero-title"]' },
  { id: 'ds.equipe', url: '/piqueray-harness/equipe-visual', root: '.equipe', part: '[data-pqr-part="member-grid"]' },
  { id: 'ds.faq', url: '/piqueray-harness/faq-visual', root: '.faq', part: '[data-pqr-part="accordion"]' },
  { id: 'ds.devis', url: '/piqueray-harness/devis-visual', root: '.devis', part: '[data-pqr-part="devis-title"]' },
  { id: 'ds.sav', url: '/piqueray-harness/sav-visual', root: '.sav', part: '[data-pqr-part="sav-title"]' },
  { id: 'ds.texte-seo', url: '/piqueray-harness/texte-seo-visual', root: '.texte-seo', part: '[data-pqr-part="texte-seo-text"]' },
];

interface Constat { quoi: string; statut: 'pass' | 'fail'; attendu: string; observe: string }

async function main() {
  const env = readQaEnv();
  const base = baseUrl(env);
  const constats: Constat[] = [];
  const note = (quoi: string, ok: boolean, attendu: string, observe: string) => {
    constats.push({ quoi, statut: ok ? 'pass' : 'fail', attendu, observe });
    console.log(`  ${ok ? '✔' : '✖'} ${quoi} — attendu « ${attendu} », observé « ${observe} »`);
  };

  const { browser } = await launchBrowser();
  try {
    for (const s of SECTIONS) {
      const ctx = await browser.newContext({ viewport: { width: 1856, height: 1200 } });
      const errors: string[] = [];
      ctx.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      const page = await ctx.newPage();
      const resp = await page.goto(`${base}${s.url}?pqr=intact`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.evaluate(`Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,2500))])`);
      const st = JSON.parse(await page.evaluate(`(function(o){
        var m=document.querySelector('.pqr-mesure');
        if(!m) return JSON.stringify({frame:false});
        var sec=m.querySelector('[data-ds-contract=\"'+o.id+'\"]');
        var root=m.querySelector(o.root);
        var part=m.querySelector(o.part);
        var visible = sec ? sec.getBoundingClientRect().height>0 : false;
        return JSON.stringify({frame:true, contract:!!sec, root:!!root, part:!!part, visible:visible});
      })(${JSON.stringify(s)})`)) as { frame: boolean; contract?: boolean; root?: boolean; part?: boolean; visible?: boolean };
      const ok = resp?.status() === 200 && st.frame && !!st.contract && !!st.root && !!st.part && !!st.visible && errors.length === 0;
      note(`FR-012 — ${s.id} intacte (contract + racine + part rendus, sans erreur)`,
        ok, 'HTTP 200, contract+racine+part visibles, 0 erreur console',
        `HTTP ${resp?.status()}, ${JSON.stringify(st)}, ${errors.length} erreur(s)`);
      await ctx.close();
    }
  } finally {
    await browser.close();
  }

  const fail = constats.some((c) => c.statut === 'fail');
  const status = fail ? 'fail' : 'pass';
  const receipt = {
    receiptId: `sections-intact-${SNAPSHOT}`, scenarioId: 'sections-intact', snapshotId: SNAPSHOT, status,
    fixture: 'eight-sections',
    observations: constats.map((c) => `[${c.statut}] ${c.quoi} — attendu « ${c.attendu} », observé « ${c.observe} »`),
    artifacts: [], limitCodes: [],
  };
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(receipt, null, 2) + '\n');
  console.log(`\n→ ${path.relative(REPO, OUT)} · reçu « ${status} » · ${constats.filter((c) => c.statut === 'pass').length}/${constats.length}`);
  process.exit(status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(`✖ ${e instanceof Error ? e.message : String(e)}`); process.exit(1); });
}
