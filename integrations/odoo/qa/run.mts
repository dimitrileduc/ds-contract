/**
 * L'orchestrateur QA : lève l'instance jetable, remet la base à zéro, installe
 * l'addon, ouvre une session rédacteur et une vue publique anonyme, collecte
 * console et réseau. Spec 019, tâche T016.
 *
 * ── Ce que « jetable » veut dire, et pourquoi c'est un invariant ────────────
 * La base est DÉTRUITE puis recréée à chaque cycle. Une preuve produite sur une
 * base réutilisée ne prouve rien : elle peut dépendre d'un état laissé par un
 * essai précédent. C'est la différence entre « ça marche chez moi » et un reçu.
 *
 * ── Deux pièges Odoo, tous deux mesurés en 018 ──────────────────────────────
 * 1. Une capture faite en session `admin` porte la barre de backoffice : la mise
 *    en page n'est plus celle du visiteur. Le contexte public est donc NEUF et
 *    sans cookie.
 * 2. Le client web garde une connexion longue ouverte : `waitUntil:'networkidle'`
 *    peut ne jamais rendre la main. On attend `domcontentloaded` puis on borne.
 *
 * Usage (bibliothèque) :
 *   import { withInstance } from './run.mts'
 * Usage (CLI de fumée) :
 *   npx tsx integrations/odoo/qa/run.mts --up
 *   npx tsx integrations/odoo/qa/run.mts --smoke
 *   npx tsx integrations/odoo/qa/run.mts --down
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Browser, BrowserContext, ConsoleMessage } from 'playwright-core';
import { launchBrowser } from '../../../extract/figma/visual-parity/render.js';
import { REPO } from './lib/receipt.mts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const COMPOSE = path.join(HERE, 'compose.yaml');
const ENV_FILE = path.join(HERE, '.env');
const ENV_EXAMPLE = path.join(HERE, '.env.example');

export const NAV_TIMEOUT_MS = 60_000;
/** Odoo compile ses bundles au premier chargement de l'éditeur : large, mais borné. */
export const EDITOR_TIMEOUT_MS = 120_000;

// ---------------------------------------------------------------------------
// Environnement
// ---------------------------------------------------------------------------

export interface QaEnv {
  odooPort: string;
  dbName: string;
  /** Compte d'ADMINISTRATION : ne sert qu'à provisionner. Aucun scénario ne
   *  mesure quoi que ce soit sous ce compte. */
  adminLogin: string;
  adminPassword: string;
  /** Le RÉDACTEUR WEBSITE, membre de `website.group_website_designer` mais
   *  jamais administrateur. Odoo 19 ne donne aucun droit d'écriture sur
   *  `website.page` au seul `group_website_restricted_editor` : ce rôle peut
   *  ouvrir le chrome, mais la page est rendue sans branding sauvegardable.
   *  `Editor and Designer` est donc le rôle standard pertinent pour des blocs
   *  Website ; mesurer sous admin contournerait encore trop de portes. */
  editorLogin: string;
  editorPassword: string;
}

/** Lit `.env`, en repli sur `.env.example`. Le repli est DIT : travailler sur les
 *  valeurs d'exemple sans le savoir produit des reçus qu'on croit paramétrés. */
export function readQaEnv(): QaEnv {
  const src = existsSync(ENV_FILE) ? ENV_FILE : ENV_EXAMPLE;
  if (src === ENV_EXAMPLE) {
    console.log(`  (·) ${path.basename(ENV_FILE)} absent — valeurs de ${path.basename(ENV_EXAMPLE)} utilisées`);
  }
  const vars = new Map<string, string>();
  for (const ligne of readFileSync(src, 'utf8').split('\n')) {
    const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(ligne.trim());
    if (m) vars.set(m[1], m[2]);
  }
  return {
    // Les variables de PROCESSUS priment sur le fichier — même précédence que
    // l'interpolation de docker compose (shell > --env-file). C'est ce qui
    // permet à plusieurs vagues de qualification simultanées de s'isoler
    // (COMPOSE_PROJECT_NAME + PQR_ODOO_PORT propres) sans se disputer le
    // fichier `.env` partagé. Constaté le 2026-08-12 : trois sections portées
    // en parallèle visaient la même base jetable.
    odooPort: process.env.PQR_ODOO_PORT ?? vars.get('PQR_ODOO_PORT') ?? '8069',
    dbName: process.env.PQR_DB_NAME ?? vars.get('PQR_DB_NAME') ?? 'piqueray_qa',
    // Une base créée par la CLI Odoo sans données de démo ouvre sur admin/admin.
    adminLogin: 'admin',
    adminPassword: 'admin',
    editorLogin: vars.get('PQR_EDITOR_LOGIN') ?? 'editor@example.test',
    editorPassword: vars.get('PQR_EDITOR_PASSWORD') ?? 'editor',
  };
}

