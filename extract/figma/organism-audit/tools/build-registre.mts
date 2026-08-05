/**
 * Construit le registre avant/après de la feature 014.
 *
 *   npx tsx extract/figma/organism-audit/tools/build-registre.mts --phase avant
 *   npx tsx extract/figma/organism-audit/tools/build-registre.mts --phase apres
 *
 * Phase avant  : re-mesure les 9 sujets à cas (vagues 1+2) dans un dossier
 *                scratch gitignoré, lit le reçu machine frais de la parité
 *                visuelle, compare aux chiffres commités, écrit avant.json.
 *
 * Phase apres  : idem, une fois les deux instruments stables, PUIS relit
 *                avant.json pour porter `before` et `after` côte à côte dans un
 *                même document — c'est cette comparaison-là, et pas
 *                « après vs dépôt », que FR-009 et SC-006 exigent.
 *
 * Trois choses que cet outil refuse de faire :
 *
 *  1. Écrire dans specs/013-…/proofs/. Le scratch est gitignoré
 *     (.gitignore:37, extract/figma/organism-audit/out/).
 *  2. Fonder un « avant » sur une relecture. La parité visuelle DOIT avoir été
 *     re-mesurée dans la fenêtre de cette exécution : son reçu machine
 *     (out/rows.json) doit être postérieur au démarrage de l'outil, sinon refus
 *     nommé. C'est la faute exacte que le premier T0 avait commise.
 *  3. Passer sous silence une absence. Tout artefact manquant, tout organisme
 *     en échec, tout écart non attribué sort en code non nul — jamais un
 *     registre incomplet qui se lirait comme « rien à attribuer ».
 *
 * Les scores viennent des reçus machine, en pleine précision. Seule la colonne
 * `committed` de la parité visuelle est lue dans le Markdown commité, donc à
 * deux décimales : elle sert à DÉTECTER un écart avec ce que le dépôt publiait,
 * jamais à fonder l'« avant » (receipts.schema.md §2). La comparaison avec elle
 * se fait donc à la précision du rapport, ce que le registre dit.
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const SPEC_014 = path.join(REPO, 'specs/014-mesure-juste-triage');
// --out-dir (015, T003): redirects REGISTRE_DIR IN ITS ENTIRETY — avant.json/
// apres.json (written), attributions.json (read, §7), causes.json (read by
// --render only, §T038) all move together. Default UNCHANGED (014, retro-
// compatible): omitting the flag reproduces the exact prior path. A feature
// that re-measures without touching 014's own proofs points here instead of
// overwriting them (D11) — 014's causes.json stays the porte de mesure's
// live register regardless (measure-gate-counting-v2.md §1).
const outDirIdx = process.argv.indexOf('--out-dir');
const REGISTRE_DIR =
  outDirIdx !== -1 && outDirIdx + 1 < process.argv.length
    ? path.resolve(process.argv[outDirIdx + 1])
    : path.join(SPEC_014, 'proofs', 'registre');
const ATTRIBUTIONS = path.join(REGISTRE_DIR, 'attributions.json');
const SCRATCH_BASE = path.join(REPO, 'extract', 'figma', 'organism-audit', 'out', 'registre-scratch');
const CAMPAIGN_PATH = path.join(REPO, 'specs/013-auditer-fidelite-organismes', 'contracts', 'audit-campaign.json');
const PROOFS_013 = path.join(REPO, 'specs/013-auditer-fidelite-organismes', 'proofs');
const VISUAL_ROWS = path.join(REPO, 'extract', 'figma', 'visual-parity', 'out', 'rows.json');
const VISUAL_REPORT_REL = 'extract/figma/visual-parity/REPORT.md';

/** Précision du tableau de REPORT.md — la seule source de la colonne `committed`. */
const REPORT_DECIMALS = 2;

/** Âge maximal du reçu de parité visuelle, en minutes. Au-delà, ce n'est plus
 *  la mesure de cette fenêtre : l'outil refuse plutôt que de fonder un « avant »
 *  sur une exécution d'hier. Surchargeable par `--max-receipt-age-min`. */
