/**
 * Chargement et validation des cinq schémas JSON de 019, avec des erreurs
 * ADRESSABLES. Spec 019, tâche T009.
 *
 * ── Pourquoi un validateur écrit ici plutôt qu'`ajv` ─────────────────────────
 * Le dépôt n'a pas `ajv` et n'a aucune dépendance de production (`dependencies`
 * est vide). Ajouter une dépendance pour valider cinq documents internes serait
 * une décision d'architecture que 019 n'a pas à prendre.
 *
 * L'alternative — redéclarer les cinq schémas en Zod — a été rejetée pour une
 * raison de fond : il y aurait alors DEUX descriptions du même format, celle de
 * `specs/019-…/contracts/*.schema.json` (que le quickstart désigne comme
 * référence) et celle du code. Elles divergeraient, et la divergence serait
 * invisible.
 *
 * ── La propriété qui rend ce validateur sûr ──────────────────────────────────
 * Il ne connaît qu'un SOUS-ENSEMBLE de JSON Schema, et **tout mot-clé inconnu le
 * fait échouer bruyamment** au lieu de l'ignorer. C'est l'inverse du défaut
 * classique d'un validateur maison : ignorer `uniqueItems` en silence rendrait
 * verte une config qui viole une contrainte écrite noir sur blanc dans le schéma.
 * Le jour où un schéma de 019 gagne un mot-clé, ce fichier refuse et il faut
 * l'implémenter — jamais l'oublier.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { repoPath, repoRelative } from './canonical.js';

// ---------------------------------------------------------------------------
// Emplacement des schémas
// ---------------------------------------------------------------------------

/**
 * Répertoire des schémas. Par défaut celui de la spec — le quickstart le désigne
 * comme la référence des formats.
 *
 * `PQR_ODOO_SCHEMA_DIR` existe pour un cas structurel précis et vérifié :
 * `resetScratch()` du harnais d'evals ne copie PAS `specs/` (sa liste de
 * répertoires n'a pas d'entrée `specs`). Un cas d'eval qui exécute une porte de
 * 019 dans le scratch ne trouverait donc aucun schéma. Il en stage une copie et
 * pointe cette variable dessus. Sans cette porte de sortie, le cas échouerait sur
 * « schéma introuvable » et se lirait comme un défaut de la porte.
 */
export const SCHEMA_DIR = process.env.PQR_ODOO_SCHEMA_DIR
  ? path.resolve(process.env.PQR_ODOO_SCHEMA_DIR)
  : repoPath('specs', '019-odoo-production-foundation', 'contracts');

export const SCHEMA_NAMES = [
  'input-snapshot',
  'authoring-config',
  'adaptation-registry',
  'derivation-report',
  'qualification-manifest',
] as const;

export type SchemaName = (typeof SCHEMA_NAMES)[number];

export type JsonSchema = Record<string, unknown>;

const cache = new Map<SchemaName, JsonSchema>();

export function loadSchema(name: SchemaName): JsonSchema {
  const hit = cache.get(name);
  if (hit) return hit;
  const abs = path.join(SCHEMA_DIR, `${name}.schema.json`);
  if (!existsSync(abs)) {
    throw new Error(
      `Schéma « ${name} » introuvable : ${abs}\n` +
        `  Le répertoire par défaut est specs/019-odoo-production-foundation/contracts/.\n` +
        `  Hors du dépôt (scratch d'eval), pointer PQR_ODOO_SCHEMA_DIR sur une copie stagée.`,
    );
  }
  const schema = JSON.parse(readFileSync(abs, 'utf8')) as JsonSchema;
  cache.set(name, schema);
  return schema;
}


// ---------------------------------------------------------------------------
// Le validateur — sous-ensemble strict de JSON Schema draft 2020-12
// ---------------------------------------------------------------------------

/** Mots-clés compris. Tout le reste REFUSE. Annotations pures listées à part
 *  pour qu'on voie d'un coup d'œil ce qui contraint et ce qui documente. */
const ANNOTATIONS = new Set(['$schema', '$id', '$comment', 'title', 'description', 'default', '$defs', 'examples']);
const KNOWN = new Set([
  ...ANNOTATIONS,
  'type', 'const', 'enum', 'required', 'properties', 'additionalProperties',
  'items', 'minItems', 'maxItems', 'uniqueItems',
  'pattern', 'minLength', 'maxLength',
  'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum',
  '$ref', 'allOf', 'anyOf', 'oneOf', 'not', 'if', 'then', 'else',
]);

