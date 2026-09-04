/**
 * Vague 032 — mesure des états du Bouton sur la page Odoo VIVE.
 *
 * Sert US1 (T032–T036, T036b) et US2 (T038–T041). Il ne LIT pas le CSS généré :
 * il relève la valeur **calculée** par le navigateur et, quand elle n'est pas
 * celle du contrat, il NOMME la règle gagnante en parcourant
 * `document.styleSheets` et en testant `el.matches(rule.selectorText)`.
 *
 * C'est la leçon que `oceanic-oak-f2` a payée sur sa vague : une règle Odoo peut
 * battre une classe de part sans que rien ne le signale, et le CSS généré a
 * alors l'air juste alors que la page ment.
 *
 * Emploi :
 *   npx tsx specs/032-etats-bouton/tools/mesure-etats.mts --url <url> --out <dir>
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { type Page } from 'playwright-core';
import { launchBrowser } from '../../../extract/figma/visual-parity/render.js';

const VIEWPORT = { width: 1440, height: 900 } as const;

interface Sample {
  index: number;
  variant: string;
  label: string;
  tag: string;
  section: string;
  /** false = bouton du menu mobile, masqué à cette largeur : relevé mais non survolé. */
  visible: boolean;
  rest: Channels;
  hover: Channels;
  active: Channels;
  focus: Channels;
  /** Règles qui revendiquent `color` sur cet élément, dans l'ordre du cascade,
   *  avec leur spécificité — remplies seulement quand une valeur surprend. */
  colorRules?: RuleHit[];
}
interface Channels {
  color: string;
  backgroundColor: string;
  outlineStyle: string;
  outlineWidth: string;
  outlineColor: string;
  outlineOffset: string;
}
interface RuleHit {
  selector: string;
  specificity: [number, number, number];
  color: string;
  sheet: string;
}

/** Spécificité CSS (a,b,c) — suffisant pour les sélecteurs de ce dépôt :
 *  pas de `:is()`/`:where()` imbriqués, `:not(X)` prend la spécificité de X. */
function specificityOf(sel: string): [number, number, number] {
  let s = sel.replace(/:not\(([^)]*)\)/g, ' $1 ');
  const ids = (s.match(/#[\w-]+/g) ?? []).length;
  const classes =
    (s.match(/\.[\w-]+/g) ?? []).length +
    (s.match(/\[[^\]]+\]/g) ?? []).length +
    (s.match(/:(?!:)[\w-]+/g) ?? []).length;
  const elements =
    (s.match(/(^|[\s>+~])([a-z][\w-]*)/gi) ?? []).length +
    (s.match(/::[\w-]+/g) ?? []).length;
  return [ids, classes, elements];
}

const READ = `(el) => {
  const cs = getComputedStyle(el);
  return {
    color: cs.color,
    backgroundColor: cs.backgroundColor,
    outlineStyle: cs.outlineStyle,
    outlineWidth: cs.outlineWidth,
    outlineColor: cs.outlineColor,
    outlineOffset: cs.outlineOffset,
  };
}`;

async function readChannels(page: Page, index: number): Promise<Channels> {
  return page.evaluate(
    `(${READ})(document.querySelectorAll('.button')[${index}])`,
  ) as Promise<Channels>;
}

/** Les règles qui revendiquent `color` sur cet élément AU SURVOL, dans l'ordre
 *  de source. Fixé sur `:hover` : c'est le seul état dont l'attribution ait
 *  besoin d'être nommée, et un paramètre à valeur unique laissait croire que
 *  l'instrument savait aussi nommer la règle gagnante au repos — il ne le fait
 *  pas, et le registre de travail différé le désigne comme point de départ. */
