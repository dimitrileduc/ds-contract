/**
 * ÉDITION GÉNÉRIQUE — un scénario, dix-neuf configs (tinyspec `odoo-edition-panneaux`).
 *
 * Il ne connaît aucun bloc. Il lit `integrations/odoo/config/*.authoring.json`
 * et, pour chaque bloc qui est un SNIPPET (racine `.s_pqr_*`), prouve à l'écran
 * ce que la config déclare :
 *   · `rootActions`      → l'attribut `data-pqr-root-actions` ET le chrome visible
 *   · part `not-editable`→ `isContentEditable === false`, frappe réelle sans effet
 *   · contrôle `plain-text` → frappe réelle, save RPC 2xx, relecture PUBLIQUE ;
 *                          un `<strong>` collé est aplati par la garde
 *   · contrôle `rich-text`  → un `<strong>` collé SURVIT au save ; une marque
 *                          hors `allowedMarks` est aplatie
 *   · `ordered-repeat`   → ajouter, supprimer, monter, vider puis ré-ajouter,
 *                          annuler ; save ; recompte public
 *   · dupliquer le bloc puis éditer la copie sans toucher l'original
 *   · rouvrir l'éditeur, ré-éditer, re-sauver (le second save)
 * Ce qu'il ne sait pas prouver sort en `skipped` NOMMÉ (`enum`, `native-menu`,
 * `computed-display`, média, traduction) — jamais en vert.
 *
 * Les shells (header, footer, menu-mobile, sous-menu) ne sont pas des snippets :
 * ils sont sautés ici par nom, et couverts par leurs scénarios dédiés.
 *
 * Chaque bloc a SA page (`/qa-edition/<slug>`, créée par l'ORM sur la base
 * jetable) : rien à remettre en place, l'instance est détruite au cycle suivant.
 * **Jamais sur une instance où quelqu'un édite en même temps** : ses saves créent
 * des copies de page pendant que le script les recrée (404, entrée aléatoire —
 * mesuré le 2026-09-09). Une instance à soi, `COMPOSE_PROJECT_NAME` + port propres.
 * Le verdict d'un texte se lit en `textContent` (jamais `innerText`, docs/16).
 *
 * Usage :
 *   npx tsx integrations/odoo/qa/scenarios/edition-generique.spec.mts [--only <slug>]
 *   PQR_QA_REUSE=1 …  (instance déjà levée, cycle rouge→vert ; reçu marqué)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Frame, Locator, Page } from 'playwright-core';
import { enterEditor, insertSnippet } from '../lib/editor.mts';
import { Recueil, REPO } from '../lib/receipt.mts';
import {
  NAV_TIMEOUT_MS, attendreOdoo, baseUrl, compose, dockerDisponible, odooShell, ouvrirSessionEditeur, ouvrirSessionPublique,
  withInstance, withInstanceExistante, type Instance, type QaEnv,
} from '../run.mts';

export const SCENARIO_ID = 'edition-generique';
export const SNAPSHOT_ID = 'odoo-019-foundation';
const CONFIG_DIR = path.join(REPO, 'integrations', 'odoo', 'config');
const PROOFS_DIR = path.join(REPO, 'specs', 'tiny', 'proofs', 'odoo-edition');
const SNIPPETS_XML = path.join(REPO, 'integrations', 'odoo', 'addons', 'piqueray_ds', 'views', 'snippets.xml');

// ---------------------------------------------------------------------------
// La config, telle qu'écrite
// ---------------------------------------------------------------------------

interface Controle { decisionId: string; verdict: string; mechanism: string; targetSelector?: string; label?: string }
interface Part { decisionId: string; verdict: string; contentKind: string; selector: string; allowedMarks: string[] }
interface Config {
  slug: string; configId: string; rootContract: { id: string; version: string };
  rootActions: { action: string; verdict: 'allowed' | 'forbidden' }[];
  controls: Controle[]; parts: Part[];
}

function lireConfigs(only?: string): Config[] {
  return readdirSync(CONFIG_DIR).filter((f) => f.endsWith('.authoring.json')).sort()
    .map((f) => ({ slug: f.replace('.authoring.json', ''), ...JSON.parse(readFileSync(path.join(CONFIG_DIR, f), 'utf8')) }))
    .filter((c) => !only || c.slug === only);
}

/** Racine du bloc = premier jeton du sélecteur de sa première part. */
const racineDe = (c: Config) => (c.parts[0]?.selector ?? '').split(/\s+/)[0];
/** Le snippet peut être la SECTION qui enveloppe la racine (`s_pqr_google_reviews_section`). */
const libelleDe = (m: Map<string, string>, racine: string) => m.get(racine) ?? m.get(`${racine}_section`);

/** Libellé du snippet dans le catalogue, lu dans `snippets.xml` — jamais recopié. */
function libellesSnippets(): Map<string, string> {
  const xml = readFileSync(SNIPPETS_XML, 'utf8');
  const map = new Map<string, string>();
  for (const m of xml.matchAll(/t-snippet="piqueray_ds\.(s_pqr_[a-z_]+)"[^>]*string="([^"]+)"/g)) map.set(`.${m[1]}`, m[2]);
  return map;
}

// ---------------------------------------------------------------------------
// Gestes
// ---------------------------------------------------------------------------

const BOUTONS = {
  move: '.o_overlay_options .o_move_handle, .o_move_handle',
  duplicate: '.o_overlay_options .o_snippet_clone, .options-container button.oe_snippet_clone',
  remove: '.o_overlay_options .oe_snippet_remove, .options-container button.oe_snippet_remove',
  'save-as-custom': '.oe_snippet_save',
  resize: '.oe_overlay.oe_active .o_handle:not(.readonly):not(.d-none)',
  background: '.options-container:visible [data-label="Background"], .options-container:visible we-title:has-text("Background"), .options-container:visible [data-container-title="Background"]',
} as const;

async function premierVisible(scope: Page | Locator, selector: string): Promise<Locator | null> {
  const c = scope.locator(selector);
  for (let i = 0; i < await c.count(); i += 1) if (await c.nth(i).isVisible().catch(() => false)) return c.nth(i);
  return null;
}

const panneauVisible = (page: Page, control: string) =>
  page.locator('.options-container:visible').filter({ has: page.locator(`[data-pqr-control${control}]`) }).first();