export const baseUrl = (env: QaEnv) => `http://localhost:${env.odooPort}`;

/** Le rôle PostgreSQL de l'instance. Lu à la même source que le reste. */
export function readQaEnvUser(): string {
  const src = existsSync(ENV_FILE) ? ENV_FILE : ENV_EXAMPLE;
  return /^PQR_DB_USER=(.*)$/m.exec(readFileSync(src, 'utf8'))?.[1]?.trim() || 'odoo';
}

// ---------------------------------------------------------------------------
// Docker
// ---------------------------------------------------------------------------

export interface CmdResult { status: number; out: string }

export function compose(args: string[], timeoutMs = 600_000): CmdResult {
  const envArgs = existsSync(ENV_FILE) ? ['--env-file', ENV_FILE] : [];
  const r = spawnSync('docker', ['compose', '-f', COMPOSE, ...envArgs, ...args], {
    cwd: REPO,
    encoding: 'utf8',
    timeout: timeoutMs,
  });
  return { status: r.status ?? -1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

export function dockerDisponible(): string | null {
  const r = spawnSync('docker', ['info', '--format', '{{.ServerVersion}}'], { encoding: 'utf8', timeout: 30_000 });
  if (r.status !== 0) return null;
  return (r.stdout ?? '').trim();
}

/** Attend que le service `odoo` réponde. Borné : un healthcheck qui ne vire
 *  jamais au vert doit rendre la main avec un message, pas figer la QA. */
export async function attendreOdoo(env: QaEnv, timeoutMs = 240_000): Promise<boolean> {
  const fin = Number(process.hrtime.bigint() / 1_000_000n) + timeoutMs;
  for (;;) {
    const r = spawnSync('curl', ['-fsS', '-o', '/dev/null', '-w', '%{http_code}', `${baseUrl(env)}/web/health`], {
      encoding: 'utf8',
      timeout: 15_000,
    });
    if (r.status === 0) return true;
    if (Number(process.hrtime.bigint() / 1_000_000n) > fin) return false;
    await new Promise((res) => setTimeout(res, 3000));
  }
}

/** Base propre + installation de l'addon, en une passe non interactive.
 *
 *  Le DROP passe par le service `db`, pas par `odoo` : l'image Odoo n'embarque
 *  pas `psql`. Écrit d'abord côté `odoo`, ce geste échouait en silence — le
 *  `|| true` avalait l'erreur — et la « base propre » aurait été la base de la
 *  veille, ce qui est exactement ce qu'une instance jetable existe pour éviter. */
export function installerAddon(env: QaEnv): CmdResult {
  const user = readQaEnvUser();
  const dropped = compose([
    'exec', '-T', 'db',
    'psql', '-U', user, '-d', 'postgres',
    '-c', `DROP DATABASE IF EXISTS ${env.dbName} WITH (FORCE);`,
  ]);
  if (dropped.status !== 0) {
    // Un DROP en échec n'est pas une broutille : il décide si la preuve porte
    // sur une base neuve ou sur un résidu.
    return { status: dropped.status, out: `DROP DATABASE a échoué — la base ne serait pas propre :\n${dropped.out}` };
  }
  const install = compose([
    'run', '--rm', 'odoo',
    // Les DEUX addons : le produit, et le banc de qualification qui n'est
    // jamais livré. Les séparer au manifeste ne sert à rien si la QA n'installe
    // que le premier — elle n'aurait alors aucune page à mesurer.
    'odoo', '-d', env.dbName, '-i', 'piqueray_ds,piqueray_ds_qa',
    '--db_host=db', '--without-demo=True', '--stop-after-init', '--log-level=warn',
  ]);
  return { status: install.status, out: `${dropped.out}\n${install.out}` };
}

// ---------------------------------------------------------------------------
// Navigateur
// ---------------------------------------------------------------------------

export interface Journal {
  console: string[];
  reseau: string[];
}

/** Branche la collecte console/réseau sur un contexte. Les erreurs JS d'Odoo
 *  sont la première cause de scénario faussement vert : la page « marche » et
 *  une option ne s'est jamais chargée. */
export function collecter(context: BrowserContext, journal: Journal): void {
  context.on('console', (m: ConsoleMessage) => {
    if (m.type() === 'error' || m.type() === 'warning') journal.console.push(`[${m.type()}] ${m.text()}`);
  });
  context.on('response', (r) => {
    if (r.status() >= 400) journal.reseau.push(`${r.status()} ${r.url()}`);
  });
}

/**
 * Provisionne le RÉDACTEUR sur la base fraîche, via le shell Odoo.
 *
 * Il est membre de `website.group_website_designer` — le rôle Odoo standard qui
 * peut réellement modifier une `website.page` — et **pas** de
 * `base.group_system`. Le seul `group_website_restricted_editor` ne suffit pas :
 * sans ACL métier additionnelle, Odoo ouvre le chrome mais ne pose ni
 * `data-oe-*` ni racine sauvegardable. Mesuré le 2026-08-08.
 */
export function creerRedacteur(env: QaEnv): CmdResult {
  const script = [
    "editor_group = env.ref('website.group_website_designer')",
    "internal = env.ref('base.group_user')",
    `existing = env['res.users'].sudo().search([('login', '=', ${JSON.stringify(env.editorLogin)})], limit=1)`,
    'if not existing:',
    "    u = env['res.users'].sudo().create({",
    "        'name': 'Rédacteur QA',",
    `        'login': ${JSON.stringify(env.editorLogin)},`,
    `        'password': ${JSON.stringify(env.editorPassword)},`,
    "        'group_ids': [(6, 0, [internal.id, editor_group.id])],",
    '    })',
    'else:',
    '    u = existing',
    `    u.write({'password': ${JSON.stringify(env.editorPassword)}, 'group_ids': [(6, 0, [internal.id, editor_group.id])]})`,
    // Contrôle EXPLICITE : si le compte finissait administrateur, tous les
    // scénarios d'autorisation deviendraient faussement verts en silence.
    "assert not u.has_group('base.group_system'), 'le rédacteur QA est administrateur — refus'",
    "assert u.has_group('website.group_website_designer'), 'le rédacteur QA n\\'est pas Editor and Designer'",
    "assert u.has_group('website.group_website_restricted_editor'), 'le rôle designer n\\'implique plus restricted editor'",
    'env.cr.commit()',
    "print('REDACTEUR_OK', u.login, u.id)",
    '',
  ].join('\n');
  const r = spawnSync(
    'docker',
    ['compose', '-f', COMPOSE, ...(existsSync(ENV_FILE) ? ['--env-file', ENV_FILE] : []),
      'run', '--rm', '-T', 'odoo', 'odoo', 'shell', '-d', env.dbName, '--db_host=db', '--log-level=warn', '--no-http'],
    { cwd: REPO, encoding: 'utf8', input: script, timeout: 300_000 },
  );
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  if (!out.includes('REDACTEUR_OK')) {
    return { status: r.status === 0 ? 1 : (r.status ?? -1), out: `Création du rédacteur en échec :\n${out.slice(-3000)}` };
  }
  return { status: 0, out };
}

/** Session RÉDACTEUR — jamais administrateur. Odoo 19 sert son formulaire sur
 *  `/web/login`. */
export async function ouvrirSessionEditeur(browser: Browser, env: QaEnv): Promise<{ context: BrowserContext; journal: Journal }> {
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, colorScheme: 'light' });
  const journal: Journal = { console: [], reseau: [] };
  collecter(context, journal);
  const page = await context.newPage();
  await page.goto(`${baseUrl(env)}/web/login`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
  await page.fill('input[name="login"]', env.editorLogin);
  await page.fill('input[name="password"]', env.editorPassword);
  // Le bouton doit être cherché DANS le formulaire de connexion. `/web/login`
  // est rendu avec le layout du site : un `button[type="submit"]` global
  // résolvait vers trois éléments, dont le bouton de recherche du thème —
  // invisible, donc le clic expirait au bout de 30 s sur une page pourtant
  // saine. Mesuré le 2026-08-08.
  const soumettre = page.locator('form[action="/web/login"] button[type="submit"]').first();
  await soumettre.waitFor({ state: 'visible', timeout: NAV_TIMEOUT_MS });
  await Promise.all([page.waitForLoadState('domcontentloaded'), soumettre.click()]);
  // Vérifier que la session existe VRAIMENT : un mot de passe refusé renvoie
  // /web/login avec un message, et la suite du scénario mesurerait alors un
  // visiteur anonyme en croyant mesurer un rédacteur.
  const url = page.url();
  if (/\/web\/login/.test(url)) {
    const erreur = await page.locator('.alert-danger, .o_login_error').first().textContent().catch(() => null);
    throw new Error(`Connexion refusée (${env.editorLogin}) — toujours sur ${url}${erreur ? ` : ${erreur.trim()}` : ''}`);
  }
  await page.close();
  return { context, journal };
}

/** Contexte PUBLIC : neuf, sans cookie, donc sans barre de backoffice. */
export async function ouvrirSessionPublique(browser: Browser): Promise<{ context: BrowserContext; journal: Journal }> {
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, colorScheme: 'light' });
  const journal: Journal = { console: [], reseau: [] };
  collecter(context, journal);
  return { context, journal };
}