async function colorRules(page: Page, index: number): Promise<RuleHit[]> {
  const raw = (await page.evaluate(`(() => {
    const el = document.querySelectorAll('.button')[${index}];
    const pseudo = ':hover';
    const hits = [];
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules; } catch { continue; }
      if (!rules) continue;
      const walk = (list) => {
        for (const r of list) {
          if (r.cssRules && !r.selectorText) { walk(r.cssRules); continue; }
          if (!r.selectorText) continue;
          for (const one of r.selectorText.split(',')) {
            const sel = one.trim();
            // On teste le sélecteur PRIVÉ de la pseudo-classe d'état : le
            // navigateur ne peut pas matcher :hover sans pointeur réel.
            const probe = sel.split(pseudo).join('');
            if (!probe) continue;
            let ok = false;
            try { ok = el.matches(probe); } catch { ok = false; }
            if (!ok) continue;
            if (!sel.includes(pseudo)) continue;
            const color = r.style && r.style.getPropertyValue('color');
            if (!color) continue;
            hits.push({ selector: sel, color: color.trim(),
                        sheet: (sheet.href || 'inline').split('/').pop() });
          }
        }
      };
      walk(rules);
    }
    return hits;
  })()`)) as Array<{ selector: string; color: string; sheet: string }>;
  return raw.map((h) => ({ ...h, specificity: specificityOf(h.selector) }));
}

function parseArgs(argv: string[]): { url: string; out: string } {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    if (i === -1 || !argv[i + 1]) throw new Error(`manque ${flag}`);
    return argv[i + 1];
  };
  return { url: get('--url'), out: path.resolve(get('--out')) };
}