async function saver(page: Page): Promise<number | null> {
  const save = page.locator('.o-snippets-top-actions button[data-action="save"]').first();
  if (!(await save.isVisible().catch(() => false))) return null;
  const rep = page.waitForResponse((r) => r.url().includes('/web/dataset/call_kw/ir.ui.view/save'), { timeout: 30_000 }).catch(() => null);
  await save.click({ timeout: 5000 });
  const r = await rep;
  await page.waitForTimeout(1000);
  return r ? r.status() : -1;
}

/** Collage riche par la VRAIE surface contenteditable (déclenche l'historique Odoo). */
async function collerHtml(cible: Locator, html: string): Promise<boolean> {
  return cible.evaluate((el, h) => {
    const n = el as HTMLElement; n.focus();
    const range = document.createRange(); range.selectNodeContents(n); range.collapse(false);
    const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(range);
    return document.execCommand('insertHTML', false, h);
  }, html);
}

async function lirePublic(page: Page, url: string, selecteurs: string[]) {
  await page.goto(`${url}?qa=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
  return page.evaluate((sels: string[]) => sels.map((s) => {
    const el = document.querySelector(s);
    return { s, present: !!el, text: el?.textContent?.replace(/\s+/g, ' ').trim() ?? '', html: el?.innerHTML ?? '' };
  }), selecteurs);
}

const marqueur = (id: string) => ` QA-${id.replace(/[^a-z0-9]/gi, '').slice(-8)}`;

// ---------------------------------------------------------------------------
// Un bloc
// ---------------------------------------------------------------------------

async function prouverBloc(inst: Instance, cfg: Config, libelle: string, pagePath: string, reutilisee: boolean): Promise<Recueil> {
  const { browser, env } = inst;
  const R = new Recueil(`${SCENARIO_ID}-${cfg.slug}`, SNAPSHOT_ID, `config/${cfg.slug}.authoring.json`);
  if (reutilisee) R.limite('ODOO-LIMIT-INSTANCE-REUTILISEE');
  const racine = racineDe(cfg);
  const url = `${baseUrl(env)}${pagePath}`;
  const plainCtl = cfg.controls.filter((c) => c.mechanism === 'plain-text' && c.targetSelector && c.verdict === 'controlled');
  const richCtl = cfg.controls.filter((c) => c.mechanism === 'rich-text' && c.targetSelector && c.verdict === 'controlled');
  const repeatCtl = cfg.controls.filter((c) => c.mechanism === 'ordered-repeat' && c.targetSelector);
  const nonEditables = cfg.parts.filter((p) => p.verdict === 'not-editable');
  const allowedActions = new Set(cfg.rootActions.filter((a) => a.verdict === 'allowed').map((a) => a.action));
  const marksDe = (sel: string) => cfg.parts.find((p) => p.selector === sel)?.allowedMarks ?? [];
  const attendus = new Map<string, string>(); // selector → texte attendu en public
  let presentsVerrous: { s: string; feuille: boolean }[] = [];

  // ---- 1. Éditeur, insertion ------------------------------------------------
  const ed = await ouvrirSessionEditeur(browser, env);
  let page = await ed.context.newPage();
  let frame = await enterEditor(page, env, pagePath);
  if (!frame) { await page.close().catch(() => null); page = await ed.context.newPage(); frame = await enterEditor(page, env, pagePath); if (frame) R.limite('ODOO-NOTE-EDITOR-ENTRY-SECOND-TRY'); }
  if (!frame) {
    R.saute('entrée dans l\'éditeur', `éditeur non prêt sur ${pagePath}`, 'ODOO-LIMIT-EDITOR-ENTRY');
    await ed.context.close();
    return R;
  }
  try {
    const avantInsertion = await frame.locator(racine).count();
    R.constateSi('page de test — vide avant insertion', avantInsertion === 0, '0 racine', `${avantInsertion} racine(s) déjà là (page ou footer)`);
    // Le clic sur une vignette du catalogue insère APRÈS LA SÉLECTION COURANTE ; sans
    // sélection, Odoo pose le bloc dans la dernière structure éditable — le PIED DE
    // PAGE, qui est global : le bloc sauvé y réapparaissait sur toutes les pages
    // (3 formulaires « fantômes » le 2026-09-09).
    // Règle d'Odoo 19 (html_builder/sidebar/block_tab.js) : la vignette du catalogue pose
    // le bloc dans la zone de dépôt LA PLUS PROCHE DU CENTRE DE L'ÉCRAN, sinon la dernière
    // (le pied de page). On centre donc l'ancre à l'écran avant d'ouvrir le catalogue.
    await frame.locator('#wrap .qa-ancre').first().evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior }));
    await page.waitForTimeout(300);
    await insertSnippet(page, { search: libelle.replace('Piqueray · ', ''), label: libelle, viaDom: true });
    let roots = frame.locator(`#wrap ${racine}`);
    const horsPage = (await frame.locator(racine).count()) - (await roots.count());
    if (horsPage > 0) {
      // EB-032 : la vignette a posé le bloc HORS de la page (dans le champ copyright du
      // pied de page, zone de dépôt valable pour Odoo). On le ramène dans #wrap pour
      // tester l'ÉDITION — le constat, lui, reste rouge : c'est un piège réel du rédacteur.
      await frame.evaluate((sel) => { const w = document.querySelector('#wrap'); for (const b of document.querySelectorAll(sel)) if (w && !w.contains(b)) w.append(b); }, racine);
      await page.waitForTimeout(400);
      roots = frame.locator(`#wrap ${racine}`);
    }
    R.constateSi('insertion — la vignette du catalogue pose le bloc dans la page, pas dans le pied de page', horsPage === 0, '0 racine hors #wrap', horsPage ? `${horsPage} racine(s) posée(s) hors #wrap (pied de page) — ramenée(s) dans la page par le test` : '0');
    R.constateSi('catalogue — le bloc s\'insère', await roots.count() === 1, '1 racine', `${await roots.count()} racine(s) ${racine}`);
    if (await roots.count() === 0) return R;
    const root = roots.first();
    await selectionner(frame, root);
    // Odoo sélectionne le nœud le PLUS PROFOND sous le clic : si (8,8) tombe sur un
    // enfant, le panneau n'est pas celui de la racine. Second essai en haut à droite.
    if ((await page.locator('.options-container:visible [data-pqr-control]').count()) === 0) {
      const box = await root.boundingBox();
      if (box) { await root.click({ position: { x: Math.max(4, box.width - 6), y: 4 }, timeout: 4000, force: true }).catch(() => null); await page.waitForTimeout(500); }
    }

    // ---- 2. Actions racine ----------------------------------------------------
    // L'overlay (poignées move/duplicate/remove) se pose APRÈS le panneau : lu trop
    // tôt, `move` paraît absent une fois sur deux (EB-005, intermittent). On attend
    // jusqu'à 3 s qu'une poignée quelconque soit visible avant de conclure.
    for (let i = 0; i < 12 && !(await premierVisible(page, `${BOUTONS.move}, ${BOUTONS.duplicate}, ${BOUTONS.remove}`)); i += 1) await page.waitForTimeout(250);
    const declarees = ((await root.getAttribute('data-pqr-root-actions')) ?? '').split(/\s+/).filter(Boolean).sort();
    const attenduesActions = [...allowedActions].sort();
    R.constateSi('racine — data-pqr-root-actions = rootActions allowed', JSON.stringify(declarees) === JSON.stringify(attenduesActions), attenduesActions.join(', ') || '(aucune)', declarees.join(', ') || '(attribut absent)');
    // Odoo n'offre la poignée `move` que si le bloc a un voisin dans son conteneur :
    // sur la page de test, le bloc est SEUL — `move` absent n'est donc pas un rouge
    // (EB-005 : vue rouge/verte selon le nombre de blocs, jamais selon le code).
    const seul = (await frame.locator('#wrap > section, #wrap > [data-snippet], #wrap .oe_structure > section').count()) < 2;
    for (const a of cfg.rootActions) {
      if (a.action === 'move' && a.verdict === 'allowed' && seul) { R.saute('racine — move offerte', 'bloc seul sur la page : Odoo ne propose la poignée de déplacement qu\'avec un voisin', 'ODOO-LIMIT-MOVE-BLOC-SEUL'); continue; }
      const sel = BOUTONS[a.action as keyof typeof BOUTONS];
      if (!sel) { R.saute(`racine — action ${a.action}`, 'aucun sélecteur de chrome connu pour cette action'); continue; }
      const b = await premierVisible(page, sel);
      const offerte = b !== null && !(await b.isDisabled().catch(() => false));
      R.constateSi(`racine — ${a.action} ${a.verdict === 'allowed' ? 'offerte' : 'absente'}`, a.verdict === 'allowed' ? offerte : !offerte, a.verdict, offerte ? 'offerte' : 'absente/désactivée');
    }
    const inventaire = await page.locator('.options-container:visible [data-pqr-control]').evaluateAll((ns) => [...new Set(ns.map((n) => n.getAttribute('data-pqr-control')))].sort());
    R.constateSi('panneau — au moins un contrôle Piqueray quand la config en déclare', cfg.controls.some((c) => c.verdict === 'controlled') ? inventaire.length > 0 : true, cfg.controls.some((c) => c.verdict === 'controlled') ? '≥ 1' : '(rien attendu)', inventaire.join(', ') || '(vide)');

    // ---- 3. Parts not-editable -----------------------------------------------
    const releve = await frame.evaluate((sels: string[]) => sels.map((s) => {
      const el = document.querySelector(s) as HTMLElement | null;
      return { s, present: !!el, ce: el?.isContentEditable ?? null, feuille: !!el && el.children.length === 0 && (el.textContent ?? '').trim().length > 0 };
    }), nonEditables.map((p) => p.selector));
    const presents = releve.filter((r) => r.present);
    presentsVerrous = presents.map((r) => ({ s: r.s, feuille: r.feuille }));
    const ouverts = presents.filter((r) => r.ce === true);
    // Un sélecteur de config qui ne résout rien rend le contrôle VIDE : on le dit.
    const ctlSels = [...plainCtl, ...richCtl, ...repeatCtl].map((c) => c.targetSelector!);
    const ctlPresents = await frame.evaluate((sels: string[]) => sels.filter((s) => !!document.querySelector(s)).length, ctlSels);
    R.constateSi(`config — sélecteurs résolus dans le DOM (parts ${presents.length}/${nonEditables.length}, contrôles ${ctlPresents}/${ctlSels.length})`,
      (nonEditables.length === 0 || presents.length / nonEditables.length >= 0.8) && (ctlSels.length === 0 || ctlPresents === ctlSels.length),
      '≥ 80 % des parts, 100 % des contrôles', `parts ${presents.length}/${nonEditables.length} · contrôles ${ctlPresents}/${ctlSels.length}${ctlPresents < ctlSels.length ? ' · absents : ' + (await frame.evaluate((sels: string[]) => sels.filter((s) => !document.querySelector(s)), ctlSels)).join(' | ') : ''}`);
    R.constateSi(`not-editable — ${presents.length}/${nonEditables.length} parts présentes, aucune contenteditable`, ouverts.length === 0, '0 part not-editable ouverte', ouverts.length ? ouverts.map((o) => o.s).join(' | ') : `0 ouverte (${nonEditables.length - presents.length} absente(s) du DOM inséré)`);
    // ---- 3bis. Collections d'abord : les textes s'éditent ensuite sur les éléments FINAUX ----
    for (const c of repeatCtl) {
      try { await prouverCollection(R, page, frame, root, c, attendus); }
      catch (e) { R.constateSi(`collection — ${c.decisionId} : gestes sans exception`, false, 'aucune exception', (e instanceof Error ? e.message : String(e)).split('\n')[0].slice(0, 200)); }
    }

    // ---- 4. plain-text : frappe + garde -------------------------------------
    await selectionner(frame, root);
    for (const c of plainCtl) {
      const cible = frame.locator(c.targetSelector!).first();
      if (await cible.count() === 0) { R.saute(`plain-text ${c.decisionId}`, `cible absente du DOM : ${c.targetSelector}`); continue; }
      const avant = ((await cible.textContent()) ?? '').trim();
      const ce = await cible.evaluate((el) => (el as HTMLElement).isContentEditable);
      let apres: string | null = null;
      const tag = await cible.evaluate((el) => el.tagName);
      if (tag === 'IMG' || tag === 'VIDEO' || tag === 'PICTURE' || /alt$/i.test(c.decisionId)) {
        // Un alt ne se tape pas dans l'image : il se pose au panneau de l'élément qui la porte.
        const alt = await poserAltAuPanneau(page, frame, cible, root, `QA-ALT-${c.decisionId.slice(-6)}`);
        R.constateSi(`plain-text (alt) — ${c.decisionId} se pose au panneau`, alt.ok, 'champ alt au panneau → attribut alt posé', alt.detail);
        if (alt.ok) attendus.set(`${c.targetSelector}|alt`, `QA-ALT-${c.decisionId.slice(-6)}`);
        continue;
      }
      if (!(await cible.isVisible().catch(() => false))) {
        // Masquée par la composition (variante d'en-tête, message de succès `hidden`) :
        // pas un rouge du bloc, une limite nommée — éditable seulement si la variante l'affiche.
        R.saute(`plain-text — ${c.decisionId} accepte la frappe`, `ce=${ce} · cible MASQUÉE dans l'éditeur (hidden/display:none) — inéditable tant que la variante ne l'affiche pas`, 'ODOO-LIMIT-PART-MASQUEE');
        continue;
      }
      const f = ce ? await frapper(page, frame, cible, marqueur(c.decisionId)) : { apres: null, caretAssiste: false, detail: 'contenteditable=false' };
      apres = f.apres;
      const ok = ce && apres !== null && apres.includes(marqueur(c.decisionId).trim());
      R.constateSi(`plain-text — ${c.decisionId} accepte la frappe`, ok, 'contenteditable + marqueur présent', `ce=${ce}${f.detail ? ' · ' + f.detail : ''} · ${apres === null ? 'aucune frappe' : JSON.stringify(apres.slice(-40))}`);
      if (ok) attendus.set(c.targetSelector!, marqueur(c.decisionId).trim());
    }
    // La garde : un <strong> collé dans un plain-text doit être aplati au save.
    const gardeCible = plainCtl.find((c) => attendus.has(c.targetSelector!));
    if (gardeCible) await collerHtml(frame.locator(gardeCible.targetSelector!).first(), '<strong>QA-PLAIN-GRAS</strong>');

    // ---- 5. rich-text : gras qui survit, marque hors liste aplatie ----------
    for (const c of richCtl) {
      const cible = frame.locator(c.targetSelector!).first();
      if (await cible.count() === 0) { R.saute(`rich-text ${c.decisionId}`, `cible absente du DOM : ${c.targetSelector}`); continue; }
      const ce = await cible.evaluate((el) => (el as HTMLElement).isContentEditable);
      const colle = ce && await collerHtml(cible, ` <strong>QA-GRAS</strong><u>QA-SOUS</u>`);
      R.constateSi(`rich-text — ${c.decisionId} accepte un collage riche`, colle === true, 'contenteditable + insertHTML accepté', `ce=${ce} · insertHTML=${colle}`);
      if (colle) attendus.set(c.targetSelector!, 'QA-GRAS');
    }

    // ---- 7. Save 1 --------------------------------------------------------------
    const s1 = await saver(page);
    R.constateSi('save 1 — RPC ir.ui.view/save 2xx', s1 !== null && s1 >= 200 && s1 < 300, 'HTTP 2xx', s1 === null ? 'bouton Save introuvable' : `HTTP ${s1}`);
  } finally { await ed.context.close(); }

  // ---- 8. Relecture publique ----------------------------------------------------
  const pub = await ouvrirSessionPublique(browser);
  try {
    const p = await pub.context.newPage();
    const lu = await lirePublic(p, url, [...attendus.keys()].filter((k) => !k.endsWith('|alt')));
    for (const [sel, att] of attendus) {
      const r = lu.find((x) => x.s === sel)!;
      if (sel.endsWith('|alt')) {
        const cible = p.locator(sel.slice(0, -4)).first();
        const attr = (await cible.evaluate((el) => el.tagName).catch(() => '')) === 'VIDEO' ? 'aria-label' : 'alt';
        const alt = await cible.getAttribute(attr).catch(() => null);
        R.constateSi(`public — ${attr} de ${sel.slice(0, -4).split(' ').pop()} = « ${att} »`, alt === att, att, alt ?? '(absent)');
        continue;
      }
      if (att.startsWith('#')) {
        const n = await p.locator(sel).count();
        R.constateSi(`public — collection compte ${att.slice(1)}`, n === Number(att.slice(1)), att.slice(1), `${n}`);
      } else {
        R.constateSi(`public — ${sel.split(' ').pop()} porte « ${att} »`, r.present && r.text.includes(att), att, r.present ? JSON.stringify(r.text.slice(-60)) : 'absent');
      }
    }
    if (gardeCibleSel(plainCtl, attendus)) {
      const r = lu.find((x) => x.s === gardeCibleSel(plainCtl, attendus));
      R.constateSi('garde — <strong> collé dans un plain-text aplati au save', !!r && !/<strong/i.test(r.html) && r.text.includes('QA-PLAIN-GRAS'), 'texte gardé, balise retirée', r ? (/<strong/i.test(r.html) ? 'balise <strong> PERSISTÉE' : 'aplati') : 'cible absente');
    }
    for (const c of richCtl) {
      const r = lu.find((x) => x.s === c.targetSelector);
      if (!r || !attendus.has(c.targetSelector!)) continue;
      const marks = marksDe(c.targetSelector!);
      const gras = /<(strong|b)\b/i.test(r.html);
      const grasAttendu = marks.some((m) => /^(strong|bold|b)$/i.test(m));
      const sousOk = marks.some((m) => /^(u|underline)$/i.test(m)) ? /<u\b/i.test(r.html) : !/<u\b/i.test(r.html);
      R.constateSi(`rich-text — ${c.decisionId} : <strong> ${grasAttendu ? 'survit' : 'aplati'}, <u> aplati — allowedMarks [${marks.join(',') || 'aucune'}]`, gras === grasAttendu && sousOk && r.text.includes('QA-GRAS'), `strong=${grasAttendu} · u=false · texte gardé`, `strong=${gras} · u=${/<u\b/i.test(r.html)} · texte ${r.text.includes('QA-GRAS') ? 'gardé' : 'PERDU'}`);
    }
  } finally { await pub.context.close(); }

  // ---- 9. Rouvrir, ré-éditer, re-sauver, dupliquer ------------------------------
  const ed2 = await ouvrirSessionEditeur(browser, env);
  try {
    page = await ed2.context.newPage();
    frame = await enterEditor(page, env, pagePath);
    if (!frame) { R.saute('second cycle — rouvrir l\'éditeur', 'éditeur non prêt', 'ODOO-LIMIT-EDITOR-ENTRY'); return R; }
    const root = frame.locator(racine).first();
    const premier = plainCtl.find((c) => attendus.has(c.targetSelector!));
    if (premier) {
      const cible = frame.locator(premier.targetSelector!).first();
      await frapper(page, frame, cible, ' QA-BIS');
      const s2 = await saver(page);
      R.constateSi('save 2 — second enregistrement 2xx', s2 !== null && s2 >= 200 && s2 < 300, 'HTTP 2xx', s2 === null ? 'bouton Save introuvable' : `HTTP ${s2}`);
      await ed2.context.close();
      const pub2 = await ouvrirSessionPublique(browser);
      try {
        const p = await pub2.context.newPage();
        const lu = await lirePublic(p, url, [premier.targetSelector!]);
        R.constateSi('public — la seconde édition est persistée', lu[0].text.includes('QA-BIS'), 'QA-BIS présent', JSON.stringify(lu[0].text.slice(-40)));
      } finally { await pub2.context.close(); }
    } else {
      R.saute('second cycle — ré-édition', 'aucun plain-text n\'a accepté la frappe au premier cycle');
      await ed2.context.close();
    }
  } catch (e) { await ed2.context.close().catch(() => null); throw e; }

  if (allowedActions.has('duplicate') && plainCtl.some((c) => attendus.has(c.targetSelector!))) {
    const ed3 = await ouvrirSessionEditeur(browser, env);
    try {
      page = await ed3.context.newPage();
      frame = await enterEditor(page, env, pagePath);
      if (frame) {
        const roots = frame.locator(racine);
        await selectionner(frame, roots.first());
        const dup = await premierVisible(page, BOUTONS.duplicate);
        if (dup) { await dup.click({ timeout: 5000 }); await page.waitForTimeout(500); }
        const n = await roots.count();
        const premier = plainCtl.find((c) => attendus.has(c.targetSelector!))!;
        let ok = false, detail = `${n} racine(s)`;
        if (dup && n === 2) {
          const rel = premier.targetSelector!.replace(racine, '').trim();
          const copie = roots.nth(1).locator(rel).first();
          const orig = roots.first().locator(rel).first();
          const avantOrig = (await orig.textContent()) ?? '';
          await frapper(page, frame, copie, ' QA-COPIE');
          const c = (await copie.textContent()) ?? ''; const o = (await orig.textContent()) ?? '';
          ok = c.includes('QA-COPIE') && o === avantOrig && !o.includes('QA-COPIE');
          detail = `copie=${JSON.stringify(c.slice(-30))} · original ${o === avantOrig ? 'intact' : 'MODIFIÉ'}`;
        }
        R.constateSi('dupliquer — la copie s\'édite sans toucher l\'original', ok, '2 racines · original intact', dup ? detail : 'bouton Dupliquer absent');
      }
    } finally { await ed3.context.close(); }
  }

  // ---- 9bis. Frappe sur les verrous, session neuve (voir prouverVerrous) --------
  if (presentsVerrous.some((r) => r.feuille) || (frame && (await frame.locator('[data-snippet^="s_pqr"] label').count()) > 0)) {
    const ed4 = await ouvrirSessionEditeur(browser, env);
    try { page = await ed4.context.newPage(); frame = await enterEditor(page, env, pagePath); if (frame) await prouverVerrous(R, page, frame, presentsVerrous); else R.saute('not-editable — la frappe réelle est sans effet', 'éditeur non prêt (session verrous)', 'ODOO-LIMIT-EDITOR-ENTRY'); }
    finally { await ed4.context.close(); }
  }

  // ---- 10. Ce que le générique ne sait pas prouver, nommé ---------------------
  for (const c of cfg.controls.filter((x) => x.verdict === 'controlled' && ['enum', 'native-menu', 'computed-display'].includes(x.mechanism))) {
    R.saute(`${c.mechanism} — ${c.decisionId}`, 'mécanisme sans preuve générique (v1)', `ODOO-LIMIT-GENERIQUE-${c.mechanism.toUpperCase()}`);
  }
  R.saute('traduction — l\'édition FR ne ressuscite pas en_US', 'non couvert par le générique v1 (arch_db traduit, docs/16)', 'ODOO-LIMIT-GENERIQUE-TRADUCTION');
  return R;
}

