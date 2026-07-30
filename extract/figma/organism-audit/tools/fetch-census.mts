/**
 * Amène en cache le census Figma des sujets d'une vague — GET seulement.
 *
 * Un seul écrivain sur le cache : les agents de déclaration le LISENT ensuite
 * sans jamais toucher l'API.  Trois agents qui fetchent le même fichier en
 * parallèle, c'est trois chances de 429 et trois versions possiblement
 * différentes pinées dans un même manifeste.
 *
 *   npx tsx extract/figma/organism-audit/tools/fetch-census.mts 2
 *   npx tsx extract/figma/organism-audit/tools/fetch-census.mts 2 --refresh
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchSetInfos } from '../../visual-parity/figma-api.js';

// Le dépôt est déduit de l'emplacement de CE fichier : lancés depuis un
// worktree (Worktree Gates F1), ces outils doivent auditer l'arbre courant,
// jamais le checkout principal.
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const CACHE = path.join(REPO, 'extract/figma/visual-parity/out/_cache');

const wave = Number(process.argv[2]);
if (!Number.isInteger(wave) || wave < 1 || wave > 3) {
  console.error('usage: fetch-census.mts <1|2|3> [--refresh]');
  process.exit(2);
}
const refresh = process.argv.includes('--refresh');

const campaign = JSON.parse(
  readFileSync(path.join(REPO, 'specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json'), 'utf8'),
) as any;

const targets = campaign.subjects.filter((s: any) => s.wave === wave);
const setIds = targets.map((s: any) => s.figmaSetNodeId);
console.log(`vague ${wave} : ${targets.length} sujet(s) — ${setIds.join(', ')}\n`);

const infos = await fetchSetInfos(CACHE, campaign.reference.fileKey, setIds, refresh);

let stale = 0;
for (const subject of targets) {
  const info = infos.get(subject.figmaSetNodeId)!;
  const ok = info.version === campaign.reference.fileVersion;
  if (!ok) stale += 1;
  console.log(
    `${ok ? '✓' : '✗'} ${subject.id.padEnd(14)} ${subject.figmaSetNodeId.padEnd(11)} ` +
      `"${info.setName}" v${info.version}${ok ? '' : ` ≠ manifeste ${campaign.reference.fileVersion}`}\n` +
      `  variantes : ${info.variants.map((v: any) => `${v.name} (${v.nodeId})`).join(', ')}\n` +
      `  polices   : ${info.fontFamilies.join(', ') || 'aucune'}`,
  );
}

if (stale > 0) {
  console.error(
    `\n${stale} census hors de la version pinée — re-piner le manifeste AVANT de déclarer quoi que ce soit.`,
  );
  process.exit(2);
}
console.log(`\ncensus en cache, version pinée ${campaign.reference.fileVersion} confirmée.`);
