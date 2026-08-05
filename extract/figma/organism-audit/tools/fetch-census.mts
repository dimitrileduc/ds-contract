/**
 * Amène en cache le census Figma des sujets d'une vague — GET seulement.
 *
 * Un seul écrivain sur le cache : les agents de déclaration le LISENT ensuite
 * sans jamais toucher l'API.  Trois agents qui fetchent le même fichier en
 * parallèle, c'est trois chances de 429 et trois versions possiblement
 * différentes pinées dans un même manifeste.
 *
 * DW-006 (FR-001) : le census amène désormais le node du CAS — le
 * sous-arbre effectivement mesuré par le pilote — en PLUS du set. Les deux
 * sont cachés : la plupart des faits se recoupent contre le cas, mais
 * certains (les définitions de propriété du set, ou une comparaison
 * délibérée avec une variante sœur — ex. reassurances.property.disposition-*
 * et carte-largeur-cinq-cartes, qui documentent l'axe Disposition lui-même)
 * référencent légitimement un node hors du cas sans être des hallucinations
 * pour autant. Un sujet sans cas (vague 3, portes fermées) n'a rien à
 * basculer : son seul node connu reste le set.
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

/** Le node du cas (DW-006) ; à défaut de cas (vague 3), le set — rien à basculer. */
const censusNodeId = (s: any): string => s.cases?.[0]?.figmaNodeId ?? s.figmaSetNodeId;

const targets = campaign.subjects.filter((s: any) => s.wave === wave);
// Le cas d'abord (primaire, DW-006) ; le set toujours en plus, dédupliqué —
// c'est lui qui porte les faits de définition de propriété et les
// comparaisons inter-variantes légitimes (voir en-tête).
const setIdSet = new Set<string>();
for (const s of targets as any[]) {
  setIdSet.add(censusNodeId(s));
  setIdSet.add(s.figmaSetNodeId as string);
}
const setIds = [...setIdSet];
console.log(`vague ${wave} : ${targets.length} sujet(s) — ${setIds.join(', ')}\n`);

const infos = await fetchSetInfos(CACHE, campaign.reference.fileKey, setIds, refresh);

let stale = 0;
for (const subject of targets) {
  const nodeId = censusNodeId(subject);
  const info = infos.get(nodeId)!;
  const ok = info.version === campaign.reference.fileVersion;
  if (!ok) stale += 1;
  console.log(
    `${ok ? '✓' : '✗'} ${subject.id.padEnd(14)} ${nodeId.padEnd(11)} ` +
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