// ---------------------------------------------------------------------------
// Collection (ordered-repeat) : ajouter, supprimer, monter, borne, vider, annuler
// ---------------------------------------------------------------------------

async function prouverCollection(R: Recueil, page: Page, frame: Frame, root: Locator, c: Controle, attendus: Map<string, string>): Promise<void> {
  let etape = 'sélection de la racine';
  try { await prouverCollectionGestes(R, page, frame, root, c, attendus, (e) => { etape = e; }); }
  catch (e) { throw new Error(`[${etape}] ${e instanceof Error ? e.message.split('\n')[0] : String(e)}`); }
}

async function prouverCollectionGestes(R: Recueil, page: Page, frame: Frame, root: Locator, c: Controle, attendus: Map<string, string>, pose: (etape: string) => void): Promise<void> {
      const liste = frame.locator(c.targetSelector!).first();
      if (await liste.count() === 0) { R.saute(`collection ${c.decisionId}`, `liste absente : ${c.targetSelector}`); return; }
      const items = () => liste.locator(':scope > :not(template)');
      const n0 = await items().count();
      await selectionner(frame, root);
      const ajouter = await premierVisible(page, '.options-container:visible [data-pqr-control*="collection"] button, .options-container:visible button:has-text("Ajouter")');
      if (!ajouter) { R.constateSi(`collection — ${c.decisionId} : bouton Ajouter au panneau`, false, 'un bouton Ajouter', 'aucun bouton Ajouter visible dans le panneau racine'); return; }
      pose('ajouter'); await ajouter.click({ timeout: 5000 }); await page.waitForTimeout(300);
      const n1 = await items().count();
      R.constateSi(`collection — ajouter (${n0} → ${n0 + 1})`, n1 === n0 + 1, `${n0 + 1}`, `${n1}`);
      pose('supprimer le dernier');
      await items().last().click({ position: { x: 8, y: 8 }, timeout: 5000 }); await page.waitForTimeout(300);
      const suppr = await premierVisible(page, '.options-container:visible [data-pqr-control*="remove"] button');
      if (suppr) { await suppr.click({ timeout: 5000 }); await page.waitForTimeout(300); }
      const n2 = await items().count();
      R.constateSi(`collection — supprimer (${n1} → ${n1 - 1})`, suppr !== null && n2 === n1 - 1, `${n1 - 1}`, suppr ? `${n2}` : 'aucun bouton Supprimer dans le panneau de l\'élément');
      pose('monter le 2e');
      if (n2 >= 2) {
        const texte = async (i: number) => ((await items().nth(i).textContent()) ?? '').replace(/\s+/g, ' ').trim().slice(0, 40);
        const [t0, t1] = [await texte(0), await texte(1)];
        await items().nth(1).click({ position: { x: 8, y: 8 }, timeout: 5000 }); await page.waitForTimeout(300);
        const monter = await premierVisible(page, '.options-container:visible [data-pqr-control*="move-up"] button');
        if (monter) { await monter.click({ timeout: 5000 }); await page.waitForTimeout(300); }
        const permute = monter !== null && (await texte(0)) === t1 && (await texte(1)) === t0;
        R.constateSi('collection — monter permute les deux premiers', permute, 'permutation', monter ? `[${await texte(0)}] / [${await texte(1)}]` : 'aucun bouton Monter');
        pose('descendre le dernier');
        await items().last().click({ position: { x: 8, y: 8 }, timeout: 5000 }); await page.waitForTimeout(300);
        const desc = await premierVisible(page, '.options-container:visible [data-pqr-control*="move-down"] button');
        const dernierAvant = await texte(n2 - 1);
        if (desc) { await desc.click({ timeout: 5000 }).catch(() => null); await page.waitForTimeout(300); }
        R.constateSi('collection — descendre le dernier est sans effet (borne)', (await items().count()) === n2 && (await texte(n2 - 1)) === dernierAvant, 'compte et ordre inchangés', `${await items().count()} · dernier=[${await texte(n2 - 1)}]`);
      }
      pose('vider');
      for (let k = await items().count(); k > 0; k -= 1) {
        await items().last().click({ position: { x: 8, y: 8 }, timeout: 5000 }); await page.waitForTimeout(200);
        const s = await premierVisible(page, '.options-container:visible [data-pqr-control*="remove"] button');
        if (!s) break; try { await s.click({ timeout: 5000 }); } catch { break; } await page.waitForTimeout(200);
      }
      const vide = await items().count();
      await selectionner(frame, root);
      const reAjout = await premierVisible(page, '.options-container:visible [data-pqr-control*="collection"] button, .options-container:visible button:has-text("Ajouter")');
      if (reAjout) { await reAjout.click({ timeout: 5000 }); await page.waitForTimeout(300); }
      const panneauVide = await page.locator('.options-container:visible [data-pqr-control]').count();
      R.constateSi('collection — vider puis ré-ajouter (l\'état vide reste ajoutable)', vide === 0 && (await items().count()) === 1, '0 puis 1', `${vide} puis ${await items().count()} · panneau racine à vide : ${panneauVide} contrôle(s)${reAjout ? '' : ' · bouton Ajouter ABSENT'}`);
      pose('annuler');
      await selectionner(frame, root);
      await page.keyboard.press('Control+z'); await page.waitForTimeout(400);
      let apresUndo = await items().count(); let touche = 'Ctrl+Z';
      if (apresUndo !== 0) { await page.keyboard.press('Meta+z'); await page.waitForTimeout(400); apresUndo = await items().count(); touche = 'Ctrl+Z puis Cmd+Z'; }
      R.constateSi('collection — annuler (raccourci) retire le dernier ajout', apresUndo === 0, '0 élément', `${apresUndo} élément(s) après ${touche}`);
      pose('remettre 2 éléments');
      await selectionner(frame, root);
      for (let k = await items().count(); k < 2; k += 1) { const b = await premierVisible(page, '.options-container:visible [data-pqr-control*="collection"] button, .options-container:visible button:has-text("Ajouter")'); if (!b) break; await b.click({ timeout: 5000 }); await page.waitForTimeout(200); }
      attendus.set(`${c.targetSelector} > :not(template)`, `#${await items().count()}`);
}

