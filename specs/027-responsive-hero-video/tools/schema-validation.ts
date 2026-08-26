import { readFileSync } from 'node:fs';

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
}

type JsonObject = Record<string, JsonValue>;
export type JsonSchema = boolean | Record<string, unknown>;
type Schema = JsonSchema;

const isObject = (value: unknown): value is JsonObject => typeof value === 'object' && value !== null && !Array.isArray(value);

const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (isObject(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
};

const sameValue = (left: unknown, right: unknown): boolean => canonical(left) === canonical(right);

const joinPath = (path: string, key: string | number): string => (path === '$' ? `${path}.${key}` : `${path}.${key}`);

const resolveRef = (root: Schema, ref: string): Schema | undefined => {
  if (!ref.startsWith('#/')) return undefined;
  const resolved = ref.slice(2).split('/').reduce<unknown>((current, token) => {
    if (!isObject(current)) return undefined;
    return current[token.replace(/~1/g, '/').replace(/~0/g, '~')];
  }, root);
  return typeof resolved === 'boolean' || isObject(resolved) ? resolved as Schema : undefined;
};

const actualType = (value: unknown): string => {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
};

const matchesType = (value: unknown, type: string): boolean => {
  switch (type) {
    case 'object': return isObject(value);
    case 'array': return Array.isArray(value);
    case 'string': return typeof value === 'string';
    case 'number': return typeof value === 'number' && Number.isFinite(value);
    case 'integer': return typeof value === 'number' && Number.isInteger(value);
    case 'boolean': return typeof value === 'boolean';
    case 'null': return value === null;
    default: return true;
  }
};

function validate(value: unknown, schema: Schema, root: Schema, path: string, errors: ValidationIssue[]): void {
  if (schema === false) {
    errors.push({ path, message: 'is not permitted by the schema' });
    return;
  }
  if (schema === true) return;

  const ref = schema.$ref;
  if (typeof ref === 'string') {
    const resolved = resolveRef(root, ref);
    if (!resolved) errors.push({ path, message: `cannot resolve schema reference ${ref}` });
    else validate(value, resolved, root, path, errors);
    return;
  }

  const type = schema.type;
  if (typeof type === 'string' && !matchesType(value, type)) {
    errors.push({ path, message: `must be ${type}; received ${actualType(value)}` });
    return;
  }
  if (Array.isArray(type) && !type.some((candidate) => typeof candidate === 'string' && matchesType(value, candidate))) {
    errors.push({ path, message: `must match one of ${type.join(', ')}` });
    return;
  }

  if ('const' in schema && !sameValue(value, schema.const)) errors.push({ path, message: `must equal ${canonical(schema.const)}` });
  if (Array.isArray(schema.enum) && !schema.enum.some((candidate) => sameValue(value, candidate))) {
    errors.push({ path, message: `must be one of ${schema.enum.map(canonical).join(', ')}` });
  }

  if (typeof value === 'string') {
    if (typeof schema.minLength === 'number' && value.length < schema.minLength) errors.push({ path, message: `must contain at least ${schema.minLength} characters` });
    if (typeof schema.maxLength === 'number' && value.length > schema.maxLength) errors.push({ path, message: `must contain no more than ${schema.maxLength} characters` });
    if (typeof schema.pattern === 'string' && !(new RegExp(schema.pattern).test(value))) errors.push({ path, message: `must match /${schema.pattern}/` });
    if (schema.format === 'date-time' && Number.isNaN(Date.parse(value))) errors.push({ path, message: 'must be an ISO date-time' });
  }

  if (typeof value === 'number') {
    if (typeof schema.minimum === 'number' && value < schema.minimum) errors.push({ path, message: `must be >= ${schema.minimum}` });
    if (typeof schema.maximum === 'number' && value > schema.maximum) errors.push({ path, message: `must be <= ${schema.maximum}` });
    if (typeof schema.exclusiveMaximum === 'number' && value >= schema.exclusiveMaximum) errors.push({ path, message: `must be < ${schema.exclusiveMaximum}` });
    if (typeof schema.exclusiveMinimum === 'number' && value <= schema.exclusiveMinimum) errors.push({ path, message: `must be > ${schema.exclusiveMinimum}` });
  }

  if (Array.isArray(value)) {
    if (typeof schema.minItems === 'number' && value.length < schema.minItems) errors.push({ path, message: `must contain at least ${schema.minItems} items` });
    if (typeof schema.maxItems === 'number' && value.length > schema.maxItems) errors.push({ path, message: `must contain no more than ${schema.maxItems} items` });
    if (schema.uniqueItems === true) {
      const seen = new Set<string>();
      value.forEach((item, index) => {
        const encoded = canonical(item);
        if (seen.has(encoded)) errors.push({ path: joinPath(path, index), message: 'must be unique' });
        seen.add(encoded);
      });
    }
    const prefixItems = Array.isArray(schema.prefixItems) ? schema.prefixItems : [];
    prefixItems.forEach((itemSchema, index) => validate(value[index], itemSchema as Schema, root, joinPath(path, index), errors));
    const itemSchema = schema.items;
    if (itemSchema === false && value.length > prefixItems.length) {
      errors.push({ path, message: `must not contain more than ${prefixItems.length} tuple items` });
    } else if (itemSchema && itemSchema !== false) {
      const first = prefixItems.length;
      value.slice(first).forEach((item, relativeIndex) => validate(item, itemSchema as Schema, root, joinPath(path, first + relativeIndex), errors));
    }
    if (schema.contains) {
      const matches = value.filter((item) => {
        const candidateErrors: ValidationIssue[] = [];
        validate(item, schema.contains as Schema, root, path, candidateErrors);
        return candidateErrors.length === 0;
      });
      if (matches.length === 0) errors.push({ path, message: 'must contain a matching item' });
    }
  }

  if (isObject(value)) {
    const required = Array.isArray(schema.required) ? schema.required.filter((key): key is string => typeof key === 'string') : [];
    required.forEach((key) => {
      if (!(key in value)) errors.push({ path, message: `must include required property ${key}` });
    });
    const properties = isObject(schema.properties) ? schema.properties as Record<string, Schema> : {};
    Object.entries(properties).forEach(([key, propertySchema]) => {
      if (key in value) validate(value[key], propertySchema, root, joinPath(path, key), errors);
    });
    if (schema.additionalProperties === false) {
      Object.keys(value).filter((key) => !(key in properties)).forEach((key) => errors.push({ path: joinPath(path, key), message: 'is not an allowed property' }));
    }
  }

  const allOf = Array.isArray(schema.allOf) ? schema.allOf : [];
  allOf.forEach((itemSchema) => validate(value, itemSchema as Schema, root, path, errors));
  const anyOf = Array.isArray(schema.anyOf) ? schema.anyOf : [];
  if (anyOf.length > 0) {
    const matched = anyOf.some((itemSchema) => {
      const candidateErrors: ValidationIssue[] = [];
      validate(value, itemSchema as Schema, root, path, candidateErrors);
      return candidateErrors.length === 0;
    });
    if (!matched) errors.push({ path, message: 'must match at least one permitted schema' });
  }
  const oneOf = Array.isArray(schema.oneOf) ? schema.oneOf : [];
  if (oneOf.length > 0) {
    const matches = oneOf.filter((itemSchema) => {
      const candidateErrors: ValidationIssue[] = [];
      validate(value, itemSchema as Schema, root, path, candidateErrors);
      return candidateErrors.length === 0;
    });
    if (matches.length !== 1) errors.push({ path, message: `must match exactly one schema; matched ${matches.length}` });
  }
  if (schema.if) {
    const conditionErrors: ValidationIssue[] = [];
    validate(value, schema.if as Schema, root, path, conditionErrors);
    if (conditionErrors.length === 0 && schema.then) validate(value, schema.then as Schema, root, path, errors);
    if (conditionErrors.length > 0 && schema.else) validate(value, schema.else as Schema, root, path, errors);
  }
}

export function validateJsonSchema(value: unknown, schema: Schema): ValidationResult {
  const errors: ValidationIssue[] = [];
  validate(value, schema, schema, '$', errors);
  return { valid: errors.length === 0, errors };
}

export function readJson(path: string): JsonValue {
  return JSON.parse(readFileSync(path, 'utf8')) as JsonValue;
}

export function formatValidation(result: ValidationResult): string {
  if (result.valid) return 'VALID';
  return result.errors.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
}
