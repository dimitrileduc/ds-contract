import { fileURLToPath } from 'node:url';

import { formatValidation, readJson, type JsonSchema, type JsonValue, type ValidationIssue, type ValidationResult, validateJsonSchema } from './schema-validation.js';

const decisionSchemaPath = fileURLToPath(new URL('../contracts/responsive-decision.schema.json', import.meta.url));
const decisionSchema = readJson(decisionSchemaPath) as JsonSchema;

type RecordValue = Record<string, JsonValue>;

const isRecord = (value: JsonValue | undefined): value is RecordValue => typeof value === 'object' && value !== null && !Array.isArray(value);
const isRecordArray = (value: JsonValue | undefined): RecordValue[] => Array.isArray(value) ? value.filter(isRecord) : [];

function valueAt(record: RecordValue, key: string): JsonValue | undefined {
  return record[key];
}

function push(errors: ValidationIssue[], path: string, message: string): void {
  errors.push({ path, message });
}

function canonical(value: JsonValue | undefined): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (isRecord(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value) ?? 'undefined';
}

function invariantErrors(document: JsonValue): ValidationIssue[] {
  const errors: ValidationIssue[] = [];
  if (!isRecord(document)) return errors;

  const profile = valueAt(document, 'profile');
  // NOTE DATEE (2026-09-08) — ce validateur garde les documents de decision de la
  // spec 027, qui sont DATES : ils pinent le profil tel qu'il etait a leur signature
  // (992/1400). Le seuil `wide` LIVRE est passe a 1600 le 2026-09-08 (voir
  // tokens/primitives.tokens.json > breakpoint.$description et docs/03-token-pipeline.md).
  // Exiger encore 1400 ici est donc CORRECT pour le perimetre de 027 — mais toute
  // NOUVELLE decision responsive ecrite avec le profil courant serait refusee par ce
  // controle tant que la liste des profils acceptes n'est pas ouverte. Limite nommee,
  // pas un oubli.
  if (!isRecord(profile) || profile.id !== 'piqueray-odoo19-992-1400' || profile.basis !== 'viewport-width' || profile.source !== 'odoo-bootstrap-19-subset') {
    push(errors, '$.profile', 'must pin the Piqueray Odoo 19 viewport profile (992/1400)');
  }

  const breakpoints = isRecordArray(valueAt(document, 'breakpoints'));
  const expectedBreakpoints = [
    ['desktop-start', 992],
    ['wide-start', 1400],
  ] as const;
  if (breakpoints.length !== expectedBreakpoints.length) {
    push(errors, '$.breakpoints', 'must contain exactly desktop-start=992 and wide-start=1400');
  }
  expectedBreakpoints.forEach(([id, width], index) => {
    const breakpoint = breakpoints[index];
    if (!breakpoint || breakpoint.id !== id || breakpoint.minWidthPx !== width || breakpoint.operator !== 'min-width') {
      push(errors, `$.breakpoints.${index}`, `must be ${id} at ${width}px using min-width`);
    }
  });

  const witnesses = isRecordArray(valueAt(document, 'designWitnesses'));
  const expectedWitnesses = [
    ['mobile-390', 390, 'compact'],
    ['tablet-834', 834, 'compact'],
    ['desktop-1200', 1200, 'desktop'],
    ['wide-1728', 1728, 'wide'],
  ] as const;
  if (witnesses.length !== expectedWitnesses.length) push(errors, '$.designWitnesses', 'must contain exactly the four required design witnesses');
  expectedWitnesses.forEach(([id, width, composition], index) => {
    const witness = witnesses[index];
    if (!witness || witness.witnessId !== id || witness.widthPx !== width || witness.compositionId !== composition) {
      push(errors, `$.designWitnesses.${index}`, `must be ${id} (${width}px → ${composition})`);
    }
  });

  const options = isRecordArray(valueAt(document, 'options'));
  const optionIds = options.map((option) => option.optionId).filter((id): id is string => typeof id === 'string');
  if (new Set(optionIds).size !== optionIds.length) push(errors, '$.options', 'optionId values must be unique');
  if (document.status === 'approved' && typeof document.selectedOptionId === 'string' && !optionIds.includes(document.selectedOptionId)) {
    push(errors, '$.selectedOptionId', 'must identify an option in this decision');
  }

  const tabletPaths: string[] = [];
  const inspect = (value: JsonValue, path: string): void => {
    if (value === 'tablet') tabletPaths.push(path);
    if (Array.isArray(value)) value.forEach((item, index) => inspect(item, `${path}.${index}`));
    else if (isRecord(value)) Object.entries(value).forEach(([key, item]) => {
      if (key === 'compositionId' && item === 'tablet') tabletPaths.push(`${path}.${key}`);
      inspect(item, `${path}.${key}`);
    });
  };
  inspect(document, '$');
  tabletPaths.forEach((path) => push(errors, path, 'Tablet is a compact witness, never a HeroVideo composition'));

  if (document.status === 'approved') {
    const selectedOption = options.find((option) => option.optionId === document.selectedOptionId);
    const approvedCompositions = valueAt(document, 'approvedCompositions');
    if (selectedOption && canonical(selectedOption.compositions) !== canonical(approvedCompositions)) {
      push(errors, '$.approvedCompositions', 'must exactly match the compositions of selectedOptionId');
    }
  }
  return errors;
}

export function validateDecision(document: JsonValue): ValidationResult {
  const schemaResult = validateJsonSchema(document, decisionSchema);
  const errors = [...schemaResult.errors, ...invariantErrors(document)];
  return { valid: errors.length === 0, errors };
}

function main(): void {
  const [input] = process.argv.slice(2);
  if (!input || input === '--help') {
    console.error('Usage: npx tsx specs/027-responsive-hero-video/tools/validate-decision.ts <decision.json>');
    process.exitCode = input === '--help' ? 0 : 2;
    return;
  }
  const result = validateDecision(readJson(input));
  console.log(formatValidation(result));
  if (!result.valid) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) main();
