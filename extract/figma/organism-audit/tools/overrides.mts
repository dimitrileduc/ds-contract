/**
 * Fusion des overrides par sujet + résolution `{"$asset":"id"}` → file://
 * (octets vérifiés SHA-256). Partagé par run-one.mts ET run-wave.mts — un
 * runner qui audite sans les overrides mesure un rendu sans photos et
 * fabrique une fausse régression (constaté : devis 0,14 % → 72 % sur la
 * seule absence de fusion).
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ASSETS_DIR_REL = 'extract/figma/visual-parity/fixture-assets';
const OVERRIDES_DIR_REL = 'extract/figma/organism-audit/out/overrides';

export function applySubjectOverrides(repoRoot: string, subject: {
  id: string;
  cases?: Array<{ reactProps?: Record<string, unknown>; fixtureAssetIds?: string[] }>;
}): string[] {
  const notes: string[] = [];
  const c = subject.cases?.[0];
  if (!c) return notes;

  const overridePath = path.join(repoRoot, OVERRIDES_DIR_REL, `${subject.id}.json`);
  if (existsSync(overridePath)) {
    const override = JSON.parse(readFileSync(overridePath, 'utf8')) as {
      reactProps?: Record<string, unknown>;
      fixtureAssetIds?: string[];
    };
    if (override.reactProps) c.reactProps = { ...c.reactProps, ...override.reactProps };
    if (override.fixtureAssetIds) {
      c.fixtureAssetIds = [...new Set([...(c.fixtureAssetIds ?? []), ...override.fixtureAssetIds])];
    }
    notes.push(`override: ${path.relative(repoRoot, overridePath)}`);
  }

  const manifestPath = path.join(repoRoot, ASSETS_DIR_REL, 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    assets: Array<{ id: string; file: string; sha256: string }>;
  };
  for (const [key, value] of Object.entries(c.reactProps ?? {})) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) continue;
    const keys = Object.keys(value as Record<string, unknown>);
    if (keys.length !== 1 || keys[0] !== '$asset') continue;
    const assetId = (value as { $asset: unknown }).$asset;
    const entry = manifest.assets.find((a) => a.id === assetId);
    if (!entry) throw new Error(`${subject.id}: asset "${String(assetId)}" absent du manifeste`);
    const bytes = readFileSync(path.join(repoRoot, ASSETS_DIR_REL, entry.file));
    const sha = createHash('sha256').update(bytes).digest('hex');
    if (sha !== entry.sha256) throw new Error(`${subject.id}: SHA de ${entry.file} ≠ manifeste`);
    c.reactProps![key] = `file://${path.join(repoRoot, ASSETS_DIR_REL, entry.file)}`;
    notes.push(`asset: ${key} → ${entry.file} (sha ok)`);
  }
  return notes;
}
