/**
 * La porte de structure du module Odoo. Spec 019, tâche T015.
 *
 * Elle répond, sans instance et sans Docker, aux questions dont une mauvaise
 * réponse coûte un cycle d'installation complet :
 *   · le manifeste est-il lisible, versionné 19.0.x.y.z, dépendant de `website` ?
 *   · chaque fichier `data` et chaque asset de bundle EXISTE-t-il ?
 *   · combien de racines la bibliothèque expose-t-elle (au plus le nombre de racines déclarées) ?
 *   · un composant interne est-il devenu posable par accident ?
 *   · une `section` est-elle imbriquée dans une autre à travers la chaîne `t-call` ?
 *   · les images du compose sont-elles celles du lock ?
 *
 * ── Pourquoi la racine et l'imbrication comptent autant ─────────────────────
 * 018 a installé un module « à 0 erreur » dont le bloc était INATTEIGNABLE, faute
 * d'un attribut de groupe. Une porte qui ne compte pas les inscriptions laisse
 * passer exactement cela. Et une `section` dans une `section` casse la mécanique
 * d'éditeur d'Odoo sans rien signaler.
 *
 * ── Un contrôle non applicable est SAUTÉ, jamais réussi ─────────────────────
 * En fin de Phase 2, `views/components.xml` et `views/snippets.xml` n'existent
 * pas encore (T028/T045). Les contrôles qui les visent sont dits « sautés », avec
 * la tâche qui les rendra exécutables. `--strict` les compte comme échecs.
 *
 * Usage :
 *   npx tsx scripts/odoo/check-module.ts [--strict]
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { repoPath, repoRelative } from './lib/canonical.js';
import { ODOO_PIN, readLock } from './check-inputs.js';
import { runAsCli } from './lib/cli.js';
import { ROOT_CONTRACT_IDS, SHELL_CONTRACT_IDS, closureOf, loadAllContracts } from './lib/repo-data.js';
import { Tally } from './lib/tally.js';

const ADDON = repoPath('integrations', 'odoo', 'addons', 'piqueray_ds');
/** L'addon de QUALIFICATION, jamais livré. Le banc y vit depuis la revue du
 *  2026-08-08 : déclaré dans le `data` du produit, il publiait une page de test
 *  sur le site réel. */
const ADDON_QA = repoPath('integrations', 'odoo', 'addons', 'piqueray_ds_qa');
const MANIFEST = path.join(ADDON, '__manifest__.py');
const QA = repoPath('integrations', 'odoo', 'qa');

/**
 * Les composants internes : jamais inscriptibles comme snippet.
 *
 * DÉRIVÉS de la fermeture moins les racines, jamais écrits à la main —
 * `lib/repo-data.ts` énonce la raison dans son propre en-tête : une liste écrite
 * à la main « vieillit en silence ». Le jour où une racine gagne un composant
 * imbriqué, une constante en dur serait courte d'un élément et la porte dirait
 * « aucun composant interne posable » sur un ensemble qu'elle ne couvre plus.
 */
const INTERNES = closureOf(ROOT_CONTRACT_IDS, loadAllContracts())
  .filter((id) => !(ROOT_CONTRACT_IDS as readonly string[]).includes(id));
const BUNDLES_ATTENDUS = ['web.assets_frontend', 'website.website_builder_assets'];

const tally = new Tally();
const { ok, ko, saute } = tally;

// ---------------------------------------------------------------------------
// Lecture du manifeste — sous-ensemble de littéraux Python, refus du reste
// ---------------------------------------------------------------------------

type PyValue = string | number | boolean | null | PyValue[] | { [k: string]: PyValue };

/**
 * Évalue un littéral Python (dict / list / str / bool / int / None) sans exécuter
 * quoi que ce soit. Tout ce qui sort du sous-ensemble REFUSE : un manifeste qui
 * contiendrait une expression serait illisible par cette porte, et le dire vaut
 * mieux que le deviner. C'est le même sous-ensemble qu'Odoo lui-même lit avec
 * `ast.literal_eval`.
 */
