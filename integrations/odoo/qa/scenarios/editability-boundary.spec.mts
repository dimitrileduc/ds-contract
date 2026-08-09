/**
 * SPIKE DE LA FRONTIÈRE D'ÉDITABILITÉ — le scénario qui tranche FR-009/FR-010.
 * Spec 019, tâches T017 (écriture, avant le levier) et T020 (exécution).
 *
 * ── Ce qu'il mesure, et pourquoi c'est CE nombre-là ─────────────────────────
 * En mode édition, pour chacun des six nœuds du banc, le scénario relève
 * `element.isContentEditable` PUIS tente une frappe réelle. Sur les quatre
 * descendants verrouillés, il vérifie aussi que déplacer, dupliquer et supprimer
 * ne sont pas proposés ; si un bouton fuit, le geste est réellement tenté et le
 * reçu devient rouge. Enfin, un save/public contrôle la garde rich-text.
 *
 * Attendu si le mécanisme candidat tient :
 *     2 zones rouvertes   → isContentEditable === true
 *     4 descendants figés → isContentEditable === false
 *
 * ── Ce scénario est écrit AVANT le levier, et doit d'abord être ROUGE ───────
 * C'est l'ordre de la Phase 2. Un scénario écrit après le code qu'il contrôle
 * teste surtout que le code fait ce qu'il fait.
 *
 * Il ne conclut pas. Il produit un reçu d'observations. Le verdict FR-009/FR-010
 * se lit ensuite, et si le mécanisme ne tient pas, la limite est écrite dans
 * `proofs/limits.json` AVANT tout claim.
 *
 * Usage :
 *   npx tsx integrations/odoo/qa/scenarios/editability-boundary.spec.mts
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Frame, Locator, Page } from 'playwright-core';
import { Recueil, PROOFS } from '../lib/receipt.mts';
import {
  EDITOR_TIMEOUT_MS,
  NAV_TIMEOUT_MS,
  baseUrl,
  dockerDisponible,
  ouvrirSessionEditeur,
  ouvrirSessionPublique,
  withInstance,
  type QaEnv,
} from '../run.mts';

export const SCENARIO_ID = 'editability-boundary';
export const SNAPSHOT_ID = 'odoo-019-foundation';
export const HARNESS_PATH = '/piqueray-harness/editability-boundary';

/** Les six nœuds du banc, et le verdict attendu du mécanisme candidat. */
export const CIBLES = [
  { sel: '.pqr-zone-ouverte-1', role: 'rouverte', attendu: true },
  { sel: '.pqr-zone-ouverte-2', role: 'rouverte', attendu: true },
  { sel: '.pqr-texte-fige', role: 'verrouillé', attendu: false },
  { sel: '.pqr-titre-fige', role: 'verrouillé', attendu: false },
  { sel: '.pqr-libelle-fige', role: 'verrouillé', attendu: false },
  { sel: '.pqr-bloc-structurel', role: 'verrouillé', attendu: false },
] as const;

/**
 * Entre en mode édition et rend le frame qui porte la page.
 * Odoo 19 sert la page dans une iframe de prévisualisation ; lire
 * `isContentEditable` sur le document de la fenêtre principale mesurerait le
 * chrome de l'éditeur, pas notre section.
 */
interface EntreeEditeur {
  frame: Frame | null;
  voie: 'parametre-url' | 'bouton-edit' | null;
  bodyClasses: string;
}

async function frameDuBanc(page: Page): Promise<Frame | null> {
  for (const frame of page.frames()) {
    const present = await frame.locator('.s_pqr_presentation').count().catch(() => 0);
    if (present > 0) return frame;
  }
  return null;
}

/** Le paramètre est la voie déterministe documentée par Odoo 19. Le clic sur le
 * bouton Edit est un repli piloté, et le reçu dit laquelle a réellement engagé
 * le builder. Dans les deux cas on attend le chrome ET le frame normalisé : voir
 * seulement la page dans l'iframe ne prouve pas que l'éditeur a démarré. */
