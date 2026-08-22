import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildArtifacts, inspect } from './build-assets.js';
import { checkConfig, type AuthoringConfig } from './check-authoring.js';
import { canonicalJson, repoPath, repoRelative, sha256 } from './lib/canonical.js';
import { arg, runAsCli } from './lib/cli.js';
import { listAuthoringConfigs, loadAllContracts } from './lib/repo-data.js';
import { validateOrThrow } from './lib/schemas.js';

interface RegistryEntry { adaptationId: string; path: string; reasonCode: string; mechanism: string }
interface Registry { schemaVersion: string; reasonCodes: Array<{ code: string; description: string }>; adaptations: RegistryEntry[] }
interface Block { id: string; path: string; start: number; end: number; lines: number; bytes: number }

const TARGETS = [
  repoPath('integrations/odoo/addons/piqueray_ds/views'),
  repoPath('integrations/odoo/addons/piqueray_ds/static/src/js'),
  repoPath('integrations/odoo/addons/piqueray_ds/static/src/xml'),
  repoPath('integrations/odoo/addons/piqueray_ds/static/src/css/odoo-bridge.css'),
  // Spec 022 : le semis du menu (ODOO-022-MENU-SEED) vit dans data/*.xml. La
  // migration `.py` n'est PAS scannée (filtre js|xml|css) — c'est un crochet
  // « une fois », pas une zone de rendu comptée ; seule la donnée semée l'est.
  repoPath('integrations/odoo/addons/piqueray_ds/data'),
];

function filesUnder(target: string): string[] {
  if (!existsSync(target)) return [];
  if (statSync(target).isFile()) return [target];
  return readdirSync(target).sort().flatMap((name) => filesUnder(path.join(target, name)))
    .filter((file) => /\.(?:js|xml|css)$/.test(file));
}

export function extractBlocks(files: string[]): { blocks: Block[]; overlap: string[]; unmarkedFiles: string[] } {
  const blocks: Block[] = [];
  const overlap: string[] = [];
  const unmarkedFiles: string[] = [];
  const ids = new Set<string>();
  for (const file of files.sort()) {
    const source = readFileSync(file, 'utf8');
    const lines = source.split('\n');
    const stack: Array<{ id: string; line: number; offset: number }> = [];
    let offset = 0;
    let found = 0;
    lines.forEach((line, index) => {
      // Marqueurs de toute vague : ODOO-019-* (fondation) ET ODOO-022-* (wave B),
      // etc. — la même généralisation `\d{3}` que la regex de libellé de 005.
      const begin = /\b(ODOO-\d{3}-[A-Z0-9-]+) BEGIN\b/.exec(line);
      const end = /\b(ODOO-\d{3}-[A-Z0-9-]+) END\b/.exec(line);
      if (begin) {
        found += 1;
        if (stack.length) overlap.push(`imbrique/${repoRelative(file)}/${index + 1}/${begin[1]}/dans/${stack.at(-1)?.id}`);
        stack.push({ id: begin[1], line: index + 1, offset });
      }
      if (end) {
        const open = stack.pop();
        if (!open || open.id !== end[1]) overlap.push(`fin-sans-debut/${repoRelative(file)}/${index + 1}/${end[1]}`);
        else {
          const endOffset = offset + Buffer.byteLength(line) + 1;
          if (ids.has(open.id)) overlap.push(`identifiant-duplique/${open.id}`);
          ids.add(open.id);
          blocks.push({ id: open.id, path: repoRelative(file), start: open.line, end: index + 1, lines: index + 2 - open.line, bytes: endOffset - open.offset });
        }
      }
      offset += Buffer.byteLength(line) + 1;
    });
    for (const open of stack) overlap.push(`debut-sans-fin/${repoRelative(file)}/${open.line}/${open.id}`);
    if (found === 0) unmarkedFiles.push(repoRelative(file));
  }
  return { blocks: blocks.sort((a, b) => a.id.localeCompare(b.id)), overlap: overlap.sort(), unmarkedFiles: unmarkedFiles.sort() };
}

function bucket(entries: Array<Block & { key: string }>) {
  const keys = [...new Set(entries.map((entry) => entry.key))].sort();
  return keys.map((key) => {
    const rows = entries.filter((entry) => entry.key === key);
    return { key, files: new Set(rows.map((row) => row.path)).size, blocks: rows.length, lines: rows.reduce((n, row) => n + row.lines, 0), bytes: rows.reduce((n, row) => n + row.bytes, 0) };
  });
}