export function parsePythonLiteral(src: string): PyValue {
  let i = 0;
  const err = (m: string): never => {
    const ligne = src.slice(0, i).split('\n').length;
    throw new Error(`${m} (ligne ${ligne})`);
  };
  const skip = () => {
    for (;;) {
      while (i < src.length && /\s/.test(src[i])) i++;
      if (src[i] === '#') { while (i < src.length && src[i] !== '\n') i++; continue; }
      return;
    }
  };
  const str = (): string => {
    const q = src[i];
    const triple = src.startsWith(q.repeat(3), i);
    const fin = triple ? q.repeat(3) : q;
    i += fin.length;
    let out = '';
    while (i < src.length && !src.startsWith(fin, i)) {
      if (src[i] === '\\' && !triple) {
        const c = src[i + 1];
        out += c === 'n' ? '\n' : c === 't' ? '\t' : c;
        i += 2;
      } else out += src[i++];
    }
    if (!src.startsWith(fin, i)) err('chaîne non terminée');
    i += fin.length;
    return out;
  };
  const value = (): PyValue => {
    skip();
    const c = src[i];
    if (c === '"' || c === "'") {
      // Concaténation implicite de littéraux adjacents, comme en Python.
      let out = str();
      for (;;) { const save = i; skip(); if (src[i] === '"' || src[i] === "'") out += str(); else { i = save; break; } }
      return out;
    }
    if (c === '{' || c === '[' || c === '(') {
      const close = c === '{' ? '}' : c === '[' ? ']' : ')';
      const dict = c === '{';
      i++;
      const arr: PyValue[] = [];
      const obj: { [k: string]: PyValue } = {};
      for (;;) {
        skip();
        if (src[i] === close) { i++; break; }
        if (i >= src.length) err(`« ${close} » manquant`);
        if (dict) {
          const k = value();
          if (typeof k !== 'string') err('clé de dict non textuelle');
          skip();
          if (src[i] !== ':') err('« : » attendu');
          i++;
          obj[k as string] = value();
        } else arr.push(value());
        skip();
        if (src[i] === ',') i++;
        else { skip(); if (src[i] !== close) err(`« , » ou « ${close} » attendu`); }
      }
      return dict ? obj : arr;
    }
    if (src.startsWith('True', i)) { i += 4; return true; }
    if (src.startsWith('False', i)) { i += 5; return false; }
    if (src.startsWith('None', i)) { i += 4; return null; }
    const num = /^-?\d+(\.\d+)?/.exec(src.slice(i));
    if (num) { i += num[0].length; return Number(num[0]); }
    return err(`littéral non supporté « ${src.slice(i, i + 20)}… »`);
  };
  const v = value();
  skip();
  if (i < src.length) err('contenu après le littéral');
  return v;
}

// ---------------------------------------------------------------------------
// XML — bonne formation et chaîne de composition
// ---------------------------------------------------------------------------

/** Bonne formation par équilibrage de balises. Ne remplace pas un parseur, mais
 *  attrape la faute qui fait échouer une installation Odoo avec un message
 *  obscur : une balise non fermée. */
export function xmlBalance(src: string): string | null {
  const sans = src.replace(/<!--[\s\S]*?-->/g, '').replace(/<\?[\s\S]*?\?>/g, '');
  const pile: string[] = [];
  const re = /<(\/?)([A-Za-z_][\w.:-]*)([^>]*?)(\/?)>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sans)) !== null) {
    const [, fermante, nom, attrs, auto] = m;
    if (auto === '/') continue; // le `/` final atterrit toujours dans ce groupe
    if (fermante === '/') {
      const attendu = pile.pop();
      if (attendu !== nom) return `</${nom}> ferme « ${attendu ?? '(rien)'} »`;
    } else pile.push(nom);
  }
  return pile.length > 0 ? `balise(s) non fermée(s) : ${pile.join(', ')}` : null;
}