async function main(): Promise<void> {
  const { url, out } = parseArgs(process.argv.slice(2));
  mkdirSync(out, { recursive: true });
  mkdirSync(path.join(out, 'survol'), { recursive: true });
  mkdirSync(path.join(out, 'presse'), { recursive: true });
  mkdirSync(path.join(out, 'focus'), { recursive: true });

  const { browser, version, executablePath } = await launchBrowser();
  const page = await browser.newPage({ viewport: { ...VIEWPORT }, deviceScaleFactor: 2 });
  const reponse = await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 });

  // REFUSER une page d'erreur AVANT de la mesurer — même discipline que
  // `integrations/odoo/qa/visual/capture-odoo.mts:45-68`, et pour la même
  // raison : une 404 d'Odoo est une page valide, `.button` y rend une liste
  // vide, et l'outil écrirait « 0 boutons mesurés » en sortant à 0. Un reçu de
  // preuve VIDE se lit comme une mesure. Le refus est nommé, jamais déduit.
  const statut = reponse?.status();
  if (statut !== 200) {
    throw new Error(`${url} répond HTTP ${statut ?? '(aucune réponse)'} — refus de mesurer une page d'erreur.`);
  }
  const nbBoutons = await page.evaluate("document.querySelectorAll('.button').length") as number;
  if (nbBoutons === 0) {
    throw new Error(
      `${url} est servie mais ne porte AUCUN élément .button — module non rechargé, page non recomposée, ou gabarit renommé. Refus de produire un relevé vide.`,
    );
  }
  await page.evaluate('Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,5000))])');

  // Les boutons de la page sont des ANCRES (components.xml:157 bascule sur <a>
  // dès qu'un link_href est posé). Relâcher le clic navigue et détruit le
  // contexte d'exécution au milieu de la mesure. On neutralise la navigation en
  // phase de capture : `:active` s'applique quand même — c'est un état de
  // présentation, pas une conséquence du défaut — mais la page ne bouge plus.
  await page.evaluate(`
    document.addEventListener('click', (e) => { e.preventDefault(); }, true);
    window.addEventListener('beforeunload', (e) => { e.preventDefault(); }, true);
  `);

  const meta = (await page.evaluate(`Array.from(document.querySelectorAll('.button')).map((el, i) => {
    const cls = Array.from(el.classList).find((c) => c.startsWith('button--variant-'));
    const sec = el.closest('section');
    return {
      index: i,
      variant: cls ? cls.replace('button--variant-', '') : '(sans)',
      label: (el.textContent || '').trim().slice(0, 40),
      tag: el.tagName.toLowerCase(),
      section: sec ? (sec.getAttribute('data-ds-contract') || sec.className.split(' ')[0]) : '(hors section)',
    };
  })`)) as Array<Omit<Sample, 'rest' | 'hover' | 'active' | 'focus' | 'visible'>>;

  const samples: Sample[] = [];
  for (const m of meta) {
    const sel = `.button >> nth=${m.index}`;
    const el = page.locator(sel);
    // Une partie des boutons appartient au menu MOBILE et reste masquée à cette
    // largeur. Ils sont relevés quand même (leurs couleurs calculées restent
    // lisibles) mais NON survolés : un pointeur ne peut pas atteindre une boîte
    // de taille nulle, et forcer produirait une attente de 30 s puis un échec.
    const visible = await el.isVisible().catch(() => false);
    if (visible) await el.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});

    await page.mouse.move(0, 0);
    await page.evaluate('document.activeElement && document.activeElement.blur()');
    const rest = await readChannels(page, m.index);

    const box = visible ? await el.boundingBox() : null;
    if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const hover = await readChannels(page, m.index);
    if (visible) await el.screenshot({ path: path.join(out, 'survol', `${m.index}-${m.variant}.png`), timeout: 5000 }).catch(() => {});

    if (box) await page.mouse.down();
    const active = await readChannels(page, m.index);
    if (visible) await el.screenshot({ path: path.join(out, 'presse', `${m.index}-${m.variant}.png`), timeout: 5000 }).catch(() => {});
    if (box) await page.mouse.up();

    await page.mouse.move(0, 0);
    // Focus CLAVIER. Chromium n'arme `:focus-visible` que si la dernière
    // interaction était au CLAVIER : un `.focus()` posé juste après un geste
    // souris hérite de la modalité pointeur et ne montre aucun anneau — ce qui
    // ferait conclure à tort que le focus ne marche pas. On repasse donc en
    // modalité clavier par une frappe réelle AVANT de focaliser.
    await page.keyboard.press('Tab');
    await page.evaluate(`document.querySelectorAll('.button')[${m.index}].focus()`);
    const focus = await readChannels(page, m.index);
    if (visible) await el.screenshot({ path: path.join(out, 'focus', `${m.index}-${m.variant}.png`), timeout: 5000 }).catch(() => {});
    await page.evaluate('document.activeElement && document.activeElement.blur()');

    const s: Sample = { ...m, visible, rest, hover, active, focus };
    // Si le libellé ne change pas au survol alors que le fond change, il y a
    // vraisemblablement une règle qui gagne — on la nomme.
    if (visible && hover.color === rest.color && hover.backgroundColor !== rest.backgroundColor) {
      s.colorRules = await colorRules(page, m.index);
    }
    samples.push(s);
  }

  await page.screenshot({ path: path.join(out, 'page-entiere.png'), fullPage: true });
  await browser.close();

  writeFileSync(
    path.join(out, 'mesures.json'),
    `${JSON.stringify(
      { url, viewport: VIEWPORT, chromium: { executablePath, version }, generatedAt: new Date().toISOString(), samples },
      null,
      2,
    )}\n`,
  );

  const byVariant = new Map<string, number>();
  for (const s of samples) byVariant.set(s.variant, (byVariant.get(s.variant) ?? 0) + 1);
  console.log(`${samples.length} boutons mesurés sur ${byVariant.size} styles`);
  for (const [v, n] of [...byVariant].sort()) console.log(`  ${v.padEnd(14)} ${n}`);
  const caches = samples.filter((s) => !s.visible);
  if (caches.length) console.log(`\n${caches.length} bouton(s) masques a cette largeur (menu mobile) — releves, non survoles`);
  const suspects = samples.filter((s) => s.colorRules?.length);
  console.log(suspects.length ? `\n⚠ ${suspects.length} bouton(s) dont le libellé ne bouge pas au survol` : '\nAucun libellé figé au survol');
  console.log(`→ ${path.relative(process.cwd(), out)}`);
}

await main();