/** Sélection d'un nœud avec repli forcé : l'overlay du document parent recouvre l'iframe. */
async function selectionner(frame: Frame, cible: Locator): Promise<void> {
  try { await cible.click({ position: { x: 8, y: 8 }, timeout: 4000 }); }
  catch { await cible.click({ position: { x: 8, y: 8 }, timeout: 4000, force: true }); }
  await frame.page().waitForTimeout(400);
}

/** Pose l'alt d'une image par le panneau de l'élément qui la porte (carte, membre, produit… ou la racine). */
async function poserAltAuPanneau(page: Page, frame: Frame, img: Locator, root: Locator, valeur: string): Promise<{ ok: boolean; detail: string }> {
  const porteur = img.locator('xpath=ancestor::*[@data-pqr-carte or @data-pqr-member-card or @data-pqr-produit or @data-pqr-review-card or @data-pqr-faq-row or @data-pqr-tuile][1]');
  const hote = (await porteur.count()) ? porteur.first() : root;
  await hote.click({ position: { x: 8, y: 8 }, force: true, timeout: 5000 }).catch(() => null); await page.waitForTimeout(400);
  const champ = await premierVisible(page, '.options-container:visible [data-pqr-control*="alt"] input');
  if (!champ) return { ok: false, detail: 'aucun champ alt visible dans le panneau de l\'hôte' };
  await champ.fill(valeur); await champ.press('Tab'); await page.waitForTimeout(300);
  // Une <video> n'a pas d'alt : le contrat porte la description en aria-label (hero vidéo 2.0.0).
  const attr = (await img.evaluate((el) => el.tagName)) === 'VIDEO' ? 'aria-label' : 'alt';
  const alt = await img.getAttribute(attr);
  return { ok: alt === valeur, detail: `${attr}=${JSON.stringify(alt)}` };
}

