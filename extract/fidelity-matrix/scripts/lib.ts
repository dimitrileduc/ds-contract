/**
 * Shared node-side harness plumbing: the SAME repo data the playground
 * bundles (playground/src/engine/data.ts) and the CLI shells read, loaded
 * from disk; plus the minted-layer composition token-source.ts performs
 * (minted tree deep-merged into the semantic slot, inventory extended).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  ContractSchema,
  tokenCorpusFromJson,
  tokenInventoryFromJson,
  type Contract,
  type TokenCorpus,
} from '../../../core/index.js';

export const REPO = path.resolve(new URL('../../..', import.meta.url).pathname);
export const MATRIX = path.join(REPO, 'extract', 'fidelity-matrix');

export const readJson = (p: string): unknown => JSON.parse(readFileSync(p, 'utf8'));

export interface RepoData {
  tokens: {
    primitives: Record<string, unknown>;
    semantic: Record<string, unknown>;
    light: Record<string, unknown>;
    dark: Record<string, unknown>;
    brands: Record<string, Record<string, unknown>>;
  };
  inventory: Set<string>;
  corpus: TokenCorpus;
  treesForCode: unknown[];
  contracts: Map<string, Contract>;
  contractIdByName: Map<string, string>;
  /** componentSetKey → contract id (dump v1.5 session linking) — every repo
   *  contract with a non-null anchors.figma.componentSetKey. */
  contractIdByKey: Map<string, string>;
  icons: Map<string, string>;
  /** src/styles/tokens.css — the preview document's custom-property source. */
  tokensCss: string;
}

export function loadRepoData(): RepoData {
  const t = (p: string) => readJson(path.join(REPO, 'tokens', p)) as Record<string, unknown>;
  const primitives = t('primitives.tokens.json');
  const semantic = t('semantic.tokens.json');
  const light = t('modes/semantic.light.tokens.json');
  // Mono-theme (Piqueray): the dark-mode overrides file was removed — absent means none.
  const dark = existsSync(path.join(REPO, 'tokens', 'modes/semantic.dark.tokens.json'))
    ? t('modes/semantic.dark.tokens.json')
    : ({} as Record<string, unknown>);
  const brands = Object.fromEntries(
    readdirSync(path.join(REPO, 'tokens', 'modes'))
      .filter((f) => /^brand\.[a-z][a-z0-9-]*\.tokens\.json$/.test(f))
      .map((f) => [f.replace(/^brand\.|\.tokens\.json$/g, ''), t(`modes/${f}`)]),
  );
  const contracts = new Map<string, Contract>(
    readdirSync(path.join(REPO, 'contracts'))
      .filter((f) => f.endsWith('.contract.json'))
      .map((f) => ContractSchema.parse(readJson(path.join(REPO, 'contracts', f))))
      .map((c) => [c.id, c]),
  );
  // Both governed SVG dirs: `assets/icons/` (registry glyphs) AND
  // `assets/vectors/` (part-level vector assets like carte-categorie-decor,
  // piqueray-logo-*). validateContract checks a contract's icon AND vectorAsset
  // parts against this single map, so a contract carrying a vectorAsset is
  // refused if vectors are not loaded. Mirrors generate-components /
  // build-plugin-zip / emitters-check, which all read ['icons','vectors'].
  // (023: the first vectorAsset contract added as a visual-parity subject
  // exposed that this loader read icons only — a silent, pre-existing gap.)
  const icons = new Map<string, string>(
    ['icons', 'vectors'].flatMap((subdir) => {
      // Répertoire absent = zéro glyphe, pas une exception : les trois copies
      // sœurs dégradent ainsi (emitters-check, build-plugin-zip), et une porte
      // de mesure qui plante là où ses sœurs sautent est une porte de moins.
      const dir = path.join(REPO, 'assets', subdir);
      if (!existsSync(dir)) return [] as Array<[string, string]>;
      return readdirSync(dir)
        .filter((f) => f.endsWith('.svg'))
        .map((f) => [f.replace(/\.svg$/, ''), readFileSync(path.join(dir, f), 'utf8').trim()] as [string, string]);
    }),
  );
  return {
    tokens: { primitives, semantic, light, dark, brands },
    inventory: tokenInventoryFromJson([primitives, semantic, light, dark]),
    corpus: tokenCorpusFromJson({ primitives, semantic, light, brandDefault: brands.default ?? {} }),
    treesForCode: [primitives, semantic, light, dark],
    contracts,
    contractIdByName: new Map([...contracts.values()].map((c) => [c.name, c.id])),
    contractIdByKey: new Map(
      [...contracts.values()]
        .filter((c) => c.anchors.figma.componentSetKey !== null)
        .map((c) => [c.anchors.figma.componentSetKey!, c.id]),
    ),
    icons,
    tokensCss: readFileSync(path.join(REPO, 'src', 'styles', 'tokens.css'), 'utf8'),
  };
}

/** token-source.ts composeSource, node-side: minted tree rides the semantic
 *  slot (root `imported` — no collision by the MINT_NAMESPACE invariant). */
export function composeMinted(
  data: RepoData,
  minted: { tree: Record<string, unknown>; count: number } | undefined,
): { tokens: RepoData['tokens']; inventory: Set<string> } {
  if (!minted || minted.count === 0) return { tokens: data.tokens, inventory: data.inventory };
  return {
    tokens: { ...data.tokens, semantic: { ...data.tokens.semantic, ...minted.tree } },
    inventory: new Set([...data.inventory, ...tokenInventoryFromJson([minted.tree])]),
  };
}
