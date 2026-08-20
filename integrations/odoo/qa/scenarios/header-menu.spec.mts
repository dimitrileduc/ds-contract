/**
 * Preuve SC-002 / SC-003 (spec 022) : le rédacteur édite le menu (ajouter,
 * renommer, réordonner, imbriquer, pointer page interne puis URL externe) et le
 * design de la barre reste intact ; le contenu est 100 % conservé après
 * enregistrement et réouverture.
 *
 * MÉCANISME (limite nommée) : les éditions sont appliquées par l'ORM — le MÊME
 * modèle `website.menu` que le dialogue « Éditer le menu » persiste. L'invariant
 * prouvé est STRUCTUREL (research D7) : NOTRE gabarit ne fait que LIRE
 * `website.menu` et re-rend la barre à chaque requête — le design ne peut pas
 * casser par une édition de contenu, quel que soit l'outil qui l'a écrite. Piloter
 * l'UI OWL du dialogue de bout en bout est un différé nommé (limitCode) ; sa
 * donnée-cible et le re-rendu sont, eux, prouvés ici.
 *
 * scenarioId DISTINCT des rouges pré-existants (quickstart §7). Reçu sous specs/022.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from '../../../../extract/figma/visual-parity/render.js';
import { REPO } from '../lib/receipt.mts';
import { baseUrl, odooShell, readQaEnv } from '../run.mts';

const SNAPSHOT = 'odoo-019-foundation';
const OUT = path.join(REPO, 'specs', '022-odoo-nav-shell', 'proofs', 'header-menu.json');

function shell(env: ReturnType<typeof readQaEnv>, lines: string[]): string {
  return odooShell(env, [...lines, 'env.cr.commit()', "print('SHELL_OK')", ''].join('\n'));
}

interface Constat { quoi: string; statut: 'pass' | 'fail' | 'skipped'; attendu: string; observe: string }

async function main() {
  const env = readQaEnv();
  const base = baseUrl(env);
  const constats: Constat[] = [];
  const note = (quoi: string, ok: boolean, attendu: string, observe: string) => {
    constats.push({ quoi, statut: ok ? 'pass' : 'fail', attendu, observe });
    console.log(`  ${ok ? '✔' : '✖'} ${quoi} — attendu « ${attendu} », observé « ${observe} »`);
  };

  const { browser } = await launchBrowser();
  // Odoo met en CACHE le rendu de la page d'accueil PAR URL (constaté :
  // `curl /` sert l'ancien menu, `curl /?x=…` le nouveau). Comme ce scénario
  // ÉDITE le menu entre deux lectures, chaque lecture porte une clé de cache
  // unique — sinon on mesurerait un rendu figé au premier chargement.
  let nonce = 0;
  // Lit la barre système (première .header) du site public, sans session.
  const readBar = async (): Promise<{ items: Array<{ label: string; href: string | null; target: string | null; chevron: boolean; classes: string; libellClasses: string }>; hasLogo: boolean; hasCta: boolean; hasIcons: boolean; dropdownItems: string[] }> => {
    const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${base}/?pqr=${++nonce}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.evaluate(`Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,2500))])`);
    const out = JSON.parse(await page.evaluate(`(function(){
      var h=document.querySelectorAll('.header')[0];
      var items=[].slice.call(h.querySelectorAll('.header__nav .nav-item')).map(function(a){var s=a.querySelector('.nav-item__libell'); return {label:s?s.textContent:'', href:a.getAttribute('href'), target:a.getAttribute('target'), chevron:!!a.querySelector('.nav-item__OcticonChevronDown12'), classes:a.className, libellClasses:s?s.className:''};});
      var dd=[].slice.call(h.querySelectorAll('.header__nav .dropdown-menu .dropdown-item')).map(function(a){return a.textContent.trim();});
      return JSON.stringify({items:items, hasLogo:!!h.querySelector('.piqueray-logo'), hasCta:!!h.querySelector('.button--variant-blanc'), hasIcons:!!h.querySelector('.header__iconsNav'), dropdownItems:dd});
    })()`)) as any;
    await ctx.close();
    return out;
  };

  try {
    // Baseline : la barre semée (référence de balisage des liens simples).
    const base0 = await readBar();
    const simple0 = base0.items.find((i) => !i.chevron);
    note('baseline — barre semée rendue, lien simple présent', !!simple0 && simple0.classes === 'nav-item' && simple0.libellClasses === 'nav-item__libell',
      'nav-item + nav-item__libell', simple0 ? `${simple0.classes} / ${simple0.libellClasses}` : 'aucun lien simple');

    // 1) ÉDITIONS : ajouter, renommer, réordonner, URL externe (new_window).
    shell(env, [
      "site = env['website'].sudo().search([], limit=1); root = site.menu_id",
      "Menu = env['website.menu'].sudo()",
      "Menu.create({'name':'Actualités','url':'/actualites','parent_id':root.id,'website_id':site.id,'sequence':35})",
      "ap = Menu.search([('website_id','=',site.id),('name','=','À propos')], limit=1); ap.write({'name':'Notre histoire'})",
      "sav = Menu.search([('website_id','=',site.id),('url','=','/depannage-sav')], limit=1); sav.write({'sequence':5})",
      "Menu.create({'name':'Partenaire','url':'https://partenaire.example','parent_id':root.id,'website_id':site.id,'sequence':50,'new_window':True})",
    ]);
    const s1 = await readBar();
    const labels1 = s1.items.map((i) => i.label);
    note('SC-003 — ajout « Actualités » conservé après réouverture publique', labels1.includes('Actualités'), 'présent', JSON.stringify(labels1));
    note('SC-003 — renommage « À propos » → « Notre histoire » conservé', labels1.includes('Notre histoire') && !labels1.includes('À propos'), '« Notre histoire », plus « À propos »', JSON.stringify(labels1));
    note('SC-003 — réordonnancement pris en compte (Dépannage/SAV avancé)', labels1.indexOf('Dépannage/SAV') < labels1.indexOf('Notre histoire'), 'Dépannage/SAV avant Notre histoire', JSON.stringify(labels1));
    const ext = s1.items.find((i) => i.label === 'Partenaire');
    note('SC-002/FR-005 — URL externe : nouvel onglet respecté', !!ext && ext.href === 'https://partenaire.example' && ext.target === '_blank', 'href externe + target=_blank', JSON.stringify(ext));
    const simple1 = s1.items.find((i) => i.label === 'Actualités');
    note('SC-002 — un lien simple ajouté garde le balisage exact', !!simple1 && simple1.classes === 'nav-item' && simple1.libellClasses === 'nav-item__libell' && !simple1.chevron,
      'nav-item + nav-item__libell, sans chevron', simple1 ? `${simple1.classes} / ${simple1.libellClasses} / chevron ${simple1.chevron}` : 'absent');

    // 2) IMBRIQUER : Dépannage/SAV devient enfant de « Notre histoire » → chevron (FR-008).
    shell(env, [
      "site = env['website'].sudo().search([], limit=1)",
      "Menu = env['website.menu'].sudo()",
      "nh = Menu.search([('website_id','=',site.id),('name','=','Notre histoire')], limit=1)",
      "sav = Menu.search([('website_id','=',site.id),('url','=','/depannage-sav')], limit=1); sav.write({'parent_id':nh.id})",
    ]);
    const s2 = await readBar();
    const parent = s2.items.find((i) => i.label === 'Notre histoire');
    note('FR-008 — un parent nouvellement doté d\'un enfant obtient le chevron', !!parent && parent.chevron === true, 'chevron présent', JSON.stringify(parent));
    note('SC-003 — Dépannage/SAV désormais dans le sous-menu de Notre histoire', s2.dropdownItems.includes('Dépannage/SAV'), 'présent en sous-menu', JSON.stringify(s2.dropdownItems));

    // 3) PROFONDEUR ≥ 3 : petit-enfant sous Dépannage/SAV.
    shell(env, [
      "site = env['website'].sudo().search([], limit=1)",
      "Menu = env['website.menu'].sudo()",
      "sav = Menu.search([('website_id','=',site.id),('url','=','/depannage-sav')], limit=1)",
      "Menu.create({'name':'Garantie','url':'/garantie','parent_id':sav.id,'website_id':site.id,'sequence':10})",
    ]);
    const s3 = await readBar();
    note('edge — profondeur ≥ 3 rend la barre sans casse (logo/CTA/icônes intacts)',
      s3.hasLogo && s3.hasCta && s3.hasIcons && s3.items.length > 0, 'barre complète rendue', `logo ${s3.hasLogo} cta ${s3.hasCta} icons ${s3.hasIcons} items ${s3.items.length}`);

    // 4) MENU VIDÉ : détacher tous les tops du menu racine → child_id vide → barre
    //    vide. On RÉ-PARENTE (pas de unlink) : supprimer un enregistrement semé
    //    noupdate le ferait recréer au prochain `-u` (limite nommée en clôture) ;
    //    le détachement prouve le MÊME résultat (child_id vide) sans perte d'xml_id,
    //    ce que SC-006 (T027) exige pour son invariant byte-identique.
    shell(env, [
      "site = env['website'].sudo().search([], limit=1); root = site.menu_id",
      "tops = env['website.menu'].sudo().search([('website_id','=',site.id),('parent_id','=',root.id)])",
      "env['ir.config_parameter'].sudo().set_param('pqr_qa.emptied_ids', ','.join(map(str, tops.ids)))",
      "tops.write({'parent_id': False})",
    ]);
    const s4 = await readBar();
    note('edge — menu vidé : la barre (logo, CTA, icônes) se rend sans zone cassée',
      s4.hasLogo && s4.hasCta && s4.hasIcons && s4.items.length === 0, 'logo+CTA+icônes, 0 lien, aucune casse', `logo ${s4.hasLogo} cta ${s4.hasCta} icons ${s4.hasIcons} items ${s4.items.length}`);

    // 5) RESTAURATION par édition standard → la barre revient (les tops modifiés
    //    par le client — renommages, ajouts, imbrication — reviennent tels quels).
    shell(env, [
      "site = env['website'].sudo().search([], limit=1); root = site.menu_id",
      "ids = env['ir.config_parameter'].sudo().get_param('pqr_qa.emptied_ids') or ''",
      "env['website.menu'].sudo().browse([int(i) for i in ids.split(',') if i]).write({'parent_id': root.id})",
    ]);
    const s5 = await readBar();
    note('edge — restauration par édition standard : la barre est reconstruite', s5.items.length >= 4 && s5.hasLogo && s5.hasCta,
      '≥4 liens rendus à nouveau', `${s5.items.length} liens, logo ${s5.hasLogo}`);
    note('SC-002 — après tout le cycle, le balisage des liens simples est inchangé',
      s5.items.every((i) => /(^|\s)nav-item($|\s)/.test(i.classes) && i.libellClasses === 'nav-item__libell'),
      'tous nav-item + nav-item__libell', JSON.stringify(s5.items.map((i) => i.classes)));
  } finally {
    await browser.close();
  }

  const fail = constats.some((c) => c.statut === 'fail');
  const status = fail ? 'fail' : constats.length === 0 ? 'skipped' : 'pass';
  const receipt = {
    receiptId: `header-menu-${SNAPSHOT}`, scenarioId: 'header-menu', snapshotId: SNAPSHOT, status,
    fixture: 'seeded-menu-edited',
    observations: constats.map((c) => `[${c.statut}] ${c.quoi} — attendu « ${c.attendu} », observé « ${c.observe} »`),
    artifacts: [], limitCodes: ['SC-002-003-ORM-EDIT-NOT-OWL-DIALOG'],
  };
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(receipt, null, 2) + '\n');
  console.log(`\n→ ${path.relative(REPO, OUT)} · reçu « ${status} »`);
  process.exit(status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(`✖ ${e instanceof Error ? e.message : String(e)}`); process.exit(1); });
}