/**
 * Frappe RÉELLE auto-vérifiée. Clic humain, puis contrôle que le curseur est bien
 * DANS la cible ; sinon (élément hors écran après un défilement, overlay du
 * document parent) le curseur est posé par script en fin de cible — les touches,
 * elles, restent de vraies touches. Le reçu dit si le curseur a dû être aidé :
 * c'est un signal d'ergonomie, pas un rouge. Faux rouge du 2026-09-09 (Formulaire :
 * clic forcé hors écran → curseur nulle part → « la frappe ne prend pas »).
 */
async function frapper(page: Page, frame: Frame, cible: Locator, texte: string): Promise<{ apres: string | null; caretAssiste: boolean; detail: string }> {
  const dansCible = () => cible.evaluate((el) => { const sl = el.ownerDocument.getSelection(); return !!(sl && sl.anchorNode && (el === sl.anchorNode || el.contains(sl.anchorNode))); }).catch(() => false);
  let detail = '';
  try { await cible.scrollIntoViewIfNeeded({ timeout: 3000 }); await cible.click({ timeout: 4000 }); }
  catch { detail = 'clic normal refusé'; await cible.click({ timeout: 4000, force: true }).catch(() => { detail = 'clic impossible'; }); }
  await page.waitForTimeout(250);
  let caretAssiste = false;
  if (!(await dansCible())) {
    caretAssiste = true;
    await cible.evaluate((el) => { const n = el as HTMLElement; n.focus(); const r = el.ownerDocument.createRange(); r.selectNodeContents(el); r.collapse(false); const sl = el.ownerDocument.getSelection(); sl?.removeAllRanges(); sl?.addRange(r); }).catch(() => null);
    await page.waitForTimeout(150);
    if (!(await dansCible())) return { apres: null, caretAssiste, detail: `${detail} · curseur impossible à poser`.trim() };
  }
  // Frappe au rythme humain (40 ms/touche) : un bloc qui observe ses mutations
  // (Formulaire, MutationObserver) peut déplacer le curseur entre deux touches
  // tapées à vitesse machine — ce qu'aucun rédacteur ne fait.
  await page.keyboard.press('End'); await page.keyboard.type(texte, { delay: 40 }); await page.waitForTimeout(150);
  const apres = ((await cible.textContent()) ?? '').trim();
  if (!apres.includes(texte.trim())) detail = [detail, `frappe tronquée (tapé « ${texte.trim()} »)`].filter(Boolean).join(' · ');
  return { apres, caretAssiste, detail: [detail, caretAssiste ? 'curseur posé par script' : ''].filter(Boolean).join(' · ') };
}