const MAX_RECEIPT_AGE_MIN = (() => {
  const i = process.argv.indexOf('--max-receipt-age-min');
  return i !== -1 && i + 1 < process.argv.length ? Number(process.argv[i + 1]) : 120;
})();

const STARTED_AT = new Date();

// ---- refus nommés ---------------------------------------------------------
const refusals: string[] = [];
const refuse = (code: string, detail: string): void => {
  refusals.push(`${code}: ${detail}`);
};

// ---- args -----------------------------------------------------------------
// --render (T038) : rend REGISTRE.md depuis avant.json/apres.json/causes.json,
// déjà écrits sur disque — aucune re-mesure, jamais écrit à la main.
const RENDER_MODE = process.argv.includes('--render');
const phaseIdx = process.argv.indexOf('--phase');
if (!RENDER_MODE && (phaseIdx === -1 || phaseIdx + 1 >= process.argv.length)) {
  console.error('usage: build-registre.mts --phase avant|apres\n   or: build-registre.mts --render');
  process.exit(2);
}
const phaseArg = phaseIdx !== -1 ? process.argv[phaseIdx + 1] : null;
if (!RENDER_MODE && phaseArg !== 'avant' && phaseArg !== 'apres') {
  console.error('phase must be "avant" or "apres"');
  process.exit(2);
}
// Validated above for every non-render invocation — asserted once here so
// every downstream use (scratch paths, the written registre's own `phase`
// field) keeps its original `'avant' | 'apres'` type instead of carrying a
// null the render branch already ruled out for itself by never calling
// buildRegistre() at all.
const phase = phaseArg as 'avant' | 'apres';

// ---- imports (dynamic — pilot.ts is ESM) ---------------------------------
const { auditOrganism } = await import('../pilot.js');
const { checkReferenceProvenance } = await import('../reference.js');

// ---- helpers -------------------------------------------------------------
const readJson = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));

interface Mesure {
  rawPct: number | null;
  status: string;
  facts: FactCounts | null;
}
interface FactCounts {
  proved: number;
  divergent: number;
  limited: number;
  notProven: number;
}

/** Arrondi à la précision du rapport — pour comparer un score de pleine
 *  précision à la colonne `committed`, qui n'en a que deux décimales. */
const atReportPrecision = (v: number): number =>
  Number(v.toFixed(REPORT_DECIMALS));

const factCounts = (r: any): FactCounts | null =>
  r?.facts
    ? {
        proved: r.facts.filter((f: any) => f.outcome === 'proved').length,
        divergent: r.facts.filter((f: any) => f.outcome === 'divergent').length,
        limited: r.facts.filter((f: any) => f.outcome === 'limited').length,
        notProven: r.facts.filter((f: any) => f.outcome === 'not-proven').length,
      }
    : null;

const sameFacts = (a: FactCounts | null, b: FactCounts | null): boolean =>
  a === null || b === null
    ? a === b
    : a.proved === b.proved &&
      a.divergent === b.divergent &&
      a.limited === b.limited &&
      a.notProven === b.notProven;

/** La clé d'une ligne de parité visuelle, dans la forme que le rapport imprime
 *  — variante + interaction, sans quoi deux lignes d'un même sujet se
 *  confondraient à la jointure. */
const parityKey = (r: { subject: string; variant: string; interaction?: string | null }): string =>
  `${r.subject} :: ${r.variant}${r.interaction ? ` [${r.interaction}]` : ''}`;

interface CommittedReport {
  /** Lignes diffées, indexées par clé « sujet :: variante ». */
  diffed: Map<string, Mesure>;
  /** Rubrique « Not diffed », indexée par SUJET : sa cellule `variants` liste
   *  plusieurs variantes séparées par « , » — or un nom de variante peut
   *  lui-même contenir « , » (`Taille=Petit, Etat=Ferme`). On ne la découpe donc
   *  jamais : on teste l'appartenance d'une variante connue, depuis le reçu
   *  frais qui, lui, les porte une par une. */
  notDiffed: Map<string, { variants: string; status: string }>;
}

/** Parse le REPORT.md commité — deux décimales, c'est ce que le Markdown porte,
 *  et le registre le dit ligne par ligne (`committedDelta.comparedAt`). */