export interface Instance {
  env: QaEnv;
  browser: Browser;
  chromium: string;
}

/**
 * Lève l'instance, installe l'addon, ouvre un navigateur, exécute `fn`, puis
 * ferme le navigateur. L'instance Docker reste debout : la relever coûte des
 * minutes, et les scénarios s'enchaînent.
 */
export async function withInstance<T>(fn: (i: Instance) => Promise<T>): Promise<T> {
  const env = readQaEnv();
  const version = dockerDisponible();
  if (!version) throw new Error('Docker ne répond pas — `docker info` en échec.');
  console.log(`  Docker ${version} · base ${env.dbName} · ${baseUrl(env)}`);

  const up = compose(['up', '-d', 'db', 'odoo']);
  if (up.status !== 0) throw new Error(`docker compose up a échoué :\n${up.out}`);
  if (!(await attendreOdoo(env))) throw new Error(`Odoo ne répond pas sur ${baseUrl(env)}/web/health`);

  const inst = installerAddon(env);
  if (inst.status !== 0) throw new Error(`Installation de piqueray_ds en échec :\n${inst.out.slice(-4000)}`);
  console.log('  addons piqueray_ds + piqueray_ds_qa installés sur une base neuve');

  const red = creerRedacteur(env);
  if (red.status !== 0) throw new Error(red.out);
  console.log(`  rédacteur ${env.editorLogin} provisionné (Editor and Designer, PAS administrateur)`);

  // Le serveur long doit repartir sur la base fraîchement créée.
  compose(['restart', 'odoo']);
  if (!(await attendreOdoo(env))) throw new Error('Odoo ne répond plus après redémarrage');

  const { browser, version: chromium } = await launchBrowser();
  try {
    return await fn({ env, browser, chromium });
  } finally {
    await browser.close();
  }
}