export interface ValidationError {
  /** Pointeur JSON dans la DONNÉE, ex. `/controls/12/address/prop`. */
  readonly pointer: string;
  readonly message: string;
}

const typeOf = (v: unknown): string => {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (Number.isInteger(v)) return 'integer';
  return typeof v;
};

const typeMatches = (v: unknown, t: string): boolean =>
  t === 'integer' ? Number.isInteger(v) : t === 'number' ? typeof v === 'number' : typeOf(v) === t;

const deepEqual = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

class Validator {
  readonly errors: ValidationError[] = [];
  constructor(private readonly root: JsonSchema, private readonly label: string) {}

  private fail(pointer: string, message: string) {
    this.errors.push({ pointer, message });
  }

  private deref(ref: string, at: string): JsonSchema {
    if (!ref.startsWith('#/')) throw new Error(`${this.label}: $ref non local non supporté « ${ref} » (schéma ${at}).`);
    let node: unknown = this.root;
    for (const seg of ref.slice(2).split('/')) {
      node = (node as Record<string, unknown>)?.[seg.replace(/~1/g, '/').replace(/~0/g, '~')];
      if (node === undefined) throw new Error(`${this.label}: $ref cassé « ${ref} ».`);
    }
    return node as JsonSchema;
  }

  /** Valide sans enregistrer d'erreur — sert à `if`, `oneOf`, `not`. */
  private silent(schema: JsonSchema, data: unknown, at: string): boolean {
    const probe = new Validator(this.root, this.label);
    probe.check(schema, data, at, at);
    return probe.errors.length === 0;
  }

  check(schema: JsonSchema, data: unknown, pointer: string, at: string): void {
    for (const kw of Object.keys(schema)) {
      if (!KNOWN.has(kw)) {
        // Refus BRUYANT, jamais un ignore silencieux : voir l'en-tête du fichier.
        throw new Error(`${this.label}: mot-clé JSON Schema non supporté « ${kw} » en ${at}. L'implémenter dans schemas.ts.`);
      }
    }

    if (schema.$ref !== undefined) {
      this.check(this.deref(schema.$ref as string, at), data, pointer, `${at}→${schema.$ref}`);
    }

    if (schema.type !== undefined) {
      const types = Array.isArray(schema.type) ? (schema.type as string[]) : [schema.type as string];
      if (!types.some((t) => typeMatches(data, t))) {
        this.fail(pointer, `type ${types.join('|')} attendu, ${typeOf(data)} reçu`);
        return; // Les contraintes suivantes n'auraient plus de sens.
      }
    }
    if (schema.const !== undefined && !deepEqual(data, schema.const)) {
      this.fail(pointer, `valeur ${JSON.stringify(schema.const)} attendue, ${JSON.stringify(data)} reçue`);
    }
    if (schema.enum !== undefined) {
      const allowed = schema.enum as unknown[];
      if (!allowed.some((a) => deepEqual(a, data))) {
        this.fail(pointer, `valeur hors énumération (${allowed.map((a) => JSON.stringify(a)).join(', ')}) : ${JSON.stringify(data)}`);
      }
    }

    if (typeof data === 'string') {
      if (schema.pattern !== undefined && !new RegExp(schema.pattern as string, 'u').test(data)) {
        this.fail(pointer, `« ${data} » ne respecte pas le motif ${schema.pattern}`);
      }
      if (schema.minLength !== undefined && data.length < (schema.minLength as number)) {
        this.fail(pointer, `chaîne de ${data.length} caractère(s), minimum ${schema.minLength}`);
      }
      if (schema.maxLength !== undefined && data.length > (schema.maxLength as number)) {
        this.fail(pointer, `chaîne de ${data.length} caractère(s), maximum ${schema.maxLength}`);
      }
    }

    if (typeof data === 'number') {
      if (schema.minimum !== undefined && data < (schema.minimum as number)) this.fail(pointer, `${data} < minimum ${schema.minimum}`);
      if (schema.maximum !== undefined && data > (schema.maximum as number)) this.fail(pointer, `${data} > maximum ${schema.maximum}`);
      if (schema.exclusiveMinimum !== undefined && data <= (schema.exclusiveMinimum as number)) {
        this.fail(pointer, `${data} ≤ minimum exclusif ${schema.exclusiveMinimum}`);
      }
      if (schema.exclusiveMaximum !== undefined && data >= (schema.exclusiveMaximum as number)) {
        this.fail(pointer, `${data} ≥ maximum exclusif ${schema.exclusiveMaximum}`);
      }
    }

    if (Array.isArray(data)) {
      if (schema.minItems !== undefined && data.length < (schema.minItems as number)) {
        this.fail(pointer, `${data.length} élément(s), minimum ${schema.minItems}`);
      }
      if (schema.maxItems !== undefined && data.length > (schema.maxItems as number)) {
        this.fail(pointer, `${data.length} élément(s), maximum ${schema.maxItems}`);
      }
      if (schema.uniqueItems === true) {
        const seen = new Set<string>();
        data.forEach((item, i) => {
          const k = JSON.stringify(item);
          if (seen.has(k)) this.fail(`${pointer}/${i}`, `doublon : ${k}`);
          seen.add(k);
        });
      }
      if (schema.items !== undefined) {
        data.forEach((item, i) => this.check(schema.items as JsonSchema, item, `${pointer}/${i}`, `${at}.items`));
      }
    }

    if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
      const obj = data as Record<string, unknown>;
      const props = (schema.properties ?? {}) as Record<string, JsonSchema>;
      for (const req of (schema.required ?? []) as string[]) {
        if (!(req in obj)) this.fail(pointer, `propriété obligatoire absente : « ${req} »`);
      }
      for (const [k, v] of Object.entries(obj)) {
        if (props[k] !== undefined) {
          this.check(props[k], v, `${pointer}/${k}`, `${at}.${k}`);
        } else if (schema.additionalProperties === false) {
          this.fail(`${pointer}/${k}`, `propriété non déclarée : « ${k} »`);
        } else if (typeof schema.additionalProperties === 'object') {
          this.check(schema.additionalProperties as JsonSchema, v, `${pointer}/${k}`, `${at}.*`);
        }
      }
    }