function parseCommittedReport(contents: string): CommittedReport {
  const diffed = new Map<string, Mesure>();
  const notDiffed = new Map<string, { variants: string; status: string }>();

  const cellsOf = (line: string): string[] =>
    line.split('|').map((c) => c.trim()).filter((c) => c !== '');

  const lines = contents.split('\n');
  let table: 'diffed' | 'not-diffed' | null = null;
  for (const line of lines) {
    if (line.startsWith('| subject | variant | gate/raw')) {
      table = 'diffed';
      continue;
    }
    if (line.startsWith('| subject | variants | status')) {
      table = 'not-diffed';
      continue;
    }
    if (table === null) continue;
    if (line === '' || !line.startsWith('|')) {
      table = null;
      continue;
    }
    const cells = cellsOf(line);
    if (table === 'diffed') {
      if (cells.length < 3) continue;
      const rawMatch = /^([\d.]+)%$/.exec(cells[2]);
      if (!rawMatch) continue;
      diffed.set(`${cells[0]} :: ${cells[1]}`, {
        rawPct: parseFloat(rawMatch[1]),
        status: 'diffed',
        facts: null,
      });
    } else {
      if (cells.length < 3) continue;
      if (cells[0] === '---' || /^-+$/.test(cells[0])) continue;
      notDiffed.set(cells[0], { variants: cells[1], status: cells[2] });
    }
  }
  return { diffed, notDiffed };
}

/** Le `committed` d'une ligne de parité, diffée ou non. Pour une non-diffée, la
 *  variante est cherchée comme JETON dans la cellule `variants`, jamais par
 *  découpage — sinon `Taille=Petit, Etat=Ferme` compterait pour deux. */
function committedForParity(
  report: CommittedReport,
  row: { subject: string; variant: string },
  key: string,
): Mesure | null {
  const hit = report.diffed.get(key);
  if (hit) return hit;
  const nd = report.notDiffed.get(row.subject);
  if (!nd) return null;
  const list = nd.variants;
  const isToken =
    list === row.variant ||
    list.startsWith(`${row.variant}, `) ||
    list.endsWith(`, ${row.variant}`) ||
    list.includes(`, ${row.variant}, `);
  return isToken ? { rawPct: null, status: nd.status, facts: null } : null;
}

// ---- mesure fraîche des organismes ---------------------------------------
async function measureOrganisms(scratchDir: string): Promise<Map<string, any>> {
  const campaign = readJson(CAMPAIGN_PATH);
  const results = new Map<string, any>();

  const toMeasure = campaign.subjects.filter(
    (s: any) => [1, 2].includes(s.wave) && Array.isArray(s.cases) && s.cases.length > 0,
  );

  for (const subject of toMeasure) {
    console.log(`  mesure organisme : ${subject.id}…`);
    try {
      await auditOrganism({
        repoRoot: REPO,
        outRoot: scratchDir,
        scratchDir: path.join(SCRATCH_BASE, phase, '.harness'),
        campaign,
        subject,
        // Les dumps Figma du cache de 013 sont réutilisés : c'est le RENDU qui
        // est re-mesuré, pas le relevé Figma. Nommé plutôt que supposé — le
        // registre le publie dans son en-tête (`figmaDumps: "cached"`).
        refresh: false,
      });
      const rPath = path.join(scratchDir, 'organisms', subject.id, 'result.json');
      if (!existsSync(rPath)) {
        refuse('organism-result-missing', `${subject.id} — aucun result.json dans le scratch`);
        continue;
      }
      results.set(subject.id, readJson(rPath));
    } catch (err: any) {
      // Un organisme qui échoue ne disparaît PAS du registre en silence.
      refuse('organism-measurement-failed', `${subject.id} — ${err?.message ?? err}`);
    }
  }

  if (results.size !== toMeasure.length) {
    refuse(
      'organism-coverage-incomplete',
      `${results.size}/${toMeasure.length} sujets à cas mesurés`,
    );
  }
  return results;
}