// ---------------------------------------------------------------------------
// CLI de fumée
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const env = readQaEnv();
  if (args.includes('--down')) {
    const r = compose(['down', '-v']);
    console.log(r.out.trim() || '(instance arrêtée)');
    return;
  }
  if (args.includes('--up')) {
    const r = compose(['up', '-d', 'db', 'odoo']);
    if (r.status !== 0) throw new Error(r.out);
    console.log((await attendreOdoo(env)) ? `Odoo répond sur ${baseUrl(env)}` : 'Odoo ne répond pas');
    return;
  }
  if (args.includes('--smoke')) {
    await withInstance(async ({ browser, env: e, chromium }) => {
      console.log(`  Chromium ${chromium}`);
      const { context, journal } = await ouvrirSessionPublique(browser);
      const page = await context.newPage();
      const res = await page.goto(`${baseUrl(e)}/piqueray-harness/editability-boundary`, {
        waitUntil: 'domcontentloaded',
        timeout: NAV_TIMEOUT_MS,
      });
      console.log(`  page de banc : HTTP ${res?.status()}`);
      console.log(`  racines trouvées : ${await page.locator('.s_pqr_presentation').count()}`);
      console.log(`  erreurs console : ${journal.console.length} · réponses ≥400 : ${journal.reseau.length}`);
      for (const l of journal.console.slice(0, 5)) console.log(`    ${l}`);
      await context.close();
    });
    return;
  }
  throw new Error('Usage : --up | --smoke | --down');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => {
    console.error(`✖ ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  });
}
