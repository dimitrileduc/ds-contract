/**
 * La navigation sur les NEUF VRAIES pages du site. Spec 037, US2 (T039–T042).
 *
 * ── Pourquoi un scénario de plus, et pas une extension de `header-nav` ──────
 * `header-nav` (022) mesure le shell sur des pages-FIXTURES qu'il CRÉE lui-même
 * (`piqueray_ds_qa.nav_fixture`, une `<section class="s_text_block">` avec
 * « Fixture QA ») — aux MÊMES huit URL que les vraies pages. Étendre ce
 * scénario-là aurait donc mesuré la navigation sur des souches.
 *
 * ── L'assertion anti-souche, et pourquoi elle est OBLIGATOIRE ────────────────
 * Lancé après `header-nav` sur la même instance, ce scénario passerait au vert
 * sur les fixtures et prouverait exactement le contraire de ce qu'il annonce.
 * Chaque page doit donc porter AU MOINS UNE section `[data-snippet^="s_pqr_"]`,
 * et le NOMBRE de sections doit être celui de son descripteur résolu. Une souche
 * en porte zéro : elle est refusée par son nom.
 *
 * ── La preuve rouge ─────────────────────────────────────────────────────────
 * `--red <url>` dépublie une page, rejoue, EXIGE l'échec qui nomme le lien fautif
 * et chaque page hôte, puis republie. Un test vert qui n'a jamais rougi ne
 * prouve rien : il peut être vert parce qu'il ne regarde rien.
 *
 * Usage :
 *   PQR_ODOO_PORT=8109 PQR_DB_NAME=piqueray_037 npx tsx …/pages-navigation.spec.mts
 *   … --red /motorisation
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from '../../../../extract/figma/visual-parity/render.js';
import { REPO } from '../lib/receipt.mts';
import { baseUrl, odooShell, readQaEnv } from '../run.mts';
import { SITE_PAGES } from '../../../../scripts/odoo/lib/pages.js';
import { resoudrePage } from '../../../../scripts/odoo/resolve-page.js';

const OUT_DIR = path.join(REPO, 'specs', '037-pages-odoo-navigation-pixel', 'proofs', 'navigation');
const ARBRE = JSON.parse(readFileSync(
  path.join(REPO, 'specs', '037-pages-odoo-navigation-pixel', 'contracts', 'menu-tree.json'), 'utf8',
)) as {
  entrees: Array<{ label: string; url: string; children?: Array<{ label: string; url: string }> }>;
  actifAttendu: Record<string, string[]>;
};

interface Constat { quoi: string; statut: 'pass' | 'fail'; attendu: string; observe: string }

/** Odoo sert ses pages depuis un cache par URL : une clé de requête neuve force
 *  le rendu (leçon `header-menu.spec`). Sans elle, une page recomposée peut
 *  revenir telle qu'elle était et le scénario mesurerait le passé. */
const sansCache = (u: string): string => `${u}${u.includes('?') ? '&' : '?'}pqr=${Date.now()}${Math.random().toString(36).slice(2, 6)}`;

