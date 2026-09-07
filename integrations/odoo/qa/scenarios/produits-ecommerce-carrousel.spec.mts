/**
 * Qualification du CARROUSEL Produits e-commerce (vague 034) — écrit ROUGE avant
 * le mécanisme, rejoué VERT après, sur la même page et la même instance.
 *
 * Ce que le scénario prouve, chez le visiteur, aux quatre largeurs témoins :
 *   · le cadre est un VRAI conteneur de défilement horizontal (overflow-x auto,
 *     scroll-snap posé, la molette horizontale le fait bouger — un cadre
 *     `overflow: hidden` refuse la molette, c'est ce qui rend ce constat rouge
 *     sur le code 2.1.0 ; `scrollWidth > clientWidth` et `scrollLeft = …` sont
 *     vrais même en hidden et ne prouvent donc RIEN) ;
 *   · les boutons Précédent/Suivant déplacent la piste d'UNE carte (largeur de
 *     carte + écart calculé, jamais un nombre en dur), sont masqués sous 992 et
 *     portent `aria-disabled` aux deux bouts ;
 *   · l'ARIA de carrousel (région nommée, cartes nommées « Titre, prix — produit
 *     n sur N » SANS role — elles restent des liens, piste focalisable pour Safari)
 *     est servie ;
 *   · `prefers-reduced-motion: reduce` rend le déplacement instantané ;
 *   · le focus clavier sur la dernière carte fait défiler le cadre et la montre
 *     entière.
 * Et chez le rédacteur : la section et une carte restent sélectionnables, une
 * frappe réelle passe, le save passe, la relecture publique porte l'ARIA.
 *
 * Le glissement TACTILE n'est pas simulé (Playwright headless ne sait que
 * `tap`) : constat sauté sous `L-034-TOUCH`, registre DW-034-003.
 *
 * Deux modes : `withInstance` (base neuve, rejeu de release) ; `PQR_QA_REUSE=1`
 * (instance déjà levée, cycle rouge → vert). `PQR_PHASE=rouge|vert` nomme le
 * dossier de preuves sous specs/tiny/proofs/vague-034-carrousel-produits/ — le
 * reçu y est écrit DIRECTEMENT, pas dans le dossier 019 que le manifeste de
 * qualification ramasse (ses codes de limite y feraient basculer la release).
 * Effet de bord connu : la phase éditeur SAUVE la page du banc, qui devient un
 * HTML figé ; en mode réutilisé, un second passage mesure ce HTML-là.
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BrowserContext, Page } from 'playwright-core';
import { REPO, Recueil } from '../lib/receipt.mts';
import { enterEditor, frapperAuClicHumain, select, visibleCount } from '../lib/editor.mts';
import {
  NAV_TIMEOUT_MS,
  baseUrl,
  dockerDisponible,
  ouvrirSessionEditeur,
  ouvrirSessionPublique,
  withInstance,
  withInstanceExistante,
  type Instance,
  type QaEnv,
} from '../run.mts';

const ROOT = '.s_pqr_produits_ecommerce';
const CADRE = '.produits-ecommerce__carrouselProduits';
const PISTE = '.produits-ecommerce__Produits';
const CARTE = '.product-card';
const PREV = '[data-pqr-part="carousel-previous"]';
const NEXT = '[data-pqr-part="carousel-next"]';
const HARNESS_PATH = '/piqueray-harness/produits-ecommerce';
const MODULE = '@piqueray_ds/js/produits_ecommerce_carrousel_interaction';
/** Les quatre étages du contrat : Mobile (base), Tablette ≥768, Desktop ≥992, Wide ≥1400. */
const LARGEURS = [390, 768, 1200, 1728] as const;
const PHASE = process.env.PQR_PHASE ?? 'run';
const PROOFS_034 = path.join(REPO, 'specs', 'tiny', 'proofs', 'vague-034-carrousel-produits', PHASE);