interface TemplateInfo { id: string; ouvreSection: boolean; appelle: string[] }

/** Extrait les gabarits QWeb d'un fichier de vues, avec ce qui nous intéresse :
 *  ouvrent-ils une `<section>`, et qui appellent-ils. */
export function parseTemplates(src: string): TemplateInfo[] {
  const out: TemplateInfo[] = [];
  const re = /<template\b([^>]*)>([\s\S]*?)<\/template>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const id = /\bid="([^"]+)"/.exec(m[1])?.[1] ?? '(sans id)';
    const corps = m[2];
    out.push({
      id,
      ouvreSection: /<section\b/.test(corps),
      appelle: [...corps.matchAll(/t-call="([^"]+)"/g)].map((x) => x[1]),
    });
  }
  return out;
}

/** Une `section` dans une `section`, à travers la chaîne `t-call`. */
export function sectionsImbriquees(templates: readonly TemplateInfo[]): string[] {
  const parId = new Map(templates.map((t) => [t.id, t]));
  const court = (id: string) => id.includes('.') ? id.split('.').pop()! : id;
  const parCourt = new Map(templates.map((t) => [court(t.id), t]));
  const resoudre = (ref: string) => parId.get(ref) ?? parCourt.get(court(ref));
  const trouves: string[] = [];
  const descendre = (t: TemplateInfo, dansSection: boolean, chemin: readonly string[]) => {
    if (t.ouvreSection && dansSection) {
      trouves.push(`${[...chemin, t.id].join(' → ')} ouvre une <section> déjà dans une <section>`);
      return;
    }
    const desormais = dansSection || t.ouvreSection;
    for (const ref of t.appelle) {
      const enfant = resoudre(ref);
      if (!enfant || chemin.includes(enfant.id)) continue;
      descendre(enfant, desormais, [...chemin, t.id]);
    }
  };
  for (const t of templates) descendre(t, false, []);
  return [...new Set(trouves)];
}

// ---------------------------------------------------------------------------
// Contrôles
// ---------------------------------------------------------------------------