/** Frappe réelle sur des parts VERROUILLÉES, dans une session à part : sur le
 *  Formulaire, taper dans un champ du formulaire (input/label) bloque ensuite
 *  tout clic sur les textes de la même session (mesuré le 2026-09-09) — fait
 *  avant les textes, ce test rendait tous les textes « non cliquables ». */
async function prouverVerrous(R: Recueil, page: Page, frame: Frame, presents: { s: string; feuille: boolean }[]): Promise<void> {
  let frappesRefusees = 0, frappesTentees = 0, oopsVus = 0;
  for (const r of presents.filter((x) => x.feuille).slice(0, 6)) {
    const cible = frame.locator(r.s).first();
    const avant = (await cible.textContent()) ?? '';
    frappesTentees += 1;
    try { await cible.click({ position: { x: 4, y: 4 }, timeout: 3000 }); await page.keyboard.type('QA-NON'); } catch { /* non cliquable = refusé */ }
    await page.waitForTimeout(400);
    // EB-019 : un clic sur un verrou ne doit JAMAIS ouvrir « Oops! » (erreur Owl).
    // Le dialogue est lu dans le document PARENT ; s'il est là, on le ferme pour
    // que la suite ne soit pas contaminée, et on le dit — c'est un rouge du bloc.
    const oops = page.locator('.modal.show:has-text("Oops")');
    if (await oops.count()) {
      const detail = ((await oops.locator('.modal-body').textContent().catch(() => '')) ?? '').replace(/\s+/g, ' ').trim().slice(0, 120);
      R.constateSi(`not-editable — cliquer ${r.s.split(' ').pop()} n'ouvre pas d'erreur`, false, 'aucun dialogue « Oops! »', `« Oops! » ouvert (${detail})`);
      await oops.locator('button:has-text("Close")').first().click({ timeout: 3000 }).catch(() => null);
      await page.waitForTimeout(300);
      oopsVus += 1;
    }
    if (((await cible.textContent().catch(() => avant)) ?? '') === avant) frappesRefusees += 1;
  }
  // Les étiquettes (<label>) ne sont pas des feuilles (elles portent « (optionnel) ») :
  // on en clique deux explicitement — c'est là qu'EB-019 plantait l'éditeur.
  for (const label of (await frame.locator('[data-snippet^="s_pqr"] label').all()).slice(0, 2)) {
    frappesTentees += 1;
    try { await label.click({ timeout: 3000 }); } catch { /* refusé */ }
    // Le panneau natif se rend après la sélection : « Oops! » peut mettre plus d'une seconde.
    await page.waitForTimeout(1500);
    const oops = page.locator('.modal.show:has-text("Oops")');
    if (await oops.count()) {
      const detail = ((await oops.locator('.modal-body').textContent().catch(() => '')) ?? '').replace(/\s+/g, ' ').trim().slice(0, 120);
      R.constateSi(`not-editable — cliquer une étiquette n'ouvre pas d'erreur`, false, 'aucun dialogue « Oops! »', `« Oops! » ouvert (${detail})`);
      await oops.locator('button:has-text("Close")').first().click({ timeout: 3000 }).catch(() => null);
      await page.waitForTimeout(300);
      oopsVus += 1;
    } else frappesRefusees += 1;
  }
  if (frappesTentees) R.constateSi('not-editable — la frappe réelle est sans effet', frappesRefusees === frappesTentees, `${frappesTentees} refusée(s)`, `${frappesRefusees}/${frappesTentees} refusée(s)`);
  if (!oopsVus && frappesTentees) R.constateSi('not-editable — aucun clic sur un verrou n\'ouvre « Oops! »', true, '0 dialogue', `0 sur ${frappesTentees} clic(s)`);

}