interface Releve {
  largeur: number;
  cadre: { overflowX: string; overflowY: string; scrollSnapType: string; scrollPaddingLeft: string; paddingLeft: string; role: string | null; roledescription: string | null; label: string | null; scrollWidth: number; clientWidth: number };
  piste: { tabindex: string | null; width: number; columnGap: string };
  cartes: { n: number; roles: string[]; labels: string[]; largeur: number };
  boutons: { prevVisible: number; nextVisible: number; prevAriaDisabled: string | null; nextAriaDisabled: string | null };
  moduleCharge: boolean;
}

const relever = (page: Page, largeur: number): Promise<Releve> => page.evaluate(({ ROOT, CADRE, PISTE, CARTE, PREV, NEXT, MODULE, largeur }) => {
  const root = document.querySelector(ROOT) as HTMLElement;
  const cadre = root.querySelector(CADRE) as HTMLElement;
  const piste = root.querySelector(PISTE) as HTMLElement;
  const cartes = [...root.querySelectorAll(CARTE)] as HTMLElement[];
  const cs = getComputedStyle(cadre);
  const w = window as unknown as { odoo?: { loader?: { modules?: Map<string, unknown> } } };
  return {
    largeur,
    cadre: {
      overflowX: cs.overflowX, overflowY: cs.overflowY, scrollSnapType: cs.scrollSnapType, scrollPaddingLeft: cs.scrollPaddingLeft, paddingLeft: cs.paddingLeft,
      role: cadre.getAttribute('role'), roledescription: cadre.getAttribute('aria-roledescription'), label: cadre.getAttribute('aria-label'),
      scrollWidth: cadre.scrollWidth, clientWidth: cadre.clientWidth,
    },
    piste: { tabindex: piste.getAttribute('tabindex'), width: piste.getBoundingClientRect().width, columnGap: getComputedStyle(piste).columnGap },
    cartes: { n: cartes.length, roles: cartes.map((c) => `${c.getAttribute('role')}/${c.getAttribute('aria-roledescription')}`), labels: cartes.map((c) => c.getAttribute('aria-label') ?? ''), largeur: cartes[0]?.getBoundingClientRect().width ?? 0 },
    boutons: {
      prevVisible: 0, nextVisible: 0,
      prevAriaDisabled: root.querySelector(PREV)?.getAttribute('aria-disabled') ?? null,
      nextAriaDisabled: root.querySelector(NEXT)?.getAttribute('aria-disabled') ?? null,
    },
    moduleCharge: Boolean(w.odoo?.loader?.modules?.has(MODULE)),
  };
}, { ROOT, CADRE, PISTE, CARTE, PREV, NEXT, MODULE, largeur });

const scrollLeft = (page: Page) => page.locator(`${ROOT} ${CADRE}`).first().evaluate((el) => (el as HTMLElement).scrollLeft);

/** Remet la piste au début SANS animation — un `scrollTo` lisse laisserait la
 *  mesure suivante lire une position en mouvement. */
const remettreAuDebut = (page: Page) => page.locator(`${ROOT} ${CADRE}`).first().evaluate((el) => {
  (el as HTMLElement).scrollTo({ left: 0, behavior: 'instant' as ScrollBehavior });
});

/** Attend que `scrollLeft` cesse de bouger (trois lectures identiques à 120 ms),
 *  borné à 3 s : un défilement lisse dure ~300-500 ms selon le navigateur. */
async function attendreRepos(page: Page): Promise<number> {
  let precedent = await scrollLeft(page);
  let stable = 0;
  const fin = Date.now() + 3000;
  while (Date.now() < fin) {
    await page.waitForTimeout(120);
    const courant = await scrollLeft(page);
    stable = courant === precedent ? stable + 1 : 0;
    precedent = courant;
    if (stable >= 2) break;
  }
  return precedent;
}

