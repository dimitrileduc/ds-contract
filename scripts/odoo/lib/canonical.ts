/**
 * Sérialisation canonique, empreintes et chemins relatifs. Spec 019, tâche T008.
 *
 * ── Ce que « canonique » veut dire ici, et pourquoi c'est load-bearing ───────
 * Deux exécutions sur les mêmes entrées doivent produire le MÊME octet. Trois
 * sources de non-déterminisme sont fermées ici, et une seule oubliée suffirait à
 * rendre `--check` capricieux — donc à le faire désactiver :
 *
 *   1. **L'ordre des clés d'objet.** `JSON.stringify` suit l'ordre d'insertion.
 *      Deux constructions logiquement identiques mais bâties dans un ordre
 *      différent donneraient deux fichiers différents. On trie donc, récursivement.
 *   2. **L'ordre du système de fichiers.** `readdirSync` n'est pas trié sur toutes
 *      les plateformes. Tout appelant qui produit une liste depuis le disque doit
 *      la trier — `sortedBy` est là pour ça.
 *   3. **Les valeurs non représentables.** `undefined`, `NaN`, `Infinity`, une
 *      fonction, une `Date` : `JSON.stringify` les efface ou les transforme en
 *      silence. Ici elles REFUSENT, par chemin.
 *
 * L'ordre des TABLEAUX n'est jamais trié automatiquement : dans ce projet un
 * tableau porte souvent un ordre signifiant (l'ordre DOM des avis, par exemple).
 * Trier serait détruire une donnée. C'est à l'appelant de trier ce qui doit l'être.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Racine du dépôt, déduite de l'emplacement de CE fichier (`scripts/odoo/lib/`)
 *  et jamais de `process.cwd()` — un script appelé depuis un sous-répertoire
 *  doit lire les mêmes sources. */
export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

/** Chemin absolu depuis un chemin relatif au dépôt. */
export const repoPath = (...rel: string[]): string => path.join(REPO_ROOT, ...rel);

/**
 * Chemin relatif au dépôt, en séparateurs POSIX.
 *
 * REFUSE tout chemin hors du dépôt : un chemin absolu ou un `..` qui s'échappe
 * rendrait un lock ou un rapport dépendant de la machine, et le rapport doit être
 * comparable entre deux postes.
 */
export function repoRelative(abs: string): string {
  const rel = path.relative(REPO_ROOT, path.resolve(abs));
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`Chemin hors dépôt, non sérialisable : ${abs}`);
  }
  return rel.split(path.sep).join('/');
}

/** Tri stable par clé dérivée — l'outil des appelants qui produisent une liste
 *  depuis le disque ou depuis une `Map`. */
export const sortedBy = <T>(items: readonly T[], key: (item: T) => string): T[] =>
  [...items].sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));

/**
 * Copie profonde à clés triées. Refuse par CHEMIN toute valeur que JSON ne peut
 * pas porter fidèlement — le message nomme l'endroit, pas seulement le symptôme.
 */
export function canonicalize(value: unknown, at = '$'): unknown {
  if (value === null) return null;
  const t = typeof value;
  if (t === 'string' || t === 'boolean') return value;
  if (t === 'number') {
    if (!Number.isFinite(value as number)) {
      throw new Error(`Valeur non sérialisable en ${at} : ${String(value)}`);
    }
    return value;
  }
  if (t === 'undefined') {
    throw new Error(`\`undefined\` en ${at} — JSON.stringify l'effacerait en silence.`);
  }
  if (t === 'function' || t === 'symbol' || t === 'bigint') {
    throw new Error(`Valeur de type ${t} non sérialisable en ${at}.`);
  }
  if (Array.isArray(value)) {
    // L'ordre est CONSERVÉ : il porte souvent du sens (ordre DOM, ordre de
    // priorité). Trier ici détruirait une donnée sans le dire.
    return value.map((v, i) => canonicalize(v, `${at}[${i}]`));
  }
  if (value instanceof Date) {
    throw new Error(`\`Date\` en ${at} — un horodatage rendrait la sortie non reproductible.`);
  }
  if (t === 'object') {
    const src = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(src).sort()) out[k] = canonicalize(src[k], `${at}.${k}`);
    return out;
  }
  throw new Error(`Valeur non sérialisable en ${at}.`);
}

/** Sérialisation canonique : clés triées, indentation 2, saut de ligne final.
 *  Le saut final est la convention du dépôt (cf. `editJson` du harnais d'evals). */
export const canonicalJson = (value: unknown): string => `${JSON.stringify(canonicalize(value), null, 2)}\n`;

/** SHA-256 hexadécimal minuscule — la forme qu'attendent les schémas de 019
 *  (`^[a-f0-9]{64}$`). */
export const sha256 = (data: string | Buffer): string =>
  createHash('sha256').update(data).digest('hex');

/** SHA-256 du CONTENU BRUT d'un fichier, octets tels quels.
 *  Volontairement pas du JSON reformaté : le lock doit détecter une édition qui
 *  ne change rien sémantiquement mais change le fichier — c'est exactement le
 *  genre de dérive qu'une comparaison de version seule laisse passer. */
export const sha256File = (abs: string): string => sha256(readFileSync(abs));

/** L'en-tête que porte toute sortie générée. Il nomme la commande qui la refait :
 *  un fichier marqué « ne pas éditer » sans dire par quoi le refaire est une
 *  invitation à l'éditer quand même. */
export function generatedHeader(comment: 'css' | 'json', command: string): string {
  const lines = [
    'GENERATED FILE — DO NOT EDIT.',
    `Regenerate with: ${command}`,
    'Toute retouche à la main est perdue au prochain build ET rend la porte',
    '`--check` rouge avec le statut `tampered`.',
  ];
  if (comment === 'css') return `/*\n${lines.map((l) => ` * ${l}`).join('\n')}\n */\n`;
  return lines.map((l) => `// ${l}`).join('\n') + '\n';
}