async function entrerEnEdition(page: Page, env: QaEnv): Promise<EntreeEditeur> {
  await page.goto(
    `${baseUrl(env)}/odoo/action-website.website_preview?path=${encodeURIComponent(HARNESS_PATH)}&enable_editor=1`,
    { waitUntil: 'domcontentloaded', timeout: EDITOR_TIMEOUT_MS },
  );
  const deadline = Date.now() + EDITOR_TIMEOUT_MS;
  let voie: EntreeEditeur['voie'] = 'parametre-url';
  let boutonTente = false;
  while (Date.now() < deadline) {
    const frame = await frameDuBanc(page);
    const chromeEngage = (await page.locator('body.o_builder_open').count()) > 0;
    const normalise = frame
      ? await frame.locator('[contenteditable="true"]').count().catch(() => 0)
      : 0;
    if (frame && chromeEngage && normalise > 0) {
      return {
        frame,
        voie,
        bodyClasses: await page.locator('body').getAttribute('class').then((v) => v ?? ''),
      };
    }

    // Le paramètre devrait suffire. S'il n'a toujours rien engagé après le
    // chargement initial, piloter exactement le bouton que voit le rédacteur.
    if (!boutonTente && Date.now() > deadline - EDITOR_TIMEOUT_MS + 20_000) {
      const bouton = page
        .locator('.o_edit_website_container button, button.o-website-btn-custo-primary')
        .filter({ hasText: /Edit|Modifier/i })
        .first();
      if (await bouton.isVisible().catch(() => false)) {
        await bouton.click();
        boutonTente = true;
        voie = 'bouton-edit';
      }
    }
    await page.waitForTimeout(1500);
  }
  return {
    frame: null,
    voie: boutonTente ? 'bouton-edit' : null,
    bodyClasses: await page.locator('body').getAttribute('class').then((v) => v ?? '').catch(() => ''),
  };
}

/** Le relevé : pour chaque cible, ce que le navigateur dit vraiment. */
async function relever(frame: Frame) {
  const selecteurs = CIBLES.map((c) => c.sel);
  return frame.evaluate(
    (cibles: string[]) =>
      cibles.map((sel) => {
        const el = document.querySelector(sel) as HTMLElement | null;
        return {
          sel,
          present: el !== null,
          contentEditable: el ? el.isContentEditable : null,
          // L'ancêtre EXPLICITEMENT ouvert le plus proche : il permet
          // d'attribuer une ouverture à un ancêtre plutôt qu'au nœud lui-même —
          // c'est cette distinction qui a manqué à 018.
          porteurEditable: el
            ? ((el.closest('[contenteditable="true"]') as HTMLElement | null)?.className ?? null)
            : null,
        };
      }),
    selecteurs,
  );
}

async function tenterFrappe(frame: Frame, selector: string, suffixe: string) {
  const cible = frame.locator(selector).first();
  const avant = (await cible.textContent()) ?? '';
  let erreur: string | null = null;
  try {
    await cible.click({ position: { x: 8, y: 8 } });
    await cible.press('End');
    await cible.pressSequentially(suffixe, { delay: 20 });
  } catch (e) {
    erreur = e instanceof Error ? e.message : String(e);
  }
  const apres = (await cible.textContent().catch(() => null)) ?? '(nœud absent)';
  return { avant, apres, modifie: apres !== avant, erreur };
}

const BOUTONS_STRUCTURELS = {
  move: '.o_overlay_options .o_move_handle, .o_move_handle',
  duplicate: '.o_overlay_options .o_snippet_clone, .options-container button.oe_snippet_clone',
  remove: '.o_overlay_options .oe_snippet_remove, .options-container button.oe_snippet_remove',
} as const;

async function premierVisible(scope: Page | Locator, selector: string): Promise<Locator | null> {
  const candidats = scope.locator(selector);
  for (let i = 0; i < await candidats.count(); i += 1) {
    const candidat = candidats.nth(i);
    if (await candidat.isVisible().catch(() => false)) return candidat;
  }
  return null;
}

type EtatActionRacine = Record<keyof typeof BOUTONS_STRUCTURELS, { presente: boolean; disabled: boolean }>;

