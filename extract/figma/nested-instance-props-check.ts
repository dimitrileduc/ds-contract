/**
 * Nested-instance applied-props extraction receipt.
 *
 * Fixture: a REST nodes response modeled on the source-clean CarouselControls
 * icon-only instances, with adversarial empty TEXT, opposite BOOLEAN values,
 * and INSTANCE_SWAP selections (ChevronLeft / ChevronRight). The check traverses
 * the real REST mapper and the real batch proposer, then asserts that none of
 * those falsy/configured values disappear during child-prop canonicalization.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { mapRestToDump, type RestNodesResponse } from './rest/map.js';
import { isDumpSet } from './types.js';
import { loadTokenCorpus } from './tokens.js';
import { loadContracts } from './propose.js';
import { proposeBatchFromDump } from '../../core/propose-figma.js';

const ROOT = process.cwd();
const fixturePath = path.join(ROOT, 'extract/figma/fixtures/carousel-controls-nested-props.rest-response.json');
const response = JSON.parse(readFileSync(fixturePath, 'utf8')) as RestNodesResponse;
const mapped = mapRestToDump(response, { fileKey: 'd9FYAUcqdcNtsuaMgLefvJ', target: 'CarouselControls' });

const set = mapped.dump.CarouselControls;
if (!set || !isDumpSet(set)) throw new Error('fixture did not map CarouselControls');
const [leftDump, rightDump] = set.variants[0].children ?? [];
const expectDump = (label: string, node: typeof leftDump, expected: Record<string, string | boolean>) => {
  if (!node?.componentProperties) throw new Error(`${label}: componentProperties absent after REST mapping`);
  for (const [key, value] of Object.entries(expected)) {
    if (!(key in node.componentProperties) || node.componentProperties[key] !== value) {
      throw new Error(`${label}: expected ${key}=${JSON.stringify(value)}, got ${JSON.stringify(node.componentProperties)}`);
    }
  }
};
expectDump('left dump', leftDump, {
  'Libelle#2044:28': '',
  'Icone gauche#2024:0': true,
  'Icone droite#2024:7': false,
  'Glyphe gauche#2028:14': 'ChevronLeft',
});
expectDump('right dump', rightDump, {
  'Libelle#2044:28': '',
  'Icone gauche#2024:0': false,
  'Icone droite#2024:7': true,
  'Glyphe droite#2028:21': 'ChevronRight',
});

const loaded = loadContracts(path.join(ROOT, 'contracts'));
const contractIdByKey = new Map<string, string>();
for (const [id, contract] of loaded.byId) {
  const key = contract.anchors?.figma?.componentSetKey;
  if (key) contractIdByKey.set(key, id);
}
const batch = proposeBatchFromDump(mapped.dump, {
  corpus: loadTokenCorpus(ROOT),
  contractIdByName: loaded.byName,
  contractIdByKey,
  contractsById: loaded.byId,
  fileKey: 'd9FYAUcqdcNtsuaMgLefvJ',
  mintUnbound: true,
});
const proposal = batch.proposals.find((p) => (p.contract as { id?: string }).id === 'ds.carousel-controls');
if (!proposal) throw new Error('proposer did not emit ds.carousel-controls');
const parts = ((proposal.contract as any).anatomy.root.parts ?? {}) as Record<string, any>;
const refs = Object.values(parts).filter((part) => part.component);
if (refs.length !== 2) throw new Error(`expected two nested component refs, got ${JSON.stringify(parts)}`);
const [leftPart, rightPart] = refs;
const [left, right] = [leftPart.component, rightPart.component];
if (left.text !== '' || right.text !== '') {
  throw new Error(`empty child text must lower to component.text="" (not absence): ${JSON.stringify(refs)}`);
}
const expectProps = (label: string, got: Record<string, unknown> | undefined, expected: Record<string, unknown>) => {
  if (!got) throw new Error(`${label}: component.props absent`);
  for (const [key, value] of Object.entries(expected)) {
    if (!(key in got) || got[key] !== value) {
      throw new Error(`${label}: expected ${key}=${JSON.stringify(value)}, got ${JSON.stringify(got)}`);
    }
  }
};
expectProps('left proposal', left.props, {
  variant: 'iconOnly',
  iconLeft: true,
  iconRight: false,
  iconLeftGlyph: 'chevron-left',
});
expectProps('right proposal', right.props, {
  variant: 'iconOnly',
  iconLeft: false,
  iconRight: true,
  iconRightGlyph: 'chevron-right',
});

console.log('✔ REST mapper preserves empty nested TEXT values');
console.log('✔ REST mapper preserves nested BOOLEAN true/false values');
console.log('✔ REST mapper resolves nested INSTANCE_SWAP ids to ChevronLeft/ChevronRight');
console.log('✔ proposer canonicalizes all fixed values through ds.button without dropping falsy values');