function testManifeste(): { [k: string]: PyValue } | null {
  if (!existsSync(MANIFEST)) { ko('le manifeste existe', `${repoRelative(MANIFEST)} absent`); return null; }
  const src = readFileSync(MANIFEST, 'utf8');
  const debut = src.indexOf('{');
  if (debut < 0) { ko('le manifeste contient un dict', 'aucun « { »'); return null; }
  let man: { [k: string]: PyValue };
  try {
    man = parsePythonLiteral(src.slice(debut)) as { [k: string]: PyValue };
  } catch (e) { ko('le manifeste est un littéral lisible', String(e)); return null; }
  ok('le manifeste est un littéral lisible', `${Object.keys(man).length} clé(s)`);

  const version = String(man.version ?? '');
  if (!/^19\.0\.\d+\.\d+\.\d+$/.test(version)) ko('version 19.0.x.y.z', `« ${version} »`);
  else ok('version 19.0.x.y.z', version);

  const depends = (man.depends ?? []) as string[];
  if (!depends.includes('website')) ko('dépend de `website`', `depends = ${JSON.stringify(depends)}`);
  else ok('dépend de `website`', `html_builder arrive par transitivité`);

  if (!man.license) ko('déclare une licence', 'clé `license` absente — Odoo 19 avertit');
  else ok('déclare une licence', String(man.license));

  const data = (man.data ?? []) as string[];
  // Un banc d'essai dans le `data` du produit PUBLIE une page de test sur le
  // site réel. Un commentaire disant le contraire n'y change rien — c'est
  // exactement ce qui a été trouvé en revue le 2026-08-08.
  const bancs = data.filter((rel) => /harness|banc|test/i.test(rel));
  if (bancs.length > 0) {
    ko("l'addon de production ne déclare AUCUNE page de banc", `${bancs.join(', ')} — les déplacer dans piqueray_ds_qa`);
  } else {
    ok("l'addon de production ne déclare aucune page de banc", `banc isolé dans ${repoRelative(ADDON_QA)}`);
  }
  const dataAbsents = data.filter((rel) => !existsSync(path.join(ADDON, rel)));
  if (dataAbsents.length > 0) ko('chaque fichier `data` existe', `absent(s) : ${dataAbsents.join(', ')}`);
  else ok('chaque fichier `data` existe', `${data.length} fichier(s)`);

  const assets = (man.assets ?? {}) as { [k: string]: PyValue };
  const bundles = Object.keys(assets).sort();
  if (JSON.stringify(bundles) !== JSON.stringify([...BUNDLES_ATTENDUS].sort())) {
    ko('les bundles sont exactement les deux attendus', `trouvés : ${bundles.join(', ')}`);
  } else ok('les bundles sont exactement les deux attendus', bundles.join(' + '));

  const tousAssets = bundles.flatMap((b) => (assets[b] ?? []) as string[]);
  const malPrefixes = tousAssets.filter((a) => !a.startsWith('piqueray_ds/'));
  const assetsAbsents = tousAssets.filter((a) => !existsSync(path.join(ADDON, a.replace(/^piqueray_ds\//, ''))));
  if (malPrefixes.length > 0) ko('chaque asset est préfixé `piqueray_ds/`', malPrefixes.join(', '));
  else ok('chaque asset est préfixé `piqueray_ds/`', `${tousAssets.length} entrée(s)`);
  if (assetsAbsents.length > 0) {
    ko('chaque asset de bundle existe sur le disque', `absent(s) : ${assetsAbsents.join(', ')}`);
  } else ok('chaque asset de bundle existe sur le disque', `${tousAssets.length} fichier(s)`);

  return man;
}

function testVues() {
  const components = path.join(ADDON, 'views', 'components.xml');
  const snippets = path.join(ADDON, 'views', 'snippets.xml');
  const harness = path.join(ADDON_QA, 'views', 'harness.xml');

  for (const [label, abs, tache] of [
    ['harness.xml', harness, 'T017'],
    ['components.xml', components, 'T027/T028/T043-T045'],
    ['snippets.xml', snippets, 'T028/T045'],
  ] as const) {
    if (!existsSync(abs)) { saute(`${label} est bien formé`, `absent — il arrive avec ${tache}`); continue; }
    const faute = xmlBalance(readFileSync(abs, 'utf8'));
    if (faute) ko(`${label} est bien formé`, faute);
    else ok(`${label} est bien formé`);
  }

  if (!existsSync(snippets)) {
    saute(`au plus ${ROOT_CONTRACT_IDS.length} racines inscrites, aucun composant interne`, 'snippets.xml absent — T028/T045');
  } else {
    const src = readFileSync(snippets, 'utf8');
    const inscrits = [...src.matchAll(/t-snippet="([^"]+)"/g)].map((m) => m[1]);
    if (inscrits.length > ROOT_CONTRACT_IDS.length) ko(`au plus ${ROOT_CONTRACT_IDS.length} racines inscrites`, `${inscrits.length} : ${inscrits.join(', ')}`);
    else ok(`au plus ${ROOT_CONTRACT_IDS.length} racines inscrites`, `${inscrits.length}`);
    const fautifs = INTERNES.filter((id) => src.includes(id.replace('ds.', '').replace(/-/g, '_')) && /t-snippet/.test(src));
    if (fautifs.length > 0 && inscrits.some((i) => fautifs.some((f) => i.includes(f)))) {
      ko('aucun composant interne posable', `inscrits à tort : ${fautifs.join(', ')}`);
    } else ok('aucun composant interne posable', `${INTERNES.length} composants restent internes`);
  }

  // Racine SHELL : jamais inscrite comme snippet (FR-001 — le header est un
  // gabarit système, pas un bloc droppable). Ne pas l'inscrire suffit ; une
  // inscription accidentelle doit rougir par son nom, comme 018 aurait dû rougir
  // sur son bloc inatteignable.
  const shellSnippetIds = SHELL_CONTRACT_IDS.map((id) => `s_pqr_${id.replace('ds.', '').replace(/-/g, '_')}`);
  if (!existsSync(snippets)) {
    saute('aucune racine shell inscrite comme snippet', 'snippets.xml absent — T028/T045');
  } else {
    const src = readFileSync(snippets, 'utf8');
    const inscritesShell = shellSnippetIds.filter((snip) => new RegExp(`t-snippet="[^"]*\\b${snip}\\b`).test(src));
    if (inscritesShell.length > 0) ko('aucune racine shell inscrite comme snippet', `inscrite(s) à tort : ${inscritesShell.join(', ')}`);
    else ok('aucune racine shell inscrite comme snippet', `${SHELL_CONTRACT_IDS.join(', ')} reste(nt) gabarit système`);
  }

  if (!existsSync(components)) {
    saute('aucune <section> imbriquée dans la chaîne t-call', 'components.xml absent — T028/T045');
    return;
  }
  const templates = [components, snippets, harness]
    .filter((p) => existsSync(p))
    .flatMap((p) => parseTemplates(readFileSync(p, 'utf8')));
  const imbriquees = sectionsImbriquees(templates);
  if (imbriquees.length > 0) ko('aucune <section> imbriquée dans la chaîne t-call', imbriquees.join('\n      '));
  else ok('aucune <section> imbriquée dans la chaîne t-call', `${templates.length} gabarit(s) traversé(s)`);
}

function testImages() {
  const compose = path.join(QA, 'compose.yaml');
  const env = path.join(QA, '.env.example');
  if (!existsSync(compose) || !existsSync(env)) {
    ko("l'instance de QA est décrite", `compose.yaml ou .env.example absent sous ${repoRelative(QA)}`);
    return;
  }
  let lock;
  try { lock = readLock(); } catch (e) {
    saute('les images du compose sont celles du lock', String(e instanceof Error ? e.message : e));
    return;
  }
  const textes = [readFileSync(compose, 'utf8'), readFileSync(env, 'utf8')].join('\n');
  const manquantes = [lock.odoo.image, lock.odoo.postgresImage].filter((img) => !textes.includes(img));
  if (manquantes.length > 0) {
    ko('les images du compose sont celles du lock', `absente(s) du compose/.env : ${manquantes.join(', ')}`);
  } else ok('les images du compose sont celles du lock', `${lock.odoo.image} + ${lock.odoo.postgresImage}`);
  if (lock.odoo.image !== ODOO_PIN.image) {
    ko("le lock et l'épinglage du script concordent", `lock ${lock.odoo.image} ≠ script ${ODOO_PIN.image}`);
  } else ok("le lock et l'épinglage du script concordent");
}

/**
 * La politique de versions a UN calculateur (check-inputs → le lock) et TROIS
 * transcriptions manuelles : `version_guard.js` (le vif), `scan-saved-versions.ts`
 * (l'arbitre) et les attributs `data-ds-contract-version` de `components.xml`.
 * L'eval de dérive compare l'arbitre à ses propres fixtures, jamais au lock —
 * deux copies en retard du même repin restent donc vertes ENSEMBLE (constaté le
 * 2026-08-12 : l'arbitre resté deux repins en arrière classait « structure-stale »
 * des blocs courants). Cette porte ancre chaque transcription au lock, et la
 * version module des deux classificateurs au manifeste.
 */
function testVersions() {
  let lock: ReturnType<typeof readLock>;
  try { lock = readLock(); } catch (e) {
    saute('les transcriptions de versions concordent avec le lock', String(e instanceof Error ? e.message : e));
    return;
  }
  const lockVersions = new Map(lock.contracts.map((entry) => [entry.id, entry.version] as [string, string]));
  const manifestVersion = existsSync(MANIFEST)
    ? readFileSync(MANIFEST, 'utf8').match(/"version":\s*"([^"]+)"/)?.[1]
    : undefined;
  const fautes: string[] = [];
  const compare = (source: string, id: string, version: string) => {
    const attendu = lockVersions.get(id);
    if (!attendu) fautes.push(`${source} : ${id} absent du lock`);
    else if (version !== attendu) fautes.push(`${source} : ${id} ${version} ≠ lock ${attendu}`);
  };
  const compareModule = (source: string, version: string | undefined) => {
    if (!version) fautes.push(`${source} : version module illisible`);
    else if (manifestVersion && version !== manifestVersion) fautes.push(`${source} : module ${version} ≠ manifeste ${manifestVersion}`);
  };

  const guardSrc = readFileSync(path.join(ADDON, 'static', 'src', 'js', 'version_guard.js'), 'utf8');
  const guardDigest = guardSrc.match(/CURRENT_GRAPH_DIGEST = "([0-9a-f]{64})"/)?.[1];
  if (guardDigest !== lock.graphDigest) fautes.push(`version_guard.js : digest ${guardDigest ?? '(illisible)'} ≠ lock ${lock.graphDigest}`);
  compareModule('version_guard.js', guardSrc.match(/CURRENT_MODULE_VERSION = "([^"]+)"/)?.[1]);
  const guardMap = guardSrc.match(/const CONTRACT_VERSIONS = (\{[^}]*\})/)?.[1];
  if (!guardMap) fautes.push('version_guard.js : CONTRACT_VERSIONS illisible');
  else for (const [, id, version] of guardMap.matchAll(/"(ds\.[a-z0-9-]+)":\s*"([^"]+)"/g)) compare('version_guard.js', id, version);

  const scanSrc = readFileSync(repoPath('scripts', 'odoo', 'scan-saved-versions.ts'), 'utf8');
  const scanDigest = scanSrc.match(/EXPECTED_GRAPH = '([0-9a-f]{64})'/)?.[1];
  if (scanDigest !== lock.graphDigest) fautes.push(`scan-saved-versions.ts : digest ${scanDigest ?? '(illisible)'} ≠ lock ${lock.graphDigest}`);
  compareModule('scan-saved-versions.ts', scanSrc.match(/const MODULE = '([^']+)'/)?.[1]);
  const scanMap = scanSrc.match(/const CONTRACTS: Record<string, string> = (\{[^}]*\})/)?.[1];
  if (!scanMap) fautes.push('scan-saved-versions.ts : CONTRACTS illisible');
  else for (const [, id, version] of scanMap.matchAll(/'(ds\.[a-z0-9-]+)':\s*'([^']+)'/g)) compare('scan-saved-versions.ts', id, version);

  const componentsPath = path.join(ADDON, 'views', 'components.xml');
  if (!existsSync(componentsPath)) {
    saute('les versions de components.xml concordent avec le lock', 'components.xml absent — T028/T045');
  } else {
    const xml = readFileSync(componentsPath, 'utf8');
    const paires = [...xml.matchAll(/data-ds-contract="(ds\.[a-z0-9-]+)"\s+data-ds-contract-version="([^"]+)"/g)];
    const declarations = (xml.match(/data-ds-contract="/g) ?? []).length;
    if (paires.length !== declarations) {
      fautes.push(`components.xml : ${declarations} déclarations mais ${paires.length} paires contract/version appariées (attributs réordonnés ?)`);
    }
    for (const [, id, version] of paires) compare('components.xml', id, version);
  }

  if (fautes.length > 0) ko('les transcriptions de versions concordent avec le lock', fautes.join('\n      '));
  else ok('les transcriptions de versions concordent avec le lock', `${lockVersions.size} contrats du lock, 3 transcriptions + version module ancrées`);
}

function main() {
  const strict = process.argv.includes('--strict');
  console.log('Porte de structure du module Odoo — sans instance, sans Docker.\n');
  testManifeste();
  testVues();
  testImages();
  testVersions();
  const code = tally.resume(strict);
  if (code !== 0) process.exit(code);
}

runAsCli(import.meta.url, main);
