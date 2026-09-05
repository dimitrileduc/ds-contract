/**
 * Preuve de la vague 033 : le téléphone et l'email du pied de page s'éditent
 * DANS LA PAGE, et l'édition survit à un déploiement.
 *
 * ── Pourquoi ce scénario existe ─────────────────────────────────────────────
 * La première version de 033 écrivait les deux lignes en dur dans le gabarit.
 * L'éditeur les rendait bien modifiables — mais le pied de page n'est pas un
 * bloc déposé, c'est un gabarit système : sauvegarder du balisage écrit en dur
 * sauvegarde L'ARCH DE LA VUE (`ir_ui_view.py:295`), que `odoo -u piqueray_ds`
 * recharge depuis le XML. L'édition du rédacteur aurait disparu au déploiement
 * suivant, sans un mot — et, d'après le code d'Odoo, la vue aurait été copiée
 * pour ce site au passage, gelant le pied hors d'atteinte de toute correction
 * future. Ce dernier point n'a pas été mesuré sur la version abandonnée : ce
 * que le constat 3 bis mesure, c'est que la version livrée ne provoque AUCUNE
 * copie.
 * Les deux lignes sont donc des `t-field` sur deux champs `Html` du modèle
 * `website`. Ce scénario ne se contente pas de le supposer : il regarde OÙ
 * l'édition a atterri.
 *
 * ── Les constats ────────────────────────────────────────────────────────────
 *   1. éditeur      — un clic sur l'ancre ouvre la fenêtre de lien NATIVE
 *   1 bis           — aucune barre de mise en forme sur ces zones
 *   2. sauvegarde   — l'appel de sauvegarde part et répond 2xx
 *   3. destination  — la valeur est dans le CHAMP du modèle…
 *   3 bis           — …et le gabarit du pied n'a PAS été copié pour ce site
 *   4. garde        — italique déplié, `javascript:` refusé, liens conservés
 *   5. déploiement  — après `-u piqueray_ds` + redémarrage, l'édition est là
 *
 * Le constat 3 bis est celui qui sépare la bonne solution de la mauvaise : les
 * deux ouvrent la fenêtre de lien, une seule ne gèle pas le pied de page.
 *
 * Le pied vit dans `website.layout` : il est sur TOUTES les pages. On mesure
 * donc sur une page du harnais plutôt que sur `/` — l'éditeur s'y ouvre de
 * façon fiable, ce que les scénarios voisins ont déjà établi.
 *
 * Emploi (instance JETABLE ; jamais celle de l'owner — voir AGENTS.md) :
 *   PQR_ODOO_PORT=8091 npx tsx integrations/odoo/qa/scenarios/footer-contact.spec.mts
 * Le scénario lève l'instance et l'installe lui-même (`withInstance`).
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { REPO } from '../lib/receipt.mts';
import { enterEditor } from '../lib/editor.mts';
import {
  COMPOSE, NAV_TIMEOUT_MS, attendreOdoo, baseUrl, compose, odooShell,
  ouvrirSessionEditeur, ouvrirSessionPublique, withInstance,
} from '../run.mts';

const SNAPSHOT = 'odoo-019-foundation';
const OUT = path.join(REPO, 'specs', '033-pied-de-page-contact', 'proofs', 'footer-contact.json');
/** N'importe quelle page du site porte le pied ; celle-ci est déjà servie par
 *  le harnais et l'éditeur s'y ouvre sans détour. */
const HARNESS_PATH = '/piqueray-harness/coordonnees';

/** L'insertion hostile : un lien légitime, un italique, une URL exécutable. La
 *  garde doit garder le premier et retirer les deux autres. */
const INSERTION =
  'Tél QA : <a href="tel:+3211111111">+32 (0)11 11 11 11</a>' +
  '<em>italique</em><a href="javascript:alert(1)">hostile</a>';

interface Constat { quoi: string; statut: 'pass' | 'fail'; attendu: string; observe: string }

const constats: Constat[] = [];
const note = (quoi: string, ok: boolean, attendu: string, observe: string): void => {
  constats.push({ quoi, statut: ok ? 'pass' : 'fail', attendu, observe });
  console.log(`  ${ok ? '✔' : '✖'} ${quoi} — attendu « ${attendu} », observé « ${observe} »`);
};