async function attendreEtatActionsRacine(
  page: Page,
  autorisees: boolean,
  timeoutMs = 5_000,
): Promise<EtatActionRacine> {
  const fin = Date.now() + timeoutMs;
  let etat = {} as EtatActionRacine;
  do {
    etat = {} as EtatActionRacine;
    for (const action of ['move', 'duplicate', 'remove'] as const) {
      const bouton = await premierVisible(page, BOUTONS_STRUCTURELS[action]);
      etat[action] = {
        presente: bouton !== null,
        disabled: bouton ? await bouton.isDisabled().catch(() => false) : false,
      };
    }
    const stable = Object.values(etat).every((action) => autorisees
      ? action.presente && !action.disabled
      : !action.presente || action.disabled);
    if (stable) return etat;
    await page.waitForTimeout(250);
  } while (Date.now() < fin);
  return etat;
}

async function tenterActionInterdite(
  page: Page,
  frame: Frame,
  selector: string,
  action: keyof typeof BOUTONS_STRUCTURELS,
) {
  const cible = frame.locator(selector).first();
  await cible.click({ position: { x: 8, y: 8 } });
  await page.waitForTimeout(250);
  const sonde = page
    .locator('.options-container[data-container-title="QA — descendant verrouillé"]')
    .first();
  const sondeVisible = await sonde.isVisible().catch(() => false);
  // Duplicate/Remove appartiennent au conteneur exact sélectionné. Move est un
  // overlay global ; pendant ces contrôles l'action move de la racine est
  // temporairement coupée, donc toute poignée restante viserait forcément le
  // descendant hostile exposé par l'addon QA.
  const bouton = action === 'move'
    ? await premierVisible(page, BOUTONS_STRUCTURELS[action])
    : sondeVisible
      ? await premierVisible(sonde, BOUTONS_STRUCTURELS[action])
      : null;
  if (!bouton) {
    return {
      offerte: false,
      tentee: true,
      mutation: false,
      sonde: sondeVisible,
      detail: sondeVisible
        ? 'sélection réelle tentée · conteneur hostile actif · commande absente'
        : 'sélection réelle tentée · conteneur hostile introuvable',
    };
  }

  const disabled = await bouton.isDisabled().catch(() => false);
  if (disabled) {
    return {
      offerte: true,
      tentee: true,
      mutation: false,
      sonde: sondeVisible,
      detail: 'commande présente mais désactivée',
    };
  }

  const avant = await frame.locator(selector).count();
  let erreur: string | null = null;
  try {
    if (action === 'move') {
      const box = await bouton.boundingBox();
      if (!box) throw new Error('poignée sans géométrie');
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height + 80, { steps: 8 });
      await page.mouse.up();
    } else {
      await bouton.click();
    }
  } catch (e) {
    erreur = e instanceof Error ? e.message : String(e);
  }
  await page.waitForTimeout(250);
  const apres = await frame.locator(selector).count().catch(() => 0);
  return {
    offerte: true,
    tentee: true,
    mutation: avant !== apres || action === 'move',
    sonde: sondeVisible,
    detail: erreur ? `tentative refusée : ${erreur.split('\n')[0]}` : `commande exécutée (compte ${avant}→${apres})`,
  };
}

