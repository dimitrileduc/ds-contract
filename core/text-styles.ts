/**
 * Pure derivation of named Figma Text Styles from DTCG semantic tokens.
 *
 * A typography recipe is a group, not a single variable. Its Figma identity
 * therefore lives in group metadata while every measurable ingredient keeps
 * its normal token path. The legacy `font.<group>.size` convention remains
 * supported for foreign/demo token sets.
 */
import { px, type TokenEntry } from './tokens.js';

export type TextStyleCase = 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';

export interface DerivedTextStyle {
  name: string;
  /** Stable identity marker stored in ds_contracts/textStyleToken. */
  tokenPath: string;
  familyPath?: string;
  weightPath?: string;
  lineHeightPath?: string;
  letterSpacingPath?: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: string;
  lineHeight?: number;
  letterSpacing: { unit: 'PIXELS' | 'PERCENT'; value: number };
  textCase: TextStyleCase;
  /** Project styles must already carry their historical identity marker. */
  requiresExistingMarker: boolean;
}

interface TextStyleExtension {
  name: string;
  textCase?: TextStyleCase;
  letterSpacingUnit?: 'PIXELS' | 'PERCENT';
}

export interface DeriveTextStylesInput {
  semanticTree: Record<string, unknown>;
  semantic: Map<string, TokenEntry>;
  resolveLiteral(dotPath: string): unknown;
  fontStyleByWeight: Record<number, string>;
}

const firstFamily = (value: unknown): string => {
  if (typeof value !== 'string') return 'Inter';
  return value.split(',')[0].trim().replace(/^["']|["']$/g, '') || 'Inter';
};

const extensionFor = (group: unknown): TextStyleExtension | null => {
  if (!group || typeof group !== 'object' || Array.isArray(group)) return null;
  const extensions = (group as Record<string, unknown>).$extensions;
  if (!extensions || typeof extensions !== 'object' || Array.isArray(extensions)) return null;
  const owner = (extensions as Record<string, unknown>).ds_contracts;
  if (!owner || typeof owner !== 'object' || Array.isArray(owner)) return null;
  const style = (owner as Record<string, unknown>).figmaTextStyle;
  if (!style || typeof style !== 'object' || Array.isArray(style)) return null;
  const parsed = style as Record<string, unknown>;
  if (typeof parsed.name !== 'string' || parsed.name.length === 0) return null;
  return parsed as unknown as TextStyleExtension;
};

export function deriveTextStyles(input: DeriveTextStylesInput): DerivedTextStyle[] {
  const { semantic, semanticTree, resolveLiteral, fontStyleByWeight } = input;
  const out: DerivedTextStyle[] = [];

  // Legacy convention used by generic fixtures and foreign token sets.
  for (const [sizePath] of semantic) {
    const match = sizePath.match(/^font\.(.+?)\.size(?:\.([^.]+))?$/);
    if (!match) continue;
    const group = match[1];
    const name = [group, ...(match[2] ? [match[2]] : [])].join('/').split('.').join('/');
    const weightPath = `font.${group}.weight`;
    const hasWeight = semantic.has(weightPath);
    const fontWeight = hasWeight ? px(resolveLiteral(weightPath)) : 500;
    out.push({
      name,
      tokenPath: sizePath,
      ...(hasWeight ? { weightPath } : {}),
      fontFamily: 'Inter',
      fontSize: px(resolveLiteral(sizePath)),
      fontWeight,
      fontStyle: fontStyleByWeight[fontWeight] ?? 'Medium',
      letterSpacing: { unit: 'PIXELS', value: 0 },
      textCase: 'ORIGINAL',
      requiresExistingMarker: false,
    });
  }

  const typography = semanticTree.typography;
  if (typography && typeof typography === 'object' && !Array.isArray(typography)) {
    for (const [role, group] of Object.entries(typography as Record<string, unknown>)) {
      const ext = extensionFor(group);
      if (!ext) continue;
      const base = `typography.${role}`;
      const familyPath = `${base}.family`;
      const sizePath = `${base}.size`;
      const weightPath = `${base}.weight`;
      const lineHeightPath = `${base}.line-height`;
      const letterSpacingPath = `${base}.letter-spacing`;
      for (const required of [familyPath, sizePath, weightPath]) {
        if (!semantic.has(required)) throw new Error(`Figma Text Style "${ext.name}" is missing ${required}`);
      }
      const fontWeight = px(resolveLiteral(weightPath));
      const hasLineHeight = semantic.has(lineHeightPath);
      const hasLetterSpacing = semantic.has(letterSpacingPath);
      out.push({
        name: ext.name,
        tokenPath: sizePath,
        familyPath,
        weightPath,
        ...(hasLineHeight ? { lineHeightPath } : {}),
        ...(hasLetterSpacing ? { letterSpacingPath } : {}),
        fontFamily: firstFamily(resolveLiteral(familyPath)),
        fontSize: px(resolveLiteral(sizePath)),
        fontWeight,
        fontStyle: fontStyleByWeight[fontWeight] ?? 'Medium',
        ...(hasLineHeight ? { lineHeight: px(resolveLiteral(lineHeightPath)) } : {}),
        letterSpacing: {
          // Historical Piqueray Text Styles store tracking in percent, even
          // when its value is zero. Preserve that exact Figma definition.
          unit: ext.letterSpacingUnit ?? 'PERCENT',
          value: hasLetterSpacing ? px(resolveLiteral(letterSpacingPath)) : 0,
        },
        textCase: ext.textCase ?? 'ORIGINAL',
        requiresExistingMarker: true,
      });
    }
  }

  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function effectiveLetterSpacingPx(style: DerivedTextStyle): number {
  return style.letterSpacing.unit === 'PERCENT'
    ? style.fontSize * style.letterSpacing.value / 100
    : style.letterSpacing.value;
}