    for (const sub of (schema.allOf ?? []) as JsonSchema[]) this.check(sub, data, pointer, `${at}.allOf`);

    if (schema.anyOf !== undefined) {
      const branches = schema.anyOf as JsonSchema[];
      if (!branches.some((b) => this.silent(b, data, at))) {
        this.fail(pointer, `aucune des ${branches.length} alternatives (anyOf) ne convient`);
      }
    }
    if (schema.oneOf !== undefined) {
      const branches = schema.oneOf as JsonSchema[];
      const n = branches.filter((b) => this.silent(b, data, at)).length;
      if (n !== 1) this.fail(pointer, `oneOf : ${n} alternative(s) satisfaite(s), exactement 1 attendue`);
    }
    if (schema.not !== undefined && this.silent(schema.not as JsonSchema, data, at)) {
      this.fail(pointer, `valeur interdite par \`not\` : ${JSON.stringify(data)}`);
    }
    if (schema.if !== undefined) {
      // Les échecs de `if` ne sont JAMAIS rapportés : c'est une condition, pas
      // une contrainte. Rapporter son échec produirait des messages absurdes.
      const branch = this.silent(schema.if as JsonSchema, data, at) ? schema.then : schema.else;
      if (branch !== undefined) this.check(branch as JsonSchema, data, pointer, `${at}.${branch === schema.then ? 'then' : 'else'}`);
    }
  }
}

/** Valide `data` contre un schéma nommé. Rend la liste des erreurs, vide si
 *  conforme. Ne lève que sur un schéma que ce validateur ne sait pas lire. */
export function validate(name: SchemaName, data: unknown): ValidationError[] {
  const schema = loadSchema(name);
  const v = new Validator(schema, `${name}.schema.json`);
  v.check(schema, data, '', '$');
  return v.errors;
}

/**
 * Valide, ou lève une erreur qui NOMME chaque violation par son pointeur.
 * `source` n'est là que pour le message : un rapport qui dit « invalide » sans
 * dire où fait perdre plus de temps qu'il n'en fait gagner.
 */
export function validateOrThrow(name: SchemaName, data: unknown, source: string): void {
  const errors = validate(name, data);
  if (errors.length === 0) return;
  const lignes = errors.map((e) => `  ${e.pointer || '(racine)'} — ${e.message}`).join('\n');
  throw new Error(`${source} n'est pas conforme à ${name}.schema.json (${errors.length} violation(s)) :\n${lignes}`);
}