export function buildReport(registryPath: string) {
  const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as Registry;
  validateOrThrow('adaptation-registry', registry, repoRelative(registryPath));
  const discovered = extractBlocks(TARGETS.flatMap(filesUnder));
  const registryById = new Map(registry.adaptations.map((entry) => [entry.adaptationId, entry]));
  const blocksById = new Map(discovered.blocks.map((entry) => [entry.id, entry]));
  const unclassifiedBlocks = [...blocksById.keys()].filter((id) => !registryById.has(id)).sort();
  const registryEntries = registry.adaptations.filter((entry) => !blocksById.has(entry.adaptationId) || blocksById.get(entry.adaptationId)?.path !== entry.path).map((entry) => entry.adaptationId).sort();
  const classified = discovered.blocks.flatMap((block) => {
    const entry = registryById.get(block.id);
    return entry ? [{ ...block, reasonCode: entry.reasonCode, mechanism: entry.mechanism }] : [];
  });

  const contracts = loadAllContracts();
  // Énumérées, jamais listées : le rapport doit compter la couverture de TOUTES
  // les configs présentes, sinon une config ajoutée sortirait des totaux sans
  // que le chiffre ait l'air faux. Les agrégats sont des sommes et des listes
  // triées — l'ordre d'énumération ne change donc aucun octet du rapport.
  const reports = listAuthoringConfigs().map((abs) =>
    checkConfig(JSON.parse(readFileSync(abs, 'utf8')) as AuthoringConfig, repoRelative(abs), contracts));
  const assetStates = inspect(buildArtifacts());
  const generatedArtifacts = assetStates.map((state) => ({
    path: state.path, status: state.status, expectedSha256: state.expectedSha256, actualSha256: state.actualSha256, bytes: state.bytes,
  })).sort((a, b) => a.path.localeCompare(b.path));
  const manualRows = classified.map((row) => ({ ...row, key: row.reasonCode }));
  const mechanismRows = classified.map((row) => ({ ...row, key: row.mechanism }));
  const base = {
    schemaVersion: '1.0.0', snapshotId: 'odoo-019-foundation', generatorVersion: '1.0.0',
    coverage: {
      expectedProps: reports.reduce((n, report) => n + report.expectedProps, 0), decidedProps: reports.reduce((n, report) => n + report.decidedProps, 0),
      expectedParts: reports.reduce((n, report) => n + report.expectedParts, 0), decidedParts: reports.reduce((n, report) => n + report.decidedParts, 0),
      missingDecisionIds: reports.flatMap((report) => report.missing).sort(), extraDecisionIds: reports.flatMap((report) => report.extra).sort(), invalidAddresses: reports.flatMap((report) => report.problemes).sort(),
    },
    generatedArtifacts,
    manualDelta: {
      files: new Set(classified.map((row) => row.path)).size, blocks: classified.length,
      lines: classified.reduce((n, row) => n + row.lines, 0), bytes: classified.reduce((n, row) => n + row.bytes, 0),
      byReasonCode: bucket(manualRows), byMechanism: bucket(mechanismRows),
    },
    unclassified: { files: discovered.unmarkedFiles, blocks: [...discovered.overlap, ...unclassifiedBlocks].sort(), registryEntries },
  };
  // `canonicalDigest` se calcule sur la sérialisation CANONIQUE (clés triées) :
  // `JSON.stringify` suit l'ordre d'insertion, ce que l'eval de 019 met
  // justement à l'épreuve en inversant le registre avant de reconstruire.
  const report = { ...base, canonicalDigest: sha256(canonicalJson(base)) };
  validateOrThrow('derivation-report', report, 'derivation-report.json');
  return report;
}

async function main() {
  const registry = arg(process.argv, '--registry') ?? 'integrations/odoo/config/adaptation-registry.json';
  const output = arg(process.argv, '--out') ?? 'integrations/odoo/derivation-report.json';
  const report = buildReport(path.resolve(registry));
  const bytes = JSON.stringify(report, null, 2) + '\n';
  if (process.argv.includes('--check')) {
    if (!existsSync(output) || readFileSync(output, 'utf8') !== bytes) throw new Error(`${output} absent ou tampered`);
    if (Object.values(report.unclassified).some((items) => items.length)) throw new Error(`adaptations non classées: ${JSON.stringify(report.unclassified)}`);
    if (report.generatedArtifacts.some((item) => item.status !== 'clean')) throw new Error('sortie générée tampered/missing/orphan');
    console.log(`✔ derivation report clean · ${report.manualDelta.blocks} blocs · ${report.canonicalDigest.slice(0, 12)}…`);
    return;
  }
  writeFileSync(output, bytes);
  console.log(`✔ ${output} · ${report.manualDelta.blocks} blocs · ${report.canonicalDigest}`);
}
runAsCli(import.meta.url, main);