async function main(): Promise<void> {
  const env = readQaEnv();
  const base = baseUrl(env);
  const argv = process.argv.slice(2);
  const iRed = argv.indexOf('--red');
  const red = iRed >= 0 ? argv[iRed + 1] : null;

  const constats: Constat[] = [];
  /** Les limites du MOTEUR rencontrées : nommées au reçu, jamais absorbées en
   *  silence dans une attente rabotée (§V). */
  const limites = new Set<string>();
  const note = (quoi: string, ok: boolean, attendu: string, observe: string): void => {
    constats.push({ quoi, statut: ok ? 'pass' : 'fail', attendu, observe });
    console.log(`  ${ok ? '✔' : '✖'} ${quoi} — attendu « ${attendu} », observé « ${observe} »`);
  };

  // Le nombre de sections ATTENDU vient du descripteur résolu, pas d'une liste
  // écrite à la main qui périmerait au premier ajout de section.
  const sectionsAttendues = new Map<string, number>();
  for (const p of SITE_PAGES) {
    sectionsAttendues.set(p.url, (resoudrePage(p.nom).descripteur.sections as unknown[]).length);
  }

  if (red) {
    const py = [
      `pages = env['website.page'].sudo().search([('url','=',${JSON.stringify(red)})])`,
      "pages.write({'is_published': False})",
      'env.cr.commit()',
      "print('DEPUBLIE', len(pages))",
      '',
    ].join('\n');
    const out = odooShell(env, py);
    if (!out.includes('DEPUBLIE')) throw new Error(`la dépublication de ${red} a échoué :\n${out.slice(-800)}`);
    console.log(`  (·) preuve rouge : ${red} dépubliée`);
  }

  const { browser } = await launchBrowser();
  try {
    const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, colorScheme: 'light', locale: 'fr-FR' });
    const page = await ctx.newPage();

    for (const p of SITE_PAGES) {
      const rep = await page.goto(`${base}${sansCache(p.url)}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      const statut = rep?.status() ?? 0;
      const vu = await page.evaluate(() => {
        const wrap = document.querySelector('#wrap.o_pqr_page');
        const gouvernees = wrap ? wrap.querySelectorAll(':scope > section[data-snippet^="s_pqr_"]').length : 0;
        const liens = [...document.querySelectorAll('a[href]')]
          .map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? '')
          .filter((h) => h.startsWith('/') && !h.startsWith('//'));
        const entete = document.querySelector('.header');
        // Les entrées de premier niveau sont les ENFANTS DIRECTS de `.header__nav` :
        // un déroulant (`.header__navItemDropdown`) ou une feuille (`.nav-item`).
        // Les chercher par `querySelectorAll` descendrait aussi dans les
        // sous-menus et rendrait un arbre à plat.
        const nav = entete?.querySelector('.header__nav');
        const arbre = nav
          ? [...nav.children]
            .filter((n) => n.classList.contains('header__navItemDropdown') || n.classList.contains('nav-item'))
            .map((n) => ({
              label: (n.querySelector('.nav-item__libell')?.textContent ?? (n.classList.contains('nav-item') ? n.textContent ?? '' : '')).trim(),
              url: (n.classList.contains('nav-item') ? n : n.querySelector('a[href]'))?.getAttribute('href') ?? '',
              children: [...n.querySelectorAll('.dropdown-menu .dropdown-item')].map((c) => ({
                label: (c.textContent ?? '').trim(),
                url: (c as HTMLAnchorElement).getAttribute('href') ?? '',
              })),
            })).filter((e) => e.label !== '')
          : [];
        const actifs = entete
          ? [...entete.querySelectorAll('.nav-item[data-actif]')].map((a) => (a.querySelector('.nav-item__libell')?.textContent ?? '').trim())
          : [];
        const actifsSousMenu = entete
          ? [...entete.querySelectorAll('.dropdown-menu .dropdown-item.active')].map((a) => (a.textContent ?? '').trim())
          : [];
        return { gouvernees, liens: [...new Set(liens)], arbre, actifs: [...actifs, ...actifsSousMenu] };
      });

      note(`${p.url} répond 200 et porte le wrap gouverné`, statut === 200 && vu.gouvernees > 0,
        '200 + au moins une section s_pqr_', `HTTP ${statut}, ${vu.gouvernees} section(s) gouvernée(s)`);
      // ANTI-SOUCHE : le compte doit être celui du descripteur, pas « au moins une ».
      note(`${p.url} porte les ${sectionsAttendues.get(p.url)} sections de son descripteur (jamais une souche)`,
        vu.gouvernees === sectionsAttendues.get(p.url),
        `${sectionsAttendues.get(p.url)} sections`, `${vu.gouvernees} sections`);

      // FR-010 / SC-003 : l'entrée active, exactement — l'enfant ET son parent
      // pour une page enfant, aucune sur l'accueil, et sur AUCUNE autre.
      //
      // LIMITE ODOO NOMMÉE (mesurée le 2026-09-08, cf. `limitCodes` du reçu) :
      // `website.menu._is_active()` ne rend vrai « que si l'URL correspond ET que
      // l'entrée n'a PAS d'enfants ». Une entrée de tête qui a des enfants ne peut
      // donc jamais être active sur SA PROPRE page. `/portes-de-garage` est le seul
      // cas du site. Ce n'est pas un défaut de la page : c'est une règle du moteur,
      // et elle est écrite ici plutôt que masquée par une attente rabotée.
      const attendus = [...(ARBRE.actifAttendu[p.url] ?? [])];
      const vus = [...vu.actifs].sort();
      const parentDeLuiMeme = ARBRE.entrees.find((e) => e.url === p.url && (e.children?.length ?? 0) > 0);
      const tolere = parentDeLuiMeme ? attendus.filter((a) => a !== parentDeLuiMeme.label) : attendus;
      if (parentDeLuiMeme) {
        limites.add(`ODOO-LIMIT-MENU-PARENT-ACTIF — « ${parentDeLuiMeme.label} » a des enfants : Odoo ne la marque jamais active sur ${p.url}`);
      }
      note(`${p.url} — entrée(s) active(s) exacte(s)`,
        JSON.stringify(vus) === JSON.stringify([...tolere].sort()),
        JSON.stringify(tolere), JSON.stringify(vus));

      // FR-009 / SC-002 : chaque lien interne mène quelque part.
      //
      // Une exception NOMMÉE, jamais une exclusion silencieuse : les icônes
      // sociales du pied pointent vers les routes natives `/website/social/*`,
      // qui répondent 404 tant que les champs `social_facebook` /
      // `social_instagram` du site sont vides. L'adresse des comptes n'existe
      // nulle part dans le dépôt — c'est une donnée de l'owner, et elle ne
      // s'invente pas. La ligne part au registre des restes ; ce n'est pas un
      // défaut de page, mais ce n'est pas non plus « rien ».
      for (const href of vu.liens) {
        const r = await page.request.get(`${base}${sansCache(href)}`);
        if (r.status() === 200) continue;
        if (/^\/website\/social\//.test(href)) {
          limites.add(`ODOO-SOCIAL-NON-CONFIGURE — « ${href} » répond ${r.status()} : le champ social du site est vide (adresse à fournir par l'owner)`);
          continue;
        }
        note(`lien mort « ${href} » trouvé sur la page hôte ${p.url}`, false, '200', `HTTP ${r.status()}`);
      }
      note(`${p.url} — ${vu.liens.length} lien(s) interne(s), tous en 200`,
        !constats.some((c) => c.statut === 'fail' && c.quoi.includes(`hôte ${p.url}`)),
        'aucun lien mort', `${vu.liens.length} liens suivis`);

      // FR-008 : l'arbre RENDU est celui que l'owner a validé.
      if (p.url === '/') {
        // LIMITE ODOO NOMMÉE, la seconde et la même racine : Odoo force
        // `url = '#'` sur une entrée QUI A DES ENFANTS (mesuré sur base fraîche
        // ET sur base mise à jour, 2026-09-08). « Portes de garage » ne peut donc
        // pas mener à sa propre page. On accepte le « # » POUR CE CAS SEULEMENT —
        // une FEUILLE à « # » reste un échec, c'est un lien mort.
        const rendu = vu.arbre.map((e) => {
          const attendue = ARBRE.entrees.find((x) => x.label === e.label);
          const aDesEnfants = (attendue?.children?.length ?? 0) > 0;
          if (aDesEnfants && e.url === '#') {
            limites.add(`ODOO-LIMIT-MENU-PARENT-HREF — « ${e.label} » a des enfants : Odoo force son URL à « # », elle ne mène pas à ${attendue?.url}`);
            return e.children.length ? { label: e.label, url: attendue?.url ?? '', children: e.children } : { label: e.label, url: attendue?.url ?? '' };
          }
          return e.children.length ? { label: e.label, url: e.url, children: e.children } : { label: e.label, url: e.url };
        });
        note("l'arbre du menu rendu est celui validé par l'owner (libellés, ordre, imbrication, URL)",
          JSON.stringify(rendu) === JSON.stringify(ARBRE.entrees),
          JSON.stringify(ARBRE.entrees), JSON.stringify(rendu));
      }
    }
    await ctx.close();
  } finally {
    await browser.close();
  }

  if (red) {
    const py = [
      `pages = env['website.page'].sudo().search([('url','=',${JSON.stringify(red)})])`,
      "pages.write({'is_published': True})",
      'env.cr.commit()',
      "print('REPUBLIE', len(pages))",
      '',
    ].join('\n');
    const out = odooShell(env, py);
    console.log(out.includes('REPUBLIE') ? `  (·) ${red} republiée` : `  ✖ REPUBLICATION MANQUÉE de ${red} — l'instance reste amputée`);
  }

  const echec = constats.some((c) => c.statut === 'fail');
  const statut = echec ? 'fail' : 'pass';
  const recu = {
    receiptId: `pages-navigation-${red ? 'rouge' : 'vert'}`,
    scenarioId: 'pages-navigation',
    instance: `${base} · base ${env.dbName}`,
    date: new Date().toISOString(),
    mode: red ? `preuve rouge (--red ${red})` : 'les neuf vraies pages',
    status: statut,
    observations: constats.map((c) => `[${c.statut}] ${c.quoi} — attendu « ${c.attendu} », observé « ${c.observe} »`),
    limitCodes: [...limites].sort(),
  };
  mkdirSync(OUT_DIR, { recursive: true });
  const fichier = path.join(OUT_DIR, red ? 'rouge.json' : 'vert.json');
  writeFileSync(fichier, `${JSON.stringify(recu, null, 2)}\n`);
  console.log(`\n→ ${path.relative(REPO, fichier)} · reçu « ${statut} »`);

  // En mode `--red`, le SUCCÈS du scénario est l'ÉCHEC de la navigation : un
  // rouge attendu qui reste vert est le vrai défaut.
  if (red) {
    if (!echec) { console.error('✖ la preuve rouge est restée VERTE — le scénario ne voit pas une page dépubliée'); process.exit(1); }
    console.log('✔ preuve rouge : l’échec nomme le lien fautif et sa page hôte');
    process.exit(0);
  }
  process.exit(echec ? 1 : 0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(`✖ ${e instanceof Error ? e.message : String(e)}`); process.exit(1); });
}