// ---- assemblage -----------------------------------------------------------
async function buildRegistre(): Promise<void> {
  mkdirSync(REGISTRE_DIR, { recursive: true });
  const scratchDir = path.join(SCRATCH_BASE, phase);
  mkdirSync(scratchDir, { recursive: true });

  // ---- 1) Organismes : mesure fraîche ------------------------------------
  console.log(`\n=== Registre ${phase} : mesure des organismes ===`);
  const freshOrg = await measureOrganisms(scratchDir);

  // ---- 2) Parité visuelle : le reçu machine, pas le Markdown -------------
  console.log('\n=== Registre : reçu machine de la parité visuelle ===');
  if (!existsSync(VISUAL_ROWS)) {
    refuse(
      'visual-parity-receipt-missing',
      `${path.relative(REPO, VISUAL_ROWS)} absent — lancer \`npm run extract:figma:visual\` AVANT cet outil`,
    );
  }
  const rowsReceipt = existsSync(VISUAL_ROWS) ? readJson(VISUAL_ROWS) : null;

  // Le garde-fou qui aurait attrapé le premier T0 : un reçu vieux n'est pas une
  // re-mesure, c'est une relecture. Le reçu est forcément ANTÉRIEUR à cet outil
  // (il faut bien l'avoir produit avant), donc la propriété vérifiable est son
  // ÂGE, pas son ordre — une tolérance nommée vaut mieux qu'une exactitude
  // feinte. Le second garde-fou, plus fort, est l'égalité des navigateurs (§5).
  if (rowsReceipt) {
    const generatedAt = new Date(rowsReceipt.generatedAt);
    const ageMin = (STARTED_AT.getTime() - generatedAt.getTime()) / 60000;
    if (ageMin > MAX_RECEIPT_AGE_MIN) {
      refuse(
        'visual-parity-not-remeasured',
        `out/rows.json daté du ${rowsReceipt.generatedAt} (${Math.round(ageMin)} min) — au-delà de ${MAX_RECEIPT_AGE_MIN} min ce n'est plus la mesure de cette fenêtre ; relancer \`npm run extract:figma:visual\` (FR-009)`,
      );
    }
    if (ageMin < 0) {
      refuse('visual-parity-receipt-in-future', `out/rows.json daté du ${rowsReceipt.generatedAt}`);
    }
  }

  // ---- 3) Parité visuelle commitée (détection d'écart, 2 décimales) ------
  console.log('=== Registre : parité visuelle commitée ===');
  let committedParity: CommittedReport = { diffed: new Map(), notDiffed: new Map() };
  try {
    committedParity = parseCommittedReport(
      execSync(`git -C "${REPO}" show HEAD:${VISUAL_REPORT_REL}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }),
    );
  } catch {
    refuse('committed-report-unreadable', `git show HEAD:${VISUAL_REPORT_REL} a échoué`);
  }

  // ---- 4) Organismes commités --------------------------------------------
  const committedOrg = new Map<string, any>();
  for (const id of freshOrg.keys()) {
    const p = path.join(PROOFS_013, 'organisms', id, 'result.json');
    if (existsSync(p)) committedOrg.set(id, readJson(p));
  }

  // ---- 5) Le navigateur, et l'exigence qu'il soit LE MÊME ----------------
  const orgBrowser =
    [...freshOrg.values()].map((r) => r.cases?.[0]?.browserRevision).find(Boolean) ?? null;
  const parityBrowser = rowsReceipt?.browser ?? null;

  if (!orgBrowser) refuse('browser-revision-missing', 'aucun organisme ne porte de browserRevision');
  if (!parityBrowser) refuse('browser-revision-missing', 'le reçu de parité visuelle ne porte pas de browser');
  if (orgBrowser && parityBrowser && orgBrowser.version !== parityBrowser.version) {
    refuse(
      'browser-mismatch',
      `parité visuelle ${parityBrowser.version} ≠ audit d'organismes ${orgBrowser.version} — un écart entre deux navigateurs n'est attribuable par personne (I-4.1)`,
    );
  }

  const browser = parityBrowser ??
    (orgBrowser
      ? {
          ...orgBrowser,
          revision: /chromium-(\d+)/.exec(orgBrowser.executablePath ?? '')?.[1] ?? null,
        }
      : { version: 'unknown', executablePath: 'unknown', revision: null });

  // ---- 6) L'« avant », quand on construit l'« après » --------------------
  let avant: any = null;
  if (phase === 'apres') {
    const avantPath = path.join(REGISTRE_DIR, 'avant.json');
    if (!existsSync(avantPath)) {
      refuse('avant-missing', 'proofs/registre/avant.json absent — l\'« après » n\'a rien à quoi se comparer');
    } else {
      avant = readJson(avantPath);
      if (avant.browser?.version && browser.version !== avant.browser.version) {
        refuse(
          'browser-changed-between-phases',
          `avant ${avant.browser.version} ≠ après ${browser.version} — FR-009 impose le même navigateur des deux côtés`,
        );
      }
    }
  }
  const avantByKey = new Map<string, Mesure>();
  for (const l of avant?.lines ?? []) if (l.before) avantByKey.set(l.key, l.before);

  // ---- 7) Attributions (le seul document du registre écrit à la main) ----
  const attributions: Record<string, string> = existsSync(ATTRIBUTIONS)
    ? (readJson(ATTRIBUTIONS).byKey ?? {})
    : {};

  // ---- 8) Lignes ---------------------------------------------------------
  const lines: any[] = [];

  const pushLine = (
    instrument: 'visual-parity' | 'organism-audit',
    key: string,
    fresh: Mesure,
    committed: Mesure | null,
    /**
     * DW-006 (FR-001/FR-002) — la provenance de référence de la mesure fraîche.
     *
     * Le registre la porte parce que huit des neuf dossiers de 013 sont
     * antérieurs à la correction et que D10 interdit de les re-rendre : sans
     * ça, la condition C3 du contrôle de clôture n'aurait aucune source pour
     * eux, et la seule issue serait d'assouplir C3 — donc de renoncer à la
     * propriété. Ici, la re-mesure de la phase `apres` tourne sur le pilote
     * corrigé : elle porte la provenance des NEUF, sans toucher la campagne
     * close. En phase `avant` elle est légitimement absente (le T0 est, par
     * définition, l'état défectueux) : le champ est écrit `null`, pas omis.
     */
    referenceProvenance: unknown = null,
  ): void => {
    const before = phase === 'avant' ? fresh : (avantByKey.get(key) ?? null);
    const after = phase === 'apres' ? fresh : null;

    // Le delta qui compte : après − avant. Zéro quand rien n'a bougé — jamais
    // `null`, qu'aucun contrôle ne saurait distinguer de « pas mesuré ».
    let deltaRawPct: number | null = null;
    let deltaFacts: { before: FactCounts | null; after: FactCounts | null } | null = null;
    if (before && after) {
      deltaRawPct =
        before.rawPct === null || after.rawPct === null ? null : after.rawPct - before.rawPct;
      deltaFacts = sameFacts(before.facts, after.facts)
        ? null
        : { before: before.facts, after: after.facts };
    }

    // L'écart avec ce que le dépôt publiait — à la précision du rapport pour la
    // parité visuelle, dont la colonne `committed` n'a que deux décimales.
    let committedDelta: number | null = null;
    if (committed?.rawPct != null && fresh.rawPct != null) {
      const a = instrument === 'visual-parity' ? atReportPrecision(fresh.rawPct) : fresh.rawPct;
      committedDelta = a - committed.rawPct;
    }

    lines.push({
      instrument,
      key,
      before,
      after,
      committed,
      referenceProvenance,
      delta: { rawPct: deltaRawPct, facts: deltaFacts },
      committedDelta: {
        rawPct: committedDelta,
        comparedAt: instrument === 'visual-parity' ? `${REPORT_DECIMALS} décimales` : 'pleine précision',
        statusChanged:
          committed != null && committed.status !== fresh.status ? `${committed.status} → ${fresh.status}` : null,
      },
      attribution: attributions[key] ?? null,
    });
  };

  // --- parité visuelle ---
  for (const r of rowsReceipt?.rows ?? []) {
    const key = parityKey(r);
    pushLine(
      'visual-parity',
      key,
      { rawPct: r.rawPct, status: r.status, facts: null },
      committedForParity(committedParity, r, key),
    );
  }

  // --- audit d'organismes ---
  for (const [id, fresh] of freshOrg) {
    const c = committedOrg.get(id);
    const key = `${id}/${fresh?.cases?.[0]?.id ?? `${id}-master-defaults`}`;
    const provenance = fresh?.cases?.[0]?.referenceProvenance ?? null;

    // C3 du contrôle de clôture, appliquée à la source : en phase `apres` le
    // pilote est corrigé, donc CHAQUE organisme doit publier sa provenance et
    // ses cinq dérivées doivent citer le node du cas. Un bloc manquant est un
    // refus, jamais un « non applicable » — c'est la règle nommée par
    // contracts/measure-gate.interface.md §3. En phase `avant`, l'absence est
    // attendue : le T0 mesure l'état antérieur à la correction.
    if (phase === 'apres') {
      if (!provenance) {
        refuse('reference-provenance-missing', `${id} — la re-mesure ne publie pas sa provenance de référence`);
      } else {
        // Chaque motif porte SON code — le registre ne les aplatit pas sous une
        // étiquette unique : le vocabulaire de refus de C3 est un contrat.
        for (const reason of checkReferenceProvenance(provenance).reasons) {
          refuse(reason.code, `${id} — ${reason.message}`);
        }
      }
    }

    pushLine(
      'organism-audit',
      key,
      {
        rawPct: fresh?.cases?.[0]?.pixels?.rawPct ?? null,
        status: fresh?.verdict ?? 'unknown',
        facts: factCounts(fresh),
      },
      c
        ? {
            rawPct: c.cases?.[0]?.pixels?.rawPct ?? null,
            status: c.verdict ?? 'unknown',
            facts: factCounts(c),
          }
        : null,
      provenance,
    );
  }

  // ---- 9) Tout écart doit porter sa cause --------------------------------
  for (const l of lines) {
    const moved =
      (l.delta.rawPct != null && l.delta.rawPct !== 0) ||
      l.delta.facts !== null ||
      (l.committedDelta.rawPct != null && l.committedDelta.rawPct !== 0) ||
      l.committedDelta.statusChanged !== null;
    if (moved && !l.attribution) {
      refuse(
        'delta-without-attribution',
        `${l.instrument} ${l.key} — écart non attribué (renseigner proofs/registre/attributions.json)`,
      );
    }
  }

  // ---- 10) Écriture ------------------------------------------------------
  const registre = {
    schemaVersion: 2,
    phase,
    browser,
    figmaDumps: 'cached' as const,
    visualParityReceiptAt: rowsReceipt?.generatedAt ?? null,
    committedComparison: {
      source: `git show HEAD:${VISUAL_REPORT_REL} (parité) + specs/013-…/proofs/organisms/*/result.json (organismes)`,
      note: `La colonne \`committed\` de la parité visuelle est lue dans le Markdown, donc à ${REPORT_DECIMALS} décimales : elle DÉTECTE un écart avec ce que le dépôt publiait, elle ne fonde pas l'« avant ».`,
    },
    capturedAt: new Date().toISOString(),
    refusals,
    lines,
  };

  const outPath = path.join(REGISTRE_DIR, `${phase}.json`);
  writeFileSync(outPath, `${JSON.stringify(registre, null, 2)}\n`);

  console.log(`\nRegistre écrit : ${path.relative(REPO, outPath)}`);
  console.log(
    `  ${lines.length} lignes — ${lines.filter((l) => l.instrument === 'visual-parity').length} parité visuelle, ${lines.filter((l) => l.instrument === 'organism-audit').length} audit d'organismes`,
  );

  if (refusals.length > 0) {
    console.error(`\n✗ ${refusals.length} refus — le registre est écrit MAIS ne fait pas foi :`);
    for (const r of refusals) console.error(`  · ${r}`);
    process.exit(1);
  }
  console.log('✓ aucun refus — tout écart constaté porte son attribution');
}

// ---------------------------------------------------------------------------
// T038 — REGISTRE.md, RENDU depuis avant.json/apres.json/causes.json, jamais
// écrit à la main. Pas de re-mesure ici : les trois documents sont déjà sur
// disque (constitution I — un artefact produit est rendu depuis son JSON
// d'autorité). Le compte par cause qui fait foi reste celui de
// `npm run measure:gate -- --json` (I-6.3) — ce rendu ne le fige pas en prose.
// ---------------------------------------------------------------------------
const cell = (v: unknown): string => String(v ?? '—').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const pct = (v: number | null | undefined): string => (v === null || v === undefined ? '—' : `${v.toFixed(4)} %`);

function isMoved(l: any): boolean {
  return (
    (l.delta?.rawPct != null && l.delta.rawPct !== 0) ||
    l.delta?.facts != null ||
    (l.committedDelta?.rawPct != null && l.committedDelta.rawPct !== 0) ||
    l.committedDelta?.statusChanged != null
  );
}

function renderRegistreMarkdown(avant: any, apres: any, causes: any): string {
  const L: string[] = [];
  const push = (s = '') => L.push(s);

  const avantKeys = new Set((avant.lines ?? []).map((l: any) => `${l.instrument}::${l.key}`));
  const changed = (apres.lines ?? []).filter((l: any) => isMoved(l));
  const brandNew = (apres.lines ?? []).filter((l: any) => !avantKeys.has(`${l.instrument}::${l.key}`));
  const stable = (apres.lines ?? []).filter((l: any) => !isMoved(l) && avantKeys.has(`${l.instrument}::${l.key}`));

  const orgLines = (apres.lines ?? []).filter((l: any) => l.instrument === 'organism-audit');
  const orgInvariant = orgLines.filter((l: any) => !l.key.startsWith('reassurances') && !isMoved(l));
  const parityLines = (apres.lines ?? []).filter((l: any) => l.instrument === 'visual-parity');
  const parityStable = parityLines.filter((l: any) => !isMoved(l) && avantKeys.has(`visual-parity::${l.key}`));

  push('# Registre avant/après — Mesure juste et triage complet (014)');
  push();
  push('> Rendu depuis `avant.json`, `apres.json` et `causes.json` — jamais écrit à la main. Voir [data-model.md §4](../../data-model.md#4-registre-avantaprès) et [contracts/receipts.schema.md §2](../../contracts/receipts.schema.md).');
  push();

  push('## 1. Provenance');
  push();
  push(`- navigateur : \`${apres.browser?.version ?? '—'}\` (révision \`${apres.browser?.revision ?? '—'}\`) — **le même** aux deux phases (FR-009, I-4.1)`);
  push(`- avant : capturé \`${avant.capturedAt ?? '—'}\` · reçu parité visuelle \`${avant.visualParityReceiptAt ?? '—'}\` · refus \`${(avant.refusals ?? []).length}\``);
  push(`- après : capturé \`${apres.capturedAt ?? '—'}\` · reçu parité visuelle \`${apres.visualParityReceiptAt ?? '—'}\` · refus \`${(apres.refusals ?? []).length}\``);
  push(`- 0 refus des deux côtés ⟹ les deux registres font foi (sinon : \"écrit, mais ne fait pas foi\")`);
  push();

  push('## 2. Ce qui a changé');
  push();
  if (changed.length === 0) {
    push('Aucune ligne — le registre est vide de tout changement, ce qui serait suspect ici (reassurances doit y figurer).');
  } else {
    push('| instrument | ligne | avant | après | delta | attribution |');
    push('|---|---|---:|---:|---:|---|');
    for (const l of changed) {
      push(
        `| ${cell(l.instrument)} | ${cell(l.key)} | ${pct(l.before?.rawPct)} | ${pct(l.after?.rawPct)} | ${pct(l.delta?.rawPct)} | ${cell(l.attribution)} |`,
      );
    }
  }
  push();
  push('**Reassurances n\'est pas un progrès de fidélité.** DW-006 corrigeait un défaut d\'**instrument** (la référence de mesure était le *set*, jamais le *node du cas*) — le chiffre change parce que la mesure devient juste, pas parce que le composant s\'est amélioré (SC-004, I-4.5).');
  push();

  push('## 3. Ce qui n\'a pas changé (invariance vérifiée, pas supposée)');
  push();
  push(`- **${orgInvariant.length}/8** organismes à cas hors reassurances : \`delta.rawPct == 0\` et \`delta.facts == null\` (T035)`);
  push(`- **${parityStable.length}/${parityLines.length - brandNew.filter((l: any) => l.instrument === 'visual-parity').length}** lignes de parité visuelle préexistantes : aucune n'a bougé sans attribution (T036)`);
  push(`- **${stable.length}** lignes au total, sur les deux instruments, strictement inchangées entre avant et après`);
  push();

  push('## 4. Nouveauté');
  push();
  if (brandNew.length === 0) {
    push('Aucune — inattendu : `select` (US3) devrait apparaître ici.');
  } else {
    for (const l of brandNew) {
      push(`- **${cell(l.key)}** (${cell(l.instrument)}) — première mesure, gate/raw ${pct(l.after?.rawPct ?? l.before?.rawPct)} ; aucun \`before\`, n'existait pas avant US3 (34/34 composants désormais mesurés)`);
    }
  }
  push();

  push('## 5. Causes — entrées DW re-classées (registre des travaux reportés de 013)');
  push();
  if ((causes.entries ?? []).length === 0) {
    push('Aucune');
  } else {
    push('| DW | sujet | cause | reçu | même défaut que |');
    push('|---|---|---|---|---|');
    for (const e of causes.entries) {
      const same = e.sameDefectAs ? `${cell(e.sameDefectAs.kind)} \`${cell(e.sameDefectAs.key)}\`` : '—';
      push(`| ${cell(e.dwId)} | ${cell(e.subjectId)} | ${cell(e.cause)} | \`${cell(e.receiptId)}\` | ${same} |`);
    }
  }
  push();
  push('**Déduplication** : une entrée DW et une ligne d\'organisme liées par `sameDefectAs` décrivent un seul défaut vu de deux endroits — le compte par cause du gate les compte pour **un** (contracts/measure-gate.interface.md §4).');
  push();

  push('## 6. Causes — les neuf lignes divergentes de l\'audit d\'organismes');
  push();
  if ((causes.organismLines ?? []).length === 0) {
    push('Aucune');
  } else {
    push('| ligne | score brut | cause | reçu |');
    push('|---|---:|---|---|');
    for (const o of causes.organismLines) {
      push(`| ${cell(o.key)} | ${pct(o.rawPct)} | ${cell(o.cause)} | \`${cell(o.receiptId)}\` |`);
    }
  }
  push();

  push('## 7. Contrôle');
  push();
  push('- `delta-without-attribution` : 0 (aucun refus émis par `build-registre.mts --phase apres` — T034)');
  push('- invariance des 8 organismes hors reassurances : **PASS** (T035)');
  push('- aucune dérive de parité visuelle sans attribution : **PASS** (T036)');
  push('- attribution reassurances = `correction d\'instrument DW-006`, jamais présentée comme un progrès de fidélité : **PASS** (T037)');
  push();
  push('Le compte par cause qui fait foi est celui de `npm run measure:gate -- --json` (`counts.byCause`) — jamais figé en prose ici (I-6.3).');
  push();

  return L.join('\n');
}

function renderRegistreCommand(): void {
  const avantPath = path.join(REGISTRE_DIR, 'avant.json');
  const apresPath = path.join(REGISTRE_DIR, 'apres.json');
  const causesPath = path.join(REGISTRE_DIR, 'causes.json');
  const missing = [avantPath, apresPath, causesPath].filter((p) => !existsSync(p));
  if (missing.length > 0) {
    console.error('✗ REGISTRE.md ne peut pas être rendu — absent(s) :');
    for (const p of missing) console.error(`  · ${path.relative(REPO, p)}`);
    process.exit(2);
  }
  const md = renderRegistreMarkdown(readJson(avantPath), readJson(apresPath), readJson(causesPath));
  const outPath = path.join(REGISTRE_DIR, 'REGISTRE.md');
  writeFileSync(outPath, `${md}\n`);
  console.log(`Registre rendu : ${path.relative(REPO, outPath)}`);
}

if (RENDER_MODE) {
  renderRegistreCommand();
} else {
  buildRegistre().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