await withInstance(async ({ browser, env }) => {
  const base = baseUrl(env);
  let nonce = 0;

  /** Lit la colonne Contact sur la page PUBLIQUE : textes, destinations, et ce
   *  que la garde aurait dû retirer. */
  const lirePublic = async () => {
    const session = await ouvrirSessionPublique(browser);
    const page = await session.context.newPage();
    const reponse = await page.goto(`${base}${HARNESS_PATH}?pqr=footer-contact-${++nonce}`, {
      waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS,
    });
    const etat = JSON.parse(await page.evaluate(`(function(){
      var f = document.querySelector('[data-pqr-shell="footer"]');
      if (!f) return JSON.stringify({ present:false, lignes:0, textes:[], liens:[], balisesInterdites:-1, urlsExecutables:[] });
      var lignes = [].slice.call(f.querySelectorAll('[data-pqr-footer-contact]'));
      return JSON.stringify({
        present: true,
        lignes: lignes.length,
        textes: lignes.map(function(e){ return e.textContent.trim(); }),
        liens: [].map.call(f.querySelectorAll('[data-pqr-footer-contact] a'), function(a){ return a.getAttribute('href'); }),
        balisesInterdites: f.querySelectorAll('[data-pqr-footer-contact] em, [data-pqr-footer-contact] script, [data-pqr-footer-contact] strong').length,
        urlsExecutables: [].map.call(f.querySelectorAll('[href]'), function(n){ return n.getAttribute('href') || ''; })
          .filter(function(v){ return /^\\s*(javascript|data|vbscript):/i.test(v); })
      });
    })()`));
    await session.context.close();
    return { status: reponse?.status(), ...etat };
  };

  // ── 1 et 2 · l'éditeur : la fenêtre de lien, puis la sauvegarde ───────────
  const editeur = await ouvrirSessionEditeur(browser, env);
  try {
    const page = await editeur.context.newPage();
    const frame = await enterEditor(page, env, HARNESS_PATH);
    if (!frame) throw new Error(`l'éditeur ne s'est pas ouvert sur ${HARNESS_PATH}`);

    const ancreTel = frame.locator('[data-pqr-footer-contact="tel"] a').first();
    await ancreTel.scrollIntoViewIfNeeded();
    await ancreTel.click();
    await page.waitForTimeout(800);
    const popover = page.locator('.o-we-linkpopover');
    const popoverVisible = (await popover.count()) > 0 && (await popover.first().isVisible());
    const hrefAffiche = popoverVisible
      ? ((await popover.first().locator('a[href]').first().getAttribute('href').catch(() => null)) ?? '')
      : '';
    note('1 — un clic sur le lien ouvre la fenêtre de lien native',
      popoverVisible && hrefAffiche.startsWith('tel:'),
      'popover visible sur une destination tel:',
      popoverVisible ? `popover sur « ${hrefAffiche} »` : 'aucun popover');

    // La barre de mise en forme doit rester ÉTEINTE : la marque déclarée est
    // `link` seule, et offrir un bouton Gras que la sauvegarde annule est le
    // défaut que FOOTER_CONTACT_NO_FORMAT existe pour éviter.
    const boutonGras = page.locator('.o-we-toolbar button[name="bold"], .o-we-toolbar [data-command="formatBold"]');
    const grasOffert = (await boutonGras.count()) > 0 && (await boutonGras.first().isVisible().catch(() => false));
    note('1 bis — aucune barre de mise en forme sur la zone', !grasOffert,
      'pas de bouton Gras', grasOffert ? 'bouton Gras offert' : 'aucun bouton de format');

    const zoneTel = frame.locator('[data-pqr-footer-contact="tel"]').first();
    await zoneTel.evaluate((node, html) => {
      const cible = node as HTMLElement;
      cible.focus();
      const range = document.createRange();
      range.selectNodeContents(cible);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      document.execCommand('insertHTML', false, html as string);
    }, INSERTION);
    await page.waitForTimeout(400);

    const sauver = page.locator('.o-snippets-top-actions button[data-action="save"]').first();
    const attenduRpc = page
      .waitForResponse((r) => r.url().includes('/web/dataset/call_kw/ir.ui.view/save'), { timeout: 60_000 })
      .catch(() => null);
    await sauver.click();
    const rpc = await attenduRpc;
    note('2 — la sauvegarde part et répond 2xx', rpc !== null && rpc.ok(),
      'RPC save 2xx', rpc ? `HTTP ${rpc.status()}` : 'aucun RPC');
    await page.waitForTimeout(2000);
  } finally {
    await editeur.context.close();
  }

  // ── 3 · OÙ l'édition a-t-elle atterri ? ──────────────────────────────────
  // Le champ du modèle doit porter la valeur, ET le gabarit du pied ne doit PAS
  // avoir été recopié pour ce site : le copy-on-write d'Odoo fige la vue et lui
  // fait rater toute correction ultérieure du gabarit.
  const py = [
    "site = env['website'].sudo().search([], limit=1)",
    "print('CHAMP=' + (site.x_pqr_footer_tel or '').replace('\\n', ' '))",
    "vues = env['ir.ui.view'].sudo().search([('key', '=', 'piqueray_ds.template_footer_piqueray')])",
    "print('VUES=' + str(len(vues)) + ' COW=' + str(len(vues.filtered(lambda v: v.website_id))))",
    '',
  ].join('\n');
  const sortie = odooShell(env, py);
  const champ = (/CHAMP=(.*)/.exec(sortie) ?? [])[1] ?? '';
  const compteVues = /VUES=(\d+) COW=(\d+)/.exec(sortie);
  note("3 — l'édition est dans le CHAMP du modèle", champ.includes('Tél QA'),
    'le champ contient « Tél QA »', champ.slice(0, 80) || '(vide)');
  note('3 bis — le gabarit du pied n’a pas été copié pour ce site',
    compteVues?.[2] === '0', 'copies site-spécifiques : 0',
    `copies : ${compteVues?.[2] ?? '?'} (vues : ${compteVues?.[1] ?? '?'})`);

  // ── 4 · la garde, vue depuis la page publique ────────────────────────────
  const apresSave = await lirePublic();
  note('4 — liens conservés, italique déplié, URL exécutable refusée',
    apresSave.present === true && apresSave.balisesInterdites === 0 &&
    apresSave.urlsExecutables.length === 0 &&
    apresSave.liens.some((h: string) => h?.startsWith('tel:')),
    '0 balise interdite · 0 URL exécutable · au moins un lien tel:',
    JSON.stringify({ interdites: apresSave.balisesInterdites, executables: apresSave.urlsExecutables, liens: apresSave.liens }));
  note('4 bis — la colonne rend toujours DEUX lignes', apresSave.lignes === 2,
    '2 lignes', String(apresSave.lignes));

  // ── 5 · le déploiement ───────────────────────────────────────────────────
  compose(['stop', 'odoo']);
  const maj = spawnSync('docker', [
    'compose', '-f', COMPOSE, 'run', '--rm', 'odoo', 'odoo',
    '-d', env.dbName, '-u', 'piqueray_ds', '--db_host=db',
    '--stop-after-init', '--log-level=warn',
  ], { cwd: REPO, encoding: 'utf8', timeout: 300_000 });
  note('5 — mise à jour du module : exit 0', (maj.status ?? -1) === 0, 'exit 0', `exit ${maj.status ?? -1}`);
  compose(['start', 'odoo']);
  const debout = await attendreOdoo(env);
  note('5 bis — Odoo repart', debout, 'healthcheck OK', debout ? 'OK' : 'timeout');

  const apresMaj = await lirePublic();
  note("5 ter — l'édition du rédacteur SURVIT au déploiement",
    apresMaj.textes?.some((t: string) => t.includes('Tél QA')) === true,
    'la ligne contient toujours « Tél QA »', JSON.stringify(apresMaj.textes));
  note('5 quater — les destinations survivent aussi',
    JSON.stringify(apresMaj.liens) === JSON.stringify(apresSave.liens),
    JSON.stringify(apresSave.liens), JSON.stringify(apresMaj.liens));
});

const echec = constats.some((c) => c.statut === 'fail');
mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify({
  receiptId: `footer-contact-${SNAPSHOT}`,
  scenarioId: 'footer-contact',
  snapshotId: SNAPSHOT,
  status: echec ? 'fail' : 'pass',
  fixture: 'insertion hostile dans la ligne téléphone du pied',
  observations: constats.map((c) => `[${c.statut}] ${c.quoi} — attendu « ${c.attendu} », observé « ${c.observe} »`),
  artifacts: [],
  limitCodes: [],
}, null, 2)}\n`);
console.log(`\n${echec ? '✖ ÉCHEC' : '✔ PASS'} — ${path.relative(REPO, OUT)}`);
process.exit(echec ? 1 : 0);
