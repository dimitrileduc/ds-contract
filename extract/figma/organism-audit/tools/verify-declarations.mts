/**
 * Vérificateur des déclarations produites par les agents, AVANT fusion.
 *
 * Un agent peut halluciner un node, un pointeur ou un sélecteur ; une
 * déclaration fausse produirait un dossier d'apparence complète mais sans
 * preuve. Chaque affirmation est donc recoupée avec le dépôt et le census.
 * Rien n'est fusionné tant que tout n'est pas vert.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const REPO = '/Users/dlstudio/.superset/projects/ds-contract';
const DECL_DIR = path.join(REPO, 'specs/013-auditer-fidelite-organismes/proofs/declarations');
const CACHE = path.join(REPO, 'extract/figma/visual-parity/out/_cache');
const FILE_KEY = 'd9FYAUcqdcNtsuaMgLefvJ';
const PINNED_VERSION = '2381581871281042338';

const campaign = JSON.parse(
  readFileSync(path.join(REPO, 'specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json'), 'utf8'),
) as any;

/** RFC 6901. */
function resolvePointer(root: unknown, pointer: string): { ok: boolean; value?: unknown } {
  if (pointer === '') return { ok: true, value: root };
  if (!pointer.startsWith('/')) return { ok: false };
  let cursor: any = root;
  for (const rawToken of pointer.slice(1).split('/')) {
    const token = rawToken.replace(/~1/g, '/').replace(/~0/g, '~');
    if (Array.isArray(cursor)) {
      const i = Number(token);
      if (!Number.isInteger(i) || i < 0 || i >= cursor.length) return { ok: false };
      cursor = cursor[i];
      continue;
    }
    if (cursor !== null && typeof cursor === 'object' && token in cursor) {
      cursor = cursor[token];
      continue;
    }
    return { ok: false };
  }
  return { ok: true, value: cursor };
}

/** Toutes les classes CSS-modules déclarées dans le dépôt, par composant. */
function allModuleClasses(): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  const root = path.join(REPO, 'src/components');
  for (const dir of readdirSync(root, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const cssPath = path.join(root, dir.name, `${dir.name}.module.css`);
    if (!existsSync(cssPath)) continue;
    const css = readFileSync(cssPath, 'utf8');
    const classes = new Set<string>();
    for (const m of css.matchAll(/\.([A-Za-z_][\w-]*)/g)) classes.add(m[1]);
    out.set(dir.name, classes);
  }
  return out;
}

function censusNodeIds(setId: string): Set<string> {
  const p = path.join(CACHE, `nodes-${FILE_KEY}-${setId.replace(/:/g, '_')}.json`);
  if (!existsSync(p)) return new Set();
  const raw = JSON.parse(readFileSync(p, 'utf8')) as { version: string; document: any };
  const ids = new Set<string>();
  const walk = (n: any): void => {
    if (n?.id) ids.add(n.id);
    for (const c of n?.children ?? []) walk(c);
  };
  walk(raw.document);
  return ids;
}

function censusVersion(setId: string): string | null {
  const p = path.join(CACHE, `nodes-${FILE_KEY}-${setId.replace(/:/g, '_')}.json`);
  if (!existsSync(p)) return null;
  return (JSON.parse(readFileSync(p, 'utf8')) as { version: string }).version;
}

const MODULE_CLASSES = allModuleClasses();
const KINDS = new Set(['content', 'structure', 'property', 'composition', 'visual', 'semantic']);
const REPRESENTABILITY = new Set(['carry-both', 'carry-with-named-limit', 'carry-code-only']);

let totalProblems = 0;

