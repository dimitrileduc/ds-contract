/**
 * Code-side extraction — reads the ACTUAL React source (not the contract)
 * so hand edits are detected. Uses the TypeScript compiler API to pull each
 * component's props interface (names, enum unions, booleans, optionality)
 * and the destructuring defaults, plus the CSS custom properties its
 * CSS Module consumes.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { type ExtractedDefault, type RichTextSegment } from './defaults.js';

export interface CodeProp {
  name: string;
  kind: 'enum' | 'boolean' | 'other';
  values?: string[];
  optional: boolean;
  default?: ExtractedDefault;
}

export interface CodeExtract {
  component: string;
  props: CodeProp[];
  cssVars: string[];
}

export function extractCode(root = process.cwd()): CodeExtract[] {
  const dir = path.join(root, 'src', 'components');
  const out: CodeExtract[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    let src: string;
    try {
      src = readFileSync(path.join(dir, name, `${name}.tsx`), 'utf8');
    } catch {
      continue;
    }

    const sf = ts.createSourceFile(`${name}.tsx`, src, ts.ScriptTarget.Latest, true);
    const props: CodeProp[] = [];
    const defaults = new Map<string, ExtractedDefault>();

    const readDefault = (initializer: ts.Expression): ExtractedDefault | undefined => {
      if (ts.isStringLiteral(initializer)) return initializer.text;
      if (ts.isNumericLiteral(initializer)) return Number(initializer.text);
      if (initializer.kind === ts.SyntaxKind.TrueKeyword) return true;
      if (initializer.kind === ts.SyntaxKind.FalseKeyword) return false;
      if (!ts.isArrayLiteralExpression(initializer)) return undefined;

      const segments: RichTextSegment[] = [];
      for (const element of initializer.elements) {
        if (!ts.isObjectLiteralExpression(element)) return undefined;
        let text: string | undefined;
        let strong: boolean | undefined;
        for (const property of element.properties) {
          if (!ts.isPropertyAssignment(property)) return undefined;
          const key = ts.isIdentifier(property.name)
            ? property.name.text
            : ts.isStringLiteral(property.name)
              ? property.name.text
              : undefined;
          if (key === 'text' && ts.isStringLiteral(property.initializer)) text = property.initializer.text;
          else if (key === 'strong' && property.initializer.kind === ts.SyntaxKind.TrueKeyword) strong = true;
          else if (key === 'strong' && property.initializer.kind === ts.SyntaxKind.FalseKeyword) strong = false;
          else return undefined;
        }
        if (text === undefined) return undefined;
        segments.push(strong ? { text, strong: true } : { text });
      }
      return segments;
    };

    const visit = (node: ts.Node): void => {
      if (ts.isInterfaceDeclaration(node) && node.name.text === `${name}Props`) {
        for (const member of node.members) {
          if (!ts.isPropertySignature(member) || !member.name || !ts.isIdentifier(member.name))
            continue;
          const propName = member.name.text;
          let kind: CodeProp['kind'] = 'other';
          let values: string[] | undefined;
          if (member.type) {
            if (member.type.kind === ts.SyntaxKind.BooleanKeyword) {
              kind = 'boolean';
            } else if (
              ts.isLiteralTypeNode(member.type) &&
              ts.isStringLiteral(member.type.literal)
            ) {
              // TypeScript collapses a one-member string union to a literal
              // type (`'pdf'`, not `'pdf' | ...`). It is still the generated
              // code surface of a one-value contract enum.
              kind = 'enum';
              values = [member.type.literal.text];
            } else if (ts.isUnionTypeNode(member.type)) {
              const literals = member.type.types
                .filter(ts.isLiteralTypeNode)
                .map((t) => t.literal)
                .filter(ts.isStringLiteral)
                .map((l) => l.text);
              if (literals.length === member.type.types.length) {
                kind = 'enum';
                values = literals;
              }
            }
          }
          props.push({ name: propName, kind, values, optional: !!member.questionToken });
        }
      }
      // Defaults come ONLY from a function PARAMETER's destructuring —
      // a helper's `const { size = 'lg' } = opts` must not be attributed
      // to the component (red-team finding: file-global visitor).
      if (ts.isObjectBindingPattern(node) && node.parent && ts.isParameter(node.parent)) {
        for (const el of node.elements) {
          if (el.initializer && ts.isIdentifier(el.name)) {
            const value = readDefault(el.initializer);
            if (value !== undefined) defaults.set(el.name.text, value);
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);

    for (const p of props) {
      if (defaults.has(p.name)) p.default = defaults.get(p.name);
    }

    let cssVars: string[] = [];
    try {
      const css = readFileSync(path.join(dir, name, `${name}.module.css`), 'utf8');
      cssVars = [...new Set([...css.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((m) => m[1]))];
    } catch {
      /* no stylesheet */
    }

    out.push({ component: name, props, cssVars });
  }
  return out;
}