async function main() {
  const debut = Date.now();
  const recueil = new Recueil(SCENARIO_ID, SNAPSHOT_ID, 'harness_editability_boundary');

  const docker = dockerDisponible();
  if (!docker) {
    recueil.saute(
      'relevé isContentEditable en mode édition',
      'Docker ne répond pas — l\'instance de qualification est indisponible',
      'ODOO-LIMIT-NO-INSTANCE',
    );
    recueil.ecrire('editability-boundary.json', Date.now() - debut);
    process.exit(1);
  }

  await withInstance(async ({ browser, env, chromium }) => {
    console.log(`  Chromium ${chromium}`);

    // --- 1. La page publique existe et porte les six nœuds. ------------------
    const pub = await ouvrirSessionPublique(browser);
    const pagePub = await pub.context.newPage();
    const res = await pagePub.goto(`${baseUrl(env)}${HARNESS_PATH}`, {
      waitUntil: 'domcontentloaded',
      timeout: NAV_TIMEOUT_MS,
    });
    recueil.constate('la page de banc est servie au public', 'HTTP 200', `HTTP ${res?.status() ?? '(aucune réponse)'}`);
    const manquants: string[] = [];
    for (const c of CIBLES) if ((await pagePub.locator(c.sel).count()) === 0) manquants.push(c.sel);
    recueil.constate(
      'les 6 nœuds du banc sont présents',
      '0 manquant',
      manquants.length === 0 ? '0 manquant' : `${manquants.length} manquant(s) : ${manquants.join(', ')}`,
    );

    // --- 2. Aucune édition possible sans session — la porte de sécurité. -----
    //
    // Mesuré séparément DANS notre section et AILLEURS sur la page. Un compte
    // global mélangerait le chrome d'Odoo (barre de recherche du thème, widgets
    // du layout) avec nos composants, et rendrait rouge une page saine — ou
    // pire, vert un vrai défaut noyé dans le bruit. C'est l'attribution qui
    // porte l'information, pas le nombre.
    const editablesPublic = await pagePub.evaluate(() =>
      [...document.querySelectorAll('[contenteditable="true"]')].map((el) => ({
        dansNotreSection: el.closest('.s_pqr_presentation') !== null,
        tag: el.tagName.toLowerCase(),
        classe: (el as HTMLElement).className || '(sans classe)',
      })),
    );
    const dansSection = editablesPublic.filter((e) => e.dansNotreSection);
    const ailleurs = editablesPublic.filter((e) => !e.dansNotreSection);
    recueil.constate(
      'un visiteur anonyme ne peut éditer aucun nœud DE NOTRE SECTION',
      '0 nœud',
      dansSection.length === 0
        ? '0 nœud'
        : `${dansSection.length} nœud(s) : ${dansSection.map((e) => `${e.tag}.${e.classe}`).join(', ')}`,
    );
    if (ailleurs.length > 0) {
      // Fait informatif, pas un skip : le thème porte déjà un nœud caché
      // contenteditable sur la page publique. Le compter comme `skipped`
      // empêchait tout reçu de devenir vert alors que ce n'est pas notre surface.
      recueil.constateSi(
        'nœuds éditables hors de notre section (chrome Odoo)',
        true,
        'informatif, hors périmètre',
        `${ailleurs.length} relevé(s) : ${ailleurs.map((e) => `${e.tag}.${e.classe}`).join(', ')}`,
      );
    }
    await pub.context.close();

    // --- 3. LE RELEVÉ, en mode édition. --------------------------------------
    let editeur: Awaited<ReturnType<typeof ouvrirSessionEditeur>> | null = null;
    try {
      editeur = await ouvrirSessionEditeur(browser, env);
      const page = await editeur.context.newPage();
      const entree = await entrerEnEdition(page, env);
      const frame = entree.frame;
      if (!frame) {
        recueil.saute(
          'relevé isContentEditable en mode édition',
          `l'éditeur n'a pas exposé la page ${HARNESS_PATH} dans le délai imparti (voie=${entree.voie ?? 'aucune'}, body="${entree.bodyClasses}")`,
          'ODOO-LIMIT-EDITOR-ENTRY',
        );
      } else {
        recueil.constateSi(
          "voie d'entrée dans l'éditeur",
          entree.bodyClasses.includes('o_builder_open'),
          'chrome o_builder_open et frame normalisé',
          `${entree.voie} · body="${entree.bodyClasses}"`,
        );
        // ---- LE TÉMOIN, et il est indispensable. -------------------------
        //
        // Si l'éditeur ne s'est jamais engagé, TOUS les nœuds sont `false` — y
        // compris les quatre qu'on veut voir verrouillés. Conclure « la
        // fermeture tient » sur ce relevé-là serait lire un succès dans une
        // absence de données. C'est exactement l'erreur que 017 a payée cher :
        // compter n'est pas vérifier ce qui se passe.
        //
        // Le témoin compte les nœuds éditables AILLEURS dans la page (le
        // `#wrap.oe_structure` du layout Odoo est éditable par construction en
        // mode édition). Zéro partout ⇒ mesure NON CONCLUANTE, jamais un succès.
        // ATTENTION — aucune fonction nommée dans un `evaluate`. `tsx` compile
        // avec esbuild `keepNames`, qui enveloppe toute fonction nommée dans un
        // helper `__name(...)`. Le corps est ensuite SÉRIALISÉ vers le
        // navigateur, où ce helper n'existe pas : `ReferenceError: __name is not
        // defined`, à l'exécution seulement, jamais à la compilation. Mesuré le
        // 2026-08-08. Tout doit donc rester inline.
        const temoin = await frame.evaluate(
          (dejaPublics: string[]) => {
            const tous = [...document.querySelectorAll('[contenteditable="true"]')];
            return {
              editablesTotal: tous.length,
              editables: tous.map((el) => ({
                dansNotreSection: el.closest('.s_pqr_presentation') !== null,
                tag: el.tagName.toLowerCase(),
                classe: (el as HTMLElement).className || '(sans classe)',
              })),
              // Ce qui est éditable EN ÉDITION mais ne l'était PAS en public :
              // information utile, mais plus le témoin exclusif : une politique
              // fermée peut légitimement ne rien ouvrir hors de notre section.
              nouveauxEnEdition: tous
                .map((el) => `${el.tagName.toLowerCase()}.${(el as HTMLElement).className || '(sans classe)'}`)
                .filter((s) => !dejaPublics.includes(s)),
              dejaEditablesEnPublic: dejaPublics,
              bodyClasses: document.body.className,
              htmlClasses: document.documentElement.className,
            };
          },
          editablesPublic.map((e) => `${e.tag}.${e.classe}`),
        );
        recueil.artefact(
          path.join(PROOFS, 'editability-boundary.temoin.json'),
          Buffer.from(JSON.stringify(temoin, null, 2) + '\n'),
          'json',
        );
        // Le mode est prouvé par deux états explicites du noyau :
        // `body.o_builder_open` dans le chrome (déjà contrôlé ci-dessus) et
        // `body.editor_enable` dans l'iframe. L'ancien témoin exigeait en plus
        // un nouveau nœud éditable HORS de notre section ; c'était contradictoire
        // avec une politique fermée et ignorait les zones rouvertes internes.
        const editeurEngage = entree.bodyClasses.includes('o_builder_open') && temoin.bodyClasses.includes('editor_enable');
        recueil.constateSi(
          "TÉMOIN — l'éditeur est réellement engagé (chrome + iframe)",
          editeurEngage,
          'o_builder_open + editor_enable',
          editeurEngage
            ? `chrome="${entree.bodyClasses}" · iframe="${temoin.bodyClasses}" · ${temoin.editablesTotal} nœud(s) éditable(s)`
            : `chrome="${entree.bodyClasses}" · iframe="${temoin.bodyClasses}"`,
        );
        if (!editeurEngage) {
          recueil.saute(
            'relevé isContentEditable des 6 cibles',
            'le témoin est à zéro : un relevé « tout false » ne distinguerait pas une fermeture qui tient d\'un éditeur qui ne s\'est pas ouvert',
            'ODOO-LIMIT-EDITOR-NOT-ENGAGED',
          );
          return;
        }

        const releve = await relever(frame);
        recueil.artefact(path.join(PROOFS, 'editability-boundary.releve.json'), Buffer.from(JSON.stringify(releve, null, 2) + '\n'), 'json');
        for (const c of CIBLES) {
          const r = releve.find((x) => x.sel === c.sel);
          const observe = r?.present ? String(r.contentEditable) : '(nœud absent)';
          recueil.constateSi(
            `${c.sel} (${c.role}) — isContentEditable`,
            r?.present === true && r.contentEditable === c.attendu,
            String(c.attendu),
            observe + (r?.porteurEditable && r.contentEditable ? ` [ouvert par « ${r.porteurEditable} »]` : ''),
          );
        }

        // ---- 4. FRAPPE RÉELLE — l'attribut n'est pas le comportement. ----
        for (const [index, c] of CIBLES.entries()) {
          const suffixe = ` PQR-T017B-${index + 1}`;
          const geste = await tenterFrappe(frame, c.sel, suffixe);
          const attenduModifie = c.attendu;
          recueil.constateSi(
            `${c.sel} (${c.role}) — frappe réelle ${attenduModifie ? 'acceptée' : 'refusée'}`,
            geste.modifie === attenduModifie,
            attenduModifie ? 'texte modifié' : 'texte inchangé',
            `${geste.modifie ? 'texte modifié' : 'texte inchangé'}${geste.erreur ? ` · ${geste.erreur.split('\n')[0]}` : ''}`,
          );
        }

        // ---- 5. VERROU STRUCTUREL — les quatre descendants, trois gestes. --
        const verrouilles = CIBLES.filter((c) => !c.attendu);
        // Les boutons de racine sont légitimement visibles même après un clic
        // intérieur. Couper seulement son move pendant cette matrice évite de
        // prendre sa poignée pour une fuite du descendant ; duplicate/remove
        // sont, eux, cherchés dans le conteneur QA exact.
        const racineMesuree = frame.locator('.s_pqr_presentation.pqr-mesure');
        const actionsRacine = await racineMesuree.getAttribute('data-pqr-root-actions') ?? '';
        await racineMesuree.evaluate((el) => {
          (el as HTMLElement).dataset.pqrRootActions = ((el as HTMLElement).dataset.pqrRootActions ?? '')
            .split(/\s+/)
            .filter((a) => a && a !== 'move')
            .join(' ');
        });
        for (const c of verrouilles) {
          for (const action of ['move', 'duplicate', 'remove'] as const) {
            const geste = await tenterActionInterdite(page, frame, c.sel, action);
            recueil.constateSi(
              `${c.sel} — ${action} refusé au descendant`,
              geste.sonde && geste.tentee && !geste.offerte && !geste.mutation,
              'sonde hostile active, sélection tentée, commande absente et aucune mutation',
              `${geste.detail}${geste.tentee ? ' · intention exercée' : ' · non tenté'}`,
            );
          }
        }
        await racineMesuree.evaluate((el, actions) => {
          (el as HTMLElement).dataset.pqrRootActions = actions;
        }, actionsRacine);

        // La racine garde sa politique propre : verrouiller ses descendants ne
        // doit pas supprimer move/duplicate/remove du bloc qui les autorise.
        // La branche interdite est exercée sur une SECONDE instance présente au
        // même moment. C'est le modèle de production : la config émet le verdict
        // lors de la création du bloc. Modifier l'attribut à chaud sur la même
        // instance testerait un comportement que le produit ne promet pas et
        // heurterait le cache de conteneur natif d'Odoo.
        await frame.locator('.s_pqr_presentation.pqr-actions-interdites')
          .evaluate((el) => (el as HTMLElement).click());
        const etatRacineInterdite = await attendreEtatActionsRacine(page, false);
        for (const action of ['move', 'duplicate', 'remove'] as const) {
          const etat = etatRacineInterdite[action];
          const refuse = !etat.presente || etat.disabled;
          recueil.constateSi(
            `racine — ${action} suit aussi sa décision interdite`,
            refuse,
            'commande absente ou désactivée sans mutation',
            etat.presente ? `visible · ${etat.disabled ? 'désactivée' : 'active'}` : 'absente',
          );
        }
        // L'overlay de redimensionnement d'Odoo recouvre physiquement les bords
        // de la section et intercepte un clic Playwright par coordonnées. Le
        // builder écoute un vrai `click` en capture sur le document éditable :
        // `HTMLElement.click()` exerce exactement cette voie sans cliquer par
        // erreur la poignée superposée.
        await frame.locator('.s_pqr_presentation.pqr-mesure')
          .evaluate((el) => (el as HTMLElement).click());
        const etatRacineAutorisee = await attendreEtatActionsRacine(page, true);
        for (const action of ['move', 'duplicate', 'remove'] as const) {
          const etat = etatRacineAutorisee[action];
          recueil.constateSi(
            `racine — ${action} reste distinctement autorisé`,
            etat.presente && !etat.disabled,
            'commande visible et active',
            etat.presente ? `visible · ${etat.disabled ? 'désactivée' : 'active'}` : 'absente',
          );
        }
        const saveCustom = await premierVisible(page, '.oe_snippet_save');
        recueil.constateSi(
          'racine — save-as-custom suit sa décision',
          saveCustom === null,
          'commande absente',
          saveCustom ? 'commande visible' : 'commande absente',
        );
        const panneauRacine = page
          .locator('.options-container')
          .filter({ has: page.locator('[data-pqr-root-policy]') })
          .first();
        const inventairePanneau = await panneauRacine.evaluate((el) => ({
          present: true,
          controlesPiqueray: el.querySelectorAll('[data-pqr-root-policy]').length,
          actionsNonDeclarees: el.querySelectorAll('.oe_snippet_anchor, .oe_snippet_save').length,
          champsNatifs: el.querySelectorAll('input, select, textarea').length,
          texte: (el as HTMLElement).innerText.replace(/\s+/g, ' ').trim(),
        })).catch(() => ({
          present: false,
          controlesPiqueray: 0,
          actionsNonDeclarees: -1,
          champsNatifs: -1,
          texte: '(panneau absent)',
        }));
        recueil.constateSi(
          'racine — panneau limité à la politique Piqueray et aux gestes déclarés',
          inventairePanneau.present && inventairePanneau.controlesPiqueray === 1 &&
            inventairePanneau.actionsNonDeclarees === 0 && inventairePanneau.champsNatifs === 0,
          '1 politique Piqueray, 0 action haute non déclarée, 0 champ natif',
          `${inventairePanneau.controlesPiqueray} politique · ${inventairePanneau.actionsNonDeclarees} action(s) non déclarée(s) · ${inventairePanneau.champsNatifs} champ(s) · texte=${JSON.stringify(inventairePanneau.texte)}`,
        );
        const handlesResizeActifs = await page.locator(
          '.oe_overlay.oe_active .o_handle:not(.readonly):not(.d-none)',
        ).count();
        recueil.constateSi(
          'racine — resize suit sa décision interdite',
          handlesResizeActifs === 0,
          '0 poignée de resize active',
          `${handlesResizeActifs} poignée(s) active(s)`,
        );

        // ---- 6. GARDE RICH-TEXT AU SAVE, RACINE COMPRISE. -----------------
        // `execCommand(insertHTML)` passe par la vraie surface contenteditable
        // du navigateur, comme un collage riche, et déclenche l'historique Odoo.
        // Une simple affectation `innerHTML` avait produit un DOM hostile mais
        // aucun élément `o_dirty`, donc Save rechargeait honnêtement l'original.
        const insertionRiche = await frame.locator('.pqr-zone-ouverte-1').evaluate((el) => {
          const cible = el as HTMLElement;
          cible.focus();
          cible.setAttribute('style', 'color:red');
          cible.setAttribute('onclick', 'window.__pqrHostile=1');
          const range = document.createRange();
          range.selectNodeContents(cible);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          return document.execCommand(
            'insertHTML',
            false,
            '<strong>PQR-STRONG-OK</strong><em style="color:red" onclick="window.__pqrHostile=2">PQR-EM-OUT</em><a href="javascript:alert(1)">PQR-LINK-OUT</a><script>window.__pqrHostile=3</script>',
          );
        });
        const insertionSimple = await frame.locator('.pqr-zone-ouverte-2').evaluate((el) => {
          const cible = el as HTMLElement;
          cible.focus();
          const range = document.createRange();
          range.selectNodeContents(cible);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          return document.execCommand('insertHTML', false, '<strong>PQR-PLAIN-ONLY</strong>');
        });
        await page.waitForTimeout(500);
        const avantSave = await frame.evaluate(() => ({
          dirty: document.querySelectorAll('.o_dirty').length,
          riche: document.querySelector('.pqr-zone-ouverte-1')?.textContent ?? null,
          simple: document.querySelector('.pqr-zone-ouverte-2')?.textContent ?? null,
        }));
        recueil.constateSi(
          'charge hostile — le vrai geste devient sauvegardable',
          insertionRiche && insertionSimple && avantSave.dirty > 0 &&
            Boolean(avantSave.riche?.includes('PQR-STRONG-OK')) &&
            Boolean(avantSave.simple?.includes('PQR-PLAIN-ONLY')),
          '2 insertions acceptées, au moins 1 racine dirty, charges présentes',
          `${Number(insertionRiche) + Number(insertionSimple)}/2 insertions · ${avantSave.dirty} dirty · riche=${JSON.stringify(avantSave.riche)} · simple=${JSON.stringify(avantSave.simple)}`,
        );

        const save = page.locator('.o-snippets-top-actions button[data-action="save"]').first();
        if (!(await save.isVisible().catch(() => false))) {
          recueil.saute('save de la charge rich-text hostile', 'bouton Save introuvable dans le chrome engagé', 'ODOO-LIMIT-SAVE-BUTTON');
        } else {
          const reponseSavePromise = page.waitForResponse(
            (response) => response.url().includes('/web/dataset/call_kw/ir.ui.view/save'),
            { timeout: 30_000 },
          ).catch(() => null);
          await save.click();
          const reponseSave = await reponseSavePromise;
          recueil.constateSi(
            'save — Odoo persiste effectivement la vue',
            reponseSave !== null && reponseSave.ok(),
            'RPC ir.ui.view/save HTTP 2xx',
            reponseSave ? `HTTP ${reponseSave.status()}` : 'aucun RPC save observé',
          );
          await page.waitForTimeout(1000);

          // Contrôle dans une nouvelle session ANONYME : on mesure le HTML
          // réellement persisté, pas le DOM temporaire encore tenu par l'éditeur.
          const publicApres = await ouvrirSessionPublique(browser);
          const pageApres = await publicApres.context.newPage();
          await pageApres.goto(`${baseUrl(env)}${HARNESS_PATH}?pqr_qa=${Date.now()}`, {
            waitUntil: 'domcontentloaded',
            timeout: NAV_TIMEOUT_MS,
          });
          const controle = await pageApres.evaluate(() => {
            const riche = document.querySelector('.pqr-zone-ouverte-1') as HTMLElement | null;
            const simple = document.querySelector('.pqr-zone-ouverte-2') as HTMLElement | null;
            return {
              rootStyle: riche?.getAttribute('style') ?? null,
              rootOnclick: riche?.getAttribute('onclick') ?? null,
              strongRiche: riche?.querySelectorAll('strong, b').length ?? -1,
              emRiche: riche?.querySelectorAll('em, i').length ?? -1,
              linkRiche: riche?.querySelectorAll('a').length ?? -1,
              scriptRiche: riche?.querySelectorAll('script, style').length ?? -1,
              marksSimple: simple?.querySelectorAll('strong, b, em, i, a').length ?? -1,
              texteRiche: riche?.textContent ?? null,
              texteSimple: simple?.textContent ?? null,
            };
          });
          await publicApres.context.close();
          recueil.artefact(
            path.join(PROOFS, 'editability-boundary.rich-text.json'),
            Buffer.from(JSON.stringify(controle, null, 2) + '\n'),
            'json',
          );
          recueil.constateSi(
            'rich-text — attributs hostiles de la racine retirés au save',
            controle.rootStyle === null && controle.rootOnclick === null,
            'style=null et onclick=null',
            `style=${String(controle.rootStyle)} · onclick=${String(controle.rootOnclick)}`,
          );
          recueil.constateSi(
            'rich-text — allowlist strong conserve le texte et retire les marques interdites',
            controle.strongRiche === 1 && controle.emRiche === 0 && controle.linkRiche === 0 && controle.scriptRiche === 0 &&
              Boolean(controle.texteRiche?.includes('PQR-EM-OUT')) && Boolean(controle.texteRiche?.includes('PQR-LINK-OUT')),
            '1 strong, 0 em/link/script, texte préservé',
            `${controle.strongRiche} strong · ${controle.emRiche} em · ${controle.linkRiche} link · ${controle.scriptRiche} script · texte=${JSON.stringify(controle.texteRiche)}`,
          );
          recueil.constateSi(
            'texte simple — aucune marque riche ne survit au save',
            controle.marksSimple === 0 && Boolean(controle.texteSimple?.includes('PQR-PLAIN-ONLY')),
            '0 marque et texte préservé',
            `${controle.marksSimple} marque(s) · texte=${JSON.stringify(controle.texteSimple)}`,
          );
        }
      }
      const journalErreurs = editeur?.journal.console ?? [];
      if (journalErreurs.length > 0) recueil.limite('ODOO-LIMIT-EDITOR-CONSOLE-ERRORS');
    } finally {
      await editeur?.context.close();
    }
  });

  const recu = recueil.ecrire('editability-boundary.json', Date.now() - debut);
  // Le code de sortie ne ment pas : un reçu `skipped` n'est pas un succès.
  process.exit(recu.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => {
    console.error(`✖ ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  });
}