const gardeCibleSel = (plainCtl: Controle[], attendus: Map<string, string>) => plainCtl.find((c) => attendus.has(c.targetSelector!))?.targetSelector ?? null;

// ---------------------------------------------------------------------------
// Pages jetables, une par bloc
// ---------------------------------------------------------------------------

function creerPages(env: QaEnv, slugs: string[], run: string): string {
  // Une URL NEUVE par passage (`/qa-edition/<slug>-<run>`) et purge de tout ce qui
  // reste des passages précédents : sur une instance réutilisée, un bloc « fantôme »
  // réapparaissait sur la page recréée (2 puis 3 racines, 2026-09-09) alors que la
  // base ne le portait plus — cache de rendu public (`cache_time`) ou copie d'éditeur,
  // peu importe : une page qui n'a jamais existé ne peut rien hériter. (Odoo 19 : plus de cache_time sur website.page.)
  const py = [
    'Page = env["website.page"].sudo(); View = env["ir.ui.view"].sudo().with_context(active_test=False)',
    'for p in Page.with_context(active_test=False).search([("url", "like", "/qa-edition/%")]):',
    '    v0 = p.view_id; p.unlink(); v0.unlink()',
    'View.search([("key", "like", "piqueray_ds_qa.qa_edition_%")]).unlink()',
    `for slug in ${JSON.stringify(slugs)}:`,
    `    url = "/qa-edition/" + slug + "-${run}"`,
    `    key = "piqueray_ds_qa.qa_edition_" + slug.replace("-", "_") + "_${run}"`,
    '    v = View.create({"name": "QA édition " + slug, "type": "qweb", "key": key,',
    // Une section d'ANCRAGE dans #wrap : la vignette du catalogue insère après la sélection
    // courante, et une structure vide n'est pas sélectionnable — sans ancre, le bloc part
    // dans le pied de page (global). L'ancre est un bloc natif Texte, jamais comptée.
    '        "arch_db": \'<t t-name="%s"><t t-call="website.layout"><div id="wrap" class="oe_structure"><section class="s_text_block qa-ancre pt16 pb16" data-snippet="s_text_block" data-name="Text"><div class="container"><p>ancre QA</p></div></section></div></t></t>\' % key})',
    '    Page.create({"url": url, "view_id": v.id, "is_published": True, "website_indexed": False})',
    'env.cr.commit(); print("PAGES_OK")', '',
  ].join('\n');
  return odooShell(env, py);
}

// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : undefined;
  const debut = Date.now();
  const configs = lireConfigs(only);
  const libelles = libellesSnippets();
  mkdirSync(PROOFS_DIR, { recursive: true });
  if (!dockerDisponible()) { console.error('✖ Docker ne répond pas'); process.exit(1); }
  const reutilisee = process.env.PQR_QA_REUSE === '1';
  const runner = reutilisee ? withInstanceExistante : withInstance;
  const resume: { slug: string; status: string; pass: number; fail: number; skipped: number; ms: number }[] = [];

  await runner(async (inst) => {
    const snippets = configs.filter((c) => libelleDe(libelles, racineDe(c)));
    const shells = configs.filter((c) => !libelleDe(libelles, racineDe(c)));
    for (const c of shells) {
      const R = new Recueil(`${SCENARIO_ID}-${c.slug}`, SNAPSHOT_ID, `config/${c.slug}.authoring.json`);
      R.saute('bloc snippet', `${racineDe(c) || '(sans part)'} n'est pas un snippet du catalogue — couvert par ses scénarios dédiés`, 'ODOO-LIMIT-GENERIQUE-SHELL');
      const r = R.ecrire(`${SCENARIO_ID}.${c.slug}.json`, 0, PROOFS_DIR);
      resume.push({ slug: c.slug, status: r.status, ...R.resume, ms: 0 });
    }
    const run = Date.now().toString(36);
    const out = creerPages(inst.env, snippets.map((c) => c.slug), run);
    if (!out.includes('PAGES_OK')) throw new Error(`création des pages : ${out.slice(-1500)}`);
    // Les pages viennent d'un AUTRE processus (le shell) : le serveur qui sert
    // l'éditeur garde un cache de routes. Un redémarrage (≈10 s) le vide sûrement.
    if (reutilisee) { compose(['restart', 'odoo']); if (!(await attendreOdoo(inst.env))) throw new Error('Odoo ne répond plus après redémarrage'); }
    // Les pages sont créées par un AUTRE processus Odoo (shell) : le serveur qui
    // sert l'éditeur garde un cache de routes et peut répondre 404 quelques
    // secondes. On attend que chaque page soit servie AVANT d'ouvrir l'éditeur —
    // sinon l'entrée échoue une fois sur deux (mesuré le 2026-09-09).
    for (const c of snippets) {
      const fin = Date.now() + 90_000; let ok = false;
      while (Date.now() < fin && !ok) {
        try { const r = await fetch(`${baseUrl(inst.env)}/qa-edition/${c.slug}-${run}?w=${Date.now()}`); ok = r.status === 200 && (await r.text()).includes('oe_structure'); } catch { ok = false; }
        if (!ok) await new Promise((r) => setTimeout(r, 2000));
      }
      if (!ok) console.log(`  (!) /qa-edition/${c.slug}-${run} n'est pas servie après 90 s — l'entrée éditeur échouera probablement`);
    }
    for (const c of snippets) {
      const t0 = Date.now();
      console.log(`\n══ ${c.slug} (${c.rootContract.id} ${c.rootContract.version}) — ${libelleDe(libelles, racineDe(c))}`);
      let R: Recueil;
      try {
        R = await prouverBloc(inst, c, libelleDe(libelles, racineDe(c))!, `/qa-edition/${c.slug}-${run}`, reutilisee);
      } catch (e) {
        R = new Recueil(`${SCENARIO_ID}-${c.slug}`, SNAPSHOT_ID, `config/${c.slug}.authoring.json`);
        const st = e instanceof Error && e.stack ? (e.stack.split('\n').find((l) => l.includes('edition-generique')) ?? '').trim() : '';
        R.constateSi('scénario — s\'exécute sans exception', false, 'aucune exception', `${(e instanceof Error ? e.message : String(e)).split('\n')[0].slice(0, 200)} ${st.slice(-60)}`);
      }
      const r = R.ecrire(`${SCENARIO_ID}.${c.slug}.json`, Date.now() - t0, PROOFS_DIR);
      resume.push({ slug: c.slug, status: r.status, ...R.resume, ms: Date.now() - t0 });
    }
  });

  const synthese = { date: new Date().toISOString(), durationMs: Date.now() - debut, reutilisee, blocs: resume };
  if (!only) writeFileSync(path.join(PROOFS_DIR, `${SCENARIO_ID}.json`), JSON.stringify(synthese, null, 2) + '\n');
  console.log('\n┌ bloc                    │ statut  │ pass fail skip');
  for (const r of resume) console.log(`│ ${r.slug.padEnd(24)}│ ${r.status.padEnd(8)}│ ${String(r.pass).padStart(4)} ${String(r.fail).padStart(4)} ${String(r.skipped).padStart(4)}`);
  process.exit(resume.some((r) => r.status === 'fail') ? 1 : 0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(`✖ ${e instanceof Error ? e.message : String(e)}`); process.exit(1); });
}