async function ouvrirPage(context: BrowserContext, env: QaEnv, largeur: number): Promise<Page> {
  const page = await context.newPage();
  await page.setViewportSize({ width: largeur, height: 1200 });
  const reponse = await page.goto(`${baseUrl(env)}${HARNESS_PATH}`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
  if (!reponse || reponse.status() !== 200) {
    throw new Error(`${HARNESS_PATH} répond HTTP ${reponse?.status() ?? '(aucune réponse)'} — refus de mesurer une page d'erreur.`);
  }
  // La file du loader Odoo doit être vide : un clic avant que l'Interaction soit
  // démarrable frappe un bouton sans handler (leçon texte-seo.spec, run 4).
  await page.waitForFunction(() => {
    const w = window as unknown as { odoo?: { loader?: { jobs?: Set<unknown> } } };
    return (w.odoo?.loader?.jobs?.size ?? 1) === 0;
  }, undefined, { timeout: 30_000 }).catch(() => undefined);
  await page.evaluate(() => Promise.race([(document as unknown as { fonts: { ready: Promise<unknown> } }).fonts.ready, new Promise((r) => setTimeout(r, 4000))]));
  await page.waitForTimeout(400);
  if ((await page.locator(`${ROOT} ${CADRE}`).count()) === 0 || (await page.locator(`${ROOT} ${NEXT}`).count()) === 0) {
    throw new Error(`${HARNESS_PATH} est servie mais ne porte ni cadre ni bouton Suivant — module non rechargé ou gabarit renommé. Refus de produire un relevé vide.`);
  }
  return page;
}

async function mesurerVisiteur(receipt: Recueil, { browser, env }: Instance): Promise<void> {
  const publique = await ouvrirSessionPublique(browser);
  try {
    for (const largeur of LARGEURS) {
      const page = await ouvrirPage(publique.context, env, largeur);
      const desktop = largeur >= 992;
      const r = await relever(page, largeur);
      r.boutons.prevVisible = await visibleCount(page, `${ROOT} ${PREV}`);
      r.boutons.nextVisible = await visibleCount(page, `${ROOT} ${NEXT}`);
      const pas = r.cartes.largeur + parseFloat(r.piste.columnGap || '0');
      const maxScroll = r.cadre.scrollWidth - r.cadre.clientWidth;
      const ecart = (a: number, b: number) => Math.abs(a - b) <= 2;
      const tag = `@${largeur}`;

      receipt.constateSi(`${tag} module d'interaction chargé`, r.moduleCharge, MODULE, r.moduleCharge ? 'présent' : 'absent');
      receipt.constateSi(`${tag} le cadre défile en x et rogne en y`, r.cadre.overflowX === 'auto' && r.cadre.overflowY === 'hidden', 'overflow-x auto · overflow-y hidden', `overflow-x ${r.cadre.overflowX} · overflow-y ${r.cadre.overflowY}`);
      receipt.constateSi(`${tag} scroll-snap posé sur l'axe x`, /(^|\s)x(\s|$)/.test(r.cadre.scrollSnapType), 'scroll-snap-type: x …', r.cadre.scrollSnapType || 'none');
      // L'égalité scroll-padding-left = padding-left est l'invariant sur lequel
      // reposent le pas et l'alignement de la dernière carte (revue 2026-09-07).
      receipt.constateSi(`${tag} scroll-padding-left égal au padding-left du cadre`, r.cadre.scrollPaddingLeft !== 'auto' && r.cadre.scrollPaddingLeft === r.cadre.paddingLeft, `scroll-padding-left = padding-left (${r.cadre.paddingLeft})`, `scroll-padding-left ${r.cadre.scrollPaddingLeft} · padding-left ${r.cadre.paddingLeft}`);
      receipt.constateSi(`${tag} la piste déborde du cadre`, r.cadre.scrollWidth > r.cadre.clientWidth, 'scrollWidth > clientWidth', `${r.cadre.scrollWidth} > ${r.cadre.clientWidth}`);
      receipt.constateSi(`${tag} ARIA — région carrousel nommée`, r.cadre.role === 'region' && r.cadre.roledescription === 'carrousel' && Boolean(r.cadre.label), 'role=region · aria-roledescription=carrousel · aria-label', `${r.cadre.role} · ${r.cadre.roledescription} · ${r.cadre.label ?? '(vide)'}`);
      receipt.constateSi(`${tag} ARIA — piste focalisable (Safari ne rend pas une zone overflow:auto focalisable)`, r.piste.tabindex === '0', 'tabindex=0', r.piste.tabindex ?? '(absent)');
      receipt.constateSi(`${tag} ARIA — chaque carte reste un lien, nommé « …, prix — produit n sur N »`,
        r.cartes.n > 0 && r.cartes.roles.every((x) => x === 'null/null') && r.cartes.labels.every((l, i) => new RegExp(`€\\s*—\\s*produit ${i + 1} sur ${r.cartes.n}$`).test(l)),
        `${r.cartes.n} × sans role, labels « …€ — produit 1..${r.cartes.n} sur ${r.cartes.n} »`, `${r.cartes.roles.join(',')} · ${r.cartes.labels.join(' | ')}`);

      // La molette horizontale : seul geste utilisateur qu'un cadre hidden REFUSE.
      const boite = await page.locator(`${ROOT} ${CADRE}`).first().boundingBox();
      if (!boite) throw new Error('cadre sans boîte');
      await page.mouse.move(boite.x + boite.width / 2, boite.y + boite.height / 2);
      await page.mouse.wheel(pas, 0);
      const apresMolette = await attendreRepos(page);
      receipt.constateSi(`${tag} la molette horizontale fait défiler le cadre`, apresMolette > 0, 'scrollLeft > 0', `scrollLeft ${apresMolette}`);
      await remettreAuDebut(page);

      // Focus clavier sur la DERNIÈRE carte (la seule qui déborde à toutes les
      // largeurs) : Tab depuis l'avant-dernière, pour que le focus soit un vrai
      // focus clavier (:focus-visible), pas un focus() programmatique.
      if (r.cartes.n < 2) {
        receipt.saute(`${tag} focus clavier sur la dernière carte`, `${r.cartes.n} carte(s) : rien à parcourir`);
      } else {
        await page.keyboard.press('Tab');
        await page.locator(`${ROOT} ${CARTE}`).nth(r.cartes.n - 2).focus();
        await page.keyboard.press('Tab');
        const apresFocus = await attendreRepos(page);
        const focus = await page.evaluate(({ CARTE, CADRE }) => {
          const actif = document.activeElement as HTMLElement | null;
          const cadre = document.querySelector(CADRE) as HTMLElement;
          const c = cadre.getBoundingClientRect();
          const a = actif?.getBoundingClientRect();
          return { surCarte: actif?.matches(CARTE) ?? false, entiere: Boolean(a) && a!.left >= c.left - 1 && a!.right <= c.right + 1 };
        }, { CARTE, CADRE });
        receipt.constateSi(`${tag} le focus clavier sur la dernière carte fait défiler le cadre et la montre entière`, focus.surCarte && apresFocus > 0 && focus.entiere, 'activeElement = carte · scrollLeft > 0 · carte entière dans le cadre', `activeElement ${focus.surCarte ? 'carte' : 'autre'} · scrollLeft ${apresFocus} · ${focus.entiere ? 'entière' : 'coupée'}`);
        await remettreAuDebut(page);
      }

      if (!desktop) {
        receipt.constateSi(`${tag} contrôles masqués sous 992`, r.boutons.prevVisible === 0 && r.boutons.nextVisible === 0, '0 visible', `${r.boutons.prevVisible + r.boutons.nextVisible} visible(s)`);
      } else {
        receipt.constateSi(`${tag} contrôles visibles dès 992`, r.boutons.prevVisible === 1 && r.boutons.nextVisible === 1, '2 visibles', `${r.boutons.prevVisible + r.boutons.nextVisible} visible(s)`);
        receipt.constateSi(`${tag} au début, Précédent est aria-disabled et Suivant ne l'est pas`, r.boutons.prevAriaDisabled === 'true' && r.boutons.nextAriaDisabled !== 'true', 'prev=true · next≠true', `prev=${r.boutons.prevAriaDisabled} · next=${r.boutons.nextAriaDisabled}`);

        await page.locator(`${ROOT} ${NEXT}`).click();
        const apresSuivant = await attendreRepos(page);
        receipt.constateSi(`${tag} Suivant avance d'UNE carte (largeur ${r.cartes.largeur} + écart ${r.piste.columnGap})`, ecart(apresSuivant, Math.min(pas, maxScroll)), `scrollLeft ≈ ${Math.min(pas, maxScroll)}`, `scrollLeft ${apresSuivant} (max ${maxScroll})`);
        const prevApres = await page.locator(`${ROOT} ${PREV}`).getAttribute('aria-disabled');
        receipt.constateSi(`${tag} après un pas, Précédent redevient actif`, prevApres !== 'true', 'aria-disabled ≠ true', `aria-disabled=${prevApres}`);

        await page.locator(`${ROOT} ${PREV}`).click();
        const apresPrecedent = await attendreRepos(page);
        receipt.constateSi(`${tag} Précédent revient au début`, apresPrecedent === 0, 'scrollLeft 0', `scrollLeft ${apresPrecedent}`);

        // Jusqu'en butée : Playwright refuse de cliquer un bouton aria-disabled
        // (« element is not enabled »), on s'arrête donc dès que Suivant le devient.
        let pasFaits = 0;
        for (let i = 0; i < r.cartes.n + 1; i += 1) {
          if ((await page.locator(`${ROOT} ${NEXT}`).getAttribute('aria-disabled')) === 'true') break;
          await page.locator(`${ROOT} ${NEXT}`).click();
          await attendreRepos(page);
          pasFaits += 1;
        }
        const enButee = await scrollLeft(page);
        const nextEnButee = await page.locator(`${ROOT} ${NEXT}`).getAttribute('aria-disabled');
        receipt.constateSi(`${tag} en butée, Suivant est aria-disabled et la piste est au bout`, nextEnButee === 'true' && ecart(enButee, maxScroll) && pasFaits > 0, `aria-disabled=true · scrollLeft ≈ ${maxScroll} · ≥ 1 pas`, `aria-disabled=${nextEnButee} · scrollLeft ${enButee} · ${pasFaits} pas`);
        await remettreAuDebut(page);
      }

      const chemin = path.join(PROOFS_034, `releve-${largeur}.json`);
      mkdirSync(PROOFS_034, { recursive: true });
      receipt.artefact(chemin, Buffer.from(JSON.stringify({ ...r, pas, maxScroll }, null, 2) + '\n'));
      await page.close();
    }

    // Mouvement réduit : le déplacement doit être INSTANTANÉ. Lecture immédiate
    // après le clic — un défilement lisse serait encore en route.
    const reduit = await browser.newContext({ viewport: { width: 1200, height: 1200 }, colorScheme: 'light', reducedMotion: 'reduce' });
    try {
      const page = await ouvrirPage(reduit, env, 1200);
      const r = await relever(page, 1200);
      const pas = r.cartes.largeur + parseFloat(r.piste.columnGap || '0');
      await page.locator(`${ROOT} ${NEXT}`).click();
      const immediat = await scrollLeft(page);
      receipt.constateSi('@1200 prefers-reduced-motion — le pas est instantané', Math.abs(immediat - pas) <= 2, `scrollLeft ≈ ${pas} dès le clic`, `scrollLeft ${immediat}`);
      await page.close();
    } finally {
      await reduit.close();
    }

    receipt.saute('glissement tactile (swipe) sur la piste', 'Playwright headless ne sait que tap ; le geste tactile exige une session CDP séquencée — registre DW-034-003', 'L-034-TOUCH');
    const erreurs = publique.journal.console.filter((l) => l.startsWith('[error]'));
    receipt.constateSi('public — zéro erreur console pendant les gestes', erreurs.length === 0, '0 erreur', erreurs.slice(0, 3).join(' | ') || '0');
  } finally {
    await publique.context.close();
  }
}

async function mesurerEditeur(receipt: Recueil, { browser, env }: Instance): Promise<void> {
  const editeur = await ouvrirSessionEditeur(browser, env);
  try {
    const page = await editeur.context.newPage();
    const frame = await enterEditor(page, env, HARNESS_PATH);
    if (!frame) {
      receipt.saute('éditeur — carrousel', 'iframe de page ou builder absent', 'ODOO-LIMIT-EDITOR-ENTRY');
      return;
    }
    const root = frame.locator(ROOT).first();
    await select(frame, root);
    const panneauRacine = await page.locator('.options-container:visible').count();
    receipt.constateSi('éditeur — la section se sélectionne et ouvre un panneau', panneauRacine > 0, '≥ 1 panneau', `${panneauRacine}`);

    // Une carte se sélectionne : son panneau (product-card, `produit-lien-href`)
    // doit apparaître — un clic avalé par le cadre défilant ne l'ouvrirait pas.
    const carte = frame.locator(`${ROOT} ${CARTE}`).nth(1);
    let clicCarte = true;
    try { await carte.click({ position: { x: 8, y: 8 }, timeout: 5000 }); } catch { clicCarte = false; }
    await page.waitForTimeout(400);
    const panneauCarte = await page.locator('.options-container:visible [data-pqr-control="produit-lien-href"]').count();
    const overflowEditeur = await frame.locator(`${ROOT} ${CADRE}`).first().evaluate((el) => getComputedStyle(el).overflowX);
    receipt.constateSi('éditeur — une carte se sélectionne (panneau product-card), le cadre garde son défilement', clicCarte && panneauCarte > 0 && overflowEditeur === 'auto', 'clic accepté · panneau produit · overflow-x auto', `clic ${clicCarte ? 'ok' : 'refusé'} · panneau ${panneauCarte} · overflow-x ${overflowEditeur}`);

    // Une frappe réelle : sans modification, Odoo n'émet aucun RPC de save
    // (mesuré au run rouge : « aucun RPC »). Le clic humain tombe au centre du
    // titre, donc au milieu d'un mot : on vérifie que la frappe est ENTRÉE.
    const titre = frame.locator(`${ROOT} [data-pqr-part="produits-ecommerce-title"]`).first();
    const texteApres = await frapperAuClicHumain(titre, ' (034)');
    receipt.constateSi('éditeur — le titre accepte une frappe réelle', texteApres !== null && texteApres.includes('(034)'), 'titre contenant (034)', texteApres ?? 'clic refusé');

    const save = page.locator('.o-snippets-top-actions button[data-action="save"]').first();
    const reponsePromise = page.waitForResponse((r) => r.url().includes('/web/dataset/call_kw/ir.ui.view/save'), { timeout: 30_000 }).catch(() => null);
    await save.click();
    const reponse = await reponsePromise;
    receipt.constateSi('éditeur — le save passe', reponse !== null && reponse.ok(), 'RPC save 2xx', reponse ? `HTTP ${reponse.status()}` : 'aucun RPC');
  } finally {
    await editeur.context.close();
  }

  const publique = await ouvrirSessionPublique(browser);
  try {
    const page = await ouvrirPage(publique.context, env, 1200);
    const r = await relever(page, 1200);
    receipt.constateSi('relecture publique après save — l\'ARIA du cadre est servie', r.cadre.role === 'region' && r.cadre.roledescription === 'carrousel' && r.piste.tabindex === '0', 'region/carrousel · tabindex=0', `${r.cadre.role}/${r.cadre.roledescription} · tabindex=${r.piste.tabindex}`);
    await page.close();
  } finally {
    await publique.context.close();
  }
}

async function main() {
  const started = Date.now();
  const reutilise = process.env.PQR_QA_REUSE === '1';
  const receipt = new Recueil('produits-ecommerce-carrousel', 'odoo-034-carrousel', 'produits-ecommerce-contract-sample');
  if (!dockerDisponible()) {
    receipt.saute('carrousel Produits e-commerce sur Odoo', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    receipt.ecrire('recu.json', Date.now() - started, PROOFS_034);
    process.exit(1);
  }
  if (reutilise) receipt.limite('ODOO-LIMIT-INSTANCE-REUTILISEE');

  const corps = async (inst: Instance) => {
    await mesurerVisiteur(receipt, inst);
    await mesurerEditeur(receipt, inst);
  };
  if (reutilise) await withInstanceExistante(corps);
  else await withInstance(corps);

  const done = receipt.ecrire('recu.json', Date.now() - started, PROOFS_034);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