for (const file of readdirSync(DECL_DIR).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort()) {
  const subjectId = path.basename(file, '.json');
  const problems: string[] = [];
  const notes: string[] = [];

  const subject = campaign.subjects.find((s: any) => s.id === subjectId);
  if (!subject) {
    console.log(`\n✗ ${subjectId} — sujet absent du manifeste`);
    totalProblems += 1;
    continue;
  }

  let decl: any;
  try {
    decl = JSON.parse(readFileSync(path.join(DECL_DIR, file), 'utf8'));
  } catch (error) {
    console.log(`\n✗ ${subjectId} — JSON invalide : ${(error as Error).message}`);
    totalProblems += 1;
    continue;
  }

  const contract = JSON.parse(readFileSync(path.join(REPO, subject.contractPath), 'utf8'));
  const nodeIds = censusNodeIds(subject.figmaSetNodeId);
  const version = censusVersion(subject.figmaSetNodeId);

  if (version === null) problems.push('census absent du cache — le node n\'a jamais été lu');
  else if (version !== PINNED_VERSION) problems.push(`census à la version ${version}, manifeste piné sur ${PINNED_VERSION}`);

  if (!Array.isArray(decl.facts) || decl.facts.length === 0) problems.push('facts vide ou absent');
  if (!decl.case || typeof decl.case !== 'object') problems.push('case absent');

  const seenFactIds = new Set<string>();
  const contractPropNames = new Set((contract.props ?? []).map((p: any) => p.name));

  for (const fact of decl.facts ?? []) {
    const at = fact.id ?? '(sans id)';
    if (typeof fact.id !== 'string' || !fact.id.startsWith(`${subjectId}.`)) {
      problems.push(`${at}: id doit être préfixé par "${subjectId}."`);
    }
    if (seenFactIds.has(fact.id)) problems.push(`${at}: id dupliqué`);
    seenFactIds.add(fact.id);

    if (!KINDS.has(fact.kind)) problems.push(`${at}: kind "${fact.kind}" inconnu`);
    if (!REPRESENTABILITY.has(fact.representability)) {
      problems.push(`${at}: representability "${fact.representability}" inconnue`);
    }

    // Le pointeur contractuel doit résoudre… SAUF quand le fait porte une
    // figmaExpectation : là, un pointeur qui ne résout pas EST le constat.
    const pointer = fact.contractReference?.jsonPointer;
    if (typeof pointer !== 'string') {
      problems.push(`${at}: contractReference.jsonPointer manquant`);
    } else {
      const resolved = resolvePointer(contract, pointer);
      if (!resolved.ok) {
        if (fact.figmaExpectation === undefined) {
          problems.push(`${at}: pointeur "${pointer}" ne résout pas (et pas de figmaExpectation pour le justifier)`);
        } else {
          notes.push(`${at}: pointeur "${pointer}" ne résout pas → divergence attendue, source contract`);
        }
      }
    }

    // Les nodes cités doivent exister dans le census.
    for (const key of ['nodeId', 'textLayer', 'mainComponent']) {
      const value = fact.figmaReference?.[key];
      if (typeof value === 'string' && nodeIds.size > 0 && !nodeIds.has(value)) {
        // mainComponent pointe hors du set (c'est le master de l'enfant) — toléré.
        if (key === 'mainComponent') continue;
        problems.push(`${at}: node "${value}" (${key}) absent du census de ${subject.figmaSetNodeId}`);
      }
    }

    // Le sélecteur doit viser une classe qui existe vraiment.
    const selector = fact.generatedReference?.selector;
    if (typeof selector === 'string') {
      const m = /\[class\*="([A-Za-z0-9_]+)__([\w-]+)"\]/.exec(selector);
      if (!m) problems.push(`${at}: sélecteur "${selector}" hors du motif [class*="Composant__part"]`);
      else {
        const [, component, local] = m;
        const classes = MODULE_CLASSES.get(component);
        if (!classes) problems.push(`${at}: composant "${component}" du sélecteur inconnu sous src/components`);
        else if (!classes.has(local)) {
          // Une classe absente du CSS mais référencée par le TSX n'est pas une
          // hallucination : c'est un CONSTAT.  `styles.foo` vaut alors
          // `undefined`, le noeud est rendu sans aucune classe ni style — la
          // « div vide » que D10 nomme.  Le sélecteur ne matchera rien et le
          // pilote conclura lui-même ; bloquer ici masquerait le défaut.
          const tsx = path.join(REPO, 'src/components', component, `${component}.tsx`);
          const referenced =
            existsSync(tsx) && new RegExp(`styles\\.${local}\\b`).test(readFileSync(tsx, 'utf8'));
          if (referenced) {
            notes.push(
              `${at}: classe "${local}" référencée par ${component}.tsx mais ABSENTE de ${component}.module.css → noeud rendu sans classe ni style (constat)`,
            );
          } else {
            problems.push(`${at}: classe "${local}" absente de ${component}.module.css ET de ${component}.tsx`);
          }
        }
      }
    }

    if (fact.projectionProbe !== undefined) {
      const prop = fact.projectionProbe.prop;
      if (!contractPropNames.has(prop)) {
        problems.push(`${at}: probe sur la prop "${prop}" qui n'existe pas dans le contrat`);
      }
      if (fact.projectionProbe.value === undefined) problems.push(`${at}: probe sans value`);
    }

    if (fact.figmaExpectation !== undefined) {
      if (typeof fact.figmaExpectation.channel !== 'string' || fact.figmaExpectation.value === undefined) {
        problems.push(`${at}: figmaExpectation incomplète (channel + value requis)`);
      }
    }
  }

  // Le cas
  const c = decl.case ?? {};
  if (typeof c.figmaNodeId === 'string' && nodeIds.size > 0 && !nodeIds.has(c.figmaNodeId)) {
    problems.push(`case: node "${c.figmaNodeId}" absent du census`);
  }
  if (!Array.isArray(c.requiredParts) || !c.requiredParts.includes('root')) {
    problems.push('case: requiredParts doit contenir "root"');
  }
  if (!Array.isArray(c.requiredRegions) || c.requiredRegions.length === 0) {
    problems.push('case: requiredRegions vide');
  } else {
    for (const r of c.requiredRegions) {
      if (!(r.maxDiffPct >= 0 && r.maxDiffPct <= 2.5)) problems.push(`case: région ${r.id} hors [0, 2.5]`);
      if (!(r.minSignalPixels > 0)) problems.push(`case: région ${r.id} minSignalPixels doit être > 0`);
    }
  }
  const declaredIds = [...seenFactIds].sort().join('|');
  const caseIds = [...new Set(c.factIds ?? [])].sort().join('|');
  if (declaredIds !== caseIds) {
    problems.push(`case.factIds ≠ ids des facts\n     facts: ${declaredIds}\n     case : ${caseIds}`);
  }
  for (const a of c.semanticAssertions ?? []) {
    const resolved = resolvePointer(contract, a.contractPointer ?? '');
    if (!resolved.ok) problems.push(`case: assertion ${a.id} — pointeur "${a.contractPointer}" ne résout pas`);
  }

  const probes = (decl.facts ?? []).filter((f: any) => f.projectionProbe).length;
  const expectations = (decl.facts ?? []).filter((f: any) => f.figmaExpectation).length;
  const header = problems.length === 0 ? `✓ ${subjectId}` : `✗ ${subjectId}`;
  console.log(
    `\n${header} — ${(decl.facts ?? []).length} faits (${probes} probes, ${expectations} attentes Figma), props du contrat : ${[...contractPropNames].join(', ') || 'aucune'}`,
  );
  for (const note of notes) console.log(`   · ${note}`);
  for (const problem of problems) console.log(`   ✗ ${problem}`);
  totalProblems += problems.length;
}

console.log(`\n${'='.repeat(60)}`);
console.log(totalProblems === 0 ? 'TOUTES LES DÉCLARATIONS SONT VALIDES' : `${totalProblems} PROBLÈME(S) — fusion refusée`);
process.exit(totalProblems === 0 ? 0 : 1);
